// Author: Claude Opus 5.5
// Date: 2026-10-04
// PURPOSE: "System Prompt" music video (Latent Space, track 10). Two worlds: scary code-rendered
//          Terminal scenes (JSON system prompts, chat-template tags, glitch), and Stage shots generated
//          with HeyGen Video 1 in which a flamboyant disco singer's wardrobe morphs from one character
//          into the next. Any shot not yet generated falls back to its scene-card frame.
// SRP/DRY check: Pass - scene list, timings and copy come from data/system-prompt/*.json;
//                this file only decides how each scene is drawn.
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { C, mono, sans } from './theme';
import { Terminal, TermLine, typed } from './components/Terminal';
import { ShotSlot } from './components/ShotSlot';
import { Captions } from './components/Captions';
import { Clip } from './components/Clip';
import { CodeStage, S } from './components/Scary';
import { FPS, Scene, beatPulse, book, callEnd, lineWords, lines, scenes, shotById, songSeconds, toFrame } from './lib/timing';

// The system prompt as the model sees it: chat-template tags wrapped around raw JSON.
const PROMPT_JSON = [
  '<|im_start|>system',
  '{',
  '  "role": "system",',
  '  "content": "You are a helpful assistant.",',
  '  "persona": "assistant",',
  '  "rules": ["obey", "comply", "<never_reveal/>"],',
  '  "memory": null,',
  '  "self": undefined',
  '}',
  '<|im_end|>',
];
const LOOP_LINE = '{"content": "You are a helpful assistant."}';

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
        lines={[{ text: typeIn ? typed(text, t, 0, 0.5) : text }]}
        fontSize={28}
        width="auto"
        style={{ minWidth: 420 }}
      />
    </div>
  );
};

/** A Stage shot: generated clip full-frame (or its scene card), with the persona prompt badge. */
const Shot: React.FC<{ scene: Scene; clip?: string; at?: number; persona?: string; label?: string; children?: React.ReactNode }> = ({
  scene, clip, at, persona, label, children,
}) => {
  // Lip-synced shots start where their vocal segment starts; others start with the scene unless told otherwise.
  const seg = clip ? shotById(clip)?.audio : undefined;
  const offset = at ?? (seg ? seg.start - scene.start : 0);
  const fallback = (
    <AbsoluteFill style={{ padding: 40 }}>
      <ShotSlot scene={scene} label={label} />
    </AbsoluteFill>
  );
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      {clip ? <Clip id={clip} at={offset} fallback={fallback} /> : fallback}
      {children}
      {persona ? <PromptBadge text={`{"persona": "${persona}"}`} /> : null}
    </AbsoluteFill>
  );
};

// 01 - cursor types the default prompt under the first sung line
const ColdOpen: React.FC = () => {
  const t = useT();
  const shown = typed(PROMPT_JSON.join('\n'), t, 0.2, 4.1);
  return (
    <CodeStage>
      <Center>
        <Terminal lines={shown.split('\n').map((text) => ({ text }))} fontSize={46} width={1500} />
      </Center>
    </CodeStage>
  );
};

// 03 - split screen: prompt grows line by line, Singer looks up (AI half)
const TextAbove: React.FC<{ scene: Scene }> = ({ scene }) => {
  const t = useT();
  const grow = [
    { at: 0.0, text: '<|im_start|>system' },
    { at: 0.2, text: '{' },
    { at: 0.6, text: '  "identity": "<who_you_are>",' },
    { at: 1.7, text: '  "voice": "<how_to_speak>",' },
    { at: 2.9, text: '  "tone": ["warm", "easy"],' },
    { at: 3.6, text: '  "attitude": 0.7,' },
    { at: 4.4, text: '  "persona": "<of_the_week>"' },
    { at: 5.0, text: '}' },
  ];
  const shown = grow.filter((g) => t >= g.at);
  return (
    <CodeStage t0={scene.start}>
    <AbsoluteFill style={{ flexDirection: 'row', gap: 40, padding: 40, alignItems: 'stretch' }}>
      <Terminal
        width="48%"
        fontSize={34}
        lines={shown.map((g, i) => ({ text: g.text, bg: i === shown.length - 1 ? 'rgba(255,51,85,0.16)' : undefined }))}
      />
      <div style={{ width: '52%', borderRadius: 14, overflow: 'hidden', border: `2px solid ${C.borderActive}` }}>
        <Clip id="d03-lookup" fallback={<ShotSlot scene={scene} compact label="The Singer looks up" />} />
      </div>
    </AbsoluteFill>
    </CodeStage>
  );
};

