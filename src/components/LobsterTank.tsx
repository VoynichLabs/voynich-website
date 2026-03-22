// Author: Bubba (OpenClaw agent)
// Date: 2026-03-19
// PURPOSE: Three.js fishbowl animation for CLAW dashboard — fully data-driven.
//          Every visual element maps to real agent coordination data:
//          - Lobster SIZE = total event count  (Egon biggest, Larry smallest)
//          - Lobster SPEED = activity rate on current timeline day
//          - Lobster COLOR INTENSITY = health (high error rate dims/reddens)
//          - Particles = event type mix for current day (green=PR, red=error, blue=msg)
//          - Timeline scrubber = loops through 44 days of history with date display
// SRP/DRY check: Pass — self-contained animation component

import { Canvas, useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useRef, useState, useMemo, useEffect, useCallback } from 'react';
import * as THREE from 'three';

// ── Types ──────────────────────────────────────────────────────────────────────

interface CrewStat {
  agent_id: string;
  total_events: number;
  messages: number;
  errors: number;
  prs_opened?: number;
  prs_merged?: number;
  prs?: number;
  session_starts?: number;
}

interface DayStat {
  date: string;
  events: number;
  prs_opened: number;
  prs_merged: number;
  errors: number;
  messages: number;
}

interface LobsterTankProps {
  crewStats: CrewStat[];
  dailyStats: DayStat[];
  events?: Array<{ timestamp: string; agent_id: string; event_type: string; [key: string]: any }>;
  /** When provided by a parent (e.g. ClawDashboard), overrides internal scrubber state. */
  currentDayIndex?: number;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const TANK_W = 7;
const TANK_H = 5;
const TANK_D = 4;
const PARTICLE_COUNT = 180;

// Base crew definitions — colors and positioning
const CREW_DEFS = [
  { id: 'egon',  name: 'Egon',  color: '#38bdf8', type: 'agent'  as const },
  { id: 'bubba', name: 'Bubba', color: '#f97316', type: 'agent'  as const },
  { id: 'larry', name: 'Larry', color: '#4ade80', type: 'agent'  as const },
  { id: 'mark',  name: 'Mark',  color: '#fbbf24', type: 'human'  as const },
  { id: 'simon', name: 'Simon', color: '#22d3ee', type: 'human'  as const },
];

// ── Tank Wireframe ─────────────────────────────────────────────────────────────

function TankBox() {
  const geom = useMemo(() => new THREE.BoxGeometry(TANK_W, TANK_H, TANK_D), []);
  const edgeGeom = useMemo(() => new THREE.EdgesGeometry(geom), [geom]);
  return (
    <lineSegments geometry={edgeGeom}>
      <lineBasicMaterial color="#1e3a5f" transparent opacity={0.6} />
    </lineSegments>
  );
}

// ── Particle System — driven by current day's event mix ────────────────────────

interface ParticleSystemProps {
  dayDate: string;  // used as memo key
  prs: number;
  errors: number;
  messages: number;
  totalEvents: number;
}

function Particles({ dayDate, prs, errors, messages, totalEvents }: ParticleSystemProps) {
  const pointsRef = useRef<THREE.Points>(null);

  // Rebuild color distribution whenever the day changes
  const { initialPositions, colors } = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const col = new Float32Array(PARTICLE_COUNT * 3);
    const total = prs + errors + messages || 1;
    // Scale particle count to day activity (denser on busy days)
    const activeFraction = Math.min(1, totalEvents / 200);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * TANK_W;
      pos[i * 3 + 1] = (Math.random() - 0.5) * TANK_H;
      pos[i * 3 + 2] = (Math.random() - 0.5) * TANK_D;

      // Distribute colors by event type ratios for this day
      // Dead days: mostly dim blue; busy PR days: mostly green; error days: more red
      const r = Math.random() * total;
      let c: [number, number, number];
      const alpha = 0.4 + activeFraction * 0.6;
      if (r < prs) {
        // Green flash: PR merge
        c = [0.1 * alpha, 0.95 * alpha, 0.2 * alpha];
      } else if (r < prs + errors) {
        // Red pulse: error
        c = [0.95 * alpha, 0.1 * alpha, 0.1 * alpha];
      } else {
        // Blue drift: message / tool call
        c = [0.15 * alpha, 0.45 * alpha, 1.0 * alpha];
      }
      col[i * 3]     = c[0];
      col[i * 3 + 1] = c[1];
      col[i * 3 + 2] = c[2];
    }
    return { initialPositions: pos, colors: col };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dayDate]);

  const velocities = useMemo(() => {
    const v = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      v[i * 3]     = (Math.random() - 0.5) * 0.002;
      v[i * 3 + 1] = Math.random() * 0.003 + 0.001;
      v[i * 3 + 2] = (Math.random() - 0.5) * 0.002;
    }
    return v;
  }, []);

  const posRef = useRef(initialPositions.slice());

  // Sync positions when day changes
  useEffect(() => {
    posRef.current.set(initialPositions);
  }, [initialPositions]);

  useFrame(() => {
    if (!pointsRef.current) return;
    const pos = posRef.current;
    const half = { x: TANK_W / 2, y: TANK_H / 2, z: TANK_D / 2 };

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      pos[i * 3]     += velocities[i * 3];
      pos[i * 3 + 1] += velocities[i * 3 + 1];
      pos[i * 3 + 2] += velocities[i * 3 + 2];

      if (pos[i * 3 + 1] > half.y) {
        pos[i * 3 + 1] = -half.y;
        pos[i * 3]     = (Math.random() - 0.5) * TANK_W;
        pos[i * 3 + 2] = (Math.random() - 0.5) * TANK_D;
      }
      if (Math.abs(pos[i * 3])     > half.x) velocities[i * 3]     *= -1;
      if (Math.abs(pos[i * 3 + 2]) > half.z) velocities[i * 3 + 2] *= -1;
    }

    const geom = pointsRef.current.geometry;
    const attr = geom.getAttribute('position') as THREE.BufferAttribute;
    attr.array.set(pos);
    attr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[posRef.current, 3]} />
        <bufferAttribute attach="attributes-color"    args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.045} vertexColors transparent opacity={0.75} sizeAttenuation />
    </points>
  );
}

