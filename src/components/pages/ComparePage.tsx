import React from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, CheckCircle2, ArrowRight, ShieldCheck, Zap, 
  TrendingUp, Download, Check, RefreshCw, Layers, PlusCircle, MinusCircle, Edit3
} from 'lucide-react';
import { MockRoastReport, ImprovedResumeData, ImprovementComparison, AppTab, ResumeMemory } from '../../types';
import { calculateGradualScores } from '../../utils/resumeMemoryEngine';

interface ComparePageProps {
  report: MockRoastReport;
  improvedData: ImprovedResumeData | null;
  comparison: ImprovementComparison | null;
  resumeMemory: ResumeMemory | null;
  onNavigate: (tab: AppTab) => void;
}

export default function ComparePage({
  report,
  improvedData,
  comparison,
  resumeMemory,
  onNavigate
}: ComparePageProps) {
  const currentSnapshot = resumeMemory ? resumeMemory.originalSnapshot : null;
  const currentActiveData = improvedData || (resumeMemory ? resumeMemory.versions[resumeMemory.activeVersionIndex].data : null);

  const baseScores = resumeMemory ? resumeMemory.originalScores : {
    resumeScore: report.resumeScore || 5.8,
    atsScore: report.atsScore || 62,
    hiringProbability: report.hiringProbability || 38
  };

  const currentScoring = (currentSnapshot && currentActiveData) 
    ? calculateGradualScores(currentSnapshot, currentActiveData, baseScores)
    : {
        resumeScore: comparison?.resumeScoreAfter || 8.8,
        atsScore: comparison?.atsScoreAfter || 88,
        hiringProbability: comparison?.hiringProbabilityAfter || 82,
        scoreExplanations: comparison?.highlightedChanges || ['Rewrote passive bullet points with high-impact action verbs.'],
        diffs: []
      };

  const activeVersionLabel = resumeMemory 
    ? resumeMemory.versions[resumeMemory.activeVersionIndex].versionLabel
    : 'Active Edited Version';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="w-full max-w-6xl mx-auto space-y-8 text-left py-4"
    >
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200/60 dark:border-zinc-800 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/20 bg-blue-500/10 text-blue-500 text-xs font-mono font-bold uppercase tracking-wider mb-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Before vs After Comparison Engine</span>
          </div>
          <h2 className="text-3xl font-black font-display text-gray-900 dark:text-white">
            Baseline vs {activeVersionLabel}
          </h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400 font-mono mt-1">
            Section-by-section diff tracking • Granular score delta calculations
          </p>
        </div>

        <button
          onClick={() => onNavigate('improve')}
          className="btn-primary px-6 py-3 rounded-2xl text-xs font-mono font-bold text-white cursor-pointer flex items-center gap-2 shadow-xl"
        >
          <Sparkles className="w-4 h-4 text-white" />
          <span>RETURN TO IMPROVEMENT WORKSPACE →</span>
        </button>
      </div>

      {/* Score Comparison Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Resume Quality Score */}
        <div className="glass p-6 rounded-3xl border border-gray-200/60 dark:border-zinc-800 space-y-3">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400">
            Overall Resume Score
          </span>
          <div className="flex items-center justify-between pt-1">
            <div className="text-center">
              <span className="text-xs font-mono text-gray-400 block">BASELINE</span>
              <span className="text-2xl font-black font-display text-gray-400">{baseScores.resumeScore}/10</span>
            </div>
            <ArrowRight className="w-5 h-5 text-emerald-500 animate-pulse" />
            <div className="text-center">
              <span className="text-xs font-mono text-emerald-400 font-bold block">ACTIVE VERSION</span>
              <span className="text-3xl font-black font-display text-emerald-400">{currentScoring.resumeScore}/10</span>
            </div>
          </div>
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono text-emerald-400 text-center font-bold">
            +{(currentScoring.resumeScore - baseScores.resumeScore).toFixed(1)} Quality Increase
          </div>
        </div>

        {/* Card 2: ATS Pass Score */}
        <div className="glass p-6 rounded-3xl border border-gray-200/60 dark:border-zinc-800 space-y-3">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400">
            ATS Keyword Coverage
          </span>
          <div className="flex items-center justify-between pt-1">
            <div className="text-center">
              <span className="text-xs font-mono text-gray-400 block">BASELINE</span>
              <span className="text-2xl font-black font-display text-gray-400">{baseScores.atsScore}%</span>
            </div>
            <ArrowRight className="w-5 h-5 text-blue-500 animate-pulse" />
            <div className="text-center">
              <span className="text-xs font-mono text-blue-400 font-bold block">ACTIVE VERSION</span>
              <span className="text-3xl font-black font-display text-blue-400">{currentScoring.atsScore}%</span>
            </div>
          </div>
          <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[10px] font-mono text-blue-400 text-center font-bold">
            +{currentScoring.atsScore - baseScores.atsScore}% Keyword Coverage Surge
          </div>
        </div>

        {/* Card 3: Callback Rate */}
        <div className="glass p-6 rounded-3xl border border-gray-200/60 dark:border-zinc-800 space-y-3">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400">
            Recruiter Callback Probability
          </span>
          <div className="flex items-center justify-between pt-1">
            <div className="text-center">
              <span className="text-xs font-mono text-gray-400 block">BASELINE</span>
              <span className="text-2xl font-black font-display text-gray-400">{baseScores.hiringProbability}%</span>
            </div>
            <ArrowRight className="w-5 h-5 text-purple-500 animate-pulse" />
            <div className="text-center">
              <span className="text-xs font-mono text-purple-400 font-bold block">ACTIVE VERSION</span>
              <span className="text-3xl font-black font-display text-purple-400">{currentScoring.hiringProbability}%</span>
            </div>
          </div>
          <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-[10px] font-mono text-purple-400 text-center font-bold">
            +{currentScoring.hiringProbability - baseScores.hiringProbability}% Interview Probability Gain
          </div>
        </div>

      </div>

      {/* Score Improvement Explanations List */}
      <div className="glass p-6 rounded-3xl border border-emerald-500/30 bg-emerald-500/5 space-y-3">
        <span className="text-xs font-mono font-bold uppercase text-emerald-400 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" />
          Quantified Score Increase Reasons
        </span>

        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-sans text-zinc-200">
          {currentScoring.scoreExplanations.map((exp, idx) => (
            <li key={idx} className="p-2.5 rounded-xl bg-white dark:bg-zinc-950 border border-emerald-500/20 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{exp}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Section-by-Section Diff Highlights */}
      <div className="glass p-6 rounded-3xl border border-gray-200/60 dark:border-zinc-800 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-zinc-800 pb-3">
          <span className="text-xs font-mono font-bold uppercase text-gray-400 flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-500" />
            Section-by-Section Change Detection
          </span>
          <div className="flex items-center gap-3 text-[10px] font-mono">
            <span className="text-emerald-400">🟢 Added</span>
            <span className="text-amber-400">🟡 Modified</span>
            <span className="text-rose-400">🔴 Removed</span>
          </div>
        </div>

        {currentScoring.diffs.length === 0 ? (
          <div className="p-8 text-center text-xs font-mono text-zinc-500">
            No changes detected between baseline snapshot and active version. Tweak resume sections in the workspace to preview live diffs.
          </div>
        ) : (
          <div className="space-y-4">
            {currentScoring.diffs.map((diff, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 space-y-3 text-xs font-mono">
                <span className="font-bold text-blue-400 uppercase tracking-wider block border-b border-zinc-800 pb-1">
                  Section: {diff.sectionName}
                </span>

                {/* Added items */}
                {diff.added.map((item, itemIdx) => (
                  <div key={itemIdx} className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-start gap-2 font-sans">
                    <PlusCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span><strong>Added:</strong> {item}</span>
                  </div>
                ))}

                {/* Modified items */}
                {diff.modified.map((item, itemIdx) => (
                  <div key={itemIdx} className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1 font-sans">
                    <div className="text-rose-400 line-through text-[11px] font-mono">
                      Original: "{item.before}"
                    </div>
                    <div className="text-emerald-400 font-bold text-xs flex items-center gap-1.5">
                      <Edit3 className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>Improved: "{item.after}"</span>
                    </div>
                  </div>
                ))}

                {/* Removed items */}
                {diff.removed.map((item, itemIdx) => (
                  <div key={itemIdx} className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-start gap-2 font-sans">
                    <MinusCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                    <span><strong>Removed:</strong> {item}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Side by Side Flaws vs Enhancements Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Original Flaws */}
        <div className="glass p-6 rounded-3xl border border-rose-500/20 bg-rose-500/5 space-y-4">
          <div className="flex items-center justify-between border-b border-rose-500/20 pb-3">
            <span className="text-xs font-mono font-bold uppercase text-rose-500">
              ❌ Baseline Resume Flaws Fixed
            </span>
          </div>

          <div className="space-y-3 text-xs text-gray-700 dark:text-zinc-300">
            {report.bulletPoints.map((pt, idx) => (
              <div key={idx} className="p-3 rounded-2xl bg-white dark:bg-zinc-950 border border-rose-500/20 space-y-1">
                <span className="text-[10px] font-mono text-rose-500 font-bold block">ISSUE #{idx + 1}</span>
                <p className="font-sans leading-relaxed">{pt}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Active Enhancements */}
        <div className="glass p-6 rounded-3xl border border-emerald-500/20 bg-emerald-500/5 space-y-4">
          <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
            <span className="text-xs font-mono font-bold uppercase text-emerald-400">
              ✨ Active Version Enhancements
            </span>
          </div>

          <div className="space-y-3 text-xs text-gray-700 dark:text-zinc-300">
            {currentScoring.scoreExplanations.map((change, idx) => (
              <div key={idx} className="p-3 rounded-2xl bg-white dark:bg-zinc-950 border border-emerald-500/20 space-y-1">
                <span className="text-[10px] font-mono text-emerald-400 font-bold block">ENHANCEMENT #{idx + 1}</span>
                <p className="font-sans leading-relaxed">{change}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Navigation Footer CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-3xl border border-blue-500/30 bg-blue-500/5">
        <div>
          <h4 className="text-sm font-bold font-display text-gray-900 dark:text-white">Continue refining your resume sections?</h4>
          <p className="text-xs text-gray-500 dark:text-zinc-400 font-sans">Use section-level AI assistants and guided recruiter coach suggestions.</p>
        </div>
        <button
          onClick={() => onNavigate('improve')}
          className="btn-primary px-6 py-3 rounded-2xl font-bold text-xs font-mono text-white cursor-pointer flex items-center gap-2 shadow-lg"
        >
          <Sparkles className="w-4 h-4 text-white" />
          <span>RETURN TO IMPROVEMENT WORKSPACE →</span>
        </button>
      </div>

    </motion.div>
  );
}
