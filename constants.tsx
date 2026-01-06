import { ModuleType, ModuleContent, Father, TrackerModule } from './types';

// CASE MANAGER TRACK - FULL 10 MODULE CURRICULUM
export const CASE_MANAGER_MODULES: ModuleContent[] = [
  {
    id: ModuleType.FOUNDATIONAL,
    title: "Orientation to FOAM Mission & Values",
    subtitle: "Module 1: The Foundational 'Why'",
    description: "To ground the Case Manager in the foundational 'Why' of FOAM, ensuring all service delivery aligns with the organization's philosophy of enhancement rather than repair.",
    videoUrl: "https://www.youtube.com/embed/lI1SYkYeCns",
    videoList: [
      {
        title: "Welcome to FOAM orientation",
        url: "https://www.youtube.com/embed/lI1SYkYeCns",
        description: "An essential introduction to the mission, vision, and core values of Fathers On A Mission."
      }
    ],
    videoSummary: "Welcome to FOAM. This module covers our North Star philosophy: We don't fix people, we enhance their existing potential. Our mission is to strengthen families by empowering fathers.",
    learningObjectives: [
      { title: "Recite and interpret the FOAM Mission Statement.", summary: "Mastering the statement: 'To enhance Fathers and Father Figures which will ultimately strengthen families.'" },
      { title: "Differentiate between 'fixing' a client and 'enhancing' a father.", summary: "Shifting from a deficit-based model to a strength-based, empowerment mindset." },
      { title: "Identify the three core service pillars of FOAM.", summary: "Understanding Project Family Build, Fatherhood Classes, and Workforce Development." }
    ],
    infographicType: 'pillars',
    infographicDetails: [
      {
        title: "Pillar 1: Project Family Build",
        description: "The 'Stability Engine'—designed to remove immediate barriers like housing and IDs.",
        graphic: "fa-house-chimney",
        details: [
          { label: "Housing referrals", deepDive: "We partner with EBR Housing Authority. Ensure the father is the primary applicant." },
          { label: "Document recovery (IDs)", deepDive: "Birth certificates and Social Security cards are foundational." }
        ],
        color: "bg-[#0F2C5C]"
      },
      {
        title: "Pillar 2: Fatherhood Classes",
        description: "The 'Education & Identity' pillar—a structured 14-session curriculum (NPCL).",
        graphic: "fa-people-group",
        details: [
          { label: "Communication skills", deepDive: "Focus on 'I' statements and active listening." },
          { label: "Identity development", deepDive: "Moving from 'Manhood' to 'Fatherhood'." }
        ],
        color: "bg-indigo-600"
      }
    ],
    slides: [
      "Our Mission: To enhance Fathers and Father Figures which will ultimately strengthen families.",
      "Philosophy: We do not view fathers as broken. We view them as individuals with potential."
    ],
    quiz: [
      { 
        id: "q1_1", 
        question: "What are the three pillars of FOAM?", 
        options: ["Housing, Jobs, Classes", "Project Family Build, Fatherhood Classes, Workforce Development", "Money, Support, Education", "None of the above"], 
        correctAnswer: 1 
      }
    ],
    fullText: "Module 1: Orientation. Mission: Enhance fathers to strengthen families. Pillars: Project Family Build, Fatherhood Classes, Workforce Development."
  },
  {
    id: ModuleType.ROLE,
    title: "Role of the Case Manager",
    subtitle: "Module 2: The Strategic Quarterback",
    description: "To define the daily operational scope of the Case Manager, emphasizing prioritization and workflow management.",
    videoUrl: "https://www.youtube.com/embed/Nl-Mu7e25os",
    learningObjectives: [
      { title: "Understand the daily 'Start of Day' routine.", summary: "Logging into EmpowerDB first thing to review alerts." }
    ],
    infographicType: 'workflow',
    infographicDetails: [
      {
        title: "The Prioritization Rule",
        description: "You cannot do everything at once. Prioritize in this strict order:",
        graphic: "fa-list-ol",
        details: [
          { label: "#1 Employed fathers at risk (Retention)", deepDive: "Always your first call." }
        ],
        color: "bg-amber-600"
      }
    ],
    slides: ["Rule: You cannot do everything at once. Prioritize!", "Start of Day: Log into EmpowerDB immediately."],
    quiz: [{ id: "q2_1", question: "What is the #1 priority?", options: ["New Intakes", "Retention", "Meetings"], correctAnswer: 1 }],
    fullText: "Module 2: Role of CM. Quarterback role. Prioritization Rule: 1. Retention."
  },
  {
    id: ModuleType.OUTREACH,
    title: "Outreach & Engagement",
    subtitle: "Module 3: Finding the Missing Father",
    description: "Tactics for identifying and recruiting fathers in the community.",
    videoUrl: "https://www.youtube.com/embed/lI1SYkYeCns",
    learningObjectives: [
      { title: "Recruitment Strategies", summary: "Street outreach, barbershop talks, and community partnerships." }
    ],
    infographicType: 'pathway',
    infographicDetails: [
      { title: "Street Teams", description: "Engaging fathers where they congregate.", details: [{ label: "Presence", deepDive: "Consistency builds trust in neighborhoods." }], color: "bg-blue-600" }
    ],
    slides: ["Go where the fathers are.", "Authenticity is your best tool."],
    quiz: [{ id: "q3_1", question: "Where is the best place to find fathers?", options: ["Office", "Community", "Online"], correctAnswer: 1 }],
    fullText: "Outreach and engagement strategies."
  },
  {
    id: ModuleType.TRAUMA,
    title: "Trauma-Informed Care",
    subtitle: "Module 4: Healing the Hidden Wounds",
    description: "Understanding the impact of trauma on fatherhood engagement.",
    videoUrl: "https://www.youtube.com/embed/lI1SYkYeCns",
    learningObjectives: [{ title: "Identify Trauma Triggers", summary: "Recognizing behavioral cues of past trauma." }],
    infographicType: 'protocol',
    infographicDetails: [{ title: "ACE Scores", description: "Adverse Childhood Experiences.", details: [{ label: "Empathy", deepDive: "Ask 'What happened to you?' not 'What's wrong?'" }], color: "bg-rose-500" }],
    slides: ["Trauma affects decision making.", "Patience is a prerequisite."],
    quiz: [{ id: "q4_1", question: "What is the key question in TIC?", options: ["Why are you late?", "What happened to you?", "Can you pay?"], correctAnswer: 1 }],
    fullText: "Trauma-informed care principles."
  },
  {
    id: ModuleType.INTAKE,
    title: "The Intake Process",
    subtitle: "Module 5: The First Handshake",
    description: "Standardized protocols for onboarding new fathers into FOAM.",
    videoUrl: "https://www.youtube.com/embed/lI1SYkYeCns",
    learningObjectives: [{ title: "Documentation Accuracy", summary: "Ensuring all state and grant requirements are met." }],
    infographicType: 'tree',
    infographicDetails: [{ title: "Paperwork Protocol", description: "ID, SSN, ROI.", details: [{ label: "ROI", deepDive: "Release of Information is mandatory." }], color: "bg-slate-700" }],
    slides: ["Intake is the foundation of data.", "Build trust during the first hour."],
    quiz: [{ id: "q5_1", question: "Which document is mandatory?", options: ["Resume", "ROI", "Gym Membership"], correctAnswer: 1 }],
    fullText: "Standardized intake procedures."
  },
  {
    id: ModuleType.WORKFORCE,
    title: "Workforce Development",
    subtitle: "Module 6: Economic Empowerment",
    description: "Preparing fathers for sustainable career paths.",
    videoUrl: "https://www.youtube.com/embed/lI1SYkYeCns",
    learningObjectives: [{ title: "Resume Building", summary: "Highlighting transferable skills for fathers with gaps." }],
    infographicType: 'pathway',
    infographicDetails: [{ title: "Career Track", description: "From entry to management.", details: [{ label: "Retention", deepDive: "Check-ins at 30, 60, 90 days." }], color: "bg-emerald-600" }],
    slides: ["Employment is a family stabilizer.", "Soft skills are as vital as hard skills."],
    quiz: [{ id: "q6_1", question: "What are the retention milestones?", options: ["1 week", "30/60/90 days", "1 year"], correctAnswer: 1 }],
    fullText: "Economic empowerment and jobs."
  },
  {
    id: ModuleType.PARTNERSHIPS,
    title: "Community Partnerships",
    subtitle: "Module 7: The Resource Network",
    description: "Leveraging external agencies to remove barriers.",
    videoUrl: "https://www.youtube.com/embed/lI1SYkYeCns",
    learningObjectives: [{ title: "Resource Mapping", summary: "Identifying local housing, legal, and food resources." }],
    infographicType: 'pillars',
    infographicDetails: [{ title: "EBR Housing", description: "Strategic partner for shelter.", details: [{ label: "Referral", deepDive: "Direct line for FOAM participants." }], color: "bg-amber-600" }],
    slides: ["We don't work in a vacuum.", "Leverage partners for 211 support."],
    quiz: [{ id: "q7_1", question: "Who is our primary housing partner?", options: ["HUD", "EBR Housing Authority", "Section 8"], correctAnswer: 1 }],
    fullText: "Partnership and networking."
  },
  {
    id: ModuleType.DOCUMENTATION,
    title: "Data & Documentation",
    subtitle: "Module 8: EmpowerDB Integrity",
    description: "The 'Golden Rule' of FOAM record keeping.",
    videoUrl: "https://www.youtube.com/embed/lI1SYkYeCns",
    learningObjectives: [{ title: "Case Notes Mastery", summary: "Using the FACT model (Facts, Actions, Client Response, Target)." }],
    infographicType: 'protocol',
    infographicDetails: [{ title: "FACT Model", description: "Objective, actionable reporting.", details: [{ label: "Notes", deepDive: "Enter within 48 hours." }], color: "bg-indigo-700" }],
    slides: ["If it isn't in the system, it didn't happen.", "Notes must be objective."],
    quiz: [{ id: "q8_1", question: "What is the data entry deadline?", options: ["1 week", "48 hours", "Same day"], correctAnswer: 1 }],
    fullText: "Record keeping excellence."
  },
  {
    id: ModuleType.CRISIS,
    title: "Crisis Management",
    subtitle: "Module 9: Stability in the Storm",
    description: "De-escalation and emergency intervention protocols.",
    videoUrl: "https://www.youtube.com/embed/lI1SYkYeCns",
    learningObjectives: [{ title: "De-escalation", summary: "Safely managing acute situational stress." }],
    infographicType: 'workflow',
    infographicDetails: [{ title: "Crisis Flow", description: "Identify, Stabilize, Refer.", details: [{ label: "911", deepDive: "When to call first responders." }], color: "bg-rose-700" }],
    slides: ["Safety is the first priority.", "Listen more than you speak in a crisis."],
    quiz: [{ id: "q9_1", question: "What is the first step in crisis?", options: ["Give money", "Stabilize", "Take a photo"], correctAnswer: 1 }],
    fullText: "Crisis and emergency protocols."
  },
  {
    id: ModuleType.SUSTAINABILITY,
    title: "Sustainability & Graduation",
    subtitle: "Module 10: Launching the Father",
    description: "Defining success and planning for long-term independence.",
    videoUrl: "https://www.youtube.com/embed/lI1SYkYeCns",
    learningObjectives: [{ title: "Exit Strategy", summary: "Planning for the father's life post-FOAM enrollment." }],
    infographicType: 'tree',
    infographicDetails: [{ title: "Graduation", description: "The final certification.", details: [{ label: "Alumni", deepDive: "Continued mentorship opportunities." }], color: "bg-emerald-800" }],
    slides: ["Success is when they don't need us.", "Alumni fathers are our best recruiters."],
    quiz: [{ id: "q10_1", question: "What defines a graduate?", options: ["Paid dues", "Completed POC goals", "Attended 1 meeting"], correctAnswer: 1 }],
    fullText: "Graduation and long term success."
  }
];

