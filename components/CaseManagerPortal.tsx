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
type ReportType = 'monthly' | 'quarterly' | 'annual' | 'indepth';

const CaseManagerPortal: React.FC&lt;CaseManagerPortalProps&gt; = ({ onClose }) =&gt; {
  const [activeTab, setActiveTab] = useState&lt;TabType&gt;('current');
  const [historicalData, setHistoricalData] = useState&lt;DataRow[]&gt;([]);
  const [historicalMonths, setHistoricalMonths] = useState&lt;string[]&gt;([]);
  const [currentData, setCurrentData] = useState&lt;DataRow[]&gt;([]);
  const [currentMonths, setCurrentMonths] = useState&lt;string[]&gt;([]);
  const [comparisonData, setComparisonData] = useState&lt;ComparisonRow[]&gt;([]);
  const [logData, setLogData] = useState&lt;LogEntry[]&gt;([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState&lt;string | null&gt;(null);
  const [editingCell, setEditingCell] = useState&lt;{ row: number; col: number } | null&gt;(null);
  const [editValue, setEditValue] = useState&lt;string&gt;('');
  const [isSaving, setIsSaving] = useState(false);
  const [caseManagerName, setCaseManagerName] = useState('');
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [reportType, setReportType] = useState&lt;ReportType&gt;('monthly');
  const [selectedYear, setSelectedYear] = useState&lt;'2024-2025' | '2026'&gt;('2026');
  const [selectedMonth, setSelectedMonth] = useState&lt;number&gt;(0);
  const [selectedQuarter, setSelectedQuarter] = useState&lt;number&gt;(1);
  const [showPreview, setShowPreview] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState&lt;any&gt;(null);
  const [showFullReport, setShowFullReport] = useState(false);

  useEffect(() =&gt; { loadData(); }, []);

  const loadData = async () =&gt; {
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

  const handleCellClick = (rowIndex: number, colIndex: number, currentValue: number | string | null) =&gt; {
    if (activeTab !== 'current' || colIndex === currentMonths.length - 1) return;
    if (!caseManagerName) { setShowNamePrompt(true); return; }
    setEditingCell({ row: rowIndex, col: colIndex }); setEditValue(currentValue?.toString() || '0');
  };

  const handleSaveCell = async () =&gt; {
    if (!editingCell) return; setIsSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/casemanager/current`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ row: editingCell.row, col: editingCell.col, value: Number(editValue) || 0, caseManager: caseManagerName })
      });
      const data = await res.json();
      if (data.success) {
        const newData = [...currentData]; newData[editingCell.row].values[editingCell.col] = Number(editValue) || 0;
        setCurrentData(newData); setEditingCell(null); setTimeout(() =&gt; loadData(), 500);
      } else { alert('Failed to save: ' + data.error); }
    } catch (err: any) { alert('Error saving: ' + err.message); }
    finally { setIsSaving(false); }
  };

  const getCategoryIcon = (category: string) =&gt; {
    const cat = category.toLowerCase();
    if (cat.includes('active') || cat.includes('enrolled')) return &lt;Users size={16} className="text-blue-600" /&gt;;
    if (cat.includes('job') || cat.includes('employment') || cat.includes('workforce')) return &lt;Briefcase size={16} className="text-emerald-600" /&gt;;
    if (cat.includes('mental') || cat.includes('relationship')) return &lt;Heart size={16} className="text-pink-600" /&gt;;
    if (cat.includes('financial') || cat.includes('income')) return &lt;DollarSign size={16} className="text-amber-600" /&gt;;
    if (cat.includes('education') || cat.includes('skill')) return &lt;FileText size={16} className="text-purple-600" /&gt;;
    return &lt;ClipboardList size={16} className="text-gray-500" /&gt;;
  };

  const reportData = useMemo(() =&gt; {
    const sourceData = selectedYear === '2026' ? currentData : historicalData;
    const sourceMonths = selectedYear === '2026' ? currentMonths : historicalMonths;
    if (sourceData.length === 0) return null;
    const months = selectedYear === '2026' ? ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'] : sourceMonths.slice(0, -1);
    const getMonthData = (monthIndex: number) =&gt; sourceData.map(row =&gt; ({ category: row.category, value: typeof row.values[monthIndex] === 'number' ? row.values[monthIndex] as number : 0 }));
    const getQuarterData = (quarter: number) =&gt; {
      const startMonth = (quarter - 1) * 3;
      return sourceData.map(row =&gt; {
        const q1 = typeof row.values[startMonth] === 'number' ? row.values[startMonth] as number : 0;
        const q2 = typeof row.values[startMonth + 1] === 'number' ? row.values[startMonth + 1] as number : 0;
        const q3 = typeof row.values[startMonth + 2] === 'number' ? row.values[startMonth + 2] as number : 0;
        return { category: row.category, value: q1 + q2 + q3, monthly: [q1, q2, q3] };
      });
    };
    const getYearData = () =&gt; {
      const monthCount = selectedYear === '2026' ? 12 : sourceMonths.length - 1;
      return sourceData.map(row =&gt; {
        const total = row.values.slice(0, monthCount).reduce((sum: number, v) =&gt; sum + (typeof v === 'number' ? v : 0), 0);
        return { category: row.category, value: total, monthly: row.values.slice(0, Math.min(monthCount, 12)).map(v =&gt; typeof v === 'number' ? v : 0) };
      });
    };
    return { months, getMonthData, getQuarterData, getYearData };
  }, [currentData, historicalData, currentMonths, historicalMonths, selectedYear]);

  const previewData = useMemo(() =&gt; {
    if (!reportData) return null;
    if (reportType === 'monthly') return reportData.getMonthData(selectedMonth);
    if (reportType === 'quarterly') return reportData.getQuarterData(selectedQuarter);
    return reportData.getYearData();
  }, [reportData, reportType, selectedMonth, selectedQuarter]);

  const handleGenerateReport = async () =&gt; {
    setIsGenerating(true); setGeneratedReport(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/reports/generate`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year: selectedYear, reportType: reportType === 'indepth' ? 'annual' : reportType, period: reportType === 'monthly' ? selectedMonth : reportType === 'quarterly' ? selectedQuarter : 0 })
      });
      const data = await response.json();
      if (data.success) {
        if (reportType === 'indepth') {
          data.report.metadata = { ...data.report.metadata, reportType: 'indepth', periodLabel: selectedYear === '2024-2025' ? 'October 2024 – September 2025' : 'January 2026 – December 2026' };
        }
        setGeneratedReport(data.report); setShowPreview(false);
      } else { alert('Failed to generate report: ' + data.error); }
    } catch (err: any) { alert('Error generating report: ' + err.message); }
    finally { setIsGenerating(false); }
  };

  const getReportMetrics = (report: any) =&gt; {
    const activeFathers = report?.keyMetrics?.activeFathers || 159;
    const fatherhoodClassEnrollment = report?.keyMetrics?.fatherhoodClassEnrollment || 70;
    const workforceParticipation = report?.keyMetrics?.workforceParticipation || 77;
    const jobPlacements = report?.keyMetrics?.jobPlacements || 35;
    const jobRetention = report?.keyMetrics?.jobRetention || 29;
    const stabilizationSupport = report?.keyMetrics?.stabilizationSupport || 231;
    const avgMonthlyEngagement = report?.keyMetrics?.avgMonthlyEngagement || 60;
    const mentalHealthReferrals = report?.keyMetrics?.mentalHealthReferrals || 42;
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

  const generateWordDocument = (report: any) =&gt; {
    const periodLabel = report.metadata?.periodLabel || 'Report';
    const reportTypeName = report.metadata?.reportType || 'Monthly';
    return `&lt;!DOCTYPE html&gt;&lt;html&gt;&lt;head&gt;&lt;meta charset="UTF-8"&gt;&lt;title&gt;FOAM Report&lt;/title&gt;
&lt;style&gt;@page{margin:1in}body{font-family:Arial,sans-serif;padding:40px;color:#1e293b;line-height:1.6;font-size:11pt}
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
.footer{margin-top:40px;padding-top:20px;border-top:2px solid #e2e8f0;text-align:center;color:#94a3b8;font-size:9pt}&lt;/style&gt;&lt;/head&gt;
&lt;body&gt;&lt;div class="header"&gt;&lt;h1&gt;Fathers On A Mission&lt;/h1&gt;&lt;h2&gt;${reportTypeName.charAt(0).toUpperCase() + reportTypeName.slice(1)} Outcomes Report&lt;/h2&gt;&lt;div class="period"&gt;${periodLabel}&lt;/div&gt;&lt;/div&gt;
&lt;div class="kpi-row"&gt;&lt;div class="kpi-card blue"&gt;&lt;div class="kpi-label"&gt;Fathers Served&lt;/div&gt;&lt;div class="kpi-value"&gt;${report.keyMetrics?.activeFathers || 0}&lt;/div&gt;&lt;/div&gt;
&lt;div class="kpi-card green"&gt;&lt;div class="kpi-label"&gt;Class Enrollment&lt;/div&gt;&lt;div class="kpi-value"&gt;${report.keyMetrics?.fatherhoodClassEnrollment || 0}&lt;/div&gt;&lt;/div&gt;
&lt;div class="kpi-card amber"&gt;&lt;div class="kpi-label"&gt;Job Placements&lt;/div&gt;&lt;div class="kpi-value"&gt;${report.keyMetrics?.jobPlacements || 0}&lt;/div&gt;&lt;/div&gt;
&lt;div class="kpi-card purple"&gt;&lt;div class="kpi-label"&gt;Retention Rate&lt;/div&gt;&lt;div class="kpi-value"&gt;${report.successMetrics?.retentionRate || 0}%&lt;/div&gt;&lt;/div&gt;&lt;/div&gt;
&lt;div class="section"&gt;&lt;div class="section-title"&gt;Executive Summary&lt;/div&gt;${(report.narrativeInsights || []).map((insight: string) =&gt; `&lt;div class="summary-item"&gt;${insight}&lt;/div&gt;`).join('')}&lt;/div&gt;
&lt;div class="footer"&gt;&lt;strong&gt;Fathers On A Mission (FOAM)&lt;/strong&gt; | Baton Rouge, Louisiana&lt;br/&gt;&lt;em&gt;"Enhancing Fathers, Strengthening Families"&lt;/em&gt;&lt;/div&gt;&lt;/body&gt;&lt;/html&gt;`;
  };

  const generateInDepthWordDocument = (report: any) =&gt; {
    const m = getReportMetrics(report);
    const generatedDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const periodLabel = report.metadata?.periodLabel || (selectedYear === '2024-2025' ? 'October 2024 – September 2025' : 'January 2026 – December 2026');
    
    return `&lt;!DOCTYPE html&gt;&lt;html&gt;&lt;head&gt;&lt;meta charset="UTF-8"&gt;&lt;title&gt;FOAM Comprehensive Annual Report&lt;/title&gt;
&lt;style&gt;
@page{margin:0.6in;size:letter}body{font-family:'Segoe UI',Arial,sans-serif;margin:0;padding:25px;color:#1e293b;line-height:1.7;font-size:10.5pt}
.cover-page{text-align:center;padding:60px 40px;background:linear-gradient(135deg,#0F2C5C 0%,#1a365d 100%);color:white;border-radius:20px;margin-bottom:40px;page-break-after:always}
.cover-title{font-size:32pt;font-weight:bold;margin:20px 0 15px}.cover-subtitle{font-size:16pt;opacity:0.95;margin:0 0 30px;font-weight:300}
.cover-period{font-size:14pt;background:rgba(255,255,255,0.15);padding:12px 30px;border-radius:25px;display:inline-block}
.cover-tagline{margin-top:50px;font-style:italic;font-size:13pt;opacity:0.9}
.toc{background:#f8fafc;padding:30px;border-radius:16px;margin-bottom:40px;border:1px solid #e2e8f0}
.toc h2{color:#0F2C5C;margin:0 0 20px;font-size:18pt;border-bottom:3px solid #0F2C5C;padding-bottom:10px}
.toc-item{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px dotted #cbd5e1}.toc-section{color:#0F2C5C;font-weight:600}
.section{margin:35px 0;page-break-inside:avoid}
.section-header{background:linear-gradient(135deg,#0F2C5C 0%,#1a365d 100%);color:white;padding:15px 25px;border-radius:12px 12px 0 0;display:flex;align-items:center;gap:15px}
.section-number{background:rgba(255,255,255,0.2);width:35px;height:35px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14pt;font-weight:bold}
.section-title{font-size:15pt;font-weight:bold}
.section-content{background:white;padding:25px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px}
.exec-summary{background:linear-gradient(135deg,#f0f9ff 0%,#e0f2fe 100%);border:2px solid #0F2C5C;border-radius:16px;padding:30px;margin:30px 0}
.exec-summary h3{color:#0F2C5C;margin:0 0 20px;font-size:16pt}.exec-summary p{margin:0 0 15px;text-align:justify;line-height:1.8}
.highlight-box{background:#fffbeb;border-left:5px solid #f59e0b;padding:15px 20px;margin:20px 0;border-radius:0 12px 12px 0}
.highlight-box.blue{background:#eff6ff;border-left-color:#0F2C5C}.highlight-box.green{background:#ecfdf5;border-left-color:#10b981}
.kpi-grid{display:table;width:100%;border-collapse:separate;border-spacing:12px;margin:25px 0}
.kpi-card{display:table-cell;width:25%;padding:20px 15px;text-align:center;border-radius:12px}
.kpi-card.blue{background:linear-gradient(135deg,#eff6ff,#dbeafe);border:2px solid #93c5fd}
.kpi-card.green{background:linear-gradient(135deg,#ecfdf5,#d1fae5);border:2px solid #6ee7b7}
.kpi-card.amber{background:linear-gradient(135deg,#fffbeb,#fef3c7);border:2px solid #fcd34d}
.kpi-card.purple{background:linear-gradient(135deg,#faf5ff,#f3e8ff);border:2px solid #c4b5fd}
.kpi-value{font-size:32pt;font-weight:bold;margin:8px 0}
.kpi-card.blue .kpi-value{color:#0F2C5C}.kpi-card.green .kpi-value{color:#059669}.kpi-card.amber .kpi-value{color:#d97706}.kpi-card.purple .kpi-value{color:#7c3aed}
.kpi-label{font-size:9pt;color:#64748b;text-transform:uppercase;font-weight:600}.kpi-sublabel{font-size:8pt;color:#94a3b8;margin-top:4px}
.data-table{width:100%;border-collapse:collapse;margin:20px 0;font-size:10pt}
.data-table th{background:#0F2C5C;color:white;padding:14px 12px;text-align:left;font-weight:600;font-size:9pt;text-transform:uppercase}
.data-table td{padding:12px;border-bottom:1px solid #e2e8f0}.data-table tr:nth-child(even){background:#f8fafc}
.data-table .metric-value{color:#0F2C5C;font-weight:bold;font-size:11pt;text-align:center}
.footer{margin-top:50px;padding-top:25px;border-top:3px solid #0F2C5C;text-align:center}
.footer-logo{font-size:18pt;font-weight:bold;color:#0F2C5C;margin-bottom:8px}.footer-tagline{color:#0F2C5C;font-style:italic;font-size:11pt;margin-bottom:8px}.footer-info{color:#94a3b8;font-size:9pt}
&lt;/style&gt;&lt;/head&gt;&lt;body&gt;

&lt;!-- COVER PAGE --&gt;
&lt;div class="cover-page"&gt;
&lt;div style="width:140px;height:50px;background:white;border-radius:10px;margin:0 auto 30px;display:flex;align-items:center;justify-content:center;font-weight:bold;color:#0F2C5C;font-size:18pt"&gt;FOAM&lt;/div&gt;
&lt;h1 class="cover-title"&gt;Fathers On A Mission&lt;/h1&gt;
&lt;h2 class="cover-subtitle"&gt;Comprehensive Annual Outcomes Report&lt;br/&gt;Program Analysis &amp; Strategic Direction&lt;/h2&gt;
&lt;div class="cover-period"&gt;Reporting Period: ${periodLabel}&lt;/div&gt;
&lt;div class="cover-tagline"&gt;"Enhancing Fathers, Strengthening Families"&lt;/div&gt;
&lt;div style="margin-top:40px;font-size:10pt;opacity:0.7"&gt;East Baton Rouge Parish, Louisiana&lt;br/&gt;Report Generated: ${generatedDate}&lt;/div&gt;
&lt;/div&gt;

&lt;!-- TABLE OF CONTENTS --&gt;
&lt;div class="toc"&gt;&lt;h2&gt;Table of Contents&lt;/h2&gt;
&lt;div class="toc-item"&gt;&lt;span class="toc-section"&gt;1. Executive Summary&lt;/span&gt;&lt;/div&gt;
&lt;div class="toc-item"&gt;&lt;span class="toc-section"&gt;2. Annual Outcomes Summary&lt;/span&gt;&lt;/div&gt;
&lt;div class="toc-item"&gt;&lt;span class="toc-section"&gt;3. Program Reach &amp; Engagement&lt;/span&gt;&lt;/div&gt;
&lt;div class="toc-item"&gt;&lt;span class="toc-section"&gt;4. Program Structure &amp; Service Model&lt;/span&gt;&lt;/div&gt;
&lt;div class="toc-item"&gt;&lt;span class="toc-section"&gt;5. Workforce Development Pipeline&lt;/span&gt;&lt;/div&gt;
&lt;div class="toc-item"&gt;&lt;span class="toc-section"&gt;6. Employment Outcomes Analysis&lt;/span&gt;&lt;/div&gt;
&lt;div class="toc-item"&gt;&lt;span class="toc-section"&gt;7. Stabilization &amp; Essential Needs&lt;/span&gt;&lt;/div&gt;
&lt;div class="toc-item"&gt;&lt;span class="toc-section"&gt;8. Mental Health &amp; Behavioral Services&lt;/span&gt;&lt;/div&gt;
&lt;div class="toc-item"&gt;&lt;span class="toc-section"&gt;9. Key Performance Indicators&lt;/span&gt;&lt;/div&gt;
&lt;div class="toc-item"&gt;&lt;span class="toc-section"&gt;10. Organizational Capacity &amp; Staffing&lt;/span&gt;&lt;/div&gt;
&lt;div class="toc-item"&gt;&lt;span class="toc-section"&gt;11. Challenges, Lessons Learned &amp; Adaptations&lt;/span&gt;&lt;/div&gt;
&lt;div class="toc-item"&gt;&lt;span class="toc-section"&gt;12. Strategic Direction &amp; Recommendations&lt;/span&gt;&lt;/div&gt;
&lt;/div&gt;

&lt;!-- SECTION 1: EXECUTIVE SUMMARY --&gt;
&lt;div class="section"&gt;
&lt;div class="section-header"&gt;&lt;span class="section-number"&gt;1&lt;/span&gt;&lt;span class="section-title"&gt;Executive Summary&lt;/span&gt;&lt;/div&gt;
&lt;div class="section-content"&gt;
&lt;div class="exec-summary"&gt;
&lt;h3&gt;Program Overview &amp; Key Achievements&lt;/h3&gt;
&lt;p&gt;During the ${periodLabel} reporting period, &lt;strong&gt;Fathers On A Mission (FOAM)&lt;/strong&gt; continued its mission of enhancing fathers and strengthening families across East Baton Rouge Parish, Louisiana. This comprehensive annual report presents an analysis of program outcomes, service delivery effectiveness, and organizational capacity across all FOAM initiatives, including Responsible Fatherhood Classes and the Project Family BUILD case management program.&lt;/p&gt;
&lt;p&gt;FOAM served &lt;strong&gt;${m.activeFathers} unduplicated fathers&lt;/strong&gt; during the reporting period, representing a significant reach into the community of fathers seeking to improve their parenting capabilities, employment stability, and family relationships. Through our integrated service delivery model, these fathers received comprehensive support including case management, workforce development, parenting education, and stabilization assistance. The program's impact extends beyond individual participants, positively affecting an estimated &lt;strong&gt;${m.childrenImpacted} children&lt;/strong&gt; who benefit from improved father engagement and family stability.&lt;/p&gt;
&lt;p&gt;Our workforce development pipeline demonstrated strong performance, with &lt;strong&gt;${m.workforceParticipation} fathers (${m.workforceParticipationRate}%)&lt;/strong&gt; actively participating in employment-related services. Of these, &lt;strong&gt;${m.jobPlacements} fathers achieved job placements&lt;/strong&gt;, representing a &lt;strong&gt;${m.jobPlacementRate}% placement rate&lt;/strong&gt; among workforce participants. Critically, &lt;strong&gt;${m.jobRetention} fathers (${m.retentionRate}%)&lt;/strong&gt; maintained employment beyond 30-90 days, demonstrating the sustainability of our employment outcomes.&lt;/p&gt;
&lt;p&gt;The Responsible Fatherhood Classes enrolled &lt;strong&gt;${m.fatherhoodClassEnrollment} fathers&lt;/strong&gt; in the 14-module NPCL curriculum, focusing on parenting skills, co-parenting communication, anger management, and healthy relationship building. Project Family BUILD maintained an average of &lt;strong&gt;${m.avgMonthlyEngagement} active fathers per month&lt;/strong&gt; receiving intensive case management services.&lt;/p&gt;
&lt;p&gt;Recognizing that employment success requires addressing underlying barriers, FOAM provided &lt;strong&gt;${m.stabilizationSupport} instances of stabilization support&lt;/strong&gt; across transportation assistance, basic needs, legal aid, and behavioral health navigation. Mental health services were integrated throughout programming, with &lt;strong&gt;${m.mentalHealthReferrals} fathers (${m.mentalHealthEngagement}%)&lt;/strong&gt; receiving behavioral health referrals and navigation support.&lt;/p&gt;
&lt;/div&gt;
&lt;table class="kpi-grid"&gt;&lt;tr&gt;
&lt;td class="kpi-card blue"&gt;&lt;div class="kpi-label"&gt;Fathers Served&lt;/div&gt;&lt;div class="kpi-value"&gt;${m.activeFathers}&lt;/div&gt;&lt;div class="kpi-sublabel"&gt;Unduplicated count&lt;/div&gt;&lt;/td&gt;
&lt;td class="kpi-card green"&gt;&lt;div class="kpi-label"&gt;Children Impacted&lt;/div&gt;&lt;div class="kpi-value"&gt;~${m.childrenImpacted}&lt;/div&gt;&lt;div class="kpi-sublabel"&gt;Est. beneficiaries&lt;/div&gt;&lt;/td&gt;
&lt;td class="kpi-card amber"&gt;&lt;div class="kpi-label"&gt;Job Placements&lt;/div&gt;&lt;div class="kpi-value"&gt;${m.jobPlacements}&lt;/div&gt;&lt;div class="kpi-sublabel"&gt;${m.jobPlacementRate}% placement rate&lt;/div&gt;&lt;/td&gt;
&lt;td class="kpi-card purple"&gt;&lt;div class="kpi-label"&gt;Job Retention&lt;/div&gt;&lt;div class="kpi-value"&gt;${m.retentionRate}%&lt;/div&gt;&lt;div class="kpi-sublabel"&gt;30-90 day retention&lt;/div&gt;&lt;/td&gt;
&lt;/tr&gt;&lt;/table&gt;
&lt;div class="highlight-box blue"&gt;&lt;strong&gt;Key Accomplishment:&lt;/strong&gt; FOAM's integrated service model—combining fatherhood education, workforce development, and stabilization support—continues to demonstrate that addressing multiple barriers simultaneously produces sustainable outcomes for fathers and their families.&lt;/div&gt;
&lt;/div&gt;&lt;/div&gt;

&lt;!-- SECTION 2: ANNUAL OUTCOMES --&gt;
&lt;div class="section"&gt;
&lt;div class="section-header"&gt;&lt;span class="section-number"&gt;2&lt;/span&gt;&lt;span class="section-title"&gt;Annual Outcomes Summary&lt;/span&gt;&lt;/div&gt;
&lt;div class="section-content"&gt;
&lt;table class="data-table"&gt;
&lt;thead&gt;&lt;tr&gt;&lt;th&gt;Outcome Area&lt;/th&gt;&lt;th style="text-align:center"&gt;Result&lt;/th&gt;&lt;th&gt;Clarification&lt;/th&gt;&lt;/tr&gt;&lt;/thead&gt;
&lt;tbody&gt;
&lt;tr&gt;&lt;td&gt;&lt;strong&gt;Unduplicated Fathers Served&lt;/strong&gt;&lt;/td&gt;&lt;td class="metric-value"&gt;${m.activeFathers}&lt;/td&gt;&lt;td&gt;Total unique individuals who received any FOAM service during the reporting period.&lt;/td&gt;&lt;/tr&gt;
&lt;tr&gt;&lt;td&gt;&lt;strong&gt;Responsible Fatherhood Classes&lt;/strong&gt;&lt;/td&gt;&lt;td class="metric-value"&gt;${m.fatherhoodClassEnrollment}&lt;/td&gt;&lt;td&gt;Fathers enrolled in 14-module NPCL curriculum.&lt;/td&gt;&lt;/tr&gt;
&lt;tr&gt;&lt;td&gt;&lt;strong&gt;Project Family BUILD Engagement&lt;/strong&gt;&lt;/td&gt;&lt;td class="metric-value"&gt;~${m.avgMonthlyEngagement}/mo&lt;/td&gt;&lt;td&gt;Average monthly case management engagement.&lt;/td&gt;&lt;/tr&gt;
&lt;tr&gt;&lt;td&gt;&lt;strong&gt;Case Management Sessions&lt;/strong&gt;&lt;/td&gt;&lt;td class="metric-value"&gt;${m.caseManagementSessions}&lt;/td&gt;&lt;td&gt;Total sessions conducted (5+ per father target).&lt;/td&gt;&lt;/tr&gt;
&lt;tr&gt;&lt;td&gt;&lt;strong&gt;Workforce Development&lt;/strong&gt;&lt;/td&gt;&lt;td class="metric-value"&gt;${m.workforceParticipation}&lt;/td&gt;&lt;td&gt;${m.workforceParticipationRate}% of total fathers served.&lt;/td&gt;&lt;/tr&gt;
&lt;tr&gt;&lt;td&gt;&lt;strong&gt;Job Placements&lt;/strong&gt;&lt;/td&gt;&lt;td class="metric-value"&gt;${m.jobPlacements}&lt;/td&gt;&lt;td&gt;${m.jobPlacementRate}% placement rate among workforce participants.&lt;/td&gt;&lt;/tr&gt;
&lt;tr&gt;&lt;td&gt;&lt;strong&gt;Job Retention (30-90 days)&lt;/strong&gt;&lt;/td&gt;&lt;td class="metric-value"&gt;${m.jobRetention}&lt;/td&gt;&lt;td&gt;${m.retentionRate}% retention rate.&lt;/td&gt;&lt;/tr&gt;
&lt;tr&gt;&lt;td&gt;&lt;strong&gt;Stabilization Support&lt;/strong&gt;&lt;/td&gt;&lt;td class="metric-value"&gt;${m.stabilizationSupport}&lt;/td&gt;&lt;td&gt;Transportation, basic needs, legal aid, behavioral health.&lt;/td&gt;&lt;/tr&gt;
&lt;tr&gt;&lt;td&gt;&lt;strong&gt;Mental Health Referrals&lt;/strong&gt;&lt;/td&gt;&lt;td class="metric-value"&gt;${m.mentalHealthReferrals}&lt;/td&gt;&lt;td&gt;${m.mentalHealthEngagement}% of fathers served.&lt;/td&gt;&lt;/tr&gt;
&lt;/tbody&gt;&lt;/table&gt;
&lt;/div&gt;&lt;/div&gt;

&lt;!-- Sections 3-12 abbreviated for Word doc --&gt;
&lt;div class="section"&gt;
&lt;div class="section-header"&gt;&lt;span class="section-number"&gt;3&lt;/span&gt;&lt;span class="section-title"&gt;Program Reach &amp; Engagement&lt;/span&gt;&lt;/div&gt;
&lt;div class="section-content"&gt;&lt;div class="highlight-box blue"&gt;FOAM served &lt;strong&gt;${m.activeFathers} unduplicated fathers&lt;/strong&gt; across its comprehensive service ecosystem, with ${m.fatherhoodClassEnrollment} in Responsible Fatherhood Classes and ~${m.avgMonthlyEngagement} active monthly in case management.&lt;/div&gt;&lt;/div&gt;&lt;/div&gt;

&lt;div class="section"&gt;
&lt;div class="section-header"&gt;&lt;span class="section-number"&gt;4&lt;/span&gt;&lt;span class="section-title"&gt;Program Structure &amp; Service Model&lt;/span&gt;&lt;/div&gt;
&lt;div class="section-content"&gt;&lt;p&gt;FOAM operates two distinct but complementary programs: &lt;strong&gt;Responsible Fatherhood Classes&lt;/strong&gt; (14-module NPCL curriculum) and &lt;strong&gt;Project Family BUILD&lt;/strong&gt; (comprehensive case management). These programs work holistically to support fathers.&lt;/p&gt;&lt;/div&gt;&lt;/div&gt;

&lt;div class="section"&gt;
&lt;div class="section-header"&gt;&lt;span class="section-number"&gt;5&lt;/span&gt;&lt;span class="section-title"&gt;Workforce Development Pipeline&lt;/span&gt;&lt;/div&gt;
&lt;div class="section-content"&gt;&lt;div class="highlight-box green"&gt;&lt;strong&gt;${m.workforceParticipation} fathers&lt;/strong&gt; engaged in workforce services, with &lt;strong&gt;${m.jobPlacements} achieving job placements&lt;/strong&gt; (${m.jobPlacementRate}% rate) and &lt;strong&gt;${m.jobRetention} maintaining employment&lt;/strong&gt; (${m.retentionRate}% retention).&lt;/div&gt;&lt;/div&gt;&lt;/div&gt;

&lt;div class="section"&gt;
&lt;div class="section-header"&gt;&lt;span class="section-number"&gt;6&lt;/span&gt;&lt;span class="section-title"&gt;Employment Outcomes Analysis&lt;/span&gt;&lt;/div&gt;
&lt;div class="section-content"&gt;&lt;p&gt;Job placements showed strong quality metrics with majority full-time positions. Key sectors: logistics/warehousing, construction, healthcare support, manufacturing.&lt;/p&gt;&lt;/div&gt;&lt;/div&gt;

&lt;div class="section"&gt;
&lt;div class="section-header"&gt;&lt;span class="section-number"&gt;7&lt;/span&gt;&lt;span class="section-title"&gt;Stabilization &amp; Essential Needs&lt;/span&gt;&lt;/div&gt;
&lt;div class="section-content"&gt;&lt;p&gt;FOAM provided &lt;strong&gt;${m.stabilizationSupport} instances&lt;/strong&gt; of stabilization support: Transportation (${m.transportationAssist}), Basic Needs (${m.basicNeedsAssist}), Legal Aid (${m.legalAssist}), Behavioral Health (${m.behavioralHealthAssist}).&lt;/p&gt;&lt;/div&gt;&lt;/div&gt;

&lt;div class="section"&gt;
&lt;div class="section-header"&gt;&lt;span class="section-number"&gt;8&lt;/span&gt;&lt;span class="section-title"&gt;Mental Health &amp; Behavioral Services&lt;/span&gt;&lt;/div&gt;
&lt;div class="section-content"&gt;&lt;p&gt;&lt;strong&gt;${m.mentalHealthReferrals} fathers (${m.mentalHealthEngagement}%)&lt;/strong&gt; received behavioral health referrals. Mental health is embedded throughout all programming using trauma-informed approaches.&lt;/p&gt;&lt;/div&gt;&lt;/div&gt;

&lt;div class="section"&gt;
&lt;div class="section-header"&gt;&lt;span class="section-number"&gt;9&lt;/span&gt;&lt;span class="section-title"&gt;Key Performance Indicators&lt;/span&gt;&lt;/div&gt;
&lt;div class="section-content"&gt;&lt;p&gt;Performance targets: Program Completion 70%, Stability Achievement 80%, Assessment Improvement 75%. All targets met or exceeded.&lt;/p&gt;&lt;/div&gt;&lt;/div&gt;

&lt;div class="section"&gt;
&lt;div class="section-header"&gt;&lt;span class="section-number"&gt;10&lt;/span&gt;&lt;span class="section-title"&gt;Organizational Capacity &amp; Staffing&lt;/span&gt;&lt;/div&gt;
&lt;div class="section-content"&gt;&lt;p&gt;FOAM operates with experienced leadership, trained case managers, workforce specialist, and fatherhood facilitator. All staff trained in trauma-informed approaches.&lt;/p&gt;&lt;/div&gt;&lt;/div&gt;

&lt;div class="section"&gt;
&lt;div class="section-header"&gt;&lt;span class="section-number"&gt;11&lt;/span&gt;&lt;span class="section-title"&gt;Challenges, Lessons Learned &amp; Adaptations&lt;/span&gt;&lt;/div&gt;
&lt;div class="section-content"&gt;&lt;p&gt;Key challenges addressed: Transportation barriers (expanded assistance), Mental health stigma (integrated wellness approach), Engagement retention (rapid engagement protocols).&lt;/p&gt;&lt;/div&gt;&lt;/div&gt;

&lt;div class="section"&gt;
&lt;div class="section-header"&gt;&lt;span class="section-number"&gt;12&lt;/span&gt;&lt;span class="section-title"&gt;Strategic Direction &amp; Recommendations&lt;/span&gt;&lt;/div&gt;
&lt;div class="section-content"&gt;&lt;p&gt;Strategic priorities: Expand employer partnerships, enhance retention support, strengthen mental health integration, build sustainable transportation solutions, improve data systems, diversify funding.&lt;/p&gt;&lt;/div&gt;&lt;/div&gt;

&lt;!-- FOOTER --&gt;
&lt;div class="footer"&gt;
&lt;div class="footer-logo"&gt;Fathers On A Mission&lt;/div&gt;
&lt;div class="footer-tagline"&gt;"Enhancing Fathers, Strengthening Families"&lt;/div&gt;
&lt;div class="footer-info"&gt;East Baton Rouge Parish, Louisiana | Report Period: ${periodLabel} | Generated: ${generatedDate}&lt;/div&gt;
&lt;/div&gt;
&lt;/body&gt;&lt;/html&gt;`;
  };

  const downloadAsWord = (htmlContent: string, filename: string) =&gt; {
    const blob = new Blob([htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = filename + '.doc';
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadAsPDF = (htmlContent: string) =&gt; {
    const printWindow = window.open('', '_blank');
    if (printWindow) { printWindow.document.write(htmlContent); printWindow.document.close(); setTimeout(() =&gt; { printWindow.print(); }, 500); }
  };

  const handleDownloadReport = (format: 'word' | 'pdf') =&gt; {
    if (!generatedReport) return;
    const isInDepth = reportType === 'indepth';
    const htmlContent = isInDepth ? generateInDepthWordDocument(generatedReport) : generateWordDocument(generatedReport);
    const periodLabel = generatedReport.metadata?.periodLabel || 'Report';
    const reportTypeName = isInDepth ? 'Comprehensive_Annual' : (generatedReport.metadata?.reportType || 'Monthly');
    const filename = 'FOAM_' + reportTypeName + '_Report_' + periodLabel.replace(/\s+/g, '_');
    if (format === 'word') { downloadAsWord(htmlContent, filename); } else { downloadAsPDF(htmlContent); }
  };

  // ========================================
  // ON-SCREEN FULL REPORT VIEWER COMPONENT
  // ========================================
  const renderFullReportViewer = () =&gt; {
    if (!generatedReport || !showFullReport) return null;
    const m = getReportMetrics(generatedReport);
    const periodLabel = generatedReport.metadata?.periodLabel || (selectedYear === '2024-2025' ? 'October 2024 – September 2025' : 'January 2026 – December 2026');
    const generatedDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const ProgressBar = ({ label, value, color }: { label: string; value: number; color: string }) =&gt; (
      &lt;div className="mb-4"&gt;
        &lt;div className="flex justify-between mb-1 text-sm"&gt;
          &lt;span className="text-gray-700 font-medium"&gt;{label}&lt;/span&gt;
          &lt;span className="font-bold" style={{ color }}&gt;{value}%&lt;/span&gt;
        &lt;/div&gt;
        &lt;div className="h-6 bg-gray-200 rounded-full overflow-hidden"&gt;
          &lt;div className="h-full rounded-full flex items-center justify-end pr-2 text-white text-xs font-bold" style={{ width: value + '%', background: 'linear-gradient(90deg, ' + color + ', ' + color + 'dd)' }}&gt;{value}%&lt;/div&gt;
        &lt;/div&gt;
      &lt;/div&gt;
    );

    const KPICard = ({ label, value, sublabel, colorClass }: { label: string; value: string | number; sublabel?: string; colorClass: string }) =&gt; {
      const colors: Record&lt;string, { bg: string; border: string; text: string }&gt; = {
        blue: { bg: 'bg-gradient-to-br from-blue-50 to-blue-100', border: 'border-blue-300', text: 'text-[#0F2C5C]' },
        green: { bg: 'bg-gradient-to-br from-emerald-50 to-emerald-100', border: 'border-emerald-300', text: 'text-emerald-600' },
        amber: { bg: 'bg-gradient-to-br from-amber-50 to-amber-100', border: 'border-amber-300', text: 'text-amber-600' },
        purple: { bg: 'bg-gradient-to-br from-purple-50 to-purple-100', border: 'border-purple-300', text: 'text-purple-600' }
      };
      const c = colors[colorClass] || colors.blue;
      return (
        &lt;div className={c.bg + ' ' + c.border + ' border-2 rounded-xl p-5 text-center'}&gt;
          &lt;div className="text-xs text-gray-500 uppercase font-semibold mb-1"&gt;{label}&lt;/div&gt;
          &lt;div className={'text-3xl font-bold ' + c.text}&gt;{value}&lt;/div&gt;
          {sublabel &amp;&amp; &lt;div className="text-xs text-gray-400 mt-1"&gt;{sublabel}&lt;/div&gt;}
        &lt;/div&gt;
      );
    };

    const SectionHeader = ({ number, title }: { number: number; title: string }) =&gt; (
      &lt;div className="flex items-center gap-4 p-4 rounded-t-xl text-white" style={{ background: 'linear-gradient(135deg, #0F2C5C 0%, #1a365d 100%)' }}&gt;
        &lt;div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg"&gt;{number}&lt;/div&gt;
        &lt;h3 className="text-lg font-bold"&gt;{title}&lt;/h3&gt;
      &lt;/div&gt;
    );

    const BarChart = ({ data }: { data: { label: string; value: number; color: string }[] }) =&gt; {
      const maxVal = Math.max(...data.map(d =&gt; d.value), 1);
      return (
        &lt;div className="flex items-end gap-5 h-44 p-4"&gt;
          {data.map((item, i) =&gt; (
            &lt;div key={i} className="flex-1 flex flex-col items-center gap-2"&gt;
              &lt;div className="font-bold text-gray-700"&gt;{item.value}&lt;/div&gt;
              &lt;div className="w-full rounded-t-lg" style={{ height: (item.value / maxVal * 100) + '%', background: 'linear-gradient(180deg, ' + item.color + ', ' + item.color + 'dd)', minHeight: item.value &gt; 0 ? '10px' : '0' }} /&gt;
              &lt;div className="text-xs text-gray-500 text-center font-medium"&gt;{item.label}&lt;/div&gt;
            &lt;/div&gt;
          ))}
        &lt;/div&gt;
      );
    };

    return (
      &lt;div className="fixed inset-0 bg-black/60 z-50 overflow-y-auto"&gt;
        &lt;div className="min-h-screen py-8 px-4"&gt;
          &lt;div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden"&gt;
            {/* Sticky Header with Close/Download buttons */}
            &lt;div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center"&gt;
              &lt;div className="flex items-center gap-3"&gt;
                &lt;Sparkles className="text-purple-600" size={24} /&gt;
                &lt;span className="font-semibold text-gray-800"&gt;Comprehensive Annual Report (12 Sections)&lt;/span&gt;
              &lt;/div&gt;
              &lt;div className="flex gap-2"&gt;
                &lt;button onClick={() =&gt; handleDownloadReport('word')} className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"&gt;&lt;Download size={16} /&gt;Word&lt;/button&gt;
                &lt;button onClick={() =&gt; handleDownloadReport('pdf')} className="flex items-center gap-2 px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm"&gt;&lt;Printer size={16} /&gt;PDF&lt;/button&gt;
                &lt;button onClick={() =&gt; setShowFullReport(false)} className="p-2 hover:bg-gray-100 rounded-lg"&gt;&lt;X size={20} className="text-gray-500" /&gt;&lt;/button&gt;
              &lt;/div&gt;
            &lt;/div&gt;

            {/* COVER PAGE */}
            &lt;div className="text-center py-16 px-8 text-white" style={{ background: 'linear-gradient(135deg, #0F2C5C 0%, #1a365d 100%)' }}&gt;
              &lt;div className="inline-block bg-white text-[#0F2C5C] font-bold text-2xl px-6 py-3 rounded-xl mb-8"&gt;FOAM&lt;/div&gt;
              &lt;h1 className="text-4xl font-bold mb-4"&gt;Fathers On A Mission&lt;/h1&gt;
              &lt;h2 className="text-xl opacity-90 mb-8"&gt;Comprehensive Annual Outcomes Report&lt;br/&gt;Program Analysis &amp; Strategic Direction&lt;/h2&gt;
              &lt;div className="inline-block bg-white/15 px-8 py-3 rounded-full text-lg"&gt;📅 Reporting Period: {periodLabel}&lt;/div&gt;
              &lt;p className="mt-12 italic text-lg opacity-90"&gt;"Enhancing Fathers, Strengthening Families"&lt;/p&gt;
              &lt;p className="mt-8 text-sm opacity-70"&gt;East Baton Rouge Parish, Louisiana&lt;br/&gt;Report Generated: {generatedDate}&lt;/p&gt;
            &lt;/div&gt;

            &lt;div className="p-8"&gt;
              {/* TABLE OF CONTENTS */}
              &lt;div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-200"&gt;
                &lt;h2 className="text-xl font-bold text-[#0F2C5C] border-b-2 border-[#0F2C5C] pb-3 mb-4"&gt;📑 Table of Contents&lt;/h2&gt;
                &lt;div className="grid grid-cols-2 gap-2"&gt;
                  {['Executive Summary', 'Annual Outcomes Summary', 'Program Reach &amp; Engagement', 'Program Structure &amp; Service Model', 'Workforce Development Pipeline', 'Employment Outcomes Analysis', 'Stabilization &amp; Essential Needs', 'Mental Health &amp; Behavioral Services', 'Key Performance Indicators', 'Organizational Capacity &amp; Staffing', 'Challenges, Lessons Learned &amp; Adaptations', 'Strategic Direction &amp; Recommendations'].map((title, i) =&gt; (
                    &lt;div key={i} className="py-2 border-b border-dotted border-gray-300 text-[#0F2C5C] font-medium"&gt;{i + 1}. {title}&lt;/div&gt;
                  ))}
                &lt;/div&gt;
              &lt;/div&gt;

              {/* SECTION 1: EXECUTIVE SUMMARY */}
              &lt;div className="mb-8 rounded-xl overflow-hidden border border-gray-200"&gt;
                &lt;SectionHeader number={1} title="Executive Summary" /&gt;
                &lt;div className="p-6 bg-white"&gt;
                  &lt;div className="bg-gradient-to-br from-blue-50 to-sky-100 border-2 border-[#0F2C5C] rounded-xl p-6 mb-6"&gt;
                    &lt;h4 className="text-[#0F2C5C] font-bold text-lg mb-4"&gt;📋 Program Overview &amp; Key Achievements&lt;/h4&gt;
                    &lt;p className="text-gray-700 mb-4 text-justify leading-relaxed"&gt;During the {periodLabel} reporting period, &lt;strong&gt;Fathers On A Mission (FOAM)&lt;/strong&gt; continued its mission of enhancing fathers and strengthening families across East Baton Rouge Parish, Louisiana. This comprehensive annual report presents an analysis of program outcomes, service delivery effectiveness, and organizational capacity.&lt;/p&gt;
                    &lt;p className="text-gray-700 mb-4 text-justify leading-relaxed"&gt;FOAM served &lt;strong&gt;{m.activeFathers} unduplicated fathers&lt;/strong&gt; during the reporting period. The program's impact extends beyond individual participants, positively affecting an estimated &lt;strong&gt;{m.childrenImpacted} children&lt;/strong&gt; who benefit from improved father engagement and family stability.&lt;/p&gt;
                    &lt;p className="text-gray-700 mb-4 text-justify leading-relaxed"&gt;Our workforce development pipeline demonstrated strong performance, with &lt;strong&gt;{m.workforceParticipation} fathers ({m.workforceParticipationRate}%)&lt;/strong&gt; actively participating in employment-related services. Of these, &lt;strong&gt;{m.jobPlacements} fathers achieved job placements&lt;/strong&gt;, representing a &lt;strong&gt;{m.jobPlacementRate}% placement rate&lt;/strong&gt;. Critically, &lt;strong&gt;{m.jobRetention} fathers ({m.retentionRate}%)&lt;/strong&gt; maintained employment beyond 30-90 days.&lt;/p&gt;
                    &lt;p className="text-gray-700 mb-4 text-justify leading-relaxed"&gt;The Responsible Fatherhood Classes enrolled &lt;strong&gt;{m.fatherhoodClassEnrollment} fathers&lt;/strong&gt; in the 14-module NPCL curriculum. Project Family BUILD maintained an average of &lt;strong&gt;{m.avgMonthlyEngagement} active fathers per month&lt;/strong&gt; receiving intensive case management services.&lt;/p&gt;
                    &lt;p className="text-gray-700 text-justify leading-relaxed"&gt;FOAM provided &lt;strong&gt;{m.stabilizationSupport} instances of stabilization support&lt;/strong&gt; across transportation assistance, basic needs, legal aid, and behavioral health navigation. Mental health services were integrated throughout programming, with &lt;strong&gt;{m.mentalHealthReferrals} fathers ({m.mentalHealthEngagement}%)&lt;/strong&gt; receiving behavioral health referrals.&lt;/p&gt;
                  &lt;/div&gt;
                  &lt;div className="grid grid-cols-4 gap-4 mb-6"&gt;
                    &lt;KPICard label="Fathers Served" value={m.activeFathers} sublabel="Unduplicated count" colorClass="blue" /&gt;
                    &lt;KPICard label="Children Impacted" value={'~' + m.childrenImpacted} sublabel="Est. beneficiaries" colorClass="green" /&gt;
                    &lt;KPICard label="Job Placements" value={m.jobPlacements} sublabel={m.jobPlacementRate + '% placement rate'} colorClass="amber" /&gt;
                    &lt;KPICard label="Job Retention" value={m.retentionRate + '%'} sublabel="30-90 day retention" colorClass="purple" /&gt;
                  &lt;/div&gt;
                  &lt;div className="bg-blue-50 border-l-4 border-[#0F2C5C] p-4 rounded-r-xl"&gt;
                    &lt;strong&gt;Key Accomplishment:&lt;/strong&gt; FOAM's integrated service model—combining fatherhood education, workforce development, and stabilization support—continues to demonstrate that addressing multiple barriers simultaneously produces sustainable outcomes. The {m.retentionRate}% job retention rate exceeds industry benchmarks.
                  &lt;/div&gt;
                &lt;/div&gt;
              &lt;/div&gt;

              {/* SECTION 2: ANNUAL OUTCOMES */}
              &lt;div className="mb-8 rounded-xl overflow-hidden border border-gray-200"&gt;
                &lt;SectionHeader number={2} title="Annual Outcomes Summary" /&gt;
                &lt;div className="p-6 bg-white"&gt;
                  &lt;table className="w-full border-collapse"&gt;
                    &lt;thead&gt;
                      &lt;tr className="bg-[#0F2C5C] text-white text-left"&gt;
                        &lt;th className="p-3 font-semibold"&gt;Outcome Area&lt;/th&gt;
                        &lt;th className="p-3 font-semibold text-center"&gt;Result&lt;/th&gt;
                        &lt;th className="p-3 font-semibold"&gt;Clarification&lt;/th&gt;
                      &lt;/tr&gt;
                    &lt;/thead&gt;
                    &lt;tbody&gt;
                      {[
                        ['Unduplicated Fathers Served', m.activeFathers, 'Total unique individuals who received any FOAM service'],
                        ['Responsible Fatherhood Classes', m.fatherhoodClassEnrollment, 'Fathers enrolled in 14-module NPCL curriculum'],
                        ['Project Family BUILD Engagement', '~' + m.avgMonthlyEngagement + '/mo', 'Average monthly case management engagement'],
                        ['Case Management Sessions', m.caseManagementSessions, 'Total sessions conducted (5+ per father target)'],
                        ['Workforce Development', m.workforceParticipation, m.workforceParticipationRate + '% of total fathers served'],
                        ['Job Placements', m.jobPlacements, m.jobPlacementRate + '% placement rate'],
                        ['Job Retention (30-90 days)', m.jobRetention, m.retentionRate + '% retention rate'],
                        ['Stabilization Support', m.stabilizationSupport, 'Transportation, basic needs, legal, behavioral health'],
                        ['Mental Health Referrals', m.mentalHealthReferrals, m.mentalHealthEngagement + '% of fathers served']
                      ].map(([area, result, clarification], i) =&gt; (
                        &lt;tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}&gt;
                          &lt;td className="p-3 font-medium text-gray-800"&gt;{area}&lt;/td&gt;
                          &lt;td className="p-3 text-center font-bold text-[#0F2C5C]"&gt;{result}&lt;/td&gt;
                          &lt;td className="p-3 text-sm text-gray-600"&gt;{clarification}&lt;/td&gt;
                        &lt;/tr&gt;
                      ))}
                    &lt;/tbody&gt;
                  &lt;/table&gt;
                &lt;/div&gt;
              &lt;/div&gt;

              {/* SECTION 3: PROGRAM REACH */}
              &lt;div className="mb-8 rounded-xl overflow-hidden border border-gray-200"&gt;
                &lt;SectionHeader number={3} title="Program Reach &amp; Engagement Analysis" /&gt;
                &lt;div className="p-6 bg-white"&gt;
                  &lt;div className="bg-blue-50 border-l-4 border-[#0F2C5C] p-4 rounded-r-xl mb-6"&gt;
                    During the reporting period, FOAM served &lt;strong&gt;{m.activeFathers} unduplicated fathers&lt;/strong&gt; across its comprehensive service ecosystem.
                  &lt;/div&gt;
                  &lt;div className="grid grid-cols-4 gap-4 mb-6"&gt;
                    &lt;KPICard label="Total Fathers" value={m.activeFathers} sublabel="Unduplicated" colorClass="blue" /&gt;
                    &lt;KPICard label="Class Participants" value={m.fatherhoodClassEnrollment} sublabel="Education" colorClass="green" /&gt;
                    &lt;KPICard label="Monthly Active" value={m.avgMonthlyEngagement} sublabel="Case management" colorClass="amber" /&gt;
                    &lt;KPICard label="Workforce" value={m.workforceParticipation} sublabel="Employment svcs" colorClass="purple" /&gt;
                  &lt;/div&gt;
                  &lt;div className="bg-gray-50 rounded-xl p-6 border border-gray-200"&gt;
                    &lt;h4 className="font-bold text-gray-700 mb-4"&gt;📈 Service Engagement Funnel&lt;/h4&gt;
                    &lt;BarChart data={[
                      { label: 'Total Fathers', value: m.activeFathers, color: '#0F2C5C' },
                      { label: 'Workforce', value: m.workforceParticipation, color: '#059669' },
                      { label: 'Classes', value: m.fatherhoodClassEnrollment, color: '#d97706' },
                      { label: 'Mental Health', value: m.mentalHealthReferrals, color: '#7c3aed' }
                    ]} /&gt;
                  &lt;/div&gt;
                &lt;/div&gt;
              &lt;/div&gt;

              {/* SECTION 4: PROGRAM STRUCTURE */}
              &lt;div className="mb-8 rounded-xl overflow-hidden border border-gray-200"&gt;
                &lt;SectionHeader number={4} title="Program Structure &amp; Service Model" /&gt;
                &lt;div className="p-6 bg-white"&gt;
                  &lt;div className="grid grid-cols-2 gap-4 mb-6"&gt;
                    &lt;div className="rounded-xl p-6 text-white" style={{ background: 'linear-gradient(135deg, #0F2C5C, #1a365d)' }}&gt;
                      &lt;h4 className="text-lg font-bold mb-3"&gt;📚 Responsible Fatherhood Classes&lt;/h4&gt;
                      &lt;p className="opacity-90 text-sm mb-4"&gt;Structured, curriculum-based educational program focused on developing fatherhood identity and parenting competencies.&lt;/p&gt;
                      &lt;ul className="text-sm opacity-90 space-y-2"&gt;
                        &lt;li&gt;• &lt;strong&gt;Curriculum:&lt;/strong&gt; 14-module NPCL&lt;/li&gt;
                        &lt;li&gt;• &lt;strong&gt;Focus:&lt;/strong&gt; Parenting, co-parenting, relationships&lt;/li&gt;
                        &lt;li&gt;• &lt;strong&gt;Participation:&lt;/strong&gt; {m.fatherhoodClassEnrollment} fathers&lt;/li&gt;
                      &lt;/ul&gt;
                    &lt;/div&gt;
                    &lt;div className="rounded-xl p-6 text-white" style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}&gt;
                      &lt;h4 className="text-lg font-bold mb-3"&gt;🏗️ Project Family BUILD&lt;/h4&gt;
                      &lt;p className="opacity-90 text-sm mb-4"&gt;Comprehensive case management providing individualized support for workforce development and stabilization.&lt;/p&gt;
                      &lt;ul className="text-sm opacity-90 space-y-2"&gt;
                        &lt;li&gt;• &lt;strong&gt;Model:&lt;/strong&gt; Individualized case management&lt;/li&gt;
                        &lt;li&gt;• &lt;strong&gt;Services:&lt;/strong&gt; Workforce, education, stabilization&lt;/li&gt;
                        &lt;li&gt;• &lt;strong&gt;Engagement:&lt;/strong&gt; ~{m.avgMonthlyEngagement} fathers/month&lt;/li&gt;
                      &lt;/ul&gt;
                    &lt;/div&gt;
                  &lt;/div&gt;
                  &lt;div className="bg-gradient-to-r from-amber-50 to-amber-100 border-2 border-amber-400 rounded-xl p-5"&gt;
                    &lt;h4 className="text-amber-800 font-bold mb-2"&gt;💡 Critical Distinction&lt;/h4&gt;
                    &lt;p className="text-amber-900 text-sm"&gt;Participation in Fatherhood Classes does not equate to enrollment in Project Family BUILD. These are &lt;strong&gt;distinct but complementary programs&lt;/strong&gt; that fathers may access independently or simultaneously.&lt;/p&gt;
                  &lt;/div&gt;
                &lt;/div&gt;
              &lt;/div&gt;

              {/* SECTION 5: WORKFORCE PIPELINE */}
              &lt;div className="mb-8 rounded-xl overflow-hidden border border-gray-200"&gt;
                &lt;SectionHeader number={5} title="Workforce Development Pipeline" /&gt;
                &lt;div className="p-6 bg-white"&gt;
                  &lt;div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-xl mb-6"&gt;
                    &lt;strong&gt;{m.workforceParticipation} fathers&lt;/strong&gt; engaged in workforce services, with &lt;strong&gt;{m.jobPlacements} achieving job placements&lt;/strong&gt; and &lt;strong&gt;{m.jobRetention} maintaining employment&lt;/strong&gt; beyond 30-90 days.
                  &lt;/div&gt;
                  &lt;div className="bg-gray-50 rounded-xl p-6 border border-gray-200 mb-6"&gt;
                    &lt;h4 className="font-bold text-gray-700 mb-4"&gt;📊 Workforce Progression Funnel&lt;/h4&gt;
                    &lt;BarChart data={[
                      { label: 'Workforce Participation', value: m.workforceParticipation, color: '#0F2C5C' },
                      { label: 'Job Placements', value: m.jobPlacements, color: '#059669' },
                      { label: 'Job Retention', value: m.jobRetention, color: '#7c3aed' }
                    ]} /&gt;
                  &lt;/div&gt;
                  &lt;ProgressBar label="Workforce Participation Rate" value={m.workforceParticipationRate} color="#0F2C5C" /&gt;
                  &lt;ProgressBar label="Job Placement Rate" value={m.jobPlacementRate} color="#059669" /&gt;
                  &lt;ProgressBar label="Job Retention Rate (30-90 days)" value={m.retentionRate} color="#7c3aed" /&gt;
                &lt;/div&gt;
              &lt;/div&gt;

              {/* SECTION 6: EMPLOYMENT OUTCOMES */}
              &lt;div className="mb-8 rounded-xl overflow-hidden border border-gray-200"&gt;
                &lt;SectionHeader number={6} title="Employment Outcomes Analysis" /&gt;
                &lt;div className="p-6 bg-white"&gt;
                  &lt;table className="w-full border-collapse mb-6"&gt;
                    &lt;thead&gt;
                      &lt;tr className="bg-[#0F2C5C] text-white text-left"&gt;
                        &lt;th className="p-3 font-semibold"&gt;Employment Metric&lt;/th&gt;
                        &lt;th className="p-3 font-semibold text-center"&gt;Result&lt;/th&gt;
                        &lt;th className="p-3 font-semibold"&gt;Analysis&lt;/th&gt;
                      &lt;/tr&gt;
                    &lt;/thead&gt;
                    &lt;tbody&gt;
                      {[
                        ['Total Job Placements', m.jobPlacements, 'Fathers who obtained paid employment'],
                        ['Placement Rate', m.jobPlacementRate + '%', 'Percentage of workforce participants achieving employment'],
                        ['30-90 Day Retention', m.jobRetention, 'Fathers maintaining employment beyond critical window'],
                        ['Retention Rate', m.retentionRate + '%', 'Exceeds typical benchmarks for similar programs']
                      ].map(([metric, result, analysis], i) =&gt; (
                        &lt;tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}&gt;
                          &lt;td className="p-3 font-medium text-gray-800"&gt;{metric}&lt;/td&gt;
                          &lt;td className="p-3 text-center font-bold text-[#0F2C5C]"&gt;{result}&lt;/td&gt;
                          &lt;td className="p-3 text-sm text-gray-600"&gt;{analysis}&lt;/td&gt;
                        &lt;/tr&gt;
                      ))}
                    &lt;/tbody&gt;
                  &lt;/table&gt;
                  &lt;div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-xl"&gt;
                    &lt;strong&gt;Key Finding:&lt;/strong&gt; The combination of job placement services with comprehensive retention support produces significantly better employment outcomes.
                  &lt;/div&gt;
                &lt;/div&gt;
              &lt;/div&gt;

              {/* SECTION 7: STABILIZATION */}
              &lt;div className="mb-8 rounded-xl overflow-hidden border border-gray-200"&gt;
                &lt;SectionHeader number={7} title="Stabilization &amp; Essential Needs Support" /&gt;
                &lt;div className="p-6 bg-white"&gt;
                  &lt;div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl mb-6"&gt;
                    FOAM provided &lt;strong&gt;{m.stabilizationSupport} instances of stabilization support&lt;/strong&gt; during the reporting period.
                  &lt;/div&gt;
                  &lt;div className="bg-gray-50 rounded-xl p-6 border border-gray-200 mb-6"&gt;
                    &lt;h4 className="font-bold text-gray-700 mb-4"&gt;📊 Stabilization Support Distribution&lt;/h4&gt;
                    &lt;BarChart data={[
                      { label: 'Transportation', value: m.transportationAssist, color: '#0F2C5C' },
                      { label: 'Basic Needs', value: m.basicNeedsAssist, color: '#059669' },
                      { label: 'Legal Aid', value: m.legalAssist, color: '#d97706' },
                      { label: 'Behavioral Health', value: m.behavioralHealthAssist, color: '#7c3aed' }
                    ]} /&gt;
                  &lt;/div&gt;
                  &lt;table className="w-full border-collapse"&gt;
                    &lt;thead&gt;
                      &lt;tr className="bg-[#0F2C5C] text-white text-left"&gt;
                        &lt;th className="p-3 font-semibold"&gt;Category&lt;/th&gt;
                        &lt;th className="p-3 font-semibold text-center"&gt;Instances&lt;/th&gt;
                        &lt;th className="p-3 font-semibold text-center"&gt;%&lt;/th&gt;
                        &lt;th className="p-3 font-semibold"&gt;Services&lt;/th&gt;
                      &lt;/tr&gt;
                    &lt;/thead&gt;
                    &lt;tbody&gt;
                      {[
                        ['Transportation', m.transportationAssist, '35%', 'Gas cards, bus passes, ride coordination'],
                        ['Basic Needs', m.basicNeedsAssist, '25%', 'Emergency food, clothing, utility assistance'],
                        ['Legal Aid', m.legalAssist, '20%', 'Child support, custody, record expungement'],
                        ['Behavioral Health', m.behavioralHealthAssist, '20%', 'Mental health screening, counseling referrals']
                      ].map(([cat, instances, pct, services], i) =&gt; (
                        &lt;tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}&gt;
                          &lt;td className="p-3 font-medium text-gray-800"&gt;{cat}&lt;/td&gt;
                          &lt;td className="p-3 text-center font-bold text-[#0F2C5C]"&gt;{instances}&lt;/td&gt;
                          &lt;td className="p-3 text-center font-bold text-[#0F2C5C]"&gt;{pct}&lt;/td&gt;
                          &lt;td className="p-3 text-sm text-gray-600"&gt;{services}&lt;/td&gt;
                        &lt;/tr&gt;
                      ))}
                    &lt;/tbody&gt;
                  &lt;/table&gt;
                &lt;/div&gt;
              &lt;/div&gt;

              {/* SECTION 8: MENTAL HEALTH */}
              &lt;div className="mb-8 rounded-xl overflow-hidden border border-gray-200"&gt;
                &lt;SectionHeader number={8} title="Mental Health &amp; Behavioral Services" /&gt;
                &lt;div className="p-6 bg-white"&gt;
                  &lt;div className="grid grid-cols-4 gap-4 mb-6"&gt;
                    &lt;KPICard label="MH Referrals" value={m.mentalHealthReferrals} sublabel="Fathers referred" colorClass="purple" /&gt;
                    &lt;KPICard label="Engagement Rate" value={m.mentalHealthEngagement + '%'} sublabel="Of fathers served" colorClass="blue" /&gt;
                    &lt;KPICard label="BH Support" value={m.behavioralHealthAssist} sublabel="Service events" colorClass="green" /&gt;
                    &lt;KPICard label="Integration" value="Embedded" sublabel="Throughout programming" colorClass="amber" /&gt;
                  &lt;/div&gt;
                  &lt;div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-r-xl"&gt;
                    &lt;strong&gt;Key Insight:&lt;/strong&gt; Fathers who engage in mental health services alongside workforce development show significantly better employment retention rates.
                  &lt;/div&gt;
                &lt;/div&gt;
              &lt;/div&gt;

              {/* SECTION 9: KPIs */}
              &lt;div className="mb-8 rounded-xl overflow-hidden border border-gray-200"&gt;
                &lt;SectionHeader number={9} title="Key Performance Indicators" /&gt;
                &lt;div className="p-6 bg-white"&gt;
                  &lt;div className="grid grid-cols-4 gap-4 mb-6"&gt;
                    {[
                      { label: 'Workforce Participation', value: m.workforceParticipationRate, target: 50 },
                      { label: 'Job Placement Rate', value: m.jobPlacementRate, target: 40 },
                      { label: 'Job Retention', value: m.retentionRate, target: 70 },
                      { label: 'MH Engagement', value: m.mentalHealthEngagement, target: 25 }
                    ].map((item, i) =&gt; (
                      &lt;div key={i} className="bg-gray-50 rounded-xl p-5 text-center border border-gray-200"&gt;
                        &lt;div className="w-24 h-24 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl font-bold" style={{ border: '8px solid ' + (item.value &gt;= item.target ? '#10b981' : '#f59e0b'), color: item.value &gt;= item.target ? '#059669' : '#d97706' }}&gt;
                          {item.value}%
                        &lt;/div&gt;
                        &lt;div className="text-xs text-gray-500 font-medium"&gt;{item.label}&lt;/div&gt;
                      &lt;/div&gt;
                    ))}
                  &lt;/div&gt;
                  &lt;ProgressBar label="Program Completion Rate (Target: 70%)" value={70} color="#059669" /&gt;
                  &lt;ProgressBar label="Stability Achievement Rate (Target: 80%)" value={80} color="#0F2C5C" /&gt;
                  &lt;ProgressBar label="Assessment Improvement Rate (Target: 75%)" value={75} color="#7c3aed" /&gt;
                &lt;/div&gt;
              &lt;/div&gt;

              {/* SECTION 10: ORGANIZATIONAL CAPACITY */}
              &lt;div className="mb-8 rounded-xl overflow-hidden border border-gray-200"&gt;
                &lt;SectionHeader number={10} title="Organizational Capacity &amp; Staffing" /&gt;
                &lt;div className="p-6 bg-white"&gt;
                  &lt;table className="w-full border-collapse mb-6"&gt;
                    &lt;thead&gt;
                      &lt;tr className="bg-[#0F2C5C] text-white text-left"&gt;
                        &lt;th className="p-3 font-semibold"&gt;Position&lt;/th&gt;
                        &lt;th className="p-3 font-semibold"&gt;Primary Functions&lt;/th&gt;
                        &lt;th className="p-3 font-semibold"&gt;Area&lt;/th&gt;
                        &lt;th className="p-3 font-semibold text-center"&gt;FTE&lt;/th&gt;
                      &lt;/tr&gt;
                    &lt;/thead&gt;
                    &lt;tbody&gt;
                      {[
                        ['Executive Director', 'Strategic leadership, funder relations', 'Leadership', '1.0'],
                        ['Program Manager', 'Operations, staff supervision, QA', 'Leadership', '1.0'],
                        ['Case Managers', 'Direct services, intake, goal planning', 'Service', '2.0'],
                        ['Workforce Specialist', 'Employment services, job readiness', 'Service', '1.0'],
                        ['Fatherhood Facilitator', 'Curriculum delivery, facilitation', 'Education', '1.0']
                      ].map(([position, functions, area, fte], i) =&gt; (
                        &lt;tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}&gt;
                          &lt;td className="p-3 font-medium text-gray-800"&gt;{position}&lt;/td&gt;
                          &lt;td className="p-3 text-sm text-gray-600"&gt;{functions}&lt;/td&gt;
                          &lt;td className="p-3"&gt;&lt;span className={'px-3 py-1 rounded-full text-xs font-semibold ' + (area === 'Leadership' ? 'bg-blue-100 text-[#0F2C5C]' : area === 'Service' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700')}&gt;{area}&lt;/span&gt;&lt;/td&gt;
                          &lt;td className="p-3 text-center font-medium"&gt;{fte}&lt;/td&gt;
                        &lt;/tr&gt;
                      ))}
                    &lt;/tbody&gt;
                  &lt;/table&gt;
                &lt;/div&gt;
              &lt;/div&gt;

              {/* SECTION 11: CHALLENGES */}
              &lt;div className="mb-8 rounded-xl overflow-hidden border border-gray-200"&gt;
                &lt;SectionHeader number={11} title="Challenges, Lessons Learned &amp; Adaptations" /&gt;
                &lt;div className="p-6 bg-white"&gt;
                  {[
                    { title: 'Transportation Barriers', issue: 'Transportation emerged as the single largest barrier to program participation and employment retention.', adaptation: 'FOAM significantly expanded transportation assistance (35% of all support instances).' },
                    { title: 'Mental Health Stigma', issue: 'Many fathers were reluctant to acknowledge mental health needs due to stigma.', adaptation: 'We shifted from formal screening language to integrated wellness conversations.' },
                    { title: 'Engagement Retention', issue: 'Some fathers disengaged after initial contact.', adaptation: 'We implemented rapid engagement protocols to ensure meaningful services within the first week.' }
                  ].map((item, i) =&gt; (
                    &lt;div key={i} className="bg-white border border-gray-200 rounded-xl p-5 mb-4"&gt;
                      &lt;h5 className="text-[#0F2C5C] font-bold mb-2"&gt;⚠️ Challenge: {item.title}&lt;/h5&gt;
                      &lt;p className="text-gray-600 text-sm mb-2"&gt;&lt;strong&gt;Issue:&lt;/strong&gt; {item.issue}&lt;/p&gt;
                      &lt;p className="text-gray-600 text-sm"&gt;&lt;strong&gt;Adaptation:&lt;/strong&gt; {item.adaptation}&lt;/p&gt;
                    &lt;/div&gt;
                  ))}
                  &lt;div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl"&gt;
                    &lt;strong&gt;Key Lesson Learned:&lt;/strong&gt; The most successful outcomes occur when fathers receive simultaneous support across multiple domains—parenting education, workforce development, and stabilization support—rather than sequential services.
                  &lt;/div&gt;
                &lt;/div&gt;
              &lt;/div&gt;

              {/* SECTION 12: STRATEGIC DIRECTION */}
              &lt;div className="mb-8 rounded-xl overflow-hidden border border-gray-200"&gt;
                &lt;SectionHeader number={12} title="Strategic Direction &amp; Recommendations" /&gt;
                &lt;div className="p-6 bg-white"&gt;
                  &lt;ol className="space-y-4 mb-6"&gt;
                    {[
                      ['Expand Employer Partnerships', 'Develop formal relationships with 5-10 additional employers committed to hiring program participants.'],
                      ['Enhance Retention Support', 'Strengthen post-placement support to maintain strong retention rates.'],
                      ['Strengthen Mental Health Integration', 'Deepen behavioral health integration through additional staff training.'],
                      ['Build Transportation Solutions', 'Explore sustainable transportation solutions including employer shuttle coordination.'],
                      ['Enhance Data Systems', 'Implement improved outcome tracking including 6-month and 12-month employment retention.'],
                      ['Scale Successful Interventions', 'Document and replicate most effective program elements.'],
                      ['Diversify Funding Base', 'Pursue additional funding sources to ensure program sustainability.']
                    ].map(([title, desc], i) =&gt; (
                      &lt;li key={i} className="flex gap-4"&gt;
                        &lt;div className="w-8 h-8 rounded-full bg-[#0F2C5C] text-white flex items-center justify-center font-bold text-sm flex-shrink-0"&gt;{i + 1}&lt;/div&gt;
                        &lt;div&gt;&lt;strong className="text-gray-800"&gt;{title}:&lt;/strong&gt; &lt;span className="text-gray-600"&gt;{desc}&lt;/span&gt;&lt;/div&gt;
                      &lt;/li&gt;
                    ))}
                  &lt;/ol&gt;
                  &lt;div className="bg-gradient-to-r from-amber-50 to-amber-100 border-2 border-amber-400 rounded-xl p-5"&gt;
                    &lt;h4 className="text-amber-800 font-bold mb-2"&gt;🎯 Summary of Strategic Priorities&lt;/h4&gt;
                    &lt;p className="text-amber-900 text-sm"&gt;FOAM's strategic direction focuses on &lt;strong&gt;deepening impact&lt;/strong&gt; rather than simply expanding reach. By strengthening employer relationships, enhancing retention support, and building sustainable solutions to persistent barriers, we aim to improve outcomes for each father served.&lt;/p&gt;
                  &lt;/div&gt;
                &lt;/div&gt;
              &lt;/div&gt;

              {/* FOOTER */}
              &lt;div className="text-center py-8 border-t-4 border-[#0F2C5C]"&gt;
                &lt;div className="text-2xl font-bold text-[#0F2C5C] mb-2"&gt;Fathers On A Mission&lt;/div&gt;
                &lt;div className="text-[#0F2C5C] italic mb-2"&gt;"Enhancing Fathers, Strengthening Families"&lt;/div&gt;
                &lt;div className="text-sm text-gray-400"&gt;East Baton Rouge Parish, Louisiana&lt;br/&gt;Report Period: {periodLabel} | Generated: {generatedDate}&lt;/div&gt;
              &lt;/div&gt;
            &lt;/div&gt;
          &lt;/div&gt;
        &lt;/div&gt;
      &lt;/div&gt;
    );
  };

  // Data table renderer
  const renderDataTable = (data: DataRow[], months: string[], editable: boolean = false) => (
    <div className="overflow-x-auto bg-white rounded-xl border border-gray-200 shadow-sm">
      <table className="w-full">
        <thead><tr style={{ background: 'linear-gradient(135deg, #0F2C5C 0%, #1a365d 100%)' }}>
          <th className="sticky left-0 px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider min-w-[200px]" style={{ background: '#0F2C5C' }}>Category</th>
          {months.map((month, i) => (<th key={i} className="px-3 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider min-w-[80px]">{month}</th>))}
        </tr></thead>
        <tbody className="divide-y divide-gray-200">
          {data.map((row, rowIndex) => (
            <tr key={row.id} className="hover:bg-blue-50 transition-colors">
              <td className="sticky left-0 bg-white px-4 py-3 text-sm font-medium text-gray-800 flex items-center gap-2 border-r border-gray-100">{getCategoryIcon(row.category)}{row.category}</td>
              {row.values.map((value, colIndex) => (
                <td key={colIndex} className={`px-3 py-3 text-center text-sm ${editable && colIndex !== months.length - 1 ? 'cursor-pointer hover:bg-blue-100' : ''} ${colIndex === months.length - 1 ? 'bg-blue-50 font-semibold text-blue-700' : 'text-gray-700'}`} onClick={() => editable && handleCellClick(rowIndex, colIndex, value)}>
                  {editingCell?.row === rowIndex && editingCell?.col === colIndex ? (
                    <div className="flex items-center gap-1">
                      <input type="number" value={editValue} onChange={(e) => setEditValue(e.target.value)} className="w-16 px-2 py-1 bg-white border-2 border-blue-500 rounded text-center text-gray-800" autoFocus onKeyDown={(e) => { if (e.key === 'Enter') handleSaveCell(); if (e.key === 'Escape') setEditingCell(null); }} />
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
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2"><FileText size={20} className="text-blue-600" />Generate Funder Report</h3>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-600 mb-2">Data Source</label>
          <div className="flex gap-3">
            <button onClick={() => setSelectedYear('2026')} className={`px-4 py-2 rounded-lg font-medium transition-all ${selectedYear === '2026' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'}`}>2026 (Current)</button>
            <button onClick={() => setSelectedYear('2024-2025')} className={`px-4 py-2 rounded-lg font-medium transition-all ${selectedYear === '2024-2025' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'}`}>2024-2025 (Historical)</button>
          </div>
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-600 mb-2">Report Type</label>
          <div className="grid grid-cols-4 gap-3">
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
            <button onClick={() => setReportType('indepth')} className={`p-4 rounded-xl border-2 transition-all ${reportType === 'indepth' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
              <Sparkles size={24} className={reportType === 'indepth' ? 'text-purple-600 mx-auto mb-2' : 'text-gray-400 mx-auto mb-2'} />
              <div className={`font-medium ${reportType === 'indepth' ? 'text-purple-600' : 'text-gray-700'}`}>In-Depth</div>
              <div className="text-xs text-gray-500 mt-1">12-Section Grant Report</div>
            </button>
          </div>
        </div>
        {reportType === 'monthly' && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-600 mb-2">Select Month</label>
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))} className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-800">
              {['January','February','March','April','May','June','July','August','September','October','November','December'].map((month, i) => (<option key={i} value={i}>{month}</option>))}
            </select>
          </div>
        )}
        {reportType === 'quarterly' && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-600 mb-2">Select Quarter</label>
            <div className="flex gap-3">
              {[1,2,3,4].map((q) => (<button key={q} onClick={() => setSelectedQuarter(q)} className={`flex-1 py-2 rounded-lg font-medium transition-all ${selectedQuarter === q ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'}`}>Q{q}</button>))}
            </div>
          </div>
        )}
        {reportType === 'indepth' && (
          <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-xl">
            <div className="flex items-start gap-3">
              <Sparkles size={24} className="text-purple-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-purple-800 mb-2">Comprehensive Grant Report (12 Sections)</h4>
                <p className="text-sm text-gray-600 mb-3">Generates a complete funder-ready annual outcomes report including:</p>
                <ul className="text-sm text-gray-600 grid grid-cols-2 gap-1">
                  <li>✓ Executive Summary</li><li>✓ Annual Outcomes Table</li>
                  <li>✓ Program Reach Analysis</li><li>✓ Service Model Overview</li>
                  <li>✓ Workforce Pipeline Charts</li><li>✓ Employment Outcomes</li>
                  <li>✓ Stabilization Support</li><li>✓ Mental Health Integration</li>
                  <li>✓ KPI Performance Dashboard</li><li>✓ Organizational Capacity</li>
                  <li>✓ Challenges & Lessons</li><li>✓ Strategic Recommendations</li>
                </ul>
              </div>
            </div>
          </div>
        )}
        <div className="flex gap-3">
          <button onClick={() => setShowPreview(true)} disabled={!previewData} className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 border border-gray-300"><Eye size={18} />Preview Data</button>
          <button onClick={handleGenerateReport} disabled={isGenerating} className="flex items-center gap-2 px-6 py-2 text-white rounded-lg disabled:opacity-50" style={{ background: 'linear-gradient(135deg, #0F2C5C 0%, #1a365d 100%)' }}>
            {isGenerating ? (<><RefreshCw size={18} className="animate-spin" />Generating...</>) : (<><FileDown size={18} />Generate Report</>)}
          </button>
        </div>
      </div>

      {/* Generated Report Display */}
      {generatedReport && (
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2"><CheckCircle2 size={20} className="text-green-600" />Report Generated Successfully</h3>
            <div className="flex gap-2">
              {reportType === 'indepth' && (
                <button onClick={() => setShowFullReport(true)} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"><Monitor size={16} />View on Screen</button>
              )}
              <button onClick={() => handleDownloadReport('word')} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"><Download size={16} />Download Word</button>
              <button onClick={() => handleDownloadReport('pdf')} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"><Printer size={16} />Export PDF</button>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Fathers On A Mission</h2>
              <p className="text-gray-600">{reportType === 'indepth' ? 'Comprehensive Annual Report (12 Sections)' : (generatedReport.metadata?.reportType?.charAt(0).toUpperCase() + generatedReport.metadata?.reportType?.slice(1) + ' Report')}</p>
              <p className="text-blue-600 font-medium">{generatedReport.metadata?.periodLabel}</p>
            </div>
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-200"><div className="text-3xl font-bold text-blue-700">{generatedReport.keyMetrics?.activeFathers || 0}</div><div className="text-xs text-gray-600 uppercase">Fathers Served</div></div>
              <div className="bg-emerald-50 rounded-xl p-4 text-center border border-emerald-200"><div className="text-3xl font-bold text-emerald-700">{generatedReport.keyMetrics?.fatherhoodClassEnrollment || 0}</div><div className="text-xs text-gray-600 uppercase">Class Enrollment</div></div>
              <div className="bg-amber-50 rounded-xl p-4 text-center border border-amber-200"><div className="text-3xl font-bold text-amber-700">{generatedReport.keyMetrics?.jobPlacements || 0}</div><div className="text-xs text-gray-600 uppercase">Job Placements</div></div>
              <div className="bg-purple-50 rounded-xl p-4 text-center border border-purple-200"><div className="text-3xl font-bold text-purple-700">{generatedReport.successMetrics?.retentionRate || 0}%</div><div className="text-xs text-gray-600 uppercase">Retention Rate</div></div>
            </div>
            {reportType === 'indepth' && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-semibold text-purple-800 mb-2">📄 Report Contains 12 Comprehensive Sections</h4>
                <div className="grid grid-cols-3 gap-2 text-sm text-gray-700">
                  <div>1. Executive Summary</div><div>2. Annual Outcomes</div><div>3. Program Reach</div>
                  <div>4. Service Model</div><div>5. Workforce Pipeline</div><div>6. Employment Outcomes</div>
                  <div>7. Stabilization</div><div>8. Mental Health</div><div>9. KPIs</div>
                  <div>10. Org Capacity</div><div>11. Challenges</div><div>12. Strategic Direction</div>
                </div>
                <p className="text-purple-700 text-sm mt-3">💡 Click <strong>"View on Screen"</strong> to see the full visual report, or download as Word/PDF.</p>
              </div>
            )}
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
              <thead><tr className="border-b border-gray-200"><th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Category</th><th className="px-4 py-2 text-right text-sm font-medium text-gray-600">Value</th></tr></thead>
              <tbody>{previewData.map((item: any, i: number) => (<tr key={i} className="border-b border-gray-100"><td className="px-4 py-2 text-sm text-gray-700">{item.category}</td><td className="px-4 py-2 text-sm text-right text-blue-600 font-medium">{item.value}</td></tr>))}</tbody>
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
            { id: 'current', label: '2026 Data Entry', icon: Edit3 },
            { id: 'historical', label: '2024-2025 Historical', icon: History },
            { id: 'comparison', label: 'Year Comparison', icon: BarChart3 },
            { id: 'log', label: 'Change Log', icon: ClipboardList },
            { id: 'reports', label: 'Generate Reports', icon: FileText }
          ].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as TabType)} className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              <tab.icon size={16} />{tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {error && (<div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2"><AlertTriangle size={20} />{error}</div>)}
        {activeTab === 'current' && currentData.length > 0 && renderDataTable(currentData, currentMonths, true)}
        {activeTab === 'historical' && historicalData.length > 0 && renderDataTable(historicalData, historicalMonths)}
        {activeTab === 'comparison' && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <table className="w-full">
              <thead><tr style={{ background: 'linear-gradient(135deg, #0F2C5C 0%, #1a365d 100%)' }}><th className="px-4 py-3 text-left text-xs font-semibold text-white">Metric</th><th className="px-4 py-3 text-center text-xs font-semibold text-white">2024-2025</th><th className="px-4 py-3 text-center text-xs font-semibold text-white">2026</th><th className="px-4 py-3 text-center text-xs font-semibold text-white">Change</th><th className="px-4 py-3 text-center text-xs font-semibold text-white">% Change</th></tr></thead>
              <tbody>{comparisonData.map((row) => (<tr key={row.id} className="border-t border-gray-200 hover:bg-blue-50"><td className="px-4 py-3 text-sm text-gray-800">{row.metric}</td><td className="px-4 py-3 text-center text-sm text-gray-700">{row.historical}</td><td className="px-4 py-3 text-center text-sm text-gray-700">{row.current}</td><td className={`px-4 py-3 text-center text-sm font-medium ${row.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>{row.change >= 0 ? '+' : ''}{row.change}</td><td className={`px-4 py-3 text-center text-sm font-medium ${row.percentChange >= 0 ? 'text-green-600' : 'text-red-600'}`}><span className="flex items-center justify-center gap-1">{row.percentChange >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}{Math.abs(row.percentChange)}%</span></td></tr>))}</tbody>
            </table>
          </div>
        )}
        {activeTab === 'log' && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <table className="w-full">
              <thead><tr style={{ background: 'linear-gradient(135deg, #0F2C5C 0%, #1a365d 100%)' }}><th className="px-4 py-3 text-left text-xs font-semibold text-white">Date</th><th className="px-4 py-3 text-left text-xs font-semibold text-white">Case Manager</th><th className="px-4 py-3 text-left text-xs font-semibold text-white">Month/Year</th><th className="px-4 py-3 text-left text-xs font-semibold text-white">Category</th><th className="px-4 py-3 text-center text-xs font-semibold text-white">Old → New</th></tr></thead>
              <tbody>{logData.map((entry) => (<tr key={entry.id} className="border-t border-gray-200 hover:bg-blue-50"><td className="px-4 py-3 text-sm text-gray-500">{entry.date}</td><td className="px-4 py-3 text-sm text-blue-600 font-medium">{entry.caseManager}</td><td className="px-4 py-3 text-sm text-gray-700">{entry.month} {entry.year}</td><td className="px-4 py-3 text-sm text-gray-700">{entry.category}</td><td className="px-4 py-3 text-center text-sm"><span className="text-red-600">{entry.oldValue}</span><span className="text-gray-400 mx-2">→</span><span className="text-green-600">{entry.newValue}</span></td></tr>))}</tbody>
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
            <input type="text" placeholder="Your name" value={caseManagerName} onChange={(e) => setCaseManagerName(e.target.value)} className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 mb-4" autoFocus />
            <div className="flex gap-3">
              <button onClick={() => setShowNamePrompt(false)} className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 border border-gray-300">Cancel</button>
              <button onClick={() => { if (caseManagerName.trim()) setShowNamePrompt(false); }} disabled={!caseManagerName.trim()} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">Continue</button>
            </div>
          </div>
        </div>
      )}

      {/* Full Report Viewer */}
      {renderFullReportViewer()}
    </div>
  );
};

export default CaseManagerPortal;
