import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  AreaChart, Area, CartesianGrid, Legend
} from 'recharts';

// ===========================================
// CONFIGURATION - EDIT AUTHORIZED USERS HERE
// ===========================================
const AUTHORIZED_ADMINS = [
  "sonny@foamla.org",
  "levar.robinson@foamla.org",
  // Add more authorized emails below:
  // "newuser@foamla.org",
];

// Backend API URL
const API_BASE_URL = 'https://foamla-backend-2.onrender.com';

// Google Sheet IDs
const SHEET_IDS = {
  grants: '1WlHlTjsDCPDH8Qz8A-YCltkE1nalsc3htx9da0hg8zo',
  finance: '1CLWL5L81YYKElX3dMNAUCkpaPJxsraTtEzaLMq9v4Yo',
};

interface AdminPortalProps {
  onClose: () => void;
}

// Types for data
interface GrantData {
  name: string;
  source: string;
  purpose: string;
  amountRequested: number;
  amountApproved: number;
  status: string;
  deadline: string;
  submissionDate: string;
}

interface FinanceData {
  category: string;
  budget: number;
  spent: number;
}

interface MetricsData {
  measure: string;
  target: number;
  q1: number;
  q2: number;
  q3: number;
  q4: number;
  ytd: number;
}

interface MonthlyData {
  month: string;
  intakes: number;
  graduations: number;
  participants: number;
}

