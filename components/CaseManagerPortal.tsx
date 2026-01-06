// ============================================
// FOAM CASE MANAGER PORTAL
// ============================================
// Features:
// - Self-registration for @foamla.org emails
// - Monthly Report submission form
// - Resources/Procedures reference
// - Forms & Documents access
// ============================================

import React, { useState, useEffect } from 'react';
import {
  User, Mail, Lock, LogOut, FileText, BookOpen, FolderOpen,
  Plus, Save, Calendar, Users, Phone, Baby, DollarSign,
  CheckCircle, AlertCircle, ChevronDown, ChevronUp, ChevronRight,
  Download, ExternalLink, Clipboard, Heart, Briefcase, Home,
  Clock, Target, Shield, Eye, EyeOff, X, Search, Filter
} from 'lucide-react';

// ============================================
// CONFIGURATION
// ============================================

// Google Drive folder for forms
const FORMS_FOLDER_ID = '1tZJBziMTI7_Bm-bx-WQXOY5YXniQjlMs';
const API_BASE_URL = 'https://foamla-backend-2.onrender.com';

// Procedures/Resources Data
const PROCEDURES = [
  {
    id: 'case-manager',
    title: 'Case Manager Procedures',
    icon: '👔',
    color: 'from-blue-500 to-blue-600',
    summary: 'Referrals, Intake, Plan of Care, and Case Management workflows',
    sections: [
      {
        title: 'Referrals / Fatherhood Classes / Community Events',
        items: [
          'Referrals and/or sign-in sheets are emailed to Case Managers',
          'Input email addresses into WIX from sign-in sheets',
          'Input class attendance into Empower DB',
          'Review assessments and follow up with fathers on perspective caseloads'
        ]
      },
      {
        title: 'Intake / Assessment',
        items: [
          'Review Empower DB to confirm if client is enrolled',
          'Conduct assessment, complete Plan of Care, obtain signatures',
          'Research appropriate referrals and follow up within 8-72 hours (or 3-5 business days for complex cases)',
          'Add appropriate clients to Unite Us'
        ]
      },
      {
        title: 'Plan of Care',
        items: [
          'Complete POC within 3-5 days of Assessment',
          'Include at least 3 goals with 3 measurable objectives',
          'Document all information in Empower DB'
        ]
      },
      {
        title: 'Case Management',
        items: [
          'Contact clients weekly/biweekly regarding POC compliance',
          'Encourage attendance at weekly Fatherhood Classes',
          'Check Empower DB client notes before following up',
          'Notify Supervisor if unable to contact after 3 attempts'
        ]
      }
    ]
  },
  {
    id: 'customer-service',
    title: 'Customer Service Protocol',
    icon: '🤝',
    color: 'from-emerald-500 to-emerald-600',
    summary: 'Standards for exceeding father expectations in all interactions',
    sections: [
      {
        title: 'Service Standards',
        items: [
          'Ensure client needs are addressed promptly with polite, professional communication',
          'Provide standardized intake and referral process',
          'Establish clear follow-up timelines based on case urgency',
          'Response timeframe: 8-72 hours for most cases, 3-5 business days for complex processes'
        ]
      },
      {
        title: 'We Will Never',
        items: [
          'Keep fathers waiting unnecessarily',
          'Fail to follow up on promised actions',
          'Disclose unnecessary internal procedural details to clients'
        ]
      }
    ]
  },
  {
    id: 'referral-intake',
    title: 'Referral & Intake Procedure',
    icon: '📋',
    color: 'from-indigo-500 to-indigo-600',
    summary: 'Step-by-step process for new client onboarding',
    sections: [
      {
        title: 'Step 1: Receive Referral',
        items: [
          'Receive referrals/sign-in sheets from Fatherhood Classes or community events',
          'Enter email addresses from sign-in sheets into WIX'
        ]
      },
      {
        title: 'Step 2: Review Enrollment Status',
        items: [
          'Access Empower DB to verify if client is already enrolled',
          'If enrolled, update the client\'s case file',
          'If not enrolled, proceed to conducting intake & assessment'
        ]
      },
      {
        title: 'Step 3: Conduct Intake & Assessment',
        items: [
          'Contact client to schedule intake assessment',
          'Complete comprehensive evaluation and discuss service needs',
          'Obtain signed confidentiality and consent forms',
          'Document in Empower DB and upload all relevant files'
        ]
      },
      {
        title: 'Step 4: Plan of Care Development',
        items: [
          'Create POC within 3-5 business days',
          'Include at least 3 goals and 2 measurable objectives each',
          'Confirm client agreement and obtain signatures'
        ]
      }
    ]
  },
  {
    id: 'fatherhood-class',
    title: 'Fatherhood Class Procedure',
    icon: '👨‍👧‍👦',
    color: 'from-amber-500 to-amber-600',
    summary: 'Client communication, attendance tracking, and documentation',
    sections: [
      {
        title: 'Client Communication (Monday & Tuesday)',
        items: [
          'Contact all new and existing clients via phone',
          'Confirm attendance and answer questions about upcoming class',
          'Complete new client class agreement and pre-assessment during class'
        ]
      },
      {
        title: 'Sign-In Sheets & Assessments',
        items: [
          'Collect sign-in sheets and assessments the day after each class',
          'Check for both Google and physical sign-in sheets',
          'Gather all pre-assessments/class agreements'
        ]
      },
      {
        title: 'Documentation',
        items: [
          'Upload collected documents to SharePoint immediately',
          'Add all clients to Empower DB for attendance tracking',
          'Complete Fatherhood Class Intake for new clients'
        ]
      }
    ]
  },
  {
    id: 'financial-support',
    title: 'Financial Support Services',
    icon: '💰',
    color: 'from-green-500 to-green-600',
    summary: 'Guidelines for providing financial assistance to fathers',
    sections: [
      {
        title: 'Eligibility',
        items: [
          'Client must be enrolled in Project Family Build',
          'Must complete an in-person intake process',
          'For work-related items, verify employment status',
          'Review client\'s financial assistance history in Empower DB'
        ]
      },
      {
        title: 'Request Process',
        items: [
          'Exhaust all other resources before completing Financial Request',
          'Complete Financial Request in EmpowerDB and form',
          'Email form to Case Management Supervisor and Account Manager',
          'Supervisor reviews and informs Department Supervisor for approval'
        ]
      },
      {
        title: 'After Decision',
        items: [
          'If Not Approved: Notify client, provide other resources, refer to financial literacy classes',
          'If Approved: Notify client, process payment with Account Manager',
          'Ensure receipt is received and emailed to Supervisor within 1 day'
        ]
      }
    ]
  },
  {
    id: 'diaper-distribution',
    title: 'Diaper Distribution',
    icon: '👶',
    color: 'from-pink-500 to-pink-600',
    summary: 'Protocol for diaper distribution and reporting',
    sections: [
      {
        title: 'Eligibility & Distribution',
        items: [
          'Client must be enrolled in Project Family Build',
          'Provide 1 pack of 25 diapers per child per visit',
          'Verify enrollment before distribution'
        ]
      },
      {
        title: 'Documentation',
        items: [
          'Document in EmpowerDB: Walmart or JLBR source, amount, and size',
          'If no EmpowerDB access, record: Name, phone, ethnicity, zip code, size, source, signature'
        ]
      },
      {
        title: 'JLBR Monthly Reporting',
        items: [
          'Submit via statistics forms',
          'Include: Number of diapers, zip codes, ethnicity, sizes',
          'JLBR will reach out for potential orders'
        ]
      }
    ]
  },
  {
    id: 'workforce',
    title: 'Workforce Development',
    icon: '💼',
    color: 'from-purple-500 to-purple-600',
    summary: 'Employment readiness, job training, and placement support',
    sections: [
      {
        title: 'Client Contact & Engagement',
        items: [
          'Conduct weekly check-ins with all clients on workforce assistance list',
          'Assess employment status, job search progress, and professional development needs',
          'Offer guidance on workforce development services and job placements',
          'Document all interactions in EmpowerDB'
        ]
      },
      {
        title: 'Employment Readiness & Support',
        items: [
          'Provide resume-building assistance and interview preparation',
          'Identify skills gaps and recommend training',
          'Connect clients with job opportunities based on skills and interests',
          'Assist with online applications, interview scheduling, employer follow-ups'
        ]
      },
      {
        title: 'Resource Coordination',
        items: [
          'Maintain updated list of job opportunities and training programs',
          'Collaborate with local businesses and workforce agencies',
          'Address barriers to employment: transportation, childcare, financial assistance'
        ]
      }
    ]
  },
  {
    id: 'core-values',
    title: 'Our Class Values',
    icon: '⭐',
    color: 'from-yellow-500 to-yellow-600',
    summary: '10 principles guiding our Fatherhood Classes',
    sections: [
      {
        title: 'Class Values',
        items: [
          '1. Every Father has a voice',
          '2. Your perspective is equally important and desired to be heard',
          '3. Stay mentally and physically present',
          '4. Attack the problem, not the person',
          '5. Respect others\' time; be on time',
          '6. Be a team player',
          '7. Don\'t be easily offended, don\'t be quick to offend',
          '8. Be open-minded',
          '9. Give others the benefit of the doubt; assume good intentions',
          '10. We can\'t do this alone, reach out when necessary'
        ]
      }
    ]
  }
];

