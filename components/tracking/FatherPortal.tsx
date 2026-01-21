import React, { useState } from 'react';
import { Father } from '../../types';
import { TRACKER_MODULES, FULL_SCHEDULE_LOG, CLASS_LOCATION } from '../../constants';
import { Lock, LogOut, MapPin, Target, Check, Calendar, ChevronRight } from 'lucide-react';

interface FatherPortalProps {
  fathers: Father[];
  onBack: () => void;
}

export const FatherPortal: React.FC<FatherPortalProps> = ({ fathers, onBack }) => {
  const [accessId, setAccessId] = useState('');
  const [currentUser, setCurrentUser] = useState<Father | null>(null);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = fathers.find(f => f.id.toLowerCase() === accessId.toLowerCase());
    if (user) {
      setCurrentUser(user);
      setError('');
    } else {
      setError('Invalid Participant ID.');
    }
  };

  // Find the next incomplete module for a father
  const getNextModule = (completedModules: number[]) => {
    const completedSet = new Set(completedModules);
    // Find the first module that hasn't been completed (in order 1-14)
    for (const module of TRACKER_MODULES) {
      if (!completedSet.has(module.id)) {
        return module;
      }
    }
    // All modules completed - return null or graduation message
    return null;
  };

  // Get the next scheduled session for a specific module
  const getNextSessionForModule = (moduleId: number) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (const session of FULL_SCHEDULE_LOG) {
      const sessionDate = new Date(session.date + 'T12:00:00');
      if (sessionDate >= today && session.moduleId === moduleId) {
        return session;
      }
    }
    return null;
  };

  // Format date for display
  const formatSessionDate = (dateString: string) => {
    const date = new Date(dateString + 'T12:00:00');
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] animate-in fade-in duration-500">
        <div className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-2xl max-w-md w-full text-center space-y-8">
            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto shadow-inner"><Lock size={32}/></div>
            <div className="space-y-2">
                <h2 className="text-3xl font-black text-slate-800">Participant Portal</h2>
                <p className="text-slate-500 font-medium">Verify your program progress</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
                <input type="text" placeholder="ID Number" value={accessId} onChange={e => setAccessId(e.target.value)} className="w-full p-5 bg-slate-50 border-2 border-slate-50 rounded-2xl text-center text-3xl font-mono focus:border-blue-500 outline-none transition-all" />
                {error && <p className="text-xs font-black text-rose-600 uppercase tracking-widest">{error}</p>}
                <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all shadow-xl">Authenticate Access</button>
            </form>
        </div>
      </div>
    );
  }

  const completedSet = new Set(currentUser.completedModules);
  const progress = Math.round((completedSet.size / 14) * 100);
  
  // Get the next module dynamically based on father's progress
  const nextModule = getNextModule(currentUser.completedModules);
  const nextSession = nextModule ? getNextSessionForModule(nextModule.id) : null;
  
  // Check if father has graduated (all 14 modules completed)
  const hasGraduated = completedSet.size >= 14;

  return (
    <div className="animate-in fade-in duration-500 space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full mb-3 inline-block">Active Participant</span>
          <h2 className="text-4xl font-black text-slate-800 leading-tight">Welcome back,<br/>{currentUser.firstName} {currentUser.lastName}</h2>
          <div className="flex items-center gap-6 mt-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
             <span className="flex items-center gap-2"><Target size={14} className="text-blue-500"/> ID: #{currentUser.id}</span>
             <span className="flex items-center gap-2"><MapPin size={14} className="text-rose-500"/> {CLASS_LOCATION.name}</span>
          </div>
        </div>
        <button onClick={() => setCurrentUser(null)} className="px-6 py-3 bg-white border border-slate-200 text-slate-400 rounded-xl font-bold text-xs uppercase tracking-widest hover:text-rose-500 transition-colors flex items-center gap-2"><LogOut size={16}/> Sign Out</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-6">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Aggregate Completion</h3>
                <div className="flex items-baseline gap-3">
                    <span className="text-7xl font-black text-slate-800">{progress}%</span>
                    <span className="text-lg font-black text-blue-600 uppercase">Tracked Success</span>
                </div>
                <div className="w-full h-3 bg-slate-50 rounded-full overflow-hidden border border-slate-100 shadow-inner">
                    <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                </div>
            </div>
            <div className="w-48 h-48 bg-slate-50 rounded-full border-4 border-white shadow-inner flex items-center justify-center relative">
                <div className="text-center">
                    <p className="text-4xl font-black text-slate-800">{currentUser.completedModules.length}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verified Classes</p>
                </div>
            </div>
        </div>

        {/* Next Milestone Card - NOW DYNAMIC! */}
        <div className={`lg:col-span-4 ${hasGraduated ? 'bg-emerald-700' : 'bg-slate-900'} text-white rounded-[3rem] p-10 shadow-2xl flex flex-col justify-between border-b-8 ${hasGraduated ? 'border-emerald-400' : 'border-blue-600'}`}>
            <div className="space-y-4">
                <span className="px-3 py-1 bg-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                  {hasGraduated ? '🎓 Congratulations!' : 'Next Milestone'}
                </span>
                <p className={`text-xs ${hasGraduated ? 'text-emerald-300' : 'text-blue-400'} font-bold uppercase tracking-widest`}>
                  {hasGraduated ? 'Program Complete' : 'Required Curriculum'}
                </p>
                {/* FIXED: Now shows actual next module instead of hardcoded text */}
                <h3 className="text-2xl font-black leading-tight">
                  {hasGraduated 
                    ? 'You Have Graduated!' 
                    : nextModule 
                      ? `Module ${nextModule.id}: ${nextModule.title}`
                      : 'All Modules Complete'
                  }
                </h3>
                {nextModule && !hasGraduated && (
                  <p className="text-xs text-slate-400 mt-2">
                    Category: {nextModule.category}
                  </p>
                )}
            </div>
            <div className="mt-8 p-6 bg-white/5 border border-white/10 rounded-2xl">
                <p className={`text-[10px] ${hasGraduated ? 'text-emerald-300' : 'text-blue-400'} font-black uppercase tracking-widest mb-1`}>
                  {hasGraduated ? 'Achievement Unlocked' : 'Upcoming Session'}
                </p>
                {hasGraduated ? (
                  <>
                    <p className="text-lg font-black">Program Graduate</p>
                    <p className="text-xs font-medium text-slate-400 mt-1">14/14 Modules Completed</p>
                  </>
                ) : nextSession ? (
                  <>
                    <p className="text-lg font-black">{formatSessionDate(nextSession.date)}</p>
                    <p className="text-xs font-medium text-slate-400 mt-1">@ {nextSession.time} CST</p>
                  </>
                ) : (
                  <>
                    <p className="text-lg font-black">Check Schedule</p>
                    <p className="text-xs font-medium text-slate-400 mt-1">Contact your case manager</p>
                  </>
                )}
            </div>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden">
          <div className="p-8 border-b bg-slate-50/50">
              <h3 className="text-xl font-black text-slate-800 tracking-tight">Personal Graduation Pathway</h3>
          </div>
          <div className="overflow-x-auto">
              <table className="w-full text-left">
                  <thead>
                      <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                          <th className="px-8 py-5">Module</th>
                          <th className="px-8 py-5">Registry Topic</th>
                          <th className="px-8 py-5">Status</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                      {TRACKER_MODULES.map(m => {
                          const isDone = completedSet.has(m.id);
                          const isNext = nextModule && m.id === nextModule.id;
                          return (
                              <tr key={m.id} className={`${isDone ? 'bg-emerald-50/20' : isNext ? 'bg-blue-50/30' : ''}`}>
                                  <td className="px-8 py-6">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${
                                      isDone ? 'bg-emerald-500 text-white' : 
                                      isNext ? 'bg-blue-500 text-white' : 
                                      'bg-slate-100 text-slate-400'
                                    }`}>
                                      {m.id}
                                    </div>
                                  </td>
                                  <td className="px-8 py-6">
                                      <p className={`font-black text-sm ${isDone ? 'text-slate-400 line-through' : isNext ? 'text-blue-700' : 'text-slate-800'}`}>
                                        {m.title}
                                      </p>
                                      {isNext && (
                                        <span className="text-[9px] font-bold text-blue-500 uppercase tracking-widest">← Up Next</span>
                                      )}
                                  </td>
                                  <td className="px-8 py-6">
                                      {isDone ? (
                                          <span className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[9px] font-black uppercase tracking-widest"><Check size={12}/> Verified</span>
                                      ) : isNext ? (
                                          <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-[9px] font-black uppercase tracking-widest">
                                            <Calendar size={12}/> Next Class
                                          </span>
                                      ) : (
                                          <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Enrolled</span>
                                      )}
                                  </td>
                              </tr>
                          );
                      })}
                  </tbody>
              </table>
          </div>
      </div>
    </div>
  );
};
