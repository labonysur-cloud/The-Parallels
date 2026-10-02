/**
 * NASA GIBS (Global Imagery Browse Services) WMTS tile layer configurations.
 * All endpoints are publicly accessible — no API key required.
 * Docs: https://nasa-gibs.github.io/gibs-api-docs/
 */

const GIBS_BASE = 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best';

export const EARTH_LAYERS = {
  trueColor: {
    id: 'trueColor',
    label: 'True Color',
    url: `${GIBS_BASE}/VIIRS_SNPP_CorrectedReflectance_TrueColor/default/2024-01-01/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg`,
    attribution: 'NASA GIBS / VIIRS SNPP True Color',
    maxZoom: 9,
  },
  falseColor: {
    id: 'falseColor',
    label: 'False Color (Vegetation)',
    url: `${GIBS_BASE}/VIIRS_SNPP_CorrectedReflectance_BandsM11-I2-I1/default/2024-01-01/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg`,
    attribution: 'NASA GIBS / VIIRS SNPP False Color',
    maxZoom: 9,
  },
  surfaceTemp: {
    id: 'surfaceTemp',
    label: 'Surface Temperature',
    url: `${GIBS_BASE}/MODIS_Terra_Land_Surface_Temp_Day/default/2024-01-01/GoogleMapsCompatible_Level7/{z}/{y}/{x}.png`,
    attribution: 'NASA GIBS / MODIS Terra LST Day',
    maxZoom: 7,
    opacity: 0.75,
  },
  elevation: {
    id: 'elevation',
    label: 'Elevation (Shaded Relief)',
    url: `${GIBS_BASE}/ASTER_GDEM_Greyscale_Shaded_Relief/default/2000-01-01/GoogleMapsCompatible_Level8/{z}/{y}/{x}.jpg`,
    attribution: 'NASA GIBS / ASTER GDEM Shaded Relief',
    maxZoom: 8,
  },
  nightLights: {
    id: 'nightLights',
    label: 'Night Lights',
    url: `${GIBS_BASE}/VIIRS_Black_Marble_SqKm/default/2016-01-01/GoogleMapsCompatible_Level8/{z}/{y}/{x}.jpg`,
    attribution: 'NASA GIBS / Black Marble Night Lights',
    maxZoom: 8,
  },
};

export const defaultEarthLayer = EARTH_LAYERS.trueColor;
