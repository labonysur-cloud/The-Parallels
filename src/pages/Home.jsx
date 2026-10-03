import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Crosshair, Radar } from 'lucide-react';
import Globe from 'react-globe.gl';

const MARS_TEXTURE = 'https://upload.wikimedia.org/wikipedia/commons/0/02/OSIRIS_Mars_true_color.jpg';
const MOON_TEXTURE = 'https://upload.wikimedia.org/wikipedia/commons/e/e1/FullMoon2010.jpg';

// A small, independently rotating 3D globe component for the cards
function MiniGlobe({ texture, atmosphereColor, speed = 2.0 }) {
  const globeEl = useRef();
  
  useEffect(() => {
    if (globeEl.current) {
      globeEl.current.controls().autoRotate = true;
      globeEl.current.controls().autoRotateSpeed = speed;
      globeEl.current.controls().enableZoom = false;
    }
  }, []);

  return (
    <Globe
      ref={globeEl}
      width={160}
      height={160}
      globeImageUrl={texture}
      atmosphereColor={atmosphereColor}
      atmosphereAltitude={0.15}
      backgroundColor="rgba(0,0,0,0)"
    />
  );
}

export default function Home() {
  const [scanning, setScanning] = useState(false);
  const [scanText, setScanText] = useState('');
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  const startScan = (target) => {
    setScanning(true);
    setScanText('Initializing orbital scan...');
    
    setTimeout(() => { setScanText('Scanning Earth...'); setProgress(25); }, 800);
    setTimeout(() => { setScanText('1,248 candidate regions found...'); setProgress(50); }, 1800);
    setTimeout(() => { setScanText(`Analyzing environmental features for ${target.toUpperCase()}...`); setProgress(75); }, 2800);
    setTimeout(() => { setScanText('Comparing planetary parameters...'); setProgress(90); }, 3800);
    setTimeout(() => { setScanText('3 BEST ANALOGUES FOUND!'); setProgress(100); }, 4800);
    
    setTimeout(() => {
      navigate(`/dashboard?target=${target}`);
    }, 6000);
  };

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      
      {/* Deep black aesthetic background with a subtle starfield effect */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neutral-900/40 via-black to-black"></div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
        <AnimatePresence mode="wait">
          {!scanning ? (
            <motion.div 
              key="menu"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-4xl w-full text-center space-y-16"
            >
              <div className="space-y-4 mt-8">
                <h1 className="text-7xl font-heading font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-neutral-500 tracking-tighter drop-shadow-2xl">
                  THE PARALLEL
                </h1>
                <p className="text-lg text-neutral-400 font-light max-w-2xl mx-auto tracking-wide">
                  An explainable decision-support system that identifies Earth environments suitable for specific lunar and Martian mission preparation tasks.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 pt-4">
                {/* Mars Mission Card */}
                <div className="p-8 rounded-3xl border border-neutral-800 hover:border-nasa-red/40 transition-all duration-500 group relative overflow-hidden bg-gradient-to-b from-neutral-900/50 to-black shadow-2xl">
                  <div className="absolute inset-0 bg-nasa-red/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10 flex flex-col items-center space-y-8">
                    
                    {/* 3D Mars Model */}
                    <div className="w-[160px] h-[160px] rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(252,61,33,0.15)] group-hover:shadow-[0_0_60px_rgba(252,61,33,0.3)] transition-shadow duration-500">
                      <MiniGlobe texture={MARS_TEXTURE} atmosphereColor="#FC3D21" speed={2.5} />
                    </div>

                    <div className="space-y-2">
                      <h2 className="text-3xl font-bold text-white tracking-tight">Human Mars EVA</h2>
                      <p className="text-sm text-neutral-400 font-light">14-day geological exploration & rover testing</p>
                    </div>
                    <button 
                      onClick={() => startScan('mars')}
                      className="w-full py-4 bg-nasa-red/10 hover:bg-nasa-red text-nasa-red hover:text-white border border-nasa-red/20 rounded-2xl font-bold tracking-widest transition-all duration-300 flex items-center justify-center gap-3 uppercase text-sm"
                    >
                      <Radar size={18} />
                      FIND MY MARS
                    </button>
                  </div>
                </div>

                {/* Moon Mission Card */}
                <div className="p-8 rounded-3xl border border-neutral-800 hover:border-white/30 transition-all duration-500 group relative overflow-hidden bg-gradient-to-b from-neutral-900/50 to-black shadow-2xl">
                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10 flex flex-col items-center space-y-8">
                    
                    {/* 3D Moon Model */}
                    <div className="w-[160px] h-[160px] rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.1)] group-hover:shadow-[0_0_60px_rgba(255,255,255,0.2)] transition-shadow duration-500">
                      <MiniGlobe texture={MOON_TEXTURE} atmosphereColor="#ffffff" speed={1.5} />
                    </div>

                    <div className="space-y-2">
                      <h2 className="text-3xl font-bold text-white tracking-tight">Lunar Base Camp</h2>
                      <p className="text-sm text-neutral-400 font-light">Polar crater exploration & dust environment testing</p>
                    </div>
                    <button 
                      onClick={() => startScan('moon')}
                      className="w-full py-4 bg-white/5 hover:bg-white text-white hover:text-black border border-white/10 rounded-2xl font-bold tracking-widest transition-all duration-300 flex items-center justify-center gap-3 uppercase text-sm"
                    >
                      <Crosshair size={18} />
                      FIND MY MOON
                    </button>
                  </div>
                </div>
              </div>
              
              <p className="text-xs text-neutral-600 pt-8 uppercase tracking-[0.2em]">
                No Earth location is another planet. It is an analogue.
              </p>
            </motion.div>
          ) : (
            <motion.div 
              key="scanning"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center max-w-md w-full space-y-10 p-12 rounded-3xl bg-neutral-900/30 border border-neutral-800 backdrop-blur-xl"
            >
              <div className="relative w-48 h-48 flex items-center justify-center">
                <MiniGlobe texture={MARS_TEXTURE} atmosphereColor="#38bdf8" speed={6.0} />
                <motion.div 
                  className="absolute inset-0 border-t-2 border-l-2 border-white/40 rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.0, repeat: Infinity, ease: "linear" }}
                />
              </div>
              
              <div className="w-full space-y-6 text-center">
                <h3 className="text-xl font-bold text-white tracking-wide h-8">
                  {scanText}
                </h3>
                
                <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-white"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                
                <div className="text-left font-mono text-xs text-neutral-400 space-y-2 uppercase tracking-wider">
                  <p className="flex justify-between"><span>Terrain</span> <span>{progress > 10 ? '✓' : '...'}</span></p>
                  <p className="flex justify-between"><span>Climate</span> <span>{progress > 30 ? '✓' : '...'}</span></p>
                  <p className="flex justify-between"><span>Geology</span> <span>{progress > 50 ? '✓' : '...'}</span></p>
                  <p className="flex justify-between"><span>Dryness</span> <span>{progress > 70 ? '✓' : '...'}</span></p>
                  <p className="flex justify-between"><span>Isolation</span> <span>{progress > 85 ? '✓' : '...'}</span></p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
