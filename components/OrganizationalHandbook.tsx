import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Search, Book, GraduationCap, FileText, Shield, 
  Scale, UserCog, Palette, ChevronDown, ChevronRight, Phone, 
  Mail, MapPin, Heart, Home, Briefcase, Brain, Target, 
  HeartHandshake, Star, CheckCircle, Clock, Users, Award,
  BookOpen, ArrowUp, Sparkles, TrendingUp, Calendar, Lock,
  FileCheck, Building, DollarSign, Zap, Menu, FolderOpen,
  ClipboardList, BarChart3, Gift, Settings, Eye, QrCode,
  UserX, Upload, Download, Plus, Edit3, RefreshCw, PieChart,
  CreditCard, Globe, History, Lightbulb, AlertTriangle
} from 'lucide-react';

interface OrganizationalHandbookProps {
  onClose: () => void;
}

type Section = 
  | 'overview' | 'programs' | 'curriculum' | 'sops' | 'policies' | 'compliance' | 'roles' | 'style'
  | 'guide-training' | 'guide-fatherhood' | 'guide-grants' | 'guide-documents' 
  | 'guide-casemanager' | 'guide-finance' | 'guide-analytics' | 'guide-donations' | 'guide-admin';

type ProgramTab = 'pfb' | 'rfc' | 'services';

