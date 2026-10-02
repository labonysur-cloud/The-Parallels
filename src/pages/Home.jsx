import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Globe, Crosshair, Radar } from 'lucide-react';

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
    <div className="min-h-screen bg-space-950 text-white starfield flex flex-col items-center justify-center p-6">
      
      <AnimatePresence mode="wait">
        {!scanning ? (
          <motion.div 
            key="menu"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="max-w-3xl w-full text-center space-y-12"
          >
            <div className="space-y-4">
              <h1 className="text-6xl font-heading font-bold text-transparent bg-clip-text bg-gradient-to-r from-nasa-light to-white tracking-tight">
                THE PARALLEL
              </h1>
              <p className="text-xl text-muted font-light max-w-2xl mx-auto">
                An explainable decision-support system that identifies Earth environments suitable for specific lunar and Martian mission preparation tasks.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 pt-8">
              {/* Mars Mission Card */}
              <div className="glass p-8 rounded-2xl border border-white/10 hover:border-nasa-red/50 transition-all group relative overflow-hidden">
                <div className="absolute inset-0 bg-nasa-red/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10 flex flex-col items-center space-y-6">
                  <div className="p-4 bg-nasa-red/20 rounded-full text-nasa-red">
                    <Rocket size={40} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Human Mars EVA</h2>
                    <p className="text-sm text-muted">14-day geological exploration & rover testing</p>
                  </div>
                  <button 
                    onClick={() => startScan('mars')}
                    className="w-full py-4 bg-nasa-red hover:bg-red-600 text-white rounded-xl font-bold tracking-wide transition-colors flex items-center justify-center gap-2"
                  >
                    <Radar size={20} />
                    FIND MY MARS
                  </button>
                </div>
              </div>

              {/* Moon Mission Card */}
              <div className="glass p-8 rounded-2xl border border-white/10 hover:border-nasa-light/50 transition-all group relative overflow-hidden">
                <div className="absolute inset-0 bg-nasa-light/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10 flex flex-col items-center space-y-6">
                  <div className="p-4 bg-nasa-light/20 rounded-full text-nasa-light">
                    <Globe size={40} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Lunar Base Camp</h2>
                    <p className="text-sm text-muted">Polar crater exploration & dust environment testing</p>
                  </div>
                  <button 
                    onClick={() => startScan('moon')}
                    className="w-full py-4 bg-nasa-light hover:bg-blue-400 text-space-950 rounded-xl font-bold tracking-wide transition-colors flex items-center justify-center gap-2"
                  >
                    <Crosshair size={20} />
                    FIND MY MOON
                  </button>
                </div>
              </div>
            </div>
            
            <p className="text-xs text-muted/60 pt-12 uppercase tracking-widest">
              No Earth location is another planet. It is an analogue.
            </p>
          </motion.div>
        ) : (
          <motion.div 
            key="scanning"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center max-w-md w-full space-y-8"
          >
            <div className="relative w-48 h-48">
              <Globe size={192} className="text-nasa-light animate-pulse-slow" strokeWidth={1} />
              <motion.div 
                className="absolute inset-0 border-t-2 border-nasa-light rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              />
            </div>
            
            <div className="w-full space-y-4 text-center">
              <h3 className="text-2xl font-bold text-nasa-light font-heading h-8">
                {scanText}
              </h3>
              
              <div className="h-2 w-full bg-space-800 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-nasa-blue to-nasa-light"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              
              <div className="text-left font-mono text-xs text-nasa-light/70 space-y-1 opacity-80">
                <p>{progress > 10 ? 'Terrain ........ ✓' : 'Terrain ........ pending'}</p>
                <p>{progress > 30 ? 'Climate ........ ✓' : 'Climate ........ pending'}</p>
                <p>{progress > 50 ? 'Geology ........ ✓' : 'Geology ........ pending'}</p>
                <p>{progress > 70 ? 'Dryness ........ ✓' : 'Dryness ........ pending'}</p>
                <p>{progress > 85 ? 'Isolation ...... ✓' : 'Isolation ...... pending'}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
