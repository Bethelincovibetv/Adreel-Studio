import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

function geminiApiPlugin(): Plugin {
  return {
    name: 'gemini-copy-api',
    configureServer(server) {
      server.middlewares.use('/api/generate-copy', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let bodyStr = '';
        req.on('data', (chunk) => {
          bodyStr += chunk;
        });

        req.on('end', async () => {
          try {
            const body = JSON.parse(bodyStr || '{}');
            const userPrompt = body.prompt || body.businessType;
            if (!userPrompt || typeof userPrompt !== 'string' || !userPrompt.trim()) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Please provide a business description or industry' }));
              return;
            }

            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) {
              res.statusCode = 503;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                error: 'GEMINI_API_KEY is not configured on the server. Please add your key in Settings > Secrets.',
              }));
              return;
            }

            const { GoogleGenAI, Type } = await import('@google/genai');
            const ai = new GoogleGenAI({
              apiKey,
              httpOptions: {
                headers: {
                  'User-Agent': 'aistudio-build',
                },
              },
            });

            const response = await ai.models.generateContent({
              model: 'gemini-3.8-flash',
              contents: `You are an elite video copywriter for high-converting social media animated video ads (TikTok, Instagram Reels, WhatsApp Status, YouTube Shorts).
Create snappy, punchy, concise promotional video copy based on this business description: "${userPrompt.trim()}".
Make the headline punchy, the problem relatable, the features distinct (3 to 5 features, each with a 2-4 word title and a concise 4-8 word subtitle), an enticing offer/pricing line (support currency like ₦, $, or relevant local currency if indicated), and an inspiring call to action. Recommend two complementary, professional brand colors (hex codes).`,
              config: {
                responseMimeType: 'application/json',
                responseSchema: {
                  type: Type.OBJECT,
                  properties: {
                    brandName: { type: Type.STRING, description: 'Brand or business name' },
                    tagline: { type: Type.STRING, description: 'Short memorable slogan' },
                    headline: { type: Type.STRING, description: 'Punchy hook headline for opening scene' },
                    problemLine: { type: Type.STRING, description: 'Relatable customer pain point' },
                    introSentence: { type: Type.STRING, description: 'One clear sentence on how the business solves it' },
                    features: {
                      type: Type.ARRAY,
                      description: '3 to 5 key features or benefits',
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          title: { type: Type.STRING, description: 'Short feature title (2-4 words)' },
                          subtitle: { type: Type.STRING, description: 'Quick benefit explanation (4-8 words)' },
                        },
                        required: ['title', 'subtitle'],
                      },
                    },
                    offerText: { type: Type.STRING, description: 'Special pricing, discount or introductory offer (e.g. Introductory campaigns start from ₦3,000!)' },
                    ctaText: { type: Type.STRING, description: 'Clear action step (e.g. Send us a message today to discuss your campaign)' },
                    primaryColor: { type: Type.STRING, description: 'Primary hex brand color e.g. #059669' },
                    accentColor: { type: Type.STRING, description: 'Vibrant accent hex color e.g. #10b981' },
                  },
                  required: [
                    'brandName',
                    'tagline',
                    'headline',
                    'problemLine',
                    'introSentence',
                    'features',
                    'offerText',
                    'ctaText',
                    'primaryColor',
                    'accentColor',
                  ],
                },
              },
            });

            const text = response.text;
            if (!text) throw new Error('Empty response from Gemini API');

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(text);
          } catch (err: any) {
            console.error('Error in /api/generate-copy:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message || 'Failed to generate copy with Gemini AI' }));
          }
        });
      });

      server.middlewares.use('/api/health', (_req, res) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ status: 'ok', time: new Date().toISOString() }));
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), geminiApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(process.cwd(), '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
