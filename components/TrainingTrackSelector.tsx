import React, { useState } from 'react';
import { TrainingTrack } from '../types';

interface TrainingTrackSelectorProps {
  onSelect: (track: TrainingTrack) => void;
  onBack: () => void;
}

const TrainingTrackSelector: React.FC<TrainingTrackSelectorProps> = ({ onSelect, onBack }) => {
  const [showUnderConstruction, setShowUnderConstruction] = useState<string | null>(null);

  const tracks = [
    {
      id: 'case_manager' as TrainingTrack,
      title: 'Case Manager Training',
      subtitle: 'Field Operations & Protocols',
      description: 'Master the 10 core modules of FOAM case management, from intake to graduation.',
      icon: 'fa-user-tie',
      color: 'bg-indigo-600',
      gradient: 'from-indigo-600 to-indigo-800',
      available: true
    },
    {
      id: 'board' as TrainingTrack,
      title: 'Board Member Training',
      subtitle: 'Governance & Stewardship',
      description: 'Understand fiduciary duties, mission protection, and organizational oversight.',
      icon: 'fa-landmark',
      color: 'bg-slate-800',
      gradient: 'from-slate-800 to-slate-900',
      available: false
    },
    {
      id: 'facilitator' as TrainingTrack,
      title: 'Facilitator Training for Responsible Fatherhood Classes',
      subtitle: 'Group Dynamics & Circles',
      description: 'Learn the art of leading fatherhood circles and managing group energy using NPCL curriculum.',
      icon: 'fa-users-viewfinder',
      color: 'bg-emerald-600',
      gradient: 'from-emerald-600 to-emerald-800',
      available: false
    }
  ];

  const handleTrackClick = (track: typeof tracks[0]) => {
    if (track.available) {
      onSelect(track.id);
    } else {
      setShowUnderConstruction(track.title);
    }
  };

  // Under Construction Screen
  if (showUnderConstruction) {
    return (
      <div className="min-h-screen bg-[#0F2C5C] flex flex-col items-center justify-center p-6 md:p-12 animate-in fade-in duration-500">
        <div className="max-w-2xl w-full text-center space-y-8">
          {/* Construction Icon */}
          <div className="relative">
            <div className="w-32 h-32 bg-gradient-to-br from-amber-400 to-orange-500 rounded-[2.5rem] flex items-center justify-center shadow-2xl mx-auto transform rotate-3 animate-pulse">
              <i className="fas fa-hard-hat text-white text-5xl"></i>
            </div>
            <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg mx-auto" style={{ left: '50%', transform: 'translateX(30px)' }}>
              <i className="fas fa-wrench text-amber-500 text-xl"></i>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
              Under Construction
            </h1>
            <div className="inline-block bg-amber-500/20 border border-amber-500/30 rounded-full px-6 py-2">
              <p className="text-amber-300 font-bold text-sm uppercase tracking-widest">
                {showUnderConstruction}
              </p>
            </div>
          </div>

          {/* Message */}
          <div className="space-y-4 max-w-md mx-auto">
            <p className="text-indigo-200 text-lg leading-relaxed">
              We're working hard to bring you this training module. Check back soon for updates!
            </p>
            <div className="flex items-center justify-center gap-3 text-indigo-400">
              <i className="fas fa-clock"></i>
              <span className="font-medium">Expected: Coming Soon</span>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="bg-white/10 rounded-full h-3 w-64 mx-auto overflow-hidden">
            <div className="bg-gradient-to-r from-amber-400 to-orange-500 h-full w-1/3 rounded-full animate-pulse"></div>
          </div>

          {/* Back Button */}
          <div className="pt-8">
            <button
              onClick={() => setShowUnderConstruction(null)}
              className="inline-flex items-center gap-3 bg-white text-[#0F2C5C] px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-indigo-100 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
            >
              <i className="fas fa-arrow-left"></i>
              Back to Training Academy
            </button>
          </div>

          {/* Footer */}
          <div className="pt-8">
            <p className="text-indigo-400/60 font-bold text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2">
              <i className="fas fa-tools"></i>
              Module in Development
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Main Track Selection Screen
  return (
    <div className="min-h-screen bg-[#0F2C5C] flex flex-col items-center justify-center p-6 md:p-12 animate-in fade-in duration-700">
      <div className="max-w-5xl w-full space-y-12">
        <div className="text-center space-y-4">
           <button 
             onClick={onBack}
             className="mb-8 inline-flex items-center gap-2 text-indigo-300 font-bold text-xs uppercase tracking-widest hover:text-white transition-colors"
           >
             <i className="fas fa-arrow-left"></i> Return to Command Center
           </button>
           
           <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center shadow-2xl mx-auto mb-6 transform rotate-3">
              <span className="text-[#0F2C5C] font-black text-4xl italic tracking-tighter">F</span>
           </div>
           
           <h1 className="text-5xl font-black text-white tracking-tight">Training Academy</h1>
           <p className="text-indigo-200 text-lg font-medium max-w-2xl mx-auto uppercase tracking-widest">Select Your Training Track</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tracks.map((track) => (
            <button
              key={track.id}
              onClick={() => handleTrackClick(track)}
              className="group relative bg-white rounded-[3rem] p-10 shadow-2xl hover:shadow-indigo-500/20 hover:-translate-y-2 transition-all duration-500 text-left overflow-hidden flex flex-col justify-between min-h-[400px]"
            >
              {/* Visual Flare */}
              <div className={`absolute -right-8 -top-8 w-32 h-32 ${track.color} opacity-5 rounded-full group-hover:scale-150 transition-transform duration-700`}></div>
              
              {/* Coming Soon Badge for unavailable tracks */}
              {!track.available && (
                <div className="absolute top-6 right-6 bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                  Coming Soon
                </div>
              )}
              
              <div className="space-y-6 relative z-10">
                <div className={`w-16 h-16 bg-gradient-to-br ${track.gradient} text-white rounded-2xl flex items-center justify-center text-2xl shadow-lg group-hover:rotate-6 transition-transform ${!track.available ? 'opacity-60' : ''}`}>
                  <i className={`fas ${track.icon}`}></i>
                </div>
                
                <div className="space-y-2">
                  <h2 className={`text-2xl font-black text-slate-800 tracking-tight leading-tight ${!track.available ? 'text-slate-500' : ''}`}>{track.title}</h2>
                  <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${track.available ? 'text-indigo-500' : 'text-slate-400'}`}>{track.subtitle}</p>
                </div>
                
                <p className={`font-medium leading-relaxed ${track.available ? 'text-slate-500' : 'text-slate-400'}`}>
                  {track.description}
                </p>
              </div>
              
              <div className="mt-8 pt-8 border-t border-slate-100 flex items-center justify-between">
                <span className={`text-xs font-black uppercase tracking-[0.2em] transition-colors ${track.available ? 'text-slate-400 group-hover:text-indigo-600' : 'text-slate-300'}`}>
                  {track.available ? 'Start Training' : 'Coming Soon'}
                </span>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${track.available ? 'bg-slate-50 text-slate-300 group-hover:bg-indigo-600 group-hover:text-white' : 'bg-slate-50 text-slate-300'}`}>
                  <i className={`fas ${track.available ? 'fa-chevron-right' : 'fa-lock'} text-xs`}></i>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="text-center pt-8">
           <p className="text-indigo-400 font-bold text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3">
             <i className="fas fa-shield-halved"></i>
             FOAM INTERNAL TRAINING PROTOCOL • SECURE SESS-ID: {Math.random().toString(36).substring(7).toUpperCase()}
           </p>
        </div>
      </div>
    </div>
  );
};

export default TrainingTrackSelector;
