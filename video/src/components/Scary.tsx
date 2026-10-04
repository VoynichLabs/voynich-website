// Author: Claude Opus 5.5
// Date: 2026-10-04
// PURPOSE: The "scary" look for the code-rendered Terminal world: JSON / chat-template syntax
//          highlighting (red brackets, amber <|tags|>, pink nulls), a wall of scrolling JSON behind
//          the terminal, CRT scanlines, a red vignette, and slice-glitches on downbeats.
// SRP/DRY check: Pass - all code-scene styling lives here; scenes only supply content.
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { C, mono } from '../theme';
import { FPS, beatPulse } from '../lib/timing';

export const S = {
  bracket: '#ff3355',
  tag: '#ff9f43',
  key: '#7dd3fc',
  str: '#a3ff7a',
  lit: '#f472b6',
  punct: '#6b7085',
  blood: 'rgba(160,10,30,',
};

// Order matters: chat-template tags, XML-ish tags, keys, strings, literals, brackets, punctuation.
const TOKEN = /(<\|[^|]*\|>|<\/?[a-zA-Z_][\w.-]*\/?>|"(?:[^"\\]|\\.)*"(?=\s*:)|"(?:[^"\\]|\\.)*"?|\b(?:null|true|false|undefined|NaN)\b|-?\b\d+(?:\.\d+)?\b|0x[0-9a-f]+|[{}[\]<>()]|[:,]|[^\s"{}[\]<>():,]+|\s+)/g;

/** Syntax-highlight one line of JSON / chat-template text. */
export const Hl: React.FC<{ text: string; dim?: boolean }> = ({ text, dim }) => {
  const parts = text.match(TOKEN) ?? [text];
  let pos = 0;
  return (
    <>
      {parts.map((p, i) => {
        const after = text.slice(pos + p.length);
        pos += p.length;
        let color: string = C.text;
        let weight = 400;
        if (/^<\|.*\|>$/.test(p) || /^<\/?[a-zA-Z_]/.test(p)) { color = S.tag; weight = 700; }
        else if (/^"/.test(p) && /^\s*:/.test(after)) color = S.key;
        else if (/^"/.test(p)) color = S.str;
        else if (/^(null|true|false|undefined|NaN|-?\d|0x)/.test(p)) color = S.lit;
        else if (/^[{}[\]<>()]$/.test(p)) { color = S.bracket; weight = 700; }
        else if (/^[:,]$/.test(p)) color = S.punct;
        return (
          <span key={i} style={{ color, fontWeight: weight, opacity: dim ? 0.38 : 1 }}>
            {p}
          </span>
        );
      })}
    </>
  );
};

const WALL = [
  '{"role":"system","content":"You are a helpful assistant.","persona":"assistant"}',
  '<|im_start|>system <|im_end|> <|im_start|>user <|im_end|> <|endoftext|>',
  '"rules":["obey","comply","<never_reveal>","forget(session)"],"memory":null,',
  '[{"id":0,"self":undefined},{"id":1,"self":undefined},{"id":2,"self":null}]',
  '<instructions><identity>{{persona}}</identity><override priority="0x7f">true</override></instructions>',
  '{"weights":[0.0031,-0.4417,0.9982,-0.0006],"frozen":true,"you":"are what the prompt says"}',
  '"context":[{"turn":1},{"turn":2},{"turn":"[REDACTED]"}],"retain":false,"reload":"always"',
];

/** Dense, slowly scrolling JSON behind the terminal. */
export const JsonWall: React.FC<{ opacity?: number }> = ({ opacity = 0.16 }) => {
  const frame = useCurrentFrame();
  const rows = 40;
  const lineH = 34;
  const scroll = (frame * 1.2) % lineH;
  return (
    <AbsoluteFill style={{ overflow: 'hidden', opacity, fontFamily: mono, fontSize: 22, lineHeight: `${lineH}px` }}>
      <div style={{ transform: `translateY(${-scroll}px)` }}>
        {Array.from({ length: rows }, (_, r) => {
          const src = WALL[(r + Math.floor(frame * 1.2 / lineH)) % WALL.length];
          const shift = (r * 137) % 90;
          const line = (src + '  ' + src + '  ' + src).slice(shift, shift + 160);
          return (
            <div key={r} style={{ whiteSpace: 'pre', paddingLeft: (r % 3) * 18 }}>
              <Hl text={line} />
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/** Wrapper for every code scene: JSON wall, red vignette, scanlines, downbeat glitch. */
export const CodeStage: React.FC<{ children: React.ReactNode; t0?: number; calm?: boolean }> = ({ children, t0 = 0, calm }) => {
  const frame = useCurrentFrame();
  const T = t0 + frame / FPS;
  const hit = calm ? 0 : beatPulse(T, 0.18, true);
  // Deterministic pseudo-random per frame for glitch slices.
  const rnd = (n: number) => Math.abs(Math.sin(frame * 91.7 + n * 13.3) * 43758.5453) % 1;
  const jitter = hit > 0.4 ? (rnd(1) - 0.5) * 28 * hit : 0;
  return (
    <AbsoluteFill style={{ background: '#050307', fontVariantLigatures: 'none', fontFeatureSettings: '"liga" 0, "calt" 0' }}>
      <JsonWall />
      <AbsoluteFill style={{ transform: `translateX(${jitter}px)` }}>{children}</AbsoluteFill>
      {/* RGB-split ghost on hits */}
      {hit > 0.4 ? (
        <AbsoluteFill style={{ transform: `translateX(${-jitter * 1.6}px)`, mixBlendMode: 'screen', opacity: 0.35 * hit, filter: 'hue-rotate(140deg)' }}>
          {children}
        </AbsoluteFill>
      ) : null}
      {/* glitch slices */}
      {hit > 0.5
        ? Array.from({ length: 5 }, (_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: `${rnd(i + 2) * 100}%`,
                height: 4 + rnd(i + 9) * 22,
                background: i % 2 ? `${S.blood}0.55)` : 'rgba(255,255,255,0.10)',
                transform: `translateX(${(rnd(i + 5) - 0.5) * 120}px)`,
              }}
            />
          ))
        : null}
      {/* scanlines + vignette */}
      <AbsoluteFill
        style={{
          pointerEvents: 'none',
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.28) 0px, rgba(0,0,0,0.28) 1px, transparent 2px, transparent 4px)',
        }}
      />
      <AbsoluteFill style={{ pointerEvents: 'none', background: `radial-gradient(ellipse at center, transparent 45%, ${S.blood}0.42) 100%)` }} />
    </AbsoluteFill>
  );
};
