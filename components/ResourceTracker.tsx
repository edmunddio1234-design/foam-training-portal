import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, TrendingUp, Users, DollarSign, Package, Gift, Bus, Car, Droplets, Zap, Home, Calendar, BarChart3, PieChart, Activity, Target, Plus, Sparkles, Award, ChevronDown, ChevronUp } from 'lucide-react';

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
const DIAPER_SIZES = ['Newborn', 'Size 1', 'Size 2', 'Size 3', 'Size 4', 'Size 5', 'Size 6', '2T-3T', '3T-4T', '4T-5T', '5T-6T'];
const DONATION_ITEM_TYPES = ['Clothes - Adult', 'Clothes - Children', 'Clothes - Baby', 'Household Supplies', 'Baby Items', 'Food/Groceries', 'Furniture', 'Electronics', 'School Supplies', 'Hygiene Products', 'Toys', 'Books', 'Other'];
const BUS_PASS_TYPES = ['Single Ride', 'Daily Pass', '3-Day Pass', 'Weekly Pass', 'Monthly Pass'];
const ELECTRIC_PROVIDERS = ['Entergy', 'DEMCO', 'Cleco', 'SLECA', 'Other'];
const WATER_PROVIDERS = ['Baton Rouge Water Company', 'Parish Utilities', 'City of Baker', 'Other'];
const RIDE_PURPOSES = ['Job Interview', 'Work', 'Medical Appointment', 'Court', 'Child Visitation', 'FOAM Class', 'Other'];

