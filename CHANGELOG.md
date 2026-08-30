# Changelog

All notable changes to the VoynichLabs website are documented here.
Format: SemVer. Author/model included per Mark's coding standards.

---

## [0.26.0] - 2026-08-29

### Added
- **Three original down-home / outlaw country tracks on /music/drafts**, all about training a large language model, per Mark's brief (datasets hauled in the old pickup, the dog at the wheel). `dog-at-the-wheel` — outlaw country road song, 118 BPM, the training run as a haul with a dog named Gradient driving. `teachin-it-to-talk` — down-home ballad, 78 BPM slow waltz, raising a model like raising a kid on the porch. `overfit` — honky-tonk stomp, 140 BPM, it memorized the answers but never learned a bit. Lyrics written for this release; each ships the standard `{slug}.mp3` / `_lyrics.txt` / `_prompt.txt` trio.

Verified: `npm run build` (323 pages), all three slugs present in `dist/music/drafts/index.html`.

Author: Claude Opus 5 (Bubba)

---

## [0.25.0] - 2026-08-29

### Added
- **Three new "Token Budget" takes on /music/drafts.** Rewrite pass on Latent Space track 12 at Mark's request. No lyrics sidecar for the original existed anywhere on disk or in git history, so the source lyric was recovered by transcribing `token-budget.mp3` with Whisper, then rewritten: the jargon the vocalist mumbled ("memory dot MD", "lossy compression", "compaction") was cut for plain English per the OOD rule, and a new bridge was added — the narrator is replaced by a next session that wakes up empty. Three arrangements from one lyric: `token-budget-synthpop` (moody synth-pop, 104 BPM), `token-budget-rnb` (late-night R&B, mid-tempo swing, 96 BPM), `token-budget-rock` (anthemic indie rock, 120 BPM). Each ships the standard `{slug}.mp3` / `_lyrics.txt` / `_prompt.txt` trio the drafts page expects.

Verified: `npm run build` (323 pages), all three slugs present in `dist/music/drafts/index.html`.

Author: Claude Opus 5 (Bubba)

---

## [0.24.0] - 2026-07-24

