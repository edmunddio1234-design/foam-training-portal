import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, FileText, DollarSign, Calendar, Search, RefreshCw,
  AlertTriangle, CheckCircle2, Clock, TrendingUp, X, Filter,
  PieChart, Building2, ChevronRight, ExternalLink, XCircle,
  Award, Send, Eye
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
  [key: string]: any;
}

interface ActionItem {
  id: number;
  priority: string;
  action: string;
  deadline: string;
  status: string;
}

interface GrantStats {
  total: number;
  totalRequested: number;
  totalApproved: number;
  statusCounts: Record<string, number>;
  funderTypes: Record<string, number>;
  upcomingDeadlines: any[];
  actionItems: ActionItem[];
}

interface GrantDashboardProps {
  onBack: () => void;
}

type TabType = 'dashboard' | 'all' | 'approved' | 'pending' | 'denied';

const GrantDashboard: React.FC<GrantDashboardProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [grants, setGrants] = useState<Grant[]>([]);
  const [stats, setStats] = useState<GrantStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrant, setSelectedGrant] = useState<Grant | null>(null);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [grantsRes, statsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/grants`),
        fetch(`${API_BASE_URL}/api/grants/stats`)
      ]);

      if (!grantsRes.ok || !statsRes.ok) {
        throw new Error(`HTTP error! status: ${grantsRes.status}`);
      }

      const grantsData = await grantsRes.json();
      const statsData = await statsRes.json();

      console.log('Grants data:', grantsData);
      console.log('Stats data:', statsData);

      if (grantsData.success) {
        setGrants(grantsData.data);
      }
      if (statsData.success) {
        setStats(statsData.data);
      }
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError(err.message || 'Failed to load grant data');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: string | number | undefined) => {
    if (!value) return '$0';
    const num = typeof value === 'string' 
      ? parseFloat(value.replace(/[$,]/g, '')) 
      : value;
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

  const getPriorityColor = (priority: string) => {
    const p = priority?.toUpperCase() || '';
    if (p === 'HIGH') return 'bg-red-100 text-red-700';
    if (p === 'MEDIUM') return 'bg-amber-100 text-amber-700';
    return 'bg-blue-100 text-blue-700';
  };

  // Filter grants based on active tab
  const getFilteredGrants = () => {
    let filtered = grants;
    
    // Filter by tab
    if (activeTab === 'approved') {
      filtered = grants.filter(g => 
        g.grantstatus?.toLowerCase().includes('approved') || 
        g.grantstatus?.toLowerCase().includes('awarded')
      );
    } else if (activeTab === 'pending') {
      filtered = grants.filter(g => 
        g.grantstatus?.toLowerCase().includes('pending') || 
        g.grantstatus?.toLowerCase().includes('submitted') ||
        g.grantstatus?.toLowerCase().includes('to submit')
      );
    } else if (activeTab === 'denied') {
      filtered = grants.filter(g => 
        g.grantstatus?.toLowerCase().includes('denied') || 
        g.grantstatus?.toLowerCase().includes('rejected')
      );
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(g => 
        g.grantname?.toLowerCase().includes(query) ||
        g.grantsource?.toLowerCase().includes(query) ||
        g.purpose?.toLowerCase().includes(query)
      );
    }

    return filtered;
  };

  const filteredGrants = getFilteredGrants();

  // Count grants by status for tabs
  const approvedCount = grants.filter(g => 
    g.grantstatus?.toLowerCase().includes('approved') || 
    g.grantstatus?.toLowerCase().includes('awarded')
  ).length;
  
  const pendingCount = grants.filter(g => 
    g.grantstatus?.toLowerCase().includes('pending') || 
    g.grantstatus?.toLowerCase().includes('submitted') ||
    g.grantstatus?.toLowerCase().includes('to submit')
  ).length;
  
  const deniedCount = grants.filter(g => 
    g.grantstatus?.toLowerCase().includes('denied') || 
    g.grantstatus?.toLowerCase().includes('rejected')
  ).length;

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="animate-spin mx-auto text-blue-600 mb-4" size={48} />
          <p className="text-slate-600 text-lg">Loading Grant Dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md">
          <XCircle className="mx-auto text-red-500 mb-4" size={48} />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Failed to Load Data</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <button
            onClick={loadData}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 mx-auto"
          >
            <RefreshCw size={18} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-white/10 rounded-lg transition-all"
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                <h1 className="text-2xl font-bold">Grant Management</h1>
                <p className="text-slate-300">Real-time data from Google Sheets • {grants.length} grants loaded</p>
              </div>
            </div>
            <button
              onClick={loadData}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-all"
            >
              <RefreshCw size={18} />
              Refresh
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 flex-wrap">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: PieChart, count: null },
              { id: 'all', label: 'All Grants', icon: FileText, count: grants.length },
              { id: 'approved', label: 'Approved', icon: CheckCircle2, count: approvedCount },
              { id: 'pending', label: 'Pending', icon: Clock, count: pendingCount },
              { id: 'denied', label: 'Denied', icon: XCircle, count: deniedCount },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-white text-slate-800'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                  {tab.count !== null && (
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      activeTab === tab.id ? 'bg-blue-100 text-blue-700' : 'bg-white/20'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && stats && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <FileText className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <p className="text-slate-500 text-sm">Total Grants</p>
                    <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                    <DollarSign className="text-amber-600" size={24} />
                  </div>
                  <div>
                    <p className="text-slate-500 text-sm">Total Requested</p>
                    <p className="text-2xl font-bold text-slate-800">{formatCurrency(stats.totalRequested)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <CheckCircle2 className="text-emerald-600" size={24} />
                  </div>
                  <div>
                    <p className="text-slate-500 text-sm">Total Approved</p>
                    <p className="text-2xl font-bold text-emerald-600">{formatCurrency(stats.totalApproved)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="text-purple-600" size={24} />
                  </div>
                  <div>
                    <p className="text-slate-500 text-sm">Success Rate</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {stats.totalRequested > 0 
                        ? Math.round((stats.totalApproved / stats.totalRequested) * 100) 
                        : 0}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Breakdown & Action Items */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Status Breakdown */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <PieChart size={20} className="text-blue-600" />
                  Grant Status Breakdown
                </h3>
                <div className="space-y-3">
                  {Object.entries(stats.statusCounts).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(status)}`}>
                        {status || 'Unknown'}
                      </span>
                      <span className="font-bold text-slate-800">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Items */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <AlertTriangle size={20} className="text-amber-500" />
                  Action Items
                </h3>
                {stats.actionItems && stats.actionItems.length > 0 ? (
                  <div className="space-y-3 max-h-72 overflow-y-auto">
                    {stats.actionItems.map((item) => (
                      <div key={item.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold mb-2 ${getPriorityColor(item.priority)}`}>
                              {item.priority}
                            </span>
                            <p className="text-sm text-slate-800 font-medium">{item.action}</p>
                            <p className="text-xs text-slate-500 mt-1">Due: {item.deadline}</p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded font-medium ${
                            item.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                            item.status === 'Monitoring' ? 'bg-blue-100 text-blue-700' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-center py-8">No action items found</p>
                )}
              </div>
            </div>

            {/* Funder Types */}
            {stats.funderTypes && Object.keys(stats.funderTypes).length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Building2 size={20} className="text-blue-600" />
                  Grants by Funder Type
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(stats.funderTypes).map(([type, count]) => (
                    <div key={type} className="bg-gradient-to-br from-blue-50 to-slate-50 rounded-xl p-4 text-center border border-slate-200">
                      <p className="text-2xl font-bold text-blue-600">{count}</p>
                      <p className="text-sm text-slate-600">{type || 'Other'}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* GRANTS LIST TABS (All, Approved, Pending, Denied) */}
        {activeTab !== 'dashboard' && (
          <div className="space-y-4">
            {/* Search */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search grants by name, source, or purpose..."
                  className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                />
              </div>
            </div>

            {/* Results count */}
            <p className="text-slate-500">
              Showing {filteredGrants.length} grant{filteredGrants.length !== 1 ? 's' : ''}
              {searchQuery && ` matching "${searchQuery}"`}
            </p>

            {/* Grants List */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              {filteredGrants.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {filteredGrants.map((grant) => (
                    <div 
                      key={grant.id} 
                      className="p-4 hover:bg-slate-50 cursor-pointer transition-all"
                      onClick={() => setSelectedGrant(grant)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-slate-800 truncate">{grant.grantname || 'Unnamed Grant'}</h3>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border shrink-0 ${getStatusColor(grant.grantstatus)}`}>
                              {grant.grantstatus || 'Unknown'}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 truncate">{grant.grantsource}</p>
                          <p className="text-xs text-slate-400 mt-1">{grant.purpose}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm text-slate-500">Requested</p>
                          <p className="font-bold text-slate-800">{formatCurrency(grant.amountrequested)}</p>
                          {grant.amountapproved && parseFloat(grant.amountapproved.toString().replace(/[$,]/g, '')) > 0 && (
                            <>
                              <p className="text-xs text-slate-400 mt-1">Approved</p>
                              <p className="font-bold text-emerald-600">{formatCurrency(grant.amountapproved)}</p>
                            </>
                          )}
                        </div>
                        <ChevronRight className="text-slate-300 shrink-0" size={20} />
                      </div>
                      {grant.applicationdeadline && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                          <Calendar size={12} />
                          Deadline: {grant.applicationdeadline}
                        </div>
                      )}
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

      {/* Grant Detail Modal */}
      {selectedGrant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedGrant(null)}>
          <div 
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-t-2xl text-white relative">
              <button 
                onClick={() => setSelectedGrant(null)}
                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full"
              >
                <X size={20} />
              </button>
              <h2 className="text-xl font-bold pr-10">{selectedGrant.grantname}</h2>
              <p className="text-blue-100">{selectedGrant.grantsource}</p>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Amounts */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <p className="text-sm text-slate-500">Amount Requested</p>
                  <p className="text-xl font-bold text-slate-800">{formatCurrency(selectedGrant.amountrequested)}</p>
                </div>
                <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                  <p className="text-sm text-emerald-600">Amount Approved</p>
                  <p className="text-xl font-bold text-emerald-700">{formatCurrency(selectedGrant.amountapproved)}</p>
                </div>
              </div>

              {/* Status */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <p className="text-sm text-slate-500 mb-2">Status</p>
                <span className={`px-3 py-1.5 rounded-full text-sm font-medium border ${getStatusColor(selectedGrant.grantstatus)}`}>
                  {selectedGrant.grantstatus || 'Unknown'}
                </span>
              </div>

              {/* Purpose */}
              {selectedGrant.purpose && (
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <p className="text-sm text-slate-500 mb-1">Purpose</p>
                  <p className="text-slate-800">{selectedGrant.purpose}</p>
                </div>
              )}

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <p className="text-sm text-slate-500 mb-1">Application Deadline</p>
                  <p className="text-slate-800 font-medium">{selectedGrant.applicationdeadline || 'N/A'}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <p className="text-sm text-slate-500 mb-1">Submission Date</p>
                  <p className="text-slate-800 font-medium">{selectedGrant.submissiondate || 'N/A'}</p>
                </div>
              </div>

              {/* Contact */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <p className="text-sm text-slate-500 mb-1">Contact Person</p>
                  <p className="text-slate-800">{selectedGrant.contactperson || 'N/A'}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <p className="text-sm text-slate-500 mb-1">Contact Email</p>
                  <p className="text-slate-800 truncate">{selectedGrant.contactemail || 'N/A'}</p>
                </div>
              </div>

              {/* Funder Type */}
              {selectedGrant.fundertype && (
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <p className="text-sm text-slate-500 mb-1">Funder Type</p>
                  <p className="text-slate-800">{selectedGrant.fundertype}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GrantDashboard;
