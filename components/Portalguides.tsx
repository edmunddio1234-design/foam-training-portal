import React, { useState } from 'react';
import { 
  ArrowLeft, HelpCircle, Search, ChevronRight, ChevronDown,
  Users, Database, FileText, BarChart3, Calendar, CheckSquare,
  Upload, Download, Settings, Bell, Shield, Monitor,
  Smartphone, QrCode, CreditCard, Heart, BookOpen, Play,
  ExternalLink, Copy, CheckCircle2, AlertTriangle
} from 'lucide-react';

interface PortalGuidesProps {
  onBack: () => void;
}

interface Guide {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
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
      id: 'fatherhood-tracker',
      title: 'Fatherhood Tracker',
      description: 'Track father enrollment, attendance, and program progress',
      icon: Users,
      color: 'blue',
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
      id: 'admin-command',
      title: 'Admin Command Center',
      description: 'Manage grants, documents, and organizational data',
      icon: Settings,
      color: 'purple',
      steps: [
        {
          title: 'Accessing Grant Management',
          content: 'The Admin Command Center requires login with your @foamla.org credentials. Click "Grant Management" tab to see all active and pending grants with deadlines, amounts, and status.',
          tip: 'Set up calendar reminders for grant deadlines - the system shows days remaining.'
        },
        {
          title: 'Using the Document Library',
          content: 'Click "Document Library" to access organizational files stored in Google Drive. You can search by keyword, filter by folder, and download or preview documents directly.',
          tip: 'Use specific keywords like "LCTF 2025" or "budget template" for best results.'
        },
        {
          title: 'Funding Research Tool',
          content: 'The "Funding Research" tab lets you search for new grant opportunities. Enter keywords related to your programs to find relevant funders and their giving patterns.',
        },
        {
          title: 'Running Analytics',
          content: 'Go to "Assessment Analytics" (from main hub) to see participant outcome data, pre/post assessment scores, and program effectiveness metrics.',
        }
      ]
    },
    {
      id: 'qr-checkin',
      title: 'QR Code Check-In System',
      description: 'Set up and use QR codes for class attendance',
      icon: QrCode,
      color: 'amber',
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
      icon: CreditCard,
      color: 'pink',
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
          title: 'Sending Thank You Letters',
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
                    <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
                      <span>{guide.steps.length} steps</span>
                      <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
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
              <div className="flex items-center gap-4 mb-8">
                <div className={`w-14 h-14 ${getColorClasses(selectedGuide.color).bg} rounded-2xl flex items-center justify-center shadow-lg`}>
                  <selectedGuide.icon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-800">{selectedGuide.title}</h1>
                  <p className="text-slate-500">{selectedGuide.description}</p>
                </div>
              </div>

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
