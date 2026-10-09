// Author: Codex GPT-6
// Date: 2026-10-09
// PURPOSE: Convert verified music-video records into Google VideoObject metadata
// and a video sitemap. Watch pages and the static XML endpoint share these values;
// the registry supplies dates, visibility, runtimes, descriptions and thumbnails.
// SRP/DRY check: Pass — reuses MusicVideo records; never invents publication times,
// view counts, media-file URLs or indexing claims for unlisted uploads.
import type { MusicVideo } from '../data/music-videos';

export const videoName = (video: MusicVideo) =>
  `${video.title}${video.cut ? ` (${video.cut})` : ''} — ${video.artist}`;

export const durationSeconds = (runtime: string) => {
  const match = /^(\d+):([0-5]\d)$/.exec(runtime);
  if (!match) throw new Error(`Invalid published music-video runtime: ${runtime}`);
  return Number(match[1]) * 60 + Number(match[2]);
};

export function videoSchema(video: MusicVideo, site: URL, pagePath: string) {
  const seconds = durationSeconds(video.runtime);
  return {
    '@type': 'VideoObject',
    '@id': `${new URL(pagePath, site).href}#video-${video.youtubeId}`,
    name: videoName(video),
    description: video.searchDescription,
    thumbnailUrl: [new URL(video.poster, site).href],
    uploadDate: video.uploadDate,
    duration: `PT${Math.floor(seconds / 60)}M${seconds % 60}S`,
    embedUrl: `https://www.youtube-nocookie.com/embed/${video.youtubeId}`,
    url: `https://www.youtube.com/watch?v=${video.youtubeId}`,
    inLanguage: 'en',
    genre: video.genre,
    publisher: { '@type': 'Organization', name: 'VoynichLabs', url: site.origin },
    mainEntityOfPage: new URL(pagePath, site).href,
  };
}

const escapeXml = (value: string) => value.replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;',
})[character]!);

/** Only public videos represented by visible players on their watch page qualify. */
export function videoSitemap(videos: MusicVideo[], site: URL) {
  const pages = new Map<string, MusicVideo[]>();
  for (const video of videos.filter((item) => item.visibility === 'public')) {
    const path = video.page ?? `/music/video/${video.slug}`;
    const cuts = pages.get(path) ?? [];
    cuts.push(video);
    pages.set(path, cuts);
  }
  const urls = [...pages].map(([path, cuts]) => `<url><loc>${escapeXml(new URL(path, site).href)}</loc>${cuts.map((video) =>
    `<video:video><video:thumbnail_loc>${escapeXml(new URL(video.poster, site).href)}</video:thumbnail_loc>` +
    `<video:title>${escapeXml(videoName(video))}</video:title>` +
    `<video:description>${escapeXml(video.searchDescription)}</video:description>` +
    `<video:player_loc>${escapeXml(`https://www.youtube-nocookie.com/embed/${video.youtubeId}`)}</video:player_loc>` +
    `<video:duration>${durationSeconds(video.runtime)}</video:duration>` +
    `<video:publication_date>${video.uploadDate}</video:publication_date></video:video>`
  ).join('')}</url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">\n${urls}\n</urlset>\n`;
}
