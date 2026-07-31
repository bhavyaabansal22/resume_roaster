import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Flame, Bot, AlertTriangle, MessageSquare, Skull, CheckCircle2, 
  XCircle, Zap, Users, ArrowRight, ShieldAlert, Sparkles
} from 'lucide-react';
import { MockRoastReport, AppTab } from '../../types';

interface RoastPageProps {
  report: MockRoastReport;
  onNavigate: (tab: AppTab) => void;
}

export default function RoastPage({ report, onNavigate }: RoastPageProps) {
  const [selectedPersona, setSelectedPersona] = useState<string>('faang_recruiter');
  
  const personaRoasts = report.personaRoasts || {};
  const currentRoast = personaRoasts[selectedPersona] || Object.values(personaRoasts)[0];

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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-rose-500/20 bg-rose-500/10 text-rose-500 text-xs font-mono font-bold uppercase tracking-wider mb-2">
            <Flame className="w-3.5 h-3.5" />
            <span>AI Roast Engine • Recruiter.exe</span>
          </div>
          <h2 className="text-3xl font-black font-display text-gray-900 dark:text-white">
            Resume Roast & Evidence Flaws
          </h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400 font-mono mt-1">
            Analyzing {report.fileName} • Zero fluff, 100% evidence
          </p>
        </div>

        {/* Persona Switcher Quick Control */}
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-zinc-900 p-1.5 rounded-2xl border border-gray-200 dark:border-zinc-800">
          <span className="text-[10px] font-mono font-bold uppercase text-gray-400 px-2">Personality:</span>
          {Object.entries(personaRoasts).slice(0, 4).map(([key, item]) => (
            <button
              key={key}
              onClick={() => setSelectedPersona(key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1 ${
                selectedPersona === key
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <span>{item.emoji}</span>
              <span className="hidden sm:inline">{item.title}</span>
            </button>
          ))}
          <button
            onClick={() => onNavigate('personas')}
            className="px-2 py-1.5 text-xs font-mono text-blue-500 hover:underline flex items-center gap-0.5"
            title="View all 7 personas"
          >
            <span>More</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Recruiter Speech Bubble Hero */}
      <div className="rounded-3xl border border-rose-500/30 bg-gradient-to-r from-rose-950/20 via-zinc-950 to-zinc-950 p-6 md:p-8 shadow-2xl relative overflow-hidden space-y-4">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-500 flex-shrink-0">
            <Bot className="w-8 h-8 animate-pulse" />
          </div>
          <div className="space-y-2 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-orange-400" />
                {currentRoast?.title || "Recruiter.exe"} Says:
              </span>
              <span className="text-[10px] font-mono bg-rose-500/20 text-rose-300 px-2.5 py-0.5 rounded-full border border-rose-500/30 font-bold">
                {currentRoast?.badge || "UNFILTERED"}
              </span>
            </div>

            <p className="text-base md:text-lg text-gray-100 font-medium leading-relaxed italic bg-zinc-900/80 p-4 rounded-2xl border border-zinc-800">
              "{currentRoast?.roastSummary || report.judgment}"
            </p>
          </div>
        </div>
      </div>

      {/* Verdict & Slam Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Final Verdict Card */}
        <div className="lg:col-span-5 glass p-6 rounded-3xl border border-gray-200/60 dark:border-zinc-800 space-y-4 text-left">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-zinc-800 pb-3">
            <span className="text-xs font-mono font-bold uppercase text-gray-400 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              Final Recruiter Verdict
            </span>
            <span className="text-xs font-mono font-black text-rose-500 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
              {report.verdict}
            </span>
          </div>

          <h3 className="text-xl font-extrabold font-display text-gray-900 dark:text-white">
            {report.verdictTitle || "High Rejection Likelihood"}
          </h3>

          {/* Grammar Slam Box */}
          {report.grammarSlam && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Grammar & Tone Slam:</span>
              </div>
              <p className="text-xs font-sans leading-relaxed font-medium">
                {report.grammarSlam}
              </p>
            </div>
          )}
        </div>

        {/* Right: Key Roast Bullets */}
        <div className="lg:col-span-7 glass p-6 rounded-3xl border border-gray-200/60 dark:border-zinc-800 space-y-4 text-left">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-zinc-800 pb-3">
            <span className="text-xs font-mono font-bold uppercase text-gray-400 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-orange-500" />
              Direct Roast Criticisms ({report.bulletPoints.length})
            </span>
          </div>

          <div className="space-y-3">
            {report.bulletPoints.map((point, index) => (
              <div
                key={index}
                className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex items-start gap-3 text-xs text-zinc-200 font-sans leading-relaxed"
              >
                <span className="w-6 h-6 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 font-mono font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                  #{index + 1}
                </span>
                <p>{point}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Evidence Table Findings Grid */}
      {report.evidenceTable && report.evidenceTable.length > 0 && (
        <div className="glass p-6 rounded-3xl border border-gray-200/60 dark:border-zinc-800 space-y-4 text-left">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-zinc-800 pb-3">
            <span className="text-xs font-mono font-bold uppercase text-gray-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Extracted Resume Defect Evidence ({report.evidenceTable.length})
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {report.evidenceTable.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900 dark:text-white font-display">
                    {item.finding}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    item.severity === 'Critical' ? 'bg-rose-500/20 text-rose-400' :
                    item.severity === 'High' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {item.severity}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-gray-100 dark:bg-zinc-900 font-mono text-[11px] text-gray-600 dark:text-zinc-400 border border-gray-200 dark:border-zinc-800 italic">
                  "{item.evidence}"
                </div>

                <p className="text-gray-500 dark:text-zinc-400 font-sans">
                  💡 <strong className="text-gray-700 dark:text-zinc-300">Fix:</strong> {item.suggestion}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation Footer CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-3xl border border-blue-500/30 bg-blue-500/5">
        <div>
          <h4 className="text-sm font-bold font-display text-gray-900 dark:text-white">Ready to fix these roasts?</h4>
          <p className="text-xs text-gray-500 dark:text-zinc-400 font-sans">Navigate to the Improve workspace to rewrite your bullet points automatically.</p>
        </div>
        <button
          onClick={() => onNavigate('improve')}
          className="btn-primary px-6 py-3 rounded-2xl font-bold text-xs font-mono text-white cursor-pointer flex items-center gap-2 shadow-lg"
        >
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>PROCEED TO IMPROVE WORKSPACE →</span>
        </button>
      </div>

    </motion.div>
  );
}
