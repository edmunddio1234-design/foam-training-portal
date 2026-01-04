import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { fileService } from '../services/driveAPI';
import { DriveFile } from '../types';

// Enhanced Mock data for specialized categories
const DEMO_FILES: DriveFile[] = [
  { id: '1', name: 'FOAM_Case_Management_Standards.pdf', mimeType: 'application/pdf', modifiedTime: '2024-03-15T10:00:00Z', folderId: 'training' },
  { id: '2', name: 'Project_Family_Build_Intake_Template.docx', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', modifiedTime: '2024-03-20T14:30:00Z', folderId: 'clients' },
  { id: '3', name: 'Financial_Quarterly_Projections_FY25.xlsx', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', modifiedTime: '2024-04-01T09:15:00Z', folderId: 'finance' },
  { id: '4', name: 'NPCL_Curriculum_Module_Overview.pdf', mimeType: 'application/pdf', modifiedTime: '2024-02-10T11:45:00Z', folderId: 'training' },
  { id: '5', name: 'Board_Meeting_Minutes_Jan.pdf', mimeType: 'application/pdf', modifiedTime: '2025-01-05T10:00:00Z', folderId: 'gov' },
  { id: '6', name: 'Staff_Handbook_2025.pdf', mimeType: 'application/pdf', modifiedTime: '2024-12-15T11:00:00Z', folderId: 'hr' },
];

const FOLDER_METADATA = [
  { id: 'all', name: 'All Files', icon: 'fa-layer-group' },
  { id: 'gov', name: 'Governance', icon: 'fa-landmark' },
  { id: 'hr', name: 'HR & Personnel', icon: 'fa-users' },
  { id: 'finance', name: 'Financials', icon: 'fa-file-invoice-dollar' },
  { id: 'clients', name: 'Case Files', icon: 'fa-folder-closed' },
  { id: 'training', name: 'Academy', icon: 'fa-book' },
];

interface DatabasePortalProps {
  onClose: () => void;
}

const DatabasePortal: React.FC<DatabasePortalProps> = ({ onClose }) => {
  const [activeFolder, setActiveFolder] = useState('all');
  const [files, setFiles] = useState<DriveFile[]>(DEMO_FILES);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([]);
  
  // Selection and Preview states
  const [hoveredFile, setHoveredFile] = useState<DriveFile | null>(null);
  const [previewFile, setPreviewFile] = useState<DriveFile | null>(null);
  const [summaryCache, setSummaryCache] = useState<Record<string, string>>({});
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    setIsLoading(true);
    try {
      const data = await fileService.list();
      if (data.files && data.files.length > 0) {
        setFiles(data.files);
      }
    } catch (err: any) {
      console.warn('Backend connection unavailable, running in enhanced Demo Mode.');
    } finally {
      setIsLoading(false);
    }
  };

  const getAiSummary = async (file: DriveFile) => {
    if (summaryCache[file.id]) return;
    setIsGeneratingSummary(true);
    try {
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      
      const prompt = `Provide a concise 3-sentence professional summary for a file titled "${file.name}". Context: This file belongs to Fathers On A Mission (FOAM), a non-profit focusing on fatherhood mentorship and community support. The summary should explain the likely administrative importance of this document.`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const summary = response.text() || "Summary analysis currently unavailable for this record.";
      
      setSummaryCache(prev => ({ ...prev, [file.id]: summary }));
    } catch (err) {
      console.error("AI Summary generation failed", err);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleSmartSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsAiProcessing(true);
    try {
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      
      const fileListContext = files.map(f => `- ${f.name}`).join('\n');
      
      const prompt = `The user is searching the FOAM Google Drive with this query: "${searchQuery}". 
      Based on the following available file list, identify the most relevant files and explain why. 
      Available files:
      ${fileListContext}
      
      Return the answer in two parts:
      1. A conversational explanation.
      2. If specific files match, list their exact names.`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text() || "I've analyzed the drive. Check the highlighted results.";
      
      setMessages(prev => [...prev, { role: 'user', text: `Smart Search: ${searchQuery}` }]);
      setMessages(prev => [...prev, { role: 'bot', text: text }]);
    } catch (err) {
      console.error("Smart Search failed", err);
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isAiProcessing) return;
    const userMsg = chatInput;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatInput('');
    setIsAiProcessing(true);
    try {
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      
      const result = await model.generateContent(userMsg);
      const response = await result.response;
      const text = response.text() || "Understood. How else can I assist with the records?";
      
      setMessages(prev => [...prev, { role: 'bot', text: text }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', text: "Error connecting to records intelligence." }]);
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "ID,Name,Type,Modified\n" + 
      files.map(f => `${f.id},"${f.name}",${f.mimeType},${f.modifiedTime}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "FOAM_Records_Export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const activeDisplayFile = hoveredFile || previewFile;

  const filteredFiles = files.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFolder = activeFolder === 'all' || f.folderId === activeFolder;
    return matchesSearch && matchesFolder;
  });

  return (
    <div className="flex flex-col h-screen bg-slate-100 overflow-hidden font-sans">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shrink-0 shadow-sm relative z-20">
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 bg-[#0F2C5C] text-white rounded-2xl flex items-center justify-center shadow-lg">
            <i className="fas fa-database text-xl"></i>
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight leading-none mb-1 uppercase">FOAM Smart Records</h1>
            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-[0.3em]">AI-Powered Google Drive Access</p>
          </div>
        </div>
        
        <div className="flex-1 max-w-xl mx-8 relative group">
          <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors"></i>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSmartSearch()}
            placeholder="Smart Search Google Drive..." 
            className="w-full pl-14 pr-16 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:border-indigo-600 outline-none transition-all shadow-inner"
          />
          <button 
            onClick={handleSmartSearch}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#0F2C5C] text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-sm"
          >
            {isAiProcessing ? <i className="fas fa-circle-notch fa-spin"></i> : 'AI Search'}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={(e) => alert('Importing records from selection...')}
          />
          <button 
            onClick={handleImportClick}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all border border-slate-200"
          >
            <i className="fas fa-file-import"></i>
            Import
          </button>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all border border-slate-200"
          >
            <i className="fas fa-file-export"></i>
            Export
          </button>
          <div className="w-px h-8 bg-slate-200 mx-2"></div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-slate-100 rounded-full transition-all">
            <i className="fas fa-times text-lg"></i>
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Side: Category & File Stack */}
        <div className="w-80 border-r border-slate-200 bg-white flex flex-col shrink-0 z-10">
          <div className="p-6 border-b border-slate-100 bg-slate-50/30">
             <div className="flex flex-wrap gap-2">
                {FOLDER_METADATA.map(folder => (
                   <button 
                     key={folder.id}
                     onClick={() => setActiveFolder(folder.id)}
                     className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeFolder === folder.id ? 'bg-[#0F2C5C] text-white shadow-lg' : 'bg-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-200'}`}
                   >
                     <i className={`fas ${folder.icon}`}></i>
                     {folder.name}
                   </button>
                ))}
             </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-2 hide-scrollbar">
            <p className="px-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4 mt-2">Document Stack</p>
            {isLoading ? (
               <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-40">
                  <i className="fas fa-sync fa-spin text-4xl text-[#0F2C5C]"></i>
               </div>
            ) : filteredFiles.map(file => (
              <button
                key={file.id}
                onMouseEnter={() => {
                  setHoveredFile(file);
                  getAiSummary(file);
                }}
                onMouseLeave={() => setHoveredFile(null)}
                onClick={() => setPreviewFile(file)}
                className={`w-full text-left p-4 rounded-2xl flex items-center gap-4 transition-all group ${
                  previewFile?.id === file.id 
                    ? 'bg-indigo-50 border border-indigo-200 shadow-sm' 
                    : 'hover:bg-slate-50 border border-transparent'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${
                  file.mimeType.includes('pdf') ? 'bg-rose-50 text-rose-500' : 
                  file.mimeType.includes('sheet') ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                }`}>
                  <i className={`fas ${file.mimeType.includes('pdf') ? 'fa-file-pdf' : file.mimeType.includes('sheet') ? 'fa-file-excel' : 'fa-file-alt'}`}></i>
                </div>
                <div className="overflow-hidden">
                  <p className={`text-xs font-bold truncate transition-colors ${previewFile?.id === file.id || hoveredFile?.id === file.id ? 'text-[#0F2C5C]' : 'text-slate-600'}`}>
                    {file.name}
                  </p>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    {file.modifiedTime?.split('T')[0]}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Center: Large Context Preview Menu */}
        <div className="flex-1 bg-slate-50 flex flex-col items-center justify-center p-6 md:p-10 relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-5">
             <i className="fas fa-brain text-[40rem] text-[#0F2C5C] absolute -right-20 -top-20 opacity-10 rotate-12"></i>
          </div>

          <div className="w-full max-w-xl bg-white rounded-[2rem] border border-slate-200 p-6 md:p-10 relative z-10 animate-in zoom-in-95 duration-500 shadow-2xl flex flex-col items-center">
            {activeDisplayFile ? (
              <div className="w-full flex flex-col items-center text-center space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className={`w-16 h-16 md:w-20 md:h-20 rounded-[1.2rem] md:rounded-[1.5rem] flex items-center justify-center text-2xl md:text-3xl shadow-xl ring-4 ring-slate-50 shrink-0 ${
                  activeDisplayFile.mimeType.includes('pdf') ? 'bg-rose-600 text-white' : 
                  activeDisplayFile.mimeType.includes('sheet') ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white'
                }`}>
                   <i className={`fas ${activeDisplayFile.mimeType.includes('pdf') ? 'fa-file-pdf' : activeDisplayFile.mimeType.includes('sheet') ? 'fa-file-excel' : 'fa-file-alt'}`}></i>
                </div>
                <div className="space-y-1 max-w-full">
                   <h2 className="text-lg md:text-xl font-black text-slate-800 tracking-tight leading-tight uppercase break-words px-4">
                     {activeDisplayFile.name}
                   </h2>
                   <div className="flex items-center justify-center gap-2">
                      <span className="text-[8px] font-black text-indigo-500 uppercase tracking-[0.2em]">Operational Record</span>
                      <div className="w-1 h-1 rounded-full bg-slate-200"></div>
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">{activeDisplayFile.modifiedTime?.split('T')[0]}</span>
                   </div>
                </div>

                <div className="w-full bg-slate-50 p-6 md:p-8 rounded-[1.5rem] border border-slate-100 relative group min-h-[100px] flex items-center justify-center shadow-inner overflow-hidden">
                   {isGeneratingSummary ? (
                      <div className="flex flex-col items-center gap-2 text-slate-400">
                        <i className="fas fa-dna fa-spin text-lg"></i>
                        <span className="text-[8px] font-black uppercase tracking-widest">Generating Intelligent Brief...</span>
                      </div>
                   ) : (
                      <div className="animate-in fade-in duration-700 w-full overflow-y-auto max-h-[120px] hide-scrollbar">
                        <p className="text-xs md:text-sm text-slate-600 font-medium leading-relaxed italic text-center">
                           "{summaryCache[activeDisplayFile.id] || "Hover or select to generate a record intelligence summary."}"
                        </p>
                      </div>
                   )}
                   <i className="fas fa-quote-right absolute top-3 right-4 text-slate-200 text-xl opacity-40"></i>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                   <button 
                     onClick={() => getAiSummary(activeDisplayFile)}
                     className="px-6 py-2.5 bg-slate-50 text-indigo-600 rounded-xl font-black uppercase tracking-widest text-[8px] hover:bg-indigo-100 transition-all flex items-center gap-2 border border-slate-200"
                   >
                     <i className="fas fa-sparkles"></i>
                     Summary
                   </button>
                   <button 
                     onClick={() => alert(`Opening full document: ${activeDisplayFile.name}`)}
                     className="px-8 py-3 bg-[#0F2C5C] text-white rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-slate-800 transition-all shadow-lg flex items-center gap-2 transform hover:-translate-y-1"
                   >
                     <i className="fas fa-external-link-alt"></i>
                     Open Full Document
                   </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 space-y-4 flex flex-col items-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                   <i className="fas fa-mouse-pointer text-2xl"></i>
                </div>
                <div>
                   <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Record Intelligence Active</h3>
                   <p className="text-slate-500 font-medium max-w-[240px] mx-auto mt-2 text-xs leading-relaxed">Select a document from the left stack to view automated summaries and full archives.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: AI History & Activity */}
        <div className="w-80 border-l border-slate-200 bg-white flex flex-col shrink-0">
           {/* BACK TO MAIN HUB BUTTON - PLACED AT TOP RIGHT */}
           <div className="p-4 border-b border-slate-100 bg-white flex flex-col gap-4">
              <button 
                onClick={onClose}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#0F2C5C] text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-md transform hover:-translate-y-0.5"
              >
                <i className="fas fa-th-large text-[10px]"></i>
                Back to Main Hub
              </button>
              <div className="flex items-center gap-3 pt-2">
                <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                  <i className="fas fa-comment-nodes text-xs"></i>
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Search Assistant</p>
                  <p className="text-[8px] font-bold text-indigo-500 uppercase tracking-widest">Semantic Engine 3.0</p>
                </div>
              </div>
           </div>
           
           <div className="flex-1 overflow-y-auto p-4 space-y-4 hide-scrollbar bg-slate-50/10">
              {messages.length === 0 ? (
                 <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-20">
                    <i className="fas fa-robot text-4xl mb-3 text-slate-400"></i>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Assistant Standby</p>
                 </div>
              ) : messages.map((m, i) => (
                 <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                    <div className={`max-w-[90%] p-3 rounded-xl text-[10px] font-bold leading-relaxed shadow-sm ${
                      m.role === 'user' ? 'bg-[#0F2C5C] text-white rounded-tr-none' : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                    }`}>
                       {m.text}
                    </div>
                 </div>
              ))}
              {isAiProcessing && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-100 rounded-xl rounded-tl-none p-3 flex gap-1 items-center">
                    <div className="w-1 h-1 bg-indigo-200 rounded-full animate-bounce"></div>
                    <div className="w-1 h-1 bg-indigo-200 rounded-full animate-bounce delay-75"></div>
                    <div className="w-1 h-1 bg-indigo-200 rounded-full animate-bounce delay-150"></div>
                  </div>
                </div>
              )}
           </div>
           
           <div className="p-4 bg-white border-t border-slate-100">
              <div className="flex gap-2">
                 <input 
                   type="text" 
                   value={chatInput}
                   onChange={(e) => setChatInput(e.target.value)}
                   onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                   placeholder="Query the archives..."
                   className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-[10px] font-bold text-slate-700 outline-none focus:bg-white focus:border-indigo-600 transition-all shadow-inner"
                 />
                 <button 
                   onClick={handleSendMessage}
                   className="w-10 h-10 bg-[#0F2C5C] text-white rounded-xl flex items-center justify-center hover:bg-slate-800 transition-all shadow-lg"
                 >
                   <i className={`fas ${isAiProcessing ? 'fa-circle-notch fa-spin' : 'fa-paper-plane'} text-xs`}></i>
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default DatabasePortal;