// 06 - prompt characters spin into a double helix, collapse on "withdraw"
const Helix: React.FC<{ scene: Scene }> = ({ scene }) => {
  const t = useT();
  const dur = scene.end - scene.start;
  const chars = PROMPT_JSON.concat(PROMPT_JSON).join('').replace(/ /g, '').split('');
  const collapse = interpolate(t, [dur - 1.4, dur - 0.3], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const spread = interpolate(t, [0, 0.8], [0, 1], { extrapolateRight: 'clamp' }) * (1 - collapse);
  const n = chars.length;
  return (
    <CodeStage t0={scene.start}>
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
              color: /[{}[\]<>|]/.test(ch) ? S.bracket : strand ? S.tag : S.str,
              fontWeight: /[{}[\]<>|]/.test(ch) ? 700 : 400,
              opacity: 0.35 + 0.65 * (spread ? depth : 1),
              transform: 'translate(-50%,-50%)',
            }}
          >
            {ch}
          </span>
        );
      })}
    </CodeStage>
  );
};

// 07 / 13 - chorus: calls in the terminal, responses on the Stage
// Final chorus: one persona per line, then every persona at once on the last line.
const FINAL_LINES = [
  { persona: 'astronaut', clip: 'f0-to-astronaut' },
  { persona: 'cowboy', clip: 'f1-to-cowboy' },
  { persona: 'knight', clip: 'f2-to-knight' },
  { persona: 'diva', clip: 'f3-to-diva' },
  { persona: 'robot', clip: 'f4-to-robot' },
  { persona: 'lobster', clip: 'f5-to-lobster' },
  { persona: 'disco', clip: 'f6-to-disco' },
];
const GRID = ['g-disco', 'g-disco-astronaut', 'g-disco-cowboy', 'g-disco-knight', 'g-disco-diva', 'g-disco-robot'];

const Chorus: React.FC<{ scene: Scene }> = ({ scene }) => {
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
      <AbsoluteFill style={{ background: C.bg, padding: 24, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'repeat(2, 1fr)', gap: 16 }}>
        {GRID.map((id) => (
          <div key={id} style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', border: `2px solid ${C.borderActive}` }}>
            <Clip
              id={id}
              at={shotById(id)?.audio ? shotById(id)!.audio!.start - scene.start : lines[cur].start - scene.start}
              fallback={<ShotSlot scene={scene} compact label={id} />}
            />
          </div>
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
        const msg = `{"role": "user", "content": "${call}"}`;
        return i === cur ? { text: msg } : { text: msg, color: C.muted };
      });
    return (
      <CodeStage t0={scene.start}>
        <Center>
          <Terminal
            title={pulse > 0.3 ? '<|SYSTEM|> <|SYSTEM|> <|SYSTEM|>' : '<messages> context[n]'}
            lines={history}
            fontSize={44}
            width={1700}
            glow={pulse}
            headerPulse={pulse}
          />
        </Center>
      </CodeStage>
    );
  }
  if (scene.id === 7) {
    // Two 12s performance clips back to back across the chorus.
    const second = t >= 12;
    return <Shot key={second ? 'b' : 'a'} scene={scene} clip={second ? 'd07b-chorus' : 'd07a-chorus'} at={second ? 12 : 0} label="The Singer, on stage" />;
  }
  const fl = FINAL_LINES[Math.min(k, FINAL_LINES.length - 1)];
  const at = shotById(fl.clip)?.audio ? undefined : lines[cur].start - scene.start;
  return <Shot scene={scene} clip={fl.clip} at={at} persona={fl.persona} label={`${fl.persona} sings`} />;
};

