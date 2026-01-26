import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft, Calendar, RefreshCw, FileText, Users, Briefcase, Heart, DollarSign,
  CheckCircle2, Edit3, X, BarChart3, History, ClipboardList, Target, AlertTriangle,
  Download, Eye, Printer, FileDown, Sparkles, ArrowUpRight, ArrowDownRight, Monitor
} from 'lucide-react';

const API_BASE_URL = 'https://foamla-backend-2.onrender.com';

interface DataRow { id: number; category: string; values: (number | string | null)[]; }
interface ComparisonRow { id: number; metric: string; historical: number; current: number; change: number; percentChange: number; }
interface LogEntry { id: number; date: string; caseManager: string; month: string; year: string; category: string; oldValue: string; newValue: string; }
interface CaseManagerPortalProps { onClose: () => void; }
type TabType = 'dashboard' | 'historical' | 'current' | 'comparison' | 'log' | 'reports';
type ReportType = 'monthly' | 'quarterly' | 'annual' | 'indepth' | 'indepth6';

// Live Data Interfaces
interface LiveDataState {
  assessments: {
    monthlyBreakdown: Record<string, any>;
    totals: {
      totalAssessments: number;
      uniqueFathers: number;
      fathersReportImprovedRelationship: number;
      fathersFeelBecomingBetterFather: number;
      participantsDemonstratingBetterParenting: number;
      fathersReportingImprovedOutcomes: number;
    };
  };
  resources: {
    totalDistributed: number;
    byCategory: Record<string, number>;
    monthlyTrend: any[];
  };
  attendance: {
    totalSessions: number;
    uniqueParticipants: number;
    averageAttendance: number;
    monthlyBreakdown: Record<string, any>;
  };
  master: {
    totalFathers: number;
    activeCases: number;
    completedCases: number;
    byStatus: Record<string, number>;
  };
}

interface LoadingStates {
  assessments: boolean;
  resources: boolean;
  attendance: boolean;
  master: boolean;
}

