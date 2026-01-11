import React, { useState, useMemo } from 'react';
import { BillEntry } from './FinanceBills';

// All 24 funders with their approved amounts and reporting requirements
const FUNDERS_CONFIG = [
  { id: 'act461', name: 'Act 461 Line-Item Appropriation', approved: 200000, source: 'Louisiana Legislature', reportType: 'quarterly', categories: ['Gross Salaries', 'Related Benefits', 'Travel', 'Operating Services', 'Professional Services', 'Other Charges'] },
  { id: 'bcbs', name: 'Blue Cross Blue Shield', approved: 25000, source: 'BCBSLA', reportType: 'quarterly', categories: ['All'] },
  { id: 'cauw', name: 'Capital Area United Way', approved: 10000, source: 'CAUW', reportType: 'annual', categories: ['All'] },
  { id: 'lamar', name: 'Charles Lamar Foundation', approved: 50000, source: 'Lamar Foundation', reportType: 'quarterly', categories: ['All'] },
  { id: 'empower', name: 'Empower Grant (Wilson)', approved: 75000, source: 'Wilson Foundation', reportType: 'quarterly', categories: ['All'] },
  { id: 'homebank', name: 'Home Bank', approved: 2500, source: 'Home Bank', reportType: 'annual', categories: ['All'] },
  { id: 'humana', name: 'Humana Healthy Horizons', approved: 25000, source: 'Humana Foundation', reportType: 'quarterly', categories: ['All'] },
  { id: 'nofa', name: 'NOFA (Mayor Office)', approved: 49000, source: 'NOFA', reportType: 'quarterly', categories: ['All'] },
  { id: 'nsbr', name: 'NSBR', approved: 10000, source: 'NSBR', reportType: 'annual', categories: ['All'] },
  { id: 'pennington', name: 'Pennington Foundation', approved: 20000, source: 'Pennington Foundation', reportType: 'annual', categories: ['All'] },
  { id: 'barrow', name: 'Senator Barrow', approved: 20000, source: 'Senator Barrow', reportType: 'annual', categories: ['All'] },
  { id: 'walmart', name: 'Walmart Foundation (Spark Good)', approved: 4000, source: 'Walmart Foundation', reportType: 'annual', categories: ['All'] },
  { id: 'wilson', name: 'Wilson Foundation', approved: 75000, source: 'Wilson Foundation', reportType: 'quarterly', categories: ['All'] },
  { id: 'bras', name: 'BR Alliance for Students', approved: 15000, source: 'Baton Rouge Alliance for Students', reportType: 'quarterly', categories: ['All'] },
];

interface FinanceReportsProps {
  entries: BillEntry[];
}

