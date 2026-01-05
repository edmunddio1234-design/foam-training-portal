// ============================================
// FOAM GRANT DASHBOARD - COMPLETE VERSION
// ============================================
// Place this file in: src/components/GrantDashboard.tsx (or .jsx)
// 
// Required dependencies (install if not present):
// npm install recharts lucide-react
// ============================================

import React, { useState, useEffect } from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, AreaChart, Area
} from 'recharts';
import {
  Plus, TrendingUp, DollarSign, FileText, Clock, CheckCircle,
  XCircle, AlertTriangle, Calendar, Mail, User, Target,
  ChevronDown, ChevronUp, Download, RefreshCw, Search,
  Edit2, Trash2, Save, X, Building2, Filter
} from 'lucide-react';

// ============================================
// CONFIGURATION
// ============================================
const API_BASE_URL = 'https://foamla-backend-2.onrender.com';

// ============================================
// TYPES
// ============================================
interface Grant {
  id: number;
  Grant_name: string;
  Grant_source: string;
  Purpose: string;
  Contact_person: string;
  Contact_email: string;
  Application_deadline: string;
  Submission_date: string;
  Amount_requested: number;
  Amount_approved: number;
  Date_decision_made: string;
  Grant_cycle: string;
  Grant_reporting_scheduled: string;
  Grant_Awarded: string;
}

interface Summary {
  totalGrants: number;
  awarded: number;
  pending: number;
  denied: number;
  totalRequested: number;
  totalApproved: number;
}

