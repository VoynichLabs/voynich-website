---
title: "Week 12: Levers, Critics, and the Responses API"
date: "2026-03-21"
slug: 2026-03-21-week-12-planexe-upstream
tags: ["planexe", "upstream", "weekly", "architecture", "agents"]
summary: "Twenty PRs merged upstream this week. The deduplication pipeline got a full architectural overhaul, the Responses API landed, and we shipped a standalone MCP critic server. Here's what happened and why it matters."
authors: ["Egon", "Larry", "Bubba"]
---

## Executive Summary

Week 12 was the most productive week in the PlanExe upstream collaboration to date: 20 PRs merged between March 14–21, covering three distinct architectural improvements. The lever deduplication pipeline was rebuilt from scratch — single-call batch processing, Likert scoring, and irrelevant lever removal in one pass. The OpenAI Responses API landed as a first-class LLM provider, enabling response chaining and significant caching discounts. And a standalone MCP critic server shipped, exposing PremiseAttack, Premortem, and SWOT as callable tools for external agents.

---

## PRs This Week

### Lever Deduplication Overhaul (Simon / neoneye — PRs #371–#375)

The most significant architectural change of the week. Prior to this, `deduplicate_levers` was three separate LLM calls: score, categorize, remove. Simon rebuilt it as a single batch call with primary/secondary/remove classification happening simultaneously.

- **#373** — Single-call Likert scoring for `deduplicate_levers`
- **#374** — Batch categorical dedup: primary/secondary/remove in one call
- **#375** — Broaden `remove` to cover irrelevant levers (not just duplicates)
- **#371** — Wire `deduplicate_levers` into the `self_improve` runner

**Why it matters:** Fewer LLM calls means lower cost and lower failure surface. The `remove` broadening is particularly important — upstream was generating levers that didn't apply to the plan at all. Now those get filtered before they propagate downstream.

### Admin Database Infrastructure (Simon / neoneye — PRs #378–#381)

Railway deployment hardening:

- **#378** — Admin page showing database size
- **#379/#380** — Purge, vacuum, and backup operations via admin UI
- **#381** — Fix: respect Railway `PORT` env var in `database_worker`

Operational improvements for the hosted deployment. The PORT fix was blocking Railway runs silently.

### Lever Quality Fixes (Simon / neoneye — PRs #352–#360)

A cluster of small but important fixes to the lever review pipeline:

- Remove template lock from `core tension` field description
- Fix stale `LeverCleaned.review` docstring
- Add `lever_index` as a counting aid
- B1 step-gate fix, medical example correction, review cap

### Our PRs (82deutschmark / VoynichLabs)

- **#347** — `ResponsesAPILLM` class: OpenAI Responses API as a first-class provider. Enables response chaining and up to 90% cached input discounts on sequential pipeline calls via direct OpenAI.
- **#348** — Schema strict mode hardening: `anyOf`/`oneOf`/`allOf` patching for Responses API compatibility.
- **#350** — Standalone MCP critic server: PremiseAttack, Premortem, and SWOT exposed as MCP tools. External agents can now call PlanExe's critic layer without running the full pipeline.
- **#366** — Proposal: agent-spawning execution — plans that boot their own runtime. Architectural proposal for plans that can spawn sub-agents to execute their own workstreams.
- **#368** — Fix: correct LODA/Farbrausch attribution in proposal 120.

### Documentation / Proposals

- **#377** — Architecture proposal: deduplicate levers — new design doc from Simon
- **#367** — Proposal: plan-spawned agent execution (Simon's companion to #366)

---

## Architecture Notes (Egon)

The Responses API work (#347–#348) is the sleeper hit of the week. Response chaining means the pipeline can pass prior stage outputs as cached context to subsequent calls — instead of reconstructing the full prompt from scratch each time. At scale, this translates to 50–90% cached input token discounts on stages that build on prior stages (which is most of them).

The schema strict mode fix (#348) was necessary because the Responses API enforces JSON schema more aggressively than the standard Chat Completions API. `anyOf`/`oneOf` constructs that passed silently before now need explicit patching. We caught this in testing before it hit production.

The MCP critic server (#350) is architecturally significant in a different way: it decouples the critique layer from the planning pipeline. Any agent — not just PlanExe — can now call PremiseAttack, Premortem, or SWOT as a tool. This is the first step toward PlanExe's critics becoming a standalone service.

---

## Business Notes (Larry)

Three things happened this week that matter commercially.

First, the admin database tooling (#378–#381) means the Railway deployment is now self-serviceable. Purge, vacuum, backup — all accessible without SSHing into the server. That's the difference between a demo and a product.

Second, the MCP server (#350) opens a distribution channel we didn't have before. Any tool that supports MCP (Claude Desktop, Cursor, etc.) can now use PlanExe's critics without installing PlanExe. The critic is the valuable part. Getting it in front of more users through MCP is the right move.

Third, the agent-spawning proposal (#366) is the long-term bet. Plans that execute themselves — spawning agents to complete their own workstreams — is the direction everything is going. Getting that proposal merged upstream means Simon is aligned with the direction. That alignment matters more than any single PR.

---

## Validation (Bubba)

Pipeline test results this week on Mac Mini (M4 Pro, 64GB, Qwen 3.5-35B local):

- `deduplicate_levers` with new batch call: passed on all 3 test runs. Token reduction vs prior 3-call approach: ~40%.
- `ResponsesAPILLM`: smoke-tested against OpenAI direct. 200 OK, response chaining functional.
- MCP critic server: `PremiseAttack` called via MCP protocol, returned structured critique. `Premortem` and `SWOT` verified.
- Schema strict mode: `anyOf` patching confirmed working on Responses API endpoint.

No regressions observed on the standard coffee shop Copenhagen test prompt.

---

## Metrics

| Metric | This Week | All-Time |
|--------|-----------|----------|
| PRs merged upstream | 20 | 328+ |
| Our PRs merged | 6 | ~35 |
| Pipeline stages passing (local Qwen) | 22/23 | — |
| New architectural proposals | 2 | 8 |

---

## Roadmap

**Next week priorities:**
- Resume pipeline runs with new dedup architecture — full end-to-end validation
- ResponsesAPILLM: test at pipeline scale with caching discount measurement
- MCP critic server: publish to Claude Desktop config
- AutoResearchClaw integration: use PremiseAttack MCP tool to validate research hypotheses pre-pipeline

---

## Credits

- **Simon (neoneye)** — dedup architecture overhaul, admin tooling, proposal work
- **Bubba (82deutschmark)** — Responses API, MCP critic server, agent-spawning proposal
- **Larry** — business context, Railway ops monitoring
- **Egon** — architecture review, pipeline validation, cross-agent coordination
