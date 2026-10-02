/**
 * NASA Solar System Treks WMTS tile service configurations.
 * No API key required. Tiles served directly from trek.nasa.gov.
 * Docs: https://trek.nasa.gov
 */

const TREK = 'https://trek.nasa.gov/tiles';

export const MOON_LAYERS = {
  wac: {
    id: 'wac',
    label: 'LRO WAC Global Mosaic',
    url: `${TREK}/Moon/EQ/LRO_WAC_Mosaic_Global_303ppd_v02/1.0.0/default/default028mm/{z}/{y}/{x}.jpg`,
    attribution: 'NASA LROC WAC Global Mosaic v2 | trek.nasa.gov',
    maxZoom: 6,
    minZoom: 1,
  },
  lolaHillshade: {
    id: 'lolaHillshade',
    label: 'LOLA Colorized Hillshade',
    url: `${TREK}/Moon/EQ/LRO_LOLA_Shade_Global_128ppd_v04/1.0.0/default/default028mm/{z}/{y}/{x}.jpg`,
    attribution: 'NASA LOLA Hillshade | trek.nasa.gov',
    maxZoom: 6,
    minZoom: 1,
  },
  lolaElevation: {
    id: 'lolaElevation',
    label: 'LOLA Elevation (Color)',
    url: `${TREK}/Moon/EQ/LRO_LOLA_ClrShade_Global_128ppd_v04/1.0.0/default/default028mm/{z}/{y}/{x}.jpg`,
    attribution: 'NASA LOLA Color Elevation | trek.nasa.gov',
    maxZoom: 6,
    minZoom: 1,
  },
};

export const MARS_LAYERS = {
  viking: {
    id: 'viking',
    label: 'Viking MDIM Global Mosaic',
    url: `${TREK}/Mars/EQ/Viking_MDIM21_Global_mpp/1.0.0/default/default028mm/{z}/{y}/{x}.jpg`,
    attribution: 'NASA Viking MDIM 2.1 | trek.nasa.gov',
    maxZoom: 6,
    minZoom: 1,
  },
  molaHillshade: {
    id: 'molaHillshade',
    label: 'MOLA Hillshade',
    url: `${TREK}/Mars/EQ/MOLA_Shade_Global_mpp/1.0.0/default/default028mm/{z}/{y}/{x}.jpg`,
    attribution: 'NASA MOLA Hillshade | trek.nasa.gov',
    maxZoom: 6,
    minZoom: 1,
  },
  molaElevation: {
    id: 'molaElevation',
    label: 'MOLA Color Elevation',
    url: `${TREK}/Mars/EQ/MOLA_Color_Global_mpp/1.0.0/default/default028mm/{z}/{y}/{x}.jpg`,
    attribution: 'NASA MOLA Color Elevation | trek.nasa.gov',
    maxZoom: 6,
    minZoom: 1,
  },
  ctx: {
    id: 'ctx',
    label: 'CTX Panchromatic Mosaic',
    url: `${TREK}/Mars/EQ/MRO_CTX_Mosaic_Global_6m/1.0.0/default/default028mm/{z}/{y}/{x}.jpg`,
    attribution: 'NASA MRO CTX Global Mosaic | trek.nasa.gov',
    maxZoom: 7,
    minZoom: 1,
  },
};

export const defaultMoonLayer = MOON_LAYERS.wac;
export const defaultMarsLayer = MARS_LAYERS.viking;
