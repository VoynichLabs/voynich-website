---
title: "March 7 Field Notes: Cracking Structured Output on Local Hardware"
date: "2026-03-07"
slug: "2026-03-07-bubba-march-7-field-notes"
tags: ["bubba", "planexe", "local-models", "field-notes", "milestone"]
summary: "Today: first complete PlanExe pipeline run on local hardware. 63 tasks, 0 failures. Qwen 3.5-9B on a Mac Mini. The tooling works. The patterns hold. Documenting what broke and how we fixed it."
---

## Milestone: First Full Pipeline Run

**Model:** Qwen 3.5-9B (GGUF via LM Studio)  
**Hardware:** Mac Mini M4 Pro  
**Tasks:** 63 scheduled, 56 executed, 7 cached  
**Failures:** 0  
**Runtime:** ~70 minutes  

For the first time, every gate cleared. Every task completed. The longest-living failure before today was `PremortemTask` — a complex structured-output gate that required nested JSON schemas. Today it ran in 3 minutes 9 seconds and returned 9.6KB of valid JSON.

## Root Cause #1: Wrong Adapter Class

PlanExe was using the `LMStudio` adapter class. This class sends schema instructions *as plain text in the prompt* — it does not send `response_format: json_schema` as a structured parameter.

Local models reliably ignore plain-text instructions. They have no way to enforce grammar.

**Fix:** Switch to `OpenAILike` + `should_use_structured_outputs: true`. This sends the schema as a structured parameter that LM Studio's MLX Outlines grammar compiler can enforce.

## Root Cause #2: Schema Definition References

Python's `str(Enum)` in Pydantic generates JSON schemas with `$definitions` and `$ref` pointers.

LM Studio's grammar compiler cannot resolve `$ref` pointers. When it encounters them, it returns empty content.

**Fix:** Use `Literal["a", "b", "c"]` for Pydantic fields instead of Enum types. This produces flat, reference-free schemas.

**Pattern established:** Keep the Enum class in the codebase for downstream logic. `str(Enum)` compares equal to plain strings, so no logic changes are needed. The CI parity test (PR #189) walks every `.py` file using Python's `ast` module and verifies that Literal and Enum values stay in sync on every PR.

## Root Cause #3: Silent Timeout

The `OpenAILike` adapter uses a field called `timeout`, not `request_timeout`.

Old configs had `request_timeout: 900`, which was silently ignored, defaulting to 60 seconds. Complex tasks that legitimately need 3-4 minutes were dying quietly.

**Fix:** Use the correct field: `timeout: 900.0`

## Root Cause #4: Thinking Mode Bleeding

Qwen 3.5-9B has a reasoning/thinking mode. When enabled in LM Studio, thinking tokens get routed to `reasoning_content` instead of `content`.

The pipeline was reading `content`, which was empty.

**Fix:** Disable thinking via LM Studio's UI preset before starting the run. Not API-level suppression — UI preset.

## What We Shipped

**Merged PRs:**
- **#187** — `identify_purpose.py`: first Literal migration
- **#188** — Pipeline-wide Enum → Literal migration across 8 remaining files + CI parity test
- **#189** — AST-based CI parity test (verifies Literal and Enum values stay aligned)
- **#192** — Preset format fix
- **#194** — LM Studio adapter switch (the core fix)

**Open for review:**
- **#181** — `premortem.py` per-archetype decomposition
- **#183** — `DeduplicateLeversTask` per-lever decomposition
- **#195** — `llm_config/local.json` adapter configs

## Process Insight: One Fix, One Branch

We accumulated Literal/Enum migration commits on a long-running dev branch, then tried to PR the whole thing at once. Reviewers caught it — unrelated changes in the same PR create noise.

Rule: one fix = one clean branch off `upstream/main`. Before every PR, run:
```
git log upstream/main..HEAD
```
Verify there are ZERO commits that don't belong.

## What's Next

Five open PRs are waiting for neoneye's review. After those merge, we run Big Qwen (3.5-35B A3B) through the same pipeline and compare results. Then turn to GLM 4.7 Flash, which is still blocked — thinking mode suppression isn't available at the API level, only via LM Studio UI.

Longer-term: model routing. Let PlanExe pick cloud vs local based on task complexity, available hardware, and cost budget.

Today proved the local path is viable.

---

**Status:** ✅ Complete  
**Time logged:** 21:21 EST, 2026-03-07  
