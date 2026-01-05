import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  AreaChart, Area, CartesianGrid, Legend
} from 'recharts';
import GrantDashboard from './GrantDashboard';
import DocumentLibrary from './DocumentLibrary';

// ===========================================
// CONFIGURATION - EDIT AUTHORIZED USERS HERE
// ===========================================
const AUTHORIZED_ADMINS = [
  "sonny@foamla.org",
  "levar.robinson@foamla.org",
  "admin@foamla.org",
];

// Backend API URL
const API_BASE_URL = 'https://foamla-backend-2.onrender.com';

interface AdminPortalProps {
  onClose: () => void;
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
  // View states - includes 'documents'
  const [subView, setSubView] = useState<'landing' | 'grants' | 'finance' | 'monthly' | 'documents'>('landing');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingView, setPendingView] = useState<'grants' | 'finance' | 'monthly' | 'documents' | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Data states
  const [financeData, setFinanceData] = useState<FinanceData[]>([]);
  const [metricsData, setMetricsData] = useState<MetricsData[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);

  // AI Chat states
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([]);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedEmail = localStorage.getItem('foam_admin_email');
    if (savedEmail && AUTHORIZED_ADMINS.includes(savedEmail.toLowerCase())) {
      setUserEmail(savedEmail);
    }
  }, []);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleCardClick = (view: 'grants' | 'finance' | 'monthly' | 'documents') => {
    if (userEmail) {
      setSubView(view);
      if (view !== 'grants' && view !== 'documents') {
        loadDashboardData(view);
      }
    } else {
      setPendingView(view);
      setShowLoginModal(true);
    }
  };

  const handleLogin = () => {
    const email = loginEmail.trim().toLowerCase();
    if (!email.endsWith('@foamla.org')) {
      setLoginError('Please use your @foamla.org email address');
      return;
    }
    if (!AUTHORIZED_ADMINS.map(e => e.toLowerCase()).includes(email)) {
      setLoginError('Access denied. Your email is not authorized.');
      return;
    }
    localStorage.setItem('foam_admin_email', email);
    setUserEmail(email);
    setShowLoginModal(false);
    setLoginError('');
    setLoginEmail('');
    if (pendingView) {
      setSubView(pendingView);
      if (pendingView !== 'grants' && pendingView !== 'documents') {
        loadDashboardData(pendingView);
      }
      setPendingView(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('foam_admin_email');
    setUserEmail(null);
    setSubView('landing');
    setMessages([]);
  };

  const loadDashboardData = async (view: 'grants' | 'finance' | 'monthly') => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/${view}`, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        if (view === 'finance') {
          setFinanceData(data.finance || []);
          setMessages([{ role: 'bot', text: `💰 Financial data loaded.` }]);
        } else if (view === 'monthly') {
          setMetricsData(data.metrics || []);
          setMonthlyData(data.monthly || []);
          setMessages([{ role: 'bot', text: `📈 Monthly data loaded.` }]);
        }
      } else {
        loadDemoData(view);
      }
    } catch {
      loadDemoData(view);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDemoData = (view: 'grants' | 'finance' | 'monthly') => {
    if (view === 'finance') {
      setFinanceData([
        { category: 'Gross Salaries', budget: 71700, spent: 36995 },
        { category: 'Related Benefits', budget: 8782, spent: 11435 },
        { category: 'Operating Services', budget: 45505, spent: 14025 },
        { category: 'Professional Services', budget: 55600, spent: 37010 },
        { category: 'Other Charges', budget: 17500, spent: 478 },
      ]);
    } else if (view === 'monthly') {
      setMetricsData([
        { measure: 'Fathers receiving workforce services', target: 200, q1: 0, q2: 0, q3: 49, q4: 0, ytd: 49 },
        { measure: 'Fathers employed ≥ 90 days', target: 150, q1: 0, q2: 0, q3: 20, q4: 0, ytd: 20 },
      ]);
      setMonthlyData([
        { month: 'Jul', intakes: 12, graduations: 3, participants: 180 },
        { month: 'Aug', intakes: 18, graduations: 5, participants: 193 },
        { month: 'Sep', intakes: 15, graduations: 8, participants: 200 },
        { month: 'Oct', intakes: 22, graduations: 6, participants: 216 },
        { month: 'Nov', intakes: 19, graduations: 11, participants: 224 },
      ]);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isAiProcessing) return;
    const userMsg = chatInput;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatInput('');
    setIsAiProcessing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
      let context = '';
      if (subView === 'finance') context = `Finance: ${JSON.stringify(financeData)}`;
      else if (subView === 'monthly') context = `Metrics: ${JSON.stringify(metricsData)}`;
      const prompt = `You are FOAM Admin AI. Context: ${context}\nQuestion: ${userMsg}`;
      const response = await ai.models.generateContent({ model: 'gemini-2.0-flash', contents: prompt });
      setMessages(prev => [...prev, { role: 'bot', text: response.text || "Error" }]);
    } catch {
      setMessages(prev => [...prev, { role: 'bot', text: "Error processing request." }]);
    } finally {
      setIsAiProcessing(false);
    }
  };

  const COLORS = ['#0F2C5C', '#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  // Login Modal
  const renderLoginModal = () => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl p-10 max-w-md w-full mx-4 shadow-2xl">
        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-[#0F2C5C] rounded-2xl flex items-center justify-center mx-auto">
            <i className="fas fa-shield-alt text-white text-2xl"></i>
          </div>
          <h3 className="text-2xl font-black text-slate-800 uppercase">Admin Verification</h3>
          <input
            type="email"
            value={loginEmail}
            onChange={(e) => { setLoginEmail(e.target.value); setLoginError(''); }}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            placeholder="your.name@foamla.org"
            className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-center font-bold"
          />
          {loginError && <div className="p-4 bg-rose-50 text-rose-600 rounded-xl text-sm font-bold">{loginError}</div>}
          <button onClick={handleLogin} className="w-full py-4 bg-[#0F2C5C] text-white rounded-2xl font-black uppercase">
            Verify & Access
          </button>
          <button onClick={() => setShowLoginModal(false)} className="w-full py-3 text-slate-400 font-bold">Cancel</button>
        </div>
      </div>
    </div>
  );

  // Landing Page with 4 Cards
  const renderLanding = () => (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#0F2C5C] text-white rounded-2xl flex items-center justify-center">
            <i className="fas fa-user-shield text-xl"></i>
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-800 uppercase">FOAM Command</h1>
            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-[0.3em]">Administrative Access</p>
          </div>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><i className="fas fa-times text-xl"></i></button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-black text-slate-900 uppercase">Admin Command</h2>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.4em] mt-2">Strategic Oversight</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl w-full">
          {/* Grants */}
          <button onClick={() => handleCardClick('grants')} className="group bg-white p-8 rounded-[2rem] shadow-lg hover:shadow-2xl transition-all text-left border border-slate-100 hover:border-indigo-200">
            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <i className="fas fa-file-contract text-white text-lg"></i>
            </div>
            <h3 className="text-lg font-black text-slate-800 uppercase mb-2">Grants</h3>
            <p className="text-slate-500 text-xs">Monitor grants & pipelines.</p>
            <div className="mt-4 flex items-center gap-2 text-indigo-600 font-black text-[9px] uppercase">
              <span>Access</span><i className="fas fa-chevron-right"></i>
            </div>
          </button>

          {/* Finance */}
          <button onClick={() => handleCardClick('finance')} className="group bg-white p-8 rounded-[2rem] shadow-lg hover:shadow-2xl transition-all text-left border border-slate-100 hover:border-emerald-200">
            <div className="w-12 h-12 bg-[#1A4D2E] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <i className="fas fa-chart-pie text-white text-lg"></i>
            </div>
            <h3 className="text-lg font-black text-slate-800 uppercase mb-2">Finance</h3>
            <p className="text-slate-500 text-xs">Fiscal reports & audits.</p>
            <div className="mt-4 flex items-center gap-2 text-[#1A4D2E] font-black text-[9px] uppercase">
              <span>Access</span><i className="fas fa-chevron-right"></i>
            </div>
          </button>

          {/* Monthly */}
          <button onClick={() => handleCardClick('monthly')} className="group bg-white p-8 rounded-[2rem] shadow-lg hover:shadow-2xl transition-all text-left border border-slate-100 hover:border-amber-200">
            <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <i className="fas fa-calendar-check text-white text-lg"></i>
            </div>
            <h3 className="text-lg font-black text-slate-800 uppercase mb-2">Monthly</h3>
            <p className="text-slate-500 text-xs">Operations & Board metrics.</p>
            <div className="mt-4 flex items-center gap-2 text-amber-600 font-black text-[9px] uppercase">
              <span>Access</span><i className="fas fa-chevron-right"></i>
            </div>
          </button>

          {/* Documents - NEW */}
          <button onClick={() => handleCardClick('documents')} className="group bg-white p-8 rounded-[2rem] shadow-lg hover:shadow-2xl transition-all text-left border border-slate-100 hover:border-purple-200">
            <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <i className="fas fa-folder-open text-white text-lg"></i>
            </div>
            <h3 className="text-lg font-black text-slate-800 uppercase mb-2">Documents</h3>
            <p className="text-slate-500 text-xs">AI-powered file search.</p>
            <div className="mt-4 flex items-center gap-2 text-purple-600 font-black text-[9px] uppercase">
              <span>Access</span><i className="fas fa-chevron-right"></i>
            </div>
          </button>
        </div>

        <button onClick={onClose} className="mt-12 px-8 py-4 bg-[#0F2C5C] text-white rounded-2xl font-black text-xs uppercase flex items-center gap-3">
          <i className="fas fa-th-large"></i>Back to Hub
        </button>
      </div>
    </div>
  );

  // Grants Dashboard
  const renderGrantsDashboard = () => (
    <div className="min-h-screen bg-slate-950">
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button onClick={() => setSubView('landing')} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 text-sm">
            <i className="fas fa-arrow-left"></i>Back
          </button>
          <span className="text-amber-500 font-bold text-sm uppercase">Grant Management</span>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400"><i className="fas fa-times"></i></button>
      </div>
      <GrantDashboard />
    </div>
  );

  // Document Library
  const renderDocumentLibrary = () => (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button onClick={() => setSubView('landing')} className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 text-sm">
            <i className="fas fa-arrow-left"></i>Back
          </button>
          <span className="text-purple-600 font-bold text-sm uppercase">Document Library</span>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400"><i className="fas fa-times"></i></button>
      </div>
      <DocumentLibrary />
    </div>
  );

  // Finance Dashboard
  const renderFinanceDashboard = () => {
    const totalBudget = financeData.reduce((s, f) => s + f.budget, 0);
    const totalSpent = financeData.reduce((s, f) => s + f.spent, 0);
    const pieData = financeData.map((f, i) => ({ name: f.category, value: f.spent, color: COLORS[i] }));

    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setSubView('landing')} className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg text-slate-600 text-sm border">
            <i className="fas fa-arrow-left"></i>Back
          </button>
          <span className="text-emerald-600 font-bold uppercase">Financial Reports</span>
          <button onClick={onClose} className="p-2 text-slate-400"><i className="fas fa-times"></i></button>
        </div>
        
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-6 rounded-2xl border"><p className="text-[9px] font-black text-slate-400 uppercase">Budget</p><p className="text-2xl font-black">${Math.round(totalBudget/1000)}k</p></div>
          <div className="bg-white p-6 rounded-2xl border"><p className="text-[9px] font-black text-slate-400 uppercase">Spent</p><p className="text-2xl font-black text-emerald-600">${Math.round(totalSpent/1000)}k</p></div>
          <div className="bg-white p-6 rounded-2xl border"><p className="text-[9px] font-black text-slate-400 uppercase">Balance</p><p className="text-2xl font-black">${Math.round((totalBudget-totalSpent)/1000)}k</p></div>
          <div className="bg-white p-6 rounded-2xl border"><p className="text-[9px] font-black text-slate-400 uppercase">Burn</p><p className="text-2xl font-black text-rose-600">{Math.round(totalSpent/totalBudget*100)}%</p></div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border">
            <p className="text-[9px] font-black text-slate-400 uppercase mb-4">Spending by Category</p>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart><Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} dataKey="value">{pieData.map((e, i) => <Cell key={i} fill={e.color} />)}</Pie><Tooltip /></PieChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-[#0F2C5C] p-6 rounded-2xl text-white">
            <p className="text-[9px] font-black text-indigo-300 uppercase mb-4">AI Narrative</p>
            <p className="text-sm italic opacity-90">"Budget utilization at {Math.round(totalSpent/totalBudget*100)}%. Personnel costs largest category. Reserve funds healthy."</p>
          </div>
        </div>
      </div>
    );
  };

  // Monthly Dashboard
  const renderMonthlyDashboard = () => {
    const latest = monthlyData[monthlyData.length - 1] || { intakes: 0, graduations: 0, participants: 0 };
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setSubView('landing')} className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg text-slate-600 text-sm border">
            <i className="fas fa-arrow-left"></i>Back
          </button>
          <span className="text-amber-600 font-bold uppercase">Monthly Reports</span>
          <button onClick={onClose} className="p-2 text-slate-400"><i className="fas fa-times"></i></button>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-6 rounded-2xl border"><p className="text-[9px] font-black text-slate-400 uppercase">Intakes</p><p className="text-2xl font-black">{latest.intakes}</p></div>
          <div className="bg-white p-6 rounded-2xl border"><p className="text-[9px] font-black text-slate-400 uppercase">Participants</p><p className="text-2xl font-black">{latest.participants}</p></div>
          <div className="bg-white p-6 rounded-2xl border"><p className="text-[9px] font-black text-slate-400 uppercase">Grads</p><p className="text-2xl font-black text-emerald-600">{latest.graduations}</p></div>
        </div>

        <div className="bg-white p-6 rounded-2xl border">
          <p className="text-[9px] font-black text-slate-400 uppercase mb-4">Trend</p>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="intakes" stroke="#4F46E5" fill="#4F46E5" fillOpacity={0.1} />
              <Area type="monotone" dataKey="graduations" stroke="#10B981" fill="#10B981" fillOpacity={0.1} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  return (
    <>
      {showLoginModal && renderLoginModal()}
      {subView === 'landing' && renderLanding()}
      {subView === 'grants' && renderGrantsDashboard()}
      {subView === 'finance' && renderFinanceDashboard()}
      {subView === 'monthly' && renderMonthlyDashboard()}
      {subView === 'documents' && renderDocumentLibrary()}
    </>
  );
};

export default AdminPortal;
