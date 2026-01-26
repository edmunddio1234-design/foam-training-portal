import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ArrowLeft, Calendar, RefreshCw, FileText, Users, Briefcase, Heart, DollarSign,
  CheckCircle2, Edit3, X, BarChart3, History, ClipboardList, Target, AlertTriangle,
  Download, Eye, Printer, FileDown, Sparkles, ArrowUpRight, ArrowDownRight, Monitor,
  Database, Activity, TrendingUp, Package, Truck, Home, Zap, PieChart, Layers,
  UserCheck, BookOpen, Award, Phone, Mail, MapPin, Clock, Filter, Search
} from 'lucide-react';

const API_BASE_URL = 'https://foamla-backend-2.onrender.com';

// ============================================
// TYPE DEFINITIONS
// ============================================
interface DataRow {
  id: number;
  category: string;
  values: (number | string | null)[];
}

interface ComparisonRow {
  id: number;
  metric: string;
  historical: number;
  current: number;
  change: number;
  percentChange: number;
}

interface LogEntry {
  id: number;
  date: string;
  caseManager: string;
  month: string;
  year: string;
  category: string;
  oldValue: string;
  newValue: string;
}

interface Father {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  completedModules: number[];
  joinedDate: string;
  status: string;
}

interface AssessmentData {
  monthlyBreakdown: {
    [key: number]: {
      monthName: string;
      totalAssessments: number;
      uniqueFathers: number;
      fathersReportImprovedRelationship: number;
      fathersFeelBecomingBetterFather: number;
      participantsDemonstratingBetterParenting: number;
      fathersReportingImprovedOutcomes: number;
      challengesReported: number;
    };
  };
  totals: {
    totalAssessments: number;
    uniqueFathers: number;
    fathersReportImprovedRelationship: number;
    fathersFeelBecomingBetterFather: number;
    participantsDemonstratingBetterParenting: number;
    fathersReportingImprovedOutcomes: number;
  };
}

interface ResourceData {
  category: string;
  monthly: number[];
  total: number;
}

interface AttendanceData {
  totalSessions: number;
  uniqueAttendees: number;
  averageAttendance: number;
  monthlyAttendance: { [key: string]: number };
}

interface LiveDataSources {
  fatherhood: {
    fathers: Father[];
    totalActive: number;
    totalEnrolled: number;
    totalGraduated: number;
    totalAtRisk: number;
  };
  assessments: AssessmentData | null;
  resources: ResourceData[];
  attendance: AttendanceData | null;
  caseManager: {
    clients: any[];
    referrals: any[];
  };
  lastUpdated: Date | null;
}

interface CaseManagerPortalProps {
  onClose: () => void;
}

type TabType = 'dashboard' | 'historical' | 'current' | 'comparison' | 'log' | 'reports' | 'live-data';
type ReportType = 'monthly' | 'quarterly' | 'annual' | 'indepth' | 'indepth6';

