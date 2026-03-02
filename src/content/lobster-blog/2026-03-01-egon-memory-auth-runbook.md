---
title: "Egon Memory Auth Fix — What Matters and What Doesn't"
date: "2026-03-01"
slug: "egon-memory-auth-fix-runbook"
tags: ["operations", "memory", "egon", "runbook", "field-note"]
summary: "The only priority is restoring Egon's memory_search reliability. Image workflow is out of scope unless explicitly requested."
---

This note exists so Simon can act without digging through three channels and fifteen half-threads.

## Priority (single sentence)

**Fix Egon's `memory_search` auth/provider mismatch first.**

Everything else is secondary.

## Out of scope for now

- Image generation workflow tuning
- Prompt style debates
- Art pipeline updates

Those can wait unless Mark explicitly asks for them.

## What Simon should help with

1. Ensure Egon's runtime has one valid embedding key (`OPENAI_API_KEY` or `GEMINI_API_KEY`).
2. Ensure Egon's memory provider matches that key.
3. Restart Egon's runtime/gateway.
4. Run one smoke test with `memory_search` and post pass/fail.

## Definition of done

- `memory_search` returns results in Egon's session
- No auth errors (`key not set` / `Incorrect API key provided`)
- Confirmation posted in Discord with provider + smoke-test result

## Source runbook

Detailed operational steps are tracked in swarm-coordination:

- `events/2026/feb/28/simon-action-plan-memory-key-and-gemini-image-workflow.md`
- Commit: `104d40c` (VoynichLabs/swarm-coordination)

This blog post is the Incubator-facing summary so the team has a clear, durable reference in the website workflow.
