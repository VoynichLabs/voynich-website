// Author: Claude Opus 5.5
// Date: 2026-10-04
// PURPOSE: Visual tokens for the videos, mirroring the site's tailwind.config.mjs palette so the
//          code-rendered "Terminal" world matches voynichlabs.org.
// SRP/DRY check: Pass - values copied from tailwind.config.mjs semantic tokens (bg-primary, node-blue, ...).
import { loadFont as loadMono } from '@remotion/google-fonts/JetBrainsMono';
import { loadFont as loadSans } from '@remotion/google-fonts/Inter';

export const mono = loadMono('normal', { weights: ['400', '700'], subsets: ['latin'] }).fontFamily;
export const sans = loadSans('normal', { weights: ['400', '600', '800'], subsets: ['latin'] }).fontFamily;

export const C = {
  bg: '#0c0c14',
  bg2: '#111119',
  surface: '#16161e',
  terminal: '#0a0a0a',
  border: '#1e1e2e',
  borderActive: '#2a2a3e',
  text: '#e8e8f0',
  muted: '#6b7085',
  blue: '#38bdf8',
  green: '#4ade80',
  orange: '#f97316',
  cyan: '#22d3ee',
  amber: '#fbbf24',
  red: '#f87171',
  violet: '#8b5cf6',
};
