/**
 * Weighted multi-parameter analog similarity scoring engine.
 *
 * Each parameter is scored 0–10 (10 = most extreme / most analog to target body).
 * Score = Σ(weight_i × (1 - |param_i_earth − param_i_target| / 10)) / Σ(weight_i) × 100
 */

// Baseline parameters for target bodies (derived from published literature)
export const BODY_BASELINES = {
  moon: {
    aridity: 10,          // True vacuum, zero water
    temp_range: 10,       // ~290K diurnal swing (equatorial)
    uv_index: 10,         // Zero atmospheric attenuation
    surface_roughness: 8, // Heavily cratered highlands
    mineral_analog: 8,    // Anorthosite + mare basalt
    isolation: 10,        // Extreme remote vacuum
    regolith: 9,          // Angular, glassy agglutinates
  },
  mars: {
    aridity: 9,           // aw < 0.1, 6 mbar atmosphere
    temp_range: 8,        // ~80–110K diurnal swing
    uv_index: 8,          // No ozone, UV-C reaches surface
    surface_roughness: 5, // Varied: smooth plains to rough highlands
    mineral_analog: 8,    // Fe-oxides, sulfates, perchlorates, basalt
    isolation: 9,         // Extremely remote, thin atmosphere
    regolith: 7,          // Sub-rounded basaltic, dust-coated
  },
};

export const PARAM_LABELS = {
  aridity: 'Aridity',
  temp_range: 'Temp. Range',
  uv_index: 'UV / Radiation',
  surface_roughness: 'Roughness',
  mineral_analog: 'Mineralogy',
  isolation: 'Isolation',
  regolith: 'Regolith',
};

export const PARAM_ICONS = {
  aridity: '🏜️',
  temp_range: '🌡️',
  uv_index: '☀️',
  surface_roughness: '🏔️',
  mineral_analog: '⛏️',
  isolation: '🌑',
  regolith: '🪨',
};

export const DEFAULT_WEIGHTS = {
  aridity: 7,
  temp_range: 6,
  uv_index: 5,
  surface_roughness: 6,
  mineral_analog: 8,
  isolation: 4,
  regolith: 6,
};

/**
 * Score a single analog site against a target body with given weights.
 * Returns a score 0–100.
 */
export function scoreAnalog(site, targetBody, weights = DEFAULT_WEIGHTS) {
  const baseline = BODY_BASELINES[targetBody];
  const params = site.analog_params;
  if (!baseline || !params) return 0;

  let totalScore = 0;
  let totalWeight = 0;

  for (const key of Object.keys(baseline)) {
    const w = weights[key] ?? DEFAULT_WEIGHTS[key] ?? 5;
    const diff = Math.abs((params[key] ?? 5) - baseline[key]) / 10;
    totalScore += w * (1 - diff);
    totalWeight += w;
  }

  return totalWeight > 0 ? Math.round((totalScore / totalWeight) * 100) : 0;
}

/**
 * Score all sites and return sorted array with scores.
 */
export function rankAllSites(sites, targetBody, weights = DEFAULT_WEIGHTS) {
  return sites
    .map((site) => ({
      ...site,
      computedScore: scoreAnalog(site, targetBody, weights),
    }))
    .sort((a, b) => b.computedScore - a.computedScore);
}

/**
 * Get parameter-level breakdown for a site vs target.
 * Returns array of { param, earthValue, targetValue, weight, contribution }
 */
export function getScoreBreakdown(site, targetBody, weights = DEFAULT_WEIGHTS) {
  const baseline = BODY_BASELINES[targetBody];
  const params = site.analog_params;

  return Object.keys(baseline).map((key) => {
    const earthVal = params[key] ?? 5;
    const targetVal = baseline[key];
    const w = weights[key] ?? 5;
    const diff = Math.abs(earthVal - targetVal) / 10;
    const contribution = w * (1 - diff);
    return {
      param: key,
      label: PARAM_LABELS[key],
      icon: PARAM_ICONS[key],
      earthValue: earthVal,
      targetValue: targetVal,
      weight: w,
      contribution: Math.round(contribution * 10) / 10,
      similarity: Math.round((1 - diff) * 100),
    };
  });
}

/**
 * Radar chart data for recharts RadarChart
 */
export function getRadarData(site, targetBody) {
  const baseline = BODY_BASELINES[targetBody];
  const params = site.analog_params;
  return Object.keys(baseline).map((key) => ({
    subject: PARAM_LABELS[key],
    [site.name]: params[key] ?? 0,
    [targetBody === 'moon' ? 'Moon' : 'Mars']: baseline[key],
    fullMark: 10,
  }));
}
