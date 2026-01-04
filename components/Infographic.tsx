import React, { useState, useEffect } from 'react';
import { SubSection, PracticeScenario } from '../types';
// This matches your package.json and your working Robot
import { GoogleGenerativeAI } from "@google/generative-ai";

interface InfographicProps {
  type: 'pillars' | 'workflow' | 'pathway' | 'tree' | 'protocol' | 'none';
  title: string;
  sections: SubSection[];
  practice?: PracticeScenario;
}

const Infographic: React.FC<InfographicProps> = ({ type, title, sections, practice }) => {
  const [isDrilledDown, setIsDrilledDown] = useState(false);
  const [activeSection, setActiveSection] = useState<SubSection | null>(null);
  const [isGeneratingOverview, setIsGeneratingOverview] = useState(false);

  const generateOverviewVisual = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (isGeneratingOverview) return;
    
    setIsGeneratingOverview(true);
    try {
      // Uses the same library and key as your working Chatbot
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const prompt = `Summary for "${title}".`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      console.log("AI working:", response.text());
    } catch (err) {
      console.error("AI Error:", err);
    } finally {
      setIsGeneratingOverview(false);
    }
  };

  if (type === 'none') return <div className="p-10 text-center">Standard Content</div>;

  if (!isDrilledDown) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-12">
        <div onClick={() => setIsDrilledDown(true)} className="cursor-pointer bg-slate-900 text-white p-10 rounded-[3rem] w-full text-center shadow-2xl">
           <h2 className="text-4xl font-black mb-6">{title}</h2>
           <button onClick={generateOverviewVisual} disabled={isGeneratingOverview} className="bg-indigo-600 px-8 py-3 rounded-full font-bold uppercase text-xs">
             {isGeneratingOverview ? 'Generating...' : 'Generate AI Overview'}
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 px-4 pb-16">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black text-[#0F2C5C]">{title}</h2>
        <button onClick={() => setIsDrilledDown(false)} className="px-4 py-2 bg-slate-100 rounded-xl text-xs font-bold">Back</button>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {sections.map((s, i) => (
          <button key={i} onClick={() => setActiveSection(s)} className="bg-white p-8 rounded-[2rem] border text-left hover:shadow-lg">
            <h3 className="font-black uppercase">{s.title}</h3>
            <p className="text-sm text-slate-500 mt-2 line-clamp-3">{s.description}</p>
          </button>
        ))}
      </div>
      {activeSection && (
        <div className="fixed inset-0 bg-slate-900/80 z-50 flex items-center justify-center p-6" onClick={() => setActiveSection(null)}>
          <div className="bg-white p-10 rounded-[2.5rem] max-w-xl w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-2xl font-black">{activeSection.title}</h3>
            <p className="mt-4 text-slate-600">{activeSection.description}</p>
            <button onClick={() => setActiveSection(null)} className="mt-8 w-full py-4 bg-[#0F2C5C] text-white rounded-xl font-bold uppercase">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Infographic;
