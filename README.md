<div align="center">
  <img src="https://upload.wikimedia.org/wikipedia/commons/e/e5/NASA_logo.svg" alt="NASA Logo" width="100"/>
  <h1>The Parallel</h1>
  <p><b>An Explainable Decision-Support System for Terrestrial Analog Mission Planning</b></p>
  <p><i>NASA International Space Apps Challenge 2026 Submission by Team Astrophel</i></p>
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

## 🛰️ NASA Data & Global Collaborator Integration

To ensure the highest scientific validity, **The Parallel** is powered by open data from NASA and its official Global Collaborators.

| Dataset / API | Space Agency / Collaborator | Purpose in Project |
| :--- | :--- | :--- |
| **NASA SRTM Topography** (GeoTIFF) | NASA | Processed locally via Python `rasterio` to calculate the mathematical **"Surface Roughness"** and elevation variance of Earth analog sites. |
| **NASA MODIS Surface Temp** (GeoTIFF) | NASA | Used to derive the **"Temperature Range"** parameters across multiple global biomes. |
| **PDS Topography (MOLA & LOLA)** | NASA | Provided the baseline topographical data for our target extraterrestrial bodies (Moon and Mars) to calibrate our ML scoring engine. |
| **ESA Sentinel-2 Imagery** | ESA / Google Earth Engine | Multi-spectral imagery (SWIR bands) accessed to verify the **"Mineralogy"** (e.g., iron oxides, basalt) of terrestrial analog locations. |
| **Meteomatics Climate API** | Meteomatics | Used to pull 10-year historical climate variance to accurately calculate the **"Aridity"** score of Earth deserts. |

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
