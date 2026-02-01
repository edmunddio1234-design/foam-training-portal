import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft, Users, Briefcase, Building2, Phone, Calendar,
  Plus, Search, RefreshCw, CheckCircle, XCircle, Clock, AlertCircle,
  ChevronDown, ChevronUp, Edit3, Trash2, Save, X, TrendingUp,
  UserPlus, ClipboardList, Heart, ExternalLink, BarChart3
} from 'lucide-react';

const API_BASE_URL = 'https://foamla-backend-2.onrender.com';

// Type definitions
interface PFBClient {
  id?: string;
  name: string;
  phone: string;
  dateOfLastContact: string;
  method: string;
  notes: string;
  needsFollowUp: boolean;
  status?: 'active' | 'inactive' | 'completed';
  servicesNeeded?: string[];
  dateEnrolled?: string;
}

interface WFDClient {
  id?: string;
  name: string;
  phone: string;
  dateOfLastContact: string;
  method: string;
  answer: 'YES' | 'NO' | 'PENDING';
  status?: 'active' | 'employed' | 'searching' | 'inactive';
  employer?: string;
  position?: string;
  dateEnrolled?: string;
}

type TabType = 'dashboard' | 'pfb' | 'wfd';
type ModalType = 'add-pfb' | 'add-wfd' | 'edit-pfb' | 'edit-wfd' | null;

interface ProgramManagementProps {
  onClose: () => void;
}

const SERVICE_OPTIONS = [
  'Housing Assistance', 'Legal Assistance', 'Food Assistance', 'Transportation',
  'Mental Health Resources', 'Employment Support', 'Childcare Assistance',
  'Financial Literacy', 'Co-Parenting Support', 'Education/GED', 'Utility Assistance',
  'Clothing/Work Attire', 'Medical/Healthcare', 'Substance Abuse Support'
];

const CONTACT_METHODS = ['Call', 'Text', 'In-Person', 'Email', 'Video Call'];
const WFD_STATUSES = ['active', 'employed', 'searching', 'inactive'];
const PFB_STATUSES = ['active', 'inactive', 'completed'];

