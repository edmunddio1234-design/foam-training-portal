import React, { useState, useMemo } from 'react';
import { BillEntry, FUNDERS, getAllFunderSummaries } from './FinanceBills';

interface FinanceReportsProps {
  entries: BillEntry[];
}

const FinanceReports: React.FC<FinanceReportsProps> = ({ entries }) => {
  const [selectedFunder, setSelectedFunder] = useState<string>('all');
  const [selectedQuarter, setSelectedQuarter] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [showExportOptions, setShowExportOptions] = useState(false);

  const formatCurrency = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n || 0);
  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  // Get all funder summaries with spending calculated from entries
  const funderSummaries = useMemo(() => getAllFunderSummaries(entries), [entries]);

  // Get the selected funder info
  const currentFunder = useMemo(() => {
    if (selectedFunder === 'all') return null;
    return funderSummaries.find(f => f.id === selectedFunder);
  }, [selectedFunder, funderSummaries]);

  // Filter entries by funder, quarter, and year
  const filteredEntries = useMemo(() => {
    let result = entries;
    
    // Filter by year
    result = result.filter(e => e.year === selectedYear);
    
    // Filter by funder (if not "all")
    if (selectedFunder !== 'all' && currentFunder) {
      result = result.filter(e => e.funder === currentFunder.name);
    }
    
    // Filter by quarter (if selected)
    if (selectedQuarter) {
      result = result.filter(e => e.quarter === selectedQuarter);
    }
    
    return result;
  }, [entries, selectedFunder, selectedQuarter, selectedYear, currentFunder]);

  // Calculate totals by category for filtered entries
  const categoryTotals = useMemo(() => {
    const totals: { [key: string]: { amount: number; count: number; items: BillEntry[] } } = {};
    
    filteredEntries.forEach(entry => {
      const cat = entry.mainCategory || 'Uncategorized';
      if (!totals[cat]) totals[cat] = { amount: 0, count: 0, items: [] };
      totals[cat].amount += entry.amount;
      totals[cat].count++;
      totals[cat].items.push(entry);
    });

    return totals;
  }, [filteredEntries]);

  // Grand total for filtered entries
  const grandTotal = useMemo(() => {
    return filteredEntries.reduce((sum, e) => sum + e.amount, 0);
  }, [filteredEntries]);

  // All funders totals
  const allFundersTotals = useMemo(() => {
    const totalApproved = FUNDERS.reduce((sum, f) => sum + f.approved, 0);
    const totalSpent = funderSummaries.reduce((sum, f) => sum + f.spent, 0);
    return {
      totalApproved,
      totalSpent,
      remaining: totalApproved - totalSpent,
      percentUsed: totalApproved > 0 ? (totalSpent / totalApproved) * 100 : 0,
      funderCount: FUNDERS.length
    };
  }, [funderSummaries]);

  // Export functions
  const exportToCSV = () => {
    const funderName = currentFunder ? currentFunder.name : 'All_Funders';
    let csv = `FOAM Financial Report - ${funderName}\n`;
    csv += `Period: ${selectedQuarter || 'All Quarters'} ${selectedYear}\n`;
    csv += `Generated: ${new Date().toLocaleDateString()}\n\n`;
    
    if (currentFunder) {
      csv += `Approved: ${currentFunder.approved}\n`;
      csv += `Spent: ${currentFunder.spent}\n`;
      csv += `Remaining: ${currentFunder.remaining}\n\n`;
    }
    
    csv += 'Category,Transactions,Amount\n';
    Object.entries(categoryTotals).forEach(([cat, data]) => {
      csv += `"${cat}",${data.count},${data.amount.toFixed(2)}\n`;
    });
    csv += `\nTOTAL,${filteredEntries.length},${grandTotal.toFixed(2)}\n`;

    csv += '\n\nDetailed Transactions\n';
    csv += 'Date,Description,Category,Funder,Vendor,Reference,Amount\n';
    filteredEntries.forEach(e => {
      csv += `${e.payDate},"${e.description || e.name}","${e.mainCategory}","${e.funder || 'Unassigned'}","${e.vendor}","${e.referenceNumber}",${e.amount.toFixed(2)}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `FOAM_${funderName.replace(/\s+/g, '_')}_${selectedQuarter || 'ALL'}_${selectedYear}_Report.csv`;
    link.click();
    setShowExportOptions(false);
  };

  const exportAllFunders = () => {
    let csv = `FOAM - All Funders Financial Summary\n`;
    csv += `Period: ${selectedQuarter || 'All Quarters'} ${selectedYear}\n`;
    csv += `Generated: ${new Date().toLocaleDateString()}\n\n`;
    
    csv += 'Funder,Approved Amount,Spent,Remaining,% Used,Transactions\n';
    funderSummaries.forEach(f => {
      const percentUsed = f.approved > 0 ? ((f.spent / f.approved) * 100).toFixed(1) : '0.0';
      csv += `"${f.name}",${f.approved.toFixed(2)},${f.spent.toFixed(2)},${f.remaining.toFixed(2)},${percentUsed}%,${f.transactionCount}\n`;
    });
    
    csv += `\nTOTAL APPROVED,${allFundersTotals.totalApproved.toFixed(2)}\n`;
    csv += `TOTAL SPENT,${allFundersTotals.totalSpent.toFixed(2)}\n`;
    csv += `TOTAL REMAINING,${allFundersTotals.remaining.toFixed(2)}\n`;

    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `FOAM_All_Funders_Summary_${selectedYear}.csv`;
    link.click();
    setShowExportOptions(false);
  };

  const printReport = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-16">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 p-8 rounded-[2.5rem] text-white">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
              <i className="fas fa-file-invoice-dollar"></i> Financial Reports
            </h2>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
              Funder-Specific Tracking • {FUNDERS.length} Funders • Real-Time Balances
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <select 
              value={selectedQuarter} 
              onChange={e => setSelectedQuarter(e.target.value)}
              className="px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white font-bold text-sm focus:outline-none"
            >
              <option value="" className="text-slate-800">All Quarters</option>
              <option value="Q1" className="text-slate-800">Q1</option>
              <option value="Q2" className="text-slate-800">Q2</option>
              <option value="Q3" className="text-slate-800">Q3</option>
              <option value="Q4" className="text-slate-800">Q4</option>
            </select>

            <select 
              value={selectedYear} 
              onChange={e => setSelectedYear(parseInt(e.target.value))}
              className="px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white font-bold text-sm focus:outline-none"
            >
              <option value={2025} className="text-slate-800">2025</option>
              <option value={2026} className="text-slate-800">2026</option>
            </select>

            <div className="relative">
              <button 
                onClick={() => setShowExportOptions(!showExportOptions)}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 rounded-xl font-bold transition-all"
              >
                <i className="fas fa-download"></i> Export
              </button>
              {showExportOptions && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl z-50 overflow-hidden border border-slate-100">
                  <button onClick={exportToCSV} className="w-full px-4 py-3 text-left text-slate-700 hover:bg-slate-50 text-sm font-medium flex items-center gap-2">
                    <i className="fas fa-file-csv text-emerald-500"></i> Current View Report
                  </button>
                  <button onClick={exportAllFunders} className="w-full px-4 py-3 text-left text-slate-700 hover:bg-slate-50 text-sm font-medium flex items-center gap-2">
                    <i className="fas fa-layer-group text-purple-500"></i> All Funders Summary
                  </button>
                  <button onClick={printReport} className="w-full px-4 py-3 text-left text-indigo-600 hover:bg-indigo-50 text-sm font-bold border-t flex items-center gap-2">
                    <i className="fas fa-print"></i> Print Report
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-indigo-50 rounded-2xl p-5 border border-indigo-100">
          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Total Approved</p>
          <p className="text-2xl font-black text-indigo-600 mt-1">{formatCurrency(allFundersTotals.totalApproved)}</p>
          <p className="text-xs text-indigo-400 mt-1">{FUNDERS.length} funders</p>
        </div>
        <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100">
          <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Total Spent</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">{formatCurrency(allFundersTotals.totalSpent)}</p>
          <p className="text-xs text-emerald-400 mt-1">{entries.filter(e => e.funder).length} transactions</p>
        </div>
        <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100">
          <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Remaining</p>
          <p className="text-2xl font-black text-amber-600 mt-1">{formatCurrency(allFundersTotals.remaining)}</p>
          <p className="text-xs text-amber-400 mt-1">{(100 - allFundersTotals.percentUsed).toFixed(1)}% available</p>
        </div>
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Utilization</p>
          <p className="text-2xl font-black text-slate-800 mt-1">{allFundersTotals.percentUsed.toFixed(1)}%</p>
          <div className="h-2 bg-slate-200 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" style={{ width: `${Math.min(allFundersTotals.percentUsed, 100)}%` }}></div>
          </div>
        </div>
      </div>

      {/* Funder Selector Tabs */}
      <div className="bg-slate-100 p-2 rounded-2xl">
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          <button
            onClick={() => setSelectedFunder('all')}
            className={`flex-none px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              selectedFunder === 'all' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-white'
            }`}
          >
            <i className="fas fa-layer-group mr-2"></i>All Funders
          </button>
          {funderSummaries.map(funder => (
            <button
              key={funder.id}
              onClick={() => setSelectedFunder(funder.id)}
              className={`flex-none px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                selectedFunder === funder.id ? 'bg-[#0F2C5C] text-white shadow-lg' : 'text-slate-500 hover:bg-white'
              }`}
            >
              {funder.name.length > 12 ? funder.name.substring(0, 12) + '...' : funder.name}
              {funder.spent > 0 && <span className="ml-1 text-[9px] opacity-70">${(funder.spent/1000).toFixed(0)}k</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Report Content */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        
        {/* ALL FUNDERS VIEW */}
        {selectedFunder === 'all' && (
          <div className="p-8 space-y-8">
            <div className="flex justify-between items-center border-b border-slate-100 pb-6">
              <div>
                <h3 className="text-2xl font-black text-slate-800">All Funders Summary</h3>
                <p className="text-slate-500 mt-1">{selectedQuarter || 'All Quarters'} {selectedYear}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {funderSummaries.map(funder => {
                const percentUsed = funder.approved > 0 ? (funder.spent / funder.approved) * 100 : 0;
                return (
                  <div 
                    key={funder.id} 
                    className={`rounded-2xl p-5 border transition-all cursor-pointer hover:shadow-lg ${
                      funder.spent > 0 ? 'bg-white border-slate-200 hover:border-indigo-300' : 'bg-slate-50 border-slate-100'
                    }`}
                    onClick={() => setSelectedFunder(funder.id)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-bold text-slate-800 leading-tight text-sm">{funder.name}</h4>
                      <i className="fas fa-chevron-right text-slate-300"></i>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Approved:</span>
                        <span className="font-bold text-slate-600">{formatCurrency(funder.approved)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Spent:</span>
                        <span className={`font-bold ${funder.spent > 0 ? 'text-amber-600' : 'text-slate-300'}`}>
                          {funder.spent > 0 ? formatCurrency(funder.spent) : '$0.00'}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Remaining:</span>
                        <span className={`font-black ${funder.remaining < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                          {formatCurrency(funder.remaining)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            percentUsed > 90 ? 'bg-rose-500' : percentUsed > 75 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(percentUsed, 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-[10px] text-slate-400">{percentUsed.toFixed(1)}% used</span>
                        <span className="text-[10px] text-slate-400">{funder.transactionCount} txns</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* INDIVIDUAL FUNDER VIEW */}
        {selectedFunder !== 'all' && currentFunder && (
          <div className="p-8 space-y-8">
            <div className="flex justify-between items-start border-b border-slate-100 pb-6">
              <div>
                <h3 className="text-2xl font-black text-slate-800">{currentFunder.name}</h3>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-sm text-slate-500">{selectedQuarter || 'All Quarters'} {selectedYear}</span>
                  <span className={`px-3 py-1 rounded-xl text-xs font-black ${
                    currentFunder.spent === 0 ? 'bg-slate-100 text-slate-500' :
                    currentFunder.remaining < 0 ? 'bg-rose-100 text-rose-600' :
                    currentFunder.spent / currentFunder.approved > 0.75 ? 'bg-amber-100 text-amber-600' :
                    'bg-emerald-100 text-emerald-600'
                  }`}>
                    {currentFunder.spent === 0 ? 'No Spending' :
                     currentFunder.remaining < 0 ? 'Over Budget' :
                     currentFunder.spent / currentFunder.approved > 0.75 ? 'Monitor' : 'On Track'}
                  </span>
                </div>
              </div>
              <button onClick={() => setSelectedFunder('all')} className="px-4 py-2 text-slate-400 hover:text-slate-600 text-sm font-bold">
                <i className="fas fa-arrow-left mr-2"></i>Back
              </button>
            </div>

            {/* Funder Stats */}
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100">
                <p className="text-[10px] font-black text-indigo-500 uppercase">Approved</p>
                <p className="text-3xl font-black text-indigo-600 mt-2">{formatCurrency(currentFunder.approved)}</p>
              </div>
              <div className={`rounded-2xl p-6 border ${currentFunder.spent > 0 ? 'bg-amber-50 border-amber-100' : 'bg-slate-50 border-slate-100'}`}>
                <p className={`text-[10px] font-black uppercase ${currentFunder.spent > 0 ? 'text-amber-500' : 'text-slate-400'}`}>Spent</p>
                <p className={`text-3xl font-black mt-2 ${currentFunder.spent > 0 ? 'text-amber-600' : 'text-slate-300'}`}>
                  {formatCurrency(grandTotal)}
                </p>
              </div>
              <div className={`rounded-2xl p-6 border ${currentFunder.remaining < 0 ? 'bg-rose-50 border-rose-100' : 'bg-emerald-50 border-emerald-100'}`}>
                <p className={`text-[10px] font-black uppercase ${currentFunder.remaining < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>Remaining</p>
                <p className={`text-3xl font-black mt-2 ${currentFunder.remaining < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {formatCurrency(currentFunder.approved - grandTotal)}
                </p>
              </div>
            </div>

            {/* Category Breakdown or Empty State */}
            {Object.keys(categoryTotals).length > 0 ? (
              <div className="space-y-4">
                <h4 className="text-lg font-black text-slate-800">Spending by Category</h4>
                <div className="space-y-3">
                  {Object.entries(categoryTotals)
                    .sort((a, b) => b[1].amount - a[1].amount)
                    .map(([category, data]) => {
                      const percent = grandTotal > 0 ? (data.amount / grandTotal) * 100 : 0;
                      return (
                        <div key={category} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                          <div className="flex justify-between mb-2">
                            <span className="font-bold text-slate-700">{category}</span>
                            <span className="font-black text-slate-800">{formatCurrency(data.amount)}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${percent}%` }}></div>
                            </div>
                            <span className="text-xs text-slate-500 w-16 text-right">{percent.toFixed(1)}%</span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            ) : (
              <div className="text-center py-16 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <i className="fas fa-inbox text-5xl text-slate-300 mb-4"></i>
                <p className="text-lg font-bold text-slate-500">No transactions assigned to this funder</p>
                <p className="text-slate-400 text-sm mt-2">Add transactions in the Ledger tab and assign them to "{currentFunder.name}"</p>
              </div>
            )}

            {/* Transactions List */}
            {filteredEntries.length > 0 && (
              <div className="border-t border-slate-100 pt-6">
                <h4 className="text-lg font-black text-slate-800 mb-4">Transactions ({filteredEntries.length})</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-y border-slate-100">
                        <th className="py-3 px-4 text-left text-[10px] font-black text-slate-400 uppercase">Date</th>
                        <th className="py-3 px-4 text-left text-[10px] font-black text-slate-400 uppercase">Description</th>
                        <th className="py-3 px-4 text-left text-[10px] font-black text-slate-400 uppercase">Category</th>
                        <th className="py-3 px-4 text-right text-[10px] font-black text-slate-400 uppercase">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredEntries.map((entry, idx) => (
                        <tr key={entry.id || idx} className="hover:bg-slate-50">
                          <td className="py-3 px-4 text-slate-600">{formatDate(entry.payDate)}</td>
                          <td className="py-3 px-4 text-slate-800 font-medium">{entry.name || entry.description}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 bg-slate-100 rounded text-xs">{entry.mainCategory}</span>
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-slate-800">{formatCurrency(entry.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-800 text-white">
                        <td colSpan={3} className="py-3 px-4 font-black">TOTAL</td>
                        <td className="py-3 px-4 text-right font-black">{formatCurrency(grandTotal)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FinanceReports;
