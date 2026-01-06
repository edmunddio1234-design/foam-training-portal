import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft, FileText, DollarSign, Calendar, Search, RefreshCw,
  AlertTriangle, CheckCircle2, Clock, TrendingUp, X, XCircle,
  PieChart, Building2, ChevronRight, ExternalLink, Bell,
  FolderOpen, File, BarChart3, Target, Lightbulb, ArrowUpRight,
  ArrowDownRight, Activity, Zap
} from 'lucide-react';

const API_BASE_URL = 'https://foamla-backend-2.onrender.com';

interface Grant {
  id: number;
  grantname: string;
  grantsource: string;
  purpose: string;
  contactperson: string;
  contactemail: string;
  applicationdeadline: string;
  submissiondate: string;
  amountrequested: string;
  amountapproved: string;
  grantstatus: string;
  fundertype: string;
  submissionyear: string;
  grantreportingschedule?: string;
  [key: string]: any;
}

interface ActionItem {
  id: number;
  priority: string;
  action: string;
  deadline: string;
  status: string;
}

interface Document {
  id: string;
  name: string;
  type: string;
  modified: string;
  url: string;
  isFolder: boolean;
}

interface GrantStats {
  total: number;
  totalRequested: number;
  totalApproved: number;
  statusCounts: Record<string, number>;
  funderTypes: Record<string, number>;
  byYear: Record<string, number>;
  upcomingDeadlines: any[];
  actionItems: ActionItem[];
}

interface AdminPortalProps {
  onClose: () => void;
}

type MainTab = 'grants' | 'documents';
type GrantTab = 'dashboard' | 'all' | 'approved' | 'pending' | 'denied';

