import React, { useState, useRef, useEffect } from 'react';
import OrganizationalHandbook from './OrganizationalHandbook';

interface HubProps {
  onNavigate: (view: 'training' | 'tracking' | 'admin' | 'casemanager' | 'finance' | 'analytics' | 'documents' | 'donations') => void;
  onLogout: () => void;
}

// ============================================
// FOAM CHATBOT WIDGET COMPONENT
// ============================================
const FOAMChatbotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Array<{role: string; content: string}>>([
    {
      role: 'assistant',
      content: "👋 Hi! I'm your FOAM Portal Assistant. I can help you navigate any portal section, find documents, or explain features.\n\nWhat would you like help with?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Portal Knowledge Base
  const knowledge: Record<string, any> = {
    'training academy': {
      title: 'Training Academy',
      icon: '📚',
      description: 'Access certification modules, case study deep dives, and program orientation.',
      features: [
        '12+ training modules with video lessons',
        'Interactive quizzes and assessments',
        'Downloadable slides and handouts',
        'AI Chat for module-specific questions',
        'Progress tracking and certificates'
      ],
      howTo: [
        'Click Training Academy from Command Center',
        'Enter your @foamla.org credentials if prompted',
        'Select your training track (Case Manager, Facilitator, Board)',
        'Click on a module to begin',
        'Watch video, then complete quiz'
      ],
      tip: 'Complete modules in order for best understanding.'
    },
    'fatherhood tracking': {
      title: 'Fatherhood Tracking',
      icon: '📈',
      description: 'Monitor client progress through Fatherhood Classes and workforce placement.',
      features: [
        'Dashboard with enrollment overview',
        'Father roster with search/filter',
        'Manual and QR code check-in',
        'Father-facing progress portal',
        'Import/Export capabilities',
        'Lost to follow-up tracking'
      ],
      howTo: [
        'Click Fatherhood Tracking from Command Center',
        'Use Dashboard for quick overview',
        'Click Roster to see all enrolled fathers',
        'Use Check-In during or after each class',
        'Export reports for funder compliance'
      ],
      tip: 'Check fathers in immediately after class for accurate records.'
    },
    'grant management': {
      title: 'Grant Management',
      icon: '💰',
      description: 'Grant tracking & management, application status dashboard, and funding research tools.',
      features: [
        'Grant tracking dashboard with KPIs',
        'Application status breakdown',
        'Upcoming deadlines calendar',
        'Grant pipeline (kanban view)',
        'Funding research tools (Seamless.AI, Cause IQ, IRS 990, Candid)'
      ],
      howTo: [
        'Click Grant Management from Command Center',
        'Review Dashboard for current status',
        'Check Upcoming Deadlines weekly',
        'Use Research Tools for new opportunities',
        'Add new grants as you identify them'
      ],
      tip: 'Set calendar reminders for deadlines.'
    },
    'document library': {
      title: 'Document Library',
      icon: '📁',
      description: 'AI-powered document search with Google Drive integration and quick file access.',
      features: [
        'AI-powered natural language search',
        'Google Drive integration',
        'Browse folder structure',
        'Filter by file type',
        'Recent files quick access'
      ],
      howTo: [
        'Click Document Library from Command Center',
        'Type what you need in the search bar',
        'Or browse folders manually',
        'Click a document to open in Google Drive'
      ],
      tip: 'Be specific in searches for better results.'
    },
    'case manager portal': {
      title: 'Case Manager Portal',
      icon: '📋',
      description: 'Monthly reports, procedures & resources, and forms & documents for case managers.',
      features: [
        'Monthly report submission (5 types)',
        'Resource directory by category',
        'Forms and document templates',
        'Interactive training manual',
        'New client onboarding checklist'
      ],
      reportTypes: ['Assessment Summary', 'Referral Tracker', 'Activity Log', 'Outcome Tracking', 'Caseload Summary'],
      howTo: [
        'Click Case Manager Portal from Command Center',
        'Use Monthly Reports tab to enter data',
        'Access Resources when making referrals',
        'Follow New Client Checklist for enrollments'
      ],
      tip: 'Reports are due by the 5th of each month.'
    },
    'financial tools': {
      title: 'Financial Tools',
      icon: '💵',
      description: 'Analyze budgets, reports, invoicing, and grant tracking.',
      features: [
        'Budget vs. actual analysis',
        'Transaction ledger',
        'Funder-specific reports',
        'Multi-funder comparison',
        'Invoice registry and tracking'
      ],
      howTo: [
        'Click Financial Tools from Command Center',
        'Use Budget Analysis for spending overview',
        'Run Funder Reports for compliance',
        'Check Invoice Registry for pending bills'
      ],
      tip: 'Run funder reports monthly for compliance.'
    },
    'assessment analytics': {
      title: 'Assessment Analytics',
      icon: '📊',
      description: 'Class assessment trends, module performance reports, and father follow-up tracking.',
      features: [
        'Class assessment trend analysis',
        'Module performance reports',
        'Father follow-up tracking',
        'Export and reporting tools',
        'Pre vs. post comparisons'
      ],
      howTo: [
        'Click Assessment Analytics from Command Center',
        'Select date range for analysis',
        'Choose specific cohort or view all',
        'Export visualizations for reports'
      ],
      tip: 'Compare pre/post assessments for grant reporting.'
    },
    'donation crm': {
      title: 'Donation CRM',
      icon: '❤️',
      description: 'Track donors, donations, and fundraising campaigns.',
      features: [
        'Donor database management',
        'Donation tracking and history',
        'Tier-based donor classification',
        'Campaign management',
        'Automated thank-you emails'
      ],
      howTo: [
        'Click Donation CRM from Command Center',
        'Add new donors as they contribute',
        'Track donation amounts and dates',
        'Manage fundraising campaigns'
      ],
      tip: 'Update donor info promptly and log all communications.'
    },
    'organizational handbook': {
      title: 'Organizational Handbook',
      icon: '📖',
      description: 'Policies & Procedures, 14-Module Curriculum, Staff Roles & SOPs, Compliance & Style Guide.',
      features: [
        'Complete policies and procedures',
        '14-module curriculum details',
        'Staff roles and SOPs',
        'Compliance requirements',
        'Searchable content'
      ],
      howTo: [
        'Click Organizational Handbook from Command Center',
        'Use the search bar to find specific topics',
        'Navigate sections using the sidebar',
        'Click expandable items for detailed content'
      ],
      tip: 'Search is faster than navigating.'
    },
    '14 modules': {
      title: '14-Module Fatherhood Curriculum',
      description: 'The complete NPCL curriculum for Responsible Fatherhood:',
      list: [
        'Module 1: Orientation',
        'Module 2: Manhood to Fatherhood',
        'Module 3: Effective Communication',
        'Module 4: Active Listening',
        'Module 5: Anger Management',
        'Module 6: Co-Parenting',
        'Module 7: Child Development',
        'Module 8: Discipline vs. Punishment',
        'Module 9: Financial Literacy',
        'Module 10: Healthy Relationships',
        'Module 11: Father-Child Activities',
        'Module 12: Legal Rights',
        'Module 13: Workforce Readiness',
        'Module 14: Graduation & Goal Setting'
      ],
      tip: 'Track father progress in the Fatherhood Tracking portal.'
    },
    'new client checklist': {
      title: 'New Client Onboarding Checklist',
      description: 'This 6-phase checklist ensures no steps are missed:',
      phases: [
        { name: 'Phase 1: Initial Contact', steps: ['Receive referral', 'Call within 24 hours', 'Schedule intake', 'Send reminder'] },
        { name: 'Phase 2: Intake Assessment', steps: ['Complete demographics', 'Needs assessment', 'AAPI screening', 'Depression screening'] },
        { name: 'Phase 3: Service Planning', steps: ['Develop service plan', 'Set SMART goals', 'Identify barriers', 'Schedule follow-ups'] },
        { name: 'Phase 4: Program Enrollment', steps: ['Enroll in classes', 'Register in EmpowerDB', 'Assign to cohort', 'Provide materials'] },
        { name: 'Phase 5: Documentation', steps: ['Upload consent forms', 'File ROI', 'Create case folder', 'Enter in all systems'] },
        { name: 'Phase 6: Engagement', steps: ['Send welcome message', 'Schedule home visit', 'Connect with mentor', 'Add to comm list'] }
      ],
      tip: 'Access the interactive checklist in the Case Manager Portal!'
    },
    'check in': {
      title: 'Class Check-In Options',
      description: 'Two ways to record attendance:',
      options: [
        { name: 'Manual Check-In', steps: ['Go to Fatherhood Tracking → Check-In', 'Select class date', 'Mark fathers present', 'Click Save'] },
        { name: 'QR Code Self-Service', steps: ['Go to Fatherhood Tracking → QR Check-In', 'Generate QR code for class', 'Display on screen', 'Fathers scan to check in'] }
      ],
      tip: 'QR works best for large classes!'
    }
  };

  // Quick action buttons
  const quickActions = [
    { label: 'Training', key: 'training academy', color: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100' },
    { label: 'Tracking', key: 'fatherhood tracking', color: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' },
    { label: 'Grants', key: 'grant management', color: 'bg-amber-50 text-amber-600 hover:bg-amber-100' },
    { label: 'Case Mgr', key: 'case manager portal', color: 'bg-teal-50 text-teal-600 hover:bg-teal-100' },
    { label: '14 Modules', key: '14 modules', color: 'bg-purple-50 text-purple-600 hover:bg-purple-100' },
    { label: 'Checklist', key: 'new client checklist', color: 'bg-rose-50 text-rose-600 hover:bg-rose-100' }
  ];

  // Format response from knowledge base
  const formatResponse = (data: any): string => {
    let html = `**${data.title}**\n\n`;
    html += `${data.description}\n\n`;
    
    if (data.features) {
      html += `**Key Features:**\n`;
      data.features.forEach((f: string) => html += `• ${f}\n`);
    }
    
    if (data.list) {
      data.list.forEach((item: string) => html += `${item}\n`);
    }
    
    if (data.phases) {
      data.phases.forEach((phase: any) => {
        html += `\n**${phase.name}**\n`;
        phase.steps.forEach((s: string) => html += `☐ ${s}\n`);
      });
    }
    
    if (data.options) {
      data.options.forEach((opt: any) => {
        html += `\n**${opt.name}:**\n`;
        opt.steps.forEach((s: string, i: number) => html += `${i+1}. ${s}\n`);
      });
    }
    
    if (data.howTo) {
      html += `\n**How to Use:**\n`;
      data.howTo.forEach((s: string, i: number) => html += `${i+1}. ${s}\n`);
    }
    
    if (data.tip) {
      html += `\n💡 ${data.tip}`;
    }
    
    return html;
  };

  // Generate response based on user query
  const getResponse = (query: string): string => {
    const lower = query.toLowerCase();
    
    for (const [key, data] of Object.entries(knowledge)) {
      if (lower.includes(key)) {
        return formatResponse(data);
      }
    }
    
    // Check for partial matches
    if (lower.includes('training')) return formatResponse(knowledge['training academy']);
    if (lower.includes('tracking') || lower.includes('father')) return formatResponse(knowledge['fatherhood tracking']);
    if (lower.includes('grant') || lower.includes('funding')) return formatResponse(knowledge['grant management']);
    if (lower.includes('document') || lower.includes('file') || lower.includes('search')) return formatResponse(knowledge['document library']);
    if (lower.includes('case') || lower.includes('report')) return formatResponse(knowledge['case manager portal']);
    if (lower.includes('finance') || lower.includes('budget') || lower.includes('money')) return formatResponse(knowledge['financial tools']);
    if (lower.includes('assessment') || lower.includes('analytics')) return formatResponse(knowledge['assessment analytics']);
    if (lower.includes('donat') || lower.includes('donor') || lower.includes('fundrais')) return formatResponse(knowledge['donation crm']);
    if (lower.includes('handbook') || lower.includes('policy') || lower.includes('procedure')) return formatResponse(knowledge['organizational handbook']);
    if (lower.includes('module') || lower.includes('curriculum') || lower.includes('14')) return formatResponse(knowledge['14 modules']);
    if (lower.includes('checklist') || lower.includes('new client') || lower.includes('onboard')) return formatResponse(knowledge['new client checklist']);
    if (lower.includes('check in') || lower.includes('check-in') || lower.includes('attendance') || lower.includes('qr')) return formatResponse(knowledge['check in']);
    
    // Default response
    return `I can help with any portal section! Try asking about:\n\n• Training Academy\n• Fatherhood Tracking\n• Grant Management\n• Case Manager Portal\n• Document Library\n• Financial Tools\n• Assessment Analytics\n• Donation CRM\n• The 14 modules\n• New client checklist\n\nOr click a quick action button above!`;
  };

  // Send message
  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setShowQuickActions(false);
    setIsTyping(true);
    
    setTimeout(() => {
      const response = getResponse(input);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      setIsTyping(false);
    }, 600);
  };

  // Handle quick action click
  const handleQuickAction = (key: string) => {
    const query = `Tell me about ${key}`;
    setMessages(prev => [...prev, { role: 'user', content: query }]);
    setShowQuickActions(false);
    setIsTyping(true);
    
    setTimeout(() => {
      const response = formatResponse(knowledge[key]);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      setIsTyping(false);
    }, 600);
  };

  // Render message content with formatting
  const renderMessage = (content: string) => {
    return content.split('\n').map((line, i) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={i} className="font-bold text-slate-900 mb-1">{line.replace(/\*\*/g, '')}</p>;
      }
      if (line.startsWith('**') && line.includes(':**')) {
        const parts = line.split(':**');
        return (
          <p key={i} className="mb-1">
            <strong className="text-slate-800">{parts[0].replace(/\*\*/g, '')}:</strong>
            {parts.slice(1).join(':**')}
          </p>
        );
      }
      if (line.startsWith('• ') || line.startsWith('☐ ')) {
        return <p key={i} className="ml-2 mb-0.5 text-slate-600">{line}</p>;
      }
      if (line.match(/^\d+\. /)) {
        return <p key={i} className="ml-2 mb-0.5 text-slate-600">{line}</p>;
      }
      if (line.startsWith('💡')) {
        return <p key={i} className="mt-2 text-amber-600 text-xs bg-amber-50 p-2 rounded-lg">{line}</p>;
      }
      if (line.trim() === '') return <br key={i} />;
      return <p key={i} className="mb-1 text-slate-600">{line}</p>;
    });
  };

  // Floating button when closed
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-[#0F2C5C] to-[#1a4380] text-white rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 flex items-center justify-center z-50 group"
        title="Open FOAM Portal Assistant"
      >
        <i className="fas fa-comment-dots text-2xl group-hover:scale-110 transition-transform"></i>
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full animate-pulse"></span>
      </button>
    );
  }

  // Chat widget when open
  return (
    <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${isMinimized ? 'w-80' : 'w-96'}`}>
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0F2C5C] to-[#1a4380] text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <i className="fas fa-robot text-lg"></i>
              </div>
              <div>
                <h3 className="font-bold text-sm">FOAM Portal Assistant</h3>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                  <span className="text-xs text-white/70">Online</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                title={isMinimized ? "Expand" : "Minimize"}
              >
                <i className={`fas ${isMinimized ? 'fa-expand' : 'fa-minus'} text-sm`}></i>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                title="Close"
              >
                <i className="fas fa-times text-sm"></i>
              </button>
            </div>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="h-80 overflow-y-auto p-4 space-y-3 bg-slate-50">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] ${
                    msg.role === 'user'
                      ? 'bg-[#0F2C5C] text-white rounded-2xl rounded-br-md'
                      : 'bg-white text-slate-700 rounded-2xl rounded-bl-md border border-slate-200'
                  } p-3 shadow-sm`}>
                    <div className="text-sm">
                      {msg.role === 'user' ? msg.content : renderMessage(msg.content)}
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white rounded-2xl rounded-bl-md p-3 border border-slate-200 shadow-sm">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            {showQuickActions && messages.length <= 2 && (
              <div className="px-4 py-2 border-t border-slate-100 bg-white">
                <p className="text-xs text-slate-400 mb-2 font-medium">Quick Actions</p>
                <div className="flex flex-wrap gap-1.5">
                  {quickActions.map((action, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuickAction(action.key)}
                      className={`text-xs px-2.5 py-1.5 rounded-full transition-colors font-medium ${action.color}`}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-3 border-t border-slate-100 bg-white">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask about any portal..."
                  className="flex-1 bg-slate-100 border-0 rounded-xl px-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F2C5C]/20"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="bg-[#0F2C5C] hover:bg-[#1a4380] disabled:opacity-50 disabled:cursor-not-allowed text-white p-2.5 rounded-xl transition-colors"
                  title="Send"
                >
                  <i className="fas fa-paper-plane text-sm"></i>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ============================================
// MAIN HUB COMPONENT
// ============================================
const Hub: React.FC<HubProps> = ({ onNavigate, onLogout }) => {
  const [showHandbook, setShowHandbook] = useState(false);

  const portals = [
    {
      id: 'training',
      title: 'Training Academy',
      description: 'Access certification modules, case study deep dives, and program orientation.',
      icon: 'fa-graduation-cap',
      color: 'bg-indigo-600',
      shadow: 'shadow-indigo-200'
    },
    {
      id: 'tracking',
      title: 'Fatherhood Tracking',
      description: 'Monitor client progress through Fatherhood Classes and workforce placement.',
      icon: 'fa-chart-line',
      color: 'bg-emerald-600',
      shadow: 'shadow-emerald-200'
    },
    {
      id: 'admin',
      title: 'Grant Management',
      description: 'Track grants, manage applications, research funding opportunities.',
      icon: 'fa-hand-holding-usd',
      color: 'bg-amber-600',
      shadow: 'shadow-amber-200'
    },
    {
      id: 'documents',
      title: 'Document Library',
      description: 'Search and access all organizational documents from Google Drive.',
      icon: 'fa-folder-open',
      color: 'bg-blue-600',
      shadow: 'shadow-blue-200'
    },
    {
      id: 'casemanager',
      title: 'Case Manager Portal',
      description: 'Monthly reports, procedures & resources, forms and documents for case managers.',
      icon: 'fa-clipboard-list',
      color: 'bg-teal-600',
      shadow: 'shadow-teal-200'
    },
    {
      id: 'finance',
      title: 'Financial Tools',
      description: 'Analyze budgets • Analyze reports • Invoicing • Grant tracking of budgets',
      icon: 'fa-file-invoice-dollar',
      color: 'bg-[#1A4D2E]',
      shadow: 'shadow-emerald-100'
    },
    {
      id: 'analytics',
      title: 'Assessment Analytics',
      description: 'Post-class assessment insights, trends, and follow-up tracking.',
      icon: 'fa-chart-pie',
      color: 'bg-purple-600',
      shadow: 'shadow-purple-200'
    },
    {
      id: 'donations',
      title: 'Donation CRM',
      description: 'Track donors, donations, and fundraising campaigns.',
      icon: 'fa-heart',
      color: 'bg-rose-600',
      shadow: 'shadow-rose-200'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col p-6 md:p-12 animate-in fade-in duration-700">
      {/* Brand Header */}
      <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-[#0F2C5C] text-white rounded-3xl flex items-center justify-center shadow-xl">
            <span className="font-black text-4xl italic tracking-tighter">F</span>
          </div>
          <div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none mb-3">Command Center</h1>
            <div className="space-y-1">
              <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-xs">Fathers On A Mission</p>
              <p className="text-blue-600 font-black uppercase tracking-[0.3em] text-[10px]">FOAM ECOSYSTEM</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
            <i className="fas fa-user-circle text-xl"></i>
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Active Staff</p>
            <p className="text-sm font-bold text-slate-800">Administrator</p>
          </div>
          <button
            onClick={onLogout}
            className="ml-4 p-2 text-slate-300 hover:text-rose-500 transition-colors"
            title="Logout of Command Center"
          >
            <i className="fas fa-sign-out-alt"></i>
          </button>
        </div>
      </div>

      {/* Portal Selection Grid */}
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {portals.map((portal) => (
          <button
            key={portal.id}
            onClick={() => onNavigate(portal.id as any)}
            className="group relative bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100 hover:shadow-2xl hover:border-indigo-100 transition-all duration-500 text-left overflow-hidden flex flex-col justify-between"
          >
            {/* Visual Flare */}
            <div className={`absolute -right-8 -top-8 w-32 h-32 ${portal.color} opacity-5 rounded-full group-hover:scale-150 transition-transform duration-700`}></div>
            
            <div className="space-y-6 relative z-10">
              <div className={`w-16 h-16 ${portal.color} text-white rounded-2xl flex items-center justify-center text-2xl shadow-lg ${portal.shadow} group-hover:rotate-6 transition-transform`}>
                <i className={`fas ${portal.icon}`}></i>
              </div>
              
              <div className="space-y-3">
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">{portal.title}</h2>
                <div className="text-slate-500 font-medium leading-relaxed">
                  {portal.id === 'finance' ? (
                    <ul className="space-y-1">
                      <li className="flex items-center gap-2"><i className="fas fa-check text-[10px] text-emerald-500"></i> Analyze budgets</li>
                      <li className="flex items-center gap-2"><i className="fas fa-check text-[10px] text-emerald-500"></i> Analyze reports</li>
                      <li className="flex items-center gap-2"><i className="fas fa-check text-[10px] text-emerald-500"></i> Invoicing</li>
                      <li className="flex items-center gap-2"><i className="fas fa-check text-[10px] text-emerald-500"></i> Grant tracking of budgets</li>
                    </ul>
                  ) : portal.id === 'casemanager' ? (
                    <ul className="space-y-1">
                      <li className="flex items-center gap-2"><i className="fas fa-check text-[10px] text-teal-500"></i> Monthly reports</li>
                      <li className="flex items-center gap-2"><i className="fas fa-check text-[10px] text-teal-500"></i> Procedures & resources</li>
                      <li className="flex items-center gap-2"><i className="fas fa-check text-[10px] text-teal-500"></i> Forms & documents</li>
                    </ul>
                  ) : portal.id === 'analytics' ? (
                    <ul className="space-y-1">
                      <li className="flex items-center gap-2"><i className="fas fa-check text-[10px] text-purple-500"></i> Class assessment trends</li>
                      <li className="flex items-center gap-2"><i className="fas fa-check text-[10px] text-purple-500"></i> Module performance reports</li>
                      <li className="flex items-center gap-2"><i className="fas fa-check text-[10px] text-purple-500"></i> Father follow-up tracking</li>
                      <li className="flex items-center gap-2"><i className="fas fa-check text-[10px] text-purple-500"></i> Export & reporting tools</li>
                    </ul>
                  ) : portal.id === 'admin' ? (
                    <ul className="space-y-1">
                      <li className="flex items-center gap-2"><i className="fas fa-check text-[10px] text-amber-500"></i> Grant tracking & management</li>
                      <li className="flex items-center gap-2"><i className="fas fa-check text-[10px] text-amber-500"></i> Application status dashboard</li>
                      <li className="flex items-center gap-2"><i className="fas fa-check text-[10px] text-amber-500"></i> Funding research tools</li>
                    </ul>
                  ) : portal.id === 'documents' ? (
                    <ul className="space-y-1">
                      <li className="flex items-center gap-2"><i className="fas fa-check text-[10px] text-blue-500"></i> AI-powered document search</li>
                      <li className="flex items-center gap-2"><i className="fas fa-check text-[10px] text-blue-500"></i> Google Drive integration</li>
                      <li className="flex items-center gap-2"><i className="fas fa-check text-[10px] text-blue-500"></i> Quick file access</li>
                    </ul>
                  ) : (
                    portal.description
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-indigo-600 transition-colors">Access Portal</span>
              <div className="w-8 h-8 rounded-full bg-slate-50 text-slate-300 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <i className="fas fa-chevron-right text-xs"></i>
              </div>
            </div>
          </button>
        ))}

        {/* Handbook Card */}
        <button
          onClick={() => setShowHandbook(true)}
          className="bg-[#0F2C5C] rounded-[3rem] p-10 text-white flex flex-col justify-between relative overflow-hidden group text-left hover:shadow-2xl transition-all duration-500"
        >
          <i className="fas fa-book-open absolute -right-6 -bottom-6 text-[10rem] opacity-5 group-hover:scale-110 transition-transform duration-1000"></i>
          
          <div className="space-y-6 relative z-10">
            <div className="w-16 h-16 bg-indigo-500/30 text-indigo-300 rounded-2xl flex items-center justify-center text-2xl shadow-lg group-hover:rotate-6 transition-transform">
              <i className="fas fa-book-open"></i>
            </div>
            
            <div className="space-y-3">
              <h2 className="text-2xl font-black tracking-tight">Organizational Handbook</h2>
              <ul className="space-y-1 text-indigo-200 font-medium">
                <li className="flex items-center gap-2"><i className="fas fa-check text-[10px] text-indigo-400"></i> Policies & Procedures</li>
                <li className="flex items-center gap-2"><i className="fas fa-check text-[10px] text-indigo-400"></i> 14-Module Curriculum</li>
                <li className="flex items-center gap-2"><i className="fas fa-check text-[10px] text-indigo-400"></i> Staff Roles & SOPs</li>
                <li className="flex items-center gap-2"><i className="fas fa-check text-[10px] text-indigo-400"></i> Compliance & Style Guide</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-white/10 flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-indigo-300 group-hover:text-white transition-colors">Open Handbook</span>
            <div className="w-8 h-8 rounded-full bg-white/10 text-indigo-300 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-all">
              <i className="fas fa-chevron-right text-xs"></i>
            </div>
          </div>
        </button>
      </div>
      
      <div className="max-w-7xl mx-auto w-full flex justify-center pb-12">
        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Secure Network Access Verified
        </p>
      </div>

      {/* Handbook Modal */}
      {showHandbook && (
        <OrganizationalHandbook onClose={() => setShowHandbook(false)} />
      )}

      {/* Chatbot Widget */}
      <FOAMChatbotWidget />
    </div>
  );
};

export default Hub;
