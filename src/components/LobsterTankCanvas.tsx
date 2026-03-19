// Author: Bubba (OpenClaw agent)
// Date: 2026-03-19
// PURPOSE: Canvas 2D radar-style lobster visualization for CLAW dashboard.
//          Radar sweep + concentric rings + colored agent circles + particle effects.
//          Self-contained — no external renderer modules, no new deps.
// SRP/DRY check: Pass — single component owns canvas lifecycle

import { useRef, useEffect } from 'react';

interface LobsterTankCanvasProps {
  events: Array<{timestamp: string; agent_id: string; event_type: string; [key: string]: any}>;
  crewStats: Array<{agent_id: string; total_events: number; messages: number; errors: number; prs_opened: number; prs_merged: number}>;
  dailyStats: Array<{date: string; events: number; prs_opened: number; prs_merged: number; errors: number; messages: number}>;
  currentDayIndex?: number;
}

interface AgentState {
  id: string; label: string; color: string; shape: 'circle' | 'diamond';
  x: number; y: number; vx: number; vy: number;
  baseSize: number; size: number;
}

interface Particle {
  x: number; y: number; vx: number; vy: number;
  life: number; maxLife: number; color: string; r: number;
}

const AGENT_CONFIG: Record<string, {color: string; shape: 'circle'|'diamond'; baseSize: number; label: string}> = {
  egon:  { color: '#38bdf8', shape: 'circle',  baseSize: 22, label: 'Egon'  },
  bubba: { color: '#f97316', shape: 'circle',  baseSize: 16, label: 'Bubba' },
  larry: { color: '#4ade80', shape: 'circle',  baseSize: 12, label: 'Larry' },
  mark:  { color: '#fbbf24', shape: 'diamond', baseSize: 22, label: 'Mark'  },
  simon: { color: '#22d3ee', shape: 'diamond', baseSize: 22, label: 'Simon' },
};

const EVENT_PARTICLE_COLOR: Record<string, string> = {
  pr_opened: '#4ade80', pr_merged: '#22c55e', error: '#ef4444',
  message: '#60a5fa', session_start: '#a78bfa', default: '#94a3b8',
};

