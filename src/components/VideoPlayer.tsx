import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Maximize2, Sparkles, Layers } from 'lucide-react';
import { VideoFormData } from '../types';
import { renderFrame, getResolution, calculateSceneTimeline } from '../engine/renderer';
import { soundEngine } from '../audio/soundEngine';

interface VideoPlayerProps {
  data: VideoFormData;
  onStartExport: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ data, onStartExport }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [currentTime, setCurrentTime] = useState<number>(0);
  const currentTimeRef = useRef<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(!data.enableMusic);

  const animationFrameRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number | null>(null);

  const { width, height } = getResolution(data.format);
  const totalDuration = data.duration;
  const timeline = calculateSceneTimeline(totalDuration);

  // Sync audio toggles
  useEffect(() => {
    soundEngine.setToggles(data.enableMusic && !isAudioMuted, data.enableSFX && !isAudioMuted);
  }, [data.enableMusic, data.enableSFX, isAudioMuted]);

  // Handle Play/Pause
  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => {
      const next = !prev;
      if (next) {
        if (data.enableMusic && !isAudioMuted) {
          soundEngine.startPlayback();
        }
      } else {
        soundEngine.stopPlayback();
      }
      return next;
    });
  }, [data.enableMusic, isAudioMuted]);

  const handleRestart = useCallback(() => {
    currentTimeRef.current = 0;
    setCurrentTime(0);
    setIsPlaying(true);
    if (data.enableMusic && !isAudioMuted) {
      soundEngine.startPlayback();
    }
  }, [data.enableMusic, isAudioMuted]);

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newT = parseFloat(e.target.value);
    currentTimeRef.current = newT;
    setCurrentTime(newT);
  };

  const jumpToScene = (startTime: number) => {
    currentTimeRef.current = startTime;
    setCurrentTime(startTime);
    if (!isPlaying) {
      setIsPlaying(true);
      if (data.enableMusic && !isAudioMuted) {
        soundEngine.startPlayback();
      }
    }
  };

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const loop = (timestamp: number) => {
      if (lastTimestampRef.current === null) {
        lastTimestampRef.current = timestamp;
      }

      const delta = (timestamp - lastTimestampRef.current) / 1000;
      lastTimestampRef.current = timestamp;

      if (isPlaying) {
        currentTimeRef.current += delta;
        if (currentTimeRef.current >= totalDuration) {
          currentTimeRef.current = 0; // loop
        }
        setCurrentTime(currentTimeRef.current);
      }

      renderFrame(ctx, currentTimeRef.current, data);
      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      lastTimestampRef.current = null;
    };
  }, [isPlaying, data, totalDuration]);

  // Audio start on mount if playing
  useEffect(() => {
    if (isPlaying && data.enableMusic && !isAudioMuted) {
      soundEngine.startPlayback();
    }
    return () => {
      soundEngine.stopPlayback();
    };
  }, [isPlaying, data.enableMusic, isAudioMuted]);

  // Current active scene
  const activeSceneIndex = timeline.findIndex(
    (sc) => currentTime >= sc.startTime && currentTime <= sc.endTime
  );

  const sceneNames = [
    { title: 'Hook', desc: 'Headline & Rocket' },
    { title: 'Problem', desc: 'Shop & Customers' },
    { title: 'Features', desc: 'Benefit Cards' },
    { title: 'Offer', desc: 'Price Starburst' },
    { title: 'CTA', desc: 'Chat & Contact' },
  ];

  // Aspect ratio class calculation for responsive preview frame
  const getAspectClass = () => {
    switch (data.format) {
      case '9:16':
        return 'aspect-[9/16] max-h-[72vh] max-w-[380px]';
      case '1:1':
        return 'aspect-square max-h-[66vh] max-w-[500px]';
      case '16:9':
        return 'aspect-[16/9] max-h-[60vh] max-w-[700px]';
      default:
        return 'aspect-[9/16] max-h-[72vh] max-w-[380px]';
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center justify-center p-3 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl relative"
    >
      {/* Top Scene Chapter Tabs */}
      <div className="w-full flex items-center justify-between gap-1.5 mb-3 overflow-x-auto pb-1 text-xs">
        <div className="flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400 font-semibold text-[11px] hidden sm:inline">Scenes:</span>
        </div>
        <div className="flex items-center gap-1.5 flex-1 max-w-xl">
          {timeline.map((scene, idx) => {
            const isActive = activeSceneIndex === idx;
            return (
              <button
                key={idx}
                onClick={() => jumpToScene(scene.startTime)}
                className={`flex-1 py-1 px-2 rounded-lg text-center transition-all ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20 scale-105'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <div className="text-[11px] leading-tight truncate">
                  {idx + 1}. {sceneNames[idx]?.title}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Canvas Viewport Frame */}
      <div className="relative flex items-center justify-center w-full my-auto overflow-hidden rounded-xl bg-slate-950 shadow-inner border border-slate-800/60">
        <div className={`relative w-full mx-auto flex items-center justify-center ${getAspectClass()}`}>
          <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className="w-full h-full object-contain rounded-lg shadow-2xl cursor-pointer"
            onClick={togglePlay}
          />

          {/* Quick Overlay Play status if paused */}
          {!isPlaying && (
            <div
              onClick={togglePlay}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] flex items-center justify-center cursor-pointer transition-opacity"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-xl shadow-emerald-500/30 scale-110 hover:scale-125 transition-transform">
                <Play className="w-8 h-8 fill-current ml-1" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Scrub Bar & Controls */}
      <div className="w-full mt-4 space-y-2">
        {/* Progress Slider */}
        <div className="relative flex items-center group">
          <input
            type="range"
            min="0"
            max={totalDuration}
            step="0.05"
            value={currentTime}
            onChange={handleScrub}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400 hover:accent-emerald-300 transition-all focus:outline-none"
          />
        </div>

        {/* Player Buttons Bar */}
        <div className="flex items-center justify-between text-slate-300 pt-1">
          {/* Left: Play/Pause/Restart & Time */}
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="p-2 rounded-xl bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-white transition-all active:scale-95"
              title={isPlaying ? 'Pause video' : 'Play video'}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
            </button>

            <button
              onClick={handleRestart}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
              title="Restart from beginning"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <div className="text-xs font-mono font-medium text-slate-400">
              <span className="text-emerald-400 font-bold">{formatTime(currentTime)}</span>
              <span className="mx-1 text-slate-600">/</span>
              <span>{formatTime(totalDuration)}</span>
            </div>
          </div>

          {/* Right: Sound, Format & Fullscreen */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAudioMuted(!isAudioMuted)}
              className={`p-2 rounded-xl border transition-colors ${
                isAudioMuted
                  ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                  : 'bg-slate-800 border-slate-700 text-emerald-400'
              }`}
              title={isAudioMuted ? 'Unmute music & sound' : 'Mute music & sound'}
            >
              {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <span className="text-[11px] font-bold px-2 py-1 rounded-md bg-slate-800 text-slate-400 uppercase">
              {data.format}
            </span>

            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all hidden sm:block"
              title="Fullscreen preview"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
