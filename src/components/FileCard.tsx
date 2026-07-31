import React from 'react';
import { motion } from 'motion/react';
import { FileText, Trash2, ShieldAlert, FileMinus, FileCheck } from 'lucide-react';
import { UploadedFile } from '../types';

interface FileCardProps {
  key?: React.Key;
  file: UploadedFile;
  onRemove: (id: string) => void;
}

export default function FileCard({ file, onRemove }: FileCardProps) {
  const getBadge = () => {
    if (file.isCorrupted) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase bg-rose-500/10 border border-rose-500/30 text-rose-400 px-2.5 py-0.5 rounded-full font-bold">
          <ShieldAlert className="w-3 h-3" />
          Corrupted Sim
        </span>
      );
    }
    if (file.isBlank) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase bg-amber-500/10 border border-amber-500/30 text-amber-400 px-2.5 py-0.5 rounded-full font-bold">
          <FileMinus className="w-3 h-3" />
          Blank Sim
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2.5 py-0.5 rounded-full font-bold">
        <FileCheck className="w-3 h-3" />
        Ready to Roast
      </span>
    );
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -15, scale: 0.95 }}
      whileHover={{ y: -2 }}
      className={`relative overflow-hidden rounded-xl border p-4 transition-all duration-200 glass-panel
        ${file.isCorrupted || file.isBlank 
          ? 'bg-rose-500/5 border-rose-500/20' 
          : 'bg-white/40 dark:bg-zinc-900/30 border-gray-200 dark:border-zinc-800'
        }`}
    >
      {/* Decorative vertical colored left bar */}
      <div className={`absolute top-0 left-0 bottom-0 w-1
        ${file.isCorrupted || file.isBlank ? 'bg-rose-500' : 'bg-blue-500'}`} 
      />

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0 pl-1">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
            ${file.isCorrupted || file.isBlank
              ? 'bg-rose-500/10 text-rose-500'
              : 'bg-blue-500/10 text-blue-500'
            }`}
          >
            <FileText className="w-5 h-5" />
          </div>
          
          <div className="min-w-0">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate font-sans">
              {file.name}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-mono text-gray-500 dark:text-zinc-400 font-medium">
                {file.formattedSize}
              </span>
              <span className="text-gray-300 dark:text-zinc-800 text-[10px]">•</span>
              {getBadge()}
            </div>
          </div>
        </div>

        <button
          onClick={() => onRemove(file.id)}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all duration-150 cursor-pointer"
          title="Remove resume"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
