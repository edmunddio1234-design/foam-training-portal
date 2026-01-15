import React, { useState } from 'react';
import CaseManagerLanding from './CaseManagerLanding';
import CaseManagerPortal from './CaseManagerPortal';
import CaseManagerDataEntry from './CaseManagerDataEntry';

interface CaseManagerHubProps {
  onClose: () => void;
}

type ViewType = 'landing' | 'reports' | 'dataentry';

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

  return (
    <CaseManagerLanding
      onClose={onClose}
      onOpenReports={() => setCurrentView('reports')}
      onOpenDataEntry={() => setCurrentView('dataentry')}
    />
  );
};

export default CaseManagerHub;
