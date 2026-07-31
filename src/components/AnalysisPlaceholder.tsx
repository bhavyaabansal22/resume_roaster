import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bot, Terminal, AlertCircle, RefreshCw, Flame, Skull, 
  FileText, ChevronRight, CheckCircle2, ShieldAlert,
  UserCheck, FileSearch, Sparkles, ChevronDown, ChevronUp, Zap,
  Download, Copy, Check, Eye, Columns, ArrowRight, Layers, FileCheck, AlertTriangle
} from 'lucide-react';
import { UploadedFile, MockRoastReport, DecisionType, PersonaId, ImprovedResumeData, ImprovementComparison } from '../types';
import { downloadResumePDF, downloadResumeDOCX, formatResumeAsMarkdown } from '../utils/exportResume';

interface AnalysisPlaceholderProps {
  files: UploadedFile[];
  onBack: () => void;
  triggerToast: (type: 'success' | 'error' | 'warning' | 'info', message: string) => void;
}

const PERSONA_CONFIG: Record<PersonaId, { name: string; emoji: string; color: string }> = {
  friendly: { name: "Friendly Recruiter", emoji: "🤝", color: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  corporate_hr: { name: "Corporate HR", emoji: "💼", color: "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  hiring_manager: { name: "Hiring Manager", emoji: "🛠️", color: "border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" },
  startup_founder: { name: "Startup Founder", emoji: "🚀", color: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  faang_recruiter: { name: "FAANG Recruiter", emoji: "🏛️", color: "border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400" },
  gen_z: { name: "Gen Z Recruiter", emoji: "💀", color: "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400" },
  ats_robot: { name: "ATS Robot", emoji: "🤖", color: "border-cyan-500/30 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400" }
};

export default function AnalysisPlaceholder({ files, onBack, triggerToast }: AnalysisPlaceholderProps) {
  const [phase, setPhase] = useState<'scanning' | 'results'>('scanning');
  const [scanIndex, setScanIndex] = useState(0);
  const [reports, setReports] = useState<MockRoastReport[]>([]);

  // Per-report UI state maps
  const [activePersonaMap, setActivePersonaMap] = useState<Record<string, PersonaId>>({});
  const [expandedEvidenceMap, setExpandedEvidenceMap] = useState<Record<string, boolean>>({});
  const [showFixesMap, setShowFixesMap] = useState<Record<string, boolean>>({});

  // Stage 12 Improvement state maps
  const [improvingMap, setImprovingMap] = useState<Record<string, boolean>>({});
  const [improvedDataMap, setImprovedDataMap] = useState<Record<string, ImprovedResumeData>>({});
  const [comparisonMap, setComparisonMap] = useState<Record<string, ImprovementComparison>>({});
  const [viewModeMap, setViewModeMap] = useState<Record<string, 'preview' | 'compare'>>({});
  const [copiedMap, setCopiedMap] = useState<Record<string, boolean>>({});

  const scanLogs = [
    "✓ Stage 1: Validating PDF file structure & headers...",
    "✓ Stage 2: Extracting raw resume content & text layout...",
    "✓ Stage 3: Parsing sections (Education, Experience, Projects, Skills)...",
    "✓ Stage 4: Understanding candidate profile, target role & career level...",
    "✓ Stage 5: Agent 1 (ATS Expert) checking keyword coverage & formatting...",
    "✓ Stage 5: Agent 2 (Recruiter) evaluating first impression & readability...",
    "✓ Stage 5: Agent 3 (Project Reviewer) inspecting technical depth & metrics...",
    "✓ Stage 5: Agent 4 (Skills Reviewer) verifying evidence supporting skills...",
    "✓ Stage 5: Agent 5 (Grammar Reviewer) analyzing tone & action verb choices...",
    "✓ Stage 5: Agent 6 (Achievement Reviewer) checking quantified impact...",
    "✓ Stage 6: Aggregating findings into structured Evidence Database...",
    "✓ Stage 7: Calculating explainable scores across all dimensions...",
    "✓ Stage 8: Calling Recruiter.exe 7 Personas Panel...",
    "✓ Stage 9: Preparing evidence-backed roast report..."
  ];

  // Convert File object to base64 string helper
  const readFileAsBase64 = (fileObj: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(fileObj);
    });
  };

  // Run analysis pipeline
  useEffect(() => {
    let isSubscribed = true;

    async function analyzeResumes() {
      // Animate logs sequentially
      const interval = setInterval(() => {
        setScanIndex((prev) => Math.min(prev + 1, scanLogs.length - 1));
      }, 550);

      try {
        const fetchedReports: MockRoastReport[] = [];

        for (const uploadedFile of files) {
          let base64 = "";
          try {
            base64 = await readFileAsBase64(uploadedFile.file);
          } catch (e) {
            console.error("Error reading file as base64:", e);
          }

          const response = await fetch("/api/roast", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fileId: uploadedFile.id,
              fileName: uploadedFile.name,
              fileBase64: base64,
              mimeType: uploadedFile.file.type || "application/pdf",
              isBlank: uploadedFile.isBlank,
              isCorrupted: uploadedFile.isCorrupted
            })
          });

          if (!response.ok) {
            throw new Error(`Server returned status ${response.status}`);
          }

          const data = await response.json();
          if (data.report) {
            fetchedReports.push(data.report);
          }
        }

        clearInterval(interval);

        if (isSubscribed) {
          setReports(fetchedReports);
          
          // Initialize persona maps
          const initialPersonas: Record<string, PersonaId> = {};
          fetchedReports.forEach((r) => {
            initialPersonas[r.fileId] = 'gen_z'; // default persona
          });
          setActivePersonaMap(initialPersonas);

          setTimeout(() => {
            setPhase('results');
            triggerToast('success', "Evidence-backed resume analysis complete!");
          }, 500);
        }
      } catch (err: any) {
        clearInterval(interval);
        console.error("Error analyzing resumes:", err);
        if (isSubscribed) {
          triggerToast('error', "Failed to analyze resume via AI engine. Please retry.");
          onBack();
        }
      }
    }

    if (phase === 'scanning') {
      analyzeResumes();
    }

    return () => {
      isSubscribed = false;
    };
  }, [phase, files]);

  const getVerdictDetails = (verdict: DecisionType, titleOverride?: string) => {
    switch (verdict) {
      case 'TRASH':
        return { label: titleOverride || "IMMEDIATE TRASH BIN", color: "bg-red-500/10 border-red-500/40 text-red-500", icon: Skull };
      case 'GHOST':
        return { label: titleOverride || "GHOST FOR 6 MONTHS", color: "bg-amber-500/10 border-amber-500/40 text-amber-500", icon: Flame };
      case 'REJECT_SOFT':
        return { label: titleOverride || "GENERIC AUTO-REJECT EMAIL", color: "bg-orange-500/10 border-orange-500/40 text-orange-500", icon: AlertCircle };
      default:
        return { label: titleOverride || "INTERVIEW HIGHLY UNLIKELY", color: "bg-blue-500/10 border-blue-500/40 text-blue-500", icon: Bot };
    }
  };

  const togglePersona = (fileId: string, personaId: PersonaId) => {
    setActivePersonaMap((prev) => ({ ...prev, [fileId]: personaId }));
  };

  const toggleEvidence = (fileId: string) => {
    setExpandedEvidenceMap((prev) => ({ ...prev, [fileId]: !prev[fileId] }));
  };

  const toggleFixes = (fileId: string) => {
    setShowFixesMap((prev) => ({ ...prev, [fileId]: !prev[fileId] }));
  };

  // Stage 12: Handle AI Resume Improvement
  const handleImproveResume = async (report: MockRoastReport) => {
    const fileId = report.fileId;
    setImprovingMap((prev) => ({ ...prev, [fileId]: true }));
    triggerToast('info', "Recruiter.exe is intelligently rebuilding your resume...");

    try {
      const targetFile = files.find((f) => f.id === fileId) || files[0];
      let base64 = "";
      if (targetFile?.file) {
        base64 = await readFileAsBase64(targetFile.file);
      }

      const response = await fetch("/api/improve-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: report.fileName,
          fileBase64: base64,
          mimeType: targetFile?.file.type || "application/pdf",
          currentReport: report
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();

      if (data.improvedResume && data.improvementComparison) {
        setImprovedDataMap((prev) => ({ ...prev, [fileId]: data.improvedResume }));
        setComparisonMap((prev) => ({ ...prev, [fileId]: data.improvementComparison }));
        setViewModeMap((prev) => ({ ...prev, [fileId]: 'preview' }));
        triggerToast('success', "✨ Improved resume generated successfully!");
      }
    } catch (error: any) {
      console.error("Error improving resume:", error);
      triggerToast('error', "Failed to generate improved resume. Please try again.");
    } finally {
      setImprovingMap((prev) => ({ ...prev, [fileId]: false }));
    }
  };

  // Download PDF handler
  const handleDownloadPDF = async (resumeData: ImprovedResumeData) => {
    try {
      await downloadResumePDF(resumeData);
      triggerToast('success', "PDF downloaded successfully!");
    } catch (e) {
      console.error("Error exporting PDF:", e);
      triggerToast('error', "Failed to export PDF.");
    }
  };

  // Download DOCX handler
  const handleDownloadDOCX = async (resumeData: ImprovedResumeData) => {
    try {
      await downloadResumeDOCX(resumeData);
      triggerToast('success', "DOCX downloaded successfully!");
    } catch (e) {
      console.error("Error exporting DOCX:", e);
      triggerToast('error', "Failed to export DOCX.");
    }
  };

  // Copy text handler
  const handleCopyText = (fileId: string, resumeData: ImprovedResumeData) => {
    const text = formatResumeAsMarkdown(resumeData);
    navigator.clipboard.writeText(text);
    setCopiedMap((prev) => ({ ...prev, [fileId]: true }));
    triggerToast('success', "Improved resume copied to clipboard!");
    setTimeout(() => {
      setCopiedMap((prev) => ({ ...prev, [fileId]: false }));
    }, 2500);
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-4">
      {phase === 'scanning' ? (
        <div className="rounded-3xl border border-blue-500/20 bg-black/50 glass-panel p-8 md:p-12 shadow-[0_0_50px_rgba(59,130,246,0.15)] relative overflow-hidden text-left">
          {/* Laser beam scanline animation */}
          <motion.div
            animate={{ y: ['0%', '100%', '0%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-blue-500 to-transparent shadow-[0_0_15px_#3b82f6]"
          />

          <div className="flex items-center gap-3 border-b border-zinc-800 pb-4 mb-8">
            <Terminal className="w-6 h-6 text-blue-500 animate-pulse" />
            <span className="text-sm font-mono font-bold uppercase tracking-widest text-zinc-300">
              RECRUITER.EXE AI Pipeline Matrix v2.0
            </span>
          </div>

          <div className="space-y-3.5 font-mono text-xs md:text-sm">
            {scanLogs.slice(0, scanIndex + 1).map((log, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2.5 text-zinc-300"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{log}</span>
              </motion.div>
            ))}
            
            <motion.div
              animate={{ opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="flex items-center gap-2 text-blue-400 font-bold pt-2"
            >
              <ChevronRight className="w-4 h-4 text-blue-500 flex-shrink-0 animate-ping" />
              <span>RUNNING SPECIALIZED AGENTS & EVIDENCE DATABASE AGGREGATION...</span>
            </motion.div>
          </div>

          <div className="mt-10 flex flex-col items-center gap-3">
            <div className="w-full bg-zinc-900 rounded-full h-3 overflow-hidden border border-zinc-800">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: `${((scanIndex + 1) / scanLogs.length) * 100}%` }}
                className="bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-500 h-full rounded-full"
              />
            </div>
            <span className="text-xs text-zinc-400 font-mono mt-1">
              Analyzing {files.length} resume file{files.length > 1 ? 's' : ''} through structured 12-stage recruiter pipeline...
            </span>
          </div>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-200/60 dark:border-zinc-800/80 pb-6">
            <div className="text-left">
              <h2 className="text-2xl md:text-3xl font-display font-black text-gray-900 dark:text-white">
                Evidence-Based Resume Audit
              </h2>
              <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1 font-medium">
                Complete multi-agent recruiter pipeline evaluation for {files.length} document{files.length > 1 ? 's' : ''}.
              </p>
            </div>
            <button
              onClick={onBack}
              className="px-5 py-2.5 rounded-2xl text-xs font-mono font-bold tracking-wider uppercase border border-gray-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/40 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-300 transition-all cursor-pointer flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Upload New Resume</span>
            </button>
          </div>

          {/* List of Detailed Reports */}
          <div className="space-y-12">
            {reports.map((report, index) => {
              const verdict = getVerdictDetails(report.verdict, report.verdictTitle);
              const VerdictIcon = verdict.icon;
              const profile = report.candidateProfile;
              const activePersonaId = activePersonaMap[report.fileId] || 'gen_z';
              const activePersonaRoast = report.personaRoasts?.[activePersonaId];
              const isEvidenceExpanded = !!expandedEvidenceMap[report.fileId];
              const isFixesShown = !!showFixesMap[report.fileId];

              // Improvement Data
              const isImproving = !!improvingMap[report.fileId];
              const improvedData = improvedDataMap[report.fileId];
              const comparisonData = comparisonMap[report.fileId];
              const currentViewMode = viewModeMap[report.fileId] || 'preview';
              const isCopied = !!copiedMap[report.fileId];

              return (
                <motion.div
                  key={report.fileId}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="rounded-3xl border border-gray-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-950/60 p-6 md:p-10 relative overflow-hidden shadow-2xl space-y-8"
                >
                  {/* Decorative ambient background orb */}
                  <div className="absolute -top-16 -right-16 w-64 h-64 bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

                  {/* Top Bar: File info & Detected Candidate Profile */}
                  <div className="space-y-4 border-b border-gray-200/60 dark:border-zinc-800/60 pb-6 text-left">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-xs font-mono text-gray-500 dark:text-zinc-400">
                        <FileText className="w-4 h-4 text-blue-500" />
                        <span className="truncate max-w-[240px] font-bold text-gray-800 dark:text-zinc-200">{report.fileName}</span>
                        <span>•</span>
                        <span className="text-gray-400 uppercase">Document #{index + 1}</span>
                      </div>

                      {profile && (
                        <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono font-bold uppercase">
                          <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full">
                            Role: {profile.detectedRole}
                          </span>
                          <span className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 px-3 py-1 rounded-full">
                            Level: {profile.experienceLevel}
                          </span>
                          {profile.industry && (
                            <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full">
                              Industry: {profile.industry}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Candidate Name & Contact Check */}
                    {profile && (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                        <div>
                          <h3 className="text-xl font-black font-display text-gray-900 dark:text-white flex items-center gap-2">
                            <UserCheck className="w-5 h-5 text-blue-500" />
                            <span>{profile.name || "Candidate"}</span>
                          </h3>
                        </div>

                        <div className="flex items-center gap-3 text-xs font-mono text-gray-500 dark:text-zinc-400">
                          <span className="text-[11px] font-bold uppercase tracking-wider">Contact Links:</span>
                          <div className="flex gap-1.5">
                            <span title="Email" className={`px-2 py-0.5 rounded text-[10px] font-bold ${profile.contactLinks.email ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/10 text-red-400 line-through'}`}>Email</span>
                            <span title="Phone" className={`px-2 py-0.5 rounded text-[10px] font-bold ${profile.contactLinks.phone ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/10 text-red-400 line-through'}`}>Phone</span>
                            <span title="LinkedIn" className={`px-2 py-0.5 rounded text-[10px] font-bold ${profile.contactLinks.linkedin ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/10 text-red-400 line-through'}`}>LinkedIn</span>
                            <span title="GitHub" className={`px-2 py-0.5 rounded text-[10px] font-bold ${profile.contactLinks.github ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/10 text-red-400 line-through'}`}>GitHub</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Core Scores Metric Cards Bar */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="glass p-5 rounded-2xl border border-gray-200/50 dark:border-zinc-800 text-left">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500">
                        Resume Score
                      </span>
                      <div className="text-3xl font-black font-display text-gray-900 dark:text-white mt-1">
                        {report.resumeScore != null ? report.resumeScore.toFixed(1) : (report.atsScore / 10).toFixed(1)}<span className="text-sm text-gray-400 font-normal">/10</span>
                      </div>
                      <p className="text-[10px] text-gray-500 dark:text-zinc-400 mt-1 font-mono">Overall quality rating</p>
                    </div>

                    <div className="glass p-5 rounded-2xl border border-gray-200/50 dark:border-zinc-800 text-left">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500">
                        ATS Reality Score
                      </span>
                      <div className="text-3xl font-black font-display text-blue-500 mt-1">
                        {report.atsScore}%
                      </div>
                      <p className="text-[10px] text-gray-500 dark:text-zinc-400 mt-1 font-mono">Automated filter pass rate</p>
                    </div>

                    <div className="glass p-5 rounded-2xl border border-gray-200/50 dark:border-zinc-800 text-left">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500">
                        Hiring Probability
                      </span>
                      <div className="text-3xl font-black font-display text-amber-500 mt-1">
                        {report.hiringProbability ?? Math.floor(report.atsScore * 0.4)}%
                      </div>
                      <p className="text-[10px] text-gray-500 dark:text-zinc-400 mt-1 font-mono">Interview callback chance</p>
                    </div>

                    <div className="glass p-5 rounded-2xl border border-gray-200/50 dark:border-zinc-800 text-left">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500">
                        Recruiter Confidence
                      </span>
                      <div className="text-3xl font-black font-display text-purple-500 mt-1">
                        {report.recruiterConfidence ?? Math.floor(report.atsScore * 0.5)}%
                      </div>
                      <p className="text-[10px] text-gray-500 dark:text-zinc-400 mt-1 font-mono">Evidence completeness</p>
                    </div>
                  </div>

                  {/* Verdict & General Judgment Banner */}
                  <div className="p-6 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-gray-50/80 dark:bg-zinc-900/40 text-left space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold tracking-wider uppercase ${verdict.color}`}>
                        <VerdictIcon className="w-4 h-4 animate-pulse" />
                        <span>Verdict: {verdict.label}</span>
                      </div>
                    </div>
                    <p className="text-base font-semibold text-gray-800 dark:text-zinc-200 leading-relaxed italic border-l-4 border-red-500 pl-4 py-1">
                      "{report.judgment}"
                    </p>
                  </div>

                  {/* STEP 9: Evidence-Backed Top Roasted Flaws */}
                  <div className="space-y-4 text-left">
                    <div className="flex items-center gap-2">
                      <Flame className="w-5 h-5 text-rose-500 animate-bounce" />
                      <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                        Evidence-Backed Resume Flaws & Criticisms:
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {report.bulletPoints.map((bullet, idx) => (
                        <div 
                          key={idx}
                          className="p-4 rounded-2xl border border-gray-200/80 dark:border-zinc-800/80 bg-gray-50/50 dark:bg-zinc-900/20 text-left relative flex flex-col justify-between"
                        >
                          <span className="text-[10px] font-mono font-bold text-rose-500 uppercase mb-2">
                            Evidence Defect #{idx + 1}
                          </span>
                          <p className="text-xs text-gray-700 dark:text-zinc-300 font-sans leading-relaxed">
                            {bullet}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Genuine Praise Points (if any) */}
                  {report.praisePoints && report.praisePoints.length > 0 && (
                    <div className="p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 text-left space-y-2">
                      <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Acknowledged Positives & Standout Proof:</span>
                      </div>
                      <ul className="list-disc list-inside text-xs text-emerald-700 dark:text-emerald-300 font-sans space-y-1">
                        {report.praisePoints.map((praise, pIdx) => (
                          <li key={pIdx}>{praise}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Grammar Slam & Buzzword Counter */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                    <div className="p-4 rounded-2xl border border-gray-200 dark:border-zinc-850 bg-gray-50/50 dark:bg-zinc-900/20">
                      <h5 className="text-[11px] font-mono font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-2">
                        Grammar & Action-Verb Slam:
                      </h5>
                      <p className="text-xs text-gray-700 dark:text-zinc-300 italic font-sans">
                        "{report.grammarSlam}"
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl border border-gray-200 dark:border-zinc-850 bg-gray-50/50 dark:bg-zinc-900/20">
                      <h5 className="text-[11px] font-mono font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-2">
                        Overused Buzzword Count:
                      </h5>
                      {report.buzzwordCounter && report.buzzwordCounter.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {report.buzzwordCounter.map((bw) => (
                            <span 
                              key={bw.word}
                              className="inline-flex items-center gap-1.5 text-xs font-mono bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 px-2.5 py-1 rounded-xl text-gray-700 dark:text-zinc-300"
                            >
                              <span className="text-rose-500 font-bold">{bw.word}</span>
                              <span className="bg-rose-500/10 text-rose-500 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                {bw.count}x
                              </span>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400">No egregious buzzwords detected.</p>
                      )}
                    </div>
                  </div>

                  {/* STAGE 8: RECRUITER PERSONAS SECTION */}
                  {report.personaRoasts && (
                    <div className="space-y-4 text-left border-t border-gray-200/60 dark:border-zinc-800/60 pt-8">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <h4 className="text-base font-bold font-display text-gray-900 dark:text-white flex items-center gap-2">
                            <Bot className="w-5 h-5 text-blue-500" />
                            <span>Simulated Recruiter Personas (Same Evidence, Different Persona Tone)</span>
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-zinc-400">
                            Select a persona to see how different recruiters judge this exact resume:
                          </p>
                        </div>
                      </div>

                      {/* Persona Tabs Bar */}
                      <div className="flex flex-wrap gap-2 pt-2">
                        {(Object.keys(PERSONA_CONFIG) as PersonaId[]).map((pId) => {
                          const config = PERSONA_CONFIG[pId];
                          const isActive = activePersonaId === pId;

                          return (
                            <button
                              key={pId}
                              onClick={() => togglePersona(report.fileId, pId)}
                              className={`px-3.5 py-2 rounded-2xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 border ${
                                isActive 
                                  ? `${config.color} shadow-md scale-105` 
                                  : 'border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/40 text-gray-600 dark:text-zinc-400 hover:border-gray-300 dark:hover:border-zinc-700'
                              }`}
                            >
                              <span>{config.emoji}</span>
                              <span>{config.name}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Active Persona Box */}
                      {activePersonaRoast && (
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={activePersonaId}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="p-6 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-gray-50/80 dark:bg-zinc-900/60 space-y-4"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-2xl">{PERSONA_CONFIG[activePersonaId].emoji}</span>
                                <div>
                                  <h5 className="text-sm font-bold text-gray-900 dark:text-white">
                                    {PERSONA_CONFIG[activePersonaId].name}
                                  </h5>
                                  <span className="text-[10px] font-mono text-gray-400 uppercase">
                                    {activePersonaRoast.badge || "PERSONA REVIEW"}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <p className="text-sm italic font-medium text-gray-800 dark:text-zinc-200 border-l-2 border-blue-500 pl-3">
                              "{activePersonaRoast.roastSummary}"
                            </p>

                            <div className="space-y-2 pt-1">
                              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                                Specific Feedback:
                              </span>
                              <ul className="space-y-1.5 text-xs text-gray-700 dark:text-zinc-300">
                                {activePersonaRoast.roastBulletPoints?.map((bp, bpIdx) => (
                                  <li key={bpIdx} className="flex items-start gap-2">
                                    <ChevronRight className="w-3.5 h-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
                                    <span>{bp}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {activePersonaRoast.keyAdvice && (
                              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-600 dark:text-blue-300 font-mono">
                                <span className="font-bold uppercase">Key Advice:</span> {activePersonaRoast.keyAdvice}
                              </div>
                            )}
                          </motion.div>
                        </AnimatePresence>
                      )}
                    </div>
                  )}

                  {/* 16-Dimension / 8-Category Evaluation Cards */}
                  {report.dimensionScores && report.dimensionScores.length > 0 && (
                    <div className="space-y-4 text-left border-t border-gray-200/60 dark:border-zinc-800/60 pt-8">
                      <div className="flex items-center gap-2">
                        <FileSearch className="w-5 h-5 text-indigo-500" />
                        <h4 className="text-base font-bold font-display text-gray-900 dark:text-white">
                          Evaluation Breakdown Across Key Dimensions
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {report.dimensionScores.map((dim, dIdx) => (
                          <div 
                            key={dIdx}
                            className="p-4 rounded-2xl border border-gray-200 dark:border-zinc-850 bg-gray-50/40 dark:bg-zinc-900/20 space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-mono font-bold text-gray-800 dark:text-zinc-200 uppercase">
                                {dim.category}
                              </span>
                              <span className={`text-xs font-mono font-extrabold ${
                                dim.score >= 70 ? 'text-emerald-500' : dim.score >= 40 ? 'text-amber-500' : 'text-rose-500'
                              }`}>
                                {dim.score}/100
                              </span>
                            </div>

                            <div className="w-full bg-gray-200 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${
                                  dim.score >= 70 ? 'bg-emerald-500' : dim.score >= 40 ? 'bg-amber-500' : 'bg-rose-500'
                                }`}
                                style={{ width: `${dim.score}%` }}
                              />
                            </div>

                            <p className="text-xs text-gray-600 dark:text-zinc-400 font-sans">
                              {dim.feedback}
                            </p>
                            {dim.evidence && (
                              <p className="text-[10px] font-mono text-gray-400 italic">
                                Evidence: "{dim.evidence}"
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* STAGE 6: Internal Evidence Audit Table Toggle */}
                  {report.evidenceTable && report.evidenceTable.length > 0 && (
                    <div className="border-t border-gray-200/60 dark:border-zinc-800/60 pt-6 text-left">
                      <button
                        onClick={() => toggleEvidence(report.fileId)}
                        className="w-full flex items-center justify-between p-4 rounded-2xl bg-gray-100/60 dark:bg-zinc-900/40 hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <ShieldAlert className="w-4 h-4 text-amber-500" />
                          <span className="text-xs font-mono font-bold uppercase tracking-wider text-gray-800 dark:text-zinc-200">
                            Evidence Database ({report.evidenceTable.length} Audit Items)
                          </span>
                        </div>
                        {isEvidenceExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>

                      <AnimatePresence>
                        {isEvidenceExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 overflow-x-auto rounded-2xl border border-gray-200 dark:border-zinc-800"
                          >
                            <table className="w-full text-left text-xs font-sans">
                              <thead className="bg-gray-100 dark:bg-zinc-900 text-gray-500 dark:text-zinc-400 font-mono text-[10px] uppercase">
                                <tr>
                                  <th className="p-3">Finding</th>
                                  <th className="p-3">Exact Resume Evidence</th>
                                  <th className="p-3">Severity</th>
                                  <th className="p-3">Recruiter Suggestion</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                                {report.evidenceTable.map((item, itemIdx) => (
                                  <tr key={itemIdx} className="hover:bg-gray-50/50 dark:hover:bg-zinc-900/30">
                                    <td className="p-3 font-semibold text-gray-900 dark:text-white">{item.finding}</td>
                                    <td className="p-3 font-mono text-gray-500 dark:text-zinc-400 italic">"{item.evidence}"</td>
                                    <td className="p-3">
                                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                        item.severity === 'Critical' ? 'bg-red-500/20 text-red-500' :
                                        item.severity === 'High' ? 'bg-orange-500/20 text-orange-500' : 'bg-blue-500/20 text-blue-500'
                                      }`}>
                                        {item.severity}
                                      </span>
                                    </td>
                                    <td className="p-3 text-gray-600 dark:text-zinc-300">{item.suggestion}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* STAGE 11 & STAGE 12: "Would you like Recruiter.exe to improve this resume?" Interactive Section */}
                  <div className="mt-8 p-6 rounded-3xl bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-transparent border border-blue-500/20 text-left space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-blue-500 text-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/30">
                          <Zap className="w-5 h-5 animate-pulse" />
                        </div>
                        <div>
                          <h4 className="text-base font-bold text-gray-900 dark:text-white">
                            Would you like Recruiter.exe to improve this resume?
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-zinc-400">
                            Rebuild bullet points, optimize formatting, and boost ATS compatibility while preserving complete truthfulness.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => toggleFixes(report.fileId)}
                          className="px-4 py-2 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 font-bold text-xs hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{isFixesShown ? "Hide Audit Fixes" : "View Audit Fixes"}</span>
                        </button>

                        <button
                          onClick={() => handleImproveResume(report)}
                          disabled={isImproving}
                          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
                        >
                          {isImproving ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              <span>Rebuilding Resume...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 text-amber-300" />
                              <span>✨ Improve My Resume</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Expandable Quick Fixes list */}
                    <AnimatePresence>
                      {isFixesShown && report.improvementSuggestions && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="pt-4 border-t border-blue-500/20 space-y-4"
                        >
                          {report.improvementSuggestions.suggestedHeadline && (
                            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-blue-500/20 space-y-1">
                              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-500">
                                Recommended Professional Headline:
                              </span>
                              <p className="text-sm font-bold text-gray-900 dark:text-white font-display">
                                "{report.improvementSuggestions.suggestedHeadline}"
                              </p>
                            </div>
                          )}

                          {report.improvementSuggestions.actionableFixes && (
                            <div className="space-y-3">
                              <span className="text-xs font-mono font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300">
                                Bullet Point Fixes & Rewrites:
                              </span>
                              <div className="grid grid-cols-1 gap-3">
                                {report.improvementSuggestions.actionableFixes.map((fix, fIdx) => (
                                  <div key={fIdx} className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 space-y-2 text-xs">
                                    <div className="flex items-center justify-between">
                                      <span className="font-mono font-bold text-blue-500 uppercase">{fix.section} Section</span>
                                      <span className="text-[10px] font-mono text-gray-400">{fix.reason}</span>
                                    </div>
                                    <div className="space-y-1.5 font-sans">
                                      <p className="text-rose-500/90 dark:text-rose-400 line-through">
                                        <span className="font-bold text-[10px] uppercase font-mono mr-1">Before:</span> {fix.currentText}
                                      </p>
                                      <p className="text-emerald-600 dark:text-emerald-400 font-semibold">
                                        <span className="font-bold text-[10px] uppercase font-mono mr-1">Recruiter Improved:</span> {fix.improvedText}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* STAGE 12: AI IMPROVED RESUME DISPLAY & DOWNLOAD OPTIONS */}
                    {improvedData && comparisonData && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="pt-6 border-t border-blue-500/20 space-y-6"
                      >
                        {/* Improvement Comparison Metrics Card */}
                        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-blue-500/30 space-y-4">
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 dark:border-zinc-800 pb-3">
                            <div className="flex items-center gap-2">
                              <FileCheck className="w-5 h-5 text-emerald-500" />
                              <h5 className="text-sm font-bold text-gray-900 dark:text-white font-display">
                                Resume Improvement Impact Report
                              </h5>
                            </div>
                            <span className="text-xs font-mono font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                              ✓ Rebuilt Truthfully
                            </span>
                          </div>

                          {/* Scores Comparison Grid */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div className="p-3 rounded-xl bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800">
                              <span className="text-[10px] font-mono text-gray-400 uppercase">Resume Score</span>
                              <div className="flex items-center gap-1.5 mt-1">
                                <span className="text-sm font-mono line-through text-gray-400">{comparisonData.resumeScoreBefore}</span>
                                <ArrowRight className="w-3.5 h-3.5 text-emerald-500" />
                                <span className="text-lg font-black font-display text-emerald-500">{comparisonData.resumeScoreAfter}/10</span>
                              </div>
                            </div>

                            <div className="p-3 rounded-xl bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800">
                              <span className="text-[10px] font-mono text-gray-400 uppercase">ATS Compatibility</span>
                              <div className="flex items-center gap-1.5 mt-1">
                                <span className="text-sm font-mono line-through text-gray-400">{comparisonData.atsScoreBefore}%</span>
                                <ArrowRight className="w-3.5 h-3.5 text-emerald-500" />
                                <span className="text-lg font-black font-display text-blue-500">{comparisonData.atsScoreAfter}%</span>
                              </div>
                            </div>

                            <div className="p-3 rounded-xl bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800">
                              <span className="text-[10px] font-mono text-gray-400 uppercase">Hiring Chance</span>
                              <div className="flex items-center gap-1.5 mt-1">
                                <span className="text-sm font-mono line-through text-gray-400">{comparisonData.hiringProbabilityBefore}%</span>
                                <ArrowRight className="w-3.5 h-3.5 text-emerald-500" />
                                <span className="text-lg font-black font-display text-amber-500">{comparisonData.hiringProbabilityAfter}%</span>
                              </div>
                            </div>

                            <div className="p-3 rounded-xl bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800">
                              <span className="text-[10px] font-mono text-gray-400 uppercase">Bullets Rewritten</span>
                              <div className="text-lg font-black font-display text-purple-500 mt-1">
                                {comparisonData.bulletPointsRewrittenCount} bullets
                              </div>
                            </div>
                          </div>

                          {/* Highlighted Enhancements List */}
                          {comparisonData.highlightedChanges && (
                            <div className="pt-2">
                              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-700 dark:text-zinc-300">
                                {comparisonData.highlightedChanges.map((change, cIdx) => (
                                  <li key={cIdx} className="flex items-center gap-2">
                                    <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                                    <span>{change}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        {/* Controls Bar: Download & Compare Options */}
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          {/* View Mode Toggle */}
                          <div className="flex items-center gap-1 p-1 rounded-2xl bg-gray-200/60 dark:bg-zinc-900 border border-gray-300 dark:border-zinc-800">
                            <button
                              onClick={() => setViewModeMap((prev) => ({ ...prev, [report.fileId]: 'preview' }))}
                              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                currentViewMode === 'preview'
                                  ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm'
                                  : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'
                              }`}
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Preview Resume</span>
                            </button>

                            <button
                              onClick={() => setViewModeMap((prev) => ({ ...prev, [report.fileId]: 'compare' }))}
                              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                currentViewMode === 'compare'
                                  ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm'
                                  : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'
                              }`}
                            >
                              <Columns className="w-3.5 h-3.5" />
                              <span>🔄 Compare Original vs Improved</span>
                            </button>
                          </div>

                          {/* Action Buttons: PDF, DOCX, Copy Text */}
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              onClick={() => handleDownloadPDF(improvedData)}
                              className="px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>📄 Download PDF</span>
                            </button>

                            <button
                              onClick={() => handleDownloadDOCX(improvedData)}
                              className="px-4 py-2 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>📝 Download DOCX</span>
                            </button>

                            <button
                              onClick={() => handleCopyText(report.fileId, improvedData)}
                              className="px-4 py-2 rounded-2xl border border-gray-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-800 dark:text-zinc-200 font-bold text-xs hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all cursor-pointer flex items-center gap-1.5"
                            >
                              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{isCopied ? "Copied!" : "📋 Copy Text"}</span>
                            </button>
                          </div>
                        </div>

                        {/* Interactive Resume View Box */}
                        {currentViewMode === 'preview' ? (
                          <div className="p-8 rounded-3xl bg-white text-slate-900 shadow-2xl border border-gray-200 text-left space-y-6 font-sans">
                            {/* Resume Header */}
                            <div className="border-b border-slate-200 pb-5 space-y-2">
                              <h1 className="text-2xl font-black tracking-tight text-slate-900 font-display">
                                {improvedData.header.name}
                              </h1>
                              <p className="text-sm font-bold text-blue-600 font-mono">
                                {improvedData.header.title}
                              </p>
                              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-mono">
                                {improvedData.header.email && <span>{improvedData.header.email}</span>}
                                {improvedData.header.phone && <span>• {improvedData.header.phone}</span>}
                                {improvedData.header.location && <span>• {improvedData.header.location}</span>}
                                {improvedData.header.linkedin && <span>• {improvedData.header.linkedin}</span>}
                                {improvedData.header.github && <span>• {improvedData.header.github}</span>}
                                {improvedData.header.portfolio && <span>• {improvedData.header.portfolio}</span>}
                              </div>
                            </div>

                            {/* Professional Summary */}
                            {improvedData.professionalSummary && (
                              <div className="space-y-1.5">
                                <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                                  Professional Summary
                                </h3>
                                <p className="text-xs text-slate-700 leading-relaxed font-sans">
                                  {improvedData.professionalSummary}
                                </p>
                              </div>
                            )}

                            {/* Skills */}
                            {improvedData.skills && improvedData.skills.length > 0 && (
                              <div className="space-y-2">
                                <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                                  Technical & Professional Skills
                                </h3>
                                <div className="space-y-1.5">
                                  {improvedData.skills.map((sGroup, sgIdx) => (
                                    <div key={sgIdx} className="text-xs">
                                      <span className="font-bold text-slate-900 font-mono">{sGroup.category}: </span>
                                      <span className="text-slate-700">{sGroup.items.join(', ')}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Work Experience */}
                            {improvedData.experience && improvedData.experience.length > 0 && (
                              <div className="space-y-3">
                                <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                                  Work Experience
                                </h3>
                                {improvedData.experience.map((exp, eIdx) => (
                                  <div key={eIdx} className="space-y-1">
                                    <div className="flex items-center justify-between text-xs">
                                      <span className="font-bold text-slate-900">{exp.role} — <span className="font-normal text-slate-600">{exp.company}</span></span>
                                      <span className="font-mono text-[11px] text-slate-500">{exp.dates}</span>
                                    </div>
                                    <ul className="list-disc list-inside space-y-1 text-xs text-slate-700">
                                      {exp.bulletPoints.map((b, bIdx) => (
                                        <li key={bIdx}>{b}</li>
                                      ))}
                                    </ul>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Projects */}
                            {improvedData.projects && improvedData.projects.length > 0 && (
                              <div className="space-y-3">
                                <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                                  Key Projects
                                </h3>
                                {improvedData.projects.map((proj, pIdx) => (
                                  <div key={pIdx} className="space-y-1">
                                    <div className="flex items-center justify-between text-xs">
                                      <span className="font-bold text-slate-900">{proj.title}</span>
                                      {proj.techStack && (
                                        <span className="font-mono text-[10px] text-blue-600">[{proj.techStack.join(', ')}]</span>
                                      )}
                                    </div>
                                    <ul className="list-disc list-inside space-y-1 text-xs text-slate-700">
                                      {proj.descriptionBullets.map((b, bIdx) => (
                                        <li key={bIdx}>{b}</li>
                                      ))}
                                    </ul>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Education */}
                            {improvedData.education && improvedData.education.length > 0 && (
                              <div className="space-y-2">
                                <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                                  Education
                                </h3>
                                {improvedData.education.map((edu, edIdx) => (
                                  <div key={edIdx} className="flex items-center justify-between text-xs">
                                    <span className="font-bold text-slate-900">{edu.degree}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''} — <span className="font-normal text-slate-600">{edu.institution}</span></span>
                                    <span className="font-mono text-[11px] text-slate-500">{edu.dates}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          /* Side-by-side comparison view */
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                            {/* Original Resume Audit Summary */}
                            <div className="p-5 rounded-2xl bg-rose-500/5 border border-rose-500/20 space-y-3">
                              <div className="flex items-center gap-2 border-b border-rose-500/20 pb-2">
                                <AlertTriangle className="w-4 h-4 text-rose-500" />
                                <span className="text-xs font-mono font-bold uppercase text-rose-500">
                                  Original Resume Issues
                                </span>
                              </div>
                              <ul className="space-y-2 text-xs text-gray-700 dark:text-zinc-300">
                                {report.bulletPoints.map((bp, bpIdx) => (
                                  <li key={bpIdx} className="flex items-start gap-2">
                                    <span className="text-rose-500 font-bold">✕</span>
                                    <span>{bp}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Recruiter Improved Summary */}
                            <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-3">
                              <div className="flex items-center gap-2 border-b border-emerald-500/20 pb-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                <span className="text-xs font-mono font-bold uppercase text-emerald-500">
                                  Recruiter.exe Improvements
                                </span>
                              </div>
                              <ul className="space-y-2 text-xs text-gray-700 dark:text-zinc-300">
                                {comparisonData.highlightedChanges.map((change, cIdx) => (
                                  <li key={cIdx} className="flex items-start gap-2">
                                    <span className="text-emerald-500 font-bold">✓</span>
                                    <span>{change}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