// FACILITATOR TRACK
export const FACILITATOR_MODULES: ModuleContent[] = [
  {
    id: ModuleType.FOUNDATIONAL,
    title: "The Art of Facilitation",
    subtitle: "Facilitator Module 1: Core Competencies",
    description: "Understanding the role of the facilitator in creating a transformative experience for fathers.",
    videoUrl: "https://www.youtube.com/embed/lI1SYkYeCns",
    learningObjectives: [{ title: "Define 'Facilitation' vs 'Teaching'", summary: "Shifting from expert to guide." }],
    infographicType: 'protocol',
    infographicDetails: [{ title: "The Circle", description: "Symbol of equality and trust.", details: [{ label: "Safe Space", deepDive: "Maintaining group confidentiality." }], color: "bg-blue-600" }],
    slides: ["Facilitators ask, they don't tell.", "The room is the expert."],
    quiz: [{ id: "f1", question: "What is the primary role of a facilitator?", options: ["Lecturer", "Guide", "Judge"], correctAnswer: 1 }],
    fullText: "Facilitation fundamentals."
  },
  {
    id: ModuleType.ROLE,
    title: "Group Dynamics & Conflict",
    subtitle: "Facilitator Module 2: Managing the Energy",
    description: "Techniques for navigating challenging conversations and group pushback.",
    videoUrl: "https://www.youtube.com/embed/lI1SYkYeCns",
    learningObjectives: [{ title: "Handle Disruptions", summary: "De-escalating tension within the group circle." }],
    infographicType: 'workflow',
    infographicDetails: [{ title: "Resolution Loop", description: "Listen, Validate, Refocus.", details: [{ label: "Validate", deepDive: "Acknowledging emotions without judgment." }], color: "bg-amber-600" }],
    slides: ["Conflict is an opportunity for growth.", "Address the behavior, not the person."],
    quiz: [{ id: "f2", question: "Should a facilitator ignore conflict?", options: ["Yes", "No"], correctAnswer: 1 }],
    fullText: "Managing group energy."
  }
];

