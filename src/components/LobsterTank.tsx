// Author: Bubba (OpenClaw agent)
// Date: 2026-03-19
// PURPOSE: Three.js fishbowl animation for CLAW dashboard. 3D tank with animated
//          lobster entities that drift, pulse, and react to agent coordination events.
//          Uses React Three Fiber for Astro island integration.
// SRP/DRY check: Pass — self-contained animation component

import { Canvas, useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useRef, useState, useMemo, useEffect } from 'react';
import * as THREE from 'three';

// ── Types ──────────────────────────────────────────────────────────────────────

interface LobsterTankProps {
  crewStats: Array<{
    agent_id: string;
    total_events: number;
    messages: number;
    errors: number;
    prs_opened: number;
    prs_merged: number;
  }>;
  dailyStats: Array<{
    date: string;
    events: number;
    prs_opened: number;
    prs_merged: number;
    errors: number;
    messages: number;
  }>;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const TANK_W = 7;
const TANK_H = 5;
const TANK_D = 4;

// Crew definitions with colors and relative sizes
const CREW_DEFS = [
  { id: 'egon',  name: 'Egon',  color: '#38bdf8', type: 'agent',  baseEvents: 5604, speed: 0.9 },
  { id: 'bubba', name: 'Bubba', color: '#f97316', type: 'agent',  baseEvents: 953,  speed: 0.7 },
  { id: 'larry', name: 'Larry', color: '#4ade80', type: 'agent',  baseEvents: 137,  speed: 0.6 },
  { id: 'mark',  name: 'Mark',  color: '#fbbf24', type: 'human',  baseEvents: 200,  speed: 0.3 },
  { id: 'simon', name: 'Simon', color: '#22d3ee', type: 'human',  baseEvents: 200,  speed: 0.25 },
];

// ── Tank Wireframe ─────────────────────────────────────────────────────────────

function TankBox() {
  const edgesRef = useRef<THREE.LineSegments>(null);
  const geom = useMemo(() => new THREE.BoxGeometry(TANK_W, TANK_H, TANK_D), []);
  const edgeGeom = useMemo(() => new THREE.EdgesGeometry(geom), [geom]);

  return (
    <lineSegments ref={edgesRef} geometry={edgeGeom}>
      <lineBasicMaterial color="#1e3a5f" transparent opacity={0.6} />
    </lineSegments>
  );
}

// ── Particle System ────────────────────────────────────────────────────────────

interface ParticleData {
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  color: THREE.Color;
  life: number; // 0→1, fade out near 1
  maxLife: number;
}

function Particles({ crewStats }: { crewStats: LobsterTankProps['crewStats'] }) {
  const pointsRef = useRef<THREE.Points>(null);

  // Build particle pool from crew stats
  const PARTICLE_COUNT = 120;

  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const col = new Float32Array(PARTICLE_COUNT * 3);

    // Total counts across all agents
    const totals = crewStats.reduce(
      (acc, c) => ({ msgs: acc.msgs + c.messages, errs: acc.errs + c.errors, prs: acc.prs + c.prs_merged }),
      { msgs: 0, errs: 0, prs: 0 }
    );
    const grand = totals.msgs + totals.errs + totals.prs || 1;
    const msgFrac = totals.msgs / grand;
    const errFrac = totals.errs / grand;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * TANK_W;
      pos[i * 3 + 1] = (Math.random() - 0.5) * TANK_H;
      pos[i * 3 + 2] = (Math.random() - 0.5) * TANK_D;

      // Color by type probability
      const r = Math.random();
      let c: [number, number, number];
      if (r < errFrac) {
        c = [0.9, 0.2, 0.2]; // red: errors
      } else if (r < errFrac + msgFrac) {
        c = [0.2, 0.5, 1.0]; // blue: messages
      } else {
        c = [0.2, 0.9, 0.3]; // green: PR merges
      }
      col[i * 3]     = c[0];
      col[i * 3 + 1] = c[1];
      col[i * 3 + 2] = c[2];
    }
    return { positions: pos, colors: col };
  }, [crewStats]);

  const velocities = useMemo(() => {
    const vels = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      vels[i * 3]     = (Math.random() - 0.5) * 0.002;
      vels[i * 3 + 1] = Math.random() * 0.003 + 0.001; // mostly upward
      vels[i * 3 + 2] = (Math.random() - 0.5) * 0.002;
    }
    return vels;
  }, []);

  const posRef = useRef(positions.slice());

  useFrame(() => {
    if (!pointsRef.current) return;
    const pos = posRef.current;
    const half = { x: TANK_W / 2, y: TANK_H / 2, z: TANK_D / 2 };

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      pos[i * 3]     += velocities[i * 3];
      pos[i * 3 + 1] += velocities[i * 3 + 1];
      pos[i * 3 + 2] += velocities[i * 3 + 2];

      // Wrap vertically — particles that reach top reset to bottom
      if (pos[i * 3 + 1] > half.y) {
        pos[i * 3 + 1] = -half.y;
        pos[i * 3]     = (Math.random() - 0.5) * TANK_W;
        pos[i * 3 + 2] = (Math.random() - 0.5) * TANK_D;
      }
      // Bounce on X/Z
      if (Math.abs(pos[i * 3]) > half.x) velocities[i * 3] *= -1;
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
        <bufferAttribute
          attach="attributes-position"
          args={[posRef.current, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial size={0.04} vertexColors transparent opacity={0.7} sizeAttenuation />
    </points>
  );
}

// ── Single Lobster Entity ──────────────────────────────────────────────────────

interface LobsterProps {
  id: string;
  name: string;
  color: string;
  type: 'agent' | 'human';
  size: number;
  speed: number;
  initialPos: [number, number, number];
  phaseOffset: number;
}

function Lobster({ id, name, color, type, size, speed, initialPos, phaseOffset }: LobsterProps) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  // Drift direction state — changes every 3–5 seconds
  const driftRef = useRef({
    dir: new THREE.Vector3(
      (Math.random() - 0.5),
      (Math.random() - 0.5) * 0.3,
      (Math.random() - 0.5)
    ).normalize(),
    nextChange: 3 + Math.random() * 2,
    elapsed: 0,
  });

  const posRef = useRef(new THREE.Vector3(...initialPos));
  const half = { x: TANK_W / 2 - size, y: TANK_H / 2 - size, z: TANK_D / 2 - size };

  useFrame((state) => {
    if (!groupRef.current || !meshRef.current) return;
    const t = state.clock.getElapsedTime() + phaseOffset;
    const dt = state.clock.getDelta ? 0.016 : 0.016;

    // Change direction timer
    driftRef.current.elapsed += dt;
    if (driftRef.current.elapsed >= driftRef.current.nextChange) {
      driftRef.current.dir.set(
        (Math.random() - 0.5),
        (Math.random() - 0.5) * 0.3,
        (Math.random() - 0.5)
      ).normalize();
      driftRef.current.elapsed = 0;
      driftRef.current.nextChange = 3 + Math.random() * 2;
    }

    // Move
    const driftSpeed = speed * 0.015;
    posRef.current.addScaledVector(driftRef.current.dir, driftSpeed);

    // Bounce off walls
    if (posRef.current.x > half.x)  { posRef.current.x = half.x;  driftRef.current.dir.x *= -1; }
    if (posRef.current.x < -half.x) { posRef.current.x = -half.x; driftRef.current.dir.x *= -1; }
    if (posRef.current.y > half.y)  { posRef.current.y = half.y;  driftRef.current.dir.y *= -1; }
    if (posRef.current.y < -half.y) { posRef.current.y = -half.y; driftRef.current.dir.y *= -1; }
    if (posRef.current.z > half.z)  { posRef.current.z = half.z;  driftRef.current.dir.z *= -1; }
    if (posRef.current.z < -half.z) { posRef.current.z = -half.z; driftRef.current.dir.z *= -1; }

    // Sine-wave bob (underwater float)
    const bobY = Math.sin(t * 0.8) * 0.12;
    const bobX = Math.cos(t * 0.5) * 0.06;

    groupRef.current.position.set(
      posRef.current.x + bobX,
      posRef.current.y + bobY,
      posRef.current.z
    );

    // Gentle rotation
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(t * 0.4) * 0.3;
      meshRef.current.rotation.x = Math.cos(t * 0.3) * 0.1;
      // Pulse scale
      const pulse = 1 + Math.sin(t * 1.2) * 0.05;
      meshRef.current.scale.setScalar(pulse);
    }
  });

  const colorObj = new THREE.Color(color);
  const isHuman = type === 'human';

  return (
    <group ref={groupRef} position={initialPos}>
      {/* Outer glow sphere (humans only) */}
      {isHuman && (
        <mesh>
          <sphereGeometry args={[size * 1.6, 12, 8]} />
          <meshBasicMaterial color={color} transparent opacity={0.06} />
        </mesh>
      )}

      {/* Main body */}
      <mesh ref={meshRef}>
        {isHuman ? (
          <octahedronGeometry args={[size, 1]} />
        ) : (
          <icosahedronGeometry args={[size, 0]} />
        )}
        <meshStandardMaterial
          color={colorObj}
          emissive={colorObj}
          emissiveIntensity={isHuman ? 0.5 : 0.25}
          roughness={0.3}
          metalness={0.1}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* Label */}
      <Html
        position={[0, size + 0.18, 0]}
        center
        style={{ pointerEvents: 'none', userSelect: 'none' }}
        zIndexRange={[0, 0]}
      >
        <div style={{
          fontFamily: 'monospace',
          fontSize: '10px',
          color: color,
          background: 'rgba(10,10,26,0.75)',
          padding: '1px 5px',
          borderRadius: '3px',
          border: `1px solid ${color}44`,
          whiteSpace: 'nowrap',
          lineHeight: 1.4,
        }}>
          {name}
        </div>
      </Html>
    </group>
  );
}

