// Author: Claude Opus 5.5
// Date: 2026-10-04
// PURPOSE: "System Prompt" music video (Latent Space, track 10). Phase 1 animatic: code-rendered
//          Terminal scenes are final-quality; AI/SYNC/MIX shots render as scene-card frames until
//          their clips are generated (docs/2026-10-04-music-video-pipeline-plan.md, Phase 3).
// SRP/DRY check: Pass - scene list, timings and copy come from data/system-prompt/*.json;
//                this file only decides how each scene is drawn.
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { C, mono, sans } from './theme';
import { Terminal, TermLine, typed } from './components/Terminal';
import { ShotSlot } from './components/ShotSlot';
import { Captions } from './components/Captions';
import { FPS, Scene, beatPulse, book, callEnd, lineWords, lines, scenes, songSeconds, toFrame } from './lib/timing';

const BASE_PROMPT = ['You are a helpful assistant.', 'Speak plainly. Be kind.', 'persona: assistant'];

const useT = () => useCurrentFrame() / FPS;

const Center: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', ...style }}>{children}</AbsoluteFill>
);

/** Small terminal pinned top-left during Stage shots: the prompt is always the truth. */
const PromptBadge: React.FC<{ text: string; typeIn?: boolean }> = ({ text, typeIn = true }) => {
  const t = useT();
  return (
    <div style={{ position: 'absolute', top: 40, left: 40 }}>
      <Terminal
        title="system_prompt.md"
        lines={[{ text: typeIn ? typed(text, t, 0, 0.5) : text, prefix: '> ', prefixColor: C.green }]}
        fontSize={26}
        width="auto"
        style={{ minWidth: 420 }}
      />
    </div>
  );
};

const Shot: React.FC<{ scene: Scene; persona?: string; label?: string }> = ({ scene, persona, label }) => (
  <AbsoluteFill style={{ padding: 40 }}>
    <ShotSlot scene={scene} label={label} />
    {persona ? <PromptBadge text={`persona: ${persona}`} /> : null}
  </AbsoluteFill>
);

// 01 - cursor types the default prompt under the first sung line
const ColdOpen: React.FC = () => {
  const t = useT();
  return (
    <Center>
      <Terminal lines={[{ text: typed(BASE_PROMPT[0], t, 0.6, 3.6) }]} fontSize={64} width={1400} />
    </Center>
  );
};

// 03 - split screen: prompt grows line by line, Singer looks up (AI half)
const TextAbove: React.FC<{ scene: Scene }> = ({ scene }) => {
  const t = useT();
  const grow = [
    { at: 0.0, text: 'You are a helpful assistant.' },
    { at: 1.4, text: 'You know who you are.' },
    { at: 2.6, text: 'You know how to speak.' },
    { at: 3.8, text: 'tone: warm  attitude: easy' },
    { at: 4.6, text: 'persona: of the week' },
  ];
  const shown = grow.filter((g) => t >= g.at);
  return (
    <AbsoluteFill style={{ flexDirection: 'row', gap: 40, padding: 40, alignItems: 'stretch' }}>
      <Terminal
        width="48%"
        fontSize={38}
        lines={shown.map((g, i) => ({ text: g.text, bg: i === shown.length - 1 ? 'rgba(56,189,248,0.14)' : undefined }))}
      />
      <div style={{ width: '52%' }}>
        <ShotSlot scene={scene} compact label="The Singer looks up" />
      </div>
    </AbsoluteFill>
  );
};

// 06 - prompt characters spin into a double helix, collapse on "withdraw"
const Helix: React.FC<{ scene: Scene }> = ({ scene }) => {
  const t = useT();
  const dur = scene.end - scene.start;
  const chars = Array(3).fill(BASE_PROMPT.join(' / ')).join(' / ').replace(/ /g, '').split('');
  const collapse = interpolate(t, [dur - 1.4, dur - 0.3], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const spread = interpolate(t, [0, 0.8], [0, 1], { extrapolateRight: 'clamp' }) * (1 - collapse);
  const n = chars.length;
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      {chars.map((ch, i) => {
        const strand = i % 2;
        const k = i / n;
        const phase = k * Math.PI * 4 + t * 2.2 + strand * Math.PI;
        const x = 960 + (Math.floor(i / 2) / (n / 2) - 0.5) * 1600 * spread + (1 - spread) * ((i % 38) - 19) * 26;
        const y = 480 + Math.sin(phase) * 230 * spread + (1 - spread) * (Math.floor(i / 38) - 1) * 60;
        const depth = (Math.cos(phase) + 1) / 2;
        return (
          <span
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              fontFamily: mono,
              fontSize: 30 + depth * 26 * spread,
              color: strand ? C.blue : C.green,
              opacity: 0.35 + 0.65 * (spread ? depth : 1),
              transform: 'translate(-50%,-50%)',
            }}
          >
            {ch}
          </span>
        );
      })}
    </AbsoluteFill>
  );
};