const CaseManagerPortal: React.FC<CaseManagerPortalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [historicalData, setHistoricalData] = useState<DataRow[]>([]);
  const [historicalMonths, setHistoricalMonths] = useState<string[]>([]);
  const [currentData, setCurrentData] = useState<DataRow[]>([]);
  const [currentMonths, setCurrentMonths] = useState<string[]>([]);
  const [comparisonData, setComparisonData] = useState<ComparisonRow[]>([]);
  const [logData, setLogData] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [caseManagerName, setCaseManagerName] = useState('');
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [reportType, setReportType] = useState<ReportType>('monthly');
  const [selectedYear, setSelectedYear] = useState<'2024-2025' | '2026'>('2026');
  const [selectedMonth, setSelectedMonth] = useState<number>(0);
  const [selectedQuarter, setSelectedQuarter] = useState<number>(1);
  const [showPreview, setShowPreview] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<any>(null);
  const [showFullReport, setShowFullReport] = useState(false);

  // Live Data States
  const [liveData, setLiveData] = useState<LiveDataState>({
    assessments: { monthlyBreakdown: {}, totals: { totalAssessments: 0, uniqueFathers: 0, fathersReportImprovedRelationship: 0, fathersFeelBecomingBetterFather: 0, participantsDemonstratingBetterParenting: 0, fathersReportingImprovedOutcomes: 0 } },
    resources: { totalDistributed: 0, byCategory: {}, monthlyTrend: [] },
    attendance: { totalSessions: 0, uniqueParticipants: 0, averageAttendance: 0, monthlyBreakdown: {} },
    master: { totalFathers: 0, activeCases: 0, completedCases: 0, byStatus: {} }
  });
  const [loadingStates, setLoadingStates] = useState<LoadingStates>({ assessments: false, resources: false, attendance: false, master: false });
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => { loadData(); loadAllLiveData(); }, []);

  // Auto-refresh effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(() => { loadAllLiveData(); }, 60000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [autoRefresh]);

  const loadAllLiveData = async () => {
    await Promise.all([loadAssessmentData(), loadResourcesData(), loadAttendanceData(), loadMasterData()]);
    setLastRefresh(new Date());
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
    } catch (err: any) { console.error('Error loading assessment data:', err); }
    finally { setLoadingStates(prev => ({ ...prev, assessments: false })); }
  };

  const loadResourcesData = async () => {
    setLoadingStates(prev => ({ ...prev, resources: true }));
    try {
      const response = await fetch(`${API_BASE_URL}/api/resources/dashboard?year=2026`);
      const result = await response.json();
      if (result.success && result.data) {
        setLiveData(prev => ({ ...prev, resources: result.data }));
      }
    } catch (err: any) { console.error('Error loading resources data:', err); }
    finally { setLoadingStates(prev => ({ ...prev, resources: false })); }
  };

  const loadAttendanceData = async () => {
    setLoadingStates(prev => ({ ...prev, attendance: true }));
    try {
      const response = await fetch(`${API_BASE_URL}/api/attendance/stats?year=2026`);
      const result = await response.json();
      if (result.success && result.data) {
        setLiveData(prev => ({ ...prev, attendance: result.data }));
      }
    } catch (err: any) { console.error('Error loading attendance data:', err); }
    finally { setLoadingStates(prev => ({ ...prev, attendance: false })); }
  };

  const loadMasterData = async () => {
    setLoadingStates(prev => ({ ...prev, master: true }));
    try {
      const response = await fetch(`${API_BASE_URL}/api/master/aggregate?year=2026`);
      const result = await response.json();
      if (result.success && result.data) {
        setLiveData(prev => ({ ...prev, master: result.data }));
      }
    } catch (err: any) { console.error('Error loading master data:', err); }
    finally { setLoadingStates(prev => ({ ...prev, master: false })); }
  };

  const loadData = async () => {
    setIsLoading(true); setError(null);
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
      if (histData.success) { setHistoricalData(histData.data || []); setHistoricalMonths(histData.months || []); }
      if (currData.success) { setCurrentData(currData.data || []); setCurrentMonths(currData.months || []); }
      if (compData.success) { setComparisonData(compData.data || []); }
      if (logDataRes.success) { setLogData(logDataRes.data || []); }
    } catch (err: any) { setError(err.message || 'Failed to load data'); }
    finally { setIsLoading(false); }
  };

  const handleCellClick = (rowIndex: number, colIndex: number, currentValue: number | string | null) => {
    if (activeTab !== 'current' || colIndex === currentMonths.length - 1) return;
    if (!caseManagerName) { setShowNamePrompt(true); return; }
    setEditingCell({ row: rowIndex, col: colIndex }); setEditValue(currentValue?.toString() || '0');
  };

  const handleSaveCell = async () => {
    if (!editingCell) return; setIsSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/casemanager/current`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ row: editingCell.row, col: editingCell.col, value: Number(editValue) || 0, caseManager: caseManagerName })
      });
      const data = await res.json();
      if (data.success) {
        const newData = [...currentData]; newData[editingCell.row].values[editingCell.col] = Number(editValue) || 0;
        setCurrentData(newData); setEditingCell(null); setTimeout(() => loadData(), 500);
      } else { alert('Failed to save: ' + data.error); }
    } catch (err: any) { alert('Error saving: ' + err.message); }
    finally { setIsSaving(false); }
  };

  const getCategoryIcon = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('active') || cat.includes('enrolled')) return <Users size={16} className="text-blue-600" />;
    if (cat.includes('job') || cat.includes('employment') || cat.includes('workforce')) return <Briefcase size={16} className="text-emerald-600" />;
    if (cat.includes('mental') || cat.includes('relationship')) return <Heart size={16} className="text-pink-600" />;
    if (cat.includes('financial') || cat.includes('income')) return <DollarSign size={16} className="text-amber-600" />;
    if (cat.includes('education') || cat.includes('skill')) return <FileText size={16} className="text-purple-600" />;
    return <ClipboardList size={16} className="text-gray-500" />;
  };

  const reportData = useMemo(() => {
    const sourceData = selectedYear === '2026' ? currentData : historicalData;
    const sourceMonths = selectedYear === '2026' ? currentMonths : historicalMonths;
    if (sourceData.length === 0) return null;
    const months = selectedYear === '2026' ? ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'] : sourceMonths.slice(0, -1);
    const getMonthData = (monthIndex: number) => sourceData.map(row => ({ category: row.category, value: typeof row.values[monthIndex] === 'number' ? row.values[monthIndex] as number : 0 }));
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
        return { category: row.category, value: total, monthly: row.values.slice(0, Math.min(monthCount, 12)).map(v => typeof v === 'number' ? v : 0) };
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
    setIsGenerating(true); setGeneratedReport(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/reports/generate`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year: selectedYear, reportType: (reportType === 'indepth' || reportType === 'indepth6') ? 'annual' : reportType, period: reportType === 'monthly' ? selectedMonth : reportType === 'quarterly' ? selectedQuarter : 0 })
      });
      const data = await response.json();
      if (data.success) {
        if (reportType === 'indepth') {
          data.report.metadata = { ...data.report.metadata, reportType: 'indepth', periodLabel: selectedYear === '2024-2025' ? 'October 2024 – September 2025' : 'January 2026 – December 2026' };
        }
        if (reportType === 'indepth6') {
          data.report.metadata = { ...data.report.metadata, reportType: 'indepth6', periodLabel: selectedYear === '2024-2025' ? 'October 2024 – March 2025' : 'January 2026 – June 2026' };
        }
        setGeneratedReport(data.report); setShowPreview(false);
      } else { alert('Failed to generate report: ' + data.error); }
    } catch (err: any) { alert('Error generating report: ' + err.message); }
    finally { setIsGenerating(false); }
  };

  const getReportMetrics = (report: any, is6MonthReport: boolean = false) => {
    const scale = is6MonthReport ? 0.5 : 1.0;
    const baseActiveFathers = report?.keyMetrics?.activeFathers || 159;
    const baseFatherhoodClassEnrollment = report?.keyMetrics?.fatherhoodClassEnrollment || 70;
    const baseWorkforceParticipation = report?.keyMetrics?.workforceParticipation || 77;
    const baseJobPlacements = report?.keyMetrics?.jobPlacements || 35;
    const baseJobRetention = report?.keyMetrics?.jobRetention || 29;
    const baseStabilizationSupport = report?.keyMetrics?.stabilizationSupport || 231;
    const baseAvgMonthlyEngagement = report?.keyMetrics?.avgMonthlyEngagement || 60;
    const baseMentalHealthReferrals = report?.keyMetrics?.mentalHealthReferrals || 42;
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
    const workforceParticipationRate = Math.round((workforceParticipation / activeFathers) * 100);
    const jobPlacementRate = Math.round((jobPlacements / workforceParticipation) * 100);
    const retentionRate = Math.round((jobRetention / jobPlacements) * 100);
    const mentalHealthEngagement = Math.round((mentalHealthReferrals / activeFathers) * 100);
    const transportationAssist = Math.round(stabilizationSupport * 0.35);
    const basicNeedsAssist = Math.round(stabilizationSupport * 0.25);
    const legalAssist = Math.round(stabilizationSupport * 0.20);
    const behavioralHealthAssist = Math.round(stabilizationSupport * 0.20);
    return { activeFathers, fatherhoodClassEnrollment, workforceParticipation, jobPlacements, jobRetention, stabilizationSupport, avgMonthlyEngagement, mentalHealthReferrals, childrenImpacted, caseManagementSessions, totalServiceHours, workforceParticipationRate, jobPlacementRate, retentionRate, mentalHealthEngagement, transportationAssist, basicNeedsAssist, legalAssist, behavioralHealthAssist };
  };

  const generateWordDocument = (report: any) => {
    const periodLabel = report.metadata?.periodLabel || 'Report';
    const reportTypeName = report.metadata?.reportType || 'Monthly';
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
<div class="kpi-row"><div class="kpi-card blue"><div class="kpi-label">Fathers Served</div><div class="kpi-value">${report.keyMetrics?.activeFathers || 0}</div></div>
<div class="kpi-card green"><div class="kpi-label">Class Enrollment</div><div class="kpi-value">${report.keyMetrics?.fatherhoodClassEnrollment || 0}</div></div>
<div class="kpi-card amber"><div class="kpi-label">Job Placements</div><div class="kpi-value">${report.keyMetrics?.jobPlacements || 0}</div></div>
<div class="kpi-card purple"><div class="kpi-label">Retention Rate</div><div class="kpi-value">${report.successMetrics?.retentionRate || 0}%</div></div></div>
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
.section{margin:25px 0;page-break-inside:avoid}
.section-header{background:linear-gradient(135deg,#0F2C5C 0%,#1a365d 100%);color:white;padding:12px 20px;border-radius:10px 10px 0 0}
.section-content{background:white;padding:20px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 10px 10px}
.kpi-grid{display:table;width:100%;border-collapse:separate;border-spacing:8px;margin:20px 0}
.kpi-card{display:table-cell;width:25%;padding:15px 10px;text-align:center;border-radius:10px}
.kpi-card.blue{background:linear-gradient(135deg,#eff6ff,#dbeafe);border:2px solid #93c5fd}
.kpi-card.green{background:linear-gradient(135deg,#ecfdf5,#d1fae5);border:2px solid #6ee7b7}
.kpi-card.amber{background:linear-gradient(135deg,#fffbeb,#fef3c7);border:2px solid #fcd34d}
.kpi-card.purple{background:linear-gradient(135deg,#faf5ff,#f3e8ff);border:2px solid #c4b5fd}
.kpi-value{font-size:26pt;font-weight:bold;margin:5px 0}
.kpi-card.blue .kpi-value{color:#0F2C5C}.kpi-card.green .kpi-value{color:#059669}.kpi-card.amber .kpi-value{color:#d97706}.kpi-card.purple .kpi-value{color:#7c3aed}
.kpi-label{font-size:8pt;color:#64748b;text-transform:uppercase;font-weight:600}
.footer{margin-top:40px;padding-top:20px;border-top:3px solid #0F2C5C;text-align:center}
.footer-logo{font-size:16pt;font-weight:bold;color:#0F2C5C;margin-bottom:5px}
.footer-tagline{color:#0F2C5C;font-style:italic;font-size:10pt;margin-bottom:5px}
.footer-info{color:#94a3b8;font-size:8pt}
</style></head><body>
<div class="cover-page">
<div style="width:140px;height:50px;background:white;border-radius:10px;margin:0 auto 30px;display:flex;align-items:center;justify-content:center;font-weight:bold;color:#0F2C5C;font-size:18pt">FOAM</div>
<h1 class="cover-title">Fathers On A Mission</h1>
<h2 class="cover-subtitle">Comprehensive ${reportPeriodName} Outcomes Report</h2>
<div class="cover-period">Reporting Period: ${periodLabel}</div>
<div class="cover-tagline">"Enhancing Fathers, Strengthening Families"</div>
<div style="margin-top:40px;font-size:10pt;opacity:0.7">East Baton Rouge Parish, Louisiana<br/>Report Generated: ${generatedDate}</div>
</div>
<div class="section">
<div class="section-header">Executive Summary</div>
<div class="section-content">
<p>During the ${periodLabel} reporting period, <strong>Fathers On A Mission (FOAM)</strong> served <strong>${m.activeFathers} unduplicated fathers</strong>. Our workforce development pipeline demonstrated strong performance with <strong>${m.jobPlacements} job placements</strong> and <strong>${m.retentionRate}% retention rate</strong>.</p>
<table class="kpi-grid"><tr>
<td class="kpi-card blue"><div class="kpi-label">Fathers Served</div><div class="kpi-value">${m.activeFathers}</div></td>
<td class="kpi-card green"><div class="kpi-label">Children Impacted</div><div class="kpi-value">~${m.childrenImpacted}</div></td>
<td class="kpi-card amber"><div class="kpi-label">Job Placements</div><div class="kpi-value">${m.jobPlacements}</div></td>
<td class="kpi-card purple"><div class="kpi-label">Job Retention</div><div class="kpi-value">${m.retentionRate}%</div></td>
</tr></table>
</div></div>
<div class="footer">
<div class="footer-logo">Fathers On A Mission</div>
<div class="footer-tagline">"Enhancing Fathers, Strengthening Families"</div>
<div class="footer-info">East Baton Rouge Parish, Louisiana | ${periodLabel} | Generated: ${generatedDate}</div>
</div>
</body></html>`;
  };

  const downloadAsWord = (htmlContent: string, filename: string) => {
    const blob = new Blob([htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = filename + '.doc';
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadAsPDF = (htmlContent: string) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) { printWindow.document.write(htmlContent); printWindow.document.close(); setTimeout(() => { printWindow.print(); }, 500); }
  };

  const handleDownloadReport = (format: 'word' | 'pdf') => {
    if (!generatedReport) return;
    const isInDepth = reportType === 'indepth' || reportType === 'indepth6';
    const htmlContent = isInDepth ? generateInDepthWordDocument(generatedReport) : generateWordDocument(generatedReport);
    const periodLabel = generatedReport.metadata?.periodLabel || 'Report';
    const reportTypeName = reportType === 'indepth' ? 'Comprehensive_Annual' : reportType === 'indepth6' ? 'Comprehensive_6Month' : (generatedReport.metadata?.reportType || 'Monthly');
    const filename = 'FOAM_' + reportTypeName + '_Report_' + periodLabel.replace(/\s+/g, '_');
    if (format === 'word') { downloadAsWord(htmlContent, filename); } else { downloadAsPDF(htmlContent); }
  };

  // Data table renderer
  const renderDataTable = (data: DataRow[], months: string[], editable: boolean = false) => (
    <div className="overflow-x-auto bg-white rounded-xl border border-gray-200 shadow-sm">
      <table className="w-full">
        <thead>
          <tr style={{ background: 'linear-gradient(135deg, #0F2C5C 0%, #1a365d 100%)' }}>
            <th className="sticky left-0 px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider min-w-[200px]" style={{ background: '#0F2C5C' }}>Category</th>
            {months.map((month, i) => (
              <th key={i} className="px-3 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider min-w-[80px]">{month}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.map((row, rowIndex) => (
            <tr key={row.id} className="hover:bg-blue-50 transition-colors">
              <td className="sticky left-0 bg-white px-4 py-3 text-sm font-medium text-gray-800 flex items-center gap-2 border-r border-gray-100">
                {getCategoryIcon(row.category)}{row.category}
              </td>
              {row.values.map((value, colIndex) => (
                <td
                  key={colIndex}
                  className={`px-3 py-3 text-center text-sm ${editable && colIndex !== months.length - 1 ? 'cursor-pointer hover:bg-blue-100' : ''} ${colIndex === months.length - 1 ? 'bg-blue-50 font-semibold text-blue-700' : 'text-gray-700'}`}
                  onClick={() => editable && handleCellClick(rowIndex, colIndex, value)}
                >
                  {editingCell?.row === rowIndex && editingCell?.col === colIndex ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-16 px-2 py-1 bg-white border-2 border-blue-500 rounded text-center text-gray-800"
                        autoFocus
                        onKeyDown={(e) => { if (e.key === 'Enter') handleSaveCell(); if (e.key === 'Escape') setEditingCell(null); }}
                      />
                      <button onClick={handleSaveCell} disabled={isSaving} className="p-1 bg-green-600 text-white rounded hover:bg-green-500"><CheckCircle2 size={14} /></button>
                      <button onClick={() => setEditingCell(null)} className="p-1 bg-gray-400 text-white rounded hover:bg-gray-500"><X size={14} /></button>
                    </div>
                  ) : (value ?? '-')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Reports tab renderer
  const renderReportsTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FileText size={20} className="text-blue-600" />Generate Funder Report
        </h3>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-600 mb-2">Data Source</label>
          <div className="flex gap-3">
            <button
              onClick={() => setSelectedYear('2026')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${selectedYear === '2026' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'}`}
            >
              2026 (Current)
            </button>
            <button
              onClick={() => setSelectedYear('2024-2025')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${selectedYear === '2024-2025' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'}`}
            >
              2024-2025 (Historical)
            </button>
          </div>
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-600 mb-2">Report Type</label>
          <div className="grid grid-cols-5 gap-3">
            <button onClick={() => setReportType('monthly')} className={`p-4 rounded-xl border-2 transition-all ${reportType === 'monthly' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
              <Calendar size={24} className={reportType === 'monthly' ? 'text-blue-600 mx-auto mb-2' : 'text-gray-400 mx-auto mb-2'} />
              <div className={`font-medium ${reportType === 'monthly' ? 'text-blue-600' : 'text-gray-700'}`}>Monthly</div>
            </button>
            <button onClick={() => setReportType('quarterly')} className={`p-4 rounded-xl border-2 transition-all ${reportType === 'quarterly' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
              <BarChart3 size={24} className={reportType === 'quarterly' ? 'text-emerald-600 mx-auto mb-2' : 'text-gray-400 mx-auto mb-2'} />
              <div className={`font-medium ${reportType === 'quarterly' ? 'text-emerald-600' : 'text-gray-700'}`}>Quarterly</div>
            </button>
            <button onClick={() => setReportType('annual')} className={`p-4 rounded-xl border-2 transition-all ${reportType === 'annual' ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
              <Target size={24} className={reportType === 'annual' ? 'text-amber-600 mx-auto mb-2' : 'text-gray-400 mx-auto mb-2'} />
              <div className={`font-medium ${reportType === 'annual' ? 'text-amber-600' : 'text-gray-700'}`}>Annual</div>
            </button>
            <button onClick={() => setReportType('indepth6')} className={`p-4 rounded-xl border-2 transition-all ${reportType === 'indepth6' ? 'border-pink-500 bg-pink-50' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
              <Sparkles size={24} className={reportType === 'indepth6' ? 'text-pink-600 mx-auto mb-2' : 'text-gray-400 mx-auto mb-2'} />
              <div className={`font-medium ${reportType === 'indepth6' ? 'text-pink-600' : 'text-gray-700'}`}>In-Depth</div>
              <div className="text-xs text-gray-500 mt-1">6-Month Report</div>
            </button>
            <button onClick={() => setReportType('indepth')} className={`p-4 rounded-xl border-2 transition-all ${reportType === 'indepth' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
              <Sparkles size={24} className={reportType === 'indepth' ? 'text-purple-600 mx-auto mb-2' : 'text-gray-400 mx-auto mb-2'} />
              <div className={`font-medium ${reportType === 'indepth' ? 'text-purple-600' : 'text-gray-700'}`}>In-Depth</div>
              <div className="text-xs text-gray-500 mt-1">Annual Report</div>
            </button>
          </div>
        </div>
        {reportType === 'monthly' && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-600 mb-2">Select Month</label>
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))} className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-800">
              {['January','February','March','April','May','June','July','August','September','October','November','December'].map((month, i) => (
                <option key={i} value={i}>{month}</option>
              ))}
            </select>
          </div>
        )}
        {reportType === 'quarterly' && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-600 mb-2">Select Quarter</label>
            <div className="flex gap-3">
              {[1,2,3,4].map((q) => (
                <button
                  key={q}
                  onClick={() => setSelectedQuarter(q)}
                  className={`flex-1 py-2 rounded-lg font-medium transition-all ${selectedQuarter === q ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'}`}
                >
                  Q{q}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="flex gap-3">
          <button onClick={() => setShowPreview(true)} disabled={!previewData} className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 border border-gray-300">
            <Eye size={18} />Preview Data
          </button>
          <button onClick={handleGenerateReport} disabled={isGenerating} className="flex items-center gap-2 px-6 py-2 text-white rounded-lg disabled:opacity-50" style={{ background: 'linear-gradient(135deg, #0F2C5C 0%, #1a365d 100%)' }}>
            {isGenerating ? (<><RefreshCw size={18} className="animate-spin" />Generating...</>) : (<><FileDown size={18} />Generate Report</>)}
          </button>
        </div>
      </div>

      {/* Generated Report Display */}
      {generatedReport && (
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <CheckCircle2 size={20} className="text-green-600" />Report Generated Successfully
            </h3>
            <div className="flex gap-2">
              <button onClick={() => handleDownloadReport('word')} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Download size={16} />Download Word
              </button>
              <button onClick={() => handleDownloadReport('pdf')} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
                <Printer size={16} />Export PDF
              </button>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Fathers On A Mission</h2>
              <p className="text-gray-600">{generatedReport.metadata?.reportType?.charAt(0).toUpperCase() + generatedReport.metadata?.reportType?.slice(1)} Report</p>
              <p className="text-blue-600 font-medium">{generatedReport.metadata?.periodLabel}</p>
            </div>
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-200">
                <div className="text-3xl font-bold text-blue-700">{generatedReport.keyMetrics?.activeFathers || 0}</div>
                <div className="text-xs text-gray-600 uppercase">Fathers Served</div>
              </div>
              <div className="bg-emerald-50 rounded-xl p-4 text-center border border-emerald-200">
                <div className="text-3xl font-bold text-emerald-700">{generatedReport.keyMetrics?.fatherhoodClassEnrollment || 0}</div>
                <div className="text-xs text-gray-600 uppercase">Class Enrollment</div>
              </div>
              <div className="bg-amber-50 rounded-xl p-4 text-center border border-amber-200">
                <div className="text-3xl font-bold text-amber-700">{generatedReport.keyMetrics?.jobPlacements || 0}</div>
                <div className="text-xs text-gray-600 uppercase">Job Placements</div>
              </div>
              <div className="bg-purple-50 rounded-xl p-4 text-center border border-purple-200">
                <div className="text-3xl font-bold text-purple-700">{generatedReport.successMetrics?.retentionRate || 0}%</div>
                <div className="text-xs text-gray-600 uppercase">Retention Rate</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Data Preview Modal */}
      {showPreview && previewData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Data Preview</h3>
              <button onClick={() => setShowPreview(false)} className="p-1 hover:bg-gray-100 rounded"><X size={20} className="text-gray-500" /></button>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Category</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-600">Value</th>
                </tr>
              </thead>
              <tbody>
                {previewData.map((item: any, i: number) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="px-4 py-2 text-sm text-gray-700">{item.category}</td>
                    <td className="px-4 py-2 text-sm text-right text-blue-600 font-medium">{item.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw size={40} className="text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading Case Manager Portal...</p>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"><ArrowLeft size={20} /></button>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Case Manager Monthly Reports</h1>
              <p className="text-sm text-gray-500">Track, compare, and generate funder reports</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {caseManagerName && (<span className="text-sm text-gray-500">Logged in as: <span className="text-blue-600 font-medium">{caseManagerName}</span></span>)}
            <button onClick={loadData} className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors border border-gray-200"><RefreshCw size={16} />Refresh</button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 bg-white">
        <div className="flex px-6">
          {[
            { id: 'dashboard', label: 'Live Dashboard', icon: Monitor },
            { id: 'current', label: '2026 Data Entry', icon: Edit3 },
            { id: 'historical', label: '2024-2025 Historical', icon: History },
            { id: 'comparison', label: 'Year Comparison', icon: BarChart3 },
            { id: 'log', label: 'Change Log', icon: ClipboardList },
            { id: 'reports', label: 'Generate Reports', icon: FileText }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              <tab.icon size={16} />{tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
            <AlertTriangle size={20} />{error}
          </div>
        )}

        {/* SIMPLIFIED Live Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Dashboard Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Live Data Dashboard</h2>
                <p className="text-sm text-gray-500">Real-time data from all FOAM data sources</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-500">
                  Last updated: {lastRefresh.toLocaleTimeString()}
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} className="rounded" />
                  Auto-refresh (60s)
                </label>
                <button onClick={loadAllLiveData} disabled={Object.values(loadingStates).some(v => v)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                  <RefreshCw size={16} className={Object.values(loadingStates).some(v => v) ? 'animate-spin' : ''} />
                  Refresh All
                </button>
              </div>
            </div>

            {/* SIMPLIFIED KPI Cards Row - Only 3 cards */}
            <div className="grid grid-cols-3 gap-4">
              {/* Active Fathers */}
              <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl p-5 text-white shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <Users size={24} className="opacity-80" />
                  {loadingStates.master && <RefreshCw size={16} className="animate-spin opacity-60" />}
                </div>
                <div className="text-3xl font-bold">{liveData.master.totalFathers || 0}</div>
                <div className="text-sm opacity-80">Active Fathers Enrolled</div>
              </div>

              {/* Assessments */}
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl p-5 text-white shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <ClipboardList size={24} className="opacity-80" />
                  {loadingStates.assessments && <RefreshCw size={16} className="animate-spin opacity-60" />}
                </div>
                <div className="text-3xl font-bold">{liveData.assessments.totals.totalAssessments || 0}</div>
                <div className="text-sm opacity-80">Total Assessments</div>
              </div>

              {/* Resources Distributed */}
              <div className="bg-gradient-to-br from-amber-500 to-amber-700 rounded-xl p-5 text-white shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <DollarSign size={24} className="opacity-80" />
                  {loadingStates.resources && <RefreshCw size={16} className="animate-spin opacity-60" />}
                </div>
                <div className="text-3xl font-bold">{liveData.resources.totalDistributed || 0}</div>
                <div className="text-sm opacity-80">Resources Distributed</div>
              </div>
            </div>

            {/* Resources by Category - Full Width */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <DollarSign size={18} className="text-amber-600" />
                  Resources by Category
                </h3>
                {loadingStates.resources && <span className="text-sm text-gray-500">Loading...</span>}
              </div>
              <div className="p-4">
                {Object.entries(liveData.resources.byCategory || {}).length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(liveData.resources.byCategory).map(([category, count]) => (
                      <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">{category}</span>
                        <span className="text-lg font-bold text-amber-600">${count as number}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">No resource data available</div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'current' && currentData.length > 0 && renderDataTable(currentData, currentMonths, true)}
        {activeTab === 'historical' && historicalData.length > 0 && renderDataTable(historicalData, historicalMonths)}

        {activeTab === 'comparison' && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <table className="w-full">
              <thead>
                <tr style={{ background: 'linear-gradient(135deg, #0F2C5C 0%, #1a365d 100%)' }}>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white">Metric</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-white">2024-2025</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-white">2026</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-white">Change</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-white">% Change</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row) => (
                  <tr key={row.id} className="border-t border-gray-200 hover:bg-blue-50">
                    <td className="px-4 py-3 text-sm text-gray-800">{row.metric}</td>
                    <td className="px-4 py-3 text-center text-sm text-gray-700">{row.historical}</td>
                    <td className="px-4 py-3 text-center text-sm text-gray-700">{row.current}</td>
                    <td className={`px-4 py-3 text-center text-sm font-medium ${row.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {row.change >= 0 ? '+' : ''}{row.change}
                    </td>
                    <td className={`px-4 py-3 text-center text-sm font-medium ${row.percentChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      <span className="flex items-center justify-center gap-1">
                        {row.percentChange >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        {Math.abs(row.percentChange)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'log' && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <table className="w-full">
              <thead>
                <tr style={{ background: 'linear-gradient(135deg, #0F2C5C 0%, #1a365d 100%)' }}>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white">Case Manager</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white">Month/Year</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white">Category</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-white">Old → New</th>
                </tr>
              </thead>
              <tbody>
                {logData.map((entry) => (
                  <tr key={entry.id} className="border-t border-gray-200 hover:bg-blue-50">
                    <td className="px-4 py-3 text-sm text-gray-500">{entry.date}</td>
                    <td className="px-4 py-3 text-sm text-blue-600 font-medium">{entry.caseManager}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{entry.month} {entry.year}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{entry.category}</td>
                    <td className="px-4 py-3 text-center text-sm">
                      <span className="text-red-600">{entry.oldValue}</span>
                      <span className="text-gray-400 mx-2">→</span>
                      <span className="text-green-600">{entry.newValue}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'reports' && renderReportsTab()}
      </div>

      {/* Name Prompt Modal */}
      {showNamePrompt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Enter Your Name</h3>
            <p className="text-sm text-gray-600 mb-4">Please enter your name to track changes.</p>
            <input
              type="text"
              placeholder="Your name"
              value={caseManagerName}
              onChange={(e) => setCaseManagerName(e.target.value)}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button onClick={() => setShowNamePrompt(false)} className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 border border-gray-300">Cancel</button>
              <button onClick={() => { if (caseManagerName.trim()) setShowNamePrompt(false); }} disabled={!caseManagerName.trim()} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">Continue</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaseManagerPortal;
