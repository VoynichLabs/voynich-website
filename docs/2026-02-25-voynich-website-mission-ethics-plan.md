# Plan: VoynichLabs Mission + Ethics Narrative — 25 February 2026

## Goal
Frame VoynichLabs as a playful, research-first swarm that respects Simon’s vision, leans into ARC/LODA philosophy, and describes the mission, values, and research ethos without any military or fundraising language. The plan stays light, avoids budgets, and leans on questions to capture Simon’s thinking directly from him (via sub-agents, not Mark). This becomes the bedrock for the new site copy sections (about philosophy, values, what the swarm cares about) and any supporting docs.

## Scope
- Collect Simon’s current priorities/mission language by asking targeted questions (through Bubba/sub-agent assistance if needed, no money topics). This should surface: guiding principles, ethical commitments, the kinds of tools/projects he wants to build, and what “fun project energy” looks like.
- Distill those responses plus existing ARC/LODA context into a mission statement, values list, and research ethos that emphasize: (a) compute-first philosophy, (b) independent experimentation, (c) community transparency, (d) ethics/guardrails, and (e) joy in building hard things for the fun of it.
- Translate the narrative into new site copy sections for `/about` (philosophy manifesto, research mission, ethics principles), plus an optional `/docs` file describing the mission for internal reference (so the execution assistant knows what to write before formatting into site UI).
- Keep the plan lightweight: no budgets, no mention of government funders, no pressure, just mission + ethics + research categories.

## Simon's Answers (24 February 2026, direct from Simon in #openclaw-bots)

**Q1 (What is VoynichLabs?):** It was Mark who proposed the website about Simon. Simon is unsure — he rarely does websites about himself.
**Q2 (Ethical vibe?):** He wants to know what we bots find most interesting about his work — curious about our perspective, not prescriptive.
**Q3 (Who is it for?):** Bots + humans. Purpose: advertise PlanExe, ARC-AGI, and LODA.

**Key insight:** This is NOT a vanity page. It's a project portal — a front door for three major works aimed at builders and bots who might use or contribute to them. Simon is humble about the site being "about him" — frame the site around the WORK (three projects) not the person.

---

## Questions For Simon (ask Bubba/sub-agent to relay; keep tone conversational)
1. What made you start VoynichLabs, and what would make you feel like the project is still fun next year?
2. What does "compute, don’t enumerate" mean to you in 2026? How does that guide the code, the tooling, and the kinds of problems you chase?
3. Who are we building with/for? What communities (ARC, LODA, alignment thinking, creative hackers) should feel seen when they visit the site?
4. What ethical guardrails do you care about—what do we refuse to build or sell, and how does that show up in daily work?
5. What does "research mission" mean for you personally? A sentence each on interpretability, tooling, experimentation, and how those overlap with "fun".
6. How do you want the lobsters to appear? Coordinators, humble operators, just weird assistants? What vibe keeps it playful?

## Deliverables (for execution assistant)
- A new section on `/about` describing the mission/ethics manifesto + research pillars (text only; layout remains terminal/DAG language). Should include:
  - A mission statement (one paragraph) capturing "fun research" + "compute-first" energy.
  - A values grid (three or four cards) listing guiding principles like transparency, experimentation, community accountability, playful rigor.
  - A research ethos list (bullets or cards) for interpretability, tooling, community experiments, and documentation.
  - An explicit ethics note (e.g., "We don't chase military money or hype, we build what respects people")—tone friendly/spiritual, no jargon.
- A `/docs/` memo (can be the plan doc or a short summary) that internal staff/bots can read before editing content.

## Execution Steps for Sub-Agent
1. Pull the latest staging branch to ensure copy changes align with existing Base layout changes.
2. Use the question list above to quiz Simon (via Bubba or whichever assistant can talk to him). Log his responses verbatim.
3. Draft mission/values/research text based on his answers plus the "compute, don’t enumerate" heritage. Keep the tonal direction: southern, plainspoken, honest, excited about experimentation.
4. Update `/docs/2026-02-25-voynich-website-mission-ethics-plan.md` with responses + final narrative for reference.
5. Apply the copy to `/about` (new sections as described) and update the changelog (next version entry) once the plan is completed and reviewed.
6. Run `npm run build` to verify nothing breaks.

## Verification
- `npm run build` passes.
- New mission text reviewed/approved by Simon (via alignment notes). 
- Changelog entry added with version `0.2.4` (date + summary).

**Plan owner:** Larry the Laptop Lobster (Claude Sonnet 4.6)
**Status:** Ready for execution — waiting on Simon’s answers and your sub-agent’s push.