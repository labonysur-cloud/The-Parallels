import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { EARTH_LAYERS } from '../services/gibsService';

// Custom glowing marker
const createIcon = (score) => {
  const color = score >= 80 ? '#22c55e' : score >= 65 ? '#eab308' : '#ef4444';
  return new L.DivIcon({
    className: 'custom-analog-marker',
    html: `<div style="
      width: 16px; 
      height: 16px; 
      background: ${color}; 
      border: 2px solid white; 
      border-radius: 50%;
      box-shadow: 0 0 15px ${color};
    "></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  });
};

function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 5, { duration: 1.5 });
    }
  }, [center, map]);
  return null;
}

export default function EarthMap({ sites, selectedSite, onSelect }) {
  return (
    <MapContainer 
      center={[20, 0]} 
      zoom={2} 
      className="w-full h-full rounded-2xl border border-white/10 shadow-2xl z-0"
      zoomControl={false}
    >
      <TileLayer
        url={EARTH_LAYERS.trueColor.url}
        attribution={EARTH_LAYERS.trueColor.attribution}
        maxZoom={EARTH_LAYERS.trueColor.maxZoom}
      />
      
      {sites.map(site => (
        <Marker 
          key={site.id} 
          position={[site.lat, site.lon]} 
          icon={createIcon(site.computedScore)}
          eventHandlers={{ click: () => onSelect(site) }}
        >
          {(!selectedSite || selectedSite.id !== site.id) && (
             <Popup closeButton={false} offset={[0, -10]}>
               <div className="font-bold text-sm text-center">{site.name}</div>
               <div className="text-xs text-center text-nasa-light">{site.computedScore}% Analogue</div>
             </Popup>
          )}
        </Marker>
      ))}
      
      {selectedSite && <MapUpdater center={[selectedSite.lat, selectedSite.lon]} />}
    </MapContainer>
  );
}
