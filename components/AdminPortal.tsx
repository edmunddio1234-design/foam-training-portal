import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, FileText, DollarSign, Calendar, Search, RefreshCw,
  AlertTriangle, CheckCircle2, Clock, TrendingUp, FolderOpen,
  File, Download, ExternalLink, X, ChevronRight, Filter,
  PieChart, BarChart3, Users, Building2, Briefcase
} from 'lucide-react';

interface AdminPortalProps {
  onClose: () => void;
}

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
  size: number | null;
  modified: string;
  url: string;
  icon: string;
  isFolder: boolean;
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

type ViewType = 'dashboard' | 'grants' | 'documents';

const AdminPortal: React.FC<AdminPortalProps> = ({ onClose }) => {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [grants, setGrants] = useState<Grant[]>([]);
  const [stats, setStats] = useState<GrantStats | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrant, setSelectedGrant] = useState<Grant | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Load grants and stats in parallel
      const [grantsRes, statsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/grants`),
        fetch(`${API_BASE_URL}/api/grants/stats`)
      ]);

      if (!grantsRes.ok || !statsRes.ok) {
        throw new Error('Failed to load data');
      }

      const grantsData = await grantsRes.json();
      const statsData = await statsRes.json();

      if (grantsData.success) {
        setGrants(grantsData.data);
      }
      if (statsData.success) {
        setStats(statsData.data);
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load grant data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadDocuments = async (folderId?: string) => {
    try {
      const url = folderId 
        ? `${API_BASE_URL}/api/documents/folder/${folderId}`
        : `${API_BASE_URL}/api/documents`;
      
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.success) {
        setDocuments(data.data);
      }
    } catch (err) {
      console.error('Error loading documents:', err);
    }
  };

  const searchGrants = async (query: string) => {
    if (!query.trim()) {
      loadData();
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/grants/search/${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.success) {
        setGrants(data.data);
      }
    } catch (err) {
      console.error('Error searching grants:', err);
    }
  };

  const formatCurrency = (value: string | number) => {
    const num = typeof value === 'string' 
      ? parseFloat(value.replace(/[$,]/g, '')) 
      : value;
    if (isNaN(num)) return '$0';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num);
  };

  const getStatusColor = (status: string) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('approved') || s.includes('awarded')) return 'bg-emerald-100 text-emerald-700';
    if (s.includes('pending') || s.includes('submitted')) return 'bg-amber-100 text-amber-700';
    if (s.includes('denied') || s.includes('rejected')) return 'bg-red-100 text-red-700';
    return 'bg-slate-100 text-slate-700';
  };

  const getPriorityColor = (priority: string) => {
    const p = priority?.toUpperCase() || '';
    if (p === 'HIGH') return 'bg-red-100 text-red-700 border-red-200';
    if (p === 'MEDIUM') return 'bg-amber-100 text-amber-700 border-amber-200';
    return 'bg-blue-100 text-blue-700 border-blue-200';
  };

  const filteredGrants = grants.filter(g => {
    if (statusFilter === 'all') return true;
    return g.grantstatus?.toLowerCase().includes(statusFilter.toLowerCase());
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="animate-spin mx-auto text-amber-500 mb-4" size={48} />
          <p className="text-white text-lg">Loading Admin Command Center...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center bg-slate-800 p-8 rounded-xl max-w-md">
          <AlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
          <h2 className="text-xl font-bold text-white mb-2">Connection Error</h2>
          <p className="text-slate-400 mb-6">{error}</p>
          <button
            onClick={loadData}
            className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-700 rounded-lg transition-all"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-amber-500">ADMIN COMMAND CENTER</h1>
              <p className="text-slate-400 text-sm">Grant Management & Document Library</p>
            </div>
          </div>
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-all"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mt-4">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'grants', label: 'Grant Management', icon: DollarSign },
            { id: 'documents', label: 'Document Library', icon: FolderOpen }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setCurrentView(tab.id as ViewType);
                  if (tab.id === 'documents' && documents.length === 0) {
                    loadDocuments();
                  }
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  currentView === tab.id
                    ? 'bg-amber-500 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {/* DASHBOARD VIEW */}
        {currentView === 'dashboard' && stats && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <FileText className="text-blue-400" size={24} />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Total Grants</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
                    <DollarSign className="text-amber-400" size={24} />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Total Requested</p>
                    <p className="text-2xl font-bold">{formatCurrency(stats.totalRequested)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                    <CheckCircle2 className="text-emerald-400" size={24} />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Total Approved</p>
                    <p className="text-2xl font-bold">{formatCurrency(stats.totalApproved)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <TrendingUp className="text-purple-400" size={24} />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Success Rate</p>
                    <p className="text-2xl font-bold">
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
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <PieChart size={20} className="text-amber-500" />
                  Grant Status Breakdown
                </h3>
                <div className="space-y-3">
                  {Object.entries(stats.statusCounts).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(status)}`}>
                          {status || 'Unknown'}
                        </span>
                      </div>
                      <span className="font-bold">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Items */}
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <AlertTriangle size={20} className="text-amber-500" />
                  Action Items
                </h3>
                {stats.actionItems && stats.actionItems.length > 0 ? (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {stats.actionItems.map((item) => (
                      <div key={item.id} className="bg-slate-700/50 rounded-lg p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium mb-1 ${getPriorityColor(item.priority)}`}>
                              {item.priority}
                            </span>
                            <p className="text-sm text-slate-200">{item.action}</p>
                            <p className="text-xs text-slate-400 mt-1">Due: {item.deadline}</p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded ${
                            item.status === 'Pending' ? 'bg-amber-500/20 text-amber-400' :
                            item.status === 'Monitoring' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-slate-600 text-slate-300'
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

            {/* Upcoming Deadlines */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Calendar size={20} className="text-amber-500" />
                Upcoming Deadlines
              </h3>
              {stats.upcomingDeadlines && stats.upcomingDeadlines.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {stats.upcomingDeadlines.map((deadline, i) => (
                    <div key={i} className="bg-slate-700/50 rounded-lg p-4">
                      <p className="font-medium text-white truncate">
                        {deadline.grantname || deadline.grantsource || Object.values(deadline)[1]}
                      </p>
                      <p className="text-sm text-slate-400 mt-1">
                        {deadline.applicationdeadline || deadline.deadline || Object.values(deadline)[2]}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-center py-8">No upcoming deadlines</p>
              )}
            </div>

            {/* Funder Types */}
            {stats.funderTypes && Object.keys(stats.funderTypes).length > 0 && (
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Building2 size={20} className="text-amber-500" />
                  Grants by Funder Type
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(stats.funderTypes).map(([type, count]) => (
                    <div key={type} className="bg-slate-700/50 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-amber-400">{count}</p>
                      <p className="text-sm text-slate-400">{type || 'Other'}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* GRANTS VIEW */}
        {currentView === 'grants' && (
          <div className="space-y-6">
            {/* Search & Filter */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && searchGrants(searchQuery)}
                  placeholder="Search grants by name, source, or status..."
                  className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">All Statuses</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="submitted">Submitted</option>
                <option value="denied">Denied</option>
              </select>
              <button
                onClick={() => searchGrants(searchQuery)}
                className="px-6 py-3 bg-amber-500 hover:bg-amber-600 rounded-xl font-medium transition-all"
              >
                Search
              </button>
            </div>

            {/* Grants Table */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-700/50">
                    <tr>
                      <th className="text-left px-4 py-3 text-sm font-medium text-slate-300">Grant Name</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-slate-300">Source</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-slate-300">Requested</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-slate-300">Approved</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-slate-300">Status</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-slate-300">Deadline</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {filteredGrants.slice(0, 50).map((grant) => (
                      <tr 
                        key={grant.id} 
                        className="hover:bg-slate-700/50 cursor-pointer transition-all"
                        onClick={() => setSelectedGrant(grant)}
                      >
                        <td className="px-4 py-3">
                          <p className="font-medium text-white truncate max-w-xs">{grant.grantname}</p>
                        </td>
                        <td className="px-4 py-3 text-slate-300 truncate max-w-xs">{grant.grantsource}</td>
                        <td className="px-4 py-3 text-slate-300">{formatCurrency(grant.amountrequested)}</td>
                        <td className="px-4 py-3 text-emerald-400">{formatCurrency(grant.amountapproved)}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(grant.grantstatus)}`}>
                            {grant.grantstatus || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-300">{grant.applicationdeadline}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredGrants.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                  No grants found
                </div>
              )}
              {filteredGrants.length > 50 && (
                <div className="text-center py-4 text-slate-400 border-t border-slate-700">
                  Showing 50 of {filteredGrants.length} grants
                </div>
              )}
            </div>
          </div>
        )}

        {/* DOCUMENTS VIEW */}
        {currentView === 'documents' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Document Library</h2>
              <button
                onClick={() => loadDocuments()}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-all"
              >
                <RefreshCw size={16} />
                Refresh
              </button>
            </div>

            {documents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {documents.map((doc) => (
                  <a
                    key={doc.id}
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-slate-800 rounded-xl p-4 border border-slate-700 hover:border-amber-500 transition-all group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center shrink-0">
                        {doc.isFolder ? (
                          <FolderOpen className="text-amber-400" size={20} />
                        ) : (
                          <File className="text-blue-400" size={20} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white truncate group-hover:text-amber-400 transition-all">
                          {doc.name}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          {doc.modified ? new Date(doc.modified).toLocaleDateString() : 'Unknown date'}
                        </p>
                      </div>
                      <ExternalLink className="text-slate-500 group-hover:text-amber-400 shrink-0" size={16} />
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="bg-slate-800 rounded-xl p-12 text-center border border-slate-700">
                <FolderOpen className="mx-auto text-slate-500 mb-4" size={48} />
                <p className="text-slate-400">No documents found</p>
                <p className="text-slate-500 text-sm mt-2">Make sure Google Drive is connected and shared with the service account</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Grant Detail Modal */}
      {selectedGrant && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setSelectedGrant(null)}>
          <div 
            className="bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-700 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">{selectedGrant.grantname}</h2>
                <p className="text-slate-400">{selectedGrant.grantsource}</p>
              </div>
              <button onClick={() => setSelectedGrant(null)} className="p-2 hover:bg-slate-700 rounded-lg">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <p className="text-sm text-slate-400">Amount Requested</p>
                  <p className="text-xl font-bold text-white">{formatCurrency(selectedGrant.amountrequested)}</p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <p className="text-sm text-slate-400">Amount Approved</p>
                  <p className="text-xl font-bold text-emerald-400">{formatCurrency(selectedGrant.amountapproved)}</p>
                </div>
              </div>

              <div className="bg-slate-700/50 rounded-lg p-4">
                <p className="text-sm text-slate-400 mb-1">Status</p>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedGrant.grantstatus)}`}>
                  {selectedGrant.grantstatus || 'Unknown'}
                </span>
              </div>

              <div className="bg-slate-700/50 rounded-lg p-4">
                <p className="text-sm text-slate-400 mb-1">Purpose</p>
                <p className="text-white">{selectedGrant.purpose || 'Not specified'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <p className="text-sm text-slate-400 mb-1">Application Deadline</p>
                  <p className="text-white">{selectedGrant.applicationdeadline || 'N/A'}</p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <p className="text-sm text-slate-400 mb-1">Submission Date</p>
                  <p className="text-white">{selectedGrant.submissiondate || 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <p className="text-sm text-slate-400 mb-1">Contact Person</p>
                  <p className="text-white">{selectedGrant.contactperson || 'N/A'}</p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <p className="text-sm text-slate-400 mb-1">Contact Email</p>
                  <p className="text-white truncate">{selectedGrant.contactemail || 'N/A'}</p>
                </div>
              </div>

              <div className="bg-slate-700/50 rounded-lg p-4">
                <p className="text-sm text-slate-400 mb-1">Funder Type</p>
                <p className="text-white">{selectedGrant.fundertype || 'Not specified'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPortal;
