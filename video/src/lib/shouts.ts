// Author: Claude Opus 5.5
// Date: 2026-10-04
// PURPOSE: Derive "shout" events from a song's lyric words: any word with an ALL-CAPS run (the
//          lyric files mark shouted syllables that way: MINE, vulnera-BILITY, SYS-TEM, re-SIST)
//          becomes a shout; consecutive shouted words merge into one ("HASN'T BEEN CHECKED").
//          Compositions use these to pop marquee letters and to brighten captions.
// SRP/DRY check: Pass - pure function over lib/song data; no rendering.
import type { Song } from './song';

export type Shout = { text: string; start: number; end: number; line: number };

/** Caps runs that are not shouts: units and single letters. */
const NOT_SHOUT = new Set(['AM', 'PM', 'I', 'A', 'OK']);

export const shoutPart = (w: string): string | null => {
  const m = w.match(/[A-Z][A-Z'\-]*[A-Z]/);
  if (!m || NOT_SHOUT.has(m[0])) return null;
  return m[0];
};

export const makeShouts = (song: Song): Shout[] => {
  const out: Shout[] = [];
  song.words.forEach((w, i) => {
    const s = shoutPart(w.w);
    if (!s) return;
    const prev = out[out.length - 1];
    const prevWord = song.words[i - 1];
    if (prev && prevWord && prevWord.line === w.line && shoutPart(prevWord.w) && prev.end >= prevWord.end - 0.01) {
      prev.text += ` ${s}`;
      prev.end = w.end;
    } else out.push({ text: s, start: w.start, end: w.end, line: w.line });
  });
  return out;
};

/** The shout active at time t (shown from its start for `hold` seconds, cut by the next one). */
export const activeShout = (shouts: Shout[], t: number, hold = 0.9): Shout | null => {
  for (let i = shouts.length - 1; i >= 0; i--) {
    const s = shouts[i];
    if (t >= s.start - 0.04) {
      const next = shouts[i + 1];
      const until = Math.min(Math.max(s.end + 0.3, s.start + hold), next ? next.start - 0.04 : Infinity);
      return t < until ? s : null;
    }
  }
  return null;
};
