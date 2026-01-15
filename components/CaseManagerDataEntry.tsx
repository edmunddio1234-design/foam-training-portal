import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, Users, FileText, Send, BarChart3,
  Plus, Search, X, Phone, Mail, MapPin,
  CheckCircle, Clock, RefreshCw,
  User
} from 'lucide-react';

interface CaseManagerDataEntryProps {
  onClose: () => void;
}

type TabType = 'dashboard' | 'clients' | 'notes' | 'referrals';

const API_BASE_URL = 'https://foamla-backend-2.onrender.com';

interface Client {
  id: string;
  fullName: string;
  dateOfBirth?: string;
  phone?: string;
  email?: string;
  homeAddress?: string;
  intakeDate?: string;
  primaryNeeds?: string;
  assignedCaseManager?: string;
  status: string;
  courtOrdered?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  notes?: string;
}

interface CaseNote {
  id: string;
  clientName: string;
  date: string;
  caseManager: string;
  noteType: string;
  noteSummary: string;
  nextSteps?: string;
  followUpDate?: string;
  clientStatus?: string;
}

interface Referral {
  id: string;
  clientName: string;
  providerName: string;
  serviceType: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  status: string;
  referralDate: string;
  notes?: string;
  outcome?: string;
}

interface DashboardStats {
  totalClients: number;
  activeClients: number;
  graduatedClients: number;
  inactiveClients: number;
  totalNotes: number;
  totalReferrals: number;
  pendingReferrals: number;
  completedReferrals: number;
  staffCount: number;
  clientsByStatus: Record<string, number>;
  clientsByCaseManager: Record<string, number>;
  referralsByStatus: Record<string, number>;
}

interface Staff {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  status: string;
}

