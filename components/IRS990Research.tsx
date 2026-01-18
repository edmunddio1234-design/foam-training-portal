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
  Loader2
} from 'lucide-react';

// Interface for ProPublica API response
interface ProPublicaOrg {
  ein: number;
  name: string;
  city: string;
  state: string;
  ntee_code: string;
  raw_ntee_code: string;
  subseccd: number;
  has_subseccd: boolean;
  have_filings: boolean;
  have_extracts: boolean;
  have_pdfs: boolean;
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
  pct_compnsatncurrofcr: number;
}

interface ProPublicaOrgDetail {
  organization: {
    id: number;
    ein: number;
    name: string;
    careofname: string | null;
    address: string;
    city: string;
    state: string;
    zipcode: string;
    exemption_number: number;
    subsection_code: number;
    affiliation_code: number;
    classification_codes: string;
    ruling_date: string;
    deductibility_code: number;
    foundation_code: number;
    activity_codes: string;
    organization_code: number;
    exempt_organization_status_code: number;
    tax_period: string;
    asset_code: number;
    income_code: number;
    filing_requirement_code: number;
    pf_filing_requirement_code: number;
    accounting_period: number;
    asset_amount: number;
    income_amount: number;
    revenue_amount: number;
    ntee_code: string;
    sort_name: string;
    created_at: string;
    updated_at: string;
    data_source: string;
    have_extracts: boolean;
    have_pdfs: boolean;
  };
  filings_with_data: ProPublicaFiling[];
  filings_without_data: any[];
}

// Interface for our app's foundation format
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
}

interface IRS990ResearchProps {
  onBack: () => void;
}

// NTEE Code descriptions for better display
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

// Calculate match score based on FOAM's focus areas
const calculateMatchScore = (org: ProPublicaOrg): number => {
  const nteeCode = org.ntee_code?.charAt(0) || org.raw_ntee_code?.charAt(0) || '';
  const name = org.name.toLowerCase();
  
  let score = 50; // Base score
  
  // High relevance NTEE codes for FOAM (fatherhood, family, youth)
  if (['O', 'P', 'I', 'J', 'B'].includes(nteeCode)) {
    score += 25;
  }
  
  // Keywords that indicate high relevance
  const highRelevanceKeywords = ['father', 'family', 'youth', 'children', 'child', 'mentor', 'parent', 'community'];
  const mediumRelevanceKeywords = ['education', 'social', 'human services', 'welfare', 'development', 'support'];
  
  highRelevanceKeywords.forEach(keyword => {
    if (name.includes(keyword)) score += 15;
  });
  
  mediumRelevanceKeywords.forEach(keyword => {
    if (name.includes(keyword)) score += 5;
  });
  
  // California bonus (FOAM is in LA)
  if (org.state === 'CA') score += 5;
  
  // Cap at 99
  return Math.min(99, Math.max(20, score));
};

