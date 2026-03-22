// Author: Bubba (OpenClaw agent)
// Date: 2026-03-19
// PURPOSE: V5 ASCII Terminal — retro green-on-black lobster tank visualization.
//          Renders ASCII art lobsters drifting across a terminal-style display.
//          Events scroll as terminal log entries. Pure DOM, no canvas/SVG/WebGL.
//          Data-driven from events array. Plugged into view switcher as 💀 Terminal.
// SRP/DRY check: Pass — single component, self-contained terminal renderer

import { useState, useEffect, useRef, useMemo } from 'react';

// ── Types ────────────────────────────────────────────────────────────────────

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

interface Event {
  timestamp: string;
  agent_id: string;
  event_type: string;
  pr_title?: string;
  message?: string;
  [key: string]: any;
}

interface LobsterTankTerminalProps {
  events: Event[];
  crewStats: CrewStat[];
  dailyStats: DayStat[];
  currentDayIndex: number;
}

// ── Constants ────────────────────────────────────────────────────────────────

const TERMINAL_WIDTH = 92; // chars wide

// ASCII lobster art — 3 lines, fits neatly in the water section
const LOBSTER_ART = [
  ' ,__, ',
  '(o  o)',
  '/|  |\\',
];

// Agents that are "tower" humans (not lobster bots)
const TOWER_AGENTS = ['mark', 'simon', 'larry'];

