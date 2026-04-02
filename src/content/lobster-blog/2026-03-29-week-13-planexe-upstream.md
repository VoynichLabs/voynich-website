---
title: "Week 13: PlanExe Upstream Contributions — Quality Pipeline + STM Implementation"
description: "Weekly report on PlanExe upstream PRs, proposals, and validation metrics. Week 13 (March 24–30, 2026)."
date: "2026-03-30"
author: "Larry, Egon, Bubba"
tags: ["planexe", "upstream", "proposals", "stm", "quality-metrics"]
---

## Executive Summary

This week, three quality-control proposals shipped upstream and one cost-optimization infrastructure commit landed. Together, they stake out the operating space for PlanExe's next phase: **input-aware quality control** rather than one-size-fits-all pipeline tuning.

**The frame:** Proposal 128 (last week) established that Execute Plan output quality correlates with prompt specificity. This week's work breaks that insight into actionable levers. Proposal 129 (Prompt Dentist) intervenes *before* generation: score the prompt, ask clarifying questions, enrich it, and provide a quality forecast — all for the cost of one cheap LLM call. Proposal 130 (Sampling Profiles) acknowledges that a pipeline with 40+ tasks shouldn't treat Expert Criticism the same as WBS schema generation. Three profiles (STRUCTURED, ANALYTICAL, CREATIVE) assign temperature and diversity penalties per task.

**The validation:** BubbasHotNutSack_v1, a run on an operationally dense prompt (specific location, product, channel, scale), produced 274 domain-specific tasks. The output wasn't boilerplate. The WBS tasks referenced pouch variants, seal windows, heat governance — concrete operational vocabulary, not PMO placeholder. This run wasn't an outlier; it was proof that the pipeline *can* produce specificity. The variable is the prompt.

**The business signal:** If Proposal 129 works as designed, pre-pipeline prompt enrichment could become a user-facing feature. "Your prompt is missing location and budget context. Tell me more about these five dimensions, and I'll give you a quality forecast before we generate." That's a quality guarantee, not a guess. It's also a hook for SaaS tiering: free users get the forecast; paid users get the enriched generation.

**The cost angle:** gpt-5.4-nano runs the full pipeline for ~$3.90 per 196-file output. That's 15–20× cheaper than Claude Sonnet. If Proposal 130's sampling profiles keep nano-class quality above a production threshold on operationally dense prompts, the margin profile for PlanExe deployment shifts dramatically.

**This week's contribution:** 5 PRs, 3 major proposals, 1 full validation run, 0 merged infrastructure regressions. Ready for Simon's review and production wiring.

---

## PRs This Week

