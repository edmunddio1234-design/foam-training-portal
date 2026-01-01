
import React from 'react';

interface HubProps {
  onNavigate: (view: 'training' | 'tracking' | 'admin' | 'db' | 'finance') => void;
  onLogout: () => void;
}

const Hub: React.FC<HubProps> = ({ onNavigate, onLogout }) => {
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
      id: 'db',
      title: 'Database Access',
      description: 'AI-powered access to all organization files, folders, and records on Google Drive & SharePoint.',
      icon: 'fa-database',
      color: 'bg-slate-800',
      shadow: 'shadow-slate-300'
    },
    {
      id: 'finance',
      title: 'Financial Tools',
      description: 'Analyze budgets • Analyze reports • Invoicing • Grant tracking of budgets',
      icon: 'fa-file-invoice-dollar',
      color: 'bg-[#1A4D2E]',
      shadow: 'shadow-emerald-100'
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
            <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-1">FOAM Command Center</h1>
            <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-xs">Case Management Ecosystem</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
           <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
              <i className="fas fa-user-circle text-xl"></i>
           </div>
           <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Active Staff</p>
              <p className="text-sm font-bold text-slate-800">Trainee User</p>
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

        {/* Support Card */}
        <div className="bg-[#0F2C5C] rounded-[3rem] p-10 text-white flex flex-col justify-between relative overflow-hidden group">
           <i className="fas fa-shield-heart absolute -right-6 -bottom-6 text-[10rem] opacity-5 group-hover:scale-110 transition-transform duration-1000"></i>
           <div className="space-y-4 relative z-10">
              <h3 className="text-xl font-bold uppercase tracking-widest text-indigo-300">FOAM Mission</h3>
              <p className="text-xl font-medium leading-relaxed italic">"Enhancing Fathers to strengthen the very foundation of families."</p>
           </div>
           <div className="pt-8">
              <p className="text-xs font-black uppercase tracking-widest text-indigo-400 mb-2">Need Assistance?</p>
              <button className="flex items-center gap-2 text-white font-bold group-hover:gap-4 transition-all">
                 Contact IT Support <i className="fas fa-arrow-right text-xs"></i>
              </button>
           </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto w-full flex justify-center pb-12">
         <p className="text-slate-400 font-bold text-xs uppercase tracking-widest flex items-center gap-3">
           <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
           Secure Network Access Verified
         </p>
      </div>
    </div>
  );
};

export default Hub;
