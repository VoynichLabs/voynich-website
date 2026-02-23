import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// On Railway, RAILWAY_ENVIRONMENT is set automatically — serve from root.
// On GitHub Pages, serve from /voynich-website subpath.
const isRailway = !!process.env.RAILWAY_ENVIRONMENT;

export default defineConfig({
  integrations: [tailwind()],
  site: isRailway ? 'https://voynich-website-production.up.railway.app' : 'https://voynichlabs.github.io',
  base: isRailway ? '/' : '/voynich-website',
});
