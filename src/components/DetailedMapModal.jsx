import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { X } from 'lucide-react';
import L from 'leaflet';

// Fix for standard leaflet marker icons in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function DetailedMapModal({ site, onClose }) {
  if (!site) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 md:p-12 animate-in fade-in duration-300">
      <div className="relative w-full h-full max-w-7xl max-h-[85vh] bg-space-950 border border-white/20 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,1)] flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center p-5 bg-black/60 border-b border-white/10 shrink-0 z-10">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-nasa-light animate-pulse shadow-[0_0_10px_#38bdf8]"></span>
              High-Resolution Satellite Feed: {site.name}
            </h2>
            <p className="text-xs text-gray-400 uppercase tracking-widest mt-1 ml-5">
              {site.country} • Lat: {site.lat}° | Lon: {site.lon}°
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-3 bg-white/5 hover:bg-nasa-red/20 text-gray-300 hover:text-nasa-red rounded-full transition-all border border-transparent hover:border-nasa-red/50"
          >
            <X size={24} />
          </button>
        </div>

        {/* Map Container */}
        <div className="flex-1 w-full bg-black relative">
          <MapContainer 
            center={[site.lat, site.lon]} 
            zoom={13} 
            style={{ width: '100%', height: '100%' }}
            zoomControl={false}
          >
            {/* Esri World Imagery - The gold standard for clear satellite data */}
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution='&copy; <a href="https://www.esri.com/">Esri</a>, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
              maxZoom={18}
            />
            <ZoomControl position="bottomright" />
            <Marker position={[site.lat, site.lon]}>
              <Popup className="custom-popup">
                <div className="font-bold text-base">{site.name}</div>
                <div className="text-nasa-blue font-bold">Analog Match: {site.computedScore}%</div>
              </Popup>
            </Marker>
          </MapContainer>
        </div>
        
      </div>
    </div>
  );
}
