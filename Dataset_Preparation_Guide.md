# Dataset Preparation Guide for 'The Parallels'

## 1. Earth Data (NASA Earthdata)
**Account Required:** You must create a free account at [urs.earthdata.nasa.gov](https://urs.earthdata.nasa.gov/).

### ASTER Global Digital Elevation Model (GDEM)
*   **Use:** Earth topography/elevation.
*   **Where to get:** Go to [search.earthdata.nasa.gov](https://search.earthdata.nasa.gov/). Search for `"ASTGTM v003"`.
*   **Action:** Select extreme regions (e.g. Atacama Desert, Antarctica, Hawaii volcanoes) using the polygon tool. Download the GeoTIFF files into your `Earth_ASTER_Elevation` folder.

### MODIS Land Surface Temperature
*   **Use:** Earth temperature extremes.
*   **Where to get:** Search Earthdata for `"MOD11A1"` (Daily LST).
*   **Action:** Download the NetCDF/HDF files for the same regions into your `Earth_MODIS_Temp` folder.

## 2. Planetary Data (Mars & Moon)
**No account required.** Planetary data is hosted on the PDS (Planetary Data System). The easiest way to get it is through the **Orbital Data Explorer (ODE)**.

### Mars MOLA (Elevation)
*   **Use:** Mars topography.
*   **Where to get:** Go to [ode.rsl.wustl.edu/mars/](https://ode.rsl.wustl.edu/mars/).
*   **Action:** Search for MGS (Mars Global Surveyor) -> MOLA dataset. Download the DEM (Digital Elevation Model) files (usually in .IMG or GeoTIFF format) for a target site like Jezero Crater into your `Mars_MOLA_Elevation` folder.

### Moon LOLA (Elevation)
*   **Use:** Moon topography (Lunar South Pole).
*   **Where to get:** Go to [ode.rsl.wustl.edu/moon/](https://ode.rsl.wustl.edu/moon/).
*   **Action:** Search for LRO (Lunar Reconnaissance Orbiter) -> LOLA. Download target sites into your `Moon_LOLA_Elevation` folder.
