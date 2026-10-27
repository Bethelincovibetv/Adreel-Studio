import React from 'react';
import { X, Download, CheckCircle2, Film, AlertTriangle, ExternalLink, RefreshCw } from 'lucide-react';
import { ExportProgress, ExportResult } from '../engine/recorder';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  progress: ExportProgress;
  result: ExportResult | null;
  onRestartExport: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  progress,
  result,
  onRestartExport,
}) => {
  if (!isOpen) return null;

  const isComplete = progress.status === 'completed' && result !== null;
  const isError = progress.status === 'error';
  const isRecording = progress.status === 'recording' || progress.status === 'preparing' || progress.status === 'finalizing';

  const handleDownload = () => {
    if (!result) return;
    const a = document.createElement('a');
    a.href = result.url;
    a.download = result.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-5">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${isComplete ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-300'}`}>
              {isComplete ? <CheckCircle2 className="w-5 h-5" /> : <Film className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {isComplete ? 'Video Rendered Successfully!' : 'Rendering Promotional Video'}
              </h3>
              <p className="text-xs text-slate-400">
                {isComplete
                  ? 'Your video is ready to download and share'
                  : 'Synthesizing 2D canvas animation & Web Audio in real-time'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isRecording}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Recording in progress */}
        {isRecording && (
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">
                {progress.status === 'preparing' && 'Preparing timeline & audio stream...'}
                {progress.status === 'recording' && `Recording frames at 30 fps (${progress.currentSecond}s / ${progress.totalSeconds}s)`}
                {progress.status === 'finalizing' && 'Packaging audio and video tracks...'}
              </span>
              <span className="font-mono font-bold text-emerald-400">{progress.percent}%</span>
            </div>

            {/* Glowing progress bar */}
            <div className="w-full h-3 rounded-full bg-slate-950 p-0.5 border border-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-150 shadow-md shadow-emerald-500/30"
                style={{ width: `${progress.percent}%` }}
              />
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-400 space-y-1">
              <p className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                <span>Running deterministic Canvas 2D capture & audio mixer.</span>
              </p>
              <p className="text-[11px] text-slate-500">
                Please keep this browser tab open during recording to ensure smooth frame capture.
              </p>
            </div>
          </div>
        )}

        {/* Export Completed */}
        {isComplete && result && (
          <div className="space-y-4">
            {/* Video preview playback */}
            <div className="overflow-hidden rounded-xl bg-slate-950 border border-slate-800 aspect-video flex items-center justify-center">
              <video
                src={result.url}
                controls
                autoPlay
                loop
                className="w-full h-full object-contain"
              />
            </div>

            {/* Metadata badges */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-mono">
                {result.filename}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20 uppercase">
                {result.mimeType.split(';')[0]}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 font-mono">
                {(result.blob.size / (1024 * 1024)).toFixed(2)} MB
              </span>
            </div>

            {/* Note on WebM vs MP4 if applicable */}
            {!result.isMp4 && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-amber-300">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Tip for WhatsApp & Instagram sharing</span>
                </div>
                <p className="text-[11px] text-amber-200/90 leading-relaxed">
                  Your browser saved this video as a high-definition WebM file. If you need standard MP4 for WhatsApp Status or Instagram Reels, you can quickly convert it for free:
                </p>
                <a
                  href="https://cloudconvert.com/webm-to-mp4"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-100 font-semibold text-[11px] transition-colors"
                >
                  <span>Open CloudConvert WebM to MP4</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            {/* Download CTA Button */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onRestartExport}
                className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Re-record</span>
              </button>

              <button
                type="button"
                onClick={handleDownload}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/25 transition-all active:scale-95"
              >
                <Download className="w-4 h-4 text-slate-950" />
                <span>Download Video File</span>
              </button>
            </div>
          </div>
        )}

        {/* Error state */}
        {isError && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 space-y-3">
            <p className="font-semibold">{progress.errorMessage || 'An error occurred during video rendering.'}</p>
            <button
              onClick={onRestartExport}
              className="px-4 py-2 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-500 text-white"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
