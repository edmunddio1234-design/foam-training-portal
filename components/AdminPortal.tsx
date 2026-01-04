import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
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
  { id: 'adm-1', name: 'Board_Resolution_Feb_2025_LCTF.pdf', mimeType: 'application/pdf', modifiedTime: '2025-02-11T10:00:00Z' },
  { id: 'adm-2', name: 'FOAM_Bylaws_Revised_Dec_2024.pdf', mimeType: 'application/pdf', modifiedTime: '2024-12-05T14:30:00Z' },
  { id: 'adm-3', name: 'Leadership_Flow_Map_Scale_FY26.pdf', mimeType: 'application/pdf', modifiedTime: '2025-01-20T09:15:00Z' },
  { id: 'adm-4', name: 'Employee_Handbook_Master_V2.pdf', mimeType: 'application/pdf', modifiedTime: '2024-10-15T11:45:00Z' },
  { id: 'adm-5', name: 'Culture_Compass_Standard.pdf', mimeType: 'application/pdf', modifiedTime: '2024-11-01T08:00:00Z' },
  { id: 'adm-6', name: 'Governance_Alignment_Map.png', mimeType: 'image/png', modifiedTime: '2025-01-05T16:20:00Z' },
];

interface AdminPortalProps {
  onClose: () => void;
}

const AdminPortal: React.FC<AdminPortalProps> = ({ onClose }) => {
  const [activeFolder, setActiveFolder] = useState('all');
  const [files] = useState<DriveFile[]>(DEMO_ADMIN_FILES);
  const [searchQuery, setSearchQuery] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([]);
  const [selectedFile, setSelectedFile] = useState<DriveFile | null>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isAiProcessing) return;
    const userMsg = chatInput;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatInput('');
    setIsAiProcessing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: `You are the FOAM Admin Portal AI assistant. Help with questions about governance, bylaws, HR policies, and organizational structure. User question: ${userMsg}`
      });

      const botText = response.text || "I can help you navigate FOAM's administrative documents.";
      setMessages(prev => [...prev, { role: 'bot', text: botText }]);
    } catch (err) {
      console.error("AI Error:", err);
      setMessages(prev => [...prev, { role: 'bot', text: "Error connecting to AI. Please try again." }]);
    } finally {
      setIsAiProcessing(false);
    }
  };

  const filteredFiles = files.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) return 'fa-file-pdf';
    if (mimeType.includes('image')) return 'fa-file-image';
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'fa-file-excel';
    if (mimeType.includes('document') || mimeType.includes('word')) return 'fa-file-word';
    return 'fa-file';
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-100 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-[#0F2C5C] text-white rounded-xl flex items-center justify-center">
            <i className="fas fa-user-shield"></i>
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-800 uppercase tracking-tight">FOAM Admin</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">sonny@foamla.org</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-slate-400"
        >
          <i className="fas fa-times"></i>
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
          <div className="p-4 border-b border-slate-100">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Units</p>
            <div className="space-y-1">
              {ADMIN_FOLDER_METADATA.map(folder => (
                <button
                  key={folder.id}
                  onClick={() => setActiveFolder(folder.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                    activeFolder === folder.id 
                      ? 'bg-[#0F2C5C] text-white' 
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <i className={`fas ${folder.icon} text-sm`}></i>
                  <span className="text-xs font-bold">{folder.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Search Bar */}
          <div className="p-6 bg-white border-b border-slate-100">
            <div className="relative">
              <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"></i>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Main Drive Directory..."
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-300"
              />
            </div>
          </div>

          {/* Files Grid */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFiles.map(file => (
                <button
                  key={file.id}
                  onClick={() => setSelectedFile(file)}
                  className={`bg-white p-5 rounded-2xl border text-left transition-all hover:shadow-lg ${
                    selectedFile?.id === file.id ? 'border-indigo-300 ring-2 ring-indigo-100' : 'border-slate-100'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      file.mimeType.includes('pdf') ? 'bg-rose-50 text-rose-500' :
                      file.mimeType.includes('image') ? 'bg-blue-50 text-blue-500' :
                      'bg-slate-50 text-slate-400'
                    }`}>
                      <i className={`fas ${getFileIcon(file.mimeType)}`}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-700 truncate">{file.name}</p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        {file.modifiedTime?.split('T')[0]}
                      </p>
                    </div>
                    <div className="w-6 h-6 bg-indigo-50 rounded-full flex items-center justify-center">
                      <i className="fas fa-info text-[10px] text-indigo-400"></i>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* AI Chat Sidebar */}
        <div className="w-80 bg-white border-l border-slate-200 flex flex-col shrink-0">
          <div className="p-4 border-b border-slate-100 flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
              <i className="fas fa-robot text-sm"></i>
            </div>
            <div>
              <p className="text-xs font-black text-slate-700">AI Assistant</p>
              <p className="text-[10px] text-slate-400">Leadership Protocol Active.</p>
            </div>
          </div>

          <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="text-center py-10 text-slate-300">
                <i className="fas fa-comments text-3xl mb-2"></i>
                <p className="text-xs">Ask about policies, governance, or documents</p>
              </div>
            ) : messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-xl text-xs ${
                  m.role === 'user' 
                    ? 'bg-[#0F2C5C] text-white rounded-tr-none' 
                    : 'bg-slate-100 text-slate-700 rounded-tl-none'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isAiProcessing && (
              <div className="flex justify-start">
                <div className="bg-slate-100 rounded-xl rounded-tl-none p-3 flex gap-1">
                  <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce delay-75"></div>
                  <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce delay-150"></div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-slate-100">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Analyze..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-indigo-300"
              />
              <button
                onClick={handleSendMessage}
                disabled={isAiProcessing}
                className="w-10 h-10 bg-[#0F2C5C] text-white rounded-xl flex items-center justify-center hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                <i className={`fas ${isAiProcessing ? 'fa-spinner fa-spin' : 'fa-paper-plane'} text-xs`}></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPortal;