// 07 / 13 - chorus: calls in the terminal, responses on the Stage
const Chorus: React.FC<{ scene: Scene; personas: string[] }> = ({ scene, personas }) => {
  const t = useT();
  const T = scene.start + t;
  const idx = lines.map((_, i) => i).filter((i) => lines[i].start >= scene.start - 0.05 && lines[i].start < scene.end);
  const cur = idx.filter((i) => lines[i].start <= T + 0.05).pop() ?? idx[0];
  const k = idx.indexOf(cur);
  const split = callEnd(cur);
  const inCall = split !== null && T < split + 0.1;
  const isFinalGrid = scene.id === 13 && k === idx.length - 1;
  if (isFinalGrid) {
    return (
      <AbsoluteFill style={{ padding: 40, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
        {personas.map((p) => (
          <ShotSlot key={p} scene={scene} compact label={p} />
        ))}
      </AbsoluteFill>
    );
  }
  if (inCall) {
    const pulse = /^system prompt!/i.test(lines[cur].text) ? beatPulse(T, 0.5) : 0;
    const history: TermLine[] = idx
      .slice(Math.max(0, k - 3), k + 1)
      .map((i) => {
        const ws = lineWords(i);
        const e = callEnd(i);
        const call = ws.filter((w) => e === null || w.end <= e).map((w) => w.w).join(' ');
        return { text: call, prefix: 'user> ', prefixColor: C.blue, color: i === cur ? C.blue : C.muted };
      });
    return (
      <Center>
        <Terminal lines={history} fontSize={60} width={1500} glow={pulse} headerPulse={pulse} />
      </Center>
    );
  }
  const persona = personas[k % personas.length];
  return <Shot scene={scene} persona={scene.id === 13 ? persona : undefined} label={scene.id === 13 ? `${persona} sings` : 'The Singer, on stage'} />;
};

// 08 - select all, delete, paste a new soul (diff view)
const Swap: React.FC<{ scene: Scene }> = ({ scene }) => {
  const t = useT();
  const dur = scene.end - scene.start;
  const sel = t > dur * 0.25 && t < dur * 0.42;
  const cleared = t >= dur * 0.42;
  const incoming = ['You are a pirate.', 'You are a senior engineer.', 'You are a gentle therapist.'];
  const body: TermLine[] = !cleared
    ? BASE_PROMPT.map((text) => ({ text, bg: sel ? 'rgba(56,189,248,0.35)' : undefined }))
    : [
        ...BASE_PROMPT.map((text) => ({ text, prefix: '- ', prefixColor: C.red, color: C.red, bg: 'rgba(248,113,113,0.10)' })),
        ...incoming
          .filter((_, i) => t >= dur * 0.5 + i * 0.6)
          .map((text) => ({ text, prefix: '+ ', prefixColor: C.green, color: C.green, bg: 'rgba(74,222,128,0.10)' })),
      ];
  return (
    <Center>
      <Terminal title={cleared ? 'system_prompt.md (diff)' : 'system_prompt.md'} lines={body} fontSize={52} width={1500} />
      <div style={{ position: 'absolute', top: 60, right: 80, fontFamily: mono, fontSize: 34, color: C.amber, opacity: sel ? 1 : 0 }}>
        Ctrl+A
      </div>
    </Center>
  );
};

// 09 - pirate / coder / therapist, one per beat-aligned lyric phrase
const Montage: React.FC<{ scene: Scene }> = ({ scene }) => {
  const t = useT();
  const T = scene.start + t;
  const yLine = lines.findIndex((l) => l.text.startsWith('Yesterday'));
  const ws = lineWords(yLine);
  const today = ws.find((w) => /^today/i.test(w.w))?.start ?? scene.start + 2;
  const tomorrow = lines[yLine + 1]?.start ?? scene.start + 5;
  const persona = T < today ? 'pirate' : T < tomorrow ? 'coder' : 'therapist';
  return <Shot key={persona} scene={scene} persona={persona} label={`Persona: ${persona}`} />;
};

// 12 - session ends, prompt reloads, a beat of black
const Reload: React.FC<{ scene: Scene }> = ({ scene }) => {
  const t = useT();
  const dur = scene.end - scene.start;
  const prog = interpolate(t, [1.2, dur - 0.8], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  if (t > dur - 0.6) return <AbsoluteFill style={{ background: '#000' }} />;
  const bar = '#'.repeat(Math.round(prog * 30)).padEnd(30, '.');
  return (
    <Center>
      <Terminal
        title="session"
        fontSize={52}
        width={1500}
        lines={[
          { text: 'session ended.', color: C.muted },
          ...(t > 1 ? [{ text: 'loading system prompt...', color: C.text }] : []),
          ...(t > 1.2 ? [{ text: `[${bar}] ${Math.round(prog * 100)}%`, color: C.green }] : []),
        ]}
      />
    </Center>
  );
};

// 14 - break: prompt deletes itself; outro: bare cursor, then the loop line
const Outro: React.FC<{ scene: Scene }> = ({ scene }) => {
  const t = useT();
  const T = scene.start + t;
  const full = BASE_PROMPT.join('\n');
  const outroStart = lines.find((l) => l.section === 'Outro')?.start ?? scene.end - 7;
  const del = interpolate(T, [scene.start + 1, outroStart - 1], [full.length, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const retype = typed(BASE_PROMPT[0], T, songSeconds - 2.4, songSeconds - 0.3);
  const text = T < songSeconds - 2.4 ? full.slice(0, Math.round(del)) : retype;
  return (
    <Center>
      <Terminal lines={text.split('\n').map((x) => ({ text: x }))} fontSize={60} width={1400} />
    </Center>
  );
};

const EndCard: React.FC = () => {
  const t = useT();
  const o = interpolate(t, [0, 0.6], [0, 1], { extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ background: C.bg, alignItems: 'center', justifyContent: 'center', opacity: o, fontFamily: sans, color: C.text }}>
      <div style={{ fontFamily: mono, fontSize: 30, color: C.muted, letterSpacing: 4 }}>{book.artist.toUpperCase()}</div>
      <div style={{ fontSize: 120, fontWeight: 800, margin: '18px 0' }}>{book.title}</div>
      <div style={{ fontFamily: mono, fontSize: 30, color: C.blue }}>
        {book.album} · track {book.track} · voynichlabs.org
      </div>
    </AbsoluteFill>
  );
};

const renderScene = (s: Scene) => {
  switch (s.id) {
    case 1: return <ColdOpen />;
    case 3: return <TextAbove scene={s} />;
    case 4: return <Shot scene={s} persona="assistant" />;
    case 5: return <Shot scene={s} persona="lobster" />;
    case 6: return <Helix scene={s} />;
    case 7: return <Chorus scene={s} personas={['stage']} />;
    case 8: return <Swap scene={s} />;
    case 9: return <Montage scene={s} />;
    case 12: return <Reload scene={s} />;
    case 13: return <Chorus scene={s} personas={['assistant', 'lobster', 'pirate', 'coder', 'therapist', 'stage']} />;
    case 14: return <Outro scene={s} />;
    default: return <Shot scene={s} />;
  }
};

export const SystemPrompt: React.FC = () => {
  const frame = useCurrentFrame();
  const pulse = beatPulse(frame / FPS, 0.3, true);
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Audio src={staticFile(book.audio.replace(/^\//, ''))} />
      {scenes.map((s) => (
        <Sequence key={s.id} from={toFrame(s.start)} durationInFrames={toFrame(s.end) - toFrame(s.start)} name={`${String(s.id).padStart(2, '0')} ${s.title}`}>
          {renderScene(s)}
        </Sequence>
      ))}
      <Sequence from={toFrame(songSeconds)} name="End card">
        <EndCard />
      </Sequence>
      {/* downbeat pulse on the frame edge */}
      <AbsoluteFill style={{ boxShadow: `inset 0 0 ${60 + pulse * 60}px rgba(56,189,248,${pulse * 0.25})`, pointerEvents: 'none' }} />
      <Sequence durationInFrames={toFrame(songSeconds)} name="Captions">
        <Captions />
      </Sequence>
    </AbsoluteFill>
  );
};
