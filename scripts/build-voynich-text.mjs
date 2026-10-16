// Author: Claude Opus 5.5 Low
// Date: 2026-10-16
// PURPOSE: Split the Zandbergen-Landini (ZL) transliteration of the Voynich Manuscript into one
//          small JSON file per scanned page, public/voynich/text/{slug}.json, for the optional
//          "Text" tab in the book reader. Each file lists the page's panels (foldouts have several),
//          and in each panel its lines in order, tagged as paragraph text, label, or text along a
//          circle or a radius, with paragraph starts marked.
//          The ZL file writes the script in EVA, a made-up Latin-letter alphabet where each letter
//          stands for one shape in the Voynich script. It is a transcription, not a translation.
//          Source: https://www.voynich.nu/data/ZL3b-n.txt (René Zandbergen and Gabriel Landini).
//          Run by hand: `node scripts/build-voynich-text.mjs` (fetches the source file).
// SRP/DRY check: Pass — the only reader of the ZL file; the page list comes from
//          src/data/voynich-pages.json written by scripts/fetch-voynich-pages.mjs.
import fs from 'node:fs';
import path from 'node:path';

const SOURCE = 'https://www.voynich.nu/data/ZL3b-n.txt';
const OUT_DIR = path.resolve('public/voynich/text');
const PAGES = JSON.parse(fs.readFileSync('src/data/voynich-pages.json', 'utf8')).pages;

// Yale photographs some foldouts in pieces and names them differently from the ZL numbering, so a
// few images are mapped by hand. The rosette sheet is one drawing photographed four ways: every
// image of it gets all of its panels.
const ROSETTES = ['f85r1', 'f85r2', 'f86v3', 'f86v4', 'f86v5', 'f86v6'];
const MANUAL = {
  f70v: ['f70v2'], // Pisces
  'f70v-2': ['f70v1'], // Aries, dark
  f72v: ['f72v3', 'f72v2'], // Leo and Virgo
  'f72v-2': ['f72v1'], // Libra
  f85r: ROSETTES,
  'f85r-86v': ROSETTES,
  f86v: ROSETTES,
  'f85v-86r': ROSETTES,
  f102v: ['f102v2', 'f102v1'],
  'f102v-2': ['f102v2', 'f102v1'],
};

const TYPES = { P: 'paragraph', L: 'label', C: 'circle', R: 'radius', S: 'label' };

// Turn one ZL text line into readable EVA: drop inline comments and markers, take the first
// reading of uncertain [a:b] spots, unwrap {ligatures}, and show word breaks as spaces.
function clean(raw) {
  return raw
    .replace(/<![^>]*>/g, '')
    .replace(/<[^>]*>/g, '')
    .replace(/\[([^:\]]*):[^\]]*\]/g, '$1')
    .replace(/[{}]/g, '')
    .replace(/@\d+;/g, '?')
    .replace(/[.,]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const res = await fetch(SOURCE, { headers: { 'User-Agent': 'VoynichLabs-site/1.0 (voynichlabs.org)' } });
if (!res.ok) throw new Error(`source ${res.status}`);
const lines = (await res.text()).split(/\r?\n/);

// panel id (e.g. "f68r2") -> [{ n, type, start, text }]
const panels = new Map();
for (const line of lines) {
  const m = line.match(/^<(f\d+[rv]\d*)\.(\d+),([@+*=&~])(\w)\w*>\s*(.*)$/);
  if (!m) continue;
  const [, panel, n, pos, type, rest] = m;
  const text = clean(rest);
  if (!text) continue;
  if (!panels.has(panel)) panels.set(panel, []);
  panels.get(panel).push({ n: Number(n), type: TYPES[type] ?? 'paragraph', start: pos === '@' || pos === '*', text });
}

// Our pages name their sides ("88v and 89r" -> 88v, 89r); a ZL panel belongs to a page when its
// side (panel id without the trailing panel number) is one of them.
const sideOf = (panel) => panel.replace(/\d+$/, '').replace(/^f/, '');
fs.mkdirSync(OUT_DIR, { recursive: true });
let written = 0;
const used = new Set();
for (const page of PAGES) {
  const ids = MANUAL[page.slug] ?? [...panels.keys()].filter((id) => {
    const sides = [...page.label.matchAll(/(\d+[rv])/g)].map((x) => x[1]);
    return sides.includes(sideOf(id));
  });
  const out = ids.filter((id) => panels.has(id)).map((id) => ({ panel: id, lines: panels.get(id) }));
  if (!out.length) continue;
  out.forEach((p) => used.add(p.panel));
  fs.writeFileSync(path.join(OUT_DIR, `${page.slug}.json`), JSON.stringify(out));
  written++;
}
const unused = [...panels.keys()].filter((id) => !used.has(id));
console.log(`${written} pages with text; ${panels.size} panels; unmatched panels: ${unused.join(', ') || 'none'}`);
