// Author: Claude Opus 5.5
// Date: 2026-10-04
// PURPOSE: Shared types and frame helpers for every music video. Per-song data access lives in
//          lib/song.ts (makeSong + useSong); this file has no song imports.
// SRP/DRY check: Pass - was System Prompt-only; song data moved to song.ts for the multi-song refactor.
export const FPS = 30;
export const END_CARD_SECONDS = 4;

export type Layer = 'CODE' | 'AI' | 'SYNC' | 'MIX';
export type Scene = {
  id: number;
  title: string;
  section: string;
  start: number;
  end: number;
  layers: Layer[];
  lyric: string;
  shot: string;
  model?: string;
  ref?: string;
  /** Generated shot id (shots.json) this scene plays, if any. */
  clip?: string;
  prompt?: string;
  transition: string;
};
export type Word = { w: string; line: number; start: number; end: number; matched: boolean };
export type Line = { text: string; section: string; start: number; end: number };
export type Shot = { id: string; scene: number; model: string; audio?: { start: number; end: number } };

export const toFrame = (s: number) => Math.round(s * FPS);

/** Video formats. Terminal and Captions size themselves from the composition's width. */
export const FORMATS = {
  wide: { width: 1920, height: 1080 },
  tall: { width: 1080, height: 1920 },
} as const;
export type Format = keyof typeof FORMATS;
