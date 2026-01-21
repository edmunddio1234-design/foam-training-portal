import { ModuleType, ModuleContent, Father, TrackerModule } from './types';

// CASE MANAGER TRACK - FULL 10 MODULE CURRICULUM
// VIDEO LINKS UPDATED: January 6, 2026
export const CASE_MANAGER_MODULES: ModuleContent[] = [
  // ============================================================
  // MODULE 1: ORIENTATION TO FOAM MISSION & VALUES
  // ============================================================
  {
    id: ModuleType.FOUNDATIONAL,
    title: "Orientation to FOAM Mission & Values",
    subtitle: "Module 1: The Foundational 'Why'",
    description: "To ground the Case Manager in the foundational 'Why' of FOAM, ensuring all service delivery aligns with the organization's philosophy of enhancement rather than repair.",
    videoUrl: "https://www.youtube.com/embed/lI1SYkYeCns",
    videoList: [
      {
        title: "Fathers On A Mission",
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
      },
      {
        title: "Pillar 3: Workforce Development",
        description: "The 'Economic Empowerment' pillar—sustainable income through job readiness.",
        graphic: "fa-briefcase",
        details: [
          { label: "Resume building", deepDive: "Highlighting transferable skills from non-traditional backgrounds." },
          { label: "Interview prep", deepDive: "Mock interviews and professional attire support." }
        ],
        color: "bg-amber-500"
      }
    ],
    slides: [
      "Our Mission: To enhance Fathers and Father Figures which will ultimately strengthen families.",
      "Philosophy: We do not view fathers as broken. We view them as individuals with potential.",
      "The North Star: Enhancement over repair. Empowerment over dependency."
    ],
    quiz: [
      { 
        id: "q1_1", 
        question: "What are the three pillars of FOAM?", 
        options: ["Housing, Jobs, Classes", "Project Family Build, Fatherhood Classes, Workforce Development", "Money, Support, Education", "None of the above"], 
        correctAnswer: 1 
      },
      { 
        id: "q1_2", 
        question: "What is FOAM's core philosophy?", 
        options: ["Fixing broken families", "Enhancing fathers to strengthen families", "Providing financial aid", "Crisis intervention"], 
        correctAnswer: 1 
      }
    ],
    fullText: "Module 1: Orientation. Mission: Enhance fathers to strengthen families. Pillars: Project Family Build, Fatherhood Classes, Workforce Development."
  },

  // ============================================================
  // MODULE 2: ROLE OF THE CASE MANAGER
  // ============================================================
  {
    id: ModuleType.ROLE,
    title: "Role of the Case Manager",
    subtitle: "Module 2: The Strategic Quarterback",
    description: "To define the daily operational scope of the Case Manager, emphasizing prioritization and workflow management.",
    videoUrl: "https://www.youtube.com/embed/Nl-Mu7e25os",
    videoList: [
      {
        title: "Mastering Your M365 Digital Tools",
        url: "https://www.youtube.com/embed/ARU1RmhbR-Q",
        description: "Learn to leverage Microsoft 365 tools for efficient case management."
      },
      {
        title: "Starting Our Day",
        url: "https://www.youtube.com/embed/QpIlA1YKdhE",
        description: "The daily routine and priorities for effective case management."
      },
      {
        title: "The Strategic Case Manager",
        url: "https://www.youtube.com/embed/Nl-Mu7e25os",
        description: "Mastering the art of strategic case management and client prioritization."
      },
      {
        title: "The FOAM Outreach Funnel",
        url: "https://www.youtube.com/embed/MvOi22RdtNQ",
        description: "Understanding the client journey from outreach to engagement."
      }
    ],
    videoSummary: "Your daily workflow begins with EmpowerDB. Check alerts, prioritize based on urgency, and never let tasks accumulate. You are the quarterback—coordinate, don't just execute.",
    learningObjectives: [
      { title: "Understand the daily 'Start of Day' routine.", summary: "Logging into EmpowerDB first thing to review alerts." },
      { title: "Master the prioritization framework.", summary: "Urgent vs. Important matrix for case management." },
      { title: "Learn the FOAM Outreach Funnel.", summary: "From initial contact to engaged participant." }
    ],
    infographicType: 'workflow',
    infographicDetails: [
      {
        title: "The Prioritization Rule",
        description: "You cannot do everything at once. Use this matrix.",
        graphic: "fa-list-check",
        details: [
          { label: "Urgent + Important", deepDive: "Crises, same-day deadlines, safety issues." },
          { label: "Important, Not Urgent", deepDive: "POC updates, follow-ups, relationship building." },
          { label: "Urgent, Not Important", deepDive: "Delegate or batch process." },
          { label: "Neither", deepDive: "Eliminate or defer." }
        ],
        color: "bg-[#0F2C5C]"
      }
    ],
    slides: [
      "Start your day in EmpowerDB. Alerts are your morning briefing.",
      "Prioritization is power. Use the Urgent/Important matrix.",
      "You are a strategic quarterback, not a task executor."
    ],
    quiz: [
      { 
        id: "q2_1", 
        question: "What should you do first each morning?", 
        options: ["Check email", "Review EmpowerDB alerts", "Make coffee", "Call clients"], 
        correctAnswer: 1 
      }
    ],
    fullText: "Module 2: Role of Case Manager. Daily routine: Start with EmpowerDB. Prioritize using Urgent/Important matrix."
  },

  // ============================================================
  // MODULE 3: ADULT FATHER ENGAGEMENT (OUTREACH)
  // ============================================================
  {
    id: ModuleType.OUTREACH,
    title: "Adult Father Engagement",
    subtitle: "Module 3: Outreach & Engagement",
    description: "Street teams and community presence. Go where the fathers congregate (barbershops, community centers). Authenticity and consistency are the primary tools for building trust.",
    videoUrl: "https://www.youtube.com/embed/3_JcSFpkz-E",
    videoList: [
      {
        title: "Adult Father Engagement",
        url: "https://www.youtube.com/embed/3_JcSFpkz-E",
        description: "Strategies for reaching and engaging adult fathers in the community."
      }
    ],
    videoSummary: "Community outreach is about presence and consistency. Be where fathers are—barbershops, gyms, community centers. Build trust through authentic engagement.",
    learningObjectives: [
      { title: "Identify key outreach locations.", summary: "Barbershops, community centers, gyms, churches." },
      { title: "Build authentic relationships.", summary: "Consistency and presence over sales pitches." },
      { title: "Convert contacts to participants.", summary: "The warm handoff from outreach to intake." }
    ],
    infographicType: 'pathway',
    infographicDetails: [
      {
        title: "The Outreach Funnel",
        description: "From stranger to engaged participant.",
        graphic: "fa-filter",
        details: [
          { label: "Awareness", deepDive: "They know FOAM exists." },
          { label: "Interest", deepDive: "They're curious about what we do." },
          { label: "Contact", deepDive: "We have their info." },
          { label: "Engagement", deepDive: "They've attended an event or meeting." },
          { label: "Enrollment", deepDive: "They're officially in the program." }
        ],
        color: "bg-[#0F2C5C]"
      }
    ],
    slides: [
      "Go where the fathers are. Don't wait for them to come to you.",
      "Authenticity beats marketing. Be real, be consistent.",
      "Every contact is a potential life changed."
    ],
    quiz: [
      { 
        id: "q3_1", 
        question: "What is the most effective outreach strategy?", 
        options: ["Social media ads", "Cold calling", "Community presence and consistency", "Flyers"], 
        correctAnswer: 2 
      }
    ],
    fullText: "Module 3: Outreach & Engagement. Go where fathers are. Be authentic and consistent. Build trust through presence."
  },

  // ============================================================
  // MODULE 4: TRAUMA-INFORMED PRACTICE
  // ============================================================
  {
    id: ModuleType.TRAUMA,
    title: "Trauma-Informed Practice",
    subtitle: "Module 4: Understanding the 'Why' Behind Behavior",
    description: "Shift mindset to 'What happened to you?' rather than 'What's wrong with you?'. Recognize that anger or withdrawal are often trauma responses.",
    videoUrl: "https://www.youtube.com/embed/xtJdfLWpAYk",
    videoList: [
      {
        title: "Trauma-Informed Practice",
        url: "https://www.youtube.com/embed/xtJdfLWpAYk",
        description: "Understanding trauma responses and creating safe spaces for fathers."
      }
    ],
    videoSummary: "Trauma-informed care starts with 'What happened to you?' not 'What's wrong with you?'. Create safe harbor environments where fathers can process and heal.",
    learningObjectives: [
      { title: "Recognize trauma responses.", summary: "Anger, withdrawal, hypervigilance, distrust." },
      { title: "Create safe harbor environments.", summary: "Physical and emotional safety in all interactions." },
      { title: "Practice trauma-informed communication.", summary: "Validation before correction." }
    ],
    infographicType: 'tree',
    infographicDetails: [
      {
        title: "Trauma Response Tree",
        description: "Understanding how trauma manifests in behavior.",
        graphic: "fa-tree",
        details: [
          { label: "Fight", deepDive: "Aggression, defensiveness, argumentative." },
          { label: "Flight", deepDive: "Avoidance, no-shows, withdrawal." },
          { label: "Freeze", deepDive: "Shutdown, non-responsive, dissociation." },
          { label: "Fawn", deepDive: "People-pleasing, over-compliance, loss of self." }
        ],
        color: "bg-[#0F2C5C]"
      }
    ],
    slides: [
      "Ask 'What happened to you?' not 'What's wrong with you?'",
      "Anger is often a secondary emotion masking fear or pain.",
      "Create safe harbor: physical safety, emotional safety, predictability."
    ],
    quiz: [
      { 
        id: "q4_1", 
        question: "What question should you ask instead of 'What's wrong with you?'", 
        options: ["Why are you like this?", "What happened to you?", "What's your problem?", "Why can't you change?"], 
        correctAnswer: 1 
      }
    ],
    fullText: "Module 4: Trauma-Informed Care. Ask what happened, not what's wrong. Recognize fight/flight/freeze/fawn. Create safe harbor."
  },

  // ============================================================
  // MODULE 5: INTAKE, ASSESSMENT & PLAN OF CARE
  // ============================================================
  {
    id: ModuleType.INTAKE,
    title: "Intake, Assessment & Plan of Care",
    subtitle: "Module 5: The Foundation of Service",
    description: "Standardized onboarding protocol. Collect 'Big 3' Docs: ID, SS Card, Proof of Income. Sign the ROI immediately. Finalize POC within 7 days.",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    videoList: [
      {
        title: "Intake Assessment Plan of Care",
        url: "",
        description: "Coming soon: The complete intake and assessment process."
      }
    ],
    videoSummary: "Intake is your foundation. Collect the Big 3 documents, get the ROI signed, and create a personalized Plan of Care within 7 days.",
    learningObjectives: [
      { title: "Master the intake process.", summary: "Big 3 Docs, ROI, initial assessment." },
      { title: "Create effective Plans of Care.", summary: "SMART goals, client-driven priorities." },
      { title: "Document properly in EmpowerDB.", summary: "If it's not documented, it didn't happen." }
    ],
    infographicType: 'workflow',
    infographicDetails: [
      {
        title: "The Intake Protocol",
        description: "Step-by-step onboarding process.",
        graphic: "fa-clipboard-check",
        details: [
          { label: "Big 3 Documents", deepDive: "ID, Social Security Card, Proof of Income." },
          { label: "Release of Information", deepDive: "Must be signed before any external contact." },
          { label: "Initial Assessment", deepDive: "Identify barriers, strengths, and immediate needs." },
          { label: "Plan of Care", deepDive: "Finalize within 7 days with SMART goals." }
        ],
        color: "bg-[#0F2C5C]"
      }
    ],
    slides: [
      "Big 3 Documents: ID, SS Card, Proof of Income.",
      "ROI must be signed before any external referrals.",
      "Plan of Care: Due within 7 days, SMART goals required."
    ],
    quiz: [
      { 
        id: "q5_1", 
        question: "What are the 'Big 3' documents?", 
        options: ["Resume, Cover Letter, References", "ID, SS Card, Proof of Income", "Birth Certificate, Diploma, Lease", "Pay Stubs, Bank Statements, Tax Returns"], 
        correctAnswer: 1 
      }
    ],
    fullText: "Module 5: Intake Process. Big 3 Docs: ID, SS Card, Income. Sign ROI immediately. POC within 7 days."
  },

  // ============================================================
  // MODULE 6: WORKFORCE DEVELOPMENT
  // ============================================================
  {
    id: ModuleType.WORKFORCE,
    title: "Workforce Development",
    subtitle: "Module 6: Economic Empowerment",
    description: "Assess → Prepare → Connect → Retain. Conduct check-ins at 30, 60, and 90 days post-hire. The 48-Hour Fall-Off Rule: If a job is lost, contact within 48 hours.",
    videoUrl: "https://www.youtube.com/embed/difdoolfLb0",
    videoList: [
      {
        title: "The Employment Plan in Action",
        url: "https://www.youtube.com/embed/P8-1BnIMNTo",
        description: "Creating and executing effective employment plans for fathers."
      },
      {
        title: "Workforce Support",
        url: "https://www.youtube.com/embed/difdoolfLb0",
        description: "Comprehensive workforce development strategies and support systems."
      }
    ],
    videoSummary: "Workforce development follows APCR: Assess, Prepare, Connect, Retain. Check in at 30/60/90 days. If they lose a job, reach out within 48 hours.",
    learningObjectives: [
      { title: "Assess employment readiness.", summary: "Skills, barriers, goals, work history." },
      { title: "Prepare for success.", summary: "Resume, interview skills, professional attire." },
      { title: "Connect to opportunities.", summary: "Employer partnerships, job fairs, direct referrals." },
      { title: "Retain through follow-up.", summary: "30/60/90 day check-ins, 48-hour fall-off rule." }
    ],
    infographicType: 'pathway',
    infographicDetails: [
      {
        title: "The APCR Model",
        description: "Assess → Prepare → Connect → Retain",
        graphic: "fa-briefcase",
        details: [
          { label: "Assess", deepDive: "Evaluate skills, barriers, and employment goals." },
          { label: "Prepare", deepDive: "Resume, interview prep, soft skills, attire." },
          { label: "Connect", deepDive: "Job matching, employer introductions, referrals." },
          { label: "Retain", deepDive: "30/60/90 check-ins, ongoing support, crisis intervention." }
        ],
        color: "bg-[#0F2C5C]"
      }
    ],
    slides: [
      "APCR: Assess, Prepare, Connect, Retain.",
      "30/60/90 Day Check-ins are mandatory.",
      "48-Hour Fall-Off Rule: Contact immediately after job loss."
    ],
    quiz: [
      { 
        id: "q6_1", 
        question: "What is the 48-Hour Fall-Off Rule?", 
        options: ["Submit paperwork within 48 hours", "Contact father within 48 hours of job loss", "Schedule interview within 48 hours", "Complete assessment within 48 hours"], 
        correctAnswer: 1 
      }
    ],
    fullText: "Module 6: Workforce Development. APCR model. 30/60/90 check-ins. 48-hour fall-off rule."
  },

  // ============================================================
  // MODULE 7: RESOURCE NAVIGATION (PARTNERSHIPS)
  // ============================================================
  {
    id: ModuleType.PARTNERSHIPS,
    title: "Resource Navigation",
    subtitle: "Module 7: Community Partnerships",
    description: "Strategic networking to remove external barriers. Key partner: EBR Housing Authority. Leverage 211 and local legal aids. Never work in a vacuum.",
    videoUrl: "https://www.youtube.com/embed/4BT51JrJJeE",
    videoList: [
      {
        title: "Resource Navigation",
        url: "https://www.youtube.com/embed/4BT51JrJJeE",
        description: "Building and leveraging community partnerships for client success."
      }
    ],
    videoSummary: "You can't do it alone. Build a resource network. Know your partners: Housing Authority, 211, legal aid, workforce agencies. The Resource Tree is your guide.",
    learningObjectives: [
      { title: "Build a resource network.", summary: "Identify and cultivate key community partners." },
      { title: "Master the referral process.", summary: "Warm handoffs, ROI requirements, follow-up." },
      { title: "Use the Resource Tree.", summary: "Navigate options for housing, legal, employment, and more." }
    ],
    infographicType: 'tree',
    infographicDetails: [
      {
        title: "The Resource Tree",
        description: "Key partnerships by category.",
        graphic: "fa-sitemap",
        details: [
          { label: "Housing", deepDive: "EBR Housing Authority, shelters, rapid rehousing." },
          { label: "Legal", deepDive: "Legal aid, family court resources, expungement." },
          { label: "Employment", deepDive: "Workforce Commission, temp agencies, trades programs." },
          { label: "Health", deepDive: "FQHC, mental health providers, substance abuse treatment." }
        ],
        color: "bg-[#0F2C5C]"
      }
    ],
    slides: [
      "Never work in a vacuum. Use your network.",
      "211 is your first call for unknown resources.",
      "Warm handoffs > Cold referrals."
    ],
    quiz: [
      { 
        id: "q7_1", 
        question: "What is a 'warm handoff'?", 
        options: ["Giving a phone number", "Personally introducing the client to the partner agency", "Sending an email", "Mailing paperwork"], 
        correctAnswer: 1 
      }
    ],
    fullText: "Module 7: Resource Navigation. Build partnerships. Use 211. Make warm handoffs. Never work alone."
  },

  // ============================================================
  // MODULE 8: PROTECTING OUR MISSION (DOCUMENTATION)
  // ============================================================
  {
    id: ModuleType.DOCUMENTATION,
    title: "FOAM: Protecting Our Mission",
    subtitle: "Module 8: Data & Documentation",
    description: "EmpowerDB Integrity: 'If it isn't in the system, it didn't happen.' 48-Hour Rule for all data entry. Use the FACT model.",
    videoUrl: "https://www.youtube.com/embed/9WAq-mv7me4",
    videoList: [
      {
        title: "FOAM: Protecting Our Mission",
        url: "https://www.youtube.com/embed/9WAq-mv7me4",
        description: "Documentation excellence and data integrity for program success."
      }
    ],
    videoSummary: "Documentation is protection—for the client, for you, for FOAM. Use the FACT model. Enter data within 48 hours. If it's not in EmpowerDB, it didn't happen.",
    learningObjectives: [
      { title: "Master EmpowerDB.", summary: "Accurate, timely, complete data entry." },
      { title: "Apply the FACT model.", summary: "Facts, Actions, Client Response, Target/Next Steps." },
      { title: "Follow the 48-Hour Rule.", summary: "All interactions documented within 48 hours." }
    ],
    infographicType: 'protocol',
    infographicDetails: [
      {
        title: "The FACT Model",
        description: "Documentation framework for case notes.",
        graphic: "fa-file-alt",
        details: [
          { label: "Facts", deepDive: "Objective observations. What happened?" },
          { label: "Actions", deepDive: "What did you do in response?" },
          { label: "Client Response", deepDive: "How did the client react or respond?" },
          { label: "Target/Next Steps", deepDive: "What's the plan moving forward?" }
        ],
        color: "bg-[#0F2C5C]"
      }
    ],
    slides: [
      "If it isn't in EmpowerDB, it didn't happen.",
      "FACT: Facts, Actions, Client Response, Target.",
      "48-Hour Rule: Document all interactions within 48 hours."
    ],
    quiz: [
      { 
        id: "q8_1", 
        question: "What does FACT stand for?", 
        options: ["File, Archive, Complete, Transfer", "Facts, Actions, Client Response, Target", "Find, Assess, Connect, Track", "Follow, Assist, Counsel, Train"], 
        correctAnswer: 1 
      }
    ],
    fullText: "Module 8: Documentation. FACT model. 48-hour rule. EmpowerDB is the source of truth."
  },

  // ============================================================
  // MODULE 9: CRISIS & BOUNDARIES
  // ============================================================
  {
    id: ModuleType.CRISIS,
    title: "Crisis & Boundaries",
    subtitle: "Module 9: Crisis Management",
    description: "Stabilize first. Safety is the priority. Mandatory professional boundaries: NO personal money, NO personal rides, NO rescue mindset.",
    videoUrl: "https://www.youtube.com/embed/W5lSZJvMh1o",
    videoList: [
      {
        title: "Crisis & Boundaries",
        url: "https://www.youtube.com/embed/W5lSZJvMh1o",
        description: "Managing crises while maintaining professional boundaries."
      }
    ],
    videoSummary: "In crisis, stabilize first. Safety always comes first. Maintain professional boundaries: no personal money, no personal rides, no rescue mindset. You're a guide, not a savior.",
    learningObjectives: [
      { title: "Recognize crisis situations.", summary: "Safety threats, mental health emergencies, immediate needs." },
      { title: "Apply the stabilization protocol.", summary: "Assess, secure, connect to resources." },
      { title: "Maintain professional boundaries.", summary: "No personal money, rides, or rescue behavior." }
    ],
    infographicType: 'protocol',
    infographicDetails: [
      {
        title: "Crisis Response Protocol",
        description: "Step-by-step crisis management.",
        graphic: "fa-exclamation-triangle",
        details: [
          { label: "Assess", deepDive: "Is there immediate danger to self or others?" },
          { label: "Secure", deepDive: "Ensure physical safety. Call 911 if needed." },
          { label: "Connect", deepDive: "Link to appropriate crisis resources." },
          { label: "Document", deepDive: "Record everything within 24 hours." }
        ],
        color: "bg-red-600"
      },
      {
        title: "Professional Boundaries",
        description: "Non-negotiable limits.",
        graphic: "fa-ban",
        details: [
          { label: "NO personal money", deepDive: "Never give or lend personal funds." },
          { label: "NO personal rides", deepDive: "Use agency vehicles or referrals only." },
          { label: "NO rescue mindset", deepDive: "You're a guide, not a savior." }
        ],
        color: "bg-[#0F2C5C]"
      }
    ],
    slides: [
      "Stabilize first. Safety is always the priority.",
      "Professional boundaries protect everyone.",
      "You're a guide, not a savior. Empower, don't rescue."
    ],
    quiz: [
      { 
        id: "q9_1", 
        question: "Which is NOT a professional boundary?", 
        options: ["No personal money", "No personal rides", "No personal time", "No rescue mindset"], 
        correctAnswer: 2 
      }
    ],
    fullText: "Module 9: Crisis Management. Stabilize, secure, connect. Maintain boundaries: no personal money, rides, or rescue."
  },

  // ============================================================
  // MODULE 10: CASE CLOSURE & IMPACT (SUSTAINABILITY)
  // ============================================================
  {
    id: ModuleType.SUSTAINABILITY,
    title: "Case Closure & Impact",
    subtitle: "Module 10: Sustainability & Graduation",
    description: "Criteria: Attend 12/14 classes and achieve 2 major POC goals. Perform exit interviews and update status to 'Graduated'. Empower alumni to become mentors.",
    videoUrl: "https://www.youtube.com/embed/d_fCTyInTGc",
    videoList: [
      {
        title: "Case Closure & Impact",
        url: "https://www.youtube.com/embed/d_fCTyInTGc",
        description: "Completing the journey: graduation criteria, exit interviews, and alumni engagement."
      }
    ],
    videoSummary: "Graduation is the goal. Criteria: 12/14 classes plus 2 major POC goals. Conduct exit interviews. Alumni become the next generation of mentors and recruiters.",
    learningObjectives: [
      { title: "Apply graduation criteria.", summary: "12/14 classes + 2 major POC goals." },
      { title: "Conduct exit interviews.", summary: "Capture outcomes, testimonials, and feedback." },
      { title: "Engage alumni.", summary: "Graduates become mentors, recruiters, and ambassadors." }
    ],
    infographicType: 'pathway',
    infographicDetails: [
      {
        title: "The Graduation Path",
        description: "From enrollment to alumni status.",
        graphic: "fa-graduation-cap",
        details: [
          { label: "12/14 Classes", deepDive: "Minimum attendance requirement for graduation." },
          { label: "2 POC Goals", deepDive: "Must achieve at least 2 major Plan of Care goals." },
          { label: "Exit Interview", deepDive: "Document outcomes, gather testimonial, provide certificate." },
          { label: "Alumni Status", deepDive: "Ongoing connection, mentorship opportunities." }
        ],
        color: "bg-green-600"
      }
    ],
    slides: [
      "Graduation: 12/14 classes + 2 major POC goals.",
      "Exit interviews capture the impact story.",
      "Alumni become the future of FOAM."
    ],
    quiz: [
      { 
        id: "q10_1", 
        question: "What are the graduation criteria?", 
        options: ["10 classes + 1 goal", "12/14 classes + 2 major POC goals", "14 classes + 3 goals", "Complete all modules"], 
        correctAnswer: 1 
      }
    ],
    fullText: "Module 10: Graduation. 12/14 classes + 2 POC goals. Exit interview. Alumni engagement."
  }
];

