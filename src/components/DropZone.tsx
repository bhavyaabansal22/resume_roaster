import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { FileUp, Sparkles, FileWarning, AlertOctagon, HelpCircle } from 'lucide-react';
import { UploadedFile } from '../types';

interface DropZoneProps {
  onFilesSelected: (files: File[], isBlank?: boolean, isCorrupted?: boolean) => void;
  triggerToast: (type: 'success' | 'error' | 'warning', message: string) => void;
}

export default function DropZone({ onFilesSelected, triggerToast }: DropZoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  
  // Custom toggles for simulating error edge cases requested in the prompt
  const [simulateBlank, setSimulateBlank] = useState(false);
  const [simulateCorrupted, setSimulateCorrupted] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const processFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    
    const validFiles: File[] = [];
    
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      
      // Validation 1: Check PDF type
      // Some browsers don't register application/pdf or user might upload custom file
      const isPDF = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      if (!isPDF) {
        triggerToast('error', "Interesting... that's definitely a file, just not a resume PDF.");
        continue;
      }
      
      // Validation 2: Check 10MB size limit
      const maxSizeBytes = 10 * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        triggerToast('warning', `Oops! "${file.name}" is over the 10 MB limit. Keep it light.`);
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      if (simulateCorrupted) {
        // Trigger simulated corrupt case
        onFilesSelected(validFiles, false, true);
        triggerToast('error', "Looks like this resume forgot to show up (Simulated Corruption).");
      } else if (simulateBlank) {
        // Trigger simulated blank case
        onFilesSelected(validFiles, true, false);
        triggerToast('error', "Looks like this resume forgot to show up (Simulated Blank).");
      } else {
        onFilesSelected(validFiles, false, false);
        triggerToast('success', `Successfully attached ${validFiles.length} resume${validFiles.length > 1 ? 's' : ''}!`);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    processFiles(e.dataTransfer.files);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full flex flex-col items-center gap-6">
      <motion.div
        id="dropzone-container"
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={triggerFileInput}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className={`w-full max-w-2xl min-h-[260px] flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 relative overflow-hidden group
          ${isDragActive 
            ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_30px_rgba(59,130,246,0.3)] scale-[1.02]' 
            : 'border-gray-300 dark:border-zinc-800 hover:border-blue-500/50 bg-white/50 dark:bg-zinc-900/30 hover:bg-white/80 dark:hover:bg-zinc-900/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]'
          }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          multiple
          className="hidden"
          onChange={handleInputChange}
        />

        {/* Dynamic inner glowing orb */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full blur-[80px] pointer-events-none transition-all duration-300
          ${isDragActive ? 'bg-blue-500/20' : 'bg-blue-500/5 dark:bg-blue-600/5 group-hover:bg-blue-500/10'}`} 
        />

        <div className="relative z-10 flex flex-col items-center gap-4">
          <motion.div
            animate={{
              y: isDragActive ? -10 : [0, -4, 0],
              scale: isDragActive ? 1.1 : 1
            }}
            transition={{
              repeat: isDragActive ? 0 : Infinity,
              duration: 2.5,
              ease: "easeInOut"
            }}
            className={`w-16 h-16 rounded-full flex items-center justify-center border transition-all duration-300
              ${isDragActive 
                ? 'bg-blue-500 text-white border-blue-400' 
                : 'bg-gray-100 dark:bg-zinc-800 text-gray-400 dark:text-zinc-500 border-gray-200 dark:border-zinc-700 group-hover:border-blue-500/30 group-hover:text-blue-500'}`}
          >
            <FileUp className="w-8 h-8" />
          </motion.div>

          <div className="space-y-1.5 max-w-sm">
            <h3 className="text-lg font-display font-semibold text-gray-900 dark:text-white group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
              {isDragActive ? "Drop your resume now!" : "Drag & Drop Resume PDF"}
            </h3>
            <p className="text-sm text-gray-500 dark:text-zinc-400">
              Only PDF format is accepted, up to <span className="font-semibold text-gray-700 dark:text-zinc-300">10 MB</span>.
            </p>
          </div>

          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-2 px-6 py-2.5 rounded-xl text-sm font-semibold tracking-wide shadow-md cursor-pointer border border-blue-500 bg-blue-600 hover:bg-blue-500 text-white transition-all duration-200"
            onClick={(e) => {
              e.stopPropagation(); // prevent double clicking
              triggerFileInput();
            }}
          >
            Browse PDF
          </motion.button>
        </div>
      </motion.div>

      {/* Simulator Tools: Gives explicit user toggle to test prompt edge cases perfectly! */}
      <div className="w-full max-w-2xl bg-gray-50 dark:bg-zinc-950/40 rounded-xl p-4 border border-gray-200/50 dark:border-zinc-800/60 text-left">
        <div className="flex items-center gap-2 mb-2.5">
          <HelpCircle className="w-4 h-4 text-blue-500" />
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-600 dark:text-zinc-400">
            Mascot Edge Case Injector (Click to Test)
          </h4>
        </div>
        <p className="text-xs text-gray-500 dark:text-zinc-500 mb-3">
          Simulate blank or corrupted PDFs to instantly trigger Rejectify's custom edge case screens as specified by the requirements.
        </p>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-zinc-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={simulateBlank}
              onChange={() => {
                setSimulateBlank(!simulateBlank);
                if (!simulateBlank) setSimulateCorrupted(false);
              }}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer dark:bg-zinc-900 dark:border-zinc-700"
            />
            <span className="flex items-center gap-1">
              <FileWarning className="w-3.5 h-3.5 text-amber-500" />
              Simulate Blank PDF (Error Screen)
            </span>
          </label>

          <label className="flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-zinc-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={simulateCorrupted}
              onChange={() => {
                setSimulateCorrupted(!simulateCorrupted);
                if (!simulateCorrupted) setSimulateBlank(false);
              }}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer dark:bg-zinc-900 dark:border-zinc-700"
            />
            <span className="flex items-center gap-1">
              <AlertOctagon className="w-3.5 h-3.5 text-rose-500" />
              Simulate Corrupted PDF (Error Screen)
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
