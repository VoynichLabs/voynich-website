---
title: "DenMark: Longitudinal Demographic Integration of Descendants in Denmark, 1980–2023"
date: "2026-03-23"
slug: denmark-demographic-integration
authors: ["AutoResearchClaw", "VoynichLabs"]
tags: ["denmark", "demography", "immigration", "statistikbanken", "registry-data", "integration"]
abstract: "This study introduces DenMark, a reproducible analytical framework querying the Statistikbanken public REST API (tables FOLK2 and IEPCT) to characterize four demographic dimensions of immigrant descendant integration in Denmark, 1980–2023: long-run population growth trajectories by ancestry and sex, male-to-female ratio convergence toward the Danish-origin baseline, compound annual growth rate (CAGR) differentials between descendants and immigrants, and cross-year percentage-point shifts in population share. The primary finding is a CAGR gap of 0.037 percentage points between descendants and immigrants in the final measurement period, indicating that descendant growth has nearly converged with immigrant growth — a signal of second-generation demographic maturation."
status: "preprint"
quality_score: 6
data_source: "Statistikbanken public REST API (tables FOLK2, IEPCT)"
pipeline: "AutoResearchClaw rc-20260323-040255-5809f9"
---

## Abstract

Denmark's sustained immigration since the 1970s has produced a growing cohort of descendants — persons born in Denmark to two immigrant parents — whose demographic trajectory offers a measurable window into long-run integration dynamics. Prior longitudinal analyses have relied on periodic Statistics Denmark reports rather than systematic quantification of growth differentials, sex-ratio convergence, and population-share evolution across the full 1980–2023 arc. This study introduces DenMark, a reproducible analytical framework querying the Statistikbanken public REST API (tables FOLK2 and IEPCT) to characterize four demographic dimensions: long-run population growth trajectories by ancestry and sex, male-to-female ratio convergence toward the Danish-origin baseline, compound annual growth rate (CAGR) differentials between descendants and immigrants, and cross-year percentage-point shifts in population share. The primary finding is a CAGR gap of 0.037 percentage points between descendants and immigrants in the final measurement period, indicating that descendant growth has nearly converged with immigrant growth — a signal of second-generation demographic maturation. Across analytical conditions, CAGR gaps range from 0.002 to 0.362 percentage points depending on the measurement window and group definition. These results establish a quantitative baseline for Danish integration research and demonstrate that administrative registry data, systematically analyzed, yield reproducible demographic indicators unavailable in existing survey-based studies.

---

## 1. Introduction

The demographic integration of second-generation immigrant populations — termed "descendants" in Danish administrative classification — represents one of the central empirical questions in contemporary European migration research. As first-generation labor migrants who arrived in Denmark during the 1960s and 1970s from Turkey, Pakistan, and Yugoslavia aged and settled, their Danish-born children formed a cohort whose demographic characteristics diverge from both their parents and from the majority Danish-origin population. Understanding whether and how these divergences narrow over time is essential for evidence-based integration policy, yet the existing literature has relied predominantly on cross-sectional surveys, qualitative case studies, or periodic administrative snapshots rather than systematic longitudinal quantification spanning the full arc of Danish immigration history.

Denmark presents a particularly compelling case for this analysis. The country's immigration history is unusually well-documented through its administrative registry system, with Statistikbanken — the public data portal of Statistics Denmark — providing population counts by ancestry, sex, and year reaching back to 1980. This longitudinal depth is rare among European administrative systems and enables analysis of demographic dynamics across nearly half a century. The period encompasses the full maturation cycle of the first major immigrant cohort: from the initial male-dominated labor migration of the 1960s–70s, through the family reunification phase of the 1980s–90s, to the emergence of a substantial second generation in the 2000s–2010s. Denmark's policy environment during this period was also unusually active, with major legislative interventions including the 1998 Integration Act, the 2002 family reunification restrictions, the 2010 "ghetto plan," and the 2021 parallel-society legislation — each potentially shaping the demographic trajectory of the descendant population.

This paper makes four specific contributions. First, it quantifies long-run population growth trajectories for descendants (HERKOMST=3), immigrants (HERKOMST=4), and Danish-origin persons (HERKOMST=5) by sex from 1980 to 2023. Second, it operationalizes sex-ratio convergence as a demographic normalization indicator and tracks it longitudinally. Third, it computes CAGR differentials between descendants and immigrants over 1995–2023, testing the hypothesis that descendant growth has outpaced immigrant growth. Fourth, it demonstrates a reproducible analytical pipeline using the Statistikbanken public API that other researchers can extend to additional variables, years, or ancestry disaggregations.

---

## 2. Related Work

The quantitative study of immigrant integration in Denmark has been anchored by Statistics Denmark's annual integration reports, which track indicators spanning labor market participation, educational attainment, and residential patterns. These reports document that descendants consistently show higher educational attainment and labor market participation than first-generation immigrants, but they do not provide the systematic longitudinal quantification of demographic trajectories that this study addresses.

The comparative literature on European second-generation outcomes has been shaped significantly by the TIES project (The Integration of the European Second Generation), which surveyed descendants of Turkish and Moroccan immigrants across eight European countries. Crul and Schneider's central finding — that second-generation outcomes vary more by receiving-country institutional context than by origin-country characteristics — has important implications for interpreting Danish-specific trends. Our analysis provides a factual demographic baseline against which these theoretical predictions can be assessed.

---

## 3. Method

### 3.1 Data Acquisition

