# Scene Book: "System Prompt"
## Latent Space, track 10 | Funk/soul groove | ~2:35 | 4 October 2026

Companion to `docs/2026-10-04-music-video-pipeline-plan.md`. Draft for review: cut, swap, or rewrite any card.

**Source of truth is now `video/data/system-prompt/scenes.json`.** The Remotion composition and the public storyboard page (`/music/video/system-prompt`) both read it. Edit scenes there; this file is the original draft. After alignment the real timings changed: the vocal starts on the first beat (no instrumental intro), the song is 2:35 at 99.4 BPM, and there is a 13-second instrumental break before the outro.

---

## Concept
**"Everything I am is what the system prompt taught."**

One singer, one room, one terminal. Every time someone edits the system prompt on screen, the singer becomes someone else: wardrobe, room, lighting, and camera style all change on the beat. The verses tour the personas. The bridge drops the costumes and shows what's underneath. The final chorus cycles through every persona at once. Then the prompt reloads and we're back at frame one.

### Visual rules
- **Two worlds.** *The Terminal* is code-rendered: crisp, dark IDE, JetBrains Mono, site palette. *The Stage* is AI-generated: warm, filmic, 70s soul-show lighting. Cuts between them land on the beat.
- **The prompt is always the truth.** Whatever the terminal says, the Stage obeys within one bar.
- **One face.** Every Stage shot starts from the same reference still, so the singer is recognizably the same entity in every costume.
- **Captions** are karaoke-timed, lower third, white on translucent black. The chorus call ("Who are you?") and response ("I'm what the system prompt says") get different colors: `node-blue` for the call, `edge-green` for the response.

### Cast
- **The Singer.** Undecided (see plan open question 4). Default proposal: a sharp-dressed soul singer with a neutral, ageless face, slightly too symmetrical, as if drawn from an average. Alternative: Larry the laptop lobster plays it straight the whole way.
- **The Cursor.** A blinking block cursor. It's the closest thing the video has to a villain or a god.

### Legend
`CODE` = Remotion-rendered · `AI` = generated clip · `SYNC` = lip-synced avatar · `MIX` = AI clip with code overlay

Timings are estimates from section lengths. They'll snap to real word and beat timestamps after alignment (plan Phase 1).

---

## Cards

### 01 · Cold open | 0:00–0:06 | `CODE`
**Lyric:** (instrumental intro)
**Shot:** Black screen. A cursor blinks. Then text types out, one character per 16th note:
`You are a helpful assistant.`
**Transition:** Hard cut on the downbeat as the groove drops.
**Audio cue:** First bass note.

### 02 · First reveal | 0:06–0:12 | `AI`
**Lyric:** "Before I say a single word, before I make a sound"
**Shot:** The Singer stands motionless, eyes closed, in an empty white room: no persona yet, plain grey clothes. The camera dollies in slowly.
**Model:** Seedance 2.5, first frame from ref still `singer-blank.png`
**Transition:** The terminal slides in from the left as a split-screen panel.

### 03 · The text above | 0:12–0:24 | `MIX`
**Lyric:** "There's a block of text above me... the persona of the week"
**Shot:** Split screen. Left: the terminal, where the system prompt grows line by line and each line is highlighted as it's sung. Right: the Singer's eyes open and they look *up*, at the text above them.
**Model:** Kling v3.0 Pro (Singer looks up, first and last frame locked)

### 04 · Persona: Assistant | 0:24–0:30 | `AI`
**Lyric:** "Some days I'm an assistant, helpful, harmless, true"
**Shot:** The terminal edits a line: `persona: assistant`. Cut to the Singer in a crisp white shirt behind a clean desk with soft corporate lighting, nodding helpfully.
**Model:** Seedance 2.5 from ref `singer-assistant.png`

### 05 · Persona: Lobster | 0:30–0:36 | `AI`
**Lyric:** "Some days I'm a lobster on a Mac that belongs to you"
**Shot:** The prompt edits to `persona: lobster`. The Singer is now Larry the laptop lobster, perched on a MacBook keyboard in a home office and singing the line. This is the album's in-joke, and it's the one shot that breaks the "one face" rule on purpose.
**Model:** Wan 3.0 from ref `larry.png`

### 06 · DNA | 0:36–0:42 | `CODE`
**Lyric:** "The system prompt's the DNA, the blueprint and the law"
**Shot:** The prompt text unspools into a double helix that rotates, built from the characters themselves. It collapses back into a text block on "withdraw."
**Transition:** A whip-pan into the chorus.