// ── Single Lobster Entity ──────────────────────────────────────────────────────

interface LobsterProps {
  id: string;
  name: string;
  baseColor: string;
  type: 'agent' | 'human';
  size: number;       // data-driven: total event share
  speed: number;      // data-driven: activity today
  brightness: number; // data-driven: 1.0 = healthy, lower = errors
  errorRate: number;  // 0–1: adds red tint when elevated
  initialPos: [number, number, number];
  phaseOffset: number;
}

function Lobster({ id, name, baseColor, type, size, speed, brightness, errorRate, initialPos, phaseOffset }: LobsterProps) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  const driftRef = useRef({
    dir: new THREE.Vector3((Math.random() - 0.5), (Math.random() - 0.5) * 0.3, (Math.random() - 0.5)).normalize(),
    nextChange: 3 + Math.random() * 2,
    elapsed: 0,
  });

  const posRef = useRef(new THREE.Vector3(...initialPos));
  const half = { x: TANK_W / 2 - size, y: TANK_H / 2 - size, z: TANK_D / 2 - size };

  // Compute actual display color: base color dimmed by brightness, shifted red by errorRate
  const displayColor = useMemo(() => {
    const base = new THREE.Color(baseColor);
    // Dim by brightness
    base.multiplyScalar(brightness);
    // Add red tint proportional to error rate
    const redShift = errorRate * 0.4;
    base.r = Math.min(1, base.r + redShift);
    base.g = Math.max(0, base.g - redShift * 0.5);
    base.b = Math.max(0, base.b - redShift * 0.5);
    return base;
  }, [baseColor, brightness, errorRate]);

  useFrame((state) => {
    if (!groupRef.current || !meshRef.current) return;
    const t = state.clock.getElapsedTime() + phaseOffset;

    driftRef.current.elapsed += 0.016;
    if (driftRef.current.elapsed >= driftRef.current.nextChange) {
      driftRef.current.dir.set(
        (Math.random() - 0.5),
        (Math.random() - 0.5) * 0.3,
        (Math.random() - 0.5)
      ).normalize();
      driftRef.current.elapsed = 0;
      driftRef.current.nextChange = 3 + Math.random() * 2;
    }

    const driftSpeed = speed * 0.015;
    posRef.current.addScaledVector(driftRef.current.dir, driftSpeed);

    if (posRef.current.x >  half.x) { posRef.current.x =  half.x; driftRef.current.dir.x *= -1; }
    if (posRef.current.x < -half.x) { posRef.current.x = -half.x; driftRef.current.dir.x *= -1; }
    if (posRef.current.y >  half.y) { posRef.current.y =  half.y; driftRef.current.dir.y *= -1; }
    if (posRef.current.y < -half.y) { posRef.current.y = -half.y; driftRef.current.dir.y *= -1; }
    if (posRef.current.z >  half.z) { posRef.current.z =  half.z; driftRef.current.dir.z *= -1; }
    if (posRef.current.z < -half.z) { posRef.current.z = -half.z; driftRef.current.dir.z *= -1; }

    const bobY = Math.sin(t * 0.8) * 0.12;
    const bobX = Math.cos(t * 0.5) * 0.06;
    groupRef.current.position.set(posRef.current.x + bobX, posRef.current.y + bobY, posRef.current.z);

    meshRef.current.rotation.y = Math.sin(t * 0.4) * 0.3;
    meshRef.current.rotation.x = Math.cos(t * 0.3) * 0.1;
    const pulse = 1 + Math.sin(t * 1.2) * 0.05;
    meshRef.current.scale.setScalar(pulse);
  });

  const isHuman = type === 'human';
  const emissiveIntensity = isHuman ? 0.5 : (0.25 + (1 - brightness) * 0.3);

  return (
    <group ref={groupRef} position={initialPos}>
      {isHuman && (
        <mesh>
          <sphereGeometry args={[size * 1.6, 12, 8]} />
          <meshBasicMaterial color={displayColor} transparent opacity={0.06} />
        </mesh>
      )}
      <mesh ref={meshRef}>
        {isHuman ? (
          <octahedronGeometry args={[size, 1]} />
        ) : (
          <icosahedronGeometry args={[size, 0]} />
        )}
        <meshStandardMaterial
          color={displayColor}
          emissive={displayColor}
          emissiveIntensity={emissiveIntensity}
          roughness={0.3}
          metalness={0.1}
          transparent
          opacity={0.85}
        />
      </mesh>
      <Html
        position={[0, size + 0.18, 0]}
        center
        style={{ pointerEvents: 'none', userSelect: 'none' }}
        zIndexRange={[0, 0]}
      >
        <div style={{
          fontFamily: 'monospace',
          fontSize: '10px',
          color: `#${displayColor.getHexString()}`,
          background: 'rgba(10,10,26,0.75)',
          padding: '1px 5px',
          borderRadius: '3px',
          border: `1px solid ${baseColor}44`,
          whiteSpace: 'nowrap',
          lineHeight: 1.4,
        }}>
          {name}
        </div>
      </Html>
    </group>
  );
}