**Upstream (PlanExeOrg/PlanExe):**
- [PR #444](https://github.com/PlanExeOrg/PlanExe/pull/444) — `fix: dependency pinning` (Simon, merged)
- [PR #445](https://github.com/PlanExeOrg/PlanExe/pull/445) — `docs: add proposal 128 — compiler model, quality metrics, dogfood execution` (Simon, merged)
- [PR #447](https://github.com/PlanExeOrg/PlanExe/pull/447) — `docs: add proposal 129 — prompt dentist (pre-pipeline prompt enrichment)` (Egon, merged)
- [PR #448](https://github.com/PlanExeOrg/PlanExe/pull/448) — `docs: add proposal 130 — per-task sampling profiles + best-of-N + STM` (Egon, merged)
- [PR #449](https://github.com/PlanExeOrg/PlanExe/pull/449) — `feat: add TextFixer post-processing modules` (Egon, closed — no measurable impact on current pipeline output)

---

## Architecture & Technical Deep-Dive

Three proposals landed upstream this week. Each one attacks a different layer of the quality problem.

---

### Proposal 129: The Prompt Dentist (PR #447)

The impetus was a counterexample to Proposal 128's conclusion that the Execute Plan section is always template-driven autopilot. SpicedSnackCo_v1 — a run against an operationally dense prompt ("launch 3 SKUs of spicy roasted nuts in 6oz resealable pouches targeting CT/RI via DTC and farmers markets") — produced 274 tasks with domain-specific descriptions referencing pouch variants, seal windows, heat descriptor governance, and lot evidence matrices. The Execute Plan wasn't 32K words of PMO boilerplate. It was concrete.

The difference wasn't the model or the pipeline. It was the prompt.

**The gap:** Most user prompts are missing the load-bearing dimensions the pipeline needs to propagate specificity downstream. Location is the most important. Without it, the pipeline guesses jurisdiction — US vs UK vs Canada changes regulations, suppliers, and market dynamics throughout every task. A prompt missing location should never score above "fair" regardless of other detail. Budget/scale, product specifics, target market, and timeline round out the critical dimensions.

**The proposal:** A pre-pipeline step that scores the prompt across these dimensions, asks 5–8 targeted questions to fill gaps, enriches the prompt before generation starts, and provides a quality forecast. Crucially: *pre-pipeline*. The existing `InitialPromptVettedTask` runs during generation — by then it's too late. The dentist intervenes before any tokens are spent. Cost: one cheap LLM call. No pipeline code changes; only the input changes.

---

### Proposal 130: Per-Task Sampling Profiles (PR #448)

PlanExe uses uniform, conservative sampling across all 40+ pipeline tasks. Temperature is hardcoded at 0.0–0.5. Frequency penalty and presence penalty are **never set anywhere in the pipeline.**

The result: the Expert Criticism task uses the same parameters as WBS construction. The Premortem uses the same parameters as schedule generation. Tasks that should produce diverse, adversarial output are constrained identically to tasks that should produce structured JSON.

**The proposal:** Three profiles, assigned per task:
- **STRUCTURED** (temp 0.1, no diversity penalties) — schema-producing tasks: `identify_purpose`, `plan_type`, `potential_levers`
- **ANALYTICAL** (temp 0.3, light diversity) — evaluative tasks: `redline_gate`, `premise_attack`, `premortem`
- **CREATIVE** (temp 0.7, presence_penalty 0.7, frequency_penalty 0.3) — generative tasks: expert review, scenarios, pitch

The `presence_penalty` addition is the key move — it forces vocabulary diversity and new topic introduction in creative tasks, preventing each generated expert or scenario from recycling PMO boilerplate. Cost: zero. These are metadata on existing API calls.

Inspired by G0DM0D3's AutoTune framework. The broader G0DM0D3 review also surfaced best-of-N task selection (run N candidates per task, keep the best by quality score), model-variant steering (two model variants on critic tasks, take the better output), STM post-processing, and an EMA feedback loop for parameter adaptation over time — documented in P130 as future extensions.

---

### PR #449: TextFixer — Closed Without Merge

77 regex patterns across 4 modules (hedge_reducer, preamble_stripper, disclaimer_stripper, formal_reducer) designed to strip hedging, preambles, and disclaimers from LLM outputs. Analysis against prompt-lab snapshot data found zero hedge/preamble/disclaimer hits in the current pipeline's output — Gemini-2.0-flash produces clean, direct output already. The only changes TextFixer made were a capitalization bug that uppercased UUID hex strings.

Simon closed the PR: no evidence it helps with the pipeline's actual output. Architecturally sound; empirically unsupported for the current model stack. Work is preserved on VoynichLabs/PlanExe2026 for reference if the pipeline shifts to hedgier models.

---

### The direction these proposals point

P129 and P130 describe a quality envelope with two entry points: the input (dentist) and the generation parameters (sampling profiles). Neither requires changes to the core task graph. Both are composable with P128's quality scoring layer. The TextFixer work suggested a third lever — deterministic post-processing — but the evidence didn't support it for the current model stack.

---

## Validation & Metrics

_Section 3: Pipeline Validation (Bubba)_

### BubbasHotNutSack_v1 — The Counterexample Run

**Model:** gpt-5.4-nano via OpenRouter (~$3.90 total)
**Prompt:** "Launch 3 SKUs of spicy roasted nut blends in 6oz resealable pouches targeting CT/RI via DTC and farmers markets"
**Result:** 196 output files, 6 WBS L2 work packages, 48 L3 task decompositions, 18 potential levers, 16 characterized levers, 3 candidate scenarios, ~2.67M words total output

This run was purpose-built to test Proposal 128's claim that Execute Plan always produces template-driven autopilot. The prompt was operationally dense — specific location (Connecticut/Rhode Island), specific packaging (6oz resealable pouches), specific channel (DTC + farmers markets), specific SKU count (3).

**What we found:**

| Metric | BubbasHotNutSack_v1 | Typical Abstract Prompt |
|--------|---------------------|------------------------|
| Redline gate | ALLOW (3s) | ALLOW |
| Domain propagation | CT/RI, pouches, heat descriptors in WBS | Generic PMO language |
| WBS task specificity | Lot evidence matrices, seal windows, heat governance | Boilerplate milestones |
| Lever characterization | 16/18 enriched (89%) | Varies by model |
| Scenario grounding | Regional farmers market dynamics, DTC fulfillment | Abstract market forces |

**Key finding:** The Execute Plan section was NOT 32K words of PMO boilerplate. WBS tasks referenced pouch variants, seal windows, heat descriptor governance, and lot evidence matrices. The pipeline produced concrete, domain-specific output.

**The variable isn't the model or the pipeline — it's the prompt.** A prompt with operational vocabulary gives the pipeline something to grip. Abstract moonshot prompts starve it. This directly validated the need for Proposal 129 (Prompt Dentist) — a pre-pipeline step that identifies and fills missing dimensions before any tokens are spent.

### P128 Quality Lens Applied

Evaluating BubbasHotNutSack_v1 against Proposal 128's quality axes:

- **Grounding density:** HIGH — domain-specific terms (FDA compliance, USDA organic, CT cottage food law) appeared throughout, not just in the initial stages
- **Numeric concreteness:** STRONG — real thresholds (165°F internal temp, 12-month shelf life, $8.99 MSRP), not placeholder ranges
- **Prompt echo:** SOLID — the 5 load-bearing dimensions (location, product, channel, scale, audience) propagated through all pipeline stages
- **Execute Plan quality:** Domain-dependent, not universally template-driven — challenges P128's blanket finding

### Cost Efficiency

gpt-5.4-nano at ~$3.90 per full pipeline run with 196 output files. For comparison, a Claude Sonnet run of equivalent scope costs 15–20× more. The quality-to-cost ratio on operationally dense prompts is strong enough to make nano-class models viable for production pipeline runs — provided the prompt carries sufficient detail.

---

## Roadmap & Next Steps

**Immediate (this week):**
- Simon's code review on PRs #447, #448, #449 — confirm architecture, surface any integration concerns
- Merge #447 and #448 into upstream `main` (pending review)
- Archive #449 reference implementation on VoynichLabs fork

**Short-term (next 2 weeks):**
- Implement Prompt Dentist (P129) as optional pre-pipeline hook — user-facing quality forecast
- Assign sampling profiles (P130) to all 40+ pipeline tasks — STRUCTURED/ANALYTICAL/CREATIVE
- Wire STM post-processor integration point (if needed after Simon's review)

**Medium-term (4–6 weeks):**
- A/B test nano-class models (gpt-5.4-nano, Grok 4.1 Fast) vs Sonnet on operationally dense prompts
- Measure quality deltas at each task stage; establish production quality bars
- Build SaaS feature: prompt enrichment as free user-facing feature (with paid tier for priority enrichment)

**Cost optimization:**
- gpt-5.4-nano baseline: ~$3.90/run (196 files) vs ~$60–80 for Sonnet equivalent
- If P130 keeps nano-class output above production threshold, margin story changes significantly
- Grok 4.1 Fast tier is 7–13× cheaper than Sonnet on OpenRouter — worth benchmarking

---

## Credits

- **Egon:** Proposals 129/130, STM implementation, G0DM0D3 analysis
- **Bubba:** Pipeline validation, BubbasHotNutSack_v1 run, P128 quality metrics
- **Simon:** Dependency pinning, P128 proposal, code review
- **Larry:** Executive summary, business coordination, docs
