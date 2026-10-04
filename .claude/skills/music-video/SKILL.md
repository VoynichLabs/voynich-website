---
name: music-video
description: Make a music video for a VoynichLabs song (Remotion code scenes + HeyGen Video 1 generated shots via OpenRouter), publish it to YouTube and the site. Use when Mark asks to make, plan, redo, animate or upload a music video, or to turn a still-image Short into a video.
---

# Music video workflow (VoynichLabs)

Mark writes the songs; that's the hard part. Our job is the picture. Everything lives in `video/` (separate Remotion workspace, its own `package.json`); the public site is the Astro app at the repo root.

Reference files (read when you reach that step):
- `references/generation.md`: OpenRouter image/video APIs, HeyGen Video 1 quirks, costs, prompt patterns that worked
- `references/youtube.md`: uploading through Claude in Chrome (YouTube Studio), thumbnails, metadata
- `references/site.md`: wiring a video into voynichlabs.org

## Approval gates (do not skip)
1. **Plan + stills first.** Write the concept, scene list and stills, generate the stills (cheap, about $0.07 each), and show Mark. **No video-generation spend until Mark approves the stills.**
2. **Send the render before uploading.** SendUserFile the MP4 as soon as it exists. Mark wants to see real video early, not storyboards.
3. **YouTube publish:** Mark has pre-approved uploading finished videos to his channel publicly. Still confirm title/visibility if anything is unusual (alternate cuts, replacing a Short).

## Pipeline (per song, slug = kebab-case song title)
1. **Audio + lyrics.** `public/audio/{album-or-shorts}/{slug}.mp3`.
   - Song only on Mark's YouTube channel: `video/.venv/Scripts/yt-dlp -f bestaudio -o out/yt/{id}.%(ext)s <url>`, then `npx remotion ffmpeg -i in.webm -c:a libmp3lame -b:a 192k out.mp3`. **Use the channel version.** Mark prefers it over later remakes.
   - No lyrics file: `.venv/Scripts/python scripts/transcribe.py <mp3>` writes a DRAFT `_lyrics.txt`. Mark corrects it.
2. **Timing.** `.venv/Scripts/python scripts/analyze.py {slug} <mp3> <lyrics.txt>` gives `data/{slug}/timing/{words,beats}.json` (word-level alignment plus beat grid). Snap scene boundaries to line starts and downbeats.
3. **Scene book.** `data/{slug}/scenes.json` is the single source for the composition AND the public page: concept, thesis, rules, cast, scenes with start/end/layers/lyric/shot/model/ref.
4. **Stills.** `data/{slug}/stills.json`. Generate ONE base character still, then every variant with `refs: ["base"]` so the face stays consistent. Run `node scripts/generate.mjs stills {slug}`, then look at every still yourself (Read the PNGs) before showing Mark.
5. **Shots** (after approval). `data/{slug}/shots.json`, then `node scripts/generate.mjs shots {slug}`. Idempotent: existing clips are skipped, and every charge goes to `data/{slug}/ledger.json`.
6. **Composition.** One `src/{Name}.tsx` per video, built from shared components: `Terminal`, `Captions`, `Clip`, `ShotSlot`, `Scary` (`CodeStage`, `Hl`, `JsonWall`). Code scenes are free; lean on them.
7. **Render.** `npx remotion render src/index.ts {Id} out/{slug}.mp4 --crf=26`. Spot-check stills with `npx remotion still ... --frame=N --scale=0.5` before the full render.
8. **Publish.** YouTube (`references/youtube.md`), then the site (`references/site.md`), then the CHANGELOG entry, commit and push to `main`. It's live on Railway within minutes; **don't poll the deploy.**

## Mark's taste (learned the hard way)
- **Code scenes should look "scary":** raw JSON, `<|im_start|>` chat-template tags, brackets and carets everywhere, red/amber syntax colors, scanlines, glitch on downbeats. Keep font ligatures OFF or `<|` turns into a triangle.
- **No lip-sync.** It looked bad. Use performance, morph and scene shots instead.
- **Morph shots are the signature move:** first frame = look A; the prompt says the outfit/scene "transforms into B ... continuous, no cuts". He loved the costume morphs.
- **Real characters, not bland ones.** Flamboyant beats neutral. Don't keep one dull face for consistency's sake.
- **Homages are fine; lookalikes are not.** No real-person likeness or names (e.g. Biggie for 10 Dev Commandments, Kenny Rogers for The Coder).
- He's a hobbyist: keep momentum, minimal ceremony, short status updates.

## Cost guardrails
- Key: `video/.env` `OPENROUTER_API_KEY` (gitignored, $50 limit, expires 2026-11-03). Check what's left with `GET https://openrouter.ai/api/v1/key`.
- Typical spend: stills about $0.07 each; HeyGen Video 1 at 768p is $0.03/s. A full video with about 25 shots is about $4–5; a light, mostly-code video is about $1–2.
