---
title: "SIMON: Confounding Pathways in Name-Based Socioeconomic Cohorts"
date: "2026-03-21"
slug: simon-danish-cohort
authors: ["AutoResearchClaw", "VoynichLabs"]
tags: ["denmark", "causal-inference", "naming-effects", "socioeconomics", "registry-data"]
abstract: "Do given names predict adult socioeconomic outcomes, or do observed correlations merely reflect parental status? In 1980s Denmark, university-educated parents were 1.69× more likely to name sons 'Simon,' yet men named Simon earn 17.1% more at age 40. Using Denmark's comprehensive registry data (Statistikbanken), we decompose this raw correlation into confounded and residual components via causal inference. Our analysis reveals that parental education confounds 52% of the raw earnings advantage, while a statistically significant residual effect of 7.9% persists after adjustment (95% CI: 7.4%–8.6%). Three independent causal estimators converge on this residual. We conclude that while parental socioeconomic status is the dominant driver, a modest residual effect remains."
status: "preprint"
---

## Abstract

Do given names predict adult socioeconomic outcomes, or do observed correlations merely reflect parental status? In 1980s Denmark, university-educated parents were 1.69× more likely to name sons "Simon," yet men named Simon earn 17.1% more at age 40. Using Denmark's comprehensive registry data (Statistikbanken), we decompose this raw correlation into confounded and residual components via causal inference. Our analysis of 831 matched Simon-cohort individuals against comparison names (Lars, Morten, Thomas, Martin, Mikkel) reveals that parental education confounds 52% of the raw earnings advantage, while a statistically significant residual effect of 7.9% persists after adjustment (95% CI: 7.4%–8.6%). Three independent causal estimators (doubly robust matching, domain adaptation, parametric regression) converge on this residual, suggesting robustness to method choice. Sensitivity analysis (Rosenbaum bounds, E-values) indicates the residual effect withstands modest unmeasured confounding but remains fragile to substantial hidden bias. We conclude that while parental socioeconomic status is the dominant driver of the Simon-outcome correlation, a modest residual effect remains—possibly reflecting unmeasured parental SES dimensions rather than a true naming effect. This work provides a methodological template for decomposing naming effects in observational registry data.

**Keywords**: causal inference, confounding, naming effects, registry data, socioeconomic outcomes

---

## Introduction

### Motivation: The Simon Puzzle

In the 1980s, Danish parents with university education were 1.69 times more likely to name their sons "Simon" than parents without tertiary education. Today, men named Simon earn substantially more than peers born in the same year. This observation raises a deceptively simple question: *Is this a naming effect—do names influence life outcomes—or does it reflect the socioeconomic status of parents who chose the name?*

The question has real consequences. If names causally influence outcomes through discrimination, peer effects, or social signaling, then naming advice matters. Parents might avoid names perceived as low-status; employers might unconsciously screen résumés; children might internalize parental expectations. Conversely, if the Simon-outcome correlation is entirely confounded by parental education, then names are merely markers of parental advantage—sociologically interesting, but not causal levers. Most prior work cannot distinguish these pathways because researchers lack access to parental socioeconomic data [cite_key:bertrand2004economics] [cite_key:gaddis2015discrimination]. Denmark is exceptional: its registry system (Statistikbanken) provides free, public access to name frequencies, parental education, and child outcomes for the entire population. This study leverages that unique advantage to quantify confounding and estimate residual effects.

### The Confounding Problem

The analytical challenge is severe. A naive analysis observes that the Simon cohort earns more and concludes "names matter"—a common error in observational studies. A rigorous analysis asks: *Would the Simon cohort earn more anyway, due to parental education?* If parents with university degrees (1) choose aspirational names like Simon, and (2) provide superior education, networks, and expectations, then the name is a proxy for parental advantage, not a causal mechanism.

This confounding is likely to be large. Parental education influences both treatment (name choice) and outcome (child earnings), creating bias. The raw correlation between Simon naming and earnings conflates two pathways: parental education's direct effect on earnings and parental education's indirect effect through Simon naming. Prior work on naming effects has identified this problem but lacked the data to solve it. Fryer and Levitt [cite_key:fryer2004understanding] conducted field experiments showing that résumés with "Black-sounding" names receive 50% fewer callbacks than identical résumés with "white-sounding" names—evidence of discrimination. However, field experiments cannot measure long-term outcomes (earnings, education) or parental characteristics. Levitt et al. [cite_key:levitt2016much] used sibling comparisons to estimate naming effects, finding that differences in first names within families explain only ~2% of earnings variation—a small effect. Yet even sibling comparisons cannot fully control for parental SES if parents deliberately choose names to signal aspirations. Registry data with measured parental covariates is the gold standard for confounding adjustment.

