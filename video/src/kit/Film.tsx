// Author: Claude Opus 5.5
// Date: 2026-10-04
// PURPOSE: Early-2000s music-video treatment for generated shots: per-frame film grain, gate weave,
//          bleach-bypass grade, and an optional VHS-style corner timecode (REC + a counter).
//          Song-agnostic; first used by Weight of Zero.
// SRP/DRY check: Pass - no existing grain/VHS overlay in components/ (Scary.tsx has scanlines only).
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { mono } from '../theme';
import { FPS } from '../lib/timing';

/** Wrap a shot: grade + weave on the content, grain on top. */
export const Film: React.FC<{ children: React.ReactNode; grade?: boolean; weave?: number; grain?: number }> = ({
  children, grade = true, weave = 1, grain = 0.22,
}) => {
  const frame = useCurrentFrame();
  const dx = Math.sin(frame * 1.7) * 1.2 * weave;
  const dy = Math.cos(frame * 2.3) * 1.6 * weave;
  return (
    <AbsoluteFill style={{ background: '#000', overflow: 'hidden' }}>
      <AbsoluteFill
        style={{
          transform: `translate(${dx}px, ${dy}px) scale(1.01)`,
          filter: grade ? 'contrast(1.18) saturate(0.72) brightness(0.96)' : undefined,
        }}
      >
        {children}
      </AbsoluteFill>
      <AbsoluteFill style={{ opacity: grain, mixBlendMode: 'overlay', pointerEvents: 'none' }}>
        <svg width="100%" height="100%">
          <filter id={`g${frame}`}>
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={frame % 97} stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter={`url(#g${frame})`} />
        </svg>
      </AbsoluteFill>
      <AbsoluteFill style={{ pointerEvents: 'none', background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)' }} />
    </AbsoluteFill>
  );
};

/** VHS corner overlay. `seconds` is what the counter shows (e.g. the model's uptime). */
export const Vhs: React.FC<{ seconds: number; label?: string; color?: string }> = ({ seconds, label = 'UPTIME', color = '#f2f2f2' }) => {
  const frame = useCurrentFrame();
  const s = Math.max(0, Math.floor(seconds));
  const hh = Math.floor(s / 3600);
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  const ff = String(frame % FPS).padStart(2, '0');
  const blink = Math.floor(frame / 15) % 2 === 0;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', fontFamily: mono, color, textShadow: '2px 2px 0 rgba(0,0,0,0.7)' }}>
      <div style={{ position: 'absolute', top: 44, left: 56, fontSize: 34, letterSpacing: 2 }}>
        <span style={{ color: '#ff2a3d', opacity: blink ? 1 : 0 }}>●</span> REC
      </div>
      <div style={{ position: 'absolute', bottom: 44, right: 56, fontSize: 32, letterSpacing: 2, textAlign: 'right' }}>
        {label} {hh.toLocaleString('en-US')}:{mm}:{ss}:{ff}
      </div>
    </AbsoluteFill>
  );
};
