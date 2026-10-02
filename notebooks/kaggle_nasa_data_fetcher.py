# %% [markdown]
# # NASA Space Apps Challenge 2026: Planetary Data Fetcher
# This complete notebook securely downloads and processes raw NASA and Partner datasets:
# - **Landsat, SRTM, HiRISE, MOLA, LROC, LOLA**
# - **MODIS** (via Microsoft Planetary Computer, a NASA Space Apps global collaborator, since NASA NEO was decommissioned in Sept 2026).
# 
# **Instructions:** Run the cells in order in Kaggle with Settings > Internet turned on.

# %% [markdown]
# ## Cell 1: Setup

# %%
import subprocess, sys

def pip_install(pkg):
    subprocess.run([sys.executable, "-m", "pip", "install", "-q", pkg], check=False)

try:
    import rasterio
except ImportError:
    pip_install("rasterio")
    import rasterio

try:
    import planetary_computer as pc
    from pystac_client import Client
except ImportError:
    pip_install("planetary-computer")
    pip_install("pystac-client")
    import planetary_computer as pc
    from pystac_client import Client

import os, re, gzip, json, time, hashlib, zipfile, shutil
from datetime import date
from pathlib import Path

import numpy as np
import requests
from PIL import Image
import matplotlib.pyplot as plt
from rasterio.transform import from_origin

Image.MAX_IMAGE_PIXELS = None

ROOT = Path("/kaggle/working") if Path("/kaggle/working").exists() else Path(".")
BASE = ROOT / "planetary_data"
DIRS = {name: BASE / name for name in ["earth", "mars", "moon", "figures"]}
for d in DIRS.values():
    d.mkdir(parents=True, exist_ok=True)

HEADERS = {"User-Agent": "Mozilla/5.0 (Kaggle notebook; NASA Space Apps planetary data project)"}

PATHS = {
    "landsat":  DIRS["earth"] / "earth_landsat_atacama.jpg",
    "srtm":     DIRS["earth"] / "earth_srtm_atacama_S24W069.tif",
    "modis":    DIRS["earth"] / "earth_modis_land_surface_temperature.tif",
    "modis_raw": DIRS["earth"] / "earth_modis_LST_Day_1km_raw.tif",
    "hirise":   DIRS["mars"] / "mars_hirise_jezero.jpg",
    "mola_img": DIRS["mars"] / "MEGT90N000EB.IMG",
    "mola_lbl": DIRS["mars"] / "MEGT90N000EB.LBL",
    "mola_npy": DIRS["mars"] / "mars_mola_topography_m.npy",
    "lroc":     DIRS["moon"] / "moon_lroc.jpg",
    "lola_img": DIRS["moon"] / "LDEM_16.IMG",
    "lola_lbl": DIRS["moon"] / "LDEM_16.LBL",
    "lola_npy": DIRS["moon"] / "moon_lola_elevation_m.npy",
}

SOURCES = {}
STATUS = {}


def download(urls, dest, min_bytes=1000, expected_size=None, timeout=180, retries=3):
    """Download with mirrors, retries, size check, and HTML error-page rejection."""
    dest = Path(dest)
    if isinstance(urls, str):
        urls = [urls]
    if dest.exists() and dest.stat().st_size >= min_bytes and (
        expected_size is None or dest.stat().st_size == expected_size
    ):
        print(f"  cached: {dest.name}")
        return urls[0]
    for url in urls:
        for attempt in range(1, retries + 1):
            tmp = Path(str(dest) + ".part")
            try:
                with requests.get(url, headers=HEADERS, stream=True, timeout=timeout) as r:
                    r.raise_for_status()
                    with open(tmp, "wb") as f:
                        for chunk in r.iter_content(chunk_size=1 << 20):
                            if chunk:
                                f.write(chunk)
                size = tmp.stat().st_size
                head = tmp.read_bytes()[:512].lower()
                if b"<!doctype html" in head or b"<html" in head:
                    raise IOError("server returned an HTML page instead of data")
                if size < min_bytes:
                    raise IOError(f"file too small ({size} bytes)")
                if expected_size is not None and size != expected_size:
                    raise IOError(f"size {size} != expected {expected_size}")
                tmp.replace(dest)
                print(f"  ok: {dest.name} ({size / 1e6:.2f} MB) from {url}")
                return url
            except Exception as e:
                print(f"  attempt {attempt}/{retries} failed for {url}: {str(e)[:150]}")
                if tmp.exists():
                    tmp.unlink()
                time.sleep(2 * attempt)
    return None


