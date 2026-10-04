# Plan: Music Video Pipeline — Pilot: "System Prompt"
## 4 October 2026

## Purpose
Turn Latent Space tracks into real music videos. Code owns the timeline (audio, beat grid, lyric timing, cuts, motion graphics); AI video models supply shots that slot into it. First video: **System Prompt** (Latent Space track 10, funk/soul, ~2:35).

Creative reference for the pilot: `docs/2026-10-04-system-prompt-scene-book.md`. The scene book gets approved before any paid generation.

Status: **awaiting approval.** No code written yet.

---

## Architecture

```
public/audio/latent-space/system-prompt.mp3  ──┐
public/audio/latent-space/system-prompt_lyrics.txt ─┤
                                                │
  1. analyze/  ── Whisper word alignment ──► timing/system-prompt.words.json
               ── beat/BPM detection     ──► timing/system-prompt.beats.json
               ── Demucs vocal split     ──► stems/system-prompt.vocals.wav
                                                │
  2. shots/system-prompt.shots.json  (built from the scene book)
               ── generate script ──► OpenRouter video models ──► clips/*.mp4 (cached)
                                                │
  3. Remotion composition (video/src/SystemPrompt.tsx)
               audio + beats + words + clips + motion graphics
                                                │
  4. render ──► out/system-prompt-16x9.mp4  (+ 9:16 short cut)
```

### Repo layout (new, additive only)
```
video/                      # separate npm workspace, own package.json — does NOT touch the Astro build
  package.json              # remotion, @remotion/cli, zod
  remotion.config.ts
  src/
    Root.tsx                # registers compositions
    SystemPrompt.tsx        # the pilot composition
    components/             # Terminal, LyricCaption, BeatCut, PersonaCard (reusable across songs)
    lib/timing.ts           # loads words/beats json, frame <-> seconds helpers
  scripts/
    analyze.py              # whisper alignment + beat detection + demucs
    generate-shots.ts       # reads shots.json, calls OpenRouter, caches clips by hash(prompt+model+ref)
  data/system-prompt/
    shots.json              # committed — the edit decision list
    timing/*.json           # committed — generated, small
    refs/*.png              # committed — character reference stills
  .gitignore                # clips/, stems/, out/ are NOT committed (large binaries)
```

Every TS/JS file gets the standard header block per CLAUDE.md.

---

## Phases

### Phase 0 — Approve scene book
- Review `docs/2026-10-04-system-prompt-scene-book.md`, cut/rework scenes, lock the concept and the character.

### Phase 1 — Code-only lyric video (zero generation spend)
- Scaffold `video/` workspace with Remotion.
- `analyze.py`: word-level timestamps (whisperX forced alignment against our lyrics file — the lyrics are ground truth, Whisper only supplies timing), beat grid (librosa), vocal stem (Demucs).
- Build the code-native scenes: terminal typing the system prompt, karaoke captions, beat-synced cuts, title/end cards, all in the site palette (`bg-primary`, `node-blue`, `edge-green`, JetBrains Mono).
- AI-shot slots render as labeled grey placeholders **in local preview only** — never shipped.
- Deliverable: a full-length render where structure, timing, and typography can be judged.

### Phase 2 — Reference stills
- Generate the character reference sheet (one face, several personas) with an image model. Commit chosen stills to `refs/`.
- This is the consistency anchor: every AI shot starts from one of these stills.

### Phase 3 — AI shots
- `generate-shots.ts` fills slots from `shots.json`. Status per shot: `pending | generated | approved | rejected`. Only `pending` shots hit the API; re-renders never re-pay.
- Model routing (per shot, set in `shots.json`):
  | Job | Model(s) |
  |-----|----------|
  | Persona shots, consistent character, first/last-frame control | Seedance 2.5, Kling v3.0 Pro, Wan 3.0 |
  | Lip-synced singing (chorus) | HeyGen Avatar IV (ref still + vocal stem segment) |
  | Hero shots (2–3 max) | Veo 3.1 or Sora 2 Pro |
  | Restyle to match palette | FLUX Video Edit / Runway Aleph 2 |
  | Final upscale of 480p/720p clips | FLUX Video Upscale |
- Generate 2–3 takes per shot on the cheap tier first, promote winners.

### Phase 4 — Finish and ship
- Final render 1920×1080 16:9, plus a 9:16 cut (chorus only) for shorts.
- Hosting decision (see open questions). Embed on `/music/latent-space` under the track's lyrics panel, only for tracks that have a video.
- `CHANGELOG.md` entry when the page changes.

---

## Reuse across songs
`components/` and `scripts/` are song-agnostic. A new video = new `data/{slug}/` folder + scene book + one composition file. Latent Space tracks are the obvious queue (Tool Call, Token Budget, The Harness all have strong visual hooks).

---

## Open questions (need answers before Phase 3)
1. **Budget per video.** OpenRouter's model API doesn't list per-clip prices for these models. Need real numbers before picking tiers. Rough shot count for this pilot: ~18 AI clips × 2–3 takes.
2. **OpenRouter key with video access**, set by you in `video/.env` (gitignored). I won't handle the key.
3. **Hosting.** A 2:35 1080p render is ~60–150 MB — too big for `public/`. Options: YouTube/Vimeo embed, or object storage (R2/S3) with a `<video>` tag.
4. **Who is the singer?** See scene book — a human-looking soul singer, Larry the lobster, or an abstract figure. Changes every AI shot.
5. **Local tooling.** Phase 1 needs ffmpeg, Python (whisperX, librosa, demucs) on this machine. ffmpeg is not currently on PATH.

---

## Not in scope
- No changes to existing pages until Phase 4.
- No AI-generated audio — the track is the track.
- No placeholder shots in anything shipped (CLAUDE.md rule 4).
