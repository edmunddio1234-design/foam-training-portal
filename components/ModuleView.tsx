
import React, { useState, useEffect } from 'react';
import { ModuleContent, ModuleVideo } from '../types';
import Infographic from './Infographic';
import SlideDeck from './SlideDeck';
import Quiz from './Quiz';

interface ModuleViewProps {
  module: ModuleContent;
  onNext: () => void;
  nextModuleTitle?: string;
}

const ModuleView: React.FC<ModuleViewProps> = ({ module, onNext, nextModuleTitle }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'video' | 'graphic' | 'slides' | 'quiz'>('info');
  const [hoverObjective, setHoverObjective] = useState<number | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<ModuleVideo | null>(null);
  const [isCertified, setIsCertified] = useState(false);

  const tabs: ('info' | 'video' | 'graphic' | 'slides' | 'quiz')[] = ['info', 'video', 'graphic', 'slides', 'quiz'];
  const currentIndex = tabs.indexOf(activeTab);

  // Reset module states when switching modules
  useEffect(() => {
    setSelectedVideo(null);
    setIsCertified(false);
    setActiveTab('info');
  }, [module.id]);

  const handleNextSection = () => {
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1]);
    }
  };

  const handlePrevSection = () => {
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1]);
    }
  };

  const renderVideoTab = () => {
    if (selectedVideo) {
      return (
        <div className="h-full flex flex-col items-center animate-in fade-in duration-500 space-y-8">
          <div className="w-full flex justify-start max-w-4xl">
            <button 
              onClick={() => setSelectedVideo(null)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs hover:bg-slate-200 transition-all uppercase tracking-widest"
            >
              <i className="fas fa-arrow-left"></i>
              Back to Video List
            </button>
          </div>

          <div className="w-full max-w-4xl aspect-video bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl ring-8 ring-slate-50">
            <iframe 
              className="w-full h-full"
              src={selectedVideo.url} 
              title={selectedVideo.title}
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
          </div>

          <div className="w-full max-w-4xl space-y-4 text-center">
            <h3 className="text-2xl font-black text-slate-800">{selectedVideo.title}</h3>
            {selectedVideo.description && (
              <p className="text-slate-500 font-medium">{selectedVideo.description}</p>
            )}
          </div>
        </div>
      );
    }

    if (module.videoList && module.videoList.length > 0) {
      return (
        <div className="h-full animate-in fade-in duration-500 space-y-10">
          <div className="w-full flex justify-start max-w-5xl mx-auto">
            <button 
              onClick={() => setActiveTab('info')}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-500 rounded-xl font-bold text-xs hover:bg-slate-200 transition-all uppercase tracking-widest"
            >
              <i className="fas fa-chevron-left"></i>
              Back to Overview
            </button>
          </div>

          <div className="text-center space-y-3">
            <h3 className="text-3xl font-black text-[#0F2C5C] tracking-tight">Training Video Library</h3>
            <p className="text-slate-500 font-medium">Select a training video to begin your deep dive into {module.title}.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {module.videoList.map((video, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedVideo(video)}
                className="group relative bg-white border border-slate-100 p-6 rounded-3xl shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all text-left flex flex-col gap-4 overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
                  <i className="fas fa-play text-8xl"></i>
                </div>
                
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <i className="fas fa-play text-sm"></i>
                </div>
                
                <div className="space-y-2 relative z-10">
                  <h4 className="text-lg font-black text-slate-800 tracking-tight leading-tight">{video.title}</h4>
                  {video.description && (
                    <p className="text-sm text-slate-500 font-medium line-clamp-2">{video.description}</p>
                  )}
                </div>
                
                <div className="mt-2 flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest pt-4 border-t border-slate-50">
                   <span>Launch Video</span>
                   <i className="fas fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
                </div>
              </button>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="h-full flex flex-col items-center animate-in fade-in duration-500 space-y-8">
        <div className="w-full max-w-4xl aspect-video bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl ring-8 ring-slate-50">
           <iframe 
             className="w-full h-full"
             src={module.videoUrl} 
             title="Video Presentation"
             frameBorder="0" 
             allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
             allowFullScreen
           ></iframe>
        </div>
        
        {module.videoSummary && (
          <div className="w-full max-w-4xl space-y-6">
             <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <i className="fas fa-file-invoice text-indigo-600 text-lg"></i>
                <h4 className="text-lg font-black text-slate-800 uppercase tracking-tight">Executive Summary</h4>
             </div>
             <div className="p-8 bg-indigo-50/50 rounded-3xl border border-indigo-100 shadow-sm">
                <p className="text-slate-700 leading-relaxed font-bold text-lg italic">
                  {module.videoSummary}
                </p>
             </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Tab Landing Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] mb-1 block">Academy Tracker</span>
           <h2 className="text-2xl font-black text-slate-800 leading-none">{module.title}</h2>
        </div>
        
        {/* Navigation Tabs Bar */}
        <div className="flex flex-wrap gap-1 p-1 bg-slate-50 rounded-xl border border-slate-100">
          <TabButton active={activeTab === 'info'} onClick={() => setActiveTab('info')} icon="fa-info-circle" label="Overview" />
          <TabButton active={activeTab === 'video'} onClick={() => setActiveTab('video')} icon="fa-play-circle" label="Videos" />
          <TabButton active={activeTab === 'graphic'} onClick={() => setActiveTab('graphic')} icon="fa-chart-pie" label="Infographic" />
          <TabButton active={activeTab === 'slides'} onClick={() => setActiveTab('slides')} icon="fa-film" label="Slide Deck" />
          <TabButton active={activeTab === 'quiz'} onClick={() => setActiveTab('quiz')} icon="fa-check-double" label="Quiz" />
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl overflow-hidden min-h-[600px] flex flex-col border border-slate-100">
        <div className="p-8 md:p-12 flex-1">
          {activeTab === 'info' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-10">
              <div className="max-w-3xl space-y-4">
                <div className="inline-flex px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-bold uppercase tracking-widest">Introduction</div>
                <h3 className="text-4xl font-black text-slate-900 tracking-tight leading-[1.1]">{module.subtitle}</h3>
                <p className="text-xl text-slate-500 font-medium leading-relaxed">{module.description}</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <h4 className="text-lg font-bold text-[#0F2C5C] flex items-center gap-2 border-b border-slate-100 pb-3">
                    <i className="fas fa-graduation-cap"></i>
                    Learning Objectives
                  </h4>
                  <div className="space-y-4 relative">
                    {module.learningObjectives.map((obj, i) => (
                      <div 
                        key={i} 
                        className="flex gap-4 group cursor-default"
                        onMouseEnter={() => setHoverObjective(i)}
                        onMouseLeave={() => setHoverObjective(null)}
                      >
                        <div className={`flex-shrink-0 w-8 h-8 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center text-xs font-black transition-all ${hoverObjective === i ? 'bg-indigo-600 text-white shadow-lg' : 'group-hover:bg-indigo-100 group-hover:text-indigo-600'}`}>{i+1}</div>
                        <div className="flex-1 space-y-1">
                          <p className={`text-slate-700 font-semibold leading-tight pt-1 transition-colors ${hoverObjective === i ? 'text-indigo-600' : ''}`}>
                            {obj.title}
                          </p>
                          {hoverObjective === i && (
                            <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100 text-xs text-indigo-700 font-bold animate-in fade-in slide-in-from-top-1 duration-200">
                              {obj.summary}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-6">
                  <div className="bg-slate-900 p-8 rounded-[2rem] text-white relative overflow-hidden">
                    <i className="fas fa-shield-heart absolute -right-4 -bottom-4 text-8xl opacity-10"></i>
                    <div className="relative z-10 space-y-3">
                        <h4 className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Track Status</h4>
                        <div className="flex items-center gap-4">
                           <div className={`w-3 h-3 rounded-full ${isCertified ? 'bg-emerald-500' : 'bg-amber-400 animate-pulse'}`}></div>
                           <p className="text-sm font-bold">{isCertified ? 'Module Certified' : 'Learning Phase Active'}</p>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-2">Pass the quiz to unlock the next module in this training track.</p>
                    </div>
                  </div>
                  
                  {nextModuleTitle && (
                    <div className="bg-indigo-50 border-2 border-indigo-100 p-8 rounded-[2rem] space-y-4 shadow-sm animate-in fade-in duration-700">
                      <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Next in Series</h4>
                      <div className="flex items-center justify-between">
                         <p className="text-lg font-black text-indigo-900 leading-tight">{nextModuleTitle}</p>
                         <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-400 border border-indigo-100">
                            <i className="fas fa-chevron-right"></i>
                         </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'video' && renderVideoTab()}

          {activeTab === 'graphic' && (
            <div className="animate-in zoom-in-95 duration-500 h-full">
              <Infographic 
                type={module.infographicType} 
                title={module.title} 
                sections={module.infographicDetails || []} 
                practice={module.infographicPractice}
              />
            </div>
          )}

          {activeTab === 'slides' && (
            <div className="animate-in fade-in duration-500 h-full flex flex-col justify-center">
              <SlideDeck slides={module.slides} deepDives={module.slideDeepDives || []} />
            </div>
          )}

          {activeTab === 'quiz' && (
            <div className="animate-in slide-in-from-right-4 duration-500 h-full flex flex-col items-center justify-center">
              <Quiz 
                questions={module.quiz} 
                onComplete={onNext} 
                onPass={() => setIsCertified(true)}
              />
            </div>
          )}
        </div>

        {/* --- NAVIGATION FOOTER: Consolidated Controls --- */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6 px-10">
           <div className="flex flex-wrap items-center gap-4">
              <button 
                onClick={handlePrevSection}
                disabled={currentIndex === 0}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${currentIndex === 0 ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-white text-[#0F2C5C] border border-slate-200 shadow-sm hover:bg-indigo-50'}`}
              >
                <i className="fas fa-chevron-left"></i>
                Previous Section
              </button>

              <button 
                onClick={handleNextSection}
                disabled={currentIndex === tabs.length - 1}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${currentIndex === tabs.length - 1 ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-white text-[#0F2C5C] border border-slate-200 shadow-sm hover:bg-indigo-50'}`}
              >
                Next Section
                <i className="fas fa-chevron-right"></i>
              </button>

              {nextModuleTitle && (
                <button 
                  onClick={onNext}
                  disabled={!isCertified}
                  className={`px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 transition-all shadow-xl ${isCertified ? 'bg-[#0F2C5C] text-white hover:bg-slate-800' : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'}`}
                >
                  {isCertified ? 'Proceed to Next Module' : 'Complete Quiz to Advance'}
                  <i className="fas fa-forward"></i>
                </button>
              )}
           </div>

           <div className="flex items-center gap-4">
              <div className="hidden lg:flex gap-1.5">
                {tabs.map((_, i) => (
                  <div key={i} className={`w-2 h-2 rounded-full transition-all ${i === currentIndex ? 'bg-indigo-600 w-6' : 'bg-slate-300'}`}></div>
                ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const TabButton: React.FC<{ active: boolean; onClick: () => void; icon: string; label: string }> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
      active ? 'bg-[#0F2C5C] text-white shadow-md' : 'text-slate-400 hover:bg-white hover:text-slate-600'
    }`}
  >
    <i className={`fas ${icon}`}></i>
    <span className="hidden lg:inline">{label}</span>
  </button>
);

export default ModuleView;
