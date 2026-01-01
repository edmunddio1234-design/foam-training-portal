
import React from 'react';
import { Father } from '../../types';
import { FileDown, Database, CheckCircle } from 'lucide-react';

interface ExportDataProps {
  fathers: Father[];
}

export const ExportData: React.FC<ExportDataProps> = ({ fathers }) => {
  const handleExportFull = () => {
    const headers = ["ID", "First Name", "Last Name", "Email", "Phone", "Modules Count", "Status", "Joined Date"];
    const rows = fathers.map(f => [f.id, `"${f.firstName}"`, `"${f.lastName}"`, `"${f.email}"`, `"${f.phone}"`, f.completedModules.length, f.status, f.joinedDate].join(","));
    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `FOAM_Master_Export_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-xl"><FileDown size={24} /></div>
        <div>
          <h2 className="text-2xl font-black text-slate-800">Data Export Engine</h2>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Registry synchronization and reporting assets</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col items-center text-center space-y-6">
            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center"><Database size={40} /></div>
            <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-800">Full Master Roster</h3>
                <p className="text-sm text-slate-400 font-medium">Download the complete participant database including all verified module counts and contact metadata.</p>
            </div>
            <button onClick={handleExportFull} className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-3">
                <FileDown size={18} /> Export Global CSV
            </button>
        </div>
        <div className="bg-emerald-50 p-12 rounded-[3rem] border border-emerald-100 flex flex-col items-center text-center space-y-6">
            <div className="w-20 h-20 bg-white text-emerald-600 rounded-3xl flex items-center justify-center shadow-sm"><CheckCircle size={40} /></div>
            <div className="space-y-2">
                <h3 className="text-xl font-black text-emerald-900">Program Integrity</h3>
                <p className="text-sm text-emerald-700 font-medium">All data is snapshots of the current real-time state. Use these files for grant reporting and audit verification.</p>
            </div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">Snapshot Security Verified</div>
        </div>
      </div>
    </div>
  );
};
