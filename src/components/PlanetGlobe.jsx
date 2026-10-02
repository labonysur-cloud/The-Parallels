import { useEffect, useRef, useState } from 'react';
import Globe from 'react-globe.gl';

const TEXTURES = {
  earth: 'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
  bumpMap: 'https://unpkg.com/three-globe/example/img/earth-topology.png',
  background: 'https://unpkg.com/three-globe/example/img/night-sky.png'
};

export default function PlanetGlobe({ sites, selectedSite, onSelect, onDeepDive }) {
  const globeEl = useRef();
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handleResize = () => setDimensions({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    
    if (globeEl.current) {
      globeEl.current.controls().autoRotate = true;
      globeEl.current.controls().autoRotateSpeed = 0.5;
    }
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (selectedSite && globeEl.current) {
      globeEl.current.controls().autoRotate = false;
      globeEl.current.pointOfView({ lat: selectedSite.lat, lng: selectedSite.lon, altitude: 1.4 }, 1500);
    } else if (!selectedSite && globeEl.current) {
      globeEl.current.controls().autoRotate = true;
      globeEl.current.pointOfView({ altitude: 2.5 }, 1500);
    }
  }, [selectedSite]);

  return (
    <Globe
      ref={globeEl}
      width={dimensions.width}
      height={dimensions.height}
      globeImageUrl={TEXTURES.earth}
      bumpImageUrl={TEXTURES.bumpMap}
      backgroundImageUrl={TEXTURES.background}
      
      ringsData={selectedSite ? [selectedSite] : []}
      ringLat={d => d.lat}
      ringLng={d => d.lon}
      ringColor={d => d.computedScore >= 80 ? '#22c55e' : d.computedScore >= 65 ? '#eab308' : '#ef4444'}
      ringMaxRadius={4}
      ringPropagationSpeed={2}
      ringRepeatPeriod={800}

      htmlElementsData={sites}
      htmlElement={d => {
        const el = document.createElement('div');
        const isSelected = selectedSite?.id === d.id;
        const color = d.computedScore >= 80 ? '#22c55e' : d.computedScore >= 65 ? '#eab308' : '#ef4444';
        
        // Ensure the outer element can receive pointer events
        el.style.pointerEvents = 'auto';
        el.style.cursor = 'pointer';
        
        el.innerHTML = `
          <div style="
            display: flex;
            flex-direction: column;
            align-items: center;
            transform: translate(-50%, -50%);
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            padding: 20px; /* Larger hit area */
          ">
            <div style="
              width: ${isSelected ? '28px' : '16px'};
              height: ${isSelected ? '28px' : '16px'};
              background: ${color};
              border: ${isSelected ? '4px' : '2px'} solid white;
              border-radius: 50%;
              box-shadow: 0 0 ${isSelected ? '40px' : '15px'} ${color};
              transition: all 0.4s ease;
            "></div>
            ${isSelected ? `
              <div style="
                color: white; 
                font-family: 'Space Grotesk', sans-serif;
                font-weight: 700; 
                font-size: 14px;
                margin-top: 12px; 
                text-shadow: 0 2px 10px rgba(0,0,0,0.8); 
                white-space: nowrap;
                background: rgba(0,0,0,0.5);
                padding: 4px 12px;
                border-radius: 100px;
                border: 1px solid rgba(255,255,255,0.2);
                backdrop-filter: blur(4px);
                display: flex;
                flex-direction: column;
                align-items: center;
              ">
                <div>${d.name} <span style="color: ${color}; margin-left: 4px;">${d.computedScore}%</span></div>
                <div style="font-size: 9px; color: #38bdf8; margin-top: 3px; text-transform: uppercase; letter-spacing: 1px; font-weight: 900; animation: pulse 2s infinite;">► Click for High-Res Map</div>
              </div>
            ` : ''}
          </div>
        `;
        
        // Use pointerdown/click and stop propagation to prevent globe from swallowing the event
        const handleInteraction = (e) => {
          e.stopPropagation();
          e.preventDefault();
          if (isSelected && onDeepDive) {
            onDeepDive(d);
          } else if (onSelect) {
            onSelect(d);
          }
        };

        el.onpointerdown = handleInteraction;
        el.onclick = handleInteraction;
        
        return el;
      }}
      
      atmosphereColor="#38bdf8"
      atmosphereAltitude={0.15}
    />
  );
}
