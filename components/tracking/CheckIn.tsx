
import React, { useState } from 'react';
import { Father } from '../../types';
import { TRACKER_MODULES, PROGRAM_DATES, FUTURE_THRESHOLD } from '../../constants';
import { Calendar, Search, Clock, ShieldCheck, UserCheck } from 'lucide-react';

interface CheckInProps {
  fathers: Father[];
  onCheckIn: (fatherId: string, moduleId: number, date: string) => Promise<void>;
}

export const CheckIn: React.FC<CheckInProps> = ({ fathers, onCheckIn }) => {
  const [selectedDate, setSelectedDate] = useState<string>(PROGRAM_DATES[0]);
  const [selectedModuleId, setSelectedModuleId] = useState<number>(1);
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState('');

  const isFutureSession = new Date(selectedDate) >= new Date(FUTURE_THRESHOLD);

  const handleToggleCheckIn = async (father: Father) => {
    setLoadingMap(prev => ({ ...prev, [father.id]: true }));
    try {
        await onCheckIn(father.id, selectedModuleId, selectedDate);
    } finally {
        setLoadingMap(prev => ({ ...prev, [father.id]: false }));
    }
  };

  const filteredFathers = fathers.filter(f => 
    `${f.firstName} ${f.lastName} ${f.id}`.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a,b) => a.lastName.localeCompare(b.lastName));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
        <div className="bg-slate-900 p-8 text-white flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-2 block">Program Check-In</span>
                <h2 className="text-3xl font-black">Attendance Command</h2>
            </div>
            <div className="relative w-full md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                    type="text"
                    placeholder="Search roster..."
                    className="w-full bg-white/10 border border-white/10 text-white pl-12 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-slate-50">
            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Calendar size={12}/> Session Date</label>
                <select value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full p-4 rounded-2xl border-2 border-slate-50 bg-slate-50 font-black text-slate-700 outline-none focus:border-blue-500 transition-all">
                    {PROGRAM_DATES.map(date => (
                        <option key={date} value={date}>{new Date(date + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</option>
                    ))}
                </select>
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Clock size={12}/> Curriculum Module</label>
                <select value={selectedModuleId} onChange={(e) => setSelectedModuleId(Number(e.target.value))} className="w-full p-4 rounded-2xl border-2 border-slate-50 bg-slate-50 font-black text-slate-700 outline-none focus:border-blue-500 transition-all">
                    {TRACKER_MODULES.map(m => (
                        <option key={m.id} value={m.id}>Module {m.id}: {m.title}</option>
                    ))}
                </select>
            </div>
        </div>

        {isFutureSession && (
            <div className="bg-emerald-600 p-4 flex items-center justify-center gap-4 text-white">
                <ShieldCheck size={20} className="animate-pulse" />
                <span className="text-xs font-black uppercase tracking-widest">Future Projection Active: Mark Attendance for Forward Planning</span>
            </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl divide-y divide-slate-50 overflow-hidden">
              {filteredFathers.map(father => {
                  const isPresent = father.completedModules.includes(selectedModuleId);
                  const isLoading = loadingMap[father.id];
                  return (
                      <div key={father.id} className={`p-6 flex items-center justify-between transition-all ${isPresent ? 'bg-blue-50/30' : 'hover:bg-slate-50'}`}>
                          <div className="flex items-center gap-6">
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm ${isPresent ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}>#{father.id}</div>
                              <div>
                                  <p className={`text-lg font-black ${isPresent ? 'text-blue-600' : 'text-slate-800'}`}>{father.lastName}, {father.firstName}</p>
                                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{father.phone}</p>
                              </div>
                          </div>
                          <button onClick={() => handleToggleCheckIn(father)} disabled={isLoading} className={`px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${isPresent ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-white hover:bg-black'} ${isLoading ? 'opacity-50' : ''}`}>
                              {isLoading ? 'Syncing...' : isPresent ? 'Confirmed Present' : 'Mark Present'}
                          </button>
                      </div>
                  );
              })}
          </div>
      </div>
    </div>
  );
};
