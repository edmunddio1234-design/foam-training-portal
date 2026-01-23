import React, { useState, useEffect, useCallback } from 'react';

// ============================================
// FOAM Resource Tracker - Google Sheets Integration
// Sheet ID: 1ISn3Z6YEk444MpYApWAS1-JeVdKpiu6LM89aNBeHmVk
// ============================================

// API Configuration - Update with your Render backend URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://foamla-backend-2.onrender.com';

// Types
interface DiaperEntry {
  id?: string;
  date: string;
  clientName: string;
  diapersQty: number;
  packs: number;
  diaperSize: string;
  notes: string;
}

interface DonationEntry {
  id?: string;
  date: string;
  donorName: string;
  type: 'cash' | 'in-kind';
  amount: number;
  description: string;
  notes: string;
}

interface TransportEntry {
  id?: string;
  date: string;
  clientName: string;
  quantity: number;
  cost: number;
  type: string;
  notes: string;
}

interface UtilityEntry {
  id?: string;
  date: string;
  clientName: string;
  amount: number;
  accountOrLandlord: string;
  providerOrProperty: string;
  notes: string;
}

interface MonthlyTotals {
  diapers: { qty: number; packs: number; clients: number };
  donations: { cash: number; inKind: number; donors: number };
  busPass: { qty: number; cost: number };
  uber: { rides: number; cost: number };
  water: { amount: number; families: number };
  electric: { amount: number; families: number };
  rent: { amount: number; families: number };
}

type TabType = 'dashboard' | 'diapers' | 'donations' | 'transport' | 'utilities';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DIAPER_SIZES = ['Newborn', 'Size 1', 'Size 2', 'Size 3', 'Size 4', 'Size 5', 'Size 6'];

