// Author: Claude Opus 5.5
// Date: 2026-10-04
// PURPOSE: One CLI for every video in src/songs.ts, by slug. Composition id = PascalCase(slug);
//          thumbnail Stills are every composition named {Id}*Thumb ({Id}Thumb -> thumbnail.jpg,
//          {Id}V1Thumb -> thumbnail-v1.jpg), written straight into the site's public/video/{slug}/.
// SRP/DRY check: Pass - replaces per-song npm scripts; ids come from the registry via `remotion compositions`.
//
// Usage (from video/):
//   node scripts/video.mjs render  <slug>            1080p master -> out/{slug}.mp4
//   node scripts/video.mjs preview <slug>            720p animatic -> out/{slug}-preview.mp4
//   node scripts/video.mjs web     <slug>            re-encode the master for the web -> out/{slug}-web.mp4
//   node scripts/video.mjs still   <slug> <frame>    half-scale frame -> out/{slug}-{frame}.png
//   node scripts/video.mjs thumb   <slug>            every thumbnail -> ../public/video/{slug}/
import { execSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const [cmd, slug, arg] = process.argv.slice(2);
if (!cmd || !slug) {
  console.error('usage: node scripts/video.mjs <render|preview|web|still|thumb> <slug> [frame]');
  process.exit(1);
}
const id = slug.split('-').map((p) => p[0].toUpperCase() + p.slice(1)).join('');
const run = (c) => { console.log(`> ${c}`); execSync(c, { cwd: ROOT, stdio: 'inherit' }); };
const remotion = (args) => run(`npx remotion ${args}`);

switch (cmd) {
  case 'render':
    remotion(`render src/index.ts ${id} out/${slug}.mp4 --crf=26`);
    break;
  case 'preview':
    remotion(`render src/index.ts ${id} out/${slug}-preview.mp4 --scale=0.6666666666666666 --crf=28`);
    break;
  case 'web':
    remotion(`ffmpeg -y -i out/${slug}.mp4 -s 1280x720 -c:v libx264 -preset slow -crf 30 -c:a aac -b:a 192k out/${slug}-web.mp4`);
    break;
  case 'still':
    remotion(`still src/index.ts ${id} out/${slug}-${arg ?? 0}.png --frame=${arg ?? 0} --scale=0.5`);
    break;
  case 'thumb': {
    const list = execSync('npx remotion compositions src/index.ts --quiet', { cwd: ROOT }).toString();
    const thumbs = list.split(/\s+/).filter((t) => new RegExp(`^${id}(\w*)Thumb$`).test(t));
    if (!thumbs.length) throw new Error(`no ${id}*Thumb stills registered in src/songs.ts`);
    const outDir = join(ROOT, '..', 'public', 'video', slug);
    mkdirSync(outDir, { recursive: true });
    for (const t of thumbs) {
      const suffix = t.slice(id.length, -'Thumb'.length).toLowerCase();
      const file = `thumbnail${suffix ? `-${suffix}` : ''}.jpg`;
      remotion(`still src/index.ts ${t} "${join(outDir, file)}" --image-format=jpeg --jpeg-quality=88`);
    }
    break;
  }
  default:
    console.error(`unknown command ${cmd}`);
    process.exit(1);
}