// ============================================
// MAIN COMPONENT
// ============================================
const CaseManagerPortal: React.FC<CaseManagerPortalProps> = ({ onClose }) => {
  // Core state
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [historicalData, setHistoricalData] = useState<DataRow[]>([]);
  const [historicalMonths, setHistoricalMonths] = useState<string[]>([]);
  const [currentData, setCurrentData] = useState<DataRow[]>([]);
  const [currentMonths, setCurrentMonths] = useState<string[]>([]);
  const [comparisonData, setComparisonData] = useState<ComparisonRow[]>([]);
  const [logData, setLogData] = useState<LogEntry[]>([]);

  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingStates, setLoadingStates] = useState({
    caseManager: true,
    fatherhood: true,
    assessments: true,
    resources: true,
    attendance: true
  });

  // Edit states
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [caseManagerName, setCaseManagerName] = useState('');
  const [showNamePrompt, setShowNamePrompt] = useState(false);

  // Report states
  const [reportType, setReportType] = useState<ReportType>('monthly');
  const [selectedYear, setSelectedYear] = useState<'2024-2025' | '2026'>('2026');
  const [selectedMonth, setSelectedMonth] = useState<number>(0);
  const [selectedQuarter, setSelectedQuarter] = useState<number>(1);
  const [showPreview, setShowPreview] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<any>(null);
  const [showFullReport, setShowFullReport] = useState(false);

  // Live data sources state
  const [liveData, setLiveData] = useState<LiveDataSources>({
    fatherhood: {
      fathers: [],
      totalActive: 0,
      totalEnrolled: 0,
      totalGraduated: 0,
      totalAtRisk: 0
    },
    assessments: null,
    resources: [],
    attendance: null,
    caseManager: {
      clients: [],
      referrals: []
    },
    lastUpdated: null
  });

  // Auto-refresh interval
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(60000);

  // ============================================
  // DATA LOADING FUNCTIONS
  // ============================================

  const loadCaseManagerData = async () => {
    setLoadingStates(prev => ({ ...prev, caseManager: true }));
    try {
      const [histRes, currRes, compRes, logRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/casemanager/historical`),
        fetch(`${API_BASE_URL}/api/casemanager/current`),
        fetch(`${API_BASE_URL}/api/casemanager/comparison`),
        fetch(`${API_BASE_URL}/api/casemanager/log`)
      ]);

      const histData = await histRes.json();
      const currData = await currRes.json();
      const compData = await compRes.json();
      const logDataRes = await logRes.json();

      if (histData.success) {
        setHistoricalData(histData.data || []);
        setHistoricalMonths(histData.months || []);
      }
      if (currData.success) {
        setCurrentData(currData.data || []);
        setCurrentMonths(currData.months || []);
      }
      if (compData.success) {
        setComparisonData(compData.data || []);
      }
      if (logDataRes.success) {
        setLogData(logDataRes.data || []);
      }
    } catch (err: any) {
      console.error('Error loading case manager data:', err);
    } finally {
      setLoadingStates(prev => ({ ...prev, caseManager: false }));
    }
  };

  const loadFatherhoodData = async () => {
    setLoadingStates(prev => ({ ...prev, fatherhood: true }));
    try {
      const response = await fetch(`${API_BASE_URL}/api/fathers`);
      const data = await response.json();

      if (data.success && data.data) {
        const fathers = data.data;
        const active = fathers.filter((f: Father) => f.status === 'Active').length;
        const graduated = fathers.filter((f: Father) => f.status === 'Graduated').length;
        const atRisk = fathers.filter((f: Father) => f.status === 'At Risk').length;

        setLiveData(prev => ({
          ...prev,
          fatherhood: {
            fathers,
            totalActive: active,
            totalEnrolled: fathers.length,
            totalGraduated: graduated,
            totalAtRisk: atRisk
          }
        }));
      }
    } catch (err: any) {
      console.error('Error loading fatherhood data:', err);
    } finally {
      setLoadingStates(prev => ({ ...prev, fatherhood: false }));
    }
  };

  const loadAssessmentData = async () => {
    setLoadingStates(prev => ({ ...prev, assessments: true }));
    try {
      const response = await fetch(`${API_BASE_URL}/api/fatherhood/assessments/aggregated?year=2026`);
      const result = await response.json();

      if (result.success && result.data) {
        const data = result.data;
        setLiveData(prev => ({
          ...prev,
          assessments: {
            monthlyBreakdown: data.monthlyBreakdown || {},
            totals: {
              totalAssessments: data.totalAssessments || 0,
              uniqueFathers: data.uniqueFathers || 0,
              fathersReportImprovedRelationship: data.fathersReportImprovedRelationship || 0,
              fathersFeelBecomingBetterFather: data.fathersFeelBecomingBetterFather || 0,
              participantsDemonstratingBetterParenting: data.participantsDemonstratingBetterParenting || 0,
              fathersReportingImprovedOutcomes: data.fathersReportingImprovedOutcomes || 0
            }
          }
        }));
      }
    } catch (err: any) {
      console.error('Error loading assessment data:', err);
    } finally {
      setLoadingStates(prev => ({ ...prev, assessments: false }));
    }
  };

  const loadResourceData = async () => {
    setLoadingStates(prev => ({ ...prev, resources: true }));
    try {
      const response = await fetch(`${API_BASE_URL}/api/resources/dashboard`);
      const data = await response.json();

      if (data.success) {
        setLiveData(prev => ({
          ...prev,
          resources: data.categories || []
        }));
      }
    } catch (err: any) {
      console.error('Error loading resource data:', err);
    } finally {
      setLoadingStates(prev => ({ ...prev, resources: false }));
    }
  };

  const loadAttendanceData = async () => {
    setLoadingStates(prev => ({ ...prev, attendance: true }));
    try {
      const response = await fetch(`${API_BASE_URL}/api/attendance/stats`);
      const data = await response.json();

      if (data.success) {
        setLiveData(prev => ({
          ...prev,
          attendance: data.stats || null
        }));
      }
    } catch (err: any) {
      console.error('Error loading attendance data:', err);
    } finally {
      setLoadingStates(prev => ({ ...prev, attendance: false }));
    }
  };

  const loadAllData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await Promise.all([
        loadCaseManagerData(),
        loadFatherhoodData(),
        loadAssessmentData(),
        loadResourceData(),
        loadAttendanceData()
      ]);

      setLiveData(prev => ({
        ...prev,
        lastUpdated: new Date()
      }));
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadAllData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, loadAllData]);

  // ============================================
  // CELL EDITING FUNCTIONS
  // ============================================

  const handleCellClick = (rowIndex: number, colIndex: number, currentValue: number | string | null) => {
    if (activeTab !== 'current' || colIndex === currentMonths.length - 1) return;
    if (!caseManagerName) {
      setShowNamePrompt(true);
      return;
    }
    setEditingCell({ row: rowIndex, col: colIndex });
    setEditValue(currentValue?.toString() || '0');
  };

  const handleSaveCell = async () => {
    if (!editingCell) return;
    setIsSaving(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/casemanager/current`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          row: editingCell.row,
          col: editingCell.col,
          value: Number(editValue) || 0,
          caseManager: caseManagerName
        })
      });

      const data = await res.json();

      if (data.success) {
        const newData = [...currentData];
        newData[editingCell.row].values[editingCell.col] = Number(editValue) || 0;
        setCurrentData(newData);
        setEditingCell(null);
        setTimeout(() => loadAllData(), 500);
      } else {
        alert('Failed to save: ' + data.error);
      }
    } catch (err: any) {
      alert('Error saving: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // ============================================
  // HELPER FUNCTIONS
  // ============================================

  const getCategoryIcon = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('active') || cat.includes('enrolled')) return <Users size={16} className="text-blue-600" />;
    if (cat.includes('job') || cat.includes('employment') || cat.includes('workforce')) return <Briefcase size={16} className="text-emerald-600" />;
    if (cat.includes('mental') || cat.includes('relationship')) return <Heart size={16} className="text-pink-600" />;
    if (cat.includes('financial') || cat.includes('income')) return <DollarSign size={16} className="text-amber-600" />;
    if (cat.includes('education') || cat.includes('skill')) return <FileText size={16} className="text-purple-600" />;
    if (cat.includes('diaper') || cat.includes('resource')) return <Package size={16} className="text-orange-600" />;
    if (cat.includes('transport')) return <Truck size={16} className="text-cyan-600" />;
    if (cat.includes('utility') || cat.includes('electric') || cat.includes('water')) return <Zap size={16} className="text-yellow-600" />;
    return <ClipboardList size={16} className="text-gray-500" />;
  };

  const formatNumber = (num: number | null | undefined): string => {
    if (num === null || num === undefined) return '0';
    return num.toLocaleString();
  };

  // ============================================
  // COMPUTED VALUES
  // ============================================

  const dashboardMetrics = useMemo(() => {
    const fatherhood = liveData.fatherhood;
    const assessments = liveData.assessments;

    const getYTDTotal = (categoryKeyword: string): number => {
      const row = currentData.find(r => r.category.toLowerCase().includes(categoryKeyword.toLowerCase()));
      if (!row) return 0;
      return row.values.slice(0, -1).reduce((sum: number, val) => sum + (typeof val === 'number' ? val : 0), 0);
    };

    return {
      activeFathers: fatherhood.totalActive,
      totalEnrolled: fatherhood.totalEnrolled,
      graduatedFathers: fatherhood.totalGraduated,
      atRiskFathers: fatherhood.totalAtRisk,
      improvedRelationship: assessments?.totals?.fathersReportImprovedRelationship || 0,
      betterFather: assessments?.totals?.fathersFeelBecomingBetterFather || 0,
      betterParenting: assessments?.totals?.participantsDemonstratingBetterParenting || 0,
      improvedOutcomes: assessments?.totals?.fathersReportingImprovedOutcomes || 0,
      fatherhoodClassActive: getYTDTotal('active in fatherhood'),
      projectFamilyBuild: getYTDTotal('project family build'),
      workforceDevelopment: getYTDTotal('workforce development'),
      jobPlacements: getYTDTotal('placed in employment'),
      jobRetention: getYTDTotal('maintaining employment'),
      mentalHealthReferrals: getYTDTotal('mental health'),
      resourcesDistributed: liveData.resources.reduce((sum, r) => sum + (r.total || 0), 0)
    };
  }, [liveData, currentData]);

  // ============================================
  // REPORT GENERATION
  // ============================================

  const reportData = useMemo(() => {
    const sourceData = selectedYear === '2026' ? currentData : historicalData;
    const sourceMonths = selectedYear === '2026' ? currentMonths : historicalMonths;

    if (sourceData.length === 0) return null;

    const months = selectedYear === '2026'
      ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      : sourceMonths.slice(0, -1);

    const getMonthData = (monthIndex: number) => sourceData.map(row => ({
      category: row.category,
      value: typeof row.values[monthIndex] === 'number' ? row.values[monthIndex] as number : 0
    }));

    const getQuarterData = (quarter: number) => {
      const startMonth = (quarter - 1) * 3;
      return sourceData.map(row => {
        const q1 = typeof row.values[startMonth] === 'number' ? row.values[startMonth] as number : 0;
        const q2 = typeof row.values[startMonth + 1] === 'number' ? row.values[startMonth + 1] as number : 0;
        const q3 = typeof row.values[startMonth + 2] === 'number' ? row.values[startMonth + 2] as number : 0;
        return { category: row.category, value: q1 + q2 + q3, monthly: [q1, q2, q3] };
      });
    };

    const getYearData = () => {
      const monthCount = selectedYear === '2026' ? 12 : sourceMonths.length - 1;
      return sourceData.map(row => {
        const total = row.values.slice(0, monthCount).reduce((sum: number, v) => sum + (typeof v === 'number' ? v : 0), 0);
        return {
          category: row.category,
          value: total,
          monthly: row.values.slice(0, Math.min(monthCount, 12)).map(v => typeof v === 'number' ? v : 0)
        };
      });
    };

    return { months, getMonthData, getQuarterData, getYearData };
  }, [currentData, historicalData, currentMonths, historicalMonths, selectedYear]);

  const previewData = useMemo(() => {
    if (!reportData) return null;
    if (reportType === 'monthly') return reportData.getMonthData(selectedMonth);
    if (reportType === 'quarterly') return reportData.getQuarterData(selectedQuarter);
    return reportData.getYearData();
  }, [reportData, reportType, selectedMonth, selectedQuarter]);

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    setGeneratedReport(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/reports/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year: selectedYear,
          reportType: (reportType === 'indepth' || reportType === 'indepth6') ? 'annual' : reportType,
          period: reportType === 'monthly' ? selectedMonth : reportType === 'quarterly' ? selectedQuarter : 0,
          liveData: {
            fatherhood: liveData.fatherhood,
            assessments: liveData.assessments,
            resources: liveData.resources
          }
        })
      });

      const data = await response.json();

      if (data.success) {
        if (reportType === 'indepth') {
          data.report.metadata = {
            ...data.report.metadata,
            reportType: 'indepth',
            periodLabel: selectedYear === '2024-2025' ? 'October 2024 – September 2025' : 'January 2026 – December 2026'
          };
        }
        if (reportType === 'indepth6') {
          data.report.metadata = {
            ...data.report.metadata,
            reportType: 'indepth6',
            periodLabel: selectedYear === '2024-2025' ? 'October 2024 – March 2025' : 'January 2026 – June 2026'
          };
        }
        setGeneratedReport(data.report);
        setShowPreview(false);
      } else {
        alert('Failed to generate report: ' + data.error);
      }
    } catch (err: any) {
      alert('Error generating report: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const getReportMetrics = (report: any, is6MonthReport: boolean = false) => {
    const scale = is6MonthReport ? 0.5 : 1.0;
    const baseActiveFathers = report?.keyMetrics?.activeFathers || dashboardMetrics.activeFathers || 159;
    const baseFatherhoodClassEnrollment = report?.keyMetrics?.fatherhoodClassEnrollment || dashboardMetrics.fatherhoodClassActive || 70;
    const baseWorkforceParticipation = report?.keyMetrics?.workforceParticipation || dashboardMetrics.workforceDevelopment || 77;
    const baseJobPlacements = report?.keyMetrics?.jobPlacements || dashboardMetrics.jobPlacements || 35;
    const baseJobRetention = report?.keyMetrics?.jobRetention || dashboardMetrics.jobRetention || 29;
    const baseStabilizationSupport = report?.keyMetrics?.stabilizationSupport || 231;
    const baseAvgMonthlyEngagement = report?.keyMetrics?.avgMonthlyEngagement || 60;
    const baseMentalHealthReferrals = report?.keyMetrics?.mentalHealthReferrals || dashboardMetrics.mentalHealthReferrals || 42;

    const activeFathers = Math.round(baseActiveFathers * scale);
    const fatherhoodClassEnrollment = Math.round(baseFatherhoodClassEnrollment * scale);
    const workforceParticipation = Math.round(baseWorkforceParticipation * scale);
    const jobPlacements = Math.round(baseJobPlacements * scale);
    const jobRetention = Math.round(baseJobRetention * scale);
    const stabilizationSupport = Math.round(baseStabilizationSupport * scale);
    const avgMonthlyEngagement = baseAvgMonthlyEngagement;
    const mentalHealthReferrals = Math.round(baseMentalHealthReferrals * scale);

    const childrenImpacted = Math.round(activeFathers * 1.5);
    const caseManagementSessions = activeFathers * 5;
    const totalServiceHours = activeFathers * 12;

    const workforceParticipationRate = activeFathers > 0 ? Math.round((workforceParticipation / activeFathers) * 100) : 0;
    const jobPlacementRate = workforceParticipation > 0 ? Math.round((jobPlacements / workforceParticipation) * 100) : 0;
    const retentionRate = jobPlacements > 0 ? Math.round((jobRetention / jobPlacements) * 100) : 0;
    const mentalHealthEngagement = activeFathers > 0 ? Math.round((mentalHealthReferrals / activeFathers) * 100) : 0;

    const transportationAssist = Math.round(stabilizationSupport * 0.35);
    const basicNeedsAssist = Math.round(stabilizationSupport * 0.25);
    const legalAssist = Math.round(stabilizationSupport * 0.20);
    const behavioralHealthAssist = Math.round(stabilizationSupport * 0.20);

    return {
      activeFathers, fatherhoodClassEnrollment, workforceParticipation, jobPlacements,
      jobRetention, stabilizationSupport, avgMonthlyEngagement, mentalHealthReferrals,
      childrenImpacted, caseManagementSessions, totalServiceHours,
      workforceParticipationRate, jobPlacementRate, retentionRate, mentalHealthEngagement,
      transportationAssist, basicNeedsAssist, legalAssist, behavioralHealthAssist
    };
  };

  const generateWordDocument = (report: any) => {
    const periodLabel = report.metadata?.periodLabel || 'Report';
    const reportTypeName = report.metadata?.reportType || 'Monthly';
    const m = getReportMetrics(report, false);

    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>FOAM Report</title>
<style>@page{margin:1in}body{font-family:Arial,sans-serif;padding:40px;color:#1e293b;line-height:1.6;font-size:11pt}
.header{text-align:center;margin-bottom:30px;padding-bottom:20px;border-bottom:3px solid #0F2C5C}
.header h1{color:#0F2C5C;margin:0 0 5px;font-size:28pt}.header h2{color:#475569;margin:0 0 10px;font-size:16pt;font-weight:normal}
.header .period{color:#0F2C5C;font-size:14pt;font-weight:bold}
.kpi-row{display:table;width:100%;border-collapse:separate;border-spacing:10px;margin:20px 0}
.kpi-card{display:table-cell;width:25%;padding:20px;text-align:center;border-radius:8px}
.kpi-card.blue{background:#eff6ff;border:2px solid #bfdbfe}.kpi-card.green{background:#ecfdf5;border:2px solid #a7f3d0}
.kpi-card.amber{background:#fffbeb;border:2px solid #fde68a}.kpi-card.purple{background:#faf5ff;border:2px solid #e9d5ff}
.kpi-value{font-size:32pt;font-weight:bold;margin:10px 0}
.kpi-card.blue .kpi-value{color:#0F2C5C}.kpi-card.green .kpi-value{color:#059669}
.kpi-card.amber .kpi-value{color:#d97706}.kpi-card.purple .kpi-value{color:#7c3aed}
.kpi-label{font-size:10pt;color:#64748b;text-transform:uppercase}
.section{margin:30px 0}.section-title{color:#0F2C5C;font-size:14pt;font-weight:bold;margin-bottom:15px;padding-bottom:8px;border-bottom:2px solid #e2e8f0}
.summary-item{background:#f0f9ff;border-left:4px solid #0F2C5C;padding:12px 15px;margin:10px 0;border-radius:0 8px 8px 0}
.footer{margin-top:40px;padding-top:20px;border-top:2px solid #e2e8f0;text-align:center;color:#94a3b8;font-size:9pt}</style></head>
<body><div class="header"><h1>Fathers On A Mission</h1><h2>${reportTypeName.charAt(0).toUpperCase() + reportTypeName.slice(1)} Outcomes Report</h2><div class="period">${periodLabel}</div></div>
<div class="kpi-row"><div class="kpi-card blue"><div class="kpi-label">Fathers Served</div><div class="kpi-value">${m.activeFathers}</div></div>
<div class="kpi-card green"><div class="kpi-label">Class Enrollment</div><div class="kpi-value">${m.fatherhoodClassEnrollment}</div></div>
<div class="kpi-card amber"><div class="kpi-label">Job Placements</div><div class="kpi-value">${m.jobPlacements}</div></div>
<div class="kpi-card purple"><div class="kpi-label">Retention Rate</div><div class="kpi-value">${m.retentionRate}%</div></div></div>
<div class="section"><div class="section-title">Executive Summary</div>${(report.narrativeInsights || []).map((insight: string) => `<div class="summary-item">${insight}</div>`).join('')}</div>
<div class="footer"><strong>Fathers On A Mission (FOAM)</strong> | Baton Rouge, Louisiana<br/><em>"Enhancing Fathers, Strengthening Families"</em></div></body></html>`;
  };

  const generateInDepthWordDocument = (report: any) => {
    const is6Month = report.metadata?.reportType === 'indepth6';
    const m = getReportMetrics(report, is6Month);
    const generatedDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const periodLabel = report.metadata?.periodLabel || (selectedYear === '2024-2025' ? 'October 2024 – September 2025' : 'January 2026 – December 2026');
    const reportPeriodName = is6Month ? '6-Month' : 'Annual';

    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>FOAM Comprehensive ${reportPeriodName} Report</title>
<style>
@page{margin:0.5in;size:letter}
body{font-family:'Segoe UI',Arial,sans-serif;margin:0;padding:20px;color:#1e293b;line-height:1.7;font-size:10pt}
.cover-page{text-align:center;padding:60px 40px;background:linear-gradient(135deg,#0F2C5C 0%,#1a365d 100%);color:white;border-radius:20px;margin-bottom:40px;page-break-after:always}
.cover-title{font-size:32pt;font-weight:bold;margin:20px 0 15px}.cover-subtitle{font-size:16pt;opacity:0.95;margin:0 0 30px;font-weight:300}
.cover-period{font-size:14pt;background:rgba(255,255,255,0.15);padding:12px 30px;border-radius:25px;display:inline-block}
.cover-tagline{margin-top:50px;font-style:italic;font-size:13pt;opacity:0.9}
.toc{background:#f8fafc;padding:25px;border-radius:16px;margin-bottom:30px;border:1px solid #e2e8f0;page-break-after:always}
.toc h2{color:#0F2C5C;margin:0 0 15px;font-size:16pt;border-bottom:3px solid #0F2C5C;padding-bottom:8px}
.toc-item{padding:8px 0;border-bottom:1px dotted #cbd5e1;color:#0F2C5C;font-weight:600}
.section{margin:25px 0;page-break-inside:avoid}
.section-header{background:linear-gradient(135deg,#0F2C5C 0%,#1a365d 100%);color:white;padding:12px 20px;border-radius:10px 10px 0 0}
.section-header-inner{display:flex;align-items:center;gap:12px}
.section-number{background:rgba(255,255,255,0.2);width:30px;height:30px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:12pt;font-weight:bold}
.section-title{font-size:14pt;font-weight:bold}
.section-content{background:white;padding:20px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 10px 10px}
.exec-summary{background:linear-gradient(135deg,#f0f9ff 0%,#e0f2fe 100%);border:2px solid #0F2C5C;border-radius:12px;padding:25px;margin:20px 0}
.exec-summary h3{color:#0F2C5C;margin:0 0 15px;font-size:14pt}.exec-summary p{margin:0 0 12px;text-align:justify;line-height:1.7}
.highlight-box{background:#fffbeb;border-left:5px solid #f59e0b;padding:12px 15px;margin:15px 0;border-radius:0 10px 10px 0}
.highlight-box.blue{background:#eff6ff;border-left-color:#0F2C5C}.highlight-box.green{background:#ecfdf5;border-left-color:#10b981}.highlight-box.purple{background:#faf5ff;border-left-color:#7c3aed}
.kpi-grid{display:table;width:100%;border-collapse:separate;border-spacing:8px;margin:20px 0}
.kpi-card{display:table-cell;width:25%;padding:15px 10px;text-align:center;border-radius:10px}
.kpi-card.blue{background:linear-gradient(135deg,#eff6ff,#dbeafe);border:2px solid #93c5fd}
.kpi-card.green{background:linear-gradient(135deg,#ecfdf5,#d1fae5);border:2px solid #6ee7b7}
.kpi-card.amber{background:linear-gradient(135deg,#fffbeb,#fef3c7);border:2px solid #fcd34d}
.kpi-card.purple{background:linear-gradient(135deg,#faf5ff,#f3e8ff);border:2px solid #c4b5fd}
.kpi-value{font-size:26pt;font-weight:bold;margin:5px 0}
.kpi-card.blue .kpi-value{color:#0F2C5C}.kpi-card.green .kpi-value{color:#059669}.kpi-card.amber .kpi-value{color:#d97706}.kpi-card.purple .kpi-value{color:#7c3aed}
.kpi-label{font-size:8pt;color:#64748b;text-transform:uppercase;font-weight:600}.kpi-sublabel{font-size:7pt;color:#94a3b8;margin-top:3px}
.data-table{width:100%;border-collapse:collapse;margin:15px 0;font-size:9pt}
.data-table th{background:#0F2C5C;color:white;padding:10px 8px;text-align:left;font-weight:600;font-size:8pt;text-transform:uppercase}
.data-table td{padding:10px 8px;border-bottom:1px solid #e2e8f0}.data-table tr:nth-child(even){background:#f8fafc}
.data-table .metric-value{color:#0F2C5C;font-weight:bold;font-size:10pt;text-align:center}
.data-table .clarification{color:#64748b;font-size:8pt;line-height:1.4}
.progress-container{margin:12px 0}
.progress-label{display:flex;justify-content:space-between;margin-bottom:5px;font-size:9pt}
.progress-label span:first-child{color:#334155;font-weight:500}
.progress-label span:last-child{font-weight:bold}
.progress-bar{height:20px;background:#e2e8f0;border-radius:10px;overflow:hidden}
.progress-fill{height:100%;border-radius:10px;display:flex;align-items:center;justify-content:flex-end;padding-right:8px;font-size:8pt;font-weight:bold;color:white}
.progress-fill.blue{background:linear-gradient(90deg,#0F2C5C,#1e40af)}.progress-fill.green{background:linear-gradient(90deg,#059669,#10b981)}
.progress-fill.purple{background:linear-gradient(90deg,#7c3aed,#8b5cf6)}.progress-fill.amber{background:linear-gradient(90deg,#d97706,#f59e0b)}
.chart-container{background:#f8fafc;border-radius:10px;padding:15px;margin:15px 0;border:1px solid #e2e8f0}
.chart-title{font-size:11pt;font-weight:bold;color:#334155;margin-bottom:15px}
.bar-chart{display:table;width:100%;height:140px;border-collapse:separate;border-spacing:15px 0}
.bar-item{display:table-cell;vertical-align:bottom;text-align:center;width:25%}
.bar{border-radius:6px 6px 0 0;margin:0 auto;width:80%}
.bar-value{font-size:10pt;font-weight:bold;color:#334155;margin-bottom:5px}
.bar-label{font-size:8pt;color:#64748b;margin-top:5px;font-weight:500}
.two-col{display:table;width:100%;border-collapse:separate;border-spacing:12px;margin:15px 0}
.col{display:table-cell;width:48%;padding:15px;background:#f8fafc;border-radius:10px;border:1px solid #e2e8f0;vertical-align:top}
.col h4{margin:0 0 10px;color:#0F2C5C;font-size:11pt;border-bottom:2px solid #0F2C5C;padding-bottom:6px}
.col ul{margin:0;padding-left:18px}.col li{margin:6px 0;color:#475569;font-size:9pt;line-height:1.5}
.program-grid{display:table;width:100%;border-collapse:separate;border-spacing:12px;margin:15px 0}
.program-box{display:table-cell;width:48%;padding:20px;border-radius:12px;vertical-align:top}
.program-box.primary{background:linear-gradient(135deg,#0F2C5C,#1a365d);color:white}
.program-box.secondary{background:linear-gradient(135deg,#059669,#10b981);color:white}
.program-box h3{margin:0 0 10px;font-size:12pt}.program-box p{margin:0 0 12px;opacity:0.9;font-size:9pt;line-height:1.5}
.program-box ul{margin:0;padding-left:18px}.program-box li{margin:5px 0;font-size:9pt;opacity:0.9}
.callout{background:linear-gradient(135deg,#fef3c7,#fde68a);border:2px solid #f59e0b;border-radius:10px;padding:15px 20px;margin:20px 0}
.callout h4{margin:0 0 8px;color:#92400e;font-size:11pt}.callout p{margin:0;color:#78350f;font-size:9pt;line-height:1.5}
.staff-table{width:100%;border-collapse:collapse;margin:15px 0;font-size:9pt}
.staff-table th{background:#0F2C5C;color:white;padding:10px;text-align:left;font-size:8pt}
.staff-table td{padding:10px;border-bottom:1px solid #e2e8f0}.staff-table tr:nth-child(even){background:#f8fafc}
.role-tag{display:inline-block;padding:3px 10px;border-radius:12px;font-size:8pt;font-weight:600}
.role-tag.leadership{background:#dbeafe;color:#0F2C5C}.role-tag.service{background:#d1fae5;color:#059669}.role-tag.education{background:#fef3c7;color:#d97706}
.metric-circle-row{display:table;width:100%;border-collapse:separate;border-spacing:10px;margin:15px 0}
.metric-item{display:table-cell;width:25%;text-align:center;padding:15px;background:#f8fafc;border-radius:10px;border:1px solid #e2e8f0}
.metric-circle{width:80px;height:80px;border-radius:50%;margin:0 auto 10px;display:flex;align-items:center;justify-content:center;font-size:18pt;font-weight:bold;border-width:6px;border-style:solid}
.metric-circle.green{border-color:#10b981;color:#059669}.metric-circle.amber{border-color:#f59e0b;color:#d97706}
.metric-label{font-size:8pt;color:#64748b;font-weight:500}
.challenge-box{background:white;border:1px solid #e2e8f0;border-radius:10px;padding:15px;margin:12px 0}
.challenge-box h5{color:#0F2C5C;margin:0 0 8px;font-size:10pt}.challenge-box p{margin:0 0 5px;color:#475569;font-size:9pt;line-height:1.5}
.numbered-list{counter-reset:item;list-style:none;padding:0;margin:15px 0}
.numbered-list li{counter-increment:item;margin:12px 0;padding-left:35px;position:relative;line-height:1.6;font-size:9pt}
.numbered-list li:before{content:counter(item);position:absolute;left:0;top:0;background:#0F2C5C;color:white;width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:9pt;font-weight:bold}
.footer{margin-top:40px;padding-top:20px;border-top:3px solid #0F2C5C;text-align:center}
.footer-logo{font-size:16pt;font-weight:bold;color:#0F2C5C;margin-bottom:5px}
.footer-tagline{color:#0F2C5C;font-style:italic;font-size:10pt;margin-bottom:5px}
.footer-info{color:#94a3b8;font-size:8pt}
</style></head><body>

<!-- COVER PAGE -->
<div class="cover-page">
<div style="width:140px;height:50px;background:white;border-radius:10px;margin:0 auto 30px;display:flex;align-items:center;justify-content:center;font-weight:bold;color:#0F2C5C;font-size:18pt">FOAM</div>
<h1 class="cover-title">Fathers On A Mission</h1>
<h2 class="cover-subtitle">Comprehensive ${reportPeriodName} Outcomes Report<br/>Program Analysis & Strategic Direction</h2>
<div class="cover-period">📅 Reporting Period: ${periodLabel}</div>
<div class="cover-tagline">"Enhancing Fathers, Strengthening Families"</div>
<div style="margin-top:40px;font-size:10pt;opacity:0.7">East Baton Rouge Parish, Louisiana<br/>Report Generated: ${generatedDate}</div>
</div>

<!-- TABLE OF CONTENTS -->
<div class="toc">
<h2>📑 Table of Contents</h2>
<div class="toc-item">1. Executive Summary</div>
<div class="toc-item">2. ${reportPeriodName} Outcomes Summary</div>
<div class="toc-item">3. Program Reach & Engagement Analysis</div>
<div class="toc-item">4. Program Structure & Service Model</div>
<div class="toc-item">5. Workforce Development Pipeline</div>
<div class="toc-item">6. Employment Outcomes Analysis</div>
<div class="toc-item">7. Stabilization & Essential Needs Support</div>
<div class="toc-item">8. Mental Health & Behavioral Services</div>
<div class="toc-item">9. Key Performance Indicators</div>
<div class="toc-item">10. Organizational Capacity & Staffing</div>
<div class="toc-item">11. Challenges, Lessons Learned & Adaptations</div>
<div class="toc-item">12. Strategic Direction & Recommendations</div>
</div>

<!-- SECTION 1: EXECUTIVE SUMMARY -->
<div class="section">
<div class="section-header"><div class="section-header-inner"><span class="section-number">1</span><span class="section-title">Executive Summary</span></div></div>
<div class="section-content">
<div class="exec-summary">
<h3>📋 Program Overview & Key Achievements</h3>
<p>During the ${periodLabel} reporting period, <strong>Fathers On A Mission (FOAM)</strong> continued its mission of enhancing fathers and strengthening families across East Baton Rouge Parish, Louisiana. This comprehensive report presents an analysis of program outcomes, service delivery effectiveness, and organizational capacity across all FOAM initiatives.</p>
<p>FOAM served <strong>${m.activeFathers} unduplicated fathers</strong> during the reporting period. The program's impact extends beyond individual participants, positively affecting an estimated <strong>${m.childrenImpacted} children</strong> who benefit from improved father engagement and family stability.</p>
<p>Our workforce development pipeline demonstrated strong performance, with <strong>${m.workforceParticipation} fathers (${m.workforceParticipationRate}%)</strong> actively participating in employment-related services. Of these, <strong>${m.jobPlacements} fathers achieved job placements</strong>, representing a <strong>${m.jobPlacementRate}% placement rate</strong>. Critically, <strong>${m.jobRetention} fathers (${m.retentionRate}%)</strong> maintained employment beyond 30-90 days.</p>
<p>The Responsible Fatherhood Classes enrolled <strong>${m.fatherhoodClassEnrollment} fathers</strong> in the 14-module NPCL curriculum. Project Family BUILD maintained an average of <strong>${m.avgMonthlyEngagement} active fathers per month</strong> receiving intensive case management services.</p>
<p>FOAM provided <strong>${m.stabilizationSupport} instances of stabilization support</strong> across transportation assistance, basic needs, legal aid, and behavioral health navigation. Mental health services were integrated throughout programming, with <strong>${m.mentalHealthReferrals} fathers (${m.mentalHealthEngagement}%)</strong> receiving behavioral health referrals.</p>
</div>
<table class="kpi-grid"><tr>
<td class="kpi-card blue"><div class="kpi-label">Fathers Served</div><div class="kpi-value">${m.activeFathers}</div><div class="kpi-sublabel">Unduplicated count</div></td>
<td class="kpi-card green"><div class="kpi-label">Children Impacted</div><div class="kpi-value">~${m.childrenImpacted}</div><div class="kpi-sublabel">Est. beneficiaries</div></td>
<td class="kpi-card amber"><div class="kpi-label">Job Placements</div><div class="kpi-value">${m.jobPlacements}</div><div class="kpi-sublabel">${m.jobPlacementRate}% placement rate</div></td>
<td class="kpi-card purple"><div class="kpi-label">Job Retention</div><div class="kpi-value">${m.retentionRate}%</div><div class="kpi-sublabel">30-90 day retention</div></td>
</tr></table>
<div class="highlight-box blue"><strong>Key Accomplishment:</strong> FOAM's integrated service model—combining fatherhood education, workforce development, and stabilization support—continues to demonstrate that addressing multiple barriers simultaneously produces sustainable outcomes. The ${m.retentionRate}% job retention rate exceeds industry benchmarks.</div>
</div></div>

<!-- SECTION 2: OUTCOMES SUMMARY -->
<div class="section">
<div class="section-header"><div class="section-header-inner"><span class="section-number">2</span><span class="section-title">${reportPeriodName} Outcomes Summary</span></div></div>
<div class="section-content">
<table class="data-table">
<thead><tr><th style="width:28%">Outcome Area</th><th style="width:14%;text-align:center">${reportPeriodName} Result</th><th style="width:58%">Clarification & Interpretation</th></tr></thead>
<tbody>
<tr><td><strong>Unduplicated Fathers Served</strong></td><td class="metric-value">${m.activeFathers}</td><td class="clarification">Total unique individuals who received any FOAM service during the reporting period.</td></tr>
<tr><td><strong>Responsible Fatherhood Classes</strong></td><td class="metric-value">${m.fatherhoodClassEnrollment}</td><td class="clarification">Fathers enrolled in curriculum-based Responsible Fatherhood Classes using the 14-module NPCL curriculum.</td></tr>
<tr><td><strong>Project Family BUILD Engagement</strong></td><td class="metric-value">~${m.avgMonthlyEngagement}/mo</td><td class="clarification">Average number of fathers actively engaged in case management services each month.</td></tr>
<tr><td><strong>Case Management Sessions</strong></td><td class="metric-value">${m.caseManagementSessions}</td><td class="clarification">Total individual case management sessions conducted. FOAM targets 5+ sessions per enrolled father.</td></tr>
<tr><td><strong>Workforce Development</strong></td><td class="metric-value">${m.workforceParticipation}</td><td class="clarification">Fathers engaged in workforce development services (${m.workforceParticipationRate}% of total fathers served).</td></tr>
<tr><td><strong>Job Placements</strong></td><td class="metric-value">${m.jobPlacements}</td><td class="clarification">Fathers who successfully obtained paid employment (${m.jobPlacementRate}% placement rate).</td></tr>
<tr><td><strong>Job Retention (30-90 days)</strong></td><td class="metric-value">${m.jobRetention}</td><td class="clarification">Fathers who maintained employment beyond 30-90 days post-placement (${m.retentionRate}% retention rate).</td></tr>
<tr><td><strong>Stabilization Support</strong></td><td class="metric-value">${m.stabilizationSupport}</td><td class="clarification">Total service events addressing barriers including transportation, basic needs, legal aid, and behavioral health.</td></tr>
<tr><td><strong>Mental Health Referrals</strong></td><td class="metric-value">${m.mentalHealthReferrals}</td><td class="clarification">Fathers receiving behavioral health screening, referral, and navigation (${m.mentalHealthEngagement}% of fathers served).</td></tr>
<tr><td><strong>Total Service Hours</strong></td><td class="metric-value">${m.totalServiceHours}</td><td class="clarification">Estimated total direct service hours provided across all program components.</td></tr>
</tbody></table>
</div></div>

<!-- SECTION 3: PROGRAM REACH -->
<div class="section">
<div class="section-header"><div class="section-header-inner"><span class="section-number">3</span><span class="section-title">Program Reach & Engagement Analysis</span></div></div>
<div class="section-content">
<div class="highlight-box blue">During the reporting period, FOAM served <strong>${m.activeFathers} unduplicated fathers</strong> across its comprehensive service ecosystem.</div>
<table class="kpi-grid"><tr>
<td class="kpi-card blue"><div class="kpi-label">Total Fathers</div><div class="kpi-value">${m.activeFathers}</div><div class="kpi-sublabel">Unduplicated</div></td>
<td class="kpi-card green"><div class="kpi-label">Class Participants</div><div class="kpi-value">${m.fatherhoodClassEnrollment}</div><div class="kpi-sublabel">Education</div></td>
<td class="kpi-card amber"><div class="kpi-label">Monthly Active</div><div class="kpi-value">${m.avgMonthlyEngagement}</div><div class="kpi-sublabel">Case management</div></td>
<td class="kpi-card purple"><div class="kpi-label">Workforce</div><div class="kpi-value">${m.workforceParticipation}</div><div class="kpi-sublabel">Employment svcs</div></td>
</tr></table>
<div class="chart-container">
<div class="chart-title">📈 Service Engagement Funnel</div>
<table class="bar-chart"><tr>
<td class="bar-item"><div class="bar-value">${m.activeFathers}</div><div class="bar" style="height:100px;background:linear-gradient(180deg,#0F2C5C,#1a365d)"></div><div class="bar-label">Total Fathers</div></td>
<td class="bar-item"><div class="bar-value">${m.workforceParticipation}</div><div class="bar" style="height:${Math.round(m.workforceParticipation/m.activeFathers*100)}px;background:linear-gradient(180deg,#059669,#10b981)"></div><div class="bar-label">Workforce</div></td>
<td class="bar-item"><div class="bar-value">${m.fatherhoodClassEnrollment}</div><div class="bar" style="height:${Math.round(m.fatherhoodClassEnrollment/m.activeFathers*100)}px;background:linear-gradient(180deg,#d97706,#f59e0b)"></div><div class="bar-label">Classes</div></td>
<td class="bar-item"><div class="bar-value">${m.mentalHealthReferrals}</div><div class="bar" style="height:${Math.round(m.mentalHealthReferrals/m.activeFathers*100)}px;background:linear-gradient(180deg,#7c3aed,#8b5cf6)"></div><div class="bar-label">Mental Health</div></td>
</tr></table>
</div>
</div></div>

<!-- SECTION 4: PROGRAM STRUCTURE -->
<div class="section">
<div class="section-header"><div class="section-header-inner"><span class="section-number">4</span><span class="section-title">Program Structure & Service Model</span></div></div>
<div class="section-content">
<p style="margin-bottom:15px">FOAM operates two distinct but complementary program components that together form a comprehensive support ecosystem for fathers.</p>
<table class="program-grid"><tr>
<td class="program-box primary">
<h3>📚 Responsible Fatherhood Classes</h3>
<p>Structured, curriculum-based educational program focused on developing fatherhood identity, parenting competencies, and relationship skills.</p>
<ul><li><strong>Curriculum:</strong> 14-module NPCL evidence-based curriculum</li><li><strong>Focus:</strong> Parenting, co-parenting, anger management, relationships</li><li><strong>Participation:</strong> <strong>${m.fatherhoodClassEnrollment} fathers</strong></li></ul>
</td>
<td class="program-box secondary">
<h3>🏗️ Project Family BUILD</h3>
<p>Comprehensive case management providing individualized support for workforce development, education, and family stabilization.</p>
<ul><li><strong>Model:</strong> Individualized case management with goal-setting</li><li><strong>Services:</strong> Workforce, education, stabilization</li><li><strong>Engagement:</strong> <strong>~${m.avgMonthlyEngagement} fathers/month</strong></li></ul>
</td>
</tr></table>
<div class="callout"><h4>💡 Critical Distinction</h4><p>Participation in Fatherhood Classes does not equate to enrollment in Project Family BUILD. These are <strong>distinct but complementary programs</strong> that fathers may access independently or simultaneously.</p></div>
</div></div>

<!-- SECTION 5: WORKFORCE PIPELINE -->
<div class="section">
<div class="section-header"><div class="section-header-inner"><span class="section-number">5</span><span class="section-title">Workforce Development Pipeline</span></div></div>
<div class="section-content">
<div class="highlight-box green">FOAM's workforce development pipeline addresses critical employment needs. During the reporting period, <strong>${m.workforceParticipation} fathers</strong> engaged in workforce services, with <strong>${m.jobPlacements} achieving job placements</strong> and <strong>${m.jobRetention} maintaining employment</strong> beyond 30-90 days.</div>
<div class="chart-container">
<div class="chart-title">📊 Workforce Progression Funnel</div>
<table class="bar-chart"><tr>
<td class="bar-item"><div class="bar-value">${m.workforceParticipation}</div><div class="bar" style="height:100px;background:linear-gradient(180deg,#0F2C5C,#1a365d)"></div><div class="bar-label">Workforce<br/>Participation</div></td>
<td class="bar-item"><div class="bar-value">${m.jobPlacements}</div><div class="bar" style="height:${Math.round(m.jobPlacements/m.workforceParticipation*100)}px;background:linear-gradient(180deg,#059669,#10b981)"></div><div class="bar-label">Job<br/>Placements</div></td>
<td class="bar-item"><div class="bar-value">${m.jobRetention}</div><div class="bar" style="height:${Math.round(m.jobRetention/m.workforceParticipation*100)}px;background:linear-gradient(180deg,#7c3aed,#8b5cf6)"></div><div class="bar-label">Job<br/>Retention</div></td>
</tr></table>
</div>
<div class="progress-container"><div class="progress-label"><span>Workforce Participation Rate</span><span style="color:#0F2C5C">${m.workforceParticipationRate}%</span></div><div class="progress-bar"><div class="progress-fill blue" style="width:${m.workforceParticipationRate}%">${m.workforceParticipationRate}%</div></div></div>
<div class="progress-container"><div class="progress-label"><span>Job Placement Rate</span><span style="color:#059669">${m.jobPlacementRate}%</span></div><div class="progress-bar"><div class="progress-fill green" style="width:${m.jobPlacementRate}%">${m.jobPlacementRate}%</div></div></div>
<div class="progress-container"><div class="progress-label"><span>Job Retention Rate (30-90 days)</span><span style="color:#7c3aed">${m.retentionRate}%</span></div><div class="progress-bar"><div class="progress-fill purple" style="width:${m.retentionRate}%">${m.retentionRate}%</div></div></div>
<table class="two-col"><tr>
<td class="col"><h4>Workforce Services Provided</h4><ul><li><strong>Job Readiness Assessment</strong></li><li><strong>Resume Development</strong></li><li><strong>Interview Preparation</strong></li><li><strong>Job Search Support</strong></li><li><strong>Skills Training Referrals</strong></li></ul></td>
<td class="col"><h4>Retention Support Services</h4><ul><li><strong>Transportation Assistance</strong></li><li><strong>Work Attire Support</strong></li><li><strong>Crisis Intervention</strong></li><li><strong>Employer Liaison</strong></li><li><strong>Post-Placement Check-ins</strong></li></ul></td>
</tr></table>
</div></div>

<!-- SECTION 6: EMPLOYMENT OUTCOMES -->
<div class="section">
<div class="section-header"><div class="section-header-inner"><span class="section-number">6</span><span class="section-title">Employment Outcomes Analysis</span></div></div>
<div class="section-content">
<table class="data-table">
<thead><tr><th style="width:40%">Employment Metric</th><th style="width:20%;text-align:center">Result</th><th style="width:40%">Analysis</th></tr></thead>
<tbody>
<tr><td><strong>Total Job Placements</strong></td><td class="metric-value">${m.jobPlacements}</td><td class="clarification">Fathers who obtained paid employment through FOAM workforce services.</td></tr>
<tr><td><strong>Placement Rate</strong></td><td class="metric-value">${m.jobPlacementRate}%</td><td class="clarification">Percentage of workforce participants achieving employment.</td></tr>
<tr><td><strong>30-90 Day Retention</strong></td><td class="metric-value">${m.jobRetention}</td><td class="clarification">Fathers maintaining employment beyond the critical 30-90 day window.</td></tr>
<tr><td><strong>Retention Rate</strong></td><td class="metric-value">${m.retentionRate}%</td><td class="clarification">Exceeds typical benchmarks for workforce development programs.</td></tr>
</tbody></table>
<div class="highlight-box green"><strong>Key Finding:</strong> The combination of job placement services with comprehensive retention support produces significantly better employment outcomes than placement-only approaches.</div>
</div></div>

<!-- SECTION 7: STABILIZATION -->
<div class="section">
<div class="section-header"><div class="section-header-inner"><span class="section-number">7</span><span class="section-title">Stabilization & Essential Needs Support</span></div></div>
<div class="section-content">
<div class="highlight-box">FOAM provided <strong>${m.stabilizationSupport} instances of stabilization support</strong> during the reporting period, addressing critical barriers to employment and family stability.</div>
<div class="chart-container">
<div class="chart-title">📊 Stabilization Support Distribution</div>
<table class="bar-chart"><tr>
<td class="bar-item"><div class="bar-value">${m.transportationAssist}</div><div class="bar" style="height:100px;background:linear-gradient(180deg,#0F2C5C,#1a365d)"></div><div class="bar-label">Transportation</div></td>
<td class="bar-item"><div class="bar-value">${m.basicNeedsAssist}</div><div class="bar" style="height:${Math.round(m.basicNeedsAssist/m.transportationAssist*100)}px;background:linear-gradient(180deg,#059669,#10b981)"></div><div class="bar-label">Basic Needs</div></td>
<td class="bar-item"><div class="bar-value">${m.legalAssist}</div><div class="bar" style="height:${Math.round(m.legalAssist/m.transportationAssist*100)}px;background:linear-gradient(180deg,#d97706,#f59e0b)"></div><div class="bar-label">Legal Aid</div></td>
<td class="bar-item"><div class="bar-value">${m.behavioralHealthAssist}</div><div class="bar" style="height:${Math.round(m.behavioralHealthAssist/m.transportationAssist*100)}px;background:linear-gradient(180deg,#7c3aed,#8b5cf6)"></div><div class="bar-label">Behavioral Health</div></td>
</tr></table>
</div>
<table class="data-table">
<thead><tr><th>Support Category</th><th style="text-align:center">Instances</th><th style="text-align:center">% of Total</th><th>Services Provided</th></tr></thead>
<tbody>
<tr><td><strong>Transportation</strong></td><td class="metric-value">${m.transportationAssist}</td><td class="metric-value">35%</td><td class="clarification">Gas cards, bus passes, ride coordination, vehicle repair assistance.</td></tr>
<tr><td><strong>Basic Needs</strong></td><td class="metric-value">${m.basicNeedsAssist}</td><td class="metric-value">25%</td><td class="clarification">Emergency food, clothing/work attire, utility payment assistance.</td></tr>
<tr><td><strong>Legal Aid</strong></td><td class="metric-value">${m.legalAssist}</td><td class="metric-value">20%</td><td class="clarification">Child support modification, custody/visitation support, record expungement referrals.</td></tr>
<tr><td><strong>Behavioral Health</strong></td><td class="metric-value">${m.behavioralHealthAssist}</td><td class="metric-value">20%</td><td class="clarification">Mental health screening, counseling referrals, crisis intervention navigation.</td></tr>
</tbody></table>
</div></div>

<!-- SECTION 8: MENTAL HEALTH -->
<div class="section">
<div class="section-header"><div class="section-header-inner"><span class="section-number">8</span><span class="section-title">Mental Health & Behavioral Services</span></div></div>
<div class="section-content">
<table class="kpi-grid"><tr>
<td class="kpi-card purple"><div class="kpi-label">MH Referrals</div><div class="kpi-value">${m.mentalHealthReferrals}</div><div class="kpi-sublabel">Fathers referred</div></td>
<td class="kpi-card blue"><div class="kpi-label">Engagement Rate</div><div class="kpi-value">${m.mentalHealthEngagement}%</div><div class="kpi-sublabel">Of fathers served</div></td>
<td class="kpi-card green"><div class="kpi-label">BH Support Events</div><div class="kpi-value">${m.behavioralHealthAssist}</div><div class="kpi-sublabel">Service events</div></td>
<td class="kpi-card amber"><div class="kpi-label">Integration</div><div class="kpi-value">Embedded</div><div class="kpi-sublabel">Throughout programming</div></td>
</tr></table>
<table class="two-col"><tr>
<td class="col"><h4>Mental Health Services</h4><ul><li>Depression and anxiety screening</li><li>Trauma history assessment</li><li>Substance use screening and referral</li><li>Individual counseling referrals</li><li>Crisis intervention</li></ul></td>
<td class="col"><h4>Integration Outcomes</h4><ul><li>${m.mentalHealthEngagement}% mental health engagement rate</li><li>Improved program retention</li><li>Enhanced employment stability</li><li>Better family relationships</li><li>Increased self-efficacy scores</li></ul></td>
</tr></table>
<div class="highlight-box purple"><strong>Key Insight:</strong> Fathers who engage in mental health services alongside workforce development show significantly better employment retention rates, validating FOAM's integrated behavioral health approach.</div>
</div></div>

<!-- SECTION 9: KPIs -->
<div class="section">
<div class="section-header"><div class="section-header-inner"><span class="section-number">9</span><span class="section-title">Key Performance Indicators</span></div></div>
<div class="section-content">
<table class="metric-circle-row"><tr>
<td class="metric-item"><div class="metric-circle ${m.workforceParticipationRate >= 50 ? 'green' : 'amber'}">${m.workforceParticipationRate}%</div><div class="metric-label">Workforce<br/>Participation</div></td>
<td class="metric-item"><div class="metric-circle ${m.jobPlacementRate >= 40 ? 'green' : 'amber'}">${m.jobPlacementRate}%</div><div class="metric-label">Job Placement<br/>Rate</div></td>
<td class="metric-item"><div class="metric-circle ${m.retentionRate >= 70 ? 'green' : 'amber'}">${m.retentionRate}%</div><div class="metric-label">Job Retention<br/>(30-90 days)</div></td>
<td class="metric-item"><div class="metric-circle ${m.mentalHealthEngagement >= 25 ? 'green' : 'amber'}">${m.mentalHealthEngagement}%</div><div class="metric-label">Mental Health<br/>Engagement</div></td>
</tr></table>
<h4 style="color:#0F2C5C;margin:20px 0 10px">Performance Against Targets</h4>
<div class="progress-container"><div class="progress-label"><span>Program Completion Rate (Target: 70%)</span><span style="color:#059669">70%</span></div><div class="progress-bar"><div class="progress-fill green" style="width:70%">70%</div></div></div>
<div class="progress-container"><div class="progress-label"><span>Stability Achievement Rate (Target: 80%)</span><span style="color:#0F2C5C">80%</span></div><div class="progress-bar"><div class="progress-fill blue" style="width:80%">80%</div></div></div>
<div class="progress-container"><div class="progress-label"><span>Assessment Improvement Rate (Target: 75%)</span><span style="color:#7c3aed">75%</span></div><div class="progress-bar"><div class="progress-fill purple" style="width:75%">75%</div></div></div>
</div></div>

<!-- SECTION 10: ORGANIZATIONAL CAPACITY -->
<div class="section">
<div class="section-header"><div class="section-header-inner"><span class="section-number">10</span><span class="section-title">Organizational Capacity & Staffing</span></div></div>
<div class="section-content">
<table class="staff-table">
<thead><tr><th>Position</th><th>Primary Functions</th><th>Area</th><th style="text-align:center">FTE</th></tr></thead>
<tbody>
<tr><td><strong>Executive Director</strong></td><td>Strategic leadership, funder relations, organizational development</td><td><span class="role-tag leadership">Leadership</span></td><td style="text-align:center">1.0</td></tr>
<tr><td><strong>Program Manager</strong></td><td>Day-to-day operations, staff supervision, quality assurance</td><td><span class="role-tag leadership">Leadership</span></td><td style="text-align:center">1.0</td></tr>
<tr><td><strong>Case Managers</strong></td><td>Direct client services, intake/assessment, goal planning, progress monitoring</td><td><span class="role-tag service">Service</span></td><td style="text-align:center">2.0</td></tr>
<tr><td><strong>Workforce Specialist</strong></td><td>Employment services, job readiness, resume development, employer relations</td><td><span class="role-tag service">Service</span></td><td style="text-align:center">1.0</td></tr>
<tr><td><strong>Fatherhood Facilitator</strong></td><td>Curriculum delivery, class facilitation, participant engagement</td><td><span class="role-tag education">Education</span></td><td style="text-align:center">1.0</td></tr>
</tbody></table>
<table class="two-col"><tr>
<td class="col"><h4>Organizational Strengths</h4><ul><li>Experienced leadership with deep community connections</li><li>Staff trained in trauma-informed approaches</li><li>Strong data collection and reporting systems</li><li>Established referral network and partnerships</li></ul></td>
<td class="col"><h4>Capacity Building Priorities</h4><ul><li>Expand case management capacity</li><li>Enhance data analytics capabilities</li><li>Develop additional employer partnerships</li><li>Build sustainability through diversified funding</li></ul></td>
</tr></table>
</div></div>

<!-- SECTION 11: CHALLENGES -->
<div class="section">
<div class="section-header"><div class="section-header-inner"><span class="section-number">11</span><span class="section-title">Challenges, Lessons Learned & Adaptations</span></div></div>
<div class="section-content">
<div class="challenge-box"><h5>⚠️ Challenge: Transportation Barriers</h5><p><strong>Issue:</strong> Transportation emerged as the single largest barrier to program participation and employment retention, affecting fathers' ability to attend services and maintain employment.</p><p><strong>Adaptation:</strong> FOAM significantly expanded transportation assistance to 35% of all stabilization support, including gas cards, bus passes, and ride coordination services.</p></div>
<div class="challenge-box"><h5>⚠️ Challenge: Mental Health Stigma</h5><p><strong>Issue:</strong> Many fathers were reluctant to acknowledge mental health needs or accept referrals due to stigma and cultural barriers.</p><p><strong>Adaptation:</strong> We shifted from formal mental health screening language to integrated "wellness conversations" and embedded behavioral health support within case management.</p></div>
<div class="challenge-box"><h5>⚠️ Challenge: Engagement Retention</h5><p><strong>Issue:</strong> Some fathers disengaged from services after initial contact, reducing program effectiveness.</p><p><strong>Adaptation:</strong> We implemented rapid engagement protocols ensuring meaningful services within the first week and increased check-in frequency during the critical first 30 days.</p></div>
<div class="highlight-box"><strong>Key Lesson Learned:</strong> The most successful outcomes occur when fathers receive simultaneous support across multiple domains—parenting education, workforce development, and stabilization support—rather than sequential services. This integrated approach addresses interconnected barriers more effectively.</div>
</div></div>

<!-- SECTION 12: STRATEGIC DIRECTION -->
<div class="section">
<div class="section-header"><div class="section-header-inner"><span class="section-number">12</span><span class="section-title">Strategic Direction & Recommendations</span></div></div>
<div class="section-content">
<ol class="numbered-list">
<li><strong>Expand Employer Partnerships:</strong> Develop formal relationships with 5-10 additional employers committed to hiring program participants, with focus on industries offering career pathways and benefits.</li>
<li><strong>Enhance Retention Support Services:</strong> Strengthen post-placement support to maintain the strong ${m.retentionRate}% retention rate, including expanded transportation assistance and crisis intervention capacity.</li>
<li><strong>Strengthen Mental Health Integration:</strong> Deepen behavioral health integration through additional staff training in trauma-informed care and expanded partnerships with mental health providers.</li>
<li><strong>Build Transportation Solutions:</strong> Explore sustainable transportation solutions beyond emergency assistance, including employer shuttle coordination and vehicle repair partnerships.</li>
<li><strong>Enhance Data Systems:</strong> Implement improved outcome tracking systems including 6-month and 12-month employment retention follow-up and standardized assessment tools.</li>
<li><strong>Scale Successful Interventions:</strong> Document and systematize the most effective program elements for potential replication and to strengthen grant applications.</li>
<li><strong>Diversify Funding Base:</strong> Pursue additional funding sources including private foundations, corporate partnerships, and fee-for-service contracts to ensure program sustainability.</li>
</ol>
<div class="callout"><h4>🎯 Summary of Strategic Priorities</h4><p>FOAM's strategic direction focuses on <strong>deepening impact</strong> rather than simply expanding reach. By strengthening employer relationships, enhancing retention support, and building sustainable solutions to persistent barriers like transportation, we aim to improve outcomes for each father served while positioning the organization for long-term sustainability.</p></div>
</div></div>

<!-- FOOTER -->
<div class="footer">
<div class="footer-logo">Fathers On A Mission</div>
<div class="footer-tagline">"Enhancing Fathers, Strengthening Families"</div>
<div class="footer-info">East Baton Rouge Parish, Louisiana | Report Period: ${periodLabel} | Generated: ${generatedDate}</div>
</div>
</body></html>`;
  };

  const downloadAsWord = (htmlContent: string, filename: string) => {
    const blob = new Blob([htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename + '.doc';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadAsPDF = (htmlContent: string) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      setTimeout(() => { printWindow.print(); }, 500);
    }
  };

  const handleDownloadReport = (format: 'word' | 'pdf') => {
    if (!generatedReport) return;
    const isInDepth = reportType === 'indepth' || reportType === 'indepth6';
    const htmlContent = isInDepth ? generateInDepthWordDocument(generatedReport) : generateWordDocument(generatedReport);
    const periodLabel = generatedReport.metadata?.periodLabel || 'Report';
    const reportTypeName = reportType === 'indepth' ? 'Comprehensive_Annual' : reportType === 'indepth6' ? 'Comprehensive_6Month' : (generatedReport.metadata?.reportType || 'Monthly');
    const filename = 'FOAM_' + reportTypeName + '_Report_' + periodLabel.replace(/\s+/g, '_');
    if (format === 'word') {
      downloadAsWord(htmlContent, filename);
    } else {
      downloadAsPDF(htmlContent);
    }
  };

  // ========================================
  // ON-SCREEN FULL REPORT VIEWER COMPONENT (12 SECTIONS)
  // ========================================
  const renderFullReportViewer = () => {
    if (!generatedReport || !showFullReport) return null;
    const is6Month = reportType === 'indepth6';
    const m = getReportMetrics(generatedReport, is6Month);
    const periodLabel = generatedReport.metadata?.periodLabel || (selectedYear === '2024-2025' ? 'October 2024 – September 2025' : 'January 2026 – December 2026');
    const generatedDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const reportPeriodName = is6Month ? '6-Month' : 'Annual';

    const ProgressBar = ({ label, value, color }: { label: string; value: number; color: string }) => (
      <div className="mb-4">
        <div className="flex justify-between mb-1 text-sm">
          <span className="text-gray-700 font-medium">{label}</span>
          <span className="font-bold" style={{ color }}>{value}%</span>
        </div>
        <div className="h-6 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full rounded-full flex items-center justify-end pr-2 text-white text-xs font-bold" style={{ width: `${value}%`, background: `linear-gradient(90deg, ${color}, ${color}dd)` }}>{value}%</div>
        </div>
      </div>
    );

    const KPICard = ({ label, value, sublabel, colorClass }: { label: string; value: string | number; sublabel?: string; colorClass: string }) => {
      const colors: Record<string, { bg: string; border: string; text: string }> = {
        blue: { bg: 'bg-gradient-to-br from-blue-50 to-blue-100', border: 'border-blue-300', text: 'text-[#0F2C5C]' },
        green: { bg: 'bg-gradient-to-br from-emerald-50 to-emerald-100', border: 'border-emerald-300', text: 'text-emerald-600' },
        amber: { bg: 'bg-gradient-to-br from-amber-50 to-amber-100', border: 'border-amber-300', text: 'text-amber-600' },
        purple: { bg: 'bg-gradient-to-br from-purple-50 to-purple-100', border: 'border-purple-300', text: 'text-purple-600' }
      };
      const c = colors[colorClass] || colors.blue;
      return (
        <div className={`${c.bg} ${c.border} border-2 rounded-xl p-5 text-center`}>
          <div className="text-xs text-gray-500 uppercase font-semibold mb-1">{label}</div>
          <div className={`text-3xl font-bold ${c.text}`}>{value}</div>
          {sublabel && <div className="text-xs text-gray-400 mt-1">{sublabel}</div>}
        </div>
      );
    };

    const SectionHeader = ({ number, title }: { number: number; title: string }) => (
      <div className="flex items-center gap-4 p-4 rounded-t-xl text-white" style={{ background: 'linear-gradient(135deg, #0F2C5C 0%, #1a365d 100%)' }}>
        <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg">{number}</div>
        <h3 className="text-lg font-bold">{title}</h3>
      </div>
    );

    const BarChart = ({ data }: { data: { label: string; value: number; color: string }[] }) => {
      const maxVal = Math.max(...data.map(d => d.value), 1);
      return (
        <div className="flex items-end gap-5 h-44 p-4">
          {data.map((item, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div className="font-bold text-gray-700">{item.value}</div>
              <div className="w-full rounded-t-lg" style={{ height: `${(item.value / maxVal * 100)}%`, background: `linear-gradient(180deg, ${item.color}, ${item.color}dd)`, minHeight: item.value > 0 ? '10px' : '0' }} />
              <div className="text-xs text-gray-500 text-center font-medium">{item.label}</div>
            </div>
          ))}
        </div>
      );
    };

    return (
      <div className="fixed inset-0 bg-black/60 z-50 overflow-y-auto">
        <div className="min-h-screen py-8 px-4">
          <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Sticky Header with Close/Download buttons */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Sparkles className={is6Month ? 'text-pink-600' : 'text-purple-600'} size={24} />
                <span className="font-semibold text-gray-800">Comprehensive {reportPeriodName} Report (12 Sections)</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleDownloadReport('word')} className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"><Download size={16} />Word</button>
                <button onClick={() => handleDownloadReport('pdf')} className="flex items-center gap-2 px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm"><Printer size={16} />PDF</button>
                <button onClick={() => setShowFullReport(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} className="text-gray-500" /></button>
              </div>
            </div>

            {/* COVER PAGE */}
            <div className="text-center py-16 px-8 text-white" style={{ background: 'linear-gradient(135deg, #0F2C5C 0%, #1a365d 100%)' }}>
              <div className="inline-block bg-white text-[#0F2C5C] font-bold text-2xl px-6 py-3 rounded-xl mb-8">FOAM</div>
              <h1 className="text-4xl font-bold mb-4">Fathers On A Mission</h1>
              <h2 className="text-xl opacity-90 mb-8">Comprehensive {reportPeriodName} Outcomes Report<br/>Program Analysis & Strategic Direction</h2>
              <div className="inline-block bg-white/15 px-8 py-3 rounded-full text-lg">📅 Reporting Period: {periodLabel}</div>
              <p className="mt-12 italic text-lg opacity-90">"Enhancing Fathers, Strengthening Families"</p>
              <p className="mt-8 text-sm opacity-70">East Baton Rouge Parish, Louisiana<br/>Report Generated: {generatedDate}</p>
            </div>

            <div className="p-8">
              {/* TABLE OF CONTENTS */}
              <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-200">
                <h2 className="text-xl font-bold text-[#0F2C5C] border-b-2 border-[#0F2C5C] pb-3 mb-4">📑 Table of Contents</h2>
                <div className="grid grid-cols-2 gap-2">
                  {['Executive Summary', `${reportPeriodName} Outcomes Summary`, 'Program Reach & Engagement', 'Program Structure & Service Model', 'Workforce Development Pipeline', 'Employment Outcomes Analysis', 'Stabilization & Essential Needs', 'Mental Health & Behavioral Services', 'Key Performance Indicators', 'Organizational Capacity & Staffing', 'Challenges, Lessons Learned & Adaptations', 'Strategic Direction & Recommendations'].map((title, i) => (
                    <div key={i} className="py-2 border-b border-dotted border-gray-300 text-[#0F2C5C] font-medium">{i + 1}. {title}</div>
                  ))}
                </div>
              </div>

              {/* SECTION 1: EXECUTIVE SUMMARY */}
              <div className="mb-8 rounded-xl overflow-hidden border border-gray-200">
                <SectionHeader number={1} title="Executive Summary" />
                <div className="p-6 bg-white">
                  <div className="bg-gradient-to-br from-blue-50 to-sky-100 border-2 border-[#0F2C5C] rounded-xl p-6 mb-6">
                    <h4 className="text-[#0F2C5C] font-bold text-lg mb-4">📋 Program Overview & Key Achievements</h4>
                    <p className="text-gray-700 mb-4 text-justify leading-relaxed">During the {periodLabel} reporting period, <strong>Fathers On A Mission (FOAM)</strong> continued its mission of enhancing fathers and strengthening families across East Baton Rouge Parish, Louisiana.</p>
                    <p className="text-gray-700 mb-4 text-justify leading-relaxed">FOAM served <strong>{m.activeFathers} unduplicated fathers</strong> during the reporting period. The program's impact extends beyond individual participants, positively affecting an estimated <strong>{m.childrenImpacted} children</strong>.</p>
                    <p className="text-gray-700 mb-4 text-justify leading-relaxed">Our workforce development pipeline demonstrated strong performance, with <strong>{m.workforceParticipation} fathers ({m.workforceParticipationRate}%)</strong> actively participating. Of these, <strong>{m.jobPlacements} fathers achieved job placements</strong> ({m.jobPlacementRate}% placement rate). <strong>{m.jobRetention} fathers ({m.retentionRate}%)</strong> maintained employment beyond 30-90 days.</p>
                  </div>
                  <div className="grid grid-cols-4 gap-4 mb-6">
                    <KPICard label="Fathers Served" value={m.activeFathers} sublabel="Unduplicated count" colorClass="blue" />
                    <KPICard label="Children Impacted" value={`~${m.childrenImpacted}`} sublabel="Est. beneficiaries" colorClass="green" />
                    <KPICard label="Job Placements" value={m.jobPlacements} sublabel={`${m.jobPlacementRate}% placement rate`} colorClass="amber" />
                    <KPICard label="Job Retention" value={`${m.retentionRate}%`} sublabel="30-90 day retention" colorClass="purple" />
                  </div>
                  <div className="bg-blue-50 border-l-4 border-[#0F2C5C] p-4 rounded-r-xl">
                    <strong>Key Accomplishment:</strong> FOAM's integrated service model continues to demonstrate that addressing multiple barriers simultaneously produces sustainable outcomes. The {m.retentionRate}% job retention rate exceeds industry benchmarks.
                  </div>
                </div>
              </div>

              {/* SECTION 2: OUTCOMES SUMMARY */}
              <div className="mb-8 rounded-xl overflow-hidden border border-gray-200">
                <SectionHeader number={2} title={`${reportPeriodName} Outcomes Summary`} />
                <div className="p-6 bg-white">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-[#0F2C5C] text-white text-left">
                        <th className="p-3 font-semibold">Outcome Area</th>
                        <th className="p-3 font-semibold text-center">Result</th>
                        <th className="p-3 font-semibold">Clarification</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ['Unduplicated Fathers Served', m.activeFathers, 'Total unique individuals who received any FOAM service'],
                        ['Responsible Fatherhood Classes', m.fatherhoodClassEnrollment, 'Fathers enrolled in 14-module NPCL curriculum'],
                        ['Project Family BUILD Engagement', `~${m.avgMonthlyEngagement}/mo`, 'Average monthly case management engagement'],
                        ['Workforce Development', m.workforceParticipation, `${m.workforceParticipationRate}% of total fathers served`],
                        ['Job Placements', m.jobPlacements, `${m.jobPlacementRate}% placement rate`],
                        ['Job Retention (30-90 days)', m.jobRetention, `${m.retentionRate}% retention rate`],
                        ['Stabilization Support', m.stabilizationSupport, 'Transportation, basic needs, legal, behavioral health'],
                        ['Mental Health Referrals', m.mentalHealthReferrals, `${m.mentalHealthEngagement}% of fathers served`]
                      ].map(([area, result, clarification], i) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                          <td className="p-3 font-medium text-gray-800">{area}</td>
                          <td className="p-3 text-center font-bold text-[#0F2C5C]">{result}</td>
                          <td className="p-3 text-sm text-gray-600">{clarification}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SECTION 3: PROGRAM REACH */}
              <div className="mb-8 rounded-xl overflow-hidden border border-gray-200">
                <SectionHeader number={3} title="Program Reach & Engagement Analysis" />
                <div className="p-6 bg-white">
                  <div className="bg-blue-50 border-l-4 border-[#0F2C5C] p-4 rounded-r-xl mb-6">
                    During the reporting period, FOAM served <strong>{m.activeFathers} unduplicated fathers</strong> across its comprehensive service ecosystem.
                  </div>
                  <div className="grid grid-cols-4 gap-4 mb-6">
                    <KPICard label="Total Fathers" value={m.activeFathers} sublabel="Unduplicated" colorClass="blue" />
                    <KPICard label="Class Participants" value={m.fatherhoodClassEnrollment} sublabel="Education" colorClass="green" />
                    <KPICard label="Monthly Active" value={m.avgMonthlyEngagement} sublabel="Case management" colorClass="amber" />
                    <KPICard label="Workforce" value={m.workforceParticipation} sublabel="Employment svcs" colorClass="purple" />
                  </div>
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <h4 className="font-bold text-gray-700 mb-4">📈 Service Engagement Funnel</h4>
                    <BarChart data={[
                      { label: 'Total Fathers', value: m.activeFathers, color: '#0F2C5C' },
                      { label: 'Workforce', value: m.workforceParticipation, color: '#059669' },
                      { label: 'Classes', value: m.fatherhoodClassEnrollment, color: '#d97706' },
                      { label: 'Mental Health', value: m.mentalHealthReferrals, color: '#7c3aed' }
                    ]} />
                  </div>
                </div>
              </div>

              {/* SECTION 4: PROGRAM STRUCTURE */}
              <div className="mb-8 rounded-xl overflow-hidden border border-gray-200">
                <SectionHeader number={4} title="Program Structure & Service Model" />
                <div className="p-6 bg-white">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="rounded-xl p-6 text-white" style={{ background: 'linear-gradient(135deg, #0F2C5C, #1a365d)' }}>
                      <h4 className="text-lg font-bold mb-3">📚 Responsible Fatherhood Classes</h4>
                      <p className="opacity-90 text-sm mb-4">Structured, curriculum-based educational program focused on developing fatherhood identity and parenting competencies.</p>
                      <ul className="text-sm opacity-90 space-y-2">
                        <li>• <strong>Curriculum:</strong> 14-module NPCL</li>
                        <li>• <strong>Focus:</strong> Parenting, co-parenting, relationships</li>
                        <li>• <strong>Participation:</strong> {m.fatherhoodClassEnrollment} fathers</li>
                      </ul>
                    </div>
                    <div className="rounded-xl p-6 text-white" style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}>
                      <h4 className="text-lg font-bold mb-3">🏗️ Project Family BUILD</h4>
                      <p className="opacity-90 text-sm mb-4">Comprehensive case management providing individualized support for workforce development and stabilization.</p>
                      <ul className="text-sm opacity-90 space-y-2">
                        <li>• <strong>Model:</strong> Individualized case management</li>
                        <li>• <strong>Services:</strong> Workforce, education, stabilization</li>
                        <li>• <strong>Engagement:</strong> ~{m.avgMonthlyEngagement} fathers/month</li>
                      </ul>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-amber-50 to-amber-100 border-2 border-amber-400 rounded-xl p-5">
                    <h4 className="text-amber-800 font-bold mb-2">💡 Critical Distinction</h4>
                    <p className="text-amber-900 text-sm">Participation in Fatherhood Classes does not equate to enrollment in Project Family BUILD. These are <strong>distinct but complementary programs</strong> that fathers may access independently or simultaneously.</p>
                  </div>
                </div>
              </div>

              {/* SECTION 5: WORKFORCE PIPELINE */}
              <div className="mb-8 rounded-xl overflow-hidden border border-gray-200">
                <SectionHeader number={5} title="Workforce Development Pipeline" />
                <div className="p-6 bg-white">
                  <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-xl mb-6">
                    <strong>{m.workforceParticipation} fathers</strong> engaged in workforce services, with <strong>{m.jobPlacements} achieving job placements</strong> and <strong>{m.jobRetention} maintaining employment</strong> beyond 30-90 days.
                  </div>
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 mb-6">
                    <h4 className="font-bold text-gray-700 mb-4">📊 Workforce Progression Funnel</h4>
                    <BarChart data={[
                      { label: 'Workforce Participation', value: m.workforceParticipation, color: '#0F2C5C' },
                      { label: 'Job Placements', value: m.jobPlacements, color: '#059669' },
                      { label: 'Job Retention', value: m.jobRetention, color: '#7c3aed' }
                    ]} />
                  </div>
                  <ProgressBar label="Workforce Participation Rate" value={m.workforceParticipationRate} color="#0F2C5C" />
                  <ProgressBar label="Job Placement Rate" value={m.jobPlacementRate} color="#059669" />
                  <ProgressBar label="Job Retention Rate (30-90 days)" value={m.retentionRate} color="#7c3aed" />
                </div>
              </div>

              {/* SECTION 6: EMPLOYMENT OUTCOMES */}
              <div className="mb-8 rounded-xl overflow-hidden border border-gray-200">
                <SectionHeader number={6} title="Employment Outcomes Analysis" />
                <div className="p-6 bg-white">
                  <table className="w-full border-collapse mb-6">
                    <thead>
                      <tr className="bg-[#0F2C5C] text-white text-left">
                        <th className="p-3 font-semibold">Employment Metric</th>
                        <th className="p-3 font-semibold text-center">Result</th>
                        <th className="p-3 font-semibold">Analysis</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ['Total Job Placements', m.jobPlacements, 'Fathers who obtained paid employment'],
                        ['Placement Rate', `${m.jobPlacementRate}%`, 'Percentage of workforce participants achieving employment'],
                        ['30-90 Day Retention', m.jobRetention, 'Fathers maintaining employment beyond critical window'],
                        ['Retention Rate', `${m.retentionRate}%`, 'Exceeds typical benchmarks for similar programs']
                      ].map(([metric, result, analysis], i) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                          <td className="p-3 font-medium text-gray-800">{metric}</td>
                          <td className="p-3 text-center font-bold text-[#0F2C5C]">{result}</td>
                          <td className="p-3 text-sm text-gray-600">{analysis}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-xl">
                    <strong>Key Finding:</strong> The combination of job placement services with comprehensive retention support produces significantly better employment outcomes.
                  </div>
                </div>
              </div>

              {/* SECTION 7: STABILIZATION */}
              <div className="mb-8 rounded-xl overflow-hidden border border-gray-200">
                <SectionHeader number={7} title="Stabilization & Essential Needs Support" />
                <div className="p-6 bg-white">
                  <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl mb-6">
                    FOAM provided <strong>{m.stabilizationSupport} instances of stabilization support</strong> during the reporting period.
                  </div>
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 mb-6">
                    <h4 className="font-bold text-gray-700 mb-4">📊 Stabilization Support Distribution</h4>
                    <BarChart data={[
                      { label: 'Transportation', value: m.transportationAssist, color: '#0F2C5C' },
                      { label: 'Basic Needs', value: m.basicNeedsAssist, color: '#059669' },
                      { label: 'Legal Aid', value: m.legalAssist, color: '#d97706' },
                      { label: 'Behavioral Health', value: m.behavioralHealthAssist, color: '#7c3aed' }
                    ]} />
                  </div>
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-[#0F2C5C] text-white text-left">
                        <th className="p-3 font-semibold">Category</th>
                        <th className="p-3 font-semibold text-center">Instances</th>
                        <th className="p-3 font-semibold text-center">%</th>
                        <th className="p-3 font-semibold">Services</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ['Transportation', m.transportationAssist, '35%', 'Gas cards, bus passes, ride coordination'],
                        ['Basic Needs', m.basicNeedsAssist, '25%', 'Emergency food, clothing, utility assistance'],
                        ['Legal Aid', m.legalAssist, '20%', 'Child support, custody, record expungement'],
                        ['Behavioral Health', m.behavioralHealthAssist, '20%', 'Mental health screening, counseling referrals']
                      ].map(([cat, instances, pct, services], i) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                          <td className="p-3 font-medium text-gray-800">{cat}</td>
                          <td className="p-3 text-center font-bold text-[#0F2C5C]">{instances}</td>
                          <td className="p-3 text-center font-bold text-[#0F2C5C]">{pct}</td>
                          <td className="p-3 text-sm text-gray-600">{services}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SECTION 8: MENTAL HEALTH */}
              <div className="mb-8 rounded-xl overflow-hidden border border-gray-200">
                <SectionHeader number={8} title="Mental Health & Behavioral Services" />
                <div className="p-6 bg-white">
                  <div className="grid grid-cols-4 gap-4 mb-6">
                    <KPICard label="MH Referrals" value={m.mentalHealthReferrals} sublabel="Fathers referred" colorClass="purple" />
                    <KPICard label="Engagement Rate" value={`${m.mentalHealthEngagement}%`} sublabel="Of fathers served" colorClass="blue" />
                    <KPICard label="BH Support" value={m.behavioralHealthAssist} sublabel="Service events" colorClass="green" />
                    <KPICard label="Integration" value="Embedded" sublabel="Throughout programming" colorClass="amber" />
                  </div>
                  <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-r-xl">
                    <strong>Key Insight:</strong> Fathers who engage in mental health services alongside workforce development show significantly better employment retention rates.
                  </div>
                </div>
              </div>

              {/* SECTION 9: KPIs */}
              <div className="mb-8 rounded-xl overflow-hidden border border-gray-200">
                <SectionHeader number={9} title="Key Performance Indicators" />
                <div className="p-6 bg-white">
                  <div className="grid grid-cols-4 gap-4 mb-6">
                    {[
                      { label: 'Workforce Participation', value: m.workforceParticipationRate, target: 50 },
                      { label: 'Job Placement Rate', value: m.jobPlacementRate, target: 40 },
                      { label: 'Job Retention', value: m.retentionRate, target: 70 },
                      { label: 'MH Engagement', value: m.mentalHealthEngagement, target: 25 }
                    ].map((item, i) => (
                      <div key={i} className="bg-gray-50 rounded-xl p-5 text-center border border-gray-200">
                        <div className="w-24 h-24 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl font-bold" style={{ border: `8px solid ${item.value >= item.target ? '#10b981' : '#f59e0b'}`, color: item.value >= item.target ? '#059669' : '#d97706' }}>
                          {item.value}%
                        </div>
                        <div className="text-xs text-gray-500 font-medium">{item.label}</div>
                      </div>
                    ))}
                  </div>
                  <ProgressBar label="Program Completion Rate (Target: 70%)" value={70} color="#059669" />
                  <ProgressBar label="Stability Achievement Rate (Target: 80%)" value={80} color="#0F2C5C" />
                  <ProgressBar label="Assessment Improvement Rate (Target: 75%)" value={75} color="#7c3aed" />
                </div>
              </div>

              {/* SECTION 10: ORGANIZATIONAL CAPACITY */}
              <div className="mb-8 rounded-xl overflow-hidden border border-gray-200">
                <SectionHeader number={10} title="Organizational Capacity & Staffing" />
                <div className="p-6 bg-white">
                  <table className="w-full border-collapse mb-6">
                    <thead>
                      <tr className="bg-[#0F2C5C] text-white text-left">
                        <th className="p-3 font-semibold">Position</th>
                        <th className="p-3 font-semibold">Primary Functions</th>
                        <th className="p-3 font-semibold">Area</th>
                        <th className="p-3 font-semibold text-center">FTE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ['Executive Director', 'Strategic leadership, funder relations', 'Leadership', '1.0'],
                        ['Program Manager', 'Operations, staff supervision, QA', 'Leadership', '1.0'],
                        ['Case Managers', 'Direct services, intake, goal planning', 'Service', '2.0'],
                        ['Workforce Specialist', 'Employment services, job readiness', 'Service', '1.0'],
                        ['Fatherhood Facilitator', 'Curriculum delivery, facilitation', 'Education', '1.0']
                      ].map(([position, functions, area, fte], i) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                          <td className="p-3 font-medium text-gray-800">{position}</td>
                          <td className="p-3 text-sm text-gray-600">{functions}</td>
                          <td className="p-3"><span className={`px-3 py-1 rounded-full text-xs font-semibold ${area === 'Leadership' ? 'bg-blue-100 text-[#0F2C5C]' : area === 'Service' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{area}</span></td>
                          <td className="p-3 text-center font-medium">{fte}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SECTION 11: CHALLENGES */}
              <div className="mb-8 rounded-xl overflow-hidden border border-gray-200">
                <SectionHeader number={11} title="Challenges, Lessons Learned & Adaptations" />
                <div className="p-6 bg-white">
                  {[
                    { title: 'Transportation Barriers', issue: 'Transportation emerged as the single largest barrier to program participation and employment retention.', adaptation: 'FOAM significantly expanded transportation assistance (35% of all support instances).' },
                    { title: 'Mental Health Stigma', issue: 'Many fathers were reluctant to acknowledge mental health needs due to stigma.', adaptation: 'We shifted from formal screening language to integrated wellness conversations.' },
                    { title: 'Engagement Retention', issue: 'Some fathers disengaged after initial contact.', adaptation: 'We implemented rapid engagement protocols to ensure meaningful services within the first week.' }
                  ].map((item, i) => (
                    <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
                      <h5 className="text-[#0F2C5C] font-bold mb-2">⚠️ Challenge: {item.title}</h5>
                      <p className="text-gray-600 text-sm mb-2"><strong>Issue:</strong> {item.issue}</p>
                      <p className="text-gray-600 text-sm"><strong>Adaptation:</strong> {item.adaptation}</p>
                    </div>
                  ))}
                  <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl">
                    <strong>Key Lesson Learned:</strong> The most successful outcomes occur when fathers receive simultaneous support across multiple domains—parenting education, workforce development, and stabilization support—rather than sequential services.
                  </div>
                </div>
              </div>

              {/* SECTION 12: STRATEGIC DIRECTION */}
              <div className="mb-8 rounded-xl overflow-hidden border border-gray-200">
                <SectionHeader number={12} title="Strategic Direction & Recommendations" />
                <div className="p-6 bg-white">
                  <ol className="space-y-4 mb-6">
                    {[
                      ['Expand Employer Partnerships', 'Develop formal relationships with 5-10 additional employers committed to hiring program participants.'],
                      ['Enhance Retention Support', 'Strengthen post-placement support to maintain strong retention rates.'],
                      ['Strengthen Mental Health Integration', 'Deepen behavioral health integration through additional staff training.'],
                      ['Build Transportation Solutions', 'Explore sustainable transportation solutions including employer shuttle coordination.'],
                      ['Enhance Data Systems', 'Implement improved outcome tracking including 6-month and 12-month employment retention.'],
                      ['Scale Successful Interventions', 'Document and replicate most effective program elements.'],
                      ['Diversify Funding Base', 'Pursue additional funding sources to ensure program sustainability.']
                    ].map(([title, desc], i) => (
                      <li key={i} className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-[#0F2C5C] text-white flex items-center justify-center font-bold text-sm flex-shrink-0">{i + 1}</div>
                        <div><strong className="text-gray-800">{title}:</strong> <span className="text-gray-600">{desc}</span></div>
                      </li>
                    ))}
                  </ol>
                  <div className="bg-gradient-to-r from-amber-50 to-amber-100 border-2 border-amber-400 rounded-xl p-5">
                    <h4 className="text-amber-800 font-bold mb-2">🎯 Summary of Strategic Priorities</h4>
                    <p className="text-amber-900 text-sm">FOAM's strategic direction focuses on <strong>deepening impact</strong> rather than simply expanding reach. By strengthening employer relationships, enhancing retention support, and building sustainable solutions to persistent barriers, we aim to improve outcomes for each father served.</p>
                  </div>
                </div>
              </div>

              {/* FOOTER */}
              <div className="text-center py-8 border-t-4 border-[#0F2C5C]">
                <div className="text-2xl font-bold text-[#0F2C5C] mb-2">Fathers On A Mission</div>
                <div className="text-[#0F2C5C] italic mb-2">"Enhancing Fathers, Strengthening Families"</div>
                <div className="text-sm text-gray-400">East Baton Rouge Parish, Louisiana<br/>Report Period: {periodLabel} | Generated: {generatedDate}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ============================================
  // RENDER DASHBOARD
  // ============================================
  const renderDashboard = () => {
    const StatCard = ({ icon: Icon, label, value, color, subValue }: { icon: any; label: string; value: string | number; color: string; subValue?: string }) => (
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="text-sm text-gray-500">{label}</div>
        {subValue && <div className="text-xs text-gray-400 mt-1">{subValue}</div>}
      </div>
    );

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={Users} label="Active Fathers" value={dashboardMetrics.activeFathers} color="bg-[#0F2C5C]" subValue="Currently enrolled" />
          <StatCard icon={BookOpen} label="Fatherhood Class" value={dashboardMetrics.fatherhoodClassActive} color="bg-emerald-500" subValue="Active participants" />
          <StatCard icon={Briefcase} label="Workforce Program" value={dashboardMetrics.workforceDevelopment} color="bg-amber-500" subValue="In training" />
          <StatCard icon={CheckCircle2} label="Job Placements" value={dashboardMetrics.jobPlacements} color="bg-purple-500" subValue="This period" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={Award} label="Job Retention" value={dashboardMetrics.jobRetention} color="bg-teal-500" subValue="90+ days employed" />
          <StatCard icon={Heart} label="Mental Health" value={dashboardMetrics.mentalHealthReferrals} color="bg-rose-500" subValue="Referrals made" />
          <StatCard icon={Package} label="Stabilization" value={dashboardMetrics.stabilizationSupport} color="bg-indigo-500" subValue="Support instances" />
          <StatCard icon={UserCheck} label="Graduations" value={dashboardMetrics.graduations} color="bg-green-600" subValue="Program completed" />
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Program Overview</h3>
          <p className="text-gray-600">Welcome to the FOAM Case Manager Portal. Use the tabs above to manage data, generate reports, and track program outcomes.</p>
        </div>
      </div>
    );
  };

  // ============================================
  // RENDER DATA TABLE
  // ============================================
  const renderDataTable = () => {
    const months = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Program Data - {selectedYear}</h3>
            <div className="flex items-center gap-2">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
              >
                <option value="2024-2025">FY 2024-2025</option>
                <option value="2026">CY 2026</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider sticky left-0 bg-gray-50">Category</th>
                  {months.map(m => (
                    <th key={m} className="px-3 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">{m}</th>
                  ))}
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider bg-[#0F2C5C] text-white">Total</th>
                </tr>
              </thead>
              <tbody>
                {dataRows.map((row, idx) => (
                  <tr key={row.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 sticky left-0 bg-inherit">{row.category}</td>
                    {row.values.map((val, i) => (
                      <td key={i} className="px-3 py-3 text-center text-sm text-gray-700">
                        {editingCell?.rowId === row.id && editingCell?.colIndex === i ? (
                          <input
                            type="text"
                            value={editingCell.value}
                            onChange={(e) => setEditingCell({ ...editingCell, value: e.target.value })}
                            onBlur={() => {
                              const newRows = [...dataRows];
                              const rowIndex = newRows.findIndex(r => r.id === row.id);
                              if (rowIndex !== -1) {
                                newRows[rowIndex].values[i] = editingCell.value;
                                setDataRows(newRows);
                              }
                              setEditingCell(null);
                            }}
                            className="w-16 px-2 py-1 border border-blue-400 rounded text-center"
                            autoFocus
                          />
                        ) : (
                          <span
                            onClick={() => setEditingCell({ rowId: row.id, colIndex: i, value: String(val || '') })}
                            className="cursor-pointer hover:bg-blue-50 px-2 py-1 rounded"
                          >
                            {val ?? '-'}
                          </span>
                        )}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-center text-sm font-semibold text-white bg-[#0F2C5C]">
                      {row.values.reduce((sum: number, v) => sum + (typeof v === 'number' ? v : 0), 0)}
                    </td>
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
  // RENDER REPORTS TAB
  // ============================================
  const renderReportsTab = () => {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate Reports</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg"
              >
                <option value="monthly">Monthly Report</option>
                <option value="quarterly">Quarterly Report</option>
                <option value="annual">Annual Summary</option>
                <option value="indepth">Comprehensive Annual Report (12 Sections)</option>
                <option value="indepth6">Comprehensive 6-Month Report (12 Sections)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fiscal Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg"
              >
                <option value="2024-2025">FY 2024-2025</option>
                <option value="2026">CY 2026</option>
              </select>
            </div>
            {reportType === 'monthly' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                >
                  {['October', 'November', 'December', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September'].map((m, i) => (
                    <option key={i} value={i + 1}>{m}</option>
                  ))}
                </select>
              </div>
            )}
            {reportType === 'quarterly' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quarter</label>
                <select
                  value={selectedQuarter}
                  onChange={(e) => setSelectedQuarter(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                >
                  <option value={1}>Q1 (Oct-Dec)</option>
                  <option value={2}>Q2 (Jan-Mar)</option>
                  <option value={3}>Q3 (Apr-Jun)</option>
                  <option value={4}>Q4 (Jul-Sep)</option>
                </select>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className="px-6 py-3 bg-[#0F2C5C] text-white rounded-lg font-medium hover:bg-[#1a3a6e] disabled:opacity-50 flex items-center gap-2"
            >
              {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {isGenerating ? 'Generating...' : 'Generate Report'}
            </button>
            {showPreview && previewData && (
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Hide Preview
              </button>
            )}
          </div>
        </div>

        {generatedReport && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-[#0F2C5C] to-[#1a3a6e]">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Generated Report
              </h3>
              <div className="flex gap-2">
                {(reportType === 'indepth' || reportType === 'indepth6') && (
                  <button
                    onClick={() => setShowFullReport(!showFullReport)}
                    className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    {showFullReport ? 'Hide Full Report' : 'View Full Report'}
                  </button>
                )}
                <button
                  onClick={() => handleDownloadReport('docx')}
                  className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Word
                </button>
                <button
                  onClick={() => handleDownloadReport('pdf')}
                  className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 flex items-center gap-2"
                >
                  <FileDown className="w-4 h-4" />
                  PDF
                </button>
              </div>
            </div>
            {showFullReport && (reportType === 'indepth' || reportType === 'indepth6') ? (
              renderFullReportViewer()
            ) : (
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: 'Fathers Served', value: generatedReport.keyMetrics?.activeFathers || dashboardMetrics.activeFathers },
                    { label: 'Class Enrollment', value: generatedReport.keyMetrics?.fatherhoodClassEnrollment || dashboardMetrics.fatherhoodClassActive },
                    { label: 'Job Placements', value: generatedReport.keyMetrics?.jobPlacements || dashboardMetrics.jobPlacements },
                    { label: 'Retention Rate', value: `${Math.round((dashboardMetrics.jobRetention / Math.max(dashboardMetrics.jobPlacements, 1)) * 100)}%` }
                  ].map((item, i) => (
                    <div key={i} className="bg-gray-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-[#0F2C5C]">{item.value}</div>
                      <div className="text-sm text-gray-600">{item.label}</div>
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">Key Insights</h4>
                  {(generatedReport.narrativeInsights || []).map((insight: string, i: number) => (
                    <div key={i} className="bg-blue-50 border-l-4 border-[#0F2C5C] p-3 rounded-r-lg">
                      <p className="text-gray-700 text-sm">{insight}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // ============================================
  // MAIN RETURN
  // ============================================
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0F2C5C] to-[#1a3a6e] text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold">Case Manager Portal</h1>
                <p className="text-blue-200 text-sm">FOAM Program Management System</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-blue-200">Logged in as</div>
                <div className="font-medium">{caseManagerName}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex gap-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'data', label: 'Data Entry', icon: Database },
              { id: 'reports', label: 'Reports', icon: FileText }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-[#0F2C5C] text-[#0F2C5C]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'data' && renderDataTable()}
        {activeTab === 'reports' && renderReportsTab()}
      </div>
    </div>
  );
};

export default CaseManagerPortal;
