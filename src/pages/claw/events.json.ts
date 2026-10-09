// Author: Codex GPT-6
// Date: 2026-10-08
// PURPOSE: Emit the compact, real CLAW event feed as a separate static resource.
// The dashboard loads it when visible instead of embedding raw records in HTML.
// SRP/DRY check: Pass — reuses the existing event source and shared projection.

import events from '../../data/claw/events.json';
import { dashboardEvents } from '../../lib/claw-activity';

export const prerender = true;

export function GET() {
  return new Response(JSON.stringify(dashboardEvents(events)), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