// Animated Counter Component
const AnimatedCounter: React.FC<{ end: number; duration?: number; suffix?: string }> = ({ end, duration = 1500, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const countRef = useRef<HTMLSpanElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (countRef.current) {
      observer.observe(countRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    
    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [isVisible, end, duration]);

  return <span ref={countRef}>{count}{suffix}</span>;
};

// Progress Ring Component
const ProgressRing: React.FC<{ progress: number; size?: number; strokeWidth?: number }> = ({ 
  progress, 
  size = 60, 
  strokeWidth = 6 
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-slate-200"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="text-indigo-500 transition-all duration-1000 ease-out"
      />
    </svg>
  );
};

// Step Component for guides
const Step: React.FC<{ number: number; title: string; children: React.ReactNode }> = ({ number, title, children }) => (
  <div className="flex gap-4">
    <div className="w-8 h-8 rounded-full bg-[#0F2C5C] text-white flex items-center justify-center font-bold text-sm shrink-0">
      {number}
    </div>
    <div className="flex-1">
      <h4 className="font-semibold text-slate-800 mb-1">{title}</h4>
      <div className="text-slate-600 text-sm leading-relaxed">{children}</div>
    </div>
  </div>
);

// Tip Box Component
const TipBox: React.FC<{ children: React.ReactNode; type?: 'tip' | 'warning' | 'info' }> = ({ children, type = 'tip' }) => {
  const styles = {
    tip: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };
  const icons = {
    tip: Lightbulb,
    warning: AlertTriangle,
    info: Zap,
  };
  const Icon = icons[type];

  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border ${styles[type]}`}>
      <Icon size={20} className="shrink-0 mt-0.5" />
      <div className="text-sm">{children}</div>
    </div>
  );
};

const OrganizationalHandbook: React.FC<OrganizationalHandbookProps> = ({ onClose }) => {
  const [activeSection, setActiveSection] = useState<Section>('overview');
  const [activeTab, setActiveTab] = useState<ProgramTab>('pfb');
  const [expandedAccordions, setExpandedAccordions] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [completedModules, setCompletedModules] = useState<number[]>([1, 2, 3, 4, 5]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (contentRef.current) {
        setShowScrollTop(contentRef.current.scrollTop > 300);
      }
    };

    const content = contentRef.current;
    content?.addEventListener('scroll', handleScroll);
    return () => content?.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSectionChange = (section: Section) => {
    if (section === activeSection) return;
    setIsTransitioning(true);
    setIsSidebarOpen(false);
    setTimeout(() => {
      setActiveSection(section);
      setIsTransitioning(false);
      scrollToTop();
    }, 150);
  };

  const toggleAccordion = (id: string) => {
    setExpandedAccordions(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const toggleModuleComplete = (id: number) => {
    setCompletedModules(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  // Navigation structure with groups
  const navGroups = [
    {
      title: 'Organization',
      items: [
        { id: 'overview' as Section, label: 'Overview', icon: Home },
        { id: 'programs' as Section, label: 'Programs', icon: Briefcase },
        { id: 'curriculum' as Section, label: 'Curriculum', icon: GraduationCap },
        { id: 'sops' as Section, label: 'SOPs', icon: FileText },
        { id: 'policies' as Section, label: 'Policies', icon: Shield },
        { id: 'compliance' as Section, label: 'Compliance', icon: Scale },
        { id: 'roles' as Section, label: 'Staff Roles', icon: UserCog },
        { id: 'style' as Section, label: 'Style Guide', icon: Palette },
      ]
    },
    {
      title: 'Portal User Guides',
      items: [
        { id: 'guide-training' as Section, label: 'Training Academy', icon: BookOpen },
        { id: 'guide-fatherhood' as Section, label: 'Fatherhood Tracking', icon: Users },
        { id: 'guide-grants' as Section, label: 'Grant Management', icon: DollarSign },
        { id: 'guide-documents' as Section, label: 'Document Library', icon: FolderOpen },
        { id: 'guide-casemanager' as Section, label: 'Case Manager Portal', icon: ClipboardList },
        { id: 'guide-finance' as Section, label: 'Financial Tools', icon: CreditCard },
        { id: 'guide-analytics' as Section, label: 'Assessment Analytics', icon: BarChart3 },
        { id: 'guide-donations' as Section, label: 'Donation CRM', icon: Gift },
        { id: 'guide-admin' as Section, label: 'Admin Portal', icon: Settings },
      ]
    }
  ];

  // Filter navigation based on search
  const filteredNavGroups = navGroups.map(group => ({
    ...group,
    items: group.items.filter(item => 
      item.label.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(group => group.items.length > 0);

  const coreValues = [
    { text: "Be The Best Version Of You", icon: <Sparkles size={14} /> },
    { text: "Commit To The Process", icon: <Target size={14} /> },
    { text: "Don't Give Up", icon: <TrendingUp size={14} /> },
    { text: "Be A Part Of The Team", icon: <Users size={14} /> },
    { text: "Grow Through Being Uncomfortable", icon: <Zap size={14} /> },
    { text: "The World Is Average, Be Better", icon: <Award size={14} /> },
    { text: "Don't Be Scared To Fall, Be Brave Enough To Get Up", icon: <Heart size={14} /> },
    { text: "Control The Controllables", icon: <Lock size={14} /> }
  ];

  const guidingPrinciples = [
    { icon: <Home size={24} />, title: "Whole-Family Approach", desc: "Supporting fathers is a pathway to supporting entire families, including children, partners, and caregivers.", color: "from-blue-500 to-blue-600" },
    { icon: <Heart size={24} />, title: "Trauma-Informed Care", desc: "We operate with awareness of the challenges fathers may carry and create safe, supportive environments.", color: "from-rose-500 to-rose-600" },
    { icon: <Target size={24} />, title: "Evidence-Based Practice", desc: "We base our programming and curriculum on proven models and measurable outcomes.", color: "from-emerald-500 to-emerald-600" },
    { icon: <HeartHandshake size={24} />, title: "Partnership Over Charity", desc: "We work alongside fathers, not for them, recognizing their strengths and leadership potential.", color: "from-amber-500 to-amber-600" },
    { icon: <Star size={24} />, title: "Consistency Builds Trust", desc: "We deliver programs and services reliably and transparently to establish lasting trust.", color: "from-purple-500 to-purple-600" },
  ];

  const quickStats = [
    { label: "Office Hours", value: "8am-4pm", icon: <Clock size={20} />, color: "bg-blue-500" },
    { label: "Intake Timeline", value: "3 Days", icon: <Calendar size={20} />, color: "bg-emerald-500" },
    { label: "Class Sessions", value: "14", icon: <BookOpen size={20} />, color: "bg-purple-500" },
    { label: "Data Entry", value: "3 Days", icon: <FileCheck size={20} />, color: "bg-amber-500" },
    { label: "Record Retention", value: "7 Years", icon: <Building size={20} />, color: "bg-rose-500" },
    { label: "Password Reset", value: "90 Days", icon: <Lock size={20} />, color: "bg-indigo-500" },
  ];

  const curriculumModules = [
    { id: 1, title: "Introduction to Fatherhood Development", category: "Personal Development", duration: "2 hrs" },
    { id: 2, title: "Manhood", category: "Personal Development", duration: "2 hrs" },
    { id: 3, title: "Values", category: "Personal Development", duration: "2 hrs" },
    { id: 4, title: "Becoming Self-Sufficient", category: "Personal Development", duration: "2 hrs" },
    { id: 5, title: "Communication", category: "Life Skills", duration: "2 hrs" },
    { id: 6, title: "Dealing with Stress", category: "Life Skills", duration: "2 hrs" },
    { id: 7, title: "Coping with Fatherhood Discrimination", category: "Life Skills", duration: "2 hrs" },
    { id: 8, title: "Fatherhood Today", category: "Responsible Fatherhood", duration: "2 hrs" },
    { id: 9, title: "Understanding Children's Needs", category: "Responsible Fatherhood", duration: "2 hrs" },
    { id: 10, title: "A Father's Influence on His Children", category: "Responsible Fatherhood", duration: "2 hrs" },
    { id: 11, title: "Coping as a Single Father / Building Self-Esteem", category: "Responsible Fatherhood", duration: "2 hrs" },
    { id: 12, title: "Relationships", category: "Relationships", duration: "2 hrs" },
    { id: 13, title: "Conflict Resolution / Anger Management", category: "Relationships", duration: "2 hrs" },
    { id: 14, title: "Male/Female Relationships", category: "Relationships", duration: "2 hrs" },
  ];

  const staffRoles = [
    { title: "Executive Director", dept: "Leadership", icon: <Building size={20} />, duties: ["Overall leadership and strategic vision", "Program direction, partnerships, fundraising", "Public representative and primary decision-maker", "Ensures legal and funding compliance"] },
    { title: "Program Manager & Grant Manager", dept: "Operations", icon: <Briefcase size={20} />, duties: ["Day-to-day operations of programs", "Grant applications and funder communication", "Tracks metrics and outcomes", "Coordinates with partners and staff"] },
    { title: "Fatherhood Class Facilitators", dept: "Program Delivery", icon: <Users size={20} />, duties: ["Deliver Responsible Fatherhood curriculum", "Engage participants in discussions and activities", "Track attendance and progress", "Provide referrals as needed"] },
    { title: "Case Managers", dept: "Program Services", icon: <Heart size={20} />, duties: ["One-on-one support for fathers", "Create individualized support plans", "Maintain records and progress updates", "Coordinate referrals with partners"] },
    { title: "Outreach Coordinator", dept: "Community", icon: <MapPin size={20} />, duties: ["Community engagement and recruitment", "Collaborate with community partners", "Distribute materials to schools, churches, etc."] },
    { title: "Bookkeeper", dept: "Finance", icon: <DollarSign size={20} />, duties: ["Daily accounting in QuickBooks Online", "Bank reconciliation", "Financial reporting for grants", "Invoicing and payroll support"] },
  ];

  const categoryColors: Record<string, string> = {
    "Personal Development": "from-blue-500 to-indigo-600",
    "Life Skills": "from-emerald-500 to-teal-600",
    "Responsible Fatherhood": "from-amber-500 to-orange-600",
    "Relationships": "from-rose-500 to-pink-600"
  };

  const completionPercent = Math.round((completedModules.length / 14) * 100);

  // Sidebar Component
  const Sidebar = () => (
    <div className="w-72 bg-white border-r border-slate-200 flex flex-col h-full">
      {/* Search */}
      <div className="p-4 border-b border-slate-200">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text"
            placeholder="Search handbook..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0F2C5C] focus:bg-white transition-all"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Nav Groups */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {filteredNavGroups.map((group, groupIndex) => (
          <div key={groupIndex}>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">
              {group.title}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSectionChange(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive 
                        ? 'bg-[#0F2C5C] text-white shadow-md' 
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                    }`}
                  >
                    <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400'} />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div 
        className="bg-white rounded-3xl shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300"
        style={{ animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0a1f3d] via-[#0F2C5C] to-[#1a4178] text-white p-4 relative overflow-hidden shrink-0">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-60 h-60 bg-indigo-400 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Mobile menu button */}
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <Menu size={24} />
              </button>
              
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                <Book size={24} />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight flex items-center gap-2">
                  F.O.A.M. Organizational Hub
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-xs rounded-full font-bold animate-pulse">LIVE</span>
                </h1>
                <p className="text-indigo-200 text-sm hidden sm:block">Fathers On A Mission • Internal Resource</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-4 text-sm text-indigo-200">
                <div className="flex items-center gap-2">
                  <Phone size={14} />
                  <span>(225) 239-7833</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={14} />
                  <span>admin@foamla.org</span>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-xl transition-all hover:rotate-90 duration-300"
              >
                <X size={24} />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Mobile Sidebar Overlay */}
          {isSidebarOpen && (
            <div 
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}

          {/* Sidebar - Desktop always visible, Mobile as overlay */}
          <div className={`
            fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto
            transform transition-transform duration-300 ease-in-out
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            lg:flex
          `}>
            <Sidebar />
          </div>

          {/* Content */}
          <div 
            ref={contentRef}
            className={`flex-1 overflow-y-auto p-6 bg-gradient-to-b from-slate-50 to-slate-100 transition-opacity duration-150 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}
          >
            <div className="max-w-4xl mx-auto">
              
              {/* OVERVIEW */}
              {activeSection === 'overview' && (
                <div className="space-y-8">
                  {/* Mission Card */}
                  <div className="bg-gradient-to-br from-[#0F2C5C] via-[#1a3d6e] to-[#1a4178] rounded-3xl p-8 text-white text-center relative overflow-hidden group">
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-10 left-10 w-32 h-32 border border-white/20 rounded-full"></div>
                      <div className="absolute bottom-10 right-10 w-48 h-48 border border-white/20 rounded-full"></div>
                    </div>
                    <div className="relative z-10">
                      <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/20 rounded-full mb-4">
                        <Sparkles size={14} className="text-amber-300" />
                        <span className="text-amber-300 font-bold uppercase tracking-widest text-xs">Our Mission</span>
                      </div>
                      <p className="text-2xl md:text-3xl font-light leading-relaxed max-w-3xl mx-auto mb-4">
                        "To enhance Fathers and Father Figures, which will ultimately strengthen families."
                      </p>
                      <p className="text-indigo-200 max-w-2xl mx-auto">
                        <span className="font-semibold text-white">Vision:</span> All Fathers and Father Figures are active, positive role models with their children, families, and in the community.
                      </p>
                      
                      <div className="flex flex-wrap justify-center gap-2 mt-8">
                        {coreValues.map((value, i) => (
                          <span 
                            key={i} 
                            className="group px-3 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium border border-white/20 hover:bg-amber-500 hover:text-[#0F2C5C] hover:border-amber-500 transition-all duration-300 cursor-default flex items-center gap-2 hover:scale-105"
                          >
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity">{value.icon}</span>
                            {value.text}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <Zap size={20} className="text-amber-500" />
                      Quick Reference
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                      {quickStats.map((stat, i) => (
                        <div 
                          key={i} 
                          className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
                        >
                          <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center text-white mb-3 group-hover:scale-110 group-hover:rotate-6 transition-transform`}>
                            {stat.icon}
                          </div>
                          <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">{stat.label}</p>
                          <p className="text-xl font-black text-[#0F2C5C]">{stat.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Guiding Principles */}
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <Star size={20} className="text-amber-500" />
                      Guiding Principles
                    </h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {guidingPrinciples.map((p, i) => (
                        <div 
                          key={i} 
                          className="group bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-xl transition-all duration-500 cursor-pointer overflow-hidden relative"
                        >
                          <div className={`absolute inset-0 bg-gradient-to-br ${p.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                          <div className="relative z-10">
                            <div className={`w-12 h-12 bg-gradient-to-br ${p.color} rounded-2xl flex items-center justify-center text-white mb-4 group-hover:scale-110 group-hover:rotate-6 transition-transform shadow-lg`}>
                              {p.icon}
                            </div>
                            <h4 className="font-bold text-slate-800 mb-2 group-hover:text-white transition-colors">{p.title}</h4>
                            <p className="text-sm text-slate-500 group-hover:text-white/80 transition-colors">{p.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* PROGRAMS */}
              {activeSection === 'programs' && (
                <div className="space-y-6">
                  {/* Tabs */}
                  <div className="flex gap-2 flex-wrap bg-white p-2 rounded-2xl shadow-sm border border-slate-200">
                    {[
                      { id: 'pfb', label: 'Project Family Build', icon: <Home size={16} /> },
                      { id: 'rfc', label: 'Responsible Fatherhood Class', icon: <GraduationCap size={16} /> },
                      { id: 'services', label: 'Support Services', icon: <Heart size={16} /> }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as ProgramTab)}
                        className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                          activeTab === tab.id 
                            ? 'bg-[#0F2C5C] text-white shadow-lg' 
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {tab.icon}
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {activeTab === 'pfb' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 flex items-center gap-4">
                        <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center text-white">
                          <Building size={24} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">Project Family Build</p>
                          <p className="text-sm text-slate-600"><strong>Lead:</strong> Program Manager | <strong>Target:</strong> All fathers | <strong>Type:</strong> Evidence-Based</p>
                        </div>
                      </div>

                      <p className="text-slate-600 text-lg leading-relaxed">
                        FOAM's comprehensive support program designed to equip fathers with the tools, services, and relationships needed to stabilize their lives and support their families.
                      </p>

                      <div className="grid md:grid-cols-2 gap-4">
                        {[
                          { icon: <Briefcase size={24} />, title: "Workforce Development", color: "from-blue-500 to-indigo-600", items: ["Job readiness coaching & resume development", "Interview preparation", "Referrals to certifications (TWIC, OSHA, forklift)", "Job placement through partner employers"] },
                          { icon: <FileText size={24} />, title: "Case Management", color: "from-emerald-500 to-teal-600", items: ["Dedicated case manager assigned", "Personalized Plan of Care", "Data tracking for goals & progress", "Monthly check-ins"] },
                          { icon: <Home size={24} />, title: "Housing Stabilization", color: "from-amber-500 to-orange-600", items: ["Short-term rental support during instability", "Connection to long-term housing services", "Coordination when critical to family stability"] },
                          { icon: <Brain size={24} />, title: "Mental Health & Wellness", color: "from-purple-500 to-pink-600", items: ["Culturally appropriate counseling referrals", "Collaboration with trusted providers", "Trauma-informed approaches throughout"] },
                        ].map((card, i) => (
                          <div 
                            key={i} 
                            className="group bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-xl transition-all duration-300 overflow-hidden relative"
                          >
                            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${card.color}`}></div>
                            <div className="flex items-center gap-3 mb-4">
                              <div className={`w-12 h-12 bg-gradient-to-br ${card.color} rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform`}>
                                {card.icon}
                              </div>
                              <h4 className="font-bold text-slate-800">{card.title}</h4>
                            </div>
                            <ul className="space-y-2">
                              {card.items.map((item, j) => (
                                <li key={j} className="text-sm text-slate-600 flex items-start gap-2">
                                  <ChevronRight size={14} className="text-amber-500 mt-0.5 shrink-0" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>

                      {/* Program Flow */}
                      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                        <h4 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                          <TrendingUp size={20} className="text-emerald-500" />
                          Program Flow
                        </h4>
                        <div className="flex flex-wrap items-center justify-center gap-4">
                          {["Referral", "Intake & Plan", "Service Assignment", "Case Management", "Graduation"].map((step, i) => (
                            <div key={i} className="flex items-center gap-4">
                              <div className="flex flex-col items-center group">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg transition-transform group-hover:scale-110 ${i === 4 ? 'bg-emerald-500' : 'bg-[#0F2C5C]'}`}>
                                  {i + 1}
                                </div>
                                <span className="text-xs font-medium text-slate-600 mt-2 text-center max-w-20">{step}</span>
                              </div>
                              {i < 4 && <ChevronRight size={20} className="text-slate-300 hidden sm:block" />}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'rfc' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-2xl p-5 flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center text-white">
                          <GraduationCap size={24} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">Responsible Fatherhood Class</p>
                          <p className="text-sm text-slate-600"><strong>Lead:</strong> Fatherhood Class Coordinator | <strong>Sessions:</strong> 14 Required</p>
                        </div>
                      </div>

                      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                        <h4 className="font-bold text-slate-800 mb-4">Attendance & Graduation Requirements</h4>
                        <div className="space-y-3">
                          {[
                            "Fathers must attend and be engaged in all 14 sessions to graduate",
                            "Attendance is tracked weekly and logged",
                            "No partial completions or substitutions accepted",
                            "Graduates receive a Certificate of Completion and recognition event invitation"
                          ].map((item, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl group hover:bg-emerald-100 transition-colors">
                              <CheckCircle size={20} className="text-emerald-500 group-hover:scale-110 transition-transform" />
                              <span className="text-sm text-slate-700">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'services' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                        <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                          <Heart size={20} className="text-rose-500" />
                          Daily Needs & Essential Support
                        </h4>
                        <div className="grid md:grid-cols-3 gap-4">
                          {[
                            { icon: <Users size={20} />, text: "School supplies, children's clothing, diapers, household essentials" },
                            { icon: <FileText size={20} />, text: "Document recovery assistance (state IDs, Social Security cards)" },
                            { icon: <Calendar size={20} />, text: "Connection to food drives, seasonal events, and resource distributions" }
                          ].map((item, i) => (
                            <div key={i} className="p-4 bg-slate-50 rounded-xl flex items-start gap-3 hover:bg-slate-100 transition-colors group">
                              <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform">
                                {item.icon}
                              </div>
                              <span className="text-sm text-slate-600">{item.text}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* CURRICULUM */}
              {activeSection === 'curriculum' && (
                <div className="space-y-6">
                  {/* Progress Header */}
                  <div className="bg-gradient-to-r from-[#0F2C5C] to-[#1a4178] rounded-2xl p-6 text-white flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold mb-1">14-Session Curriculum</h3>
                      <p className="text-indigo-200 text-sm">Click modules to track progress (demo)</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-3xl font-black"><AnimatedCounter end={completedModules.length} duration={1000} /></p>
                        <p className="text-indigo-200 text-xs">of 14 Complete</p>
                      </div>
                      <div className="relative">
                        <ProgressRing progress={completionPercent} size={70} strokeWidth={6} />
                        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
                          {completionPercent}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Module Categories */}
                  {['Personal Development', 'Life Skills', 'Responsible Fatherhood', 'Relationships'].map((category, catIndex) => (
                    <div key={category}>
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-2 h-8 rounded-full bg-gradient-to-b ${categoryColors[category]}`}></div>
                        <h3 className="text-lg font-bold text-slate-800">Module {catIndex + 1}: {category}</h3>
                        <span className="px-2 py-0.5 bg-slate-100 rounded-full text-xs font-medium text-slate-500">
                          {curriculumModules.filter(m => m.category === category && completedModules.includes(m.id)).length}/{curriculumModules.filter(m => m.category === category).length}
                        </span>
                      </div>
                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
                        {curriculumModules.filter(m => m.category === category).map(module => {
                          const isCompleted = completedModules.includes(module.id);
                          return (
                            <button
                              key={module.id}
                              onClick={() => toggleModuleComplete(module.id)}
                              className={`relative bg-white rounded-xl p-4 shadow-sm border-l-4 text-left transition-all duration-300 overflow-hidden group ${
                                isCompleted 
                                  ? 'border-emerald-500 bg-emerald-50' 
                                  : 'border-slate-200 hover:border-indigo-500'
                              }`}
                            >
                              <div className={`absolute inset-0 bg-gradient-to-r ${categoryColors[category]} opacity-0 group-hover:opacity-5 transition-opacity`}></div>
                              <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                    isCompleted 
                                      ? 'bg-emerald-500 text-white' 
                                      : 'bg-slate-100 text-slate-600 group-hover:bg-[#0F2C5C] group-hover:text-white'
                                  }`}>
                                    {isCompleted ? <CheckCircle size={16} /> : module.id}
                                  </span>
                                  <span className="text-xs text-slate-400">{module.duration}</span>
                                </div>
                                <p className={`text-sm font-semibold ${isCompleted ? 'text-emerald-700' : 'text-slate-800'}`}>
                                  {module.title}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* SOPs */}
              {activeSection === 'sops' && (
                <div className="space-y-3">
                  <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
                    <FileText size={24} className="text-indigo-500" />
                    <p className="text-sm text-slate-700">Standard Operating Procedures ensure consistent, quality service delivery across all FOAM programs.</p>
                  </div>

                  {[
                    { id: 'intake', title: 'Intake & Case Management', icon: <Users size={20} />, content: 'Fathers may be referred by partners, family, or self-referral. Schedule intake within 3 business days. Complete intake form, obtain consent, conduct needs assessment covering housing, employment, education, legal, mental health, and parenting status.' },
                    { id: 'delivery', title: 'Program Delivery', icon: <GraduationCap size={20} />, content: 'Programs open to all fathers with priority for unemployed, formerly incarcerated, or below ALICE threshold. All participants complete intake assessment. Each father assigned a case manager. Must complete all 14 sessions for certification.' },
                    { id: 'data', title: 'Data Collection & Management', icon: <FileCheck size={20} />, content: 'Use organization-approved case management system. All data confidential with authorized access only. Enter notes within 3 business days. Monthly quality checks for funder reporting.' },
                    { id: 'tech', title: 'Technology & Security', icon: <Lock size={20} />, content: 'Only approved staff get system access. Change passwords every 90 days with 2FA. All public content reviewed by Program Manager/Executive Director before publication.' },
                    { id: 'facility', title: 'Facility Use & Safety', icon: <Building size={20} />, content: 'Office hours 8am-4pm or by appointment. Report safety incidents immediately. Complete event logistics checklist before hosting events.' },
                    { id: 'volunteer', title: 'Volunteer & Partner Management', icon: <HeartHandshake size={20} />, content: 'All volunteers complete orientation and sign confidentiality agreement. Partners require signed MOU. Vendor invoices paid within 15 days.' },
                  ].map((sop) => (
                    <div key={sop.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden group">
                      <button
                        onClick={() => toggleAccordion(sop.id)}
                        className={`w-full flex items-center justify-between p-5 text-left font-bold transition-all duration-300 ${
                          expandedAccordions.includes(sop.id) ? 'bg-[#0F2C5C] text-white' : 'text-slate-800 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                            expandedAccordions.includes(sop.id) ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-[#0F2C5C] group-hover:text-white'
                          }`}>
                            {sop.icon}
                          </div>
                          <span>{sop.title}</span>
                        </div>
                        <ChevronDown size={20} className={`transition-transform duration-300 ${expandedAccordions.includes(sop.id) ? 'rotate-180' : ''}`} />
                      </button>
                      <div className={`overflow-hidden transition-all duration-300 ${expandedAccordions.includes(sop.id) ? 'max-h-96' : 'max-h-0'}`}>
                        <div className="p-5 border-t border-slate-200 text-slate-600 bg-slate-50">
                          {sop.content}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* POLICIES */}
              {activeSection === 'policies' && (
                <div className="space-y-3">
                  <div className="bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
                    <Shield size={24} className="text-rose-500" />
                    <p className="text-sm text-slate-700">Policies ensure FOAM operates with integrity, transparency, and compliance across all activities.</p>
                  </div>

                  {[
                    { id: 'data', title: 'Data Protection & Confidentiality', icon: <Lock size={20} />, content: 'All records stored securely. Only authorized staff access data (reviewed quarterly). Paper records digitized within 5 days. No external sharing without consent. Report breaches immediately.' },
                    { id: 'safety', title: 'Safety & Incident Reporting', icon: <Shield size={20} />, content: 'Safety orientation for all new staff. Review facilities for risks. Report incidents within 24 hours using Incident Report Form. Maintain emergency contacts for all participants.' },
                    { id: 'volunteer', title: 'Volunteer & Intern Engagement', icon: <Users size={20} />, content: 'Orientation required before service. Supervisor assigned for oversight. Sign Confidentiality Agreement and Code of Conduct. Track volunteer hours for in-kind reporting.' },
                    { id: 'financial', title: 'Financial Policies', icon: <DollarSign size={20} />, content: 'Board provides fiscal oversight. Monthly financial reviews. Expense approval: Up to $500 (Program Manager), $500-$2,500 (Executive Director), Over $2,500 (Board). Records retained 7 years. Annual audit if >$750K federal funds.' },
                    { id: 'conflict', title: 'Conflict of Interest', icon: <Scale size={20} />, content: 'Annual disclosure forms for board and senior staff. No self-dealing or nepotism. Document recusals. Periodic review by Governance Committee.' },
                  ].map((policy) => (
                    <div key={policy.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden group">
                      <button
                        onClick={() => toggleAccordion(`pol-${policy.id}`)}
                        className={`w-full flex items-center justify-between p-5 text-left font-bold transition-all duration-300 ${
                          expandedAccordions.includes(`pol-${policy.id}`) ? 'bg-[#0F2C5C] text-white' : 'text-slate-800 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                            expandedAccordions.includes(`pol-${policy.id}`) ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-[#0F2C5C] group-hover:text-white'
                          }`}>
                            {policy.icon}
                          </div>
                          <span>{policy.title}</span>
                        </div>
                        <ChevronDown size={20} className={`transition-transform duration-300 ${expandedAccordions.includes(`pol-${policy.id}`) ? 'rotate-180' : ''}`} />
                      </button>
                      <div className={`overflow-hidden transition-all duration-300 ${expandedAccordions.includes(`pol-${policy.id}`) ? 'max-h-96' : 'max-h-0'}`}>
                        <div className="p-5 border-t border-slate-200 text-slate-600 bg-slate-50">
                          {policy.content}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* COMPLIANCE */}
              {activeSection === 'compliance' && (
                <div className="space-y-6">
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: '501(c)(3) Status', color: 'bg-emerald-500' },
                      { label: 'GAAP Compliant', color: 'bg-blue-500' },
                      { label: '2 CFR Part 200', color: 'bg-purple-500' },
                      { label: 'ADA Compliant', color: 'bg-amber-500' },
                      { label: 'Title VI', color: 'bg-rose-500' },
                      { label: 'HIPAA Safeguards', color: 'bg-indigo-500' }
                    ].map((badge, i) => (
                      <span 
                        key={badge.label} 
                        className={`${badge.color} px-4 py-2 text-white rounded-full text-sm font-bold flex items-center gap-2 hover:scale-105 transition-transform cursor-default`}
                      >
                        <CheckCircle size={14} /> {badge.label}
                      </span>
                    ))}
                  </div>

                  <div className="space-y-3">
                    {[
                      { id: 'governance', title: 'Corporate Governance', icon: <Building size={20} />, content: 'Articles of Incorporation and Bylaws on file with Louisiana Secretary of State. Regular board meetings with quorum compliance. Conflict of Interest and Whistleblower policies reviewed annually.' },
                      { id: 'irs', title: 'IRS & Federal Tax', icon: <FileText size={20} />, content: '501(c)(3) status in good standing. Annual Form 990 filings. Monitor unrelated business income and lobbying restrictions.' },
                      { id: 'state', title: 'State & Local (Louisiana)', icon: <MapPin size={20} />, content: 'Annual nonprofit registration renewals. Payroll compliance with Louisiana Workforce Commission.' },
                      { id: 'gaap', title: 'Financial Oversight & GAAP', icon: <DollarSign size={20} />, content: 'GAAP-compliant accounting. QuickBooks Online for audit-ready financials. Monthly budget-to-actual comparisons. Alignment with 2 CFR Part 200.' },
                      { id: 'civil', title: 'Non-Discrimination & Civil Rights', icon: <Heart size={20} />, content: 'Full compliance with federal civil rights laws. No discrimination based on race, color, national origin, disability, sex, age, religion, or limited English proficiency. Civil Rights Coordinator: admin@foamla.org' },
                      { id: 'cyber', title: 'Technology & Cybersecurity', icon: <Lock size={20} />, content: 'Data Security Plan in place. MFA enabled across systems. ADA-compliant digital content. Staff cybersecurity training. Annual protocol review.' },
                    ].map(item => (
                      <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden group">
                        <button
                          onClick={() => toggleAccordion(`comp-${item.id}`)}
                          className={`w-full flex items-center justify-between p-5 text-left font-bold transition-all duration-300 ${
                            expandedAccordions.includes(`comp-${item.id}`) ? 'bg-[#0F2C5C] text-white' : 'text-slate-800 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                              expandedAccordions.includes(`comp-${item.id}`) ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-[#0F2C5C] group-hover:text-white'
                            }`}>
                              {item.icon}
                            </div>
                            <span>{item.title}</span>
                          </div>
                          <ChevronDown size={20} className={`transition-transform duration-300 ${expandedAccordions.includes(`comp-${item.id}`) ? 'rotate-180' : ''}`} />
                        </button>
                        <div className={`overflow-hidden transition-all duration-300 ${expandedAccordions.includes(`comp-${item.id}`) ? 'max-h-96' : 'max-h-0'}`}>
                          <div className="p-5 border-t border-slate-200 text-slate-600 bg-slate-50">
                            {item.content}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ROLES */}
              {activeSection === 'roles' && (
                <div className="grid md:grid-cols-2 gap-4">
                  {staffRoles.map((role, i) => (
                    <div 
                      key={i} 
                      className="group bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300"
                    >
                      <div className="bg-gradient-to-r from-[#0F2C5C] to-[#1a4178] text-white p-5 flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-transform">
                          {role.icon}
                        </div>
                        <div>
                          <h4 className="font-bold text-lg">{role.title}</h4>
                          <p className="text-xs text-indigo-200">{role.dept}</p>
                        </div>
                      </div>
                      <div className="p-5">
                        <ul className="space-y-3">
                          {role.duties.map((duty, j) => (
                            <li key={j} className="flex items-start gap-3 text-sm text-slate-600 group/item">
                              <span className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 shrink-0 group-hover/item:bg-amber-500 group-hover/item:text-white transition-colors">
                                <ChevronRight size={12} />
                              </span>
                              {duty}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* STYLE GUIDE */}
              {activeSection === 'style' && (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      { title: "Voice & Tone", icon: <BookOpen size={20} />, color: "from-blue-500 to-indigo-600", items: ["Tone: Professional, supportive, empowering", "Voice: Father-centered, strengths-based, action-oriented", "Perspective: Use 'we' for FOAM's role", "Avoid: Bureaucratic language, judgmental phrasing"] },
                      { title: "Core Language", icon: <FileText size={20} />, color: "from-emerald-500 to-teal-600", items: ["Use 'fathers' or 'father figures' — not 'clients'", "Emphasize engagement, empowerment, support", "Highlight outcomes, impact, partnership", "Use person-first language"] },
                      { title: "Formatting", icon: <Palette size={20} />, color: "from-amber-500 to-orange-600", items: ["Plain, direct headers", "Short paragraphs or bullet points", "Bold for emphasis, not ALL CAPS", "Include Program Name, Date, Version"] },
                      { title: "Inclusive Language", icon: <Heart size={20} />, color: "from-rose-500 to-pink-600", items: ["Use 'all fathers,' 'father-centered,' 'family leadership'", "Reflect diverse backgrounds in storytelling", "Frame participants as capable of growth"] },
                    ].map((card, i) => (
                      <div key={i} className="group bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-xl transition-all duration-300 overflow-hidden relative">
                        <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${card.color}`}></div>
                        <div className="flex items-center gap-3 mb-4">
                          <div className={`w-10 h-10 bg-gradient-to-br ${card.color} rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform`}>
                            {card.icon}
                          </div>
                          <h4 className="font-bold text-slate-800">{card.title}</h4>
                        </div>
                        <ul className="space-y-2">
                          {card.items.map((item, j) => (
                            <li key={j} className="flex items-start gap-2 text-sm text-slate-600">
                              <ChevronRight size={14} className="text-amber-500 mt-0.5 shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6">
                    <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <Award size={20} className="text-amber-500" />
                      Official Program Names
                    </h4>
                    <div className="flex flex-wrap gap-3">
                      {['Project Family Build', 'Responsible Fatherhood Class', 'Father and Child Bonding Activities', 'Enhancement Workshops'].map((name) => (
                        <span 
                          key={name} 
                          className="px-4 py-2 bg-white rounded-xl text-sm font-bold text-[#0F2C5C] border-2 border-amber-300 hover:bg-[#0F2C5C] hover:text-white hover:border-[#0F2C5C] transition-all duration-300 cursor-default"
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ======================= */}
              {/* PORTAL USER GUIDES      */}
              {/* ======================= */}

              {/* TRAINING ACADEMY GUIDE */}
              {activeSection === 'guide-training' && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-[#0F2C5C] to-[#1a4178] rounded-2xl p-6 text-white">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                        <BookOpen size={28} />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">Training Academy</h2>
                        <p className="text-indigo-200">Staff Training & Certification Portal</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                    <h3 className="font-bold text-slate-800 mb-4">Key Features</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {[
                        { icon: GraduationCap, title: 'Training Modules', desc: 'Complete required training courses with progress tracking' },
                        { icon: FileText, title: 'Assessments', desc: 'Take quizzes and tests to demonstrate competency' },
                        { icon: Award, title: 'Certifications', desc: 'Earn certificates upon completing training tracks' },
                        { icon: TrendingUp, title: 'Progress Tracking', desc: 'Monitor your learning progress and completion status' },
                      ].map((feature, i) => {
                        const Icon = feature.icon;
                        return (
                          <div key={i} className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                              <Icon size={20} className="text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-slate-800">{feature.title}</h4>
                              <p className="text-sm text-slate-600">{feature.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                    <h3 className="font-bold text-slate-800 mb-4">How to Complete Training</h3>
                    <div className="space-y-6">
                      <Step number={1} title="Access Your Dashboard">
                        Log in and navigate to Training Academy from the Command Center. Your assigned courses appear on the dashboard.
                      </Step>
                      <Step number={2} title="Start a Module">
                        Click on any module to begin. Watch videos, read materials, and complete interactive exercises.
                      </Step>
                      <Step number={3} title="Take Assessments">
                        After completing module content, take the assessment. You need 80% or higher to pass.
                      </Step>
                      <Step number={4} title="Earn Certification">
                        Complete all modules in a track to earn your certification. Download certificates from your profile.
                      </Step>
                    </div>
                  </div>

                  <TipBox type="tip">
                    <strong>Pro Tip:</strong> Training progress saves automatically. You can leave and return to pick up where you left off.
                  </TipBox>
                </div>
              )}

              {/* FATHERHOOD TRACKING GUIDE */}
              {activeSection === 'guide-fatherhood' && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 text-white">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                        <Users size={28} />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">Fatherhood Tracking</h2>
                        <p className="text-emerald-100">Father Enrollment & Progress Management</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                    <h3 className="font-bold text-slate-800 mb-4">Navigation Tabs</h3>
                    <div className="grid md:grid-cols-3 gap-3">
                      {[
                        { tab: 'Dashboard', desc: 'Overview stats: Total Fathers, Graduated, Active, At Risk' },
                        { tab: 'Father Roster', desc: 'Complete list of enrolled fathers with search/filter' },
                        { tab: 'Class Check-In', desc: 'Mark attendance for current class session' },
                        { tab: 'QR Check-In', desc: 'Generate QR codes for self-service check-in' },
                        { tab: 'Father Portal', desc: 'Individual father profiles and progress' },
                        { tab: 'Import Data', desc: 'Bulk import from Excel or CSV' },
                        { tab: 'Lost to Follow-up', desc: 'Fathers needing outreach (inactive/at risk)' },
                        { tab: 'Export Data', desc: 'Download reports for funders' },
                        { tab: 'Resources', desc: 'Financial tracking and class materials' },
                      ].map((item, i) => (
                        <div key={i} className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                          <p className="font-semibold text-slate-800">{item.tab}</p>
                          <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                    <h3 className="font-bold text-slate-800 mb-4">Common Tasks</h3>
                    <div className="space-y-6">
                      <Step number={1} title="Enroll a New Father">
                        Go to "Father Roster" → Click "Add Father" → Fill in demographics, contact info, and enrollment date → Save.
                      </Step>
                      <Step number={2} title="Check In for Class">
                        Navigate to "Class Check-In" → Select the class date → Check the box next to each father present → Click "Save Attendance".
                      </Step>
                      <Step number={3} title="View Individual Progress">
                        Click on a father's name in the roster → See modules completed, attendance history, and notes.
                      </Step>
                      <Step number={4} title="Handle Lost to Follow-up">
                        Go to "Lost to Follow-up" → Review fathers with less than 2 modules or "At Risk" status → Use contact buttons to reach out → Update status after contact.
                      </Step>
                    </div>
                  </div>

                  <TipBox type="warning">
                    <strong>Important:</strong> Always check in fathers during or immediately after class. Late entries affect reporting accuracy and may impact grant compliance.
                  </TipBox>

                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                    <h3 className="font-bold text-slate-800 mb-4">Status Definitions</h3>
                    <div className="space-y-2">
                      {[
                        { status: 'Active', color: 'bg-blue-100 text-blue-700', desc: 'Currently enrolled and attending' },
                        { status: 'Graduated', color: 'bg-emerald-100 text-emerald-700', desc: 'Completed all 14 modules' },
                        { status: 'At Risk', color: 'bg-amber-100 text-amber-700', desc: 'Missed 2+ consecutive sessions' },
                        { status: 'Inactive', color: 'bg-slate-100 text-slate-700', desc: 'No activity for 30+ days' },
                        { status: 'Lost', color: 'bg-red-100 text-red-700', desc: 'Unable to contact, dropped out' },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${item.color}`}>
                            {item.status}
                          </span>
                          <span className="text-slate-600 text-sm">{item.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* GRANT MANAGEMENT GUIDE */}
              {activeSection === 'guide-grants' && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 text-white">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                        <DollarSign size={28} />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">Grant Management</h2>
                        <p className="text-amber-100">Track Grants & Funding Opportunities</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                    <h3 className="font-bold text-slate-800 mb-4">Dashboard Stats</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { label: 'Total Grants', icon: FileText, color: 'bg-blue-100 text-blue-600' },
                        { label: 'Total Requested', icon: DollarSign, color: 'bg-amber-100 text-amber-600' },
                        { label: 'Total Approved', icon: CheckCircle, color: 'bg-emerald-100 text-emerald-600' },
                        { label: 'Success Rate', icon: TrendingUp, color: 'bg-purple-100 text-purple-600' },
                      ].map((stat, i) => {
                        const Icon = stat.icon;
                        return (
                          <div key={i} className="text-center p-4 bg-slate-50 rounded-xl">
                            <div className={`w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center ${stat.color}`}>
                              <Icon size={20} />
                            </div>
                            <p className="text-sm text-slate-600">{stat.label}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                    <h3 className="font-bold text-slate-800 mb-4">Tabs</h3>
                    <div className="space-y-3">
                      {[
                        { tab: 'Dashboard', desc: 'Stats cards, status breakdown, action items, funder types' },
                        { tab: 'All Grants', desc: 'Complete list of all grants with search functionality' },
                        { tab: 'Approved', desc: 'Filtered view of approved/awarded grants' },
                        { tab: 'Pending', desc: 'Grants awaiting decision (Submitted, Pending, To Submit)' },
                        { tab: 'Denied', desc: 'Rejected applications for review and resubmission planning' },
                      ].map((item, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl">
                          <span className="w-6 h-6 rounded-full bg-amber-200 text-amber-700 flex items-center justify-center text-xs font-bold shrink-0">
                            {i + 1}
                          </span>
                          <div>
                            <p className="font-medium text-slate-800">{item.tab}</p>
                            <p className="text-xs text-slate-500">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                    <h3 className="font-bold text-slate-800 mb-4">Adding a New Grant</h3>
                    <div className="space-y-6">
                      <Step number={1} title="Click 'Add Grant' Button">
                        Located in the header next to Refresh. Opens the grant entry modal.
                      </Step>
                      <Step number={2} title="Fill Required Fields">
                        Grant Name and Grant Source are required. Add purpose, contact info, amounts as available.
                      </Step>
                      <Step number={3} title="Set Dates & Status">
                        Enter application deadline, submission date. Select current status (To Submit, Pending, etc.).
                      </Step>
                      <Step number={4} title="Save to Google Sheets">
                        Click "Add Grant". Data syncs immediately to the FOAM_Grants Google Sheet.
                      </Step>
                    </div>
                  </div>

                  <TipBox type="info">
                    <strong>Data Sync:</strong> All changes sync to Google Sheets in real-time. Click "Refresh" to pull the latest data if working with multiple users.
                  </TipBox>
                </div>
              )}

              {/* DOCUMENT LIBRARY GUIDE */}
              {activeSection === 'guide-documents' && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-purple-600 to-violet-600 rounded-2xl p-6 text-white">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                        <FolderOpen size={28} />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">Document Library</h2>
                        <p className="text-purple-200">Centralized File Repository</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                    <h3 className="font-bold text-slate-800 mb-4">Document Categories</h3>
                    <div className="grid md:grid-cols-2 gap-3">
                      {[
                        { icon: FileText, label: 'Policies & Procedures', desc: 'HR policies, program guidelines' },
                        { icon: ClipboardList, label: 'Forms & Templates', desc: 'Intake forms, consent forms, evaluations' },
                        { icon: BookOpen, label: 'Program Materials', desc: 'Curriculum, handouts, worksheets' },
                        { icon: Award, label: 'Marketing & Branding', desc: 'Logos, flyers, social media assets' },
                        { icon: Briefcase, label: 'Grant Documents', desc: 'Proposals, reports, budgets' },
                        { icon: Shield, label: 'Compliance', desc: 'Audits, certifications, legal docs' },
                      ].map((cat, i) => {
                        const Icon = cat.icon;
                        return (
                          <div key={i} className="flex items-start gap-3 p-4 bg-purple-50 rounded-xl">
                            <Icon size={20} className="text-purple-600 mt-0.5 shrink-0" />
                            <div>
                              <p className="font-medium text-slate-800">{cat.label}</p>
                              <p className="text-xs text-slate-500">{cat.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                    <h3 className="font-bold text-slate-800 mb-4">How to Use</h3>
                    <div className="space-y-6">
                      <Step number={1} title="Navigate to Category">
                        Click on a category card or use the sidebar to browse document types.
                      </Step>
                      <Step number={2} title="Search for Documents">
                        Use the search bar to find specific files by name or keyword.
                      </Step>
                      <Step number={3} title="Preview or Download">
                        Click a document to preview. Use the download button to save locally.
                      </Step>
                      <Step number={4} title="Request New Documents">
                        Can't find what you need? Contact administration to request additions.
                      </Step>
                    </div>
                  </div>

                  <TipBox type="tip">
                    <strong>Version Control:</strong> Always download the latest version of forms before printing. Check the "Last Updated" date to ensure you have current materials.
                  </TipBox>
                </div>
              )}

              {/* CASE MANAGER PORTAL GUIDE */}
              {activeSection === 'guide-casemanager' && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                        <ClipboardList size={28} />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">Case Manager Portal</h2>
                        <p className="text-blue-200">Data Entry & Reporting System</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                    <h3 className="font-bold text-slate-800 mb-4">Portal Tabs</h3>
                    <div className="space-y-3">
                      {[
                        { tab: '2026 Data Entry', desc: 'Editable spreadsheet for current year metrics (monthly data input)', icon: Edit3 },
                        { tab: '2024-2025 Historical', desc: 'Read-only view of past data for reference', icon: History },
                        { tab: 'Year Comparison', desc: 'Side-by-side comparison of metrics across years', icon: BarChart3 },
                        { tab: 'Change Log', desc: 'Track who made changes and when (audit trail)', icon: FileCheck },
                        { tab: 'Generate Reports', desc: 'Create Monthly, Quarterly, or Annual reports with AI insights', icon: FileText },
                      ].map((item, i) => {
                        const Icon = item.icon;
                        return (
                          <div key={i} className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl">
                            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                              <Icon size={20} className="text-blue-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800">{item.tab}</p>
                              <p className="text-sm text-slate-500">{item.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                    <h3 className="font-bold text-slate-800 mb-4">Generating Reports</h3>
                    <div className="space-y-6">
                      <Step number={1} title="Select Report Type">
                        Go to "Generate Reports" tab → Choose Monthly, Quarterly, or Annual.
                      </Step>
                      <Step number={2} title="Select Time Period">
                        Pick the month, quarter, or year. Choose whether to use 2024-2025 or 2026 data.
                      </Step>
                      <Step number={3} title="Generate & Preview">
                        Click "Generate Report". Preview shows Executive Summary, Charts, Outcome Metrics, and AI Insights.
                      </Step>
                      <Step number={4} title="Export Document">
                        Click "Download Word Doc" or "Download PDF" to save the formatted report.
                      </Step>
                    </div>
                  </div>

                  <TipBox type="info">
                    <strong>Report Contents:</strong> Reports include Executive Summary, Visual Charts, Outcome Metrics, Program Breakdown, Workforce Analysis, and AI-Generated Insights.
                  </TipBox>
                </div>
              )}

              {/* FINANCIAL TOOLS GUIDE */}
              {activeSection === 'guide-finance' && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 text-white">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                        <CreditCard size={28} />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">Financial Tools</h2>
                        <p className="text-emerald-100">Budget & Transaction Management</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                    <h3 className="font-bold text-slate-800 mb-4">Key Features</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {[
                        { icon: Plus, title: 'Transaction Entry', desc: 'Log income and expenses with categories' },
                        { icon: PieChart, title: 'Budget Overview', desc: 'Track spending against budget allocations' },
                        { icon: FileText, title: 'Financial Reports', desc: 'Generate reports for board and funders' },
                        { icon: DollarSign, title: 'Grant Allocation', desc: 'Track spending by funding source' },
                      ].map((feature, i) => {
                        const Icon = feature.icon;
                        return (
                          <div key={i} className="flex items-start gap-3 p-4 bg-emerald-50 rounded-xl">
                            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                              <Icon size={20} className="text-emerald-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-slate-800">{feature.title}</h4>
                              <p className="text-sm text-slate-600">{feature.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                    <h3 className="font-bold text-slate-800 mb-4">Adding Transactions</h3>
                    <div className="space-y-6">
                      <Step number={1} title="Click 'Add Transaction'">
                        Opens the entry form for new income or expense.
                      </Step>
                      <Step number={2} title="Select Type & Category">
                        Choose Income or Expense. Select the appropriate category (Personnel, Supplies, etc.).
                      </Step>
                      <Step number={3} title="Enter Details">
                        Add date, amount, vendor/source, description, and funding source if applicable.
                      </Step>
                      <Step number={4} title="Save & Sync">
                        Click Save. Data syncs to the 16-column Google Sheet format automatically.
                      </Step>
                    </div>
                  </div>

                  <TipBox type="warning">
                    <strong>Reconciliation:</strong> All transactions should match QuickBooks entries. Run monthly reconciliation reports.
                  </TipBox>
                </div>
              )}

              {/* ASSESSMENT ANALYTICS GUIDE */}
              {activeSection === 'guide-analytics' && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl p-6 text-white">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                        <BarChart3 size={28} />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">Assessment Analytics</h2>
                        <p className="text-violet-200">Program Outcomes & Data Analysis</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                    <h3 className="font-bold text-slate-800 mb-4">Dashboard Features</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {[
                        { icon: Users, title: 'Demographics', desc: 'Age, race, education, employment status breakdowns' },
                        { icon: TrendingUp, title: 'Outcomes', desc: 'Employment gains, certifications earned, graduation rates' },
                        { icon: Calendar, title: 'Time-Based Analysis', desc: 'Monthly, quarterly, and annual trend charts' },
                        { icon: Target, title: 'Goal Progress', desc: 'Track progress toward funder targets' },
                      ].map((feature, i) => {
                        const Icon = feature.icon;
                        return (
                          <div key={i} className="flex items-start gap-3 p-4 bg-violet-50 rounded-xl">
                            <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
                              <Icon size={20} className="text-violet-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-slate-800">{feature.title}</h4>
                              <p className="text-sm text-slate-600">{feature.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                    <h3 className="font-bold text-slate-800 mb-4">Generating Funder Reports</h3>
                    <div className="space-y-6">
                      <Step number={1} title="Select Funder Template">
                        Choose from pre-built templates (LCTF, OJJ, TANF, etc.) or create custom.
                      </Step>
                      <Step number={2} title="Set Date Range">
                        Select the reporting period that matches funder requirements.
                      </Step>
                      <Step number={3} title="Review Metrics">
                        Preview all metrics, charts, and narratives before export.
                      </Step>
                      <Step number={4} title="Export Report">
                        Download as PDF or Excel format based on funder preference.
                      </Step>
                    </div>
                  </div>

                  <TipBox type="tip">
                    <strong>Data Quality:</strong> Analytics are only as good as the source data. Ensure Fatherhood Tracking and Case Manager entries are up to date.
                  </TipBox>
                </div>
              )}

              {/* DONATION CRM GUIDE */}
              {activeSection === 'guide-donations' && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-rose-500 to-pink-500 rounded-2xl p-6 text-white">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                        <Gift size={28} />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">Donation CRM</h2>
                        <p className="text-rose-100">Donor & Contribution Management</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                    <h3 className="font-bold text-slate-800 mb-4">Portal Views</h3>
                    <div className="space-y-3">
                      {[
                        { tab: 'Dashboard', desc: 'Total raised, donor count, monthly trends, top donors, recent donations' },
                        { tab: 'Donors', desc: 'Complete donor list with contact info, giving history, and notes' },
                        { tab: 'Donations', desc: 'All contributions with payment method, date, and purpose' },
                        { tab: 'Campaigns', desc: 'Track fundraising campaigns with goals and progress' },
                        { tab: 'Reports', desc: 'Generate donation reports and thank you letter logs' },
                      ].map((item, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-rose-50 rounded-xl">
                          <span className="w-6 h-6 rounded-full bg-rose-200 text-rose-700 flex items-center justify-center text-xs font-bold shrink-0">
                            {i + 1}
                          </span>
                          <div>
                            <p className="font-medium text-slate-800">{item.tab}</p>
                            <p className="text-xs text-slate-500">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                    <h3 className="font-bold text-slate-800 mb-4">Donor Types</h3>
                    <div className="flex flex-wrap gap-2">
                      {['Individual', 'Organization', 'Foundation', 'Corporate', 'Government'].map((type, i) => (
                        <span key={i} className="px-4 py-2 bg-rose-100 text-rose-700 rounded-full text-sm font-medium">
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                    <h3 className="font-bold text-slate-800 mb-4">Recording a Donation</h3>
                    <div className="space-y-6">
                      <Step number={1} title="Click 'Add Donation'">
                        From Dashboard or Donations tab, click the add button.
                      </Step>
                      <Step number={2} title="Select or Create Donor">
                        Search existing donors or create a new donor profile.
                      </Step>
                      <Step number={3} title="Enter Donation Details">
                        Amount, date, payment method (Check, Cash, Credit Card, Bank Transfer, PayPal, Zelle), purpose.
                      </Step>
                      <Step number={4} title="Track Acknowledgment">
                        Mark receipt sent and thank you letter mailed/emailed.
                      </Step>
                    </div>
                  </div>

                  <TipBox type="info">
                    <strong>Tax Receipts:</strong> Generate year-end giving statements from the Reports tab for donors needing tax documentation.
                  </TipBox>
                </div>
              )}

              {/* ADMIN PORTAL GUIDE */}
              {activeSection === 'guide-admin' && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-slate-700 to-slate-800 rounded-2xl p-6 text-white">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                        <Settings size={28} />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">Admin Portal</h2>
                        <p className="text-slate-300">System Settings & User Management</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                    <h3 className="font-bold text-slate-800 mb-4">Admin Functions</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {[
                        { icon: Users, title: 'User Management', desc: 'Add, edit, deactivate user accounts and assign roles' },
                        { icon: Shield, title: 'Role Permissions', desc: 'Configure access levels for each portal and feature' },
                        { icon: Settings, title: 'System Settings', desc: 'Organization info, branding, email templates' },
                        { icon: History, title: 'Audit Logs', desc: 'Track all user actions across the system' },
                        { icon: RefreshCw, title: 'Data Sync', desc: 'Manual sync triggers and connection status' },
                        { icon: Lock, title: 'Security', desc: 'Password policies, 2FA settings, session management' },
                      ].map((feature, i) => {
                        const Icon = feature.icon;
                        return (
                          <div key={i} className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                            <div className="w-10 h-10 bg-slate-200 rounded-xl flex items-center justify-center">
                              <Icon size={20} className="text-slate-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-slate-800">{feature.title}</h4>
                              <p className="text-sm text-slate-600">{feature.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                    <h3 className="font-bold text-slate-800 mb-4">User Roles</h3>
                    <div className="space-y-2">
                      {[
                        { role: 'Super Admin', desc: 'Full access to all features and settings', color: 'bg-red-100 text-red-700' },
                        { role: 'Admin', desc: 'User management and most settings', color: 'bg-orange-100 text-orange-700' },
                        { role: 'Program Manager', desc: 'Full program access, limited admin', color: 'bg-blue-100 text-blue-700' },
                        { role: 'Case Manager', desc: 'Father tracking and case management', color: 'bg-emerald-100 text-emerald-700' },
                        { role: 'Staff', desc: 'Basic access to assigned areas only', color: 'bg-slate-100 text-slate-700' },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${item.color}`}>
                            {item.role}
                          </span>
                          <span className="text-slate-600 text-sm">{item.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <TipBox type="warning">
                    <strong>Access Control:</strong> Only Super Admins can modify role permissions. Changes are logged in the audit trail.
                  </TipBox>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#0F2C5C] text-white p-4 flex flex-wrap items-center justify-between gap-4 text-sm shrink-0">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 hover:text-amber-300 transition-colors cursor-pointer">
              <MapPin size={14} className="text-indigo-300" />
              <span className="hidden sm:inline">1120 Government St, Baton Rouge, LA 70802</span>
            </div>
            <div className="flex items-center gap-2 hover:text-amber-300 transition-colors cursor-pointer">
              <Phone size={14} className="text-indigo-300" />
              <span>(225) 239-7833</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-indigo-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-widest">Internal Resource</span>
          </div>
        </div>

        {/* Scroll to Top Button */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="absolute bottom-20 right-6 w-12 h-12 bg-[#0F2C5C] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-indigo-600 transition-all hover:scale-110 animate-in fade-in zoom-in duration-300"
          >
            <ArrowUp size={20} />
          </button>
        )}
      </div>
    </div>
  );
};

export default OrganizationalHandbook;
