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
  X
} from 'lucide-react';

interface Foundation {
  id: string;
  name: string;
  ein: string;
  city: string;
  state: string;
  totalAssets: number;
  totalGiving: number;
  fiscalYear: number;
  grantCount: number;
  avgGrantSize: number;
  topRecipientTypes: string[];
  matchScore?: number;
  website?: string;
  contactEmail?: string;
}

interface IRS990ResearchProps {
  onBack: () => void;
}

// Mock data for demonstration - replace with real API calls to ProPublica
const mockFoundations: Foundation[] = [
  {
    id: '1',
    name: 'The California Community Foundation',
    ein: '95-3510055',
    city: 'Los Angeles',
    state: 'CA',
    totalAssets: 1850000000,
    totalGiving: 285000000,
    fiscalYear: 2023,
    grantCount: 4250,
    avgGrantSize: 67059,
    topRecipientTypes: ['Youth Development', 'Education', 'Community Development'],
    matchScore: 94,
    website: 'https://www.calfund.org',
    contactEmail: 'info@calfund.org'
  },
  {
    id: '2',
    name: 'The Ahmanson Foundation',
    ein: '95-6006137',
    city: 'Los Angeles',
    state: 'CA',
    totalAssets: 1200000000,
    totalGiving: 45000000,
    fiscalYear: 2023,
    grantCount: 320,
    avgGrantSize: 140625,
    topRecipientTypes: ['Arts & Culture', 'Education', 'Human Services'],
    matchScore: 87,
    website: 'https://theahmansonfoundation.org'
  },
  {
    id: '3',
    name: 'The Ralph M. Parsons Foundation',
    ein: '95-6062034',
    city: 'Los Angeles',
    state: 'CA',
    totalAssets: 450000000,
    totalGiving: 18500000,
    fiscalYear: 2023,
    grantCount: 185,
    avgGrantSize: 100000,
    topRecipientTypes: ['Higher Education', 'Human Services', 'Civic Affairs'],
    matchScore: 82
  },
  {
    id: '4',
    name: 'The Weingart Foundation',
    ein: '95-6054814',
    city: 'Los Angeles',
    state: 'CA',
    totalAssets: 850000000,
    totalGiving: 35000000,
    fiscalYear: 2023,
    grantCount: 275,
    avgGrantSize: 127273,
    topRecipientTypes: ['Human Services', 'Health', 'Education'],
    matchScore: 79
  },
  {
    id: '5',
    name: 'The Annenberg Foundation',
    ein: '23-7016756',
    city: 'Los Angeles',
    state: 'CA',
    totalAssets: 2500000000,
    totalGiving: 120000000,
    fiscalYear: 2023,
    grantCount: 450,
    avgGrantSize: 266667,
    topRecipientTypes: ['Education', 'Arts & Culture', 'Environment'],
    matchScore: 75
  },
  {
    id: '6',
    name: 'The James Irvine Foundation',
    ein: '94-1242365',
    city: 'San Francisco',
    state: 'CA',
    totalAssets: 2100000000,
    totalGiving: 95000000,
    fiscalYear: 2023,
    grantCount: 380,
    avgGrantSize: 250000,
    topRecipientTypes: ['Workforce Development', 'Youth Development', 'Democracy'],
    matchScore: 91
  },
  {
    id: '7',
    name: 'The California Wellness Foundation',
    ein: '95-4384848',
    city: 'Los Angeles',
    state: 'CA',
    totalAssets: 950000000,
    totalGiving: 42000000,
    fiscalYear: 2023,
    grantCount: 295,
    avgGrantSize: 142373,
    topRecipientTypes: ['Health', 'Mental Health', 'Community Health'],
    matchScore: 73
  },
  {
    id: '8',
    name: 'First 5 LA',
    ein: '95-4781598',
    city: 'Los Angeles',
    state: 'CA',
    totalAssets: 680000000,
    totalGiving: 155000000,
    fiscalYear: 2023,
    grantCount: 520,
    avgGrantSize: 298077,
    topRecipientTypes: ['Early Childhood', 'Family Support', 'Health'],
    matchScore: 96
  }
];

