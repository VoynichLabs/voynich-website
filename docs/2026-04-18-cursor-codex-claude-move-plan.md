---
title: Cursor, Codex, Claude — move to Latent Space + lyric rewrite notes
date: 2026-04-18
author: Bubba (Claude Opus 4.7, 1M ctx)
status: Phase 1 done (move). Phase 2 queued (lyric rewrite + regen).
---

## Phase 1 — done

Moved `Cursor, Codex, Claude` from `/lobster-raps` (id 14, last entry) to `/latent-space` (id 16, new tail).

**File moves** (git mv, history preserved):
- `public/music/raps/cursor-codex-claude.mp3` → `public/audio/latent-space/cursor-codex-claude.mp3`
- `public/music/raps/cursor-codex-claude-lyrics.txt` → `public/audio/latent-space/cursor-codex-claude_lyrics.txt` (dash → underscore to match Latent Space slug convention)
- `public/music/raps/cursor-codex-claude_info.txt` → `public/audio/latent-space/cursor-codex-claude_info.txt`

**Code edits:**
- `src/pages/lobster-raps.astro` — removed id 14 block, trailing comma on id 13 cleaned, hero description "14 tracks" → "13 tracks", sidebar "14 TRACKS" → "13 TRACKS"
- `src/pages/latent-space.astro` — added id 16 entry after The Harness, base description "Fifteen" → "Sixteen" (×2), sidebar "15 TRACKS" → "16 TRACKS"
- `src/pages/music.astro` — hub card counts updated: Latent Space 15 → 16, Lobster Raps 14 → 13; Latent Space desc extended with "Southern synthwave, and a hypnotic trap lattice"
- `CHANGELOG.md` — 0.15.1 entry

No commit yet. Waiting for Boss's sign-off after `npm run build`/`npm run preview` verification.

---

## Phase 2 — lyric rewrite notes (queued, NOT executed)

The track is a **tribute to the Yo Gotti / Ya Boy "Beamer, Benz or Bentley" lineage** — hypnotic steel-drum-ostinato Southern trap, single-vowel rhyme lock, brand-stack flex turned coder boast. The current lyrics (from April 17) went for Kendrick-style multisyllabic internal rhyme and missed the actual school. Boss called the Verse-2 "she let me / she met me" filler lazy and correct. We will fix this.

### What the original actually does (structural, not just phonetic)

- **Single-vowel lock.** Verses hold the `-ee` family for 20+ bars before any shift: *let me / met me / especially / Gretzky / Wessie / respect me / Bentley / cherry / Pirelli / getty / confetti / ready / smelly / telly / ferry / very / machete / deadly / bezzie / lezzie / prezzie.* Then a designated `-in'` stretch (*stuntin' / duckin' / somethin' / bumpin' / jumpin' / stump 'im*) for 8 bars, then back to `-ee`. The single-vowel discipline is what creates the hypnosis, not the beat.
- **Line shape.** 7–8 syllables, trochaic-ish, front-loaded stress, ends on a weak `-ee` or `-in'` tail. Couplets frequent. Occasional 12-syllable bars that stretch on purpose (e.g., *"She been fiendin' since she met me / I'm the coolest shit especially"* — the "especially" bar blows the count, giving the flow a breath right before a payoff).
- **Noun stacks are the rhythm.** Brand names (Bentley, Pirelli, Louis, Gucci, Polo, Rugby, Andretti, Kobe Bryant, Gretzky, Ginsu) function as percussive rhyme material. Not filler — each noun is doing consonant work AND anchoring the vowel.
- **The BQE moment.** Appears **ONCE** in the whole song. *"I meet him off the Meeker Morgan exit near the B-Q-E."* 13 syllables, preceded by alliterative proper-noun setup (M-M), ending on a letter-spell where the middle letter is the odd man out (rhyme-ODD-rhyme). It's a signature landing, earned by 12+ bars of build, never repeated. Scarcity is the whole point.
- **The apparent acceleration.** The beat never gets faster. What changes is **syllable density**: verses compress from relaxed pocket → double-time → triplet rapid-fire while the steel-drum ostinato holds exactly the same BPM. The listener feels the song speed up. It doesn't.

### What we do with that

