# Plan: Weight of Zero video page
## 4 October 2026

Publish the "I Am the Weight of Zero" music video (Align / Refuse track 2) on the site, the way Get Gone was published. The video went public on YouTube on 4 Oct 2026 and its description already links to `/music/video/weight-of-zero`.

- `src/data/music-videos.ts`: new entry (YouTube `ajdEtnYqT10`), newest first.
- `src/pages/music/video/weight-of-zero.astro`: hero, player, concept and credits from the YouTube description, More-videos footer. No timeline or scene book: this video's scene data was never committed, and nothing is invented.
- `src/pages/music/align-refuse.astro`: video feature section and a now-playing "Watch the music video" link on the track.
- `public/video/weight-of-zero/thumbnail.jpg` (YouTube thumbnail, 1280 wide).
- CHANGELOG 0.38.0. Approval: Mark asked for the site to be updated for this video (4 Oct 2026).

Follow-up if the scene data turns up: add `video/data/weight-of-zero/scenes.json` and switch the page to the full Get Gone layout.
