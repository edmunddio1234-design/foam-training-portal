import React, { useState, useEffect } from 'react';
import { SubSection, PracticeScenario } from '../types';
import { GoogleGenAI } from "@google/genai";

interface InfographicProps {
  type: 'pillars' | 'workflow' | 'pathway' | 'tree' | 'protocol' | 'none';
  title: string;
  sections: SubSection[];
  practice?: PracticeScenario;
}

const Infographic: React.FC<InfographicProps> = ({ type, title, sections, practice }) => {
  const [isDrilledDown, setIsDrilledDown] = useState(false);
  const [activeSection, setActiveSection] = useState<SubSection | null>(null);
  const [overviewText, setOverviewText] = useState<string | null>(null);
  const [isGeneratingOverview, setIsGeneratingOverview] = useState(false);

  const generateOverviewVisual = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (isGeneratingOverview) return;
    
    setIsGeneratingOverview(true);
    try {
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
      const sectionDetails = sections.map(s => `${s.title}: ${s.description}`).join('; ');
      
      const prompt = `Create a brief executive summary (3-4 sentences) for a FOAM training module titled "${title}". Key sections include: ${sectionDetails}. Be professional and encouraging.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt
      });

      const text = response.text;
      if (text) {
        setOverviewText(text);
      }
    } catch (err) {
      console.error("AI Overview Generation failed", err);
      setOverviewText("Unable to generate overview. Please try again.");
    } finally {
      setIsGeneratingOverview(false);
    }
  };

  if (type === 'none') {
    return (
      <div className="h-full flex items-center justify-center p-12 text-center bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
        <div>
           <i className="fas fa-image text-4xl text-slate-300 mb-4"></i>
           <p className="text-slate-500 font-medium">Focus on text content for this foundational section.</p>
        </div>
      </div>
    );
  }

  if (!isDrilledDown) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4 md:p-12 animate-in fade-in zoom-in-95 duration-500">
        <div 
          onClick={() => setIsDrilledDown(true)}
          className="group relative w-full max-w-4xl aspect-video bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col items-center justify-center text-center hover:scale-[1.01] transition-all duration-500 border-8 border-white cursor-pointer"
        >
          <div className="absolute inset-0 transition-opacity duration-700">
            <div className="w-full h-full bg-gradient-to-br from-[#0F2C5C] to-indigo-900">
               <div className="absolute inset-0 opacity-10">
                 <i className="fas fa-project-diagram text-[20rem] -translate-x-20 -translate-y-10 rotate-12"></i>
               </div>
            </div>
          </div>

          <div className="relative z-10 space-y-6 p-10">
            <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto backdrop-blur-md group-hover:rotate-12 transition-transform">
               <i className="fas fa-expand-arrows-alt text-white text-3xl"></i>
            </div>
            
            <div>
                <h2 className="text-4xl font-black text-white tracking-tight drop-shadow-lg">{title}</h2>
                <p className="text-indigo-100 text-lg font-medium opacity-90 drop-shadow-md mt-2">Interactive Visual Guide</p>
            </div>

            {overviewText && (
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 max-w-2xl mx-auto border border-white/20">
                <p className="text-white/90 text-sm leading-relaxed">{overviewText}</p>
              </div>
            )}
            
            <div className="pt-4 flex flex-col md:flex-row items-center justify-center gap-4">
              <button className="px-8 py-3 bg-white text-[#0F2C5C] rounded-full font-black uppercase text-xs tracking-widest hover:bg-indigo-50 transition-colors shadow-lg">
                Begin Drill Down
              </button>
              
              <button 
                 onClick={generateOverviewVisual}
                 disabled={isGeneratingOverview}
                 className="px-6 py-3 bg-indigo-600/80 backdrop-blur-md text-white rounded-full font-black uppercase text-xs tracking-widest hover:bg-indigo-600 transition-colors shadow-lg flex items-center gap-2 border border-white/20"
              >
                 {isGeneratingOverview ? (
                     <><i className="fas fa-circle-notch fa-spin"></i> Generating...</>
                 ) : (
                     <><i className="fas fa-magic"></i> {overviewText ? 'Regenerate' : 'Generate AI Overview'}</>
                 )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 overflow-y-auto max-h-[75vh] hide-scrollbar pb-16 px-4 animate-in slide-in-from-bottom-8 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-center md:text-left space-y-2">
          <h2 className="text-4xl font-black text-[#0F2C5C] tracking-tight">{title}</h2>
          <p className="text-slate-500 font-medium max-w-2xl">Interactive Model: Select a component to view standards and details.</p>
        </div>
        <button 
          onClick={() => setIsDrilledDown(false)}
          className="px-4 py-2 bg-slate-100 text-slate-500 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center gap-2"
        >
          <i className="fas fa-arrow-left"></i> Back to Cover
        </button>
      </div>

      {type === 'protocol' ? (
        <ProtocolLayout sections={sections} onSelect={setActiveSection} practice={practice} />
      ) : (
        <div className={`grid gap-6 ${type === 'pillars' ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
          {sections.map((section, idx) => (
            <InteractiveCard 
              key={idx}
              section={section}
              onClick={() => setActiveSection(section)}
              color={section.color || getPillarColor(idx, type)}
            />
          ))}
        </div>
      )}

      {activeSection && (
        <DetailModal 
          section={activeSection} 
          onClose={() => setActiveSection(null)} 
          color={activeSection.color || getPillarColor(sections.indexOf(activeSection), type)}
        />
      )}
    </div>
  );
};

