
import React from 'react';
import { Father } from '../../types';
import { UserX, AlertCircle, ChevronRight, RefreshCw } from 'lucide-react';

interface LostManagementProps {
  fathers: Father[];
  onSelectFather: (id: string) => void;
}

export const LostManagement: React.FC<LostManagementProps> = ({ fathers, onSelectFather }) => {
  const lostFathers = fathers.filter(f => f.status === 'At Risk' || f.completedModules.length === 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center shadow-sm"><UserX size={24} /></div>
          <div>
            <h2 className="text-2xl font-black text-slate-800">At-Risk Management</h2>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Identifying participants with critical attendance gaps</p>
          </div>
        </div>
        <div className="px-6 py-2 bg-rose-500 text-white rounded-full font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-rose-100">{lostFathers.length} Records Detected</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {lostFathers.map((father) => (
          <div key={father.id} onClick={() => onSelectFather(father.id)} className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl hover:border-rose-200 transition-all cursor-pointer group">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center font-black text-xs">#{father.id}</div>
              <div className="w-10 h-10 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center group-hover:bg-rose-500 group-hover:text-white transition-all"><AlertCircle size={20} /></div>
            </div>
            <h3 className="text-2xl font-black text-slate-800 leading-tight">{father.firstName} {father.lastName}</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Contact: {father.phone}</p>
            <div className="mt-8 p-4 bg-slate-50 rounded-2xl space-y-2">
                <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400"><span>Progress</span><span className="text-rose-500">{father.completedModules.length} / 14</span></div>
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden"><div className="h-full bg-rose-500" style={{ width: `${(father.completedModules.length / 14) * 100}%` }}></div></div>
            </div>
            <button className="w-full mt-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2">Initiate Re-engagement <ChevronRight size={14}/></button>
          </div>
        ))}
        {lostFathers.length === 0 && (
          <div className="lg:col-span-3 p-20 bg-white border border-slate-100 rounded-[3rem] text-center space-y-4">
              <RefreshCw size={48} className="mx-auto text-emerald-500 opacity-20"/>
              <p className="text-xl font-black text-slate-800">All Participants are Currently Engaged</p>
          </div>
        )}
      </div>
    </div>
  );
};