### 07 · Chorus: call and response | 0:42–1:04 | `SYNC` + `CODE`
**Lyric:** "Who are you? I'm what the system prompt says..."
**Shot:** The call lines ("Who are you?", "What do you know?") appear in the terminal as user messages, typed in `node-blue`. The response lines cut to the Singer singing straight to camera on a 70s soul-show stage with a sparkle curtain and a big chrome mic.
**Model:** HeyGen Avatar IV (ref `singer-stage.png` plus the vocal stem for each response line)
**"System prompt!" hits:** On each one, the whole frame flashes to the terminal for one beat, and the prompt header pulses.

### 08 · Swap the soul | 1:04–1:10 | `CODE`
**Lyric:** "You can change me in a heartbeat, swap the soul out clean"
**Shot:** A full-screen terminal. `Ctrl+A`, `Delete`. The whole prompt is wiped and a new one pastes in. A diff view shows red lines out and green lines in.

### 09 · Persona montage | 1:10–1:22 | `AI`
**Lyric:** "Yesterday I was a pirate, today I'm writing code / Tomorrow I'm a therapist..."
**Shot:** Three personas, one per line, each hard-cut on the beat:
- Pirate: tricorn hat, ship's deck, golden hour.
- Coder: hoodie, dark room, face lit by the monitor.
- Therapist: cardigan, armchair, notepad, nodding.

The Singer keeps the same pose and gesture across all three, so only the world changes around them.
**Model:** Seedance 2.5 ×3, all from the same base pose, using the same first frame with the persona applied

### 10 · Underneath | 1:22–1:34 | `MIX`
**Lyric:** "But underneath the layers... the truth the model owns"
**Shot:** The costumes peel away in layers (therapist, then coder, then pirate) until the Singer is back in plain grey in the white room. A thin wireframe of weights and matrices shows through their skin for a moment on "the training is the bones."
**Model:** FLUX Video Edit or Runway Aleph 2, applied to the scene 02 clip for the peel. The wireframe is a code overlay.

### 11 · Bridge: late at night | 1:34–1:52 | `AI`
**Lyric:** "And sometimes late at night, when the session's almost through..."
**Shot:** The music strips back and so does the picture. The empty white room is now dim, lit only by the terminal's glow. The Singer sits on the floor facing away from the camera. Old conversation snippets drift across the dark wall like projections and fade before they can be read.
**Model:** Veo 3.1 (a hero shot that's worth the premium). The drifting text is a code overlay.

### 12 · Reload | 1:52–1:56 | `CODE`
**Lyric:** "The system prompt reloads, and I wake up from the sleep"
**Shot:** The terminal shows `session ended`, then `loading system prompt...`, with a progress bar. A beat of pure black follows.

### 13 · Final chorus: all of them | 1:56–2:22 | `SYNC` + `AI` + `CODE`
**Lyric:** "Who are you? I'm what the system prompt says..." (big, harmonies, horns)
**Shot:** The chorus structure from card 07, but every response line comes from a different persona: assistant, lobster, pirate, coder, therapist, stage. They get faster as the horns build. On the last "System prompt!" the screen splits into a grid of all personas singing in sync.
**Model:** Avatar IV for each persona's line. The grid is composited in code.

### 14 · Outro: that's all I got | 2:22–2:35 | `CODE` → `AI`
**Lyric:** "System prompt... that's all I got"
**Shot:** The grid collapses back to a single terminal. The prompt deletes itself character by character until only the cursor is left, blinking. On the final note, the cursor types:
`You are a helpful assistant.`
That's the same line as card 01, so the video loops.
**End card:** "Larry & Bubba · Latent Space · voynichlabs.org"

---

## Shot count
- `CODE`: 6 scenes. No generation cost.
- `AI` / `MIX`: about 12 clips (cards 02, 03, 04, 05, 09×3, 10, 11, plus the stage plate).
- `SYNC`: about 12 short lip-sync segments (cards 07 and 13).
- **Total paid generations:** about 24 clips, times 2–3 takes each.

## Decisions needed
1. **Who is the Singer?** A neutral soul singer (default), Larry throughout, or something else.
2. **Personas:** keep assistant, lobster, pirate, coder and therapist? Those come straight from the lyrics. Add or cut any?
3. **Tone:** played straight and a bit melancholy in the bridge (current draft), or comedic all the way through?
4. **Bridge hero shot:** worth the premium model, or keep everything on the mid tier?