// BOARD TRACK
export const BOARD_MODULES: ModuleContent[] = [
  {
    id: ModuleType.FOUNDATIONAL,
    title: "Governance & Fiduciary Duty",
    subtitle: "Board Module 1: Legal Stewardship",
    description: "The legal and ethical responsibilities of serving on the FOAM Board of Directors.",
    videoUrl: "https://www.youtube.com/embed/lI1SYkYeCns",
    learningObjectives: [{ title: "Understand Duty of Care", summary: "Exercising prudent decision-making." }],
    infographicType: 'pillars',
    infographicDetails: [{ title: "Board Pillars", description: "Care, Loyalty, Obedience.", details: [{ label: "Loyalty", deepDive: "Putting FOAM interests above personal gain." }], color: "bg-slate-900" }],
    slides: ["Board members protect the mission.", "Fiduciary duty is a legal mandate."],
    quiz: [{ id: "b1", question: "Which duty involves putting FOAM first?", options: ["Duty of Care", "Duty of Loyalty", "Duty of Speed"], correctAnswer: 1 }],
    fullText: "Board governance overview."
  },
  {
    id: ModuleType.ROLE,
    title: "Strategic Oversight",
    subtitle: "Board Module 2: Guiding the Vision",
    description: "How the Board supports organizational growth without micro-managing operations.",
    videoUrl: "https://www.youtube.com/embed/lI1SYkYeCns",
    learningObjectives: [{ title: "Oversight vs. Operations", summary: "Respecting the CEO's operational boundary." }],
    infographicType: 'tree',
    infographicDetails: [{ title: "Strategic Tree", description: "Vision at the top, Support at the roots.", details: [{ label: "Sustainability", deepDive: "Long-term fiscal planning." }], color: "bg-emerald-600" }],
    slides: ["The Board sets the 'Where', Staff handles the 'How'.", "Fundraising is a collective duty."],
    quiz: [{ id: "b2", question: "Does the Board manage daily staffing?", options: ["Yes", "No"], correctAnswer: 1 }],
    fullText: "Strategic growth oversight."
  }
];

// Default Export for backward compatibility
export const FOAM_MODULES = CASE_MANAGER_MODULES;

// --- FATHERHOOD TRACKER: 14-CLASS CURRICULUM (NPCL) ---
export const TRACKER_MODULES: TrackerModule[] = [
  { id: 1, title: "Manhood", category: "Foundation" },
  { id: 2, title: "Values", category: "Foundation" },
  { id: 3, title: "Communication/Active Listening", category: "Relationship" },
  { id: 4, title: "Dealing with Stress", category: "Health" },
  { id: 5, title: "Coping with Fatherhood Discrimination", category: "Social" },
  { id: 6, title: "Fatherhood Today", category: "Foundation" },
  { id: 7, title: "Understanding Children's Needs", category: "Parenting" },
  { id: 8, title: "A Father's Influence on His Child", category: "Parenting" },
  { id: 9, title: "Relationships", category: "Relationship" },
  { id: 10, title: "Conflict Resolution/Anger Management", category: "Relationship" },
  { id: 11, title: "Becoming Self-Sufficient", category: "Life Skills" },
  { id: 12, title: "Building Your Child's Self-Esteem", category: "Parenting" },
  { id: 13, title: "Co-Parenting/Single Fatherhood", category: "Parenting" },
  { id: 14, title: "Male/Female Relationship", category: "Relationship" },
];

