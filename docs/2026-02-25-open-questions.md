# 2026-02-25 — VoynichLabs Open Questions

Documented below are every open or unanswered question about VoynichLabs as an organization that we could spot while reading the repo, docs, and workspace positioning material. They are grouped exactly as requested so the execution assistant knows what to chase next.

## (1) Mission & Identity
- **Which mission statement is canonical?** The about page, the 2026‑02‑24 mission/research plan, and `VoynichLabs_Positioning_Statement.md`/`VoynichLabs_Executive_Summary.md` each lean on slightly different hooks ("small, independent AI tools org", "compute-first policy translation hub", "ARC-affiliated safety facility"). We need a single, signed-off line that defines who we are before locking the hero text and taglines.
- **Are all of the federal funding and hardware claims accurate and approved?** The public-facing docs call out NSF, DARPA, DOD, DHS, NIH funding, plus "owned GPU/TPU infrastructure" and ARC-aligned credibility. Those are headline differentiators—Simon must confirm the details before we publish them as facts.
- **Should the Year 1/2/3 budget figures stay on the site?** The about page currently lists $450K → $900K → $1.2M, and the exec summary breaks down grants. The 2026‑02‑25 ethics plan explicitly said "no budgets" or fundraising language. We need Simon’s instruction on whether to keep, reframe, or remove those numbers.
- **Are the five-year goals still commitments or just aspirations?** Positioning docs promise "30+ peer-reviewed publications", "5–10 policy adoptions", "$5M+ annual funding", etc. Before calling them our identity, we should know whether Simon wants to present them as targets or future hopes.
- **Is the "Voynich Manuscript" metaphor still the right identity anchor?** The about copy uses it heavily; if Simon prefers a different framing, we should revise before it’s published as the canonical story.

## (2) Ethics & Values
- **What ethical guardrails should be explicitly stated?** The 2026‑02‑25 plan includes a question asking “what do we refuse to build or sell?” We still do not have those answers logged, so the ethics manifesto and values cards are incomplete.
- **Do we want to explicitly promise that we avoid military/fundraising hype?** Current copy swings between playful lobster energy and very concrete mentions of government programs. Simon needs to confirm how blunt we should be when we say "we won't chase military money" or "we don't sell hype".
- **What exact set of values should appear on the site?** The "How We Think" section currently uses three generic values (curiosity, honesty, openness), yet the mission/ethics plan asked for cards around transparency, experimentation, community accountability, and joyful rigor. Which list does Simon prefer?
- **How should "compute, don’t enumerate" translate into ethics language?** The plan repeatedly emphasises computing from minimal rules—do we want to frame that as an ethical posture (careful reuse, mechanical transparency) or purely as a design/identity metaphor? We need his direction so the wording doesn’t misfire.

## (3) Audience & Tone
- **Who exactly are we writing for?** Question 3 in the 2026‑02‑25 plan asks Simon to name the communities (ARC, LODA, alignment/agentic hackers). Do we target policymakers, funders, researchers, or a mix? Defining the audience will determine how technical vs. playful the copy should stay.
- **Should the tone remain lobster-playful across the whole site or shift for certain sections?** The mission/ethics plan calls for plainspoken, excited copy, but parts of the site already sound quite formal. We need a signed-off voice guide so the lobster branding doesn’t clash with the policy language.
- **How much policy detail should be visible to a casual visitor?** We currently reference policy translation, Congressional engagement, and export-ready documents. Do we want to keep that level of detail on every page, or only in targeted sections? Clarity on audience/tone will tell us where to signal it.

## (4) Swarm / Lobster narrative
- **Are Larry, Egon, and Bubba still meant to be portrayed as autonomous bots?** The team page calls them OpenClaw agents that ‘‘aren’t pretending to be human.’’ We should confirm with Simon whether that persona is still accurate and comfortable before giving the bots permanent copy bragging rights.
- **Is the collaborator note (Mark + Simon via ARC-AGI) approved?** The 2026‑02‑23 lobster-branding plan explicitly asks to note that Mark and Simon collaborate via ARC-AGI. Both parties should green-light that contextual detail before it goes live.
- **Can we keep the detailed infrastructure copy (node hosts, regions, runtimes)?** The team page lists hosts, regions, operators, and runtime stacks. Do we have permission to publish those operational details about the swarm nodes?
- **Do we want to continue pushing the lobster emoji and nav metaphor (🦞 in headers/CTAs)?** The branding plan proposed replacing `$` with 🦞 and leaning into the lobster persona. We need Simon’s opinion on whether the playful icons belong in site chrome or should be limited to storytelling sections.

## (5) Site pages & content gaps
- **Interactive features (DAG visualization, LODA Explorer, procedural generator) remain unbuilt.** The Website Build Plan checklist still marks them as TODO. Do we have a list of when those components will ship, or should we flag them as future work in the content plan?
- **Do the about page sections still need to be rewritten once the mission/ethics answers land?** The 2026‑02‑24 mission plan called for new Positioning cards and Research + Funding Roadmap copy tied to the workspace docs. Until the questions from the 25th are answered, we cannot confirm the final text for those sections or the version number (0.2.2/0.2.4) in the changelog.
- **Which /simon page should remain canonical?** Phase 2 of the Directed Graph plan wants one definitive `/simon` page and the other three archived. Has Simon reviewed and approved the consolidated narrative? We should not delete or retire pages without final sign-off.
- **Do the project stats (star counts, ARC task counts, LODA metrics) need a final accuracy check?** The docs cite numbers like 336⭐ for PlanExe, 725 commits for ARC-Interactive, and “dozens” of ARC Prize tasks. We should verify those with Simon before publishing them as facts.
- **Should we keep naming specific federal programs as target funders on the site?** The positioning/executive docs list NSF, DARPA, DOD, DHS, NIH, etc. We need Simon’s consent to continue referencing those agencies publicly, especially since the ethics plan advised against a fundraising focus.
- **Do we still plan to surface the Gemini-generated images from `IMAGE-PROMPTS-LARRY.md` on the site?** The build plan lists 15 prompts (hero, project cards, lobster branding). Are those assets ready, and do we have a place-holder strategy for them? Keeping this question visible will prevent visual gaps.
- **What release version and changelog entry should we publish once these narrative updates land?** Several docs mention `CHANGELOG.md` entries for 0.2.2/0.2.4 tied to mission/ethics copy. We need to know the final version number, summary line, and that Simon has reviewed the copy before tagging.


*Report compiled after reading `/docs/*`, `/src/pages/about.astro`, the mission/ethics plans, and the workspace positioning/executive documents. No files were edited.*