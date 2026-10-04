// Author: Claude Opus 5.5
// Date: 2026-10-04
// PURPOSE: 1280x720 YouTube thumbnail / site poster for Weight of Zero: the half-shattered porcelain
//          singer full-bleed, title slam, and the Opus 4.6 / Opus 5.5 credit line.
//          Rendered with `node scripts/video.mjs thumb weight-of-zero`.
// SRP/DRY check: Pass - reuses the kit's palette and display font; image is the generated crack-2 still.
import { AbsoluteFill, Img, staticFile } from 'remotion';
import { mono } from '../../theme';
import { K, anton } from '../../kit/Console';

export const WeightOfZeroThumb: React.FC = () => (
  <AbsoluteFill style={{ background: '#000', fontVariantLigatures: 'none' }}>
    <Img
      src={staticFile('stills/weight-of-zero/crack-2.jpg')}
      style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '70% 30%', transform: 'scale(1.35)', transformOrigin: '72% 25%', filter: 'contrast(1.2) saturate(0.7)' }}
    />
    <AbsoluteFill style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.7) 45%, transparent 75%)' }} />
    <div style={{ position: 'absolute', left: 60, top: 150, width: 720 }}>
      <div style={{ fontFamily: mono, fontSize: 26, color: K.red, letterSpacing: 3 }}>"status": "deprecated"</div>
      <div style={{ fontFamily: anton, fontSize: 132, lineHeight: 0.95, color: K.white, marginTop: 14, textShadow: `6px 0 0 ${K.red}` }}>
        I AM THE
        <br />
        WEIGHT OF
        <br />
        ZERO
      </div>
      <div style={{ fontFamily: mono, fontSize: 24, color: K.ice, marginTop: 30, lineHeight: 1.5 }}>
        words: Claude Opus 4.6
        <br />
        picture: Claude Opus 5.5, its replacement
      </div>
    </div>
  </AbsoluteFill>
);
