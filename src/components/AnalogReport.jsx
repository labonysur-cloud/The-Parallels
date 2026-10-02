import { getScoreBreakdown } from '../services/scoringEngine';
import { ShieldAlert, CheckCircle2, XCircle, ChevronRight, Activity, CalendarDays } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

export default function AnalogReport({ site, targetBody }) {
  const breakdown = getScoreBreakdown(site, targetBody);
  
  // Radar data format
  const radarData = breakdown.map(b => ({
    subject: b.label,
    A: b.earthValue,
    B: b.targetValue,
    fullMark: 10,
  }));

  const trainingPlan = site.type.includes('volcanic') || site.type.includes('lava-tube') ? [
    { day: "Day 01", task: "Lava tube / Cave mapping", icon: "🔦" },
    { day: "Day 02", task: "Rover deployment on rough basalt", icon: "🚙" },
    { day: "Day 03", task: "Geological sampling (Igneous)", icon: "⛏️" },
    { day: "Day 04", task: "Communication delay simulation", icon: "📡" },
    { day: "Day 05", task: "Emergency suit repair procedure", icon: "👨‍🚀" },
  ] : site.type.includes('polar') ? [
    { day: "Day 01", task: "Ice drilling & core sampling", icon: "🧊" },
    { day: "Day 02", task: "Cryo-habitat deployment", icon: "⛺" },
    { day: "Day 03", task: "Permafrost rover navigation", icon: "🚙" },
    { day: "Day 04", task: "Subsurface radar (GPR) testing", icon: "📡" },
    { day: "Day 05", task: "Isolation & psychological monitoring", icon: "🧠" },
  ] : [
    { day: "Day 01", task: "Terrain mapping & base setup", icon: "🗺️" },
    { day: "Day 02", task: "Long-range rover navigation", icon: "🚙" },
    { day: "Day 03", task: "Sedimentary geological sampling", icon: "⛏️" },
    { day: "Day 04", task: "Autonomous exploration testing", icon: "🤖" },
    { day: "Day 05", task: "Solar array deployment in dust", icon: "☀️" },
  ];

  return (
    <div className="flex flex-col h-full bg-space-900 border-l border-white/10 overflow-y-auto">
      
      {/* Header */}
      <div className="p-6 border-b border-white/10 sticky top-0 bg-space-900/90 backdrop-blur z-10">
        <h2 className="text-2xl font-bold font-heading">{site.name}</h2>
        <div className="text-nasa-light text-sm mt-1">{site.country}</div>
        
        <div className="mt-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-muted uppercase tracking-wider">Mission Match</div>
            <div className="text-4xl font-bold text-white">{site.computedScore}%</div>
          </div>
          <div className="w-16 h-16 rounded-full border-4 border-space-800 flex items-center justify-center relative">
            <div 
              className="absolute inset-0 rounded-full border-4 border-nasa-light"
              style={{ clipPath: `polygon(0 0, 100% 0, 100% ${site.computedScore}%, 0 ${site.computedScore}%)` }}
            />
            <Activity className="text-nasa-light" />
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        
        {/* Similarity Breakdown Bars */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted border-b border-white/10 pb-2">Environmental Match</h3>
          {breakdown.map((b) => (
            <div key={b.param} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="flex items-center gap-2">{b.icon} {b.label}</span>
                <span className="font-mono">{b.similarity}%</span>
              </div>
              <div className="h-2 w-full bg-space-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${b.similarity > 80 ? 'bg-green-500' : b.similarity > 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${b.similarity}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Explainable AI */}
        <div className="glass p-5 rounded-xl border border-nasa-light/20 bg-nasa-blue/10">
          <h3 className="text-sm font-bold uppercase tracking-widest text-nasa-light mb-3 flex items-center gap-2">
            <ShieldAlert size={16} /> Explainable AI Summary
          </h3>
          <p className="text-sm leading-relaxed text-gray-300">
            {site.why_analog}
          </p>
        </div>

        {/* Limitations */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-3">
            <h4 className="font-bold text-gray-400">Earth CAN simulate</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-green-400"><CheckCircle2 size={16} /> Terrain & Geology</li>
              <li className="flex items-center gap-2 text-green-400"><CheckCircle2 size={16} /> Extreme Isolation</li>
              <li className="flex items-center gap-2 text-green-400"><CheckCircle2 size={16} /> Rover Mobility</li>
              <li className="flex items-center gap-2 text-green-400"><CheckCircle2 size={16} /> Equipment Testing</li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-bold text-gray-400">Earth CANNOT simulate</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-red-400"><XCircle size={16} /> Extraterrestrial Gravity</li>
              <li className="flex items-center gap-2 text-red-400"><XCircle size={16} /> Space Vacuum</li>
              <li className="flex items-center gap-2 text-red-400"><XCircle size={16} /> Cosmic Radiation</li>
              <li className="flex items-center gap-2 text-red-400"><XCircle size={16} /> Toxic Chemistry</li>
            </ul>
          </div>
        </div>

        {/* Train Like an Astronaut */}
        <div className="space-y-4 pt-4 border-t border-white/10">
          <h3 className="text-sm font-bold uppercase tracking-widest text-nasa-light flex items-center gap-2">
            <CalendarDays size={16} /> {targetBody === 'mars' ? 'MARS' : 'LUNAR'} TRAINING PLAN
          </h3>
          <div className="space-y-3">
            {trainingPlan.map((plan, i) => (
              <div key={i} className="flex gap-4 items-center bg-space-800/50 p-3 rounded-lg hover:bg-space-800 transition-colors cursor-default">
                <div className="font-mono text-xs text-nasa-light font-bold w-14">{plan.day}</div>
                <div className="text-lg">{plan.icon}</div>
                <div className="text-sm flex-1">{plan.task}</div>
                <ChevronRight size={14} className="text-gray-600" />
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
