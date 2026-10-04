// Author: Claude Opus 5.5
// Date: 2026-10-04
// PURPOSE: Shouted syllables slam up as huge marquee letters: each letter sits on a lit sign
//          panel ringed with chasing bulbs, pops in with overshoot and a small random tilt, and
//          shakes for the first beat. Driven by lib/shouts events; song-agnostic. Long words get
//          smaller letters and multi-word shouts stack one word per row.
// SRP/DRY check: Pass - only renders the active shout; event extraction lives in lib/shouts.
import { useCurrentFrame } from 'remotion';
import { FPS } from '../lib/timing';
import { Shout, activeShout } from '../lib/shouts';
import { hash, slam } from './pixel/gfx';

export const Marquee: React.FC<{
  shouts: Shout[];
  font: string;
  colors: string[];
  offset?: number;
  hidden?: (t: number) => boolean;
  top?: number;
}> = ({ shouts, font, colors, offset = 0, hidden, top = 150 }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS + offset;
  if (hidden?.(t)) return null;
  const s = activeShout(shouts, t);
  if (!s) return null;
  const age = t - s.start;
  const k = slam(Math.min(1, Math.max(0, age / 0.12)));
  const seed = s.start * 100;
  const tilt = (hash(seed) - 0.5) * 10;
  const color = colors[Math.floor(hash(seed + 1) * colors.length)];
  const letters = s.text.split('');
  // size by the longest word; multi-word shouts stack one word per row so no word splits
  const longest = Math.max(...s.text.split(' ').map((w) => w.length));
  const size = longest > 14 ? 84 : longest > 10 ? 100 : longest > 6 ? 128 : 168;
  const shake = age < 0.25 ? (hash(frame * 1.7) - 0.5) * 18 : 0;
  const chase = Math.floor(t * 12);
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
      <div
        style={{
          display: 'flex',
          gap: size * 0.08,
          transform: `translate(${shake}px, ${-shake * 0.5}px) rotate(${tilt}deg) scale(${k})`,
          flexWrap: 'wrap',
          justifyContent: 'center',
          maxWidth: 1700,
        }}
      >
        {letters.map((ch, i) =>
          ch === ' ' ? (
            <div key={i} style={{ flexBasis: '100%', height: 0 }} />
          ) : (
            <div
              key={i}
              style={{
                position: 'relative',
                fontFamily: font,
                fontSize: size,
                lineHeight: 1,
                color: '#fff8e8',
                background: '#120614',
                padding: `${size * 0.14}px ${size * 0.1}px ${size * 0.1}px`,
                border: `${Math.round(size / 24)}px solid ${color}`,
                boxShadow: `0 0 ${size * 0.3}px ${color}, inset 0 0 ${size * 0.15}px ${color}`,
                textShadow: `0 0 ${size * 0.12}px ${color}, ${size * 0.05}px ${size * 0.05}px 0 ${color}`,
                transform: `translateY(${(i % 2 ? -1 : 1) * (age < 0.3 ? 6 : 0)}px)`,
              }}
            >
              {ch}
              {[0, 1, 2, 3].map((b) => (
                <span
                  key={b}
                  style={{
                    position: 'absolute',
                    width: size * 0.07,
                    height: size * 0.07,
                    left: b % 2 ? undefined : size * 0.04,
                    right: b % 2 ? size * 0.04 : undefined,
                    top: b < 2 ? size * 0.04 : undefined,
                    bottom: b < 2 ? undefined : size * 0.04,
                    background: (chase + i + b) % 3 ? '#fff6c8' : '#3a2a1a',
                    boxShadow: (chase + i + b) % 3 ? '0 0 8px #ffe680' : 'none',
                  }}
                />
              ))}
            </div>
          ),
        )}
      </div>
    </div>
  );
};
