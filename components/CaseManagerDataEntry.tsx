import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface CaseManagerDataEntryProps {
  onClose: () => void;
}

const CaseManagerDataEntry: React.FC<CaseManagerDataEntryProps> = ({ onClose }) => {
  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={onClose}
          className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow mb-6 hover:bg-slate-50"
        >
          <ArrowLeft size={20} />
          Back to Portal
        </button>
        
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h1 className="text-3xl font-bold text-slate-800 mb-4">
            🎉 Referral Management is Working!
          </h1>
          <p className="text-slate-600">
            If you can see this page, the navigation is working correctly.
            The full interactive dashboard will load here.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CaseManagerDataEntry;
