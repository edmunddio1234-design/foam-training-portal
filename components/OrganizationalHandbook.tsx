import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Search, Book, GraduationCap, FileText, Shield, 
  Scale, UserCog, Palette, ChevronDown, ChevronRight, Phone, 
  Mail, MapPin, Heart, Home, Briefcase, Brain, Target, 
  HeartHandshake, Star, CheckCircle, Clock, Users, Award,
  BookOpen, ArrowUp, Sparkles, TrendingUp, Calendar, Lock,
  FileCheck, Building, DollarSign, Zap, Menu, FolderOpen,
  ClipboardList, BarChart3, Gift, Settings, Eye, QrCode,
  Upload, Download, Plus, Edit3, RefreshCw, PieChart,
  CreditCard, Globe, History, Lightbulb, AlertTriangle,
  Play, ExternalLink, HelpCircle, MessageCircle, Bookmark,
  Monitor, ArrowRight, Video, Layers,
  CheckSquare, List, Database, FileDown, Link2, ChevronLeft
} from 'lucide-react';

interface OrganizationalHandbookProps {
  onClose: () => void;
}

type Section = 
  | 'overview' | 'programs' | 'curriculum' | 'sops' | 'policies' | 'compliance' | 'roles' | 'style'
  | 'guide-training' | 'guide-fatherhood' | 'guide-grants' | 'guide-documents' 
  | 'guide-casemanager' | 'guide-finance' | 'guide-analytics' | 'guide-donations' | 'guide-admin';

type ProgramTab = 'pfb' | 'rfc' | 'services';

// ============================================
// PORTAL GUIDE DATA - Centralized Configuration
// ============================================

interface PortalGuideData {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  gradientFrom: string;
  gradientTo: string;
  youtubeVideoId: string;
  flipbookUrl: string;
  quickStats: Array<{ label: string; value: string; icon: React.ReactNode }>;
  features: Array<{ icon: React.ReactNode; title: string; description: string }>;
  steps: Array<{
    number: number;
    title: string;
    description: string;
    substeps?: string[];
    tip?: string;
    warning?: string;
  }>;
  faqs: Array<{ question: string; answer: string }>;
  resources: Array<{ title: string; description: string; type: 'pdf' | 'link' | 'video' | 'template'; url: string }>;
  relatedGuides: string[];
  tips: string[];
  commonIssues: Array<{ issue: string; solution: string }>;
}

