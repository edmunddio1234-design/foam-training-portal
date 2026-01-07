import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft, Calendar, RefreshCw, Save, Clock, TrendingUp,
  TrendingDown, FileText, Users, Briefcase, Heart, DollarSign,
  CheckCircle2, Edit3, X, ChevronRight, BarChart3, History,
  ClipboardList, Target, AlertTriangle, Download, Eye, PieChart,
  Printer, FileDown, Sparkles, ArrowUpRight, ArrowDownRight
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
type ReportType = 'monthly' | 'quarterly' | 'annual';

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
          <span className="text-[10px] text-slate-400">{labels[i]}</span>
        </div>
      ))}
    </div>
  );
};

// Mini Pie Chart Component
const MiniPieChart: React.FC<{ data: { label: string; value: number; color: string }[] }> = ({ data }) => {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) return <div className="text-slate-400 text-sm">No data</div>;
  
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
            <span className="text-slate-600">{d.label}: {d.value}</span>
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
  const [selectedMonth, setSelectedMonth] = useState<number>(0);
  const [selectedQuarter, setSelectedQuarter] = useState<number>(1);
  const [showPreview, setShowPreview] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

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
    if (cat.includes('active') || cat.includes('enrolled')) return <Users size={16} className="text-blue-500" />;
    if (cat.includes('job') || cat.includes('employment') || cat.includes('workforce')) return <Briefcase size={16} className="text-emerald-500" />;
    if (cat.includes('mental') || cat.includes('relationship') || cat.includes('better father')) return <Heart size={16} className="text-pink-500" />;
    if (cat.includes('financial') || cat.includes('income')) return <DollarSign size={16} className="text-amber-500" />;
    if (cat.includes('education') || cat.includes('skill')) return <FileText size={16} className="text-purple-500" />;
    return <ClipboardList size={16} className="text-slate-400" />;
  };

  // Report Data Calculations
  const reportData = useMemo(() => {
    if (currentData.length === 0) return null;

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const getMonthData = (monthIndex: number) => {
      return currentData.map(row => ({
        category: row.category,
        value: typeof row.values[monthIndex] === 'number' ? row.values[monthIndex] as number : 0
      }));
    };

    const getQuarterData = (quarter: number) => {
      const startMonth = (quarter - 1) * 3;
      return currentData.map(row => {
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
      return currentData.map(row => {
        const total = row.values.slice(0, 12).reduce((sum: number, v) => sum + (typeof v === 'number' ? v : 0), 0);
        return {
          category: row.category,
          value: total,
          monthly: row.values.slice(0, 12).map(v => typeof v === 'number' ? v : 0)
        };
      });
    };

    return {
      months,
      getMonthData,
      getQuarterData,
      getYearData
    };
  }, [currentData]);

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
    
    // Simulate report generation (in production, this would call a backend endpoint)
    setTimeout(() => {
      setIsGenerating(false);
      alert('Report generation feature coming soon! This will create a professional Word document with charts and analysis.');
    }, 2000);
  };

  // Key metrics for preview
  const keyMetrics = useMemo(() => {
    if (!previewData) return [];
    
    const findValue = (keyword: string) => {
      const item = previewData.find(d => d.category.toLowerCase().includes(keyword));
      return item?.value || 0;
    };

    return [
      { label: 'Active Fathers', value: findValue('active fathers'), icon: Users, color: 'blue' },
      { label: 'Enrolled in Classes', value: findValue('enrolled') || findValue('fatherhood class'), icon: ClipboardList, color: 'emerald' },
      { label: 'Job Placements', value: findValue('placement') || findValue('placed'), icon: Briefcase, color: 'amber' },
      { label: 'Mental Health Referrals', value: findValue('mental health'), icon: Heart, color: 'pink' },
    ];
  }, [previewData]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="animate-spin mx-auto text-blue-600 mb-4" size={48} />
          <p className="text-slate-600 text-lg">Loading Case Manager Portal...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl max-w-md">
          <AlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Failed to Load</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <button onClick={loadData} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium">
            <RefreshCw size={18} className="inline mr-2" /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-6 shadow-xl">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-all">
                <ArrowLeft size={24} />
              </button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <ClipboardList size={28} />
                  Case Manager Monthly Reports
                </h1>
                <p className="text-slate-400">Track outcomes, enter data, and generate funder reports</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {caseManagerName && (
                <span className="bg-white/10 px-4 py-2 rounded-lg text-sm">
                  👤 {caseManagerName}
                </span>
              )}
              <button onClick={loadData} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl transition-all">
                <RefreshCw size={18} /> Refresh
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 flex-wrap">
            {[
              { id: 'current', label: '2026 Data Entry', icon: Edit3 },
              { id: 'historical', label: '2024-2025 Historical', icon: History },
              { id: 'comparison', label: 'Year Comparison', icon: BarChart3 },
              { id: 'log', label: 'Change Log', icon: Clock },
              { id: 'reports', label: 'Generate Reports', icon: FileDown },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all ${
                    isActive
                      ? 'bg-white text-slate-800 shadow-lg'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                  {tab.id === 'reports' && (
                    <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full">New</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Current Year (2026) - Editable */}
        {activeTab === 'current' && (
          <div className="space-y-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
              <Edit3 className="text-emerald-600" size={24} />
              <div>
                <p className="font-medium text-emerald-800">2026 Monthly Data Entry</p>
                <p className="text-sm text-emerald-600">Click any cell to edit. Changes are saved to Google Sheets automatically.</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-blue-600 text-white">
                      <th className="text-left p-3 font-medium sticky left-0 bg-blue-600 min-w-[280px]">Category</th>
                      {currentMonths.map((month, i) => (
                        <th key={i} className={`p-3 font-medium text-center min-w-[80px] ${i === currentMonths.length - 1 ? 'bg-blue-700' : ''}`}>
                          {month}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {currentData.map((row, rowIndex) => (
                      <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="p-3 sticky left-0 bg-white border-r border-slate-100">
                          <div className="flex items-center gap-2">
                            {getCategoryIcon(row.category)}
                            <span className="text-sm font-medium text-slate-700">{row.category}</span>
                          </div>
                        </td>
                        {row.values.map((val, colIndex) => (
                          <td
                            key={colIndex}
                            className={`p-2 text-center ${
                              colIndex === currentMonths.length - 1
                                ? 'bg-blue-50 font-bold text-blue-700'
                                : 'cursor-pointer hover:bg-blue-100 transition-all'
                            }`}
                            onClick={() => colIndex !== currentMonths.length - 1 && handleCellClick(rowIndex, colIndex, val)}
                          >
                            {editingCell?.row === rowIndex && editingCell?.col === colIndex ? (
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  className="w-16 px-2 py-1 border border-blue-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveCell();
                                    if (e.key === 'Escape') setEditingCell(null);
                                  }}
                                />
                                <button
                                  onClick={handleSaveCell}
                                  disabled={isSaving}
                                  className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                                >
                                  <CheckCircle2 size={16} />
                                </button>
                                <button
                                  onClick={() => setEditingCell(null)}
                                  className="p-1 bg-slate-300 text-slate-600 rounded hover:bg-slate-400"
                                >
                                  <X size={16} />
                                </button>
                              </div>
                            ) : (
                              <span className={val === 0 ? 'text-slate-300' : ''}>{val ?? '-'}</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Historical (2024-2025) - Read Only */}
        {activeTab === 'historical' && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
              <History className="text-blue-600" size={24} />
              <div>
                <p className="font-medium text-blue-800">2024-2025 Historical Data</p>
                <p className="text-sm text-blue-600">Reference only - this data cannot be edited.</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-700 text-white">
                      <th className="text-left p-3 font-medium sticky left-0 bg-slate-700 min-w-[280px]">Category</th>
                      {historicalMonths.map((month, i) => (
                        <th key={i} className={`p-3 font-medium text-center min-w-[80px] ${i === historicalMonths.length - 1 ? 'bg-slate-800' : ''}`}>
                          {month}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {historicalData.map((row) => (
                      <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="p-3 sticky left-0 bg-white border-r border-slate-100">
                          <div className="flex items-center gap-2">
                            {getCategoryIcon(row.category)}
                            <span className="text-sm font-medium text-slate-700">{row.category}</span>
                          </div>
                        </td>
                        {row.values.map((val, colIndex) => (
                          <td
                            key={colIndex}
                            className={`p-2 text-center ${
                              colIndex === historicalMonths.length - 1
                                ? 'bg-slate-100 font-bold text-slate-700'
                                : ''
                            }`}
                          >
                            <span className={val === null || val === 0 ? 'text-slate-300' : ''}>{val ?? '-'}</span>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Year-over-Year Comparison */}
        {activeTab === 'comparison' && (
          <div className="space-y-4">
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-center gap-3">
              <BarChart3 className="text-purple-600" size={24} />
              <div>
                <p className="font-medium text-purple-800">Year-over-Year Comparison</p>
                <p className="text-sm text-purple-600">Compare 2024-2025 totals against 2026 progress.</p>
              </div>
            </div>

            <div className="grid gap-4">
              {comparisonData.map((row) => (
                <div key={row.id} className="bg-white rounded-xl p-4 border border-slate-200 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getCategoryIcon(row.metric)}
                      <span className="font-medium text-slate-800">{row.metric}</span>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-xs text-slate-400">2024-2025</p>
                        <p className="text-lg font-bold text-slate-600">{row.historical}</p>
                      </div>
                      <ChevronRight className="text-slate-300" />
                      <div className="text-center">
                        <p className="text-xs text-slate-400">2026 YTD</p>
                        <p className="text-lg font-bold text-blue-600">{row.current}</p>
                      </div>
                      <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${
                        row.change > 0 ? 'bg-emerald-100 text-emerald-700' :
                        row.change < 0 ? 'bg-red-100 text-red-700' :
                        'bg-slate-100 text-slate-500'
                      }`}>
                        {row.change > 0 ? <TrendingUp size={16} /> : row.change < 0 ? <TrendingDown size={16} /> : null}
                        <span className="font-medium">
                          {row.change > 0 ? '+' : ''}{row.change}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Change Log */}
        {activeTab === 'log' && (
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
              <Clock className="text-amber-600" size={24} />
              <div>
                <p className="font-medium text-amber-800">Change Log</p>
                <p className="text-sm text-amber-600">Track all data entries and modifications.</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              {logData.length > 0 ? (
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-700 text-white">
                      <th className="p-3 text-left font-medium">Date</th>
                      <th className="p-3 text-left font-medium">Case Manager</th>
                      <th className="p-3 text-left font-medium">Month</th>
                      <th className="p-3 text-left font-medium">Year</th>
                      <th className="p-3 text-left font-medium">Category</th>
                      <th className="p-3 text-center font-medium">New Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logData.slice().reverse().map((entry) => (
                      <tr key={entry.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="p-3 text-sm">{entry.date}</td>
                        <td className="p-3 text-sm font-medium">{entry.caseManager}</td>
                        <td className="p-3 text-sm">{entry.month}</td>
                        <td className="p-3 text-sm">{entry.year}</td>
                        <td className="p-3 text-sm">{entry.category}</td>
                        <td className="p-3 text-sm text-center font-bold text-blue-600">{entry.newValue}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-12 text-center">
                  <Clock className="mx-auto text-slate-300 mb-4" size={48} />
                  <p className="text-slate-500">No changes logged yet</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Generate Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            {/* Report Type Selection */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <FileDown className="text-blue-600" size={24} />
                Generate Funder Report
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {[
                  { id: 'monthly', label: 'Monthly Report', desc: 'Single month data & analysis', icon: Calendar },
                  { id: 'quarterly', label: 'Quarterly Report', desc: '3-month period summary', icon: BarChart3 },
                  { id: 'annual', label: 'Annual Report', desc: 'Full year comprehensive', icon: FileText },
                ].map(type => {
                  const Icon = type.icon;
                  const isSelected = reportType === type.id;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setReportType(type.id as ReportType)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-slate-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-lg ${isSelected ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600'}`}>
                          <Icon size={20} />
                        </div>
                        <span className={`font-medium ${isSelected ? 'text-blue-700' : 'text-slate-700'}`}>{type.label}</span>
                      </div>
                      <p className="text-sm text-slate-500">{type.desc}</p>
                    </button>
                  );
                })}
              </div>

              {/* Period Selection */}
              <div className="flex flex-wrap gap-4 items-end">
                {reportType === 'monthly' && (
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Select Month</label>
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(Number(e.target.value))}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((month, i) => (
                        <option key={i} value={i}>{month} 2026</option>
                      ))}
                    </select>
                  </div>
                )}

                {reportType === 'quarterly' && (
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Select Quarter</label>
                    <select
                      value={selectedQuarter}
                      onChange={(e) => setSelectedQuarter(Number(e.target.value))}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={1}>Q1 (Jan - Mar) 2026</option>
                      <option value={2}>Q2 (Apr - Jun) 2026</option>
                      <option value={3}>Q3 (Jul - Sep) 2026</option>
                      <option value={4}>Q4 (Oct - Dec) 2026</option>
                    </select>
                  </div>
                )}

                {reportType === 'annual' && (
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Report Year</label>
                    <div className="px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-medium">
                      2026 Annual Report
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setShowPreview(true)}
                  className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium flex items-center gap-2 transition-all"
                >
                  <Eye size={18} /> Preview Data
                </button>

                <button
                  onClick={handleGenerateReport}
                  disabled={isGenerating}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" /> Generating...
                    </>
                  ) : (
                    <>
                      <Download size={18} /> Generate Report
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Data Preview */}
            {showPreview && previewData && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Eye className="text-blue-600" size={24} />
                    Report Preview
                  </h3>
                  <button onClick={() => setShowPreview(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                    <X size={20} className="text-slate-400" />
                  </button>
                </div>

                {/* Key Metrics Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {keyMetrics.map((metric, i) => {
                    const Icon = metric.icon;
                    return (
                      <div key={i} className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 border border-slate-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Icon size={16} className={`text-${metric.color}-500`} />
                          <span className="text-xs text-slate-500">{metric.label}</span>
                        </div>
                        <p className="text-2xl font-bold text-slate-800">{metric.value}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Charts Preview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-sm font-medium text-slate-700 mb-3">Program Engagement</h4>
                    <MiniPieChart data={[
                      { label: 'Fatherhood Classes', value: keyMetrics[1]?.value || 0, color: '#10b981' },
                      { label: 'Project Family Build', value: keyMetrics[0]?.value || 0, color: '#3b82f6' },
                      { label: 'Workforce Dev', value: keyMetrics[2]?.value || 0, color: '#f59e0b' },
                    ]} />
                  </div>
                  
                  {(reportType === 'quarterly' || reportType === 'annual') && (
                    <div className="bg-slate-50 rounded-xl p-4">
                      <h4 className="text-sm font-medium text-slate-700 mb-3">Monthly Trend</h4>
                      <MiniBarChart 
                        data={reportType === 'quarterly' 
                          ? [(previewData[0] as any)?.monthly?.[0] || 0, (previewData[0] as any)?.monthly?.[1] || 0, (previewData[0] as any)?.monthly?.[2] || 0]
                          : ((previewData[0] as any)?.monthly || []).slice(0, 6) as number[]
                        }
                        labels={reportType === 'quarterly' 
                          ? ['M1', 'M2', 'M3']
                          : ['J', 'F', 'M', 'A', 'M', 'J']
                        }
                        color="#3b82f6"
                      />
                    </div>
                  )}
                </div>

                {/* Data Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="text-left p-3 text-sm font-medium text-slate-600">Outcome Area</th>
                        <th className="text-right p-3 text-sm font-medium text-slate-600">
                          {reportType === 'monthly' ? 'Monthly Total' : reportType === 'quarterly' ? 'Quarter Total' : 'YTD Total'}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.slice(0, 15).map((row, i) => (
                        <tr key={i} className="border-b border-slate-100">
                          <td className="p-3 text-sm text-slate-700">{row.category}</td>
                          <td className="p-3 text-sm text-right font-medium text-slate-800">{row.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Report Features Info */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Sparkles className="text-amber-500" size={24} />
                Generated Report Includes
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { icon: FileText, title: 'Executive Summary', desc: 'High-level overview for funders' },
                  { icon: BarChart3, title: 'Visual Charts', desc: 'Bar charts, pie charts, trends' },
                  { icon: Target, title: 'Outcome Metrics', desc: 'Progress toward goals' },
                  { icon: Users, title: 'Program Breakdown', desc: 'Fatherhood Classes & PFB data' },
                  { icon: Briefcase, title: 'Workforce Analysis', desc: 'Job placements & retention' },
                  { icon: ClipboardList, title: 'Narrative Analysis', desc: 'AI-generated insights' },
                ].map((feature, i) => {
                  const Icon = feature.icon;
                  return (
                    <div key={i} className="flex items-start gap-3">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <Icon size={18} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{feature.title}</p>
                        <p className="text-sm text-slate-500">{feature.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Name Prompt Modal */}
      {showNamePrompt && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-xl font-bold text-slate-800 mb-2">Enter Your Name</h3>
            <p className="text-slate-600 text-sm mb-4">Your name will be logged with any changes you make.</p>
            <input
              type="text"
              value={caseManagerName}
              onChange={(e) => setCaseManagerName(e.target.value)}
              placeholder="Your name..."
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowNamePrompt(false)}
                className="flex-1 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200"
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
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50"
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
