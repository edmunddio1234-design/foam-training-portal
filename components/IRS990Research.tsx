import React, { useState } from 'react';
import { ArrowLeft, Search, Building2, DollarSign, MapPin, FileText, ExternalLink, Star, Filter, TrendingUp, Sparkles, ChevronRight, RefreshCw } from 'lucide-react';

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
}

interface IRS990ResearchProps {
    onBack: () => void;
}

const mockFoundations: Foundation[] = [
  { id: '1', name: 'The California Community Foundation', ein: '95-3510055', city: 'Los Angeles', state: 'CA', totalAssets: 1850000000, totalGiving: 285000000, fiscalYear: 2023, grantCount: 4250, avgGrantSize: 67059, topRecipientTypes: ['Youth Development', 'Education', 'Community Development'], matchScore: 94, website: 'https://www.calfund.org' },
  { id: '2', name: 'The Ahmanson Foundation', ein: '95-6006137', city: 'Los Angeles', state: 'CA', totalAssets: 1200000000, totalGiving: 45000000, fiscalYear: 2023, grantCount: 320, avgGrantSize: 140625, topRecipientTypes: ['Arts & Culture', 'Education', 'Human Services'], matchScore: 87 },
  { id: '3', name: 'The Ralph M. Parsons Foundation', ein: '95-6062034', city: 'Los Angeles', state: 'CA', totalAssets: 450000000, totalGiving: 18500000, fiscalYear: 2023, grantCount: 185, avgGrantSize: 100000, topRecipientTypes: ['Higher Education', 'Human Services', 'Civic Affairs'], matchScore: 82 },
  { id: '4', name: 'The Weingart Foundation', ein: '95-6054814', city: 'Los Angeles', state: 'CA', totalAssets: 850000000, totalGiving: 35000000, fiscalYear: 2023, grantCount: 275, avgGrantSize: 127273, topRecipientTypes: ['Human Services', 'Health', 'Education'], matchScore: 79 },
  { id: '5', name: 'The Annenberg Foundation', ein: '23-7016756', city: 'Los Angeles', state: 'CA', totalAssets: 2500000000, totalGiving: 120000000, fiscalYear: 2023, grantCount: 450, avgGrantSize: 266667, topRecipientTypes: ['Education', 'Arts & Culture', 'Environment'], matchScore: 75 }
  ];

