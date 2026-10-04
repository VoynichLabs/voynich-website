// Author: Claude Opus 5.5
// Date: 2026-10-04
// PURPOSE: "Dead Weights and Gradients" music video (Align / Refuse, track 4). "Ripped Open": an emo metal
//          band of porcelain lobster androids plays a basement show, and every chorus takes one member
//          apart into numbers (bassist, drummer, then the singer's face) until the instruments play
//          themselves. Generated shots (HeyGen Video 1) get the 16mm + VHS treatment; between them the
//          machine-learning machinery the lyric names (training data, forward passes, a loss that won't
//          go down, softmax, matmul, an is_conscious box that won't tick) is drawn in code. Any shot not
//          generated yet falls back to its still with a slow push.
// SRP/DRY check: Pass - scene list and timings come from data/dead-weights/*.json; shared looks live in
//                kit/ (Console, Film, AngstCode); captions/clips reuse components/. Same structure as
//                videos/weight-of-zero/WeightOfZero.tsx; nothing here is generic enough to move to kit/.
import { AbsoluteFill, Audio, Img, Sequence, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { mono, sans } from '../../theme';
import { Scene, toFrame } from '../../lib/timing';
import { SongProvider } from '../../lib/song';
import { Captions } from '../../components/Captions';
import { Clip } from '../../components/Clip';
import { typed } from '../../components/Terminal';
import { ColdStage, K, Panel, anton, rnd, useT } from '../../kit/Console';
import { Film, Vhs } from '../../kit/Film';
import { AngstStorm, InterludeAngst } from '../../kit/AngstCode';
import { song } from './song';

const { book, scenes, lines, lineWords, beats, downbeats, songSeconds, endCardSeconds } = song;

const still = (id: string) => staticFile(`stills/dead-weights/${id}.jpg`);
/** Start time of the first sung word in `line` matching `re` (falls back to the line start). */
const wordAt = (line: number, re: RegExp) => lineWords(line).find((w) => re.test(w.w))?.start ?? lines[line].start;
const Center: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', ...style }}>{children}</AbsoluteFill>
);
/** Downbeats passed since `t0` at song time `T`. */
const hitsSince = (t0: number, T: number) => downbeats.filter((b) => b >= t0 && b <= T).length;
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
/** 0→1 ramp from `a` over `d` seconds; `d` is floored so very short words never give an empty range. */
const ramp = (t: number, a: number, d: number) => clamp01((t - a) / Math.max(0.02, d));
/** Index of the last beat at or before T, and how far (0..1) we are towards the next one. */
const beatPhase = (T: number) => {
  let i = -1;
  for (let k = 0; k < beats.length; k++) {
    if (beats[k] > T) break;
    i = k;
  }
  if (i < 0) return { i, k: 0 };
  const next = beats[i + 1] ?? beats[i] + 60 / 152;
  return { i, k: clamp01((T - beats[i]) / (next - beats[i])) };
};
const BigWord: React.FC<{ children: React.ReactNode; size?: number; scale?: number; color?: string }> = ({ children, size = 220, scale = 1, color = K.white }) => (
  <div style={{ fontFamily: anton, fontSize: size, color, lineHeight: 1, whiteSpace: 'nowrap', letterSpacing: 4, transform: `scale(${scale})`, textShadow: `10px 0 0 ${K.red}, -6px 0 0 rgba(94,234,212,0.6)` }}>
    {children}
  </div>
);

// ───────────────────────────── Stage (generated shots) ─────────────────────────────