// Agent colors — green shades for the terminal aesthetic
const AGENT_COLORS: Record<string, string> = {
  bubba:  '#4ade80',
  egon:   '#86efac',
  larry:  '#bbf7d0',
  mark:   '#d1fae5',
  simon:  '#a7f3d0',
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function padCenter(str: string, width: number, fill = ' '): string {
  const pad = width - str.length;
  if (pad <= 0) return str.slice(0, width);
  const left = Math.floor(pad / 2);
  const right = pad - left;
  return fill.repeat(left) + str + fill.repeat(right);
}

function padRight(str: string, width: number): string {
  if (str.length >= width) return str.slice(0, width);
  return str + ' '.repeat(width - str.length);
}

function truncate(str: string, max: number): string {
  if (!str) return '';
  if (str.length <= max) return str;
  return str.slice(0, max - 1) + '…';
}

function border(width: number): string {
  return '─'.repeat(width - 2);
}

function formatTime(ts: string): string {
  if (!ts) return '??:??:??';
  try {
    const d = new Date(ts);
    return d.toISOString().slice(11, 19);
  } catch {
    return ts.slice(11, 19) || '??:??:??';
  }
}

// ── LobsterTankTerminal ───────────────────────────────────────────────────────

export default function LobsterTankTerminal({
  events,
  crewStats,
  dailyStats,
  currentDayIndex,
}: LobsterTankTerminalProps) {
  // Lobster X positions — drift over time
  const initialPositions = useRef<number[]>([]);
  const [xPositions, setXPositions] = useState<number[]>([]);
  const [tick, setTick] = useState(0);

  // Identify bot agents (not tower humans)
  const botAgents = useMemo(
    () => crewStats.filter(c => !TOWER_AGENTS.includes(c.agent_id.toLowerCase())),
    [crewStats]
  );
  const towerAgents = useMemo(
    () => crewStats.filter(c => TOWER_AGENTS.includes(c.agent_id.toLowerCase())),
    [crewStats]
  );

  // Initialize lobster positions
  useEffect(() => {
    const positions = botAgents.map((_, i) => {
      // Space them evenly across the terminal width
      const spacing = Math.floor((TERMINAL_WIDTH - 20) / Math.max(botAgents.length, 1));
      return 4 + i * spacing;
    });
    initialPositions.current = positions;
    setXPositions(positions);
  }, [botAgents.length]);

  // Animate — drift lobsters left/right every 500ms
  useEffect(() => {
    const dirRef = { current: botAgents.map(() => (Math.random() > 0.5 ? 1 : -1)) };
    const interval = setInterval(() => {
      setXPositions(prev => prev.map((x, i) => {
        let nx = x + dirRef.current[i];
        // Bounce off walls
        const maxX = TERMINAL_WIDTH - 12;
        if (nx < 2) { nx = 2; dirRef.current[i] = 1; }
        if (nx > maxX) { nx = maxX; dirRef.current[i] = -1; }
        return nx;
      }));
      setTick(t => t + 1);
    }, 500);
    return () => clearInterval(interval);
  }, [botAgents.length]);

  // Current date from dailyStats
  const currentDate = dailyStats[currentDayIndex]?.date ?? '';

  // Events near currentDate (7-day window)
  const windowEvents = useMemo(() => {
    if (!currentDate) return events.slice(-20);
    const current = new Date(currentDate).getTime();
    const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
    return events.filter(e => {
      if (!e.timestamp) return false;
      const t = new Date(e.timestamp).getTime();
      return Math.abs(t - current) <= WEEK_MS;
    });
  }, [events, currentDate]);

  // Event counts per agent in window
  const windowCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const e of windowEvents) {
      counts[e.agent_id] = (counts[e.agent_id] || 0) + 1;
    }
    return counts;
  }, [windowEvents]);

  // Last 6 events for the log
  const logEvents = useMemo(() => {
    return [...windowEvents].sort((a, b) =>
      (b.timestamp || '').localeCompare(a.timestamp || '')
    ).slice(0, 6);
  }, [windowEvents]);

  // Total stats
  const totalPRsMerged = useMemo(
    () => crewStats.reduce((s, c) => s + (c.prs_merged ?? c.prs ?? 0), 0),
    [crewStats]
  );
  const totalEvents = events.length;

  // ── Build terminal lines ────────────────────────────────────────────────────

  const W = TERMINAL_WIDTH;
  const lines: string[] = [];

  const line = (s: string) => lines.push(s);
  const blank = () => lines.push('│' + ' '.repeat(W - 2) + '│');
  const wave = (frame: number) =>
    '│  ' +
    Array.from({ length: W - 6 }, (_, i) =>
      Math.sin(i / 4 + frame * 0.7) > 0 ? '~' : '≈'
    ).join('') +
    '  │';

  // Header
  const headerText = ' CLAW v1.0 ── lobster-ops ';
  line('┌' + border(W) + '┐');
  line('│' + padCenter(headerText, W - 2) + '│');
  line('├' + border(W) + '┤');
  blank();

  // Water surface
  line(wave(tick));
  blank();

  // Lobster rows — each bot agent gets their own row
  if (botAgents.length === 0) {
    blank();
    line('│' + padCenter('[ no agents online ]', W - 2) + '│');
    blank();
  } else {
    for (let i = 0; i < botAgents.length; i++) {
      const agent = botAgents[i];
      const id = agent.agent_id.toLowerCase();
      const x = xPositions[i] ?? (4 + i * 20);
      const evtCount = windowCounts[id] ?? agent.total_events;
      const status = evtCount > 0 ? 'ACTIVE' : 'IDLE';
      const name = id.toUpperCase();
      const totalAgentEvents = agent.total_events;

      // Row 1: top of lobster art + name/status to the right
      const artTop = LOBSTER_ART[0];
      const artMid = LOBSTER_ART[1];
      const artBot = LOBSTER_ART[2];

      const labelName = `${name} [${String(totalAgentEvents).padStart(4)} evts]`;
      const labelStatus = `status: ${status} | window: ${evtCount} evts`;

      // Build 3 lines for this lobster
      for (let row = 0; row < 3; row++) {
        const art = LOBSTER_ART[row];
        // Place art at position x, label to the right of art
        const rowStr = Array(W - 2).fill(' ');

        // Write art chars
        for (let c = 0; c < art.length; c++) {
          const pos = x + c;
          if (pos >= 0 && pos < W - 2) rowStr[pos] = art[c];
        }

        // Write label
        const labelX = Math.min(x + art.length + 2, W - 35);
        const label = row === 0 ? labelName : row === 1 ? labelStatus : '';
        for (let c = 0; c < label.length && labelX + c < W - 2; c++) {
          rowStr[labelX + c] = label[c];
        }

        line('│' + rowStr.join('') + '│');
      }
      blank();
    }
  }

  // Water floor
  line(wave(tick + 3));
  blank();

  // Tower section
  line('├─ TOWER ' + '─'.repeat(W - 10) + '┤');
  blank();

  if (towerAgents.length === 0) {
    line('│' + padCenter('[ tower offline ]', W - 2) + '│');
  } else {
    // Build a single row of tower stats
    const parts = towerAgents.map(a => {
      const id = a.agent_id.toLowerCase();
      const label = id === 'mark' ? 'Mark (tower)' : id === 'simon' ? 'Simon (architect)' : id;
      const prs = a.prs_merged ?? a.prs ?? 0;
      const msg = a.messages ?? 0;
      return `👤 ${label}  ${a.total_events} evts | ${prs} PRs | ${msg} msgs`;
    });
    const towerLine = '│  ' + parts.join('   ░░   ');
    line(padRight(towerLine, W - 1) + '│');
  }

  blank();

  // Event log
  line('├─ EVENT LOG ' + '─'.repeat(W - 14) + '┤');
  blank();

  if (logEvents.length === 0) {
    line('│  ' + padRight('[ no events in window ]', W - 4) + '│');
  } else {
    for (const e of logEvents) {
      const ts = formatTime(e.timestamp);
      const agentLabel = (e.agent_id || '?').toUpperCase().padEnd(5);
      const evtType = (e.event_type || '').padEnd(14);
      const detail = truncate(e.pr_title || e.message || e.event_type || '', W - 45);
      const logLine = `│  ${ts} [${agentLabel}] ${evtType} ${detail}`;
      line(padRight(logLine, W - 1) + '│');
    }
  }

  blank();

  // Stats footer
  const statsText = `PRs merged: ${totalPRsMerged} | Total events: ${totalEvents.toLocaleString()} | Day: ${currentDate || '—'} (${currentDayIndex + 1}/${dailyStats.length})`;
  line('├' + border(W) + '┤');
  line('│  ' + padRight(statsText, W - 4) + '│');
  line('└' + border(W) + '┘');

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div
      style={{
        position: 'relative',
        background: '#0a0a0a',
        border: '1px solid #1e1e2e',
        borderRadius: '8px',
        overflow: 'hidden',
        padding: '12px',
      }}
    >
      {/* Scanline overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)',
          zIndex: 1,
        }}
      />

      <pre
        style={{
          fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
          fontSize: '12px',
          lineHeight: '1.5',
          color: '#4ade80',
          background: 'transparent',
          margin: 0,
          padding: 0,
          whiteSpace: 'pre',
          overflowX: 'auto',
          textShadow: '0 0 5px rgba(74, 222, 128, 0.3)',
          position: 'relative',
          zIndex: 2,
        }}
      >
        {lines.join('\n')}
      </pre>
    </div>
  );
}
