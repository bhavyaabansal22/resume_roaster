import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { Toast } from '../types';

interface ToastContainerProps {
  toasts: Toast[];
  removeToast: (id: string) => void;
}

export default function ToastContainer({ toasts, removeToast }: ToastContainerProps) {
  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 w-full max-w-sm pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          // Determine icon & color schemes
          let Icon = Info;
          let colorClass = 'border-blue-500/30 bg-blue-500/10 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.15)]';
          
          if (toast.type === 'success') {
            Icon = CheckCircle2;
            colorClass = 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]';
          } else if (toast.type === 'error') {
            Icon = AlertCircle;
            colorClass = 'border-rose-500/30 bg-rose-500/10 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.15)]';
          } else if (toast.type === 'warning') {
            Icon = AlertTriangle;
            colorClass = 'border-amber-500/30 bg-amber-500/10 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)]';
          }

          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9, transition: { duration: 0.2 } }}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border glass-panel backdrop-blur-md ${colorClass}`}
            >
              <div className="flex-shrink-0 mt-0.5">
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-grow">
                <p className="text-xs font-semibold font-mono tracking-wide uppercase opacity-70">
                  {toast.type} notification
                </p>
                <p className="text-sm font-sans mt-0.5 leading-relaxed font-medium">
                  {toast.message}
                </p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="flex-shrink-0 text-current opacity-60 hover:opacity-100 transition-opacity cursor-pointer p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
