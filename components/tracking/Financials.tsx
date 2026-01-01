
import React from 'react';
import { Briefcase, ArrowLeft, DollarSign, BookOpen, FileText, ExternalLink } from 'lucide-react';

const RESOURCE_LINKS = {
  budget: "https://docs.google.com/spreadsheets",
  materials: "https://drive.google.com",
  compliance: "https://drive.google.com"
};

interface FinancialsProps {
  onBack: () => void;
}

export const Financials: React.FC<FinancialsProps> = ({ onBack }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-slate-800 font-black text-[10px] uppercase tracking-widest transition-all">
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-xl"><Briefcase size={24} /></div>
        <div>
          <h2 className="text-2xl font-black text-slate-800">Resource Repository</h2>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Administrative assets and financial grant tracking</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <ResourceCard title="Fiscal Ledger" subtitle="Budget FY25" icon={<DollarSign/>} color="bg-emerald-100 text-emerald-700" link={RESOURCE_LINKS.budget} />
        <ResourceCard title="Curriculum Assets" subtitle="Manuals & Decks" icon={<BookOpen/>} color="bg-blue-100 text-blue-700" link={RESOURCE_LINKS.materials} />
        <ResourceCard title="Compliance Docs" subtitle="MOUs & Filings" icon={<FileText/>} color="bg-purple-100 text-purple-700" link={RESOURCE_LINKS.compliance} />
      </div>
    </div>
  );
};

const ResourceCard = ({ title, subtitle, icon, color, link }: any) => (
  <a href={link} target="_blank" rel="noopener noreferrer" className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-blue-200 transition-all space-y-6 flex flex-col items-center text-center">
      <div className={`w-16 h-16 ${color} rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform`}>{icon}</div>
      <div>
          <h3 className="text-xl font-black text-slate-800">{title}</h3>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">{subtitle}</p>
      </div>
      <div className="text-[10px] font-black uppercase tracking-widest text-blue-500 flex items-center gap-2">Access Resource <ExternalLink size={12}/></div>
  </a>
);
