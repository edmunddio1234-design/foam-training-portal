import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, Calendar, RefreshCw, Save, Clock, TrendingUp,
  TrendingDown, FileText, Users, Briefcase, Heart, DollarSign,
  CheckCircle2, Edit3, X, ChevronRight, BarChart3, History,
  ClipboardList, Target, AlertTriangle
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

type TabType = 'historical' | 'current' | 'comparison' | 'log';

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
    if (activeTab !== 'current') return; // Only edit current year
    if (colIndex === currentMonths.length - 1) return; // Don't edit YTD Total column
    
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
        // Update local state
        const newData = [...currentData];
        newData[editingCell.row].values[editingCell.col] = Number(editValue) || 0;
        setCurrentData(newData);
        setEditingCell(null);
        
        // Refresh to get updated totals
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
      <div className="bg-gradient-to-r from-indigo-700 to-purple-800 text-white p-6 shadow-xl">
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
                <p className="text-indigo-200">Track outcomes and submit monthly data</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {caseManagerName && (
                <span className="bg-white/10 px-4 py-2 rounded-lg text-sm">
                  👤 {caseManagerName}
                </span>
              )}
              <button onClick={loadData} className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all">
                <RefreshCw size={18} /> Refresh
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 flex-wrap">
            {[
              { id: 'current', label: '2026 Data Entry', icon: Edit3, color: 'emerald' },
              { id: 'historical', label: '2024-2025 Historical', icon: History, color: 'blue' },
              { id: 'comparison', label: 'Year Comparison', icon: BarChart3, color: 'purple' },
              { id: 'log', label: 'Change Log', icon: Clock, color: 'amber' },
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
                    <tr className="bg-emerald-600 text-white">
                      <th className="text-left p-3 font-medium sticky left-0 bg-emerald-600 min-w-[280px]">Category</th>
                      {currentMonths.map((month, i) => (
                        <th key={i} className={`p-3 font-medium text-center min-w-[80px] ${i === currentMonths.length - 1 ? 'bg-emerald-700' : ''}`}>
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
                                ? 'bg-emerald-50 font-bold text-emerald-700'
                                : 'cursor-pointer hover:bg-emerald-100 transition-all'
                            }`}
                            onClick={() => colIndex !== currentMonths.length - 1 && handleCellClick(rowIndex, colIndex, val)}
                          >
                            {editingCell?.row === rowIndex && editingCell?.col === colIndex ? (
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  className="w-16 px-2 py-1 border border-emerald-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveCell();
                                    if (e.key === 'Escape') setEditingCell(null);
                                  }}
                                />
                                <button
                                  onClick={handleSaveCell}
                                  disabled={isSaving}
                                  className="p-1 bg-emerald-500 text-white rounded hover:bg-emerald-600"
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
                    <tr className="bg-blue-600 text-white">
                      <th className="text-left p-3 font-medium sticky left-0 bg-blue-600 min-w-[280px]">Category</th>
                      {historicalMonths.map((month, i) => (
                        <th key={i} className={`p-3 font-medium text-center min-w-[80px] ${i === historicalMonths.length - 1 ? 'bg-blue-700' : ''}`}>
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
                                ? 'bg-blue-50 font-bold text-blue-700'
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
                        <p className="text-lg font-bold text-blue-600">{row.historical}</p>
                      </div>
                      <ChevronRight className="text-slate-300" />
                      <div className="text-center">
                        <p className="text-xs text-slate-400">2026 YTD</p>
                        <p className="text-lg font-bold text-emerald-600">{row.current}</p>
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
                    <tr className="bg-amber-500 text-white">
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
                        <td className="p-3 text-sm text-center font-bold text-emerald-600">{entry.newValue}</td>
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
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
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
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50"
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
