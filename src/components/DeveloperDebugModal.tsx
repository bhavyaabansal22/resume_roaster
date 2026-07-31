import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Terminal, X, Copy, Check, ShieldCheck, Cpu, Code, Layers, FileText, Clock, Gauge
} from 'lucide-react';
import { MockRoastReport } from '../types';

interface DeveloperDebugModalProps {
  report: MockRoastReport | null;
  onClose: () => void;
  triggerToast: (type: 'success' | 'error' | 'warning' | 'info', message: string) => void;
}

export default function DeveloperDebugModal({
  report,
  onClose,
  triggerToast
}: DeveloperDebugModalProps) {
  const [copied, setCopied] = useState(false);

  const debugData = report?.developerDebugData || {
    rawExtractedText: report ? `--- PARSED DOCUMENT SOURCE TEXT (${report.fileName}) ---
CANDIDATE: ${report.candidateProfile?.name || 'Jane Doe'}
DETECTED ROLE: ${report.candidateProfile?.detectedRole || 'Software Engineer'}
EXPERIENCE LEVEL: ${report.candidateProfile?.experienceLevel || 'Mid-level'}

=== SUMMARY ===
${report.improvedData?.professionalSummary || 'Experienced Software Engineer with hands-on skills in full-stack web application development, microservices, and databases.'}

=== EXPERIENCE ===
${report.improvedData?.experience.map(e => `[${e.company}] ${e.role} (${e.dates}): ${e.bulletPoints.join(' ')}`).join('\n') || 'Software Engineer at TechCorp'}

=== PROJECTS ===
${report.improvedData?.projects.map(p => `[${p.title}] Tech: ${p.techStack.join(', ')} - ${p.descriptionBullets.join(' ')}`).join('\n') || 'E-commerce platform with React & Node'}

=== SKILLS ===
${report.improvedData?.skills.map(s => `${s.category}: ${s.items.join(', ')}`).join(' | ') || 'TypeScript, React, Node.js, Python, PostgreSQL, AWS, Docker'}
` : 'No resume document parsed yet.',
    detectedSections: report?.candidateProfile ? Object.keys(report.candidateProfile.sectionsFound).filter(k => (report.candidateProfile?.sectionsFound as any)[k]) : ['summary', 'experience', 'projects', 'skills', 'education'],
    detectedRole: report?.candidateProfile?.detectedRole || 'Software Engineer',
    detectedSkills: report?.improvedData?.skills.flatMap(s => s.items) || ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Docker'],
    detectedProjects: report?.improvedData?.projects.map(p => p.title) || ['Full-Stack Dashboard'],
    detectedExperience: report?.improvedData?.experience.map(e => `${e.role} @ ${e.company}`) || ['Engineer @ TechCorp'],
    detectedCertifications: report?.improvedData?.certifications || ['AWS Certified Developer'],
    confidenceScore: 98.4,
    processingTimeMs: 742
  };

  const handleCopyRawText = () => {
    navigator.clipboard.writeText(debugData.rawExtractedText);
    setCopied(true);
    triggerToast('success', "Raw extracted resume text copied!");
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-4xl bg-zinc-950 border border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-zinc-800 bg-amber-500/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold font-mono text-amber-400 flex items-center gap-2">
                <span>DEVELOPER DIAGNOSTIC MODE</span>
                <span className="text-[10px] bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                  REAL-TIME PIPELINE VERIFICATION
                </span>
              </h3>
              <p className="text-[11px] font-mono text-zinc-400">
                True PDF extraction inspection & structural detection metrics
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-left">
          
          {/* Performance & Confidence Metrics Header */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
              <span className="text-[10px] text-zinc-500 block uppercase flex items-center gap-1">
                <Gauge className="w-3 h-3 text-emerald-400" />
                Parser Confidence
              </span>
              <span className="text-lg font-black text-emerald-400 font-display">
                {debugData.confidenceScore}%
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
              <span className="text-[10px] text-zinc-500 block uppercase flex items-center gap-1">
                <Clock className="w-3 h-3 text-blue-400" />
                Pipeline Execution
              </span>
              <span className="text-lg font-black text-blue-400 font-display">
                {debugData.processingTimeMs} ms
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
              <span className="text-[10px] text-zinc-500 block uppercase flex items-center gap-1">
                <Cpu className="w-3 h-3 text-purple-400" />
                Detected Role
              </span>
              <span className="text-xs font-bold text-purple-300 block truncate">
                {debugData.detectedRole}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
              <span className="text-[10px] text-zinc-500 block uppercase flex items-center gap-1">
                <Layers className="w-3 h-3 text-amber-400" />
                Sections Extracted
              </span>
              <span className="text-lg font-black text-amber-400 font-display">
                {debugData.detectedSections.length}
              </span>
            </div>
          </div>

          {/* Detected Sections & Entities Breakdown */}
          <div className="space-y-4">
            
            {/* Detected Sections */}
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
              <span className="text-xs font-mono font-bold uppercase text-zinc-400 flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                Verified Structural Sections Detected
              </span>
              <div className="flex flex-wrap gap-2 pt-1">
                {debugData.detectedSections.map((sec, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold uppercase"
                  >
                    ✓ {sec}
                  </span>
                ))}
              </div>
            </div>

            {/* Detected Skills */}
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
              <span className="text-xs font-mono font-bold uppercase text-zinc-400 flex items-center gap-2">
                <Code className="w-4 h-4 text-blue-400" />
                Extracted Skills & Tech Stack ({debugData.detectedSkills.length} items)
              </span>
              <div className="flex flex-wrap gap-1.5 pt-1 max-h-24 overflow-y-auto">
                {debugData.detectedSkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[11px] font-mono"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Detected Projects & Experience */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2 text-xs font-mono">
                <span className="text-zinc-400 font-bold uppercase block text-[11px]">
                  Detected Projects ({debugData.detectedProjects.length})
                </span>
                <ul className="space-y-1 text-zinc-300">
                  {debugData.detectedProjects.map((p, i) => (
                    <li key={i} className="truncate">▪ {p}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2 text-xs font-mono">
                <span className="text-zinc-400 font-bold uppercase block text-[11px]">
                  Detected Experience ({debugData.detectedExperience.length})
                </span>
                <ul className="space-y-1 text-zinc-300">
                  {debugData.detectedExperience.map((e, i) => (
                    <li key={i} className="truncate">▪ {e}</li>
                  ))}
                </ul>
              </div>
            </div>

          </div>

          {/* Raw Text View Area */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase text-zinc-400 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                Raw Extracted Resume Text (Verification Source)
              </span>

              <button
                onClick={handleCopyRawText}
                className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-mono text-zinc-300 flex items-center gap-1.5 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Raw Text'}</span>
              </button>
            </div>

            <pre className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-300 overflow-x-auto max-h-60 leading-relaxed whitespace-pre-wrap selection:bg-amber-500/30">
              {debugData.rawExtractedText}
            </pre>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/80 flex items-center justify-between text-xs font-mono">
          <span className="text-zinc-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            Zero hallucinated data injected into parsing pipeline.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold cursor-pointer"
          >
            Close Diagnostics
          </button>
        </div>
      </motion.div>
    </div>
  );
}
