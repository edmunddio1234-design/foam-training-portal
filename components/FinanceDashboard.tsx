import React, { useMemo, useState } from 'react';
import { BillEntry } from './FinanceBills';

interface FinanceDashboardProps {
  entries: BillEntry[];
  activeYear: number;
}

type DashboardTab = 'monthly' | 'quarterly' | 'top-spend';

const FinanceDashboard: React.FC<FinanceDashboardProps> = ({ entries, activeYear }) => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('monthly');
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);

  // Filter entries by year - check both year field and payDate year
  const filteredEntries = useMemo(() => {
    return entries.filter(e => {
      const entryYear = e.year || parseInt(e.payDate?.split('-')[0] || '0');
      return entryYear === activeYear;
    });
  }, [entries, activeYear]);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // --- Monthly Calculations ---
  const monthlyData = useMemo(() => {
    return monthNames.map((name, index) => {
      const monthStr = (index + 1).toString().padStart(2, '0');
      const monthEntries = filteredEntries.filter(e => {
        if (!e.payDate) return false;
        const dateParts = e.payDate.split('-');
        return dateParts[1] === monthStr;
      });
      const total = monthEntries.reduce((sum, e) => sum + (e.amount || 0), 0);
      return { index, name, total, entries: monthEntries };
    });
  }, [filteredEntries]);

  // --- Quarterly Calculations ---
  const quarterlyData = useMemo(() => {
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
    return quarters.map(q => {
      const qEntries = filteredEntries.filter(e => e.quarter === q);
      const total = qEntries.reduce((sum, e) => sum + (e.amount || 0), 0);
      return { name: q, total, entries: qEntries };
    });
  }, [filteredEntries]);

  // --- Top Expenditures (Vendors & Items) ---
  const topTransactions = useMemo(() => {
    return [...filteredEntries].sort((a, b) => (b.amount || 0) - (a.amount || 0)).slice(0, 10);
  }, [filteredEntries]);

  const topVendors = useMemo(() => {
    const agg: Record<string, number> = {};
    filteredEntries.forEach(e => {
      const v = e.vendor || e.description || 'Unknown Vendor';
      agg[v] = (agg[v] || 0) + (e.amount || 0);
    });
    return Object.entries(agg)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
  }, [filteredEntries]);

  const topCategories = useMemo(() => {
    const agg: Record<string, number> = {};
    filteredEntries.forEach(e => {
      const cat = e.mainCategory || 'Uncategorized';
      agg[cat] = (agg[cat] || 0) + (e.amount || 0);
    });
    return Object.entries(agg)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6);
  }, [filteredEntries]);

  const topItems = useMemo(() => {
    const agg: Record<string, number> = {};
    filteredEntries.forEach(e => {
      const item = e.name || e.description || 'Unspecified Item';
      agg[item] = (agg[item] || 0) + (e.amount || 0);
    });
    return Object.entries(agg)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
  }, [filteredEntries]);

  const totalExpenditure = useMemo(() => filteredEntries.reduce((acc, e) => acc + (e.amount || 0), 0), [filteredEntries]);
  const maxMonthlySpend = useMemo(() => Math.max(...monthlyData.map(m => m.total), 1), [monthlyData]);

  // Debug info
  console.log('FinanceDashboard Debug:', {
    totalEntries: entries.length,
    filteredEntries: filteredEntries.length,
    activeYear,
    totalExpenditure,
    monthlyTotals: monthlyData.map(m => ({ month: m.name, total: m.total }))
  });

  if (entries.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-12 text-center space-y-6 bg-slate-50 rounded-[3rem] border-4 border-dashed border-slate-200">
         <div className="w-24 h-24 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center animate-pulse">
            <i className="fas fa-chart-pie text-4xl"></i>
         </div>
         <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-800">No Analysis Data</h2>
            <p className="text-slate-500 font-medium max-w-md mx-auto">Please populate the Ledger Registry or use the Data Exchange to import financial data for analysis.</p>
         </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-16">
      {/* Header Summary */}
      <div className="bg-[#0F2C5C] p-8 rounded-[2.5rem] text-white flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl">
        <div className="space-y-2 text-center md:text-left">
          <h2 className="text-4xl font-black tracking-tight">Fiscal Analysis Portal</h2>
          <p className="text-blue-200 font-bold uppercase tracking-widest text-xs">Reporting Period: FY {activeYear}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/10 text-center min-w-[120px]">
            <p className="text-[10px] font-black uppercase text-indigo-300">Transactions</p>
            <p className="text-2xl font-black tracking-tight">{filteredEntries.length}</p>
          </div>
          <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/10 text-center min-w-[180px]">
            <p className="text-[10px] font-black uppercase text-indigo-300">Total Annual Spend</p>
            <p className="text-3xl font-black tracking-tight">${totalExpenditure.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center md:justify-start bg-slate-100 p-1.5 rounded-2xl w-full md:w-fit overflow-x-auto hide-scrollbar">
        <TabButton active={activeTab === 'monthly'} onClick={() => setActiveTab('monthly')} icon="fa-calendar-alt" label="Monthly Analysis" />
        <TabButton active={activeTab === 'quarterly'} onClick={() => setActiveTab('quarterly')} icon="fa-chart-bar" label="Quarterly Reports" />
        <TabButton active={activeTab === 'top-spend'} onClick={() => setActiveTab('top-spend')} icon="fa-trophy" label="Highest Expenditures" />
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm min-h-[600px] overflow-hidden">
        
        {/* MONTHLY VIEW */}
        {activeTab === 'monthly' && (
          <div className="p-8 space-y-12 animate-in slide-in-from-right-4 duration-500">
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                 <h3 className="text-2xl font-black text-slate-800">Monthly Cash Flow</h3>
                 <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Interactive Chart • Hover for details</span>
              </div>
              
              {/* Bar Chart */}
              <div className="h-72 flex items-end justify-between gap-2 md:gap-3 pt-6 px-2 border-b border-slate-100 pb-4 bg-slate-50 rounded-2xl p-4">
                {monthlyData.map((data, i) => {
                  const heightPercent = maxMonthlySpend > 0 ? (data.total / maxMonthlySpend) * 100 : 0;
                  const hasData = data.total > 0;
                  const isHovered = hoveredMonth === i;
                  
                  return (
                    <div 
                      key={i} 
                      className="flex-1 flex flex-col items-center group relative cursor-pointer"
                      onMouseEnter={() => setHoveredMonth(i)}
                      onMouseLeave={() => setHoveredMonth(null)}
                    >
                      {/* Tooltip */}
                      <div className={`absolute bottom-full mb-2 transition-all duration-200 z-20 pointer-events-none ${isHovered ? 'opacity-100 transform -translate-y-1' : 'opacity-0'}`}>
                        <div className="bg-slate-900 text-white text-xs p-3 rounded-xl font-bold shadow-xl whitespace-nowrap">
                          <div className="text-emerald-400">${data.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                          <div className="text-slate-400 text-[10px] mt-1">{data.entries.length} transactions</div>
                        </div>
                      </div>
                      
                      {/* Bar */}
                      <div className="w-full flex-1 flex items-end justify-center">
                        <div 
                          className={`w-full max-w-[40px] rounded-t-lg transition-all duration-300 ${
                            hasData 
                              ? isHovered 
                                ? 'bg-indigo-500 shadow-lg shadow-indigo-200' 
                                : 'bg-[#0F2C5C] hover:bg-indigo-600'
                              : 'bg-slate-200'
                          }`}
                          style={{ 
                            height: hasData ? `${Math.max(heightPercent, 3)}%` : '3%',
                            minHeight: hasData ? '20px' : '4px'
                          }}
                        ></div>
                      </div>
                      
                      {/* Month Label */}
                      <span className={`text-[10px] mt-3 uppercase font-black transition-colors ${
                        hasData 
                          ? isHovered ? 'text-indigo-600' : 'text-slate-600'
                          : 'text-slate-300'
                      }`}>
                        {data.name}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Monthly Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {monthlyData.filter(m => m.total > 0).map((data) => (
                  <div key={data.name} className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase">{data.name} 2025</p>
                    <p className="text-xl font-black text-[#0F2C5C]">${data.total.toLocaleString()}</p>
                    <p className="text-[10px] text-slate-400">{data.entries.length} transactions</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="space-y-4 border-t border-slate-100 pt-8">
              <h3 className="text-xl font-black text-slate-800">Spending by Category</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {topCategories.map(([category, amount], idx) => {
                  const percent = (amount / totalExpenditure) * 100;
                  const colors = ['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-purple-500', 'bg-cyan-500'];
                  return (
                    <div key={category} className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-slate-700 text-sm">{category}</span>
                        <span className="font-black text-[#0F2C5C]">${amount.toLocaleString()}</span>
                      </div>
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className={`h-full ${colors[idx % colors.length]} rounded-full`} style={{ width: `${percent}%` }}></div>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-2">{percent.toFixed(1)}% of total</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Monthly Comparison Table */}
            <div className="space-y-4 border-t border-slate-100 pt-8">
               <h3 className="text-xl font-black text-slate-800">Month-over-Month Fluctuation Report</h3>
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                   <thead>
                     <tr className="bg-slate-50 border-y border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                       <th className="py-4 px-6">Period</th>
                       <th className="py-4 px-6 text-right">Total Spend</th>
                       <th className="py-4 px-6 text-right">vs. Previous Month</th>
                       <th className="py-4 px-6 text-center">Trend Analysis</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                     {monthlyData.map((curr, idx) => {
                       if (curr.total === 0) return null;
                       const prevWithData = monthlyData.slice(0, idx).reverse().find(m => m.total > 0);
                       if (!prevWithData) {
                         return (
                           <tr key={curr.name} className="group hover:bg-slate-50 transition-colors">
                             <td className="py-4 px-6 font-bold text-slate-700">{curr.name}</td>
                             <td className="py-4 px-6 text-right font-black text-[#0F2C5C]">
                               ${curr.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                             </td>
                             <td className="py-4 px-6 text-right">
                               <span className="text-xs text-slate-400">First month</span>
                             </td>
                             <td className="py-4 px-6 text-center">
                               <span className="text-[10px] font-bold text-slate-300 uppercase">Baseline</span>
                             </td>
                           </tr>
                         );
                       }
                       
                       const diff = curr.total - prevWithData.total;
                       const percentChange = prevWithData.total > 0 ? (diff / prevWithData.total) * 100 : 0;
                       const isSignificant = Math.abs(percentChange) > 20;

                       return (
                         <tr key={curr.name} className={`group hover:bg-slate-50 transition-colors ${hoveredMonth === idx ? 'bg-indigo-50' : ''}`}>
                           <td className="py-4 px-6 font-bold text-slate-700 flex items-center gap-2">
                             <span className="w-8">{curr.name}</span>
                             <span className="text-[10px] text-slate-400 font-medium">vs {prevWithData.name}</span>
                           </td>
                           <td className="py-4 px-6 text-right font-black text-[#0F2C5C]">
                             ${curr.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                           </td>
                           <td className="py-4 px-6 text-right">
                             <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                               diff > 0 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                             }`}>
                               {diff > 0 ? '+' : ''}{percentChange.toFixed(1)}% ({diff > 0 ? '+' : ''}${diff.toLocaleString()})
                             </span>
                           </td>
                           <td className="py-4 px-6 text-center">
                              {isSignificant ? (
                                <span className="text-[10px] font-black text-amber-500 uppercase flex items-center justify-center gap-1">
                                  <i className="fas fa-exclamation-triangle"></i> Review
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold text-slate-300 uppercase">Stable</span>
                              )}
                           </td>
                         </tr>
                       );
                     })}
                   </tbody>
                 </table>
               </div>
            </div>
          </div>
        )}

        {/* QUARTERLY VIEW */}
        {activeTab === 'quarterly' && (
          <div className="p-8 space-y-12 animate-in slide-in-from-right-4 duration-500">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {quarterlyData.map((q, i) => (
                  <div key={q.name} className={`rounded-3xl p-6 border flex flex-col justify-between h-44 group hover:shadow-xl transition-all ${
                    q.total > 0 ? 'bg-slate-50 border-slate-100 hover:border-indigo-200 hover:bg-white' : 'bg-slate-50/50 border-dashed border-slate-200'
                  }`}>
                     <div className="flex justify-between items-start">
                       <span className={`text-3xl font-black transition-colors ${q.total > 0 ? 'text-slate-200 group-hover:text-indigo-100' : 'text-slate-100'}`}>{q.name}</span>
                       <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${q.total > 0 ? 'bg-white text-indigo-600' : 'bg-slate-100 text-slate-300'}`}>
                         <i className="fas fa-chart-area"></i>
                       </div>
                     </div>
                     <div>
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Spend</p>
                       <p className={`text-2xl font-black ${q.total > 0 ? 'text-[#0F2C5C]' : 'text-slate-300'}`}>
                         {q.total > 0 ? `$${q.total.toLocaleString()}` : 'No data'}
                       </p>
                       {q.total > 0 && <p className="text-xs text-slate-400 mt-1">{q.entries.length} transactions</p>}
                     </div>
                  </div>
                ))}
             </div>

             <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
                <i className="fas fa-chart-line absolute -right-6 -bottom-6 text-[10rem] opacity-5"></i>
                <h3 className="text-xl font-black mb-8 relative z-10">Quarter-over-Quarter Analysis</h3>
                <div className="space-y-6 relative z-10">
                  {quarterlyData.map((curr, idx) => {
                    if (idx === 0 || curr.total === 0) return null;
                    const prevWithData = quarterlyData.slice(0, idx).reverse().find(q => q.total > 0);
                    if (!prevWithData) return null;
                    
                    const diff = curr.total - prevWithData.total;
                    const percent = prevWithData.total > 0 ? (diff / prevWithData.total) * 100 : 0;
                    
                    return (
                      <div key={idx} className="flex items-center justify-between border-b border-white/10 pb-4">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                               <i className={`fas ${diff > 0 ? 'fa-arrow-trend-up text-rose-400' : 'fa-arrow-trend-down text-emerald-400'}`}></i>
                            </div>
                            <div>
                               <p className="font-bold text-lg">{curr.name} vs {prevWithData.name}</p>
                               <p className="text-xs text-slate-400 opacity-80 uppercase tracking-widest">{diff > 0 ? 'Spending Increased' : 'Spending Decreased'}</p>
                            </div>
                         </div>
                         <div className="text-right">
                            <p className="text-2xl font-black">{diff > 0 ? '+' : ''}{percent.toFixed(1)}%</p>
                            <p className={`text-xs font-bold ${diff > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                              {diff > 0 ? '+' : ''}${Math.abs(diff).toLocaleString()} difference
                            </p>
                         </div>
                      </div>
                    );
                  })}
                  {quarterlyData.filter(q => q.total > 0).length < 2 && (
                    <div className="text-center py-8 text-slate-400">
                      <i className="fas fa-info-circle text-2xl mb-2"></i>
                      <p>Need at least 2 quarters of data for comparison</p>
                    </div>
                  )}
                </div>
             </div>
          </div>
        )}

        {/* TOP SPEND VIEW */}
        {activeTab === 'top-spend' && (
          <div className="p-8 space-y-12 animate-in slide-in-from-right-4 duration-500">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Top Vendors/Descriptions */}
                <div className="space-y-6">
                   <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                     <i className="fas fa-building text-indigo-600"></i> Highest Spend by Payee
                   </h3>
                   <div className="space-y-3">
                     {topVendors.map(([vendor, amount], idx) => (
                       <div key={idx} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:shadow-md transition-all">
                          <div className="flex items-center gap-4">
                             <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${
                               idx === 0 ? 'bg-amber-100 text-amber-600' : 
                               idx === 1 ? 'bg-slate-200 text-slate-500' : 
                               idx === 2 ? 'bg-orange-100 text-orange-600' : 
                               'bg-slate-100 text-slate-400'
                             }`}>
                               {idx + 1}
                             </div>
                             <span className="font-bold text-slate-700 truncate max-w-[200px]">{vendor}</span>
                          </div>
                          <span className="font-black text-[#0F2C5C]">${amount.toLocaleString()}</span>
                       </div>
                     ))}
                   </div>
                </div>

                {/* Top Items (Grouped by Name) */}
                <div className="space-y-6">
                   <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                     <i className="fas fa-tags text-emerald-600"></i> Top Items by Total Cost
                   </h3>
                   <div className="space-y-3">
                     {topItems.map(([item, amount], idx) => (
                       <div key={idx} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:shadow-md transition-all">
                          <div className="flex items-center gap-4">
                             <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${
                               idx === 0 ? 'bg-amber-100 text-amber-600' : 
                               idx === 1 ? 'bg-slate-200 text-slate-500' : 
                               idx === 2 ? 'bg-orange-100 text-orange-600' : 
                               'bg-slate-100 text-slate-400'
                             }`}>
                               {idx + 1}
                             </div>
                             <span className="font-bold text-slate-700 truncate max-w-[200px]">{item}</span>
                          </div>
                          <span className="font-black text-[#0F2C5C]">${amount.toLocaleString()}</span>
                       </div>
                     ))}
                   </div>
                </div>
             </div>

             {/* Top Individual Transactions */}
             <div className="space-y-6 pt-6 border-t border-slate-100">
                <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                  <i className="fas fa-receipt text-rose-500"></i> Largest Single Transactions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {topTransactions.map((t, idx) => (
                    <div key={t.id || idx} className="p-4 rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-all flex flex-col gap-2">
                       <div className="flex justify-between items-start">
                          <span className="font-bold text-slate-800 truncate max-w-[70%]">{t.name || t.description}</span>
                          <span className="font-black text-rose-600">${(t.amount || 0).toLocaleString()}</span>
                       </div>
                       <div className="flex justify-between items-center text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                          <span>{t.payDate} • {t.mainCategory || 'N/A'}</span>
                          <span className="px-2 py-0.5 bg-slate-100 rounded">{t.quarter}</span>
                       </div>
                    </div>
                  ))}
                </div>
             </div>
          </div>
        )}

      </div>
    </div>
  );
};

const TabButton: React.FC<{ active: boolean; onClick: () => void; icon: string; label: string }> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
      active ? 'bg-[#0F2C5C] text-white shadow-md' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200'
    }`}
  >
    <i className={`fas ${icon}`}></i>
    <span className="whitespace-nowrap">{label}</span>
  </button>
);

export default FinanceDashboard;