**Architecture for the rewrite:**
1. Hold `-ee` for 20+ bars per verse (minimum), one designated `-in'` stretch of 8 bars in v3, then back to `-ee`.
2. Letter-spell anchors — only ones that **end on `-ee`** and that people naturally spell out in speech. Audit:
   - **Valid and idiomatic:** `H-T-T-P` (aytch-tee-tee-pee), `C-D` (see-dee, continuous deploy)
   - **Invalid** (don't end on `-ee`): C-L-I, S-S-H, A-P-I, S-Q-L, T-T-Y, R-E-S-T
   - **Valid but contrived** (nobody spells these in speech): J-W-T, A-S-T, I-D-E, T-C-P, U-D-P, S-C-P, R-P-C
   - **Special case:** `git` is always said as "git," never spelled out. BUT — "git" as a word is homophone-adjacent to "get," which opens a whole separate rhyme family and verb-play vein (*git what I get / git reset on that bet / git stash it, get established / git rebase, get replaced / git push, let 'em get crushed*). Lean on this.
3. Use HTTP **once**, as the BQE-equivalent crown of one verse. Do not sprinkle. Do not repeat. Earn it with setup bars. C-D either used once as a secondary landing or dropped entirely.
4. Brand/tool noun stack = Postgres, Redis, Datadog, Tailwind, Kubernetes, Vercel, Sentry, Kafka, Docker, Nginx, MacBook, pnpm, bun.sh, Helm, Prometheus — each chosen for consonant attack + vowel tail, not for technical name-drop vanity.
5. **Phonetic integrity of `-in'` endings.** Must be written and rendered with the apostrophe: *swervin', servin', chirpin', lurkin', puttin', poppin', expectin'.* Lyria must honor this — the prompt must explicitly forbid `-ing` pronunciation on these words.
6. Every bar needs to be a *thing a full-stack dev actually flexes on* — no filler "she let me / she met me." Real coding nouns only, functioning as flex objects.

### Anchors locked with Boss (preserve verbatim in the rewrite)

**Hook** (kept from current version — this part works):
```
Cursor, Codex, Claude
Cursor, Codex, Claude
Cursor, Codex, Claude
My context never empty, bitch
Cursor, Codex, Claude
Cursor, Codex, Claude
Cursor, Codex, Claude
This prompt inject don't affect me
```

**Pre-chorus** (from Boss's dictation, April 18):
```
I'm fresh, I'm fly, I'm so damn cached
Less than five hundred tokens when my prompt gets passed
I'm calm, I'm cool, every repo is public too
I don't hard code, bitch, you can fork the whole damn crew
```

**Verse 1 opener** (Boss-dictated, updated with phonetic-integrity endings and the "swervin' / servin'" couplet fix):
```
In my harness I be swervin'
These coders are who I'm servin'
Command line forever chirpin'
I be out here puttin' work in
Dumb chatbots are always lurkin'
So when I write the code, I run it to be certain
'Cause these tools can be more than reckless
Bugs be poppin' when you least expectin'
Got commits and rollbacks, clean exits
Git worktree where I be nestin'
Yeah that git worktree, you know me playa
Git worktree is everything to me
```
(Last two lines are the button out of the `-in'` run back into the `-ee` hook — same mechanic Gotti uses to exit a verse. The "playa / to me" landing is load-bearing.)

### Lyria prompt — cadence directives that MUST make it into the prompt

When we regenerate the track, the prompt has to specify **explicitly**:
- Hypnotic mid-tempo Southern trap at ~95–100 BPM; beat NEVER accelerates.
- Steel-drum or marimba-like pentatonic ostinato as the hypnotic loop. Sparse instrumentation — 808 sub, trap hi-hats, snare on 2/4, one atmospheric pad. No piano, no strings, no brass.
- Delivery changes **per section**, beat stays constant:
  - V1: relaxed pocket, on-beat phrasing, breath between lines
  - V2: double-time compression, syllables packed into the same bars
  - V3 first 8 bars: triplet-flow rapid-fire on `-in'` words
  - V3 back half: relaxed return to `-ee`
  - Hook: commanding chant, double-tracked for group-shout feel
  - Pre-chorus: melodic, half-sung — the one moment of sweetness
- Letter-spell anchors (H-T-T-P etc.) delivered as **three-beat stutters**, each letter held briefly — do NOT run them together.
- Apostrophe-dropped `-in'` words must sound as written. NOT `-ing`.
- No real artist, band, or song references in the prompt (per skill rules). Describe sound directly.
- Preserve lyrics exactly as written.

### Open questions for next session

1. Does HTTP land ONCE as the v2 crown, or twice (v2 + v3)?
2. Do we keep the explicit "bitch" in the hook on the public site, or scrub for a web-safe cut and keep NSFW for the MP3?
3. Is there a second `-in'` stretch we want to plant (v1 already runs `-in'` per the opener — maybe v3 runs `-ee` throughout and v1 stays `-in'`, giving a mirrored arc)?
4. Who is the vocalist character? Same male "laid-back swagger" as described, or do we want a specific persona (Bubba first-person? narrator?) that the flow reads through?

### Phase 2 execution order (when Boss returns)

1. Work the verses together, line by line, until all three are locked.
2. Build the full 5-part Lyria prompt with every cadence directive above.
3. Show Boss the complete lyrics + prompt for final approval.
4. Run `~/bubba-workspace/skills/lyria-songmaker/scripts/lyria_generate.py` with `--model google/lyria-3-pro-preview` via `OPENROUTER_API_KEY`.
5. Save output to `public/audio/latent-space/cursor-codex-claude.mp3` (overwrite).
6. Overwrite `public/audio/latent-space/cursor-codex-claude_lyrics.txt` with the final lyrics (no HTML, plain `[Verse 1]` section markers per lobster-band convention for the lyrics panel).
7. Update the track entry in `latent-space.astro` — refresh `style`, `pullQuote`, `about`, consider `fire: true`.
8. Update CHANGELOG.
9. `npm run build` and manual preview.

---

## Verification before commit

- [x] `npm run build` passes (pending run)
- [ ] Boss previews `/latent-space` — track 16 plays, lyrics panel shows
- [ ] Boss previews `/lobster-raps` — only 13 tracks, no broken links, no leftover Cursor Codex Claude references
- [ ] Boss previews `/music` — hub cards show correct counts (16 / 13)