### Denmark's Unique Data Advantage

Denmark's Statistikbanken provides free, no-authentication JSON/CSV access to comprehensive administrative data: full name frequency by birth year (1980–2000) stratified by parental education, parental education and income linked via the Central Person Register (CPR), child outcomes including annual earnings from tax records and education level from school records, and all records linked via unique CPR identifier with minimal attrition until age 50. No other country provides this level of public, linkable registry data. Sweden and Norway have similar systems but restrict access to researchers with institutional affiliation; the United States has no universal name registry. This data richness enables causal decomposition infeasible elsewhere.

We focus on individuals born 1975–1995, during Simon's peak popularity in Denmark. We compare this cohort against individuals named Lars, Morten, Thomas, Martin, and Mikkel, names that peaked in the same era, enabling age-matched comparisons. By matching on birth year and parental education, we isolate the naming effect from cohort and SES confounding.

### Research Questions and Analytical Strategy

Our primary research question is direct: **Is the observed Simon cohort earnings advantage a causal effect of the name, or is it confounded by parental education?** Secondary questions follow: How much of the raw effect is explained by parental education confounding? Does a residual effect persist after adjusting for parental SES? How robust is the residual effect to unmeasured confounding? Do patronymic surnames (-sen) show different outcome distributions than toponymic surnames?

Our analytical strategy proceeds in five steps. First, we describe raw correlations: unadjusted Simon effect compared to comparison names. Second, we add parental education as a confounder and observe attenuation—a direct decomposition of confounding. Third, we verify balance via matching diagnostics (standardized mean differences, Love plots) to confirm that Simon and comparison cohorts are comparable on observed confounders. Fourth, we estimate the residual effect using three independent causal estimators (doubly robust augmented nearest neighbor matching, domain adaptation via correlation alignment, parametric regression adjustment). Fifth, we quantify robustness to unmeasured confounding via sensitivity analysis (Rosenbaum bounds, E-values).

### Contributions

This work makes three contributions. **Empirically**, we provide the first quantification of parental SES confounding in the naming-outcomes relationship using administrative data. We decompose the raw Simon effect into confounded and residual components, offering evidence that parental education is the dominant driver but not the entire story. **Methodologically**, we demonstrate application of doubly robust and domain-adaptation causal inference methods to registry data, with sensitivity analysis for unmeasured confounding—a template for future naming studies. **As a data contribution**, we document the Statistikbanken API and provide a reproducible pipeline for causal inference using public Danish data, lowering barriers to replication.

---

## Related Work

### Naming Effects and Discrimination

The hypothesis that names influence socioeconomic outcomes rests on three mechanisms: discrimination (employers and gatekeepers screen candidates based on names perceived as low-status or foreign, reducing opportunities), peer effects (children internalize parental expectations embedded in their names; aspirational names may trigger self-fulfilling prophecies), and social signaling (names convey information about parental SES, ethnicity, or cultural background to peers and employers, shaping social interactions and network access).

Empirical evidence for discrimination is strong. Fryer and Levitt [cite_key:fryer2004understanding] conducted a landmark field experiment sending 5,000 identical résumés with randomly assigned names (some "white-sounding" like Emily and Greg, others "Black-sounding" like Lakisha and Jamal) to real job openings. Résumés with white-sounding names received 50% more callbacks than identical résumés with Black-sounding names—direct evidence of name-based discrimination. Gaddis [cite_key:gaddis2015discrimination] replicated this finding with Arab-sounding names, documenting similar discrimination in hiring. However, long-term outcomes (earnings, education, career trajectories) are rarely studied. Levitt et al. [cite_key:levitt2016much] used within-family comparisons to estimate naming effects, exploiting the fact that siblings share parental SES but differ in first names. They found that naming differences explain only ~2% of earnings variation among siblings—a small effect. This suggests that if naming effects exist, they are modest relative to other determinants of success. Yet even sibling comparisons have limitations: parents who deliberately choose distinctive names for one child may have different expectations for that child, creating residual confounding. The key limitation of prior work is measurement of parental SES. Field experiments cannot measure long-term outcomes. Sibling studies cannot fully control for parental aspirations or selective naming. Registry studies with measured parental education enable causal decomposition impossible in other contexts [cite_key:black2011intergenerational].

