import { VideoFormData } from '../types';
import { renderFrame, getResolution, calculateSceneTimeline } from './renderer';
import { soundEngine } from '../audio/soundEngine';

export interface ExportProgress {
  percent: number;
  currentSecond: number;
  totalSeconds: number;
  status: 'preparing' | 'recording' | 'finalizing' | 'completed' | 'error';
  errorMessage?: string;
}

export interface ExportResult {
  blob: Blob;
  url: string;
  filename: string;
  mimeType: string;
  isMp4: boolean;
}

export function getSupportedMimeType(): { mimeType: string; extension: string; isMp4: boolean } {
  const types = [
    { mime: 'video/mp4;codecs=avc1,mp4a.40.2', ext: 'mp4', isMp4: true },
    { mime: 'video/mp4', ext: 'mp4', isMp4: true },
    { mime: 'video/webm;codecs=vp9,opus', ext: 'webm', isMp4: false },
    { mime: 'video/webm;codecs=vp8,opus', ext: 'webm', isMp4: false },
    { mime: 'video/webm', ext: 'webm', isMp4: false },
  ];

  for (const t of types) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(t.mime)) {
      return { mimeType: t.mime, extension: t.ext, isMp4: t.isMp4 };
    }
  }

  return { mimeType: 'video/webm', extension: 'webm', isMp4: false };
}

export async function renderAndRecordVideo(
  data: VideoFormData,
  onProgress: (progress: ExportProgress) => void
): Promise<ExportResult> {
  const { width, height } = getResolution(data.format);
  const totalDuration = data.duration;
  const fps = 30;

  // 1. Offscreen canvas for pristine export rendering
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) throw new Error('Could not get 2D canvas context for export');

  onProgress({
    percent: 0,
    currentSecond: 0,
    totalSeconds: totalDuration,
    status: 'preparing',
  });

  // 2. Setup video stream from canvas
  const canvasStream = canvas.captureStream(fps);

  // 3. Setup audio stream
  soundEngine.init();
  soundEngine.setToggles(data.enableMusic, data.enableSFX);
  const audioStream = soundEngine.getAudioStream();

  // Combine video and audio tracks
  const combinedTracks: MediaStreamTrack[] = [...canvasStream.getVideoTracks()];
  if (audioStream) {
    const audioTrack = audioStream.getAudioTracks()[0];
    if (audioTrack) {
      combinedTracks.push(audioTrack);
    }
  }

  const combinedStream = new MediaStream(combinedTracks);
  const { mimeType, extension, isMp4 } = getSupportedMimeType();

  const options: MediaRecorderOptions = {
    mimeType,
    videoBitsPerSecond: 8000000, // 8 Mbps high crisp quality
  };

  const chunks: Blob[] = [];
  let mediaRecorder: MediaRecorder;
  try {
    mediaRecorder = new MediaRecorder(combinedStream, options);
  } catch (err) {
    // Fallback if specific bitrate fails
    mediaRecorder = new MediaRecorder(combinedStream);
  }

  mediaRecorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) {
      chunks.push(e.data);
    }
  };

  return new Promise<ExportResult>((resolve, reject) => {
    mediaRecorder.onerror = (e) => {
      soundEngine.stopPlayback();
      reject(new Error(`Recording error: ${(e as any).error || 'unknown'}`));
    };

    mediaRecorder.onstop = () => {
      soundEngine.stopPlayback();
      onProgress({
        percent: 100,
        currentSecond: totalDuration,
        totalSeconds: totalDuration,
        status: 'finalizing',
      });

      const blob = new Blob(chunks, { type: mimeType });
      const url = URL.createObjectURL(blob);
      const cleanBrand = data.brandName.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 20) || 'promo';
      const filename = `adreel-${cleanBrand}-${data.format.replace(':', 'x')}.${extension}`;

      onProgress({
        percent: 100,
        currentSecond: totalDuration,
        totalSeconds: totalDuration,
        status: 'completed',
      });

      resolve({
        blob,
        url,
        filename,
        mimeType,
        isMp4,
      });
    };

    // Start recording
    mediaRecorder.start(250); // Timeslice 250ms chunks

    // Start audio playback
    if (data.enableMusic) {
      soundEngine.startPlayback();
    }

    // Schedule SFX events along timeline
    const timeline = calculateSceneTimeline(totalDuration);
    const scheduledSfxTimes = new Set<string>();

    const startTime = performance.now();
    let currentT = 0;

    const frameStep = 1 / fps; // 33.33ms

    const intervalTimer = window.setInterval(() => {
      const elapsed = (performance.now() - startTime) / 1000;
      currentT = Math.min(elapsed, totalDuration);

      // Render frame
      renderFrame(ctx, currentT, data);

      // Check transition SFX
      timeline.forEach((sc, idx) => {
        if (idx > 0) {
          const key = `whoosh-${idx}`;
          if (!scheduledSfxTimes.has(key) && currentT >= sc.startTime - 0.2) {
            scheduledSfxTimes.add(key);
            soundEngine.playWhoosh();
          }
        }
      });

      // Scene 3 card pops
      if (currentT >= timeline[2].startTime && currentT <= timeline[2].endTime) {
        const localT = currentT - timeline[2].startTime;
        const count = data.features.length || 4;
        const timePerCard = (timeline[2].duration - 0.8) / count;
        for (let i = 0; i < count; i++) {
          const cardStart = 0.4 + i * timePerCard;
          const key = `card-${i}`;
          if (!scheduledSfxTimes.has(key) && localT >= cardStart) {
            scheduledSfxTimes.add(key);
            soundEngine.playPop();
          }
        }
      }

      // Scene 4 chime
      if (currentT >= timeline[3].startTime) {
        const key = 'offer-chime';
        if (!scheduledSfxTimes.has(key) && currentT >= timeline[3].startTime + 0.3) {
          scheduledSfxTimes.add(key);
          soundEngine.playChime();
        }
      }

      const percent = Math.floor((currentT / totalDuration) * 100);
      onProgress({
        percent,
        currentSecond: parseFloat(currentT.toFixed(1)),
        totalSeconds: totalDuration,
        status: 'recording',
      });

      if (currentT >= totalDuration) {
        clearInterval(intervalTimer);
        // Small delay to flush final frames
        setTimeout(() => {
          mediaRecorder.stop();
        }, 300);
      }
    }, 1000 / fps);
  });
}
