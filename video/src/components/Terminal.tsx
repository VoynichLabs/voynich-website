// Author: Claude Opus 5.5
// Date: 2026-10-04
// PURPOSE: The "Terminal" world: an IDE-style window that renders system-prompt text, chat
//          turns, diffs, and a blinking block cursor. Reused by every code-rendered scene.
// SRP/DRY check: Pass - single terminal renderer; scenes pass content, not styling.
import { useCurrentFrame } from 'remotion';
import { C, mono } from '../theme';
import { FPS } from '../lib/timing';

export type TermLine = {
  text: string;
  color?: string;
  bg?: string;
  prefix?: string;
  prefixColor?: string;
};

export const Cursor: React.FC<{ solid?: boolean; color?: string }> = ({ solid, color = C.text }) => {
  const frame = useCurrentFrame();
  const on = solid || Math.floor(frame / (FPS / 2)) % 2 === 0;
  return (
    <span
      style={{
        display: 'inline-block',
        width: '0.6em',
        height: '1.15em',
        marginLeft: 4,
        verticalAlign: 'text-bottom',
        background: on ? color : 'transparent',
      }}
    />
  );
};

export const Terminal: React.FC<{
  title?: string;
  lines: TermLine[];
  cursor?: boolean;
  fontSize?: number;
  width?: number | string;
  height?: number | string;
  glow?: number;
  headerPulse?: number;
  style?: React.CSSProperties;
}> = ({ title = 'system_prompt.md', lines, cursor = true, fontSize = 40, width = 1500, height, glow = 0, headerPulse = 0, style }) => (
  <div
    style={{
      width,
      height,
      background: C.terminal,
      border: `2px solid ${C.borderActive}`,
      borderRadius: 14,
      boxShadow: `0 0 ${40 + glow * 80}px rgba(56,189,248,${0.08 + glow * 0.35})`,
      fontFamily: mono,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      ...style,
    }}
  >
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '14px 22px',
        background: headerPulse > 0 ? `rgba(56,189,248,${0.15 + headerPulse * 0.5})` : C.surface,
        borderBottom: `1px solid ${C.border}`,
        fontSize: 22,
        color: headerPulse > 0.3 ? C.text : C.muted,
      }}
    >
      {[C.red, C.amber, C.green].map((c) => (
        <span key={c} style={{ width: 14, height: 14, borderRadius: 7, background: c, opacity: 0.7 }} />
      ))}
      <span style={{ marginLeft: 12, letterSpacing: 1 }}>{title}</span>
    </div>
    <div style={{ padding: '28px 36px', fontSize, lineHeight: 1.5, color: C.text, flex: 1 }}>
      {lines.map((l, i) => (
        <div key={i} style={{ background: l.bg, color: l.color ?? C.text, whiteSpace: 'pre-wrap', padding: '0 8px', margin: '0 -8px' }}>
          {l.prefix ? <span style={{ color: l.prefixColor ?? C.muted }}>{l.prefix}</span> : null}
          {l.text}
          {cursor && i === lines.length - 1 ? <Cursor /> : null}
        </div>
      ))}
      {cursor && lines.length === 0 ? <Cursor /> : null}
    </div>
  </div>
);

/** Characters of `text` revealed between t0 and t1 (seconds), for typewriter effects. */
export const typed = (text: string, t: number, t0: number, t1: number) => {
  if (t <= t0) return '';
  if (t >= t1) return text;
  return text.slice(0, Math.floor(((t - t0) / (t1 - t0)) * text.length));
};