// Class topics for schedule
const CLASS_TOPICS = [
  "A Father's Influence on His Child",
  "Relationships",
  "Conflict Resolution / Anger Management",
  "Becoming Self-Sufficient",
  "Building Your Child's Self-Esteem",
  "Co-parenting / Single Fatherhood",
  "Male / Female Relationships",
  "Manhood",
  "Values",
  "Communication / Active Listening",
  "Dealing with Stress as a Father",
  "Coping with Fatherhood Discrimination",
  "Responsible Fatherhood"
];

// Types
interface User {
  email: string;
  name: string;
  registeredAt: string;
}

interface MonthlyReport {
  id: string;
  caseManagerName: string;
  reportMonth: string;
  reportYear: number;
  newIntakes: number;
  activeCaseload: number;
  plansOfCareCreated: number;
  clientContacts: number;
  fatherhoodClassAttendance: number;
  referralsMade: number;
  financialRequestsSubmitted: number;
  diapersDistributed: number;
  diaperSizes: string;
  uniteUsReferrals: number;
  followUps24to72hrs: number;
  followUps3to5days: number;
  notes: string;
  submittedAt: string;
}

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  modifiedTime: string;
}

// ============================================
// MAIN COMPONENT
// ============================================

const CaseManagerPortal: React.FC = () => {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState<'reports' | 'resources' | 'forms'>('reports');

  // Reports state
  const [reports, setReports] = useState<MonthlyReport[]>([]);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportForm, setReportForm] = useState<Partial<MonthlyReport>>({
    reportMonth: new Date().toLocaleString('default', { month: 'long' }),
    reportYear: new Date().getFullYear(),
    newIntakes: 0,
    activeCaseload: 0,
    plansOfCareCreated: 0,
    clientContacts: 0,
    fatherhoodClassAttendance: 0,
    referralsMade: 0,
    financialRequestsSubmitted: 0,
    diapersDistributed: 0,
    diaperSizes: '',
    uniteUsReferrals: 0,
    followUps24to72hrs: 0,
    followUps3to5days: 0,
    notes: ''
  });

  // Resources state
  const [expandedProcedure, setExpandedProcedure] = useState<string | null>(null);
  const [searchProcedures, setSearchProcedures] = useState('');

  // Forms state
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const [filesError, setFilesError] = useState('');

  // Check for existing session
  useEffect(() => {
    const savedUser = localStorage.getItem('foam_case_manager_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        setIsAuthenticated(true);
      } catch (e) {
        localStorage.removeItem('foam_case_manager_user');
      }
    }
  }, []);

  // Load reports when authenticated
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      loadReports();
    }
  }, [isAuthenticated, currentUser]);

  // Load files when forms tab is active
  useEffect(() => {
    if (activeTab === 'forms' && isAuthenticated) {
      loadFiles();
    }
  }, [activeTab, isAuthenticated]);

  // ============================================
  // AUTH HANDLERS
  // ============================================

  const handleAuth = async () => {
    setAuthError('');
    setAuthLoading(true);

    try {
      const emailLower = email.trim().toLowerCase();
      
      // Validate email domain
      if (!emailLower.endsWith('@foamla.org')) {
        setAuthError('Please use your @foamla.org email address');
        setAuthLoading(false);
        return;
      }

      if (authMode === 'signup') {
        if (!name.trim()) {
          setAuthError('Please enter your name');
          setAuthLoading(false);
          return;
        }
        if (password.length < 6) {
          setAuthError('Password must be at least 6 characters');
          setAuthLoading(false);
          return;
        }
      }

      // For demo, we'll use localStorage-based auth
      // In production, this would call a backend API
      const users = JSON.parse(localStorage.getItem('foam_case_manager_users') || '{}');

      if (authMode === 'signup') {
        if (users[emailLower]) {
          setAuthError('An account with this email already exists. Please login.');
          setAuthLoading(false);
          return;
        }

        // Create new user
        const newUser: User = {
          email: emailLower,
          name: name.trim(),
          registeredAt: new Date().toISOString()
        };
        users[emailLower] = { ...newUser, password };
        localStorage.setItem('foam_case_manager_users', JSON.stringify(users));
        localStorage.setItem('foam_case_manager_user', JSON.stringify(newUser));
        setCurrentUser(newUser);
        setIsAuthenticated(true);
      } else {
        // Login
        const user = users[emailLower];
        if (!user || user.password !== password) {
          setAuthError('Invalid email or password');
          setAuthLoading(false);
          return;
        }

        const { password: _, ...userData } = user;
        localStorage.setItem('foam_case_manager_user', JSON.stringify(userData));
        setCurrentUser(userData);
        setIsAuthenticated(true);
      }
    } catch (err) {
      setAuthError('An error occurred. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('foam_case_manager_user');
    setCurrentUser(null);
    setIsAuthenticated(false);
    setEmail('');
    setPassword('');
    setName('');
  };

  // ============================================
  // REPORTS HANDLERS
  // ============================================

  const loadReports = () => {
    const savedReports = localStorage.getItem(`foam_reports_${currentUser?.email}`);
    if (savedReports) {
      setReports(JSON.parse(savedReports));
    }
  };

  const handleSubmitReport = () => {
    if (!currentUser) return;

    const newReport: MonthlyReport = {
      id: Date.now().toString(),
      caseManagerName: currentUser.name,
      ...reportForm as Omit<MonthlyReport, 'id' | 'caseManagerName' | 'submittedAt'>,
      submittedAt: new Date().toISOString()
    };

    const updatedReports = [newReport, ...reports];
    setReports(updatedReports);
    localStorage.setItem(`foam_reports_${currentUser.email}`, JSON.stringify(updatedReports));
    
    // Reset form
    setReportForm({
      reportMonth: new Date().toLocaleString('default', { month: 'long' }),
      reportYear: new Date().getFullYear(),
      newIntakes: 0,
      activeCaseload: 0,
      plansOfCareCreated: 0,
      clientContacts: 0,
      fatherhoodClassAttendance: 0,
      referralsMade: 0,
      financialRequestsSubmitted: 0,
      diapersDistributed: 0,
      diaperSizes: '',
      uniteUsReferrals: 0,
      followUps24to72hrs: 0,
      followUps3to5days: 0,
      notes: ''
    });
    setShowReportForm(false);
  };

  // ============================================
  // FILES HANDLERS
  // ============================================

  const loadFiles = async () => {
    setFilesLoading(true);
    setFilesError('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/drive/files?folderId=${FORMS_FOLDER_ID}`);
      if (!response.ok) throw new Error('Failed to load files');
      const data = await response.json();
      setFiles(data.files || []);
    } catch (err) {
      setFilesError('Unable to load files. Please try again.');
      // Load demo files
      setFiles([
        { id: '1', name: 'Fatherhood Class Agreement', mimeType: 'application/vnd.google-apps.document', webViewLink: '#', modifiedTime: new Date().toISOString() },
        { id: '2', name: 'Financial Request Form', mimeType: 'application/pdf', webViewLink: '#', modifiedTime: new Date().toISOString() },
        { id: '3', name: 'FOAM Class Checklist', mimeType: 'application/vnd.google-apps.document', webViewLink: '#', modifiedTime: new Date().toISOString() },
        { id: '4', name: 'Case Manager Procedures', mimeType: 'application/vnd.google-apps.document', webViewLink: '#', modifiedTime: new Date().toISOString() },
      ]);
    } finally {
      setFilesLoading(false);
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('document') || mimeType.includes('word')) return <FileText className="w-8 h-8 text-blue-500" />;
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return <FileText className="w-8 h-8 text-emerald-500" />;
    if (mimeType.includes('pdf')) return <FileText className="w-8 h-8 text-red-500" />;
    if (mimeType.includes('image')) return <FileText className="w-8 h-8 text-purple-500" />;
    return <FileText className="w-8 h-8 text-slate-500" />;
  };

  // ============================================
  // RENDER: LOGIN/SIGNUP
  // ============================================

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden max-w-md w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-8 py-10 text-center">
            <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">CASE MANAGER PORTAL</h1>
            <p className="text-teal-100 text-sm mt-1">Fathers On A Mission</p>
          </div>

          {/* Form */}
          <div className="p-8">
            {/* Toggle */}
            <div className="flex bg-slate-100 rounded-xl p-1 mb-6">
              <button
                onClick={() => { setAuthMode('login'); setAuthError(''); }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                  authMode === 'login' 
                    ? 'bg-white text-slate-800 shadow' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setAuthMode('signup'); setAuthError(''); }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                  authMode === 'signup' 
                    ? 'bg-white text-slate-800 shadow' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Register
              </button>
            </div>

            {/* Error */}
            {authError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {authError}
              </div>
            )}

            {/* Fields */}
            <div className="space-y-4">
              {authMode === 'signup' && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@foamla.org"
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={handleAuth}
              disabled={authLoading}
              className="w-full mt-6 py-4 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white rounded-xl font-bold text-sm uppercase tracking-wider shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            >
              {authLoading ? 'Please wait...' : (authMode === 'login' ? 'Sign In' : 'Create Account')}
            </button>

            <p className="text-center text-slate-400 text-xs mt-6">
              Only @foamla.org emails can access this portal
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER: MAIN DASHBOARD
  // ============================================

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-teal-600 to-teal-700 text-white px-6 py-4 sticky top-0 z-50 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-black text-lg tracking-tight">CASE MANAGER PORTAL</h1>
              <p className="text-teal-100 text-xs">Welcome back, {currentUser?.name}</p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 mt-4">
          {[
            { id: 'reports', label: 'Monthly Reports', icon: FileText },
            { id: 'resources', label: 'Resources', icon: BookOpen },
            { id: 'forms', label: 'Forms & Docs', icon: FolderOpen },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-teal-700 shadow-lg'
                  : 'text-teal-100 hover:bg-white/10'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <main className="p-6 max-w-7xl mx-auto">
        {/* ============================================ */}
        {/* MONTHLY REPORTS TAB */}
        {/* ============================================ */}
        {activeTab === 'reports' && (
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-black text-slate-800">Monthly Reports</h2>
                <p className="text-slate-500 text-sm mt-1">Submit and track your monthly metrics</p>
              </div>
              <button
                onClick={() => setShowReportForm(true)}
                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transition-all"
              >
                <Plus className="w-4 h-4" />
                New Report
              </button>
            </div>

            {/* Report Form Modal */}
            {showReportForm && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
                  <div className="p-6 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
                    <div>
                      <h3 className="text-xl font-black text-slate-800">Submit Monthly Report</h3>
                      <p className="text-slate-500 text-sm mt-1">Enter your metrics for the month</p>
                    </div>
                    <button onClick={() => setShowReportForm(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                      <X className="w-5 h-5 text-slate-400" />
                    </button>
                  </div>

                  <div className="p-6 space-y-6">
                    {/* Period Selection */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Month</label>
                        <select
                          value={reportForm.reportMonth}
                          onChange={(e) => setReportForm({ ...reportForm, reportMonth: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                        >
                          {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(month => (
                            <option key={month} value={month}>{month}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Year</label>
                        <select
                          value={reportForm.reportYear}
                          onChange={(e) => setReportForm({ ...reportForm, reportYear: parseInt(e.target.value) })}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                        >
                          {[2024, 2025, 2026].map(year => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Client Metrics */}
                    <div>
                      <h4 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                        <Users className="w-4 h-4 text-teal-600" />
                        Client Metrics
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {[
                          { key: 'newIntakes', label: 'New Intakes' },
                          { key: 'activeCaseload', label: 'Active Caseload' },
                          { key: 'plansOfCareCreated', label: 'POCs Created' },
                          { key: 'clientContacts', label: 'Client Contacts' },
                          { key: 'fatherhoodClassAttendance', label: 'Class Attendance Logged' },
                        ].map(field => (
                          <div key={field.key}>
                            <label className="block text-xs font-bold text-slate-500 mb-1">{field.label}</label>
                            <input
                              type="number"
                              min="0"
                              value={(reportForm as any)[field.key] || 0}
                              onChange={(e) => setReportForm({ ...reportForm, [field.key]: parseInt(e.target.value) || 0 })}
                              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Services */}
                    <div>
                      <h4 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                        <Heart className="w-4 h-4 text-teal-600" />
                        Services Provided
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {[
                          { key: 'referralsMade', label: 'Referrals Made' },
                          { key: 'financialRequestsSubmitted', label: 'Financial Requests' },
                          { key: 'uniteUsReferrals', label: 'Unite Us Referrals' },
                        ].map(field => (
                          <div key={field.key}>
                            <label className="block text-xs font-bold text-slate-500 mb-1">{field.label}</label>
                            <input
                              type="number"
                              min="0"
                              value={(reportForm as any)[field.key] || 0}
                              onChange={(e) => setReportForm({ ...reportForm, [field.key]: parseInt(e.target.value) || 0 })}
                              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Diapers */}
                    <div>
                      <h4 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                        <Baby className="w-4 h-4 text-teal-600" />
                        Diaper Distribution
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1">Total Diapers Distributed</label>
                          <input
                            type="number"
                            min="0"
                            value={reportForm.diapersDistributed || 0}
                            onChange={(e) => setReportForm({ ...reportForm, diapersDistributed: parseInt(e.target.value) || 0 })}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1">Sizes (e.g., NB, 1, 2, 3)</label>
                          <input
                            type="text"
                            value={reportForm.diaperSizes || ''}
                            onChange={(e) => setReportForm({ ...reportForm, diaperSizes: e.target.value })}
                            placeholder="NB, 1, 2, 3, 4"
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Follow-ups */}
                    <div>
                      <h4 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-teal-600" />
                        Follow-up Compliance
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1">24-72 Hour Follow-ups</label>
                          <input
                            type="number"
                            min="0"
                            value={reportForm.followUps24to72hrs || 0}
                            onChange={(e) => setReportForm({ ...reportForm, followUps24to72hrs: parseInt(e.target.value) || 0 })}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1">3-5 Day Follow-ups</label>
                          <input
                            type="number"
                            min="0"
                            value={reportForm.followUps3to5days || 0}
                            onChange={(e) => setReportForm({ ...reportForm, followUps3to5days: parseInt(e.target.value) || 0 })}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Notes / Challenges</label>
                      <textarea
                        value={reportForm.notes || ''}
                        onChange={(e) => setReportForm({ ...reportForm, notes: e.target.value })}
                        rows={3}
                        placeholder="Any additional notes, challenges, or successes this month..."
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                      />
                    </div>
                  </div>

                  <div className="p-6 border-t border-slate-200 flex gap-3 justify-end sticky bottom-0 bg-white">
                    <button
                      onClick={() => setShowReportForm(false)}
                      className="px-6 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-slate-600"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmitReport}
                      className="px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white rounded-xl font-bold flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Submit Report
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Reports List */}
            {reports.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-800 mb-2">No Reports Yet</h3>
                <p className="text-slate-500 mb-6">Submit your first monthly report to get started</p>
                <button
                  onClick={() => setShowReportForm(true)}
                  className="px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl font-bold"
                >
                  Create First Report
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {reports.map(report => (
                  <div key={report.id} className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-slate-800">{report.reportMonth} {report.reportYear}</h3>
                        <p className="text-slate-500 text-sm">Submitted {new Date(report.submittedAt).toLocaleDateString()}</p>
                      </div>
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
                        Submitted
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-slate-50 rounded-xl p-3">
                        <p className="text-xs text-slate-500 font-medium">Intakes</p>
                        <p className="text-2xl font-black text-slate-800">{report.newIntakes}</p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-3">
                        <p className="text-xs text-slate-500 font-medium">Caseload</p>
                        <p className="text-2xl font-black text-slate-800">{report.activeCaseload}</p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-3">
                        <p className="text-xs text-slate-500 font-medium">Referrals</p>
                        <p className="text-2xl font-black text-slate-800">{report.referralsMade}</p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-3">
                        <p className="text-xs text-slate-500 font-medium">Diapers</p>
                        <p className="text-2xl font-black text-slate-800">{report.diapersDistributed}</p>
                      </div>
                    </div>

                    {report.notes && (
                      <div className="mt-4 p-3 bg-amber-50 rounded-xl">
                        <p className="text-sm text-amber-800"><span className="font-bold">Notes:</span> {report.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============================================ */}
        {/* RESOURCES TAB */}
        {/* ============================================ */}
        {activeTab === 'resources' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-black text-slate-800">Procedures & Resources</h2>
              <p className="text-slate-500 text-sm mt-1">Quick reference for all case management procedures</p>
            </div>

            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchProcedures}
                onChange={(e) => setSearchProcedures(e.target.value)}
                placeholder="Search procedures..."
                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Procedure Cards */}
            <div className="space-y-4">
              {PROCEDURES
                .filter(proc => 
                  proc.title.toLowerCase().includes(searchProcedures.toLowerCase()) ||
                  proc.summary.toLowerCase().includes(searchProcedures.toLowerCase())
                )
                .map(procedure => (
                <div key={procedure.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                  <button
                    onClick={() => setExpandedProcedure(expandedProcedure === procedure.id ? null : procedure.id)}
                    className="w-full p-6 text-left flex items-center gap-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className={`w-14 h-14 bg-gradient-to-br ${procedure.color} rounded-xl flex items-center justify-center text-2xl shadow-lg`}>
                      {procedure.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-800">{procedure.title}</h3>
                      <p className="text-slate-500 text-sm mt-0.5">{procedure.summary}</p>
                    </div>
                    {expandedProcedure === procedure.id 
                      ? <ChevronUp className="w-5 h-5 text-slate-400" />
                      : <ChevronDown className="w-5 h-5 text-slate-400" />
                    }
                  </button>

                  {expandedProcedure === procedure.id && (
                    <div className="px-6 pb-6 border-t border-slate-100">
                      <div className="space-y-6 mt-6">
                        {procedure.sections.map((section, idx) => (
                          <div key={idx}>
                            <h4 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                              <ChevronRight className="w-4 h-4 text-teal-600" />
                              {section.title}
                            </h4>
                            <ul className="space-y-2 ml-6">
                              {section.items.map((item, itemIdx) => (
                                <li key={itemIdx} className="flex items-start gap-2 text-slate-600 text-sm">
                                  <CheckCircle className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================ */}
        {/* FORMS & DOCUMENTS TAB */}
        {/* ============================================ */}
        {activeTab === 'forms' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-black text-slate-800">Forms & Documents</h2>
                <p className="text-slate-500 text-sm mt-1">Access and download required forms</p>
              </div>
              <a
                href={`https://drive.google.com/drive/folders/${FORMS_FOLDER_ID}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 font-medium hover:bg-slate-50 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Open in Drive
              </a>
            </div>

            {filesLoading ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-slate-500">Loading documents...</p>
              </div>
            ) : filesError ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                <p className="text-slate-500 mb-4">{filesError}</p>
                <button
                  onClick={loadFiles}
                  className="px-4 py-2 bg-teal-600 text-white rounded-xl font-medium"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {files.map(file => (
                  <a
                    key={file.id}
                    href={file.webViewLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-lg hover:border-teal-300 transition-all group"
                  >
                    <div className="flex items-start gap-4">
                      {getFileIcon(file.mimeType)}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-800 truncate group-hover:text-teal-600 transition-colors">
                          {file.name}
                        </h3>
                        <p className="text-slate-400 text-xs mt-1">
                          Modified {new Date(file.modifiedTime).toLocaleDateString()}
                        </p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-teal-500 transition-colors" />
                    </div>
                  </a>
                ))}
              </div>
            )}

            {/* Quick Links */}
            <div className="mt-8">
              <h3 className="font-bold text-slate-700 mb-4">Quick Links</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Empower DB', icon: Database, url: 'https://empowerdb.com', color: 'bg-blue-500' },
                  { label: 'Unite Us', icon: Users, url: 'https://uniteus.com', color: 'bg-purple-500' },
                  { label: 'SharePoint', icon: FolderOpen, url: 'https://sharepoint.com', color: 'bg-teal-500' },
                  { label: 'WIX', icon: Clipboard, url: 'https://wix.com', color: 'bg-amber-500' },
                ].map(link => (
                  <a
                    key={link.label}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white rounded-xl p-4 border border-slate-200 hover:shadow-md transition-all flex items-center gap-3"
                  >
                    <div className={`w-10 h-10 ${link.color} rounded-lg flex items-center justify-center`}>
                      <link.icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-slate-700">{link.label}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CaseManagerPortal;
