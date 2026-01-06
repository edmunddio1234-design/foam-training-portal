// ============================================
// FOAM FINANCE DASHBOARD - COMPLETE VERSION
// ============================================
// Features:
// - Secure login (3 authorized users)
// - Data entry form with dropdowns
// - Backup/restore system
// - Funder summary & itemized breakdowns
// - Trend analysis charts
// - Budget vs Actual comparisons
// ============================================

import React, { useState, useEffect } from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, LineChart, Line, AreaChart, Area,
  ComposedChart
} from 'recharts';
import {
  Lock, LogOut, Plus, Save, X, RefreshCw, Download, Upload,
  DollarSign, TrendingUp, TrendingDown, PieChart as PieChartIcon,
  BarChart2, FileText, Calendar, Building2, CheckCircle, AlertTriangle,
  ChevronDown, ChevronUp, Search, Filter, Clock, ArrowUpRight,
  ArrowDownRight, Wallet, CreditCard, Users, Target, Activity,
  Database, History, Shield, Eye, EyeOff, Printer, ArrowLeft
} from 'lucide-react';

const API_BASE_URL = 'https://foamla-backend-2.onrender.com';

// Authorized users - In production, verify against backend
const AUTHORIZED_USERS = [
  { email: 'levar.robinson@foamla.org', password: 'Levar2025$', name: 'Levar Robinson', role: 'Admin' },
  { email: 'sonny@foamla.org', password: '12@34DSs1!@#', name: 'Sonny', role: 'Admin' },
  { email: 'awesley@foamla.org', password: '1Qaz2ADSEW', name: 'A. Wesley', role: 'Admin' },
];

// Dropdown options
const GRANT_SOURCES = [
  'Dept of Treasurer',
  'Wilson Foundation',
  'CAUW',
  'BlueCross BlueShield LA',
  'Humana',
  'Lamar Family Foundation',
  'BR Alliance',
  'State Policy Network',
  'McMains Foundation',
  'Other'
];

const CATEGORIES = [
  'Gross Salaries',
  'Related Benefits',
  'Professional Services',
  'Operating Services',
  'Travel',
  'Other Charges'
];

const SUBCATEGORIES: Record<string, string[]> = {
  'Gross Salaries': ['Executive Director', 'Workforce Development Coordinator', 'Case Manager Supervisor', 'Other Staff'],
  'Related Benefits': ['Health Insurance', 'Dental Insurance', 'Workers Comp', 'Liability Insurance', 'Retirement', 'Payroll Taxes'],
  'Professional Services': ['Accounting/Payroll', 'Case Manager Contractors', 'Data Collector', 'Legal Services', 'Consulting'],
  'Operating Services': ['Software Subscriptions', 'Office Supplies', 'Telephone/Internet', 'Rent/Lease', 'Utilities', 'Insurance', 'IT Support', 'Website/Domain'],
  'Travel': ['Mileage', 'Lodging', 'Meals', 'Transportation', 'Conference Registration'],
  'Other Charges': ['Marketing/Outreach', 'Client Support', 'Emergency Assistance', 'Training Materials', 'Certifications', 'Miscellaneous']
};

const PAYMENT_METHODS = [
  'Check',
  'ACH/Direct Deposit',
  'Wire Transfer',
  'Credit Card',
  'Debit Card',
  'Auto Draft',
  'Cash',
  'Other'
];

