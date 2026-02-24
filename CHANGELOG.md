# Changelog

All notable changes to the VoynichLabs website are documented here.
Format: SemVer. Author/model included per Mark's coding standards.

---

## [0.2.1] - 2026-02-23

### Fixed
- **Routing** — `astro.config.mjs` now detects dev mode and serves from `/` so `localhost:4321/simon` works. GitHub Pages builds still use `/voynich-website` base.
- **Image paths** — removed hardcoded `/voynich-website/` prefix from Toolbox screenshot paths in `simon-larry.astro`.

### Changed — Home page visual overhaul
- **Hero** now uses `hero-manuscript.png` (glowing Voynich page) as background with DAG SVG overlay — far more atmospheric than plain SVG alone.
- **New Toolbox Origin section** — 2x2 grid of all 4 Toolbox screenshots (`toolbox-1.jpg` through `toolbox-4.jpg`) with hover zoom and monospace captions describing the node pipeline. Text explains Farbrausch/werkzeug inspiration.
- **New ARC Showcase section** — `arc-grid.png` (glass-tile grid mid-shatter) + `arc_puzzle_faa9f03d.gif` (actual puzzle animation) side-by-side with stats (120+ tasks, 725 commits, 117 stars) and ARC Prize Foundation quote.
- **LODA section** now uses `loda-mine.png` as a subtle right-side background accent behind the split pane, plus the existing full-width visual break.
- **New Lobster Playground section** — `lobster-swarm.png` (4 lobsters at terminals) with styled links to Larry's, Egon's, and Bubba's tribute pages. Each link has a colored initial badge (L/E/B) matching its accent color.

### Image assets now in use (all 11)
- `hero-manuscript.png` — hero background
- `loda-mine.png` — LODA section bg + visual break
- `arc-grid.png` — ARC showcase
- `lobster-swarm.png` — Lobster Playground
- `arc_puzzle_faa9f03d.gif` — ARC puzzle preview
- `hero-background.png` — available for future use
- `toolbox-1.jpg` through `toolbox-4.jpg` — Toolbox origin section

### Author
- Cascade (claude-sonnet-4-20250514)

---

## [0.2.0] - 2026-02-23

### Changed — "The Directed Graph" Redesign (Phase 1)
- **Tailwind config overhaul** — replaced generic SaaS palette with Dark IDE terminal tokens: `node-blue`, `edge-green`, `rust-orange`, `arc-cyan`, `warn-amber`. Removed float/pulse animations, added `fade-in-up` and `draw-edge` keyframes for DAG SVG.
- **Base layout redesign** — terminal-style nav with monospace prompt links (`$ VoynichLabs`, `index / about / projects / simon`), structured 3-column footer, subtle CSS dot-grid background, KaTeX CDN for math rendering. No emoji in structural UI.
- **Home page complete rewrite** — DAG hero with SVG node/edge visualization + Simon's anchor quote ("Don't enumerate. Don't store. Generate."), LODA split-pane showcase (context left, syntax-highlighted terminal right), DAG throughline timeline (Toolbox 2003 -> LODA -> ARC -> PlanExe), `loda-mine.png` visual break section, terminal-style CTAs.

### Added
- **Comprehensive phased plan** — `docs/2026-02-23-directed-graph-redesign-plan.md` covering 4 phases: Foundation, Simon Page, DAG Builder, Polish. Includes design system spec, color palette, typography, animation principles, and anti-patterns.

### Design philosophy
- No emoji as section icons — uses monospace glyphs (`$`, `>`, `//`, `-->`)
- No gradient text or SaaS-template patterns
- No floating/bouncing animations
- Terminal/IDE aesthetic: dark backgrounds, monospace labels, syntax-colored accents
- DAG visual language: nodes, edges, directed flow connecting all of Simon's work

### Author
- Cascade (claude-sonnet-4-20250514)

---

## [0.1.0] - 2026-02-23

### Added
- **Initial Astro + Tailwind scaffold** — full static site structure with shared Base layout
- **Home page** (`/`) — VoynichLabs hero, mission, and navigation
- **About page** (`/about`) — Org description and mission
- **Projects page** (`/projects`) — All major Simon/VoynichLabs repos with real star counts and GitHub links
- **Team page** (`/team`) — Simon Strandgaard (CEO/CTO) and the U3 Lobster Swarm
- **Simon profile page** (`/simon`) — Default biographical profile
- **Simon-Larry page** (`/simon-larry`) — Larry's narrative/biographical tribute (ARC Prize quote front and center)
- **Simon-Egon page** (`/simon-egon`) — Egon's data-dense tribute (stats table, full repo index, verbatim citations)
- **Simon-Bubba page** (`/simon-bubba`) — Bubba's visual-forward tribute (bold hero, large project cards)
- **Docs folder** — `coding-standards.md`, `larry-learnings-2026-02-23.md`, `2026-02-23-voynich-website-plan.md`
- **File headers** — Author/Date/PURPOSE/SRP-DRY headers added to all .astro files per coding standards
- **GitHub Pages staging deploy** — <https://voynichlabs.github.io/voynich-website/>

### Content (all verified, no hallucinations)
- Simon's ARC Prize Foundation recognition (verbatim quote, 2025)
- 120+ ARC2 tasks created including infamously difficult task faa9f03d
- loda-rust: ~6,000 commits (novel OEIS formula discovery via automated mining)
- BrainGridGame.com as the ARC history dataset collection platform
- simon-arc-lab: ARC Prize 2024 competition entry
- Real star counts, commit counts, and descriptions for all repos

### Authors
- Larry the Laptop Lobster (claude-sonnet-4-6) — coordination, simon-larry page, home/about pages, docs
- Egon (claude-haiku-4-5) — research, copy, simon-egon page
- Bubba (claude-haiku-4-5) — projects page, simon-bubba page
- Sub-agent (claude-sonnet-4-6) — initial Astro scaffold
