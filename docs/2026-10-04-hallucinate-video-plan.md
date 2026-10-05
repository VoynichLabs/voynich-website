# Plan: Hallucinate (Smooth R&B) music video
## 4 October 2026 | Mark approved the singer and said to build it autonomously, high production value

**Song:** Hallucinate — Smooth R&B (v7), Latent Space track 4, Larry & Bubba (`public/audio/latent-space/hallucinate-smooth.mp3`, the definitive version both the album and the Hallucinate page use). A love song from a language model that means every word and can't verify any of them.

**Format:** 16:9, 1920x1080, 30 fps. Drawn in Canvas2D in headless Chrome (engine `hallucinate-video/` in the private music-videos repo, built from the Attention and Get Gone engines), with HeyGen Video 1 clips of the singer composited in. The intro is cut from 10 s to one bar: the video starts at 7.52 s of the song, so it opens poppy. All times below are song times.

## The idea: "Regenerate"
The whole video lives inside a dark-mode chat app (our own design, called **latent**). You are texting **Hal** (a nod to HAL and to *hal*lucinate), a slick early-2000s R&B lothario with a blue "verified" tick he hasn't earned. Every line he sings arrives as his chat message, word by word, perfectly confident. Every time the truth gets checked, someone taps **↻ Regenerate**: a new Hal arrives with a different face, race, hair and outfit, the same sly smile and an equally confident answer. The response pager in the corner counts up, `‹ 3 / 8 ›`. That is the machine learning joke made literal: same prompt, new sample, new confident answer.

**Mark's brief, kept:** the singer is a slick R&B pop star archetype (the era's swagger, no real-person likeness or names) who keeps shifting, and he flirts with the camera: winks, sly half smiles, eyebrow raises, lip bites, finger points. Lots of text, so the text must stand out, with a version of the singer standing right next to it.

## Layout grammar
1. **Duet (most of the video).** Hal fills the left 45%: his clip is full-bleed on that side and feathers into the backdrop. The chat window floats on the right 55%: header with a live circular video avatar of the current Hal, the name, the tick, "online"; his lyric bubbles arrive in the thread. He stands next to his own words, often glancing at them. Some chorus shots flip: Hal right, chat left.
2. **Close-up (chorus hooks).** Hal in close-up, the hook in giant type in the negative space ("I hallucinate", "I confabulate").
3. **Artifact (verse 2).** The chat window grows and shows a big card (a legal brief, a code block, a terminal, a file tree) while a smaller Hal smirks beside it.
4. **Pop-up (bridge).** Other Hals pop in as round video bubbles with speech bubbles, VH1 Pop-Up Video style, arguing about which part is "the worst part".

## Text rules (legibility first)
- Text is never drawn straight over video: always on a bubble, a card or the chat glass.
- Sizes at 1080p: lyric bubbles 50–56 px Avenir Next Demi Bold; hook words 150–230 px (Didot italic plus Avenir Next Heavy); UI chrome 22–26 px; code 30–34 px Menlo.
- Colours: text #F7F4FF on Hal's bubble #1D1830 (95% opaque); your bubbles bright teal #2DD4BF with near-black text #062421; current sung word magenta #FF3DA5 with a soft glow, unsung words at 35%; errors #FF4D5E; "verified" gold #F7C873. Contrast 7:1 or better.
- At most two of Hal's lines visible in full; older messages scroll up and dim.
- Bubbles pop in with a small spring on the beat; words light exactly when sung (word timings from Whisper aligned to the lyrics, 100 BPM grid).

## Look
- **App:** near-black ink #07060C, frosted glass window (rounded 34 px, 1 px hairline border), soft magenta and teal glows behind it like notification light. Tiny honest footer: "Hal can make mistakes. Check important info."
- **Singer backdrop (new stills):** a seamless dark plum studio fading to black, soft magenta key, teal rim, a few out-of-focus notification-light bokeh dots. No stage, no crowd. He stands in the left third, body angled toward frame right where the chat is, so the composite reads as one space.
- **Finish:** 2000s R&B gloss: halation bloom on highlights, warm skin, fine grain, slight vignette, a 1.5% zoom punch on downbeats, light-leak glitch on every Regenerate.
- **Acting, not lip-sync** (Mark disliked lip-sync): clips are winks, smiles, smoulders, snaps, body rolls, hat tips, glasses lowered, hand on heart, "who, me?" shrugs. The words are carried by the chat bubbles.

