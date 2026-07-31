import React from 'react';
import { motion } from 'motion/react';
import { 
  Flame, BarChart3, Users, Sparkles, UserCheck, CheckCircle2, 
  ChevronRight, ArrowUpRight, Zap, Target, Linkedin, Github, MessageSquareCode, Compass
} from 'lucide-react';
import { MockRoastReport, AppTab } from '../../types';

interface DashboardPageProps {
  report: MockRoastReport;
  onNavigate: (tab: AppTab) => void;
}

export default function DashboardPage({ report, onNavigate }: DashboardPageProps) {
  const profile = report.candidateProfile;
  const resumeScore = report.resumeScore != null ? report.resumeScore.toFixed(1) : (report.atsScore / 10).toFixed(1);
  const atsScore = report.atsScore;
  const hiringProbability = report.hiringProbability ?? Math.floor(atsScore * 0.4);
  const recruiterConfidence = report.recruiterConfidence ?? Math.floor(atsScore * 0.5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="w-full max-w-6xl mx-auto space-y-8 text-left py-4"
    >
      {/* Top Banner: Candidate Profile Summary */}
      <div className="rounded-3xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950/80 p-6 md:p-8 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200/60 dark:border-zinc-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-500 font-bold">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black font-display text-gray-900 dark:text-white flex items-center gap-2">
                <span>{profile?.name || "Candidate Resume"}</span>
                <span className="text-xs font-mono font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                  Analyzed
                </span>
              </h2>
              <p className="text-xs font-mono text-gray-500 dark:text-zinc-400 mt-0.5">
                File: {report.fileName}
              </p>
            </div>
          </div>

          {/* Role & Seniority Badges */}
          {profile && (
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
              <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full font-bold">
                Role: {profile.detectedRole}
              </span>
              <span className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 px-3 py-1 rounded-full font-bold">
                Level: {profile.experienceLevel}
              </span>
              {profile.industry && (
                <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full font-bold">
                  Industry: {profile.industry}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Quick Contact Links Indicator */}
        {profile && (
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-gray-500 dark:text-zinc-400">
            <span className="font-bold uppercase text-[10px] tracking-wider">Contact Link Check:</span>
            <div className="flex gap-2">
              <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${profile.contactLinks.email ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/10 text-red-400 line-through'}`}>Email</span>
              <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${profile.contactLinks.phone ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/10 text-red-400 line-through'}`}>Phone</span>
              <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${profile.contactLinks.linkedin ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/10 text-red-400 line-through'}`}>LinkedIn</span>
              <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${profile.contactLinks.github ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/10 text-red-400 line-through'}`}>GitHub</span>
            </div>
          </div>
        )}
      </div>

      {/* Core Summary Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="glass p-5 rounded-2xl border border-gray-200/60 dark:border-zinc-800 text-left">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500">
            Resume Score
          </span>
          <div className="text-3xl font-black font-display text-gray-900 dark:text-white mt-1">
            {resumeScore}<span className="text-sm font-normal text-gray-400">/10</span>
          </div>
          <p className="text-[10px] text-gray-500 dark:text-zinc-400 mt-1 font-mono">Overall quality</p>
        </div>

        <div className="glass p-5 rounded-2xl border border-gray-200/60 dark:border-zinc-800 text-left">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500">
            ATS Score
          </span>
          <div className="text-3xl font-black font-display text-blue-500 mt-1">
            {atsScore}%
          </div>
          <p className="text-[10px] text-gray-500 dark:text-zinc-400 mt-1 font-mono">Parser pass rate</p>
        </div>

        <div className="glass p-5 rounded-2xl border border-gray-200/60 dark:border-zinc-800 text-left">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500">
            Hiring Probability
          </span>
          <div className="text-3xl font-black font-display text-amber-500 mt-1">
            {hiringProbability}%
          </div>
          <p className="text-[10px] text-gray-500 dark:text-zinc-400 mt-1 font-mono">Callback rate</p>
        </div>

        <div className="glass p-5 rounded-2xl border border-gray-200/60 dark:border-zinc-800 text-left">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500">
            Detected Role
          </span>
          <div className="text-sm font-bold font-display text-gray-900 dark:text-white mt-2 truncate">
            {profile?.detectedRole || "Software Engineer"}
          </div>
          <p className="text-[10px] text-gray-500 dark:text-zinc-400 mt-1 font-mono">Target match</p>
        </div>

        <div className="glass p-5 rounded-2xl border border-gray-200/60 dark:border-zinc-800 text-left">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500">
            Experience Level
          </span>
          <div className="text-sm font-bold font-display text-purple-400 mt-2">
            {profile?.experienceLevel || "Mid-Level"}
          </div>
          <p className="text-[10px] text-gray-500 dark:text-zinc-400 mt-1 font-mono">Seniority tier</p>
        </div>

        <div className="glass p-5 rounded-2xl border border-gray-200/60 dark:border-zinc-800 text-left">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500">
            Recruiter Confidence
          </span>
          <div className="text-3xl font-black font-display text-emerald-500 mt-1">
            {recruiterConfidence}%
          </div>
          <p className="text-[10px] text-gray-500 dark:text-zinc-400 mt-1 font-mono">Evidence score</p>
        </div>
      </div>

      {/* Four Prominent Feature Buttons Grid */}
      <div className="space-y-4">
        <h3 className="text-lg font-black font-display text-gray-900 dark:text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-blue-500" />
          <span>Choose Analysis View</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Roast Resume */}
          <button
            onClick={() => onNavigate('roast')}
            className="p-6 rounded-3xl border border-rose-500/30 bg-gradient-to-b from-rose-500/10 to-transparent hover:from-rose-500/20 text-left transition-all cursor-pointer group hover:scale-[1.02] shadow-lg flex flex-col justify-between h-56"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-500 flex items-center justify-center mb-4">
                <Flame className="w-6 h-6 group-hover:scale-110 transition-transform" />
              </div>
              <h4 className="text-xl font-extrabold font-display text-gray-900 dark:text-white mb-1">
                🔥 Roast Resume
              </h4>
              <p className="text-xs text-gray-600 dark:text-zinc-400 font-sans leading-relaxed">
                Brutally honest, evidence-backed recruiter judgment, speech bubbles, and harsh feedback.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-mono font-bold text-rose-500 group-hover:translate-x-1 transition-transform">
              <span>View Roast Mode</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>

          {/* Card 2: ATS Review */}
          <button
            onClick={() => onNavigate('ats')}
            className="p-6 rounded-3xl border border-blue-500/30 bg-gradient-to-b from-blue-500/10 to-transparent hover:from-blue-500/20 text-left transition-all cursor-pointer group hover:scale-[1.02] shadow-lg flex flex-col justify-between h-56"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-500 flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 group-hover:scale-110 transition-transform" />
              </div>
              <h4 className="text-xl font-extrabold font-display text-gray-900 dark:text-white mb-1">
                📊 ATS Review
              </h4>
              <p className="text-xs text-gray-600 dark:text-zinc-400 font-sans leading-relaxed">
                Detailed keyword coverage, missing skills, formatting checks, and ATS parser pass metrics.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-mono font-bold text-blue-500 group-hover:translate-x-1 transition-transform">
              <span>View ATS Review</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>

          {/* Card 3: Recruiter Personas */}
          <button
            onClick={() => onNavigate('personas')}
            className="p-6 rounded-3xl border border-purple-500/30 bg-gradient-to-b from-purple-500/10 to-transparent hover:from-purple-500/20 text-left transition-all cursor-pointer group hover:scale-[1.02] shadow-lg flex flex-col justify-between h-56"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-500 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 group-hover:scale-110 transition-transform" />
              </div>
              <h4 className="text-xl font-extrabold font-display text-gray-900 dark:text-white mb-1">
                👔 Recruiter Personas
              </h4>
              <p className="text-xs text-gray-600 dark:text-zinc-400 font-sans leading-relaxed">
                Compare feedback from 7 simulated hiring profiles (FAANG, Startup Founder, Gen Z, HR).
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-mono font-bold text-purple-500 group-hover:translate-x-1 transition-transform">
              <span>View 7 Personas</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>

          {/* Card 4: Improve Resume */}
          <button
            onClick={() => onNavigate('improve')}
            className="p-6 rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-emerald-500/10 to-transparent hover:from-emerald-500/20 text-left transition-all cursor-pointer group hover:scale-[1.02] shadow-lg flex flex-col justify-between h-56"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 group-hover:scale-110 transition-transform text-emerald-400" />
              </div>
              <h4 className="text-xl font-extrabold font-display text-gray-900 dark:text-white mb-1">
                ✨ Improve Resume
              </h4>
              <p className="text-xs text-gray-600 dark:text-zinc-400 font-sans leading-relaxed">
                Interactive workspace to edit, rewrite bullet points with AI suggestions, and export PDF/DOCX.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-mono font-bold text-emerald-500 group-hover:translate-x-1 transition-transform">
              <span>Open Workspace</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      </div>

      {/* Future-Ready Modular Architecture Showcase */}
      <div className="p-6 rounded-3xl border border-gray-200/60 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/40 text-left space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-500" />
            <h4 className="text-sm font-bold font-display text-gray-900 dark:text-white">
              Upcoming SaaS Modules
            </h4>
          </div>
          <span className="text-[10px] font-mono text-gray-400 uppercase">Platform Architecture</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 opacity-70 hover:opacity-100 transition-opacity">
            <div className="flex items-center justify-between mb-1">
              <Target className="w-4 h-4 text-blue-500" />
              <span className="text-[9px] font-mono bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-full font-bold">SOON</span>
            </div>
            <span className="text-xs font-bold text-gray-800 dark:text-zinc-200">JD Matching</span>
            <p className="text-[10px] text-gray-400 mt-0.5">Match against custom job links</p>
          </div>

          <div className="p-3.5 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 opacity-70 hover:opacity-100 transition-opacity">
            <div className="flex items-center justify-between mb-1">
              <Linkedin className="w-4 h-4 text-sky-500" />
              <span className="text-[9px] font-mono bg-sky-500/10 text-sky-500 px-2 py-0.5 rounded-full font-bold">SOON</span>
            </div>
            <span className="text-xs font-bold text-gray-800 dark:text-zinc-200">LinkedIn Review</span>
            <p className="text-[10px] text-gray-400 mt-0.5">Profile headline & section check</p>
          </div>

          <div className="p-3.5 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 opacity-70 hover:opacity-100 transition-opacity">
            <div className="flex items-center justify-between mb-1">
              <MessageSquareCode className="w-4 h-4 text-purple-500" />
              <span className="text-[9px] font-mono bg-purple-500/10 text-purple-500 px-2 py-0.5 rounded-full font-bold">SOON</span>
            </div>
            <span className="text-xs font-bold text-gray-800 dark:text-zinc-200">Mock Interview</span>
            <p className="text-[10px] text-gray-400 mt-0.5">AI interviewer voice roleplay</p>
          </div>

          <div className="p-3.5 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 opacity-70 hover:opacity-100 transition-opacity">
            <div className="flex items-center justify-between mb-1">
              <Compass className="w-4 h-4 text-emerald-500" />
              <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full font-bold">SOON</span>
            </div>
            <span className="text-xs font-bold text-gray-800 dark:text-zinc-200">Career Roadmap</span>
            <p className="text-[10px] text-gray-400 mt-0.5">Custom skill gap learning path</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
