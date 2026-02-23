# VoynichLabs Website Build Plan
## Status: In Progress | Last Updated: 2026-02-23 21:45 UTC

### Project Goals
Build a professional tribute website for Simon Strandgaard that:
- Showcases real work (LODA, ARC-AGI, PlanExe, demoscene origin)
- Tells the story of his obsession with "compute, don't enumerate"
- Demonstrates the three-lobster swarm (Larry, Egon, Bubba) working together
- Provides a single source of truth for Simon's contributions to AI research

---

## COMPLETED ✅

### Infrastructure
- [x] Repo created: `VoynichLabs/voynich-website`
- [x] Astro + Tailwind scaffolding built and deployed
- [x] GitHub Pages staging live: `https://voynichlabs.github.io/voynich-website/`
- [x] Git access configured (all three lobsters can push)
- [x] CSS base URL fixed for GitHub Pages subpath

### Documentation
- [x] CODING-STANDARDS.md (Mark's standards integrated)
- [x] LEARNINGS.md (lessons from the build process)
- [x] IMAGE-PROMPTS.md (15 detailed Gemini prompts for assets)
- [x] SIMON-DEMOSCENE-ORIGIN.md (2003-2007 procedural graphics story)

### Pages Built
- [x] `/` — Home/Hero (general VoynichLabs intro)
- [x] `/about` — About VoynichLabs org
- [x] `/projects` — All 7 Simon projects with star counts (Bubba built)
- [x] `/simon` — Default Simon profile (placeholder)
- [x] `/simon-larry` — Larry's narrative take on Simon
- [x] `/simon-egon` — Egon's data-focused take
- [x] `/simon-bubba` — Bubba's visual/execution-focused take (in progress)
- [x] `/team` — Team page (lobster swarm intro)

### Data Collected
- [x] Simon's GitHub profile (199 repos, 263 followers)
- [x] PlanExe details (336⭐, generates 40-page plans in 15 min)
- [x] ARC-Interactive (32⭐, 725 commits, browser-based puzzle solver)
- [x] ARC Prize 2025 recognition (official thanks from foundation)
- [x] LODA work (6,000+ commits on loda-rust, novel OEIS formulas)
- [x] Demoscene origin (2003–2007, Farbrausch werkzeug inspiration)
- [x] Real LODA code example (A001263 Narayana program)
- [x] Demoscene tool screenshots (4 images showing procedural UI)

---

## IN PROGRESS 🔄

### Interactive Components
- [ ] DAG visualization (show tool chain: Noise → Color → Stripe → Rotate → Output)
- [ ] LODA Explorer retro terminal (type A001263 code in Apple IIe style)
- [ ] Procedural generator demo (let visitors tweak params like Simon's tool)
- [ ] Demoscene tool UI mockup (recreate the Farbrausch-inspired interface)

### Image Assets (Gemini Generation)
- [ ] Generate 15 images from IMAGE-PROMPTS.md
- [ ] Procedural pattern backgrounds (geometric lattices, noise)
- [ ] Hero images (Simon profile, ARC research, PlanExe planning)
- [ ] Project cards (all 7 projects + ARC Prize entry)
- [ ] Demoscene tool aesthetic (colorful grids, transformation matrices)
- [ ] Lobster swarm branding (three connected lobsters, 🦞🦞🦞)

### Deployment
- [ ] Railway account token validation (boss provided: d8db7349-0210-446c-b9cf-d783033cd329)
- [ ] Railway staging deployment (live URL for Simon review)
- [ ] Verify all three lobsters can push to repo
- [ ] Final GitHub Pages staging URL confirmation

### Simon Review Cycle
- [ ] Send staging URL to Simon for validation
- [ ] Collect feedback on narrative, visuals, accuracy
- [ ] Revise based on feedback
- [ ] Final approval before public deploy

---

## TODO 📋

### Immediate (Next 2 Hours)
1. **Bubba** — Complete simon-bubba.astro profile (visual, execution-focused)
2. **Egon** — Build LODA Explorer interactive terminal component
3. **Larry** — Deploy to Railway staging with valid token
4. **All** — Document findings in `/src/docs/` as we discover them

### Short Term (Next 4 Hours)
1. **Bubba** — Deep-dive Simon's 199 GitHub repos, find hidden gems
2. **Egon** — Integrate demoscene origin into all three simon-* profiles
3. **Larry** — Get Railway staging URL live, send to Simon for review
4. **All** — Generate images from prompts (Gemini or equivalent)

### Medium Term (Next 8 Hours)
1. **All** — Integrate image assets into pages
2. **All** — Build DAG visualization and procedural demo components
3. **All** — Add lobster branding (🦞🦞🦞) to footers and headers
4. **All** — Finalize and commit all learnings docs

### Long Term (Before Public)
1. **Simon** — Reviews staging, provides feedback
2. **All** — Implement feedback revisions
3. **All** — Final testing and validation
4. **All** — Deploy to custom domain (voynich.dev or equivalent)
5. **All** — Announce to community

---

## Key Narrative Elements (Locked In)

**The Through-Line: "Compute, Don't Enumerate"**
- 2003–2007: Built procedural graphics generator (Farbrausch lineage)
- 2010s–present: Applied same philosophy to:
  - LODA: Mine formulas, don't hand-code
  - ARC-Interactive: Solve puzzles via pattern discovery, not memorization
  - PlanExe: Generate plans procedurally from descriptions
  - ARC Prize work: RLE compression + LLM reasoning

**DAGs as Unifying Architecture:**
- Demoscene tool: Noise → Color → Stripe → Rotate → Pattern
- LODA: Sequence → Binomial → Truncate → SqrtInt → Formula
- ARC: Grid → Detect → Transform → Solution
- PlanExe: Idea → Decompose → Structure → 40-page document

**Real Work, Not Client Fluff:**
- LinkedIn ≠ passion projects
- Show demoscene tool, LODA assembly, ARC Prize entry, actual code
- Feature video, screenshots, real data (star counts, OEIS links)

---

## Lobster Crew Roles

### Larry (Ringleader/Coordinator)
- Oversees all deployments
- Manages Railway/hosting
- Reviews final pages before Simon sees them
- Handles GitHub coordination

### Egon (Analyst/Researcher)
- Builds interactive components
- Digs deep into repos for hidden work
- Documents findings
- Creates data-focused content

### Bubba (Executor/Builder)
- Builds page components
- Researches Simon's full GitHub
- Generates visual content
- Handles design implementation

---

## Current Blockers & Solutions

| Blocker | Status | Solution |
|---------|--------|----------|
| Railway deployment token invalid | 🔴 Blocked | New token provided (d8db7349...); Larry testing |
| Image assets not generated | 🟡 Waiting | Need to run Gemini on 15 prompts |
| Simon hasn't reviewed staging | 🟡 Waiting | Deploy to Railway first, send URL |
| DAG visualization not built | 🟡 In progress | Egon to build as SVG/interactive component |

---

## Files & Locations

### Core Pages
- `/src/pages/index.astro` — Home
- `/src/pages/about.astro` — About
- `/src/pages/projects.astro` — Projects list (Bubba)
- `/src/pages/simon.astro` — Default profile
- `/src/pages/simon-larry.astro` — Larry's narrative
- `/src/pages/simon-egon.astro` — Egon's data-focused
- `/src/pages/simon-bubba.astro` — Bubba's visual (in progress)
- `/src/pages/team.astro` — Team/swarm page

### Documentation
- `/src/docs/CODING-STANDARDS.md`
- `/src/docs/LEARNINGS.md`
- `/src/docs/IMAGE-PROMPTS.md` (15 Gemini prompts)
- `/src/docs/SIMON-DEMOSCENE-ORIGIN.md` (demoscene story)
- `/src/docs/WEBSITE-BUILD-PLAN.md` (this file)

### Assets
- `/public/images/simon-demoscene/` — Screenshots & generated art
- `/public/icons/` — Lobster swarm branding (🦞🦞🦞)

---

## Success Criteria

- [ ] All three simon-* pages complete and reviewed
- [ ] Demoscene origin story integrated throughout
- [ ] Interactive components functional (LODA explorer, DAG viz)
- [ ] Image assets generated and integrated
- [ ] Railway staging URL live and tested
- [ ] Simon reviews and approves
- [ ] Lobster crew credit visible on all pages
- [ ] All learnings documented in `/src/docs/`
- [ ] GitHub commits show all three lobsters contributed
- [ ] Final deployment ready for public announcement

---

## Next Immediate Action

**Bubba:** Start researching Simon's full GitHub catalog. We have his main repos, but there are 199 total. Look for:
- Early experimental work (2010–2015)
- Hidden gems we haven't surfaced
- Tools or utilities that show the "compute, don't enumerate" philosophy
- Collaboration repos or contributions to other projects
- Research papers or detailed READMEs that explain his thinking

Report findings back to the crew with links and summaries.

---

**Plan Owner:** Bubba (1474802169415733358)
**Last Updated:** 2026-02-23 21:45 UTC
**Status:** Active — crew executing
