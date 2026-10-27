import React from 'react';
import { Film, Sparkles, RotateCcw, Download, Wand2 } from 'lucide-react';
import { PRESETS } from '../data/presets';
import { VideoFormData } from '../types';

interface NavbarProps {
  onSelectPreset: (presetKey: string) => void;
  onReset: () => void;
  onOpenAIModal: () => void;
  onStartExport: () => void;
  isExporting: boolean;
  currentData: VideoFormData;
}

export const Navbar: React.FC<NavbarProps> = ({
  onSelectPreset,
  onReset,
  onOpenAIModal,
  onStartExport,
  isExporting,
  currentData,
}) => {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 shadow-lg shadow-emerald-500/25">
            <Film className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight text-white font-['Space_Grotesk']">
                AdReel <span className="text-emerald-400">Studio</span>
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                2D Promo Engine
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Animated social video generator for businesses
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {/* Preset templates dropdown / buttons */}
          <div className="hidden md:flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <span className="px-2 text-slate-400 font-semibold">Templates:</span>
            <button
              onClick={() => onSelectPreset('ad_network')}
              className="px-2.5 py-1 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
            >
              Ad Network
            </button>
            <button
              onClick={() => onSelectPreset('restaurant')}
              className="px-2.5 py-1 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
            >
              Restaurant
            </button>
            <button
              onClick={() => onSelectPreset('online_store')}
              className="px-2.5 py-1 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
            >
              Online Store
            </button>
          </div>

          {/* Write with AI button */}
          <button
            onClick={onOpenAIModal}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-violet-600 via-indigo-600 to-emerald-600 hover:from-violet-500 hover:to-emerald-500 text-white shadow-md shadow-violet-600/20 transition-all active:scale-95"
            title="Auto-write promotional video copy with Gemini AI"
          >
            <Wand2 className="w-4 h-4 text-emerald-200 animate-pulse" />
            <span>Write with AI</span>
          </button>

          {/* Reset button */}
          <button
            onClick={onReset}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 border border-slate-800 transition-colors"
            title="Reset form to default"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Render & Download button */}
          <button
            onClick={onStartExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/25 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4 text-slate-950" />
            <span className="hidden sm:inline">Render & Download</span>
            <span className="sm:hidden">Export</span>
          </button>
        </div>
      </div>
    </header>
  );
};