def read_pds_img(img_path, lbl_path, dtype, shape, scale=1.0):
    """Try GDAL/Rasterio on the PDS label first, then parse the raw binary with known layout."""
    info = {"gdal_ok": False}
    for cand in (lbl_path, img_path):
        try:
            with rasterio.open(cand) as ds:
                info.update(
                    gdal_ok=True,
                    gdal_driver=ds.driver,
                    gdal_shape=(ds.height, ds.width),
                    gdal_dtype=ds.dtypes[0],
                    opened=str(Path(cand).name),
                )
            break
        except Exception as e:
            info["gdal_error"] = str(e)[:150]
    raw = np.fromfile(img_path, dtype=dtype)
    if raw.size != shape[0] * shape[1]:
        raise ValueError(f"{Path(img_path).name}: {raw.size} values, expected {shape[0] * shape[1]}")
    arr = raw.reshape(shape).astype("float32") * scale
    info["gdal_shape_matches"] = (info.get("gdal_shape") == shape) if info["gdal_ok"] else None
    return arr, info


print("Setup complete. Output folder:", BASE)

# %% [markdown]
# ## Cell 2: Earth Landsat, Mars HiRISE, Moon LROC (JPG)

# %%
API_SEARCH = "https://images-api.nasa.gov/search"
API_ASSET = "https://images-api.nasa.gov/asset/{}"


def nasa_image(queries, require_any, prefer, dest, min_dim=800, max_orig_mb=40):
    """Search the NASA Image and Video Library, download the best matching JPG, verify with PIL."""
    seen = set()
    for q in queries:
        try:
            r = requests.get(
                API_SEARCH,
                params={"q": q, "media_type": "image", "page_size": 50},
                headers=HEADERS,
                timeout=60,
            )
            r.raise_for_status()
            items = r.json()["collection"]["items"]
        except Exception as e:
            print(f"  search failed for '{q}': {str(e)[:120]}")
            continue

        scored = []
        for it in items:
            d = it["data"][0]
            text = " ".join(
                [d.get("title", ""), d.get("description", ""), " ".join(d.get("keywords", []) or [])]
            ).lower()
            if not any(k in text for k in require_any):
                continue
            scored.append((sum(k in text for k in prefer), d["nasa_id"], d.get("title", "")))
        scored.sort(key=lambda x: -x[0])

        for _, nid, title in scored[:12]:
            if nid in seen:
                continue
            seen.add(nid)
            try:
                assets = requests.get(API_ASSET.format(nid), headers=HEADERS, timeout=60).json()
                hrefs = [a["href"] for a in assets["collection"]["items"]]
            except Exception:
                continue
            jpgs = [h.replace("http://", "https://") for h in hrefs if h.lower().endswith((".jpg", ".jpeg"))]
            ordered = (
                [h for h in jpgs if "~orig" in h]
                + [h for h in jpgs if "~large" in h]
                + [h for h in jpgs if "~medium" in h]
            )
            for url in ordered:
                url = requests.utils.requote_uri(url)
                if "~orig" in url:
                    try:
                        head = requests.head(url, allow_redirects=True, headers=HEADERS, timeout=30)
                        if int(head.headers.get("Content-Length", 0)) > max_orig_mb * 1e6:
                            continue
                    except Exception:
                        pass
                used = download(url, dest)
                if not used:
                    continue
                try:
                    with Image.open(dest) as im:
                        im.verify()
                    with Image.open(dest) as im:
                        w, h = im.size
                    if min(w, h) < min_dim:
                        print(f"  rejected (too small {w}x{h}): {title[:70]}")
                        Path(dest).unlink()
                        continue
                    print(f"  selected: {title[:90]} ({w}x{h})")
                    return used
                except Exception as e:
                    print(f"  PIL verification failed: {str(e)[:100]}")
                    if Path(dest).exists():
                        Path(dest).unlink()
    return None


