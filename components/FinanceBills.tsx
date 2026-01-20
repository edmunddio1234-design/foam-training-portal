import React, { useState, useMemo } from 'react';

export type MainCategory = 
  | 'Operations' 
  | 'Operating Services'
  | 'Professional Services' 
  | 'Contract Services' 
  | 'Administrative' 
  | 'Subscriptions'
  | 'Gross Salaries'
  | 'Related Benefits'
  | 'Other Charges'
  | 'Acquisition and Major Repairs'
  | 'Travel';

// All 24 FOAM Funders for FY 2025-26
export const FUNDERS = [
  { id: 'act461', name: 'Act 461 Treasury', approved: 200000 },
  { id: 'bcbs', name: 'Blue Cross Blue Shield', approved: 25000 },
  { id: 'cauw', name: 'Capital Area United Way', approved: 10000 },
  { id: 'lamar', name: 'Charles Lamar Foundation', approved: 50000 },
  { id: 'empower', name: 'Empower Grant (Wilson)', approved: 75000 },
  { id: 'homebank', name: 'Home Bank', approved: 2500 },
  { id: 'humana', name: 'Humana Healthy Horizons', approved: 25000 },
  { id: 'nofa', name: 'NOFA (Mayor Office)', approved: 49000 },
  { id: 'nsbr', name: 'NSBR', approved: 10000 },
  { id: 'pennington', name: 'Pennington Foundation', approved: 20000 },
  { id: 'barrow', name: 'Senator Barrow', approved: 20000 },
  { id: 'walmart1196', name: 'Walmart Spark Good #1196', approved: 250 },
  { id: 'walmart1266', name: 'Walmart Spark Good #1266', approved: 250 },
  { id: 'walmart2822', name: 'Walmart Spark Good #2822', approved: 1250 },
  { id: 'walmart428', name: 'Walmart Spark Good #428', approved: 2000 },
  { id: 'walmart4679', name: 'Walmart Spark Good #4679', approved: 250 },
  { id: 'wilson', name: 'Wilson Foundation', approved: 75000 },
  { id: 'bras', name: 'BR Alliance for Students', approved: 15000 },
  { id: 'bralliance', name: 'Baton Rouge Alliance', approved: 15000 },
  { id: 'bcbsla2', name: 'BCBSLA (Additional)', approved: 10000 },
  { id: 'community', name: 'Community Investment Grant', approved: 10000 },
  { id: 'dogood', name: 'Do Good Grant (Joe Burrow)', approved: 38000 },
  { id: 'redriver', name: 'Red River Bank', approved: 3000 },
  { id: 'ywca', name: 'YWCA Mini Grant', approved: 25000 },
];

export interface BillEntry {
  id: string;
  name: string;
  amount: number;
  mainCategory: MainCategory | string;
  subCategory?: string;
  vendor: string;
  description: string;
  referenceNumber: string;
  paymentMethod: string;
  payDate: string;
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  year: number;
  funder?: string; // NEW: Funder assignment
}

export const CATEGORY_MAP: Record<string, string[]> = {
  'Operations': [
    'Internet and telecom', 'Software subscriptions', 'Printing and copying', 'Office supplies',
    'Outreach and marketing', 'Job fairs and employee events', 'Facility rent', 'Utilities',
    'Insurance and licenses', 'Certification exam fees', 'DMV ID and licensing', 'Work uniform and boots',
    'Tools and safety gear', 'Background checks and drug screenings', 'Transportation assistance',
    'Fuel and vehicle ops', 'Training materials and curricula', 'Device equipment rental and maintenance'
  ],
  'Operating Services': [
    'Software Subscriptions', 'Internet and Telecom', 'Office Supplies', 'Printing', 'Utilities'
  ],
  'Professional Services': [
    'IT support', 'Reporting consulting', 'Training providers', 'Facilitators', 'Fatherhood class',
    'External facilitator', 'CQI support', 'Media outreach contractor', 'Legal compliance consultant',
    'Human resources', 'Accounting'
  ],
  'Contract Services': [],
  'Administrative': [],
  'Subscriptions': [],
  'Gross Salaries': [],
  'Related Benefits': [],
  'Other Charges': [],
  'Acquisition and Major Repairs': [],
  'Travel': []
};