const IRS990Research: React.FC<IRS990ResearchProps> = ({ onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Foundation[]>([]);
  const [selectedFoundation, setSelectedFoundation] = useState<Foundation | null>(null);
  const [selectedOrgDetail, setSelectedOrgDetail] = useState<ProPublicaOrgDetail | null>(null);
  const [savedFoundations, setSavedFoundations] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'search' | 'saved' | 'ai'>('search');
  const [aiPrompt, setAiPrompt] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [filters, setFilters] = useState({
    state: '',
    nteeCode: ''
  });

  // Suggested searches for FOAM
  const suggestedSearches = [
    'family foundation california',
    'youth development los angeles',
    'fatherhood programs',
    'children family services',
    'community foundation california',
    'mentorship programs',
    'human services foundation',
    'education foundation los angeles'
  ];

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

  // Search ProPublica API
  const searchFoundations = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      // ProPublica Nonprofit Explorer API
      const response = await fetch(
        `https://projects.propublica.org/nonprofits/api/v2/search.json?q=${encodeURIComponent(query)}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch from ProPublica API');
      }

      const data = await response.json();
      
      if (data.organizations && data.organizations.length > 0) {
        // Transform and filter results
        let foundations: Foundation[] = data.organizations
          .filter((org: ProPublicaOrg) => org.have_filings) // Only orgs with filings
          .map((org: ProPublicaOrg) => ({
            id: org.ein.toString(),
            ein: formatEIN(org.ein),
            name: org.name,
            city: org.city || 'Unknown',
            state: org.state || 'Unknown',
            totalAssets: 0, // Will be fetched on detail view
            totalRevenue: 0,
            totalExpenses: 0,
            fiscalYear: 0,
            nteeCode: org.ntee_code || org.raw_ntee_code || '',
            subsectionCode: org.subseccd,
            hasFilings: org.have_filings,
            matchScore: calculateMatchScore(org)
          }));

        // Apply filters
        if (filters.state) {
          foundations = foundations.filter(f => f.state === filters.state);
        }
        if (filters.nteeCode) {
          foundations = foundations.filter(f => f.nteeCode.startsWith(filters.nteeCode));
        }

        // Sort by match score
        foundations.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

        setSearchResults(foundations.slice(0, 50)); // Limit to 50 results
      } else {
        setSearchResults([]);
      }
    } catch (err: any) {
      console.error('Search error:', err);
      setError(err.message || 'Failed to search. Please try again.');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch detailed organization info
  const fetchOrgDetail = async (ein: string) => {
    setIsLoadingDetail(true);
    try {
      const cleanEIN = ein.replace('-', '');
      const response = await fetch(
        `https://projects.propublica.org/nonprofits/api/v2/organizations/${cleanEIN}.json`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch organization details');
      }

      const data: ProPublicaOrgDetail = await response.json();
      setSelectedOrgDetail(data);

      // Update the selected foundation with real data
      if (data.filings_with_data && data.filings_with_data.length > 0) {
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

  // Handle foundation click
  const handleFoundationClick = (foundation: Foundation) => {
    setSelectedFoundation(foundation);
    setSelectedOrgDetail(null);
    fetchOrgDetail(foundation.ein);
  };

  // Handle search submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchFoundations(searchQuery);
  };

  // Handle suggested search click
  const handleSuggestedSearch = (query: string) => {
    setSearchQuery(query);
    searchFoundations(query);
  };

  const toggleSaveFoundation = (id: string) => {
    setSavedFoundations(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const savedFoundationsList = searchResults.filter(f => savedFoundations.includes(f.id));

  // Stats for current results
  const stats = {
    count: searchResults.length,
    totalAssets: searchResults.reduce((sum, f) => sum + f.totalAssets, 0),
    withFilings: searchResults.filter(f => f.hasFilings).length
  };

  return (
    <div className="h-screen flex flex-col bg-slate-100 overflow-hidden">
      {/* Header - Fixed */}
      <div className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white p-6 flex-shrink-0">
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
                <h1 className="text-2xl font-bold">IRS 990 Research Portal</h1>
                <p className="text-purple-200">Search 1.8M+ nonprofit filings • Powered by ProPublica API</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-sm font-medium">
                🟢 Live API
              </span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                {savedFoundations.length} Saved
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            {[
              { id: 'search', label: 'Search Foundations', icon: Search },
              { id: 'saved', label: 'Saved List', icon: Star },
              { id: 'ai', label: 'AI Assistant', icon: Sparkles },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'search' | 'saved' | 'ai')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-white text-purple-800'
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

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6">
          {/* Search Tab */}
          {activeTab === 'search' && (
            <div className="space-y-6">
              {/* Search Bar */}
              <form onSubmit={handleSearch} className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by name, city, or keywords (e.g., 'family foundation california')..."
                      className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading || !searchQuery.trim()}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white rounded-xl font-medium flex items-center gap-2 transition-all"
                  >
                    {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
                    Search
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowFilters(!showFilters)}
                    className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${
                      showFilters ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <Filter size={18} />
                    Filters
                  </button>
                </div>

                {/* Filter Panel */}
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
                        <option value="CA">California</option>
                        <option value="NY">New York</option>
                        <option value="TX">Texas</option>
                        <option value="FL">Florida</option>
                        <option value="IL">Illinois</option>
                        <option value="PA">Pennsylvania</option>
                        <option value="OH">Ohio</option>
                        <option value="GA">Georgia</option>
                        <option value="NC">North Carolina</option>
                        <option value="MI">Michigan</option>
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
                        <option value="E">Health Care</option>
                        <option value="T">Philanthropy & Grantmaking</option>
                        <option value="S">Community Improvement</option>
                        <option value="J">Employment</option>
                        <option value="L">Housing & Shelter</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => setFilters({ state: '', nteeCode: '' })}
                        className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-all"
                      >
                        Clear Filters
                      </button>
                    </div>
                  </div>
                )}
              </form>

              {/* Suggested Searches - Show when no search yet */}
              {!hasSearched && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Sparkles className="text-purple-500" size={20} />
                    Suggested Searches for FOAM
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {suggestedSearches.map((query, i) => (
                      <button
                        key={i}
                        onClick={() => handleSuggestedSearch(query)}
                        className="px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-sm font-medium transition-all"
                      >
                        {query}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                  <AlertCircle className="text-red-500" size={24} />
                  <div>
                    <p className="font-medium text-red-800">Search Error</p>
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                </div>
              )}

              {/* Stats Row - Show when has results */}
              {hasSearched && searchResults.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Building2 className="text-purple-600" size={20} />
                      </div>
                      <div>
                        <p className="text-slate-500 text-sm">Organizations Found</p>
                        <p className="text-xl font-bold text-slate-800">{stats.count}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <FileText className="text-emerald-600" size={20} />
                      </div>
                      <div>
                        <p className="text-slate-500 text-sm">With 990 Filings</p>
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

              {/* Loading State */}
              {isLoading && (
                <div className="bg-white rounded-xl p-12 shadow-sm border border-slate-200 text-center">
                  <Loader2 className="animate-spin mx-auto text-purple-600 mb-4" size={48} />
                  <p className="text-slate-600 font-medium">Searching ProPublica database...</p>
                  <p className="text-slate-400 text-sm">This may take a moment</p>
                </div>
              )}

              {/* Search Results */}
              {!isLoading && hasSearched && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="p-4 border-b border-slate-200">
                    <h3 className="font-bold text-slate-800">Search Results</h3>
                    <p className="text-sm text-slate-500">Sorted by AI match score for FOAM • Click to view details</p>
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
                                      : 'bg-purple-100 text-purple-700'
                                  }`}>
                                    {foundation.matchScore}% Match
                                  </span>
                                )}
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
                    </div>
                  ) : (
                    <div className="p-12 text-center">
                      <Building2 className="mx-auto text-slate-300 mb-4" size={48} />
                      <p className="text-slate-500 font-medium">No organizations found</p>
                      <p className="text-slate-400 text-sm mt-1">Try different keywords or adjust your filters</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Saved Tab */}
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
                      className="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-purple-300 transition-all cursor-pointer"
                      onClick={() => handleFoundationClick(foundation)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-slate-800">{foundation.name}</h4>
                          <p className="text-sm text-slate-500">{foundation.city}, {foundation.state} • EIN: {foundation.ein}</p>
                          <span className="inline-block mt-2 px-2 py-0.5 bg-slate-200 text-slate-600 rounded text-xs">
                            {getNTEEDescription(foundation.nteeCode)}
                          </span>
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

          {/* AI Assistant Tab */}
          {activeTab === 'ai' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
                    <Sparkles className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">AI Search Assistant</h3>
                    <p className="text-sm text-slate-600">Describe what you're looking for in plain language</p>
                  </div>
                </div>

                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Example: Find foundations in California that fund youth development and family support programs, especially those focused on fatherhood initiatives..."
                  className="w-full p-4 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 min-h-32 resize-none"
                />

                <button
                  onClick={() => {
                    // Extract keywords and search
                    const keywords = aiPrompt.toLowerCase();
                    let searchTerms = '';
                    if (keywords.includes('california') || keywords.includes('ca')) searchTerms += 'california ';
                    if (keywords.includes('youth')) searchTerms += 'youth ';
                    if (keywords.includes('family')) searchTerms += 'family ';
                    if (keywords.includes('father')) searchTerms += 'fatherhood ';
                    if (keywords.includes('education')) searchTerms += 'education ';
                    if (keywords.includes('foundation')) searchTerms += 'foundation ';
                    if (keywords.includes('community')) searchTerms += 'community ';
                    
                    if (searchTerms.trim()) {
                      setSearchQuery(searchTerms.trim());
                      searchFoundations(searchTerms.trim());
                      setActiveTab('search');
                    }
                  }}
                  disabled={!aiPrompt.trim() || isLoading}
                  className="w-full mt-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-all"
                >
                  <Sparkles size={18} />
                  Search with AI
                </button>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <h4 className="font-bold text-slate-800 mb-4">Quick Searches for FOAM</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    'Foundations funding fatherhood programs',
                    'Family support services California',
                    'Youth mentorship foundations',
                    'Community development Los Angeles',
                    'Human services grantmakers',
                    'Child welfare foundations'
                  ].map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setSearchQuery(prompt);
                        searchFoundations(prompt);
                        setActiveTab('search');
                      }}
                      className="p-3 text-left bg-slate-50 hover:bg-purple-50 rounded-lg text-sm text-slate-700 border border-slate-200 transition-all"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Foundation Detail Modal */}
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
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 rounded-t-2xl text-white relative">
              <button
                onClick={() => {
                  setSelectedFoundation(null);
                  setSelectedOrgDetail(null);
                }}
                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-all"
              >
                <X size={20} />
              </button>
              <h2 className="text-xl font-bold pr-10">{selectedFoundation.name}</h2>
              <p className="text-purple-200">EIN: {selectedFoundation.ein}</p>
            </div>

            <div className="p-6 space-y-4">
              {isLoadingDetail ? (
                <div className="text-center py-8">
                  <Loader2 className="animate-spin mx-auto text-purple-600 mb-4" size={32} />
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
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
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
                                className="text-purple-600 hover:text-purple-800 text-sm flex items-center gap-1"
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
                      className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-all"
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

export default IRS990Research;
