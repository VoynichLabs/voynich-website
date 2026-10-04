// Author: Claude Opus 5.5
// Date: 2026-10-04
// PURPOSE: Write web-sized WebP copies of every large PNG/JPG under public/ into a mirror
//          tree at public/img-opt/ — "{path}.full.webp" (max 1600px wide) and
//          "{path}.thumb.webp" (640px wide, for gallery grids). Originals are never touched
//          (they stay as download links and og:image). Copies live outside public/generated
//          because the museum lists every image file in that folder.
//          Idempotent: skips any copy newer than its source, so `prebuild` stays fast.
//          Pages pick the copies up through src/lib/optimized-image.ts.
// SRP/DRY check: Pass — the only image-conversion step in the repo.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const PUBLIC = path.resolve('public');
const OUT = path.join(PUBLIC, 'img-opt');
const MIN_BYTES = 300 * 1024;
const SKIP_DIRS = new Set(['img-opt', '_review', 'audio']);
const VARIANTS = [
  { name: 'full', width: 1600, quality: 80 },
  { name: 'thumb', width: 640, quality: 72 },
];

function* walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (!SKIP_DIRS.has(e.name)) yield* walk(p); }
    else if (/\.(png|jpe?g)$/i.test(e.name)) yield p;
  }
}

let made = 0, skipped = 0, saved = 0;
for (const src of walk(PUBLIC)) {
  const stat = fs.statSync(src);
  if (stat.size < MIN_BYTES) continue;
  const rel = path.relative(PUBLIC, src).replace(/\.(png|jpe?g)$/i, '');
  for (const v of VARIANTS) {
    const dest = path.join(OUT, `${rel}.${v.name}.webp`);
    if (fs.existsSync(dest) && fs.statSync(dest).mtimeMs >= stat.mtimeMs) { skipped++; continue; }
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    const info = await sharp(src)
      .resize({ width: v.width, withoutEnlargement: true })
      .webp({ quality: v.quality, effort: 5 })
      .toFile(dest);
    if (v.name === 'full') saved += stat.size - info.size;
    made++;
  }
}
console.log(`optimize-images: ${made} written, ${skipped} up to date, ~${(saved / 1e6).toFixed(0)} MB saved on full-size copies`);
