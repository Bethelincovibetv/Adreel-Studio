export type VideoFormat = '9:16' | '1:1' | '16:9';
export type VideoDuration = 20 | 30 | 40;

export interface FeatureItem {
  id: string;
  title: string;
  subtitle: string;
  icon?: 'status' | 'people' | 'network' | 'coin' | 'bell' | 'rocket' | 'shield';
}

export interface VideoFormData {
  brandName: string;
  tagline: string;
  headline: string;
  problemLine: string;
  introSentence: string;
  features: FeatureItem[];
  offerText: string;
  ctaText: string;
  primaryColor: string;
  accentColor: string;
  format: VideoFormat;
  duration: VideoDuration;
  enableMusic: boolean;
  enableSFX: boolean;
}

export interface CanvasDimensions {
  width: number;
  height: number;
  scale: number;
}

export interface SceneContext {
  ctx: CanvasRenderingContext2D;
  t: number;          // local time in scene (0 -> duration)
  duration: number;   // local scene duration
  globalT: number;    // global timeline time (0 -> totalDuration)
  width: number;
  height: number;
  data: VideoFormData;
  format: VideoFormat;
}
