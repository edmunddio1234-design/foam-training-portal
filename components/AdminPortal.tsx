import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai"; 
import { DriveFile } from '../types';

const ADMIN_FOLDER_METADATA = [
  { id: 'all', name: 'Main Drive Directory', icon: 'fa-house-user', path: 'Drive / Root' },
  { id: 'board', name: 'Board & Governance', icon: 'fa-landmark', path: 'Drive / Administration / Governance' },
  { id: 'culture', name: 'Culture & Values', icon: 'fa-compass', path: 'Drive / Core / Alignment' },
  { id: 'leadership', name: 'Leadership Flow', icon: 'fa-sitemap', path: 'Drive / Leadership / Operations' },
  { id: 'hr', name: 'Employee Handbook', icon: 'fa-book-open', path: 'Drive / HR / Manuals' },
  { id: 'resolutions', name: 'Board Resolutions', icon: 'fa-file-signature', path: 'Drive / Legal / Resolutions' }, 
];

const DEMO_ADMIN_FILES: DriveFile[] = [
  { id: 'adm-1', name: 'Board_Resolution_Feb_2025_LCTF.pdf', mimeType: 'application/pdf', modifiedTime: '2025-02-11T10:00:00Z', folderId: 'resolutions' },
  { id: 'adm-2', name: 'FOAM_Bylaws_Revised_Dec_2024.pdf', mimeType: 'application/pdf', modifiedTime: '2024-12-05T14:30:00Z', folderId: 'board' },
  { id: 'adm-3', name: 'Leadership_Flow_Map_Scale_FY26.pdf', mimeType: 'application/pdf', modifiedTime: '2025-01-20T09:15:00Z', folderId: 'leadership' },
  { id: 'adm-4', name: 'Employee_Handbook_Master_V2.pdf', mimeType: 'application/pdf', modifiedTime: '2024-10-15T11:45:00Z', folderId: 'hr' },
  { id: 'adm-5', name: 'Culture_Compass_Standard.pdf', mimeType: 'application/pdf', modifiedTime: '2024-11-01T08:00:00Z', folderId: 'culture' },
  { id: 'adm-6', name: 'Governance_Alignment_Map.png', mimeType: 'image/png', modifiedTime: '2025-01-05T16:20:00Z', folderId: 'culture' },
];

interface AdminPortalProps {
  onClose: () => void;
}