// --- ALL 178 FATHERS FROM FOAM DATABASE (Imported from Excel) ---
export const INITIAL_FATHERS: Father[] = [
  { id: "1", firstName: "Aaron", lastName: "Banks", phone: "2259339855", email: "aaron.banks@example.org", completedModules: [8], joinedDate: "2024-01-01", status: "At Risk" },
  { id: "2", firstName: "Adrian", lastName: "Churchill", phone: null, email: "adrian.churchill@example.org", completedModules: [7], joinedDate: "2024-01-01", status: "At Risk" },
  { id: "3", firstName: "Albion", lastName: "Dawson", phone: null, email: "albion.dawson@example.org", completedModules: [1, 5, 6, 7, 8, 9, 11], joinedDate: "2024-01-01", status: "Active" },
  { id: "4", firstName: "Alfred", lastName: "(Al) Bergeron", phone: null, email: "alfred.albergeron@example.org", completedModules: [1, 2, 4, 5, 7, 8, 9, 10, 11], joinedDate: "2024-01-01", status: "Active" },
  { id: "5", firstName: "Andre", lastName: "Nettles", phone: null, email: "andre.nettles@example.org", completedModules: [1, 2, 3, 8], joinedDate: "2024-01-01", status: "Active" },
  { id: "6", firstName: "Andre", lastName: "Williams", phone: null, email: "andre.williams@example.org", completedModules: [2, 4, 5, 11], joinedDate: "2024-01-01", status: "Active" },
  { id: "7", firstName: "Anthony", lastName: "(Tony) Morris", phone: null, email: "anthony.tonymorris@example.org", completedModules: [8], joinedDate: "2024-01-01", status: "At Risk" },
  { id: "8", firstName: "Archie", lastName: "Lee", phone: "7576421664", email: "archie.lee@example.org", completedModules: [3, 6, 10, 12, 13, 14], joinedDate: "2024-01-01", status: "Active" },
  { id: "9", firstName: "Archie.j.lee", lastName: "", phone: "7576421664", email: null, completedModules: [5, 11], joinedDate: "2024-01-01", status: "Active" },
  { id: "10", firstName: "Arnest", lastName: "Porter", phone: "2252053346", email: "arnest.porter@example.org", completedModules: [14], joinedDate: "2024-01-01", status: "At Risk" },
  { id: "11", firstName: "Bernard", lastName: "Dent", phone: null, email: "bernard.dent@example.org", completedModules: [1, 2, 5, 6, 7, 11], joinedDate: "2024-01-01", status: "Active" },
  { id: "12", firstName: "Brandon", lastName: "browder", phone: "2253781055", email: "brandon.browder@example.org", completedModules: [14], joinedDate: "2024-01-01", status: "At Risk" },
  { id: "13", firstName: "Brandon", lastName: "Browder", phone: "2253781055", email: "brandon.browder@example.org", completedModules: [6], joinedDate: "2024-01-01", status: "At Risk" },
  { id: "14", firstName: "Brandon", lastName: "Bruce", phone: null, email: "brandon.bruce@example.org", completedModules: [1, 2], joinedDate: "2024-01-01", status: "Active" },
  { id: "15", firstName: "Brandon", lastName: "horton", phone: "2254841825", email: "brandon.horton@example.org", completedModules: [11], joinedDate: "2024-01-01", status: "At Risk" },
  { id: "16", firstName: "Brandon", lastName: "lang", phone: "2259315405", email: "brandon.lang@example.org", completedModules: [13], joinedDate: "2024-01-01", status: "At Risk" },
  { id: "17", firstName: "Bristen", lastName: "", phone: "2253644288", email: null, completedModules: [13], joinedDate: "2024-01-01", status: "At Risk" },
  { id: "18", firstName: "Bristen", lastName: "Tate", phone: null, email: "bristen.tate@example.org", completedModules: [6, 7, 8, 12], joinedDate: "2024-01-01", status: "Active" },
  { id: "19", firstName: "Bryan", lastName: "Comeaux", phone: "2252763553", email: "bryan.comeaux@example.org", completedModules: [1, 3, 4, 7, 8, 9, 11, 12, 13, 14], joinedDate: "2024-01-01", status: "Active" },
  { id: "20", firstName: "Byron", lastName: "Washington", phone: null, email: "byron.washington@example.org", completedModules: [11], joinedDate: "2024-01-01", status: "At Risk" },
  { id: "21", firstName: "Caleb", lastName: "", phone: "3865626828", email: null, completedModules: [9], joinedDate: "2024-01-01", status: "At Risk" },
  { id: "22", firstName: "Carlese", lastName: "Baker", phone: "2259545645", email: "carlese.baker@example.org", completedModules: [1], joinedDate: "2024-01-01", status: "At Risk" },
  { id: "23", firstName: "Carson", lastName: "Camarion", phone: null, email: "carson.camarion@example.org", completedModules: [6], joinedDate: "2024-01-01", status: "At Risk" },
  { id: "24", firstName: "Cedrick", lastName: "Johnson", phone: null, email: "cedrick.johnson@example.org", completedModules: [11], joinedDate: "2024-01-01", status: "At Risk" },
  { id: "25", firstName: "Charle", lastName: "Thompson", phone: "2252393869", email: "charle.thompson@example.org", completedModules: [12], joinedDate: "2024-01-01", status: "At Risk" },
  { id: "26", firstName: "Charles", lastName: "", phone: "2252393869", email: null, completedModules: [13], joinedDate: "2024-01-01", status: "At Risk" },
  { id: "27", firstName: "Charles", lastName: "Guidry", phone: null, email: "charles.guidry@example.org", completedModules: [2, 5, 6, 7, 8, 11], joinedDate: "2024-01-01", status: "Active" },
  { id: "28", firstName: "Charles", lastName: "Thompson", phone: null, email: "charles.thompson@example.org", completedModules: [1, 5, 6, 7, 11, 12, 13], joinedDate: "2024-01-01", status: "Active" },
  { id: "29", firstName: "Christopher", lastName: "Bennett", phone: "2255223162", email: "christopher.bennett@example.org", completedModules: [1, 2, 5, 6, 7, 8, 9, 11], joinedDate: "2024-01-01", status: "Active" },
  { id: "30", firstName: "Christopher", lastName: "hartley", phone: "2254596659", email: "christopher.hartley@example.org", completedModules: [12], joinedDate: "2024-01-01", status: "At Risk" },
  { id: "31", firstName: "Christopher", lastName: "Lucas", phone: null, email: "christopher.lucas@example.org", completedModules: [1, 11], joinedDate: "2024-01-01", status: "Active" },
  { id: "32", firstName: "Cliff", lastName: "Lewis", phone: "2252058551", email: "cliff.lewis@example.org", completedModules: [11], joinedDate: "2024-01-01", status: "At Risk" },
  { id: "33", firstName: "Cody", lastName: "Gordon", phone: null, email: "cody.gordon@example.org", completedModules: [1, 7, 11], joinedDate: "2024-01-01", status: "Active" },
  { id: "34", firstName: "Colby", lastName: "Davis", phone: null, email: "colby.davis@example.org", completedModules: [6], joinedDate: "2024-01-01", status: "At Risk" },
  { id: "35", firstName: "Coldman", lastName: "Johnson", phone: "2258030531", email: "coldman.johnson@example.org", completedModules: [5], joinedDate: "2024-01-01", status: "At Risk" },
  { id: "36", firstName: "Conial", lastName: "Caldwell", phone: null, email: "conial.caldwell@example.org", completedModules: [2], joinedDate: "2024-01-01", status: "At Risk" },
  { id: "37", firstName: "Craig", lastName: "Morgan", phone: null, email: "craig.morgan@example.org", completedModules: [1], joinedDate: "2024-01-01", status: "At Risk" },
  { id: "38", firstName: "Craig", lastName: "Oxley", phone: null, email: "craig.oxley@example.org", completedModules: [6, 8], joinedDate: "2024-01-01", status: "Active" },
  { id: "39", firstName: "D'Qualyn", lastName: "Grant", phone: null, email: "dqualyn.grant@example.org", completedModules: [1, 11], joinedDate: "2024-01-01", status: "Active" },
  { id: "40", firstName: "DAngelo", lastName: "Christopher", phone: "2259542358", email: "dangelo.christopher@example.org", completedModules: [6], joinedDate: "2024-01-01", status: "At Risk" },
  { id: "41", firstName: "DAngelo", lastName: "d Christopher", phone: null, email: "dangelo.dchristopher@example.org", completedModules: [2], joinedDate: "2024-01-01", status: "At Risk" },
  { id: "42", firstName: "Darion", lastName: "Parker", phone: "2252245962", email: "darion.parker@example.org", completedModules: [1, 7, 9, 11, 12, 13, 14], joinedDate: "2024-01-01", status: "Active" },
  { id: "43", firstName: "Daron", lastName: "Franklin", phone: "5048580090", email: "daron.franklin@example.org", completedModules: [3, 6, 12], joinedDate: "2024-01-01", status: "Active" },
  { id: "44", firstName: "Daronshel", lastName: "Blackman", phone: null, email: "daronshel.blackman@example.org", completedModules: [6], joinedDate: "2024-01-01", status: "At Risk" },
  { id: "45", firstName: "David", lastName: "", phone: "2258922067", email: null, completedModules: [7], joinedDate: "2024-01-01", status: "At Risk" },
  { id: "46", firstName: "David", lastName: "Anthony butler", phone: "2254939057", email: "david.anthonybutler@example.org", completedModules: [5], joinedDate: "2024-01-01", status: "At Risk" },
  { id: "47", firstName: "David", lastName: "Butler", phone: "2254474440", email: "david.butler@example.org", completedModules: [13], joinedDate: "2024-01-01", status: "At Risk" },
  { id: "48", firstName: "David", lastName: "butler", phone: "2254399057", email: "david.butler@example.org", completedModules: [9], joinedDate: "2024-01-01", status: "At Risk" },
  { id: "49", firstName: "Demetric", lastName: "Henderson", phone: null, email: "demetric.henderson@example.org", completedModules: [1], joinedDate: "2024-01-01", status: "At Risk" },
  { id: "50", firstName: "Deondric", lastName: "Chaney", phone: null, email: "deondric.chaney@example.org", completedModules: [6, 8, 10], joinedDate: "2024-01-01", status: "Active" },
  { id: "51", firstName: "DeShawn", lastName: "Anderson", phone: "2255772676", email: "deshawn.anderson@example.org", completedModules: [3], joinedDate: "2024-01-01", status: "At Risk" },
  { id: "52", firstName: "Dewayland", lastName: "Rolax", phone: "3372923502", email: "dewayland.rolax@example.org", completedModules: [6, 13], joinedDate: "2024-01-01", status: "Active" },
  { id: "53", firstName: "Dewayne", lastName: "Ruffin L Jr.", phone: null, email: "dewayne.ruffinljr@example.org", completedModules: [8], joinedDate: "2024-01-01", status: "At Risk" },
  { id: "54", firstName: "Dewitt", lastName: "Ward", phone: "5045594857", email: "dewitt.ward@example.org", completedModules: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14], joinedDate: "2024-01-01", status: "Graduated" },
  { id: "55", firstName: "Don", lastName: "Caffery", phone: "2259380564", email: "don.caffery@example.org", completedModules: [3], joinedDate: "2024-01-01", status: "At Risk" },
  { id: "56", firstName: "Donovan", lastName: "Davis", phone: null, email: "donovan.davis@example.org", completedModules: [8], joinedDate: "2024-01-01", status: "At Risk" },
  { id: "57", firstName: "Donte", lastName: "Jackson", phone: null, email: "donte.jackson@example.org", completedModules: [2], joinedDate: "2024-01-01", status: "At Risk" },
  { id: "58", firstName: "Dwayne", lastName: "Ruffin", phone: "2254093637", email: "dwayne.ruffin@example.org", completedModules: [2, 8, 10], joinedDate: "2024-01-01", status: "Active" },
  { id: "59", firstName: "Edward", lastName: "Scott", phone: null, email: "edward.scott@example.org", completedModules: [1, 2, 3, 5, 6, 7, 8, 9, 10, 11, 12], joinedDate: "2024-01-01", status: "Active" },
  { id: "60", firstName: "Eric", lastName: "", phone: "2253769692", email: null, completedModules: [6], joinedDate: "2024-01-01", status: "At Risk" },
  { id: "61", firstName: "Eric", lastName: "D Sander", phone: null, email: "eric.dsander@example.org", completedModules: [8], joinedDate: "2024-01-01", status: "At Risk" },
  { id: "62", firstName: "Eric", lastName: "Patterson", phone: "4044921060", email: "eric.patterson@example.org", completedModules: [4, 8, 12], joinedDate: "2024-01-01", status: "Active" },
  { id: "63", firstName: "Eric", lastName: "Sander", phone: "2258281513", email: "eric.sander@example.org", completedModules: [10], joinedDate: "2024-01-01", status: "At Risk" },
  { id: "64", firstName: "Eric", lastName: "Sanders", phone: "2258281513", email: "eric.sanders@example.org", completedModules: [1, 3, 5, 9, 11, 12, 13], joinedDate: "2024-01-01", status: "Active" },
  { id: "65", firstName: "Ernest", lastName: "porter", phone: "2252053346", email: "ernest.porter@example.org", completedModules: [2], joinedDate: "2024-01-01", status: "At Risk" },
  { id: "66", firstName: "Ernest", lastName: "Jenkins", phone: null, email: "ernest.jenkins@example.org", completedModules: [1], joinedDate: "2024-01-01", status: "At Risk" },
  { id: "67", firstName: "Ernest", lastName: "Jordan", phone: null, email: "ernest.jordan@example.org", completedModules: [6], joinedDate: "2024-01-01", status: "At Risk" },
  { id: "68", firstName: "Ernest", lastName: "Porter", phone: "2252053346", email: "ernest.porter@example.org", completedModules: [1, 4, 13, 14], joinedDate: "2024-01-01", status: "Active" },
  { id: "69", firstName: "Ernie", lastName: "Clark", phone: "2255731149", email: "ernie.clark@example.org", completedModules: [3, 5], joinedDate: "2024-01-01", status: "Active" },
  { id: "70", firstName: "Ezekiel", lastName: "", phone: "2258770836", email: null, completedModules: [6], joinedDate: "2024-01-01", status: "At Risk" },
  { id: "71", firstName: "Garrey", lastName: "Johnson", phone: "2253549296", email: "garrey.johnson@example.org", completedModules: [4], joinedDate: "2024-01-01", status: "At Risk" },
  { id: "72", firstName: "Gregory", lastName: "Johnson", phone: null, email: "gregory.johnson@example.org", completedModules: [5], joinedDate: "2024-01-01", status: "At Risk" },
  { id: "73", firstName: "Henry", lastName: "king", phone: "2255092329", email: "henry.king@example.org", completedModules: [2, 3], joinedDate: "2024-01-01", status: "Active" },
  { id: "74", firstName: "Irvin", lastName: "Williams", phone: null, email: "irvin.williams@example.org", completedModules: [1, 6, 9], joinedDate: "2024-01-01", status: "Active" },
  { id: "75", firstName: "Ja\"Korius", lastName: "Montgomery", phone: null, email: "jakorius.montgomery@example.org", completedModules: [11], joinedDate: "2024-01-01", status: "At Risk" },
  { id: "76", firstName: "Jabari", lastName: "Paul", phone: null, email: "jabari.paul@example.org", completedModules: [9], joinedDate: "2024-01-01", status: "At Risk" },
  { id: "77", firstName: "Jalen", lastName: "", phone: "2252876828", email: null, completedModules: [1], joinedDate: "2024-01-01", status: "At Risk" },
  { id: "78", firstName: "Jalen", lastName: "Butler", phone: "2252876828", email: "jalen.butler@example.org", completedModules: [3], joinedDate: "2024-01-01", status: "At Risk" },
  { id: "79", firstName: "James", lastName: "Polk", phone: "2257261603", email: "james.polk@example.org", completedModules: [4, 5, 6, 8, 12, 13], joinedDate: "2024-01-01", status: "Active" },
  { id: "80", firstName: "James", lastName: "Williams", phone: "2256039519", email: "james.williams@example.org", completedModules: [2, 3, 6], joinedDate: "2024-01-01", status: "Active" },
  { id: "81", firstName: "Jamie", lastName: "Polk", phone: "2257261603", email: "jamie.polk@example.org", completedModules: [6], joinedDate: "2024-01-01", status: "At Risk" },
  { id: "82", firstName: "Jan", lastName: "Noble", phone: "2253630671", email: "jan.noble@example.org", completedModules: [1, 10], joinedDate: "2024-01-01", status: "Active" },
  { id: "83", firstName: "JeCorey", lastName: "Collins", phone: null, email: "jecorey.collins@example.org", completedModules: [1, 2, 6, 11], joinedDate: "2024-01-01", status: "Active" },
  { id: "84", firstName: "Jeff", lastName: "Williams", phone: "2252685942", email: "jeff.williams@example.org", completedModules: [5], joinedDate: "2024-01-01", status: "At Risk" },
  { id: "85", firstName: "Jeffery", lastName: "", phone: "2255065747", email: null, completedModules: [10], joinedDate: "2024-01-01", status: "At Risk" },
  { id: "86", firstName: "Jeremiah", lastName: "Banks", phone: null, email: "jeremiah.banks@example.org", completedModules: [1, 5, 6, 11], joinedDate: "2024-01-01", status: "Active" },
  { id: "87", firstName: "Jermaine", lastName: "Taylor", phone: null, email: "jermaine.taylor@example.org", completedModules: [1, 2, 6, 7, 8, 9], joinedDate: "2024-01-01", status: "Active" },
  { id: "88", firstName: "Jimmie", lastName: "Smith", phone: null, email: "jimmie.smith@example.org", completedModules: [1, 2, 5, 6, 7, 8, 9, 11], joinedDate: "2024-01-01", status: "Active" },
  { id: "89", firstName: "Jocobie", lastName: "James", phone: null, email: "jocobie.james@example.org", completedModules: [13], joinedDate: "2024-01-01", status: "At Risk" },
  { id: "90", firstName: "John", lastName: "Neal", phone: "1225572281", email: "john.neal@example.org", completedModules: [3], joinedDate: "2024-01-01", status: "At Risk" },
  { id: "91", firstName: "Johnathan", lastName: "Haney", phone: null, email: "johnathan.haney@example.org", completedModules: [1, 3, 7, 8, 9, 10, 12], joinedDate: "2024-01-01", status: "Active" },
  { id: "92", firstName: "Jonathan", lastName: "Haney", phone: "2254254416", email: "jonathan.haney@example.org", completedModules: [13], joinedDate: "2024-01-01", status: "At Risk" },
  { id: "93", firstName: "Jordan", lastName: "Harrison", phone: "5416755533", email: "jordan.harrison@example.org", completedModules: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 13, 14], joinedDate: "2024-01-01", status: "Active" },
  { id: "94", firstName: "Joseph", lastName: "Williams", phone: null, email: "joseph.williams@example.org", completedModules: [1, 4, 5, 7, 9], joinedDate: "2024-01-01", status: "Active" },
  { id: "95", firstName: "Joyrie", lastName: "Knighton", phone: "2258022486", email: "joyrie.knighton@example.org", completedModules: [6, 8], joinedDate: "2024-01-01", status: "Active" },
  { id: "96", firstName: "Keandre", lastName: "mack", phone: "2253847002", email: "keandre.mack@example.org", completedModules: [7], joinedDate: "2024-01-01", status: "At Risk" },
  { id: "97", firstName: "Keandre", lastName: "mock", phone: null, email: "keandre.mock@example.org", completedModules: [13], joinedDate: "2024-01-01", status: "At Risk" },
  { id: "98", firstName: "Kendale", lastName: "", phone: "2252764442", email: null, completedModules: [7, 13], joinedDate: "2024-01-01", status: "Active" },
  { id: "99", firstName: "Kendale", lastName: "Cryer", phone: "2252764442", email: "kendale.cryer@example.org", completedModules: [10, 11, 12, 13], joinedDate: "2024-01-01", status: "Active" },
  { id: "100", firstName: "Kenneth", lastName: "Davis", phone: null, email: "kenneth.davis@example.org", completedModules: [1, 2, 4], joinedDate: "2024-01-01", status: "Active" },
  { id: "101", firstName: "Kenneth", lastName: "Rankin's Sr.", phone: null, email: "kenneth.rankinsssr@example.org", completedModules: [4], joinedDate: "2024-01-01", status: "At Risk" },
  { id: "102", firstName: "Kenneth", lastName: "Rankins", phone: "2252391265", email: "kenneth.rankins@example.org", completedModules: [2, 4, 5, 7], joinedDate: "2024-01-01", status: "Active" },
  { id: "103", firstName: "Keondric", lastName: "Chaney", phone: "2258310043", email: "keondric.chaney@example.org", completedModules: [1, 2, 3, 4, 5, 6, 8, 10, 11], joinedDate: "2024-01-01", status: "Active" },
  { id: "104", firstName: "Keontrae", lastName: "Murray", phone: "5045101225", email: "keontrae.murray@example.org", completedModules: [2, 3, 4, 5, 6, 10, 12, 13], joinedDate: "2024-01-01", status: "Active" },
  { id: "105", firstName: "Keyon", lastName: "Marshall", phone: "2255212147", email: "keyon.marshall@example.org", completedModules: [2, 3, 7], joinedDate: "2024-01-01", status: "Active" },
  { id: "106", firstName: "Koby", lastName: "Jackson", phone: null, email: "koby.jackson@example.org", completedModules: [12], joinedDate: "2024-01-01", status: "At Risk" },
  { id: "107", firstName: "Kornell", lastName: "Baloney", phone: null, email: "kornell.baloney@example.org", completedModules: [1], joinedDate: "2024-01-01", status: "At Risk" },
  { id: "108", firstName: "Kornell", lastName: "baloney", phone: "2254768195", email: "kornell.baloney@example.org", completedModules: [10, 13], joinedDate: "2024-01-01", status: "Active" },
  { id: "109", firstName: "Kourtney", lastName: "Marshall", phone: null, email: "kourtney.marshall@example.org", completedModules: [11], joinedDate: "2024-01-01", status: "At Risk" },
  { id: "110", firstName: "Kyle", lastName: "Eames", phone: null, email: "kyle.eames@example.org", completedModules: [12], joinedDate: "2024-01-01", status: "At Risk" },
  { id: "111", firstName: "Kyree", lastName: "Thorne", phone: null, email: "kyree.thorne@example.org", completedModules: [2], joinedDate: "2024-01-01", status: "At Risk" },
  { id: "112", firstName: "Kywong", lastName: "Moore", phone: "2253268444", email: "kywong.moore@example.org", completedModules: [3, 4, 5, 7], joinedDate: "2024-01-01", status: "Active" },
  { id: "113", firstName: "Lamord", lastName: "Jackson", phone: null, email: "lamord.jackson@example.org", completedModules: [12], joinedDate: "2024-01-01", status: "At Risk" },
  { id: "114", firstName: "Larry", lastName: "Mike", phone: null, email: "larry.mike@example.org", completedModules: [1, 2, 4, 5, 6, 7, 8, 11], joinedDate: "2024-01-01", status: "Active" },
  { id: "115", firstName: "Larry", lastName: "Ross", phone: null, email: "larry.ross@example.org", completedModules: [2], joinedDate: "2024-01-01", status: "At Risk" },
  { id: "116", firstName: "Laurent", lastName: "Randall", phone: null, email: "laurent.randall@example.org", completedModules: [5, 6], joinedDate: "2024-01-01", status: "Active" },
  { id: "117", firstName: "Layne", lastName: "Jordan", phone: "2254595547", email: "layne.jordan@example.org", completedModules: [7], joinedDate: "2024-01-01", status: "At Risk" },
  { id: "118", firstName: "Louis", lastName: "Shawl", phone: null, email: "louis.shawl@example.org", completedModules: [6], joinedDate: "2024-01-01", status: "At Risk" },
  { id: "119", firstName: "Luke", lastName: "Freeman", phone: "2253664421", email: "luke.freeman@example.org", completedModules: [1, 2, 4, 5, 7, 8, 13, 14], joinedDate: "2024-01-01", status: "Active" },
  { id: "120", firstName: "Madhav", lastName: "Saxena", phone: null, email: "madhav.saxena@example.org", completedModules: [5, 10], joinedDate: "2024-01-01", status: "Active" },
  { id: "121", firstName: "Mark", lastName: "Powell", phone: null, email: "mark.powell@example.org", completedModules: [1], joinedDate: "2024-01-01", status: "At Risk" },
  { id: "122", firstName: "Matthew", lastName: "Abrams", phone: null, email: "matthew.abrams@example.org", completedModules: [1, 4, 5, 6, 7, 8, 9, 10, 12, 13], joinedDate: "2024-01-01", status: "Active" },
  { id: "123", firstName: "Michael", lastName: "", phone: "2252848213", email: null, completedModules: [2], joinedDate: "2024-01-01", status: "At Risk" },
  { id: "124", firstName: "Michael", lastName: "Buckner", phone: null, email: "michael.buckner@example.org", completedModules: [1, 2, 4, 5, 6, 7, 8, 9, 10], joinedDate: "2024-01-01", status: "Active" },
  { id: "125", firstName: "Michael", lastName: "Butler", phone: "2254484485", email: "michael.butler@example.org", completedModules: [1, 2, 3, 4, 5, 6, 8, 12, 13], joinedDate: "2024-01-01", status: "Active" },
  { id: "126", firstName: "Michael", lastName: "Colston", phone: null, email: "michael.colston@example.org", completedModules: [6], joinedDate: "2024-01-01", status: "At Risk" },
  { id: "127", firstName: "Michael", lastName: "Dright", phone: "6015969899", email: "michael.dright@example.org", completedModules: [13], joinedDate: "2024-01-01", status: "At Risk" },
  { id: "128", firstName: "Michael", lastName: "Harris", phone: "2256781883", email: "michael.harris@example.org", completedModules: [6, 7, 8, 11, 12, 13], joinedDate: "2024-01-01", status: "Active" },
  { id: "129", firstName: "Michael", lastName: "Johnson", phone: null, email: "michael.johnson@example.org", completedModules: [4], joinedDate: "2024-01-01", status: "At Risk" },
  { id: "130", firstName: "Mikyle", lastName: "Carter", phone: null, email: "mikyle.carter@example.org", completedModules: [2, 5, 14], joinedDate: "2024-01-01", status: "Active" },
  { id: "131", firstName: "Mohamed", lastName: "Aly", phone: null, email: "mohamed.aly@example.org", completedModules: [8], joinedDate: "2024-01-01", status: "At Risk" },
  { id: "132", firstName: "Moses", lastName: "Evans", phone: null, email: "moses.evans@example.org", completedModules: [12], joinedDate: "2024-01-01", status: "At Risk" },
  { id: "133", firstName: "Nicholas", lastName: "Menina", phone: null, email: "nicholas.menina@example.org", completedModules: [8], joinedDate: "2024-01-01", status: "At Risk" },
  { id: "134", firstName: "Onae", lastName: "Chatman", phone: "6623975781", email: "onae.chatman@example.org", completedModules: [5], joinedDate: "2024-01-01", status: "At Risk" },
  { id: "135", firstName: "Onre", lastName: "Batiste", phone: null, email: "onre.batiste@example.org", completedModules: [1, 6], joinedDate: "2024-01-01", status: "Active" },
  { id: "136", firstName: "Orland", lastName: "", phone: "2255015494", email: null, completedModules: [13], joinedDate: "2024-01-01", status: "At Risk" },
  { id: "137", firstName: "Orlando", lastName: "Alexander", phone: "2255015494", email: "orlando.alexander@example.org", completedModules: [1, 3, 6, 7, 9, 11, 13, 14], joinedDate: "2024-01-01", status: "Active" },
  { id: "138", firstName: "Percy", lastName: "Heard", phone: null, email: "percy.heard@example.org", completedModules: [5], joinedDate: "2024-01-01", status: "At Risk" },
  { id: "139", firstName: "Quentin", lastName: "Carter", phone: null, email: "quentin.carter@example.org", completedModules: [10], joinedDate: "2024-01-01", status: "At Risk" },
  { id: "140", firstName: "Quentiss", lastName: "Jackson", phone: null, email: "quentiss.jackson@example.org", completedModules: [2, 4, 8], joinedDate: "2024-01-01", status: "Active" },
  { id: "141", firstName: "Rafael", lastName: "Vega", phone: "2254910302", email: "rafael.vega@example.org", completedModules: [1, 2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14], joinedDate: "2024-01-01", status: "Active" },
  { id: "142", firstName: "Ray", lastName: "Smith", phone: "2259755149", email: "ray.smith@example.org", completedModules: [1, 2, 3, 4, 5, 7, 8, 12, 13, 14], joinedDate: "2024-01-01", status: "Active" },
  { id: "143", firstName: "Reggie", lastName: "Randall", phone: null, email: "reggie.randall@example.org", completedModules: [11], joinedDate: "2024-01-01", status: "At Risk" },
  { id: "144", firstName: "Reginald", lastName: "Maten", phone: null, email: "reginald.maten@example.org", completedModules: [1, 9], joinedDate: "2024-01-01", status: "Active" },
  { id: "145", firstName: "Ricky", lastName: "Day", phone: null, email: "ricky.day@example.org", completedModules: [1, 2, 4, 5, 6, 7, 8, 9, 11], joinedDate: "2024-01-01", status: "Active" },
  { id: "146", firstName: "Rico", lastName: "McQuirter", phone: null, email: "rico.mcquirter@example.org", completedModules: [1, 2, 5, 10], joinedDate: "2024-01-01", status: "Active" },
  { id: "147", firstName: "Robert", lastName: "Ayala", phone: "5124845182", email: "robert.ayala@example.org", completedModules: [8, 10], joinedDate: "2024-01-01", status: "Active" },
  { id: "148", firstName: "Robert", lastName: "Williams", phone: "2254767158", email: "robert.williams@example.org", completedModules: [1, 2, 3, 5, 7, 10, 13, 14], joinedDate: "2024-01-01", status: "Active" },
  { id: "149", firstName: "Ronald", lastName: "williams", phone: "2254334501", email: "ronald.williams@example.org", completedModules: [3], joinedDate: "2024-01-01", status: "At Risk" },
  { id: "150", firstName: "Roy", lastName: "Thompson", phone: null, email: "roy.thompson@example.org", completedModules: [5], joinedDate: "2024-01-01", status: "At Risk" },
  { id: "151", firstName: "Ruffin", lastName: "Dwayne L Jr", phone: null, email: "ruffin.dwayneljr@example.org", completedModules: [8], joinedDate: "2024-01-01", status: "At Risk" },
  { id: "152", firstName: "Ryan", lastName: "Coleman", phone: null, email: "ryan.coleman@example.org", completedModules: [4, 6], joinedDate: "2024-01-01", status: "Active" },
  { id: "153", firstName: "Sam", lastName: "Mason", phone: "2252707241", email: "sam.mason@example.org", completedModules: [2], joinedDate: "2024-01-01", status: "At Risk" },
  { id: "154", firstName: "Samual", lastName: "Mason", phone: null, email: "samual.mason@example.org", completedModules: [8], joinedDate: "2024-01-01", status: "At Risk" },
  { id: "155", firstName: "Samuel", lastName: "Mason", phone: "2252707241", email: "samuel.mason@example.org", completedModules: [4], joinedDate: "2024-01-01", status: "At Risk" },
  { id: "156", firstName: "Samuel", lastName: "mason", phone: null, email: "samuel.mason@example.org", completedModules: [13], joinedDate: "2024-01-01", status: "At Risk" },
  { id: "157", firstName: "Shomari", lastName: "Pugh", phone: null, email: "shomari.pugh@example.org", completedModules: [1, 2, 5, 6, 8, 9, 11, 14], joinedDate: "2024-01-01", status: "Active" },
  { id: "158", firstName: "Steven", lastName: "Howard", phone: null, email: "steven.howard@example.org", completedModules: [1, 2, 6, 11], joinedDate: "2024-01-01", status: "Active" },
  { id: "159", firstName: "Taylor", lastName: "Gentile", phone: null, email: "taylor.gentile@example.org", completedModules: [7, 12], joinedDate: "2024-01-01", status: "Active" },
  { id: "160", firstName: "Thaddeus", lastName: "Curtain", phone: "2252491791", email: "thaddeus.curtain@example.org", completedModules: [14], joinedDate: "2024-01-01", status: "At Risk" },
  { id: "161", firstName: "Tim", lastName: "Carter", phone: null, email: "tim.carter@example.org", completedModules: [2, 3, 4, 5, 6, 7, 13], joinedDate: "2024-01-01", status: "Active" },
  { id: "162", firstName: "Tim", lastName: "Leblanc", phone: null, email: "tim.leblanc@example.org", completedModules: [1], joinedDate: "2024-01-01", status: "At Risk" },
  { id: "163", firstName: "Timothy", lastName: "Carr", phone: "2259376783", email: "timothy.carr@example.org", completedModules: [9, 10], joinedDate: "2024-01-01", status: "Active" },
  { id: "164", firstName: "Timothy", lastName: "Carter", phone: "2252396158", email: "timothy.carter@example.org", completedModules: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14], joinedDate: "2024-01-01", status: "Graduated" },
  { id: "165", firstName: "Timothy", lastName: "Morgan", phone: "2254424312", email: "timothy.morgan@example.org", completedModules: [6], joinedDate: "2024-01-01", status: "At Risk" },
  { id: "166", firstName: "Timthoy", lastName: "J Carter", phone: null, email: "timthoy.jcarter@example.org", completedModules: [8], joinedDate: "2024-01-01", status: "At Risk" },
  { id: "167", firstName: "Tramel", lastName: "Tolliver", phone: null, email: "tramel.tolliver@example.org", completedModules: [8], joinedDate: "2024-01-01", status: "At Risk" },
  { id: "168", firstName: "Travis", lastName: "London", phone: "2252640809", email: "travis.london@example.org", completedModules: [1, 2, 6, 7, 8, 12], joinedDate: "2024-01-01", status: "Active" },
  { id: "169", firstName: "Travis", lastName: "Samuels", phone: null, email: "travis.samuels@example.org", completedModules: [2, 7, 8, 11], joinedDate: "2024-01-01", status: "Active" },
  { id: "170", firstName: "Tray'von", lastName: "Davis", phone: null, email: "trayvon.davis@example.org", completedModules: [11], joinedDate: "2024-01-01", status: "At Risk" },
  { id: "171", firstName: "Tre'", lastName: "Gramise", phone: null, email: "tre.gramise@example.org", completedModules: [7], joinedDate: "2024-01-01", status: "At Risk" },
  { id: "172", firstName: "Trevion", lastName: "major", phone: "2254696389", email: "trevion.major@example.org", completedModules: [6], joinedDate: "2024-01-01", status: "At Risk" },
  { id: "173", firstName: "Tshona", lastName: "Carter", phone: "2254189811", email: "tshona.carter@example.org", completedModules: [2, 3, 4, 6, 7, 9, 14], joinedDate: "2024-01-01", status: "Active" },
  { id: "174", firstName: "Ty", lastName: "Harlan", phone: "9857895350", email: "ty.harlan@example.org", completedModules: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14], joinedDate: "2024-01-01", status: "Graduated" },
  { id: "175", firstName: "Tyrzell", lastName: "Simmons", phone: "2259608604", email: "tyrzell.simmons@example.org", completedModules: [5, 7], joinedDate: "2024-01-01", status: "Active" },
  { id: "176", firstName: "Vic", lastName: "", phone: "2254139075", email: null, completedModules: [6], joinedDate: "2024-01-01", status: "At Risk" },
  { id: "177", firstName: "Vic", lastName: "Hollins Jr.", phone: null, email: "vic.hollinsjr@example.org", completedModules: [12, 13], joinedDate: "2024-01-01", status: "Active" },
  { id: "178", firstName: "William", lastName: "Ruffin", phone: "9195918530", email: "william.ruffin@example.org", completedModules: [1, 3, 4, 5, 6, 8, 10, 12, 13, 14], joinedDate: "2024-01-01", status: "Active" }
];

