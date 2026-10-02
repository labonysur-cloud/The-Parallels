# The Parallels

A data-driven matchmaking platform designed to discover and characterize undocumented terrestrial analog environments for proposed Moon and Mars base locations. Developed for the NASA Space Apps Challenge 2026.

## Project Overview

Selecting future landing sites and lunar base locations depends on topography, geology, environment, and available resources. Places on Earth that have analogous characteristics to the Moon or Mars allow mission teams to test equipment and methods before they fly. 

The Parallels utilizes open data from NASA and other space agencies to identify new terrestrial analogs, drawing on deserts, polar regions, volcanic terrains, and other extreme environments that share structural conditions with the lunar or Martian surface.

## Methodology

The platform operates by comparing multidimensional data profiles:
* Target Profile: Environmental and topological data from Martian or Lunar target sites.
* Earth Profile: Corresponding metrics extracted from Earth observation satellites.
* Matching Algorithm: Calculates structural and environmental similarity to identify viable terrestrial analogs.

## Data Sources

This project integrates data from the following NASA repositories:
* NASA Earthdata: ASTER (Global Digital Elevation Model), MODIS (Land Surface Temperature)
* Planetary Data System (PDS): LRO LOLA (Lunar Topography), MGS MOLA (Martian Topography)

## Project Structure

* Datasets: Ignored via version control due to file size constraints. Refer to the dataset preparation documentation to replicate the local environment.
* Scripts: Data acquisition and processing modules.

## Setup Instructions

1. Clone the repository.
2. Initialize a Python virtual environment.
3. Install dependencies (requirements documentation pending).
4. Execute the data fetch scripts to populate the local dataset directories.

## License

This project is released under the MIT License as an open-source initiative.
