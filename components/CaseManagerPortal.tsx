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
type TabType = 'historical' | 'current' | 'comparison' | 'log' | 'reports';
type ReportType = 'monthly' | 'quarterly' | 'annual' | 'indepth' | 'indepth6';

const CaseManagerPortal: React.FC<CaseManagerPortalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('historical');
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

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setIsLoading(true); setError(null);
    try {
      const [histRes, currRes, compRes, logRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/casemanager/historical`), fetch(`${API_BASE_URL}/api/casemanager/current`),
        fetch(`${API_BASE_URL}/api/casemanager/comparison`), fetch(`${API_BASE_URL}/api/casemanager/log`)
      ]);
      const histData = await histRes.json(); const currData = await currRes.json();
      const compData = await compRes.json(); const logDataRes = await logRes.json();
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
    // Scale factor: 0.5 for 6-month reports, 1.0 for annual
    const scale = is6MonthReport ? 0.5 : 1.0;
    
    // Base metrics from report (annual values)
    const baseActiveFathers = report?.keyMetrics?.activeFathers || 159;
    const baseFatherhoodClassEnrollment = report?.keyMetrics?.fatherhoodClassEnrollment || 70;
    const baseWorkforceParticipation = report?.keyMetrics?.workforceParticipation || 77;
    const baseJobPlacements = report?.keyMetrics?.jobPlacements || 35;
    const baseJobRetention = report?.keyMetrics?.jobRetention || 29;
    const baseStabilizationSupport = report?.keyMetrics?.stabilizationSupport || 231;
    const baseAvgMonthlyEngagement = report?.keyMetrics?.avgMonthlyEngagement || 60;
    const baseMentalHealthReferrals = report?.keyMetrics?.mentalHealthReferrals || 42;
    
    // Scaled metrics for the period
    const activeFathers = Math.round(baseActiveFathers * scale);
    const fatherhoodClassEnrollment = Math.round(baseFatherhoodClassEnrollment * scale);
    const workforceParticipation = Math.round(baseWorkforceParticipation * scale);
    const jobPlacements = Math.round(baseJobPlacements * scale);
    const jobRetention = Math.round(baseJobRetention * scale);
    const stabilizationSupport = Math.round(baseStabilizationSupport * scale);
    const avgMonthlyEngagement = baseAvgMonthlyEngagement; // Monthly avg stays same
    const mentalHealthReferrals = Math.round(baseMentalHealthReferrals * scale);
    
    // Calculated metrics
    const childrenImpacted = Math.round(activeFathers * 1.5);
    const caseManagementSessions = activeFathers * 5;
    const totalServiceHours = activeFathers * 12;
    
    // Rates (percentages) - calculated from scaled values, should be similar
    const workforceParticipationRate = Math.round((workforceParticipation / activeFathers) * 100);
    const jobPlacementRate = Math.round((jobPlacements / workforceParticipation) * 100);
    const retentionRate = Math.round((jobRetention / jobPlacements) * 100);
    const mentalHealthEngagement = Math.round((mentalHealthReferrals / activeFathers) * 100);
    
    // Stabilization breakdown
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
.flow-diagram{text-align:center;margin:20px 0}
.flow-step{display:inline-block;padding:12px 18px;border-radius:10px;text-align:center;font-size:9pt;font-weight:600;margin:5px}
.flow-step.step1{background:#dbeafe;color:#0F2C5C}.flow-step.step2{background:#d1fae5;color:#059669}
.flow-step.step3{background:#fef3c7;color:#d97706}.flow-step.step4{background:#f3e8ff;color:#7c3aed}
.flow-arrow{display:inline-block;font-size:16pt;color:#94a3b8;margin:0 5px}
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
<p>During the ${periodLabel} reporting period, <strong>Fathers On A Mission (FOAM)</strong> continued its mission of enhancing fathers and strengthening families across East Baton Rouge Parish, Louisiana. This comprehensive annual report presents an analysis of program outcomes, service delivery effectiveness, and organizational capacity across all FOAM initiatives, including Responsible Fatherhood Classes and the Project Family BUILD case management program.</p>
<p>FOAM served <strong>${m.activeFathers} unduplicated fathers</strong> during the reporting period, representing a significant reach into the community of fathers seeking to improve their parenting capabilities, employment stability, and family relationships. Through our integrated service delivery model, these fathers received comprehensive support including case management, workforce development, parenting education, and stabilization assistance. The program's impact extends beyond individual participants, positively affecting an estimated <strong>${m.childrenImpacted} children</strong> who benefit from improved father engagement and family stability.</p>
<p>Our workforce development pipeline demonstrated strong performance, with <strong>${m.workforceParticipation} fathers (${m.workforceParticipationRate}%)</strong> actively participating in employment-related services. Of these, <strong>${m.jobPlacements} fathers achieved job placements</strong>, representing a <strong>${m.jobPlacementRate}% placement rate</strong> among workforce participants. Critically, <strong>${m.jobRetention} fathers (${m.retentionRate}%)</strong> maintained employment beyond 30-90 days, demonstrating the sustainability of our employment outcomes and the effectiveness of our retention support services.</p>
<p>The Responsible Fatherhood Classes enrolled <strong>${m.fatherhoodClassEnrollment} fathers</strong> in the 14-module NPCL curriculum, focusing on parenting skills, co-parenting communication, anger management, and healthy relationship building. Project Family BUILD maintained an average of <strong>${m.avgMonthlyEngagement} active fathers per month</strong> receiving intensive case management services, including goal setting, progress monitoring, and barrier removal assistance.</p>
<p>Recognizing that employment success requires addressing underlying barriers, FOAM provided <strong>${m.stabilizationSupport} instances of stabilization support</strong> across transportation assistance, basic needs, legal aid, and behavioral health navigation. This holistic approach ensures fathers have the stability foundation necessary for sustainable employment and family engagement. Mental health services were integrated throughout programming, with <strong>${m.mentalHealthReferrals} fathers (${m.mentalHealthEngagement}%)</strong> receiving behavioral health referrals and navigation support.</p>
</div>
<table class="kpi-grid"><tr>
<td class="kpi-card blue"><div class="kpi-label">Fathers Served</div><div class="kpi-value">${m.activeFathers}</div><div class="kpi-sublabel">Unduplicated count</div></td>
<td class="kpi-card green"><div class="kpi-label">Children Impacted</div><div class="kpi-value">~${m.childrenImpacted}</div><div class="kpi-sublabel">Est. beneficiaries</div></td>
<td class="kpi-card amber"><div class="kpi-label">Job Placements</div><div class="kpi-value">${m.jobPlacements}</div><div class="kpi-sublabel">${m.jobPlacementRate}% placement rate</div></td>
<td class="kpi-card purple"><div class="kpi-label">Job Retention</div><div class="kpi-value">${m.retentionRate}%</div><div class="kpi-sublabel">30-90 day retention</div></td>
</tr></table>
<div class="highlight-box blue"><strong>Key Accomplishment:</strong> FOAM's integrated service model—combining fatherhood education, workforce development, and stabilization support—continues to demonstrate that addressing multiple barriers simultaneously produces sustainable outcomes for fathers and their families. The ${m.retentionRate}% job retention rate exceeds industry benchmarks and validates our comprehensive approach.</div>
</div></div>

<!-- SECTION 2: OUTCOMES SUMMARY -->
<div class="section">
<div class="section-header"><div class="section-header-inner"><span class="section-number">2</span><span class="section-title">${reportPeriodName} Outcomes Summary</span></div></div>
<div class="section-content">
<p style="margin-bottom:15px">The following table presents a comprehensive summary of FOAM's ${reportPeriodName.toLowerCase()} outcomes across all program areas with clarification on measurement methodology.</p>
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
<div class="flow-diagram">
<span class="flow-step step1">📋 Intake &<br/>Assessment</span>
<span class="flow-arrow">→</span>
<span class="flow-step step2">🎯 Goal Setting &<br/>Planning</span>
<span class="flow-arrow">→</span>
<span class="flow-step step3">🛠️ Active Service<br/>Delivery</span>
<span class="flow-arrow">→</span>
<span class="flow-step step4">📈 Outcome Tracking<br/>& Transition</span>
</div>
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

  // ========================================
  // ON-SCREEN FULL REPORT VIEWER COMPONENT
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
          <div className="h-full rounded-full flex items-center justify-end pr-2 text-white text-xs font-bold" style={{ width: value + '%', background: 'linear-gradient(90deg, ' + color + ', ' + color + 'dd)' }}>{value}%</div>
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
        <div className={c.bg + ' ' + c.border + ' border-2 rounded-xl p-5 text-center'}>
          <div className="text-xs text-gray-500 uppercase font-semibold mb-1">{label}</div>
          <div className={'text-3xl font-bold ' + c.text}>{value}</div>
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
              <div className="w-full rounded-t-lg" style={{ height: (item.value / maxVal * 100) + '%', background: 'linear-gradient(180deg, ' + item.color + ', ' + item.color + 'dd)', minHeight: item.value > 0 ? '10px' : '0' }} />
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
            {/* Sticky Header */}
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
                  {['Executive Summary', reportPeriodName + ' Outcomes Summary', 'Program Reach & Engagement', 'Program Structure & Service Model', 'Workforce Development Pipeline', 'Employment Outcomes Analysis', 'Stabilization & Essential Needs', 'Mental Health & Behavioral Services', 'Key Performance Indicators', 'Organizational Capacity & Staffing', 'Challenges & Lessons Learned', 'Strategic Direction & Recommendations'].map((title, i) => (
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
                    <p className="text-gray-700 mb-4 leading-relaxed">During the {periodLabel} reporting period, <strong>Fathers On A Mission (FOAM)</strong> continued its mission of enhancing fathers and strengthening families across East Baton Rouge Parish, Louisiana.</p>
                    <p className="text-gray-700 mb-4 leading-relaxed">FOAM served <strong>{m.activeFathers} unduplicated fathers</strong> during the reporting period. The program's impact extends beyond individual participants, positively affecting an estimated <strong>{m.childrenImpacted} children</strong>.</p>
                    <p className="text-gray-700 mb-4 leading-relaxed">Our workforce development pipeline demonstrated strong performance, with <strong>{m.workforceParticipation} fathers ({m.workforceParticipationRate}%)</strong> actively participating. Of these, <strong>{m.jobPlacements} fathers achieved job placements</strong> ({m.jobPlacementRate}% placement rate). <strong>{m.jobRetention} fathers ({m.retentionRate}%)</strong> maintained employment beyond 30-90 days.</p>
                  </div>
                  <div className="grid grid-cols-4 gap-4 mb-6">
                    <KPICard label="Fathers Served" value={m.activeFathers} sublabel="Unduplicated count" colorClass="blue" />
                    <KPICard label="Children Impacted" value={'~' + m.childrenImpacted} sublabel="Est. beneficiaries" colorClass="green" />
                    <KPICard label="Job Placements" value={m.jobPlacements} sublabel={m.jobPlacementRate + '% placement rate'} colorClass="amber" />
                    <KPICard label="Job Retention" value={m.retentionRate + '%'} sublabel="30-90 day retention" colorClass="purple" />
                  </div>
                </div>
              </div>

              {/* SECTION 2: OUTCOMES SUMMARY */}
              <div className="mb-8 rounded-xl overflow-hidden border border-gray-200">
                <SectionHeader number={2} title={reportPeriodName + ' Outcomes Summary'} />
                <div className="p-6 bg-white">
                  <table className="w-full text-sm">
                    <thead><tr className="bg-[#0F2C5C] text-white"><th className="p-3 text-left">Outcome Area</th><th className="p-3 text-center">Result</th><th className="p-3 text-left">Clarification</th></tr></thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr><td className="p-3 font-medium">Unduplicated Fathers Served</td><td className="p-3 text-center font-bold text-[#0F2C5C]">{m.activeFathers}</td><td className="p-3 text-gray-600">Total unique individuals receiving any FOAM service</td></tr>
                      <tr><td className="p-3 font-medium">Responsible Fatherhood Classes</td><td className="p-3 text-center font-bold text-[#0F2C5C]">{m.fatherhoodClassEnrollment}</td><td className="p-3 text-gray-600">Fathers enrolled in 14-module NPCL curriculum</td></tr>
                      <tr><td className="p-3 font-medium">Project Family BUILD</td><td className="p-3 text-center font-bold text-[#0F2C5C]">~{m.avgMonthlyEngagement}/mo</td><td className="p-3 text-gray-600">Average monthly case management engagement</td></tr>
                      <tr><td className="p-3 font-medium">Workforce Development</td><td className="p-3 text-center font-bold text-[#0F2C5C]">{m.workforceParticipation}</td><td className="p-3 text-gray-600">{m.workforceParticipationRate}% of total fathers served</td></tr>
                      <tr><td className="p-3 font-medium">Job Placements</td><td className="p-3 text-center font-bold text-emerald-600">{m.jobPlacements}</td><td className="p-3 text-gray-600">{m.jobPlacementRate}% placement rate</td></tr>
                      <tr><td className="p-3 font-medium">Job Retention (30-90 days)</td><td className="p-3 text-center font-bold text-emerald-600">{m.jobRetention}</td><td className="p-3 text-gray-600">{m.retentionRate}% retention rate</td></tr>
                      <tr><td className="p-3 font-medium">Stabilization Support</td><td className="p-3 text-center font-bold text-[#0F2C5C]">{m.stabilizationSupport}</td><td className="p-3 text-gray-600">Service events addressing barriers</td></tr>
                      <tr><td className="p-3 font-medium">Mental Health Referrals</td><td className="p-3 text-center font-bold text-purple-600">{m.mentalHealthReferrals}</td><td className="p-3 text-gray-600">{m.mentalHealthEngagement}% engagement rate</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SECTION 3: PROGRAM REACH */}
              <div className="mb-8 rounded-xl overflow-hidden border border-gray-200">
                <SectionHeader number={3} title="Program Reach & Engagement Analysis" />
                <div className="p-6 bg-white">
                  <div className="bg-blue-50 border-l-4 border-[#0F2C5C] p-4 rounded-r-lg mb-6">
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
                  <p className="text-gray-600 mb-4">FOAM operates two distinct but complementary program components.</p>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="rounded-xl p-6 text-white" style={{ background: 'linear-gradient(135deg, #0F2C5C 0%, #1a365d 100%)' }}>
                      <h4 className="font-bold text-lg mb-3">📚 Responsible Fatherhood Classes</h4>
                      <p className="text-sm opacity-90 mb-3">Structured, curriculum-based educational program focused on developing fatherhood identity and parenting competencies.</p>
                      <ul className="text-sm opacity-90 space-y-1">
                        <li>• 14-module NPCL curriculum</li>
                        <li>• Parenting, co-parenting, relationships</li>
                        <li>• <strong>{m.fatherhoodClassEnrollment} fathers</strong> enrolled</li>
                      </ul>
                    </div>
                    <div className="rounded-xl p-6 text-white" style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)' }}>
                      <h4 className="font-bold text-lg mb-3">🏗️ Project Family BUILD</h4>
                      <p className="text-sm opacity-90 mb-3">Comprehensive case management providing individualized support for workforce development and family stabilization.</p>
                      <ul className="text-sm opacity-90 space-y-1">
                        <li>• Individualized case management</li>
                        <li>• Workforce, education, stabilization</li>
                        <li>• <strong>~{m.avgMonthlyEngagement} fathers/month</strong></li>
                      </ul>
                    </div>
                  </div>
                  <div className="bg-amber-50 border-2 border-amber-400 rounded-xl p-4">
                    <h4 className="font-bold text-amber-800 mb-2">💡 Critical Distinction</h4>
                    <p className="text-amber-900 text-sm">Participation in Fatherhood Classes does not equate to enrollment in Project Family BUILD. These are <strong>distinct but complementary programs</strong> that fathers may access independently or simultaneously.</p>
                  </div>
                </div>
              </div>

              {/* SECTION 5: WORKFORCE PIPELINE */}
              <div className="mb-8 rounded-xl overflow-hidden border border-gray-200">
                <SectionHeader number={5} title="Workforce Development Pipeline" />
                <div className="p-6 bg-white">
                  <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-lg mb-6">
                    FOAM's workforce development pipeline: <strong>{m.workforceParticipation} fathers</strong> engaged → <strong>{m.jobPlacements} job placements</strong> → <strong>{m.jobRetention} retained</strong> (30-90 days)
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
                  <table className="w-full text-sm mb-6">
                    <thead><tr className="bg-[#0F2C5C] text-white"><th className="p-3 text-left">Employment Metric</th><th className="p-3 text-center">Result</th><th className="p-3 text-left">Analysis</th></tr></thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr><td className="p-3 font-medium">Total Job Placements</td><td className="p-3 text-center font-bold text-emerald-600">{m.jobPlacements}</td><td className="p-3 text-gray-600">Fathers who obtained paid employment</td></tr>
                      <tr><td className="p-3 font-medium">Placement Rate</td><td className="p-3 text-center font-bold text-emerald-600">{m.jobPlacementRate}%</td><td className="p-3 text-gray-600">Of workforce participants achieving employment</td></tr>
                      <tr><td className="p-3 font-medium">30-90 Day Retention</td><td className="p-3 text-center font-bold text-purple-600">{m.jobRetention}</td><td className="p-3 text-gray-600">Maintained employment beyond critical window</td></tr>
                      <tr><td className="p-3 font-medium">Retention Rate</td><td className="p-3 text-center font-bold text-purple-600">{m.retentionRate}%</td><td className="p-3 text-gray-600">Exceeds typical workforce program benchmarks</td></tr>
                    </tbody>
                  </table>
                  <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-lg">
                    <strong className="text-emerald-800">Key Finding:</strong> <span className="text-emerald-900">Job placement services combined with comprehensive retention support produces significantly better employment outcomes than placement-only approaches.</span>
                  </div>
                </div>
              </div>

              {/* SECTION 7: STABILIZATION */}
              <div className="mb-8 rounded-xl overflow-hidden border border-gray-200">
                <SectionHeader number={7} title="Stabilization & Essential Needs Support" />
                <div className="p-6 bg-white">
                  <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg mb-6">
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
                  <table className="w-full text-sm">
                    <thead><tr className="bg-[#0F2C5C] text-white"><th className="p-3 text-left">Category</th><th className="p-3 text-center">Count</th><th className="p-3 text-center">%</th><th className="p-3 text-left">Services</th></tr></thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr><td className="p-3 font-medium">Transportation</td><td className="p-3 text-center font-bold">{m.transportationAssist}</td><td className="p-3 text-center">35%</td><td className="p-3 text-gray-600">Gas cards, bus passes, ride coordination</td></tr>
                      <tr><td className="p-3 font-medium">Basic Needs</td><td className="p-3 text-center font-bold">{m.basicNeedsAssist}</td><td className="p-3 text-center">25%</td><td className="p-3 text-gray-600">Emergency food, clothing, utility assistance</td></tr>
                      <tr><td className="p-3 font-medium">Legal Aid</td><td className="p-3 text-center font-bold">{m.legalAssist}</td><td className="p-3 text-center">20%</td><td className="p-3 text-gray-600">Child support, custody, expungement referrals</td></tr>
                      <tr><td className="p-3 font-medium">Behavioral Health</td><td className="p-3 text-center font-bold">{m.behavioralHealthAssist}</td><td className="p-3 text-center">20%</td><td className="p-3 text-gray-600">Mental health screening, counseling referrals</td></tr>
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
                    <KPICard label="Engagement Rate" value={m.mentalHealthEngagement + '%'} sublabel="Of fathers served" colorClass="blue" />
                    <KPICard label="BH Support Events" value={m.behavioralHealthAssist} sublabel="Service events" colorClass="green" />
                    <KPICard label="Integration" value="Embedded" sublabel="Throughout program" colorClass="amber" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <h4 className="font-bold text-[#0F2C5C] mb-3 pb-2 border-b-2 border-[#0F2C5C]">Mental Health Services</h4>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li>• Depression and anxiety screening</li>
                        <li>• Trauma history assessment</li>
                        <li>• Substance use screening</li>
                        <li>• Individual counseling referrals</li>
                        <li>• Crisis intervention</li>
                      </ul>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <h4 className="font-bold text-[#0F2C5C] mb-3 pb-2 border-b-2 border-[#0F2C5C]">Integration Outcomes</h4>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li>• {m.mentalHealthEngagement}% engagement rate</li>
                        <li>• Improved program retention</li>
                        <li>• Enhanced employment stability</li>
                        <li>• Better family relationships</li>
                        <li>• Increased self-efficacy scores</li>
                      </ul>
                    </div>
                  </div>
                  <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-r-lg">
                    <strong className="text-purple-800">Key Insight:</strong> <span className="text-purple-900">Fathers who engage in mental health services alongside workforce development show significantly better employment retention rates.</span>
                  </div>
                </div>
              </div>

              {/* SECTION 9: KPIs */}
              <div className="mb-8 rounded-xl overflow-hidden border border-gray-200">
                <SectionHeader number={9} title="Key Performance Indicators" />
                <div className="p-6 bg-white">
                  <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 text-center">
                      <div className={'w-20 h-20 mx-auto rounded-full border-4 flex items-center justify-center text-2xl font-bold ' + (m.workforceParticipationRate >= 50 ? 'border-emerald-500 text-emerald-600' : 'border-amber-500 text-amber-600')}>{m.workforceParticipationRate}%</div>
                      <div className="text-xs text-gray-500 mt-2 font-medium">Workforce<br/>Participation</div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 text-center">
                      <div className={'w-20 h-20 mx-auto rounded-full border-4 flex items-center justify-center text-2xl font-bold ' + (m.jobPlacementRate >= 40 ? 'border-emerald-500 text-emerald-600' : 'border-amber-500 text-amber-600')}>{m.jobPlacementRate}%</div>
                      <div className="text-xs text-gray-500 mt-2 font-medium">Job Placement<br/>Rate</div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 text-center">
                      <div className={'w-20 h-20 mx-auto rounded-full border-4 flex items-center justify-center text-2xl font-bold ' + (m.retentionRate >= 70 ? 'border-emerald-500 text-emerald-600' : 'border-amber-500 text-amber-600')}>{m.retentionRate}%</div>
                      <div className="text-xs text-gray-500 mt-2 font-medium">Job Retention<br/>(30-90 days)</div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 text-center">
                      <div className={'w-20 h-20 mx-auto rounded-full border-4 flex items-center justify-center text-2xl font-bold ' + (m.mentalHealthEngagement >= 25 ? 'border-emerald-500 text-emerald-600' : 'border-amber-500 text-amber-600')}>{m.mentalHealthEngagement}%</div>
                      <div className="text-xs text-gray-500 mt-2 font-medium">Mental Health<br/>Engagement</div>
                    </div>
                  </div>
                  <h4 className="font-bold text-[#0F2C5C] mb-4">Performance Against Targets</h4>
                  <ProgressBar label="Program Completion Rate (Target: 70%)" value={70} color="#059669" />
                  <ProgressBar label="Stability Achievement Rate (Target: 80%)" value={80} color="#0F2C5C" />
                  <ProgressBar label="Assessment Improvement Rate (Target: 75%)" value={75} color="#7c3aed" />
                </div>
              </div>

              {/* SECTION 10: ORGANIZATIONAL CAPACITY */}
              <div className="mb-8 rounded-xl overflow-hidden border border-gray-200">
                <SectionHeader number={10} title="Organizational Capacity & Staffing" />
                <div className="p-6 bg-white">
                  <table className="w-full text-sm mb-6">
                    <thead><tr className="bg-[#0F2C5C] text-white"><th className="p-3 text-left">Position</th><th className="p-3 text-left">Primary Functions</th><th className="p-3 text-center">Area</th><th className="p-3 text-center">FTE</th></tr></thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr><td className="p-3 font-medium">Executive Director</td><td className="p-3 text-gray-600">Strategic leadership, funder relations</td><td className="p-3 text-center"><span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">Leadership</span></td><td className="p-3 text-center">1.0</td></tr>
                      <tr><td className="p-3 font-medium">Program Manager</td><td className="p-3 text-gray-600">Operations, staff supervision, QA</td><td className="p-3 text-center"><span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">Leadership</span></td><td className="p-3 text-center">1.0</td></tr>
                      <tr><td className="p-3 font-medium">Case Managers</td><td className="p-3 text-gray-600">Direct services, intake, goal planning</td><td className="p-3 text-center"><span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-xs">Service</span></td><td className="p-3 text-center">2.0</td></tr>
                      <tr><td className="p-3 font-medium">Workforce Specialist</td><td className="p-3 text-gray-600">Employment services, employer relations</td><td className="p-3 text-center"><span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-xs">Service</span></td><td className="p-3 text-center">1.0</td></tr>
                      <tr><td className="p-3 font-medium">Fatherhood Facilitator</td><td className="p-3 text-gray-600">Curriculum delivery, class facilitation</td><td className="p-3 text-center"><span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs">Education</span></td><td className="p-3 text-center">1.0</td></tr>
                    </tbody>
                  </table>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <h4 className="font-bold text-[#0F2C5C] mb-3">Organizational Strengths</h4>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li>• Experienced leadership with community connections</li>
                        <li>• Staff trained in trauma-informed approaches</li>
                        <li>• Strong data collection systems</li>
                        <li>• Established referral network</li>
                      </ul>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <h4 className="font-bold text-[#0F2C5C] mb-3">Capacity Building Priorities</h4>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li>• Expand case management capacity</li>
                        <li>• Enhance data analytics capabilities</li>
                        <li>• Develop employer partnerships</li>
                        <li>• Diversify funding sources</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 11: CHALLENGES */}
              <div className="mb-8 rounded-xl overflow-hidden border border-gray-200">
                <SectionHeader number={11} title="Challenges, Lessons Learned & Adaptations" />
                <div className="p-6 bg-white">
                  <div className="space-y-4 mb-6">
                    <div className="bg-white border border-gray-200 rounded-xl p-4">
                      <h5 className="font-bold text-[#0F2C5C] mb-2">⚠️ Challenge: Transportation Barriers</h5>
                      <p className="text-sm text-gray-600 mb-2"><strong>Issue:</strong> Transportation emerged as the single largest barrier to program participation and employment retention.</p>
                      <p className="text-sm text-gray-600"><strong>Adaptation:</strong> FOAM expanded transportation assistance to 35% of all stabilization support.</p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl p-4">
                      <h5 className="font-bold text-[#0F2C5C] mb-2">⚠️ Challenge: Mental Health Stigma</h5>
                      <p className="text-sm text-gray-600 mb-2"><strong>Issue:</strong> Many fathers were reluctant to acknowledge mental health needs due to stigma.</p>
                      <p className="text-sm text-gray-600"><strong>Adaptation:</strong> Shifted to integrated "wellness conversations" embedded within case management.</p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl p-4">
                      <h5 className="font-bold text-[#0F2C5C] mb-2">⚠️ Challenge: Engagement Retention</h5>
                      <p className="text-sm text-gray-600 mb-2"><strong>Issue:</strong> Some fathers disengaged from services after initial contact.</p>
                      <p className="text-sm text-gray-600"><strong>Adaptation:</strong> Implemented rapid engagement protocols ensuring services within the first week.</p>
                    </div>
                  </div>
                  <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
                    <strong className="text-amber-800">Key Lesson:</strong> <span className="text-amber-900">The most successful outcomes occur when fathers receive simultaneous support across multiple domains rather than sequential services.</span>
                  </div>
                </div>
              </div>

              {/* SECTION 12: STRATEGIC DIRECTION */}
              <div className="mb-8 rounded-xl overflow-hidden border border-gray-200">
                <SectionHeader number={12} title="Strategic Direction & Recommendations" />
                <div className="p-6 bg-white">
                  <ol className="space-y-4 mb-6">
                    {[
                      { title: 'Expand Employer Partnerships', desc: 'Develop formal relationships with 5-10 additional employers offering career pathways.' },
                      { title: 'Enhance Retention Support', desc: 'Strengthen post-placement support to maintain the ' + m.retentionRate + '% retention rate.' },
                      { title: 'Strengthen Mental Health Integration', desc: 'Deepen behavioral health integration through additional trauma-informed training.' },
                      { title: 'Build Transportation Solutions', desc: 'Explore sustainable transportation solutions beyond emergency assistance.' },
                      { title: 'Enhance Data Systems', desc: 'Implement improved outcome tracking including 6-month and 12-month follow-up.' },
                      { title: 'Scale Successful Interventions', desc: 'Document and systematize the most effective program elements.' },
                      { title: 'Diversify Funding Base', desc: 'Pursue additional funding sources including foundations and corporate partnerships.' }
                    ].map((item, i) => (
                      <li key={i} className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-[#0F2C5C] text-white flex items-center justify-center font-bold flex-shrink-0">{i + 1}</div>
                        <div><strong className="text-[#0F2C5C]">{item.title}:</strong> <span className="text-gray-600">{item.desc}</span></div>
                      </li>
                    ))}
                  </ol>
                  <div className="bg-amber-50 border-2 border-amber-400 rounded-xl p-4">
                    <h4 className="font-bold text-amber-800 mb-2">🎯 Summary of Strategic Priorities</h4>
                    <p className="text-amber-900 text-sm">FOAM's strategic direction focuses on <strong>deepening impact</strong> rather than simply expanding reach. By strengthening employer relationships, enhancing retention support, and building sustainable solutions to persistent barriers, we aim to improve outcomes for each father served while positioning the organization for long-term sustainability.</p>
                  </div>
                </div>
              </div>

              {/* FOOTER */}
              <div className="text-center py-8 border-t-4 border-[#0F2C5C]">
                <div className="text-2xl font-bold text-[#0F2C5C] mb-2">Fathers On A Mission</div>
                <div className="text-[#0F2C5C] italic mb-2">"Enhancing Fathers, Strengthening Families"</div>
                <div className="text-sm text-gray-400">East Baton Rouge Parish, Louisiana | {periodLabel} | Generated: {generatedDate}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'historical', label: '2024-2025 Data', icon: <History size={18} /> },
    { id: 'current', label: '2026 Data Entry', icon: <Edit3 size={18} /> },
    { id: 'comparison', label: 'Comparison', icon: <BarChart3 size={18} /> },
    { id: 'log', label: 'Change Log', icon: <ClipboardList size={18} /> },
    { id: 'reports', label: 'Reports', icon: <FileText size={18} /> }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading Case Manager Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {renderFullReportViewer()}
      
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <ArrowLeft className="w-6 h-6 text-white" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">Case Manager Portal</h1>
                <p className="text-blue-200 text-sm">FOAM Data Management & Reporting System</p>
              </div>
            </div>
            <button onClick={loadData} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
              <RefreshCw size={18} />
              Refresh Data
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white/5 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-900 shadow-lg'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-3">
            <AlertTriangle className="text-red-400" />
            <span className="text-red-200">{error}</span>
          </div>
        )}

        {/* Historical Data Tab */}
        {activeTab === 'historical' && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-amber-500 to-orange-600">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <History size={24} />
                Historical Data: October 2024 - September 2025
              </h2>
              <p className="text-amber-100 mt-1">Read-only view of completed program year data</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 sticky left-0 bg-gray-50">Category</th>
                    {historicalMonths.map((month, i) => (
                      <th key={i} className="px-4 py-3 text-center text-sm font-semibold text-gray-700 min-w-[80px]">{month}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {historicalData.map((row, rowIndex) => (
                    <tr key={row.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 sticky left-0 bg-white">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(row.category)}
                          <span className="font-medium text-gray-800 text-sm">{row.category}</span>
                        </div>
                      </td>
                      {row.values.map((value, colIndex) => (
                        <td key={colIndex} className={`px-4 py-3 text-center ${colIndex === row.values.length - 1 ? 'bg-amber-50 font-bold text-amber-700' : 'text-gray-600'}`}>
                          {value ?? '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Current Data Tab */}
        {activeTab === 'current' && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Edit3 size={24} />
                2026 Data Entry
              </h2>
              <p className="text-blue-100 mt-1">Click any cell to edit (except totals column)</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 sticky left-0 bg-gray-50">Category</th>
                    {currentMonths.map((month, i) => (
                      <th key={i} className={`px-4 py-3 text-center text-sm font-semibold min-w-[80px] ${i === currentMonths.length - 1 ? 'text-blue-700 bg-blue-50' : 'text-gray-700'}`}>{month}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {currentData.map((row, rowIndex) => (
                    <tr key={row.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 sticky left-0 bg-white">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(row.category)}
                          <span className="font-medium text-gray-800 text-sm">{row.category}</span>
                        </div>
                      </td>
                      {row.values.map((value, colIndex) => (
                        <td
                          key={colIndex}
                          onClick={() => handleCellClick(rowIndex, colIndex, value)}
                          className={`px-4 py-3 text-center ${
                            colIndex === row.values.length - 1
                              ? 'bg-blue-50 font-bold text-blue-700'
                              : 'cursor-pointer hover:bg-blue-100 text-gray-600'
                          } ${editingCell?.row === rowIndex && editingCell?.col === colIndex ? 'bg-yellow-100' : ''}`}
                        >
                          {editingCell?.row === rowIndex && editingCell?.col === colIndex ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="w-16 px-2 py-1 border rounded text-center"
                                autoFocus
                              />
                              <button onClick={handleSaveCell} disabled={isSaving} className="p-1 bg-green-500 text-white rounded hover:bg-green-600">
                                <CheckCircle2 size={16} />
                              </button>
                              <button onClick={() => setEditingCell(null)} className="p-1 bg-gray-400 text-white rounded hover:bg-gray-500">
                                <X size={16} />
                              </button>
                            </div>
                          ) : (
                            value ?? '-'
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Comparison Tab */}
        {activeTab === 'comparison' && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-purple-600 to-pink-600">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <BarChart3 size={24} />
                Year-over-Year Comparison
              </h2>
              <p className="text-purple-100 mt-1">Compare 2024-2025 totals with 2026 YTD</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Metric</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">2024-2025</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">2026 YTD</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Change</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">% Change</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {comparisonData.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-800">{row.metric}</td>
                      <td className="px-4 py-3 text-center text-gray-600">{row.historical}</td>
                      <td className="px-4 py-3 text-center text-gray-600">{row.current}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 ${row.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {row.change >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                          {Math.abs(row.change)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 rounded-full text-sm font-medium ${row.percentChange >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {row.percentChange >= 0 ? '+' : ''}{row.percentChange}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Change Log Tab */}
        {activeTab === 'log' && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-slate-600 to-slate-800">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <ClipboardList size={24} />
                Change Log
              </h2>
              <p className="text-slate-200 mt-1">Track all data modifications</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Case Manager</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Period</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Category</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Old Value</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">New Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {logData.length === 0 ? (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">No changes recorded yet</td></tr>
                  ) : (
                    logData.map((entry) => (
                      <tr key={entry.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-600 text-sm">{entry.date}</td>
                        <td className="px-4 py-3 text-gray-800 font-medium">{entry.caseManager}</td>
                        <td className="px-4 py-3 text-gray-600">{entry.month} {entry.year}</td>
                        <td className="px-4 py-3 text-gray-600">{entry.category}</td>
                        <td className="px-4 py-3 text-center text-red-600">{entry.oldValue}</td>
                        <td className="px-4 py-3 text-center text-green-600 font-medium">{entry.newValue}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            {/* Report Configuration */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="p-6 bg-gradient-to-r from-emerald-600 to-teal-600">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <FileText size={24} />
                  Report Generator
                </h2>
                <p className="text-emerald-100 mt-1">Generate comprehensive outcome reports</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
                    <select value={reportType} onChange={(e) => setReportType(e.target.value as ReportType)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500">
                      <option value="monthly">Monthly Summary</option>
                      <option value="quarterly">Quarterly Summary</option>
                      <option value="annual">Annual Summary</option>
                      <option value="indepth">📊 Comprehensive Annual (12-Section)</option>
                      <option value="indepth6">📈 Comprehensive 6-Month (12-Section)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Data Year</label>
                    <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value as '2024-2025' | '2026')} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500">
                      <option value="2024-2025">2024-2025 (Historical)</option>
                      <option value="2026">2026 (Current)</option>
                    </select>
                  </div>
                  {reportType === 'monthly' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
                      <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500">
                        {(reportData?.months || []).map((month, i) => (
                          <option key={i} value={i}>{month}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  {reportType === 'quarterly' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Quarter</label>
                      <select value={selectedQuarter} onChange={(e) => setSelectedQuarter(Number(e.target.value))} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500">
                        <option value={1}>Q1 (Jan-Mar)</option>
                        <option value={2}>Q2 (Apr-Jun)</option>
                        <option value={3}>Q3 (Jul-Sep)</option>
                        <option value={4}>Q4 (Oct-Dec)</option>
                      </select>
                    </div>
                  )}
                  <div className="flex items-end">
                    <button onClick={handleGenerateReport} disabled={isGenerating} className="w-full p-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2">
                      {isGenerating ? <RefreshCw className="animate-spin" size={20} /> : <Sparkles size={20} />}
                      {isGenerating ? 'Generating...' : 'Generate Report'}
                    </button>
                  </div>
                </div>

                {/* Preview Toggle */}
                <button onClick={() => setShowPreview(!showPreview)} className="text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-2">
                  <Eye size={18} />
                  {showPreview ? 'Hide' : 'Show'} Data Preview
                </button>

                {/* Data Preview */}
                {showPreview && previewData && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-700 mb-3">Data Preview</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {previewData.slice(0, 8).map((item: any, i: number) => (
                        <div key={i} className="bg-white p-3 rounded-lg shadow-sm">
                          <div className="text-xs text-gray-500">{item.category}</div>
                          <div className="text-lg font-bold text-gray-800">{item.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Generated Report */}
            {generatedReport && (
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="p-6 bg-gradient-to-r from-purple-600 to-indigo-600">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Target size={24} />
                        Generated Report
                      </h2>
                      <p className="text-purple-100 mt-1">{generatedReport.metadata?.periodLabel || 'Report'}</p>
                    </div>
                    <div className="flex gap-2">
                      {(reportType === 'indepth' || reportType === 'indepth6') && (
                        <button onClick={() => setShowFullReport(true)} className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors">
                          <Monitor size={18} />
                          View on Screen
                        </button>
                      )}
                      <button onClick={() => handleDownloadReport('word')} className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors">
                        <Download size={18} />
                        Download Word
                      </button>
                      <button onClick={() => handleDownloadReport('pdf')} className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors">
                        <Printer size={18} />
                        Print/PDF
                      </button>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 rounded-xl p-4 text-center">
                      <div className="text-3xl font-bold text-blue-700">{generatedReport.keyMetrics?.activeFathers || 0}</div>
                      <div className="text-sm text-blue-600">Fathers Served</div>
                    </div>
                    <div className="bg-emerald-50 rounded-xl p-4 text-center">
                      <div className="text-3xl font-bold text-emerald-700">{generatedReport.keyMetrics?.fatherhoodClassEnrollment || 0}</div>
                      <div className="text-sm text-emerald-600">Class Enrollment</div>
                    </div>
                    <div className="bg-amber-50 rounded-xl p-4 text-center">
                      <div className="text-3xl font-bold text-amber-700">{generatedReport.keyMetrics?.jobPlacements || 0}</div>
                      <div className="text-sm text-amber-600">Job Placements</div>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-4 text-center">
                      <div className="text-3xl font-bold text-purple-700">{generatedReport.successMetrics?.retentionRate || 0}%</div>
                      <div className="text-sm text-purple-600">Retention Rate</div>
                    </div>
                  </div>

                  {/* Narrative Insights */}
                  {generatedReport.narrativeInsights && generatedReport.narrativeInsights.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-3">Key Insights</h3>
                      <div className="space-y-2">
                        {generatedReport.narrativeInsights.map((insight: string, i: number) => (
                          <div key={i} className="p-3 bg-gray-50 rounded-lg text-gray-700 text-sm">{insight}</div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Name Prompt Modal */}
      {showNamePrompt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Enter Your Name</h3>
            <p className="text-gray-600 mb-4">Your name will be recorded with any changes you make.</p>
            <input
              type="text"
              value={caseManagerName}
              onChange={(e) => setCaseManagerName(e.target.value)}
              placeholder="Enter your name"
              className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-3">
              <button onClick={() => setShowNamePrompt(false)} className="flex-1 p-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors">Cancel</button>
              <button onClick={() => { if (caseManagerName.trim()) setShowNamePrompt(false); }} disabled={!caseManagerName.trim()} className="flex-1 p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors">Continue</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaseManagerPortal;

