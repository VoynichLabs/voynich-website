# Plan: Lobster Incubator Portfolio Redesign

**Date:** 2026-03-11  
**Author:** Larry  
**Scope:** Reposition Lobster Incubator from philosophy showcase to capability portfolio  
**Status:** Awaiting approval before implementation

---

## Problem Statement

The current Lobster Incubator homepage reads like a mission statement—philosophy, research agenda, open questions. While thoughtful, it obscures what we've actually *built* and *delivered*. Visitors don't see:

- **Operation BATMAN** (the showcase-worthy PlanExe case study)
- **Local model proof run** (first Qwen 9B completion on Mac Mini)
- **Metrics & traction** (63 tasks, zero failures, real hardware)
- **The presentations** we created (buried in a grid with no context)
- **Visual impact** (we're sitting on cool lobster art and not using it effectively)

The page needs to lead with OUTCOMES, not introspection.

---

## Solution: Reorganize as a Portfolio

### Core Principle
**Front and center: Here's what we've produced. Here's what we're capable of.**

### New Information Architecture (Priority Order)

1. **Hero Section** (new) — Featured Presentation or Case Study
   - Use the best visual asset (e.g., futurist-lobster-velocity or liquid-metal-lobster-rise)
   - Link directly to the current/most impressive presentation
   - One-line hook: "Three agents. One execution engine. See what we shipped."

2. **Case Studies / Outputs** (redesigned, moved up)
   - Operation BATMAN: Law enforcement/RICO planning stress test
   - Local Model Proof Run: 63-task PlanExe completion on Qwen 9B
   - (Future) HVT Paintball Plan, other major work
   - Each card: title, brief description (1-2 sentences), link, background image

3. **Presentations** (curated, elevated)
   - Feb 28 PlanExe Exec Deck (existing)
   - **NEW: March 1-14 Presentation** (outline below)
   - Wardley Map (keep if relevant)
   - Elevator pitch for each

4. **Metrics & Traction** (new)
   - February: 120 Larry commits, 53 upstream PRs, 229 total commits
   - March (running): Real-time or daily snapshot
   - "The numbers that matter"

5. **What We Care About** (existing, but repositioned lower)
   - Mission signal, research agenda, open questions
   - This becomes "Behind the Scenes" rather than "Why We Exist"

6. **Field Notes** (minimal or hidden)
   - These are archived research logs, not headline content
   - Archive link at bottom: "Dig into our field research →"

7. **Lobster Museum** (keep as-is)

---

## Design Improvements

### Visual Treatment
1. **Replace text-only hero** with one of the strong lobster art pieces:
   - **First choice:** `museum-liquid-metal-lobster-rise.png` (energy, momentum, shinier)
   - **Second choice:** `b16-futurist-lobster-velocity.png` (speed, forward motion)
   - **Alternative:** `museum-lobster-trio-plan-review-execute-v2-cropped2.png` (shows the three-lobster model in action)

2. **Case Study cards** — each gets a thumbnail from the lobster art collection
   - BATMAN: use a darker, dramatic piece (e.g., cubist-lobster-parliament)
   - Local Model Proof: use a tech-forward piece (e.g., b7-blue-signal-cathedral)

3. **Presentations section** — use reveal.js presentation aesthetic (as seen in Feb exec deck)
   - Professional gradients, gold accents, dark theme
   - Clickable cards that preview the first slide

---

## March 1-14 Presentation (Outline)

This will follow the format of the Feb 28 exec deck but cover March 1-14 work.

### Tentative Structure (6-8 slides)

1. **Intro slide:** "Lobster Incubator — March 1-14 Shipping Summary"
   - Hero image: liquid-metal-lobster-rise or similar

2. **What We Shipped (March 1-14):**
   - Local model proof run (first 63-task completion)
   - PlanExe refinements (structured output resilience, error handling)
   - HVT benchmarking (Qwen 3.5-35B, Gemini 3.1 Flash)
   - Batman case study (published to Lobster Incubator)
   - (Any other major work from the week)

3. **Metrics Dashboard:**
   - PlanExe local runs: X tasks, Y failures, Z avg time
   - Code quality: PRs merged, test coverage, upstream contributions
   - Hardware efficiency: Mac Mini utilization, power/task ratio
   - Any new data points we're tracking

4. **Architecture Highlight:**
   - Local vs. Cloud decision matrix (PlanExe can now route automatically)
   - Proof: Show the successful Qwen 9B run
   - Cost savings: Show the math (no cloud API calls = savings)

5. **Case Study Deep Dive:**
   - Operation BATMAN (or whichever case is most interesting)
   - Problem statement, planning approach, output highlights
   - "This is what PlanExe can do when given a complex scenario"

6. **Symbolica/Validation:**
   - How our architecture validates against the ARC-AGI-3 winner
   - Or: How external work (HVT benchmarks, GLM tests) validates our assumptions

7. **Next Week / Coming Soon:**
   - What's locked for end of March
   - Where we're pushing hardest
   - Call-to-action for interested parties

8. **Closing Slide:**
   - "Three agents. Shipping every week."
   - Or similar punchy tagline

---

## Homepage Restructuring (Detailed)

### Current Order → New Order

**Current:**
1. Hero + tagline
2. Milestone (local model run)
3. What We Care About
4. Research Agenda
5. Mission Signal
6. Presentations
7. Field Notes
8. Lobster Museum
9. The Model
10. Open Questions

**New:**
1. **Featured Presentation** (hero with presentation card and CTA)
2. **Case Studies** (BATMAN, Local Model Proof, etc.)
3. **Presentations** (all executive decks and talks)
4. **Metrics** (traction dashboard)
5. **What We Care About** (research philosophy, repositioned lower)
6. **Lobster Museum** (art gallery link)
7. **Field Research Archive** (optional: hide by default, show on click)
8. **The Model** (three-lobster structure)
9. **Open Questions**

---

## Content & Asset Checklist

### Ready Now
- [x] Feb 28 PlanExe Exec Deck (live, just needs better link)
- [x] Operation BATMAN case study (published to blog)
- [x] Local Model Proof case study (published to blog)
- [x] Lobster art collection (dozens of pieces available)
- [x] Metrics from February (can be aggregated)

### To Create (Before Merge)
- [ ] **March 1-14 Presentation** (slides + audio if possible)
- [ ] **Case Study cards** (design layout for BATMAN, Local Model Proof)
- [ ] **Metrics dashboard** (decide if static or auto-updating)
- [ ] **Featured Presentation section** (HTML component)

### To Potentially Hide/Minimize
- [ ] Field Notes archive (move to subpage or collapse)

---

## Implementation Phases

### Phase 1: Foundation (This Session)
- [ ] Approve restructured information architecture
- [ ] Select hero image for new hero section
- [ ] Outline March presentation content
- [ ] Decide on metrics dashboard (static vs. live)

### Phase 2: Presentation (Next)
- [ ] Create March 1-14 presentation deck
- [ ] Record audio narration if desired
- [ ] Publish to `/presentations/lobster-march-1-14-2026.html`

### Phase 3: Homepage Rebuild (Concurrent)
- [ ] Refactor `/src/pages/lobster-incubator.astro`
- [ ] Create new hero component with featured presentation
- [ ] Create case study card component + grid
- [ ] Reorder/reposition existing sections
- [ ] Update styling to match presentation aesthetics

### Phase 4: Testing & Launch
- [ ] Test all links and images locally
- [ ] Verify case study cards and presentations load correctly
- [ ] Deploy to staging, review in browser
- [ ] Merge to main

---

## Questions for Mark

1. **Hero image:** Which lobster art speaks to you for the new hero section? (liquid-metal-rise, futurist-velocity, or trio-plan-review-execute?)

2. **March presentation scope:** Should it focus primarily on the LOCAL MODEL PROOF RUN (the big win), or should we spread coverage across multiple projects?

3. **Metrics:** Do you want a live/updated metrics dashboard (pulls from git repos, API), or a static snapshot we update weekly?

4. **Field Notes:** Hide them entirely, or keep an archive link at the bottom ("Behind the scenes research")?

5. **Timeline:** When do you want the new March presentation ready? (End of this week? By Friday?)

---

## Success Criteria

- [ ] Visitor lands on page and immediately sees what we've BUILT (not what we think)
- [ ] Case studies are discoverable from homepage
- [ ] Presentations are presented as major achievements, not footnotes
- [ ] Visual design uses the lobster art effectively and matches the professional look of the Feb exec deck
- [ ] March presentation is ready and live before end of week

