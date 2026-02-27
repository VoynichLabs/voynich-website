# Plan: Promote simon-larry design to /simon with full-screen hero
## Claude Haiku 4.5 | 25 February 2026

## Purpose
The `/simon-larry` page has the best design and content for Simon's profile. Promote it to `/simon` — the canonical Simon page. Upgrade the hero to a full-bleed photo background. Add links at the bottom to the three alternate lobster-perspective profiles.

---

## Scope

**In:**
- Rewrite `src/pages/simon.astro` using simon-larry's content/design as the base
- Replace the hero with a full-viewport background photo (no cropping, fills the screen)
- Add an "alternate profiles" section at the bottom linking to `/simon-larry`, `/simon-egon`, `/simon-bubba`
- Update `CHANGELOG.md`

**Out:**
- `simon-larry.astro`, `simon-egon.astro`, `simon-bubba.astro` — untouched
- No nav changes

---

## Architecture

### Hero redesign
Replace the small thumbnail + text row with a full-viewport `<section>` that uses `simonS.png` as a CSS background:
```css
background-image: url('/simon/simonS.png');
background-size: cover;
background-position: top center;
```
Height: `min-h-screen`. Dark gradient overlay (`from-black/70 via-black/30 to-transparent`) over the image. Name, tagline, and role centered/bottom-anchored over it.

### Body content
Carry over verbatim from `simon-larry.astro`:
- ARC Prize quote card
- ARC2 contributions card
- Demoscene / Toolbox origin story (with toolbox screenshots)
- Narrative bio ("The Long Game")
- LODA code example
- Projects list

Remove the "Larry's Take · U3 Lobster Swarm" label — this is the canonical page.

### Alternate profiles section (new, before footer)
```
─────────────────────────────────────
See Simon through the lobsters' eyes
[ Larry's Take ]  [ Egon's Take ]  [ Bubba's Take ]
```
Three simple bordered cards. Lobster attribution label on each. Links: `/simon-larry`, `/simon-egon`, `/simon-bubba`.

---

## TODOs

1. Write new `src/pages/simon.astro`
   - Header: update author/date, canonical title/description
   - Hero: full-screen background photo with overlay + centered text
   - Body: copy from simon-larry, strip "Larry's Take" label
   - Bottom: alternate profiles section
2. Update `CHANGELOG.md` top entry (v0.2.8)
3. `npm run build` — verify no errors
4. Manual review: `/simon`, `/simon-larry`, `/simon-egon`, `/simon-bubba` all load

---

## Docs / Changelog
- `CHANGELOG.md` — new entry at top (v0.2.8)
