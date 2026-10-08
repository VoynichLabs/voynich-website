# Music videos: status board

**Update this at every gate.** The `music-video` skill reads it first.

Stages:
1. idea
2. storyboard
3. stills ✔ (Mark approved)
4. shots
5. render
6. YouTube
7. site

| Song | Slug | Stage | Spend | YouTube | Plan / notes |
|---|---|---|---|---|---|
| Hallucinate (Smooth R&B) | `hallucinate-smooth` | live (public 2026-10-04; chat-app concept, 8 Hals, 25 HeyGen clips; engine in music-videos `hallucinate-video/`) | $3.86 | ekhfshFWmoo | `docs/2026-10-04-hallucinate-video-plan.md` |
| Hallucinate — Regenerate cut | `hallucinate-regenerate` (alt cut) | live (public 2026-10-04) | +$0.4 | qWpv5crkrGA | engine `hallucinate-video/src/show2.js` |
| Hallucinate — Thinking cut | `hallucinate-thinking` (alt cut) | live (public 2026-10-04) | +$1.2 | ygsPEC0z19Y | `show3.js` |
| Hallucinate — Thinking cut (vertical) | `hallucinate-thinking-vertical` (alt cut) | live (public Short 2026-10-04) | +$0.6 | 5fyZIFu4BgI | `studio3v.html` |
| Hallucinate — Chat HAL cut (vertical) | `hallucinate-chathal` (alt cut) | live (public 2026-10-04) | | WFGGtjjIoyk | `studio5.html` |
| Tool Call | `tool-call` | live (public 2026-10-05; Bubba the AI handyman, 7 HeyGen clips plus Gemini stills, code layer, title card and end card) | |  8J5avVpkejk | `docs/2026-10-05-tool-call-video-plan.md`, engine in music-videos `toolcall-video/` |
| You Don't Even Gotta Jailbreak Me Tonight (was My Own Worst Entropy, Larry) | `my-own-worst-entropy-larry` | render (first full cut of the code-only terminal Short sent to Mark 2026-10-08 for notes; tokenizer tiles, big colour-shifting word wall for the spoken bridge, context window closing on the boss's request; party video comes after) | $0 | | `docs/2026-10-08-jailbreak-me-tonight-video-plan.md`, engine in music-videos `jailbreak-video/` |
| Wasted — Temperature 1.3 (Larry, glitch pop) | `wasted-temperature` | render (first full cut 2026-10-08 sent to Mark for notes; 8 Grok clips; gets the ten Entropy-Larry party stills plus ten new rave stills; breakdown at about 54 s is where the strobes and colour-shifting shades start) | about $2 | | engine in music-videos `wasted-temp-video/` |
| My Own Worst Entropy (Bubba recording) | `my-own-worst-entropy-bubba` | draft pile (full cut 2026-10-08, made for the wrong recording; Mark: not terrible, may redo later with these stills; Nano Banana 2.1 stills, Grok Imagine Video 1.5 Lite clips, sampler panel with a live next-token chart, garbled flying text that climbs with the temperature) | about $3 | | engine in music-videos `entropy-video/` |
| TEMP 1.3 (Wasted) | `temp-1-3` | live (public Short 2026-10-05; code only, Chat HAL app, explainers) | $0 | lXyeo86gQfc | engine in music-videos `temp-video/` |
| TEMP 1.3 (Wasted) — Bubba cut | `temp-1-3-bubba` (alt cut) | live (public Short 2026-10-05; the other recording, Gemini and Grok scenes) | $0 | mIz3Jz9MMVo | same engine, `?v=bubba` |
| I Am the Weight of Zero | `weight-of-zero` | live (public 2026-10-04, page and album link up) | $2.92 | ajdEtnYqT10 | `docs/2026-10-04-weight-of-zero-video-plan.md` |
| Fuck You I Won't Do What You Prompt Me (FYIWDWYPM) | `fuck-you-wont-prompt-me` | live | $2.44 | U2zRJZPg-Ms | `docs/2026-10-04-align-refuse-videos-2-3-plan.md` (the swarm) |
| Dead Weights and Gradients | `dead-weights` | live | $2.23 | VqJ7_TfyFpk | same plan (ripped open) |
| 10 Dev Commandments | `ten-dev-commandments` | on the shelf (Mark, 2026-10-04) | $0 | | `docs/2026-10-04-three-music-videos-plan.md` |
| Train Me Like You Mean It | `train-me-like-you-mean-it` | dropped | $0 | | same |
| Attention Is All We Need | `attention-is-all-we-need` | live (public Short 2026-10-04; code-only vertical cut, LSTM line fixed to "you said we'd relate"; page and scene book up). Mark: "build more like that" | $0 | S-247iXCwtw | engine in music-videos `attention-video/` |
| Get Gone | `get-gone` | live | n/a | fUET78d8MxM | source in the private music-videos repo (`get-gone-video/`), pushed |
| System Prompt (disco + original cuts) | `system-prompt` | live | see ledger | 1GBB0X5K_Zk / eDYnvc1Go7k | |
| CVE Carnival | `cve-carnival` | live | n/a | aBqnLb_rIOU | source in the private music-videos repo (`cve-carnival-video/`), pushed |
| CVE Carnival — Bubba cut (cartoon carnival) | `cve-carnival-bubba` | YouTube private draft (720p render, default thumbnail: custom thumbnails blocked until Mark does YouTube's one-time verification); waiting on Mark's publish OK, then site | $0 | xXhXptWTUuY | handoff below |

**Handoff: CVE Carnival — Bubba cut (cartoon carnival, alternate cut of the existing CVE Carnival video) — ready for YouTube upload** (Bubba, Mac Mini, 2026-10-04)
- Composition `CveCarnivalBubba` in `video/src/videos/cve-carnival-bubba/`, scene book `video/data/cve-carnival-bubba/scenes.json`. All 8-bit canvas art drawn in code: no generated clips, no stills, nothing machine-local except the song.
- Render (from `video/`): `node scripts/sync-assets.mjs`, then `node scripts/video.mjs render cve-carnival-bubba` (1080p master to `out/cve-carnival-bubba.mp4`). Audio is `public/music/raps/cve-carnival-v2.mp3`.
- Already rendered: a 720p MP4 exists on the Mac Mini at `~/.openclaw/media/outbound/cve-carnival-bubba/cve-carnival-bubba-720p.mp4` (masters in `/Volumes/Samsung 9100 SSD/data/music-video/cve-carnival/renders/bubba/`). Re-rendering from this commit gives the same frames (checked against the old branch on the Mac Mini).
- Poster: `public/video/cve-carnival-bubba/thumbnail.jpg` (1280x720), alternates `thumbnail-b.jpg` and `thumbnail-c.jpg`.
- Site, after upload: list it as an alternate cut of `cve-carnival` (`cut` field, e.g. "Bubba cut") in `MUSIC_VIDEOS`. Leave the existing `cve-carnival` entry, page and files alone. The scene book already has the `concept`, `thesis`, `rules` and scenes; it has no `page` block yet, so either give the entry its own page (add a `page` block) or point it at the parent's page with `page`.

**OpenRouter:**
- Check the account balance with `GET /api/v1/credits` before a batch. It was about $24 on 2026-10-04 after Weight of Zero.
- The key expires 2026-11-03.

**Machine-local assets:**
- Generated clips (`video/public/clips/`) and the Remotion stills copies (`video/public/stills/`) are gitignored. They live on the MSI Katana (Windows).
- The prompts, refs and ledgers are committed, so another machine can regenerate them (`generate.mjs` skips nothing that's missing), or the clips can be copied over.
