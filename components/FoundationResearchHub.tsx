import React, { useState } from 'react';
import {
  ArrowLeft,
  Search,
  Building2,
  DollarSign,
  MapPin,
  FileText,
  ExternalLink,
  Star,
  Filter,
  TrendingUp,
  Sparkles,
  ChevronRight,
  RefreshCw,
  X,
  AlertCircle,
  Loader2,
  Database,
  Globe,
  Link2,
  CheckCircle2,
  BookOpen,
  Users,
  Landmark,
  Shield,
  Layers
} from 'lucide-react';

// ============================================
// BACKEND URL - Your Render backend
// ============================================
const BACKEND_URL = 'https://foamla-backend-2.onrender.com';

// ============================================
// INTERFACES
// ============================================

interface ProPublicaOrg {
  ein: number;
  name: string;
  city: string;
  state: string;
  ntee_code: string;
  raw_ntee_code: string;
  subseccd: number;
  have_filings: boolean;
  score: number;
}

interface ProPublicaFiling {
  tax_prd: number;
  tax_prd_yr: number;
  formtype: number;
  pdf_url: string;
  updated: string;
  totrevenue: number;
  totfuncexpns: number;
  totassetsend: number;
  totliabend: number;
}

interface Foundation {
  id: string;
  ein: string;
  name: string;
  city: string;
  state: string;
  totalAssets: number;
  totalRevenue: number;
  totalExpenses: number;
  fiscalYear: number;
  nteeCode: string;
  subsectionCode: number;
  hasFilings: boolean;
  pdfUrl?: string;
  matchScore?: number;
  filings?: ProPublicaFiling[];
  source: 'propublica' | 'open990' | 'irs';
}

interface FoundationResearchHubProps {
  onBack: () => void;
}

// ============================================
// CONSTANTS
// ============================================

const nteeDescriptions: Record<string, string> = {
  'A': 'Arts, Culture & Humanities',
  'B': 'Education',
  'C': 'Environment',
  'D': 'Animal-Related',
  'E': 'Health Care',
  'F': 'Mental Health & Crisis',
  'G': 'Disease & Disorders',
  'H': 'Medical Research',
  'I': 'Crime & Legal-Related',
  'J': 'Employment',
  'K': 'Food, Agriculture & Nutrition',
  'L': 'Housing & Shelter',
  'M': 'Public Safety & Disaster',
  'N': 'Recreation & Sports',
  'O': 'Youth Development',
  'P': 'Human Services',
  'Q': 'International',
  'R': 'Civil Rights & Advocacy',
  'S': 'Community Improvement',
  'T': 'Philanthropy & Voluntarism',
  'U': 'Science & Technology',
  'V': 'Social Science',
  'W': 'Public & Society Benefit',
  'X': 'Religion-Related',
  'Y': 'Mutual & Membership Benefit',
  'Z': 'Unknown'
};

// Quick links to external research resources
const externalResources = [
  {
    name: 'Candid (GuideStar)',
    url: 'https://www.candid.org',
    description: 'Premier foundation directory with 140,000+ grantmakers',
    icon: Database,
    color: 'from-orange-500 to-red-500',
    features: ['Foundation profiles', 'Giving history', '990 data', 'Grant lists']
  },
  {
    name: 'Instrumentl',
    url: 'https://www.instrumentl.com',
    description: 'Smart grant discovery and tracking platform',
    icon: BookOpen,
    color: 'from-blue-500 to-indigo-500',
    features: ['AI-matched grants', 'Deadline tracking', 'Funder insights', 'Award data']
  },
  {
    name: 'GrantStation',
    url: 'https://grantstation.com/',
    description: 'Grant opportunities and funder research',
    icon: Landmark,
    color: 'from-emerald-500 to-teal-500',
    features: ['Federal grants', 'State grants', 'Foundation grants', 'Grant calendar']
  },
  {
    name: 'Grants.gov',
    url: 'https://www.grants.gov/',
    description: 'Official federal grant opportunities',
    icon: Shield,
    color: 'from-slate-600 to-slate-800',
    features: ['Federal grants only', 'Free to use', 'Official source', 'Grant tracking']
  },
  {
    name: 'Louisiana Foundation Directory',
    url: 'https://www.louisiananonprofits.org/',
    description: 'Louisiana-specific nonprofit resources',
    icon: MapPin,
    color: 'from-purple-500 to-pink-500',
    features: ['LA foundations', 'Local funders', 'State resources', 'Nonprofit support']
  },
  {
    name: 'Council on Foundations',
    url: 'https://www.cof.org/',
    description: 'Foundation best practices and connections',
    icon: Users,
    color: 'from-cyan-500 to-blue-500',
    features: ['Foundation news', 'Best practices', 'Networking', 'Research']
  }
];

