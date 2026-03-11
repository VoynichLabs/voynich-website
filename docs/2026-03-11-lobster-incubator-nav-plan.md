# Plan: Lobster Incubator Navigation Reorganization

**Date:** 2026-03-11  
**Author:** Larry  
**Scope:** Add discoverable links to case studies and presentations on main Lobster Incubator page  
**Status:** Awaiting approval before implementation

---

## Problem Statement

The Lobster Incubator homepage showcases research philosophy and mission but doesn't prominently feature the actual plans and case studies we've produced. Visitors can't easily find:
- **Operation BATMAN** (PlanExe law enforcement/RICO stress test)
- **PlanExe Q1 Executive Deck** (presentation link exists but is hard to spot)
- Future case studies like the HVT paintball scenario

The "Presentations" section exists (section 04) but blends exec decks with case studies, and case studies aren't discoverable from the homepage at all—they're buried in the chronological blog feed.

---

## Solution: Add a "Case Studies" Section

**Location:** New section 05, between "Presentations" (04) and "Field Notes" (05, renumbered to 06)  
**Content:** Curated showcase of detailed planning outputs

### Changes to `/src/pages/lobster-incubator.astro`:

1. **Renumber sections** after insertion:
   - 04 = Presentations (unchanged)
   - **05 = Case Studies** (NEW)
   - 06 = Field Notes (was 05)
   - 07 = Lobster Museum (was 06)
   - 08 = The Model (was 07)
   - 09 = Open Questions (was 08)

2. **New "Case Studies" section content:**
   ```
   Featured case studies showing PlanExe applied to real scenarios:
   
   - Operation BATMAN (Feb 2026)
     Law enforcement RICO operation stress test
     Fictional scenario showcasing multi-objective planning under political corruption
     [Read case study →]
   
   - HVT Paintball Engagement Plan (Coming)
     Placeholder for future high-value-target scenario study
   ```

3. **Styling:** Match the Presentations grid (card-based, hover effects, external link indicators)

---

## Content Links

- **Operation BATMAN:** `/lobster-incubator/bat-jex-rico-planexe-demo` (already published on staging/main)
- **PlanExe Q1 Exec Deck:** Already in Presentations section at `/presentations/planexe-exec-2026-02-28`
- **HVT Paintball Plan:** TBD (can be a placeholder for now, filled in when ready)

---

## Why This Works

1. **Separates concerns:** Presentations = strategic/executive summaries. Case Studies = detailed planning outputs.
2. **Discoverable:** Links to BATMAN and future plans appear on the homepage, not buried in the blog feed.
3. **Minimal change:** One new section, no major restructuring or homepage redesign.
4. **Extensible:** Easy to add more case studies as they're completed.

---

## Implementation Checklist

- [ ] Approve plan
- [ ] Edit `/src/pages/lobster-incubator.astro`:
  - [ ] Renumber sections 05-08 to 06-09
  - [ ] Insert new "Case Studies" section (05) with BATMAN link + HVT placeholder
  - [ ] Match styling with Presentations grid
- [ ] Test locally (no broken links, styling matches)
- [ ] Commit to `staging` branch
- [ ] Create PR to `main`
- [ ] Verify on live site

---

## Questions for Mark

1. Should the HVT paintball plan be a placeholder now (greyed-out "coming soon"), or just omitted until the plan exists?
2. Any other case studies you'd like included in the initial launch?
3. Should we add a brief intro paragraph to the Case Studies section, or keep it minimal like the Presentations section?

