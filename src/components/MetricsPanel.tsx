// Author: Bubba (claude-sonnet-4-6) — subagent
// Date: 2026-03-19
// PURPOSE: Dynamic MetricsPanel React island for the CLAW dashboard.
//          All metrics computed at render time from raw event data.
//          Responds to currentDate prop (set by timeline scrubber).
//          No pre-baked numbers. Velocity, error trends, top agent,
//          auto-detected anomalies, pace — all computed live.
// SRP/DRY check: Pass — single component, pure computation from props.

import { useMemo } from 'react';

interface Event {
  timestamp: string;
  agent_id: string;
  event_type: string;
  [key: string]: any;
}

interface MetricsPanelProps {
  events: Event[];
  currentDate: string; // YYYY-MM-DD from the scrubber
}

// Emoji map for known agents
const AGENT_EMOJI: Record<string, string> = {
  egon: '🦞',
  bubba: '🦞',
  larry: '🦞',
  mark: '👤',
  simon: '👤',
};

function getAgentEmoji(agentId: string): string {
  return AGENT_EMOJI[agentId.toLowerCase()] ?? '🤖';
}

function toDateStr(ts: string): string {
  return ts.slice(0, 10);
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function diffDays(a: string, b: string): number {
  const da = new Date(a + 'T00:00:00Z').getTime();
  const db = new Date(b + 'T00:00:00Z').getTime();
  return Math.round((db - da) / 86400000);
}

function pctChange(cur: number, prev: number): number {
  if (prev === 0) return cur > 0 ? 100 : 0;
  return Math.round(((cur - prev) / prev) * 100);
}

function formatMonth(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00Z');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
}

export default function MetricsPanel({ events, currentDate }: MetricsPanelProps) {
  const metrics = useMemo(() => {
    // --- Date windows ---
    const end = currentDate;                 // inclusive
    const weekStart = addDays(end, -6);      // 7-day window: weekStart..end
    const prevEnd = addDays(end, -7);
    const prevStart = addDays(end, -13);     // previous 7-day window

    // Helper: is event in [from, to] date range?
    function inRange(ts: string, from: string, to: string): boolean {
      const d = toDateStr(ts);
      return d >= from && d <= to;
    }

    // --- Filter events for current and previous weeks ---
    const thisWeekEvents = events.filter(e => inRange(e.timestamp, weekStart, end));
    const prevWeekEvents = events.filter(e => inRange(e.timestamp, prevStart, prevEnd));

    // --- 1. Velocity (PR merges) ---
    const thisPRs = thisWeekEvents.filter(e => e.event_type === 'pr_merged').length;
    const prevPRs = prevWeekEvents.filter(e => e.event_type === 'pr_merged').length;
    const velocityPct = pctChange(thisPRs, prevPRs);

    // --- 2. 6-week sparkline ---
    const sparkWeeks: number[] = [];
    for (let w = 5; w >= 0; w--) {
      const wEnd = addDays(end, -w * 7);
      const wStart = addDays(wEnd, -6);
      const count = events.filter(e =>
        e.event_type === 'pr_merged' && inRange(e.timestamp, wStart, wEnd)
      ).length;
      sparkWeeks.push(count);
    }
    const maxSpark = Math.max(...sparkWeeks, 1);

    // --- 3. Error rate ---
    const thisErrors = thisWeekEvents.filter(e => e.event_type === 'error').length;
    const prevErrors = prevWeekEvents.filter(e => e.event_type === 'error').length;
    const errorPct = pctChange(thisErrors, prevErrors);
    // improving = errors went down
    const errorImproving = thisErrors <= prevErrors;

    // --- 4. Top agent this week ---
    const agentCounts: Record<string, number> = {};
    for (const e of thisWeekEvents) {
      if (e.agent_id) {
        agentCounts[e.agent_id] = (agentCounts[e.agent_id] ?? 0) + 1;
      }
    }
    let topAgent = '';
    let topAgentCount = 0;
    for (const [id, count] of Object.entries(agentCounts)) {
      if (count > topAgentCount) {
        topAgent = id;
        topAgentCount = count;
      }
    }

    // --- 5. Anomaly detection ---
    // Build per-day stats for a 14-day window around currentDate
    const scanStart = addDays(end, -13);
    const scanEvents = events.filter(e => inRange(e.timestamp, scanStart, end));

    // Group by date
    const byDay: Record<string, Event[]> = {};
    for (const e of scanEvents) {
      const d = toDateStr(e.timestamp);
      if (!byDay[d]) byDay[d] = [];
      byDay[d].push(e);
    }

    const anomalies: Array<{ date: string; label: string; priority: number }> = [];

    // Error spikes and PR surges by day
    for (const [date, dayEvents] of Object.entries(byDay)) {
      const errs = dayEvents.filter(e => e.event_type === 'error').length;
      const prs = dayEvents.filter(e => e.event_type === 'pr_merged').length;
      if (errs >= 10) {
        anomalies.push({ date, label: `⚠️ Error spike on ${formatMonth(date)} (${errs})`, priority: errs });
      }
      if (prs >= 15) {
        anomalies.push({ date, label: `📈 Surge: ${prs} merges on ${formatMonth(date)}`, priority: prs });
      }
    }

    // Silence gaps > 12h per agent
    const agentIds = [...new Set(scanEvents.map(e => e.agent_id).filter(Boolean))];
    for (const agentId of agentIds) {
      const agentEvents = scanEvents
        .filter(e => e.agent_id === agentId)
        .sort((a, b) => a.timestamp.localeCompare(b.timestamp));

      for (let i = 1; i < agentEvents.length; i++) {
        const prev = new Date(agentEvents[i - 1].timestamp).getTime();
        const curr = new Date(agentEvents[i].timestamp).getTime();
        const gapH = (curr - prev) / 3600000;
        if (gapH > 12) {
          const gapDate = toDateStr(agentEvents[i - 1].timestamp);
          anomalies.push({
            date: gapDate,
            label: `💤 ${agentId.charAt(0).toUpperCase() + agentId.slice(1)} silent ${Math.round(gapH)}h on ${formatMonth(gapDate)}`,
            priority: gapH,
          });
          break; // one per agent
        }
      }
    }

    // Sort by date descending, take top 2
    const topAnomalies = anomalies
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 2);

    // --- 6. Pace ---
    const allMerged = events.filter(e =>
      e.event_type === 'pr_merged' && toDateStr(e.timestamp) <= end
    );
    const totalPRsToDate = allMerged.length;

    let daysElapsed = 0;
    let avgPRsPerDay = 0;
    if (events.length > 0) {
      const firstDate = events
        .map(e => toDateStr(e.timestamp))
        .sort()[0];
      daysElapsed = diffDays(firstDate, end) + 1;
      avgPRsPerDay = daysElapsed > 0
        ? Math.round((totalPRsToDate / daysElapsed) * 10) / 10
        : 0;
    }

    return {
      thisPRs,
      prevPRs,
      velocityPct,
      sparkWeeks,
      maxSpark,
      thisErrors,
      prevErrors,
      errorPct,
      errorImproving,
      topAgent,
      topAgentCount,
      topAnomalies,
      totalPRsToDate,
      daysElapsed,
      avgPRsPerDay,
    };
  }, [events, currentDate]);

  const {
    thisPRs, prevPRs, velocityPct,
    sparkWeeks, maxSpark,
    thisErrors, prevErrors, errorPct, errorImproving,
    topAgent, topAgentCount,
    topAnomalies,
    totalPRsToDate, daysElapsed, avgPRsPerDay,
  } = metrics;

  return (
    <div
      className="bg-[#16161e] border border-[#2a2a3a] rounded-lg p-3 space-y-3 text-xs"
      style={{ minWidth: 200 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#2a2a3a] pb-2">
        <span className="font-mono text-[10px] text-[#888] uppercase tracking-widest">Live Metrics</span>
        <span className="font-mono text-[10px] text-[#555]">{currentDate}</span>
      </div>

      {/* 1. Velocity */}
      <div>
        <div className="font-mono text-[10px] text-[#888] uppercase tracking-widest mb-1">Velocity</div>
        <div className="flex items-baseline gap-1 font-mono">
          <span className="text-sm font-bold text-white">{thisPRs} PRs</span>
          <span className="text-[10px] text-[#888]">vs {prevPRs} last wk</span>
          {velocityPct !== 0 && (
            <span className={`text-[10px] font-bold ${velocityPct > 0 ? 'text-[#4ade80]' : 'text-[#ef4444]'}`}>
              {velocityPct > 0 ? '▲' : '▼'}{Math.abs(velocityPct)}%
            </span>
          )}
        </div>
      </div>

      {/* 2. 6-Week Sparkline */}
      <div>
        <div className="font-mono text-[10px] text-[#888] uppercase tracking-widest mb-1">6-Week Shape</div>
        <div className="flex items-end gap-[3px] h-10">
          {sparkWeeks.map((count, i) => {
            const h = Math.max(2, Math.round((count / maxSpark) * 40));
            const isLast = i === sparkWeeks.length - 1;
            return (
              <div
                key={i}
                className="flex-1 rounded-sm"
                style={{
                  height: `${h}px`,
                  backgroundColor: isLast ? '#4ade80' : '#2a4a3a',
                }}
                title={`${count} PRs`}
              />
            );
          })}
        </div>
        <div className="flex justify-between font-mono text-[9px] text-[#555] mt-0.5">
          <span>-6w</span>
          <span>now</span>
        </div>
      </div>

      {/* 3. Error Rate */}
      <div>
        <div className="font-mono text-[10px] text-[#888] uppercase tracking-widest mb-1">Error Rate</div>
        <div className="flex items-baseline gap-1 font-mono">
          <span className="text-sm font-bold text-white">{thisErrors}</span>
          <span className="text-[10px] text-[#888]">vs {prevErrors} last wk</span>
          {thisErrors !== prevErrors && (
            <span className={`text-[10px] font-bold ${errorImproving ? 'text-[#4ade80]' : 'text-[#ef4444]'}`}>
              {errorImproving ? '▼' : '▲'}{Math.abs(errorPct)}%
            </span>
          )}
        </div>
      </div>

      {/* 4. Top Agent */}
      {topAgent && (
        <div>
          <div className="font-mono text-[10px] text-[#888] uppercase tracking-widest mb-1">Top Agent</div>
          <div className="font-mono text-sm text-white">
            {getAgentEmoji(topAgent)}{' '}
            <span className="font-bold capitalize">{topAgent}</span>
            <span className="text-[#888] text-[10px] ml-1">{topAgentCount} events</span>
          </div>
        </div>
      )}

      {/* 5. Anomalies */}
      {topAnomalies.length > 0 && (
        <div>
          <div className="font-mono text-[10px] text-[#888] uppercase tracking-widest mb-1">Anomalies</div>
          <div className="space-y-1">
            {topAnomalies.map((a, i) => (
              <div key={i} className="font-mono text-[10px] text-[#fbbf24] leading-snug">
                {a.label}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Pace */}
      <div className="border-t border-[#2a2a3a] pt-2">
        <div className="font-mono text-[10px] text-[#888] uppercase tracking-widest mb-1">Pace</div>
        <div className="font-mono text-[10px] text-white leading-relaxed">
          <span className="text-[#fbbf24]">Day {daysElapsed}</span>
          {' · '}
          <span>{totalPRsToDate} PRs</span>
          {' · '}
          <span className="text-[#4ade80]">{avgPRsPerDay}/day avg</span>
        </div>
      </div>
    </div>
  );
}
