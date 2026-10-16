// Author: Claude Opus 5.5 Low
// Date: 2026-10-16
// PURPOSE: Build the page index for the Voynich book reader from Yale's official digital copy
//          (Beinecke MS 408, IIIF manifest oid 2002046). For every scanned page it writes:
//            - a small WebP thumbnail to public/voynich/pages/{slug}.webp (for grids and strips)
//            - one entry in src/data/voynich-pages.json: slug, Yale's label, section, the IIIF
//              image service (deep zoom streams straight from Yale) and full-res pixel size.
//          It also records which folios are missing from the manuscript (cut out or lost) so the
//          reader can show the gaps instead of silently renumbering.
//          Run by hand when the index needs rebuilding: `node scripts/fetch-voynich-pages.mjs`.
//          Not part of the build — it talks to Yale's server.
// SRP/DRY check: Pass — the only code that reads Yale's manifest; pages read the JSON it writes.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const MANIFEST = 'https://collections.library.yale.edu/manifests/2002046';
const THUMB_DIR = path.resolve('public/voynich/pages');
const DATA_FILE = path.resolve('src/data/voynich-pages.json');
const THUMB_HEIGHT = 420;
const UA = { 'User-Agent': 'VoynichLabs-site/1.0 (voynichlabs.org)' };

// Conventional section grouping used by Voynich researchers (after voynich.nu's illustration
// survey). Ranges are by folio number; foldouts take the section of their first folio.
const SECTIONS = [
  { id: 'herbal', name: 'Herbal', from: 1, to: 66 },
  { id: 'astronomical', name: 'Astronomical & Zodiac', from: 67, to: 74 },
  { id: 'biological', name: 'Bathing', from: 75, to: 84 },
  { id: 'cosmological', name: 'Rosettes', from: 85, to: 86 },
  { id: 'pharmaceutical', name: 'Pharmaceutical', from: 87, to: 102 },
  { id: 'recipes', name: 'Recipes', from: 103, to: 116 },
];

function sectionFor(folio) {
  if (folio == null) return 'binding';
  return SECTIONS.find((s) => folio >= s.from && folio <= s.to)?.id ?? 'binding';
}

// "85r (part) 86v (part) (part of 85-86 foldout)" -> "f85r-86v"; "[Front cover]" -> "front-cover".
// Yale splits some foldouts into several "(part)" images with the same label, so duplicates get -2, -3.
function baseSlug(label) {
  const sides = [...label.matchAll(/(\d+)([rv])/g)].map((m) => m[1] + m[2]);
  if (sides.length) return 'f' + [...new Set(sides)].join('-');
  return label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

const res = await fetch(MANIFEST, { headers: UA });
if (!res.ok) throw new Error(`manifest ${res.status}`);
const manifest = await res.json();
fs.mkdirSync(THUMB_DIR, { recursive: true });

const seen = new Map();
const pages = [];
for (const canvas of manifest.items) {
  const label = canvas.label.none[0];
  const body = canvas.items[0].items[0].body;
  const service = body.service[0]['@id'];
  let slug = baseSlug(label);
  const n = (seen.get(slug) ?? 0) + 1;
  seen.set(slug, n);
  if (n > 1) slug += `-${n}`;
  const firstFolio = label.match(/(\d+)[rv]/)?.[1];
  const folios = [...new Set([...label.matchAll(/(\d+)[rv]/g)].map((m) => Number(m[1])))];
  const isPart = /part/.test(label);
  const isFoldout = /foldout| and /.test(label) || body.width > body.height * 1.1;

  const thumbPath = path.join(THUMB_DIR, `${slug}.webp`);
  if (!fs.existsSync(thumbPath)) {
    const img = await fetch(`${service}/full/,${THUMB_HEIGHT * 2}/0/default.jpg`, { headers: UA });
    if (!img.ok) throw new Error(`${label}: image ${img.status}`);
    await sharp(Buffer.from(await img.arrayBuffer()))
      .resize({ height: THUMB_HEIGHT })
      .webp({ quality: 72, effort: 5 })
      .toFile(thumbPath);
  }
  pages.push({
    slug,
    label,
    folios,
    section: sectionFor(firstFolio ? Number(firstFolio) : null),
    service,
    width: body.width,
    height: body.height,
    foldout: isFoldout,
    part: isPart,
  });
  process.stdout.write('.');
}

const present = new Set(pages.flatMap((p) => p.folios));
const missing = [];
for (let f = 1; f <= 116; f++) if (!present.has(f)) missing.push(f);

fs.writeFileSync(
  DATA_FILE,
  JSON.stringify({ source: MANIFEST, credit: 'Yale University Library, Beinecke MS 408', sections: SECTIONS, missing, pages }, null, 1) + '\n',
);
console.log(`\n${pages.length} pages, missing folios: ${missing.join(', ')}`);
