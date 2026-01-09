import React from 'react';
import { ModuleContent } from '../types';

interface HeaderProps {
  activeModule: ModuleContent;
  view: 'module' | 'manual';
  onToggleAssistant: () => void;
}

const Header: React.FC<HeaderProps> = ({ activeModule, view, onToggleAssistant }) => {
  return (
    <header className="bg-white border-b border-slate-100 px-6 py-4 sticky top-0 z-40 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Left Section - Module/View Info */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-3">
            <div className="w-10 h-10 bg-[#0F2C5C] text-white rounded-xl flex items-center justify-center shadow-md">
              <i className={`fas ${view === 'manual' ? 'fa-book-open' : 'fa-graduation-cap'} text-sm`}></i>
            </div>
            <div>
              <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">
                {view === 'manual' ? 'Reference Manual' : 'Training Module'}
              </p>
              <h1 className="text-lg font-bold text-slate-800 leading-tight truncate max-w-md">
                {view === 'manual' ? 'Full Documentation' : activeModule?.title || 'Loading...'}
              </h1>
            </div>
          </div>
          
          {/* Mobile Title */}
          <div className="md:hidden">
            <p className="text-sm font-bold text-slate-800 truncate max-w-[200px]">
              {view === 'manual' ? 'Manual' : activeModule?.title || 'Loading...'}
            </p>
          </div>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-3">
          {/* Progress Indicator (optional visual) */}
          <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              {view === 'manual' ? 'Reference Mode' : 'Learning Active'}
            </span>
          </div>

          {/* AI Assistant Toggle */}
          <button
            onClick={onToggleAssistant}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl font-bold text-xs uppercase tracking-widest transition-all border border-indigo-100 hover:border-indigo-200"
            title="Toggle AI Assistant"
          >
            <i className="fas fa-robot"></i>
            <span className="hidden sm:inline">AI Help</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
