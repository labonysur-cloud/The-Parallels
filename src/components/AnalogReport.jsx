import { getScoreBreakdown } from '../services/scoringEngine';
import { 
  ShieldAlert, CheckCircle2, XCircle, ChevronRight, Activity, CalendarDays,
  Droplets, ThermometerSun, Sun, Mountain, Pickaxe, MapPin, Cuboid,
  Car, Radio, Map, UserX, FlaskConical, Tent, Settings, Battery
} from 'lucide-react';

const paramIconMap = {
  aridity: <Droplets size={14} />,
  temp_range: <ThermometerSun size={14} />,
  uv_index: <Sun size={14} />,
  surface_roughness: <Mountain size={14} />,
  mineral_analog: <Pickaxe size={14} />,
  isolation: <MapPin size={14} />,
  regolith: <Cuboid size={14} />,
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
        
        <div className="mt-5 flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/5 shadow-inner">
          <div>
            <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-1 font-bold">Mission Match</div>
            <div className="text-4xl font-bold text-white tracking-tighter">{site.computedScore}<span className="text-xl text-gray-500">%</span></div>
          </div>
          <div className="w-14 h-14 rounded-full border border-white/10 bg-black/40 flex items-center justify-center relative shadow-[0_0_15px_rgba(56,189,248,0.2)]">
            <div 
              className="absolute inset-0 rounded-full border-2 border-nasa-light"
              style={{ clipPath: `polygon(0 0, 100% 0, 100% ${site.computedScore}%, 0 ${site.computedScore}%)` }}
            />
            <Activity size={20} className="text-nasa-light" />
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        
        {/* Explainable AI */}
        <div className="p-4 rounded-xl border border-nasa-light/30 bg-nasa-blue/20 shadow-[0_0_20px_rgba(11,61,145,0.15)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-nasa-light" />
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-nasa-light mb-2 flex items-center gap-2">
            <ShieldAlert size={14} /> Explainable AI Summary
          </h3>
          <p className="text-xs leading-relaxed text-gray-200">
            {site.why_analog}
          </p>
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
          <div className="space-y-2">
            {trainingPlan.map((plan, i) => (
              <div key={i} className="flex gap-3 items-center bg-black/40 border border-white/5 p-3 rounded-xl hover:border-nasa-light/50 transition-colors cursor-default">
                <div className="font-mono text-[9px] bg-white/10 px-2 py-1 rounded text-nasa-light font-bold w-12 text-center">{plan.day}</div>
                <div className="text-nasa-light bg-nasa-light/10 p-1.5 rounded-lg">{plan.icon}</div>
                <div className="text-[11px] font-bold text-gray-200 flex-1">{plan.task}</div>
                <ChevronRight size={12} className="text-gray-600" />
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
