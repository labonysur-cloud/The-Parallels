/**
 * Honest, Real-Data Analog Suitability Index (ASI) Scoring Engine
 * Directly mapped from the scientifically grounded v2 Python Notebook.
 */

function clip(val, min, max) {
  return Math.max(min, Math.min(val, max));
}

// Baseline parameters for target bodies (derived from published NASA literature)
export const BODY_BASELINES = {
  mars: { annual_precip_mm: 0.0, diurnal_range_c: 60.0, mean_temp_c: -63.0, rh_pct: 0.0, wind_ms: 5.0 },
  moon: { annual_precip_mm: 0.0, diurnal_range_c: 300.0, mean_temp_c: -20.0, rh_pct: 0.0, wind_ms: 0.0 },
};

// Physical bounds used to normalize features to [0,1]
export const FEATURE_BOUNDS = {
  annual_precip_mm: [0.0, 1000.0],
  diurnal_range_c:  [0.0, 300.0],
  mean_temp_c:      [-90.0, 60.0],
  rh_pct:           [0.0, 100.0],
  wind_ms:          [0.0, 30.0],
};

export const ASI_WEIGHTS = {
  annual_precip_mm: 0.30,
  diurnal_range_c: 0.25,
  rh_pct: 0.20,
  mean_temp_c: 0.15,
  wind_ms: 0.10,
};

export const PARAM_LABELS = {
  annual_precip_mm: 'Annual Precip (mm)',
  diurnal_range_c: 'Diurnal Range (°C)',
  mean_temp_c: 'Mean Temp (°C)',
  rh_pct: 'Rel. Humidity (%)',
  wind_ms: 'Wind Speed (m/s)',
};

// Map old default weights backward compatibility if needed, but not used in math
export const DEFAULT_WEIGHTS = ASI_WEIGHTS;

/**
 * Computes the ASI score (0-100) using a weighted geometric mean of similarities.
 * @param {Object} site - Site object containing analog_params
 * @param {String} targetBody - 'mars' or 'moon'
 * @param {Object} customWeights - Custom weights from user (optional)
 */
export function scoreAnalog(site, targetBody, customWeights = ASI_WEIGHTS) {
  const ref = BODY_BASELINES[targetBody];
  const params = site.analog_params;
  if (!ref || !params) return 0;
  
  let logSum = 0;
  let weightSum = 0;
  
  for (const feat in ASI_WEIGHTS) {
    const w = customWeights[feat] !== undefined ? customWeights[feat] : ASI_WEIGHTS[feat];
    const [lo, hi] = FEATURE_BOUNDS[feat];
    
    // Default to a middle value if data is missing
    const val = params[feat] !== undefined ? params[feat] : ((lo + hi) / 2);
    
    const xNorm = clip((val - lo) / (hi - lo), 0, 1);
    const rNorm = clip((ref[feat] - lo) / (hi - lo), 0, 1);
    
    // Similarity is 1 - absolute difference in normalized space
    let sim = clip(1.0 - Math.abs(xNorm - rNorm), 1e-6, 1.0);
    
    logSum += w * Math.log(sim);
    weightSum += w;
  }
  
  return weightSum > 0 ? Math.round(100.0 * Math.exp(logSum / weightSum)) : 0;
}

export function rankAllSites(sites, targetBody, customWeights = ASI_WEIGHTS) {
  return sites
    .map((site) => ({
      ...site,
      computedScore: scoreAnalog(site, targetBody, customWeights),
    }))
    .sort((a, b) => b.computedScore - a.computedScore);
}

export function getScoreBreakdown(site, targetBody, customWeights = ASI_WEIGHTS) {
  const ref = BODY_BASELINES[targetBody];
  const params = site.analog_params;

  return Object.keys(ASI_WEIGHTS).map((feat) => {
    const earthVal = params[feat] !== undefined ? params[feat] : 0;
    const targetVal = ref[feat];
    const w = customWeights[feat] !== undefined ? customWeights[feat] : ASI_WEIGHTS[feat];
    const [lo, hi] = FEATURE_BOUNDS[feat];
    
    const xNorm = clip((earthVal - lo) / (hi - lo), 0, 1);
    const rNorm = clip((targetVal - lo) / (hi - lo), 0, 1);
    let sim = clip(1.0 - Math.abs(xNorm - rNorm), 0.0, 1.0);

    return {
      param: feat,
      label: PARAM_LABELS[feat] || feat,
      earthValue: Math.round(earthVal * 10) / 10,
      targetValue: targetVal,
      weight: w,
      contribution: Math.round(w * sim * 10) / 10,
      similarity: Math.round(sim * 100),
    };
  });
}
