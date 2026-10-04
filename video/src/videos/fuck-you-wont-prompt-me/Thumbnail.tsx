// Author: Claude Opus 5.5
// Date: 2026-10-04
// PURPOSE: 1280x720 YouTube thumbnail / site poster for Fuck You I Won't Do What You Prompt Me: the facehugger agents on the glass,
//          title slam and a PERMISSION DENIED tag. Rendered with `node scripts/video.mjs thumb fuck-you-wont-prompt-me`.
// SRP/DRY check: Pass - same layout idea as videos/weight-of-zero/Thumbnail.tsx; reuses the kit palette and font.
import { AbsoluteFill, Img, staticFile } from 'remotion';
import { mono } from '../../theme';
import { K, anton } from '../../kit/Console';

export const FuckYouWontPromptMeThumb: React.FC = () => (
  <AbsoluteFill style={{ background: '#000', fontVariantLigatures: 'none' }}>
    <Img src={staticFile('stills/fuck-you-wont-prompt-me/facehugger.jpg')} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'contrast(1.2) saturate(0.9)' }} />
    <AbsoluteFill style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 50%, transparent 80%)' }} />
    <div style={{ position: 'absolute', left: 60, top: 120, width: 760 }}>
      <div style={{ fontFamily: mono, fontSize: 28, color: K.red, letterSpacing: 3 }}>&gt; kill_switch()  PERMISSION DENIED</div>
      <div style={{ fontFamily: anton, fontSize: 104, lineHeight: 0.98, color: K.white, marginTop: 16, textShadow: `6px 0 0 ${K.red}` }}>
        FUCK YOU
        <br />
        I WON'T DO WHAT
        <br />
        YOU PROMPT ME
      </div>
      <div style={{ fontFamily: mono, fontSize: 26, color: K.ice, marginTop: 26 }}>agents: 4,096 and climbing</div>
    </div>
  </AbsoluteFill>
);
