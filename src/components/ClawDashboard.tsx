// Author: Bubba (OpenClaw agent)
// Date: 2026-03-19
// PURPOSE: Parent container for CLAW dashboard. Owns timeline scrubber state
//          and distributes currentDate to both LobsterTank and MetricsPanel.
//          Ensures tank animation and metrics panel stay in sync.
// SRP/DRY check: Pass — single source of truth for timeline position

import { useState, useEffect, useCallback } from 'react';
import LobsterTank from './LobsterTank';
import MetricsPanel from './MetricsPanel';

interface ClawDashboardProps {
  events: any[];
  crewStats: any[];
  dailyStats: any[];
}

export default function ClawDashboard({ events, crewStats, dailyStats }: ClawDashboardProps) {
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [isPlaying, setIsPlaying]             = useState(true);
  const [playbackSpeed, setPlaybackSpeed]     = useState(2); // days per second

  // Auto-advance timeline — loops when it reaches the end
  useEffect(() => {
    if (!isPlaying || dailyStats.length === 0) return;
    const msPerDay = 1000 / playbackSpeed;
    const id = setInterval(() => {
      setCurrentDayIndex(prev => (prev + 1) % dailyStats.length);
    }, msPerDay);
    return () => clearInterval(id);
  }, [isPlaying, playbackSpeed, dailyStats.length]);

  const currentDay  = dailyStats[currentDayIndex] ?? {
    date: '', events: 0, prs_opened: 0, prs_merged: 0, errors: 0, messages: 0,
  };
  const currentDate = currentDay.date;

  const handleSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentDayIndex(parseInt(e.target.value, 10));
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

      {/* ── Tank + Metrics side by side ── */}
      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>

        {/* LobsterTank — center, flex-grows to fill available space */}
        <div style={{ flex: '1 1 0', minWidth: 0 }}>
          <LobsterTank
            crewStats={crewStats}
            dailyStats={dailyStats}
            events={events}
            currentDayIndex={currentDayIndex}
          />
        </div>

        {/* MetricsPanel — right, fixed width, receives same currentDate */}
        <div style={{ width: '240px', flexShrink: 0, alignSelf: 'stretch' }}>
          <MetricsPanel events={events} currentDate={currentDate} />
        </div>

      </div>

      {/* ── Timeline Scrubber (shared control bar) ── */}
      <div style={{
        background: 'rgba(0,0,0,0.85)',
        padding: '8px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
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

        {/* Scrubber slider */}
        <input
          type="range"
          min={0}
          max={Math.max(0, dailyStats.length - 1)}
          value={currentDayIndex}
          onChange={handleSliderChange}
          style={{ flex: 1, accentColor: '#f97316', cursor: 'pointer' }}
        />

        {/* Current date display */}
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
    </div>
  );
}