// ============================================================
// FACILITATOR TRACK MODULES (Placeholder)
// ============================================================
export const FACILITATOR_MODULES: ModuleContent[] = [];

// ============================================================
// BOARD TRACK MODULES (Placeholder)
// ============================================================
export const BOARD_MODULES: ModuleContent[] = [];

// ============================================================
// FATHERHOOD TRACKER - MODULE DEFINITIONS (CORRECTED CURRICULUM)
// ============================================================
export const TRACKER_MODULES: TrackerModule[] = [
  { id: 1, title: "Conflict Resolution/Anger Management", category: "Relationships" },
  { id: 2, title: "Becoming Self-Sufficient", category: "Life Skills" },
  { id: 3, title: "Building Your Child's Self-Esteem", category: "Parenting" },
  { id: 4, title: "Co-Parenting/Single Fatherhood", category: "Parenting" },
  { id: 5, title: "Male/Female Relationship", category: "Relationships" },
  { id: 6, title: "Manhood", category: "Identity" },
  { id: 7, title: "Values", category: "Identity" },
  { id: 8, title: "Communication/Active Listening", category: "Relationships" },
  { id: 9, title: "Dealing with Stress", category: "Life Skills" },
  { id: 10, title: "Coping with Fatherhood Discrimination", category: "Identity" },
  { id: 11, title: "Fatherhood Today", category: "Identity" },
  { id: 12, title: "Understanding Children's Needs", category: "Parenting" },
  { id: 13, title: "A Father's Influence on His Child", category: "Parenting" },
  { id: 14, title: "Relationships", category: "Relationships" }
];

