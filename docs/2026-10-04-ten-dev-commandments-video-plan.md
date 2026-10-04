# Plan: "The 10 Dev Commandments" Music Video
## 4 October 2026 | Handoff for the next assistant

Status: **superseded by `docs/2026-10-04-three-music-videos-plan.md`** (section 3). Audio and draft lyrics are now in `public/audio/shorts/`. The gotchas below still apply.

## Goal
Make a full music video for **The 10 Dev Commandments**, a song Mark already published as a YouTube Short:
https://youtube.com/shorts/LQoboN5a-hY (channel "AI gone wild", @LLMs-Gone-Wild, 131 seconds, vertical).

From Mark's description, the song is an homage to "The 10 Crack Commandments" by the Notorious B.I.G.: the same numbered-rules structure, used to teach developer best practices.

Deliverables:
1. A vertical **9:16 video, 1080x1920**, for YouTube Shorts. Optionally a 16:9 cut too.
2. A page at `/music/video/ten-dev-commandments` with the video and the scene book.
3. An upload to Mark's YouTube channel, after Mark confirms the title and visibility.

Reuse everything built for System Prompt: `video/` workspace, `docs/2026-10-04-music-video-pipeline-plan.md`, `video/README.md`. Watch the System Prompt result first: https://youtu.be/1GBB0X5K_Zk and https://voynichlabs.org/music/video/system-prompt

---

## Step 0: Get the inputs from Mark (ask before building)
- **Master audio.** Ask Mark for the original file (Suno or wherever it came from). Only if he doesn't have it: download the audio of his own Short with `yt-dlp -x --audio-format mp3 https://youtube.com/shorts/LQoboN5a-hY`.
  - Save it as `public/audio/dev-commandments/ten-dev-commandments.mp3`.
- **Lyrics.** Ask Mark for the lyrics text.
  - If he has none, transcribe with faster-whisper (already installed in `video/.venv`) and have Mark correct it.
  - Save as `public/audio/dev-commandments/ten-dev-commandments_lyrics.txt`, with `[Section]` headers like `public/audio/latent-space/system-prompt_lyrics.txt`.
- **The ten rules.** Get the exact wording of each commandment. Every scene hangs off them.

## Step 1: Timing
```bash
cd video
.venv/Scripts/python scripts/analyze.py ten-dev-commandments ../public/audio/dev-commandments/ten-dev-commandments.mp3 ../public/audio/dev-commandments/ten-dev-commandments_lyrics.txt
```
This writes `data/ten-dev-commandments/timing/{words,beats}.json`. Find the start time of each "Number one ... Number ten" line. Those ten timestamps are the backbone of the edit.

## Step 2: Make the composition code song-agnostic (small refactor first)
`video/src/lib/timing.ts` currently imports System Prompt's JSON directly. Before adding a second song:
- Turn it into a loader keyed by slug: a `makeSong(scenes, words, beats, shots, ledger)` factory. Each composition then imports its own data.
- `Clip.tsx` already takes the slug from `book.slug`; keep that working.
- Register a second `<Composition id="TenDevCommandments" width={1080} height={1920} />` in `Root.tsx`.
- `Terminal`, `Captions`, `Scary` (`CodeStage`, `Hl`, `JsonWall`), `ShotSlot` and `Clip` are reused as they are. Captions and terminal sizes need tuning for vertical: font around 56px, terminal width about 980px.

## Step 3: Concept (draft; get Mark's OK on the scene book before generating anything)
**Structure:** a countdown. One scene per commandment, ten in total, plus the intro, hooks and outro.

**Two worlds, same as System Prompt:**
- **Code world (Remotion, free).** Each commandment slams onto screen as a JSON rule, for example `{"commandment": 1, "rule": "Never push to main on a Friday", "severity": "FATAL"}`.
  - The look is the scary terminal: red brackets, `<|im_start|>` tags, scanlines, glitch on the downbeat.
  - Add a big Roman numeral or `#1`–`#10` counter that hits on the beat.
