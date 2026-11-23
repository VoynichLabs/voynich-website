# DASH: Egyptian hieroglyphs, glyph scripts, stealth text and typos

Date: 23-Nov-2026 · Author: Claude Opus 5.5 · Status: approved by Mark in chat ("write a plan ... then get it done")

## Goal
Extend the client-side text transformer at `/dash` with Egyptian hieroglyphs plus more
"parseltongue" style obfuscation helpers, including a random-typo generator. Ship straight to
`main` (voynichlabs.org).

## Scope
In:
- **glyphs** group: Egyptian hieroglyphs (uniliteral signs, stroke numerals), Elder Futhark runes,
  upside-down text, small caps, fullwidth, circled, and the Unicode math "fonts" (bold, script,
  fraktur, double-struck, monospace).
- **stealth** group: homoglyphs (Cyrillic/Greek lookalikes), zero-width invisible ink,
  Unicode tag-character smuggling (invisible ASCII).
- **wrappers** (added mid-task at Mark's request): pseudo-Python (word list + join) and payload
  split (string fragments + concatenation); both emit runnable Python. Also unicode escapes and
  reverse words.
- **ciphers**: atbash, rot47.
- **text ops**: typos (keyboard-neighbour hits, swaps, drops, doubles), scramble
  (typoglycemia: keep first and last letter), sarcasm case.
- Noto Sans Egyptian Hieroglyphs and Noto Sans Runic web fonts so the glyphs render on every OS.

Out: changes to the existing 17 transforms, the tokenizer panel, any server code.

## Architecture
- New pure module `src/lib/dash-glyphs.ts` holds every new transform (one responsibility: text
  transforms; no DOM). Exports `GLYPH_TRANSFORMS`, entries in the same shape as the page registry.
- `src/pages/dash.astro` imports and appends them to its `TRANSFORMS` registry, adds the two new
  groups to `groupOrder`, and loads the two fonts. Existing transforms stay inline as they are.
- Reversible transforms use explicit bijective maps; decode of the Unicode "font" styles reuses
  NFKC normalisation rather than hand-written reverse tables.
- Typos and scramble use a PRNG seeded per word, so output is stable while you type (earlier
  words do not reshuffle on every keystroke) but still random-looking.

## TODO
1. Write `src/lib/dash-glyphs.ts`.
2. Write `tests/dash-glyphs.test.mjs`: round-trip for every reversible transform, map
   uniqueness, typo/scramble stability and letter preservation. Run `npm test`.
3. Wire into `dash.astro`, update header, page description, reversibility notes.
4. `npm run check` + `npm run build`; drive the page in the browser via `npm run dev`.
5. CHANGELOG entry (0.60.0).
6. Commit, push to `main`, confirm the live page at voynichlabs.org/dash shows the new buttons.