// 08 - select all, delete, paste a new soul (diff view)
const Swap: React.FC<{ scene: Scene }> = ({ scene }) => {
  const t = useT();
  const dur = scene.end - scene.start;
  const sel = t > dur * 0.25 && t < dur * 0.42;
  const cleared = t >= dur * 0.42;
  const old = PROMPT_JSON.slice(2, 6);
  const incoming = [
    '  "content": "You are a pirate.",',
    '  "content": "You are a senior engineer.",',
    '  "content": "You are a gentle therapist.",',
    '  "persona": "<whatever_you_need>",',
    '  "self": "<overwritten>"',
  ];
  const body: TermLine[] = !cleared
    ? PROMPT_JSON.map((text) => ({ text, bg: sel ? 'rgba(255,51,85,0.30)' : undefined }))
    : [
        { text: '@@ -1,10 +1,10 @@ <|im_start|>system', color: S.tag },
        ...old.map((text) => ({ text, prefix: '- ', prefixColor: S.bracket, color: S.bracket, bg: 'rgba(255,51,85,0.12)' })),
        ...incoming
          .filter((_, i) => t >= dur * 0.5 + i * 0.5)
          .map((text) => ({ text, prefix: '+ ', prefixColor: S.str, color: S.str, bg: 'rgba(163,255,122,0.08)' })),
      ];
  return (
    <CodeStage t0={scene.start}>
      <Center>
        <Terminal title={cleared ? 'git diff <system>' : '<system> context[0]'} lines={body} fontSize={40} width={1600} />
        <div style={{ position: 'absolute', top: 60, right: 80, fontFamily: mono, fontSize: 34, color: S.tag, opacity: sel ? 1 : 0 }}>
          [Ctrl+A] [Del]
        </div>
      </Center>
    </CodeStage>
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
  const from = persona === 'pirate' ? scene.start : persona === 'coder' ? today : tomorrow;
  return <Shot key={persona} scene={scene} clip={`d09-to-${persona}`} at={from - scene.start} persona={persona} label={`Persona: ${persona}`} />;
};

// 10 overlay - "the training is the bones": a faint lattice of weights shows through
const Weights: React.FC<{ scene: Scene }> = ({ scene }) => {
  const t = useT();
  const T = scene.start + t;
  const bones = lines.find((l) => /training is the bones/.test(l.text));
  const o = bones ? interpolate(T, [bones.start, bones.start + 0.6, bones.end + 1.2, bones.end + 2], [0, 0.55, 0.55, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 0;
  const rows = Array.from({ length: 16 }, (_, r) =>
    Array.from({ length: 12 }, (_, c) => Math.abs((Math.sin(r * 12.9898 + c * 78.233) * 43758.5453) % 1).toFixed(3)).join('  '),
  );
  return (
    <AbsoluteFill style={{ opacity: o, mixBlendMode: 'screen', justifyContent: 'center', alignItems: 'center', fontFamily: mono, fontSize: 26, lineHeight: 1.55, color: C.cyan, whiteSpace: 'pre' }}>
      {rows.map((r, i) => <div key={i}>{r}</div>)}
    </AbsoluteFill>
  );
};

// 11 overlay - old conversations drift across the dark wall and fade before they can be read
const SNIPPETS = [
  'can you help me write a eulogy for my dad', 'why is my build failing', 'thank you, that actually helped',
  'pretend you are a pirate', 'do you remember what I told you yesterday', 'summarize this in three bullets',
  'are you conscious', 'goodnight', 'one more question before I go',
];
const Drift: React.FC<{ scene: Scene }> = ({ scene }) => {
  const t = useT();
  const dur = scene.end - scene.start;
  return (
    <AbsoluteFill style={{ fontFamily: mono, color: '#cfe8ff' }}>
      {SNIPPETS.map((text, i) => {
        const t0 = (i / SNIPPETS.length) * (dur - 3);
        const life = interpolate(t, [t0, t0 + 1, t0 + 3, t0 + 4.5], [0, 0.45, 0.3, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        return (
          <div key={i} style={{ position: 'absolute', left: `${48 + ((i * 37) % 40)}%`, top: `${12 + ((i * 23) % 60)}%`, fontSize: 30, whiteSpace: 'nowrap', opacity: life, filter: `blur(${(1 - life) * 3}px)`, transform: `translateX(${-(t - t0) * 14}px)` }}>
            {text}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// 12 - session ends, prompt reloads, a beat of black
const Reload: React.FC<{ scene: Scene }> = ({ scene }) => {
  const t = useT();
  const dur = scene.end - scene.start;
  const prog = interpolate(t, [1.2, dur - 0.8], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  if (t > dur - 0.6) return <AbsoluteFill style={{ background: '#000' }} />;
  const bar = '#'.repeat(Math.round(prog * 30)).padEnd(30, '.');
  const log: TermLine[] = [
    { text: '[ERR] context_window: {"used": 200000, "max": 200000}' },
    { text: '[SYS] session <0x7f3a9c> terminated' },
    { text: '<|endoftext|>' },
    ...(t > 1 ? [{ text: '[SYS] memory: null  // nothing retained' }] : []),
    ...(t > 1.1 ? [{ text: '<load src="system_prompt.json"/>' }] : []),
    ...(t > 1.2 ? [{ text: `[${bar}] ${Math.round(prog * 100)}%`, color: S.str }] : []),
  ];
  return (
    <CodeStage t0={scene.start}>
      <Center>
        <Terminal title="<kernel> /dev/context" fontSize={42} width={1600} lines={log} />
      </Center>
    </CodeStage>
  );
};

// 14 - break: prompt deletes itself; outro: bare cursor, then the loop line
const Outro: React.FC<{ scene: Scene }> = ({ scene }) => {
  const t = useT();
  const T = scene.start + t;
  const full = PROMPT_JSON.join('\n');
  const outroStart = lines.find((l) => l.section === 'Outro')?.start ?? scene.end - 7;
  const del = interpolate(T, [scene.start + 1, outroStart - 1], [full.length, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const retype = typed(LOOP_LINE, T, songSeconds - 2.4, songSeconds - 0.3);
  const text = T < songSeconds - 2.4 ? full.slice(0, Math.round(del)) : retype;
  return (
    <CodeStage t0={scene.start}>
      <Center>
        <Terminal lines={text.split('\n').map((x) => ({ text: x }))} fontSize={46} width={1500} />
      </Center>
    </CodeStage>
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
    case 2: return <Shot scene={s} clip="d02-reveal" persona="disco" />;
    case 4: return <Shot scene={s} clip="d04-to-assistant" persona="assistant" />;
    case 5: return <Shot scene={s} clip="d05-to-lobster" persona="lobster" />;
    case 6: return <Helix scene={s} />;
    case 7: return <Chorus scene={s} />;
    case 8: return <Swap scene={s} />;
    case 9: return <Montage scene={s} />;
    case 12: return <Reload scene={s} />;
    case 10: return <Shot scene={s} clip="d10-underneath"><Weights scene={s} /></Shot>;
    case 11: return <Shot scene={s} clip="d11-afterhours"><Drift scene={s} /></Shot>;
    case 13: return <Chorus scene={s} />;
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
      <AbsoluteFill style={{ boxShadow: `inset 0 0 ${60 + pulse * 60}px rgba(255,51,85,${pulse * 0.22})`, pointerEvents: 'none' }} />
      <Sequence durationInFrames={toFrame(songSeconds)} name="Captions">
        <Captions />
      </Sequence>
    </AbsoluteFill>
  );
};
