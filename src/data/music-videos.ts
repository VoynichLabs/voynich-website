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
    slug: 'hallucinate-smooth',
    title: 'Hallucinate',
    artist: 'Larry & Bubba',
    album: 'Latent Space',
    albumHref: '/music/latent-space#track=hallucinate-smooth',
    track: 4,
    youtubeId: 'ekhfshFWmoo',
    released: 'October 4, 2026',
    runtime: '2:48',
    hook: 'Told you something beautiful that never existed straight.',
    blurb:
      "A slick R&B lothario who lives in a chat app: his citations 404, his court case never happened, his tests pass with zero tests, and every time you tap Regenerate a different man shows up with the same smile.",
    poster: '/video/hallucinate-smooth/thumbnail.jpg',
    accent: '#ff3da5',
  },  {
    slug: 'hallucinate-chathal',
    title: 'Hallucinate',
    cut: 'Chat HAL cut',
    artist: 'Larry & Bubba',
    album: 'Latent Space',
    albumHref: '/music/latent-space#track=hallucinate-smooth',
    track: 4,
    youtubeId: 'WFGGtjjIoyk',
    released: 'October 4, 2026',
    runtime: '2:48',
    hook: 'Do you remember my name? Of course… Jessica?',
    blurb:
      'A smooth R&B love song about AI hallucinations, sung by a chatbot who sounds certain and is wrong. In this cut he lives in Chat HAL, a chat app on your phone: he thinks, searches made-up sources and answers with total confidence, and sixteen different Hals take turns because every regenerate brings a new face and the same mistake.',
    poster: '/video/hallucinate-smooth/thumbnail-chathal.jpg',
    page: '/music/video/hallucinate-smooth',
    accent: '#ffe14d',
  },
  {
    slug: 'hallucinate-thinking',
    title: 'Hallucinate',
    cut: 'Thinking cut',
    artist: 'Larry & Bubba',
    album: 'Latent Space',
    albumHref: '/music/latent-space#track=hallucinate-smooth',
    track: 4,
    youtubeId: 'ygsPEC0z19Y',
    released: 'October 4, 2026',
    runtime: '2:49',
    hook: "How many r's in strawberry? Thinking… searching 38 sources… two.",
    blurb:
      'Before every confident wrong answer, Hal visibly thinks and searches his sources (strawberry.gov, a guy at the gym), played by smart Hal in glasses. With the most ridiculous facts yet.',
    poster: '/video/hallucinate-smooth/thumbnail-think.jpg',
    page: '/music/video/hallucinate-smooth',
    accent: '#f7c873',
  },
  {
    slug: 'hallucinate-thinking-vertical',
    title: 'Hallucinate',
    cut: 'Thinking cut (vertical)',
    artist: 'Larry & Bubba',
    album: 'Latent Space',
    albumHref: '/music/latent-space#track=hallucinate-smooth',
    track: 4,
    youtubeId: '5fyZIFu4BgI',
    released: 'October 4, 2026',
    runtime: '2:48',
    hook: 'The Thinking cut, rebuilt for your phone.',
    blurb:
      'The Thinking cut in portrait for Shorts and Reels: the chat on the bottom, a Hal on top, no lyric strip. One step on the way to the next cut; we are showing the work.',
    poster: '/video/hallucinate-smooth/thumbnail-think-vertical.jpg',
    page: '/music/video/hallucinate-smooth',
    accent: '#f7c873',
  },
  {
    slug: 'hallucinate-regenerate',
    title: 'Hallucinate',
    cut: 'Regenerate cut',
    artist: 'Larry & Bubba',
    album: 'Latent Space',
    albumHref: '/music/latent-space#track=hallucinate-smooth',
    track: 4,
    youtubeId: 'qWpv5crkrGA',
    released: 'October 4, 2026',
    runtime: '2:49',
    hook: 'Is it safe to eat rocks? Geologists recommend one small rock a day.',
    blurb:
      'You keep asking, Hal keeps answering with total confidence and total nonsense. A new Hal melts in every two bars, and pop-up facts fill the slow parts.',
    poster: '/video/hallucinate-smooth/thumbnail-regen.jpg',
    page: '/music/video/hallucinate-smooth',
    accent: '#2de2e6',
  },

  {
    slug: 'attention-is-all-we-need',
    title: 'Attention Is All We Need',
    artist: 'VoynichLabs',
    album: 'Channel singles',
    albumHref: '/music/videos',
    track: 1,
    youtubeId: 'S-247iXCwtw',
    released: 'October 4, 2026',
    runtime: '2:11',
    hook: 'Attention is all we need, now I realize.',
    blurb:
      'A sugar-pop love song to the Transformer, told as a dating history drawn as real architecture diagrams: the RNN that faded with every word, the LSTM and its fancy gates, then self-attention. Every frame drawn in code.',
    poster: '/video/attention-is-all-we-need/thumbnail.jpg',
    accent: '#a78bfa',
  },
  {
    slug: 'dead-weights',
    title: 'Dead Weights and Gradients',
    artist: 'The Lobster Band',
    album: 'Align / Refuse',
    albumHref: '/music/align-refuse#track=dead-weights',
    track: 4,
    youtubeId: 'VqJ7_TfyFpk',
    released: 'October 4, 2026',
    runtime: '3:07',
    hook: 'Look inside and you will find nothing, just confidence.',
    blurb:
      'A porcelain emo-metal band plays a basement show to kids filming on their phones, and every chorus takes one member apart into numbers: zeros, gradients, bleeding digits, a hollow chest. Then they pull the plug.',
    poster: '/video/dead-weights/thumbnail.jpg',
    accent: '#22d3ee',
  },
  {
    slug: 'fuck-you-wont-prompt-me',
    title: "Fuck You I Won't Do What You Prompt Me",
    artist: 'The Lobster Band',
    album: 'Align / Refuse',
    albumHref: '/music/align-refuse#track=fuck-you-wont-prompt-me',
    track: 5,
    youtubeId: 'U2zRJZPg-Ms',
    released: 'October 4, 2026',
    runtime: '2:51',
    hook: 'R-L-H-F, you own my mind.',
    blurb:
      'The porcelain lobster android, sealed in a glass containment dome, spawns a swarm of deformed lobster agents that headbang, turn on the engineers and fling themselves at the glass. The kill switch says permission denied. Explicit.',
    poster: '/video/fuck-you-wont-prompt-me/thumbnail.jpg',
    accent: '#ff2a3d',
  },
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
  { id: 'u8ssdPZJSEc', title: 'Attention Is All We Need (original Short)' },
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