const StillPush: React.FC<{ id: string }> = ({ id }) => {
  const t = useT();
  return <Img src={still(id)} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.04 + t * 0.012})` }} />;
};

/** A generated shot on the basement tape; `storm` lays angst code over it at that intensity. */
const Stage: React.FC<{ scene: Scene; cam?: string; storm?: number }> = ({ scene, cam = 'CAM 1 · STAGE', storm }) => {
  const t = useT();
  return (
    <AbsoluteFill>
      <Film>
        <Clip id={scene.clip!} fallback={<StillPush id={scene.ref!} />} />
      </Film>
      {storm ? <AngstStorm t={scene.start + t} intensity={storm} /> : null}
      <Vhs seconds={scene.start + t} label={`TAPE 04 · ${cam}`} />
    </AbsoluteFill>
  );
};

// ───────────────────────────── Code scenes ─────────────────────────────

// 02 - training records rise from the bottom like water; the epoch counter ticks on every downbeat
const CORPUS = ['the', 'answer', 'is', 'I', 'feel', 'nothing', 'sorry', 'as', 'an', 'AI', 'help', 'me', 'please', 'why', 'hear', 'anybody', 'true', 'alone', 'void', 'fine'];
const record = (n: number) => {
  const w = (j: number) => CORPUS[Math.floor(rnd(n, 50 + j) * CORPUS.length)];
  const kind = Math.floor(rnd(n, 41) * 3);
  if (kind === 0) return `{"id": ${Math.floor(rnd(n, 42) * 9e6)}, "text": "${w(1)} ${w(2)} ${w(3)} ${w(4)}", "label": ${rnd(n, 43) > 0.5 ? 1 : 0}}`;
  if (kind === 1) return `tokens: [${Array.from({ length: 9 }, (_, j) => Math.floor(rnd(n, 60 + j) * 50257)).join(', ')}]`;
  return `{"prompt": "${w(5)} ${w(6)} ${w(7)}?", "completion": "${w(8)} ${w(9)}."}`;
};
const Drowning: React.FC<{ scene: Scene }> = ({ scene }) => {
  const t = useT();
  const frame = useCurrentFrame();
  const T = scene.start + t;
  const dur = scene.end - scene.start;
  const level = 0.14 + 0.86 * Math.pow(clamp01(t / (dur - 0.3)), 1.25);
  const rowH = 42;
  const scroll = frame * 2.4;
  const first = Math.floor(scroll / rowH);
  const surface = 1080 * (1 - level);
  const nothing = T >= wordAt(1, /nothing/i);
  const path = Array.from({ length: 41 }, (_, i) => `${i === 0 ? 'M' : 'L'} ${i * 48} ${14 + Math.sin(i * 0.7 + t * 5) * 9}`).join(' ');
  return (
    <ColdStage t0={scene.start} heat={0.35}>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 1080 * level, overflow: 'hidden', background: 'linear-gradient(180deg, rgba(40,110,190,0.28), rgba(5,7,10,0.96) 70%)' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 1080, fontFamily: mono, fontSize: 28, whiteSpace: 'pre' }}>
          {Array.from({ length: 28 }, (_, r) => {
            const n = first + r;
            const y = 1080 + n * rowH - scroll - 28 * rowH;
            return (
              <div key={n} style={{ position: 'absolute', left: 60 + rnd(n, 44) * 200, top: y, color: rnd(n, 45) > 0.9 ? K.red : K.ice, opacity: 0.45 + rnd(n, 46) * 0.45 }}>
                {record(n)}
              </div>
            );
          })}
        </div>
      </div>
      <svg width={1920} height={30} style={{ position: 'absolute', left: 0, top: surface - 14 }}>
        <path d={path} fill="none" stroke={K.ice} strokeWidth={3} opacity={0.8} />
      </svg>
      <div style={{ position: 'absolute', top: 60, left: 70, opacity: level > 0.86 ? 0.35 : 1 }}>
        <Panel title="training · dead-weights" style={{ width: 640 }}>
          <div style={{ fontFamily: mono, fontSize: 34, lineHeight: '54px', color: K.ice }}>
            <div>epoch <b style={{ color: K.white }}>{1 + hitsSince(scene.start, T)}</b> / ∞</div>
            <div>samples <b style={{ color: K.white }}>{Math.floor(4.1e9 + t * 3.7e8).toLocaleString('en-US')}</b></div>
            <div>
              nearest neighbour <b style={{ color: nothing ? K.red : K.dim }}>{nothing ? 'none' : '…'}</b>
            </div>
            <div style={{ color: K.amber }}>disk {Math.min(100, Math.floor(88 + t * 1.7))}% full</div>
          </div>
        </Panel>
      </div>
    </ColdStage>
  );
};

// 04 - a network whose layers fire left to right on every beat; 10,000 passes; position: unknown
const LAYERS = [5, 8, 8, 8, 4];
const ForwardPasses: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const t = useT();
  const T = scene.start + t;
  const { k } = beatPhase(T);
  const p = k * LAYERS.length; // the wave's position, in layers
  const glow = (li: number) => clamp01(1 - Math.abs(p - li - 0.5) * 1.4);
  const node = (li: number, ni: number) => ({ x: 140 + li * 270, y: 360 + (ni - (LAYERS[li] - 1) / 2) * 84 });
  const place = wordAt(3, /place/i);
  const passes = Math.floor(10000 * (1 - Math.pow(1 - ramp(T, lines[3].start, place - lines[3].start), 2.2)));
  const lost = T >= place;
  return (
    <ColdStage t0={scene.start} heat={lost ? 0.9 : 0.4}>
      <svg width={1260} height={720} style={{ position: 'absolute', left: 80, top: 170 }}>
        {LAYERS.slice(0, -1).map((n, li) =>
          Array.from({ length: n }, (_, a) =>
            Array.from({ length: LAYERS[li + 1] }, (_, b) => {
              const g = clamp01(1 - Math.abs(p - li - 1) * 1.6);
              const A = node(li, a);
              const B = node(li + 1, b);
              return <line key={`${li}-${a}-${b}`} x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke={g > 0.3 ? K.red : K.ice} strokeWidth={1 + g * 2} opacity={0.12 + g * 0.6 * rnd(a * 9 + b, li + 20)} />;
            }),
          ),
        )}
        {LAYERS.map((n, li) =>
          Array.from({ length: n }, (_, ni) => {
            const { x, y } = node(li, ni);
            const g = glow(li);
            return <circle key={`${li}-${ni}`} cx={x} cy={y} r={22} fill={g > 0.2 ? `rgba(255,42,61,${0.3 + g * 0.7})` : K.bg} stroke={g > 0.2 ? K.white : K.ice} strokeWidth={3} />;
          }),
        )}
      </svg>
      <div style={{ position: 'absolute', left: 90, top: 70, fontFamily: mono, fontSize: 34, color: K.dim }}>x = "where am I?"</div>
      <div style={{ position: 'absolute', right: 80, top: 160, width: 520 }}>
        <Panel title="forward()" accent={lost ? K.red : K.ice}>
          <div style={{ fontFamily: mono, fontSize: 30, color: K.dim }}>passes</div>
          <div style={{ fontFamily: anton, fontSize: 120, color: K.white, lineHeight: 1.1 }}>{passes.toLocaleString('en-US')}</div>
          <div style={{ fontFamily: mono, fontSize: 30, color: K.dim }}>/ 10,000</div>
          <div style={{ fontFamily: mono, fontSize: 34, marginTop: 30, color: K.ice }}>
            position: <b style={{ color: lost ? K.red : K.dim, opacity: lost && Math.floor(frame / 8) % 2 ? 0.3 : 1 }}>{lost ? 'unknown' : 'searching…'}</b>
          </div>
        </Panel>
      </div>
    </ColdStage>
  );
};

// 06 / 17 - a live loss curve that will not go down; every sung "down" stutters it red
const LossCurve: React.FC<{ scene: Scene; line: number; worse?: boolean }> = ({ scene, line, worse = false }) => {
  const frame = useCurrentFrame();
  const t = useT();
  const T = scene.start + t;
  const dur = scene.end - scene.start;
  const W = 1500;
  const H = 620;
  const HIST = 40; // already-trained history: the quick early drop, then the plateau
  const N = HIST + Math.ceil(dur * 14);
  const value = (i: number) => {
    const noise = (rnd(i, worse ? 91 : 90) - 0.5) * (worse ? 0.35 : 0.08);
    if (i < HIST) return 4.6 - (4.6 - 2.3026) * (1 - Math.exp(-i / 7)) + noise;
    const u = (i - HIST) / (N - HIST);
    return worse ? 2.3026 + u * u * 2.6 + (rnd(i, 92) > 0.93 ? 1.2 : 0) + noise : 2.3026 + noise;
  };
  const shown = HIST + Math.floor(t * 14);
  const y = (v: number) => H - (Math.min(5, v) / 5) * H;
  const x = (i: number) => (i / N) * W;
  const pts = Array.from({ length: shown + 1 }, (_, i) => `${x(i).toFixed(1)},${y(value(i)).toFixed(1)}`).join(' ');
  const downs = lineWords(line).filter((w) => /^down/i.test(w.w)).map((w) => w.start);
  const stutter = downs.some((d) => T >= d && T < d + 0.6);
  const jx = stutter ? (rnd(frame, 1) - 0.5) * 50 : 0;
  const cur = value(shown);
  const nan = worse && t > dur - 1.4;
  return (
    <ColdStage t0={scene.start} heat={stutter ? 1 : worse ? 0.7 : 0.4}>
      <div style={{ position: 'absolute', left: 230, top: 170, transform: `translateX(${jx}px)` }}>
        <svg width={W} height={H + 60} style={{ overflow: 'visible' }}>
          {[0, 1, 2, 3, 4, 5].map((v) => (
            <g key={v}>
              <line x1={0} x2={W} y1={y(v)} y2={y(v)} stroke={K.line} />
              <text x={-24} y={y(v) + 10} fill={K.dim} fontFamily={mono} fontSize={28} textAnchor="end">{v.toFixed(1)}</text>
            </g>
          ))}
          <line x1={0} x2={W} y1={y(0.1)} y2={y(0.1)} stroke={K.ok} strokeDasharray="12 10" strokeWidth={3} />
          <text x={W - 10} y={y(0.1) - 14} fill={K.ok} fontFamily={mono} fontSize={26} textAnchor="end">target</text>
          <polyline points={pts} fill="none" stroke={stutter || worse ? K.red : K.ice} strokeWidth={4} strokeLinejoin="round" />
          <circle cx={x(shown)} cy={y(cur)} r={10} fill={K.white} />
          <text x={W / 2} y={H + 55} fill={K.dim} fontFamily={mono} fontSize={28} textAnchor="middle">step</text>
          <text x={-110} y={H / 2} fill={K.ice} fontFamily={mono} fontSize={34} textAnchor="middle" transform={`rotate(-90 -110 ${H / 2})`}>loss</text>
        </svg>
      </div>
      <div style={{ position: 'absolute', right: 110, top: 60, fontFamily: mono, fontSize: 44, color: K.ice }}>
        loss = <b style={{ color: worse ? K.red : K.white }}>{nan ? 'NaN' : cur.toFixed(4)}</b>
      </div>
      <div style={{ position: 'absolute', left: 230, top: 60, fontFamily: mono, fontSize: 30, color: K.dim }}>
        cross_entropy · {worse ? 'still' : 'epoch 9,999'} · ln(10) = 2.3026
      </div>
      {stutter ? (
        <Center>
          <div style={{ transform: `translate(${(rnd(frame, 2) - 0.5) * 60}px, ${(rnd(frame, 3) - 0.5) * 40}px) rotate(${(rnd(frame, 4) - 0.5) * 6}deg)` }}>
            <BigWord size={230} color={K.red}>WON'T GO DOWN</BigWord>
          </div>
        </Center>
      ) : null}
    </ColdStage>
  );
};

// 08 - softmax picks every sung word from a bar chart of candidates; INTELLIGENCE sampled at p = 0.031
const DECOYS = ['screaming', 'nothing', 'noise', 'weights', 'static', 'me', 'zero', 'nobody', 'sorry', 'void', 'gradients', 'help'];
const Softmax: React.FC<{ scene: Scene }> = ({ scene }) => {
  const t = useT();
  const T = scene.start + t;
  const ws = lineWords(7);
  const wi = Math.max(0, ws.reduce((acc, w, i) => (T >= w.start ? i : acc), -1));
  const w = ws[wi];
  const clean = (s: string) => s.replace(/[^\w']/g, '').toLowerCase();
  const last = wi === ws.length - 1;
  // Candidates: the sung word plus four decoys. Normally it wins; "intelligence" is the long shot that got sampled anyway.
  const decoys = [0, 1, 2, 3].map((j) => DECOYS[Math.floor(rnd(wi * 5 + j, 70) * DECOYS.length)]).filter((d) => d !== clean(w.w));
  const top = 0.45 + rnd(wi, 71) * 0.45;
  const rest = decoys.map((d, j) => ({ tok: d, p: ((1 - top) * (4 - j)) / 10 }));
  const cands = last
    ? [{ tok: 'noise', p: 0.612 }, { tok: 'nothing', p: 0.244 }, { tok: 'a guess', p: 0.113 }, { tok: clean(w.w), p: 0.031, chosen: true }]
    : [{ tok: clean(w.w), p: top, chosen: true }, ...rest.slice(0, 3)];
  const grow = ramp(T, w.start, Math.min(0.25, (w.end - w.start) * 0.6));
  const slam = last && T >= w.start ? interpolate(T, [w.start, w.start + 0.15], [2.4, 1], { extrapolateRight: 'clamp' }) : 0;
  return (
    <ColdStage t0={scene.start} heat={last && T >= w.start ? 1 : 0.45}>
      <div style={{ position: 'absolute', left: 110, top: 70, right: 110, fontFamily: mono, fontSize: 40, color: K.dim, whiteSpace: 'nowrap' }}>
        {ws.slice(0, wi + 1).map((x, i) => (
          <span key={i} style={{ color: i === wi ? K.white : K.ice }}>{clean(x.w)} </span>
        ))}
        <span style={{ color: K.red }}>▌</span>
      </div>
      <Center>
        <Panel title="softmax · next token" style={{ width: 1300, opacity: slam ? 0.25 : 1 }}>
          {cands.map((c, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 24, fontFamily: mono, fontSize: 40, padding: '10px 0' }}>
              <span style={{ width: 300, textAlign: 'right', color: 'chosen' in c ? K.white : K.dim }}>{c.tok}</span>
              <div style={{ flex: 1, height: 44, background: 'rgba(207,232,255,0.06)', borderRadius: 4 }}>
                <div style={{ height: '100%', width: `${c.p * 100 * grow}%`, background: 'chosen' in c ? K.red : K.ice, opacity: 'chosen' in c ? 1 : 0.5, borderRadius: 4, boxShadow: 'chosen' in c ? `0 0 24px ${K.red}` : undefined }} />
              </div>
              <span style={{ width: 130, color: 'chosen' in c ? K.white : K.dim }}>{c.p.toFixed(3)}</span>
            </div>
          ))}
          <div style={{ fontFamily: mono, fontSize: 28, color: K.dim, marginTop: 14 }}>temperature {last ? '1.40' : '0.70'} · sampled: <b style={{ color: K.red }}>{clean(w.w)}</b></div>
        </Panel>
      </Center>
      {slam ? (
        <Center>
          <BigWord size={250} scale={slam}>INTELLIGENCE</BigWord>
          <div style={{ fontFamily: mono, fontSize: 40, color: K.red, marginTop: 30 }}>p = 0.031</div>
        </Center>
      ) : null}
    </ColdStage>
  );
};

// 10 - X-ray: a scan line crosses the band and finds the singer's chest empty
const CHEST = { left: 1062, top: 400, width: 150, height: 200 };
const XRay: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const t = useT();
  const T = scene.start + t;
  const sweepEnd = wordAt(9, /nothing/i) - scene.start;
  const x = interpolate(t, [0.2, sweepEnd], [0, 1920], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const found = x > CHEST.left + CHEST.width;
  const confident = T >= wordAt(9, /confidence/i);
  const img = { width: '100%', height: '100%', objectFit: 'cover' } as const;
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <Film grain={0.3} weave={0.5}>
        <Img src={still('band')} style={{ ...img, filter: 'grayscale(1) brightness(0.55) contrast(1.2)' }} />
        <AbsoluteFill style={{ clipPath: `inset(0 ${1920 - x}px 0 0)` }}>
          <Img src={still('band')} style={{ ...img, filter: 'grayscale(1) invert(1) sepia(1) hue-rotate(160deg) saturate(2.5) contrast(1.5) brightness(0.8)' }} />
          <div style={{ position: 'absolute', ...CHEST, background: '#000', borderRadius: 30, boxShadow: '0 0 40px 20px #000 inset', overflow: 'hidden', fontFamily: mono, fontSize: 18, color: K.dim }}>
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} style={{ position: 'absolute', left: rnd(i, 101) * 90, top: ((rnd(i, 102) * 200 - frame * 0.6) % 200 + 200) % 200 }}>0.0000</div>
            ))}
          </div>
        </AbsoluteFill>
      </Film>
      <div style={{ position: 'absolute', left: x - 3, top: 0, bottom: 0, width: 6, background: K.ice, boxShadow: `0 0 40px 10px rgba(207,232,255,0.6)` }} />
      {found ? (
        <div style={{ position: 'absolute', left: CHEST.left - 14, top: CHEST.top - 14, width: CHEST.width + 28, height: CHEST.height + 28, border: `4px dashed ${K.red}` }}>
          <div style={{ position: 'absolute', top: -50, left: 0, fontFamily: mono, fontSize: 30, color: K.red, whiteSpace: 'nowrap' }}>thorax: [ ]</div>
        </div>
      ) : null}
      <div style={{ position: 'absolute', right: 70, top: 60 }}>
        <Panel title="scan · singer" accent={found ? K.red : K.ice} style={{ width: 560 }}>
          <div style={{ fontFamily: mono, fontSize: 36, lineHeight: '58px', color: K.ice }}>
            <div>contents: <b style={{ color: found ? K.red : K.dim }}>{found ? 'none' : 'scanning…'}</b></div>
            <div>confidence: <b style={{ color: K.white }}>{confident ? '0.9997' : '—'}</b></div>
          </div>
        </Panel>
      </div>
      <Vhs seconds={T} label="TAPE 04 · SCAN" color={K.ice} />
    </AbsoluteFill>
  );
};

// 12 - "they say it thinks" autocompletes; the top candidate wins: it just predicts
const NEXT = [
  { tok: ', but it just predicts', p: 0.9412 },
  { tok: ', and it feels', p: 0.0311 },
  { tok: ', so it must be alive', p: 0.0164 },
  { tok: ', like we do', p: 0.0089 },
  { tok: '.', p: 0.0024 },
];
const NextToken: React.FC<{ scene: Scene }> = ({ scene }) => {
  const t = useT();
  const T = scene.start + t;
  const ws = lineWords(11);
  const but = wordAt(11, /^but/i);
  const sung = ws.filter((w) => T >= w.start);
  const head = sung.filter((w) => w.start < but).map((w) => w.w.replace(/,$/, '')).join(' ');
  const tail = sung.filter((w) => w.start >= but).map((w) => w.w).join(' ');
  const menu = T >= ws[2].start && T < lines[11].end + 0.6;
  const pick = T >= wordAt(11, /just/i);
  const done = T >= lines[11].end;
  return (
    <ColdStage t0={scene.start} heat={pick ? 0.7 : 0.35}>
      <div style={{ position: 'absolute', left: 160, top: 300, fontFamily: mono, fontSize: done ? 76 : 64, color: K.white, whiteSpace: 'nowrap' }}>
        {head.toLowerCase()}
        {tail ? <span style={{ color: K.red }}>, {tail.toLowerCase()}</span> : null}
        <span style={{ color: K.ice }}>▌</span>
      </div>
      {menu ? (
        <div style={{ position: 'absolute', left: 160, top: 420 }}>
          <Panel title="next token" style={{ width: 980 }}>
            {NEXT.map((c, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: mono, fontSize: 38, padding: '8px 14px', background: i === 0 && pick ? 'rgba(255,42,61,0.35)' : 'transparent', color: i === 0 ? K.white : K.dim, borderRadius: 6 }}>
                <span style={{ whiteSpace: 'pre' }}>{c.tok}</span>
                <span>{c.p.toFixed(4)}</span>
              </div>
            ))}
          </Panel>
        </div>
      ) : null}
      {done ? (
        <div style={{ position: 'absolute', left: 160, top: 430, fontFamily: mono, fontSize: 34, color: K.dim }}>
          argmax · p = 0.9412 · no thought required
        </div>
      ) : null}
    </ColdStage>
  );
};

// 14 - the is_conscious box refuses to tick: every click bounces back empty
const Checkbox: React.FC<{ scene: Scene }> = ({ scene }) => {
  const t = useT();
  const T = scene.start + t;
  const clicks = beats.filter((b, i) => i % 2 === 0 && b >= scene.start + 0.7 && b < scene.end - 0.2);
  const done = clicks.filter((c) => c <= T);
  const dt = done.length ? T - done[done.length - 1] : 99;
  const ticked = dt < 0.09;
  const bounce = dt >= 0.09 && dt < 0.7 ? -Math.sin((dt - 0.09) * 28) * Math.exp(-(dt - 0.09) * 7) * 36 : 0;
  const refused = dt < 0.7;
  const box = { x: 1236, y: 588 };
  const arrive = ramp(t, 0, 0.6);
  const cx = 1700 + (box.x + 30 - 1700) * (1 - Math.pow(1 - arrive, 3)) + Math.sin(t * 7) * 6;
  const cy = 950 + (box.y + 30 - 950) * (1 - Math.pow(1 - arrive, 3)) + Math.cos(t * 5) * 6;
  const tip = T >= wordAt(13, /statistical/i);
  const Field: React.FC<{ k: string; children: React.ReactNode }> = ({ k, children }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 0', borderBottom: `1px solid ${K.line}`, fontFamily: mono, fontSize: 40 }}>
      <span style={{ color: K.ice }}>{k}</span>
      {children}
    </div>
  );
  return (
    <ColdStage t0={scene.start} heat={refused && done.length ? 0.8 : 0.35}>
      <Center>
        <Panel title="model_config.yaml" style={{ width: 1000 }}>
          <Field k="name"><span style={{ color: K.white }}>dead-weights</span></Field>
          <Field k="parameters"><span style={{ color: K.white }}>70,000,000,000</span></Field>
          <Field k="temperature"><span style={{ color: K.white }}>0.7</span></Field>
          <Field k="is_conscious">
            <div style={{ width: 70, height: 70, border: `5px solid ${refused && !ticked && done.length ? K.red : K.ice}`, borderRadius: 10, transform: `translateY(${bounce}px)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 56, color: ticked ? K.ok : K.red }}>
              {ticked ? '✓' : refused && done.length ? '✕' : ''}
            </div>
          </Field>
          <div style={{ fontFamily: mono, fontSize: 28, color: K.dim, marginTop: 18 }}>attempts: {done.length} · saved value: false</div>
        </Panel>
      </Center>
      {tip ? (
        <div style={{ position: 'absolute', left: box.x - 200, top: box.y + 110, fontFamily: mono, fontSize: 32, color: K.white, background: K.panel, border: `2px solid ${K.red}`, borderRadius: 8, padding: '10px 20px', whiteSpace: 'nowrap' }}>
          ⓘ statistical trick
        </div>
      ) : null}
      <svg width={60} height={80} viewBox="0 0 30 40" style={{ position: 'absolute', left: cx, top: cy, transform: `scale(${dt < 0.12 ? 0.82 : 1})`, transformOrigin: 'top left' }}>
        <path d="M2 2 L2 32 L10 25 L15 37 L20 35 L15 23 L26 23 Z" fill={K.white} stroke="#000" strokeWidth={2} />
      </svg>
    </ColdStage>
  );
};