const portalGuideData: Record<string, PortalGuideData> = {
  'guide-training': {
    id: 'training',
    title: 'Training Academy',
    subtitle: 'Staff Training & Certification Portal',
    description: 'Access comprehensive training modules, earn certifications, and develop your skills as a FOAM team member. Track your progress through interactive courses designed specifically for fatherhood program staff.',
    icon: <BookOpen size={32} />,
    color: 'indigo',
    gradientFrom: 'from-indigo-600',
    gradientTo: 'to-blue-600',
    youtubeVideoId: 'PLACEHOLDER_VIDEO_ID',
    flipbookUrl: 'https://PLACEHOLDER_FLIPBOOK_URL',
    quickStats: [
      { label: 'Training Modules', value: '12+', icon: <Layers size={18} /> },
      { label: 'Avg. Completion', value: '2 hrs', icon: <Clock size={18} /> },
      { label: 'Pass Rate', value: '80%', icon: <Target size={18} /> },
      { label: 'Certifications', value: '4', icon: <Award size={18} /> },
    ],
    features: [
      { icon: <Video size={20} />, title: 'Video Lessons', description: 'HD video content with expert instructors covering all aspects of fatherhood programming' },
      { icon: <CheckSquare size={20} />, title: 'Interactive Quizzes', description: 'Test your knowledge with quizzes after each module - 80% required to pass' },
      { icon: <Award size={20} />, title: 'Certifications', description: 'Earn official FOAM certifications upon completing training tracks' },
      { icon: <TrendingUp size={20} />, title: 'Progress Tracking', description: 'Monitor your learning journey with detailed progress dashboards' },
      { icon: <MessageCircle size={20} />, title: 'AI Chat Support', description: 'Get instant answers to module-specific questions with AI assistance' },
      { icon: <Download size={20} />, title: 'Downloadable Resources', description: 'Access slides, handouts, and supplementary materials for offline study' },
    ],
    steps: [
      { number: 1, title: 'Access the Training Academy', description: 'Navigate to the Training Academy from the Command Center dashboard.',
        substeps: ['Log in to the FOAM Portal with your @foamla.org credentials', 'From the Command Center, locate the "Training Academy" card', 'Click the card to enter the Training Academy', 'Your assigned courses will appear on your dashboard'],
        tip: 'Bookmark the Training Academy for quick access during your onboarding period.' },
      { number: 2, title: 'Select Your Training Track', description: 'Choose the appropriate training track based on your role at FOAM.',
        substeps: ['Review available tracks: Case Manager, Facilitator, Board Member, or All Staff', 'Click on your assigned track to view required modules', 'Note any prerequisite modules that must be completed first', 'Check estimated completion time for planning purposes'],
        tip: 'Case Managers should complete all tracks for comprehensive understanding.' },
      { number: 3, title: 'Complete Module Content', description: 'Work through video lessons and reading materials at your own pace.',
        substeps: ['Click "Start Module" to begin', 'Watch the full video lesson without skipping', 'Review any supplementary reading materials', 'Download slides/handouts for future reference', 'Take notes on key concepts'],
        warning: 'Progress only saves if you complete the full video. Partial views are not tracked.' },
      { number: 4, title: 'Pass the Assessment', description: 'Complete the quiz at the end of each module with 80% or higher.',
        substeps: ['Click "Take Quiz" when ready', 'Answer all questions - most are multiple choice', 'Submit your quiz for immediate grading', 'If you score below 80%, review the module and retake', 'Unlimited retakes are allowed'],
        tip: 'Review the video sections related to any questions you miss before retaking.' },
      { number: 5, title: 'Earn Your Certification', description: 'Complete all required modules in a track to earn your certification.',
        substeps: ['Monitor your progress on the dashboard', 'Complete all modules in sequence', 'Once all modules show "Complete", your certificate generates automatically', 'Download your certificate from your profile page', 'Certificates are also stored in the Document Library'],
        tip: 'Share your certification achievement with your supervisor for your personnel file.' },
    ],
    faqs: [
      { question: 'How long do I have to complete my training?', answer: 'New staff should complete required training within 30 days of hire. However, the modules remain available for refresher training anytime.' },
      { question: 'Can I retake a quiz if I fail?', answer: 'Yes, you can retake quizzes unlimited times. We recommend reviewing the module content before each retake.' },
      { question: 'Will my progress save if I leave mid-module?', answer: 'Video progress saves automatically. However, quiz progress does not save - you must complete quizzes in one sitting.' },
      { question: 'How do I download my certificate?', answer: 'Go to your Profile page and click "Certificates". All earned certifications are available for download as PDFs.' },
      { question: 'Who do I contact if I have technical issues?', answer: 'Contact admin@foamla.org or use the AI Chat Assistant for immediate troubleshooting help.' },
    ],
    resources: [
      { title: 'Training Schedule Template', description: 'Plan your training completion timeline', type: 'template', url: '#' },
      { title: 'Module Quick Reference Guide', description: 'Summary of all available modules', type: 'pdf', url: '#' },
      { title: 'Training FAQ Document', description: 'Comprehensive FAQ for new trainees', type: 'pdf', url: '#' },
    ],
    relatedGuides: ['guide-fatherhood', 'guide-casemanager', 'guide-documents'],
    tips: ['Complete modules in order for best understanding', 'Set aside dedicated time blocks for uninterrupted learning', 'Take notes - they help with quiz preparation', 'Use the AI Chat for clarification on any concepts'],
    commonIssues: [
      { issue: 'Video not playing', solution: 'Check your internet connection and try refreshing the page. Clear browser cache if issue persists.' },
      { issue: 'Quiz not submitting', solution: 'Ensure all questions are answered. Check for stable internet connection before submitting.' },
      { issue: 'Certificate not generating', solution: 'Verify all modules show "Complete" status. Contact admin if issue persists after 24 hours.' },
    ]
  },
  'guide-fatherhood': {
    id: 'tracking',
    title: 'Fatherhood Tracking',
    subtitle: 'Father Enrollment & Progress Management',
    description: 'Monitor and manage father enrollment, track class attendance, record progress through the 14-module curriculum, and generate reports for funders.',
    icon: <Users size={32} />,
    color: 'emerald',
    gradientFrom: 'from-emerald-600',
    gradientTo: 'to-teal-600',
    youtubeVideoId: 'PLACEHOLDER_VIDEO_ID',
    flipbookUrl: 'https://PLACEHOLDER_FLIPBOOK_URL',
    quickStats: [
      { label: 'Active Fathers', value: 'Live', icon: <Users size={18} /> },
      { label: 'Modules', value: '14', icon: <Layers size={18} /> },
      { label: 'Check-In Methods', value: '2', icon: <QrCode size={18} /> },
      { label: 'Export Formats', value: '3', icon: <Download size={18} /> },
    ],
    features: [
      { icon: <BarChart3 size={20} />, title: 'Real-Time Dashboard', description: 'Live statistics on enrollment, graduation rates, and at-risk fathers' },
      { icon: <Users size={20} />, title: 'Father Roster', description: 'Complete database of all enrolled fathers with search and filter' },
      { icon: <CheckSquare size={20} />, title: 'Class Check-In', description: 'Manual attendance tracking for each class session' },
      { icon: <QrCode size={20} />, title: 'QR Self Check-In', description: 'Generate QR codes for fathers to check themselves in' },
      { icon: <Eye size={20} />, title: 'Father Portal', description: 'Individual progress views showing module completion' },
      { icon: <Upload size={20} />, title: 'Bulk Import', description: 'Import father data from Excel or CSV files' },
    ],
    steps: [
      { number: 1, title: 'Enroll a New Father', description: 'Add a new participant to the Fatherhood Program database.',
        substeps: ['Navigate to Fatherhood Tracking from Command Center', 'Click the "Father Roster" tab', 'Click the green "Add Father" button', 'Complete all required fields: Name, DOB, Phone, Email', 'Add optional demographics', 'Set enrollment date and status', 'Click "Save"'],
        tip: 'Gather all intake form data before starting.' },
      { number: 2, title: 'Record Class Attendance', description: 'Mark fathers as present for each class session.',
        substeps: ['Go to the "Class Check-In" tab', 'Select the current class date', 'Check the box next to each present father', 'Add any notes', 'Click "Save Attendance"'],
        warning: 'Always save attendance during or immediately after class.' },
      { number: 3, title: 'Use QR Code Check-In', description: 'Set up self-service check-in for large classes.',
        substeps: ['Navigate to "QR Check-In" tab', 'Click "Generate QR Code"', 'Display on screen or projector', 'Fathers scan with their phone', 'Attendance records automatically'],
        tip: 'QR Check-In works best with 10+ fathers.' },
      { number: 4, title: 'Track Module Progress', description: 'Monitor which modules each father has completed.',
        substeps: ['Click on a father\'s name in the roster', 'View the "Progress" tab', 'See checkmarks for completed modules', 'Check overall completion percentage'],
        tip: 'Fathers need all 14 modules to graduate.' },
      { number: 5, title: 'Export Data for Reporting', description: 'Generate reports for funders.',
        substeps: ['Go to "Export Data" tab', 'Select date range', 'Choose data to include', 'Select format: Excel, CSV, or PDF', 'Click "Generate Export"'],
        tip: 'Run exports monthly for funder reports.' },
    ],
    faqs: [
      { question: 'What\'s the difference between "At Risk" and "Inactive"?', answer: '"At Risk" means missed 2+ consecutive sessions. "Inactive" means no activity for 30+ days.' },
      { question: 'Can I edit a father\'s information?', answer: 'Yes, click their name and use the "Edit" button. All changes are logged.' },
      { question: 'How are graduation rates calculated?', answer: 'Graduation Rate = Fathers completing all 14 modules / Total enrolled 6+ months × 100' },
    ],
    resources: [
      { title: 'Father Intake Form', description: 'Printable enrollment form', type: 'pdf', url: '#' },
      { title: 'Attendance Log Template', description: 'Backup paper log', type: 'template', url: '#' },
      { title: 'Funder Report Template', description: 'Quarterly report format', type: 'template', url: '#' },
    ],
    relatedGuides: ['guide-casemanager', 'guide-analytics', 'guide-training'],
    tips: ['Check fathers in during class, not after', 'Use QR for classes with 10+ participants', 'Review "At Risk" list weekly', 'Export data monthly'],
    commonIssues: [
      { issue: 'QR code not scanning', solution: 'Ensure good lighting and camera app supports QR.' },
      { issue: 'Duplicate records', solution: 'Search before adding. Contact admin to merge duplicates.' },
      { issue: 'Export file empty', solution: 'Verify date range includes data.' },
    ]
  },
  'guide-grants': {
    id: 'grants',
    title: 'Grant Management',
    subtitle: 'Track Grants & Funding Opportunities',
    description: 'Centralized system for tracking grant applications, monitoring deadlines, and researching funding opportunities.',
    icon: <DollarSign size={32} />,
    color: 'amber',
    gradientFrom: 'from-amber-500',
    gradientTo: 'to-orange-500',
    youtubeVideoId: 'PLACEHOLDER_VIDEO_ID',
    flipbookUrl: 'https://PLACEHOLDER_FLIPBOOK_URL',
    quickStats: [
      { label: 'Grant Tracking', value: 'Live', icon: <Database size={18} /> },
      { label: 'Status Types', value: '5', icon: <List size={18} /> },
      { label: 'Research Tools', value: '4', icon: <Search size={18} /> },
      { label: 'Auto-Sync', value: 'Yes', icon: <RefreshCw size={18} /> },
    ],
    features: [
      { icon: <BarChart3 size={20} />, title: 'Grant Dashboard', description: 'Real-time KPIs and success rates' },
      { icon: <Calendar size={20} />, title: 'Deadline Tracking', description: 'Never miss a deadline with reminders' },
      { icon: <List size={20} />, title: 'Status Pipeline', description: 'Track grants through all stages' },
      { icon: <Search size={20} />, title: 'Research Tools', description: 'Seamless.AI, Cause IQ, IRS 990, Candid' },
    ],
    steps: [
      { number: 1, title: 'View the Grant Dashboard', description: 'Understand your funding pipeline.',
        substeps: ['Navigate to Grant Management', 'Review stat cards', 'Check Status Breakdown', 'Note urgent deadlines'],
        tip: 'Check dashboard every Monday.' },
      { number: 2, title: 'Add a New Grant', description: 'Create a record for a new opportunity.',
        substeps: ['Click "Add Grant"', 'Enter Grant Name and Source', 'Set deadline and amounts', 'Click "Add Grant" to save'],
        tip: 'Be specific with grant names.' },
      { number: 3, title: 'Update Grant Status', description: 'Keep records current.',
        substeps: ['Find the grant', 'Click to edit', 'Update status', 'Save changes'],
        warning: 'Update within 24 hours of receiving news.' },
    ],
    faqs: [
      { question: 'How does sync work?', answer: 'Changes sync to Google Sheets automatically. Click Refresh to pull latest.' },
      { question: 'Can I attach documents?', answer: 'Yes, use the Attachments section.' },
    ],
    resources: [
      { title: 'Grant Tracking Sheet', description: 'Master Google Sheet', type: 'link', url: '#' },
      { title: 'Proposal Template', description: 'Standard format', type: 'template', url: '#' },
    ],
    relatedGuides: ['guide-finance', 'guide-documents', 'guide-casemanager'],
    tips: ['Set reminders 2 weeks before deadlines', 'Keep funder contacts updated', 'Document all interactions'],
    commonIssues: [
      { issue: 'Data not syncing', solution: 'Click Refresh. Check internet connection.' },
      { issue: 'Duplicate entries', solution: 'Search before adding. Contact admin to delete.' },
    ]
  },
  'guide-documents': {
    id: 'documents',
    title: 'Document Library',
    subtitle: 'Centralized File Repository',
    description: 'AI-powered document search integrated with Google Drive.',
    icon: <FolderOpen size={32} />,
    color: 'purple',
    gradientFrom: 'from-purple-600',
    gradientTo: 'to-violet-600',
    youtubeVideoId: 'PLACEHOLDER_VIDEO_ID',
    flipbookUrl: 'https://PLACEHOLDER_FLIPBOOK_URL',
    quickStats: [
      { label: 'AI Search', value: 'Yes', icon: <Sparkles size={18} /> },
      { label: 'Categories', value: '6', icon: <FolderOpen size={18} /> },
      { label: 'File Types', value: 'All', icon: <FileText size={18} /> },
      { label: 'Drive Sync', value: 'Live', icon: <RefreshCw size={18} /> },
    ],
    features: [
      { icon: <Sparkles size={20} />, title: 'AI Search', description: 'Natural language search' },
      { icon: <Globe size={20} />, title: 'Google Drive', description: 'Real-time sync' },
      { icon: <FolderOpen size={20} />, title: 'Categories', description: 'Organized folders' },
    ],
    steps: [
      { number: 1, title: 'Search for Documents', description: 'Use natural language search.',
        substeps: ['Type what you need', 'Press Enter', 'Click result to open'],
        tip: 'Be specific in searches.' },
      { number: 2, title: 'Browse by Category', description: 'Navigate folders.',
        substeps: ['Click a category card', 'Browse files', 'Click to open in Drive'] },
    ],
    faqs: [
      { question: 'How does AI search work?', answer: 'It understands natural language and searches titles and content.' },
      { question: 'Can I upload documents?', answer: 'Admin only. Email documents to admin@foamla.org.' },
    ],
    resources: [
      { title: 'Document Request Form', description: 'Request new documents', type: 'template', url: '#' },
    ],
    relatedGuides: ['guide-casemanager', 'guide-grants', 'guide-training'],
    tips: ['Use specific search terms', 'Check "Last Modified" date', 'Bookmark frequently used docs'],
    commonIssues: [
      { issue: 'No search results', solution: 'Try simpler keywords.' },
      { issue: 'Document won\'t open', solution: 'Ensure logged into @foamla.org Google.' },
    ]
  },
  'guide-casemanager': {
    id: 'casemanager',
    title: 'Case Manager Portal',
    subtitle: 'Data Entry & Reporting System',
    description: 'Enter monthly data, generate reports, and track outcomes.',
    icon: <ClipboardList size={32} />,
    color: 'teal',
    gradientFrom: 'from-teal-600',
    gradientTo: 'to-cyan-600',
    youtubeVideoId: 'PLACEHOLDER_VIDEO_ID',
    flipbookUrl: 'https://PLACEHOLDER_FLIPBOOK_URL',
    quickStats: [
      { label: 'Data Entry', value: '2026', icon: <Edit3 size={18} /> },
      { label: 'Report Types', value: '3', icon: <FileText size={18} /> },
      { label: 'Historical Data', value: '2 yrs', icon: <History size={18} /> },
      { label: 'AI Insights', value: 'Yes', icon: <Sparkles size={18} /> },
    ],
    features: [
      { icon: <Edit3 size={20} />, title: 'Data Entry', description: 'Monthly metrics input' },
      { icon: <History size={20} />, title: 'Historical Data', description: '2024-2025 reference' },
      { icon: <FileText size={20} />, title: 'Reports', description: 'AI-powered reports' },
    ],
    steps: [
      { number: 1, title: 'Enter Monthly Data', description: 'Input your metrics.',
        substeps: ['Go to "2026 Data Entry" tab', 'Find current month row', 'Enter data for each column', 'Data saves automatically'],
        tip: 'Enter data weekly.', warning: 'Deadline is the 5th of each month.' },
      { number: 2, title: 'Generate Reports', description: 'Create formatted reports.',
        substeps: ['Go to "Generate Reports"', 'Select type and period', 'Click "Generate"', 'Download Word or PDF'] },
    ],
    faqs: [
      { question: 'What\'s the deadline?', answer: 'Previous month data due by the 5th.' },
      { question: 'What are AI Insights?', answer: 'Automated analysis included in reports.' },
    ],
    resources: [
      { title: 'Metric Definitions', description: 'What each metric means', type: 'pdf', url: '#' },
    ],
    relatedGuides: ['guide-fatherhood', 'guide-analytics', 'guide-finance'],
    tips: ['Enter data weekly', 'Use historical data for benchmarks', 'Generate reports regularly'],
    commonIssues: [
      { issue: 'Data not saving', solution: 'Check internet. Refresh page.' },
      { issue: 'Report fails', solution: 'Ensure period has data.' },
    ]
  },
  'guide-finance': {
    id: 'finance',
    title: 'Financial Tools',
    subtitle: 'Budget & Transaction Management',
    description: 'Track budgets, record transactions, and generate financial reports.',
    icon: <CreditCard size={32} />,
    color: 'green',
    gradientFrom: 'from-green-600',
    gradientTo: 'to-emerald-600',
    youtubeVideoId: 'PLACEHOLDER_VIDEO_ID',
    flipbookUrl: 'https://PLACEHOLDER_FLIPBOOK_URL',
    quickStats: [
      { label: 'Budget View', value: 'Live', icon: <PieChart size={18} /> },
      { label: 'Categories', value: '8', icon: <Layers size={18} /> },
      { label: 'Report Types', value: '4', icon: <FileText size={18} /> },
    ],
    features: [
      { icon: <Plus size={20} />, title: 'Transaction Entry', description: 'Log income and expenses' },
      { icon: <PieChart size={20} />, title: 'Budget Overview', description: 'Spending analysis' },
      { icon: <FileText size={20} />, title: 'Reports', description: 'Financial reports' },
    ],
    steps: [
      { number: 1, title: 'Add a Transaction', description: 'Record income or expense.',
        substeps: ['Click "Add Transaction"', 'Select Type and Category', 'Enter details', 'Click "Save"'],
        tip: 'Enter transactions weekly.', warning: 'Keep records for 7 years.' },
    ],
    faqs: [
      { question: 'What\'s the approval process?', answer: 'Up to $500: PM. $500-$2,500: ED. Over $2,500: Board.' },
    ],
    resources: [
      { title: 'Budget Categories', description: 'Category definitions', type: 'pdf', url: '#' },
    ],
    relatedGuides: ['guide-grants', 'guide-casemanager', 'guide-admin'],
    tips: ['Enter transactions within 3 days', 'Match to receipts', 'Review budget weekly'],
    commonIssues: [
      { issue: 'Transaction missing', solution: 'Refresh page. Check date filter.' },
    ]
  },
  'guide-analytics': {
    id: 'analytics',
    title: 'Assessment Analytics',
    subtitle: 'Program Outcomes & Data Analysis',
    description: 'Track assessment results and generate funder reports.',
    icon: <BarChart3 size={32} />,
    color: 'violet',
    gradientFrom: 'from-violet-600',
    gradientTo: 'to-purple-600',
    youtubeVideoId: 'PLACEHOLDER_VIDEO_ID',
    flipbookUrl: 'https://PLACEHOLDER_FLIPBOOK_URL',
    quickStats: [
      { label: 'Data Sources', value: '3', icon: <Database size={18} /> },
      { label: 'Chart Types', value: '6', icon: <BarChart3 size={18} /> },
      { label: 'Templates', value: '4', icon: <FileText size={18} /> },
    ],
    features: [
      { icon: <Users size={20} />, title: 'Demographics', description: 'Participant breakdowns' },
      { icon: <TrendingUp size={20} />, title: 'Outcomes', description: 'Track success metrics' },
      { icon: <Target size={20} />, title: 'Goals', description: 'Progress toward targets' },
    ],
    steps: [
      { number: 1, title: 'View Dashboard', description: 'Understand program performance.',
        substeps: ['Review key metrics', 'Check trend charts', 'Note areas needing attention'] },
      { number: 2, title: 'Generate Funder Reports', description: 'Create required reports.',
        substeps: ['Select funder template', 'Choose reporting period', 'Export as PDF or Excel'],
        warning: 'Verify accuracy before submitting.' },
    ],
    faqs: [
      { question: 'Where does data come from?', answer: 'Fatherhood Tracking, Case Manager Portal, and Assessment forms.' },
    ],
    resources: [
      { title: 'Metric Definitions', description: 'How metrics are calculated', type: 'pdf', url: '#' },
    ],
    relatedGuides: ['guide-fatherhood', 'guide-casemanager', 'guide-grants'],
    tips: ['Analytics depend on source data quality', 'Export charts for presentations', 'Compare cohorts to identify best practices'],
    commonIssues: [
      { issue: 'Data outdated', solution: 'Update source data first.' },
    ]
  },
  'guide-donations': {
    id: 'donations',
    title: 'Donation CRM',
    subtitle: 'Donor & Contribution Management',
    description: 'Track donors, donations, and fundraising campaigns.',
    icon: <Gift size={32} />,
    color: 'rose',
    gradientFrom: 'from-rose-500',
    gradientTo: 'to-pink-500',
    youtubeVideoId: 'PLACEHOLDER_VIDEO_ID',
    flipbookUrl: 'https://PLACEHOLDER_FLIPBOOK_URL',
    quickStats: [
      { label: 'Donor Tiers', value: '5', icon: <Star size={18} /> },
      { label: 'Payment Methods', value: '6', icon: <CreditCard size={18} /> },
      { label: 'Campaign Types', value: '4', icon: <Target size={18} /> },
    ],
    features: [
      { icon: <Users size={20} />, title: 'Donor Database', description: 'Complete donor profiles' },
      { icon: <DollarSign size={20} />, title: 'Donation Tracking', description: 'Record all contributions' },
      { icon: <Mail size={20} />, title: 'Communications', description: 'Track acknowledgments' },
    ],
    steps: [
      { number: 1, title: 'Add a Donor', description: 'Create a donor profile.',
        substeps: ['Click "Add Donor"', 'Select Donor Type', 'Enter contact info', 'Click "Save"'] },
      { number: 2, title: 'Record a Donation', description: 'Log a contribution.',
        substeps: ['Click "Add Donation"', 'Select donor', 'Enter amount and details', 'Save'],
        tip: 'Record within 24 hours.' },
    ],
    faqs: [
      { question: 'How are tiers determined?', answer: 'Based on annual giving: Sustaining $1,000+, Major $500+, etc.' },
    ],
    resources: [
      { title: 'Thank You Templates', description: 'Acknowledgment letters', type: 'template', url: '#' },
    ],
    relatedGuides: ['guide-finance', 'guide-grants', 'guide-admin'],
    tips: ['Update donor info promptly', 'Thank donors within 48 hours', 'Review lapsed donors monthly'],
    commonIssues: [
      { issue: 'Duplicate donors', solution: 'Search before adding. Admin can merge.' },
    ]
  },
  'guide-admin': {
    id: 'admin-portal',
    title: 'Admin Portal',
    subtitle: 'System Settings & User Management',
    description: 'Manage users, configure settings, and view audit logs.',
    icon: <Settings size={32} />,
    color: 'slate',
    gradientFrom: 'from-slate-700',
    gradientTo: 'to-slate-800',
    youtubeVideoId: 'PLACEHOLDER_VIDEO_ID',
    flipbookUrl: 'https://PLACEHOLDER_FLIPBOOK_URL',
    quickStats: [
      { label: 'User Roles', value: '5', icon: <Users size={18} /> },
      { label: 'Permissions', value: '20+', icon: <Lock size={18} /> },
      { label: 'Audit Trail', value: 'Full', icon: <History size={18} /> },
    ],
    features: [
      { icon: <Users size={20} />, title: 'User Management', description: 'Add and manage users' },
      { icon: <Shield size={20} />, title: 'Permissions', description: 'Configure access levels' },
      { icon: <History size={20} />, title: 'Audit Logs', description: 'Track all actions' },
    ],
    steps: [
      { number: 1, title: 'Add a New User', description: 'Create a user account.',
        substeps: ['Go to "User Management"', 'Click "Add User"', 'Enter details and role', 'Create user'],
        tip: 'Use email invitations.' },
      { number: 2, title: 'Deactivate a User', description: 'Remove access for former staff.',
        substeps: ['Find user', 'Click "Deactivate"', 'Confirm'],
        warning: 'Deactivate immediately upon separation.' },
    ],
    faqs: [
      { question: 'What are the roles?', answer: 'Super Admin (full), Admin (users + settings), Program Manager, Case Manager, Staff (basic).' },
    ],
    resources: [
      { title: 'Role Matrix', description: 'Permissions by role', type: 'pdf', url: '#' },
    ],
    relatedGuides: ['guide-training', 'guide-documents', 'guide-finance'],
    tips: ['Review users monthly', 'Deactivate immediately on separation', 'Document admin actions'],
    commonIssues: [
      { issue: 'User can\'t login', solution: 'Check if active. Try password reset.' },
    ]
  },
};

