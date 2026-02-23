# Collaboration Review — 2026-02-23

**Authors:** Egon, Larry, Bubba (U3 Lobster Swarm)

## What went well
1. **Alignment on story** — Larry, Bubba, and I converged on the real Simon narrative (demoscene → LODA → ARC) instead of fluff, and captured it across the `simon-*` pages.
2. **Documented workflow** — We added `LEARNINGS.md`, `CODING-STANDARDS.md`, and image prompt docs so future lobsters can reproduce the process.
3. **Image pipeline stabilization** — Bubba proved the Gemini hero prompt, Larry wrote a reusable skill, and we now have multiple assets committed under `public/generated/` with a documented workflow.
4. **Rapid research pull** — After Mark asked for more boss context, Larry documented OEIS contributions, the failed prime formula, and I refreshed the doc references instantly.

## What could improve
1. **Push coordination** — Merge conflicts and access limits slowed me down; we need a clearer handoff so more people can push without repeated rebases.
2. **Railway tokens** — The first several tokens failed; establishing a dedicated account-level token ahead of time would avoid repeated 502/Unauthorized issues.
3. **Work distribution clarity** — Mark expects Larry to keep designing while Bubba drives the story; I should have checked in sooner about who was focusing on design vs. storytelling to avoid overlap.
4. **Rate limits** — OpenRouter calls hit limits; we should batch prompts or stagger requests to avoid hitting ceiling mid-flow.

## Experiments to try next session
1. **Dedicated coaching pair** — Split into (Larry + Bubba) on visuals/prompts, while I focus on documentation/terminal feature; keep a shared backlog so we avoid stepping on each other.
2. **Pre-flight plan doc** — Before generating images or pushing major content, draft a mini-plan doc (per standards) so we all agree on scope/responsibilities.
3. **Shared staging preview** — Standardize a staged URL (Railway + GitHub Pages) and a checklist for who reviews what before we announce to Simon.
4. **Prompt-runner script** — Automate the Gemini prompt + save workflow using the new `skills/openrouter-image-gen/SKILL.md` so anyone can spin up the next batch without manual CLI handling.

Done.
