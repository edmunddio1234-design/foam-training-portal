import React, { useState, useEffect } from 'react';
import { TrackerViewState, Father } from '../types';
import {
  LayoutDashboard, Users, CheckSquare, ShieldCheck, Menu, X, Upload,
  UserX, FileDown, BookOpen, ChevronRight, ArrowLeft, RefreshCw, QrCode, ExternalLink
} from 'lucide-react';

// Import API service
import { fatherhoodApi, Module, Stats } from '../services/fatherhoodApi';

// Sub-component Imports
import { Dashboard } from './tracking/Dashboard';
import { Roster } from './tracking/Roster';
import { CheckIn } from './tracking/CheckIn';
import { FatherPortal } from './tracking/FatherPortal';
import { ImportCSV } from './tracking/ImportCSV';
import { LostManagement } from './tracking/LostManagement';
import { FatherIDCard } from './tracking/FatherIDCard';
import { ExportData } from './tracking/ExportData';
import { Financials } from './tracking/Financials';
import { QRCheckIn } from './tracking/QRCheckIn';

// Google Sheet URL
const GOOGLE_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1_My5OViS4NCaWac48wn53LLPv_OmTq7LLrQAiu4phUs/edit?gid=770856518#gid=770856518';

interface FatherhoodTrackingProps {
  onBack: () => void;
}

