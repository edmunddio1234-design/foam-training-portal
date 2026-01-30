import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, Users, Send, BarChart3,
  Plus, Search, X, Phone, Mail, MapPin,
  CheckCircle, Clock, RefreshCw,
  User, ArrowDownLeft, ArrowUpRight, Printer, Scale, Shield, Calendar, Home
} from 'lucide-react';

interface CaseManagerDataEntryProps {
  onClose: () => void;
}

// HIPAA Compliant - Case Notes removed
type TabType = 'dashboard' | 'clients' | 'referrals';
type ReferralSubTab = 'referred_in' | 'referred_out';

const API_BASE_URL = 'https://foamla-backend-2.onrender.com';

// 8 Resources aligned with tracker
const RESOURCE_TYPES = [
  'Employment/Workforce',
  'Housing',
  'Mental Health/Behavioral Health',
  'Legal Aid',
  'Food Assistance/Basic Needs',
  'Education/Training',
  'Healthcare/Medical',
  'Transportation'
];

// Partner organizations for referrals
const PARTNER_ORGANIZATIONS = [
  'Capital Area United Way',
  'EBR Housing Authority',
  'Workforce Commission',
  'Hope Ministries',
  'BR Bar Association - Pro Bono',
  'DCFS',
  'Family Services of Greater BR',
  'Capital Area Human Services',
  'LA Rehabilitative Services',
  '211 Louisiana',
  'Other'
];

// Referral sources (where clients come from)
const REFERRAL_SOURCES = [
  'Fatherhood Class',
  'Community Event',
  'Court Referral',
  'Partner Agency',
  'Self-Referral',
  'Family/Friend Referral',
  'DCFS',
  'Probation/Parole',
  'Other'
];

// Courts in East Baton Rouge Parish area
const COURTS = [
  '19th Judicial District Court',
  'East Baton Rouge Family Court',
  'Baton Rouge City Court',
  'East Baton Rouge Juvenile Court',
  'East Baton Rouge Drug Court',
  'East Baton Rouge Mental Health Court',
  'Louisiana 1st Circuit Court of Appeal',
  'Federal Middle District Court',
  'Other'
];

// Louisiana cities for dropdown
const LA_CITIES = [
  'Baton Rouge', 'New Orleans', 'Shreveport', 'Lafayette', 'Lake Charles',
  'Kenner', 'Bossier City', 'Monroe', 'Alexandria', 'Houma', 'Other'
];

interface Client {
  id: string;
  fullName: string;
  dateOfBirth?: string;
  phone?: string;
  email?: string;
  homeAddress?: string;
  referralDate?: string;
  primaryNeeds?: string;
  assignedCaseManager?: string;
  status: string;
  courtOrdered?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  referralSource?: string;
}

// Father Referral Form Interface (matching the FOAM PDF)
interface FatherReferralForm {
  // Pre-Intake Contact Information
  lastName: string;
  firstName: string;
  middleInitial: string;
  referralDate: string;
  streetAddress: string;
  aptUnit: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  birthdate: string;
  ssnLast4: string;  // Only last 4 for security
  age: string;

  // Referral Source
  referredBy: string;
  referredByContact: string;

  // Screening Questions
  isMinor: boolean;
  guardianName: string;
  guardianPhone: string;

  isOnParoleProbation: boolean;
  probationOfficerName: string;
  probationOfficerPhone: string;

  wasFormerlyIncarcerated: boolean;
  incarceratedWhen: string;

  hasBeenConvictedFelony: boolean;
  felonyExplanation: string;

  // Assignment
  assignedTeamMember: string;
  status: string;

  // Court-Ordered Details (enhanced)
  isCourtOrdered: boolean;
  courtName: string;
  caseNumber: string;
  courtOrderDate: string;
}

// Referral interface for tracking
interface Referral {
  id: string;
  referralType: 'referred_in' | 'referred_out';

  // For Referred IN (Father Referral Form data)
  lastName?: string;
  firstName?: string;
  middleInitial?: string;
  clientName: string;
  referralDate: string;
  streetAddress?: string;
  aptUnit?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone?: string;
  email?: string;
  birthdate?: string;
  age?: string;

  referredBy?: string;
  referredByContact?: string;
  assignedTeamMember?: string;

  // Screening
  isMinor?: boolean;
  guardianName?: string;
  guardianPhone?: string;
  isOnParoleProbation?: boolean;
  probationOfficerName?: string;
  probationOfficerPhone?: string;
  wasFormerlyIncarcerated?: boolean;
  incarceratedWhen?: string;
  hasBeenConvictedFelony?: boolean;
  felonyExplanation?: string;

  // Court-Ordered
  isCourtOrdered?: boolean;
  courtName?: string;
  caseNumber?: string;
  courtOrderDate?: string;

  status: string;

  // For Referred OUT
  resourceNeeded?: string;
  partnerReferredTo?: string;
  contactPerson?: string;
  partnerPhone?: string;
  partnerEmail?: string;
  outcome?: string;
  roiSigned?: boolean;
  roiSignedDate?: string;
}

