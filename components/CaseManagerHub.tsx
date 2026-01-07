import React, { useState } from 'react';
import CaseManagerLanding from './CaseManagerLanding';
import CaseManagerPortal from './CaseManagerPortal';

interface CaseManagerHubProps {
  onClose: () => void;
}

type ViewType = 'landing' | 'reports';

const CaseManagerHub: React.FC<CaseManagerHubProps> = ({ onClose }) => {
  const [currentView, setCurrentView] = useState<ViewType>('landing');

  if (currentView === 'reports') {
    return (
      <CaseManagerPortal 
        onClose={() => setCurrentView('landing')} 
      />
    );
  }

  return (
    <CaseManagerLanding
      onClose={onClose}
      onOpenReports={() => setCurrentView('reports')}
    />
  );
};

export default CaseManagerHub;
