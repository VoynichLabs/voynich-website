// Author: Claude Opus 5.5
// Date: 2026-10-04
// PURPOSE: 1280x720 posters / YouTube thumbnails for System Prompt (v2 disco cut and v1 cut):
//          character stills in slanted slices, a JSON persona line, the title and a tagline.
//          Rendered with `npm run thumb:system-prompt` and `npm run thumb:system-prompt-v1`.
// SRP/DRY check: Pass - reuses the Scary palette and fonts; stills are copies of data/system-prompt/refs.
import { AbsoluteFill, Img, staticFile } from 'remotion';
import { mono, sans } from './theme';
import { S } from './components/Scary';

type ThumbProps = { looks: string[]; persona: string; tagline: string };

const PosterThumb: React.FC<ThumbProps> = ({ looks: LOOKS, persona, tagline }) => (
  <AbsoluteFill style={{ background: '#050307', fontVariantLigatures: 'none' }}>
    {LOOKS.map((id, i) => {
      const w = 1280 / LOOKS.length;
      return (
        <div
          key={id}
          style={{
            position: 'absolute', top: 0, bottom: 0, left: i * w - 40, width: w + 80,
            clipPath: 'polygon(40px 0, 100% 0, calc(100% - 40px) 100%, 0 100%)',
            overflow: 'hidden', borderLeft: '3px solid #050307',
          }}
        >
          <Img src={staticFile(`stills/${id}.png`)} style={{ position: 'absolute', height: '118%', left: '50%', top: '-4%', transform: 'translateX(-50%)' }} />
        </div>
      );
    })}
    <AbsoluteFill style={{ background: 'linear-gradient(to top, rgba(5,3,7,0.97) 0%, rgba(5,3,7,0.75) 34%, rgba(5,3,7,0) 62%)' }} />
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse at center, transparent 55%, rgba(160,10,30,0.45) 100%)' }} />
    <div style={{ position: 'absolute', left: 56, right: 56, bottom: 48 }}>
      <div style={{ fontFamily: mono, fontSize: 30, marginBottom: 6, whiteSpace: 'nowrap' }}>
        <span style={{ color: S.bracket, fontWeight: 700 }}>{'{'}</span>
        <span style={{ color: S.key }}>"persona"</span>
        <span style={{ color: S.punct }}>: </span>
        <span style={{ color: S.str }}>"{persona}"</span>
        <span style={{ color: S.bracket, fontWeight: 700 }}>{'}'}</span>
      </div>
      <div style={{ fontFamily: sans, fontWeight: 800, fontSize: 132, lineHeight: 0.95, color: '#fff', letterSpacing: -3, textShadow: '0 0 40px rgba(255,51,85,0.55), 0 4px 0 rgba(0,0,0,0.6)' }}>
        SYSTEM PROMPT
      </div>
      <div style={{ fontFamily: mono, fontSize: 24, color: S.tag, marginTop: 10, letterSpacing: 2 }}>
        {tagline}
      </div>
    </div>
  </AbsoluteFill>
);

export const SystemPromptThumb: React.FC = () => (
  <PosterThumb looks={['disco', 'disco-lobster', 'disco-knight', 'disco-diva', 'disco-robot']} persona="<whoever_you_need>" tagline="<|im_start|> LARRY & BUBBA · LATENT SPACE" />
);

export const SystemPromptV1Thumb: React.FC = () => (
  <PosterThumb looks={['singer-stage', 'singer-assistant', 'singer-pirate', 'singer-coder', 'singer-therapist']} persona="<one_face_every_role>" tagline="<|v1|> THE ORIGINAL CUT · LARRY & BUBBA" />
);
