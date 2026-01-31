import React, { useState } from 'react';
import { Father } from '../../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { Users, GraduationCap, UserX, AlertTriangle, X, Phone, Mail, CheckCircle2, Circle, Download, FileText, UserCheck, UserMinus, Clock, Printer, Calendar, Bell, Award } from 'lucide-react';

// Backend API URL for certificate generation
const API_BASE_URL = 'https://foamla-backend-2.onrender.com';

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
  inactive: number;
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
  const [listType, setListType] = useState<'active' | 'inactive' | 'atRisk' | 'all'>('all');
  
  // Certificate date picker state
  const [certificateDate, setCertificateDate] = useState<string>('');

  // ===== TIME-BASED ACTIVITY CALCULATIONS =====
  const now = new Date();

  const getDaysSinceActivity = (father: Father): number => {
    const lastActivity = (father as any).lastActivityDate || (father as any).lastAttendance || (father as any).lastCheckIn;
    if (!lastActivity) {
      if (father.joinedDate) {
        const joinedDate = new Date(father.joinedDate);
        return Math.floor((now.getTime() - joinedDate.getTime()) / (24 * 60 * 60 * 1000));
      }
      return 999;
    }
    const activityDate = new Date(lastActivity);
    return Math.floor((now.getTime() - activityDate.getTime()) / (24 * 60 * 60 * 1000));
  };

  const getActivityStatus = (father: Father): 'active' | 'atRisk' | 'inactive' | 'graduated' => {
    const completed = father.completedModules?.length || 0;
    if (completed === 14) return 'graduated';
    
    const daysSinceActivity = getDaysSinceActivity(father);
    if (daysSinceActivity >= 28) return 'inactive';
    if (daysSinceActivity >= 14) return 'atRisk';
    return 'active';
  };

  // ===== CALCULATE METRICS =====
  const totalEnrolled = stats?.totalFathers || fathers.length;
  
  const graduatedFathers = fathers.filter(f => (f.completedModules?.length || 0) === 14);
  const graduates = stats?.graduated || graduatedFathers.length;
  
  // NEW: Fathers at 13 modules (graduating soon)
  const graduatingSoonFathers = fathers.filter(f => (f.completedModules?.length || 0) === 13);
  const graduatingSoonCount = graduatingSoonFathers.length;
  
  const activeFathersList = fathers.filter(f => getActivityStatus(f) === 'active');
  const activeFathersCount = activeFathersList.length;
  
  const atRiskFathersList = fathers.filter(f => getActivityStatus(f) === 'atRisk');
  const atRiskCount = atRiskFathersList.length;
  
  const inactiveFathersList = fathers.filter(f => getActivityStatus(f) === 'inactive');
  const inactiveFathersCount = inactiveFathersList.length;

  // ===== REAL CHART DATA - Status Distribution =====
  const statusChartData = [
    { name: 'Active', value: activeFathersCount, color: '#3B82F6' },
    { name: 'At Risk', value: atRiskCount, color: '#F59E0B' },
    { name: 'Inactive', value: inactiveFathersCount, color: '#94A3B8' },
    { name: 'Graduated', value: graduates, color: '#10B981' },
  ];

  // ===== REAL CHART DATA - Module Progress Distribution =====
  const moduleProgressData = [
    { range: '0', count: fathers.filter(f => (f.completedModules?.length || 0) === 0).length, color: '#EF4444' },
    { range: '1-3', count: fathers.filter(f => { const c = f.completedModules?.length || 0; return c >= 1 && c <= 3; }).length, color: '#F59E0B' },
    { range: '4-7', count: fathers.filter(f => { const c = f.completedModules?.length || 0; return c >= 4 && c <= 7; }).length, color: '#3B82F6' },
    { range: '8-10', count: fathers.filter(f => { const c = f.completedModules?.length || 0; return c >= 8 && c <= 10; }).length, color: '#6366F1' },
    { range: '11-13', count: fathers.filter(f => { const c = f.completedModules?.length || 0; return c >= 11 && c <= 13; }).length, color: '#8B5CF6' },
    { range: '14', count: fathers.filter(f => (f.completedModules?.length || 0) === 14).length, color: '#10B981' },
  ];

  // ===== STATUS HELPER FUNCTIONS =====
  const getStatusColor = (father: Father) => {
    const status = getActivityStatus(father);
    switch (status) {
      case 'graduated': return 'bg-emerald-500';
      case 'active': 
        const count = father.completedModules?.length || 0;
        if (count >= 7) return 'bg-blue-400';
        return 'bg-blue-200';
      case 'atRisk': return 'bg-amber-400';
      case 'inactive': return 'bg-slate-300';
      default: return 'bg-slate-200';
    }
  };

  const getStatusText = (father: Father) => {
    const status = getActivityStatus(father);
    const daysSince = getDaysSinceActivity(father);
    switch (status) {
      case 'graduated': return 'Graduated';
      case 'active': return 'Active';
      case 'atRisk': return `At Risk (${daysSince}d)`;
      case 'inactive': return `Inactive (${daysSince}d)`;
      default: return 'Unknown';
    }
  };

  const getStatusBadgeColor = (father: Father) => {
    const status = getActivityStatus(father);
    switch (status) {
      case 'graduated': return 'bg-emerald-100 text-emerald-700';
      case 'active': return 'bg-blue-100 text-blue-700';
      case 'atRisk': return 'bg-amber-100 text-amber-700';
      case 'inactive': return 'bg-slate-100 text-slate-600';
      default: return 'bg-slate-100 text-slate-500';
    }
  };

  // ===== EVENT HANDLERS =====
  const handleMouseEnter = (father: Father, event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setHoverPosition({ x: rect.left + rect.width / 2, y: rect.top - 10 });
    setHoveredFather(father);
  };

  const handleMouseLeave = () => setHoveredFather(null);

  const handleClick = (father: Father) => {
    setSelectedFather(father);
    setHoveredFather(null);
    setCertificateDate(''); // Reset date when opening new father
  };

  const closeModal = () => {
    setSelectedFather(null);
    setCertificateDate('');
  };

  const openListModal = (type: 'active' | 'inactive' | 'atRisk' | 'all') => {
    setListType(type);
    setShowListModal(true);
  };

  const closeListModal = () => setShowListModal(false);

  const getFilteredList = () => {
    switch (listType) {
      case 'active': return activeFathersList;
      case 'atRisk': return atRiskFathersList;
      case 'inactive': return inactiveFathersList;
      default: return fathers;
    }
  };

  // ===== PRINT CERTIFICATE FUNCTION =====
  const handlePrintCertificate = (father: Father) => {
    let url = `${API_BASE_URL}/api/fathers/${father.id}/certificate`;
    if (certificateDate) {
      url += `?date=${certificateDate}`;
    }
    window.open(url, '_blank');
  };

  const downloadCSV = () => {
    const filteredFathers = getFilteredList();
    const headers = ['First Name', 'Last Name', 'Phone', 'Email', 'Modules Completed', 'Days Inactive', 'Status', 'Join Date'];
    
    const rows = filteredFathers.map(f => [
      f.firstName,
      f.lastName || '',
      f.phone || '',
      f.email || '',
      f.completedModules?.length || 0,
      getDaysSinceActivity(f),
      getActivityStatus(f),
      f.joinedDate || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.setAttribute('href', URL.createObjectURL(blob));
    link.setAttribute('download', `foam_fathers_${listType}_${new Date().toISOString().split('T')[0]}.csv`);
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
              Tracking {totalEnrolled} enrolled fathers. {atRiskCount > 0 && <span className="text-amber-400 font-bold">{atRiskCount} need outreach</span>}{atRiskCount > 0 && inactiveFathersCount > 0 && ', '}{inactiveFathersCount > 0 && <span className="text-slate-400">{inactiveFathersCount} inactive</span>}.
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
          
          {/* REAL DATA CHARTS */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-4">
            {/* Status Distribution Chart */}
            <div className="bg-slate-800/50 rounded-2xl p-4 border border-white/5">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Father Status</h4>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={55}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1E293B', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                    formatter={(value: number, name: string) => [`${value} fathers`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-3 mt-2">
                {statusChartData.map((item) => (
                  <div key={item.name} className="flex items-center gap-1 text-[10px]">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-slate-400">{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Module Progress Distribution Chart */}
            <div className="bg-slate-800/50 rounded-2xl p-4 border border-white/5">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Module Progress</h4>
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={moduleProgressData} barSize={20}>
                  <XAxis dataKey="range" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1E293B', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                    formatter={(value: number) => [`${value} fathers`, 'Count']}
                    labelFormatter={(label) => `Modules: ${label}`}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {moduleProgressData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="text-center text-[10px] text-slate-500 mt-2">Modules Completed</p>
            </div>
          </div>
        </div>
      </div>

      {/* GRADUATION ZONE - NEW SECTION */}
      {(graduatingSoonCount > 0 || graduates > 0) && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <GraduationCap size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white">Graduation Zone</h3>
              <p className="text-emerald-100 text-sm">Track upcoming and completed graduates</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Graduating Soon Card */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-3">
                <Bell size={18} className="text-yellow-300" />
                <span className="font-bold text-white">Graduating Soon</span>
                <span className="ml-auto bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full text-xs font-bold">{graduatingSoonCount}</span>
              </div>
              {graduatingSoonCount > 0 ? (
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {graduatingSoonFathers.map(f => (
                    <div 
                      key={f.id} 
                      className="flex items-center justify-between bg-white/10 rounded-lg p-2 hover:bg-white/20 transition-all"
                    >
                      <div 
                        className="flex items-center gap-2 cursor-pointer flex-1"
                        onClick={() => handleClick(f)}
                      >
                        <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center text-xs font-bold text-yellow-900">
                          {f.firstName.charAt(0)}{f.lastName?.charAt(0) || ''}
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">{f.firstName} {f.lastName}</p>
                          <p className="text-emerald-200 text-xs">13/14 modules</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-300 text-xs font-medium hidden sm:block">1 left!</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(`${API_BASE_URL}/api/fathers/${f.id}/certificate`, '_blank');
                          }}
                          className="p-1.5 bg-yellow-400 hover:bg-yellow-300 rounded-lg transition-all"
                          title="Prepare Certificate"
                        >
                          <Printer size={14} className="text-yellow-900" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-emerald-200 text-sm">No fathers at 13 modules right now</p>
              )}
            </div>

            {/* Graduates Ready for Certificate Card */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-3">
                <Award size={18} className="text-emerald-300" />
                <span className="font-bold text-white">Ready for Certificate</span>
                <span className="ml-auto bg-emerald-400 text-emerald-900 px-2 py-0.5 rounded-full text-xs font-bold">{graduates}</span>
              </div>
              {graduates > 0 ? (
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {graduatedFathers.slice(0, 5).map(f => (
                    <div 
                      key={f.id}
                      onClick={() => handleClick(f)}
                      className="flex items-center justify-between bg-white/10 rounded-lg p-2 cursor-pointer hover:bg-white/20 transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-emerald-400 rounded-lg flex items-center justify-center text-xs font-bold text-emerald-900">
                          {f.firstName.charAt(0)}{f.lastName?.charAt(0) || ''}
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">{f.firstName} {f.lastName}</p>
                          <p className="text-emerald-200 text-xs">14/14 ✓ Complete</p>
                        </div>
                      </div>
                      <Printer size={16} className="text-white/70" />
                    </div>
                  ))}
                  {graduates > 5 && (
                    <p className="text-emerald-200 text-xs text-center mt-2">+ {graduates - 5} more graduates</p>
                  )}
                </div>
              ) : (
                <p className="text-emerald-200 text-sm">No graduates yet</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards: Active | Alumni | At Risk | Inactive */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Active Fathers */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="p-4 rounded-xl bg-blue-50 text-blue-600">
            <UserCheck size={24} />
          </div>
          <div>
            <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest">Active</p>
            <h3 className="text-2xl font-black text-slate-800">{activeFathersCount}</h3>
            <p className="text-[9px] text-slate-400">Within 2 weeks</p>
          </div>
        </div>

        {/* Card 2: Alumni */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="p-4 rounded-xl bg-emerald-50 text-emerald-600">
            <GraduationCap size={24} />
          </div>
          <div>
            <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest">Alumni</p>
            <h3 className="text-2xl font-black text-slate-800">{graduates}</h3>
            <p className="text-[9px] text-slate-400">14/14 Complete</p>
          </div>
        </div>

        {/* Card 3: At Risk (2-4 weeks) */}
        <div className="bg-white p-6 rounded-3xl border border-amber-200 shadow-sm flex items-center space-x-4 bg-amber-50/30">
          <div className="p-4 rounded-xl bg-amber-100 text-amber-600">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest">At Risk</p>
            <h3 className="text-2xl font-black text-amber-600">{atRiskCount}</h3>
            <p className="text-[9px] text-amber-500 font-medium">2-4 weeks inactive</p>
          </div>
        </div>

        {/* Card 4: Inactive (4+ weeks) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="p-4 rounded-xl bg-slate-100 text-slate-500">
            <UserX size={24} />
          </div>
          <div>
            <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest">Inactive</p>
            <h3 className="text-2xl font-black text-slate-800">{inactiveFathersCount}</h3>
            <p className="text-[9px] text-slate-400">4+ weeks inactive</p>
          </div>
        </div>
      </div>

      {/* Generate List Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-white">
          <h3 className="font-bold text-lg">Generate Father Lists</h3>
          <p className="text-blue-100 text-sm">Export active, at-risk, inactive, or all fathers</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => openListModal('active')} className="flex items-center gap-2 bg-white text-blue-600 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-50 transition-all shadow-lg">
            <UserCheck size={18} />Active ({activeFathersCount})
          </button>
          <button onClick={() => openListModal('atRisk')} className="flex items-center gap-2 bg-amber-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-amber-600 transition-all shadow-lg">
            <AlertTriangle size={18} />At Risk ({atRiskCount})
          </button>
          <button onClick={() => openListModal('inactive')} className="flex items-center gap-2 bg-white/20 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-white/30 transition-all border border-white/30">
            <UserMinus size={18} />Inactive ({inactiveFathersCount})
          </button>
          <button onClick={() => openListModal('all')} className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all">
            <FileText size={18} />All ({fathers.length})
          </button>
        </div>
      </div>

      {/* Participant Roster */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative">
        <div className="flex items-center justify-between mb-8">
          <h4 className="text-xl font-black text-slate-800">Participant Roster Status</h4>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500"></div><span className="text-slate-500">Graduated</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-400"></div><span className="text-slate-500">Active</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-400"></div><span className="text-slate-500">At Risk (2-4 wks)</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-300"></div><span className="text-slate-500">Inactive (4+ wks)</span></div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-4 max-h-[500px] overflow-y-auto pr-2">
          {fathers.map((f) => {
            const completedCount = f.completedModules?.length || 0;
            const activityStatus = getActivityStatus(f);
            const daysSince = getDaysSinceActivity(f);
            const isGraduatingSoon = completedCount === 13;
            return (
              <div
                key={f.id}
                onMouseEnter={(e) => handleMouseEnter(f, e)}
                onMouseLeave={handleMouseLeave}
                onClick={() => handleClick(f)}
                className={`group relative bg-white border rounded-2xl p-4 transition-all cursor-pointer hover:shadow-lg hover:-translate-y-1 text-center ${
                  activityStatus === 'graduated' ? 'border-emerald-300 bg-emerald-50/50' :
                  isGraduatingSoon ? 'border-yellow-300 bg-yellow-50/50' :
                  activityStatus === 'atRisk' ? 'border-amber-300 bg-amber-50/50' : 
                  activityStatus === 'inactive' ? 'border-slate-200 bg-slate-50/50 opacity-60' : 
                  'border-slate-100 hover:border-blue-300'
                }`}
              >
                <div className={`w-4 h-4 rounded-full mx-auto mb-3 shadow-sm ${getStatusColor(f)}`}></div>
                <p className="text-[11px] font-bold text-slate-800 truncate w-full">{f.firstName} {f.lastName?.charAt(0)}.</p>
                <p className="text-[9px] font-mono text-slate-400">{completedCount}/14</p>
                {activityStatus === 'graduated' && (
                  <GraduationCap size={12} className="mx-auto mt-1 text-emerald-500" />
                )}
                {isGraduatingSoon && (
                  <Bell size={12} className="mx-auto mt-1 text-yellow-500" />
                )}
                {(activityStatus === 'atRisk' || activityStatus === 'inactive') && (
                  <p className={`text-[8px] mt-1 ${activityStatus === 'atRisk' ? 'text-amber-600 font-bold' : 'text-slate-400'}`}>{daysSince}d ago</p>
                )}
              </div>
            );
          })}
        </div>

        {/* Hover Tooltip */}
        {hoveredFather && (
          <div className="fixed z-50 bg-slate-900 text-white rounded-xl p-4 shadow-2xl pointer-events-none transform -translate-x-1/2 -translate-y-full" style={{ left: hoverPosition.x, top: hoverPosition.y - 10, minWidth: '220px' }}>
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(hoveredFather)}`}></div>
              <span className="font-bold">{hoveredFather.firstName} {hoveredFather.lastName}</span>
            </div>
            <div className="text-xs text-slate-400 space-y-1">
              <p>Progress: <span className="text-white font-medium">{hoveredFather.completedModules?.length || 0}/14 modules</span></p>
              <p>Last Active: <span className="text-white font-medium">{getDaysSinceActivity(hoveredFather)} days ago</span></p>
              <p>Status: <span className={`px-2 py-0.5 rounded text-xs ${getStatusBadgeColor(hoveredFather)}`}>{getStatusText(hoveredFather)}</span></p>
              {hoveredFather.phone && <p>Phone: <span className="text-white">{hoveredFather.phone}</span></p>}
              {(hoveredFather.completedModules?.length || 0) === 13 && (
                <p className="text-yellow-400 font-bold mt-1">⚡ Graduating next class!</p>
              )}
              {(hoveredFather.completedModules?.length || 0) === 14 && (
                <p className="text-emerald-400 font-bold mt-1">🎓 Click to print certificate</p>
              )}
              <p className="text-blue-400 mt-2">Click to view full profile →</p>
            </div>
            <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-slate-900"></div>
          </div>
        )}
      </div>

      {/* Father Detail Modal - UPDATED WITH CERTIFICATE SECTION */}
      {selectedFather && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className={`p-6 rounded-t-3xl text-white relative ${
              getActivityStatus(selectedFather) === 'graduated' 
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600' 
                : 'bg-gradient-to-r from-slate-800 to-slate-900'
            }`}>
              <button onClick={closeModal} className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-all"><X size={20} /></button>
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black ${
                  getActivityStatus(selectedFather) === 'graduated' ? 'bg-white/20' : 'bg-blue-600'
                }`}>
                  {getActivityStatus(selectedFather) === 'graduated' ? (
                    <GraduationCap size={32} />
                  ) : (
                    <>{selectedFather.firstName.charAt(0)}{selectedFather.lastName?.charAt(0) || ''}</>
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-black">{selectedFather.firstName} {selectedFather.lastName}</h2>
                  <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold ${
                    getActivityStatus(selectedFather) === 'graduated' 
                      ? 'bg-white/20 text-white' 
                      : getStatusBadgeColor(selectedFather)
                  }`}>{getStatusText(selectedFather)}</span>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* GRADUATING SOON ALERT (13 modules) */}
              {(selectedFather.completedModules?.length || 0) === 13 && (
                <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-yellow-700 mb-2">
                    <Bell size={18} />
                    <span className="font-bold text-sm">Graduating Next Class!</span>
                  </div>
                  <p className="text-xs text-yellow-600 mb-3">This father has completed 13/14 modules. Prepare their certificate for next Tuesday's class!</p>
                  
                  {/* Date Picker for 13-module fathers */}
                  <div className="mb-3">
                    <label className="block text-xs font-medium text-yellow-700 mb-1">
                      Ceremony Date (optional)
                    </label>
                    <div className="relative">
                      <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-yellow-500" />
                      <input
                        type="date"
                        value={certificateDate}
                        onChange={(e) => setCertificateDate(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-yellow-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white"
                        placeholder="Select date"
                      />
                    </div>
                    <p className="text-xs text-yellow-600 mt-1">Leave blank to use today's date</p>
                  </div>

                  {/* Prepare Certificate Button */}
                  <button
                    onClick={() => handlePrintCertificate(selectedFather)}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-yellow-900 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                  >
                    <Printer size={18} />
                    Prepare Certificate
                  </button>
                </div>
              )}

              {/* CERTIFICATE SECTION (14 modules - graduated) */}
              {(selectedFather.completedModules?.length || 0) === 14 && (
                <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-emerald-700 mb-3">
                    <Award size={18} />
                    <span className="font-bold text-sm">🎓 Print Certificate</span>
                  </div>
                  
                  {/* Date Picker */}
                  <div className="mb-3">
                    <label className="block text-xs font-medium text-emerald-700 mb-1">
                      Ceremony Date (optional)
                    </label>
                    <div className="relative">
                      <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500" />
                      <input
                        type="date"
                        value={certificateDate}
                        onChange={(e) => setCertificateDate(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-emerald-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="Select date"
                      />
                    </div>
                    <p className="text-xs text-emerald-600 mt-1">Leave blank to use today's date</p>
                  </div>

                  {/* Print Button */}
                  <button
                    onClick={() => handlePrintCertificate(selectedFather)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                  >
                    <Printer size={18} />
                    Print Certificate
                  </button>
                </div>
              )}

              {getActivityStatus(selectedFather) === 'atRisk' && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-amber-700 mb-2"><Clock size={16} /><span className="font-bold text-sm">At Risk - {getDaysSinceActivity(selectedFather)} Days Inactive</span></div>
                  <p className="text-xs text-amber-600">This father hasn't attended in 2+ weeks. Reach out before they become inactive.</p>
                </div>
              )}

              {getActivityStatus(selectedFather) === 'inactive' && (
                <div className="bg-slate-100 border border-slate-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-slate-700 mb-2"><UserX size={16} /><span className="font-bold text-sm">Inactive - {getDaysSinceActivity(selectedFather)} Days</span></div>
                  <p className="text-xs text-slate-600">This father has been inactive for 4+ weeks. Consider a re-engagement call.</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-slate-400 mb-1"><Phone size={14} /><span className="text-xs uppercase font-bold">Phone</span></div>
                  <p className="font-medium text-slate-800">{selectedFather.phone || 'Not provided'}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-slate-400 mb-1"><Mail size={14} /><span className="text-xs uppercase font-bold">Email</span></div>
                  <p className="font-medium text-slate-800 text-sm truncate">{selectedFather.email || 'Not provided'}</p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-slate-800">Module Progress</span>
                  <span className="text-sm text-slate-500">{selectedFather.completedModules?.length || 0}/14</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3">
                  <div className={`h-3 rounded-full ${
                    (selectedFather.completedModules?.length || 0) === 14 
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500' 
                      : 'bg-gradient-to-r from-blue-500 to-blue-600'
                  }`} style={{ width: `${((selectedFather.completedModules?.length || 0) / 14) * 100}%` }}></div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-800 mb-3">Completed Modules</h4>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {modules.map((module) => {
                    const isCompleted = selectedFather.completedModules?.includes(module.id) || false;
                    return (
                      <div key={module.id} className={`flex items-center gap-2 p-2 rounded-lg text-xs ${isCompleted ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-400'}`}>
                        {isCompleted ? <CheckCircle2 size={14} className="text-emerald-500 shrink-0" /> : <Circle size={14} className="shrink-0" />}
                        <span className="truncate">{module.id}. {module.title}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between text-sm border-t pt-4">
                <div><span className="text-slate-500">Joined: </span><span className="font-medium text-slate-800">{selectedFather.joinedDate || 'Unknown'}</span></div>
                <div><span className="text-slate-500">Last Active: </span><span className="font-medium text-slate-800">{getDaysSinceActivity(selectedFather)}d ago</span></div>
              </div>

              {(getActivityStatus(selectedFather) === 'atRisk' || getActivityStatus(selectedFather) === 'inactive') && (
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-sm transition-all">Initiate Re-engagement Outreach</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Generate List Modal */}
      {showListModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closeListModal}>
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[85vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className={`p-6 text-white relative ${listType === 'atRisk' ? 'bg-gradient-to-r from-amber-500 to-amber-600' : listType === 'inactive' ? 'bg-gradient-to-r from-slate-600 to-slate-700' : 'bg-gradient-to-r from-blue-600 to-blue-700'}`}>
              <button onClick={closeListModal} className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-all"><X size={20} /></button>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 rounded-xl">
                  {listType === 'active' ? <UserCheck size={24} /> : listType === 'atRisk' ? <AlertTriangle size={24} /> : listType === 'inactive' ? <UserMinus size={24} /> : <Users size={24} />}
                </div>
                <div>
                  <h2 className="text-2xl font-black">{listType === 'active' ? 'Active Fathers' : listType === 'atRisk' ? 'At-Risk Fathers' : listType === 'inactive' ? 'Inactive Fathers' : 'All Fathers'}</h2>
                  <p className="text-white/80 text-sm">{listType === 'active' ? 'Active within 2 weeks' : listType === 'atRisk' ? '2-4 weeks inactive' : listType === 'inactive' ? '4+ weeks inactive' : 'All enrolled'} • {getFilteredList().length} fathers</p>
                </div>
              </div>
            </div>

            <div className="flex border-b">
              <button onClick={() => setListType('active')} className={`flex-1 py-3 text-sm font-bold transition-all ${listType === 'active' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-slate-500 hover:bg-slate-50'}`}>Active ({activeFathersCount})</button>
              <button onClick={() => setListType('atRisk')} className={`flex-1 py-3 text-sm font-bold transition-all ${listType === 'atRisk' ? 'text-amber-600 border-b-2 border-amber-500 bg-amber-50' : 'text-slate-500 hover:bg-slate-50'}`}>At Risk ({atRiskCount})</button>
              <button onClick={() => setListType('inactive')} className={`flex-1 py-3 text-sm font-bold transition-all ${listType === 'inactive' ? 'text-slate-600 border-b-2 border-slate-500 bg-slate-50' : 'text-slate-500 hover:bg-slate-50'}`}>Inactive ({inactiveFathersCount})</button>
              <button onClick={() => setListType('all')} className={`flex-1 py-3 text-sm font-bold transition-all ${listType === 'all' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-slate-500 hover:bg-slate-50'}`}>All ({fathers.length})</button>
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              <table className="w-full">
                <thead className="bg-slate-50 sticky top-0">
                  <tr>
                    <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase">Name</th>
                    <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase">Phone</th>
                    <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase">Progress</th>
                    <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase">Days Inactive</th>
                    <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredList().map((f, idx) => (
                    <tr key={f.id} className={`border-b border-slate-100 hover:bg-slate-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white ${getActivityStatus(f) === 'graduated' ? 'bg-emerald-500' : getActivityStatus(f) === 'active' ? 'bg-blue-500' : getActivityStatus(f) === 'atRisk' ? 'bg-amber-500' : 'bg-slate-400'}`}>
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
                            <div className={`h-2 rounded-full ${getActivityStatus(f) === 'graduated' ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${((f.completedModules?.length || 0) / 14) * 100}%` }}></div>
                          </div>
                          <span className="text-xs text-slate-500">{f.completedModules?.length || 0}/14</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm"><span className={getDaysSinceActivity(f) >= 14 ? 'text-amber-600 font-bold' : 'text-slate-600'}>{getDaysSinceActivity(f)}d</span></td>
                      <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusBadgeColor(f)}`}>{getActivityStatus(f) === 'atRisk' ? 'At Risk' : getActivityStatus(f).charAt(0).toUpperCase() + getActivityStatus(f).slice(1)}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {getFilteredList().length === 0 && (
                <div className="text-center py-12 text-slate-500"><UserX size={48} className="mx-auto mb-4 text-slate-300" /><p>No fathers in this category</p></div>
              )}
            </div>

            <div className="p-4 border-t bg-slate-50 flex justify-between items-center">
              <p className="text-sm text-slate-500">Showing {getFilteredList().length} fathers</p>
              <button onClick={downloadCSV} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all"><Download size={18} />Download CSV</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
