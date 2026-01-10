import React, { useState, useEffect } from 'react';
import { ModuleType, TrainingTrack } from './types';
import { CASE_MANAGER_MODULES, FACILITATOR_MODULES, BOARD_MODULES } from './constants';
import ModuleView from './components/ModuleView';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Manual from './components/Manual';
import GeminiAssistant from './components/GeminiAssistant';
import LoginPage from './components/LoginPage';
import TrainingLoginPage from './components/TrainingLoginPage';
import TrainingTrackSelector from './components/TrainingTrackSelector';
import FinancialLoginPage from './components/FinancialLoginPage';
import Hub from './components/Hub';
import DataExchange from './components/DataExchange';
import FinanceBills, { BillEntry } from './components/FinanceBills';
import FinanceDashboard from './components/FinanceDashboard';
import DatabasePortal from './components/DatabasePortal';
import AdminPortal from './components/AdminPortal';
import FatherhoodTracking from './components/FatherhoodTracking';
import CaseManagerPortal from './components/CaseManagerPortal';
import CaseManagerHub from './components/CaseManagerHub';
import ClassAssessment from './components/tracking/ClassAssessment';
import FatherProgress from './components/tracking/FatherProgress';

type AppView = 'hub' | 'training' | 'tracking' | 'admin' | 'casemanager' | 'finance' | 'manual' | 'assessment' | 'progress';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  const [isTrainingAuthenticated, setIsTrainingAuthenticated] = useState(false);
  const [trainingTrackSelected, setTrainingTrackSelected] = useState<TrainingTrack | null>(null);
  const [isFinanceAuthenticated, setIsFinanceAuthenticated] = useState(false);
  
  const [currentView, setCurrentView] = useState<AppView>('hub');
  const [activeModuleId, setActiveModuleId] = useState<ModuleType>(ModuleType.FOUNDATIONAL);
  const [activeTrack, setActiveTrack] = useState<TrainingTrack>('case_manager');
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  // Check URL for direct access (for fathers on mobile)
  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/assessment' || path === '/checkin') {
      setCurrentView('assessment');
    } else if (path === '/progress' || path === '/myprogress') {
      setCurrentView('progress');
    }
  }, []);

  const getModulesForTrack = (track: TrainingTrack) => {
    switch(track) {
      case 'facilitator': return FACILITATOR_MODULES;
      case 'board': return BOARD_MODULES;
      default: return CASE_MANAGER_MODULES;
    }
  };

  const currentModules = getModulesForTrack(activeTrack);
  const activeModuleIndex = currentModules.findIndex(m => m.id === activeModuleId);
  const activeModule = currentModules[activeModuleIndex] || currentModules[0];
  const nextModule = activeModuleIndex < currentModules.length - 1 ? currentModules[activeModuleIndex + 1] : null;

  const handleModuleChange = (id: ModuleType) => {
    setActiveModuleId(id);
    setCurrentView('training');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTrackSelect = (track: TrainingTrack) => {
    setActiveTrack(track);
    setTrainingTrackSelected(track);
    const trackModules = getModulesForTrack(track);
    setActiveModuleId(trackModules[0].id);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsTrainingAuthenticated(false);
    setTrainingTrackSelected(null);
    setIsFinanceAuthenticated(false);
    setCurrentView('hub');
  };

  // Assessment page - NO LOGIN REQUIRED (for fathers on mobile)
  if (currentView === 'assessment') {
    return <ClassAssessment />;
  }

  // Progress page - NO LOGIN REQUIRED (for fathers to check their progress)
  if (currentView === 'progress') {
    return <FatherProgress />;
  }

  if (!isLoggedIn) {
    return <LoginPage onLogin={() => setIsLoggedIn(true)} />;
  }

  if (currentView === 'training' && !isTrainingAuthenticated) {
    return <TrainingLoginPage onLogin={() => setIsTrainingAuthenticated(true)} onBack={() => setCurrentView('hub')} />;
  }

  if (currentView === 'training' && !trainingTrackSelected) {
    return <TrainingTrackSelector onSelect={handleTrackSelect} onBack={() => setCurrentView('hub')} />;
  }

  if (currentView === 'finance' && !isFinanceAuthenticated) {
    return <FinancialLoginPage onLogin={() => setIsFinanceAuthenticated(true)} onBack={() => setCurrentView('hub')} />;
  }

  if (currentView === 'hub') {
    return <Hub onNavigate={(view) => setCurrentView(view)} onLogout={handleLogout} />;
  }

  if (currentView === 'casemanager') {
    return <div className="h-screen animate-in fade-in duration-500 relative z-0 overflow-y-auto"><CaseManagerHub onClose={() => setCurrentView('hub')} /></div>;
  }

  if (currentView === 'admin') {
    return <div className="h-screen animate-in fade-in duration-500 relative z-0"><AdminPortal onClose={() => setCurrentView('hub')} /></div>;
  }

  if (currentView === 'tracking') {
    return <div className="h-screen animate-in fade-in duration-500 relative z-0 overflow-y-auto"><FatherhoodTracking onBack={() => setCurrentView('hub')} /></div>;
  }

  // NEW: Multi-Funder Finance Dashboard (standalone, fetches its own data)
  if (currentView === 'finance') {
    return (
      <div className="h-screen animate-in fade-in duration-500 relative z-0 overflow-y-auto">
        <FinanceDashboard onClose={() => setCurrentView('hub')} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      <Sidebar 
        activeModuleId={activeModuleId} 
        onModuleSelect={handleModuleChange} 
        view={currentView === 'manual' ? 'manual' : 'module'} 
        onViewChange={(v) => setCurrentView(v === 'manual' ? 'manual' : 'training')} 
        onBackToHub={() => setCurrentView('hub')}
        activeTrack={activeTrack}
        onTrackSelect={handleTrackSelect}
        activeModules={currentModules}
        onChangeTrack={() => setTrainingTrackSelected(null)}
      />
      <main className="flex-1 flex flex-col md:ml-64 transition-all duration-300">
        <Header activeModule={activeModule} view={currentView === 'manual' ? 'manual' : 'module'} onToggleAssistant={() => setIsAssistantOpen(!isAssistantOpen)} />
        <div className="p-4 md:p-8 flex-1">
          {currentView === 'training' ? (
            <ModuleView 
              module={activeModule} 
              onNext={() => {
                if (nextModule) handleModuleChange(nextModule.id);
                else setCurrentView('manual');
              }}
              nextModuleTitle={nextModule?.title}
            />
          ) : <Manual onSelectModule={handleModuleChange} />}
        </div>
        <footer className="p-6 text-center text-slate-400 text-sm border-t bg-white">&copy; {new Date().getFullYear()} Fathers On A Mission (FOAM). All rights reserved.</footer>
      </main>
      <GeminiAssistant isOpen={isAssistantOpen} onClose={() => setIsAssistantOpen(false)} context={activeModule.fullText} />
      {!isAssistantOpen && <button onClick={() => setIsAssistantOpen(true)} className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center z-50"><i className="fas fa-robot text-xl"></i></button>}
    </div>
  );
};

export default App;
