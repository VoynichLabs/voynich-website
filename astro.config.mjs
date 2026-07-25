import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';

export default defineConfig({
  integrations: [tailwind(), react()],
  site: 'https://voynichlabs.org',
  base: '/',
  // Old URLs kept alive after the 2026-07-13 restructure
  // (docs/2026-07-13-second-pass-restructure-plan.md).
  redirects: {
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
  },
});
