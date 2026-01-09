import React, { useState } from 'react';
import { ModuleType } from '../types';

interface ManualProps {
  onSelectModule: (id: ModuleType) => void;
}

const Manual: React.FC<ManualProps> = ({ onSelectModule }) => {
  const [searchTerm, setSearchTerm] = useState('');
 const PDF_MANUAL_URL = "https://heyzine.com/flip-book/fa09642bd5.html";
 const INFOGRAPHICS_URL = "https://heyzine.com/flip-book/583dfd67fa.html";
  // Re-aligned sections to match the 10 Case Manager modules 1-to-1 for accurate navigation
  const sections = [
    { 
      id: ModuleType.FOUNDATIONAL,
      title: "Orientation: Mission & Values", 
      content: "Core Philosophy: Enhance vs. Fix. We view fathers as individuals with potential. Mission: 'To enhance Fathers and Father Figures which will ultimately strengthen families.' Pillars: Project Family Build, Fatherhood Classes, and Workforce Development." 
    },
    { 
      id: ModuleType.ROLE,
      title: "Role of the Case Manager", 
      content: "The Strategic Quarterback role. Prioritization Hierarchy: 1. Employed fathers at risk (Retention), 2. New jobs, 3. Interviews, 4. Barrier removal, 5. New intakes. Start every day by reviewing EmpowerDB alerts." 
    },
    { 
      id: ModuleType.OUTREACH,
      title: "Outreach & Engagement", 
      content: "Street teams and community presence. Go where the fathers congregate (barbershops, community centers). Authenticity and consistency are the primary tools for building trust in the community." 
    },
    { 
      id: ModuleType.TRAUMA,
      title: "Trauma-Informed Care", 
      content: "Shift mindset to 'What happened to you?' rather than 'What's wrong with you?'. Recognize that anger or withdrawal are often trauma responses. Provide a Safe Harbor environment for all participants." 
    },
    { 
      id: ModuleType.INTAKE,
      title: "The Intake Process", 
      content: "Standardized onboarding protocol. Collect 'Big 3' Docs: ID, SS Card, Proof of Income. Sign the Release of Information (ROI) immediately. Finalize the Plan of Care (POC) within 7 days." 
    },
    { 
      id: ModuleType.WORKFORCE,
      title: "Workforce Development", 
      content: "Assess → Prepare → Connect → Retain. Conduct check-ins at 30, 60, and 90 days post-hire. The 48-Hour Fall-Off Rule: If a job is lost, contact the father within 48 hours to debrief and restart the pipeline." 
    },
    { 
      id: ModuleType.PARTNERSHIPS,
      title: "Community Partnerships", 
      content: "Strategic networking to remove external barriers. Key partner: EBR Housing Authority for father-led households. Leverage 211 and local legal aids. Never work in a vacuum; use the Resource Tree." 
    },
    { 
      id: ModuleType.DOCUMENTATION,
      title: "Data & Documentation", 
      content: "EmpowerDB Integrity: 'If it isn't in the system, it didn't happen.' 48-Hour Rule for all data entry. Use the FACT model: Facts, Actions, Client Response, Target/Next Steps. Notes must be objective." 
    },
    { 
      id: ModuleType.CRISIS,
      title: "Crisis Management", 
      content: "Stabilize first. Safety is the priority. Mandatory professional boundaries: NO personal money, NO personal rides, NO rescue mindset. Direct suicidal/homicidal ideation to 911/First Responders immediately." 
    },
    { 
      id: ModuleType.SUSTAINABILITY,
      title: "Sustainability & Graduation", 
      content: "Criteria: Attend 12/14 classes and achieve 2 major POC goals. Perform exit interviews and update status to 'Graduated'. Empower alumni fathers to become recruiters and mentors for the next cohort." 
    }
  ];

  const filteredSections = sections.filter(s => 
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-6 duration-700">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Full Reference Manual</h2>
          <p className="text-slate-500 font-medium">Comprehensive Program Guide & Operational Protocols</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"></i>
            <input 
              type="text"
              placeholder="Filter topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-6 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-indigo-500 outline-none w-full md:w-48 transition-all font-bold text-sm"
            />
          </div>
          <a 
            href={PDF_MANUAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 px-6 py-3 bg-rose-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-rose-700 shadow-lg transition-all"
          >
            <i className="fas fa-file-pdf"></i>
            Physical Manual
          </a>
          <a 
            href={INFOGRAPHICS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 px-6 py-3 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 shadow-lg transition-all"
          >
            <i className="fas fa-images"></i>
            Infographics
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredSections.map((section, idx) => (
          <div
            key={idx}
            className="w-full bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:border-indigo-600 transition-all group relative overflow-hidden"
          >
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 rounded bg-[#0F2C5C]/10 text-[#0F2C5C] text-[10px] font-black uppercase tracking-widest">
                  Module {idx + 1}
                </span>
                <h3 className="text-xl font-bold text-slate-800">
                  {section.title}
                </h3>
              </div>
              <p className="text-slate-600 leading-relaxed text-sm md:text-base font-medium mb-6">
                {section.content}
              </p>
              
              <div className="flex flex-wrap items-center gap-4">
                <button 
                  onClick={() => section.id && onSelectModule(section.id)}
                  className="flex items-center gap-2 text-indigo-600 text-[10px] font-black uppercase tracking-widest hover:text-indigo-800 transition-colors"
                >
                  <i className="fas fa-graduation-cap"></i>
                  <span>Enter Module Training</span>
                </button>
                <div className="hidden sm:block h-4 w-px bg-slate-200"></div>
                <a 
                  href={PDF_MANUAL_URL} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-rose-600 text-[10px] font-black uppercase tracking-widest hover:text-rose-800 transition-colors"
                >
                  <i className="fas fa-file-pdf"></i>
                  <span>View in Physical Manual</span>
                </a>
              </div>
            </div>
          </div>
        ))}

        {filteredSections.length === 0 && (
          <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
            <i className="fas fa-ghost text-4xl text-slate-200 mb-4"></i>
            <p className="text-slate-400">No matching manual sections found.</p>
          </div>
        )}
      </div>

      <div className="p-10 bg-slate-900 rounded-[2.5rem] text-white relative overflow-hidden shadow-2xl">
        <div className="absolute right-0 bottom-0 opacity-10">
           <i className="fas fa-shield-halved text-[12rem] translate-x-12 translate-y-12"></i>
        </div>
        <div className="relative z-10 space-y-6">
          <div className="space-y-2">
            <h4 className="text-2xl font-black uppercase tracking-tight">Official Policy Access</h4>
            <p className="text-indigo-300 font-medium leading-relaxed max-w-xl">
              Access the high-fidelity physical manual for detailed compliance protocols, bylaw references, and organizational standards.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
             <a 
               href={PDF_MANUAL_URL}
               target="_blank"
               rel="noopener noreferrer"
               className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-xl flex items-center gap-3"
             >
               <i className="fas fa-external-link-alt"></i>
               View Digital Manual (PDF)
             </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Manual;
