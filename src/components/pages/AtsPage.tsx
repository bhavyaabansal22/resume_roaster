import React from 'react';
import { motion } from 'motion/react';
import { 
  BarChart3, CheckCircle2, XCircle, AlertCircle, Sparkles, 
  Layers, FileText, Check, ArrowRight, ShieldCheck, Tag
} from 'lucide-react';
import { MockRoastReport, AppTab } from '../../types';

interface AtsPageProps {
  report: MockRoastReport;
  onNavigate: (tab: AppTab) => void;
}

export default function AtsPage({ report, onNavigate }: AtsPageProps) {
  const atsScore = report.atsScore;
  const dimensionScores = report.dimensionScores || [];

  // Categorized dimension checks
  const keywordDim = dimensionScores.find(d => d.category.toLowerCase().includes('keyword')) || {
    score: atsScore,
    feedback: "Includes core industry technical keywords."
  };

  const formattingDim = dimensionScores.find(d => d.category.toLowerCase().includes('format')) || {
    score: Math.min(100, atsScore + 5),
    feedback: "Standard single-column layout detectable by Greenhouse and Lever."
  };

  const verbDim = dimensionScores.find(d => d.category.toLowerCase().includes('verb')) || {
    score: Math.max(20, atsScore - 10),
    feedback: "Uses action verbs across experience bullets."
  };

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
            <BarChart3 className="w-3.5 h-3.5" />
            <span>ATS Reality Check Engine</span>
          </div>
          <h2 className="text-3xl font-black font-display text-gray-900 dark:text-white">
            ATS Parser Compatibility & Keyword Audit
          </h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400 font-mono mt-1">
            Evaluating parsing compatibility against Greenhouse, Workday, Lever & Taleo
          </p>
        </div>

        <button
          onClick={() => onNavigate('improve')}
          className="btn-primary px-5 py-2.5 rounded-2xl text-xs font-mono font-bold text-white cursor-pointer flex items-center gap-2 shadow-lg"
        >
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>Fix ATS Score in Workspace →</span>
        </button>
      </div>

      {/* Main Score Gauge & Dimension Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: ATS Gauge Card */}
        <div className="lg:col-span-5 rounded-3xl border border-blue-500/30 bg-white dark:bg-zinc-950 p-6 md:p-8 space-y-6 text-center shadow-xl">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400">
            Overall ATS Pass Score
          </span>

          <div className="relative w-44 h-44 mx-auto flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-gray-200 dark:text-zinc-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-blue-500"
                strokeDasharray={`${atsScore}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-0.5">
              <span className="text-4xl font-black font-display text-gray-900 dark:text-white">
                {atsScore}%
              </span>
              <span className="text-[10px] font-mono font-bold uppercase text-blue-500">
                {atsScore >= 80 ? 'EXCELLENT' : atsScore >= 60 ? 'MODERATE' : 'HIGH RISK'}
              </span>
            </div>
          </div>

          <p className="text-xs text-gray-600 dark:text-zinc-400 font-sans leading-relaxed">
            {atsScore >= 75
              ? "Your resume has high parsing probability across standard corporate ATS platforms."
              : "Your resume risks automatic rejection in enterprise ATS filters due to missing keywords or formatting defects."}
          </p>
        </div>

        {/* Right: ATS Checklist Cards */}
        <div className="lg:col-span-7 glass p-6 rounded-3xl border border-gray-200/60 dark:border-zinc-800 space-y-4">
          <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-gray-400">
            ATS Checklist Breakdown
          </h3>

          <div className="space-y-3 text-xs">
            {/* Keyword Audit */}
            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 mt-0.5">
                <Tag className="w-4 h-4" />
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between font-bold text-gray-900 dark:text-white">
                  <span>Keyword Optimization</span>
                  <span className="text-blue-500 font-mono">{keywordDim.score}%</span>
                </div>
                <p className="text-gray-500 dark:text-zinc-400 leading-relaxed font-sans">
                  {keywordDim.feedback}
                </p>
              </div>
            </div>

            {/* Formatting Audit */}
            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 mt-0.5">
                <Layers className="w-4 h-4" />
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between font-bold text-gray-900 dark:text-white">
                  <span>Layout & Column Parseability</span>
                  <span className="text-emerald-500 font-mono">{formattingDim.score}%</span>
                </div>
                <p className="text-gray-500 dark:text-zinc-400 leading-relaxed font-sans">
                  {formattingDim.feedback}
                </p>
              </div>
            </div>

            {/* Action Verbs Audit */}
            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500 mt-0.5">
                <FileText className="w-4 h-4" />
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between font-bold text-gray-900 dark:text-white">
                  <span>Action Verbs & Quantified Metrics</span>
                  <span className="text-purple-500 font-mono">{verbDim.score}%</span>
                </div>
                <p className="text-gray-500 dark:text-zinc-400 leading-relaxed font-sans">
                  {verbDim.feedback}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Buzzwords Detected Counter */}
      {report.buzzwordCounter && report.buzzwordCounter.length > 0 && (
        <div className="glass p-6 rounded-3xl border border-gray-200/60 dark:border-zinc-800 space-y-4 text-left">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-zinc-800 pb-3">
            <span className="text-xs font-mono font-bold uppercase text-gray-400">
              Detected Buzzwords & Overused Phrases
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {report.buzzwordCounter.map((item, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 rounded-xl text-xs font-mono bg-amber-500/10 border border-amber-500/30 text-amber-500 font-bold flex items-center gap-1.5"
              >
                <span>"{item.word}"</span>
                <span className="bg-amber-500/20 px-1.5 py-0.5 rounded text-[10px]">{item.count}x</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations Banner */}
      <div className="glass p-6 rounded-3xl border border-blue-500/30 bg-blue-500/5 space-y-4 text-left">
        <h4 className="text-sm font-bold font-display text-gray-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-blue-500" />
          <span>Actionable ATS Improvements</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-600 dark:text-zinc-300 font-sans">
          <div className="flex items-start gap-2 p-3 rounded-xl bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
            <span>Inject exact technical skills into experience bullet points, not just in a isolated skills list.</span>
          </div>
          <div className="flex items-start gap-2 p-3 rounded-xl bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
            <span>Ensure every work bullet starts with strong past-tense action verbs (e.g. Engineered, Architected, Optimized).</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
