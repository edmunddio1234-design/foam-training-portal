import React, { useState, useMemo } from 'react';
import { BillEntry, FUNDERS, getAllFunderSummaries } from './FinanceBills';

interface MultiFunderDashboardProps {
  entries?: BillEntry[];
}

const MultiFunderDashboard: React.FC<MultiFunderDashboardProps> = ({ entries = [] }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'funders' | 'comparison'>('overview');
  const [selectedFunder, setSelectedFunder] = useState<string | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const formatCurrency = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(n || 0);
  const formatPercent = (v: number) => `${v.toFixed(1)}%`;

  // Get all funder summaries calculated from actual ledger entries
  const funderSummaries = useMemo(() => getAllFunderSummaries(entries), [entries]);

  // Calculate totals
  const totals = useMemo(() => {
    const totalApproved = FUNDERS.reduce((sum, f) => sum + f.approved, 0);
    const totalSpent = funderSummaries.reduce((sum, f) => sum + f.spent, 0);
    return {
      totalApproved,
      totalSpent,
      remaining: totalApproved - totalSpent,
      percentUsed: totalApproved > 0 ? (totalSpent / totalApproved) * 100 : 0,
      funderCount: FUNDERS.length,
      fundersWithSpending: funderSummaries.filter(f => f.spent > 0).length,
      transactionCount: entries.filter(e => e.funder).length
    };
  }, [funderSummaries, entries]);

  // Group funders by spending status
  const fundersByStatus = useMemo(() => {
    const overBudget = funderSummaries.filter(f => f.remaining < 0);
    const highUsage = funderSummaries.filter(f => f.remaining >= 0 && f.approved > 0 && (f.spent / f.approved) > 0.75);
    const healthy = funderSummaries.filter(f => f.approved > 0 && (f.spent / f.approved) <= 0.75 && f.spent > 0);
    const unused = funderSummaries.filter(f => f.spent === 0);
    return { overBudget, highUsage, healthy, unused };
  }, [funderSummaries]);

  // Export to CSV
  const exportToCSV = () => {
    let csv = `FOAM Multi-Funder Budget Summary\n`;
    csv += `Generated: ${new Date().toLocaleDateString()}\n\n`;
    csv += 'Funder,Approved,Spent,Remaining,% Used,Status,Transactions\n';
    
    funderSummaries.forEach(f => {
      const percentUsed = f.approved > 0 ? ((f.spent / f.approved) * 100).toFixed(1) : '0.0';
      const status = f.remaining < 0 ? 'Over Budget' : 
                    f.approved > 0 && (f.spent / f.approved) > 0.75 ? 'Monitor' : 
                    f.spent > 0 ? 'On Track' : 'No Spending';
      csv += `"${f.name}",${f.approved},${f.spent},${f.remaining},${percentUsed}%,${status},${f.transactionCount}\n`;
    });
    
    csv += `\nTOTALS,${totals.totalApproved},${totals.totalSpent},${totals.remaining},${totals.percentUsed.toFixed(1)}%,,${totals.transactionCount}\n`;

    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `FOAM_MultiFunder_Summary_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    setShowExportMenu(false);
  };

  const colors = ['#4f46e5', '#0891b2', '#059669', '#d97706', '#dc2626', '#7c3aed', '#db2777', '#0d9488'];

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-16">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 p-8 rounded-[2.5rem] text-white flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl">
        <div className="space-y-2 text-center md:text-left">
          <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <i className="fas fa-hand-holding-usd"></i> Multi-Funder Budget Tracker
          </h2>
          <p className="text-indigo-200 font-bold uppercase tracking-widest text-xs">
            <i className="fas fa-database text-emerald-400 mr-1 text-[8px]"></i>
            Live from Ledger • FY 2025-26 • {FUNDERS.length} Funders • {totals.transactionCount} Transactions
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap justify-center">
          <div className="relative">
            <button onClick={() => setShowExportMenu(!showExportMenu)} className="flex items-center gap-2 px-5 py-2.5 bg-white/20 hover:bg-white/30 rounded-xl font-bold transition-all">
              <i className="fas fa-download"></i> Export
            </button>
            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl z-50 overflow-hidden border border-slate-100">
                <button onClick={exportToCSV} className="w-full px-4 py-3 text-left text-slate-700 hover:bg-slate-50 text-sm font-medium">
                  <i className="fas fa-file-csv text-emerald-500 mr-2"></i>Export Summary
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-indigo-50 rounded-2xl p-5 border border-indigo-100">
          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Total Approved</p>
          <p className="text-2xl font-black text-indigo-600 mt-1">{formatCurrency(totals.totalApproved)}</p>
          <p className="text-xs text-indigo-400 mt-1">{FUNDERS.length} funders</p>
        </div>
        <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100">
          <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Total Spent</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">{formatCurrency(totals.totalSpent)}</p>
          <p className="text-xs text-emerald-400 mt-1">{totals.fundersWithSpending} funders active</p>
        </div>
        <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100">
          <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Remaining</p>
          <p className="text-2xl font-black text-amber-600 mt-1">{formatCurrency(totals.remaining)}</p>
          <p className="text-xs text-amber-400 mt-1">{formatPercent(100 - totals.percentUsed)} available</p>
        </div>
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Utilization</p>
          <p className="text-2xl font-black text-slate-800 mt-1">{formatPercent(totals.percentUsed)}</p>
          <div className="h-2 bg-slate-200 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" style={{ width: `${Math.min(totals.percentUsed, 100)}%` }}></div>
          </div>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full md:w-fit overflow-x-auto hide-scrollbar">
        {[
          { id: 'overview', icon: 'fa-chart-pie', label: 'Overview' },
          { id: 'funders', icon: 'fa-building', label: `All Funders (${FUNDERS.length})` },
          { id: 'comparison', icon: 'fa-balance-scale', label: 'Comparison' }
        ].map(tab => (
          <button 
            key={tab.id} 
            onClick={() => setActiveTab(tab.id as any)} 
            className={`flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === tab.id ? 'bg-[#0F2C5C] text-white shadow-md' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200'
            }`}
          >
            <i className={`fas ${tab.icon}`}></i>
            <span className="whitespace-nowrap">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm min-h-[500px] overflow-hidden">
        
        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="p-8 space-y-8">
            {/* Status Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-rose-50 rounded-2xl p-4 border border-rose-100">
                <p className="text-[10px] font-black text-rose-500 uppercase">Over Budget</p>
                <p className="text-3xl font-black text-rose-600">{fundersByStatus.overBudget.length}</p>
              </div>
              <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
                <p className="text-[10px] font-black text-amber-500 uppercase">High Usage (&gt;75%)</p>
                <p className="text-3xl font-black text-amber-600">{fundersByStatus.highUsage.length}</p>
              </div>
              <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
                <p className="text-[10px] font-black text-emerald-500 uppercase">On Track</p>
                <p className="text-3xl font-black text-emerald-600">{fundersByStatus.healthy.length}</p>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase">No Spending</p>
                <p className="text-3xl font-black text-slate-500">{fundersByStatus.unused.length}</p>
              </div>
            </div>

            {/* Budget Utilization Bar */}
            <div className="bg-slate-900 rounded-3xl p-8 text-white">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black">Overall Budget Utilization</h3>
                <span className="text-3xl font-black text-emerald-400">{formatPercent(totals.percentUsed)}</span>
              </div>
              <div className="h-4 bg-white/20 rounded-full overflow-hidden mb-4">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full transition-all duration-1000" 
                  style={{ width: `${Math.min(totals.percentUsed, 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Spent: <strong className="text-white">{formatCurrency(totals.totalSpent)}</strong></span>
                <span className="text-slate-400">Remaining: <strong className="text-emerald-400">{formatCurrency(totals.remaining)}</strong></span>
              </div>
            </div>

            {/* Top Funders by Spending */}
            <div className="space-y-4">
              <h3 className="text-xl font-black text-slate-800">
                <i className="fas fa-chart-bar text-indigo-600 mr-2"></i>
                Top Funders by Spending
              </h3>
              <div className="space-y-3">
                {funderSummaries
                  .filter(f => f.spent > 0)
                  .sort((a, b) => b.spent - a.spent)
                  .slice(0, 6)
                  .map((funder, idx) => {
                    const percentUsed = funder.approved > 0 ? (funder.spent / funder.approved) * 100 : 0;
                    return (
                      <div key={funder.id} className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-bold text-slate-700">{funder.name}</span>
                          <span className="font-black text-slate-800">{formatCurrency(funder.spent)}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                percentUsed > 90 ? 'bg-rose-500' : percentUsed > 75 ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${Math.min(percentUsed, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-slate-500 w-20 text-right">
                            {formatPercent(percentUsed)} of {formatCurrency(funder.approved)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                {funderSummaries.filter(f => f.spent > 0).length === 0 && (
                  <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                    <i className="fas fa-inbox text-4xl text-slate-300 mb-4"></i>
                    <p className="text-slate-500 font-bold">No spending recorded yet</p>
                    <p className="text-slate-400 text-sm mt-1">Add transactions in the Ledger tab to see spending by funder</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ALL FUNDERS */}
        {activeTab === 'funders' && (
          <div className="p-8 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black text-slate-800">All Funders</h3>
                <p className="text-slate-500 text-sm mt-1">
                  {totals.fundersWithSpending} of {FUNDERS.length} funders have spending recorded
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {funderSummaries.map((funder, idx) => {
                const percentUsed = funder.approved > 0 ? (funder.spent / funder.approved) * 100 : 0;
                return (
                  <div 
                    key={funder.id}
                    className={`rounded-2xl p-5 border transition-all ${
                      funder.remaining < 0 ? 'bg-rose-50 border-rose-200' :
                      percentUsed > 75 ? 'bg-amber-50 border-amber-200' :
                      funder.spent > 0 ? 'bg-white border-slate-200' :
                      'bg-slate-50 border-slate-100'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-bold text-slate-800 text-sm leading-tight">{funder.name}</h4>
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${
                        funder.remaining < 0 ? 'bg-rose-100 text-rose-600' :
                        percentUsed > 75 ? 'bg-amber-100 text-amber-600' :
                        funder.spent > 0 ? 'bg-emerald-100 text-emerald-600' :
                        'bg-slate-100 text-slate-400'
                      }`}>
                        {funder.remaining < 0 ? 'Over' :
                         percentUsed > 75 ? 'Monitor' :
                         funder.spent > 0 ? 'On Track' : 'Unused'}
                      </span>
                    </div>
                    
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Approved:</span>
                        <span className="font-bold text-slate-600">{formatCurrency(funder.approved)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Spent:</span>
                        <span className={`font-bold ${funder.spent > 0 ? 'text-amber-600' : 'text-slate-300'}`}>
                          {formatCurrency(funder.spent)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Remaining:</span>
                        <span className={`font-black ${funder.remaining < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                          {formatCurrency(funder.remaining)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            percentUsed > 90 ? 'bg-rose-500' : percentUsed > 75 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(percentUsed, 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-[10px] text-slate-400">{formatPercent(percentUsed)} used</span>
                        <span className="text-[10px] text-slate-400">{funder.transactionCount} txns</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* COMPARISON */}
        {activeTab === 'comparison' && (
          <div className="p-8 space-y-6">
            <h3 className="text-2xl font-black text-slate-800">Funder Comparison</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-y border-slate-100">
                    <th className="py-4 px-4 text-left text-[10px] font-black text-slate-400 uppercase">Funder</th>
                    <th className="py-4 px-4 text-right text-[10px] font-black text-slate-400 uppercase">Approved</th>
                    <th className="py-4 px-4 text-right text-[10px] font-black text-slate-400 uppercase">Spent</th>
                    <th className="py-4 px-4 text-right text-[10px] font-black text-slate-400 uppercase">Remaining</th>
                    <th className="py-4 px-4 text-center text-[10px] font-black text-slate-400 uppercase">% Used</th>
                    <th className="py-4 px-4 text-center text-[10px] font-black text-slate-400 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {funderSummaries
                    .sort((a, b) => b.spent - a.spent)
                    .map(funder => {
                      const percentUsed = funder.approved > 0 ? (funder.spent / funder.approved) * 100 : 0;
                      return (
                        <tr key={funder.id} className="hover:bg-slate-50">
                          <td className="py-4 px-4 font-bold text-slate-700">{funder.name}</td>
                          <td className="py-4 px-4 text-right text-slate-600">{formatCurrency(funder.approved)}</td>
                          <td className="py-4 px-4 text-right font-bold text-slate-800">{formatCurrency(funder.spent)}</td>
                          <td className={`py-4 px-4 text-right font-bold ${funder.remaining < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                            {formatCurrency(funder.remaining)}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${
                                    percentUsed > 90 ? 'bg-rose-500' : percentUsed > 75 ? 'bg-amber-500' : 'bg-emerald-500'
                                  }`}
                                  style={{ width: `${Math.min(percentUsed, 100)}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-slate-600 w-12">{formatPercent(percentUsed)}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className={`px-2 py-1 rounded-lg text-xs font-black ${
                              funder.remaining < 0 ? 'bg-rose-100 text-rose-600' :
                              percentUsed > 75 ? 'bg-amber-100 text-amber-600' :
                              funder.spent > 0 ? 'bg-emerald-100 text-emerald-600' :
                              'bg-slate-100 text-slate-400'
                            }`}>
                              {funder.remaining < 0 ? 'Over Budget' :
                               percentUsed > 75 ? 'Monitor' :
                               funder.spent > 0 ? 'On Track' : 'Unused'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-800 text-white">
                    <td className="py-4 px-4 font-black">TOTAL</td>
                    <td className="py-4 px-4 text-right font-bold">{formatCurrency(totals.totalApproved)}</td>
                    <td className="py-4 px-4 text-right font-bold">{formatCurrency(totals.totalSpent)}</td>
                    <td className="py-4 px-4 text-right font-bold text-emerald-400">{formatCurrency(totals.remaining)}</td>
                    <td className="py-4 px-4 text-center font-bold">{formatPercent(totals.percentUsed)}</td>
                    <td className="py-4 px-4"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiFunderDashboard;
