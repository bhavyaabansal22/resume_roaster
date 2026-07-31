import React from 'react';
import { motion } from 'motion/react';
import { 
  Home, LayoutDashboard, Flame, BarChart3, Users, Sparkles, TrendingUp,
  Terminal, Bug
} from 'lucide-react';
import { AppTab } from '../types';

interface NavbarProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  hasAnalysis: boolean;
  onNewAnalysis: () => void;
  developerMode?: boolean;
  onToggleDeveloperMode?: () => void;
}

export default function Navbar({
  activeTab,
  setActiveTab,
  hasAnalysis,
  onNewAnalysis,
  developerMode = false,
  onToggleDeveloperMode
}: NavbarProps) {
  const navItems: Array<{ id: AppTab; label: string; icon: React.ElementType; requiresAnalysis?: boolean }> = [
    { id: 'landing', label: 'Home', icon: Home },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, requiresAnalysis: true },
    { id: 'roast', label: 'Roast', icon: Flame, requiresAnalysis: true },
    { id: 'ats', label: 'ATS Review', icon: BarChart3, requiresAnalysis: true },
    { id: 'personas', label: 'Recruiters', icon: Users, requiresAnalysis: true },
    { id: 'improve', label: 'Workspace', icon: Sparkles, requiresAnalysis: true },
    { id: 'compare', label: 'Compare', icon: TrendingUp, requiresAnalysis: true },
  ];

  const handleTabClick = (item: typeof navItems[0]) => {
    if (item.requiresAnalysis && !hasAnalysis) {
      // If user clicks a restricted tab before uploading/analyzing, stay on landing
      setActiveTab('landing');
      return;
    }
    setActiveTab(item.id);
  };

  return (
    <>
      {/* Top Desktop Navigation Bar */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-zinc-950/80 border-b border-zinc-800/80 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Brand Logo & Tagline */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab('landing')}
              className="text-left cursor-pointer group"
            >
              <h1 className="text-2xl font-black tracking-tighter text-white flex items-center gap-1">
                REJECTIFY<span className="text-blue-500 animate-pulse">.</span>
              </h1>
              <p className="text-[9px] uppercase tracking-[0.25em] font-semibold text-zinc-400 hidden sm:block">
                AI Resume Platform
              </p>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 bg-zinc-900/60 p-1.5 rounded-2xl border border-zinc-800/60">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                const isDisabled = item.requiresAnalysis && !hasAnalysis;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item)}
                    disabled={isDisabled}
                    className={`relative px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      isActive
                        ? 'text-white'
                        : isDisabled
                        ? 'text-zinc-600 opacity-50 cursor-not-allowed'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTabBadge"
                        className="absolute inset-0 bg-blue-600 rounded-xl shadow-md"
                        transition={{ type: 'spring', duration: 0.4 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-1.5">
                      <Icon className={`w-3.5 h-3.5 ${item.id === 'roast' && isActive ? 'text-orange-300' : ''}`} />
                      <span>{item.label}</span>
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right Header Actions: Status / New Analysis / Dev Mode */}
          <div className="flex items-center gap-2 sm:gap-3">
            {onToggleDeveloperMode && (
              <button
                onClick={onToggleDeveloperMode}
                title="Toggle Developer Diagnostics Mode"
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                  developerMode
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-lg shadow-amber-500/10'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
                }`}
              >
                <Bug className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">{developerMode ? 'DEV MODE: ON' : 'Dev Mode'}</span>
              </button>
            )}

            {hasAnalysis && (
              <button
                onClick={onNewAnalysis}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-all cursor-pointer shadow-sm"
              >
                <span>+ New Resume</span>
              </button>
            )}

            <span className="text-[10px] text-blue-400 bg-blue-900/30 px-2.5 py-1 rounded-full border border-blue-500/20 font-mono font-bold tracking-wider">
              Rejectify v2.0
            </span>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Fixed Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/90 backdrop-blur-xl border-t border-zinc-800 py-2 px-3">
        <div className="flex items-center justify-around gap-1 max-w-md mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isDisabled = item.requiresAnalysis && !hasAnalysis;

            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item)}
                disabled={isDisabled}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                  isActive
                    ? 'text-blue-400 font-bold scale-105'
                    : isDisabled
                    ? 'text-zinc-700 opacity-40'
                    : 'text-zinc-400'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-mono leading-none">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