const AdminPortal: React.FC<AdminPortalProps> = ({ onClose }) => {
  const [activeFolderId, setActiveFolderId] = useState('all');
  const [files, setFiles] = useState<DriveFile[]>(DEMO_ADMIN_FILES);
  const [searchQuery, setSearchQuery] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([]);
  const [openedFile, setOpenedFile] = useState<DriveFile | null>(null);
  const [activeDocTab, setActiveDocTab] = useState<'document' | 'compliance' | 'history'>('document');
  const [summaryCache, setSummaryCache] = useState<Record<string, string>>({});

  useEffect(() => {
    setMessages([{ 
      role: 'bot', 
      text: openedFile ? `Reviewing ${openedFile.name}.` : "Leadership Protocol Active." 
    }]);
  }, [openedFile]);

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isAiProcessing) return;
    const userMsg = chatInput;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatInput('');
    setIsAiProcessing(true);
    try {
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const result = await model.generateContent(userMsg);
      const response = await result.response;
      const text = response.text() || "Executed.";
      
      setMessages(prev => [...prev, { role: 'bot', text: text }]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: 'bot', text: "Error connecting to AI." }]);
    } finally {
      setIsAiProcessing(false);
    }
  };

  const filteredFiles = files.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFolder = activeFolderId === 'all' || f.folderId === activeFolderId;
    return matchesSearch && matchesFolder;
  });

  const activeFolder = ADMIN_FOLDER_METADATA.find(f => f.id === activeFolderId) || ADMIN_FOLDER_METADATA[0];

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden font-sans">
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shrink-0 shadow-sm z-10">
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-md">
              <i className="fas fa-user-shield text-lg"></i>
            </div>
            <div>
               <h1 className="text-lg font-black text-slate-800 tracking-tight leading-none uppercase">FOAM Admin</h1>
               <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Sonny@foamla.org</p>
            </div>
         </div>
         <button onClick={onClose} className="p-2 text-slate-400 hover:text-rose-500 rounded-full transition-all"><i className="fas fa-times"></i></button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {!openedFile && (
          <div className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0">
            <div className="p-5">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-4 pl-2">Units</p>
                <nav className="space-y-1">
                  {ADMIN_FOLDER_METADATA.map(folder => (
                    <button 
                      key={folder.id} 
                      onClick={() => setActiveFolderId(folder.id)} 
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${activeFolderId === folder.id ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-white/5'}`}
                    >
                      <i className={`fas ${folder.icon} w-4 text-center`}></i>
                      <span className="truncate">{folder.name}</span>
                    </button>
                  ))}
                </nav>
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col bg-white overflow-hidden relative min-w-0">
           {openedFile ? (
             <div className="flex-1 flex flex-col bg-slate-700 overflow-hidden animate-in fade-in duration-300">
                <div className="px-5 py-2.5 bg-slate-900 border-b border-black flex items-center justify-between shrink-0 shadow-lg">
                   <div className="flex items-center gap-3">
                      <button onClick={() => setOpenedFile(null)} className="w-8 h-8 bg-slate-800 text-slate-400 rounded-lg flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all"><i className="fas fa-arrow-left text-xs"></i></button>
                      <h2 className="text-xs font-black text-slate-200 truncate max-w-[200px]">{openedFile.name}</h2>
                   </div>
                   <button onClick={() => alert('Saved')} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg"><i className="fas fa-cloud-upload-alt mr-2"></i>Sync</button>
                </div>
                <div className="bg-slate-900 border-b border-black flex px-5 shrink-0">
                   {['document', 'compliance', 'history'].map(tab => (
                     <button key={tab} onClick={() => setActiveDocTab(tab as any)} className={`px-4 py-3 text-[9px] font-black uppercase tracking-widest border-b-2 transition-all ${activeDocTab === tab ? 'border-blue-600 text-white' : 'border-transparent text-slate-500'}`}>{tab}</button>
                   ))}
                </div>
                <div className="flex-1 overflow-auto p-6 flex flex-col items-center bg-slate-700 hide-scrollbar">
                   <div className="bg-white shadow-2xl w-full max-w-[600px] min-h-[800px] p-12 rounded-sm space-y-8">
                      <h3 className="text-2xl font-black uppercase tracking-widest border-b-4 border-slate-900 pb-4">FOAM Official Record</h3>
                      <p className="text-sm font-serif leading-relaxed text-slate-800 italic">This record certfies admin protocol for {openedFile.name}. All FOAM operations must align with the FY26 strategic plan.</p>
                      <div className="pt-20 flex justify-end"><div className="w-48 border-t border-slate-900 pt-2 text-[10px] font-black uppercase">Executive Director</div></div>
                   </div>
                </div>
             </div>
           ) : (
             <div className="flex-1 flex flex-col bg-white overflow-hidden">
               <div className="px-6 py-4 flex items-center gap-3 border-b border-slate-100 bg-white/50 backdrop-blur-md">
                  <div className="relative flex-1">
                     <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300"></i>
                     <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={`Search ${activeFolder.name}...`} className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white outline-none shadow-inner" />
                  </div>
               </div>
               <div className="flex-1 overflow-y-auto p-6 bg-slate-50/40">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                     {filteredFiles.map(file => (
                        <div key={file.id} onDoubleClick={() => setOpenedFile(file)} className="p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group cursor-pointer relative overflow-hidden">
                           <div className="flex items-start justify-between mb-4">
                              <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center text-xl group-hover:bg-blue-50 group-hover:text-blue-500 transition-all"><i className="fas fa-file-pdf"></i></div>
                              <button onClick={() => setOpenedFile(file)} className="w-8 h-8 bg-slate-50 text-slate-300 rounded-xl flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all"><i className="fas fa-info-circle"></i></button>
                           </div>
                           <h3 className="text-sm font-black text-slate-800 truncate mb-1 group-hover:text-blue-600 transition-colors">{file.name}</h3>
                           <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest">{file.modifiedTime?.split('T')[0]}</p>
                        </div>
                     ))}
                  </div>
               </div>
             </div>
           )}
        </div>

        <div className="w-72 bg-white border-l border-slate-200 flex flex-col shrink-0 shadow-xl">
           <div className="p-4 border-b bg-slate-50 flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center shadow-lg"><i className="fas fa-robot text-xs"></i></div>
              <p className="text-[10px] font-black text-slate-800 uppercase tracking-tight">AI Assistant</p>
           </div>
           <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30 hide-scrollbar">
              {messages.map((m, i) => (
                 <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in`}>
                    <div className={`max-w-[95%] p-3 rounded-xl text-[10px] font-bold leading-relaxed shadow-sm ${m.role === 'user' ? 'bg-slate-900 text-white rounded-tr-none' : 'bg-white text-slate-700 border rounded-tl-none'}`}>{m.text}</div>
                 </div>
              ))}
              {isAiProcessing && <div className="p-3 bg-white border rounded-xl w-12 flex gap-1 items-center"><div className="w-1 h-1 bg-slate-300 rounded-full animate-bounce"></div><div className="w-1 h-1 bg-slate-300 rounded-full animate-bounce delay-75"></div></div>}
           </div>
           <div className="p-4 bg-white border-t">
              <div className="relative flex gap-2">
                 <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Analyze..." className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-bold focus:bg-white outline-none" />
                 <button onClick={handleSendMessage} className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center hover:bg-blue-600 transition-all shadow-md"><i className="fas fa-paper-plane text-[10px]"></i></button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPortal;
