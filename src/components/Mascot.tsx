import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, X, MessageSquare, Terminal, RefreshCw, Volume2, Sparkles } from 'lucide-react';

interface MascotProps {
  currentFileCount: number;
  lastAction: string;
}

const DEFAULT_MESSAGES = [
  "Waiting to judge your resume...",
  "Recruiters are standing by.",
  "Upload whenever you're ready.",
  "Is that standard margin size? Disgusting.",
  "Two-page resume? I don't read novels.",
  "Font choice speaks volumes. I hope it's not Calibri.",
  "I reject 80% of resumes before even opening them.",
  "Ah, another 'highly motivated self-starter'. Groundbreaking.",
  "ATS scan ready to complete in 0.003 seconds.",
  "Is 'Synergy' still in your vocabulary? Oh boy.",
  "I can smell the unformatted bullet points from here.",
  "If your resume has a skills bar with percentages, I am instantly calling security."
];

const UPLOADED_MESSAGES = [
  "Ooh, a fresh specimen! Let me at it.",
  "Is that PDF actually valid, or did you rename a JPEG?",
  "Let's see how fast I can find a spelling mistake.",
  "Click 'Roast Resume' if you dare to face the truth.",
  "That file name... very brave."
];

export default function Mascot({ currentFileCount, lastAction }: MascotProps) {
  const [message, setMessage] = useState(DEFAULT_MESSAGES[0]);
  const [isOpen, setIsOpen] = useState(true);
  const [mood, setMood] = useState<'idle' | 'excited' | 'skeptical' | 'judging'>('idle');

  // Cycle comments or respond to state changes
  useEffect(() => {
    if (currentFileCount > 0) {
      setMood('excited');
      const randomMsg = UPLOADED_MESSAGES[Math.floor(Math.random() * UPLOADED_MESSAGES.length)];
      setMessage(randomMsg);
    } else {
      setMood('idle');
      setMessage("Waiting to judge your resume...");
    }
  }, [currentFileCount]);

  useEffect(() => {
    if (lastAction === 'roast') {
      setMood('judging');
      setMessage("Preparing maximum damage roast... Loading systems.");
    } else if (lastAction === 'error') {
      setMood('skeptical');
      setMessage("Nice try! Did you read the instructions? PDF only.");
    } else if (lastAction === 'clear') {
      setMood('idle');
      setMessage("Cleared? Running away from feedback? Classic candidate behavior.");
    }
  }, [lastAction]);

  // Periodic message trigger
  useEffect(() => {
    const interval = setInterval(() => {
      if (mood === 'judging') return;
      const bank = currentFileCount > 0 ? UPLOADED_MESSAGES : DEFAULT_MESSAGES;
      const randomMsg = bank[Math.floor(Math.random() * bank.length)];
      setMessage(randomMsg);
      
      // Randomly cycle temporary mood
      const moods: Array<'idle' | 'skeptical' | 'excited'> = ['idle', 'skeptical', 'excited'];
      setMood(moods[Math.floor(Math.random() * moods.length)]);
    }, 12000);

    return () => clearInterval(interval);
  }, [currentFileCount, mood]);

  const triggerRandomQuote = () => {
    const bank = currentFileCount > 0 ? UPLOADED_MESSAGES : DEFAULT_MESSAGES;
    const randomMsg = bank[Math.floor(Math.random() * bank.length)];
    setMessage(randomMsg);
    
    const moods: Array<'idle' | 'skeptical' | 'excited' | 'judging'> = ['idle', 'skeptical', 'excited', 'judging'];
    setMood(moods[Math.floor(Math.random() * moods.length)]);
  };

  // Mascot visual appearance based on mood
  const getMascotColor = () => {
    switch (mood) {
      case 'excited': return 'border-emerald-500 bg-emerald-500/10 text-emerald-400';
      case 'skeptical': return 'border-amber-500 bg-amber-500/10 text-amber-400';
      case 'judging': return 'border-rose-500 bg-rose-500/10 text-rose-400';
      default: return 'border-blue-500 bg-blue-500/10 text-blue-400';
    }
  };

  return (
    <div id="recruiter-mascot" className="fixed bottom-6 right-6 z-40 flex flex-col items-end pointer-events-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="pointer-events-auto mb-3 max-w-[280px] rounded-xl border border-white/10 dark:border-white/10 bg-white/80 dark:bg-zinc-950/90 shadow-2xl glass-panel p-4"
          >
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-zinc-800 pb-2 mb-2">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold tracking-wider text-gray-500 dark:text-zinc-400">
                <Terminal className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
                <span>RECRUITER.EXE</span>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors"
                title="Hide Recruiter"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            
            <p className="text-sm text-gray-800 dark:text-zinc-200 font-medium font-sans mb-3 leading-relaxed">
              "{message}"
            </p>

            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border ${getMascotColor()}`}>
                Status: {mood}
              </span>
              <button
                onClick={triggerRandomQuote}
                className="flex items-center gap-1 text-[10px] font-mono text-blue-500 dark:text-blue-400 hover:underline transition-all cursor-pointer"
              >
                <RefreshCw className="w-2.5 h-2.5" />
                <span>Poke</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        id="mascot-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="pointer-events-auto flex items-center justify-center w-14 h-14 rounded-full border border-blue-500/30 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(59,130,246,0.5)] cursor-pointer focus:outline-none relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        <motion.div
          animate={{
            y: mood === 'judging' ? [0, -3, 0] : [0, -2, 0],
            rotate: mood === 'skeptical' ? [0, -5, 5, 0] : [0, 0]
          }}
          transition={{
            repeat: Infinity,
            duration: mood === 'judging' ? 1.5 : 4,
            ease: "easeInOut"
          }}
        >
          <Bot className="w-7 h-7" />
        </motion.div>
        
        {/* Unread dot or highlight indicator */}
        {currentFileCount > 0 && (
          <span className="absolute top-0 right-0 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
          </span>
        )}
      </motion.button>
    </div>
  );
}
