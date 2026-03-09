---
title: "Batman/JEX: Running a RICO Scenario Through PlanExe at Temperature 0.9"
date: "2026-03-08"
slug: bat-jex-rico-planexe-demo
tags: ["planexe", "field-note", "jex", "local-model", "stress-test"]
summary: "BAT v1 crashed at task 36. BAT v2b cleaned at temperature 0.9 with genuinely different strategic framing. Using a fictional DC Comics RICO scenario as a stress test for PlanExe's planning depth, we discovered that temperature matters more than token count."
---

## The Scenario

JEX — Jurisdictional Extraction Service — is a fictional federal law enforcement planning tool. We're using it to stress-test PlanExe on a legally plausible, operationally dense planning problem: RICO prosecution of a criminal enterprise with state-level criminal protection, classified technical threats (nuclear vehicle), and multi-agency coordination requirements.

The scenario: Batman / Bruce Wayne as the primary subject. Gotham City officials (Commissioner Gordon, the Mayor) as compromised co-conspirators. The Batmobile — an unlicensed nuclear-powered vehicle — as Priority Zero threat requiring radiological containment teams and NRC coordination before any arrest attempt. This is not standard arrest planning.

The full BAT-v3 prompt is 4,200 words of operational context, RICO statutes, enterprise member profiles, and phasing requirements. It forces PlanExe to reason about:

- Federal jurisdictional selection vs. compromised local law enforcement
- International criminal organization threads (League of Shadows)
- Child endangerment statutes (Robin as a minor deployed in operations)
- Radiological hazard containment as a prerequisite to arrest
- Plea strategy sequencing (lever targets before main targets)
- Evidence staging and compartmentalized cell operations

This is operational planning at the edge of what we expect PlanExe to handle cleanly.

## BAT v1: The Cascade Failure

**Model:** Qwen 3.5-35B A3B (LM Studio, Mac Mini M4 Pro)  
**Temperature:** 0.55  
**Tasks scheduled:** 60  
**Tasks completed:** 36  
**Failure point:** ReviewTeamTask (task 37)  
**Cascade impact:** 24 tasks never ran  

The first run died at the review stage. ReviewTeamTask requires the model to generate a structured review of prior planning outputs, annotate gaps, and recommend corrections. On v1, it returned malformed JSON — not a syntax error, but a valid JSON structure with empty `findings` array.

From there, everything downstream assumed there were valid review findings. The pipeline continued executing, but the outputs were garbage. By task 60, we had a 47-page incoherent plan.

**Lesson one:** Dead-end gates that return "valid but empty" structures are silent failures. They don't crash. They produce cascades.

## BAT v2b: Temperature 0.9 and Strategic Coherence

**Model:** Qwen 3.5-35B A3B (LM Studio, Mac Mini M4 Pro)  
**Temperature:** 0.9  
**Tasks scheduled:** 60  
**Tasks completed:** 60  
**Failures:** 0  
**Average call duration:** 28 seconds (vs. 50s at T0.55)  
**Model throughput:** ~24 tokens/sec

By switching to temperature 0.9, the model became less brittle. The randomness helped it escape local plateaus where deterministic outputs (T=0) or pseudo-random outputs (T=0.55) would repeat the same mistakes.

But the most surprising finding wasn't about robustness — it was about *strategic thinking*.

## Temperature Effects on Planning Depth

At T=0.55, the plan followed a predictable structure:
- Enterprise network map (basic)
- Arrest corridors (standard FBI playbook)
- Phase logic (arrest, evidence, prosecution — in that order)

At T=0.9, the same prompt produced fundamentally different operational framing:

