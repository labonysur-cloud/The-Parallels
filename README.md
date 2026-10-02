# The Parallel

## Project Overview
The Parallel is an explainable decision-support system designed to identify and characterize terrestrial analog sites for future Lunar and Martian base selection. Developed for the NASA Space Apps Challenge, this platform serves as a mission simulator for space agencies, mission planners, and astronauts.

While no single location on Earth can perfectly replicate extraterrestrial conditions, The Parallel uses a weighted scoring engine to evaluate Earth environments based on specific mission requirements. It provides an interactive interface to discover training grounds for geological sampling, rover mobility testing, and extreme isolation preparation.

## Core Features
* Mission Simulation Engine: Allows users to configure mission profiles (such as Human Mars EVA or Lunar Base Camp) and calculates the most suitable Earth-based training analogs.
* Explainable AI Dashboard: Provides a transparent breakdown of environmental similarity scores, detailing exactly what parameters match and explicitly stating terrestrial limitations (such as atmospheric pressure and gravity).
* Interactive Orbital Map: A custom geospatial interface utilizing NASA GIBS tile layers to visualize candidate training locations globally.
* Parameter Analysis: Compares aridity, temperature variance, UV index, surface roughness, mineralogy, and regolith characteristics against baseline data from target planetary bodies.
* Astronaut Training Plans: Procedurally generated daily mission schedules tailored to the geological and environmental realities of the selected analog site.

## Data Sources
* NASA Global Imagery Browse Services (GIBS) for true-color Earth orbital imagery.
* NASA Solar System Treks for Lunar and Martian baseline data modeling.
* Open-source historical climate and elevation data for precise environmental scoring.

## Technical Architecture
* Frontend Framework: React 18 with Vite
* Styling: Tailwind CSS
* Mapping: Leaflet and React-Leaflet
* Data Visualization: Recharts
* HTTP Client: Axios

## Local Setup and Installation

Follow these steps to run the project locally on your development machine.

1. Clone the repository
git clone https://github.com/labonysur-cloud/The-Parallels.git

2. Navigate to the project directory
cd The-Parallels

3. Install the required dependencies
npm install

4. Start the development server
npm run dev

5. Access the application
Open your web browser and navigate to http://localhost:5173

## Team Astrophel
* Labony Sur (Team Leader)
* Aupurba Sarker (Team Member)

## License
This project is licensed under the MIT License.
