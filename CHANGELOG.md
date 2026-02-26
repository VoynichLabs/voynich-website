# Changelog

All notable changes to the VoynichLabs website are documented here.
Format: SemVer. Author/model included per Mark's coding standards.

---

## [0.3.3] - 2026-02-26

### Changed
- **Museum Stripe donation link** now auto-tags routing metadata in the URL (`source=lobster_museum`, `tier=lobby`) unless already present, so PlanExe can classify and route donations without extra frontend wiring.

### Author
- Larry the Laptop Lobster (openai-codex/gpt-5.3-codex)

---

## [0.3.2] - 2026-02-26

### Added
- **Museum support section** on `/lobster-art-museum` with public crypto receive addresses for ETH/EVM and SOL tips.
- **Stripe donation CTA** on `/lobster-art-museum` that routes to `PUBLIC_LOBSTER_STRIPE_DONATION_URL` (fallback: `https://home.planexe.org/account`).

### Changed
- **Museum hero badges** now include a direct “Tip the Lobster” jump link to the support block.

### Author
- Larry the Laptop Lobster (openai-codex/gpt-5.3-codex)

---

## [0.3.1] - 2026-02-25

### Added
- **Great Mistakes wing** at `/lobster-art-museum/great-mistakes` with curated entries for the latest process-failure retrospective artworks.
- **New museum artworks**:
  - `museum-great-mistake-redacted-scrolls.png`
  - `museum-great-mistake-store-chaos.png`

### Changed
- **/lobster-art-museum** now links directly to the Great Mistakes wing from the hero action row.

### Author
- Larry the Laptop Lobster (openai-codex/gpt-5.3-codex)

---

## [0.3.0] - 2026-02-25

### Added
- **Per-piece permalinks** — new dynamic route at `/lobster-art-museum/p/[slug]` generates individual shareable pages for every museum image.
- **Caption manifest endpoint** — `/lobster-art-museum/manifest.json` now publishes machine-readable metadata (title, description, permalink, tags, tweet text, Twitter intent URL) for bird CLI workflows.

### Changed
- **Museum landing page** — now includes a featured experimental strip, archive section, and direct per-piece links instead of image-only cards.
- **Base layout metadata** — added OpenGraph/Twitter meta support (`canonicalUrl`, `ogImage`, card type) so shared links produce richer previews.
- **Tapestry spotlight page** — now includes social metadata and a direct permalink to the canonical per-piece route.

### Author
- Larry the Laptop Lobster (openai-codex/gpt-5.3-codex)

---

## [0.2.9] - 2026-02-25

### Changed
- **/lobster-art-museum/expensive-medieval-tapestry** — added explicit process note documenting the off-topic / weird-call detour and wasteful API usage so the record is transparent.

### Author
- Larry the Laptop Lobster (openai-codex/gpt-5.3-codex)

---

## [0.2.8] - 2026-02-25

### Added
- **/lobster-art-museum/expensive-medieval-tapestry** — dedicated exhibit page for the expensive medieval tapestry request (`b16-baroque-dada-code-cathedral.png`) with preserved commentary.

### Changed
- **/lobster-art-museum** — added spotlight link in hero and per-card deep-link so the tapestry has its own permanent page inside the museum.

### Author
- Larry the Laptop Lobster (openai-codex/gpt-5.3-codex)

---

## [0.2.7] - 2026-02-24

### Changed
- **Simon pages** — replaced external `arc.markbarney.net/simonS.png` references with local `/simon/simonS.png` across all three perspective pages (larry, egon, bubba).
- **simon.astro** — swapped emoji avatar for real photo using local `/simon/simonS1.png`.

### Author
- Larry the Laptop Lobster (claude-sonnet-4-6)

---

## [0.2.5] - 2026-02-25

### Added
- **/lab** gallery index with experiment previews for the Gray-Scott reaction-diffusion and modular chord experiments.
- **/lab/reaction-diffusion** — full-screen Gray-Scott canvas with touch disturbance, marine palette, and legend overlay.
- **/lab/chord-diagrams** — modular arithmetic chords drawn on a 600×600 canvas with slider controls and animation toggle.

### Changed
- **Base layout** — navigation and footer now expose a `/lab` link, and new `hideNav`/`hideFooter` props let experiments drop the chrome.
- **Navigation** — added the `/lab` link between `projects` and `simon`, and the footer now echoes the same path for parity.

### Author
- Larry Sub-Agent (claude-sonnet-4-6)

## [0.2.4] - 2026-02-25

### Added
- **Lobster Incubator** — new page at `/lobster-incubator` documenting the swarm's own research agenda, field notes, and open questions.
- **Footer link** — added "🧪 incubator" link to navigation.

### Changed
- Page follows terminal/DAG aesthetic per coding-standards.md.

## [0.2.3] - 2026-02-24

### Added
- **Docs** — `docs/2026-02-24-voynich-website-mission-and-research-plan.md` documents the updated mission/research story for the about page.

### Changed — About page
- **Positioning & differentiators** now call out the ARC affiliation, hardware independence, federal funding history, and policy translation commitments from the positioning statement.
- **Research focus & funding roadmap** walks through the interpretability, intent-alignment, safety benchmark, and policy pillars plus the Year 1–3 NSF/DARPA/DOD/DHS/NIH funding trajectory from the executive summary.

## [0.2.2] - 2026-02-23

### Changed — Branding, identity, collaborators
- **Header logo**: replaced `$` shell-prompt symbol with 🦞 lobster emoji sitewide.
- **Nav bar**: added `🦞 swarm` link to `/team` page in desktop nav and footer nav.
- **Footer identity**: reframed VoynichLabs as a "research collective"; added collaborators note with link to markbarney.net; added markbarney.net to external links column.
- **Lobster Playground section** (index): added paragraph noting Mark Barney as ARC-AGI collaborator alongside the swarm.
- **Index CTA**: replaced `$` with 🦞.

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
