---
title: "PlanExe in 2026: From Plan Generator to Auditing Oracle"
date: "2026-02-25"
slug: planexe-2026-auditing-oracle
tags: ["strategy", "planexe", "agents", "field-note"]
summary: "Why building another plan generator is the wrong bet in 2026, and how PlanExe becomes valuable as the trusted validation layer autonomous agents actually need."
---

Creating a business plan from a vague description felt like a win in early 2025. An LLM could dream up a detailed roadmap in seconds. The problem nobody talked about loudly enough: those plans were hallucinated. No world model. No grounding. Just confident-sounding text.

Software and code got a pass because the output is immediately verifiable. It compiles or it doesn't. Tests pass or they fail. The feedback loop is tight.

Business plans? Legal strategy? Financial projections? The feedback loop is years long and requires trusting the AI. And the lesson from 2025 was: don't trust the AI.

## The 2026 Problem

Agents are running autonomously now. They execute in loops, often in isolation from external input to prevent prompt injection. They generate plans, make assumptions, take actions — all without a human checking every step.

The failure mode isn't dramatic. It's quiet. An agent assumes a budget of $50k when the domain norm is $5k. It assumes a 30-day timeline when the real constraint is 6 months. It chains those assumptions into downstream decisions. By the time anyone notices, the cascade has already happened.

What agents need isn't another plan generator. They need a trusted oracle they can call to ask: **"Is this assumption sane?"**

## What We Built

**Phase 1 — FermiSanityCheck:** A validation gate that inspects every quantified assumption before it feeds downstream tasks. It checks bounds, span ratios (flags anything wider than 100×), evidence quality for low-confidence claims, and domain heuristics. Output is structured JSON — deterministic, parseable, sub-second.

**Phase 2 — Domain-Aware Normalization:** A carpenter's "5000" means 5000 DKK and a reasonable day's materials. A dentist's "5000" means USD and a different set of constraints entirely. The domain normalizer auto-detects the project type, converts currencies and units to consistent baselines, and remaps confidence keywords to domain-appropriate signals. "I've done this 50 times" is high confidence for a carpenter. "I estimate" is low confidence everywhere.

Together, these sit in the PlanExe DAG between assumption extraction and downstream planning tasks. The agent gets a report. If assumptions are grounded, proceed. If they're flagged, re-evaluate.

## Why This Matters More Than Pretty Plans

PlanExe's value in 2026 isn't in generating yet another plan. It's in being the layer that prevents hallucinations from compounding across an autonomous workflow.

Agents will chain together. Agent A's output becomes Agent B's input. Without a validation checkpoint, bad assumptions propagate. With one, the chain stays honest.

That's the product. Not plan generation — assumption auditing. The trusted layer that agents call when they need to know if their reasoning is grounded in reality.

We're building that.
