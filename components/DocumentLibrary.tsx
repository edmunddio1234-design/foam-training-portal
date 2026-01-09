// ============================================
// FOAM DOCUMENT LIBRARY - AI ASSISTANT
// ============================================
// Browse, search, and chat with AI about documents
// ============================================

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search, FileText, FileSpreadsheet, File, Image, Folder,
  RefreshCw, ExternalLink, Calendar, HardDrive, MessageSquare,
  Send, X, Filter, Grid, List, ChevronRight, Bot, User,
  FileType, Clock, FolderOpen, Sparkles
} from 'lucide-react';

const API_BASE_URL = 'https://foamla-backend-2.onrender.com';

interface Document {
  id: string;
  name: string;
  type: string;
  mimeType: string;
  modifiedTime: string;
  size: string;
  webViewLink: string;
  thumbnailLink?: string;
}

interface Stats {
  total: number;
  byType: {
    documents: number;
    spreadsheets: number;
    pdfs: number;
    presentations: number;
    images: number;
    folders: number;
    other: number;
  };
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const DocumentLibrary: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Fetch documents (including subfolders)
  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      // Include subfolders to get ALL documents
      const response = await fetch(`${API_BASE_URL}/api/documents?includeSubfolders=true`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setDocuments(data.files || []);
      setStats(data.stats || null);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDocuments(); }, []);

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Send chat message
  const sendMessage = async () => {
    if (!chatInput.trim() || chatLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: chatInput.trim(),
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setChatLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage.content })
      });

      if (!response.ok) throw new Error('Chat failed');

      const data = await response.json();
      
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setChatLoading(false);
    }
  };

  // Remove duplicates by ID (memoized for performance)
  const uniqueDocuments = useMemo(() => {
    return documents.filter((doc, index, self) =>
      index === self.findIndex(d => d.id === doc.id)
    );
  }, [documents]);

  // Filter documents (now using deduplicated list)
  const filteredDocuments = uniqueDocuments.filter(doc => {
    if (typeFilter !== 'all' && doc.type !== typeFilter) return false;
    if (searchTerm) {
      return doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

  // Get icon for file type
  const getIcon = (type: string) => {
    switch (type) {
      case 'document': return <FileText className="w-6 h-6 text-blue-500" />;
      case 'spreadsheet': return <FileSpreadsheet className="w-6 h-6 text-emerald-500" />;
      case 'pdf': return <FileType className="w-6 h-6 text-red-500" />;
      case 'image': return <Image className="w-6 h-6 text-purple-500" />;
      case 'folder': return <Folder className="w-6 h-6 text-amber-500" />;
      default: return <File className="w-6 h-6 text-slate-500" />;
    }
  };

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-slate-600 font-bold">Loading documents...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="bg-white border border-red-200 rounded-2xl p-8 max-w-md text-center shadow-lg">
        <X className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-black text-slate-800 mb-2">Failed to Load Documents</h2>
        <p className="text-slate-500 mb-4">{error}</p>
        <button onClick={fetchDocuments} className="px-6 py-3 bg-[#0F2C5C] hover:bg-slate-800 text-white rounded-xl font-bold">Try Again</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
            <FolderOpen className="w-8 h-8 text-indigo-600" />
            Document Library
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-1">FOAM Portal Documents • {uniqueDocuments.length} files</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchDocuments} className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-widest">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button 
            onClick={() => setShowChat(!showChat)} 
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg ${
              showChat ? 'bg-indigo-600 text-white' : 'bg-[#0F2C5C] hover:bg-slate-800 text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" /> AI Assistant
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
          <div className="bg-white rounded-xl p-4 border border-slate-100 text-center">
            <HardDrive className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
            <p className="text-xl font-black text-slate-800">{uniqueDocuments.length}</p>
            <p className="text-[9px] font-bold text-slate-400 uppercase">Total</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-100 text-center">
            <FileText className="w-5 h-5 text-blue-500 mx-auto mb-1" />
            <p className="text-xl font-black text-slate-800">{stats.byType.documents}</p>
            <p className="text-[9px] font-bold text-slate-400 uppercase">Docs</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-100 text-center">
            <FileSpreadsheet className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
            <p className="text-xl font-black text-slate-800">{stats.byType.spreadsheets}</p>
            <p className="text-[9px] font-bold text-slate-400 uppercase">Sheets</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-100 text-center">
            <FileType className="w-5 h-5 text-red-500 mx-auto mb-1" />
            <p className="text-xl font-black text-slate-800">{stats.byType.pdfs}</p>
            <p className="text-[9px] font-bold text-slate-400 uppercase">PDFs</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-100 text-center">
            <Image className="w-5 h-5 text-purple-500 mx-auto mb-1" />
            <p className="text-xl font-black text-slate-800">{stats.byType.images}</p>
            <p className="text-[9px] font-bold text-slate-400 uppercase">Images</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-100 text-center">
            <Folder className="w-5 h-5 text-amber-500 mx-auto mb-1" />
            <p className="text-xl font-black text-slate-800">{stats.byType.folders}</p>
            <p className="text-[9px] font-bold text-slate-400 uppercase">Folders</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-100 text-center">
            <File className="w-5 h-5 text-slate-500 mx-auto mb-1" />
            <p className="text-xl font-black text-slate-800">{stats.byType.other}</p>
            <p className="text-[9px] font-bold text-slate-400 uppercase">Other</p>
          </div>
        </div>
      )}

      <div className="flex gap-6">
        {/* Main Content */}
        <div className={`flex-1 ${showChat ? 'lg:w-2/3' : 'w-full'}`}>
          {/* Search & Filters */}
          <div className="bg-white rounded-2xl p-4 border border-slate-100 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none"
                >
                  <option value="all">All Types</option>
                  <option value="document">Documents</option>
                  <option value="spreadsheet">Spreadsheets</option>
                  <option value="pdf">PDFs</option>
                  <option value="image">Images</option>
                  <option value="folder">Folders</option>
                </select>
                <button
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100"
                >
                  {viewMode === 'grid' ? <List className="w-5 h-5 text-slate-600" /> : <Grid className="w-5 h-5 text-slate-600" />}
                </button>
              </div>
            </div>
          </div>

          {/* Documents Grid/List */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDocuments.map((doc) => (
                <a
                  key={doc.id}
                  href={doc.webViewLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white rounded-2xl p-5 border border-slate-100 hover:border-indigo-300 hover:shadow-lg transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-indigo-50 transition-colors">
                      {getIcon(doc.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
                        {doc.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(doc.modifiedTime)}</span>
                      </div>
                      {doc.size && doc.size !== 'N/A' && (
                        <p className="text-xs text-slate-400 mt-1">{doc.size}</p>
                      )}
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Name</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Type</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Modified</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Size</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocuments.map((doc) => (
                    <tr key={doc.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {getIcon(doc.type)}
                          <span className="font-medium text-slate-800 truncate max-w-xs">{doc.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 capitalize">{doc.type}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{formatDate(doc.modifiedTime)}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{doc.size}</td>
                      <td className="px-6 py-4">
                        <a
                          href={doc.webViewLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 hover:bg-indigo-100 rounded-lg inline-block"
                        >
                          <ExternalLink className="w-4 h-4 text-indigo-600" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {filteredDocuments.length === 0 && (
            <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
              <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-600 mb-2">No documents found</h3>
              <p className="text-slate-400">Try a different search term or filter</p>
            </div>
          )}
        </div>

        {/* AI Chat Panel */}
        {showChat && (
          <div className="hidden lg:block w-1/3">
            <div className="bg-white rounded-2xl border border-slate-100 h-[calc(100vh-200px)] flex flex-col sticky top-6">
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">Document Assistant</h3>
                    <p className="text-xs text-slate-400">Ask me about your files</p>
                  </div>
                </div>
                <button onClick={() => setShowChat(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.length === 0 && (
                  <div className="text-center py-8">
                    <Sparkles className="w-12 h-12 text-indigo-200 mx-auto mb-4" />
                    <p className="text-slate-500 font-medium mb-2">How can I help you?</p>
                    <div className="space-y-2 text-sm text-slate-400">
                      <p>"Find the grant status document"</p>
                      <p>"Show me all Ascension Parish files"</p>
                      <p>"What documents were modified this week?"</p>
                    </div>
                  </div>
                )}
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                    {msg.role === 'assistant' && (
                      <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div className={`max-w-[80%] p-3 rounded-2xl ${
                      msg.role === 'user' 
                        ? 'bg-[#0F2C5C] text-white rounded-br-md' 
                        : 'bg-slate-100 text-slate-800 rounded-bl-md'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                    {msg.role === 'user' && (
                      <div className="w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-slate-600" />
                      </div>
                    )}
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-slate-100 p-3 rounded-2xl rounded-bl-md">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t border-slate-200">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ask about your documents..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!chatInput.trim() || chatLoading}
                    className="px-4 py-3 bg-[#0F2C5C] hover:bg-slate-800 text-white rounded-xl disabled:opacity-50"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Chat Button */}
      {!showChat && (
        <button
          onClick={() => setShowChat(true)}
          className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full shadow-lg flex items-center justify-center"
        >
          <MessageSquare className="w-6 h-6 text-white" />
        </button>
      )}
    </div>
  );
};

export default DocumentLibrary;
