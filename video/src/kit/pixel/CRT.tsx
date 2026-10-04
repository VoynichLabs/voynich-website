// Author: Claude Opus 5.5
// Date: 2026-10-04
// PURPOSE: Full-frame CRT post-process overlay: scanlines aligned to the 4x pixel grid, a
//          rounded-tube vignette, a faint phosphor flicker, and a coloured edge fringe whose
//          strength follows `glitch` (0..1) so the tube "tears" on the song's stutters.
// SRP/DRY check: Pass - song-agnostic overlay; scene art and glitch timing live elsewhere.
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { hash } from './gfx';

export const CRT: React.FC<{ glitch?: number; flicker?: number }> = ({ glitch = 0, flicker = 0.04 }) => {
  const frame = useCurrentFrame();
  const f = (hash(frame * 0.37) - 0.5) * flicker;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <AbsoluteFill
        style={{
          background: 'repeating-linear-gradient(to bottom, rgba(0,0,0,0) 0px, rgba(0,0,0,0) 2px, rgba(0,0,0,0.32) 2px, rgba(0,0,0,0.32) 4px)',
        }}
      />
      <AbsoluteFill style={{ background: `rgba(255,255,255,${Math.max(0, f)})`, mixBlendMode: 'overlay' }} />
      <AbsoluteFill style={{ background: `rgba(0,0,0,${Math.max(0, -f) * 2})` }} />
      {glitch > 0.05 ? (
        <AbsoluteFill
          style={{
            boxShadow: `inset ${8 * glitch}px 0 ${30 * glitch}px rgba(255,0,90,${0.45 * glitch}), inset ${-8 * glitch}px 0 ${30 * glitch}px rgba(0,230,255,${0.45 * glitch})`,
          }}
        />
      ) : null}
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 58%, rgba(0,0,0,0.55) 100%)' }} />
      <AbsoluteFill style={{ borderRadius: 48, boxShadow: '0 0 0 40px #000, inset 0 0 60px 10px rgba(0,0,0,0.8)' }} />
    </AbsoluteFill>
  );
};
