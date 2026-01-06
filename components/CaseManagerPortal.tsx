// ============================================
// FOAM CASE MANAGER PORTAL - LIVE DATA VERSION
// ============================================
// Connected to Google Sheets via backend API
// ============================================

import React, { useState, useEffect } from 'react';
import {
  User, Mail, Lock, LogOut, FileText, BookOpen, FolderOpen,
  Plus, Save, Calendar, Users, Phone, Baby, DollarSign,
  CheckCircle, AlertCircle, ChevronDown, ChevronUp, ChevronRight,
  Download, ExternalLink, Clipboard, Heart, Briefcase, Home,
  Clock, Target, Shield, Eye, EyeOff, X, Search, Filter,
  RefreshCw, MapPin, Globe, UserCheck, Package, ArrowLeft,
  BarChart3, TrendingUp, TrendingDown, PieChart, Activity,
  UserPlus, Building, GraduationCap, Wrench
} from 'lucide-react';

const API_BASE_URL = 'https://foamla-backend-2.onrender.com';
const FORMS_FOLDER_ID = '1tZJBziMTI7_Bm-bx-WQXOY5YXniQjlMs';

// Types
interface User {
  email: string;
  name: string;
  registeredAt: string;
}

interface Resource {
  category: string;
  organization: string;
  address: string;
  phone: string;
  website: string;
  contact: string;
  description: string;
  referralProcess: string;
}

interface EmploymentClient {
  name: string;
  phone: string;
  email: string;
  status: string;
  caseManager: string;
  intakeDate: string;
  lastContact: string;
  nextFollowup: string;
  resumeStatus: string;
  employmentGoal: string;
  minPay: string;
  notes: string;
}

interface DiaperEntry {
  date: string;
  clientName: string;
  phone: string;
  zipCode: string;
  ethnicity: string;
  numChildren: number;
  sizes: string;
  quantity: number;
  source: string;
  caseManager: string;
  signature: string;
}

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  modifiedTime: string;
}

// Report Categories
const REPORT_CATEGORIES = [
  "Project Family Build Enrollments",
  "Fatherhood Class Enrollments",
  "Education Development Assistance Applications",
  "Workforce Development Assistance Applications",
  "Mental Health Counseling Referrals",
  "Fathers Reporting Improved Child Relationship",
  "Fathers Feeling They Are Becoming Better Fathers",
  "Father/Child Bonding Event Attendance",
  "Participants with Education/Job/Family Outcomes",
  "Fathers Understanding Positive Parenting",
  "Workforce Development Activity Enrollments",
  "Job Placements",
  "Job Referrals Received",
  "Skills Certifications Achieved",
  "Income Increases (Started Working)",
  "Employment Retention",
  "Job Applications Submitted",
  "Job Interviews Attended",
  "Partner Program Referrals",
  "Financial Literacy Improvements",
  "Direct Resources Provided (Diapers, Clothes, Food)",
  "Self-Care/Conflict Resolution Improvements (%)",
  "Co-Parent Relationship Improvements (%)"
];

const MONTHS = ["January", "February", "March", "April", "May", "June", 
                "July", "August", "September", "October", "November", "December"];

const MONTH_ABBR = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// ============================================
// DASHBOARD TAB COMPONENT
// ============================================

interface DashboardTabProps {
  monthlySummary: any[];
  onRefresh: () => void;
}

