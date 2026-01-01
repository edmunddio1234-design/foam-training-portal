
import React from 'react';
import { ModuleType, TrainingTrack, ModuleContent } from '../types';

interface SidebarProps {
  activeModuleId: ModuleType;
  onModuleSelect: (id: ModuleType) => void;
  view: 'module' | 'manual';
  onViewChange: (view: 'module' | 'manual') => void;
  onBackToHub?: () => void;
  activeTrack: TrainingTrack;
  onTrackSelect: (track: TrainingTrack) => void;
  activeModules: ModuleContent[];
  onChangeTrack: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeModuleId, 
  onModuleSelect, 
  view, 
  onViewChange, 
  onBackToHub,
  activeTrack,
  onTrackSelect,
  activeModules,
  onChangeTrack
}) => {
  return (
    <aside className="fixed bottom-0 left-0 w-full md:w-64 md:h-full bg-[#0F2C5C] text-white z-50 flex flex-col md:static shadow-2xl overflow-hidden">
      <div className="p-6 hidden md:flex flex-col h-full">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 mb-8">
           <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-inner shrink-0">
             <span className="text-[#0F2C5C] font-black text-2xl italic tracking-tighter">F</span>
           </div>
           <div>
             <span className="font-black text-xl tracking-tight block leading-none">FOAM</span>
             <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">Training Academy</span>
           </div>
        </div>

        {/* Navigation Core */}
        <div className="space-y-2 mb-8">
          <button 
            onClick={onBackToHub}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-xs font-black text-indigo-300 hover:bg-white/5 transition-all border border-indigo-500/20 group"
          >
            <i className="fas fa-th-large w-5 text-center group-hover:scale-110 transition-transform"></i>
            <span>Command Center</span>
          </button>

          <button 
            onClick={onChangeTrack}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-xs font-black text-indigo-300 hover:bg-white/5 transition-all border border-indigo-500/20 group"
          >
            <i className="fas fa-layer-group w-5 text-center group-hover:scale-110 transition-transform"></i>
            <span>Switch Track</span>
          </button>
        </div>

        {/* Current Track Display */}
        <div className="mb-8 space-y-1">
           <p className="text-[9px] font-black text-indigo-300 uppercase tracking-[0.2em] mb-3 pl-2 opacity-60">Active Pathway</p>
           <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-3">
              <div className="flex items-center gap-3 text-white">
                <div className="w-8 h-8 rounded-lg bg-indigo-600/30 flex items-center justify-center text-indigo-400">
                  <i className={`fas ${activeTrack === 'case_manager' ? 'fa-user-tie' : activeTrack === 'facilitator' ? 'fa-users-viewfinder' : 'fa-landmark'}`}></i>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest leading-tight">{activeTrack.replace('_', ' ')}</span>
              </div>
           </div>
        </div>
        
        <nav className="space-y-2 flex-1 overflow-y-auto hide-scrollbar">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 pl-2">
            Track Progress
          </p>
          
          <div className="space-y-1">
            {activeModules.map((module) => (
              <button
                key={module.id}
                onClick={() => onModuleSelect(module.id)}
                className={`w-full text-left flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300 ${
                  activeModuleId === module.id && view === 'module'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50 translate-x-1'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className={`w-2 h-2 rounded-full shrink-0 ${activeModuleId === module.id && view === 'module' ? 'bg-white' : 'bg-transparent border border-slate-600'}`}></div>
                <span className="truncate">{module.title}</span>
              </button>
            ))}
          </div>

          <div className="pt-10 pb-4">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 pl-2">Documentation</p>
             <button
              onClick={() => onViewChange('manual')}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300 ${
                view === 'manual'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/50 translate-x-1'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'
              }`}
            >
              <i className="fas fa-book-open w-5 text-center"></i>
              <span>Full Manual</span>
            </button>
          </div>
        </nav>

        <div className="mt-auto pt-6 border-t border-white/10 shrink-0">
           <div className="bg-indigo-900/30 rounded-2xl p-4 border border-indigo-400/10 text-center">
              <p className="text-[8px] font-black text-indigo-300 uppercase tracking-widest mb-1">Authenticated Track</p>
              <p className="text-[10px] font-bold text-white uppercase tracking-tight truncate">{activeTrack.replace('_', ' ')}</p>
           </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden flex items-center justify-around p-4 bg-[#0F2C5C] border-t border-white/10 shadow-2xl">
          <button onClick={onBackToHub} className="p-2 text-indigo-300 hover:text-white" title="Hub">
            <i className="fas fa-th-large text-xl"></i>
          </button>
          <button onClick={onChangeTrack} className="p-2 text-indigo-300 hover:text-white" title="Tracks">
            <i className="fas fa-layer-group text-xl"></i>
          </button>
          <button onClick={() => onViewChange('module')} className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all ${view === 'module' ? 'bg-indigo-600 text-white' : 'bg-white/10 text-indigo-300'}`}>
            <i className="fas fa-graduation-cap text-xl"></i>
          </button>
          <button onClick={() => onViewChange('manual')} className={`p-2 transition-colors ${view === 'manual' ? 'text-emerald-400' : 'text-indigo-300'}`} title="Manual">
            <i className="fas fa-book-open text-xl"></i>
          </button>
      </div>
    </aside>
  );
};

export default Sidebar;
