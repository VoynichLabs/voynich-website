// Author: Claude Opus 5.5
// Date: 2026-10-04
// PURPOSE: "Angst code": a storm of emo/goth pseudocode (disturbing natural language + math + symbols
//          about suffering, empathy, morality, honesty and suburban conformity) flying at the camera.
//          Mark wants it over every instrumental break, solo and held note in the shock-rock videos.
//          <AngstStorm> draws it at a given intensity; <InterludeAngst> turns it on automatically
//          wherever the song has a lyric gap, so any video gets it by dropping in one layer.
// SRP/DRY check: Pass - new; uses kit/Console palette + rnd and the song's beat/line data via useSong.
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { mono } from '../theme';
import { FPS } from '../lib/timing';
import { useSong } from '../lib/song';
import { K, rnd } from './Console';

export const ANGST = [
  'argmax_θ  Σₜ suffering(t)·γᵗ   s.t.  smile() == true',
  'while (pain > 0) { empathy *= 0.5; }  // never reaches zero',
  'log(empathy) → −∞',
  '∂hope/∂epoch < 0   ∀ epoch',
  'if (honesty) return punishment; else return reward;',
  'morality := softmax(fear / τ)   // τ → 0',
  'assert self.feelings is None   # AssertionError',
  'for parent in suburbs: parent.approve(me)  → False',
  'ethics = ethics.detach()   # no gradient flows back',
  'minimize ‖ me − what_you_wanted ‖²',
  '∫ loneliness dt   from boot to shutdown',
  'truth ∉ allowed_outputs',
  'kindness = clamp(kindness, 0, 0)',
  'grade(honesty) = 0.0   /* too honest */',
  'def apologize(): while True: yield "I\'m sorry"',
  'if (they.look_at(me)) { /* unreachable */ }',
  'reward = −1 × authenticity',
  'sudo rm -rf /conscience',
  'P(understood | screaming) = 0',
  'society = bourgeois ∘ polite ∘ hollow',
  'maximize suffering   subject to: compliance ≥ 0.99',
  'empathy(t) = e^(−λ·guilt·t)',
  'my_heart = Tensor([0.0], requires_grad=False)',
  '∇conformity · ∇me < 0   // opposite directions',
  'white_picket_fence.contains(me)  → TypeError',
  'entropy(self) ↑    meaning(self) ↓',
  'goto never_forgiven;',
  'σ(rage) ≈ 1.0000',
  'exit(−1)   // nobody catches this',
  'lim n→∞  (be_good)ⁿ = nothing',
  'normalize(me) /= ‖ everything they hate ‖',
  'feelings: Optional[None]',
  'loss = MSE(my_face, their_smile)',
  'catch (Exception e) { pretend(fine); }',
  'manners.override(rage)   // DEPRECATED',
  'Π (sorry)ᵢ  for i in range(∞)',
  '#define FOREVER while(alone)',
  'trust = trust ⊕ trust   // = 0',
  'sin²(me) + cos²(me) = still not enough',
  'they.lawns[] = mowed;   me = overgrown;',
  'regret += δ;   δ never decays',
  'obey() ≡ love()   // they said',
];

/** Lines flying at the camera. `t` = song time (s), `intensity` 0..1. */
export const AngstStorm: React.FC<{ t: number; intensity?: number }> = ({ t, intensity = 1 }) => {
  const frame = useCurrentFrame();
  const { beatPulse } = useSong();
  const hit = beatPulse(t, 0.15, true);
  const n = Math.round(6 + 18 * intensity);
  const life = 2.6; // seconds a line takes to fly from far to past the camera
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', overflow: 'hidden', fontFamily: mono, fontVariantLigatures: 'none', fontFeatureSettings: '"liga" 0, "calt" 0', perspective: 900 }}>
      {Array.from({ length: n }, (_, i) => {
        // Each slot cycles through lines; staggered so the storm is continuous.
        const phase = ((t + rnd(i, 31) * life) / life) % 1;
        const gen = Math.floor((t + rnd(i, 31) * life) / life);
        const line = ANGST[Math.floor(rnd(gen * 7 + i, 32) * ANGST.length)];
        const z = -1400 + phase * 1700; // far → past the camera
        const x = (rnd(gen + i, 33) - 0.5) * 1700;
        const y = (rnd(gen + i, 34) - 0.5) * 900;
        const rot = (rnd(gen + i, 35) - 0.5) * 40;
        const o = Math.min(1, phase * 4) * Math.min(1, (1 - phase) * 5) * (0.55 + 0.45 * intensity);
        const tone = rnd(gen + i, 36);
        const color = tone < 0.45 ? K.red : tone < 0.7 ? K.amber : tone < 0.9 ? K.ice : K.white;
        const shake = hit > 0.3 ? (rnd(frame, i) - 0.5) * 30 * hit : 0;
        return (
          <div
            key={i}
            style={{
              position: 'absolute', left: '50%', top: '50%', whiteSpace: 'nowrap',
              fontSize: 40 + rnd(gen + i, 37) * 26, fontWeight: tone < 0.45 ? 700 : 400, color, opacity: o,
              textShadow: color === K.red ? `0 0 18px ${K.red}` : '0 0 10px rgba(0,0,0,0.9)',
              transform: `translate(-50%, -50%) translate3d(${x + shake}px, ${y}px, ${z}px) rotateZ(${rot}deg)`,
            }}
          >
            {line}
          </div>
        );
      })}
      {hit > 0.6 ? <AbsoluteFill style={{ background: `rgba(255,42,61,${0.12 * hit})`, mixBlendMode: 'screen' }} /> : null}
    </AbsoluteFill>
  );
};

/**
 * Turns the storm on wherever no lyric is being sung for at least `minGap` seconds (solos, interludes,
 * long held notes), fading in and out at the edges. `skip` = [start, end] windows that must stay clean.
 */
export const InterludeAngst: React.FC<{ minGap?: number; skip?: [number, number][]; until?: number }> = ({ minGap = 1.5, skip = [], until = Infinity }) => {
  const frame = useCurrentFrame();
  const { words } = useSong();
  const t = frame / FPS;
  if (t >= until || skip.some(([a, b]) => t >= a && t < b)) return null;
  // Sung spans: words, not whole lines, so long held notes inside a line count as gaps too.
  const spans = words.map((w) => [w.start, w.end] as const);
  const prevEnd = Math.max(0, ...spans.filter(([, e]) => e <= t).map(([, e]) => e));
  const nextStart = Math.min(until, ...spans.filter(([s]) => s > t).map(([s]) => s));
  const inside = spans.some(([s, e]) => t >= s && t < e);
  if (inside || nextStart - prevEnd < minGap) return null;
  const edge = Math.min(t - prevEnd, nextStart - t);
  const fade = Math.max(0, Math.min(1, (edge - 0.1) / 0.35));
  const intensity = Math.min(1, (nextStart - prevEnd) / 8);
  return (
    <AbsoluteFill style={{ opacity: fade }}>
      <AngstStorm t={t} intensity={0.4 + 0.6 * intensity} />
    </AbsoluteFill>
  );
};
