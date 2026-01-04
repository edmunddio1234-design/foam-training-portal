import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";

// Types
interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  size?: string;
  webViewLink?: string;
  iconLink?: string;
  folderId?: string;
}

// Backend API URL - Change this to your Render backend URL
const API_BASE_URL = 'https://foamla-backend-2.onrender.com';

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
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'demo'>('connecting');
  const [chatInput, setChatInput] = useState('');
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([]);
  
  // Selection and Preview states
  const [hoveredFile, setHoveredFile] = useState<DriveFile | null>(null);
  const [previewFile, setPreviewFile] = useState<DriveFile | null>(null);
  const [summaryCache, setSummaryCache] = useState<Record<string, string>>({});
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [fileContent, setFileContent] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Scroll chat to bottom when new messages arrive
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Load files on mount
  useEffect(() => {
    loadFiles();
  }, []);

  // Fetch files from Google Drive backend
  const loadFiles = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/files`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.files && data.files.length > 0) {
          setFiles(data.files);
          setConnectionStatus('connected');
          // Notify AI that we have real files
          setMessages([{ 
            role: 'bot', 
            text: `✅ Connected to Google Drive! I found ${data.files.length} files. Ask me anything about your documents - I can search, summarize, and help you find what you need.` 
          }]);
        } else {
          setConnectionStatus('connected');
          setMessages([{ 
            role: 'bot', 
            text: `✅ Connected to Google Drive, but no files found. Try uploading some files first!` 
          }]);
        }
      } else if (response.status === 401) {
        // Not authenticated - switch to demo mode
        setConnectionStatus('demo');
        loadDemoFiles();
        setMessages([{ 
          role: 'bot', 
          text: `⚠️ Running in Demo Mode. To access your real Google Drive files, please log in with your @foamla.org account.` 
        }]);
      } else {
        throw new Error('Failed to fetch files');
      }
    } catch (err: any) {
      console.warn('Backend connection unavailable:', err.message);
      setConnectionStatus('demo');
      loadDemoFiles();
      setMessages([{ 
        role: 'bot', 
        text: `📂 Demo Mode Active. Backend connection unavailable. Showing sample files for demonstration.` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Demo files for when backend is unavailable
  const loadDemoFiles = () => {
    const demoFiles: DriveFile[] = [
      { id: '1', name: 'FOAM_Case_Management_Standards.pdf', mimeType: 'application/pdf', modifiedTime: '2024-03-15T10:00:00Z', folderId: 'training' },
      { id: '2', name: 'Project_Family_Build_Intake_Template.docx', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', modifiedTime: '2024-03-20T14:30:00Z', folderId: 'clients' },
      { id: '3', name: 'Financial_Quarterly_Projections_FY25.xlsx', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', modifiedTime: '2024-04-01T09:15:00Z', folderId: 'finance' },
      { id: '4', name: 'NPCL_Curriculum_Module_Overview.pdf', mimeType: 'application/pdf', modifiedTime: '2024-02-10T11:45:00Z', folderId: 'training' },
      { id: '5', name: 'Board_Meeting_Minutes_Jan.pdf', mimeType: 'application/pdf', modifiedTime: '2025-01-05T10:00:00Z', folderId: 'gov' },
      { id: '6', name: 'Staff_Handbook_2025.pdf', mimeType: 'application/pdf', modifiedTime: '2024-12-15T11:00:00Z', folderId: 'hr' },
      { id: '7', name: 'Grant_Proposal_LCTF_2025.docx', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', modifiedTime: '2025-01-10T09:00:00Z', folderId: 'finance' },
      { id: '8', name: 'FOAM_Deliverables_Q4_2024.xlsx', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', modifiedTime: '2024-12-20T14:00:00Z', folderId: 'gov' },
    ];
    setFiles(demoFiles);
  };

  // Generate AI summary for a file
  const getAiSummary = async (file: DriveFile) => {
    if (summaryCache[file.id]) return;
    setIsGeneratingSummary(true);
    try {
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
      
      // Try to get actual file content if connected
      let contentContext = '';
      if (connectionStatus === 'connected') {
        try {
          const response = await fetch(`${API_BASE_URL}/files/${file.id}`, {
            credentials: 'include'
          });
          if (response.ok) {
            const data = await response.json();
            // For text-based files, include a snippet of content
            if (data.content && (file.mimeType.includes('text') || file.mimeType.includes('document'))) {
              const decoded = atob(data.content);
              contentContext = `\n\nFile content preview: "${decoded.substring(0, 500)}..."`;
            }
          }
        } catch (err) {
          console.warn('Could not fetch file content for summary');
        }
      }
      
      const prompt = `Provide a concise 3-sentence professional summary for a file titled "${file.name}". 