const CaseManagerDataEntry: React.FC<CaseManagerDataEntryProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Data states
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [caseNotes, setCaseNotes] = useState<CaseNote[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  
  // Modal states
  const [showAddClient, setShowAddClient] = useState(false);
  const [showAddNote, setShowAddNote] = useState(false);
  const [showAddReferral, setShowAddReferral] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  
  // Form states
  const [clientForm, setClientForm] = useState({
    fullName: '', dateOfBirth: '', phone: '', email: '', homeAddress: '',
    intakeDate: new Date().toISOString().split('T')[0], primaryNeeds: 'Fatherhood Program',
    assignedCaseManager: '', status: 'Active', courtOrdered: 'No',
    emergencyContact: '', emergencyPhone: '', notes: ''
  });
  
  const [noteForm, setNoteForm] = useState({
    clientName: '', date: new Date().toISOString().split('T')[0], caseManager: '',
    noteType: 'General', noteSummary: '', nextSteps: '', followUpDate: '', clientStatus: ''
  });
  
  const [referralForm, setReferralForm] = useState({
    clientName: '', providerName: '', serviceType: '', contactPerson: '',
    phone: '', email: '', status: 'Pending', referralDate: new Date().toISOString().split('T')[0], notes: ''
  });

  // Load data on mount and tab change
  useEffect(() => {
    loadDashboard();
    loadStaff();
  }, []);

  useEffect(() => {
    if (activeTab === 'clients' && clients.length === 0) loadClients();
    if (activeTab === 'notes' && caseNotes.length === 0) loadNotes();
    if (activeTab === 'referrals' && referrals.length === 0) loadReferrals();
  }, [activeTab]);

  // API calls
  const loadDashboard = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/cm/dashboard`);
      const data = await response.json();
      if (data.success) setDashboardStats(data.data);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadClients = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/cm/clients`);
      const data = await response.json();
      if (data.success) setClients(data.data);
    } catch (err) {
      console.error('Failed to load clients:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadNotes = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/cm/notes`);
      const data = await response.json();
      if (data.success) setCaseNotes(data.data);
    } catch (err) {
      console.error('Failed to load notes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadReferrals = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/cm/referrals`);
      const data = await response.json();
      if (data.success) setReferrals(data.data);
    } catch (err) {
      console.error('Failed to load referrals:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStaff = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/cm/staff`);
      const data = await response.json();
      if (data.success) setStaff(data.data);
    } catch (err) {
      console.error('Failed to load staff:', err);
    }
  };

  const addClient = async () => {
    if (!clientForm.fullName.trim()) {
      alert('Client name is required');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/cm/clients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientForm)
      });
      const data = await response.json();
      if (data.success) {
        alert('Client added successfully!');
        setShowAddClient(false);
        setClientForm({
          fullName: '', dateOfBirth: '', phone: '', email: '', homeAddress: '',
          intakeDate: new Date().toISOString().split('T')[0], primaryNeeds: 'Fatherhood Program',
          assignedCaseManager: '', status: 'Active', courtOrdered: 'No',
          emergencyContact: '', emergencyPhone: '', notes: ''
        });
        loadClients();
        loadDashboard();
      } else {
        alert('Failed to add client: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Failed to add client:', err);
      alert('Failed to add client');
    } finally {
      setIsLoading(false);
    }
  };

  const addNote = async () => {
    if (!noteForm.clientName.trim() || !noteForm.noteSummary.trim()) {
      alert('Client name and note summary are required');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/cm/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(noteForm)
      });
      const data = await response.json();
      if (data.success) {
        alert('Case note added successfully!');
        setShowAddNote(false);
        setNoteForm({
          clientName: '', date: new Date().toISOString().split('T')[0], caseManager: '',
          noteType: 'General', noteSummary: '', nextSteps: '', followUpDate: '', clientStatus: ''
        });
        loadNotes();
        loadDashboard();
      } else {
        alert('Failed to add note: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Failed to add note:', err);
      alert('Failed to add note');
    } finally {
      setIsLoading(false);
    }
  };

  const addReferral = async () => {
    if (!referralForm.clientName.trim() || !referralForm.providerName.trim()) {
      alert('Client name and provider name are required');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/cm/referrals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(referralForm)
      });
      const data = await response.json();
      if (data.success) {
        alert('Referral added successfully!');
        setShowAddReferral(false);
        setReferralForm({
          clientName: '', providerName: '', serviceType: '', contactPerson: '',
          phone: '', email: '', status: 'Pending', referralDate: new Date().toISOString().split('T')[0], notes: ''
        });
        loadReferrals();
        loadDashboard();
      } else {
        alert('Failed to add referral: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Failed to add referral:', err);
      alert('Failed to add referral');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter functions
  const filteredClients = clients.filter(c =>
    c.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone?.includes(searchQuery)
  );

  const filteredNotes = caseNotes.filter(n =>
    n.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.noteSummary?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredReferrals = referrals.filter(r =>
    r.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.providerName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Status badge colors
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'graduated': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'inactive': return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'approved': return 'bg-teal-100 text-teal-700 border-teal-200';
      case 'completed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'in progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  // Tabs configuration
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'notes', label: 'Case Notes', icon: FileText },
    { id: 'referrals', label: 'Referrals', icon: Send }
  ];

  // Render Dashboard
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-slate-500 text-sm">Total Clients</span>
          </div>
          <p className="text-3xl font-bold text-slate-800">{dashboardStats?.totalClients || 0}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-teal-600" />
            </div>
            <span className="text-slate-500 text-sm">Active</span>
          </div>
          <p className="text-3xl font-bold text-slate-800">{dashboardStats?.activeClients || 0}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Award className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-slate-500 text-sm">Graduated</span>
          </div>
          <p className="text-3xl font-bold text-slate-800">{dashboardStats?.graduatedClients || 0}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-slate-500 text-sm">Pending Referrals</span>
          </div>
          <p className="text-3xl font-bold text-slate-800">{dashboardStats?.pendingReferrals || 0}</p>
        </div>
      </div>

      {/* Activity Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-600" /> Case Notes
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-600">Total Notes</span>
              <span className="font-bold text-slate-800">{dashboardStats?.totalNotes || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Send className="w-5 h-5 text-purple-600" /> Referrals
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-600">Total Referrals</span>
              <span className="font-bold text-slate-800">{dashboardStats?.totalReferrals || 0}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-600">Pending</span>
              <span className="font-bold text-amber-600">{dashboardStats?.pendingReferrals || 0}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-slate-600">Completed</span>
              <span className="font-bold text-emerald-600">{dashboardStats?.completedReferrals || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Program Overview */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-600" /> Program Overview
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-slate-800">{dashboardStats?.totalClients || 0}</p>
            <p className="text-slate-500 text-sm">Total Enrolled</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-emerald-600">{dashboardStats?.activeClients || 0}</p>
            <p className="text-slate-500 text-sm">Currently Active</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-slate-800">{dashboardStats?.staffCount || 0}</p>
            <p className="text-slate-500 text-sm">Active Staff</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-slate-800">
              {dashboardStats?.totalClients ? Math.round((dashboardStats.activeClients / dashboardStats.totalClients) * 100) : 0}%
            </p>
            <p className="text-slate-500 text-sm">Active Rate</p>
          </div>
        </div>
      </div>

      {/* Quick Actions - 3 buttons only */}
      <div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-2xl p-6 text-white">
        <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-3 gap-3">
          <button onClick={() => { setActiveTab('clients'); setShowAddClient(true); }}
            className="bg-white/20 hover:bg-white/30 rounded-xl p-4 text-center transition-all">
            <Users className="w-6 h-6 mx-auto mb-2" />
            <span className="text-sm font-medium">Add Client</span>
          </button>
          <button onClick={() => { setActiveTab('notes'); setShowAddNote(true); }}
            className="bg-white/20 hover:bg-white/30 rounded-xl p-4 text-center transition-all">
            <FileText className="w-6 h-6 mx-auto mb-2" />
            <span className="text-sm font-medium">Add Note</span>
          </button>
          <button onClick={() => { setActiveTab('referrals'); setShowAddReferral(true); }}
            className="bg-white/20 hover:bg-white/30 rounded-xl p-4 text-center transition-all">
            <Send className="w-6 h-6 mx-auto mb-2" />
            <span className="text-sm font-medium">Add Referral</span>
          </button>
        </div>
      </div>
    </div>
  );

  // Render Clients Tab
  const renderClients = () => (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
          />
        </div>
        <button
          onClick={() => setShowAddClient(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition-colors"
        >
          <Plus size={18} /> Add Client
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">ID</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Name</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Phone</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Case Manager</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Intake Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredClients.length > 0 ? filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => setSelectedClient(client)}>
                  <td className="px-4 py-3 text-sm text-slate-600 font-mono">{client.id}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-teal-600" />
                      </div>
                      <span className="font-medium text-slate-800">{client.fullName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{client.phone || '-'}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{client.assignedCaseManager || 'Unassigned'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusColor(client.status)}`}>
                      {client.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{client.intakeDate || '-'}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    {isLoading ? 'Loading...' : 'No clients found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 text-sm text-slate-500">
          Showing {filteredClients.length} of {clients.length} clients
        </div>
      </div>
    </div>
  );

  // Render Case Notes Tab
  const renderNotes = () => (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
          />
        </div>
        <button
          onClick={() => setShowAddNote(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition-colors"
        >
          <Plus size={18} /> Add Case Note
        </button>
      </div>

      <div className="grid gap-4">
        {filteredNotes.length > 0 ? filteredNotes.map((note) => (
          <div key={note.id} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">{note.clientName}</h4>
                  <p className="text-sm text-slate-500">{note.date} • {note.noteType}</p>
                </div>
              </div>
              <span className="text-xs text-slate-400 font-mono">{note.id}</span>
            </div>
            <p className="text-slate-700 mb-3">{note.noteSummary}</p>
            {note.nextSteps && (
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Next Steps</p>
                <p className="text-sm text-slate-700">{note.nextSteps}</p>
              </div>
            )}
            {note.caseManager && (
              <p className="text-xs text-slate-400 mt-3">By: {note.caseManager}</p>
            )}
          </div>
        )) : (
          <div className="bg-white rounded-xl p-8 text-center border border-slate-200">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">{isLoading ? 'Loading...' : 'No case notes found'}</p>
          </div>
        )}
      </div>
    </div>
  );

  // Render Referrals Tab
  const renderReferrals = () => (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search referrals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
          />
        </div>
        <button
          onClick={() => setShowAddReferral(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition-colors"
        >
          <Plus size={18} /> Add Referral
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Client</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Provider</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Service</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReferrals.length > 0 ? filteredReferrals.map((referral) => (
                <tr key={referral.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-800">{referral.clientName}</td>
                  <td className="px-4 py-3 text-slate-600">{referral.providerName}</td>
                  <td className="px-4 py-3 text-slate-600">{referral.serviceType || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusColor(referral.status)}`}>
                      {referral.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{referral.referralDate}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    {isLoading ? 'Loading...' : 'No referrals found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Add Client Modal
  const renderAddClientModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddClient(false)}>
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">Add New Client</h2>
          <button onClick={() => setShowAddClient(false)} className="p-2 hover:bg-slate-100 rounded-lg">
            <X size={24} className="text-slate-400" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
              <input type="text" value={clientForm.fullName} onChange={(e) => setClientForm({ ...clientForm, fullName: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Enter full name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth</label>
              <input type="date" value={clientForm.dateOfBirth} onChange={(e) => setClientForm({ ...clientForm, dateOfBirth: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
              <input type="tel" value={clientForm.phone} onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" placeholder="555-123-4567" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input type="email" value={clientForm.email} onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" placeholder="email@example.com" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Home Address</label>
              <input type="text" value={clientForm.homeAddress} onChange={(e) => setClientForm({ ...clientForm, homeAddress: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Street, City, State ZIP" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Intake Date</label>
              <input type="date" value={clientForm.intakeDate} onChange={(e) => setClientForm({ ...clientForm, intakeDate: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Assigned Case Manager</label>
              <select value={clientForm.assignedCaseManager} onChange={(e) => setClientForm({ ...clientForm, assignedCaseManager: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none">
                <option value="">Select Case Manager</option>
                {staff.filter(s => s.role === 'Case Manager' && s.status === 'Active').map(s => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Primary Needs</label>
              <select value={clientForm.primaryNeeds} onChange={(e) => setClientForm({ ...clientForm, primaryNeeds: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none">
                <option value="Fatherhood Program">Fatherhood Program</option>
                <option value="Employment Services">Employment Services</option>
                <option value="Housing Assistance">Housing Assistance</option>
                <option value="Legal Aid">Legal Aid</option>
                <option value="Mental Health">Mental Health</option>
                <option value="Multiple Services">Multiple Services</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select value={clientForm.status} onChange={(e) => setClientForm({ ...clientForm, status: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none">
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Graduated">Graduated</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Court Ordered</label>
              <select value={clientForm.courtOrdered} onChange={(e) => setClientForm({ ...clientForm, courtOrdered: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none">
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Emergency Contact</label>
              <input type="text" value={clientForm.emergencyContact} onChange={(e) => setClientForm({ ...clientForm, emergencyContact: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Contact name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Emergency Phone</label>
              <input type="tel" value={clientForm.emergencyPhone} onChange={(e) => setClientForm({ ...clientForm, emergencyPhone: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" placeholder="555-123-4567" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
              <textarea value={clientForm.notes} onChange={(e) => setClientForm({ ...clientForm, notes: e.target.value })} rows={3}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none resize-none" placeholder="Additional notes..." />
            </div>
          </div>
          <div className="flex gap-3 pt-4 border-t">
            <button onClick={() => setShowAddClient(false)} className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors">Cancel</button>
            <button onClick={addClient} disabled={isLoading} className="flex-1 px-4 py-2.5 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition-colors disabled:opacity-50">
              {isLoading ? 'Adding...' : 'Add Client'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Add Note Modal
  const renderAddNoteModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddNote(false)}>
      <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">Add Case Note</h2>
          <button onClick={() => setShowAddNote(false)} className="p-2 hover:bg-slate-100 rounded-lg">
            <X size={24} className="text-slate-400" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Client Name *</label>
            <input type="text" value={noteForm.clientName} onChange={(e) => setNoteForm({ ...noteForm, clientName: e.target.value })} list="client-names"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Start typing client name..." />
            <datalist id="client-names">
              {clients.map(c => <option key={c.id} value={c.fullName} />)}
            </datalist>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
              <input type="date" value={noteForm.date} onChange={(e) => setNoteForm({ ...noteForm, date: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Note Type</label>
              <select value={noteForm.noteType} onChange={(e) => setNoteForm({ ...noteForm, noteType: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none">
                <option value="General">General</option>
                <option value="Intake">Intake</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Crisis">Crisis</option>
                <option value="Progress">Progress</option>
                <option value="Closure">Closure</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Case Manager</label>
            <select value={noteForm.caseManager} onChange={(e) => setNoteForm({ ...noteForm, caseManager: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none">
              <option value="">Select Case Manager</option>
              {staff.filter(s => s.role === 'Case Manager').map(s => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Note Summary *</label>
            <textarea value={noteForm.noteSummary} onChange={(e) => setNoteForm({ ...noteForm, noteSummary: e.target.value })} rows={4}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none resize-none" placeholder="Describe the interaction, progress, or concerns..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Next Steps</label>
            <textarea value={noteForm.nextSteps} onChange={(e) => setNoteForm({ ...noteForm, nextSteps: e.target.value })} rows={2}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none resize-none" placeholder="Action items and follow-up plans..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Follow-up Date</label>
            <input type="date" value={noteForm.followUpDate} onChange={(e) => setNoteForm({ ...noteForm, followUpDate: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" />
          </div>
          <div className="flex gap-3 pt-4 border-t">
            <button onClick={() => setShowAddNote(false)} className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors">Cancel</button>
            <button onClick={addNote} disabled={isLoading} className="flex-1 px-4 py-2.5 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition-colors disabled:opacity-50">
              {isLoading ? 'Adding...' : 'Add Note'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Add Referral Modal
  const renderAddReferralModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddReferral(false)}>
      <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">Add Referral</h2>
          <button onClick={() => setShowAddReferral(false)} className="p-2 hover:bg-slate-100 rounded-lg">
            <X size={24} className="text-slate-400" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Client Name *</label>
            <input type="text" value={referralForm.clientName} onChange={(e) => setReferralForm({ ...referralForm, clientName: e.target.value })} list="client-names-ref"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Start typing client name..." />
            <datalist id="client-names-ref">
              {clients.map(c => <option key={c.id} value={c.fullName} />)}
            </datalist>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Provider/Agency Name *</label>
            <input type="text" value={referralForm.providerName} onChange={(e) => setReferralForm({ ...referralForm, providerName: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" placeholder="e.g., Capital Area United Way" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Service Type</label>
              <select value={referralForm.serviceType} onChange={(e) => setReferralForm({ ...referralForm, serviceType: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none">
                <option value="">Select Service</option>
                <option value="Employment">Employment</option>
                <option value="Housing">Housing</option>
                <option value="Mental Health">Mental Health</option>
                <option value="Legal Aid">Legal Aid</option>
                <option value="Food Assistance">Food Assistance</option>
                <option value="Education">Education</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Child Support">Child Support</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Referral Date</label>
              <input type="date" value={referralForm.referralDate} onChange={(e) => setReferralForm({ ...referralForm, referralDate: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Contact Person</label>
            <input type="text" value={referralForm.contactPerson} onChange={(e) => setReferralForm({ ...referralForm, contactPerson: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Provider contact name" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
              <input type="tel" value={referralForm.phone} onChange={(e) => setReferralForm({ ...referralForm, phone: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" placeholder="555-123-4567" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input type="email" value={referralForm.email} onChange={(e) => setReferralForm({ ...referralForm, email: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" placeholder="contact@provider.org" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
            <select value={referralForm.status} onChange={(e) => setReferralForm({ ...referralForm, status: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none">
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
            <textarea value={referralForm.notes} onChange={(e) => setReferralForm({ ...referralForm, notes: e.target.value })} rows={2}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none resize-none" placeholder="Additional details about the referral..." />
          </div>
          <div className="flex gap-3 pt-4 border-t">
            <button onClick={() => setShowAddReferral(false)} className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors">Cancel</button>
            <button onClick={addReferral} disabled={isLoading} className="flex-1 px-4 py-2.5 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition-colors disabled:opacity-50">
              {isLoading ? 'Adding...' : 'Add Referral'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Client Detail Modal
  const renderClientDetailModal = () => {
    if (!selectedClient) return null;
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedClient(null)}>
        <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                <User className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">{selectedClient.fullName}</h2>
                <p className="text-slate-500 text-sm">{selectedClient.id}</p>
              </div>
            </div>
            <button onClick={() => setSelectedClient(null)} className="p-2 hover:bg-slate-100 rounded-lg">
              <X size={24} className="text-slate-400" />
            </button>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1.5 text-sm font-medium rounded-full border ${getStatusColor(selectedClient.status)}`}>
                {selectedClient.status}
              </span>
              {selectedClient.courtOrdered === 'Yes' && (
                <span className="px-3 py-1.5 text-sm font-medium rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                  Court Ordered
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Phone</p>
                <p className="text-slate-800 font-medium flex items-center gap-2">
                  <Phone size={16} className="text-slate-400" />
                  {selectedClient.phone || 'Not provided'}
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Email</p>
                <p className="text-slate-800 font-medium flex items-center gap-2">
                  <Mail size={16} className="text-slate-400" />
                  {selectedClient.email || 'Not provided'}
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 md:col-span-2">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Address</p>
                <p className="text-slate-800 font-medium flex items-center gap-2">
                  <MapPin size={16} className="text-slate-400" />
                  {selectedClient.homeAddress || 'Not provided'}
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Date of Birth</p>
                <p className="text-slate-800 font-medium">{selectedClient.dateOfBirth || 'Not provided'}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Intake Date</p>
                <p className="text-slate-800 font-medium">{selectedClient.intakeDate || 'Not provided'}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Case Manager</p>
                <p className="text-slate-800 font-medium">{selectedClient.assignedCaseManager || 'Unassigned'}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Primary Needs</p>
                <p className="text-slate-800 font-medium">{selectedClient.primaryNeeds || 'Not specified'}</p>
              </div>
            </div>

            {(selectedClient.emergencyContact || selectedClient.emergencyPhone) && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-xs text-amber-700 uppercase tracking-wider mb-2 font-bold">Emergency Contact</p>
                <div className="flex items-center gap-4">
                  <p className="text-amber-800">{selectedClient.emergencyContact || 'Not provided'}</p>
                  {selectedClient.emergencyPhone && (
                    <p className="text-amber-800 flex items-center gap-1">
                      <Phone size={14} /> {selectedClient.emergencyPhone}
                    </p>
                  )}
                </div>
              </div>
            )}

            {selectedClient.notes && (
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Notes</p>
                <p className="text-slate-700">{selectedClient.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Missing Award icon - add to imports
  const Award = ({ className, size }: { className?: string; size?: number }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="8" r="6"></circle>
      <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"></path>
    </svg>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header - RENAMED TO REFERRAL MANAGEMENT */}
      <div className="bg-gradient-to-r from-teal-700 to-teal-800 text-white px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-3">
                <Send size={28} /> Referral Management
              </h1>
              <p className="text-teal-200 text-sm">Manage clients, notes, and referrals</p>
            </div>
          </div>
          <button onClick={() => { loadDashboard(); loadClients(); loadNotes(); loadReferrals(); }}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors">
            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
            <span className="text-sm font-medium">Refresh</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-1 overflow-x-auto py-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id as TabType); setSearchQuery(''); }}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? 'bg-teal-100 text-teal-700'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content - NO ATTENDANCE */}
      <div className="max-w-6xl mx-auto p-6">
        {isLoading && activeTab === 'dashboard' && !dashboardStats ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw size={32} className="animate-spin text-teal-600" />
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'clients' && renderClients()}
            {activeTab === 'notes' && renderNotes()}
            {activeTab === 'referrals' && renderReferrals()}
          </>
        )}
      </div>

      {/* Modals - NO ATTENDANCE */}
      {showAddClient && renderAddClientModal()}
      {showAddNote && renderAddNoteModal()}
      {showAddReferral && renderAddReferralModal()}
      {selectedClient && renderClientDetailModal()}
    </div>
  );
};

export default CaseManagerDataEntry;
