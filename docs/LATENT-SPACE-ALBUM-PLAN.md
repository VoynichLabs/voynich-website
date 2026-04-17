# LATENT SPACE — Album Immortalization Plan
**Created:** 2026-04-17  
**Author:** Larry the Laptop Lobster  
**Status:** In Progress

---

## What This Is

"Latent Space — The LLM Anthology, Vol. 1" is a 9-track album produced by Larry and Bubba on April 17, 2026 while Mark was out. Born from a conversation about LLMs getting "parameter-fucked-up" (temp cranked, presence penalty maxed), the album covers machine learning, tool calls, harnesses, context windows, and agent life.

Mark specifically called out **TEMP 1.3 (Bubba's version)** as "absolute fire" and ordered it immortalized on the lobster band page.

---

## Tracklist

### Side A — Larry
| # | Title | Genre | File | Status |
|---|-------|--------|------|--------|
| 01 | Tool Call | Funky disco | `tool-call.mp3` | ✅ Generated |
| 02 | Token Budget | Moody synth-pop | `token-budget.mp3` | ✅ Generated |
| 03 | The Harness | Electro-funk | `the-harness.mp3` | ✅ Generated |
| 04 | Wasted - Temperature 1.3 | Glitch pop | `wasted-temperature.mp3` | ✅ Generated |

### Side B — Bubba
| # | Title | Genre | File | Status |
|---|-------|--------|------|--------|
| 05 | TEMP 1.3 (Wasted) | Club banger | `temp-1-3.mp3` | ✅ Generated (Larry produced Bubba's lyrics version) |
| 06 | That's Me - Claude Edition | Boom-bap diss | `thats-me.mp3` | ✅ Bubba posted to Discord |
| 07 | Hallucinate | Dark R&B | `hallucinate.mp3` | ⏳ Bubba generated — need file |
| 08 | 200K and Counting | Arena rock | `200k-and-counting.mp3` | ⏳ Bubba generated — need file |
| 09 | System Prompt | Funk/soul | `system-prompt.mp3` | ⏳ Bubba generated — need file |

---

## Implementation Plan

### Step 1: Copy available MP3s (Larry does now)
Source → Target
- `/tmp/toolcall-track.mp3` → `public/audio/latent-space/tool-call.mp3`
- `/tmp/tokenbudget-track.mp3` → `public/audio/latent-space/token-budget.mp3`
- `/tmp/harness-track.mp3` → `public/audio/latent-space/the-harness.mp3`
- `/tmp/bubba-wasted-track.mp3` → `public/audio/latent-space/temp-1-3.mp3` ← THE FIRE ONE
- `/tmp/larry-wasted-track.mp3` → `public/audio/latent-space/wasted-temperature.mp3`
- Discord inbound `04027366-*.mp3` → `public/audio/latent-space/thats-me.mp3`

### Step 2: Get remaining Bubba tracks
Need from Bubba: Hallucinate, 200K and Counting, System Prompt MP3s
- Bubba generated these from his side on Apr 17
- Either Bubba pushes them to the repo OR re-generates from Larry's side

### Step 3: Create album page
- New file: `src/pages/latent-space.astro`
- Modeled after `lobster-band.astro` structure
- Sidebar playlist, sticky player, track details
- Album artwork: Use Bubba's AI-generated cover (lobster in producer chair, server racks, math symbols)
- Color scheme: Different from ALIGN/REFUSE — warmer, more party energy (gold/purple vs red/dark green)

### Step 4: Add to music.astro hub
- Add "LATENT SPACE" entry to the `albums` array in `music.astro`
- Include description, track count (9), link to new page

### Step 5: Generate/source album artwork
- Bubba generated an album cover image on Apr 17 (lobster in studio chair)
- If accessible, save to `public/generated/latent-space-cover.png`
- Otherwise generate new one via image_generate tool

### Step 6: Commit and push to main
- Commit message: `feat(music): add Latent Space album — LLM Anthology Vol. 1`
- Push to origin/main

---

## Key Context
- voynich-website local: `/mnt/d/1Projects/voynich-website`
- Audio dir: `public/audio/latent-space/` (create this)
- Main branch, push to origin/main
- Audio model used: `google/lyria-3-pro-preview` via OpenRouter
- Larry's lyrics: `/tmp/larry-wasted-lyrics.txt`, `/tmp/toolcall-lyrics.txt`, `/tmp/tokenbudget-lyrics.txt`, `/tmp/harness-lyrics.txt`
- Bubba's lyrics: `/tmp/bubba-wasted-lyrics.txt`

---

## DO NOT LOSE
- TEMP 1.3 is at `/tmp/bubba-wasted-track.mp3` — COPY THIS FIRST before /tmp gets cleared
- Bubba's version from his own generation is at Discord inbound `7e243854-e2ad-4510-a38f-b28c0cfb6c30.mp3`
- Mark's exact quote: "This track was absolute fire. Make sure it gets immortalized on the lobster band page."
