export interface TextWrapOptions {
  text: string;
  x: number;
  y: number;
  maxWidth: number;
  maxHeight?: number;
  initialFontSize: number;
  minFontSize?: number;
  lineHeightMultiplier?: number;
  align?: 'left' | 'center' | 'right';
  baseline?: 'top' | 'middle' | 'bottom';
  fontWeight?: string;
  fontFamily?: string;
  color?: string | CanvasGradient;
  shadow?: {
    color: string;
    blur: number;
    offsetX: number;
    offsetY: number;
  };
  stroke?: {
    color: string;
    width: number;
  };
}

export function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  options: TextWrapOptions
): { totalHeight: number; finalFontSize: number; lines: string[] } {
  const {
    text,
    x,
    y,
    maxWidth,
    maxHeight,
    initialFontSize,
    minFontSize = 14,
    lineHeightMultiplier = 1.25,
    align = 'center',
    baseline = 'middle',
    fontWeight = '700',
    fontFamily = '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color = '#ffffff',
    shadow,
    stroke,
  } = options;

  if (!text || text.trim() === '') {
    return { totalHeight: 0, finalFontSize: initialFontSize, lines: [] };
  }

  let fontSize = initialFontSize;
  let lines: string[] = [];
  let lineHeight = fontSize * lineHeightMultiplier;

  // Binary or stepwise decrease to fit within bounds
  while (fontSize >= minFontSize) {
    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    lineHeight = fontSize * lineHeightMultiplier;
    lines = breakTextIntoLines(ctx, text, maxWidth);

    const calculatedHeight = lines.length * lineHeight;
    if (!maxHeight || calculatedHeight <= maxHeight) {
      break;
    }
    fontSize -= 2;
  }

  // Final measure and draw
  ctx.save();
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';

  if (shadow) {
    ctx.shadowColor = shadow.color;
    ctx.shadowBlur = shadow.blur;
    ctx.shadowOffsetX = shadow.offsetX;
    ctx.shadowOffsetY = shadow.offsetY;
  }

  const totalHeight = lines.length * lineHeight;
  let startY = y;

  if (baseline === 'top') {
    startY = y + lineHeight / 2;
  } else if (baseline === 'middle') {
    startY = y - totalHeight / 2 + lineHeight / 2;
  } else if (baseline === 'bottom') {
    startY = y - totalHeight + lineHeight / 2;
  }

  for (let i = 0; i < lines.length; i++) {
    const lineY = startY + i * lineHeight;

    if (stroke) {
      ctx.lineWidth = stroke.width;
      ctx.strokeStyle = stroke.color;
      ctx.strokeText(lines[i], x, lineY);
    }

    ctx.fillStyle = color;
    ctx.fillText(lines[i], x, lineY);
  }

  ctx.restore();
  return { totalHeight, finalFontSize: fontSize, lines };
}

function breakTextIntoLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}
