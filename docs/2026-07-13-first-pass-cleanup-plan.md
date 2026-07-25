# First-Pass Cleanup Plan — Nav + Quick Fixes

**Date:** 2026-07-13
**Source:** `docs/2026-07-13-site-audit-suggestions.md` (items 1, and the quick fixes from 2–4)
**Scope:** Small, user-approved first pass. No route moves, no landing-page rework, no palette sweep.

## Changes

### 1. Nav consolidation (`src/layouts/Base.astro`)
- Collapse 15 nav links to 8: `index / about / projects / incubator / museum / autonovel / music / voynich`.
- Drop per-link accent colors — all links muted, one hover state.
- Remove `gh:neoneye` from the nav (already in footer External column).
- Footer "Navigate" column uses the same array, so it updates automatically.

### 2. Keep de-navved pages reachable (no orphans)
- `src/pages/projects.astro`: add a compact "on this site" link strip for `/planexe`, `/claw`, `/dash`, `/research`, `/lab`.
- `src/pages/about.astro`: add a link strip for `/simon`, `/team`, `/collaborators`.

### 3. Stale track counts
- `src/pages/music.astro`: Latent Space 16 → 18 (desc "Sixteen" → "Eighteen"); Lobster Raps 13 → 14 (desc "Thirteen" → "Fourteen").
- `src/pages/latent-space.astro`: title/description/header "Sixteen" → "Eighteen".
- `src/pages/lobster-raps.astro`: sidebar "13 TRACKS" → "14 TRACKS".
- `src/pages/index.astro` promo: "Twelve tracks" / "12 TRACKS" → 18 (full promo replacement deferred to landing-page pass).

### 4. Hardcoded absolute links on homepage (`src/pages/index.astro`)
- Add `base` const; route internal `<a href>` links (`/simon`, `/projects`, `/simon-*`, `/latent-space`, `/music`) through it. (Image `src` sweep deferred.)

### 5. Double title suffix
- `lobster-incubator.astro`: `"Lobster Incubator | VoynichLabs"` → `"Lobster Incubator"`.
- `lab/index.astro`: `"Lab | VoynichLabs"` → `"Lab"`.
- `lab/chord-diagrams.astro`: `"Chord Diagrams | Lab | VoynichLabs"` → `"Chord Diagrams | Lab"`.
- `drafts.astro`: `"Drafts — VoynichLabs Music"` → `"Drafts — Music"`.

## Verification
`npm run build` + `npm run preview` manual review of nav, footer, homepage links, music hub counts.

## Deferred (needs its own plan doc)
Route moves under `/music/*`, drafts/bonus merge, landing hero reframe, pruning table, palette/token sweep, music CSS out of Base.astro.
