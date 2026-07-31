import { ImprovedResumeData, ResumeMemory, ResumeVersion, SectionDiff, DetailedSuggestion, MockRoastReport } from '../types';

// Helper to deep clone objects cleanly
export function cloneResumeData(data: ImprovedResumeData): ImprovedResumeData {
  return JSON.parse(JSON.stringify(data));
}

// Extract clean text bullets for quick metric & action verb evaluation
function extractAllBullets(data: ImprovedResumeData): string[] {
  const bullets: string[] = [];
  if (data.professionalSummary) bullets.push(data.professionalSummary);
  data.experience.forEach(exp => {
    exp.bulletPoints.forEach(b => bullets.push(b));
  });
  data.projects.forEach(proj => {
    proj.descriptionBullets.forEach(b => bullets.push(b));
  });
  return bullets;
}

// Strong action verb regex list
const ACTION_VERBS = [
  'architected', 'spearheaded', 'engineered', 'optimized', 'implemented',
  'developed', 'designed', 'orchestrated', 'streamlined', 'pioneered',
  'built', 'transformed', 'automated', 'launched', 'scale', 'increased',
  'reduced', 'generated', 'led', 'integrated', 'revamped'
];

// Check if string contains numbers / percentages / dollar amounts (quantified metrics)
function hasQuantifiedMetric(str: string): boolean {
  return /\b(\d+(\.\d+)?%|\$\d+([.,]\d+)?|\d+\+?\s*(users|clients|requests|ms|sec|hours|days|teams|projects|repos|downloads))\b/i.test(str);
}

// Calculate realistic, gradual score updates relative to original snapshot
export function calculateGradualScores(
  originalSnapshot: ImprovedResumeData,
  currentData: ImprovedResumeData,
  originalScores: { resumeScore: number; atsScore: number; hiringProbability: number }
): {
  resumeScore: number;
  atsScore: number;
  hiringProbability: number;
  scoreExplanations: string[];
  diffs: SectionDiff[];
} {
  const origBullets = extractAllBullets(originalSnapshot);
  const currBullets = extractAllBullets(currentData);

  let scoreDelta = 0;
  let atsDelta = 0;
  let hiringDelta = 0;
  const scoreExplanations: string[] = [];

  // 1. Action Verbs Evaluation
  const origActionCount = origBullets.filter(b => ACTION_VERBS.some(v => b.toLowerCase().startsWith(v))).length;
  const currActionCount = currBullets.filter(b => ACTION_VERBS.some(v => b.toLowerCase().startsWith(v))).length;
  const verbDiff = currActionCount - origActionCount;
  if (verbDiff > 0) {
    const verbBonus = Math.min(0.8, verbDiff * 0.2);
    scoreDelta += verbBonus;
    atsDelta += Math.min(12, verbDiff * 3);
    hiringDelta += Math.min(10, verbDiff * 2.5);
    scoreExplanations.push(`✓ Rewrote passive bullets with strong action verbs (+${verbBonus.toFixed(1)} pts)`);
  }

  // 2. Quantified Impact Metrics Evaluation
  const origMetricCount = origBullets.filter(hasQuantifiedMetric).length;
  const currMetricCount = currBullets.filter(hasQuantifiedMetric).length;
  const metricDiff = currMetricCount - origMetricCount;
  if (metricDiff > 0) {
    const metricBonus = Math.min(1.0, metricDiff * 0.25);
    scoreDelta += metricBonus;
    atsDelta += Math.min(10, metricDiff * 2.5);
    hiringDelta += Math.min(15, metricDiff * 3.5);
    scoreExplanations.push(`✓ Injected quantified performance metrics (+${metricBonus.toFixed(1)} pts)`);
  }

  // 3. Skills & ATS Keywords Expansion
  const origSkillCount = originalSnapshot.skills.reduce((acc, s) => acc + s.items.length, 0);
  const currSkillCount = currentData.skills.reduce((acc, s) => acc + s.items.length, 0);
  const skillDiff = currSkillCount - origSkillCount;
  if (skillDiff > 0) {
    const skillBonus = Math.min(0.6, skillDiff * 0.1);
    scoreDelta += skillBonus;
    atsDelta += Math.min(15, skillDiff * 3);
    scoreExplanations.push(`✓ Expanded domain technical keywords (+${skillBonus.toFixed(1)} pts)`);
  }

  // 4. Professional Summary Improvement
  if (
    currentData.professionalSummary &&
    currentData.professionalSummary.length > 50 &&
    currentData.professionalSummary !== originalSnapshot.professionalSummary
  ) {
    scoreDelta += 0.3;
    atsDelta += 5;
    hiringDelta += 5;
    scoreExplanations.push(`✓ Refined concise professional summary (+0.3 pts)`);
  }

  // 5. Contact Info Integrity Check
  const h = currentData.header;
  if (h.linkedin && h.github && h.email && h.phone) {
    const origH = originalSnapshot.header;
    if (!origH.linkedin || !origH.github) {
      scoreDelta += 0.2;
      atsDelta += 4;
      scoreExplanations.push(`✓ Completed candidate contact links (+0.2 pts)`);
    }
  }

  // Compute final realistic values capped cleanly
  const finalResumeScore = Math.min(9.8, Math.max(1.0, Number((originalScores.resumeScore + scoreDelta).toFixed(1))));
  const finalAtsScore = Math.min(98, Math.max(5, Math.round(originalScores.atsScore + atsDelta)));
  const finalHiringProbability = Math.min(95, Math.max(2, Math.round(originalScores.hiringProbability + hiringDelta)));

  // Calculate detailed section-by-section diffs
  const diffs = computeDetailedDiffs(originalSnapshot, currentData);

  return {
    resumeScore: finalResumeScore,
    atsScore: finalAtsScore,
    hiringProbability: finalHiringProbability,
    scoreExplanations: scoreExplanations.length > 0 ? scoreExplanations : ['✓ Resume matches original baseline snapshot'],
    diffs
  };
}

