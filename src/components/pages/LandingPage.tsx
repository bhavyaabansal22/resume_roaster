import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Flame, AlertCircle, Trash2, ArrowRight, Bot, ShieldCheck, Zap } from 'lucide-react';
import { UploadedFile } from '../../types';
import DropZone from '../DropZone';
import FileCard from '../FileCard';

interface LandingPageProps {
  files: UploadedFile[];
  onFilesSelected: (files: File[], isBlank?: boolean, isCorrupted?: boolean) => void;
  onRemoveFile: (id: string) => void;
  onClearAll: () => void;
  onStartAnalysis: () => void;
  noUploadTriggered: boolean;
  triggerToast: (type: 'success' | 'error' | 'warning' | 'info', message: string) => void;
}

export default function LandingPage({
  files,
  onFilesSelected,
  onRemoveFile,
  onClearAll,
  onStartAnalysis,
  noUploadTriggered,
  triggerToast
}: LandingPageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center py-8 text-left"
    >
      {/* Left Column: Hero Text & Value Proposition */}
      <div className="lg:col-span-5 space-y-6">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-mono font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>AI Recruiter & Resume Optimizer</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-black font-display leading-[1.1] tracking-tight text-gray-900 dark:text-white">
            Get roasted <br />
            <span className="text-gray-400 dark:text-zinc-500">before they</span> <br />
            reject you.
          </h2>

          <p className="text-base text-gray-600 dark:text-zinc-400 leading-relaxed font-sans font-medium">
            Upload your resume to run Recruiter.exe—a multi-agent AI pipeline that evaluates, roasts, and automatically rebuilds your resume for top recruiters and ATS parsers.
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="glass p-4 rounded-2xl border border-gray-200/60 dark:border-zinc-800/60 hover:border-blue-500/30 transition-all">
            <div className="text-2xl font-black font-display text-gray-900 dark:text-white">7 Personas</div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-gray-400 dark:text-zinc-500 mt-0.5">
              Simulated Recruiters
            </div>
          </div>

          <div className="glass p-4 rounded-2xl border border-gray-200/60 dark:border-zinc-800/60 hover:border-blue-500/30 transition-all">
            <div className="text-2xl font-black font-display text-blue-500">100% Truth</div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-gray-400 dark:text-zinc-500 mt-0.5">
              No Fake Content
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-gray-500 dark:text-zinc-400 pt-2">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" /> Private & Secure
          </span>
          <span className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-500" /> Instant PDF Parsing
          </span>
        </div>
      </div>

      {/* Right Column: Upload Box & Attached Files */}
      <div className="lg:col-span-7 w-full">
        <div className="glass rounded-3xl p-6 md:p-8 space-y-6 glow border border-gray-200/80 dark:border-zinc-800/80 shadow-2xl">
          
          <div className="flex items-center justify-between border-b border-gray-200/60 dark:border-zinc-800/60 pb-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400 flex items-center gap-2">
              <Bot className="w-4 h-4 text-blue-500" />
              Upload Resume (PDF Format)
            </span>
            <span className="text-[10px] font-mono text-gray-400">Step 1 of 4</span>
          </div>

          {/* Upload DropZone container */}
          <DropZone onFilesSelected={onFilesSelected} triggerToast={triggerToast} />

          {/* Empty Queue Alert */}
          <AnimatePresence>
            {noUploadTriggered && files.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center gap-3 text-left"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <div>
                  <p className="font-mono text-[10px] font-bold uppercase tracking-wider">Empty Queue Alert</p>
                  <p className="text-sm font-semibold mt-0.5">
                    Nice try 😄 Upload a resume first.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Upload queue list */}
          {files.length > 0 && (
            <div className="space-y-4 text-left pt-2">
              <div className="flex items-center justify-between border-b border-gray-200/50 dark:border-zinc-800/60 pb-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                  Attached Resumes ({files.length})
                </span>
                <button
                  onClick={onClearAll}
                  className="text-xs font-semibold text-rose-500 hover:text-rose-600 hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear Queue</span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3 max-h-52 overflow-y-auto pr-1">
                {files.map((file) => (
                  <FileCard key={file.id} file={file} onRemove={onRemoveFile} />
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  id="start-analysis-btn"
                  onClick={onStartAnalysis}
                  className="btn-primary flex-1 py-4 rounded-2xl font-bold text-lg shadow-xl text-white cursor-pointer flex items-center justify-center gap-2 group"
                >
                  <Flame className="w-5 h-5 text-orange-400 animate-bounce" />
                  <span>START ANALYSIS</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </motion.div>
  );
}
