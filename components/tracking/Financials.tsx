import React, { useState } from 'react';
import { 
  BookOpen, FileText, Download, ExternalLink, ClipboardList,
  ChevronRight, FolderOpen, Award, Users, CheckSquare
} from 'lucide-react';

// Curriculum PDF files - these would be hosted on your server or Google Drive
const CURRICULUM_ASSETS = [
  {
    id: 1,
    title: "NPCL Responsible Fatherhood Curriculum",
    description: "Complete curriculum guide for facilitators",
    type: "PDF",
    size: "2.4 MB",
    url: "/assets/pdfs/NPCL_Responsible_Fatherhood_Curriculum.pdf"
  },
  {
    id: 2,
    title: "Module 1: Conflict Resolution/Anger Management",
    description: "Lesson materials and facilitator guide",
    type: "PDF",
    module: 1
  },
  {
    id: 3,
    title: "Module 2: Becoming Self-Sufficient",
    description: "Lesson materials and facilitator guide",
    type: "PDF",
    module: 2
  },
  {
    id: 4,
    title: "Module 3: Building Your Child's Self-Esteem",
    description: "Lesson materials and facilitator guide",
    type: "PDF",
    module: 3
  },
  {
    id: 5,
    title: "Module 4: Co-Parenting/Single Fatherhood",
    description: "Lesson materials and facilitator guide",
    type: "PDF",
    module: 4
  },
  {
    id: 6,
    title: "Module 5: Male/Female Relationship",
    description: "Lesson materials and facilitator guide",
    type: "PDF",
    module: 5
  },
  {
    id: 7,
    title: "Module 6: Manhood",
    description: "Lesson materials and facilitator guide",
    type: "PDF",
    module: 6
  },
  {
    id: 8,
    title: "Module 7: Values",
    description: "Lesson materials and facilitator guide",
    type: "PDF",
    module: 7
  },
  {
    id: 9,
    title: "Module 8: Communication/Active Listening",
    description: "Lesson materials and facilitator guide",
    type: "PDF",
    module: 8
  },
  {
    id: 10,
    title: "Module 9: Dealing with Stress",
    description: "Lesson materials and facilitator guide",
    type: "PDF",
    module: 9
  },
  {
    id: 11,
    title: "Module 10: Coping with Fatherhood Discrimination",
    description: "Lesson materials and facilitator guide",
    type: "PDF",
    module: 10
  },
  {
    id: 12,
    title: "Module 11: Fatherhood Today",
    description: "Lesson materials and facilitator guide",
    type: "PDF",
    module: 11
  },
  {
    id: 13,
    title: "Module 12: Understanding Children's Needs",
    description: "Lesson materials and facilitator guide",
    type: "PDF",
    module: 12
  },
  {
    id: 14,
    title: "Module 13: A Father's Influence on His Child",
    description: "Lesson materials and facilitator guide",
    type: "PDF",
    module: 13
  },
  {
    id: 15,
    title: "Module 14: Relationships",
    description: "Lesson materials and facilitator guide",
    type: "PDF",
    module: 14
  }
];

type TabType = 'curriculum' | 'assessments';

