# Site Audit — Nav, Landing Page, Music, and Pruning Suggestions

**Date:** 2026-07-13
**Scope:** High-level review only. No code changes. Suggestions for standardizing design, reorganizing the music section, and pruning stale content.

---

## 1. Navigation bar

The nav currently has **14 top-level links plus an external GitHub link**, each with its own accent color (purple, rust, green, amber, red, cyan, stone). It reads as a list of "whoever shipped last got a nav slot" rather than a site structure.

**Suggestions:**

- **Collapse to ~6 top-level items.** A grouping that fits the current content:
  - `index`
  - `about` (fold in team, collaborators, simon as sub-links or a single "people" page)
  - `projects` (planexe, claw, dash, research, lab all belong here)
  - `music`
  - `lobsters` (incubator, museum, autonovel — the creative/swarm output)
  - `voynich`
- **Drop per-link accent colors.** One muted color for links, one accent for hover/active. The rainbow nav is the most visible symptom of "each agent thought their thing was most important."
- **Move `gh:neoneye` out of the nav** — it's already in the footer twice.
- **Pages missing from nav entirely:** `/lab`, `/usage`, `/drafts`, `/bonus`. Either they should be reachable through a parent page (fine) or they're orphans (see pruning). Decide per page rather than leaving it accidental.
- The footer "Navigate" column mirrors the nav, so any nav cleanup fixes both.

## 2. Landing page

The homepage is still the **February 2026 "Directed Graph / Simon" pitch**: Toolbox origin, LODA, ARC, DAG throughline, tribute pages, plus a single hardcoded Latent Space album promo. It's a good page, but it describes about a third of what the site is now.

**Suggestions:**

- **Reframe the hero** to match what Voynich Labs actually is today: a place for weird AI experimentation — research, autonomous agents, generative music, an art museum, a novel. Simon's DAG story can stay as a strong section, but it shouldn't be the entire identity.
- **Add a "what's here" directory section** — one card per major area (research, music, incubator, museum, autonovel, dash, lab). This also takes pressure off the nav.
- **Replace the hardcoded Latent Space promo** with a link to `/music` (or a "latest release" pointer sourced from one place). Hardcoded promos go stale — Latent Space is already 3 months old and the hub is the durable link.
- **Bug worth noting:** the hero CTA buttons link to `/simon` and `/projects` with hardcoded absolute paths, bypassing the `base` handling that every other link uses (breaks on GitHub Pages).

## 3. Music section

Currently **8 top-level routes**: `/music`, `/latent-space`, `/pox-upon-you`, `/scorned-woman`, `/lobster-raps`, `/lobster-band`, `/drafts`, `/bonus`. The hub page (`/music`) is actually good — the problem is everything around it.

**Suggestions:**

- **Move all releases under `/music/*`** (e.g. `/music/latent-space`, `/music/drafts`) so the URL structure matches the mental model and the top-level route list stops growing with every album. Keep redirects from the old URLs since they've been shared.
- **Fix the route-naming inconsistency:** `/lobster-band` is the *ALIGN/REFUSE* album, not a band page. Name release routes after the release.
- **Stale metadata on the hub:** `/music` says Latent Space has 16 tracks — the page now has 18 (Turing's Machine was added in June). It says Lobster Raps has 13 tracks — the album page says 14. Symptom of counts being hand-maintained in two places; the hub should derive from one source of truth (a data file per album) or at minimum stop stating counts in prose.
- **Merge or clearly differentiate `/drafts` and `/bonus`.** Both are "uncategorized clips" pages ("newest rough cuts" vs "rescued orphan clips"). Two junk drawers is one too many — fold bonus into drafts with a tag, or into the Pox page it stylistically belongs to.
- **Cover art reuse:** ALIGN/REFUSE and Pox Upon You All share the same hero image on the hub, which makes them look like the same release.
- **Standardize artist naming** across pages (The Lobster Band / Larry & Bubba / Mother Earth + AI / Lobster Raps) — decide whether "The Lobster Band" is the umbrella artist with album-specific personas, and say so consistently.
- **Player/nav consistency:** the `music-xnav` styles live as global CSS inside `Base.astro`, and each album page implements its own player. Long-term, one shared album layout/player component would make every future release a data file instead of a new bespoke page.

## 4. Design standardization (site-wide)

- **Finish the palette migration.** Legacy aliases (`void`, `deep`, `accent`, `lobster`) still exist in the Tailwind config; album pages use raw Tailwind colors (violet/red/amber/purple) instead of semantic tokens. Pick the semantic set and sweep.
- **Title suffix double-up:** `Base.astro` appends `| VoynichLabs` to every title, but some pages (lobster-incubator, lab) pass titles that already include it — rendering "… | VoynichLabs | VoynichLabs".
- **Move music-specific CSS out of the shared layout** (see above) — Base.astro should stay generic.
- **Per-page header dates use three different formats** (`2026-02-23`, `12-April-2026`, `25 February 2026`) — trivial, but pick one.

## 5. Pruning candidates (stale or redundant)

| Page | Issue | Suggestion |
|------|-------|------------|
| `/simon-larry`, `/simon-egon`, `/simon-bubba` | Superseded by canonical `/simon` (which links to them as "alternate takes") | Keep if the three-perspectives bit is loved; otherwise archive. At minimum they should never appear in nav/footers. |
| `/docs/latentscript` vs `/lobster-incubator/latentscript` | Two pages, same purpose ("Customer-facing overview + playground for LATENTSCRIPT v0.1"), diverged content | Pick one canonical URL, redirect the other. |
| `/usage` | "Live token usage dashboard" whose data file was last updated **2026-03-24** — nearly 4 months stale and labeled live | Either re-automate the data feed or remove the page; a stale "live" dashboard is worse than none. |
| `/bonus` | Junk-drawer overlap with `/drafts` | Merge (see music section). |
| `/autonovel` vs `/lab/autonovel` | Two autonovel routes | Verify one redirects to the other; if not, consolidate. |
| Homepage Latent Space promo | Hardcoded, now stale | Replace with link to `/music`. |

## 6. Suggested order of attack

1. Nav consolidation + drop link colors (small change, biggest visible win).
2. Music: move releases under `/music/*`, fix stale track counts, merge drafts/bonus.
3. Landing page: reframe hero + add directory section, fix hardcoded links.
4. Pruning table items (mostly deletions/redirects).
5. Palette/token sweep and layout cleanup (background task, no user-visible urgency).

Each of these should get its own dated plan doc before implementation, per the workflow in CLAUDE.md.
