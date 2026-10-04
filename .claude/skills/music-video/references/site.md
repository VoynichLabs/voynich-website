# Wiring a video into voynichlabs.org

- **Single source:** `src/data/music-videos.ts` (`MUSIC_VIDEOS`, newest first). Add one entry with `slug`, `title`, `artist`, `album`, `albumHref`, `track`, `youtubeId`, `released`, `runtime`, `hook`, `blurb`, `poster`, `accent`.
  - Optional fields: `cut` (alternate-cut label) and `page` (when an alternate cut shares its parent's making-of page).
  - The entry automatically appears on `/music` (the newest leads), `/music/videos`, and the "More music videos" footers.
- **Big video files live on YouTube, not in git.** Only posters and stills go in `public/video/{slug}/`.
- **Making-of page:** `src/pages/music/video/{slug}.astro`. Copy `system-prompt.astro`; it reads everything from `video/data/{slug}/scenes.json` and uses `YouTubePlayer`, `VideoFeature` and `MusicXNav current="videos"`.
- **Album page:** add a `<VideoFeature variant="inline">` strip under `MusicXNav` (see `latent-space.astro`), and put `youtube: "<id>"` on the track so the now-playing link goes to YouTube.
- **Channel Shorts rail:** `CHANNEL_SHORTS` in the same data file. When a Short gets an animated version, move it into `MUSIC_VIDEOS` (vertical support: see the open item in the animate-Shorts plan).
- **Verify:** run `npm run build`, then preview with the "Astro Preview Server" launch config and check 1440px and 375px for overflow and console errors.
- **Log it:** add a CHANGELOG entry at the top. Check the current top version first, because other sessions also bump it.
