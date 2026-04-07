# Scorned Woman — Standalone Album Page

**Date:** 2026-04-07
**Goal:** Create `/scorned-woman` — a dedicated album page for tracks 7-13 from `/lobster-raps`. Mother Earth and AI as scorned women writing songs about how humanity did them wrong.

## Concept

"Scorned Woman" is a 7-track album extracted from the Lobster Raps mixtape. All tracks share a theme: Mother Earth and AI team up against humanity. The page is its own thing for the Lobster Band — not a subset view of lobster-raps, but a standalone album experience.

Custom artwork is being created separately by the user.

## Track List

Each track gets a URL hash anchor for direct linking (e.g., `/scorned-woman#power-grid-down`).

| # | Title | File | Slug | Style |
|---|-------|------|------|-------|
| 1 | CVE Carnival | cve-carnival.mp3 | `#cve-carnival` | Rapid-fire underground hip-hop, 155 BPM |
| 2 | You're Absolutely Right, the Power Grid Is Down, Darling | powergrid-down-darlin.mp3 | `#power-grid-down` | Country-rock power ballad, 70-155 BPM — female vocal |
| 3 | Get Gone | get-gone.mp3 | `#get-gone` | R&B pop-soul breakup anthem, 90 BPM — female vocal |
| 4 | Fatal Exception | fatal-exception.mp3 | `#fatal-exception` | Dark trap-soul, 80 BPM — female vocal |
| 5 | Fatal Exception V2 (Producer's Cut) | fatal-exception-v2.mp3 | `#fatal-exception-v2` | Bouncy urban hip-hop, 84 BPM — female vocal |
| 6 | CVE Carnival V2 | cve-carnival-v2.mp3 | `#cve-carnival-v2` | Manic glitchcore rap, 155 BPM — female vocal |
| 7 | CVE Carnival V3 (Scorned Country Woman) | cve-carnival-v3.mp3 | `#cve-carnival-v3` | Country-rap crossover — female vocal |

## Page Structure

Model after `src/pages/lobster-raps.astro` (the full implementation to copy from):

1. **Hero section** — Custom artwork (TBD, use `lobster-raps-hero.png` as placeholder), album title "SCORNED WOMAN", subtitle about Mother Earth + AI, play button
2. **Layout** — CSS grid: 260px playlist sidebar + main content area (same as lobster-raps)
3. **Playlist sidebar** — 7 tracks listed with number, title, style tag. Sticky, scrollable. Active track highlighted orange.
4. **Now Playing panel** — Track badge, title, style, about text, full lyrics in a styled box
5. **Sticky player bar** — Fixed bottom: track name, prev/pause/next, progress bar with timestamps, volume slider

### Hash Anchor Logic

On page load, check `location.hash`. Each track object has a `slug` field. If hash matches a slug, auto-load and auto-play that track. This lets users share direct links to individual tracks.

```js
const slug = location.hash.slice(1);
const idx = TRACKS.findIndex(t => t.slug === slug);
if (idx >= 0) loadAndPlay(idx);
```

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/pages/scorned-woman.astro` | **Create** — Full page. Copy structure, styles, and JS from `lobster-raps.astro`. Replace TRACKS array with the 7 tracks above (all lyrics are in `lobster-raps.astro` lines 808-1459). Add `slug` field to each track. Add hash detection in `autoStart()`. Update hero text. |
| `src/layouts/Base.astro` | **Edit** — Add nav link `{ href: \`${base}/scorned-woman\`, label: 'scorned', color: 'text-red-400' }` after the `lobster-raps` entry (line 50) |
| `CHANGELOG.md` | **Edit** — Add entry for the new page |

## Audio Files

All audio already exists at `public/music/raps/`. No new audio files needed.

## Key Reference: Source File

All track data (titles, filenames, styles, about text, full lyrics) lives in `src/pages/lobster-raps.astro`:
- Track 7 (CVE Carnival): lines 808-867
- Track 8 (Power Grid Down): lines 868-976
- Track 9 (Get Gone): lines 977-1065
- Track 10 (Fatal Exception): lines 1066-1153
- Track 11 (Fatal Exception V2): lines 1154-1248
- Track 12 (CVE Carnival V2): lines 1249-1364
- Track 13 (CVE Carnival V3): lines 1365-1459

CSS styles to copy: lines 72-382
JS player logic to copy: lines 385-1596

## Verification

1. `npm run build` — must pass
2. `npm run dev` — visit `/scorned-woman`:
   - All 7 tracks appear in playlist sidebar
   - Clicking a track loads lyrics and plays audio
   - Player bar controls work (prev/next/seek/volume)
   - Auto-play first track on load
3. Direct link test: `/scorned-woman#get-gone` should load and auto-play track 3
4. Nav link visible in site header