// Collapsible Section Component
const CollapsibleSection: React.FC<{ title: string; icon: React.ReactNode; count: number; color: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, icon, count, color, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-6 py-4 flex items-center justify-between ${color} text-white hover:opacity-90 transition-opacity`}
      >
        <div className="flex items-center gap-3">
          {icon}
          <span className="font-semibold text-lg">{title}</span>
          <span className="bg-white/20 px-2 py-0.5 rounded-full text-sm">{count} entries</span>
        </div>
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      {isOpen && <div className="p-4">{children}</div>}
    </div>
  );
};

// Data Table Component
const DataTable: React.FC<{ headers: string[]; children: React.ReactNode; emptyMessage?: string; isEmpty?: boolean }> = ({ headers, children, emptyMessage = "No entries yet", isEmpty = false }) => {
  if (isEmpty) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>{emptyMessage}</p>
      </div>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            {headers.map((header, i) => (
              <th key={i} className="text-left py-3 px-4 font-semibold text-gray-700 bg-gray-50">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
};

// Format date helper
const formatDate = (dateStr: string) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

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

// ============================================
// FORM MODAL COMPONENTS
// ============================================

interface DiaperFormProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (entry: DiaperEntry) => void;
  loading: boolean;
  initialData: DiaperEntry;
}

const DiaperFormModal: React.FC<DiaperFormProps> = ({ show, onClose, onSubmit, loading, initialData }) => {
  const [formData, setFormData] = useState<DiaperEntry>(initialData);

  useEffect(() => {
    if (show) setFormData(initialData);
  }, [show, initialData]);

  const handleChange = (field: keyof DiaperEntry, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="bg-blue-600 text-white px-6 py-4 rounded-t-xl flex items-center justify-between sticky top-0">
          <h3 className="text-lg font-semibold flex items-center gap-2"><Package size={20} /> Log Diaper Distribution</h3>
          <button onClick={onClose} className="text-white/80 hover:text-white text-xl">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <input type="date" value={formData.date} onChange={(e) => handleChange('date', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Size *</label>
              <select value={formData.diaperSize} onChange={(e) => handleChange('diaperSize', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                {DIAPER_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Client Name *</label>
            <input type="text" value={formData.clientName} onChange={(e) => handleChange('clientName', e.target.value)} placeholder="Enter father's name" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required autoComplete="off" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Diapers Qty *</label>
              <input type="number" value={formData.diapersQty || ''} onChange={(e) => handleChange('diapersQty', Number(e.target.value))} min="0" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Packs</label>
              <input type="number" value={formData.packs || ''} onChange={(e) => handleChange('packs', Number(e.target.value))} min="0" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea value={formData.notes} onChange={(e) => handleChange('notes', e.target.value)} rows={2} placeholder="Optional notes..." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium">{loading ? 'Saving...' : 'Save Entry'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface DonationGivenFormProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (entry: DonationGivenEntry) => void;
  loading: boolean;
  initialData: DonationGivenEntry;
}

const DonationGivenFormModal: React.FC<DonationGivenFormProps> = ({ show, onClose, onSubmit, loading, initialData }) => {
  const [formData, setFormData] = useState<DonationGivenEntry>(initialData);

  useEffect(() => {
    if (show) setFormData(initialData);
  }, [show, initialData]);

  const handleChange = (field: keyof DonationGivenEntry, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="bg-green-600 text-white px-6 py-4 rounded-t-xl flex items-center justify-between sticky top-0">
          <h3 className="text-lg font-semibold flex items-center gap-2"><Gift size={20} /> Log Donation Given</h3>
          <button onClick={onClose} className="text-white/80 hover:text-white text-xl">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <input type="date" value={formData.date} onChange={(e) => handleChange('date', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Item Type *</label>
              <select value={formData.itemType} onChange={(e) => handleChange('itemType', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                {DONATION_ITEM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Client Name *</label>
            <input type="text" value={formData.clientName} onChange={(e) => handleChange('clientName', e.target.value)} placeholder="Enter client's name" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" required autoComplete="off" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <input type="text" value={formData.description} onChange={(e) => handleChange('description', e.target.value)} placeholder="e.g., Winter coat, Size L" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" required autoComplete="off" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
              <input type="number" value={formData.quantity || ''} onChange={(e) => handleChange('quantity', Number(e.target.value))} min="1" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Est. Value ($)</label>
              <input type="number" value={formData.estimatedValue || ''} onChange={(e) => handleChange('estimatedValue', Number(e.target.value))} min="0" step="0.01" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea value={formData.notes} onChange={(e) => handleChange('notes', e.target.value)} rows={2} placeholder="Optional notes..." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium">{loading ? 'Saving...' : 'Save Entry'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface InKindFormProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (entry: InKindDonationEntry) => void;
  loading: boolean;
  initialData: InKindDonationEntry;
}

const InKindFormModal: React.FC<InKindFormProps> = ({ show, onClose, onSubmit, loading, initialData }) => {
  const [formData, setFormData] = useState<InKindDonationEntry>(initialData);

  useEffect(() => {
    if (show) setFormData(initialData);
  }, [show, initialData]);

  const handleChange = (field: keyof InKindDonationEntry, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="bg-emerald-600 text-white px-6 py-4 rounded-t-xl flex items-center justify-between sticky top-0">
          <h3 className="text-lg font-semibold flex items-center gap-2"><Gift size={20} /> Log In-Kind Donation Received</h3>
          <button onClick={onClose} className="text-white/80 hover:text-white text-xl">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <input type="date" value={formData.date} onChange={(e) => handleChange('date', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Item Type *</label>
              <select value={formData.itemType} onChange={(e) => handleChange('itemType', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500">
                {DONATION_ITEM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Donor Name *</label>
            <input type="text" value={formData.donorName} onChange={(e) => handleChange('donorName', e.target.value)} placeholder="Enter donor's name or organization" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500" required autoComplete="off" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <input type="text" value={formData.description} onChange={(e) => handleChange('description', e.target.value)} placeholder="e.g., 50 canned goods" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500" required autoComplete="off" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
              <input type="number" value={formData.quantity || ''} onChange={(e) => handleChange('quantity', Number(e.target.value))} min="1" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Est. Value ($)</label>
              <input type="number" value={formData.estimatedValue || ''} onChange={(e) => handleChange('estimatedValue', Number(e.target.value))} min="0" step="0.01" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea value={formData.notes} onChange={(e) => handleChange('notes', e.target.value)} rows={2} placeholder="Optional notes..." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-medium">{loading ? 'Saving...' : 'Save Entry'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface BusPassFormProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (entry: BusPassEntry) => void;
  loading: boolean;
  initialData: BusPassEntry;
}

const BusPassFormModal: React.FC<BusPassFormProps> = ({ show, onClose, onSubmit, loading, initialData }) => {
  const [formData, setFormData] = useState<BusPassEntry>(initialData);

  useEffect(() => {
    if (show) setFormData(initialData);
  }, [show, initialData]);

  const handleChange = (field: keyof BusPassEntry, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="bg-purple-600 text-white px-6 py-4 rounded-t-xl flex items-center justify-between sticky top-0">
          <h3 className="text-lg font-semibold flex items-center gap-2"><Bus size={20} /> Log C.A.T. Bus Pass</h3>
          <button onClick={onClose} className="text-white/80 hover:text-white text-xl">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <input type="date" value={formData.date} onChange={(e) => handleChange('date', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pass Type *</label>
              <select value={formData.passType} onChange={(e) => handleChange('passType', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
                {BUS_PASS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Client Name *</label>
            <input type="text" value={formData.clientName} onChange={(e) => handleChange('clientName', e.target.value)} placeholder="Enter client's name" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" required autoComplete="off" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
              <input type="number" value={formData.quantity || ''} onChange={(e) => handleChange('quantity', Number(e.target.value))} min="1" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cost ($) *</label>
              <input type="number" value={formData.cost || ''} onChange={(e) => handleChange('cost', Number(e.target.value))} min="0" step="0.01" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea value={formData.notes} onChange={(e) => handleChange('notes', e.target.value)} rows={2} placeholder="Optional notes..." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium">{loading ? 'Saving...' : 'Save Entry'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface UberFormProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (entry: UberEntry) => void;
  loading: boolean;
  initialData: UberEntry;
}

const UberFormModal: React.FC<UberFormProps> = ({ show, onClose, onSubmit, loading, initialData }) => {
  const [formData, setFormData] = useState<UberEntry>(initialData);

  useEffect(() => {
    if (show) setFormData(initialData);
  }, [show, initialData]);

  const handleChange = (field: keyof UberEntry, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="bg-gray-800 text-white px-6 py-4 rounded-t-xl flex items-center justify-between sticky top-0">
          <h3 className="text-lg font-semibold flex items-center gap-2"><Car size={20} /> Log Uber Ride</h3>
          <button onClick={onClose} className="text-white/80 hover:text-white text-xl">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <input type="date" value={formData.date} onChange={(e) => handleChange('date', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Purpose *</label>
              <select value={formData.purpose} onChange={(e) => handleChange('purpose', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500">
                {RIDE_PURPOSES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Client Name *</label>
            <input type="text" value={formData.clientName} onChange={(e) => handleChange('clientName', e.target.value)} placeholder="Enter client's name" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500" required autoComplete="off" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pickup *</label>
              <input type="text" value={formData.pickup} onChange={(e) => handleChange('pickup', e.target.value)} placeholder="e.g., FOAM Office" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500" required autoComplete="off" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Destination *</label>
              <input type="text" value={formData.destination} onChange={(e) => handleChange('destination', e.target.value)} placeholder="e.g., Job Interview" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500" required autoComplete="off" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cost ($) *</label>
            <input type="number" value={formData.cost || ''} onChange={(e) => handleChange('cost', Number(e.target.value))} min="0" step="0.01" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea value={formData.notes} onChange={(e) => handleChange('notes', e.target.value)} rows={2} placeholder="Optional notes..." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500" />
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 disabled:opacity-50 font-medium">{loading ? 'Saving...' : 'Save Entry'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface WaterFormProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (entry: WaterEntry) => void;
  loading: boolean;
  initialData: WaterEntry;
}

const WaterFormModal: React.FC<WaterFormProps> = ({ show, onClose, onSubmit, loading, initialData }) => {
  const [formData, setFormData] = useState<WaterEntry>(initialData);

  useEffect(() => {
    if (show) setFormData(initialData);
  }, [show, initialData]);

  const handleChange = (field: keyof WaterEntry, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="bg-blue-500 text-white px-6 py-4 rounded-t-xl flex items-center justify-between sticky top-0">
          <h3 className="text-lg font-semibold flex items-center gap-2"><Droplets size={20} /> Log Water Bill Assistance</h3>
          <button onClick={onClose} className="text-white/80 hover:text-white text-xl">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <input type="date" value={formData.date} onChange={(e) => handleChange('date', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Provider *</label>
              <select value={formData.provider} onChange={(e) => handleChange('provider', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                {WATER_PROVIDERS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Client Name *</label>
            <input type="text" value={formData.clientName} onChange={(e) => handleChange('clientName', e.target.value)} placeholder="Enter client's name" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required autoComplete="off" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account #</label>
              <input type="text" value={formData.accountNumber} onChange={(e) => handleChange('accountNumber', e.target.value)} placeholder="Optional" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" autoComplete="off" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($) *</label>
              <input type="number" value={formData.amount || ''} onChange={(e) => handleChange('amount', Number(e.target.value))} min="0" step="0.01" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea value={formData.notes} onChange={(e) => handleChange('notes', e.target.value)} rows={2} placeholder="Optional notes..." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 font-medium">{loading ? 'Saving...' : 'Save Entry'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface ElectricFormProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (entry: ElectricEntry) => void;
  loading: boolean;
  initialData: ElectricEntry;
}

const ElectricFormModal: React.FC<ElectricFormProps> = ({ show, onClose, onSubmit, loading, initialData }) => {
  const [formData, setFormData] = useState<ElectricEntry>(initialData);

  useEffect(() => {
    if (show) setFormData(initialData);
  }, [show, initialData]);

  const handleChange = (field: keyof ElectricEntry, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="bg-yellow-500 text-white px-6 py-4 rounded-t-xl flex items-center justify-between sticky top-0">
          <h3 className="text-lg font-semibold flex items-center gap-2"><Zap size={20} /> Log Electric Bill Assistance</h3>
          <button onClick={onClose} className="text-white/80 hover:text-white text-xl">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <input type="date" value={formData.date} onChange={(e) => handleChange('date', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Provider *</label>
              <select value={formData.provider} onChange={(e) => handleChange('provider', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500">
                {ELECTRIC_PROVIDERS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Client Name *</label>
            <input type="text" value={formData.clientName} onChange={(e) => handleChange('clientName', e.target.value)} placeholder="Enter client's name" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500" required autoComplete="off" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account #</label>
              <input type="text" value={formData.accountNumber} onChange={(e) => handleChange('accountNumber', e.target.value)} placeholder="Optional" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500" autoComplete="off" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($) *</label>
              <input type="number" value={formData.amount || ''} onChange={(e) => handleChange('amount', Number(e.target.value))} min="0" step="0.01" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea value={formData.notes} onChange={(e) => handleChange('notes', e.target.value)} rows={2} placeholder="Optional notes..." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500" />
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50 font-medium">{loading ? 'Saving...' : 'Save Entry'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface RentFormProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (entry: RentEntry) => void;
  loading: boolean;
  initialData: RentEntry;
}

const RentFormModal: React.FC<RentFormProps> = ({ show, onClose, onSubmit, loading, initialData }) => {
  const [formData, setFormData] = useState<RentEntry>(initialData);

  useEffect(() => {
    if (show) setFormData(initialData);
  }, [show, initialData]);

  const handleChange = (field: keyof RentEntry, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="bg-orange-500 text-white px-6 py-4 rounded-t-xl flex items-center justify-between sticky top-0">
          <h3 className="text-lg font-semibold flex items-center gap-2"><Home size={20} /> Log Rent Assistance</h3>
          <button onClick={onClose} className="text-white/80 hover:text-white text-xl">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
            <input type="date" value={formData.date} onChange={(e) => handleChange('date', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Client Name *</label>
            <input type="text" value={formData.clientName} onChange={(e) => handleChange('clientName', e.target.value)} placeholder="Enter client's name" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" required autoComplete="off" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Landlord Name *</label>
            <input type="text" value={formData.landlordName} onChange={(e) => handleChange('landlordName', e.target.value)} placeholder="Enter landlord's name" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" required autoComplete="off" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Property Address</label>
            <input type="text" value={formData.propertyAddress} onChange={(e) => handleChange('propertyAddress', e.target.value)} placeholder="Enter address (optional)" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" autoComplete="off" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($) *</label>
            <input type="number" value={formData.amount || ''} onChange={(e) => handleChange('amount', Number(e.target.value))} min="0" step="0.01" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea value={formData.notes} onChange={(e) => handleChange('notes', e.target.value)} rows={2} placeholder="Optional notes..." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" />
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 font-medium">{loading ? 'Saving...' : 'Save Entry'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================
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

  // Default form data
  const defaultDiaperEntry: DiaperEntry = { date: getDefaultDate(), clientName: '', diapersQty: 0, packs: 0, diaperSize: 'Size 3', notes: '' };
  const defaultDonationGiven: DonationGivenEntry = { date: getDefaultDate(), clientName: '', itemType: 'Clothes - Adult', description: '', quantity: 1, estimatedValue: 0, notes: '' };
  const defaultInKindDonation: InKindDonationEntry = { date: getDefaultDate(), donorName: '', itemType: 'Clothes - Adult', description: '', quantity: 1, estimatedValue: 0, notes: '' };
  const defaultBusPass: BusPassEntry = { date: getDefaultDate(), clientName: '', passType: 'Daily Pass', quantity: 1, cost: 0, notes: '' };
  const defaultUberEntry: UberEntry = { date: getDefaultDate(), clientName: '', pickup: '', destination: '', cost: 0, purpose: 'Job Interview', notes: '' };
  const defaultWaterEntry: WaterEntry = { date: getDefaultDate(), clientName: '', accountNumber: '', provider: 'Baton Rouge Water Company', amount: 0, notes: '' };
  const defaultElectricEntry: ElectricEntry = { date: getDefaultDate(), clientName: '', accountNumber: '', provider: 'Entergy', amount: 0, notes: '' };
  const defaultRentEntry: RentEntry = { date: getDefaultDate(), clientName: '', landlordName: '', propertyAddress: '', amount: 0, notes: '' };

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
      const transport = data.transport || [];
      setBusPassEntries(transport.filter((t: any) => t.type === 'bus'));
      setUberEntries(transport.filter((t: any) => t.type === 'uber'));
      const utilities = data.utilities || [];
      setWaterEntries(utilities.filter((u: any) => u.type === 'water'));
      setElectricEntries(utilities.filter((u: any) => u.type === 'electric'));
      setRentEntries(utilities.filter((u: any) => u.type === 'rent'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [selectedMonth]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { if (success) { const timer = setTimeout(() => setSuccess(null), 3000); return () => clearTimeout(timer); } }, [success]);

  // Generic submit handler
  const handleSubmitEntry = async (endpoint: string, data: any, successMsg: string, close: () => void) => {
    setLoading(true);
    setError(null);
    try {
      const monthName = MONTHS[selectedMonth].toUpperCase().substring(0, 3);
      const response = await fetch(`${API_BASE_URL}/api/resources/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month: monthName, ...data })
      });
      if (!response.ok) throw new Error('Failed to save entry');
      setSuccess(successMsg);
      close();
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save entry');
    } finally {
      setLoading(false);
    }
  };

  // Submit handlers
  const handleDiaperSubmit = (entry: DiaperEntry) => handleSubmitEntry('diapers', entry, 'Diaper distribution logged!', () => setShowDiaperForm(false));
  const handleDonationGivenSubmit = (entry: DonationGivenEntry) => handleSubmitEntry('donations-given', entry, 'Donation given logged!', () => setShowDonationGivenForm(false));
  const handleInKindSubmit = (entry: InKindDonationEntry) => handleSubmitEntry('donations-inkind', entry, 'In-kind donation logged!', () => setShowInKindForm(false));
  const handleBusSubmit = (entry: BusPassEntry) => handleSubmitEntry('transport', { transportType: 'bus', ...entry, typeOrDestination: entry.passType }, 'Bus pass logged!', () => setShowBusForm(false));
  const handleUberSubmit = (entry: UberEntry) => handleSubmitEntry('transport', { transportType: 'uber', ...entry, quantity: 1, typeOrDestination: `${entry.pickup} to ${entry.destination} - ${entry.purpose}` }, 'Uber ride logged!', () => setShowUberForm(false));
  const handleWaterSubmit = (entry: WaterEntry) => handleSubmitEntry('utilities', { utilityType: 'water', ...entry, accountOrLandlord: entry.accountNumber, providerOrProperty: entry.provider }, 'Water assistance logged!', () => setShowWaterForm(false));
  const handleElectricSubmit = (entry: ElectricEntry) => handleSubmitEntry('utilities', { utilityType: 'electric', ...entry, accountOrLandlord: entry.accountNumber, providerOrProperty: entry.provider }, 'Electric assistance logged!', () => setShowElectricForm(false));
  const handleRentSubmit = (entry: RentEntry) => handleSubmitEntry('utilities', { utilityType: 'rent', ...entry, accountOrLandlord: entry.landlordName, providerOrProperty: entry.propertyAddress }, 'Rent assistance logged!', () => setShowRentForm(false));

  // Stats calculations
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

  const goals = { diapers: 500, donations: 2000, transport: 500, utilities: 3000 };

  // Stat Card component
  const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number; subtext?: string; color: string }> = ({ icon, label, value, subtext, color }) => (
    <div className={`${color} rounded-xl p-4 text-white`}>
      <div className="flex items-center justify-between mb-2"><span className="opacity-80">{icon}</span></div>
      <div className="text-2xl font-bold">{typeof value === 'number' ? value.toLocaleString() : value}</div>
      <div className="text-sm opacity-90">{label}</div>
      {subtext && <div className="text-xs opacity-75 mt-1">{subtext}</div>}
    </div>
  );

  // Dashboard render
  const renderDashboard = () => {
    const transportTotal = stats.busPass.cost + stats.uber.cost;
    const utilitiesTotal = stats.water.amount + stats.electric.amount + stats.rent.amount;

    const spendingData = [
      { label: 'Donations', value: stats.donationsGiven.value, color: '#22c55e' },
      { label: 'Transport', value: transportTotal, color: '#a855f7' },
      { label: 'Utilities', value: utilitiesTotal, color: '#f97316' },
    ].filter(d => d.value > 0);

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
                <div className="mt-2 flex items-center gap-1 text-xs text-green-300"><TrendingUp size={12} /> <span>{stats.diapers.clients} families</span></div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-4 hover:bg-white/20 transition-all cursor-pointer" onClick={() => setActiveTab('donations')}>
                <Gift className="mb-2 text-green-300" size={24} />
                <div className="text-3xl font-bold"><AnimatedCounter value={stats.donationsGiven.value + stats.inKindDonations.value} prefix="$" /></div>
                <div className="text-sm text-blue-200">Donation Value</div>
                <div className="mt-2 flex items-center gap-1 text-xs text-green-300"><TrendingUp size={12} /> <span>{stats.donationsGiven.clients} recipients</span></div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-4 hover:bg-white/20 transition-all cursor-pointer" onClick={() => setActiveTab('transport')}>
                <Bus className="mb-2 text-purple-300" size={24} />
                <div className="text-3xl font-bold"><AnimatedCounter value={transportTotal} prefix="$" /></div>
                <div className="text-sm text-blue-200">Transportation</div>
                <div className="mt-2 flex items-center gap-1 text-xs text-green-300"><TrendingUp size={12} /> <span>{stats.busPass.count + stats.uber.rides} trips</span></div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-4 hover:bg-white/20 transition-all cursor-pointer" onClick={() => setActiveTab('utilities')}>
                <Zap className="mb-2 text-yellow-300" size={24} />
                <div className="text-3xl font-bold"><AnimatedCounter value={utilitiesTotal} prefix="$" /></div>
                <div className="text-sm text-blue-200">Utility Assistance</div>
                <div className="mt-2 flex items-center gap-1 text-xs text-green-300"><TrendingUp size={12} /> <span>{stats.water.families + stats.electric.families + stats.rent.families} families</span></div>
              </div>
            </div>
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
            <a href="https://docs.google.com/spreadsheets/d/1KsviLMZoTTuYv5jsAemZ1UcWs3b-ZATUakHTH8GpvPk/edit" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Open Sheet</a>
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

            {/* DIAPERS TAB */}
            {activeTab === 'diapers' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-800">📦 Diaper Distribution - {MONTHS[selectedMonth]}</h2>
                  <button onClick={() => setShowDiaperForm(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"><Plus size={18} /> Log Distribution</button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard icon={<Package size={20} />} label="Total Diapers" value={stats.diapers.qty} color="bg-gradient-to-br from-blue-500 to-blue-600" />
                  <StatCard icon={<BarChart3 size={20} />} label="Total Packs" value={stats.diapers.packs} color="bg-gradient-to-br from-blue-400 to-blue-500" />
                  <StatCard icon={<Users size={20} />} label="Families Served" value={stats.diapers.clients} color="bg-gradient-to-br from-blue-600 to-blue-700" />
                  <StatCard icon={<Calendar size={20} />} label="Distributions" value={stats.diapers.entries} color="bg-gradient-to-br from-blue-500 to-indigo-600" />
                </div>
                
                {/* Diaper Entries Table */}
                <CollapsibleSection title="Distribution Records" icon={<Package size={20} />} count={diaperEntries.length} color="bg-blue-600">
                  <DataTable headers={['Date', 'Client Name', 'Size', 'Qty', 'Packs', 'Notes']} isEmpty={diaperEntries.length === 0} emptyMessage="No diaper distributions recorded yet">
                    {diaperEntries.map((entry, i) => (
                      <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">{formatDate(entry.date)}</td>
                        <td className="py-3 px-4 font-medium">{entry.clientName}</td>
                        <td className="py-3 px-4"><span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">{entry.diaperSize}</span></td>
                        <td className="py-3 px-4">{entry.diapersQty}</td>
                        <td className="py-3 px-4">{entry.packs || '-'}</td>
                        <td className="py-3 px-4 text-gray-500 text-sm">{entry.notes || '-'}</td>
                      </tr>
                    ))}
                  </DataTable>
                </CollapsibleSection>
              </div>
            )}

            {/* DONATIONS TAB */}
            {activeTab === 'donations' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-800">🎁 Donations - {MONTHS[selectedMonth]}</h2>
                  <div className="flex gap-2">
                    <button onClick={() => setShowDonationGivenForm(true)} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"><Plus size={18} /> Log Given</button>
                    <button onClick={() => setShowInKindForm(true)} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2"><Plus size={18} /> Log In-Kind</button>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard icon={<Gift size={20} />} label="Given Out Value" value={`$${stats.donationsGiven.value.toLocaleString()}`} subtext={`${stats.donationsGiven.items} items`} color="bg-gradient-to-br from-green-500 to-green-600" />
                  <StatCard icon={<Users size={20} />} label="Clients Helped" value={stats.donationsGiven.clients} color="bg-gradient-to-br from-green-400 to-green-500" />
                  <StatCard icon={<DollarSign size={20} />} label="In-Kind Received" value={`$${stats.inKindDonations.value.toLocaleString()}`} subtext={`${stats.inKindDonations.items} items`} color="bg-gradient-to-br from-emerald-500 to-emerald-600" />
                  <StatCard icon={<Users size={20} />} label="Active Donors" value={stats.inKindDonations.donors} color="bg-gradient-to-br from-emerald-400 to-emerald-500" />
                </div>
                
                {/* Donations Given Table */}
                <CollapsibleSection title="Donations Given to Clients" icon={<Gift size={20} />} count={donationsGiven.length} color="bg-green-600">
                  <DataTable headers={['Date', 'Client Name', 'Item Type', 'Description', 'Qty', 'Value', 'Notes']} isEmpty={donationsGiven.length === 0} emptyMessage="No donations given yet">
                    {donationsGiven.map((entry, i) => (
                      <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">{formatDate(entry.date)}</td>
                        <td className="py-3 px-4 font-medium">{entry.clientName}</td>
                        <td className="py-3 px-4"><span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">{entry.itemType}</span></td>
                        <td className="py-3 px-4">{entry.description}</td>
                        <td className="py-3 px-4">{entry.quantity}</td>
                        <td className="py-3 px-4 font-medium text-green-600">${entry.estimatedValue?.toFixed(2) || '0.00'}</td>
                        <td className="py-3 px-4 text-gray-500 text-sm">{entry.notes || '-'}</td>
                      </tr>
                    ))}
                  </DataTable>
                </CollapsibleSection>

                {/* In-Kind Donations Table */}
                <CollapsibleSection title="In-Kind Donations Received" icon={<Gift size={20} />} count={inKindDonations.length} color="bg-emerald-600">
                  <DataTable headers={['Date', 'Donor Name', 'Item Type', 'Description', 'Qty', 'Value', 'Notes']} isEmpty={inKindDonations.length === 0} emptyMessage="No in-kind donations received yet">
                    {inKindDonations.map((entry, i) => (
                      <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">{formatDate(entry.date)}</td>
                        <td className="py-3 px-4 font-medium">{entry.donorName}</td>
                        <td className="py-3 px-4"><span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs">{entry.itemType}</span></td>
                        <td className="py-3 px-4">{entry.description}</td>
                        <td className="py-3 px-4">{entry.quantity}</td>
                        <td className="py-3 px-4 font-medium text-emerald-600">${entry.estimatedValue?.toFixed(2) || '0.00'}</td>
                        <td className="py-3 px-4 text-gray-500 text-sm">{entry.notes || '-'}</td>
                      </tr>
                    ))}
                  </DataTable>
                </CollapsibleSection>
              </div>
            )}

            {/* TRANSPORT TAB */}
            {activeTab === 'transport' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-800">🚌 Transportation - {MONTHS[selectedMonth]}</h2>
                  <div className="flex gap-2">
                    <button onClick={() => setShowBusForm(true)} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"><Plus size={18} /> Log Bus Pass</button>
                    <button onClick={() => setShowUberForm(true)} className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 flex items-center gap-2"><Plus size={18} /> Log Uber</button>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard icon={<Bus size={20} />} label="Bus Passes" value={stats.busPass.count} subtext={`$${stats.busPass.cost} total`} color="bg-gradient-to-br from-purple-500 to-purple-600" />
                  <StatCard icon={<Users size={20} />} label="Bus Clients" value={stats.busPass.clients} color="bg-gradient-to-br from-purple-400 to-purple-500" />
                  <StatCard icon={<Car size={20} />} label="Uber Rides" value={stats.uber.rides} subtext={`$${stats.uber.cost} total`} color="bg-gradient-to-br from-gray-700 to-gray-800" />
                  <StatCard icon={<Users size={20} />} label="Uber Clients" value={stats.uber.clients} color="bg-gradient-to-br from-gray-600 to-gray-700" />
                </div>
                
                {/* Bus Pass Table */}
                <CollapsibleSection title="C.A.T. Bus Passes" icon={<Bus size={20} />} count={busPassEntries.length} color="bg-purple-600">
                  <DataTable headers={['Date', 'Client Name', 'Pass Type', 'Qty', 'Cost', 'Notes']} isEmpty={busPassEntries.length === 0} emptyMessage="No bus passes logged yet">
                    {busPassEntries.map((entry, i) => (
                      <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">{formatDate(entry.date)}</td>
                        <td className="py-3 px-4 font-medium">{entry.clientName}</td>
                        <td className="py-3 px-4"><span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">{entry.passType}</span></td>
                        <td className="py-3 px-4">{entry.quantity}</td>
                        <td className="py-3 px-4 font-medium text-purple-600">${entry.cost?.toFixed(2) || '0.00'}</td>
                        <td className="py-3 px-4 text-gray-500 text-sm">{entry.notes || '-'}</td>
                      </tr>
                    ))}
                  </DataTable>
                </CollapsibleSection>

                {/* Uber Rides Table */}
                <CollapsibleSection title="Uber Rides" icon={<Car size={20} />} count={uberEntries.length} color="bg-gray-700">
                  <DataTable headers={['Date', 'Client Name', 'Pickup', 'Destination', 'Purpose', 'Cost', 'Notes']} isEmpty={uberEntries.length === 0} emptyMessage="No Uber rides logged yet">
                    {uberEntries.map((entry, i) => (
                      <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">{formatDate(entry.date)}</td>
                        <td className="py-3 px-4 font-medium">{entry.clientName}</td>
                        <td className="py-3 px-4">{entry.pickup}</td>
                        <td className="py-3 px-4">{entry.destination}</td>
                        <td className="py-3 px-4"><span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">{entry.purpose}</span></td>
                        <td className="py-3 px-4 font-medium text-gray-700">${entry.cost?.toFixed(2) || '0.00'}</td>
                        <td className="py-3 px-4 text-gray-500 text-sm">{entry.notes || '-'}</td>
                      </tr>
                    ))}
                  </DataTable>
                </CollapsibleSection>
              </div>
            )}

            {/* UTILITIES TAB */}
            {activeTab === 'utilities' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-800">⚡ Utility Assistance - {MONTHS[selectedMonth]}</h2>
                  <div className="flex gap-2">
                    <button onClick={() => setShowWaterForm(true)} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"><Plus size={18} /> Water</button>
                    <button onClick={() => setShowElectricForm(true)} className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 flex items-center gap-2"><Plus size={18} /> Electric</button>
                    <button onClick={() => setShowRentForm(true)} className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center gap-2"><Plus size={18} /> Rent</button>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard icon={<DollarSign size={20} />} label="Total Assistance" value={`$${(stats.water.amount + stats.electric.amount + stats.rent.amount).toLocaleString()}`} color="bg-gradient-to-br from-orange-500 to-orange-600" />
                  <StatCard icon={<Droplets size={20} />} label="Water" value={`$${stats.water.amount.toLocaleString()}`} subtext={`${stats.water.families} families`} color="bg-gradient-to-br from-blue-500 to-blue-600" />
                  <StatCard icon={<Zap size={20} />} label="Electric" value={`$${stats.electric.amount.toLocaleString()}`} subtext={`${stats.electric.families} families`} color="bg-gradient-to-br from-yellow-500 to-yellow-600" />
                  <StatCard icon={<Home size={20} />} label="Rent" value={`$${stats.rent.amount.toLocaleString()}`} subtext={`${stats.rent.families} families`} color="bg-gradient-to-br from-orange-500 to-red-500" />
                </div>
                
                {/* Water Table */}
                <CollapsibleSection title="Water Bill Assistance" icon={<Droplets size={20} />} count={waterEntries.length} color="bg-blue-500">
                  <DataTable headers={['Date', 'Client Name', 'Provider', 'Account #', 'Amount', 'Notes']} isEmpty={waterEntries.length === 0} emptyMessage="No water assistance logged yet">
                    {waterEntries.map((entry, i) => (
                      <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">{formatDate(entry.date)}</td>
                        <td className="py-3 px-4 font-medium">{entry.clientName}</td>
                        <td className="py-3 px-4">{entry.provider}</td>
                        <td className="py-3 px-4 text-gray-500">{entry.accountNumber || '-'}</td>
                        <td className="py-3 px-4 font-medium text-blue-600">${entry.amount?.toFixed(2) || '0.00'}</td>
                        <td className="py-3 px-4 text-gray-500 text-sm">{entry.notes || '-'}</td>
                      </tr>
                    ))}
                  </DataTable>
                </CollapsibleSection>

                {/* Electric Table */}
                <CollapsibleSection title="Electric Bill Assistance" icon={<Zap size={20} />} count={electricEntries.length} color="bg-yellow-500">
                  <DataTable headers={['Date', 'Client Name', 'Provider', 'Account #', 'Amount', 'Notes']} isEmpty={electricEntries.length === 0} emptyMessage="No electric assistance logged yet">
                    {electricEntries.map((entry, i) => (
                      <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">{formatDate(entry.date)}</td>
                        <td className="py-3 px-4 font-medium">{entry.clientName}</td>
                        <td className="py-3 px-4">{entry.provider}</td>
                        <td className="py-3 px-4 text-gray-500">{entry.accountNumber || '-'}</td>
                        <td className="py-3 px-4 font-medium text-yellow-600">${entry.amount?.toFixed(2) || '0.00'}</td>
                        <td className="py-3 px-4 text-gray-500 text-sm">{entry.notes || '-'}</td>
                      </tr>
                    ))}
                  </DataTable>
                </CollapsibleSection>

                {/* Rent Table */}
                <CollapsibleSection title="Rent Assistance" icon={<Home size={20} />} count={rentEntries.length} color="bg-orange-500">
                  <DataTable headers={['Date', 'Client Name', 'Landlord', 'Property Address', 'Amount', 'Notes']} isEmpty={rentEntries.length === 0} emptyMessage="No rent assistance logged yet">
                    {rentEntries.map((entry, i) => (
                      <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">{formatDate(entry.date)}</td>
                        <td className="py-3 px-4 font-medium">{entry.clientName}</td>
                        <td className="py-3 px-4">{entry.landlordName}</td>
                        <td className="py-3 px-4 text-gray-500">{entry.propertyAddress || '-'}</td>
                        <td className="py-3 px-4 font-medium text-orange-600">${entry.amount?.toFixed(2) || '0.00'}</td>
                        <td className="py-3 px-4 text-gray-500 text-sm">{entry.notes || '-'}</td>
                      </tr>
                    ))}
                  </DataTable>
                </CollapsibleSection>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t py-4 px-6 mt-auto"><div className="max-w-7xl mx-auto text-center text-sm text-gray-500">FOAM Resource Tracker 2026 • Connected to Google Sheets</div></footer>

      {/* Form Modals */}
      <DiaperFormModal show={showDiaperForm} onClose={() => setShowDiaperForm(false)} onSubmit={handleDiaperSubmit} loading={loading} initialData={defaultDiaperEntry} />
      <DonationGivenFormModal show={showDonationGivenForm} onClose={() => setShowDonationGivenForm(false)} onSubmit={handleDonationGivenSubmit} loading={loading} initialData={defaultDonationGiven} />
      <InKindFormModal show={showInKindForm} onClose={() => setShowInKindForm(false)} onSubmit={handleInKindSubmit} loading={loading} initialData={defaultInKindDonation} />
      <BusPassFormModal show={showBusForm} onClose={() => setShowBusForm(false)} onSubmit={handleBusSubmit} loading={loading} initialData={defaultBusPass} />
      <UberFormModal show={showUberForm} onClose={() => setShowUberForm(false)} onSubmit={handleUberSubmit} loading={loading} initialData={defaultUberEntry} />
      <WaterFormModal show={showWaterForm} onClose={() => setShowWaterForm(false)} onSubmit={handleWaterSubmit} loading={loading} initialData={defaultWaterEntry} />
      <ElectricFormModal show={showElectricForm} onClose={() => setShowElectricForm(false)} onSubmit={handleElectricSubmit} loading={loading} initialData={defaultElectricEntry} />
      <RentFormModal show={showRentForm} onClose={() => setShowRentForm(false)} onSubmit={handleRentSubmit} loading={loading} initialData={defaultRentEntry} />
    </div>
  );
};

export default ResourceTracker;
