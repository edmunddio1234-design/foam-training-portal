import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft, Calendar, RefreshCw, Save, Clock, TrendingUp,
  TrendingDown, FileText, Users, Briefcase, Heart, DollarSign,
  CheckCircle2, Edit3, X, ChevronRight, BarChart3, History,
  ClipboardList, Target, AlertTriangle, Download, Eye, PieChart,
  Printer, FileDown, Sparkles, ArrowUpRight, ArrowDownRight,
  BookOpen, Shield, Activity, Layers, Building2, UserCheck
} from 'lucide-react';

const API_BASE_URL = 'https://foamla-backend-2.onrender.com';

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

interface CaseManagerPortalProps {
  onClose: () => void;
}

type TabType = 'historical' | 'current' | 'comparison' | 'log' | 'reports';
type ReportType = 'monthly' | 'quarterly' | 'annual' | 'indepth';

// Mini Bar Chart Component
const MiniBarChart: React.FC<{ data: number[]; labels: string[]; color: string }> = ({ data, labels, color }) => {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-1 h-24">
      {data.map((val, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div 
            className="w-full rounded-t transition-all duration-300"
            style={{ height: `${(val / max) * 100}%`, backgroundColor: color, minHeight: val > 0 ? '4px' : '0' }}
          />
          <span className="text-[10px] text-gray-500">{labels[i]}</span>
        </div>
      ))}
    </div>
  );
};

