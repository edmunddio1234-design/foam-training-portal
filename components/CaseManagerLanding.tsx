import React, { useState } from 'react';
import {
  ArrowLeft, FileText, FolderOpen, BarChart3, ExternalLink,
  FileSpreadsheet, ClipboardList, Users, Baby, Briefcase,
  HeartHandshake, Phone, BookOpen, Download, ChevronRight
} from 'lucide-react';

interface CaseManagerLandingProps {
  onClose: () => void;
  onOpenReports: () => void;
}

type TabType = 'home' | 'resources' | 'documents';

const CaseManagerLanding: React.FC<CaseManagerLandingProps> = ({ onClose, onOpenReports }) => {
  const [activeTab, setActiveTab] = useState<TabType>('home');

  // Resource Sheets - Google Sheets links
  const resourceSheets = [
    {
      id: 'employment',
      title: 'Employment Support Tracker',
      description: 'Track client employment status, job placements, and workforce development progress.',
      icon: Briefcase,
      color: 'bg-blue-600',
      lightColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      url: 'https://docs.google.com/spreadsheets/d/1k5wRl9FOAD-GZZb8OHqhcKwmWl0PhIXAMdj7vFd6qFM/edit?gid=1060095539#gid=1060095539'
    },
    {
      id: 'resource-guide',
      title: 'Resource Guide Enhanced',
      description: 'Comprehensive directory of community resources, partner agencies, and support services.',
      icon: BookOpen,
      color: 'bg-emerald-600',
      lightColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      url: 'https://docs.google.com/spreadsheets/d/1Joq9gBwd6spIrbqCBgaicuOFv0jAaGYSRntWZRKQry8/edit?gid=445884882#gid=445884882'
    },
    {
      id: 'diaper',
      title: 'Diaper Distribution Tracker',
      description: 'Monitor diaper distribution, inventory levels, and client assistance records.',
      icon: Baby,
      color: 'bg-pink-600',
      lightColor: 'bg-pink-50',
      textColor: 'text-pink-600',
      url: 'https://docs.google.com/spreadsheets/d/1Fl7HSYwULP88C64rbbz6COAc5gpJH-SmRcWy5SLNIDU/edit?gid=471191695#gid=471191695'
    }
  ];

  // Procedure Documents - Google Drive links
  const procedureDocuments = [
    {
      id: 'case-manager',
      title: 'Case Manager Procedures',
      description: 'Complete operational procedures for case management (Updated 7/22/24)',
      icon: ClipboardList,
      color: 'bg-slate-700',
      url: 'https://docs.google.com/document/d/11my4jGQL2JZ7m3KknRDDzILTAi47lsyp/edit'
    },
    {
      id: 'customer-service',
      title: 'Customer Service Procedure',
      description: 'Guidelines for client interactions and service delivery standards',
      icon: HeartHandshake,
      color: 'bg-purple-600',
      url: 'https://docs.google.com/document/d/1dONtEBhQO9KTBtm740AkWbU29GtbsSfX/edit'
    },
    {
      id: 'diaper-procedure',
      title: 'Diaper Procedure',
      description: 'Protocol for diaper distribution and inventory management',
      icon: Baby,
      color: 'bg-pink-600',
      url: 'https://docs.google.com/document/d/1rikPH15RcFXVTIAwU92vYsp8wEKKmJeS/edit'
    },
    {
      id: 'fatherhood-class',
      title: 'Fatherhood Class Procedure',
      description: 'Guidelines for conducting and documenting fatherhood classes',
      icon: Users,
      color: 'bg-blue-600',
      url: 'https://docs.google.com/document/d/1hMCbn7Eja676OVDubX6UHFbAgrFer7kB/edit'
    },
    {
      id: 'financial-support',
      title: 'Financial Support Services Procedure',
      description: 'Process for providing financial assistance to clients',
      icon: FileText,
      color: 'bg-emerald-600',
      url: 'https://docs.google.com/document/d/11CQvxG66h6xItxmNFqNDT7ffJAK3eI1y/edit'
    },
    {
      id: 'referral-intake',
      title: 'Referral & Intake Procedure',
      description: 'Standard process for client referrals and intake documentation',
      icon: Phone,
      color: 'bg-amber-600',
      url: 'https://docs.google.com/document/d/1lFFvENAcwjzKOf01wATw2eLQz33IbAl-/edit'
    },
    {
      id: 'workforce',
      title: 'Workforce Engagement',
      description: 'Procedures for workforce development and employment support',
      icon: Briefcase,
      color: 'bg-indigo-600',
      url: 'https://drive.google.com/file/d/1_workforce_engagement/view' // You may need to update this URL
    }
  ];

  // Main portal cards for home view
  const portalCards = [
    {
      id: 'reports',
      title: 'Monthly Reports',
      description: 'Generate funder reports, view historical data, and track year-over-year comparisons.',
      icon: BarChart3,
      color: 'bg-teal-600',
      shadow: 'shadow-teal-200',
      action: () => onOpenReports()
    },
    {
      id: 'resources',
      title: 'Resources',
      description: 'Access employment trackers, resource guides, and distribution tracking sheets.',
      icon: FileSpreadsheet,
      color: 'bg-blue-600',
      shadow: 'shadow-blue-200',
      action: () => setActiveTab('resources')
    },
    {
      id: 'documents',
      title: 'Documents',
      description: 'View and download procedure documents, forms, and operational guidelines.',
      icon: FolderOpen,
      color: 'bg-amber-600',
      shadow: 'shadow-amber-200',
      action: () => setActiveTab('documents')
    }
  ];

  const renderHomeView = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Portal Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {portalCards.map((card) => (
          <button
            key={card.id}
            onClick={card.action}
            className="group relative bg-white rounded-3xl p-8 shadow-sm border border-slate-100 hover:shadow-xl hover:border-slate-200 transition-all duration-300 text-left overflow-hidden"
          >
            {/* Background decoration */}
            <div className={`absolute -right-6 -top-6 w-24 h-24 ${card.color} opacity-5 rounded-full group-hover:scale-150 transition-transform duration-500`}></div>
            
            <div className="relative z-10 space-y-4">
              <div className={`w-14 h-14 ${card.color} text-white rounded-2xl flex items-center justify-center shadow-lg ${card.shadow} group-hover:scale-110 transition-transform`}>
                <card.icon size={24} />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-800">{card.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{card.description}</p>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 group-hover:text-teal-600 transition-colors">
                Access
              </span>
              <div className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-all">
                <ChevronRight size={16} />
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Quick Stats or Info Section */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10">
          <ClipboardList size={200} />
        </div>
        <div className="relative z-10 space-y-4">
          <h3 className="text-lg font-bold text-slate-300 uppercase tracking-wider">Case Manager Hub</h3>
          <p className="text-2xl font-bold leading-relaxed max-w-2xl">
            Your central location for reports, resources, and procedures. Everything you need to serve fathers effectively.
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <div className="px-4 py-2 bg-white/10 rounded-xl">
              <span className="text-sm font-medium">📊 3 Resource Trackers</span>
            </div>
            <div className="px-4 py-2 bg-white/10 rounded-xl">
              <span className="text-sm font-medium">📄 7 Procedure Documents</span>
            </div>
            <div className="px-4 py-2 bg-white/10 rounded-xl">
              <span className="text-sm font-medium">📈 Report Generator</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderResourcesView = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs hover:bg-slate-200 transition-all uppercase tracking-wider"
        >
          <ArrowLeft size={16} />
          Back to Portal
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Resource Trackers</h2>
          <p className="text-slate-500 text-sm">Google Sheets for tracking and management</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {resourceSheets.map((resource) => (
          <a
            key={resource.id}
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-lg hover:border-slate-200 transition-all"
          >
            <div className="space-y-4">
              <div className={`w-12 h-12 ${resource.color} text-white rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <resource.icon size={24} />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-800 group-hover:text-teal-600 transition-colors">
                  {resource.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">{resource.description}</p>
              </div>
              
              <div className="flex items-center gap-2 text-teal-600 font-bold text-xs uppercase tracking-wider pt-2">
                <FileSpreadsheet size={14} />
                <span>Open in Google Sheets</span>
                <ExternalLink size={12} className="ml-auto" />
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );

  const renderDocumentsView = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs hover:bg-slate-200 transition-all uppercase tracking-wider"
        >
          <ArrowLeft size={16} />
          Back to Portal
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Procedure Documents</h2>
          <p className="text-slate-500 text-sm">Standard operating procedures and guidelines</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {procedureDocuments.map((doc) => (
          <a
            key={doc.id}
            href={doc.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-white rounded-xl p-5 shadow-sm border border-slate-100 hover:shadow-lg hover:border-slate-200 transition-all flex items-start gap-4"
          >
            <div className={`w-10 h-10 ${doc.color} text-white rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
              <doc.icon size={20} />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-slate-800 group-hover:text-teal-600 transition-colors">
                {doc.title}
              </h3>
              <p className="text-slate-500 text-sm mt-1 line-clamp-2">{doc.description}</p>
            </div>
            
            <div className="flex items-center gap-1 text-slate-400 group-hover:text-teal-600 transition-colors">
              <ExternalLink size={16} />
            </div>
          </a>
        ))}
      </div>

      {/* Info Box */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <FileText size={16} className="text-amber-600" />
        </div>
        <div>
          <p className="text-amber-800 font-medium text-sm">
            These documents open in Google Drive. You can view, download, or print them as needed.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-3">
                <ClipboardList size={28} />
                Case Manager Portal
              </h1>
              <p className="text-slate-300 text-sm">Resources, documents, and reporting tools</p>
            </div>
          </div>
          
          {/* Breadcrumb / Tab indicator */}
          {activeTab !== 'home' && (
            <div className="hidden md:flex items-center gap-2 text-sm">
              <span className="text-slate-400">Portal</span>
              <ChevronRight size={14} className="text-slate-500" />
              <span className="text-white font-medium capitalize">{activeTab}</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto p-6">
        {activeTab === 'home' && renderHomeView()}
        {activeTab === 'resources' && renderResourcesView()}
        {activeTab === 'documents' && renderDocumentsView()}
      </div>
    </div>
  );
};

export default CaseManagerLanding;