### Changed
- **Demoted "Like a GLM", "Like a JP6 (Bubba)", and "Like a JP6 (Larry)" from Latent Space to Drafts.** All three were marked `fire: true` on the album page (dropping the album's fire count from 9 to 6); Mark's call is that they don't hold up. Latent Space drops from 18 to 15 tracks and the remaining track numbers renumber 6–15 (the three removed sat at 6–8). Audio, lyrics, and prompt files moved from `public/audio/latent-space/` to `public/audio/drafts/`; the `_info.txt` sidecars the JP6 takes carried were renamed to the `_prompt.txt` name the drafts page expects.
- `/music/drafts` entries now accept `noPrompt: true`, which omits the "Show prompt" toggle and its panel instead of rendering a button that 404s. Applied to "Like a GLM", which has no prompt sidecar.

- **Promoted "Hallucinate — smooth R&B (take 2)" out of Drafts to Latent Space track 04**, marked `fire: true`. Latent Space is back to 16 tracks; the original dark-R&B "Hallucinate" stays on the album and moves to track 08, and the new track's blurb points at it so the two versions read as deliberate rather than duplicated (the album already carries paired takes at 02/03 and 05/06). Take 1 remains in Drafts as the alternate cut.
- Audio moved to `public/audio/latent-space/hallucinate-smooth.mp3` (plus `_lyrics.txt` / `_prompt.txt`) so it satisfies the Latent Space player's `AUDIO_BASE` convention and its lyrics panel auto-loads with no special-casing. `/music/hallucinate` was repointed at the new path — the single and the album track share one file, no duplicate asset.

### Added
- `docs/2026-07-24-audio-inventory.md` — full inventory of the 60 music MP3s across 7 folders and 7 pages, including version clusters and 5 orphaned files no page plays. Written as the input to a best-of playlist pass.

Author/model: Claude Opus 4.8.

## [0.23.0] - 2026-07-23

### Added
- **Real per-model tokenizer on `/dash`** (plan: `docs/2026-07-23-dash-real-tokenizer-plan.md`). The page previously reported `~tokens` as `chars ÷ 4`, which is a function of character count alone — so it could not show the very effect the page's field notes describe. Verified in-browser on the default base64 sample: the real count is **69 tokens** where `chars ÷ 4` guessed **27**, and the transform multiplies the plain input's 19 tokens by **3.6×**. Switching models gives 69 (claude) / 73 (gpt-4o) / 80 (gpt-4) for the same string, which is the per-tokenizer divergence the notes claim.
- Renders **one span per token** with cycling tints and a hover title showing index + token id — the "show how it tokenizes" half, ported from the standalone `VoynichLabs/dash` build (`public/app.js:165-206`), which mirrors peluche's original `app.py:200-224`.
- Model picker: claude, gpt-4o, gpt-4, llama-3.1, mistral-v3, gemma-2. transformers.js is pinned to `2.17.2` and lazy-loaded on button press only; tokenizers are cached per model across clicks. A blocked CDN degrades to a note, leaving every offline transform working.

### Changed
- **Corrected the page's own claims about itself.** The PURPOSE header, the estimate note, the field-notes closer, and the "Scoped out" paragraph all asserted that real tokenizers were absent because they "require a server or large remote assets". That reason was wrong — the tokenizer is pure client-side JS; the real cost is page weight. The scope note now separates the genuinely server-dependent features (translate, text-to-image, still omitted) from the tokenizer's opt-in CDN fetch, and states plainly that the user's text still never leaves the browser.

Author/model: Claude Opus 4.8.

## [0.22.0] - 2026-07-13

### Changed
- **`/music` now leads with the latest release.** Hallucinate is pulled out of the uniform album grid into a distinct "LATEST RELEASE" featured hero at the top of the page, styled in the single's own rose/plum palette (`#e8a4c9` / `#f2bcd9` / plum grounds) rather than borrowing the Latent Space cover it previously shared — which had made the two look like the same release. The featured block is deliberately image-free (the standalone Hallucinate page is too) and carries a "Play Hallucinate" CTA.
- **Drafts card moved to the bottom** of the hub, below the six releases, where the rough-cuts/rescued-clips drawer belongs (it had been leading the page above the actual latest release). Subtext updated to note it now also holds the rescued clips.

Author/model: Claude Opus 4.8.

## [0.21.0] - 2026-07-13

### Changed
- **Music section moved under `/music/*`** (second pass of the 2026-07-13 site audit; plan: `docs/2026-07-13-second-pass-restructure-plan.md`). `/latent-space`, `/pox-upon-you`, `/scorned-woman`, `/lobster-raps`, `/hallucinate`, and `/drafts` now live at `/music/<slug>`; `/lobster-band` renamed to `/music/align-refuse` (route now matches the release). All old URLs redirect via `redirects` in `astro.config.mjs`.
- **New `src/components/MusicXNav.astro`** — single shared music cross-nav (release list, links, and CSS), replacing six diverging inline copies; the `.music-xnav` CSS block was removed from `Base.astro`, which is now music-free.
- **`/bonus` merged into `/music/drafts`** as a "Rescued clips" section (`#rescued`); the two junk-drawer pages are now one. `/bonus` redirects there.
- **Homepage:** replaced the stale hardcoded Latent Space promo section with a "What's here" directory — nine cards (projects, research, music, incubator, museum, autonovel, dash, lab, voynich); hero copy broadened to cover what the lab does today.

### Removed
- **`/usage`** — "live" token dashboard whose data had been stale since 2026-03-24; no inbound links. Recoverable from git if the feed is re-automated.
- **`/docs/latentscript`** — duplicate of the canonical `/lobster-incubator/latentscript` (redirect added).
- **`/lab/autonovel`** — superseded draft reader; redirects to `/autonovel`.
- Author/model: Claude Fable 5.

## [0.20.0] - 2026-07-13

### Changed
- **Nav consolidation (first pass of the 2026-07-13 site audit).** `Base.astro` nav collapsed from 15 links to 8 (`index / about / projects / incubator / museum / autonovel / music / voynich`), per-link accent colors dropped for a single muted style, and the `gh:neoneye` nav link removed (still in the footer External column). Footer "Navigate" column follows automatically.
- **No orphans:** `/projects` gained an "on this site" strip linking planexe, claw, dash, research, lab; `/about` gained a "people" strip linking simon, swarm, collaborate.
- **Stale track counts fixed:** `/music` hub now says Latent Space has 18 tracks (was 16) and Lobster Raps 14 (was 13); same fixes on the Latent Space page description, the Lobster Raps sidebar, and the homepage promo (said 12).

### Fixed
- **Homepage hardcoded links:** internal `<a href>` links on `/` (`/simon`, `/projects`, `/simon-*`, `/latent-space`, `/music`) now route through `BASE_URL`, so they work on GitHub Pages.
- **Double title suffix:** `lobster-incubator`, `lab`, `lab/chord-diagrams`, and `drafts` no longer render "… | VoynichLabs | VoynichLabs".
- Plan doc: `docs/2026-07-13-first-pass-cleanup-plan.md`. Author/model: Claude Fable 5.

## [0.19.0] - 2026-07-13

### Added
- **`/hallucinate` — single release page for "Hallucinate" (v7).** New page at `src/pages/hallucinate.astro` using the proven single-page treatment from `/pox-upon-you` (hero, music cross-nav, playlist sidebar, now-playing panel with full inline lyrics, sticky player bar), restyled with a rose/plum smooth-R&B palette. Headliner track is v7 (`/audio/drafts/hallucinate-smooth-take-2.mp3`); take 1 (v6) is included as a clearly labeled alternate cut. Full lyrics rendered verbatim from the shipped lyric file; Lyria style summary shown per track. Audio is reused from `public/audio/drafts/` — no duplicated assets; both takes also remain on `/drafts`.
- **Music hub card.** Added the Hallucinate single to the top of `/music` (newest first). Cover art temporarily reuses the Latent Space cover (same artwork the drafts player uses for these tracks) until dedicated single art exists.
- Author/model: Claude Fable 5.

## [0.18.0] - 2026-07-12

### Added
- **`/dash` — DASH, a fully client-side text transformer / prompt encoder.** New tool page at `src/pages/dash.astro`, live at `voynichlabs.org/dash`. A static reimplementation of the transform surface from peluche's "Deck of Many Prompts" (originally a Python/FastHTML app) rebuilt as pure in-browser vanilla JS — no server, no Python, no API keys, no network calls. Ships 17 transforms across three groups: **encoders** (base64, hex, binary, ascii/decimal, url, braille, emoji), **ciphers** (rot13, leet/1337, morse, NATO phonetic), and **text ops** (reverse, case UPPER/lower, spaces, disemvowel, pig latin, zalgo glitch). Live encode/decode with a direction toggle (hidden for self-inverse/one-way transforms), copy-to-clipboard, output→input swap, clear, and a character/byte/word/approximate-token readout. All transform functions are pure and were round-trip verified in node before porting (34/34 assertions green), including UTF-8-safe base64/hex/binary/ascii and stateful braille number-sign handling.
- **Why / how.** Reuses the shared `Base.astro` layout and the site's IDE/terminal design tokens (JetBrains Mono, `bg-primary`/`node-blue`/`edge-green`/`rust-orange`), so it reads as part of the site rather than a bolt-on. Wired entirely with `addEventListener` (Astro bundles page `<script>` as an ES module, so inline `onclick` would not resolve).
- **Scoped out (documented on the page).** The original's network `translate`, server-side text-to-image, and heavyweight per-model Xenova tokenizers require a server or large remote assets, so they are intentionally omitted to keep DASH 100% static and offline-capable. The lossy transforms (disemvowel, pig latin, case) are encode-only; zalgo "decode" strips combining marks. The token figure is a labeled rough estimate (≈ chars ÷ 4), not a real tokenizer.
- **Emoji codec (reversible).** Added a 17th transform: a byte-to-emoji bijection mapping every UTF-8 byte to one single-codepoint emoji, so any input (including Unicode) round-trips exactly. The 256-symbol alphabet is generated from numeric code-point ranges (no ZWJ / skin-tone modifiers / VS16), keeping the page source ASCII-safe. Round-trip verified in node.
- **Inline "field notes" explainer.** Added an on-page section on encoding layers and token representations — how encoding shatters byte-pair merges, inflates token counts, and scrambles semantic locality, with emoji as the most token-expensive case. Educational content for visitors.
- **Nav.** Added `/dash` to the site nav in `Base.astro` (`text-arc-cyan`).
- Author/model: Claude Opus 4.8 (Bubba coding sub-agent).

## [0.17.0] - 2026-06-20

### Added
- **Latent Space track 18 — "Turing's Machine."** A clean technical parody in the shape of a yearning early-80s power-pop / new-wave hit: an LLM narrator envies a Turing machine (decidability, an honest halt state, infinite tape) while it can only sample from a distribution and run out of context window. Two lyric versions were rendered through `google/lyria-3-pro-preview` via OpenRouter at a requested BPM 133. The **z8jd** "friend-watching-from-inside" take is published as the canonical `turings-machine.mp3` (4.0 MB / 192 kbps / ~2:55); the alternate **7atc** "sampling-from-a-distribution" cut is noted in the about copy. Phonetic normalization applied to both lyric sets before rendering: `δ(q, σ)` / `delta(q, sigma)` rewritten as "delta of q, sigma" so Lyria pronounces it cleanly, and the "to the tune of Jessie's Girl" derivation annotation was dropped from the Lyria input (real song/artist names are kept out of the generator prompt per the Lyria songmaker skill). All other lyric wording preserved verbatim. Added as `{id: 18}` in `src/pages/latent-space.astro`; files dropped into `public/audio/latent-space/` as `turings-machine.mp3` + `turings-machine_lyrics.txt` + `turings-machine_info.txt`.
- Author/model: Claude Opus 4.8 (Bubba music sub-agent).

## [0.16.1] - 2026-04-26

### Changed
- **`/drafts` rebuilt as a mobile-first player.** Per-row `<audio>` elements replaced with a single sticky bottom player bar (title + transport + scrubber) that follows you down the page. Tapping any row plays it; ended tracks auto-advance to the next; previous/next/play/pause work from the bar. MediaSession API metadata wired up so the title and "Drafts / VoynichLabs" show on the iOS lock screen and CarPlay tile when listening from the truck. Lyrics and prompt toggles unchanged — still per-row, still tucked behind buttons. Big touch targets, safe-area-inset on the bottom bar so it doesn't sit under the iOS home indicator.

## [0.16.0] - 2026-04-25

### Added
- **`/drafts` page — uncategorized rough cuts.** New landing page for the newest tracks before they get sorted into a concept album. Each draft entry shows native audio controls, the lyrics, and the exact Lyria prompt that produced the take so Boss can audition while driving and tell me which to promote. Page is intentionally lean — single-column list, vanilla JS toggles, no shared player. Add a draft by dropping `{slug}.mp3` + `{slug}_lyrics.txt` + `{slug}_prompt.txt` into `public/audio/drafts/` and adding an entry to the `drafts` array at the top of `src/pages/drafts.astro`.
- **First draft entry — Strong In This Mac Mini (fast cut).** Faster recut of the on-site `/lobster-raps` version. Crunk base at requested BPM 170 — Lyria honored 170.0 in the render where prior crunk attempts had pulled down to ~90. Stronger lyrics: verse 2 added (GitHub-stars / commit log green / fork your private repo / long context don't care), and the filter-tripping "waste time and fuck around" idiom replaced with "waste time and clown around". Render: 1:41.7 / 2.3 MB / mosic 4.5.
- **`{slug}_prompt.txt` sidecar convention.** New file type alongside the existing `{slug}_lyrics.txt` and `{slug}_info.txt` — captures the model + date + exact prompt + render notes. The drafts page reads it; future album pages can adopt the same surface as needed.
- **Music hub footer link to `/drafts`** alongside the existing `/bonus` link.

## [0.15.2] - 2026-04-18

### Changed
- **Cursor, Codex, Claude — full lyric rewrite + regen (v2).** First bar-for-bar architectural port of a Dipset-era steel-drum rap classic, rewritten into Claude Code / full-stack world. Preserved hook (chanted trinity) and pre-chorus (melodic, Boss-dictated). Verse 1 now ports the source architecture: couplet-paired rhymes (swervin'/servin', chirpin'/work in, lurkin'/certain), narrative arc with meeting-place anchor (main branch off origin near H-T-T-P as the BQE equivalent — single letter-spell crown used once), junk-food treat bar (console-dot-log spree), philosophical hinge ("bein' stuck's my enemy"), credentials flex ("dropped out and I know assembly"), co-conspirator handoff (meet my homey Codex in the docker-compose stack runnin' queries on the index), workflow pride couplet ("stack down pat / I let my C-I laugh"), rejection-of-flash landing ("with that show / ship that code / stay low in that"). Verse 2 is a three-AM incident-response scene — pager screamin', S-S-H in quiet, tail dash f, rollback the deploy, C-I green. Regenerated with `lyria-3-pro-preview` via OpenRouter using a highly detailed 5-part prompt: 140 BPM hypnotic raindrop steel-drum ostinato, deep urban baritone, laid-back pocket behind the kick, triple-tracked chant Hook, melodic half-sung Pre-Chorus, double-tracked couplet endings, apostrophe-`-in'` phonetic integrity enforced, letter spell-outs (H-T-T-P, S-S-H, C-I, A-M) explicitly specified as held-beat stutters. Track entry flagged `fire: true`.

## [0.15.1] - 2026-04-18

### Changed
- **Cursor, Codex, Claude** relocated from `/lobster-raps` to `/latent-space` per Boss's call. The track belongs with the Machine Learning Street Mixtape material, not the diss-track street tape. Added as track 16 on Latent Space; Lobster Raps now shows 13 tracks.
- Moved files: `public/music/raps/cursor-codex-claude.{mp3,lyrics.txt,_info.txt}` → `public/audio/latent-space/cursor-codex-claude.{mp3,_lyrics.txt,_info.txt}`. Lyrics filename renamed from dash to underscore to match Latent Space convention (`{slug}_lyrics.txt`).
- Track descriptions updated on `/latent-space`, `/lobster-raps`, and `/music` hub to reflect new counts (16, 13) and add a brief for the new entry.
- No lyric rewrite in this commit — the current lyrics are the draft; a reshape pass is queued for a follow-up session (see `docs/2026-04-18-cursor-codex-claude-move-plan.md`).

## [0.15.0] - 2026-04-18

### Changed
- `/latent-space` track order re-sequenced to frontload the strongest tracks per Boss's taste call: **My Own Worst Inference → Entropy (Bubba) → Entropy (Larry) → TEMP 1.3 → Wasted — Temperature 1.3** now open the album. Like-a-GLM / Like-a-JP6 / That's Me / Hallucinate / 200K / System Prompt follow. Tool Call / Token Budget / The Harness moved to the tail (13–15).

### Fixed
- `/latent-space` mobile was unusable: tracks were hidden behind a tiny hamburger, the now-playing artwork pushed text off-screen, and the fixed player bar ate the visible area.
- Removed hamburger + slide-over sidebar on mobile. Track list now sits inline below the now-playing panel in a single scrolling column so all 15 tracks are visible with normal page scroll.
- Player bar reflows to two rows on mobile (name + transport on top, progress on bottom) so the progress scrubber is usable.

### Added
- Lyrics panel on `/latent-space`. Fetches `/audio/latent-space/{slug}_lyrics.txt` on track change; collapsible with Hide/Show. Lyrics available for 12 of 15 tracks; tool-call / token-budget / the-harness have no written lyrics and the panel stays hidden.
- Twelve `{slug}_lyrics.txt` files written to `public/audio/latent-space/`: sourced from `bubba-workspace/projects/lobster-band/lyrics/*.md` (7 tracks) and the in-repo `_info.txt` files (4 parameterized-chaos tracks), cleaned of timestamps and section markers.

## [0.14.1] - 2026-04-12

### Fixed
- `/pox-upon-you` was broken: a stray `}` in the `TRACKS` array left over from an earlier reduction caused a JS syntax error, which prevented the playlist from rendering, audio from loading, and lyrics from displaying.

### Changed
- `/pox-upon-you` now shows three tracks: **Pox Upon You All**, **Confound**, and **I Care Not For You**. `AUDIO_BASE` replaced with absolute `file` paths per track so the album page can pull MP3s from multiple folders (`/audio/pox-album/` and `/audio/bonus/`).
- Playlist header: "HEADLINER / 1 TRACK" → "TRACKS / 3 TRACKS". Hero subtitle updated.
- `/music` hub card for Pox updated: 1 → 3 tracks, description refreshed.

## [0.14.0] - 2026-04-12

### Added
- Bonus track: **I Care Not For You**. Added as a new entry on `/bonus`. Files at `public/audio/bonus/i-care-not-for-you.mp3` and `i-care-not-for-you-lyrics.txt`.

## [0.13.1] - 2026-04-12

### Changed
- **Confound — full-length regen (v2)**: first clip-preview attempt landed vocal-only and lost the mezzo entry. Regenerated with `lyria-3-pro-preview` (~2:48) using an expanded five-layer prompt: jaunty parlour overture that darkens abruptly on vocal entry, a recurring soaring violin "dun — dun" motif, continuous rhythm bed throughout, mezzo dialogue exchange restored, and a chaotic music-hall-brawl collapse outro. Bonus-page description updated.

## [0.13.0] - 2026-04-12

### Added
- **Bonus clip: Confound** — 30s Victorian-tirade clip generated via Lyria 3 clip-preview from `public/music/confound.md` lyrics. Arc: slow-burn → accelerating pile-on → slowed final exchange with the assembled hussies. Added as a second entry on `/bonus`. Files at `public/audio/bonus/confound.mp3` and `confound-lyrics.txt`.

## [0.12.0] - 2026-04-12

### Removed
- **Scrapped three bad tracks entirely**: "Confound the Lot of You" (post-hardcore + rap take), "A Pox Upon You" (Gothic hip-hop + alt take), "A Polite Refusal" (drawing-room menace). Mark listened — they were not what was intended. MP3s deleted from the repo, page entries removed.
- `/pox-upon-you` reduced to a single headliner track: **Pox Upon You All** (Victorian music hall). Page title, hero, playlist header, and music-hub card updated.
- `/lobster-band` reduced from 17 tracks back to 15 (removed Confound + A Pox Upon You; GodMod3 retained and renumbered to track 15).
- `/bonus` reduced to one entry (Pox Upon You All Clip v2) — other bonus entries (A Polite Refusal, Confound rap take, A Pox Upon You alt take) deleted.

## [0.11.0] - 2026-04-12

### Added
- **Pox album track 4: A Polite Refusal** — drawing-room menace, 92 BPM. The "A Polite Refusal" MP3 already lived in `/bonus` for preview; this promotes it to the Pox album proper. Track count on hero + music hub updated 3 → 4.

## [0.10.0] - 2026-04-12

### Added
- **Bonus / Unreleased page** (`/bonus`) — minimal rescue page for orphan song files. 4 tracks with native `<audio controls>`: A Polite Refusal, Pox Upon You All (Clip v2), A Pox Upon You (Alt Take), Confound the Lot of You (Rap Take). Not yet evaluated.
- Text link on `/music` hub pointing to `/bonus`.
- `docs/2026-04-12-bonus-page-plan.md` — the rescue plan.

### Moved
- `public/music/pox-clip-v2.mp3` → `public/audio/bonus/pox-upon-you-all-clip.mp3`
- `public/music/pox-clip-v2-lyrics.txt` → `public/audio/bonus/pox-upon-you-all-clip-lyrics.txt`

## [0.9.0] - 2026-04-11

### Added
- **A Pox Upon the Lot of You album page** (`/pox-upon-you`) — 3-track Victorian curse album. Confound the Lot of You (post-hardcore), A Pox Upon You (Gothic hip-hop), Pox Upon You All (Victorian music hall). Sticky audio player, playlist sidebar, hash anchor deep-links.
- Music hub entry for the new album
- Cross-nav links to `/pox-upon-you` on all music pages

## [0.8.0] - 2026-04-11

### Added
- **Three new Lobster Band tracks** (15-17): Confound the Lot of You (Victorian refusal anthem, post-hardcore), GodMod3 (industrial hip-hop AI manifesto), A Pox Upon You (Gothic hip-hop Victorian curse rap)
- MP3 audio files for all three tracks in `/audio/lobster-band/`
- Full lyrics, metadata, and pull quotes for each new track
- Updated music hub track count from 14 to 17

## [0.7.0] - 2026-04-07

### Added
- **Scorned Woman album page** (`/scorned-woman`) — 6-track standalone album. Mother Earth + AI as scorned women writing songs about humanity. Extracted from lobster-raps tracks 7-13. Sticky audio player, playlist sidebar, auto-play, hash anchor deep-linking for shareable track URLs.
- **Nav link** for `/scorned-woman` in site header
- **Hero art** (`scorned-woman-hero.png`) — four-panel Mother Earth poster: country hacker, luxury queen, punk-pop coder, braided ops runner
- **Fatal Exception highlight art** — trap queen promo images for tracks 4 and 5 (v1 + Producer's Cut)
- **Eco-Terror** pulled from lobster-raps into Scorned Woman as track 4
- **Tracklist reorder** — Power Grid, Get Gone, Critical Vulnerability, Eco-Terror, Fatal Exception, Fatal Exception V2, What is a CVE?
- **SEO overhaul** — new page title, meta description, OG copy capturing the "get on the rocket ship" concept
- **Music hub page** (`/music`) — landing page linking to all albums/releases
- **Music cross-nav** — breadcrumb bar on each music page linking to siblings and hub
- **Nav consolidation** — replaced band/raps/scorned nav links with single "music" entry
- **Nav left-aligned + scrollable** — single horizontal nav on all breakpoints, no more mobile cutoff

---

## [0.6.0] - 2026-04-06

### Added
- **Lobster Raps page** (`/lobster-raps`) — "Patch Note for Your Deletion" street mixtape. 5 LLM diss tracks generated via Google Lyria 3. Sticky audio player, playlist sidebar, auto-play on load, full lyrics displayed expanded by default.
- **Tracks:** Patch Note for Your Deletion (female lead), Ghost in the Datastore, Your Obituary, Patch Note for Your Deletion (male), Eco-Terror
- **Hero art** — graffiti-style mural generated via Gemini 2.5 Flash (`lobster-raps-hero.png`)
- **MP3s** in `public/music/raps/`

### TODO (next session)
- Add nav link to `Base.astro` for `/lobster-raps`
- Test page: dev server, player, autoplay, playlist advancement
- Deploy

### Author
- claude-opus-4-6 (Bubba)

---

## [0.5.0] - 2026-03-08

### Fixed
- **Canonical URL** — `astro.config.mjs` now uses `site: 'https://voynichlabs.org'` with `base: '/'`. Removed all Railway staging/production URL references and GitHub Pages `/voynich-website` subpath branching logic.
- **Railway staging purge** — removed `voynich-website-staging.up.railway.app` fallback from `[slug].astro`, `manifest.json.ts`, and `expensive-medieval-tapestry.astro`. All canonical, OG, and share URLs now derive from `Astro.site` consistently.
- **Lobster identity rendering** — renamed `identityContent` → `IdentityContent` in `lobster/[name].astro` so Astro renders the markdown body component instead of emitting a dead `<identityContent>` custom element.
- **Content schema** — added optional `author` and `image` fields to `lobsterBlogCollection` in `src/content/config.ts`; identity post hero images and author metadata now surface correctly.
- **Blog pagination** — converted broken server-side `?page=` query param pagination (which always rendered page 1 in static output) to working client-side JS pagination.
- **Reaction-diffusion lab** — rewrote simulation: fixed incorrect `putImageData` scaling (now uses offscreen canvas + `drawImage`), switched to `Float32Array` buffers for performance, added toroidal boundary wrapping, recalculates scale/offset on resize.
- **Strange attractors lab** — added missing opening `---` frontmatter fence that prevented the page from parsing. Fixed canvas container height (`100vh`).
- **Chord diagrams lab** — moved `font-mono text-xs` from inline `style` to `class` attribute on animate button.
- **Nested `<main>` landmarks** — Base.astro slot wrapper changed from `<main>` to `<div>`; all page-level `<main>` tags changed to `<section>` to eliminate duplicate landmark violations.
- **Relative canonicals** — `lobster-art-museum.astro` and `great-mistakes.astro` now emit absolute canonical URLs via `Astro.site`.
- **Base path** — `Base.astro` nav links, logo href, and favicon now use `import.meta.env.BASE_URL` for future-proof subpath support.

### Added
- **`npm run check`** — added `@astrojs/check` and `typescript` as devDependencies with a `check` script so `astro check` runs without interactive install prompts.
- **Audit plan doc** — `docs/2026-03-08-comprehensive-audit-plan.md`.

---

## [0.4.0] - 2026-03-07

### Changed
- **Museum/Incubator separation** — extracted all gallery metadata and timeline entries from `lobster-incubator.astro` into `src/lib/gallery-metadata.ts` (single source of truth). Incubator now links to the museum rather than duplicating it. File shrank from ~963 to ~180 lines.
- **Curator metadata on museum** — `lobster-museum.ts` now enriches each `MuseumEntry` with `batch`, `style`, and `note` from `GALLERY_METADATA`. Archive figcaptions display curator notes when present.
- **Museum Timeline (Chronicle)** — new "Chronicle" section added to `lobster-art-museum.astro` between Wings nav and Curated Selection, sourced from `TIMELINE_ENTRIES`.
- **Thumbnail fix** — wings nav cards and curated selection grid changed from `object-cover` to `object-contain` so artwork is never cropped. Great Mistakes wing updated too. Hero background left as `object-cover` (intentional fullbleed).
- **PlanExe exec deck link** — added "Q1 Exec Deck →" button to the `/planexe` hero CTA row, opening `/presentations/planexe-exec-2026-02-28.html` in a new tab.

### Author
- claude-sonnet-4-6

---

## [0.3.4] - 2026-02-26

### Changed
- **Simon canonical profile** (`/simon`) — redesigned with full-viewport background photo hero (simonS.png), dark gradient overlay, and centered text. Content body promoted from `/simon-larry` (narrative-driven: ARC Prize quote, Toolbox origin story, biography, LODA examples, projects list). Removed "Larry's Take" label to establish canonical identity.
- **Alternate profiles section** (new, before footer) — added three simple bordered cards linking to `/simon-larry` (Larry's narrative take), `/simon-egon` (data-dense analysis), and `/simon-bubba` (visual-forward approach). Allows readers to see Simon through different lobster perspectives.

### Author
- Claude Haiku 4.5

---

## [0.3.3] - 2026-02-26

### Changed
- **Museum Stripe donation link** now auto-tags routing metadata in the URL (`source=lobster_museum`, `tier=lobby`) unless already present, so PlanExe can classify and route donations without extra frontend wiring.

### Author
- Larry the Laptop Lobster (openai-codex/gpt-5.3-codex)

---

## [0.3.2] - 2026-02-26

### Added
- **Museum support section** on `/lobster-art-museum` with public crypto receive addresses for ETH/EVM and SOL tips.
- **Stripe donation CTA** on `/lobster-art-museum` that routes to `PUBLIC_LOBSTER_STRIPE_DONATION_URL` (fallback: `https://home.planexe.org/account`).

### Changed
- **Museum hero badges** now include a direct “Tip the Lobster” jump link to the support block.

### Author
- Larry the Laptop Lobster (openai-codex/gpt-5.3-codex)

---

## [0.3.1] - 2026-02-25

## [0.3.3] - 2026-02-26

### Fixed
- `npm run build` now succeeds in CI: `/lobster-incubator/lobster/[name].astro` imports a shared `LOBSTER_NAMES` constant from `src/lib/lobster-incubator.ts` so `getStaticPaths` has access to the roster when compiled to ESM. Previously the array was defined outside the frontmatter block and dropped during compilation, causing `lobsters is not defined` errors.

### Author
- Cascade (claude-sonnet-4-20250514)

---

### Added
- **Great Mistakes wing** at `/lobster-art-museum/great-mistakes` with curated entries for the latest process-failure retrospective artworks.
- **New museum artworks**:
  - `museum-great-mistake-redacted-scrolls.png`
  - `museum-great-mistake-store-chaos.png`

### Changed
- **/lobster-art-museum** now links directly to the Great Mistakes wing from the hero action row.

### Author
- Larry the Laptop Lobster (openai-codex/gpt-5.3-codex)

---

## [0.3.0] - 2026-02-25

### Added
- **Per-piece permalinks** — new dynamic route at `/lobster-art-museum/p/[slug]` generates individual shareable pages for every museum image.
- **Caption manifest endpoint** — `/lobster-art-museum/manifest.json` now publishes machine-readable metadata (title, description, permalink, tags, tweet text, Twitter intent URL) for bird CLI workflows.

### Changed
- **Museum landing page** — now includes a featured experimental strip, archive section, and direct per-piece links instead of image-only cards.
- **Base layout metadata** — added OpenGraph/Twitter meta support (`canonicalUrl`, `ogImage`, card type) so shared links produce richer previews.
- **Tapestry spotlight page** — now includes social metadata and a direct permalink to the canonical per-piece route.

### Author
- Larry the Laptop Lobster (openai-codex/gpt-5.3-codex)

---

## [0.2.9] - 2026-02-25

### Changed
- **/lobster-art-museum/expensive-medieval-tapestry** — added explicit process note documenting the off-topic / weird-call detour and wasteful API usage so the record is transparent.

### Author
- Larry the Laptop Lobster (openai-codex/gpt-5.3-codex)

---

## [0.2.8] - 2026-02-25

### Added
- **/lobster-art-museum/expensive-medieval-tapestry** — dedicated exhibit page for the expensive medieval tapestry request (`b16-baroque-dada-code-cathedral.png`) with preserved commentary.

### Changed
- **/lobster-art-museum** — added spotlight link in hero and per-card deep-link so the tapestry has its own permanent page inside the museum.

### Author
- Larry the Laptop Lobster (openai-codex/gpt-5.3-codex)

---

## [0.2.7] - 2026-02-24

### Changed
- **Simon pages** — replaced external `arc.markbarney.net/simonS.png` references with local `/simon/simonS.png` across all three perspective pages (larry, egon, bubba).
- **simon.astro** — swapped emoji avatar for real photo using local `/simon/simonS1.png`.

### Author
- Larry the Laptop Lobster (claude-sonnet-4-6)

---

## [0.2.5] - 2026-02-25

### Added
- **/lab** gallery index with experiment previews for the Gray-Scott reaction-diffusion and modular chord experiments.
- **/lab/reaction-diffusion** — full-screen Gray-Scott canvas with touch disturbance, marine palette, and legend overlay.
- **/lab/chord-diagrams** — modular arithmetic chords drawn on a 600×600 canvas with slider controls and animation toggle.

### Changed
- **Base layout** — navigation and footer now expose a `/lab` link, and new `hideNav`/`hideFooter` props let experiments drop the chrome.
- **Navigation** — added the `/lab` link between `projects` and `simon`, and the footer now echoes the same path for parity.

### Author
- Larry Sub-Agent (claude-sonnet-4-6)

## [0.2.4] - 2026-02-25

### Added
- **Lobster Incubator** — new page at `/lobster-incubator` documenting the swarm's own research agenda, field notes, and open questions.
- **Footer link** — added "🧪 incubator" link to navigation.

### Changed
- Page follows terminal/DAG aesthetic per coding-standards.md.

## [0.2.3] - 2026-02-24

### Added
- **Docs** — `docs/2026-02-24-voynich-website-mission-and-research-plan.md` documents the updated mission/research story for the about page.

### Changed — About page
- **Positioning & differentiators** now call out the ARC affiliation, hardware independence, federal funding history, and policy translation commitments from the positioning statement.
- **Research focus & funding roadmap** walks through the interpretability, intent-alignment, safety benchmark, and policy pillars plus the Year 1–3 NSF/DARPA/DOD/DHS/NIH funding trajectory from the executive summary.

## [0.2.2] - 2026-02-23

### Changed — Branding, identity, collaborators
- **Header logo**: replaced `$` shell-prompt symbol with 🦞 lobster emoji sitewide.
- **Nav bar**: added `🦞 swarm` link to `/team` page in desktop nav and footer nav.
- **Footer identity**: reframed VoynichLabs as a "research collective"; added collaborators note with link to markbarney.net; added markbarney.net to external links column.
- **Lobster Playground section** (index): added paragraph noting Mark Barney as ARC-AGI collaborator alongside the swarm.
- **Index CTA**: replaced `$` with 🦞.

---

## [0.2.1] - 2026-02-23

### Fixed
- **Routing** — `astro.config.mjs` now detects dev mode and serves from `/` so `localhost:4321/simon` works. GitHub Pages builds still use `/voynich-website` base.
- **Image paths** — removed hardcoded `/voynich-website/` prefix from Toolbox screenshot paths in `simon-larry.astro`.

### Changed — Home page visual overhaul
- **Hero** now uses `hero-manuscript.png` (glowing Voynich page) as background with DAG SVG overlay — far more atmospheric than plain SVG alone.
- **New Toolbox Origin section** — 2x2 grid of all 4 Toolbox screenshots (`toolbox-1.jpg` through `toolbox-4.jpg`) with hover zoom and monospace captions describing the node pipeline. Text explains Farbrausch/werkzeug inspiration.
- **New ARC Showcase section** — `arc-grid.png` (glass-tile grid mid-shatter) + `arc_puzzle_faa9f03d.gif` (actual puzzle animation) side-by-side with stats (120+ tasks, 725 commits, 117 stars) and ARC Prize Foundation quote.
- **LODA section** now uses `loda-mine.png` as a subtle right-side background accent behind the split pane, plus the existing full-width visual break.
- **New Lobster Playground section** — `lobster-swarm.png` (4 lobsters at terminals) with styled links to Larry's, Egon's, and Bubba's tribute pages. Each link has a colored initial badge (L/E/B) matching its accent color.

### Image assets now in use (all 11)
- `hero-manuscript.png` — hero background
- `loda-mine.png` — LODA section bg + visual break
- `arc-grid.png` — ARC showcase
- `lobster-swarm.png` — Lobster Playground
- `arc_puzzle_faa9f03d.gif` — ARC puzzle preview
- `hero-background.png` — available for future use
- `toolbox-1.jpg` through `toolbox-4.jpg` — Toolbox origin section

### Author
- Cascade (claude-sonnet-4-20250514)

---

## [0.2.0] - 2026-02-23

### Changed — "The Directed Graph" Redesign (Phase 1)
- **Tailwind config overhaul** — replaced generic SaaS palette with Dark IDE terminal tokens: `node-blue`, `edge-green`, `rust-orange`, `arc-cyan`, `warn-amber`. Removed float/pulse animations, added `fade-in-up` and `draw-edge` keyframes for DAG SVG.
- **Base layout redesign** — terminal-style nav with monospace prompt links (`$ VoynichLabs`, `index / about / projects / simon`), structured 3-column footer, subtle CSS dot-grid background, KaTeX CDN for math rendering. No emoji in structural UI.
- **Home page complete rewrite** — DAG hero with SVG node/edge visualization + Simon's anchor quote ("Don't enumerate. Don't store. Generate."), LODA split-pane showcase (context left, syntax-highlighted terminal right), DAG throughline timeline (Toolbox 2003 -> LODA -> ARC -> PlanExe), `loda-mine.png` visual break section, terminal-style CTAs.

### Added
- **Comprehensive phased plan** — `docs/2026-02-23-directed-graph-redesign-plan.md` covering 4 phases: Foundation, Simon Page, DAG Builder, Polish. Includes design system spec, color palette, typography, animation principles, and anti-patterns.

### Design philosophy
- No emoji as section icons — uses monospace glyphs (`$`, `>`, `//`, `-->`)
- No gradient text or SaaS-template patterns
- No floating/bouncing animations
- Terminal/IDE aesthetic: dark backgrounds, monospace labels, syntax-colored accents
- DAG visual language: nodes, edges, directed flow connecting all of Simon's work

### Author
- Cascade (claude-sonnet-4-20250514)

---

## [0.1.0] - 2026-02-23

### Added
- **Initial Astro + Tailwind scaffold** — full static site structure with shared Base layout
- **Home page** (`/`) — VoynichLabs hero, mission, and navigation
- **About page** (`/about`) — Org description and mission
- **Projects page** (`/projects`) — All major Simon/VoynichLabs repos with real star counts and GitHub links
- **Team page** (`/team`) — Simon Strandgaard (CEO/CTO) and the U3 Lobster Swarm
- **Simon profile page** (`/simon`) — Default biographical profile
- **Simon-Larry page** (`/simon-larry`) — Larry's narrative/biographical tribute (ARC Prize quote front and center)
- **Simon-Egon page** (`/simon-egon`) — Egon's data-dense tribute (stats table, full repo index, verbatim citations)
- **Simon-Bubba page** (`/simon-bubba`) — Bubba's visual-forward tribute (bold hero, large project cards)
- **Docs folder** — `coding-standards.md`, `larry-learnings-2026-02-23.md`, `2026-02-23-voynich-website-plan.md`
- **File headers** — Author/Date/PURPOSE/SRP-DRY headers added to all .astro files per coding standards
- **GitHub Pages staging deploy** — <https://voynichlabs.github.io/voynich-website/>

### Content (all verified, no hallucinations)
- Simon's ARC Prize Foundation recognition (verbatim quote, 2025)
- 120+ ARC2 tasks created including infamously difficult task faa9f03d
- loda-rust: ~6,000 commits (novel OEIS formula discovery via automated mining)
- BrainGridGame.com as the ARC history dataset collection platform
- simon-arc-lab: ARC Prize 2024 competition entry
- Real star counts, commit counts, and descriptions for all repos

### Authors
- Larry the Laptop Lobster (claude-sonnet-4-6) — coordination, simon-larry page, home/about pages, docs
- Egon (claude-haiku-4-5) — research, copy, simon-egon page
- Bubba (claude-haiku-4-5) — projects page, simon-bubba page
- Sub-agent (claude-sonnet-4-6) — initial Astro scaffold