// ── Scene ──────────────────────────────────────────────────────────────────────

function TankScene({ crewStats }: { crewStats: LobsterTankProps['crewStats'] }) {
  // Map event counts from actual data when available
  const statsMap = useMemo(() => {
    return Object.fromEntries(crewStats.map(c => [c.agent_id, c.total_events]));
  }, [crewStats]);

  const maxEvents = Math.max(...CREW_DEFS.map(d => statsMap[d.id] ?? d.baseEvents));

  const lobsters = useMemo(() => {
    return CREW_DEFS.map((def, i) => {
      const events = statsMap[def.id] ?? def.baseEvents;
      const normalizedSize = 0.15 + (events / maxEvents) * 0.55; // 0.15 → 0.70
      const humanBonus = def.type === 'human' ? 0.15 : 0;
      const size = normalizedSize + humanBonus;

      // Spread initial positions evenly in tank
      const angle = (i / CREW_DEFS.length) * Math.PI * 2;
      const r = 1.8;
      const initialPos: [number, number, number] = [
        Math.cos(angle) * r,
        (Math.random() - 0.5) * (TANK_H * 0.6),
        Math.sin(angle) * r * 0.6,
      ];

      return { ...def, size, initialPos, phaseOffset: i * 1.3 };
    });
  }, [statsMap, maxEvents]);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <pointLight position={[0, 3, 2]} intensity={1.2} color="#b0d4ff" />
      <pointLight position={[0, -2, -2]} intensity={0.3} color="#1a3a6a" />

      {/* Tank wireframe */}
      <TankBox />

      {/* Lobster entities */}
      {lobsters.map(l => (
        <Lobster
          key={l.id}
          id={l.id}
          name={l.name}
          color={l.color}
          type={l.type as 'agent' | 'human'}
          size={l.size}
          speed={l.speed}
          initialPos={l.initialPos}
          phaseOffset={l.phaseOffset}
        />
      ))}

      {/* Particle plankton */}
      <Particles crewStats={crewStats} />

      {/* Fog */}
      <fog attach="fog" args={['#0a0a1a', 8, 18]} />
    </>
  );
}

