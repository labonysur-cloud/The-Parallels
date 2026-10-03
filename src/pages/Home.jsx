import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Globe from 'react-globe.gl';
import * as THREE from 'three';

const MARS_TEXTURE = 'https://upload.wikimedia.org/wikipedia/commons/4/46/Solarsystemscope_texture_2k_mars.jpg';
const MOON_TEXTURE = 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Solarsystemscope_texture_8k_moon.jpg/2048px-Solarsystemscope_texture_8k_moon.jpg';

function FloatingPlanet({ texture, atmosphereColor, name, description, onClick }) {
  const globeEl = useRef();
  const [hovered, setHovered] = useState(false);
  const size = 380; // Increased size
  
  useEffect(() => {
    if (globeEl.current) {
      globeEl.current.controls().autoRotate = true;
      globeEl.current.controls().autoRotateSpeed = hovered ? 4.0 : 1.5;
      globeEl.current.controls().enableZoom = false;
      globeEl.current.controls().enablePan = false;
      globeEl.current.controls().enableRotate = false;

      // Fully illuminate the globe to remove the dark shadow
      const scene = globeEl.current.scene();
      if (scene) {
        const hasAmbientLight = scene.children.some(c => c.type === 'AmbientLight' && c.name === 'fullIllumination');
        if (!hasAmbientLight) {
          const light = new THREE.AmbientLight(0xffffff, 2.5);
          light.name = 'fullIllumination';
          scene.add(light);
        }
      }
    }
  }, [hovered]);

  return (
    <motion.div 
      className="flex flex-col items-center justify-center space-y-8 cursor-pointer group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* 3D Planet */}
      <div className={`w-[380px] h-[380px] rounded-full flex items-center justify-center transition-all duration-700 ${hovered ? 'shadow-[0_0_100px_rgba(255,255,255,0.15)]' : 'shadow-none'}`}>
        <Globe
          ref={globeEl}
          width={size}
          height={size}
          globeImageUrl={texture}
          atmosphereColor={atmosphereColor}
          atmosphereAltitude={0.15}
          backgroundColor="rgba(0,0,0,0)"
        />
      </div>

      {/* Minimalistic Typography */}
      <div className="text-center space-y-3 opacity-70 group-hover:opacity-100 transition-opacity duration-500">
        <h2 className="text-4xl font-heading font-light tracking-[0.2em] text-white uppercase">
          {name}
        </h2>
        <p className="text-xs font-mono text-neutral-400 tracking-widest uppercase max-w-[200px] mx-auto">
          {description}
        </p>
        
        {/* Sleek Line Indicator */}
        <div className="w-0 h-[1px] bg-white mx-auto group-hover:w-12 transition-all duration-700 ease-out mt-4"></div>
      </div>
    </motion.div>
  );
}

export default function Home() {
  const [scanning, setScanning] = useState(false);
  const [scanText, setScanText] = useState('');
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  const startScan = (target) => {
    setScanning(true);
    setScanText('INITIALIZING ORBITAL SCAN');
    
    setTimeout(() => { setScanText('SCANNING EARTH TOPOGRAPHY'); setProgress(25); }, 800);
    setTimeout(() => { setScanText('1,248 CANDIDATE REGIONS FOUND'); setProgress(50); }, 1800);
    setTimeout(() => { setScanText(`ANALYZING FEATURES FOR ${target.toUpperCase()}`); setProgress(75); }, 2800);
    setTimeout(() => { setScanText('COMPARING PLANETARY PARAMETERS'); setProgress(90); }, 3800);
    setTimeout(() => { setScanText('BEST ANALOGUES FOUND'); setProgress(100); }, 4800);
    
    setTimeout(() => {
      navigate(`/dashboard?target=${target}`);
    }, 6000);
  };

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden selection:bg-white/20">
      
      {/* Absolute minimal background */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neutral-900/20 via-black to-black"></div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-between py-12 px-6">
        
        <AnimatePresence mode="wait">
          {!scanning ? (
            <motion.div 
              key="menu"
              initial={{ opacity: 0, filter: 'blur(10px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
              transition={{ duration: 1 }}
              className="flex flex-col items-center justify-between w-full h-full min-h-[85vh]"
            >
              {/* Header */}
              <div className="text-center space-y-6 mt-8">
                <h1 className="text-6xl md:text-8xl font-heading font-thin tracking-tighter text-white">
                  THE PARALLEL
                </h1>
                <p className="text-sm md:text-base text-neutral-500 font-light max-w-xl mx-auto tracking-widest leading-relaxed">
                  IDENTIFYING EARTH ENVIRONMENTS FOR LUNAR AND MARTIAN MISSION PREPARATION
                </p>
              </div>

              {/* Planets Section */}
              <div className="flex flex-col md:flex-row items-center justify-center gap-16 md:gap-32 w-full flex-grow">
                
                <FloatingPlanet 
                  name="Mars" 
                  description="Geological exploration & rover testing"
                  texture={MARS_TEXTURE}
                  atmosphereColor="#FC3D21"
                  onClick={() => startScan('mars')}
                />

                <div className="hidden md:block w-[1px] h-32 bg-gradient-to-b from-transparent via-neutral-800 to-transparent"></div>

                <FloatingPlanet 
                  name="Moon" 
                  description="Polar crater & dust environment testing"
                  texture={MOON_TEXTURE}
                  atmosphereColor="#ffffff"
                  onClick={() => startScan('moon')}
                />

              </div>
              
              {/* Footer */}
              <p className="text-[10px] text-neutral-600 uppercase tracking-[0.3em] font-mono mb-4">
                No Earth location is another planet. It is an analogue.
              </p>
            </motion.div>
          ) : (
            <motion.div 
              key="scanning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-[80vh] w-full max-w-2xl space-y-16"
            >
              {/* Scanning visual */}
              <div className="relative flex items-center justify-center w-full">
                <div className="absolute w-[400px] h-[1px] bg-gradient-to-r from-transparent via-white to-transparent animate-pulse"></div>
                <div className="w-[1px] h-[400px] bg-gradient-to-b from-transparent via-white to-transparent animate-pulse absolute"></div>
                <div className="text-sm font-mono text-white tracking-[0.5em] uppercase z-10 bg-black px-6 py-2 border border-white/10">
                  {scanText}
                </div>
              </div>
              
              <div className="w-full max-w-md space-y-8">
                {/* Minimal Progress Line */}
                <div className="h-[1px] w-full bg-neutral-900 relative">
                  <motion.div 
                    className="absolute top-0 left-0 h-[1px] bg-white shadow-[0_0_10px_#fff]"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                
                {/* Diagnostics */}
                <div className="grid grid-cols-2 gap-x-12 gap-y-4 font-mono text-xs text-neutral-500 uppercase tracking-widest">
                  <p className={`transition-colors duration-500 ${progress > 10 ? 'text-white' : ''}`}>Terrain / {progress > 10 ? 'Matched' : 'Scanning'}</p>
                  <p className={`transition-colors duration-500 text-right ${progress > 30 ? 'text-white' : ''}`}>Climate / {progress > 30 ? 'Matched' : 'Scanning'}</p>
                  <p className={`transition-colors duration-500 ${progress > 50 ? 'text-white' : ''}`}>Geology / {progress > 50 ? 'Matched' : 'Scanning'}</p>
                  <p className={`transition-colors duration-500 text-right ${progress > 70 ? 'text-white' : ''}`}>Dryness / {progress > 70 ? 'Matched' : 'Scanning'}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
