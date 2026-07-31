import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UploadedFile, Toast, ToastType, AppTab, MockRoastReport, ImprovedResumeData, ImprovementComparison, ResumeMemory } from './types';
import Navbar from './components/Navbar';
import Mascot from './components/Mascot';
import ToastContainer from './components/ToastContainer';
import Footer from './components/Footer';

// Page components
import LandingPage from './components/pages/LandingPage';
import ProcessingPage from './components/pages/ProcessingPage';
import DashboardPage from './components/pages/DashboardPage';
import RoastPage from './components/pages/RoastPage';
import AtsPage from './components/pages/AtsPage';
import PersonasPage from './components/pages/PersonasPage';
import ImprovePage from './components/pages/ImprovePage';
import ComparePage from './components/pages/ComparePage';
import DownloadPage from './components/pages/DownloadPage';
import { createInitialMemory, cloneResumeData } from './utils/resumeMemoryEngine';

export default function App() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  // Navigation tab state
  const [activeTab, setActiveTab] = useState<AppTab>('landing');
  
  // Analysis report, memory & improved state
  const [reports, setReports] = useState<MockRoastReport[]>([]);
  const [activeReportIndex, setActiveReportIndex] = useState(0);
  const [improvedData, setImprovedData] = useState<ImprovedResumeData | null>(null);
  const [comparison, setComparison] = useState<ImprovementComparison | null>(null);
  const [resumeMemory, setResumeMemory] = useState<ResumeMemory | null>(null);

  const [lastAction, setLastAction] = useState<string>('idle');
  const [noUploadTriggered, setNoUploadTriggered] = useState(false);

  // Force dark theme for premium SaaS aesthetic
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // Toast Trigger Helper
  const triggerToast = (type: ToastType, message: string) => {
    const id = Math.random().toString();
    const newToast: Toast = { id, type, message };
    setToasts((prev) => [...prev, newToast]);
    
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Helper for formatting file size
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Files added through DropZone
  const handleFilesSelected = (newFiles: File[], isBlank = false, isCorrupted = false) => {
    setNoUploadTriggered(false);
    
    const formattedFiles: UploadedFile[] = newFiles.map((file) => ({
      id: Math.random().toString(),
      name: file.name,
      size: file.size,
      formattedSize: formatBytes(file.size),
      file: file,
      isBlank: isBlank,
      isCorrupted: isCorrupted
    }));

    setFiles((prev) => [...prev, ...formattedFiles]);
    setLastAction('upload');
  };

  // Delete individual file
  const handleRemoveFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    triggerToast('info', "Removed file from queue.");
    setLastAction('clear');
  };

  // Reset entire state for New Analysis
  const handleNewAnalysis = () => {
    setFiles([]);
    setReports([]);
    setActiveReportIndex(0);
    setImprovedData(null);
    setComparison(null);
    setResumeMemory(null);
    setNoUploadTriggered(false);
    setActiveTab('landing');
    setLastAction('clear');
    triggerToast('info', "Cleared previous analysis. Ready for new resume.");
  };

  // Handle Start Analysis Action
  const handleStartAnalysis = () => {
    if (files.length === 0) {
      setNoUploadTriggered(true);
      triggerToast('error', "Nice try 😄 Upload a resume first.");
      setLastAction('error');
      return;
    }

    const hasCorrupted = files.some(f => f.isCorrupted);
    const hasBlank = files.some(f => f.isBlank);

    if (hasCorrupted || hasBlank) {
      setLastAction('error');
      triggerToast('error', "Looks like this resume forgot to show up.");
    }

    setNoUploadTriggered(false);
    setActiveTab('processing');
    setLastAction('roast');
  };

  // Complete processing pipeline callback
  const handlePipelineComplete = (fetchedReports: MockRoastReport[]) => {
    setReports(fetchedReports);
    setActiveReportIndex(0);
    
    // Initialize Memory Snapshot & Improved Resume Data from first report
    if (fetchedReports.length > 0) {
      const rep = fetchedReports[0];
      const memory = createInitialMemory(rep);
      setResumeMemory(memory);
      
      const activeVer = memory.versions[memory.activeVersionIndex];
      if (activeVer) {
        setImprovedData(cloneResumeData(activeVer.data));
      }
      setComparison(rep.improvementComparison || null);
    }

    setActiveTab('dashboard');
    triggerToast('success', "AI Resume Pipeline Analysis Complete!");
  };

  const activeReport = reports[activeReportIndex] || null;
  const hasAnalysis = reports.length > 0 && activeReport != null;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 transition-colors duration-300 relative overflow-x-hidden bg-grid-pattern flex flex-col justify-between">
      
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Background Ambient Glowing Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-blue-600/10 blur-[120px] pointer-events-none animate-float-slow" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-indigo-900/15 blur-[140px] pointer-events-none animate-float-medium" />
      </div>

      {/* Application Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hasAnalysis={hasAnalysis}
        onNewAnalysis={handleNewAnalysis}
      />

      {/* Main Screen Router View */}
      <main className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 flex-1 flex flex-col justify-center pb-12">
        <AnimatePresence mode="wait">
          
          {/* PAGE 1: Landing Page */}
          {activeTab === 'landing' && (
            <div key="page-landing">
              <LandingPage
                files={files}
                onFilesSelected={handleFilesSelected}
                onRemoveFile={handleRemoveFile}
                onClearAll={handleNewAnalysis}
                onStartAnalysis={handleStartAnalysis}
                noUploadTriggered={noUploadTriggered}
                triggerToast={triggerToast}
              />
            </div>
          )}

          {/* PAGE 2: AI Processing Timeline */}
          {activeTab === 'processing' && (
            <div key="page-processing">
              <ProcessingPage
                files={files}
                onComplete={handlePipelineComplete}
                onError={(msg) => {
                  triggerToast('error', msg);
                  setActiveTab('landing');
                }}
              />
            </div>
          )}

          {/* PAGE 3: Analysis Dashboard */}
          {activeTab === 'dashboard' && activeReport && (
            <div key="page-dashboard">
              <DashboardPage
                report={activeReport}
                onNavigate={(tab) => setActiveTab(tab)}
              />
            </div>
          )}

          {/* PAGE 4: Roast Mode */}
          {activeTab === 'roast' && activeReport && (
            <div key="page-roast">
              <RoastPage
                report={activeReport}
                onNavigate={(tab) => setActiveTab(tab)}
              />
            </div>
          )}

          {/* PAGE 5: ATS Review */}
          {activeTab === 'ats' && activeReport && (
            <div key="page-ats">
              <AtsPage
                report={activeReport}
                onNavigate={(tab) => setActiveTab(tab)}
              />
            </div>
          )}

          {/* PAGE 6: Recruiter Personas */}
          {activeTab === 'personas' && activeReport && (
            <div key="page-personas">
              <PersonasPage
                report={activeReport}
                onNavigate={(tab) => setActiveTab(tab)}
              />
            </div>
          )}

          {/* PAGE 7: Improve Resume Workspace */}
          {activeTab === 'improve' && activeReport && (
            <div key="page-improve">
              <ImprovePage
                report={activeReport}
                improvedData={improvedData}
                setImprovedData={setImprovedData}
                comparison={comparison}
                setComparison={setComparison}
                resumeMemory={resumeMemory}
                setResumeMemory={setResumeMemory}
                onNavigate={(tab) => setActiveTab(tab)}
                triggerToast={triggerToast}
              />
            </div>
          )}

          {/* PAGE 8: Before vs After Comparison */}
          {activeTab === 'compare' && activeReport && (
            <div key="page-compare">
              <ComparePage
                report={activeReport}
                improvedData={improvedData}
                comparison={comparison}
                resumeMemory={resumeMemory}
                onNavigate={(tab) => setActiveTab(tab)}
              />
            </div>
          )}

          {/* PAGE 9: Download & Export */}
          {activeTab === 'download' && (
            <div key="page-download">
              <DownloadPage
                improvedData={improvedData}
                onNewAnalysis={handleNewAnalysis}
                onNavigate={(tab) => setActiveTab(tab)}
                triggerToast={triggerToast}
              />
            </div>
          )}

        </AnimatePresence>
      </main>

      {/* Recruiter.exe Companion Mascot Bot */}
      <Mascot currentFileCount={files.length} lastAction={lastAction} />

      {/* Glassmorphism Premium Footer */}
      <Footer onNavigate={(tab) => setActiveTab(tab)} />
    </div>
  );
}