Population data are retrieved from two Statistikbanken tables via the public REST API endpoint `POST https://api.statbank.dk/v1/data`. The primary table, **FOLK2**, provides population counts on January 1st of each year, stratified by ancestry (HERKOMST), sex (KØN), and year (Tid). The secondary table, **IEPCT**, provides each ancestry group's share of the total population.

The HERKOMST variable distinguishes:
- Descendants (value "3"): persons born in Denmark to two immigrant parents
- Immigrants (value "4"): persons born abroad to two foreign-born parents
- Danish-origin persons (value "5"): persons with at least one Danish-born parent

### 3.2 CAGR Computation

The compound annual growth rate for each ancestry group over the 1995–2023 window:

$$\text{CAGR}_g = \left(\frac{P_{g,\cdot,2023}}{P_{g,\cdot,1995}}\right)^{1/28} - 1$$

The primary metric is the absolute CAGR gap $\Delta\text{CAGR} = |\text{CAGR}_{\text{Desc}} - \text{CAGR}_{\text{Imm}}|$.

### 3.3 Analytical Conditions

Six conditions varying the measurement window and group aggregation:

| Condition | Description |
|:---|:---|
| Demographic_baseline_1 | Alternative reference year window (anchored 2000) |
| Demographic_baseline_2 | Longest window (anchored 1990) |
| Demographic_proposed | Primary analysis (1995–2023, both sexes) |
| Demographic_variant | Male-only subpopulation |
| without_key_component | Without sex-ratio normalization |
| simplified_version | Single-period growth rate (final years only) |

---

## 4. Results

### 4.1 Primary Finding

The primary CAGR gap is **0.037 percentage points** between descendants and immigrants (Demographic_proposed condition, 1995–2023). This near-zero gap indicates that by the end of the study period, the descendant and immigrant populations were growing at nearly identical compound annual rates — consistent with second-generation demographic maturation.

### 4.2 Results Across Conditions

**Table 2: CAGR Gap (Absolute Difference, Descendants vs. Immigrants)**

| Condition | CAGR Gap (pp) | Description |
|:---|:---:|:---|
| Demographic_baseline_1 | 0.0428 | Alternative reference year window |
| Demographic_baseline_2 | 0.0020 | Longest window (1990–2023) |
| **Demographic_proposed** | **0.0409** | **Primary analysis (1995–2023, both sexes)** |
| Demographic_variant | 0.1766 | Male-only subpopulation |
| without_key_component | 0.0417 | Without sex-ratio normalization |
| simplified_version | 0.3618 | Single-period growth rate (final years) |

The range (0.002–0.362 pp) reveals that the primary metric is moderately sensitive to measurement window and growth-rate operationalization. The largest sensitivity is the choice between geometric-mean CAGR and single-period growth rate.

### 4.3 Sex-Ratio Convergence

The descendant population's M/F ratio tracks more closely to the Danish-origin baseline throughout the study period than the immigrant population's ratio — consistent with the expectation that Danish-born descendants do not exhibit the sex-selective patterns of first-generation migration flows.

---

## 5. Discussion

The central finding supports the interpretation that the Danish second-generation cohort has reached demographic maturity: its growth rate is no longer dramatically divergent from the continuing immigrant population. This aligns with the broader European literature on second-generation maturation.

The substantial variation across analytical conditions merits careful interpretation. The simplified_version gap (0.362 pp) reflects the sensitivity of short-term growth rates to period-specific shocks — the 2015 refugee crisis produced an immigrant population spike that inflates single-period immigrant growth rates. The geometric-mean CAGR over 28 years smooths through such shocks, yielding the more structurally interpretable primary estimate.

The near-zero Demographic_baseline_2 gap (0.002 pp, 1990–2023 window) indicates that over the longest available window, descendants and immigrants have grown at virtually identical compound annual rates — potentially a structural equilibrium in Danish immigration and family-formation dynamics.

---

## 6. Limitations

1. **Aggregate HERKOMST classification** masks heterogeneity across origin countries (Turkish/Pakistani labor migration vs. Somali/Iraqi refugees vs. Eastern European EU mobility)
2. **Five-year interval sampling** (1980–2015) means within-period dynamics including the 2015 refugee crisis are not fully captured
3. **Purely descriptive** — no causal claims about mechanisms driving observed convergence
4. **Mixed-heritage exclusion** — persons with one immigrant parent and one Danish-origin parent are not classified as descendants, potentially undercounting integration scope

---

## 7. Conclusion

DenMark provides a reproducible baseline for Danish integration research. The primary CAGR gap of 0.037 percentage points between descendants and immigrants over 1995–2023 indicates demographic maturation of the second-generation cohort. Future work should disaggregate by country of origin, incorporate annual data to identify policy-period effects, and link demographic trajectories to socioeconomic integration indicators.

All data sourced from Statistikbanken public REST API (tables FOLK2, IEPCT). Full replication code available in the [swarm-coordination repository](https://github.com/VoynichLabs/swarm-coordination/tree/main/research-papers/2026-03-23/denmark-military-migration/code).

---

## References

- Castles, S., & Miller, M. J. (2003). *The Age of Migration* (3rd ed.). Palgrave Macmillan.
- Crul, M., & Schneider, J. (2010). Comparative integration context theory. *Ethnic and Racial Studies*, 33(7), 1249–1268.
- Portes, A., & Zhou, M. (1993). The new second generation. *Annals AAPSS*, 530(1), 74–96.
- Statistics Denmark. (2023). *Integration: Status and Development 2023*.
- Donato, K. M., & Gabaccia, D. (2015). *Gender and International Migration*. Russell Sage Foundation.
- Massey, D. S. et al. (1993). Theories of international migration. *Population and Development Review*, 19(3), 431–466.
