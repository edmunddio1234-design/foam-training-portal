// ============================================
// FOAM GRANT DASHBOARD - COMPLETE VERSION
// ============================================
// Matches FOAM Command color scheme (navy blue/white)
// Shows Top 15 sources sorted by requested amount
// FIXED: Column names match Google Sheet
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

const API_BASE_URL = 'https://foamla-backend-2.onrender.com';

interface Grant {
  _rowIndex: number;
  Grant_name: string;
  Grant_source: string;
  Purpose: string;
  Contact_person: string;
  Contact_email: string;
  Application_deadline: string;
  Submission_date: string;
  Amount_requested: string | number;
  Amount_approved: string | number;
  Date_decision_made: string;
  Grant_cycle: string;
  Grant_reporting_schedule: string;
  Grant_status: string;  // This is the actual column name in your sheet
  Notification: string;
  Submission_year: string;
  Funder_Type: string;
}

interface Summary {
  totalGrants: number;
  awarded: number;
  pending: number;
  denied: number;
  totalRequested: number;
  totalApproved: number;
}

// Helper function to parse currency strings like "$200,000" to numbers
const parseCurrency = (value: string | number | undefined): number => {
  if (value === undefined || value === null || value === '') return 0;
  if (typeof value === 'number') return value;
  // Remove $, commas, and any whitespace, then parse
  const cleaned = value.toString().replace(/[$,\s]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

// Helper to get status - checks both Grant_status and Grant_Awarded for compatibility
const getGrantStatus = (grant: any): string => {
  return grant.Grant_status || grant.Grant_Awarded || 'Unknown';
};

const GrantDashboard: React.FC = () => {
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

  const [newGrant, setNewGrant] = useState({
    Grant_name: '', Grant_source: '', Purpose: '', Contact_person: '',
    Contact_email: '', Application_deadline: '', Submission_date: '',
    Amount_requested: '', Amount_approved: '', Date_decision_made: '',
    Grant_cycle: 'FY2025', Grant_reporting_schedule: '', Grant_status: 'Pending'
  });

  const fetchGrants = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/grants`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      console.log('Grants data:', data);
      // Debug: Log all deadlines to see what formats exist
      console.log('All deadlines:', data.grants?.map((g: any) => ({
        name: g.Grant_name,
        deadline: g.Application_deadline,
        status: g.Grant_status
      })).filter((g: any) => g.deadline));
      setGrants(data.grants || []);
      setSummary(data.summary || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load grants');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGrants(); }, []);

  const handleAddGrant = async () => {
    setSaving(true);
    try {
      const grantToAdd = { ...newGrant,
        Amount_requested: parseFloat(newGrant.Amount_requested) || 0,
        Amount_approved: parseFloat(newGrant.Amount_approved) || 0,
      };
      const response = await fetch(`${API_BASE_URL}/api/grants`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(grantToAdd)
      });
      if (!response.ok) throw new Error('Failed to add grant');
      setNewGrant({ Grant_name: '', Grant_source: '', Purpose: '', Contact_person: '',
        Contact_email: '', Application_deadline: '', Submission_date: '',
        Amount_requested: '', Amount_approved: '', Date_decision_made: '',
        Grant_cycle: 'FY2025', Grant_reporting_schedule: '', Grant_status: 'Pending' });
      setShowAddForm(false);
      fetchGrants();
    } catch (err) {
      alert('Failed to add grant. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateGrant = async () => {
    if (!editingGrant) return;
    setSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/grants/${editingGrant._rowIndex}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingGrant)
      });
      if (!response.ok) throw new Error('Failed to update grant');
      setEditingGrant(null);
      fetchGrants();
    } catch (err) {
      alert('Failed to update grant. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGrant = async (grant: Grant) => {
    if (!confirm(`Are you sure you want to delete "${grant.Grant_name}"?`)) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/grants/${grant._rowIndex}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete grant');
      fetchGrants();
    } catch (err) {
      alert('Failed to delete grant. Please try again.');
    }
  };

  // Calculate stats with proper currency parsing
  const stats = summary || {
    totalGrants: grants.length,
    awarded: grants.filter(g => {
      const status = getGrantStatus(g);
      return status === 'Awarded' || status === 'Approved' || status === 'Yes';
    }).length,
    pending: grants.filter(g => {
      const status = getGrantStatus(g);
      return status === 'Pending' || status === '';
    }).length,
    denied: grants.filter(g => {
      const status = getGrantStatus(g);
      return status === 'Denied' || status === 'No' || status === 'Rejected';
    }).length,
    totalRequested: grants.reduce((sum, g) => sum + parseCurrency(g.Amount_requested), 0),
    totalApproved: grants.reduce((sum, g) => sum + parseCurrency(g.Amount_approved), 0),
  };

  const notSubmitted = grants.filter(g => {
    const status = getGrantStatus(g);
    return status === 'Not Submitted' || status === '' || !g.Submission_date;
  }).length;
  
  const successRate = (stats.awarded + stats.denied) > 0 
    ? (stats.awarded / (stats.awarded + stats.denied) * 100) 
    : 0;

  const statusData = [
    { name: 'Awarded', value: stats.awarded, color: '#10B981' },
    { name: 'Pending', value: stats.pending, color: '#F59E0B' },
    { name: 'Denied', value: stats.denied, color: '#EF4444' },
    { name: 'Not Submitted', value: notSubmitted, color: '#6B7280' },
  ].filter(d => d.value > 0);

  // Calculate funding by source with proper currency parsing
  const fundingBySource = grants.reduce((acc, grant) => {
    const source = grant.Grant_source || 'Unknown';
    if (!acc[source]) acc[source] = { name: source, requested: 0, approved: 0, count: 0 };
    acc[source].requested += parseCurrency(grant.Amount_requested);
    acc[source].approved += parseCurrency(grant.Amount_approved);
    acc[source].count += 1;
    return acc;
  }, {} as Record<string, { name: string; requested: number; approved: number; count: number }>);

  // TOP 15, SORTED BY REQUESTED
  const fundingData = Object.values(fundingBySource).sort((a, b) => b.requested - a.requested).slice(0, 15);

  const upcomingDeadlines = grants
    .filter(g => {
      // Check if deadline exists
      if (!g.Application_deadline) return false;
      
      const deadlineStr = String(g.Application_deadline).trim();
      
      // Skip invalid values
      if (!deadlineStr || deadlineStr === 'N/A' || deadlineStr === 'TBD' || 
          deadlineStr === 'Rolling' || deadlineStr === 'Ongoing' || 
          deadlineStr === 'null' || deadlineStr === 'undefined') return false;
      
      // Parse the deadline
      const deadline = new Date(deadlineStr);
      
      // Check if valid date
      if (isNaN(deadline.getTime())) return false;
      
      // Check if deadline is in the future
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (deadline <= today) return false;
      
      // Get status and check if grant needs attention
      const status = getGrantStatus(g);
      const needsAttention = 
        !status || 
        status === '' || 
        status === 'Pending' || 
        status === 'Not Submitted' ||
        status === 'In Progress' ||
        status === 'Draft' ||
        status === 'Unknown' ||
        !g.Submission_date;
      
      return needsAttention;
    })
    .sort((a, b) => new Date(a.Application_deadline).getTime() - new Date(b.Application_deadline).getTime())
    .slice(0, 5);

  const filteredGrants = grants.filter(g => {
    const status = getGrantStatus(g);
    if (activeFilter !== 'all') {
      if (activeFilter === 'awarded' && status !== 'Awarded' && status !== 'Approved' && status !== 'Yes') return false;
      if (activeFilter === 'pending' && status !== 'Pending' && status !== '') return false;
      if (activeFilter === 'denied' && status !== 'Denied' && status !== 'No' && status !== 'Rejected') return false;
    }
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return g.Grant_name?.toLowerCase().includes(search) || g.Grant_source?.toLowerCase().includes(search) || g.Purpose?.toLowerCase().includes(search);
    }
    return true;
  });

  const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Yes': case 'Awarded': case 'Approved': return 'bg-emerald-100 text-emerald-700 border-emerald-300';
      case 'Pending': case '': return 'bg-amber-100 text-amber-700 border-amber-300';
      case 'Denied': case 'No': case 'Rejected': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'Yes': case 'Awarded': case 'Approved': return <CheckCircle className="w-4 h-4" />;
      case 'Pending': case '': return <Clock className="w-4 h-4" />;
      case 'Denied': case 'No': case 'Rejected': return <XCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getDaysUntil = (dateStr: string) => {
    if (!dateStr) return 999;
    const date = new Date(dateStr);
    return Math.ceil((date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-slate-600 font-bold">Loading grant data...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="bg-white border border-red-200 rounded-2xl p-8 max-w-md text-center shadow-lg">
        <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-black text-slate-800 mb-2">Failed to Load Data</h2>
        <p className="text-slate-500 mb-4">{error}</p>
        <button onClick={fetchGrants} className="px-6 py-3 bg-[#0F2C5C] hover:bg-slate-800 text-white rounded-xl font-bold">Try Again</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Grant Management Dashboard</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Real-time data from Google Sheets • {grants.length} grants loaded</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchGrants} className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-widest">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button onClick={() => setShowAddForm(true)} className="flex items-center gap-2 px-4 py-2 bg-[#0F2C5C] hover:bg-slate-800 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg">
            <Plus className="w-4 h-4" /> Add Grant
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center"><FileText className="w-6 h-6 text-indigo-600" /></div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Grants</p>
              <p className="text-2xl font-black text-slate-800">{stats.totalGrants}</p>
              <p className="text-[9px] font-bold text-emerald-500">{stats.awarded} Awarded</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center"><Target className="w-6 h-6 text-amber-600" /></div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Requested</p>
              <p className="text-2xl font-black text-slate-800">{formatCurrency(stats.totalRequested)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center"><DollarSign className="w-6 h-6 text-emerald-600" /></div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Approved</p>
              <p className="text-2xl font-black text-emerald-600">{formatCurrency(stats.totalApproved)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center"><TrendingUp className="w-6 h-6 text-rose-600" /></div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Success Rate</p>
              <p className="text-2xl font-black text-slate-800">{successRate.toFixed(0)}%</p>
              <p className="text-[9px] font-bold text-amber-500">{stats.pending} Pending</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-slate-100">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Status Distribution</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart><Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
              {statusData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
            </Pie><Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} /></PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 justify-center mt-2">
            {statusData.map((item, i) => <div key={i} className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ background: item.color }}></div><span className="text-xs font-bold text-slate-600">{item.name}: {item.value}</span></div>)}
          </div>
        </div>
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Funding by Source (Top 15)</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={fundingData} layout="vertical" barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
              <XAxis type="number" tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} stroke="#94A3B8" tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="name" width={130} stroke="#94A3B8" tick={{ fontSize: 10 }} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ borderRadius: '12px', border: 'none' }} />
              <Legend />
              <Bar dataKey="approved" fill="#10B981" radius={[0, 4, 4, 0]} name="Approved" />
              <Bar dataKey="requested" fill="#4F46E5" radius={[0, 4, 4, 0]} name="Requested" opacity={0.4} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Deadlines & AI Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-slate-100">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-2"><Calendar className="w-4 h-4 text-rose-500" />Upcoming Deadlines</p>
          <div className="space-y-3">
            {upcomingDeadlines.length === 0 ? <p className="text-slate-400 text-sm text-center py-8">No upcoming deadlines</p> :
              upcomingDeadlines.map((grant, i) => {
                const daysUntil = getDaysUntil(grant.Application_deadline);
                const isUrgent = daysUntil <= 14;
                return (
                  <div key={i} className={`p-4 rounded-xl border ${isUrgent ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex items-start justify-between">
                      <div><p className="font-bold text-sm text-slate-800">{grant.Grant_name}</p><p className="text-xs text-slate-500">{grant.Grant_source}</p></div>
                      <span className={`text-xs font-black px-2 py-1 rounded-full ${isUrgent ? 'bg-rose-200 text-rose-700' : 'bg-slate-200 text-slate-600'}`}>{daysUntil}d</span>
                    </div>
                  </div>
                );
              })
            }
          </div>
        </div>
        <div className="lg:col-span-2 bg-[#0F2C5C] rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 opacity-10"><TrendingUp className="w-48 h-48" /></div>
          <div className="relative z-10">
            <p className="text-[9px] font-black text-indigo-300 uppercase tracking-[0.3em] mb-4">Grant AI Narrative</p>
            <p className="text-sm font-medium leading-relaxed opacity-90 italic">
              "You have {stats.totalGrants} grants in your pipeline with {formatCurrency(stats.totalRequested)} requested.
              {stats.pending > 0 && ` ${stats.pending} grants are pending decision.`}
              {upcomingDeadlines.length > 0 && ` Next deadline: ${upcomingDeadlines[0]?.Grant_name} in ${getDaysUntil(upcomingDeadlines[0]?.Application_deadline)} days.`}
              {successRate > 50 ? ' Your success rate is strong!' : ' Consider strengthening your application narratives.'}"
            </p>
            <div className="mt-4 flex items-center gap-2"><div className="w-2 h-2 bg-emerald-400 rounded-full"></div><span className="text-[9px] font-black uppercase tracking-widest">Strategy Engine Verified</span></div>
          </div>
        </div>
      </div>

      {/* Grants Table */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2"><FileText className="w-4 h-4 text-indigo-600" />All Grants ({filteredGrants.length})</p>
          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Search grants..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-indigo-500 w-48" />
            </div>
            <div className="flex gap-2">
              {['all', 'awarded', 'pending', 'denied'].map(filter => (
                <button key={filter} onClick={() => setActiveFilter(filter)}
                  className={`px-3 py-2 text-xs font-black uppercase tracking-widest rounded-xl capitalize ${activeFilter === filter ? 'bg-[#0F2C5C] text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>{filter}</button>
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {filteredGrants.length === 0 ? <div className="text-center py-12 text-slate-400">No grants found</div> :
            filteredGrants.map((grant, index) => {
              const status = getGrantStatus(grant);
              const requested = parseCurrency(grant.Amount_requested);
              const approved = parseCurrency(grant.Amount_approved);
              return (
                <div key={grant._rowIndex || index} className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden hover:border-slate-300">
                  <div className="p-4 cursor-pointer" onClick={() => setExpandedGrant(expandedGrant === (grant._rowIndex || index) ? null : (grant._rowIndex || index))}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg border ${getStatusColor(status)}`}>{getStatusIcon(status)}</div>
                        <div><p className="font-bold text-slate-800">{grant.Grant_name}</p><p className="text-sm text-slate-500">{grant.Grant_source}</p></div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-black text-emerald-600">{formatCurrency(approved)}</p>
                          <p className="text-xs text-slate-400">of {formatCurrency(requested)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={(e) => { e.stopPropagation(); setEditingGrant(grant); }} className="p-2 hover:bg-slate-200 rounded-lg"><Edit2 className="w-4 h-4 text-slate-400" /></button>
                          <button onClick={(e) => { e.stopPropagation(); handleDeleteGrant(grant); }} className="p-2 hover:bg-rose-100 rounded-lg"><Trash2 className="w-4 h-4 text-rose-400" /></button>
                          {expandedGrant === (grant._rowIndex || index) ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                        </div>
                      </div>
                    </div>
                  </div>
                  {expandedGrant === (grant._rowIndex || index) && (
                    <div className="px-4 pb-4 pt-2 border-t border-slate-200 bg-white">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-500">
                        <div className="flex items-center gap-2"><Target className="w-4 h-4" /><span className="truncate">{grant.Purpose || 'N/A'}</span></div>
                        <div className="flex items-center gap-2"><User className="w-4 h-4" /><span>{grant.Contact_person || 'N/A'}</span></div>
                        <div className="flex items-center gap-2"><Mail className="w-4 h-4" /><span className="truncate">{grant.Contact_email || 'N/A'}</span></div>
                        <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /><span>Deadline: {grant.Application_deadline || 'N/A'}</span></div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          }
        </div>
      </div>

      {/* Add Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div><h2 className="text-xl font-black text-slate-800 flex items-center gap-2"><Plus className="w-5 h-5 text-indigo-600" />Add New Grant</h2>
              <p className="text-slate-500 text-sm mt-1">Saves directly to Google Sheet</p></div>
              <button onClick={() => setShowAddForm(false)} className="p-2 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Grant Name *</label>
                <input type="text" value={newGrant.Grant_name} onChange={(e) => setNewGrant({...newGrant, Grant_name: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium focus:outline-none focus:border-indigo-500" placeholder="e.g., LCTF Grant" /></div>
                <div><label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Grant Source *</label>
                <input type="text" value={newGrant.Grant_source} onChange={(e) => setNewGrant({...newGrant, Grant_source: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium focus:outline-none focus:border-indigo-500" placeholder="e.g., Louisiana DCFS" /></div>
              </div>
              <div><label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Purpose</label>
              <input type="text" value={newGrant.Purpose} onChange={(e) => setNewGrant({...newGrant, Purpose: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium focus:outline-none focus:border-indigo-500" placeholder="e.g., Fatherhood mentorship services" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Amount Requested ($)</label>
                <input type="number" value={newGrant.Amount_requested} onChange={(e) => setNewGrant({...newGrant, Amount_requested: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium focus:outline-none focus:border-indigo-500" placeholder="50000" /></div>
                <div><label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Amount Approved ($)</label>
                <input type="number" value={newGrant.Amount_approved} onChange={(e) => setNewGrant({...newGrant, Amount_approved: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium focus:outline-none focus:border-indigo-500" placeholder="Leave blank if pending" /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Deadline</label>
                <input type="date" value={newGrant.Application_deadline} onChange={(e) => setNewGrant({...newGrant, Application_deadline: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium focus:outline-none focus:border-indigo-500" /></div>
                <div><label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Cycle</label>
                <input type="text" value={newGrant.Grant_cycle} onChange={(e) => setNewGrant({...newGrant, Grant_cycle: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium focus:outline-none focus:border-indigo-500" placeholder="FY2025" /></div>
                <div><label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Status</label>
                <select value={newGrant.Grant_status} onChange={(e) => setNewGrant({...newGrant, Grant_status: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium focus:outline-none focus:border-indigo-500">
                  <option value="Pending">Pending</option><option value="Awarded">Awarded</option><option value="Denied">Denied</option><option value="Not Submitted">Not Submitted</option>
                </select></div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 flex gap-3 justify-end">
              <button onClick={() => setShowAddForm(false)} className="px-6 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-slate-600">Cancel</button>
              <button onClick={handleAddGrant} disabled={!newGrant.Grant_name || !newGrant.Grant_source || saving}
                className="px-6 py-3 bg-[#0F2C5C] hover:bg-slate-800 text-white rounded-xl font-bold disabled:opacity-50 flex items-center gap-2">
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}{saving ? 'Saving...' : 'Add Grant'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingGrant && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-800 flex items-center gap-2"><Edit2 className="w-5 h-5 text-indigo-600" />Edit Grant</h2>
              <button onClick={() => setEditingGrant(null)} className="p-2 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div><label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Grant Name</label>
              <input type="text" value={editingGrant.Grant_name} onChange={(e) => setEditingGrant({...editingGrant, Grant_name: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium focus:outline-none focus:border-indigo-500" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Amount Requested</label>
                <input type="number" value={parseCurrency(editingGrant.Amount_requested)} onChange={(e) => setEditingGrant({...editingGrant, Amount_requested: parseFloat(e.target.value) || 0})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium focus:outline-none focus:border-indigo-500" /></div>
                <div><label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Amount Approved</label>
                <input type="number" value={parseCurrency(editingGrant.Amount_approved)} onChange={(e) => setEditingGrant({...editingGrant, Amount_approved: parseFloat(e.target.value) || 0})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium focus:outline-none focus:border-indigo-500" /></div>
              </div>
              <div><label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Status</label>
              <select value={getGrantStatus(editingGrant)} onChange={(e) => setEditingGrant({...editingGrant, Grant_status: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium focus:outline-none focus:border-indigo-500">
                <option value="Pending">Pending</option><option value="Awarded">Awarded</option><option value="Approved">Approved</option><option value="Denied">Denied</option><option value="Not Submitted">Not Submitted</option>
              </select></div>
            </div>
            <div className="p-6 border-t border-slate-200 flex gap-3 justify-end">
              <button onClick={() => setEditingGrant(null)} className="px-6 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-slate-600">Cancel</button>
              <button onClick={handleUpdateGrant} disabled={saving}
                className="px-6 py-3 bg-[#0F2C5C] hover:bg-slate-800 text-white rounded-xl font-bold disabled:opacity-50 flex items-center gap-2">
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}{saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GrantDashboard;
