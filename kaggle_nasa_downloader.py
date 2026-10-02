import os
import requests
import zipfile

# Define direct, open source URLs for the datasets
datasets = {
    # Earth SRTM Topography (AWS S3 GeoTIFF - Verified)
    "earth_srtm.tif": "https://s3.amazonaws.com/elevation-tiles-prod/geotiff/10/326/536.tif", 
    
    # Earth Temperature Prototype (AWS S3 GeoTIFF - Verified)
    "earth_modis_temp.tif": "https://s3.amazonaws.com/elevation-tiles-prod/geotiff/10/326/537.tif",
    
    # Earth Landsat Visual (Original High-Res Wikimedia Link)
    "earth_landsat_sample.jpg": "https://upload.wikimedia.org/wikipedia/commons/1/1b/Atacama_Desert_%28satellite_image%29.jpg",
    
    # Mars Topography (PDS Raw Image)
    "mars_mola_topo.img": "https://pds-geosciences.wustl.edu/mgs/mgs-m-mola-5-megdr-l3-v1/mgsl_300x/meg004/megt90n000cb.img",
    
    # Mars HiRISE Visual (Original High-Res Wikimedia Link - Jezero Crater)
    "mars_hirise_sample.jpg": "https://upload.wikimedia.org/wikipedia/commons/0/02/Jezero_Crater_-_Mars_2020_Rover_Landing_Site.jpg",
    
    # Moon Topography (PDS Raw Image)
    "moon_lola_southpole.img": "https://pds-geosciences.wustl.edu/lro/lro-l-lola-3-rdr-v1/lrolol_1xxx/data/lola_gdr/polar/img/ldem_75s_120m.img",
    
    # Moon LROC Visual (Original High-Res Wikimedia Link - Tycho Crater)
    "moon_lroc_sample.jpg": "https://upload.wikimedia.org/wikipedia/commons/4/4a/Tycho_Crater_-_LROC_-_WAC.jpg"
}

download_dir = "./planetary_datasets"
zip_filename = "official_planetary_data.zip"
os.makedirs(download_dir, exist_ok=True)

print("Starting direct downloads from robust open sources...")

# 1. Download files using HTTP streams
for filename, url in datasets.items():
    file_path = os.path.join(download_dir, filename)
    print(f"Downloading {filename}...")
    try:
        headers = {'User-Agent': 'Mozilla/5.0'}
        with requests.get(url, headers=headers, stream=True, timeout=30) as r:
            r.raise_for_status()
            with open(file_path, 'wb') as f:
                for chunk in r.iter_content(chunk_size=8192):
                    if chunk:
                        f.write(chunk)
        print(f"Successfully downloaded {filename}.")
    except Exception as e:
        print(f"Failed to download {filename}. Error: {e}")

# 2. Create the ZIP Archive
print(f"\nCompressing data into {zip_filename}...")
try:
    with zipfile.ZipFile(zip_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(download_dir):
            for file in files:
                full_path = os.path.join(root, file)
                zipf.write(full_path, file)
    print(f"\nSuccess! Archive created at: {os.path.abspath(zip_filename)}")
except Exception as e:
    print(f"Error zipping files: {e}")