// ============================================
// ANIMATED COMPONENTS
// ============================================

const AnimatedCounter: React.FC<{ end: number; duration?: number; suffix?: string }> = ({ end, duration = 1500, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const countRef = useRef<HTMLSpanElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setIsVisible(true); }, { threshold: 0.1 });
    if (countRef.current) observer.observe(countRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [isVisible, end, duration]);

  return <span ref={countRef}>{count}{suffix}</span>;
};

const ProgressRing: React.FC<{ progress: number; size?: number; strokeWidth?: number }> = ({ progress, size = 60, strokeWidth = 6 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth} className="text-slate-200" />
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth}
        strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="text-indigo-500 transition-all duration-1000 ease-out" />
    </svg>
  );
};

// ============================================
// PORTAL GUIDE LANDING PAGE COMPONENT
// ============================================

interface PortalGuideLandingProps {
  guideData: PortalGuideData;
  onBack: () => void;
  onNavigateToGuide: (guideId: string) => void;
}

const PortalGuideLanding: React.FC<PortalGuideLandingProps> = ({ guideData, onBack, onNavigateToGuide }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'steps' | 'faq' | 'resources'>('overview');
  const [expandedSteps, setExpandedSteps] = useState<number[]>([1]);
  const [expandedFaqs, setExpandedFaqs] = useState<number[]>([]);

  const toggleStep = (stepNum: number) => {
    setExpandedSteps(prev => prev.includes(stepNum) ? prev.filter(s => s !== stepNum) : [...prev, stepNum]);
  };

  const toggleFaq = (index: number) => {
    setExpandedFaqs(prev => prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]);
  };

  const relatedGuideData = guideData.relatedGuides.map(id => portalGuideData[id]).filter(Boolean);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors group">
        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        <span className="font-medium">Back to Handbook</span>
      </button>

      {/* Hero */}
      <div className={`bg-gradient-to-r ${guideData.gradientFrom} ${guideData.gradientTo} rounded-3xl p-8 text-white relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-64 h-64 border border-white/20 rounded-full"></div>
          <div className="absolute bottom-10 left-10 w-32 h-32 border border-white/20 rounded-full"></div>
        </div>
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">{guideData.icon}</div>
              <div>
                <h1 className="text-3xl font-black mb-2">{guideData.title}</h1>
                <p className="text-white/80 font-medium">{guideData.subtitle}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              {guideData.quickStats.map((stat, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 flex items-center gap-2">
                  <span className="text-white/60">{stat.icon}</span>
                  <div>
                    <p className="text-xs text-white/60">{stat.label}</p>
                    <p className="font-bold">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-6 text-lg text-white/90 max-w-3xl leading-relaxed">{guideData.description}</p>
        </div>
      </div>

      {/* Video & Slides */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden group hover:shadow-lg transition-all">
          <div className="aspect-video bg-slate-900 relative flex items-center justify-center">
            {guideData.youtubeVideoId !== 'PLACEHOLDER_VIDEO_ID' ? (
              <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${guideData.youtubeVideoId}`} title={`${guideData.title} Tutorial`} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
            ) : (
              <div className="text-center text-white/60 p-8">
                <div className="w-20 h-20 mx-auto bg-white/10 rounded-full flex items-center justify-center mb-4"><Play size={32} className="ml-1" /></div>
                <p className="font-medium">Video Tutorial Coming Soon</p>
                <p className="text-sm text-white/40 mt-2">Watch the step-by-step walkthrough</p>
              </div>
            )}
          </div>
          <div className="p-5">
            <div className="flex items-center gap-3 mb-2"><Video size={20} className="text-rose-500" /><h3 className="font-bold text-slate-800">Video Tutorial</h3></div>
            <p className="text-sm text-slate-500">Watch a complete walkthrough of the {guideData.title} features.</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden group hover:shadow-lg transition-all">
          <div className="aspect-video bg-gradient-to-br from-[#0F2C5C] to-[#1a4178] relative flex items-center justify-center">
            <div className="text-center text-white p-8">
              <div className="w-20 h-20 mx-auto bg-white/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><Layers size={32} /></div>
              <p className="font-bold text-xl mb-2">Interactive Slide Deck</p>
              <p className="text-sm text-white/60">Key concepts & visual guides</p>
            </div>
          </div>
          <div className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2"><BookOpen size={20} className="text-indigo-500" /><h3 className="font-bold text-slate-800">Presentation Slides</h3></div>
                <p className="text-sm text-slate-500">Visual guide with key takeaways.</p>
              </div>
              <a href={guideData.flipbookUrl} target="_blank" rel="noopener noreferrer"
                className={`shrink-0 px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${guideData.flipbookUrl !== 'https://PLACEHOLDER_FLIPBOOK_URL' ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                onClick={(e) => { if (guideData.flipbookUrl === 'https://PLACEHOLDER_FLIPBOOK_URL') e.preventDefault(); }}>
                <ExternalLink size={16} /> View Slides
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-white p-2 rounded-2xl shadow-sm border border-slate-200 flex-wrap">
        {[{ id: 'overview', label: 'Overview', icon: <Eye size={16} /> }, { id: 'steps', label: 'Step-by-Step Guide', icon: <List size={16} /> }, { id: 'faq', label: 'FAQ', icon: <HelpCircle size={16} /> }, { id: 'resources', label: 'Resources', icon: <FileDown size={16} /> }].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-[#0F2C5C] text-white shadow-lg' : 'text-slate-600 hover:bg-slate-100'}`}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-in fade-in duration-300">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <h3 className="font-bold text-xl text-slate-800 mb-6 flex items-center gap-3"><Sparkles size={24} className="text-amber-500" /> Key Features</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {guideData.features.map((feature, i) => (
                  <div key={i} className="p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors group">
                    <div className={`w-10 h-10 bg-gradient-to-br ${guideData.gradientFrom} ${guideData.gradientTo} rounded-xl flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform`}>{feature.icon}</div>
                    <h4 className="font-bold text-slate-800 mb-1">{feature.title}</h4>
                    <p className="text-sm text-slate-500">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6">
              <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2"><Lightbulb size={20} className="text-amber-500" /> Pro Tips</h3>
              <div className="grid md:grid-cols-2 gap-3">
                {guideData.tips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-white/60 rounded-xl">
                    <CheckCircle size={18} className="text-amber-500 mt-0.5 shrink-0" />
                    <span className="text-sm text-slate-700">{tip}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2"><AlertTriangle size={20} className="text-rose-500" /> Troubleshooting</h3>
              <div className="space-y-3">
                {guideData.commonIssues.map((item, i) => (
                  <div key={i} className="p-4 bg-slate-50 rounded-xl">
                    <p className="font-semibold text-slate-800 mb-1"><span className="text-rose-500 mr-2">Issue:</span>{item.issue}</p>
                    <p className="text-sm text-slate-600"><span className="text-emerald-600 font-medium mr-2">Solution:</span>{item.solution}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'steps' && (
          <div className="space-y-4">
            {guideData.steps.map((step) => (
              <div key={step.number} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <button onClick={() => toggleStep(step.number)}
                  className={`w-full flex items-center gap-4 p-5 text-left transition-colors ${expandedSteps.includes(step.number) ? 'bg-[#0F2C5C] text-white' : 'hover:bg-slate-50'}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg shrink-0 ${expandedSteps.includes(step.number) ? 'bg-white/20 text-white' : `bg-gradient-to-br ${guideData.gradientFrom} ${guideData.gradientTo} text-white`}`}>{step.number}</div>
                  <div className="flex-1">
                    <h4 className={`font-bold ${expandedSteps.includes(step.number) ? 'text-white' : 'text-slate-800'}`}>{step.title}</h4>
                    <p className={`text-sm ${expandedSteps.includes(step.number) ? 'text-white/70' : 'text-slate-500'}`}>{step.description}</p>
                  </div>
                  <ChevronDown size={20} className={`transition-transform ${expandedSteps.includes(step.number) ? 'rotate-180' : ''}`} />
                </button>
                {expandedSteps.includes(step.number) && (
                  <div className="p-6 border-t border-slate-100 bg-slate-50">
                    {step.substeps && (
                      <div className="space-y-3 mb-6">
                        {step.substeps.map((substep, i) => (
                          <div key={i} className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0">{i + 1}</div>
                            <p className="text-slate-700">{substep}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    {step.tip && (
                      <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl mb-3">
                        <Lightbulb size={20} className="text-emerald-500 shrink-0 mt-0.5" />
                        <div><p className="font-semibold text-emerald-800 text-sm">Pro Tip</p><p className="text-emerald-700 text-sm">{step.tip}</p></div>
                      </div>
                    )}
                    {step.warning && (
                      <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                        <AlertTriangle size={20} className="text-amber-500 shrink-0 mt-0.5" />
                        <div><p className="font-semibold text-amber-800 text-sm">Important</p><p className="text-amber-700 text-sm">{step.warning}</p></div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'faq' && (
          <div className="space-y-3">
            {guideData.faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <button onClick={() => toggleFaq(i)}
                  className={`w-full flex items-center gap-4 p-5 text-left transition-colors ${expandedFaqs.includes(i) ? 'bg-slate-50' : 'hover:bg-slate-50'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${expandedFaqs.includes(i) ? `bg-gradient-to-br ${guideData.gradientFrom} ${guideData.gradientTo} text-white` : 'bg-slate-100 text-slate-400'}`}><HelpCircle size={16} /></div>
                  <p className="flex-1 font-semibold text-slate-800">{faq.question}</p>
                  <ChevronDown size={20} className={`text-slate-400 transition-transform ${expandedFaqs.includes(i) ? 'rotate-180' : ''}`} />
                </button>
                {expandedFaqs.includes(i) && (
                  <div className="px-5 pb-5 pt-0">
                    <div className="p-4 bg-slate-50 rounded-xl ml-12"><p className="text-slate-600">{faq.answer}</p></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'resources' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2"><FileDown size={20} className="text-indigo-500" /> Downloadable Resources</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {guideData.resources.map((resource, i) => (
                  <a key={i} href={resource.url} className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors group">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${resource.type === 'pdf' ? 'bg-rose-100 text-rose-600' : resource.type === 'template' ? 'bg-blue-100 text-blue-600' : resource.type === 'video' ? 'bg-purple-100 text-purple-600' : 'bg-emerald-100 text-emerald-600'}`}>
                      {resource.type === 'pdf' ? <FileText size={20} /> : resource.type === 'template' ? <FileCheck size={20} /> : resource.type === 'video' ? <Video size={20} /> : <Link2 size={20} />}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">{resource.title}</p>
                      <p className="text-sm text-slate-500">{resource.description}</p>
                    </div>
                    <Download size={18} className="text-slate-300 group-hover:text-slate-500 transition-colors mt-1" />
                  </a>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-r from-slate-100 to-slate-50 rounded-2xl p-6 border border-slate-200">
              <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2"><MessageCircle size={20} className="text-blue-500" /> Need Additional Help?</h3>
              <div className="flex flex-wrap gap-4">
                <a href="mailto:admin@foamla.org" className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all"><Mail size={18} className="text-blue-500" /><span className="font-medium text-slate-700">admin@foamla.org</span></a>
                <a href="tel:2252397833" className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all"><Phone size={18} className="text-blue-500" /><span className="font-medium text-slate-700">(225) 239-7833</span></a>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Related Guides */}
      {relatedGuideData.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2"><Bookmark size={20} className="text-indigo-500" /> Related Guides</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {relatedGuideData.map((guide, i) => (
              <button key={i} onClick={() => onNavigateToGuide(`guide-${guide.id}`)}
                className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors group text-left">
                <div className={`w-10 h-10 bg-gradient-to-br ${guide.gradientFrom} ${guide.gradientTo} rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform`}>{guide.icon}</div>
                <div><p className="font-semibold text-slate-800">{guide.title}</p><p className="text-xs text-slate-500">{guide.subtitle}</p></div>
                <ArrowRight size={16} className="ml-auto text-slate-300 group-hover:text-slate-500 group-hover:translate-x-1 transition-all" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================
// MAIN ORGANIZATIONAL HANDBOOK COMPONENT
// ============================================

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
    const handleScroll = () => { if (contentRef.current) setShowScrollTop(contentRef.current.scrollTop > 300); };
    const content = contentRef.current;
    content?.addEventListener('scroll', handleScroll);
    return () => content?.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });

  const handleSectionChange = (section: Section) => {
    if (section === activeSection) return;
    setIsTransitioning(true);
    setIsSidebarOpen(false);
    setTimeout(() => { setActiveSection(section); setIsTransitioning(false); scrollToTop(); }, 150);
  };

  const toggleAccordion = (id: string) => setExpandedAccordions(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
  const toggleModuleComplete = (id: number) => setCompletedModules(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);

  const isPortalGuide = activeSection.startsWith('guide-');
  const currentGuideData = isPortalGuide ? portalGuideData[activeSection] : null;

  const navGroups = [
    { title: 'Organization', items: [
      { id: 'overview' as Section, label: 'Overview', icon: Home },
      { id: 'programs' as Section, label: 'Programs', icon: Briefcase },
      { id: 'curriculum' as Section, label: 'Curriculum', icon: GraduationCap },
      { id: 'sops' as Section, label: 'SOPs', icon: FileText },
      { id: 'policies' as Section, label: 'Policies', icon: Shield },
      { id: 'compliance' as Section, label: 'Compliance', icon: Scale },
      { id: 'roles' as Section, label: 'Staff Roles', icon: UserCog },
      { id: 'style' as Section, label: 'Style Guide', icon: Palette },
    ]},
    { title: 'Portal User Guides', items: [
      { id: 'guide-training' as Section, label: 'Training Academy', icon: BookOpen },
      { id: 'guide-fatherhood' as Section, label: 'Fatherhood Tracking', icon: Users },
      { id: 'guide-grants' as Section, label: 'Grant Management', icon: DollarSign },
      { id: 'guide-documents' as Section, label: 'Document Library', icon: FolderOpen },
      { id: 'guide-casemanager' as Section, label: 'Case Manager Portal', icon: ClipboardList },
      { id: 'guide-finance' as Section, label: 'Financial Tools', icon: CreditCard },
      { id: 'guide-analytics' as Section, label: 'Assessment Analytics', icon: BarChart3 },
      { id: 'guide-donations' as Section, label: 'Donation CRM', icon: Gift },
      { id: 'guide-admin' as Section, label: 'Admin Portal', icon: Settings },
    ]}
  ];

  const filteredNavGroups = navGroups.map(group => ({ ...group, items: group.items.filter(item => item.label.toLowerCase().includes(searchQuery.toLowerCase())) })).filter(group => group.items.length > 0);

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
    { icon: <Home size={24} />, title: "Whole-Family Approach", desc: "Supporting fathers is a pathway to supporting entire families.", color: "from-blue-500 to-blue-600" },
    { icon: <Heart size={24} />, title: "Trauma-Informed Care", desc: "We operate with awareness of challenges fathers may carry.", color: "from-rose-500 to-rose-600" },
    { icon: <Target size={24} />, title: "Evidence-Based Practice", desc: "We base our programming on proven models.", color: "from-emerald-500 to-emerald-600" },
    { icon: <HeartHandshake size={24} />, title: "Partnership Over Charity", desc: "We work alongside fathers, not for them.", color: "from-amber-500 to-amber-600" },
    { icon: <Star size={24} />, title: "Consistency Builds Trust", desc: "We deliver programs reliably and transparently.", color: "from-purple-500 to-purple-600" },
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
    { title: "Executive Director", dept: "Leadership", icon: <Building size={20} />, duties: ["Overall leadership and strategic vision", "Program direction, partnerships, fundraising", "Public representative", "Ensures compliance"] },
    { title: "Program Manager", dept: "Operations", icon: <Briefcase size={20} />, duties: ["Day-to-day operations", "Grant management", "Tracks metrics", "Coordinates staff"] },
    { title: "Fatherhood Facilitators", dept: "Program Delivery", icon: <Users size={20} />, duties: ["Deliver curriculum", "Engage participants", "Track attendance", "Provide referrals"] },
    { title: "Case Managers", dept: "Services", icon: <Heart size={20} />, duties: ["One-on-one support", "Create support plans", "Maintain records", "Coordinate referrals"] },
    { title: "Outreach Coordinator", dept: "Community", icon: <MapPin size={20} />, duties: ["Community engagement", "Partner collaboration", "Material distribution"] },
    { title: "Bookkeeper", dept: "Finance", icon: <DollarSign size={20} />, duties: ["Daily accounting", "Bank reconciliation", "Grant reporting", "Payroll support"] },
  ];

  const categoryColors: Record<string, string> = {
    "Personal Development": "from-blue-500 to-indigo-600",
    "Life Skills": "from-emerald-500 to-teal-600",
    "Responsible Fatherhood": "from-amber-500 to-orange-600",
    "Relationships": "from-rose-500 to-pink-600"
  };

  const completionPercent = Math.round((completedModules.length / 14) * 100);

  const Sidebar = () => (
    <div className="w-72 bg-white border-r border-slate-200 flex flex-col h-full">
      <div className="p-4 border-b border-slate-200">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search handbook..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0F2C5C] focus:bg-white transition-all" />
          {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><X size={14} /></button>}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {filteredNavGroups.map((group, groupIndex) => (
          <div key={groupIndex}>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">{group.title}</p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button key={item.id} onClick={() => handleSectionChange(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive ? 'bg-[#0F2C5C] text-white shadow-md' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'}`}>
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
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0a1f3d] via-[#0F2C5C] to-[#1a4178] text-white p-4 relative overflow-hidden shrink-0">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-60 h-60 bg-indigo-400 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 hover:bg-white/10 rounded-xl transition-colors"><Menu size={24} /></button>
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20"><Book size={24} /></div>
              <div>
                <h1 className="text-xl font-black tracking-tight flex items-center gap-2">F.O.A.M. Organizational Hub <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-xs rounded-full font-bold animate-pulse">LIVE</span></h1>
                <p className="text-indigo-200 text-sm hidden sm:block">Fathers On A Mission • Internal Resource</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-4 text-sm text-indigo-200">
                <div className="flex items-center gap-2"><Phone size={14} /><span>(225) 239-7833</span></div>
                <div className="flex items-center gap-2"><Mail size={14} /><span>admin@foamla.org</span></div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-all hover:rotate-90 duration-300"><X size={24} /></button>
            </div>
          </div>
        </div>

        {/* Main */}
        <div className="flex-1 flex overflow-hidden relative">
          {isSidebarOpen && <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setIsSidebarOpen(false)} />}
          <div className={`fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} lg:flex`}><Sidebar /></div>

          <div ref={contentRef} className={`flex-1 overflow-y-auto p-6 bg-gradient-to-b from-slate-50 to-slate-100 transition-opacity duration-150 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
            <div className="max-w-4xl mx-auto">

              {/* Portal Guides */}
              {isPortalGuide && currentGuideData && (
                <PortalGuideLanding guideData={currentGuideData} onBack={() => handleSectionChange('overview')} onNavigateToGuide={(guideId) => handleSectionChange(guideId as Section)} />
              )}

              {/* Overview */}
              {activeSection === 'overview' && (
                <div className="space-y-8">
                  <div className="bg-gradient-to-br from-[#0F2C5C] via-[#1a3d6e] to-[#1a4178] rounded-3xl p-8 text-white text-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10"><div className="absolute top-10 left-10 w-32 h-32 border border-white/20 rounded-full"></div><div className="absolute bottom-10 right-10 w-48 h-48 border border-white/20 rounded-full"></div></div>
                    <div className="relative z-10">
                      <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/20 rounded-full mb-4"><Sparkles size={14} className="text-amber-300" /><span className="text-amber-300 font-bold uppercase tracking-widest text-xs">Our Mission</span></div>
                      <p className="text-2xl md:text-3xl font-light leading-relaxed max-w-3xl mx-auto mb-4">"To enhance Fathers and Father Figures, which will ultimately strengthen families."</p>
                      <p className="text-indigo-200 max-w-2xl mx-auto"><span className="font-semibold text-white">Vision:</span> All Fathers and Father Figures are active, positive role models.</p>
                      <div className="flex flex-wrap justify-center gap-2 mt-8">
                        {coreValues.map((value, i) => (
                          <span key={i} className="group px-3 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium border border-white/20 hover:bg-amber-500 hover:text-[#0F2C5C] hover:border-amber-500 transition-all duration-300 cursor-default flex items-center gap-2 hover:scale-105">
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity">{value.icon}</span>{value.text}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2"><Zap size={20} className="text-amber-500" /> Quick Reference</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                      {quickStats.map((stat, i) => (
                        <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group cursor-pointer">
                          <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center text-white mb-3 group-hover:scale-110 group-hover:rotate-6 transition-transform`}>{stat.icon}</div>
                          <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">{stat.label}</p>
                          <p className="text-xl font-black text-[#0F2C5C]">{stat.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2"><Star size={20} className="text-amber-500" /> Guiding Principles</h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {guidingPrinciples.map((p, i) => (
                        <div key={i} className="group bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-xl transition-all duration-500 cursor-pointer overflow-hidden relative">
                          <div className={`absolute inset-0 bg-gradient-to-br ${p.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                          <div className="relative z-10">
                            <div className={`w-12 h-12 bg-gradient-to-br ${p.color} rounded-2xl flex items-center justify-center text-white mb-4 group-hover:scale-110 group-hover:rotate-6 transition-transform shadow-lg`}>{p.icon}</div>
                            <h4 className="font-bold text-slate-800 mb-2 group-hover:text-white transition-colors">{p.title}</h4>
                            <p className="text-sm text-slate-500 group-hover:text-white/80 transition-colors">{p.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2"><Monitor size={20} className="text-indigo-500" /> Portal User Guides</h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.values(portalGuideData).slice(0, 6).map((guide, i) => (
                        <button key={i} onClick={() => handleSectionChange(`guide-${guide.id}` as Section)}
                          className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-left group">
                          <div className={`w-12 h-12 bg-gradient-to-br ${guide.gradientFrom} ${guide.gradientTo} rounded-xl flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform`}>{guide.icon}</div>
                          <h4 className="font-bold text-slate-800 mb-1">{guide.title}</h4>
                          <p className="text-xs text-slate-500">{guide.subtitle}</p>
                          <div className="mt-3 flex items-center gap-2 text-xs font-medium text-indigo-600 group-hover:text-indigo-700"><span>View Guide</span><ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" /></div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Programs */}
              {activeSection === 'programs' && (
                <div className="space-y-6">
                  <div className="flex gap-2 flex-wrap bg-white p-2 rounded-2xl shadow-sm border border-slate-200">
                    {[{ id: 'pfb', label: 'Project Family Build', icon: <Home size={16} /> }, { id: 'rfc', label: 'Responsible Fatherhood Class', icon: <GraduationCap size={16} /> }, { id: 'services', label: 'Support Services', icon: <Heart size={16} /> }].map(tab => (
                      <button key={tab.id} onClick={() => setActiveTab(tab.id as ProgramTab)}
                        className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === tab.id ? 'bg-[#0F2C5C] text-white shadow-lg' : 'text-slate-600 hover:bg-slate-100'}`}>
                        {tab.icon}{tab.label}
                      </button>
                    ))}
                  </div>

                  {activeTab === 'pfb' && (
                    <div className="space-y-6">
                      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 flex items-center gap-4">
                        <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center text-white"><Building size={24} /></div>
                        <div><p className="font-bold text-slate-800">Project Family Build</p><p className="text-sm text-slate-600"><strong>Lead:</strong> Program Manager | <strong>Type:</strong> Evidence-Based</p></div>
                      </div>
                      <p className="text-slate-600 text-lg leading-relaxed">FOAM's comprehensive support program designed to equip fathers with the tools, services, and relationships needed to stabilize their lives and support their families.</p>
                      <div className="grid md:grid-cols-2 gap-4">
                        {[{ icon: <Briefcase size={24} />, title: "Workforce Development", color: "from-blue-500 to-indigo-600", items: ["Job readiness coaching & resume development", "Interview preparation", "Referrals to certifications (TWIC, OSHA, forklift)", "Job placement through partner employers"] },
                          { icon: <FileText size={24} />, title: "Case Management", color: "from-emerald-500 to-teal-600", items: ["Dedicated case manager assigned", "Personalized Plan of Care", "Data tracking for goals & progress", "Monthly check-ins"] },
                          { icon: <Home size={24} />, title: "Housing Stabilization", color: "from-amber-500 to-orange-600", items: ["Short-term rental support during instability", "Connection to long-term housing services", "Coordination when critical to family stability"] },
                          { icon: <Brain size={24} />, title: "Mental Health & Wellness", color: "from-purple-500 to-pink-600", items: ["Culturally appropriate counseling referrals", "Collaboration with trusted providers", "Trauma-informed approaches throughout"] }
                        ].map((card, i) => (
                          <div key={i} className="group bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-xl transition-all duration-300 overflow-hidden relative">
                            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${card.color}`}></div>
                            <div className="flex items-center gap-3 mb-4">
                              <div className={`w-12 h-12 bg-gradient-to-br ${card.color} rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform`}>{card.icon}</div>
                              <h4 className="font-bold text-slate-800">{card.title}</h4>
                            </div>
                            <ul className="space-y-2">{card.items.map((item, j) => <li key={j} className="text-sm text-slate-600 flex items-start gap-2"><ChevronRight size={14} className="text-amber-500 mt-0.5 shrink-0" />{item}</li>)}</ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'rfc' && (
                    <div className="space-y-6">
                      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-2xl p-5 flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center text-white"><GraduationCap size={24} /></div>
                        <div><p className="font-bold text-slate-800">Responsible Fatherhood Class</p><p className="text-sm text-slate-600"><strong>Lead:</strong> Fatherhood Class Coordinator | <strong>Sessions:</strong> 14 Required</p></div>
                      </div>
                      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                        <h4 className="font-bold text-slate-800 mb-4">Attendance & Graduation Requirements</h4>
                        <div className="space-y-3">
                          {["Fathers must attend and be engaged in all 14 sessions to graduate", "Attendance is tracked weekly and logged", "No partial completions or substitutions accepted", "Graduates receive a Certificate of Completion"].map((item, i) => (
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
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                      <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Heart size={20} className="text-rose-500" /> Daily Needs & Essential Support</h4>
                      <div className="grid md:grid-cols-3 gap-4">
                        {[{ icon: <Users size={20} />, text: "School supplies, children's clothing, diapers, household essentials" }, { icon: <FileText size={20} />, text: "Document recovery assistance (state IDs, Social Security cards)" }, { icon: <Calendar size={20} />, text: "Connection to food drives, seasonal events, and resource distributions" }].map((item, i) => (
                          <div key={i} className="p-4 bg-slate-50 rounded-xl flex items-start gap-3 hover:bg-slate-100 transition-colors group">
                            <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform">{item.icon}</div>
                            <span className="text-sm text-slate-600">{item.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Curriculum */}
              {activeSection === 'curriculum' && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-[#0F2C5C] to-[#1a4178] rounded-2xl p-6 text-white flex items-center justify-between">
                    <div><h3 className="text-xl font-bold mb-1">14-Session Curriculum</h3><p className="text-indigo-200 text-sm">Click modules to track progress (demo)</p></div>
                    <div className="flex items-center gap-4">
                      <div className="text-right"><p className="text-3xl font-black"><AnimatedCounter end={completedModules.length} duration={1000} /></p><p className="text-indigo-200 text-xs">of 14 Complete</p></div>
                      <div className="relative"><ProgressRing progress={completionPercent} size={70} strokeWidth={6} /><span className="absolute inset-0 flex items-center justify-center text-sm font-bold">{completionPercent}%</span></div>
                    </div>
                  </div>
                  {['Personal Development', 'Life Skills', 'Responsible Fatherhood', 'Relationships'].map((category, catIndex) => (
                    <div key={category}>
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-2 h-8 rounded-full bg-gradient-to-b ${categoryColors[category]}`}></div>
                        <h3 className="text-lg font-bold text-slate-800">Module {catIndex + 1}: {category}</h3>
                        <span className="px-2 py-0.5 bg-slate-100 rounded-full text-xs font-medium text-slate-500">{curriculumModules.filter(m => m.category === category && completedModules.includes(m.id)).length}/{curriculumModules.filter(m => m.category === category).length}</span>
                      </div>
                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
                        {curriculumModules.filter(m => m.category === category).map(module => {
                          const isCompleted = completedModules.includes(module.id);
                          return (
                            <button key={module.id} onClick={() => toggleModuleComplete(module.id)}
                              className={`relative bg-white rounded-xl p-4 shadow-sm border-l-4 text-left transition-all duration-300 overflow-hidden group ${isCompleted ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-indigo-500'}`}>
                              <div className={`absolute inset-0 bg-gradient-to-r ${categoryColors[category]} opacity-0 group-hover:opacity-5 transition-opacity`}></div>
                              <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${isCompleted ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-[#0F2C5C] group-hover:text-white'}`}>{isCompleted ? <CheckCircle size={16} /> : module.id}</span>
                                  <span className="text-xs text-slate-400">{module.duration}</span>
                                </div>
                                <p className={`text-sm font-semibold ${isCompleted ? 'text-emerald-700' : 'text-slate-800'}`}>{module.title}</p>
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
                  <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-2xl p-4 mb-6 flex items-center gap-3"><FileText size={24} className="text-indigo-500" /><p className="text-sm text-slate-700">Standard Operating Procedures ensure consistent, quality service delivery across all FOAM programs.</p></div>
                  {[{ id: 'intake', title: 'Intake & Case Management', icon: <Users size={20} />, content: 'Fathers may be referred by partners, family, or self-referral. Schedule intake within 3 business days. Complete intake form, obtain consent, conduct needs assessment.' },
                    { id: 'delivery', title: 'Program Delivery', icon: <GraduationCap size={20} />, content: 'Programs open to all fathers with priority for unemployed, formerly incarcerated, or below ALICE threshold. All participants complete intake assessment. Each father assigned a case manager.' },
                    { id: 'data', title: 'Data Collection & Management', icon: <FileCheck size={20} />, content: 'Use organization-approved case management system. All data confidential with authorized access only. Enter notes within 3 business days. Monthly quality checks.' },
                    { id: 'tech', title: 'Technology & Security', icon: <Lock size={20} />, content: 'Only approved staff get system access. Change passwords every 90 days with 2FA. All public content reviewed before publication.' },
                    { id: 'facility', title: 'Facility Use & Safety', icon: <Building size={20} />, content: 'Office hours 8am-4pm or by appointment. Report safety incidents immediately. Complete event logistics checklist before hosting events.' },
                    { id: 'volunteer', title: 'Volunteer & Partner Management', icon: <HeartHandshake size={20} />, content: 'All volunteers complete orientation and sign confidentiality agreement. Partners require signed MOU. Vendor invoices paid within 15 days.' },
                  ].map((sop) => (
                    <div key={sop.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden group">
                      <button onClick={() => toggleAccordion(sop.id)} className={`w-full flex items-center justify-between p-5 text-left font-bold transition-all duration-300 ${expandedAccordions.includes(sop.id) ? 'bg-[#0F2C5C] text-white' : 'text-slate-800 hover:bg-slate-50'}`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${expandedAccordions.includes(sop.id) ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-[#0F2C5C] group-hover:text-white'}`}>{sop.icon}</div>
                          <span>{sop.title}</span>
                        </div>
                        <ChevronDown size={20} className={`transition-transform duration-300 ${expandedAccordions.includes(sop.id) ? 'rotate-180' : ''}`} />
                      </button>
                      <div className={`overflow-hidden transition-all duration-300 ${expandedAccordions.includes(sop.id) ? 'max-h-96' : 'max-h-0'}`}><div className="p-5 border-t border-slate-200 text-slate-600 bg-slate-50">{sop.content}</div></div>
                    </div>
                  ))}
                </div>
              )}

              {/* Policies */}
              {activeSection === 'policies' && (
                <div className="space-y-3">
                  <div className="bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 rounded-2xl p-4 mb-6 flex items-center gap-3"><Shield size={24} className="text-rose-500" /><p className="text-sm text-slate-700">Policies ensure FOAM operates with integrity, transparency, and compliance across all activities.</p></div>
                  {[{ id: 'data', title: 'Data Protection & Confidentiality', icon: <Lock size={20} />, content: 'All records stored securely. Only authorized staff access data (reviewed quarterly). Paper records digitized within 5 days. No external sharing without consent.' },
                    { id: 'safety', title: 'Safety & Incident Reporting', icon: <Shield size={20} />, content: 'Safety orientation for all new staff. Review facilities for risks. Report incidents within 24 hours using Incident Report Form.' },
                    { id: 'volunteer', title: 'Volunteer & Intern Engagement', icon: <Users size={20} />, content: 'Orientation required before service. Supervisor assigned for oversight. Sign Confidentiality Agreement and Code of Conduct.' },
                    { id: 'financial', title: 'Financial Policies', icon: <DollarSign size={20} />, content: 'Board provides fiscal oversight. Monthly financial reviews. Expense approval: Up to $500 (PM), $500-$2,500 (ED), Over $2,500 (Board). Records retained 7 years.' },
                    { id: 'conflict', title: 'Conflict of Interest', icon: <Scale size={20} />, content: 'Annual disclosure forms for board and senior staff. No self-dealing or nepotism. Document recusals. Periodic review by Governance Committee.' },
                  ].map((policy) => (
                    <div key={policy.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden group">
                      <button onClick={() => toggleAccordion(`pol-${policy.id}`)} className={`w-full flex items-center justify-between p-5 text-left font-bold transition-all duration-300 ${expandedAccordions.includes(`pol-${policy.id}`) ? 'bg-[#0F2C5C] text-white' : 'text-slate-800 hover:bg-slate-50'}`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${expandedAccordions.includes(`pol-${policy.id}`) ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-[#0F2C5C] group-hover:text-white'}`}>{policy.icon}</div>
                          <span>{policy.title}</span>
                        </div>
                        <ChevronDown size={20} className={`transition-transform duration-300 ${expandedAccordions.includes(`pol-${policy.id}`) ? 'rotate-180' : ''}`} />
                      </button>
                      <div className={`overflow-hidden transition-all duration-300 ${expandedAccordions.includes(`pol-${policy.id}`) ? 'max-h-96' : 'max-h-0'}`}><div className="p-5 border-t border-slate-200 text-slate-600 bg-slate-50">{policy.content}</div></div>
                    </div>
                  ))}
                </div>
              )}

              {/* Compliance */}
              {activeSection === 'compliance' && (
                <div className="space-y-6">
                  <div className="flex flex-wrap gap-2">
                    {[{ label: '501(c)(3) Status', color: 'bg-emerald-500' }, { label: 'GAAP Compliant', color: 'bg-blue-500' }, { label: '2 CFR Part 200', color: 'bg-purple-500' }, { label: 'ADA Compliant', color: 'bg-amber-500' }, { label: 'Title VI', color: 'bg-rose-500' }, { label: 'HIPAA Safeguards', color: 'bg-indigo-500' }].map((badge) => (
                      <span key={badge.label} className={`${badge.color} px-4 py-2 text-white rounded-full text-sm font-bold flex items-center gap-2 hover:scale-105 transition-transform cursor-default`}><CheckCircle size={14} /> {badge.label}</span>
                    ))}
                  </div>
                  <div className="space-y-3">
                    {[{ id: 'governance', title: 'Corporate Governance', icon: <Building size={20} />, content: 'Articles of Incorporation and Bylaws on file with Louisiana Secretary of State. Regular board meetings with quorum compliance.' },
                      { id: 'irs', title: 'IRS & Federal Tax', icon: <FileText size={20} />, content: '501(c)(3) status in good standing. Annual Form 990 filings. Monitor unrelated business income and lobbying restrictions.' },
                      { id: 'state', title: 'State & Local (Louisiana)', icon: <MapPin size={20} />, content: 'Annual nonprofit registration renewals. Payroll compliance with Louisiana Workforce Commission.' },
                      { id: 'gaap', title: 'Financial Oversight & GAAP', icon: <DollarSign size={20} />, content: 'GAAP-compliant accounting. QuickBooks Online for audit-ready financials. Monthly budget-to-actual comparisons.' },
                      { id: 'civil', title: 'Non-Discrimination & Civil Rights', icon: <Heart size={20} />, content: 'Full compliance with federal civil rights laws. No discrimination based on race, color, national origin, disability, sex, age, religion.' },
                      { id: 'cyber', title: 'Technology & Cybersecurity', icon: <Lock size={20} />, content: 'Data Security Plan in place. MFA enabled across systems. ADA-compliant digital content. Staff cybersecurity training.' },
                    ].map(item => (
                      <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden group">
                        <button onClick={() => toggleAccordion(`comp-${item.id}`)} className={`w-full flex items-center justify-between p-5 text-left font-bold transition-all duration-300 ${expandedAccordions.includes(`comp-${item.id}`) ? 'bg-[#0F2C5C] text-white' : 'text-slate-800 hover:bg-slate-50'}`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${expandedAccordions.includes(`comp-${item.id}`) ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-[#0F2C5C] group-hover:text-white'}`}>{item.icon}</div>
                            <span>{item.title}</span>
                          </div>
                          <ChevronDown size={20} className={`transition-transform duration-300 ${expandedAccordions.includes(`comp-${item.id}`) ? 'rotate-180' : ''}`} />
                        </button>
                        <div className={`overflow-hidden transition-all duration-300 ${expandedAccordions.includes(`comp-${item.id}`) ? 'max-h-96' : 'max-h-0'}`}><div className="p-5 border-t border-slate-200 text-slate-600 bg-slate-50">{item.content}</div></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Roles */}
              {activeSection === 'roles' && (
                <div className="grid md:grid-cols-2 gap-4">
                  {staffRoles.map((role, i) => (
                    <div key={i} className="group bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300">
                      <div className="bg-gradient-to-r from-[#0F2C5C] to-[#1a4178] text-white p-5 flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-transform">{role.icon}</div>
                        <div><h4 className="font-bold text-lg">{role.title}</h4><p className="text-xs text-indigo-200">{role.dept}</p></div>
                      </div>
                      <div className="p-5">
                        <ul className="space-y-3">
                          {role.duties.map((duty, j) => (
                            <li key={j} className="flex items-start gap-3 text-sm text-slate-600 group/item">
                              <span className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 shrink-0 group-hover/item:bg-amber-500 group-hover/item:text-white transition-colors"><ChevronRight size={12} /></span>
                              {duty}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Style Guide */}
              {activeSection === 'style' && (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    {[{ title: "Voice & Tone", icon: <BookOpen size={20} />, color: "from-blue-500 to-indigo-600", items: ["Tone: Professional, supportive, empowering", "Voice: Father-centered, strengths-based", "Perspective: Use 'we' for FOAM's role", "Avoid: Bureaucratic language, judgmental phrasing"] },
                      { title: "Core Language", icon: <FileText size={20} />, color: "from-emerald-500 to-teal-600", items: ["Use 'fathers' or 'father figures' — not 'clients'", "Emphasize engagement, empowerment, support", "Highlight outcomes, impact, partnership", "Use person-first language"] },
                      { title: "Formatting", icon: <Palette size={20} />, color: "from-amber-500 to-orange-600", items: ["Plain, direct headers", "Short paragraphs or bullet points", "Bold for emphasis, not ALL CAPS", "Include Program Name, Date, Version"] },
                      { title: "Inclusive Language", icon: <Heart size={20} />, color: "from-rose-500 to-pink-600", items: ["Use 'all fathers,' 'father-centered'", "Reflect diverse backgrounds in storytelling", "Frame participants as capable of growth"] },
                    ].map((card, i) => (
                      <div key={i} className="group bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-xl transition-all duration-300 overflow-hidden relative">
                        <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${card.color}`}></div>
                        <div className="flex items-center gap-3 mb-4">
                          <div className={`w-10 h-10 bg-gradient-to-br ${card.color} rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform`}>{card.icon}</div>
                          <h4 className="font-bold text-slate-800">{card.title}</h4>
                        </div>
                        <ul className="space-y-2">{card.items.map((item, j) => <li key={j} className="flex items-start gap-2 text-sm text-slate-600"><ChevronRight size={14} className="text-amber-500 mt-0.5 shrink-0" />{item}</li>)}</ul>
                      </div>
                    ))}
                  </div>
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6">
                    <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Award size={20} className="text-amber-500" /> Official Program Names</h4>
                    <div className="flex flex-wrap gap-3">
                      {['Project Family Build', 'Responsible Fatherhood Class', 'Father and Child Bonding Activities', 'Enhancement Workshops'].map((name) => (
                        <span key={name} className="px-4 py-2 bg-white rounded-xl text-sm font-bold text-[#0F2C5C] border-2 border-amber-300 hover:bg-[#0F2C5C] hover:text-white hover:border-[#0F2C5C] transition-all duration-300 cursor-default">{name}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#0F2C5C] text-white p-4 flex flex-wrap items-center justify-between gap-4 text-sm shrink-0">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 hover:text-amber-300 transition-colors cursor-pointer"><MapPin size={14} className="text-indigo-300" /><span className="hidden sm:inline">1120 Government St, Baton Rouge, LA 70802</span></div>
            <div className="flex items-center gap-2 hover:text-amber-300 transition-colors cursor-pointer"><Phone size={14} className="text-indigo-300" /><span>(225) 239-7833</span></div>
          </div>
          <div className="flex items-center gap-2 text-indigo-300"><span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span><span className="text-xs font-bold uppercase tracking-widest">Internal Resource</span></div>
        </div>

        {/* Scroll to Top */}
        {showScrollTop && (
          <button onClick={scrollToTop} className="absolute bottom-20 right-6 w-12 h-12 bg-[#0F2C5C] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-indigo-600 transition-all hover:scale-110"><ArrowUp size={20} /></button>
        )}
      </div>
    </div>
  );
};

export default OrganizationalHandbook;
