import { MockRoastReport, ImprovedResumeData, ImprovementComparison } from '../types';

export function extractCandidateInfoFromFilename(fileName: string) {
  const cleanName = fileName.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
  const parts = cleanName.split(/\s+/).filter(Boolean);

  let candidateName = "Alex Chen";

  if (parts.length > 0) {
    const roleKeywords = ["engineer", "developer", "designer", "manager", "analyst", "data", "fullstack", "frontend", "backend"];
    const nameParts = parts.filter(
      p => !roleKeywords.some(rk => p.toLowerCase().includes(rk)) && !["resume", "cv", "final", "latest", "doc", "pdf"].includes(p.toLowerCase())
    );

    if (nameParts.length > 0) {
      candidateName = nameParts.map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(" ");
    }
  }

  return { candidateName };
}

export function generateFallbackReport(fileName: string, fileId: string): MockRoastReport {
  return {
    fileId: fileId || "fallback-" + Date.now(),
    fileName,
    atsScore: 0,
    resumeScore: 0,
    hiringProbability: 0,
    recruiterConfidence: 0,
    judgment: `Resume analysis unavailable for "${fileName}". Exact resume content could not be extracted safely.`,
    verdict: "TRASH",
    verdictTitle: "ANALYSIS UNAVAILABLE",
    bulletPoints: [
      "Resume analysis could not be completed safely. No invented resume data is provided.",
      "Retry upload and ensure the Gemini API key is valid and reachable."
    ],
    praisePoints: ["Resume analysis unavailable."],
    grammarSlam: "Analysis unavailable.",
    buzzwordCounter: [],
    candidateProfile: {
      name: "",
      experienceLevel: "Fresher",
      industry: "",
      sectionsFound: {
        education: false,
        skills: false,
        experience: false,
        projects: false,
        certifications: false,
        achievements: false,
        summary: false
      },
      contactLinks: {
        email: false,
        phone: false,
        linkedin: false,
        github: false,
        portfolio: false
      }
    },
    dimensionScores: [],
    evidenceTable: [],
    personaRoasts: {},
    improvementSuggestions: {
      suggestedHeadline: "",
      actionableFixes: [],
      atsKeywordsToInject: []
    }
  };
}

export function generateFallbackImprovedResume(
  fileName: string,
  currentReport: any
): { improvedResume: ImprovedResumeData; improvementComparison: ImprovementComparison } {
  const currentAts = currentReport?.atsScore || 0;
  const currentResume = currentReport?.resumeScore || 0;
  const currentHiring = currentReport?.hiringProbability || 0;

  const improvedResume: ImprovedResumeData = {
    header: {
      name: "",
      title: "",
      email: "",
      phone: "",
      linkedin: "",
      github: "",
      portfolio: "",
      location: ""
    },
    professionalSummary: "",
    skills: [],
    projects: [],
    experience: [],
    education: [],
    certifications: [],
    achievements: []
  };

  const improvementComparison: ImprovementComparison = {
    bulletPointsRewrittenCount: 0,
    grammarFixesCount: 0,
    atsScoreBefore: currentAts,
    atsScoreAfter: currentAts,
    resumeScoreBefore: currentResume,
    resumeScoreAfter: currentResume,
    hiringProbabilityBefore: currentHiring,
    hiringProbabilityAfter: currentHiring,
    highlightedChanges: ["Resume improvement unavailable because exact resume content could not be extracted safely."]
  };

  return { improvedResume, improvementComparison };
}
