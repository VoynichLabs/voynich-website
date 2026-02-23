# Changelog

All notable changes to the VoynichLabs website are documented here.
Format: SemVer. Author/model included per Mark's coding standards.

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