const ProgramManagement: React.FC<ProgramManagementProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [pfbClients, setPfbClients] = useState<PFBClient[]>([]);
  const [wfdClients, setWfdClients] = useState<WFDClient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [modalType, setModalType] = useState<ModalType>(null);
  const [editingClient, setEditingClient] = useState<PFBClient | WFDClient | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const [pfbForm, setPfbForm] = useState<PFBClient>({
    name: '', phone: '', dateOfLastContact: new Date().toISOString().split('T')[0],
    method: 'Call', notes: '', needsFollowUp: true, status: 'active', servicesNeeded: [], dateEnrolled: new Date().toISOString().split('T')[0]
  });

  const [wfdForm, setWfdForm] = useState<WFDClient>({
    name: '', phone: '', dateOfLastContact: new Date().toISOString().split('T')[0],
    method: 'Call', answer: 'PENDING', status: 'active', employer: '', position: '', dateEnrolled: new Date().toISOString().split('T')[0]
  });

  useEffect(() => { loadAllData(); }, []);

  const loadAllData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [pfbRes, wfdRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/programs/pfb`),
        fetch(`${API_BASE_URL}/api/programs/wfd`)
      ]);
      if (pfbRes.ok) {
        const pfbData = await pfbRes.json();
        if (pfbData.success && Array.isArray(pfbData.data)) setPfbClients(pfbData.data);
      } else { setPfbClients(getSamplePFBData()); }
      if (wfdRes.ok) {
        const wfdData = await wfdRes.json();
        if (wfdData.success && Array.isArray(wfdData.data)) setWfdClients(wfdData.data);
      } else { setWfdClients(getSampleWFDData()); }
    } catch (err: any) {
      setPfbClients(getSamplePFBData());
      setWfdClients(getSampleWFDData());
    } finally { setIsLoading(false); }
  };

  const getSamplePFBData = (): PFBClient[] => [
    { id: 'pfb-1', name: 'Adrian Churchill', phone: '(225) 620-9467', dateOfLastContact: '2025-12-01', method: 'Call', notes: 'housing assistance- info sent', needsFollowUp: true, status: 'active', servicesNeeded: ['Housing Assistance'], dateEnrolled: '2025-11-15' },
    { id: 'pfb-2', name: 'Anthony "Tony" Morris', phone: '(225) 910-2675', dateOfLastContact: '2026-01-27', method: 'Call', notes: 'housing assistance-info sent', needsFollowUp: true, status: 'active', servicesNeeded: ['Housing Assistance'], dateEnrolled: '2026-01-10' },
    { id: 'pfb-3', name: 'Brandon Springer', phone: '(214) 563-9443', dateOfLastContact: '2026-01-27', method: 'Call', notes: 'housing assistance-info sent', needsFollowUp: true, status: 'active', servicesNeeded: ['Housing Assistance'], dateEnrolled: '2026-01-05' },
    { id: 'pfb-4', name: 'Bryan Comeaux', phone: '(225) 276-3553', dateOfLastContact: '2026-01-27', method: 'Call', notes: 'mental health resources - info sent', needsFollowUp: true, status: 'active', servicesNeeded: ['Mental Health Resources'], dateEnrolled: '2026-01-08' },
    { id: 'pfb-5', name: 'Carlese Baker', phone: '(225) 954-6458', dateOfLastContact: '2026-01-27', method: 'Call', notes: 'food and rental assistance- info sent', needsFollowUp: true, status: 'active', servicesNeeded: ['Food Assistance', 'Housing Assistance'], dateEnrolled: '2026-01-12' },
    { id: 'pfb-6', name: 'Jocobie James', phone: '(225) 427-4538', dateOfLastContact: '2026-01-22', method: 'Call', notes: 'legal assistance- info sent (Paige C.)', needsFollowUp: true, status: 'active', servicesNeeded: ['Legal Assistance'], dateEnrolled: '2026-01-03' },
    { id: 'pfb-7', name: 'JaQuan Johnson', phone: '(225) 253-0338', dateOfLastContact: '2026-01-13', method: 'Call', notes: 'housing & transportation (per POC)', needsFollowUp: true, status: 'active', servicesNeeded: ['Housing Assistance', 'Transportation'], dateEnrolled: '2025-12-20' },
    { id: 'pfb-8', name: 'Jarius Chambers', phone: '(225) 410-1844', dateOfLastContact: '2025-01-16', method: 'Call', notes: 'legal assistance- info sent (Southeast Legal Services)', needsFollowUp: true, status: 'active', servicesNeeded: ['Legal Assistance'], dateEnrolled: '2025-01-10' },
    { id: 'pfb-9', name: 'James Smith', phone: '(504) 578-2030', dateOfLastContact: '2026-12-16', method: 'Call', notes: 'legal assistance', needsFollowUp: true, status: 'active', servicesNeeded: ['Legal Assistance'], dateEnrolled: '2026-12-01' },
    { id: 'pfb-10', name: 'Jarvious Mitchell', phone: '(225) 931-2448', dateOfLastContact: '2025-07-29', method: 'Call', notes: 'legal assistance, court scheduled Aug 2025, help from Paige C.', needsFollowUp: true, status: 'active', servicesNeeded: ['Legal Assistance'], dateEnrolled: '2025-06-15' },
    { id: 'pfb-11', name: 'Jermaine Taylor', phone: '(225) 364-5095', dateOfLastContact: '2025-01-22', method: 'Call', notes: 'transportation assistance- new bike', needsFollowUp: true, status: 'active', servicesNeeded: ['Transportation'], dateEnrolled: '2025-01-05' },
    { id: 'pfb-12', name: 'John Smith', phone: '(225) 321-1234', dateOfLastContact: '2025-01-14', method: 'Call', notes: 'housing & legal assistance', needsFollowUp: true, status: 'active', servicesNeeded: ['Housing Assistance', 'Legal Assistance'], dateEnrolled: '2025-01-14' },
    { id: 'pfb-13', name: 'Korderro Peevy', phone: '(918) 499-0904', dateOfLastContact: '2025-12-07', method: 'Call', notes: 'housing, food stamps, medicaid, childcare assistance', needsFollowUp: true, status: 'active', servicesNeeded: ['Housing Assistance', 'Food Assistance', 'Childcare Assistance'], dateEnrolled: '2025-11-20' },
    { id: 'pfb-14', name: 'Michael Sanders', phone: '(225) 960-0185', dateOfLastContact: '2025-09-08', method: 'Text', notes: 'childcare assistance, ABA/Speech therapy, dietician, daycare services', needsFollowUp: true, status: 'active', servicesNeeded: ['Childcare Assistance', 'Medical/Healthcare'], dateEnrolled: '2025-08-01' },
    { id: 'pfb-15', name: 'Ronald Brown', phone: '(225) 436-6852', dateOfLastContact: '2025-07-29', method: 'Call', notes: 'therapy, co-parenting class, food, clothing, housing', needsFollowUp: true, status: 'active', servicesNeeded: ['Mental Health Resources', 'Co-Parenting Support', 'Food Assistance', 'Housing Assistance'], dateEnrolled: '2025-07-01' },
    { id: 'pfb-16', name: 'Tyler Harlen', phone: '(337) 516-6003', dateOfLastContact: '2026-01-15', method: 'Call', notes: 'food assistance', needsFollowUp: true, status: 'active', servicesNeeded: ['Food Assistance'], dateEnrolled: '2026-01-10' },
    { id: 'pfb-17', name: 'Xavier Fields', phone: '(225) 521-3641', dateOfLastContact: '2026-01-13', method: 'Call', notes: 'housing', needsFollowUp: true, status: 'active', servicesNeeded: ['Housing Assistance'], dateEnrolled: '2026-01-05' }
  ];

  const getSampleWFDData = (): WFDClient[] => [
    { id: 'wfd-1', name: 'Bryan Comeaux', phone: '(225) 276-3553', dateOfLastContact: '2026-01-22', method: 'Text', answer: 'YES', status: 'searching', dateEnrolled: '2026-01-15' },
    { id: 'wfd-2', name: 'Jocobie James', phone: '(225) 427-4538', dateOfLastContact: '2026-01-30', method: 'Text', answer: 'YES', status: 'searching', dateEnrolled: '2026-01-20' },
    { id: 'wfd-3', name: 'Trevon Williams', phone: '(225) 266-1310', dateOfLastContact: '2026-01-29', method: 'Text', answer: 'YES', status: 'active', dateEnrolled: '2026-01-18' },
    { id: 'wfd-4', name: 'Nick Cote', phone: '(225) 892-8879', dateOfLastContact: '2026-01-30', method: 'Text', answer: 'NO', status: 'inactive', dateEnrolled: '2026-01-22' },
    { id: 'wfd-5', name: 'Eric Johnson', phone: '(225) 910-2675', dateOfLastContact: '2026-01-30', method: 'Text', answer: 'NO', status: 'inactive', dateEnrolled: '2026-01-25' },
    { id: 'wfd-6', name: 'Carl Vincent', phone: '(225) 921-6698', dateOfLastContact: '2026-01-29', method: 'Text', answer: 'YES', status: 'employed', employer: 'Local Construction Co.', position: 'General Laborer', dateEnrolled: '2026-01-10' }
  ];

  useEffect(() => { if (success) { const t = setTimeout(() => setSuccess(null), 3000); return () => clearTimeout(t); } }, [success]);
  useEffect(() => { if (error) { const t = setTimeout(() => setError(null), 5000); return () => clearTimeout(t); } }, [error]);

  const stats = useMemo(() => {
    const pfbActive = pfbClients.filter(c => c.status === 'active').length;
    const pfbFollowUp = pfbClients.filter(c => c.needsFollowUp).length;
    const wfdActive = wfdClients.filter(c => c.status === 'active' || c.status === 'searching').length;
    const wfdEmployed = wfdClients.filter(c => c.status === 'employed').length;
    const wfdResponded = wfdClients.filter(c => c.answer === 'YES').length;
    const serviceBreakdown: Record<string, number> = {};
    pfbClients.forEach(client => { (client.servicesNeeded || []).forEach(service => { serviceBreakdown[service] = (serviceBreakdown[service] || 0) + 1; }); });
    return { pfb: { total: pfbClients.length, active: pfbActive, followUp: pfbFollowUp, serviceBreakdown }, wfd: { total: wfdClients.length, active: wfdActive, employed: wfdEmployed, responded: wfdResponded } };
  }, [pfbClients, wfdClients]);

  const filteredPFB = useMemo(() => pfbClients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase()) || client.phone.includes(searchQuery) || client.notes.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || client.status === filterStatus;
    return matchesSearch && matchesFilter;
  }), [pfbClients, searchQuery, filterStatus]);

  const filteredWFD = useMemo(() => wfdClients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase()) || client.phone.includes(searchQuery);
    const matchesFilter = filterStatus === 'all' || client.status === filterStatus;
    return matchesSearch && matchesFilter;
  }), [wfdClients, searchQuery, filterStatus]);

  const toggleRowExpand = (id: string) => { setExpandedRows(prev => { const newSet = new Set(prev); if (newSet.has(id)) newSet.delete(id); else newSet.add(id); return newSet; }); };

  const handleAddPFB = async () => {
    if (!pfbForm.name.trim()) { setError('Name is required'); return; }
    setIsSaving(true);
    try {
      const newClient: PFBClient = { ...pfbForm, id: `pfb-${Date.now()}` };
      const response = await fetch(`${API_BASE_URL}/api/programs/pfb`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newClient) });
      if (response.ok) { const data = await response.json(); if (data.success) setPfbClients(prev => [...prev, data.data || newClient]); }
      else { setPfbClients(prev => [...prev, newClient]); }
      setSuccess(`${pfbForm.name} added to Project Family BUILD`);
      setPfbForm({ name: '', phone: '', dateOfLastContact: new Date().toISOString().split('T')[0], method: 'Call', notes: '', needsFollowUp: true, status: 'active', servicesNeeded: [], dateEnrolled: new Date().toISOString().split('T')[0] });
      setModalType(null);
    } catch { const newClient: PFBClient = { ...pfbForm, id: `pfb-${Date.now()}` }; setPfbClients(prev => [...prev, newClient]); setSuccess(`${pfbForm.name} added (offline)`); setPfbForm({ name: '', phone: '', dateOfLastContact: new Date().toISOString().split('T')[0], method: 'Call', notes: '', needsFollowUp: true, status: 'active', servicesNeeded: [], dateEnrolled: new Date().toISOString().split('T')[0] }); setModalType(null); }
    finally { setIsSaving(false); }
  };

  const handleAddWFD = async () => {
    if (!wfdForm.name.trim()) { setError('Name is required'); return; }
    setIsSaving(true);
    try {
      const newClient: WFDClient = { ...wfdForm, id: `wfd-${Date.now()}` };
      const response = await fetch(`${API_BASE_URL}/api/programs/wfd`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newClient) });
      if (response.ok) { const data = await response.json(); if (data.success) setWfdClients(prev => [...prev, data.data || newClient]); }
      else { setWfdClients(prev => [...prev, newClient]); }
      setSuccess(`${wfdForm.name} added to Workforce Development`);
      setWfdForm({ name: '', phone: '', dateOfLastContact: new Date().toISOString().split('T')[0], method: 'Call', answer: 'PENDING', status: 'active', employer: '', position: '', dateEnrolled: new Date().toISOString().split('T')[0] });
      setModalType(null);
    } catch { const newClient: WFDClient = { ...wfdForm, id: `wfd-${Date.now()}` }; setWfdClients(prev => [...prev, newClient]); setSuccess(`${wfdForm.name} added (offline)`); setWfdForm({ name: '', phone: '', dateOfLastContact: new Date().toISOString().split('T')[0], method: 'Call', answer: 'PENDING', status: 'active', employer: '', position: '', dateEnrolled: new Date().toISOString().split('T')[0] }); setModalType(null); }
    finally { setIsSaving(false); }
  };

  const handleDeletePFB = (id: string) => { if (window.confirm('Remove this client from Project Family BUILD?')) { setPfbClients(prev => prev.filter(c => c.id !== id)); setSuccess('Client removed'); } };
  const handleDeleteWFD = (id: string) => { if (window.confirm('Remove this client from Workforce Development?')) { setWfdClients(prev => prev.filter(c => c.id !== id)); setSuccess('Client removed'); } };

  const formatDate = (dateStr: string) => { try { return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); } catch { return dateStr; } };
  const formatPhone = (phone: string) => { const cleaned = phone.replace(/\D/g, ''); if (cleaned.length === 10) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`; return phone; };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'employed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'searching': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'completed': return 'bg-[#0F2C5C]/10 text-[#0F2C5C] border-[#0F2C5C]/20';
      case 'inactive': return 'bg-slate-100 text-slate-600 border-slate-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const getAnswerIcon = (answer: string) => {
    switch (answer) {
      case 'YES': return <CheckCircle size={16} className="text-emerald-500" />;
      case 'NO': return <XCircle size={16} className="text-red-500" />;
      default: return <Clock size={16} className="text-amber-500" />;
    }
  };

  // DASHBOARD
  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-[#0F2C5C] rounded-xl flex items-center justify-center"><Building2 size={24} className="text-white" /></div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">PFB</span>
          </div>
          <div className="text-3xl font-bold text-slate-800">{stats.pfb.total}</div>
          <div className="text-sm text-slate-500">Project Family BUILD</div>
          <div className="mt-2 text-xs text-slate-400">{stats.pfb.active} active • {stats.pfb.followUp} follow-up</div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-[#0F2C5C] rounded-xl flex items-center justify-center"><Briefcase size={24} className="text-white" /></div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">WFD</span>
          </div>
          <div className="text-3xl font-bold text-slate-800">{stats.wfd.total}</div>
          <div className="text-sm text-slate-500">Workforce Development</div>
          <div className="mt-2 text-xs text-slate-400">{stats.wfd.active} active • {stats.wfd.employed} employed</div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center"><TrendingUp size={24} className="text-white" /></div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">EMPLOYED</span>
          </div>
          <div className="text-3xl font-bold text-slate-800">{stats.wfd.employed}</div>
          <div className="text-sm text-slate-500">Job Placements</div>
          <div className="mt-2 text-xs text-slate-400">{stats.wfd.total > 0 ? Math.round((stats.wfd.employed / stats.wfd.total) * 100) : 0}% rate</div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-[#0F2C5C] rounded-xl flex items-center justify-center"><Heart size={24} className="text-white" /></div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">TOTAL</span>
          </div>
          <div className="text-3xl font-bold text-slate-800">{stats.pfb.total + stats.wfd.total}</div>
          <div className="text-sm text-slate-500">Fathers Served</div>
          <div className="mt-2 text-xs text-slate-400">All programs</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 flex items-center justify-between" style={{ background: '#0F2C5C' }}>
            <div className="flex items-center gap-3"><Building2 className="text-white" size={24} /><div><h3 className="text-white font-bold text-lg">Project Family BUILD</h3><p className="text-white/70 text-sm">Case Management</p></div></div>
            <button onClick={() => { setActiveTab('pfb'); setModalType('add-pfb'); }} className="px-4 py-2 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-colors flex items-center gap-2 text-sm font-medium"><UserPlus size={16} /> Add</button>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4"><span className="text-slate-600 text-sm font-medium">Services Provided</span><span className="text-slate-500 text-xs">{Object.keys(stats.pfb.serviceBreakdown).length} categories</span></div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {Object.entries(stats.pfb.serviceBreakdown).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([service, count]) => (
                <div key={service} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl"><span className="text-sm text-slate-700">{service}</span><span className="text-sm font-bold text-[#0F2C5C]">{count}</span></div>
              ))}
            </div>
            <button onClick={() => setActiveTab('pfb')} className="mt-4 w-full py-3 bg-[#0F2C5C]/5 text-[#0F2C5C] rounded-xl font-medium hover:bg-[#0F2C5C]/10 transition-colors">View All {stats.pfb.total} Clients →</button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 flex items-center justify-between" style={{ background: '#0F2C5C' }}>
            <div className="flex items-center gap-3"><Briefcase className="text-white" size={24} /><div><h3 className="text-white font-bold text-lg">Workforce Development</h3><p className="text-white/70 text-sm">Employment Support</p></div></div>
            <button onClick={() => { setActiveTab('wfd'); setModalType('add-wfd'); }} className="px-4 py-2 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-colors flex items-center gap-2 text-sm font-medium"><UserPlus size={16} /> Add</button>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-4 bg-emerald-50 rounded-xl border border-emerald-100"><div className="text-2xl font-bold text-emerald-600">{stats.wfd.employed}</div><div className="text-xs text-slate-500">Employed</div></div>
              <div className="text-center p-4 bg-amber-50 rounded-xl border border-amber-100"><div className="text-2xl font-bold text-amber-600">{stats.wfd.active}</div><div className="text-xs text-slate-500">Searching</div></div>
            </div>
            <div className="p-4 bg-[#0F2C5C]/5 rounded-xl mb-4">
              <div className="flex items-center justify-between"><span className="text-sm text-slate-600">Response Rate</span><span className="text-lg font-bold text-[#0F2C5C]">{stats.wfd.total > 0 ? Math.round((stats.wfd.responded / stats.wfd.total) * 100) : 0}%</span></div>
              <div className="mt-2 h-2 bg-white rounded-full overflow-hidden"><div className="h-full bg-[#0F2C5C] rounded-full" style={{ width: `${stats.wfd.total > 0 ? (stats.wfd.responded / stats.wfd.total) * 100 : 0}%` }} /></div>
            </div>
            <button onClick={() => setActiveTab('wfd')} className="w-full py-3 bg-[#0F2C5C]/5 text-[#0F2C5C] rounded-xl font-medium hover:bg-[#0F2C5C]/10 transition-colors">View All {stats.wfd.total} Clients →</button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between"><h3 className="font-bold text-slate-800 flex items-center gap-2"><Clock size={20} className="text-[#0F2C5C]" /> Recent Activity</h3><span className="text-xs text-slate-500">Last 5 contacts</span></div>
        <div className="divide-y divide-slate-100">
          {[...pfbClients, ...wfdClients].sort((a, b) => new Date(b.dateOfLastContact).getTime() - new Date(a.dateOfLastContact).getTime()).slice(0, 5).map((client, i) => {
            const isPFB = 'needsFollowUp' in client;
            return (
              <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#0F2C5C]/10 text-[#0F2C5C]">{isPFB ? <Building2 size={18} /> : <Briefcase size={18} />}</div>
                  <div><div className="font-medium text-slate-800">{client.name}</div><div className="text-xs text-slate-500">{isPFB ? 'PFB' : 'WFD'} • {client.method}</div></div>
                </div>
                <div className="text-right"><div className="text-sm text-slate-600">{formatDate(client.dateOfLastContact)}</div><div className="text-xs text-slate-400">{formatPhone(client.phone)}</div></div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <button onClick={() => { setActiveTab('pfb'); setModalType('add-pfb'); }} className="p-4 bg-white border border-slate-200 rounded-xl hover:border-[#0F2C5C]/30 hover:bg-[#0F2C5C]/5 transition-all group"><UserPlus size={24} className="text-[#0F2C5C] mb-2" /><div className="font-medium text-slate-800">Add to PFB</div><div className="text-xs text-slate-500">Case management</div></button>
        <button onClick={() => { setActiveTab('wfd'); setModalType('add-wfd'); }} className="p-4 bg-white border border-slate-200 rounded-xl hover:border-[#0F2C5C]/30 hover:bg-[#0F2C5C]/5 transition-all group"><UserPlus size={24} className="text-[#0F2C5C] mb-2" /><div className="font-medium text-slate-800">Add to WFD</div><div className="text-xs text-slate-500">Workforce client</div></button>
        <a href="https://docs.google.com/spreadsheets/d/" target="_blank" rel="noopener noreferrer" className="p-4 bg-white border border-slate-200 rounded-xl hover:border-[#0F2C5C]/30 hover:bg-[#0F2C5C]/5 transition-all group"><ExternalLink size={24} className="text-[#0F2C5C] mb-2" /><div className="font-medium text-slate-800">Open Sheet</div><div className="text-xs text-slate-500">Google Sheets</div></a>
        <button onClick={loadAllData} className="p-4 bg-white border border-slate-200 rounded-xl hover:border-[#0F2C5C]/30 hover:bg-[#0F2C5C]/5 transition-all group"><RefreshCw size={24} className="text-[#0F2C5C] mb-2" /><div className="font-medium text-slate-800">Refresh</div><div className="text-xs text-slate-500">Sync data</div></button>
      </div>
    </div>
  );

  // PFB LIST
  const renderPFBList = () => (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div><h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3"><Building2 className="text-[#0F2C5C]" size={28} />Project Family BUILD</h2><p className="text-slate-500 text-sm mt-1">{stats.pfb.total} fathers • {stats.pfb.active} active</p></div>
        <div className="flex items-center gap-3">
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0F2C5C] focus:border-[#0F2C5C] outline-none w-64" /></div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0F2C5C] outline-none"><option value="all">All Status</option>{PFB_STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}</select>
          <button onClick={() => setModalType('add-pfb')} className="px-4 py-2 bg-[#0F2C5C] text-white rounded-xl hover:bg-[#0F2C5C]/90 transition-colors flex items-center gap-2 font-medium"><Plus size={18} /> Add Client</button>
        </div>
      </div>
      {filteredPFB.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200"><Users size={48} className="text-slate-300 mx-auto mb-4" /><p className="text-slate-500">No clients found</p><button onClick={() => setModalType('add-pfb')} className="mt-4 text-[#0F2C5C] font-medium hover:underline">Add first client</button></div>
      ) : (
        <div className="space-y-3">
          {filteredPFB.map((client) => {
            const isExpanded = expandedRows.has(client.id || '');
            return (
              <div key={client.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:border-[#0F2C5C]/30 transition-colors">
                <div className="px-5 py-4 flex items-center justify-between cursor-pointer" onClick={() => toggleRowExpand(client.id || '')}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#0F2C5C]/10 rounded-full flex items-center justify-center text-[#0F2C5C] font-bold text-lg">{client.name.charAt(0)}</div>
                    <div><div className="font-semibold text-slate-800 flex items-center gap-2">{client.name}{client.needsFollowUp && <AlertCircle size={14} className="text-amber-500" />}</div><div className="text-sm text-slate-500 flex items-center gap-3"><span className="flex items-center gap-1"><Phone size={12} /> {formatPhone(client.phone)}</span><span className="flex items-center gap-1"><Calendar size={12} /> {formatDate(client.dateOfLastContact)}</span></div></div>
                  </div>
                  <div className="flex items-center gap-3"><span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(client.status || 'active')}`}>{client.status?.toUpperCase() || 'ACTIVE'}</span>{isExpanded ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}</div>
                </div>
                {isExpanded && (
                  <div className="px-5 py-4 bg-slate-50 border-t border-slate-200">
                    <div className="grid lg:grid-cols-2 gap-4">
                      <div><label className="text-xs text-slate-500 uppercase tracking-wider">Services Needed</label><div className="flex flex-wrap gap-2 mt-2">{(client.servicesNeeded || []).map((service, i) => (<span key={i} className="px-2 py-1 bg-[#0F2C5C]/10 text-[#0F2C5C] rounded-lg text-xs">{service}</span>))}{(!client.servicesNeeded || client.servicesNeeded.length === 0) && <span className="text-slate-400 text-sm">None recorded</span>}</div></div>
                      <div><label className="text-xs text-slate-500 uppercase tracking-wider">Notes</label><p className="text-sm text-slate-700 mt-2">{client.notes || 'No notes'}</p></div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between">
                      <div className="text-xs text-slate-500">Enrolled: {client.dateEnrolled ? formatDate(client.dateEnrolled) : 'Unknown'} • {client.method}</div>
                      <div className="flex items-center gap-2"><button onClick={(e) => { e.stopPropagation(); setEditingClient(client); setModalType('edit-pfb'); }} className="p-2 text-slate-500 hover:text-[#0F2C5C] hover:bg-[#0F2C5C]/10 rounded-lg transition-colors"><Edit3 size={16} /></button><button onClick={(e) => { e.stopPropagation(); handleDeletePFB(client.id || ''); }} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button></div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // WFD LIST
  const renderWFDList = () => (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div><h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3"><Briefcase className="text-[#0F2C5C]" size={28} />Workforce Development</h2><p className="text-slate-500 text-sm mt-1">{stats.wfd.total} fathers • {stats.wfd.employed} employed</p></div>
        <div className="flex items-center gap-3">
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0F2C5C] outline-none w-64" /></div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0F2C5C] outline-none"><option value="all">All Status</option>{WFD_STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}</select>
          <button onClick={() => setModalType('add-wfd')} className="px-4 py-2 bg-[#0F2C5C] text-white rounded-xl hover:bg-[#0F2C5C]/90 transition-colors flex items-center gap-2 font-medium"><Plus size={18} /> Add Client</button>
        </div>
      </div>
      {filteredWFD.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200"><Users size={48} className="text-slate-300 mx-auto mb-4" /><p className="text-slate-500">No clients found</p><button onClick={() => setModalType('add-wfd')} className="mt-4 text-[#0F2C5C] font-medium hover:underline">Add first client</button></div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead><tr style={{ background: '#0F2C5C' }}><th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Name</th><th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Phone</th><th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Last Contact</th><th className="px-4 py-3 text-center text-xs font-semibold text-white uppercase">Response</th><th className="px-4 py-3 text-center text-xs font-semibold text-white uppercase">Status</th><th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Employment</th><th className="px-4 py-3 text-center text-xs font-semibold text-white uppercase">Actions</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {filteredWFD.map((client) => (
                <tr key={client.id} className="hover:bg-[#0F2C5C]/5 transition-colors">
                  <td className="px-4 py-3"><div className="flex items-center gap-3"><div className="w-8 h-8 bg-[#0F2C5C]/10 rounded-full flex items-center justify-center text-[#0F2C5C] font-bold text-sm">{client.name.charAt(0)}</div><span className="font-medium text-slate-800">{client.name}</span></div></td>
                  <td className="px-4 py-3 text-sm text-slate-600">{formatPhone(client.phone)}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{formatDate(client.dateOfLastContact)}</td>
                  <td className="px-4 py-3 text-center"><div className="flex items-center justify-center gap-1">{getAnswerIcon(client.answer)}<span className="text-xs text-slate-500">{client.answer}</span></div></td>
                  <td className="px-4 py-3 text-center"><span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(client.status || 'active')}`}>{client.status?.toUpperCase() || 'ACTIVE'}</span></td>
                  <td className="px-4 py-3 text-sm">{client.employer ? <div><div className="text-slate-800 font-medium">{client.employer}</div><div className="text-xs text-slate-500">{client.position}</div></div> : <span className="text-slate-400">-</span>}</td>
                  <td className="px-4 py-3 text-center"><div className="flex items-center justify-center gap-1"><button onClick={() => { setEditingClient(client); setModalType('edit-wfd'); }} className="p-1.5 text-slate-500 hover:text-[#0F2C5C] hover:bg-[#0F2C5C]/10 rounded-lg transition-colors"><Edit3 size={14} /></button><button onClick={() => handleDeleteWFD(client.id || '')} className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  // PFB MODAL
  const renderPFBModal = () => {
    const isEdit = modalType === 'edit-pfb';
    const form = isEdit && editingClient ? (editingClient as PFBClient) : pfbForm;
    const setForm = isEdit ? (data: PFBClient) => setEditingClient(data) : setPfbForm;
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setModalType(null)}>
        <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
          <div className="sticky top-0 px-6 py-4 flex items-center justify-between" style={{ background: '#0F2C5C' }}><div className="flex items-center gap-3"><Building2 className="text-white" size={24} /><h2 className="text-xl font-bold text-white">{isEdit ? 'Edit' : 'Add'} PFB Client</h2></div><button onClick={() => setModalType(null)} className="p-2 hover:bg-white/20 rounded-lg transition-colors"><X className="text-white" size={20} /></button></div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label><input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0F2C5C] outline-none" placeholder="Enter name" /></div><div><label className="block text-sm font-medium text-slate-700 mb-1">Phone</label><input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0F2C5C] outline-none" placeholder="(225) 000-0000" /></div></div>
            <div className="grid grid-cols-3 gap-4"><div><label className="block text-sm font-medium text-slate-700 mb-1">Enrolled</label><input type="date" value={form.dateEnrolled} onChange={(e) => setForm({ ...form, dateEnrolled: e.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0F2C5C] outline-none" /></div><div><label className="block text-sm font-medium text-slate-700 mb-1">Last Contact</label><input type="date" value={form.dateOfLastContact} onChange={(e) => setForm({ ...form, dateOfLastContact: e.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0F2C5C] outline-none" /></div><div><label className="block text-sm font-medium text-slate-700 mb-1">Method</label><select value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0F2C5C] outline-none">{CONTACT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}</select></div></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Services Needed</label><div className="grid grid-cols-3 gap-2 p-4 bg-slate-50 rounded-xl max-h-40 overflow-y-auto">{SERVICE_OPTIONS.map((service) => (<label key={service} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-white p-1 rounded"><input type="checkbox" checked={(form.servicesNeeded || []).includes(service)} onChange={(e) => { const services = form.servicesNeeded || []; if (e.target.checked) setForm({ ...form, servicesNeeded: [...services, service] }); else setForm({ ...form, servicesNeeded: services.filter(s => s !== service) }); }} className="rounded text-[#0F2C5C] focus:ring-[#0F2C5C]" /><span className="text-slate-700">{service}</span></label>))}</div></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Notes</label><textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0F2C5C] outline-none resize-none" placeholder="Notes..." /></div>
            <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-slate-700 mb-1">Status</label><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as any })} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0F2C5C] outline-none">{PFB_STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}</select></div><div className="flex items-center pt-6"><label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={form.needsFollowUp} onChange={(e) => setForm({ ...form, needsFollowUp: e.target.checked })} className="w-5 h-5 rounded text-[#0F2C5C] focus:ring-[#0F2C5C]" /><span className="text-slate-700 font-medium">Needs Follow-up</span></label></div></div>
          </div>
          <div className="sticky bottom-0 bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end gap-3"><button onClick={() => setModalType(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-xl transition-colors">Cancel</button><button onClick={handleAddPFB} disabled={isSaving} className="px-6 py-2 bg-[#0F2C5C] text-white rounded-xl hover:bg-[#0F2C5C]/90 transition-colors flex items-center gap-2 disabled:opacity-50">{isSaving ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}{isEdit ? 'Save' : 'Add Client'}</button></div>
        </div>
      </div>
    );
  };

  // WFD MODAL
  const renderWFDModal = () => {
    const isEdit = modalType === 'edit-wfd';
    const form = isEdit && editingClient ? (editingClient as WFDClient) : wfdForm;
    const setForm = isEdit ? (data: WFDClient) => setEditingClient(data) : setWfdForm;
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setModalType(null)}>
        <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
          <div className="sticky top-0 px-6 py-4 flex items-center justify-between" style={{ background: '#0F2C5C' }}><div className="flex items-center gap-3"><Briefcase className="text-white" size={24} /><h2 className="text-xl font-bold text-white">{isEdit ? 'Edit' : 'Add'} WFD Client</h2></div><button onClick={() => setModalType(null)} className="p-2 hover:bg-white/20 rounded-lg transition-colors"><X className="text-white" size={20} /></button></div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label><input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0F2C5C] outline-none" placeholder="Enter name" /></div><div><label className="block text-sm font-medium text-slate-700 mb-1">Phone</label><input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0F2C5C] outline-none" placeholder="(225) 000-0000" /></div></div>
            <div className="grid grid-cols-3 gap-4"><div><label className="block text-sm font-medium text-slate-700 mb-1">Enrolled</label><input type="date" value={form.dateEnrolled} onChange={(e) => setForm({ ...form, dateEnrolled: e.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0F2C5C] outline-none" /></div><div><label className="block text-sm font-medium text-slate-700 mb-1">Last Contact</label><input type="date" value={form.dateOfLastContact} onChange={(e) => setForm({ ...form, dateOfLastContact: e.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0F2C5C] outline-none" /></div><div><label className="block text-sm font-medium text-slate-700 mb-1">Method</label><select value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0F2C5C] outline-none">{CONTACT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}</select></div></div>
            <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-slate-700 mb-1">Response</label><select value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value as any })} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0F2C5C] outline-none"><option value="PENDING">Pending</option><option value="YES">Yes</option><option value="NO">No</option></select></div><div><label className="block text-sm font-medium text-slate-700 mb-1">Status</label><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as any })} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0F2C5C] outline-none">{WFD_STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}</select></div></div>
            {form.status === 'employed' && (<div className="grid grid-cols-2 gap-4 p-4 bg-emerald-50 rounded-xl border border-emerald-200"><div><label className="block text-sm font-medium text-emerald-700 mb-1">Employer</label><input type="text" value={form.employer || ''} onChange={(e) => setForm({ ...form, employer: e.target.value })} className="w-full px-4 py-2 border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Company" /></div><div><label className="block text-sm font-medium text-emerald-700 mb-1">Position</label><input type="text" value={form.position || ''} onChange={(e) => setForm({ ...form, position: e.target.value })} className="w-full px-4 py-2 border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Job title" /></div></div>)}
          </div>
          <div className="sticky bottom-0 bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end gap-3"><button onClick={() => setModalType(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-xl transition-colors">Cancel</button><button onClick={handleAddWFD} disabled={isSaving} className="px-6 py-2 bg-[#0F2C5C] text-white rounded-xl hover:bg-[#0F2C5C]/90 transition-colors flex items-center gap-2 disabled:opacity-50">{isSaving ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}{isEdit ? 'Save' : 'Add Client'}</button></div>
        </div>
      </div>
    );
  };

  // MAIN RENDER
  if (isLoading) return (<div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="text-center"><RefreshCw size={40} className="text-[#0F2C5C] animate-spin mx-auto mb-4" /><p className="text-slate-600">Loading...</p></div></div>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="text-white px-6 py-4" style={{ background: '#0F2C5C' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4"><button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors"><ArrowLeft size={24} /></button><div><h1 className="text-2xl font-bold flex items-center gap-3"><ClipboardList size={28} /> Program Management</h1><p className="text-white/70 text-sm">Project Family BUILD & Workforce Development</p></div></div>
          <button onClick={loadAllData} className="px-4 py-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors flex items-center gap-2 text-sm"><RefreshCw size={16} /> Refresh</button>
        </div>
      </div>
      <div className="border-b border-slate-200 bg-white sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1">
            {[{ id: 'dashboard', label: 'Dashboard', icon: BarChart3 }, { id: 'pfb', label: 'Project Family BUILD', icon: Building2 }, { id: 'wfd', label: 'Workforce Development', icon: Briefcase }].map((tab) => (
              <button key={tab.id} onClick={() => { setActiveTab(tab.id as TabType); setSearchQuery(''); setFilterStatus('all'); }} className={`flex items-center gap-2 px-5 py-4 text-sm font-medium transition-colors border-b-2 ${activeTab === tab.id ? 'border-[#0F2C5C] text-[#0F2C5C] bg-[#0F2C5C]/5' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}><tab.icon size={18} />{tab.label}{tab.id === 'pfb' && <span className="ml-1 px-2 py-0.5 bg-[#0F2C5C]/10 text-[#0F2C5C] rounded-full text-xs">{stats.pfb.total}</span>}{tab.id === 'wfd' && <span className="ml-1 px-2 py-0.5 bg-[#0F2C5C]/10 text-[#0F2C5C] rounded-full text-xs">{stats.wfd.total}</span>}</button>
            ))}
          </div>
        </div>
      </div>
      {error && <div className="max-w-7xl mx-auto px-6 mt-4"><div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center justify-between"><span className="flex items-center gap-2"><AlertCircle size={18} /> {error}</span><button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">✕</button></div></div>}
      {success && <div className="max-w-7xl mx-auto px-6 mt-4"><div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl flex items-center justify-between"><span className="flex items-center gap-2"><CheckCircle size={18} /> {success}</span><button onClick={() => setSuccess(null)} className="text-emerald-500 hover:text-emerald-700">✕</button></div></div>}
      <main className="max-w-7xl mx-auto px-6 py-6">{activeTab === 'dashboard' && renderDashboard()}{activeTab === 'pfb' && renderPFBList()}{activeTab === 'wfd' && renderWFDList()}</main>
      {(modalType === 'add-pfb' || modalType === 'edit-pfb') && renderPFBModal()}
      {(modalType === 'add-wfd' || modalType === 'edit-wfd') && renderWFDModal()}
    </div>
  );
};

export default ProgramManagement;
