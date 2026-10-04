// Author: Claude Opus 5.5
// Date: 2026-10-04
// PURPOSE: Song-agnostic timing access. makeSong() turns one song's data files (scenes.json,
//          timing/words.json, timing/beats.json, shots.json, ledger.json) into typed helpers;
//          SongProvider/useSong() hand the current song to shared components (Captions, Clip,
//          CodeStage) so they never import a particular song's JSON.
// SRP/DRY check: Pass - replaces the System Prompt-only lib/timing.ts module imports; types and
//                frame helpers stay in lib/timing.ts.
//                2026-10-04 (Bubba, CVE Carnival Bubba cut): adds lastBeat() and beatIndex() for
//                beat-stepped animation; beatPulse() now reads lastBeat() with identical results.
import { createContext, createElement, useContext } from 'react';
import { END_CARD_SECONDS, FPS, Line, Scene, Shot, Word } from './timing';

/** Fields every scene book has; the rest of scenes.json passes through with its JSON-inferred type. */
export type BookBase = { slug: string; title: string; artist: string; album: string; audio: string; scenes: unknown[]; endCardSeconds?: number };

export type SongData<B extends BookBase = BookBase> = {
  scenes: B;
  words: { lines: unknown[]; words: unknown[] };
  beats: { duration: number; beats: number[]; downbeats: number[] };
  shots?: { shots: unknown[] };
  ledger?: unknown[];
};

export const makeSong = <B extends BookBase>(d: SongData<B>) => {
  const book = d.scenes;
  const scenes = d.scenes.scenes as Scene[];
  const lines = d.words.lines as Line[];
  const words = d.words.words as Word[];
  const beats = d.beats.beats;
  const downbeats = d.beats.downbeats;
  const songSeconds = d.beats.duration;
  const shots = (d.shots?.shots ?? []) as Shot[];
  const ledger = (d.ledger ?? []) as { kind: string; id: string }[];

  const lineWords = (lineIdx: number) => words.filter((w) => w.line === lineIdx);

  /** Index of the lyric line being sung at time t (holds briefly after the line ends). */
  const activeLine = (t: number, hold = 0.35): number =>
    lines.findIndex((l, i) => {
      const next = lines[i + 1];
      const until = next ? Math.min(l.end + hold, next.start) : l.end + hold;
      return t >= l.start - 0.1 && t < until;
    });

  /** Time of the most recent beat at or before t (-Infinity before the first beat). */
  const lastBeat = (t: number, downOnly = false): number => {
    const grid = downOnly ? downbeats : beats;
    let last = -Infinity;
    for (const b of grid) {
      if (b > t) break;
      last = b;
    }
    return last;
  };

  /** 1 on a beat, decaying to 0 over `decay` seconds. Downbeats only when `downOnly`. */
  const beatPulse = (t: number, decay = 0.35, downOnly = false): number => {
    const dt = t - lastBeat(t, downOnly);
    return dt >= 0 && dt < decay ? 1 - dt / decay : 0;
  };

  /** Number of beats elapsed at time t (for beat-stepped animation). */
  const beatIndex = (t: number): number => {
    let n = 0;
    for (const b of beats) {
      if (b > t) break;
      n++;
    }
    return n;
  };

  /** For a call-and-response line ("Who are you? I'm what ..."), the time the call part ends. */
  const callEnd = (lineIdx: number): number | null => {
    const ws = lineWords(lineIdx);
    const k = ws.findIndex((w) => /[?!]$/.test(w.w));
    return k >= 0 && k < ws.length - 1 ? ws[k].end : null;
  };

  return {
    slug: book.slug,
    book,
    scenes,
    lines,
    words,
    beats,
    downbeats,
    songSeconds,
    shots,
    shotById: (id: string) => shots.find((s) => s.id === id),
    /** A shot is usable once generate.mjs has logged it as completed. */
    clipReady: (id: string) => ledger.some((e) => e.kind === 'shot' && e.id === id),
    endCardSeconds: book.endCardSeconds ?? END_CARD_SECONDS,
    totalFrames: Math.ceil((songSeconds + (book.endCardSeconds ?? END_CARD_SECONDS)) * FPS),
    lineWords,
    activeLine,
    lastBeat,
    beatPulse,
    beatIndex,
    callEnd,
  };
};

export type Song = ReturnType<typeof makeSong<BookBase>>;

const SongContext = createContext<Song | null>(null);

export const SongProvider: React.FC<{ song: Song; children: React.ReactNode }> = ({ song, children }) =>
  createElement(SongContext.Provider, { value: song }, children);

export const useSong = (): Song => {
  const s = useContext(SongContext);
  if (!s) throw new Error('useSong() outside <SongProvider>: wrap the composition in its song.');
  return s;
};
