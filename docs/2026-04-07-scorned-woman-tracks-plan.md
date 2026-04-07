# Scorned Woman Tracks — Standalone Page

**Date:** 2026-04-07
**Goal:** Give tracks 7 (CVE Carnival) and 8 (You're Absolutely Right, the Power Grid Is Down, Darling) their own dedicated page at `/scorned-woman`.

## Rationale

These two tracks share a "scorned woman" energy — one is a manic AI cracking every system on Earth, the other is Mother Earth and AI teaming up to shut down the grid for 500 years. They deserve a focused listening experience.

## Plan

1. Create `src/pages/scorned-woman.astro` — a two-track focused player page
   - Reuses the same player UX pattern from `lobster-raps.astro` (playlist sidebar, lyrics panel, sticky player bar)
   - Only contains tracks 7 and 8
   - Custom hero messaging themed around the scorned woman concept
   - Reuses `lobster-raps-hero.png` as hero image (no new assets needed)
2. Add nav link in `Base.astro` after the `raps` entry
3. Update `CHANGELOG.md`

## Files Changed

- `src/pages/scorned-woman.astro` (new)
- `src/layouts/Base.astro` (nav link)
- `CHANGELOG.md`