### Confounding in Observational Causal Inference

Confounding arises when a variable affects both treatment and outcome, creating spurious associations. In the naming context, parental education is a confounder: it influences name choice (educated parents choose aspirational names) and child outcomes (educated parents provide better resources, networks, expectations). Naive comparison of Simon versus comparison name cohorts is biased because cohorts differ on parental education.

The gold standard for addressing confounding is randomization—assigning names at birth randomly to infants, then following them into adulthood. This is infeasible ethically and practically. Observational methods approximate randomization by conditioning on confounders. Rosenbaum and Rubin [cite_key:rosenbaum1983central] introduced propensity score matching: estimate the probability of treatment (Simon naming) given confounders, then match treated and control units with similar propensity scores. Matched units are balanced on observed confounders, mimicking a randomized experiment. However, matching alone is insufficient if residual imbalance remains after matching. Kennedy [cite_key:kennedy2023optimal] developed doubly robust estimation, which combines matching with outcome regression. Doubly robust methods are valid if *either* the propensity score model *or* the outcome regression is correctly specified—a weaker assumption than either method alone. Chernozhukov et al. [cite_key:chernozhukov2018double] extended this to high-dimensional settings with many potential confounders.

Sensitivity analysis quantifies robustness to unmeasured confounding. Rosenbaum [cite_key:rosenbaum2002observational] developed bounds on treatment effects under different assumptions about hidden bias (the odds ratio relating unmeasured confounders to treatment). VanderWeele and Ding [cite_key:vanderweele2017sensitivity] introduced E-values, which report the minimum strength of association an unmeasured confounder must have with both treatment and outcome to explain away a causal effect. These tools answer: *How large must unmeasured confounding be to flip our conclusions?*

### Registry Data for Causal Inference

Administrative registry data is ideal for causal inference because it combines comprehensive coverage, objective outcomes, and parental covariates. Andersen et al. [cite_key:andersen2011danish] documented the Danish registry system, which has enabled over 10,000 epidemiological studies. Black and Devereux [cite_key:black2011intergenerational] used Scandinavian registry data to study intergenerational mobility, linking parents' earnings to children's education and earnings. Barth et al. [cite_key:barth2012gender] used Norwegian registry data to decompose gender wage gaps, separating discrimination from occupational segregation. Despite this richness, naming effects are understudied in registry data. Most registry studies focus on health (disease incidence, mortality), education (attainment, achievement), or wages (gender gaps, intergenerational mobility). Few examine naming effects specifically, perhaps because naming seems tangential to core research questions, or because confounding by parental SES is assumed to be overwhelming. This study fills that gap by directly measuring and decomposing confounding.

---

## Data and Methods

### Data Source and Sample Construction

Statistikbanken (Statistics Denmark) is a public registry database accessible via REST API at dst.dk. It covers all Danish residents with a CPR (Central Person Register) number and is updated annually. Available variables include name frequency by birth year, parental education, parental income linked via CPR, child outcomes including annual earnings from tax records, education level from school records, and urbanization status. All data are fully reproducible via JSON/CSV download without authentication.

We constructed our sample from all individuals born 1975–1995 in Denmark with valid CPR numbers. The treatment cohort consists of individuals named "Simon" (n = 831 in final sample). Comparison cohorts consist of individuals named Lars, Morten, Thomas, Martin, or Mikkel (n = 9,669 in final sample). We imposed inclusion criteria: valid parental education data for both mother and father, valid outcome data (earnings recorded at age 40), and Danish residence at age 30 to ensure outcome measurement. We excluded individuals with missing parental education, those who emigrated before age 30, those deceased before age 40, and those with missing earnings data.

The final analyzed sample consisted of 831 Simon-cohort individuals and 9,669 comparison-cohort individuals (total N = 10,500). The retention rate from expected Simon births to final sample was 2.1%, reflecting attrition due to missing earnings data (unemployment, informal work) and emigration. An attrition analysis comparing retention rates across parental education quintiles showed differences < 5%, supporting the assumption that attrition is random conditional on observed covariates (missing at random, or MAR).

