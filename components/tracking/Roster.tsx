
import React, { useState } from 'react';
import { Father } from '../../types';
import { Search, Download, ChevronRight, Phone, Mail } from 'lucide-react';

interface RosterProps {
  fathers: Father[];
  onSelectFather: (id: string) => void;
}

export const Roster: React.FC<RosterProps> = ({ fathers, onSelectFather }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFathers = fathers.filter(f => {
    const searchStr = searchTerm.toLowerCase().trim();
    if (!searchStr) return true;
    return f.firstName.toLowerCase().includes(searchStr) || 
           f.lastName.toLowerCase().includes(searchStr) || 
           f.id.includes(searchStr);
  });

  const downloadRosterCSV = () => {
    const headers = ["ID", "Last Name", "First Name", "Email", "Phone", "Modules Taken"];
    const rows = filteredFathers.map(f => [f.id, `"${f.lastName}"`, `"${f.firstName}"`, `"${f.email}"`, `"${f.phone}"`, f.completedModules.length].join(","));
    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `FOAM_Roster_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between bg-white p-6 rounded-3xl border border-slate-100 shadow-sm gap-4">
        <div>
            <h2 className="text-xl font-black text-slate-800">Roster Management</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{filteredFathers.length} Active Records</p>
        </div>
        <div className="flex gap-4">
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                    type="text"
                    placeholder="Search roster..."
                    className="pl-12 pr-6 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none focus:border-blue-500 focus:bg-white transition-all w-full md:w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <button onClick={downloadRosterCSV} className="px-6 py-3 bg-slate-800 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2">
                <Download size={14} /> Export CSV
            </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="px-8 py-5">ID</th>
                <th className="px-8 py-5">Participant Name</th>
                <th className="px-8 py-5">Attendance</th>
                <th className="px-8 py-5">Progress</th>
                <th className="px-8 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredFathers.map((father) => {
                const percentage = (father.completedModules.length / 14) * 100;
                return (
                  <tr key={father.id} onClick={() => onSelectFather(father.id)} className="group hover:bg-slate-50/50 cursor-pointer transition-colors">
                    <td className="px-8 py-6 text-xs font-mono text-slate-400">#{father.id}</td>
                    <td className="px-8 py-6">
                        <div>
                            <p className="text-sm font-black text-slate-800">{father.lastName}, {father.firstName}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{father.phone}</p>
                        </div>
                    </td>
                    <td className="px-8 py-6 font-black text-slate-800">{father.completedModules.length}/14</td>
                    <td className="px-8 py-6">
                      <div className="w-48 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div className="h-full bg-blue-500" style={{ width: `${percentage}%` }}></div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right"><ChevronRight size={18} className="text-slate-300 group-hover:text-blue-500 transition-colors inline" /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
      </div>
    </div>
  );
};
