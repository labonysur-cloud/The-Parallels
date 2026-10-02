# %% [markdown]
# # The Parallel: Terrestrial Analog ML Recommender
# This notebook trains a Machine Learning model to identify the best Earth-based analog sites for extraterrestrial missions (Moon and Mars).
# 
# **Approach:**
# 1. We load our curated dataset of Earth locations and their geological/environmental parameters.
# 2. We augment the dataset with synthetic data to simulate scanning the entire globe.
# 3. We use **K-Nearest Neighbors (KNN)** to build a recommendation engine.
# 4. We use **K-Means Clustering** to visualize how Earth environments group together compared to Mars and the Moon.

# %%
import json
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import NearestNeighbors
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
import joblib
import os

# Set plotting style
sns.set_theme(style="darkgrid")
plt.rcParams['figure.figsize'] = (10, 6)

print("Libraries loaded successfully!")

# %% [markdown]
# ## 1. Data Loading & Preprocessing
# We load the existing curated analog sites from our React frontend data.

# %%
# Load the JSON data
data_path = '../src/data/analog-sites.json'
with open(data_path, 'r', encoding='utf-8') as f:
    raw_data = json.load(f)

# Extract features
sites = []
for item in raw_data:
    row = {
        'id': item['id'],
        'name': item['name'],
        'type': item['type'][0] if item['type'] else 'unknown',
        'aridity': item['analog_params']['aridity'],
        'temp_range': item['analog_params']['temp_range'],
        'uv_index': item['analog_params']['uv_index'],
        'surface_roughness': item['analog_params']['surface_roughness'],
        'mineral_analog': item['analog_params']['mineral_analog'],
        'isolation': item['analog_params']['isolation'],
        'regolith': item['analog_params']['regolith']
    }
    sites.append(row)

df_curated = pd.DataFrame(sites)
print(f"Loaded {len(df_curated)} curated sites.")
df_curated.head()

# %% [markdown]
# ## 2. Synthetic Data Augmentation
# To make this a robust Machine Learning model, 18 sites are not enough. We will generate 5,000 synthetic Earth locations to simulate "scanning the entire globe" with satellite data.

# %%
np.random.seed(42)
n_synthetic = 5000

# Generate random parameters (0 to 10 scale)
synthetic_data = {
    'id': [f'syn_{i}' for i in range(n_synthetic)],
    'name': [f'Sector {i} (Unmapped)' for i in range(n_synthetic)],
    'type': np.random.choice(['desert', 'volcanic', 'polar', 'forest', 'oceanic'], n_synthetic),
    'aridity': np.random.normal(5, 2.5, n_synthetic).clip(0, 10),
    'temp_range': np.random.normal(5, 2.5, n_synthetic).clip(0, 10),
    'uv_index': np.random.normal(5, 2.5, n_synthetic).clip(0, 10),
    'surface_roughness': np.random.normal(5, 2.5, n_synthetic).clip(0, 10),
    'mineral_analog': np.random.normal(5, 2.5, n_synthetic).clip(0, 10),
    'isolation': np.random.normal(5, 2.5, n_synthetic).clip(0, 10),
    'regolith': np.random.normal(5, 2.5, n_synthetic).clip(0, 10),
}

df_synthetic = pd.DataFrame(synthetic_data)
df_full = pd.concat([df_curated, df_synthetic], ignore_index=True)

print(f"Total dataset size: {len(df_full)} locations.")

# %% [markdown]
# ## 3. Feature Scaling
# ML models like KNN and K-Means rely on distance metrics, so we must normalize our features using `StandardScaler`.

# %%
features = ['aridity', 'temp_range', 'uv_index', 'surface_roughness', 'mineral_analog', 'isolation', 'regolith']
X = df_full[features]

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

print("Features scaled successfully.")

# %% [markdown]
# ## 4. Training the Recommender System (K-Nearest Neighbors)
# We will train a KNN model. When given the "Ideal Mars" or "Ideal Moon" parameters, this model will instantly retrieve the mathematically closest Earth locations.

# %%
# Initialize and fit the KNN model
knn_model = NearestNeighbors(n_neighbors=5, metric='euclidean', algorithm='brute')
knn_model.fit(X_scaled)

# Define baseline parameters for Target Bodies (From scoringEngine.js)
target_baselines = {
    'mars': [9, 8, 8, 5, 8, 9, 7],
    'moon': [10, 10, 10, 8, 8, 10, 9]
}

def find_best_analogs(target_name):
    print(f"\n--- Searching for {target_name.upper()} Analogs ---")
    baseline = np.array(target_baselines[target_name]).reshape(1, -1)
    
    # Scale the target just like the training data
    baseline_scaled = scaler.transform(baseline)
    
    # Find the nearest neighbors
    distances, indices = knn_model.kneighbors(baseline_scaled)
    
    for i, idx in enumerate(indices[0]):
        site = df_full.iloc[idx]
        print(f"Rank {i+1}: {site['name']} (Type: {site['type']}) - Distance: {distances[0][i]:.2f}")
        
find_best_analogs('mars')
find_best_analogs('moon')

# %% [markdown]
# ## 5. K-Means Clustering & PCA Visualization
# Let's see how Earth's environments naturally group together, and visualize it in 2D space using Principal Component Analysis (PCA).

# %%
# Train K-Means
kmeans = KMeans(n_clusters=4, random_state=42, n_init=10)
df_full['cluster'] = kmeans.fit_predict(X_scaled)

# Reduce 7 dimensions to 2 dimensions using PCA
pca = PCA(n_components=2)
X_pca = pca.fit_transform(X_scaled)

df_full['pca1'] = X_pca[:, 0]
df_full['pca2'] = X_pca[:, 1]

# Plot the clusters
plt.figure(figsize=(12, 8))
sns.scatterplot(x='pca1', y='pca2', hue='cluster', data=df_full, palette='viridis', s=20, alpha=0.5)

# Plot the original 18 curated sites distinctly
curated_pca = pca.transform(scaler.transform(df_curated[features]))
plt.scatter(curated_pca[:, 0], curated_pca[:, 1], c='red', s=100, marker='*', label='Curated NASA Analogs', edgecolor='black')

# Plot the Mars and Moon Baselines
mars_pca = pca.transform(scaler.transform([target_baselines['mars']]))
moon_pca = pca.transform(scaler.transform([target_baselines['moon']]))
plt.scatter(mars_pca[:, 0], mars_pca[:, 1], c='orange', s=200, marker='X', label='IDEAL MARS', edgecolor='black')
plt.scatter(moon_pca[:, 0], moon_pca[:, 1], c='white', s=200, marker='X', label='IDEAL MOON', edgecolor='black')

plt.title('PCA Projection of Terrestrial Analog Sites')
plt.legend()
# plt.show()
plt.savefig('pca_clusters.png')

# %% [markdown]
# ## 6. Exporting the Model
# We export the trained KNN model and the Scaler so it can be loaded in a Python backend API (like FastAPI or Flask) to serve the React frontend dynamically!

# %%
os.makedirs('saved_models', exist_ok=True)

# Save the Scaler
joblib.dump(scaler, 'saved_models/analog_scaler.pkl')
# Save the KNN Model
joblib.dump(knn_model, 'saved_models/analog_knn_model.pkl')

print("Model and Scaler successfully exported to the 'saved_models' directory!")
