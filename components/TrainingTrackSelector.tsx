
import React from 'react';
import { TrainingTrack } from '../types';

interface TrainingTrackSelectorProps {
  onSelect: (track: TrainingTrack) => void;
  onBack: () => void;
}

const TrainingTrackSelector: React.FC<TrainingTrackSelectorProps> = ({ onSelect, onBack }) => {
  const tracks = [
    {
      id: 'case_manager' as TrainingTrack,
      title: 'Case Manager Training',
      subtitle: 'Field Operations & Protocols',
      description: 'Master the 10 core modules of FOAM case management, from intake to graduation.',
      icon: 'fa-user-tie',
      color: 'bg-indigo-600',
      gradient: 'from-indigo-600 to-indigo-800'
    },
    {
      id: 'board' as TrainingTrack,
      title: 'Board Member Training',
      subtitle: 'Governance & Stewardship',
      description: 'Understand fiduciary duties, mission protection, and organizational oversight.',
      icon: 'fa-landmark',
      color: 'bg-slate-800',
      gradient: 'from-slate-800 to-slate-900'
    },
    {
      id: 'facilitator' as TrainingTrack,
      title: 'Facilitator Training for Responsible Fatherhood Classes',
      subtitle: 'Group Dynamics & Circles',
      description: 'Learn the art of leading fatherhood circles and managing group energy using NPCL curriculum.',
      icon: 'fa-users-viewfinder',
      color: 'bg-emerald-600',
      gradient: 'from-emerald-600 to-emerald-800'
    }
  ];

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
              onClick={() => onSelect(track.id)}
              className="group relative bg-white rounded-[3rem] p-10 shadow-2xl hover:shadow-indigo-500/20 hover:-translate-y-2 transition-all duration-500 text-left overflow-hidden flex flex-col justify-between min-h-[400px]"
            >
              {/* Visual Flare */}
              <div className={`absolute -right-8 -top-8 w-32 h-32 ${track.color} opacity-5 rounded-full group-hover:scale-150 transition-transform duration-700`}></div>
              
              <div className="space-y-6 relative z-10">
                <div className={`w-16 h-16 bg-gradient-to-br ${track.gradient} text-white rounded-2xl flex items-center justify-center text-2xl shadow-lg group-hover:rotate-6 transition-transform`}>
                  <i className={`fas ${track.icon}`}></i>
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-tight">{track.title}</h2>
                  <p className={`text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500`}>{track.subtitle}</p>
                </div>
                
                <p className="text-slate-500 font-medium leading-relaxed">
                  {track.description}
                </p>
              </div>
              
              <div className="mt-8 pt-8 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-indigo-600 transition-colors">Start Training</span>
                <div className={`w-10 h-10 rounded-full bg-slate-50 text-slate-300 flex items-center justify-center group-hover:${track.color} group-hover:text-white transition-all`}>
                  <i className="fas fa-chevron-right text-xs"></i>
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
