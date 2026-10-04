import { getScoreBreakdown } from '../services/scoringEngine';
import { 
  ShieldAlert, CheckCircle2, XCircle, ChevronRight, Activity, CalendarDays,
  Droplets, ThermometerSun, Sun, Mountain, Pickaxe, MapPin, Cuboid,
  Car, Radio, Map, UserX, FlaskConical, Tent, Settings, Battery, Database
} from 'lucide-react';

const paramIconMap = {
  annual_precip_mm: <Droplets size={14} />,
  diurnal_range_c: <ThermometerSun size={14} />,
  mean_temp_c: <ThermometerSun size={14} />,
  rh_pct: <Droplets size={14} />,
  wind_ms: <Map size={14} />
};

export default function AnalogReport({ site, targetBody }) {
  const breakdown = getScoreBreakdown(site, targetBody);
  
  const trainingPlan = site.type.includes('volcanic') || site.type.includes('lava-tube') ? [
    { day: "Day 01", task: "Lava tube / Cave mapping", icon: <Map size={16} className="text-nasa-light" /> },
    { day: "Day 02", task: "Rover deployment on rough basalt", icon: <Car size={16} className="text-nasa-light" /> },
    { day: "Day 03", task: "Geological sampling (Igneous)", icon: <Pickaxe size={16} className="text-nasa-light" /> },
    { day: "Day 04", task: "Communication delay simulation", icon: <Radio size={16} className="text-nasa-light" /> },
    { day: "Day 05", task: "Emergency suit repair procedure", icon: <Settings size={16} className="text-nasa-light" /> },
  ] : site.type.includes('polar') ? [
    { day: "Day 01", task: "Ice drilling & core sampling", icon: <FlaskConical size={16} className="text-nasa-light" /> },
    { day: "Day 02", task: "Cryo-habitat deployment", icon: <Tent size={16} className="text-nasa-light" /> },
    { day: "Day 03", task: "Permafrost rover navigation", icon: <Car size={16} className="text-nasa-light" /> },
    { day: "Day 04", task: "Subsurface radar (GPR) testing", icon: <Radio size={16} className="text-nasa-light" /> },
    { day: "Day 05", task: "Isolation & psychological monitoring", icon: <UserX size={16} className="text-nasa-light" /> },
  ] : [
    { day: "Day 01", task: "Terrain mapping & base setup", icon: <Map size={16} className="text-nasa-light" /> },
    { day: "Day 02", task: "Long-range rover navigation", icon: <Car size={16} className="text-nasa-light" /> },
    { day: "Day 03", task: "Sedimentary geological sampling", icon: <Pickaxe size={16} className="text-nasa-light" /> },
    { day: "Day 04", task: "Autonomous exploration testing", icon: <Settings size={16} className="text-nasa-light" /> },
    { day: "Day 05", task: "Solar array deployment in dust", icon: <Battery size={16} className="text-nasa-light" /> },
  ];

  return (
    <div className="flex flex-col h-full overflow-y-auto custom-scrollbar">
      
      {/* Header - Removed 'sticky' to fix scroll overlapping */}
      <div className="p-6 border-b border-white/10 shrink-0">
        <h2 className="text-2xl font-bold font-heading leading-tight">{site.name}</h2>
        <div className="text-nasa-light font-mono text-[10px] mt-1 uppercase tracking-widest">{site.country}</div>
        
        <div className="mt-5 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 font-bold">Mission Match</div>
            <div className="text-5xl font-bold text-white tracking-tighter font-mono">{site.computedScore}<span className="text-xl text-gray-600">%</span></div>
          </div>
          <div className="w-16 h-16 flex items-center justify-center relative">
            <div 
              className="absolute inset-0 rounded-full border-2 border-white/10"
            />
            <div 
              className="absolute inset-0 rounded-full border-2 border-nasa-light shadow-[0_0_15px_rgba(56,189,248,0.4)]"
              style={{ clipPath: `polygon(0 0, 100% 0, 100% ${site.computedScore}%, 0 ${site.computedScore}%)` }}
            />
            <Activity size={24} className="text-nasa-light" />
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        
        {/* Explainable AI */}
        <div className="relative pl-4 border-l-2 border-nasa-light py-1">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-nasa-light mb-2 flex items-center gap-2">
            <ShieldAlert size={14} /> Explainable AI Summary
          </h3>
          <p className="text-xs leading-relaxed text-gray-400">
            {site.why_analog}
          </p>
        </div>

        {/* Space Apps Agency Telemetry */}
        <div className="space-y-2 pt-2">
          <h4 className="font-bold text-gray-500 text-[9px] uppercase tracking-widest flex items-center gap-2">
            <Database size={12} /> Space Agency Telemetry Sources
          </h4>
          <div className="flex flex-wrap gap-2">
            {site.data_sources?.map((source, i) => (
              <span key={i} className="text-[9px] font-mono text-nasa-light bg-nasa-light/5 border border-nasa-light/20 px-2 py-1 rounded-sm uppercase tracking-wider">
                {source}
              </span>
            ))}
          </div>
        </div>

        {/* Similarity Breakdown Bars */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-white/10 pb-2">Environmental Match</h3>
          {breakdown.map((b) => (
            <div key={b.param} className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-bold text-gray-300">
                <span className="flex items-center gap-2 text-nasa-light">{paramIconMap[b.param]} {b.label}</span>
                <span className="font-mono">{b.similarity}%</span>
              </div>
              <div className="h-1.5 w-full bg-black/50 rounded-full overflow-hidden border border-white/5">
                <div 
                  className={`h-full ${b.similarity > 80 ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : b.similarity > 60 ? 'bg-yellow-500 shadow-[0_0_10px_#eab308]' : 'bg-red-500 shadow-[0_0_10px_#ef4444]'}`}
                  style={{ width: `${b.similarity}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Limitations */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="font-bold text-gray-400 text-[10px] uppercase tracking-widest">Earth CAN simulate</h4>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-gray-300 text-[10px] leading-tight font-medium"><CheckCircle2 size={14} className="text-green-400 shrink-0" /> Terrain & Geology</li>
              <li className="flex items-start gap-2 text-gray-300 text-[10px] leading-tight font-medium"><CheckCircle2 size={14} className="text-green-400 shrink-0" /> Extreme Isolation</li>
              <li className="flex items-start gap-2 text-gray-300 text-[10px] leading-tight font-medium"><CheckCircle2 size={14} className="text-green-400 shrink-0" /> Rover Mobility</li>
              <li className="flex items-start gap-2 text-gray-300 text-[10px] leading-tight font-medium"><CheckCircle2 size={14} className="text-green-400 shrink-0" /> Equipment Testing</li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-bold text-gray-400 text-[10px] uppercase tracking-widest">Earth CANNOT simulate</h4>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-gray-300 text-[10px] leading-tight font-medium"><XCircle size={14} className="text-red-400 shrink-0" /> Extraterrestrial Gravity</li>
              <li className="flex items-start gap-2 text-gray-300 text-[10px] leading-tight font-medium"><XCircle size={14} className="text-red-400 shrink-0" /> Space Vacuum</li>
              <li className="flex items-start gap-2 text-gray-300 text-[10px] leading-tight font-medium"><XCircle size={14} className="text-red-400 shrink-0" /> Cosmic Radiation</li>
              <li className="flex items-start gap-2 text-gray-300 text-[10px] leading-tight font-medium"><XCircle size={14} className="text-red-400 shrink-0" /> Toxic Chemistry</li>
            </ul>
          </div>
        </div>

        {/* Train Like an Astronaut */}
        <div className="space-y-3 pt-4 border-t border-white/10">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-nasa-light flex items-center gap-2">
            <CalendarDays size={14} /> {targetBody === 'mars' ? 'MARS' : 'LUNAR'} TRAINING PLAN
          </h3>
          <div className="space-y-0">
            {trainingPlan.map((plan, i) => (
              <div key={i} className="flex gap-3 items-center border-b border-white/5 py-3 hover:bg-white/5 transition-colors px-2 cursor-default group">
                <div className="font-mono text-[9px] text-gray-500 font-bold w-10">{plan.day}</div>
                <div className="text-nasa-light opacity-70 group-hover:opacity-100 transition-opacity">{plan.icon}</div>
                <div className="text-[11px] font-bold text-gray-300 flex-1">{plan.task}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
