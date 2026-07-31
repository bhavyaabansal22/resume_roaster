import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Check, X, Edit3, Plus, Trash2, ArrowRight, 
  RotateCcw, ShieldCheck, CheckCircle2, User, FileText, Briefcase, Code, Award,
  History, Bookmark, Layers, Lock, Bot, MessageSquare, ArrowUp, ArrowDown,
  ChevronDown, ChevronUp, Copy, CheckSquare, PlusCircle, Wand2, TrendingUp,
  BriefcaseBusiness, DollarSign, RefreshCw, Languages, Link as LinkIcon, GraduationCap
} from 'lucide-react';
import { 
  MockRoastReport, ImprovedResumeData, ImprovementComparison, AppTab, 
  ResumeMemory, ResumeVersion, DetailedSuggestion 
} from '../../types';
import { 
  createInitialMemory, addMemoryVersion, calculateGradualScores, cloneResumeData 
} from '../../utils/resumeMemoryEngine';

interface ImprovePageProps {
  report: MockRoastReport;
  improvedData: ImprovedResumeData | null;
  setImprovedData: React.Dispatch<React.SetStateAction<ImprovedResumeData | null>>;
  comparison: ImprovementComparison | null;
  setComparison: React.Dispatch<React.SetStateAction<ImprovementComparison | null>>;
  resumeMemory: ResumeMemory | null;
  setResumeMemory: React.Dispatch<React.SetStateAction<ResumeMemory | null>>;
  onNavigate: (tab: AppTab) => void;
  triggerToast: (type: 'success' | 'error' | 'warning' | 'info', message: string) => void;
}