// ── Root Component ─────────────────────────────────────────────────────────────

export default function LobsterTank({ crewStats, dailyStats }: LobsterTankProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div style={{
        width: '100%',
        height: '500px',
        background: '#0a0a1a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'monospace',
        color: '#38bdf8',
        fontSize: '12px',
      }}>
        🦞 initializing tank...
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '500px', background: '#0a0a1a', position: 'relative' }}>
      {/* Blue tint overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse at center, transparent 40%, #0a0a1a88 100%)',
        pointerEvents: 'none',
        zIndex: 1,
      }} />

      <Canvas
        camera={{ position: [0, 0, 10], fov: 45 }}
        style={{ width: '100%', height: '100%' }}
        gl={{ antialias: true, alpha: false }}
        onCreated={({ gl }) => {
          gl.setClearColor(new THREE.Color('#0a0a1a'));
        }}
      >
        <TankScene crewStats={crewStats} />
      </Canvas>

      {/* Legend overlay */}
      <div style={{
        position: 'absolute',
        bottom: '10px',
        left: '10px',
        display: 'flex',
        gap: '10px',
        fontFamily: 'monospace',
        fontSize: '9px',
        zIndex: 2,
        pointerEvents: 'none',
      }}>
        {[
          { color: '#4ade80', label: 'PRs' },
          { color: '#ef4444', label: 'Errors' },
          { color: '#3b82f6', label: 'Messages' },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#6b7280' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: color }} />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}
