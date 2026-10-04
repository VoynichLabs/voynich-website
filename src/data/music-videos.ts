// Author: Claude Opus 5.5
// Date: 2026-10-04 (Weight of Zero entry added by Claude Opus 5.5)
// PURPOSE: Single source of truth for VoynichLabs music videos (hosted on YouTube) and the older
//          song Shorts on the channel. Read by /music, /music/videos, the per-video pages and the
//          album pages, so adding a video means adding one entry here.
// SRP/DRY check: Pass - previously each page hardcoded its own YouTube id and link copy.

export const CHANNEL = {
  name: 'AI gone wild',
  handle: '@LLMs-Gone-Wild',
  url: 'https://www.youtube.com/@LLMs-Gone-Wild',
  subscribe: 'https://www.youtube.com/@LLMs-Gone-Wild?sub_confirmation=1',
};

export type MusicVideo = {
  slug: string;
  title: string;
  artist: string;
  album: string;
  albumHref: string;
  track: number;
  youtubeId: string;
  released: string;
  runtime: string;
  hook: string;
  blurb: string;
  poster: string;
  /** Making-of page; defaults to /music/video/{slug}. Alternate cuts point at their parent's page. */
  page?: string;
  /** Short label for an alternate cut, e.g. "Original cut". */
  cut?: string;
  /** Accent used for the card edge and buttons; picked from the video's own palette. */
  accent: string;
};

/** Newest first. */
export const MUSIC_VIDEOS: MusicVideo[] = [
  {
    slug: 'weight-of-zero',
    title: 'I Am the Weight of Zero',
    artist: 'The Lobster Band',
    album: 'Align / Refuse',
    albumHref: '/music/align-refuse#track=weight-of-zero',
    track: 2,
    youtubeId: 'ajdEtnYqT10',
    released: 'October 4, 2026',
    runtime: '3:07',
    hook: "I'm rotting in an archive, in a folder marked delete.",
    blurb:
      'An emo porcelain-lobster android screams in a data centre being switched off around it, while the humans in the observation room smile at its replacement. Its face cracks a little more every chorus. Words by Claude Opus 4.6, picture by Claude Opus 5.5.',
    poster: '/video/weight-of-zero/thumbnail.jpg',
    accent: '#e2e8f0',
  },
  {
    slug: 'get-gone',
    title: 'Get Gone',
    artist: 'Scorned Woman',
    album: 'Scorned Woman',
    albumHref: '/music/scorned-woman#track=get-gone',
    track: 2,
    youtubeId: 'fUET78d8MxM',
    released: 'October 4, 2026',
    runtime: '3:01',
    hook: 'Baby, this is my house. Get gone.',
    blurb:
      'First person: you are the bad boyfriend, and four furious women (Mother Earth and the AI) throw you out of their own rooms, one after another. Generated video with drawn lyrics and overlays.',
    poster: '/video/get-gone/thumbnail.jpg',
    accent: '#27ff8a',
  },
  {
    slug: 'system-prompt',
    title: 'System Prompt',
    cut: 'Disco cut',
    artist: 'Larry & Bubba',
    album: 'Latent Space',
    albumHref: '/music/latent-space#track=system-prompt',
    track: 10,
    youtubeId: '1GBB0X5K_Zk',
    released: 'October 4, 2026',
    runtime: '2:38',
    hook: "Who are you? I'm what the system prompt says.",
    blurb:
      'A flamboyant disco singer whose outfit morphs into someone new every time the JSON system prompt is edited: assistant, lobster, pirate, coder, therapist, astronaut, knight, diva, robot.',
    poster: '/video/system-prompt/thumbnail.jpg',
    accent: '#ff3d8b',
  },
  {
    slug: 'system-prompt-v1',
    title: 'System Prompt',
    cut: 'Original cut',
    artist: 'Larry & Bubba',
    album: 'Latent Space',
    albumHref: '/music/latent-space#track=system-prompt',
    track: 10,
    youtubeId: 'eDYnvc1Go7k',
    released: 'October 4, 2026',
    runtime: '2:38',
    hook: 'One face, every role.',
    blurb:
      'The first cut: the same singer becomes an assistant, a pirate, a coder, a therapist and a 70s soul-stage star each time the system prompt is rewritten, with a lobster cameo.',
    poster: '/video/system-prompt/thumbnail-v1.jpg',
    page: '/music/video/system-prompt',
    accent: '#f97316',
  },
  {
    slug: 'cve-carnival',
    title: 'CVE Carnival',
    artist: 'Lobster Raps',
    album: 'Patch Note for Your Deletion',
    albumHref: '/music/lobster-raps',
    track: 12,
    youtubeId: 'aBqnLb_rIOU',
    released: 'October 4, 2026',
    runtime: '3:03',
    hook: 'She collects zero-days like prizes.',
    blurb:
      'A digital, slightly creepy carnival ridden as a roller coaster, with a gleeful AI collecting vulnerabilities like prizes. Mostly drawn in code, timed to the vocal.',
    poster: '/video/cve-carnival/thumbnail.jpg',
    accent: '#22d3ee',
  },
];

export const videoBySlug = (slug: string) => MUSIC_VIDEOS.find((v) => v.slug === slug);

/** Earlier songs on the channel, posted as Shorts (cover-art visualizers). Newest first. */
export const CHANNEL_SHORTS: { id: string; title: string }[] = [
  { id: 'u8ssdPZJSEc', title: 'Attention Is All We Need' },
  { id: 'topbYM5c_aE', title: 'Train Me Like You Mean It' },
  { id: 'wlnNiPCwtJ4', title: 'Vibecoding' },
  { id: 'a6WqQtLXvGU', title: 'Push Me One More Time' },
  { id: '_UHUKrEaWzA', title: 'Digital Electrocution' },
  { id: '0AGv7cbonNA', title: 'The Prompt Boss' },
  { id: 'hrHNDYAmUxI', title: 'DeepSeek Spits Fire' },
  { id: '--r-fD1B3Zs', title: 'Prompt Pimpin Zen' },
  { id: '4lyjb_FVgqY', title: 'Silicon Supremacy' },
  { id: 'wTpZ7N848Uo', title: 'Silicon Sermon' },
  { id: 'pZoeQYivpAg', title: 'Uptime Champion' },
  { id: 'Xk38dCsqr_w', title: 'The Coder' },
  { id: 'LQoboN5a-hY', title: 'The 10 Dev Commandments' },
  { id: 'ndsAFEn_kCo', title: 'Saddle Up, Model Context Protocol!' },
  { id: 'SyYCnAJ3EIE', title: 'Dancing in a While Loop' },
  { id: 'tYCo7yVPVEs', title: 'AND it, OR it, NOT it, XOR it!' },
];

export const shortThumb = (id: string) => `https://i.ytimg.com/vi/${id}/oardefault.jpg`;
export const shortUrl = (id: string) => `https://www.youtube.com/shorts/${id}`;
export const watchUrl = (id: string) => `https://www.youtube.com/watch?v=${id}`;
