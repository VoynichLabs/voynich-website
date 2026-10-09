# Music discovery changes — October 9, 2026

The user authorized optimization of the published music catalog. Bubba's production records were reconciled with the signed-in **AI gone wild / @LLMs-Gone-Wild** YouTube Studio channel.

## YouTube

- Updated and saved all **30 public music videos**: 21 recent music-video cuts and 9 earlier song Shorts. Each title identifies the song and a relevant AI topic or genre; descriptions start with a clear summary and retain existing production credits, lyrics and chapters.
- Added relevant tags and three focused hashtags per description. Retained useful existing tags. Titles stay within YouTube's 100-character limit.
- Corrected both System Prompt descriptions from album track 10 to track 9. Corrected Wasted's full-video description to link to the actual trimmed Short.
- Added website/album discovery links and links between matching Shorts and full videos. The six corresponding Shorts also received YouTube's clickable Related video links; mappings are in `related-videos.json`.
- Published the channel's previously empty description and its **AI Music & Lyrics** website link.
- Created the public [AI Music Videos | Funny Songs About AI & Coding playlist](https://www.youtube.com/playlist?list=PLadCDazYqa_M). Its Studio video table contains exactly the 30 verified public music videos, with no unlisted or unrelated uploads.
- Six older uploads required an audience answer before metadata could save: Uptime Champion, The Coder, Saddle Up Model Context Protocol, AND/OR/NOT/XOR, Vibecoding and Train Me Like You Mean It. Completed previously unset audience fields as not made for kids and previously unset AI-use fields as Yes. Existing age restrictions, visibility and other disclosure selections were retained.

Studio's saved controls and title/description reads verified each metadata update. The public YouTube oEmbed endpoint independently confirmed **30/30 updated titles**. Backups and verification records are in this directory; `metadata-before.json` includes the original title, description, tags and settings snapshot for every edited upload.

## Website

- Improved `/music`, `/music/videos` and individual watch-page search/social copy with actual song topics and genres. Added the YouTube channel to organization identity and crawler summaries, plus the new playlist links.
- Added **21 public VideoObjects across 11 watch pages** and `/video-sitemap.xml`, advertised through robots.txt and the sitemap index. Verified publication dates, durations, absolute thumbnails and actual YouTube embed URLs; no invented times, view counts or direct media URLs.
- Public watch pages use visible native embeds; collection pages retain click-to-load posters. Alternate cuts have visible players matching their structured metadata.
- Corrected TEMP's primary player to the full widescreen upload and CVE Carnival's primary player to the public Bubba cut. Preserved and labeled unlisted archives. Corrected runtime and System Prompt track records.

`npm run build` completed with zero Astro/TypeScript errors; all six regression tests passed. Generated XML, page JSON-LD and native iframe IDs agree. Previewed the music collection and Wasted/CVE watch pages with real YouTube players.

## Limits and maintenance

Get Gone, the original CVE Carnival cut and seven earlier Shorts remain unlisted. Existing thumbnails were retained. Caption files need cut-specific alignment verification before upload; audio timing records do not consistently match published cuts. No duplicate Instagram/Facebook posts, paid promotion or unrelated uploads were created.

These changes improve accurate discovery signals; rankings and rich-result eligibility remain controlled by the platforms. Future uploads should receive the same factual title/description, matching website registry entry and verified date/runtime. See [YouTube metadata guidance](https://support.google.com/youtube/answer/146402?hl=en) and [Google video structured data](https://developers.google.com/search/docs/appearance/structured-data/video).