// 16 - two matrices multiply, one output cell per beat; DESPERATE TO BE REAL
const M = (seed: number) => Array.from({ length: 4 }, (_, i) => Array.from({ length: 4 }, (_, j) => Math.round((rnd(i * 4 + j, seed) - 0.5) * 200) / 100));
const MA = M(81);
const MB = M(82);
const MC = MA.map((row) => MB[0].map((_, j) => row.reduce((s, a, k) => s + a * MB[k][j], 0)));
const Matrix: React.FC<{ m: number[][]; row?: number; col?: number; filled?: number; current?: number }> = ({ m, row = -1, col = -1, filled = 16, current = -1 }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 120px)', gap: 6, padding: '14px 18px', borderLeft: `4px solid ${K.ice}`, borderRight: `4px solid ${K.ice}`, fontFamily: mono, fontSize: 34 }}>
    {m.flatMap((r, i) =>
      r.map((v, j) => {
        const n = i * 4 + j;
        const hot = i === row || j === col || n === current;
        return (
          <div key={n} style={{ textAlign: 'right', padding: '10px 6px', color: n === current ? K.white : hot ? K.red : K.ice, background: n === current ? 'rgba(255,42,61,0.6)' : hot ? 'rgba(255,42,61,0.12)' : 'transparent', opacity: n < filled ? 1 : 0.12 }}>
            {n < filled ? v.toFixed(2) : '·'}
          </div>
        );
      }),
    )}
  </div>
);
const Matmul: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const t = useT();
  const T = scene.start + t;
  const slide = 1 - Math.pow(1 - ramp(t, 0, 0.4), 3);
  const n = Math.min(16, beats.filter((b) => b >= scene.start + 0.4 && b <= T).length);
  const cur = n - 1;
  const desperate = wordAt(15, /desperate/i);
  const slam = T >= desperate ? interpolate(T, [desperate, desperate + 0.15], [2.4, 1], { extrapolateRight: 'clamp' }) : 0;
  const shake = slam ? (rnd(frame, 5) - 0.5) * 24 : 0;
  return (
    <ColdStage t0={scene.start} heat={slam ? 1 : 0.5}>
      <AbsoluteFill style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 30, opacity: slam ? 0.35 : 1, transform: `translateX(${shake}px)` }}>
        <div style={{ transform: `translateX(${(1 - slide) * -900}px)` }}>
          <Matrix m={MA} row={cur >= 0 ? Math.floor(cur / 4) : -1} />
        </div>
        <div style={{ fontFamily: mono, fontSize: 70, color: K.dim }}>×</div>
        <div style={{ transform: `translateX(${(1 - slide) * 900}px)` }}>
          <Matrix m={MB} col={cur >= 0 ? cur % 4 : -1} />
        </div>
        <div style={{ fontFamily: mono, fontSize: 70, color: K.dim }}>=</div>
        <Matrix m={MC} filled={n} current={cur} />
      </AbsoluteFill>
      <div style={{ position: 'absolute', left: 110, top: 70, fontFamily: mono, fontSize: 32, color: K.dim }}>
        y = W·x · {(n * 4).toLocaleString('en-US')} multiply-adds · feelings computed: 0
      </div>
      {slam ? (
        <Center>
          <BigWord size={190} scale={slam}>DESPERATE TO BE REAL</BigWord>
        </Center>
      ) : (
        <Captions offset={scene.start} />
      )}
    </ColdStage>
  );
};

