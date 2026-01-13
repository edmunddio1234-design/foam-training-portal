import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Users, CheckCircle2, XCircle, AlertTriangle,
  FileText, Download, RefreshCw, ChevronDown, ChevronUp, Phone, 
  MessageSquare, Calendar, Target, Award, BarChart3, PieChart as PieChartIcon,
  Filter, Search, ArrowLeft, FileSpreadsheet, Printer
} from 'lucide-react';

// API URL
const API_BASE_URL = 'https://foamla-backend-2.onrender.com';

// Module titles for reference
const MODULE_TITLES: { [key: number]: string } = {
  1: "Conflict Resolution/Anger Management",
  2: "Becoming Self-Sufficient",
  3: "Building Your Child's Self-Esteem",
  4: "Co-Parenting/Single Fatherhood",
  5: "Male/Female Relationship",
  6: "Manhood",
  7: "Values",
  8: "Communication/Active Listening",
  9: "Dealing with Stress",
  10: "Coping with Fatherhood Discrimination",
  11: "Fatherhood Today",
  12: "Understanding Children's Needs",
  13: "A Father's Influence on His Child",
  14: "Relationships"
};

// Question labels
const QUESTION_LABELS = {
  q1: "Confidence in applying lesson",
  q2: "Encouraged self-reflection",
  q3: "Believes strategies will help"
};

interface Assessment {
  id: number;
  date: string;
  time: string;
  fatherName: string;
  phone: string;
  moduleId: number;
  moduleTitle: string;
  question1: string;
  question2: string;
  question3: string;
  challenges: string;
}

interface ModuleStats {
  moduleId: number;
  moduleTitle: string;
  totalAssessments: number;
  q1Yes: number;
  q1No: number;
  q2Yes: number;
  q2No: number;
  q3Yes: number;
  q3No: number;
  q1Rate: number;
  q2Rate: number;
  q3Rate: number;
  avgRate: number;
  challengesReported: number;
  challenges: string[];
}

interface Props {
  onBack?: () => void;
}