- **Stage world (HeyGen Video 1).** One recurring character in ten settings, one per commandment, each acting out the rule. For example: a server room at 5pm Friday, a code-review table, a burning prod dashboard.

**The character must be original.** Do **not** make a Biggie lookalike, imitate the original video, or use his name or likeness anywhere in the video or metadata. An homage in the song is fine; impersonating a real person is not.
- Candidates: a stern 90s-hip-hop-styled "Lead Dev" in a puffy jacket and headset; or Larry the laptop lobster as the narrator; or the System Prompt disco singer for continuity.
- Ask Mark which one.

## Step 4: Stills, then shots
- Write `data/ten-dev-commandments/stills.json` (one base still plus one per setting) and `shots.json`. Copy the structure from `data/system-prompt/`.
- Then run:
```bash
node scripts/generate.mjs stills ten-dev-commandments
node scripts/generate.mjs shots  ten-dev-commandments
```
- Use `"aspect_ratio": "9:16"` in both files.
- **Budget:** about $1 for stills, plus about 14 shots at 5–8 seconds with HeyGen Video 1 at 768p ($0.03 per second), so roughly $3–4 in total. The OpenRouter key in `video/.env` has a $50 limit and expires 2026-11-03; about $43 is left. `ledger.json` records every charge.

## Step 5: Render, publish
- Render: `npx remotion render src/index.ts TenDevCommandments out/ten-dev-commandments.mp4 --crf=26`.
- **Site copy:** re-encode to keep it small, for example `npx remotion ffmpeg -i in.mp4 -s 720x1280 -c:v libx264 -preset slow -crf 30 -c:a aac -b:a 128k -movflags +faststart out.mp4`.
  - Put it in `public/video/ten-dev-commandments/`.
- **Page:** copy `src/pages/music/video/system-prompt.astro`. It reads everything from `scenes.json`.
- **Housekeeping:** `CHANGELOG.md` entry (check the top version number first, because other sessions also add entries), commit, and push to `main`. It goes live on Railway within a few minutes, so **don't sit polling the deploy.**

## Gotchas learned on System Prompt (read these)
- **HeyGen Video 1** (`heygen/heygen-video-1`):
  - It always renders audio, and it rejects `generate_audio: false`. Omit the field and mute clips in Remotion.
  - `frame_images` only supports `first_frame`.
  - Durations are 5–15 seconds; resolution is 480p or 768p.
  - Image references can be data URLs. **Audio references must be public HTTPS URLs.**
- **Lip-sync:** Mark didn't like it. Use performance and costume/scene-morph shots instead.
- **Morph shots work well:** first frame is look A, and the prompt says "the outfit transforms into B ... continuous, no cuts".
- **Consistency:** generate one base still, then make every variant with `refs: ["base"]` (gemini-3.1-flash-image). Faces stay consistent.
- **JetBrains Mono ligatures** turn `<|` and `|>` into triangles. Ligatures are already disabled in `Terminal` and `CodeStage`; keep it that way.
- **Remotion `--scale`** must give whole-number pixel sizes.
- **Scanlines and noise make files huge** (the 1080p render was 88 MB). Re-encode for the site.
- **YouTube upload through Claude in Chrome:**
  - `file_upload` is capped at 10 MB, so make an upload encode under 10 MB (720p, about 420k video bitrate). Or have Mark drag in the full-quality file himself.
  - The title box in YouTube Studio is a contenteditable div, and Ctrl+A doesn't work in it. Set it with `document.execCommand('selectAll')` and then `insertText`.
  - Answer "Not made for kids". Answer **Yes** to "altered or synthetic content", because the people in the video are AI-generated.
  - Confirm the title and visibility with Mark before clicking Publish.
- **Workflow:** Mark wants to see the actual video early. Send the rendered MP4 with SendUserFile as soon as one exists, not only a storyboard.

## Open questions for Mark
1. Do you have the master audio and lyrics, or should the assistant pull them from the Short?
2. What is the exact wording of the ten commandments?
3. Which character: the Lead Dev, Larry, or the disco singer?
4. Vertical only, or a 16:9 cut as well?
