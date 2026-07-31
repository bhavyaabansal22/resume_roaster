import React from 'react';
import { motion } from 'motion/react';
import { Github, Linkedin, Mail, Heart, Sparkles, ShieldCheck } from 'lucide-react';
import { AppTab } from '../types';

interface FooterProps {
  onNavigate?: (tab: AppTab) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      name: 'GitHub',
      icon: Github,
      url: 'https://github.com/bhavyaabansal22',
      hoverColor: 'hover:text-white hover:border-zinc-500 hover:bg-zinc-800/60',
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: 'https://www.linkedin.com/in/bhavyaa-bansal-0b5170334/',
      hoverColor: 'hover:text-blue-400 hover:border-blue-500/40 hover:bg-blue-500/10',
    },
    {
      name: 'Email',
      icon: Mail,
      url: 'https://mail.google.com/mail/?view=cm&fs=1&to=bhavyaabansal22@gmail.com',
      hoverColor: 'hover:text-emerald-400 hover:border-emerald-500/40 hover:bg-emerald-500/10',
    },
  ];

  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 mb-20 lg:mb-8 relative z-20"
    >
      {/* Outer Frosted Glass Container */}
      <div className="relative overflow-hidden rounded-3xl border border-zinc-800/80 bg-zinc-950/70 backdrop-blur-xl p-6 md:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all hover:border-blue-500/30">
        
        {/* Subtle Ambient Glowing Background Gradient */}
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6 text-center lg:text-left">
          
          {/* LEFT: Creator Information */}
          <div className="space-y-1.5 max-w-xs sm:max-w-none">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-medium text-zinc-300">
              <span>Built with</span>
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse" />
              <span>by</span>
              <span className="font-bold text-white tracking-wide border-b border-blue-500/40 pb-0.5">
                Bhavyaa Bansal
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-sans tracking-tight">
              Helping resumes survive the recruiter before they meet one.
            </p>
          </div>

          {/* CENTER: Quick Nav & Social Links */}
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center justify-center gap-3">
              {socialLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={link.name}
                    className={`p-2.5 rounded-2xl border border-zinc-800/80 bg-zinc-900/60 text-zinc-400 transition-all duration-300 hover:scale-110 shadow-md ${link.hoverColor} flex items-center justify-center group`}
                  >
                    <Icon className="w-4 h-4 transition-transform group-hover:rotate-6" />
                  </a>
                );
              })}
            </div>

            {/* Quick Feature Navigation Tabs */}
            {onNavigate && (
              <div className="flex flex-wrap justify-center gap-4 text-[10px] font-mono font-semibold tracking-wider text-zinc-400 uppercase">
                <button
                  onClick={() => onNavigate('ats')}
                  className="hover:text-blue-400 transition-colors cursor-pointer"
                >
                  ATS Reality Check
                </button>
                <span className="text-zinc-700">•</span>
                <button
                  onClick={() => onNavigate('personas')}
                  className="hover:text-blue-400 transition-colors cursor-pointer"
                >
                  Recruiter Simulation
                </button>
                <span className="text-zinc-700">•</span>
                <button
                  onClick={() => onNavigate('improve')}
                  className="hover:text-blue-400 transition-colors cursor-pointer"
                >
                  Resume Optimizer
                </button>
              </div>
            )}
          </div>

          {/* RIGHT: App Version & Copyright */}
          <div className="flex flex-col items-center lg:items-end gap-1.5 text-right">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-mono font-bold tracking-wider uppercase">
                <Sparkles className="w-3 h-3" />
                Rejectify v2.0
              </span>
            </div>
            <p className="text-[11px] font-sans text-zinc-400 font-medium">
              © {currentYear} Bhavyaa Bansal. All rights reserved.
            </p>
          </div>

        </div>
      </div>
    </motion.footer>
  );
}
