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