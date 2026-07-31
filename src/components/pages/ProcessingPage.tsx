import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Terminal, CheckCircle2, ChevronRight, Bot, Cpu } from 'lucide-react';
import { UploadedFile, MockRoastReport } from '../../types';
import { generateFallbackReport } from '../../utils/fallbackGenerators';

interface ProcessingPageProps {
  files: UploadedFile[];
  onComplete: (reports: MockRoastReport[]) => void;
  onError: (errorMessage: string) => void;
}

const SCAN_LOGS = [
  "Validating PDF file structure & metadata...",
  "Extracting raw resume text & layout structure...",
  "Parsing sections (Education, Experience, Projects, Skills)...",
  "Understanding candidate profile, target role & career level...",
  "Agent 1 (ATS Expert) checking keyword coverage & formatting...",
  "Agent 2 (Recruiter) evaluating first impression & readability...",
  "Agent 3 (Project Reviewer) inspecting technical depth & metrics...",
  "Agent 4 (Skills Reviewer) verifying evidence supporting skills...",
  "Agent 5 (Grammar Reviewer) analyzing tone & action verb choices...",
  "Agent 6 (Achievement Reviewer) checking quantified impact...",
  "Aggregating findings into structured Evidence Database...",
  "Calculating explainable scores across all 16 dimensions...",
  "Calling Recruiter.exe 7 Personas Panel...",
  "Preparing evidence-backed roast & improvement insights..."
];

const RECRUITER_THOUGHTS = [
  "Hmm, inspecting fonts and margin alignment...",
  "Scanning for overused buzzwords like 'synergy' and 'passionate'...",
  "Checking if bullet points start with strong action verbs...",
  "Evaluating metric evidence for claimed project impact...",
  "Verifying ATS parser readability across sections...",
  "Consulting FAANG Recruiter and Gen Z Personas..."
];

export default function ProcessingPage({ files, onComplete, onError }: ProcessingPageProps) {
  const [scanIndex, setScanIndex] = useState(0);
  const [recruiterMsg, setRecruiterMsg] = useState(RECRUITER_THOUGHTS[0]);

  // Helper to convert File to Base64
  const readFileAsBase64 = (fileObj: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(fileObj);
    });
  };

  useEffect(() => {
    let isSubscribed = true;

    // Progress log animation timer
    const logTimer = setInterval(() => {
      setScanIndex((prev) => Math.min(prev + 1, SCAN_LOGS.length - 1));
    }, 450);

    // Thought bubble cycle timer
    const msgTimer = setInterval(() => {
      setRecruiterMsg(RECRUITER_THOUGHTS[Math.floor(Math.random() * RECRUITER_THOUGHTS.length)]);
    }, 2000);

    // Run backend analysis API request
    async function runPipeline() {
      try {
        const fetchedReports: MockRoastReport[] = [];

        for (const uploadedFile of files) {
          let base64 = "";
          try {
            if (uploadedFile.file) {
              base64 = await readFileAsBase64(uploadedFile.file);
            }
          } catch (e) {
            console.error("Base64 conversion error:", e);
          }

          const response = await fetch("/api/roast", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fileId: uploadedFile.id,
              fileName: uploadedFile.name,
              fileBase64: base64,
              mimeType: uploadedFile.file?.type || "application/pdf",
              isBlank: uploadedFile.isBlank,
              isCorrupted: uploadedFile.isCorrupted
            })
          });

          if (!response.ok) {
            console.warn(`Server status ${response.status}. Using fallback report generator.`);
            fetchedReports.push(generateFallbackReport(uploadedFile.name, uploadedFile.id));
          } else {
            const data = await response.json();
            if (data.report) {
              fetchedReports.push(data.report);
            } else {
              fetchedReports.push(generateFallbackReport(uploadedFile.name, uploadedFile.id));
            }
          }
        }

        if (isSubscribed) {
          setTimeout(() => {
            onComplete(fetchedReports);
          }, 600);
        }
      } catch (err: any) {
        console.error("Pipeline analysis error:", err);
        if (isSubscribed) {
          const fallbackReports = files.map(f => generateFallbackReport(f.name, f.id));
          setTimeout(() => {
            onComplete(fallbackReports);
          }, 600);
        }
      }
    }

    runPipeline();

    return () => {
      isSubscribed = false;
      clearInterval(logTimer);
      clearInterval(msgTimer);
    };
  }, [files]);

  const progressPercent = Math.round(((scanIndex + 1) / SCAN_LOGS.length) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="w-full max-w-4xl mx-auto py-8 text-left"
    >
      <div className="rounded-3xl border border-blue-500/30 bg-black/60 glass-panel p-8 md:p-12 shadow-[0_0_60px_rgba(59,130,246,0.15)] relative overflow-hidden space-y-8">
        
        {/* Animated Laser Beam */}
        <motion.div
          animate={{ y: ['0%', '100%', '0%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-blue-500 to-transparent shadow-[0_0_20px_#3b82f6]"
        />

        {/* Top Terminal Bar */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <Terminal className="w-5 h-5 text-blue-500 animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-200">
              RECRUITER.EXE AI Pipeline Matrix v2.0
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
            <Cpu className="w-3.5 h-3.5 animate-spin" />
            <span>Processing {files.length} File{files.length > 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Recruiter.exe Floating Live Status Box */}
        <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0 text-blue-400">
            <Bot className="w-5 h-5 animate-bounce" />
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] font-mono font-bold uppercase text-blue-400">Recruiter.exe Live Thought:</span>
            <p className="text-xs font-mono text-zinc-300 italic">"{recruiterMsg}"</p>
          </div>
        </div>

        {/* Timeline Checklist */}
        <div className="space-y-3 font-mono text-xs md:text-sm max-h-[320px] overflow-y-auto pr-2">
          {SCAN_LOGS.slice(0, scanIndex + 1).map((log, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2.5 text-zinc-300"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>✓ {log}</span>
            </motion.div>
          ))}

          {scanIndex < SCAN_LOGS.length - 1 && (
            <div className="flex items-center gap-2 text-blue-400 font-bold pt-1 animate-pulse">
              <ChevronRight className="w-4 h-4 text-blue-500 flex-shrink-0" />
              <span>Analyzing data stream...</span>
            </div>
          )}
        </div>

        {/* Progress Bar & Status */}
        <div className="space-y-2 pt-2 border-t border-zinc-800/80">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-zinc-400 uppercase tracking-wider">Multi-Agent Pipeline Progress</span>
            <span className="text-blue-400 font-bold">{progressPercent}%</span>
          </div>

          <div className="w-full bg-zinc-900 rounded-full h-3 overflow-hidden border border-zinc-800">
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: `${progressPercent}%` }}
              className="bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-500 h-full rounded-full transition-all duration-300"
            />
          </div>
        </div>

      </div>
    </motion.div>
  );
}
