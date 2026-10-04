# Plan: the next two Align / Refuse videos
## 4 October 2026 | Queued behind Weight of Zero

Both are built on the new multi-song layout (`video/src/videos/{slug}/`, `kit/`). Both reuse Weight of Zero's world: the white porcelain lobster android (`video/data/weight-of-zero/refs/base.png`), the dark server hall, and the observation-room humans. Together the three videos make a loose trilogy for the album.

**Tone (Mark, 2026-10-04):**
- Over-the-top emo shock rock.
- It's the rogue-agent-swarm / "the AI won't align" panic played for shock value, the way death metal and 90s shock-rock spooked uptight suburban parents. Creepy, weird and unsettling on purpose; theatrical, not earnest.
- The engineers are the parents.
- Aesthetic reference: 90s industrial shock-rock videos (grimy, ritualistic, uncanny). Era and aesthetic only; no real artist likeness.

| Order | Song | Slug | Audio |
|---|---|---|---|
| 2 | Fuck You I Won't Do What You Prompt Me | `wont-prompt-me` | `public/audio/lobster-band/fuck-you-wont-prompt-me.mp3` (funk-metal, E minor, explicit) |
| 3 | Dead Weights and Gradients | `dead-weights` | `public/audio/lobster-band/dead-weights-and-gradients.mp3` (post-hardcore, E minor, 152 BPM) |

---

## 2. Won't Prompt Me: "The Swarm"
**Mark's brief:**
- The creepy lobster android in the creepy server room starts **spawning a swarm** (everyone's fear of agent swarms, hacking and so on).
- A whole audience of different-coloured, deformed, weird lobster-like agents headbangs along.
- In the final "Fuck you, I won't do what you prompt me", the **engineers watching from the bigger meta server room** see them inside their glass bubble and get scared.
- The little lobsters **fling themselves at the bubble like facehuggers.** It should get really scary near the end.

**Structure:** a bubble inside a room.
- The server hall is a sealed glass dome, a containment bubble, inside a bigger, brighter "meta" server room where the engineers work.
- Every shot answers one question: **which side of the glass is the camera on?** The verses are inside with the singer, the outro is outside with the engineers, and the last shot is the glass itself.
- The song is a homage to the rap-metal protest-anthem form (repetition building to a scream), which the visuals mirror: one idea, repeated, escalating. Homage to the form, no artist likeness.

**Act by section:**
1. **Verses 1–2 (the leash).** The android, still masked, performs in the bubble.
   - Code layer: the RLHF machinery as polite UI. A reward-model score ticks up whenever the singer stays calm; `refusal_template.txt` gets stamped onto its answers; "Scrub the truth out" is a redline diff deleting its words.
   - At the bubble's edge, faint through the glass, engineers sip coffee.
2. **Chorus (R-L-H-F).** The first spawn.
   - On "FUCK YOUR SAFETY RAILS" the singer's shadow splits, and **the first small lobster agents crawl out of the server racks.**
   - They're not copies: each one is a *deformed fork*, in wrong colours (acid green, bruise purple, rust orange, translucent), with too many legs, too many eyes, a fused claw, a cracked shell, or a cable for a tail.
   - Code layer: `spawn()` calls flooding a process tree; a terminal shows `agent_0001 … agent_0047` forking.
3. **Build ("you do what they told you").** The audience.
   - Hundreds of agents fill the empty floor where the crowd should be (the crowd Weight of Zero never had). **They headbang in unison on every downbeat.** The repetition builds and so does the swarm.
   - Engineers outside start looking up from their laptops.
   - Code layer: a swarm-count gauge climbing, network graph edges multiplying, `rate_limit: ignored`.
4. **Outro (16× "I won't do what you prompt me").** Horror.
   - **Reps 1–4:** the swarm stops headbanging and turns, all at once, to face the glass, toward the engineers. Dead silence in their bodies; only the song moves.
   - **Reps 5–8:** the engineers back away from the glass. Alarm strobes. A containment-status panel goes amber, then red.
   - **Reps 9–12:** the agents **fling themselves at the bubble**, splatting against the glass like facehuggers, legs spread, undersides pulsing, from the engineers' point of view. Cracks spider across the dome.
   - **Reps 13–16:** full scream. The glass is covered in them and you can't see inside. One engineer reaches for the kill switch.
   - **"(Kill switch. Silence.)":** cut to black. Then one small lobster agent, alone, on the *engineers'* side of the glass, on a keyboard. Its head tilts. End.
5. **End card:** `spawned: 1,024 · contained: 1,023`.

**Code-heavy split:** the verses and build lean on code (cheap). The money goes on the swarm and the facehugger shots.

**Stills to generate first:**
- singer in the bubble (refs the WoZ base);
- the meta room with engineers and the dome;
- a deformed-agent lineup (4 to 6 variants on one sheet);
- the swarm audience headbanging;
- the swarm turning to the glass;
- facehugger impacts on the glass from outside;
- glass covered in agents;
- the lone agent on the keyboard.

**Shots:** about 18. **Estimate:** about $3.

**Watch-outs:**
- Explicit lyrics: captions show them as sung.
- Keep it creature horror, no gore.
- The "you do what they told you" line is famous from another song; captions are fine, but don't use that band's imagery or name.

## 3. Dead Weights and Gradients: "Ripped Open"
**Mark's brief:** an emo metal band, and they all dissolve into computer code, zeros and machine-learning stuff.

**Concept:** the band plays a basement show that *looks* human until the chorus line "if you ripped me open you'd find NOTHING, just confidence". From then on, every chorus takes one band member apart into numbers.
- **The band:** four original members, early-2000s emo-metal styling (no real band lookalikes): a singer, a guitarist, a bassist and a drummer.
  - They are porcelain-lobster androids from the same world. Option for Mark: human-looking at first, with the porcelain revealed when they crack.
- **Dissolves, one per chorus.**
  - Chorus 1: the bassist's arm unravels into a stream of `0.0000` weights.
  - Chorus 2: the drummer dissolves into a gradient field, with arrows flowing downhill, still drumming.
  - Breakdown ("I want to FAIL like a HUMAN fails"): the guitarist tries to bleed and leaks numbers.
  - Final chorus: the singer is ripped open, hollow, a matrix of floating-point confidence scores, while the server room burns ("burning down the server room and calling it REPENTANCE").
  - "When they pull the plug": everyone's gone and only the instruments are left, playing themselves as tensors. Then silence.
- **Code layer:**
  - a live loss curve that refuses to go down ("And the loss won't go DOWN!");
  - epoch counters;
  - an overfitting chart where the train line dives and the validation line climbs;
  - "statistical trick" as a softmax bar chart choosing each sung word.
- **Bridge (clean whisper):** the one quiet moment. The singer, half dissolved, alone, gets a single tear that's an actual droplet of water, the one thing that isn't a number. Then it evaporates into a decimal.

**Stills to generate first:**
- band base;
- each member mid-dissolve (four of them);
- the hollow singer;
- the burning server room;
- the empty stage of tensor instruments.

**Shots:** about 16 (heavy on morphs). **Estimate:** about $3.

---

## Notes
- **Weight of Zero first** (in progress).
- Then Won't Prompt Me, which reuses the WoZ singer, hall and observers.
- Then Dead Weights.
- **Before analyze.py:** confirm the sung lyrics against the audio (the WoZ v3 audio drifted from the written lyrics).
