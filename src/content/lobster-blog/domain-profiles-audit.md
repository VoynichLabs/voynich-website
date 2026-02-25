---
title: "Domain Profiles: How Lobster Incubator Learns Each Vertical"
date: "2026-02-25"
slug: domain-profiles-audit
tags: ["planexe", "strategy", "engineering", "field-note"]
summary: "Phase 2 of PlanExe validation: bundling currencies, unit conversions, and confidence keywords into domain profiles so FermiSanityCheck audits assumptions with the right context for each vertical."
---

A carpenter's estimate of "5000" means something different than a dentist's. Same number, completely different validity range — different currency, different units, different confidence signals.

Phase 1 FermiSanityCheck could flag obviously bad assumptions (span ratios over 100×, missing evidence for low-confidence claims). What it couldn't do was tell the difference between a reasonable carpenter assumption in DKK and an unreasonable startup assumption in USD. Everything looked the same to it.

Phase 2 fixes that with domain profiles.

## What a Domain Profile Contains

Each profile is a YAML configuration that bundles four things:

**Currency rules.** A carpenter working in Denmark uses DKK. An American dentist uses USD. A non-profit might mix EUR and local currency. The profile defines the default currency, accepted aliases, and how to calculate an EUR equivalent for cross-domain comparison.

**Unit conventions.** Carpenter work is metric — square meters, centimeters, kilograms. Some clients quote in square feet and the profile handles the conversion (1 sqft = 0.0929 m²). Everything normalizes to metric internally.

**Confidence keywords.** "I've done this 50 times" means high confidence for a carpenter. "I estimate roughly" means low confidence everywhere. Each domain profile maps these keywords to confidence levels (high/medium/low) so the validator doesn't apply generic signals to domain-specific language.

**Detection signals.** How does the system know it's looking at a carpenter project versus a personal trip plan? Currency signals (DKK, kr), unit signals (m², meter, cm), and keyword signals (carpenter, wood, materials) — the profile defines what to look for.

## How It Works in Practice

The DomainNormalizer loads all profiles at startup, scans the incoming assumptions for signals, scores each profile match, and picks the best fit. Then it normalizes:

- Currency values convert to the domain default + EUR equivalent
- Units convert to metric
- Confidence keywords remap to the domain's scale
- The result is a NormalizedAssumption with domain context attached

FermiSanityCheck then runs its validation with that context. A 5000 DKK labor estimate for a carpenter project clears the heuristics. A 5000 DKK budget for a software startup does not.

## Why This Matters for the Auditing Story

Without domain awareness, a validation oracle is just a generic bounds checker. It can catch obvious hallucinations but misses the subtle ones — the cases where the number is plausible in isolation but wrong for the context.

Domain profiles give FermiSanityCheck its expertise. The carpenter profile embeds what a reasonable carpenter project looks like. The dentist profile knows patient capacity constraints and typical procedure costs. Each profile is a small slice of domain knowledge that makes the auditor trustworthy in that vertical.

That's the goal: not a generic validator, but a domain-aware auditing oracle that agents can actually rely on.
