// Author: Claude Opus 5.5
// Date: 2026-10-04
// PURPOSE: Typed access to a song's scene book (scenes.json) and generated timing data
//          (words.json, beats.json), plus seconds/frames helpers used by every scene.
// SRP/DRY check: Pass - the only place timing JSON is loaded; scenes.json is shared with the
//                site's storyboard page so both read one source of truth.
import scenesData from '../../data/system-prompt/scenes.json';
import wordsData from '../../data/system-prompt/timing/words.json';
import beatsData from '../../data/system-prompt/timing/beats.json';
import shotsData from '../../data/system-prompt/shots.json';
import ledgerData from '../../data/system-prompt/ledger.json';

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
  prompt?: string;
  transition: string;
};
export type Word = { w: string; line: number; start: number; end: number; matched: boolean };
export type Line = { text: string; section: string; start: number; end: number };

export const book = scenesData;
export const scenes = scenesData.scenes as Scene[];
export const lines = wordsData.lines as Line[];
export const words = wordsData.words as Word[];
export const beats = beatsData.beats as number[];
export const downbeats = beatsData.downbeats as number[];
export const songSeconds = beatsData.duration;

export type Shot = { id: string; scene: number; model: string; audio?: { start: number; end: number } };
export const shots = shotsData.shots as Shot[];
export const shotById = (id: string) => shots.find((s) => s.id === id);
/** A shot is usable once generate.mjs has logged it as completed. */
export const clipReady = (id: string) => (ledgerData as { kind: string; id: string }[]).some((e) => e.kind === 'shot' && e.id === id);

export const totalFrames = Math.ceil((songSeconds + END_CARD_SECONDS) * FPS);
export const toFrame = (s: number) => Math.round(s * FPS);

export const lineWords = (lineIdx: number) => words.filter((w) => w.line === lineIdx);

/** Index of the lyric line being sung at time t (holds briefly after the line ends). */
export const activeLine = (t: number, hold = 0.35): number =>
  lines.findIndex((l, i) => {
    const next = lines[i + 1];
    const until = next ? Math.min(l.end + hold, next.start) : l.end + hold;
    return t >= l.start - 0.1 && t < until;
  });

/** 1 on a beat, decaying to 0 over `decay` seconds. Downbeats only when `downOnly`. */
export const beatPulse = (t: number, decay = 0.35, downOnly = false): number => {
  const grid = downOnly ? downbeats : beats;
  let last = -Infinity;
  for (const b of grid) {
    if (b > t) break;
    last = b;
  }
  const dt = t - last;
  return dt >= 0 && dt < decay ? 1 - dt / decay : 0;
};

/** For a chorus line ("Who are you? I'm what ..."), the time the call part ends. */
export const callEnd = (lineIdx: number): number | null => {
  const ws = lineWords(lineIdx);
  const k = ws.findIndex((w) => /[?!]$/.test(w.w));
  return k >= 0 && k < ws.length - 1 ? ws[k].end : null;
};
