# Hallucinate (v7) Single Page — Plan

**Date:** 2026-07-13
**Goal:** Dedicated release page for today's single, "Hallucinate" version 7 (smooth R&B, take 2), matching the existing single-page treatment (`/pox-upon-you` pattern).

## Scope

- New page `src/pages/hallucinate.astro` at route `/hallucinate`.
  - Hero + music cross-nav + playlist sidebar + now-playing panel with full lyrics + sticky player bar (same `lr-*` structure as pox page, restyled with a smooth-R&B rose/plum palette).
  - Track 1 (headliner): **Hallucinate (v7)** — `public/audio/drafts/hallucinate-smooth-take-2.mp3` (already on main).
  - Track 2 (alternate): **Hallucinate — take 1 (v6)** — `hallucinate-smooth-take-1.mp3`, clearly labeled as the alt take.
  - Full lyrics inline on the page (verbatim from `hallucinate-smooth-take-2_lyrics.txt`); Lyria style summary in the track metadata.
- Add a single card to the `/music` hub (newest first, so at top of albums list).
- Update `CHANGELOG.md` top entry.

## Out of scope

- No nav bar changes (nav cleanup is a separate planned effort per the 2026-07-13 site audit).
- No changes to `/drafts` (both takes stay there too).
- No commit/push — files only, per instructions.
