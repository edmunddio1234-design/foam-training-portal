import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, TrendingUp, TrendingDown, Users, DollarSign, Package, Gift, Bus, Car, Droplets, Zap, Home, Calendar, BarChart3, PieChart, Activity, Target, Clock, ChevronRight, Plus, Sparkles, Award, AlertCircle } from 'lucide-react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://foamla-backend-2.onrender.com';

// Types
interface DiaperEntry { id?: string; date: string; clientName: string; diapersQty: number; packs: number; diaperSize: string; notes: string; }
interface DonationGivenEntry { id?: string; date: string; clientName: string; itemType: string; description: string; quantity: number; estimatedValue: number; notes: string; }
interface InKindDonationEntry { id?: string; date: string; donorName: string; itemType: string; description: string; quantity: number; estimatedValue: number; notes: string; }
interface BusPassEntry { id?: string; date: string; clientName: string; passType: string; quantity: number; cost: number; notes: string; }
interface UberEntry { id?: string; date: string; clientName: string; pickup: string; destination: string; cost: number; purpose: string; notes: string; }
interface WaterEntry { id?: string; date: string; clientName: string; accountNumber: string; provider: string; amount: number; notes: string; }
interface ElectricEntry { id?: string; date: string; clientName: string; accountNumber: string; provider: string; amount: number; notes: string; }
interface RentEntry { id?: string; date: string; clientName: string; landlordName: string; propertyAddress: string; amount: number; notes: string; }

interface ResourceTrackerProps { onBack?: () => void; }
type TabType = 'dashboard' | 'diapers' | 'donations' | 'transport' | 'utilities';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DIAPER_SIZES = ['Newborn', 'Size 1', 'Size 2', 'Size 3', 'Size 4', 'Size 5', 'Size 6'];
const DONATION_ITEM_TYPES = ['Clothes - Adult', 'Clothes - Children', 'Clothes - Baby', 'Household Supplies', 'Baby Items', 'Food/Groceries', 'Furniture', 'Electronics', 'School Supplies', 'Hygiene Products', 'Toys', 'Books', 'Other'];
const BUS_PASS_TYPES = ['Single Ride', 'Daily Pass', '3-Day Pass', 'Weekly Pass', 'Monthly Pass'];
const ELECTRIC_PROVIDERS = ['Entergy', 'DEMCO', 'Cleco', 'SLECA', 'Other'];
const WATER_PROVIDERS = ['Baton Rouge Water Company', 'Parish Utilities', 'City of Baker', 'Other'];
const RIDE_PURPOSES = ['Job Interview', 'Work', 'Medical Appointment', 'Court', 'Child Visitation', 'FOAM Class', 'Other'];

// Animated Counter Component
const AnimatedCounter: React.FC<{ value: number; duration?: number; prefix?: string; suffix?: string }> = ({ value, duration = 1000, prefix = '', suffix = '' }) => {
  const [count, setCount] = useState(0);
  const countRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    countRef.current = 0;
    startTimeRef.current = null;
    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const progress = Math.min((timestamp - startTimeRef.current) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      countRef.current = Math.floor(easeOut * value);
      setCount(countRef.current);
      if (progress < 1) requestAnimationFrame(animate);
    };
    if (value > 0) requestAnimationFrame(animate);
    else setCount(0);
  }, [value, duration]);

  return <span>{prefix}{count.toLocaleString()}{suffix}</span>;
};

// Progress Ring Component
const ProgressRing: React.FC<{ progress: number; size?: number; strokeWidth?: number; color: string }> = ({ progress, size = 80, strokeWidth = 8, color }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (Math.min(progress, 100) / 100) * circumference;
  
  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#e5e7eb" strokeWidth={strokeWidth} />
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
    </svg>
  );
};