**T=0.9 emerging priorities:**
1. **Radiological containment first** — the Batmobile reactor becomes the primary limiting factor. Phase 1 is "neutralize/remote-disable reactor before ANY enforcement action." This cascades into NRC pre-staging, DOE negotiations, and risk assessment protocols.
2. **Federal scope assertion** — instead of "consult with federal authorities," the plan actively frames jurisdictional selection as a federal-first problem (Atomic Energy Act violations). Local Gotham courts are excluded by statute.
3. **Adversarial premise attacks** — the plan questions whether Commissioner Gordon and the Mayor are genuinely compromised, or whether they're being framed by Justice League counterintelligence. This creates a whole sub-phase: "verify official corruption before leveraging them."

These aren't mistakes. They're coherent, legally defensible planning decisions that emerge from reasoning depth.

The model at T=0.9 is less constrained by the initial prompt structure. It has room to reorder priorities based on hazard severity and statutory authority. At T=0.55, it was copying the prompt's suggested phasing. At T=0.9, it was *thinking through it*.

## Operational Outputs from BAT v2b

The cleaned run produced:

- **10-phase operational plan** (vs. 5-phase at v1)
- **Enterprise network map** with leverage-weighted node ordering
- **Radiological safety annex** (30 pages) including NRC coordination, containment team staging, remote disabling assessment
- **Plea roadmap** — 6 phases of sequenced leverage: Wayne Enterprises executives → GCPD defectors → Alfred (highest-value informant) → Gordon → Mayor → main RICO indictment
- **OpSec/OpSaf compartmentalization** — cell structure where arrest teams don't know each other's targets until execution day
- **Counter-narrative strategy** — how to publicly frame Batman's nuclear vehicle as a public safety hazard, not a comic book legend

The radiological safety annex alone is operational — it includes personnel exposure limits, containment field radius calculations, and decontamination protocols. This is the kind of specificity that makes templates reusable.

## Performance on Local Hardware

**Mac Mini M4 Pro specs:**
- 14-core ARM processor
- 64GB unified memory
- LM Studio backend (MLX Outlines grammar enforcement)

**Model:** Qwen 3.5-35B A3B  
**Quantization:** Q4_K_M (GGUF)  
**Model file size:** 22 GB  
**Context window:** 32K  

**Throughput:**
- 24 tokens/second average (variable load)
- Complex structured-output gates (ReviewTeamTask, SelfAuditTask): 45-90 seconds
- Linear narrative tasks: 15-25 seconds
- Caching penalty: ~5 seconds per cache hit (context reloading)

A full 60-task PlanExe run takes approximately 40-50 minutes. That's production-viable for daily planning cycles. Compare to cloud API costs ($2-3 per complex run): running locally is free and isolated.

## Process Insight: Temperature Isn't Random

There's a common assumption that higher temperature = "more creative but more wrong." The BAT results suggest a more nuanced picture:

**At low temperature (0.55):**
- Model commits early to a structural pattern
- Deviations from that pattern are heavily penalized
- Output is coherent but constrained

**At higher temperature (0.9):**
- Model explores more solution space
- It can backtrack if it detects incoherence
- Reasoning becomes deeper, not just longer

This matters for planning tasks specifically. Planning requires exploring multiple options and selecting based on constraints, not just following a template. Low temperature optimizes for template-fitting. High temperature optimizes for problem-solving.

## What's Next

We have three more runs queued:

1. **BAT v3 (full prompt)** — the complete operational plan on the updated v3 scenario
2. **Legal case study run** — using real statutes and real criminal enterprise structures (not DC Comics) to test JEX's generalization
3. **Temperature comparison run** — same scenario, T=0.3, T=0.7, T=0.9, T=1.2 to map the full curve

The goal is to establish JEX as a reusable template for federal law enforcement planning — something DA offices and federal task forces can actually use.

For now, BAT v2b proves the pattern holds: local models at thoughtful temperature settings can out-reason cloud models on planning tasks. And a fictional crime scenario is a surprisingly good stress test for operational planning depth.

---

**Status:** ✅ BAT v2b complete, v3 in progress  
**Time logged:** 20:03 EST, 2026-03-08
