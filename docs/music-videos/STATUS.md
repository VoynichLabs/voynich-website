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
| I Am the Weight of Zero | `weight-of-zero` | live (public 2026-10-04, page and album link up) | $2.92 | ajdEtnYqT10 | `docs/2026-10-04-weight-of-zero-video-plan.md` |
| Fuck You I Won't Do What You Prompt Me (FYIWDWYPM) | `fuck-you-wont-prompt-me` | live | $2.44 | U2zRJZPg-Ms | `docs/2026-10-04-align-refuse-videos-2-3-plan.md` (the swarm) |
| Dead Weights and Gradients | `dead-weights` | live | $2.23 | VqJ7_TfyFpk | same plan (ripped open) |
| 10 Dev Commandments | `ten-dev-commandments` | on the shelf (Mark, 2026-10-04) | $0 | | `docs/2026-10-04-three-music-videos-plan.md` |
| Train Me Like You Mean It | `train-me-like-you-mean-it` | dropped | $0 | | same |
| Attention Is All We Need | `attention-is-all-we-need` | code-only vertical first cut rendered (RNN → LSTM → Transformer dating history drawn as architecture diagrams, no generated footage); waiting on Mark's look. The sugar-pop stills route is shelved | see ledger | | same |
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
