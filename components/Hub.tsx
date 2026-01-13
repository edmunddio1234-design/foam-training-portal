
import React, { useState } from 'react';
import OrganizationalHandbook from './OrganizationalHandbook';

interface HubProps {
  onNavigate: (view: 'training' | 'tracking' | 'admin' | 'casemanager' | 'finance' | 'analytics') => void;
  onLogout: () => void;
}

const Hub: React.FC<HubProps> = ({ onNavigate, onLogout }) => {
  const [showHandbook, setShowHandbook] = useState(false);

  const portals = [
    {
      id: 'training',
      title: 'Training Academy',
      description: 'Access certification modules, case study deep dives, and program orientation.',
      icon: 'fa-graduation-cap',
      color: 'bg-indigo-600',
      shadow: 'shadow-indigo-200'
    },
    {
      id: 'tracking',
      title: 'Fatherhood Tracking',
      description: 'Monitor client progress through Fatherhood Classes and workforce placement.',
      icon: 'fa-chart-line',
      color: 'bg-emerald-600',
      shadow: 'shadow-emerald-200'
    },
    {
      id: 'admin',
      title: 'Administrative Tools',
      description: 'Manage caseload summaries, staff protocols, and agency communications.',
      icon: 'fa-user-shield',
      color: 'bg-amber-600',
      shadow: 'shadow-amber-200'
    },
    {
      id: 'casemanager',
      title: 'Case Manager Portal',
      description: 'Monthly reports, procedures & resources, forms and documents for case managers.',
      icon: 'fa-clipboard-list',
      color: 'bg-teal-600',
      shadow: 'shadow-teal-200'
    },
    {
      id: 'finance',
      title: 'Financial Tools',
      description: 'Analyze budgets • Analyze reports • Invoicing • Grant tracking of budgets',
      icon: 'fa-file-invoice-dollar',
      color: 'bg-[#1A4D2E]',
      shadow: 'shadow-emerald-100'
    },
    {
      id: 'analytics',
      title: 'Assessment Analytics',
      description: 'Post-class assessment insights, trends, and follow-up tracking.',
      icon: 'fa-chart-pie',
      color: 'bg-purple-600',
      shadow: 'shadow-purple-200'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col p-6 md:p-12 animate-in fade-in duration-700">
      {/* Brand Header */}
      <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-[#0F2C5C] text-white rounded-3xl flex items-center justify-center shadow-xl">
             <span className="font-black text-4xl italic tracking-tighter">F</span>
          </div>
          <div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none mb-3">Command Center</h1>
            <div className="space-y-1">
              <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-xs">Fathers On A Mission</p>
              <p className="text-blue-600 font-black uppercase tracking-[0.3em] text-[10px]">FOAM ECOSYSTEM</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
           <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
              <i className="fas fa-user-circle text-xl"></i>
           </div>
           <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Active Staff</p>
              <p className="text-sm font-bold text-slate-800">Administrator</p>
           </div>
           <button 
             onClick={onLogout}
             className="ml-4 p-2 text-slate-300 hover:text-rose-500 transition-colors"
             title="Logout of Command Center"
           >
              <i className="fas fa-sign-out-alt"></i>
           </button>
        </div>
      </div>

      {/* Portal Selection Grid */}
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {portals.map((portal) => (
          <button
            key={portal.id}
            onClick={() => onNavigate(portal.id as any)}
            className="group relative bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100 hover:shadow-2xl hover:border-indigo-100 transition-all duration-500 text-left overflow-hidden flex flex-col justify-between"
          >
            {/* Visual Flare */}
            <div className={`absolute -right-8 -top-8 w-32 h-32 ${portal.color} opacity-5 rounded-full group-hover:scale-150 transition-transform duration-700`}></div>
            
            <div className="space-y-6 relative z-10">
              <div className={`w-16 h-16 ${portal.color} text-white rounded-2xl flex items-center justify-center text-2xl shadow-lg ${portal.shadow} group-hover:rotate-6 transition-transform`}>
                <i className={`fas ${portal.icon}`}></i>
              </div>
              
              <div className="space-y-3">
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">{portal.title}</h2>
                <div className="text-slate-500 font-medium leading-relaxed">
                  {portal.id === 'finance' ? (
                    <ul className="space-y-1">
                      <li className="flex items-center gap-2"><i className="fas fa-check text-[10px] text-emerald-500"></i> Analyze budgets</li>
                      <li className="flex items-center gap-2"><i className="fas fa-check text-[10px] text-emerald-500"></i> Analyze reports</li>
                      <li className="flex items-center gap-2"><i className="fas fa-check text-[10px] text-emerald-500"></i> Invoicing</li>
                      <li className="flex items-center gap-2"><i className="fas fa-check text-[10px] text-emerald-500"></i> Grant tracking of budgets</li>
                    </ul>
                  ) : portal.id === 'casemanager' ? (
                    <ul className="space-y-1">
                      <li className="flex items-center gap-2"><i className="fas fa-check text-[10px] text-teal-500"></i> Monthly reports</li>
                      <li className="flex items-center gap-2"><i className="fas fa-check text-[10px] text-teal-500"></i> Procedures & resources</li>
                      <li className="flex items-center gap-2"><i className="fas fa-check text-[10px] text-teal-500"></i> Forms & documents</li>
                    </ul>
                  ) : portal.id === 'analytics' ? (
                    <ul className="space-y-1">
                      <li className="flex items-center gap-2"><i className="fas fa-check text-[10px] text-purple-500"></i> Class assessment trends</li>
                      <li className="flex items-center gap-2"><i className="fas fa-check text-[10px] text-purple-500"></i> Module performance reports</li>
                      <li className="flex items-center gap-2"><i className="fas fa-check text-[10px] text-purple-500"></i> Father follow-up tracking</li>
                      <li className="flex items-center gap-2"><i className="fas fa-check text-[10px] text-purple-500"></i> Export & reporting tools</li>
                    </ul>
                  ) : (
                    portal.description
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-indigo-600 transition-colors">Access Portal</span>
              <div className="w-8 h-8 rounded-full bg-slate-50 text-slate-300 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <i className="fas fa-chevron-right text-xs"></i>
              </div>
            </div>
          </button>
        ))}

        {/* Handbook Card - Replaces Mission Card */}
        <button
          onClick={() => setShowHandbook(true)}
          className="bg-[#0F2C5C] rounded-[3rem] p-10 text-white flex flex-col justify-between relative overflow-hidden group text-left hover:shadow-2xl transition-all duration-500"
        >
           <i className="fas fa-book-open absolute -right-6 -bottom-6 text-[10rem] opacity-5 group-hover:scale-110 transition-transform duration-1000"></i>
           
           <div className="space-y-6 relative z-10">
              <div className="w-16 h-16 bg-indigo-500/30 text-indigo-300 rounded-2xl flex items-center justify-center text-2xl shadow-lg group-hover:rotate-6 transition-transform">
                <i className="fas fa-book-open"></i>
              </div>
              
              <div className="space-y-3">
                <h2 className="text-2xl font-black tracking-tight">Organizational Handbook</h2>
                <ul className="space-y-1 text-indigo-200 font-medium">
                  <li className="flex items-center gap-2"><i className="fas fa-check text-[10px] text-indigo-400"></i> Policies & Procedures</li>
                  <li className="flex items-center gap-2"><i className="fas fa-check text-[10px] text-indigo-400"></i> 14-Module Curriculum</li>
                  <li className="flex items-center gap-2"><i className="fas fa-check text-[10px] text-indigo-400"></i> Staff Roles & SOPs</li>
                  <li className="flex items-center gap-2"><i className="fas fa-check text-[10px] text-indigo-400"></i> Compliance & Style Guide</li>
                </ul>
              </div>
           </div>
           
           <div className="mt-8 pt-8 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-indigo-300 group-hover:text-white transition-colors">Open Handbook</span>
              <div className="w-8 h-8 rounded-full bg-white/10 text-indigo-300 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-all">
                <i className="fas fa-chevron-right text-xs"></i>
              </div>
           </div>
        </button>
      </div>
      
      <div className="max-w-7xl mx-auto w-full flex justify-center pb-12">
         <p className="text-slate-400 font-bold text-xs uppercase tracking-widest flex items-center gap-3">
           <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
           Secure Network Access Verified
         </p>
      </div>

      {/* Handbook Modal */}
      {showHandbook && (
        <OrganizationalHandbook onClose={() => setShowHandbook(false)} />
      )}
    </div>
  );
};

export default Hub;
