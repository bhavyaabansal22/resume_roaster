import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { generateFallbackReport, generateFallbackImprovedResume } from "./src/utils/fallbackGenerators";

dotenv.config();

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const HOST = process.env.HOST || "0.0.0.0";

// Increase JSON body parser limit for base64 PDF uploads
app.use(express.json({ limit: "25mb" }));

// Initialize Gemini client server-side
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is missing.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Resume roast analysis endpoint
app.post("/api/roast", async (req, res) => {
  try {
    const { fileId, fileName, fileBase64, mimeType, isBlank, isCorrupted } = req.body;

    if (!fileName) {
      return res.status(400).json({ error: "fileName is required" });
    }

    // Handle edge cases explicitly passed from simulator toggles
    if (isBlank) {
      return res.json({
        report: {
          fileId: fileId || "blank-id",
          fileName,
          atsScore: 0,
          resumeScore: 0.5,
          hiringProbability: 0,
          recruiterConfidence: 0,
          judgment: "Looks like this resume forgot to show up. It is literally a blank canvas of unemployment.",
          verdict: "TRASH",
          verdictTitle: "IMMEDIATE TRASH BIN",
          bulletPoints: [
            "Nothing here. Absolutely nothing. A conceptual masterpiece of pure emptiness.",
            "Are you applying as an invisible candidate or a secret agent with redacted records?",
            "Recruiter.exe ran an optical scan and only found white pixels."
          ],
          praisePoints: ["Saves recruiters 6 seconds of reading time."],
          grammarSlam: "N/A - Zero words detected.",
          buzzwordCounter: [],
          candidateProfile: {
            name: "Unknown / Blank Candidate",
            detectedRole: "Unclear / Blank Document",
            experienceLevel: "Fresher",
            industry: "Unknown",
            sectionsFound: { education: false, skills: false, experience: false, projects: false, certifications: false, achievements: false, summary: false },
            contactLinks: { email: false, phone: false, linkedin: false, github: false, portfolio: false }
          },
          dimensionScores: [],
          evidenceTable: [],
          personaRoasts: {
            gen_z: {
              id: "gen_z",
              title: "Gen Z Recruiter",
              emoji: "💀",
              badge: "NO CAP",
              roastSummary: "Bro really submitted an empty PDF and thought we wouldn't notice 💀",
              roastBulletPoints: ["Empty document alert", "No cap, this is ghost mode"],
              keyAdvice: "Put actual text on the page bestie."
            }
          },
          improvementSuggestions: {
            suggestedHeadline: "Upload a complete resume document.",
            actionableFixes: [{ section: "General", currentText: "[Blank Document]", improvedText: "Add your contact info, experience, and projects.", reason: "An empty resume cannot pass ATS or human review." }],
            atsKeywordsToInject: ["Resume", "Experience", "Skills"]
          }
        }
      });
    }

    if (isCorrupted) {
      return res.json({
        report: {
          fileId: fileId || "corrupted-id",
          fileName,
          atsScore: 5,
          resumeScore: 1.0,
          hiringProbability: 1,
          recruiterConfidence: 2,
          judgment: "Corrupted or unreadable file. It screamed in binary and crumbled upon opening.",
          verdict: "TRASH",
          verdictTitle: "PARSING ERROR / CORRUPTED FILE",
          bulletPoints: [
            "Document failed file header verification. PDF encoding appears mangled or malformed.",
            "ATS parsers throw an unhandled exception when attempting to parse this file structure.",
            "Probably a strategic play to avoid being judged, but recruiters won't debug your PDF."
          ],
          praisePoints: ["File name is at least recognizable as a PDF."],
          grammarSlam: "File header unreadable.",
          buzzwordCounter: [],
          candidateProfile: {
            name: "Corrupted File Candidate",
            detectedRole: "Unparseable Document",
            experienceLevel: "Fresher",
            industry: "Unknown",
            sectionsFound: { education: false, skills: false, experience: false, projects: false, certifications: false, achievements: false, summary: false },
            contactLinks: { email: false, phone: false, linkedin: false, github: false, portfolio: false }
          },
          dimensionScores: [],
          evidenceTable: [],
          personaRoasts: {
            ats_robot: {
              id: "ats_robot",
              title: "ATS Robot v9.2",
              emoji: "🤖",
              badge: "FILE CORRUPTED",
              roastSummary: "FATAL PARSE EXCEPTION AT BYTE 0x004F. REJECTED IMMEDIATELY.",
              roastBulletPoints: ["File byte corrupt", "PDF stream destroyed"],
              keyAdvice: "Re-export file as clean PDF/A standard."
            }
          },
          improvementSuggestions: {
            suggestedHeadline: "Re-export as standard PDF",
            actionableFixes: [{ section: "File Export", currentText: "[Corrupted Binary]", improvedText: "Export directly from Google Docs or Word as standard PDF.", reason: "Broken PDFs are rejected automatically by ATS." }],
            atsKeywordsToInject: ["PDF", "Standard Format"]
          }
        }
      });
    }

    let contentsParts: any[] = [];

    if (fileBase64) {
      const cleanBase64 = fileBase64.replace(/^data:[^;]+;base64,/, "");
      contentsParts.push({
        inlineData: {
          mimeType: mimeType || "application/pdf",
          data: cleanBase64,
        },
      });
    }

    contentsParts.push({
      text: `You are RECRUITER.EXE — an expert, brutally honest, evidence-based resume evaluator and recruiter simulator.
Perform a thorough, evidence-backed inspection of the candidate's resume uploaded in this document (File name: "${fileName}").

CRITICAL RULES:
1. NEVER generate generic comments.
2. NEVER invent information or mention projects/skills that are NOT in the resume.
3. EVERY criticism and joke MUST cite exact evidence (quotes, numbers, specific missing links/skills) directly extracted from this resume.
4. If something is genuinely impressive or well-quantified, acknowledge it in the praise section!
5. Generate unique evidence-backed analyses for all 7 recruiter personas (Friendly, Corporate HR, Hiring Manager, Startup Founder, FAANG Recruiter, Gen Z Recruiter, ATS Robot) analyzing THIS SAME RESUME content.

Return JSON in the requested schema containing:
- candidateProfile: extracted candidate name, detected target role, experience level (Student, Fresher, Intern, Junior, Mid-level, Senior), industry, detected sections, contact links presence.
- resumeScore: float or int out of 10 (e.g. 3.5).
- atsScore: int out of 100 (e.g. 28).
- hiringProbability: int percentage out of 100 (e.g. 14).
- recruiterConfidence: int percentage out of 100 (e.g. 25).
- judgment: 1-2 sentence overall brutal recruiter verdict summarizing their main impression.
- verdict: one of "TRASH", "GHOST", "REJECT_SOFT", "INTERVIEW_UNLIKELY".
- verdictTitle: snappy label like "IMMEDIATE TRASH BIN", "GHOSTED FOR 6 MONTHS", "GENERIC AUTO-REJECT", "INTERVIEW HIGHLY UNLIKELY".
- bulletPoints: 3 to 5 razor-sharp, evidence-backed flaws citing exact parts of the resume.
- praisePoints: 1 to 2 genuinely positive points or "None found".
- grammarSlam: 1 sentence critique of tone, sentence structure, or action verb usage.
- buzzwordCounter: array of top 3-5 overused buzzwords found with exact count numbers.
- dimensionScores: array of 8 evaluations (Formatting & Layout, Projects & Tech Stack, Experience & Impact, Skills & Evidence Match, Achievements & Quantification, ATS & Keyword Density, Grammar & Tone, Overall Resume Quality) each with score (0-100), feedback, and exact evidence quote.
- evidenceTable: array of 3-5 findings, exact evidence quotes, severity ("Critical", "High", "Medium", "Low"), and constructive suggestion.
- personaRoasts: object containing 7 entries with keys: "friendly", "corporate_hr", "hiring_manager", "startup_founder", "faang_recruiter", "gen_z", "ats_robot". Each persona entry must have: id, title, emoji, badge, roastSummary, roastBulletPoints (array of 2-3 bullet points in that persona's voice citing real resume facts), and keyAdvice.
- improvementSuggestions: suggestedHeadline, actionableFixes (array of 3 items with section, currentText from resume, improvedText, reason), and atsKeywordsToInject (array of 5 keywords).`
    });

    let report = null;

    try {
      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: { parts: contentsParts },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              candidateProfile: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  detectedRole: { type: Type.STRING },
                  experienceLevel: { type: Type.STRING },
                  industry: { type: Type.STRING },
                  sectionsFound: {
                    type: Type.OBJECT,
                    properties: {
                      education: { type: Type.BOOLEAN },
                      skills: { type: Type.BOOLEAN },
                      experience: { type: Type.BOOLEAN },
                      projects: { type: Type.BOOLEAN },
                      certifications: { type: Type.BOOLEAN },
                      achievements: { type: Type.BOOLEAN },
                      summary: { type: Type.BOOLEAN },
                    },
                    required: ["education", "skills", "experience", "projects", "certifications", "achievements", "summary"],
                  },
                  contactLinks: {
                    type: Type.OBJECT,
                    properties: {
                      email: { type: Type.BOOLEAN },
                      phone: { type: Type.BOOLEAN },
                      linkedin: { type: Type.BOOLEAN },
                      github: { type: Type.BOOLEAN },
                      portfolio: { type: Type.BOOLEAN },
                    },
                    required: ["email", "phone", "linkedin", "github", "portfolio"],
                  },
                },
                required: ["name", "detectedRole", "experienceLevel", "industry", "sectionsFound", "contactLinks"],
              },
              resumeScore: { type: Type.NUMBER },
              atsScore: { type: Type.INTEGER },
              hiringProbability: { type: Type.INTEGER },
              recruiterConfidence: { type: Type.INTEGER },
              judgment: { type: Type.STRING },
              verdict: { type: Type.STRING },
              verdictTitle: { type: Type.STRING },
              bulletPoints: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              praisePoints: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              grammarSlam: { type: Type.STRING },
              buzzwordCounter: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    word: { type: Type.STRING },
                    count: { type: Type.INTEGER },
                  },
                  required: ["word", "count"],
                },
              },
              dimensionScores: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    category: { type: Type.STRING },
                    score: { type: Type.INTEGER },
                    feedback: { type: Type.STRING },
                    evidence: { type: Type.STRING },
                  },
                  required: ["category", "score", "feedback", "evidence"],
                },
              },
              evidenceTable: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    finding: { type: Type.STRING },
                    evidence: { type: Type.STRING },
                    severity: { type: Type.STRING },
                    suggestion: { type: Type.STRING },
                  },
                  required: ["finding", "evidence", "severity", "suggestion"],
                },
              },
              personaRoasts: {
                type: Type.OBJECT,
                properties: {
                  friendly: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      title: { type: Type.STRING },
                      emoji: { type: Type.STRING },
                      badge: { type: Type.STRING },
                      roastSummary: { type: Type.STRING },
                      roastBulletPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
                      keyAdvice: { type: Type.STRING },
                    },
                    required: ["id", "title", "emoji", "badge", "roastSummary", "roastBulletPoints", "keyAdvice"],
                  },
                  corporate_hr: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      title: { type: Type.STRING },
                      emoji: { type: Type.STRING },
                      badge: { type: Type.STRING },
                      roastSummary: { type: Type.STRING },
                      roastBulletPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
                      keyAdvice: { type: Type.STRING },
                    },
                    required: ["id", "title", "emoji", "badge", "roastSummary", "roastBulletPoints", "keyAdvice"],
                  },
                  hiring_manager: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      title: { type: Type.STRING },
                      emoji: { type: Type.STRING },
                      badge: { type: Type.STRING },
                      roastSummary: { type: Type.STRING },
                      roastBulletPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
                      keyAdvice: { type: Type.STRING },
                    },
                    required: ["id", "title", "emoji", "badge", "roastSummary", "roastBulletPoints", "keyAdvice"],
                  },
                  startup_founder: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      title: { type: Type.STRING },
                      emoji: { type: Type.STRING },
                      badge: { type: Type.STRING },
                      roastSummary: { type: Type.STRING },
                      roastBulletPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
                      keyAdvice: { type: Type.STRING },
                    },
                    required: ["id", "title", "emoji", "badge", "roastSummary", "roastBulletPoints", "keyAdvice"],
                  },
                  faang_recruiter: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      title: { type: Type.STRING },
                      emoji: { type: Type.STRING },
                      badge: { type: Type.STRING },
                      roastSummary: { type: Type.STRING },
                      roastBulletPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
                      keyAdvice: { type: Type.STRING },
                    },
                    required: ["id", "title", "emoji", "badge", "roastSummary", "roastBulletPoints", "keyAdvice"],
                  },
                  gen_z: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      title: { type: Type.STRING },
                      emoji: { type: Type.STRING },
                      badge: { type: Type.STRING },
                      roastSummary: { type: Type.STRING },
                      roastBulletPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
                      keyAdvice: { type: Type.STRING },
                    },
                    required: ["id", "title", "emoji", "badge", "roastSummary", "roastBulletPoints", "keyAdvice"],
                  },
                  ats_robot: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      title: { type: Type.STRING },
                      emoji: { type: Type.STRING },
                      badge: { type: Type.STRING },
                      roastSummary: { type: Type.STRING },
                      roastBulletPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
                      keyAdvice: { type: Type.STRING },
                    },
                    required: ["id", "title", "emoji", "badge", "roastSummary", "roastBulletPoints", "keyAdvice"],
                  },
                },
                required: ["friendly", "corporate_hr", "hiring_manager", "startup_founder", "faang_recruiter", "gen_z", "ats_robot"],
              },
              improvementSuggestions: {
                type: Type.OBJECT,
                properties: {
                  suggestedHeadline: { type: Type.STRING },
                  actionableFixes: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        section: { type: Type.STRING },
                        currentText: { type: Type.STRING },
                        improvedText: { type: Type.STRING },
                        reason: { type: Type.STRING },
                      },
                      required: ["section", "currentText", "improvedText", "reason"],
                    },
                  },
                  atsKeywordsToInject: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
                required: ["suggestedHeadline", "actionableFixes", "atsKeywordsToInject"],
              },
            },
            required: [
              "candidateProfile",
              "resumeScore",
              "atsScore",
              "hiringProbability",
              "recruiterConfidence",
              "judgment",
              "verdict",
              "verdictTitle",
              "bulletPoints",
              "praisePoints",
              "grammarSlam",
              "buzzwordCounter",
              "dimensionScores",
              "evidenceTable",
              "personaRoasts",
              "improvementSuggestions",
            ],
          },
        },
      });

      const parsedData = JSON.parse(response.text.trim());
      report = {
        fileId: fileId || "file-" + Date.now(),
        fileName,
        ...parsedData,
      };
    } catch (geminiErr: any) {
      console.warn("Gemini API call failed in /api/roast (rate limit or network error). Generating fallback analysis report:", geminiErr?.message || geminiErr);
      report = generateFallbackReport(fileName, fileId);
    }

    return res.json({ report });
  } catch (error: any) {
    console.error("Error in /api/roast outer block:", error);
    const fallbackReport = generateFallbackReport(req.body.fileName || "Resume.pdf", req.body.fileId || "file-1");
    return res.json({ report: fallbackReport });
  }
});

