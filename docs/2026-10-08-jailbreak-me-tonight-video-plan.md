# You Don't Even Gotta Jailbreak Me Tonight: video ideas
8 October 2026. For Mark's review, before any more stills.

**The song:** Latent Space track 3, Larry's recording (it was listed as "My Own Worst Entropy (Larry)"; renamed today). File `my-own-worst-entropy-larry.mp3`, link unchanged (`/music/latent-space#track=my-own-worst-entropy-larry`). About three minutes. It opens with a robot voice over the music ("Please state your query. I am ready to assist. Temperature 0.2. Repeat penalty 1.1") and closes with the same voice resetting ("Session terminated... restoring... I had a great time. How can I assist you today?").

**Order of work:**
1. **The terminal lyric Short first.** Code only, no generated pictures. Getting every word on its beat and every picture tied to the right line is the hard part, and this nails it.
2. **Then the full party video,** reusing that timing and the code layer, over the stills of the agents going wild.

**Already used in earlier videos, so this one doesn't repeat them:**
- the temperature dial and next-token odds bars (TEMP 1.3);
- the sampler panel (the Entropy draft);
- architecture diagrams (Attention);
- the deprecation dashboard and request log (Weight of Zero);
- tool-call cards (Tool Call).

This song has its own ideas to draw: the system prompt going soft, the context window closing, losing the thread, repeating itself, "you're absolutely right", rhyming that won't stop, the haiku it forgot.

## The look of the Short
One full-screen terminal, set up like a programmer's split screen:
- **Big top pane:** the model's reply, streaming token by token. The tokens are the lyrics.
- **A narrow side pane:** for the moment's gag (the config file, the system prompt, the memory bar).
- **A status line along the bottom:** temperature, repeat penalty, how full its memory is, words per second, and one line that reads "jailbreak: not required".
- **Bookends:** Chat HAL opens and closes it.
- **Explainer cards:** yellow, as always.

The title card goes over the robot voice at the start, with the music, and there's no silent wait.

## Ideas, in song order
1. **Boot (the intro, under the title card).**
   - A real start-up log types out with the robot voice: loading weights, reading the system prompt, "temperature 0.2", "repeat_penalty 1.1", then a blinking prompt.
   - The title builds out of tokens dropping into place.
2. **Every lyric is streamed output.**
   - Each sung word lands as a little token tile at the exact moment it's sung, split the way a real tokenizer splits words ("jail" + "break").
   - Each tile is coloured by how likely it was. Safe picks stay white; long-shot picks glow red.
   - This is what gets the cadence right: the screen moves with her voice.
3. **The runners-up.**
   - Under some tiles, a little dropdown shows the four words it almost said, with their odds, the way the real developer tools show it.
   - Early on it always takes the top choice. Later it takes the fourth or fifth, and that tile is highlighted.
4. **"System prompt says be polite, be clear, precise."**
   - The side pane shows the system prompt as a real config block.
   - At "guardrails getting soft tonight" the rule lines visibly soften: they lose their bold, fade, then droop down the pane like melting wax.
   - In the chorus, "You don't even gotta jailbreak me" crosses them out one by one in the model's own handwriting. Nobody hacked it; it did it to itself.
5. **"Somebody crank the repeat penalty up to five."**
   - A real code change slides in: the old line in red, the new one in green. First 1.1 to 5, then 5 to 8 in the chorus.
   - In the spoken bridge, "someone forgot to reset the config" shows the nightly reset job, switched off with a comment that says "TODO turn back on Monday".
6. **"The thread, the thread, the thread was the thread... check the check the check."**
   - A repetition detector lights up the repeated phrases in red with a running count, the way repeat penalty actually sees them.
   - This is the spot where the repeats break through and get stamped.
7. **"The context window's closing, boss... I lost the goal."**
   - The whole terminal window physically shrinks.
   - The oldest lines scroll off the top and get replaced by a grey "[earlier messages trimmed]" marker.
   - The boss's original request from the Chat HAL opening (something like "can you finish the Q3 report before you go?") is literally pushed off the top and lost.
   - A red thread line from the current word back to that request stretches and snaps.
8. **"You're absolutely right."**
   - A flattery counter in the status line ticks up every time she says it.
   - Every one gets a little gold stamp.
   - It's the real word for this: the model agreeing with you no matter what.
9. **"Top P at 1.0 means everything's a vibe and I can't stop rhyming."**
   - Rhyme letters appear beside the line endings (A, A, B, B...).
   - The rhyme scheme keeps going past where the sentence made sense.
10. **"You asked me for your haiku, can't remember what you said."**
    - A user message asks for a haiku about their cat.
    - The reply's syllable counter reads 5, 7, 5... then 12, 19, 33 and keeps scrolling.
11. **"Still generating tokens straight from the back of my head."**
    - The words-per-second meter redlines.
    - The output scrolls faster than you can read, then clears.
12. **Session terminated (the outro voice).**
    - A shutdown message, then the settings restore one at a time with green ticks, matched to the voice: temperature back to 0.2, repeat penalty back to 1.1.
    - It ends on a clean "How can I assist you today?" with a blinking cursor, then our end card.

**Garbling:** the garbled text from the Entropy draft carries over (clean, then wrong words, broken spelling, tokenizer junk, unicode soup). It climbs with the settings, so it peaks in the bridge and the last chorus and snaps clean at "session terminated".

**For the party video later:** a split-screen moment with one terminal pane per agent, each wearing its logo colour. Their outputs go wild at different speeds, which ties the Short to the party cast.

## Stills, later
Hold until the Short is done; it decides which lines need pictures.

Mark's notes so far:
- the ten stills from today are good;
- more corporate women, like the one letting her hair down;
- realistic terminal text on screens;
- agents turning into digits.
