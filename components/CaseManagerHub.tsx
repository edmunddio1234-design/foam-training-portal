import React, { useState } from 'react';
import CaseManagerLanding from './CaseManagerLanding';
import CaseManagerPortal from './CaseManagerPortal';
import CaseManagerDataEntry from './CaseManagerDataEntry';
import ProgramManagement from './ProgramManagement';

interface CaseManagerHubProps {
  onClose: () => void;
}

type ViewType = 'landing' | 'reports' | 'dataentry' | 'programs';

const CaseManagerHub: React.FC<CaseManagerHubProps> = ({ onClose }) => {
  const [currentView, setCurrentView] = useState<ViewType>('landing');

  if (currentView === 'reports') {
    return (
      <CaseManagerPortal 
        onClose={() => setCurrentView('landing')} 
      />
    );
  }

  if (currentView === 'dataentry') {
    return (
      <CaseManagerDataEntry 
        onClose={() => setCurrentView('landing')} 
      />
    );
  }

  if (currentView === 'programs') {
    return (
      <ProgramManagement 
        onClose={() => setCurrentView('landing')} 
      />
    );
  }

  return (
    <CaseManagerLanding
      onClose={onClose}
      onOpenReports={() => setCurrentView('reports')}
      onOpenDataEntry={() => setCurrentView('dataentry')}
      onOpenPrograms={() => setCurrentView('programs')}
    />
  );
};

export default CaseManagerHub;