print("Earth Landsat (Atacama Desert)")
SOURCES["landsat"] = nasa_image(
    ["Atacama Desert Landsat", "Atacama Landsat", "Atacama Desert Chile satellite"],
    require_any=["atacama"],
    prefer=["landsat", "true color", "natural color"],
    dest=PATHS["landsat"],
)
STATUS["landsat"] = "downloaded" if SOURCES["landsat"] else "failed"

print("Mars HiRISE (Jezero Crater)")
SOURCES["hirise"] = nasa_image(
    ["Jezero Crater HiRISE", "Jezero crater delta HiRISE", "Jezero Crater Mars Reconnaissance Orbiter"],
    require_any=["jezero"],
    prefer=["hirise", "high resolution imaging science experiment"],
    dest=PATHS["hirise"],
)
STATUS["hirise"] = "downloaded" if SOURCES["hirise"] else "failed"

print("Moon LROC")
SOURCES["lroc"] = nasa_image(
    ["LROC lunar surface", "Lunar Reconnaissance Orbiter Camera", "LROC NAC"],
    require_any=["lroc", "lunar reconnaissance orbiter camera"],
    prefer=["nac", "lroc", "narrow angle"],
    dest=PATHS["lroc"],
)
STATUS["lroc"] = "downloaded" if SOURCES["lroc"] else "failed"

print({k: STATUS[k] for k in ["landsat", "hirise", "lroc"]})

# %% [markdown]
# ## Cell 3: Earth SRTM (GeoTIFF over the Atacama Desert)

# %%
print("Earth SRTM (tile S24W069, Atacama Desert)")
TILE = "S24W069"
gz_path = DIRS["earth"] / f"{TILE}.hgt.gz"
urls = [
    f"https://s3.amazonaws.com/elevation-tiles-prod/skadi/S24/{TILE}.hgt.gz",
    f"https://elevation-tiles-prod.s3.amazonaws.com/skadi/S24/{TILE}.hgt.gz",
    f"https://elevation-tiles-prod-eu.s3.eu-central-1.amazonaws.com/skadi/S24/{TILE}.hgt.gz",
]
used = download(urls, gz_path, min_bytes=1_000_000)

if used:
    raw = gzip.decompress(gz_path.read_bytes())
    assert len(raw) == 2 * 3601 * 3601, f"unexpected HGT size: {len(raw)}"
    elev = np.frombuffer(raw, dtype=">i2").reshape(3601, 3601).astype("int16")

    px = 1.0 / 3600.0
    transform = from_origin(-69.0 - px / 2, -23.0 + px / 2, px, px)
    with rasterio.open(
        PATHS["srtm"], "w",
        driver="GTiff", height=3601, width=3601, count=1, dtype="int16",
        crs="EPSG:4326", transform=transform, nodata=-32768, compress="deflate",
    ) as dst:
        dst.write(elev, 1)
        dst.update_tags(SOURCE="SRTM 1 arc-second via AWS Terrain Tiles (Skadi)", TILE=TILE)

    valid = elev[elev != -32768]
    print(f"  GeoTIFF written: {PATHS['srtm'].name}")
    print(f"  elevation min={valid.min()} m, max={valid.max()} m, voids={(elev == -32768).sum()}")
    SOURCES["srtm"] = used
    STATUS["srtm"] = "downloaded"
else:
    STATUS["srtm"] = "failed"
    print("  SRTM download failed on all mirrors")

# %% [markdown]
# ## Cell 4: Earth MODIS land surface temperature (GeoTIFF)

# %%
print("Earth MODIS land surface temperature (Microsoft Planetary Computer, Terra MODIS)")
print("Note: NASA's own NEO distribution service was decommissioned in September 2026.")
print("Microsoft Planetary Computer is a NASA Space Apps Challenge global collaborator")
print("and mirrors the original NASA LP DAAC MODIS products with no login required.")