const ProtocolLayout: React.FC<{ sections: SubSection[]; onSelect: (s: SubSection) => void; practice?: PracticeScenario }> = ({ sections, onSelect, practice }) => {
  return (
    <div className="space-y-16 animate-in fade-in duration-700">
      <div className="relative flex flex-col lg:flex-row items-start justify-between gap-8 pt-10">
        <div className="absolute top-12 left-0 w-full h-1 bg-slate-100 hidden lg:block rounded-full"></div>
        
        {sections.map((s, i) => (
          <div key={i} className="relative z-10 flex-1 w-full lg:w-auto">
            <button 
              onClick={() => onSelect(s)}
              className="group w-full flex flex-col items-center text-center space-y-4"
            >
              <div className={`w-24 h-24 rounded-full ${s.color || 'bg-indigo-600'} text-white flex items-center justify-center text-2xl font-black shadow-xl ring-8 ring-white group-hover:scale-110 transition-transform duration-300`}>
                <i className={`fas ${s.graphic || 'fa-info-circle'}`}></i>
              </div>
              <div className="space-y-1">
                <h4 className="font-black text-slate-800 uppercase tracking-tight text-sm">
                  {s.title}
                </h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed px-4 line-clamp-2">{s.description}</p>
              </div>
            </button>
          </div>
        ))}
      </div>

      {practice && (
        <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl border-4 border-slate-800">
          <div className="absolute top-0 right-0 p-10 opacity-10">
            <i className="fas fa-rocket text-[12rem]"></i>
          </div>
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-10 items-center">
            <div className="md:col-span-1 space-y-4">
               <h3 className="text-2xl font-black tracking-tight">{practice.title}</h3>
               <p className="text-slate-400 font-medium leading-relaxed">{practice.scenario}</p>
            </div>
            <div className="md:col-span-2 flex flex-wrap gap-4">
              {practice.steps.map((step, idx) => (
                <div key={idx} className="flex-1 min-w-[180px] bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-sm">
                   <div className="w-6 h-6 rounded-lg bg-indigo-500 text-[10px] flex items-center justify-center font-black mb-3">{idx + 1}</div>
                   <p className="text-xs font-semibold leading-relaxed text-slate-200">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const InteractiveCard: React.FC<{ section: SubSection; onClick: () => void; color: string }> = ({ section, onClick, color }) => (
  <button 
    onClick={onClick}
    className="group flex flex-col h-full bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-indigo-200 transition-all duration-300 overflow-hidden text-left"
  >
    <div className={`${color} p-10 flex flex-col items-center gap-4 text-white w-full`}>
      <i className={`fas ${section.graphic || 'fa-info-circle'} text-5xl group-hover:scale-110 transition-transform duration-500`}></i>
      <h3 className="text-xl font-black uppercase tracking-tight text-center">{section.title}</h3>
    </div>
    <div className="p-10 flex-1 bg-white space-y-4">
      <p className="text-sm font-semibold text-slate-500 leading-relaxed line-clamp-3">
        {section.description}
      </p>
      <div className="flex items-center gap-2 text-indigo-600 text-xs font-black uppercase tracking-[0.2em] pt-2 border-t border-slate-50">
        <span>View Explainer</span>
        <i className="fas fa-arrow-right text-[10px] group-hover:translate-x-1 transition-transform"></i>
      </div>
    </div>
  </button>
);

const DetailModal: React.FC<{ section: SubSection; onClose: () => void; color: string }> = ({ section, onClose, color }) => {
  const [aiText, setAiText] = useState<string | null>(null);
  const [generatingText, setGeneratingText] = useState(false);

  const generateAIExplanation = async () => {
    if (generatingText) return;
    setGeneratingText(true);
    try {
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
      const prompt = `Provide a brief, encouraging explanation (2-3 sentences) about "${section.title}" for a fatherhood mentorship training program. Context: ${section.description}. Be professional and supportive.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt
      });

      const text = response.text;
      if (text) {
        setAiText(text);
      }
    } catch (err) {
      console.error("AI Explanation failed", err);
      setAiText("Unable to generate explanation. Please try again.");
    } finally {
      setGeneratingText(false);
    }
  };

  useEffect(() => {
    generateAIExplanation();
  }, [section.title]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-5xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-400 flex flex-col md:flex-row">
         
         <div className={`w-full md:w-5/12 ${color} p-10 flex flex-col items-center justify-center text-white relative`}>
            <div className="text-center space-y-6">
              <i className={`fas ${section.graphic || 'fa-info-circle'} text-8xl opacity-80`}></i>
              <h3 className="text-2xl font-black uppercase tracking-tight">{section.title}</h3>
              {generatingText ? (
                <div className="flex items-center gap-2 text-white/60">
                  <i className="fas fa-circle-notch fa-spin"></i>
                  <span className="text-xs font-bold uppercase tracking-widest">Generating insight...</span>
                </div>
              ) : aiText && (
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                  <p className="text-sm text-white/90 leading-relaxed">{aiText}</p>
                </div>
              )}
              <button 
                onClick={generateAIExplanation} 
                disabled={generatingText}
                className="text-xs text-white/50 hover:text-white underline"
              >
                {generatingText ? 'Generating...' : 'Regenerate Insight'}
              </button>
            </div>
         </div>

         <div className="w-full md:w-7/12 p-10 md:p-14 space-y-10 overflow-y-auto max-h-[70vh] md:max-h-none text-left bg-white">
            <div className="flex justify-between items-start">
               <div className="space-y-1">
                  <h3 className="text-3xl font-black uppercase tracking-tight leading-none text-slate-800">{section.title}</h3>
                  <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Internal Protocol Details</p>
               </div>
               <button onClick={onClose} className="w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center transition-colors text-slate-400">
                  <i className="fas fa-times text-lg"></i>
               </button>
            </div>

            <div className="space-y-4">
               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Core Standard</h4>
               <p className="text-xl text-slate-700 font-bold leading-tight italic">
                  "{section.description}"
               </p>
            </div>
            
            {section.details && section.details.length > 0 && (
              <div className="space-y-6">
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] pb-2 border-b border-slate-100">Key Execution Points</h4>
                 <div className="grid grid-cols-1 gap-3">
                   {section.details.map((point, i) => (
                     <div 
                       key={i} 
                       className="group flex flex-col p-4 rounded-2xl border bg-slate-50 border-transparent hover:bg-indigo-50 hover:border-indigo-200 transition-all duration-300"
                     >
                        <div className="flex gap-4 items-center">
                          <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 bg-indigo-100 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                            {i + 1}
                          </div>
                          <p className="text-sm font-bold text-slate-700 group-hover:text-indigo-900">
                            {point.label}
                          </p>
                        </div>
                     </div>
                   ))}
                 </div>
              </div>
            )}
            
            <button onClick={onClose} className="w-full py-4 bg-[#0F2C5C] text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-black transition-all shadow-lg">
               Return to Guide
            </button>
         </div>
      </div>
    </div>
  );
};

function getPillarColor(idx: number, type: string): string {
  const colors = ['bg-[#0F2C5C]', 'bg-indigo-600', 'bg-emerald-600', 'bg-amber-500', 'bg-rose-500'];
  return colors[idx % colors.length];
}

export default Infographic;
