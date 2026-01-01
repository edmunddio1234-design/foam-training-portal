
import React from 'react';
import { Father } from '../../types';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Users, GraduationCap, Activity, Calendar, TrendingUp, ShieldCheck, CheckCircle2, Circle } from 'lucide-react';

interface DashboardProps {
  fathers: Father[];
  onSelectFather: (id: string) => void;
  onNavigateToPortal: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ fathers, onSelectFather, onNavigateToPortal }) => {
  const totalEnrolled = fathers.length;
  const graduates = fathers.filter(f => f.completedModules.length === 14).length;
  const totalPossible = totalEnrolled * 14;
  const totalDone = fathers.reduce((acc, f) => acc + f.completedModules.length, 0);
  const avgCompletion = totalPossible > 0 ? Math.round((totalDone / totalPossible) * 100) : 0;

  const trendData = [
    { month: 'Jan', enrolled: 180, completed: 500 },
    { month: 'Feb', enrolled: 195, completed: 620 },
    { month: 'Mar', enrolled: 210, completed: 840 },
    { month: 'Apr', enrolled: 225, completed: 1100 },
    { month: 'May', enrolled: 235, completed: 1350 },
    { month: 'Jun', enrolled: 235, completed: 1600 },
  ];

  const getStatusColor = (count: number) => {
    if (count === 14) return 'bg-blue-600';
    if (count >= 7) return 'bg-blue-400';
    if (count > 0) return 'bg-blue-200';
    return 'bg-slate-200';
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl overflow-hidden relative border border-slate-800">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-10 items-center">
            <div className="lg:col-span-1">
                <span className="bg-blue-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">Admin Dashboard</span>
                <h2 className="text-4xl font-black mt-4 leading-tight">Executive Summary</h2>
                <p className="text-slate-400 mt-4 text-sm leading-relaxed">
                    Analyzing completion velocity for {totalEnrolled} active fathers. Current trajectory shows {avgCompletion}% aggregate readiness.
                </p>
                <div className="mt-8 flex items-center space-x-6 mb-8">
                    <div className="flex flex-col">
                        <span className="text-3xl font-black">{totalEnrolled}</span>
                        <span className="text-[10px] uppercase text-slate-500 font-black tracking-widest">Enrolled</span>
                    </div>
                    <div className="w-px h-10 bg-slate-800"></div>
                    <div className="flex flex-col">
                        <span className="text-3xl font-black text-blue-500">{graduates}</span>
                        <span className="text-[10px] uppercase text-slate-500 font-black tracking-widest">Graduates</span>
                    </div>
                </div>
                <button onClick={onNavigateToPortal} className="w-full bg-white/10 hover:bg-white/20 border border-white/10 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center space-x-2">
                    <ShieldCheck size={16} className="text-blue-500" />
                    <span>Launch Father Portal</span>
                </button>
            </div>
            <div className="lg:col-span-2 h-64 bg-slate-800/50 rounded-2xl p-6 border border-white/5 shadow-inner">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center">
                    <TrendingUp size={14} className="mr-2 text-blue-500" />
                    Participation Momentum
                </h4>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                        <XAxis dataKey="month" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                        <YAxis stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#0F172A', border: 'none', borderRadius: '12px', color: '#fff' }} />
                        <Area type="monotone" dataKey="completed" stroke="#1A73E8" strokeWidth={3} fillOpacity={0.2} fill="#1A73E8" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Cohort Active', value: totalEnrolled, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { title: 'Completion rate', value: `${avgCompletion}%`, icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { title: 'Program Status', value: 'Live', icon: Calendar, color: 'text-amber-600', bg: 'bg-amber-50' },
          { title: 'Alumni', value: graduates, icon: GraduationCap, color: 'text-purple-600', bg: 'bg-purple-50' }
        ].map((card, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center space-x-4">
              <div className={`p-4 rounded-xl ${card.bg} ${card.color}`}><card.icon size={24} /></div>
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest">{card.title}</p>
                <h3 className="text-2xl font-black text-slate-800">{card.value}</h3>
              </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <h4 className="text-xl font-black text-slate-800 mb-8">Participant Roster Status</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-4 max-h-[500px] overflow-y-auto pr-2">
          {fathers.map((f) => (
            <div 
              key={`${f.id}-${f.lastName}`} 
              onClick={() => onSelectFather(f.id)}
              className="group relative bg-white border border-slate-50 rounded-2xl p-4 transition-all cursor-pointer hover:border-blue-200 hover:shadow-xl hover:-translate-y-1 text-center"
            >
              <div className={`w-3 h-3 rounded-full mx-auto mb-3 shadow-inner ${getStatusColor(f.completedModules.length)}`}></div>
              <p className="text-[10px] font-black text-slate-800 truncate w-full">{f.firstName} {f.lastName}</p>
              <p className="text-[9px] font-mono font-bold text-slate-300">ID: {f.id}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