STAC_URL = "https://planetarycomputer.microsoft.com/api/stac/v1"
BBOX = [-69.5, -24.5, -67.5, -22.5]  # Atacama Desert, same area as the SRTM tile
TMP_PATH = DIRS["earth"] / "_modis_candidate.tif"
COLLECTIONS = ["modis-11A1-061", "modis-11A2-061"]  # daily 1 km, then 8-day 1 km fallback


def search_items(collection):
    try:
        catalog = Client.open(STAC_URL, modifier=pc.sign_inplace)
        col = catalog.get_collection(collection)
        print(f"  collection ok: {col.id}")
    except Exception as e:
        print(f"  cannot open collection {collection}: {str(e)[:150]}")
        return []
    variants = [
        dict(sortby=[{"field": "datetime", "direction": "desc"}]),
        dict(datetime="2025-01-01/2026-12-31"),
        dict(datetime="2020-01-01/2024-12-31"),
    ]
    for extra in variants:
        try:
            search = catalog.search(collections=[collection], bbox=BBOX, max_items=40, **extra)
            items = list(search.items())
            if items:
                items.sort(key=lambda i: i.datetime, reverse=True)
                print(f"  {len(items)} scenes found")
                return items
        except Exception as e:
            print(f"  search variant failed: {str(e)[:150]}")
    print("  no scenes found")
    return []


best = None
for coll in COLLECTIONS:
    print(f"Searching {coll}")
    items = search_items(coll)
    items = sorted(items, key=lambda i: not i.id.startswith("MOD"))
    for it in items[:15]:
        if "LST_Day_1km" not in it.assets:
            continue
        if TMP_PATH.exists():
            TMP_PATH.unlink()
        href = it.assets["LST_Day_1km"].href
        if not download(href, TMP_PATH, min_bytes=50_000, retries=2):
            continue
        try:
            with rasterio.open(TMP_PATH) as ds:
                dn = ds.read(1)
        except Exception as e:
            print(f"  {it.id}: cannot read file: {str(e)[:100]}")
            continue
        frac = float((dn > 0).mean())
        print(f"  {it.id} ({it.datetime.date()}): valid pixels {frac:.0%}")
        if best is None or frac > best[0]:
            shutil.copy(TMP_PATH, PATHS["modis_raw"])
            best = (frac, it, coll)
        if frac >= 0.8:
            break
    if best is not None and best[0] >= 0.3:
        break

if TMP_PATH.exists():
    TMP_PATH.unlink()

if best is None:
    STATUS["modis"] = "failed"
    print("MODIS FAILED: no scene could be downloaded and read.")
else:
    frac, item, coll = best
    with rasterio.open(PATHS["modis_raw"]) as src:
        dn = src.read(1).astype("float32")
        scale = src.scales[0] if src.scales and src.scales[0] not in (None, 1.0) else 0.02
        meta = dict(height=src.height, width=src.width, crs=src.crs, transform=src.transform)
    celsius = np.where(dn > 0, dn * scale - 273.15, np.nan).astype("float32")
    with rasterio.open(
        PATHS["modis"], "w", driver="GTiff", count=1, dtype="float32",
        nodata=np.nan, compress="deflate", **meta
    ) as dst:
        dst.write(celsius, 1)
        dst.update_tags(
            SOURCE=f"NASA MODIS Terra {coll} via Microsoft Planetary Computer",
            ITEM=item.id, DATE=str(item.datetime.date()), UNITS="degrees Celsius",
        )
    print(f"Selected: {item.id} ({item.datetime.date()}), size={meta['width']}x{meta['height']}, crs={meta['crs']}")
    print(f"Temperature min={np.nanmin(celsius):.1f} C, max={np.nanmax(celsius):.1f} C, "
          f"valid pixels={np.isfinite(celsius).mean():.1%}")
    SOURCES["modis"] = f"{STAC_URL} | {coll} | {item.id}"
    STATUS["modis"] = "downloaded"

# %% [markdown]
# ## Cell 5: Mars MOLA (PDS IMG)

