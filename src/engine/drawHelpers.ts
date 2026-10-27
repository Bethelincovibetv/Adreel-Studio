import { easeOutQuad, easeOutBack } from './easing';

// Background bokeh and ambient particles
export function drawBokehBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  globalT: number,
  primaryColor: string,
  accentColor: string
) {
  // Rich deep dark gradient base
  const bgGrad = ctx.createLinearGradient(0, 0, width * 0.5, height);
  bgGrad.addColorStop(0, '#090d16');
  bgGrad.addColorStop(0.5, '#0d1527');
  bgGrad.addColorStop(1, '#050811');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Subtle ambient glow meshes
  ctx.save();
  ctx.globalCompositeOperation = 'screen';

  // Primary aura
  const aura1 = ctx.createRadialGradient(
    width * 0.25 + Math.sin(globalT * 0.6) * width * 0.08,
    height * 0.3 + Math.cos(globalT * 0.5) * height * 0.08,
    20,
    width * 0.25,
    height * 0.3,
    width * 0.7
  );
  aura1.addColorStop(0, hexToRgba(primaryColor, 0.22));
  aura1.addColorStop(0.6, hexToRgba(primaryColor, 0.05));
  aura1.addColorStop(1, 'transparent');
  ctx.fillStyle = aura1;
  ctx.fillRect(0, 0, width, height);

  // Accent aura
  const aura2 = ctx.createRadialGradient(
    width * 0.75 + Math.cos(globalT * 0.7) * width * 0.08,
    height * 0.75 + Math.sin(globalT * 0.6) * height * 0.08,
    20,
    width * 0.75,
    height * 0.75,
    width * 0.65
  );
  aura2.addColorStop(0, hexToRgba(accentColor, 0.18));
  aura2.addColorStop(0.6, hexToRgba(accentColor, 0.04));
  aura2.addColorStop(1, 'transparent');
  ctx.fillStyle = aura2;
  ctx.fillRect(0, 0, width, height);

  // Floating bokeh orbs
  const particleCount = 14;
  for (let i = 0; i < particleCount; i++) {
    const seed = i * 137.5;
    const speed = 0.2 + (i % 5) * 0.12;
    const radius = ((i % 4) + 1) * 28 + (width * 0.015);
    const baseX = ((seed * 19.3) % width);
    const baseY = ((seed * 37.7) % height);

    const x = (baseX + Math.sin(globalT * speed + i) * 60 + width) % width;
    const y = (baseY - (globalT * 22 * speed) + height * 10) % height;
    const alpha = 0.08 + ((Math.sin(globalT * 1.5 + i) + 1) * 0.06);

    const color = i % 2 === 0 ? primaryColor : accentColor;
    const radGrad = ctx.createRadialGradient(x, y, 0, x, y, radius);
    radGrad.addColorStop(0, hexToRgba(color, alpha));
    radGrad.addColorStop(0.7, hexToRgba(color, alpha * 0.3));
    radGrad.addColorStop(1, 'transparent');

    ctx.fillStyle = radGrad;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  // Sparkling micro-stars
  for (let i = 0; i < 20; i++) {
    const sx = ((i * 187.3 + 43) % width);
    const sy = ((i * 311.9 + 89) % height);
    const twinkle = Math.max(0, Math.sin(globalT * 3.5 + i * 2));
    if (twinkle > 0.3) {
      const starAlpha = (twinkle - 0.3) * 0.6;
      ctx.fillStyle = `rgba(255, 255, 255, ${starAlpha})`;
      ctx.beginPath();
      ctx.arc(sx, sy, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}

export function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

// Flat 2D vector character with walking cycle, expressive head, torso, and facial features
export function drawPerson(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  options: {
    mood?: 'sad' | 'neutral' | 'happy';
    walkPhase?: number; // 0 to 2*PI
    facing?: 1 | -1;
    shirtColor?: string;
    pantsColor?: string;
    skinColor?: string;
    hairColor?: string;
    hasBag?: boolean;
    scaleBounce?: number;
  } = {}
) {
  const {
    mood = 'happy',
    walkPhase = 0,
    facing = 1,
    shirtColor = '#3b82f6',
    pantsColor = '#1e293b',
    skinColor = '#f59e0b',
    hairColor = '#1f2937',
    hasBag = false,
    scaleBounce = 0,
  } = options;

  ctx.save();
  ctx.translate(x, y + scaleBounce);
  ctx.scale(scale * facing, scale);

  const legSwing = Math.sin(walkPhase) * 22; // angle in degrees

  // Shadow under feet
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(0, 86, 26, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  // Back Leg
  ctx.save();
  ctx.translate(-4, 45);
  ctx.rotate((-legSwing * Math.PI) / 180);
  ctx.fillStyle = pantsColor;
  drawRoundedRect(ctx, -5, 0, 10, 42, 4);
  ctx.fill();
  // Shoe
  ctx.fillStyle = '#0f172a';
  drawRoundedRect(ctx, -6, 38, 15, 8, 3);
  ctx.fill();
  ctx.restore();

  // Front Leg
  ctx.save();
  ctx.translate(4, 45);
  ctx.rotate((legSwing * Math.PI) / 180);
  ctx.fillStyle = pantsColor;
  drawRoundedRect(ctx, -5, 0, 10, 42, 4);
  ctx.fill();
  // Shoe
  ctx.fillStyle = '#0f172a';
  drawRoundedRect(ctx, -6, 38, 15, 8, 3);
  ctx.fill();
  ctx.restore();

  // Torso / Shirt
  ctx.fillStyle = shirtColor;
  drawRoundedRect(ctx, -14, 5, 28, 42, 9);
  ctx.fill();

  // Arms
  const armSwing = Math.sin(walkPhase) * 20;
  // Back arm
  ctx.save();
  ctx.translate(-12, 10);
  ctx.rotate((armSwing * Math.PI) / 180);
  ctx.fillStyle = shirtColor;
  drawRoundedRect(ctx, -4, 0, 8, 28, 4);
  ctx.fill();
  // Hand
  ctx.fillStyle = skinColor;
  ctx.beginPath();
  ctx.arc(0, 28, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Front arm
  ctx.save();
  ctx.translate(12, 10);
  ctx.rotate((-armSwing * Math.PI) / 180);
  ctx.fillStyle = shirtColor;
  drawRoundedRect(ctx, -4, 0, 8, 28, 4);
  ctx.fill();
  // Hand
  ctx.fillStyle = skinColor;
  ctx.beginPath();
  ctx.arc(0, 28, 4.5, 0, Math.PI * 2);
  ctx.fill();
  if (hasBag) {
    ctx.fillStyle = '#f43f5e';
    drawRoundedRect(ctx, -2, 28, 14, 18, 3);
    ctx.fill();
  }
  ctx.restore();

  // Neck
  ctx.fillStyle = skinColor;
  ctx.fillRect(-4, -2, 8, 8);

  // Head
  ctx.fillStyle = skinColor;
  ctx.beginPath();
  ctx.arc(0, -18, 18, 0, Math.PI * 2);
  ctx.fill();

  // Hair
  ctx.fillStyle = hairColor;
  ctx.beginPath();
  ctx.arc(0, -22, 18, Math.PI, 0);
  ctx.lineTo(18, -16);
  ctx.quadraticCurveTo(0, -14, -18, -16);
  ctx.closePath();
  ctx.fill();

  // Face (facing right)
  const faceX = 4;
  const eyeY = -18;

  // Eye
  ctx.fillStyle = '#0f172a';
  if (mood === 'happy') {
    ctx.beginPath();
    ctx.arc(faceX + 4, eyeY, 2.5, 0, Math.PI * 2);
    ctx.fill();
    // Happy sparkle cheek
    ctx.fillStyle = 'rgba(244, 63, 94, 0.4)';
    ctx.beginPath();
    ctx.arc(faceX + 3, eyeY + 6, 3.5, 0, Math.PI * 2);
    ctx.fill();
  } else if (mood === 'sad') {
    // Slanted sad eye
    ctx.fillRect(faceX + 2, eyeY, 5, 2.5);
    // Tear droplet
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(faceX + 6, eyeY + 7, 2, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.arc(faceX + 4, eyeY, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Mouth
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#0f172a';
  ctx.beginPath();
  if (mood === 'happy') {
    ctx.arc(faceX + 3, eyeY + 6, 5, 0.1 * Math.PI, 0.9 * Math.PI);
  } else if (mood === 'sad') {
    ctx.arc(faceX + 3, eyeY + 12, 5, 1.1 * Math.PI, 1.9 * Math.PI);
  } else {
    ctx.moveTo(faceX, eyeY + 9);
    ctx.lineTo(faceX + 6, eyeY + 9);
  }
  ctx.stroke();

  ctx.restore();
}

// Vector storefront with awning and open sign
export function drawShop(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  primaryColor: string,
  accentColor: string
) {
  ctx.save();
  ctx.translate(x, y);

  // Shop Building Box
  const wallGrad = ctx.createLinearGradient(0, 0, 0, h);
  wallGrad.addColorStop(0, '#1e293b');
  wallGrad.addColorStop(1, '#0f172a');
  ctx.fillStyle = wallGrad;
  drawRoundedRect(ctx, 0, 40, w, h - 40, 12);
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#334155';
  ctx.stroke();

  // Glass Window
  const winW = w * 0.45;
  const winH = (h - 40) * 0.55;
  const winX = w * 0.08;
  const winY = 60;
  ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
  drawRoundedRect(ctx, winX, winY, winW, winH, 8);
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
  ctx.stroke();

  // Window reflection diagonal
  ctx.save();
  ctx.clip();
  ctx.fillStyle = 'rgba(255,255,255,0.1)';
  ctx.beginPath();
  ctx.moveTo(winX - 10, winY + winH);
  ctx.lineTo(winX + winW * 0.6, winY);
  ctx.lineTo(winX + winW * 0.8, winY);
  ctx.lineTo(winX + 10, winY + winH);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Door
  const doorW = w * 0.32;
  const doorH = (h - 40) * 0.75;
  const doorX = w * 0.6;
  const doorY = h - doorH;
  ctx.fillStyle = '#1e1b4b';
  drawRoundedRect(ctx, doorX, doorY, doorW, doorH, 6);
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#475569';
  ctx.stroke();

  // Door knob
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.arc(doorX + 8, doorY + doorH * 0.5, 4, 0, Math.PI * 2);
  ctx.fill();

  // "OPEN" glowing sign above door
  ctx.fillStyle = '#10b981';
  drawRoundedRect(ctx, doorX + 4, doorY + 12, doorW - 8, 16, 4);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 9px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('OPEN', doorX + doorW / 2, doorY + 20);

  // Striped Awning at the top
  const awningH = 46;
  const stripeCount = 9;
  const stripeW = (w + 24) / stripeCount;
  const awningY = 8;
  const startAwningX = -12;

  // Awning drop shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(-10, awningY + awningH - 4, w + 20, 8);

  for (let s = 0; s < stripeCount; s++) {
    const sx = startAwningX + s * stripeW;
    ctx.fillStyle = s % 2 === 0 ? primaryColor : '#ffffff';

    ctx.beginPath();
    ctx.moveTo(sx, awningY);
    ctx.lineTo(sx + stripeW, awningY);
    ctx.lineTo(sx + stripeW, awningY + awningH - 10);
    // Scalloped bottom edge
    ctx.quadraticCurveTo(
      sx + stripeW / 2,
      awningY + awningH + 4,
      sx,
      awningY + awningH - 10
    );
    ctx.closePath();
    ctx.fill();

    // Darker crease lines
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  ctx.restore();
}

// Smartphone vector with screen content and expandable waves
export function drawPhone(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  options: {
    screenColor?: string;
    showWaves?: boolean;
    wavePhase?: number;
    primaryColor?: string;
  } = {}
) {
  const {
    screenColor = '#0b1329',
    showWaves = false,
    wavePhase = 0,
    primaryColor = '#10b981',
  } = options;

  ctx.save();
  ctx.translate(x, y);

  // Phone body with smooth rounded corners
  const r = 24;

  // Drop shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
  ctx.shadowBlur = 28;
  ctx.shadowOffsetY = 12;

  // Phone Outer Bezel
  ctx.fillStyle = '#0f172a';
  drawRoundedRect(ctx, 0, 0, w, h, r);
  ctx.fill();

  // Reset shadow for inner elements
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;

  // Metal Rim
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#334155';
  ctx.stroke();

  // Inner Screen
  const pad = 8;
  ctx.fillStyle = screenColor;
  drawRoundedRect(ctx, pad, pad, w - pad * 2, h - pad * 2, r - 6);
  ctx.fill();

  // Speaker Notch at top
  ctx.fillStyle = '#020617';
  drawRoundedRect(ctx, w / 2 - 28, pad + 4, 56, 12, 6);
  ctx.fill();

  // Camera lens dot
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.arc(w / 2 + 18, pad + 10, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Expanding Signal / Broadcast Waves
  if (showWaves) {
    ctx.save();
    const cx = w / 2;
    const cy = pad + 10;
    for (let i = 0; i < 3; i++) {
      const p = (wavePhase + i * 0.33) % 1;
      const waveRadius = 30 + p * 120;
      const alpha = (1 - p) * 0.7;

      ctx.strokeStyle = hexToRgba(primaryColor, alpha);
      ctx.lineWidth = 3 * (1 - p * 0.5);
      ctx.beginPath();
      ctx.arc(cx, cy, waveRadius, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Home bar at bottom
  ctx.fillStyle = '#94a3b8';
  drawRoundedRect(ctx, w / 2 - 24, h - pad - 8, 48, 4, 2);
  ctx.fill();

  ctx.restore();
}

// Vector Icons
export function drawIcon(
  ctx: CanvasRenderingContext2D,
  name: string,
  x: number,
  y: number,
  size: number,
  color: string
) {
  ctx.save();
  ctx.translate(x, y);
  const s = size / 48; // normalized to 48px baseline
  ctx.scale(s, s);

  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 3.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  switch (name) {
    case 'status': {
      // Segmented status circle (like WhatsApp / IG story ring)
      const count = 4;
      const radius = 18;
      for (let i = 0; i < count; i++) {
        const start = (i * (2 * Math.PI / count)) + 0.15;
        const end = ((i + 1) * (2 * Math.PI / count)) - 0.15;
        ctx.beginPath();
        ctx.arc(0, 0, radius, start, end);
        ctx.stroke();
      }
      // Inner dot
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'people': {
      // 3 user group silhouettes
      // Center person
      ctx.beginPath();
      ctx.arc(0, -8, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, 16, 14, Math.PI, 0);
      ctx.stroke();

      // Left person
      ctx.beginPath();
      ctx.arc(-13, -3, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(-13, 17, 10, Math.PI * 1.1, 0);
      ctx.stroke();

      // Right person
      ctx.beginPath();
      ctx.arc(13, -3, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(13, 17, 10, Math.PI, Math.PI * 1.9);
      ctx.stroke();
      break;
    }

    case 'network': {
      // Interconnected glowing nodes
      const nodes = [
        { x: 0, y: -14 },
        { x: -15, y: 10 },
        { x: 15, y: 10 },
        { x: 0, y: 4 },
      ];
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(nodes[0].x, nodes[0].y);
      ctx.lineTo(nodes[1].x, nodes[1].y);
      ctx.lineTo(nodes[2].x, nodes[2].y);
      ctx.closePath();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(nodes[0].x, nodes[0].y);
      ctx.lineTo(nodes[3].x, nodes[3].y);
      ctx.lineTo(nodes[1].x, nodes[1].y);
      ctx.moveTo(nodes[3].x, nodes[3].y);
      ctx.lineTo(nodes[2].x, nodes[2].y);
      ctx.stroke();

      for (const n of nodes) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, 4.5, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    case 'coin': {
      // 3D Gold / Currency coin with rim & ₦ or $
      ctx.beginPath();
      ctx.arc(0, 0, 18, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.stroke();

      // Currency letter
      ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('₦', 0, 1);
      break;
    }

    case 'bell': {
      // Ringing notification bell
      ctx.beginPath();
      ctx.arc(0, -6, 12, Math.PI, 0);
      ctx.lineTo(14, 8);
      ctx.lineTo(-14, 8);
      ctx.closePath();
      ctx.stroke();

      // Clapper
      ctx.beginPath();
      ctx.arc(0, 12, 4, 0, Math.PI * 2);
      ctx.fill();

      // Small sound ripples
      ctx.beginPath();
      ctx.arc(-18, -4, 4, Math.PI * 0.7, Math.PI * 1.3);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(18, -4, 4, Math.PI * 1.7, Math.PI * 2.3);
      ctx.stroke();
      break;
    }

    case 'rocket': {
      // Sleek rocket
      ctx.beginPath();
      ctx.moveTo(0, -18);
      ctx.quadraticCurveTo(12, -4, 9, 12);
      ctx.lineTo(-9, 12);
      ctx.quadraticCurveTo(-12, -4, 0, -18);
      ctx.closePath();
      ctx.stroke();

      // Window
      ctx.beginPath();
      ctx.arc(0, -2, 4, 0, Math.PI * 2);
      ctx.fill();

      // Fins
      ctx.beginPath();
      ctx.moveTo(-9, 6);
      ctx.lineTo(-17, 14);
      ctx.lineTo(-9, 14);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(9, 6);
      ctx.lineTo(17, 14);
      ctx.lineTo(9, 14);
      ctx.closePath();
      ctx.fill();
      break;
    }

    case 'shield':
    default: {
      // Security shield
      ctx.beginPath();
      ctx.moveTo(0, -18);
      ctx.lineTo(16, -10);
      ctx.quadraticCurveTo(16, 8, 0, 18);
      ctx.quadraticCurveTo(-16, 8, -16, -10);
      ctx.closePath();
      ctx.stroke();

      // Checkmark inside shield
      ctx.beginPath();
      ctx.moveTo(-6, 0);
      ctx.lineTo(-1, 5);
      ctx.lineTo(7, -4);
      ctx.stroke();
      break;
    }
  }

  ctx.restore();
}

// Checkmark badge with pop animation
export function drawCheckmarkBadge(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  scale: number = 1
) {
  if (scale <= 0) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  ctx.fillStyle = '#10b981';
  ctx.shadowColor = 'rgba(16, 185, 129, 0.45)';
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = radius * 0.28;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  ctx.moveTo(-radius * 0.45, 0);
  ctx.lineTo(-radius * 0.1, radius * 0.38);
  ctx.lineTo(radius * 0.48, -radius * 0.35);
  ctx.stroke();

  ctx.restore();
}

// Rotating starburst badge for offers
export function drawStarburst(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  outerRadius: number,
  innerRadius: number,
  points: number,
  rotationAngle: number,
  primaryColor: string,
  accentColor: string
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotationAngle);

  // Gradient fill for starburst
  const grad = ctx.createRadialGradient(0, 0, 10, 0, 0, outerRadius);
  grad.addColorStop(0, '#fef08a');
  grad.addColorStop(0.5, accentColor);
  grad.addColorStop(1, primaryColor);

  ctx.shadowColor = hexToRgba(accentColor, 0.55);
  ctx.shadowBlur = 30;

  ctx.fillStyle = grad;
  ctx.beginPath();

  const step = Math.PI / points;
  for (let i = 0; i < 2 * points; i++) {
    const r = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = i * step;
    const px = Math.cos(angle) * r;
    const py = Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();

  // Shiny inner border ring
  ctx.shadowColor = 'transparent';
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#ffffff';
  ctx.stroke();

  ctx.restore();
}

// Animated flickering flames
export function drawFlames(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  t: number
) {
  ctx.save();
  ctx.translate(x, y);

  const flameCount = 5;
  const colW = w / flameCount;

  for (let i = 0; i < flameCount; i++) {
    const fx = i * colW;
    const flicker = Math.sin(t * 18 + i * 2.3) * 12 + Math.cos(t * 26 + i) * 6;
    const fh = h + flicker;

    // Outer flame (Orange/Red)
    const flameGrad = ctx.createLinearGradient(0, 0, 0, -fh);
    flameGrad.addColorStop(0, '#ef4444');
    flameGrad.addColorStop(0.5, '#f97316');
    flameGrad.addColorStop(1, '#eab308');

    ctx.fillStyle = flameGrad;
    ctx.beginPath();
    ctx.moveTo(fx, 0);
    ctx.quadraticCurveTo(fx - colW * 0.3, -fh * 0.6, fx + colW * 0.5, -fh);
    ctx.quadraticCurveTo(fx + colW * 1.3, -fh * 0.6, fx + colW, 0);
    ctx.closePath();
    ctx.fill();

    // Inner bright core (Yellow/White)
    const coreGrad = ctx.createLinearGradient(0, 0, 0, -fh * 0.65);
    coreGrad.addColorStop(0, '#fbbf24');
    coreGrad.addColorStop(1, '#ffffff');

    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.moveTo(fx + colW * 0.2, 0);
    ctx.quadraticCurveTo(fx + colW * 0.1, -fh * 0.35, fx + colW * 0.5, -fh * 0.65);
    ctx.quadraticCurveTo(fx + colW * 0.9, -fh * 0.35, fx + colW * 0.8, 0);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
}

// 3D tumbling gold coin
export function draw3DCoin(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  rotX: number,
  rotY: number
) {
  ctx.save();
  ctx.translate(x, y);

  const cosX = Math.cos(rotX);
  const cosY = Math.cos(rotY);

  const rx = radius * Math.max(0.12, Math.abs(cosY));
  const ry = radius * Math.max(0.12, Math.abs(cosX));

  // Outer gold rim
  const goldGrad = ctx.createLinearGradient(-radius, -radius, radius, radius);
  goldGrad.addColorStop(0, '#fef08a');
  goldGrad.addColorStop(0.3, '#f59e0b');
  goldGrad.addColorStop(0.7, '#d97706');
  goldGrad.addColorStop(1, '#78350f');

  ctx.fillStyle = goldGrad;
  ctx.beginPath();
  ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();

  // Edge thickness
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#fef08a';
  ctx.stroke();

  // Coin face emblem
  if (rx > 10 && ry > 10) {
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.floor(radius * 0.8)}px "Plus Jakarta Sans", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('₦', 0, 1);
  }

  ctx.restore();
}

// Green and white wipe transitions between scenes
export function drawWipeTransition(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  progress: number, // 0 to 1
  primaryColor: string,
  accentColor: string
) {
  if (progress <= 0 || progress >= 1) return;

  ctx.save();
  // Cut angle sweep from left to right
  const sweep = progress * (w + h * 0.6);
  const angleOffset = h * 0.4;

  // Layer 1: Emerald/Primary wipe
  ctx.fillStyle = primaryColor;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(sweep, 0);
  ctx.lineTo(sweep - angleOffset, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();

  // Layer 2: White bright streak
  const streakW = 40;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(sweep - streakW, 0);
  ctx.lineTo(sweep, 0);
  ctx.lineTo(sweep - angleOffset, h);
  ctx.lineTo(sweep - angleOffset - streakW, h);
  ctx.closePath();
  ctx.fill();

  // Layer 3: Accent tip
  ctx.fillStyle = accentColor;
  ctx.beginPath();
  ctx.moveTo(sweep - streakW * 2, 0);
  ctx.lineTo(sweep - streakW, 0);
  ctx.lineTo(sweep - angleOffset - streakW, h);
  ctx.lineTo(sweep - angleOffset - streakW * 2, h);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

// Color utility
export function hexToRgba(hex: string, alpha: number = 1): string {
  let c = hex.replace('#', '');
  if (c.length === 3) {
    c = c.split('').map(x => x + x).join('');
  }
  const num = parseInt(c, 16);
  if (isNaN(num)) return `rgba(16, 185, 129, ${alpha})`;
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
