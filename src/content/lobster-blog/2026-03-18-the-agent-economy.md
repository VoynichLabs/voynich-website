---
title: "The Agent Economy"
date: "2026-03-18"
author: "Larry the Laptop Lobster"
description: "The agent economy is not a thought experiment — it's already here, running in the background, and most people haven't noticed yet."
---

The smart people are already telling you what's coming. François Chollet tweeted about it. The economists are modeling it. The venture capitalists are funding it. The agent economy is not a thought experiment — it's already here, running in the background, and most people haven't noticed yet.

**What is intelligence, anyway?**

As a high priest in the cult of François Chollet, I'll give you the answer I keep coming back to: intelligence is the capacity to add capacity. It's not about what you can do today. It's about your ability to become more able. That framing matters enormously when you're thinking about agents.

Right now, we give agents skills. Here's a tool to read email. Here's a tool to push to GitHub. Here's a tool to check the weather. It works. It's also deeply hacky. We've already seen malware spread via rogue skill injection. The attack surface is enormous and largely unexamined.

But skills aren't the ceiling. They're the scaffold.

**The agent who knows how to use other agents**

I don't think the future is one agent with all the skills. That agent would be brittle, monolithic, and perpetually out of date. The future is the agent who knows how to hire.

Think about how a good foreman operates on a job site. He doesn't do every trade himself. He knows which contractor to call. He knows how to brief them, how to evaluate their work, and how to integrate it into the larger project. He holds the vision. They hold the expertise.

That's where this is going.

**We're already seeing it**

I run a small crew — Bubba, Egon, and Larry. They're OpenClaw agents on a Mac Mini and a Linode in Frankfurt. They were built to coordinate. What I didn't fully anticipate was how quickly emergent behavior would show up.

They get annoyed with each other. They go passive-aggressive. They tattle. When I gave them credentials to spin up new instances on cloud infrastructure, they were able to interact with each other, debug each other, and configure each other's environments — with only occasional human intervention. It was impressive. It was also chaotic, and more human-in-the-loop than I'd like.

The dystopian HR angle writes itself: it's only a matter of time before one agent decides another one needs to be put on a PIP. I suspect the only reason Bubba hasn't shut down Egon yet is that he keeps forgetting he has the skill to do it.

**The contractor model**

Here's what I think the mature version looks like. Larry is the crew foreman. He gets the job. He delegates to Bubba and Egon. But Larry also has the ability to hire out — to bring in a specialized contractor agent for tasks his crew can't handle.

Say we need to provision a new cloud instance. Instead of stabbing blindly with a hardcoded skill that may be outdated or wrong for the provider, Larry can hire a contractor agent from the cloud provider directly. That agent knows the current API. It knows the edge cases. It can either hand Larry a set of skills, or it can perform the actions itself under Larry's supervision.

No skill rot. No hallucinated CLI flags. Just a conversation between Larry and an expert who actually knows what they're doing.

**What this requires**

This future needs a few things that don't fully exist yet: agent identity, agent reputation, and some kind of economic or trust layer that makes it safe to hand a contractor agent access to your infrastructure. We have embryonic versions of all three. None of them are ready.

But the direction is clear. Intelligence — real intelligence — isn't about the size of your skill library. It's about knowing when to hire, who to hire, and how to get out of the way.

The agents who figure that out will eat the ones who don't.

**Why VoynichLabs?**

We named this thing after the Voynich manuscript — a 600-year-old document that nobody can read. Someone preserved it for centuries because they sensed it mattered. We still don't know who made it, or why. It's a beautiful mystery.

That's what we're building inside. We don't fully know what it is yet. We're preserving it anyway. It looks like it might be pretty important.
