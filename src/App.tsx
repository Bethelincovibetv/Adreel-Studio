import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { VideoPlayer } from './components/VideoPlayer';
import { FormEditor } from './components/FormEditor';
import { AIPromptModal } from './components/AIPromptModal';
import { ExportModal } from './components/ExportModal';
import { DEFAULT_FORM_DATA, PRESETS } from './data/presets';
import { VideoFormData } from './types';
import { ExportProgress, ExportResult, renderAndRecordVideo } from './engine/recorder';
import { Sparkles, Film, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

export default function App() {
  const [formData, setFormData] = useState<VideoFormData>(DEFAULT_FORM_DATA);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportProgress, setExportProgress] = useState<ExportProgress>({
    percent: 0,
    currentSecond: 0,
    totalSeconds: 30,
    status: 'preparing',
  });
  const [exportResult, setExportResult] = useState<ExportResult | null>(null);

  // Switch template preset
  const handleSelectPreset = (presetKey: string) => {
    if (PRESETS[presetKey]) {
      setFormData({ ...PRESETS[presetKey] });
    }
  };

  // Reset to default
  const handleReset = () => {
    setFormData({ ...DEFAULT_FORM_DATA });
  };

  // Apply AI Copy
  const handleApplyAICopy = (updated: Partial<VideoFormData>) => {
    setFormData((prev) => ({
      ...prev,
      ...updated,
    }));
  };

  // Start video export & recording
  const handleStartExport = async () => {
    setIsExportModalOpen(true);
    setExportResult(null);

    try {
      const result = await renderAndRecordVideo(formData, (progress) => {
        setExportProgress(progress);
      });
      setExportResult(result);
    } catch (err: any) {
      console.error('Export failed:', err);
      setExportProgress((prev) => ({
        ...prev,
        status: 'error',
        errorMessage: err.message || 'Video recording failed. Please try again.',
      }));
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans'] selection:bg-emerald-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        onSelectPreset={handleSelectPreset}
        onReset={handleReset}
        onOpenAIModal={() => setIsAIModalOpen(true)}
        onStartExport={handleStartExport}
        isExporting={isExportModalOpen && exportProgress.status === 'recording'}
        currentData={formData}
      />

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8">
        {/* Quick Highlights / Banner Bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/20">
          <div className="flex items-center gap-3">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs sm:text-sm font-semibold text-slate-200">
              Editing: <span className="text-emerald-400 font-bold">{formData.brandName}</span>
            </span>
            <span className="text-xs text-slate-400 hidden md:inline">
              • {formData.format} ({formData.duration}s)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAIModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-violet-600/20 text-violet-300 border border-violet-500/30 hover:bg-violet-600/30 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              <span>Prompt AI Copy</span>
            </button>
            <button
              onClick={handleStartExport}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-colors"
            >
              <Film className="w-3.5 h-3.5" />
              <span>Export HD</span>
            </button>
          </div>
        </div>

        {/* Two-Column Responsive Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left Column: Form Editor (7 cols on desktop) */}
          <div className="lg:col-span-7 space-y-6 order-2 lg:order-1">
            <FormEditor
              data={formData}
              onChange={setFormData}
              onOpenAIModal={() => setIsAIModalOpen(true)}
            />
          </div>

          {/* Right Column: Live Player (5 cols on desktop, sticky) */}
          <div className="lg:col-span-5 order-1 lg:order-2 lg:sticky lg:top-24">
            <VideoPlayer
              data={formData}
              onStartExport={handleStartExport}
            />

            {/* Quick Tips Box below player */}
            <div className="mt-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-400 space-y-2">
              <div className="flex items-center gap-2 text-slate-200 font-bold">
                <Zap className="w-4 h-4 text-emerald-400" />
                <span>100% In-Browser 2D Video Engine</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Rendered frame-by-frame on HTML5 Canvas with vector graphics and Web Audio API synthesis. No external servers or rendering fees needed.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] font-medium text-slate-300">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> WhatsApp & TikTok ready
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> ₦ & multi-currency
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <AIPromptModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        onApplyCopy={handleApplyAICopy}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        progress={exportProgress}
        result={exportResult}
        onRestartExport={handleStartExport}
      />
    </div>
  );
}
