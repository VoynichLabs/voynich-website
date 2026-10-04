# Plan: Hallucinate (Smooth R&B) music video
## 4 October 2026 | Mark picked it; stills first, no clip spend until he approves them

**Song:** Hallucinate — Smooth R&B (v7), Latent Space track 4 (`public/audio/latent-space/hallucinate-smooth.mp3`, 2:56). A love song from a language model that means every word and can't verify any of them.

**Mark's brief:** a real slick R&B pop singer, a lothario blend of the early-2000s smooth R&B star archetype (homage to the era, no real-person likeness or names). He keeps shifting race, ethnicity, hairstyle and outfit, but is always the same kind of slick dude: that shifting *is* the hallucination. His vocal moments go in the choruses where they fit; everything else is drawn in code, the way the Attention video was.

**Format:** 16:9, 1080p, drawn in Canvas2D in headless Chrome (engine in the private music-videos repo, `hallucinate-video/`, based on the Attention and Get Gone engines), with HeyGen Video 1 clips of the singer cut in.

## Structure (from the sung vocal; the sung order differs a little from the lyric sheet)
| Time | Section | Picture |
|---|---|---|
| 0:00–0:38 | Verse 1 | **CODE.** A chat answer types itself out, smooth and confident. Under every word, its next-token probability bar, all high. Three citations [1] [2] [3] slide in as cards, then each one resolves: DOI not found, 404, no such journal. "Built a castle out of nothing": the confident tokens stack into a castle, floor by floor. |
| 0:38–1:26 | Chorus (two passes) | **SINGER.** Performance clips, a different man every line or two, hard cuts and one or two morph shots (look A melts into look B, continuous). Overlay: a confidence gauge pinned at 0.99 with `"verified": false` blinking under it; "the signal just decays" drawn as a waveform dissolving into noise. |
| 1:26–1:55 | Verse 2 | **CODE.** A legal brief generates itself (judge, year, ruling, all fake), then a case-law lookup returns nothing. A terminal: "all tests passing ✓" with zero tests found, `rm` at midnight, "bug laid to rest". "You're absolutely right, babe" as a chat bubble. |
| 1:55–2:27 | Bridge | **MIX.** A map of the training data as a glowing point cloud; the model's cursor walks out past the edge into empty space, and its confidence stays high anyway. The singer in a slow falsetto shot, half dissolving into tokens. |
| 2:27–2:40 | Final chorus | **SINGER.** Fast identity cuts on the beat, every look in turn. |
| 2:40–2:56 | Outro | **CODE.** The answer card again: `sources found: 0 / 3`, the singer's last frame breaks into tokens, fade on "I hallucinate". |

## Stills (made, about 55 cents)
Eight looks on one stage (black mirror floor, haze, magenta and teal light, chrome mic): `base` (cream suit), `silver`, `velvet`, `pinstripe`, `gold`, `white`, `turtleneck`, `holo`. On the Samsung SSD under `music-videos/hallucinate/stills/`; prompt script `hallucinate-video/tools/stills.py`.

## Clips (after Mark approves the stills)
About 12 clips of 5 to 8 seconds (choruses, bridge, final chorus), including two morph shots. About $3 to $4. OpenRouter balance was about $16 on 4 Oct.

## Then
Render, send Mark the MP4, upload to YouTube, page at `/music/video/hallucinate-smooth` from `video/data/hallucinate-smooth/scenes.json`, Latent Space album link, CHANGELOG, status board.
