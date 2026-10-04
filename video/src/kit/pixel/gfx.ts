// Author: Claude Opus 5.5
// Date: 2026-10-04
// PURPOSE: Pixel-art drawing kit for low-resolution canvas scenes (480x270, shown 4x with hard
//          pixels by PixelCanvas). Deterministic: every random value is a hash of a seed so the
//          same frame always renders the same pixels (Remotion renders frames out of order).
//          Provides rects, grid sprites, a pixel font, lines, circles, bulbs, starfields, and a
//          post-process glitch (slice displacement + RGB split) applied to the finished frame.
// SRP/DRY check: Pass - song-agnostic primitives only; nothing here knows about any one video.
import { loadFont as loadPress } from '@remotion/google-fonts/PressStart2P';

export const PW = 480;
export const PH = 270;
export const pixelFont = loadPress('normal', { weights: ['400'], subsets: ['latin'] }).fontFamily;

export type Ctx = CanvasRenderingContext2D;
export type Palette = Record<string, string>;

/** Hash an integer (or float) to [0,1). */
export const hash = (n: number): number => {
  let x = Math.floor(n * 9973) ^ 0x5bd1e995;
  x = Math.imul(x ^ (x >>> 15), 0x2c1b3c6d);
  x = Math.imul(x ^ (x >>> 12), 0x297a2d39);
  x ^= x >>> 15;
  return (x >>> 0) / 4294967296;
};
/** Seeded generator: rng(seed)() yields a deterministic sequence. */
export const rng = (seed: number) => {
  let a = (Math.floor(seed * 7919) + 0x6d2b79f5) >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
/** 0..1 progress of t through [a,b], clamped. */
export const prog = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
export const easeOut = (k: number) => 1 - (1 - k) ** 3;
export const easeIn = (k: number) => k ** 3;
/** Overshooting "slam" ease for things that pop in. */
export const slam = (k: number) => (k >= 1 ? 1 : 1 + 2.2 * (k - 1) ** 3 + 1.2 * (k - 1) ** 2);

export const rect = (ctx: Ctx, x: number, y: number, w: number, h: number, c: string) => {
  ctx.fillStyle = c;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
};

export const frame = (ctx: Ctx, x: number, y: number, w: number, h: number, c: string, t = 1) => {
  rect(ctx, x, y, w, t, c);
  rect(ctx, x, y + h - t, w, t, c);
  rect(ctx, x, y, t, h, c);
  rect(ctx, x + w - t, y, t, h, c);
};

/**
 * Draw a sprite given as rows of characters; each character maps to a palette colour and
 * '.' or ' ' is transparent. Runs of one colour are merged into a single fillRect.
 */
export const sprite = (ctx: Ctx, rows: string[], pal: Palette, x: number, y: number, k = 1, flip = false) => {
  const w = rows.reduce((m, r) => Math.max(m, r.length), 0);
  x = Math.round(x);
  y = Math.round(y);
  rows.forEach((row, j) => {
    let i = 0;
    while (i < row.length) {
      const ch = row[i];
      let n = 1;
      while (i + n < row.length && row[i + n] === ch) n++;
      if (ch !== '.' && ch !== ' ' && pal[ch]) {
        ctx.fillStyle = pal[ch];
        const sx = flip ? w - i - n : i;
        ctx.fillRect(x + sx * k, y + j * k, n * k, k);
      }
      i += n;
    }
  });
};
export const spriteSize = (rows: string[], k = 1) => ({ w: rows.reduce((m, r) => Math.max(m, r.length), 0) * k, h: rows.length * k });

/** Pixel-font text. Size should be a multiple of 8 for crisp glyphs. */
export const text = (
  ctx: Ctx,
  s: string,
  x: number,
  y: number,
  c: string,
  size = 8,
  align: CanvasTextAlign = 'left',
  shadow?: string,
) => {
  ctx.font = `${size}px "${pixelFont}"`;
  ctx.textAlign = align;
  ctx.textBaseline = 'top';
  if (shadow) {
    ctx.fillStyle = shadow;
    ctx.fillText(s, Math.round(x) + Math.max(1, size / 8), Math.round(y) + Math.max(1, size / 8));
  }
  ctx.fillStyle = c;
  ctx.fillText(s, Math.round(x), Math.round(y));
};
export const textWidth = (ctx: Ctx, s: string, size = 8) => {
  ctx.font = `${size}px "${pixelFont}"`;
  return ctx.measureText(s).width;
};

/** Bresenham line, w pixels thick. */
export const line = (ctx: Ctx, x0: number, y0: number, x1: number, y1: number, c: string, w = 1) => {
  x0 = Math.round(x0);
  y0 = Math.round(y0);
  x1 = Math.round(x1);
  y1 = Math.round(y1);
  ctx.fillStyle = c;
  const dx = Math.abs(x1 - x0);
  const dy = -Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  const o = Math.floor(w / 2);
  for (let guard = 0; guard < 4000; guard++) {
    ctx.fillRect(x0 - o, y0 - o, w, w);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      x0 += sx;
    }
    if (e2 <= dx) {
      err += dx;
      y0 += sy;
    }
  }
};

/** Filled or outlined pixel circle. */
export const circle = (ctx: Ctx, cx: number, cy: number, r: number, c: string, fill = true, w = 1) => {
  ctx.fillStyle = c;
  cx = Math.round(cx);
  cy = Math.round(cy);
  const R = Math.round(r);
  for (let y = -R; y <= R; y++) {
    const half = Math.floor(Math.sqrt(Math.max(0, r * r - y * y)));
    if (fill) ctx.fillRect(cx - half, cy + y, half * 2 + 1, 1);
    else {
      const inner = Math.floor(Math.sqrt(Math.max(0, (r - w) * (r - w) - y * y)));
      if (Math.abs(y) > r - w) ctx.fillRect(cx - half, cy + y, half * 2 + 1, 1);
      else {
        ctx.fillRect(cx - half, cy + y, half - inner, 1);
        ctx.fillRect(cx + inner + 1, cy + y, half - inner, 1);
      }
    }
  }
};

