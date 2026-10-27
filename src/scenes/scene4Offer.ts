import { SceneContext } from '../types';
import { easeOutBack, easeOutCubic, clamp } from '../engine/easing';
import { drawRoundedRect, drawStarburst, drawFlames, draw3DCoin, hexToRgba } from '../engine/drawHelpers';
import { drawWrappedText } from '../engine/textWrap';

export function drawScene4Offer(ctx: CanvasRenderingContext2D, context: SceneContext) {
  const { t, duration, width, height, data, format } = context;

  const isVertical = format === '9:16';
  const isLandscape = format === '16:9';

  // 1. Falling 3D Coins in background
  const coinCount = 18;
  for (let i = 0; i < coinCount; i++) {
    const seed = (i * 73.1 + 17);
    const speed = 0.8 + (i % 5) * 0.35;
    const fallT = (t * speed + seed) % (duration + 4);
    const progress = fallT / (duration + 4);

    const cx = ((seed * 19) % (width * 0.9)) + width * 0.05;
    const cy = -60 + progress * (height + 120);

    const rotX = t * (2 + (i % 3)) + i;
    const rotY = t * (3 + (i % 4)) + i * 2;
    const coinSize = 18 + (i % 4) * 6;

    draw3DCoin(ctx, cx, cy, coinSize, rotX, rotY);
  }

  // 2. Animated Flames on Left and Right borders
  const flameW = isVertical ? width * 0.18 : (isLandscape ? width * 0.12 : width * 0.15);
  const flameH = isVertical ? height * 0.35 : height * 0.45;
  const flameBaseY = isVertical ? height * 0.88 : height * 0.85;

  // Left flames
  drawFlames(ctx, 10, flameBaseY, flameW, flameH, t);
  // Right flames
  ctx.save();
  ctx.translate(width - 10, 0);
  ctx.scale(-1, 1);
  drawFlames(ctx, 0, flameBaseY, flameW, flameH, t + 1.5);
  ctx.restore();

  // 3. Top Banner: "EXCLUSIVE OFFER" / "DON'T MISS OUT"
  const bannerEntrance = easeOutBack(clamp(t / 0.6, 0, 1));
  const topY = isVertical ? height * 0.14 : height * 0.13;

  ctx.save();
  ctx.translate(width / 2, topY);
  ctx.scale(bannerEntrance, bannerEntrance);

  ctx.fillStyle = '#ef4444';
  ctx.shadowColor = 'rgba(239, 68, 68, 0.5)';
  ctx.shadowBlur = 18;
  drawRoundedRect(ctx, -140, -22, 280, 44, 22);
  ctx.fill();

  ctx.shadowColor = 'transparent';
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 16px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🔥 LIMITED TIME OFFER 🔥', 0, 1);
  ctx.restore();

  // 4. Center Rotating Starburst Badge
  const starburstCenterY = isVertical ? height * 0.46 : (isLandscape ? height * 0.5 : height * 0.48);
  const outerR = isVertical ? width * 0.42 : (isLandscape ? height * 0.36 : width * 0.38);
  const innerR = outerR * 0.82;

  // Entrance and continuous slow rotation
  const enterScale = easeOutBack(clamp((t - 0.2) / 0.7, 0, 1));
  const pulse = 1 + Math.sin(t * 7) * 0.04;
  const currentRotation = t * 0.45;

  if (enterScale > 0) {
    drawStarburst(
      ctx,
      width / 2,
      starburstCenterY,
      outerR * enterScale * pulse,
      innerR * enterScale * pulse,
      16,
      currentRotation,
      data.primaryColor,
      data.accentColor
    );

    // Inner dark circular medallion for text contrast
    const medallionR = innerR * 0.78 * enterScale * pulse;
    ctx.save();
    ctx.translate(width / 2, starburstCenterY);

    const medGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, medallionR);
    medGrad.addColorStop(0, '#111827');
    medGrad.addColorStop(1, '#030712');
    ctx.fillStyle = medGrad;
    ctx.beginPath();
    ctx.arc(0, 0, medallionR, 0, Math.PI * 2);
    ctx.fill();

    ctx.lineWidth = 4;
    ctx.strokeStyle = '#fef08a';
    ctx.stroke();

    // Offer Text pulsing inside the starburst
    const textScale = 1 + Math.sin(t * 8) * 0.05;
    ctx.scale(textScale, textScale);

    // Pill header inside medallion
    ctx.fillStyle = '#f59e0b';
    drawRoundedRect(ctx, -65, -medallionR * 0.62, 130, 24, 12);
    ctx.fill();
    ctx.fillStyle = '#000000';
    ctx.font = '800 11px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SPECIAL DEAL', 0, -medallionR * 0.62 + 12);

    // Offer Text (Supports ₦ currency symbol cleanly)
    drawWrappedText(ctx, {
      text: data.offerText,
      x: 0,
      y: 8,
      maxWidth: medallionR * 1.6,
      maxHeight: medallionR * 1.1,
      initialFontSize: isVertical ? 38 : 34,
      minFontSize: 16,
      fontWeight: '900',
      color: '#ffffff',
      shadow: { color: 'rgba(0,0,0,0.8)', blur: 16, offsetX: 0, offsetY: 3 },
      align: 'center',
    });

    ctx.restore();
  }

  // 5. Bottom Urgency Ticker
  const tickerY = isVertical ? height * 0.82 : height * 0.86;
  const tickerEntrance = easeOutBack(clamp((t - 0.6) / 0.6, 0, 1));

  ctx.save();
  ctx.translate(width / 2, tickerY);
  ctx.scale(tickerEntrance, tickerEntrance);

  const tW = Math.min(width * 0.84, 480);
  ctx.fillStyle = '#1e293b';
  drawRoundedRect(ctx, -tW / 2, -24, tW, 48, 24);
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = data.accentColor;
  ctx.stroke();

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 14px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('⚡ Slots filling fast • Act today for bonus perks', 0, 1);

  ctx.restore();
}
