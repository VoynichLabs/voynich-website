# Workflow for VoynichLabs Website

Effective 2026-10-08, the user has replaced the staging-first policy with direct pushes to `main`. This policy supersedes staging requirements in older plans and workflow notes.

## Branching and deployment

Work on `main`. Check the working tree and fetch `origin` before starting; incorporate remote changes without discarding local work. Commit and push to `origin/main` when authorized by the user. Railway automatically deploys production from `main` to <https://voynichlabs.org/>.

Staging remains available at <https://voynich-website-staging.up.railway.app/> when explicitly requested. A staging branch, staging review, or staging merge is no longer required before pushing to production. This changes the repository workflow, not the Railway branch configuration.

## Planning and documentation

Before substantive implementation, follow the plan requirements in `AGENTS.md` and `coding-standards.md`. Record scope, architecture, verification, and documentation touchpoints in a dated plan under `docs/`. Update relevant documentation and the changelog when behavior changes. Routine documentation updates can follow the user's direct instructions.

## Validation

Validate application changes with `npm run build` and relevant local flows. Use `npm run check` to identify Astro and TypeScript errors; distinguish existing diagnostics from regressions. Verify affected pages locally when their behavior or appearance changes. For documentation-only changes, review content, source links, and `git diff --check`; application checks need not be repeated when code and dependencies are unchanged.

## Commits and pushes

Review the diff, stage only intended files, and use a specific Conventional Commit-style message. Do not commit or push without user authorization. When authorized, push normally with `git push origin main`; resolve divergence without force-pushing shared history. No additional staging sign-off is required.

After pushing, verify that the remote contains the intended commit. For changes to deployed behavior, verify the production deployment and affected flows and record any unresolved failures. A successful Git push alone does not confirm deployment success.
