
import { ModuleType, ModuleContent } from './types';

export const FOAM_MODULES: ModuleContent[] = [
  {
    id: ModuleType.FOUNDATIONAL,
    title: "Orientation to FOAM Mission & Values",
    subtitle: "Module 1: The Foundational 'Why'",
    description: "To ground the Case Manager in the foundational 'Why' of FOAM, ensuring all service delivery aligns with the organization’s philosophy of enhancement rather than repair.",
    videoUrl: "https://www.youtube.com/embed/lI1SYkYeCns",
    connectUrl: "https://aistudio.google.com/u/0/apps/drive/16syPzeB5OHpbzn-20EIdgeOfiEybULXM?showPreview=true&showAssistant=true",
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
          { label: "Housing referrals", deepDive: "We partner with EBR Housing Authority. Ensure the father is the primary applicant to build his sense of provider responsibility." },
          { label: "Document recovery (IDs)", deepDive: "Birth certificates and Social Security cards are foundational. We assist with fees and logistics to ensure legal visibility." },
          { label: "Basic needs support", deepDive: "Emergency food, clothing, and hygiene products are provided through the pantry to remove immediate survival stress." },
          { label: "Behavioral health access", deepDive: "Mental health and addiction support are integrated through warm hand-offs to clinical partners." }
        ],
        color: "bg-[#0F2C5C]"
      },
      {
        title: "Pillar 2: Fatherhood Classes",
        description: "The 'Education & Identity' pillar—a structured 14-session curriculum (NPCL).",
        graphic: "fa-people-group",
        details: [
          { label: "Communication skills", deepDive: "Focus on 'I' statements and active listening to reduce conflict in co-parenting relationships." },
          { label: "Identity development", deepDive: "Moving from 'Manhood' to 'Fatherhood'—redefining strength as presence and emotional consistency." },
          { label: "Co-parenting tools", deepDive: "Techniques for managing relationship friction without using the child as a messenger or shield." },
          { label: "Self-sufficiency", deepDive: "Developing a 12-month life plan that aligns fatherly duties with professional growth." }
        ],
        color: "bg-indigo-600"
      },
      {
        title: "Pillar 3: Workforce Development",
        description: "The 'Career Advancement' pillar—end-to-end support for employment.",
        graphic: "fa-briefcase",
        details: [
          { label: "Resume building", deepDive: "Translating diverse life experiences into professional skills that resonate with industrial and service-sector employers." },
          { label: "Interview coaching", deepDive: "Mock interviews focusing on explaining background barriers with accountability and confidence." },
          { label: "Job placement", deepDive: "Direct pipelines to partner employers like Brown & Root who value the FOAM endorsement." },
          { label: "Retention check-ins", deepDive: "A strategic priority. We check in at 30/60/90 days to solve workplace conflicts before they lead to quitting." }
        ],
        color: "bg-[#1A4D2E]"
      }
    ],
    infographicPractice: {
      title: "Scenario: Enhancing vs. Fixing",
      scenario: "A father enters your office angry about a denied housing application.",
      steps: [
        "Incorrect Response: Correcting his attitude (Fixing).",
        "Correct Response: Acknowledge frustration and barriers (Trauma-Informed).",
        "Action: Pivot to the next step in Project Family Build (Enhancing).",
        "Key Takeaway: We are partners, not saviors."
      ]
    },
    slides: [
      "Our Mission: To enhance Fathers and Father Figures which will ultimately strengthen families.",
      "Philosophy: We do not view fathers as broken. We view them as individuals with potential.",
      "Whole-Family Approach: Supporting the father stabilizes the entire family unit.",
      "Consistency Builds Trust: Many men have been let down before; if you say you will call, you call."
    ],
    slideDeepDives: [
      "This is our North Star. Every action you take must align with this mission.",
      "Our job is to add value to the capacity they already possess.",
      "Your direct client is the adult father, but the impact is for the children.",
      "Reliability is the foundation of the relationship."
    ],
    quiz: [
      { 
        id: "q1_1", 
        question: "What are the three pillars of FOAM?", 
        options: ["Housing, Jobs, Classes", "Project Family Build, Responsible Fatherhood Classes, Workforce Development", "Money, Support, Education", "None of the above"], 
        correctAnswer: 1 
      },
      { 
        id: "q1_2", 
        question: "What is the difference between 'Fixing' and 'Enhancing'?", 
        options: ["Fixing is faster", "Enhancing adds value to existing potential; Fixing implies the person is broken", "Fixing is for moms, Enhancing is for dads", "There is no difference"], 
        correctAnswer: 1 
      }
    ],
    fullText: "Module 1: Orientation. Mission: Enhance fathers to strengthen families. Pillars: Project Family Build (Stability), Responsible Fatherhood Classes (NPCL curriculum), Workforce Development (Career)."
  },
  {
    id: ModuleType.ROLE,
    title: "Role of the Case Manager",
    subtitle: "Module 2: The Strategic Quarterback",
    description: "To define the daily operational scope of the Case Manager, emphasizing prioritization and workflow management.",
    videoUrl: "https://www.youtube.com/embed/Nl-Mu7e25os",
    connectUrl: "https://aistudio.google.com/u/0/apps/drive/16syPzeB5OHpbzn-20EIdgeOfiEybULXM?showPreview=true&showAssistant=true",
    videoList: [
      {
        title: "The Strategic Case Manager",
        url: "https://www.youtube.com/embed/Nl-Mu7e25os",
        description: "Mastering the mindset of a strategic coordinator at FOAM."
      },
      {
        title: "Your Digital Toolkit & Start of Day",
        url: "https://www.youtube.com/embed/QpIlA1YKdhE",
        description: "A walkthrough of the essential tools used daily for client management."
      },
      {
        title: "Mastering M365 Digital Tools",
        url: "https://www.youtube.com/embed/ARU1RmhbR-Q",
        description: "Technical guide to leveraging Microsoft 365 for documentation and collaboration."
      },
      {
        title: "The FOAM Outreach Funnel",
        url: "https://www.youtube.com/embed/MvOi22RdtNQ",
        description: "Understanding how referrals move through the FOAM system from outreach to intake."
      }
    ],
    videoSummary: "Module 2 provides the practical roadmap for daily operations. You are the 'Quarterback' responsible for ensuring every father moves efficiently through our three pillars while prioritizing job retention.",
    learningObjectives: [
      { title: "Understand the daily 'Start of Day' routine.", summary: "Logging into EmpowerDB first thing to review alerts, appointments, and urgent follow-ups." },
      { title: "Apply the FOAM Prioritization Rule.", summary: "Mastering the 1-5 hierarchy where retention always comes first." }
    ],
    infographicType: 'workflow',
    infographicDetails: [
      {
        title: "The Prioritization Rule",
        description: "You cannot do everything at once. Prioritize in this strict order:",
        graphic: "fa-list-ol",
        details: [
          { label: "#1 Employed fathers at risk (Retention)", deepDive: "Always your first call. If a father is at risk of losing income, the whole family's stability is threatened." },
          { label: "#2 Fathers starting new jobs", deepDive: "First-day logistics: boots, transportation, and schedule confirmation take priority over general tasks." },
          { label: "#3 Interviews", deepDive: "Ensure the father has clean clothes, the address, and a mock-interview refresher before he walks out the door." },
          { label: "#4 Barrier removal", deepDive: "IDs, housing paperwork, and medical appointments fall into the general workday flow." },
          { label: "#5 New intakes", deepDive: "While vital, a new intake never supersedes keeping an existing client employed." }
        ],
        color: "bg-amber-600"
      },
      {
        title: "The Quarterback Role",
        description: "You coordinate services across the entire ecosystem.",
        graphic: "fa-football",
        details: [
          { label: "Review EmpowerDB daily", deepDive: "Look for automated alerts, missed appointments, and pending follow-ups before the morning meeting." },
          { label: "Prepare caseload summaries", deepDive: "Categorize your fathers by 'Ready for Work', 'In Training', or 'Needs Documentation'." },
          { label: "Prepare 'Stuck/Resources/Decisions'", deepDive: "Identify fathers who haven't progressed in 14 days and bring these to supervision for a strategy shift." }
        ],
        color: "bg-[#0F2C5C]"
      }
    ],
    infographicPractice: {
      title: "Scenario: Prioritization Rule",
      scenario: "You have a new intake scheduled, but a current client calls saying he might be fired because his car broke down.",
      steps: [
        "Rule Check: Priority #1 is Retention (employed father at risk).",
        "Action: Address the transportation crisis immediately.",
        "Outcome: Move the intake only after the crisis is managed.",
        "Takeaway: Retention always comes first."
      ]
    },
    slides: [
      "Rule: You cannot do everything at once. Prioritize!",
      "Start of Day: Log into EmpowerDB immediately for alerts.",
      "The First Call: If a father is at risk of losing his job, he is your first call.",
      "Caseload Summary: Prepare weekly summaries highlighting who is 'stuck'."
    ],
    quiz: [
      { id: "q2_1", question: "What is the first thing a Case Manager should do at the start of the day?", options: ["Check email", "Log into EmpowerDB", "Call new referrals", "Drink coffee"], correctAnswer: 1 },
      { id: "q2_2", question: "What is the #1 priority category in your daily workflow?", options: ["New Intakes", "Interviews", "Employed fathers at risk (Retention)", "Meetings"], correctAnswer: 2 }
    ],
    fullText: "Module 2: Role of CM. Quarterback role. Prioritization Rule: 1. Retention, 2. New Jobs, 3. Interviews, 4. Barrier removal, 5. New Intakes. Workflow: EmpowerDB check first."
  },
  {
    id: ModuleType.OUTREACH,
    title: "Adult Father Engagement & Trust",
    subtitle: "Module 3: Outreach Protocols",
    description: "To teach the protocols for outreach and initial contact, ensuring fathers are engaged quickly and respectfully.",
    videoUrl: "https://www.youtube.com/embed/3_JcSFpkz-E",
    videoList: [
      {
        title: "Adult Father Engagement",
        url: "https://www.youtube.com/embed/3_JcSFpkz-E",
        description: "Essential strategies for initial outreach and building immediate trust with new referrals."
      }
    ],
    videoSummary: "Speed and persistence build trust. A referral's motivation has a shelf life—don't let it sit.",
    learningObjectives: [
      { title: "Apply the '3-Day Rule' for new referrals.", summary: "Every referral must receive a contact attempt within 3 business days." },
      { title: "Demonstrate the 'Pre-Screening Call' script.", summary: "Briefly explain FOAM using the 'Hook': 'We help fathers with jobs, stability, and support.'" }
    ],
    infographicType: 'protocol',
    infographicDetails: [
      {
        title: "The 3-Day Rule",
        description: "Contact attempt within 72 hours of referral.",
        graphic: "72",
        details: [
          { label: "Motivation has a shelf life", deepDive: "The moment a father asks for help is the peak of his readiness. If we wait, he loses faith in the system." },
          { label: "Do not let a referral sit", deepDive: "Even if you can't do an intake, a text saying 'I've received your info and will call tomorrow' validates his outreach." },
          { label: "Log the attempt immediately", deepDive: "Documentation of speed proves our responsiveness to funding partners and supervisors." }
        ],
        color: "bg-blue-500"
      },
      {
        title: "3-Attempt Protocol",
        description: "Required steps before escalating or closing.",
        graphic: "3",
        details: [
          { label: "Call", deepDive: "Morning or early evening is best. Use a professional, warm tone." },
          { label: "Text", deepDive: "Many fathers respond faster to text. Keep it brief and focused on the 'Hook'." },
          { label: "Email", deepDive: "The official third attempt. Useful for fathers with limited phone minutes but active Wi-Fi." },
          { label: "If unresponsive, escalate", deepDive: "Bring to supervisor for 'Case Closing' approval after 3 failed contact methods." }
        ],
        color: "bg-emerald-500"
      },
      {
        title: "The 'Hook'",
        description: "Your simple elevator pitch for FOAM.",
        graphic: "fa-phone",
        hookText: "\"We help fathers with jobs, stability, and support.\"",
        details: [
          { label: "Warm, professional tone", deepDive: "Sound like a partner, not a debt collector or a police officer." },
          { label: "Brief explanation", deepDive: "Explain FOAM in under 30 seconds. We are here to 'enhance', not to report." },
          { label: "Schedule intake immediately", deepDive: "Never end a call without a locked-in date and time for the first meeting." }
        ],
        color: "bg-indigo-600"
      }
    ],
    infographicPractice: {
      title: "Scenario: The First Attempt",
      scenario: "You receive a referral for 'David' on Tuesday. You call and get no answer.",
      steps: [
        "Action 1: Leave a voicemail.",
        "Action 2: Send a follow-up text immediately.",
        "Action 3: Log attempt in EmpowerDB as 'Contact Note'.",
        "Action 4: Set reminder for Attempt 2 on Thursday."
      ]
    },
    slides: [
      "Speed builds trust: Outreach within 72 hours.",
      "Persistence: 3 documented attempts (Call/Text/Email).",
      "The Pre-Screening: Briefly explain the Hook.",
      "No Answer? Leave a voicemail and send a text immediately."
    ],
    quiz: [
      { id: "q3_1", question: "What is the maximum time allowed to contact a new referral?", options: ["24 hours", "3 business days", "5 days", "1 week"], correctAnswer: 1 },
      { id: "q3_2", question: "How many attempts must you make before marking a case inactive?", options: ["1", "2", "3", "5"], correctAnswer: 2 }
    ],
    fullText: "Module 3: Outreach. 3-Day Rule (72 hours). 3-Attempt Protocol (Call, Text, Email). The Hook: 'We help fathers with jobs, stability, and support.'"
  },
  {
    id: ModuleType.TRAUMA,
    title: "Trauma-Informed & Strengths-Based Practice",
    subtitle: "Module 4: Mindset and Language",
    description: "To equip Case Managers with the communication skills necessary to work with men who may have experienced systemic failure.",
    videoUrl: "https://www.youtube.com/embed/xtJdfLWpAYk",
    videoList: [
      {
        title: "Trauma-Informed Practice & Mindset",
        url: "https://www.youtube.com/embed/xtJdfLWpAYk",
        description: "The core philosophy of providing a 'Safe Harbor' and shifting from fixing to enhancing."
      },
      {
        title: "Mindset Refresher: What Happened?",
        url: "https://www.youtube.com/embed/xtJdfLWpAYk",
        description: "A quick guide on applying the 'What happened to you?' approach in daily interactions."
      }
    ],
    videoSummary: "We provide a safe harbor. We judge the barrier, not the man. Shift the question from 'What's wrong?' to 'What happened?'.",
    learningObjectives: [
      { title: "Apply trauma-informed questioning.", summary: "Asking 'What happened to you?' to understand behavior as a response to barriers." },
      { title: "Identify strengths in crisis.", summary: "Using the 'Enhance' mindset to identify survival skills and existing assets." }
    ],
    infographicType: 'pathway',
    infographicDetails: [
      {
        title: "Judgmental Perspective",
        description: "Asks 'What is wrong with you?'. Focuses on deficits and character.",
        graphic: "fa-circle-xmark",
        details: [
          { label: "Labels like 'unmotivated'", deepDive: "Assuming a father doesn't care because he is late, rather than checking for transport barriers." },
          { label: "Interrogation-style intakes", deepDive: "Asking 'Why don't you have a job?' instead of 'Tell me about your last workplace experience'." },
          { label: "Judging the person", deepDive: "Focusing on the mistake rather than the environment that fostered it." }
        ],
        color: "bg-rose-500"
      },
      {
        title: "Trauma-Informed",
        description: "Asks 'What happened to you?'. Focuses on understanding context.",
        graphic: "fa-shield-heart",
        details: [
          { label: "Behavior as survival", deepDive: "Anger is often a shield for fear of failure. Recognition of this allows us to de-escalate." },
          { label: "Conversational intakes", deepDive: "Building rapport before pulling out the clipboard. Trust is the lubricant for data collection." },
          { label: "Creating safe environments", deepDive: "A father must feel he can be honest about his barriers (legal, drug, etc.) without losing his support system." }
        ],
        color: "bg-emerald-500"
      }
    ],
    infographicPractice: {
      title: "Scenario: Angry Client",
      scenario: "A client is aggressive about filling out forms, saying 'This is just like the parole office.'",
      steps: [
        "Response: De-escalate. 'I hear you. We aren't the parole office. We are partners.'",
        "Action: Take a break from the papers and just talk.",
        "Mindset: Recognize anger as a potential trauma response.",
        "Goal: Safety First."
      ]
    },
    slides: [
      "Safety First: A father cannot focus on jobs if he feels judged.",
      "Non-Judgmental Language: Avoid labels like 'unmotivated'.",
      "Identify Strengths: 'You have survived this long' is a strength.",
      "Safe Harbor: We provide a safe space for men to be vulnerable."
    ],
    quiz: [
      { id: "q4_1", question: "True or False: Anger can be a symptom of trauma.", options: ["True", "False"], correctAnswer: 0 },
      { id: "q4_2", question: "What is the core question of Trauma-Informed Care?", options: ["Why are you late?", "What is wrong with you?", "What happened to you?", "Can you fix this?"], correctAnswer: 2 }
    ],
    fullText: "Module 4: Trauma-Informed Practice. Core question: 'What happened to you?'. Provide a safe harbor. Enhance mindset: Identify strengths like 'You showed up today'."
  },
  {
    id: ModuleType.INTAKE,
    title: "Intake, Assessment & Plans of Care",
    subtitle: "Module 5: The First 7 Days",
    description: "To teach the technical process of intake, the 'Treatment Tree' assessment tool, and the creation of the Plan of Care (POC).",
    videoUrl: "https://www.youtube.com/embed/29P3hzE0i4w",
    videoList: [
      {
        title: "The Stabilization Playbook",
        url: "https://www.youtube.com/embed/29P3hzE0i4w",
        description: "How to navigate the first 48 hours of intake and documentation."
      },
      {
        title: "Mastering the Plan of Care",
        url: "https://www.youtube.com/embed/Tw-VR5bUeNg",
        description: "Deep dive into SMART goals and the contract for success."
      },
      {
        title: "Crafting a Plan of Care",
        url: "https://www.youtube.com/embed/7zRhRzUz2Hs",
        description: "A technical walkthrough of drafting actionable goals in EmpowerDB."
      }
    ],
    videoSummary: "The first week sets the tone. Intake must be logged in 48 hours, and a full Plan of Care finalized in 7 days.",
    learningObjectives: [
      { title: "Complete a compliant Intake within 48 hours.", summary: "Logging the 'Big 3' documents and signed ROI into EmpowerDB." },
      { title: "Use the Treatment Tree to identify needs.", summary: "A logic tool: If client says 'No Income', follow the Financial branch." }
    ],
    infographicType: 'tree',
    infographicDetails: [
      {
        title: "The Big 3 Documents",
        description: "Mandatory for every new intake file.",
        graphic: "fa-id-card",
        details: [
          { label: "ID", deepDive: "Valid state ID or Driver's license. If expired, ID recovery becomes Priority #1 in PFB." },
          { label: "Social Security Card", deepDive: "Required for I-9 employment verification. We assist with ordering replacements via the Social Security office." },
          { label: "Proof of Income", deepDive: "Pay stubs or an award letter. If none, the 'Zero Income Affidavit' must be signed and notarized." }
        ],
        color: "bg-[#0F2C5C]"
      },
      {
        title: "The 7-Day Rule",
        description: "Timeline for the Plan of Care (POC).",
        graphic: "fa-calendar-week",
        details: [
          { label: "Finalize POC within 7 days", deepDive: "Speed prevents drop-off. A signed plan is a psychological contract of success." },
          { label: "SMART Goals required", deepDive: "Goals must be Specific (not just 'get a job') and Measurable (e.g., 'Apply for 3 jobs')." },
          { label: "Minimum 2 objectives per goal", deepDive: "Break large goals into small, achievable wins to build the father's confidence." }
        ],
        color: "bg-indigo-600"
      }
    ],
    infographicPractice: {
      title: "Scenario: No Income",
      scenario: "A father has no income and wants a job.",
      steps: [
        "Step 1: Use the Financial Treatment Tree.",
        "Step 2: Have him sign the Zero Income Affidavit.",
        "Step 3: Create Goal: 'Secure Employment'.",
        "Step 4: SMART Objective: 'Apply to 3 places by Friday'."
      ]
    },
    slides: [
      "Release of Information (ROI): Mandatory before any referrals.",
      "Treatment Tree: A logic tool to identify top 3 barriers.",
      "SMART Goals: Specific, Measurable, Achievable, Relevant, Time-bound.",
      "Data: Intake must be entered in EmpowerDB within 48 hours."
    ],
    quiz: [
      { id: "q5_1", question: "How many days do you have to create a Plan of Care?", options: ["24 hours", "3 days", "7 days", "14 days"], correctAnswer: 2 },
      { id: "q5_2", question: "Name the 'Big 3' documents usually collected at intake.", options: ["Birth Cert, ID, Rent Receipt", "ID, SS Card, Proof of Income", "ID, SS Card, Proof of Income", "None"], correctAnswer: 1 }
    ],
    fullText: "Module 5: Intake & POC. Big 3 Docs: ID, SS Card, Proof of Income. ROI is mandatory. 48h for intake, 7 days for POC. Use Treatment Tree logic."
  },
  {
    id: ModuleType.WORKFORCE,
    title: "Workforce & Economic Stability",
    subtitle: "Module 6: The Stability Playbook",
    description: "To train Case Managers on the 'Project Family Build' workforce pipeline: Assess, Prepare, Connect, Retain.",
    videoUrl: "https://www.youtube.com/embed/P8-1BnIMNTo",
    videoList: [
      {
        title: "The Employment Plan in Action",
        url: "https://www.youtube.com/embed/P8-1BnIMNTo",
        description: "Visualizing the 4-step pipeline from assessment to long-term retention."
      },
      {
        title: "Workforce Support Strategies",
        url: "https://www.youtube.com/embed/difdoolfLb0",
        description: "How to connect fathers with partner employers like Brown & Root."
      }
    ],
    videoSummary: "Getting the job is step one. Keeping it is the goal. We use a 4-step pipeline to ensure long-term stability.",
    learningObjectives: [
      { title: "Execute the 4-step Workforce Pipeline.", summary: "Assess barriers, Prepare skills, Connect to partners, Retain the job." },
      { title: "Apply the 48-Hour Fall-Off Rule.", summary: "If a father loses a job, contact him within 48 hours to debrief and restart." }
    ],
    infographicType: 'workflow',
    infographicDetails: [
      {
        title: "The 4-Step Pipeline",
        description: "Assess → Prepare → Connect → Retain",
        graphic: "fa-arrows-to-circle",
        details: [
          { label: "Assess: Check for barriers", deepDive: "Does he have reliable transport? Does he need work boots? Does he have childcare? Solve these BEFORE the interview." },
          { label: "Prepare: Mock interviews", deepDive: "Practice the 'Elevator Pitch'. Ensure he can explain any past criminal record with professional transparency." },
          { label: "Connect: Warm referrals", deepDive: "Don't just give a link. Call the employer partner directly to say 'I have a FOAM father coming your way'." },
          { label: "Retain: Check-ins", deepDive: "A call at day 30, 60, and 90 to identify workplace stress or logistical issues before they lead to quitting." }
        ],
        color: "bg-emerald-600"
      },
      {
        title: "48-Hour Fall-Off Rule",
        description: "Rapid response to job loss.",
        graphic: "fa-bolt",
        details: [
          { label: "Contact within 48 hours", deepDive: "Wait too long and the father enters a shame spiral. We must act while the momentum is still present." },
          { label: "Debrief the cause", deepDive: "Was it transport? A conflict? This info is vital so we don't repeat the mistake in the next placement." },
          { label: "Update POC immediately", deepDive: "Refresh the plan so the father sees that one failure is not the end of his journey with FOAM." }
        ],
        color: "bg-rose-600"
      }
    ],
    infographicPractice: {
      title: "Scenario: The Fall-Off",
      scenario: "A client placed at a warehouse stops showing up to work on Day 45.",
      steps: [
        "Step 1: Initiate 48-Hour Fall-Off Rule.",
        "Step 2: Contact him immediately.",
        "Step 3: Debrief why he stopped (Conflict? Transport?).",
        "Step 4: Update POC and restart search."
      ]
    },
    slides: [
      "Warm Referrals: We don't just send links; we connect to partners.",
      "Retention is Key: 30, 60, and 90-day post-hire check-ins.",
      "IEP: Use the Individual Employment Plan to match the right employer.",
      "Stability: Employment stabilizes the entire family."
    ],
    quiz: [
      { id: "q6_1", question: "What are the three mandatory retention intervals?", options: ["1, 2, 3 weeks", "10, 20, 30 days", "30, 60, 90 days", "6 months"], correctAnswer: 2 },
      { id: "q6_2", question: "If a client loses a job, how quickly must you contact them?", options: ["24 hours", "48 hours", "3 days", "1 week"], correctAnswer: 1 }
    ],
    fullText: "Module 6: Workforce. Pipeline: Assess, Prepare, Connect, Retain. 30/60/90 day check-ins. 48-hour fall-off rule for job loss."
  },
  {
    id: ModuleType.PARTNERSHIPS,
    title: "Resource Navigation & Partnerships",
    subtitle: "Module 7: Connecting the Safety Net",
    description: "To teach Case Managers how to navigate the 'Project Family Build' ecosystem effectively.",
    videoUrl: "https://www.youtube.com/embed/4BT51JrJJeE",
    videoList: [
      {
        title: "Resource Navigation",
        url: "https://www.youtube.com/embed/4BT51JrJJeE",
        description: "Deep dive into finding and utilizing the internal and external Project Family Build ecosystem."
      },
      {
        title: "Stabilization & Financial Protocols",
        url: "https://www.youtube.com/embed/4BT51JrJJeE",
        description: "Understanding the $350 quote rule and stabilization budget management for client barriers."
      }
    ],
    videoSummary: "Module 7 explores the essential collaborative nature of our work. We work WITH the father, not FOR him. Success relies on ensuring the father takes ownership of his own navigation within our partnership ecosystem.",
    learningObjectives: [
      { title: "Identify key partners for needs.", summary: "Housing (EBR), Legal (SLLS), Health (BRBH)." },
      { title: "Apply Financial Assistance Protocols.", summary: "Managing the $150 stabilization budget and $350 quote rule." }
    ],
    infographicType: 'pillars',
    infographicDetails: [
      {
        title: "Housing & Legal",
        description: "Core wraparound partners.",
        graphic: "fa-scale-balanced",
        details: [
          { label: "Housing: EBR Housing Authority", deepDive: "We help with applications but the father must attend the walkthroughs and orientation." },
          { label: "Legal: SLLS", deepDive: "Direct referral for child support adjustment or expungement. We provide the platform; they provide the counsel." },
          { label: "Health: BRBH", deepDive: "Integrated behavioral health. If a father is in crisis, we use our dedicated contact for faster triage." }
        ],
        color: "bg-[#0F2C5C]"
      },
      {
        title: "Stabilization Rules",
        description: "Internal purchasing protocols.",
        graphic: "fa-receipt",
        details: [
          { label: "Work gear limit: $150", deepDive: "Boots, tools, or uniforms. This is a one-time stabilization grant to remove employment barriers." },
          { label: "$350 quote rule", deepDive: "For large items (like car repairs), we require 3 written estimates from different shops to ensure fiscal responsibility." },
          { label: "Enrollment in PFB first", deepDive: "Funds cannot be released until the full PFB intake and assessment are logged in EmpowerDB." }
        ],
        color: "bg-indigo-600"
      }
    ],
    infographicPractice: {
      title: "Scenario: Financial Barrier",
      scenario: "A father needs a TWIC card to start work but cannot afford it.",
      steps: [
        "Check: Verify enrollment in Project Family Build.",
        "Protocol: Use Financial Stability protocol.",
        "Plan: Funding must be part of his workforce plan.",
        "Rule: If over $350, get 3 quotes first."
      ]
    },
    slides: [
      "Partnership Over Charity: Client must take ownership.",
      "Legal Advice: CMs do NOT give legal advice; refer to SLLS.",
      "ROI: Always ensure ROI is signed before calling partners.",
      "Documentation: Document the referral outcome (Did they go?)."
    ],
    quiz: [
      { id: "q7_1", question: "What is the dollar threshold that requires 3 price quotes?", options: ["$100", "$250", "$350", "$500"], correctAnswer: 2 },
      { id: "q7_2", question: "True or False: CMs can provide legal advice on custody.", options: ["True", "False"], correctAnswer: 1 }
    ],
    fullText: "Module 7: Partnerships. Housing (EBR), Legal (SLLS), Health (BRBH). Partnership over Charity. $350 quote rule. No legal advice."
  },
  {
    id: ModuleType.DOCUMENTATION,
    title: "Documentation, Data & Confidentiality",
    subtitle: "Module 8: The Golden Rule",
    description: "To master the technical requirements of compliance and the use of EmpowerDB.",
    videoUrl: "https://www.youtube.com/embed/6RymNR559O4",
    videoList: [
      {
        title: "Protecting our Mission",
        url: "https://www.youtube.com/embed/6RymNR559O4",
        description: "Why accurate documentation is vital for funding and client impact."
      },
      {
        title: "Mastering the EmpowerDB Workflow",
        url: "https://www.youtube.com/embed/9WAq-mv7me4",
        description: "Technical walkthrough of logging client notes and data entry standards."
      }
    ],
    videoSummary: "If it isn't in EmpowerDB, it didn't happen. Data entry isn't busy work; it protects our mission and funding. This module provides the blueprint for accurate, objective documentation.",
    learningObjectives: [
      { title: "Apply the 48-Hour Rule.", summary: "All interactions (calls, texts, meetings) must be logged within 48 hours." },
      { title: "Write FACT-based case notes.", summary: "Objective notes using the Facts, Actions, Response, Next Steps model." }
    ],
    infographicType: 'protocol',
    infographicDetails: [
      {
        title: "FACT Model",
        description: "Objective note-writing standard.",
        graphic: "fa-pen-to-square",
        details: [
          { label: "F: Facts (Objective)", deepDive: "Write what happened, not how you felt about it. Instead of 'Client was lazy', write 'Client did not attend scheduled meeting'." },
          { label: "A: Actions Taken", deepDive: "What did YOU do? 'Left voicemail, sent follow-up text, called employer partner'." },
          { label: "C: Client Response", deepDive: "How did they react to the intervention? 'Client acknowledged the goal and agreed to provide docs by Friday'." },
          { label: "T: Next Steps", deepDive: "Lock in the next move. 'CM to follow up on Monday to confirm document delivery'." }
        ],
        color: "bg-blue-600"
      },
      {
        title: "Naming Convention",
        description: "Files must be searchable.",
        graphic: "fa-font",
        details: [
          { label: "LastName_FirstName_Type", deepDive: "Strict naming ensures we can find documents in seconds during a state audit." },
          { label: "Upload all docs", deepDive: "POCs, Exit interviews, and ROIs must be scanned and attached to the digital file." },
          { label: "Log every call/text", deepDive: "Small touchpoints prove our intensity of service to grant makers." }
        ],
        color: "bg-slate-600"
      }
    ],
    infographicPractice: {
      title: "Scenario: Delayed Entry",
      scenario: "You give a father a bus pass on Friday but log it on Tuesday.",
      steps: [
        "Mistake: This violates the 48-Hour Rule.",
        "Risk: Puts funding at risk and creates gaps.",
        "Correct Action: Log immediately or within 48 hours.",
        "Note Standard: Be objective. 'Client arrived at 10:15' not 'Client was lazy'."
      ]
    },
    slides: [
      "Golden Rule: If it isn't in EmpowerDB, it didn't happen.",
      "48-Hour Rule: Strict deadline for all interactions.",
      "Confidentiality: Do not use personal devices for client data.",
      "Objective Writing: Fact-based only, no subjective labels."
    ],
    quiz: [
      { id: "q8_1", question: "What is the deadline for entering case notes?", options: ["24 hours", "48 hours", "72 hours", "End of week"], correctAnswer: 1 },
      { id: "q8_2", question: "What does 'FACT' stand for in note-writing?", options: ["Fast, Accurate, Clear, True", "Facts, Actions, Client Response, Next Steps", "Feelings, Actions, Call, Text", "None"], correctAnswer: 1 }
    ],
    fullText: "Module 8: Documentation. Golden Rule: Log in EmpowerDB. 48-Hour Rule for entry. FACT Model: Facts, Actions, Client Response, Next Steps. Objective writing."
  },
  {
    id: ModuleType.CRISIS,
    title: "Crisis Response & Boundaries",
    subtitle: "Module 9: Safety and Standards",
    description: "To prepare Case Managers for high-stress situations while maintaining professional limits.",
    videoUrl: "https://www.youtube.com/embed/W5lSZJvMh1o",
    videoList: [
      {
        title: "Crisis Intervention & De-escalation",
        url: "https://www.youtube.com/embed/W5lSZJvMh1o",
        description: "How to handle acute high-stress situations with calm, empathy, and professional authority."
      }
    ],
    videoSummary: "Stabilize first. If a father is in crisis, pause long-term goals and focus on immediate safety. This module outlines the safe harbor protocol and the non-negotiable professional boundaries required at FOAM.",
    learningObjectives: [
      { title: "Execute the Crisis Response Protocol.", summary: "Following the Treatment Tree logic and mandated reporting duties." },
      { title: "Maintain Professional Boundaries.", summary: "No personal money, no rides in personal cars, no rescue mindset." }
    ],
    infographicType: 'pathway',
    infographicDetails: [
      {
        title: "Crisis Response Flow",
        description: "Assess → Treatment Tree → Action",
        graphic: "fa-triangle-exclamation",
        details: [
          { label: "Immediate safety call", deepDive: "If the father is threatening self-harm or harm to others, stay on the line and call 911 from another device." },
          { label: "Assess immediate needs", deepDive: "Food and shelter come before job searches. Use the pantry or 211 for emergency stabilization." },
          { label: "Stabilize First", deepDive: "Do not lecture an angry or hungry father about being late. Fix the hunger/anger first." }
        ],
        color: "bg-rose-600"
      },
      {
        title: "Strict Boundaries",
        description: "Professional limits protect everyone.",
        graphic: "fa-ban",
        details: [
          { label: "NO personal loans", deepDive: "Once you give $10 of your own money, you are a benefactor, not a case manager. This ruins the professional dynamic." },
          { label: "NO rides in personal cars", deepDive: "Liability and safety risk. Use bus passes or the agency vehicle if authorized." },
          { label: "NO housing offers", deepDive: "Never allow a client to stay at your home or your relative's home. Professional distance is mandatory." }
        ],
        color: "bg-slate-700"
      }
    ],
    infographicPractice: {
      title: "Scenario: Late Night Call",
      scenario: "A client calls late at night asking for money for a motel.",
      steps: [
        "Response: Maintain boundaries. Do not offer personal money.",
        "Action: Direct to emergency shelters or 211.",
        "Debrief: Report the incident to your supervisor.",
        "Takeaway: Boundaries protect you and the organization."
      ]
    },
    slides: [
      "Stabilize First: Pause long-term goals for immediate safety.",
      "Mandated Reporting: You are legally required to report harm to self/others.",
      "Boundaries: We support, we do not rescue.",
      "Safety: Never transport a client in your personal vehicle."
    ],
    quiz: [
      { id: "q9_1", question: "True or False: You should drive clients in your personal car.", options: ["True", "False"], correctAnswer: 1 },
      { id: "q9_2", question: "If a client threatens self-harm, what is your first step?", options: ["Call 911/Crisis Line", "Offer money", "Drive them home", "Ignore it"], correctAnswer: 0 }
    ],
    fullText: "Module 4: Trauma-Informed Practice. Core question: 'What happened to you?'. Provide a safe harbor. Enhance mindset: Identify strengths like 'You showed up today'."
  },
  {
    id: ModuleType.SUSTAINABILITY,
    title: "Sustainability, Growth & Impact",
    subtitle: "Module 10: Graduation & Closure",
    description: "To define what 'Success' looks like at FOAM and how to properly close a case.",
    videoUrl: "https://www.youtube.com/embed/d_fCTyInTGc",
    videoList: [
      {
        title: "Graduation & The Exit Strategy",
        url: "https://www.youtube.com/embed/d_fCTyInTGc",
        description: "Defining success metrics and managing the formal closure process for our fathers."
      }
    ],
    videoSummary: "Graduation is the celebration of sustainable independence. We measure success by outcomes, not just effort. This final module provides the roadmap for certification, the $350 final check protocol, and the legacy of impact we leave with every family.",
    learningObjectives: [
      { title: "Define Graduation criteria.", summary: "12 of 14 classes attended AND at least 2 major POC goals achieved." },
      { title: "Execute the Exit Process.", summary: "Exit Interview, final Closing Note, and status update in EmpowerDB." }
    ],
    infographicType: 'workflow',
    infographicDetails: [
      {
        title: "Graduation Criteria",
        description: "Standards for the FOAM certificate.",
        graphic: "fa-graduation-cap",
        details: [
          { label: "12 of 14 classes", deepDive: "Fathers must attend the core NPCL curriculum. The certificate is a credential they can take to court or employers." },
          { label: "2 major POC goals", deepDive: "Proof of 'Enhancement'. Usually employment retention for 90 days and a stable housing solution." }
        ],
        color: "bg-[#1A4D2E]"
      },
      {
        title: "The 4-Step Exit",
        description: "Closing the loop.",
        graphic: "fa-check-double",
        details: [
          { label: "Exit Interview", deepDive: "Gather feedback. What worked? What didn't? This data improves our program for the next father." },
          { label: "Status Update", deepDive: "Change the EmpowerDB status to 'Completed/Graduated'. This is a proud moment for our data metrics." },
          { label: "Final Closing Note", deepDive: "Summarize the entire journey. Highlight where the father started and where he is now." }
        ],
        color: "bg-[#0F2C5C]"
      }
    ],
    infographicPractice: {
      title: "Scenario: Incomplete Graduation",
      scenario: "A father has a job but stopped coming to classes after 5 sessions.",
      steps: [
        "Action: Attempt contact 3 times.",
        "Outcome: He cannot Graduate (failed 12/14 rule).",
        "Data: Mark as 'Inactive' or 'Non-Compliant'.",
        "Note: Document the successful employment outcome before he left."
      ]
    },
    slides: [
      "Sustainable Independence: The ultimate goal for every father.",
      "Closure Types: Graduated, Inactive, Dismissed.",
      "Success: Measured by outcomes, not effort.",
      "Exit Interview: Critical for feedback and impact data."
    ],
    quiz: [
      { id: "q10_1", question: "How many fatherhood classes must be attended to graduate?", options: ["8", "10", "12", "14"], correctAnswer: 2 },
      { id: "q10_2", question: "How many POC goals must be achieved to graduate?", options: ["1", "2", "3", "5"], correctAnswer: 1 }
    ],
    fullText: "Module 10: Sustainability. Graduation: 12/14 classes + 2 major goals. Statuses: Graduated, Inactive, Dismissed. Exit Interview required."
  }
];

export const COLORS = {
  primary: '#0F2C5C',
  secondary: '#1A4D2E',
  accent: '#FF9F29',
  light: '#FAF3E0',
  white: '#FFFFFF',
  gray: '#4B5563'
};
