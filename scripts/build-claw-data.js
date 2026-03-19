#!/usr/bin/env node
// Author: Bubba (claude-sonnet-4)
// Date: 2026-03-19
// PURPOSE: Build static JSON data files for the CLAW dashboard page.
//          Reads full-events.jsonl from agenttrafficcontrol repo and outputs
//          pre-aggregated JSON files for Astro to import at build time.
// SRP/DRY check: Pass — single responsibility: data transformation pipeline.

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC_FILE = '/Users/macmini/Documents/GitHub/agenttrafficcontrol/data/full-events.jsonl';
const OUT_DIR = resolve(__dirname, '../src/data/claw');

mkdirSync(OUT_DIR, { recursive: true });

// --- Load events ---
const raw = readFileSync(SRC_FILE, 'utf-8').trim().split('\n');
const events = raw.map(line => JSON.parse(line));

// Sort by timestamp
events.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

// --- events.json — all events sorted ---
writeFileSync(`${OUT_DIR}/events.json`, JSON.stringify(events, null, 2));
console.log(`events.json: ${events.length} events`);

// --- daily-stats.json ---
const dailyMap = {};
for (const e of events) {
  const date = e.timestamp.slice(0, 10);
  if (!dailyMap[date]) {
    dailyMap[date] = { date, events: 0, prs_opened: 0, prs_merged: 0, errors: 0, messages: 0 };
  }
  dailyMap[date].events++;
  if (e.event_type === 'pr_opened')  dailyMap[date].prs_opened++;
  if (e.event_type === 'pr_merged')  dailyMap[date].prs_merged++;
  if (e.event_type === 'error')      dailyMap[date].errors++;
  if (e.event_type === 'message')    dailyMap[date].messages++;
}
const dailyStats = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));
writeFileSync(`${OUT_DIR}/daily-stats.json`, JSON.stringify(dailyStats, null, 2));
console.log(`daily-stats.json: ${dailyStats.length} days`);

// --- crew-stats.json ---
const crewMap = {};
const KNOWN_CREW = ['egon', 'bubba', 'larry', 'simon', 'mark'];
for (const e of events) {
  const id = e.agent_id;
  if (!KNOWN_CREW.includes(id)) continue;
  if (!crewMap[id]) {
    crewMap[id] = { agent_id: id, total_events: 0, messages: 0, errors: 0, prs: 0, session_starts: 0 };
  }
  crewMap[id].total_events++;
  if (e.event_type === 'message')       crewMap[id].messages++;
  if (e.event_type === 'error')         crewMap[id].errors++;
  if (e.event_type === 'pr_merged')     crewMap[id].prs++;
  if (e.event_type === 'session_start') crewMap[id].session_starts++;
}
const crewStats = KNOWN_CREW
  .filter(id => crewMap[id])
  .map(id => crewMap[id]);
writeFileSync(`${OUT_DIR}/crew-stats.json`, JSON.stringify(crewStats, null, 2));
console.log(`crew-stats.json: ${crewStats.length} crew members`);

// --- pr-timeline.json ---
const prMap = {};
for (const e of events) {
  if (e.event_type === 'pr_opened') {
    prMap[e.pr_number] = {
      pr_number: e.pr_number,
      title: e.pr_title,
      author: e.agent_id,
      opened_at: e.timestamp,
      merged_at: null,
      cycle_hours: null,
    };
  }
  if (e.event_type === 'pr_merged' && prMap[e.pr_number]) {
    prMap[e.pr_number].merged_at = e.timestamp;
    const ms = new Date(e.timestamp) - new Date(prMap[e.pr_number].opened_at);
    prMap[e.pr_number].cycle_hours = Math.round(ms / 1000 / 3600 * 10) / 10;
  }
}
const prTimeline = Object.values(prMap).sort((a, b) => a.pr_number - b.pr_number);
writeFileSync(`${OUT_DIR}/pr-timeline.json`, JSON.stringify(prTimeline, null, 2));
console.log(`pr-timeline.json: ${prTimeline.length} PRs`);

console.log('\nAll CLAW data files written to', OUT_DIR);
