import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft, FileText, DollarSign, Calendar, Search, RefreshCw,
  AlertTriangle, CheckCircle2, Clock, TrendingUp, X, XCircle,
  PieChart, Building2, ChevronRight, ExternalLink, Bell,
  FolderOpen, File, BarChart3, Target, Lightbulb, ArrowUpRight,
  ArrowDownRight, Activity, Zap, Plus, Compass, Database, Users, Layers,
  Loader2
} from 'lucide-react';
import IRS990Research from './IRS990Research';
import FoundationResearchHub from './FoundationResearchHub';

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
  initialTab?: 'grants' | 'funding-research' | 'documents';
}

interface NewGrantForm {
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
}

type MainTab = 'grants' | 'funding-research' | 'documents';
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

// Funding Research Landing Page Component - UPDATED with Foundation Research Hub
const FundingResearchLanding: React.FC<{ onOpenIRS990: () => void; onOpenFoundationHub: () => void }> = ({ onOpenIRS990, onOpenFoundationHub }) => {
  const tools = [
    {
      name: 'Seamless.AI',
      url: 'https://www.seamless.ai',
      icon: Database,
      color: 'from-blue-600 to-cyan-600',
      shadowColor: 'shadow-blue-200',
      description: 'Powerful organizations database for finding potential funders and partners.',
      features: [
        'Access to millions of organization contacts',
        'Real-time verified contact information',
        'Search by industry, location, and company size',
        'Find decision-makers at foundations and corporations',
        'Build targeted outreach lists for grant opportunities'
      ],
      bestFor: 'Finding contact information for foundation program officers and corporate giving managers'
    },
    {
      name: 'Cause IQ',
      url: 'https://www.causeiq.com',
      icon: Users,
      color: 'from-emerald-600 to-teal-600',
      shadowColor: 'shadow-emerald-200',
      description: 'Research platform showing what other nonprofits are doing and how they\'re funded.',
      features: [
        'See detailed financials of other nonprofits',
        'Discover which foundations fund similar organizations',
        'Analyze competitor grant portfolios',
        'Track nonprofit sector trends',
        'Find new foundation prospects based on giving patterns'
      ],
      bestFor: 'Researching which foundations fund organizations similar to FOAM'
    },
    {
      name: 'IRS 990 Research',
      url: '/irs-990-research',
      icon: FileText,
      color: 'from-purple-600 to-indigo-600',
      shadowColor: 'shadow-purple-200',
      description: 'AI-powered foundation search using real IRS 990-PF tax filings and grant data from ProPublica.',
      features: [
        'Search 1.8M+ nonprofit filings from IRS database',
        'View actual grants made (990-PF Part XV data)',
        'AI-powered matching to your organization profile',
        'Filter by location, subject area, and grant size',
        'See foundation officers and their compensation'
      ],
      bestFor: 'Finding foundations that have funded similar organizations and viewing their actual grant history'
    },
    {
      name: 'Foundation Research Hub',
      url: '/foundation-research-hub',
      icon: Layers,
      color: 'from-orange-600 to-red-600',
      shadowColor: 'shadow-orange-200',
      description: 'Multi-source research combining ProPublica, Open990, IRS data, plus links to Candid & premium tools.',
      features: [
        'Search multiple free databases simultaneously',
        'Verify nonprofit status with EIN lookup',
        'Quick links to Candid, Foundation Directory, Grants.gov',
        'Compare results across ProPublica and Open990',
        'Research tips tailored for FOAM\'s focus areas'
      ],
      bestFor: 'Comprehensive foundation research using all available free sources plus premium resource links'
    }
  ];

  const handleToolClick = (tool: typeof tools[0]) => {
    if (tool.url === '/irs-990-research') {
      onOpenIRS990();
    } else if (tool.url === '/foundation-research-hub') {
      onOpenFoundationHub();
    } else {
      window.open(tool.url, '_blank');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-purple-200">
          <Compass className="text-white" size={40} />
        </div>
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Funding Research Tools</h2>
        <p className="text-slate-500 max-w-2xl mx-auto">
          Use these powerful research platforms to discover new funding opportunities, 
          find funder contacts, and see what grants similar nonprofits are receiving.
        </p>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <div key={tool.name} className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden hover:shadow-2xl transition-all duration-300">
              {/* Tool Header */}
              <div className={`bg-gradient-to-r ${tool.color} p-6 text-white`}>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                    <Icon size={28} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{tool.name}</h3>
                    <p className="text-white/80 text-sm">{tool.description}</p>
                  </div>
                </div>
              </div>

              {/* Tool Content */}
              <div className="p-6">
                {/* Features */}
                <div className="mb-6">
                  <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Key Features</h4>
                  <ul className="space-y-2">
                    {tool.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={16} />
                        <span className="text-slate-600 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Best For */}
                <div className="bg-slate-50 rounded-xl p-4 mb-6">
                  <p className="text-sm">
                    <span className="font-bold text-slate-700">Best for: </span>
                    <span className="text-slate-600">{tool.bestFor}</span>
                  </p>
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => handleToolClick(tool)}
                  className={`flex items-center justify-center gap-2 w-full py-4 bg-gradient-to-r ${tool.color} text-white rounded-xl font-bold hover:opacity-90 transition-all ${tool.shadowColor} shadow-lg`}
                >
                  Open {tool.name}
                  <ExternalLink size={18} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tips Section - UPDATED */}
      <div className="mt-10 bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-8 border border-amber-200">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center shrink-0">
            <Lightbulb className="text-white" size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Pro Tips for Funding Research</h3>
            <ul className="space-y-2 text-slate-600">
              <li className="flex items-start gap-2">
                <span className="text-amber-500 font-bold">1.</span>
                <span>Start with <strong>Foundation Research Hub</strong> for comprehensive multi-source searching across free databases.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 font-bold">2.</span>
                <span>Use <strong>Cause IQ</strong> to find foundations that fund similar fatherhood and family support programs.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 font-bold">3.</span>
                <span>Use <strong>Seamless.AI</strong> to find direct contact information for program officers at those foundations.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 font-bold">4.</span>
                <span>Track your research in the Grant Management tab to keep all your prospects organized.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// Document Library Component with AI Chat - UPDATED with loading state
const DocumentLibrary: React.FC<{ onLoadDocuments: () => void; documents: Document[]; isLoading: boolean }> = ({ onLoadDocuments, documents, isLoading }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Document[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string; documents?: Document[] }>>([
    { role: 'assistant', content: "Hi! I'm your Document Assistant. Ask me to find any file - try things like 'Find grant applications' or 'Show me budget reports'." }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterType, setFilterType] = useState<string>('all');

  const searchDocuments = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/documents/search/${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.success) {
        setSearchResults(data.data || []);
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsChatLoading(true);

    try {
      const searchTerms = userMessage.toLowerCase()
        .replace(/find|show|get|search|look for|where is|locate|i need|can you find|do we have|any|all/gi, '')
        .replace(/the|a|an|my|our|me|please|about|related to|regarding|for/gi, '')
        .trim();

      const res = await fetch(`${API_BASE_URL}/api/documents/search/${encodeURIComponent(searchTerms || userMessage)}?type=both`);
      const data = await res.json();

      if (data.success && data.data && data.data.length > 0) {
        const docs = data.data.slice(0, 15);
        setChatMessages(prev => [...prev, {
          role: 'assistant',
          content: `I found ${data.count} document${data.count !== 1 ? 's' : ''} matching "${searchTerms || userMessage}". Here are the top results:`,
          documents: docs
        }]);
        setSearchResults(data.data);
      } else {
        setChatMessages(prev => [...prev, {
          role: 'assistant',
          content: `I couldn't find any documents matching "${searchTerms || userMessage}". Try:\n• Different keywords\n• Shorter search terms\n• Check spelling\n• Search for file types (e.g., "budget spreadsheet")`
        }]);
      }
    } catch (err) {
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: "Sorry, I had trouble searching. Please try again."
      }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const getFileIcon = (type: string, isFolder: boolean) => {
    if (isFolder) return <FolderOpen className="text-amber-500" size={20} />;
    if (type?.includes('spreadsheet') || type?.includes('excel')) return <FileText className="text-emerald-500" size={20} />;
    if (type?.includes('document') || type?.includes('word')) return <FileText className="text-blue-500" size={20} />;
    if (type?.includes('presentation') || type?.includes('powerpoint')) return <FileText className="text-orange-500" size={20} />;
    if (type?.includes('pdf')) return <FileText className="text-red-500" size={20} />;
    if (type?.includes('image')) return <FileText className="text-purple-500" size={20} />;
    return <File className="text-slate-400" size={20} />;
  };

  const getFileTypeName = (type: string) => {
    if (type?.includes('folder')) return 'Folder';
    if (type?.includes('spreadsheet')) return 'Spreadsheet';
    if (type?.includes('document')) return 'Document';
    if (type?.includes('presentation')) return 'Presentation';
    if (type?.includes('pdf')) return 'PDF';
    if (type?.includes('image')) return 'Image';
    return 'File';
  };

  const displayDocs = searchQuery ? searchResults : documents;
  const filteredDocs = filterType === 'all' ? displayDocs : displayDocs.filter(d => {
    if (filterType === 'folders') return d.isFolder;
    if (filterType === 'docs') return d.type?.includes('document');
    if (filterType === 'sheets') return d.type?.includes('spreadsheet');
    if (filterType === 'pdfs') return d.type?.includes('pdf');
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Loading Banner - Shows when documents are being fetched */}
      {isLoading && (
        <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Loader2 className="text-blue-600 animate-spin" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-blue-800">Loading Your Documents</h3>
              <p className="text-blue-600 text-sm">
                Connecting to Google Drive and retrieving your files. This may take a moment...
              </p>
            </div>
          </div>
          <div className="mt-4 w-full bg-blue-100 rounded-full h-2 overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Chat Panel */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl shadow-xl overflow-hidden h-[600px] flex flex-col">
            <div className="p-4 border-b border-white/10">
              <h3 className="text-white font-bold flex items-center gap-2">
                <Zap size={20} className="text-amber-300" />
                AI Document Assistant
              </h3>
              <p className="text-indigo-200 text-xs mt-1">Ask me to find any document</p>
            </div>
            
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl p-3 ${
                    msg.role === 'user' 
                      ? 'bg-white text-slate-800' 
                      : 'bg-white/10 text-white'
                  }`}>
                    <p className="text-sm">{msg.content}</p>
                    {msg.documents && msg.documents.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {msg.documents.map((doc, j) => (
                          <a
                            key={j}
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
                          >
                            {getFileIcon(doc.type, doc.isFolder)}
                            <span className="text-xs truncate flex-1">{doc.name}</span>
                            <ExternalLink size={12} />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isChatLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/10 rounded-2xl p-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleChatSubmit} className="p-4 border-t border-white/10">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask me to find documents..."
                  className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 text-sm"
                />
                <button
                  type="submit"
                  disabled={isChatLoading}
                  className="px-4 py-2 bg-white text-indigo-600 rounded-xl font-medium hover:bg-indigo-50 transition-all disabled:opacity-50"
                >
                  <Search size={18} />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Document Browser */}
        <div className="lg:col-span-2">
          {/* Search & Filters */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 mb-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    searchDocuments(e.target.value);
                  }}
                  placeholder="Search all documents..."
                  className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="folders">Folders</option>
                  <option value="docs">Documents</option>
                  <option value="sheets">Spreadsheets</option>
                  <option value="pdfs">PDFs</option>
                </select>
                <button
                  onClick={onLoadDocuments}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50"
                >
                  <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                </button>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <p className="text-slate-500 mb-4 font-medium">
            {isSearching ? 'Searching...' : isLoading ? 'Loading documents...' : `${filteredDocs.length} documents`}
            {searchQuery && ` matching "${searchQuery}"`}
          </p>

          {/* Documents Grid */}
          {isLoading && documents.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Loader2 className="text-blue-600 animate-spin" size={32} />
              </div>
              <p className="text-slate-700 font-medium text-lg">Loading your files...</p>
              <p className="text-slate-400 text-sm mt-2">
                Fetching documents from Google Drive. This will only take a moment.
              </p>
            </div>
          ) : filteredDocs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto">
              {filteredDocs.map((doc) => (
                <a
                  key={doc.id}
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white rounded-2xl p-4 border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-all shrink-0">
                      {getFileIcon(doc.type, doc.isFolder)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800 truncate group-hover:text-blue-600 transition-all">
                        {doc.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full">
                          {getFileTypeName(doc.type)}
                        </span>
                        <span className="text-xs text-slate-400">
                          {doc.modified ? new Date(doc.modified).toLocaleDateString() : ''}
                        </span>
                      </div>
                    </div>
                    <ExternalLink className="text-slate-300 group-hover:text-blue-500 shrink-0" size={16} />
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
              <FolderOpen className="mx-auto text-slate-300 mb-4" size={48} />
              <p className="text-slate-500 font-medium">
                {searchQuery ? 'No documents match your search' : 'No documents found'}
              </p>
              <p className="text-slate-400 text-sm mt-2">
                {searchQuery ? 'Try different keywords' : 'Click Refresh to load documents from Google Drive'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AdminPortal: React.FC<AdminPortalProps> = ({ onClose, initialTab = 'grants' }) => {
  const [mainTab, setMainTab] = useState<MainTab>(initialTab);
  const [grantTab, setGrantTab] = useState<GrantTab>('dashboard');
  const [grants, setGrants] = useState<Grant[]>([]);
  const [stats, setStats] = useState<GrantStats | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDocumentsLoading, setIsDocumentsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrant, setSelectedGrant] = useState<Grant | null>(null);
  const [showIRS990Research, setShowIRS990Research] = useState(false);
  const [showFoundationHub, setShowFoundationHub] = useState(false);

  // Add Grant Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [newGrant, setNewGrant] = useState<NewGrantForm>({
    grantname: '',
    grantsource: '',
    purpose: '',
    contactperson: '',
    contactemail: '',
    applicationdeadline: '',
    submissiondate: '',
    amountrequested: '',
    amountapproved: '',
    grantstatus: 'To Submit',
    fundertype: '',
    submissionyear: new Date().getFullYear().toString()
  });

  useEffect(() => {
    // If opening directly to documents tab, load documents immediately
    if (initialTab === 'documents') {
      setIsLoading(false); // Don't show grant loading for documents
      loadDocuments();
    } else {
      loadGrantData();
    }
  }, [initialTab]);

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
    setIsDocumentsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/documents?all=true`);
      const data = await res.json();
      if (data.success) {
        setDocuments(data.data || []);
        console.log(`Loaded ${data.count} documents from ${data.totalPages} pages`);
      }
    } catch (err) {
      console.error('Error loading documents:', err);
    } finally {
      setIsDocumentsLoading(false);
    }
  };

  const handleAddGrant = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const response = await fetch(`${API_BASE_URL}/api/grants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newGrant),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to create grant');
      }

      setSubmitSuccess(true);
      
      setNewGrant({
        grantname: '',
        grantsource: '',
        purpose: '',
        contactperson: '',
        contactemail: '',
        applicationdeadline: '',
        submissiondate: '',
        amountrequested: '',
        amountapproved: '',
        grantstatus: 'To Submit',
        fundertype: '',
        submissionyear: new Date().getFullYear().toString()
      });

      setTimeout(() => {
        setShowAddModal(false);
        setSubmitSuccess(false);
        loadGrantData();
      }, 1500);

    } catch (err: any) {
      console.error('Error adding grant:', err);
      setSubmitError(err.message || 'Failed to add grant');
    } finally {
      setIsSubmitting(false);
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

  const grantsNeedingAttention = useMemo(() => 
    approvedGrants.filter(g => g.amountapproved && parseFloat(g.amountapproved.toString().replace(/[$,]/g, '')) > 0)
  , [approvedGrants]);

  const recentGrants = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return grants.filter(g => {
      if (!g.submissiondate) return false;
      const subDate = new Date(g.submissiondate);
      return subDate >= thirtyDaysAgo;
    });
  }, [grants]);

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

  // Dynamic header based on tab
  const getHeaderTitle = () => {
    if (mainTab === 'documents') return 'Document Library';
    return 'Grant Management Center';
  };

  const getHeaderSubtitle = () => {
    if (mainTab === 'documents') return 'AI-Powered Document Search & Access';
    return 'Real-time Grant Analytics & Funding Research';
  };

  if (isLoading && mainTab !== 'documents') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <RefreshCw className="animate-spin mx-auto text-blue-600 mb-4" size={48} />
            <div className="absolute inset-0 blur-xl bg-blue-400/30 rounded-full"></div>
          </div>
          <p className="text-slate-600 text-lg font-medium">Loading {mainTab === 'documents' ? 'Document Library' : 'Grant Management'}...</p>
          <p className="text-slate-400 text-sm">Connecting to live data</p>
        </div>
      </div>
    );
  }

  if (error && mainTab !== 'documents') {
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
      <div className={`${mainTab === 'documents' ? 'bg-gradient-to-r from-blue-700 via-blue-800 to-blue-900' : 'bg-gradient-to-r from-slate-800 via-slate-800 to-slate-900'} text-white p-6 shadow-xl`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-all">
                <ArrowLeft size={24} />
              </button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  {mainTab === 'documents' ? (
                    <FolderOpen className="text-blue-300" size={24} />
                  ) : (
                    <Zap className="text-amber-400" size={24} />
                  )}
                  {getHeaderTitle()}
                </h1>
                <p className="text-slate-400">{getHeaderSubtitle()}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                <Activity size={14} /> Live
              </div>
              {mainTab === 'grants' && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all font-medium"
                >
                  <Plus size={18} /> Add Grant
                </button>
              )}
              <button onClick={mainTab === 'documents' ? loadDocuments : loadGrantData} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl transition-all font-medium">
                <RefreshCw size={18} className={isDocumentsLoading ? 'animate-spin' : ''} /> Refresh
              </button>
            </div>
          </div>

          {/* Main Tabs - Only show when NOT in documents mode */}
          {mainTab !== 'documents' && (
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
                onClick={() => setMainTab('funding-research')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                  mainTab === 'funding-research' 
                    ? 'bg-white text-slate-800 shadow-lg' 
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <Compass size={20} /> Funding Research
              </button>
            </div>
          )}
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
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <PieChart size={20} className="text-blue-600" />
                    Grant Status Distribution
                  </h3>
                  <PieChartVisual data={stats.statusCounts || {}} colors={pieColors} />
                </div>

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

      {/* FUNDING RESEARCH - UPDATED */}
      {mainTab === 'funding-research' && (
        <FundingResearchLanding 
          onOpenIRS990={() => setShowIRS990Research(true)} 
          onOpenFoundationHub={() => setShowFoundationHub(true)}
        />
      )}

      {/* DOCUMENT LIBRARY */}
      {mainTab === 'documents' && (
        <DocumentLibrary onLoadDocuments={loadDocuments} documents={documents} isLoading={isDocumentsLoading} />
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

      {/* Add Grant Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => !isSubmitting && setShowAddModal(false)}>
          <div 
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-6 rounded-t-2xl text-white relative">
              <button 
                onClick={() => !isSubmitting && setShowAddModal(false)}
                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full"
                disabled={isSubmitting}
              >
                <X size={20} />
              </button>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Plus size={24} />
                Add New Grant
              </h2>
              <p className="text-emerald-100">Enter the grant details below</p>
            </div>
            
            <form onSubmit={handleAddGrant} className="p-6 space-y-4">
              {submitSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
                  <CheckCircle2 className="text-emerald-600" size={24} />
                  <div>
                    <p className="font-medium text-emerald-800">Grant Added Successfully!</p>
                    <p className="text-sm text-emerald-600">Refreshing data...</p>
                  </div>
                </div>
              )}

              {submitError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                  <XCircle className="text-red-600" size={24} />
                  <div>
                    <p className="font-medium text-red-800">Error Adding Grant</p>
                    <p className="text-sm text-red-600">{submitError}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Grant Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newGrant.grantname}
                    onChange={(e) => setNewGrant({...newGrant, grantname: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
                    placeholder="e.g., Youth Development Grant"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Grant Source / Funder <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newGrant.grantsource}
                    onChange={(e) => setNewGrant({...newGrant, grantsource: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
                    placeholder="e.g., LA Children's Trust Fund"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Purpose</label>
                <textarea
                  value={newGrant.purpose}
                  onChange={(e) => setNewGrant({...newGrant, purpose: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
                  rows={2}
                  placeholder="Brief description of grant purpose..."
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={newGrant.contactperson}
                    onChange={(e) => setNewGrant({...newGrant, contactperson: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
                    placeholder="Contact name"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={newGrant.contactemail}
                    onChange={(e) => setNewGrant({...newGrant, contactemail: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
                    placeholder="contact@example.com"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Application Deadline</label>
                  <input
                    type="date"
                    value={newGrant.applicationdeadline}
                    onChange={(e) => setNewGrant({...newGrant, applicationdeadline: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Submission Date</label>
                  <input
                    type="date"
                    value={newGrant.submissiondate}
                    onChange={(e) => setNewGrant({...newGrant, submissiondate: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Amount Requested</label>
                  <input
                    type="text"
                    value={newGrant.amountrequested}
                    onChange={(e) => setNewGrant({...newGrant, amountrequested: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
                    placeholder="e.g., 50000 or $50,000"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Amount Approved</label>
                  <input
                    type="text"
                    value={newGrant.amountapproved}
                    onChange={(e) => setNewGrant({...newGrant, amountapproved: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
                    placeholder="Leave empty if pending"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select
                    value={newGrant.grantstatus}
                    onChange={(e) => setNewGrant({...newGrant, grantstatus: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
                    disabled={isSubmitting}
                  >
                    <option value="To Submit">To Submit</option>
                    <option value="Submitted">Submitted</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Awarded">Awarded</option>
                    <option value="Denied">Denied</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Funder Type</label>
                  <select
                    value={newGrant.fundertype}
                    onChange={(e) => setNewGrant({...newGrant, fundertype: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
                    disabled={isSubmitting}
                  >
                    <option value="">Select Type...</option>
                    <option value="Federal">Federal</option>
                    <option value="State">State</option>
                    <option value="Local">Local</option>
                    <option value="Foundation">Foundation</option>
                    <option value="Corporate">Corporate</option>
                    <option value="Private">Private</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Submission Year</label>
                  <input
                    type="text"
                    value={newGrant.submissionyear}
                    onChange={(e) => setNewGrant({...newGrant, submissionyear: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
                    placeholder="e.g., 2026"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || submitSuccess}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-lg font-medium flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="animate-spin" size={18} />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus size={18} />
                      Add Grant
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* IRS 990 Research Full Screen */}
      {showIRS990Research && (
        <div className="fixed inset-0 z-50 bg-white">
          <IRS990Research onBack={() => setShowIRS990Research(false)} />
        </div>
      )}

      {/* Foundation Research Hub Full Screen */}
      {showFoundationHub && (
        <div className="fixed inset-0 z-50 bg-white">
          <FoundationResearchHub onBack={() => setShowFoundationHub(false)} />
        </div>
      )}
    </div>
  );
};

export default AdminPortal;
