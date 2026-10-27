import { SceneContext } from '../types';
import { easeOutBack, easeOutCubic, clamp } from '../engine/easing';
import { drawRoundedRect, drawIcon, drawCheckmarkBadge, hexToRgba } from '../engine/drawHelpers';
import { drawWrappedText } from '../engine/textWrap';

export function drawScene3Features(ctx: CanvasRenderingContext2D, context: SceneContext) {
  const { t, duration, width, height, data, format } = context;

  const isVertical = format === '9:16';
  const isLandscape = format === '16:9';

  const features = data.features && data.features.length > 0 ? data.features : [
    { id: '1', title: 'Targeted Reach', subtitle: 'Connect with verified buyers', icon: 'people' as const },
    { id: '2', title: 'Daily Status Blasts', subtitle: 'Over 20,000 targeted views', icon: 'status' as const },
    { id: '3', title: 'Smart Network', subtitle: 'Multi-channel distribution', icon: 'network' as const },
    { id: '4', title: 'High Conversion', subtitle: 'Direct WhatsApp chats & sales', icon: 'coin' as const },
  ];

  // 1. Header Title: "WHY CHOOSE US" / "KEY BENEFITS"
  const headerEntrance = easeOutBack(clamp(t / 0.6, 0, 1));
  const headerY = isVertical ? height * 0.11 : (isLandscape ? height * 0.12 : height * 0.11);

  ctx.save();
  ctx.translate(width / 2, headerY);
  ctx.scale(headerEntrance, headerEntrance);

  // Pill badge
  ctx.fillStyle = hexToRgba(data.primaryColor, 0.25);
  drawRoundedRect(ctx, -120, -22, 240, 44, 22);
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = data.accentColor;
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = '800 16px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('POWERFUL ADVANTAGES', 0, 1);
  ctx.restore();

  // 2. Feature Cards
  const count = features.length;
  // Card dimensions
  const cardW = isVertical
    ? Math.min(width * 0.88, 560)
    : (isLandscape ? Math.min(width * 0.44, 500) : Math.min(width * 0.82, 540));
  
  // Responsive card height based on count
  const availableH = isVertical ? height * 0.72 : (isLandscape ? height * 0.74 : height * 0.72);
  const cardH = Math.min(availableH / count - 12, isVertical ? 105 : 95);
  const spacing = cardH + (count <= 4 ? 16 : 10);

  const startY = headerY + 54;
  const timePerCard = (duration - 0.8) / count;

  // Icons array fallback
  const iconFallbackList: Array<'status' | 'people' | 'network' | 'coin' | 'bell' | 'rocket' | 'shield'> = [
    'people', 'status', 'network', 'coin', 'bell', 'rocket', 'shield'
  ];

  features.forEach((feature, index) => {
    const cardStartTime = 0.4 + index * timePerCard;
    if (t < cardStartTime) return;

    const cardT = t - cardStartTime;
    const slideProgress = easeOutBack(clamp(cardT / 0.65, 0, 1));
    const checkmarkProgress = easeOutBack(clamp((cardT - 0.3) / 0.4, 0, 1));

    // Slide in from left or alternating sides
    const fromX = index % 2 === 0 ? -cardW - 80 : width + 80;
    
    // In landscape with >3 items, we can optionally split into two columns or stacked
    let targetX = (width - cardW) / 2;
    let targetY = startY + index * spacing;

    if (isLandscape && count >= 4) {
      const col = index % 2;
      const row = Math.floor(index / 2);
      const colW = width * 0.44;
      targetX = col === 0 ? width * 0.05 : width * 0.51;
      targetY = startY + row * (cardH + 18);
    }

    const curX = fromX + (targetX - fromX) * slideProgress;

    ctx.save();
    ctx.translate(curX, targetY);

    // Glowing drop shadow for newest active card
    const isActive = cardT < timePerCard;
    ctx.shadowColor = isActive ? hexToRgba(data.accentColor, 0.4) : 'rgba(0,0,0,0.4)';
    ctx.shadowBlur = isActive ? 22 : 14;
    ctx.shadowOffsetY = 6;

    // Card background with rich glass gradient
    const cardGrad = ctx.createLinearGradient(0, 0, cardW, cardH);
    cardGrad.addColorStop(0, '#131d33');
    cardGrad.addColorStop(1, '#0c1222');
    ctx.fillStyle = cardGrad;
    drawRoundedRect(ctx, 0, 0, cardW, cardH, 16);
    ctx.fill();

    ctx.shadowColor = 'transparent';

    // Left accent bar
    ctx.fillStyle = data.accentColor;
    drawRoundedRect(ctx, 0, 0, 8, cardH, 4);
    ctx.fill();

    // Card border
    ctx.lineWidth = isActive ? 2 : 1;
    ctx.strokeStyle = isActive ? data.accentColor : '#1e293b';
    drawRoundedRect(ctx, 0, 0, cardW, cardH, 16);
    ctx.stroke();

    // Icon Circle Container
    const iconSize = cardH * 0.58;
    const iconX = 26 + iconSize / 2;
    const iconY = cardH / 2;

    const iconCircleGrad = ctx.createLinearGradient(iconX - iconSize / 2, iconY - iconSize / 2, iconX + iconSize / 2, iconY + iconSize / 2);
    iconCircleGrad.addColorStop(0, hexToRgba(data.primaryColor, 0.45));
    iconCircleGrad.addColorStop(1, hexToRgba(data.accentColor, 0.2));
    ctx.fillStyle = iconCircleGrad;
    ctx.beginPath();
    ctx.arc(iconX, iconY, iconSize / 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.lineWidth = 1.5;
    ctx.strokeStyle = hexToRgba(data.accentColor, 0.6);
    ctx.stroke();

    // Draw Vector Icon
    const iconName = feature.icon || iconFallbackList[index % iconFallbackList.length];
    drawIcon(ctx, iconName, iconX, iconY, iconSize * 0.62, '#ffffff');

    // Text details (Title & Subtitle)
    const textStartX = iconX + iconSize / 2 + 18;
    const textMaxW = cardW - textStartX - 54;

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillText(feature.title, textStartX, cardH * 0.48);

    // Subtitle
    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 13px "Plus Jakarta Sans", sans-serif';
    ctx.textBaseline = 'top';

    drawWrappedText(ctx, {
      text: feature.subtitle,
      x: textStartX,
      y: cardH * 0.54,
      maxWidth: textMaxW,
      initialFontSize: 13,
      fontWeight: '500',
      color: '#94a3b8',
      align: 'left',
      baseline: 'top',
    });

    // Pop-in Green Checkmark Badge at right of card
    const checkX = cardW - 28;
    const checkY = cardH / 2;
    drawCheckmarkBadge(ctx, checkX, checkY, 15, checkmarkProgress);

    ctx.restore();
  });
}
