'use client';

import React, { useState, useEffect, useMemo } from 'react';

// Icons - using inline SVGs for compatibility
const Icons = {
  DollarSign: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  TrendingUp: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
  Wallet: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
  Receipt: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
  Building: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
  Target: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
  PieChart: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>,
  BarChart: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
  Plus: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>,
  Refresh: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
  X: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
  ChevronDown: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>,
  ChevronRight: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>,
  ArrowLeft: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>,
  Search: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  Calendar: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  Download: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>,
  Filter: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>,
  Check: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>,
  Alert: () => <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
};

const API_BASE_URL = 'https://foamla-backend-2.onrender.com';

interface FinanceDashboardProps { onClose?: () => void; }

export default function FinanceDashboard({ onClose }: FinanceDashboardProps) {
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
    } catch (err) { setError('Failed to load data'); }
    finally { setLoading(false); }
  };

  const formatCurrency = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(n);
  const formatPercent = (v: any) => `${parseFloat(v).toFixed(1)}%`;

  const exportToCSV = (type: string) => {
    let csv = '', fn = '';
    if (type === 'transactions' || type === 'all') {
      csv += 'TXN ID,Date,Funder,Category,Type,Amount,Description\n';
      filteredTransactions.forEach(t => { csv += `${t.txn_id},${t.date},"${t.funder}","${t.category}",${t.type},${t.amount},"${t.description}"\n`; });
      fn = 'transactions';
    }
    if (type === 'funders' || type === 'all') {
      csv += '\nFunder ID,Name,FY2025-26,Status\n';
      funders.forEach(f => { csv += `${f.funder_id},"${f.funder_name}",${f.fy2025_26},${f.status}\n`; });
      fn = type === 'all' ? 'foam_export' : 'funders';
    }
    if (type === 'budget' || type === 'all') {
      csv += '\nLine ID,Section,Item,Annual,Monthly\n';
      budget.forEach(b => { csv += `${b.line_id},"${b.section}","${b.line_item}",${b.annual_budget},${b.monthly_budget}\n`; });
      fn = type === 'all' ? fn : 'budget';
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
    const exp = filteredTransactions.filter(t => t.type === 'Expense').reduce((s, t) => s + t.amount, 0);
    const cred = filteredTransactions.filter(t => t.type === 'Credit').reduce((s, t) => s + t.amount, 0);
    return { expenses: exp, credits: cred, net: exp - cred, count: filteredTransactions.length };
  }, [filteredTransactions]);

  const hasFilters = filterFunder || filterCategory || searchTerm || dateRangeStart || dateRangeEnd || selectedQuarter;

  const [newTxn, setNewTxn] = useState({ date: new Date().toISOString().split('T')[0], funder: '', type: 'Expense', category: '', amount: '', description: '', payment_method: 'Check', reference: '' });
  const [newFunder, setNewFunder] = useState({ funder_name: '', fy2025_26: '', period_start: '', period_end: '', contact: '' });

  const addTransaction = async () => {
    const res = await fetch(`${API_BASE_URL}/api/finance/transactions`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...newTxn, amount: parseFloat(newTxn.amount) }) });
    if ((await res.json()).success) { setShowAddTransaction(false); setNewTxn({ date: new Date().toISOString().split('T')[0], funder: '', type: 'Expense', category: '', amount: '', description: '', payment_method: 'Check', reference: '' }); fetchAllData(); }
  };

  const addFunder = async () => {
    const res = await fetch(`${API_BASE_URL}/api/finance/funders`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...newFunder, fy2025_26: parseFloat(newFunder.fy2025_26) || 0, status: 'Active' }) });
    if ((await res.json()).success) { setShowAddFunder(false); setNewFunder({ funder_name: '', fy2025_26: '', period_start: '', period_end: '', contact: '' }); fetchAllData(); }
  };

  if (loading) return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center"><div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div></div>;
  if (error) return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center"><div className="text-center p-8 bg-red-500/10 rounded-2xl border border-red-500/30"><Icons.Alert /><p className="text-red-400 mt-4">{error}</p><button onClick={fetchAllData} className="mt-4 px-6 py-2 bg-red-500 text-white rounded-xl">Retry</button></div></div>;

  const kpis = dashboardData?.kpis;
  const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {onClose && <button onClick={onClose} className="p-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-xl"><Icons.ArrowLeft /></button>}
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg"><Icons.Wallet /></div>
              <div><h1 className="text-2xl font-bold text-white">FOAM Financial Tracker</h1><p className="text-slate-400 text-sm">Multi-Funder Budget Management</p></div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <button onClick={() => setShowExportMenu(!showExportMenu)} className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-xl"><Icons.Download /><span>Export</span><Icons.ChevronDown /></button>
                {showExportMenu && <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-50">
                  <button onClick={() => exportToCSV('transactions')} className="w-full px-4 py-2 text-left text-slate-300 hover:bg-slate-700 rounded-t-xl">Transactions</button>
                  <button onClick={() => exportToCSV('funders')} className="w-full px-4 py-2 text-left text-slate-300 hover:bg-slate-700">Funders</button>
                  <button onClick={() => exportToCSV('budget')} className="w-full px-4 py-2 text-left text-slate-300 hover:bg-slate-700">Budget</button>
                  <button onClick={() => exportToCSV('all')} className="w-full px-4 py-2 text-left text-emerald-400 hover:bg-slate-700 font-medium rounded-b-xl">Export All</button>
                </div>}
              </div>
              <button onClick={fetchAllData} className="p-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-xl"><Icons.Refresh /></button>
              <button onClick={() => setShowAddTransaction(true)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium"><Icons.Plus /><span>Add Transaction</span></button>
            </div>
          </div>
          <div className="flex gap-1 mt-4 bg-slate-900/50 p-1 rounded-xl w-fit">
            {[{ id: 'overview', label: 'Overview' }, { id: 'funders', label: 'Funders' }, { id: 'transactions', label: 'Transactions' }, { id: 'budget', label: 'Budget' }].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === tab.id ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-white'}`}>{tab.label}</button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* OVERVIEW */}
        {activeTab === 'overview' && kpis && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50"><p className="text-slate-400 text-sm">Total Funder Budget</p><p className="text-3xl font-bold text-white mt-1">{formatCurrency(kpis.total_funder_budget)}</p><p className="text-slate-500 text-xs mt-2">FY2025-26</p></div>
              <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50"><p className="text-slate-400 text-sm">Total Spent</p><p className="text-3xl font-bold text-white mt-1">{formatCurrency(kpis.net_spent)}</p><p className="text-orange-500 text-sm mt-2">{formatPercent(kpis.percent_used)} used</p></div>
              <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50"><p className="text-slate-400 text-sm">Budget Remaining</p><p className="text-3xl font-bold text-white mt-1">{formatCurrency(kpis.budget_remaining)}</p><p className="text-emerald-500 text-sm mt-2">✓ On track</p></div>
              <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50"><p className="text-slate-400 text-sm">Transactions</p><p className="text-3xl font-bold text-white mt-1">{dashboardData?.transaction_count || 0}</p><p className="text-slate-500 text-xs mt-2">Total recorded</p></div>
            </div>
            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
              <div className="flex justify-between mb-4"><h3 className="text-lg font-semibold text-white">Budget Utilization</h3><span className="text-emerald-500 font-bold">{formatPercent(kpis.percent_used)}</span></div>
              <div className="h-4 bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" style={{ width: `${Math.min(parseFloat(kpis.percent_used), 100)}%` }} /></div>
              <div className="flex justify-between mt-2 text-sm text-slate-400"><span>Spent: {formatCurrency(kpis.net_spent)}</span><span>Remaining: {formatCurrency(kpis.budget_remaining)}</span></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
                <h3 className="text-lg font-semibold text-white mb-4">Spending by Category</h3>
                <div className="space-y-3">{(dashboardData?.by_category || []).map((c: any, i: number) => {
                  const max = Math.max(...(dashboardData?.by_category || []).map((x: any) => x.amount), 1);
                  return <div key={c.name}><div className="flex justify-between text-sm mb-1"><span className="text-slate-300">{c.name}</span><span className="text-white font-medium">{formatCurrency(c.amount)}</span></div><div className="h-2 bg-slate-700 rounded-full"><div className="h-full rounded-full" style={{ width: `${(c.amount/max)*100}%`, backgroundColor: colors[i % colors.length] }} /></div></div>;
                })}</div>
              </div>
              <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
                <h3 className="text-lg font-semibold text-white mb-4">Spending by Funder</h3>
                <div className="space-y-3">{(dashboardData?.by_funder || []).map((f: any, i: number) => {
                  const max = Math.max(...(dashboardData?.by_funder || []).map((x: any) => x.amount), 1);
                  return <div key={f.name}><div className="flex justify-between text-sm mb-1"><span className="text-slate-300 truncate max-w-[180px]">{f.name}</span><span className="text-white font-medium">{formatCurrency(f.amount)}</span></div><div className="h-2 bg-slate-700 rounded-full"><div className="h-full rounded-full" style={{ width: `${(f.amount/max)*100}%`, backgroundColor: colors[i % colors.length] }} /></div></div>;
                })}</div>
              </div>
            </div>
          </div>
        )}

        {/* FUNDERS */}
        {activeTab === 'funders' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center"><h2 className="text-2xl font-bold text-white">Funder Management</h2><button onClick={() => setShowAddFunder(true)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl"><Icons.Plus /><span>Add Funder</span></button></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {funders.map(f => (
                <div key={f.funder_id} className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 hover:border-blue-500/30 transition-all">
                  <div className="flex justify-between mb-4"><div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center"><Icons.Building /></div><span className={`px-2 py-1 rounded-lg text-xs ${f.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>{f.status}</span></div>
                  <h3 className="text-lg font-semibold text-white mb-1">{f.funder_name}</h3><p className="text-slate-400 text-sm mb-4">{f.funder_id}</p>
                  <div className="space-y-2"><div className="flex justify-between"><span className="text-slate-500 text-sm">FY2025-26</span><span className="text-white font-bold">{formatCurrency(f.fy2025_26)}</span></div></div>
                  {f.period_start && <div className="mt-4 pt-4 border-t border-slate-700 text-slate-400 text-sm flex items-center gap-2"><Icons.Calendar />{f.period_start} to {f.period_end}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TRANSACTIONS */}
        {activeTab === 'transactions' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <h2 className="text-2xl font-bold text-white">Transaction History</h2>
              <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-2 px-4 py-2 rounded-xl ${showFilters ? 'bg-emerald-500 text-white' : 'bg-slate-700/50 text-slate-300'}`}><Icons.Filter /><span>Filters</span>{hasFilters && <span className="w-2 h-2 bg-orange-500 rounded-full" />}</button>
            </div>
            {showFilters && <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
              <div className="flex justify-between mb-4"><h3 className="font-semibold text-white">Filter Options</h3>{hasFilters && <button onClick={clearFilters} className="text-orange-400 text-sm flex items-center gap-1"><Icons.X />Clear All</button>}</div>
              <div className="flex flex-wrap gap-2 mb-4">{['thisMonth', 'lastMonth', 'fiscalYear'].map(p => <button key={p} onClick={() => applyPreset(p)} className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm rounded-lg">{p === 'thisMonth' ? 'This Month' : p === 'lastMonth' ? 'Last Month' : 'Fiscal Year'}</button>)}</div>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <input type="date" value={dateRangeStart} onChange={e => setDateRangeStart(e.target.value)} className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white" placeholder="Start" />
                <input type="date" value={dateRangeEnd} onChange={e => setDateRangeEnd(e.target.value)} className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white" />
                <select value={selectedQuarter} onChange={e => setSelectedQuarter(e.target.value)} className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"><option value="">All Quarters</option><option value="Q1">Q1</option><option value="Q2">Q2</option><option value="Q3">Q3</option><option value="Q4">Q4</option></select>
                <select value={filterFunder} onChange={e => setFilterFunder(e.target.value)} className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"><option value="">All Funders</option>{funders.map(f => <option key={f.funder_id} value={f.funder_name}>{f.funder_name}</option>)}</select>
                <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"><option value="">All Categories</option>{categories.map(c => <option key={c.category_id} value={c.category_name}>{c.category_name}</option>)}</select>
              </div>
            </div>}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50"><p className="text-slate-400 text-sm">Count</p><p className="text-2xl font-bold text-white">{totals.count}</p></div>
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50"><p className="text-slate-400 text-sm">Expenses</p><p className="text-2xl font-bold text-orange-400">{formatCurrency(totals.expenses)}</p></div>
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50"><p className="text-slate-400 text-sm">Credits</p><p className="text-2xl font-bold text-emerald-400">{formatCurrency(totals.credits)}</p></div>
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50"><p className="text-slate-400 text-sm">Net</p><p className="text-2xl font-bold text-white">{formatCurrency(totals.net)}</p></div>
            </div>
            <div className="relative max-w-md"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"><Icons.Search /></span><input type="text" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white" /></div>
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-900/50"><tr><th className="text-left py-4 px-4 text-slate-400 text-sm">Date</th><th className="text-left py-4 px-4 text-slate-400 text-sm">Description</th><th className="text-left py-4 px-4 text-slate-400 text-sm">Funder</th><th className="text-left py-4 px-4 text-slate-400 text-sm">Category</th><th className="text-left py-4 px-4 text-slate-400 text-sm">Type</th><th className="text-right py-4 px-4 text-slate-400 text-sm">Amount</th></tr></thead>
                <tbody>{filteredTransactions.map(t => <tr key={t.txn_id} className="border-t border-slate-700/50 hover:bg-slate-700/30"><td className="py-3 px-4 text-slate-300 text-sm">{t.date}</td><td className="py-3 px-4 text-white text-sm">{t.description}</td><td className="py-3 px-4 text-slate-300 text-sm">{t.funder}</td><td className="py-3 px-4"><span className="px-2 py-1 bg-slate-700 rounded text-xs text-slate-300">{t.category}</span></td><td className="py-3 px-4"><span className={`px-2 py-1 rounded text-xs ${t.type === 'Expense' ? 'bg-orange-500/20 text-orange-400' : 'bg-emerald-500/20 text-emerald-400'}`}>{t.type}</span></td><td className={`py-3 px-4 text-right font-bold ${t.type === 'Expense' ? 'text-orange-400' : 'text-emerald-400'}`}>{t.type === 'Expense' ? '-' : '+'}{formatCurrency(t.amount)}</td></tr>)}</tbody>
              </table>
              {filteredTransactions.length === 0 && <div className="text-center py-12 text-slate-400">No transactions found</div>}
            </div>
          </div>
        )}

        {/* BUDGET */}
        {activeTab === 'budget' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center"><h2 className="text-2xl font-bold text-white">Proposed Budget</h2><div className="text-right"><p className="text-slate-400 text-sm">Total Annual</p><p className="text-3xl font-bold text-emerald-500">{formatCurrency(kpis?.total_proposed_budget || 0)}</p></div></div>
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-900/50"><tr><th className="text-left py-4 px-4 text-slate-400 text-sm">ID</th><th className="text-left py-4 px-4 text-slate-400 text-sm">Section</th><th className="text-left py-4 px-4 text-slate-400 text-sm">Line Item</th><th className="text-right py-4 px-4 text-slate-400 text-sm">Annual</th><th className="text-right py-4 px-4 text-slate-400 text-sm">Monthly</th></tr></thead>
                <tbody>{budget.map(b => <tr key={b.line_id} className="border-t border-slate-700/50 hover:bg-slate-700/30"><td className="py-3 px-4 text-slate-500 text-sm font-mono">{b.line_id}</td><td className="py-3 px-4"><span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">{b.section}</span></td><td className="py-3 px-4 text-white text-sm">{b.line_item}</td><td className="py-3 px-4 text-right text-emerald-400 font-bold">{formatCurrency(b.annual_budget)}</td><td className="py-3 px-4 text-right text-slate-300">{formatCurrency(b.monthly_budget)}</td></tr>)}</tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* ADD TRANSACTION MODAL */}
      {showAddTransaction && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-slate-800 rounded-2xl w-full max-w-lg border border-slate-700">
          <div className="flex justify-between p-6 border-b border-slate-700"><h3 className="text-xl font-bold text-white">Add Transaction</h3><button onClick={() => setShowAddTransaction(false)} className="text-slate-400"><Icons.X /></button></div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4"><div><label className="block text-slate-400 text-sm mb-1">Date</label><input type="date" value={newTxn.date} onChange={e => setNewTxn({...newTxn, date: e.target.value})} className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white" /></div><div><label className="block text-slate-400 text-sm mb-1">Type</label><select value={newTxn.type} onChange={e => setNewTxn({...newTxn, type: e.target.value})} className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"><option value="Expense">Expense</option><option value="Credit">Credit</option></select></div></div>
            <div><label className="block text-slate-400 text-sm mb-1">Funder</label><select value={newTxn.funder} onChange={e => setNewTxn({...newTxn, funder: e.target.value})} className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"><option value="">Select</option>{funders.map(f => <option key={f.funder_id} value={f.funder_name}>{f.funder_name}</option>)}</select></div>
            <div><label className="block text-slate-400 text-sm mb-1">Category</label><select value={newTxn.category} onChange={e => setNewTxn({...newTxn, category: e.target.value})} className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"><option value="">Select</option>{categories.map(c => <option key={c.category_id} value={c.category_name}>{c.category_name}</option>)}</select></div>
            <div><label className="block text-slate-400 text-sm mb-1">Amount</label><input type="number" placeholder="0.00" value={newTxn.amount} onChange={e => setNewTxn({...newTxn, amount: e.target.value})} className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white" /></div>
            <div><label className="block text-slate-400 text-sm mb-1">Description</label><input type="text" value={newTxn.description} onChange={e => setNewTxn({...newTxn, description: e.target.value})} className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white" /></div>
          </div>
          <div className="flex justify-end gap-3 p-6 border-t border-slate-700"><button onClick={() => setShowAddTransaction(false)} className="px-6 py-2 text-slate-400">Cancel</button><button onClick={addTransaction} disabled={!newTxn.funder || !newTxn.category || !newTxn.amount} className="px-6 py-2 bg-emerald-500 text-white rounded-xl disabled:opacity-50">Add</button></div>
        </div>
      </div>}

      {/* ADD FUNDER MODAL */}
      {showAddFunder && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-slate-800 rounded-2xl w-full max-w-lg border border-slate-700">
          <div className="flex justify-between p-6 border-b border-slate-700"><h3 className="text-xl font-bold text-white">Add Funder</h3><button onClick={() => setShowAddFunder(false)} className="text-slate-400"><Icons.X /></button></div>
          <div className="p-6 space-y-4">
            <div><label className="block text-slate-400 text-sm mb-1">Funder Name</label><input type="text" value={newFunder.funder_name} onChange={e => setNewFunder({...newFunder, funder_name: e.target.value})} className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white" /></div>
            <div><label className="block text-slate-400 text-sm mb-1">FY2025-26 Budget</label><input type="number" placeholder="0" value={newFunder.fy2025_26} onChange={e => setNewFunder({...newFunder, fy2025_26: e.target.value})} className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white" /></div>
            <div className="grid grid-cols-2 gap-4"><div><label className="block text-slate-400 text-sm mb-1">Period Start</label><input type="date" value={newFunder.period_start} onChange={e => setNewFunder({...newFunder, period_start: e.target.value})} className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white" /></div><div><label className="block text-slate-400 text-sm mb-1">Period End</label><input type="date" value={newFunder.period_end} onChange={e => setNewFunder({...newFunder, period_end: e.target.value})} className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white" /></div></div>
            <div><label className="block text-slate-400 text-sm mb-1">Contact</label><input type="text" value={newFunder.contact} onChange={e => setNewFunder({...newFunder, contact: e.target.value})} className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white" /></div>
          </div>
          <div className="flex justify-end gap-3 p-6 border-t border-slate-700"><button onClick={() => setShowAddFunder(false)} className="px-6 py-2 text-slate-400">Cancel</button><button onClick={addFunder} disabled={!newFunder.funder_name} className="px-6 py-2 bg-blue-500 text-white rounded-xl disabled:opacity-50">Add</button></div>
        </div>
      </div>}
    </div>
  );
}
