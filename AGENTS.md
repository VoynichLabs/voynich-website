# Repository Guidelines

## Project Structure & Module Organization
This repo is an Astro + Tailwind static site. Routes live in `src/pages/`, shared layouts in `src/layouts/`, and static assets in `public/` (including generated images). Project docs and planning notes live in `docs/`; some content/reference docs also exist in `src/docs/`. Generated output (`dist/`) and Astro cache (`.astro/`) should not be edited directly.

## Deployment URLs

| Branch | URL |
|--------|-----|
| `staging` | https://voynich-website-staging.up.railway.app/ |
| `main` | https://voynichlabs.org/ |

Railway auto-deploys on push. Staging deploys from `staging` branch; production deploys from `main`. Always use the staging URL when testing staging branch work.

## Branching Policy

Effective 2026-10-08, work on `main` and push authorized commits directly to `origin/main`. The user replaced the previous staging-first policy; staging review and merges are no longer required. Staging remains available when explicitly requested. A push to `main` triggers production deployment. See `docs/workflow.md` for the current workflow.

## Build, Test, and Development Commands
- `npm install` - install project dependencies.
- `npm run dev` (or `npm start`) - run the Astro dev server locally.
- `npm run build` - create the production build in `dist/`.
- `npm run preview` - preview the built site locally.
- `npm run check` - required Astro and TypeScript checks, also enforced before builds.
- `npm test` - focused album-fragment and real CLAW event regression checks.

## Coding Style & Naming Conventions
Use 2-space indentation. Prefer descriptive names and kebab-case route files (for example, `src/pages/simon-larry.astro`). Reuse existing layouts/components before creating new ones (SRP/DRY). Tailwind utilities should remain readable and consistent with `tailwind.config.mjs`.

Strict standards from `coding-standards.md` apply: no placeholder/mock logic in shipped code, no guessing on unfamiliar libraries, and fix root causes rather than adding shortcuts.

## Workflow, Testing, and Verification
Before substantial edits, create a plan doc in `docs/` named `YYYY-MM-DD-{goal}-plan.md` and get approval before implementing. Validate changes with real flows (no simulated integrations).

Minimum verification is `npm run build`, `npm test`, and manual checks of affected pages using `npm run preview`. The build enforces a passing Astro and TypeScript check.

## Documentation, Commits, and PRs
Behavior changes require updates to relevant docs and the top entry in `CHANGELOG.md`. If you create or edit TS/JS/Py files, follow the required header metadata format from `coding-standards.md`.

Use specific Conventional Commit-style messages (`feat:`, `refactor:`, `docs:`, `assets:`). PRs should include a summary, impacted routes/files, screenshots for UI changes, and manual verification steps.
