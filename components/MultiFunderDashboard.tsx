import React, { useState, useEffect, useMemo } from 'react';

const API_BASE_URL = 'https://foamla-backend-2.onrender.com';

const MultiFunderDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'funders' | 'transactions' | 'budget'>('overview');
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [funders, setFunders] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [budget, setBudget] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [showAddFunder, setShowAddFunder] = useState(false);
  const [filterFunder, setFilterFunder] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRangeStart, setDateRangeStart] = useState('');
  const [dateRangeEnd, setDateRangeEnd] = useState('');
  const [selectedQuarter, setSelectedQuarter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [newTxn, setNewTxn] = useState({ date: new Date().toISOString().split('T')[0], funder: '', type: 'Expense', category: '', amount: '', description: '' });
  const [newFunder, setNewFunder] = useState({ funder_name: '', fy2025_26: '', period_start: '', period_end: '', contact: '' });

  useEffect(() => { fetchAllData(); }, []);

  const fetchAllData = async () => {
    setLoading(true); setError(null);
    try {
      const [d, f, t, c, b] = await Promise.all([
        fetch(`${API_BASE_URL}/api/finance/dashboard`).then(r => r.json()),
        fetch(`${API_BASE_URL}/api/finance/funders`).then(r => r.json()),
        fetch(`${API_BASE_URL}/api/finance/transactions`).then(r => r.json()),
        fetch(`${API_BASE_URL}/api/finance/categories`).then(r => r.json()),
        fetch(`${API_BASE_URL}/api/finance/budget`).then(r => r.json())
      ]);
      if (d.success) setDashboardData(d.data);
      if (f.success) setFunders(f.data);
      if (t.success) setTransactions(t.data);
      if (c.success) setCategories(c.data);
      if (b.success) setBudget(b.data);
    } catch (err) { setError('Failed to load data. Server may be waking up - please retry.'); }
    finally { setLoading(false); }
  };

  const formatCurrency = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(n || 0);
  const formatPercent = (v: any) => `${parseFloat(v || 0).toFixed(1)}%`;

  const exportToCSV = (type: string) => {
    let csv = '', fn = '';
    if (type === 'transactions' || type === 'all') {
      csv += 'TXN ID,Date,Funder,Category,Type,Amount,Description\n';
      filteredTransactions.forEach(t => { csv += `${t.txn_id},${t.date},"${t.funder}","${t.category}",${t.type},${t.amount},"${t.description}"\n`; });
      fn = 'foam_transactions';
    }
    if (type === 'funders' || type === 'all') {
      csv += '\nFunder ID,Name,FY2025-26,Status\n';
      funders.forEach(f => { csv += `${f.funder_id},"${f.funder_name}",${f.fy2025_26},${f.status}\n`; });
      fn = type === 'all' ? 'foam_finance_export' : 'foam_funders';
    }
    if (type === 'budget' || type === 'all') {
      csv += '\nLine ID,Section,Item,Annual,Monthly\n';
      budget.forEach(b => { csv += `${b.line_id},"${b.section}","${b.line_item}",${b.annual_budget},${b.monthly_budget}\n`; });
      fn = type === 'all' ? fn : 'foam_budget';
    }
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a'); link.href = URL.createObjectURL(blob);
    link.download = `${fn}_${new Date().toISOString().split('T')[0]}.csv`; link.click();
    setShowExportMenu(false);
  };

  const clearFilters = () => { setFilterFunder(''); setFilterCategory(''); setSearchTerm(''); setDateRangeStart(''); setDateRangeEnd(''); setSelectedQuarter(''); };
  
  const applyPreset = (p: string) => {
    const t = new Date(); let s = '', e = t.toISOString().split('T')[0];
    if (p === 'thisMonth') s = new Date(t.getFullYear(), t.getMonth(), 1).toISOString().split('T')[0];
    if (p === 'lastMonth') { s = new Date(t.getFullYear(), t.getMonth()-1, 1).toISOString().split('T')[0]; e = new Date(t.getFullYear(), t.getMonth(), 0).toISOString().split('T')[0]; }
    if (p === 'fiscalYear') { if (t.getMonth() >= 6) { s = `${t.getFullYear()}-07-01`; e = `${t.getFullYear()+1}-06-30`; } else { s = `${t.getFullYear()-1}-07-01`; e = `${t.getFullYear()}-06-30`; } }
    setDateRangeStart(s); setDateRangeEnd(e);
  };

  const filteredTransactions = useMemo(() => transactions.filter(t => {
    if (filterFunder && !t.funder?.toLowerCase().includes(filterFunder.toLowerCase())) return false;
    if (filterCategory && !t.category?.toLowerCase().includes(filterCategory.toLowerCase())) return false;
    if (searchTerm && !t.description?.toLowerCase().includes(searchTerm.toLowerCase()) && !t.txn_id?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (dateRangeStart && t.date < dateRangeStart) return false;
    if (dateRangeEnd && t.date > dateRangeEnd) return false;
    if (selectedQuarter && t.quarter !== selectedQuarter) return false;
    return true;
  }), [transactions, filterFunder, filterCategory, searchTerm, dateRangeStart, dateRangeEnd, selectedQuarter]);

  const totals = useMemo(() => {
    const exp = filteredTransactions.filter(t => t.type === 'Expense').reduce((s, t) => s + (t.amount || 0), 0);
    const cred = filteredTransactions.filter(t => t.type === 'Credit').reduce((s, t) => s + (t.amount || 0), 0);
    return { expenses: exp, credits: cred, net: exp - cred, count: filteredTransactions.length };
  }, [filteredTransactions]);

  const hasFilters = filterFunder || filterCategory || searchTerm || dateRangeStart || dateRangeEnd || selectedQuarter;

  const addTransaction = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/finance/transactions`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...newTxn, amount: parseFloat(newTxn.amount) }) });
      if ((await res.json()).success) { setShowAddTransaction(false); setNewTxn({ date: new Date().toISOString().split('T')[0], funder: '', type: 'Expense', category: '', amount: '', description: '' }); fetchAllData(); }
    } catch (err) { console.error(err); }
  };

  const addFunder = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/finance/funders`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...newFunder, fy2025_26: parseFloat(newFunder.fy2025_26) || 0, status: 'Active' }) });
      if ((await res.json()).success) { setShowAddFunder(false); setNewFunder({ funder_name: '', fy2025_26: '', period_start: '', period_end: '', contact: '' }); fetchAllData(); }
    } catch (err) { console.error(err); }
  };

  const kpis = dashboardData?.kpis;
  const colors = ['#4f46e5', '#0891b2', '#059669', '#d97706', '#dc2626'];

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-12 text-center space-y-6 bg-slate-50 rounded-[3rem] border-4 border-dashed border-slate-200">
      <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      <div className="space-y-2">
        <h2 className="text-xl font-black text-slate-800">Loading Multi-Funder Data...</h2>
        <p className="text-slate-500 font-medium">First load may take ~30s if server is waking up</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-12 text-center space-y-6 bg-slate-50 rounded-[3rem] border-4 border-dashed border-rose-200">
      <div className="w-24 h-24 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center">
        <i className="fas fa-exclamation-triangle text-4xl"></i>
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-black text-slate-800">Connection Error</h2>
        <p className="text-slate-500 font-medium max-w-md">{error}</p>
      </div>
      <button onClick={fetchAllData} className="px-6 py-3 bg-[#0F2C5C] text-white rounded-xl font-bold hover:bg-indigo-700 transition-all">
        <i className="fas fa-sync mr-2"></i>Retry Connection
      </button>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-16">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 p-8 rounded-[2.5rem] text-white flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl">
        <div className="space-y-2 text-center md:text-left">
          <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <i className="fas fa-hand-holding-usd"></i> Multi-Funder Budget Tracker
          </h2>
          <p className="text-indigo-200 font-bold uppercase tracking-widest text-xs">Live Data • Google Sheets Backend • FY 2025-26</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap justify-center">
          <div className="relative">
            <button onClick={() => setShowExportMenu(!showExportMenu)} className="flex items-center gap-2 px-5 py-2.5 bg-white/20 hover:bg-white/30 rounded-xl font-bold transition-all">
              <i className="fas fa-download"></i> Export
            </button>
            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl z-50 overflow-hidden border border-slate-100">
                <button onClick={() => exportToCSV('transactions')} className="w-full px-4 py-3 text-left text-slate-700 hover:bg-slate-50 text-sm font-medium">Transactions CSV</button>
                <button onClick={() => exportToCSV('funders')} className="w-full px-4 py-3 text-left text-slate-700 hover:bg-slate-50 text-sm font-medium">Funders CSV</button>
                <button onClick={() => exportToCSV('budget')} className="w-full px-4 py-3 text-left text-slate-700 hover:bg-slate-50 text-sm font-medium">Budget CSV</button>
                <button onClick={() => exportToCSV('all')} className="w-full px-4 py-3 text-left text-indigo-600 hover:bg-indigo-50 text-sm font-bold border-t">Export All</button>
              </div>
            )}
          </div>
          <button onClick={fetchAllData} className="p-2.5 bg-white/20 hover:bg-white/30 rounded-xl transition-all" title="Refresh"><i className="fas fa-sync"></i></button>
          <button onClick={() => setShowAddTransaction(true)} className="flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition-all">
            <i className="fas fa-plus"></i> Add Transaction
          </button>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full md:w-fit overflow-x-auto hide-scrollbar">
        {[
          { id: 'overview', icon: 'fa-chart-pie', label: 'Overview' },
          { id: 'funders', icon: 'fa-building', label: 'Funders' },
          { id: 'transactions', icon: 'fa-receipt', label: 'Transactions' },
          { id: 'budget', icon: 'fa-bullseye', label: 'Budget' }
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-[#0F2C5C] text-white shadow-md' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200'}`}>
            <i className={`fas ${tab.icon}`}></i><span className="whitespace-nowrap">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm min-h-[500px] overflow-hidden">
        
        {/* OVERVIEW */}
        {activeTab === 'overview' && kpis && (
          <div className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-4"><i className="fas fa-wallet text-xl"></i></div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Budget</p>
                <p className="text-3xl font-black text-[#0F2C5C]">{formatCurrency(kpis.total_funder_budget)}</p>
              </div>
              <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mb-4"><i className="fas fa-arrow-trend-up text-xl"></i></div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Spent</p>
                <p className="text-3xl font-black text-[#0F2C5C]">{formatCurrency(kpis.net_spent)}</p>
                <p className="text-xs text-orange-500 font-bold mt-1">{formatPercent(kpis.percent_used)} used</p>
              </div>
              <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-4"><i className="fas fa-piggy-bank text-xl"></i></div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Remaining</p>
                <p className="text-3xl font-black text-[#0F2C5C]">{formatCurrency(kpis.budget_remaining)}</p>
              </div>
              <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-4"><i className="fas fa-receipt text-xl"></i></div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Transactions</p>
                <p className="text-3xl font-black text-[#0F2C5C]">{dashboardData?.transaction_count || 0}</p>
              </div>
            </div>
            <div className="bg-slate-900 rounded-3xl p-8 text-white">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black">Budget Utilization</h3>
                <span className="text-3xl font-black text-emerald-400">{formatPercent(kpis.percent_used)}</span>
              </div>
              <div className="h-4 bg-white/20 rounded-full overflow-hidden mb-4">
                <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full" style={{ width: `${Math.min(parseFloat(kpis.percent_used || 0), 100)}%` }}></div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Spent: <strong className="text-white">{formatCurrency(kpis.net_spent)}</strong></span>
                <span className="text-slate-400">Remaining: <strong className="text-emerald-400">{formatCurrency(kpis.budget_remaining)}</strong></span>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-xl font-black text-slate-800"><i className="fas fa-tags text-indigo-600 mr-2"></i>By Category</h3>
                {(dashboardData?.by_category || []).slice(0,5).map((c: any, i: number) => {
                  const max = Math.max(...(dashboardData?.by_category || []).map((x: any) => x.amount), 1);
                  return (
                    <div key={c.name} className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                      <div className="flex justify-between mb-2"><span className="font-bold text-slate-700">{c.name}</span><span className="font-black text-[#0F2C5C]">{formatCurrency(c.amount)}</span></div>
                      <div className="h-2 bg-slate-200 rounded-full"><div className="h-full rounded-full" style={{ width: `${(c.amount/max)*100}%`, backgroundColor: colors[i % colors.length] }}></div></div>
                    </div>
                  );
                })}
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-black text-slate-800"><i className="fas fa-building text-purple-600 mr-2"></i>By Funder</h3>
                {(dashboardData?.by_funder || []).slice(0,5).map((f: any, i: number) => {
                  const max = Math.max(...(dashboardData?.by_funder || []).map((x: any) => x.amount), 1);
                  return (
                    <div key={f.name} className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                      <div className="flex justify-between mb-2"><span className="font-bold text-slate-700 truncate max-w-[200px]">{f.name}</span><span className="font-black text-[#0F2C5C]">{formatCurrency(f.amount)}</span></div>
                      <div className="h-2 bg-slate-200 rounded-full"><div className="h-full rounded-full" style={{ width: `${(f.amount/max)*100}%`, backgroundColor: colors[i % colors.length] }}></div></div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* FUNDERS */}
        {activeTab === 'funders' && (
          <div className="p-8 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-black text-slate-800">Funder Management</h3>
              <button onClick={() => setShowAddFunder(true)} className="flex items-center gap-2 px-5 py-2.5 bg-[#0F2C5C] text-white rounded-xl font-bold"><i className="fas fa-plus"></i> Add Funder</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {funders.map(f => (
                <div key={f.funder_id} className="bg-slate-50 rounded-3xl p-6 border border-slate-100 hover:shadow-xl hover:border-indigo-200 transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center"><i className="fas fa-building text-2xl"></i></div>
                    <span className={`px-3 py-1 rounded-xl text-xs font-black ${f.status === 'Active' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'}`}>{f.status}</span>
                  </div>
                  <h4 className="text-lg font-black text-slate-800 mb-1">{f.funder_name}</h4>
                  <p className="text-xs text-slate-400 font-mono mb-4">{f.funder_id}</p>
                  <div className="border-t border-slate-200 pt-4">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">FY2025-26</p>
                    <p className="text-2xl font-black text-[#0F2C5C]">{formatCurrency(f.fy2025_26)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TRANSACTIONS */}
        {activeTab === 'transactions' && (
          <div className="p-8 space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <h3 className="text-2xl font-black text-slate-800">Transaction History</h3>
              <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold ${showFilters ? 'bg-[#0F2C5C] text-white' : 'bg-slate-100 text-slate-600'}`}>
                <i className="fas fa-filter"></i> Filters {hasFilters && <span className="w-2 h-2 bg-orange-500 rounded-full"></span>}
              </button>
            </div>
            {showFilters && (
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <div className="flex justify-between mb-4">
                  <span className="font-bold text-slate-700">Filter Options</span>
                  {hasFilters && <button onClick={clearFilters} className="text-orange-500 text-sm font-bold"><i className="fas fa-times mr-1"></i>Clear</button>}
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {['thisMonth', 'lastMonth', 'fiscalYear'].map(p => (
                    <button key={p} onClick={() => applyPreset(p)} className="px-4 py-2 bg-white border border-slate-200 hover:border-indigo-400 text-slate-600 text-xs font-bold rounded-xl">{p === 'thisMonth' ? 'This Month' : p === 'lastMonth' ? 'Last Month' : 'Fiscal Year'}</button>
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  <input type="date" value={dateRangeStart} onChange={e => setDateRangeStart(e.target.value)} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm" />
                  <input type="date" value={dateRangeEnd} onChange={e => setDateRangeEnd(e.target.value)} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm" />
                  <select value={selectedQuarter} onChange={e => setSelectedQuarter(e.target.value)} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm"><option value="">All Quarters</option><option value="Q1">Q1</option><option value="Q2">Q2</option><option value="Q3">Q3</option><option value="Q4">Q4</option></select>
                  <select value={filterFunder} onChange={e => setFilterFunder(e.target.value)} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm"><option value="">All Funders</option>{funders.map(f => <option key={f.funder_id} value={f.funder_name}>{f.funder_name}</option>)}</select>
                  <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm"><option value="">All Categories</option>{categories.map(c => <option key={c.category_id} value={c.category_name}>{c.category_name}</option>)}</select>
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100"><p className="text-[10px] font-black text-slate-400 uppercase">Count</p><p className="text-2xl font-black text-slate-800">{totals.count}</p></div>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100"><p className="text-[10px] font-black text-slate-400 uppercase">Expenses</p><p className="text-2xl font-black text-rose-600">{formatCurrency(totals.expenses)}</p></div>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100"><p className="text-[10px] font-black text-slate-400 uppercase">Credits</p><p className="text-2xl font-black text-emerald-600">{formatCurrency(totals.credits)}</p></div>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100"><p className="text-[10px] font-black text-slate-400 uppercase">Net</p><p className="text-2xl font-black text-[#0F2C5C]">{formatCurrency(totals.net)}</p></div>
            </div>
            <div className="relative max-w-md">
              <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <input type="text" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead><tr className="bg-slate-50 border-y border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest"><th className="py-4 px-6">Date</th><th className="py-4 px-6">Description</th><th className="py-4 px-6">Funder</th><th className="py-4 px-6">Category</th><th className="py-4 px-6">Type</th><th className="py-4 px-6 text-right">Amount</th></tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredTransactions.map(t => (
                    <tr key={t.txn_id} className="hover:bg-slate-50">
                      <td className="py-4 px-6 text-sm text-slate-600">{t.date}</td>
                      <td className="py-4 px-6 text-sm text-slate-800 font-bold">{t.description}</td>
                      <td className="py-4 px-6 text-sm text-slate-600">{t.funder}</td>
                      <td className="py-4 px-6"><span className="px-2 py-1 bg-slate-100 rounded-lg text-xs">{t.category}</span></td>
                      <td className="py-4 px-6"><span className={`px-2 py-1 rounded-lg text-xs font-bold ${t.type === 'Expense' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>{t.type}</span></td>
                      <td className={`py-4 px-6 text-right font-black ${t.type === 'Expense' ? 'text-rose-600' : 'text-emerald-600'}`}>{t.type === 'Expense' ? '-' : '+'}{formatCurrency(t.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredTransactions.length === 0 && <div className="text-center py-12 text-slate-400"><i className="fas fa-inbox text-5xl mb-4"></i><p>No transactions found</p></div>}
          </div>
        )}

        {/* BUDGET */}
        {activeTab === 'budget' && (
          <div className="p-8 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-black text-slate-800">Proposed Budget</h3>
              <div className="text-right"><p className="text-xs font-bold text-slate-400 uppercase">Total Annual</p><p className="text-3xl font-black text-indigo-600">{formatCurrency(kpis?.total_proposed_budget || 0)}</p></div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead><tr className="bg-slate-50 border-y border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest"><th className="py-4 px-6">ID</th><th className="py-4 px-6">Section</th><th className="py-4 px-6">Line Item</th><th className="py-4 px-6 text-right">Annual</th><th className="py-4 px-6 text-right">Monthly</th></tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {budget.map(b => (
                    <tr key={b.line_id} className="hover:bg-slate-50">
                      <td className="py-4 px-6 text-sm text-slate-400 font-mono">{b.line_id}</td>
                      <td className="py-4 px-6"><span className="px-3 py-1 bg-indigo-100 text-indigo-600 rounded-lg text-xs font-bold">{b.section}</span></td>
                      <td className="py-4 px-6 text-sm text-slate-800 font-bold">{b.line_item}</td>
                      <td className="py-4 px-6 text-right font-black text-emerald-600">{formatCurrency(b.annual_budget)}</td>
                      <td className="py-4 px-6 text-right text-slate-600">{formatCurrency(b.monthly_budget)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ADD TRANSACTION MODAL */}
      {showAddTransaction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b"><h3 className="text-xl font-black text-slate-800">Add Transaction</h3><button onClick={() => setShowAddTransaction(false)} className="text-slate-400 hover:text-slate-600"><i className="fas fa-times text-xl"></i></button></div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-black text-slate-400 uppercase mb-2">Date</label><input type="date" value={newTxn.date} onChange={e => setNewTxn({...newTxn, date: e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-xl" /></div>
                <div><label className="block text-xs font-black text-slate-400 uppercase mb-2">Type</label><select value={newTxn.type} onChange={e => setNewTxn({...newTxn, type: e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-xl"><option value="Expense">Expense</option><option value="Credit">Credit</option></select></div>
              </div>
              <div><label className="block text-xs font-black text-slate-400 uppercase mb-2">Funder</label><select value={newTxn.funder} onChange={e => setNewTxn({...newTxn, funder: e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-xl"><option value="">Select</option>{funders.map(f => <option key={f.funder_id} value={f.funder_name}>{f.funder_name}</option>)}</select></div>
              <div><label className="block text-xs font-black text-slate-400 uppercase mb-2">Category</label><select value={newTxn.category} onChange={e => setNewTxn({...newTxn, category: e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-xl"><option value="">Select</option>{categories.map(c => <option key={c.category_id} value={c.category_name}>{c.category_name}</option>)}</select></div>
              <div><label className="block text-xs font-black text-slate-400 uppercase mb-2">Amount</label><input type="number" placeholder="0.00" value={newTxn.amount} onChange={e => setNewTxn({...newTxn, amount: e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-xl" /></div>
              <div><label className="block text-xs font-black text-slate-400 uppercase mb-2">Description</label><input type="text" value={newTxn.description} onChange={e => setNewTxn({...newTxn, description: e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-xl" /></div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t"><button onClick={() => setShowAddTransaction(false)} className="px-6 py-3 text-slate-500 font-bold">Cancel</button><button onClick={addTransaction} disabled={!newTxn.funder || !newTxn.category || !newTxn.amount} className="px-6 py-3 bg-[#0F2C5C] text-white rounded-xl font-bold disabled:opacity-50">Add</button></div>
          </div>
        </div>
      )}

      {/* ADD FUNDER MODAL */}
      {showAddFunder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b"><h3 className="text-xl font-black text-slate-800">Add Funder</h3><button onClick={() => setShowAddFunder(false)} className="text-slate-400 hover:text-slate-600"><i className="fas fa-times text-xl"></i></button></div>
            <div className="p-6 space-y-4">
              <div><label className="block text-xs font-black text-slate-400 uppercase mb-2">Funder Name</label><input type="text" value={newFunder.funder_name} onChange={e => setNewFunder({...newFunder, funder_name: e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-xl" /></div>
              <div><label className="block text-xs font-black text-slate-400 uppercase mb-2">FY2025-26 Budget</label><input type="number" placeholder="0" value={newFunder.fy2025_26} onChange={e => setNewFunder({...newFunder, fy2025_26: e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-xl" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-black text-slate-400 uppercase mb-2">Period Start</label><input type="date" value={newFunder.period_start} onChange={e => setNewFunder({...newFunder, period_start: e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-xl" /></div>
                <div><label className="block text-xs font-black text-slate-400 uppercase mb-2">Period End</label><input type="date" value={newFunder.period_end} onChange={e => setNewFunder({...newFunder, period_end: e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-xl" /></div>
              </div>
              <div><label className="block text-xs font-black text-slate-400 uppercase mb-2">Contact</label><input type="text" value={newFunder.contact} onChange={e => setNewFunder({...newFunder, contact: e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-xl" /></div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t"><button onClick={() => setShowAddFunder(false)} className="px-6 py-3 text-slate-500 font-bold">Cancel</button><button onClick={addFunder} disabled={!newFunder.funder_name} className="px-6 py-3 bg-[#0F2C5C] text-white rounded-xl font-bold disabled:opacity-50">Add</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiFunderDashboard;