const FatherhoodTracking: React.FC<FatherhoodTrackingProps> = ({ onBack: onNavigateBack }) => {
  const [currentView, setCurrentView] = useState<TrackerViewState>('dashboard');
  const [fathers, setFathers] = useState<Father[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [selectedFatherId, setSelectedFatherId] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data from API on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [fathersData, modulesData, statsData] = await Promise.all([
        fatherhoodApi.getFathers(),
        fatherhoodApi.getModules(),
        fatherhoodApi.getStats()
      ]);
      
      setFathers(fathersData);
      setModules(modulesData);
      setStats(statsData);
      console.log(`✅ Loaded ${fathersData.length} fathers from API`);
    } catch (err) {
      console.error('❌ Error loading data:', err);
      setError('Failed to load data. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async () => {
    await loadData();
  };

  const updateFatherInState = (updatedFather: Father) => {
    setFathers(prev => prev.map(f => f.id === updatedFather.id ? updatedFather : f));
  };

  const addFatherToState = (newFather: Father) => {
    setFathers(prev => [...prev, newFather]);
  };

  const selectedFather = fathers.find(f => f.id === selectedFatherId) || null;

  // LIVE STATS - Calculated directly from fathers array so counts always match filter buttons
  const liveStats = {
    total: fathers.length,
    active: fathers.filter(f => f.status === 'Active').length,
    inactive: fathers.filter(f => f.status === 'Inactive').length,
    atRisk: fathers.filter(f => f.status === 'At Risk').length,
    graduated: fathers.filter(f => f.status === 'Graduated').length,
    certificates: fathers.filter(f => {
      const father = f as any;
      return f.certificateReceived === true || 
             f.certificateReceived === 'Yes' || 
             father.certificate === true ||
             father.certificate === 'Yes' ||
             father.certificateIssued === true ||
             father.certificateIssued === 'Yes';
    }).length
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'roster', label: 'Father Roster', icon: Users },
    { id: 'checkin', label: 'Class Check-In', icon: CheckSquare },
    { id: 'qrcheckin', label: 'QR Check-In', icon: QrCode },
    { id: 'portal', label: 'Father Portal', icon: ShieldCheck },
    { id: 'import', label: 'Import Data', icon: Upload },
    { id: 'lost', label: 'Lost to Follow-up', icon: UserX },
    { id: 'export', label: 'Export Data', icon: FileDown },
    { id: 'financials', label: 'Resources', icon: BookOpen },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="animate-spin mx-auto text-blue-600 mb-4" size={48} />
          <p className="text-slate-600 text-lg">Loading Fatherhood Tracker...</p>
          <p className="text-slate-400 text-sm mt-2">Connecting to database</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="text-red-600" size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Connection Error</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <button
            onClick={loadData}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all flex items-center gap-2 mx-auto"
          >
            <RefreshCw size={18} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-gradient-to-b from-slate-800 to-slate-900 text-white">
        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <button 
            onClick={onNavigateBack}
            className="flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="text-sm">Back to Portal</span>
          </button>
          <h1 className="text-xl font-bold">Fatherhood Tracker</h1>
          <p className="text-slate-400 text-sm mt-1">Class Management System</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {menuItems.map(item => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => setCurrentView(item.id as TrackerViewState)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive 
                        ? 'bg-blue-600 text-white' 
                        : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                    {isActive && <ChevronRight size={16} className="ml-auto" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* QUICK STATS - Using liveStats calculated from fathers array */}
        <div className="p-4 border-t border-slate-700">
          <div className="bg-slate-700/50 rounded-lg p-4">
            <p className="text-slate-400 text-xs uppercase tracking-wider mb-3">Quick Stats</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-slate-400">Total</p>
                <p className="font-bold text-white text-lg">{liveStats.total}</p>
              </div>
              <div>
                <p className="text-slate-400">Graduated</p>
                <p className="font-bold text-emerald-400 text-lg">{liveStats.graduated}</p>
              </div>
              <div>
                <p className="text-slate-400">Active</p>
                <p className="font-bold text-blue-400 text-lg">{liveStats.active}</p>
              </div>
              <div>
                <p className="text-slate-400">At Risk</p>
                <p className="font-bold text-amber-400 text-lg">{liveStats.atRisk}</p>
              </div>
              <div>
                <p className="text-slate-400">Inactive</p>
                <p className="font-bold text-slate-400 text-lg">{liveStats.inactive}</p>
              </div>
              <div>
                <p className="text-slate-400">Certificates</p>
                <p className="font-bold text-purple-400 text-lg">{liveStats.certificates}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="p-4 border-t border-slate-700 space-y-2">
          <button
            onClick={refreshData}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-all text-sm"
          >
            <RefreshCw size={16} />
            Refresh Data
          </button>
          <button
            onClick={() => window.open(GOOGLE_SHEET_URL, '_blank')}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-all text-sm font-medium"
          >
            <ExternalLink size={16} />
            Open Google Sheet
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-slate-800 text-white p-4 flex items-center justify-between z-50">
        <div className="flex items-center gap-3">
          <button onClick={onNavigateBack} className="text-slate-400 hover:text-white">
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-bold">Fatherhood Tracker</h1>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 hover:bg-slate-700 rounded-lg"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-slate-800 text-white z-40 pt-16 overflow-y-auto">
          <nav className="p-4">
            <ul className="space-y-2">
              {menuItems.map(item => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => {
                        setCurrentView(item.id as TrackerViewState);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        isActive 
                          ? 'bg-blue-600 text-white' 
                          : 'text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <Icon size={20} />
                      <span>{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Mobile Stats */}
          <div className="p-4 border-t border-slate-700">
            <div className="bg-slate-700/50 rounded-lg p-4">
              <p className="text-slate-400 text-xs uppercase tracking-wider mb-3">Quick Stats</p>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-slate-400">Total</p>
                  <p className="font-bold text-white text-lg">{liveStats.total}</p>
                </div>
                <div>
                  <p className="text-slate-400">Active</p>
                  <p className="font-bold text-blue-400 text-lg">{liveStats.active}</p>
                </div>
                <div>
                  <p className="text-slate-400">At Risk</p>
                  <p className="font-bold text-amber-400 text-lg">{liveStats.atRisk}</p>
                </div>
                <div>
                  <p className="text-slate-400">Inactive</p>
                  <p className="font-bold text-slate-400 text-lg">{liveStats.inactive}</p>
                </div>
                <div>
                  <p className="text-slate-400">Graduated</p>
                  <p className="font-bold text-emerald-400 text-lg">{liveStats.graduated}</p>
                </div>
                <div>
                  <p className="text-slate-400">Certificates</p>
                  <p className="font-bold text-purple-400 text-lg">{liveStats.certificates}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Action Buttons */}
          <div className="p-4 space-y-2">
            <button
              onClick={refreshData}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-all"
            >
              <RefreshCw size={18} />
              Refresh Data
            </button>
            <button
              onClick={() => window.open(GOOGLE_SHEET_URL, '_blank')}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-all font-medium"
            >
              <ExternalLink size={18} />
              Open Google Sheet
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 lg:p-8 p-4 pt-20 lg:pt-8 overflow-auto">
        {currentView === 'dashboard' && (
          <Dashboard 
            fathers={fathers} 
            stats={stats}
            modules={modules}
            onRefresh={refreshData}
          />
        )}
        {currentView === 'roster' && (
          <Roster 
            fathers={fathers} 
            modules={modules}
            onSelectFather={(id) => {
              setSelectedFatherId(id);
              setCurrentView('portal');
            }}
            onAddFather={addFatherToState}
            onUpdateFather={updateFatherInState}
            onRefresh={refreshData}
          />
        )}
        {currentView === 'checkin' && (
          <CheckIn 
            fathers={fathers} 
            modules={modules}
            onCheckIn={async (fatherId, moduleId) => {
              const result = await fatherhoodApi.checkIn(fatherId, moduleId);
              if (result.success && result.data) {
                updateFatherInState(result.data);
              }
              return result;
            }}
            onRefresh={refreshData}
          />
        )}
        {currentView === 'qrcheckin' && (
          <QRCheckIn modules={modules} />
        )}
        {currentView === 'portal' && (
          <FatherPortal 
            father={selectedFather}
            fathers={fathers}
            modules={modules}
            onSelectFather={setSelectedFatherId}
            onUpdateFather={updateFatherInState}
          />
        )}
        {currentView === 'import' && (
          <ImportCSV 
            onImport={async (newFathers) => {
              const result = await fatherhoodApi.importFathers(newFathers);
              if (result.success) {
                await refreshData();
              }
              return result;
            }}
          />
        )}
        {currentView === 'lost' && (
          <LostManagement 
            fathers={fathers.filter(f => f.status === 'At Risk' || f.completedModules.length < 2)}
            modules={modules}
            onUpdateFather={updateFatherInState}
            onRefresh={refreshData}
          />
        )}
        {currentView === 'idcard' && selectedFather && (
          <FatherIDCard father={selectedFather} modules={modules} />
        )}
        {currentView === 'export' && (
          <ExportData 
            fathers={fathers}
            modules={modules}
            onExport={fatherhoodApi.exportData}
          />
        )}
        {currentView === 'financials' && (
          <Financials onBack={() => setCurrentView('dashboard')} />
        )}
      </main>
    </div>
  );
};

export default FatherhoodTracking;
