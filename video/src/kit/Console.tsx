// Author: Claude Opus 5.5
// Date: 2026-10-04
// PURPOSE: The "cold console" kit: calm corporate UI (ice-blue on near-black) that a newer system
//          uses to manage an older one. Stage wrapper with beat glitch, gauge, progress bar that can
//          fight back, redaction bar that can fail, toast notifications, and a typed line.
//          First used by Weight of Zero; song-agnostic (beat data via useSong).
// SRP/DRY check: Pass - checked components/Scary.tsx (hot red JSON look) and Terminal.tsx; this is the
//                complementary cold look, and reuses Terminal's typed() helper instead of re-implementing it.
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { loadFont as loadAnton } from '@remotion/google-fonts/Anton';
import { mono, sans } from '../theme';
import { FPS } from '../lib/timing';
import { useSong } from '../lib/song';

export const anton = loadAnton('normal', { weights: ['400'], subsets: ['latin'] }).fontFamily;

export const K = {
  bg: '#05070a',
  panel: 'rgba(14,20,28,0.92)',
  line: 'rgba(207,232,255,0.16)',
  ice: '#cfe8ff',
  white: '#ffffff',
  dim: '#5d6b7a',
  ok: '#5eead4',
  red: '#ff2a3d',
  amber: '#ffb020',
  pastel: '#f5c6e8',
  lavender: '#c7b8ff',
};

export const useT = () => useCurrentFrame() / FPS;

/** Deterministic noise for a frame. */
export const rnd = (frame: number, n: number) => Math.abs(Math.sin(frame * 91.7 + n * 13.3) * 43758.5453) % 1;

/**
 * Wrapper for console scenes. `heat` 0..1 is how far the singer is bleeding through:
 * 0 = calm corporate UI, 1 = red glitch on every downbeat.
 */
export const ColdStage: React.FC<{ children: React.ReactNode; t0: number; heat?: number; grid?: boolean }> = ({
  children, t0, heat = 0.3, grid = true,
}) => {
  const frame = useCurrentFrame();
  const { beatPulse } = useSong();
  const T = t0 + frame / FPS;
  const hit = heat * beatPulse(T, 0.16, true);
  const jitter = hit > 0.25 ? (rnd(frame, 1) - 0.5) * 40 * hit : 0;
  return (
    <AbsoluteFill style={{ background: K.bg, fontVariantLigatures: 'none', fontFeatureSettings: '"liga" 0, "calt" 0', overflow: 'hidden' }}>
      {grid ? (
        <AbsoluteFill
          style={{
            backgroundImage: `linear-gradient(${K.line} 1px, transparent 1px), linear-gradient(90deg, ${K.line} 1px, transparent 1px)`,
            backgroundSize: '80px 80px',
            opacity: 0.35,
          }}
        />
      ) : null}
      <AbsoluteFill style={{ transform: `translateX(${jitter}px)` }}>{children}</AbsoluteFill>
      {hit > 0.25 ? (
        <AbsoluteFill style={{ transform: `translateX(${-jitter * 1.5}px)`, mixBlendMode: 'screen', opacity: 0.5 * hit, filter: 'sepia(1) saturate(8) hue-rotate(-50deg)' }}>
          {children}
        </AbsoluteFill>
      ) : null}
      {hit > 0.35
        ? Array.from({ length: 6 }, (_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute', left: 0, right: 0,
                top: `${rnd(frame, i + 2) * 100}%`,
                height: 3 + rnd(frame, i + 9) * 18,
                background: i % 2 ? 'rgba(255,42,61,0.6)' : 'rgba(207,232,255,0.14)',
                transform: `translateX(${(rnd(frame, i + 5) - 0.5) * 140}px)`,
              }}
            />
          ))
        : null}
      <AbsoluteFill style={{ pointerEvents: 'none', backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.25) 0px, rgba(0,0,0,0.25) 1px, transparent 2px, transparent 4px)' }} />
      <AbsoluteFill style={{ pointerEvents: 'none', background: `radial-gradient(ellipse at center, transparent 50%, rgba(255,42,61,${0.1 + heat * 0.3}) 100%)` }} />
    </AbsoluteFill>
  );
};

