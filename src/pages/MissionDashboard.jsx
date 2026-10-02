import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import sitesData from '../data/analog-sites.json';
import { rankAllSites } from '../services/scoringEngine';
import PlanetGlobe from '../components/PlanetGlobe';
import AnalogReport from '../components/AnalogReport';
import DetailedMapModal from '../components/DetailedMapModal';
import ASTRAChat from '../components/ASTRAChat';
import { ChevronLeft, SlidersHorizontal, Rocket, Globe, Satellite } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MissionDashboard() {
  const [searchParams] = useSearchParams();
  const [target, setTarget] = useState(searchParams.get('target') || 'mars');
  const [rankedSites, setRankedSites] = useState([]);
  const [selectedSite, setSelectedSite] = useState(null);
  const [showDetailedMap, setShowDetailedMap] = useState(false);
  const [showASTRA, setShowASTRA] = useState(false);

  useEffect(() => {
    const ranked = rankAllSites(sitesData, target);
    setRankedSites(ranked);
    setSelectedSite(ranked[0]); 
  }, [target]);

  return (
    <div className="w-screen h-screen bg-space-950 text-white overflow-hidden font-body relative">
      
      <div className="absolute inset-0 z-0">
        <PlanetGlobe 
          targetBody={target}
          sites={rankedSites} 
          selectedSite={selectedSite} 
          onSelect={setSelectedSite} 
          onDeepDive={() => setShowDetailedMap(true)}
        />
      </div>

      <div className="absolute inset-0 z-10 pointer-events-none flex justify-between p-6">
        
        <motion.div 
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="w-[400px] h-full flex flex-col pointer-events-auto bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden"
        >
          <div className="p-6 border-b border-white/10 bg-gradient-to-b from-white/5 to-transparent flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-nasa-light hover:text-white transition-colors">
              <ChevronLeft size={20} />
              <span className="font-bold text-xs tracking-widest font-heading uppercase">Abort Mission</span>
            </Link>
            <div className="flex bg-black/50 border border-white/10 rounded-full p-1">
              <button 
                onClick={() => setTarget('moon')}
                className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition-all ${target === 'moon' ? 'bg-nasa-light text-space-950 shadow-[0_0_15px_#38bdf8]' : 'text-gray-400 hover:text-white'}`}
              >
                <Globe size={14} /> MOON
              </button>
              <button 
                onClick={() => setTarget('mars')}
                className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition-all ${target === 'mars' ? 'bg-nasa-red text-white shadow-[0_0_15px_#FC3D21]' : 'text-gray-400 hover:text-white'}`}
              >
                <Rocket size={14} /> MARS
              </button>
            </div>
          </div>

          <div className="p-6 border-b border-white/10 bg-black/20">
            <h2 className="text-[10px] uppercase tracking-widest text-nasa-light mb-2 flex items-center justify-between font-bold">
              Mission Profile <SlidersHorizontal size={14} />
            </h2>
            <div className="font-bold text-2xl font-heading">
              {target === 'mars' ? 'Human Mars EVA' : 'Lunar Base Camp'}
            </div>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              Identifying terrestrial analogs based on {target === 'mars' ? 'Martian' : 'Lunar'} environmental and geological parameters.
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 px-2">Ranked Analogues</div>
            
            <AnimatePresence>
              {rankedSites.map((site, index) => (
                <motion.button
                  key={site.id}
                  layout
                  onClick={() => setSelectedSite(site)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all ${
                    selectedSite?.id === site.id 
                    ? target === 'mars' ? 'bg-nasa-red/20 border-nasa-red shadow-[0_0_20px_rgba(252,61,33,0.2)]' : 'bg-nasa-light/20 border-nasa-light shadow-[0_0_20px_rgba(56,189,248,0.2)]'
                    : 'bg-black/40 border-white/5 hover:border-white/20 hover:bg-white/5'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] font-mono font-bold text-gray-500">#{index + 1}</span>
                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${
                      site.computedScore >= 80 ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                      site.computedScore >= 65 ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                      'bg-red-500/20 text-red-400 border-red-500/30'
                    }`}>
                      {site.computedScore}% MATCH
                    </span>
                  </div>
                  <h3 className="font-bold text-lg leading-tight tracking-tight">{site.name}</h3>
                  <div className="text-xs text-gray-400 mt-2 truncate flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-nasa-light animate-pulse"></span> {site.country}
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>

        <div className="absolute top-6 left-1/2 -translate-x-1/2 pointer-events-none">
          <div className="bg-black/50 backdrop-blur-xl border border-white/20 px-8 py-3 rounded-full shadow-[0_0_30px_rgba(0,0,0,0.8)] flex items-center gap-4">
            <span className={`w-2 h-2 rounded-full animate-pulse ${target === 'mars' ? 'bg-nasa-red' : 'bg-nasa-light'}`}></span>
            <span className="text-xs font-bold tracking-widest uppercase">Target: {target}</span>
          </div>
        </div>

        <motion.div 
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="w-[450px] h-full flex flex-col pointer-events-auto bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden"
        >
          {selectedSite ? (
            <AnalogReport site={selectedSite} targetBody={target} />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500 p-12 text-center text-sm">
              Select an analogue location to initiate environmental analysis.
            </div>
          )}
        </motion.div>

      </div>

      {/* Conditionally render the Detailed Map Modal */}
      {showDetailedMap && (
        <DetailedMapModal 
          site={selectedSite} 
          onClose={() => setShowDetailedMap(false)} 
        />
      )}

      {/* ASTRA Floating Chat Button */}
      <AnimatePresence>
        {!showASTRA && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setShowASTRA(true)}
            className="fixed bottom-6 right-6 z-[150] w-14 h-14 rounded-full bg-nasa-light text-space-950 shadow-[0_0_30px_rgba(56,189,248,0.5)] flex items-center justify-center hover:scale-110 transition-transform"
          >
            <Satellite size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ASTRA Chat Panel */}
      <AnimatePresence>
        {showASTRA && <ASTRAChat onClose={() => setShowASTRA(false)} />}
      </AnimatePresence>
    </div>
  );
}
