import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, FileText, FolderOpen, BarChart3, ExternalLink,
  FileSpreadsheet, ClipboardList, Users, Baby, Briefcase,
  HeartHandshake, Phone, BookOpen, ChevronRight, Search, X, Info,
  RefreshCw, File, FileImage
} from 'lucide-react';

interface CaseManagerLandingProps {
  onClose: () => void;
  onOpenReports: () => void;
}

type TabType = 'home' | 'resources' | 'documents';

const API_BASE_URL = 'https://foamla-backend-2.onrender.com';
const FORMS_FOLDER_ID = '1rPbAGgMVYYeJwMxFxLyfkW1rYRkxK-RL';

interface DriveFile {
  id: string;
  name: string;
  type: string;
  url?: string;
  isFolder?: boolean;
}

const CaseManagerLanding: React.FC<CaseManagerLandingProps> = ({ onClose, onOpenReports }) => {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [driveFiles, setDriveFiles] = useState<DriveFile[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);

  useEffect(() => {
    if (activeTab === 'documents' && driveFiles.length === 0) {
      loadDriveFiles();
    }
  }, [activeTab]);

  const loadDriveFiles = async () => {
    setIsLoadingFiles(true);
    try {
      const response = await fetch(API_BASE_URL + '/api/documents?folderId=' + FORMS_FOLDER_ID);
      const data = await response.json();
      if (data.success && data.data) {
        const foamFiles = data.data.filter((f: any) => 
          f && f.name && f.name.includes('FOAM') && !f.isFolder
        );
        setDriveFiles(foamFiles);
      }
    } catch (err) {
      console.error('Failed to load files:', err);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const getFileUrl = (file: DriveFile) => {
    if (file.type.includes('spreadsheet')) {
      return 'https://docs.google.com/spreadsheets/d/' + file.id + '/edit';
    } else if (file.type.includes('document') || file.type.includes('word')) {
      return 'https://docs.google.com/document/d/' + file.id + '/edit';
    } else if (file.type.includes('pdf')) {
      return 'https://drive.google.com/file/d/' + file.id + '/view';
    }
    return 'https://drive.google.com/file/d/' + file.id + '/view';
  };

  const getFileIcon = (type: string) => {
    if (type.includes('spreadsheet')) return FileSpreadsheet;
    if (type.includes('document') || type.includes('word')) return FileText;
    if (type.includes('pdf')) return FileImage;
    return File;
  };

  const getFileColor = (type: string) => {
    if (type.includes('spreadsheet')) return 'bg-emerald-500';
    if (type.includes('document') || type.includes('word')) return 'bg-blue-500';
    if (type.includes('pdf')) return 'bg-red-500';
    return 'bg-slate-500';
  };

  const cleanFileName = (name: string) => {
    return name
      .replace(/^Copy of /, '')
      .replace(/FOAM_/g, '')
      .replace(/_/g, ' ')
      .replace(/\.(xlsx|docx|pdf)$/i, '')
      .replace(/\(\d+\)$/, '')
      .trim();
  };

  const getFileDescription = (name: string) => {
    const cleanName = name.toLowerCase();
    if (cleanName.includes('referral')) return 'Track and manage client referrals';
    if (cleanName.includes('attendance') || cleanName.includes('checklist')) return 'Track class attendance and completion';
    if (cleanName.includes('call') || cleanName.includes('contact')) return 'Client contact information and call logs';
    if (cleanName.includes('timesheet') || cleanName.includes('employee')) return 'Staff time tracking and hours';
    if (cleanName.includes('financial') || cleanName.includes('support request')) return 'Financial assistance requests';
    if (cleanName.includes('diaper')) return 'Diaper distribution and inventory';
    if (cleanName.includes('donation') || cleanName.includes('kind')) return 'In-kind donation tracking';
    if (cleanName.includes('intern')) return 'Intern activity and time logs';
    if (cleanName.includes('enrollment')) return 'New client enrollment tracking';
    if (cleanName.includes('evaluation') || cleanName.includes('report')) return 'Program evaluation and reporting';
    if (cleanName.includes('agreement')) return 'Client agreements and consent forms';
    if (cleanName.includes('procedure')) return 'Standard operating procedures';
    if (cleanName.includes('consent') || cleanName.includes('parental')) return 'Parental consent documentation';
    if (cleanName.includes('roster')) return 'Client roster and listings';
    if (cleanName.includes('sign') || cleanName.includes('office')) return 'Office sign-in and visitor logs';
    if (cleanName.includes('packet')) return 'Support packet documentation';
    return 'FOAM organizational document';
  };

  const resourceSheets = [
    {
      id: 'employment',
      title: 'Employment Support Tracker',
      description: 'Track client employment status, job placements, and workforce development progress.',
      icon: Briefcase,
      color: 'bg-blue-600',
      url: 'https://docs.google.com/spreadsheets/d/1k5wRl9FOAD-GZZb8OHqhcKwmWl0PhIXAMdj7vFd6qFM/edit',
      purpose: 'Monitors all clients receiving employment services from initial assessment through job placement.',
      howToUse: 'Add new clients when they request job help. Update status weekly.',
      keyTopics: ['Client Status', 'Resume Status', 'Job Search Progress', 'Placement Date']
    },
    {
      id: 'resource-guide',
      title: 'Resource Guide Enhanced',
      description: 'Comprehensive directory of community resources, partner agencies, and support services.',
      icon: BookOpen,
      color: 'bg-emerald-600',
      url: 'https://docs.google.com/spreadsheets/d/1Joq9gBwd6spIrbqCBgaicuOFv0jAaGYSRntWZRKQry8/edit',
      purpose: 'Directory of community partners and resources for client referrals.',
      howToUse: 'Search by category or need. Verify contact information before referring.',
      keyTopics: ['Housing Resources', 'Legal Aid', 'Food Assistance', 'Mental Health']
    },
    {
      id: 'diaper',
      title: 'Diaper Distribution Tracker',
      description: 'Monitor diaper distribution, inventory levels, and client assistance records.',
      icon: Baby,
      color: 'bg-pink-600',
      url: 'https://docs.google.com/spreadsheets/d/1Fl7HSYwULP88C64rbbz6COAc5gpJH-SmRcWy5SLNIDU/edit',
      purpose: 'Official record of all diaper distributions for JLBR grant reporting.',
      howToUse: 'Complete for EVERY distribution. Include client signature.',
      keyTopics: ['Client Information', 'Diaper Sizes', 'Quantity', 'Funding Source']
    }
  ];

  const procedureDocuments = [
    {
      id: 'case-manager',
      title: 'Case Manager Procedures',
      description: 'Complete operational procedures for case management (Updated 7/22/24)',
      icon: ClipboardList,
      color: 'bg-slate-700',
      url: 'https://docs.google.com/document/d/11my4jGQL2JZ7m3KknRDDzILTAi47lsyp/edit',
      purpose: 'Outlines daily workflows and responsibilities for case managers including communication schedules and documentation requirements.',
      howToUse: 'Reference when onboarding new case managers or when questions arise about proper procedures.',
      keyTopics: ['Client Communication', 'Documentation', 'Follow-up Schedules', 'Empower DB Entry']
    },
    {
      id: 'customer-service',
      title: 'Customer Service Procedure',
      description: 'Guidelines for client interactions and service delivery standards',
      icon: HeartHandshake,
      color: 'bg-purple-600',
      url: 'https://docs.google.com/document/d/1dONtEBhQO9KTBtm740AkWbU29GtbsSfX/edit',
      purpose: 'Establishes standards for professional, compassionate client interactions.',
      howToUse: 'Review before client meetings. Use scripts for difficult conversations.',
      keyTopics: ['Phone Etiquette', 'Professional Communication', 'Conflict Resolution']
    },
    {
      id: 'diaper-procedure',
      title: 'Diaper Procedure',
      description: 'Protocol for diaper distribution and inventory management',
      icon: Baby,
      color: 'bg-pink-600',
      url: 'https://docs.google.com/document/d/1rikPH15RcFXVTIAwU92vYsp8wEKKmJeS/edit',
      purpose: 'Guides the diaper distribution process including eligibility and JLBR compliance.',
      howToUse: 'Follow for every diaper request. Complete distribution log and submit monthly reports.',
      keyTopics: ['Eligibility Requirements', 'Distribution Log', 'JLBR Reporting']
    },
    {
      id: 'fatherhood-class',
      title: 'Fatherhood Class Procedure',
      description: 'Guidelines for conducting and documenting fatherhood classes',
      icon: Users,
      color: 'bg-blue-600',
      url: 'https://docs.google.com/document/d/1hMCbn7Eja676OVDubX6UHFbAgrFer7kB/edit',
      purpose: 'Guide for facilitating the 14-module fatherhood curriculum.',
      howToUse: 'Prepare using module guide. Enter data into Empower DB within 48 hours.',
      keyTopics: ['14-Module Curriculum', 'Attendance Tracking', 'Pre/Post Assessments']
    },
    {
      id: 'financial-support',
      title: 'Financial Support Services Procedure',
      description: 'Process for providing financial assistance to clients',
      icon: FileText,
      color: 'bg-emerald-600',
      url: 'https://docs.google.com/document/d/11CQvxG66h6xItxmNFqNDT7ffJAK3eI1y/edit',
      purpose: 'Details approval process for emergency financial assistance.',
      howToUse: 'Complete Financial Request Form. Submit for supervisor approval.',
      keyTopics: ['Request Process', 'Approval Workflow', 'Budget Limits']
    },
    {
      id: 'referral-intake',
      title: 'Referral & Intake Procedure',
      description: 'Standard process for client referrals and intake documentation',
      icon: Phone,
      color: 'bg-amber-600',
      url: 'https://docs.google.com/document/d/1lFFvENAcwjzKOf01wATw2eLQz33IbAl-/edit',
      purpose: 'Step-by-step guide for processing new client referrals.',
      howToUse: 'Complete intake forms within 24 hours of first contact.',
      keyTopics: ['Referral Sources', 'Intake Forms', 'Program Enrollment']
    },
    {
      id: 'workforce',
      title: 'Workforce Engagement',
      description: 'Procedures for workforce development and employment support',
      icon: Briefcase,
      color: 'bg-indigo-600',
      url: 'https://docs.google.com/document/d/1_workforce_engagement/edit',
      purpose: 'Guides employment support services including job readiness assessment.',
      howToUse: 'Assess job readiness first. Follow up at 30, 60, 90 days post-placement.',
      keyTopics: ['Job Readiness', 'Resume Building', 'Employer Partnerships']
    }
  ];

  const filteredProcedures = procedureDocuments.filter(doc =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.keyTopics.some(topic => topic.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredDriveFiles = driveFiles.filter(file =>
    file && file.name && (
      cleanFileName(file.name).toLowerCase().includes(searchQuery.toLowerCase()) ||
      getFileDescription(file.name).toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const filteredResources = resourceSheets.filter(resource =>
    resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resource.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  const handleOpenDetails = (doc: any) => {
    setSelectedDoc(doc);
  };

  const handleOpenLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const renderHomeView = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {portalCards.map((card) => {
          const IconComponent = card.icon;
          return (
            <button
              key={card.id}
              onClick={card.action}
              className="group relative bg-white rounded-3xl p-8 shadow-sm border border-slate-100 hover:shadow-xl hover:border-slate-200 transition-all duration-300 text-left overflow-hidden"
            >
              <div className={'absolute -right-6 -top-6 w-24 h-24 ' + card.color + ' opacity-5 rounded-full group-hover:scale-150 transition-transform duration-500'}></div>
              <div className="relative z-10 space-y-4">
                <div className={'w-14 h-14 ' + card.color + ' text-white rounded-2xl flex items-center justify-center shadow-lg ' + card.shadow + ' group-hover:scale-110 transition-transform'}>
                  <IconComponent size={24} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-slate-800">{card.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{card.description}</p>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 group-hover:text-teal-600 transition-colors">Access</span>
                <div className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-all">
                  <ChevronRight size={16} />
                </div>
              </div>
            </button>
          );
        })}
      </div>

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
              <span className="text-sm font-medium">📁 40+ Forms & Templates</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderResourcesView = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => { setActiveTab('home'); setSearchQuery(''); }} className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs hover:bg-slate-200 transition-all uppercase tracking-wider">
          <ArrowLeft size={16} /> Back to Portal
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Resource Trackers</h2>
          <p className="text-slate-500 text-sm">Google Sheets for tracking and management</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
          />
          {searchQuery && (
            <button type="button" onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredResources.map((resource) => {
          const IconComponent = resource.icon;
          return (
            <div
              key={resource.id}
              onClick={() => handleOpenLink(resource.url)}
              className="group bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-lg hover:border-slate-200 transition-all cursor-pointer"
            >
              <div className="space-y-4">
                <div className={'w-12 h-12 ' + resource.color + ' text-white rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform'}>
                  <IconComponent size={24} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-slate-800 group-hover:text-teal-600 transition-colors">{resource.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{resource.description}</p>
                </div>
                <div className="flex items-center gap-2 text-teal-600 font-bold text-xs uppercase tracking-wider pt-2">
                  <FileSpreadsheet size={14} />
                  <span>Open in Google Sheets</span>
                  <ExternalLink size={12} className="ml-auto" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderDocumentsView = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => { setActiveTab('home'); setSearchQuery(''); }} className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs hover:bg-slate-200 transition-all uppercase tracking-wider">
          <ArrowLeft size={16} /> Back to Portal
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Procedure Documents</h2>
          <p className="text-slate-500 text-sm">Standard operating procedures and guidelines</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search documents by name, description, or topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
          />
          {searchQuery && (
            <button type="button" onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X size={18} />
            </button>
          )}
        </div>
        {searchQuery && (
          <p className="text-sm text-slate-500 mt-2">
            Found {filteredProcedures.length + filteredDriveFiles.length} document{filteredProcedures.length + filteredDriveFiles.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {filteredProcedures.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <ClipboardList size={20} className="text-slate-600" />
            Procedures
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProcedures.map((doc) => {
              const IconComponent = doc.icon;
              return (
                <div key={doc.id} className="relative group">
                  <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 hover:shadow-lg hover:border-teal-200 transition-all flex items-start gap-4">
                    <div className={'w-10 h-10 ' + doc.color + ' text-white rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform'}>
                      <IconComponent size={20} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-slate-800 group-hover:text-teal-600 transition-colors">
                        {doc.title}
                      </h3>
                      <p className="text-slate-500 text-sm mt-1 line-clamp-2">{doc.description}</p>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenDetails(doc)}
                        className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-teal-600 transition-colors z-10"
                        title="View Details"
                      >
                        <Info size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenLink(doc.url)}
                        className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-teal-600 transition-colors z-10"
                        title="Open Document"
                      >
                        <ExternalLink size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <FileSpreadsheet size={20} className="text-emerald-600" />
            Forms & Trackers
            <span className="text-sm font-normal text-slate-500">({filteredDriveFiles.length} files)</span>
          </h3>
          <button
            type="button"
            onClick={loadDriveFiles}
            disabled={isLoadingFiles}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-teal-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <RefreshCw size={14} className={isLoadingFiles ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {isLoadingFiles ? (
          <div className="text-center py-12">
            <RefreshCw size={32} className="animate-spin text-teal-600 mx-auto mb-4" />
            <p className="text-slate-500">Loading files from Google Drive...</p>
          </div>
        ) : filteredDriveFiles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredDriveFiles.map((file) => {
              const IconComponent = getFileIcon(file.type);
              const color = getFileColor(file.type);
              const displayName = cleanFileName(file.name);
              const description = getFileDescription(file.name);
              const url = getFileUrl(file);

              return (
                <div
                  key={file.id}
                  onClick={() => handleOpenLink(url)}
                  className="group bg-white rounded-xl p-4 shadow-sm border border-slate-100 hover:shadow-lg hover:border-teal-200 transition-all cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className={'w-10 h-10 ' + color + ' text-white rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform'}>
                      <IconComponent size={20} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-slate-800 group-hover:text-teal-600 transition-colors truncate">
                        {displayName}
                      </h3>
                      <p className="text-slate-500 text-xs mt-1 line-clamp-1">{description}</p>
                    </div>
                    
                    <ExternalLink size={16} className="text-slate-400 group-hover:text-teal-600 flex-shrink-0 mt-1" />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 bg-slate-50 rounded-xl">
            <FolderOpen size={32} className="text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500">No files found</p>
            <button
              type="button"
              onClick={loadDriveFiles}
              className="mt-2 text-teal-600 text-sm font-medium hover:underline"
            >
              Try loading again
            </button>
          </div>
        )}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <FileText size={16} className="text-amber-600" />
        </div>
        <div>
          <p className="text-amber-800 font-medium text-sm">
            These documents open in Google Drive. You can view, download, or print them as needed.
          </p>
          <p className="text-amber-700 text-sm mt-1">
            Tip: Click the info icon for full details about any procedure document.
          </p>
        </div>
      </div>
    </div>
  );

  const renderDetailModal = () => {
    if (!selectedDoc) return null;
    const IconComponent = selectedDoc.icon;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedDoc(null)}>
        <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={'w-12 h-12 ' + selectedDoc.color + ' text-white rounded-xl flex items-center justify-center'}>
                <IconComponent size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">{selectedDoc.title}</h2>
                <p className="text-slate-500 text-sm">{selectedDoc.description}</p>
              </div>
            </div>
            <button type="button" onClick={() => setSelectedDoc(null)} className="p-2 hover:bg-slate-100 rounded-lg">
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
                {selectedDoc.keyTopics && selectedDoc.keyTopics.map((topic: string, i: number) => (
                  <span key={i} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm">{topic}</span>
                ))}
              </div>
            </div>
            <div className="pt-4 border-t">
              <button
                type="button"
                onClick={() => {
                  handleOpenLink(selectedDoc.url);
                  setSelectedDoc(null);
                }}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-colors"
              >
                <ExternalLink size={18} />
                Open Document
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
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
          
          {activeTab !== 'home' && (
            <div className="hidden md:flex items-center gap-2 text-sm">
              <span className="text-slate-400">Portal</span>
              <ChevronRight size={14} className="text-slate-500" />
              <span className="text-white font-medium capitalize">{activeTab}</span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {activeTab === 'home' && renderHomeView()}
        {activeTab === 'resources' && renderResourcesView()}
        {activeTab === 'documents' && renderDocumentsView()}
      </div>

      {renderDetailModal()}
    </div>
  );
};

export default CaseManagerLanding;
