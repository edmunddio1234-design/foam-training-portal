
export enum ModuleType {
  FOUNDATIONAL = 'FOUNDATIONAL',
  ROLE = 'ROLE',
  OUTREACH = 'OUTREACH',
  TRAUMA = 'TRAUMA',
  INTAKE = 'INTAKE',
  WORKFORCE = 'WORKFORCE',
  PARTNERSHIPS = 'PARTNERSHIPS',
  DOCUMENTATION = 'DOCUMENTATION',
  CRISIS = 'CRISIS',
  SUSTAINABILITY = 'SUSTAINABILITY'
}

export type TrainingTrack = 'case_manager' | 'facilitator' | 'board';

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface PracticeScenario {
  title: string;
  scenario: string;
  steps: string[];
}

export interface ExecutionPoint {
  label: string;
  deepDive: string;
}

export interface SubSection {
  title: string;
  description: string;
  graphic?: string; 
  details: ExecutionPoint[];
  hookText?: string;
  color?: string;
}

export interface LearningObjective {
  title: string;
  summary: string;
}

export interface ModuleVideo {
  title: string;
  url: string;
  description?: string;
}

export interface ModuleContent {
  id: ModuleType;
  title: string;
  subtitle: string;
  description: string;
  videoUrl: string; 
  videoList?: ModuleVideo[]; 
  videoSummary?: string;
  infographicType: 'pillars' | 'workflow' | 'pathway' | 'tree' | 'protocol' | 'none';
  infographicDetails?: SubSection[];
  infographicPractice?: PracticeScenario;
  learningObjectives: LearningObjective[];
  slides: string[];
  slideDeepDives?: string[]; 
  quiz: QuizQuestion[];
  fullText: string;
  connectUrl?: string; 
}

// --- NEW BACKEND INTERFACES ---

export interface AuthUser {
  email: string;
  name: string;
  role: string;
}

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  size?: string;
  webViewLink?: string;
  content?: string; // base64 for downloads
  folderId?: string;
  path?: string; // Citation path
  summary?: string; // AI generated
}

export interface APIResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// --- FATHERHOOD TRACKER TYPES ---

export interface Father {
  id: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  email: string | null;
  completedModules: number[]; // Array of Module IDs
  joinedDate: string;
  status: 'Active' | 'Graduated' | 'At Risk';
  isDuplicate?: boolean;
}

export interface TrackerModule {
  id: number;
  title: string;
  category: string;
}

export interface AttendanceRecord {
  id: string;
  fatherId: string;
  date: string; // ISO Date string (YYYY-MM-DD)
  moduleId: number;
}

export type TrackerViewState = 'dashboard' | 'roster' | 'checkin' | 'portal' | 'import' | 'lost' | 'father-detail' | 'export' | 'financials';

export interface KPI {
  totalEnrolled: number;
  avgCompletion: number; // percentage
  highlyEngaged: number; // count of fathers > 70% complete
  graduates: number;
}
