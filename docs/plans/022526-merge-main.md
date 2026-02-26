# 022526-merge-main

## Objective
Resolve the merge conflict introduced while pulling `origin/main` into the `staging` branch, ensuring the Lobster Art Museum page uses the centralized museum helpers (`src/lib/lobster-museum.ts`) and preserves the full DAG aesthetic layout.

## Task List
- [ ] `src/pages/lobster-art-museum.astro` lines 5-124 — Reconcile import/data-loading blocks so the page relies on `getMuseumEntries`, `getFeaturedEntries`, `getArchiveEntries`, and `inferSeries` from `src/lib/lobster-museum.ts` instead of ad-hoc `fs` logic.
- [ ] `src/pages/lobster-art-museum.astro` lines 157-353 — Merge the two divergent UI sections (wings navigation, featured strip, archive gallery) into a single cohesive layout that honors the helper-generated data (including `entry.href`).
- [ ] Verify via `npm run build` that the page compiles with the resolved data sources.