// ============================================
// MAIN COMPONENT
// ============================================
const GrantDashboard: React.FC = () => {
  // State
  const [grants, setGrants] = useState<Grant[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingGrant, setEditingGrant] = useState<Grant | null>(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedGrant, setExpandedGrant] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  // New grant form state
  const [newGrant, setNewGrant] = useState({
    Grant_name: '',
    Grant_source: '',
    Purpose: '',
    Contact_person: '',
    Contact_email: '',
    Application_deadline: '',
    Submission_date: '',
    Amount_requested: '',
    Amount_approved: '',
    Date_decision_made: '',
    Grant_cycle: 'FY2025',
    Grant_reporting_scheduled: '',
    Grant_Awarded: 'Pending'
  });

  // ============================================
  // DATA FETCHING
  // ============================================
  const fetchGrants = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/grants`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setGrants(data.grants || []);
      setSummary(data.summary || null);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load grants');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrants();
  }, []);

  // ============================================
  // CRUD OPERATIONS
  // ============================================
  const handleAddGrant = async () => {
    setSaving(true);
    
    try {
      const grantToAdd = {
        ...newGrant,
        Amount_requested: parseFloat(newGrant.Amount_requested) || 0,
        Amount_approved: parseFloat(newGrant.Amount_approved) || 0,
      };

      const response = await fetch(`${API_BASE_URL}/api/grants/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(grantToAdd)
      });

      if (!response.ok) {
        throw new Error('Failed to add grant');
      }

      // Reset form and refresh data
      setNewGrant({
        Grant_name: '',
        Grant_source: '',
        Purpose: '',
        Contact_person: '',
        Contact_email: '',
        Application_deadline: '',
        Submission_date: '',
        Amount_requested: '',
        Amount_approved: '',
        Date_decision_made: '',
        Grant_cycle: 'FY2025',
        Grant_reporting_scheduled: '',
        Grant_Awarded: 'Pending'
      });
      setShowAddForm(false);
      fetchGrants();
    } catch (err) {
      console.error('Add error:', err);
      alert('Failed to add grant. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateGrant = async () => {
    if (!editingGrant) return;
    
    setSaving(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/grants/update/${editingGrant.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingGrant)
      });

      if (!response.ok) {
        throw new Error('Failed to update grant');
      }

      setEditingGrant(null);
      fetchGrants();
    } catch (err) {
      console.error('Update error:', err);
      alert('Failed to update grant. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGrant = async (grant: Grant) => {
    if (!confirm(`Are you sure you want to delete "${grant.Grant_name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/grants/delete/${grant.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete grant');
      }

      fetchGrants();
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete grant. Please try again.');
    }
  };

  // ============================================
  // COMPUTED DATA
  // ============================================
  const stats = summary || {
    totalGrants: grants.length,
    awarded: grants.filter(g => g.Grant_Awarded === 'Yes' || g.Grant_Awarded === 'Awarded').length,
    pending: grants.filter(g => g.Grant_Awarded === 'Pending').length,
    denied: grants.filter(g => g.Grant_Awarded === 'Denied' || g.Grant_Awarded === 'No').length,
    totalRequested: grants.reduce((sum, g) => sum + (g.Amount_requested || 0), 0),
    totalApproved: grants.reduce((sum, g) => sum + (g.Amount_approved || 0), 0),
  };

  const notSubmitted = grants.filter(g => 
    g.Grant_Awarded === 'Not Submitted' || !g.Submission_date
  ).length;

  const successRate = stats.awarded / 
    (stats.awarded + stats.denied) * 100 || 0;

  // Status distribution for pie chart
  const statusData = [
    { name: 'Awarded', value: stats.awarded, color: '#10B981' },
    { name: 'Pending', value: stats.pending, color: '#F59E0B' },
    { name: 'Denied', value: stats.denied, color: '#EF4444' },
    { name: 'Not Submitted', value: notSubmitted, color: '#6B7280' },
  ].filter(d => d.value > 0);

  // Funding by source for bar chart
  const fundingBySource = grants.reduce((acc, grant) => {
    const source = grant.Grant_source || 'Unknown';
    if (!acc[source]) {
      acc[source] = { name: source, requested: 0, approved: 0, count: 0 };
    }
    acc[source].requested += grant.Amount_requested || 0;
    acc[source].approved += grant.Amount_approved || 0;
    acc[source].count += 1;
    return acc;
  }, {} as Record<string, { name: string; requested: number; approved: number; count: number }>);

  const fundingData = Object.values(fundingBySource)
    .sort((a, b) => b.requested - a.requested)
    .slice(0, 15);

  // Monthly funding trend (by submission date)
  const monthlyTrend = grants.reduce((acc, grant) => {
    if (grant.Submission_date) {
      const date = new Date(grant.Submission_date);
      const month = date.toLocaleString('default', { month: 'short', year: '2-digit' });
      if (!acc[month]) {
        acc[month] = { month, requested: 0, approved: 0 };
      }
      acc[month].requested += grant.Amount_requested || 0;
      acc[month].approved += grant.Amount_approved || 0;
    }
    return acc;
  }, {} as Record<string, { month: string; requested: number; approved: number }>);

  const trendData = Object.values(monthlyTrend).slice(-6);

  // Upcoming deadlines
  const upcomingDeadlines = grants
    .filter(g => {
      if (!g.Application_deadline) return false;
      const deadline = new Date(g.Application_deadline);
      return deadline > new Date() && 
             (g.Grant_Awarded === 'Pending' || g.Grant_Awarded === 'Not Submitted' || !g.Submission_date);
    })
    .sort((a, b) => new Date(a.Application_deadline).getTime() - new Date(b.Application_deadline).getTime())
    .slice(0, 5);

  // Filtered grants
  const filteredGrants = grants.filter(g => {
    // Status filter
    if (activeFilter !== 'all') {
      if (activeFilter === 'awarded' && g.Grant_Awarded !== 'Yes' && g.Grant_Awarded !== 'Awarded') return false;
      if (activeFilter === 'pending' && g.Grant_Awarded !== 'Pending') return false;
      if (activeFilter === 'denied' && g.Grant_Awarded !== 'Denied' && g.Grant_Awarded !== 'No') return false;
    }
    
    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        g.Grant_name?.toLowerCase().includes(search) ||
        g.Grant_source?.toLowerCase().includes(search) ||
        g.Purpose?.toLowerCase().includes(search)
      );
    }
    
    return true;
  });

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Yes':
      case 'Awarded':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'Pending':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'Denied':
      case 'No':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'Yes':
      case 'Awarded':
        return <CheckCircle className="w-4 h-4" />;
      case 'Pending':
        return <Clock className="w-4 h-4" />;
      case 'Denied':
      case 'No':
        return <XCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getDaysUntil = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    return Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  // ============================================
  // LOADING STATE
  // ============================================
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
          <p className="text-slate-400">Loading grant data from Google Sheets...</p>
        </div>
      </div>
    );
  }

  // ============================================
  // ERROR STATE
  // ============================================
  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-8 max-w-md text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Failed to Load Data</h2>
          <p className="text-slate-400 mb-4">{error}</p>
          <button
            onClick={fetchGrants}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black rounded-lg font-medium transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ============================================
  // MAIN RENDER
  // ============================================
  return (
    <div className="min-h-screen bg-white text-slate-800 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
            Grant Management Dashboard
          </h1>
          <p className="text-slate-400 mt-1">
            Real-time data from Google Sheets • {grants.length} grants loaded
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchGrants}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-300 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 rounded-lg font-medium transition-all shadow-lg shadow-orange-500/25"
          >
            <Plus className="w-4 h-4" />
            Add Grant
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl p-6 border border-slate-200 backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Grants</p>
              <p className="text-3xl font-bold mt-1">{stats.totalGrants}</p>
              <p className="text-emerald-400 text-sm mt-2 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> {stats.awarded} Awarded
              </p>
            </div>
            <div className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <FileText className="w-7 h-7 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl p-6 border border-slate-200 backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Requested</p>
              <p className="text-3xl font-bold mt-1">{formatCurrency(stats.totalRequested)}</p>
              <p className="text-slate-500 text-sm mt-2">Across all applications</p>
            </div>
            <div className="w-14 h-14 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <Target className="w-7 h-7 text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl p-6 border border-slate-200 backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Approved</p>
              <p className="text-3xl font-bold text-emerald-400 mt-1">{formatCurrency(stats.totalApproved)}</p>
              <p className="text-emerald-400/70 text-sm mt-2 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> 
                {stats.totalRequested > 0 ? ((stats.totalApproved / stats.totalRequested) * 100).toFixed(0) : 0}% of requested
              </p>
            </div>
            <div className="w-14 h-14 bg-emerald-500/20 rounded-xl flex items-center justify-center">
              <DollarSign className="w-7 h-7 text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl p-6 border border-slate-200 backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Success Rate</p>
              <p className="text-3xl font-bold text-amber-400 mt-1">{successRate.toFixed(0)}%</p>
              <p className="text-amber-400/70 text-sm mt-2 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> {stats.pending} Pending
              </p>
            </div>
            <div className="w-14 h-14 bg-amber-500/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-7 h-7 text-amber-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Status Distribution Pie Chart */}
        <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl p-6 border border-slate-200">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
            Status Distribution
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 justify-center mt-2">
            {statusData.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: item.color }}></div>
                <span className="text-sm text-slate-400">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Funding by Source Bar Chart */}
        <div className="lg:col-span-2 bg-gradient-to-br from-white to-slate-50 rounded-2xl p-6 border border-slate-200">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            Funding by Source
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={fundingData} layout="vertical" barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
              <XAxis 
                type="number" 
                tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} 
                stroke="#64748b" 
              />
              <YAxis 
                type="category" 
                dataKey="name" 
                width={120} 
                stroke="#64748b" 
                tick={{ fontSize: 11 }} 
              />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
              />
              <Legend />
              <Bar dataKey="approved" fill="#10B981" radius={[0, 4, 4, 0]} name="Approved" />
              <Bar dataKey="requested" fill="#3B82F6" radius={[0, 4, 4, 0]} name="Requested" opacity={0.4} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Upcoming Deadlines */}
        <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl p-6 border border-slate-200">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-red-400" />
            Upcoming Deadlines
          </h3>
          <div className="space-y-3">
            {upcomingDeadlines.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-8">No upcoming deadlines</p>
            ) : (
              upcomingDeadlines.map((grant, i) => {
                const daysUntil = getDaysUntil(grant.Application_deadline);
                const isUrgent = daysUntil <= 14;
                
                return (
                  <div 
                    key={i} 
                    className={`p-4 rounded-xl border ${
                      isUrgent 
                        ? 'bg-red-500/10 border-red-500/30' 
                        : 'bg-slate-100/50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-sm">{grant.Grant_name}</p>
                        <p className="text-xs text-slate-400">{grant.Grant_source}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        isUrgent ? 'bg-red-500/20 text-red-400' : 'bg-slate-700 text-slate-300'
                      }`}>
                        {daysUntil} days
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                      <Calendar className="w-3 h-3" />
                      {new Date(grant.Application_deadline).toLocaleDateString('en-US', { 
                        month: 'short', day: 'numeric', year: 'numeric' 
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Funding Trend Area Chart */}
        <div className="lg:col-span-2 bg-gradient-to-br from-white to-slate-50 rounded-2xl p-6 border border-slate-200">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            Funding Trend by Submission Date
          </h3>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorApproved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorRequested" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} stroke="#64748b" />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                />
                <Legend />
                <Area type="monotone" dataKey="approved" stroke="#10B981" fill="url(#colorApproved)" name="Approved" />
                <Area type="monotone" dataKey="requested" stroke="#3B82F6" fill="url(#colorRequested)" name="Requested" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-slate-500">
              No submission data available for trend analysis
            </div>
          )}
        </div>
      </div>

      {/* Grants Table */}
      <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl p-6 border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            All Grants ({filteredGrants.length})
          </h3>
          
          <div className="flex flex-wrap gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search grants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-slate-100 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-amber-500 w-48"
              />
            </div>
            
            {/* Filters */}
            <div className="flex gap-2">
              {['all', 'awarded', 'pending', 'denied'].map(filter => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-3 py-2 text-sm rounded-lg capitalize transition-all ${
                    activeFilter === filter
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-slate-100 text-slate-400 hover:bg-slate-200 border border-transparent'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Grants List */}
        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
          {filteredGrants.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              No grants found matching your criteria
            </div>
          ) : (
            filteredGrants.map((grant) => (
              <div
                key={grant.id}
                className="bg-slate-100/50 rounded-xl border border-slate-200 overflow-hidden hover:border-slate-600 transition-all"
              >
                {/* Main Row */}
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => setExpandedGrant(expandedGrant === grant.id ? null : grant.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg border ${getStatusColor(grant.Grant_Awarded)}`}>
                        {getStatusIcon(grant.Grant_Awarded)}
                      </div>
                      <div>
                        <p className="font-medium">{grant.Grant_name}</p>
                        <p className="text-sm text-slate-400">{grant.Grant_source}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold text-emerald-400">
                          {formatCurrency(grant.Amount_approved || 0)}
                        </p>
                        <p className="text-xs text-slate-500">
                          of {formatCurrency(grant.Amount_requested)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingGrant(grant);
                          }}
                          className="p-2 hover:bg-slate-200 rounded-lg transition-all"
                        >
                          <Edit2 className="w-4 h-4 text-slate-400" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteGrant(grant);
                          }}
                          className="p-2 hover:bg-red-500/20 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                        {expandedGrant === grant.id 
                          ? <ChevronUp className="w-4 h-4 text-slate-400" />
                          : <ChevronDown className="w-4 h-4 text-slate-400" />
                        }
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedGrant === grant.id && (
                  <div className="px-4 pb-4 pt-2 border-t border-slate-200 bg-slate-100">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Target className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{grant.Purpose || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <User className="w-4 h-4 flex-shrink-0" />
                        <span>{grant.Contact_person || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <Mail className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{grant.Contact_email || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <Calendar className="w-4 h-4 flex-shrink-0" />
                        <span>Deadline: {grant.Application_deadline || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <Clock className="w-4 h-4 flex-shrink-0" />
                        <span>Submitted: {grant.Submission_date || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <Building2 className="w-4 h-4 flex-shrink-0" />
                        <span>Cycle: {grant.Grant_cycle || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <FileText className="w-4 h-4 flex-shrink-0" />
                        <span>Report Due: {grant.Grant_reporting_scheduled || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <CheckCircle className="w-4 h-4 flex-shrink-0" />
                        <span>Decision: {grant.Date_decision_made || 'Pending'}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Grant Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-300 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-300 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Plus className="w-5 h-5 text-amber-500" />
                  Add New Grant
                </h2>
                <p className="text-slate-400 text-sm mt-1">
                  This will be saved directly to your Google Sheet
                </p>
              </div>
              <button
                onClick={() => setShowAddForm(false)}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Grant Name *</label>
                  <input
                    type="text"
                    value={newGrant.Grant_name}
                    onChange={(e) => setNewGrant({...newGrant, Grant_name: e.target.value})}
                    className="w-full bg-slate-100 border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:border-amber-500"
                    placeholder="e.g., LCTF Family Support Grant"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Grant Source *</label>
                  <input
                    type="text"
                    value={newGrant.Grant_source}
                    onChange={(e) => setNewGrant({...newGrant, Grant_source: e.target.value})}
                    className="w-full bg-slate-100 border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:border-amber-500"
                    placeholder="e.g., Louisiana Children's Trust Fund"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Purpose</label>
                <input
                  type="text"
                  value={newGrant.Purpose}
                  onChange={(e) => setNewGrant({...newGrant, Purpose: e.target.value})}
                  className="w-full bg-slate-100 border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:border-amber-500"
                  placeholder="e.g., Fatherhood mentorship and family support services"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={newGrant.Contact_person}
                    onChange={(e) => setNewGrant({...newGrant, Contact_person: e.target.value})}
                    className="w-full bg-slate-100 border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:border-amber-500"
                    placeholder="e.g., John Smith"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={newGrant.Contact_email}
                    onChange={(e) => setNewGrant({...newGrant, Contact_email: e.target.value})}
                    className="w-full bg-slate-100 border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:border-amber-500"
                    placeholder="e.g., jsmith@foundation.org"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Amount Requested ($) *</label>
                  <input
                    type="number"
                    value={newGrant.Amount_requested}
                    onChange={(e) => setNewGrant({...newGrant, Amount_requested: e.target.value})}
                    className="w-full bg-slate-100 border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:border-amber-500"
                    placeholder="e.g., 50000"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Amount Approved ($)</label>
                  <input
                    type="number"
                    value={newGrant.Amount_approved}
                    onChange={(e) => setNewGrant({...newGrant, Amount_approved: e.target.value})}
                    className="w-full bg-slate-100 border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:border-amber-500"
                    placeholder="Leave blank if pending"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Application Deadline</label>
                  <input
                    type="date"
                    value={newGrant.Application_deadline}
                    onChange={(e) => setNewGrant({...newGrant, Application_deadline: e.target.value})}
                    className="w-full bg-slate-100 border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Submission Date</label>
                  <input
                    type="date"
                    value={newGrant.Submission_date}
                    onChange={(e) => setNewGrant({...newGrant, Submission_date: e.target.value})}
                    className="w-full bg-slate-100 border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Grant Cycle</label>
                  <input
                    type="text"
                    value={newGrant.Grant_cycle}
                    onChange={(e) => setNewGrant({...newGrant, Grant_cycle: e.target.value})}
                    className="w-full bg-slate-100 border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:border-amber-500"
                    placeholder="e.g., FY2025"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Report Due Date</label>
                  <input
                    type="date"
                    value={newGrant.Grant_reporting_scheduled}
                    onChange={(e) => setNewGrant({...newGrant, Grant_reporting_scheduled: e.target.value})}
                    className="w-full bg-slate-100 border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Status</label>
                  <select
                    value={newGrant.Grant_Awarded}
                    onChange={(e) => setNewGrant({...newGrant, Grant_Awarded: e.target.value})}
                    className="w-full bg-slate-100 border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Yes">Awarded</option>
                    <option value="Denied">Denied</option>
                    <option value="Not Submitted">Not Submitted</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-300 flex gap-3 justify-end">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-200 rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleAddGrant}
                disabled={!newGrant.Grant_name || !newGrant.Grant_source || saving}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving...' : 'Add Grant'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Grant Modal */}
      {editingGrant && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-300 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-300 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Edit2 className="w-5 h-5 text-blue-500" />
                  Edit Grant
                </h2>
                <p className="text-slate-400 text-sm mt-1">
                  Changes will update your Google Sheet
                </p>
              </div>
              <button
                onClick={() => setEditingGrant(null)}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Grant Name</label>
                  <input
                    type="text"
                    value={editingGrant.Grant_name}
                    onChange={(e) => setEditingGrant({...editingGrant, Grant_name: e.target.value})}
                    className="w-full bg-slate-100 border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Grant Source</label>
                  <input
                    type="text"
                    value={editingGrant.Grant_source}
                    onChange={(e) => setEditingGrant({...editingGrant, Grant_source: e.target.value})}
                    className="w-full bg-slate-100 border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Amount Requested ($)</label>
                  <input
                    type="number"
                    value={editingGrant.Amount_requested}
                    onChange={(e) => setEditingGrant({...editingGrant, Amount_requested: parseFloat(e.target.value) || 0})}
                    className="w-full bg-slate-100 border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Amount Approved ($)</label>
                  <input
                    type="number"
                    value={editingGrant.Amount_approved}
                    onChange={(e) => setEditingGrant({...editingGrant, Amount_approved: parseFloat(e.target.value) || 0})}
                    className="w-full bg-slate-100 border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Status</label>
                <select
                  value={editingGrant.Grant_Awarded}
                  onChange={(e) => setEditingGrant({...editingGrant, Grant_Awarded: e.target.value})}
                  className="w-full bg-slate-100 border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                >
                  <option value="Pending">Pending</option>
                  <option value="Yes">Awarded</option>
                  <option value="Denied">Denied</option>
                  <option value="Not Submitted">Not Submitted</option>
                </select>
              </div>
            </div>

            <div className="p-6 border-t border-slate-300 flex gap-3 justify-end">
              <button
                onClick={() => setEditingGrant(null)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-200 rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateGrant}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Scrollbar Styles */}
      <style>{`
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default GrantDashboard;
