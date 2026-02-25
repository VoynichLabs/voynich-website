# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install          # install dependencies
npm run dev          # dev server at localhost:4321
npm run build        # production build to dist/
npm run preview      # serve built site locally
npm run astro -- check  # Astro type/route checks
```

No automated test suite. Minimum verification: `npm run build` + manual review with `npm run preview`.

## Architecture

Astro 5 + Tailwind 3 static site. No framework components — all pages are `.astro` files.

- `src/pages/` — routes: `/`, `/about`, `/projects`, `/simon`, `/team`, and three perspective pages (`simon-larry`, `simon-egon`, `simon-bubba`)
- `src/layouts/Base.astro` — the only shared layout; all pages extend it via `<Base title="...">`
- `public/` — static assets (generated art, favicon, screenshots)
- `docs/` and `src/docs/` — planning notes and narrative reference material

**Routing note:** `astro.config.mjs` dynamically sets `base` to `/` for dev and Railway, and `/voynich-website` for GitHub Pages. Use relative links or Astro's `base` handling — do not hardcode paths.

**Tailwind palette:** dark IDE theme. Semantic tokens (`bg-primary`, `bg-surface`, `node-blue`, `edge-green`, etc.) are defined in `tailwind.config.mjs`. Legacy aliases (`void`, `deep`, `accent`, `lobster`) exist for backward compat during phased redesign — prefer the new semantic names for new work.

**Fonts:** Inter (sans) and JetBrains Mono (mono) loaded from Google Fonts. KaTeX CSS loaded in `Base.astro` for math in LODA sections.

## Required Workflow

1. **Plan first:** Before substantive edits, create `docs/YYYY-MM-DD-{goal}-plan.md` and get approval.
2. **File headers:** Every TS/JS file you create or touch must start with:
   ```
   // Author: {Your Model Name}
   // Date: {timestamp}
   // PURPOSE: ...
   // SRP/DRY check: Pass/Fail - did you verify existing functionality?
   ```
3. **Changelog:** Any behavior change requires updating the top entry in `CHANGELOG.md`.
4. **No placeholders:** No mock data, stubs, or fake integrations in shipped pages.
5. **Commits:** Only when explicitly requested. Use Conventional Commit prefixes (`feat:`, `fix:`, `docs:`, `refactor:`, `assets:`).

## Communication Style

- No time estimates.
- Do not celebrate completion — nothing is done until the user tests it.
- Keep responses tight; skip chain-of-thought dumps.
- End completed tasks with "done" (or "next" if awaiting further instructions).
- Windows 11 environment; use Unix shell syntax in bash commands.
- Do not use the "X" or checkmark glyphs (including emoji variants) — keep output UTF-8 safe.
