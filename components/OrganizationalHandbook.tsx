import React, { useState } from 'react';
import { 
  ArrowLeft, BookOpen, FileText, Users, Shield, Briefcase, 
  CheckSquare, ChevronRight, ChevronDown, Search, Download,
  Award, Target, Heart, Clock, MapPin, Phone, Mail,
  AlertCircle, BookMarked, GraduationCap, Clipboard
} from 'lucide-react';

interface OrganizationalHandbookProps {
  onBack: () => void;
}

interface Section {
  id: string;
  title: string;
  icon: React.ElementType;
  color: string;
  content: {
    title: string;
    text: string;
  }[];
}

const OrganizationalHandbook: React.FC<OrganizationalHandbookProps> = ({ onBack }) => {
  const [activeSection, setActiveSection] = useState<string>('mission');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState<string[]>(['mission-0']);

  const sections: Section[] = [
    {
      id: 'mission',
      title: 'Mission & Vision',
      icon: Target,
      color: 'blue',
      content: [
        {
          title: 'Our Mission',
          text: 'Fathers On A Mission (FOAM) is dedicated to empowering fathers in East Baton Rouge Parish to become positive, engaged parents through comprehensive support services, education, and community resources. We believe every father has the potential to be a transformative force in their children\'s lives.'
        },
        {
          title: 'Our Vision',
          text: 'A community where every child has an actively involved, emotionally present, and supportive father figure who contributes positively to their development and well-being.'
        },
        {
          title: 'Core Values',
          text: '• Family First - We prioritize the well-being of families in all our decisions\n• Empowerment - We equip fathers with tools and knowledge for success\n• Accountability - We hold ourselves and participants to high standards\n• Community - We build supportive networks that extend beyond our programs\n• Respect - We honor the dignity and potential of every individual'
        }
      ]
    },
    {
      id: 'programs',
      title: 'Programs & Services',
      icon: Heart,
      color: 'rose',
      content: [
        {
          title: 'Responsible Fatherhood Classes',
          text: 'Our 14-module curriculum covers essential parenting skills, co-parenting strategies, financial literacy, and personal development. Classes are held weekly and fathers must complete all 14 modules to graduate from the program.'
        },
        {
          title: 'Project Family BUILD',
          text: 'Comprehensive case management services providing individualized support including goal setting, resource connections, crisis intervention, and progress monitoring. Each father receives a minimum of 5 case management sessions.'
        },
        {
          title: 'Bonding Events',
          text: 'Quarterly family events designed to strengthen father-child relationships through structured activities. These events provide opportunities for fathers to practice skills learned in class while creating positive memories with their children.'
        },
        {
          title: 'Resource Assistance',
          text: 'Emergency support services including transportation assistance, utility payment help, diaper distribution, and connections to community resources for housing, employment, and healthcare.'
        }
      ]
    },
    {
      id: 'curriculum',
      title: '14-Module Curriculum',
      icon: GraduationCap,
      color: 'emerald',
      content: [
        {
          title: 'Module 1: Conflict Resolution/Anger Management',
          text: 'Learn healthy ways to manage emotions and resolve conflicts constructively in family relationships.'
        },
        {
          title: 'Module 2: Becoming Self-Sufficient',
          text: 'Develop skills for financial independence, employment readiness, and personal responsibility.'
        },
        {
          title: 'Module 3: Personal Development',
          text: 'Focus on self-improvement, goal setting, and building a positive self-image as a father.'
        },
        {
          title: 'Module 4: Relationships',
          text: 'Build healthy relationships with partners, children, and extended family members.'
        },
        {
          title: 'Module 5: Healthy Families',
          text: 'Understand the components of healthy family dynamics and how to create a nurturing home environment.'
        },
        {
          title: 'Module 6: Parenting Skills',
          text: 'Learn age-appropriate parenting techniques, discipline strategies, and child development basics.'
        },
        {
          title: 'Module 7: Fatherhood',
          text: 'Explore the unique role of fathers and the impact of father involvement on child outcomes.'
        },
        {
          title: 'Module 8: Communication Skills',
          text: 'Develop effective communication techniques for family relationships and professional settings.'
        },
        {
          title: 'Module 9: Co-Parenting',
          text: 'Navigate shared parenting responsibilities and maintain positive co-parenting relationships.'
        },
        {
          title: 'Module 10: Child Support & Legal Issues',
          text: 'Understand child support obligations, custody rights, and navigating the legal system.'
        },
        {
          title: 'Module 11: Financial Literacy',
          text: 'Build budgeting skills, understand credit, and develop long-term financial planning strategies.'
        },
        {
          title: 'Module 12: Health & Wellness',
          text: 'Focus on physical and mental health, stress management, and healthy lifestyle choices.'
        },
        {
          title: 'Module 13: Career Development',
          text: 'Explore career pathways, job search strategies, and professional skill development.'
        },
        {
          title: 'Module 14: Graduation & Next Steps',
          text: 'Celebrate achievements, set future goals, and plan for continued growth as a father.'
        }
      ]
    },
    {
      id: 'staff',
      title: 'Staff Roles & SOPs',
      icon: Users,
      color: 'purple',
      content: [
        {
          title: 'Executive Director',
          text: 'Oversees all organizational operations, grant management, strategic planning, and external partnerships. Reports to the Board of Directors and ensures compliance with all funding requirements.'
        },
        {
          title: 'Program Manager',
          text: 'Manages day-to-day program operations, supervises case managers, coordinates class schedules, and maintains participant records. Ensures program targets are met and quality standards maintained.'
        },
        {
          title: 'Case Managers',
          text: 'Provide direct services to fathers including intake assessments, goal planning, progress monitoring, resource referrals, and crisis intervention. Each case manager maintains a caseload of approximately 35-40 active participants.'
        },
        {
          title: 'Class Facilitators',
          text: 'Lead weekly fatherhood classes using the NPCL curriculum. Responsible for attendance tracking, participant engagement, and class material preparation. Must complete facilitator training before leading classes.'
        },
        {
          title: 'Administrative Staff',
          text: 'Handle data entry, filing, scheduling, and general office operations. Maintain accurate records in all tracking systems and assist with report preparation.'
        }
      ]
    },
    {
      id: 'policies',
      title: 'Policies & Procedures',
      icon: Shield,
      color: 'amber',
      content: [
        {
          title: 'Confidentiality Policy',
          text: 'All participant information is kept strictly confidential. Staff may only share information with written consent from the participant, except in cases of mandated reporting (child abuse, harm to self/others). All records are stored securely and access is limited to authorized personnel.'
        },
        {
          title: 'Attendance Policy',
          text: 'Participants must attend at least 80% of scheduled classes to remain in good standing. Three consecutive absences without notification may result in program dismissal. Make-up sessions are available for excused absences.'
        },
        {
          title: 'Code of Conduct',
          text: 'All participants and staff are expected to maintain respectful behavior. Discrimination, harassment, violence, or substance use on premises will result in immediate dismissal. Professional boundaries must be maintained at all times.'
        },
        {
          title: 'Grievance Procedure',
          text: 'Participants may file grievances verbally or in writing with their case manager. Unresolved issues escalate to the Program Manager, then Executive Director. All grievances receive a response within 5 business days.'
        },
        {
          title: 'Documentation Standards',
          text: 'All participant interactions must be documented within 48 hours. Case notes should be objective, professional, and include date, duration, topics discussed, and next steps. Use FOAM-approved templates for all documentation.'
        }
      ]
    },
    {
      id: 'compliance',
      title: 'Compliance & Reporting',
      icon: Clipboard,
      color: 'indigo',
      content: [
        {
          title: 'Grant Compliance',
          text: 'FOAM operates under multiple funding sources including LCTF, Treasury Act 461, and private foundations. Each funder has specific reporting requirements and allowable expenses. Staff must code all expenses to the correct funding source.'
        },
        {
          title: 'Performance Metrics',
          text: '• 80% of participants achieve family stability goals\n• 75% show improvement on pre/post assessments\n• 70% complete the full 14-module curriculum\n• 100% of participants receive case management services'
        },
        {
          title: 'Reporting Schedule',
          text: 'Monthly: Internal progress reports, attendance summaries\nQuarterly: Funder reports, outcome data, financial statements\nAnnually: Annual report, audit preparation, strategic review'
        },
        {
          title: 'Data Quality Standards',
          text: 'All data must be entered within 48 hours of service delivery. Monthly data audits ensure accuracy. Discrepancies must be resolved within 5 business days. Backup systems are maintained for all electronic records.'
        }
      ]
    },
    {
      id: 'contact',
      title: 'Contact & Locations',
      icon: MapPin,
      color: 'teal',
      content: [
        {
          title: 'Main Office - Government Street',
          text: '1120 Government Street\nBaton Rouge, LA 70802\nPhone: (225) 505-FOAM\nHours: Monday-Friday, 9:00 AM - 5:00 PM'
        },
        {
          title: 'Satellite Office - Choctaw Drive',
          text: '3255 Choctaw Drive\nBaton Rouge, LA 70805\nPhone: (225) 505-FOAM\nHours: By appointment'
        },
        {
          title: 'Service Area',
          text: 'FOAM primarily serves East Baton Rouge Parish (LCTF Region 2) with focus on zip codes:\n• 70802 - Downtown/Garden District\n• 70805 - Scotlandville\n• 70806 - Mid City\n• 70807 - Zachary Road\n• 70812 - North Baton Rouge'
        },
        {
          title: 'Key Contacts',
          text: 'General Inquiries: info@foamla.org\nProgram Services: programs@foamla.org\nAdministration: admin@foamla.org\nWebsite: www.foamla.org'
        }
      ]
    }
  ];

  const toggleItem = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const activeContent = sections.find(s => s.id === activeSection);

  const getColorClasses = (color: string, type: 'bg' | 'text' | 'border') => {
    const colors: Record<string, Record<string, string>> = {
      blue: { bg: 'bg-blue-500', text: 'text-blue-600', border: 'border-blue-200' },
      rose: { bg: 'bg-rose-500', text: 'text-rose-600', border: 'border-rose-200' },
      emerald: { bg: 'bg-emerald-500', text: 'text-emerald-600', border: 'border-emerald-200' },
      purple: { bg: 'bg-purple-500', text: 'text-purple-600', border: 'border-purple-200' },
      amber: { bg: 'bg-amber-500', text: 'text-amber-600', border: 'border-amber-200' },
      indigo: { bg: 'bg-indigo-500', text: 'text-indigo-600', border: 'border-indigo-200' },
      teal: { bg: 'bg-teal-500', text: 'text-teal-600', border: 'border-teal-200' },
    };
    return colors[color]?.[type] || colors.blue[type];
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-slate-200 sticky top-0 h-screen">
        {/* Header */}
        <div className="p-6 border-b border-slate-100">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors mb-4 group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#0F2C5C] rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-slate-800">FOAM Handbook</h1>
              <p className="text-xs text-slate-400">Organizational Guide</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search handbook..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0F2C5C] focus:border-transparent"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {sections.map(section => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <li key={section.id}>
                  <button
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive 
                        ? 'bg-[#0F2C5C] text-white' 
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Icon size={18} />
                    <span className="font-medium text-sm">{section.title}</span>
                    {isActive && <ChevronRight size={16} className="ml-auto" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100">
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-all text-sm font-medium">
            <Download size={16} />
            Download PDF
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-12">
        {/* Mobile Header */}
        <div className="lg:hidden mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors mb-4"
          >
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">Back</span>
          </button>
        </div>

        {/* Section Header */}
        {activeContent && (
          <div className="max-w-4xl">
            <div className="flex items-center gap-4 mb-8">
              <div className={`w-14 h-14 ${getColorClasses(activeContent.color, 'bg')} rounded-2xl flex items-center justify-center shadow-lg`}>
                <activeContent.icon className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-slate-800">{activeContent.title}</h2>
                <p className="text-slate-500">Click on each topic to expand details</p>
              </div>
            </div>

            {/* Content Items */}
            <div className="space-y-4">
              {activeContent.content.map((item, index) => {
                const itemId = `${activeContent.id}-${index}`;
                const isExpanded = expandedItems.includes(itemId);
                return (
                  <div 
                    key={itemId}
                    className={`bg-white rounded-2xl border ${isExpanded ? getColorClasses(activeContent.color, 'border') : 'border-slate-200'} overflow-hidden transition-all`}
                  >
                    <button
                      onClick={() => toggleItem(itemId)}
                      className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-lg ${isExpanded ? getColorClasses(activeContent.color, 'bg') : 'bg-slate-100'} flex items-center justify-center transition-colors`}>
                          <span className={`font-bold text-sm ${isExpanded ? 'text-white' : 'text-slate-500'}`}>
                            {index + 1}
                          </span>
                        </div>
                        <h3 className={`font-semibold ${isExpanded ? getColorClasses(activeContent.color, 'text') : 'text-slate-800'}`}>
                          {item.title}
                        </h3>
                      </div>
                      <ChevronDown 
                        className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                      />
                    </button>
                    {isExpanded && (
                      <div className="px-6 pb-6">
                        <div className="pl-12 text-slate-600 whitespace-pre-line leading-relaxed">
                          {item.text}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default OrganizationalHandbook;