/** Marquee bulb: lit bulbs get a small halo. */
export const bulb = (ctx: Ctx, x: number, y: number, on: boolean, c: string, off = '#3a2a1a') => {
  if (on) {
    ctx.globalAlpha = 0.35;
    rect(ctx, x - 1, y - 1, 4, 4, c);
    ctx.globalAlpha = 1;
    rect(ctx, x, y, 2, 2, '#fff8e0');
  } else rect(ctx, x, y, 2, 2, off);
};

/** Row of chasing marquee bulbs around a rectangle. `phase` advances the chase. */
export const bulbFrame = (ctx: Ctx, x: number, y: number, w: number, h: number, phase: number, c: string, gap = 6) => {
  const pts: [number, number][] = [];
  for (let i = 0; i < w; i += gap) pts.push([x + i, y]);
  for (let j = 0; j < h; j += gap) pts.push([x + w, y + j]);
  for (let i = w; i > 0; i -= gap) pts.push([x + i, y + h]);
  for (let j = h; j > 0; j -= gap) pts.push([x, y + j]);
  pts.forEach(([px, py], i) => bulb(ctx, px - 1, py - 1, (i + Math.floor(phase)) % 3 !== 0, c));
};

/** Static starfield / sky speckle. */
export const stars = (ctx: Ctx, n: number, seed: number, t: number, maxY = PH, colors = ['#ffffff', '#9fe8ff', '#ff9ad5']) => {
  for (let i = 0; i < n; i++) {
    const x = Math.floor(hash(seed + i) * PW);
    const y = Math.floor(hash(seed + i + 0.5) * maxY);
    const tw = hash(seed + i + Math.floor(t * 4 + i) * 0.01);
    if (tw > 0.15) rect(ctx, x, y, 1, 1, colors[i % colors.length]);
  }
};

/** Ordered 2x2 dither fill between two colours at density k (0..1). */
export const dither = (ctx: Ctx, x: number, y: number, w: number, h: number, a: string, b: string, k: number) => {
  rect(ctx, x, y, w, h, a);
  if (k <= 0) return;
  ctx.fillStyle = b;
  const m = [0, 2, 3, 1];
  for (let j = 0; j < h; j++)
    for (let i = 0; i < w; i++) if (m[(i % 2) + (j % 2) * 2] / 4 < k) ctx.fillRect(x + i, y + j, 1, 1);
};

/** Vertical gradient in hard bands (no smooth blends, keeps the 8-bit look). */
export const bands = (ctx: Ctx, x: number, y: number, w: number, h: number, colors: string[]) => {
  const bh = h / colors.length;
  colors.forEach((c, i) => rect(ctx, x, y + Math.floor(i * bh), w, Math.ceil(bh) + 1, c));
};

/**
 * Post-process glitch on the finished low-res frame: horizontal slice displacement plus a
 * red/blue channel split. amt 0..1; seed picks which slices tear.
 */
export const glitch = (ctx: Ctx, amt: number, seed: number) => {
  if (amt <= 0.02) return;
  const img = ctx.getImageData(0, 0, PW, PH);
  const src = new Uint8ClampedArray(img.data);
  const d = img.data;
  const r = rng(seed);
  const split = Math.round(1 + amt * 5);
  const slices = Math.floor(2 + amt * 9);
  const shift = new Int16Array(PH);
  for (let s = 0; s < slices; s++) {
    const y0 = Math.floor(r() * PH);
    const hh = Math.floor(2 + r() * 18 * amt);
    const off = Math.round((r() - 0.5) * 60 * amt);
    for (let y = y0; y < Math.min(PH, y0 + hh); y++) shift[y] = off;
  }
  for (let y = 0; y < PH; y++) {
    for (let x = 0; x < PW; x++) {
      const o = (y * PW + x) * 4;
      const sx = Math.min(PW - 1, Math.max(0, x - shift[y]));
      const rx = Math.min(PW - 1, sx + split);
      const bx = Math.max(0, sx - split);
      d[o] = src[(y * PW + rx) * 4];
      d[o + 1] = src[(y * PW + sx) * 4 + 1];
      d[o + 2] = src[(y * PW + bx) * 4 + 2];
    }
  }
  ctx.putImageData(img, 0, 0);
};

/** Shatter the frame into drifting pixel blocks (for collapse/outro moments). amt 0..1. */
export const shatter = (ctx: Ctx, amt: number, seed: number, block = 8) => {
  if (amt <= 0) return;
  const img = ctx.getImageData(0, 0, PW, PH);
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, PW, PH);
  const tmp = document.createElement('canvas');
  tmp.width = PW;
  tmp.height = PH;
  tmp.getContext('2d')!.putImageData(img, 0, 0);
  for (let by = 0; by < PH; by += block)
    for (let bx = 0; bx < PW; bx += block) {
      const h1 = hash(seed + bx * 13.1 + by * 7.7);
      if (h1 < amt * 0.35) continue;
      const dx = (hash(bx + by * 3.3 + 1) - 0.5) * 140 * amt * amt;
      const dy = (hash(bx * 2.1 + by + 2) - 0.2) * 120 * amt * amt;
      ctx.drawImage(tmp, bx, by, block, block, Math.round(bx + dx), Math.round(by + dy), block, block);
    }
};
