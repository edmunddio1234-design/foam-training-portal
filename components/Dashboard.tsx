import React, { useState } from 'react';
import {
  Users, Award, AlertTriangle, TrendingUp, Calendar, Clock,
  MapPin, ChevronRight, RefreshCw, User, Phone, Mail, CheckCircle2,
  X, UserX
} from 'lucide-react';
import { Father, Module, Stats } from '../../services/fatherhoodApi';

interface DashboardProps {
  fathers: Father[];
  stats: Stats | null;
  modules: Module[];
  onRefresh: () => void;
}

// Father Preview Tooltip Component
interface FatherPreviewProps {
  father: Father;
  modules: Module[];
  position: { x: number; y: number };
}

const FatherPreview: React.FC<FatherPreviewProps> = ({ father, modules, position }) => {
  const progressPercent = Math.round((father.completedModules.length / 14) * 100);
  const completedModuleNames = father.completedModules
    .slice(0, 3)
    .map(id => modules.find(m => m.id === id)?.title || `Module ${id}`)
    .join(', ');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Graduated': return 'bg-emerald-500';
      case 'Active': return 'bg-blue-500';
      case 'At Risk': return 'bg-amber-500';
      case 'Inactive': return 'bg-slate-500';
      default: return 'bg-blue-500';
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'Graduated': return 'text-emerald-600';
      case 'Active': return 'text-blue-600';
      case 'At Risk': return 'text-amber-600';
      case 'Inactive': return 'text-slate-600';
      default: return 'text-blue-600';
    }
  };

  return (
    <div
      className="fixed z-50 bg-white rounded-xl shadow-2xl border border-slate-200 p-4 w-72 pointer-events-none"
      style={{
        left: Math.min(position.x + 10, window.innerWidth - 300),
        top: Math.min(position.y + 10, window.innerHeight - 250)
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${getStatusColor(father.status)}`}>
          {father.firstName[0]}{father.lastName?.[0] || ''}
        </div>
        <div>
          <p className="font-bold text-slate-800">{father.firstName} {father.lastName}</p>
          <p className={`text-sm font-medium ${getStatusTextColor(father.status)}`}>
            {father.status}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-slate-500">Progress</span>
          <span className="font-bold">{father.completedModules.length}/14</span>
        </div>
        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${getStatusColor(father.status)}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-1 text-sm text-slate-600 mb-3">
        {father.phone && (
          <div className="flex items-center gap-2">
            <Phone size={14} className="text-slate-400" />
            {father.phone}
          </div>
        )}
        {father.email && (
          <div className="flex items-center gap-2">
            <Mail size={14} className="text-slate-400" />
            {father.email}
          </div>
        )}
      </div>

      {/* Recent Classes */}
      {father.completedModules.length > 0 && (
        <div className="text-xs text-slate-500">
          <span className="font-medium">Recent:</span> {completedModuleNames}
          {father.completedModules.length > 3 && ` +${father.completedModules.length - 3} more`}
        </div>
      )}

      {/* Click hint */}
      <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-400 text-center">
        Click for full details
      </div>
    </div>
  );
};

// Father Detail Modal
interface FatherDetailModalProps {
  father: Father;
  modules: Module[];
  onClose: () => void;
}

const FatherDetailModal: React.FC<FatherDetailModalProps> = ({ father, modules, onClose }) => {
  const progressPercent = Math.round((father.completedModules.length / 14) * 100);

  const getGradientClass = (status: string) => {
    switch (status) {
      case 'Graduated': return 'bg-gradient-to-r from-emerald-500 to-emerald-600';
      case 'Active': return 'bg-gradient-to-r from-blue-500 to-blue-600';
      case 'At Risk': return 'bg-gradient-to-r from-amber-500 to-amber-600';
      case 'Inactive': return 'bg-gradient-to-r from-slate-500 to-slate-600';
      default: return 'bg-gradient-to-r from-blue-500 to-blue-600';
    }
  };

  const getStatusDescription = (status: string) => {
    switch (status) {
      case 'Graduated': return 'Completed all 14 modules';
      case 'Active': return 'Checked in within last 30 days';
      case 'At Risk': return 'No check-in for 31-90 days';
      case 'Inactive': return 'No check-in for 90+ days';
      default: return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-6 text-white rounded-t-2xl ${getGradientClass(father.status)}`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
                {father.firstName[0]}{father.lastName?.[0] || ''}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{father.firstName} {father.lastName}</h2>
                <p className="text-white/80">{father.status}</p>
                <p className="text-white/60 text-sm">{getStatusDescription(father.status)}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-all"
            >
              <X size={24} />
            </button>
          </div>

          {/* Progress */}
          <div className="mt-6">
            <div className="flex justify-between mb-2">
              <span className="text-white/80">Progress</span>
              <span className="font-bold">{father.completedModules.length} / 14 Classes</span>
            </div>
            <div className="h-3 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-right text-sm text-white/80 mt-1">{progressPercent}% Complete</p>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Contact Info */}
          <div>
            <h3 className="font-bold text-slate-800 mb-3">Contact Information</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <Phone className="text-slate-400" size={18} />
                <span className="text-slate-700">{father.phone || 'No phone on file'}</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <Mail className="text-slate-400" size={18} />
                <span className="text-slate-700">{father.email || 'No email on file'}</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <Calendar className="text-slate-400" size={18} />
                <span className="text-slate-700">Joined: {father.joinedDate}</span>
              </div>
            </div>
          </div>

          {/* Completed Modules */}
          <div>
            <h3 className="font-bold text-slate-800 mb-3">Completed Classes</h3>
            <div className="grid grid-cols-2 gap-2">
              {modules.map(module => {
                const isCompleted = father.completedModules.includes(module.id);
                return (
                  <div
                    key={module.id}
                    className={`p-3 rounded-lg flex items-center gap-2 ${
                      isCompleted
                        ? 'bg-emerald-50 border border-emerald-200'
                        : 'bg-slate-50 border border-slate-200'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="text-emerald-500 shrink-0" size={16} />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0" />
                    )}
                    <span className={`text-sm ${isCompleted ? 'text-emerald-700' : 'text-slate-500'}`}>
                      {module.id}. {module.title.length > 20 ? module.title.substring(0, 20) + '...' : module.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Status Messages */}
          {father.status === 'Graduated' && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
              <Award className="text-emerald-500" size={32} />
              <div>
                <p className="font-bold text-emerald-700">Program Graduate!</p>
                <p className="text-sm text-emerald-600">Completed all 14 classes</p>
              </div>
            </div>
          )}

          {father.status === 'Active' && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
              <TrendingUp className="text-blue-500" size={32} />
              <div>
                <p className="font-bold text-blue-700">Active Participant</p>
                <p className="text-sm text-blue-600">Checked in within the last 30 days</p>
              </div>
            </div>
          )}

          {father.status === 'At Risk' && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
              <AlertTriangle className="text-amber-500" size={32} />
              <div>
                <p className="font-bold text-amber-700">At Risk</p>
                <p className="text-sm text-amber-600">No check-in for 31-90 days - needs follow-up</p>
              </div>
            </div>
          )}

          {father.status === 'Inactive' && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center gap-3">
              <UserX className="text-slate-500" size={32} />
              <div>
                <p className="font-bold text-slate-700">Inactive</p>
                <p className="text-sm text-slate-600">No check-in for 90+ days - lost to follow-up</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const Dashboard: React.FC<DashboardProps> = ({ fathers, stats, modules, onRefresh }) => {
  const [hoveredFather, setHoveredFather] = useState<Father | null>(null);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });
  const [selectedFatherForDetail, setSelectedFatherForDetail] = useState<Father | null>(null);

  // Get recent fathers (those with activity)
  const recentActive = fathers
    .filter(f => f.status === 'Active')
    .slice(0, 5);

  const atRiskFathers = fathers
    .filter(f => f.status === 'At Risk')
    .slice(0, 5);

  const inactiveFathers = fathers
    .filter(f => f.status === 'Inactive')
    .slice(0, 5);

  const nearGraduation = fathers
    .filter(f => f.completedModules.length >= 12 && f.completedModules.length < 14)
    .slice(0, 5);

  const handleMouseEnter = (father: Father, e: React.MouseEvent) => {
    setHoveredFather(father);
    setHoverPosition({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (hoveredFather) {
      setHoverPosition({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseLeave = () => {
    setHoveredFather(null);
  };

  const handleFatherClick = (father: Father) => {
    setSelectedFatherForDetail(father);
    setHoveredFather(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-slate-500">Fatherhood Program Overview</p>
        </div>
        <button
          onClick={onRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"
        >
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Enrolled */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="text-blue-600" size={24} />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-800">{stats.totalFathers}</p>
            <p className="text-slate-500 text-sm">Total Enrolled</p>
          </div>

          {/* Active */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="text-emerald-600" size={24} />
              </div>
            </div>
            <p className="text-3xl font-bold text-emerald-600">{stats.active}</p>
            <p className="text-slate-500 text-sm">Active</p>
            <p className="text-xs text-slate-400 mt-1">Checked in within 30 days</p>
          </div>

          {/* At Risk */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="text-amber-600" size={24} />
              </div>
            </div>
            <p className="text-3xl font-bold text-amber-600">{stats.atRisk}</p>
            <p className="text-slate-500 text-sm">At Risk</p>
            <p className="text-xs text-slate-400 mt-1">No check-in 31-90 days</p>
          </div>

          {/* Inactive */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                <UserX className="text-slate-600" size={24} />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-600">{stats.inactive}</p>
            <p className="text-slate-500 text-sm">Inactive</p>
            <p className="text-xs text-slate-400 mt-1">No check-in 90+ days</p>
          </div>
        </div>
      )}

      {/* Graduated Highlight Card */}
      {stats && stats.graduated > 0 && (
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
              <Award size={28} />
            </div>
            <div>
              <p className="text-emerald-100 text-sm">Program Graduates</p>
              <p className="text-3xl font-bold">{stats.graduated} Fathers</p>
              <p className="text-emerald-100 text-sm">Completed all 14 modules</p>
            </div>
          </div>
        </div>
      )}

      {/* Next Class Info */}
      {stats?.nextClass && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                <Calendar size={28} />
              </div>
              <div>
                <p className="text-blue-200 text-sm">Next Class</p>
                <p className="text-xl font-bold">{stats.nextClass.topic}</p>
                <p className="text-blue-200">
                  {new Date(stats.nextClass.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-blue-200">
                <MapPin size={16} />
                <span className="text-sm">FYSC Building</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Father Lists */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Near Graduation */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-emerald-50">
            <h3 className="font-bold text-emerald-800 flex items-center gap-2">
              <Award size={18} />
              Near Graduation ({nearGraduation.length})
            </h3>
            <p className="text-sm text-emerald-600">12-13 classes completed</p>
          </div>
          <div className="divide-y divide-slate-100">
            {nearGraduation.length === 0 ? (
              <p className="p-4 text-slate-500 text-sm text-center">No fathers near graduation</p>
            ) : (
              nearGraduation.map(father => (
                <button
                  key={father.id}
                  className="w-full p-4 hover:bg-slate-50 transition-all text-left cursor-pointer"
                  onMouseEnter={(e) => handleMouseEnter(father, e)}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                  onClick={() => handleFatherClick(father)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold">
                        {father.firstName[0]}{father.lastName?.[0] || ''}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{father.firstName} {father.lastName}</p>
                        <p className="text-sm text-slate-500">{father.completedModules.length}/14 classes</p>
                      </div>
                    </div>
                    <ChevronRight className="text-slate-400" size={18} />
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Active Fathers */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-blue-50">
            <h3 className="font-bold text-blue-800 flex items-center gap-2">
              <TrendingUp size={18} />
              Active Fathers ({recentActive.length})
            </h3>
            <p className="text-sm text-blue-600">Checked in within 30 days</p>
          </div>
          <div className="divide-y divide-slate-100">
            {recentActive.length === 0 ? (
              <p className="p-4 text-slate-500 text-sm text-center">No active fathers</p>
            ) : (
              recentActive.map(father => (
                <button
                  key={father.id}
                  className="w-full p-4 hover:bg-slate-50 transition-all text-left cursor-pointer"
                  onMouseEnter={(e) => handleMouseEnter(father, e)}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                  onClick={() => handleFatherClick(father)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold">
                        {father.firstName[0]}{father.lastName?.[0] || ''}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{father.firstName} {father.lastName}</p>
                        <p className="text-sm text-slate-500">{father.completedModules.length}/14 classes</p>
                      </div>
                    </div>
                    <ChevronRight className="text-slate-400" size={18} />
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* At Risk */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-amber-50">
            <h3 className="font-bold text-amber-800 flex items-center gap-2">
              <AlertTriangle size={18} />
              At Risk ({atRiskFathers.length})
            </h3>
            <p className="text-sm text-amber-600">No check-in 31-90 days</p>
          </div>
          <div className="divide-y divide-slate-100">
            {atRiskFathers.length === 0 ? (
              <p className="p-4 text-slate-500 text-sm text-center">No at-risk fathers</p>
            ) : (
              atRiskFathers.map(father => (
                <button
                  key={father.id}
                  className="w-full p-4 hover:bg-slate-50 transition-all text-left cursor-pointer"
                  onMouseEnter={(e) => handleMouseEnter(father, e)}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                  onClick={() => handleFatherClick(father)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 font-bold">
                        {father.firstName[0]}{father.lastName?.[0] || ''}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{father.firstName} {father.lastName}</p>
                        <p className="text-sm text-slate-500">{father.completedModules.length}/14 classes</p>
                      </div>
                    </div>
                    <ChevronRight className="text-slate-400" size={18} />
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Inactive Fathers Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <UserX size={18} />
            Inactive / Lost to Follow-up ({stats?.inactive || 0})
          </h3>
          <p className="text-sm text-slate-600">No check-in for 90+ days - need outreach</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-5 divide-x divide-slate-100">
          {inactiveFathers.length === 0 ? (
            <p className="p-4 text-slate-500 text-sm text-center col-span-full">No inactive fathers</p>
          ) : (
            inactiveFathers.map(father => (
              <button
                key={father.id}
                className="p-4 hover:bg-slate-50 transition-all text-center cursor-pointer"
                onMouseEnter={(e) => handleMouseEnter(father, e)}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onClick={() => handleFatherClick(father)}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-bold">
                    {father.firstName[0]}{father.lastName?.[0] || ''}
                  </div>
                  <div>
                    <p className="font-medium text-slate-800 text-sm">{father.firstName} {father.lastName?.charAt(0)}.</p>
                    <p className="text-xs text-slate-500">{father.completedModules.length}/14 classes</p>
                  </div>
                </div>
              </button>
            ))
          )}
          {(stats?.inactive || 0) > 5 && (
            <div className="p-4 flex items-center justify-center">
              <p className="text-sm text-slate-500">+{(stats?.inactive || 0) - 5} more</p>
            </div>
          )}
        </div>
      </div>

      {/* Hover Preview Tooltip */}
      {hoveredFather && (
        <FatherPreview
          father={hoveredFather}
          modules={modules}
          position={hoverPosition}
        />
      )}

      {/* Detail Modal */}
      {selectedFatherForDetail && (
        <FatherDetailModal
          father={selectedFatherForDetail}
          modules={modules}
          onClose={() => setSelectedFatherForDetail(null)}
        />
      )}
    </div>
  );
};

export default Dashboard;
