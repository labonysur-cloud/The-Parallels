import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import sitesData from '../data/analog-sites.json';
import { rankAllSites } from '../services/scoringEngine';
import EarthMap from '../components/EarthMap';
import AnalogReport from '../components/AnalogReport';
import { ChevronLeft, SlidersHorizontal, Rocket, Globe } from 'lucide-react';

export default function MissionDashboard() {
  const [searchParams] = useSearchParams();
  const [target, setTarget] = useState(searchParams.get('target') || 'mars');
  const [rankedSites, setRankedSites] = useState([]);
  const [selectedSite, setSelectedSite] = useState(null);

  // Re-rank sites when target body changes
  useEffect(() => {
    // Filter out sites that don't apply to the target at all (if needed), 
    // though the scoring engine handles this via lower scores.
    const ranked = rankAllSites(sitesData, target);
    setRankedSites(ranked);
    setSelectedSite(ranked[0]); // Auto-select top match
  }, [target]);

  return (
    <div className="h-screen w-full flex bg-space-950 text-white overflow-hidden font-body">
      
      {/* Left Sidebar - Navigation & Ranking List */}
      <div className="w-[380px] h-full flex flex-col bg-space-900 border-r border-white/10 z-10 shrink-0 shadow-2xl">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-nasa-light hover:text-white transition-colors">
            <ChevronLeft size={20} />
            <span className="font-bold text-sm tracking-widest font-heading">HOME</span>
          </Link>
          <div className="flex bg-space-800 rounded-lg p-1">
            <button 
              onClick={() => setTarget('moon')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 transition-colors ${target === 'moon' ? 'bg-nasa-light text-space-950' : 'text-gray-400 hover:text-white'}`}
            >
              <Globe size={14} /> MOON
            </button>
            <button 
              onClick={() => setTarget('mars')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 transition-colors ${target === 'mars' ? 'bg-nasa-red text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <Rocket size={14} /> MARS
            </button>
          </div>
        </div>

        <div className="p-4 border-b border-white/10 bg-space-900/50">
          <h2 className="text-xs uppercase tracking-widest text-muted mb-1 flex items-center justify-between">
            Mission Target <SlidersHorizontal size={14} />
          </h2>
          <div className="font-bold text-lg">
            {target === 'mars' ? 'Human Mars EVA' : 'Lunar Base Camp'}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="text-xs font-bold text-muted uppercase tracking-widest mb-4">Ranked Analogues</div>
          
          {rankedSites.map((site, index) => (
            <button
              key={site.id}
              onClick={() => setSelectedSite(site)}
              className={`w-full text-left p-4 rounded-xl border transition-all ${
                selectedSite?.id === site.id 
                ? target === 'mars' ? 'bg-nasa-red/10 border-nasa-red/50' : 'bg-nasa-light/10 border-nasa-light/50'
                : 'bg-space-800/50 border-transparent hover:bg-space-800'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-mono text-gray-400">#{index + 1}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  site.computedScore >= 80 ? 'bg-green-500/20 text-green-400' :
                  site.computedScore >= 65 ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {site.computedScore}%
                </span>
              </div>
              <h3 className="font-bold truncate">{site.name}</h3>
              <div className="text-xs text-gray-400 mt-1 truncate">{site.country}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Middle - Interactive Map */}
      <div className="flex-1 relative bg-black">
        <EarthMap 
          sites={rankedSites} 
          selectedSite={selectedSite} 
          onSelect={setSelectedSite} 
        />
        
        {/* Top Overlay Badge */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none">
          <div className="glass px-6 py-2 rounded-full border border-white/20 text-sm font-bold tracking-widest uppercase flex items-center gap-3">
            <span className={target === 'mars' ? 'text-nasa-red' : 'text-nasa-light'}>●</span>
            Showing Earth Analogues for {target}
          </div>
        </div>
      </div>

      {/* Right Sidebar - Explainable AI Dashboard */}
      <div className="w-[450px] h-full shrink-0 z-10 shadow-[-10px_0_30px_rgba(0,0,0,0.5)]">
        {selectedSite ? (
          <AnalogReport site={selectedSite} targetBody={target} />
        ) : (
          <div className="h-full flex items-center justify-center text-muted p-12 text-center">
            Select a location on the map or from the list to view the Explainable AI report.
          </div>
        )}
      </div>

    </div>
  );
}