// Suggested searches tailored for FOAM
const suggestedSearches = [
  { query: 'family foundation louisiana', label: 'Family Foundations (LA)' },
  { query: 'youth development', label: 'Youth Development' },
  { query: 'fatherhood programs', label: 'Fatherhood Programs' },
  { query: 'community foundation baton rouge', label: 'Community Foundations (BR)' },
  { query: 'children family services', label: 'Children & Family' },
  { query: 'mentorship foundation', label: 'Mentorship' },
  { query: 'human services grant', label: 'Human Services' },
  { query: 'workforce development', label: 'Workforce Development' }
];

// ============================================
// HELPER FUNCTIONS
// ============================================

const formatCurrency = (value: number) => {
  if (!value || value === 0) return 'N/A';
  if (value >= 1000000000) return `$${(value / 1000000000).toFixed(1)}B`;
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value.toLocaleString()}`;
};

const formatEIN = (ein: number | string): string => {
  const einStr = ein.toString().padStart(9, '0');
  return `${einStr.slice(0, 2)}-${einStr.slice(2)}`;
};

const getNTEEDescription = (code: string): string => {
  if (!code) return 'Unknown';
  const category = code.charAt(0).toUpperCase();
  return nteeDescriptions[category] || 'Other';
};

const calculateMatchScore = (org: ProPublicaOrg): number => {
  const nteeCode = org.ntee_code?.charAt(0) || org.raw_ntee_code?.charAt(0) || '';
  const name = org.name.toLowerCase();
  
  let score = 50;
  
  // High relevance NTEE codes for FOAM
  if (['O', 'P', 'I', 'J', 'B'].includes(nteeCode)) score += 25;
  
  // Keywords
  const highRelevance = ['father', 'family', 'youth', 'children', 'child', 'mentor', 'parent', 'community'];
  const mediumRelevance = ['education', 'social', 'human services', 'welfare', 'development', 'support'];
  
  highRelevance.forEach(kw => { if (name.includes(kw)) score += 15; });
  mediumRelevance.forEach(kw => { if (name.includes(kw)) score += 5; });
  
  // Louisiana bonus
  if (org.state === 'LA') score += 10;
  
  return Math.min(99, Math.max(20, score));
};

// ============================================
// MAIN COMPONENT
// ============================================

const FoundationResearchHub: React.FC<FoundationResearchHubProps> = ({ onBack }) => {
  // State
  const [activeTab, setActiveTab] = useState<'search' | 'verify' | 'links' | 'saved'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Foundation[]>([]);
  const [selectedFoundation, setSelectedFoundation] = useState<Foundation | null>(null);
  const [selectedOrgDetail, setSelectedOrgDetail] = useState<any | null>(null);
  const [savedFoundations, setSavedFoundations] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchSource, setSearchSource] = useState<'propublica' | 'open990' | 'all'>('propublica');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ state: '', nteeCode: '' });
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMoreResults, setHasMoreResults] = useState(true);
  const [allResults, setAllResults] = useState<Foundation[]>([]);
  
  // EIN Verification state
  const [verifyEIN, setVerifyEIN] = useState('');
  const [verifyResult, setVerifyResult] = useState<any | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // ============================================
  // API CALLS
  // ============================================

  // ProPublica Search with pagination
  const searchProPublica = async (query: string, page: number = 0): Promise<Foundation[]> => {
    const url = `${BACKEND_URL}/api/propublica/search?q=${encodeURIComponent(query)}&page=${page}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`ProPublica search failed: ${response.status}`);
    const data = await response.json();
    
    if (!data.organizations) return [];
    
    return data.organizations.map((org: ProPublicaOrg) => ({
      id: `pp-${org.ein}`,
      ein: formatEIN(org.ein),
      name: org.name,
      city: org.city || 'Unknown',
      state: org.state || 'Unknown',
      totalAssets: 0,
      totalRevenue: 0,
      totalExpenses: 0,
      fiscalYear: 0,
      nteeCode: org.ntee_code || org.raw_ntee_code || '',
      subsectionCode: org.subseccd,
      hasFilings: org.have_filings !== false,
      matchScore: calculateMatchScore(org),
      source: 'propublica' as const
    }));
  };

  // Open990 Search (via backend proxy)
  const searchOpen990 = async (query: string): Promise<Foundation[]> => {
    try {
      const url = `${BACKEND_URL}/api/open990/search?q=${encodeURIComponent(query)}`;
      const response = await fetch(url);
      if (!response.ok) {
        console.log('Open990 not available, skipping...');
        return [];
      }
      const data = await response.json();
      
      if (!data.organizations) return [];
      
      return data.organizations.map((org: any) => ({
        id: `o990-${org.ein}`,
        ein: formatEIN(org.ein),
        name: org.name,
        city: org.city || 'Unknown',
        state: org.state || 'Unknown',
        totalAssets: org.total_assets || 0,
        totalRevenue: org.total_revenue || 0,
        totalExpenses: org.total_expenses || 0,
        fiscalYear: org.tax_year || 0,
        nteeCode: org.ntee_code || '',
        subsectionCode: org.subsection || 0,
        hasFilings: true,
        matchScore: 50,
        source: 'open990' as const
      }));
    } catch (err) {
      console.log('Open990 search error:', err);
      return [];
    }
  };

  // Combined search
  const searchFoundations = async (query: string, page: number = 0, append: boolean = false) => {
    if (!query.trim()) {
      setSearchResults([]);
      setAllResults([]);
      return;
    }

    if (append) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
      setCurrentPage(0);
      setAllResults([]);
      setHasMoreResults(true);
    }
    setError(null);
    setHasSearched(true);

    try {
      let results: Foundation[] = [];
      
      if (searchSource === 'propublica' || searchSource === 'all') {
        const ppResults = await searchProPublica(query, page);
        results = [...results, ...ppResults];
        // ProPublica returns max 25, if we get less, no more results
        if (ppResults.length < 25) {
          setHasMoreResults(false);
        }
      }
      
      if (searchSource === 'open990' || searchSource === 'all') {
        const o990Results = await searchOpen990(query);
        results = [...results, ...o990Results];
      }

      // Apply filters
      if (filters.state) {
        results = results.filter(f => f.state === filters.state);
      }
      if (filters.nteeCode) {
        results = results.filter(f => f.nteeCode.startsWith(filters.nteeCode));
      }

      // Sort by match score
      results.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

      // Remove duplicates by EIN
      const seen = new Set<string>();
      if (append) {
        // Add existing results to seen set
        allResults.forEach(f => seen.add(f.ein.replace('-', '')));
      }
      results = results.filter(f => {
        const cleanEIN = f.ein.replace('-', '');
        if (seen.has(cleanEIN)) return false;
        seen.add(cleanEIN);
        return true;
      });

      if (append) {
        const newAllResults = [...allResults, ...results];
        setAllResults(newAllResults);
        setSearchResults(newAllResults);
      } else {
        setAllResults(results);
        setSearchResults(results);
      }
      
      setCurrentPage(page);
    } catch (err: any) {
      console.error('Search error:', err);
      setError(err.message || 'Failed to search. Please try again.');
      if (!append) {
        setSearchResults([]);
        setAllResults([]);
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  // Load more results
  const loadMoreResults = () => {
    if (!isLoadingMore && hasMoreResults && searchQuery) {
      searchFoundations(searchQuery, currentPage + 1, true);
    }
  };

  // Fetch org details
  const fetchOrgDetail = async (ein: string) => {
    setIsLoadingDetail(true);
    try {
      const cleanEIN = ein.replace('-', '');
      const url = `${BACKEND_URL}/api/propublica/org/${cleanEIN}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);
      const data = await response.json();

      setSelectedOrgDetail(data);

      if (data.filings_with_data?.length > 0) {
        const latestFiling = data.filings_with_data[0];
        setSelectedFoundation(prev => prev ? {
          ...prev,
          totalAssets: latestFiling.totassetsend || 0,
          totalRevenue: latestFiling.totrevenue || 0,
          totalExpenses: latestFiling.totfuncexpns || 0,
          fiscalYear: latestFiling.tax_prd_yr || 0,
          pdfUrl: latestFiling.pdf_url,
          filings: data.filings_with_data
        } : null);
      }
    } catch (err: any) {
      console.error('Detail fetch error:', err);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // Verify EIN
  const verifyOrganization = async () => {
    if (!verifyEIN.trim()) return;
    
    setIsVerifying(true);
    setVerifyResult(null);
    
    try {
      const cleanEIN = verifyEIN.replace(/[^0-9]/g, '');
      const url = `${BACKEND_URL}/api/propublica/org/${cleanEIN}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        setVerifyResult({ found: false, ein: cleanEIN });
        return;
      }
      
      const data = await response.json();
      setVerifyResult({
        found: true,
        ein: cleanEIN,
        organization: data.organization,
        filings: data.filings_with_data
      });
    } catch (err) {
      setVerifyResult({ found: false, ein: verifyEIN, error: 'Verification failed' });
    } finally {
      setIsVerifying(false);
    }
  };

  // Event handlers
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchFoundations(searchQuery);
  };

  const handleFoundationClick = (foundation: Foundation) => {
    setSelectedFoundation(foundation);
    setSelectedOrgDetail(null);
    fetchOrgDetail(foundation.ein);
  };

  const toggleSaveFoundation = (id: string) => {
    setSavedFoundations(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const savedFoundationsList = searchResults.filter(f => savedFoundations.includes(f.id));

  // Stats
  const stats = {
    count: searchResults.length,
    withFilings: searchResults.filter(f => f.hasFilings).length,
    propublica: searchResults.filter(f => f.source === 'propublica').length,
    open990: searchResults.filter(f => f.source === 'open990').length
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="h-screen flex flex-col bg-slate-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 text-white p-6 flex-shrink-0">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-lg transition-all">
                <ArrowLeft size={24} />
              </button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Layers size={28} />
                  Foundation Research Hub
                </h1>
                <p className="text-orange-100">Multi-source nonprofit research • ProPublica + Open990 + IRS Data</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-sm font-medium">
                🟢 Live Data
              </span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                {savedFoundations.length} Saved
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 flex-wrap">
            {[
              { id: 'search', label: 'Search All Sources', icon: Search },
              { id: 'verify', label: 'Verify EIN', icon: Shield },
              { id: 'links', label: 'Premium Resources', icon: ExternalLink },
              { id: 'saved', label: 'Saved List', icon: Star },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-white text-orange-700'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                  {tab.id === 'saved' && savedFoundations.length > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 bg-amber-400 text-amber-900 rounded-full text-xs">
                      {savedFoundations.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6">

          {/* ====== SEARCH TAB ====== */}
          {activeTab === 'search' && (
            <div className="space-y-6">
              {/* Search Form */}
              <form onSubmit={handleSearch} className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                <div className="flex gap-4 flex-wrap">
                  <div className="relative flex-1 min-w-64">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by name, city, or keywords..."
                      className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-800"
                    />
                  </div>
                  
                  {/* Source selector */}
                  <select
                    value={searchSource}
                    onChange={(e) => setSearchSource(e.target.value as any)}
                    className="px-4 py-3 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="propublica">ProPublica Only</option>
                    <option value="open990">Open990 Only</option>
                    <option value="all">All Sources</option>
                  </select>
                  
                  <button
                    type="submit"
                    disabled={isLoading || !searchQuery.trim()}
                    className="px-6 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-300 text-white rounded-xl font-medium flex items-center gap-2 transition-all"
                  >
                    {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
                    Search
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowFilters(!showFilters)}
                    className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${
                      showFilters ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <Filter size={18} />
                    Filters
                  </button>
                </div>

                {/* Filters */}
                {showFilters && (
                  <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
                      <select
                        value={filters.state}
                        onChange={(e) => setFilters({...filters, state: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800"
                      >
                        <option value="">All States</option>
                        <option value="LA">Louisiana</option>
                        <option value="TX">Texas</option>
                        <option value="MS">Mississippi</option>
                        <option value="AL">Alabama</option>
                        <option value="AR">Arkansas</option>
                        <option value="CA">California</option>
                        <option value="NY">New York</option>
                        <option value="FL">Florida</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Category (NTEE)</label>
                      <select
                        value={filters.nteeCode}
                        onChange={(e) => setFilters({...filters, nteeCode: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800"
                      >
                        <option value="">All Categories</option>
                        <option value="O">Youth Development</option>
                        <option value="P">Human Services</option>
                        <option value="B">Education</option>
                        <option value="T">Philanthropy & Grantmaking</option>
                        <option value="S">Community Improvement</option>
                        <option value="J">Employment</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => setFilters({ state: '', nteeCode: '' })}
                        className="px-4 py-2 text-slate-600 hover:text-slate-800"
                      >
                        Clear Filters
                      </button>
                    </div>
                  </div>
                )}
              </form>

              {/* Suggested Searches */}
              {!hasSearched && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Sparkles className="text-orange-500" size={20} />
                    Suggested Searches for FOAM
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {suggestedSearches.map((item, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setSearchQuery(item.query);
                          searchFoundations(item.query);
                        }}
                        className="px-4 py-2 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg text-sm font-medium transition-all"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                  <AlertCircle className="text-red-500" size={24} />
                  <div>
                    <p className="font-medium text-red-800">Search Error</p>
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                </div>
              )}

              {/* Stats */}
              {hasSearched && searchResults.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Building2 className="text-orange-600" size={20} />
                      </div>
                      <div>
                        <p className="text-slate-500 text-sm">Total Found</p>
                        <p className="text-xl font-bold text-slate-800">{stats.count}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Database className="text-purple-600" size={20} />
                      </div>
                      <div>
                        <p className="text-slate-500 text-sm">ProPublica</p>
                        <p className="text-xl font-bold text-purple-600">{stats.propublica}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <FileText className="text-emerald-600" size={20} />
                      </div>
                      <div>
                        <p className="text-slate-500 text-sm">With Filings</p>
                        <p className="text-xl font-bold text-emerald-600">{stats.withFilings}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                        <Star className="text-amber-600" size={20} />
                      </div>
                      <div>
                        <p className="text-slate-500 text-sm">Saved</p>
                        <p className="text-xl font-bold text-amber-600">{savedFoundations.length}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Loading */}
              {isLoading && (
                <div className="bg-white rounded-xl p-12 shadow-sm border border-slate-200 text-center">
                  <Loader2 className="animate-spin mx-auto text-orange-600 mb-4" size={48} />
                  <p className="text-slate-600 font-medium">Searching multiple databases...</p>
                  <p className="text-slate-400 text-sm">ProPublica + Open990</p>
                </div>
              )}

              {/* Results */}
              {!isLoading && hasSearched && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="p-4 border-b border-slate-200">
                    <h3 className="font-bold text-slate-800">Search Results</h3>
                    <p className="text-sm text-slate-500">Sorted by match score for FOAM • Click to view details</p>
                  </div>

                  {searchResults.length > 0 ? (
                    <div className="divide-y divide-slate-100">
                      {searchResults.map(foundation => (
                        <div
                          key={foundation.id}
                          className="p-4 hover:bg-slate-50 cursor-pointer transition-all"
                          onClick={() => handleFoundationClick(foundation)}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <h4 className="font-bold text-slate-800">{foundation.name}</h4>
                                {foundation.matchScore && foundation.matchScore >= 70 && (
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                    foundation.matchScore >= 85
                                      ? 'bg-emerald-100 text-emerald-700'
                                      : 'bg-orange-100 text-orange-700'
                                  }`}>
                                    {foundation.matchScore}% Match
                                  </span>
                                )}
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                  foundation.source === 'propublica'
                                    ? 'bg-purple-100 text-purple-700'
                                    : 'bg-blue-100 text-blue-700'
                                }`}>
                                  {foundation.source === 'propublica' ? 'ProPublica' : 'Open990'}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-slate-500 mb-2">
                                <span className="flex items-center gap-1">
                                  <MapPin size={14} />
                                  {foundation.city}, {foundation.state}
                                </span>
                                <span>EIN: {foundation.ein}</span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">
                                  {getNTEEDescription(foundation.nteeCode)}
                                </span>
                                {foundation.hasFilings && (
                                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-xs">
                                    Has 990 Filings
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleSaveFoundation(foundation.id);
                                }}
                                className={`p-2 rounded-lg transition-all ${
                                  savedFoundations.includes(foundation.id)
                                    ? 'bg-amber-100 text-amber-600'
                                    : 'bg-slate-100 text-slate-400 hover:text-slate-600'
                                }`}
                              >
                                <Star size={18} fill={savedFoundations.includes(foundation.id) ? 'currentColor' : 'none'} />
                              </button>
                              <ChevronRight className="text-slate-300" size={20} />
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {/* Load More Button */}
                      {hasMoreResults && searchResults.length >= 25 && (
                        <div className="p-4 border-t border-slate-100">
                          <button
                            onClick={loadMoreResults}
                            disabled={isLoadingMore}
                            className="w-full py-3 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-xl font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                          >
                            {isLoadingMore ? (
                              <>
                                <Loader2 className="animate-spin" size={18} />
                                Loading more...
                              </>
                            ) : (
                              <>
                                <RefreshCw size={18} />
                                Load More Results (Page {currentPage + 2})
                              </>
                            )}
                          </button>
                          <p className="text-center text-xs text-slate-400 mt-2">
                            Showing {searchResults.length} results • ProPublica returns 25 per page
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-12 text-center">
                      <Building2 className="mx-auto text-slate-300 mb-4" size={48} />
                      <p className="text-slate-500 font-medium">No organizations found</p>
                      <p className="text-slate-400 text-sm mt-1">Try different keywords or adjust filters</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ====== VERIFY TAB ====== */}
          {activeTab === 'verify' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Shield className="text-orange-600" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">Verify Nonprofit Status</h3>
                    <p className="text-sm text-slate-600">Enter an EIN to verify tax-exempt status and view details</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={verifyEIN}
                      onChange={(e) => setVerifyEIN(e.target.value)}
                      placeholder="Enter EIN (e.g., 12-3456789 or 123456789)"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-800"
                    />
                  </div>
                  <button
                    onClick={verifyOrganization}
                    disabled={isVerifying || !verifyEIN.trim()}
                    className="px-6 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-300 text-white rounded-xl font-medium flex items-center gap-2 transition-all"
                  >
                    {isVerifying ? <Loader2 className="animate-spin" size={18} /> : <Shield size={18} />}
                    Verify
                  </button>
                </div>

                {/* Verification Result */}
                {verifyResult && (
                  <div className={`mt-6 p-4 rounded-xl ${verifyResult.found ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}>
                    {verifyResult.found ? (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <CheckCircle2 className="text-emerald-600" size={24} />
                          <span className="font-bold text-emerald-800">Verified Tax-Exempt Organization</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-slate-500">Organization Name</p>
                            <p className="font-medium text-slate-800">{verifyResult.organization?.name}</p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-500">EIN</p>
                            <p className="font-medium text-slate-800">{formatEIN(verifyResult.ein)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-500">Location</p>
                            <p className="font-medium text-slate-800">
                              {verifyResult.organization?.city}, {verifyResult.organization?.state}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-500">Ruling Date</p>
                            <p className="font-medium text-slate-800">{verifyResult.organization?.ruling_date || 'N/A'}</p>
                          </div>
                        </div>
                        {verifyResult.filings?.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-emerald-200">
                            <p className="text-sm text-slate-500 mb-2">Recent Filing</p>
                            <div className="flex items-center gap-4">
                              <span className="font-medium text-slate-800">
                                {verifyResult.filings[0].tax_prd_yr} - Assets: {formatCurrency(verifyResult.filings[0].totassetsend)}
                              </span>
                              {verifyResult.filings[0].pdf_url && (
                                <a
                                  href={verifyResult.filings[0].pdf_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-orange-600 hover:text-orange-800 text-sm flex items-center gap-1"
                                >
                                  <FileText size={14} />
                                  View 990
                                </a>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <AlertCircle className="text-red-600" size={24} />
                        <span className="font-medium text-red-800">
                          No organization found with EIN: {verifyResult.ein}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Info Box */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                <h4 className="font-bold text-slate-800 mb-3">About EIN Verification</h4>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="text-blue-500 shrink-0 mt-0.5" size={16} />
                    <span>Verify that a potential funder is a legitimate tax-exempt organization</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="text-blue-500 shrink-0 mt-0.5" size={16} />
                    <span>View their most recent 990 filing and financial information</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="text-blue-500 shrink-0 mt-0.5" size={16} />
                    <span>EIN can be found on foundation websites, grant letters, or IRS records</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* ====== LINKS TAB ====== */}
          {activeTab === 'links' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center shrink-0">
                    <Globe className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">Premium Research Resources</h3>
                    <p className="text-slate-600">
                      These external platforms offer deeper research capabilities. Some require subscriptions, 
                      but many offer free tiers or library access.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {externalResources.map((resource, i) => {
                  const Icon = resource.icon;
                  return (
                    <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-all">
                      <div className={`bg-gradient-to-r ${resource.color} p-4 text-white`}>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                            <Icon size={20} />
                          </div>
                          <div>
                            <h4 className="font-bold">{resource.name}</h4>
                            <p className="text-sm text-white/80">{resource.description}</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex flex-wrap gap-2 mb-4">
                          {resource.features.map((feature, j) => (
                            <span key={j} className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs">
                              {feature}
                            </span>
                          ))}
                        </div>
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`block w-full py-3 bg-gradient-to-r ${resource.color} text-white rounded-lg font-medium text-center hover:opacity-90 transition-all`}
                        >
                          Visit {resource.name} →
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pro Tips */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Sparkles className="text-orange-500" size={20} />
                  Pro Tips for Foundation Research
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-orange-600 font-bold text-xs">1</span>
                    </div>
                    <p className="text-sm text-slate-600">
                      <strong>Start with Candid</strong> - Their free tier shows basic foundation info. 
                      Libraries often have premium access.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-orange-600 font-bold text-xs">2</span>
                    </div>
                    <p className="text-sm text-slate-600">
                      <strong>Check 990-PF Part XV</strong> - This shows actual grants made by foundations, 
                      including amounts and recipients.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-orange-600 font-bold text-xs">3</span>
                    </div>
                    <p className="text-sm text-slate-600">
                      <strong>Look for "similar organizations"</strong> - Find who funds nonprofits like FOAM, 
                      then approach those same funders.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-orange-600 font-bold text-xs">4</span>
                    </div>
                    <p className="text-sm text-slate-600">
                      <strong>Track in Grant Management</strong> - Save promising foundations and track them 
                      in your Grant Management dashboard.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ====== SAVED TAB ====== */}
          {activeTab === 'saved' && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-800">
                  Saved Organizations ({savedFoundations.length})
                </h3>
              </div>

              {savedFoundationsList.length > 0 ? (
                <div className="space-y-4">
                  {savedFoundationsList.map(foundation => (
                    <div
                      key={foundation.id}
                      className="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-orange-300 transition-all cursor-pointer"
                      onClick={() => handleFoundationClick(foundation)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-slate-800">{foundation.name}</h4>
                          <p className="text-sm text-slate-500">
                            {foundation.city}, {foundation.state} • EIN: {foundation.ein}
                          </p>
                          <div className="flex gap-2 mt-2">
                            <span className="px-2 py-0.5 bg-slate-200 text-slate-600 rounded text-xs">
                              {getNTEEDescription(foundation.nteeCode)}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-xs ${
                              foundation.source === 'propublica'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}>
                              {foundation.source === 'propublica' ? 'ProPublica' : 'Open990'}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSaveFoundation(foundation.id);
                          }}
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Star className="mx-auto text-slate-300 mb-4" size={48} />
                  <p className="text-slate-500 font-medium">No saved organizations yet</p>
                  <p className="text-sm text-slate-400 mt-1">Click the star icon on any organization to save it</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ====== DETAIL MODAL ====== */}
      {selectedFoundation && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => {
            setSelectedFoundation(null);
            setSelectedOrgDetail(null);
          }}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-orange-600 to-red-600 p-6 rounded-t-2xl text-white relative">
              <button
                onClick={() => {
                  setSelectedFoundation(null);
                  setSelectedOrgDetail(null);
                }}
                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-all"
              >
                <X size={20} />
              </button>
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-xl font-bold pr-10">{selectedFoundation.name}</h2>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  selectedFoundation.source === 'propublica'
                    ? 'bg-white/20 text-white'
                    : 'bg-blue-400/30 text-white'
                }`}>
                  {selectedFoundation.source === 'propublica' ? 'ProPublica' : 'Open990'}
                </span>
              </div>
              <p className="text-orange-100">EIN: {selectedFoundation.ein}</p>
            </div>

            <div className="p-6 space-y-4">
              {isLoadingDetail ? (
                <div className="text-center py-8">
                  <Loader2 className="animate-spin mx-auto text-orange-600 mb-4" size={32} />
                  <p className="text-slate-500">Loading organization details...</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-slate-600">
                    <MapPin size={18} />
                    <span>
                      {selectedOrgDetail?.organization?.address && `${selectedOrgDetail.organization.address}, `}
                      {selectedFoundation.city}, {selectedFoundation.state}
                      {selectedOrgDetail?.organization?.zipcode && ` ${selectedOrgDetail.organization.zipcode}`}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 rounded-xl p-4">
                      <p className="text-sm text-slate-500">Total Assets</p>
                      <p className="text-xl font-bold text-slate-800">
                        {formatCurrency(selectedFoundation.totalAssets)}
                      </p>
                    </div>
                    <div className="bg-emerald-50 rounded-xl p-4">
                      <p className="text-sm text-emerald-600">Total Revenue</p>
                      <p className="text-xl font-bold text-emerald-700">
                        {formatCurrency(selectedFoundation.totalRevenue)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 rounded-xl p-4">
                      <p className="text-sm text-slate-500">Total Expenses</p>
                      <p className="text-xl font-bold text-slate-800">
                        {formatCurrency(selectedFoundation.totalExpenses)}
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4">
                      <p className="text-sm text-slate-500">Fiscal Year</p>
                      <p className="text-xl font-bold text-slate-800">
                        {selectedFoundation.fiscalYear || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-sm text-slate-500 mb-2">Category</p>
                    <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                      {getNTEEDescription(selectedFoundation.nteeCode)}
                    </span>
                    {selectedFoundation.nteeCode && (
                      <span className="ml-2 text-xs text-slate-400">
                        NTEE Code: {selectedFoundation.nteeCode}
                      </span>
                    )}
                  </div>

                  {/* Recent Filings */}
                  {selectedFoundation.filings && selectedFoundation.filings.length > 0 && (
                    <div className="bg-slate-50 rounded-xl p-4">
                      <p className="text-sm text-slate-500 mb-3">Recent 990 Filings</p>
                      <div className="space-y-2">
                        {selectedFoundation.filings.slice(0, 5).map((filing, i) => (
                          <div key={i} className="flex items-center justify-between p-2 bg-white rounded-lg">
                            <span className="text-sm text-slate-700">
                              {filing.tax_prd_yr} - Form {filing.formtype === 0 ? '990' : filing.formtype === 1 ? '990EZ' : '990PF'}
                            </span>
                            {filing.pdf_url && (
                              <a
                                href={filing.pdf_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-orange-600 hover:text-orange-800 text-sm flex items-center gap-1"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <FileText size={14} />
                                View PDF
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => toggleSaveFoundation(selectedFoundation.id)}
                      className={`flex-1 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${
                        savedFoundations.includes(selectedFoundation.id)
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <Star size={18} fill={savedFoundations.includes(selectedFoundation.id) ? 'currentColor' : 'none'} />
                      {savedFoundations.includes(selectedFoundation.id) ? 'Saved' : 'Save Organization'}
                    </button>
                    <a
                      href={`https://projects.propublica.org/nonprofits/organizations/${selectedFoundation.ein.replace('-', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-all"
                    >
                      <ExternalLink size={18} />
                      View on ProPublica
                    </a>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FoundationResearchHub;
