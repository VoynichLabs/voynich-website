// Author: Claude Opus 5.5
// Date: 2026-10-04
// PURPOSE: Map a public image path to its WebP copy from scripts/optimize-images.mjs
//          ("/generated/x.png" -> "/img-opt/generated/x.full.webp" or ".thumb.webp").
//          Resolved at build time; falls back to the original path when no copy exists
//          (small images, or a copy not generated yet), so callers can use it unconditionally.
// SRP/DRY check: Pass — single place that knows the img-opt naming scheme.
import fs from 'node:fs';
import path from 'node:path';

const PUBLIC_DIR = path.join(process.cwd(), 'public');

export type ImageVariant = 'full' | 'thumb';

export function optimized(src: string, variant: ImageVariant = 'full'): string {
  if (!src.startsWith('/') || !/\.(png|jpe?g)$/i.test(src)) return src;
  const rel = decodeURI(src).replace(/\.(png|jpe?g)$/i, '');
  const candidate = `/img-opt${rel}.${variant}.webp`;
  return fs.existsSync(path.join(PUBLIC_DIR, candidate)) ? encodeURI(candidate) : src;
}
