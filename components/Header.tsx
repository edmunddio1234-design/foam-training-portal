
import React from 'react';
import { ModuleContent } from '../types';

interface HeaderProps {
  activeModule: ModuleContent;
  view: 'module' | 'manual';
  onToggleAssistant: () => void;
}

const Header: React.FC<HeaderProps> = ({ activeModule, view, onToggleAssistant }) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-4">
        <div className="md:hidden flex items-center justify-center w-8 h-8 rounded bg-indigo-50 text-indigo-600">
            <i className="fas fa-bars"></i>
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-800">
            {view === 'module' ? activeModule.title : 'Full Reference Manual'}
          </h1>
          <p className="text-sm text-slate-500 hidden sm:block">
            {view === 'module' ? activeModule.subtitle : 'Comprehensive guide for Case Managers'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden lg:flex items-center gap-2">
           <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Mission:</span>
           <span className="text-xs font-semibold text-indigo-600 italic">"Enhance Fathers, Strengthen Families"</span>
        </div>
        <button 
          onClick={onToggleAssistant}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-sm font-medium hover:bg-indigo-100 transition-colors"
        >
          <i className="fas fa-sparkles"></i>
          <span>Ask AI</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