// ============================================
// Main Component
// ============================================
const ResourceTracker: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Data states
  const [diaperEntries, setDiaperEntries] = useState<DiaperEntry[]>([]);
  const [donationEntries, setDonationEntries] = useState<DonationEntry[]>([]);
  const [transportEntries, setTransportEntries] = useState<TransportEntry[]>([]);
  const [utilityEntries, setUtilityEntries] = useState<UtilityEntry[]>([]);
  const [monthlyTotals, setMonthlyTotals] = useState<MonthlyTotals | null>(null);

  // Form states
  const [showDiaperForm, setShowDiaperForm] = useState(false);
  const [newDiaperEntry, setNewDiaperEntry] = useState<DiaperEntry>({
    date: new Date().toISOString().split('T')[0],
    clientName: '',
    diapersQty: 0,
    packs: 0,
    diaperSize: 'Size 3',
    notes: ''
  });

  // Fetch data on mount and month change
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const monthName = MONTHS[selectedMonth].toUpperCase().substring(0, 3);
      
      // Fetch all resource data for the selected month
      const response = await fetch(`${API_BASE_URL}/api/resources/${monthName}`);
      if (!response.ok) throw new Error('Failed to fetch resource data');
      
      const data = await response.json();
      setDiaperEntries(data.diapers || []);
      setDonationEntries(data.donations || []);
      setTransportEntries(data.transport || []);
      setUtilityEntries(data.utilities || []);
      setMonthlyTotals(data.totals || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [selectedMonth]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Clear messages after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Submit new diaper entry
  const handleDiaperSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const monthName = MONTHS[selectedMonth].toUpperCase().substring(0, 3);
      const response = await fetch(`${API_BASE_URL}/api/resources/diapers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          month: monthName,
          ...newDiaperEntry
        })
      });

      if (!response.ok) throw new Error('Failed to save diaper entry');

      setSuccess('Diaper distribution logged successfully!');
      setShowDiaperForm(false);
      setNewDiaperEntry({
        date: new Date().toISOString().split('T')[0],
        clientName: '',
        diapersQty: 0,
        packs: 0,
        diaperSize: 'Size 3',
        notes: ''
      });
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save entry');
    } finally {
      setLoading(false);
    }
  };

  // Calculate dashboard stats
  const calculateDashboardStats = () => {
    const totalDiapers = diaperEntries.reduce((sum, e) => sum + e.diapersQty, 0);
    const totalPacks = diaperEntries.reduce((sum, e) => sum + e.packs, 0);
    const uniqueClients = new Set(diaperEntries.map(e => e.clientName)).size;
    
    const cashDonations = donationEntries
      .filter(d => d.type === 'cash')
      .reduce((sum, d) => sum + d.amount, 0);
    const inKindDonations = donationEntries
      .filter(d => d.type === 'in-kind')
      .reduce((sum, d) => sum + d.amount, 0);

    return {
      diapers: { qty: totalDiapers, packs: totalPacks, clients: uniqueClients },
      donations: { cash: cashDonations, inKind: inKindDonations },
      transport: transportEntries.reduce((sum, t) => sum + t.cost, 0),
      utilities: utilityEntries.reduce((sum, u) => sum + u.amount, 0)
    };
  };

  const stats = calculateDashboardStats();

  // ============================================
  // Render Functions
  // ============================================

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Month Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">
          {MONTHS[selectedMonth]} 2026 Overview
        </h2>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(Number(e.target.value))}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {MONTHS.map((month, idx) => (
            <option key={month} value={idx}>{month}</option>
          ))}
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Diapers Card */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-2xl">📦</span>
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Diapers</span>
          </div>
          <div className="text-3xl font-bold">{stats.diapers.qty.toLocaleString()}</div>
          <div className="text-sm opacity-90 mt-1">Diapers Distributed</div>
          <div className="mt-3 pt-3 border-t border-white/20 text-sm">
            <span className="font-medium">{stats.diapers.packs}</span> packs • 
            <span className="font-medium ml-1">{stats.diapers.clients}</span> families
          </div>
        </div>

        {/* Donations Card */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-2xl">💰</span>
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Donations</span>
          </div>
          <div className="text-3xl font-bold">${(stats.donations.cash + stats.donations.inKind).toLocaleString()}</div>
          <div className="text-sm opacity-90 mt-1">Total Donations</div>
          <div className="mt-3 pt-3 border-t border-white/20 text-sm">
            Cash: ${stats.donations.cash.toLocaleString()} • In-Kind: ${stats.donations.inKind.toLocaleString()}
          </div>
        </div>

        {/* Transportation Card */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-2xl">🚌</span>
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Transport</span>
          </div>
          <div className="text-3xl font-bold">${stats.transport.toLocaleString()}</div>
          <div className="text-sm opacity-90 mt-1">Transportation Assistance</div>
          <div className="mt-3 pt-3 border-t border-white/20 text-sm">
            {transportEntries.length} rides provided
          </div>
        </div>

        {/* Utilities Card */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-2xl">⚡</span>
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Utilities</span>
          </div>
          <div className="text-3xl font-bold">${stats.utilities.toLocaleString()}</div>
          <div className="text-sm opacity-90 mt-1">Utility Assistance</div>
          <div className="mt-3 pt-3 border-t border-white/20 text-sm">
            {utilityEntries.length} bills paid
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Diaper Distributions</h3>
        {diaperEntries.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No distributions recorded for {MONTHS[selectedMonth]}.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Client</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Size</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Qty</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Packs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {diaperEntries.slice(0, 10).map((entry, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-700">{entry.date}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{entry.clientName}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
                        {entry.diaperSize}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium">{entry.diapersQty}</td>
                    <td className="px-4 py-3 text-sm text-right text-gray-600">{entry.packs}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  const renderDiapersTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">
          📦 Diaper Distribution - {MONTHS[selectedMonth]}
        </h2>
        <button
          onClick={() => setShowDiaperForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <span>+</span> Log Distribution
        </button>
      </div>

      {/* New Entry Form Modal */}
      {showDiaperForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">New Diaper Distribution</h3>
              <button
                onClick={() => setShowDiaperForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleDiaperSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={newDiaperEntry.date}
                    onChange={(e) => setNewDiaperEntry({ ...newDiaperEntry, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Diaper Size</label>
                  <select
                    value={newDiaperEntry.diaperSize}
                    onChange={(e) => setNewDiaperEntry({ ...newDiaperEntry, diaperSize: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {DIAPER_SIZES.map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
                <input
                  type="text"
                  value={newDiaperEntry.clientName}
                  onChange={(e) => setNewDiaperEntry({ ...newDiaperEntry, clientName: e.target.value })}
                  placeholder="Enter father's name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Diapers Qty</label>
                  <input
                    type="number"
                    value={newDiaperEntry.diapersQty || ''}
                    onChange={(e) => setNewDiaperEntry({ ...newDiaperEntry, diapersQty: Number(e.target.value) })}
                    placeholder="0"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Packs</label>
                  <input
                    type="number"
                    value={newDiaperEntry.packs || ''}
                    onChange={(e) => setNewDiaperEntry({ ...newDiaperEntry, packs: Number(e.target.value) })}
                    placeholder="0"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                <textarea
                  value={newDiaperEntry.notes}
                  onChange={(e) => setNewDiaperEntry({ ...newDiaperEntry, notes: e.target.value })}
                  placeholder="Any additional notes..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDiaperForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-700">{stats.diapers.qty.toLocaleString()}</div>
          <div className="text-sm text-blue-600">Total Diapers</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-700">{stats.diapers.packs}</div>
          <div className="text-sm text-blue-600">Total Packs</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-700">{stats.diapers.clients}</div>
          <div className="text-sm text-blue-600">Families Served</div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#0F2C5C] text-white">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Client Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Size</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase">Qty</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase">Packs</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {diaperEntries.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                  No entries for {MONTHS[selectedMonth]}. Click "Log Distribution" to add one.
                </td>
              </tr>
            ) : (
              diaperEntries.map((entry, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-700">{entry.date}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{entry.clientName}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
                      {entry.diaperSize}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-medium">{entry.diapersQty}</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-600">{entry.packs}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{entry.notes || '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderDonationsTab = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">
        💰 Donations - {MONTHS[selectedMonth]}
      </h2>
      <div className="bg-white rounded-xl shadow-md p-6">
        <p className="text-gray-500 text-center py-8">
          Donation tracking coming soon. Use the Google Sheet for now.
        </p>
      </div>
    </div>
  );

  const renderTransportTab = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">
        🚌 Transportation - {MONTHS[selectedMonth]}
      </h2>
      <div className="bg-white rounded-xl shadow-md p-6">
        <p className="text-gray-500 text-center py-8">
          Transportation tracking coming soon. Use the Google Sheet for now.
        </p>
      </div>
    </div>
  );

  const renderUtilitiesTab = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">
        ⚡ Utilities - {MONTHS[selectedMonth]}
      </h2>
      <div className="bg-white rounded-xl shadow-md p-6">
        <p className="text-gray-500 text-center py-8">
          Utility assistance tracking coming soon. Use the Google Sheet for now.
        </p>
      </div>
    </div>
  );

  // ============================================
  // Main Render
  // ============================================
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#0F2C5C] text-white py-6 px-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">FOAM Resource Tracker</h1>
            <p className="text-blue-200 text-sm mt-1">
              Comprehensive Tracking: Diapers | Donations | Transportation | Utilities
            </p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-white/50"
            >
              {MONTHS.map((month, idx) => (
                <option key={month} value={idx} className="text-gray-900">{month} 2026</option>
              ))}
            </select>
            <a
              href="https://docs.google.com/spreadsheets/d/1ISn3Z6YEk444MpYApWAS1-JeVdKpiu6LM89aNBeHmVk/edit"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-colors text-sm"
            >
              Open Sheet ↗
            </a>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: '📊' },
              { id: 'diapers', label: 'Diapers', icon: '📦' },
              { id: 'donations', label: 'Donations', icon: '💰' },
              { id: 'transport', label: 'Transport', icon: '🚌' },
              { id: 'utilities', label: 'Utilities', icon: '⚡' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`px-5 py-4 text-sm font-medium transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Alerts */}
      {error && (
        <div className="max-w-7xl mx-auto px-6 mt-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">✕</button>
          </div>
        </div>
      )}
      {success && (
        <div className="max-w-7xl mx-auto px-6 mt-4">
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center justify-between">
            <span>✓ {success}</span>
            <button onClick={() => setSuccess(null)} className="text-green-500 hover:text-green-700">✕</button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        {loading && activeTab === 'dashboard' ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
            <span className="ml-3 text-gray-600">Loading data...</span>
          </div>
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
      <footer className="bg-white border-t py-4 px-6 mt-auto">
        <div className="max-w-7xl mx-auto text-center text-sm text-gray-500">
          FOAM Resource Tracker 2026 • Connected to Google Sheets
        </div>
      </footer>
    </div>
  );
};

export default ResourceTracker;
