
import React, { useState, useMemo } from 'react';

export type MainCategory = 
  | 'Operations' 
  | 'Professional Services' 
  | 'Contract Services' 
  | 'Administrative' 
  | 'Subscriptions'
  | 'Gross Salaries'
  | 'Related Benefits'
  | 'Other Charges'
  | 'Acquisition and Major Repairs'
  | 'Travel';

export interface BillEntry {
  id: string;
  name: string;
  amount: number;
  mainCategory: MainCategory;
  subCategory?: string;
  vendor: string;
  description: string;
  referenceNumber: string; // Invoice or check number
  paymentMethod: string;
  payDate: string;
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  year: number;
}

export const CATEGORY_MAP: Record<MainCategory, string[]> = {
  'Operations': [
    'Internet and telecom', 'Software subscriptions', 'Printing and copying', 'Office supplies',
    'Outreach and marketing', 'Job fairs and employee events', 'Facility rent', 'Utilities',
    'Insurance and licenses', 'Certification exam fees', 'DMV ID and licensing', 'Work uniform and boots',
    'Tools and safety gear', 'Background checks and drug screenings', 'Transportation assistance',
    'Fuel and vehicle ops', 'Training materials and curricula', 'Device equipment rental and maintenance'
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

interface FinanceBillsProps {
  entries: BillEntry[];
  onDataUpdate: (entries: BillEntry[]) => void;
}

const FinanceBills: React.FC<FinanceBillsProps> = ({ entries, onDataUpdate }) => {
  const [activeYear, setActiveYear] = useState<number>(2025);
  
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    mainCategory: 'Operations' as MainCategory,
    subCategory: '',
    vendor: '',
    description: '',
    referenceNumber: '',
    paymentMethod: 'ACH',
    payDate: ''
  });

  const filteredEntries = useMemo(() => 
    entries.filter(e => e.year === activeYear), 
    [entries, activeYear]
  );

  const totals = useMemo(() => {
    return filteredEntries.reduce((acc, curr) => {
      acc[curr.mainCategory] = (acc[curr.mainCategory] || 0) + curr.amount;
      acc.total += curr.amount;
      return acc;
    }, { total: 0 } as any);
  }, [filteredEntries]);

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.amount || !formData.payDate) return;

    const newEntry: BillEntry = {
      id: Date.now().toString(),
      name: formData.name,
      amount: parseFloat(formData.amount),
      mainCategory: formData.mainCategory,
      subCategory: formData.subCategory || undefined,
      vendor: formData.vendor,
      description: formData.description,
      referenceNumber: formData.referenceNumber,
      paymentMethod: formData.paymentMethod,
      payDate: formData.payDate,
      quarter: getQuarter(formData.payDate),
      year: activeYear
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
      payDate: '' 
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
               Blank slate protocol active. All records must be manually entered or imported via Data Exchange.
            </p>
         </div>
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
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Item Name</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="e.g. Server Maintenance"
                className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-[#0F2C5C] focus:bg-white outline-none transition-all font-bold text-slate-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Amount ($)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={formData.amount}
                  onChange={e => setFormData({...formData, amount: e.target.value})}
                  placeholder="0.00"
                  className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-[#0F2C5C] focus:bg-white outline-none transition-all font-bold text-slate-700"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date</label>
                <input 
                  type="date" 
                  value={formData.payDate}
                  onChange={e => setFormData({...formData, payDate: e.target.value})}
                  className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-[#0F2C5C] focus:bg-white outline-none transition-all font-bold text-slate-700"
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
                onChange={e => setFormData({...formData, mainCategory: e.target.value as MainCategory, subCategory: ''})}
                className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-[#0F2C5C] focus:bg-white outline-none transition-all font-bold text-slate-700 appearance-none"
              >
                {Object.keys(CATEGORY_MAP).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {CATEGORY_MAP[formData.mainCategory].length > 0 && (
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
              Add Entry
            </button>
          </form>
        </div>

        <div className="xl:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
           <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-black text-slate-800 tracking-tight">Financial Ledger: FY {activeYear}</h3>
              <div className="flex gap-2">
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
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category / Sub</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Reference #</th>
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
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{entry.mainCategory}</span>
                          <span className="text-[11px] text-slate-600 font-bold">{entry.subCategory ? `${entry.subCategory}` : entry.vendor}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-mono font-bold text-slate-500">{entry.referenceNumber || '—'}</span>
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
                          <p className="text-sm font-black uppercase tracking-widest">No entries recorded for FY {activeYear}</p>
                          <p className="text-xs font-medium">Use the form on the left to begin population.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
           </div>
           
           <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aggregate Liability</span>
              <span className="text-2xl font-black text-[#0F2C5C]">${(totals.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceBills;