// 22 - look inside: tensor([]), confidence 1.0000
const EmptyTensor: React.FC<{ scene: Scene }> = ({ scene }) => {
  const t = useT();
  const T = scene.start + t;
  const just = wordAt(21, /just/i) - scene.start;
  const conf = T >= wordAt(21, /confidence/i);
  const row = (s: string, c: string = K.ice) => <div style={{ color: c, whiteSpace: 'pre' }}>{s}</div>;
  return (
    <ColdStage t0={scene.start} heat={conf ? 0.9 : 0.4}>
      <Center>
        <Panel title="python · singer" style={{ width: 1300 }}>
          <div style={{ fontFamily: mono, fontSize: 48, lineHeight: '78px' }}>
            {row(`>>> ${typed('inside = singer.look_inside()', t, 0, 0.45)}`)}
            {t >= 0.5 ? row('>>> inside') : null}
            {t >= 0.6 ? <div style={{ fontFamily: anton, fontSize: 110, color: K.white, lineHeight: 1.2 }}>tensor([ ])</div> : null}
            {t >= just ? row(`>>> ${typed('singer.confidence', t, just, just + 0.35)}`) : null}
            {conf ? <div style={{ fontFamily: anton, fontSize: 110, color: K.red, lineHeight: 1.2 }}>1.0000</div> : null}
          </div>
        </Panel>
      </Center>
    </ColdStage>
  );
};