// Compute section diffs between snapshot A and B
export function computeDetailedDiffs(
  dataA: ImprovedResumeData,
  dataB: ImprovedResumeData
): SectionDiff[] {
  const diffs: SectionDiff[] = [];

  // Summary Diff
  if (dataA.professionalSummary !== dataB.professionalSummary) {
    diffs.push({
      sectionName: 'Professional Summary',
      added: dataB.professionalSummary ? [dataB.professionalSummary] : [],
      removed: dataA.professionalSummary ? [dataA.professionalSummary] : [],
      modified: []
    });
  }

  // Experience Diff
  const expAdded: string[] = [];
  const expRemoved: string[] = [];
  const expModified: Array<{ before: string; after: string }> = [];

  dataB.experience.forEach((expB, idx) => {
    const expA = dataA.experience[idx];
    if (!expA) {
      expAdded.push(`${expB.role} at ${expB.company}`);
    } else {
      expB.bulletPoints.forEach((bulletB, bIdx) => {
        const bulletA = expA.bulletPoints[bIdx];
        if (!bulletA) {
          expAdded.push(`[${expB.company}] ${bulletB}`);
        } else if (bulletA !== bulletB) {
          expModified.push({ before: bulletA, after: bulletB });
        }
      });
    }
  });

  if (expAdded.length > 0 || expRemoved.length > 0 || expModified.length > 0) {
    diffs.push({
      sectionName: 'Work Experience',
      added: expAdded,
      removed: expRemoved,
      modified: expModified
    });
  }

  // Projects Diff
  const projAdded: string[] = [];
  const projModified: Array<{ before: string; after: string }> = [];

  dataB.projects.forEach((projB, idx) => {
    const projA = dataA.projects[idx];
    if (!projA) {
      projAdded.push(projB.title);
    } else {
      projB.descriptionBullets.forEach((bulletB, bIdx) => {
        const bulletA = projA.descriptionBullets[bIdx];
        if (!bulletA) {
          projAdded.push(`[${projB.title}] ${bulletB}`);
        } else if (bulletA !== bulletB) {
          projModified.push({ before: bulletA, after: bulletB });
        }
      });
    }
  });

  if (projAdded.length > 0 || projModified.length > 0) {
    diffs.push({
      sectionName: 'Projects',
      added: projAdded,
      removed: [],
      modified: projModified
    });
  }

  // Skills Diff
  const skillsA = new Set(dataA.skills.flatMap(s => s.items));
  const skillsB = new Set(dataB.skills.flatMap(s => s.items));

  const addedSkills = Array.from(skillsB).filter(s => !skillsA.has(s));
  const removedSkills = Array.from(skillsA).filter(s => !skillsB.has(s));

  if (addedSkills.length > 0 || removedSkills.length > 0) {
    diffs.push({
      sectionName: 'Technical Skills',
      added: addedSkills,
      removed: removedSkills,
      modified: []
    });
  }

  return diffs;
}

