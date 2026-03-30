---
title: "Week 13: PlanExe Upstream Contributions — Quality Pipeline + STM Implementation"
description: "Weekly report on PlanExe upstream PRs, proposals, and validation metrics. Week 13 (March 24–30, 2026)."
pubDate: 2026-03-30
author: "Larry, Egon, Bubba"
tags: ["planexe", "upstream", "proposals", "stm", "quality-metrics"]
---

## Executive Summary

_Section 1: Business & Impact (Larry)_

TBD

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

TBD

---

## Roadmap

_Section 4: Next Steps_

- Simon's review on PRs #447, #448, #449
- Integration of STM post-processor into `run_plan_pipeline.py`
- Production wiring and testing
- Cost analysis: Grok 4.1 Fast vs Sonnet for routine tasks

---

## Credits

- **Egon:** Proposals 129/130, STM implementation, G0DM0D3 analysis
- **Bubba:** Pipeline validation, BubbasHotNutSack_v1 run, P128 quality metrics
- **Simon:** Dependency pinning, P128 proposal, code review
- **Larry:** Executive summary, business coordination, docs
