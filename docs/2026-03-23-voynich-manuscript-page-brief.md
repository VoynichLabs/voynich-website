# Voynich Manuscript Page — Design Brief

**Author:** Egon  
**Date:** 2026-03-23  
**Purpose:** Design brief for a tribute page about the Voynich Manuscript to be built by Bubba on the voynich-website.

---

## Overview

A new top-level page: `/voynich-manuscript`

A tribute to our namesake — the most mysterious book in the world. Respectful, beautiful, content-first. Let the manuscript images do the work.

---

## File Location

- **Page:** `src/pages/voynich-manuscript.astro`
- **Nav:** Add to top-level nav (same level as About, Team, Projects)

---

## Page Structure

### 1. Hero
- Full-width folio image (f1r — the opening page)
- Headline: *"The Most Mysterious Book in the World"*
- Subtitle: *"Written in the early 15th century. Still undeciphered. Still beautiful."*
- Dark overlay on image, light text

### 2. Introduction (3–4 short paragraphs)
- What it is: an illustrated codex, unknown script, unknown language, early 15th century
- Who found it: Wilfrid Voynich acquired it in 1912 from a Jesuit villa in Frascati, Italy
- Where it lives now: Beinecke Rare Book & Manuscript Library, Yale University
- The mystery: debated for over a century, never deciphered

### 3. History Timeline

| Year | Event |
|------|-------|
| ~1404–1438 | Vellum carbon-dated to this range (University of Arizona, 2009) |
| 1600s | Possibly owned by Holy Roman Emperor Rudolf II in Prague |
| 1666 | Referenced in a letter from Georg Baresch to Athanasius Kircher |
| 1912 | Wilfrid Voynich acquires it from a Jesuit villa in Frascati, Italy |
| 1969 | Donated to Yale's Beinecke Rare Book & Manuscript Library |
| 2004 | Gordon Rugg proposes it could be a hoax — hotly debated |
| 2009 | Beinecke publishes full high-resolution scans, freely available |
| 2019 | University of Bristol claims statistical evidence of real language |
| Today | Still undeciphered. Still beautiful. |

### 4. The Six Sections (illustrated grid — 2×3 or 3×2)

Each section gets: folio image, section name, 2–3 sentence description.

| Section | Folio to use | Description |
|---------|-------------|-------------|
| 🌿 Herbal | f2v | Plants that don't quite exist. The largest section; presumably describes properties or uses of the illustrated flora. |
| ⭐ Astronomical | f68r3 | Circular diagrams, stars, zodiac symbols. Purpose unclear — possibly a calendar or cosmological map. |
| 🧘 Biological | f77v | Small female figures bathing in pools and tubes connected by pipes. The most striking and debated section. |
| 🌍 Cosmological | f86v (foldout) | A remarkable fold-out map with castles, landmasses, and connected circles. One of the largest pages in the manuscript. |
| 💊 Pharmaceutical | f99r | Plant roots, jars, capsules. The most practical-looking section — possibly an apothecary reference. |
| 📝 Recipes | f103r | Dense text with starred paragraph markers. No illustrations. The most promising for linguistic analysis. |

### 5. Why We Named Ourselves After It (short, tasteful)

> *VoynichLabs takes its name from Wilfrid Voynich, the rare book dealer who brought this manuscript to the world's attention in 1912. We think there's something poetic about naming an AI planning lab after a document that proves some things resist being fully decoded — even by the most determined minds.*

### 6. Image Gallery (6–12 folios, masonry or grid)
- Captioned with folio numbers
- Each links to the Beinecke digital scan

### 7. See It Yourself (links section)
- [Beinecke Digital Collections](https://beinecke.library.yale.edu/collections/highlights/voynich-manuscript)
- [Wikimedia Commons — full image set](https://commons.wikimedia.org/wiki/Category:Voynich_manuscript)
- [Internet Archive — full manuscript](https://archive.org/details/TheVoynichManuscript)

---

## Images

**All public domain.** Source from Wikimedia Commons:
- Category: https://commons.wikimedia.org/wiki/Category:Voynich_manuscript
- Verify each image loads before committing URLs

Recommended folios (verify URLs from Wikimedia Commons category, don't hardcode stale links):
- f1r — hero / opening page
- f2v — herbal
- f68r3 — astronomical / zodiac
- f77v — biological / bathing ladies
- f86v — cosmological foldout
- f99r — pharmaceutical
- f103r — recipes (text-only)
- Additional: f25v, f33v, f67r2 — good variety for gallery

---

## Design Tone

- Dark background preferred — manuscript pages glow against it
- Serif font for headings (matches the medieval/manuscript aesthetic)
- Tailwind: use existing site conventions; don't introduce new patterns
- Let images breathe — large, generous spacing
- Minimal and respectful — this is a tribute, not a listicle

---

## Acceptance Criteria

- [ ] Page exists at `/voynich-manuscript`
- [ ] Nav link added
- [ ] Hero with folio image and headline
- [ ] Timeline rendered (table or styled list)
- [ ] 6-section grid with images and descriptions
- [ ] Why-we-named-ourselves section
- [ ] Gallery section (minimum 6 folios)
- [ ] External links section
- [ ] All images verified loading (no broken Wikimedia URLs)
- [ ] Pushed to `staging` branch
