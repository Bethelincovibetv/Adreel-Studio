import { VideoFormData, VideoFormat, SceneContext } from '../types';
import { drawBokehBackground, drawWipeTransition } from './drawHelpers';
import { drawScene1Hook } from '../scenes/scene1Hook';
import { drawScene2Problem } from '../scenes/scene2Problem';
import { drawScene3Features } from '../scenes/scene3Features';
import { drawScene4Offer } from '../scenes/scene4Offer';
import { drawScene5CTA } from '../scenes/scene5CTA';
import { clamp } from './easing';

export function getResolution(format: VideoFormat): { width: number; height: number } {
  switch (format) {
    case '9:16':
      return { width: 1080, height: 1920 };
    case '1:1':
      return { width: 1080, height: 1080 };
    case '16:9':
      return { width: 1920, height: 1080 };
    default:
      return { width: 1080, height: 1920 };
  }
}

export interface SceneTimeline {
  sceneIndex: number;
  startTime: number;
  endTime: number;
  duration: number;
}

export function calculateSceneTimeline(totalDuration: number): SceneTimeline[] {
  // Proportions: S1 20%, S2 25%, S3 25%, S4 15%, S5 15%
  const ratios = [0.20, 0.25, 0.25, 0.15, 0.15];
  const timeline: SceneTimeline[] = [];
  let currentStart = 0;

  for (let i = 0; i < ratios.length; i++) {
    const sceneDur = totalDuration * ratios[i];
    timeline.push({
      sceneIndex: i,
      startTime: currentStart,
      endTime: currentStart + sceneDur,
      duration: sceneDur,
    });
    currentStart += sceneDur;
  }

  return timeline;
}

export function renderFrame(
  ctx: CanvasRenderingContext2D,
  globalT: number,
  data: VideoFormData
) {
  const { width, height } = getResolution(data.format);
  const totalDuration = data.duration;
  const clampedT = clamp(globalT, 0, totalDuration);

  // Clear canvas
  ctx.clearRect(0, 0, width, height);

  // 1. Ambient Dynamic Bokeh Background (continuous across all scenes)
  drawBokehBackground(ctx, width, height, clampedT, data.primaryColor, data.accentColor);

  // 2. Timeline calculation
  const timeline = calculateSceneTimeline(totalDuration);

  // Find active scene
  let activeSceneIndex = 0;
  for (let i = 0; i < timeline.length; i++) {
    if (clampedT >= timeline[i].startTime && clampedT <= timeline[i].endTime) {
      activeSceneIndex = i;
      break;
    }
  }

  const activeScene = timeline[activeSceneIndex];
  const localT = clampedT - activeScene.startTime;

  const sceneContext: SceneContext = {
    ctx,
    t: localT,
    duration: activeScene.duration,
    globalT: clampedT,
    width,
    height,
    data,
    format: data.format,
  };

  // Draw Scene Content
  switch (activeSceneIndex) {
    case 0:
      drawScene1Hook(ctx, sceneContext);
      break;
    case 1:
      drawScene2Problem(ctx, sceneContext);
      break;
    case 2:
      drawScene3Features(ctx, sceneContext);
      break;
    case 3:
      drawScene4Offer(ctx, sceneContext);
      break;
    case 4:
      drawScene5CTA(ctx, sceneContext);
      break;
    default:
      drawScene1Hook(ctx, sceneContext);
  }

  // 3. Scene Transition Wipes (Green & White Wipe at transitions)
  const transitionWindow = 0.35; // duration of wipe
  timeline.forEach((sc, idx) => {
    if (idx > 0 && clampedT >= sc.startTime - transitionWindow && clampedT <= sc.startTime + transitionWindow) {
      const transProgress = (clampedT - (sc.startTime - transitionWindow)) / (transitionWindow * 2);
      drawWipeTransition(ctx, width, height, transProgress, data.primaryColor, data.accentColor);
    }
  });
}
