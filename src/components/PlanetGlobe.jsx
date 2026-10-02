import { useEffect, useRef, useState, useCallback } from 'react';
import Globe from 'react-globe.gl';

const TEXTURES = {
  earth: 'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
  bumpMap: 'https://unpkg.com/three-globe/example/img/earth-topology.png',
  background: 'https://unpkg.com/three-globe/example/img/night-sky.png'
};

export default function PlanetGlobe({ sites, selectedSite, onSelect, onDeepDive }) {
  const globeEl = useRef();
  const frameRef = useRef();
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [markerPositions, setMarkerPositions] = useState([]);

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

  // Project lat/lng to screen coordinates on every animation frame
  const updateMarkers = useCallback(() => {
    if (globeEl.current && sites.length) {
      const newPositions = sites.map(site => {
        try {
          const coords = globeEl.current.getScreenCoords(site.lat, site.lon, 0.01);
          return { id: site.id, x: coords.x, y: coords.y };
        } catch {
          return { id: site.id, x: -9999, y: -9999 };
        }
      });
      setMarkerPositions(newPositions);
    }
    frameRef.current = requestAnimationFrame(updateMarkers);
  }, [sites]);

  useEffect(() => {
    frameRef.current = requestAnimationFrame(updateMarkers);
    return () => cancelAnimationFrame(frameRef.current);
  }, [updateMarkers]);

  const getColor = (score) => score >= 80 ? '#22c55e' : score >= 65 ? '#eab308' : '#ef4444';

  return (
    <div style={{ position: 'relative', width: dimensions.width, height: dimensions.height }}>

      {/* Globe — kept with full pointer events for drag-rotate */}
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
        ringColor={d => getColor(d.computedScore)}
        ringMaxRadius={4}
        ringPropagationSpeed={2}
        ringRepeatPeriod={800}
        atmosphereColor="#38bdf8"
        atmosphereAltitude={0.15}
      />

      {/* Markers overlay — sits above the Globe canvas */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {sites.map(site => {
          const pos = markerPositions.find(p => p.id === site.id);
          if (!pos || pos.x < 0) return null;
          const isSelected = selectedSite?.id === site.id;
          const color = getColor(site.computedScore);

          return (
            <button
              key={site.id}
              onClick={() => {
                if (isSelected && onDeepDive) onDeepDive(site);
                else if (onSelect) onSelect(site);
              }}
              style={{
                position: 'absolute',
                left: pos.x,
                top: pos.y,
                transform: 'translate(-50%, -50%)',
                background: 'transparent',
                border: 'none',
                padding: '16px',           // large hit area
                cursor: 'pointer',
                pointerEvents: 'auto',
                zIndex: isSelected ? 50 : 20,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              {/* Glowing dot */}
              <div style={{
                width: isSelected ? 24 : 13,
                height: isSelected ? 24 : 13,
                borderRadius: '50%',
                background: color,
                border: `${isSelected ? 3 : 2}px solid white`,
                boxShadow: `0 0 ${isSelected ? 32 : 12}px ${color}`,
                transition: 'all 0.3s ease',
              }} />

              {/* Label + CTA — only when selected */}
              {isSelected && (
                <div style={{
                  marginTop: 10,
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontWeight: 700,
                  fontSize: 13,
                  color: 'white',
                  whiteSpace: 'nowrap',
                  background: 'rgba(0,0,0,0.65)',
                  padding: '6px 14px',
                  borderRadius: 100,
                  border: '1px solid rgba(255,255,255,0.25)',
                  backdropFilter: 'blur(8px)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  userSelect: 'none',
                }}>
                  <span>
                    {site.name}&nbsp;
                    <span style={{ color }}>{site.computedScore}%</span>
                  </span>
                  <span style={{
                    fontSize: 9,
                    color: '#38bdf8',
                    textTransform: 'uppercase',
                    letterSpacing: 1.5,
                    fontWeight: 900,
                  }}>
                    Click to open High-Res Map
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>

    </div>
  );
}
