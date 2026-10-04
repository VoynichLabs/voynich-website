// Author: Claude Opus 5.5
// Date: 2026-10-04
// PURPOSE: A 480x270 canvas redrawn every frame by a draw(ctx, t) callback and shown at full
//          composition size with hard (nearest-neighbour) pixels, so procedural scenes read as
//          real 8-bit art instead of smooth vector shapes. t is seconds since the enclosing
//          Sequence started. Optional `post` runs on the finished frame (glitch, shatter).
// SRP/DRY check: Pass - the one place canvas lifecycle + upscaling lives; scenes only draw.
import { useLayoutEffect, useRef } from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { FPS } from '../../lib/timing';
import { Ctx, PH, PW } from './gfx';

export const PixelCanvas: React.FC<{
  draw: (ctx: Ctx, t: number) => void;
  post?: (ctx: Ctx, t: number) => void;
  transparent?: boolean;
  style?: React.CSSProperties;
}> = ({ draw, post, transparent = false, style }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const ctx = ref.current?.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    const t = frame / FPS;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
    ctx.imageSmoothingEnabled = false;
    if (transparent) ctx.clearRect(0, 0, PW, PH);
    else {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, PW, PH);
    }
    ctx.save();
    draw(ctx, t);
    ctx.restore();
    if (post) post(ctx, t);
  }, [frame, draw, post, transparent]);
  return (
    <AbsoluteFill style={style}>
      <canvas ref={ref} width={PW} height={PH} style={{ width: '100%', height: '100%', imageRendering: 'pixelated' }} />
    </AbsoluteFill>
  );
};
