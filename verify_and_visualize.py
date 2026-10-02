# DATASET VERIFICATION & VISUALIZATION SCRIPT
# Run this in a new Kaggle cell.
# Requirement: !pip install rasterio matplotlib pillow

import os
import matplotlib.pyplot as plt
import rasterio
from PIL import Image

download_dir = "./planetary_datasets"

print("--------------------------------------------------")
print("DATASET VERIFICATION AND VISUALIZATION INITIALIZED")
print("--------------------------------------------------")

def visualize_image(filename, title):
    filepath = os.path.join(download_dir, filename)
    if not os.path.exists(filepath):
        print(f"[ERROR] Missing file: {filename}")
        return
    
    try:
        img = Image.open(filepath)
        print(f"[VERIFIED] {filename} | Format: {img.format} | Dimensions: {img.size}")
        
        plt.figure(figsize=(10, 8))
        plt.imshow(img)
        plt.title(title, fontsize=12, fontweight='bold')
        plt.axis('off')
        plt.show()
    except Exception as e:
        print(f"[ERROR] Integrity check failed for {filename}. Details: {e}")

def visualize_geospatial(filename, title, colormap='terrain'):
    filepath = os.path.join(download_dir, filename)
    if not os.path.exists(filepath):
        print(f"[ERROR] Missing file: {filename}")
        return
    
    try:
        # rasterio interfaces with GDAL, which natively supports GeoTIFF and NASA PDS .img formats
        with rasterio.open(filepath) as src:
            data = src.read(1)
            print(f"[VERIFIED] {filename} | Matrix Shape: {data.shape} | Projection: {src.crs}")
            
            plt.figure(figsize=(10, 8))
            plt.imshow(data, cmap=colormap)
            plt.colorbar(label='Data Value (Elevation/Temperature)')
            plt.title(title, fontsize=12, fontweight='bold')
            plt.axis('off')
            plt.show()
    except Exception as e:
        print(f"[WARNING] Visualization mapping failed for {filename}. The binary data may be intact but requires a dedicated PDS label file (.lbl) for coordinate extraction. Details: {e}")

# Execution Sequence
print("\n[Section 1] Processing Earth Data")
visualize_image("earth_landsat_sample.jpg", "Earth: Atacama Desert (Landsat 8 True Color)")
visualize_geospatial("earth_srtm.tif", "Earth: Elevation Map (SRTM Topography)", colormap="terrain")
visualize_geospatial("earth_modis_temp.tif", "Earth: Global Surface Temperature (MODIS)", colormap="inferno")

print("\n[Section 2] Processing Mars Data")
visualize_image("mars_hirise_sample.jpg", "Mars: Jezero Crater (HiRISE High-Resolution)")
visualize_geospatial("mars_mola_topo.img", "Mars: Elevation Map (MOLA Topography)", colormap="copper")

print("\n[Section 3] Processing Lunar Data")
visualize_image("moon_lroc_sample.jpg", "Moon: Lunar Surface (LROC High-Resolution)")
visualize_geospatial("moon_lola_southpole.img", "Moon: Elevation Map (LOLA Topography)", colormap="bone")

print("\nSystem process completed.")
