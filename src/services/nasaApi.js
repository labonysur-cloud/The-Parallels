import axios from 'axios';

const NASA_API_BASE = 'https://api.nasa.gov';

const getApiKey = () =>
  localStorage.getItem('nasa_api_key') || 'DEMO_KEY';

export const fetchAPOD = async () => {
  try {
    const res = await axios.get(`${NASA_API_BASE}/planetary/apod`, {
      params: { api_key: getApiKey() },
    });
    return res.data;
  } catch (e) {
    console.warn('APOD fetch failed, using fallback');
    return {
      title: 'The Blue Marble',
      explanation:
        'Earth — our home planet, and the starting point for finding places that echo the surfaces of the Moon and Mars.',
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/The_Earth_seen_from_Apollo_17.jpg/1280px-The_Earth_seen_from_Apollo_17.jpg',
      hdurl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/The_Earth_seen_from_Apollo_17.jpg/1280px-The_Earth_seen_from_Apollo_17.jpg',
      date: new Date().toISOString().split('T')[0],
      media_type: 'image',
    };
  }
};

export const fetchMarsRoverPhotos = async (sol = 3500, camera = 'NAVCAM') => {
  try {
    const res = await axios.get(
      `${NASA_API_BASE}/mars-photos/api/v1/rovers/curiosity/photos`,
      {
        params: { sol, camera, api_key: getApiKey(), page: 1 },
      }
    );
    return res.data.photos?.slice(0, 6) || [];
  } catch (e) {
    console.warn('Mars rover fetch failed');
    return [];
  }
};

export const fetchMarsLatestPhotos = async () => {
  try {
    const res = await axios.get(
      `${NASA_API_BASE}/mars-photos/api/v1/rovers/curiosity/latest_photos`,
      { params: { api_key: getApiKey() } }
    );
    return res.data.latest_photos?.slice(0, 4) || [];
  } catch (e) {
    console.warn('Mars latest photos fetch failed');
    return [];
  }
};