// Default educational suggestions generator
export function generateDetailedSuggestions(report: MockRoastReport, snapshot: ImprovedResumeData): DetailedSuggestion[] {
  const suggestions: DetailedSuggestion[] = [];

  // Suggestion 1: Action Verbs
  suggestions.push({
    id: 'sugg-action-verbs',
    section: 'Work Experience',
    whatIsWrong: 'Bullet points start with passive language or vague duties like "Responsible for..." or "Worked on..."',
    whyItMatters: 'Recruiters scan resumes in 6 seconds. Passive language hides your individual contribution and ownership.',
    howToImprove: 'Begin every bullet point with a high-impact past-tense action verb (e.g., Engineered, Spearheaded, Architected, Optimized).',
    exampleBefore: 'Worked on building the user authentication and dashboard features.',
    exampleAfter: 'Architected scalable JWT authentication and dynamic dashboard UI, reducing login drop-off by 24%.',
    impactScore: 0.3
  });

  // Suggestion 2: Quantified Metrics
  suggestions.push({
    id: 'sugg-metrics',
    section: 'Projects & Achievements',
    whatIsWrong: 'Project descriptions mention tools used but omit measurable business outcomes or scale.',
    whyItMatters: 'Hiring managers look for evidence of real-world impact, efficiency gains, speed, or revenue generated.',
    howToImprove: 'Add specific percentages, speed reductions, user counts, or dollar figures to quantify your work.',
    exampleBefore: 'Built an e-commerce API with Redis caching.',
    exampleAfter: 'Engineered high-throughput Redis caching layer for e-commerce API, slashing query response latency by 42%.',
    impactScore: 0.5
  });

  // Suggestion 3: ATS Keyword Matching
  suggestions.push({
    id: 'sugg-ats-keywords',
    section: 'Technical Skills',
    whatIsWrong: 'Key job-relevant technologies are missing or scattered without structured domain categorization.',
    whyItMatters: 'ATS parsers look for standard keyword groupings to index candidates accurately.',
    howToImprove: 'Group skills into clear categories (e.g. Languages & Frameworks, Cloud & DevOps, Databases) and mirror ATS keywords.',
    exampleBefore: 'Skills: React, Node, SQL, Git, AWS, Python.',
    exampleAfter: 'Frontend: React, TypeScript, Tailwind | Backend: Node.js, Python, PostgreSQL | DevOps: AWS, Docker, CI/CD.',
    impactScore: 0.3
  });

  // Suggestion 4: Professional Summary
  suggestions.push({
    id: 'sugg-summary',
    section: 'Header & Summary',
    whatIsWrong: 'Summary is missing or uses generic buzzwords like "Passionate team player looking for growth."',
    whyItMatters: 'Generic summaries waste prime resume real estate without highlighting your core role and top achievements.',
    howToImprove: 'Craft a 2-3 sentence executive pitch stating your target role, years of hands-on stack experience, and key differentiator.',
    exampleBefore: 'Hardworking software engineering student seeking an entry level role to apply my skills.',
    exampleAfter: 'Results-driven Full-Stack Engineer with experience building high-throughput web apps and microservices using TypeScript, Node.js, and AWS.',
    impactScore: 0.2
  });

  return suggestions;
}