// ============================================================
// SIDEBAR SUMMARY FOR AI ASSISTANT
// ============================================================
export const MODULE_SUMMARIES = [
  { 
    id: ModuleType.FOUNDATIONAL,
    title: "FOAM Mission & Values", 
    content: "North Star philosophy: Enhance, don't fix. Three pillars: Project Family Build (stability), Fatherhood Classes (education), Workforce Development (economic empowerment). Mission: Strengthen families by empowering fathers." 
  },
  { 
    id: ModuleType.ROLE,
    title: "Role of Case Manager", 
    content: "You are the strategic quarterback. Start each day in EmpowerDB. Use Urgent/Important matrix to prioritize. The FOAM Outreach Funnel: Awareness → Interest → Contact → Engagement → Enrollment." 
  },
  { 
    id: ModuleType.OUTREACH,
    title: "Adult Father Engagement", 
    content: "Go where fathers are: barbershops, gyms, community centers, churches. Authenticity > marketing. Consistency builds trust. Every contact is a potential life changed." 
  },
  { 
    id: ModuleType.TRAUMA,
    title: "Trauma-Informed Practice", 
    content: "Ask 'What happened to you?' not 'What's wrong with you?'. Recognize trauma responses: Fight, Flight, Freeze, Fawn. Create safe harbor environments. Validation before correction." 
  },
  { 
    id: ModuleType.INTAKE,
    title: "Intake & Plan of Care", 
    content: "Big 3 Docs: ID, SS Card, Proof of Income. Sign ROI immediately. Finalize POC within 7 days with SMART goals. If it's not documented, it didn't happen." 
  },
  { 
    id: ModuleType.WORKFORCE,
    title: "Workforce Development", 
    content: "APCR Model: Assess → Prepare → Connect → Retain. 30/60/90 day check-ins are mandatory. 48-Hour Fall-Off Rule: Contact immediately after job loss." 
  },
  { 
    id: ModuleType.PARTNERSHIPS,
    title: "Resource Navigation", 
    content: "Never work in a vacuum. Key partners: EBR Housing Authority, 211, legal aid, workforce agencies. Warm handoffs > cold referrals. The Resource Tree is your guide." 
  },
  { 
    id: ModuleType.DOCUMENTATION,
    title: "Protecting Our Mission", 
    content: "EmpowerDB is the source of truth. FACT Model: Facts, Actions, Client Response, Target/Next Steps. 48-Hour Rule for all documentation. If it's not in the system, it didn't happen." 
  },
  { 
    id: ModuleType.CRISIS,
    title: "Crisis & Boundaries", 
    content: "Stabilize first, safety always. Crisis protocol: Assess → Secure → Connect → Document. Professional boundaries: NO personal money, NO personal rides, NO rescue mindset. You're a guide, not a savior." 
  },
  { 
    id: ModuleType.SUSTAINABILITY,
    title: "Case Closure & Impact", 
    content: "Graduation criteria: 12/14 classes + 2 major POC goals. Conduct exit interviews. Alumni become mentors and recruiters. The cycle continues." 
  }
];

