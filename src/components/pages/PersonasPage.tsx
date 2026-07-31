import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Users, Flame, Sparkles, MessageSquare, ShieldAlert, ArrowRight, Bot } from 'lucide-react';
import { MockRoastReport, AppTab, PersonaId } from '../../types';

interface PersonasPageProps {
  report: MockRoastReport;
  onNavigate: (tab: AppTab) => void;
}

const PERSONA_TABS: Array<{ id: PersonaId; name: string; emoji: string; desc: string }> = [
  { id: 'friendly', name: 'Friendly Recruiter', emoji: '🤝', desc: 'Encouraging but honest' },
  { id: 'corporate_hr', name: 'Corporate HR', emoji: '💼', desc: 'Strict compliance & formatting' },
  { id: 'startup_founder', name: 'Startup Founder', emoji: '🚀', desc: 'Scans for bias to action & ownership' },
  { id: 'hiring_manager', name: 'Hiring Manager', emoji: '🛠️', desc: 'Technical depth & project metrics' },
  { id: 'faang_recruiter', name: 'FAANG Recruiter', emoji: '🏛️', desc: 'Prestige, scale & high bar' },
  { id: 'gen_z', name: 'Gen Z Recruiter', emoji: '💀', desc: 'Unfiltered internet brain' },
  { id: 'ats_robot', name: 'ATS Robot', emoji: '🤖', desc: 'Cold binary keyword parser' },
];

export default function PersonasPage({ report, onNavigate }: PersonasPageProps) {
  const [activePersonaId, setActivePersonaId] = useState<PersonaId>('faang_recruiter');

  const personaRoasts = report.personaRoasts || {};
  const activeRoast = personaRoasts[activePersonaId] || personaRoasts['faang_recruiter'] || Object.values(personaRoasts)[0];

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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/20 bg-purple-500/10 text-purple-500 text-xs font-mono font-bold uppercase tracking-wider mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>7 Simulated Recruiter Personas</span>
          </div>
          <h2 className="text-3xl font-black font-display text-gray-900 dark:text-white">
            Simulated Hiring Committee Panel
          </h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400 font-mono mt-1">
            See how different types of hiring decision-makers judge your resume
          </p>
        </div>

        <button
          onClick={() => onNavigate('improve')}
          className="btn-primary px-5 py-2.5 rounded-2xl text-xs font-mono font-bold text-white cursor-pointer flex items-center gap-2 shadow-lg"
        >
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>Fix Findings in Workspace →</span>
        </button>
      </div>

      {/* 7 Interactive Persona Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {PERSONA_TABS.map((tab) => {
          const isActive = activePersonaId === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActivePersonaId(tab.id)}
              className={`px-4 py-3 rounded-2xl font-mono text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 border flex-shrink-0 ${
                isActive
                  ? 'bg-purple-600 text-white border-purple-500 shadow-xl scale-105'
                  : 'bg-white dark:bg-zinc-950 text-gray-700 dark:text-zinc-300 border-gray-200 dark:border-zinc-800 hover:border-purple-500/50'
              }`}
            >
              <span className="text-base">{tab.emoji}</span>
              <div className="text-left">
                <div>{tab.name}</div>
                <div className="text-[9px] opacity-75 font-normal">{tab.desc}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Persona Detail View */}
      {activeRoast && (
        <div className="rounded-3xl border border-purple-500/30 bg-gradient-to-b from-purple-950/20 via-zinc-950 to-zinc-950 p-6 md:p-8 space-y-6 shadow-2xl">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl p-2 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                {activeRoast.emoji}
              </span>
              <div>
                <h3 className="text-2xl font-extrabold font-display text-white">
                  {activeRoast.title}
                </h3>
                <span className="text-xs font-mono text-purple-400 font-bold">
                  {activeRoast.badge}
                </span>
              </div>
            </div>

            <span className="text-xs font-mono text-zinc-400 bg-zinc-900 px-3 py-1.5 rounded-full border border-zinc-800">
              Evaluated on extracted evidence
            </span>
          </div>

          {/* Persona Roast Summary Quote */}
          <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-400">
              Recruiter Statement:
            </span>
            <p className="text-base md:text-lg font-medium text-zinc-100 italic leading-relaxed">
              "{activeRoast.roastSummary}"
            </p>
          </div>

          {/* Persona Specific Bullet Points */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
              Key Persona Observations:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {activeRoast.roastBulletPoints?.map((point, index) => (
                <div
                  key={index}
                  className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-300 flex items-start gap-3 leading-relaxed"
                >
                  <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 font-mono font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Key Advice Box */}
          <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-1">
            <span className="text-xs font-mono font-bold uppercase text-emerald-400 flex items-center gap-1.5">
              💡 {activeRoast.title}'s Key Advice:
            </span>
            <p className="text-xs font-sans text-emerald-100 leading-relaxed font-medium">
              {activeRoast.keyAdvice}
            </p>
          </div>

        </div>
      )}

      {/* Navigation Footer CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-3xl border border-purple-500/30 bg-purple-500/5">
        <div>
          <h4 className="text-sm font-bold font-display text-gray-900 dark:text-white">Satisfied with recruiter feedback?</h4>
          <p className="text-xs text-gray-500 dark:text-zinc-400 font-sans">Open the Resume Workspace to apply AI bullet point improvements.</p>
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
