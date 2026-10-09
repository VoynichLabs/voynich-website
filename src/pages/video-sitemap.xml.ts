// Author: Codex GPT-6
// Date: 2026-10-09
// PURPOSE: Build the public music-video sitemap as a static XML route. Astro's
// sitemap index and robots.txt advertise it; metadata comes from the same registry
// and serializer used by the individual music watch pages.
// SRP/DRY check: Pass — no separately maintained URLs or publication metadata.
import type { APIRoute } from 'astro';
import { MUSIC_VIDEOS } from '../data/music-videos';
import { videoSitemap } from '../lib/music-video-seo';

export const GET: APIRoute = ({ site }) => new Response(
  videoSitemap(MUSIC_VIDEOS, site ?? new URL('https://voynichlabs.org')),
  { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
);
