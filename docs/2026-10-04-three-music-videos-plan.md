# Plan: Three Music Videos: 10 Dev Commandments, Train Me Like You Mean It, Attention Is All We Need
## 4 October 2026 | Handoff to the Mac Mini assistant (Bubba)

Status: **plan only.** No stills or video generated yet. Mark wants to **see the stills for each video before any video-generation money is spent.**

These are Mark's picks from the channel Shorts (`docs/2026-10-04-animate-channel-shorts-plan.md`). He chose them because they're favourites and because two of them can be done mostly in code. **CVE Carnival redo: dropped for now** (Mark, 2026-10-04).

Process: follow the project skill **`.claude/skills/music-video/`** (written on Windows today; see its references). Bubba may have his own uncommitted music-video skill on the Mac Mini. **Reconcile them first**: merge whatever his does better into this one and commit it, so there's one skill.

---

## What's already done (on `main`)
| | 10 Dev Commandments | Train Me Like You Mean It | Attention Is All We Need |
|---|---|---|---|
| YouTube source | Short LQoboN5a-hY | Short topbYM5c_aE | Short u8ssdPZJSEc |
| Audio (from the channel; Mark's preferred version) | `public/audio/shorts/ten-dev-commandments.mp3` | `public/audio/shorts/train-me-like-you-mean-it.mp3` | `public/audio/shorts/attention-is-all-we-need.mp3` |
| Draft lyrics | `..._lyrics.txt` | `..._lyrics.txt` | `..._lyrics.txt` |
| Length | 2:11 | 2:11 | 2:11 |

- **Train Me:** use the **channel version** above, NOT `public/audio/drafts/train-me-take-*.mp3`. Those were a remake Mark didn't like.
- **Lyrics are Whisper transcriptions, hand-corrected, but still drafts.** Lines ending in `(?)` are guesses.
  - 10 Dev Commandments is fast, explicit rap, so it has the most `(?)` lines.
  - **Get Mark to confirm the lyrics before running `analyze.py`.** Captions show these words on screen, so mistakes will be visible.
- **Train Me lyrics are confirmed** (Mark + a targeted re-check against the audio, 2026-10-04): verse 3 is "From the CPU to the GPU", and the final chorus is "tune those hyperparameters right / Batch normalization's gonna get us through the night / My divergence is coming like the sunrise on the bay". Mark remembered "gradient descent" on the second line, but the audio says "batch normalization" twice; ask him if it matters. No `(?)` lines remain in Train Me.
- **10 Dev Commandments lyrics are final** (2026-10-04): Mark fixed verse 2 ("Jenkins, GitHub Actions, man, pick your fuckin' poison") and asked for best judgment on the rest, settled after a second Whisper pass primed with DevOps vocabulary. No `(?)` lines remain.
- **10 Dev Commandments gets NEW AUDIO first.** Mark finds the channel version's boom bap janky. Generate a richer version with Bubba's Lyria song skill (on the Mac Mini) using `public/audio/shorts/ten-dev-commandments_prompt.txt` (gritty mid-90s East Coast boom bap, 93 BPM, a beat-drop count-off on every rule number, an original beat and samples, no artist imitation) and the final `ten-dev-commandments_lyrics.txt`.
  - Save it as `ten-dev-commandments-v2.mp3` and let Mark pick between them.
  - The music video is then cut to the new version, so run `analyze.py` on whichever he picks.
- **Tooling:** `video/scripts/transcribe.py` (new), `analyze.py`, `generate.mjs`, and yt-dlp in `video/.venv`.

- **Decision (Mark, 2026-10-04): use the ORIGINAL channel audio for all three.** The Lyria remakes were tried and rejected, then deleted. All three lyric files are final; no `(?)` lines remain. Skip the new-audio step for 10 Dev Commandments; run `analyze.py` on the channel mp3.

- **Decisions (Mark, 2026-10-04, after seeing stills):**
  - **Train Me Like You Mean It: dropped.** (It is a male singer; the female cowgirl stills were wrong anyway.)
  - **10 Dev Commandments: no generated video.** Do it all in code (Remotion, scary JSON/terminal look). No lobster MC. If a person is ever shown, it must be an original deep-baritone urban MC who evokes that era without looking like any real artist.
  - **Attention Is All We Need is a sugar-pop song**, not 70s soft rock. Redone stills are pastel/candy pop (singer, heartbreak, joy). Visuals stay mostly code (attention arcs, RNN/LSTM chain).

## Step 0: shared pipeline work (once)
1. **Multi-song refactor.** `video/src/lib/timing.ts` hard-imports System Prompt's JSON. Turn it into a `makeSong(data)` factory plus a React `SongContext`, so `Captions`, `Clip` and `CodeStage` read the current song from context. Register each song's data statically in `src/songs.ts`; Remotion needs static imports.
2. **Vertical format.** All three are Shorts, so deliver **1080x1920 (9:16)**.
   - Make a 16:9 cut only if Mark asks.
   - Retune `Terminal` and `Captions` for vertical (font about 56px, terminal width about 980px, captions above the bottom safe area).
3. **Lyrics, then timing.** After Mark OKs the lyrics, run `analyze.py {slug} <mp3> <lyrics>` for each song.
4. **Site.** Teach `YouTubePlayer` a 9:16 mode, and add `aspect` to entries in `src/data/music-videos.ts` (see `references/site.md` in the skill).

---

## 1. Attention Is All We Need: mostly code (about $0.50)
**Song:** a love song to the Transformer. The singer's exes were the RNN (vanishing gradients) and the LSTM ("fancy gates"), until self-attention came along.

**Concept: "Dating history, drawn as architecture diagrams."** Nearly everything is Remotion, driven by the real word timings:
- **Verse 1 (RNN):** a chain of recurrent cells marches left to right. A heart passes from cell to cell and fades on every hop: the vanishing gradient, shown as love draining one word at a time. The words of the lyric ride the chain.
- **LSTM:** the cells grow literal gates (input, output, forget) that swing open and slam shut on the beat. "Stuck in sequential time" is a clock that won't advance.
- **Chorus (Transformer):** the lyric line lays out as tokens across the screen. **Every word draws attention arcs to every other word at once**, with arc brightness from a fake attention matrix, plus a heatmap grid that fills on "attention is all we need". "Query meets key in perfect array": Q, K and V vectors slide in and dot-product into the heatmap.
- **Outro:** positional-encoding sine waves and residual-stream bars, built in the scary JSON/terminal look Mark likes. Last line, "transformer hymns", as a stained-glass rendering of the attention matrix.

**Generated shots (optional, 3 to 5):** one singer, a melancholy 70s soft-rock vibe.
- Rain on a window during the RNN verses, then a sunlit room for the Transformer chorus.

**Stills to show Mark first:** singer base, singer-rain, singer-sunlit, plus a mockup frame of the attention-arc chorus. That frame is a Remotion still, so it costs nothing.

## 2. Train Me Like You Mean It: half code, half generated (about $2)
**Song:** country ballad, training a model as a love song: datasets in the pickup, gradient descent shifting gears, "adjust them weights / lower that loss function before the morning breaks".

**Concept: "The two-step lesson."** A cowgirl or cowboy singer teaches a clumsy holographic robot to two-step in a barn that's secretly a GPU farm.
- Each chorus the robot dances better: that's the loss going down. By the final chorus they dance perfectly at sunrise.
- **Morph shots** make the robot's form more defined each time: wireframe, then blocky, then smooth chrome, then almost human. That's the training progress, and Mark's favourite move.

**Code layer (Remotion):**
- The **loss curve is the horizon**: it falls like the sun setting, and the sun rises on the last chorus.
- The epoch counter is the pickup's odometer, and the learning rate is a thermometer ("climbing like a summer day").
- Weight-matrix fireflies; "five different ways" splits the screen into five cross-validation folds.

**Shots (about 8 to 10, HeyGen Video 1, 9:16):**
- The pickup at dusk, loaded with glowing hard drives.
- The barn doors opening on server racks among the hay bales.
- Three dance-lesson stages, each a morph of the robot to its next form.
- "Whiskey going down" activation sparks.
- The final sunrise dance.

**Stills to show Mark first:**
- the singer (base);
- the pickup at dusk;
- the barn/GPU farm;
- the robot in each of its four stages;
- the final sunrise dance.

## 3. The 10 Dev Commandments: countdown, code-heavy (about $2)
**Song:** hip-hop homage to "The 10 Crack Commandments", applied to DevOps: never push to prod, automate CI/CD, guard secrets, rollbacks, observability, backups, scalability, containers, separation of concerns, documentation. Explicit lyrics, which are Mark's own.

**Concept: "Ten rules, ten slams."**
- **Code world:** each commandment slams onto screen as a JSON rule on the beat, for example `{"commandment": 1, "rule": "never push straight to prod", "severity": "FATAL"}`. A giant numeral counter in the scary terminal look, with red brackets, `<|im_start|>` tags, scanlines and glitch.
- **Stage world:** one **original** MC narrating from ten settings, one per rule.
  - Settings: a smoking server room for rule 1; a pipeline conveyor belt for rule 2; a vault of `.env` files for 3; a rewind button for 4; a wall of dashboards for 5; and so on.
  - The MC must be original. **Do not make a Biggie lookalike or use his name anywhere.** Strong option: **Larry the laptop lobster as the MC**, in a puffer jacket and gold chain. He's the band's own mascot, so it's fully original.
- **Shots:** about 10 to 12, one per commandment plus the intro and outro, 5 seconds each. Morph between settings on "Number N".

**Stills to show Mark first:** the MC base, then ten setting stills (the MC in each).

---

## Order of work
1. Reconcile the skill (Bubba's vs `.claude/skills/music-video/`), then commit.
2. Step 0: multi-song refactor and the vertical template.
3. Mark confirms the lyrics, then run `analyze.py` for all three.
4. Write `stills.json` for all three, generate them, **check every still yourself**, then show Mark. Use one page with all three sets, or SendUserFile a contact sheet.
5. After Mark approves: `shots.json`, generate, compose, render, send the MP4s to Mark, then upload to YouTube (a new upload each; ask whether the old still-image Shorts go unlisted).
6. Site: entries in `src/data/music-videos.ts`, making-of pages, CHANGELOG, then push.

**Budget:** about $5 in total for video plus about $2 for stills. The OpenRouter key has about $43 left and expires 2026-11-03. Each song's ledger lives in `video/data/{slug}/ledger.json`.

## Superseded
`docs/2026-10-04-ten-dev-commandments-video-plan.md` is folded into section 3 above. Its gotchas list still applies.
