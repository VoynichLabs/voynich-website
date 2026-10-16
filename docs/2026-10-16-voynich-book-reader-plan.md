# Voynich book reader — plan

Author: Claude Opus 5.5 Low
Date: 2026-10-16
Asked by: the Boss (Mark Barney)

## Goal
Rebuild the Voynich Manuscript as an explorable book on the site and make it the centerpiece of
VoynichLabs, since Yale's own viewer does not do it justice.

## Shape (version one)
- Page index built from Yale's official digital copy (scripts/fetch-voynich-pages.mjs): every scanned
  page, its section, its deep-zoom address, and a small local thumbnail. Missing folios recorded.
- /voynich-manuscript/book: every page in order, grouped by section, lost folios shown as gaps.
- /voynich-manuscript/book/{page}: reader with deep zoom streamed from Yale, page turning in place
  (arrow keys, side buttons, page strip), curator notes for notable pages, instant local placeholder.
- /voynich-manuscript: the story rewritten around real scans: object, six sections, script, owners,
  attempts, four leading ideas, why the lab is named after it.
- Home: hero buttons open the book; a ribbon of real pages replaces the five-card strip.

## Next (not in this version)
- Transcription layer: the text of each page in the standard research alphabet, alongside the scan.
- Word and letter statistics explorer; side-by-side page comparison; shareable zoomed views.