const IRS990Research: React.FC<IRS990ResearchProps> = ({ onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFoundation, setSelectedFoundation] = useState<Foundation | null>(null);
  const [savedFoundations, setSavedFoundations] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'search' | 'saved' | 'ai'>('search');
  const [aiPrompt, setAiPrompt] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    minGiving: '',
    maxGiving: '',
    state: '',
    focusArea: ''
  });

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) {
      return `$${(value / 1000000000).toFixed(1)}B`;
    } else if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toLocaleString()}`;
  };

  const toggleSaveFoundation = (id: string) => {
    setSavedFoundations(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const filteredFoundations = mockFoundations.filter(f => {
    const matchesSearch = 
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.topRecipientTypes.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesMinGiving = !filters.minGiving || f.totalGiving >= parseInt(filters.minGiving);
    const matchesMaxGiving = !filters.maxGiving || f.totalGiving <= parseInt(filters.maxGiving);
    const matchesState = !filters.state || f.state.toLowerCase() === filters.state.toLowerCase();
    const matchesFocusArea = !filters.focusArea || 
      f.topRecipientTypes.some(t => t.toLowerCase().includes(filters.focusArea.toLowerCase()));

    return matchesSearch && matchesMinGiving && matchesMaxGiving && matchesState && matchesFocusArea;
  });

  const savedFoundationsList = mockFoundations.filter(f => savedFoundations.includes(f.id));

  const handleAISearch = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setActiveTab('search');
    }, 2000);
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
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search foundations by name, location, or focus area..."
                    className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800"
                  />
                </div>
                <button 
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
                <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Min Giving</label>
                    <select
                      value={filters.minGiving}
                      onChange={(e) => setFilters({...filters, minGiving: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800"
                    >
                      <option value="">Any</option>
                      <option value="1000000">$1M+</option>
                      <option value="10000000">$10M+</option>
                      <option value="50000000">$50M+</option>
                      <option value="100000000">$100M+</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Max Giving</label>
                    <select
                      value={filters.maxGiving}
                      onChange={(e) => setFilters({...filters, maxGiving: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800"
                    >
                      <option value="">Any</option>
                      <option value="10000000">Up to $10M</option>
                      <option value="50000000">Up to $50M</option>
                      <option value="100000000">Up to $100M</option>
                      <option value="500000000">Up to $500M</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
                    <select
                      value={filters.state}
                      onChange={(e) => setFilters({...filters, state: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800"
                    >
                      <option value="">Any State</option>
                      <option value="CA">California</option>
                      <option value="NY">New York</option>
                      <option value="TX">Texas</option>
                      <option value="FL">Florida</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Focus Area</label>
                    <select
                      value={filters.focusArea}
                      onChange={(e) => setFilters({...filters, focusArea: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800"
                    >
                      <option value="">Any Focus</option>
                      <option value="Youth">Youth Development</option>
                      <option value="Education">Education</option>
                      <option value="Health">Health</option>
                      <option value="Human Services">Human Services</option>
                      <option value="Family">Family Support</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Building2 className="text-purple-600" size={20} />
                  </div>
                  <div>
                    <p className="text-slate-500 text-sm">Foundations Found</p>
                    <p className="text-xl font-bold text-slate-800">{filteredFoundations.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="text-emerald-600" size={20} />
                  </div>
                  <div>
                    <p className="text-slate-500 text-sm">Total Giving</p>
                    <p className="text-xl font-bold text-emerald-600">
                      {formatCurrency(filteredFoundations.reduce((sum, f) => sum + f.totalGiving, 0))}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <p className="text-slate-500 text-sm">Total Grants</p>
                    <p className="text-xl font-bold text-slate-800">
                      {filteredFoundations.reduce((sum, f) => sum + f.grantCount, 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="text-amber-600" size={20} />
                  </div>
                  <div>
                    <p className="text-slate-500 text-sm">Avg Grant Size</p>
                    <p className="text-xl font-bold text-slate-800">
                      {formatCurrency(
                        filteredFoundations.length > 0 
                          ? filteredFoundations.reduce((sum, f) => sum + f.avgGrantSize, 0) / filteredFoundations.length 
                          : 0
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-200">
                <h3 className="font-bold text-slate-800">Search Results</h3>
                <p className="text-sm text-slate-500">Sorted by AI match score for FOAM</p>
              </div>
              {filteredFoundations.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {filteredFoundations.map(foundation => (
                    <div
                      key={foundation.id}
                      className="p-4 hover:bg-slate-50 cursor-pointer transition-all"
                      onClick={() => setSelectedFoundation(foundation)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-slate-800">{foundation.name}</h4>
                            {foundation.matchScore && (
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                foundation.matchScore >= 90 
                                  ? 'bg-emerald-100 text-emerald-700' 
                                  : foundation.matchScore >= 80 
                                    ? 'bg-purple-100 text-purple-700'
                                    : 'bg-slate-100 text-slate-600'
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
                            <span>FY {foundation.fiscalYear}</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {foundation.topRecipientTypes.map((type, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs"
                              >
                                {type}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-slate-500">Annual Giving</p>
                          <p className="text-lg font-bold text-emerald-600">{formatCurrency(foundation.totalGiving)}</p>
                          <p className="text-xs text-slate-400">{foundation.grantCount.toLocaleString()} grants</p>
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
                  <p className="text-slate-500">No foundations found matching your criteria</p>
                  <p className="text-sm text-slate-400">Try adjusting your search or filters</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Saved Tab */}
        {activeTab === 'saved' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-800">Saved Foundations ({savedFoundations.length})</h3>
                {savedFoundations.length > 0 && (
                  <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium">
                    Export List
                  </button>
                )}
              </div>
              {savedFoundationsList.length > 0 ? (
                <div className="space-y-4">
                  {savedFoundationsList.map(foundation => (
                    <div 
                      key={foundation.id} 
                      className="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-purple-300 transition-all cursor-pointer"
                      onClick={() => setSelectedFoundation(foundation)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-slate-800">{foundation.name}</h4>
                          <p className="text-sm text-slate-500">{foundation.city}, {foundation.state} • EIN: {foundation.ein}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <p className="text-sm text-emerald-600 font-medium">
                              {formatCurrency(foundation.totalGiving)} annual giving
                            </p>
                            <p className="text-sm text-slate-500">
                              {foundation.grantCount} grants • Avg {formatCurrency(foundation.avgGrantSize)}
                            </p>
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
                  <p className="text-slate-500">No saved foundations yet</p>
                  <p className="text-sm text-slate-400">Click the star icon on any foundation to save it</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* AI Tab */}
        {activeTab === 'ai' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">AI Foundation Finder</h3>
                  <p className="text-sm text-slate-600">Describe what you're looking for and I'll find matching foundations</p>
                </div>
              </div>
              <div className="space-y-4">
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Example: Find foundations in California that fund youth development programs, particularly those focused on fatherhood initiatives and family strengthening..."
                  className="w-full p-4 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 min-h-32 resize-none"
                />
                <button
                  onClick={handleAISearch}
                  disabled={!aiPrompt.trim() || isLoading}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-all"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="animate-spin" size={18} />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      Find Matching Foundations
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <h4 className="font-bold text-slate-800 mb-4">Quick Prompts for FOAM</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  'Foundations funding fatherhood programs in Los Angeles County',
                  'Family foundations with grants over $50K for youth services',
                  'Foundations that funded similar nonprofits to FOAM in the last 3 years',
                  'Corporate foundations supporting workforce development and job training',
                  'Foundations focused on early childhood and family strengthening',
                  'Government and public foundations funding community development'
                ].map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => setAiPrompt(prompt)}
                    className="p-3 text-left bg-slate-50 hover:bg-purple-50 hover:border-purple-200 rounded-lg text-sm text-slate-700 border border-slate-200 transition-all"
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
          onClick={() => setSelectedFoundation(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 rounded-t-2xl text-white relative">
              <button
                onClick={() => setSelectedFoundation(null)}
                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-all"
              >
                <X size={20} />
              </button>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold">{selectedFoundation.name}</h2>
                {selectedFoundation.matchScore && (
                  <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
                    {selectedFoundation.matchScore}% Match
                  </span>
                )}
              </div>
              <p className="text-purple-200">EIN: {selectedFoundation.ein} • FY {selectedFoundation.fiscalYear}</p>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-slate-600">
                <MapPin size={18} />
                <span>{selectedFoundation.city}, {selectedFoundation.state}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <p className="text-sm text-slate-500">Total Assets</p>
                  <p className="text-xl font-bold text-slate-800">{formatCurrency(selectedFoundation.totalAssets)}</p>
                </div>
                <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                  <p className="text-sm text-emerald-600">Annual Giving</p>
                  <p className="text-xl font-bold text-emerald-700">{formatCurrency(selectedFoundation.totalGiving)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <p className="text-sm text-slate-500">Total Grants</p>
                  <p className="text-xl font-bold text-slate-800">{selectedFoundation.grantCount.toLocaleString()}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <p className="text-sm text-slate-500">Avg Grant Size</p>
                  <p className="text-xl font-bold text-slate-800">{formatCurrency(selectedFoundation.avgGrantSize)}</p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <p className="text-sm text-slate-500 mb-2">Focus Areas</p>
                <div className="flex flex-wrap gap-2">
                  {selectedFoundation.topRecipientTypes.map((type, idx) => (
                    <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                      {type}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => toggleSaveFoundation(selectedFoundation.id)}
                  className={`flex-1 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${
                    savedFoundations.includes(selectedFoundation.id)
                      ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Star size={18} fill={savedFoundations.includes(selectedFoundation.id) ? 'currentColor' : 'none'} />
                  {savedFoundations.includes(selectedFoundation.id) ? 'Saved' : 'Save Foundation'}
                </button>
                {selectedFoundation.website && (
                  <a
                    href={selectedFoundation.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-all"
                  >
                    <ExternalLink size={18} />
                    Visit Website
                  </a>
                )}
              </div>

              <div className="text-center pt-2">
                <a
                  href={`https://projects.propublica.org/nonprofits/organizations/${selectedFoundation.ein.replace('-', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-slate-500 hover:text-purple-600 flex items-center justify-center gap-1"
                >
                  <FileText size={14} />
                  View Full 990 on ProPublica
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IRS990Research;
