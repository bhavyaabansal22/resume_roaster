import React from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, ShieldCheck, ArrowRight, Edit3, Lock, CheckCircle2, RotateCcw
} from 'lucide-react';
import { AppTab } from '../../types';

interface DownloadPageProps {
  improvedData?: any;
  onNewAnalysis: () => void;
  onNavigate: (tab: AppTab) => void;
  triggerToast: (type: 'success' | 'error' | 'warning' | 'info', message: string) => void;
}

export default function DownloadPage({
  onNewAnalysis,
  onNavigate,
  triggerToast
}: DownloadPageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="w-full max-w-4xl mx-auto space-y-8 text-left py-8"
    >
      {/* Workspace Banner */}
      <div className="rounded-3xl border border-blue-500/30 bg-gradient-to-b from-blue-950/20 via-zinc-950 to-zinc-950 p-8 md:p-12 text-center space-y-6 shadow-2xl relative overflow-hidden">
        
        <div className="w-16 h-16 rounded-3xl bg-blue-500/20 border border-blue-500/40 text-blue-400 flex items-center justify-center mx-auto shadow-lg">
          <Sparkles className="w-8 h-8 animate-pulse" />
        </div>

        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/20 bg-blue-500/10 text-blue-400 text-xs font-mono font-bold uppercase tracking-wider">
            <Lock className="w-3.5 h-3.5" />
            <span>Factual Integrity Protection Mode</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black font-display text-white">
            AI Improvement Workspace
          </h2>
          <p className="text-sm text-zinc-400 font-sans max-w-xl mx-auto leading-relaxed">
            To prevent detail loss or accidental hallucination, automated file exports have been paused. Use the <strong>Interactive AI Workspace</strong> to refine, edit, and audit your resume directly inside Rejectify.
          </p>
        </div>

        {/* Informational Guidance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left pt-2">
          
          <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-mono font-bold text-xs uppercase">
              <ShieldCheck className="w-4 h-4" />
              <span>Immutable Baseline Memory</span>
            </div>
            <p className="text-xs text-zinc-300 font-sans leading-relaxed">
              Every detail from your uploaded PDF is strictly preserved in a factual memory snapshot. Your original dates, companies, and education cannot be lost or altered.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2">
            <div className="flex items-center gap-2 text-blue-400 font-mono font-bold text-xs uppercase">
              <Edit3 className="w-4 h-4" />
              <span>Interactive Section Assistant</span>
            </div>
            <p className="text-xs text-zinc-300 font-sans leading-relaxed">
              Edit summary, projects, skills, and experience with section-level AI assistants. Track real-time ATS score increases without losing recruiter trust.
            </p>
          </div>

        </div>

        {/* CTA Button */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => onNavigate('improve')}
            className="btn-primary px-8 py-4 rounded-2xl font-mono text-xs font-bold text-white cursor-pointer flex items-center gap-2 shadow-2xl"
          >
            <Sparkles className="w-4 h-4" />
            <span>OPEN AI IMPROVEMENT WORKSPACE →</span>
          </button>

          <button
            onClick={onNewAnalysis}
            className="px-6 py-4 rounded-2xl font-mono text-xs font-bold bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 cursor-pointer flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>UPLOAD ANOTHER RESUME</span>
          </button>
        </div>

      </div>
    </motion.div>
  );
}
