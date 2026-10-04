// Author: Claude Opus 5.5
// Date: 2026-10-04
// PURPOSE: Generate reference stills (OpenRouter Images API) and video shots (OpenRouter Videos
//          API) for a music video. Idempotent: anything already on disk is skipped, so re-runs
//          never re-pay. Every paid call is appended to data/{slug}/ledger.json with its cost.
// SRP/DRY check: Pass - single generation entry point; prompts live in stills.json / shots.json.
//
// Usage (from video/, key in video/.env as OPENROUTER_API_KEY):
//   node scripts/generate.mjs stills   system-prompt [id ...]
//   node scripts/generate.mjs segments system-prompt          # cut vocal segments into ../public (must be deployed before shots)
//   node scripts/generate.mjs shots    system-prompt [id ...]
// Audio references must be public HTTPS URLs (OpenRouter rejects data: audio), so lip-sync
// segments are published on voynichlabs.org under /video/{slug}/segments/ and referenced from there.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const API = 'https://openrouter.ai/api/v1';

const env = Object.fromEntries(
  readFileSync(join(ROOT, '.env'), 'utf8')
    .split(/\r?\n/)
    .filter((l) => l.includes('='))
    .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]),
);
const KEY = env.OPENROUTER_API_KEY;
if (!KEY) throw new Error('OPENROUTER_API_KEY missing from video/.env');
const auth = { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' };

const [mode, slug, ...only] = process.argv.slice(2);
if (!['stills', 'segments', 'shots'].includes(mode) || !slug) {
  console.error('usage: node scripts/generate.mjs <stills|segments|shots> <slug> [id ...]');
  process.exit(1);
}
const dataDir = join(ROOT, 'data', slug);
const refsDir = join(dataDir, 'refs');
const clipsDir = join(ROOT, 'public', 'clips', slug);
const ledgerPath = join(dataDir, 'ledger.json');
const ledger = existsSync(ledgerPath) ? JSON.parse(readFileSync(ledgerPath, 'utf8')) : [];
const log = (entry) => {
  ledger.push({ at: new Date().toISOString(), ...entry });
  writeFileSync(ledgerPath, JSON.stringify(ledger, null, 1));
};
const pick = (items) => items.filter((x) => !only.length || only.includes(x.id));

const dataUri = (path, mime) => `data:${mime};base64,${readFileSync(path).toString('base64')}`;
const refImage = (id) => ({ type: 'image_url', image_url: { url: dataUri(join(refsDir, `${id}.png`), 'image/png') } });

async function stills() {
  const cfg = JSON.parse(readFileSync(join(dataDir, 'stills.json'), 'utf8'));
  mkdirSync(refsDir, { recursive: true });
  for (const s of pick(cfg.stills)) {
    const out = join(refsDir, `${s.id}.png`);
    if (existsSync(out)) { console.log(`skip ${s.id} (exists)`); continue; }
    const body = {
      model: s.model ?? cfg.model,
      prompt: `${s.prompt} ${cfg.style}`,
      aspect_ratio: cfg.aspect_ratio,
      resolution: cfg.resolution,
      ...(s.refs?.length ? { input_references: s.refs.map(refImage) } : {}),
    };
    const res = await fetch(`${API}/images`, { method: 'POST', headers: auth, body: JSON.stringify(body) });
    const json = await res.json();
    if (!res.ok || !json.data?.[0]?.b64_json) {
      console.error(`FAIL ${s.id}: ${res.status} ${JSON.stringify(json).slice(0, 400)}`);
      continue;
    }
    writeFileSync(out, Buffer.from(json.data[0].b64_json, 'base64'));
    const cost = json.usage?.cost ?? null;
    log({ kind: 'still', id: s.id, model: body.model, cost });
    console.log(`ok   ${s.id}  $${cost ?? '?'}`);
  }
}

/** Cut each lip-sync shot's vocal window into ../public/video/{slug}/segments/ (Remotion's bundled ffmpeg). */
function segments() {
  const cfg = JSON.parse(readFileSync(join(dataDir, 'shots.json'), 'utf8'));
  const book = JSON.parse(readFileSync(join(dataDir, 'scenes.json'), 'utf8'));
  const src = join(ROOT, '..', 'public', book.audio);
  const outDir = join(ROOT, '..', 'public', 'video', slug, 'segments');
  mkdirSync(outDir, { recursive: true });
  for (const s of cfg.shots.filter((x) => x.audio)) {
    const out = join(outDir, `${s.id}.mp3`);
    execFileSync('npx remotion ffmpeg', ['-y', '-loglevel', 'error', '-ss', String(s.audio.start), '-to', String(s.audio.end), '-i', `"${src}"`, '-ac', '1', '-c:a', 'libmp3lame', '-b:a', '128k', `"${out}"`], { cwd: ROOT, shell: true });
    console.log(`cut ${s.id} (${s.audio.start}-${s.audio.end}s)`);
  }
}

async function submitAndWait(shot, body) {
  const res = await fetch(`${API}/videos`, { method: 'POST', headers: auth, body: JSON.stringify(body) });
  const job = await res.json();
  if (!res.ok || !job.id) throw new Error(`${res.status} ${JSON.stringify(job).slice(0, 500)}`);
  console.log(`  submitted ${shot.id} -> ${job.id}`);
  for (;;) {
    await new Promise((r) => setTimeout(r, 15000));
    const poll = await (await fetch(job.polling_url ?? `${API}/videos/${job.id}`, { headers: auth })).json();
    if (poll.status === 'completed') return poll;
    if (['failed', 'cancelled', 'expired'].includes(poll.status)) throw new Error(`${poll.status}: ${JSON.stringify(poll.error ?? poll).slice(0, 500)}`);
  }
}

async function shots() {
  const cfg = JSON.parse(readFileSync(join(dataDir, 'shots.json'), 'utf8'));
  mkdirSync(clipsDir, { recursive: true });
  const todo = pick(cfg.shots).filter((s) => {
    if (existsSync(join(clipsDir, `${s.id}.mp4`))) { console.log(`skip ${s.id} (exists)`); return false; }
    return true;
  });
  // At most 4 in flight: more triggers OpenRouter 429 "in-flight requests" (Mac Mini runs, Oct 2026).
  const queue = [...todo];
  const worker = async () => { for (let s; (s = queue.shift()); ) await one(s); };
  await Promise.all(Array.from({ length: Math.min(4, queue.length) }, worker));
}

async function one(s) {
  const cfg = JSON.parse(readFileSync(join(dataDir, 'shots.json'), 'utf8'));
  {
    const body = {
      model: s.model,
      prompt: s.prompt ? `${s.prompt} ${cfg.style ?? ''}`.trim() : undefined,
      ...(s.duration ? { duration: s.duration } : {}),
      ...(s.resolution ?? cfg.resolution ? { resolution: s.resolution ?? cfg.resolution } : {}),
      aspect_ratio: s.aspect_ratio ?? cfg.aspect_ratio ?? '16:9',
      ...(cfg.generate_audio !== undefined ? { generate_audio: cfg.generate_audio } : {}),
    };
    if (s.first || s.last) {
      body.frame_images = [
        ...(s.first ? [{ ...refImage(s.first), frame_type: 'first_frame' }] : []),
        ...(s.last ? [{ ...refImage(s.last), frame_type: 'last_frame' }] : []),
      ];
    }
    if (s.audio) {
      // Reference mode (no frame_images, which would take precedence): persona still + vocal segment.
      body.input_references = [
        refImage(s.ref),
        { type: 'audio_url', audio_url: { url: `${cfg.audioBase}${s.id}.mp3` } },
      ];
    }
    if (s.provider) body.provider = s.provider;
    try {
      const done = await submitAndWait(s, body);
      const vid = await fetch(done.unsigned_urls[0], { headers: { Authorization: auth.Authorization } });
      writeFileSync(join(clipsDir, `${s.id}.mp4`), Buffer.from(await vid.arrayBuffer()));
      log({ kind: 'shot', id: s.id, model: s.model, job: done.id, cost: done.usage?.cost ?? null });
      console.log(`ok   ${s.id}  $${done.usage?.cost ?? '?'}`);
    } catch (e) {
      log({ kind: 'shot-failed', id: s.id, model: s.model, error: String(e.message).slice(0, 300) });
      console.error(`FAIL ${s.id}: ${e.message}`);
    }
  }
}

await ({ stills, segments, shots }[mode])();
const spent = ledger.reduce((a, e) => a + (Number(e.cost) || 0), 0);
console.log(`ledger total: $${spent.toFixed(3)}`);
