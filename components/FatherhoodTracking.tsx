
import React, { useState } from 'react';
import { TrackerViewState, Father } from '../types';
import { INITIAL_FATHERS, TRACKER_MODULES } from '../constants';
import { 
  LayoutDashboard, Users, CheckSquare, ShieldCheck, Menu, X, Upload, 
  UserX, FileDown, Briefcase, Calendar, ChevronRight, ArrowLeft 
} from 'lucide-react';

// Sub-component Imports (Simplified for single-file integration)
import { Dashboard } from './tracking/Dashboard';
import { Roster } from './tracking/Roster';
import { CheckIn } from './tracking/CheckIn';
import { FatherPortal } from './tracking/FatherPortal';
import { ImportCSV } from './tracking/ImportCSV';
import { LostManagement } from './tracking/LostManagement';
import { FatherIDCard } from './tracking/FatherIDCard';
import { ExportData } from './tracking/ExportData';
import { Financials } from './tracking/Financials';

const GOOGLE_SCRIPT_URL = ''; // Placeholder for deployment

interface FatherhoodTrackingProps {
  onBack: () => void;
}

const FatherhoodTracking: React.FC<FatherhoodTrackingProps> = ({ onBack: onNavigateBack }) => {
  const [currentView, setCurrentView] = useState<TrackerViewState>('dashboard');
  const [fathers, setFathers] = useState<Father[]>(INITIAL_FATHERS);
  const [selectedFatherId, setSelectedFatherId] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleAttendanceUpdate = async (fatherId: string, moduleId: number, date: string) => {
    setFathers(prev => prev.map(f => {
      if (f.id === fatherId) {
        if (!f.completedModules.includes(moduleId)) {
          const newModules = [...f.completedModules, moduleId];
          return {
            ...f,
            completedModules: newModules,
            status: newModules.length === 14 ? 'Graduated' : newModules.length < 2 ? 'At Risk' : 'Active'
          };
        }
      }
      return f;
    }));

    if (GOOGLE_SCRIPT_URL) {
      try {
          const payload = {
              fatherId,
              moduleId,
              classDate: date,
              fatherName: fathers.find(f => f.id === fatherId)?.lastName || 'Unknown',
              moduleTitle: TRACKER_MODULES.find(m => m.id === moduleId)?.title || 'Unknown'
          };
          await fetch(GOOGLE_SCRIPT_URL, {
              method: 'POST',
              body: JSON.stringify(payload),
          });
      } catch (error) {
          console.error("Write-back failed:", error);
      }
    }
  };

  const handleOpenFatherDetail = (id: string) => {
    setSelectedFatherId(id);
    setCurrentView('father-detail');
  };

  const handleNavigateHome = () => {
    setCurrentView('dashboard');
  };

  const NavItem = ({ view, label, icon: Icon }: { view: TrackerViewState, label: string, icon: any }) => (
    <button
      onClick={() => {
        if (view === 'dashboard') handleNavigateHome();
        else setCurrentView(view);
        setIsMobileMenuOpen(false);
      }}
      className={`flex items-center space-x-3 w-full p-3 rounded-xl transition-all ${
        currentView === view 
          ? 'bg-blue-50 text-blue-600 font-bold shadow-sm' 
          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
      }`}
    >
      <Icon size={18} />
      <span className="text-sm">{label}</span>
    </button>
  );

  const selectedFather = fathers.find(f => f.id === selectedFatherId);

  return (
    <div className="flex h-screen bg-white text-slate-800 overflow-hidden font-sans border border-slate-200 rounded-[2rem] shadow-2xl m-4">
      {/* Tracker Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-100 bg-slate-50 z-20">
        <div 
            className="p-8 border-b border-slate-100 bg-white cursor-pointer hover:bg-slate-50 transition-colors group"
            onClick={handleNavigateHome}
        >
          <h1 className="text-lg font-black tracking-tight text-slate-800 leading-tight group-hover:text-blue-600 transition-colors">
            FOAM Tracker<br/>
            <span className="text-blue-600 group-hover:text-slate-800">Class Registry</span>
          </h1>
          <p className="text-[9px] font-black uppercase text-slate-400 mt-2 tracking-widest">Command Center</p>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <p className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 mt-4">Admin Suite</p>
          <NavItem view="dashboard" label="Dashboard" icon={LayoutDashboard} />
          <NavItem view="roster" label="Roster" icon={Users} />
          <NavItem view="lost" label="At Risk" icon={UserX} />
          <NavItem view="checkin" label="Smart Check-In" icon={CheckSquare} />
          <NavItem view="import" label="Import Data" icon={Upload} />
          <NavItem view="export" label="Export Data" icon={FileDown} />
          <NavItem view="financials" label="Resources" icon={Briefcase} />
          
          <div className="my-6 border-t border-slate-200"></div>
          
          <p className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Participant</p>
          <NavItem view="portal" label="Father Portal" icon={ShieldCheck} />
          
          <div className="mt-auto pt-6">
            <button 
              onClick={onNavigateBack}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-all border border-slate-200"
            >
              <ArrowLeft size={14} /> Back to Hub
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Tracker Area */}
      <main className="flex-1 overflow-auto relative bg-white">
        <div className="p-6 md:p-10 max-w-7xl mx-auto">
          {currentView === 'dashboard' && (
            <Dashboard 
              fathers={fathers} 
              onSelectFather={handleOpenFatherDetail}
              onNavigateToPortal={() => setCurrentView('portal')}
            />
          )}
          {currentView === 'roster' && <Roster fathers={fathers} onSelectFather={handleOpenFatherDetail} />}
          {currentView === 'lost' && <LostManagement fathers={fathers} onSelectFather={handleOpenFatherDetail} />}
          {currentView === 'checkin' && <CheckIn fathers={fathers} onCheckIn={handleAttendanceUpdate} />}
          {currentView === 'import' && <ImportCSV onImport={(newFathers) => {
            setFathers(newFathers);
            handleNavigateHome();
          }} />}
          {currentView === 'export' && <ExportData fathers={fathers} />}
          {currentView === 'financials' && <Financials onBack={handleNavigateHome} />}
          {currentView === 'portal' && (
            <FatherPortal 
              fathers={fathers} 
              onBack={handleNavigateHome}
            />
          )}
          {currentView === 'father-detail' && selectedFather && (
            <FatherIDCard 
              father={selectedFather} 
              onBack={handleNavigateHome} 
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default FatherhoodTracking;