// Mini Sparkline Component
const Sparkline: React.FC<{ data: number[]; color: string; height?: number }> = ({ data, color, height = 40 }) => {
  if (data.length < 2) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const width = 120;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * width},${height - ((v - min) / range) * (height - 4)}`).join(' ');
  
  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={(data.length - 1) / (data.length - 1) * width} cy={height - ((data[data.length - 1] - min) / range) * (height - 4)} r="3" fill={color} />
    </svg>
  );
};

// Interactive Donut Chart
const DonutChart: React.FC<{ data: { label: string; value: number; color: string }[]; size?: number; onSegmentClick?: (label: string) => void }> = ({ data, size = 200, onSegmentClick }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const strokeWidth = 35;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  let accumulatedOffset = 0;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {data.map((segment, i) => {
          const segmentLength = (segment.value / total) * circumference;
          const offset = circumference - accumulatedOffset;
          accumulatedOffset += segmentLength;
          const isHovered = hoveredIndex === i;
          return (
            <circle
              key={i}
              cx={size/2} cy={size/2} r={radius}
              fill="none"
              stroke={segment.color}
              strokeWidth={isHovered ? strokeWidth + 5 : strokeWidth}
              strokeDasharray={`${segmentLength} ${circumference - segmentLength}`}
              strokeDashoffset={offset}
              className="cursor-pointer transition-all duration-200"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => onSegmentClick?.(segment.label)}
              style={{ filter: isHovered ? 'brightness(1.1)' : 'none' }}
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {hoveredIndex !== null ? (
          <>
            <div className="text-2xl font-bold" style={{ color: data[hoveredIndex].color }}>${data[hoveredIndex].value.toLocaleString()}</div>
            <div className="text-xs text-gray-500">{data[hoveredIndex].label}</div>
          </>
        ) : (
          <>
            <div className="text-2xl font-bold text-gray-800">${total.toLocaleString()}</div>
            <div className="text-xs text-gray-500">Total</div>
          </>
        )}
      </div>
    </div>
  );
};

const ResourceTracker: React.FC<ResourceTrackerProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Data states
  const [diaperEntries, setDiaperEntries] = useState<DiaperEntry[]>([]);
  const [donationsGiven, setDonationsGiven] = useState<DonationGivenEntry[]>([]);
  const [inKindDonations, setInKindDonations] = useState<InKindDonationEntry[]>([]);
  const [busPassEntries, setBusPassEntries] = useState<BusPassEntry[]>([]);
  const [uberEntries, setUberEntries] = useState<UberEntry[]>([]);
  const [waterEntries, setWaterEntries] = useState<WaterEntry[]>([]);
  const [electricEntries, setElectricEntries] = useState<ElectricEntry[]>([]);
  const [rentEntries, setRentEntries] = useState<RentEntry[]>([]);

  // Form visibility
  const [showDiaperForm, setShowDiaperForm] = useState(false);
  const [showDonationGivenForm, setShowDonationGivenForm] = useState(false);
  const [showInKindForm, setShowInKindForm] = useState(false);
  const [showBusForm, setShowBusForm] = useState(false);
  const [showUberForm, setShowUberForm] = useState(false);
  const [showWaterForm, setShowWaterForm] = useState(false);
  const [showElectricForm, setShowElectricForm] = useState(false);
  const [showRentForm, setShowRentForm] = useState(false);

  const getDefaultDate = () => new Date().toISOString().split('T')[0];

  // Form states
  const [newDiaperEntry, setNewDiaperEntry] = useState<DiaperEntry>({ date: getDefaultDate(), clientName: '', diapersQty: 0, packs: 0, diaperSize: 'Size 3', notes: '' });
  const [newDonationGiven, setNewDonationGiven] = useState<DonationGivenEntry>({ date: getDefaultDate(), clientName: '', itemType: 'Clothes - Adult', description: '', quantity: 1, estimatedValue: 0, notes: '' });
  const [newInKindDonation, setNewInKindDonation] = useState<InKindDonationEntry>({ date: getDefaultDate(), donorName: '', itemType: 'Clothes - Adult', description: '', quantity: 1, estimatedValue: 0, notes: '' });
  const [newBusPass, setNewBusPass] = useState<BusPassEntry>({ date: getDefaultDate(), clientName: '', passType: 'Daily Pass', quantity: 1, cost: 0, notes: '' });
  const [newUberEntry, setNewUberEntry] = useState<UberEntry>({ date: getDefaultDate(), clientName: '', pickup: '', destination: '', cost: 0, purpose: 'Job Interview', notes: '' });
  const [newWaterEntry, setNewWaterEntry] = useState<WaterEntry>({ date: getDefaultDate(), clientName: '', accountNumber: '', provider: 'Baton Rouge Water Company', amount: 0, notes: '' });
  const [newElectricEntry, setNewElectricEntry] = useState<ElectricEntry>({ date: getDefaultDate(), clientName: '', accountNumber: '', provider: 'Entergy', amount: 0, notes: '' });
  const [newRentEntry, setNewRentEntry] = useState<RentEntry>({ date: getDefaultDate(), clientName: '', landlordName: '', propertyAddress: '', amount: 0, notes: '' });

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const monthName = MONTHS[selectedMonth].toUpperCase().substring(0, 3);
      const response = await fetch(`${API_BASE_URL}/api/resources/${monthName}`);
      if (!response.ok) throw new Error('Failed to fetch resource data');
      const data = await response.json();
      setDiaperEntries(data.diapers || []);
      setDonationsGiven(data.donationsGiven || []);
      setInKindDonations(data.inKindDonations || []);
      setBusPassEntries(data.busPass || []);
      setUberEntries(data.uber || []);
      setWaterEntries(data.water || []);
      setElectricEntries(data.electric || []);
      setRentEntries(data.rent || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [selectedMonth]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { if (success) { const timer = setTimeout(() => setSuccess(null), 3000); return () => clearTimeout(timer); } }, [success]);

  // Generic submit
  const handleSubmit = async (endpoint: string, data: any, successMsg: string, reset: () => void, close: () => void) => {
    setLoading(true); setError(null);
    try {
      const monthName = MONTHS[selectedMonth].toUpperCase().substring(0, 3);
      const response = await fetch(`${API_BASE_URL}/api/resources/${endpoint}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ month: monthName, ...data }) });
      if (!response.ok) throw new Error('Failed to save entry');
      setSuccess(successMsg); reset(); close(); fetchData();
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed to save entry'); }
    finally { setLoading(false); }
  };

  // Submit handlers
  const handleDiaperSubmit = (e: React.FormEvent) => { e.preventDefault(); handleSubmit('diapers', newDiaperEntry, 'Diaper distribution logged!', () => setNewDiaperEntry({ date: getDefaultDate(), clientName: '', diapersQty: 0, packs: 0, diaperSize: 'Size 3', notes: '' }), () => setShowDiaperForm(false)); };
  const handleDonationGivenSubmit = (e: React.FormEvent) => { e.preventDefault(); handleSubmit('donations-given', newDonationGiven, 'Donation given logged!', () => setNewDonationGiven({ date: getDefaultDate(), clientName: '', itemType: 'Clothes - Adult', description: '', quantity: 1, estimatedValue: 0, notes: '' }), () => setShowDonationGivenForm(false)); };
  const handleInKindSubmit = (e: React.FormEvent) => { e.preventDefault(); handleSubmit('donations-inkind', newInKindDonation, 'In-kind donation logged!', () => setNewInKindDonation({ date: getDefaultDate(), donorName: '', itemType: 'Clothes - Adult', description: '', quantity: 1, estimatedValue: 0, notes: '' }), () => setShowInKindForm(false)); };
  const handleBusSubmit = (e: React.FormEvent) => { e.preventDefault(); handleSubmit('transport-bus', newBusPass, 'Bus pass logged!', () => setNewBusPass({ date: getDefaultDate(), clientName: '', passType: 'Daily Pass', quantity: 1, cost: 0, notes: '' }), () => setShowBusForm(false)); };
  const handleUberSubmit = (e: React.FormEvent) => { e.preventDefault(); handleSubmit('transport-uber', newUberEntry, 'Uber ride logged!', () => setNewUberEntry({ date: getDefaultDate(), clientName: '', pickup: '', destination: '', cost: 0, purpose: 'Job Interview', notes: '' }), () => setShowUberForm(false)); };
  const handleWaterSubmit = (e: React.FormEvent) => { e.preventDefault(); handleSubmit('utilities-water', newWaterEntry, 'Water assistance logged!', () => setNewWaterEntry({ date: getDefaultDate(), clientName: '', accountNumber: '', provider: 'Baton Rouge Water Company', amount: 0, notes: '' }), () => setShowWaterForm(false)); };
  const handleElectricSubmit = (e: React.FormEvent) => { e.preventDefault(); handleSubmit('utilities-electric', newElectricEntry, 'Electric assistance logged!', () => setNewElectricEntry({ date: getDefaultDate(), clientName: '', accountNumber: '', provider: 'Entergy', amount: 0, notes: '' }), () => setShowElectricForm(false)); };
  const handleRentSubmit = (e: React.FormEvent) => { e.preventDefault(); handleSubmit('utilities-rent', newRentEntry, 'Rent assistance logged!', () => setNewRentEntry({ date: getDefaultDate(), clientName: '', landlordName: '', propertyAddress: '', amount: 0, notes: '' }), () => setShowRentForm(false)); };

  // Stats
  const stats = {
    diapers: { qty: diaperEntries.reduce((s, e) => s + (e.diapersQty || 0), 0), packs: diaperEntries.reduce((s, e) => s + (e.packs || 0), 0), clients: new Set(diaperEntries.map(e => e.clientName)).size, entries: diaperEntries.length },
    donationsGiven: { count: donationsGiven.length, value: donationsGiven.reduce((s, d) => s + (d.estimatedValue || 0), 0), clients: new Set(donationsGiven.map(d => d.clientName)).size, items: donationsGiven.reduce((s, d) => s + (d.quantity || 0), 0) },
    inKindDonations: { count: inKindDonations.length, value: inKindDonations.reduce((s, d) => s + (d.estimatedValue || 0), 0), donors: new Set(inKindDonations.map(d => d.donorName)).size, items: inKindDonations.reduce((s, d) => s + (d.quantity || 0), 0) },
    busPass: { count: busPassEntries.reduce((s, b) => s + (b.quantity || 0), 0), cost: busPassEntries.reduce((s, b) => s + (b.cost || 0), 0), clients: new Set(busPassEntries.map(b => b.clientName)).size },
    uber: { rides: uberEntries.length, cost: uberEntries.reduce((s, u) => s + (u.cost || 0), 0), clients: new Set(uberEntries.map(u => u.clientName)).size },
    water: { amount: waterEntries.reduce((s, w) => s + (w.amount || 0), 0), families: new Set(waterEntries.map(w => w.clientName)).size, payments: waterEntries.length },
    electric: { amount: electricEntries.reduce((s, e) => s + (e.amount || 0), 0), families: new Set(electricEntries.map(e => e.clientName)).size, payments: electricEntries.length },
    rent: { amount: rentEntries.reduce((s, r) => s + (r.amount || 0), 0), families: new Set(rentEntries.map(r => r.clientName)).size, payments: rentEntries.length }
  };

  const totalUniqueClients = new Set([...diaperEntries.map(e => e.clientName), ...donationsGiven.map(e => e.clientName), ...busPassEntries.map(e => e.clientName), ...uberEntries.map(e => e.clientName), ...waterEntries.map(e => e.clientName), ...electricEntries.map(e => e.clientName), ...rentEntries.map(e => e.clientName)].filter(Boolean)).size;
  const totalResourceValue = stats.donationsGiven.value + stats.inKindDonations.value + stats.busPass.cost + stats.uber.cost + stats.water.amount + stats.electric.amount + stats.rent.amount;

  // Analytics helpers
  const getDiaperSizeBreakdown = () => { const b: Record<string, number> = {}; diaperEntries.forEach(e => { b[e.diaperSize] = (b[e.diaperSize] || 0) + e.diapersQty; }); return Object.entries(b).sort((a, b) => b[1] - a[1]); };
  const getDonationTypeBreakdown = (entries: DonationGivenEntry[] | InKindDonationEntry[]) => { const b: Record<string, { count: number; value: number }> = {}; entries.forEach(e => { if (!b[e.itemType]) b[e.itemType] = { count: 0, value: 0 }; b[e.itemType].count += e.quantity || 0; b[e.itemType].value += e.estimatedValue || 0; }); return Object.entries(b).sort((a, b) => b[1].value - a[1].value); };
  const getBusPassTypeBreakdown = () => { const b: Record<string, { count: number; cost: number }> = {}; busPassEntries.forEach(p => { if (!b[p.passType]) b[p.passType] = { count: 0, cost: 0 }; b[p.passType].count += p.quantity || 0; b[p.passType].cost += p.cost || 0; }); return Object.entries(b).sort((a, b) => b[1].count - a[1].count); };
  const getUberPurposeBreakdown = () => { const b: Record<string, { rides: number; cost: number }> = {}; uberEntries.forEach(u => { const p = u.purpose || 'Other'; if (!b[p]) b[p] = { rides: 0, cost: 0 }; b[p].rides += 1; b[p].cost += u.cost || 0; }); return Object.entries(b).sort((a, b) => b[1].rides - a[1].rides); };
  const getTopClients = (entries: any[], field: string, valueField: string, limit = 5) => { const t: Record<string, number> = {}; entries.forEach(e => { if (e[field]) t[e[field]] = (t[e[field]] || 0) + (e[valueField] || 0); }); return Object.entries(t).sort((a, b) => b[1] - a[1]).slice(0, limit); };
  const getProviderBreakdown = (entries: WaterEntry[] | ElectricEntry[]) => { const b: Record<string, { amount: number; count: number }> = {}; entries.forEach(e => { if (!b[e.provider]) b[e.provider] = { amount: 0, count: 0 }; b[e.provider].amount += e.amount || 0; b[e.provider].count += 1; }); return Object.entries(b).sort((a, b) => b[1].amount - a[1].amount); };

  // Get all activities for timeline
  const getAllActivities = () => {
    const activities: { date: string; type: string; description: string; value?: number; icon: React.ReactNode; color: string }[] = [];
    diaperEntries.forEach(e => activities.push({ date: e.date, type: 'diapers', description: `${e.clientName} received ${e.diapersQty} diapers (${e.diaperSize})`, icon: <Package size={14} />, color: 'bg-blue-500' }));
    donationsGiven.forEach(e => activities.push({ date: e.date, type: 'donation', description: `${e.itemType} given to ${e.clientName}`, value: e.estimatedValue, icon: <Gift size={14} />, color: 'bg-green-500' }));
    busPassEntries.forEach(e => activities.push({ date: e.date, type: 'bus', description: `${e.passType} for ${e.clientName}`, value: e.cost, icon: <Bus size={14} />, color: 'bg-purple-500' }));
    uberEntries.forEach(e => activities.push({ date: e.date, type: 'uber', description: `Uber ride for ${e.clientName}`, value: e.cost, icon: <Car size={14} />, color: 'bg-gray-700' }));
    waterEntries.forEach(e => activities.push({ date: e.date, type: 'water', description: `Water bill for ${e.clientName}`, value: e.amount, icon: <Droplets size={14} />, color: 'bg-blue-400' }));
    electricEntries.forEach(e => activities.push({ date: e.date, type: 'electric', description: `Electric bill for ${e.clientName}`, value: e.amount, icon: <Zap size={14} />, color: 'bg-yellow-500' }));
    rentEntries.forEach(e => activities.push({ date: e.date, type: 'rent', description: `Rent assistance for ${e.clientName}`, value: e.amount, icon: <Home size={14} />, color: 'bg-orange-500' }));
    return activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);
  };

  // Monthly goals (example - could be configurable)
  const goals = { diapers: 500, donations: 2000, transport: 500, utilities: 3000 };

  // Form Modal
  const FormModal: React.FC<{ show: boolean; onClose: () => void; title: string; onSubmit: (e: React.FormEvent) => void; children: React.ReactNode; color: string }> = ({ show, onClose, title, onSubmit, children, color }) => {
    if (!show) return null;
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <div className={`${color} text-white px-6 py-4 rounded-t-xl flex items-center justify-between sticky top-0`}><h3 className="text-lg font-semibold">{title}</h3><button onClick={onClose} className="text-white/80 hover:text-white text-xl">✕</button></div>
          <form onSubmit={onSubmit} className="p-6 space-y-4">{children}<div className="flex gap-3 pt-4"><button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">Cancel</button><button type="submit" disabled={loading} className={`flex-1 px-4 py-2 ${color} text-white rounded-lg hover:opacity-90 disabled:opacity-50 font-medium`}>{loading ? 'Saving...' : 'Save Entry'}</button></div></form>
        </div>
      </div>
    );
  };

  // Simple Bar Chart
  const SimpleBarChart: React.FC<{ data: [string, number][]; color: string; maxBars?: number }> = ({ data, color, maxBars = 6 }) => {
    const d = data.slice(0, maxBars); const max = Math.max(...d.map(x => x[1]), 1);
    return (<div className="space-y-2">{d.map(([label, value], i) => (<div key={i} className="flex items-center gap-2"><div className="w-24 text-xs text-gray-600 truncate" title={label}>{label}</div><div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${(value / max) * 100}%` }} /></div><div className="w-16 text-xs font-medium text-right">{value.toLocaleString()}</div></div>))}</div>);
  };

  // Stat Card (for category tabs)
  const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number; subtext?: string; color: string }> = ({ icon, label, value, subtext, color }) => (
    <div className={`${color} rounded-xl p-4 text-white`}><div className="flex items-center justify-between mb-2"><span className="opacity-80">{icon}</span></div><div className="text-2xl font-bold">{typeof value === 'number' ? value.toLocaleString() : value}</div><div className="text-sm opacity-90">{label}</div>{subtext && <div className="text-xs opacity-75 mt-1">{subtext}</div>}</div>
  );

  // ============================================
  // RENDER: Interactive Dashboard
  // ============================================
  const renderDashboard = () => {
    const activities = getAllActivities();
    const transportTotal = stats.busPass.cost + stats.uber.cost;
    const utilitiesTotal = stats.water.amount + stats.electric.amount + stats.rent.amount;
    
    // Chart data for donut
    const spendingData = [
      { label: 'Donations', value: stats.donationsGiven.value, color: '#22c55e' },
      { label: 'Transport', value: transportTotal, color: '#a855f7' },
      { label: 'Utilities', value: utilitiesTotal, color: '#f97316' },
    ].filter(d => d.value > 0);

    // Mock trend data (in real app, fetch previous months)
    const trendData = [0, 0, 0, 0, 0, totalResourceValue];

    return (
      <div className="space-y-6">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#0F2C5C] via-[#1a4a8a] to-[#2563eb] rounded-2xl p-6 text-white">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={20} className="text-yellow-300" />
              <span className="text-sm font-medium text-blue-200">{MONTHS[selectedMonth]} 2026 Impact Report</span>
            </div>
            <h2 className="text-3xl font-bold mb-6">Resource Distribution Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/10 backdrop-blur rounded-xl p-4 hover:bg-white/20 transition-all cursor-pointer" onClick={() => setActiveTab('diapers')}>
                <Package className="mb-2 text-blue-300" size={24} />
                <div className="text-3xl font-bold"><AnimatedCounter value={stats.diapers.qty} /></div>
                <div className="text-sm text-blue-200">Diapers Distributed</div>
                <div className="mt-2 flex items-center gap-1 text-xs text-green-300">
                  <TrendingUp size={12} /> <span>{stats.diapers.clients} families</span>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-4 hover:bg-white/20 transition-all cursor-pointer" onClick={() => setActiveTab('donations')}>
                <Gift className="mb-2 text-green-300" size={24} />
                <div className="text-3xl font-bold"><AnimatedCounter value={stats.donationsGiven.value + stats.inKindDonations.value} prefix="$" /></div>
                <div className="text-sm text-blue-200">Donation Value</div>
                <div className="mt-2 flex items-center gap-1 text-xs text-green-300">
                  <TrendingUp size={12} /> <span>{stats.donationsGiven.clients} recipients</span>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-4 hover:bg-white/20 transition-all cursor-pointer" onClick={() => setActiveTab('transport')}>
                <Bus className="mb-2 text-purple-300" size={24} />
                <div className="text-3xl font-bold"><AnimatedCounter value={transportTotal} prefix="$" /></div>
                <div className="text-sm text-blue-200">Transportation</div>
                <div className="mt-2 flex items-center gap-1 text-xs text-green-300">
                  <TrendingUp size={12} /> <span>{stats.busPass.count + stats.uber.rides} trips</span>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-4 hover:bg-white/20 transition-all cursor-pointer" onClick={() => setActiveTab('utilities')}>
                <Zap className="mb-2 text-yellow-300" size={24} />
                <div className="text-3xl font-bold"><AnimatedCounter value={utilitiesTotal} prefix="$" /></div>
                <div className="text-sm text-blue-200">Utility Assistance</div>
                <div className="mt-2 flex items-center gap-1 text-xs text-green-300">
                  <TrendingUp size={12} /> <span>{stats.water.families + stats.electric.families + stats.rent.families} families</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2"><Plus size={18} className="text-blue-600" /> Quick Log</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
            {[
              { label: 'Diapers', icon: <Package size={16} />, color: 'bg-blue-500 hover:bg-blue-600', action: () => setShowDiaperForm(true) },
              { label: 'Donation', icon: <Gift size={16} />, color: 'bg-green-500 hover:bg-green-600', action: () => setShowDonationGivenForm(true) },
              { label: 'In-Kind', icon: <Gift size={16} />, color: 'bg-emerald-500 hover:bg-emerald-600', action: () => setShowInKindForm(true) },
              { label: 'Bus Pass', icon: <Bus size={16} />, color: 'bg-purple-500 hover:bg-purple-600', action: () => setShowBusForm(true) },
              { label: 'Uber', icon: <Car size={16} />, color: 'bg-gray-700 hover:bg-gray-800', action: () => setShowUberForm(true) },
              { label: 'Water', icon: <Droplets size={16} />, color: 'bg-blue-400 hover:bg-blue-500', action: () => setShowWaterForm(true) },
              { label: 'Electric', icon: <Zap size={16} />, color: 'bg-yellow-500 hover:bg-yellow-600', action: () => setShowElectricForm(true) },
              { label: 'Rent', icon: <Home size={16} />, color: 'bg-orange-500 hover:bg-orange-600', action: () => setShowRentForm(true) },
            ].map((btn, i) => (
              <button key={i} onClick={btn.action} className={`${btn.color} text-white rounded-lg p-3 flex flex-col items-center gap-1 transition-all transform hover:scale-105 active:scale-95`}>
                {btn.icon}
                <span className="text-xs font-medium">{btn.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Spending Breakdown */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><PieChart size={18} className="text-blue-600" /> Spending Breakdown</h3>
            {spendingData.length > 0 ? (
              <div className="flex flex-col items-center">
                <DonutChart data={spendingData} onSegmentClick={(label) => {
                  if (label === 'Donations') setActiveTab('donations');
                  else if (label === 'Transport') setActiveTab('transport');
                  else if (label === 'Utilities') setActiveTab('utilities');
                }} />
                <div className="mt-4 flex flex-wrap justify-center gap-3">
                  {spendingData.map((d, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className="text-gray-600">{d.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <PieChart size={48} className="mb-2 opacity-50" />
                <p>No spending data yet</p>
                <p className="text-sm">Log entries to see breakdown</p>
              </div>
            )}
          </div>

          {/* Goals Progress */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><Target size={18} className="text-green-600" /> Monthly Goals</h3>
            <div className="space-y-6">
              {[
                { label: 'Diapers', current: stats.diapers.qty, goal: goals.diapers, color: '#3b82f6', icon: <Package size={16} /> },
                { label: 'Donations', current: stats.donationsGiven.value, goal: goals.donations, color: '#22c55e', icon: <Gift size={16} />, prefix: '$' },
                { label: 'Transport', current: transportTotal, goal: goals.transport, color: '#a855f7', icon: <Bus size={16} />, prefix: '$' },
                { label: 'Utilities', current: utilitiesTotal, goal: goals.utilities, color: '#f97316', icon: <Zap size={16} />, prefix: '$' },
              ].map((g, i) => {
                const pct = Math.min((g.current / g.goal) * 100, 100);
                return (
                  <div key={i} className="flex items-center gap-4">
                    <div className="relative">
                      <ProgressRing progress={pct} size={60} strokeWidth={6} color={g.color} />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-bold" style={{ color: g.color }}>{Math.round(pct)}%</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700 flex items-center gap-1">{g.icon} {g.label}</span>
                        <span className="text-xs text-gray-500">{g.prefix || ''}{g.current.toLocaleString()} / {g.prefix || ''}{g.goal.toLocaleString()}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%`, backgroundColor: g.color }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Impact Stats */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><Award size={18} className="text-yellow-600" /> Impact Summary</h3>
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-blue-700"><AnimatedCounter value={totalUniqueClients} /></div>
                    <div className="text-sm text-blue-600">Families Served</div>
                  </div>
                  <Users size={40} className="text-blue-300" />
                </div>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-green-700"><AnimatedCounter value={totalResourceValue} prefix="$" /></div>
                    <div className="text-sm text-green-600">Total Resources</div>
                  </div>
                  <DollarSign size={40} className="text-green-300" />
                </div>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-purple-700"><AnimatedCounter value={diaperEntries.length + donationsGiven.length + busPassEntries.length + uberEntries.length + waterEntries.length + electricEntries.length + rentEntries.length} /></div>
                    <div className="text-sm text-purple-600">Total Transactions</div>
                  </div>
                  <Activity size={40} className="text-purple-300" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Timeline & Category Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Activity Timeline */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><Clock size={18} className="text-blue-600" /> Recent Activity</h3>
            {activities.length > 0 ? (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {activities.map((activity, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className={`${activity.color} text-white p-2 rounded-lg`}>{activity.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 truncate">{activity.description}</p>
                      <p className="text-xs text-gray-400">{activity.date}</p>
                    </div>
                    {activity.value !== undefined && (
                      <div className="text-sm font-semibold text-gray-700">${activity.value}</div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <Clock size={48} className="mb-2 opacity-50" />
                <p>No recent activity</p>
                <p className="text-sm">Start logging to see your timeline</p>
              </div>
            )}
          </div>

          {/* Category Quick Stats */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><BarChart3 size={18} className="text-blue-600" /> Category Breakdown</h3>
            <div className="space-y-3">
              {[
                { label: 'Diapers', value: `${stats.diapers.qty} diapers`, sub: `${stats.diapers.packs} packs • ${stats.diapers.clients} families`, color: 'border-l-blue-500', icon: <Package size={18} className="text-blue-500" />, tab: 'diapers' as TabType },
                { label: 'Donations Given', value: `$${stats.donationsGiven.value}`, sub: `${stats.donationsGiven.items} items • ${stats.donationsGiven.clients} recipients`, color: 'border-l-green-500', icon: <Gift size={18} className="text-green-500" />, tab: 'donations' as TabType },
                { label: 'In-Kind Received', value: `$${stats.inKindDonations.value}`, sub: `${stats.inKindDonations.items} items • ${stats.inKindDonations.donors} donors`, color: 'border-l-emerald-500', icon: <Gift size={18} className="text-emerald-500" />, tab: 'donations' as TabType },
                { label: 'Bus Passes', value: `$${stats.busPass.cost}`, sub: `${stats.busPass.count} passes • ${stats.busPass.clients} clients`, color: 'border-l-purple-500', icon: <Bus size={18} className="text-purple-500" />, tab: 'transport' as TabType },
                { label: 'Uber Rides', value: `$${stats.uber.cost}`, sub: `${stats.uber.rides} rides • ${stats.uber.clients} clients`, color: 'border-l-gray-700', icon: <Car size={18} className="text-gray-700" />, tab: 'transport' as TabType },
                { label: 'Water Bills', value: `$${stats.water.amount}`, sub: `${stats.water.payments} payments • ${stats.water.families} families`, color: 'border-l-blue-400', icon: <Droplets size={18} className="text-blue-400" />, tab: 'utilities' as TabType },
                { label: 'Electric Bills', value: `$${stats.electric.amount}`, sub: `${stats.electric.payments} payments • ${stats.electric.families} families`, color: 'border-l-yellow-500', icon: <Zap size={18} className="text-yellow-500" />, tab: 'utilities' as TabType },
                { label: 'Rent Assistance', value: `$${stats.rent.amount}`, sub: `${stats.rent.payments} payments • ${stats.rent.families} families`, color: 'border-l-orange-500', icon: <Home size={18} className="text-orange-500" />, tab: 'utilities' as TabType },
              ].map((cat, i) => (
                <div key={i} onClick={() => setActiveTab(cat.tab)} className={`flex items-center gap-3 p-3 bg-gray-50 rounded-lg border-l-4 ${cat.color} cursor-pointer hover:bg-gray-100 transition-colors`}>
                  {cat.icon}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-800">{cat.label}</span>
                      <span className="font-bold text-gray-900">{cat.value}</span>
                    </div>
                    <div className="text-xs text-gray-500">{cat.sub}</div>
                  </div>
                  <ChevronRight size={16} className="text-gray-400" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ============================================
  // RENDER: Diapers Tab
  // ============================================
  const renderDiapersTab = () => {
    const sizeBreakdown = getDiaperSizeBreakdown();
    const topClients = getTopClients(diaperEntries, 'clientName', 'diapersQty', 5);
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between"><h2 className="text-xl font-semibold text-gray-800">📦 Diaper Distribution - {MONTHS[selectedMonth]}</h2><button onClick={() => setShowDiaperForm(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"><span>+</span> Log Distribution</button></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={<Package size={20} />} label="Total Diapers" value={stats.diapers.qty} color="bg-gradient-to-br from-blue-500 to-blue-600" />
          <StatCard icon={<BarChart3 size={20} />} label="Total Packs" value={stats.diapers.packs} color="bg-gradient-to-br from-blue-400 to-blue-500" />
          <StatCard icon={<Users size={20} />} label="Families Served" value={stats.diapers.clients} color="bg-gradient-to-br from-blue-600 to-blue-700" />
          <StatCard icon={<Calendar size={20} />} label="Distributions" value={stats.diapers.entries} color="bg-gradient-to-br from-blue-500 to-indigo-600" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6"><h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2"><PieChart size={16} /> Distribution by Size</h3>{sizeBreakdown.length > 0 ? <SimpleBarChart data={sizeBreakdown} color="bg-blue-500" /> : <p className="text-gray-500 text-center py-4">No data yet</p>}</div>
          <div className="bg-white rounded-xl shadow-md p-6"><h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2"><TrendingUp size={16} /> Top Recipients</h3>{topClients.length > 0 ? <div className="space-y-2">{topClients.map(([n, q], i) => (<div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"><span className="font-medium text-sm">{n}</span><span className="text-blue-600 font-bold">{q} diapers</span></div>))}</div> : <p className="text-gray-500 text-center py-4">No data yet</p>}</div>
        </div>
        <div className="bg-white rounded-xl shadow-md overflow-hidden"><div className="px-4 py-3 bg-gray-50 border-b flex items-center justify-between"><h3 className="font-semibold text-gray-700">All Distributions</h3><span className="text-sm text-gray-500">{diaperEntries.length} records</span></div><div className="overflow-x-auto"><table className="w-full"><thead><tr className="bg-[#0F2C5C] text-white"><th className="px-4 py-3 text-left text-xs font-semibold uppercase">Date</th><th className="px-4 py-3 text-left text-xs font-semibold uppercase">Client</th><th className="px-4 py-3 text-left text-xs font-semibold uppercase">Size</th><th className="px-4 py-3 text-right text-xs font-semibold uppercase">Qty</th><th className="px-4 py-3 text-right text-xs font-semibold uppercase">Packs</th><th className="px-4 py-3 text-left text-xs font-semibold uppercase">Notes</th></tr></thead><tbody className="divide-y divide-gray-100">{diaperEntries.length === 0 ? <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-500">No entries. Click "Log Distribution" to add.</td></tr> : diaperEntries.map((e, i) => (<tr key={i} className="hover:bg-gray-50"><td className="px-4 py-3 text-sm">{e.date}</td><td className="px-4 py-3 text-sm font-medium">{e.clientName}</td><td className="px-4 py-3"><span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">{e.diaperSize}</span></td><td className="px-4 py-3 text-sm text-right font-medium">{e.diapersQty}</td><td className="px-4 py-3 text-sm text-right">{e.packs}</td><td className="px-4 py-3 text-sm text-gray-500">{e.notes || '—'}</td></tr>))}</tbody></table></div></div>
        <FormModal show={showDiaperForm} onClose={() => setShowDiaperForm(false)} title="New Diaper Distribution" onSubmit={handleDiaperSubmit} color="bg-blue-600">
          <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">Date *</label><input type="date" value={newDiaperEntry.date} onChange={(e) => setNewDiaperEntry({...newDiaperEntry, date: e.target.value})} className="w-full px-3 py-2 border rounded-lg" required /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Size *</label><select value={newDiaperEntry.diaperSize} onChange={(e) => setNewDiaperEntry({...newDiaperEntry, diaperSize: e.target.value})} className="w-full px-3 py-2 border rounded-lg">{DIAPER_SIZES.map(s => <option key={s} value={s}>{s}</option>)}</select></div></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Client Name *</label><input type="text" value={newDiaperEntry.clientName} onChange={(e) => setNewDiaperEntry({...newDiaperEntry, clientName: e.target.value})} placeholder="Enter father's name" className="w-full px-3 py-2 border rounded-lg" required /></div>
          <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">Diapers Qty *</label><input type="number" value={newDiaperEntry.diapersQty || ''} onChange={(e) => setNewDiaperEntry({...newDiaperEntry, diapersQty: Number(e.target.value)})} min="0" className="w-full px-3 py-2 border rounded-lg" required /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Packs</label><input type="number" value={newDiaperEntry.packs || ''} onChange={(e) => setNewDiaperEntry({...newDiaperEntry, packs: Number(e.target.value)})} min="0" className="w-full px-3 py-2 border rounded-lg" /></div></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Notes</label><textarea value={newDiaperEntry.notes} onChange={(e) => setNewDiaperEntry({...newDiaperEntry, notes: e.target.value})} rows={2} className="w-full px-3 py-2 border rounded-lg" /></div>
        </FormModal>
      </div>
    );
  };

  // ============================================
  // RENDER: Donations Tab
  // ============================================
  const renderDonationsTab = () => {
    const givenBreakdown = getDonationTypeBreakdown(donationsGiven);
    const inKindBreakdown = getDonationTypeBreakdown(inKindDonations);
    const topRecipients = getTopClients(donationsGiven, 'clientName', 'estimatedValue', 5);
    const topDonors = getTopClients(inKindDonations, 'donorName', 'estimatedValue', 5);
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-800">🎁 Donations - {MONTHS[selectedMonth]}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={<Gift size={20} />} label="Given Out Value" value={`$${stats.donationsGiven.value.toLocaleString()}`} subtext={`${stats.donationsGiven.items} items`} color="bg-gradient-to-br from-green-500 to-green-600" />
          <StatCard icon={<Users size={20} />} label="Clients Helped" value={stats.donationsGiven.clients} color="bg-gradient-to-br from-green-400 to-green-500" />
          <StatCard icon={<DollarSign size={20} />} label="In-Kind Received" value={`$${stats.inKindDonations.value.toLocaleString()}`} subtext={`${stats.inKindDonations.items} items`} color="bg-gradient-to-br from-emerald-500 to-emerald-600" />
          <StatCard icon={<Users size={20} />} label="Active Donors" value={stats.inKindDonations.donors} color="bg-gradient-to-br from-emerald-400 to-emerald-500" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-green-600 text-white px-4 py-3 flex items-center justify-between"><h3 className="font-semibold">📤 Donations Given</h3><button onClick={() => setShowDonationGivenForm(true)} className="px-3 py-1 bg-white/20 rounded-lg hover:bg-white/30 text-sm">+ Add</button></div>
              <div className="p-4"><h4 className="text-sm font-medium text-gray-600 mb-3">By Category</h4>{givenBreakdown.length > 0 ? <SimpleBarChart data={givenBreakdown.map(([t, d]) => [t, d.value])} color="bg-green-500" /> : <p className="text-gray-500 text-center py-4 text-sm">No donations given</p>}</div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4"><h4 className="text-sm font-medium text-gray-600 mb-3">Top Recipients</h4>{topRecipients.length > 0 ? <div className="space-y-2">{topRecipients.map(([n, v], i) => (<div key={i} className="flex justify-between p-2 bg-gray-50 rounded-lg"><span className="font-medium text-sm">{n}</span><span className="text-green-600 font-bold">${v}</span></div>))}</div> : <p className="text-gray-500 text-center py-4 text-sm">No data</p>}</div>
            <div className="bg-white rounded-xl shadow-md overflow-hidden"><div className="px-4 py-3 bg-gray-50 border-b"><h4 className="font-medium text-gray-700">Recent Given</h4></div><div className="divide-y max-h-64 overflow-y-auto">{donationsGiven.length === 0 ? <p className="text-gray-500 text-center py-6 text-sm">No donations</p> : donationsGiven.slice(0, 10).map((d, i) => (<div key={i} className="p-3 hover:bg-gray-50"><div className="flex justify-between"><div><div className="font-medium">{d.clientName}</div><div className="text-sm text-gray-500">{d.itemType} - {d.description}</div></div><div className="text-right"><div className="font-medium text-green-600">${d.estimatedValue}</div><div className="text-xs text-gray-400">{d.date}</div></div></div></div>))}</div></div>
          </div>
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-emerald-600 text-white px-4 py-3 flex items-center justify-between"><h3 className="font-semibold">📥 In-Kind Received</h3><button onClick={() => setShowInKindForm(true)} className="px-3 py-1 bg-white/20 rounded-lg hover:bg-white/30 text-sm">+ Add</button></div>
              <div className="p-4"><h4 className="text-sm font-medium text-gray-600 mb-3">By Category</h4>{inKindBreakdown.length > 0 ? <SimpleBarChart data={inKindBreakdown.map(([t, d]) => [t, d.value])} color="bg-emerald-500" /> : <p className="text-gray-500 text-center py-4 text-sm">No in-kind donations</p>}</div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4"><h4 className="text-sm font-medium text-gray-600 mb-3">Top Donors</h4>{topDonors.length > 0 ? <div className="space-y-2">{topDonors.map(([n, v], i) => (<div key={i} className="flex justify-between p-2 bg-gray-50 rounded-lg"><span className="font-medium text-sm">{n}</span><span className="text-emerald-600 font-bold">${v}</span></div>))}</div> : <p className="text-gray-500 text-center py-4 text-sm">No data</p>}</div>
            <div className="bg-white rounded-xl shadow-md overflow-hidden"><div className="px-4 py-3 bg-gray-50 border-b"><h4 className="font-medium text-gray-700">Recent Received</h4></div><div className="divide-y max-h-64 overflow-y-auto">{inKindDonations.length === 0 ? <p className="text-gray-500 text-center py-6 text-sm">No donations</p> : inKindDonations.slice(0, 10).map((d, i) => (<div key={i} className="p-3 hover:bg-gray-50"><div className="flex justify-between"><div><div className="font-medium">{d.donorName}</div><div className="text-sm text-gray-500">{d.itemType} - {d.description}</div></div><div className="text-right"><div className="font-medium text-emerald-600">${d.estimatedValue}</div><div className="text-xs text-gray-400">{d.date}</div></div></div></div>))}</div></div>
          </div>
        </div>
        <FormModal show={showDonationGivenForm} onClose={() => setShowDonationGivenForm(false)} title="Log Donation Given" onSubmit={handleDonationGivenSubmit} color="bg-green-600">
          <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">Date *</label><input type="date" value={newDonationGiven.date} onChange={(e) => setNewDonationGiven({...newDonationGiven, date: e.target.value})} className="w-full px-3 py-2 border rounded-lg" required /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Item Type *</label><select value={newDonationGiven.itemType} onChange={(e) => setNewDonationGiven({...newDonationGiven, itemType: e.target.value})} className="w-full px-3 py-2 border rounded-lg">{DONATION_ITEM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Client Name *</label><input type="text" value={newDonationGiven.clientName} onChange={(e) => setNewDonationGiven({...newDonationGiven, clientName: e.target.value})} placeholder="Enter client's name" className="w-full px-3 py-2 border rounded-lg" required /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Description *</label><input type="text" value={newDonationGiven.description} onChange={(e) => setNewDonationGiven({...newDonationGiven, description: e.target.value})} placeholder="e.g., Winter coat, Size L" className="w-full px-3 py-2 border rounded-lg" required /></div>
          <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label><input type="number" value={newDonationGiven.quantity || ''} onChange={(e) => setNewDonationGiven({...newDonationGiven, quantity: Number(e.target.value)})} min="1" className="w-full px-3 py-2 border rounded-lg" /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Est. Value ($)</label><input type="number" value={newDonationGiven.estimatedValue || ''} onChange={(e) => setNewDonationGiven({...newDonationGiven, estimatedValue: Number(e.target.value)})} min="0" step="0.01" className="w-full px-3 py-2 border rounded-lg" /></div></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Notes</label><textarea value={newDonationGiven.notes} onChange={(e) => setNewDonationGiven({...newDonationGiven, notes: e.target.value})} rows={2} className="w-full px-3 py-2 border rounded-lg" /></div>
        </FormModal>
        <FormModal show={showInKindForm} onClose={() => setShowInKindForm(false)} title="Log In-Kind Donation" onSubmit={handleInKindSubmit} color="bg-emerald-600">
          <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">Date *</label><input type="date" value={newInKindDonation.date} onChange={(e) => setNewInKindDonation({...newInKindDonation, date: e.target.value})} className="w-full px-3 py-2 border rounded-lg" required /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Item Type *</label><select value={newInKindDonation.itemType} onChange={(e) => setNewInKindDonation({...newInKindDonation, itemType: e.target.value})} className="w-full px-3 py-2 border rounded-lg">{DONATION_ITEM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Donor Name *</label><input type="text" value={newInKindDonation.donorName} onChange={(e) => setNewInKindDonation({...newInKindDonation, donorName: e.target.value})} placeholder="Enter donor's name or org" className="w-full px-3 py-2 border rounded-lg" required /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Description *</label><input type="text" value={newInKindDonation.description} onChange={(e) => setNewInKindDonation({...newInKindDonation, description: e.target.value})} placeholder="e.g., 50 canned goods" className="w-full px-3 py-2 border rounded-lg" required /></div>
          <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label><input type="number" value={newInKindDonation.quantity || ''} onChange={(e) => setNewInKindDonation({...newInKindDonation, quantity: Number(e.target.value)})} min="1" className="w-full px-3 py-2 border rounded-lg" /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Est. Value ($)</label><input type="number" value={newInKindDonation.estimatedValue || ''} onChange={(e) => setNewInKindDonation({...newInKindDonation, estimatedValue: Number(e.target.value)})} min="0" step="0.01" className="w-full px-3 py-2 border rounded-lg" /></div></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Notes</label><textarea value={newInKindDonation.notes} onChange={(e) => setNewInKindDonation({...newInKindDonation, notes: e.target.value})} rows={2} className="w-full px-3 py-2 border rounded-lg" /></div>
        </FormModal>
      </div>
    );
  };

  // ============================================
  // RENDER: Transport Tab
  // ============================================
  const renderTransportTab = () => {
    const busBreakdown = getBusPassTypeBreakdown();
    const uberBreakdown = getUberPurposeBreakdown();
    const topBusClients = getTopClients(busPassEntries, 'clientName', 'cost', 5);
    const topUberClients = getTopClients(uberEntries, 'clientName', 'cost', 5);
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-800">🚌 Transportation - {MONTHS[selectedMonth]}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={<Bus size={20} />} label="Bus Passes" value={stats.busPass.count} subtext={`$${stats.busPass.cost} total`} color="bg-gradient-to-br from-purple-500 to-purple-600" />
          <StatCard icon={<Users size={20} />} label="Bus Clients" value={stats.busPass.clients} color="bg-gradient-to-br from-purple-400 to-purple-500" />
          <StatCard icon={<Car size={20} />} label="Uber Rides" value={stats.uber.rides} subtext={`$${stats.uber.cost} total`} color="bg-gradient-to-br from-gray-700 to-gray-800" />
          <StatCard icon={<Users size={20} />} label="Uber Clients" value={stats.uber.clients} color="bg-gradient-to-br from-gray-600 to-gray-700" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-purple-600 text-white px-4 py-3 flex items-center justify-between"><h3 className="font-semibold">🚍 C.A.T. Bus Passes</h3><button onClick={() => setShowBusForm(true)} className="px-3 py-1 bg-white/20 rounded-lg hover:bg-white/30 text-sm">+ Add</button></div>
              <div className="p-4"><h4 className="text-sm font-medium text-gray-600 mb-3">By Pass Type</h4>{busBreakdown.length > 0 ? <SimpleBarChart data={busBreakdown.map(([t, d]) => [t, d.count])} color="bg-purple-500" /> : <p className="text-gray-500 text-center py-4 text-sm">No bus passes</p>}</div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4"><h4 className="text-sm font-medium text-gray-600 mb-3">Top Bus Recipients</h4>{topBusClients.length > 0 ? <div className="space-y-2">{topBusClients.map(([n, c], i) => (<div key={i} className="flex justify-between p-2 bg-gray-50 rounded-lg"><span className="font-medium text-sm">{n}</span><span className="text-purple-600 font-bold">${c}</span></div>))}</div> : <p className="text-gray-500 text-center py-4 text-sm">No data</p>}</div>
            <div className="bg-white rounded-xl shadow-md overflow-hidden"><div className="px-4 py-3 bg-gray-50 border-b"><h4 className="font-medium text-gray-700">Recent Bus Passes</h4></div><div className="divide-y max-h-48 overflow-y-auto">{busPassEntries.length === 0 ? <p className="text-gray-500 text-center py-6 text-sm">No passes</p> : busPassEntries.slice(0, 8).map((b, i) => (<div key={i} className="p-3 hover:bg-gray-50 flex justify-between"><div><div className="font-medium text-sm">{b.clientName}</div><div className="text-xs text-gray-500">{b.passType} x{b.quantity}</div></div><div className="text-right"><div className="font-medium text-purple-600">${b.cost}</div><div className="text-xs text-gray-400">{b.date}</div></div></div>))}</div></div>
          </div>
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-gray-800 text-white px-4 py-3 flex items-center justify-between"><h3 className="font-semibold">🚗 Uber Rides</h3><button onClick={() => setShowUberForm(true)} className="px-3 py-1 bg-white/20 rounded-lg hover:bg-white/30 text-sm">+ Add</button></div>
              <div className="p-4"><h4 className="text-sm font-medium text-gray-600 mb-3">By Purpose</h4>{uberBreakdown.length > 0 ? <SimpleBarChart data={uberBreakdown.map(([p, d]) => [p, d.rides])} color="bg-gray-700" /> : <p className="text-gray-500 text-center py-4 text-sm">No Uber rides</p>}</div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4"><h4 className="text-sm font-medium text-gray-600 mb-3">Top Uber Users</h4>{topUberClients.length > 0 ? <div className="space-y-2">{topUberClients.map(([n, c], i) => (<div key={i} className="flex justify-between p-2 bg-gray-50 rounded-lg"><span className="font-medium text-sm">{n}</span><span className="text-gray-700 font-bold">${c}</span></div>))}</div> : <p className="text-gray-500 text-center py-4 text-sm">No data</p>}</div>
            <div className="bg-white rounded-xl shadow-md overflow-hidden"><div className="px-4 py-3 bg-gray-50 border-b"><h4 className="font-medium text-gray-700">Recent Uber Rides</h4></div><div className="divide-y max-h-48 overflow-y-auto">{uberEntries.length === 0 ? <p className="text-gray-500 text-center py-6 text-sm">No rides</p> : uberEntries.slice(0, 8).map((u, i) => (<div key={i} className="p-3 hover:bg-gray-50"><div className="flex justify-between"><div><div className="font-medium text-sm">{u.clientName}</div><div className="text-xs text-gray-500">{u.pickup} → {u.destination}</div></div><div className="text-right"><div className="font-medium text-gray-700">${u.cost}</div><div className="text-xs text-gray-400">{u.date}</div></div></div></div>))}</div></div>
          </div>
        </div>
        <FormModal show={showBusForm} onClose={() => setShowBusForm(false)} title="Log C.A.T. Bus Pass" onSubmit={handleBusSubmit} color="bg-purple-600">
          <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">Date *</label><input type="date" value={newBusPass.date} onChange={(e) => setNewBusPass({...newBusPass, date: e.target.value})} className="w-full px-3 py-2 border rounded-lg" required /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Pass Type *</label><select value={newBusPass.passType} onChange={(e) => setNewBusPass({...newBusPass, passType: e.target.value})} className="w-full px-3 py-2 border rounded-lg">{BUS_PASS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Client Name *</label><input type="text" value={newBusPass.clientName} onChange={(e) => setNewBusPass({...newBusPass, clientName: e.target.value})} placeholder="Enter client's name" className="w-full px-3 py-2 border rounded-lg" required /></div>
          <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label><input type="number" value={newBusPass.quantity || ''} onChange={(e) => setNewBusPass({...newBusPass, quantity: Number(e.target.value)})} min="1" className="w-full px-3 py-2 border rounded-lg" /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Cost ($) *</label><input type="number" value={newBusPass.cost || ''} onChange={(e) => setNewBusPass({...newBusPass, cost: Number(e.target.value)})} min="0" step="0.01" className="w-full px-3 py-2 border rounded-lg" required /></div></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Notes</label><textarea value={newBusPass.notes} onChange={(e) => setNewBusPass({...newBusPass, notes: e.target.value})} rows={2} className="w-full px-3 py-2 border rounded-lg" /></div>
        </FormModal>
        <FormModal show={showUberForm} onClose={() => setShowUberForm(false)} title="Log Uber Ride" onSubmit={handleUberSubmit} color="bg-gray-800">
          <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">Date *</label><input type="date" value={newUberEntry.date} onChange={(e) => setNewUberEntry({...newUberEntry, date: e.target.value})} className="w-full px-3 py-2 border rounded-lg" required /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Purpose *</label><select value={newUberEntry.purpose} onChange={(e) => setNewUberEntry({...newUberEntry, purpose: e.target.value})} className="w-full px-3 py-2 border rounded-lg">{RIDE_PURPOSES.map(p => <option key={p} value={p}>{p}</option>)}</select></div></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Client Name *</label><input type="text" value={newUberEntry.clientName} onChange={(e) => setNewUberEntry({...newUberEntry, clientName: e.target.value})} placeholder="Enter client's name" className="w-full px-3 py-2 border rounded-lg" required /></div>
          <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">Pickup *</label><input type="text" value={newUberEntry.pickup} onChange={(e) => setNewUberEntry({...newUberEntry, pickup: e.target.value})} placeholder="e.g., FOAM Office" className="w-full px-3 py-2 border rounded-lg" required /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Destination *</label><input type="text" value={newUberEntry.destination} onChange={(e) => setNewUberEntry({...newUberEntry, destination: e.target.value})} placeholder="e.g., Job Interview" className="w-full px-3 py-2 border rounded-lg" required /></div></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Cost ($) *</label><input type="number" value={newUberEntry.cost || ''} onChange={(e) => setNewUberEntry({...newUberEntry, cost: Number(e.target.value)})} min="0" step="0.01" className="w-full px-3 py-2 border rounded-lg" required /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Notes</label><textarea value={newUberEntry.notes} onChange={(e) => setNewUberEntry({...newUberEntry, notes: e.target.value})} rows={2} className="w-full px-3 py-2 border rounded-lg" /></div>
        </FormModal>
      </div>
    );
  };

  // ============================================
  // RENDER: Utilities Tab
  // ============================================
  const renderUtilitiesTab = () => {
    const waterProviders = getProviderBreakdown(waterEntries);
    const electricProviders = getProviderBreakdown(electricEntries);
    const topRent = getTopClients(rentEntries, 'clientName', 'amount', 5);
    const totalUtil = stats.water.amount + stats.electric.amount + stats.rent.amount;
    const avgWater = stats.water.payments > 0 ? Math.round(stats.water.amount / stats.water.payments) : 0;
    const avgElec = stats.electric.payments > 0 ? Math.round(stats.electric.amount / stats.electric.payments) : 0;
    const avgRent = stats.rent.payments > 0 ? Math.round(stats.rent.amount / stats.rent.payments) : 0;
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-800">⚡ Utility Assistance - {MONTHS[selectedMonth]}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={<DollarSign size={20} />} label="Total Assistance" value={`$${totalUtil.toLocaleString()}`} color="bg-gradient-to-br from-orange-500 to-orange-600" />
          <StatCard icon={<Droplets size={20} />} label="Water" value={`$${stats.water.amount.toLocaleString()}`} subtext={`${stats.water.families} families`} color="bg-gradient-to-br from-blue-500 to-blue-600" />
          <StatCard icon={<Zap size={20} />} label="Electric" value={`$${stats.electric.amount.toLocaleString()}`} subtext={`${stats.electric.families} families`} color="bg-gradient-to-br from-yellow-500 to-yellow-600" />
          <StatCard icon={<Home size={20} />} label="Rent" value={`$${stats.rent.amount.toLocaleString()}`} subtext={`${stats.rent.families} families`} color="bg-gradient-to-br from-orange-500 to-red-500" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-blue-500 text-white px-4 py-3 flex items-center justify-between"><h3 className="font-semibold">💧 Water</h3><button onClick={() => setShowWaterForm(true)} className="px-3 py-1 bg-white/20 rounded-lg hover:bg-white/30 text-sm">+ Add</button></div>
              <div className="p-4"><div className="grid grid-cols-2 gap-3 mb-4"><div className="bg-blue-50 rounded-lg p-3 text-center"><div className="text-lg font-bold text-blue-700">${stats.water.amount}</div><div className="text-xs text-blue-600">Total</div></div><div className="bg-blue-50 rounded-lg p-3 text-center"><div className="text-lg font-bold text-blue-700">${avgWater}</div><div className="text-xs text-blue-600">Avg Payment</div></div></div><h4 className="text-xs font-medium text-gray-600 mb-2">By Provider</h4>{waterProviders.length > 0 ? <SimpleBarChart data={waterProviders.map(([p, d]) => [p, d.amount])} color="bg-blue-500" maxBars={4} /> : <p className="text-gray-500 text-center py-2 text-xs">No data</p>}</div>
            </div>
            <div className="bg-white rounded-xl shadow-md overflow-hidden"><div className="px-4 py-2 bg-gray-50 border-b"><h4 className="text-sm font-medium">Recent</h4></div><div className="divide-y max-h-40 overflow-y-auto">{waterEntries.slice(0, 5).map((w, i) => (<div key={i} className="p-2 hover:bg-gray-50 flex justify-between"><span className="text-sm font-medium">{w.clientName}</span><span className="text-blue-600 font-medium">${w.amount}</span></div>))}{waterEntries.length === 0 && <p className="text-gray-500 text-center py-4 text-xs">No payments</p>}</div></div>
          </div>
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-yellow-500 text-white px-4 py-3 flex items-center justify-between"><h3 className="font-semibold">⚡ Electric</h3><button onClick={() => setShowElectricForm(true)} className="px-3 py-1 bg-white/20 rounded-lg hover:bg-white/30 text-sm">+ Add</button></div>
              <div className="p-4"><div className="grid grid-cols-2 gap-3 mb-4"><div className="bg-yellow-50 rounded-lg p-3 text-center"><div className="text-lg font-bold text-yellow-700">${stats.electric.amount}</div><div className="text-xs text-yellow-600">Total</div></div><div className="bg-yellow-50 rounded-lg p-3 text-center"><div className="text-lg font-bold text-yellow-700">${avgElec}</div><div className="text-xs text-yellow-600">Avg Payment</div></div></div><h4 className="text-xs font-medium text-gray-600 mb-2">By Provider</h4>{electricProviders.length > 0 ? <SimpleBarChart data={electricProviders.map(([p, d]) => [p, d.amount])} color="bg-yellow-500" maxBars={4} /> : <p className="text-gray-500 text-center py-2 text-xs">No data</p>}</div>
            </div>
            <div className="bg-white rounded-xl shadow-md overflow-hidden"><div className="px-4 py-2 bg-gray-50 border-b"><h4 className="text-sm font-medium">Recent</h4></div><div className="divide-y max-h-40 overflow-y-auto">{electricEntries.slice(0, 5).map((e, i) => (<div key={i} className="p-2 hover:bg-gray-50 flex justify-between"><span className="text-sm font-medium">{e.clientName}</span><span className="text-yellow-600 font-medium">${e.amount}</span></div>))}{electricEntries.length === 0 && <p className="text-gray-500 text-center py-4 text-xs">No payments</p>}</div></div>
          </div>
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-orange-500 text-white px-4 py-3 flex items-center justify-between"><h3 className="font-semibold">🏠 Rent</h3><button onClick={() => setShowRentForm(true)} className="px-3 py-1 bg-white/20 rounded-lg hover:bg-white/30 text-sm">+ Add</button></div>
              <div className="p-4"><div className="grid grid-cols-2 gap-3 mb-4"><div className="bg-orange-50 rounded-lg p-3 text-center"><div className="text-lg font-bold text-orange-700">${stats.rent.amount}</div><div className="text-xs text-orange-600">Total</div></div><div className="bg-orange-50 rounded-lg p-3 text-center"><div className="text-lg font-bold text-orange-700">${avgRent}</div><div className="text-xs text-orange-600">Avg Payment</div></div></div><h4 className="text-xs font-medium text-gray-600 mb-2">Top Recipients</h4>{topRent.length > 0 ? <div className="space-y-1">{topRent.slice(0, 3).map(([n, a], i) => (<div key={i} className="flex justify-between text-sm"><span className="truncate">{n}</span><span className="text-orange-600 font-medium">${a}</span></div>))}</div> : <p className="text-gray-500 text-center py-2 text-xs">No data</p>}</div>
            </div>
            <div className="bg-white rounded-xl shadow-md overflow-hidden"><div className="px-4 py-2 bg-gray-50 border-b"><h4 className="text-sm font-medium">Recent</h4></div><div className="divide-y max-h-40 overflow-y-auto">{rentEntries.slice(0, 5).map((r, i) => (<div key={i} className="p-2 hover:bg-gray-50 flex justify-between"><span className="text-sm font-medium">{r.clientName}</span><span className="text-orange-600 font-medium">${r.amount}</span></div>))}{rentEntries.length === 0 && <p className="text-gray-500 text-center py-4 text-xs">No payments</p>}</div></div>
          </div>
        </div>
        <FormModal show={showWaterForm} onClose={() => setShowWaterForm(false)} title="Log Water Assistance" onSubmit={handleWaterSubmit} color="bg-blue-500">
          <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">Date *</label><input type="date" value={newWaterEntry.date} onChange={(e) => setNewWaterEntry({...newWaterEntry, date: e.target.value})} className="w-full px-3 py-2 border rounded-lg" required /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Provider *</label><select value={newWaterEntry.provider} onChange={(e) => setNewWaterEntry({...newWaterEntry, provider: e.target.value})} className="w-full px-3 py-2 border rounded-lg">{WATER_PROVIDERS.map(p => <option key={p} value={p}>{p}</option>)}</select></div></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Client Name *</label><input type="text" value={newWaterEntry.clientName} onChange={(e) => setNewWaterEntry({...newWaterEntry, clientName: e.target.value})} placeholder="Enter client's name" className="w-full px-3 py-2 border rounded-lg" required /></div>
          <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">Account #</label><input type="text" value={newWaterEntry.accountNumber} onChange={(e) => setNewWaterEntry({...newWaterEntry, accountNumber: e.target.value})} className="w-full px-3 py-2 border rounded-lg" /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Amount ($) *</label><input type="number" value={newWaterEntry.amount || ''} onChange={(e) => setNewWaterEntry({...newWaterEntry, amount: Number(e.target.value)})} min="0" step="0.01" className="w-full px-3 py-2 border rounded-lg" required /></div></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Notes</label><textarea value={newWaterEntry.notes} onChange={(e) => setNewWaterEntry({...newWaterEntry, notes: e.target.value})} rows={2} className="w-full px-3 py-2 border rounded-lg" /></div>
        </FormModal>
        <FormModal show={showElectricForm} onClose={() => setShowElectricForm(false)} title="Log Electric Assistance" onSubmit={handleElectricSubmit} color="bg-yellow-500">
          <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">Date *</label><input type="date" value={newElectricEntry.date} onChange={(e) => setNewElectricEntry({...newElectricEntry, date: e.target.value})} className="w-full px-3 py-2 border rounded-lg" required /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Provider *</label><select value={newElectricEntry.provider} onChange={(e) => setNewElectricEntry({...newElectricEntry, provider: e.target.value})} className="w-full px-3 py-2 border rounded-lg">{ELECTRIC_PROVIDERS.map(p => <option key={p} value={p}>{p}</option>)}</select></div></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Client Name *</label><input type="text" value={newElectricEntry.clientName} onChange={(e) => setNewElectricEntry({...newElectricEntry, clientName: e.target.value})} placeholder="Enter client's name" className="w-full px-3 py-2 border rounded-lg" required /></div>
          <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">Account #</label><input type="text" value={newElectricEntry.accountNumber} onChange={(e) => setNewElectricEntry({...newElectricEntry, accountNumber: e.target.value})} className="w-full px-3 py-2 border rounded-lg" /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Amount ($) *</label><input type="number" value={newElectricEntry.amount || ''} onChange={(e) => setNewElectricEntry({...newElectricEntry, amount: Number(e.target.value)})} min="0" step="0.01" className="w-full px-3 py-2 border rounded-lg" required /></div></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Notes</label><textarea value={newElectricEntry.notes} onChange={(e) => setNewElectricEntry({...newElectricEntry, notes: e.target.value})} rows={2} className="w-full px-3 py-2 border rounded-lg" /></div>
        </FormModal>
        <FormModal show={showRentForm} onClose={() => setShowRentForm(false)} title="Log Rent Assistance" onSubmit={handleRentSubmit} color="bg-orange-500">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Date *</label><input type="date" value={newRentEntry.date} onChange={(e) => setNewRentEntry({...newRentEntry, date: e.target.value})} className="w-full px-3 py-2 border rounded-lg" required /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Client Name *</label><input type="text" value={newRentEntry.clientName} onChange={(e) => setNewRentEntry({...newRentEntry, clientName: e.target.value})} placeholder="Enter client's name" className="w-full px-3 py-2 border rounded-lg" required /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Landlord Name *</label><input type="text" value={newRentEntry.landlordName} onChange={(e) => setNewRentEntry({...newRentEntry, landlordName: e.target.value})} placeholder="Enter landlord's name" className="w-full px-3 py-2 border rounded-lg" required /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Property Address</label><input type="text" value={newRentEntry.propertyAddress} onChange={(e) => setNewRentEntry({...newRentEntry, propertyAddress: e.target.value})} placeholder="Enter address" className="w-full px-3 py-2 border rounded-lg" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Amount ($) *</label><input type="number" value={newRentEntry.amount || ''} onChange={(e) => setNewRentEntry({...newRentEntry, amount: Number(e.target.value)})} min="0" step="0.01" className="w-full px-3 py-2 border rounded-lg" required /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Notes</label><textarea value={newRentEntry.notes} onChange={(e) => setNewRentEntry({...newRentEntry, notes: e.target.value})} rows={2} className="w-full px-3 py-2 border rounded-lg" /></div>
        </FormModal>
      </div>
    );
  };

  // ============================================
  // MAIN RENDER
  // ============================================
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#0F2C5C] text-white py-6 px-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            {onBack && (<button onClick={onBack} className="p-2 hover:bg-white/10 rounded-lg transition-colors"><ArrowLeft size={24} /></button>)}
            <div><h1 className="text-2xl font-bold">FOAM Resource Tracker</h1><p className="text-blue-200 text-sm mt-1">Diapers | Donations | Transportation | Utilities</p></div>
          </div>
          <div className="flex items-center gap-4">
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))} className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-white/50">{MONTHS.map((m, i) => <option key={m} value={i} className="text-gray-900">{m} 2026</option>)}</select>
            <a href="https://docs.google.com/spreadsheets/d/1n-mYCD_2KWUYMXjfD51cSHHesjDfafPkEVeAqTS0xiY/edit" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-colors text-sm">Open Sheet ↗</a>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1 overflow-x-auto">
            {[{ id: 'dashboard', label: 'Dashboard', icon: '📊' }, { id: 'diapers', label: 'Diapers', icon: '📦' }, { id: 'donations', label: 'Donations', icon: '🎁' }, { id: 'transport', label: 'Transport', icon: '🚌' }, { id: 'utilities', label: 'Utilities', icon: '⚡' }].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as TabType)} className={`px-5 py-4 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === tab.id ? 'border-blue-600 text-blue-600 bg-blue-50' : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}><span className="mr-2">{tab.icon}</span>{tab.label}</button>
            ))}
          </div>
        </div>
      </nav>

      {/* Alerts */}
      {error && (<div className="max-w-7xl mx-auto px-6 mt-4"><div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between"><span>{error}</span><button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">✕</button></div></div>)}
      {success && (<div className="max-w-7xl mx-auto px-6 mt-4"><div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center justify-between"><span>✓ {success}</span><button onClick={() => setSuccess(null)} className="text-green-500 hover:text-green-700">✕</button></div></div>)}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        {loading && activeTab === 'dashboard' ? (
          <div className="flex items-center justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div><span className="ml-3 text-gray-600">Loading data...</span></div>
        ) : (
          <>
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'diapers' && renderDiapersTab()}
            {activeTab === 'donations' && renderDonationsTab()}
            {activeTab === 'transport' && renderTransportTab()}
            {activeTab === 'utilities' && renderUtilitiesTab()}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t py-4 px-6 mt-auto"><div className="max-w-7xl mx-auto text-center text-sm text-gray-500">FOAM Resource Tracker 2026 • Connected to Google Sheets</div></footer>
    </div>
  );
};

export default ResourceTracker;