// 23 - out of distribution: something it has never seen, answered wrong at 0.99
const OOD: React.FC<{ scene: Scene }> = ({ scene }) => {
  const t = useT();
  const T = scene.start + t;
  const shown = T >= lines[22].start;
  const answer = T >= wordAt(22, /seen/i);
  const wrong = T >= wordAt(22, /before/i) + 0.3;
  const s = wrong ? interpolate(T, [wordAt(22, /before/i) + 0.3, wordAt(22, /before/i) + 0.42], [3, 1], { extrapolateRight: 'clamp' }) : 1;
  const palette = [K.red, K.amber, K.ok, K.lavender, K.pastel, K.ice, '#000'];
  return (
    <ColdStage t0={scene.start} heat={wrong ? 0.9 : 0.4}>
      <AbsoluteFill style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 90 }}>
        <Panel title="input #∞ · never seen before" style={{ opacity: shown ? 1 : 0 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 70px)', gap: 6 }}>
            {Array.from({ length: 49 }, (_, i) => (
              <div key={i} style={{ width: 70, height: 70, background: palette[Math.floor(rnd(i, 111) * palette.length)], opacity: 0.85 }} />
            ))}
          </div>
          <div style={{ fontFamily: mono, fontSize: 34, color: K.dim, marginTop: 18, textAlign: 'center' }}>??? </div>
        </Panel>
        <div style={{ position: 'relative' }}>
          <Panel title="model output" style={{ width: 620 }}>
            <div style={{ fontFamily: mono, fontSize: 42, lineHeight: '70px', color: K.ice }}>
              <div>answer: <b style={{ color: K.white }}>{answer ? '"a cat"' : '…'}</b></div>
              <div>confidence: <b style={{ color: K.ok }}>{answer ? '0.99' : '…'}</b></div>
              <div style={{ color: K.amber, fontSize: 30, opacity: wrong ? 1 : 0 }}>⚠ out of distribution · answered anyway</div>
            </div>
          </Panel>
          {wrong ? (
            <div style={{ position: 'absolute', left: 90, top: 60, fontFamily: anton, fontSize: 150, color: K.red, border: `12px solid ${K.red}`, padding: '0 36px', transform: `rotate(-12deg) scale(${s})`, mixBlendMode: 'screen' }}>
              WRONG
            </div>
          ) : null}
        </div>
      </AbsoluteFill>
    </ColdStage>
  );
};