const FinanceReports: React.FC<FinanceReportsProps> = ({ entries }) => {
  const [selectedFunder, setSelectedFunder] = useState<string>('act461');
  const [selectedQuarter, setSelectedQuarter] = useState<string>('Q3');
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [reportView, setReportView] = useState<'summary' | 'detailed' | 'attachment-d'>('summary');
  const [showExportOptions, setShowExportOptions] = useState(false);

  const formatCurrency = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n || 0);
  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  // Get the selected funder config
  const currentFunder = FUNDERS_CONFIG.find(f => f.id === selectedFunder) || FUNDERS_CONFIG[0];

  // Filter entries by quarter and year
  const filteredEntries = useMemo(() => {
    return entries.filter(e => {
      const matchQuarter = e.quarter === selectedQuarter;
      const matchYear = e.year === selectedYear;
      return matchQuarter && matchYear;
    });
  }, [entries, selectedQuarter, selectedYear]);

  // Calculate totals by category
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

  // Calculate subcategory totals
  const subcategoryTotals = useMemo(() => {
    const totals: { [key: string]: { amount: number; count: number } } = {};
    
    filteredEntries.forEach(entry => {
      const subcat = entry.subCategory || entry.mainCategory || 'Uncategorized';
      if (!totals[subcat]) totals[subcat] = { amount: 0, count: 0 };
      totals[subcat].amount += entry.amount;
      totals[subcat].count++;
    });

    return totals;
  }, [filteredEntries]);

  // Grand total
  const grandTotal = useMemo(() => {
    return filteredEntries.reduce((sum, e) => sum + e.amount, 0);
  }, [filteredEntries]);

  // Attachment D Categories (Act 461 specific)
  const attachmentDCategories = [
    { name: 'Gross Salaries', budget: 96000 },
    { name: 'Related Benefits', budget: 38400 },
    { name: 'Travel', budget: 2000 },
    { name: 'Operating Services', budget: 43600 },
    { name: 'Professional Services', budget: 18000 },
    { name: 'Other Charges', budget: 2000 },
  ];

  // Calculate spent per Attachment D category
  const attachmentDData = useMemo(() => {
    return attachmentDCategories.map(cat => {
      const spent = categoryTotals[cat.name]?.amount || 0;
      const remaining = cat.budget - spent;
      const percent = cat.budget > 0 ? (spent / cat.budget) * 100 : 0;
      return {
        ...cat,
        spent,
        remaining,
        percent,
        transactions: categoryTotals[cat.name]?.count || 0
      };
    });
  }, [categoryTotals]);

  // All funders summary
  const allFundersSummary = useMemo(() => {
    const totalApproved = FUNDERS_CONFIG.reduce((sum, f) => sum + f.approved, 0);
    return {
      totalApproved,
      totalSpent: grandTotal,
      remaining: totalApproved - grandTotal,
      percentUsed: totalApproved > 0 ? (grandTotal / totalApproved) * 100 : 0,
      funderCount: FUNDERS_CONFIG.length
    };
  }, [grandTotal]);

  // Export functions
  const exportToCSV = () => {
    let csv = `FOAM Financial Report - ${currentFunder.name}\n`;
    csv += `Period: ${selectedQuarter} ${selectedYear}\n`;
    csv += `Generated: ${new Date().toLocaleDateString()}\n\n`;
    
    csv += 'Category,Transactions,Amount\n';
    Object.entries(categoryTotals).forEach(([cat, data]) => {
      csv += `"${cat}",${data.count},${data.amount.toFixed(2)}\n`;
    });
    csv += `\nTOTAL,${filteredEntries.length},${grandTotal.toFixed(2)}\n`;

    csv += '\n\nDetailed Transactions\n';
    csv += 'Date,Description,Category,Vendor,Reference,Amount\n';
    filteredEntries.forEach(e => {
      csv += `${e.payDate},"${e.description}","${e.mainCategory}","${e.vendor}","${e.referenceNumber}",${e.amount.toFixed(2)}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `FOAM_${currentFunder.id}_${selectedQuarter}_${selectedYear}_Report.csv`;
    link.click();
    setShowExportOptions(false);
  };

  const exportAttachmentD = () => {
    let csv = `FOAM - Act 461 Attachment D Summary\n`;
    csv += `Fiscal Year: 2025-2026\n`;
    csv += `Reporting Period: ${selectedQuarter} ${selectedYear}\n`;
    csv += `Generated: ${new Date().toLocaleDateString()}\n\n`;
    
    csv += 'Budget Category,Annual Budget,Spent This Period,Remaining,% Used\n';
    attachmentDData.forEach(cat => {
      csv += `"${cat.name}",${cat.budget.toFixed(2)},${cat.spent.toFixed(2)},${cat.remaining.toFixed(2)},${cat.percent.toFixed(1)}%\n`;
    });
    
    const totalBudget = attachmentDCategories.reduce((s, c) => s + c.budget, 0);
    const totalSpent = attachmentDData.reduce((s, c) => s + c.spent, 0);
    csv += `\nTOTAL,${totalBudget.toFixed(2)},${totalSpent.toFixed(2)},${(totalBudget - totalSpent).toFixed(2)},${((totalSpent/totalBudget)*100).toFixed(1)}%\n`;

    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `FOAM_Attachment_D_${selectedQuarter}_${selectedYear}.csv`;
    link.click();
    setShowExportOptions(false);
  };

  const exportAllFunders = () => {
    let csv = `FOAM - All Funders Financial Summary\n`;
    csv += `Period: ${selectedQuarter} ${selectedYear}\n`;
    csv += `Generated: ${new Date().toLocaleDateString()}\n\n`;
    
    csv += 'Funder,Approved Amount,Report Type,Source\n';
    FUNDERS_CONFIG.forEach(f => {
      csv += `"${f.name}",${f.approved.toFixed(2)},${f.reportType},"${f.source}"\n`;
    });
    
    csv += `\nTOTAL APPROVED,${allFundersSummary.totalApproved.toFixed(2)}\n`;
    csv += `TOTAL SPENT (${selectedQuarter}),${grandTotal.toFixed(2)}\n`;

    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `FOAM_All_Funders_Summary_${selectedQuarter}_${selectedYear}.csv`;
    link.click();
    setShowExportOptions(false);
  };

  const printReport = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 p-8 rounded-[2.5rem] text-white">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
              <i className="fas fa-file-invoice-dollar"></i> Financial Reports
            </h2>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
              Auto-Generated • Treasury Ready • {FUNDERS_CONFIG.length} Funders Tracked
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Quarter Selector */}
            <select 
              value={selectedQuarter} 
              onChange={e => setSelectedQuarter(e.target.value)}
              className="px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              <option value="Q1" className="text-slate-800">Q1 (Jul-Sep)</option>
              <option value="Q2" className="text-slate-800">Q2 (Oct-Dec)</option>
              <option value="Q3" className="text-slate-800">Q3 (Jan-Mar)</option>
              <option value="Q4" className="text-slate-800">Q4 (Apr-Jun)</option>
            </select>

            {/* Year Selector */}
            <select 
              value={selectedYear} 
              onChange={e => setSelectedYear(parseInt(e.target.value))}
              className="px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              <option value={2025} className="text-slate-800">2025</option>
              <option value={2026} className="text-slate-800">2026</option>
            </select>

            {/* Export Button */}
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
                    <i className="fas fa-file-csv text-emerald-500"></i> Current Funder Report
                  </button>
                  <button onClick={exportAttachmentD} className="w-full px-4 py-3 text-left text-slate-700 hover:bg-slate-50 text-sm font-medium flex items-center gap-2">
                    <i className="fas fa-landmark text-indigo-500"></i> Attachment D (Act 461)
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
          <p className="text-2xl font-black text-indigo-600 mt-1">{formatCurrency(allFundersSummary.totalApproved)}</p>
          <p className="text-xs text-indigo-400 mt-1">{FUNDERS_CONFIG.length} funders</p>
        </div>
        <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100">
          <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Spent ({selectedQuarter})</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">{formatCurrency(grandTotal)}</p>
          <p className="text-xs text-emerald-400 mt-1">{filteredEntries.length} transactions</p>
        </div>
        <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100">
          <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Remaining</p>
          <p className="text-2xl font-black text-amber-600 mt-1">{formatCurrency(allFundersSummary.remaining)}</p>
          <p className="text-xs text-amber-400 mt-1">{(100 - allFundersSummary.percentUsed).toFixed(1)}% available</p>
        </div>
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Utilization</p>
          <p className="text-2xl font-black text-slate-800 mt-1">{allFundersSummary.percentUsed.toFixed(1)}%</p>
          <div className="h-2 bg-slate-200 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" style={{ width: `${Math.min(allFundersSummary.percentUsed, 100)}%` }}></div>
          </div>
        </div>
      </div>

      {/* Funder Selector Tabs */}
      <div className="bg-slate-100 p-2 rounded-2xl">
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          <button
            onClick={() => { setSelectedFunder('all'); setReportView('summary'); }}
            className={`flex-none px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              selectedFunder === 'all' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-white'
            }`}
          >
            <i className="fas fa-layer-group mr-2"></i>All Funders
          </button>
          <button
            onClick={() => { setSelectedFunder('act461'); setReportView('attachment-d'); }}
            className={`flex-none px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              selectedFunder === 'act461' ? 'bg-[#0F2C5C] text-white shadow-lg' : 'text-slate-500 hover:bg-white'
            }`}
          >
            <i className="fas fa-landmark mr-2"></i>Act 461 Treasury
          </button>
          {FUNDERS_CONFIG.filter(f => f.id !== 'act461').slice(0, 6).map(funder => (
            <button
              key={funder.id}
              onClick={() => { setSelectedFunder(funder.id); setReportView('summary'); }}
              className={`flex-none px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                selectedFunder === funder.id ? 'bg-[#0F2C5C] text-white shadow-lg' : 'text-slate-500 hover:bg-white'
              }`}
            >
              {funder.name.length > 20 ? funder.name.substring(0, 20) + '...' : funder.name}
            </button>
          ))}
        </div>
      </div>

      {/* Report Content */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden print:shadow-none print:border-none">
        
        {/* ALL FUNDERS VIEW */}
        {selectedFunder === 'all' && (
          <div className="p-8 space-y-8">
            <div className="flex justify-between items-center border-b border-slate-100 pb-6">
              <div>
                <h3 className="text-2xl font-black text-slate-800">All Funders Summary Report</h3>
                <p className="text-slate-500 mt-1">{selectedQuarter} {selectedYear} • Generated {new Date().toLocaleDateString()}</p>
              </div>
              <img src="https://foamla.org/wp-content/uploads/2023/05/foam-logo.png" alt="FOAM" className="h-12 opacity-80" />
            </div>

            {/* Funders Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {FUNDERS_CONFIG.map(funder => {
                const percentOfTotal = (funder.approved / allFundersSummary.totalApproved) * 100;
                return (
                  <div 
                    key={funder.id} 
                    className="bg-slate-50 rounded-2xl p-5 border border-slate-100 hover:shadow-lg hover:border-indigo-200 transition-all cursor-pointer"
                    onClick={() => { setSelectedFunder(funder.id); setReportView('summary'); }}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-bold text-slate-800 leading-tight">{funder.name}</h4>
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase ${
                        funder.reportType === 'quarterly' ? 'bg-amber-100 text-amber-600' : 'bg-slate-200 text-slate-500'
                      }`}>
                        {funder.reportType}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mb-3">{funder.source}</p>
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-2xl font-black text-emerald-600">{formatCurrency(funder.approved)}</p>
                        <p className="text-xs text-slate-400">{percentOfTotal.toFixed(1)}% of total</p>
                      </div>
                      <i className="fas fa-chevron-right text-slate-300"></i>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Category Breakdown */}
            <div className="border-t border-slate-100 pt-8">
              <h4 className="text-xl font-black text-slate-800 mb-6">
                <i className="fas fa-tags text-indigo-500 mr-2"></i>
                Spending by Category ({selectedQuarter} {selectedYear})
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-y border-slate-100">
                      <th className="py-4 px-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                      <th className="py-4 px-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Transactions</th>
                      <th className="py-4 px-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                      <th className="py-4 px-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">% of Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {Object.entries(categoryTotals)
                      .sort((a, b) => b[1].amount - a[1].amount)
                      .map(([category, data]) => (
                        <tr key={category} className="hover:bg-slate-50">
                          <td className="py-4 px-6 font-bold text-slate-700">{category}</td>
                          <td className="py-4 px-6 text-center text-slate-500">{data.count}</td>
                          <td className="py-4 px-6 text-right font-black text-slate-800">{formatCurrency(data.amount)}</td>
                          <td className="py-4 px-6 text-right text-slate-500">{((data.amount / grandTotal) * 100).toFixed(1)}%</td>
                        </tr>
                      ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-800 text-white">
                      <td className="py-4 px-6 font-black">TOTAL</td>
                      <td className="py-4 px-6 text-center font-bold">{filteredEntries.length}</td>
                      <td className="py-4 px-6 text-right font-black">{formatCurrency(grandTotal)}</td>
                      <td className="py-4 px-6 text-right font-bold">100%</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ACT 461 ATTACHMENT D VIEW */}
        {selectedFunder === 'act461' && (
          <div className="p-8 space-y-8">
            {/* Report Header */}
            <div className="flex justify-between items-start border-b border-slate-100 pb-6">
              <div>
                <h3 className="text-2xl font-black text-slate-800">Act 461 - Attachment D Summary</h3>
                <p className="text-slate-500 mt-1">Louisiana Workforce Initiative • FY 2025-2026</p>
                <p className="text-sm text-slate-400 mt-2">Reporting Period: {selectedQuarter} {selectedYear}</p>
              </div>
              <div className="text-right">
                <img src="https://foamla.org/wp-content/uploads/2023/05/foam-logo.png" alt="FOAM" className="h-12 opacity-80 ml-auto mb-2" />
                <p className="text-xs text-slate-400">Fathers On A Mission</p>
                <p className="text-xs text-slate-400">Generated: {new Date().toLocaleDateString()}</p>
              </div>
            </div>

            {/* Budget vs Actual Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#0F2C5C] text-white">
                    <th className="py-4 px-6 text-left text-xs font-black uppercase tracking-widest">Budget Category</th>
                    <th className="py-4 px-6 text-right text-xs font-black uppercase tracking-widest">Annual Budget</th>
                    <th className="py-4 px-6 text-right text-xs font-black uppercase tracking-widest">Spent ({selectedQuarter})</th>
                    <th className="py-4 px-6 text-right text-xs font-black uppercase tracking-widest">Remaining</th>
                    <th className="py-4 px-6 text-center text-xs font-black uppercase tracking-widest">% Used</th>
                    <th className="py-4 px-6 text-center text-xs font-black uppercase tracking-widest">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {attachmentDData.map((cat, idx) => (
                    <tr key={cat.name} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                      <td className="py-4 px-6">
                        <span className="font-bold text-slate-800">{cat.name}</span>
                        <span className="text-xs text-slate-400 ml-2">({cat.transactions} txns)</span>
                      </td>
                      <td className="py-4 px-6 text-right font-mono text-slate-600">{formatCurrency(cat.budget)}</td>
                      <td className="py-4 px-6 text-right font-mono font-bold text-slate-800">{formatCurrency(cat.spent)}</td>
                      <td className="py-4 px-6 text-right font-mono text-emerald-600">{formatCurrency(cat.remaining)}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${cat.percent > 90 ? 'bg-red-500' : cat.percent > 75 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                              style={{ width: `${Math.min(cat.percent, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-bold text-slate-600 w-12">{cat.percent.toFixed(1)}%</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-black ${
                          cat.percent > 90 ? 'bg-red-100 text-red-600' : 
                          cat.percent > 75 ? 'bg-amber-100 text-amber-600' : 
                          'bg-emerald-100 text-emerald-600'
                        }`}>
                          {cat.percent > 90 ? 'Critical' : cat.percent > 75 ? 'Monitor' : 'On Track'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-800 text-white">
                    <td className="py-4 px-6 font-black">TOTAL</td>
                    <td className="py-4 px-6 text-right font-mono font-bold">{formatCurrency(200000)}</td>
                    <td className="py-4 px-6 text-right font-mono font-bold">{formatCurrency(attachmentDData.reduce((s, c) => s + c.spent, 0))}</td>
                    <td className="py-4 px-6 text-right font-mono font-bold text-emerald-400">{formatCurrency(200000 - attachmentDData.reduce((s, c) => s + c.spent, 0))}</td>
                    <td className="py-4 px-6 text-center font-bold">{((attachmentDData.reduce((s, c) => s + c.spent, 0) / 200000) * 100).toFixed(1)}%</td>
                    <td className="py-4 px-6"></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Detailed Transactions */}
            <div className="border-t border-slate-100 pt-8">
              <h4 className="text-xl font-black text-slate-800 mb-6">
                <i className="fas fa-list text-indigo-500 mr-2"></i>
                Detailed Transaction Log
              </h4>
              <div className="overflow-x-auto max-h-96 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-white">
                    <tr className="bg-slate-50 border-y border-slate-100">
                      <th className="py-3 px-4 text-left text-[10px] font-black text-slate-400 uppercase">Date</th>
                      <th className="py-3 px-4 text-left text-[10px] font-black text-slate-400 uppercase">Description</th>
                      <th className="py-3 px-4 text-left text-[10px] font-black text-slate-400 uppercase">Category</th>
                      <th className="py-3 px-4 text-left text-[10px] font-black text-slate-400 uppercase">Reference</th>
                      <th className="py-3 px-4 text-right text-[10px] font-black text-slate-400 uppercase">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredEntries
                      .sort((a, b) => new Date(a.payDate).getTime() - new Date(b.payDate).getTime())
                      .map((entry, idx) => (
                        <tr key={entry.id || idx} className="hover:bg-slate-50">
                          <td className="py-3 px-4 text-slate-600">{formatDate(entry.payDate)}</td>
                          <td className="py-3 px-4 text-slate-800 font-medium">{entry.description}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 bg-slate-100 rounded text-xs text-slate-600">{entry.mainCategory}</span>
                          </td>
                          <td className="py-3 px-4 text-slate-400 font-mono text-xs">{entry.referenceNumber}</td>
                          <td className="py-3 px-4 text-right font-bold text-slate-800">{formatCurrency(entry.amount)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Certification Footer */}
            <div className="border-t border-slate-200 pt-8 mt-8 print:mt-16">
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                <h5 className="font-black text-slate-700 mb-4">Certification Statement</h5>
                <p className="text-sm text-slate-600 mb-6">
                  I certify that the information contained in this report is accurate and complete to the best of my knowledge. 
                  All expenditures reported were made in accordance with the approved budget and applicable regulations.
                </p>
                <div className="grid grid-cols-2 gap-8 mt-8">
                  <div>
                    <div className="border-b border-slate-300 mb-2 h-8"></div>
                    <p className="text-xs text-slate-500">Authorized Signature</p>
                  </div>
                  <div>
                    <div className="border-b border-slate-300 mb-2 h-8"></div>
                    <p className="text-xs text-slate-500">Date</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* INDIVIDUAL FUNDER VIEW */}
        {selectedFunder !== 'all' && selectedFunder !== 'act461' && (
          <div className="p-8 space-y-8">
            <div className="flex justify-between items-start border-b border-slate-100 pb-6">
              <div>
                <h3 className="text-2xl font-black text-slate-800">{currentFunder.name}</h3>
                <p className="text-slate-500 mt-1">{currentFunder.source}</p>
                <div className="flex items-center gap-4 mt-3">
                  <span className={`px-3 py-1 rounded-xl text-xs font-black ${
                    currentFunder.reportType === 'quarterly' ? 'bg-amber-100 text-amber-600' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {currentFunder.reportType} reporting
                  </span>
                  <span className="text-sm text-slate-500">{selectedQuarter} {selectedYear}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400 uppercase font-bold">Approved Amount</p>
                <p className="text-3xl font-black text-emerald-600">{formatCurrency(currentFunder.approved)}</p>
              </div>
            </div>

            {/* Funder Stats */}
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase">Approved</p>
                <p className="text-2xl font-black text-slate-800 mt-1">{formatCurrency(currentFunder.approved)}</p>
              </div>
              <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100">
                <p className="text-[10px] font-black text-emerald-500 uppercase">Spent ({selectedQuarter})</p>
                <p className="text-2xl font-black text-emerald-600 mt-1">{formatCurrency(grandTotal)}</p>
              </div>
              <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100">
                <p className="text-[10px] font-black text-amber-500 uppercase">Remaining</p>
                <p className="text-2xl font-black text-amber-600 mt-1">{formatCurrency(currentFunder.approved - grandTotal)}</p>
              </div>
            </div>

            {/* Category Breakdown */}
            <div>
              <h4 className="text-lg font-black text-slate-800 mb-4">Spending by Category</h4>
              <div className="space-y-3">
                {Object.entries(categoryTotals)
                  .sort((a, b) => b[1].amount - a[1].amount)
                  .map(([category, data]) => {
                    const percent = (data.amount / grandTotal) * 100;
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
                          <span className="text-xs text-slate-500 w-12">{percent.toFixed(1)}%</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Transactions */}
            <div className="border-t border-slate-100 pt-6">
              <h4 className="text-lg font-black text-slate-800 mb-4">Recent Transactions</h4>
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
                    {filteredEntries.slice(0, 20).map((entry, idx) => (
                      <tr key={entry.id || idx} className="hover:bg-slate-50">
                        <td className="py-3 px-4 text-slate-600">{formatDate(entry.payDate)}</td>
                        <td className="py-3 px-4 text-slate-800 font-medium">{entry.description}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 bg-slate-100 rounded text-xs">{entry.mainCategory}</span>
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-slate-800">{formatCurrency(entry.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print\\:shadow-none, .print\\:shadow-none * { visibility: visible; }
          .print\\:shadow-none { position: absolute; left: 0; top: 0; width: 100%; }
          button, select, .hide-scrollbar { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default FinanceReports;
