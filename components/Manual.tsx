
import React, { useState } from 'react';

const Manual: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const sections = [
    { 
      title: "Mission & Vision", 
      content: "Mission Statement: 'To enhance Fathers and Father Figures which will ultimately strengthen families.' Vision Statement: 'All fathers and father figures are active, positive role models.' Core Philosophy: Enhance vs. Fix. We view fathers as individuals with potential, not broken people." 
    },
    { 
      title: "FOAM Program Pillars", 
      content: "1. Project Family Build: The Stability Engine (Housing, IDs, Basic Needs). 2. Fatherhood Classes: 14-session NPCL curriculum (Identity and Parenting). 3. Workforce Development: Career advancement (Resume, Interview, Retention)." 
    },
    { 
      title: "Prioritization Rule (1-5)", 
      content: "Critical Workflow Hierarchy: 1. Employed fathers at risk (Retention). 2. Fathers starting new jobs. 3. Interviews. 4. Barrier removal. 5. New intakes. Retention is ALWAYS Priority #1." 
    },
    { 
      title: "The 3-Day Rule & 3-Attempt Protocol", 
      content: "Every referral must receive a contact attempt within 72 hours. If unresponsive, you must make 3 documented attempts (Call, Text, Email) before escalating to a supervisor." 
    },
    { 
      title: "Trauma-Informed Care", 
      content: "Shift the mindset from 'What is wrong with you?' to 'What happened to you?'. Avoid labels like 'difficult' or 'unmotivated'. Anger or withdrawal is often a trauma response. Provide a Safe Harbor." 
    },
    { 
      title: "Intake & The 7-Day Rule", 
      content: "Collect 'Big 3' Docs: ID, SS Card, Proof of Income. Sign the ROI immediately. Finalize the Plan of Care (POC) with SMART goals within 7 days of intake." 
    },
    { 
      title: "Workforce Pipeline", 
      content: "Assess → Prepare → Connect → Retain. Conduct check-ins at 30, 60, and 90 days post-hire. 48-Hour Fall-Off Rule: If a job is lost, contact within 48 hours to debrief and restart." 
    },
    { 
      title: "Documentation & FACT Model", 
      content: "EmpowerDB Golden Rule: 'If it isn't in EmpowerDB, it didn't happen.' 48-Hour Rule for data entry. Notes must be FACT-based: Facts, Actions, Client Response, Next Steps. Objective language only." 
    },
    { 
      title: "Crisis & Boundaries", 
      content: "Stabilize first. If suicidal/homicidal, call 911. Mandatory Boundaries: NO personal money, NO personal rides, NO rescue mindset. Direct to 211 or Housing Tree for homelessness." 
    },
    { 
      title: "Graduation Criteria", 
      content: "To graduate: 1. Attend 12 of 14 classes. 2. Achieve at least 2 major POC goals (e.g., Job + Housing). Perform Exit Interview and update status to 'Graduated' in EmpowerDB." 
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
          <h2 className="text-3xl font-bold text-slate-800">FOAM Case Manager Manual</h2>
          <p className="text-slate-500">Comprehensive Program Guide & Operational Protocols</p>
        </div>
        <div className="relative">
          <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"></i>
          <input 
            type="text"
            placeholder="Search manual topics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 pr-6 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-indigo-500 outline-none w-full md:w-64 transition-all font-medium"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredSections.map((section, idx) => (
          <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:border-[#0F2C5C] transition-all group">
            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded bg-[#0F2C5C]/10 text-[#0F2C5C] flex items-center justify-center text-xs font-black group-hover:bg-[#0F2C5C] group-hover:text-white transition-colors">
                {idx + 1}
              </span>
              {section.title}
            </h3>
            <p className="text-slate-600 leading-relaxed text-sm md:text-base font-medium">
              {section.content}
            </p>
          </div>
        ))}

        {filteredSections.length === 0 && (
          <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
            <i className="fas fa-ghost text-4xl text-slate-200 mb-4"></i>
            <p className="text-slate-400">No matching manual sections found.</p>
          </div>
        )}
      </div>

      <div className="p-8 bg-[#0F2C5C] rounded-2xl text-white relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10">
           <i className="fas fa-shield-halved text-[10rem] translate-x-12 translate-y-12"></i>
        </div>
        <div className="relative z-10">
          <h4 className="text-xl font-bold mb-2 uppercase tracking-tight">Standard Operating Procedures</h4>
          <p className="text-indigo-200 mb-6 text-sm max-w-lg font-medium leading-relaxed">Always refer to the $350 Financial Rule and Mandated Reporter guidelines in acute crisis situations. Use the 'Enhance' mindset in every interaction.</p>
          <button className="px-6 py-2 bg-white text-[#0F2C5C] rounded-lg font-bold text-sm hover:bg-indigo-50 transition-colors uppercase tracking-widest">
            Print Protocol Sheet
          </button>
        </div>
      </div>
    </div>
  );
};

export default Manual;
