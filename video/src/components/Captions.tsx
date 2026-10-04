// Author: Claude Opus 5.5
// Date: 2026-10-04
// PURPOSE: Karaoke lyric captions in the lower third, driven by word-level timestamps.
//          In chorus sections the call (up to "?" or "!") is blue and the response is green.
// SRP/DRY check: Pass - single caption renderer; timing comes from lib/timing.
import { useCurrentFrame } from 'remotion';
import { C, sans } from '../theme';
import { FPS, activeLine, callEnd, lineWords, lines } from '../lib/timing';

export const Captions: React.FC<{ offset?: number }> = ({ offset = 0 }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS + offset;
  const li = activeLine(t);
  if (li < 0) return null;
  const line = lines[li];
  const isChorus = /Chorus/.test(line.section);
  const split = callEnd(li);
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 70, display: 'flex', justifyContent: 'center' }}>
      <div
        style={{
          background: 'rgba(8,8,14,0.78)',
          borderRadius: 12,
          padding: '14px 34px',
          fontFamily: sans,
          fontWeight: 600,
          fontSize: 52,
          maxWidth: 1700,
          textAlign: 'center',
          lineHeight: 1.25,
        }}
      >
        {lineWords(li).map((w, i) => {
          const sung = t >= w.start;
          const base = isChorus && split !== null ? (w.end <= split ? C.blue : C.green) : C.text;
          return (
            <span key={i} style={{ color: base, opacity: sung ? 1 : 0.35 }}>
              {w.w}{' '}
            </span>
          );
        })}
      </div>
    </div>
  );
};
