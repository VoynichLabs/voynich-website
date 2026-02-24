import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// Routing: dev and Railway serve from /. GitHub Pages needs /voynich-website subpath.
const isDev = process.argv.includes('dev');
const isRailway = !!process.env.RAILWAY_ENVIRONMENT;
const useRootBase = isDev || isRailway;

export default defineConfig({
  integrations: [tailwind()],
  site: useRootBase
    ? (isRailway ? 'https://voynich-website-production.up.railway.app' : 'http://localhost:4321')
    : 'https://voynichlabs.github.io',
  base: useRootBase ? '/' : '/voynich-website',
});
