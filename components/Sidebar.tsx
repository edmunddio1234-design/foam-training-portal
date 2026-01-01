
import React from 'react';
import { ModuleType } from '../types';
import { FOAM_MODULES } from '../constants';

interface SidebarProps {
  activeModuleId: ModuleType;
  onModuleSelect: (id: ModuleType) => void;
  view: 'module' | 'manual';
  onViewChange: (view: 'module' | 'manual') => void;
  onBackToHub?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeModuleId, onModuleSelect, view, onViewChange, onBackToHub }) => {
  return (
    <aside className="fixed bottom-0 left-0 w-full md:w-64 md:h-full bg-[#0F2C5C] text-white z-50 flex flex-col md:static shadow-2xl">
      <div className="p-6 hidden md:flex flex-col h-full">
        <div className="flex items-center gap-3 mb-10">
           <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-inner">
             <span className="text-[#0F2C5C] font-black text-2xl italic tracking-tighter">F</span>
           </div>
           <div>
             <span className="font-black text-xl tracking-tight block leading-none">FOAM</span>
             <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">Training Portal</span>
           </div>
        </div>
        
        <nav className="space-y-2 flex-1 overflow-y-auto hide-scrollbar">
          <button 
            onClick={onBackToHub}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-black text-indigo-300 hover:bg-white/5 transition-all mb-6 border border-indigo-500/20"
          >
            <i className="fas fa-th-large w-5 text-center"></i>
            <span>Command Center</span>
          </button>

          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 pl-2">Academy Tracks</p>
          {FOAM_MODULES.map((module) => (
            <button
              key={module.id}
              onClick={() => onModuleSelect(module.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300 ${
                activeModuleId === module.id && view === 'module'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50 translate-x-1'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${activeModuleId === module.id && view === 'module' ? 'bg-white' : 'bg-transparent border border-slate-600'}`}></div>
              <span className="truncate">{module.title}</span>
            </button>
          ))}

          <div className="pt-10 pb-4">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 pl-2">Reference</p>
             <button
              onClick={() => onViewChange('manual')}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300 ${
                view === 'manual'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/50 translate-x-1'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <i className="fas fa-book-open w-5 text-center"></i>
              <span>Full Manual</span>
            </button>
          </div>
        </nav>

        <div className="mt-auto pt-6 border-t border-white/10">
           <div className="bg-indigo-900/30 rounded-2xl p-4 border border-indigo-400/10">
              <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-1">Status</p>
              <p className="text-xs font-bold text-white">Active Academy Session</p>
           </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <div className="md:hidden flex items-center justify-around p-3 bg-[#0F2C5C] border-t border-indigo-900 shadow-inner">
          <button onClick={onBackToHub} className="p-3 text-slate-400 hover:text-white"><i className="fas fa-th-large text-lg"></i></button>
          <button onClick={() => onModuleSelect(activeModuleId)} className="p-3 text-white bg-indigo-600 rounded-xl px-6"><i className="fas fa-graduation-cap text-lg"></i></button>
          <button onClick={() => onViewChange('manual')} className="p-3 text-slate-400 hover:text-white"><i className="fas fa-book text-lg"></i></button>
      </div>
    </aside>
  );
};

export default Sidebar;