// ============================================================
// INITIAL FATHERS DATA (to be replaced with live data)
// ============================================================
export const INITIAL_FATHERS: Father[] = [];

// ============================================================
// PROGRAM DATES FOR TRACKING (FIXED - now an array for .map())
// ============================================================
export const PROGRAM_DATES: string[] = [
  '2025-01-14',
  '2025-01-21',
  '2025-01-28',
  '2025-02-04',
  '2025-02-11',
  '2025-02-18',
  '2025-02-25',
  '2025-03-04',
  '2025-03-11',
  '2025-03-18',
  '2025-03-25',
  '2025-04-01',
  '2025-04-08',
  '2025-04-15'
];

// Future threshold date for planning mode
export const FUTURE_THRESHOLD = '2025-04-16';

// ============================================================
// CLASS SCHEDULE AND LOCATION
// ============================================================
export const CLASS_LOCATION = {
  name: "FOAM Community Center",
  address: "123 Main Street, Baton Rouge, LA 70801",
  room: "Room 101"
};

export const FULL_SCHEDULE_LOG: { date: string; moduleId: number; time: string }[] = [
  { date: '2025-01-14', moduleId: 1, time: '6:00 PM' },
  { date: '2025-01-21', moduleId: 2, time: '6:00 PM' },
  { date: '2025-01-28', moduleId: 3, time: '6:00 PM' },
  { date: '2025-02-04', moduleId: 4, time: '6:00 PM' },
  { date: '2025-02-11', moduleId: 5, time: '6:00 PM' },
  { date: '2025-02-18', moduleId: 6, time: '6:00 PM' },
  { date: '2025-02-25', moduleId: 7, time: '6:00 PM' },
  { date: '2025-03-04', moduleId: 8, time: '6:00 PM' },
  { date: '2025-03-11', moduleId: 9, time: '6:00 PM' },
  { date: '2025-03-18', moduleId: 10, time: '6:00 PM' },
  { date: '2025-03-25', moduleId: 11, time: '6:00 PM' },
  { date: '2025-04-01', moduleId: 12, time: '6:00 PM' },
  { date: '2025-04-08', moduleId: 13, time: '6:00 PM' },
  { date: '2025-04-15', moduleId: 14, time: '6:00 PM' }
];

// ============================================================
// CSV PARSER UTILITY
// ============================================================
export const parseCSV = (csvText: string): Father[] => {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const fathers: Father[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    if (values.length < 2) continue;
    
    const father: Father = {
      id: values[headers.indexOf('id')] || `imported-${i}`,
      name: values[headers.indexOf('name')] || 'Unknown',
      status: (values[headers.indexOf('status')] as 'active' | 'inactive' | 'graduated') || 'active',
      enrollmentDate: values[headers.indexOf('enrollmentdate')] || values[headers.indexOf('enrollment_date')] || new Date().toISOString().split('T')[0],
      completedModules: [],
      attendance: []
    };
    
    fathers.push(father);
  }
  
  return fathers;
};
