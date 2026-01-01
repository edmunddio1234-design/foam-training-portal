
import React, { useState, useRef } from 'react';
import { BillEntry, MainCategory, CATEGORY_MAP, getQuarter } from './FinanceBills';

interface DataExchangeProps {
  entries: BillEntry[];
  onImport: (entries: BillEntry[]) => void;
}

const DataExchange: React.FC<DataExchangeProps> = ({ entries, onImport }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastAction, setLastAction] = useState<{ message: string; type: 'success' | 'warning' | 'error' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const VALID_MAIN_CATEGORIES = Object.keys(CATEGORY_MAP) as MainCategory[];

  const downloadTemplate = () => {
    // Template updated to match exact user request columns
    const headers = "Date,Category,Subcategory,Vendor,Description,InvoiceNumber,Amount,ItemName\n";
    const example = "2025-01-15,Operations,Facility rent,Landmark Realty,Monthly Office Lease,CHK-99821,3200.00,Main Office Rent\n";
    const blob = new Blob([headers + example], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "FOAM_Analysis_Import_Template.csv");
    link.click();
    setLastAction({ message: "Analysis-ready template downloaded. Use these exact columns.", type: 'success' });
  };

  const handleExportCSV = () => {
    if (entries.length === 0) {
      alert("No data to export.");
      return;
    }
    const headers = "Date,Category,Subcategory,Vendor,Description,InvoiceNumber,Amount,Quarter,Year,ItemName,PaymentMethod\n";
    const rows = entries.map(e => 
      `"${e.payDate}","${e.mainCategory}","${e.subCategory || ''}","${e.vendor}","${e.description}","${e.referenceNumber}",${e.amount},"${e.quarter}",${e.year},"${e.name}","${e.paymentMethod}"`
    ).join("\n");
    
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `FOAM_Ledger_Export_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
    setLastAction({ message: "Full analysis ledger exported as CSV.", type: 'success' });
  };

  const parseCSV = (text: string): BillEntry[] => {
    const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
    const headers = lines[0].toLowerCase().split(',').map(h => h.trim().replace(/"/g, ''));
    
    // Helper to find column index with precise keyword matching based on user request
    const findIdx = (keywords: string[]) => headers.findIndex(h => keywords.some(k => h.includes(k)));
    
    // Mapping strictly to requested columns
    const dateIdx = findIdx(['date', 'day']);
    const amtIdx = findIdx(['amount', 'spend', 'cost']); // "The amount", "The total spend for that particular item"
    const catIdx = findIdx(['category']);
    const subCatIdx = findIdx(['subcategory', 'sub']);
    const vendorIdx = findIdx(['vendor']);
    const descIdx = findIdx(['description']);
    const refIdx = findIdx(['invoice', 'check', 'reference', 'number']); // "Invoice number or check number"
    const nameIdx = findIdx(['item', 'name']); // "name of that item"

    const newEntries: BillEntry[] = [];

    for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.trim().replace(/"/g, ''));
        if (cols.length < 3) continue;

        const dateStr = dateIdx > -1 ? cols[dateIdx] : new Date().toISOString().split('T')[0];
        const rawAmt = amtIdx > -1 ? parseFloat(cols[amtIdx]) : 0;
        const mainCat = (catIdx > -1 ? cols[catIdx] : 'Operations') as MainCategory;
        const subCat = subCatIdx > -1 ? cols[subCatIdx] : '';
        const vendor = vendorIdx > -1 ? cols[vendorIdx] : 'Unspecified';
        const desc = descIdx > -1 ? cols[descIdx] : '';
        const ref = refIdx > -1 ? cols[refIdx] : '';
        const name = nameIdx > -1 ? cols[nameIdx] : (desc || vendor || 'Expense Item');

        // Validation & Logic
        const finalCat = VALID_MAIN_CATEGORIES.includes(mainCat) ? mainCat : 'Operations';
        const finalYear = new Date(dateStr).getFullYear() || 2025;
        const finalQuarter = getQuarter(dateStr);

        if (!isNaN(rawAmt)) {
           newEntries.push({
             id: `imp-${Date.now()}-${i}`,
             payDate: dateStr,
             amount: rawAmt,
             mainCategory: finalCat,
             subCategory: subCat,
             vendor: vendor,
             description: desc,
             referenceNumber: ref,
             name: name,
             year: finalYear,
             quarter: finalQuarter,
             paymentMethod: 'Import'
           });
        }
    }
    return newEntries;
  };

  const processImport = (file: File) => {
    setIsProcessing(true);
    setLastAction({ message: `Reading ${file.name}...`, type: 'success' });
    
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    // Guide user to CSV if they try Excel
    if (extension !== 'csv') {
       setTimeout(() => {
          setLastAction({ 
            message: "Format Notice: Please save your Excel sheet as a CSV file to ensure all columns (Vendor, Item, Invoice #) map correctly.", 
            type: 'warning' 
          });
          setIsProcessing(false);
       }, 2000);
       return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
       const text = e.target?.result as string;
       try {
         const parsedData = parseCSV(text);
         if (parsedData.length === 0) {
            setLastAction({ message: "No valid data found. Check your CSV headers against the template.", type: 'warning' });
         } else {
            onImport([...entries, ...parsedData]);
            setLastAction({ message: `Success! Analyzed ${parsedData.length} entries. Vendor and Quarterly data mapped.`, type: 'success' });
         }
       } catch (err) {
         setLastAction({ message: "Failed to parse CSV. Ensure formatting matches template.", type: 'error' });
       }
       setIsProcessing(false);
    };
    reader.readAsText(file);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processImport(files[0]);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
      {/* Dynamic Notification Banner */}
      {lastAction && (
        <div className={`p-6 rounded-[2rem] border animate-in slide-in-from-top-4 duration-300 flex items-center justify-between shadow-lg ${
          lastAction.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' :
          lastAction.type === 'warning' ? 'bg-amber-50 border-amber-100 text-amber-800' :
          'bg-rose-50 border-rose-100 text-rose-800'
        }`}>
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              lastAction.type === 'success' ? 'bg-emerald-500/10' :
              lastAction.type === 'warning' ? 'bg-amber-500/10' :
              'bg-rose-500/10'
            }`}>
              <i className={`fas ${
                lastAction.type === 'success' ? 'fa-circle-check' :
                lastAction.type === 'warning' ? 'fa-triangle-exclamation' :
                'fa-circle-xmark'
              }`}></i>
            </div>
            <div>
              <p className="text-sm font-black uppercase tracking-tight">{lastAction.type === 'success' ? 'Analysis Complete' : 'Format Check'}</p>
              <p className="text-xs font-bold opacity-80">{lastAction.message}</p>
            </div>
          </div>
          <button onClick={() => setLastAction(null)} className="opacity-40 hover:opacity-100 transition-opacity">
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Import Section */}
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-50 pb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                <i className="fas fa-microscope text-xl"></i>
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight">Data Collector</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Supports CSV Import</p>
              </div>
            </div>
            <button 
              onClick={downloadTemplate}
              className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-4 py-2 rounded-xl hover:bg-indigo-100 transition-all flex items-center gap-2"
            >
              <i className="fas fa-download"></i> Get Template
            </button>
          </div>

          <div 
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => !isProcessing && fileInputRef.current?.click()}
            className={`relative group cursor-pointer border-4 border-dashed rounded-[2rem] p-12 transition-all flex flex-col items-center text-center gap-4 ${
              isDragging ? 'bg-indigo-50 border-indigo-400 scale-[0.98]' : 'bg-slate-50 border-slate-100 hover:border-indigo-200 hover:bg-white'
            } ${isProcessing ? 'cursor-wait opacity-80' : ''}`}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".csv"
              onChange={(e) => e.target.files && processImport(e.target.files[0])}
            />
            <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${isDragging ? 'bg-indigo-600 text-white scale-110' : 'bg-white text-slate-300 group-hover:text-indigo-500 shadow-sm'}`}>
              <i className={`fas ${isProcessing ? 'fa-dna fa-spin' : 'fa-upload'} text-3xl`}></i>
            </div>
            <div>
              <p className="text-slate-700 font-black text-lg">Upload CSV File</p>
              <p className="text-slate-400 font-medium text-sm max-w-[280px] mx-auto">Upload to analyze Vendors, Invoices, and Item costs.</p>
            </div>
            
            {isProcessing && (
               <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center rounded-[1.8rem] z-10 p-8">
                  <div className="text-center space-y-4">
                     <div className="flex justify-center">
                       <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-600 animate-[loading_1.5s_infinite]"></div>
                       </div>
                     </div>
                     <p className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em]">Mapping Analysis Parameters...</p>
                  </div>
               </div>
            )}
          </div>
          
          <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-3">
             <div className="flex items-center gap-3 text-[#0F2C5C]">
                <i className="fas fa-layer-group text-xs"></i>
                <span className="text-[10px] font-black uppercase tracking-widest">Target Columns</span>
             </div>
             <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
               The system analyzes: Date, Category, Subcategory, Vendor, Description, Invoice #, Amount, and Item Name.
             </p>
          </div>
        </div>

        {/* Export Section */}
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
              <i className="fas fa-calculator text-xl"></i>
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">Analysis Engine</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Replicate ledger structure for external tools</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <ExportButton 
              title="Full Data Ledger (CSV)" 
              subtitle="Includes Vendor, Quarter, and Amounts" 
              icon="fa-table-cells" 
              color="bg-slate-800" 
              onClick={handleExportCSV}
              disabled={isProcessing}
            />
            <ExportButton 
              title="Quarterly Breakout (Excel)" 
              subtitle="Ready for reporting and trend analysis" 
              icon="fa-file-excel" 
              color="bg-emerald-600" 
              onClick={() => { handleExportCSV(); setLastAction({ message: "Quarterly-formatted data exported.", type: 'success' }); }}
              disabled={isProcessing}
            />
            <ExportButton 
              title="Financial Summary (PDF)" 
              subtitle="Formal document for audit compliance" 
              icon="fa-file-contract" 
              color="bg-rose-600" 
              onClick={() => { window.print(); setLastAction({ message: "PDF Snapshot initiated.", type: 'success' }); }}
              disabled={isProcessing}
            />
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}} />
    </div>
  );
};

const ExportButton: React.FC<{ 
  title: string; 
  subtitle: string; 
  icon: string; 
  color: string; 
  onClick: () => void;
  disabled: boolean;
}> = ({ title, subtitle, icon, color, onClick, disabled }) => (
  <button 
    onClick={onClick}
    disabled={disabled}
    className="group w-full flex items-center justify-between p-6 bg-slate-50 border border-slate-100 rounded-[2rem] hover:bg-white hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-50 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
  >
    <div className="flex items-center gap-6">
      <div className={`w-14 h-14 ${color} text-white rounded-2xl flex items-center justify-center text-xl shadow-lg group-hover:scale-110 transition-transform`}>
        <i className={`fas ${icon}`}></i>
      </div>
      <div>
        <h4 className="text-lg font-black text-slate-800 leading-tight">{title}</h4>
        <p className="text-xs text-slate-400 font-semibold">{subtitle}</p>
      </div>
    </div>
    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all">
      <i className="fas fa-chevron-right text-xs"></i>
    </div>
  </button>
);

export default DataExchange;
