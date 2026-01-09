import React, { useState } from 'react';
import {
  ArrowLeft, FileText, FolderOpen, BarChart3, ExternalLink,
  FileSpreadsheet, ClipboardList, Users, Baby, Briefcase,
  HeartHandshake, Phone, BookOpen, ChevronRight, Search, X, Info
} from 'lucide-react';

interface CaseManagerLandingProps {
  onClose: () => void;
  onOpenReports: () => void;
}

type TabType = 'home' | 'resources' | 'documents';

const CaseManagerLanding: React.FC<CaseManagerLandingProps> = ({ onClose, onOpenReports }) => {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<any>(null);

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
      url: 'https://docs.google.com/spreadsheets/d/1k5wRl9FOAD-GZZb8OHqhcKwmWl0PhIXAMdj7vFd6qFM/edit?gid=1060095539#gid=1060095539',
      purpose: 'Monitors all clients receiving employment services from initial assessment through job placement and retention check-ins.',
      howToUse: 'Add new clients when they request job help. Update status weekly. Track resume completion, applications submitted, interviews, and placements.',
      keyTopics: ['Client Status', 'Resume Status', 'Job Search Progress', 'Placement Date', 'Retention Milestones']
    },
    {
      id: 'resource-guide',
      title: 'Resource Guide Enhanced',
      description: 'Comprehensive directory of community resources, partner agencies, and support services.',
      icon: BookOpen,
      color: 'bg-emerald-600',
      lightColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      url: 'https://docs.google.com/spreadsheets/d/1Joq9gBwd6spIrbqCBgaicuOFv0jAaGYSRntWZRKQry8/edit?gid=445884882#gid=445884882',
      purpose: 'Comprehensive directory of community partners and resources. Use to connect clients with housing, legal aid, food assistance, and other services.',
      howToUse: 'Search by category or need. Verify contact information before referring. Document all referrals made in case notes.',
      keyTopics: ['Housing Resources', 'Legal Aid', 'Food Assistance', 'Mental Health', 'Employment Services']
    },
    {
      id: 'diaper',
      title: 'Diaper Distribution Tracker',
      description: 'Monitor diaper distribution, inventory levels, and client assistance records.',
      icon: Baby,
      color: 'bg-pink-600',
      lightColor: 'bg-pink-50',
      textColor: 'text-pink-600',
      url: 'https://docs.google.com/spreadsheets/d/1Fl7HSYwULP88C64rbbz6COAc5gpJH-SmRcWy5SLNIDU/edit?gid=471191695#gid=471191695',
      purpose: 'Official record of all diaper distributions. Required for JLBR grant reporting. Tracks quantities by size and funding source.',
      howToUse: 'Complete for EVERY distribution. Include client signature. Distinguish between JLBR-funded and Walmart-donated diapers. Submit monthly totals.',
      keyTopics: ['Client Information', 'Diaper Sizes', 'Quantity', 'Funding Source', 'Monthly Totals']
    }
  ];

  // Procedure Documents - Google Drive links with detailed info
  const procedureDocuments = [
    {
      id: 'case-manager',
      title: 'Case Manager Procedures',
      description: 'Complete operational procedures for case management (Updated 7/22/24)',
      icon: ClipboardList,
      color: 'bg-slate-700',
      url: 'https://docs.google.com/document/d/11my4jGQL2JZ7m3KknRDDzILTAi47lsyp/edit',
      purpose: 'This document outlines the daily workflows and responsibilities for case managers including client communication schedules, documentation requirements, and follow-up protocols.',
      howToUse: 'Reference this document when onboarding new case managers, during weekly check-ins, or when questions arise about proper procedures. Follow the step-by-step checklists for each client interaction.',
      keyTopics: ['Client Communication', 'Documentation', 'Follow-up Schedules', 'Empower DB Entry', 'SharePoint Uploads']
    },
    {
      id: 'customer-service',
      title: 'Customer Service Procedure',
      description: 'Guidelines for client interactions and service delivery standards',
      icon: HeartHandshake,
      color: 'bg-purple-600',
      url: 'https://docs.google.com/document/d/1dONtEBhQO9KTBtm740AkWbU29GtbsSfX/edit',
      purpose: 'Establishes the standard for professional, compassionate client interactions. Covers phone etiquette, in-person meetings, email communication, and conflict resolution.',
      howToUse: 'Review before client meetings. Use the scripts provided for difficult conversations. Reference the escalation procedures when issues arise.',
      keyTopics: ['Phone Etiquette', 'Professional Communication', 'Conflict Resolution', 'Escalation Procedures']
    },
    {
      id: 'diaper-procedure',
      title: 'Diaper Procedure',
      description: 'Protocol for diaper distribution and inventory management',
      icon: Baby,
      color: 'bg-pink-600',
      url: 'https://docs.google.com/document/d/1rikPH15RcFXVTIAwU92vYsp8wEKKmJeS/edit',
      purpose: 'Guides the diaper distribution process from intake to delivery. Includes eligibility requirements, inventory tracking, and reporting for JLBR grant compliance.',
      howToUse: 'Follow this procedure for every diaper request. Complete the distribution log, verify eligibility, and submit monthly reports to JLBR using the provided template.',
      keyTopics: ['Eligibility Requirements', 'Distribution Log', 'Inventory Management', 'JLBR Reporting', 'Size Guidelines']
    },
    {
      id: 'fatherhood-class',
      title: 'Fatherhood Class Procedure',
      description: 'Guidelines for conducting and documenting fatherhood classes',
      icon: Users,
      color: 'bg-blue-600',
      url: 'https://docs.google.com/document/d/1hMCbn7Eja676OVDubX6UHFbAgrFer7kB/edit',
      purpose: 'Comprehensive guide for facilitating the 14-module fatherhood curriculum. Covers class setup, attendance tracking, assessment administration, and graduation requirements.',
      howToUse: 'Prepare for each class using the module guide. Take attendance using Google Forms or sign-in sheets. Enter data into Empower DB within 48 hours of each class.',
      keyTopics: ['14-Module Curriculum', 'Attendance Tracking', 'Pre/Post Assessments', 'Empower DB Entry', 'Graduation Requirements']
    },
    {
      id: 'financial-support',
      title: 'Financial Support Services Procedure',
      description: 'Process for providing financial assistance to clients',
      icon: FileText,
      color: 'bg-emerald-600',
      url: 'https://docs.google.com/document/d/11CQvxG66h6xItxmNFqNDT7ffJAK3eI1y/edit',
      purpose: 'Details the approval process for emergency financial assistance including utilities, food, hotel stays, and transportation. Includes budget limits and documentation requirements.',
      howToUse: 'Complete the Financial Request Form with the client. Gather required documentation (bills, ID). Submit for supervisor approval. Process payment within 48-72 hours of approval.',
      keyTopics: ['Request Process', 'Approval Workflow', 'Budget Limits', 'Required Documentation', 'Payment Processing']
    },
    {
      id: 'referral-intake',
      title: 'Referral & Intake Procedure',
      description: 'Standard process for client referrals and intake documentation',
      icon: Phone,
      color: 'bg-amber-600',
      url: 'https://docs.google.com/document/d/1lFFvENAcwjzKOf01wATw2eLQz33IbAl-/edit',
      purpose: 'Step-by-step guide for processing new client referrals and conducting intake assessments. Ensures consistent data collection and proper enrollment into services.',
      howToUse: 'Use for every new client. Complete all intake forms within 24 hours of first contact. Enter into Empower DB and assign to appropriate case manager. Schedule initial assessment.',
      keyTopics: ['Referral Sources', 'Intake Forms', 'Initial Assessment', 'Program Enrollment', 'Case Assignment']
    },
    {
      id: 'workforce',
      title: 'Workforce Engagement',
      description: 'Procedures for workforce development and employment support',
      icon: Briefcase,
      color: 'bg-indigo-600',
      url: 'https://docs.google.com/document/d/1_workforce_engagement/edit',
      purpose: 'Guides employment support services including job readiness assessment, resume building, job search assistance, and employer partnerships. Tracks placement and retention.',
      howToUse: 'Assess client job readiness first. Create employment plan. Provide resume services. Connect with partner employers. Follow up at 30, 60, 90 days post-placement.',
      keyTopics: ['Job Readiness Assessment', 'Resume Building', 'Job Search Support', 'Employer Partnerships', 'Retention Follow-up']
    }
  ];

  // Filter documents based on search
  const filteredDocuments = procedureDocuments.filter(doc =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.keyTopics.some(topic => topic.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Filter resources based on search
  const filteredResources = resourceSheets.filter(resource =>
    resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resource.keyTopics.some(topic => topic.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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

  // Document Card with Hover Tooltip
  const DocumentCard: React.FC<{ doc: typeof procedureDocuments[0] }> = ({ doc }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const Icon = doc.icon;

    return (
      <div
        className="relative group"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 hover:shadow-lg hover:border-teal-200 transition-all flex items-start gap-4">
          <div className={`w-10 h-10 ${doc.color} text-white rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
            <Icon size={20} />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-slate-800 group-hover:text-teal-600 transition-colors">
              {doc.title}
            </h3>
            <p className="text-slate-500 text-sm mt-1 line-clamp-2">{doc.description}</p>
          </div>
          
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setSelectedDoc(doc);
              }}
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-teal-600 transition-colors"
              title="View Details"
            >
              <Info size={18} />
            </button>
            <a
              href={doc.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-teal-600 transition-colors"
            >
              <ExternalLink size={18} />
            </a>
          </div>
        </div>

        {/* Hover Tooltip */}
        {showTooltip && (
          <div 
            className="absolute z-50 left-0 right-0 top-full mt-2 bg-slate-800 text-white p-4 rounded-xl shadow-xl text-sm"
            style={{ animation: 'fadeIn 0.2s ease-out' }}
          >
            <div className="font-bold text-teal-300 mb-1 text-xs uppercase tracking-wide">📌 Purpose</div>
            <p className="text-slate-200 mb-3 text-xs leading-relaxed">{doc.purpose}</p>
            <div className="font-bold text-teal-300 mb-1 text-xs uppercase tracking-wide">📖 How to Use</div>
            <p className="text-slate-200 text-xs leading-relaxed">{doc.howToUse}</p>
            <div className="absolute -top-2 left-8 w-4 h-4 bg-slate-800 rotate-45"></div>
          </div>
        )}
      </div>
    );
  };

  // Resource Card with Hover Tooltip
  const ResourceCard: React.FC<{ resource: typeof resourceSheets[0] }> = ({ resource }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const Icon = resource.icon;

    return (
      <div
        className="relative group"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-lg hover:border-slate-200 transition-all"
        >
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className={`w-12 h-12 ${resource.color} text-white rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <Icon size={24} />
              </div>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedDoc(resource);
                }}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-teal-600 transition-colors"
                title="View Details"
              >
                <Info size={18} />
              </button>
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

        {/* Hover Tooltip */}
        {showTooltip && (
          <div 
            className="absolute z-50 left-0 right-0 top-full mt-2 bg-slate-800 text-white p-4 rounded-xl shadow-xl text-sm"
            style={{ animation: 'fadeIn 0.2s ease-out' }}
          >
            <div className="font-bold text-teal-300 mb-1 text-xs uppercase tracking-wide">📌 Purpose</div>
            <p className="text-slate-200 mb-3 text-xs leading-relaxed">{resource.purpose}</p>
            <div className="font-bold text-teal-300 mb-1 text-xs uppercase tracking-wide">📖 How to Use</div>
            <p className="text-slate-200 text-xs leading-relaxed">{resource.howToUse}</p>
            <div className="absolute -top-2 left-8 w-4 h-4 bg-slate-800 rotate-45"></div>
          </div>
        )}
      </div>
    );
  };

  // Detail Modal
  const DetailModal = () => {
    if (!selectedDoc) return null;
    const Icon = selectedDoc.icon;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedDoc(null)}>
        <div 
          className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 ${selectedDoc.color} text-white rounded-xl flex items-center justify-center`}>
                <Icon size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">{selectedDoc.title}</h2>
                <p className="text-slate-500 text-sm">{selectedDoc.description}</p>
              </div>
            </div>
            <button onClick={() => setSelectedDoc(null)} className="p-2 hover:bg-slate-100 rounded-lg">
              <X size={24} className="text-slate-400" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-teal-600 uppercase tracking-wide mb-2">Purpose</h3>
              <p className="text-slate-700">{selectedDoc.purpose}</p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-teal-600 uppercase tracking-wide mb-2">How to Use</h3>
              <p className="text-slate-700">{selectedDoc.howToUse}</p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-teal-600 uppercase tracking-wide mb-2">Key Topics</h3>
              <div className="flex flex-wrap gap-2">
                {selectedDoc.keyTopics.map((topic: string, i: number) => (
                  <span key={i} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm">
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t">
              <a
                href={selectedDoc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-colors"
              >
                <ExternalLink size={18} />
                Open Document
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  };

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

      {/* Search Bar */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredResources.map((resource) => (
          <ResourceCard key={resource.id} resource={resource} />
        ))}
      </div>

      {filteredResources.length === 0 && (
        <div className="text-center py-12">
          <Search size={48} className="text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-600">No resources found</h3>
          <p className="text-slate-500">Try different search terms</p>
        </div>
      )}
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

      {/* Search Bar */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search documents by name, description, or topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={18} />
            </button>
          )}
        </div>
        {searchQuery && (
          <p className="text-sm text-slate-500 mt-2">
            Found {filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''} matching "{searchQuery}"
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDocuments.map((doc) => (
          <DocumentCard key={doc.id} doc={doc} />
        ))}
      </div>

      {filteredDocuments.length === 0 && (
        <div className="text-center py-12">
          <Search size={48} className="text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-600">No documents found</h3>
          <p className="text-slate-500">Try different search terms</p>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <FileText size={16} className="text-amber-600" />
        </div>
        <div>
          <p className="text-amber-800 font-medium text-sm">
            These documents open in Google Drive. You can view, download, or print them as needed.
          </p>
          <p className="text-amber-700 text-sm mt-1">
            💡 <strong>Tip:</strong> Hover over any document for a quick summary, or click the <Info size={14} className="inline" /> icon for full details.
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

      {/* Detail Modal */}
      <DetailModal />

      {/* Animation styles */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default CaseManagerLanding;