export const Financials: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('curriculum');
  const [selectedModule, setSelectedModule] = useState<number | null>(null);

  // Generate assessment URL for a specific module
  const getAssessmentUrl = (moduleId: number) => {
    return `${window.location.origin}/assessment?module=${moduleId}`;
  };

  // Copy assessment link to clipboard
  const copyAssessmentLink = async (moduleId: number) => {
    try {
      await navigator.clipboard.writeText(getAssessmentUrl(moduleId));
      alert('Assessment link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Resources</h1>
        <p className="text-slate-500">Curriculum materials and class assessments</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab('curriculum')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
            activeTab === 'curriculum'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          <BookOpen size={18} />
          Curriculum Assets
        </button>
        <button
          onClick={() => setActiveTab('assessments')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
            activeTab === 'assessments'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          <ClipboardList size={18} />
          Assessments
        </button>
      </div>

      {/* Curriculum Assets Tab */}
      {activeTab === 'curriculum' && (
        <div className="space-y-4">
          {/* Main Curriculum */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                <BookOpen size={28} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">NPCL Responsible Fatherhood Curriculum</h3>
                <p className="text-blue-100 text-sm mb-4">
                  Complete curriculum guide for facilitators - includes all 14 modules
                </p>
                <a
                  href="/assets/pdfs/NPCL_Responsible_Fatherhood_Curriculum.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-all"
                >
                  <Download size={18} />
                  Download PDF
                </a>
              </div>
            </div>
          </div>

          {/* Module Materials */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <FolderOpen size={18} className="text-blue-600" />
                Module Materials
              </h3>
              <p className="text-sm text-slate-500">Individual lesson materials for each class</p>
            </div>
            
            <div className="divide-y divide-slate-100">
              {CURRICULUM_ASSETS.filter(a => a.module).map(asset => (
                <div 
                  key={asset.id}
                  className="p-4 hover:bg-slate-50 transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-700 font-bold">
                      {asset.module}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{asset.title}</p>
                      <p className="text-sm text-slate-500">{asset.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">
                      {asset.type}
                    </span>
                    <button className="p-2 hover:bg-slate-100 rounded-lg transition-all text-slate-400 hover:text-blue-600">
                      <Download size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upload Note */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-amber-800 text-sm">
              <strong>Note:</strong> To add or update curriculum PDFs, upload them to the <code className="bg-amber-100 px-1 rounded">public/assets/pdfs/</code> folder in your GitHub repository.
            </p>
          </div>
        </div>
      )}

      {/* Assessments Tab */}
      {activeTab === 'assessments' && (
        <div className="space-y-4">
          {/* Assessment Info */}
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-xl p-6 text-white">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                <ClipboardList size={28} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">Digital Class Assessments</h3>
                <p className="text-emerald-100 text-sm mb-4">
                  Fathers complete assessments on their phones after each class. Responses are saved to Google Sheets automatically.
                </p>
                <a
                  href="/assessment"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-white text-emerald-600 px-4 py-2 rounded-lg font-medium hover:bg-emerald-50 transition-all"
                >
                  <ExternalLink size={18} />
                  Open Assessment Page
                </a>
              </div>
            </div>
          </div>

          {/* Module-Specific Assessment Links */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <CheckSquare size={18} className="text-emerald-600" />
                Module Assessment Links
              </h3>
              <p className="text-sm text-slate-500">
                Share these links with fathers or display QR codes for specific modules
              </p>
            </div>
            
            <div className="divide-y divide-slate-100">
              {[
                { id: 1, title: "Conflict Resolution/Anger Management" },
                { id: 2, title: "Becoming Self-Sufficient" },
                { id: 3, title: "Building Your Child's Self-Esteem" },
                { id: 4, title: "Co-Parenting/Single Fatherhood" },
                { id: 5, title: "Male/Female Relationship" },
                { id: 6, title: "Manhood" },
                { id: 7, title: "Values" },
                { id: 8, title: "Communication/Active Listening" },
                { id: 9, title: "Dealing with Stress" },
                { id: 10, title: "Coping with Fatherhood Discrimination" },
                { id: 11, title: "Fatherhood Today" },
                { id: 12, title: "Understanding Children's Needs" },
                { id: 13, title: "A Father's Influence on His Child" },
                { id: 14, title: "Relationships" }
              ].map(module => (
                <div 
                  key={module.id}
                  className="p-4 hover:bg-slate-50 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-700 font-bold">
                        {module.id}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{module.title}</p>
                        <p className="text-xs text-slate-400 font-mono">
                          /assessment?module={module.id}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => copyAssessmentLink(module.id)}
                        className="px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all"
                      >
                        Copy Link
                      </button>
                      <a
                        href={getAssessmentUrl(module.id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-emerald-100 rounded-lg transition-all text-slate-400 hover:text-emerald-600"
                      >
                        <ExternalLink size={18} />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Users size={18} className="text-blue-600" />
              How Fathers Complete Assessments
            </h3>
            <ol className="space-y-3">
              <li className="flex gap-3">
                <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-bold shrink-0">1</span>
                <span className="text-slate-600">At the end of class, display the QR code or share the assessment link</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-bold shrink-0">2</span>
                <span className="text-slate-600">Father opens the link on their phone</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-bold shrink-0">3</span>
                <span className="text-slate-600">They answer 3 Yes/No questions about the lesson</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-bold shrink-0">4</span>
                <span className="text-slate-600">They can share any challenges they're facing</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-bold shrink-0">5</span>
                <span className="text-slate-600">Enter their name and phone, then submit</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-sm font-bold shrink-0">✓</span>
                <span className="text-slate-600">Responses are automatically saved to Google Sheets</span>
              </li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
};

export default Financials;

