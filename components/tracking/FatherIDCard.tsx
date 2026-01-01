
import React from 'react';
import { Father } from '../../types';
import { TRACKER_MODULES } from '../../constants';
import { ArrowLeft, CheckCircle2, Circle, Mail, Phone, Calendar, Award } from 'lucide-react';

interface FatherIDCardProps {
  father: Father;
  onBack: () => void;
}

export const FatherIDCard: React.FC<FatherIDCardProps> = ({ father, onBack }) => {
  const completedIds = new Set(father.completedModules);
  const completedModules = TRACKER_MODULES.filter(m => completedIds.has(m.id));
  const remainingModules = TRACKER_MODULES.filter(m => !completedIds.has(m.id));
  const progress = Math.round((completedModules.length / 14) * 100);

  return (
    <div className="animate-in fade-in duration-500 space-y-8">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-slate-800 font-black text-[10px] uppercase tracking-widest transition-all">
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      <div className="bg-slate-900 rounded-[2.5rem] p-12 text-white shadow-2xl relative overflow-hidden border border-slate-800">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-4 flex flex-col items-center lg:items-start text-center lg:text-left">
                <div className="w-32 h-32 rounded-[2.5rem] bg-blue-600 flex items-center justify-center text-5xl font-black shadow-2xl mb-8 border-4 border-slate-800">
                    {father.firstName[0]}{father.lastName[0]}
                </div>
                <h2 className="text-5xl font-black leading-tight">{father.firstName}<br/>{father.lastName}</h2>
                <p className="text-slate-400 mt-4 text-xs font-bold uppercase tracking-widest">Participant ID: #{father.id}</p>
            </div>
            
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-slate-800/50 rounded-3xl p-8 border border-white/5 flex flex-col justify-between">
                    <div>
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Engagement Status</h4>
                        <p className="text-3xl font-black text-blue-400">{father.status}</p>
                    </div>
                    <div className="mt-8">
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-2xl font-black">{progress}%</span>
                            <span className="text-[10px] font-bold text-slate-500">{completedModules.length} / 14</span>
                        </div>
                        <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                            <div className="bg-blue-500 h-full" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>
                </div>
                <div className="bg-slate-800/50 rounded-3xl p-8 border border-white/5 space-y-4">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Secure Contact</h4>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm text-slate-300"><Mail size={16} className="text-blue-500"/>{father.email}</div>
                        <div className="flex items-center gap-3 text-sm text-slate-300"><Phone size={16} className="text-blue-500"/>{father.phone}</div>
                        <div className="flex items-center gap-3 text-sm text-slate-300"><Calendar size={16} className="text-blue-500"/>Enrolled: {father.joinedDate}</div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
              <h4 className="flex items-center text-emerald-600 font-black text-xs uppercase tracking-widest border-b pb-4"><CheckCircle2 size={16} className="mr-2"/>Completed Modules</h4>
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {completedModules.map(m => (
                      <div key={m.id} className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl flex items-center justify-between">
                          <div className="flex items-center gap-4">
                              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-black text-xs">{m.id}</div>
                              <span className="text-sm font-black text-slate-800">{m.title}</span>
                          </div>
                          <CheckCircle2 size={18} className="text-emerald-500"/>
                      </div>
                  ))}
                  {completedModules.length === 0 && <p className="text-center text-slate-400 py-8 text-xs font-bold uppercase">No records found</p>}
              </div>
          </div>
          <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
              <h4 className="flex items-center text-slate-400 font-black text-xs uppercase tracking-widest border-b pb-4"><Circle size={16} className="mr-2"/>Remaining Requirements</h4>
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {remainingModules.map(m => (
                      <div key={m.id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-4">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center font-black text-xs">{m.id}</div>
                          <span className="text-sm font-bold text-slate-500">{m.title}</span>
                      </div>
                  ))}
                  {remainingModules.length === 0 && (
                      <div className="bg-blue-600 p-8 rounded-3xl text-center text-white shadow-xl">
                          <Award size={40} className="mx-auto mb-4"/>
                          <p className="font-black text-lg">Graduation Eligible</p>
                          <p className="text-xs opacity-70 mt-1">All 14 modules verified</p>
                      </div>
                  )}
              </div>
          </div>
      </div>
    </div>
  );
};