// Mini Pie Chart Component
const MiniPieChart: React.FC<{ data: { label: string; value: number; color: string }[] }> = ({ data }) => {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) return <div className="text-gray-400 text-sm">No data</div>;
  
  let cumulativePercent = 0;

  const getCoords = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  return (
    <div className="flex items-center gap-4">
      <svg viewBox="-1 -1 2 2" className="w-20 h-20 transform -rotate-90">
        {data.filter(d => d.value > 0).map((d, i) => {
          const percent = d.value / total;
          const [startX, startY] = getCoords(cumulativePercent);
          cumulativePercent += percent;
          const [endX, endY] = getCoords(cumulativePercent);
          const largeArc = percent > 0.5 ? 1 : 0;
          return (
            <path
              key={i}
              d={`M ${startX} ${startY} A 1 1 0 ${largeArc} 1 ${endX} ${endY} L 0 0`}
              fill={d.color}
            />
          );
        })}
      </svg>
      <div className="space-y-1">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
            <span className="text-gray-600">{d.label}: {d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const CaseManagerPortal: React.FC<CaseManagerPortalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('current');
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

  // Report Generator State
  const [reportType, setReportType] = useState<ReportType>('monthly');
  const [selectedYear, setSelectedYear] = useState<'2024-2025' | '2026'>('2026');
  const [selectedMonth, setSelectedMonth] = useState<number>(0);
  const [selectedQuarter, setSelectedQuarter] = useState<number>(1);
  const [showPreview, setShowPreview] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
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
      setError(err.message || 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCellClick = (rowIndex: number, colIndex: number, currentValue: number | string | null) => {
    if (activeTab !== 'current') return;
    if (colIndex === currentMonths.length - 1) return;
    
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
        setTimeout(() => loadData(), 500);
      } else {
        alert('Failed to save: ' + data.error);
      }
    } catch (err: any) {
      alert('Error saving: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('active') || cat.includes('enrolled')) return <Users size={16} className="text-blue-600" />;
    if (cat.includes('job') || cat.includes('employment') || cat.includes('workforce')) return <Briefcase size={16} className="text-emerald-600" />;
    if (cat.includes('mental') || cat.includes('relationship') || cat.includes('better father')) return <Heart size={16} className="text-pink-600" />;
    if (cat.includes('financial') || cat.includes('income')) return <DollarSign size={16} className="text-amber-600" />;
    if (cat.includes('education') || cat.includes('skill')) return <FileText size={16} className="text-purple-600" />;
    return <ClipboardList size={16} className="text-gray-500" />;
  };

  // Report Data Calculations
  const reportData = useMemo(() => {
    const sourceData = selectedYear === '2026' ? currentData : historicalData;
    const sourceMonths = selectedYear === '2026' ? currentMonths : historicalMonths;
    
    if (sourceData.length === 0) return null;

    const months = selectedYear === '2026' 
      ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      : sourceMonths.slice(0, -1);
    
    const getMonthData = (monthIndex: number) => {
      return sourceData.map(row => ({
        category: row.category,
        value: typeof row.values[monthIndex] === 'number' ? row.values[monthIndex] as number : 0
      }));
    };

    const getQuarterData = (quarter: number) => {
      let startMonth: number;
      if (selectedYear === '2026') {
        startMonth = (quarter - 1) * 3;
      } else {
        startMonth = (quarter - 1) * 3;
      }
      
      return sourceData.map(row => {
        const q1 = typeof row.values[startMonth] === 'number' ? row.values[startMonth] as number : 0;
        const q2 = typeof row.values[startMonth + 1] === 'number' ? row.values[startMonth + 1] as number : 0;
        const q3 = typeof row.values[startMonth + 2] === 'number' ? row.values[startMonth + 2] as number : 0;
        return {
          category: row.category,
          value: q1 + q2 + q3,
          monthly: [q1, q2, q3]
        };
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

    return {
      months,
      getMonthData,
      getQuarterData,
      getYearData
    };
  }, [currentData, historicalData, currentMonths, historicalMonths, selectedYear]);

  const previewData = useMemo(() => {
    if (!reportData) return null;

    if (reportType === 'monthly') {
      return reportData.getMonthData(selectedMonth);
    } else if (reportType === 'quarterly') {
      return reportData.getQuarterData(selectedQuarter);
    } else {
      return reportData.getYearData();
    }
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
          reportType: reportType === 'indepth' ? 'annual' : reportType,
          period: reportType === 'monthly' ? selectedMonth : reportType === 'quarterly' ? selectedQuarter : 0
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // For in-depth reports, enhance with additional metadata
        if (reportType === 'indepth') {
          data.report.metadata = {
            ...data.report.metadata,
            reportType: 'indepth',
            periodLabel: selectedYear === '2024-2025' ? 'October 2024 – September 2025' : 'January 2026 – December 2026'
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

  // ============================================
  // STANDARD WORD DOCUMENT GENERATION
  // ============================================
  const generateWordDocument = (report: any) => {
    const periodLabel = report.metadata?.periodLabel || 'Report';
    const generatedDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', month: 'long', day: 'numeric' 
    });

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>FOAM ${report.metadata?.reportType || 'Monthly'} Report - ${periodLabel}</title>
  <style>
    @page { margin: 1in; size: letter; }
    body { 
      font-family: Arial, sans-serif; 
      margin: 0; 
      padding: 40px;
      color: #1e293b; 
      line-height: 1.6;
      font-size: 11pt;
    }
    
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 3px solid #0F2C5C;
    }
    .header h1 {
      color: #0F2C5C;
      margin: 0 0 5px 0;
      font-size: 28pt;
      font-weight: bold;
    }
    .header h2 {
      color: #475569;
      margin: 0 0 10px 0;
      font-size: 16pt;
      font-weight: normal;
    }
    .header .period {
      color: #0F2C5C;
      font-size: 14pt;
      font-weight: bold;
    }
    .header .date {
      color: #94a3b8;
      font-size: 10pt;
      margin-top: 10px;
    }
    
    .kpi-section {
      margin: 30px 0;
    }
    .kpi-card {
      display: table-cell;
      width: 25%;
      padding: 20px;
      text-align: center;
      border-radius: 8px;
      vertical-align: top;
    }
    .kpi-card.blue { background: #eff6ff; border: 2px solid #bfdbfe; }
    .kpi-card.green { background: #ecfdf5; border: 2px solid #a7f3d0; }
    .kpi-card.amber { background: #fffbeb; border: 2px solid #fde68a; }
    .kpi-card.purple { background: #faf5ff; border: 2px solid #e9d5ff; }
    .kpi-value {
      font-size: 32pt;
      font-weight: bold;
      margin: 10px 0;
    }
    .kpi-card.blue .kpi-value { color: #0F2C5C; }
    .kpi-card.green .kpi-value { color: #059669; }
    .kpi-card.amber .kpi-value { color: #d97706; }
    .kpi-card.purple .kpi-value { color: #7c3aed; }
    .kpi-label {
      font-size: 10pt;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .section {
      margin: 30px 0;
      page-break-inside: avoid;
    }
    .section-title {
      color: #0F2C5C;
      font-size: 14pt;
      font-weight: bold;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 2px solid #e2e8f0;
    }
    
    .summary-item {
      background: #f0f9ff;
      border-left: 4px solid #0F2C5C;
      padding: 12px 15px;
      margin: 10px 0;
      border-radius: 0 8px 8px 0;
    }
    
    table.outcomes {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
      font-size: 10pt;
    }
    table.outcomes th {
      background: #0F2C5C;
      color: white;
      padding: 12px;
      text-align: left;
      font-weight: bold;
    }
    table.outcomes th:first-child {
      border-radius: 8px 0 0 0;
    }
    table.outcomes th:last-child {
      border-radius: 0 8px 0 0;
    }
    table.outcomes td {
      padding: 10px 12px;
      border-bottom: 1px solid #e2e8f0;
    }
    table.outcomes tr:nth-child(even) {
      background: #f8fafc;
    }
    table.outcomes .result {
      color: #0F2C5C;
      font-weight: bold;
      text-align: center;
    }
    table.outcomes .clarification {
      color: #64748b;
      font-size: 9pt;
    }
    
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e2e8f0;
      text-align: center;
      color: #94a3b8;
      font-size: 9pt;
    }
    .footer .tagline {
      color: #0F2C5C;
      font-style: italic;
      margin-top: 5px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Fathers On A Mission</h1>
    <h2>${report.metadata?.reportType?.charAt(0).toUpperCase() + report.metadata?.reportType?.slice(1) || 'Monthly'} Outcomes Report</h2>
    <div class="period">${periodLabel}</div>
    <div class="date">Generated: ${generatedDate}</div>
  </div>

  <div class="kpi-section">
    <table style="width: 100%; border-collapse: separate; border-spacing: 10px;">
      <tr>
        <td class="kpi-card blue">
          <div class="kpi-label">Fathers Served</div>
          <div class="kpi-value">${report.keyMetrics?.activeFathers || 0}</div>
        </td>
        <td class="kpi-card green">
          <div class="kpi-label">Class Enrollment</div>
          <div class="kpi-value">${report.keyMetrics?.fatherhoodClassEnrollment || 0}</div>
        </td>
        <td class="kpi-card amber">
          <div class="kpi-label">Job Placements</div>
          <div class="kpi-value">${report.keyMetrics?.jobPlacements || 0}</div>
        </td>
        <td class="kpi-card purple">
          <div class="kpi-label">Retention Rate</div>
          <div class="kpi-value">${report.successMetrics?.retentionRate || 0}%</div>
        </td>
      </tr>
    </table>
  </div>

  <div class="section">
    <div class="section-title">📋 Executive Summary</div>
    ${(report.narrativeInsights || []).map((insight: string) => `
      <div class="summary-item">${insight}</div>
    `).join('')}
  </div>

  <div class="section">
    <table style="width: 100%; border-collapse: separate; border-spacing: 15px;">
      <tr>
        <td style="width: 48%; vertical-align: top; background: #f8fafc; padding: 20px; border-radius: 8px;">
          <h4 style="margin: 0 0 15px 0; color: #334155;">Program Engagement</h4>
          ${(report.programBreakdown || []).map((item: any) => `
            <div style="display: flex; align-items: center; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
              <div style="width: 12px; height: 12px; border-radius: 50%; background: ${item.color}; margin-right: 10px;"></div>
              <div style="flex: 1;">${item.name}</div>
              <div style="font-weight: bold;">${item.value}</div>
            </div>
          `).join('')}
        </td>
        <td style="width: 48%; vertical-align: top; background: #f8fafc; padding: 20px; border-radius: 8px;">
          <h4 style="margin: 0 0 15px 0; color: #334155;">Workforce Pipeline</h4>
          ${(report.workforceOutcomes || []).map((item: any, i: number) => {
            const colors = ['#0F2C5C', '#10b981', '#8b5cf6'];
            const max = Math.max(...(report.workforceOutcomes || []).map((o: any) => o.value), 1);
            const width = (item.value / max) * 100;
            return `
              <div style="margin: 12px 0;">
                <div style="display: flex; justify-content: space-between; font-size: 10pt; margin-bottom: 5px;">
                  <span>${item.name}</span>
                  <span style="font-weight: bold;">${item.value}</span>
                </div>
                <div style="height: 20px; background: #e2e8f0; border-radius: 4px; overflow: hidden;">
                  <div style="height: 100%; width: ${width}%; background: ${colors[i % 3]}; border-radius: 4px;"></div>
                </div>
              </div>
            `;
          }).join('')}
        </td>
      </tr>
    </table>
  </div>

  <div class="section">
    <div class="section-title">🎯 Success Metrics</div>
    <table style="width: 100%; border-collapse: separate; border-spacing: 10px;">
      <tr>
        ${[
          { label: 'Workforce Participation', value: report.successMetrics?.workforceParticipationRate || 0 },
          { label: 'Job Placement Rate', value: report.successMetrics?.jobPlacementRate || 0 },
          { label: 'Job Retention Rate', value: report.successMetrics?.retentionRate || 0 },
          { label: 'Mental Health Engagement', value: report.successMetrics?.mentalHealthEngagement || 0 }
        ].map((metric) => {
          const color = metric.value >= 50 ? '#10b981' : metric.value >= 25 ? '#f59e0b' : '#ef4444';
          return `
            <td style="width: 25%; text-align: center; padding: 15px; background: #f8fafc; border-radius: 8px;">
              <div style="width: 70px; height: 70px; border-radius: 50%; border: 5px solid ${color}; margin: 0 auto 10px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 18pt; font-weight: bold; color: ${color};">${metric.value}%</span>
              </div>
              <div style="font-size: 9pt; color: #64748b;">${metric.label}</div>
            </td>
          `;
        }).join('')}
      </tr>
    </table>
  </div>

  <div class="section">
    <div class="section-title">📊 Outcome Summary</div>
    <table class="outcomes">
      <thead>
        <tr>
          <th style="width: 50%;">Outcome Area</th>
          <th style="width: 15%; text-align: center;">Results</th>
          <th style="width: 35%;">Clarification</th>
        </tr>
      </thead>
      <tbody>
        ${(report.outcomeSummary || []).map((row: any) => `
          <tr>
            <td>${row.area}</td>
            <td class="result">${row.result}</td>
            <td class="clarification">${row.clarification}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <div class="footer">
    <div><strong>Fathers On A Mission (FOAM)</strong> | Baton Rouge, Louisiana</div>
    <div class="tagline">"Enhance Fathers, Strengthen Families"</div>
  </div>
</body>
</html>`;

    return html;
  };

  // ============================================
  // IN-DEPTH COMPREHENSIVE REPORT GENERATION
  // ============================================
  const generateInDepthWordDocument = (report: any) => {
    const generatedDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', month: 'long', day: 'numeric' 
    });
    
    const periodLabel = report.metadata?.periodLabel || 
      (selectedYear === '2024-2025' ? 'October 2024 – September 2025' : 'January 2026 – December 2026');

    // Extract key metrics
    const activeFathers = report.keyMetrics?.activeFathers || 159;
    const fatherhoodClassEnrollment = report.keyMetrics?.fatherhoodClassEnrollment || 70;
    const workforceParticipation = report.keyMetrics?.workforceParticipation || 77;
    const jobPlacements = report.keyMetrics?.jobPlacements || 35;
    const jobRetention = report.keyMetrics?.jobRetention || 29;
    const stabilizationSupport = report.keyMetrics?.stabilizationSupport || 231;
    const avgMonthlyEngagement = report.keyMetrics?.avgMonthlyEngagement || 60;

    const workforceParticipationRate = report.successMetrics?.workforceParticipationRate || Math.round((workforceParticipation / activeFathers) * 100);
    const jobPlacementRate = report.successMetrics?.jobPlacementRate || Math.round((jobPlacements / workforceParticipation) * 100);
    const retentionRate = report.successMetrics?.retentionRate || Math.round((jobRetention / jobPlacements) * 100);
    const mentalHealthEngagement = report.successMetrics?.mentalHealthEngagement || 45;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Fathers On A Mission - Annual Outcomes Report ${selectedYear}</title>
  <style>
    @page { margin: 0.75in; size: letter; }
    body { 
      font-family: Arial, sans-serif; 
      margin: 0; 
      padding: 30px;
      color: #1e293b; 
      line-height: 1.7;
      font-size: 11pt;
    }
    
    /* Cover Header */
    .cover-header {
      text-align: center;
      padding: 40px 20px;
      margin-bottom: 30px;
      background: linear-gradient(135deg, #0F2C5C 0%, #1a365d 100%);
      color: white;
      border-radius: 16px;
    }
    .cover-header .logo {
      width: 120px;
      height: 40px;
      background: white;
      border-radius: 8px;
      margin: 0 auto 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      color: #0F2C5C;
      font-size: 14pt;
    }
    .cover-header h1 {
      margin: 0 0 10px 0;
      font-size: 26pt;
      font-weight: bold;
      letter-spacing: -0.5px;
    }
    .cover-header h2 {
      margin: 0 0 15px 0;
      font-size: 14pt;
      font-weight: normal;
      opacity: 0.9;
    }
    .cover-header .period {
      font-size: 12pt;
      background: rgba(255,255,255,0.2);
      padding: 8px 20px;
      border-radius: 20px;
      display: inline-block;
    }
    
    /* Section Styles */
    .section {
      margin: 35px 0;
      page-break-inside: avoid;
    }
    .section-title {
      color: #0F2C5C;
      font-size: 16pt;
      font-weight: bold;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 3px solid #0F2C5C;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .section-number {
      background: #0F2C5C;
      color: white;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 12pt;
    }
    
    /* Outcomes Table */
    .outcomes-table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
      font-size: 10pt;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      border-radius: 8px;
      overflow: hidden;
    }
    .outcomes-table th {
      background: #0F2C5C;
      color: white;
      padding: 14px 12px;
      text-align: left;
      font-weight: bold;
      font-size: 9pt;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .outcomes-table td {
      padding: 12px;
      border-bottom: 1px solid #e2e8f0;
      vertical-align: top;
    }
    .outcomes-table tr:nth-child(even) {
      background: #f8fafc;
    }
    .outcomes-table .metric-value {
      color: #0F2C5C;
      font-weight: bold;
      font-size: 11pt;
      text-align: center;
      white-space: nowrap;
    }
    .outcomes-table .clarification {
      color: #64748b;
      font-size: 9pt;
      line-height: 1.5;
    }
    
    /* KPI Cards */
    .kpi-grid {
      display: table;
      width: 100%;
      border-collapse: separate;
      border-spacing: 12px;
      margin: 25px 0;
    }
    .kpi-row {
      display: table-row;
    }
    .kpi-card {
      display: table-cell;
      width: 25%;
      padding: 20px 15px;
      text-align: center;
      border-radius: 12px;
      vertical-align: top;
    }
    .kpi-card.blue { background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border: 2px solid #93c5fd; }
    .kpi-card.green { background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border: 2px solid #6ee7b7; }
    .kpi-card.amber { background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); border: 2px solid #fcd34d; }
    .kpi-card.purple { background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%); border: 2px solid #c4b5fd; }
    .kpi-value {
      font-size: 36pt;
      font-weight: bold;
      margin: 8px 0;
      line-height: 1;
    }
    .kpi-card.blue .kpi-value { color: #0F2C5C; }
    .kpi-card.green .kpi-value { color: #059669; }
    .kpi-card.amber .kpi-value { color: #d97706; }
    .kpi-card.purple .kpi-value { color: #7c3aed; }
    .kpi-label {
      font-size: 9pt;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 600;
    }
    .kpi-sublabel {
      font-size: 8pt;
      color: #94a3b8;
      margin-top: 4px;
    }
    
    /* Info Box */
    .info-box {
      background: #f0f9ff;
      border-left: 5px solid #0F2C5C;
      padding: 15px 20px;
      margin: 20px 0;
      border-radius: 0 12px 12px 0;
    }
    .info-box.green {
      background: #ecfdf5;
      border-left-color: #10b981;
    }
    .info-box.amber {
      background: #fffbeb;
      border-left-color: #f59e0b;
    }
    .info-box p {
      margin: 0;
      color: #334155;
    }
    .info-box strong {
      color: #0F2C5C;
    }
    
    /* Program Boxes */
    .program-diagram {
      display: table;
      width: 100%;
      border-collapse: separate;
      border-spacing: 15px;
      margin: 20px 0;
    }
    .program-box {
      display: table-cell;
      width: 48%;
      padding: 25px;
      border-radius: 16px;
      vertical-align: top;
    }
    .program-box.primary {
      background: linear-gradient(135deg, #0F2C5C 0%, #1a365d 100%);
      color: white;
    }
    .program-box.secondary {
      background: linear-gradient(135deg, #059669 0%, #10b981 100%);
      color: white;
    }
    .program-box h3 {
      margin: 0 0 10px 0;
      font-size: 14pt;
    }
    .program-box p {
      margin: 0;
      opacity: 0.9;
      font-size: 10pt;
      line-height: 1.6;
    }
    .program-box ul {
      margin: 15px 0 0 0;
      padding-left: 20px;
    }
    .program-box li {
      margin: 6px 0;
      font-size: 10pt;
      opacity: 0.9;
    }
    
    /* Progress Bars */
    .progress-item {
      margin: 15px 0;
    }
    .progress-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 6px;
      font-size: 10pt;
    }
    .progress-label {
      color: #334155;
      font-weight: 500;
    }
    .progress-value {
      color: #0F2C5C;
      font-weight: bold;
    }
    .progress-bar {
      height: 24px;
      background: #e2e8f0;
      border-radius: 12px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      border-radius: 12px;
    }
    .progress-fill.blue { background: linear-gradient(90deg, #0F2C5C, #1a365d); }
    .progress-fill.green { background: linear-gradient(90deg, #10b981, #059669); }
    .progress-fill.purple { background: linear-gradient(90deg, #8b5cf6, #7c3aed); }
    .progress-fill.amber { background: linear-gradient(90deg, #f59e0b, #d97706); }
    
    /* Metric Circles */
    .metrics-grid {
      display: table;
      width: 100%;
      border-collapse: separate;
      border-spacing: 10px;
      margin: 20px 0;
    }
    .metric-circle-container {
      display: table-cell;
      width: 25%;
      text-align: center;
      padding: 15px;
      background: #f8fafc;
      border-radius: 12px;
    }
    .metric-circle {
      width: 90px;
      height: 90px;
      border-radius: 50%;
      margin: 0 auto 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22pt;
      font-weight: bold;
    }
    .metric-label {
      font-size: 9pt;
      color: #64748b;
      font-weight: 500;
    }
    
    /* Staffing Table */
    .staffing-table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
      font-size: 10pt;
    }
    .staffing-table th {
      background: #0F2C5C;
      color: white;
      padding: 12px;
      text-align: left;
    }
    .staffing-table td {
      padding: 12px;
      border-bottom: 1px solid #e2e8f0;
    }
    .staffing-table tr:nth-child(even) {
      background: #f8fafc;
    }
    .role-badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 9pt;
      font-weight: 600;
    }
    .role-badge.primary { background: #dbeafe; color: #0F2C5C; }
    .role-badge.secondary { background: #d1fae5; color: #059669; }
    .role-badge.tertiary { background: #fef3c7; color: #d97706; }
    
    /* Two Column Layout */
    .two-col {
      display: table;
      width: 100%;
      border-collapse: separate;
      border-spacing: 15px;
    }
    .col {
      display: table-cell;
      width: 48%;
      vertical-align: top;
      padding: 20px;
      background: #f8fafc;
      border-radius: 12px;
    }
    .col h4 {
      margin: 0 0 15px 0;
      color: #0F2C5C;
      font-size: 12pt;
    }
    .col ul {
      margin: 0;
      padding-left: 20px;
    }
    .col li {
      margin: 8px 0;
      color: #475569;
      font-size: 10pt;
    }
    
    /* Page Break */
    .page-break {
      page-break-before: always;
      margin-top: 0;
    }
    
    /* Callout Box */
    .callout {
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      border: 2px solid #f59e0b;
      border-radius: 12px;
      padding: 20px;
      margin: 25px 0;
    }
    .callout h4 {
      margin: 0 0 10px 0;
      color: #92400e;
      font-size: 12pt;
    }
    .callout p {
      margin: 0;
      color: #78350f;
      font-size: 10pt;
    }
    
    /* Flowchart Style */
    .flow-container {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      margin: 25px 0;
      flex-wrap: wrap;
    }
    .flow-box {
      padding: 15px 20px;
      border-radius: 12px;
      text-align: center;
      font-size: 10pt;
      font-weight: 600;
      min-width: 140px;
    }
    .flow-box.intake { background: #dbeafe; color: #0F2C5C; }
    .flow-box.assessment { background: #d1fae5; color: #059669; }
    .flow-box.services { background: #fef3c7; color: #d97706; }
    .flow-box.outcomes { background: #f3e8ff; color: #7c3aed; }
    .flow-arrow {
      font-size: 20pt;
      color: #94a3b8;
    }
    
    /* Footer */
    .footer {
      margin-top: 50px;
      padding-top: 25px;
      border-top: 3px solid #0F2C5C;
      text-align: center;
    }
    .footer-logo {
      font-size: 18pt;
      font-weight: bold;
      color: #0F2C5C;
      margin-bottom: 8px;
    }
    .footer-tagline {
      color: #0F2C5C;
      font-style: italic;
      font-size: 11pt;
      margin-bottom: 8px;
    }
    .footer-info {
      color: #94a3b8;
      font-size: 9pt;
    }
    
    /* Charts */
    .chart-container {
      background: #f8fafc;
      border-radius: 12px;
      padding: 20px;
      margin: 20px 0;
    }
    .chart-title {
      font-size: 12pt;
      font-weight: bold;
      color: #334155;
      margin-bottom: 15px;
    }
    .bar-chart {
      display: flex;
      align-items: flex-end;
      gap: 15px;
      height: 150px;
      padding: 10px 0;
    }
    .bar-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 5px;
    }
    .bar {
      width: 100%;
      border-radius: 8px 8px 0 0;
      min-height: 10px;
    }
    .bar-label {
      font-size: 8pt;
      color: #64748b;
      text-align: center;
    }
    .bar-value {
      font-size: 9pt;
      font-weight: bold;
      color: #334155;
    }
    
    /* Pie Chart Legend */
    .pie-legend {
      display: flex;
      flex-wrap: wrap;
      gap: 15px;
      margin-top: 15px;
    }
    .pie-legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 10pt;
    }
    .pie-legend-color {
      width: 14px;
      height: 14px;
      border-radius: 4px;
    }
  </style>
</head>
<body>

  <!-- Cover Header -->
  <div class="cover-header">
    <div class="logo">FOAM</div>
    <h1>Fathers On A Mission</h1>
    <h2>Annual Outcomes, Program Analysis & Strategic Direction</h2>
    <div class="period">📅 Reporting Period: ${periodLabel}</div>
  </div>

  <!-- Section 1: Annual Outcomes Summary -->
  <div class="section">
    <div class="section-title">
      <span class="section-number">1</span>
      Annual Outcomes Summary
    </div>
    
    <table class="outcomes-table">
      <thead>
        <tr>
          <th style="width: 30%;">Outcome Area</th>
          <th style="width: 15%; text-align: center;">Annual Results</th>
          <th style="width: 55%;">Clarification / How to Interpret</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Unduplicated Fathers Served</strong></td>
          <td class="metric-value">${activeFathers} fathers</td>
          <td class="clarification">Total unique individuals served across the FOAM ecosystem. Each father counted once regardless of program participation or length of engagement.</td>
        </tr>
        <tr>
          <td><strong>Responsible Fatherhood Classes</strong></td>
          <td class="metric-value">${fatherhoodClassEnrollment} fathers</td>
          <td class="clarification">Participation in curriculum-based Responsible Fatherhood Classes. Subset of unduplicated fathers.</td>
        </tr>
        <tr>
          <td><strong>Project Family Build Engagement</strong></td>
          <td class="metric-value">~${avgMonthlyEngagement} active/mo</td>
          <td class="clarification">Monthly engagement in Project Family Build services. Measure of service continuity and intensity.</td>
        </tr>
        <tr>
          <td><strong>Workforce Development</strong></td>
          <td class="metric-value">${workforceParticipation} fathers</td>
          <td class="clarification">Fathers engaged in workforce development including readiness assessment, education planning, and employment preparation.</td>
        </tr>
        <tr>
          <td><strong>Job Placements</strong></td>
          <td class="metric-value">${jobPlacements} fathers</td>
          <td class="clarification">Fathers who successfully transitioned into paid employment during the reporting period.</td>
        </tr>
        <tr>
          <td><strong>Job Retention (30-90 days)</strong></td>
          <td class="metric-value">${jobRetention} fathers</td>
          <td class="clarification">Sustained employment and workforce stability beyond 30-90 days post-placement.</td>
        </tr>
        <tr>
          <td><strong>Stabilization Support</strong></td>
          <td class="metric-value">${stabilizationSupport} instances</td>
          <td class="clarification">Service events addressing transportation, basic needs, legal, and behavioral health barriers.</td>
        </tr>
        <tr>
          <td><strong>Mental & Behavioral Health</strong></td>
          <td class="metric-value">Embedded</td>
          <td class="clarification">Integrated behavioral health navigation to stabilize workforce participation and retention.</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Section 2: Annual Reach -->
  <div class="section">
    <div class="section-title">
      <span class="section-number">2</span>
      Annual Reach Across the FOAM Ecosystem
    </div>
    
    <div class="info-box">
      <p>During the reporting period, Fathers On A Mission served <strong>${activeFathers} unduplicated fathers</strong> across its service ecosystem. This represents <strong>unique individuals</strong>, each counted once regardless of services accessed.</p>
    </div>
    
    <table class="kpi-grid">
      <tr class="kpi-row">
        <td class="kpi-card blue">
          <div class="kpi-label">Total Fathers Served</div>
          <div class="kpi-value">${activeFathers}</div>
          <div class="kpi-sublabel">Unduplicated count</div>
        </td>
        <td class="kpi-card green">
          <div class="kpi-label">Class Participants</div>
          <div class="kpi-value">${fatherhoodClassEnrollment}</div>
          <div class="kpi-sublabel">Fatherhood Classes</div>
        </td>
        <td class="kpi-card amber">
          <div class="kpi-label">Avg Monthly Active</div>
          <div class="kpi-value">~${avgMonthlyEngagement}</div>
          <div class="kpi-sublabel">Project Family Build</div>
        </td>
        <td class="kpi-card purple">
          <div class="kpi-label">Workforce Engaged</div>
          <div class="kpi-value">${workforceParticipation}</div>
          <div class="kpi-sublabel">Development services</div>
        </td>
      </tr>
    </table>
  </div>

  <!-- Section 3: Program Structure -->
  <div class="section page-break">
    <div class="section-title">
      <span class="section-number">3</span>
      Program Structure Within the FOAM Ecosystem
    </div>
    
    <table class="program-diagram">
      <tr>
        <td class="program-box primary">
          <h3>📚 Responsible Fatherhood Classes</h3>
          <p>Structured, curriculum-based program focused on fatherhood identity, parenting skills, communication, co-parenting, and personal responsibility.</p>
          <ul>
            <li>14-module NPCL curriculum</li>
            <li>Relational and developmental focus</li>
            <li>Strengthening father-family bonds</li>
            <li><strong>${fatherhoodClassEnrollment} fathers participated</strong></li>
          </ul>
        </td>
        <td class="program-box secondary">
          <h3>🏗️ Project Family Build</h3>
          <p>Comprehensive case management providing workforce development, education support, stabilization services, and coordinated behavioral health navigation.</p>
          <ul>
            <li>Individualized case management</li>
            <li>Workforce development pipeline</li>
            <li>Barrier removal & stabilization</li>
            <li><strong>~${avgMonthlyEngagement} active fathers/month</strong></li>
          </ul>
        </td>
      </tr>
    </table>
    
    <div class="callout">
      <h4>💡 Key Distinction</h4>
      <p>Participation in Fatherhood Classes does not equate to enrollment in Project Family Build. These are <strong>distinct but complementary programs</strong> that fathers may access independently or simultaneously based on their individual needs and goals.</p>
    </div>
  </div>

  <!-- Section 4: Workforce Pipeline Chart -->
  <div class="section">
    <div class="section-title">
      <span class="section-number">4</span>
      Workforce Development Pipeline
    </div>
    
    <div class="chart-container">
      <div class="chart-title">📊 Workforce Progression Funnel</div>
      <div class="bar-chart">
        <div class="bar-item">
          <div class="bar-value">${workforceParticipation}</div>
          <div class="bar" style="height: 100%; background: linear-gradient(180deg, #0F2C5C, #1a365d);"></div>
          <div class="bar-label">Workforce<br/>Participation</div>
        </div>
        <div class="bar-item">
          <div class="bar-value">${jobPlacements}</div>
          <div class="bar" style="height: ${Math.round((jobPlacements / workforceParticipation) * 100)}%; background: linear-gradient(180deg, #10b981, #059669);"></div>
          <div class="bar-label">Job<br/>Placements</div>
        </div>
        <div class="bar-item">
          <div class="bar-value">${jobRetention}</div>
          <div class="bar" style="height: ${Math.round((jobRetention / workforceParticipation) * 100)}%; background: linear-gradient(180deg, #8b5cf6, #7c3aed);"></div>
          <div class="bar-label">Job<br/>Retention</div>
        </div>
      </div>
    </div>
    
    <!-- Progress Bars -->
    <div class="progress-item">
      <div class="progress-header">
        <span class="progress-label">Workforce Participation Rate</span>
        <span class="progress-value">${workforceParticipationRate}%</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill blue" style="width: ${workforceParticipationRate}%;"></div>
      </div>
    </div>
    
    <div class="progress-item">
      <div class="progress-header">
        <span class="progress-label">Job Placement Rate</span>
        <span class="progress-value">${jobPlacementRate}%</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill green" style="width: ${jobPlacementRate}%;"></div>
      </div>
    </div>
    
    <div class="progress-item">
      <div class="progress-header">
        <span class="progress-label">Job Retention Rate (30-90 days)</span>
        <span class="progress-value">${retentionRate}%</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill purple" style="width: ${retentionRate}%;"></div>
      </div>
    </div>
  </div>

  <!-- Section 5: Success Metrics -->
  <div class="section">
    <div class="section-title">
      <span class="section-number">5</span>
      Key Performance Indicators
    </div>
    
    <table class="metrics-grid">
      <tr>
        <td class="metric-circle-container">
          <div class="metric-circle" style="border: 6px solid ${workforceParticipationRate >= 50 ? '#10b981' : '#f59e0b'}; color: ${workforceParticipationRate >= 50 ? '#059669' : '#d97706'};">
            ${workforceParticipationRate}%
          </div>
          <div class="metric-label">Workforce<br/>Participation</div>
        </td>
        <td class="metric-circle-container">
          <div class="metric-circle" style="border: 6px solid ${jobPlacementRate >= 40 ? '#10b981' : '#f59e0b'}; color: ${jobPlacementRate >= 40 ? '#059669' : '#d97706'};">
            ${jobPlacementRate}%
          </div>
          <div class="metric-label">Job Placement<br/>Rate</div>
        </td>
        <td class="metric-circle-container">
          <div class="metric-circle" style="border: 6px solid ${retentionRate >= 70 ? '#10b981' : '#f59e0b'}; color: ${retentionRate >= 70 ? '#059669' : '#d97706'};">
            ${retentionRate}%
          </div>
          <div class="metric-label">Job Retention<br/>Rate</div>
        </td>
        <td class="metric-circle-container">
          <div class="metric-circle" style="border: 6px solid ${mentalHealthEngagement >= 40 ? '#10b981' : '#f59e0b'}; color: ${mentalHealthEngagement >= 40 ? '#059669' : '#d97706'};">
            ${mentalHealthEngagement}%
          </div>
          <div class="metric-label">Mental Health<br/>Engagement</div>
        </td>
      </tr>
    </table>
  </div>

  <!-- Section 6: Stabilization Support -->
  <div class="section page-break">
    <div class="section-title">
      <span class="section-number">6</span>
      Stabilization & Essential Needs Support
    </div>
    
    <div class="info-box green">
      <p>FOAM provided <strong>${stabilizationSupport} instances</strong> of stabilization support during the reporting period, addressing critical barriers that could derail workforce participation and family stability.</p>
    </div>
    
    <div class="chart-container">
      <div class="chart-title">📊 Support Distribution by Category</div>
      <div class="bar-chart">
        <div class="bar-item">
          <div class="bar-value">${Math.round(stabilizationSupport * 0.35)}</div>
          <div class="bar" style="height: 90%; background: linear-gradient(180deg, #0F2C5C, #1a365d);"></div>
          <div class="bar-label">Transportation</div>
        </div>
        <div class="bar-item">
          <div class="bar-value">${Math.round(stabilizationSupport * 0.25)}</div>
          <div class="bar" style="height: 65%; background: linear-gradient(180deg, #10b981, #059669);"></div>
          <div class="bar-label">Basic Needs</div>
        </div>
        <div class="bar-item">
          <div class="bar-value">${Math.round(stabilizationSupport * 0.20)}</div>
          <div class="bar" style="height: 52%; background: linear-gradient(180deg, #f59e0b, #d97706);"></div>
          <div class="bar-label">Legal Support</div>
        </div>
        <div class="bar-item">
          <div class="bar-value">${Math.round(stabilizationSupport * 0.20)}</div>
          <div class="bar" style="height: 52%; background: linear-gradient(180deg, #8b5cf6, #7c3aed);"></div>
          <div class="bar-label">Behavioral Health</div>
        </div>
      </div>
    </div>
  </div>

  <!-- Section 7: Service Flow -->
  <div class="section">
    <div class="section-title">
      <span class="section-number">7</span>
      Integrated Service Delivery Model
    </div>
    
    <div class="flow-container">
      <div class="flow-box intake">📋 Intake &<br/>Assessment</div>
      <span class="flow-arrow">→</span>
      <div class="flow-box assessment">🎯 Goal<br/>Setting</div>
      <span class="flow-arrow">→</span>
      <div class="flow-box services">🛠️ Service<br/>Delivery</div>
      <span class="flow-arrow">→</span>
      <div class="flow-box outcomes">📈 Outcome<br/>Tracking</div>
    </div>
    
    <table class="two-col">
      <tr>
        <td class="col">
          <h4>✅ System Strengths</h4>
          <ul>
            <li>Integrated case management approach</li>
            <li>Strong workforce development pipeline</li>
            <li>Embedded behavioral health navigation</li>
            <li>Comprehensive stabilization support</li>
            <li>Data-driven outcome tracking</li>
          </ul>
        </td>
        <td class="col">
          <h4>🎯 Strategic Priorities</h4>
          <ul>
            <li>Expand employer partnerships</li>
            <li>Enhance retention support services</li>
            <li>Strengthen referral networks</li>
            <li>Increase mental health resources</li>
            <li>Scale successful interventions</li>
          </ul>
        </td>
      </tr>
    </table>
  </div>

  <!-- Section 8: Staffing Structure -->
  <div class="section">
    <div class="section-title">
      <span class="section-number">8</span>
      Coordinated Staffing Structure
    </div>
    
    <table class="staffing-table">
      <thead>
        <tr>
          <th>Role</th>
          <th>Function</th>
          <th>Program Area</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Executive Director</strong></td>
          <td>Strategic oversight, funder relations, organizational leadership</td>
          <td><span class="role-badge primary">Leadership</span></td>
        </tr>
        <tr>
          <td><strong>Program Manager</strong></td>
          <td>Day-to-day operations, staff supervision, quality assurance</td>
          <td><span class="role-badge primary">Leadership</span></td>
        </tr>
        <tr>
          <td><strong>Case Managers</strong></td>
          <td>Direct service delivery, client engagement, outcome tracking</td>
          <td><span class="role-badge secondary">Service Delivery</span></td>
        </tr>
        <tr>
          <td><strong>Workforce Specialist</strong></td>
          <td>Employment preparation, job placement, employer relations</td>
          <td><span class="role-badge secondary">Service Delivery</span></td>
        </tr>
        <tr>
          <td><strong>Fatherhood Facilitator</strong></td>
          <td>Curriculum delivery, class facilitation, participant engagement</td>
          <td><span class="role-badge tertiary">Education</span></td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Footer -->
  <div class="footer">
    <div class="footer-logo">Fathers On A Mission</div>
    <div class="footer-tagline">"Enhance Fathers, Strengthen Families"</div>
    <div class="footer-info">
      Baton Rouge, Louisiana | Generated: ${generatedDate}
    </div>
  </div>

</body>
</html>`;

    return html;
  };

  // ============================================
  // EXPORT FUNCTIONS (WORD & PDF)
  // ============================================
  const downloadAsWord = (htmlContent: string, filename: string) => {
    const blob = new Blob([htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.doc`;
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
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  const handleDownloadReport = (format: 'word' | 'pdf') => {
    if (!generatedReport) return;
    
    const isInDepth = reportType === 'indepth';
    const htmlContent = isInDepth 
      ? generateInDepthWordDocument(generatedReport)
      : generateWordDocument(generatedReport);
    
    const periodLabel = generatedReport.metadata?.periodLabel || 'Report';
    const reportTypeName = isInDepth ? 'InDepth' : (generatedReport.metadata?.reportType || 'Monthly');
    const filename = `FOAM_${reportTypeName}_Report_${periodLabel.replace(/\s+/g, '_')}`;
    
    if (format === 'word') {
      downloadAsWord(htmlContent, filename);
    } else {
      downloadAsPDF(htmlContent);
    }
  };

  // ============================================
  // RENDER DATA TABLE - LIGHT THEME
  // ============================================
  const renderDataTable = (data: DataRow[], months: string[], editable: boolean = false) => (
    <div className="overflow-x-auto bg-white rounded-xl border border-gray-200 shadow-sm">
      <table className="w-full">
        <thead>
          <tr style={{ background: 'linear-gradient(135deg, #0F2C5C 0%, #1a365d 100%)' }}>
            <th className="sticky left-0 px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider min-w-[200px]" style={{ background: '#0F2C5C' }}>
              Category
            </th>
            {months.map((month, i) => (
              <th key={i} className="px-3 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider min-w-[80px]">
                {month}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.map((row, rowIndex) => (
            <tr key={row.id} className="hover:bg-blue-50 transition-colors">
              <td className="sticky left-0 bg-white px-4 py-3 text-sm font-medium text-gray-800 flex items-center gap-2 border-r border-gray-100">
                {getCategoryIcon(row.category)}
                {row.category}
              </td>
              {row.values.map((value, colIndex) => (
                <td 
                  key={colIndex}
                  className={`px-3 py-3 text-center text-sm ${
                    editable && colIndex !== months.length - 1 
                      ? 'cursor-pointer hover:bg-blue-100' 
                      : ''
                  } ${colIndex === months.length - 1 ? 'bg-blue-50 font-semibold text-blue-700' : 'text-gray-700'}`}
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
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveCell();
                          if (e.key === 'Escape') setEditingCell(null);
                        }}
                      />
                      <button
                        onClick={handleSaveCell}
                        disabled={isSaving}
                        className="p-1 bg-green-600 text-white rounded hover:bg-green-500"
                      >
                        <CheckCircle2 size={14} />
                      </button>
                      <button
                        onClick={() => setEditingCell(null)}
                        className="p-1 bg-gray-400 text-white rounded hover:bg-gray-500"
                      >
                        <X size={14} />
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
  );

  // ============================================
  // RENDER REPORTS TAB - LIGHT THEME
  // ============================================
  const renderReportsTab = () => (
    <div className="space-y-6">
      {/* Report Type Selection */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FileText size={20} className="text-blue-600" />
          Generate Funder Report
        </h3>
        
        {/* Year Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-600 mb-2">Data Source</label>
          <div className="flex gap-3">
            <button
              onClick={() => setSelectedYear('2026')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedYear === '2026'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
              }`}
            >
              2026 (Current)
            </button>
            <button
              onClick={() => setSelectedYear('2024-2025')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedYear === '2024-2025'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
              }`}
            >
              2024-2025 (Historical)
            </button>
          </div>
        </div>

        {/* Report Type */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-600 mb-2">Report Type</label>
          <div className="grid grid-cols-4 gap-3">
            <button
              onClick={() => setReportType('monthly')}
              className={`p-4 rounded-xl border-2 transition-all ${
                reportType === 'monthly'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <Calendar size={24} className={reportType === 'monthly' ? 'text-blue-600 mx-auto mb-2' : 'text-gray-400 mx-auto mb-2'} />
              <div className={`font-medium ${reportType === 'monthly' ? 'text-blue-600' : 'text-gray-700'}`}>Monthly</div>
            </button>
            <button
              onClick={() => setReportType('quarterly')}
              className={`p-4 rounded-xl border-2 transition-all ${
                reportType === 'quarterly'
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <BarChart3 size={24} className={reportType === 'quarterly' ? 'text-emerald-600 mx-auto mb-2' : 'text-gray-400 mx-auto mb-2'} />
              <div className={`font-medium ${reportType === 'quarterly' ? 'text-emerald-600' : 'text-gray-700'}`}>Quarterly</div>
            </button>
            <button
              onClick={() => setReportType('annual')}
              className={`p-4 rounded-xl border-2 transition-all ${
                reportType === 'annual'
                  ? 'border-amber-500 bg-amber-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <Target size={24} className={reportType === 'annual' ? 'text-amber-600 mx-auto mb-2' : 'text-gray-400 mx-auto mb-2'} />
              <div className={`font-medium ${reportType === 'annual' ? 'text-amber-600' : 'text-gray-700'}`}>Annual</div>
            </button>
            <button
              onClick={() => setReportType('indepth')}
              className={`p-4 rounded-xl border-2 transition-all ${
                reportType === 'indepth'
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <Sparkles size={24} className={reportType === 'indepth' ? 'text-purple-600 mx-auto mb-2' : 'text-gray-400 mx-auto mb-2'} />
              <div className={`font-medium ${reportType === 'indepth' ? 'text-purple-600' : 'text-gray-700'}`}>In-Depth</div>
              <div className="text-xs text-gray-500 mt-1">Comprehensive</div>
            </button>
          </div>
        </div>

        {/* Period Selection (for monthly/quarterly) */}
        {reportType === 'monthly' && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-600 mb-2">Select Month</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            >
              {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((month, i) => (
                <option key={i} value={i}>{month}</option>
              ))}
            </select>
          </div>
        )}

        {reportType === 'quarterly' && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-600 mb-2">Select Quarter</label>
            <div className="flex gap-3">
              {[1, 2, 3, 4].map((q) => (
                <button
                  key={q}
                  onClick={() => setSelectedQuarter(q)}
                  className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                    selectedQuarter === q
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                  }`}
                >
                  Q{q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* In-Depth Report Info */}
        {reportType === 'indepth' && (
          <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-xl">
            <div className="flex items-start gap-3">
              <Sparkles size={20} className="text-purple-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-purple-800 mb-1">Comprehensive In-Depth Report</h4>
                <p className="text-sm text-gray-600">
                  Generates a full annual outcomes report with 8 sections including program analysis, 
                  workforce pipeline charts, success metrics, stabilization support breakdown, 
                  service delivery model, and staffing structure.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => setShowPreview(true)}
            disabled={!previewData}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 border border-gray-300"
          >
            <Eye size={18} />
            Preview Data
          </button>
          <button
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className="flex items-center gap-2 px-6 py-2 text-white rounded-lg disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #0F2C5C 0%, #1a365d 100%)' }}
          >
            {isGenerating ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileDown size={18} />
                Generate Report
              </>
            )}
          </button>
        </div>
      </div>

      {/* Generated Report */}
      {generatedReport && (
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <CheckCircle2 size={20} className="text-green-600" />
              Report Generated Successfully
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => handleDownloadReport('word')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Download size={16} />
                Download Word
              </button>
              <button
                onClick={() => handleDownloadReport('pdf')}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                <Printer size={16} />
                Export PDF
              </button>
            </div>
          </div>

          {/* Report Preview */}
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Fathers On A Mission</h2>
              <p className="text-gray-600">
                {reportType === 'indepth' ? 'Comprehensive In-Depth Report' : `${generatedReport.metadata?.reportType?.charAt(0).toUpperCase() + generatedReport.metadata?.reportType?.slice(1)} Outcomes Report`}
              </p>
              <p className="text-blue-600 font-medium">{generatedReport.metadata?.periodLabel}</p>
            </div>

            {/* KPI Cards */}
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

            {/* Charts Preview */}
            {reportType === 'indepth' && (
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Program Distribution</h4>
                  <MiniPieChart data={[
                    { label: 'Fatherhood Classes', value: generatedReport.keyMetrics?.fatherhoodClassEnrollment || 70, color: '#0F2C5C' },
                    { label: 'Project Family Build', value: generatedReport.keyMetrics?.avgMonthlyEngagement || 60, color: '#10b981' },
                    { label: 'Workforce Dev', value: generatedReport.keyMetrics?.workforceParticipation || 77, color: '#8b5cf6' }
                  ]} />
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Workforce Pipeline</h4>
                  <MiniBarChart 
                    data={[
                      generatedReport.keyMetrics?.workforceParticipation || 77,
                      generatedReport.keyMetrics?.jobPlacements || 35,
                      generatedReport.keyMetrics?.jobRetention || 29
                    ]} 
                    labels={['Participation', 'Placed', 'Retained']}
                    color="#10b981"
                  />
                </div>
              </div>
            )}

            {/* Narrative Insights */}
            {generatedReport.narrativeInsights && generatedReport.narrativeInsights.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Key Insights</h4>
                <div className="space-y-2">
                  {generatedReport.narrativeInsights.slice(0, 3).map((insight: string, i: number) => (
                    <div key={i} className="bg-white rounded-lg p-3 text-sm text-gray-700 border-l-4 border-blue-600">
                      {insight}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && previewData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Data Preview</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X size={20} className="text-gray-500" />
              </button>
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

  // ============================================
  // MAIN RENDER - LIGHT THEME
  // ============================================
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - LIGHT THEME with FOAM Blue */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Case Manager Monthly Reports</h1>
              <p className="text-sm text-gray-500">Track, compare, and generate funder reports</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {caseManagerName && (
              <span className="text-sm text-gray-500">
                Logged in as: <span className="text-blue-600 font-medium">{caseManagerName}</span>
              </span>
            )}
            <button
              onClick={loadData}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors border border-gray-200"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Tabs - LIGHT THEME */}
      <div className="border-b border-gray-200 bg-white">
        <div className="flex px-6">
          {[
            { id: 'current', label: '2026 Data Entry', icon: Edit3 },
            { id: 'historical', label: '2024-2025 Historical', icon: History },
            { id: 'comparison', label: 'Year Comparison', icon: BarChart3 },
            { id: 'log', label: 'Change Log', icon: ClipboardList },
            { id: 'reports', label: 'Generate Reports', icon: FileText }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
            <AlertTriangle size={20} />
            {error}
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

      {/* Name Prompt Modal - LIGHT THEME */}
      {showNamePrompt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Enter Your Name</h3>
            <p className="text-sm text-gray-600 mb-4">
              Please enter your name to track changes in the change log.
            </p>
            <input
              type="text"
              placeholder="Your name"
              value={caseManagerName}
              onChange={(e) => setCaseManagerName(e.target.value)}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 mb-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowNamePrompt(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 border border-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (caseManagerName.trim()) {
                    setShowNamePrompt(false);
                  }
                }}
                disabled={!caseManagerName.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaseManagerPortal;