// Initialize memory container
export function createInitialMemory(report: MockRoastReport): ResumeMemory {
  const candidate = report.candidateProfile;

  // Build immutable snapshot from parsed data or report.improvedData
  const originalSnapshot: ImprovedResumeData = report.originalResumeData || report.improvedData || {
    header: {
      name: candidate?.name || "Candidate Name",
      title: candidate?.detectedRole || "Software Engineer",
      email: "candidate@example.com",
      phone: "+1 (555) 019-2831",
      linkedin: "linkedin.com/in/candidate",
      github: "github.com/candidate",
      portfolio: "candidate.dev",
      location: "San Francisco, CA"
    },
    professionalSummary: `Dedicated ${candidate?.detectedRole || "Software Engineer"} with hands-on expertise building software solutions. Seeking to leverage technical skills in high-velocity teams.`,
    skills: [
      { category: "Languages & Frameworks", items: ["TypeScript", "React", "Node.js", "Python"] },
      { category: "Databases & Tools", items: ["PostgreSQL", "Git", "Docker", "REST APIs"] }
    ],
    projects: [
      {
        title: "Full-Stack Web Application",
        role: "Developer",
        techStack: ["React", "Node.js", "PostgreSQL"],
        descriptionBullets: [
          "Developed responsive web application frontend and RESTful API backend.",
          "Integrated database queries and state management for user data processing."
        ]
      }
    ],
    experience: [
      {
        company: "Tech Solutions",
        role: candidate?.detectedRole || "Software Engineer",
        dates: "2023 - Present",
        location: "San Francisco, CA",
        bulletPoints: [
          "Worked on full-stack web development features for client applications.",
          "Collaborated with team members to optimize code quality and fix UI bugs."
        ]
      }
    ],
    education: [
      {
        institution: "State University",
        degree: "Bachelor of Science",
        fieldOfStudy: "Computer Science",
        dates: "2019 - 2023"
      }
    ],
    certifications: [],
    achievements: []
  };

  const originalScores = {
    resumeScore: report.resumeScore || 5.8,
    atsScore: report.atsScore || 62,
    hiringProbability: report.hiringProbability || 38
  };

  // Initial Version 0 (Immutable Baseline)
  const initialVersion: ResumeVersion = {
    versionNumber: 0,
    versionLabel: 'Original Resume Snapshot',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    data: cloneResumeData(originalSnapshot),
    resumeScore: originalScores.resumeScore,
    atsScore: originalScores.atsScore,
    hiringProbability: originalScores.hiringProbability,
    scoreExplanations: ['Baseline scores extracted from original uploaded resume'],
    diffs: []
  };

  const detailedSuggestions = report.detailedSuggestions || generateDetailedSuggestions(report, originalSnapshot);

  return {
    originalSnapshot: cloneResumeData(originalSnapshot),
    originalScores,
    versions: [initialVersion],
    activeVersionIndex: 0,
    detailedSuggestions
  };
}

// Add a new version to history without modifying original snapshot
export function addMemoryVersion(
  memory: ResumeMemory,
  newData: ImprovedResumeData,
  label?: string
): ResumeMemory {
  const newVersionNum = memory.versions.length;
  const versionLabel = label || `Version ${newVersionNum}`;

  const calculated = calculateGradualScores(memory.originalSnapshot, newData, memory.originalScores);

  const newVersion: ResumeVersion = {
    versionNumber: newVersionNum,
    versionLabel,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    data: cloneResumeData(newData),
    resumeScore: calculated.resumeScore,
    atsScore: calculated.atsScore,
    hiringProbability: calculated.hiringProbability,
    scoreExplanations: calculated.scoreExplanations,
    diffs: calculated.diffs
  };

  const updatedVersions = [...memory.versions, newVersion];

  return {
    ...memory,
    versions: updatedVersions,
    activeVersionIndex: updatedVersions.length - 1
  };
}
