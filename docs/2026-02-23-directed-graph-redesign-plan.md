# 2026-02-23 — "The Directed Graph" Redesign Plan

## Overview

Complete visual and structural redesign of the VoynichLabs website around the **Directed Acyclic Graph (DAG)** concept — Simon Strandgaard's unifying mental model across all his work. The site must look like it was built by a serious engineer for a serious mathematician, not vibe-coded by an AI.

**Design anchor:** *"Compute the output from minimal rules. Don't enumerate. Don't store. Generate."*

---

## Scope

**In:**
- New design system: terminal/IDE aesthetic with DAG visual language
- New color palette (dark IDE, phosphor green, node-link blue, Rust orange)
- New typography stack (JetBrains Mono + Inter/Geist)
- Redesigned Base layout (terminal-style nav, structured footer)
- New hero section with CSS DAG visualization + anchor quote
- LODA split-pane showcase (context pane + styled terminal pane)
- Top 3 sequential feature cards (loda-rust, PlanExe, arc-interactive)
- Origin/earlier eras section (SwiftyFORM, Toolbox demoscene roots)
- Interactive DAG Builder feature (prominent, not hidden)
- Consolidation: merge redundant simon-* pages into one definitive page
- Asset integration: use `loda-mine.png` and future generated images

**Out:**
- Backend/server-side logic
- WebGL (too heavy for initial phase; CSS/SVG DAG first, WebGL later)
- CMS, auth, Railway deploy (unchanged from prior plan)

---

## Design System Specification

### Color Palette — "Dark IDE"
| Token            | Hex       | Usage                                    |
|------------------|-----------|------------------------------------------|
| `--bg-primary`   | `#0c0c14` | Page background (near-black with blue)   |
| `--bg-secondary` | `#111119` | Card/section backgrounds                 |
| `--bg-surface`   | `#16161e` | Elevated surfaces, code blocks           |
| `--bg-terminal`  | `#0a0a0a` | Terminal pane backgrounds                |
| `--border`       | `#1e1e2e` | Default borders                          |
| `--border-active`| `#2a2a3e` | Hover/focus borders                      |
| `--text-primary` | `#e8e8f0` | Primary body text                        |
| `--text-muted`   | `#6b7085` | Secondary/caption text                   |
| `--node-blue`    | `#38bdf8` | DAG node links, interactive elements     |
| `--edge-green`   | `#4ade80` | Terminal text, code, phosphor accents    |
| `--rust-orange`  | `#f97316` | Rust/LODA accents, loda-rust highlights  |
| `--arc-cyan`     | `#22d3ee` | ARC-related elements                     |
| `--warn-amber`   | `#fbbf24` | Star counts, highlight numbers           |

### Typography
- **Headings & body:** `Inter` (400, 500, 600, 700)
- **Code, labels, monospace UI:** `JetBrains Mono` (400, 500)
- **Hero headline:** `Inter` at 700–800, tight tracking
- No decorative or serif fonts

### Motion Principles
- **No flashing, no bounce, no pulse**
- Subtle: edge glow on hover (0.3s ease), node fade-in on scroll (IntersectionObserver)
- DAG edges draw via CSS `stroke-dashoffset` animation (once, on enter)
- Terminal text can use a slow typewriter effect for the anchor quote (optional, tasteful)

---

## Phase 1: Foundation (This Session)

**Goal:** Replace the generic SaaS scaffold with the terminal/DAG design system. Establish the visual foundation that every subsequent page builds on.

### 1.1 — Tailwind Config Overhaul
- **File:** `tailwind.config.mjs`
- Replace color tokens with Dark IDE palette
- Add `font-display: swap` to Google Fonts link
- Add animation keyframes: `draw-edge`, `fade-in-up`, `typewriter`
- Remove lobster/accent-glow generic tokens

### 1.2 — Base Layout Redesign
- **File:** `src/layouts/Base.astro`
- Terminal-style nav: monospaced links, `>_` prompt prefix, no emoji in nav
- Structured footer: column layout, real copyright, GitHub link, no lobster emoji swarm
- Scanline/grid subtle CSS background on `<body>` (pure CSS, no images)
- KaTeX CDN link for math rendering (used in LODA section)

### 1.3 — Hero Section Redesign
- **File:** `src/pages/index.astro`
- Remove floating lobster emoji, gradient blobs, generic taglines
- Add SVG-based DAG visualization (static nodes + edges, CSS animated on load)
- Headline: "Generative computation from minimal rules."
- Anchor quote blockquote: *"Don't enumerate. Don't store. Generate."*
- Subtext connecting Toolbox -> LODA -> ARC -> PlanExe as a throughline
- CTA buttons: "Explore the Work" + "View on GitHub"

### 1.4 — LODA Split-Pane Showcase
- **File:** `src/pages/index.astro` (new section) OR dedicated component
- Left pane: markdown-style context (what A001263 is, what "loader3229" means, the math)
- Right pane: styled terminal (`bg-terminal`, green monospace, line numbers)
- Use the `loda-mine.png` as a subtle background/accent image for this section
- Caption: "This program was automatically discovered by LODA — not written by hand."
- Link to oeis.org/A001263

### Deliverables for Phase 1:
- `tailwind.config.mjs` — new design tokens
- `src/layouts/Base.astro` — terminal-aesthetic layout
- `src/pages/index.astro` — DAG hero + LODA showcase
- This plan doc

---

## Phase 2: The Simon Page (Next Session)

