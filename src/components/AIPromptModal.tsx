import React, { useState } from 'react';
import { X, Wand2, Sparkles, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { VideoFormData } from '../types';

interface AIPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyCopy: (generated: Partial<VideoFormData>) => void;
}

const QUICK_PROMPTS = [
  'Digital Ad Network delivering 50,000+ daily views on WhatsApp Status and TikTok',
  'Authentic smoky BBQ & grill restaurant with 30-min express home delivery',
  'Luxury urban fashion boutique selling limited-edition sneakers & hoodies',
  'Modern real estate agency selling affordable luxury serviced apartments',
  'Full-service hair & nail beauty salon with luxury spa packages',
  'Gym & fitness club offering 30-day weight loss body transformation challenge',
];

export const AIPromptModal: React.FC<AIPromptModalProps> = ({ isOpen, onClose, onApplyCopy }) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async (promptText?: string) => {
    const textToUse = (promptText || prompt).trim();
    if (!textToUse) {
      setError('Please enter a short description of your business');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/generate-copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: textToUse }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${res.status}`);
      }

      const data = await res.json();

      // Transform features into proper structure
      const formattedFeatures = (data.features || []).map((f: any, idx: number) => ({
        id: (idx + 1).toString(),
        title: f.title || `Benefit ${idx + 1}`,
        subtitle: f.subtitle || '',
        icon: ['people', 'status', 'network', 'coin', 'bell', 'rocket'][idx % 6],
      }));

      onApplyCopy({
        brandName: data.brandName,
        tagline: data.tagline,
        headline: data.headline,
        problemLine: data.problemLine,
        introSentence: data.introSentence,
        features: formattedFeatures.length >= 3 ? formattedFeatures : undefined,
        offerText: data.offerText,
        ctaText: data.ctaText,
        primaryColor: data.primaryColor || '#059669',
        accentColor: data.accentColor || '#10b981',
      });

      onClose();
    } catch (err: any) {
      console.warn('Gemini API call failed, offering fallback generator:', err);
      // Smart Fallback generator if API key is not configured or network error occurs
      setError(
        err.message?.includes('GEMINI_API_KEY')
          ? 'Notice: GEMINI_API_KEY is not configured in Secrets. Generating instant copy using our local marketing engine instead!'
          : `Notice: ${err.message}. Using built-in high converting marketing engine!`
      );

      // Generate smart local template based on keywords
      setTimeout(() => {
        const fallback = generateSmartFallback(textToUse);
        onApplyCopy(fallback);
        onClose();
      }, 1200);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30">
              <Wand2 className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Write Promo with Gemini AI</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                  AI Studio
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Describe your business and AI will create high-converting video copy in seconds
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input prompt */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300">
            Tell us about your business, product, or offer:
          </label>
          <textarea
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. A fast-growing WhatsApp marketing agency that helps fashion brands and restaurants get 5,000+ targeted local buyers every weekend..."
            className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-violet-500 transition-colors resize-none placeholder:text-slate-600"
          />
        </div>

        {/* Quick prompt suggestions */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold text-slate-400">Or pick an inspiration:</span>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_PROMPTS.map((qp, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setPrompt(qp);
                  handleGenerate(qp);
                }}
                className="text-left text-xs px-2.5 py-1.5 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-violet-500/50 hover:bg-slate-800/60 text-slate-300 transition-all"
              >
                {qp.slice(0, 42)}...
              </button>
            ))}
          </div>
        </div>

        {/* Status / Error display */}
        {error && (
          <div className="p-3 rounded-xl bg-violet-950/40 border border-violet-500/30 flex items-start gap-2 text-xs text-violet-200">
            <AlertCircle className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleGenerate()}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-violet-600 to-emerald-600 hover:from-violet-500 hover:to-emerald-500 text-white shadow-lg shadow-violet-600/30 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Crafting Video Script...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Video Copy</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Intelligent fallback helper if Gemini API key is not yet set up
function generateSmartFallback(input: string): Partial<VideoFormData> {
  const words = input.toLowerCase();
  const isFood = words.includes('food') || words.includes('restaurant') || words.includes('bbq') || words.includes('cafe');
  const isFashion = words.includes('fashion') || words.includes('cloth') || words.includes('boutique') || words.includes('sneaker');
  const isFitness = words.includes('fitness') || words.includes('gym') || words.includes('workout') || words.includes('training');

  if (isFood) {
    return {
      brandName: 'Savory Fire Bistro',
      tagline: 'Taste The Pure Perfection.',
      headline: 'Craving The Best Sizzling Flavors?',
      problemLine: 'Tired of waiting hours for cold, soggy takeout food?',
      introSentence: 'We prepare fresh wood-fired dishes and deliver hot to your doorstep in 30 mins.',
      features: [
        { id: '1', title: 'Fresh Daily Cuts', subtitle: 'Marinated in signature artisanal spices', icon: 'coin' },
        { id: '2', title: 'Express Delivery', subtitle: 'Piping hot at your door in 30 minutes', icon: 'bell' },
        { id: '3', title: 'VIP Combo Deals', subtitle: 'Huge family platters starting at great prices', icon: 'people' },
        { id: '4', title: '5-Star Taste', subtitle: 'Loved by over 10,000 foodies across town', icon: 'status' },
      ],
      offerText: 'Order Today & Get Free Delivery + 20% Off Code: FEAST20',
      ctaText: 'Tap below to order your favorite meal right now!',
      primaryColor: '#ea580c',
      accentColor: '#f59e0b',
    };
  }

  if (isFashion) {
    return {
      brandName: 'Vanguard Streetwear',
      tagline: 'Elevate Your Everyday Style.',
      headline: 'Step Out In Exclusive Premium Fashion!',
      problemLine: 'Tired of generic fast fashion that looks dull and fades quickly?',
      introSentence: 'We create luxury streetwear designed for lasting comfort, confidence, and flair.',
      features: [
        { id: '1', title: 'Heavyweight Cotton', subtitle: '100% premium breathable fabrics', icon: 'shield' },
        { id: '2', title: 'Fast Nationwide Delivery', subtitle: 'Dispatched to your door in 48 hours', icon: 'rocket' },
        { id: '3', title: 'Limited Drops', subtitle: 'Exclusive batch releases every week', icon: 'status' },
        { id: '4', title: 'Easy Returns', subtitle: '100% money-back size guarantee', icon: 'bell' },
      ],
      offerText: 'Special Launch Promo: Buy 2 Fits & Get 1 Free Today!',
      ctaText: 'Send us a message now to claim your limited piece.',
      primaryColor: '#7c3aed',
      accentColor: '#ec4899',
    };
  }

  // Default Business booster
  const brandFromInput = input.split(' ')[0] ? input.split(' ')[0].replace(/[^a-zA-Z]/g, '') : 'GrowthHub';
  return {
    brandName: brandFromInput ? `${brandFromInput} Media` : 'AdVantage Pro',
    tagline: 'Helping Businesses Grow.',
    headline: `Grow Your Business With ${brandFromInput || 'Our Team'}!`,
    problemLine: 'Stop relying only on people who already know your business.',
    introSentence: 'We connect your brand directly to thousands of verified customers every single day.',
    features: [
      { id: '1', title: 'Targeted Reach', subtitle: 'Connect with active local buyers instantly', icon: 'people' },
      { id: '2', title: 'Guaranteed Views', subtitle: 'Over 20,000+ verified daily impressions', icon: 'status' },
      { id: '3', title: 'High Conversion', subtitle: 'Direct clicks straight to your WhatsApp', icon: 'coin' },
      { id: '4', title: 'Real-time Reports', subtitle: 'Transparent analytics on every campaign', icon: 'bell' },
    ],
    offerText: 'Introductory campaigns start from ₦3,000!',
    ctaText: 'Send us a message today to launch your campaign.',
    primaryColor: '#059669',
    accentColor: '#10b981',
  };
}
