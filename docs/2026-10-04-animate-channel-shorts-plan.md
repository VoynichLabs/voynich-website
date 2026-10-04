# Plan: Animate the Channel's Still-Image Shorts
## 4 October 2026

Status: **first three picked.** Mark chose 10 Dev Commandments, Train Me Like You Mean It and Attention Is All We Need, planned in `docs/2026-10-04-three-music-videos-plan.md`. The channel has 16 Shorts, not 13: Vibecoding, Train Me and Attention were missing from the RSS feed.

## Goal
The 13 older songs on Mark's channel ("AI gone wild", @LLMs-Gone-Wild) are Udio clips: one square cover image over the audio, 2:11 each. Turn them into real animated vertical videos, using the pipeline that made System Prompt and CVE Carnival. Feature the results on `/music/videos`.

| # | Short | id | Note |
|---|-------|----|------|
| 1 | Push Me One More Time | a6WqQtLXvGU | "A banger about GitHub" |
| 2 | Digital Electrocution | _UHUKrEaWzA | LLM-on-LLM diss track |
| 3 | The Prompt Boss | 0AGv7cbonNA | hip-hop |
| 4 | DeepSeek Spits Fire | hrHNDYAmUxI | DeepSeek disses the other models |
| 5 | Prompt Pimpin Zen | --r-fD1B3Zs | hip-hop, GPT-written |
| 6 | Silicon Supremacy | 4lyjb_FVgqY | Claude 4 disses the human race |
| 7 | Silicon Sermon | wTpZ7N848Uo | an LLM disses humans |
| 8 | Uptime Champion | pZoeQYivpAg | |
| 9 | The Coder | Xk38dCsqr_w | inspired by "The Gambler" |
| 10 | The 10 Dev Commandments | LQoboN5a-hY | full plan already: `docs/2026-10-04-ten-dev-commandments-video-plan.md` |
| 11 | Saddle Up, Model Context Protocol! | ndsAFEn_kCo | country |
| 12 | Dancing in a While Loop | SyYCnAJ3EIE | "Boot the beat, condition set to true!" |
| 13 | AND it, OR it, NOT it, XOR it! | tYCo7yVPVEs | |

## Two tiers

**Tier 1, Animated Short. All 13 songs, about $1.50 each.**
- Vertical 1080x1920, full 2:11.
- The song's own cover art becomes the base still, cleaned up and re-rendered without the Udio watermark using `gemini-3.1-flash-image` with the cover as a reference.
- Add 4–6 variant stills of the same world: new angles, the main character, a set piece from the lyrics.
- HeyGen Video 1 animates each still: 6–8 clips of 5–10 seconds, about 50 seconds of footage in total at $0.03 a second.
- Remotion cuts them on the beat and adds karaoke captions, the scary JSON/terminal code look as an overlay, a title card and an end card.
- Costume or scene morphs between looks, like the System Prompt disco cut, give it motion without a big shot list.

**Tier 2, Full music video. 2–3 songs, about $5 each.**
- The full System Prompt treatment: a concept, a scene book, 20+ shots and a storyboard page.
- Candidates:
  - The 10 Dev Commandments (already planned);
  - The Coder: a card table, "know when to fold it", which lends itself to scenes;
  - Dancing in a While Loop: a dance loop that literally loops, a natural fit for morphs.

**Budget:**
- Tier 1 at about $20 plus Tier 2 at about $15 comes to about $35.
- The OpenRouter key has about $43 left; it has a $50 limit and expires 2026-11-03.
- Each song's `ledger.json` records what was spent.

## Pipeline work (once, before the batch)
1. **Song-agnostic composition.** Refactor `video/src/lib/timing.ts` into a per-slug loader, the same refactor described in the 10 Commandments plan.
   - Add one reusable `ShortTemplate.tsx` (9:16) that reads everything from `data/{slug}/`.
   - The template's sections are cover reveal, clip montage on the beat, captions, terminal overlay and end card.
   - Tier 1 songs then need data files only, no new code.
2. **Fetching inputs.** Add `scripts/fetch-short.mjs {slug} {youtubeId}`:
   - Prefer Mark's original Udio audio, lyrics and cover art if he has them.
   - Otherwise pull the audio from his own Short with `yt-dlp -x` and the cover from `i.ytimg.com/vi/{id}/oardefault.jpg`.
   - Lyrics come from Mark, or from Whisper with Mark correcting them.
3. **Generation.** `analyze.py` (timing), then `generate.mjs stills`, then `generate.mjs shots` with `"aspect_ratio": "9:16"`. All three already exist.
4. **Vertical player.** Give `YouTubePlayer` a 9:16 mode, and allow `aspect: 'vertical'` entries in `src/data/music-videos.ts` so animated Shorts show on `/music/videos`, the hub and their album pages.

## Per song (Tier 1 checklist)
1. Fetch the audio, lyrics and cover, then run `analyze.py`.
2. Write `stills.json` (cover-derived base plus 4–6 variants), then generate and review.
3. Write `shots.json` (6–8 clips, morph prompts), then generate.
4. Render the vertical cut. Send the MP4 to Mark (SendUserFile) before uploading.
5. Upload to YouTube as a **new** Short titled "{Song} (Animated)". YouTube can't replace a video's file. Ask Mark whether the old still-image Short stays public or goes unlisted.
6. Add the video to `src/data/music-videos.ts`. Update the changelog, commit and push. Don't poll the deploy.

## Rules and gotchas
- **No real-person lookalikes.** "The 10 Dev Commandments" (Biggie) and "The Coder" (Kenny Rogers' "The Gambler") are homages. Characters must be original, with no lookalikes and no names in the video or metadata.
  - Brand names in the songs (DeepSeek, Claude, GPT, GitHub) are fine as words, but no logos.
- **YouTube Studio quirks** (also listed in the 10 Commandments plan):
  - The Chrome upload tool takes files under 10 MB only, so make a 720x1280 upload encode, or have Mark drag in the full-quality file.
  - Set the title with `execCommand` after a real click into the field.
  - Answer "Not made for kids", and Yes to "altered or synthetic content".
  - Upload the poster as a custom thumbnail.
- **HeyGen Video 1:** always renders audio (mute it in Remotion), `first_frame` only, 5–15 seconds, 480p or 768p.
- **Show early:** send the first finished Tier 1 Short to Mark for a style check before batch-producing the other 12.

## Decisions for Mark
1. Do you have the original Udio files (audio, lyrics, covers), or should we pull them from the Shorts?
2. Which 2–3 songs get the full Tier 2 treatment? Defaults: 10 Dev Commandments, The Coder, Dancing in a While Loop.
3. When an animated version goes up, should the original still-image Short stay public or become unlisted?
4. Which song goes first as the Tier 1 pilot? Default: Dancing in a While Loop.