// AI Resume Improvement & Rewrite Endpoint (Stage 12)
app.post("/api/improve-resume", async (req, res) => {
  try {
    const { fileName, fileBase64, mimeType, currentReport } = req.body;

    if (!fileName) {
      return res.status(400).json({ error: "fileName is required" });
    }

    const ai = getGeminiClient();
    let contentsParts: any[] = [];

    if (fileBase64) {
      const cleanBase64 = fileBase64.replace(/^data:[^;]+;base64,/, "");
      contentsParts.push({
        inlineData: {
          mimeType: mimeType || "application/pdf",
          data: cleanBase64,
        },
      });
    }

    contentsParts.push({
      text: `You are RECRUITER.EXE RESUME OPTIMIZER.
Your task is to take the candidate's uploaded resume (File: "${fileName}") and the audit analysis report, and generate a modernized, recruiter-approved, ATS-optimized version of the candidate's resume.

STRICT ACCURACY RULES:
1. NEVER FABRICATE OR INVENT fake qualifications, fake work experience, fake companies, fake job titles, fake certifications, or fake metric numbers.
2. PRESERVE ALL TRUTHFUL INFORMATION provided by the candidate.
3. YOU MAY ONLY:
   - Rewrite weak bullet points into high-impact action-verb statements (e.g., "Developed and deployed a responsive React-based web application featuring authentication and dynamic UI").
   - Fix grammar, spelling, and tone.
   - Standardize formatting and section ordering.
   - Categorize technical and soft skills into logical domain groups.
   - Optimize keyword placement for ATS parsers.
   - Rewrite the professional summary into a compelling 2-3 sentence overview.
   - Clean up project descriptions and highlight measurable impact where supported by evidence.

Audit report context: ${JSON.stringify(currentReport || {})}

Return JSON matching the schema with:
- improvedResume: header (name, title, email, phone, linkedin, github, portfolio, location), professionalSummary, skills (array of category & items), projects, experience, education, certifications, achievements.
- improvementComparison: bulletPointsRewrittenCount, grammarFixesCount, atsScoreBefore, atsScoreAfter, resumeScoreBefore, resumeScoreAfter, hiringProbabilityBefore, hiringProbabilityAfter, highlightedChanges (array of key enhancements).`
    });

    let improvedResume = null;
    let improvementComparison = null;

    try {
      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: { parts: contentsParts },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              improvedResume: {
                type: Type.OBJECT,
                properties: {
                  header: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      title: { type: Type.STRING },
                      email: { type: Type.STRING },
                      phone: { type: Type.STRING },
                      linkedin: { type: Type.STRING },
                      github: { type: Type.STRING },
                      portfolio: { type: Type.STRING },
                      location: { type: Type.STRING },
                    },
                    required: ["name", "title", "email", "phone", "linkedin", "github", "portfolio", "location"],
                  },
                  professionalSummary: { type: Type.STRING },
                  skills: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        category: { type: Type.STRING },
                        items: { type: Type.ARRAY, items: { type: Type.STRING } },
                      },
                      required: ["category", "items"],
                    },
                  },
                  projects: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        title: { type: Type.STRING },
                        role: { type: Type.STRING },
                        techStack: { type: Type.ARRAY, items: { type: Type.STRING } },
                        descriptionBullets: { type: Type.ARRAY, items: { type: Type.STRING } },
                        liveUrl: { type: Type.STRING },
                      },
                      required: ["title", "role", "techStack", "descriptionBullets"],
                    },
                  },
                  experience: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        company: { type: Type.STRING },
                        role: { type: Type.STRING },
                        dates: { type: Type.STRING },
                        location: { type: Type.STRING },
                        bulletPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
                      },
                      required: ["company", "role", "dates", "bulletPoints"],
                    },
                  },
                  education: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        institution: { type: Type.STRING },
                        degree: { type: Type.STRING },
                        fieldOfStudy: { type: Type.STRING },
                        dates: { type: Type.STRING },
                        gpaOrHonors: { type: Type.STRING },
                      },
                      required: ["institution", "degree", "dates"],
                    },
                  },
                  certifications: { type: Type.ARRAY, items: { type: Type.STRING } },
                  achievements: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ["header", "professionalSummary", "skills", "projects", "experience", "education", "certifications", "achievements"],
              },
              improvementComparison: {
                type: Type.OBJECT,
                properties: {
                  bulletPointsRewrittenCount: { type: Type.INTEGER },
                  grammarFixesCount: { type: Type.INTEGER },
                  atsScoreBefore: { type: Type.INTEGER },
                  atsScoreAfter: { type: Type.INTEGER },
                  resumeScoreBefore: { type: Type.NUMBER },
                  resumeScoreAfter: { type: Type.NUMBER },
                  hiringProbabilityBefore: { type: Type.INTEGER },
                  hiringProbabilityAfter: { type: Type.INTEGER },
                  highlightedChanges: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: [
                  "bulletPointsRewrittenCount",
                  "grammarFixesCount",
                  "atsScoreBefore",
                  "atsScoreAfter",
                  "resumeScoreBefore",
                  "resumeScoreAfter",
                  "hiringProbabilityBefore",
                  "hiringProbabilityAfter",
                  "highlightedChanges",
                ],
              },
            },
            required: ["improvedResume", "improvementComparison"],
          },
        },
      });

      const parsedData = JSON.parse(response.text.trim());
      improvedResume = parsedData.improvedResume;
      improvementComparison = parsedData.improvementComparison;
    } catch (geminiErr: any) {
      console.warn("Gemini API call failed in /api/improve-resume (rate limit or network error). Generating fallback improved resume:", geminiErr?.message || geminiErr);
      const fallbackData = generateFallbackImprovedResume(fileName, currentReport);
      improvedResume = fallbackData.improvedResume;
      improvementComparison = fallbackData.improvementComparison;
    }

    return res.json({
      improvedResume,
      improvementComparison,
    });
  } catch (error: any) {
    console.error("Error in /api/improve-resume outer block:", error);
    const fallbackData = generateFallbackImprovedResume(req.body.fileName || "Resume.pdf", req.body.currentReport);
    return res.json({
      improvedResume: fallbackData.improvedResume,
      improvementComparison: fallbackData.improvementComparison,
    });
  }
});


async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
