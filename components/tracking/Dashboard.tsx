import React, { useState } from 'react';
import { Father } from '../../types';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Users, GraduationCap, Activity, UserX, TrendingUp, AlertTriangle, X, Phone, Mail, CheckCircle2, Circle, Download, FileText, UserCheck, UserMinus } from 'lucide-react';

interface Module {
  id: number;
  title: string;
  description?: string;
}

interface Stats {
  totalFathers: number;
  graduated: number;
  active: number;
  atRisk: number;
  graduationRate: string;
  averageProgress: string;
  totalModulesCompleted: number;
  todaysClass: {
    date: string;
    moduleId: number;
    topic: string;
  } | null;
  nextClass: {
    date: string;
    moduleId: number;
    topic: string;
  };
}

interface DashboardProps {
  fathers: Father[];
  stats: Stats | null;
  modules: Module[];
  onRefresh?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ fathers, stats, modules }) => {
  const [hoveredFather, setHoveredFather] = useState<Father | null>(null);
  const [selectedFather, setSelectedFather] = useState<Father | null>(null);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });
  const [showListModal, setShowListModal] = useState(false);
  const [listType, setListType] = useState<'active' | 'inactive' | 'all'>('all');

  // ===== CALCULATE METRICS =====
  const totalEnrolled = stats?.totalFathers || fathers.length;
  
  // Graduates (Alumni) - completed all 14 modules
  const graduatedFathers = fathers.filter(f => {
    const completed = f.completedModules?.length || 0;
    return completed === 14;
  });
  const graduates = stats?.graduated || graduatedFathers.length;
  
  // Active Fathers - have progress (1-13 modules) and not marked inactive
  const activeFathersList = fathers.filter(f => {
    const completed = f.completedModules?.length || 0;
    const isInactive = f.status?.toLowerCase() === 'inactive' || f.status?.toLowerCase() === 'lost';
    return completed > 0 && completed < 14 && !isInactive;
  });
  const activeFathersCount = stats?.active || activeFathersList.length;
  
  // Inactive Fathers - 0 modules OR explicitly marked inactive/lost
  const inactiveFathersList = fathers.filter(f => {
    const completed = f.completedModules?.length || 0;
    const isInactive = f.status?.toLowerCase() === 'inactive' || f.status?.toLowerCase() === 'lost';
    return completed === 0 || isInactive;
  });
  const inactiveFathersCount = inactiveFathersList.length;
  
  // At Risk - from stats or those with very low progress (0-1 modules)
  const atRiskCount = stats?.atRisk || fathers.filter(f => {
    const completed = f.completedModules?.length || 0;
    return completed <= 1;
  }).length;

  // Completion calculations
  const totalPossible = totalEnrolled * 14;
  const totalDone = fathers.reduce((acc, f) => acc + (f.completedModules?.length || 0), 0);
  const avgCompletion = totalPossible > 0 ? Math.round((totalDone / totalPossible) * 100) : 0;

  // Trend data for chart
  const trendData = [
    { month: 'Jan', enrolled: 180, completed: 500 },
    { month: 'Feb', enrolled: 195, completed: 620 },
    { month: 'Mar', enrolled: 210, completed: 840 },
    { month: 'Apr', enrolled: 225, completed: 1100 },
    { month: 'May', enrolled: 235, completed: 1350 },
    { month: 'Jun', enrolled: totalEnrolled, completed: totalDone },
  ];

  // ===== STATUS HELPER FUNCTIONS =====
  const getStatusColor = (count: number) => {
    if (count === 14) return 'bg-emerald-500';
    if (count >= 7) return 'bg-blue-400';
    if (count > 0) return 'bg-blue-200';
    return 'bg-slate-200';
  };

  const getStatusText = (count: number) => {
    if (count === 14) return 'Graduated';
    if (count >= 7) return 'Active';
    if (count > 0) return 'In Progress';
    return 'At Risk';
  };

  const getStatusBadgeColor = (count: number) => {
    if (count === 14) return 'bg-emerald-100 text-emerald-700';
    if (count >= 7) return 'bg-blue-100 text-blue-700';
    if (count > 0) return 'bg-amber-100 text-amber-700';
    return 'bg-red-100 text-red-700';
  };

  // ===== EVENT HANDLERS =====
  const handleMouseEnter = (father: Father, event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setHoverPosition({ 
      x: rect.left + rect.width / 2, 
      y: rect.top - 10 
    });
    setHoveredFather(father);
  };

  const handleMouseLeave = () => {
    setHoveredFather(null);
  };

  const handleClick = (father: Father) => {
    setSelectedFather(father);
    setHoveredFather(null);
  };

  const closeModal = () => {
    setSelectedFather(null);
  };

  // ===== GENERATE LIST FUNCTIONS =====
  const openListModal = (type: 'active' | 'inactive' | 'all') => {
    setListType(type);
    setShowListModal(true);
  };

  const closeListModal = () => {
    setShowListModal(false);
  };

  const getFilteredList = () => {
    switch (listType) {
      case 'active':
        return fathers.filter(f => {
          const completed = f.completedModules?.length || 0;
          const isInactive = f.status?.toLowerCase() === 'inactive' || f.status?.toLowerCase() === 'lost';
          return completed > 0 && !isInactive;
        });
      case 'inactive':
        return fathers.filter(f => {
          const completed = f.completedModules?.length || 0;
          const isInactive = f.status?.toLowerCase() === 'inactive' || f.status?.toLowerCase() === 'lost';
          return completed === 0 || isInactive;
        });
      default:
        return fathers;
    }
  };

  const downloadCSV = () => {
    const filteredFathers = getFilteredList();
    const headers = ['First Name', 'Last Name', 'Phone', 'Email', 'Modules Completed', 'Status', 'Join Date'];
    
    const rows = filteredFathers.map(f => [
      f.firstName,
      f.lastName || '',
      f.phone || '',
      f.email || '',
      f.completedModules?.length || 0,
      getStatusText(f.completedModules?.length || 0),
      f.joinedDate || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `foam_fathers_${listType}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Executive Summary Header */}
      <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl overflow-hidden relative border border-slate-800">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-10 items-center">
          <div className="lg:col-span-1">
            <span className="bg-blue-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">Admin Dashboard</span>
            <h2 className="text-4xl font-black mt-4 leading-tight">Executive Summary</h2>
            <p className="text-slate-400 mt-4 text-sm leading-relaxed">
              Analyzing completion velocity for {totalEnrolled} enrolled fathers. Current trajectory shows {avgCompletion}% aggregate readiness.
            </p>
            <div className="mt-8 flex items-center space-x-6 mb-8">
              <div className="flex flex-col">
                <span className="text-3xl font-black">{totalEnrolled}</span>
                <span className="text-[10px] uppercase text-slate-500 font-black tracking-widest">Enrolled</span>
              </div>
              <div className="w-px h-10 bg-slate-800"></div>
              <div className="flex flex-col">
                <span className="text-3xl font-black text-emerald-400">{graduates}</span>
                <span className="text-[10px] uppercase text-slate-500 font-black tracking-widest">Graduates</span>
              </div>
              <div className="w-px h-10 bg-slate-800"></div>
              <div className="flex flex-col">
                <span className="text-3xl font-black text-amber-400">{atRiskCount}</span>
                <span className="text-[10px] uppercase text-slate-500 font-black tracking-widest">At Risk</span>
              </div>
            </div>
          </div>
          <div className="lg:col-span-2 h-64 bg-slate-800/50 rounded-2xl p-6 border border-white/5 shadow-inner">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center">
              <TrendingUp size={14} className="mr-2 text-blue-500" />
              Participation Momentum
            </h4>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="month" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', border: 'none', borderRadius: '12px', color: '#fff' }} />
                <Area type="monotone" dataKey="completed" stroke="#1A73E8" strokeWidth={3} fillOpacity={0.2} fill="#1A73E8" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Stats Cards - REORGANIZED */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Total Active Fathers */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="p-4 rounded-xl bg-blue-50 text-blue-600">
            <Users size={24} />
          </div>
          <div>
            <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest">Total Active</p>
            <h3 className="text-2xl font-black text-slate-800">{activeFathersCount}</h3>
          </div>
        </div>

        {/* Card 2: Alumni (Graduates) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="p-4 rounded-xl bg-emerald-50 text-emerald-600">
            <GraduationCap size={24} />
          </div>
          <div>
            <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest">Alumni</p>
            <h3 className="text-2xl font-black text-slate-800">{graduates}</h3>
          </div>
        </div>

        {/* Card 3: Inactive Fathers (replaced Program Status) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="p-4 rounded-xl bg-slate-100 text-slate-600">
            <UserX size={24} />
          </div>
          <div>
            <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest">Inactive</p>
            <h3 className="text-2xl font-black text-slate-800">{inactiveFathersCount}</h3>
          </div>
        </div>

        {/* Card 4: Completion Rate */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="p-4 rounded-xl bg-purple-50 text-purple-600">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest">Completion Rate</p>
            <h3 className="text-2xl font-black text-slate-800">{avgCompletion}%</h3>
          </div>
        </div>
      </div>

      {/* Generate List Button Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-white">
          <h3 className="font-bold text-lg">Generate Father Lists</h3>
          <p className="text-blue-100 text-sm">Export active, inactive, or all fathers as a downloadable list</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => openListModal('active')}
            className="flex items-center gap-2 bg-white text-blue-600 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-50 transition-all shadow-lg"
          >
            <UserCheck size={18} />
            Active List
          </button>
          <button
            onClick={() => openListModal('inactive')}
            className="flex items-center gap-2 bg-white/20 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-white/30 transition-all border border-white/30"
          >
            <UserMinus size={18} />
            Inactive List
          </button>
          <button
            onClick={() => openListModal('all')}
            className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all"
          >
            <FileText size={18} />
            All Fathers
          </button>
        </div>
      </div>

      {/* Participant Roster Status */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative">
        <div className="flex items-center justify-between mb-8">
          <h4 className="text-xl font-black text-slate-800">Participant Roster Status</h4>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span className="text-slate-500">Graduated</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-400"></div>
              <span className="text-slate-500">Active (7+)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-200"></div>
              <span className="text-slate-500">In Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-slate-200"></div>
              <span className="text-slate-500">At Risk</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-4 max-h-[500px] overflow-y-auto pr-2">
          {fathers.map((f) => {
            const completedCount = f.completedModules?.length || 0;
            return (
              <div
                key={f.id}
                onMouseEnter={(e) => handleMouseEnter(f, e)}
                onMouseLeave={handleMouseLeave}
                onClick={() => handleClick(f)}
                className="group relative bg-white border border-slate-100 rounded-2xl p-4 transition-all cursor-pointer hover:border-blue-300 hover:shadow-lg hover:-translate-y-1 text-center"
              >
                <div className={`w-4 h-4 rounded-full mx-auto mb-3 shadow-sm ${getStatusColor(completedCount)}`}></div>
                <p className="text-[11px] font-bold text-slate-800 truncate w-full">{f.firstName} {f.lastName?.charAt(0)}.</p>
                <p className="text-[9px] font-mono text-slate-400">{completedCount}/14</p>
              </div>
            );
          })}
        </div>

        {/* Hover Preview Tooltip */}
        {hoveredFather && (
          <div 
            className="fixed z-50 bg-slate-900 text-white rounded-xl p-4 shadow-2xl pointer-events-none transform -translate-x-1/2 -translate-y-full"
            style={{ 
              left: hoverPosition.x, 
              top: hoverPosition.y - 10,
              minWidth: '200px'
            }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(hoveredFather.completedModules?.length || 0)}`}></div>
              <span className="font-bold">{hoveredFather.firstName} {hoveredFather.lastName}</span>
            </div>
            <div className="text-xs text-slate-400 space-y-1">
              <p>Progress: <span className="text-white font-medium">{hoveredFather.completedModules?.length || 0} of 14 modules</span></p>
              <p>Status: <span className={`px-2 py-0.5 rounded text-xs ${getStatusBadgeColor(hoveredFather.completedModules?.length || 0)}`}>
                {getStatusText(hoveredFather.completedModules?.length || 0)}
              </span></p>
              {hoveredFather.phone && <p>Phone: <span className="text-white">{hoveredFather.phone}</span></p>}
              <p className="text-blue-400 mt-2">Click to view full profile →</p>
            </div>
            {/* Arrow */}
            <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-slate-900"></div>
          </div>
        )}
      </div>

      {/* Father Detail Modal */}
      {selectedFather && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <div 
            className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-6 rounded-t-3xl text-white relative">
              <button 
                onClick={closeModal}
                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-all"
              >
                <X size={20} />
              </button>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-2xl font-black">
                  {selectedFather.firstName.charAt(0)}{selectedFather.lastName?.charAt(0) || ''}
                </div>
                <div>
                  <h2 className="text-2xl font-black">{selectedFather.firstName} {selectedFather.lastName}</h2>
                  <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold ${getStatusBadgeColor(selectedFather.completedModules?.length || 0)}`}>
                    {getStatusText(selectedFather.completedModules?.length || 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-slate-400 mb-1">
                    <Phone size={14} />
                    <span className="text-xs uppercase font-bold">Phone</span>
                  </div>
                  <p className="font-medium text-slate-800">{selectedFather.phone || 'Not provided'}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-slate-400 mb-1">
                    <Mail size={14} />
                    <span className="text-xs uppercase font-bold">Email</span>
                  </div>
                  <p className="font-medium text-slate-800 text-sm truncate">{selectedFather.email || 'Not provided'}</p>
                </div>
              </div>

              {/* Progress */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-slate-800">Module Progress</span>
                  <span className="text-sm text-slate-500">{selectedFather.completedModules?.length || 0} of 14 complete</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all"
                    style={{ width: `${((selectedFather.completedModules?.length || 0) / 14) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Module Checklist */}
              <div>
                <h4 className="text-sm font-bold text-slate-800 mb-3">Completed Modules</h4>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {modules.map((module) => {
                    const isCompleted = selectedFather.completedModules?.includes(module.id) || false;
                    return (
                      <div 
                        key={module.id}
                        className={`flex items-center gap-2 p-2 rounded-lg text-xs ${
                          isCompleted ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-400'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                        ) : (
                          <Circle size={14} className="shrink-0" />
                        )}
                        <span className="truncate">{module.id}. {module.title}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Join Date */}
              <div className="flex items-center justify-between text-sm border-t pt-4">
                <span className="text-slate-500">Joined</span>
                <span className="font-medium text-slate-800">{selectedFather.joinedDate || 'Unknown'}</span>
              </div>

              {/* Action Buttons */}
              {(selectedFather.completedModules?.length || 0) < 2 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-amber-700 mb-2">
                    <AlertTriangle size={16} />
                    <span className="font-bold text-sm">At Risk - Needs Outreach</span>
                  </div>
                  <p className="text-xs text-amber-600 mb-3">
                    This father has completed fewer than 2 modules. Consider reaching out to re-engage.
                  </p>
                  <button className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2 rounded-lg font-bold text-sm transition-all">
                    Initiate Re-engagement
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Generate List Modal */}
      {showListModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closeListModal}>
          <div 
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white relative">
              <button 
                onClick={closeListModal}
                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-all"
              >
                <X size={20} />
              </button>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 rounded-xl">
                  {listType === 'active' ? <UserCheck size={24} /> : listType === 'inactive' ? <UserMinus size={24} /> : <Users size={24} />}
                </div>
                <div>
                  <h2 className="text-2xl font-black">
                    {listType === 'active' ? 'Active Fathers' : listType === 'inactive' ? 'Inactive Fathers' : 'All Fathers'}
                  </h2>
                  <p className="text-blue-100 text-sm">{getFilteredList().length} fathers in this list</p>
                </div>
              </div>
            </div>

            {/* List Type Tabs */}
            <div className="flex border-b">
              <button
                onClick={() => setListType('active')}
                className={`flex-1 py-3 text-sm font-bold transition-all ${listType === 'active' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                Active ({activeFathersList.length})
              </button>
              <button
                onClick={() => setListType('inactive')}
                className={`flex-1 py-3 text-sm font-bold transition-all ${listType === 'inactive' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                Inactive ({inactiveFathersList.length})
              </button>
              <button
                onClick={() => setListType('all')}
                className={`flex-1 py-3 text-sm font-bold transition-all ${listType === 'all' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                All ({fathers.length})
              </button>
            </div>

            {/* List Content */}
            <div className="max-h-[400px] overflow-y-auto">
              <table className="w-full">
                <thead className="bg-slate-50 sticky top-0">
                  <tr>
                    <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase">Name</th>
                    <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase">Phone</th>
                    <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase">Progress</th>
                    <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredList().map((f, index) => {
                    const completedCount = f.completedModules?.length || 0;
                    return (
                      <tr key={f.id} className={`border-b border-slate-100 hover:bg-slate-50 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white ${completedCount === 14 ? 'bg-emerald-500' : completedCount > 0 ? 'bg-blue-500' : 'bg-slate-400'}`}>
                              {f.firstName.charAt(0)}{f.lastName?.charAt(0) || ''}
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 text-sm">{f.firstName} {f.lastName}</p>
                              <p className="text-xs text-slate-400">{f.email || 'No email'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-slate-600">{f.phone || 'N/A'}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-slate-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${completedCount === 14 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                                style={{ width: `${(completedCount / 14) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-slate-500">{completedCount}/14</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusBadgeColor(completedCount)}`}>
                            {getStatusText(completedCount)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              
              {getFilteredList().length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  <UserX size={48} className="mx-auto mb-4 text-slate-300" />
                  <p className="font-medium">No fathers found in this category</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t bg-slate-50 flex justify-between items-center">
              <p className="text-sm text-slate-500">
                Showing {getFilteredList().length} of {fathers.length} total fathers
              </p>
              <button
                onClick={downloadCSV}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all"
              >
                <Download size={18} />
                Download CSV
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
