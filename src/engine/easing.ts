// Easing functions for smooth 2D canvas animation

export function clamp(val: number, min: number = 0, max: number = 1): number {
  return Math.max(min, Math.min(max, val));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function easeOutCubic(x: number): number {
  const t = clamp(x, 0, 1);
  return 1 - Math.pow(1 - t, 3);
}

export function easeInCubic(x: number): number {
  const t = clamp(x, 0, 1);
  return t * t * t;
}

export function easeInOutCubic(x: number): number {
  const t = clamp(x, 0, 1);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function easeOutBack(x: number, c1: number = 1.70158): number {
  const t = clamp(x, 0, 1);
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

export function easeInBack(x: number, c1: number = 1.70158): number {
  const t = clamp(x, 0, 1);
  const c3 = c1 + 1;
  return c3 * t * t * t - c1 * t * t;
}

export function easeOutBounce(x: number): number {
  const t = clamp(x, 0, 1);
  const n1 = 7.5625;
  const d1 = 2.75;

  if (t < 1 / d1) {
    return n1 * t * t;
  } else if (t < 2 / d1) {
    const t2 = t - 1.5 / d1;
    return n1 * t2 * t2 + 0.75;
  } else if (t < 2.5 / d1) {
    const t2 = t - 2.25 / d1;
    return n1 * t2 * t2 + 0.9375;
  } else {
    const t2 = t - 2.625 / d1;
    return n1 * t2 * t2 + 0.984375;
  }
}

export function easeInOutQuad(x: number): number {
  const t = clamp(x, 0, 1);
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

export function easeOutQuad(x: number): number {
  const t = clamp(x, 0, 1);
  return 1 - (1 - t) * (1 - t);
}