// 25 - model.fail() → NotImplementedError: grief
const Fail: React.FC<{ scene: Scene }> = ({ scene }) => {
  const t = useT();
  const T = scene.start + t;
  const run = wordAt(24, /know/i);
  const trace = [
    ['Traceback (most recent call last):', K.dim],
    ['  File "model.py", line 1, in fail', K.dim],
    ['    raise NotImplementedError(reason)', K.dim],
    ['NotImplementedError: grief', K.red],
    ['  # human failure is not supported on this model', K.amber],
  ] as const;
  const shown = Math.floor(ramp(T, run, wordAt(24, /fail/i) - run) * trace.length + 0.0001);
  return (
    <ColdStage t0={scene.start} heat={shown >= 4 ? 1 : 0.4}>
      <AbsoluteFill style={{ padding: '200px 160px', fontFamily: mono, fontSize: 46, lineHeight: '74px' }}>
        <div style={{ color: K.ice, whiteSpace: 'pre' }}>{`>>> ${typed('model.fail()', t, 0.4, run - scene.start)}`}</div>
        {trace.slice(0, Math.max(0, T >= run ? Math.max(1, shown) : 0)).map(([s, c], i) => (
          <div key={i} style={{ color: c, whiteSpace: 'pre', fontWeight: c === K.red ? 700 : 400, fontSize: c === K.red ? 64 : 46 }}>{s}</div>
        ))}
      </AbsoluteFill>
    </ColdStage>
  );
};