export default function ImprovePage({
  report,
  improvedData,
  setImprovedData,
  comparison,
  setComparison,
  resumeMemory,
  setResumeMemory,
  onNavigate,
  triggerToast
}: ImprovePageProps) {

  // Undo / Redo history stacks for local workspace edits
  const [historyStack, setHistoryStack] = useState<ImprovedResumeData[]>([]);
  const [redoStack, setRedoStack] = useState<ImprovedResumeData[]>([]);

  // Section level AI loading states
  const [processingSection, setProcessingSection] = useState<string | null>(null);

  // Recruiter Coach Mode State
  const [coachActiveTab, setCoachActiveTab] = useState<'checklist' | 'coach'>('checklist');
  const [coachMessages, setCoachMessages] = useState<Array<{ sender: 'coach' | 'user'; text: string; options?: Array<{ label: string; action: () => void }> }>>([]);

  // Checklist Completion States
  const [checklistItems, setChecklistItems] = useState([
    { id: 'c1', section: 'Summary', text: 'Mention target role & career direction', done: true },
    { id: 'c2', section: 'Summary', text: 'Highlight key technologies and core domain strength', done: false },
    { id: 'c3', section: 'Experience', text: 'Begin bullet points with high-impact action verbs (Spearheaded, Engineered)', done: false },
    { id: 'c4', section: 'Experience', text: 'Quantify achievements with measurable metrics (%, $, latency, scale)', done: false },
    { id: 'c5', section: 'Projects', text: 'Mention live deployment status or URL', done: false },
    { id: 'c6', section: 'Projects', text: 'List explicit tech stack used for each project', done: true },
    { id: 'c7', section: 'Skills', text: 'Group skills by category (Languages, Frameworks, Cloud/Tools)', done: true },
    { id: 'c8', section: 'Education & Certs', text: 'Verify institution, degree, field of study & graduation dates', done: true },
  ]);

  // Initialize ResumeMemory if missing
  useEffect(() => {
    if (!resumeMemory && report) {
      const memory = createInitialMemory(report);
      setResumeMemory(memory);
      
      const activeVersion = memory.versions[memory.activeVersionIndex];
      if (activeVersion) {
        setImprovedData(cloneResumeData(activeVersion.data));
      }
    }
  }, [report, resumeMemory]);

  // Initial Coach Questions Setup
  useEffect(() => {
    if (report && coachMessages.length === 0) {
      const candidateRole = report.candidateProfile?.detectedRole || 'Software Engineer';
      setCoachMessages([
        {
          sender: 'coach',
          text: `Hello! I'm Recruiter.exe sitting beside you. Based on your uploaded resume for a ${candidateRole} role, here are three high-value improvements we can collaborate on:`,
          options: [
            {
              label: "✨ Add Measurable Business Metrics to Projects",
              action: () => handleCoachAction('metrics')
            },
            {
              label: "💼 Rewrite Experience Bullets with Action Verbs",
              action: () => handleCoachAction('action_verbs')
            },
            {
              label: "📈 Inject Top Missing ATS Keywords",
              action: () => handleCoachAction('ats_keywords')
            }
          ]
        }
      ]);
    }
  }, [report]);

  const currentMemory = resumeMemory || (report ? createInitialMemory(report) : null);
  const activeVersion = currentMemory ? currentMemory.versions[currentMemory.activeVersionIndex] : null;
  const currentData = improvedData || (activeVersion ? activeVersion.data : null);

  if (!currentMemory || !currentData || !activeVersion) {
    return (
      <div className="p-12 text-center text-zinc-400 font-mono">
        Loading Resume Memory Workspace...
      </div>
    );
  }

  const baseScores = currentMemory.originalScores;
  const currentScoring = calculateGradualScores(currentMemory.originalSnapshot, currentData, baseScores);

  // Push new state to undo history
  const updateDataWithHistory = (newData: ImprovedResumeData) => {
    setHistoryStack(prev => [...prev, cloneResumeData(currentData)]);
    setRedoStack([]); // reset redo on new edit
    setImprovedData(newData);
  };

  const handleUndo = () => {
    if (historyStack.length === 0) return;
    const previous = historyStack[historyStack.length - 1];
    setRedoStack(prev => [...prev, cloneResumeData(currentData)]);
    setHistoryStack(prev => prev.slice(0, prev.length - 1));
    setImprovedData(previous);
    triggerToast('info', "Undo applied.");
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setHistoryStack(prev => [...prev, cloneResumeData(currentData)]);
    setRedoStack(prev => prev.slice(0, prev.length - 1));
    setImprovedData(next);
    triggerToast('info', "Redo applied.");
  };

  // Section-Level AI Assistant Action Handler
  const handleSectionAIAssist = (
    sectionKey: 'summary' | 'experience' | 'projects' | 'skills' | 'education' | 'achievements',
    mode: 'write' | 'ats' | 'recruiter' | 'impact' | 'professional'
  ) => {
    setProcessingSection(sectionKey);
    setTimeout(() => {
      const updated = cloneResumeData(currentData);

      if (sectionKey === 'summary') {
        if (mode === 'impact' || mode === 'ats') {
          updated.professionalSummary = `High-performing ${updated.header.title || 'Professional'} with a proven track record in architecting high-throughput systems, reducing latency by 35%, and driving cross-functional engineering deliverables.`;
        } else {
          updated.professionalSummary = `Accomplished ${updated.header.title || 'Engineer'} skilled in scalable software design, API integration, and modern web frameworks. Focused on clean code standards and measurable product impact.`;
        }
      } else if (sectionKey === 'experience') {
        updated.experience = updated.experience.map(exp => ({
          ...exp,
          bulletPoints: exp.bulletPoints.map(b => {
            if (mode === 'impact') {
              return b.includes('%') ? b : `${b}, boosting operational efficiency by 28% and cutting system downtimes.`;
            } else {
              return b.replace(/^(worked on|built|handled|did|assisted in)/i, 'Spearheaded and engineered');
            }
          })
        }));
      } else if (sectionKey === 'projects') {
        updated.projects = updated.projects.map(p => ({
          ...p,
          descriptionBullets: p.descriptionBullets.map(b => {
            if (mode === 'impact') {
              return `${b} serving 25k+ active monthly users with 99.9% uptime SLA.`;
            } else {
              return b.replace(/^(created|made|wrote)/i, 'Architected and deployed');
            }
          })
        }));
      } else if (sectionKey === 'skills') {
        if (!updated.skills.some(s => s.category.toLowerCase().includes('cloud'))) {
          updated.skills.push({
            category: 'Cloud & Infrastructure',
            items: ['AWS (S3/EC2)', 'Docker', 'CI/CD Pipelines', 'REST APIs', 'PostgreSQL']
          });
        }
      }

      updateDataWithHistory(updated);
      setProcessingSection(null);

      // Save version in memory
      const newMem = addMemoryVersion(
        currentMemory,
        updated,
        `AI Enhanced: ${sectionKey.toUpperCase()} (${mode})`
      );
      setResumeMemory(newMem);

      // Check checklist item
      setChecklistItems(prev => prev.map(item => item.section.toLowerCase().includes(sectionKey) ? { ...item, done: true } : item));

      triggerToast('success', `AI successfully enhanced ${sectionKey} section!`);
    }, 600);
  };

  // Recruiter Coach Dialog Handler
  const handleCoachAction = (type: 'metrics' | 'action_verbs' | 'ats_keywords' | 'summary_draft') => {
    if (type === 'metrics') {
      const updated = cloneResumeData(currentData);
      updated.projects.forEach(p => {
        p.descriptionBullets = p.descriptionBullets.map(b => 
          /\d+%|\$\d+/i.test(b) ? b : `${b} — driving a 30% speed improvement and zero critical security flaws.`
        );
      });
      updateDataWithHistory(updated);
      setCoachMessages(prev => [
        ...prev,
        { sender: 'user', text: "Yes, add measurable results and metrics to my projects." },
        { 
          sender: 'coach', 
          text: "Awesome! I added quantifiable metrics to your projects (+0.4 score increase). What would you like to improve next?",
          options: [
            { label: "💼 Transform Experience Bullets with Strong Action Verbs", action: () => handleCoachAction('action_verbs') },
            { label: "📈 Optimize Skills for ATS Recruiter Scanners", action: () => handleCoachAction('ats_keywords') }
          ]
        }
      ]);
      triggerToast('success', "Coach added measurable metrics!");
    } else if (type === 'action_verbs') {
      handleSectionAIAssist('experience', 'recruiter');
      setCoachMessages(prev => [
        ...prev,
        { sender: 'user', text: "Help me rewrite experience bullet points using strong action verbs." },
        { 
          sender: 'coach', 
          text: "Done! Replaced passive phrasing with strong verbs like Spearheaded, Engineered, and Architected.",
          options: [
            { label: "✨ Polish Executive Summary", action: () => handleCoachAction('summary_draft') }
          ]
        }
      ]);
    } else if (type === 'ats_keywords') {
      handleSectionAIAssist('skills', 'ats');
      setCoachMessages(prev => [
        ...prev,
        { sender: 'user', text: "Inject high-value missing ATS keywords into my skills." },
        { sender: 'coach', text: "Injected Cloud & Infrastructure skill category with AWS, Docker & CI/CD keywords (+0.5 ATS surge)!" }
      ]);
    } else if (type === 'summary_draft') {
      handleSectionAIAssist('summary', 'professional');
      setCoachMessages(prev => [
        ...prev,
        { sender: 'user', text: "Draft an executive professional summary based on my resume." },
        { sender: 'coach', text: "Drafted a high-impact professional summary highlighting your core tech stack!" }
      ]);
    }
  };

  // Apply suggestion item
  const handleApplySuggestion = (sugg: DetailedSuggestion) => {
    const updated = cloneResumeData(currentData);

    if (sugg.id === 'sugg-action-verbs') {
      updated.experience.forEach(exp => {
        exp.bulletPoints = exp.bulletPoints.map(b => 
          b.replace(/^(worked on|responsible for|handled)\s+/i, 'Spearheaded and engineered ')
        );
      });
    } else if (sugg.id === 'sugg-metrics') {
      updated.projects.forEach(p => {
        p.descriptionBullets = p.descriptionBullets.map(b => 
          /\d+%/i.test(b) ? b : `${b} achieving a 35% performance boost.`
        );
      });
    } else if (sugg.id === 'sugg-ats-keywords') {
      if (!updated.skills.some(s => s.category.includes('Cloud'))) {
        updated.skills.push({
          category: 'Cloud & Infrastructure',
          items: ['AWS (S3/EC2)', 'Docker', 'CI/CD', 'REST APIs']
        });
      }
    } else if (sugg.id === 'sugg-summary') {
      updated.professionalSummary = `Results-oriented ${updated.header.title || 'Engineer'} with proven experience delivering high-throughput web applications and scalable backend architectures.`;
    }

    updateDataWithHistory(updated);

    if (currentMemory) {
      const newMemory = addMemoryVersion(currentMemory, updated, `Applied ${sugg.section}`);
      const updatedSuggs = newMemory.detailedSuggestions.map(s => s.id === sugg.id ? { ...s, applied: true } : s);
      setResumeMemory({ ...newMemory, detailedSuggestions: updatedSuggs });
    }

    triggerToast('success', `Applied enhancement: ${sugg.section}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="w-full max-w-7xl mx-auto space-y-8 text-left py-4"
    >
      {/* Header Banner & Workspace Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200/60 dark:border-zinc-800 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-500 text-xs font-mono font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>AI-Assisted Resume Editor & Memory Engine</span>
          </div>
          <h2 className="text-3xl font-black font-display text-gray-900 dark:text-white">
            AI Improvement Workspace
          </h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400 font-mono mt-1">
            Factual Memory Preserved • Section AI Assistants • Full Modular Controls
          </p>
        </div>

        {/* Global Toolbar: Undo / Redo / Save Snapshot / Compare */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleUndo}
            disabled={historyStack.length === 0}
            className={`px-3 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 border ${
              historyStack.length > 0
                ? 'bg-zinc-800 hover:bg-zinc-700 text-white border-zinc-700 cursor-pointer'
                : 'bg-zinc-900 text-zinc-600 border-zinc-800 cursor-not-allowed opacity-50'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Undo ({historyStack.length})</span>
          </button>

          <button
            onClick={handleRedo}
            disabled={redoStack.length === 0}
            className={`px-3 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 border ${
              redoStack.length > 0
                ? 'bg-zinc-800 hover:bg-zinc-700 text-white border-zinc-700 cursor-pointer'
                : 'bg-zinc-900 text-zinc-600 border-zinc-800 cursor-not-allowed opacity-50'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Redo</span>
          </button>

          <button
            onClick={() => {
              const newMem = addMemoryVersion(currentMemory, currentData, `Manual Edit v${currentMemory.versions.length}`);
              setResumeMemory(newMem);
              triggerToast('success', "Saved custom version snapshot!");
            }}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-mono font-bold text-white cursor-pointer flex items-center gap-1.5"
          >
            <Bookmark className="w-3.5 h-3.5 text-emerald-400" />
            <span>Save Snapshot</span>
          </button>

          <button
            onClick={() => onNavigate('compare')}
            className="btn-primary px-5 py-2 rounded-xl text-xs font-mono font-bold text-white cursor-pointer flex items-center gap-1.5 shadow-xl"
          >
            <span>COMPARE DIFFS →</span>
          </button>
        </div>
      </div>

      {/* Recruiter Coach & Checklist Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Recruiter Coach Mode (Col 12 on mobile, Col 5 on desktop) */}
        <div className="lg:col-span-5 glass p-6 rounded-3xl border border-blue-500/30 bg-blue-500/5 space-y-4">
          
          <div className="flex items-center justify-between border-b border-blue-500/20 pb-3">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-blue-400" />
              <h3 className="text-sm font-bold font-mono text-blue-400 uppercase tracking-wider">
                Recruiter Coach Mode
              </h3>
            </div>
            
            <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800 text-[10px] font-mono">
              <button
                onClick={() => setCoachActiveTab('checklist')}
                className={`px-2.5 py-1 rounded-lg cursor-pointer ${
                  coachActiveTab === 'checklist' ? 'bg-blue-600 text-white font-bold' : 'text-zinc-400'
                }`}
              >
                Checklist
              </button>
              <button
                onClick={() => setCoachActiveTab('coach')}
                className={`px-2.5 py-1 rounded-lg cursor-pointer ${
                  coachActiveTab === 'coach' ? 'bg-blue-600 text-white font-bold' : 'text-zinc-400'
                }`}
              >
                Coach Dialogue
              </button>
            </div>
          </div>

          {coachActiveTab === 'checklist' ? (
            /* Actionable Improvement Checklist */
            <div className="space-y-2.5 text-xs">
              <span className="text-[10px] font-mono font-bold uppercase text-zinc-400 block mb-1">
                Guided Section Checklist
              </span>
              {checklistItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setChecklistItems(prev => prev.map(i => i.id === item.id ? { ...i, done: !i.done } : i));
                  }}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                    item.done
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-zinc-900/80 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-md border flex items-center justify-center mt-0.5 flex-shrink-0 ${
                    item.done ? 'bg-emerald-500 border-emerald-400 text-black' : 'border-zinc-700 bg-zinc-950'
                  }`}>
                    {item.done && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase text-zinc-400 block">
                      {item.section}
                    </span>
                    <span className={`font-sans ${item.done ? 'line-through opacity-80' : ''}`}>
                      {item.text}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Interactive Recruiter Coach Dialogue */
            <div className="space-y-3 text-xs">
              <div className="max-h-72 overflow-y-auto space-y-3 pr-1">
                {coachMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-2xl text-xs space-y-2 ${
                      msg.sender === 'coach'
                        ? 'bg-zinc-900 border border-blue-500/30 text-zinc-200'
                        : 'bg-blue-600 text-white ml-6 font-semibold'
                    }`}
                  >
                    <p className="font-sans leading-relaxed">{msg.text}</p>

                    {msg.options && (
                      <div className="space-y-1.5 pt-1">
                        {msg.options.map((opt, optIdx) => (
                          <button
                            key={optIdx}
                            onClick={opt.action}
                            className="w-full text-left p-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 font-mono text-[11px] font-bold cursor-pointer transition-all"
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Real-time Quality & ATS Surge Score Display (Col 7) */}
        <div className="lg:col-span-7 glass p-6 rounded-3xl border border-gray-200/60 dark:border-zinc-800 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-zinc-800 pb-3">
            <span className="text-xs font-mono font-bold uppercase text-gray-400">
              Score Evolution & Impact Justification
            </span>
            <span className="text-xs font-mono text-emerald-400 font-bold">
              +{ (currentScoring.resumeScore - baseScores.resumeScore).toFixed(1) } Quality Increase
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800">
              <span className="text-[10px] font-mono text-zinc-500 block">RESUME SCORE</span>
              <span className="text-xl font-black text-emerald-400 font-display">
                {currentScoring.resumeScore}/10
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800">
              <span className="text-[10px] font-mono text-zinc-500 block">ATS MATCH</span>
              <span className="text-xl font-black text-blue-400 font-display">
                {currentScoring.atsScore}%
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800">
              <span className="text-[10px] font-mono text-zinc-500 block">CALLBACK PROB</span>
              <span className="text-xl font-black text-purple-400 font-display">
                {currentScoring.hiringProbability}%
              </span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-xs font-sans space-y-1">
            <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase block">
              Quantified Incremental Changes:
            </span>
            <ul className="space-y-1 text-zinc-300">
              {currentScoring.scoreExplanations.map((exp, i) => (
                <li key={i} className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{exp}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>

      {/* Educational Suggestion Cards (Context Aware: Current -> Weak -> Suggestion -> Why) */}
      <div className="glass p-6 rounded-3xl border border-gray-200/60 dark:border-zinc-800 space-y-4">
        <span className="text-xs font-mono font-bold uppercase text-gray-400 block border-b border-gray-200 dark:border-zinc-800 pb-3">
          💡 Context-Aware Educational AI Suggestions
        </span>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentMemory.detailedSuggestions.map((sugg) => (
            <div 
              key={sugg.id}
              className={`p-5 rounded-2xl border transition-all space-y-3 ${
                sugg.applied 
                  ? 'bg-emerald-500/10 border-emerald-500/30' 
                  : 'bg-white dark:bg-zinc-950 border-gray-200 dark:border-zinc-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-300 text-[10px] font-mono font-bold uppercase">
                  {sugg.section}
                </span>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  +{sugg.impactScore} Pts
                </span>
              </div>

              {/* ❌ Current Text & Why weak */}
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase text-rose-400 block">
                  ❌ Current Text & Weakness
                </span>
                <p className="text-xs font-sans text-rose-200">
                  "{sugg.exampleBefore}" — <span className="opacity-80">{sugg.whatIsWrong}</span>
                </p>
              </div>

              {/* ✅ Suggested Rewrite & Why stronger */}
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase text-emerald-400 block">
                  ✅ Suggested Rewrite & Why Stronger
                </span>
                <p className="text-xs font-sans text-emerald-200 font-medium">
                  "{sugg.exampleAfter}"
                </p>
                <p className="text-[11px] font-sans text-emerald-400/80 pt-1">
                  📌 {sugg.howToImprove}
                </p>
              </div>

              <button
                onClick={() => handleApplySuggestion(sugg)}
                className={`w-full py-2.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  sugg.applied
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg'
                }`}
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>{sugg.applied ? '✓ Enhancement Applied' : 'Apply AI Rewrite →'}</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* FULL EDITABLE SECTIONS WORKSPACE */}
      <div className="space-y-6">

        {/* 1. HEADER & CONTACT */}
        <div className="glass p-6 rounded-3xl border border-gray-200/60 dark:border-zinc-800 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-blue-500" />
              <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-gray-900 dark:text-white">
                Contact & Header Information
              </h3>
            </div>
            <span className="text-[10px] font-mono text-blue-400 font-bold uppercase">✏ Editable</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-mono">
            <div>
              <label className="block text-gray-400 mb-1">Full Name</label>
              <input
                type="text"
                value={currentData.header.name}
                onChange={(e) => updateDataWithHistory({
                  ...currentData,
                  header: { ...currentData.header, name: e.target.value }
                })}
                className="w-full p-2.5 rounded-xl bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white font-bold outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-1">Target Job Title</label>
              <input
                type="text"
                value={currentData.header.title}
                onChange={(e) => updateDataWithHistory({
                  ...currentData,
                  header: { ...currentData.header, title: e.target.value }
                })}
                className="w-full p-2.5 rounded-xl bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-1">Email</label>
              <input
                type="text"
                value={currentData.header.email}
                onChange={(e) => updateDataWithHistory({
                  ...currentData,
                  header: { ...currentData.header, email: e.target.value }
                })}
                className="w-full p-2.5 rounded-xl bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-1">Phone</label>
              <input
                type="text"
                value={currentData.header.phone}
                onChange={(e) => updateDataWithHistory({
                  ...currentData,
                  header: { ...currentData.header, phone: e.target.value }
                })}
                className="w-full p-2.5 rounded-xl bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-1">LinkedIn Profile</label>
              <input
                type="text"
                value={currentData.header.linkedin}
                onChange={(e) => updateDataWithHistory({
                  ...currentData,
                  header: { ...currentData.header, linkedin: e.target.value }
                })}
                className="w-full p-2.5 rounded-xl bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-1">GitHub / Portfolio</label>
              <input
                type="text"
                value={currentData.header.github}
                onChange={(e) => updateDataWithHistory({
                  ...currentData,
                  header: { ...currentData.header, github: e.target.value }
                })}
                className="w-full p-2.5 rounded-xl bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* 2. PROFESSIONAL SUMMARY */}
        <div className="glass p-6 rounded-3xl border border-gray-200/60 dark:border-zinc-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 dark:border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-500" />
              <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-gray-900 dark:text-white">
                Professional Summary
              </h3>
            </div>

            {/* Section-Level AI Assistant Controls */}
            <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
              <button
                onClick={() => handleSectionAIAssist('summary', 'write')}
                className="px-2.5 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 cursor-pointer flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>✨ Improve Writing</span>
              </button>
              <button
                onClick={() => handleSectionAIAssist('summary', 'ats')}
                className="px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 cursor-pointer flex items-center gap-1"
              >
                <TrendingUp className="w-3 h-3" />
                <span>📈 Increase ATS Score</span>
              </button>
            </div>
          </div>

          <textarea
            rows={3}
            value={currentData.professionalSummary}
            onChange={(e) => updateDataWithHistory({ ...currentData, professionalSummary: e.target.value })}
            className="w-full p-3.5 rounded-2xl bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white text-xs leading-relaxed focus:border-purple-500 outline-none"
          />
        </div>

        {/* 3. EXPERIENCE */}
        <div className="glass p-6 rounded-3xl border border-gray-200/60 dark:border-zinc-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 dark:border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-emerald-500" />
              <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-gray-900 dark:text-white">
                Work Experience ({currentData.experience.length})
              </h3>
            </div>

            {/* Section Level AI Assistant & Add Experience Controls */}
            <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
              <button
                onClick={() => handleSectionAIAssist('experience', 'recruiter')}
                className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 cursor-pointer flex items-center gap-1"
              >
                <BriefcaseBusiness className="w-3 h-3" />
                <span>💼 Recruiter Friendly</span>
              </button>
              <button
                onClick={() => handleSectionAIAssist('experience', 'impact')}
                className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 cursor-pointer flex items-center gap-1"
              >
                <DollarSign className="w-3 h-3" />
                <span>📊 Add Business Impact</span>
              </button>
              <button
                onClick={() => {
                  const updated = cloneResumeData(currentData);
                  updated.experience.push({
                    company: 'New Company Inc.',
                    role: 'Software Engineer',
                    dates: '2023 - Present',
                    bulletPoints: ['Engineered scalable application features delivering high user engagement.']
                  });
                  updateDataWithHistory(updated);
                  triggerToast('success', "Added new experience entry!");
                }}
                className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>➕ Add Experience</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {currentData.experience.map((exp, expIdx) => (
              <div key={expIdx} className="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    Experience #{expIdx + 1}
                  </span>
                  <div className="flex items-center gap-2 text-xs">
                    {/* Reorder Buttons */}
                    <button
                      onClick={() => {
                        if (expIdx === 0) return;
                        const updated = cloneResumeData(currentData);
                        const temp = updated.experience[expIdx];
                        updated.experience[expIdx] = updated.experience[expIdx - 1];
                        updated.experience[expIdx - 1] = temp;
                        updateDataWithHistory(updated);
                      }}
                      disabled={expIdx === 0}
                      className="p-1 rounded bg-zinc-900 text-zinc-400 hover:text-white cursor-pointer disabled:opacity-30"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (expIdx === currentData.experience.length - 1) return;
                        const updated = cloneResumeData(currentData);
                        const temp = updated.experience[expIdx];
                        updated.experience[expIdx] = updated.experience[expIdx + 1];
                        updated.experience[expIdx + 1] = temp;
                        updateDataWithHistory(updated);
                      }}
                      disabled={expIdx === currentData.experience.length - 1}
                      className="p-1 rounded bg-zinc-900 text-zinc-400 hover:text-white cursor-pointer disabled:opacity-30"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        const updated = cloneResumeData(currentData);
                        updated.experience.splice(expIdx, 1);
                        updateDataWithHistory(updated);
                        triggerToast('warning', "Removed experience entry");
                      }}
                      className="p-1 text-rose-500 hover:bg-rose-500/10 rounded cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
                  <div>
                    <label className="block text-gray-400 mb-1">Company</label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => {
                        const updated = cloneResumeData(currentData);
                        updated.experience[expIdx].company = e.target.value;
                        updateDataWithHistory(updated);
                      }}
                      className="w-full p-2 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-1">Role Title</label>
                    <input
                      type="text"
                      value={exp.role}
                      onChange={(e) => {
                        const updated = cloneResumeData(currentData);
                        updated.experience[expIdx].role = e.target.value;
                        updateDataWithHistory(updated);
                      }}
                      className="w-full p-2 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-1">Dates</label>
                    <input
                      type="text"
                      value={exp.dates}
                      onChange={(e) => {
                        const updated = cloneResumeData(currentData);
                        updated.experience[expIdx].dates = e.target.value;
                        updateDataWithHistory(updated);
                      }}
                      className="w-full p-2 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Bullet Points List */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase text-gray-400">Bullet Points:</span>
                    <button
                      onClick={() => {
                        const updated = cloneResumeData(currentData);
                        updated.experience[expIdx].bulletPoints.push('Spearheaded key technical initiatives resulting in quantifiable impact.');
                        updateDataWithHistory(updated);
                      }}
                      className="text-[10px] font-mono font-bold text-emerald-400 hover:underline cursor-pointer"
                    >
                      ➕ Add Bullet
                    </button>
                  </div>

                  {exp.bulletPoints.map((bullet, bulletIdx) => (
                    <div key={bulletIdx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={bullet}
                        onChange={(e) => {
                          const updated = cloneResumeData(currentData);
                          updated.experience[expIdx].bulletPoints[bulletIdx] = e.target.value;
                          updateDataWithHistory(updated);
                        }}
                        className="flex-1 p-2.5 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-xs text-gray-900 dark:text-white font-sans focus:border-emerald-500 outline-none"
                      />
                      <button
                        onClick={() => {
                          const updated = cloneResumeData(currentData);
                          updated.experience[expIdx].bulletPoints.splice(bulletIdx, 1);
                          updateDataWithHistory(updated);
                        }}
                        className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. PROJECTS */}
        <div className="glass p-6 rounded-3xl border border-gray-200/60 dark:border-zinc-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 dark:border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-blue-500" />
              <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-gray-900 dark:text-white">
                Projects ({currentData.projects.length})
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
              <button
                onClick={() => handleSectionAIAssist('projects', 'impact')}
                className="px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 cursor-pointer flex items-center gap-1"
              >
                <DollarSign className="w-3 h-3" />
                <span>📊 Add Business Impact</span>
              </button>
              <button
                onClick={() => {
                  const updated = cloneResumeData(currentData);
                  updated.projects.push({
                    title: 'New Full-Stack App',
                    role: 'Creator & Developer',
                    techStack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
                    descriptionBullets: ['Developed responsive web app with authentication and microservice backend architecture.'],
                    liveUrl: 'https://github.com'
                  });
                  updateDataWithHistory(updated);
                  triggerToast('success', "Added new project entry!");
                }}
                className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>➕ Add Project</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {currentData.projects.map((proj, projIdx) => (
              <div key={projIdx} className="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <span className="text-xs font-mono font-bold text-blue-400">
                    Project #{projIdx + 1}
                  </span>
                  <button
                    onClick={() => {
                      const updated = cloneResumeData(currentData);
                      updated.projects.splice(projIdx, 1);
                      updateDataWithHistory(updated);
                      triggerToast('warning', "Removed project");
                    }}
                    className="p-1 text-rose-500 hover:bg-rose-500/10 rounded cursor-pointer text-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
                  <div>
                    <label className="block text-gray-400 mb-1">Project Title</label>
                    <input
                      type="text"
                      value={proj.title}
                      onChange={(e) => {
                        const updated = cloneResumeData(currentData);
                        updated.projects[projIdx].title = e.target.value;
                        updateDataWithHistory(updated);
                      }}
                      className="w-full p-2 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-1">Tech Stack (comma separated)</label>
                    <input
                      type="text"
                      value={proj.techStack.join(', ')}
                      onChange={(e) => {
                        const updated = cloneResumeData(currentData);
                        updated.projects[projIdx].techStack = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                        updateDataWithHistory(updated);
                      }}
                      className="w-full p-2 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-1">Live URL / Repo</label>
                    <input
                      type="text"
                      value={proj.liveUrl || ''}
                      onChange={(e) => {
                        const updated = cloneResumeData(currentData);
                        updated.projects[projIdx].liveUrl = e.target.value;
                        updateDataWithHistory(updated);
                      }}
                      className="w-full p-2 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Bullets */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase text-gray-400">Description Bullets:</span>
                    <button
                      onClick={() => {
                        const updated = cloneResumeData(currentData);
                        updated.projects[projIdx].descriptionBullets.push('Implemented automated testing and CI/CD deployment pipeline.');
                        updateDataWithHistory(updated);
                      }}
                      className="text-[10px] font-mono font-bold text-blue-400 hover:underline cursor-pointer"
                    >
                      ➕ Add Bullet
                    </button>
                  </div>

                  {proj.descriptionBullets.map((bullet, bulletIdx) => (
                    <div key={bulletIdx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={bullet}
                        onChange={(e) => {
                          const updated = cloneResumeData(currentData);
                          updated.projects[projIdx].descriptionBullets[bulletIdx] = e.target.value;
                          updateDataWithHistory(updated);
                        }}
                        className="flex-1 p-2.5 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-xs text-gray-900 dark:text-white font-sans focus:border-blue-500 outline-none"
                      />
                      <button
                        onClick={() => {
                          const updated = cloneResumeData(currentData);
                          updated.projects[projIdx].descriptionBullets.splice(bulletIdx, 1);
                          updateDataWithHistory(updated);
                        }}
                        className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. TECHNICAL SKILLS */}
        <div className="glass p-6 rounded-3xl border border-gray-200/60 dark:border-zinc-800 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-gray-900 dark:text-white">
                Technical Skills ({currentData.skills.flatMap(s => s.items).length} items)
              </h3>
            </div>

            <button
              onClick={() => {
                const updated = cloneResumeData(currentData);
                updated.skills.push({
                  category: 'Tools & DevOps',
                  items: ['Git', 'Docker', 'Linux', 'VS Code']
                });
                updateDataWithHistory(updated);
                triggerToast('success', "Added skill category!");
              }}
              className="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold cursor-pointer"
            >
              ➕ Add Skill Category
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            {currentData.skills.map((sk, skIdx) => (
              <div key={skIdx} className="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    value={sk.category}
                    onChange={(e) => {
                      const updated = cloneResumeData(currentData);
                      updated.skills[skIdx].category = e.target.value;
                      updateDataWithHistory(updated);
                    }}
                    className="font-bold text-amber-400 bg-transparent border-b border-zinc-800 outline-none pb-0.5"
                  />
                  <button
                    onClick={() => {
                      const updated = cloneResumeData(currentData);
                      updated.skills.splice(skIdx, 1);
                      updateDataWithHistory(updated);
                    }}
                    className="p-1 text-rose-500 hover:bg-rose-500/10 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <textarea
                  rows={2}
                  value={sk.items.join(', ')}
                  onChange={(e) => {
                    const updated = cloneResumeData(currentData);
                    updated.skills[skIdx].items = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                    updateDataWithHistory(updated);
                  }}
                  className="w-full p-2 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-300 text-xs outline-none"
                />
              </div>
            ))}
          </div>
        </div>

        {/* 6. EDUCATION & CERTIFICATIONS & ACHIEVEMENTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Education */}
          <div className="glass p-6 rounded-3xl border border-gray-200/60 dark:border-zinc-800 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-white">
                  Education
                </h3>
              </div>
              <button
                onClick={() => {
                  const updated = cloneResumeData(currentData);
                  updated.education.push({
                    institution: 'State University',
                    degree: 'B.S. Computer Science',
                    dates: '2020 - 2024'
                  });
                  updateDataWithHistory(updated);
                }}
                className="text-xs font-mono font-bold text-emerald-400 cursor-pointer"
              >
                ➕ Add Education
              </button>
            </div>

            {currentData.education.map((edu, eduIdx) => (
              <div key={eduIdx} className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-emerald-400 font-bold">Education #{eduIdx + 1}</span>
                  <button
                    onClick={() => {
                      const updated = cloneResumeData(currentData);
                      updated.education.splice(eduIdx, 1);
                      updateDataWithHistory(updated);
                    }}
                    className="text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <input
                  type="text"
                  value={edu.institution}
                  onChange={(e) => {
                    const updated = cloneResumeData(currentData);
                    updated.education[eduIdx].institution = e.target.value;
                    updateDataWithHistory(updated);
                  }}
                  className="w-full p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white font-bold"
                />
                <input
                  type="text"
                  value={edu.degree}
                  onChange={(e) => {
                    const updated = cloneResumeData(currentData);
                    updated.education[eduIdx].degree = e.target.value;
                    updateDataWithHistory(updated);
                  }}
                  className="w-full p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white"
                />
              </div>
            ))}
          </div>

          {/* Certifications & Achievements */}
          <div className="glass p-6 rounded-3xl border border-gray-200/60 dark:border-zinc-800 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-white">
                  Certifications & Achievements
                </h3>
              </div>
              <button
                onClick={() => {
                  const updated = cloneResumeData(currentData);
                  updated.certifications.push('AWS Certified Solutions Architect');
                  updateDataWithHistory(updated);
                }}
                className="text-xs font-mono font-bold text-purple-400 cursor-pointer"
              >
                ➕ Add Certification
              </button>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <span className="text-[10px] font-bold text-zinc-400 uppercase">Certifications:</span>
              {currentData.certifications.map((cert, certIdx) => (
                <div key={certIdx} className="flex gap-2">
                  <input
                    type="text"
                    value={cert}
                    onChange={(e) => {
                      const updated = cloneResumeData(currentData);
                      updated.certifications[certIdx] = e.target.value;
                      updateDataWithHistory(updated);
                    }}
                    className="flex-1 p-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white"
                  />
                  <button
                    onClick={() => {
                      const updated = cloneResumeData(currentData);
                      updated.certifications.splice(certIdx, 1);
                      updateDataWithHistory(updated);
                    }}
                    className="p-2 text-rose-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Navigation Footer CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-3xl border border-emerald-500/30 bg-emerald-500/5">
        <div>
          <h4 className="text-sm font-bold font-display text-gray-900 dark:text-white">Done customizing resume sections?</h4>
          <p className="text-xs text-gray-500 dark:text-zinc-400 font-sans">Inspect section-by-section diffs and quantified score growth in Compare mode.</p>
        </div>
        <button
          onClick={() => onNavigate('compare')}
          className="btn-primary px-6 py-3 rounded-2xl font-bold text-xs font-mono text-white cursor-pointer flex items-center gap-2 shadow-lg"
        >
          <span>VIEW BEFORE VS AFTER COMPARISON →</span>
        </button>
      </div>

    </motion.div>
  );
}
