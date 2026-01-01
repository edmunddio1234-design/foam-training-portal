
import React, { useState } from 'react';
import { ModuleType } from './types';
import { FOAM_MODULES } from './constants';
import ModuleView from './components/ModuleView';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Manual from './components/Manual';
import GeminiAssistant from './components/GeminiAssistant';
import LoginPage from './components/LoginPage';
import TrainingLoginPage from './components/TrainingLoginPage';
import FinancialLoginPage from './components/FinancialLoginPage';
import Hub from './components/Hub';
import DataExchange from './components/DataExchange';
import FinanceBills, { BillEntry } from './components/FinanceBills';
import FinanceDashboard from './components/FinanceDashboard';
import DatabasePortal from './components/DatabasePortal';

type AppView = 'hub' | 'training' | 'tracking' | 'admin' | 'db' | 'finance' | 'manual';
type FinanceSubView = 'dashboard' | 'exchange' | 'bills';

const App: React.FC = () => {
  // Local Authentication states (Simulated)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isTrainingAuthenticated, setIsTrainingAuthenticated] = useState(false);
  const [isFinanceAuthenticated, setIsFinanceAuthenticated] = useState(false);
  
  // Navigation states
  const [currentView, setCurrentView] = useState<AppView>('hub');
  const [financeSubView, setFinanceSubView] = useState<FinanceSubView>('dashboard');
  const [activeModuleId, setActiveModuleId] = useState<ModuleType>(ModuleType.FOUNDATIONAL);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  
  // Shared Finance State for Dashboard Analysis
  const [allFinanceEntries, setAllFinanceEntries] = useState<BillEntry[]>([]);

  const activeModule = FOAM_MODULES.find(m => m.id === activeModuleId) || FOAM_MODULES[0];

  const handleModuleChange = (id: ModuleType) => {
    setActiveModuleId(id);
    setCurrentView('training');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsTrainingAuthenticated(false);
    setIsFinanceAuthenticated(false);
    setCurrentView('hub');
  };

  // --- GATE 1: HUB LOGIN (SIMULATED) ---
  if (!isLoggedIn) {
    return <LoginPage onLogin={() => setIsLoggedIn(true)} />;
  }

  // --- GATE 2: TRAINING SPECIFIC LOGIN ---
  if (currentView === 'training' && !isTrainingAuthenticated) {
    return (
      <TrainingLoginPage 
        onLogin={() => setIsTrainingAuthenticated(true)} 
        onBack={() => setCurrentView('hub')} 
      />
    );
  }

  // --- GATE 3: FINANCE SPECIFIC LOGIN ---
  if (currentView === 'finance' && !isFinanceAuthenticated) {
    return (
      <FinancialLoginPage 
        onLogin={() => setIsFinanceAuthenticated(true)} 
        onBack={() => setCurrentView('hub')} 
      />
    );
  }

  // Handle Hub view
  if (currentView === 'hub') {
    return <Hub onNavigate={(view) => setCurrentView(view)} onLogout={handleLogout} />;
  }

  // --- DATABASE PORTAL VIEW ---
  if (currentView === 'db') {
    return (
      <div className="h-screen animate-in fade-in duration-500 relative z-0">
        <DatabasePortal onClose={() => setCurrentView('hub')} />
      </div>
    );
  }

  // Generic Placeholder for non-implemented portals
  if (['tracking', 'admin'].includes(currentView)) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-24 h-24 bg-indigo-100 text-indigo-600 rounded-3xl flex items-center justify-center mb-6 animate-bounce">
          <i className="fas fa-tools text-4xl"></i>
        </div>
        <h1 className="text-4xl font-black text-slate-800 mb-4 capitalize">{currentView.replace(/([A-Z])/g, ' $1')} Portal</h1>
        <p className="text-slate-500 font-medium max-w-md mb-8">This portal is currently under development as part of the FOAM digital ecosystem expansion. Check back soon for full functionality.</p>
        <button 
          onClick={() => setCurrentView('hub')}
          className="px-8 py-3 bg-[#0F2C5C] text-white rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center gap-2"
        >
          <i className="fas fa-arrow-left"></i> Back to Command Center
        </button>
      </div>
    );
  }

  // --- FINANCE PORTAL VIEW ---
  if (currentView === 'finance') {
    return (
      <div className="min-h-screen bg-white flex flex-col p-6 md:p-12 animate-in fade-in duration-500 overflow-y-auto">
        <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row md:items-center justify-between border-b pb-8 mb-12 gap-8">
           <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-[#0F2C5C] text-white rounded-2xl flex items-center justify-center shadow-xl ring-4 ring-indigo-50">
                <i className="fas fa-vault text-2xl"></i>
              </div>
              <div>
                <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-tight">Financial Tools & Budgeting</h1>
                <div className="flex items-center gap-3 mt-1">
                  <p className="text-blue-600 font-black uppercase tracking-widest text-[10px] bg-blue-50 px-2 py-0.5 rounded">Restricted Access</p>
                  <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Fiscal Analytics v3.0</p>
                </div>
              </div>
           </div>
           
           <div className="flex items-center gap-4">
              <div className="bg-slate-50 p-1 rounded-xl flex border border-slate-100 overflow-x-auto hide-scrollbar">
                <button 
                  onClick={() => setFinanceSubView('dashboard')}
                  className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${financeSubView === 'dashboard' ? 'bg-[#0F2C5C] text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Analysis Dashboard
                </button>
                <button 
                  onClick={() => setFinanceSubView('bills')}
                  className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${financeSubView === 'bills' ? 'bg-[#0F2C5C] text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Ledger Registry
                </button>
                <button 
                  onClick={() => setFinanceSubView('exchange')}
                  className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${financeSubView === 'exchange' ? 'bg-[#0F2C5C] text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Data Exchange
                </button>
              </div>
              <button 
                onClick={() => { setCurrentView('hub'); setFinanceSubView('dashboard'); }}
                className="px-6 py-3 bg-slate-100 text-slate-500 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-200 transition-all whitespace-nowrap"
              >
                  Exit Portal
              </button>
           </div>
        </div>

        <div className="max-w-7xl mx-auto w-full">
           {financeSubView === 'dashboard' ? (
             <FinanceDashboard entries={allFinanceEntries} activeYear={2025} />
           ) : financeSubView === 'exchange' ? (
             <DataExchange entries={allFinanceEntries} onImport={setAllFinanceEntries} />
           ) : (
             <FinanceBills entries={allFinanceEntries} onDataUpdate={setAllFinanceEntries} />
           )}
        </div>
      </div>
    );
  }

  // --- TRAINING PORTAL VIEW ---
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      <Sidebar 
        activeModuleId={activeModuleId} 
        onModuleSelect={handleModuleChange}
        view={currentView === 'manual' ? 'manual' : 'module'}
        onViewChange={(v) => setCurrentView(v === 'manual' ? 'manual' : 'training')}
        onBackToHub={() => setCurrentView('hub')}
      />

      <main className="flex-1 flex flex-col md:ml-64 transition-all duration-300">
        <Header 
          activeModule={activeModule} 
          view={currentView === 'manual' ? 'manual' : 'module'}
          onToggleAssistant={() => setIsAssistantOpen(!isAssistantOpen)}
        />
        
        <div className="p-4 md:p-8 flex-1">
          {currentView === 'training' ? (
            <ModuleView 
              module={activeModule} 
              onNext={() => {
                const currentIndex = FOAM_MODULES.findIndex(m => m.id === activeModuleId);
                if (currentIndex < FOAM_MODULES.length - 1) {
                  handleModuleChange(FOAM_MODULES[currentIndex + 1].id);
                } else {
                  setCurrentView('manual');
                }
              }}
            />
          ) : (
            <Manual />
          )}
        </div>

        <footer className="p-6 text-center text-slate-400 text-sm border-t bg-white">
          &copy; {new Date().getFullYear()} Fathers On A Mission (FOAM). All rights reserved.
        </footer>
      </main>

      <GeminiAssistant 
        isOpen={isAssistantOpen} 
        onClose={() => setIsAssistantOpen(false)} 
        context={activeModule.fullText}
      />
      
      {!isAssistantOpen && (
        <button 
          onClick={() => setIsAssistantOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center z-50"
        >
          <i className="fas fa-robot text-xl"></i>
        </button>
      )}
    </div>
  );
};

export default App;