Context: This file belongs to Fathers On A Mission (FOAM), a non-profit focusing on fatherhood mentorship and community support. 
File type: ${file.mimeType}
Last modified: ${file.modifiedTime}${contentContext}

The summary should explain the likely administrative importance of this document and what it might contain.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt
      });
      const summary = response.text || "Summary analysis currently unavailable for this record.";
      setSummaryCache(prev => ({ ...prev, [file.id]: summary }));
    } catch (err) {
      console.error("AI Summary generation failed", err);
      setSummaryCache(prev => ({ ...prev, [file.id]: "Unable to generate summary. Please try again." }));
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  // AI-powered smart search across all files
  const handleSmartSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsAiProcessing(true);
    setMessages(prev => [...prev, { role: 'user', text: `🔍 Smart Search: "${searchQuery}"` }]);
    
    try {
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
      
      // Build rich context from all files
      const fileListContext = files.map(f => {
        const type = f.mimeType.includes('pdf') ? 'PDF' : 
                     f.mimeType.includes('sheet') || f.mimeType.includes('excel') ? 'Spreadsheet' :
                     f.mimeType.includes('document') || f.mimeType.includes('word') ? 'Document' : 'File';
        return `- ${f.name} (${type}, modified: ${f.modifiedTime?.split('T')[0] || 'unknown'})`;
      }).join('\n');
      
      const prompt = `You are the FOAM (Fathers On A Mission) intelligent document assistant. 
      
The user is searching their Google Drive with this query: "${searchQuery}"

Here are ALL the available files in the drive:
${fileListContext}

Your task:
1. Identify which files are MOST relevant to the search query
2. Explain WHY each file might be relevant
3. If the search relates to a specific topic (grants, finances, training, HR, etc.), mention any patterns you notice
4. Suggest related searches the user might want to try

Be helpful, specific, and professional. Reference actual file names from the list.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt
      });
      
      setMessages(prev => [...prev, { role: 'bot', text: response.text || "I've analyzed the drive but couldn't find specific matches. Try different keywords." }]);
      
      // Also filter the visible files based on keyword match
      const query = searchQuery.toLowerCase();
      const matchingFiles = files.filter(f => f.name.toLowerCase().includes(query));
      if (matchingFiles.length > 0 && matchingFiles.length < files.length) {
        // Highlight matching files by putting them first
        const otherFiles = files.filter(f => !f.name.toLowerCase().includes(query));
        setFiles([...matchingFiles, ...otherFiles]);
      }
      
    } catch (err) {
      console.error("Smart Search failed", err);
      setMessages(prev => [...prev, { role: 'bot', text: "Sorry, I encountered an error while searching. Please try again." }]);
    } finally {
      setIsAiProcessing(false);
      setSearchQuery('');
    }
  };

  // General AI chat about files and documents
  const handleSendMessage = async () => {
    if (!chatInput.trim() || isAiProcessing) return;
    const userMsg = chatInput;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatInput('');
    setIsAiProcessing(true);
    
    try {
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
      
      // Build context with file list
      const fileListContext = files.map(f => `- ${f.name}`).join('\n');
      
      // Include any selected file context
      let selectedFileContext = '';
      if (previewFile) {
        selectedFileContext = `\n\nCurrently selected file: "${previewFile.name}" (${previewFile.mimeType})`;
        if (summaryCache[previewFile.id]) {
          selectedFileContext += `\nAI Summary of this file: ${summaryCache[previewFile.id]}`;
        }
      }
      
      const prompt = `You are the FOAM (Fathers On A Mission) Digital Records AI Assistant. You help users navigate, understand, and find files in their organization's Google Drive.

Available files in the drive:
${fileListContext}
${selectedFileContext}

Connection status: ${connectionStatus === 'connected' ? 'Live connection to Google Drive' : 'Demo mode - showing sample files'}

User question: ${userMsg}

Provide a helpful, professional response. If the user asks about specific files, reference them by name. If they ask for recommendations or analysis, use the file names and types to give informed suggestions.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt
      });
      
      setMessages(prev => [...prev, { role: 'bot', text: response.text || "I'm here to help with your documents. What would you like to know?" }]);
    } catch (err) {
      console.error("AI Chat failed", err);
      setMessages(prev => [...prev, { role: 'bot', text: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsAiProcessing(false);
    }
  };

  // Export files list to CSV
  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "ID,Name,Type,Modified,Link\n" + 
      files.map(f => `${f.id},"${f.name}",${f.mimeType},${f.modifiedTime || ''},${f.webViewLink || ''}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "FOAM_Records_Export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setMessages(prev => [...prev, { role: 'bot', text: `📥 Exported ${files.length} files to CSV. Check your downloads folder!` }]);
  };

  // Upload file to Google Drive
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (connectionStatus !== 'connected') {
      setMessages(prev => [...prev, { role: 'bot', text: "⚠️ Upload requires a live connection to Google Drive. Please log in first." }]);
      return;
    }
    
    setIsLoading(true);
    setMessages(prev => [...prev, { role: 'bot', text: `📤 Uploading "${file.name}"...` }]);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`${API_BASE_URL}/files/upload`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, { role: 'bot', text: `✅ Successfully uploaded "${data.file.name}" to Google Drive!` }]);
        // Refresh file list
        loadFiles();
      } else {
        throw new Error('Upload failed');
      }
    } catch (err) {
      console.error("Upload failed", err);
      setMessages(prev => [...prev, { role: 'bot', text: "❌ Upload failed. Please check your connection and try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Open file in Google Drive
  const handleOpenFile = (file: DriveFile) => {
    if (file.webViewLink) {
      window.open(file.webViewLink, '_blank');
    } else if (connectionStatus === 'connected') {
      window.open(`https://drive.google.com/file/d/${file.id}/view`, '_blank');
    } else {
      setMessages(prev => [...prev, { role: 'bot', text: "📄 In demo mode, files can't be opened. Connect to Google Drive to access real files." }]);
    }
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

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) return 'fa-file-pdf';
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'fa-file-excel';
    if (mimeType.includes('document') || mimeType.includes('word')) return 'fa-file-word';
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'fa-file-powerpoint';
    if (mimeType.includes('image')) return 'fa-file-image';
    if (mimeType.includes('folder')) return 'fa-folder';
    return 'fa-file-alt';
  };

  const getFileColor = (mimeType: string) => {
    if (mimeType.includes('pdf')) return 'bg-rose-50 text-rose-500';
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'bg-emerald-50 text-emerald-600';
    if (mimeType.includes('document') || mimeType.includes('word')) return 'bg-blue-50 text-blue-600';
    if (mimeType.includes('presentation')) return 'bg-orange-50 text-orange-500';
    if (mimeType.includes('image')) return 'bg-purple-50 text-purple-500';
    return 'bg-slate-50 text-slate-500';
  };

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
            <div className="flex items-center gap-2">
              <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-[0.3em]">AI-Powered Google Drive</p>
              <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                connectionStatus === 'connected' ? 'bg-emerald-100 text-emerald-600' :
                connectionStatus === 'connecting' ? 'bg-amber-100 text-amber-600' :
                'bg-slate-100 text-slate-500'
              }`}>
                {connectionStatus === 'connected' ? '● Live' : connectionStatus === 'connecting' ? '● Connecting...' : '● Demo'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex-1 max-w-xl mx-8 relative group">
          <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors"></i>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSmartSearch()}
            placeholder="Ask AI to find files... (e.g., 'grant proposals', 'financial reports')" 
            className="w-full pl-14 pr-16 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:border-indigo-600 outline-none transition-all shadow-inner"
          />
          <button 
            onClick={handleSmartSearch}
            disabled={isAiProcessing}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#0F2C5C] text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-sm disabled:opacity-50"
          >
            {isAiProcessing ? <i className="fas fa-circle-notch fa-spin"></i> : <><i className="fas fa-magic mr-1"></i> AI Search</>}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileUpload}
          />
          <button 
            onClick={handleImportClick}
            disabled={connectionStatus !== 'connected'}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all border border-slate-200 disabled:opacity-50"
          >
            <i className="fas fa-cloud-upload-alt"></i>
            Upload
          </button>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all border border-slate-200"
          >
            <i className="fas fa-file-export"></i>
            Export
          </button>
          <button 
            onClick={loadFiles}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-all border border-indigo-200"
          >
            <i className={`fas fa-sync ${isLoading ? 'fa-spin' : ''}`}></i>
            Refresh
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
            <div className="flex items-center justify-between px-4 mb-4 mt-2">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">Document Stack</p>
              <p className="text-[9px] font-bold text-slate-300">{filteredFiles.length} files</p>
            </div>
            {isLoading ? (
               <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-40">
                  <i className="fas fa-sync fa-spin text-4xl text-[#0F2C5C]"></i>
                  <p className="text-xs font-bold text-slate-400">Loading files...</p>
               </div>
            ) : filteredFiles.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-40">
                  <i className="fas fa-folder-open text-4xl text-slate-300"></i>
                  <p className="text-xs font-bold text-slate-400">No files found</p>
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
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${getFileColor(file.mimeType)}`}>
                  <i className={`fas ${getFileIcon(file.mimeType)}`}></i>
                </div>
                <div className="overflow-hidden flex-1">
                  <p className={`text-xs font-bold truncate transition-colors ${previewFile?.id === file.id || hoveredFile?.id === file.id ? 'text-[#0F2C5C]' : 'text-slate-600'}`}>
                    {file.name}
                  </p>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    {file.modifiedTime?.split('T')[0] || 'Unknown date'}
                  </p>
                </div>
                {file.webViewLink && (
                  <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <i className="fas fa-external-link-alt text-[8px] text-slate-400"></i>
                  </div>
                )}
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
                  activeDisplayFile.mimeType.includes('sheet') || activeDisplayFile.mimeType.includes('excel') ? 'bg-emerald-600 text-white' : 
                  activeDisplayFile.mimeType.includes('document') || activeDisplayFile.mimeType.includes('word') ? 'bg-blue-600 text-white' :
                  'bg-slate-600 text-white'
                }`}>
                   <i className={`fas ${getFileIcon(activeDisplayFile.mimeType)}`}></i>
                </div>
                <div className="space-y-1 max-w-full">
                   <h2 className="text-lg md:text-xl font-black text-slate-800 tracking-tight leading-tight uppercase break-words px-4">
                     {activeDisplayFile.name}
                   </h2>
                   <div className="flex items-center justify-center gap-2 flex-wrap">
                      <span className={`text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-full ${
                        connectionStatus === 'connected' ? 'text-emerald-600 bg-emerald-50' : 'text-slate-500 bg-slate-100'
                      }`}>
                        {connectionStatus === 'connected' ? 'Google Drive' : 'Demo File'}
                      </span>
                      <div className="w-1 h-1 rounded-full bg-slate-200"></div>
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">{activeDisplayFile.modifiedTime?.split('T')[0]}</span>
                   </div>
                </div>

                <div className="w-full bg-slate-50 p-6 md:p-8 rounded-[1.5rem] border border-slate-100 relative group min-h-[100px] flex items-center justify-center shadow-inner overflow-hidden">
                   {isGeneratingSummary ? (
                      <div className="flex flex-col items-center gap-2 text-slate-400">
                        <i className="fas fa-robot fa-bounce text-lg"></i>
                        <span className="text-[8px] font-black uppercase tracking-widest">AI analyzing document...</span>
                      </div>
                   ) : (
                      <div className="animate-in fade-in duration-700 w-full overflow-y-auto max-h-[120px] hide-scrollbar">
                        <p className="text-xs md:text-sm text-slate-600 font-medium leading-relaxed italic text-center">
                           "{summaryCache[activeDisplayFile.id] || "Hover or select a file to generate an AI summary."}"
                        </p>
                      </div>
                   )}
                   <i className="fas fa-quote-right absolute top-3 right-4 text-slate-200 text-xl opacity-40"></i>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                   <button 
                     onClick={() => getAiSummary(activeDisplayFile)}
                     disabled={isGeneratingSummary}
                     className="px-6 py-2.5 bg-slate-50 text-indigo-600 rounded-xl font-black uppercase tracking-widest text-[8px] hover:bg-indigo-100 transition-all flex items-center gap-2 border border-slate-200 disabled:opacity-50"
                   >
                     <i className="fas fa-sparkles"></i>
                     {summaryCache[activeDisplayFile.id] ? 'Regenerate' : 'AI Summary'}
                   </button>
                   <button 
                     onClick={() => handleOpenFile(activeDisplayFile)}
                     className="px-8 py-3 bg-[#0F2C5C] text-white rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-slate-800 transition-all shadow-lg flex items-center gap-2 transform hover:-translate-y-1"
                   >
                     <i className="fas fa-external-link-alt"></i>
                     Open in Drive
                   </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 space-y-4 flex flex-col items-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                   <i className="fas fa-mouse-pointer text-2xl"></i>
                </div>
                <div>
                   <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">AI Records Assistant Ready</h3>
                   <p className="text-slate-500 font-medium max-w-[280px] mx-auto mt-2 text-xs leading-relaxed">
                     Select a document to view AI summaries, or use the search bar to ask AI to find specific files.
                   </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: AI Chat */}
        <div className="w-80 border-l border-slate-200 bg-white flex flex-col shrink-0">
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
                  <i className="fas fa-robot text-xs"></i>
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest">AI Document Assistant</p>
                  <p className="text-[8px] font-bold text-indigo-500 uppercase tracking-widest">
                    {connectionStatus === 'connected' ? 'Connected to Drive' : 'Demo Mode'}
                  </p>
                </div>
              </div>
           </div>
           
           <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 hide-scrollbar bg-slate-50/30">
              {messages.length === 0 ? (
                 <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-40">
                    <i className="fas fa-comments text-4xl mb-3 text-slate-300"></i>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ask me about your files</p>
                 </div>
              ) : messages.map((m, i) => (
                 <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                    <div className={`max-w-[90%] p-3 rounded-xl text-[11px] font-medium leading-relaxed shadow-sm ${
                      m.role === 'user' ? 'bg-[#0F2C5C] text-white rounded-tr-none' : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                    }`}>
                       {m.text}
                    </div>
                 </div>
              ))}
              {isAiProcessing && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-100 rounded-xl rounded-tl-none p-3 flex gap-1 items-center shadow-sm">
                    <div className="w-1.5 h-1.5 bg-indigo-300 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-indigo-300 rounded-full animate-bounce delay-75"></div>
                    <div className="w-1.5 h-1.5 bg-indigo-300 rounded-full animate-bounce delay-150"></div>
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
                   placeholder="Ask about your files..."
                   className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[11px] font-bold text-slate-700 outline-none focus:bg-white focus:border-indigo-600 transition-all shadow-inner"
                 />
                 <button 
                   onClick={handleSendMessage}
                   disabled={isAiProcessing || !chatInput.trim()}
                   className="w-10 h-10 bg-[#0F2C5C] text-white rounded-xl flex items-center justify-center hover:bg-slate-800 transition-all shadow-lg disabled:opacity-50"
                 >
                   <i className={`fas ${isAiProcessing ? 'fa-circle-notch fa-spin' : 'fa-paper-plane'} text-xs`}></i>
                 </button>
              </div>
              <p className="text-[8px] text-slate-400 text-center mt-2 font-medium">
                Try: "Find grant proposals" or "What financial documents do we have?"
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default DatabasePortal;
