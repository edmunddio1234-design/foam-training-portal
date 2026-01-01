
import { ModuleType, ModuleContent, Father, TrackerModule } from './types';

// CASE MANAGER TRACK - FULL 10 MODULE CURRICULUM
export const CASE_MANAGER_MODULES: ModuleContent[] = [
  {
    id: ModuleType.FOUNDATIONAL,
    title: "Orientation to FOAM Mission & Values",
    subtitle: "Module 1: The Foundational 'Why'",
    description: "To ground the Case Manager in the foundational 'Why' of FOAM, ensuring all service delivery aligns with the organization’s philosophy of enhancement rather than repair.",
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

// --- FATHERHOOD TRACKER CONSTANTS ---
export const TRACKER_MODULES: TrackerModule[] = [
  { id: 1, title: "Conflict Resolution/Anger Management", category: "Relationship" },
  { id: 2, title: "Becoming Self-Sufficient", category: "Life Skills" },
  { id: 3, title: "Building Your Child’s Self-Esteem", category: "Parenting" },
  { id: 4, title: "Co-Parenting/Single Fatherhood", category: "Parenting" },
  { id: 5, title: "Male/Female Relationship", category: "Relationship" },
  { id: 6, title: "Manhood", category: "Foundation" },
  { id: 7, title: "Values", category: "Foundation" },
  { id: 8, title: "Communication/Active Listening", category: "Relationship" },
  { id: 9, title: "Dealing with Stress", category: "Health" },
  { id: 10, title: "Coping with Fatherhood Discrimination", category: "Social" },
  { id: 11, title: "Fatherhood Today", category: "Foundation" },
  { id: 12, title: "Understanding Children's Needs", category: "Parenting" },
  { id: 13, title: "A Father’s Influence on His Child", category: "Parenting" },
  { id: 14, title: "Relationships", category: "Relationship" },
];

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

// --- EXPANDED ROSTER DATA (235+ FATHERS) ---
const FIRST_NAMES = ["Aaron", "Archie", "Bryan", "Rafael", "Ty", "James", "Robert", "John", "Michael", "David", "William", "Richard", "Joseph", "Thomas", "Christopher", "Charles", "Daniel", "Matthew", "Anthony", "Mark", "Donald", "Steven", "Paul", "Andrew", "Joshua", "Kenneth", "Kevin", "Brian", "George", "Timothy", "Ronald", "Edward", "Jason", "Jeffrey", "Gary", "Jacob", "Nicholas", "Eric", "Jonathan", "Stephen", "Larry", "Justin", "Scott", "Brandon", "Benjamin", "Samuel", "Gregory", "Alexander", "Patrick", "Frank", "Raymond", "Jack", "Dennis", "Jerry", "Tyler", "Aaron", "Jose", "Adam", "Nathan", "Henry", "Douglas", "Zachary", "Peter", "Kyle", "Ethan", "Walter", "Harold", "Jeremy", "Christian", "Keith", "Roger", "Noah", "Gerald", "Carl", "Terry", "Sean", "Lawrence", "Arthur", "Austin", "Jesse", "Jordan", "Bryan", "Billy", "Joe", "Bruce", "Gabriel", "Logan", "Louis", "Albert", "Willie", "Alan", "Juan", "Wayne", "Elijah", "Randy", "Roy", "Vincent", "Ralph", "Eugene", "Russell", "Bobby", "Mason", "Philip", "Louis"];
const LAST_NAMES = ["Banks", "Lee", "Comeaux", "Vega", "Harlan", "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores", "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell", "Carter", "Roberts", "Gomez", "Phillips", "Evans", "Turner", "Diaz", "Parker", "Cruz", "Edwards", "Collins", "Reyes", "Stewart", "Morris", "Morales", "Murphy", "Cook", "Rogers", "Gutierrez", "Ortiz", "Morgan", "Cooper", "Peterson", "Bailey", "Reed", "Kelly", "Howard", "Ramos", "Kim", "Foster", "Ward", "Richardson", "Watson", "Brooks", "Chavez", "Wood", "James", "Bennett", "Gray", "Mendoza", "Ruiz", "Hughes", "Price", "Alvarez", "Castillo", "Sanders", "Patel", "Myers", "Long", "Ross", "Foster"];

export const generateFullRoster = (): Father[] => {
  const roster: Father[] = [];
  
  // Seed with 235 unique fathers to match the user's expected "230-plus" roster
  for (let i = 1; i <= 235; i++) {
    const firstName = FIRST_NAMES[i % FIRST_NAMES.length];
    const lastName = LAST_NAMES[i % LAST_NAMES.length];
    
    // Vary module completion counts for a realistic status mix
    let modules: number[] = [];
    if (i === 1) modules = [10, 13]; // Original Aaron
    else if (i === 2) modules = [3, 6, 10, 12, 13, 14]; // Original Archie
    else if (i === 3) modules = [1, 3, 4, 7, 8, 9, 11, 12, 13, 14]; // Original Bryan
    else if (i === 4) modules = [1, 2, 4, 5, 6, 8, 9, 10, 11, 12, 13, 14]; // Original Rafael
    else if (i === 5) modules = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]; // Original Ty
    else {
      // Logic for the other 230 fathers
      const completionLevel = Math.random();
      if (completionLevel > 0.9) {
        // High completion (Graduated)
        modules = Array.from({ length: 14 }, (_, i) => i + 1);
      } else if (completionLevel > 0.3) {
        // Active progress
        const count = Math.floor(Math.random() * 11) + 2;
        modules = Array.from({ length: count }, (_, i) => i + 1);
      } else {
        // At Risk (low completion)
        const count = Math.floor(Math.random() * 2);
        modules = count === 0 ? [] : [Math.floor(Math.random() * 14) + 1];
      }
    }

    roster.push({
      id: i.toString(),
      firstName: firstName,
      lastName: lastName,
      phone: `225-${Math.floor(100+Math.random()*900)}-${Math.floor(1000+Math.random()*9000)}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.org`,
      completedModules: modules,
      joinedDate: '2024-01-01',
      status: modules.length === 14 ? 'Graduated' : modules.length < 2 ? 'At Risk' : 'Active',
    });
  }
  return roster;
};

export const INITIAL_FATHERS = generateFullRoster();

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
