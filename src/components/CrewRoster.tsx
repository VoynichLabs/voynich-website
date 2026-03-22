// Author: Bubba (OpenClaw agent)
// Date: 2026-03-19
// PURPOSE: Dynamic crew roster panel for CLAW dashboard.
//          Computes per-member stats from the events array for a 7-day window
//          ending at currentDate (from the timeline scrubber). No hard-coded stats.
//          Members dim out before their earliest known date.
// SRP/DRY check: Pass — pure computation from props, no internal state beyond memo.

import { useMemo } from 'react';

interface CrewRosterProps {
  events: Array<{ timestamp: string; agent_id: string; event_type: string; [key: string]: any }>;
  currentDate: string; // YYYY-MM-DD from scrubber
}

const CREW = [
  { id: 'egon',  name: 'Egon',  emoji: '🦞', type: 'agent' as const, earliest: '2026-03-01' },
  { id: 'bubba', name: 'Bubba', emoji: '🦞', type: 'agent' as const, earliest: '2026-02-26' },
  { id: 'larry', name: 'Larry', emoji: '🦞', type: 'agent' as const, earliest: '2026-02-03' },
  { id: 'mark',  name: 'Mark',  emoji: '👤', type: 'human' as const, earliest: '2026-02-01' },
  { id: 'simon', name: 'Simon', emoji: '👤', type: 'human' as const, earliest: '2025-02-10' },
];

interface MemberStats {
  id: string;
  name: string;
  emoji: string;
  type: 'agent' | 'human';
  existsYet: boolean;
  activeToday: boolean;
  weekEvents: number;
  weekErrors: number;
  weekPRs: number;
  weekMessages: number;
  healthPct: number;
  errorPct: number;
  badge: string | null;
}

export default function CrewRoster({ events, currentDate }: CrewRosterProps) {
  const members = useMemo((): MemberStats[] => {
    if (!currentDate) return [];

    // 7-day window: [windowStart, currentDate]
    const current = new Date(currentDate);
    const windowStart = new Date(current);
    windowStart.setDate(windowStart.getDate() - 6); // 7 days inclusive
    const windowStartStr = windowStart.toISOString().slice(0, 10);

    // Pre-filter events in the 7-day window
    const windowEvents = events.filter(
      e => e.timestamp >= windowStartStr && e.timestamp.slice(0, 10) <= currentDate
    );

    // Compute per-member stats
    const rawStats = CREW.map(crew => {
      const existsYet = currentDate >= crew.earliest;

      const memberWindowEvents = windowEvents.filter(e => e.agent_id === crew.id);
      const todayEvents = memberWindowEvents.filter(e => e.timestamp.slice(0, 10) === currentDate);

      const weekEvents   = memberWindowEvents.length;
      const weekErrors   = memberWindowEvents.filter(e => e.event_type === 'error').length;
      const weekPRs      = memberWindowEvents.filter(e => e.event_type === 'pr_merge' || e.event_type === 'pr_merged').length;
      const weekMessages = memberWindowEvents.filter(e => e.event_type === 'message').length;
      const activeToday  = todayEvents.length > 0;

      const healthPct = weekEvents > 0
        ? Math.round(((weekEvents - weekErrors) / weekEvents) * 100)
        : 0;
      const errorPct = weekEvents > 0
        ? Math.round((weekErrors / weekEvents) * 100)
        : 0;

      return {
        ...crew,
        existsYet,
        activeToday,
        weekEvents,
        weekErrors,
        weekPRs,
        weekMessages,
        healthPct,
        errorPct,
        badge: null as string | null,
      };
    });

    // --- Assign competitive badges ---
    // Only award each badge once, to the clear leader

    // Top PR shipper (agents + humans, must have >= 1 PR)
    const topPR = rawStats.reduce<MemberStats | null>((best, m) =>
      m.existsYet && m.weekPRs > (best?.weekPRs ?? 0) ? m : best, null);
    if (topPR && topPR.weekPRs >= 1) topPR.badge = '🚀 top shipper';

    // Most active by events (separate from top shipper, must have >= 5 events)
    const topActive = rawStats.reduce<MemberStats | null>((best, m) =>
      m.existsYet && (!topPR || m.id !== topPR.id) && m.weekEvents > (best?.weekEvents ?? 0)
        ? m : best, null);
    if (topActive && topActive.weekEvents >= 5 && !topActive.badge) {
      topActive.badge = '⚡ most active';
    }

    // Most errors (must have >= 3 errors to earn this distinction)
    const topErrors = rawStats.reduce<MemberStats | null>((best, m) =>
      m.existsYet && m.weekErrors > (best?.weekErrors ?? 0) ? m : best, null);
    if (topErrors && topErrors.weekErrors >= 3 && !topErrors.badge) {
      topErrors.badge = '🔴 rough week';
    }

    // Human with most messages → "📡 tower" (humans only, >= 2 messages)
    const topHuman = rawStats
      .filter(m => m.type === 'human' && m.existsYet)
      .reduce<MemberStats | null>((best, m) =>
        m.weekMessages > (best?.weekMessages ?? 0) ? m : best, null);
    if (topHuman && topHuman.weekMessages >= 2 && !topHuman.badge) {
      topHuman.badge = '📡 tower';
    }

    // Idle badge for members with no activity (only if they exist)
    for (const m of rawStats) {
      if (m.existsYet && m.weekEvents === 0 && !m.badge) {
        m.badge = '💤 idle';
      }
    }

    return rawStats;
  }, [events, currentDate]);

  const agents = members.filter(m => m.type === 'agent');
  const humans = members.filter(m => m.type === 'human');

  const renderMember = (member: MemberStats) => (
    <div
      key={member.id}
      className={[
        'bg-bg-surface border border-border rounded-lg p-3 transition-colors',
        !member.existsYet ? 'opacity-30' : '',
        member.activeToday ? 'border-edge-green/30' : '',
      ].filter(Boolean).join(' ')}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          <span className="text-base">{member.emoji}</span>
          <span className="font-mono text-xs text-text-primary font-medium">{member.name}</span>
        </div>
        <div
          className={`w-2 h-2 rounded-full ${member.activeToday ? 'bg-edge-green' : 'bg-text-muted/30'}`}
        />
      </div>

      {member.existsYet ? (
        <>
          <div className="font-mono text-[11px] text-text-muted">
            {member.weekEvents} events · {member.weekPRs} PRs · {member.weekErrors} err
          </div>
          {/* Health bar */}
          <div className="mt-1.5 h-1.5 bg-bg-primary rounded-full overflow-hidden">
            <div className="h-full flex">
              <div className="bg-edge-green" style={{ width: `${member.healthPct}%` }} />
              <div className="bg-red-500"    style={{ width: `${member.errorPct}%` }} />
            </div>
          </div>
          {member.badge && (
            <div className="font-mono text-[10px] text-text-muted/70 mt-1">{member.badge}</div>
          )}
        </>
      ) : (
        <div className="font-mono text-[10px] text-text-muted/50 italic">not yet online</div>
      )}
    </div>
  );

  return (
    <div className="space-y-2">
      <p className="font-mono text-[10px] text-text-muted uppercase tracking-widest">
        Agents
      </p>
      {agents.map(renderMember)}

      <p className="font-mono text-[10px] text-text-muted uppercase tracking-widest mt-3">
        Humans
      </p>
      {humans.map(renderMember)}
    </div>
  );
}