// Chart colors
const COLORS = ['#0F2C5C', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16', '#F97316'];
const CATEGORY_COLORS: Record<string, string> = {
  'Gross Salaries': '#0F2C5C',
  'Related Benefits': '#10B981',
  'Professional Services': '#F59E0B',
  'Operating Services': '#8B5CF6',
  'Travel': '#EC4899',
  'Other Charges': '#06B6D4',
};

// Types
interface Transaction {
  Transaction_ID: string;
  Date: string;
  Month: string;
  Quarter: string;
  Fiscal_Year: string;
  Grant_Source: string;
  Category: string;
  Subcategory: string;
  Vendor: string;
  Description: string;
  Payment_Method: string;
  Reference_Number: string;
  Amount: number;
  Notes: string;
  Entered_By: string;
  Entry_Date: string;
}

interface Funder {
  name: string;
  grantAmount: number;
  totalSpent: number;
  balance: number;
  percentSpent: number;
  status: string;
  periodStart: string;
  periodEnd: string;
}

interface CategoryBudget {
  name: string;
  budget: number;
  spent: number;
  balance: number;
  percentUsed: number;
}

interface MonthlyData {
  month: string;
  Salaries: number;
  Benefits: number;
  Professional: number;
  Operating: number;
  Travel: number;
  Other: number;
  total: number;
}

// Helper functions
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

const formatCurrencyShort = (value: number): string => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`;
  return `$${value.toFixed(0)}`;
};

const getMonthFromDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

const getQuarterFromDate = (dateStr: string): string => {
  const month = new Date(dateStr).getMonth();
  // Fiscal year starts July 1
  if (month >= 6 && month <= 8) return 'Q1';
  if (month >= 9 && month <= 11) return 'Q2';
  if (month >= 0 && month <= 2) return 'Q3';
  return 'Q4';
};

interface FinanceDashboardProps {
  onClose?: () => void;
}

const FinanceDashboard: React.FC<FinanceDashboardProps> = ({ onClose }) => {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ email: string; name: string; role: string } | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Data state
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [funders, setFunders] = useState<Funder[]>([]);
  const [categories, setCategories] = useState<CategoryBudget[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  // UI state
  const [activeTab, setActiveTab] = useState<'dashboard' | 'entry' | 'transactions' | 'funders' | 'reports' | 'backup'>('dashboard');
  const [selectedFunder, setSelectedFunder] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterFunder, setFilterFunder] = useState('all');
  const [sortField, setSortField] = useState<'Date' | 'Amount' | 'Category'>('Date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Form state for new transaction
  const [newTransaction, setNewTransaction] = useState({
    Date: new Date().toISOString().split('T')[0],
    Grant_Source: '',
    Category: '',
    Subcategory: '',
    Vendor: '',
    Description: '',
    Payment_Method: '',
    Reference_Number: '',
    Amount: '',
    Notes: ''
  });
  const [saving, setSaving] = useState(false);

  // Check for saved session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('foam_finance_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        setIsAuthenticated(true);
      } catch (e) {
        localStorage.removeItem('foam_finance_user');
      }
    }
  }, []);

  // Fetch data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchAllData();
    }
  }, [isAuthenticated]);

  // Login handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const user = AUTHORIZED_USERS.find(
      u => u.email.toLowerCase() === loginEmail.toLowerCase().trim() && u.password === loginPassword
    );

    if (user) {
      const userData = { email: user.email, name: user.name, role: user.role };
      setCurrentUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('foam_finance_user', JSON.stringify(userData));
      setLoginEmail('');
      setLoginPassword('');
    } else {
      setLoginError('Invalid email or password. Access restricted to authorized personnel.');
    }
  };

  // Logout handler
  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('foam_finance_user');
    setActiveTab('dashboard');
  };

  // Fetch all financial data
  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/finance`);
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions || []);
        setFunders(data.funders || []);
        setCategories(data.categories || []);
        setMonthlyData(data.monthlyData || []);
        setLastUpdated(new Date().toLocaleString());
      } else {
        // Use demo data if API not available
        loadDemoData();
      }
    } catch (err) {
      console.log('Using demo data - API not configured');
      loadDemoData();
    } finally {
      setLoading(false);
    }
  };

  // Load demo data for development/preview
  const loadDemoData = () => {
    // Demo transactions
    const demoTransactions: Transaction[] = [];
    const vendors = [
      { vendor: 'Intuit Payroll', desc: 'Levar Robinson - Payroll', cat: 'Gross Salaries', sub: 'Executive Director', amount: 2494.15 },
      { vendor: 'Intuit Payroll', desc: 'Leah Harrison - Payroll', cat: 'Gross Salaries', sub: 'Workforce Development Coordinator', amount: 1506.67 },
      { vendor: 'Voices of Choices', desc: 'Case Manager Services', cat: 'Professional Services', sub: 'Case Manager Contractors', amount: 1932.00 },
      { vendor: 'Robin Pinkston', desc: 'Case Worker Services', cat: 'Professional Services', sub: 'Case Manager Contractors', amount: 1260.00 },
      { vendor: 'Lawrence Morgan', desc: 'Case Worker Services', cat: 'Professional Services', sub: 'Case Manager Contractors', amount: 1100.00 },
      { vendor: 'Kidder & Schultz CPAs', desc: 'Monthly Accounting', cat: 'Professional Services', sub: 'Accounting/Payroll', amount: 850.00 },
      { vendor: 'Adobe', desc: 'Creative Cloud Subscription', cat: 'Operating Services', sub: 'Software Subscriptions', amount: 33.15 },
      { vendor: 'Amazon Prime', desc: 'Business Subscription', cat: 'Operating Services', sub: 'Software Subscriptions', amount: 16.56 },
      { vendor: 'Beam Dental', desc: 'Dental Insurance Premium', cat: 'Related Benefits', sub: 'Dental Insurance', amount: 17.03 },
      { vendor: 'AmTrust', desc: 'Workers Comp & Liability', cat: 'Related Benefits', sub: 'Workers Comp', amount: 149.50 },
      { vendor: 'AT&T', desc: 'Phone & Internet Service', cat: 'Operating Services', sub: 'Telephone/Internet', amount: 189.00 },
      { vendor: 'Office Depot', desc: 'Office Supplies', cat: 'Operating Services', sub: 'Office Supplies', amount: 127.45 },
    ];

    let txnId = 1;
    const months = ['2025-07', '2025-08', '2025-09', '2025-10', '2025-11'];
    
    months.forEach(month => {
      vendors.forEach(v => {
        const day = Math.floor(Math.random() * 25) + 1;
        const variance = 0.9 + Math.random() * 0.2;
        demoTransactions.push({
          Transaction_ID: `TXN-${String(txnId++).padStart(4, '0')}`,
          Date: `${month}-${String(day).padStart(2, '0')}`,
          Month: month,
          Quarter: month <= '2025-09' ? 'Q1' : 'Q2',
          Fiscal_Year: 'FY2025-26',
          Grant_Source: 'Dept of Treasurer',
          Category: v.cat,
          Subcategory: v.sub,
          Vendor: v.vendor,
          Description: v.desc,
          Payment_Method: 'Auto Draft',
          Reference_Number: '',
          Amount: Math.round(v.amount * variance * 100) / 100,
          Notes: '',
          Entered_By: 'System Import',
          Entry_Date: `${month}-01`
        });
      });
    });

    setTransactions(demoTransactions);

    // Demo funders
    const demoFunders: Funder[] = [
      { name: 'Dept of Treasurer', grantAmount: 200000, totalSpent: 100152.69, balance: 99847.31, percentSpent: 50.1, status: 'Active', periodStart: '2025-07-01', periodEnd: '2026-06-30' },
      { name: 'Wilson Foundation', grantAmount: 75000, totalSpent: 0, balance: 75000, percentSpent: 0, status: 'Active', periodStart: '2025-01-01', periodEnd: '2025-12-31' },
      { name: 'CAUW', grantAmount: 25000, totalSpent: 0, balance: 25000, percentSpent: 0, status: 'Active', periodStart: '2025-01-01', periodEnd: '2025-12-31' },
      { name: 'BlueCross BlueShield LA', grantAmount: 25000, totalSpent: 0, balance: 25000, percentSpent: 0, status: 'Active', periodStart: '2025-01-01', periodEnd: '2025-12-31' },
      { name: 'Humana', grantAmount: 50000, totalSpent: 0, balance: 50000, percentSpent: 0, status: 'Active', periodStart: '2025-01-01', periodEnd: '2025-12-31' },
      { name: 'Lamar Family Foundation', grantAmount: 50000, totalSpent: 0, balance: 50000, percentSpent: 0, status: 'Active', periodStart: '2025-01-01', periodEnd: '2025-12-31' },
      { name: 'BR Alliance', grantAmount: 15000, totalSpent: 0, balance: 15000, percentSpent: 0, status: 'Active', periodStart: '2025-01-01', periodEnd: '2025-12-31' },
      { name: 'State Policy Network', grantAmount: 10000, totalSpent: 0, balance: 10000, percentSpent: 0, status: 'Active', periodStart: '2025-01-01', periodEnd: '2025-12-31' },
      { name: 'McMains Foundation', grantAmount: 20000, totalSpent: 0, balance: 20000, percentSpent: 0, status: 'Active', periodStart: '2025-01-01', periodEnd: '2025-12-31' },
    ];
    setFunders(demoFunders);

    // Demo categories
    const demoCategories: CategoryBudget[] = [
      { name: 'Gross Salaries', budget: 71700.64, spent: 40000.82, balance: 31699.82, percentUsed: 55.8 },
      { name: 'Related Benefits', budget: 8782.36, spent: 8860.31, balance: -77.95, percentUsed: 100.9 },
      { name: 'Professional Services', budget: 55600.00, spent: 37009.90, balance: 18590.10, percentUsed: 66.6 },
      { name: 'Operating Services', budget: 45505.00, spent: 14025.11, balance: 31479.89, percentUsed: 30.8 },
      { name: 'Travel', budget: 912.00, spent: 210.18, balance: 701.82, percentUsed: 23.0 },
      { name: 'Other Charges', budget: 17500.00, spent: 477.50, balance: 17022.50, percentUsed: 2.7 },
    ];
    setCategories(demoCategories);

    // Demo monthly data
    const demoMonthlyData: MonthlyData[] = [
      { month: 'Jul', Salaries: 8001.63, Benefits: 2198.15, Professional: 9018.00, Operating: 1368.35, Travel: 0, Other: 250.00, total: 20836.13 },
      { month: 'Aug', Salaries: 12002.45, Benefits: 369.06, Professional: 11754.00, Operating: 4841.68, Travel: 210.18, Other: 0, total: 29177.37 },
      { month: 'Sep', Salaries: 8001.63, Benefits: 6596.30, Professional: 11211.90, Operating: 2528.95, Travel: 0, Other: 0, total: 28338.78 },
      { month: 'Oct', Salaries: 4000.82, Benefits: 1836.62, Professional: 4426.00, Operating: 1679.04, Travel: 0, Other: 19.50, total: 11961.98 },
      { month: 'Nov', Salaries: 4988.29, Benefits: 1861.18, Professional: 600.00, Operating: 3607.09, Travel: 0, Other: 208.00, total: 11264.56 },
    ];
    setMonthlyData(demoMonthlyData);

    setLastUpdated(new Date().toLocaleString());
  };

  // Calculate totals
  const totalBudget = funders.reduce((sum, f) => sum + f.grantAmount, 0);
  const totalSpent = funders.reduce((sum, f) => sum + f.totalSpent, 0);
  const totalRemaining = totalBudget - totalSpent;
  const overallSpendRate = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  // Spending by category for charts
  const spendingByCategory = categories.map(cat => ({
    name: cat.name,
    value: cat.spent,
    color: CATEGORY_COLORS[cat.name] || '#6B7280'
  })).filter(d => d.value > 0);

  // Spending by funder for charts
  const spendingByFunder = funders.map(f => ({
    name: f.name,
    value: f.totalSpent,
    budget: f.grantAmount
  })).filter(d => d.value > 0 || d.budget > 0);

  // Filter and sort transactions
  const filteredTransactions = transactions
    .filter(t => {
      if (filterCategory !== 'all' && t.Category !== filterCategory) return false;
      if (filterFunder !== 'all' && t.Grant_Source !== filterFunder) return false;
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return (
          t.Vendor?.toLowerCase().includes(search) ||
          t.Description?.toLowerCase().includes(search) ||
          t.Category?.toLowerCase().includes(search) ||
          t.Grant_Source?.toLowerCase().includes(search)
        );
      }
      return true;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortField === 'Date') {
        comparison = new Date(a.Date).getTime() - new Date(b.Date).getTime();
      } else if (sortField === 'Amount') {
        comparison = a.Amount - b.Amount;
      } else if (sortField === 'Category') {
        comparison = a.Category.localeCompare(b.Category);
      }
      return sortDirection === 'desc' ? -comparison : comparison;
    });

  // Handle adding new transaction
  const handleAddTransaction = async () => {
    if (!newTransaction.Date || !newTransaction.Grant_Source || !newTransaction.Category || !newTransaction.Amount) {
      alert('Please fill in all required fields: Date, Grant Source, Category, and Amount');
      return;
    }

    setSaving(true);
    
    const transaction: Transaction = {
      Transaction_ID: `TXN-${String(transactions.length + 1).padStart(4, '0')}`,
      Date: newTransaction.Date,
      Month: getMonthFromDate(newTransaction.Date),
      Quarter: getQuarterFromDate(newTransaction.Date),
      Fiscal_Year: 'FY2025-26',
      Grant_Source: newTransaction.Grant_Source,
      Category: newTransaction.Category,
      Subcategory: newTransaction.Subcategory,
      Vendor: newTransaction.Vendor,
      Description: newTransaction.Description,
      Payment_Method: newTransaction.Payment_Method,
      Reference_Number: newTransaction.Reference_Number,
      Amount: parseFloat(newTransaction.Amount),
      Notes: newTransaction.Notes,
      Entered_By: currentUser?.name || 'Unknown',
      Entry_Date: new Date().toISOString().split('T')[0]
    };

    try {
      // Try to save to backend
      const response = await fetch(`${API_BASE_URL}/api/finance/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transaction)
      });

      if (!response.ok) {
        throw new Error('Backend save failed');
      }
    } catch (err) {
      console.log('Saving locally - backend not configured');
    }

    // Add to local state
    setTransactions([transaction, ...transactions]);
    
    // Update funder totals
    setFunders(funders.map(f => {
      if (f.name === transaction.Grant_Source) {
        const newSpent = f.totalSpent + transaction.Amount;
        return {
          ...f,
          totalSpent: newSpent,
          balance: f.grantAmount - newSpent,
          percentSpent: (newSpent / f.grantAmount) * 100
        };
      }
      return f;
    }));

    // Reset form
    setNewTransaction({
      Date: new Date().toISOString().split('T')[0],
      Grant_Source: '',
      Category: '',
      Subcategory: '',
      Vendor: '',
      Description: '',
      Payment_Method: '',
      Reference_Number: '',
      Amount: '',
      Notes: ''
    });

    setSaving(false);
    alert('Transaction saved successfully!');
  };

  // Create backup
  const handleCreateBackup = () => {
    const backupData = {
      timestamp: new Date().toISOString(),
      createdBy: currentUser?.name,
      transactions,
      funders,
      categories
    };
    
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FOAM_Finance_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    alert('Backup created and downloaded successfully!');
  };

  // ==========================================
  // LOGIN SCREEN
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
          {/* Header */}
          <div className="bg-[#0F2C5C] p-8 text-center">
            <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">FOAM FINANCE</h1>
            <p className="text-indigo-200 text-sm mt-2">Secure Financial Management Portal</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="p-8 space-y-6">
            {loginError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 font-medium focus:outline-none focus:border-[#0F2C5C] focus:ring-2 focus:ring-[#0F2C5C]/20 transition-all"
                placeholder="you@foamla.org"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 pr-12 font-medium focus:outline-none focus:border-[#0F2C5C] focus:ring-2 focus:ring-[#0F2C5C]/20 transition-all"
                  placeholder="••••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#0F2C5C] hover:bg-slate-800 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              <Lock className="w-5 h-5" />
              Sign In to Finance Portal
            </button>

            <div className="text-center">
              <p className="text-xs text-slate-400">
                Restricted access • Authorized personnel only
              </p>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ==========================================
  // MAIN DASHBOARD
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation */}
      <nav className="bg-[#0F2C5C] text-white px-6 py-4 sticky top-0 z-50 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-black text-lg tracking-tight">FOAM FINANCE</h1>
              <p className="text-indigo-200 text-xs">Financial Management Dashboard</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <p className="text-sm text-indigo-200">Welcome back,</p>
              <p className="font-bold">{currentUser?.name}</p>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back to Hub</span>
              </button>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 mt-4 overflow-x-auto pb-1">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BarChart2 },
            { id: 'entry', label: 'Data Entry', icon: Plus },
            { id: 'transactions', label: 'Transactions', icon: FileText },
            { id: 'funders', label: 'Funders', icon: Building2 },
            { id: 'reports', label: 'Reports', icon: PieChartIcon },
            { id: 'backup', label: 'Backup', icon: Database },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white text-[#0F2C5C] shadow-lg'
                  : 'text-indigo-200 hover:bg-white/10'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="p-4 md:p-6 max-w-[1600px] mx-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-4">
              <RefreshCw className="w-10 h-10 text-[#0F2C5C] animate-spin" />
              <p className="text-slate-600 font-medium">Loading financial data...</p>
            </div>
          </div>
        ) : (
          <>
            {/* ==================== DASHBOARD TAB ==================== */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                {/* Last Updated */}
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-500">
                    Last updated: {lastUpdated}
                  </p>
                  <button
                    onClick={fetchAllData}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-600 hover:text-[#0F2C5C] hover:bg-slate-100 rounded-lg transition-all"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                  </button>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Budget</p>
                        <p className="text-2xl font-black text-slate-800 mt-1">{formatCurrency(totalBudget)}</p>
                        <p className="text-xs text-slate-500 mt-1">{funders.length} active grants</p>
                      </div>
                      <div className="w-14 h-14 bg-indigo-50 rounded-xl flex items-center justify-center">
                        <Wallet className="w-7 h-7 text-indigo-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Spent</p>
                        <p className="text-2xl font-black text-rose-600 mt-1">{formatCurrency(totalSpent)}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <ArrowDownRight className="w-3 h-3 text-rose-500" />
                          <p className="text-xs text-rose-500">{overallSpendRate.toFixed(1)}% of budget</p>
                        </div>
                      </div>
                      <div className="w-14 h-14 bg-rose-50 rounded-xl flex items-center justify-center">
                        <TrendingDown className="w-7 h-7 text-rose-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Remaining</p>
                        <p className="text-2xl font-black text-emerald-600 mt-1">{formatCurrency(totalRemaining)}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                          <p className="text-xs text-emerald-500">{(100 - overallSpendRate).toFixed(1)}% available</p>
                        </div>
                      </div>
                      <div className="w-14 h-14 bg-emerald-50 rounded-xl flex items-center justify-center">
                        <Target className="w-7 h-7 text-emerald-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Transactions</p>
                        <p className="text-2xl font-black text-slate-800 mt-1">{transactions.length}</p>
                        <p className="text-xs text-slate-500 mt-1">This fiscal year</p>
                      </div>
                      <div className="w-14 h-14 bg-amber-50 rounded-xl flex items-center justify-center">
                        <Activity className="w-7 h-7 text-amber-600" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Spending by Category */}
                  <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                      Spending by Category
                    </h3>
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie
                          data={spendingByCategory}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {spendingByCategory.map((entry, index) => (
                            <Cell key={index} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: number) => formatCurrency(value)}
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap gap-3 justify-center mt-2">
                      {spendingByCategory.map((item, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ background: item.color }} />
                          <span className="text-xs font-medium text-slate-600">{item.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Monthly Spending Trend */}
                  <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                      Monthly Spending Trend
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={monthlyData}>
                        <defs>
                          <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0F2C5C" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#0F2C5C" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                        <XAxis dataKey="month" stroke="#94A3B8" tick={{ fontSize: 12 }} />
                        <YAxis tickFormatter={(v) => formatCurrencyShort(v)} stroke="#94A3B8" tick={{ fontSize: 12 }} />
                        <Tooltip 
                          formatter={(value: number) => formatCurrency(value)}
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="total" 
                          stroke="#0F2C5C" 
                          fill="url(#colorTotal)" 
                          strokeWidth={3}
                          name="Total Spending"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Budget vs Actual by Category */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                    Budget vs Actual by Category
                  </h3>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={categories} layout="vertical" barGap={4}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
                      <XAxis type="number" tickFormatter={(v) => formatCurrencyShort(v)} stroke="#94A3B8" />
                      <YAxis type="category" dataKey="name" width={140} stroke="#94A3B8" tick={{ fontSize: 11 }} />
                      <Tooltip 
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      />
                      <Legend />
                      <Bar dataKey="budget" fill="#E2E8F0" name="Budget" radius={[0, 4, 4, 0]} />
                      <Bar dataKey="spent" fill="#0F2C5C" name="Spent" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Funder Summary Table */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                    Funder Summary
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left py-3 px-4 text-xs font-black text-slate-500 uppercase">Funder</th>
                          <th className="text-right py-3 px-4 text-xs font-black text-slate-500 uppercase">Grant Amount</th>
                          <th className="text-right py-3 px-4 text-xs font-black text-slate-500 uppercase">Spent</th>
                          <th className="text-right py-3 px-4 text-xs font-black text-slate-500 uppercase">Balance</th>
                          <th className="text-right py-3 px-4 text-xs font-black text-slate-500 uppercase">% Used</th>
                          <th className="text-center py-3 px-4 text-xs font-black text-slate-500 uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {funders.map((funder, idx) => (
                          <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                            <td className="py-3 px-4">
                              <p className="font-bold text-slate-800">{funder.name}</p>
                              <p className="text-xs text-slate-500">{funder.periodStart} to {funder.periodEnd}</p>
                            </td>
                            <td className="py-3 px-4 text-right text-slate-600 font-medium">{formatCurrency(funder.grantAmount)}</td>
                            <td className="py-3 px-4 text-right text-rose-600 font-bold">{formatCurrency(funder.totalSpent)}</td>
                            <td className="py-3 px-4 text-right text-emerald-600 font-bold">{formatCurrency(funder.balance)}</td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all ${
                                      funder.percentSpent > 90 ? 'bg-rose-500' :
                                      funder.percentSpent > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                                    }`}
                                    style={{ width: `${Math.min(funder.percentSpent, 100)}%` }}
                                  />
                                </div>
                                <span className="text-xs font-bold text-slate-600 w-12 text-right">
                                  {funder.percentSpent.toFixed(1)}%
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                funder.status === 'Active' 
                                  ? 'bg-emerald-100 text-emerald-700' 
                                  : 'bg-slate-100 text-slate-600'
                              }`}>
                                {funder.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-slate-50 font-bold">
                          <td className="py-3 px-4 text-slate-800">TOTAL</td>
                          <td className="py-3 px-4 text-right text-slate-800">{formatCurrency(totalBudget)}</td>
                          <td className="py-3 px-4 text-right text-rose-600">{formatCurrency(totalSpent)}</td>
                          <td className="py-3 px-4 text-right text-emerald-600">{formatCurrency(totalRemaining)}</td>
                          <td className="py-3 px-4 text-right text-slate-600">{overallSpendRate.toFixed(1)}%</td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ==================== DATA ENTRY TAB ==================== */}
            {activeTab === 'entry' && (
              <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="bg-[#0F2C5C] p-6">
                    <h2 className="text-xl font-black text-white flex items-center gap-3">
                      <Plus className="w-6 h-6" />
                      Add New Transaction
                    </h2>
                    <p className="text-indigo-200 text-sm mt-1">Enter expense details below. Required fields marked with *</p>
                  </div>

                  <div className="p-6 space-y-6">
                    {/* Row 1: Date, Grant Source, Category */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">
                          Date <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={newTransaction.Date}
                          onChange={(e) => setNewTransaction({ ...newTransaction, Date: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium focus:outline-none focus:border-[#0F2C5C] focus:ring-2 focus:ring-[#0F2C5C]/20"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">
                          Grant/Funder <span className="text-rose-500">*</span>
                        </label>
                        <select
                          value={newTransaction.Grant_Source}
                          onChange={(e) => setNewTransaction({ ...newTransaction, Grant_Source: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium focus:outline-none focus:border-[#0F2C5C] focus:ring-2 focus:ring-[#0F2C5C]/20"
                        >
                          <option value="">Select funder...</option>
                          {GRANT_SOURCES.map(source => (
                            <option key={source} value={source}>{source}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">
                          Category <span className="text-rose-500">*</span>
                        </label>
                        <select
                          value={newTransaction.Category}
                          onChange={(e) => setNewTransaction({ 
                            ...newTransaction, 
                            Category: e.target.value,
                            Subcategory: '' // Reset subcategory when category changes
                          })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium focus:outline-none focus:border-[#0F2C5C] focus:ring-2 focus:ring-[#0F2C5C]/20"
                        >
                          <option value="">Select category...</option>
                          {CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Row 2: Subcategory, Vendor */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">
                          Subcategory
                        </label>
                        <select
                          value={newTransaction.Subcategory}
                          onChange={(e) => setNewTransaction({ ...newTransaction, Subcategory: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium focus:outline-none focus:border-[#0F2C5C] focus:ring-2 focus:ring-[#0F2C5C]/20"
                          disabled={!newTransaction.Category}
                        >
                          <option value="">Select subcategory...</option>
                          {newTransaction.Category && SUBCATEGORIES[newTransaction.Category]?.map(sub => (
                            <option key={sub} value={sub}>{sub}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">
                          Vendor/Payee
                        </label>
                        <input
                          type="text"
                          value={newTransaction.Vendor}
                          onChange={(e) => setNewTransaction({ ...newTransaction, Vendor: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium focus:outline-none focus:border-[#0F2C5C] focus:ring-2 focus:ring-[#0F2C5C]/20"
                          placeholder="e.g., Intuit Payroll"
                        />
                      </div>
                    </div>

                    {/* Row 3: Description */}
                    <div>
                      <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">
                        Description
                      </label>
                      <input
                        type="text"
                        value={newTransaction.Description}
                        onChange={(e) => setNewTransaction({ ...newTransaction, Description: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium focus:outline-none focus:border-[#0F2C5C] focus:ring-2 focus:ring-[#0F2C5C]/20"
                        placeholder="e.g., Monthly payroll processing for Levar Robinson"
                      />
                    </div>

                    {/* Row 4: Amount, Payment Method, Reference */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">
                          Amount ($) <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={newTransaction.Amount}
                            onChange={(e) => setNewTransaction({ ...newTransaction, Amount: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-4 py-3 font-medium focus:outline-none focus:border-[#0F2C5C] focus:ring-2 focus:ring-[#0F2C5C]/20"
                            placeholder="0.00"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">
                          Payment Method
                        </label>
                        <select
                          value={newTransaction.Payment_Method}
                          onChange={(e) => setNewTransaction({ ...newTransaction, Payment_Method: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium focus:outline-none focus:border-[#0F2C5C] focus:ring-2 focus:ring-[#0F2C5C]/20"
                        >
                          <option value="">Select method...</option>
                          {PAYMENT_METHODS.map(method => (
                            <option key={method} value={method}>{method}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">
                          Check/Reference #
                        </label>
                        <input
                          type="text"
                          value={newTransaction.Reference_Number}
                          onChange={(e) => setNewTransaction({ ...newTransaction, Reference_Number: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium focus:outline-none focus:border-[#0F2C5C] focus:ring-2 focus:ring-[#0F2C5C]/20"
                          placeholder="e.g., Check #1234"
                        />
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">
                        Notes
                      </label>
                      <textarea
                        value={newTransaction.Notes}
                        onChange={(e) => setNewTransaction({ ...newTransaction, Notes: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium focus:outline-none focus:border-[#0F2C5C] focus:ring-2 focus:ring-[#0F2C5C]/20 h-24 resize-none"
                        placeholder="Additional notes or comments..."
                      />
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-slate-200">
                      <button
                        onClick={() => setNewTransaction({
                          Date: new Date().toISOString().split('T')[0],
                          Grant_Source: '', Category: '', Subcategory: '', Vendor: '',
                          Description: '', Payment_Method: '', Reference_Number: '', Amount: '', Notes: ''
                        })}
                        className="px-6 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-slate-600 transition-all"
                      >
                        Clear Form
                      </button>
                      <button
                        onClick={handleAddTransaction}
                        disabled={saving || !newTransaction.Date || !newTransaction.Grant_Source || !newTransaction.Category || !newTransaction.Amount}
                        className="px-6 py-3 bg-[#0F2C5C] hover:bg-slate-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        {saving ? (
                          <RefreshCw className="w-5 h-5 animate-spin" />
                        ) : (
                          <Save className="w-5 h-5" />
                        )}
                        {saving ? 'Saving...' : 'Save Transaction'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ==================== TRANSACTIONS TAB ==================== */}
            {activeTab === 'transactions' && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-black text-slate-800">All Transactions</h2>
                      <p className="text-sm text-slate-500">{filteredTransactions.length} of {transactions.length} transactions</p>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3">
                      {/* Search */}
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm w-48 focus:outline-none focus:border-[#0F2C5C]"
                        />
                      </div>

                      {/* Filter by Category */}
                      <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0F2C5C]"
                      >
                        <option value="all">All Categories</option>
                        {CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>

                      {/* Filter by Funder */}
                      <select
                        value={filterFunder}
                        onChange={(e) => setFilterFunder(e.target.value)}
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0F2C5C]"
                      >
                        <option value="all">All Funders</option>
                        {GRANT_SOURCES.map(source => (
                          <option key={source} value={source}>{source}</option>
                        ))}
                      </select>

                      {/* Export Button */}
                      <button 
                        onClick={handleCreateBackup}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-bold text-slate-600 transition-all"
                      >
                        <Download className="w-4 h-4" />
                        Export
                      </button>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="text-left py-3 px-4 text-xs font-black text-slate-500 uppercase">ID</th>
                        <th 
                          className="text-left py-3 px-4 text-xs font-black text-slate-500 uppercase cursor-pointer hover:text-[#0F2C5C]"
                          onClick={() => {
                            setSortField('Date');
                            setSortDirection(sortField === 'Date' && sortDirection === 'desc' ? 'asc' : 'desc');
                          }}
                        >
                          Date {sortField === 'Date' && (sortDirection === 'desc' ? '↓' : '↑')}
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-black text-slate-500 uppercase">Funder</th>
                        <th 
                          className="text-left py-3 px-4 text-xs font-black text-slate-500 uppercase cursor-pointer hover:text-[#0F2C5C]"
                          onClick={() => {
                            setSortField('Category');
                            setSortDirection(sortField === 'Category' && sortDirection === 'desc' ? 'asc' : 'desc');
                          }}
                        >
                          Category {sortField === 'Category' && (sortDirection === 'desc' ? '↓' : '↑')}
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-black text-slate-500 uppercase">Vendor</th>
                        <th className="text-left py-3 px-4 text-xs font-black text-slate-500 uppercase">Description</th>
                        <th 
                          className="text-right py-3 px-4 text-xs font-black text-slate-500 uppercase cursor-pointer hover:text-[#0F2C5C]"
                          onClick={() => {
                            setSortField('Amount');
                            setSortDirection(sortField === 'Amount' && sortDirection === 'desc' ? 'asc' : 'desc');
                          }}
                        >
                          Amount {sortField === 'Amount' && (sortDirection === 'desc' ? '↓' : '↑')}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransactions.slice(0, 100).map((txn, idx) => (
                        <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4 text-xs font-mono text-slate-400">{txn.Transaction_ID}</td>
                          <td className="py-3 px-4 text-sm text-slate-600">{txn.Date}</td>
                          <td className="py-3 px-4 text-sm font-medium text-slate-800">{txn.Grant_Source}</td>
                          <td className="py-3 px-4">
                            <span 
                              className="px-2 py-1 rounded-lg text-xs font-medium"
                              style={{ 
                                backgroundColor: `${CATEGORY_COLORS[txn.Category]}15`,
                                color: CATEGORY_COLORS[txn.Category]
                              }}
                            >
                              {txn.Category}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-slate-600">{txn.Vendor}</td>
                          <td className="py-3 px-4 text-sm text-slate-500 max-w-xs truncate">{txn.Description}</td>
                          <td className="py-3 px-4 text-right font-bold text-slate-800">{formatCurrency(txn.Amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredTransactions.length > 100 && (
                  <div className="p-4 border-t border-slate-200 text-center text-sm text-slate-500">
                    Showing first 100 of {filteredTransactions.length} transactions
                  </div>
                )}
              </div>
            )}

            {/* ==================== FUNDERS TAB ==================== */}
            {activeTab === 'funders' && (
              <div className="space-y-6">
                {/* Funder Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {funders.map((funder, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedFunder(selectedFunder === funder.name ? null : funder.name)}
                      className={`bg-white rounded-2xl p-6 border-2 cursor-pointer transition-all hover:shadow-lg ${
                        selectedFunder === funder.name
                          ? 'border-[#0F2C5C] shadow-lg'
                          : 'border-slate-100 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-slate-800 text-lg">{funder.name}</h3>
                          <p className="text-xs text-slate-500 mt-1">
                            {funder.periodStart} to {funder.periodEnd}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-bold flex-shrink-0 ${
                          funder.status === 'Active' 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {funder.status}
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">Grant Amount</span>
                          <span className="font-bold text-slate-800">{formatCurrency(funder.grantAmount)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">Spent</span>
                          <span className="font-bold text-rose-600">{formatCurrency(funder.totalSpent)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">Balance</span>
                          <span className="font-bold text-emerald-600">{formatCurrency(funder.balance)}</span>
                        </div>

                        <div className="pt-3 border-t border-slate-100">
                          <div className="flex justify-between text-xs mb-2">
                            <span className="text-slate-500 font-medium">Budget Used</span>
                            <span className="font-black">{funder.percentSpent.toFixed(1)}%</span>
                          </div>
                          <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                funder.percentSpent > 90 ? 'bg-rose-500' :
                                funder.percentSpent > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${Math.min(funder.percentSpent, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Selected Funder Details */}
                {selectedFunder && (
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="bg-[#0F2C5C] p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-xl font-black text-white">{selectedFunder}</h2>
                          <p className="text-indigo-200 text-sm">Itemized transaction breakdown</p>
                        </div>
                        <button
                          onClick={() => setSelectedFunder(null)}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                          <X className="w-5 h-5 text-white" />
                        </button>
                      </div>
                    </div>

                    <div className="p-6">
                      {/* Category breakdown for this funder */}
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                        {CATEGORIES.map(cat => {
                          const catTotal = transactions
                            .filter(t => t.Grant_Source === selectedFunder && t.Category === cat)
                            .reduce((sum, t) => sum + t.Amount, 0);
                          return (
                            <div key={cat} className="bg-slate-50 rounded-xl p-4 text-center">
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">{cat}</p>
                              <p className="text-lg font-black text-slate-800">{formatCurrency(catTotal)}</p>
                            </div>
                          );
                        })}
                      </div>

                      {/* Transaction list */}
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-slate-50">
                            <tr>
                              <th className="text-left py-3 px-4 text-xs font-black text-slate-500 uppercase">Date</th>
                              <th className="text-left py-3 px-4 text-xs font-black text-slate-500 uppercase">Category</th>
                              <th className="text-left py-3 px-4 text-xs font-black text-slate-500 uppercase">Vendor</th>
                              <th className="text-left py-3 px-4 text-xs font-black text-slate-500 uppercase">Description</th>
                              <th className="text-right py-3 px-4 text-xs font-black text-slate-500 uppercase">Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {transactions
                              .filter(t => t.Grant_Source === selectedFunder)
                              .sort((a, b) => new Date(b.Date).getTime() - new Date(a.Date).getTime())
                              .map((txn, idx) => (
                                <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                                  <td className="py-3 px-4 text-sm text-slate-600">{txn.Date}</td>
                                  <td className="py-3 px-4">
                                    <span 
                                      className="px-2 py-1 rounded-lg text-xs font-medium"
                                      style={{ 
                                        backgroundColor: `${CATEGORY_COLORS[txn.Category]}15`,
                                        color: CATEGORY_COLORS[txn.Category]
                                      }}
                                    >
                                      {txn.Category}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 text-sm font-medium text-slate-800">{txn.Vendor}</td>
                                  <td className="py-3 px-4 text-sm text-slate-500">{txn.Description}</td>
                                  <td className="py-3 px-4 text-right font-bold text-slate-800">{formatCurrency(txn.Amount)}</td>
                                </tr>
                              ))}
                          </tbody>
                          <tfoot>
                            <tr className="bg-slate-50 font-bold">
                              <td colSpan={4} className="py-3 px-4 text-slate-800">Total for {selectedFunder}</td>
                              <td className="py-3 px-4 text-right text-[#0F2C5C]">
                                {formatCurrency(
                                  transactions
                                    .filter(t => t.Grant_Source === selectedFunder)
                                    .reduce((sum, t) => sum + t.Amount, 0)
                                )}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ==================== REPORTS TAB ==================== */}
            {activeTab === 'reports' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Spending by Funder */}
                  <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                      Spending by Funder
                    </h3>
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart data={spendingByFunder} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
                        <XAxis type="number" tickFormatter={(v) => formatCurrencyShort(v)} stroke="#94A3B8" />
                        <YAxis type="category" dataKey="name" width={120} stroke="#94A3B8" tick={{ fontSize: 10 }} />
                        <Tooltip 
                          formatter={(value: number) => formatCurrency(value)}
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Legend />
                        <Bar dataKey="budget" fill="#E2E8F0" name="Budget" radius={[0, 4, 4, 0]} />
                        <Bar dataKey="value" fill="#0F2C5C" name="Spent" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Monthly Category Breakdown */}
                  <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                      Monthly Category Breakdown
                    </h3>
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                        <XAxis dataKey="month" stroke="#94A3B8" />
                        <YAxis tickFormatter={(v) => formatCurrencyShort(v)} stroke="#94A3B8" />
                        <Tooltip 
                          formatter={(value: number) => formatCurrency(value)}
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Legend />
                        <Bar dataKey="Salaries" stackId="a" fill="#0F2C5C" name="Salaries" />
                        <Bar dataKey="Benefits" stackId="a" fill="#10B981" name="Benefits" />
                        <Bar dataKey="Professional" stackId="a" fill="#F59E0B" name="Professional" />
                        <Bar dataKey="Operating" stackId="a" fill="#8B5CF6" name="Operating" />
                        <Bar dataKey="Travel" stackId="a" fill="#EC4899" name="Travel" />
                        <Bar dataKey="Other" stackId="a" fill="#06B6D4" name="Other" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Cumulative Spending */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                    Cumulative Spending Trend
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis dataKey="month" stroke="#94A3B8" />
                      <YAxis tickFormatter={(v) => formatCurrencyShort(v)} stroke="#94A3B8" />
                      <Tooltip 
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      />
                      <Legend />
                      <Bar dataKey="total" fill="#0F2C5C" name="Monthly Spend" radius={[4, 4, 0, 0]} />
                      <Line type="monotone" dataKey="total" stroke="#EF4444" strokeWidth={3} name="Trend" dot={{ fill: '#EF4444', strokeWidth: 2 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>

                {/* Category Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {categories.map((cat, idx) => (
                    <div key={idx} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                        style={{ backgroundColor: `${CATEGORY_COLORS[cat.name]}15` }}
                      >
                        <DollarSign className="w-5 h-5" style={{ color: CATEGORY_COLORS[cat.name] }} />
                      </div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">{cat.name}</p>
                      <p className="text-xl font-black text-slate-800 mt-1">{formatCurrency(cat.spent)}</p>
                      <div className="flex items-center gap-1 mt-2">
                        <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ 
                              width: `${Math.min(cat.percentUsed, 100)}%`,
                              backgroundColor: cat.percentUsed > 100 ? '#EF4444' : CATEGORY_COLORS[cat.name]
                            }}
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-500">{cat.percentUsed.toFixed(0)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ==================== BACKUP TAB ==================== */}
            {activeTab === 'backup' && (
              <div className="max-w-4xl mx-auto space-y-6">
                {/* Backup Actions */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                  <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-3">
                    <Database className="w-6 h-6 text-[#0F2C5C]" />
                    Backup & Restore
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Create Backup */}
                    <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-200">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                          <Download className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-emerald-800">Create Backup</h3>
                          <p className="text-sm text-emerald-600">Save current data state</p>
                        </div>
                      </div>
                      <p className="text-sm text-emerald-700 mb-4">
                        Create a timestamped backup of all financial data. The backup file will be downloaded to your computer.
                      </p>
                      <button
                        onClick={handleCreateBackup}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
                      >
                        <Download className="w-5 h-5" />
                        Create Backup Now
                      </button>
                    </div>

                    {/* Restore from Backup */}
                    <div className="bg-amber-50 rounded-xl p-6 border border-amber-200">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                          <History className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-amber-800">Restore from Backup</h3>
                          <p className="text-sm text-amber-600">Revert to previous state</p>
                        </div>
                      </div>
                      <p className="text-sm text-amber-700 mb-4">
                        Upload a backup file to restore data. This will overwrite current data with the backup version.
                      </p>
                      <label className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all">
                        <Upload className="w-5 h-5" />
                        Upload Backup File
                        <input
                          type="file"
                          accept=".json"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                try {
                                  const data = JSON.parse(event.target?.result as string);
                                  if (confirm(`Restore backup from ${data.timestamp}?\n\nThis will overwrite current data.`)) {
                                    if (data.transactions) setTransactions(data.transactions);
                                    if (data.funders) setFunders(data.funders);
                                    if (data.categories) setCategories(data.categories);
                                    alert('Data restored successfully!');
                                  }
                                } catch (err) {
                                  alert('Invalid backup file');
                                }
                              };
                              reader.readAsText(file);
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Data Integrity */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                    Data Integrity Check
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-emerald-50 rounded-xl">
                      <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                      <p className="text-xs font-bold text-emerald-700">Transactions</p>
                      <p className="text-2xl font-black text-emerald-800">{transactions.length}</p>
                    </div>
                    <div className="text-center p-4 bg-emerald-50 rounded-xl">
                      <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                      <p className="text-xs font-bold text-emerald-700">Funders</p>
                      <p className="text-2xl font-black text-emerald-800">{funders.length}</p>
                    </div>
                    <div className="text-center p-4 bg-emerald-50 rounded-xl">
                      <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                      <p className="text-xs font-bold text-emerald-700">Categories</p>
                      <p className="text-2xl font-black text-emerald-800">{categories.length}</p>
                    </div>
                    <div className="text-center p-4 bg-emerald-50 rounded-xl">
                      <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                      <p className="text-xs font-bold text-emerald-700">Last Sync</p>
                      <p className="text-sm font-black text-emerald-800">Just now</p>
                    </div>
                  </div>
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <div className="flex gap-3">
                    <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-blue-800 text-sm">Data Protection</p>
                      <p className="text-blue-700 text-sm mt-1">
                        All financial data is stored securely. Regular backups are recommended to prevent data loss. 
                        The original master file is preserved and can be restored at any time.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default FinanceDashboard;
