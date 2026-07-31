import { MockRoastReport, ImprovedResumeData, ImprovementComparison } from '../types';

export function extractCandidateInfoFromFilename(fileName: string) {
  const cleanName = fileName.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
  const parts = cleanName.split(/\s+/).filter(Boolean);
  
  let candidateName = "Alex Chen";
  let detectedRole = "Software Engineer";

  if (parts.length > 0) {
    const roleKeywords = ["engineer", "developer", "designer", "manager", "analyst", "data", "fullstack", "frontend", "backend"];
    const foundRole = parts.filter(p => roleKeywords.some(rk => p.toLowerCase().includes(rk))).join(" ");
    const nameParts = parts.filter(p => !roleKeywords.some(rk => p.toLowerCase().includes(rk)) && !["resume", "cv", "final", "latest", "doc", "pdf"].includes(p.toLowerCase()));
    
    if (nameParts.length > 0) {
      candidateName = nameParts.map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(" ");
    }
    if (foundRole) {
      detectedRole = foundRole.split(" ").map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(" ");
    }
  }

  return { candidateName, detectedRole };
}

export function generateFallbackReport(fileName: string, fileId: string): MockRoastReport {
  const { candidateName, detectedRole } = extractCandidateInfoFromFilename(fileName);

  return {
    fileId: fileId || "fallback-" + Date.now(),
    fileName,
    atsScore: 48,
    resumeScore: 4.2,
    hiringProbability: 28,
    recruiterConfidence: 38,
    judgment: `Solid core experience for a ${detectedRole}, but bullet points lack quantifiable business metrics and ATS keyword optimization.`,
    verdict: "REJECT_SOFT",
    verdictTitle: "SOFT REJECTION / LACKS QUANTIFIABLE METRIC EVIDENCE",
    bulletPoints: [
      `Resume file "${fileName}" relies heavily on passive phrasing ('worked on', 'assisted with') rather than high-impact action verbs.`,
      "Missing measurable performance metrics (e.g., % throughput improvement, $ revenue impact, scale of active users).",
      "Technical skills listed in a flat wall of text rather than categorized by domain (Frontend, Backend, Cloud & Infra).",
      "Projects section lacks direct live deployment URLs and explicit tech stack details."
    ],
    praisePoints: [
      `Clean layout structure suitable for scanning ${detectedRole} applications.`,
      "Solid foundation of relevant modern technology keywords detected."
    ],
    grammarSlam: "Overuses passive voice phrasing and vague responsibilities across experience entries.",
    buzzwordCounter: [
      { word: "passionate", count: 4 },
      { word: "hardworking", count: 3 },
      { word: "team player", count: 3 },
      { word: "synergy", count: 2 },
      { word: "results-driven", count: 2 }
    ],
    candidateProfile: {
      name: candidateName,
      detectedRole: detectedRole,
      experienceLevel: "Mid-level",
      industry: "Technology & Software",
      sectionsFound: {
        education: true,
        skills: true,
        experience: true,
        projects: true,
        certifications: false,
        achievements: true,
        summary: true
      },
      contactLinks: {
        email: true,
        phone: true,
        linkedin: true,
        github: false,
        portfolio: false
      }
    },
    dimensionScores: [
      { category: "Formatting & Layout", score: 78, feedback: "Clean single-column layout structure.", evidence: "Consistent margins and readable headings." },
      { category: "Projects & Tech Stack", score: 60, feedback: "Good project titles, but tech stack details incomplete.", evidence: "Project descriptions lack architecture breakdown." },
      { category: "Experience & Impact", score: 45, feedback: "Lacks quantifiable metrics.", evidence: "Bullet points describe job duties rather than business outcomes." },
      { category: "Skills & Evidence Match", score: 55, feedback: "Skills listed without categorical domain grouping.", evidence: "Flat list of 18 tools and languages." },
      { category: "Achievements & Quantification", score: 38, feedback: "Zero percentage or monetary metrics found.", evidence: "No numerical impact numbers present." },
      { category: "ATS & Keyword Density", score: 52, feedback: "Moderate keyword match for target role.", evidence: "Missing key cloud and testing keywords." },
      { category: "Grammar & Tone", score: 72, feedback: "Generally grammatically correct.", evidence: "No spelling errors, but passive tone." },
      { category: "Overall Resume Quality", score: 54, feedback: "Average resume with strong potential after metric rewrites.", evidence: "Solid experience foundation." }
    ],
    evidenceTable: [
      { finding: "Passive Action Verbs", evidence: "'Worked on backend features'", severity: "High", suggestion: "Replace with 'Engineered high-throughput backend microservices handling 15k requests/min'" },
      { finding: "Unquantified Outcomes", evidence: "'Improved application performance'", severity: "Critical", suggestion: "Quantify with specific metrics (e.g. 'reduced latency by 35% across 5 core API routes')" },
      { finding: "Flat Skills List", evidence: "Unordered list of 18 technologies", severity: "Medium", suggestion: "Group into Frontend, Backend, Cloud & Infrastructure categories" },
      { finding: "Missing Live Demos", evidence: "Projects listed without repository or deployment links", severity: "Medium", suggestion: "Add GitHub or live demo links for core projects" }
    ],
    personaRoasts: {
      friendly: {
        id: "friendly",
        title: "Friendly Career Advisor",
        emoji: "😊",
        badge: "CONSTRUCTIVE COACH",
        roastSummary: `You have great potential as a ${detectedRole}! With a few metric tweaks, this resume will shine.`,
        roastBulletPoints: [
          "Your technical background is strong, but your achievements are hiding behind passive words.",
          "Add specific percentage improvements to show recruiters the exact value you created."
        ],
        keyAdvice: "Focus on replacing 'worked on' with power verbs like 'Engineered', 'Spearheaded', and 'Architected'."
      },
      corporate_hr: {
        id: "corporate_hr",
        title: "Corporate HR Specialist",
        emoji: "💼",
        badge: "POLICY COMPLIANT",
        roastSummary: "Candidate meets basic qualification checks but fails to stand out among 200+ applicants.",
        roastBulletPoints: [
          "Formatting is clean enough for basic HR screens.",
          "Lacks clear career progression timeline and explicit team size metrics."
        ],
        keyAdvice: "Standardize dates and include company locations and team sizes."
      },
      hiring_manager: {
        id: "hiring_manager",
        title: "Engineering Manager",
        emoji: "🛠️",
        badge: "TECHNICAL DRILL",
        roastSummary: "Show me code and architecture metrics, not generic task descriptions.",
        roastBulletPoints: [
          "You say you built apps, but didn't mention database scale or API response times.",
          "No mention of testing frameworks (Jest, Cypress, PyTest) or CI/CD automated deployments."
        ],
        keyAdvice: "Detail the tech stack architecture and engineering trade-offs for each project."
      },
      startup_founder: {
        id: "startup_founder",
        title: "Startup Founder",
        emoji: "🚀",
        badge: "NEED SPEED & OWNERSHIP",
        roastSummary: "Reads like a corporate employee waiting for ticket assignments rather than a builder.",
        roastBulletPoints: [
          "Where is the bias for action and product ownership?",
          "Show me how fast you shipped features and what user growth you drove."
        ],
        keyAdvice: "Frame bullet points around end-to-end feature ownership and business velocity."
      },
      faang_recruiter: {
        id: "faang_recruiter",
        title: "FAANG Recruiter",
        emoji: "🏛️",
        badge: "TOP 1% BAR",
        roastSummary: "Auto-rejected at initial screen due to lack of scale metrics and top-tier achievement signals.",
        roastBulletPoints: [
          "Bullet points describe standard daily duties rather than extraordinary impact.",
          "Missing clear technical leadership or distributed systems scale indicators."
        ],
        keyAdvice: "Use the Google XYZ formula: 'Accomplished [X] as measured by [Y], by doing [Z]'."
      },
      gen_z: {
        id: "gen_z",
        title: "Gen Z Tech Recruiter",
        emoji: "💀",
        badge: "NO CAP",
        roastSummary: `Bro put 'passionate team player' 4 times on a ${detectedRole} resume in 2026 💀`,
        roastBulletPoints: [
          "No live link to GitHub or live app? Is this project in stealth mode or ghost mode?",
          "No cap, these bullet points sound like a textbook assignment."
        ],
        keyAdvice: "Drop the corporate fluff and drop the actual GitHub link bestie."
      },
      ats_robot: {
        id: "ats_robot",
        title: "ATS Robot v9.2",
        emoji: "🤖",
        badge: "KEYWORD DENSITY: 52%",
        roastSummary: "PARSER SCORE 52/100. MISSING CRITICAL INFRASTRUCTURE KEYWORDS.",
        roastBulletPoints: [
          "Skills section lacks structured JSON taxonomy for fast parsing.",
          "Detected low density for CI/CD, Docker, Cloud, and Automated Testing terms."
        ],
        keyAdvice: "Inject high-frequency ATS keywords into skills and experience bullet points."
      }
    },
    improvementSuggestions: {
      suggestedHeadline: `High-Impact ${detectedRole} specializing in Scalable Systems & Modern Frameworks`,
      actionableFixes: [
        {
          section: "Experience",
          currentText: "Worked on web features and bug fixes for company application.",
          improvedText: `Engineered 14+ scalable web features for ${detectedRole} workflow, driving a 28% increase in user engagement.`,
          reason: "Replacing passive verbs with high-impact numbers immediately catches recruiter attention."
        },
        {
          section: "Skills",
          currentText: "JavaScript, React, Node.js, Express, PostgreSQL, Git, AWS, Docker",
          improvedText: "Languages: JavaScript, TypeScript | Frameworks: React, Node.js | Infrastructure: AWS, Docker, Git",
          reason: "Categorized skills improve ATS parser accuracy and recruiter readability."
        },
        {
          section: "Projects",
          currentText: "Built a fullstack web app using React and Node.",
          improvedText: "Architected end-to-end fullstack platform serving 10k+ active users with 99.9% uptime SLA.",
          reason: "Scale metrics demonstrate production readiness and engineering maturity."
        }
      ],
      atsKeywordsToInject: ["TypeScript", "REST APIs", "AWS", "Docker", "CI/CD", "Unit Testing", "System Architecture"]
    }
  };
}

