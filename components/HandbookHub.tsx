import React from 'react';
import { 
  BookOpen, FileText, ArrowLeft, ChevronRight, 
  Users, Shield, Briefcase, CheckSquare, 
  HelpCircle, Monitor, Database, Settings
} from 'lucide-react';

interface HandbookHubProps {
  onNavigate: (view: 'org-handbook' | 'portal-guides') => void;
  onBack: () => void;
}

const HandbookHub: React.FC<HandbookHubProps> = ({ onNavigate, onBack }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Portal</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Title Section */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-[#0F2C5C] to-slate-700 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-black text-slate-800 mb-3">
            Documentation Center
          </h1>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            Access organizational policies, procedures, and portal guides to help you navigate FOAM systems effectively.
          </p>
        </div>

        {/* Two Card Options */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Organizational Handbook Card */}
          <button
            onClick={() => onNavigate('org-handbook')}
            className="group bg-white rounded-3xl p-8 shadow-lg border border-slate-200 hover:shadow-2xl hover:border-[#0F2C5C]/30 transition-all duration-300 text-left relative overflow-hidden"
          >
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#0F2C5C]/5 to-transparent rounded-full -translate-y-16 translate-x-16" />
            
            {/* Icon */}
            <div className="w-16 h-16 bg-gradient-to-br from-[#0F2C5C] to-slate-700 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
              <FileText className="w-8 h-8 text-white" />
            </div>

            {/* Title & Description */}
            <h2 className="text-2xl font-bold text-slate-800 mb-3 group-hover:text-[#0F2C5C] transition-colors">
              Organizational Handbook
            </h2>
            <p className="text-slate-500 mb-6">
              Complete guide to FOAM policies, procedures, staff roles, and compliance requirements.
            </p>

            {/* Features List */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Shield className="w-4 h-4 text-[#0F2C5C]" />
                <span>Policies & Procedures</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Users className="w-4 h-4 text-[#0F2C5C]" />
                <span>Staff Roles & SOPs</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Briefcase className="w-4 h-4 text-[#0F2C5C]" />
                <span>14-Module Curriculum</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <CheckSquare className="w-4 h-4 text-[#0F2C5C]" />
                <span>Compliance & Style Guide</span>
              </div>
            </div>

            {/* CTA */}
            <div className="flex items-center gap-2 text-[#0F2C5C] font-bold group-hover:gap-4 transition-all">
              <span>Open Handbook</span>
              <ChevronRight className="w-5 h-5" />
            </div>
          </button>

          {/* Portal Support Guides Card */}
          <button
            onClick={() => onNavigate('portal-guides')}
            className="group bg-white rounded-3xl p-8 shadow-lg border border-slate-200 hover:shadow-2xl hover:border-emerald-500/30 transition-all duration-300 text-left relative overflow-hidden"
          >
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-full -translate-y-16 translate-x-16" />
            
            {/* Icon */}
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
              <HelpCircle className="w-8 h-8 text-white" />
            </div>

            {/* Title & Description */}
            <h2 className="text-2xl font-bold text-slate-800 mb-3 group-hover:text-emerald-600 transition-colors">
              Portal Support Guides
            </h2>
            <p className="text-slate-500 mb-6">
              Step-by-step guides for using FOAM portal features and troubleshooting common issues.
            </p>

            {/* Features List */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Monitor className="w-4 h-4 text-emerald-500" />
                <span>Portal Navigation</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Database className="w-4 h-4 text-emerald-500" />
                <span>Data Entry Guides</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Settings className="w-4 h-4 text-emerald-500" />
                <span>System How-To's</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <HelpCircle className="w-4 h-4 text-emerald-500" />
                <span>FAQ & Troubleshooting</span>
              </div>
            </div>

            {/* CTA */}
            <div className="flex items-center gap-2 text-emerald-600 font-bold group-hover:gap-4 transition-all">
              <span>View Guides</span>
              <ChevronRight className="w-5 h-5" />
            </div>
          </button>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-12">
          <p className="text-slate-400 text-sm">
            Need help? Contact <span className="text-[#0F2C5C] font-medium">admin@foamla.org</span> for support.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HandbookHub;
