import React, { useState } from 'react';
import { 
  X, Search, Book, GraduationCap, FileText, Shield, 
  Scale, UserCog, Palette, ChevronDown, ChevronRight, Phone, 
  Mail, MapPin, Heart, Home, Briefcase, Brain, Target, 
  HeartHandshake, Star, CheckCircle
} from 'lucide-react';

interface OrganizationalHandbookProps {
  onClose: () => void;
}

type Section = 'overview' | 'programs' | 'curriculum' | 'sops' | 'policies' | 'compliance' | 'roles' | 'style';
type ProgramTab = 'pfb' | 'rfc' | 'services';

const OrganizationalHandbook: React.FC<OrganizationalHandbookProps> = ({ onClose }) => {
  const [activeSection, setActiveSection] = useState<Section>('overview');
  const [activeTab, setActiveTab] = useState<ProgramTab>('pfb');
  const [expandedAccordions, setExpandedAccordions] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleAccordion = (id: string) => {
    setExpandedAccordions(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const navItems: { id: Section; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <Home size={16} /> },
    { id: 'programs', label: 'Programs', icon: <Briefcase size={16} /> },
    { id: 'curriculum', label: 'Curriculum', icon: <GraduationCap size={16} /> },
    { id: 'sops', label: 'SOPs', icon: <FileText size={16} /> },
    { id: 'policies', label: 'Policies', icon: <Shield size={16} /> },
    { id: 'compliance', label: 'Compliance', icon: <Scale size={16} /> },
    { id: 'roles', label: 'Staff Roles', icon: <UserCog size={16} /> },
    { id: 'style', label: 'Style Guide', icon: <Palette size={16} /> },
  ];

  const coreValues = [
    "Be The Best Version Of You",
    "Commit To The Process",
    "Don't Give Up",
    "Be A Part Of The Team",
    "Grow Through Being Uncomfortable",
    "The World Is Average, Be Better",
    "Don't Be Scared To Fall, Be Brave Enough To Get Up",
    "Control The Controllables"
  ];

  const guidingPrinciples = [
    { icon: <Home size={20} />, title: "Whole-Family Approach", desc: "Supporting fathers is a pathway to supporting entire families, including children, partners, and caregivers." },
    { icon: <Heart size={20} />, title: "Trauma-Informed Care", desc: "We operate with awareness of the challenges fathers may carry and create safe, supportive environments." },
    { icon: <Target size={20} />, title: "Evidence-Based Practice", desc: "We base our programming and curriculum on proven models and measurable outcomes." },
    { icon: <HeartHandshake size={20} />, title: "Partnership Over Charity", desc: "We work alongside fathers, not for them, recognizing their strengths and leadership potential." },
    { icon: <Star size={20} />, title: "Consistency Builds Trust", desc: "We deliver programs and services reliably and transparently to establish lasting trust." },
  ];

  const quickRefs = [
    { label: "Office Hours", value: "8am - 4pm" },
    { label: "Intake Timeline", value: "3 Business Days" },
    { label: "Class Sessions", value: "14 Required" },
    { label: "Data Entry", value: "3 Business Days" },
    { label: "Record Retention", value: "7 Years" },
    { label: "Password Change", value: "Every 90 Days" },
  ];

  const curriculumModules = [
    { id: 1, title: "Introduction to Fatherhood Development", category: "Personal Development" },
    { id: 2, title: "Manhood", category: "Personal Development" },
    { id: 3, title: "Values", category: "Personal Development" },
    { id: 4, title: "Becoming Self-Sufficient", category: "Personal Development" },
    { id: 5, title: "Communication", category: "Life Skills" },
    { id: 6, title: "Dealing with Stress", category: "Life Skills" },
    { id: 7, title: "Coping with Fatherhood Discrimination", category: "Life Skills" },
    { id: 8, title: "Fatherhood Today", category: "Responsible Fatherhood" },
    { id: 9, title: "Understanding Children's Needs", category: "Responsible Fatherhood" },
    { id: 10, title: "A Father's Influence on His Children", category: "Responsible Fatherhood" },
    { id: 11, title: "Coping as a Single Father / Building Self-Esteem", category: "Responsible Fatherhood" },
    { id: 12, title: "Relationships", category: "Relationships" },
    { id: 13, title: "Conflict Resolution / Anger Management", category: "Relationships" },
    { id: 14, title: "Male/Female Relationships", category: "Relationships" },
  ];

  const staffRoles = [
    { title: "Executive Director", dept: "Leadership", duties: ["Overall leadership and strategic vision", "Program direction, partnerships, fundraising", "Public representative and primary decision-maker", "Ensures legal and funding compliance"] },
    { title: "Program Manager & Grant Manager", dept: "Operations", duties: ["Day-to-day operations of programs", "Grant applications and funder communication", "Tracks metrics and outcomes", "Coordinates with partners and staff"] },
    { title: "Fatherhood Class Facilitators", dept: "Program Delivery", duties: ["Deliver Responsible Fatherhood curriculum", "Engage participants in discussions and activities", "Track attendance and progress", "Provide referrals as needed"] },
    { title: "Case Managers", dept: "Program Services", duties: ["One-on-one support for fathers", "Create individualized support plans", "Maintain records and progress updates", "Coordinate referrals with partners"] },
    { title: "Outreach Coordinator", dept: "Community", duties: ["Community engagement and recruitment", "Collaborate with community partners", "Distribute materials to schools, churches, etc."] },
    { title: "Bookkeeper", dept: "Finance", duties: ["Daily accounting in QuickBooks Online", "Bank reconciliation", "Financial reporting for grants", "Invoicing and payroll support"] },
  ];

  // Simple search - navigate to relevant section
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) return;
    
    const keywords: Record<Section, string[]> = {
      overview: ['mission', 'vision', 'values', 'principles', 'hours', 'contact'],
      programs: ['project family build', 'fatherhood class', 'workforce', 'case management', 'housing'],
      curriculum: ['module', 'session', 'communication', 'stress', 'relationships', 'manhood'],
      sops: ['intake', 'referral', 'data', 'technology', 'volunteer', 'security'],
      policies: ['confidentiality', 'safety', 'financial', 'conflict', 'expense'],
      compliance: ['gaap', '501', 'civil rights', 'ada', 'hipaa', 'tax'],
      roles: ['executive', 'program manager', 'case manager', 'facilitator', 'bookkeeper'],
      style: ['voice', 'tone', 'language', 'branding', 'formatting']
    };

    for (const [section, words] of Object.entries(keywords)) {
      if (words.some(w => w.includes(query.toLowerCase())) || section.includes(query.toLowerCase())) {
        setActiveSection(section as Section);
        break;
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0a1f3d] via-[#0F2C5C] to-[#1a4178] text-white p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center">
                <Book size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight">F.O.A.M. Organizational Hub</h1>
                <p className="text-indigo-200 text-sm">Fathers On A Mission • Internal Resource</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative hidden md:block">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
                <input 
                  type="text"
                  placeholder="Search policies, procedures..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-full text-sm text-white placeholder-white/50 focus:outline-none focus:bg-white/20 w-64"
                />
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-xl transition-all"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Quick Info Bar */}
          <div className="flex flex-wrap gap-6 text-sm text-indigo-200">
            <div className="flex items-center gap-2">
              <MapPin size={14} />
              <span>1120 Government St, Baton Rouge, LA 70802</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={14} />
              <span>(225) 239-7833</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail size={14} />
              <span>admin@foamla.org</span>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex gap-1 mt-4 overflow-x-auto pb-1 -mx-2 px-2">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                  activeSection === item.id 
                    ? 'bg-white text-[#0F2C5C]' 
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                {item.icon}
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          
          {/* OVERVIEW */}
          {activeSection === 'overview' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Mission Card */}
              <div className="bg-gradient-to-r from-[#0F2C5C] to-[#1a4178] rounded-2xl p-8 text-white text-center">
                <h2 className="text-amber-300 font-bold uppercase tracking-widest text-sm mb-4">Our Mission</h2>
                <p className="text-2xl font-light leading-relaxed max-w-2xl mx-auto">
                  To enhance Fathers and Father Figures, which will ultimately strengthen families.
                </p>
                <p className="mt-4 text-indigo-200">
                  <span className="font-semibold">Vision:</span> All Fathers and Father Figures are active, positive role models with their children, families, and in the community.
                </p>
                <div className="flex flex-wrap justify-center gap-2 mt-6">
                  {coreValues.map((value, i) => (
                    <span key={i} className="px-3 py-1 bg-white/10 rounded-full text-xs font-medium border border-white/20 hover:bg-amber-500 hover:text-[#0F2C5C] hover:border-amber-500 transition-all cursor-default">
                      {value}
                    </span>
                  ))}
                </div>
              </div>

              {/* Guiding Principles */}
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-4">Guiding Principles</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {guidingPrinciples.map((p, i) => (
                    <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 hover:shadow-md transition-all">
                      <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 mb-3">
                        {p.icon}
                      </div>
                      <h4 className="font-bold text-slate-800 mb-1">{p.title}</h4>
                      <p className="text-sm text-slate-500">{p.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Reference */}
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-4">Quick Reference</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {quickRefs.map((ref, i) => (
                    <div key={i} className="bg-white rounded-xl p-4 text-center shadow-sm border border-slate-200">
                      <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">{ref.label}</p>
                      <p className="text-lg font-bold text-[#0F2C5C]">{ref.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* PROGRAMS */}
          {activeSection === 'programs' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Tabs */}
              <div className="flex gap-2 flex-wrap">
                {[
                  { id: 'pfb', label: 'Project Family Build' },
                  { id: 'rfc', label: 'Responsible Fatherhood Class' },
                  { id: 'services', label: 'Support Services' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as ProgramTab)}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                      activeTab === tab.id 
                        ? 'bg-[#0F2C5C] text-white' 
                        : 'bg-white text-slate-600 border border-slate-200 hover:border-[#0F2C5C]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {activeTab === 'pfb' && (
                <div className="space-y-6">
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <p className="text-sm"><strong>Program Lead:</strong> Program Manager | <strong>Target:</strong> All fathers and father figures | <strong>Type:</strong> Evidence-Based Fatherhood Education</p>
                  </div>
                  <p className="text-slate-600">
                    Project Family Build is FOAM's comprehensive support program designed to equip fathers with the tools, services, and relationships needed to stabilize their lives and support their families through individualized case management, employment pathways, and social service referrals.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      { icon: <Briefcase size={20} />, title: "Workforce Development", items: ["Job readiness coaching & resume development", "Interview preparation", "Referrals to certifications (TWIC, OSHA, forklift)", "Job placement through partner employers"] },
                      { icon: <FileText size={20} />, title: "Case Management", items: ["Dedicated case manager assigned", "Personalized Plan of Care", "Data tracking for goals & progress", "Monthly check-ins"] },
                      { icon: <Home size={20} />, title: "Housing Stabilization", items: ["Short-term rental support during instability", "Connection to long-term housing services", "Coordination when critical to family stability"] },
                      { icon: <Brain size={20} />, title: "Mental Health & Wellness", items: ["Culturally appropriate counseling referrals", "Collaboration with trusted providers", "Trauma-informed approaches throughout"] },
                    ].map((card, i) => (
                      <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-[#0F2C5C] rounded-xl flex items-center justify-center text-white">
                            {card.icon}
                          </div>
                          <h4 className="font-bold text-slate-800">{card.title}</h4>
                        </div>
                        <ul className="space-y-1">
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
                </div>
              )}

              {activeTab === 'rfc' && (
                <div className="space-y-6">
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <p className="text-sm"><strong>Program Lead:</strong> Fatherhood Class Coordinator | <strong>Sessions:</strong> 14 Required | <strong>Facilitators:</strong> Certified</p>
                  </div>
                  <p className="text-slate-600">
                    The Responsible Fatherhood Class equips fathers and father figures with the knowledge, emotional tools, and support systems they need to be present, consistent, and impactful in their children's lives.
                  </p>
                  <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
                    <h4 className="font-bold text-slate-800 mb-3">Attendance & Graduation Requirements</h4>
                    <ul className="space-y-2">
                      {[
                        "Fathers must attend and be engaged in all 14 sessions to graduate",
                        "Attendance is tracked weekly and logged",
                        "No partial completions or substitutions accepted",
                        "Graduates receive a Certificate of Completion and recognition event invitation"
                      ].map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                          <CheckCircle size={16} className="text-emerald-500" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === 'services' && (
                <div className="space-y-4">
                  <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
                    <h4 className="font-bold text-slate-800 mb-3">Daily Needs & Essential Support</h4>
                    <ul className="space-y-2">
                      {[
                        "School supplies, children's clothing, diapers, household essentials",
                        "Document recovery assistance (state IDs, Social Security cards)",
                        "Connection to food drives, seasonal events, and resource distributions"
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                          <ChevronRight size={14} className="text-amber-500 mt-0.5 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CURRICULUM */}
          {activeSection === 'curriculum' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-sm"><strong>Session Structure:</strong> Every session includes a guided discussion prompt, educational instruction, peer-sharing activities, and a personal reflection worksheet.</p>
              </div>

              {['Personal Development', 'Life Skills', 'Responsible Fatherhood', 'Relationships'].map((category, catIndex) => (
                <div key={category}>
                  <h3 className="text-lg font-bold text-slate-800 mb-3">Module {catIndex + 1}: {category}</h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {curriculumModules.filter(m => m.category === category).map(module => (
                      <div key={module.id} className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-[#0F2C5C] hover:shadow-md transition-all">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-7 h-7 bg-[#0F2C5C] text-white rounded-full flex items-center justify-center text-xs font-bold">
                            {module.id}
                          </span>
                          <span className="text-xs text-slate-500 uppercase tracking-wide">{module.category}</span>
                        </div>
                        <p className="text-sm font-semibold text-slate-800">{module.title}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SOPs */}
          {activeSection === 'sops' && (
            <div className="space-y-3 animate-in fade-in duration-300">
              {[
                { id: 'intake', title: '📥 Intake & Case Management', content: 'Fathers may be referred by partners, family, or self-referral. Schedule intake within 3 business days. Complete intake form, obtain consent, conduct needs assessment covering housing, employment, education, legal, mental health, and parenting status.' },
                { id: 'delivery', title: '📋 Program Delivery', content: 'Programs open to all fathers with priority for unemployed, formerly incarcerated, or below ALICE threshold. All participants complete intake assessment. Each father assigned a case manager. Must complete all 14 sessions for certification.' },
                { id: 'data', title: '💾 Data Collection & Management', content: 'Use organization-approved case management system. All data confidential with authorized access only. Enter notes within 3 business days. Monthly quality checks for funder reporting.' },
                { id: 'tech', title: '🔐 Technology & Security', content: 'Only approved staff get system access. Change passwords every 90 days with 2FA. All public content reviewed by Program Manager/Executive Director before publication.' },
                { id: 'facility', title: '🏢 Facility Use & Safety', content: 'Office hours 8am-4pm or by appointment. Report safety incidents immediately. Complete event logistics checklist before hosting events.' },
                { id: 'volunteer', title: '🤝 Volunteer & Partner Management', content: 'All volunteers complete orientation and sign confidentiality agreement. Partners require signed MOU. Vendor invoices paid within 15 days.' },
              ].map(sop => (
                <div key={sop.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <button
                    onClick={() => toggleAccordion(sop.id)}
                    className={`w-full flex items-center justify-between p-4 text-left font-bold transition-all ${
                      expandedAccordions.includes(sop.id) ? 'bg-[#0F2C5C] text-white' : 'text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <span>{sop.title}</span>
                    <ChevronDown size={18} className={`transition-transform ${expandedAccordions.includes(sop.id) ? 'rotate-180' : ''}`} />
                  </button>
                  {expandedAccordions.includes(sop.id) && (
                    <div className="p-4 border-t border-slate-200 text-sm text-slate-600">
                      {sop.content}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* POLICIES */}
          {activeSection === 'policies' && (
            <div className="space-y-3 animate-in fade-in duration-300">
              {[
                { id: 'data', title: '🔒 Data Protection & Confidentiality', content: 'All records stored securely. Only authorized staff access data (reviewed quarterly). Paper records digitized within 5 days. No external sharing without consent. Report breaches immediately.' },
                { id: 'safety', title: '⚠️ Safety & Incident Reporting', content: 'Safety orientation for all new staff. Review facilities for risks. Report incidents within 24 hours using Incident Report Form. Maintain emergency contacts for all participants.' },
                { id: 'volunteer', title: '👥 Volunteer & Intern Engagement', content: 'Orientation required before service. Supervisor assigned for oversight. Sign Confidentiality Agreement and Code of Conduct. Track volunteer hours for in-kind reporting.' },
                { id: 'financial', title: '💰 Financial Policies', content: 'Board provides fiscal oversight. Monthly financial reviews. Expense approval: Up to $500 (Program Manager), $500-$2,500 (Executive Director), Over $2,500 (Board). Records retained 7 years. Annual audit if >$750K federal funds.' },
                { id: 'conflict', title: '⚖️ Conflict of Interest', content: 'Annual disclosure forms for board and senior staff. No self-dealing or nepotism. Document recusals. Periodic review by Governance Committee.' },
              ].map(policy => (
                <div key={policy.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <button
                    onClick={() => toggleAccordion(policy.id)}
                    className={`w-full flex items-center justify-between p-4 text-left font-bold transition-all ${
                      expandedAccordions.includes(policy.id) ? 'bg-[#0F2C5C] text-white' : 'text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <span>{policy.title}</span>
                    <ChevronDown size={18} className={`transition-transform ${expandedAccordions.includes(policy.id) ? 'rotate-180' : ''}`} />
                  </button>
                  {expandedAccordions.includes(policy.id) && (
                    <div className="p-4 border-t border-slate-200 text-sm text-slate-600">
                      {policy.content}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* COMPLIANCE */}
          {activeSection === 'compliance' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-wrap gap-2">
                {['501(c)(3) Status', 'GAAP Compliant', '2 CFR Part 200', 'ADA Compliant', 'Title VI', 'HIPAA Safeguards'].map(badge => (
                  <span key={badge} className="px-3 py-1 bg-emerald-500 text-white rounded-full text-xs font-bold flex items-center gap-1">
                    <CheckCircle size={12} /> {badge}
                  </span>
                ))}
              </div>

              <div className="space-y-3">
                {[
                  { id: 'governance', title: '🏛️ Corporate Governance', content: 'Articles of Incorporation and Bylaws on file with Louisiana Secretary of State. Regular board meetings with quorum compliance. Conflict of Interest and Whistleblower policies reviewed annually.' },
                  { id: 'irs', title: '📋 IRS & Federal Tax', content: '501(c)(3) status in good standing. Annual Form 990 filings. Monitor unrelated business income and lobbying restrictions.' },
                  { id: 'state', title: '🗺️ State & Local (Louisiana)', content: 'Annual nonprofit registration renewals. Payroll compliance with Louisiana Workforce Commission.' },
                  { id: 'gaap', title: '💵 Financial Oversight & GAAP', content: 'GAAP-compliant accounting. QuickBooks Online for audit-ready financials. Monthly budget-to-actual comparisons. Alignment with 2 CFR Part 200.' },
                  { id: 'civil', title: '🤲 Non-Discrimination & Civil Rights', content: 'Full compliance with federal civil rights laws. No discrimination based on race, color, national origin, disability, sex, age, religion, or limited English proficiency. Civil Rights Coordinator: admin@foamla.org' },
                  { id: 'cyber', title: '🖥️ Technology & Cybersecurity', content: 'Data Security Plan in place. MFA enabled across systems. ADA-compliant digital content. Staff cybersecurity training. Annual protocol review.' },
                ].map(item => (
                  <div key={item.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <button
                      onClick={() => toggleAccordion(`comp-${item.id}`)}
                      className={`w-full flex items-center justify-between p-4 text-left font-bold transition-all ${
                        expandedAccordions.includes(`comp-${item.id}`) ? 'bg-[#0F2C5C] text-white' : 'text-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      <span>{item.title}</span>
                      <ChevronDown size={18} className={`transition-transform ${expandedAccordions.includes(`comp-${item.id}`) ? 'rotate-180' : ''}`} />
                    </button>
                    {expandedAccordions.includes(`comp-${item.id}`) && (
                      <div className="p-4 border-t border-slate-200 text-sm text-slate-600">
                        {item.content}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ROLES */}
          {activeSection === 'roles' && (
            <div className="grid md:grid-cols-2 gap-4 animate-in fade-in duration-300">
              {staffRoles.map((role, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-[#0F2C5C] to-[#1a4178] text-white p-4">
                    <h4 className="font-bold">{role.title}</h4>
                    <p className="text-xs text-indigo-200">{role.dept}</p>
                  </div>
                  <div className="p-4">
                    <ul className="space-y-2">
                      {role.duties.map((duty, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-slate-600">
                          <span className="text-amber-500 mt-1">•</span>
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
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { title: "Voice & Tone", items: ["Tone: Professional, supportive, empowering", "Voice: Father-centered, strengths-based, action-oriented", "Perspective: Use 'we' for FOAM's role", "Avoid: Bureaucratic language, judgmental phrasing"] },
                  { title: "Core Language", items: ["Use 'fathers' or 'father figures' — not 'clients'", "Emphasize engagement, empowerment, support", "Highlight outcomes, impact, partnership", "Use person-first language"] },
                  { title: "Formatting", items: ["Plain, direct headers", "Short paragraphs or bullet points", "Bold for emphasis, not ALL CAPS", "Include Program Name, Date, Version"] },
                  { title: "Inclusive Language", items: ["Use 'all fathers,' 'father-centered,' 'family leadership'", "Reflect diverse backgrounds in storytelling", "Frame participants as capable of growth"] },
                ].map((card, i) => (
                  <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
                    <h4 className="font-bold text-slate-800 mb-3">{card.title}</h4>
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

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                <h4 className="font-bold text-slate-800 mb-3">Official Program Names</h4>
                <div className="flex flex-wrap gap-2">
                  {['Project Family Build', 'Responsible Fatherhood Class', 'Father and Child Bonding Activities', 'Enhancement Workshops'].map(name => (
                    <span key={name} className="px-3 py-1 bg-white rounded-lg text-sm font-semibold text-[#0F2C5C] border border-amber-300">
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#0F2C5C] text-white p-4 flex flex-wrap items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-indigo-300" />
              <span>1120 Government St, Baton Rouge, LA 70802</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={14} className="text-indigo-300" />
              <span>(225) 239-7833</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-indigo-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-widest">Internal Resource</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationalHandbook;