export default function LobsterTankCanvas({ events, crewStats, dailyStats, currentDayIndex = 0 }: LobsterTankCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef  = useRef<{
    agents: AgentState[]; particles: Particle[];
    sweep: number; raf: number; lastTime: number;
    dayIndex: number;
  } | null>(null);

  // Keep dayIndex in sync without remounting
  useEffect(() => {
    if (stateRef.current) stateRef.current.dayIndex = currentDayIndex;
  }, [currentDayIndex]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;
    const maxR = Math.min(W, H) * 0.44;

    // Build agent list from crewStats + config
    const agents: AgentState[] = Object.entries(AGENT_CONFIG).map(([id, cfg]) => {
      const stat = crewStats.find(s => s.agent_id === id);
      const total = stat?.total_events ?? 0;
      const sizeBonus = Math.min(12, Math.sqrt(total) * 0.4);
      const angle = Math.random() * Math.PI * 2;
      const r = maxR * (0.3 + Math.random() * 0.5);
      return {
        id, label: cfg.label, color: cfg.color, shape: cfg.shape,
        x: cx + Math.cos(angle) * r,
        y: cy + Math.sin(angle) * r,
        vx: 0, vy: 0,
        baseSize: cfg.baseSize + sizeBonus,
        size: cfg.baseSize + sizeBonus,
      };
    });

    const particles: Particle[] = [];

    stateRef.current = { agents, particles, sweep: 0, raf: 0, lastTime: 0, dayIndex: currentDayIndex };

    // ── Drawing helpers ──────────────────────────────────────────────────

    function drawBackground(t: number) {
      // Radial gradient background
      const grad = ctx!.createRadialGradient(cx, cy, 0, cx, cy, maxR * 1.4);
      grad.addColorStop(0, '#12122a');
      grad.addColorStop(1, '#0a0a1a');
      ctx!.fillStyle = grad;
      ctx!.fillRect(0, 0, W, H);

      // Concentric radar rings
      ctx!.strokeStyle = 'rgba(199,147,37,0.10)';
      ctx!.lineWidth = 1;
      for (let i = 1; i <= 4; i++) {
        ctx!.beginPath();
        ctx!.arc(cx, cy, maxR * (i / 4), 0, Math.PI * 2);
        ctx!.stroke();
      }

      // Crosshair lines (very faint)
      ctx!.strokeStyle = 'rgba(199,147,37,0.05)';
      ctx!.beginPath(); ctx!.moveTo(cx, cy - maxR); ctx!.lineTo(cx, cy + maxR); ctx!.stroke();
      ctx!.beginPath(); ctx!.moveTo(cx - maxR, cy); ctx!.lineTo(cx + maxR, cy); ctx!.stroke();

      // Sweep line
      const sweep = stateRef.current!.sweep;
      const sweepGrad = ctx!.createConicalGradient
        ? null // not widely supported
        : null;
      // Draw sweep as a thin amber line + trailing arc glow
      ctx!.save();
      ctx!.globalAlpha = 0.18;
      ctx!.strokeStyle = '#c79325';
      ctx!.lineWidth = 1.5;
      ctx!.beginPath();
      ctx!.moveTo(cx, cy);
      ctx!.lineTo(cx + Math.cos(sweep) * maxR, cy + Math.sin(sweep) * maxR);
      ctx!.stroke();
      // Trail arc
      ctx!.globalAlpha = 0.06;
      ctx!.beginPath();
      ctx!.moveTo(cx, cy);
      ctx!.arc(cx, cy, maxR, sweep - 0.4, sweep, false);
      ctx!.closePath();
      ctx!.fillStyle = '#c79325';
      ctx!.fill();
      ctx!.restore();
    }

    function drawDiamond(x: number, y: number, r: number) {
      ctx!.beginPath();
      ctx!.moveTo(x,     y - r);
      ctx!.lineTo(x + r, y    );
      ctx!.lineTo(x,     y + r);
      ctx!.lineTo(x - r, y    );
      ctx!.closePath();
    }

    function drawAgent(ag: AgentState) {
      const r = ag.size;
      // Glow
      ctx!.save();
      ctx!.shadowColor = ag.color;
      ctx!.shadowBlur  = 14;
      ctx!.globalAlpha = 0.85;
      ctx!.fillStyle   = ag.color;

      if (ag.shape === 'diamond') {
        drawDiamond(ag.x, ag.y, r);
        ctx!.fill();
        ctx!.strokeStyle = '#ffffff33';
        ctx!.lineWidth   = 1;
        ctx!.stroke();
      } else {
        ctx!.beginPath();
        ctx!.arc(ag.x, ag.y, r, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.strokeStyle = '#ffffff22';
        ctx!.lineWidth   = 1;
        ctx!.stroke();
      }
      ctx!.restore();

      // Label
      ctx!.font         = `bold 10px monospace`;
      ctx!.textAlign    = 'center';
      ctx!.textBaseline = 'top';
      ctx!.fillStyle    = ag.color;
      ctx!.fillText(ag.label, ag.x, ag.y + r + 4);
    }

    function drawParticles() {
      const ps = stateRef.current!.particles;
      for (const p of ps) {
        ctx!.save();
        ctx!.globalAlpha = p.life / p.maxLife;
        ctx!.fillStyle   = p.color;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.restore();
      }
    }

    // ── Particle spawning ────────────────────────────────────────────────

    function spawnParticles(ag: AgentState, type: string) {
      const color = EVENT_PARTICLE_COLOR[type] ?? EVENT_PARTICLE_COLOR.default;
      for (let i = 0; i < 3; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.4 + Math.random() * 0.8;
        particles.push({
          x: ag.x, y: ag.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 60, maxLife: 60,
          color, r: 1.5 + Math.random() * 1.5,
        });
      }
    }

    // ── Main animate loop ─────────────────────────────────────────────────

    let lastSpawn = 0;

    function animate(now: number) {
      const st = stateRef.current!;
      const dt = now - st.lastTime;
      st.lastTime = now;

      // Advance sweep
      st.sweep += 0.008;
      if (st.sweep > Math.PI * 2) st.sweep -= Math.PI * 2;

      // Drift agents
      for (const ag of st.agents) {
        const t = now * 0.001;
        ag.vx += (Math.sin(t * 0.7 + ag.baseSize) * 0.06);
        ag.vy += (Math.cos(t * 0.5 + ag.baseSize) * 0.06);
        ag.vx *= 0.97;
        ag.vy *= 0.97;
        ag.x  += ag.vx;
        ag.y  += ag.vy;
        // Soft boundary — pull back toward center if too far
        const dx = ag.x - cx, dy = ag.y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > maxR * 0.88) {
          ag.vx -= (dx / dist) * 0.3;
          ag.vy -= (dy / dist) * 0.3;
        }
      }

      // Periodically spawn particles from a random active agent
      if (now - lastSpawn > 300) {
        lastSpawn = now;
        const dayData = dailyStats[st.dayIndex];
        if (dayData && dayData.events > 0) {
          // Pick a random event type weighted by day stats
          const types = [
            ...Array(dayData.prs_merged).fill('pr_merged'),
            ...Array(dayData.prs_opened).fill('pr_opened'),
            ...Array(dayData.errors).fill('error'),
            ...Array(dayData.messages).fill('message'),
          ];
          const type = types.length > 0 ? types[Math.floor(Math.random() * types.length)] : 'message';
          const ag = st.agents[Math.floor(Math.random() * st.agents.length)];
          spawnParticles(ag, type);
        }
      }

      // Age particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x    += p.vx;
        p.y    += p.vy;
        p.life -= 1;
        if (p.life <= 0) particles.splice(i, 1);
      }

      // Draw
      drawBackground(now);
      drawParticles();
      for (const ag of st.agents) drawAgent(ag);

      st.raf = requestAnimationFrame(animate);
    }

    stateRef.current!.raf = requestAnimationFrame(animate);

    return () => {
      if (stateRef.current) cancelAnimationFrame(stateRef.current.raf);
    };
  }, [crewStats, dailyStats]);

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={500}
      style={{ width: '100%', borderRadius: '12px', display: 'block', background: '#0a0a1a' }}
    />
  );
}
