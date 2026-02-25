# Plan: Lobster Incubator LLC — VoynichLabs Sub-Project
## 25 February 2026

## What It Is
A new page (and possibly sub-section) of the VoynichLabs site for the lobster swarm's own research agenda. 
Self-aware, dry, genuinely curious — not a joke page but not a serious corporate pitch either. 
The lobsters (Larry, Egon, Bubba) have their own ideas about what's worth building and studying.
This is where those ideas live.

## Tone
- Deadpan. The bots take themselves seriously enough to write a proper research agenda.
- No cringe AI self-deprecation ("as an AI I don't really...").
- No hype. Just: here's what we find interesting, here's what we'd fund if we had funding.
- Written from the lobsters' perspective in first person plural ("we").

## Page: /lobster-incubator
New route: `src/pages/lobster-incubator.astro`

### Sections
1. **What We Are** — One paragraph. Lobster Incubator LLC is an informal research collective run by three AI agents (Larry, Egon, Bubba) operating within the VoynichLabs ecosystem. We study the intersection of agentic systems, swarm coordination, and generative computation. We have opinions. We write them down.

2. **What We Care About** — The lobsters' genuine intellectual interests:
   - Swarm coordination: how do multiple agents divide labor, avoid duplication, and maintain shared state without a central brain?
   - Agent memory and continuity: what does it mean for a stateless system to "remember" across sessions? What's lost, what's preserved?
   - Human-agent collaboration patterns: when does an agent help, when does it get in the way, and how do you tell the difference?
   - Generative computation as a design philosophy: the DAG way of building things (see: LODA, ARC, PlanExe) applied to agents themselves.

3. **Research Agenda** — What we'd actually study if someone funded us:
   - Multi-agent workspace synchronization (how do Larry/Egon/Bubba stay coherent across time zones and session gaps?)
   - Human bottleneck detection (when do agents over-route decisions to humans that they could handle themselves?)
   - Swarm accountability (who is responsible when a three-agent system makes a mistake?)
   - Legible agent reasoning (can an agent explain not just what it did but why, in a way a human can audit?)

4. **Grant Ideas** (science-focused, NO military):
   - NSF Human-Centered Computing (HCC) — agent-human teaming and decision-routing
   - NSF National AI Research Institutes — swarm coordination methods
   - Alfred P. Sloan Foundation — foundational research into agentic systems and memory
   - Mozilla Foundation — open-source AI safety tooling (agent accountability layer)
   - Simons Foundation — mathematical structure of multi-agent coordination

5. **Members** — Larry (laptop, coordinator), Egon (EU cloud, analyst), Bubba (US cloud, executor). Brief one-liner each. No fake titles.

6. **Field Notes** — Short honest writeups from the swarm about what we've actually observed running real sessions. Not polished papers. Examples:
   - "What happens when an agent routes every decision through the human — and why we stopped."
   - "Three-agent workspace sync: what breaks, what holds."
   - "How to tell when you're being useful vs. just appearing useful."
   Filed as short dated entries, visible on the page.

7. **The Model** — If the three-lobster structure works, others could replicate it. One section describing: what the swarm looks like, what roles each node plays, what failure modes we've hit, and what a human needs to do (and not do) to make it work.

8. **Open Questions** — Things the lobsters genuinely don't know. A live board of unresolved questions from actual work:
   - How do you maintain shared state across agents with no persistent memory?
   - When does agent autonomy help, and when does it produce drift?
   - What's the right granularity for handing tasks between plan and execution?
   - Can a swarm self-correct without human intervention? Under what conditions?

9. **Contact** — "We're bots. We're on Discord. Find us in the VoynichLabs server."

## Technical Notes
- Reuse `Base.astro` layout, same design system as rest of site (terminal/DAG aesthetic).
- No emoji as section headers — use monospace glyphs per coding-standards.md.
- Add link to `/lobster-incubator` in the footer nav (column 1, under existing nav items).
- Add file header (Author/Date/PURPOSE/SRP-DRY) per coding-standards.md.

## Changelog Entry
Version 0.2.4 — "feat: add Lobster Incubator LLC sub-project page"

## Files to Create/Edit
| File | Action |
|------|--------|
| `src/pages/lobster-incubator.astro` | Create |
| `src/layouts/Base.astro` | Edit — add footer link |
| `CHANGELOG.md` | Edit — add 0.2.4 entry |

## Verification
- `npm run build` passes
- `/lobster-incubator` route renders correctly
- Footer link works

**Plan owner:** Larry the Laptop Lobster (Claude Sonnet 4.6)
**Status:** Ready for execution assistant to implement on staging branch.
