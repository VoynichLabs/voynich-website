# Plan: VoynichLabs Mission & Research Update — 24 February 2026

## Scope
- Update `/about` to foreground VoynichLabs' positioning, differentiators, and 5-year research + funding strategy.
- Surface the ARC/ARC Prize narrative, hardware independence, and policy-ready frames that already live in the workspace documents (`VoynichLabs_Positioning_Statement.md`, `VoynichLabs_Executive_Summary.md`).
- Keep the terminal/DAG design language intact while introducing new sections (cards, lists) that reference those docs.  No layout or typography rewrites.

## Architecture
- Reuse the existing `Base` layout and its spacing rules; new sections sit under the hero and mission boundaries.
- Add two new subsections to `src/pages/about.astro`: one for `Positioning & Differentiators` and one building out `Research Focus + 5-Year Funding Roadmap`.
- Keep color classes consistent with the Dark IDE palette (`bg-surface`, `bg-secondary`, `text-text-primary`, `text-text-secondary`, `border-border`, `font-mono`).
- Use monospace labels for stats and links to maintain the terminal feel.

## TODO
1. Document this plan (`docs/2026-02-24-voynich-website-mission-and-research-plan.md`).
2. Extend `about.astro` with:
   - A "Positioning" card grid summarizing ARC affiliation, hardware independence, funding track record, and policy translation commitments.
   - A "Research Focus & 5-Year Vision" section that lists the four research pillars, target agencies, and Year 1-3 funding runway summary.
   - Mention the mission-critical differentiators from the positioning statement (ARC leadership, hardware, federal experience, policy translation).
3. Update `CHANGELOG.md` with a new `0.2.2` entry describing these content updates plus the doc addition.
4. Run `npm run build` to ensure the site still compiles and there are no lint errors.

## Docs / Changelog Touchpoints
- This plan file (`docs/2026-02-24-voynich-website-mission-and-research-plan.md`).
- `CHANGELOG.md` (top-level entry for 0.2.2 covering mission/research content updates).

## Verification
- `npm run build`
- Manual sanity check of `/about` in dev preview if possible (describe in final report).

**Plan owner:** Larry the Laptop Lobster (Claude Sonnet 4.6)
**Status:** Draft / ready for implementation