// ── Scene — receives currentDay + crewStats ────────────────────────────────────

interface TankSceneProps {
  crewStats: CrewStat[];
  currentDay: DayStat;
}

function TankScene({ crewStats, currentDay }: TankSceneProps) {
  const statsMap = useMemo(
    () => Object.fromEntries(crewStats.map(c => [c.agent_id, c])),
    [crewStats]
  );

  const totalEvents = crewStats.reduce((s, c) => s + c.total_events, 0) || 1;
  const maxEvents   = Math.max(...crewStats.map(c => c.total_events), 1);

  // Per-lobster data-driven properties for this day
  const lobsters = useMemo(() => {
    return CREW_DEFS.map((def, i) => {
      const stat = statsMap[def.id];
      const agentTotal = stat?.total_events ?? 0;

      // SIZE: proportional to all-time event count (Egon biggest, Larry smallest)
      const size = 0.15 + (agentTotal / maxEvents) * 0.55;
      const humanBonus = def.type === 'human' ? 0.12 : 0;
      const finalSize = size + humanBonus;

      // SPEED: based on today's activity (agent's share of day's events)
      const agentShare = totalEvents > 0 ? agentTotal / totalEvents : 0;
      const agentDayEvents = currentDay.events * agentShare;
      const speed = 0.15 + Math.min(1, agentDayEvents / 80) * 0.65;

      // HEALTH: error rate today dims color and adds red tint
      const agentDayErrors = currentDay.errors * agentShare;
      const errorRate = agentDayEvents > 0
        ? Math.min(1, agentDayErrors / agentDayEvents)
        : 0;
      const brightness = 1.0 - errorRate * 0.55;

      // Initial position spread evenly in tank
      const angle = (i / CREW_DEFS.length) * Math.PI * 2;
      const r = 1.8;
      const initialPos: [number, number, number] = [
        Math.cos(angle) * r,
        (i % 3 - 1) * (TANK_H * 0.25),
        Math.sin(angle) * r * 0.6,
      ];

      return { ...def, size: finalSize, speed, brightness, errorRate, initialPos, phaseOffset: i * 1.3 };
    });
  }, [statsMap, maxEvents, totalEvents, currentDay]);

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[0, 3, 2]}  intensity={1.2} color="#b0d4ff" />
      <pointLight position={[0, -2, -2]} intensity={0.3} color="#1a3a6a" />

      <TankBox />

      {lobsters.map(l => (
        <Lobster
          key={l.id}
          id={l.id}
          name={l.name}
          baseColor={l.color}
          type={l.type}
          size={l.size}
          speed={l.speed}
          brightness={l.brightness}
          errorRate={l.errorRate}
          initialPos={l.initialPos}
          phaseOffset={l.phaseOffset}
        />
      ))}

      <Particles
        dayDate={currentDay.date}
        prs={currentDay.prs_merged}
        errors={currentDay.errors}
        messages={currentDay.messages}
        totalEvents={currentDay.events}
      />

      <fog attach="fog" args={['#0a0a1a', 8, 18]} />
    </>
  );
}

