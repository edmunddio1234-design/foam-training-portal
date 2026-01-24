import React, { useState, useEffect } from 'react';
import {
  Heart, Users, DollarSign, TrendingUp, Calendar, Mail, FileText,
  Plus, Search, Download, ChevronRight, Check, X, Clock,
  Target, RefreshCw, Building2, User, CreditCard, Banknote, Receipt,
  Lock, Eye, EyeOff, AlertCircle, Loader2, LogOut
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

interface AuthorizedUser {
  email: string;
  password: string;
  name: string;
  role: string;
}

interface SessionData {
  email: string;
  name: string;
  role: string;
  loginTime: string;
  expiresAt: string;
}

interface Donor {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  donorType: 'Individual' | 'Organization' | 'Foundation' | 'Corporate' | 'Government';
  notes: string | null;
  createdDate: string;
  totalDonated: number;
  donationCount: number;
}

interface Donation {
  id: string;
  donorId: string;
  donorName: string;
  amount: number;
  date: string;
  paymentMethod: 'Check' | 'Cash' | 'Credit Card' | 'Bank Transfer' | 'PayPal' | 'Zelle' | 'Other';
  campaign: string | null;
  designation: string | null;
  receiptNumber: string | null;
  receiptSent: boolean;
  thankYouSent: boolean;
  notes: string | null;
  isRecurring: boolean;
  recurringFrequency: 'Monthly' | 'Quarterly' | 'Annually' | null;
}

interface Campaign {
  id: string;
  name: string;
  description: string | null;
  goalAmount: number;
  raisedAmount: number;
  startDate: string;
  endDate: string | null;
  status: 'Active' | 'Completed' | 'Paused' | 'Cancelled';
  donationCount: number;
}

interface DonationStats {
  totalRaised: number;
  totalDonors: number;
  totalDonations: number;
  averageDonation: number;
  thisMonthRaised: number;
  thisYearRaised: number;
  activeCampaigns: number;
  topDonors: { name: string; total: number }[];
  recentDonations: Donation[];
  monthlyTrend: { month: string; amount: number }[];
}

interface DonationPortalProps {
  onBack: () => void;
}

type ViewMode = 'dashboard' | 'donors' | 'donations' | 'campaigns' | 'reports';
type ModalType = 'none' | 'addDonor' | 'addDonation' | 'addCampaign' | 'viewDonor';

// ============================================
// AUTHORIZED USERS - Update credentials here
// ============================================

const AUTHORIZED_USERS: AuthorizedUser[] = [
  { email: 'levar@foamla.org', password: 'Levar2025$', name: 'Levar', role: 'Administrator' },
  { email: 'sonny@foamla.org', password: '12@34DSs1!@#', name: 'Sonny', role: 'Director' },
  { email: 'awesley@foamla.org', password: '1Qaz2ADSEW', name: 'A. Wesley', role: 'Manager' }
];

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 30;
const SESSION_DURATION = 8 * 60 * 60 * 1000;

// ============================================
// LOGIN COMPONENT
// ============================================

interface LoginProps {
  onLoginSuccess: (user: { email: string; name: string; role: string }) => void;
  onBack: () => void;
}

const LoginScreen: React.FC<LoginProps> = ({ onLoginSuccess, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState<number | null>(null);

  useEffect(() => {
    if (isLocked && lockoutTime) {
      const timer = setInterval(() => {
        const remaining = Math.ceil((lockoutTime - Date.now()) / 1000);
        if (remaining <= 0) {
          setIsLocked(false);
          setLockoutTime(null);
          setAttempts(0);
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isLocked, lockoutTime]);

  const getRemainingLockoutTime = () => {
    if (!lockoutTime) return 0;
    return Math.max(0, Math.ceil((lockoutTime - Date.now()) / 1000));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) {
      setError(\`Too many attempts. Please wait \${getRemainingLockoutTime()} seconds.\`);
      return;
    }
    setError('');
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    const normalizedEmail = email.toLowerCase().trim();
    const user = AUTHORIZED_USERS.find(u => u.email.toLowerCase() === normalizedEmail && u.password === password);
    if (user) {
      const sessionData: SessionData = {
        email: user.email,
        name: user.name,
        role: user.role,
        loginTime: new Date().toISOString(),
        expiresAt: new Date(Date.now() + SESSION_DURATION).toISOString()
      };
      localStorage.setItem('donorCRMSession', JSON.stringify(sessionData));
      setIsLoading(false);
      onLoginSuccess({ email: user.email, name: user.name, role: user.role });
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= MAX_ATTEMPTS) {
        setIsLocked(true);
        setLockoutTime(Date.now() + LOCKOUT_DURATION * 1000);
        setError(\`Too many failed attempts. Account locked for \${LOCKOUT_DURATION} seconds.\`);
      } else {
        setError(\`Invalid email or password. \${MAX_ATTEMPTS - newAttempts} attempts remaining.\`);
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-rose-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-rose-100 rounded-full opacity-50 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-rose-200 rounded-full opacity-30 blur-3xl"></div>
      </div>
      <div className="w-full max-w-md relative z-10">
        <button onClick={onBack} className="mb-6 flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors group">
          <ChevronRight className="w-5 h-5 rotate-180 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Command Center</span>
        </button>
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-rose-500 to-rose-600 p-8 text-white text-center">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <Heart className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Donor CRM</h1>
            <p className="text-rose-100 text-sm">FOAM Donor Management System</p>
          </div>
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Welcome Back</h2>
              <p className="text-gray-500 text-sm mt-1">Sign in to access donor management</p>
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                  {isLocked && <p className="text-red-500 text-xs mt-1">Time remaining: {getRemainingLockoutTime()}s</p>}
                </div>
              </div>
            )}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@foamla.org" required disabled={isLocked || isLoading} className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all disabled:bg-gray-50 disabled:cursor-not-allowed" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required disabled={isLocked || isLoading} className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all disabled:bg-gray-50 disabled:cursor-not-allowed" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} disabled={isLocked || isLoading} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:cursor-not-allowed">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={isLocked || isLoading || !email || !password} className="w-full bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-rose-200 hover:shadow-xl hover:shadow-rose-300">
              {isLoading ? (<><Loader2 className="w-5 h-5 animate-spin" />Signing in...</>) : isLocked ? (<><Lock className="w-5 h-5" />Locked ({getRemainingLockoutTime()}s)</>) : ('Sign In')}
            </button>
          </form>
          <div className="px-8 pb-8">
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-xs text-gray-500"><span className="font-medium text-gray-700">Authorized Personnel Only</span><br />Contact admin@foamla.org for access issues</p>
            </div>
          </div>
        </div>
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 text-gray-400 text-xs"><Lock className="w-4 h-4" /><span>Secure SSL Connection</span></div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// MAIN DONATION PORTAL COMPONENT
// ============================================

const DonationPortal: React.FC<DonationPortalProps> = ({ onBack }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ email: string; name: string; role: string } | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [modalType, setModalType] = useState<ModalType>('none');
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [donors, setDonors] = useState<Donor[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [stats, setStats] = useState<DonationStats | null>(null);
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);
  const [donorForm, setDonorForm] = useState({ firstName: '', lastName: '', email: '', phone: '', address: '', city: '', state: '', zip: '', donorType: 'Individual' as Donor['donorType'], notes: '' });
  const [donationForm, setDonationForm] = useState({ donorId: '', amount: '', date: new Date().toISOString().split('T')[0], paymentMethod: 'Check' as Donation['paymentMethod'], campaign: '', designation: '', notes: '', isRecurring: false, recurringFrequency: null as Donation['recurringFrequency'] });
  const [campaignForm, setCampaignForm] = useState({ name: '', description: '', goalAmount: '', startDate: new Date().toISOString().split('T')[0], endDate: '', status: 'Active' as Campaign['status'] });

  useEffect(() => {
    const checkSession = () => {
      try {
        const sessionStr = localStorage.getItem('donorCRMSession');
        if (sessionStr) {
          const session: SessionData = JSON.parse(sessionStr);
          if (new Date(session.expiresAt) > new Date()) {
            setCurrentUser({ email: session.email, name: session.name, role: session.role });
            setIsAuthenticated(true);
          } else {
            localStorage.removeItem('donorCRMSession');
          }
        }
      } catch (error) {
        localStorage.removeItem('donorCRMSession');
      }
      setIsCheckingSession(false);
    };
    checkSession();
  }, []);

  const demoStats: DonationStats = {
    totalRaised: 127450.00, totalDonors: 156, totalDonations: 342, averageDonation: 372.66,
    thisMonthRaised: 12850.00, thisYearRaised: 89200.00, activeCampaigns: 3,
    topDonors: [
      { name: 'Johnson Family Foundation', total: 25000 },
      { name: 'Michael Thompson', total: 15000 },
      { name: 'Community First Bank', total: 10000 },
      { name: 'Sarah Mitchell', total: 7500 },
      { name: 'Local Business Alliance', total: 5000 }
    ],
    recentDonations: [],
    monthlyTrend: [
      { month: 'Aug', amount: 8500 }, { month: 'Sep', amount: 11200 },
      { month: 'Oct', amount: 9800 }, { month: 'Nov', amount: 15600 },
      { month: 'Dec', amount: 28400 }, { month: 'Jan', amount: 12850 }
    ]
  };

  const demoDonors: Donor[] = [
    { id: '1', firstName: 'Johnson Family', lastName: 'Foundation', email: 'giving@johnsonfoundation.org', phone: '(555) 123-4567', address: '100 Foundation Way', city: 'Los Angeles', state: 'CA', zip: '90001', donorType: 'Foundation', notes: 'Major annual donor', createdDate: '2023-01-15', totalDonated: 25000, donationCount: 5 },
    { id: '2', firstName: 'Michael', lastName: 'Thompson', email: 'mthompson@email.com', phone: '(555) 234-5678', address: '456 Oak Street', city: 'Pasadena', state: 'CA', zip: '91101', donorType: 'Individual', notes: 'Monthly recurring donor', createdDate: '2023-06-20', totalDonated: 15000, donationCount: 24 },
    { id: '3', firstName: 'Community First', lastName: 'Bank', email: 'community@cfbank.com', phone: '(555) 345-6789', address: '789 Finance Blvd', city: 'Glendale', state: 'CA', zip: '91201', donorType: 'Corporate', notes: 'Corporate sponsor', createdDate: '2024-02-10', totalDonated: 10000, donationCount: 2 },
    { id: '4', firstName: 'Sarah', lastName: 'Mitchell', email: 'sarah.m@gmail.com', phone: '(555) 456-7890', address: '321 Pine Lane', city: 'Burbank', state: 'CA', zip: '91501', donorType: 'Individual', notes: 'Board member', createdDate: '2022-09-05', totalDonated: 7500, donationCount: 8 },
    { id: '5', firstName: 'Local Business', lastName: 'Alliance', email: 'info@lballiance.org', phone: '(555) 567-8901', address: '555 Commerce St', city: 'Los Angeles', state: 'CA', zip: '90012', donorType: 'Organization', notes: 'Event sponsor', createdDate: '2024-05-15', totalDonated: 5000, donationCount: 2 }
  ];

  const demoDonations: Donation[] = [
    { id: '1', donorId: '1', donorName: 'Johnson Family Foundation', amount: 5000, date: '2025-01-14', paymentMethod: 'Check', campaign: 'Annual Fund', designation: 'General', receiptNumber: 'R-2025-001', receiptSent: true, thankYouSent: false, notes: null, isRecurring: false, recurringFrequency: null },
    { id: '2', donorId: '2', donorName: 'Michael Thompson', amount: 250, date: '2025-01-13', paymentMethod: 'Credit Card', campaign: 'Winter Drive', designation: 'Programs', receiptNumber: 'R-2025-002', receiptSent: true, thankYouSent: true, notes: null, isRecurring: true, recurringFrequency: 'Monthly' },
    { id: '3', donorId: '3', donorName: 'Community First Bank', amount: 2500, date: '2025-01-12', paymentMethod: 'Bank Transfer', campaign: 'Corporate Partners', designation: 'Operations', receiptNumber: 'R-2025-003', receiptSent: false, thankYouSent: false, notes: 'Annual corporate gift', isRecurring: false, recurringFrequency: null },
    { id: '4', donorId: '4', donorName: 'Sarah Mitchell', amount: 500, date: '2025-01-10', paymentMethod: 'Check', campaign: 'Annual Fund', designation: 'Scholarships', receiptNumber: 'R-2025-004', receiptSent: true, thankYouSent: true, notes: null, isRecurring: false, recurringFrequency: null },
    { id: '5', donorId: '5', donorName: 'Local Business Alliance', amount: 1000, date: '2025-01-08', paymentMethod: 'Check', campaign: 'Corporate Partners', designation: 'Events', receiptNumber: 'R-2025-005', receiptSent: true, thankYouSent: false, notes: 'Gala sponsorship', isRecurring: false, recurringFrequency: null }
  ];

  const demoCampaigns: Campaign[] = [
    { id: '1', name: 'Annual Fund 2025', description: 'General operating support for FOAM programs', goalAmount: 100000, raisedAmount: 45000, startDate: '2025-01-01', endDate: '2025-12-31', status: 'Active', donationCount: 89 },
    { id: '2', name: 'Winter Warmth Drive', description: 'Providing winter essentials for families', goalAmount: 15000, raisedAmount: 12850, startDate: '2024-11-01', endDate: '2025-02-28', status: 'Active', donationCount: 45 },
    { id: '3', name: 'Corporate Partners Program', description: 'Building relationships with local businesses', goalAmount: 50000, raisedAmount: 32500, startDate: '2024-07-01', endDate: '2025-06-30', status: 'Active', donationCount: 18 },
    { id: '4', name: 'Fall Gala 2024', description: 'Annual fundraising gala event', goalAmount: 75000, raisedAmount: 82000, startDate: '2024-09-01', endDate: '2024-11-15', status: 'Completed', donationCount: 156 }
  ];

  useEffect(() => {
    if (isAuthenticated) {
      setTimeout(() => {
        setDonors(demoDonors);
        setDonations(demoDonations);
        setCampaigns(demoCampaigns);
        setStats({ ...demoStats, recentDonations: demoDonations.slice(0, 5) });
        setIsLoading(false);
      }, 500);
    }
  }, [isAuthenticated]);

  const handleLoginSuccess = (user: { email: string; name: string; role: string }) => { setCurrentUser(user); setIsAuthenticated(true); };
  const handleLogout = () => { localStorage.removeItem('donorCRMSession'); setCurrentUser(null); setIsAuthenticated(false); setIsLoading(true); };
  const handleBack = () => { handleLogout(); onBack(); };
  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const filteredDonors = donors.filter(d => `${d.firstName} ${d.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) || d.email?.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredDonations = donations.filter(d => d.donorName.toLowerCase().includes(searchQuery.toLowerCase()) || d.campaign?.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleAddDonor = () => {
    const newDonor: Donor = { id: `donor-${Date.now()}`, ...donorForm, email: donorForm.email || null, phone: donorForm.phone || null, address: donorForm.address || null, city: donorForm.city || null, state: donorForm.state || null, zip: donorForm.zip || null, notes: donorForm.notes || null, createdDate: new Date().toISOString(), totalDonated: 0, donationCount: 0 };
    setDonors([...donors, newDonor]);
    setModalType('none');
    setDonorForm({ firstName: '', lastName: '', email: '', phone: '', address: '', city: '', state: '', zip: '', donorType: 'Individual', notes: '' });
  };

  const handleAddDonation = () => {
    const donor = donors.find(d => d.id === donationForm.donorId);
    if (!donor) return;
    const newDonation: Donation = { id: `donation-${Date.now()}`, donorId: donationForm.donorId, donorName: `${donor.firstName} ${donor.lastName}`, amount: parseFloat(donationForm.amount), date: donationForm.date, paymentMethod: donationForm.paymentMethod, campaign: donationForm.campaign || null, designation: donationForm.designation || null, receiptNumber: `R-${new Date().getFullYear()}-${String(donations.length + 1).padStart(3, '0')}`, receiptSent: false, thankYouSent: false, notes: donationForm.notes || null, isRecurring: donationForm.isRecurring, recurringFrequency: donationForm.recurringFrequency };
    setDonations([newDonation, ...donations]);
    setDonors(donors.map(d => d.id === donor.id ? { ...d, totalDonated: d.totalDonated + parseFloat(donationForm.amount), donationCount: d.donationCount + 1 } : d));
    setModalType('none');
    setDonationForm({ donorId: '', amount: '', date: new Date().toISOString().split('T')[0], paymentMethod: 'Check', campaign: '', designation: '', notes: '', isRecurring: false, recurringFrequency: null });
  };

  const handleAddCampaign = () => {
    const newCampaign: Campaign = { id: `campaign-${Date.now()}`, name: campaignForm.name, description: campaignForm.description || null, goalAmount: parseFloat(campaignForm.goalAmount), raisedAmount: 0, startDate: campaignForm.startDate, endDate: campaignForm.endDate || null, status: campaignForm.status, donationCount: 0 };
    setCampaigns([...campaigns, newCampaign]);
    setModalType('none');
    setCampaignForm({ name: '', description: '', goalAmount: '', startDate: new Date().toISOString().split('T')[0], endDate: '', status: 'Active' });
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
    { id: 'donors', label: 'Donors', icon: Users },
    { id: 'donations', label: 'Donations', icon: DollarSign },
    { id: 'campaigns', label: 'Campaigns', icon: Target },
    { id: 'reports', label: 'Reports', icon: FileText }
  ];

  if (isCheckingSession) {
    return (<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-center"><div className="w-12 h-12 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin mx-auto mb-4" /><p className="text-gray-500">Checking authorization...</p></div></div>);
  }
  if (!isAuthenticated) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} onBack={onBack} />;
  }
  if (isLoading) {
    return (<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-center"><div className="w-12 h-12 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin mx-auto mb-4" /><p className="text-gray-500">Loading Donation CRM...</p></div></div>);
  }

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between mb-3"><Heart className="w-8 h-8 opacity-80" /><span className="text-xs bg-white/20 px-2 py-1 rounded-full">All Time</span></div>
          <p className="text-3xl font-bold">{formatCurrency(stats?.totalRaised || 0)}</p><p className="text-rose-100 text-sm mt-1">Total Raised</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between mb-3"><Users className="w-8 h-8 opacity-80" /><span className="text-xs bg-white/20 px-2 py-1 rounded-full">+12 new</span></div>
          <p className="text-3xl font-bold">{stats?.totalDonors || 0}</p><p className="text-blue-100 text-sm mt-1">Total Donors</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between mb-3"><DollarSign className="w-8 h-8 opacity-80" /><span className="text-xs bg-white/20 px-2 py-1 rounded-full">This Month</span></div>
          <p className="text-3xl font-bold">{formatCurrency(stats?.thisMonthRaised || 0)}</p><p className="text-emerald-100 text-sm mt-1">Monthly Raised</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between mb-3"><Target className="w-8 h-8 opacity-80" /><span className="text-xs bg-white/20 px-2 py-1 rounded-full">{stats?.activeCampaigns} Active</span></div>
          <p className="text-3xl font-bold">{formatCurrency(stats?.averageDonation || 0)}</p><p className="text-amber-100 text-sm mt-1">Avg Donation</p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Donation Trend</h3>
          <div className="h-48 flex items-end justify-between gap-2">
            {stats?.monthlyTrend.map((item, index) => (<div key={index} className="flex-1 flex flex-col items-center gap-2"><div className="w-full bg-gradient-to-t from-rose-500 to-rose-400 rounded-t-lg hover:from-rose-600 hover:to-rose-500 transition-all" style={{ height: `${(item.amount / Math.max(...(stats?.monthlyTrend.map(i => i.amount) || [1]))) * 100}%`, minHeight: '20px' }} /><span className="text-xs text-gray-500">{item.month}</span></div>))}
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Donors</h3>
          <div className="space-y-3">
            {stats?.topDonors.slice(0, 5).map((donor, index) => (<div key={index} className="flex items-center justify-between"><div className="flex items-center gap-3"><span className="w-6 h-6 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-xs font-medium">{index + 1}</span><span className="text-sm text-gray-700 truncate max-w-[140px]">{donor.name}</span></div><span className="text-sm font-medium text-gray-900">{formatCurrency(donor.total)}</span></div>))}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-semibold text-gray-900">Recent Donations</h3><button onClick={() => setViewMode('donations')} className="text-sm text-rose-600 hover:text-rose-700 flex items-center gap-1">View All <ChevronRight className="w-4 h-4" /></button></div>
          <div className="space-y-3">
            {donations.slice(0, 5).map((donation) => (<div key={donation.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"><div><p className="text-sm font-medium text-gray-900">{donation.donorName}</p><p className="text-xs text-gray-500">{formatDate(donation.date)} • {donation.campaign || 'General'}</p></div><div className="text-right"><p className="text-sm font-semibold text-emerald-600">{formatCurrency(donation.amount)}</p>{donation.isRecurring && <span className="text-xs text-blue-600 flex items-center gap-1"><RefreshCw className="w-3 h-3" /> {donation.recurringFrequency}</span>}</div></div>))}
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-semibold text-gray-900">Active Campaigns</h3><button onClick={() => setViewMode('campaigns')} className="text-sm text-rose-600 hover:text-rose-700 flex items-center gap-1">View All <ChevronRight className="w-4 h-4" /></button></div>
          <div className="space-y-4">
            {campaigns.filter(c => c.status === 'Active').slice(0, 3).map((campaign) => (<div key={campaign.id} className="space-y-2"><div className="flex items-center justify-between"><span className="text-sm font-medium text-gray-900">{campaign.name}</span><span className="text-xs text-gray-500">{Math.round((campaign.raisedAmount / campaign.goalAmount) * 100)}%</span></div><div className="w-full bg-gray-100 rounded-full h-2"><div className="bg-gradient-to-r from-rose-500 to-rose-400 h-2 rounded-full" style={{ width: `${Math.min((campaign.raisedAmount / campaign.goalAmount) * 100, 100)}%` }} /></div><div className="flex justify-between text-xs text-gray-500"><span>{formatCurrency(campaign.raisedAmount)} raised</span><span>Goal: {formatCurrency(campaign.goalAmount)}</span></div></div>))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderDonors = () => (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="text" placeholder="Search donors..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent" /></div>
        <button onClick={() => setModalType('addDonor')} className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"><Plus className="w-4 h-4" /> Add Donor</button>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Donor</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Given</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th></tr></thead>
            <tbody className="divide-y divide-gray-100">
              {filteredDonors.map((donor) => (
                <tr key={donor.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4"><div className="flex items-center gap-3"><div className={`w-10 h-10 rounded-full flex items-center justify-center ${donor.donorType === 'Individual' ? 'bg-blue-100 text-blue-600' : donor.donorType === 'Foundation' ? 'bg-amber-100 text-amber-600' : donor.donorType === 'Corporate' ? 'bg-emerald-100 text-emerald-600' : 'bg-purple-100 text-purple-600'}`}>{donor.donorType === 'Individual' ? <User className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}</div><div><p className="font-medium text-gray-900">{donor.firstName} {donor.lastName}</p><p className="text-xs text-gray-500">Since {formatDate(donor.createdDate)}</p></div></div></td>
                  <td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded-full ${donor.donorType === 'Individual' ? 'bg-blue-100 text-blue-700' : donor.donorType === 'Foundation' ? 'bg-amber-100 text-amber-700' : donor.donorType === 'Corporate' ? 'bg-emerald-100 text-emerald-700' : 'bg-purple-100 text-purple-700'}`}>{donor.donorType}</span></td>
                  <td className="px-6 py-4"><p className="text-sm text-gray-900">{donor.email || '-'}</p><p className="text-xs text-gray-500">{donor.phone || '-'}</p></td>
                  <td className="px-6 py-4"><p className="font-semibold text-gray-900">{formatCurrency(donor.totalDonated)}</p><p className="text-xs text-gray-500">{donor.donationCount} donations</p></td>
                  <td className="px-6 py-4"><button onClick={() => { setSelectedDonor(donor); setModalType('viewDonor'); }} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"><ChevronRight className="w-4 h-4" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderDonations = () => (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="text" placeholder="Search donations..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent" /></div>
        <div className="flex gap-2"><button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"><Download className="w-4 h-4" /> Export</button><button onClick={() => setModalType('addDonation')} className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700"><Plus className="w-4 h-4" /> Record Donation</button></div>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Donor</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Campaign</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th></tr></thead>
            <tbody className="divide-y divide-gray-100">
              {filteredDonations.map((donation) => (
                <tr key={donation.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4"><p className="text-sm text-gray-900">{formatDate(donation.date)}</p><p className="text-xs text-gray-500">{donation.receiptNumber}</p></td>
                  <td className="px-6 py-4"><p className="font-medium text-gray-900">{donation.donorName}</p>{donation.isRecurring && <span className="text-xs text-blue-600 flex items-center gap-1"><RefreshCw className="w-3 h-3" /> {donation.recurringFrequency}</span>}</td>
                  <td className="px-6 py-4"><p className="font-semibold text-emerald-600">{formatCurrency(donation.amount)}</p></td>
                  <td className="px-6 py-4"><p className="text-sm text-gray-900">{donation.campaign || '-'}</p><p className="text-xs text-gray-500">{donation.designation || '-'}</p></td>
                  <td className="px-6 py-4"><span className="flex items-center gap-1.5 text-sm text-gray-700">{donation.paymentMethod === 'Check' && <Banknote className="w-4 h-4" />}{donation.paymentMethod === 'Credit Card' && <CreditCard className="w-4 h-4" />}{donation.paymentMethod === 'Bank Transfer' && <Building2 className="w-4 h-4" />}{donation.paymentMethod}</span></td>
                  <td className="px-6 py-4"><div className="flex flex-col gap-1"><span className={`inline-flex items-center gap-1 text-xs ${donation.receiptSent ? 'text-emerald-600' : 'text-amber-600'}`}>{donation.receiptSent ? <Check className="w-3 h-3" /> : <Clock className="w-3 h-3" />} Receipt</span><span className={`inline-flex items-center gap-1 text-xs ${donation.thankYouSent ? 'text-emerald-600' : 'text-amber-600'}`}>{donation.thankYouSent ? <Check className="w-3 h-3" /> : <Clock className="w-3 h-3" />} Thank You</span></div></td>
                  <td className="px-6 py-4"><div className="flex items-center gap-1"><button className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded" title="Send Thank You"><Mail className="w-4 h-4" /></button><button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded" title="View Receipt"><Receipt className="w-4 h-4" /></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderCampaigns = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between"><h2 className="text-xl font-semibold text-gray-900">Fundraising Campaigns</h2><button onClick={() => setModalType('addCampaign')} className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700"><Plus className="w-4 h-4" /> New Campaign</button></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {campaigns.map((campaign) => (
          <div key={campaign.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between mb-4"><div><h3 className="font-semibold text-gray-900">{campaign.name}</h3><p className="text-sm text-gray-500 mt-1">{campaign.description}</p></div><span className={`px-2 py-1 text-xs rounded-full ${campaign.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : campaign.status === 'Completed' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>{campaign.status}</span></div>
            <div className="space-y-3"><div><div className="flex justify-between text-sm mb-1"><span className="text-gray-600">Progress</span><span className="font-medium">{Math.round((campaign.raisedAmount / campaign.goalAmount) * 100)}%</span></div><div className="w-full bg-gray-100 rounded-full h-3"><div className={`h-3 rounded-full ${campaign.status === 'Completed' ? 'bg-gradient-to-r from-blue-500 to-blue-400' : 'bg-gradient-to-r from-rose-500 to-rose-400'}`} style={{ width: `${Math.min((campaign.raisedAmount / campaign.goalAmount) * 100, 100)}%` }} /></div></div><div className="flex justify-between pt-2 border-t border-gray-100"><div><p className="text-2xl font-bold text-gray-900">{formatCurrency(campaign.raisedAmount)}</p><p className="text-xs text-gray-500">of {formatCurrency(campaign.goalAmount)} goal</p></div><div className="text-right"><p className="text-lg font-semibold text-gray-900">{campaign.donationCount}</p><p className="text-xs text-gray-500">donations</p></div></div><div className="flex items-center justify-between text-xs text-gray-500 pt-2"><span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(campaign.startDate)}</span>{campaign.endDate && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Ends {formatDate(campaign.endDate)}</span>}</div></div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Reports & Analytics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[{ title: 'Donation Summary', description: 'Overview of all donations by date range', icon: DollarSign, color: 'rose' },{ title: 'Donor Report', description: 'Complete donor list with giving history', icon: Users, color: 'blue' },{ title: 'Campaign Performance', description: 'Analysis of campaign results', icon: Target, color: 'amber' },{ title: 'Year-End Summary', description: 'Annual giving report for tax purposes', icon: FileText, color: 'emerald' },{ title: 'Recurring Donations', description: 'List of all recurring donors', icon: RefreshCw, color: 'purple' },{ title: 'Acknowledgment Status', description: 'Track thank you letters and receipts', icon: Mail, color: 'indigo' }].map((report, index) => (
          <button key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-left hover:shadow-md transition-shadow group">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${report.color === 'rose' ? 'bg-rose-100 text-rose-600' : report.color === 'blue' ? 'bg-blue-100 text-blue-600' : report.color === 'amber' ? 'bg-amber-100 text-amber-600' : report.color === 'emerald' ? 'bg-emerald-100 text-emerald-600' : report.color === 'purple' ? 'bg-purple-100 text-purple-600' : 'bg-indigo-100 text-indigo-600'}`}><report.icon className="w-6 h-6" /></div>
            <h3 className="font-semibold text-gray-900 group-hover:text-rose-600 transition-colors">{report.title}</h3><p className="text-sm text-gray-500 mt-1">{report.description}</p><div className="flex items-center gap-2 mt-4 text-rose-600 text-sm font-medium">Generate Report <ChevronRight className="w-4 h-4" /></div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderModal = () => {
    if (modalType === 'none') return null;
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between"><h2 className="text-lg font-semibold text-gray-900">{modalType === 'addDonor' && 'Add New Donor'}{modalType === 'addDonation' && 'Record Donation'}{modalType === 'addCampaign' && 'Create Campaign'}{modalType === 'viewDonor' && 'Donor Details'}</h2><button onClick={() => setModalType('none')} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button></div>
          <div className="p-6">
            {modalType === 'addDonor' && (<form onSubmit={(e) => { e.preventDefault(); handleAddDonor(); }} className="space-y-4"><div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label><input type="text" required value={donorForm.firstName} onChange={(e) => setDonorForm({ ...donorForm, firstName: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500" /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label><input type="text" required value={donorForm.lastName} onChange={(e) => setDonorForm({ ...donorForm, lastName: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500" /></div></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Donor Type *</label><select value={donorForm.donorType} onChange={(e) => setDonorForm({ ...donorForm, donorType: e.target.value as Donor['donorType'] })} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500"><option value="Individual">Individual</option><option value="Organization">Organization</option><option value="Foundation">Foundation</option><option value="Corporate">Corporate</option><option value="Government">Government</option></select></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" value={donorForm.email} onChange={(e) => setDonorForm({ ...donorForm, email: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500" /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Phone</label><input type="tel" value={donorForm.phone} onChange={(e) => setDonorForm({ ...donorForm, phone: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500" /></div></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Notes</label><textarea value={donorForm.notes} onChange={(e) => setDonorForm({ ...donorForm, notes: e.target.value })} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500" /></div><div className="flex justify-end gap-3 pt-4"><button type="button" onClick={() => setModalType('none')} className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button><button type="submit" className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700">Add Donor</button></div></form>)}
            {modalType === 'addDonation' && (<form onSubmit={(e) => { e.preventDefault(); handleAddDonation(); }} className="space-y-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">Donor *</label><select required value={donationForm.donorId} onChange={(e) => setDonationForm({ ...donationForm, donorId: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500"><option value="">Select a donor...</option>{donors.map((donor) => (<option key={donor.id} value={donor.id}>{donor.firstName} {donor.lastName}</option>))}</select></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span><input type="number" required step="0.01" min="0" value={donationForm.amount} onChange={(e) => setDonationForm({ ...donationForm, amount: e.target.value })} className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500" /></div></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Date *</label><input type="date" required value={donationForm.date} onChange={(e) => setDonationForm({ ...donationForm, date: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500" /></div></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Payment Method *</label><select value={donationForm.paymentMethod} onChange={(e) => setDonationForm({ ...donationForm, paymentMethod: e.target.value as Donation['paymentMethod'] })} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500"><option value="Check">Check</option><option value="Cash">Cash</option><option value="Credit Card">Credit Card</option><option value="Bank Transfer">Bank Transfer</option><option value="PayPal">PayPal</option><option value="Zelle">Zelle</option><option value="Other">Other</option></select></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">Campaign</label><select value={donationForm.campaign} onChange={(e) => setDonationForm({ ...donationForm, campaign: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500"><option value="">General Fund</option>{campaigns.map((c) => (<option key={c.id} value={c.name}>{c.name}</option>))}</select></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Designation</label><input type="text" value={donationForm.designation} onChange={(e) => setDonationForm({ ...donationForm, designation: e.target.value })} placeholder="e.g., Programs" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500" /></div></div><div className="flex items-center gap-4"><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={donationForm.isRecurring} onChange={(e) => setDonationForm({ ...donationForm, isRecurring: e.target.checked, recurringFrequency: e.target.checked ? 'Monthly' : null })} className="w-4 h-4 text-rose-600 rounded" /><span className="text-sm text-gray-700">Recurring Donation</span></label>{donationForm.isRecurring && <select value={donationForm.recurringFrequency || ''} onChange={(e) => setDonationForm({ ...donationForm, recurringFrequency: e.target.value as Donation['recurringFrequency'] })} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm"><option value="Monthly">Monthly</option><option value="Quarterly">Quarterly</option><option value="Annually">Annually</option></select>}</div><div className="flex justify-end gap-3 pt-4"><button type="button" onClick={() => setModalType('none')} className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button><button type="submit" className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700">Record Donation</button></div></form>)}
            {modalType === 'addCampaign' && (<form onSubmit={(e) => { e.preventDefault(); handleAddCampaign(); }} className="space-y-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">Campaign Name *</label><input type="text" required value={campaignForm.name} onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500" /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><textarea value={campaignForm.description} onChange={(e) => setCampaignForm({ ...campaignForm, description: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500" /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Goal Amount *</label><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span><input type="number" required step="0.01" min="0" value={campaignForm.goalAmount} onChange={(e) => setCampaignForm({ ...campaignForm, goalAmount: e.target.value })} className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500" /></div></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label><input type="date" required value={campaignForm.startDate} onChange={(e) => setCampaignForm({ ...campaignForm, startDate: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500" /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">End Date</label><input type="date" value={campaignForm.endDate} onChange={(e) => setCampaignForm({ ...campaignForm, endDate: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500" /></div></div><div className="flex justify-end gap-3 pt-4"><button type="button" onClick={() => setModalType('none')} className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button><button type="submit" className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700">Create Campaign</button></div></form>)}
            {modalType === 'viewDonor' && selectedDonor && (<div className="space-y-6"><div className="flex items-center gap-4"><div className={`w-16 h-16 rounded-full flex items-center justify-center ${selectedDonor.donorType === 'Individual' ? 'bg-blue-100 text-blue-600' : selectedDonor.donorType === 'Foundation' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>{selectedDonor.donorType === 'Individual' ? <User className="w-8 h-8" /> : <Building2 className="w-8 h-8" />}</div><div><h3 className="text-xl font-semibold text-gray-900">{selectedDonor.firstName} {selectedDonor.lastName}</h3><p className="text-sm text-gray-500">{selectedDonor.donorType} • Since {formatDate(selectedDonor.createdDate)}</p></div></div><div className="grid grid-cols-2 gap-4"><div className="bg-rose-50 rounded-xl p-4"><p className="text-2xl font-bold text-rose-600">{formatCurrency(selectedDonor.totalDonated)}</p><p className="text-sm text-rose-600/70">Total Given</p></div><div className="bg-blue-50 rounded-xl p-4"><p className="text-2xl font-bold text-blue-600">{selectedDonor.donationCount}</p><p className="text-sm text-blue-600/70">Donations</p></div></div><div className="space-y-3"><h4 className="font-medium text-gray-900">Contact Information</h4><div className="space-y-2 text-sm">{selectedDonor.email && <p className="flex items-center gap-2 text-gray-600"><Mail className="w-4 h-4" /> {selectedDonor.email}</p>}{selectedDonor.phone && <p className="flex items-center gap-2 text-gray-600"><User className="w-4 h-4" /> {selectedDonor.phone}</p>}{selectedDonor.address && <p className="text-gray-600">{selectedDonor.address}, {selectedDonor.city}, {selectedDonor.state} {selectedDonor.zip}</p>}</div></div>{selectedDonor.notes && <div><h4 className="font-medium text-gray-900 mb-2">Notes</h4><p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedDonor.notes}</p></div>}<div className="flex justify-end gap-3 pt-4 border-t border-gray-100"><button onClick={() => setModalType('none')} className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">Close</button><button onClick={() => { setDonationForm({ ...donationForm, donorId: selectedDonor.id }); setModalType('addDonation'); }} className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 flex items-center gap-2"><Plus className="w-4 h-4" /> Record Donation</button></div></div>)}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-rose-500 to-rose-600 text-white py-2 px-4 flex items-center justify-between text-sm">
        <div className="flex items-center gap-4"><span className="flex items-center gap-2"><span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>Logged in as <strong>{currentUser?.name}</strong></span><span className="text-rose-200">|</span><span className="text-rose-100">{currentUser?.role}</span></div>
        <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"><LogOut className="w-4 h-4" /> Sign Out</button>
      </div>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4"><button onClick={handleBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><ChevronRight className="w-5 h-5 rotate-180" /></button><div className="flex items-center gap-3"><div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl flex items-center justify-center"><Heart className="w-5 h-5 text-white" /></div><div><h1 className="text-lg font-semibold text-gray-900">Donation CRM</h1><p className="text-xs text-gray-500">FOAM Donor Management</p></div></div></div>
            <button onClick={() => setModalType('addDonation')} className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors text-sm font-medium"><Plus className="w-4 h-4" /> Quick Donation</button>
          </div>
        </div>
      </header>
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-1 overflow-x-auto py-2">
            {tabs.map((tab) => (<button key={tab.id} onClick={() => setViewMode(tab.id as ViewMode)} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${viewMode === tab.id ? 'bg-rose-50 text-rose-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}><tab.icon className="w-4 h-4" />{tab.label}</button>))}
          </nav>
        </div>
      </div>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {viewMode === 'dashboard' && renderDashboard()}
        {viewMode === 'donors' && renderDonors()}
        {viewMode === 'donations' && renderDonations()}
        {viewMode === 'campaigns' && renderCampaigns()}
        {viewMode === 'reports' && renderReports()}
      </main>
      {renderModal()}
    </div>
  );
};

export default DonationPortal;