const IRS990Research: React.FC<IRS990ResearchProps> = ({ onBack }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFoundation, setSelectedFoundation] = useState<Foundation | null>(null);
    const [savedFoundations, setSavedFoundations] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState<'search' | 'saved' | 'ai'>('search');
    const [aiPrompt, setAiPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const formatCurrency = (value: number) => {
          if (value >= 1000000000) return '$' + (value / 1000000000).toFixed(1) + 'B';
          if (value >= 1000000) return '$' + (value / 1000000).toFixed(1) + 'M';
          if (value >= 1000) return '$' + (value / 1000).toFixed(0) + 'K';
          return '$' + value.toLocaleString();
    };

    const toggleSave = (id: string) => {
          setSavedFoundations(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
    };

    const filtered = mockFoundations.filter(f =>
          f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.topRecipientTypes.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
                                              );

    return (
          <div className="min-h-screen bg-slate-100">
                <div className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white p-6">
                        <div className="max-w-7xl mx-auto">
                                  <div className="flex items-center justify-between mb-4">
                                              <div className="flex items-center gap-4">
                                                            <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-lg transition-all"><ArrowLeft size={24} /></button>button>
                                                            <div>
                                                                            <h1 className="text-2xl font-bold">IRS 990 Research Portal</h1>h1>
                                                                            <p className="text-purple-200">Search 1.8M+ nonprofit filings from ProPublica API</p>p>
                                                            </div>div>
                                              </div>div>
                                              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">{savedFoundations.length} Saved</span>span>
                                  </div>div>
                                  <div className="flex gap-2">
                                    {[{id:'search',label:'Search',icon:Search},{id:'saved',label:'Saved',icon:Star},{id:'ai',label:'AI Assistant',icon:Sparkles}].map(tab => {
                          const Icon = tab.icon;
                          return (<button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ' + (activeTab === tab.id ? 'bg-white text-purple-800' : 'bg-white/10 hover:bg-white/20')}><Icon size={18} />{tab.label}</button>button>);
          })}
                                  </div>div>
                        </div>div>
                </div>div>
                <div className="max-w-7xl mx-auto p-6">
                  {activeTab === 'search' && (
                      <div className="space-y-6">
                                  <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                                                <div className="flex gap-4">
                                                                <div className="relative flex-1">
                                                                                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                                                                  <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search foundations by name, location, or focus area..." className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800" />
                                                                </div>div>
                                                                <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center gap-2 text-slate-700"><Filter size={18} />Filters</button>button>
                                                </div>div>
                                  </div>div>
                                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center"><Building2 className="text-purple-600" size={20} /></div>div><div><p className="text-slate-500 text-sm">Foundations</p>p><p className="text-xl font-bold text-slate-800">{filtered.length}</p>p></div>div></div>div></div>div>
                                                <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center"><DollarSign className="text-emerald-600" size={20} /></div>div><div><p className="text-slate-500 text-sm">Total Giving</p>p><p className="text-xl font-bold text-emerald-600">{formatCurrency(filtered.reduce((s,f) => s + f.totalGiving, 0))}</p>p></div>div></div>div></div>div>
                                                <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center"><FileText className="text-blue-600" size={20} /></div>div><div><p className="text-slate-500 text-sm">Total Grants</p>p><p className="text-xl font-bold text-slate-800">{filtered.reduce((s,f) => s + f.grantCount, 0).toLocaleString()}</p>p></div>div></div>div></div>div>
                                                <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center"><TrendingUp className="text-amber-600" size={20} /></div>div><div><p className="text-slate-500 text-sm">Avg Grant</p>p><p className="text-xl font-bold text-slate-800">{formatCurrency(filtered.reduce((s,f) => s + f.avgGrantSize, 0) / filtered.length || 0)}</p>p></div>div></div>div></div>div>
                                  </div>div>
                                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                                <div className="p-4 border-b border-slate-200"><h3 className="font-bold text-slate-800">Search Results</h3>h3><p className="text-sm text-slate-500">Sorted by AI match score for FOAM</p>p></div>div>
                                                <div className="divide-y divide-slate-100">
                                                  {filtered.map(f => (
                                          <div key={f.id} className="p-4 hover:bg-slate-50 cursor-pointer transition-all" onClick={() => setSelectedFoundation(f)}>
                                                              <div className="flex items-start justify-between gap-4">
                                                                                    <div className="flex-1">
                                                                                                            <div className="flex items-center gap-2 mb-1">
                                                                                                                                      <h4 className="font-bold text-slate-800">{f.name}</h4>h4>
                                                                                                              {f.matchScore && <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">{f.matchScore}% Match</span>span>}
                                                                                                              </div>div>
                                                                                                            <div className="flex items-center gap-4 text-sm text-slate-500 mb-2">
                                                                                                                                      <span className="flex items-center gap-1"><MapPin size={14} />{f.city}, {f.state}</span>span>
                                                                                                                                      <span>EIN: {f.ein}</span>span>
                                                                                                                                      <span>FY {f.fiscalYear}</span>span>
                                                                                                              </div>div>
                                                                                                            <div className="flex flex-wrap gap-2">{f.topRecipientTypes.map((t,i) => <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">{t}</span>span>)}</div>div>
                                                                                      </div>div>
                                                                                    <div className="text-right">
                                                                                                            <p className="text-sm text-slate-500">Annual Giving</p>p>
                                                                                                            <p className="text-lg font-bold text-emerald-600">{formatCurrency(f.totalGiving)}</p>p>
                                                                                                            <p className="text-xs text-slate-400">{f.grantCount} grants</p>p>
                                                                                      </div>div>
                                                                                    <div className="flex items-center gap-2">
                                                                                                            <button onClick={(e) => { e.stopPropagation(); toggleSave(f.id); }} className={'p-2 rounded-lg transition-all ' + (savedFoundations.includes(f.id) ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400 hover:text-slate-600')}><Star size={18} fill={savedFoundations.includes(f.id) ? 'currentColor' : 'none'} /></button>button>
                                                                                                            <ChevronRight className="text-slate-300" size={20} />
                                                                                      </div>div>
                                                              </div>div>
                                          </div>div>
                                        ))}
                                                </div>div>
                                  </div>div>
                      </div>div>
                        )}
                  {activeTab === 'saved' && (
                      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                                  <h3 className="text-lg font-bold text-slate-800 mb-4">Saved Foundations ({savedFoundations.length})</h3>h3>
                        {savedFoundations.length > 0 ? (
                                      <div className="space-y-4">{mockFoundations.filter(f => savedFoundations.includes(f.id)).map(f => (
                                                        <div key={f.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between">
                                                                          <div><h4 className="font-bold text-slate-800">{f.name}</h4>h4><p className="text-sm text-slate-500">{f.city}, {f.state}</p>p><p className="text-sm text-emerald-600 font-medium mt-1">{formatCurrency(f.totalGiving)} annual giving</p>p></div>div>
                                                                          <button onClick={() => toggleSave(f.id)} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200">Remove</button>button>
                                                        </div>div>
                                                      ))}</div>div>
                                    ) : (<div className="text-center py-12"><Star className="mx-auto text-slate-300 mb-4" size={48} /><p className="text-slate-500">No saved foundations yet</p>p></div>div>)}
                      </div>div>
                        )}
                  {activeTab === 'ai' && (
                      <div className="space-y-6">
                                  <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
                                                <div className="flex items-center gap-3 mb-4">
                                                                <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center"><Sparkles className="text-white" size={24} /></div>div>
                                                                <div><h3 className="text-lg font-bold text-slate-800">AI Foundation Finder</h3>h3><p className="text-sm text-slate-600">Describe what you need and I'll find matches</p>p></div>div>
                                                </div>div>
                                                <textarea value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} placeholder="Example: Find foundations in California that fund youth development programs..." className="w-full p-4 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 min-h-32" />
                                                <button onClick={() => { setIsLoading(true); setTimeout(() => setIsLoading(false), 1500); }} disabled={!aiPrompt.trim() || isLoading} className="w-full mt-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white rounded-xl font-medium flex items-center justify-center gap-2">
                                                  {isLoading ? <><RefreshCw className="animate-spin" size={18} />Searching...</>> : <><Sparkles size={18} />Find Matching Foundations</>>}
                                                </button>button>
                                  </div>div>
                      </div>div>
                        )}
                </div>div>
            {selectedFoundation && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedFoundation(null)}>
                              <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
                                          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 rounded-t-2xl text-white">
                                                        <div className="flex items-start justify-between">
                                                                        <div><h2 className="text-xl font-bold">{selectedFoundation.name}</h2>h2><p className="text-purple-200">EIN: {selectedFoundation.ein}</p>p></div>div>
                                                                        <button onClick={() => setSelectedFoundation(null)} className="p-2 hover:bg-white/10 rounded-full text-2xl">×</button>button>
                                                        </div>div>
                                          </div>div>
                                          <div className="p-6 space-y-4">
                                                        <div className="grid grid-cols-2 gap-4">
                                                                        <div className="bg-slate-50 rounded-xl p-4"><p className="text-sm text-slate-500">Total Assets</p>p><p className="text-xl font-bold text-slate-800">{formatCurrency(selectedFoundation.totalAssets)}</p>p></div>div>
                                                                        <div className="bg-emerald-50 rounded-xl p-4"><p className="text-sm text-emerald-600">Annual Giving</p>p><p className="text-xl font-bold text-emerald-700">{formatCurrency(selectedFoundation.totalGiving)}</p>p></div>div>
                                                        </div>div>
                                                        <div className="grid grid-cols-2 gap-4">
                                                                        <div className="bg-slate-50 rounded-xl p-4"><p className="text-sm text-slate-500">Total Grants</p>p><p className="text-xl font-bold text-slate-800">{selectedFoundation.grantCount.toLocaleString()}</p>p></div>div>
                                                                        <div className="bg-slate-50 rounded-xl p-4"><p className="text-sm text-slate-500">Avg Grant Size</p>p><p className="text-xl font-bold text-slate-800">{formatCurrency(selectedFoundation.avgGrantSize)}</p>p></div>div>
                                                        </div>div>
                                                        <div className="bg-slate-50 rounded-xl p-4"><p className="text-sm text-slate-500 mb-2">Focus Areas</p>p><div className="flex flex-wrap gap-2">{selectedFoundation.topRecipientTypes.map((t,i) => <span key={i} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">{t}</span>span>)}</div>div></div>div>
                                                        <div className="flex gap-3 pt-4">
                                                                        <button onClick={() => toggleSave(selectedFoundation.id)} className={'flex-1 py-3 rounded-xl font-medium flex items-center justify-center gap-2 ' + (savedFoundations.includes(selectedFoundation.id) ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200')}><Star size={18} fill={savedFoundations.includes(selectedFoundation.id) ? 'currentColor' : 'none'} />{savedFoundations.includes(selectedFoundation.id) ? 'Saved' : 'Save'}</button>button>
                                                          {selectedFoundation.website && <a href={selectedFoundation.website} target="_blank" rel="noopener noreferrer" className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium flex items-center justify-center gap-2"><ExternalLink size={18} />Visit Website</a>a>}
                                                        </div>div>
                                          </div>div>
                              </div>div>
                    </div>div>
                )}
          </div>div>
        );
};

export default IRS990Research;</></></div>
