import { SceneContext } from '../types';
import { easeOutBack, easeOutCubic, easeInOutCubic, clamp } from '../engine/easing';
import { drawRoundedRect, drawIcon, hexToRgba } from '../engine/drawHelpers';
import { drawWrappedText } from '../engine/textWrap';

export function drawScene1Hook(ctx: CanvasRenderingContext2D, context: SceneContext) {
  const { t, duration, width, height, data, format } = context;

  const isVertical = format === '9:16';
  const isLandscape = format === '16:9';

  // 1. Brand Tagline / Badge at top
  const badgeEntrance = easeOutBack(clamp(t / 0.7, 0, 1));
  const badgeY = isVertical ? height * 0.11 : height * 0.12;

  ctx.save();
  ctx.translate(width / 2, badgeY);
  ctx.scale(badgeEntrance, badgeEntrance);

  // Badge Container
  const badgeW = Math.min(width * 0.75, 420);
  const badgeH = 48;
  ctx.fillStyle = hexToRgba(data.primaryColor, 0.25);
  drawRoundedRect(ctx, -badgeW / 2, -badgeH / 2, badgeW, badgeH, 24);
  ctx.fill();

  ctx.lineWidth = 2;
  ctx.strokeStyle = hexToRgba(data.accentColor, 0.7);
  ctx.stroke();

  // Brand Name inside badge
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(data.brandName.toUpperCase(), 0, 1);

  ctx.restore();

  // 2. Headline: Pops in line by line
  const headlineWords = data.headline.split(' ');
  const halfLen = Math.ceil(headlineWords.length / 2);
  const line1 = headlineWords.slice(0, halfLen).join(' ');
  const line2 = headlineWords.slice(halfLen).join(' ');

  const headlineY = isVertical ? height * 0.25 : height * 0.28;
  const maxTextW = width * 0.86;
  const baseFontSize = isVertical ? 54 : (isLandscape ? 58 : 50);

  // Line 1 Entrance (t: 0.3s -> 1.0s)
  const l1Progress = easeOutBack(clamp((t - 0.25) / 0.65, 0, 1));
  if (l1Progress > 0) {
    ctx.save();
    ctx.translate(width / 2, headlineY - (isVertical ? 38 : 34));
    ctx.scale(l1Progress, l1Progress);
    drawWrappedText(ctx, {
      text: line1,
      x: 0,
      y: 0,
      maxWidth: maxTextW,
      initialFontSize: baseFontSize,
      fontWeight: '800',
      color: '#ffffff',
      shadow: { color: 'rgba(0,0,0,0.6)', blur: 18, offsetX: 0, offsetY: 4 },
      align: 'center',
    });
    ctx.restore();
  }

  // Line 2 Entrance (t: 0.7s -> 1.4s)
  const l2Progress = easeOutBack(clamp((t - 0.65) / 0.65, 0, 1));
  if (l2Progress > 0) {
    ctx.save();
    ctx.translate(width / 2, headlineY + (isVertical ? 42 : 36));
    ctx.scale(l2Progress, l2Progress);
    drawWrappedText(ctx, {
      text: line2,
      x: 0,
      y: 0,
      maxWidth: maxTextW,
      initialFontSize: baseFontSize,
      fontWeight: '800',
      color: data.accentColor,
      shadow: { color: hexToRgba(data.accentColor, 0.4), blur: 24, offsetX: 0, offsetY: 4 },
      align: 'center',
    });
    ctx.restore();
  }

  // 3. Growing Bar Chart in lower area
  const chartY = isVertical ? height * 0.78 : height * 0.82;
  const chartW = Math.min(width * 0.82, 600);
  const chartStartX = (width - chartW) / 2;
  const barCount = 4;
  const barW = chartW / (barCount * 1.8);
  const barGap = chartW / barCount;
  const targetHeights = [140, 220, 310, 420].map(h => isVertical ? h * 1.1 : h * 0.75);
  const labels = ['Week 1', 'Week 2', 'Week 3', 'Target'];
  const boosts = ['+45%', '+120%', '+280%', '+500%'];

  // Base chart ground line
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(chartStartX - 20, chartY);
  ctx.lineTo(chartStartX + chartW + 20, chartY);
  ctx.stroke();

  // Draw Bars
  for (let i = 0; i < barCount; i++) {
    const barDelay = 1.0 + i * 0.28;
    const barProgress = easeOutCubic(clamp((t - barDelay) / 0.8, 0, 1));
    const currentH = targetHeights[i] * barProgress;
    const bx = chartStartX + i * barGap + (barGap - barW) / 2;
    const by = chartY - currentH;

    if (currentH > 2) {
      // Bar gradient
      const barGrad = ctx.createLinearGradient(bx, by, bx, chartY);
      if (i === barCount - 1) {
        barGrad.addColorStop(0, '#f59e0b');
        barGrad.addColorStop(1, data.primaryColor);
      } else {
        barGrad.addColorStop(0, data.accentColor);
        barGrad.addColorStop(1, hexToRgba(data.primaryColor, 0.6));
      }

      ctx.fillStyle = barGrad;
      drawRoundedRect(ctx, bx, by, barW, currentH, 8);
      ctx.fill();

      // Top cap highlight
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(bx + 4, by + 2, barW - 8, 4);

      // Percentage badge above bar when fully grown
      if (barProgress > 0.8) {
        const badgeScale = easeOutBack(clamp((barProgress - 0.8) / 0.2, 0, 1));
        ctx.save();
        ctx.translate(bx + barW / 2, by - 22);
        ctx.scale(badgeScale, badgeScale);

        ctx.fillStyle = '#1e293b';
        drawRoundedRect(ctx, -32, -14, 64, 26, 6);
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = data.accentColor;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 13px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(boosts[i], 0, 1);
        ctx.restore();
      }
    }

    // Label under bar
    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 13px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(labels[i], bx + barW / 2, chartY + 22);
  }

  // 4. Flying Rocket over the chart
  const rocketStartT = 1.6;
  const rocketEndT = duration - 0.3;
  if (t >= rocketStartT) {
    const flightProgress = clamp((t - rocketStartT) / (rocketEndT - rocketStartT), 0, 1);
    const flightEase = easeInOutCubic(flightProgress);

    // Parabolic trajectory: starts near bottom left, swoops up through the bars, arches towards top right
    const startX = chartStartX - 40;
    const startY = chartY - 20;
    const endX = width + 80;
    const endY = height * 0.18;

    const rx = startX + (endX - startX) * flightEase;
    const ry = startY + (endY - startY) * flightEase - Math.sin(flightEase * Math.PI) * (height * 0.26);

    // Calculate slope for rocket angle
    const delta = 0.02;
    const nextP = clamp(flightEase + delta, 0, 1);
    const nrx = startX + (endX - startX) * nextP;
    const nry = startY + (endY - startY) * nextP - Math.sin(nextP * Math.PI) * (height * 0.26);
    const angle = Math.atan2(nry - ry, nrx - rx) + Math.PI / 2;

    // Rocket Smoke & Fire Trail
    const smokeCount = 12;
    for (let s = 0; s < smokeCount; s++) {
      const trailFraction = s / smokeCount;
      const smokeP = clamp(flightEase - trailFraction * 0.16, 0, 1);
      if (smokeP > 0) {
        const sx = startX + (endX - startX) * smokeP;
        const sy = startY + (endY - startY) * smokeP - Math.sin(smokeP * Math.PI) * (height * 0.26) + (Math.sin(s * 3.4) * 8);
        const smokeRadius = 8 + trailFraction * 26;
        const alpha = (1 - trailFraction) * 0.45;

        ctx.fillStyle = s % 2 === 0 ? hexToRgba('#f59e0b', alpha) : hexToRgba('#ffffff', alpha * 0.7);
        ctx.beginPath();
        ctx.arc(sx, sy, smokeRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Draw Rocket
    ctx.save();
    ctx.translate(rx, ry);
    ctx.rotate(angle);
    ctx.scale(1.4, 1.4);

    // Rocket Exhaust Fire
    const flameFlicker = 14 + Math.sin(t * 40) * 8;
    const flameGrad = ctx.createLinearGradient(0, 12, 0, 12 + flameFlicker);
    flameGrad.addColorStop(0, '#fef08a');
    flameGrad.addColorStop(0.4, '#f97316');
    flameGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = flameGrad;
    ctx.beginPath();
    ctx.moveTo(-6, 12);
    ctx.lineTo(6, 12);
    ctx.lineTo(0, 12 + flameFlicker);
    ctx.closePath();
    ctx.fill();

    // Rocket Icon
    drawIcon(ctx, 'rocket', 0, 0, 48, '#ffffff');

    ctx.restore();
  }
}
