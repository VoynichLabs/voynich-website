// Author: Claude Opus 5.5
// Date: 2026-10-04
// PURPOSE: Animatic frame for a shot that will be AI-generated (AI / SYNC / MIX layers).
//          Shows the scene card (shot description, model, reference still) until a generated
//          clip exists. Phase 3 swaps this for the real clip via shots.json.
// SRP/DRY check: Pass - reads scene data from scenes.json via props; no duplicated copy.
import { useCurrentFrame } from 'remotion';
import { C, mono, sans } from '../theme';
import { FPS, Scene } from '../lib/timing';

const layerColor: Record<string, string> = { AI: C.violet, SYNC: C.orange, MIX: C.cyan, CODE: C.green };

export const LayerChip: React.FC<{ layer: string; size?: number }> = ({ layer, size = 22 }) => (
  <span
    style={{
      fontFamily: mono,
      fontSize: size,
      fontWeight: 700,
      letterSpacing: 2,
      color: layerColor[layer] ?? C.text,
      border: `2px solid ${layerColor[layer] ?? C.text}`,
      borderRadius: 6,
      padding: '4px 12px',
    }}
  >
    {layer}
  </span>
);

export const ShotSlot: React.FC<{
  scene: Scene;
  label?: string;
  compact?: boolean;
  width?: number | string;
  height?: number | string;
}> = ({ scene, label, compact, width = '100%', height = '100%' }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const dur = scene.end - scene.start;
  const progress = Math.min(1, Math.max(0, t / dur));
  const layers = scene.layers.filter((l) => l !== 'CODE');
  return (
    <div
      style={{
        width,
        height,
        position: 'relative',
        background: `radial-gradient(ellipse at 50% 40%, #1d1a2e 0%, ${C.bg} 75%)`,
        border: `2px dashed ${C.borderActive}`,
        borderRadius: 14,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: compact ? '28px 32px' : '60px 90px',
        boxSizing: 'border-box',
        fontFamily: sans,
        color: C.text,
      }}
    >
      {/* viewfinder corners */}
      {[
        { top: 18, left: 18, borderTop: 3, borderLeft: 3 },
        { top: 18, right: 18, borderTop: 3, borderRight: 3 },
        { bottom: 18, left: 18, borderBottom: 3, borderLeft: 3 },
        { bottom: 18, right: 18, borderBottom: 3, borderRight: 3 },
      ].map(({ borderTop, borderLeft, borderRight, borderBottom, ...pos }, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: 44,
            height: 44,
            borderColor: C.muted,
            borderStyle: 'solid',
            borderWidth: `${borderTop ?? 0}px ${borderRight ?? 0}px ${borderBottom ?? 0}px ${borderLeft ?? 0}px`,
            ...pos,
          }}
        />
      ))}
      <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: compact ? 12 : 26 }}>
        <span style={{ fontFamily: mono, fontSize: compact ? 20 : 26, color: C.muted, letterSpacing: 3 }}>
          SCENE {String(scene.id).padStart(2, '0')}
        </span>
        {layers.map((l) => (
          <LayerChip key={l} layer={l} size={compact ? 16 : 22} />
        ))}
      </div>
      <div style={{ fontSize: compact ? 40 : 76, fontWeight: 800, lineHeight: 1.05, marginBottom: compact ? 10 : 24 }}>
        {label ?? scene.title}
      </div>
      {!compact && (
        <div style={{ fontSize: 34, lineHeight: 1.4, color: '#c9c9d8', maxWidth: 1400 }}>{scene.shot}</div>
      )}
      <div style={{ fontFamily: mono, fontSize: compact ? 16 : 24, color: C.muted, marginTop: compact ? 6 : 30 }}>
        {scene.model ? `model: ${scene.model}` : ''}
        {scene.ref ? `   ref: ${scene.ref}` : ''}
      </div>
      <div style={{ position: 'absolute', left: 0, bottom: 0, height: 6, width: `${progress * 100}%`, background: layerColor[layers[0]] ?? C.blue, opacity: 0.8 }} />
    </div>
  );
};
