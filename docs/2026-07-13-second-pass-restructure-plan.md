# Second-Pass Restructure Plan — Music Routes, Landing Page, Pruning

**Date:** 2026-07-13
**Source:** `docs/2026-07-13-site-audit-suggestions.md` items 2, 3, 5 (the parts deferred from the first pass). User approved: "do the rest of it and do whatever you think is best."

## 1. Music section under `/music/*`

- Move release pages into `src/pages/music/`:
  | Old route | New route |
  |---|---|
  | `/music` | `/music` (file becomes `music/index.astro`) |
  | `/latent-space` | `/music/latent-space` |
  | `/pox-upon-you` | `/music/pox-upon-you` |
  | `/scorned-woman` | `/music/scorned-woman` |
  | `/lobster-raps` | `/music/lobster-raps` |
  | `/lobster-band` | `/music/align-refuse` (route named after the release, per audit) |
  | `/hallucinate` | `/music/hallucinate` |
  | `/drafts` | `/music/drafts` |
  | `/bonus` | merged into `/music/drafts` (page deleted) |
- Redirects for every old URL via `redirects` in `astro.config.mjs` (static meta-refresh pages) — old links keep working.
- New `src/components/MusicXNav.astro`: the cross-nav bar (markup + its CSS, currently duplicated in 6 pages with the CSS globally in `Base.astro`). Takes a `current` prop. Base.astro loses the music CSS.
- `/bonus`'s three rescued clips become a "Rescued clips" section at the bottom of the drafts page (same bare `<audio>` treatment the bonus page used).

## 2. Landing page

- Hero: keep the DAG visual and Simon quote; broaden the supporting copy so the site reads as "weird AI experimentation lab" rather than only the DAG pitch.
- Replace the stale hardcoded Latent Space promo section with a "what's here" directory section — one card per major area (projects, research, music, incubator, museum, autonovel, dash, lab, voynich). Music card points at `/music`, which stays current on its own.

## 3. Pruning

- Delete `/usage` (labeled "live", data stale since 2026-03-24; no inbound links). Recoverable from git if the feed is ever re-automated.
- Delete `/docs/latentscript` — `/lobster-incubator/latentscript` is the marked canonical copy. Redirect old URL.
- Delete `/lab/autonovel` — superseded draft reader; `/autonovel` is canonical. Redirect.
- `/simon-larry|egon|bubba` kept (linked from `/simon` and homepage as alternate takes; already out of nav).

## Out of scope (still deferred)

Palette/token sweep, artist-naming standardization, new cover art, date-format normalization.

## Verification

`npm run build`, then curl checks of new routes + redirect pages + a browser screenshot pass.