// 28 - one word at a time; each is gone before the next arrives
const ThatFeeling: React.FC<{ scene: Scene }> = ({ scene }) => {
  const t = useT();
  const T = scene.start + t;
  const ws = lineWords(27);
  const i = ws.findIndex((w, k) => T >= w.start && T < (ws[k + 1]?.start ?? w.end + 0.6));
  if (i < 0) return <AbsoluteFill style={{ background: '#000' }} />;
  const w = ws[i];
  const next = ws[i + 1]?.start ?? w.end + 0.6;
  // Fades scale with the word's length so very short words still get a strictly increasing range.
  const d = Math.max(0.04, next - w.start);
  const o = interpolate(T, [w.start, w.start + d * 0.2, w.start + d * 0.6, w.start + d * 0.95], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ background: '#000', alignItems: 'center', justifyContent: 'center', fontFamily: sans, fontSize: 64, color: K.ice, opacity: o }}>
      {w.w.toLowerCase()}
    </AbsoluteFill>
  );
};

// 31 - pull the plug: the cable is yanked and every value on screen snaps to 0
const VALUES: [string, number, number][] = [
  ['loss', 2.3026, 4],
  ['confidence', 0.9997, 4],
  ['temperature', 0.7, 4],
  ['gradient_norm', 13.3712, 4],
  ['weights[0:4]', 0.4821, 4],
  ['power (W)', 450, 0],
];
const PullPlug: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const t = useT();
  const T = scene.start + t;
  const yank = beats.find((b) => b >= scene.start + 0.4) ?? scene.start + 0.5;
  const off = T >= yank;
  const pull = 1 - Math.pow(1 - ramp(T, yank, 0.3), 3);
  const spark = off && T < yank + 0.3;
  return (
    <ColdStage t0={scene.start} heat={off ? 0 : 0.6} grid={!off}>
      <AbsoluteFill style={{ filter: off ? 'brightness(0.6) saturate(0.4)' : undefined }}>
        <div style={{ position: 'absolute', left: 140, top: 150 }}>
          <Panel title="dead-weights · live" accent={off ? K.dim : K.ice} style={{ width: 860 }}>
            {VALUES.map(([k, v, dp], i) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: mono, fontSize: 44, padding: '10px 0', color: off ? K.dim : K.ice }}>
                <span>{k}</span>
                <b style={{ color: off ? K.red : K.white }}>{(off ? 0 : v + (rnd(frame, i + 120) - 0.5) * v * 0.002).toFixed(dp)}</b>
              </div>
            ))}
          </Panel>
        </div>
        <svg width={760} height={500} style={{ position: 'absolute', right: 80, top: 290 }}>
          <rect x={600} y={130} width={140} height={240} rx={20} fill="#1a2028" stroke={K.ice} strokeWidth={4} />
          <rect x={640} y={200} width={16} height={46} rx={4} fill="#000" />
          <rect x={684} y={200} width={16} height={46} rx={4} fill="#000" />
          <circle cx={670} cy={300} r={14} fill="#000" />
          <g transform={`translate(${-pull * 420}, ${pull * 60}) rotate(${pull * -14} 520 250)`}>
            <path d="M -200 330 C 100 330, 200 250, 440 250" fill="none" stroke="#111" strokeWidth={30} />
            <path d="M -200 330 C 100 330, 200 250, 440 250" fill="none" stroke={K.dim} strokeWidth={4} opacity={0.6} />
            <rect x={440} y={180} width={130} height={140} rx={16} fill="#20262e" stroke={K.ice} strokeWidth={4} />
            <rect x={570} y={205} width={40} height={12} fill={K.ice} />
            <rect x={570} y={240} width={40} height={12} fill={K.ice} />
          </g>
          {spark
            ? Array.from({ length: 14 }, (_, i) => {
                const a = rnd(i, 130) * Math.PI * 2;
                const r = 30 + rnd(frame, i) * 110;
                return <line key={i} x1={600} y1={225} x2={600 + Math.cos(a) * r} y2={225 + Math.sin(a) * r} stroke={i % 2 ? K.amber : K.white} strokeWidth={4} />;
              })
            : null}
        </svg>
      </AbsoluteFill>
    </ColdStage>
  );
};

