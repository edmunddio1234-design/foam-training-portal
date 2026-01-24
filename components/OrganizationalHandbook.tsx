import React, { useState } from 'react';
import {
  ArrowLeft, Book, Users, Heart, Target, Briefcase, Award, FileText,
  GraduationCap, ClipboardList, DollarSign, FolderOpen, BarChart3,
  Gift, Shield, Settings, ChevronRight, CheckCircle2, Star, Lightbulb,
  Calendar, Search, Download, Plus, Edit3, RefreshCw, Eye, QrCode,
  UserX, Upload, History, Clock, PieChart, Building2, TrendingUp,
  Mail, CreditCard, Phone, MapPin, Globe, Zap, BookOpen, Menu, X
} from 'lucide-react';

interface OrganizationalHandbookProps {
  onBack: () => void;
}

type SectionType = 
  | 'welcome' 
  | 'mission' 
  | 'values' 
  | 'programs' 
  | 'staff' 
  | 'style-guide'
  | 'guide-training'
  | 'guide-fatherhood'
  | 'guide-grants'
  | 'guide-documents'
  | 'guide-casemanager'
  | 'guide-finance'
  | 'guide-analytics'
  | 'guide-donations'
  | 'guide-admin';

const OrganizationalHandbook: React.FC<OrganizationalHandbookProps> = ({ onBack }) => {
  const [activeSection, setActiveSection] = useState<SectionType>('welcome');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Navigation structure
  const navSections = [
    {
      title: 'Organization',
      items: [
        { id: 'welcome', label: 'Welcome', icon: Book },
        { id: 'mission', label: 'Mission & Vision', icon: Target },
        { id: 'values', label: 'Core Values', icon: Heart },
        { id: 'programs', label: 'Programs', icon: Award },
        { id: 'staff', label: 'Staff Roles', icon: Users },
        { id: 'style-guide', label: 'Style Guide', icon: FileText },
      ]
    },
    {
      title: 'Portal User Guides',
      items: [
        { id: 'guide-training', label: 'Training Academy', icon: GraduationCap },
        { id: 'guide-fatherhood', label: 'Fatherhood Tracking', icon: Users },
        { id: 'guide-grants', label: 'Grant Management', icon: Briefcase },
        { id: 'guide-documents', label: 'Document Library', icon: FolderOpen },
        { id: 'guide-casemanager', label: 'Case Manager Portal', icon: ClipboardList },
        { id: 'guide-finance', label: 'Financial Tools', icon: DollarSign },
        { id: 'guide-analytics', label: 'Assessment Analytics', icon: BarChart3 },
        { id: 'guide-donations', label: 'Donation CRM', icon: Gift },
        { id: 'guide-admin', label: 'Admin Portal', icon: Shield },
      ]
    }
  ];

  // Filter navigation based on search
  const filteredNavSections = navSections.map(section => ({
    ...section,
    items: section.items.filter(item => 
      item.label.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(section => section.items.length > 0);

  // Card Component for consistent styling
  const Card: React.FC<{ 
    children: React.ReactNode; 
    className?: string;
    accent?: 'blue' | 'emerald' | 'amber' | 'rose' | 'purple' | 'slate';
  }> = ({ children, className = '', accent }) => {
    const accentColors = {
      blue: 'before:bg-blue-500/20',
      emerald: 'before:bg-emerald-500/20',
      amber: 'before:bg-amber-500/20',
      rose: 'before:bg-rose-500/20',
      purple: 'before:bg-purple-500/20',
      slate: 'before:bg-slate-500/20',
    };

    return (
      <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative ${accent ? `before:absolute before:top-0 before:right-0 before:w-32 before:h-32 before:rounded-full before:blur-3xl before:-translate-y-1/2 before:translate-x-1/2 ${accentColors[accent]}` : ''} ${className}`}>
        {children}
      </div>
    );
  };

  // Feature Item Component
  const FeatureItem: React.FC<{ icon: React.ElementType; title: string; description: string; color: string }> = 
    ({ icon: Icon, title, description, color }) => (
    <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <h4 className="font-semibold text-slate-800">{title}</h4>
        <p className="text-sm text-slate-600 mt-1">{description}</p>
      </div>
    </div>
  );

  // Step Component for guides
  const Step: React.FC<{ number: number; title: string; children: React.ReactNode }> = 
    ({ number, title, children }) => (
    <div className="flex gap-4">
      <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
        {number}
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-slate-800 mb-2">{title}</h4>
        <div className="text-slate-600 text-sm leading-relaxed">{children}</div>
      </div>
    </div>
  );

  // Tip Box Component
  const TipBox: React.FC<{ children: React.ReactNode; type?: 'tip' | 'warning' | 'info' }> = 
    ({ children, type = 'tip' }) => {
    const styles = {
      tip: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      warning: 'bg-amber-50 border-amber-200 text-amber-800',
      info: 'bg-blue-50 border-blue-200 text-blue-800',
    };
    const icons = {
      tip: Lightbulb,
      warning: Clock,
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

  // ============================================
  // SECTION CONTENT
  // ============================================

  const renderWelcome = () => (
    <div className="space-y-6">
      <Card accent="blue">
        <div className="p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center">
              <Book size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Welcome to FOAM</h1>
              <p className="text-slate-500 text-lg">Fathers On A Mission</p>
            </div>
          </div>
          <p className="text-slate-600 text-lg leading-relaxed">
            This handbook serves as your comprehensive guide to the Fathers On A Mission organization. 
            Here you'll find our mission, values, program information, staff roles, and detailed user 
            guides for all FOAM portals and tools.
          </p>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6 hover:shadow-md transition-all cursor-pointer" accent="emerald">
          <div className="flex items-center gap-4" onClick={() => setActiveSection('mission')}>
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Target size={24} className="text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Our Mission</h3>
              <p className="text-sm text-slate-500">Learn about what drives us</p>
            </div>
            <ChevronRight className="ml-auto text-slate-300" />
          </div>
        </Card>

        <Card className="p-6 hover:shadow-md transition-all cursor-pointer" accent="rose">
          <div className="flex items-center gap-4" onClick={() => setActiveSection('values')}>
            <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center">
              <Heart size={24} className="text-rose-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Core Values</h3>
              <p className="text-sm text-slate-500">The principles we live by</p>
            </div>
            <ChevronRight className="ml-auto text-slate-300" />
          </div>
        </Card>

        <Card className="p-6 hover:shadow-md transition-all cursor-pointer" accent="amber">
          <div className="flex items-center gap-4" onClick={() => setActiveSection('programs')}>
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <Award size={24} className="text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Programs</h3>
              <p className="text-sm text-slate-500">Services we provide</p>
            </div>
            <ChevronRight className="ml-auto text-slate-300" />
          </div>
        </Card>

        <Card className="p-6 hover:shadow-md transition-all cursor-pointer" accent="purple">
          <div className="flex items-center gap-4" onClick={() => setActiveSection('guide-training')}>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <BookOpen size={24} className="text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Portal Guides</h3>
              <p className="text-sm text-slate-500">Learn to use our tools</p>
            </div>
            <ChevronRight className="ml-auto text-slate-300" />
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Star className="text-amber-500" size={20} />
          Quick Stats
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Fathers Served', value: '500+', color: 'text-blue-600' },
            { label: 'Class Graduates', value: '250+', color: 'text-emerald-600' },
            { label: 'Job Placements', value: '175+', color: 'text-amber-600' },
            { label: 'Years Active', value: '8+', color: 'text-purple-600' },
          ].map((stat, i) => (
            <div key={i} className="text-center p-4 bg-slate-50 rounded-xl">
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderMission = () => (
    <div className="space-y-6">
      <Card accent="blue">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Target size={24} className="text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Mission & Vision</h2>
          </div>
          
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-50 to-slate-50 rounded-xl p-6 border border-blue-100">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Our Mission</h3>
              <p className="text-slate-700 text-lg italic">
                "To enhance fathers and strengthen families through comprehensive support services, 
                education, and community engagement."
              </p>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-slate-50 rounded-xl p-6 border border-emerald-100">
              <h3 className="text-lg font-semibold text-emerald-800 mb-2">Our Vision</h3>
              <p className="text-slate-700 text-lg italic">
                "A community where every father is equipped, empowered, and engaged in the lives 
                of their children and families."
              </p>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-slate-50 rounded-xl p-6 border border-amber-100">
              <h3 className="text-lg font-semibold text-amber-800 mb-2">Our Tagline</h3>
              <p className="text-slate-700 text-2xl font-bold text-center py-4">
                "Enhance Fathers, Strengthen Families"
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold text-slate-800 mb-4">What We Do</h3>
        <div className="grid gap-4">
          <FeatureItem 
            icon={GraduationCap}
            title="Fatherhood Education"
            description="14-session curriculum covering parenting skills, co-parenting, child development, and healthy relationships."
            color="bg-blue-600"
          />
          <FeatureItem 
            icon={Briefcase}
            title="Workforce Development"
            description="Job readiness training, resume building, interview preparation, and employment placement services."
            color="bg-emerald-600"
          />
          <FeatureItem 
            icon={Heart}
            title="Mental Health Support"
            description="Individual counseling, group therapy, anger management, and trauma-informed care services."
            color="bg-rose-600"
          />
          <FeatureItem 
            icon={Users}
            title="Family Engagement"
            description="Family reunification support, co-parenting mediation, and supervised visitation services."
            color="bg-purple-600"
          />
        </div>
      </Card>
    </div>
  );

  const renderValues = () => (
    <div className="space-y-6">
      <Card accent="rose">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center">
              <Heart size={24} className="text-rose-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Core Values</h2>
          </div>
          <p className="text-slate-600 mb-6">
            These values guide everything we do at FOAM and shape how we serve our community.
          </p>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { 
            icon: Heart, 
            title: 'Compassion', 
            description: 'We meet fathers where they are with empathy, understanding, and non-judgmental support.',
            color: 'bg-rose-600',
            accent: 'rose' as const
          },
          { 
            icon: Shield, 
            title: 'Integrity', 
            description: 'We operate with honesty, transparency, and accountability in all our interactions.',
            color: 'bg-blue-600',
            accent: 'blue' as const
          },
          { 
            icon: Users, 
            title: 'Community', 
            description: 'We believe in the power of connection and mutual support among fathers.',
            color: 'bg-emerald-600',
            accent: 'emerald' as const
          },
          { 
            icon: TrendingUp, 
            title: 'Growth', 
            description: 'We are committed to continuous improvement and lifelong learning.',
            color: 'bg-amber-600',
            accent: 'amber' as const
          },
          { 
            icon: Award, 
            title: 'Excellence', 
            description: 'We strive for the highest quality in our programs and services.',
            color: 'bg-purple-600',
            accent: 'purple' as const
          },
          { 
            icon: Zap, 
            title: 'Empowerment', 
            description: 'We equip fathers with tools and resources to succeed independently.',
            color: 'bg-indigo-600',
            accent: 'blue' as const
          },
        ].map((value, i) => {
          const Icon = value.icon;
          return (
            <Card key={i} className="p-6" accent={value.accent}>
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${value.color}`}>
                  <Icon size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">{value.title}</h3>
                  <p className="text-slate-600 mt-2">{value.description}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="p-6">
        <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Lightbulb className="text-amber-500" />
          Guiding Principles
        </h3>
        <ul className="space-y-3">
          {[
            'Every father deserves a second chance',
            'Children benefit when fathers are actively involved',
            'Support works best when it addresses the whole person',
            'Community partnerships multiply our impact',
            'Data-driven decisions lead to better outcomes',
          ].map((principle, i) => (
            <li key={i} className="flex items-center gap-3 text-slate-700">
              <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
              {principle}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );

  const renderPrograms = () => (
    <div className="space-y-6">
      <Card accent="amber">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <Award size={24} className="text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">FOAM Programs</h2>
          </div>
          <p className="text-slate-600">
            Our comprehensive programs address the diverse needs of fathers and families in our community.
          </p>
        </div>
      </Card>

      <Card className="p-6" accent="blue">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
            <GraduationCap size={24} className="text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">Fatherhood Classes</h3>
            <p className="text-slate-500">14-Session Educational Curriculum</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-4">
          {[
            'Orientation', 'Active Fatherhood', 'Building Relationships',
            'Communication Skills', 'Child Development', 'Co-Parenting',
            'Discipline Strategies', 'Financial Literacy', 'Healthy Masculinity',
            'Conflict Resolution', 'Self-Care', 'Goal Setting',
            'Resource Navigation', 'Graduation'
          ].map((module, i) => (
            <div key={i} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg text-sm">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                {i + 1}
              </span>
              <span className="text-slate-700 truncate">{module}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6" accent="emerald">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center shrink-0">
            <Users size={24} className="text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">Project Family BUILD</h3>
            <p className="text-slate-500">Comprehensive Family Support Program</p>
          </div>
        </div>
        <p className="text-slate-600 mb-4">
          An intensive program providing wraparound services for fathers and their families, 
          including case management, counseling, and resource coordination.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { icon: ClipboardList, label: 'Case Management' },
            { icon: Heart, label: 'Mental Health Services' },
            { icon: Briefcase, label: 'Employment Support' },
            { icon: Building2, label: 'Housing Assistance' },
          ].map((service, i) => {
            const Icon = service.icon;
            return (
              <div key={i} className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
                <Icon size={18} className="text-emerald-600" />
                <span className="text-slate-700">{service.label}</span>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="p-6" accent="purple">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center shrink-0">
            <Briefcase size={24} className="text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">Workforce Development</h3>
            <p className="text-slate-500">Employment & Career Services</p>
          </div>
        </div>
        <div className="space-y-3">
          {[
            { title: 'Job Readiness Training', desc: 'Soft skills, workplace expectations, professionalism' },
            { title: 'Resume & Interview Prep', desc: 'Professional resume writing and mock interviews' },
            { title: 'Job Placement Assistance', desc: 'Connections to employers and job fairs' },
            { title: 'Retention Support', desc: '90-day follow-up and ongoing coaching' },
          ].map((item, i) => (
            <div key={i} className="p-3 bg-purple-50 rounded-lg">
              <p className="font-medium text-slate-800">{item.title}</p>
              <p className="text-sm text-slate-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderStaff = () => (
    <div className="space-y-6">
      <Card accent="purple">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Users size={24} className="text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Staff Roles & Responsibilities</h2>
          </div>
          <p className="text-slate-600">
            Understanding the roles within FOAM helps ensure smooth operations and quality service delivery.
          </p>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          {
            title: 'Executive Director',
            responsibilities: ['Strategic planning', 'Board relations', 'Fundraising oversight', 'External partnerships'],
            color: 'bg-blue-600'
          },
          {
            title: 'Program Director',
            responsibilities: ['Program oversight', 'Staff supervision', 'Quality assurance', 'Curriculum development'],
            color: 'bg-emerald-600'
          },
          {
            title: 'Case Manager',
            responsibilities: ['Client intake', 'Service coordination', 'Progress tracking', 'Resource referrals'],
            color: 'bg-amber-600'
          },
          {
            title: 'Fatherhood Facilitator',
            responsibilities: ['Class instruction', 'Group facilitation', 'Attendance tracking', 'Participant engagement'],
            color: 'bg-purple-600'
          },
          {
            title: 'Workforce Specialist',
            responsibilities: ['Job development', 'Employer relations', 'Placement coordination', 'Retention follow-up'],
            color: 'bg-rose-600'
          },
          {
            title: 'Data & Compliance',
            responsibilities: ['Data entry', 'Report generation', 'Grant compliance', 'Outcome tracking'],
            color: 'bg-indigo-600'
          },
        ].map((role, i) => (
          <Card key={i} className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${role.color}`}>
                <Users size={20} className="text-white" />
              </div>
              <h3 className="font-bold text-slate-800">{role.title}</h3>
            </div>
            <ul className="space-y-2">
              {role.responsibilities.map((resp, j) => (
                <li key={j} className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                  {resp}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderStyleGuide = () => (
    <div className="space-y-6">
      <Card accent="slate">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
              <FileText size={24} className="text-slate-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">FOAM Style Guide</h2>
          </div>
          <p className="text-slate-600">
            Consistent branding and terminology ensure professional communication across all FOAM materials.
          </p>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold text-slate-800 mb-4">Official Program Names</h3>
        <div className="space-y-3">
          {[
            { correct: 'Fathers On A Mission (FOAM)', incorrect: 'Fathers on a mission, F.O.A.M.' },
            { correct: 'Project Family BUILD', incorrect: 'Project Family Build, PFB' },
            { correct: 'Fatherhood Classes', incorrect: 'Fatherhood classes, Parenting Classes' },
            { correct: 'Workforce Development Program', incorrect: 'Job Program, Employment Services' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
              <div className="flex-1">
                <p className="text-sm text-slate-500">Correct</p>
                <p className="font-medium text-emerald-700">{item.correct}</p>
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-500">Avoid</p>
                <p className="text-rose-600 line-through">{item.incorrect}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold text-slate-800 mb-4">Brand Colors</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'FOAM Blue', hex: '#1E40AF', class: 'bg-blue-800' },
            { name: 'FOAM Gold', hex: '#D97706', class: 'bg-amber-600' },
            { name: 'Success Green', hex: '#059669', class: 'bg-emerald-600' },
            { name: 'Slate', hex: '#475569', class: 'bg-slate-600' },
          ].map((color, i) => (
            <div key={i} className="text-center">
              <div className={`w-full h-16 rounded-xl ${color.class} mb-2`} />
              <p className="font-medium text-slate-800">{color.name}</p>
              <p className="text-xs text-slate-500">{color.hex}</p>
            </div>
          ))}
        </div>
      </Card>

      <TipBox type="info">
        <strong>Important:</strong> Always use the official FOAM logo from the Document Library. 
        Do not stretch, recolor, or modify the logo in any way.
      </TipBox>
    </div>
  );

  // ============================================
  // PORTAL USER GUIDES
  // ============================================

  const renderGuideTraining = () => (
    <div className="space-y-6">
      <Card accent="blue">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <GraduationCap size={24} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Training Academy</h2>
              <p className="text-slate-500">Staff Training & Development Portal</p>
            </div>
          </div>
          <p className="text-slate-600">
            Access training modules, complete assessments, and track your professional development progress.
          </p>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold text-slate-800 mb-4">Key Features</h3>
        <div className="grid gap-4">
          <FeatureItem 
            icon={BookOpen}
            title="Training Modules"
            description="Self-paced learning modules covering FOAM programs, policies, and best practices."
            color="bg-blue-600"
          />
          <FeatureItem 
            icon={ClipboardList}
            title="Assessments & Quizzes"
            description="Knowledge checks to verify understanding of key concepts."
            color="bg-emerald-600"
          />
          <FeatureItem 
            icon={Award}
            title="Certifications"
            description="Earn certificates upon completing required training tracks."
            color="bg-amber-600"
          />
          <FeatureItem 
            icon={TrendingUp}
            title="Progress Tracking"
            description="Monitor your completion status and time spent on training."
            color="bg-purple-600"
          />
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold text-slate-800 mb-4">How to Use</h3>
        <div className="space-y-6">
          <Step number={1} title="Access Training Academy">
            Click "Training Academy" from the Command Center to enter the portal.
          </Step>
          <Step number={2} title="Select a Training Track">
            Choose from available tracks: Onboarding, Program-Specific, Compliance, or Advanced Skills.
          </Step>
          <Step number={3} title="Complete Modules">
            Work through each module sequentially. Watch videos, read materials, and complete activities.
          </Step>
          <Step number={4} title="Take Assessments">
            After each module, complete the assessment. A passing score of 80% is required.
          </Step>
          <Step number={5} title="Download Certificates">
            Upon track completion, download your certificate from the Achievements section.
          </Step>
        </div>
      </Card>

      <TipBox type="tip">
        <strong>Pro Tip:</strong> Complete all onboarding modules within your first 30 days. 
        Training progress is visible to supervisors and included in performance reviews.
      </TipBox>
    </div>
  );

  const renderGuideFatherhood = () => (
    <div className="space-y-6">
      <Card accent="emerald">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Users size={24} className="text-emerald-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Fatherhood Tracking</h2>
              <p className="text-slate-500">Class Management System</p>
            </div>
          </div>
          <p className="text-slate-600">
            Manage class rosters, track attendance, record check-ins, and monitor participant progress 
            through the 14-session fatherhood curriculum.
          </p>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold text-slate-800 mb-4">Navigation Tabs</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { icon: BarChart3, label: 'Dashboard', desc: 'Overview stats, recent activity, progress charts' },
            { icon: Users, label: 'Father Roster', desc: 'View/add/edit participant profiles' },
            { icon: CheckCircle2, label: 'Class Check-In', desc: 'Record attendance for class sessions' },
            { icon: QrCode, label: 'QR Check-In', desc: 'Self-service check-in via QR code' },
            { icon: Shield, label: 'Father Portal', desc: 'Individual participant details and history' },
            { icon: Upload, label: 'Import Data', desc: 'Bulk import participants via CSV' },
            { icon: UserX, label: 'Lost to Follow-up', desc: 'Manage at-risk and inactive participants' },
            { icon: Download, label: 'Export Data', desc: 'Download reports and data exports' },
            { icon: BookOpen, label: 'Resources', desc: 'Program materials and references' },
          ].map((tab, i) => {
            const Icon = tab.icon;
            return (
              <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                <Icon size={18} className="text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-slate-800">{tab.label}</p>
                  <p className="text-xs text-slate-500">{tab.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold text-slate-800 mb-4">Common Tasks</h3>
        <div className="space-y-6">
          <Step number={1} title="Check In a Father for Class">
            Go to "Class Check-In" → Select the module → Search for the father → Click "Check In". 
            The system automatically updates their progress.
          </Step>
          <Step number={2} title="Add a New Participant">
            Go to "Father Roster" → Click "Add Father" → Fill in required fields (Name, Phone, Status) 
            → Click "Save". They'll appear in the roster immediately.
          </Step>
          <Step number={3} title="View Individual Progress">
            Go to "Father Portal" → Search or select a father → View their module completion, 
            attendance history, and status.
          </Step>
          <Step number={4} title="Handle Lost to Follow-up">
            Go to "Lost to Follow-up" → Review fathers with less than 2 modules or "At Risk" status → 
            Use contact buttons to reach out → Update status after contact.
          </Step>
        </div>
      </Card>

      <TipBox type="warning">
        <strong>Important:</strong> Always check in fathers during or immediately after class. 
        Late entries affect reporting accuracy and may impact grant compliance.
      </TipBox>

      <Card className="p-6">
        <h3 className="font-semibold text-slate-800 mb-4">Status Definitions</h3>
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
      </Card>
    </div>
  );

  const renderGuideGrants = () => (
    <div className="space-y-6">
      <Card accent="amber">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <Briefcase size={24} className="text-amber-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Grant Management</h2>
              <p className="text-slate-500">Track Grants & Funding Opportunities</p>
            </div>
          </div>
          <p className="text-slate-600">
            Manage grant applications, track funding status, monitor deadlines, and generate 
            reports for funders. Data syncs in real-time with Google Sheets.
          </p>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold text-slate-800 mb-4">Dashboard Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Grants', icon: FileText, color: 'bg-blue-100 text-blue-600' },
            { label: 'Total Requested', icon: DollarSign, color: 'bg-amber-100 text-amber-600' },
            { label: 'Total Approved', icon: CheckCircle2, color: 'bg-emerald-100 text-emerald-600' },
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
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold text-slate-800 mb-4">Tabs & Features</h3>
        <div className="space-y-3">
          {[
            { tab: 'Dashboard', desc: 'Stats cards, status breakdown, action items, funder types' },
            { tab: 'All Grants', desc: 'Complete list of all grants with search functionality' },
            { tab: 'Approved', desc: 'Filtered view of approved/awarded grants' },
            { tab: 'Pending', desc: 'Grants awaiting decision (Submitted, Pending, To Submit)' },
            { tab: 'Denied', desc: 'Rejected applications for review and resubmission planning' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
              <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-xs font-bold shrink-0">
                {i + 1}
              </span>
              <div>
                <p className="font-medium text-slate-800">{item.tab}</p>
                <p className="text-xs text-slate-500">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold text-slate-800 mb-4">Adding a New Grant</h3>
        <div className="space-y-6">
          <Step number={1} title="Click 'Add Grant' Button">
            Located in the header next to Refresh. Opens the grant entry form.
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
      </Card>

      <TipBox type="info">
        <strong>Data Sync:</strong> All changes sync to Google Sheets in real-time. 
        Click "Refresh" to pull the latest data if working with multiple users.
      </TipBox>
    </div>
  );

  const renderGuideDocuments = () => (
    <div className="space-y-6">
      <Card accent="purple">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <FolderOpen size={24} className="text-purple-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Document Library</h2>
              <p className="text-slate-500">Centralized File Repository</p>
            </div>
          </div>
          <p className="text-slate-600">
            Access program materials, templates, policies, and forms. All documents are organized 
            by category for easy navigation.
          </p>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold text-slate-800 mb-4">Document Categories</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold text-slate-800 mb-4">How to Use</h3>
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
            Can't find what you need? Click "Request Document" to notify administration.
          </Step>
        </div>
      </Card>

      <TipBox type="tip">
        <strong>Version Control:</strong> Always download the latest version of forms before printing. 
        Check the "Last Updated" date to ensure you have current materials.
      </TipBox>
    </div>
  );

  const renderGuideCaseManager = () => (
    <div className="space-y-6">
      <Card accent="blue">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <ClipboardList size={24} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Case Manager Portal</h2>
              <p className="text-slate-500">Monthly Outcomes & Reporting</p>
            </div>
          </div>
          <p className="text-slate-600">
            Enter monthly outcome data, view historical trends, generate funder reports, and track 
            program performance metrics. Data syncs to Google Sheets.
          </p>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold text-slate-800 mb-4">Portal Tabs</h3>
        <div className="space-y-3">
          {[
            { 
              tab: '2026 Data Entry', 
              icon: Edit3,
              desc: 'Enter current year monthly data. Click any cell to edit. Changes logged automatically.',
              color: 'bg-emerald-100 text-emerald-600'
            },
            { 
              tab: '2024-2025 Historical', 
              icon: History,
              desc: 'View previous fiscal year data. Read-only for reference.',
              color: 'bg-slate-100 text-slate-600'
            },
            { 
              tab: 'Year Comparison', 
              icon: BarChart3,
              desc: 'Side-by-side comparison of totals with change indicators.',
              color: 'bg-purple-100 text-purple-600'
            },
            { 
              tab: 'Change Log', 
              icon: Clock,
              desc: 'Audit trail of all data modifications with timestamps and names.',
              color: 'bg-amber-100 text-amber-600'
            },
            { 
              tab: 'Generate Reports', 
              icon: Download,
              desc: 'Create Monthly, Quarterly, or Annual reports for funders.',
              color: 'bg-blue-100 text-blue-600'
            },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                  <Icon size={20} />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{item.tab}</p>
                  <p className="text-sm text-slate-600">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold text-slate-800 mb-4">Entering Data</h3>
        <div className="space-y-6">
          <Step number={1} title="Enter Your Name">
            First time editing? You'll be prompted to enter your name for the change log.
          </Step>
          <Step number={2} title="Click a Cell to Edit">
            On the "2026 Data Entry" tab, click any cell (except Total column) to edit.
          </Step>
          <Step number={3} title="Enter the Value">
            Type the number and press Enter or click the checkmark to save.
          </Step>
          <Step number={4} title="Verify in Change Log">
            Your edit appears immediately in the Change Log with timestamp and your name.
          </Step>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold text-slate-800 mb-4">Generating Reports</h3>
        <div className="space-y-6">
          <Step number={1} title="Select Report Type">
            Choose Monthly (single month), Quarterly (3 months), or Annual (full year).
          </Step>
          <Step number={2} title="Select Year & Period">
            Pick 2024-2025 (historical) or 2026 (current). Select specific month/quarter.
          </Step>
          <Step number={3} title="Preview Data">
            Click "Preview Data" to see key metrics and charts before generating.
          </Step>
          <Step number={4} title="Generate & Download">
            Click "Generate Report" → View interactive report → Download as Word Doc or PDF.
          </Step>
        </div>
      </Card>

      <TipBox type="warning">
        <strong>Data Entry Deadline:</strong> All monthly data must be entered by the 5th of the 
        following month to ensure accurate reporting and grant compliance.
      </TipBox>

      <Card className="p-6">
        <h3 className="font-semibold text-slate-800 mb-4">Report Contents</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { icon: FileText, label: 'Executive Summary' },
            { icon: BarChart3, label: 'Visual Charts' },
            { icon: Target, label: 'Outcome Metrics' },
            { icon: Users, label: 'Program Breakdown' },
            { icon: Briefcase, label: 'Workforce Analysis' },
            { icon: Lightbulb, label: 'AI-Generated Insights' },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                <Icon size={16} className="text-blue-600" />
                <span className="text-sm text-slate-700">{item.label}</span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );

  const renderGuideFinance = () => (
    <div className="space-y-6">
      <Card accent="emerald">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <DollarSign size={24} className="text-emerald-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Financial Tools</h2>
              <p className="text-slate-500">Finance Ledger & Budget Tracking</p>
            </div>
          </div>
          <p className="text-slate-600">
            Track expenses, record transactions, manage budgets, and generate financial reports. 
            All data syncs to the FOAM_Finance_Master Google Sheet.
          </p>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold text-slate-800 mb-4">Key Features</h3>
        <div className="grid gap-4">
          <FeatureItem 
            icon={ClipboardList}
            title="Transaction Entry"
            description="Record expenses with category, vendor, amount, and grant allocation."
            color="bg-emerald-600"
          />
          <FeatureItem 
            icon={PieChart}
            title="Budget Overview"
            description="Visual dashboard showing spending by category and remaining budgets."
            color="bg-blue-600"
          />
          <FeatureItem 
            icon={FileText}
            title="Financial Reports"
            description="Generate expense reports by date range, category, or funder."
            color="bg-amber-600"
          />
          <FeatureItem 
            icon={Building2}
            title="Grant Allocation"
            description="Track spending against specific grant budgets and restrictions."
            color="bg-purple-600"
          />
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold text-slate-800 mb-4">Recording a Transaction</h3>
        <div className="space-y-6">
          <Step number={1} title="Click 'Add Transaction'">
            Opens the transaction entry form with all required fields.
          </Step>
          <Step number={2} title="Fill Transaction Details">
            Enter date, category, subcategory, vendor, description, and amount.
          </Step>
          <Step number={3} title="Assign to Grant/Funder">
            Select the funding source to track against grant budgets.
          </Step>
          <Step number={4} title="Submit">
            Transaction syncs to Google Sheets with unique Transaction ID.
          </Step>
        </div>
      </Card>

      <TipBox type="info">
        <strong>Column Mapping:</strong> Transactions sync to 16 columns in the Finance Master sheet. 
        Ensure all required fields are completed for accurate reporting.
      </TipBox>

      <Card className="p-6">
        <h3 className="font-semibold text-slate-800 mb-4">Expense Categories</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {[
            'Personnel', 'Supplies', 'Equipment', 'Travel', 'Contractual',
            'Indirect Costs', 'Participant Support', 'Marketing', 'Professional Development'
          ].map((cat, i) => (
            <div key={i} className="p-2 bg-emerald-50 rounded-lg text-center text-sm text-slate-700">
              {cat}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderGuideAnalytics = () => (
    <div className="space-y-6">
      <Card accent="purple">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <BarChart3 size={24} className="text-purple-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Assessment Analytics</h2>
              <p className="text-slate-500">Data Visualization & Insights</p>
            </div>
          </div>
          <p className="text-slate-600">
            Analyze program data, view participant outcomes, and generate visual reports 
            for stakeholders and funders.
          </p>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold text-slate-800 mb-4">Available Analytics</h3>
        <div className="grid gap-4">
          <FeatureItem 
            icon={Users}
            title="Participant Demographics"
            description="Age distribution, geographic spread, referral sources, and enrollment trends."
            color="bg-blue-600"
          />
          <FeatureItem 
            icon={TrendingUp}
            title="Outcome Tracking"
            description="Program completion rates, job placement stats, and retention metrics."
            color="bg-emerald-600"
          />
          <FeatureItem 
            icon={Calendar}
            title="Time-Based Analysis"
            description="Monthly, quarterly, and annual trend comparisons."
            color="bg-amber-600"
          />
          <FeatureItem 
            icon={Target}
            title="Goal Progress"
            description="Track progress toward grant objectives and program targets."
            color="bg-purple-600"
          />
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold text-slate-800 mb-4">Generating Reports</h3>
        <div className="space-y-6">
          <Step number={1} title="Select Report Type">
            Choose from Demographics, Outcomes, Attendance, or Custom reports.
          </Step>
          <Step number={2} title="Set Date Range">
            Select the time period for your analysis (month, quarter, year, or custom).
          </Step>
          <Step number={3} title="Apply Filters">
            Filter by program, cohort, case manager, or other criteria.
          </Step>
          <Step number={4} title="View & Export">
            Interactive charts display on screen. Export as PDF, Excel, or image.
          </Step>
        </div>
      </Card>

      <TipBox type="tip">
        <strong>Funder Reports:</strong> Use the "Funder Report Template" option to auto-format 
        data according to specific grant requirements.
      </TipBox>
    </div>
  );

  const renderGuideDonations = () => (
    <div className="space-y-6">
      <Card accent="rose">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center">
              <Gift size={24} className="text-rose-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Donation CRM</h2>
              <p className="text-slate-500">Donor Management System</p>
            </div>
          </div>
          <p className="text-slate-600">
            Manage donors, track donations, run fundraising campaigns, and maintain donor 
            relationships. Generate acknowledgment letters and year-end reports.
          </p>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold text-slate-800 mb-4">Navigation Tabs</h3>
        <div className="space-y-3">
          {[
            { 
              tab: 'Dashboard', 
              icon: TrendingUp,
              desc: 'Total raised, donor count, monthly trends, top donors, active campaigns',
              color: 'bg-rose-100 text-rose-600'
            },
            { 
              tab: 'Donors', 
              icon: Users,
              desc: 'Donor profiles, contact info, giving history, donor types',
              color: 'bg-blue-100 text-blue-600'
            },
            { 
              tab: 'Donations', 
              icon: DollarSign,
              desc: 'Transaction records, payment methods, receipt/thank you status',
              color: 'bg-emerald-100 text-emerald-600'
            },
            { 
              tab: 'Campaigns', 
              icon: Target,
              desc: 'Fundraising campaigns with goals, progress, and donor counts',
              color: 'bg-amber-100 text-amber-600'
            },
            { 
              tab: 'Reports', 
              icon: FileText,
              desc: 'Donation summary, donor reports, year-end statements',
              color: 'bg-purple-100 text-purple-600'
            },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                  <Icon size={20} />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{item.tab}</p>
                  <p className="text-sm text-slate-600">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold text-slate-800 mb-4">Recording a Donation</h3>
        <div className="space-y-6">
          <Step number={1} title="Click 'Quick Donation' or 'Record Donation'">
            Header button or Donations tab → Record Donation opens the entry form.
          </Step>
          <Step number={2} title="Select or Add Donor">
            Choose existing donor from dropdown or add new donor first.
          </Step>
          <Step number={3} title="Enter Donation Details">
            Amount, date, payment method (Check, Cash, Credit Card, Bank Transfer, PayPal, Zelle).
          </Step>
          <Step number={4} title="Assign to Campaign">
            Link to active campaign and add designation (General, Programs, Scholarships, etc.).
          </Step>
          <Step number={5} title="Track Follow-ups">
            System auto-generates receipt number. Mark receipt sent and thank you sent status.
          </Step>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold text-slate-800 mb-4">Donor Types</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {[
            { type: 'Individual', color: 'bg-blue-100 text-blue-700' },
            { type: 'Organization', color: 'bg-purple-100 text-purple-700' },
            { type: 'Foundation', color: 'bg-amber-100 text-amber-700' },
            { type: 'Corporate', color: 'bg-emerald-100 text-emerald-700' },
            { type: 'Government', color: 'bg-slate-100 text-slate-700' },
          ].map((item, i) => (
            <span key={i} className={`px-3 py-2 rounded-lg text-center text-sm font-medium ${item.color}`}>
              {item.type}
            </span>
          ))}
        </div>
      </Card>

      <TipBox type="warning">
        <strong>Thank You Timeline:</strong> Send thank you notes within 48 hours of receiving a donation. 
        Use the Mail icon on each donation to track acknowledgment status.
      </TipBox>

      <Card className="p-6">
        <h3 className="font-semibold text-slate-800 mb-4">Campaign Management</h3>
        <div className="space-y-6">
          <Step number={1} title="Create New Campaign">
            Campaigns tab → "New Campaign" → Enter name, description, goal amount, dates.
          </Step>
          <Step number={2} title="Link Donations">
            When recording donations, select the campaign from the dropdown.
          </Step>
          <Step number={3} title="Track Progress">
            View real-time progress bars, donation counts, and percentage toward goal.
          </Step>
          <Step number={4} title="Close Campaign">
            Change status to "Completed" when campaign ends. Generate final report.
          </Step>
        </div>
      </Card>
    </div>
  );

  const renderGuideAdmin = () => (
    <div className="space-y-6">
      <Card accent="slate">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
              <Shield size={24} className="text-slate-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Admin Portal</h2>
              <p className="text-slate-500">System Administration</p>
            </div>
          </div>
          <p className="text-slate-600">
            Manage users, configure system settings, view audit logs, and maintain 
            data integrity across all FOAM portals.
          </p>
        </div>
      </Card>

      <TipBox type="warning">
        <strong>Access Restricted:</strong> The Admin Portal is only accessible to users with 
        Administrator or Executive-level permissions. Contact IT for access requests.
      </TipBox>

      <Card className="p-6">
        <h3 className="font-semibold text-slate-800 mb-4">Admin Functions</h3>
        <div className="grid gap-4">
          <FeatureItem 
            icon={Users}
            title="User Management"
            description="Add/remove users, assign roles, reset passwords, manage permissions."
            color="bg-blue-600"
          />
          <FeatureItem 
            icon={Settings}
            title="System Settings"
            description="Configure portals, update organization info, manage integrations."
            color="bg-slate-600"
          />
          <FeatureItem 
            icon={Clock}
            title="Audit Logs"
            description="View all system activity, data changes, login history, and exports."
            color="bg-amber-600"
          />
          <FeatureItem 
            icon={RefreshCw}
            title="Data Sync"
            description="Force sync with Google Sheets, clear caches, run data validations."
            color="bg-emerald-600"
          />
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold text-slate-800 mb-4">User Roles</h3>
        <div className="space-y-3">
          {[
            { role: 'Administrator', perms: 'Full access to all portals and admin functions', color: 'bg-red-100 text-red-700' },
            { role: 'Program Director', perms: 'Access to all program portals, no admin functions', color: 'bg-purple-100 text-purple-700' },
            { role: 'Case Manager', perms: 'Case Manager Portal, Fatherhood Tracking, Documents', color: 'bg-blue-100 text-blue-700' },
            { role: 'Facilitator', perms: 'Fatherhood Tracking, Training Academy only', color: 'bg-emerald-100 text-emerald-700' },
            { role: 'Read Only', perms: 'View access only, no editing capabilities', color: 'bg-slate-100 text-slate-700' },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${item.color}`}>
                {item.role}
              </span>
              <span className="text-sm text-slate-600">{item.perms}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold text-slate-800 mb-4">Common Admin Tasks</h3>
        <div className="space-y-6">
          <Step number={1} title="Add New User">
            User Management → Add User → Enter email, name, select role → Send invite.
          </Step>
          <Step number={2} title="Reset User Password">
            User Management → Find user → Actions → Reset Password → User receives email.
          </Step>
          <Step number={3} title="View Audit Trail">
            Audit Logs → Filter by date/user/action → Export if needed for compliance.
          </Step>
          <Step number={4} title="Force Data Sync">
            Data Sync → Select portal → Click "Sync Now" → Verify completion status.
          </Step>
        </div>
      </Card>
    </div>
  );

  // Section content router
  const renderSectionContent = () => {
    switch (activeSection) {
      case 'welcome': return renderWelcome();
      case 'mission': return renderMission();
      case 'values': return renderValues();
      case 'programs': return renderPrograms();
      case 'staff': return renderStaff();
      case 'style-guide': return renderStyleGuide();
      case 'guide-training': return renderGuideTraining();
      case 'guide-fatherhood': return renderGuideFatherhood();
      case 'guide-grants': return renderGuideGrants();
      case 'guide-documents': return renderGuideDocuments();
      case 'guide-casemanager': return renderGuideCaseManager();
      case 'guide-finance': return renderGuideFinance();
      case 'guide-analytics': return renderGuideAnalytics();
      case 'guide-donations': return renderGuideDonations();
      case 'guide-admin': return renderGuideAdmin();
      default: return renderWelcome();
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-slate-200 shadow-sm">
        {/* Header */}
        <div className="p-6 border-b border-slate-100">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-4 transition-colors text-sm"
          >
            <ArrowLeft size={16} />
            Back to Portal
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
              <Book size={20} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-slate-800">FOAM Handbook</h1>
              <p className="text-xs text-slate-500">Organization & Guides</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-100">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          {filteredNavSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="mb-6">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-3">
                {section.title}
              </p>
              <ul className="space-y-1">
                {section.items.map(item => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => setActiveSection(item.id as SectionType)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                          isActive 
                            ? 'bg-blue-50 text-blue-700 font-medium' 
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                        }`}
                      >
                        <Icon size={18} className={isActive ? 'text-blue-600' : 'text-slate-400'} />
                        <span>{item.label}</span>
                        {isActive && <ChevronRight size={14} className="ml-auto" />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100">
          <div className="bg-slate-50 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-500">FOAM Training Portal</p>
            <p className="text-xs text-slate-400 mt-1">v2.0 • Updated Jan 2026</p>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between z-50">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg">
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          <h1 className="font-bold text-slate-800">FOAM Handbook</h1>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 hover:bg-slate-100 rounded-lg"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-white z-40 pt-16 overflow-y-auto">
          <div className="p-4">
            <div className="relative mb-4">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
              />
            </div>
            {filteredNavSections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="mb-6">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-3">
                  {section.title}
                </p>
                <ul className="space-y-1">
                  {section.items.map(item => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.id;
                    return (
                      <li key={item.id}>
                        <button
                          onClick={() => {
                            setActiveSection(item.id as SectionType);
                            setIsMobileMenuOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                            isActive 
                              ? 'bg-blue-50 text-blue-700 font-medium' 
                              : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <Icon size={20} />
                          <span>{item.label}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 lg:p-8 p-4 pt-20 lg:pt-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {renderSectionContent()}
        </div>
      </main>
    </div>
  );
};

export default OrganizationalHandbook;