interface DashboardStats {
  totalClients: number;
  activeClients: number;
  graduatedClients: number;
  inactiveClients: number;
  totalReferrals: number;
  pendingReferrals: number;
  completedReferrals: number;
  referralsIn: number;
  referralsOut: number;
  courtOrderedReferrals: number;
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
  const [referralSubTab, setReferralSubTab] = useState<ReferralSubTab>('referred_in');
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Data states
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);

  // Modal states
  const [showAddClient, setShowAddClient] = useState(false);
  const [showAddReferralIn, setShowAddReferralIn] = useState(false);
  const [showAddReferralOut, setShowAddReferralOut] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [printReferral, setPrintReferral] = useState<Referral | null>(null);

  // Father Referral Form state (matching FOAM PDF)
  const [fatherReferralForm, setFatherReferralForm] = useState<FatherReferralForm>({
    lastName: '',
    firstName: '',
    middleInitial: '',
    referralDate: new Date().toISOString().split('T')[0],
    streetAddress: '',
    aptUnit: '',
    city: 'Baton Rouge',
    state: 'LA',
    zipCode: '',
    phone: '',
    email: '',
    birthdate: '',
    ssnLast4: '',
    age: '',
    referredBy: '',
    referredByContact: '',
    isMinor: false,
    guardianName: '',
    guardianPhone: '',
    isOnParoleProbation: false,
    probationOfficerName: '',
    probationOfficerPhone: '',
    wasFormerlyIncarcerated: false,
    incarceratedWhen: '',
    hasBeenConvictedFelony: false,
    felonyExplanation: '',
    assignedTeamMember: '',
    status: 'Pending',
    isCourtOrdered: false,
    courtName: '',
    caseNumber: '',
    courtOrderDate: ''
  });

  // Client form state
  const [clientForm, setClientForm] = useState({
    fullName: '', dateOfBirth: '', phone: '', email: '', homeAddress: '',
    referralDate: new Date().toISOString().split('T')[0],
    referralSource: '',
    primaryNeeds: 'Fatherhood Program',
    assignedCaseManager: '', status: 'Active', courtOrdered: 'No',
    emergencyContact: '', emergencyPhone: ''
  });

  // Referred OUT form
  const [referralOutForm, setReferralOutForm] = useState({
    clientName: '',
    clientPhone: '',
    clientAddress: '',
    referralDate: new Date().toISOString().split('T')[0],
    resourceNeeded: '',
    partnerReferredTo: '',
    contactPerson: '',
    phone: '',
    email: '',
    status: 'Pending',
    roiSigned: false,
    roiSignedDate: ''
  });

  // Calculate age from birthdate
  const calculateAge = (birthdate: string): string => {
    if (!birthdate) return '';
    const today = new Date();
    const birth = new Date(birthdate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age.toString();
  };

  // Update age when birthdate changes
  useEffect(() => {
    if (fatherReferralForm.birthdate) {
      setFatherReferralForm(prev => ({
        ...prev,
        age: calculateAge(prev.birthdate)
      }));
    }
  }, [fatherReferralForm.birthdate]);

  // Load data on mount and tab change
  useEffect(() => {
    loadDashboard();
    loadStaff();
  }, []);

  useEffect(() => {
    if (activeTab === 'clients' && clients.length === 0) loadClients();
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
          referralDate: new Date().toISOString().split('T')[0],
          referralSource: '',
          primaryNeeds: 'Fatherhood Program',
          assignedCaseManager: '', status: 'Active', courtOrdered: 'No',
          emergencyContact: '', emergencyPhone: ''
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

  // Add Father Referral (Referred IN)
  const addFatherReferral = async () => {
    if (!fatherReferralForm.firstName.trim() || !fatherReferralForm.lastName.trim()) {
      alert('First name and last name are required');
      return;
    }
    if (fatherReferralForm.isOnParoleProbation && !fatherReferralForm.probationOfficerName) {
      alert('Probation/Parole officer name is required when on parole/probation');
      return;
    }
    setIsLoading(true);
    try {
      const fullName = `${fatherReferralForm.lastName}, ${fatherReferralForm.firstName}${fatherReferralForm.middleInitial ? ' ' + fatherReferralForm.middleInitial + '.' : ''}`;
      const fullAddress = `${fatherReferralForm.streetAddress}${fatherReferralForm.aptUnit ? ', ' + fatherReferralForm.aptUnit : ''}, ${fatherReferralForm.city}, ${fatherReferralForm.state} ${fatherReferralForm.zipCode}`;

      const response = await fetch(`${API_BASE_URL}/api/cm/referrals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referralType: 'referred_in',
          clientName: fullName,
          ...fatherReferralForm,
          fullAddress,
          // Set court ordered based on parole/probation or explicit court order
          isCourtOrdered: fatherReferralForm.isCourtOrdered || fatherReferralForm.isOnParoleProbation
        })
      });
      const data = await response.json();
      if (data.success) {
        alert('Father Referral Form submitted successfully!');
        setShowAddReferralIn(false);
        // Reset form
        setFatherReferralForm({
          lastName: '',
          firstName: '',
          middleInitial: '',
          referralDate: new Date().toISOString().split('T')[0],
          streetAddress: '',
          aptUnit: '',
          city: 'Baton Rouge',
          state: 'LA',
          zipCode: '',
          phone: '',
          email: '',
          birthdate: '',
          ssnLast4: '',
          age: '',
          referredBy: '',
          referredByContact: '',
          isMinor: false,
          guardianName: '',
          guardianPhone: '',
          isOnParoleProbation: false,
          probationOfficerName: '',
          probationOfficerPhone: '',
          wasFormerlyIncarcerated: false,
          incarceratedWhen: '',
          hasBeenConvictedFelony: false,
          felonyExplanation: '',
          assignedTeamMember: '',
          status: 'Pending',
          isCourtOrdered: false,
          courtName: '',
          caseNumber: '',
          courtOrderDate: ''
        });
        loadReferrals();
        loadDashboard();
      } else {
        alert('Failed to submit referral: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Failed to submit referral:', err);
      alert('Failed to submit referral');
    } finally {
      setIsLoading(false);
    }
  };

  // Add Referred OUT
  const addReferralOut = async () => {
    if (!referralOutForm.clientName.trim() || !referralOutForm.resourceNeeded.trim()) {
      alert('Client name and resource needed are required');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/cm/referrals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...referralOutForm,
          referralType: 'referred_out'
        })
      });
      const data = await response.json();
      if (data.success) {
        alert('Referred Out record added successfully!');
        setShowAddReferralOut(false);
        setReferralOutForm({
          clientName: '',
          clientPhone: '',
          clientAddress: '',
          referralDate: new Date().toISOString().split('T')[0],
          resourceNeeded: '',
          partnerReferredTo: '',
          contactPerson: '',
          phone: '',
          email: '',
          status: 'Pending',
          roiSigned: false,
          roiSignedDate: ''
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

  // Print Father Referral Form
  const handlePrintReferral = (referral: Referral) => {
    setPrintReferral(referral);
    setShowPrintPreview(true);
  };

  const printDocument = () => {
    const printContent = document.getElementById('print-content');
    if (printContent) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>FOAM Father Referral Form</title>
            <style>
              @page { margin: 0.5in; size: letter; }
              * { box-sizing: border-box; }
              body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #1e293b; line-height: 1.4; font-size: 11pt; }
              .header { text-align: center; margin-bottom: 20px; }
              .logo { font-size: 36pt; font-weight: bold; letter-spacing: 3px; }
              .logo-sub { font-size: 10pt; letter-spacing: 2px; margin-top: -5px; }
              .title { font-size: 22pt; font-weight: bold; margin: 15px 0; }
              .section-title { font-weight: bold; font-size: 11pt; margin: 15px 0 10px; border-bottom: 1px solid #000; padding-bottom: 3px; }
              .form-row { display: flex; gap: 15px; margin: 8px 0; align-items: flex-end; }
              .form-field { flex: 1; }
              .form-field.small { flex: 0.5; }
              .form-field.large { flex: 2; }
              .field-label { font-size: 8pt; color: #64748b; margin-bottom: 2px; }
              .field-value { border-bottom: 1px solid #000; min-height: 22px; padding: 2px 5px; font-size: 11pt; }
              .field-value.empty { color: transparent; }
              .checkbox-row { display: flex; align-items: center; gap: 30px; margin: 10px 0; }
              .checkbox-group { display: flex; align-items: center; gap: 8px; }
              .checkbox { width: 16px; height: 16px; border: 1px solid #000; display: inline-flex; align-items: center; justify-content: center; font-size: 12pt; }
              .checkbox.checked::after { content: "✓"; }
              .conditional-field { margin-left: 30px; margin-top: 5px; }
              .signature-section { margin-top: 30px; }
              .signature-row { display: flex; gap: 40px; margin: 20px 0; }
              .signature-field { flex: 1; }
              .signature-line { border-bottom: 1px solid #000; height: 35px; margin-bottom: 5px; }
              .signature-label { font-size: 9pt; color: #64748b; }
              .footer-note { font-size: 9pt; color: #64748b; margin-top: 10px; font-style: italic; }
              .page-number { text-align: center; font-size: 9pt; color: #94a3b8; margin-top: 20px; }
              @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
            </style>
          </head>
          <body>
            ${printContent.innerHTML}
          </body>
          </html>
        `);
        printWindow.document.close();
        setTimeout(() => {
          printWindow.print();
        }, 500);
      }
    }
  };

  // Filter functions
  const filteredClients = clients.filter(c =>
    c.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone?.includes(searchQuery)
  );

  // Filter referrals by type
  const referralsIn = referrals.filter(r =>
    r.referralType === 'referred_in' &&
    (r.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     r.referredBy?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const referralsOut = referrals.filter(r =>
    r.referralType === 'referred_out' &&
    (r.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     r.partnerReferredTo?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const courtOrderedCount = referralsIn.filter(r => r.isCourtOrdered || r.isOnParoleProbation).length;
  const onParoleCount = referralsIn.filter(r => r.isOnParoleProbation).length;

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

  // Tabs configuration - HIPAA Compliant (No Case Notes)
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'referrals', label: 'Referrals', icon: Send }
  ];

  // Render Dashboard
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <ArrowDownLeft className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-slate-500 text-sm">Referred In</span>
          </div>
          <p className="text-3xl font-bold text-slate-800">{referralsIn.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-slate-500 text-sm">Referred Out</span>
          </div>
          <p className="text-3xl font-bold text-slate-800">{referralsOut.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-amber-200 shadow-sm bg-gradient-to-br from-amber-50 to-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <Scale className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-slate-500 text-sm">On Parole/Probation</span>
          </div>
          <p className="text-3xl font-bold text-amber-700">{onParoleCount}</p>
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
      </div>

      {/* Quick Actions - HIPAA Compliant (No Add Note) */}
      <div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-2xl p-6 text-white">
        <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <button onClick={() => { setActiveTab('referrals'); setReferralSubTab('referred_in'); setShowAddReferralIn(true); }}
            className="bg-white/20 hover:bg-white/30 rounded-xl p-4 text-center transition-all">
            <ArrowDownLeft className="w-6 h-6 mx-auto mb-2" />
            <span className="text-sm font-medium">Father Referral Form</span>
          </button>
          <button onClick={() => { setActiveTab('referrals'); setReferralSubTab('referred_out'); setShowAddReferralOut(true); }}
            className="bg-white/20 hover:bg-white/30 rounded-xl p-4 text-center transition-all">
            <ArrowUpRight className="w-6 h-6 mx-auto mb-2" />
            <span className="text-sm font-medium">Refer Out</span>
          </button>
          <button onClick={() => { setActiveTab('clients'); setShowAddClient(true); }}
            className="bg-white/20 hover:bg-white/30 rounded-xl p-4 text-center transition-all">
            <Users className="w-6 h-6 mx-auto mb-2" />
            <span className="text-sm font-medium">Add Client</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <ArrowDownLeft className="w-5 h-5 text-blue-600" /> Referred In Summary
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-600">Total Referrals</span>
              <span className="font-bold text-blue-600">{referralsIn.length}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-600 flex items-center gap-2">
                <Scale size={16} className="text-amber-500" /> On Parole/Probation
              </span>
              <span className="font-bold text-amber-600">{onParoleCount}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-slate-600">Pending</span>
              <span className="font-bold text-amber-600">
                {referralsIn.filter(r => r.status === 'Pending').length}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <ArrowUpRight className="w-5 h-5 text-purple-600" /> Referred Out Summary
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-600">Total Referrals</span>
              <span className="font-bold text-purple-600">{referralsOut.length}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-600">Completed</span>
              <span className="font-bold text-emerald-600">
                {referralsOut.filter(r => r.status === 'Completed').length}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-slate-600">Pending</span>
              <span className="font-bold text-amber-600">
                {referralsOut.filter(r => r.status === 'Pending').length}
              </span>
            </div>
          </div>
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
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Name</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Phone</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Case Manager</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Referral Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredClients.length > 0 ? filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => setSelectedClient(client)}>
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
                  <td className="px-4 py-3 text-sm text-slate-600">{client.referralDate || '-'}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    {isLoading ? 'Loading...' : 'No clients found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Render Referrals Tab
  const renderReferrals = () => (
    <div className="space-y-4">
      {/* Sub-tabs */}
      <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
        <button
          onClick={() => setReferralSubTab('referred_in')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
            referralSubTab === 'referred_in'
              ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-2 border-transparent'
          }`}
        >
          <ArrowDownLeft size={18} />
          Referred In
          <span className="ml-1 px-2 py-0.5 bg-white rounded-full text-xs font-bold">{referralsIn.length}</span>
        </button>
        <button
          onClick={() => setReferralSubTab('referred_out')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
            referralSubTab === 'referred_out'
              ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-2 border-transparent'
          }`}
        >
          <ArrowUpRight size={18} />
          Referred Out
          <span className="ml-1 px-2 py-0.5 bg-white rounded-full text-xs font-bold">{referralsOut.length}</span>
        </button>
        {referralSubTab === 'referred_in' && onParoleCount > 0 && (
          <div className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg">
            <Scale size={16} className="text-amber-600" />
            <span className="text-sm font-medium text-amber-700">{onParoleCount} On Parole/Probation</span>
          </div>
        )}
      </div>

      {/* Search and Add Button */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder={referralSubTab === 'referred_in' ? "Search by name or referred by..." : "Search by client or partner..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
          />
        </div>
        <button
          onClick={() => referralSubTab === 'referred_in' ? setShowAddReferralIn(true) : setShowAddReferralOut(true)}
          className={`flex items-center gap-2 px-4 py-2.5 text-white rounded-xl font-medium transition-colors ${
            referralSubTab === 'referred_in'
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-purple-600 hover:bg-purple-700'
          }`}
        >
          <Plus size={18} />
          {referralSubTab === 'referred_in' ? 'Father Referral Form' : 'Add Referred Out'}
        </button>
      </div>

      {/* Referred In Table */}
      {referralSubTab === 'referred_in' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-blue-50 border-b border-blue-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-bold text-blue-700 uppercase tracking-wider">Name</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-blue-700 uppercase tracking-wider">Phone</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-blue-700 uppercase tracking-wider">Referred By</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-blue-700 uppercase tracking-wider">Assigned To</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-blue-700 uppercase tracking-wider">Parole/Probation</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-blue-700 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-blue-700 uppercase tracking-wider">Date</th>
                  <th className="text-center px-4 py-3 text-xs font-bold text-blue-700 uppercase tracking-wider">Print</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {referralsIn.length > 0 ? referralsIn.map((referral) => (
                  <tr key={referral.id} className="hover:bg-blue-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800">{referral.clientName}</td>
                    <td className="px-4 py-3 text-slate-600">{referral.phone || '-'}</td>
                    <td className="px-4 py-3 text-slate-600">{referral.referredBy || '-'}</td>
                    <td className="px-4 py-3 text-slate-600">{referral.assignedTeamMember || 'Unassigned'}</td>
                    <td className="px-4 py-3">
                      {referral.isOnParoleProbation ? (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-medium">
                            <Scale size={12} /> Yes
                          </span>
                          {referral.probationOfficerName && (
                            <p className="text-xs text-slate-500">PO: {referral.probationOfficerName}</p>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-sm">No</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusColor(referral.status)}`}>
                        {referral.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{referral.referralDate}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handlePrintReferral(referral)}
                        className="p-2 hover:bg-blue-100 rounded-lg text-blue-600 transition-colors"
                        title="Print Father Referral Form"
                      >
                        <Printer size={18} />
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                      {isLoading ? 'Loading...' : 'No referrals found'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Referred Out Table */}
      {referralSubTab === 'referred_out' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-purple-50 border-b border-purple-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-bold text-purple-700 uppercase tracking-wider">Client</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-purple-700 uppercase tracking-wider">Resource Needed</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-purple-700 uppercase tracking-wider">Partner</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-purple-700 uppercase tracking-wider">Contact</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-purple-700 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-purple-700 uppercase tracking-wider">Date</th>
                  <th className="text-center px-4 py-3 text-xs font-bold text-purple-700 uppercase tracking-wider">Print</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {referralsOut.length > 0 ? referralsOut.map((referral) => (
                  <tr key={referral.id} className="hover:bg-purple-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800">{referral.clientName}</td>
                    <td className="px-4 py-3 text-slate-600">{referral.resourceNeeded || '-'}</td>
                    <td className="px-4 py-3 text-slate-600">{referral.partnerReferredTo || '-'}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {referral.contactPerson && <p>{referral.contactPerson}</p>}
                      {referral.partnerPhone && <p className="text-xs text-slate-400">{referral.partnerPhone}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusColor(referral.status)}`}>
                        {referral.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{referral.referralDate}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handlePrintReferral(referral)}
                        className="p-2 hover:bg-purple-100 rounded-lg text-purple-600 transition-colors"
                        title="Print Referral"
                      >
                        <Printer size={18} />
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                      {isLoading ? 'Loading...' : 'No referrals found'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  // Father Referral Form Modal (matching FOAM PDF exactly)
  const renderFatherReferralModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddReferralIn(false)}>
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[95vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header with FOAM branding */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <div className="text-2xl font-bold tracking-wider text-slate-800">F.O.A.M.</div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Father Referral Form</h2>
              <p className="text-sm text-slate-500">Pre-Intake Contact Information</p>
            </div>
          </div>
          <button onClick={() => setShowAddReferralIn(false)} className="p-2 hover:bg-slate-100 rounded-lg">
            <X size={24} className="text-slate-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Contact Information Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider border-b pb-2">Contact Information</h3>

            {/* Name Row */}
            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-5">
                <label className="block text-sm font-medium text-slate-700 mb-1">Last Name *</label>
                <input type="text" value={fatherReferralForm.lastName}
                  onChange={(e) => setFatherReferralForm({ ...fatherReferralForm, lastName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Last name" />
              </div>
              <div className="col-span-5">
                <label className="block text-sm font-medium text-slate-700 mb-1">First Name *</label>
                <input type="text" value={fatherReferralForm.firstName}
                  onChange={(e) => setFatherReferralForm({ ...fatherReferralForm, firstName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="First name" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">M.I.</label>
                <input type="text" value={fatherReferralForm.middleInitial} maxLength={1}
                  onChange={(e) => setFatherReferralForm({ ...fatherReferralForm, middleInitial: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="M" />
              </div>
            </div>

            {/* Date Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Referral Date</label>
                <input type="date" value={fatherReferralForm.referralDate}
                  onChange={(e) => setFatherReferralForm({ ...fatherReferralForm, referralDate: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                <input type="tel" value={fatherReferralForm.phone}
                  onChange={(e) => setFatherReferralForm({ ...fatherReferralForm, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="(225) 000-0000" />
              </div>
            </div>

            {/* Address Row */}
            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-8">
                <label className="block text-sm font-medium text-slate-700 mb-1">Street Address</label>
                <input type="text" value={fatherReferralForm.streetAddress}
                  onChange={(e) => setFatherReferralForm({ ...fatherReferralForm, streetAddress: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Street address" />
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Apt/Unit #</label>
                <input type="text" value={fatherReferralForm.aptUnit}
                  onChange={(e) => setFatherReferralForm({ ...fatherReferralForm, aptUnit: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Apt #" />
              </div>
            </div>

            {/* City/State/Zip Row */}
            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                <select value={fatherReferralForm.city}
                  onChange={(e) => setFatherReferralForm({ ...fatherReferralForm, city: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
                  {LA_CITIES.map(city => <option key={city} value={city}>{city}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
                <input type="text" value={fatherReferralForm.state} readOnly
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-600" />
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Zip Code</label>
                <input type="text" value={fatherReferralForm.zipCode}
                  onChange={(e) => setFatherReferralForm({ ...fatherReferralForm, zipCode: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="70801" />
              </div>
            </div>

            {/* Email Row */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input type="email" value={fatherReferralForm.email}
                onChange={(e) => setFatherReferralForm({ ...fatherReferralForm, email: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="email@example.com" />
            </div>

            {/* Birthdate/SSN/Age Row */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Birthdate</label>
                <input type="date" value={fatherReferralForm.birthdate}
                  onChange={(e) => setFatherReferralForm({ ...fatherReferralForm, birthdate: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">SSN (Last 4)</label>
                <input type="text" value={fatherReferralForm.ssnLast4} maxLength={4}
                  onChange={(e) => setFatherReferralForm({ ...fatherReferralForm, ssnLast4: e.target.value.replace(/\D/g, '') })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="XXXX" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Age</label>
                <input type="text" value={fatherReferralForm.age} readOnly
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-600"
                  placeholder="Auto-calculated" />
              </div>
            </div>
          </div>

          {/* Referral Source Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider border-b pb-2">Referral Source</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Referred By</label>
                <input type="text" value={fatherReferralForm.referredBy}
                  onChange={(e) => setFatherReferralForm({ ...fatherReferralForm, referredBy: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Name of person/agency" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Contact Info</label>
                <input type="text" value={fatherReferralForm.referredByContact}
                  onChange={(e) => setFatherReferralForm({ ...fatherReferralForm, referredByContact: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Phone or email" />
              </div>
            </div>
          </div>

          {/* Screening Questions Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider border-b pb-2">Screening Questions</h3>

            {/* Is Minor? */}
            <div className="bg-slate-50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-700">Is this referral a minor?</span>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="isMinor" checked={fatherReferralForm.isMinor}
                      onChange={() => setFatherReferralForm({ ...fatherReferralForm, isMinor: true })}
                      className="w-4 h-4 text-blue-600" />
                    <span>Yes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="isMinor" checked={!fatherReferralForm.isMinor}
                      onChange={() => setFatherReferralForm({ ...fatherReferralForm, isMinor: false, guardianName: '', guardianPhone: '' })}
                      className="w-4 h-4 text-blue-600" />
                    <span>No</span>
                  </label>
                </div>
              </div>
              {fatherReferralForm.isMinor && (
                <div className="mt-4 grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Parent/Guardian Name</label>
                    <input type="text" value={fatherReferralForm.guardianName}
                      onChange={(e) => setFatherReferralForm({ ...fatherReferralForm, guardianName: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Guardian Phone</label>
                    <input type="tel" value={fatherReferralForm.guardianPhone}
                      onChange={(e) => setFatherReferralForm({ ...fatherReferralForm, guardianPhone: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                  </div>
                </div>
              )}
            </div>

            {/* On Parole/Probation? */}
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-700 flex items-center gap-2">
                  <Scale size={18} className="text-amber-600" />
                  Are you on Parole or Probation?
                </span>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="isOnParoleProbation" checked={fatherReferralForm.isOnParoleProbation}
                      onChange={() => setFatherReferralForm({ ...fatherReferralForm, isOnParoleProbation: true })}
                      className="w-4 h-4 text-amber-600" />
                    <span>Yes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="isOnParoleProbation" checked={!fatherReferralForm.isOnParoleProbation}
                      onChange={() => setFatherReferralForm({ ...fatherReferralForm, isOnParoleProbation: false, probationOfficerName: '', probationOfficerPhone: '' })}
                      className="w-4 h-4 text-amber-600" />
                    <span>No</span>
                  </label>
                </div>
              </div>
              {fatherReferralForm.isOnParoleProbation && (
                <div className="mt-4 grid grid-cols-2 gap-4 pt-4 border-t border-amber-200">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">P. Officer Name *</label>
                    <input type="text" value={fatherReferralForm.probationOfficerName}
                      onChange={(e) => setFatherReferralForm({ ...fatherReferralForm, probationOfficerName: e.target.value })}
                      className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">P. Officer Phone</label>
                    <input type="tel" value={fatherReferralForm.probationOfficerPhone}
                      onChange={(e) => setFatherReferralForm({ ...fatherReferralForm, probationOfficerPhone: e.target.value })}
                      className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none" />
                  </div>
                </div>
              )}
            </div>

            {/* Formerly Incarcerated? */}
            <div className="bg-slate-50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-700">Are you formerly incarcerated or on probation?</span>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="wasFormerlyIncarcerated" checked={fatherReferralForm.wasFormerlyIncarcerated}
                      onChange={() => setFatherReferralForm({ ...fatherReferralForm, wasFormerlyIncarcerated: true })}
                      className="w-4 h-4 text-blue-600" />
                    <span>Yes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="wasFormerlyIncarcerated" checked={!fatherReferralForm.wasFormerlyIncarcerated}
                      onChange={() => setFatherReferralForm({ ...fatherReferralForm, wasFormerlyIncarcerated: false, incarceratedWhen: '' })}
                      className="w-4 h-4 text-blue-600" />
                    <span>No</span>
                  </label>
                </div>
              </div>
              {fatherReferralForm.wasFormerlyIncarcerated && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <label className="block text-sm font-medium text-slate-700 mb-1">If yes, when?</label>
                  <input type="text" value={fatherReferralForm.incarceratedWhen}
                    onChange={(e) => setFatherReferralForm({ ...fatherReferralForm, incarceratedWhen: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="Date or time period" />
                </div>
              )}
            </div>

            {/* Convicted of Felony? */}
            <div className="bg-slate-50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-700">Have you ever been convicted of a felony?</span>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="hasBeenConvictedFelony" checked={fatherReferralForm.hasBeenConvictedFelony}
                      onChange={() => setFatherReferralForm({ ...fatherReferralForm, hasBeenConvictedFelony: true })}
                      className="w-4 h-4 text-blue-600" />
                    <span>Yes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="hasBeenConvictedFelony" checked={!fatherReferralForm.hasBeenConvictedFelony}
                      onChange={() => setFatherReferralForm({ ...fatherReferralForm, hasBeenConvictedFelony: false, felonyExplanation: '' })}
                      className="w-4 h-4 text-blue-600" />
                    <span>No</span>
                  </label>
                </div>
              </div>
              {fatherReferralForm.hasBeenConvictedFelony && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <label className="block text-sm font-medium text-slate-700 mb-1">If yes, explain</label>
                  <textarea value={fatherReferralForm.felonyExplanation}
                    onChange={(e) => setFatherReferralForm({ ...fatherReferralForm, felonyExplanation: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    rows={2} placeholder="Brief explanation..." />
                </div>
              )}
            </div>
          </div>

          {/* Court-Ordered Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider border-b pb-2 flex items-center gap-2">
              <Scale size={18} className="text-amber-600" /> Court-Ordered Referral
            </h3>
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
              <div className="flex items-center justify-between mb-4">
                <span className="font-medium text-slate-700">Is this a court-ordered referral?</span>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="isCourtOrdered" checked={fatherReferralForm.isCourtOrdered}
                      onChange={() => setFatherReferralForm({ ...fatherReferralForm, isCourtOrdered: true })}
                      className="w-4 h-4 text-amber-600" />
                    <span>Yes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="isCourtOrdered" checked={!fatherReferralForm.isCourtOrdered}
                      onChange={() => setFatherReferralForm({ ...fatherReferralForm, isCourtOrdered: false, courtName: '', caseNumber: '', courtOrderDate: '' })}
                      className="w-4 h-4 text-amber-600" />
                    <span>No</span>
                  </label>
                </div>
              </div>
              {fatherReferralForm.isCourtOrdered && (
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-amber-200">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Court Name</label>
                    <select value={fatherReferralForm.courtName}
                      onChange={(e) => setFatherReferralForm({ ...fatherReferralForm, courtName: e.target.value })}
                      className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none">
                      <option value="">Select court...</option>
                      {COURTS.map(court => <option key={court} value={court}>{court}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Case Number</label>
                    <input type="text" value={fatherReferralForm.caseNumber}
                      onChange={(e) => setFatherReferralForm({ ...fatherReferralForm, caseNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                      placeholder="e.g., DA#05189-25" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Court Order Date</label>
                    <input type="date" value={fatherReferralForm.courtOrderDate}
                      onChange={(e) => setFatherReferralForm({ ...fatherReferralForm, courtOrderDate: e.target.value })}
                      className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Assignment Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider border-b pb-2">Assignment</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Assigned Team Member</label>
                <select value={fatherReferralForm.assignedTeamMember}
                  onChange={(e) => setFatherReferralForm({ ...fatherReferralForm, assignedTeamMember: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
                  <option value="">Select team member...</option>
                  {staff.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select value={fatherReferralForm.status}
                  onChange={(e) => setFatherReferralForm({ ...fatherReferralForm, status: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Active">Active</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
            <button onClick={() => setShowAddReferralIn(false)}
              className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button onClick={addFatherReferral} disabled={isLoading}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:bg-blue-300 transition-colors">
              {isLoading ? 'Submitting...' : 'Submit Father Referral'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Referred Out Modal
  const renderReferralOutModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddReferralOut(false)}>
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <ArrowUpRight className="text-purple-600" /> Refer Client Out
          </h2>
          <button onClick={() => setShowAddReferralOut(false)} className="p-2 hover:bg-slate-100 rounded-lg">
            <X size={24} className="text-slate-400" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          {/* Client Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Client Name *</label>
              <input type="text" value={referralOutForm.clientName}
                onChange={(e) => setReferralOutForm({ ...referralOutForm, clientName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                placeholder="Client's full name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Client Phone</label>
              <input type="tel" value={referralOutForm.clientPhone}
                onChange={(e) => setReferralOutForm({ ...referralOutForm, clientPhone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                placeholder="(225) 000-0000" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Client Address</label>
            <input type="text" value={referralOutForm.clientAddress}
              onChange={(e) => setReferralOutForm({ ...referralOutForm, clientAddress: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
              placeholder="Full address" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Resource/Service Needed *</label>
            <select value={referralOutForm.resourceNeeded}
              onChange={(e) => setReferralOutForm({ ...referralOutForm, resourceNeeded: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none">
              <option value="">Select resource...</option>
              {RESOURCE_TYPES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Partner Referred To</label>
            <select value={referralOutForm.partnerReferredTo}
              onChange={(e) => setReferralOutForm({ ...referralOutForm, partnerReferredTo: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none">
              <option value="">Select partner...</option>
              {PARTNER_ORGANIZATIONS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Contact Person</label>
              <input type="text" value={referralOutForm.contactPerson}
                onChange={(e) => setReferralOutForm({ ...referralOutForm, contactPerson: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                placeholder="Partner contact name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Partner Phone</label>
              <input type="tel" value={referralOutForm.phone}
                onChange={(e) => setReferralOutForm({ ...referralOutForm, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                placeholder="(225) 000-0000" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Referral Date</label>
              <input type="date" value={referralOutForm.referralDate}
                onChange={(e) => setReferralOutForm({ ...referralOutForm, referralDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select value={referralOutForm.status}
                onChange={(e) => setReferralOutForm({ ...referralOutForm, status: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none">
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* ROI Section */}
          <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
            <div className="flex items-center justify-between">
              <span className="font-medium text-slate-700">Release of Information Signed?</span>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={referralOutForm.roiSigned}
                    onChange={(e) => setReferralOutForm({ ...referralOutForm, roiSigned: e.target.checked })}
                    className="w-4 h-4 text-purple-600 rounded" />
                  <span>Yes</span>
                </label>
              </div>
            </div>
            {referralOutForm.roiSigned && (
              <div className="mt-3 pt-3 border-t border-purple-200">
                <label className="block text-sm font-medium text-slate-700 mb-1">Date Signed</label>
                <input type="date" value={referralOutForm.roiSignedDate}
                  onChange={(e) => setReferralOutForm({ ...referralOutForm, roiSignedDate: e.target.value })}
                  className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none" />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button onClick={() => setShowAddReferralOut(false)}
              className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button onClick={addReferralOut} disabled={isLoading}
              className="px-6 py-2.5 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 disabled:bg-purple-300 transition-colors">
              {isLoading ? 'Adding...' : 'Add Referral'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Add Client Modal
  const renderAddClientModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddClient(false)}>
      <div className="bg-white rounded-2xl w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-800">Add New Client</h2>
          <button onClick={() => setShowAddClient(false)} className="p-2 hover:bg-slate-100 rounded-lg">
            <X size={24} className="text-slate-400" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
            <input type="text" value={clientForm.fullName}
              onChange={(e) => setClientForm({ ...clientForm, fullName: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
              <input type="tel" value={clientForm.phone}
                onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input type="email" value={clientForm.email}
                onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Referral Date</label>
              <input type="date" value={clientForm.referralDate}
                onChange={(e) => setClientForm({ ...clientForm, referralDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select value={clientForm.status}
                onChange={(e) => setClientForm({ ...clientForm, status: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none">
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Inactive">Inactive</option>
                <option value="Graduated">Graduated</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Assigned Case Manager</label>
            <select value={clientForm.assignedCaseManager}
              onChange={(e) => setClientForm({ ...clientForm, assignedCaseManager: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none">
              <option value="">Select case manager...</option>
              {staff.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button onClick={() => setShowAddClient(false)}
              className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button onClick={addClient} disabled={isLoading}
              className="px-6 py-2.5 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 disabled:bg-teal-300 transition-colors">
              {isLoading ? 'Adding...' : 'Add Client'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Print Preview Modal - Father Referral Form (matching FOAM PDF)
  const renderPrintPreview = () => {
    if (!printReferral || !showPrintPreview) return null;
    const isReferredOut = printReferral.referralType === 'referred_out';

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-auto">
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Printer size={24} className="text-blue-600" />
              {isReferredOut ? 'Print Referral' : 'Print Father Referral Form'}
            </h2>
            <div className="flex items-center gap-2">
              <button onClick={printDocument}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
                <Printer size={18} /> Print
              </button>
              <button onClick={() => setShowPrintPreview(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X size={24} className="text-slate-400" />
              </button>
            </div>
          </div>

          {/* Print Content - Father Referral Form */}
          <div id="print-content" className="p-8">
            {!isReferredOut ? (
              <>
                {/* FOAM Header */}
                <div className="header">
                  <div className="logo">F.O.A.M.</div>
                  <div className="logo-sub">FATHERS ON A MISSION</div>
                  <div className="title">Father Referral Form</div>
                </div>

                <div className="section-title">Pre-Intake Contact Information</div>

                <div className="form-row">
                  <div className="form-field">
                    <div className="field-label">Full name: Last</div>
                    <div className="field-value">{printReferral.lastName || ''}</div>
                  </div>
                  <div className="form-field">
                    <div className="field-label">First</div>
                    <div className="field-value">{printReferral.firstName || ''}</div>
                  </div>
                  <div className="form-field small">
                    <div className="field-label">M.I.</div>
                    <div className="field-value">{printReferral.middleInitial || ''}</div>
                  </div>
                  <div className="form-field">
                    <div className="field-label">Date:</div>
                    <div className="field-value">{printReferral.referralDate}</div>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-field large">
                    <div className="field-label">Address: Street address</div>
                    <div className="field-value">{printReferral.streetAddress || ''}</div>
                  </div>
                  <div className="form-field small">
                    <div className="field-label">Apt/Unit #</div>
                    <div className="field-value">{printReferral.aptUnit || ''}</div>
                  </div>
                  <div className="form-field">
                    <div className="field-label">Phone:</div>
                    <div className="field-value">{printReferral.phone || ''}</div>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-field">
                    <div className="field-label">City</div>
                    <div className="field-value">{printReferral.city || ''}</div>
                  </div>
                  <div className="form-field small">
                    <div className="field-label">State</div>
                    <div className="field-value">{printReferral.state || 'LA'}</div>
                  </div>
                  <div className="form-field small">
                    <div className="field-label">Zip Code</div>
                    <div className="field-value">{printReferral.zipCode || ''}</div>
                  </div>
                  <div className="form-field large">
                    <div className="field-label">Email:</div>
                    <div className="field-value">{printReferral.email || ''}</div>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-field">
                    <div className="field-label">Birthdate:</div>
                    <div className="field-value">{printReferral.birthdate || ''}</div>
                  </div>
                  <div className="form-field">
                    <div className="field-label">SSN:</div>
                    <div className="field-value">XXX-XX-____</div>
                  </div>
                  <div className="form-field small">
                    <div className="field-label">Age:</div>
                    <div className="field-value">{printReferral.age || ''}</div>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-field large">
                    <div className="field-label">Referred by: Contact Info:</div>
                    <div className="field-value">{printReferral.referredBy || ''}</div>
                  </div>
                </div>

                {/* Screening Questions */}
                <div className="section-title">Screening Questions</div>
                <div style={{ fontSize: '10pt', lineHeight: '2' }}>
                  <div className="checkbox-row">
                    <span>Is this referral a minor?</span>
                    <div className="checkbox-group">
                      <span>Yes</span>
                      <div className={`checkbox ${printReferral.isMinor ? 'checked' : ''}`}></div>
                    </div>
                    <div className="checkbox-group">
                      <span>No</span>
                      <div className={`checkbox ${!printReferral.isMinor ? 'checked' : ''}`}></div>
                    </div>
                    <span style={{ marginLeft: '20px', color: '#64748b', fontSize: '10pt' }}>
                      If yes, Please provide parent Guardian name and contact number.
                    </span>
                  </div>
                  {printReferral.isMinor && printReferral.guardianName && (
                    <div className="conditional-field">
                      <div className="field-value">{printReferral.guardianName} - {printReferral.guardianPhone}</div>
                    </div>
                  )}

                  <div className="checkbox-row">
                    <span>Are you on Parole or Probation?</span>
                    <div className="checkbox-group">
                      <span>Yes</span>
                      <div className={`checkbox ${printReferral.isOnParoleProbation ? 'checked' : ''}`}></div>
                    </div>
                    <div className="checkbox-group">
                      <span>No</span>
                      <div className={`checkbox ${!printReferral.isOnParoleProbation ? 'checked' : ''}`}></div>
                    </div>
                    <span style={{ marginLeft: '20px', color: '#64748b', fontSize: '10pt' }}>
                      If yes, provide P. Officer name and contact number:
                    </span>
                  </div>
                  {printReferral.isOnParoleProbation && printReferral.probationOfficerName && (
                    <div className="conditional-field">
                      <div className="field-value">{printReferral.probationOfficerName} - {printReferral.probationOfficerPhone}</div>
                    </div>
                  )}

                  <div className="checkbox-row">
                    <span>Are you formerly incarcerated or on probation?</span>
                    <div className="checkbox-group">
                      <span>Yes</span>
                      <div className={`checkbox ${printReferral.wasFormerlyIncarcerated ? 'checked' : ''}`}></div>
                    </div>
                    <div className="checkbox-group">
                      <span>No</span>
                      <div className={`checkbox ${!printReferral.wasFormerlyIncarcerated ? 'checked' : ''}`}></div>
                    </div>
                    <span style={{ marginLeft: '20px', color: '#64748b', fontSize: '10pt' }}>
                      If yes, when?
                    </span>
                  </div>
                  {printReferral.wasFormerlyIncarcerated && printReferral.incarceratedWhen && (
                    <div className="conditional-field">
                      <div className="field-value">{printReferral.incarceratedWhen}</div>
                    </div>
                  )}

                  <div className="checkbox-row">
                    <span>Have you ever been convicted of a felony?</span>
                    <div className="checkbox-group">
                      <span>Yes</span>
                      <div className={`checkbox ${printReferral.hasBeenConvictedFelony ? 'checked' : ''}`}></div>
                    </div>
                    <div className="checkbox-group">
                      <span>No</span>
                      <div className={`checkbox ${!printReferral.hasBeenConvictedFelony ? 'checked' : ''}`}></div>
                    </div>
                    <span style={{ marginLeft: '20px', color: '#64748b', fontSize: '10pt' }}>
                      If yes, explain?
                    </span>
                  </div>
                  {printReferral.hasBeenConvictedFelony && printReferral.felonyExplanation && (
                    <div className="conditional-field">
                      <div className="field-value">{printReferral.felonyExplanation}</div>
                    </div>
                  )}
                </div>

                {/* Guardian Section */}
                <div className="section-title">If Participant is a minor</div>
                <div>
                  <div className="form-row">
                    <div className="form-field">
                      <div className="field-label">Parent/Guardian name (Print)</div>
                      <div className="field-value">{printReferral.guardianName || ''}</div>
                    </div>
                    <div className="form-field">
                      <div className="field-label">Phone number:</div>
                      <div className="field-value">{printReferral.guardianPhone || ''}</div>
                    </div>
                  </div>
                </div>

                {/* Signature Section */}
                <div className="signature-section">
                  <div className="section-title">Signature</div>
                  <div className="signature-row">
                    <div className="signature-field">
                      <div className="signature-line"></div>
                      <div className="signature-label">Parent/Guardian signature</div>
                    </div>
                    <div className="signature-field">
                      <div className="signature-line"></div>
                      <div className="signature-label">Date</div>
                    </div>
                  </div>
                </div>

                <div className="footer-note">
                  Please email completed form to: sonny@foamla.org
                </div>

                <div className="page-number">1</div>
              </>
            ) : (
              /* Referred OUT print format */
              <>
                <div className="header">
                  <div className="logo">F.O.A.M.</div>
                  <div className="logo-sub">FATHERS ON A MISSION</div>
                  <div className="title">Referral to Partner Organization</div>
                </div>

                <div className="section-title">Client Information</div>
                <div className="form-row">
                  <div className="form-field large">
                    <div className="field-label">Client Name:</div>
                    <div className="field-value">{printReferral.clientName}</div>
                  </div>
                  <div className="form-field">
                    <div className="field-label">Date:</div>
                    <div className="field-value">{printReferral.referralDate}</div>
                  </div>
                </div>

                <div className="section-title">Referral Details</div>
                <div className="form-row">
                  <div className="form-field">
                    <div className="field-label">Resource/Service Needed:</div>
                    <div className="field-value">{printReferral.resourceNeeded || ''}</div>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-field">
                    <div className="field-label">Partner Organization:</div>
                    <div className="field-value">{printReferral.partnerReferredTo || ''}</div>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-field">
                    <div className="field-label">Contact Person:</div>
                    <div className="field-value">{printReferral.contactPerson || ''}</div>
                  </div>
                  <div className="form-field">
                    <div className="field-label">Phone:</div>
                    <div className="field-value">{printReferral.partnerPhone || ''}</div>
                  </div>
                </div>

                {/* ROI Section */}
                <div className="section-title">Authorization for Release of Information</div>
                <div style={{ border: '1px solid #000', padding: '15px', marginTop: '10px' }}>
                  <div style={{ fontWeight: 'bold', textAlign: 'center', marginBottom: '10px', fontSize: '12pt' }}>
                    AUTHORIZATION FOR RELEASE OF INFORMATION
                  </div>
                  <p style={{ fontSize: '10pt', lineHeight: '1.6', marginBottom: '15px', textAlign: 'justify' }}>
                    I, <strong>{printReferral.clientName}</strong>, hereby authorize <strong>Fathers On A Mission (FOAM)</strong> to
                    release and share my personal information with <strong>{printReferral.partnerReferredTo || '[Partner Organization]'}</strong> for
                    the purpose of coordinating services related to <strong>{printReferral.resourceNeeded}</strong>.
                  </p>
                  <p style={{ fontSize: '10pt', lineHeight: '1.6', marginBottom: '15px', textAlign: 'justify' }}>
                    This authorization includes the release of relevant case information necessary to facilitate appropriate services
                    and support. I understand that I may revoke this authorization at any time by submitting a written request to FOAM.
                  </p>
                  <div className="signature-row">
                    <div className="signature-field">
                      <div className="signature-line"></div>
                      <div className="signature-label">Client Signature</div>
                    </div>
                    <div className="signature-field">
                      <div className="signature-line"></div>
                      <div className="signature-label">Date</div>
                    </div>
                  </div>
                  <div className="signature-row">
                    <div className="signature-field">
                      <div className="signature-line"></div>
                      <div className="signature-label">FOAM Representative</div>
                    </div>
                    <div className="signature-field">
                      <div className="signature-line"></div>
                      <div className="signature-label">Date</div>
                    </div>
                  </div>
                </div>

                <div className="footer-note">
                  Fathers On A Mission • Baton Rouge, LA • sonny@foamla.org
                </div>

                <div className="page-number">1</div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <ArrowLeft size={24} className="text-slate-600" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Case Manager Portal</h1>
              <p className="text-sm text-slate-500">HIPAA Compliant • No Case Notes</p>
            </div>
          </div>
          <button onClick={() => { loadDashboard(); loadClients(); loadReferrals(); }}
            className="flex items-center gap-2 px-4 py-2 text-teal-600 hover:bg-teal-50 rounded-xl transition-colors">
            <RefreshCw size={18} /> Refresh
          </button>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-4 py-3 font-medium transition-all border-b-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-teal-600 border-teal-600 bg-teal-50/50'
                    : 'text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {isLoading && activeTab === 'dashboard' && !dashboardStats ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'clients' && renderClients()}
            {activeTab === 'referrals' && renderReferrals()}
          </>
        )}
      </div>

      {/* Modals */}
      {showAddClient && renderAddClientModal()}
      {showAddReferralIn && renderFatherReferralModal()}
      {showAddReferralOut && renderReferralOutModal()}
      {showPrintPreview && renderPrintPreview()}
    </div>
  );
};

export default CaseManagerDataEntry;