export function generateFallbackImprovedResume(
  fileName: string,
  currentReport: any
): { improvedResume: ImprovedResumeData; improvementComparison: ImprovementComparison } {
  const candidateName = currentReport?.candidateProfile?.name || "Alex Chen";
  const detectedRole = currentReport?.candidateProfile?.detectedRole || "Software Engineer";

  const improvedResume: ImprovedResumeData = {
    header: {
      name: candidateName,
      title: detectedRole,
      email: `${candidateName.toLowerCase().replace(/\s+/g, ".")}@example.com`,
      phone: "+1 (555) 234-5678",
      linkedin: `linkedin.com/in/${candidateName.toLowerCase().replace(/\s+/g, "")}`,
      github: `github.com/${candidateName.toLowerCase().replace(/\s+/g, "")}`,
      portfolio: `https://${candidateName.toLowerCase().replace(/\s+/g, "")}.dev`,
      location: "San Francisco, CA"
    },
    professionalSummary: `Results-driven ${detectedRole} with proven experience in architecting scalable applications, optimizing system performance by 35%, and delivering robust software solutions. Adept in modern web frameworks, cloud infrastructure, and collaborative Agile environments.`,
    skills: [
      {
        category: "Languages & Core",
        items: ["TypeScript", "JavaScript (ES6+)", "Python", "SQL", "HTML5/CSS3"]
      },
      {
        category: "Frameworks & Frontend",
        items: ["React", "Next.js", "Tailwind CSS", "Redux Toolkit", "RESTful APIs"]
      },
      {
        category: "Backend & Databases",
        items: ["Node.js", "Express", "PostgreSQL", "MongoDB", "Redis"]
      },
      {
        category: "Cloud, DevOps & Tools",
        items: ["AWS (S3/EC2)", "Docker", "CI/CD Pipelines", "Git", "Jest/Cypress"]
      }
    ],
    projects: [
      {
        title: "High-Throughput Analytics Dashboard",
        role: "Lead Full-Stack Developer",
        techStack: ["React", "TypeScript", "Node.js", "PostgreSQL", "Docker"],
        descriptionBullets: [
          "Architected real-time data visualization dashboard processing 50k+ daily events with under 100ms latency.",
          "Implemented JWT authentication and role-based access control (RBAC) securing multi-tenant user accounts.",
          "Containerized service using Docker and set up automated CI/CD deployment pipeline on AWS."
        ],
        liveUrl: `https://github.com/${candidateName.toLowerCase().replace(/\s+/g, "")}/analytics-app`
      },
      {
        title: "Automated Workflow Optimization Engine",
        role: "Software Engineer",
        techStack: ["Python", "Express", "MongoDB", "Redis"],
        descriptionBullets: [
          "Developed asynchronous job processing queue reducing document generation time by 42%.",
          "Engineered RESTful API endpoints with rate limiting and comprehensive swagger documentation."
        ],
        liveUrl: `https://github.com/${candidateName.toLowerCase().replace(/\s+/g, "")}/workflow-engine`
      }
    ],
    experience: [
      {
        company: "Apex Tech Solutions",
        role: `Software Engineer (${detectedRole})`,
        dates: "2023 - Present",
        location: "San Francisco, CA",
        bulletPoints: [
          "Spearheaded redesign of core product interface, increasing user retention by 24% across 100k+ active accounts.",
          "Engineered microservices backend handling 10k+ requests/minute with 99.95% uptime SLA.",
          "Mentored 3 junior developers and established automated unit testing standards, reducing regression bugs by 30%."
        ]
      },
      {
        company: "Innovate Labs",
        role: "Junior Developer",
        dates: "2021 - 2023",
        location: "San Jose, CA",
        bulletPoints: [
          "Developed responsive web components using React and Tailwind CSS, improving mobile conversion by 18%.",
          "Collaborated with cross-functional teams to integrate third-party payment and messaging APIs."
        ]
      }
    ],
    education: [
      {
        institution: "State University of Technology",
        degree: "Bachelor of Science",
        fieldOfStudy: "Computer Science",
        dates: "2017 - 2021",
        gpaOrHonors: "3.8 / 4.0 (Dean's List)"
      }
    ],
    certifications: [
      "AWS Certified Developer – Associate",
      "Meta Front-End Developer Professional Certificate"
    ],
    achievements: [
      "Winner, Regional University Hackathon (1st Place out of 45 teams)",
      "Published technical article on React Performance Optimization with 10k+ reads"
    ]
  };

  const improvementComparison: ImprovementComparison = {
    bulletPointsRewrittenCount: 8,
    grammarFixesCount: 12,
    atsScoreBefore: currentReport?.atsScore || 48,
    atsScoreAfter: 88,
    resumeScoreBefore: currentReport?.resumeScore || 4.2,
    resumeScoreAfter: 8.8,
    hiringProbabilityBefore: currentReport?.hiringProbability || 28,
    hiringProbabilityAfter: 82,
    highlightedChanges: [
      "Transformed passive bullet points into high-impact action-verb statements with quantifiable business metrics.",
      "Categorized skills into 4 distinct domain groups for maximum ATS parser keyword optimization.",
      "Drafted compelling 2-sentence executive summary emphasizing core technical strengths.",
      "Added live repository links and deployment architecture metrics to projects."
    ]
  };

  return { improvedResume, improvementComparison };
}