# %%
print("Mars MOLA MEGDR topography (16 pixels per degree)")
MOLA_URLS = {
    "img": [
        "https://pds-geosciences.wustl.edu/mgs/urn-nasa-pds-mgs_mola_topography_derived/meg016/megt90n000eb.img",
        "https://pds-geosciences.wustl.edu/mgs/mgs-m-mola-5-megdr-l3-v1/mgsl_300x/meg016/megt90n000eb.img",
    ],
    "lbl": [
        "https://pds-geosciences.wustl.edu/mgs/urn-nasa-pds-mgs_mola_topography_derived/meg016/megt90n000eb.lbl",
        "https://pds-geosciences.wustl.edu/mgs/mgs-m-mola-5-megdr-l3-v1/mgsl_300x/meg016/megt90n000eb.lbl",
    ],
}
MOLA_SHAPE = (2880, 5760)
MOLA_BYTES = MOLA_SHAPE[0] * MOLA_SHAPE[1] * 2

u_img = download(MOLA_URLS["img"], PATHS["mola_img"], min_bytes=1_000_000, expected_size=MOLA_BYTES)
u_lbl = download(MOLA_URLS["lbl"], PATHS["mola_lbl"], min_bytes=500)

if u_img:
    topo, info = read_pds_img(PATHS["mola_img"], PATHS["mola_lbl"], ">i2", MOLA_SHAPE, scale=1.0)
    np.save(PATHS["mola_npy"], topo)
    print("  parser info:", info)
    print(f"  topography min={topo.min():.0f} m, max={topo.max():.0f} m")
    SOURCES["mola"] = u_img
    STATUS["mola"] = "downloaded"
else:
    STATUS["mola"] = "failed"
    print("  MOLA download failed")

# %% [markdown]
# ## Cell 6: Moon LOLA (PDS IMG)

# %%
print("Moon LOLA LDEM_16 topography (16 pixels per degree)")
LOLA_URLS = {
    "img": [
        "https://imbrium.mit.edu/DATA/LOLA_GDR/CYLINDRICAL/IMG/LDEM_16.IMG",
        "https://pds-geosciences.wustl.edu/lro/lro-l-lola-3-rdr-v1/lrolol_1xxx/data/lola_gdr/cylindrical/img/ldem_16.img",
    ],
    "lbl": [
        "https://imbrium.mit.edu/DATA/LOLA_GDR/CYLINDRICAL/IMG/LDEM_16.LBL",
        "https://pds-geosciences.wustl.edu/lro/lro-l-lola-3-rdr-v1/lrolol_1xxx/data/lola_gdr/cylindrical/img/ldem_16.lbl",
    ],
}
LOLA_SHAPE = (2880, 5760)
LOLA_BYTES = LOLA_SHAPE[0] * LOLA_SHAPE[1] * 2

u_img = download(LOLA_URLS["img"], PATHS["lola_img"], min_bytes=1_000_000, expected_size=LOLA_BYTES)
u_lbl = download(LOLA_URLS["lbl"], PATHS["lola_lbl"], min_bytes=500)

if u_img:
    elev_m, info = read_pds_img(PATHS["lola_img"], PATHS["lola_lbl"], "<i2", LOLA_SHAPE, scale=0.5)
    np.save(PATHS["lola_npy"], elev_m)
    print("  parser info:", info)
    print(f"  elevation min={elev_m.min():.0f} m, max={elev_m.max():.0f} m")
    SOURCES["lola"] = u_img
    STATUS["lola"] = "downloaded"
else:
    STATUS["lola"] = "failed"
    print("  LOLA download failed")

# %% [markdown]
# ## Cell 7: Verify every dataset

# %%
report = []


def check_jpg(key, label):
    p = PATHS[key]
    if not p.exists():
        report.append((label, "MISSING", "file not found"))
        return
    try:
        with Image.open(p) as im:
            im.verify()
        with Image.open(p) as im:
            w, h = im.size
            mode = im.mode
            arr = np.asarray(im.convert("RGB"))
        ok = arr.std() > 5
        report.append((label, "OK" if ok else "SUSPECT",
                       f"{w}x{h}, mode={mode}, {p.stat().st_size / 1e6:.2f} MB, pixel std={arr.std():.1f}"))
    except Exception as e:
        report.append((label, "CORRUPT", str(e)[:100]))