**Goal:** Build one definitive Simon Strandgaard showcase page that replaces the 4 redundant simon-* pages.

### 2.1 — Consolidate into `/simon`
- Merge best content from simon.astro, simon-larry.astro, simon-egon.astro, simon-bubba.astro
- Single page, one authoritative voice
- Archive old pages (move to `src/pages/_archive/` or delete)

### 2.2 — Top 3 Feature Cards (Sequential Layout)
- **Card 1: loda-rust** — Rust-orange accent, ~6000 commits stat, link to loda-lang
- **Card 2: PlanExe** — Node-blue accent, 336 stars, DAG flowchart element
- **Card 3: arc-interactive** — Arc-cyan accent, 725 commits, grid transformation visual

### 2.3 — Origin / Earlier Eras Section
- SwiftyFORM card (1,072 stars, iOS forms library)
- Toolbox demoscene origin story (2003-2007, Farbrausch/werkzeug inspiration)
- Existing Toolbox screenshots from simon-larry.astro

### 2.4 — ARC Prize Recognition
- Verbatim quote from Mike Knoop
- 120+ ARC2 tasks stat, faa9f03d link
- Keep this factual and prominent but not the hero — the work is the hero

### 2.5 — Repository Clarifications
- Collapsible section noting forks/hallucinations per Simon's corrections
- SwiftyFORM acknowledged as real original work, earlier era

### Deliverables for Phase 2:
- `src/pages/simon.astro` — complete rewrite
- Remove or archive: simon-larry.astro, simon-egon.astro, simon-bubba.astro

---

## Phase 3: Interactive DAG Builder (Future Session)

**Goal:** Build the interactive DAG builder as a **prominent feature**, not an easter egg.

### 3.1 — DAG Builder Component
- Canvas-based (or SVG) node editor
- Nodes: Input, Process, Output
- User drags to connect nodes
- Processing generates a procedural pattern (CSS gradient, SVG noise, etc.)
- Reminiscent of Toolbox (2003-2007) — "connect bricks, set parameters, machine generates"

### 3.2 — Placement
- Dedicated section on the home page, not hidden in footer
- Title: "Build a DAG" or "The Processing Pipeline"
- Caption connecting it to Toolbox → LODA → all of Simon's work
- Optional: Cmd+K shortcut to jump to it from anywhere

### 3.3 — Implementation Notes
- Use vanilla JS or lightweight library (no heavy frameworks)
- SVG for nodes/edges, CSS for styling
- Patterns generated client-side: procedural gradients, Perlin-style, stripe combinators
- Must work without JS (graceful degradation: show static example)

### Deliverables for Phase 3:
- `src/components/DAGBuilder.astro` (or `.tsx` if using islands)
- Integration into index.astro
- README update

---

## Phase 4: Polish & Supporting Pages (Future Session)

### 4.1 — Projects Page Redesign
- Apply DAG design system
- Group by domain (AI/ARC, Mathematics/LODA, Planning, Earlier Work)
- Each card uses domain-specific accent color

### 4.2 — About Page
- Rewrite with DAG philosophy framing
- VoynichLabs mission through the lens of generative computation

### 4.3 — Team Page
- Keep the lobster swarm personality but with terminal aesthetic
- No floating emoji, no bouncing lobsters

### 4.4 — Image Asset Integration
- Commission/generate images per IMAGE-PROMPTS-LARRY.md
- Integrate PROJ-03 (loda-mine.png already exists) and others
- Ensure all images have proper alt text and lazy loading

### 4.5 — Responsive & Performance Audit
- Test all pages at mobile/tablet/desktop breakpoints
- Lighthouse audit: target 95+ performance, 100 accessibility
- Ensure no layout shift from font loading

---

## Files Changed / Created (Running Index)

| Phase | File | Action |
|-------|------|--------|
| 1 | `tailwind.config.mjs` | Rewrite color/animation tokens |
| 1 | `src/layouts/Base.astro` | Redesign nav/footer, add terminal aesthetic |
| 1 | `src/pages/index.astro` | DAG hero, LODA showcase, new design |
| 1 | `docs/2026-02-23-directed-graph-redesign-plan.md` | This plan |
| 2 | `src/pages/simon.astro` | Complete rewrite |
| 2 | `src/pages/simon-larry.astro` | Archive/delete |
| 2 | `src/pages/simon-egon.astro` | Archive/delete |
| 2 | `src/pages/simon-bubba.astro` | Archive/delete |
| 3 | `src/components/DAGBuilder.astro` | New interactive component |
| 4 | `src/pages/projects.astro` | Redesign |
| 4 | `src/pages/about.astro` | Redesign |
| 4 | `src/pages/team.astro` | Redesign |

---

## Design Anti-Patterns (Do NOT Do)

- No emoji as section icons (use SVG or monospace glyphs: `>`, `|`, `#`, `$`)
- No gradient text (`bg-clip-text bg-gradient-to-r`) — it screams template
- No floating/bouncing animations
- No purple-to-pink SaaS gradients
- No rounded-full avatar frames with thick colored borders
- No "Built by the swarm" or "Powered by curiosity" taglines
- No `⭐` emoji for star counts — use plain text or SVG star icon
- No lobster emoji in navigation or structural UI (content sections only, sparingly)

---

## Approval Status

Plan created 2026-02-23. Awaiting user review before Phase 2+ implementation.
Phase 1 foundation work proceeding in this session.