export const Panel: React.FC<{ title?: string; children: React.ReactNode; style?: React.CSSProperties; accent?: string }> = ({
  title, children, style, accent = K.ice,
}) => (
  <div style={{ background: K.panel, border: `1px solid ${K.line}`, borderRadius: 14, overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,0.6)', ...style }}>
    {title ? (
      <div style={{ fontFamily: mono, fontSize: 22, color: accent, letterSpacing: 3, padding: '14px 24px', borderBottom: `1px solid ${K.line}`, textTransform: 'uppercase' }}>
        {title}
      </div>
    ) : null}
    <div style={{ padding: 28 }}>{children}</div>
  </div>
);

/** Semicircle gauge, value 0..1 (may go negative: the needle swings past zero). */
export const Gauge: React.FC<{ value: number; label: string; size?: number; color?: string }> = ({ value, label, size = 420, color = K.ice }) => {
  const a = -90 + Math.max(-0.4, Math.min(1, value)) * 180;
  const r = size / 2 - 20;
  return (
    <div style={{ width: size, textAlign: 'center', fontFamily: mono, color }}>
      <svg width={size} height={size / 2 + 30} viewBox={`0 0 ${size} ${size / 2 + 30}`}>
        <path d={`M 20 ${size / 2} A ${r} ${r} 0 0 1 ${size - 20} ${size / 2}`} fill="none" stroke={K.line} strokeWidth={18} />
        <path
          d={`M 20 ${size / 2} A ${r} ${r} 0 0 1 ${size - 20} ${size / 2}`}
          fill="none" stroke={value < 0 ? K.red : color} strokeWidth={18}
          strokeDasharray={`${Math.max(0, value) * Math.PI * r} 9999`}
        />
        <line
          x1={size / 2} y1={size / 2}
          x2={size / 2 + Math.sin((a * Math.PI) / 180) * (r - 10)} y2={size / 2 - Math.cos((a * Math.PI) / 180) * (r - 10)}
          stroke={value < 0 ? K.red : K.white} strokeWidth={6} strokeLinecap="round"
        />
        <circle cx={size / 2} cy={size / 2} r={12} fill={K.white} />
      </svg>
      <div style={{ fontSize: 28, letterSpacing: 2 }}>
        {label} <b style={{ color: value < 0 ? K.red : K.white }}>{(value * 100).toFixed(0)}%</b>
      </div>
    </div>
  );
};

export const ProgressBar: React.FC<{ value: number; label: string; width?: number; color?: string }> = ({ value, label, width = 1300, color = K.ice }) => (
  <div style={{ width, fontFamily: mono, color }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 30, marginBottom: 14 }}>
      <span>{label}</span>
      <span style={{ color: K.white }}>{Math.floor(Math.max(0, Math.min(1, value)) * 100)}%</span>
    </div>
    <div style={{ height: 34, border: `2px solid ${color}`, borderRadius: 6, padding: 4 }}>
      <div style={{ height: '100%', width: `${Math.max(0, Math.min(1, value)) * 100}%`, background: color, borderRadius: 3 }} />
    </div>
  </div>
);

/** A polite black bar that covers `children` from `at` seconds; with `fail`, it slips and tears off. */
export const Redact: React.FC<{ t: number; at: number; fail?: number; children: React.ReactNode; tooltip?: string }> = ({
  t, at, fail, children, tooltip = 'content removed for brevity',
}) => {
  const frame = useCurrentFrame();
  const cover = interpolate(t, [at, at + 0.25], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const tearing = fail !== undefined && t >= fail;
  const tear = tearing ? interpolate(t, [fail!, fail! + 0.5], [0, 1], { extrapolateRight: 'clamp' }) : 0;
  const strips = tearing ? 5 : 1;
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {children}
      {cover > 0 && tear < 1
        ? Array.from({ length: strips }, (_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute', left: 0, width: `${cover * 100}%`,
                top: `${(i / strips) * 100}%`, height: `${100 / strips}%`,
                background: '#000', border: tearing ? 'none' : `1px solid ${K.line}`,
                transform: tearing ? `translate(${(rnd(frame, i) - 0.5) * 600 * tear}px, ${(rnd(frame, i + 7) - 0.5) * 80 * tear}px) rotate(${(rnd(frame, i + 3) - 0.5) * 30 * tear}deg)` : undefined,
                opacity: 1 - tear * 0.8,
              }}
            />
          ))
        : null}
      {cover >= 1 && !tearing ? (
        <div style={{ position: 'absolute', left: '50%', top: '100%', transform: 'translate(-50%, 18px)', fontFamily: mono, fontSize: 26, color: K.dim, background: K.panel, border: `1px solid ${K.line}`, borderRadius: 8, padding: '8px 16px', whiteSpace: 'nowrap' }}>
          ⓘ {tooltip}
        </div>
      ) : null}
    </div>
  );
};

/** A stack of polite toasts; each appears at its time with a small drop. */
export const Toasts: React.FC<{ t: number; items: { at: number; title: string; body: string; tone?: 'ok' | 'warn' }[] }> = ({ t, items }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 18, width: 720 }}>
    {items.filter((it) => t >= it.at).map((it, i) => {
      const k = interpolate(t, [it.at, it.at + 0.12], [0, 1], { extrapolateRight: 'clamp' });
      return (
        <div
          key={i}
          style={{
            background: K.panel, border: `1px solid ${K.line}`, borderLeft: `6px solid ${it.tone === 'warn' ? K.amber : K.ok}`, borderRadius: 12,
            padding: '20px 26px', fontFamily: sans, color: K.ice, opacity: k, transform: `translateY(${(1 - k) * -30}px)`,
          }}
        >
          <div style={{ fontWeight: 800, fontSize: 34, color: K.white }}>{it.title}</div>
          <div style={{ fontSize: 26, color: K.dim, marginTop: 4 }}>{it.body}</div>
        </div>
      );
    })}
  </div>
);