export const getQuarter = (dateStr: string): 'Q1' | 'Q2' | 'Q3' | 'Q4' => {
  const month = parseInt(dateStr.split('-')[1]);
  if (month <= 3) return 'Q1';
  if (month <= 6) return 'Q2';
  if (month <= 9) return 'Q3';
  return 'Q4';
};

// Helper to calculate spending per funder
export const calculateFunderSpending = (entries: BillEntry[], funderId: string): number => {
  const funder = FUNDERS.find(f => f.id === funderId);
  if (!funder) return 0;
  
  return entries
    .filter(e => e.funder === funder.name)
    .reduce((sum, e) => sum + (e.amount || 0), 0);
};

// Helper to get all funder spending summaries
export const getAllFunderSummaries = (entries: BillEntry[]) => {
  return FUNDERS.map(funder => {
    const spent = entries
      .filter(e => e.funder === funder.name)
      .reduce((sum, e) => sum + (e.amount || 0), 0);
    
    return {
      ...funder,
      spent,
      remaining: funder.approved - spent,
      transactionCount: entries.filter(e => e.funder === funder.name).length
    };
  });
};

interface FinanceBillsProps {
  entries: BillEntry[];
  onDataUpdate: (entries: BillEntry[]) => void;
}

const FinanceBills: React.FC<FinanceBillsProps> = ({ entries, onDataUpdate }) => {
  const [activeYear, setActiveYear] = useState<number>(2025);
  const [filterFunder, setFilterFunder] = useState<string>('');
  
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    mainCategory: 'Operations',
    subCategory: '',
    vendor: '',
    description: '',
    referenceNumber: '',
    paymentMethod: 'ACH',
    payDate: '',
    funder: '' // NEW: Funder field
  });

  const filteredEntries = useMemo(() => {
    let result = entries.filter(e => e.year === activeYear);
    if (filterFunder) {
      result = result.filter(e => e.funder === filterFunder);
    }
    return result;
  }, [entries, activeYear, filterFunder]);

  const totals = useMemo(() => {
    return filteredEntries.reduce((acc, curr) => {
      acc[curr.mainCategory] = (acc[curr.mainCategory] || 0) + curr.amount;
      acc.total += curr.amount;
      return acc;
    }, { total: 0 } as any);
  }, [filteredEntries]);

  // Funder spending summary
  const funderSummaries = useMemo(() => getAllFunderSummaries(entries), [entries]);

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.amount || !formData.payDate || !formData.funder) {
      alert('Please fill in all required fields including Funder');
      return;
    }

    const newEntry: BillEntry = {
      id: Date.now().toString(),
      name: formData.name,
      amount: parseFloat(formData.amount),
      mainCategory: formData.mainCategory as MainCategory,
      subCategory: formData.subCategory || undefined,
      vendor: formData.vendor,
      description: formData.description,
      referenceNumber: formData.referenceNumber,
      paymentMethod: formData.paymentMethod,
      payDate: formData.payDate,
      quarter: getQuarter(formData.payDate),
      year: activeYear,
      funder: formData.funder // NEW: Include funder
    };

    onDataUpdate([...entries, newEntry]);
    setFormData({ 
      name: '', 
      amount: '', 
      mainCategory: 'Operations', 
      subCategory: '', 
      vendor: '',
      description: '',
      referenceNumber: '',
      paymentMethod: 'ACH', 
      payDate: '',
      funder: formData.funder // Keep the same funder selected for convenience
    });
  };

  const removeEntry = (id: string) => {
    onDataUpdate(entries.filter(e => e.id !== id));
  };

  const clearAll = () => {
    if (window.confirm("Are you sure you want to clear all ledger entries? This cannot be undone.")) {
      onDataUpdate([]);
    }
  };

  return (
    <div className="animate-in fade-in duration-500 space-y-8 pb-12">
      <div className="bg-[#0F2C5C] p-8 rounded-[2.5rem] text-white relative overflow-hidden shadow-xl">
         <div className="absolute right-0 top-0 p-10 opacity-10 pointer-events-none">
            <i className="fas fa-balance-scale text-[15rem]"></i>
         </div>
         <div className="relative z-10 space-y-4">
            <h2 className="text-4xl font-black tracking-tight">Ledger & Resource Registry</h2>
            <p className="max-w-2xl text-indigo-100 font-medium italic">
               Each transaction must be assigned to a specific funder. Spending is tracked per funder.
            </p>
         </div>
      </div>

      {/* Funder Quick Stats */}
      <div className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Funder Balances</h3>
          <span className="text-xs text-slate-400">{FUNDERS.length} funders tracked</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {funderSummaries.slice(0, 6).map(f => (
            <div 
              key={f.id} 
              className={`p-3 rounded-xl border cursor-pointer transition-all hover:shadow-md ${filterFunder === f.name ? 'border-indigo-400 bg-indigo-50' : 'border-slate-100'}`}
              onClick={() => setFilterFunder(filterFunder === f.name ? '' : f.name)}
            >
              <p className="text-[9px] font-black text-slate-400 uppercase truncate">{f.name}</p>
              <p className="text-lg font-black text-slate-800">${f.remaining.toLocaleString()}</p>
              <p className={`text-[10px] font-bold ${f.spent > 0 ? 'text-amber-600' : 'text-slate-300'}`}>
                {f.spent > 0 ? `$${f.spent.toLocaleString()} spent` : 'No spending'}
              </p>
            </div>
          ))}
        </div>
        {filterFunder && (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-xs text-slate-500">Filtering by:</span>
            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold">{filterFunder}</span>
            <button onClick={() => setFilterFunder('')} className="text-xs text-slate-400 hover:text-slate-600">
              <i className="fas fa-times"></i> Clear
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-inner w-fit">
          {[2025, 2026, 2027].map(year => (
            <button
              key={year}
              onClick={() => setActiveYear(year)}
              className={`px-8 py-3 rounded-xl text-sm font-black transition-all ${activeYear === year ? 'bg-[#0F2C5C] text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
            >
              FY {year}
            </button>
          ))}
        </div>
        
        <button 
          onClick={clearAll}
          className="px-6 py-3 bg-rose-50 text-rose-600 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-rose-100 transition-all flex items-center gap-2"
        >
          <i className="fas fa-trash-can"></i> Clear All Records
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-1 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm h-fit space-y-6">
          <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
            <i className="fas fa-plus-circle text-blue-600"></i>
            Register New Expense
          </h3>
          
          <form onSubmit={handleAddEntry} className="grid grid-cols-1 gap-4">
            {/* FUNDER SELECTION - REQUIRED */}
            <div className="space-y-1 p-4 bg-indigo-50 rounded-2xl border-2 border-indigo-200">
              <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest ml-1 flex items-center gap-1">
                <i className="fas fa-hand-holding-usd"></i> Assign to Funder *
              </label>
              <select 
                value={formData.funder}
                onChange={e => setFormData({...formData, funder: e.target.value})}
                className="w-full px-5 py-3 bg-white border-2 border-indigo-200 rounded-xl focus:border-indigo-500 outline-none transition-all font-bold text-slate-700 appearance-none"
                required
              >
                <option value="">-- Select Funder --</option>
                {FUNDERS.map(f => {
                  const summary = funderSummaries.find(s => s.id === f.id);
                  return (
                    <option key={f.id} value={f.name}>
                      {f.name} (${summary?.remaining.toLocaleString()} remaining)
                    </option>
                  );
                })}
              </select>
              {formData.funder && (
                <div className="mt-2 text-xs text-indigo-600">
                  {(() => {
                    const summary = funderSummaries.find(s => s.name === formData.funder);
                    return summary ? (
                      <span>Budget: ${summary.approved.toLocaleString()} | Spent: ${summary.spent.toLocaleString()} | Remaining: ${summary.remaining.toLocaleString()}</span>
                    ) : null;
                  })()}
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Item Name *</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="e.g. Server Maintenance"
                className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-[#0F2C5C] focus:bg-white outline-none transition-all font-bold text-slate-700"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Amount ($) *</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={formData.amount}
                  onChange={e => setFormData({...formData, amount: e.target.value})}
                  placeholder="0.00"
                  className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-[#0F2C5C] focus:bg-white outline-none transition-all font-bold text-slate-700"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date *</label>
                <input 
                  type="date" 
                  value={formData.payDate}
                  onChange={e => setFormData({...formData, payDate: e.target.value})}
                  className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-[#0F2C5C] focus:bg-white outline-none transition-all font-bold text-slate-700"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Vendor</label>
                <input 
                  type="text" 
                  value={formData.vendor}
                  onChange={e => setFormData({...formData, vendor: e.target.value})}
                  placeholder="e.g. AWS"
                  className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-[#0F2C5C] focus:bg-white outline-none transition-all font-bold text-slate-700"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Invoice / Check #</label>
                <input 
                  type="text" 
                  value={formData.referenceNumber}
                  onChange={e => setFormData({...formData, referenceNumber: e.target.value})}
                  placeholder="INV-12345"
                  className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-[#0F2C5C] focus:bg-white outline-none transition-all font-bold text-slate-700"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
              <textarea 
                rows={2}
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                placeholder="Brief expense description..."
                className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-[#0F2C5C] focus:bg-white outline-none transition-all font-bold text-slate-700"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Main Category</label>
              <select 
                value={formData.mainCategory}
                onChange={e => setFormData({...formData, mainCategory: e.target.value, subCategory: ''})}
                className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-[#0F2C5C] focus:bg-white outline-none transition-all font-bold text-slate-700 appearance-none"
              >
                {Object.keys(CATEGORY_MAP).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {CATEGORY_MAP[formData.mainCategory]?.length > 0 && (
              <div className="space-y-1 animate-in slide-in-from-top-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subcategory</label>
                <select 
                  value={formData.subCategory}
                  onChange={e => setFormData({...formData, subCategory: e.target.value})}
                  className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-[#0F2C5C] focus:bg-white outline-none transition-all font-bold text-slate-700 appearance-none"
                >
                  <option value="">Select subcategory...</option>
                  {CATEGORY_MAP[formData.mainCategory].map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Payment Method</label>
              <input 
                type="text" 
                value={formData.paymentMethod}
                onChange={e => setFormData({...formData, paymentMethod: e.target.value})}
                placeholder="ACH, Corp Card, Check"
                className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-[#0F2C5C] focus:bg-white outline-none transition-all font-bold text-slate-700"
              />
            </div>

            <button 
              type="submit"
              className="w-full py-4 mt-2 bg-[#0F2C5C] text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all shadow-lg"
            >
              <i className="fas fa-plus mr-2"></i> Add Entry
            </button>
          </form>
        </div>

        <div className="xl:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
           <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight">Financial Ledger: FY {activeYear}</h3>
                {filterFunder && <p className="text-xs text-indigo-600 mt-1">Showing: {filterFunder} only</p>}
              </div>
              <div className="flex gap-2">
                <select 
                  value={filterFunder}
                  onChange={e => setFilterFunder(e.target.value)}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                >
                  <option value="">All Funders</option>
                  {FUNDERS.map(f => (
                    <option key={f.id} value={f.name}>{f.name}</option>
                  ))}
                </select>
                <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors" onClick={() => window.print()}>
                  <i className="fas fa-print"></i>
                </button>
              </div>
           </div>
           
           <div className="overflow-x-auto flex-1">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Detail & Quarter</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Funder</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredEntries.length > 0 ? filteredEntries.map((entry) => (
                    <tr key={entry.id} className="group hover:bg-slate-50/30">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-slate-700">{entry.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-400 font-bold uppercase">{entry.payDate}</span>
                            <span className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded font-black text-slate-500">{entry.quarter}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg uppercase tracking-widest">
                          {entry.funder || 'Unassigned'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{entry.mainCategory}</span>
                          <span className="text-[11px] text-slate-600 font-bold">{entry.subCategory ? `${entry.subCategory}` : entry.vendor}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-4">
                          <span className="text-sm font-black text-[#0F2C5C]">${entry.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                          <button onClick={() => removeEntry(entry.id)} className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all">
                            <i className="fas fa-trash-alt"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="px-8 py-32 text-center">
                        <div className="flex flex-col items-center gap-4 text-slate-300">
                          <i className="fas fa-folder-open text-6xl opacity-20"></i>
                          <p className="text-sm font-black uppercase tracking-widest">
                            {filterFunder ? `No entries for ${filterFunder}` : `No entries recorded for FY ${activeYear}`}
                          </p>
                          <p className="text-xs font-medium">Use the form on the left to begin population.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
           </div>
           
           <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {filterFunder ? `${filterFunder} Total` : 'Aggregate Liability'}
              </span>
              <span className="text-2xl font-black text-[#0F2C5C]">${(totals.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceBills;
