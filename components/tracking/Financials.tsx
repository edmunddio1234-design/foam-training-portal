import React, { useState } from 'react';
import { 
  BookOpen, FileText, Download, ExternalLink, ClipboardList,
  ChevronRight, FolderOpen, Award, Users, CheckSquare, ArrowLeft, Copy, Check
} from 'lucide-react';

interface FinancialsProps {
  onBack?: () => void;
}

// Module assessment info
const MODULES = [
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
];

type TabType = 'curriculum' | 'assessments';

export const Financials: React.FC<FinancialsProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<TabType>('curriculum');
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Generate assessment URL for a specific module
  const getAssessmentUrl = (moduleId: number) => {
    return `https://foamportal.org/assessment?module=${moduleId}`;
  };

  // Copy assessment link to clipboard
  const copyAssessmentLink = async (moduleId: number) => {
    try {
      await navigator.clipboard.writeText(getAssessmentUrl(moduleId));
      setCopiedId(moduleId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 hover:bg-slate-100 rounded-lg transition-all text-slate-500 hover:text-slate-700"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <h1 className="text-2xl font-bold text-slate-800">Resources</h1>
          </div>
          <p className="text-slate-500 ml-11">Curriculum materials and class assessments</p>
        </div>
        {onBack && (
          <button
            onClick={onBack}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-all flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
        )}
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
          {/* Main Curriculum - Heyzine Flipbook */}
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
                  href="https://heyzine.com/flip-book/b5d60311c8.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-all"
                >
                  <ExternalLink size={18} />
                  View Flipbook
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
              <p className="text-sm text-slate-500 mt-1">Individual lesson guides for each module</p>
            </div>
            
            <div className="divide-y divide-slate-100">
              {MODULES.map((module) => (
                <div key={module.id} className="p-4 hover:bg-slate-50 transition-all flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold text-sm">
                      {module.id}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{module.title}</p>
                      <p className="text-xs text-slate-500">Lesson materials & facilitator guide</p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded">
                    Coming Soon
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Assessments Tab */}
      {activeTab === 'assessments' && (
        <div className="space-y-4">
          {/* Quick Access */}
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-6 text-white">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                <ClipboardList size={28} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">Digital Class Assessments</h3>
                <p className="text-emerald-100 text-sm mb-4">
                  Fathers complete assessments on their phones after each class. Responses save to Google Sheets automatically.
                </p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href="/assessment"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-white text-emerald-600 px-4 py-2 rounded-lg font-medium hover:bg-emerald-50 transition-all"
                  >
                    <ExternalLink size={18} />
                    Open Assessment Page
                  </a>
                  <a
                    href="/progress"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-800 transition-all"
                  >
                    <Users size={18} />
                    Father Progress Portal
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h4 className="font-bold text-blue-800 mb-3">How Class Assessments Work</h4>
            <ol className="space-y-2 text-sm text-blue-700">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">1</span>
                <span>At the end of class, display the QR code or share the assessment link</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">2</span>
                <span>Fathers open the link on their phones (no app needed)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">3</span>
                <span>They answer 3 quick questions and share any challenges they're facing</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">4</span>
                <span>Responses are saved to your Google Sheet for tracking and follow-up</span>
              </li>
            </ol>
          </div>

          {/* Module-Specific Assessment Links */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <CheckSquare size={18} className="text-emerald-600" />
                Module Assessment Links
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Share these links for specific modules (skips the module selection step)
              </p>
            </div>
            
            <div className="divide-y divide-slate-100">
              {MODULES.map((module) => (
                <div key={module.id} className="p-4 hover:bg-slate-50 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center font-bold text-sm">
                        {module.id}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800 text-sm">{module.title}</p>
                        <p className="text-xs text-slate-400 font-mono">/assessment?module={module.id}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyAssessmentLink(module.id)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          copiedId === module.id
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {copiedId === module.id ? (
                          <>
                            <Check size={14} />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy size={14} />
                            Copy Link
                          </>
                        )}
                      </button>
                      <a
                        href={getAssessmentUrl(module.id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-200 transition-all"
                      >
                        <ExternalLink size={14} />
                        Open
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* QR Code Tip */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-sm text-amber-800">
              <strong>💡 Pro Tip:</strong> Use the QR Check-In page to display a large, scannable QR code at the end of each class. 
              Fathers can scan it with their phone camera to go directly to the assessment.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Financials;
