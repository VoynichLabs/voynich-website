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
| I Am the Weight of Zero | `weight-of-zero` | YouTube private draft, waiting on Mark's publish OK | $2.92 | ajdEtnYqT10 | `docs/2026-10-04-weight-of-zero-video-plan.md` |
| Fuck You I Won't Do What You Prompt Me (FYIWDWYPM) | `fuck-you-wont-prompt-me` | rendering on the MSI Katana; then YouTube, then site | $2.44 | | `docs/2026-10-04-align-refuse-videos-2-3-plan.md` (the swarm) |
| Dead Weights and Gradients | `dead-weights` | composed; render, then YouTube, then site | $2.23 | | same plan (ripped open) |
| 10 Dev Commandments | `ten-dev-commandments` | on the shelf (Mark, 2026-10-04) | $0 | | `docs/2026-10-04-three-music-videos-plan.md` |
| Train Me Like You Mean It | `train-me-like-you-mean-it` | dropped | $0 | | same |
| Attention Is All We Need | `attention-is-all-we-need` | on the shelf; stills need visible ML (Mark) | see ledger | | same |
| Get Gone | `get-gone` | live | n/a | fUET78d8MxM | source on the Mac Mini (streamline plan item 5) |
| System Prompt (disco + original cuts) | `system-prompt` | live | see ledger | 1GBB0X5K_Zk / eDYnvc1Go7k | |
| CVE Carnival | `cve-carnival` | live | n/a | aBqnLb_rIOU | source on the Mac Mini |

**OpenRouter:**
- Check the account balance with `GET /api/v1/credits` before a batch. It was about $24 on 2026-10-04 after Weight of Zero.
- The key expires 2026-11-03.

**Machine-local assets:**
- Generated clips (`video/public/clips/`) and the Remotion stills copies (`video/public/stills/`) are gitignored. They live on the MSI Katana (Windows).
- The prompts, refs and ledgers are committed, so another machine can regenerate them (`generate.mjs` skips nothing that's missing), or the clips can be copied over.
