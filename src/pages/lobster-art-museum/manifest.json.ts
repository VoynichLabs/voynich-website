// Author: openai-codex/gpt-5.3-codex
// Date: 25 February 2026
// PURPOSE: Publish JSON caption manifest for Lobster Art Museum pieces, including share URLs
//          and tweet-ready copy for bird CLI posting workflows.
// SRP/DRY check: Pass - single endpoint focused on manifest serialization.
import type { APIRoute } from 'astro';
import { getMuseumEntries, buildTweetCopy } from '../../lib/lobster-museum';

export const prerender = true;

const FALLBACK_BASE_URL = 'https://voynich-website-staging.up.railway.app';

export const GET: APIRoute = ({ site }) => {
  const entries = getMuseumEntries();
  const configuredBaseUrl = import.meta.env.PUBLIC_SHARE_BASE_URL?.trim();
  const siteBaseUrl = site?.toString()?.trim();
  const useFallback = !siteBaseUrl || siteBaseUrl.includes('localhost') || siteBaseUrl.includes('voynichlabs.github.io');
  const baseUrl = (configuredBaseUrl || (useFallback ? FALLBACK_BASE_URL : siteBaseUrl)).replace(/\/$/, '');

  const payload = {
    generatedAt: new Date().toISOString(),
    baseUrl,
    count: entries.length,
    entries: entries.map((entry) => {
      const absoluteUrl = `${baseUrl}${entry.href}`;
      const tweet = buildTweetCopy(entry, absoluteUrl);

      return {
        slug: entry.slug,
        filename: entry.filename,
        title: entry.title,
        series: entry.series,
        description: entry.description,
        featured: entry.featured,
        image: `${baseUrl}${entry.src}`,
        permalink: absoluteUrl,
        tags: entry.tags,
        tweet,
        twitterIntent: `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}`,
      };
    }),
  };

  return new Response(JSON.stringify(payload, null, 2), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=300',
    },
  });
};
