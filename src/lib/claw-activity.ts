// Author: Codex GPT-6
// Date: 2026-10-08
// PURPOSE: Derive exact daily agent activity from the recorded CLAW events for the
// tank and page sparklines, and strip unused event fields from dashboard hydration.
// SRP/DRY check: Pass — shared aggregation uses the existing event source.

export interface ClawEvent {
  timestamp: string;
  agent_id: string;
  event_type: string;
  pr_title?: string;
  message?: string;
}

export interface AgentActivity {
  events: number;
  errors: number;
}

export function activityByDay(events: readonly ClawEvent[]) {
  const days: Record<string, Record<string, AgentActivity>> = {};
  for (const event of events) {
    const date = event.timestamp.slice(0, 10);
    const agents = days[date] ??= {};
    const activity = agents[event.agent_id] ??= { events: 0, errors: 0 };
    activity.events++;
    if (event.event_type === 'error') activity.errors++;
  }
  return days;
}

export function dashboardEvents(events: readonly ClawEvent[]): ClawEvent[] {
  return events.map(({ timestamp, agent_id, event_type, pr_title, message }) => ({
    timestamp, agent_id, event_type,
    // Only the terminal log needs detail, and displays fewer than 92 characters.
    ...(pr_title ? { pr_title: pr_title.slice(0, 92) } : {}),
    ...(message ? { message: message.slice(0, 92) } : {}),
  }));
}