const AdminPortal: React.FC<AdminPortalProps> = ({ onClose }) => {
  // View states
  const [subView, setSubView] = useState<'landing' | 'grants' | 'finance' | 'monthly'>('landing');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingView, setPendingView] = useState<'grants' | 'finance' | 'monthly' | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Data states
  const [grantData, setGrantData] = useState<GrantData[]>([]);
  const [financeData, setFinanceData] = useState<FinanceData[]>([]);
  const [metricsData, setMetricsData] = useState<MetricsData[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);

  // AI Chat states
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([]);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Check for saved session
  useEffect(() => {
    const savedEmail = localStorage.getItem('foam_admin_email');
    if (savedEmail && AUTHORIZED_ADMINS.includes(savedEmail.toLowerCase())) {
      setUserEmail(savedEmail);
    }
  }, []);

  // Scroll chat to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Handle dashboard card click
  const handleCardClick = (view: 'grants' | 'finance' | 'monthly') => {
    if (userEmail) {
      setSubView(view);
      loadDashboardData(view);
    } else {
      setPendingView(view);
      setShowLoginModal(true);
    }
  };

  // Email verification
  const handleLogin = () => {
    const email = loginEmail.trim().toLowerCase();
    
    if (!email.endsWith('@foamla.org')) {
      setLoginError('Please use your @foamla.org email address');
      return;
    }
    
    if (!AUTHORIZED_ADMINS.map(e => e.toLowerCase()).includes(email)) {
      setLoginError('Access denied. Your email is not authorized for admin access.');
      return;
    }
    
    // Success - save session and proceed
    localStorage.setItem('foam_admin_email', email);
    setUserEmail(email);
    setShowLoginModal(false);
    setLoginError('');
    setLoginEmail('');
    
    if (pendingView) {
      setSubView(pendingView);
      loadDashboardData(pendingView);
      setPendingView(null);
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('foam_admin_email');
    setUserEmail(null);
    setSubView('landing');
    setMessages([]);
  };

  // Load dashboard data from backend
  const loadDashboardData = async (view: 'grants' | 'finance' | 'monthly') => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/${view}`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (view === 'grants') {
          setGrantData(data.grants || []);
          setMessages([{ role: 'bot', text: `📊 Loaded ${data.grants?.length || 0} grants from the database. How can I help you analyze the grant data?` }]);
        } else if (view === 'finance') {
          setFinanceData(data.finance || []);
          setMessages([{ role: 'bot', text: `💰 Financial data loaded. Total budget: $${data.totalBudget?.toLocaleString() || 'N/A'}. Total spent: $${data.totalSpent?.toLocaleString() || 'N/A'}. Ask me anything about the financials.` }]);
        } else if (view === 'monthly') {
          setMetricsData(data.metrics || []);
          setMonthlyData(data.monthly || []);
          setMessages([{ role: 'bot', text: `📈 Monthly operations data loaded. I can help you analyze trends, participant metrics, and program performance.` }]);
        }
      } else {
        // Load demo data if backend fails
        loadDemoData(view);
      }
    } catch (err) {
      console.warn('Backend unavailable, loading demo data');
      loadDemoData(view);
    } finally {
      setIsLoading(false);
    }
  };

  // Demo data fallback
  const loadDemoData = (view: 'grants' | 'finance' | 'monthly') => {
    if (view === 'grants') {
      setGrantData([
        { name: 'LCTF Grant', source: 'Louisiana Legislature', purpose: 'Workforce Development', amountRequested: 200000, amountApproved: 200000, status: 'Approved', deadline: '2025-07-01', submissionDate: '2025-05-15' },
        { name: 'EBR Housing', source: 'EBR Housing Authority', purpose: 'Project Family Build', amountRequested: 25000, amountApproved: 21000, status: 'Approved', deadline: '2025-06-01', submissionDate: '2025-04-20' },
        { name: 'Walmart Foundation', source: 'Walmart', purpose: 'Community Impact', amountRequested: 5000, amountApproved: 5000, status: 'Approved', deadline: '2025-03-15', submissionDate: '2025-02-10' },
        { name: 'Blue Cross Shield', source: 'BCBSLA', purpose: 'Capacity Building', amountRequested: 10000, amountApproved: 0, status: 'Pending', deadline: '2025-09-01', submissionDate: '2025-08-15' },
      ]);
      setMessages([{ role: 'bot', text: `📊 Demo mode: Showing sample grant data. Connect to backend for live data.` }]);
    } else if (view === 'finance') {
      setFinanceData([
        { category: 'Gross Salaries', budget: 71700, spent: 36995 },
        { category: 'Related Benefits', budget: 8782, spent: 11435 },
        { category: 'Operating Services', budget: 45505, spent: 14025 },
        { category: 'Professional Services', budget: 55600, spent: 37010 },
        { category: 'Other Charges', budget: 17500, spent: 478 },
      ]);
      setMessages([{ role: 'bot', text: `💰 Demo mode: Showing sample financial data.` }]);
    } else if (view === 'monthly') {
      setMetricsData([
        { measure: 'Fathers receiving workforce services', target: 200, q1: 0, q2: 0, q3: 49, q4: 0, ytd: 49 },
        { measure: 'Fathers employed ≥ 90 days', target: 150, q1: 0, q2: 0, q3: 20, q4: 0, ytd: 20 },
        { measure: 'Transportation assistance provided', target: 100, q1: 0, q2: 0, q3: 29, q4: 0, ytd: 29 },
      ]);
      setMonthlyData([
        { month: 'Jul', intakes: 12, graduations: 3, participants: 180 },
        { month: 'Aug', intakes: 18, graduations: 5, participants: 193 },
        { month: 'Sep', intakes: 15, graduations: 8, participants: 200 },
        { month: 'Oct', intakes: 22, graduations: 6, participants: 216 },
        { month: 'Nov', intakes: 19, graduations: 11, participants: 224 },
      ]);
      setMessages([{ role: 'bot', text: `📈 Demo mode: Showing sample monthly data.` }]);
    }
  };

  // AI Chat handler
  const handleSendMessage = async () => {
    if (!chatInput.trim() || isAiProcessing) return;
    const userMsg = chatInput;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatInput('');
    setIsAiProcessing(true);

    try {
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
      
      let context = '';
      if (subView === 'grants') {
        context = `Grant data: ${JSON.stringify(grantData.slice(0, 10))}`;
      } else if (subView === 'finance') {
        context = `Finance data: ${JSON.stringify(financeData)}`;
      } else if (subView === 'monthly') {
        context = `Metrics: ${JSON.stringify(metricsData)}, Monthly: ${JSON.stringify(monthlyData)}`;
      }

      const prompt = `You are the FOAM Administrative AI Assistant. You help analyze ${subView} data for Fathers On A Mission.

Current ${subView} data context:
${context}

User question: ${userMsg}

Provide a helpful, data-driven response. Be specific with numbers when available.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt
      });

      setMessages(prev => [...prev, { role: 'bot', text: response.text || "I couldn't process that request." }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', text: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsAiProcessing(false);
    }
  };

  // Chart colors
  const COLORS = ['#0F2C5C', '#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  // ===========================================
  // RENDER: Login Modal
  // ===========================================
  const renderLoginModal = () => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl p-10 max-w-md w-full mx-4 shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-[#0F2C5C] rounded-2xl flex items-center justify-center mx-auto">
            <i className="fas fa-shield-alt text-white text-2xl"></i>
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Admin Verification</h3>
            <p className="text-slate-500 text-sm mt-2">Enter your authorized @foamla.org email</p>
          </div>
          
          <div className="space-y-4">
            <input
              type="email"
              value={loginEmail}
              onChange={(e) => { setLoginEmail(e.target.value); setLoginError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="your.name@foamla.org"
              className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-center font-bold text-slate-700 focus:border-indigo-500 focus:bg-white outline-none transition-all"
            />
            
            {loginError && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-sm font-bold animate-in shake duration-300">
                <i className="fas fa-exclamation-circle mr-2"></i>
                {loginError}
              </div>
            )}
            
            <button
              onClick={handleLogin}
              className="w-full py-4 bg-[#0F2C5C] text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-slate-800 transition-all shadow-lg"
            >
              Verify & Access
            </button>
            
            <button
              onClick={() => { setShowLoginModal(false); setPendingView(null); setLoginError(''); setLoginEmail(''); }}
              className="w-full py-3 text-slate-400 font-bold text-sm hover:text-slate-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // ===========================================
  // RENDER: Landing Page
  // ===========================================
  const renderLanding = () => (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#0F2C5C] text-white rounded-2xl flex items-center justify-center">
            <i className="fas fa-user-shield text-xl"></i>
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-800 uppercase tracking-tight">FOAM Command</h1>
            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-[0.3em]">Administrative Access</p>
          </div>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
          <i className="fas fa-times text-xl"></i>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase">Admin Command</h2>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.4em] mt-2">Strategic Oversight & Operational Integrity</p>
        </div>

        {/* Three Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full">
          {/* Grant Management */}
          <button
            onClick={() => handleCardClick('grants')}
            className="group bg-white p-10 rounded-[3rem] shadow-lg hover:shadow-2xl transition-all relative overflow-hidden text-left border border-slate-100 hover:border-indigo-200"
          >
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-600 rounded-full opacity-5 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative z-10">
              <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <i className="fas fa-file-contract text-white text-xl"></i>
              </div>
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-2">Grant Management</h3>
              <p className="text-slate-500 text-sm font-medium leading-relaxed">Monitor grant compliance, award letters, performance benchmarks, and pipelines.</p>
              <div className="mt-6 flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest">
                <span>Access Logic Unit</span>
                <i className="fas fa-chevron-right group-hover:translate-x-2 transition-transform"></i>
              </div>
            </div>
          </button>

          {/* Financial Reporting */}
          <button
            onClick={() => handleCardClick('finance')}
            className="group bg-white p-10 rounded-[3rem] shadow-lg hover:shadow-2xl transition-all relative overflow-hidden text-left border border-slate-100 hover:border-emerald-200"
          >
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#1A4D2E] rounded-full opacity-5 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative z-10">
              <div className="w-14 h-14 bg-[#1A4D2E] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <i className="fas fa-chart-pie text-white text-xl"></i>
              </div>
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-2">Financial Reporting</h3>
              <p className="text-slate-500 text-sm font-medium leading-relaxed">High-level fiscal transparency, audit prep, and reconcile spending reports.</p>
              <div className="mt-6 flex items-center gap-2 text-[#1A4D2E] font-black text-[10px] uppercase tracking-widest">
                <span>Access Logic Unit</span>
                <i className="fas fa-chevron-right group-hover:translate-x-2 transition-transform"></i>
              </div>
            </div>
          </button>

          {/* Monthly Reports */}
          <button
            onClick={() => handleCardClick('monthly')}
            className="group bg-white p-10 rounded-[3rem] shadow-lg hover:shadow-2xl transition-all relative overflow-hidden text-left border border-slate-100 hover:border-amber-200"
          >
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-amber-500 rounded-full opacity-5 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative z-10">
              <div className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <i className="fas fa-calendar-check text-white text-xl"></i>
              </div>
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-2">Monthly Reports</h3>
              <p className="text-slate-500 text-sm font-medium leading-relaxed">Operational snapshots, caseload velocity, and metrics for the Board.</p>
              <div className="mt-6 flex items-center gap-2 text-amber-600 font-black text-[10px] uppercase tracking-widest">
                <span>Access Logic Unit</span>
                <i className="fas fa-chevron-right group-hover:translate-x-2 transition-transform"></i>
              </div>
            </div>
          </button>
        </div>

        {/* Back to Hub */}
        <button
          onClick={onClose}
          className="mt-12 px-8 py-4 bg-[#0F2C5C] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg flex items-center gap-3"
        >
          <i className="fas fa-th-large"></i>
          Back to Main Hub
        </button>
      </div>
    </div>
  );

  // ===========================================
  // RENDER: Dashboard Layout (shared)
  // ===========================================
  const renderDashboard = (
    title: string,
    color: string,
    content: React.ReactNode
  ) => (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Left Sidebar - Archives Registry */}
      <div className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#0F2C5C] text-white rounded-xl flex items-center justify-center">
              <i className="fas fa-user-shield"></i>
            </div>
            <div>
              <h1 className="text-sm font-black text-slate-800 uppercase">FOAM Command</h1>
              <p className="text-[8px] font-bold text-indigo-500 uppercase tracking-widest">Administrative Access</p>
            </div>
          </div>
        </div>

        <div className="p-4">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Archives Registry</p>
          
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-[#0F2C5C] text-white rounded-xl font-bold text-xs mb-2">
            <i className="fas fa-home"></i>
            Main Registry
          </button>
          
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl font-bold text-xs mb-2">
            <i className="fas fa-landmark"></i>
            Board & Governance
          </button>
          
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl font-bold text-xs mb-2">
            <i className="fas fa-users"></i>
            Personnel Files
          </button>
          
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl font-bold text-xs">
            <i className="fas fa-gavel"></i>
            Resolutions
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 border-t border-slate-100">
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-3">Recent Documents</p>
          {/* Document list placeholder */}
          <div className="space-y-2">
            {['GRANT_AWARD_NOTIFICATION', 'FOAM_BYLAWS_REVISED', 'GRANT_PERFORMANCE_METRICS', 'MONTHLY_OPERATIONAL_REPORT'].map((doc, i) => (
              <button key={i} className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl text-left group">
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600">
                  <i className="fas fa-file-alt text-xs"></i>
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-[10px] font-bold text-slate-600 truncate">{doc}</p>
                  <p className="text-[8px] text-slate-400">2025-0{i + 1}-{10 + i}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSubView('grants')}
              className={`px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest transition-all ${
                subView === 'grants' ? 'bg-[#0F2C5C] text-white' : 'text-slate-400 hover:bg-slate-100'
              }`}
            >
              Grants
            </button>
            <button
              onClick={() => setSubView('finance')}
              className={`px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest transition-all ${
                subView === 'finance' ? 'bg-[#0F2C5C] text-white' : 'text-slate-400 hover:bg-slate-100'
              }`}
            >
              Finance
            </button>
            <button
              onClick={() => setSubView('monthly')}
              className={`px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest transition-all ${
                subView === 'monthly' ? 'bg-[#0F2C5C] text-white' : 'text-slate-400 hover:bg-slate-100'
              }`}
            >
              Monthly
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <button onClick={() => setSubView('landing')} className="text-slate-400 hover:text-slate-600">
              <i className="fas fa-home"></i>
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <i className="fas fa-circle-notch fa-spin text-4xl text-indigo-600 mb-4"></i>
                <p className="text-slate-500 font-bold">Loading dashboard data...</p>
              </div>
            </div>
          ) : (
            content
          )}
        </div>
      </div>

      {/* Right Sidebar - AI Assistant */}
      <div className="w-80 bg-white border-l border-slate-200 flex flex-col">
        <div className="p-4 border-b border-slate-100">
          <button
            onClick={() => setSubView('landing')}
            className="w-full py-2.5 bg-[#0F2C5C] text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all mb-4"
          >
            <i className="fas fa-th-large mr-2"></i>
            Hub
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
              <i className="fas fa-robot text-xs"></i>
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest">Admin Assistant</p>
              <p className="text-[8px] font-bold text-indigo-500 uppercase">Protocol V4</p>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[90%] p-3 rounded-xl text-[11px] font-medium leading-relaxed ${
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
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-75"></div>
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-150"></div>
              </div>
            </div>
          )}
        </div>

        {/* Chat Input */}
        <div className="p-4 border-t border-slate-100">
          <div className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Admin Query..."
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-indigo-500"
            />
            <button
              onClick={handleSendMessage}
              disabled={isAiProcessing}
              className="w-10 h-10 bg-[#0F2C5C] text-white rounded-xl flex items-center justify-center hover:bg-slate-800 disabled:opacity-50"
            >
              <i className={`fas ${isAiProcessing ? 'fa-circle-notch fa-spin' : 'fa-paper-plane'} text-xs`}></i>
            </button>
          </div>
        </div>

        {/* Security Status */}
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                <i className="fas fa-shield-alt text-slate-400 text-xs"></i>
              </div>
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Security Standby</span>
            </div>
            {userEmail && (
              <button onClick={handleLogout} className="text-[8px] font-bold text-rose-500 hover:text-rose-700">
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // ===========================================
  // RENDER: Grant Management Dashboard
  // ===========================================
  const renderGrantsDashboard = () => {
    const activeGrants = grantData.filter(g => g.status === 'Approved').length;
    const totalAwarded = grantData.reduce((sum, g) => sum + (g.amountApproved || 0), 0);
    const totalRequested = grantData.reduce((sum, g) => sum + (g.amountRequested || 0), 0);
    const complianceRate = totalRequested > 0 ? Math.round((totalAwarded / totalRequested) * 100) : 0;
    
    // Find nearest renewal
    const upcomingDeadlines = grantData
      .filter(g => g.deadline)
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
    const nextRenewal = upcomingDeadlines[0];
    const daysToRenewal = nextRenewal 
      ? Math.ceil((new Date(nextRenewal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    // Chart data
    const chartData = grantData.slice(0, 5).map(g => ({
      name: g.source?.substring(0, 15) || g.name.substring(0, 15),
      allocated: g.amountRequested,
      used: g.amountApproved,
    }));

    return renderDashboard('Grants', 'indigo', (
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
                <i className="fas fa-file-contract text-indigo-600"></i>
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Grants</p>
                <p className="text-2xl font-black text-slate-800">{activeGrants}</p>
                <p className="text-[9px] font-bold text-indigo-500">FY 2025</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                <i className="fas fa-trophy text-amber-600"></i>
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Awarded</p>
                <p className="text-2xl font-black text-slate-800">${(totalAwarded / 1000).toFixed(0)}k</p>
                <p className="text-[9px] font-bold text-emerald-500">+12% vs LY</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                <i className="fas fa-check-circle text-emerald-600"></i>
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Compliance</p>
                <p className="text-2xl font-black text-slate-800">{complianceRate}%</p>
                <p className="text-[9px] font-bold text-emerald-500">Audit Ready</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center">
                <i className="fas fa-hourglass-half text-rose-600"></i>
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Renews In</p>
                <p className="text-2xl font-black text-slate-800">{daysToRenewal}d</p>
                <p className="text-[9px] font-bold text-rose-500">{nextRenewal?.name || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Chart and Action Items */}
        <div className="grid grid-cols-2 gap-6">
          {/* Bar Chart */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Funding Usage Analysis</p>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '1rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}
                  formatter={(value: number) => ['$' + value.toLocaleString()]}
                />
                <Bar dataKey="allocated" fill="#CBD5E1" radius={[8, 8, 0, 0]} name="Allocated" />
                <Bar dataKey="used" fill="#4F46E5" radius={[8, 8, 0, 0]} name="Used" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Action Items */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Action Items</p>
            <div className="space-y-3">
              {[
                { task: 'Submit Q1 LCTF Report', status: 'pending' },
                { task: 'Update Board Resolutions', status: 'pending' },
                { task: 'Audit Employee Manuals', status: 'pending' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <span className="text-sm font-bold text-slate-700">{item.task}</span>
                  <span className="text-[9px] font-black text-amber-600 uppercase">Pending</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    ));
  };

  // ===========================================
  // RENDER: Financial Dashboard
  // ===========================================
  const renderFinanceDashboard = () => {
    const totalBudget = financeData.reduce((sum, f) => sum + (f.budget || 0), 0);
    const totalSpent = financeData.reduce((sum, f) => sum + (f.spent || 0), 0);
    const burnRate = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

    // Pie chart data
    const pieData = financeData.map((f, i) => ({
      name: f.category,
      value: f.spent,
      color: COLORS[i % COLORS.length],
    }));

    return renderDashboard('Finance', 'emerald', (
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <i className="fas fa-cog text-blue-600"></i>
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Operating</p>
                <p className="text-2xl font-black text-slate-800">${Math.round(totalBudget / 1000)}k</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
                <i className="fas fa-users text-indigo-600"></i>
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Personnel</p>
                <p className="text-2xl font-black text-slate-800">${Math.round((financeData.find(f => f.category.includes('Salaries'))?.spent || 0) / 1000)}k</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                <i className="fas fa-piggy-bank text-emerald-600"></i>
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Reserve</p>
                <p className="text-2xl font-black text-slate-800">${Math.round((totalBudget - totalSpent) / 1000)}k</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center">
                <i className="fas fa-fire text-rose-600"></i>
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Burn Rate</p>
                <p className="text-2xl font-black text-slate-800">{burnRate}%</p>
                <p className="text-[9px] font-bold text-rose-500">/ mo</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Expenditure Allocation</p>
            <div className="flex items-center gap-8">
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => '$' + value.toLocaleString()} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {pieData.map((item, i) => (
                  <div key={i} className="flex items-center justify-between gap-8">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-xs font-bold text-slate-600">{item.name.substring(0, 15)}</span>
                    </div>
                    <span className="text-xs font-black text-slate-800">${(item.value / 1000).toFixed(0)}k</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Narrative */}
          <div className="bg-[#0F2C5C] p-6 rounded-2xl text-white relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 opacity-10">
              <i className="fas fa-chart-line text-[8rem]"></i>
            </div>
            <div className="relative z-10">
              <p className="text-[9px] font-black text-indigo-300 uppercase tracking-[0.3em] mb-4">Fiscal AI Narrative</p>
              <p className="text-sm font-medium leading-relaxed opacity-90 italic">
                "Revenue streams remain stable. Personnel costs are within 5% of variance for Q1 projections. Recommended Action: Expand workforce grant application pipeline for Q3."
              </p>
              <div className="mt-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                <span className="text-[9px] font-black uppercase tracking-widest">Strategy Engine Verified</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    ));
  };

  // ===========================================
  // RENDER: Monthly Reports Dashboard
  // ===========================================
  const renderMonthlyDashboard = () => {
    const latestMonth = monthlyData[monthlyData.length - 1] || { intakes: 0, graduations: 0, participants: 0 };
    const prevMonth = monthlyData[monthlyData.length - 2] || { intakes: 0, graduations: 0, participants: 0 };
    const intakeChange = prevMonth.intakes > 0 
      ? Math.round(((latestMonth.intakes - prevMonth.intakes) / prevMonth.intakes) * 100) 
      : 0;

    const totalParticipants = metricsData.find(m => m.measure.includes('workforce'))?.ytd || latestMonth.participants;
    const totalGrads = metricsData.find(m => m.measure.includes('employed'))?.ytd || latestMonth.graduations;
    const gradTarget = metricsData.find(m => m.measure.includes('employed'))?.target || 150;

    return renderDashboard('Monthly', 'amber', (
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
                <i className="fas fa-user-plus text-indigo-600"></i>
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Jan Intakes</p>
                <p className="text-2xl font-black text-slate-800">{latestMonth.intakes}</p>
                <p className={`text-[9px] font-bold ${intakeChange >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {intakeChange >= 0 ? '+' : ''}{intakeChange}% vs Dec
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                <i className="fas fa-users text-amber-600"></i>
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Participants</p>
                <p className="text-2xl font-black text-slate-800">{totalParticipants}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                <i className="fas fa-graduation-cap text-emerald-600"></i>
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Grads</p>
                <p className="text-2xl font-black text-slate-800">{totalGrads}</p>
                <p className="text-[9px] font-bold text-indigo-500">Proj: {gradTarget}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Area Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Operational Velocity</p>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="intakeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ borderRadius: '1rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="intakes" 
                stroke="#4F46E5" 
                strokeWidth={2}
                fill="url(#intakeGradient)" 
                name="Intakes"
              />
              <Area 
                type="monotone" 
                dataKey="graduations" 
                stroke="#10B981" 
                strokeWidth={2}
                strokeDasharray="5 5"
                fill="transparent" 
                name="Graduations"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    ));
  };

  // ===========================================
  // MAIN RENDER
  // ===========================================
  return (
    <>
      {showLoginModal && renderLoginModal()}
      
      {subView === 'landing' && renderLanding()}
      {subView === 'grants' && renderGrantsDashboard()}
      {subView === 'finance' && renderFinanceDashboard()}
      {subView === 'monthly' && renderMonthlyDashboard()}
    </>
  );
};

export default AdminPortal;