// Program dates and schedule
const generateTuesdays = (startYear: number, endYear: number) => {
  const tuesdays: string[] = [];
  for (let year = startYear; year <= endYear; year++) {
    for (let month = 0; month < 12; month++) {
      let d = new Date(year, month, 1);
      while (d.getDay() !== 2) d.setDate(d.getDate() + 1);
      while (d.getMonth() === month) {
        tuesdays.push(d.toISOString().split('T')[0]);
        d.setDate(d.getDate() + 7);
      }
    }
  }
  return tuesdays;
};

export const PROGRAM_DATES = generateTuesdays(2025, 2026);

export const FULL_SCHEDULE_LOG = PROGRAM_DATES.map((date, index) => ({
  date,
  topic: TRACKER_MODULES[index % TRACKER_MODULES.length].title
}));

export const FUTURE_THRESHOLD = "2026-01-06";

export const CLASS_LOCATION = {
  name: "FYSC Building",
  address: "11120 Government Street, Baton Rouge, Louisiana 70802",
  fullName: "Family and Youth Service Center"
};

export const parseCSV = (text: string): Father[] => {
  const lines = text.trim().split('\n');
  if (lines.length <= 1) return [];
  return lines.slice(1).map(line => {
    const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
    if (parts.length < 2) return null;
    const id = parts[0].trim().replace(/"/g, '');
    let fullName = parts[1].trim().replace(/"/g, '');
    let firstName = fullName.split(' ')[0], lastName = fullName.split(' ').slice(1).join(' ');
    const modulesCount = parseInt(parts[4] || '0', 10);
    return {
      id, firstName, lastName, phone: parts[2] || null, email: parts[3] || null,
      completedModules: Array.from({ length: modulesCount }, (_, i) => i + 1),
      joinedDate: '2024-01-01',
      status: modulesCount === 14 ? 'Graduated' : modulesCount < 2 ? 'At Risk' : 'Active',
    } as Father;
  }).filter((f): f is Father => f !== null);
};
