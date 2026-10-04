// Author: Claude Opus 5.5
// Date: 2026-10-04
// PURPOSE: Copy each song's master audio from the site's public/ into video/public/ so Remotion
//          can serve it with staticFile(). Copies instead of pointing publicDir at ../public,
//          which would bundle the site's ~750 MB of assets into every render.
// SRP/DRY check: Pass - audio paths come from each data/{slug}/scenes.json, not hardcoded here.
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
for (const slug of readdirSync(join(root, 'data'))) {
  if (!existsSync(join(root, 'data', slug, 'scenes.json'))) continue; // stills-only folders have no audio yet
  const { audio } = JSON.parse(readFileSync(join(root, 'data', slug, 'scenes.json'), 'utf8'));
  const dest = join(root, 'public', audio);
  mkdirSync(dirname(dest), { recursive: true });
  cpSync(join(root, '..', 'public', audio), dest);
  console.log(`synced ${audio}`);
}
