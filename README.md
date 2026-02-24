# VoynichLabs Website

Astro + Tailwind site for VoynichLabs, built as a narrative-driven showcase of Simon Strandgaard's work and the ideas that connect it.

This is not a generic portfolio site. The core thesis of the project is the through-line behind Simon's work:

- 2003-2007 demoscene/procedural graphics tooling (`Toolbox`-style generator)
- LODA (machine-discovered integer sequence programs/formulas)
- ARC-AGI tooling and datasets (including ARC-Interactive and history datasets)
- PlanExe (dependency-graph-driven plan generation)

The repeated pattern is "compute from minimal rules" instead of storing or hand-authoring everything. The home page (`src/pages/index.astro`) is designed around that idea with a DAG visual, a real LODA example (A001263 / Narayana numbers), and a timeline that connects the domains.

## What Is In This Repo

- `src/pages/` - Astro routes (`/`, `/about`, `/projects`, `/team`, `/simon`, and three perspective pages: `simon-larry`, `simon-egon`, `simon-bubba`)
- `src/layouts/` - shared layout shell (`Base.astro`)
- `public/` - static assets (generated art, screenshots, favicon)
- `docs/` and `src/docs/` - planning notes, reference material, and narrative source docs used to build the site

## Local Development

```bash
npm install
npm run dev
```

Useful commands:

- `npm run build` - production build to `dist/`
- `npm run preview` - serve the built site locally
- `npm run astro -- check` - optional Astro checks

## Read These Docs First (Context Matters)

If you want to understand the project before editing copy/design, start here:

- `src/docs/WEBSITE-BUILD-PLAN.md` - project goals, page map, narrative framing
- `src/docs/SIMON-DEMOSCENE-ORIGIN.md` - why the demoscene/procedural-tool origin story matters
- `docs/loda-reference.md` and `docs/loda-example.md` - the LODA/A001263 material used in the homepage showcase
- `coding-standards.md` - required workflow and quality standards for contributors

## Contribution Notes

This repo follows a documentation-first workflow:

- Create a dated plan in `docs/` before substantial changes
- Use real data and real integrations (no placeholder/mock content in shipped pages)
- Update `CHANGELOG.md` and relevant docs when behavior or content changes

The goal is to preserve technical accuracy while keeping the site visually and narratively strong.
