import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { authService, fileService, base64ToBlob } from '../services/driveAPI';
import { DriveFile, AuthUser } from '../types';

const FOLDER_METADATA = [
  { id: 'gov', name: 'Governance & Board', icon: 'fa-landmark', path: 'Root / Governance' },
  { id: 'hr', name: 'Human Resources', icon: 'fa-users', path: 'Root / HR & Personnel' },
  { id: 'finance', name: 'Financial Records', icon: 'fa-file-invoice-dollar', path: 'Root / Admin / Finance' },
  { id: 'clients', name: 'Case Files (Secure)', icon: 'fa-folder-closed', path: 'Root / Restricted / Clients' },
  { id: 'training', name: 'Training Materials', icon: 'fa-book', path: 'Root / Education / Academy' },
  { id: 'marketing', name: 'Marketing & Outreach', icon: 'fa-bullhorn', path: 'Root / Public Relations' },
];

interface DatabasePortalProps {
  onClose: () => void;
}

const DatabasePortal: React.FC<DatabasePortalProps> = ({ onClose }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [activeFolder, setActiveFolder] = useState('gov');
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pdf' | 'doc' | 'xls'>('all');
  const [error, setError] = useState<string | null>(null);
  
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const initPortal = async () => {
      try {
        const { user } = await authService.me();
        setCurrentUser(user);
        setMessages([{ role: 'bot', text: `Welcome back, ${user.name}. I am the FOAM Secure Assistant. How can I help you navigate the Drive today?` }]);
        loadFiles();
      } catch (err: any) {
        if (err.message === 'UNAUTHORIZED') {
          setCurrentUser(null);
        } else {
          setError('Backend connection failed. Please check your local server on port 3001.');
        }
      } finally {
        setIsAuthLoading(false);
      }
    };
    initPortal();
  }, []);

  const loadFiles = async () => {
    setIsLoading(true);
    try {
      const data = await fileService.list();
      setFiles(data.files);
    } catch (err: any) {
      setError('Could not retrieve file list.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isAiProcessing) return;

    const userMsg = chatInput;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatInput('');
    setIsAiProcessing(true);

    try {
      const searchResponse = await fileService.search(userMsg);
      const foundFiles = searchResponse.files;
      let fileContext = foundFiles.length > 0 
        ? foundFiles.map(f => `- ${f.name} (ID: ${f.id})`).join('\n')
        : "No direct file matches found in Drive.";

      const ai = new GoogleGenAI({ apiKey:AIzaSyCbkjPcb3EaBGP_k2qr75CvXxTiQtOJ9xM });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userMsg,
        config: {
          systemInstruction: `You are the specialized "Father's on a Mission" database chatbot. 
          User is searching the secure Google Drive. 
          The backend returned these matching files:
          ${fileContext}
          
          If there are matches, mention them. If the user wants to download, tell them to use the grid.`,
        }
      });

      setMessages(prev => [...prev, { role: 'bot', text: response.text || "Search complete." }]);
      if (foundFiles.length > 0) {
        setFiles(foundFiles);
        setActiveFolder('all');
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', text: "Error connecting to AI search service." }]);
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleDownload = async (file: DriveFile) => {
    setIsLoading(true);
    try {
      const data = await fileService.download(file.id);
      if (data.content) {
        const blob = base64ToBlob(data.content, data.mimeType);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = data.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      setError('Download failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      await fileService.upload(formData);
      setMessages(prev => [...prev, { role: 'bot', text: `✅ Successfully uploaded "${file.name}".` }]);
      loadFiles();
    } catch (err) {
      setError('Upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  const filteredFiles = files.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase());
    const isPdf = f.mimeType === 'application/pdf';
    const isDoc = f.mimeType.includes('word') || f.mimeType.includes('text');
    const isXls = f.mimeType.includes('sheet') || f.mimeType.includes('excel');
    const matchesFilter = activeFilter === 'all' ? true :
                          activeFilter === 'pdf' ? isPdf :
                          activeFilter === 'doc' ? isDoc :
                          isXls;
    return matchesSearch && matchesFilter;
  });

  if (isAuthLoading) {
    return <div className="h-screen bg-slate-50 flex items-center justify-center"><i className="fas fa-circle-notch fa-spin text-4xl text-[#0F2C5C]"></i></div>;
  }

  if (!currentUser) {
    return <AuthOverlay onLoginSuccess={(user) => { setCurrentUser(user); loadFiles(); }} />;
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden font-sans">
      {error && (
        <div className="bg-rose-600 text-white px-8 py-2 flex items-center justify-between">
           <span className="text-xs font-black uppercase tracking-widest flex items-center gap-2"><i className="fas fa-exclamation-triangle"></i> {error}</span>
           <button onClick={() => setError(null)}><i className="fas fa-times"></i></button>
        </div>
      )}

      <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shrink-0">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-800 text-white rounded-xl flex items-center justify-center shadow-lg"><i className="fas fa-database text-xl"></i></div>
            <div>
               <h1 className="text-xl font-black text-slate-800 tracking-tight">FOAM Secure Drive</h1>
               <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Active User: {currentUser.name}</p>
            </div>
         </div>
         <button onClick={async () => { await authService.logout(); setCurrentUser(null); }} className="text-slate-300 hover:text-rose-500"><i className="fas fa-power-off"></i></button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0">
           <div className="p-6">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4 pl-2">VIRTUAL DIRECTORY</p>
              <nav className="space-y-1">
                 <button onClick={() => setActiveFolder('all')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold ${activeFolder === 'all' ? 'bg-indigo-600 text-white' : 'hover:bg-white/5'}`}><i className="fas fa-layer-group w-5"></i><span>All Access</span></button>
                 {FOLDER_METADATA.map(folder => (
                   <button key={folder.id} onClick={() => setActiveFolder(folder.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold ${activeFolder === folder.id ? 'bg-indigo-600 text-white' : 'hover:bg-white/5'}`}><i className={`fas ${folder.icon} w-5`}></i><span>{folder.name}</span></button>
                 ))}
              </nav>
           </div>
           <button onClick={onClose} className="mt-auto m-6 py-3 bg-slate-800 text-slate-400 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-700 transition-all"><i className="fas fa-chevron-left"></i> Hub</button>
        </div>

        <div className="flex-1 flex flex-col bg-white overflow-hidden">
           <div className="px-8 py-6 flex items-center gap-4 border-b border-slate-100 shrink-0">
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search drive..." className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" />
              <button onClick={() => !isUploading && fileInputRef.current?.click()} className="px-6 py-3 bg-[#0F2C5C] text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-xl">
                 {isUploading ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-cloud-upload-alt"></i>}
                 <span>{isUploading ? 'Encrypting...' : 'Upload File'}</span>
              </button>
              <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
           </div>

           <div className="flex-1 overflow-y-auto p-8 bg-slate-50/30">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {filteredFiles.map(file => (
                    <div key={file.id} className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-2xl transition-all">
                       <div className="flex items-start justify-between mb-4">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${file.mimeType.includes('pdf') ? 'bg-rose-50 text-rose-500' : 'bg-blue-50 text-blue-600'}`}><i className={`fas ${file.mimeType.includes('pdf') ? 'fa-file-pdf' : 'fa-file-word'}`}></i></div>
                          <button onClick={() => handleDownload(file)} className="w-10 h-10 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center"><i className="fas fa-download"></i></button>
                       </div>
                       <h3 className="text-sm font-black text-slate-800 mb-1 truncate">{file.name}</h3>
                       <p className="text-[10px] text-slate-400 font-black uppercase">{file.modifiedTime?.split('T')[0]}</p>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        <div className="w-96 bg-white border-l border-slate-200 flex flex-col shrink-0">
           <div className="p-6 border-b bg-slate-50 flex items-center gap-4">
              <div className="w-12 h-12 bg-[#0F2C5C] text-white rounded-full flex items-center justify-center shadow-lg"><i className="fas fa-shield-cat"></i></div>
              <h3 className="text-sm font-black text-slate-800 uppercase">Assistant</h3>
           </div>
           <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
              {messages.map((m, i) => (
                 <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[90%] p-4 rounded-2xl text-xs font-bold leading-relaxed ${m.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700 border'}`}>{m.text}</div>
                 </div>
              ))}
           </div>
           <div className="p-6 bg-white border-t">
              <div className="relative">
                 <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Ask about records..." className="w-full px-4 py-3 bg-slate-50 border rounded-xl text-xs font-bold" />
                 <button onClick={handleSendMessage} className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-[#0F2C5C] text-white rounded-lg flex items-center justify-center"><i className="fas fa-bolt"></i></button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const AuthOverlay: React.FC<{ onLoginSuccess: (user: AuthUser) => void }> = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { user } = await authService.login(formData);
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0F2C5C] z-[200] flex items-center justify-center p-6">
       <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl text-center">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-8">Secure Drive Login</h2>
          {error && <p className="mb-4 text-xs font-black text-rose-600 uppercase">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
             <input type="email" required placeholder="Email" className="w-full px-5 py-4 bg-slate-50 border-2 rounded-2xl font-bold" onChange={(e) => setFormData({...formData, email: e.target.value})} />
             <input type="password" required placeholder="Password" className="w-full px-5 py-4 bg-slate-50 border-2 rounded-2xl font-bold" onChange={(e) => setFormData({...formData, password: e.target.value})} />
             <button type="submit" disabled={loading} className="w-full py-5 bg-[#0F2C5C] text-white rounded-2xl font-black uppercase tracking-widest text-xs">{loading ? 'Processing...' : 'Login'}</button>
          </form>
       </div>
    </div>
  );
};

export default DatabasePortal;