def check_tif(key, label, lo, hi, mask_ge=None, nodata=None):
    p = PATHS[key]
    if not p.exists():
        report.append((label, "MISSING", "file not found"))
        return
    try:
        with rasterio.open(p) as ds:
            a = ds.read(1).astype("float32")
            crs, bounds = ds.crs, ds.bounds
        if nodata is not None:
            a[a == nodata] = np.nan
        if mask_ge is not None:
            a[a >= mask_ge] = np.nan
        vmin, vmax = np.nanmin(a), np.nanmax(a)
        plausible = (vmin >= lo[0]) and (vmax <= hi[1]) and (vmax >= hi[0]) and (vmin <= lo[1])
        report.append((label, "OK" if plausible else "SUSPECT",
                       f"{a.shape[1]}x{a.shape[0]}, crs={crs}, range={vmin:.1f}..{vmax:.1f}, valid={np.isfinite(a).mean():.1%}"))
    except Exception as e:
        report.append((label, "CORRUPT", str(e)[:100]))


def check_npy(key, label, lo, hi):
    p = PATHS[key]
    if not p.exists():
        report.append((label, "MISSING", "file not found"))
        return
    a = np.load(p)
    vmin, vmax = float(a.min()), float(a.max())
    plausible = (vmin <= lo) and (vmax >= hi)
    report.append((label, "OK" if plausible else "SUSPECT",
                   f"shape={a.shape}, range={vmin:.0f}..{vmax:.0f} m"))


check_jpg("landsat", "Earth Landsat JPG")
check_tif("srtm", "Earth SRTM TIFF", lo=(0, 4000), hi=(3000, 7000), nodata=-32768)
check_tif("modis", "Earth MODIS TIFF", lo=(-60, 50), hi=(0, 90))
check_jpg("hirise", "Mars HiRISE JPG")
check_npy("mola_npy", "Mars MOLA IMG", lo=-6000, hi=15000)
check_jpg("lroc", "Moon LROC JPG")
check_npy("lola_npy", "Moon LOLA IMG", lo=-8000, hi=8000)

print(f"{'Dataset':22s} {'Status':9s} Details")
print("-" * 110)
for label, status, detail in report:
    print(f"{label:22s} {status:9s} {detail}")

bad = [r for r in report if r[1] != "OK"]
print("\nAll datasets verified." if not bad else f"\nNeeds attention: {[r[0] for r in bad]}")

# %% [markdown]
# ## Cell 8: Visualize all datasets

# %%
def load_rgb(key):
    return np.asarray(Image.open(PATHS[key]).convert("RGB"))


def load_tif(key, nodata=None, mask_ge=None):
    with rasterio.open(PATHS[key]) as ds:
        a = ds.read(1).astype("float32")
    if nodata is not None:
        a[a == nodata] = np.nan
    if mask_ge is not None:
        a[a >= mask_ge] = np.nan
    return a


MODIS_EXTENT = (0, 1, 0, 1)
if PATHS["modis"].exists():
    with rasterio.open(PATHS["modis"]) as _ds:
        _b = _ds.bounds
    MODIS_EXTENT = (_b.left / 1000, _b.right / 1000, _b.bottom / 1000, _b.top / 1000)

PANELS = [
    dict(name="01_earth_landsat_atacama", title="Earth Landsat - Atacama Desert (true color)",
         kind="rgb", key="landsat"),
    dict(name="02_earth_srtm_topography", title="Earth SRTM - Atacama topography",
         kind="raster", cmap="terrain", label="Elevation (m)",
         loader=lambda: load_tif("srtm", nodata=-32768)[::2, ::2], extent=(-69, -68, -24, -23)),
    dict(name="03_earth_modis_thermal", title="Earth MODIS - Atacama land surface temperature (day)",
         kind="raster", cmap="inferno", label="Temperature (C)",
         loader=lambda: load_tif("modis"), extent=MODIS_EXTENT,
         xlabel="Sinusoidal X (km)", ylabel="Sinusoidal Y (km)"),
    dict(name="04_mars_hirise_jezero", title="Mars HiRISE - Jezero Crater",
         kind="rgb", key="hirise"),
    dict(name="05_mars_mola_topography", title="Mars MOLA - global topography",
         kind="raster", cmap="copper", label="Elevation (m)",
         loader=lambda: np.load(PATHS["mola_npy"]), extent=(0, 360, -90, 90)),
    dict(name="06_moon_lroc_surface", title="Moon LROC - lunar surface",
         kind="rgb", key="lroc"),
    dict(name="07_moon_lola_topography", title="Moon LOLA - global topography",
         kind="raster", cmap="bone", label="Elevation (m)",
         loader=lambda: np.load(PATHS["lola_npy"]), extent=(0, 360, -90, 90)),
]