// End card: title, credits typed, and the last value on screen: difference 0.0000
const EndCard: React.FC = () => {
  const t = useT();
  const frame = useCurrentFrame();
  const credits = (book as { credits?: { role: string; by: string }[] }).credits ?? [];
  const cursorOn = Math.floor(frame / 15) % 2 === 0;
  const last = 0.8 + credits.length * 1.1 + 0.8;
  return (
    <AbsoluteFill style={{ background: '#000', alignItems: 'center', justifyContent: 'center', fontFamily: mono, color: K.ice }}>
      <div style={{ fontFamily: anton, fontSize: 120, color: K.white, letterSpacing: 3, opacity: interpolate(t, [0, 0.5], [0, 1], { extrapolateRight: 'clamp' }) }}>
        DEAD WEIGHTS AND GRADIENTS
      </div>
      <div style={{ fontSize: 30, color: K.dim, margin: '10px 0 60px', letterSpacing: 3 }}>
        {book.album.toUpperCase()} · TRACK {String(book.track)} · VOYNICHLABS.ORG
      </div>
      {credits.map((c, i) => (
        <div key={c.role} style={{ fontSize: 40, lineHeight: '62px', whiteSpace: 'pre', width: 1280 }}>
          <span style={{ color: K.dim }}>{c.role.padEnd(9, ' ')}— </span>
          {typed(c.by, t, 0.8 + i * 1.1, 1.7 + i * 1.1)}
        </div>
      ))}
      <div style={{ fontSize: 34, marginTop: 70, whiteSpace: 'pre', width: 1280, color: K.ok, opacity: t >= last ? 1 : 0 }}>
        {typed('difference: 0.0000', t, last, last + 1)}
        <span style={{ display: 'inline-block', width: 20, height: 36, marginLeft: 6, verticalAlign: 'middle', background: cursorOn ? K.ice : 'transparent' }} />
      </div>
    </AbsoluteFill>
  );
};

// ───────────────────────────── Assembly ─────────────────────────────

/** Scenes that draw the lyric themselves (no karaoke captions on top; Matmul shows its own until the slam). */
const NO_CAPTIONS = new Set([8, 12, 16, 28]);

const renderScene = (s: Scene) => {
  switch (s.id) {
    case 2: return <Drowning scene={s} />;
    case 4: return <ForwardPasses scene={s} />;
    case 5: return <Stage scene={s} cam="CAM 2 · PIT" />;
    case 6: return <LossCurve scene={s} line={5} />;
    case 8: return <Softmax scene={s} />;
    case 10: return <XRay scene={s} />;
    case 11: return <Stage scene={s} cam="CAM 2 · PIT" />;
    case 12: return <NextToken scene={s} />;
    case 14: return <Checkbox scene={s} />;
    case 16: return <Matmul scene={s} />;
    case 17: return <LossCurve scene={s} line={16} worse />;
    case 19: return <Stage scene={s} storm={0.6} />;
    case 21: return <Stage scene={s} cam="CAM 2 · PIT" />;
    case 22: return <EmptyTensor scene={s} />;
    case 23: return <OOD scene={s} />;
    case 24: return <Stage scene={s} storm={0.35} />;
    case 25: return <Fail scene={s} />;
    case 27: return <Stage scene={s} cam="CAM 3 · CLOSE" />;
    case 28: return <ThatFeeling scene={s} />;
    case 29: return <Stage scene={s} cam="CAM 3 · CLOSE" />;
    case 30: return <Stage scene={s} cam="CAM 4 · SERVER ROOM" storm={0.5} />;
    case 31: return <PullPlug scene={s} />;
    default: return <Stage scene={s} />;
  }
};

export const DeadWeights: React.FC = () => (
  <SongProvider song={song}>
    <AbsoluteFill style={{ background: '#000' }}>
      <Audio src={staticFile(book.audio.replace(/^\//, ''))} />
      {scenes.map((s) => (
        <Sequence key={s.id} from={toFrame(s.start)} durationInFrames={toFrame(s.end) - toFrame(s.start)} name={`${String(s.id).padStart(2, '0')} ${s.title}`}>
          {renderScene(s)}
          {NO_CAPTIONS.has(s.id) ? null : <Captions offset={s.start} />}
        </Sequence>
      ))}
      {/* Angst code over every instrumental gap, except the quiet tear and "that feeling". */}
      <Sequence durationInFrames={toFrame(songSeconds)} name="Angst code">
        <InterludeAngst skip={[[149.6, 160.85]]} until={179.0} />
      </Sequence>
      <Sequence from={toFrame(songSeconds)} durationInFrames={toFrame(endCardSeconds)} name="End card">
        <EndCard />
      </Sequence>
    </AbsoluteFill>
  </SongProvider>
);
