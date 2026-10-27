import { VideoFormData } from '../types';

export const PRESETS: Record<string, VideoFormData> = {
  ad_network: {
    brandName: 'GGD Ad Network',
    tagline: 'Helping Businesses Grow.',
    headline: 'Grow Your Business With GGD Ad Network!',
    problemLine: 'Stop relying only on people who already know your business.',
    introSentence: 'We connect your brand directly to thousands of active customers every day.',
    features: [
      { id: '1', title: 'Targeted Reach', subtitle: 'Reach verified local WhatsApp & social buyers', icon: 'people' },
      { id: '2', title: 'Daily Status Blasts', subtitle: 'Guaranteed 20,000+ targeted daily views', icon: 'status' },
      { id: '3', title: 'Smart Network', subtitle: 'Multi-channel distribution across verified creators', icon: 'network' },
      { id: '4', title: 'High Conversion', subtitle: 'Proven direct click-to-WhatsApp chats', icon: 'coin' },
      { id: '5', title: 'Instant Notification', subtitle: 'Real-time campaign analytics & report', icon: 'bell' },
    ],
    offerText: 'Introductory campaigns start from ₦3,000!',
    ctaText: 'Send us a message today to discuss your campaign.',
    primaryColor: '#059669', // Emerald
    accentColor: '#10b981', // Bright Green
    format: '9:16',
    duration: 30,
    enableMusic: true,
    enableSFX: true,
  },
  restaurant: {
    brandName: 'Golden Ember Bistro',
    tagline: 'Savor Every Moment.',
    headline: 'Hungry For Real Smoky Flavor?',
    problemLine: 'Tired of bland takeout and boring weekday dinners?',
    introSentence: 'Experience artisanal firewood grills, authentic spices, and doorstep delivery in 30 mins.',
    features: [
      { id: '1', title: 'Wood-Fired Grill', subtitle: 'Fresh cuts seasoned with signature house herbs', icon: 'coin' },
      { id: '2', title: 'Lightning Fast', subtitle: 'Piping hot delivery in under 30 minutes', icon: 'bell' },
      { id: '3', title: 'VIP Lounge Dining', subtitle: 'Chic ambiance for dates and family gatherings', icon: 'people' },
      { id: '4', title: 'Loyalty Rewards', subtitle: 'Get 20% cashback on your weekly orders', icon: 'status' },
    ],
    offerText: 'Get 25% OFF your first combo box with code: FEAST25',
    ctaText: 'Tap below to order on WhatsApp or reserve a table now!',
    primaryColor: '#d97706', // Amber orange
    accentColor: '#f59e0b', // Golden yellow
    format: '9:16',
    duration: 30,
    enableMusic: true,
    enableSFX: true,
  },
  online_store: {
    brandName: 'Luxe Threads Africa',
    tagline: 'Wear Your Confidence.',
    headline: 'Upgrade Your Wardrobe With Premium Styles!',
    problemLine: 'Tired of poor quality fabrics that fade after two washes?',
    introSentence: 'Discover limited-edition urban streetwear and luxury essentials crafted to last.',
    features: [
      { id: '1', title: '100% Organic Cotton', subtitle: 'Breathable, heavy-weight luxury fabrics', icon: 'shield' },
      { id: '2', title: 'Nationwide Delivery', subtitle: 'Dispatched same-day to your doorstep', icon: 'rocket' },
      { id: '3', title: 'Easy Exchanges', subtitle: '7-day hassle-free size replacement policy', icon: 'status' },
      { id: '4', title: 'Exclusive Drops', subtitle: 'New limited fashion collections every Friday', icon: 'bell' },
    ],
    offerText: 'Buy 2 Outfits & Get 1 Free + Free Express Shipping Today!',
    ctaText: 'Shop the collection today before stocks run out!',
    primaryColor: '#7c3aed', // Purple
    accentColor: '#ec4899', // Pink
    format: '9:16',
    duration: 30,
    enableMusic: true,
    enableSFX: true,
  },
};

export const DEFAULT_FORM_DATA: VideoFormData = PRESETS.ad_network;
