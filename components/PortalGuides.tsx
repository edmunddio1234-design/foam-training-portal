import React, { useState } from 'react';
import { 
  ArrowLeft, HelpCircle, Search, ChevronRight, ChevronDown,
  Users, Database, FileText, BarChart3, Calendar, CheckSquare,
  Upload, Download, Settings, Bell, Shield, Monitor,
  Smartphone, QrCode, CreditCard, Heart, BookOpen, Play,
  ExternalLink, Copy, CheckCircle2, AlertTriangle, Book
} from 'lucide-react';

interface PortalGuidesProps {
  onBack: () => void;
}

interface GuideResource {
  type: 'video' | 'flipbook';
  title: string;
  url: string;
}

interface Guide {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  resources?: GuideResource[];
  steps: {
    title: string;
    content: string;
    tip?: string;
  }[];
}

const PortalGuides: React.FC<PortalGuidesProps> = ({ onBack }) => {
  const [activeGuide, setActiveGuide] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedStep, setCopiedStep] = useState<string | null>(null);

  const guides: Guide[] = [
    {
      id: 'command-center',
      title: 'Command Center Overview',
      description: 'Navigate the main hub and access all FOAM portals',
      icon: Monitor,
      color: 'slate',
      resources: [
        { type: 'video', title: 'Command Center Video Guide', url: 'https://youtu.be/Fy6iHe__jvs' },
        { type: 'flipbook', title: 'Command Center Flipbook', url: 'https://heyzine.com/flip-book/e7a4eda13a.html' }
      ],
      steps: [
        {
          title: 'Accessing the Command Center',
          content: 'After logging in with your @foamla.org credentials, you\'ll land on the Command Center. This is your main hub for accessing all FOAM portal sections.',
          tip: 'Bookmark the portal URL for quick access.'
        },
        {
          title: 'Understanding the Portal Cards',
          content: 'Each card represents a different portal section:\n• Training Academy - Staff training modules\n• Fatherhood Tracking - Father enrollment & attendance\n• Grant Management - Grant tracking & research\n• Document Library - Google Drive file search\n• Case Manager Portal - Monthly reports & resources\n• Financial Tools - Budget analysis & reporting\n• Assessment Analytics - Class assessment data\n• Donation CRM - Donor & campaign management\n• Documentation Center - Handbooks & guides',
        },
        {
          title: 'Using the AI Chatbot',
          content: 'Click the chat bubble in the bottom right corner to open the AI assistant. Ask questions about any portal feature, request navigation help, or get live statistics about enrollment and grants.',
          tip: 'Try asking "Show me live stats" to see current enrollment numbers.'
        },
        {
          title: 'Logging Out',
          content: 'Click the logout icon (door with arrow) in the top right user panel to securely log out of the Command Center.',
        }
      ]
    },
    {
      id: 'fatherhood-tracker',
      title: 'Fatherhood Tracker',
      description: 'Track father enrollment, attendance, and program progress',
      icon: Users,
      color: 'blue',
      resources: [
        { type: 'video', title: 'Fatherhood Tracker Video Guide', url: 'https://youtu.be/GsPhVn4_-nc' },
        { type: 'flipbook', title: 'Fatherhood Tracker Flipbook', url: 'https://heyzine.com/flip-book/c1ed03ea69.html' }
      ],
      steps: [
        {
          title: 'Accessing the Tracker',
          content: 'From the main portal, click on "Fatherhood Tracking" card. The dashboard will load showing an overview of all enrolled fathers, their progress, and key statistics.',
          tip: 'Use the "Refresh Data" button if you don\'t see recent changes.'
        },
        {
          title: 'Viewing Father Roster',
          content: 'Click "Father Roster" in the left sidebar to see all enrolled fathers. You can search by name, filter by status (Active, At Risk, Graduated, Inactive), and click on any father to see their full profile.',
          tip: 'The search works on first name, last name, and phone number.'
        },
        {
          title: 'Recording Class Attendance',
          content: 'Go to "Class Check-In" in the sidebar. Select the class/module from the dropdown, search for the father, and click "Check In". The system automatically updates their progress and status.',
          tip: 'For in-person classes, use "QR Check-In" to generate a QR code fathers can scan with their phones.'
        },
        {
          title: 'Managing At-Risk Fathers',
          content: 'Click "Lost to Follow-up" to see fathers who haven\'t attended recently. You can view their last activity, contact information, and record outreach attempts.',
          tip: 'Fathers with less than 2 modules and no activity in 2+ weeks are flagged as "At Risk".'
        },
        {
          title: 'Exporting Data',
          content: 'Use "Export Data" to download reports. You can export the full roster, attendance records, or progress reports as Excel or CSV files for grant reporting.',
        }
      ]
    },
    {
      id: 'case-manager',
      title: 'Case Manager Portal',
      description: 'Enter case notes, track services, and manage participant files',
      icon: FileText,
      color: 'emerald',
      resources: [
        { type: 'video', title: 'Case Manager Portal Video Guide', url: 'https://youtu.be/drXNnWmujKU' },
        { type: 'flipbook', title: 'Case Manager Guide Part 1', url: 'https://heyzine.com/flip-book/7c4f85453c.html' },
        { type: 'flipbook', title: 'Case Manager Guide Part 2', url: 'https://heyzine.com/flip-book/90d9cdd166.html' }
      ],
      steps: [
        {
          title: 'Starting a New Case Note',
          content: 'From the Case Manager Portal, click "+ New Entry" or select a participant from the recent list. Fill in the required fields: Date, Participant Name, Service Type, and detailed notes.',
          tip: 'Case notes should be entered within 48 hours of the interaction.'
        },
        {
          title: 'Selecting Service Types',
          content: 'Choose the appropriate service category: Case Management Session, Phone Call, Resource Referral, Crisis Intervention, Home Visit, etc. This helps track service delivery for reporting.',
        },
        {
          title: 'Recording Goals & Progress',
          content: 'Each participant has individualized goals. Use the Goals tab to add new goals, update progress (On Track, Behind, Completed), and document barriers or achievements.',
          tip: 'Link case notes to specific goals when documenting progress.'
        },
        {
          title: 'Submitting Monthly Reports',
          content: 'At month end, go to Reports tab and click "Generate Monthly Report". Review the auto-populated data, add any narrative notes, and submit. Reports sync to the master tracking sheet.',
        }
      ]
    },
    {
      id: 'resource-tracker',
      title: 'Resource Distribution Tracker',
      description: 'Log diapers, transportation, utilities, and other assistance',
      icon: Heart,
      color: 'rose',
      steps: [
        {
          title: 'Logging Diaper Distribution',
          content: 'Click the "Diapers" quick log button on the dashboard. Enter the client name, diaper size, quantity (individual diapers), and packs given. The system calculates totals automatically.',
          tip: 'Standard pack = 20-30 diapers depending on size.'
        },
        {
          title: 'Recording Transportation Assistance',
          content: 'Use "Bus Pass" for CATS passes or "Uber Ride" for ride-share assistance. Include the client name, date, and any reference numbers. Transportation costs are tracked by month.',
        },
        {
          title: 'Utility Payment Assistance',
          content: 'For water or electric bill help, click the appropriate button. Enter client name, amount paid, utility account reference, and upload any receipts. This tracks against grant budgets.',
          tip: 'Always get a receipt or confirmation number for utility payments.'
        },
        {
          title: 'Viewing Distribution Reports',
          content: 'The dashboard shows totals by category, month, and year-to-date. Use the Trends tab to see distribution patterns and identify high-need areas.',
        }
      ]
    },
    {
      id: 'grant-management',
      title: 'Grant Management Portal',
      description: 'Track grants, deadlines, and research funding opportunities',
      icon: CreditCard,
      color: 'amber',
      resources: [
        { type: 'video', title: 'Grant Management Video Guide', url: 'https://youtu.be/_yR576N0GTA' },
        { type: 'flipbook', title: 'Grant Management Flipbook', url: 'https://heyzine.com/flip-book/97033098e4.html' }
      ],
      steps: [
        {
          title: 'Accessing Grant Management',
          content: 'The Grant Management portal requires login with your @foamla.org credentials. Click "Grant Management" tab to see all active and pending grants with deadlines, amounts, and status.',
          tip: 'Set up calendar reminders for grant deadlines - the system shows days remaining.'
        },
        {
          title: 'Viewing the Grant Dashboard',
          content: 'The dashboard shows key metrics: total grants, pending applications, success rate, and upcoming deadlines. Use the pipeline view to see grants by stage (Researching, Writing, Submitted, etc.).',
        },
        {
          title: 'Using Funding Research Tools',
          content: 'The "Funding Research" tab provides links to research databases:\n• Seamless.AI - Foundation contact research\n• Cause IQ - Nonprofit funding data\n• IRS 990 Finder - Tax return research\n• Candid/Foundation Directory - Grant opportunities',
        },
        {
          title: 'Adding New Grants',
          content: 'Click "+ Add Grant" to track a new opportunity. Enter funder name, amount, deadline, status, and any notes. The system will track it through your pipeline.',
        }
      ]
    },
    {
      id: 'document-library',
      title: 'Document Library',
      description: 'Search and access organizational documents from Google Drive',
      icon: Database,
      color: 'blue',
      resources: [
        { type: 'flipbook', title: 'Document Library Flipbook', url: 'https://heyzine.com/flip-book/39e865ecfa.html' }
      ],
      steps: [
        {
          title: 'Searching for Documents',
          content: 'Use the search bar at the top to find documents by keyword. The AI-powered search looks through file names, folder names, and document content.',
          tip: 'Be specific in searches - try "LCTF 2025 budget" instead of just "budget".'
        },
        {
          title: 'Browsing Folders',
          content: 'Click "Browse Folders" to navigate the Google Drive folder structure manually. Click folder names to drill down, use breadcrumbs to go back up.',
        },
        {
          title: 'Opening Documents',
          content: 'Click on any document to open it directly in Google Drive. You can view, edit (if you have permission), download, or share from there.',
        },
        {
          title: 'Recent Files',
          content: 'The "Recent" tab shows files you\'ve accessed recently for quick re-access.',
        }
      ]
    },
    {
      id: 'financial-tools',
      title: 'Financial Tools',
      description: 'Analyze budgets, track expenses, and generate funder reports',
      icon: BarChart3,
      color: 'green',
      resources: [
        { type: 'video', title: 'Financial Tools Video Guide', url: 'https://youtu.be/RBjCTwG3UiM' },
        { type: 'flipbook', title: 'Financial Tools Flipbook', url: 'https://heyzine.com/flip-book/e126cf4f31.html' }
      ],
      steps: [
        {
          title: 'Accessing Financial Tools',
          content: 'Click "Financial Tools" from the Command Center. Enter your finance credentials when prompted. The dashboard shows budget vs. actual spending across all funding sources.',
          tip: 'Run funder reports monthly for compliance tracking.'
        },
        {
          title: 'Using Budget Analysis',
          content: 'The Analysis tab shows spending by category, trends over time, and budget utilization percentages. Click on any category to drill down into individual transactions.',
        },
        {
          title: 'Managing the Ledger',
          content: 'The Ledger tab shows all transactions. You can filter by date, category, funder, or vendor. Add new entries, edit existing ones, or export for external reporting.',
        },
        {
          title: 'Generating Funder Reports',
          content: 'Go to Reports tab and select a funder. The system generates a formatted report showing expenses charged to that grant, organized by budget category.',
        },
        {
          title: 'Multi-Funder Dashboard',
          content: 'The Multi-Funder tab provides a comparison view across all funding sources, showing which grants are over/under budget and overall financial health.',
        }
      ]
    },
    {
      id: 'assessment-analytics',
      title: 'Assessment Analytics',
      description: 'View class assessment trends and outcome data',
      icon: BarChart3,
      color: 'purple',
      resources: [
        { type: 'video', title: 'Assessment Analytics Video Guide', url: 'https://youtu.be/sCZLj6c-lA8' },
        { type: 'flipbook', title: 'Assessment Analytics Flipbook', url: 'https://heyzine.com/flip-book/1fd086df98.html' }
      ],
      steps: [
        {
          title: 'Accessing Assessment Analytics',
          content: 'Click "Assessment Analytics" from the Command Center. The dashboard loads with overview statistics including total assessments, average scores, and improvement rates.',
        },
        {
          title: 'Viewing Assessment Trends',
          content: 'The trends chart shows assessment scores over time. Filter by date range, cohort, or specific module to see patterns in participant learning.',
          tip: 'Compare pre/post assessment scores to demonstrate program impact for grant reports.'
        },
        {
          title: 'Module Performance Reports',
          content: 'See which modules have the highest and lowest scores. This helps identify curriculum areas that may need additional support or modification.',
        },
        {
          title: 'Father Follow-up Tracking',
          content: 'Track which fathers need follow-up based on their assessment scores. Low scores may indicate need for additional support or one-on-one coaching.',
        },
        {
          title: 'Exporting Reports',
          content: 'Use the export function to download assessment data for grant reporting. Reports can be generated by date range, cohort, or individual participant.',
        }
      ]
    },
    {
      id: 'qr-checkin',
      title: 'QR Code Check-In System',
      description: 'Set up and use QR codes for class attendance',
      icon: QrCode,
      color: 'cyan',
      resources: [
        { type: 'video', title: 'Fatherhood Tracker Video Guide', url: 'https://youtu.be/GsPhVn4_-nc' },
        { type: 'flipbook', title: 'Fatherhood Tracker Flipbook', url: 'https://heyzine.com/flip-book/c1ed03ea69.html' }
      ],
      steps: [
        {
          title: 'Generating a Class QR Code',
          content: 'In Fatherhood Tracker, click "QR Check-In" in the sidebar. Select the current module/class from the dropdown. A unique QR code is generated that links to that specific class.',
          tip: 'Display the QR code on a TV or projector at the start of class.'
        },
        {
          title: 'How Fathers Check In',
          content: 'Fathers open their phone camera, point it at the QR code, and tap the link that appears. They enter their name or phone number, confirm their identity, and tap "Check In". They see a success screen with their updated progress.',
        },
        {
          title: 'Handling Check-In Issues',
          content: 'If a father\'s phone can\'t scan QR codes, they can use the direct link (copy it from the QR page). If someone checks in to the wrong class, use manual check-in to correct it.',
          tip: 'Test the QR code yourself before class to ensure it\'s working.'
        },
        {
          title: 'Viewing Check-In History',
          content: 'After class, go to the Dashboard to see who checked in. The system shows the timestamp and method (QR vs Manual) for each check-in.',
        }
      ]
    },
    {
      id: 'donations',
      title: 'Donation CRM',
      description: 'Track donors, record donations, and manage campaigns',
      icon: Heart,
      color: 'pink',
      resources: [
        { type: 'video', title: 'Donor CRM Video Guide', url: 'https://youtu.be/slGXEE-dOdw' },
        { type: 'flipbook', title: 'Donor CRM Flipbook', url: 'https://heyzine.com/flip-book/7187159ec4.html' }
      ],
      steps: [
        {
          title: 'Adding a New Donor',
          content: 'Click "Donors" tab then "+ Add Donor". Enter their name, contact info, and donor type (Individual, Corporate, Foundation, etc.). The system tracks their giving history automatically.',
        },
        {
          title: 'Recording a Donation',
          content: 'Click "Quick Donation" or go to Donations tab. Select the donor, enter amount, date, payment method, and optionally assign to a campaign. A receipt number is generated automatically.',
          tip: 'Mark "Recurring" for monthly/quarterly donors to track retention.'
        },
        {
          title: 'Managing Campaigns',
          content: 'Create fundraising campaigns with goals and deadlines. As donations come in assigned to that campaign, the progress bar updates. View all campaign performance in the Campaigns tab.',
        },
        {
          title: 'Generating Reports',
          content: 'The Reports tab provides donation summaries by time period, donor tier, campaign, or payment method. Export reports for board meetings or tax documentation.',
        },
        {
          title: 'Donor Acknowledgment',
          content: 'The system flags donations without thank-you letters. Click the envelope icon next to a donation to mark it as acknowledged. Run the "Acknowledgment Status" report to ensure no donors are missed.',
        }
      ]
    },
    {
      id: 'training',
      title: 'Training Academy',
      description: 'Access staff training modules and certifications',
      icon: BookOpen,
      color: 'indigo',
      resources: [
        { type: 'video', title: 'Training Academy Video Guide', url: 'https://youtu.be/UqZrnfrajPc' }
      ],
      steps: [
        {
          title: 'Selecting Your Training Track',
          content: 'After logging in to Training Academy, select your role: Case Manager, Facilitator, or Board Member. Each track has customized modules relevant to your position.',
        },
        {
          title: 'Completing Modules',
          content: 'Work through modules in order. Each includes video content, reading materials, and knowledge checks. Mark lessons complete as you finish them to track your progress.',
          tip: 'You can revisit completed modules anytime for reference.'
        },
        {
          title: 'Using the AI Assistant',
          content: 'Click the robot icon in the bottom right to open the AI Assistant. Ask questions about the training content, request clarification, or get help with quizzes.',
        },
        {
          title: 'Downloading Certificates',
          content: 'After completing all modules in a track, you can download your completion certificate from the final module page.',
        }
      ]
    },
    {
      id: 'troubleshooting',
      title: 'Common Issues & Solutions',
      description: 'Fix common problems with the portal system',
      icon: AlertTriangle,
      color: 'orange',
      steps: [
        {
          title: 'Page Won\'t Load / Stuck on Loading',
          content: '1. Refresh the page (Ctrl+R or Cmd+R)\n2. Clear your browser cache\n3. Try a different browser (Chrome recommended)\n4. Check your internet connection\n5. If still not working, the backend server may be sleeping - wait 30 seconds and try again.',
          tip: 'Render.com servers can take up to 30 seconds to "wake up" after inactivity.'
        },
        {
          title: 'Login Not Working',
          content: '1. Double-check your email spelling\n2. Password is case-sensitive - check caps lock\n3. Make sure you\'re using @foamla.org email\n4. After 5 failed attempts, you\'ll be locked out for 30 seconds\n5. Contact admin@foamla.org if you forgot your password.',
        },
        {
          title: 'Data Not Saving',
          content: '1. Check for error messages (red text)\n2. Make sure all required fields are filled\n3. Don\'t close the browser until you see "Saved" confirmation\n4. If data disappears, refresh and check if it\'s actually there\n5. Report persistent issues with screenshots to admin.',
        },
        {
          title: 'QR Code Not Scanning',
          content: '1. Make sure there\'s enough light on the QR code\n2. Hold phone steady, not too close or far\n3. Clean the phone camera lens\n4. Try using the direct link instead (click "Copy Link" on QR page)\n5. Some older phones may need a QR scanner app.',
        },
        {
          title: 'Report/Export Not Downloading',
          content: '1. Check your browser\'s download settings\n2. Look in your Downloads folder\n3. Try right-click > "Save As" on the download button\n4. Disable popup blockers temporarily\n5. Try a different browser if issue persists.',
        }
      ]
    }
  ];

  const filteredGuides = guides.filter(guide =>
    guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    guide.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; light: string; text: string }> = {
      blue: { bg: 'bg-blue-500', light: 'bg-blue-50', text: 'text-blue-600' },
      emerald: { bg: 'bg-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-600' },
      rose: { bg: 'bg-rose-500', light: 'bg-rose-50', text: 'text-rose-600' },
      purple: { bg: 'bg-purple-500', light: 'bg-purple-50', text: 'text-purple-600' },
      amber: { bg: 'bg-amber-500', light: 'bg-amber-50', text: 'text-amber-600' },
      pink: { bg: 'bg-pink-500', light: 'bg-pink-50', text: 'text-pink-600' },
      indigo: { bg: 'bg-indigo-500', light: 'bg-indigo-50', text: 'text-indigo-600' },
      orange: { bg: 'bg-orange-500', light: 'bg-orange-50', text: 'text-orange-600' },
      slate: { bg: 'bg-slate-600', light: 'bg-slate-50', text: 'text-slate-600' },
      green: { bg: 'bg-green-500', light: 'bg-green-50', text: 'text-green-600' },
      cyan: { bg: 'bg-cyan-500', light: 'bg-cyan-50', text: 'text-cyan-600' },
    };
    return colors[color] || colors.blue;
  };

  const selectedGuide = activeGuide ? guides.find(g => g.id === activeGuide) : null;

  const copyToClipboard = (text: string, stepId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(stepId);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={activeGuide ? () => setActiveGuide(null) : onBack}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">{activeGuide ? 'All Guides' : 'Back'}</span>
          </button>
          
          {!activeGuide && (
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search guides..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {!activeGuide ? (
          <>
            {/* Title */}
            <div className="text-center mb-12">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <HelpCircle className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">Portal Support Guides</h1>
              <p className="text-slate-500">Step-by-step instructions for using FOAM portal features</p>
            </div>

            {/* Guide Cards Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGuides.map(guide => {
                const colors = getColorClasses(guide.color);
                const Icon = guide.icon;
                const hasVideo = guide.resources?.some(r => r.type === 'video');
                const hasFlipbook = guide.resources?.some(r => r.type === 'flipbook');
                return (
                  <button
                    key={guide.id}
                    onClick={() => setActiveGuide(guide.id)}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-lg hover:border-slate-300 transition-all text-left group"
                  >
                    <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-bold text-slate-800 mb-2 group-hover:text-emerald-600 transition-colors">
                      {guide.title}
                    </h3>
                    <p className="text-slate-500 text-sm mb-4">{guide.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
                        <span>{guide.steps.length} steps</span>
                        <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                      {/* Resource indicators */}
                      <div className="flex items-center gap-1.5">
                        {hasVideo && (
                          <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center" title="Video available">
                            <Play className="w-3 h-3 text-red-600" />
                          </div>
                        )}
                        {hasFlipbook && (
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center" title="Flipbook available">
                            <Book className="w-3 h-3 text-blue-600" />
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {filteredGuides.length === 0 && (
              <div className="text-center py-12">
                <p className="text-slate-500">No guides found matching "{searchQuery}"</p>
              </div>
            )}
          </>
        ) : selectedGuide && (
          <>
            {/* Guide Detail View */}
            <div className="max-w-3xl mx-auto">
              {/* Guide Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-14 h-14 ${getColorClasses(selectedGuide.color).bg} rounded-2xl flex items-center justify-center shadow-lg`}>
                  <selectedGuide.icon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-800">{selectedGuide.title}</h1>
                  <p className="text-slate-500">{selectedGuide.description}</p>
                </div>
              </div>

              {/* Resource Links (Video & Flipbook) */}
              {selectedGuide.resources && selectedGuide.resources.length > 0 && (
                <div className="mb-8 bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-6 border border-slate-200">
                  <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    Learning Resources
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {selectedGuide.resources.map((resource, idx) => (
                      <a
                        key={idx}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                          resource.type === 'video'
                            ? 'bg-red-50 border-red-200 hover:bg-red-100 hover:border-red-300'
                            : 'bg-blue-50 border-blue-200 hover:bg-blue-100 hover:border-blue-300'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          resource.type === 'video' ? 'bg-red-500' : 'bg-blue-500'
                        }`}>
                          {resource.type === 'video' ? (
                            <Play className="w-5 h-5 text-white" />
                          ) : (
                            <Book className="w-5 h-5 text-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium text-sm ${
                            resource.type === 'video' ? 'text-red-700' : 'text-blue-700'
                          }`}>
                            {resource.title}
                          </p>
                          <p className={`text-xs ${
                            resource.type === 'video' ? 'text-red-500' : 'text-blue-500'
                          }`}>
                            {resource.type === 'video' ? 'Watch on YouTube' : 'View Flipbook'}
                          </p>
                        </div>
                        <ExternalLink className={`w-4 h-4 ${
                          resource.type === 'video' ? 'text-red-400' : 'text-blue-400'
                        }`} />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Steps */}
              <div className="space-y-6">
                {selectedGuide.steps.map((step, index) => {
                  const colors = getColorClasses(selectedGuide.color);
                  const stepId = `${selectedGuide.id}-${index}`;
                  return (
                    <div key={index} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                      {/* Step Header */}
                      <div className={`${colors.light} px-6 py-4 border-b border-slate-200`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 ${colors.bg} rounded-full flex items-center justify-center`}>
                            <span className="text-white font-bold text-sm">{index + 1}</span>
                          </div>
                          <h3 className={`font-semibold ${colors.text}`}>{step.title}</h3>
                        </div>
                      </div>
                      
                      {/* Step Content */}
                      <div className="p-6">
                        <p className="text-slate-600 whitespace-pre-line leading-relaxed">
                          {step.content}
                        </p>
                        
                        {step.tip && (
                          <div className="mt-4 flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
                            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                            <div>
                              <p className="font-medium text-amber-800 text-sm">Pro Tip</p>
                              <p className="text-amber-700 text-sm">{step.tip}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Back Button */}
              <div className="mt-8 text-center">
                <button
                  onClick={() => setActiveGuide(null)}
                  className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors"
                >
                  ← Back to All Guides
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PortalGuides;