def draw(ax, fig, p, colorbar=True):
    try:
        if p["kind"] == "rgb":
            img = load_rgb(p["key"])
            ax.imshow(img)
            ax.set_title(f"{p['title']}\n{img.shape[1]}x{img.shape[0]} px", fontsize=10)
            ax.axis("off")
        else:
            arr = p["loader"]()
            vmin, vmax = np.nanpercentile(arr, [1, 99])
            im = ax.imshow(arr, cmap=p["cmap"], vmin=vmin, vmax=vmax,
                           extent=p["extent"], interpolation="nearest", aspect="auto")
            ax.set_title(p["title"], fontsize=10)
            ax.set_xlabel(p.get("xlabel", "Longitude (deg)"))
            ax.set_ylabel(p.get("ylabel", "Latitude (deg)"))
            if colorbar:
                fig.colorbar(im, ax=ax, shrink=0.85, label=p["label"])
    except Exception as e:
        ax.text(0.5, 0.5, f"Could not render\n{str(e)[:80]}", ha="center", va="center", transform=ax.transAxes)
        ax.set_title(p["title"], fontsize=10)
        ax.axis("off")


for p in PANELS:
    fig, ax = plt.subplots(figsize=(11, 6))
    draw(ax, fig, p)
    fig.savefig(DIRS["figures"] / f"{p['name']}.png", dpi=150, bbox_inches="tight")
    plt.show()
    plt.close(fig)

fig, axes = plt.subplots(2, 4, figsize=(24, 11))
flat = axes.ravel()
for ax, p in zip(flat, PANELS):
    draw(ax, fig, p)
for ax in flat[len(PANELS):]:
    ax.axis("off")
fig.suptitle("Earth, Mars and Moon datasets - NASA Space Apps Challenge 2026", fontsize=16)
fig.tight_layout()
fig.savefig(DIRS["figures"] / "00_all_datasets_overview.png", dpi=130, bbox_inches="tight")
plt.show()

# %% [markdown]
# ## Cell 9: Build the manifest and ZIP everything

# %%
def sha256(path, chunk=1 << 20):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        while True:
            b = f.read(chunk)
            if not b:
                break
            h.update(b)
    return h.hexdigest()


manifest = {
    "created": date.today().isoformat(),
    "project": "NASA Space Apps Challenge 2026 - Earth, Mars and Moon datasets",
    "status": STATUS,
    "sources": SOURCES,
    "verification": [{"dataset": r[0], "status": r[1], "details": r[2]} for r in report],
    "files": [],
}

files = sorted(p for p in BASE.rglob("*") if p.is_file() and not p.name.endswith(".part"))
for p in files:
    manifest["files"].append({
        "path": str(p.relative_to(BASE)),
        "bytes": p.stat().st_size,
        "sha256": sha256(p),
    })

manifest_path = BASE / "manifest.json"
manifest_path.write_text(json.dumps(manifest, indent=2))

zip_path = ROOT / "planetary_project_data.zip"
if zip_path.exists():
    zip_path.unlink()

with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=6) as z:
    for p in sorted(BASE.rglob("*")):
        if p.is_file() and not p.name.endswith(".part"):
            z.write(p, arcname=str(p.relative_to(BASE)))

with zipfile.ZipFile(zip_path) as z:
    assert z.testzip() is None, "ZIP integrity test failed"
    print(f"ZIP verified: {zip_path}")
    print(f"Size: {zip_path.stat().st_size / 1e6:.1f} MB, entries: {len(z.namelist())}")
    for n in z.namelist():
        print("  ", n)