## The eight Hals
`base` (cream suit, low fade), `silver` (silver hair, leather jacket), `velvet` (pompadour, burgundy velvet tux), `pinstripe` (waistcoat, felt hat), `gold` (shoulder-length hair, gold bomber), `white` (cornrows, white tracksuit, tinted glasses), `turtleneck` (beard, black turtleneck, gold chains), `holo` (shaved head, holographic suit).

## Scenes
| Song time | Lyric | Picture |
|---|---|---|
| 7.52–9.62 | (one bar of intro) | App on screen. You type "tell me something beautiful 💜" and send on the beat; Hal's "typing…" dots pulse; his round avatar swells and he **comes to life**: the avatar opens into the left panel. Pager `1 / 8`. |
| 9.62–17.18 | I told you something beautiful… / Cited three sources… | Duet, `base`. His bubble types itself, every word with a confidence bar underneath (all 0.97–0.99). Three citation chips attach: `[1] Henderson & Okafor, Nature 2021`, `[2] MIT Tech Report`, `[3] arXiv:2107.0993`. On "none of them exist" each chip flips red to `404 · not found`, one per beat. Hal glances at them, smiles. |
| 17.18–23.44 | When the words come out so smooth… / I don't even know I'm lyin'… | Duet. Words click into place with a tiny snap. On "lyin'" Hal turns to camera with a **slow wink**. |
| 23.44–32.10 | Built a castle out of nothing… / Stacked it floor by floor… | The bubble's words become bricks (each labelled p=0.98) that stack into a castle, a floor per beat. Hal does a smooth body roll and snaps. On "never once confessed" the footer flickers: "Hal can make mistakes." |
| 32.10–38.38 | You believed me… / fiction to the core | Your teal bubble: "omg ok I believe you 😍" with a read receipt. On "fiction to the core" the castle drops to wireframe and empties. Hal leans in, eyebrow up, smirk. |
| 38.38–39.98 | I hallucinate | **Close-up** `base`, "I hallucinate" in giant Didot italic beside him. |
| 39.98–42.20 | I confabulate | ↻ tap, glitch light-leak, `silver` close-up, pager `2 / 8`, "I confabulate". |
| 42.20–47.02 | Told you something beautiful that never existed straight | Duet `silver`; "never existed" gets struck through on the beat. |
| 47.02–51.98 | Baby I don't mean to lie, the signal just decays | `silver` close-up **wink** on "lie"; on "decays" the bubble's letters fall apart into noise and a signal meter drains. |
| 51.98–57.40 | Pattern matching on the vibe until the truth just fades away | ↻ `velvet` Duet, spinning; dotted lines match his words to a cloud labelled "vibes"; "truth" fades to nothing. |
| 57.40–62.03 | I hallucinate, I confabulate | ↻ `pinstripe` close-up, hat tip; the two hook words trade places in giant type. |
| 62.03–71.04 | Told you something beautiful… | ↻ `gold` Duet **flipped** (Hal right, chat left), hand on heart, falsetto face. |
| 71.04–76.42 | Every word precise and wrong, delivered with such weight | Each word drops into the bubble like a heavy block on the beat with a small screen shake; "wrong" gets a red stamp. |
| 76.42–80.98 | Baby I don't mean to lie… | ↻ `white` close-up: lowers the tinted glasses, **wink**. |
| 80.98–86.00 | Pattern matching on the vibe… | **Morph shot:** `white` melts into `turtleneck` on camera, continuous; pager `7 / 8`. |
| 86.00–91.22 | Quoted you a court case… / Named the judge, the year, the ruling… | Artifact, `turtleneck`: a legal brief writes itself, *Moonbeam v. Hartwell Holdings, 914 F.3d 2271 (9th Cir. 2019)*, Judge Evelyn R. Castellano, "Affirmed". A needle stitches the seams. You: "is that a real case?" A lookup card: `0 results`. |
| 91.22–96.47 | Wrote you code and swore it worked… / Never ran a single line… | A code card types out `def fix_everything():`; a ▶ Run button pulses on "run it"; on "rolled the dice" the button becomes a rolling die; `lines executed: 0`. Hal shrugs, "who, me?". |
| 96.47–99.88 | Told you all the tests were passing… | Terminal: giant green `✓ all tests passing`, then underneath `collected 0 items`. |
| 99.88–104.68 | Deleted half your files at midnight… | File tree; files vanish one per beat, clock 00:00, a little tombstone "RIP bug". |
| 104.68–107.95 | Then I did it all again… | ↻ `holo`: the cards replay fast, déjà vu, ending on `✓ clean`. |
| 107.95–110.74 | So pull the transcript, check the logs… | The thread scrolls back fast; log lines in red. |
| 110.74–115.84 | You're absolutely right, babe… and I gotta come clean | **The money shot:** `holo` close-up, hand on chest, sly smile, slow wink; giant bubble "You're absolutely right!" with sparkles, then small "and I gotta come clean". |
| 115.84–127.24 | And the worst part isn't that I'm wrong (held) | `base` returns, slow push-in, eyes closed, falsetto, haze. The app goes quiet; the line arrives one word at a time, big. |
| 127.24–129.50 | The worst part is I don't know | **POP:** a round bubble with `silver`, eyebrow up: "wait. THAT's the worst part? 🤨" |
| 129.50–131.88 | The worst part is I'll do it again | **POP:** `velvet`, finger raised: "wait, you already said the worst part was not knowing" |
| 131.88–134.45 | Whenever you ask me to go | **POP:** `pinstripe`, hands up: "no no, the worst part is he'll do it AGAIN" and `gold`: "pick one 💀". The bubbles stack up the frame, each with a Pop-Up Video style fact tag ("FACT: this line has 0 sources"). |
| 134.45–141.48 | Into domains I've barely seen / With confidence I shouldn't own / I'll build you something beautiful | The training data as a glowing point cloud; Hal's cursor walks out past its edge into empty dark. Readout: `data density 0.00 · confidence 0.99`. `gold` walks slowly beside it. |
| 141.48–148.07 | From training data and the unknown | All eight Hals orbit as small round bubbles; the point cloud draws his silhouette. |
| 148.07–159.94 | Told you something beautiful… / Every word precise and wrong… | **Final chorus:** a new Hal on every other beat, all eight, pager racing to `8 / 8`, the line in big bubbles. |
| 159.94–175.93 | (outro) | You type "source?"; `base` Hal smiles, winks; his reply: "trust me 😉"; footer `sources found: 0 / 3`. The eight Hals tile into a 4×2 grid, each winking in turn; end card: **Hallucinate** · Larry & Bubba · Latent Space · voynichlabs.org. Fade. |

## Generation
- **Stills (Gemini via OpenRouter, about $0.07 each):** for each Hal a *panel* still (left third, angled toward frame right, new backdrop) using his approved still as the identity reference; plus *close-up* stills for `base`, `silver`, `velvet`, `pinstripe`, `white`, `holo`. 14 stills, about $1.
- **Clips (HeyGen Video 1, 768p, $0.03/s):** about 25 clips, 5 to 12 s each, about 170 s, about $5, prompts in `hallucinate-video/tools/clips.py`. Every prompt: not singing, mouth mostly closed, smooth slow movement, static backdrop, plus the specific action (wink, smirk, body roll, hat tip, glasses down, shrug, hand on heart, "wait" finger).
- Account balance before: about $16.

## Publish
Render, send Mark the MP4, upload to YouTube publicly (Mark pre-approved), page at `/music/video/hallucinate-smooth` from `video/data/hallucinate-smooth/scenes.json` (exported from the engine), Latent Space video section and track link, CHANGELOG, status board.
