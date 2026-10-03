<div align="center">
  <img src="https://upload.wikimedia.org/wikipedia/commons/e/e5/NASA_logo.svg" alt="NASA Logo" width="100"/>
  <h1>The Parallel</h1>
  <p><b>An Explainable Decision-Support System for Terrestrial Analog Mission Planning</b></p>
  <p><i>NASA International Space Apps Challenge 2026 Submission by Team Astrophel</i></p>
  <p><a href="https://the-parallels.vercel.app/"><b>🌍 View Live Demo</b></a></p>
</div>

---

## 🚀 Project Overview

**No Earth location is another planet. It is an analogue.**

**The Parallel** is an explainable decision-support system designed to identify and rank Earth-based environments (Terrestrial Analogs) suitable for specific Lunar and Martian mission preparation tasks. Developed for the NASA Space Apps Challenge 2026, this platform serves as an interactive mission simulator for space agencies, mission planners, and astronauts.

Instead of simply claiming to "find Mars on Earth," our system uses real NASA geospatial data and a Machine Learning similarity engine to evaluate Earth environments based on specific mission requirements, while honestly and scientifically acknowledging what Earth *cannot* simulate (e.g., gravity, vacuum, and cosmic radiation).

## ✨ Core Features

*   **🔍 "Find My Mars" Scanning Engine:** A cinematic mission selector that filters through thousands of global coordinates to find the best planetary matches.
*   **🌍 Interactive 3D Digital Twin:** A high-performance 3D Earth globe (`react-globe.gl` & Three.js) that visualizes ranked analog sites and allows users to deep-dive into high-res satellite imagery.
*   **📊 Explainable AI Dashboard:** It doesn't just give a "Similarity Score." It provides a transparent breakdown of environmental parameters (Aridity, UV, Roughness, Mineralogy) and explicitly states terrestrial limitations.
*   **🧑‍🚀 "Train Like an Astronaut" Mode:** Procedurally generates 5-day training schedules tailored to the geological realities of the selected analog site (e.g., lava tube mapping for volcanic sites, ice core drilling for polar sites).
*   **🤖 ASTRA Mission AI:** A floating, context-aware AI chatbot powered by **Groq (Llama 3.1 8B)**. ASTRA knows the exact scientific parameters of every site in our database and assists mission planners in real-time.

---


## 🛰️ Space Agency & Global Collaborator Integration

**The Parallel** is proudly built using open data, APIs, and resources from the **17 International Space Agency Partners** and **Global Collaborators** of the 2026 NASA Space Apps Challenge. 

### 🌌 Space Agency Partners Data Sources
Our machine learning models and environmental profiling engines leverage telemetry and Earth observation data from:

*   **NASA (USA):** SRTM Topography (Surface Roughness), MODIS (Temperature Range), and PDS (Lunar/Martian baseline mapping).
*   **ESA (Europe):** Sentinel-2 Multi-spectral imagery (Copernicus) for mineralogy verification (e.g., iron oxides, basalts).
*   **JAXA (Japan):** ALOS-2 PALSAR-2 L-band Synthetic Aperture Radar for subsurface geological structure detection (lava tubes).
*   **CSA (Canada):** Radarsat Constellation C-band SAR for mapping permafrost and soil moisture dynamics.
*   **ISRO (India):** Cartosat-3 high-resolution optical imagery for surface morphology validation.
*   **ASI (Italy):** COSMO-SkyMed radar data for extreme terrain interferometry.
*   **AEB (Brazil):** Amazonia-1 data used for comparative biome analysis.
*   **CONAE (Argentina):** SAOCOM L-band radar utilized for soil moisture indexing in arid analog regions.
*   **Additional Partners Integrated in Global Scanning:** GGPEN (Angola), BSA (Bahrain), KASA (South Korea), NASRDA (Nigeria), AEP (Paraguay), ASES (Senegal), AEE (Spain), TUA (Turkey).

### 🌐 Global Collaborators & Technical Stack
We utilized resources provided by the 2026 Global Collaborators to build and scale this application:
*   **Meteomatics:** Leveraged the Meteomatics Weather API to pull 10-year historical climate variance, diurnal temperature shifts, and precise aridity indices for terrestrial analog sites.
*   **Microsoft / Google:** Utilized cloud infrastructure and geospatial processing tools (Google Earth Engine) to process massive GeoTIFF datasets.
*   **GoDaddy / Miro:** Used for project management, domain configuration, and architectural storyboarding.

---

## 🧠 Machine Learning & AI Architecture

Our project isn't just a frontend dashboard; it is backed by a robust Python Machine Learning pipeline (located in the `/notebooks` directory).

1.  **Similarity Engine (K-Nearest Neighbors):** We augmented our curated database with 5,000 synthetic global coordinates and trained a KNN model (using `scikit-learn`). By feeding the model an "Ideal Mars" or "Ideal Moon" vector, it retrieves the mathematically closest Earth locations across 7 normalized dimensions.
2.  **Unsupervised Clustering (K-Means & PCA):** We utilize K-Means clustering to group Earth biomes and use Principal Component Analysis (PCA) to visually plot how close Earth environments are to extraterrestrial baselines.
3.  **ASTRA Conversational AI:** We integrated the **Groq SDK** to power our in-app mission assistant. By leveraging system prompts engineered with our ML outputs, ASTRA provides instant, hallucination-free mission planning advice at 560 tokens/second.

---

## 💻 Local Setup and Installation

Follow these steps to run the complete React dashboard locally.

**1. Clone the repository**
```bash
git clone https://github.com/labonysur-cloud/The-Parallels.git
cd The-Parallels
```

**2. Install dependencies**
```bash
npm install
```

**3. Configure Environment Variables**
Rename `.env.example` to `.env` and add your free Groq API key to activate the ASTRA Chatbot.
```env
VITE_GROQ_API_KEY=your_api_key_here
```

**4. Start the development server**
```bash
npm run dev
```
Access the application at `http://localhost:5173`.

*(Optional: To run the Python Machine Learning notebooks, navigate to the `/notebooks` directory and install the requirements via `pip install -r ../requirements.txt`)*

---

## 👨‍🚀 Team Astrophel
Proudly built in Bangladesh for the NASA Space Apps Challenge 2026.
*   **Labony Sur** (Team Leader)
*   **Aupurba Sarker** (Team Member)

## 📄 License
This project is licensed under the MIT License.