const DashboardTab: React.FC<DashboardTabProps> = ({ monthlySummary, onRefresh }) => {
  const [viewMode, setViewMode] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [selectedQuarter, setSelectedQuarter] = useState<1 | 2 | 3 | 4>(1);
  
  // Calculate totals
  const calculateTotals = () => {
    if (!monthlySummary || monthlySummary.length === 0) return { total: 0, byProgram: {}, byMonth: [] };
    
    let total = 0;
    const byMonth: number[] = Array(12).fill(0);
    
    // Sum up all YTD totals for total fathers
    const projectFamilyBuild = monthlySummary.find(s => s.category?.includes('Project Family Build'));
    const fatherhoodClass = monthlySummary.find(s => s.category?.includes('Fatherhood Class'));
    const workforceDev = monthlySummary.find(s => s.category?.includes('Workforce Development') && !s.category?.includes('Activity'));
    
    // Calculate monthly intake from Project Family Build
    if (projectFamilyBuild) {
      byMonth[0] = projectFamilyBuild.jan2026 || 0;
      byMonth[1] = projectFamilyBuild.feb2026 || 0;
      byMonth[2] = projectFamilyBuild.mar2026 || 0;
      byMonth[3] = projectFamilyBuild.apr2026 || 0;
      byMonth[4] = projectFamilyBuild.may2026 || 0;
      byMonth[5] = projectFamilyBuild.jun2026 || 0;
      byMonth[6] = projectFamilyBuild.jul2026 || 0;
      byMonth[7] = projectFamilyBuild.aug2026 || 0;
      byMonth[8] = projectFamilyBuild.sep2026 || 0;
      byMonth[9] = projectFamilyBuild.oct2026 || 0;
      byMonth[10] = projectFamilyBuild.nov2026 || 0;
      byMonth[11] = projectFamilyBuild.dec2026 || 0;
      total = projectFamilyBuild.ytdTotal || 0;
    }
    
    return {
      total,
      byProgram: {
        projectFamilyBuild: projectFamilyBuild?.ytdTotal || 0,
        fatherhoodClass: fatherhoodClass?.ytdTotal || 0,
        workforceDev: workforceDev?.ytdTotal || 0,
      },
      byMonth
    };
  };
  
  const totals = calculateTotals();
  
  // Calculate quarter totals
  const getQuarterTotal = (quarter: number) => {
    const startMonth = (quarter - 1) * 3;
    return totals.byMonth.slice(startMonth, startMonth + 3).reduce((a, b) => a + b, 0);
  };
  
  // Calculate growth/trend
  const calculateGrowth = () => {
    const currentMonth = new Date().getMonth();
    const prevMonth = currentMonth > 0 ? currentMonth - 1 : 0;
    const current = totals.byMonth[currentMonth] || 0;
    const previous = totals.byMonth[prevMonth] || 0;
    if (previous === 0) return { percent: 0, direction: 'neutral' };
    const percent = ((current - previous) / previous) * 100;
    return { 
      percent: Math.abs(percent).toFixed(1), 
      direction: percent > 0 ? 'up' : percent < 0 ? 'down' : 'neutral' 
    };
  };
  
  const growth = calculateGrowth();
  
  // Get max value for chart scaling
  const maxMonthly = Math.max(...totals.byMonth, 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Analytics Dashboard</h2>
          <p className="text-slate-500 text-sm mt-1">Track program performance and father engagement</p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="bg-slate-100 p-1 rounded-xl flex">
            {(['monthly', 'quarterly', 'yearly'] as const).map(mode => (
              <button key={mode} onClick={() => setViewMode(mode)}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${
                  viewMode === mode ? 'bg-white text-teal-700 shadow' : 'text-slate-500 hover:text-slate-700'}`}>
                {mode}
              </button>
            ))}
          </div>
          <button onClick={onRefresh} className="p-2 hover:bg-slate-100 rounded-lg">
            <RefreshCw className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Active Fathers */}
        <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <Users className="w-8 h-8 text-teal-200" />
            <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
              growth.direction === 'up' ? 'bg-emerald-400/30 text-emerald-100' : 
              growth.direction === 'down' ? 'bg-red-400/30 text-red-100' : 'bg-white/20'}`}>
              {growth.direction === 'up' ? <TrendingUp className="w-3 h-3" /> : 
               growth.direction === 'down' ? <TrendingDown className="w-3 h-3" /> : null}
              {growth.percent}%
            </span>
          </div>
          <p className="text-3xl font-black mt-3">{totals.total}</p>
          <p className="text-teal-100 text-sm">Total Fathers YTD</p>
        </div>

        {/* Project Family Build */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white shadow-lg">
          <Building className="w-8 h-8 text-blue-200" />
          <p className="text-3xl font-black mt-3">{totals.byProgram.projectFamilyBuild}</p>
          <p className="text-blue-100 text-sm">Project Family Build</p>
        </div>

        {/* Responsible Fatherhood */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-5 text-white shadow-lg">
          <GraduationCap className="w-8 h-8 text-purple-200" />
          <p className="text-3xl font-black mt-3">{totals.byProgram.fatherhoodClass}</p>
          <p className="text-purple-100 text-sm">Fatherhood Class</p>
        </div>

        {/* Workforce Development */}
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-5 text-white shadow-lg">
          <Wrench className="w-8 h-8 text-amber-200" />
          <p className="text-3xl font-black mt-3">{totals.byProgram.workforceDev}</p>
          <p className="text-amber-100 text-sm">Workforce Development</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Intake Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-slate-800">Intake Volume</h3>
              <p className="text-slate-500 text-sm">Father enrollments per month</p>
            </div>
            <Activity className="w-5 h-5 text-slate-400" />
          </div>
          
          {viewMode === 'monthly' && (
            <div className="flex items-end gap-2 h-48">
              {totals.byMonth.map((count, idx) => {
                const height = maxMonthly > 0 ? (count / maxMonthly) * 100 : 0;
                const isCurrentMonth = idx === new Date().getMonth();
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center">
                    <span className="text-xs font-bold text-slate-600 mb-1">{count}</span>
                    <div 
                      className={`w-full rounded-t-lg transition-all ${
                        isCurrentMonth ? 'bg-teal-500' : 'bg-slate-200 hover:bg-slate-300'}`}
                      style={{ height: `${Math.max(height, 5)}%` }}
                    />
                    <span className="text-xs text-slate-400 mt-2">{MONTH_ABBR[idx]}</span>
                  </div>
                );
              })}
            </div>
          )}

          {viewMode === 'quarterly' && (
            <div className="space-y-4">
              {[1, 2, 3, 4].map(q => {
                const qTotal = getQuarterTotal(q);
                const qPercent = totals.total > 0 ? (qTotal / totals.total) * 100 : 0;
                return (
                  <div key={q}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-slate-600">Q{q} 2026</span>
                      <span className="text-sm font-bold text-slate-800">{qTotal} fathers</span>
                    </div>
                    <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-teal-500 to-teal-400 rounded-full transition-all"
                        style={{ width: `${qPercent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {viewMode === 'yearly' && (
            <div className="flex items-center justify-center h-48">
              <div className="text-center">
                <p className="text-6xl font-black text-teal-600">{totals.total}</p>
                <p className="text-slate-500 mt-2">Total Fathers in 2026</p>
                <p className="text-slate-400 text-sm">Year-to-date enrollment</p>
              </div>
            </div>
          )}
        </div>

        {/* Program Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-slate-800">Program Distribution</h3>
              <p className="text-slate-500 text-sm">Fathers by program type</p>
            </div>
            <PieChart className="w-5 h-5 text-slate-400" />
          </div>
          
          <div className="space-y-4">
            {/* Project Family Build */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Building className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-slate-700">Project Family Build</span>
                  <span className="font-bold text-slate-800">{totals.byProgram.projectFamilyBuild}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" 
                    style={{ width: `${totals.total > 0 ? (totals.byProgram.projectFamilyBuild / totals.total) * 100 : 0}%` }} />
                </div>
              </div>
            </div>

            {/* Responsible Fatherhood Class */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-slate-700">Responsible Fatherhood Class</span>
                  <span className="font-bold text-slate-800">{totals.byProgram.fatherhoodClass}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" 
                    style={{ width: `${totals.total > 0 ? (totals.byProgram.fatherhoodClass / totals.total) * 100 : 0}%` }} />
                </div>
              </div>
            </div>

            {/* Workforce Development */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <Wrench className="w-6 h-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-slate-700">Workforce Development</span>
                  <span className="font-bold text-slate-800">{totals.byProgram.workforceDev}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" 
                    style={{ width: `${totals.total > 0 ? (totals.byProgram.workforceDev / totals.total) * 100 : 0}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="w-3 h-3 bg-blue-500 rounded-full mx-auto mb-1" />
              <span className="text-xs text-slate-500">Family Build</span>
            </div>
            <div>
              <div className="w-3 h-3 bg-purple-500 rounded-full mx-auto mb-1" />
              <span className="text-xs text-slate-500">Fatherhood</span>
            </div>
            <div>
              <div className="w-3 h-3 bg-amber-500 rounded-full mx-auto mb-1" />
              <span className="text-xs text-slate-500">Workforce</span>
            </div>
          </div>
        </div>
      </div>

      {/* Trend Analysis */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-slate-800">Trend Analysis</h3>
            <p className="text-slate-500 text-sm">Month-over-month growth comparison</p>
          </div>
          <TrendingUp className="w-5 h-5 text-slate-400" />
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {MONTH_ABBR.slice(0, 6).map((month, idx) => {
            const current = totals.byMonth[idx] || 0;
            const previous = idx > 0 ? totals.byMonth[idx - 1] || 0 : 0;
            const change = idx > 0 ? current - previous : 0;
            const percentChange = previous > 0 ? ((change / previous) * 100).toFixed(0) : 0;
            
            return (
              <div key={month} className="bg-slate-50 rounded-xl p-4 text-center">
                <p className="text-xs text-slate-500 font-medium">{month} 2026</p>
                <p className="text-2xl font-black text-slate-800 my-2">{current}</p>
                {idx > 0 && (
                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
                    change > 0 ? 'bg-emerald-100 text-emerald-700' : 
                    change < 0 ? 'bg-red-100 text-red-700' : 'bg-slate-200 text-slate-600'}`}>
                    {change > 0 ? <TrendingUp className="w-3 h-3" /> : 
                     change < 0 ? <TrendingDown className="w-3 h-3" /> : null}
                    {change > 0 ? '+' : ''}{change} ({percentChange}%)
                  </div>
                )}
                {idx === 0 && (
                  <span className="text-xs text-slate-400">Baseline</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Metrics Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800">All Metrics</h3>
            <p className="text-slate-500 text-sm">Complete breakdown by category</p>
          </div>
          <a href="https://docs.google.com/spreadsheets/d/11c8UM8C7kc6D_UV0BmckW26UTloz8F2XnHd-h26VpD8" 
            target="_blank" rel="noopener noreferrer"
            className="text-teal-600 text-sm font-medium flex items-center gap-1 hover:underline">
            <ExternalLink className="w-4 h-4" /> Open Full Report
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left p-3 font-bold text-slate-600 sticky left-0 bg-slate-50">Category</th>
                {MONTH_ABBR.slice(0, 6).map(m => (
                  <th key={m} className="text-center p-3 font-bold text-slate-600 min-w-[60px]">{m}</th>
                ))}
                <th className="text-center p-3 font-bold text-teal-600 bg-teal-50">YTD</th>
              </tr>
            </thead>
            <tbody>
              {monthlySummary.slice(0, 15).map((row, idx) => (
                <tr key={idx} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="p-3 text-slate-700 font-medium sticky left-0 bg-white">{row.category}</td>
                  <td className="p-3 text-center">{row.jan2026 || 0}</td>
                  <td className="p-3 text-center">{row.feb2026 || 0}</td>
                  <td className="p-3 text-center">{row.mar2026 || 0}</td>
                  <td className="p-3 text-center">{row.apr2026 || 0}</td>
                  <td className="p-3 text-center">{row.may2026 || 0}</td>
                  <td className="p-3 text-center">{row.jun2026 || 0}</td>
                  <td className="p-3 text-center font-bold text-teal-600 bg-teal-50">{row.ytdTotal || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

interface CaseManagerPortalProps {
  onClose?: () => void;
}

const CaseManagerPortal: React.FC<CaseManagerPortalProps> = ({ onClose }) => {
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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'reports' | 'resources' | 'forms'>('dashboard');

  // Resources state
  const [resources, setResources] = useState<Resource[]>([]);
  const [resourcesLoading, setResourcesLoading] = useState(false);
  const [resourceCategory, setResourceCategory] = useState('all');
  const [searchResources, setSearchResources] = useState('');
  const [expandedResource, setExpandedResource] = useState<string | null>(null);
  const [showResourceForm, setShowResourceForm] = useState(false);
  const [newResource, setNewResource] = useState<Partial<Resource>>({ category: 'Childcare' });

  // Employment state
  const [employmentClients, setEmploymentClients] = useState<EmploymentClient[]>([]);
  const [employmentLoading, setEmploymentLoading] = useState(false);
  const [showEmploymentForm, setShowEmploymentForm] = useState(false);
  const [newClient, setNewClient] = useState<Partial<EmploymentClient>>({});

  // Diaper state
  const [diaperEntries, setDiaperEntries] = useState<DiaperEntry[]>([]);
  const [diaperLoading, setDiaperLoading] = useState(false);
  const [showDiaperForm, setShowDiaperForm] = useState(false);
  const [newDiaper, setNewDiaper] = useState<Partial<DiaperEntry>>({
    date: new Date().toLocaleDateString(),
    source: 'JLBR',
    quantity: 1
  });

  // Monthly Report state
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportMonth, setReportMonth] = useState(MONTHS[new Date().getMonth()]);
  const [reportYear, setReportYear] = useState(2026);
  const [reportData, setReportData] = useState<{[key: string]: number}>({});
  const [reportNotes, setReportNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [monthlySummary, setMonthlySummary] = useState<any[]>([]);

  // Forms/Files state
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [filesLoading, setFilesLoading] = useState(false);

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

  // Load data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      if (activeTab === 'resources') {
        loadResources();
      } else if (activeTab === 'forms') {
        loadFiles();
        loadEmployment();
        loadDiapers();
      } else if (activeTab === 'reports' || activeTab === 'dashboard') {
        loadMonthlySummary();
      }
    }
  }, [isAuthenticated, activeTab]);

  // ============================================
  // DATA LOADING FUNCTIONS
  // ============================================

  const loadResources = async () => {
    setResourcesLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/casemanager/resources`);
      if (response.ok) {
        const data = await response.json();
        setResources(data.resources || []);
      }
    } catch (err) {
      console.error('Error loading resources:', err);
    } finally {
      setResourcesLoading(false);
    }
  };

  const loadEmployment = async () => {
    setEmploymentLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/casemanager/employment`);
      if (response.ok) {
        const data = await response.json();
        setEmploymentClients(data.clients || []);
      }
    } catch (err) {
      console.error('Error loading employment:', err);
    } finally {
      setEmploymentLoading(false);
    }
  };

  const loadDiapers = async () => {
    setDiaperLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/casemanager/diapers`);
      if (response.ok) {
        const data = await response.json();
        setDiaperEntries(data.entries || []);
      }
    } catch (err) {
      console.error('Error loading diapers:', err);
    } finally {
      setDiaperLoading(false);
    }
  };

  const loadMonthlySummary = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/casemanager/monthly-summary`);
      if (response.ok) {
        const data = await response.json();
        setMonthlySummary(data.summary || []);
      }
    } catch (err) {
      console.error('Error loading summary:', err);
    }
  };

  const loadFiles = async () => {
    setFilesLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/drive/files?folderId=${FORMS_FOLDER_ID}`);
      if (response.ok) {
        const data = await response.json();
        setFiles(data.files || []);
      }
    } catch (err) {
      console.error('Error loading files:', err);
    } finally {
      setFilesLoading(false);
    }
  };

  // ============================================
  // SUBMIT FUNCTIONS
  // ============================================

  const submitMonthlyReport = async () => {
    if (!currentUser) return;
    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/casemanager/monthly-reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseManager: currentUser.name,
          month: reportMonth,
          year: reportYear,
          data: reportData,
          notes: reportNotes
        })
      });
      if (response.ok) {
        setShowReportForm(false);
        setReportData({});
        setReportNotes('');
        loadMonthlySummary();
        alert('Monthly report submitted successfully!');
      }
    } catch (err) {
      console.error('Error submitting report:', err);
      alert('Error submitting report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const submitEmploymentClient = async () => {
    if (!currentUser) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/casemanager/employment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newClient, caseManager: currentUser.name })
      });
      if (response.ok) {
        setShowEmploymentForm(false);
        setNewClient({});
        loadEmployment();
      }
    } catch (err) {
      console.error('Error adding client:', err);
    }
  };

  const submitDiaperEntry = async () => {
    if (!currentUser) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/casemanager/diapers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newDiaper, caseManager: currentUser.name })
      });
      if (response.ok) {
        setShowDiaperForm(false);
        setNewDiaper({ date: new Date().toLocaleDateString(), source: 'JLBR', quantity: 1 });
        loadDiapers();
      }
    } catch (err) {
      console.error('Error adding diaper entry:', err);
    }
  };

  const submitResource = async () => {
    if (!newResource.organization || !newResource.category) {
      alert('Please enter organization name and select a category');
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/casemanager/resources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newResource)
      });
      if (response.ok) {
        setShowResourceForm(false);
        setNewResource({ category: 'Childcare' });
        loadResources();
        alert('Resource added successfully!');
      }
    } catch (err) {
      console.error('Error adding resource:', err);
      alert('Error adding resource. Please try again.');
    }
  };

  // ============================================
  // AUTH HANDLERS
  // ============================================

  const handleAuth = async () => {
    setAuthError('');
    setAuthLoading(true);
    try {
      const emailLower = email.trim().toLowerCase();
      if (!emailLower.endsWith('@foamla.org')) {
        setAuthError('Please use your @foamla.org email address');
        setAuthLoading(false);
        return;
      }
      if (authMode === 'signup' && !name.trim()) {
        setAuthError('Please enter your name');
        setAuthLoading(false);
        return;
      }
      if (password.length < 6) {
        setAuthError('Password must be at least 6 characters');
        setAuthLoading(false);
        return;
      }

      const users = JSON.parse(localStorage.getItem('foam_case_manager_users') || '{}');
      if (authMode === 'signup') {
        if (users[emailLower]) {
          setAuthError('Account exists. Please login.');
          setAuthLoading(false);
          return;
        }
        const newUser: User = { email: emailLower, name: name.trim(), registeredAt: new Date().toISOString() };
        users[emailLower] = { ...newUser, password };
        localStorage.setItem('foam_case_manager_users', JSON.stringify(users));
        localStorage.setItem('foam_case_manager_user', JSON.stringify(newUser));
        setCurrentUser(newUser);
        setIsAuthenticated(true);
      } else {
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

  // Get unique categories from resources
  const resourceCategories = ['all', ...new Set(resources.map(r => r.category).filter(Boolean))];

  // Filter resources
  const filteredResources = resources.filter(r => {
    if (resourceCategory !== 'all' && r.category !== resourceCategory) return false;
    if (searchResources) {
      const search = searchResources.toLowerCase();
      return r.organization?.toLowerCase().includes(search) || 
             r.description?.toLowerCase().includes(search) ||
             r.category?.toLowerCase().includes(search);
    }
    return true;
  });

  // ============================================
  // RENDER: LOGIN
  // ============================================

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden max-w-md w-full">
          <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-8 py-10 text-center">
            <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">CASE MANAGER PORTAL</h1>
            <p className="text-teal-100 text-sm mt-1">Fathers On A Mission</p>
          </div>
          <div className="p-8">
            <div className="flex bg-slate-100 rounded-xl p-1 mb-6">
              <button onClick={() => { setAuthMode('login'); setAuthError(''); }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${authMode === 'login' ? 'bg-white text-slate-800 shadow' : 'text-slate-500'}`}>
                Sign In
              </button>
              <button onClick={() => { setAuthMode('signup'); setAuthError(''); }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${authMode === 'signup' ? 'bg-white text-slate-800 shadow' : 'text-slate-500'}`}>
                Register
              </button>
            </div>
            {authError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" /> {authError}
              </div>
            )}
            <div className="space-y-4">
              {authMode === 'signup' && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-teal-500" />
                  </div>
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@foamla.org"
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-teal-500" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
            <button onClick={handleAuth} disabled={authLoading}
              className="w-full mt-6 py-4 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl font-bold text-sm uppercase tracking-wider shadow-lg hover:shadow-xl transition-all disabled:opacity-50">
              {authLoading ? 'Please wait...' : (authMode === 'login' ? 'Sign In' : 'Create Account')}
            </button>
            <p className="text-center text-slate-400 text-xs mt-6">Only @foamla.org emails can access</p>
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
            {onClose && (
              <button onClick={onClose} className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium hidden sm:inline">Back to Hub</span>
              </button>
            )}
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-black text-lg tracking-tight">CASE MANAGER PORTAL</h1>
              <p className="text-teal-100 text-xs">Welcome, {currentUser?.name}</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium transition-all">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
        {/* Tabs */}
        <div className="flex gap-1 mt-4 overflow-x-auto pb-1">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'reports', label: 'Monthly Reports', icon: FileText },
            { id: 'resources', label: 'Resources', icon: BookOpen },
            { id: 'forms', label: 'Forms & Trackers', icon: FolderOpen },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id ? 'bg-white text-teal-700 shadow-lg' : 'text-teal-100 hover:bg-white/10'}`}>
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </header>

      <main className="p-6 max-w-7xl mx-auto">
        {/* ============================================ */}
        {/* ANALYTICS DASHBOARD TAB */}
        {/* ============================================ */}
        {activeTab === 'dashboard' && (
          <DashboardTab monthlySummary={monthlySummary} onRefresh={loadMonthlySummary} />
        )}

        {/* ============================================ */}
        {/* MONTHLY REPORTS TAB */}
        {/* ============================================ */}
        {activeTab === 'reports' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-black text-slate-800">Monthly Reports</h2>
                <p className="text-slate-500 text-sm mt-1">Submit progress data for grant reporting</p>
              </div>
              <button onClick={() => setShowReportForm(true)}
                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transition-all">
                <Plus className="w-4 h-4" /> New Report
              </button>
            </div>

            {/* Summary Cards */}
            {monthlySummary.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {monthlySummary.slice(0, 4).map((item, idx) => (
                  <div key={idx} className="bg-white rounded-2xl p-4 border border-slate-200">
                    <p className="text-xs text-slate-500 font-medium truncate">{item.category}</p>
                    <p className="text-2xl font-black text-slate-800 mt-1">{item.ytdTotal || 0}</p>
                    <p className="text-xs text-teal-600 font-bold">YTD Total</p>
                  </div>
                ))}
              </div>
            )}

            {/* Report Form Modal */}
            {showReportForm && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
                  <div className="p-6 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
                    <div>
                      <h3 className="text-xl font-black text-slate-800">Submit Monthly Report</h3>
                      <p className="text-slate-500 text-sm mt-1">Enter your metrics for {reportMonth} {reportYear}</p>
                    </div>
                    <button onClick={() => setShowReportForm(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                      <X className="w-5 h-5 text-slate-400" />
                    </button>
                  </div>
                  <div className="p-6 space-y-6">
                    {/* Month/Year Selection */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Month</label>
                        <select value={reportMonth} onChange={(e) => setReportMonth(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-teal-500">
                          {MONTHS.map(month => <option key={month} value={month}>{month}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Year</label>
                        <select value={reportYear} onChange={(e) => setReportYear(parseInt(e.target.value))}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-teal-500">
                          <option value={2026}>2026</option>
                          <option value={2025}>2025</option>
                        </select>
                      </div>
                    </div>
                    {/* Categories */}
                    <div>
                      <h4 className="font-bold text-slate-700 mb-3">Enter Counts by Category</h4>
                      <div className="space-y-2">
                        {REPORT_CATEGORIES.map(cat => (
                          <div key={cat} className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl">
                            <span className="flex-1 text-sm text-slate-700">{cat}</span>
                            <input type="number" min="0" value={reportData[cat] || 0}
                              onChange={(e) => setReportData({ ...reportData, [cat]: parseInt(e.target.value) || 0 })}
                              className="w-20 px-3 py-2 bg-white border border-slate-200 rounded-lg text-center font-bold focus:outline-none focus:ring-2 focus:ring-teal-500" />
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Notes */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Notes</label>
                      <textarea value={reportNotes} onChange={(e) => setReportNotes(e.target.value)} rows={3}
                        placeholder="Any additional notes or challenges..."
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
                    </div>
                  </div>
                  <div className="p-6 border-t border-slate-200 flex gap-3 justify-end sticky bottom-0 bg-white">
                    <button onClick={() => setShowReportForm(false)}
                      className="px-6 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-slate-600">Cancel</button>
                    <button onClick={submitMonthlyReport} disabled={submitting}
                      className="px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl font-bold flex items-center gap-2 disabled:opacity-50">
                      <Save className="w-4 h-4" /> {submitting ? 'Submitting...' : 'Submit Report'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Monthly Summary Table */}
            {monthlySummary.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100">
                  <h3 className="font-bold text-slate-800">2026 Progress Summary</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="text-left p-3 font-bold text-slate-600">Category</th>
                        <th className="text-center p-3 font-bold text-slate-600">Jan</th>
                        <th className="text-center p-3 font-bold text-slate-600">Feb</th>
                        <th className="text-center p-3 font-bold text-slate-600">Mar</th>
                        <th className="text-center p-3 font-bold text-teal-600">YTD</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthlySummary.slice(0, 10).map((row, idx) => (
                        <tr key={idx} className="border-t border-slate-100">
                          <td className="p-3 text-slate-700">{row.category}</td>
                          <td className="p-3 text-center">{row.jan2026 || 0}</td>
                          <td className="p-3 text-center">{row.feb2026 || 0}</td>
                          <td className="p-3 text-center">{row.mar2026 || 0}</td>
                          <td className="p-3 text-center font-bold text-teal-600">{row.ytdTotal || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================ */}
        {/* RESOURCES TAB */}
        {/* ============================================ */}
        {activeTab === 'resources' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-black text-slate-800">Resource Directory</h2>
                <p className="text-slate-500 text-sm mt-1">Community resources for client referrals</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setShowResourceForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl font-bold text-sm">
                  <Plus className="w-4 h-4" /> Add Resource
                </button>
                <button onClick={loadResources} className="p-2 hover:bg-slate-100 rounded-lg">
                  <RefreshCw className={`w-5 h-5 text-slate-400 ${resourcesLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Add Resource Form Modal */}
            {showResourceForm && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-black text-slate-800">Add New Resource</h3>
                    <button onClick={() => setShowResourceForm(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Category *</label>
                      <select value={newResource.category || 'Childcare'} onChange={(e) => setNewResource({...newResource, category: e.target.value})}
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl">
                        <option value="Childcare">Childcare</option>
                        <option value="Housing">Housing</option>
                        <option value="Employment">Employment</option>
                        <option value="Mental Health">Mental Health</option>
                        <option value="Food Assistance">Food Assistance</option>
                        <option value="Legal Services">Legal Services</option>
                        <option value="Education">Education</option>
                        <option value="Healthcare">Healthcare</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Organization Name *</label>
                      <input type="text" value={newResource.organization || ''} onChange={(e) => setNewResource({...newResource, organization: e.target.value})}
                        placeholder="e.g. Greater BR Food Bank"
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Address</label>
                      <input type="text" value={newResource.address || ''} onChange={(e) => setNewResource({...newResource, address: e.target.value})}
                        placeholder="123 Main St, Baton Rouge, LA"
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Phone</label>
                        <input type="text" value={newResource.phone || ''} onChange={(e) => setNewResource({...newResource, phone: e.target.value})}
                          placeholder="(225) 555-1234"
                          className="w-full px-4 py-2 border border-slate-200 rounded-xl" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Website</label>
                        <input type="text" value={newResource.website || ''} onChange={(e) => setNewResource({...newResource, website: e.target.value})}
                          placeholder="www.example.org"
                          className="w-full px-4 py-2 border border-slate-200 rounded-xl" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Contact Person</label>
                      <input type="text" value={newResource.contact || ''} onChange={(e) => setNewResource({...newResource, contact: e.target.value})}
                        placeholder="Ask for John Smith"
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Description</label>
                      <textarea value={newResource.description || ''} onChange={(e) => setNewResource({...newResource, description: e.target.value})}
                        placeholder="What services do they provide?"
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl" rows={2} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Referral Process</label>
                      <textarea value={newResource.referralProcess || ''} onChange={(e) => setNewResource({...newResource, referralProcess: e.target.value})}
                        placeholder="How do clients get services? Walk-in, call, online form?"
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl" rows={2} />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button onClick={() => setShowResourceForm(false)} className="flex-1 py-3 bg-slate-100 rounded-xl font-bold">Cancel</button>
                    <button onClick={submitResource} className="flex-1 py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl font-bold">Save Resource</button>
                  </div>
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input type="text" value={searchResources} onChange={(e) => setSearchResources(e.target.value)}
                  placeholder="Search resources..."
                  className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <select value={resourceCategory} onChange={(e) => setResourceCategory(e.target.value)}
                className="px-4 py-3 bg-white border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-teal-500">
                {resourceCategories.map(cat => (
                  <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>
                ))}
              </select>
            </div>

            {/* Resource Cards */}
            {resourcesLoading ? (
              <div className="text-center py-12">
                <RefreshCw className="w-8 h-8 text-teal-500 animate-spin mx-auto mb-4" />
                <p className="text-slate-500">Loading resources...</p>
              </div>
            ) : filteredResources.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-800 mb-2">No Resources Found</h3>
                <p className="text-slate-500">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredResources.map((resource, idx) => (
                  <div key={idx} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow">
                    <button onClick={() => setExpandedResource(expandedResource === `${idx}` ? null : `${idx}`)}
                      className="w-full p-5 text-left flex items-start gap-4">
                      <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-6 h-6 text-teal-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-bold text-teal-600 uppercase">{resource.category}</span>
                        <h3 className="font-bold text-slate-800 mt-1">{resource.organization}</h3>
                        <p className="text-slate-500 text-sm mt-1 line-clamp-2">{resource.description}</p>
                      </div>
                      {expandedResource === `${idx}` ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                    </button>
                    {expandedResource === `${idx}` && (
                      <div className="px-5 pb-5 border-t border-slate-100 pt-4 space-y-3">
                        {resource.address && (
                          <div className="flex items-start gap-3">
                            <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                            <span className="text-sm text-slate-600">{resource.address}</span>
                          </div>
                        )}
                        {resource.phone && (
                          <div className="flex items-center gap-3">
                            <Phone className="w-4 h-4 text-slate-400" />
                            <a href={`tel:${resource.phone}`} className="text-sm text-teal-600 font-medium">{resource.phone}</a>
                          </div>
                        )}
                        {resource.website && (
                          <div className="flex items-center gap-3">
                            <Globe className="w-4 h-4 text-slate-400" />
                            <a href={resource.website.startsWith('http') ? resource.website : `https://${resource.website}`}
                              target="_blank" rel="noopener noreferrer" className="text-sm text-teal-600 font-medium truncate">{resource.website}</a>
                          </div>
                        )}
                        {resource.contact && (
                          <div className="flex items-center gap-3">
                            <UserCheck className="w-4 h-4 text-slate-400" />
                            <span className="text-sm text-slate-600">{resource.contact}</span>
                          </div>
                        )}
                        {resource.referralProcess && (
                          <div className="mt-3 p-3 bg-amber-50 rounded-xl">
                            <p className="text-xs font-bold text-amber-700 uppercase mb-1">Referral Process</p>
                            <p className="text-sm text-amber-800">{resource.referralProcess}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============================================ */}
        {/* FORMS & TRACKERS TAB */}
        {/* ============================================ */}
        {activeTab === 'forms' && (
          <div className="space-y-8">
            {/* Diaper Distribution Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                    <Baby className="w-5 h-5 text-pink-500" /> Diaper Distribution
                  </h2>
                  <p className="text-slate-500 text-sm">Track diaper distributions for JLBR reporting</p>
                </div>
                <button onClick={() => setShowDiaperForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-xl font-bold text-sm">
                  <Plus className="w-4 h-4" /> Add Entry
                </button>
              </div>

              {/* Recent Diaper Entries */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="text-left p-3 font-bold text-slate-600">Date</th>
                        <th className="text-left p-3 font-bold text-slate-600">Client</th>
                        <th className="text-left p-3 font-bold text-slate-600">Sizes</th>
                        <th className="text-center p-3 font-bold text-slate-600">Qty</th>
                        <th className="text-left p-3 font-bold text-slate-600">Source</th>
                      </tr>
                    </thead>
                    <tbody>
                      {diaperEntries.slice(0, 5).map((entry, idx) => (
                        <tr key={idx} className="border-t border-slate-100">
                          <td className="p-3">{entry.date}</td>
                          <td className="p-3 font-medium">{entry.clientName}</td>
                          <td className="p-3">{entry.sizes}</td>
                          <td className="p-3 text-center">{entry.quantity}</td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                              entry.source === 'JLBR' ? 'bg-teal-100 text-teal-700' : 'bg-amber-100 text-amber-700'}`}>
                              {entry.source}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {diaperEntries.length === 0 && (
                        <tr><td colSpan={5} className="p-8 text-center text-slate-400">No entries yet</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Employment Support Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-purple-500" /> Employment Support
                  </h2>
                  <p className="text-slate-500 text-sm">Track workforce development clients</p>
                </div>
                <button onClick={() => setShowEmploymentForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-xl font-bold text-sm">
                  <Plus className="w-4 h-4" /> Add Client
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="text-left p-3 font-bold text-slate-600">Name</th>
                        <th className="text-left p-3 font-bold text-slate-600">Phone</th>
                        <th className="text-left p-3 font-bold text-slate-600">Status</th>
                        <th className="text-left p-3 font-bold text-slate-600">Resume</th>
                        <th className="text-left p-3 font-bold text-slate-600">Goal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employmentClients.slice(0, 5).map((client, idx) => (
                        <tr key={idx} className="border-t border-slate-100">
                          <td className="p-3 font-medium">{client.name}</td>
                          <td className="p-3">{client.phone}</td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                              client.status === 'Placed' ? 'bg-emerald-100 text-emerald-700' :
                              client.status === 'Active' ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-600'}`}>
                              {client.status}
                            </span>
                          </td>
                          <td className="p-3">{client.resumeStatus}</td>
                          <td className="p-3">{client.employmentGoal}</td>
                        </tr>
                      ))}
                      {employmentClients.length === 0 && (
                        <tr><td colSpan={5} className="p-8 text-center text-slate-400">No clients yet</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Forms from Google Drive */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                    <FolderOpen className="w-5 h-5 text-blue-500" /> Forms & Documents
                  </h2>
                  <p className="text-slate-500 text-sm">Access and download forms</p>
                </div>
                <a href={`https://drive.google.com/drive/folders/${FORMS_FOLDER_ID}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl font-bold text-sm text-slate-600">
                  <ExternalLink className="w-4 h-4" /> Open Drive
                </a>
              </div>
              
              {filesLoading ? (
                <div className="text-center py-8"><RefreshCw className="w-6 h-6 text-teal-500 animate-spin mx-auto" /></div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {files.slice(0, 9).map(file => (
                    <a key={file.id} href={file.webViewLink} target="_blank" rel="noopener noreferrer"
                      className="bg-white rounded-xl p-4 border border-slate-200 hover:shadow-lg transition-all flex items-center gap-3 group">
                      <FileText className="w-8 h-8 text-blue-500" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-800 truncate group-hover:text-teal-600">{file.name}</h3>
                        <p className="text-xs text-slate-400">Modified {new Date(file.modifiedTime).toLocaleDateString()}</p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-teal-500" />
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Diaper Form Modal */}
            {showDiaperForm && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl w-full max-w-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-black text-slate-800">Add Diaper Distribution</h3>
                    <button onClick={() => setShowDiaperForm(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Date</label>
                        <input type="text" value={newDiaper.date || ''} onChange={(e) => setNewDiaper({...newDiaper, date: e.target.value})}
                          className="w-full px-4 py-2 border border-slate-200 rounded-xl" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Source</label>
                        <select value={newDiaper.source} onChange={(e) => setNewDiaper({...newDiaper, source: e.target.value})}
                          className="w-full px-4 py-2 border border-slate-200 rounded-xl">
                          <option value="JLBR">JLBR</option>
                          <option value="Walmart">Walmart</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Client Name</label>
                      <input type="text" value={newDiaper.clientName || ''} onChange={(e) => setNewDiaper({...newDiaper, clientName: e.target.value})}
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Phone</label>
                        <input type="text" value={newDiaper.phone || ''} onChange={(e) => setNewDiaper({...newDiaper, phone: e.target.value})}
                          className="w-full px-4 py-2 border border-slate-200 rounded-xl" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Zip Code</label>
                        <input type="text" value={newDiaper.zipCode || ''} onChange={(e) => setNewDiaper({...newDiaper, zipCode: e.target.value})}
                          className="w-full px-4 py-2 border border-slate-200 rounded-xl" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Diaper Sizes</label>
                        <input type="text" placeholder="e.g. 3, 4" value={newDiaper.sizes || ''} onChange={(e) => setNewDiaper({...newDiaper, sizes: e.target.value})}
                          className="w-full px-4 py-2 border border-slate-200 rounded-xl" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Quantity (packs)</label>
                        <input type="number" min="1" value={newDiaper.quantity || 1} onChange={(e) => setNewDiaper({...newDiaper, quantity: parseInt(e.target.value)})}
                          className="w-full px-4 py-2 border border-slate-200 rounded-xl" />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button onClick={() => setShowDiaperForm(false)} className="flex-1 py-3 bg-slate-100 rounded-xl font-bold">Cancel</button>
                    <button onClick={submitDiaperEntry} className="flex-1 py-3 bg-pink-500 text-white rounded-xl font-bold">Save Entry</button>
                  </div>
                </div>
              </div>
            )}

            {/* Employment Form Modal */}
            {showEmploymentForm && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl w-full max-w-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-black text-slate-800">Add Employment Client</h3>
                    <button onClick={() => setShowEmploymentForm(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Client Name</label>
                      <input type="text" value={newClient.name || ''} onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Phone</label>
                        <input type="text" value={newClient.phone || ''} onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                          className="w-full px-4 py-2 border border-slate-200 rounded-xl" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Status</label>
                        <select value={newClient.status || 'Active'} onChange={(e) => setNewClient({...newClient, status: e.target.value})}
                          className="w-full px-4 py-2 border border-slate-200 rounded-xl">
                          <option value="Active">Active</option>
                          <option value="Placed">Placed</option>
                          <option value="Inactive">Inactive</option>
                          <option value="Lost Contact">Lost Contact</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Resume Status</label>
                        <select value={newClient.resumeStatus || 'None'} onChange={(e) => setNewClient({...newClient, resumeStatus: e.target.value})}
                          className="w-full px-4 py-2 border border-slate-200 rounded-xl">
                          <option value="None">None</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Complete">Complete</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Min Pay Goal</label>
                        <input type="text" placeholder="$14/hr" value={newClient.minPay || ''} onChange={(e) => setNewClient({...newClient, minPay: e.target.value})}
                          className="w-full px-4 py-2 border border-slate-200 rounded-xl" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Employment Goal</label>
                      <input type="text" placeholder="e.g. Warehouse, Retail" value={newClient.employmentGoal || ''} onChange={(e) => setNewClient({...newClient, employmentGoal: e.target.value})}
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Notes</label>
                      <textarea value={newClient.notes || ''} onChange={(e) => setNewClient({...newClient, notes: e.target.value})}
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl" rows={2} />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button onClick={() => setShowEmploymentForm(false)} className="flex-1 py-3 bg-slate-100 rounded-xl font-bold">Cancel</button>
                    <button onClick={submitEmploymentClient} className="flex-1 py-3 bg-purple-500 text-white rounded-xl font-bold">Save Client</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default CaseManagerPortal;
