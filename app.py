import streamlit as st
import os
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from PIL import Image
try:
    import rasterio
except ImportError:
    rasterio = None

st.set_page_config(page_title="The Parallels", layout="wide")

st.title("🌌 The Parallels: Terrestrial Analog Matchmaker")
st.markdown("""
Welcome to **The Parallels**. This data-driven platform identifies terrestrial analogs for proposed Moon and Mars base locations by comparing multidimensional data profiles (topography, geology, environment).
""")

# Sidebar
st.sidebar.header("Mission Parameters")
target_body = st.sidebar.selectbox("Select Target Body", ["Mars", "Moon"])

if target_body == "Mars":
    target_site = st.sidebar.selectbox("Select Target Site", ["Jezero Crater", "Gale Crater"])
else:
    target_site = st.sidebar.selectbox("Select Target Site", ["Lunar South Pole (Artemis Base Camp)", "Tycho Crater"])

st.sidebar.markdown("---")
st.sidebar.info("Developed by Team Astrophel for NASA Space Apps Challenge.")

# Data paths
data_dir = "./planetary_datasets"

# Dummy feature extraction for the UI (since actual processing can be slow or require massive datasets)
def get_site_metrics(site):
    if site == "Jezero Crater":
        return {"elevation_mean": -2500, "elevation_variance": 400, "temp_mean": -60, "temp_variance": 20}
    elif site == "Gale Crater":
        return {"elevation_mean": -4500, "elevation_variance": 600, "temp_mean": -55, "temp_variance": 25}
    elif site == "Lunar South Pole (Artemis Base Camp)":
        return {"elevation_mean": 2000, "elevation_variance": 800, "temp_mean": -130, "temp_variance": 100}
    elif site == "Tycho Crater":
        return {"elevation_mean": -1000, "elevation_variance": 1500, "temp_mean": -100, "temp_variance": 80}
    return {}

earth_db = {
    "Atacama Desert, Chile": {"elevation_mean": 2400, "elevation_variance": 350, "temp_mean": 15, "temp_variance": 15, "desc": "Extremely arid, similar soil composition to Mars."},
    "McMurdo Dry Valleys, Antarctica": {"elevation_mean": 100, "elevation_variance": 500, "temp_mean": -20, "temp_variance": 10, "desc": "Cold desert, permafrost, analogous to Martian polar or crater regions."},
    "Svalbard, Norway": {"elevation_mean": 400, "elevation_variance": 600, "temp_mean": -10, "temp_variance": 12, "desc": "Glacial features and permafrost, good for testing lunar/martian rovers."},
    "Iceland (Volcanic Regions)": {"elevation_mean": 800, "elevation_variance": 700, "temp_mean": 2, "temp_variance": 10, "desc": "Basaltic terrain, volcanic similarity to lunar maria and martian soil."}
}

col1, col2 = st.columns(2)

with col1:
    st.subheader(f"Target: {target_body} - {target_site}")
    
    # Try loading image
    img_path = None
    if target_body == "Mars":
        img_path = os.path.join(data_dir, "mars_hirise_sample.jpg")
    else:
        img_path = os.path.join(data_dir, "moon_lroc_sample.jpg")
        
    if img_path and os.path.exists(img_path):
        image = Image.open(img_path)
        st.image(image, caption=f"{target_site} Visual", use_container_width=True)
    else:
        st.warning("Visual data not found. Please run the downloader script.")

    metrics = get_site_metrics(target_site)
    st.write("**Topographical & Climate Metrics (Est.):**")
    st.json(metrics)

with col2:
    st.subheader("Terrestrial Analog Matchmaking")
    if st.button("Run Clustering Algorithm 🚀"):
        with st.spinner("Analyzing Earth multidimensional profiles (ASTER, MODIS)..."):
            import time
            time.sleep(2) # Simulate processing time
            
            # Simple matching logic (mocked for hackathon demo)
            best_match = None
            best_score = float('inf')
            
            for earth_site, e_metrics in earth_db.items():
                # Normalized distance (mock weights)
                score = (abs(e_metrics["elevation_variance"] - metrics["elevation_variance"]) * 0.5 + 
                         abs(e_metrics["temp_variance"] - metrics["temp_variance"]) * 0.5)
                if score < best_score:
                    best_score = score
                    best_match = earth_site
            
            st.success("Match Found!")
            st.markdown(f"### 🌍 Best Analog: **{best_match}**")
            st.write(earth_db[best_match]["desc"])
            
            # Show Earth match image
            earth_img_path = os.path.join(data_dir, "earth_landsat_sample.jpg")
            if os.path.exists(earth_img_path):
                 st.image(Image.open(earth_img_path), caption=best_match, use_container_width=True)
            else:
                 st.info("Earth satellite visual not available locally.")

            st.write("**Similarity Score:**", round((1000 - best_score)/10, 2), "%")
            
            # Chart comparison
            st.write("**Variance Comparison**")
            df = pd.DataFrame({
                "Location": [target_site, best_match],
                "Elevation Variance": [metrics["elevation_variance"], earth_db[best_match]["elevation_variance"]],
                "Temp Variance": [metrics["temp_variance"], earth_db[best_match]["temp_variance"]]
            })
            st.bar_chart(df.set_index("Location"))
            
st.markdown("---")
st.markdown("### Digital Twin Viewer")
st.markdown("To interact with the geospatial layers (GeoTIFF, PDS IMG), the platform utilizes `rasterio` and interactive rendering engines to project elevation and temperature data side-by-side.")
if st.button("Load Geospatial Layers (Demo)"):
    if not rasterio:
        st.error("Please install `rasterio` (pip install rasterio) to view geospatial data.")
    else:
        # Load earth srtm
        srtm_path = os.path.join(data_dir, "earth_srtm.tif")
        if os.path.exists(srtm_path):
            with rasterio.open(srtm_path) as src:
                data = src.read(1)
                fig, ax = plt.subplots(figsize=(6, 4))
                im = ax.imshow(data, cmap='terrain')
                plt.colorbar(im, ax=ax, label='Elevation')
                ax.set_title("Earth SRTM Elevation")
                ax.axis('off')
                st.pyplot(fig)
        else:
            st.warning("Earth SRTM geospatial file missing.")

