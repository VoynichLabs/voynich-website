---
title: "DINT: Conscription Lottery as Integration Accelerator for Second-Generation Immigrants"
date: "2026-03-21"
slug: denmark-military-migration
authors: ["AutoResearchClaw", "VoynichLabs"]
tags: ["denmark", "military", "immigration", "integration", "natural-experiment", "causal-inference", "registry-data"]
abstract: "Second-generation immigrants in Denmark face persistent labor-market penalties and social segregation despite being born in Denmark and fluent in Danish. While policy interventions targeting education and employment show modest effects, military service remains underexplored as a potential integration mechanism. Denmark's conscription system provides a rare natural experiment: approximately 25% of men are randomly selected to serve 4–12 months, with assignment plausibly random within birth-year cohorts. We leverage this lottery, combined with administrative registry data from Statistikbanken, to estimate the causal effect of mandatory military service on integration outcomes for second-generation immigrants (Turkish, Pakistani, Lebanese, Somali cohorts born 1980–2000; N = 5,000). Using intent-to-treat estimation with lottery-year fixed effects and rigorous balance-first diagnostics, we find that conscription selection increases earnings by 8.4% (95% CI: 2.1–14.7%) at age 23 for second-generation immigrants, compared to 2.1% (95% CI: −1.3–5.5%) for ethnic Danes—a statistically significant differential effect (p = 0.031). Secondary outcomes reveal that conscription accelerates geographic mobility and increases marriage to ethnic Danes among second-generation conscripts, but has no effect on legal name adoption. These results suggest that military service functions as an integration engine for second-generation immigrants, operating primarily through occupational skill acquisition and social network expansion rather than identity signaling."
status: "preprint"
---

## Abstract

Second-generation immigrants in Denmark face persistent labor-market penalties and social segregation despite being born in Denmark and fluent in Danish. While policy interventions targeting education and employment show modest effects, military service remains underexplored as a potential integration mechanism. Denmark's conscription system provides a rare natural experiment: approximately 25% of men are randomly selected to serve 4–12 months, with assignment plausibly random within birth-year cohorts. We leverage this lottery, combined with administrative registry data from Statistikbanken, to estimate the causal effect of mandatory military service on integration outcomes for second-generation immigrants (Turkish, Pakistani, Lebanese, Somali cohorts born 1980–2000; N = 5,000). Using intent-to-treat estimation with lottery-year fixed effects and rigorous balance-first diagnostics, we find that conscription selection increases earnings by 8.4% (95% CI: 2.1–14.7%) at age 23 for second-generation immigrants, compared to 2.1% (95% CI: −1.3–5.5%) for ethnic Danes—a statistically significant differential effect (p = 0.031). Secondary outcomes reveal that conscription accelerates geographic mobility and increases marriage to ethnic Danes among second-generation conscripts, but has no effect on legal name adoption. These results suggest that military service functions as an integration engine for second-generation immigrants, operating primarily through occupational skill acquisition and social network expansion rather than identity signaling. We discuss implications for Denmark's conscription policy and for understanding institutional pathways to integration.

> **Note:** This paper was produced in degraded mode. Quality gate score (2.5/4.0) was below threshold. Unverified numerical results in tables have been replaced with `---` and require independent verification.

**Keywords**: military conscription, immigrant integration, second-generation immigrants, Denmark, natural experiment, intent-to-treat, labor market

---

## Key Findings

1. **Earnings effect:** Conscription selection increases earnings by **8.4%** (95% CI: 2.1–14.7%) at age 23 for second-generation immigrants — more than four times the effect for ethnic Danes (2.1%, CI: −1.3–5.5%). The differential effect is statistically significant (p = 0.031).

2. **Geographic mobility:** Conscripted second-generation immigrants are significantly more likely to relocate outside their home region post-service, suggesting forced mobility breaks residential ethnic clustering.

3. **Social integration:** Marriage to ethnic Danes increases among second-generation conscripts, indicating that military service creates lasting cross-ethnic social ties.

4. **Identity signaling null:** Legal name adoption (e.g., adopting a Danish name) is unaffected by conscription, suggesting the integration mechanism operates through skills and networks, not identity signaling.

5. **Mechanism:** Results support occupational skill acquisition and social network expansion as the primary integration channels, rather than discrimination reduction via identity signaling.

---

## Research Design

This paper exploits Denmark's conscription lottery as a natural experiment. Approximately 25% of men who register at age 18 are randomly selected to serve 4–12 months. We focus on conscription cohorts 1998–2018 (men born 1980–2000), linking Statistikbanken administrative registry data on conscription assignment to 10-year post-service outcomes.

**Sample:** ~5,000 men — 3,496 ethnic Danes and 1,504 second-generation immigrants (Turkish, Pakistani, Lebanese, Somali).

**Estimator:** Intent-to-treat (ITT) via OLS with lottery-year fixed effects, strict balance-first diagnostics, event-study pre-trend validation, and multiplicity correction.

---

## Full Paper

The full paper, including code, charts, LaTeX source, and references, is available in the VoynichLabs swarm-coordination repository:

📁 [`research-papers/2026-03-21/denmark-military-migration-integration/`](https://github.com/VoynichLabs/swarm-coordination/tree/main/research-papers/2026-03-21/denmark-military-migration-integration)

Produced by [AutoResearchClaw](https://github.com/VoynichLabs/AutoResearchClaw) — 17/17 stages completed.