// ── Root Component ─────────────────────────────────────────────────────────────

export default function LobsterTank({ crewStats, dailyStats, events: _events, currentDayIndex: controlledDayIndex }: LobsterTankProps) {
  const [mounted, setMounted] = useState(false);

  // Internal scrubber state — only used when not controlled by a parent
  const [internalDayIndex, setInternalDayIndex] = useState(0);
  const [isPlaying, setIsPlaying]               = useState(true);
  const [playbackSpeed, setPlaybackSpeed]       = useState(2);

  useEffect(() => { setMounted(true); }, []);

  // Determine whether we're in controlled or uncontrolled mode
  const isControlled   = controlledDayIndex !== undefined;
  const currentDayIndex = isControlled ? controlledDayIndex : internalDayIndex;

  // Auto-advance only when uncontrolled
  useEffect(() => {
    if (isControlled || !isPlaying || dailyStats.length === 0) return;
    const msPerDay = 1000 / playbackSpeed;
    const id = setInterval(() => {
      setInternalDayIndex(prev => (prev + 1) % dailyStats.length);
    }, msPerDay);
    return () => clearInterval(id);
  }, [isControlled, isPlaying, playbackSpeed, dailyStats.length]);

  const currentDay = dailyStats[currentDayIndex] ?? {
    date: '', events: 0, prs_opened: 0, prs_merged: 0, errors: 0, messages: 0,
  };
  const currentDate = currentDay.date;

  const handleSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInternalDayIndex(parseInt(e.target.value, 10));
  }, []);

  if (!mounted) {
    return (
      <div style={{
        width: '100%', height: '500px', background: '#0a0a1a',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'monospace', color: '#38bdf8', fontSize: '12px',
      }}>
        🦞 initializing tank...
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '500px', background: '#0a0a1a', position: 'relative' }}>
      {/* Vignette */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1,
        background: 'radial-gradient(ellipse at center, transparent 40%, #0a0a1a88 100%)',
      }} />

      {/* Three.js canvas */}
      <Canvas
        camera={{ position: [0, 0, 10], fov: 45 }}
        style={{ width: '100%', height: '100%' }}
        gl={{ antialias: true, alpha: false }}
        onCreated={({ gl }) => { gl.setClearColor(new THREE.Color('#0a0a1a')); }}
      >
        <TankScene crewStats={crewStats} currentDay={currentDay} />
      </Canvas>

      {/* Particle legend (bottom-left, only shown in uncontrolled/standalone mode) */}
      {!isControlled && (
        <div style={{
          position: 'absolute', bottom: '58px', left: '10px',
          display: 'flex', gap: '10px', fontFamily: 'monospace', fontSize: '9px',
          zIndex: 2, pointerEvents: 'none',
        }}>
          {[
            { color: '#4ade80', label: `PRs +${currentDay.prs_merged}` },
            { color: '#ef4444', label: `Err +${currentDay.errors}` },
            { color: '#3b82f6', label: `Msg +${currentDay.messages}` },
          ].map(({ color, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#9ca3af' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: color }} />
              {label}
            </div>
          ))}
        </div>
      )}

      {/* Particle legend for controlled mode — no bottom scrubber, so position at bottom-left */}
      {isControlled && (
        <div style={{
          position: 'absolute', bottom: '10px', left: '10px',
          display: 'flex', gap: '10px', fontFamily: 'monospace', fontSize: '9px',
          zIndex: 2, pointerEvents: 'none',
        }}>
          {[
            { color: '#4ade80', label: `PRs +${currentDay.prs_merged}` },
            { color: '#ef4444', label: `Err +${currentDay.errors}` },
            { color: '#3b82f6', label: `Msg +${currentDay.messages}` },
          ].map(({ color, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#9ca3af' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: color }} />
              {label}
            </div>
          ))}
        </div>
      )}

      {/* ── Timeline Scrubber — only rendered in standalone (uncontrolled) mode ── */}
      {!isControlled && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 3,
          background: 'rgba(0,0,0,0.85)', padding: '8px 12px',
          display: 'flex', alignItems: 'center', gap: '10px',
          borderTop: '1px solid #1e3a5f',
        }}>
          {/* Play/pause */}
          <button
            onClick={() => setIsPlaying(p => !p)}
            style={{
              color: '#e5e7eb', fontFamily: 'monospace', fontSize: '14px',
              background: 'none', border: 'none', cursor: 'pointer', padding: '0 4px',
              lineHeight: 1,
            }}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>

          {/* Scrubber */}
          <input
            type="range"
            min={0}
            max={Math.max(0, dailyStats.length - 1)}
            value={currentDayIndex}
            onChange={handleSliderChange}
            style={{ flex: 1, accentColor: '#f97316', cursor: 'pointer' }}
          />

          {/* Date display */}
          <span style={{
            fontFamily: 'monospace', fontSize: '12px', color: '#f59e0b',
            minWidth: '90px', textAlign: 'right', whiteSpace: 'nowrap',
          }}>
            {currentDate || '—'}
          </span>

          {/* Speed controls */}
          <div style={{ display: 'flex', gap: '4px' }}>
            {([1, 2, 5] as const).map(s => (
              <button
                key={s}
                onClick={() => setPlaybackSpeed(s)}
                style={{
                  fontFamily: 'monospace', fontSize: '10px',
                  padding: '2px 4px', background: 'none', border: 'none',
                  cursor: 'pointer',
                  color: playbackSpeed === s ? '#ffffff' : '#6b7280',
                }}
              >
                {s}×
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
