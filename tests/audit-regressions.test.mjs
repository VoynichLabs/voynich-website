// Author: Codex GPT-6
// Date: 2026-10-08
// PURPOSE: Exercise shared album link parsing and CLAW aggregation against the
// actual recorded events, including the unequal March 19 error rates in the audit.
// SRP/DRY check: Pass — tests load production helpers without duplicating their logic.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';

async function loadHelper(path) {
  const source = await readFile(new URL(path, import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
  });
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
}

const { trackIndexFromHash } = await loadHelper('../src/lib/music-links.ts');
const { activityByDay, dashboardEvents } = await loadHelper('../src/lib/claw-activity.ts');
const events = JSON.parse(await readFile(new URL('../src/data/claw/events.json', import.meta.url)));

test('both published fragment formats select the intended album track', () => {
  const tracks = [{ slug: 'power-grid-down' }, { slug: 'get-gone' }, { slug: 'space song' }];
  for (const hash of ['#get-gone', '#track=get-gone']) {
    assert.equal(trackIndexFromHash(tracks, track => track.slug, hash), 1);
  }
  assert.equal(trackIndexFromHash(tracks, track => track.slug, '#track=space%20song'), 2);
  for (const hash of ['', '#', '#track=', '#unknown', '#track=%E0%A4%A']) {
    assert.equal(trackIndexFromHash(tracks, track => track.slug, hash), -1);
  }
});

test('daily activity preserves unequal recorded agent counts and error rates', () => {
  const day = activityByDay(events)['2026-03-19'];
  assert.deepEqual(day.egon, { events: 1175, errors: 66 });
  assert.deepEqual(day.bubba, { events: 947, errors: 3 });
  assert.deepEqual(day.larry, { events: 1, errors: 0 });
  assert.notEqual(day.egon.errors / day.egon.events, day.bubba.errors / day.bubba.events);
});

test('aggregation conserves every recorded event and error without invented activity', () => {
  const days = activityByDay(events);
  const counts = Object.values(days).flatMap(day => Object.values(day));
  assert.equal(counts.reduce((sum, count) => sum + count.events, 0), events.length);
  assert.equal(counts.reduce((sum, count) => sum + count.errors, 0), events.filter(event => event.event_type === 'error').length);
  assert.deepEqual(activityByDay([]), {});
  assert.equal(days['1900-01-01'], undefined);
});

test('compact dashboard records preserve metrics and the terminal log fields', () => {
  const compact = dashboardEvents(events);
  assert.deepEqual(activityByDay(compact), activityByDay(events));
  for (let index = 0; index < events.length; index++) {
    assert.equal(compact[index].timestamp, events[index].timestamp);
    assert.equal(compact[index].pr_title, events[index].pr_title?.slice(0, 92) || undefined);
    assert.equal(compact[index].message, events[index].message?.slice(0, 92) || undefined);
  }
  assert.ok(JSON.stringify(compact).length < JSON.stringify(events).length / 2);
});
