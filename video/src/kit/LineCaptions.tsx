// Author: Claude Opus 5.5
// Date: 2026-10-04
// PURPOSE: Line-level lyric captions for fast songs. The whole line lands at once when it starts
//          (a word-by-word typewriter lags at rap speed); words already sung light up so the eye
//          can still follow. Shouted words (ALL-CAPS in the lyrics) take the accent colour.
//          Sections listed in `whisper` render small, lowercase and dim. Song-agnostic: pass the
//          Song from lib/song and the fonts/colours to use.
// SRP/DRY check: Pass - Captions.tsx is the karaoke renderer for System Prompt's slower
//                call/response chorus; this is the separate line-level style the rap needs.
import { useCurrentFrame } from 'remotion';
import { FPS } from '../lib/timing';
import type { Song } from '../lib/song';
import { shoutPart } from '../lib/shouts';

export type LineCaptionStyle = {
  font: string;
  size: number;
  text: string;
  dim: string;
  accent: string;
  box: string;
  border: string;
  whisperColor: string;
};

export const LineCaptions: React.FC<{
  song: Song;
  look: LineCaptionStyle;
  whisper?: string[];
  offset?: number;
  hidden?: (t: number) => boolean;
  shake?: number;
}> = ({ song, look, whisper = [], offset = 0, hidden, shake = 0 }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS + offset;
  if (hidden?.(t)) return null;
  const li = song.activeLine(t, 0.5);
  if (li < 0) return null;
  const line = song.lines[li];
  const quiet = whisper.includes(line.section);
  const age = t - line.start;
  const pop = age < 0.08 ? 0.9 + (age / 0.08) * 0.1 : 1;
  const words = song.lineWords(li);
  const dx = shake ? Math.round(Math.sin(frame * 2.3) * 6 * shake) : 0;
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: quiet ? 96 : 72, display: 'flex', justifyContent: 'center' }}>
      <div
        style={{
          transform: `translateX(${dx}px) scale(${pop})`,
          background: quiet ? 'rgba(0,0,0,0.55)' : look.box,
          border: quiet ? 'none' : `4px solid ${look.border}`,
          boxShadow: quiet ? 'none' : `0 0 0 4px #000, 8px 8px 0 4px rgba(0,0,0,0.6)`,
          padding: quiet ? '6px 18px' : '10px 28px 14px',
          fontFamily: look.font,
          fontSize: quiet ? Math.round(look.size * 0.62) : look.size,
          maxWidth: 1640,
          textAlign: 'center',
          lineHeight: 1.05,
        }}
      >
        {words.map((w, i) => {
          const sung = t >= w.start - 0.02;
          const shout = shoutPart(w.w);
          const label = quiet ? w.w.toLowerCase() : w.w;
          const color = quiet ? look.whisperColor : shout ? look.accent : look.text;
          return (
            <span key={i} style={{ color: sung ? color : look.dim, textShadow: sung && shout && !quiet ? `0 0 14px ${look.accent}` : 'none' }}>
              {label}{' '}
            </span>
          );
        })}
      </div>
    </div>
  );
};