// Pie Chart Component
const PieChartVisual: React.FC<{ data: Record<string, number>; colors: string[] }> = ({ data, colors }) => {
  const total = Object.values(data).reduce((a, b) => a + b, 0);
  if (total === 0) return <div className="text-slate-400 text-center py-8">No data</div>;
  
  let cumulativePercent = 0;
  const entries = Object.entries(data).filter(([_, v]) => v > 0);
  
  const getCoordinatesForPercent = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  return (
    <div className="flex items-center gap-6">
      <svg viewBox="-1 -1 2 2" className="w-32 h-32 transform -rotate-90">
        {entries.map(([key, value], i) => {
          const percent = value / total;
          const [startX, startY] = getCoordinatesForPercent(cumulativePercent);
          cumulativePercent += percent;
          const [endX, endY] = getCoordinatesForPercent(cumulativePercent);
          const largeArcFlag = percent > 0.5 ? 1 : 0;
          const pathData = `M ${startX} ${startY} A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY} L 0 0`;
          return <path key={key} d={pathData} fill={colors[i % colors.length]} />;
        })}
      </svg>
      <div className="space-y-1">
        {entries.map(([key, value], i) => (
          <div key={key} className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[i % colors.length] }}></div>
            <span className="text-slate-600">{key}</span>
            <span className="font-bold text-slate-800">{value}</span>
            <span className="text-slate-400">({Math.round((value / total) * 100)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Bar Chart Component
const BarChartVisual: React.FC<{ data: Record<string, number>; color: string }> = ({ data, color }) => {
  const entries = Object.entries(data).sort((a, b) => a[0].localeCompare(b[0]));
  const max = Math.max(...Object.values(data), 1);
  
  return (
    <div className="space-y-2">
      {entries.map(([key, value]) => (
        <div key={key} className="flex items-center gap-3">
          <span className="text-xs text-slate-500 w-16 shrink-0">{key}</span>
          <div className="flex-1 bg-slate-100 rounded-full h-6 overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
              style={{ width: `${(value / max) * 100}%`, backgroundColor: color }}
            >
              <span className="text-xs font-bold text-white">{value}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Progress Ring Component
const ProgressRing: React.FC<{ percent: number; size?: number; color: string }> = ({ percent, size = 80, color }) => {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={radius} stroke="#e2e8f0" strokeWidth={strokeWidth} fill="none" />
        <circle 
          cx={size/2} cy={size/2} r={radius} 
          stroke={color} strokeWidth={strokeWidth} fill="none"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold" style={{ color }}>{percent}%</span>
      </div>
    </div>
  );
};

const AdminPortal: React.FC<AdminPortalProps> = ({ onClose }) => {
  const [mainTab, setMainTab] = useState<MainTab>('grants');
  const [grantTab, setGrantTab] = useState<GrantTab>('dashboard');
  const [grants, setGrants] = useState<Grant[]>([]);
  const [stats, setStats] = useState<GrantStats | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrant, setSelectedGrant] = useState<Grant | null>(null);

  useEffect(() => {
    loadGrantData();
  }, []);

  const loadGrantData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [grantsRes, statsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/grants`),
        fetch(`${API_BASE_URL}/api/grants/stats`)
      ]);
      const grantsData = await grantsRes.json();
      const statsData = await statsRes.json();
      console.log('Grants:', grantsData);
      console.log('Stats:', statsData);
      if (grantsData.success) setGrants(grantsData.data || []);
      if (statsData.success) setStats(statsData.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadDocuments = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/documents`);
      const data = await res.json();
      if (data.success) setDocuments(data.data || []);
    } catch (err) {
      console.error('Error loading documents:', err);
    }
  };

  const formatCurrency = (value: any) => {
    if (!value) return '$0';
    const num = typeof value === 'string' ? parseFloat(value.replace(/[$,]/g, '')) : value;
    if (isNaN(num)) return '$0';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num);
  };

  const getStatusColor = (status: string) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('approved') || s.includes('awarded')) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (s.includes('pending') || s.includes('submitted')) return 'bg-amber-100 text-amber-700 border-amber-200';
    if (s.includes('denied') || s.includes('rejected')) return 'bg-red-100 text-red-700 border-red-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  // Computed values
  const approvedGrants = useMemo(() => grants.filter(g => 
    g.grantstatus?.toLowerCase().includes('approved') || g.grantstatus?.toLowerCase().includes('awarded')
  ), [grants]);
  
  const pendingGrants = useMemo(() => grants.filter(g => 
    g.grantstatus?.toLowerCase().includes('pending') || g.grantstatus?.toLowerCase().includes('submitted') || g.grantstatus?.toLowerCase().includes('to submit')
  ), [grants]);
  
  const deniedGrants = useMemo(() => grants.filter(g => 
    g.grantstatus?.toLowerCase().includes('denied')
  ), [grants]);

  // Grants needing reporting attention (approved grants)
  const grantsNeedingAttention = useMemo(() => 
    approvedGrants.filter(g => g.amountapproved && parseFloat(g.amountapproved.toString().replace(/[$,]/g, '')) > 0)
  , [approvedGrants]);

  // Recent grants (last 30 days based on submission date)
  const recentGrants = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return grants.filter(g => {
      if (!g.submissiondate) return false;
      const subDate = new Date(g.submissiondate);
      return subDate >= thirtyDaysAgo;
    });
  }, [grants]);

  // AI Analysis
  const analysis = useMemo(() => {
    if (!stats || grants.length === 0) return null;
    
    const successRate = stats.totalRequested > 0 ? Math.round((stats.totalApproved / stats.totalRequested) * 100) : 0;
    const avgRequestAmount = grants.length > 0 
      ? grants.reduce((sum, g) => sum + (parseFloat(g.amountrequested?.toString().replace(/[$,]/g, '') || '0') || 0), 0) / grants.length 
      : 0;
    
    const topFunder = Object.entries(stats.funderTypes || {}).sort((a, b) => b[1] - a[1])[0];
    
    return {
      successRate,
      avgRequestAmount,
      topFunder: topFunder ? topFunder[0] : 'N/A',
      pendingValue: pendingGrants.reduce((sum, g) => sum + (parseFloat(g.amountrequested?.toString().replace(/[$,]/g, '') || '0') || 0), 0),
      insights: [
        successRate > 15 ? `Strong ${successRate}% success rate - above nonprofit average` : `${successRate}% success rate - room for improvement`,
        topFunder ? `${topFunder[0]} is your top funding source with ${topFunder[1]} grants` : '',
        pendingGrants.length > 0 ? `${pendingGrants.length} grants pending worth potential funding` : 'No pending grants',
        recentGrants.length > 0 ? `${recentGrants.length} grants submitted in the last 30 days` : 'Consider submitting more applications'
      ].filter(Boolean)
    };
  }, [stats, grants, pendingGrants, recentGrants]);

  const getFilteredGrants = () => {
    let filtered = grants;
    if (grantTab === 'approved') filtered = approvedGrants;
    else if (grantTab === 'pending') filtered = pendingGrants;
    else if (grantTab === 'denied') filtered = deniedGrants;
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(g => 
        g.grantname?.toLowerCase().includes(query) ||
        g.grantsource?.toLowerCase().includes(query)
      );
    }
    return filtered;
  };

  const filteredGrants = getFilteredGrants();

  const pieColors = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4'];
  const funderColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <RefreshCw className="animate-spin mx-auto text-blue-600 mb-4" size={48} />
            <div className="absolute inset-0 blur-xl bg-blue-400/30 rounded-full"></div>
          </div>
          <p className="text-slate-600 text-lg font-medium">Loading Command Center...</p>
          <p className="text-slate-400 text-sm">Connecting to live data</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl max-w-md border border-slate-200">
          <XCircle className="mx-auto text-red-500 mb-4" size={48} />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Connection Failed</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <button onClick={loadGrantData} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium flex items-center gap-2 mx-auto transition-all">
            <RefreshCw size={18} /> Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 via-slate-800 to-slate-900 text-white p-6 shadow-xl">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-all">
                <ArrowLeft size={24} />
              </button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Zap className="text-amber-400" size={24} />
                  Admin Command Center
                </h1>
                <p className="text-slate-400">Real-time Grant Analytics & Document Library</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                <Activity size={14} /> Live
              </div>
              <button onClick={loadGrantData} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl transition-all font-medium">
                <RefreshCw size={18} /> Refresh
              </button>
            </div>
          </div>

          {/* Main Tabs */}
          <div className="flex gap-3">
            <button
              onClick={() => setMainTab('grants')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                mainTab === 'grants' 
                  ? 'bg-white text-slate-800 shadow-lg' 
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <DollarSign size={20} /> Grant Management
            </button>
            <button
              onClick={() => { setMainTab('documents'); if (documents.length === 0) loadDocuments(); }}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                mainTab === 'documents' 
                  ? 'bg-white text-slate-800 shadow-lg' 
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <FolderOpen size={20} /> Document Library
            </button>
          </div>
        </div>
      </div>

      {/* GRANT MANAGEMENT */}
      {mainTab === 'grants' && (
        <div className="max-w-7xl mx-auto p-6">
          {/* Grant Sub-Tabs */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3, count: null, color: 'blue' },
              { id: 'all', label: 'All Grants', icon: FileText, count: grants.length, color: 'slate' },
              { id: 'approved', label: 'Approved', icon: CheckCircle2, count: approvedGrants.length, color: 'emerald' },
              { id: 'pending', label: 'Pending', icon: Clock, count: pendingGrants.length, color: 'amber' },
              { id: 'denied', label: 'Denied', icon: XCircle, count: deniedGrants.length, color: 'red' },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = grantTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setGrantTab(tab.id as GrantTab)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm ${
                    isActive
                      ? `bg-${tab.color}-600 text-white shadow-lg shadow-${tab.color}-200`
                      : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300 hover:shadow-md'
                  }`}
                  style={isActive ? { backgroundColor: tab.color === 'emerald' ? '#10b981' : tab.color === 'amber' ? '#f59e0b' : tab.color === 'red' ? '#ef4444' : '#3b82f6' } : {}}
                >
                  <Icon size={18} />
                  {tab.label}
                  {tab.count !== null && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${isActive ? 'bg-white/20' : 'bg-slate-100'}`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* DASHBOARD VIEW */}
          {grantTab === 'dashboard' && stats && (
            <div className="space-y-6">
              {/* Top Stats Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-500 text-sm font-medium">Total Grants</p>
                      <p className="text-3xl font-bold text-slate-800 mt-1">{stats.total}</p>
                      <p className="text-xs text-slate-400 mt-1">In database</p>
                    </div>
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                      <FileText className="text-white" size={24} />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-500 text-sm font-medium">Total Requested</p>
                      <p className="text-3xl font-bold text-slate-800 mt-1">{formatCurrency(stats.totalRequested)}</p>
                      <p className="text-xs text-blue-500 mt-1 flex items-center gap-1">
                        <ArrowUpRight size={12} /> Lifetime value
                      </p>
                    </div>
                    <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-200">
                      <DollarSign className="text-white" size={24} />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-500 text-sm font-medium">Total Approved</p>
                      <p className="text-3xl font-bold text-emerald-600 mt-1">{formatCurrency(stats.totalApproved)}</p>
                      <p className="text-xs text-emerald-500 mt-1 flex items-center gap-1">
                        <CheckCircle2 size={12} /> Secured funding
                      </p>
                    </div>
                    <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
                      <CheckCircle2 className="text-white" size={24} />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-500 text-sm font-medium">Success Rate</p>
                      <p className="text-3xl font-bold text-purple-600 mt-1">{analysis?.successRate || 0}%</p>
                      <p className="text-xs text-purple-500 mt-1">Approval ratio</p>
                    </div>
                    <ProgressRing percent={analysis?.successRate || 0} size={56} color="#9333ea" />
                  </div>
                </div>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Status Pie Chart */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <PieChart size={20} className="text-blue-600" />
                    Grant Status Distribution
                  </h3>
                  <PieChartVisual data={stats.statusCounts || {}} colors={pieColors} />
                </div>

                {/* Funder Types */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Building2 size={20} className="text-blue-600" />
                    Grants by Funder Type
                  </h3>
                  <BarChartVisual data={stats.funderTypes || {}} color="#3b82f6" />
                </div>
              </div>

              {/* AI Insights & Action Items */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* AI Analysis */}
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Lightbulb size={20} className="text-amber-300" />
                    AI Grant Analysis
                  </h3>
                  <div className="space-y-3">
                    {analysis?.insights.map((insight, i) => (
                      <div key={i} className="flex items-start gap-3 bg-white/10 rounded-xl p-3">
                        <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-xs font-bold">{i + 1}</span>
                        </div>
                        <p className="text-sm text-blue-100">{insight}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/20">
                    <p className="text-xs text-blue-200">
                      💡 Recommendation: Focus on {analysis?.topFunder} opportunities for higher success rates
                    </p>
                  </div>
                </div>

                {/* Action Items */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <AlertTriangle size={20} className="text-amber-500" />
                    Action Items
                    {stats.actionItems?.length > 0 && (
                      <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs font-bold">
                        {stats.actionItems.length}
                      </span>
                    )}
                  </h3>
                  {stats.actionItems && stats.actionItems.length > 0 ? (
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {stats.actionItems.map((item) => (
                        <div key={item.id} className={`p-4 rounded-xl border-l-4 ${
                          item.priority === 'HIGH' ? 'bg-red-50 border-red-500' :
                          item.priority === 'MEDIUM' ? 'bg-amber-50 border-amber-500' :
                          'bg-blue-50 border-blue-500'
                        }`}>
                          <div className="flex items-start justify-between">
                            <div>
                              <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold mb-2 ${
                                item.priority === 'HIGH' ? 'bg-red-100 text-red-700' :
                                item.priority === 'MEDIUM' ? 'bg-amber-100 text-amber-700' :
                                'bg-blue-100 text-blue-700'
                              }`}>{item.priority}</span>
                              <p className="text-sm font-medium text-slate-800">{item.action}</p>
                              <p className="text-xs text-slate-500 mt-1">Due: {item.deadline}</p>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                              item.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                            }`}>{item.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 text-center py-8">No action items</p>
                  )}
                </div>
              </div>

              {/* Grants Needing Reporting Attention */}
              {grantsNeedingAttention.length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Bell size={20} className="text-orange-500" />
                    Approved Grants - Reporting & Compliance
                    <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full text-xs font-bold">
                      {grantsNeedingAttention.length}
                    </span>
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Grant</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Funder</th>
                          <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">Approved Amount</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {grantsNeedingAttention.slice(0, 10).map((grant) => (
                          <tr key={grant.id} className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer" onClick={() => setSelectedGrant(grant)}>
                            <td className="py-3 px-4">
                              <p className="font-medium text-slate-800 truncate max-w-xs">{grant.grantname}</p>
                            </td>
                            <td className="py-3 px-4 text-sm text-slate-600">{grant.grantsource}</td>
                            <td className="py-3 px-4 text-right font-bold text-emerald-600">{formatCurrency(grant.amountapproved)}</td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                                {grant.grantstatus}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Grants by Year */}
              {stats.byYear && Object.keys(stats.byYear).length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Calendar size={20} className="text-blue-600" />
                    Grants by Submission Year
                  </h3>
                  <BarChartVisual data={stats.byYear} color="#10b981" />
                </div>
              )}
            </div>
          )}

          {/* GRANTS LIST VIEW */}
          {grantTab !== 'dashboard' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search grants..."
                    className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <p className="text-slate-500 font-medium">Showing {filteredGrants.length} grants</p>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {filteredGrants.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {filteredGrants.map((grant) => (
                      <div key={grant.id} className="p-4 hover:bg-slate-50 cursor-pointer transition-all" onClick={() => setSelectedGrant(grant)}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold text-slate-800 truncate">{grant.grantname || 'Unnamed'}</h3>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium border shrink-0 ${getStatusColor(grant.grantstatus)}`}>
                                {grant.grantstatus || 'Unknown'}
                              </span>
                            </div>
                            <p className="text-sm text-slate-600">{grant.grantsource}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="font-bold text-slate-800">{formatCurrency(grant.amountrequested)}</p>
                            {grant.amountapproved && parseFloat(grant.amountapproved.toString().replace(/[$,]/g, '')) > 0 && (
                              <p className="text-sm text-emerald-600 font-medium">{formatCurrency(grant.amountapproved)} approved</p>
                            )}
                          </div>
                          <ChevronRight className="text-slate-300" size={20} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="mx-auto text-slate-300 mb-4" size={48} />
                    <p className="text-slate-500">No grants found</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* DOCUMENT LIBRARY */}
      {mainTab === 'documents' && (
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-800">Document Library</h2>
            <button onClick={loadDocuments} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl hover:shadow-md transition-all">
              <RefreshCw size={16} /> Refresh
            </button>
          </div>

          {documents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map((doc) => (
                <a key={doc.id} href={doc.url} target="_blank" rel="noopener noreferrer"
                  className="bg-white rounded-2xl p-4 border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all group">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-all">
                      {doc.isFolder ? <FolderOpen className="text-amber-500" size={24} /> : <File className="text-blue-500" size={24} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800 truncate group-hover:text-blue-600">{doc.name}</p>
                      <p className="text-xs text-slate-400 mt-1">{doc.modified ? new Date(doc.modified).toLocaleDateString() : ''}</p>
                    </div>
                    <ExternalLink className="text-slate-300 group-hover:text-blue-500" size={16} />
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
              <FolderOpen className="mx-auto text-slate-300 mb-4" size={48} />
              <p className="text-slate-500 font-medium">No documents found</p>
              <p className="text-slate-400 text-sm mt-2">Connect Google Drive to see files</p>
            </div>
          )}
        </div>
      )}

      {/* Grant Detail Modal */}
      {selectedGrant && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedGrant(null)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-t-2xl text-white relative">
              <button onClick={() => setSelectedGrant(null)} className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full">
                <X size={20} />
              </button>
              <h2 className="text-xl font-bold pr-10">{selectedGrant.grantname}</h2>
              <p className="text-blue-100">{selectedGrant.grantsource}</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-4"><p className="text-sm text-slate-500">Requested</p><p className="text-xl font-bold">{formatCurrency(selectedGrant.amountrequested)}</p></div>
                <div className="bg-emerald-50 rounded-xl p-4"><p className="text-sm text-emerald-600">Approved</p><p className="text-xl font-bold text-emerald-700">{formatCurrency(selectedGrant.amountapproved)}</p></div>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-sm text-slate-500 mb-2">Status</p>
                <span className={`px-3 py-1.5 rounded-full text-sm font-medium border ${getStatusColor(selectedGrant.grantstatus)}`}>{selectedGrant.grantstatus || 'Unknown'}</span>
              </div>
              {selectedGrant.purpose && <div className="bg-slate-50 rounded-xl p-4"><p className="text-sm text-slate-500 mb-1">Purpose</p><p className="text-slate-800">{selectedGrant.purpose}</p></div>}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-4"><p className="text-sm text-slate-500">Deadline</p><p className="font-medium">{selectedGrant.applicationdeadline || 'N/A'}</p></div>
                <div className="bg-slate-50 rounded-xl p-4"><p className="text-sm text-slate-500">Submitted</p><p className="font-medium">{selectedGrant.submissiondate || 'N/A'}</p></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-4"><p className="text-sm text-slate-500">Contact</p><p>{selectedGrant.contactperson || 'N/A'}</p></div>
                <div className="bg-slate-50 rounded-xl p-4"><p className="text-sm text-slate-500">Email</p><p className="truncate">{selectedGrant.contactemail || 'N/A'}</p></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPortal;
