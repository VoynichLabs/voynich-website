import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import rehypeOptimizedImages from './src/lib/rehype-optimized-images.ts';

const SITE = 'https://voynichlabs.org';

// Old URLs kept alive after the 2026-07-13 restructure
// (docs/2026-07-13-second-pass-restructure-plan.md).
const redirects = {
  '/latent-space': '/music/latent-space',
  '/pox-upon-you': '/music/pox-upon-you',
  '/scorned-woman': '/music/scorned-woman',
  '/lobster-raps': '/music/lobster-raps',
  '/lobster-band': '/music/align-refuse',
  '/hallucinate': '/music/hallucinate',
  '/drafts': '/music/drafts',
  '/bonus': '/music/drafts',
  '/docs/latentscript': '/lobster-incubator/latentscript',
  '/lab/autonovel': '/autonovel',
};

// Kept out of the sitemap: the redirect stubs above, plus pages marked noindex
// (keep in sync with the `noindex` prop on those pages).
const NOT_IN_SITEMAP = new Set([...Object.keys(redirects), '/music/drafts']);

export default defineConfig({
  integrations: [
    tailwind(),
    react(),
    sitemap({
      filter: (page) => !NOT_IN_SITEMAP.has(new URL(page).pathname.replace(/\/$/, '')),
      // Canonicals and internal links use the no-trailing-slash form; match them.
      serialize: (item) => ({ ...item, url: item.url === `${SITE}/` ? item.url : item.url.replace(/\/$/, '') }),
    }),
  ],
  site: SITE,
  base: '/',
  redirects,
  markdown: {
    rehypePlugins: [rehypeOptimizedImages],
  },
});