const AssessmentAnalytics: React.FC<Props> = ({ onBack }) => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedModule, setSelectedModule] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'modules' | 'trends' | 'followup'>('overview');
  const [expandedModule, setExpandedModule] = useState<number | null>(null);
  const [dateFilter, setDateFilter] = useState<'all' | '7days' | '30days' | '90days'>('all');

  // Fetch assessments
  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/fatherhood/assessments`);
      const data = await res.json();
      if (data.success) {
        setAssessments(data.data || []);
      } else {
        setError(data.message || 'Failed to load assessments');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter assessments by date
  const getFilteredAssessments = () => {
    if (dateFilter === 'all') return assessments;
    
    const now = new Date();
    const days = dateFilter === '7days' ? 7 : dateFilter === '30days' ? 30 : 90;
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    
    return assessments.filter(a => {
      const assessmentDate = new Date(a.date);
      return assessmentDate >= cutoff;
    });
  };

  const filteredAssessments = getFilteredAssessments();

  // Calculate module statistics
  const getModuleStats = (): ModuleStats[] => {
    const stats: { [key: number]: ModuleStats } = {};
    
    // Initialize all 14 modules
    for (let i = 1; i <= 14; i++) {
      stats[i] = {
        moduleId: i,
        moduleTitle: MODULE_TITLES[i],
        totalAssessments: 0,
        q1Yes: 0, q1No: 0,
        q2Yes: 0, q2No: 0,
        q3Yes: 0, q3No: 0,
        q1Rate: 0, q2Rate: 0, q3Rate: 0,
        avgRate: 0,
        challengesReported: 0,
        challenges: []
      };
    }

    filteredAssessments.forEach(a => {
      const moduleId = a.moduleId;
      if (!stats[moduleId]) return;
      
      stats[moduleId].totalAssessments++;
      
      if (a.question1 === 'Yes') stats[moduleId].q1Yes++;
      else if (a.question1 === 'No') stats[moduleId].q1No++;
      
      if (a.question2 === 'Yes') stats[moduleId].q2Yes++;
      else if (a.question2 === 'No') stats[moduleId].q2No++;
      
      if (a.question3 === 'Yes') stats[moduleId].q3Yes++;
      else if (a.question3 === 'No') stats[moduleId].q3No++;
      
      if (a.challenges && a.challenges.trim()) {
        stats[moduleId].challengesReported++;
        stats[moduleId].challenges.push(a.challenges);
      }
    });

    // Calculate rates
    Object.values(stats).forEach(s => {
      const total = s.totalAssessments;
      if (total > 0) {
        s.q1Rate = Math.round((s.q1Yes / total) * 100);
        s.q2Rate = Math.round((s.q2Yes / total) * 100);
        s.q3Rate = Math.round((s.q3Yes / total) * 100);
        s.avgRate = Math.round((s.q1Rate + s.q2Rate + s.q3Rate) / 3);
      }
    });

    return Object.values(stats).sort((a, b) => a.moduleId - b.moduleId);
  };

  const moduleStats = getModuleStats();

  // Calculate overall stats
  const totalAssessments = filteredAssessments.length;
  const totalYes = filteredAssessments.reduce((acc, a) => {
    let yes = 0;
    if (a.question1 === 'Yes') yes++;
    if (a.question2 === 'Yes') yes++;
    if (a.question3 === 'Yes') yes++;
    return acc + yes;
  }, 0);
  const totalResponses = totalAssessments * 3;
  const overallYesRate = totalResponses > 0 ? Math.round((totalYes / totalResponses) * 100) : 0;
  
  const fathersWithChallenges = filteredAssessments.filter(a => a.challenges && a.challenges.trim()).length;
  const uniqueFathers = new Set(filteredAssessments.map(a => a.fatherName)).size;

  // Get lowest performing modules
  const lowestModules = [...moduleStats]
    .filter(m => m.totalAssessments > 0)
    .sort((a, b) => a.avgRate - b.avgRate)
    .slice(0, 3);

  // Get trend data (by week)
  const getTrendData = () => {
    const weeks: { [key: string]: { week: string; assessments: number; yesRate: number; total: number; yes: number } } = {};
    
    filteredAssessments.forEach(a => {
      const date = new Date(a.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeks[weekKey]) {
        weeks[weekKey] = { week: weekKey, assessments: 0, yesRate: 0, total: 0, yes: 0 };
      }
      
      weeks[weekKey].assessments++;
      weeks[weekKey].total += 3;
      if (a.question1 === 'Yes') weeks[weekKey].yes++;
      if (a.question2 === 'Yes') weeks[weekKey].yes++;
      if (a.question3 === 'Yes') weeks[weekKey].yes++;
    });

    return Object.values(weeks)
      .map(w => ({
        ...w,
        yesRate: w.total > 0 ? Math.round((w.yes / w.total) * 100) : 0,
        weekLabel: new Date(w.week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      }))
      .sort((a, b) => new Date(a.week).getTime() - new Date(b.week).getTime())
      .slice(-12); // Last 12 weeks
  };

  const trendData = getTrendData();

  // Get fathers needing follow-up
  const getFathersNeedingFollowup = () => {
    return filteredAssessments
      .filter(a => a.challenges && a.challenges.trim())
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const followupList = getFathersNeedingFollowup();

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Date', 'Time', 'Father Name', 'Phone', 'Module ID', 'Module Title', 'Q1', 'Q2', 'Q3', 'Challenges'];
    const rows = filteredAssessments.map(a => [
      a.date, a.time, a.fatherName, a.phone, a.moduleId, a.moduleTitle, 
      a.question1, a.question2, a.question3, `"${(a.challenges || '').replace(/"/g, '""')}"`
    ]);
    
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `FOAM_Assessments_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Export module report
  const exportModuleReport = (moduleId: number) => {
    const module = moduleStats.find(m => m.moduleId === moduleId);
    if (!module) return;

    const moduleAssessments = filteredAssessments.filter(a => a.moduleId === moduleId);
    
    const report = `
FOAM ASSESSMENT REPORT
Module ${moduleId}: ${module.moduleTitle}
Generated: ${new Date().toLocaleString()}
==========================================

SUMMARY
-------
Total Assessments: ${module.totalAssessments}
Overall Confidence Rate: ${module.avgRate}%

QUESTION BREAKDOWN
------------------
Q1 - ${QUESTION_LABELS.q1}
  Yes: ${module.q1Yes} (${module.q1Rate}%)
  No: ${module.q1No} (${100 - module.q1Rate}%)

Q2 - ${QUESTION_LABELS.q2}
  Yes: ${module.q2Yes} (${module.q2Rate}%)
  No: ${module.q2No} (${100 - module.q2Rate}%)

Q3 - ${QUESTION_LABELS.q3}
  Yes: ${module.q3Yes} (${module.q3Rate}%)
  No: ${module.q3No} (${100 - module.q3Rate}%)

