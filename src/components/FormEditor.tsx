import React from 'react';
import {
  Sparkles,
  Palette,
  Clock,
  Smartphone,
  Plus,
  Trash2,
  Music,
  Volume2,
  DollarSign,
  Tag,
  HelpCircle,
} from 'lucide-react';
import { VideoFormData, FeatureItem, VideoFormat, VideoDuration } from '../types';

interface FormEditorProps {
  data: VideoFormData;
  onChange: (updated: VideoFormData) => void;
  onOpenAIModal: () => void;
}

const COLOR_PRESETS = [
  { name: 'Emerald & Mint', primary: '#059669', accent: '#10b981' },
  { name: 'Amber & Gold', primary: '#d97706', accent: '#f59e0b' },
  { name: 'Purple & Pink', primary: '#7c3aed', accent: '#ec4899' },
  { name: 'Ocean & Cyan', primary: '#0284c7', accent: '#06b6d4' },
  { name: 'Crimson & Coral', primary: '#dc2626', accent: '#fb7185' },
  { name: 'Dark Indigo & Neon', primary: '#4338ca', accent: '#38bdf8' },
];

export const FormEditor: React.FC<FormEditorProps> = ({ data, onChange, onOpenAIModal }) => {
  const updateField = <K extends keyof VideoFormData>(field: K, value: VideoFormData[K]) => {
    onChange({ ...data, [field]: value });
  };

  const handleFeatureChange = (index: number, key: keyof FeatureItem, val: string) => {
    const updated = [...data.features];
    updated[index] = { ...updated[index], [key]: val };
    updateField('features', updated);
  };

  const addFeature = () => {
    if (data.features.length >= 6) return;
    const newId = (data.features.length + 1).toString();
    const icons: FeatureItem['icon'][] = ['people', 'status', 'network', 'coin', 'bell', 'rocket', 'shield'];
    const chosenIcon = icons[data.features.length % icons.length];
    updateField('features', [
      ...data.features,
      { id: newId, title: 'New Benefit', subtitle: 'Brief description of advantage', icon: chosenIcon },
    ]);
  };

  const removeFeature = (index: number) => {
    if (data.features.length <= 3) return; // Keep minimum 3
    const updated = data.features.filter((_, i) => i !== index);
    updateField('features', updated);
  };

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-y-auto max-h-[85vh]">
      {/* Header section with AI quick button */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Video Content & Style</span>
          </h2>
          <p className="text-xs text-slate-400">
            Customize copy, brand colors, format, and benefits
          </p>
        </div>
        <button
          onClick={onOpenAIModal}
          type="button"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Write with AI</span>
        </button>
      </div>

      {/* 1. Format & Duration Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
        <div>
          <label className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span>Aspect Ratio</span>
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {(['9:16', '1:1', '16:9'] as VideoFormat[]).map((fmt) => (
              <button
                key={fmt}
                type="button"
                onClick={() => updateField('format', fmt)}
                className={`py-1.5 px-2 text-xs font-bold rounded-lg border transition-all ${
                  data.format === fmt
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {fmt === '9:16' && 'Vertical (9:16)'}
                {fmt === '1:1' && 'Square (1:1)'}
                {fmt === '16:9' && 'Landscape (16:9)'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Duration</span>
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {([20, 30, 40] as VideoDuration[]).map((dur) => (
              <button
                key={dur}
                type="button"
                onClick={() => updateField('duration', dur)}
                className={`py-1.5 px-2 text-xs font-bold rounded-lg border transition-all ${
                  data.duration === dur
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {dur}s
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Brand Identity */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
          <span>1. Brand Identity</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Brand Name
            </label>
            <input
              type="text"
              value={data.brandName}
              onChange={(e) => updateField('brandName', e.target.value)}
              placeholder="e.g. GGD Ad Network"
              className="w-full px-3 py-2 text-sm rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Tagline / Slogan
            </label>
            <input
              type="text"
              value={data.tagline}
              onChange={(e) => updateField('tagline', e.target.value)}
              placeholder="e.g. Helping Businesses Grow."
              className="w-full px-3 py-2 text-sm rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* 3. Opening Hook & Problem / Solution */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
          <span>2. Narrative & Hook</span>
        </h3>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Hook Headline (Scene 1)
          </label>
          <input
            type="text"
            value={data.headline}
            onChange={(e) => updateField('headline', e.target.value)}
            placeholder="e.g. Grow Your Business With GGD Ad Network!"
            className="w-full px-3 py-2 text-sm rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Customer Problem Line (Scene 2)
          </label>
          <input
            type="text"
            value={data.problemLine}
            onChange={(e) => updateField('problemLine', e.target.value)}
            placeholder="e.g. Stop relying only on people who already know your business."
            className="w-full px-3 py-2 text-sm rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Solution Intro (Scene 2 Transition)
          </label>
          <textarea
            rows={2}
            value={data.introSentence}
            onChange={(e) => updateField('introSentence', e.target.value)}
            placeholder="e.g. We connect your brand directly to thousands of active customers every day."
            className="w-full px-3 py-2 text-sm rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500 transition-colors resize-none"
          />
        </div>
      </div>

      {/* 4. Features & Benefits (3 to 6) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            <span>3. Key Features / Benefits ({data.features.length}/6)</span>
          </h3>
          {data.features.length < 6 && (
            <button
              type="button"
              onClick={addFeature}
              className="flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Feature</span>
            </button>
          )}
        </div>

        <div className="space-y-2.5">
          {data.features.map((feat, idx) => (
            <div
              key={feat.id || idx}
              className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-2.5"
            >
              <div className="pt-1">
                <select
                  value={feat.icon || 'status'}
                  onChange={(e) => handleFeatureChange(idx, 'icon', e.target.value)}
                  className="px-2 py-1 text-xs rounded-lg bg-slate-900 border border-slate-700 text-slate-300 focus:outline-none"
                  title="Select icon"
                >
                  <option value="status">Story Ring</option>
                  <option value="people">People Group</option>
                  <option value="network">Network Nodes</option>
                  <option value="coin">Currency Coin (₦)</option>
                  <option value="bell">Notification Bell</option>
                  <option value="rocket">Rocket Boost</option>
                  <option value="shield">Security Shield</option>
                </select>
              </div>

              <div className="flex-1 space-y-1.5">
                <input
                  type="text"
                  value={feat.title}
                  onChange={(e) => handleFeatureChange(idx, 'title', e.target.value)}
                  placeholder="Feature Title (e.g. Targeted Reach)"
                  className="w-full px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                />
                <input
                  type="text"
                  value={feat.subtitle}
                  onChange={(e) => handleFeatureChange(idx, 'subtitle', e.target.value)}
                  placeholder="Short explanation (e.g. Reach verified local buyers)"
                  className="w-full px-2.5 py-1 text-xs rounded-lg bg-slate-900 border border-slate-800 text-slate-300 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {data.features.length > 3 && (
                <button
                  type="button"
                  onClick={() => removeFeature(idx)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-900 transition-colors"
                  title="Remove feature"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 5. Offer & Call to Action */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
          <span>4. Offer & Call to Action</span>
        </h3>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Offer / Price Text (Scene 4)
          </label>
          <div className="relative">
            <input
              type="text"
              value={data.offerText}
              onChange={(e) => updateField('offerText', e.target.value)}
              placeholder="e.g. Introductory campaigns start from ₦3,000!"
              className="w-full px-3 py-2 text-sm rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[11px] text-slate-500">Quick currency symbol insert:</span>
            <button
              type="button"
              onClick={() => updateField('offerText', `${data.offerText} ₦`)}
              className="px-2 py-0.5 text-xs font-bold rounded bg-slate-800 text-emerald-400 hover:bg-slate-700"
            >
              + ₦ (Naira)
            </button>
            <button
              type="button"
              onClick={() => updateField('offerText', `${data.offerText} $`)}
              className="px-2 py-0.5 text-xs font-bold rounded bg-slate-800 text-emerald-400 hover:bg-slate-700"
            >
              + $ (USD)
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Call to Action (Scene 5 Button)
          </label>
          <input
            type="text"
            value={data.ctaText}
            onChange={(e) => updateField('ctaText', e.target.value)}
            placeholder="e.g. Send us a message today to discuss your campaign."
            className="w-full px-3 py-2 text-sm rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>
      </div>

      {/* 6. Brand Colors & Audio Controls */}
      <div className="space-y-3 border-t border-slate-800 pt-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5" />
          <span>5. Theme Colors & Audio</span>
        </h3>

        {/* Color Palette Presets */}
        <div className="flex flex-wrap gap-2 mb-2">
          {COLOR_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                updateField('primaryColor', preset.primary);
                updateField('accentColor', preset.accent);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors"
            >
              <div className="flex -space-x-1">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.primary }} />
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.accent }} />
              </div>
              <span className="text-[11px] text-slate-300">{preset.name}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Primary Brand Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={data.primaryColor}
                onChange={(e) => updateField('primaryColor', e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
              />
              <input
                type="text"
                value={data.primaryColor}
                onChange={(e) => updateField('primaryColor', e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg bg-slate-950 border border-slate-800 text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Accent Vibrant Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={data.accentColor}
                onChange={(e) => updateField('accentColor', e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
              />
              <input
                type="text"
                value={data.accentColor}
                onChange={(e) => updateField('accentColor', e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg bg-slate-950 border border-slate-800 text-white"
              />
            </div>
          </div>
        </div>

        {/* Audio Toggles */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
            <input
              type="checkbox"
              checked={data.enableMusic}
              onChange={(e) => updateField('enableMusic', e.target.checked)}
              className="w-4 h-4 rounded text-emerald-500 focus:ring-0 accent-emerald-500"
            />
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-200">
              <Music className="w-3.5 h-3.5 text-emerald-400" />
              <span>Background Music</span>
            </div>
          </label>

          <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
            <input
              type="checkbox"
              checked={data.enableSFX}
              onChange={(e) => updateField('enableSFX', e.target.checked)}
              className="w-4 h-4 rounded text-emerald-500 focus:ring-0 accent-emerald-500"
            />
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-200">
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sound Effects</span>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
};
