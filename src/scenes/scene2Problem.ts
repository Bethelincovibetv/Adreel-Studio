import { SceneContext } from '../types';
import { easeOutBack, easeOutCubic, easeInOutCubic, clamp } from '../engine/easing';
import { drawRoundedRect, drawShop, drawPerson, drawPhone, hexToRgba } from '../engine/drawHelpers';
import { drawWrappedText } from '../engine/textWrap';

export function drawScene2Problem(ctx: CanvasRenderingContext2D, context: SceneContext) {
  const { t, duration, width, height, data, format } = context;

  const isVertical = format === '9:16';
  const isLandscape = format === '16:9';

  // Phases in Scene 2:
  // Phase 1 (0 -> 40% duration): Problem stage (Sad owner, quiet store, 2 sparse customers, problemLine displayed)
  // Phase 2 (35% -> 65% duration): Solution broadcast (Phone pops up, WhatsApp message bubbles fire, wave arcs)
  // Phase 3 (60% -> 100% duration): Transformation (More customers walk in, owner smiles, customer counter surges, introSentence displayed)

  const p1End = duration * 0.4;
  const p2Start = duration * 0.35;
  const p3Start = duration * 0.55;

  // 1. Text Banner at Top
  const textY = isVertical ? height * 0.12 : height * 0.13;
  const maxTextW = width * 0.88;

  if (t < p3Start) {
    // Show Problem Line
    const enterP = easeOutBack(clamp(t / 0.7, 0, 1));
    const fadeOutP = t > p1End ? clamp(1 - (t - p1End) / (p3Start - p1End), 0, 1) : 1;

    ctx.save();
    ctx.translate(width / 2, textY);
    ctx.scale(enterP, enterP);
    ctx.globalAlpha = fadeOutP;

    // Red warning pill
    ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
    drawRoundedRect(ctx, -120, -32, 240, 26, 13);
    ctx.fill();
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#fca5a5';
    ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('THE STRUGGLE', 0, -18);

    drawWrappedText(ctx, {
      text: data.problemLine,
      x: 0,
      y: 18,
      maxWidth: maxTextW,
      initialFontSize: isVertical ? 36 : (isLandscape ? 38 : 32),
      fontWeight: '800',
      color: '#ffffff',
      shadow: { color: 'rgba(0,0,0,0.6)', blur: 16, offsetX: 0, offsetY: 4 },
      align: 'center',
    });
    ctx.restore();
  } else {
    // Show Intro / Solution Sentence
    const enterP = easeOutBack(clamp((t - p3Start) / 0.65, 0, 1));

    ctx.save();
    ctx.translate(width / 2, textY);
    ctx.scale(enterP, enterP);

    // Green success pill
    ctx.fillStyle = hexToRgba(data.primaryColor, 0.25);
    drawRoundedRect(ctx, -130, -32, 260, 26, 13);
    ctx.fill();
    ctx.strokeStyle = data.accentColor;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#6ee7b7';
    ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('THE SOLUTION', 0, -18);

    drawWrappedText(ctx, {
      text: data.introSentence,
      x: 0,
      y: 18,
      maxWidth: maxTextW,
      initialFontSize: isVertical ? 34 : (isLandscape ? 36 : 30),
      fontWeight: '800',
      color: '#ffffff',
      shadow: { color: 'rgba(0,0,0,0.6)', blur: 16, offsetX: 0, offsetY: 4 },
      align: 'center',
    });
    ctx.restore();
  }

  // 2. The Shop
  const shopW = isVertical ? width * 0.72 : (isLandscape ? width * 0.45 : width * 0.62);
  const shopH = shopW * 0.72;
  const shopX = isLandscape ? width * 0.08 : (width - shopW) / 2;
  const shopY = isVertical ? height * 0.44 : (isLandscape ? height * 0.38 : height * 0.42);

  drawShop(ctx, shopX, shopY, shopW, shopH, data.primaryColor, data.accentColor);

  // Ground line
  const groundY = shopY + shopH;
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  ctx.lineTo(width, groundY);
  ctx.stroke();

  // 3. Shop Owner
  const ownerHappy = t >= p3Start;
  const ownerX = shopX + shopW * 0.45;
  const ownerY = groundY - 60;
  const ownerScale = isVertical ? 1.05 : 0.95;

  drawPerson(ctx, ownerX, ownerY, ownerScale, {
    mood: ownerHappy ? 'happy' : 'sad',
    facing: 1,
    shirtColor: data.primaryColor,
    pantsColor: '#1e293b',
    skinColor: '#f59e0b',
    hairColor: '#0f172a',
    walkPhase: 0,
    scaleBounce: ownerHappy ? Math.sin(t * 8) * 4 : 0,
  });

  // 4. Initial 2 sparse customers
  // Customer 1 (left side)
  drawPerson(ctx, shopX - 45, groundY - 60, ownerScale * 0.92, {
    mood: 'neutral',
    facing: 1,
    shirtColor: '#64748b',
    pantsColor: '#334155',
    skinColor: '#d97706',
    walkPhase: 0,
  });

  // Customer 2 (far right)
  drawPerson(ctx, shopX + shopW + 55, groundY - 60, ownerScale * 0.92, {
    mood: 'neutral',
    facing: -1,
    shirtColor: '#475569',
    pantsColor: '#1e293b',
    skinColor: '#b45309',
    walkPhase: 0,
  });

  // 5. Phone with WhatsApp-style broadcast messages popping in (Phase 2 & 3)
  if (t >= p2Start) {
    const phoneProgress = easeOutBack(clamp((t - p2Start) / 0.8, 0, 1));
    const phoneW = isVertical ? 220 : 200;
    const phoneH = phoneW * 1.8;
    const phoneX = isLandscape ? width * 0.68 : (width - phoneW) / 2;
    const phoneY = isVertical ? height * 0.68 : (isLandscape ? height * 0.28 : height * 0.65);

    ctx.save();
    ctx.translate(phoneX + phoneW / 2, phoneY + phoneH / 2);
    ctx.scale(phoneProgress, phoneProgress);
    ctx.translate(-(phoneX + phoneW / 2), -(phoneY + phoneH / 2));

    drawPhone(ctx, phoneX, phoneY, phoneW, phoneH, {
      screenColor: '#0c1322',
      showWaves: true,
      wavePhase: t * 1.5,
      primaryColor: data.accentColor,
    });

    // Chat Message Bubbles popping out of the phone
    const msg1T = p2Start + 0.3;
    const msg2T = p2Start + 0.8;

    // Bubble 1 (Outgoing green promotion blast)
    if (t >= msg1T) {
      const b1Scale = easeOutBack(clamp((t - msg1T) / 0.5, 0, 1));
      ctx.save();
      ctx.translate(phoneX + phoneW * 0.52, phoneY + phoneH * 0.32);
      ctx.scale(b1Scale, b1Scale);

      ctx.fillStyle = '#059669';
      drawRoundedRect(ctx, -75, -22, 150, 44, 12);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('⚡ Flash Deal Live!', -62, -4);
      ctx.font = '10px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#d1fae5';
      ctx.fillText('10,000+ views today', -62, 11);
      ctx.restore();
    }

    // Bubble 2 (Customer response)
    if (t >= msg2T) {
      const b2Scale = easeOutBack(clamp((t - msg2T) / 0.5, 0, 1));
      ctx.save();
      ctx.translate(phoneX + phoneW * 0.48, phoneY + phoneH * 0.56);
      ctx.scale(b2Scale, b2Scale);

      ctx.fillStyle = '#1e293b';
      drawRoundedRect(ctx, -75, -20, 150, 40, 12);
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#38bdf8';
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 11px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('💬 "Coming in now!"', -62, 5);
      ctx.restore();
    }

    ctx.restore();
  }

  // 6. Walking Incoming Customers (Phase 3)
  if (t >= p3Start) {
    const walkT = t - p3Start;
    const incomingCustomers = [
      { startX: -80, targetX: shopX + shopW * 0.15, speed: 1.1, color: '#ec4899', hair: '#0f172a', bag: true },
      { startX: -140, targetX: shopX + shopW * 0.28, speed: 1.0, color: '#f59e0b', hair: '#475569', bag: false },
      { startX: width + 80, targetX: shopX + shopW * 0.72, speed: 1.2, color: '#8b5cf6', hair: '#1e1b4b', bag: true },
      { startX: width + 150, targetX: shopX + shopW * 0.85, speed: 0.95, color: '#10b981', hair: '#334155', bag: false },
    ];

    incomingCustomers.forEach((cust, idx) => {
      const progress = clamp(walkT * cust.speed / (duration - p3Start), 0, 1);
      const curX = cust.startX + (cust.targetX - cust.startX) * easeInOutCubic(progress);
      const isWalking = progress < 0.95;
      const facing = cust.startX < cust.targetX ? 1 : -1;

      drawPerson(ctx, curX, groundY - 60, ownerScale * 0.92, {
        mood: 'happy',
        facing: facing as 1 | -1,
        shirtColor: cust.color,
        pantsColor: '#1e293b',
        skinColor: '#f59e0b',
        hairColor: cust.hair,
        walkPhase: isWalking ? walkT * 12 + idx : 0,
        hasBag: cust.bag,
      });
    });

    // 7. Customer Counter Badge surging up
    const counterP = clamp(walkT / (duration - p3Start), 0, 1);
    const countVal = Math.floor(2 + easeOutCubic(counterP) * 248);

    const counterX = shopX + shopW / 2;
    const counterY = shopY - 30;

    ctx.save();
    ctx.translate(counterX, counterY);
    ctx.scale(easeOutBack(clamp(walkT / 0.5, 0, 1)), easeOutBack(clamp(walkT / 0.5, 0, 1)));

    ctx.fillStyle = '#0f172a';
    drawRoundedRect(ctx, -100, -22, 200, 44, 22);
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = data.accentColor;
    ctx.stroke();

    // Green upward pulse dot
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(-72, 0, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`+${countVal} CUSTOMERS`, -56, 1);
    ctx.restore();
  }
}