CHALLENGES REPORTED (${module.challengesReported})
--------------------------------------------------
${module.challenges.length > 0 ? module.challenges.map((c, i) => `${i + 1}. ${c}`).join('\n') : 'No challenges reported'}

INDIVIDUAL RESPONSES
--------------------
${moduleAssessments.map(a => `${a.date} - ${a.fatherName}: Q1=${a.question1}, Q2=${a.question2}, Q3=${a.question3}`).join('\n')}
    `.trim();

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Module_${moduleId}_Report_${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
  };

  // Colors for charts
  const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899'];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
          <p className="text-slate-600">Loading assessment data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 shadow-lg text-center max-w-md">
          <AlertTriangle className="text-amber-500 mx-auto mb-4" size={48} />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Error Loading Data</h2>
          <p className="text-slate-600 mb-4">{error}</p>
          <button
            onClick={fetchAssessments}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {onBack && (
                <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-lg transition-all">
                  <ArrowLeft size={24} />
                </button>
              )}
              <div>
                <h1 className="text-2xl font-black">Assessment Analytics</h1>
                <p className="text-slate-400 text-sm">Post-class assessment insights & trends</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchAssessments}
                className="p-2 hover:bg-white/10 rounded-lg transition-all"
                title="Refresh data"
              >
                <RefreshCw size={20} />
              </button>
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg font-medium transition-all"
              >
                <Download size={18} />
                Export CSV
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-6 bg-slate-800 rounded-xl p-1 w-fit">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'modules', label: 'By Module', icon: FileText },
              { id: 'trends', label: 'Trends', icon: TrendingUp },
              { id: 'followup', label: 'Follow-up', icon: Phone }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === tab.id 
                    ? 'bg-blue-600 text-white' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Date Filter */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-400" />
            <span className="text-sm text-slate-600">Time Period:</span>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Time</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
            </select>
          </div>
          <p className="text-sm text-slate-500">
            Showing {filteredAssessments.length} assessments
          </p>
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-blue-50 rounded-xl">
                    <FileText className="text-blue-600" size={24} />
                  </div>
                  <span className="text-slate-500 text-sm font-medium">Total Assessments</span>
                </div>
                <p className="text-3xl font-black text-slate-800">{totalAssessments}</p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-emerald-50 rounded-xl">
                    <CheckCircle2 className="text-emerald-600" size={24} />
                  </div>
                  <span className="text-slate-500 text-sm font-medium">Overall Yes Rate</span>
                </div>
                <p className="text-3xl font-black text-emerald-600">{overallYesRate}%</p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-purple-50 rounded-xl">
                    <Users className="text-purple-600" size={24} />
                  </div>
                  <span className="text-slate-500 text-sm font-medium">Unique Fathers</span>
                </div>
                <p className="text-3xl font-black text-slate-800">{uniqueFathers}</p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-amber-50 rounded-xl">
                    <MessageSquare className="text-amber-600" size={24} />
                  </div>
                  <span className="text-slate-500 text-sm font-medium">Need Follow-up</span>
                </div>
                <p className="text-3xl font-black text-amber-600">{fathersWithChallenges}</p>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Module Performance Chart */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Module Performance</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={moduleStats.filter(m => m.totalAssessments > 0)} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={true} vertical={false} />
                      <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} stroke="#94a3b8" fontSize={11} />
                      <YAxis 
                        type="category" 
                        dataKey="moduleId" 
                        width={40} 
                        stroke="#94a3b8" 
                        fontSize={11}
                        tickFormatter={(v) => `M${v}`}
                      />
                      <Tooltip 
                        formatter={(value: number) => [`${value}%`, 'Confidence Rate']}
                        labelFormatter={(label) => `Module ${label}: ${MODULE_TITLES[label as number]}`}
                        contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff' }}
                      />
                      <Bar dataKey="avgRate" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Question Breakdown Pie */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Response Distribution</h3>
                <div className="h-80 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Yes Responses', value: totalYes },
                          { name: 'No Responses', value: totalResponses - totalYes }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        <Cell fill="#10b981" />
                        <Cell fill="#ef4444" />
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <span className="text-sm text-slate-600">Yes ({totalYes})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-sm text-slate-600">No ({totalResponses - totalYes})</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Lowest Performing Modules Alert */}
            {lowestModules.length > 0 && lowestModules[0].avgRate < 70 && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="text-amber-600" size={24} />
                  <h3 className="text-lg font-bold text-amber-800">Modules Needing Attention</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {lowestModules.map(m => (
                    <div key={m.moduleId} className="bg-white rounded-xl p-4 border border-amber-200">
                      <p className="text-sm font-medium text-slate-600">Module {m.moduleId}</p>
                      <p className="font-bold text-slate-800 truncate">{m.moduleTitle}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 bg-slate-100 rounded-full h-2">
                          <div 
                            className="bg-amber-500 rounded-full h-2"
                            style={{ width: `${m.avgRate}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-bold text-amber-600">{m.avgRate}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* MODULES TAB */}
        {activeTab === 'modules' && (
          <div className="space-y-4">
            {moduleStats.map(module => (
              <div key={module.moduleId} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {/* Module Header */}
                <button
                  onClick={() => setExpandedModule(expandedModule === module.moduleId ? null : module.moduleId)}
                  className="w-full p-6 flex items-center justify-between hover:bg-slate-50 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg ${
                      module.avgRate >= 80 ? 'bg-emerald-100 text-emerald-700' :
                      module.avgRate >= 60 ? 'bg-blue-100 text-blue-700' :
                      module.avgRate > 0 ? 'bg-amber-100 text-amber-700' :
                      'bg-slate-100 text-slate-400'
                    }`}>
                      {module.moduleId}
                    </div>
                    <div className="text-left">
                      <h3 className="font-bold text-slate-800">{module.moduleTitle}</h3>
                      <p className="text-sm text-slate-500">{module.totalAssessments} assessments</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-2xl font-black text-slate-800">{module.avgRate}%</p>
                      <p className="text-xs text-slate-500">Avg. Confidence</p>
                    </div>
                    {expandedModule === module.moduleId ? (
                      <ChevronUp className="text-slate-400" size={24} />
                    ) : (
                      <ChevronDown className="text-slate-400" size={24} />
                    )}
                  </div>
                </button>

                {/* Expanded Content */}
                {expandedModule === module.moduleId && (
                  <div className="border-t border-slate-100 p-6 bg-slate-50">
                    {module.totalAssessments === 0 ? (
                      <p className="text-center text-slate-500 py-8">No assessments submitted for this module yet.</p>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Question Breakdown */}
                        <div className="space-y-4">
                          <h4 className="font-bold text-slate-700">Question Breakdown</h4>
                          
                          {/* Q1 */}
                          <div className="bg-white rounded-xl p-4 border border-slate-200">
                            <p className="text-sm text-slate-600 mb-2">Q1: {QUESTION_LABELS.q1}</p>
                            <div className="flex items-center gap-3">
                              <div className="flex-1">
                                <div className="flex h-4 rounded-full overflow-hidden bg-slate-100">
                                  <div className="bg-emerald-500" style={{ width: `${module.q1Rate}%` }}></div>
                                  <div className="bg-red-400" style={{ width: `${100 - module.q1Rate}%` }}></div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-emerald-600 font-bold">{module.q1Yes} Yes</span>
                                <span className="text-slate-300">|</span>
                                <span className="text-red-500 font-bold">{module.q1No} No</span>
                              </div>
                            </div>
                          </div>

                          {/* Q2 */}
                          <div className="bg-white rounded-xl p-4 border border-slate-200">
                            <p className="text-sm text-slate-600 mb-2">Q2: {QUESTION_LABELS.q2}</p>
                            <div className="flex items-center gap-3">
                              <div className="flex-1">
                                <div className="flex h-4 rounded-full overflow-hidden bg-slate-100">
                                  <div className="bg-emerald-500" style={{ width: `${module.q2Rate}%` }}></div>
                                  <div className="bg-red-400" style={{ width: `${100 - module.q2Rate}%` }}></div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-emerald-600 font-bold">{module.q2Yes} Yes</span>
                                <span className="text-slate-300">|</span>
                                <span className="text-red-500 font-bold">{module.q2No} No</span>
                              </div>
                            </div>
                          </div>

                          {/* Q3 */}
                          <div className="bg-white rounded-xl p-4 border border-slate-200">
                            <p className="text-sm text-slate-600 mb-2">Q3: {QUESTION_LABELS.q3}</p>
                            <div className="flex items-center gap-3">
                              <div className="flex-1">
                                <div className="flex h-4 rounded-full overflow-hidden bg-slate-100">
                                  <div className="bg-emerald-500" style={{ width: `${module.q3Rate}%` }}></div>
                                  <div className="bg-red-400" style={{ width: `${100 - module.q3Rate}%` }}></div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-emerald-600 font-bold">{module.q3Yes} Yes</span>
                                <span className="text-slate-300">|</span>
                                <span className="text-red-500 font-bold">{module.q3No} No</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Challenges & Actions */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-slate-700">Challenges Reported ({module.challengesReported})</h4>
                            <button
                              onClick={() => exportModuleReport(module.moduleId)}
                              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                            >
                              <Download size={14} />
                              Export Report
                            </button>
                          </div>
                          
                          {module.challenges.length > 0 ? (
                            <div className="bg-white rounded-xl border border-slate-200 max-h-64 overflow-y-auto">
                              {module.challenges.slice(0, 5).map((challenge, idx) => (
                                <div key={idx} className="p-3 border-b border-slate-100 last:border-0">
                                  <p className="text-sm text-slate-700">"{challenge}"</p>
                                </div>
                              ))}
                              {module.challenges.length > 5 && (
                                <div className="p-3 text-center text-sm text-slate-500">
                                  +{module.challenges.length - 5} more challenges...
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
                              <CheckCircle2 className="text-emerald-500 mx-auto mb-2" size={32} />
                              <p className="text-slate-600">No challenges reported for this module</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* TRENDS TAB */}
        {activeTab === 'trends' && (
          <div className="space-y-6">
            {/* Submission Trend */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Weekly Assessment Submissions</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="weekLabel" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="assessments" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      fill="#3b82f6" 
                      fillOpacity={0.2}
                      name="Assessments"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Confidence Rate Trend */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Weekly Confidence Rate Trend</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="weekLabel" stroke="#94a3b8" fontSize={11} />
                    <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} stroke="#94a3b8" fontSize={11} />
                    <Tooltip 
                      formatter={(value: number) => [`${value}%`, 'Yes Rate']}
                      contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="yesRate" 
                      stroke="#10b981" 
                      strokeWidth={3}
                      dot={{ fill: '#10b981', strokeWidth: 2 }}
                      name="Yes Rate"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Module Comparison */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Question Performance by Module</h3>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={moduleStats.filter(m => m.totalAssessments > 0)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="moduleId" tickFormatter={(v) => `M${v}`} stroke="#94a3b8" fontSize={11} />
                    <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} stroke="#94a3b8" fontSize={11} />
                    <Tooltip 
                      formatter={(value: number) => [`${value}%`]}
                      labelFormatter={(label) => `Module ${label}`}
                      contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff' }}
                    />
                    <Bar dataKey="q1Rate" name="Q1 (Confidence)" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="q2Rate" name="Q2 (Reflection)" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="q3Rate" name="Q3 (Strategies)" fill="#10b981" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-blue-500"></div>
                  <span className="text-sm text-slate-600">Q1: Confidence</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-purple-500"></div>
                  <span className="text-sm text-slate-600">Q2: Reflection</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-emerald-500"></div>
                  <span className="text-sm text-slate-600">Q3: Strategies</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FOLLOW-UP TAB */}
        {activeTab === 'followup' && (
          <div className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <AlertTriangle className="text-amber-600" size={24} />
                <h3 className="text-lg font-bold text-amber-800">
                  {followupList.length} Fathers Reported Challenges
                </h3>
              </div>
              <p className="text-amber-700">
                These fathers shared challenges during their post-class assessment. A case manager should reach out to provide support.
              </p>
            </div>

            {followupList.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-100">
                <CheckCircle2 className="text-emerald-500 mx-auto mb-4" size={48} />
                <h3 className="text-xl font-bold text-slate-800 mb-2">All Caught Up!</h3>
                <p className="text-slate-600">No fathers have reported challenges during this period.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {followupList.map((assessment, idx) => (
                  <div key={idx} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-700 font-bold text-lg">
                            {assessment.fatherName.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800">{assessment.fatherName}</h4>
                            <p className="text-sm text-slate-500">
                              Module {assessment.moduleId}: {assessment.moduleTitle}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-slate-600">{assessment.date}</p>
                          <p className="text-xs text-slate-400">{assessment.time}</p>
                        </div>
                      </div>

                      <div className="bg-slate-50 rounded-xl p-4 mb-4">
                        <p className="text-sm text-slate-500 mb-1">Challenge Reported:</p>
                        <p className="text-slate-800">"{assessment.challenges}"</p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {assessment.phone && (
                            <a 
                              href={`tel:${assessment.phone}`}
                              className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                            >
                              <Phone size={16} />
                              <span className="text-sm font-medium">{assessment.phone}</span>
                            </a>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all">
                            Mark Contacted
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssessmentAnalytics;
