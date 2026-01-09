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
  modifiedTime?: string;
  size?: string;
}

interface FileDetails {
  description: string;
  purpose: string;
  howToUse: string;
  keyTopics: string[];
}

const CaseManagerLanding: React.FC<CaseManagerLandingProps> = ({ onClose, onOpenReports }) => {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [driveFiles, setDriveFiles] = useState<DriveFile[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [hoveredFileId, setHoveredFileId] = useState<string | null>(null);
  const [hoveredProcedureId, setHoveredProcedureId] = useState<string | null>(null);

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

  const getFileTypeName = (type: string) => {
    if (type.includes('spreadsheet')) return 'Google Sheets';
    if (type.includes('document')) return 'Google Docs';
    if (type.includes('word')) return 'Word Document';
    if (type.includes('pdf')) return 'PDF Document';
    if (type.includes('excel')) return 'Excel Spreadsheet';
    return 'Document';
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

  const fileDetailsMap: Record<string, FileDetails> = {
    'new referrals tracker': {
      description: 'Central database for tracking all incoming client referrals',
      purpose: 'Captures and monitors new client referrals from DCFS, courts, probation, and community partners. Tracks referral source, client demographics, and intake progress.',
      howToUse: 'Enter new referrals within 24 hours of receipt. Update status column as clients move through intake. Mark completed when enrolled or closed.',
      keyTopics: ['Referral Source', 'Client Demographics', 'Intake Status', 'Follow-up Actions']
    },
    'intern activity log': {
      description: 'Daily activity tracking for FOAM interns',
      purpose: 'Records daily activities, tasks completed, and hours worked by interns. Used for supervision, performance tracking, and timesheet verification.',
      howToUse: 'Interns complete at end of each work day. Log all activities with time spent. Submit to supervisor weekly for review.',
      keyTopics: ['Daily Tasks', 'Hours Worked', 'Projects Assigned', 'Supervisor Notes']
    },
    'intern support packet': {
      description: 'Onboarding and resource packet for new FOAM interns',
      purpose: 'Comprehensive orientation materials including policies, procedures, contacts, and training requirements for new interns.',
      howToUse: 'Provide to all new interns on first day. Review together during orientation. Have intern sign acknowledgment.',
      keyTopics: ['Orientation Checklist', 'Policies', 'Emergency Contacts', 'Training Requirements']
    },
    'class attendance checklist': {
      description: 'Track father attendance at each fatherhood class module',
      purpose: 'Official attendance record for the 14-module fatherhood program. Required for grant compliance and certification tracking.',
      howToUse: 'Mark attendance at start of each class. Record late arrivals. Update completion status after each module.',
      keyTopics: ['Module Tracking', 'Attendance Dates', 'Completion Status', 'Make-up Classes']
    },
    'program evaluation report': {
      description: 'Comprehensive evaluation metrics and outcomes',
      purpose: 'Aggregates program outcomes, participant progress, and impact metrics for grant reporting and continuous improvement.',
      howToUse: 'Complete quarterly or as required by funders. Pull data from trackers and assessments. Submit with narrative summary.',
      keyTopics: ['Outcome Metrics', 'Participant Numbers', 'Success Rates', 'Grant Deliverables']
    },
    'new enrollment tracker': {
      description: 'Track new client enrollments across all programs',
      purpose: 'Master list of all new enrollments including fatherhood classes, case management, and support services.',
      howToUse: 'Add new enrollments immediately after intake completion. Update program assignment and start dates.',
      keyTopics: ['Enrollment Date', 'Program Assignment', 'Referral Source', 'Case Manager']
    },
    'employee timesheet': {
      description: 'Staff time tracking for payroll and grant allocation',
      purpose: 'Official record of employee hours worked, allocated by program and funding source. Required for payroll and grant cost allocation.',
      howToUse: 'Complete daily or weekly. Allocate hours to correct program codes. Submit to supervisor by Friday.',
      keyTopics: ['Hours Worked', 'Program Codes', 'Grant Allocation', 'Supervisor Approval']
    },
    'intern weekly log': {
      description: 'Weekly summary of intern activities and goals',
      purpose: 'Summarizes weekly accomplishments, challenges, and learning objectives. Used for supervision meetings.',
      howToUse: 'Complete every Friday. Summarize week activities and hours. Note challenges for supervisor.',
      keyTopics: ['Weekly Summary', 'Hours Total', 'Learning Goals', 'Supervisor Feedback']
    },
    'parental consent form': {
      description: 'Required consent for minors in FOAM programs',
      purpose: 'Legal consent form required for any participant under 18. Covers program participation and photo/video release.',
      howToUse: 'Required before minor can participate. Parent/guardian must sign in person. Keep original on file.',
      keyTopics: ['Guardian Signature', 'Photo Release', 'Emergency Contact', 'Program Consent']
    },
    'in kind donation tracker': {
      description: 'Record all in-kind donations received by FOAM',
      purpose: 'Documents non-cash donations including goods, services, and volunteer hours. Required for tax reporting.',
      howToUse: 'Log all donations immediately upon receipt. Include donor info and estimated fair market value.',
      keyTopics: ['Donor Information', 'Item Description', 'Fair Market Value', 'Acknowledgment']
    },
    'fatherhood class procedure': {
      description: 'SOPs for facilitating fatherhood classes',
      purpose: 'Step-by-step guide for preparing, facilitating, and documenting the 14-module fatherhood curriculum.',
      howToUse: 'Review before each class session. Follow preparation checklist. Complete documentation within 48 hours.',
      keyTopics: ['Class Preparation', 'Facilitation Guide', 'Documentation', 'Empower DB Entry']
    },
    'office sign in sheet': {
      description: 'Visitor and client sign-in log for FOAM offices',
      purpose: 'Tracks all visitors to FOAM offices for security, attendance verification, and contact tracing.',
      howToUse: 'All visitors sign in upon arrival. Record name, time, purpose of visit. Sign out upon departure.',
      keyTopics: ['Visitor Name', 'Time In/Out', 'Purpose', 'Staff Contact']
    },
    'employment support tracker': {
      description: 'Track client progress through employment services',
      purpose: 'Monitors clients receiving workforce development services from assessment through job placement and retention.',
      howToUse: 'Add clients at intake. Update weekly with job search activities. Follow up at 30/60/90 days post-placement.',
      keyTopics: ['Job Readiness', 'Resume Status', 'Applications', 'Placement & Retention']
    },
    'evaluation results summary': {
      description: 'Summary of pre/post assessment results',
      purpose: 'Aggregates individual assessment scores to show program impact and participant growth.',
      howToUse: 'Update after each cohort completes. Calculate pre/post score changes. Identify improvement areas.',
      keyTopics: ['Pre-Test Scores', 'Post-Test Scores', 'Score Improvement', 'Cohort Comparison']
    },
    'client call list': {
      description: 'Active client contact list for outreach calls',
      purpose: 'Working list of clients requiring phone contact for appointments, follow-ups, or re-engagement.',
      howToUse: 'Update daily with new calls needed. Log call attempts and outcomes. Prioritize by urgency.',
      keyTopics: ['Client Contact', 'Call Purpose', 'Attempt Log', 'Outcome/Next Steps']
    },
    'father referral form': {
      description: 'Intake form for new father referrals',
      purpose: 'Standard referral form used by partner agencies to refer fathers to FOAM services.',
      howToUse: 'Provide to referral partners. Review for completeness upon receipt. Contact client within 48 hours.',
      keyTopics: ['Client Information', 'Referral Source', 'Services Requested', 'Urgency Level']
    },
    'fatherhood class agreement': {
      description: 'Participant agreement for fatherhood program',
      purpose: 'Outlines program expectations, attendance requirements, and participant responsibilities.',
      howToUse: 'Review with participant at enrollment. Both parties sign. Provide copy to participant.',
      keyTopics: ['Program Rules', 'Attendance Policy', 'Confidentiality', 'Participant Rights']
    },
    'financial support request': {
      description: 'Application for emergency financial assistance',
      purpose: 'Documents client requests for financial support including rent, utilities, or transportation.',
      howToUse: 'Complete with client. Gather required documentation. Submit to supervisor for approval.',
      keyTopics: ['Assistance Type', 'Amount Requested', 'Documentation', 'Approval Status']
    },
    'contact log': {
      description: 'Record of all client contacts and communications',
      purpose: 'Chronological log of all client interactions including calls, texts, emails, and in-person contacts.',
      howToUse: 'Log every client contact immediately. Include date, method, duration, and summary.',
      keyTopics: ['Contact Date', 'Contact Method', 'Summary', 'Follow-up Actions']
    }
  };

  const getFileDetails = (name: string): FileDetails => {
    const cleanName = cleanFileName(name).toLowerCase();
    
    for (const [key, details] of Object.entries(fileDetailsMap)) {
      if (cleanName.includes(key) || key.includes(cleanName)) {
        return details;
      }
    }
    
    if (cleanName.includes('referral') && cleanName.includes('father')) return fileDetailsMap['father referral form'];
    if (cleanName.includes('referral')) return fileDetailsMap['new referrals tracker'];
    if (cleanName.includes('attendance') || cleanName.includes('checklist')) return fileDetailsMap['class attendance checklist'];
    if (cleanName.includes('call list')) return fileDetailsMap['client call list'];
    if (cleanName.includes('contact')) return fileDetailsMap['contact log'];
    if (cleanName.includes('timesheet') || cleanName.includes('employee')) return fileDetailsMap['employee timesheet'];
    if (cleanName.includes('financial') || cleanName.includes('support request')) return fileDetailsMap['financial support request'];
    if (cleanName.includes('donation') || cleanName.includes('kind')) return fileDetailsMap['in kind donation tracker'];
    if (cleanName.includes('intern') && cleanName.includes('activity')) return fileDetailsMap['intern activity log'];
    if (cleanName.includes('intern') && cleanName.includes('weekly')) return fileDetailsMap['intern weekly log'];
    if (cleanName.includes('intern') && cleanName.includes('packet')) return fileDetailsMap['intern support packet'];
    if (cleanName.includes('enrollment')) return fileDetailsMap['new enrollment tracker'];
    if (cleanName.includes('evaluation') && cleanName.includes('result')) return fileDetailsMap['evaluation results summary'];
    if (cleanName.includes('evaluation') || cleanName.includes('report')) return fileDetailsMap['program evaluation report'];
    if (cleanName.includes('agreement')) return fileDetailsMap['fatherhood class agreement'];
    if (cleanName.includes('procedure') && cleanName.includes('fatherhood')) return fileDetailsMap['fatherhood class procedure'];
    if (cleanName.includes('consent') || cleanName.includes('parental')) return fileDetailsMap['parental consent form'];
    if (cleanName.includes('sign') || cleanName.includes('office')) return fileDetailsMap['office sign in sheet'];
    if (cleanName.includes('employment')) return fileDetailsMap['employment support tracker'];
    
    return {
      description: 'FOAM organizational document',
      purpose: 'Supports FOAM program operations and documentation requirements.',
      howToUse: 'Follow standard procedures. Contact supervisor with questions.',
      keyTopics: ['Documentation', 'Program Support', 'Operations']
    };
  };

  const getFileDescription = (name: string) => getFileDetails(name).description;

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return 'Unknown';
    }
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

  const handleOpenDetails = (doc: any) => setSelectedDoc(doc);

  const handleOpenDriveFileDetails = (file: DriveFile) => {
    const displayName = cleanFileName(file.name);
    const details = getFileDetails(file.name);
    const IconComponent = getFileIcon(file.type);
    const color = getFileColor(file.type);

    setSelectedDoc({
      id: file.id,
      title: displayName,
      description: details.description,
      icon: IconComponent,
      color: color,
      url: getFileUrl(file),
      purpose: details.purpose,
      howToUse: details.howToUse,
      keyTopics: details.keyTopics,
      modifiedTime: file.modifiedTime
    });
  };

  const handleOpenLink = (url: string) => window.open(url, '_blank', 'noopener,noreferrer');

  const renderHomeView = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {portalCards.map((card) => {
          const IconComponent = card.icon;
          return (
            <button key={card.id} onClick={card.action}
              className="group relative bg-white rounded-3xl p-8 shadow-sm border border-slate-100 hover:shadow-xl hover:border-slate-200 transition-all duration-300 text-left overflow-hidden">
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
        <div className="absolute right-0 bottom-0 opacity-10"><ClipboardList size={200} /></div>
        <div className="relative z-10 space-y-4">
          <h3 className="text-lg font-bold text-slate-300 uppercase tracking-wider">Case Manager Hub</h3>
          <p className="text-2xl font-bold leading-relaxed max-w-2xl">Your central location for reports, resources, and procedures. Everything you need to serve fathers effectively.</p>
          <div className="flex flex-wrap gap-4 pt-4">
            <div className="px-4 py-2 bg-white/10 rounded-xl"><span className="text-sm font-medium">📊 3 Resource Trackers</span></div>
            <div className="px-4 py-2 bg-white/10 rounded-xl"><span className="text-sm font-medium">📄 7 Procedure Documents</span></div>
            <div className="px-4 py-2 bg-white/10 rounded-xl"><span className="text-sm font-medium">📁 40+ Forms & Templates</span></div>
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
          <input type="text" placeholder="Search resources..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none" />
          {searchQuery && <button type="button" onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><X size={18} /></button>}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredResources.map((resource) => {
          const IconComponent = resource.icon;
          return (
            <div key={resource.id} onClick={() => handleOpenLink(resource.url)}
              className="group bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-lg hover:border-slate-200 transition-all cursor-pointer">
              <div className="space-y-4">
                <div className={'w-12 h-12 ' + resource.color + ' text-white rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform'}>
                  <IconComponent size={24} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-slate-800 group-hover:text-teal-600 transition-colors">{resource.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{resource.description}</p>
                </div>
                <div className="flex items-center gap-2 text-teal-600 font-bold text-xs uppercase tracking-wider pt-2">
                  <FileSpreadsheet size={14} /><span>Open in Google Sheets</span><ExternalLink size={12} className="ml-auto" />
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
          <input type="text" placeholder="Search documents by name, description, or topic..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none" />
          {searchQuery && <button type="button" onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><X size={18} /></button>}
        </div>
        {searchQuery && <p className="text-sm text-slate-500 mt-2">Found {filteredProcedures.length + filteredDriveFiles.length} document{filteredProcedures.length + filteredDriveFiles.length !== 1 ? 's' : ''}</p>}
      </div>

      {filteredProcedures.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <ClipboardList size={20} className="text-slate-600" /> Procedures
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProcedures.map((doc) => {
              const IconComponent = doc.icon;
              const isHovered = hoveredProcedureId === doc.id;
              return (
                <div key={doc.id} className="relative group" onMouseEnter={() => setHoveredProcedureId(doc.id)} onMouseLeave={() => setHoveredProcedureId(null)}>
                  <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 hover:shadow-lg hover:border-teal-200 transition-all flex items-start gap-4">
                    <div className={'w-10 h-10 ' + doc.color + ' text-white rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform'}>
                      <IconComponent size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-slate-800 group-hover:text-teal-600 transition-colors">{doc.title}</h3>
                      <p className="text-slate-500 text-sm mt-1 line-clamp-2">{doc.description}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => handleOpenDetails(doc)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-teal-600 transition-colors z-10" title="View Details"><Info size={18} /></button>
                      <button type="button" onClick={() => handleOpenLink(doc.url)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-teal-600 transition-colors z-10" title="Open Document"><ExternalLink size={18} /></button>
                    </div>
                  </div>
                  {isHovered && (
                    <div className="absolute left-0 right-0 top-full mt-2 z-50">
                      <div className="bg-slate-900 text-white rounded-xl p-4 shadow-2xl mx-2">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <div className={'w-6 h-6 ' + doc.color + ' rounded flex items-center justify-center'}><IconComponent size={14} /></div>
                            <span className="text-xs font-medium text-slate-300">Procedure Document</span>
                          </div>
                          <div><p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Purpose</p><p className="text-sm text-white">{doc.purpose}</p></div>
                          <div><p className="text-xs text-slate-400 uppercase tracking-wider mb-1">How to Use</p><p className="text-xs text-slate-300">{doc.howToUse}</p></div>
                          <div><p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Key Topics</p>
                            <div className="flex flex-wrap gap-1">{doc.keyTopics.map((topic, i) => (<span key={i} className="text-xs px-2 py-0.5 bg-slate-700 rounded-full text-slate-300">{topic}</span>))}</div>
                          </div>
                          <div className="flex gap-2 pt-1">
                            <button type="button" onClick={(e) => { e.stopPropagation(); handleOpenDetails(doc); }} className="flex-1 text-xs py-2 px-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors flex items-center justify-center gap-1"><Info size={12} />Full Details</button>
                            <button type="button" onClick={(e) => { e.stopPropagation(); handleOpenLink(doc.url); }} className="flex-1 text-xs py-2 px-3 bg-teal-600 hover:bg-teal-500 rounded-lg transition-colors flex items-center justify-center gap-1"><ExternalLink size={12} />Open</button>
                          </div>
                        </div>
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-900 rotate-45"></div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <FileSpreadsheet size={20} className="text-emerald-600" /> Forms & Trackers
            <span className="text-sm font-normal text-slate-500">({filteredDriveFiles.length} files)</span>
          </h3>
          <button type="button" onClick={loadDriveFiles} disabled={isLoadingFiles} className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-teal-600 hover:bg-slate-100 rounded-lg transition-colors">
            <RefreshCw size={14} className={isLoadingFiles ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>

        {isLoadingFiles ? (
          <div className="text-center py-12"><RefreshCw size={32} className="animate-spin text-teal-600 mx-auto mb-4" /><p className="text-slate-500">Loading files from Google Drive...</p></div>
        ) : filteredDriveFiles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredDriveFiles.map((file) => {
              const IconComponent = getFileIcon(file.type);
              const color = getFileColor(file.type);
              const displayName = cleanFileName(file.name);
              const description = getFileDescription(file.name);
              const url = getFileUrl(file);
              const fileTypeName = getFileTypeName(file.type);
              const isHovered = hoveredFileId === file.id;
              const details = getFileDetails(file.name);

              return (
                <div key={file.id} className="group bg-white rounded-xl p-4 shadow-sm border border-slate-100 hover:shadow-lg hover:border-teal-200 transition-all relative"
                  onMouseEnter={() => setHoveredFileId(file.id)} onMouseLeave={() => setHoveredFileId(null)}>
                  <div className="flex items-start gap-3">
                    <div className={'w-10 h-10 ' + color + ' text-white rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform'}><IconComponent size={20} /></div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-slate-800 group-hover:text-teal-600 transition-colors truncate">{displayName}</h3>
                      <p className="text-slate-500 text-xs mt-1 line-clamp-1">{description}</p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button type="button" onClick={(e) => { e.stopPropagation(); handleOpenDriveFileDetails(file); }} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-teal-600 transition-colors" title="View Details"><Info size={16} /></button>
                      <button type="button" onClick={(e) => { e.stopPropagation(); handleOpenLink(url); }} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-teal-600 transition-colors" title="Open Document"><ExternalLink size={16} /></button>
                    </div>
                  </div>
                  {isHovered && (
                    <div className="absolute left-0 right-0 top-full mt-2 z-50">
                      <div className="bg-slate-900 text-white rounded-xl p-4 shadow-2xl mx-2">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <div className={'w-6 h-6 ' + color + ' rounded flex items-center justify-center'}><IconComponent size={14} /></div>
                            <span className="text-xs font-medium text-slate-300">{fileTypeName}</span>
                          </div>
                          <div><p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Purpose</p><p className="text-sm text-white">{details.purpose}</p></div>
                          <div><p className="text-xs text-slate-400 uppercase tracking-wider mb-1">How to Use</p><p className="text-xs text-slate-300">{details.howToUse}</p></div>
                          <div><p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Key Topics</p>
                            <div className="flex flex-wrap gap-1">{details.keyTopics.map((topic, i) => (<span key={i} className="text-xs px-2 py-0.5 bg-slate-700 rounded-full text-slate-300">{topic}</span>))}</div>
                          </div>
                          {file.modifiedTime && <div className="pt-2 border-t border-slate-700"><p className="text-xs text-slate-400">Last modified: {formatDate(file.modifiedTime)}</p></div>}
                          <div className="flex gap-2 pt-1">
                            <button type="button" onClick={(e) => { e.stopPropagation(); handleOpenDriveFileDetails(file); }} className="flex-1 text-xs py-2 px-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors flex items-center justify-center gap-1"><Info size={12} />Full Details</button>
                            <button type="button" onClick={(e) => { e.stopPropagation(); handleOpenLink(url); }} className="flex-1 text-xs py-2 px-3 bg-teal-600 hover:bg-teal-500 rounded-lg transition-colors flex items-center justify-center gap-1"><ExternalLink size={12} />Open</button>
                          </div>
                        </div>
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-900 rotate-45"></div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 bg-slate-50 rounded-xl">
            <FolderOpen size={32} className="text-slate-300 mx-auto mb-2" /><p className="text-slate-500">No files found</p>
            <button type="button" onClick={loadDriveFiles} className="mt-2 text-teal-600 text-sm font-medium hover:underline">Try loading again</button>
          </div>
        )}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0"><FileText size={16} className="text-amber-600" /></div>
        <div>
          <p className="text-amber-800 font-medium text-sm">These documents open in Google Drive. You can view, download, or print them as needed.</p>
          <p className="text-amber-700 text-sm mt-1">Tip: Hover over any card for quick info, or click the info icon for full details.</p>
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
              <div className={'w-12 h-12 ' + selectedDoc.color + ' text-white rounded-xl flex items-center justify-center'}><IconComponent size={24} /></div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">{selectedDoc.title}</h2>
                <p className="text-slate-500 text-sm">{selectedDoc.description}</p>
              </div>
            </div>
            <button type="button" onClick={() => setSelectedDoc(null)} className="p-2 hover:bg-slate-100 rounded-lg"><X size={24} className="text-slate-400" /></button>
          </div>
          <div className="p-6 space-y-6">
            <div><h3 className="text-sm font-bold text-teal-600 uppercase tracking-wide mb-2">Purpose</h3><p className="text-slate-700">{selectedDoc.purpose}</p></div>
            <div><h3 className="text-sm font-bold text-teal-600 uppercase tracking-wide mb-2">How to Use</h3><p className="text-slate-700">{selectedDoc.howToUse}</p></div>
            <div><h3 className="text-sm font-bold text-teal-600 uppercase tracking-wide mb-2">Key Topics</h3>
              <div className="flex flex-wrap gap-2">{selectedDoc.keyTopics && selectedDoc.keyTopics.map((topic: string, i: number) => (<span key={i} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm">{topic}</span>))}</div>
            </div>
            {selectedDoc.modifiedTime && <div className="pt-4 border-t"><p className="text-sm text-slate-500">Last modified: {formatDate(selectedDoc.modifiedTime)}</p></div>}
            <div className="pt-4 border-t">
              <button type="button" onClick={() => { handleOpenLink(selectedDoc.url); setSelectedDoc(null); }}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-colors">
                <ExternalLink size={18} /> Open Document
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
            <button type="button" onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors"><ArrowLeft size={24} /></button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-3"><ClipboardList size={28} /> Case Manager Portal</h1>
              <p className="text-slate-300 text-sm">Resources, documents, and reporting tools</p>
            </div>
          </div>
          {activeTab !== 'home' && (
            <div className="hidden md:flex items-center gap-2 text-sm">
              <span className="text-slate-400">Portal</span><ChevronRight size={14} className="text-slate-500" /><span className="text-white font-medium capitalize">{activeTab}</span>
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
