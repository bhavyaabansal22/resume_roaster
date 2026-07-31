export type AppTab = 
  | 'landing'
  | 'processing'
  | 'dashboard'
  | 'roast'
  | 'ats'
  | 'personas'
  | 'improve'
  | 'compare'
  | 'download';

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  formattedSize: string;
  file: File;
  isCorrupted: boolean; // simulated edge case toggle
  isBlank: boolean; // simulated edge case toggle
}

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

export type DecisionType = 'TRASH' | 'GHOST' | 'REJECT_SOFT' | 'INTERVIEW_UNLIKELY';

export interface CandidateProfile {
  name: string;
  detectedRole: string;
  experienceLevel: 'Student' | 'Fresher' | 'Intern' | 'Junior' | 'Mid-level' | 'Senior';
  industry: string;
  sectionsFound: {
    education: boolean;
    skills: boolean;
    experience: boolean;
    projects: boolean;
    certifications: boolean;
    achievements: boolean;
    summary: boolean;
  };
  contactLinks: {
    email: boolean;
    phone: boolean;
    linkedin: boolean;
    github: boolean;
    portfolio: boolean;
  };
}

export type PersonaId = 'friendly' | 'corporate_hr' | 'hiring_manager' | 'startup_founder' | 'faang_recruiter' | 'gen_z' | 'ats_robot';

export interface PersonaRoast {
  id: PersonaId;
  title: string;
  emoji: string;
  badge: string;
  roastSummary: string;
  roastBulletPoints: string[];
  keyAdvice: string;
}

export interface EvidenceItem {
  finding: string;
  evidence: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  suggestion: string;
}

export interface DimensionEvaluation {
  category: string;
  score: number; // 0 to 100
  feedback: string;
  evidence: string;
}

export interface DetailedSuggestion {
  id: string;
  section: string;
  whatIsWrong: string;
  whyItMatters: string;
  howToImprove: string;
  exampleBefore: string;
  exampleAfter: string;
  impactScore: number; // e.g., +0.3
  applied?: boolean;
}

export interface SectionDiff {
  sectionName: string;
  added: string[];
  removed: string[];
  modified: Array<{ before: string; after: string }>;
}

export interface ResumeVersion {
  versionNumber: number; // 0 = Original Snapshot, 1 = v1, 2 = v2...
  versionLabel: string;
  timestamp: string;
  data: ImprovedResumeData;
  resumeScore: number;
  atsScore: number;
  hiringProbability: number;
  scoreExplanations: string[];
  diffs: SectionDiff[];
}

export interface ResumeMemory {
  originalSnapshot: ImprovedResumeData;
  originalScores: {
    resumeScore: number;
    atsScore: number;
    hiringProbability: number;
  };
  versions: ResumeVersion[];
  activeVersionIndex: number;
  detailedSuggestions: DetailedSuggestion[];
}

export interface ImprovementSuggestion {
  suggestedHeadline: string;
  actionableFixes: Array<{
    section: string;
    currentText: string;
    improvedText: string;
    reason: string;
  }>;
  atsKeywordsToInject: string[];
}

export interface ImprovedResumeData {
  header: {
    name: string;
    title: string;
    email: string;
    phone: string;
    linkedin: string;
    github: string;
    portfolio: string;
    location: string;
  };
  professionalSummary: string;
  skills: Array<{ category: string; items: string[] }>;
  projects: Array<{
    title: string;
    role: string;
    techStack: string[];
    descriptionBullets: string[];
    liveUrl?: string;
  }>;
  experience: Array<{
    company: string;
    role: string;
    dates: string;
    location?: string;
    bulletPoints: string[];
  }>;
  education: Array<{
    institution: string;
    degree: string;
    fieldOfStudy?: string;
    dates: string;
    gpaOrHonors?: string;
  }>;
  certifications: string[];
  achievements: string[];
  languages?: string[];
}

export interface DeveloperDebugData {
  rawExtractedText: string;
  detectedSections: string[];
  detectedRole: string;
  detectedSkills: string[];
  detectedProjects: string[];
  detectedExperience: string[];
  detectedCertifications: string[];
  confidenceScore: number;
  processingTimeMs: number;
}

export interface ImprovementComparison {
  bulletPointsRewrittenCount: number;
  grammarFixesCount: number;
  atsScoreBefore: number;
  atsScoreAfter: number;
  resumeScoreBefore: number;
  resumeScoreAfter: number;
  hiringProbabilityBefore: number;
  hiringProbabilityAfter: number;
  highlightedChanges: string[];
}

export interface ImproveResumeResponse {
  improvedResume: ImprovedResumeData;
  improvementComparison: ImprovementComparison;
}

export interface MockRoastReport {
  fileId: string;
  fileName: string;
  candidateProfile?: CandidateProfile;
  resumeScore?: number; // /10
  atsScore: number; // /100
  hiringProbability?: number; // %
  recruiterConfidence?: number; // %
  judgment: string;
  verdict: DecisionType;
  verdictTitle?: string;
  bulletPoints: string[];
  praisePoints?: string[];
  grammarSlam: string;
  buzzwordCounter: Array<{ word: string; count: number }>;
  dimensionScores?: DimensionEvaluation[];
  evidenceTable?: EvidenceItem[];
  personaRoasts?: Record<string, PersonaRoast>;
  improvementSuggestions?: ImprovementSuggestion;
  originalResumeData?: ImprovedResumeData;
  improvedData?: ImprovedResumeData;
  improvementComparison?: ImprovementComparison;
  detailedSuggestions?: DetailedSuggestion[];
  resumeMemory?: ResumeMemory;
  developerDebugData?: DeveloperDebugData;
}


