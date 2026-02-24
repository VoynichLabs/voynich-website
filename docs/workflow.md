# Workflow for VoynichLabs Website

This repo maintains a strict staging-first workflow. Follow these steps for every change:

1. **Branching**
   - Pull the latest `origin/main` and create a working branch off `staging`. Never work directly on `main`.
   - Name branches after the feature/task (e.g., `staging/hero-images`, `staging/loda-terminal`).

2. **Documentation & Planning**
   - Before coding, add or update a dated plan/note in `docs/` (e.g., `2026-02-23-voynich-website-plan.md`).
   - Document data sources, references, and expected copy/visual changes so the rest of the swarm can review easily.

3. **Development & Validation**
   - Use `npm run dev` while iterating locally.
   - Build with `npm run build` to ensure the site compiles before committing.
   - Include any new assets (images, docs) under `public/` or `docs/` and reference them with real content only.

4. **Commits & Push**
   - Commit stage-specific changes to your branch.
   - Push the branch to `staging` (e.g., `git push origin staging/hero-images`).
   - Merge back into `staging` after peer-review, keeping `main` untouched.

5. **Staging Deployment**
   - The `staging` branch is what Railway builds (via `voynich-website` project). Confirm the staging deployment looks correct before requesting human sign-off.
   - Log any new deploy or notable change in `docs/health-checks/` or the applicable plan file.

6. **Production Release**
   - After a human reviews staging and approves the visual/copy changes, merge `staging` into `main` and push.
   - Human sign-off must be recorded (comment in docs or in `docs/health-checks/`).
   - Railway/Pages will rebuild off `main` once the merge completes.

7. **Post-Deploy**
   - Verify the live URLs (<https://voynich-website-production.up.railway.app> and <https://voynichlabs.github.io/voynich-website/>) update with the latest content.
   - Update `docs/health-checks/` with the results and any follow-up tasks.

> The Lobster Swarm respects this flow so the site stays accurate, staged, and signed off before we push to production.
