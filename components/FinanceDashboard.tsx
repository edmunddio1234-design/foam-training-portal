
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

  const filteredEntries = useMemo(() => entries.filter(e => e.year === activeYear), [entries, activeYear]);
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // --- Monthly Calculations ---
  const monthlyData = useMemo(() => {
    return monthNames.map((name, index) => {
      const monthStr = (index + 1).toString().padStart(2, '0');
      const monthEntries = filteredEntries.filter(e => e.payDate.split('-')[1] === monthStr);
      const total = monthEntries.reduce((sum, e) => sum + e.amount, 0);
      return { index, name, total, entries: monthEntries };
    });
  }, [filteredEntries]);

  // --- Quarterly Calculations ---
  const quarterlyData = useMemo(() => {
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
    return quarters.map(q => {
      const qEntries = filteredEntries.filter(e => e.quarter === q);
      const total = qEntries.reduce((sum, e) => sum + e.amount, 0);
      return { name: q, total, entries: qEntries };
    });
  }, [filteredEntries]);

  // --- Top Expenditures (Vendors & Items) ---
  const topTransactions = useMemo(() => {
    return [...filteredEntries].sort((a, b) => b.amount - a.amount).slice(0, 10);
  }, [filteredEntries]);

  const topVendors = useMemo(() => {
    const agg: Record<string, number> = {};
    filteredEntries.forEach(e => {
      const v = e.vendor || 'Unknown Vendor';
      agg[v] = (agg[v] || 0) + e.amount;
    });
    return Object.entries(agg)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
  }, [filteredEntries]);

  const topItems = useMemo(() => {
    const agg: Record<string, number> = {};
    filteredEntries.forEach(e => {
      const item = e.name || 'Unspecified Item';
      agg[item] = (agg[item] || 0) + e.amount;
    });
    return Object.entries(agg)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
  }, [filteredEntries]);

  const totalExpenditure = useMemo(() => monthlyData.reduce((acc, m) => acc + m.total, 0), [monthlyData]);

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
        <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/10 text-center min-w-[180px]">
          <p className="text-[10px] font-black uppercase text-indigo-300">Total Annual Spend</p>
          <p className="text-3xl font-black tracking-tight">${totalExpenditure.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
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
                 <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Interactive Chart</span>
              </div>
              
              {/* Bar Chart */}
              <div className="h-64 flex items-end justify-between gap-2 md:gap-4 pt-6 px-2 border-b border-slate-100 pb-4">
                {monthlyData.map((data, i) => {
                  const max = Math.max(...monthlyData.map(m => m.total), 1);
                  const height = (data.total / max) * 100;
                  const isHovered = hoveredMonth === i;
                  return (
                    <div 
                      key={i} 
                      className="flex-1 flex flex-col items-center group relative cursor-pointer"
                      onMouseEnter={() => setHoveredMonth(i)}
                      onMouseLeave={() => setHoveredMonth(null)}
                    >
                      <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
                        <div className="bg-slate-900 text-white text-[10px] p-2 rounded-lg font-black shadow-xl whitespace-nowrap">
                          ${data.total.toLocaleString()}
                        </div>
                      </div>
                      <div 
                        className={`w-full rounded-t-lg transition-all duration-300 ${isHovered ? 'bg-indigo-600 scale-105' : 'bg-[#0F2C5C] hover:bg-blue-600'}`}
                        style={{ height: `${height}%` }}
                      ></div>
                      <span className={`text-[10px] mt-3 uppercase font-black transition-colors ${isHovered ? 'text-indigo-600' : 'text-slate-400'}`}>
                        {data.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Monthly Comparison Table */}
            <div className="space-y-4">
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
                       if (idx === 0) return null; // Skip Jan for comparison
                       const prev = monthlyData[idx - 1];
                       const diff = curr.total - prev.total;
                       const percentChange = prev.total > 0 ? (diff / prev.total) * 100 : 0;
                       const isSignificant = Math.abs(percentChange) > 20;

                       return (
                         <tr key={curr.name} className={`group hover:bg-slate-50 transition-colors ${hoveredMonth === idx ? 'bg-indigo-50' : ''}`}>
                           <td className="py-4 px-6 font-bold text-slate-700 flex items-center gap-2">
                             <span className="w-8">{curr.name}</span>
                             <span className="text-[10px] text-slate-400 font-medium">vs {prev.name}</span>
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
                  <div key={q.name} className="bg-slate-50 rounded-3xl p-6 border border-slate-100 flex flex-col justify-between h-40 group hover:border-indigo-200 hover:bg-white hover:shadow-xl transition-all">
                     <div className="flex justify-between items-start">
                       <span className="text-3xl font-black text-slate-200 group-hover:text-indigo-100 transition-colors">{q.name}</span>
                       <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
                         <i className="fas fa-chart-area"></i>
                       </div>
                     </div>
                     <div>
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Spend</p>
                       <p className="text-2xl font-black text-[#0F2C5C]">${q.total.toLocaleString()}</p>
                     </div>
                  </div>
                ))}
             </div>

             <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
                <i className="fas fa-chart-line absolute -right-6 -bottom-6 text-[10rem] opacity-5"></i>
                <h3 className="text-xl font-black mb-8 relative z-10">Quarter-over-Quarter Analysis</h3>
                <div className="space-y-6 relative z-10">
                  {quarterlyData.map((curr, idx) => {
                    if (idx === 0) return null;
                    const prev = quarterlyData[idx - 1];
                    const diff = curr.total - prev.total;
                    const percent = prev.total > 0 ? (diff / prev.total) * 100 : 0;
                    
                    return (
                      <div key={idx} className="flex items-center justify-between border-b border-white/10 pb-4">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                               <i className={`fas ${diff > 0 ? 'fa-arrow-trend-up text-rose-400' : 'fa-arrow-trend-down text-emerald-400'}`}></i>
                            </div>
                            <div>
                               <p className="font-bold text-lg">{curr.name} vs {prev.name}</p>
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
                </div>
             </div>
          </div>
        )}

        {/* TOP SPEND VIEW */}
        {activeTab === 'top-spend' && (
          <div className="p-8 space-y-12 animate-in slide-in-from-right-4 duration-500">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Top Vendors */}
                <div className="space-y-6">
                   <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                     <i className="fas fa-building text-indigo-600"></i> Highest Vendor Spend
                   </h3>
                   <div className="space-y-4">
                     {topVendors.map(([vendor, amount], idx) => (
                       <div key={idx} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50">
                          <div className="flex items-center gap-4">
                             <div className="w-8 h-8 bg-slate-200 text-slate-500 rounded-lg flex items-center justify-center font-black text-xs">
                               {idx + 1}
                             </div>
                             <span className="font-bold text-slate-700 truncate max-w-[150px]">{vendor}</span>
                          </div>
                          <span className="font-black text-[#0F2C5C]">${amount.toLocaleString()}</span>
                       </div>
                     ))}
                   </div>
                </div>

                {/* Top Items (Grouped by Name) */}
                <div className="space-y-6">
                   <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                     <i className="fas fa-box-open text-emerald-600"></i> Top Items by Total Cost
                   </h3>
                   <div className="space-y-4">
                     {topItems.map(([item, amount], idx) => (
                       <div key={idx} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50">
                          <div className="flex items-center gap-4">
                             <div className="w-8 h-8 bg-slate-200 text-slate-500 rounded-lg flex items-center justify-center font-black text-xs">
                               {idx + 1}
                             </div>
                             <span className="font-bold text-slate-700 truncate max-w-[150px]">{item}</span>
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
                    <div key={t.id} className="p-4 rounded-2xl border border-slate-100 bg-white shadow-sm flex flex-col gap-2">
                       <div className="flex justify-between items-start">
                          <span className="font-bold text-slate-800">{t.name}</span>
                          <span className="font-black text-rose-600">${t.amount.toLocaleString()}</span>
                       </div>
                       <div className="flex justify-between items-center text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                          <span>{t.payDate} • {t.vendor}</span>
                          <span>{t.quarter}</span>
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
