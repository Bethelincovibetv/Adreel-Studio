import { SceneContext } from '../types';
import { easeOutBack, easeOutCubic, easeInOutCubic, clamp } from '../engine/easing';
import { drawRoundedRect, drawPhone, drawIcon, hexToRgba } from '../engine/drawHelpers';
import { drawWrappedText } from '../engine/textWrap';

export function drawScene5CTA(ctx: CanvasRenderingContext2D, context: SceneContext) {
  const { t, duration, width, height, data, format } = context;

  const isVertical = format === '9:16';
  const isLandscape = format === '16:9';

  // Scene timeline breakdown:
  // t: 0.0s -> Phone enters
  // t: 0.4s -> Outgoing bubble ("Hi! Ready to get started 🚀")
  // t: 0.9s -> Animated typing dots ("...")
  // t: 1.5s -> Incoming reply bubble ("Welcome! Let's boost your sales today ✨")
  // t: 2.0s -> Bouncing envelope opens with sparkles
  // t: 2.5s -> Final Brand Logo, Tagline, and Action Button appear

  const phoneW = isVertical ? 320 : (isLandscape ? 280 : 300);
  const phoneH = phoneW * 1.55;
  const phoneX = isLandscape ? width * 0.18 : (width - phoneW) / 2;
  const phoneY = isVertical ? height * 0.28 : (isLandscape ? height * 0.22 : height * 0.26);

  // 1. Phone with live chat
  const phoneEntrance = easeOutBack(clamp(t / 0.7, 0, 1));
  ctx.save();
  ctx.translate(phoneX + phoneW / 2, phoneY + phoneH / 2);
  ctx.scale(phoneEntrance, phoneEntrance);
  ctx.translate(-(phoneX + phoneW / 2), -(phoneY + phoneH / 2));

  drawPhone(ctx, phoneX, phoneY, phoneW, phoneH, {
    screenColor: '#0b1424',
    showWaves: false,
    primaryColor: data.primaryColor,
  });

  // Chat Header Bar inside phone
  const barY = phoneY + 28;
  const barW = phoneW - 16;
  ctx.fillStyle = '#1e293b';
  drawRoundedRect(ctx, phoneX + 8, barY, barW, 46, 8);
  ctx.fill();

  // Avatar inside chat bar
  ctx.fillStyle = data.primaryColor;
  ctx.beginPath();
  ctx.arc(phoneX + 34, barY + 23, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 13px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(data.brandName.charAt(0).toUpperCase(), phoneX + 34, barY + 23);

  // Contact Name & Online Status
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(data.brandName, phoneX + 58, barY + 16);
  ctx.fillStyle = '#10b981';
  ctx.font = '600 10px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('● Online now', phoneX + 58, barY + 31);

  // Chat Bubble 1: Outgoing from user (Green WhatsApp bubble)
  const b1T = 0.4;
  if (t >= b1T) {
    const b1Scale = easeOutBack(clamp((t - b1T) / 0.5, 0, 1));
    const bubbleW = phoneW * 0.72;
    const bubbleH = 46;
    const bx = phoneX + phoneW - bubbleW - 18;
    const by = barY + 65;

    ctx.save();
    ctx.translate(bx + bubbleW, by + bubbleH / 2);
    ctx.scale(b1Scale, b1Scale);
    ctx.translate(-(bx + bubbleW), -(by + bubbleH / 2));

    ctx.fillStyle = '#059669';
    drawRoundedRect(ctx, bx, by, bubbleW, bubbleH, 12);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = '600 12px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('Hi! I want to start my campaign 🚀', bx + 12, by + 23);
    ctx.restore();
  }

  // Typing Dots Animation (t: 0.9s to 1.6s)
  const typingT = 0.9;
  const replyT = 1.5;
  if (t >= typingT && t < replyT) {
    const bubbleW = 80;
    const bubbleH = 36;
    const bx = phoneX + 18;
    const by = barY + 125;

    ctx.fillStyle = '#1e293b';
    drawRoundedRect(ctx, bx, by, bubbleW, bubbleH, 12);
    ctx.fill();

    // 3 animated bouncing dots
    for (let dot = 0; dot < 3; dot++) {
      const dotBounce = Math.sin((t - typingT) * 12 + dot * 1.5) * 4;
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.arc(bx + 22 + dot * 18, by + 18 + dotBounce, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Chat Bubble 2: Reply from Business (Incoming dark/cyan bubble)
  if (t >= replyT) {
    const b2Scale = easeOutBack(clamp((t - replyT) / 0.5, 0, 1));
    const bubbleW = phoneW * 0.78;
    const bubbleH = 50;
    const bx = phoneX + 18;
    const by = barY + 125;

    ctx.save();
    ctx.translate(bx, by + bubbleH / 2);
    ctx.scale(b2Scale, b2Scale);
    ctx.translate(-bx, -(by + bubbleH / 2));

    ctx.fillStyle = '#1e293b';
    drawRoundedRect(ctx, bx, by, bubbleW, bubbleH, 12);
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = data.accentColor;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('Welcome aboard! Let’s get you', bx + 12, by + 17);
    ctx.fillText('more customers right away ✨', bx + 12, by + 34);
    ctx.restore();
  }

  ctx.restore();

  // 2. Bouncing Envelope with heart/sparkles
  const envT = 1.9;
  if (t >= envT) {
    const envProgress = easeOutBack(clamp((t - envT) / 0.6, 0, 1));
    const bounceOffset = Math.sin((t - envT) * 7) * 8;
    const envX = isLandscape ? width * 0.72 : width / 2;
    const envY = isVertical ? height * 0.16 : (isLandscape ? height * 0.22 : height * 0.16);

    ctx.save();
    ctx.translate(envX, envY + bounceOffset);
    ctx.scale(envProgress, envProgress);

    // Glowing circle backing
    ctx.fillStyle = hexToRgba(data.accentColor, 0.2);
    ctx.beginPath();
    ctx.arc(0, 0, 48, 0, Math.PI * 2);
    ctx.fill();

    // Envelope body
    const ew = 64;
    const eh = 44;
    ctx.fillStyle = '#f59e0b';
    drawRoundedRect(ctx, -ew / 2, -eh / 2, ew, eh, 6);
    ctx.fill();

    // Flap
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.moveTo(-ew / 2, -eh / 2);
    ctx.lineTo(0, 6);
    ctx.lineTo(ew / 2, -eh / 2);
    ctx.closePath();
    ctx.fill();

    // Sparkles radiating from envelope
    const sparkCount = 6;
    for (let s = 0; s < sparkCount; s++) {
      const sAngle = (s * Math.PI * 2) / sparkCount + t * 2;
      const sDist = 58 + Math.sin(t * 8 + s) * 10;
      const sx = Math.cos(sAngle) * sDist;
      const sy = Math.sin(sAngle) * sDist;

      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(sx, sy, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // 3. Final Brand Logo & Tagline Fade In
  const brandT = 2.4;
  if (t >= brandT) {
    const brandFade = easeOutCubic(clamp((t - brandT) / 0.7, 0, 1));
    const logoY = isVertical ? height * 0.74 : (isLandscape ? height * 0.44 : height * 0.73);
    const logoX = isLandscape ? width * 0.72 : width / 2;

    ctx.save();
    ctx.translate(logoX, logoY);
    ctx.globalAlpha = brandFade;

    // Brand Name
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 32px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = hexToRgba(data.accentColor, 0.5);
    ctx.shadowBlur = 18;
    ctx.fillText(data.brandName, 0, 0);

    // Tagline
    ctx.shadowBlur = 0;
    ctx.fillStyle = data.accentColor;
    ctx.font = '600 16px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(data.tagline, 0, 32);

    ctx.restore();
  }

  // 4. Call to Action Button & Message Banner
  const ctaT = 2.8;
  const ctaProgress = easeOutBack(clamp((t - ctaT) / 0.65, 0, 1));
  const ctaY = isVertical ? height * 0.88 : (isLandscape ? height * 0.75 : height * 0.86);
  const ctaX = isLandscape ? width * 0.72 : width / 2;

  if (ctaProgress > 0) {
    ctx.save();
    ctx.translate(ctaX, ctaY);
    ctx.scale(ctaProgress, ctaProgress);

    // Action button with pulse and tap ripple
    const btnW = Math.min(width * 0.84, 520);
    const btnH = 68;
    const btnPulse = 1 + Math.sin(t * 7) * 0.025;
    ctx.scale(btnPulse, btnPulse);

    // Glowing shadow
    ctx.shadowColor = hexToRgba(data.accentColor, 0.6);
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 6;

    // Button gradient
    const btnGrad = ctx.createLinearGradient(-btnW / 2, 0, btnW / 2, 0);
    btnGrad.addColorStop(0, data.primaryColor);
    btnGrad.addColorStop(1, data.accentColor);
    ctx.fillStyle = btnGrad;
    drawRoundedRect(ctx, -btnW / 2, -btnH / 2, btnW, btnH, 34);
    ctx.fill();

    ctx.shadowColor = 'transparent';

    // Button text
    drawWrappedText(ctx, {
      text: data.ctaText,
      x: 0,
      y: 0,
      maxWidth: btnW - 40,
      maxHeight: btnH - 12,
      initialFontSize: isVertical ? 19 : 20,
      minFontSize: 13,
      fontWeight: '800',
      color: '#ffffff',
      align: 'center',
      baseline: 'middle',
    });

    // Tap indicator hand or sparkle at right edge
    const tapScale = 1 + Math.sin(t * 10) * 0.2;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(btnW / 2 - 28, 0, 8 * tapScale, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
