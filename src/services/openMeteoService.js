import axios from 'axios';

const BASE = 'https://archive-api.open-meteo.com/v1/archive';
const ELEV_BASE = 'https://api.open-meteo.com/v1/elevation';

/**
 * Fetch one year of daily climate data for a lat/lon coordinate.
 * No API key required.
 */
export const fetchClimateData = async (lat, lon) => {
  const endDate = new Date();
  endDate.setFullYear(endDate.getFullYear() - 1);
  const startDate = new Date(endDate);
  startDate.setFullYear(startDate.getFullYear() - 1);

  const fmt = (d) => d.toISOString().split('T')[0];

  try {
    const res = await axios.get(BASE, {
      params: {
        latitude: lat,
        longitude: lon,
        start_date: fmt(startDate),
        end_date: fmt(endDate),
        daily: [
          'temperature_2m_max',
          'temperature_2m_min',
          'precipitation_sum',
          'shortwave_radiation_sum',
          'relative_humidity_2m_min',
        ].join(','),
        timezone: 'UTC',
      },
    });

    const d = res.data.daily;
    const temps = d.temperature_2m_max.filter((v) => v !== null);
    const tempsMin = d.temperature_2m_min.filter((v) => v !== null);
    const precip = d.precipitation_sum.filter((v) => v !== null);
    const rad = d.shortwave_radiation_sum.filter((v) => v !== null);
    const rh = d.relative_humidity_2m_min.filter((v) => v !== null);

    return {
      raw: d,
      summary: {
        temp_max_c: Math.max(...temps),
        temp_min_c: Math.min(...tempsMin),
        temp_mean_c: temps.reduce((a, b) => a + b, 0) / temps.length,
        diurnal_delta_c:
          temps.reduce((a, b) => a + b, 0) / temps.length -
          tempsMin.reduce((a, b) => a + b, 0) / tempsMin.length,
        annual_precip_mm: precip.reduce((a, b) => a + b, 0),
        mean_solar_mj: rad.reduce((a, b) => a + b, 0) / rad.length,
        min_rh_pct: Math.min(...rh),
      },
    };
  } catch (e) {
    console.warn('Open-Meteo climate fetch failed:', e.message);
    return null;
  }
};

/**
 * Fetch elevation for multiple coordinates (global, no key required)
 */
export const fetchElevationGlobal = async (lats, lons) => {
  try {
    const res = await axios.get(ELEV_BASE, {
      params: {
        latitude: lats.join(','),
        longitude: lons.join(','),
      },
    });
    return res.data.elevation;
  } catch (e) {
    console.warn('Elevation fetch failed');
    return null;
  }
};
