
import React, { useState } from 'react';

interface SlideDeckProps {
  slides: string[];
  deepDives: string[];
}

const SlideDeck: React.FC<SlideDeckProps> = ({ slides, deepDives }) => {
  const [current, setCurrent] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  const next = () => { setCurrent((c) => (c + 1) % slides.length); setIsExpanded(false); };
  const prev = () => { setCurrent((c) => (c - 1 + slides.length) % slides.length); setIsExpanded(false); };

  return (
    <div className="space-y-6 flex flex-col items-center w-full">
      <div 
        onClick={() => !isExpanded && setIsExpanded(true)}
        className={`w-full max-w-3xl aspect-[16/9] bg-[#0F2C5C] rounded-3xl shadow-2xl relative overflow-hidden flex flex-col transition-all duration-500 ${isExpanded ? 'ring-8 ring-indigo-100 scale-[1.02]' : 'hover:ring-4 hover:ring-slate-100 cursor-pointer'}`}
      >
        {/* Slide Counter */}
        <div className="absolute top-6 left-8 text-white/30 text-xs font-bold tracking-widest uppercase">
          Key Takeaway {current + 1} of {slides.length}
        </div>

        {/* Brand Accent */}
        <div className="absolute top-0 right-0 p-8 opacity-10">
           <i className="fas fa-compass text-[12rem]"></i>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-6">
          <p className={`text-white font-light transition-all duration-500 ${isExpanded ? 'text-xl md:text-2xl border-b border-white/10 pb-4 mb-4' : 'text-2xl md:text-3xl animate-in fade-in slide-in-from-right-4'}`}>
            {slides[current]}
          </p>
          
          {isExpanded && deepDives[current] && (
            <div className="max-w-xl animate-in fade-in slide-in-from-bottom-4 duration-700">
               <p className="text-indigo-200 text-lg font-medium italic">"{deepDives[current]}"</p>
               <button 
                 onClick={(e) => { e.stopPropagation(); setIsExpanded(false); }}
                 className="mt-8 px-4 py-2 bg-white/10 text-white text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-white/20 transition-all"
               >
                 Close Detail
               </button>
            </div>
          )}
          
          {!isExpanded && (
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-widest animate-pulse">
               <i className="fas fa-plus-circle"></i>
               <span>Click to Expand Explainer</span>
            </div>
          )}
        </div>

        <div className="p-8 flex justify-between items-center border-t border-white/10 bg-black/10">
          <div className="flex gap-2">
            {slides.map((_, i) => (
              <div key={i} className={`w-2 h-2 rounded-full transition-all ${i === current ? 'bg-indigo-400 w-8' : 'bg-white/20'}`}></div>
            ))}
          </div>
          <div className="flex gap-4">
            <button onClick={(e) => { e.stopPropagation(); prev(); }} className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-colors">
              <i className="fas fa-chevron-left"></i>
            </button>
            <button onClick={(e) => { e.stopPropagation(); next(); }} className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-colors">
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
      <p className="text-slate-400 text-sm font-medium">Teacher's Note: Click the slide body to view internal deep-dive context for this key takeaway.</p>
    </div>
  );
};

export default SlideDeck;
