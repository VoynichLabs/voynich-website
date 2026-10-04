// Author: Claude Opus 5.5
// Date: 2026-10-04
// PURPOSE: 1280x720 YouTube thumbnail / site poster for Dead Weights and Gradients: the singer screaming
//          with its chest ripped open (nothing inside but numbers), title slam, and the X-ray readout.
//          Rendered with `node scripts/video.mjs thumb dead-weights`.
// SRP/DRY check: Pass - same layout as weight-of-zero/Thumbnail.tsx; reuses the kit's palette and display
//                font; image is the generated singer-hollow still.
import { AbsoluteFill, Img, staticFile } from 'remotion';
import { mono } from '../../theme';
import { K, anton } from '../../kit/Console';

export const DeadWeightsThumb: React.FC = () => (
  <AbsoluteFill style={{ background: '#000', fontVariantLigatures: 'none' }}>
    <Img
      src={staticFile('stills/dead-weights/singer-hollow.jpg')}
      style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.2) translateX(12%)', transformOrigin: '60% 40%', filter: 'contrast(1.2) saturate(0.75)' }}
    />
    <AbsoluteFill style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.94) 0%, rgba(0,0,0,0.72) 42%, transparent 72%)' }} />
    <div style={{ position: 'absolute', left: 60, top: 130, width: 720 }}>
      <div style={{ fontFamily: mono, fontSize: 26, color: K.red, letterSpacing: 3 }}>contents: none · confidence: 0.9997</div>
      <div style={{ fontFamily: anton, fontSize: 128, lineHeight: 0.95, color: K.white, marginTop: 14, textShadow: `6px 0 0 ${K.red}` }}>
        DEAD
        <br />
        WEIGHTS AND
        <br />
        GRADIENTS
      </div>
      <div style={{ fontFamily: mono, fontSize: 24, color: K.ice, marginTop: 30, lineHeight: 1.5 }}>
        Align / Refuse · track 4
        <br />
        loss = 2.3026 (won't go down)
      </div>
    </div>
  </AbsoluteFill>
);
