
import React, { useState, useRef } from 'react';
import { Father } from '../../types';
import { parseCSV } from '../../constants';
import { Upload, FileText, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface ImportCSVProps {
  onImport: (fathers: Father[]) => void;
}

export const ImportCSV: React.FC<ImportCSVProps> = ({ onImport }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<Father[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.csv')) {
        setError('Please select a valid CSV file.');
        return;
      }
      setFile(selectedFile);
      setError(null);
      processFile(selectedFile);
    }
  };

  const processFile = (file: File) => {
    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const fathers = parseCSV(text);
        if (fathers.length === 0) throw new Error('No valid participant data found.');
        setPreview(fathers);
      } catch (err: any) {
        setError(err.message || 'Failed to parse CSV.');
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center space-y-6">
          <div onClick={() => fileInputRef.current?.click()} className="group cursor-pointer border-4 border-dashed border-slate-100 hover:border-blue-500 hover:bg-blue-50 transition-all p-16 rounded-[2.5rem] w-full max-w-2xl flex flex-col items-center gap-6">
              <input type="file" ref={fileInputRef} className="hidden" accept=".csv" onChange={handleFileChange} />
              <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform"><FileText size={48}/></div>
              <div>
                  <h3 className="text-2xl font-black text-slate-800">{file ? file.name : 'Select Master Roster CSV'}</h3>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2">Exported from Google Sheets</p>
              </div>
          </div>

          {error && <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl flex items-center gap-3 font-bold text-sm border border-rose-100"><AlertCircle size={20}/>{error}</div>}
          
          {isProcessing && <div className="flex flex-col items-center gap-3"><RefreshCw size={32} className="text-blue-500 animate-spin"/><p className="text-xs font-black uppercase tracking-widest text-slate-400">Analyzing Metadata...</p></div>}

          {preview.length > 0 && !isProcessing && (
              <div className="w-full max-w-2xl bg-emerald-50 p-8 rounded-[2rem] border border-emerald-100 space-y-6">
                  <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-emerald-800">
                          <CheckCircle size={24}/>
                          <span className="font-black text-lg">Found {preview.length} Valid Records</span>
                      </div>
                      <button onClick={() => onImport(preview)} className="px-8 py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-emerald-200">Overwrite & Sync Roster</button>
                  </div>
              </div>
          )}
      </div>
    </div>
  );
};
