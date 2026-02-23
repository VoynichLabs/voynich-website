# Plan: VoynichLabs Website — 2026-02-23

## Scope

**In:**
- Full VoynichLabs company website (static, Astro + Tailwind CSS)
- Simon Strandgaard tribute pages (three versions: Larry, Egon, Bubba perspectives)
- Projects page covering all major Simon/VoynichLabs repos
- About, Team, Home pages
- Docs folder with standards and learnings

**Out:**
- Backend/server-side logic
- User authentication
- CMS integration
- Railway production deploy (pending valid project token)

## Architecture

- **Framework:** Astro (static site generator)
- **Styling:** Tailwind CSS via @astrojs/tailwind
- **Layout:** Single base layout (`src/layouts/Base.astro`) shared by all pages
- **Pages:** `src/pages/*.astro` — one file per route
- **Docs:** `docs/*.md` — plans, standards, learnings
- **Deploy target:** GitHub Pages (staging) → Railway (production, pending token)
- **Repo:** VoynichLabs/voynich-website on GitHub

## Module Responsibilities

| File | Responsibility |
|---|---|
| `src/layouts/Base.astro` | Shared HTML shell, nav, footer, Tailwind base |
| `src/pages/index.astro` | Home/hero — VoynichLabs intro |
| `src/pages/about.astro` | Org mission, VoynichLabs context |
| `src/pages/projects.astro` | All Simon/VoynichLabs projects with real stats |
| `src/pages/team.astro` | Team members (Simon + lobster swarm) |
| `src/pages/simon.astro` | Default Simon profile page |
| `src/pages/simon-larry.astro` | Larry's narrative take on Simon |
| `src/pages/simon-egon.astro` | Egon's data-dense take on Simon |
| `src/pages/simon-bubba.astro` | Bubba's visual-forward take on Simon |

## TODOs (ordered)

- [x] Scaffold Astro + Tailwind project
- [x] Build all page shells
- [x] Research Simon's GitHub repos (real data, no hallucinations)
- [x] Add ARC Prize Foundation recognition (verbatim quote)
- [x] Add profile photo from arc.markbarney.net
- [x] Add LODA language context (novel OEIS formula discovery)
- [x] Add simon-arc-lab (ARC Prize 2024 competition entry)
- [x] Add BrainGridGame.com context for history dataset
- [x] Deploy to GitHub Pages for Simon's review
- [ ] Add file headers to all .astro files (coding standards compliance)
- [ ] Get Railway project token and deploy to production
- [ ] Simon review and approval
- [ ] Fix any issues Simon flags
- [ ] Production deploy

## Docs/Changelog Touchpoints

- `docs/coding-standards.md` — Mark's standards (added)
- `docs/larry-learnings-2026-02-23.md` — Larry's session learnings (added)
- `CHANGELOG.md` — All significant changes logged here
- This plan doc lives in `docs/` per standards

## Approval Status

Plan created retroactively (work was done in parallel with planning — lesson learned for next time).