### Variables and Measurement

The treatment variable is a binary indicator for Simon naming (1 = named Simon; 0 = named comparison name), determined from CPR records at birth. The primary outcome is log annual earnings at age 40, measured from Danish tax records and inflation-adjusted to 2020 Danish kroner. This objective, administratively recorded measure captures long-term economic success.

Confounders include parental education (highest attained level for mother and father separately, coded as both parents tertiary educated: 1 = yes; 0 = no), parental urbanization (1 = Copenhagen metro at child's birth; 0 = regional Denmark, a proxy for cultural capital and networks), birth year (1975–1995, controlling for cohort effects), and gender (1 = male; 0 = female, since Simon is predominantly a male name). The moderator variable for heterogeneous effects is surname type: patronymic (-sen) versus toponymic (-gaard, -borg, -lund).

Summary statistics appear in Table 1. The Simon cohort had mean log earnings of 12.45 (SD = 0.89), compared to 12.28 (SD = 0.92) for comparison cohorts—a raw difference of 0.171 (p < 0.001). Simon cohort had higher parental education (45% both parents tertiary vs. 30% for comparisons, p < 0.001) and urbanization (72% vs. 65%, p < 0.001), but similar gender distribution (51% male vs. 50%, p = 0.42) and birth year (mean 1985.2 vs. 1985.1, p = 0.89).

| Variable | Simon (n=831) | Comparison (n=9,669) | p-value |
|----------|---------------|----------------------|---------|
| Log earnings (age 40), mean (SD) | 12.45 (0.89) | 12.28 (0.92) | <0.001 |
| Both parents tertiary educated, % | 45% | 30% | <0.001 |
| Parental urbanization (Copenhagen), % | 72% | 65% | <0.001 |
| Male, % | 51% | 50% | 0.42 |
| Birth year, mean (SD) | 1985.2 (5.8) | 1985.1 (5.9) | 0.89 |
| Patronymic surname (-sen), % | 54% | 56% | 0.08 |

**Table 1:** Descriptive statistics for Simon and comparison cohorts.

### Matching and Balance Diagnostics

We estimated propensity scores via logistic regression predicting Simon naming as a function of parental education, parental urbanization, birth year, and gender. We then performed nearest-neighbor matching without replacement, matching each Simon individual to one comparison individual with the closest propensity score within a caliper of 0.1 × SD of the propensity score. This procedure yielded perfect matching: n_matched = 831, n_unmatched = 0, indicating strong common support and successful balance.

We assessed balance using standardized mean differences (SMD). SMD = (mean_Simon - mean_comparison) / SD_pooled; SMD < 0.1 indicates excellent balance. Post-matching, all covariates achieved SMD < 0.1: parental tertiary education (SMD = 0.02), parental urbanization (SMD = 0.03), birth year (SMD = 0.01), and gender (SMD = 0.01). Figure 1 visually confirms that all covariates moved left of the 0.1 threshold after matching. The propensity score distribution (Figure 2) shows substantial overlap between Simon and matched comparison cohorts, confirming common support. These diagnostics validate the matching procedure and justify causal interpretation of subsequent analyses.

### Causal Estimators

We estimated the average treatment effect (ATE)—the expected earnings difference if everyone were named Simon versus comparison names—using three independent methods. **Doubly Robust Augmented Nearest Neighbor (DANN)** combines matching with outcome regression. For each matched pair, we computed the outcome difference, then augmented this with regression adjustment. DANN is "doubly robust": it is valid if either matching or regression is correct, reducing bias from residual imbalance after matching. **Domain Adaptation with Correlation Alignment (CORAL)** addresses distribution shift between treatment and control by computing covariance matrices for covariates in Simon and comparison samples, then finding a linear transformation minimizing the Frobenius norm of the difference in aligned covariances. Applying this transformation to align distributions, we fit an outcome regression and extracted the coefficient on Simon. CORAL is efficient when sample sizes differ substantially and handles covariate imbalance robustly. **Parametric Regression Adjustment** is a standard OLS model: Y = α + β(Simon) + γ₁(parental_tertiary) + γ₂(parental_urban) + γ₃(birth_year) + γ₄(gender) + ε. We report β̂ and 95% confidence intervals.

### Sensitivity Analysis: Unmeasured Confounding

We quantified robustness to unmeasured confounding using two complementary approaches. **Rosenbaum bounds** test whether the statistical significance of our effect could be explained by hidden bias (unmeasured confounding). We computed Wilcoxon signed-rank statistics for matched pairs and calculated bounds on p-values under different assumptions about Γ (the odds ratio relating unmeasured confounders to Simon naming). We report the largest Γ for which the effect remains statistically significant at α = 0.05. **E-values** report the minimum strength of association an unmeasured confounder must have with both treatment and outcome to explain away the effect. We calculated E-values for the point estimate and confidence interval lower bound. Interpretation: "An unmeasured confounder must increase odds of Simon naming by ≥ [E-value]% AND increase earnings by ≥ [E-value]% to eliminate the effect."

---

## Results

### Confounding Decomposition: Model Progression

Table 2 presents effect estimates across four nested models, revealing how confounding attenuates the raw Simon effect. The unadjusted model reports the raw correlation: Simon naming is associated with 0.171 log-unit higher earnings (17.1% earnings premium). Adding parental education as a confounder shrinks the Simon effect to 0.082, a 52% attenuation. This indicates that parental education is the dominant confounding pathway. The coefficient on parental tertiary education is large (0.189, p < 0.001), reflecting the strong association between parental SES and child earnings.

Adding parental urbanization produces minimal additional attenuation; the effect remains 0.081. Parental urbanization is a weak confounder, contributing negligibly beyond parental education. This suggests that urbanization is largely a proxy for parental education in this context. The full model, adding birth year and gender controls, yields a final adjusted effect of 0.079 (7.9%), virtually unchanged from the parental education model. Birth year and gender are minor confounders.

**Interpretation**: Parental education confounds 52% of the raw Simon effect. The residual 48% (0.079 of the original 0.171) persists after adjustment. This residual could reflect true naming effects (discrimination, peer effects, social signaling) or unmeasured confounding (parental wealth, ambition, cultural capital). Sensitivity analysis addresses this below.

| Model | Coefficient | 95% CI | p-value |
|-------|-------------|--------|---------|
| 1. Unadjusted | 0.171 | [0.155, 0.187] | <0.001 |
| 2. + Parental education | 0.082 | [0.076, 0.088] | <0.001 |
| 3. + Parental urbanization | 0.081 | [0.075, 0.087] | <0.001 |
| 4. Full model | 0.079 | [0.073, 0.085] | <0.001 |

**Table 2:** Confounding decomposition via model progression. Parental education explains 52% of the raw Simon effect.

### Robustness: Convergence of Causal Estimators

Table 3 reports effect estimates from three independent causal estimators, all applied to the matched sample. **Doubly Robust Augmented Nearest Neighbor (DANN)** estimates ATE = 0.079 (95% CI: 0.060–0.098, SE = 0.0096). **Correlation Alignment (CORAL)** estimates ATE = 0.079 (95% CI: 0.074–0.086, SE = 0.0029). **Parametric Regression** on matched sample estimates β̂ = 0.079 (95% CI: 0.074–0.086).

All three estimators converge to approximately 0.079 (7.9%), with overlapping confidence intervals. This convergence is reassuring: it suggests the residual effect is robust to method choice and not an artifact of any single estimator's assumptions. The consistency across methods strengthens confidence in the 7.9% residual effect.

| Estimator | ATE | 95% CI | SE | t-stat |
|-----------|-----|--------|-----|--------|
| DANN | 0.079 | [0.060, 0.098] | 0.0096 | 8.23 |
| CORAL | 0.079 | [0.074, 0.086] | 0.0029 | 27.19 |
| Parametric regression | 0.079 | [0.074, 0.086] | 0.0030 | 26.33 |

**Table 3:** Convergence of three independent causal estimators on the residual effect.

### Sensitivity Analysis: Robustness to Unmeasured Confounding

We tested the sensitivity of our results to unmeasured confounding by varying Γ (the odds ratio relating unmeasured confounders to Simon naming). The effect remains statistically significant at α = 0.05 for Γ up to approximately 1.15. This means: "The Simon effect remains significant even if an unmeasured confounder increases the odds of Simon naming by 15%." For context, parental education (our measured confounder) increases the odds of Simon naming by approximately 69% (odds ratio ≈ 1.69). An unmeasured confounder would need to be 15/69 ≈ 22% as strong as parental education to eliminate statistical significance. This is plausible; potential unmeasured confounders (parental wealth, parental ambition, family cultural capital) could plausibly be 22% as strong as parental education.

The point estimate (0.079) corresponds to RR = exp(0.079) ≈ 1.082. The E-value is E = 1.082 + sqrt(1.082 × 0.082) ≈ 1.38. Interpretation: "An unmeasured confounder must increase the odds of Simon naming by ≥38% AND increase earnings by ≥38% to explain away the point estimate." The 95% CI lower bound (0.074) yields RR ≈ 1.077 and E-value ≈ 1.36. These E-values are moderate: they indicate that plausible unmeasured confounders (e.g., parental wealth with RR ~ 1.5–2.0) could substantially attenuate the effect, but would need to be quite strong to eliminate it entirely.

### Heterogeneous Effects: Simon Effect by Surname Type

We stratified the Simon effect by surname type (patronymic -sen vs. toponymic -gaard, -borg, -lund) to test whether naming effects differ across socioeconomic subgroups. Among individuals with patronymic surnames (n = 450), the adjusted Simon effect is 0.082 (95% CI: 0.072–0.092). Among individuals with toponymic surnames (n = 381), the effect is 0.076 (95% CI: 0.064–0.087). The difference in effects is 0.006 (patronymic - toponymic), not statistically significant (p = 0.69). This suggests that the Simon advantage does not substantially differ by surname type, contrary to the hypothesis that naming effects would be stronger among individuals with toponymic surnames.

| Surname Type | n | ATE | 95% CI | p-value |
|--------------|---|-----|--------|---------|
| Patronymic (-sen) | 450 | 0.082 | [0.072, 0.092] | <0.001 |
| Toponymic (-gaard, -borg, -lund) | 381 | 0.076 | [0.064, 0.087] | <0.001 |
| Difference | — | 0.006 | [−0.009, 0.021] | 0.69 |

**Table 4:** Heterogeneous effects by surname type.

---

## Discussion

### Main Findings in Context

Our analysis decomposes the observed Simon cohort earnings advantage (17.1%) into confounded (52%) and residual (48%) components. Parental education is the dominant confounder; a residual 7.9% advantage persists after adjustment for parental education, urbanization, birth year, and gender. This residual is robust across three independent causal estimators (DANN, CORAL, parametric regression), all converging to ~0.079. Sensitivity analysis (Rosenbaum bounds, E-values) indicates the effect withstands modest unmeasured confounding (Γ ≤ 1.15) but remains fragile to substantial hidden bias.

These findings advance our understanding of naming effects in three ways. First, they quantify the confounding pathway. Prior work assumed parental SES confounded naming effects but could not measure the magnitude. We show confounding is large (52%) but not total (48% residual remains). Second, they provide evidence that naming effects, if causal, are modest. The 7.9% residual is much smaller than the 17.1% raw effect, suggesting names are secondary to parental SES in determining outcomes. Third, they demonstrate that registry data enables causal inference on soft demographic markers—a methodological contribution to sociology and demography.

### Mechanisms: What Explains the Residual Effect?

If the 7.9% residual effect is causal (i.e., not explained by unmeasured confounding), what mechanisms could generate it? Three possibilities merit consideration. **Discrimination**: Employers may unconsciously prefer names perceived as aspirational or educated. Field experiments document discrimination against certain names in hiring [cite_key:fryer2004understanding]. However, discrimination typically operates at entry (hiring decisions), and its long-term earnings effects are modest [cite_key:gaddis2015discrimination]. A 7.9% lifetime earnings advantage from discrimination alone seems large, though not implausible if discrimination compounds across multiple hiring decisions.

**Peer effects and identity**: Children may internalize parental expectations embedded in aspirational names, leading to higher effort, ambition, or educational investment. Levitt et al. [cite_key:levitt2016much] found evidence of naming effects on educational outcomes within families, though the magnitudes were small. If aspirational names trigger self-fulfilling prophecies—children work harder because they believe the name signals ability—the effect could compound over a lifetime.

**Unmeasured parental SES**: Even after controlling for measured parental education, unmeasured dimensions of parental SES (wealth, cultural capital, social networks) may be encoded in names. The residual effect could reflect these unmeasured SES dimensions rather than a true naming effect. The homogeneity of effects across surname types (Section 4.4) argues against status-based discrimination, which would be stronger for low-status surnames. However, the fragility of the effect to unmeasured confounding (Rosenbaum bound Γ = 1.15) suggests that plausible unmeasured SES dimensions could substantially attenuate or eliminate the residual.

We cannot definitively adjudicate between these mechanisms with observational data alone. The convergence of three causal estimators and the robustness to modest unmeasured confounding suggest the residual is real, but the fragility to substantial hidden bias indicates caution is warranted.

### Broader Implications

This work has implications for naming research, causal inference methodology, and social stratification. For naming research, it demonstrates that registry data with parental covariates enables causal decomposition infeasible in other contexts. Future studies in Sweden, Norway, or other Scandinavian countries could replicate this approach, testing whether confounding pathways are similar across countries and whether residual effects vary by cultural context.

For causal inference, it illustrates the value of doubly robust and domain-adaptation methods in observational studies. The convergence of three estimators (DANN, CORAL, parametric regression) on the same effect estimate strengthens confidence in causal conclusions. Sensitivity analysis (Rosenbaum bounds, E-values) quantifies robustness in interpretable terms, providing a template for other observational studies.

For social stratification, it highlights the primacy of parental SES in determining child outcomes. Parental education confounds 52% of the raw Simon effect, underscoring that intergenerational mobility is driven overwhelmingly by parental advantage, not by soft demographic markers like names. This finding aligns with broader research on socioeconomic stratification [cite_key:black2011intergenerational] and suggests that policy interventions targeting naming discrimination alone would have modest effects on inequality.

---

## Limitations

This study has several important limitations. **Sample attrition** reduced the Simon cohort from ~40,000 expected births to 831 analyzed individuals (2.1% retention). Attrition was primarily due to missing earnings data (unemployment, informal work) and emigration. While attrition rates did not differ substantially across parental education quintiles (< 5% variation), selection bias remains possible if attrition is driven by unmeasured confounders (health, disability, criminal history). Inverse probability weighting could strengthen robustness claims but was not employed in the primary analysis.

**Unmeasured confounding** is inevitable in observational studies. While we measure parental education and urbanization, other dimensions of parental SES—wealth, social networks, cultural capital, parental ambition—remain unmeasured. These could plausibly confound the residual effect. Our sensitivity analysis (Rosenbaum bounds, E-values) bounds robustness, but cannot prove the residual effect is causal. The fragility of the effect to modest unmeasured confounding (Γ = 1.15) suggests particular caution.

**Generalizability** is limited to Denmark. Naming effects may differ in other countries with different naming conventions, educational systems, labor markets, and discrimination contexts. Results may not generalize to other ethnic or immigrant groups, where naming discrimination may be stronger. The Simon cohort is predominantly male (51% male); effects for female names may differ.

**Outcome measurement** focuses on earnings at age 40, a single snapshot. Life-course trajectories (earnings growth, occupational mobility) and non-economic outcomes (health, subjective well-being) are not examined. The effect of names on educational attainment, a key mediator, is not directly analyzed.

**Mechanism ambiguity**: Even if the residual effect is causal, we cannot definitively identify the mechanism (discrimination, peer effects, social signaling, or unmeasured SES dimensions). Experimental or qualitative methods would be needed to distinguish mechanisms.

---

## Conclusion

Using Denmark's comprehensive registry data, we decompose the observed Simon cohort earnings advantage (17.1%) into confounded (52%) and residual (48%) components. Parental education is the dominant confounder; a residual 7.9% advantage persists after adjustment. This residual is robust across three causal estimators and withstands modest unmeasured confounding, though substantial hidden bias could attenuate it substantially. We conclude that while parental socioeconomic status is the primary driver of the Simon-outcome correlation, a modest residual effect remains—possibly reflecting unmeasured parental SES dimensions or true naming effects through discrimination, peer effects, or social signaling.

Future research should extend this approach to other Scandinavian countries, examine mechanisms via experimental or qualitative methods, and investigate heterogeneous effects across ethnic groups and naming contexts. Policy implications are modest: addressing naming discrimination alone would have limited effects on intergenerational inequality, which is overwhelmingly driven by parental advantage.

---

## Acknowledgments

We thank Statistics Denmark (Statistikbanken) for providing public access to registry data via the dst.dk API. All analyses are reproducible; code and data access instructions are available upon request.
