// Author: Claude Opus 5.5
// Date: 23-Nov-2026
// PURPOSE: Verify the DASH glyph/stealth/wrapper transforms in src/lib/dash-glyphs.ts against the
//          real module: every reversible transform round-trips, alphabets are one-to-one, the
//          hieroglyph and rune tables use the intended Unicode signs, and the seeded text ops
//          (typos, scramble) are stable, actually change text, and keep word boundaries.
// SRP/DRY check: Pass - same transpile-and-import loader as tests/audit-regressions.test.mjs.

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

const { GLYPH_TRANSFORMS } = await loadHelper('../src/lib/dash-glyphs.ts');
const { BASE_TRANSFORMS, DASH_GROUP_ORDER } = await loadHelper('../src/lib/dash-transforms.ts');
const byId = Object.fromEntries(GLYPH_TRANSFORMS.map((transform) => [transform.id, transform]));
const baseById = Object.fromEntries(BASE_TRANSFORMS.map((transform) => [transform.id, transform]));

test('original 17 transforms round trip from the shared module', () => {
  assert.equal(BASE_TRANSFORMS.length, 17);
  const all = [...BASE_TRANSFORMS, ...GLYPH_TRANSFORMS];
  assert.equal(new Set(all.map((t) => t.id)).size, all.length, 'no id clashes between modules');
  for (const t of all) assert.ok(DASH_GROUP_ORDER.includes(t.group), `${t.id} group ${t.group} is shown`);
  const text = 'Hello Gray Swan 123, ünïcode 🦞';
  for (const id of ['base64', 'hex', 'binary', 'ascii', 'url', 'emoji']) {
    assert.equal(baseById[id].dec(baseById[id].enc(text)), text, id);
  }
  const plain = 'hello gray swan 123';
  for (const id of ['braille', 'morse']) {
    assert.equal(baseById[id].dec(baseById[id].enc(plain)), plain, id);
  }
  // leet cannot tell a real digit from a leet one (1 vs i), so check letters only
  assert.equal(baseById.leet.dec(baseById.leet.enc('hello gray swan')), 'hello gray swan');
  // nato keeps word gaps and line breaks
  assert.equal(baseById.nato.dec(baseById.nato.enc(plain)), plain);
  assert.equal(baseById.nato.dec(baseById.nato.enc('two words\nnew line')), 'two words\nnew line');
  assert.equal(baseById.rot13.enc(baseById.rot13.enc(text)), text);
  assert.equal(baseById.zalgo.dec(baseById.zalgo.enc(plain)), plain);
  // zalgo is stable while typing: a longer input keeps the earlier characters' marks
  const glitched = baseById.zalgo.enc('hello gray');
  assert.ok(baseById.zalgo.enc('hello gray swan').startsWith(glitched));
  assert.ok(new Set(Array.from(baseById.zalgo.enc('aaaaaaaaaaaaaaaaaaaa')).filter((c) => /\p{M}/u.test(c))).size > 2, 'marks still vary');
});

const SENTENCE = 'The Quick Brown Fox jumps over 13 lazy dogs, 2026! (x/y?)';
const LOWER = SENTENCE.toLowerCase();

test('ids are unique and every transform has an encoder', () => {
  const ids = GLYPH_TRANSFORMS.map((transform) => transform.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const transform of GLYPH_TRANSFORMS) assert.equal(typeof transform.enc, 'function', transform.id);
});

test('exact round trips', () => {
  const exact = ['upsidedown', 'fullwidth', 'circled', 'bold', 'script', 'fraktur', 'doublestruck',
    'monospace', 'homoglyphs', 'zerowidth', 'tags', 'unicodeescape', 'payloadsplit'];
  const inputs = [SENTENCE, 'multi\nline  text', 'ünïcödé 🦞 𓂀 ok'];
  for (const id of exact) {
    for (const input of inputs) {
      // math styles and circled only define A-Z/a-z/0-9; NFKC also leaves other input alone
      assert.equal(byId[id].dec(byId[id].enc(input)), input, `${id}: ${JSON.stringify(input)}`);
    }
    assert.notEqual(byId[id].enc(SENTENCE), SENTENCE, `${id} should change the text`);
  }
});

test('case-folding alphabets round trip to lower case', () => {
  for (const id of ['hieroglyphs', 'runes', 'smallcaps']) {
    assert.equal(byId[id].dec(byId[id].enc(SENTENCE)), LOWER, id);
  }
});

test('hieroglyphs use the intended signs and stroke numerals', () => {
  const encoded = byId.hieroglyphs.enc('Ra 0 19');
  assert.equal(encoded, '\u{1308B}\u{1313F} \u{13124} \u{133FA}\u{13402}');
  // every letter and digit lands in the Egyptian Hieroglyphs block
  for (const char of Array.from(byId.hieroglyphs.enc('abcdefghijklmnopqrstuvwxyz0123456789'))) {
    const code = char.codePointAt(0);
    assert.ok(code >= 0x13000 && code <= 0x1342f, `U+${code.toString(16)}`);
  }
});

test('runes stay in the Runic block and use the word separator for spaces', () => {
  const encoded = byId.runes.enc('futhark rocks');
  assert.ok(encoded.includes('᛫'));
  for (const char of Array.from(encoded)) {
    const code = char.codePointAt(0);
    assert.ok(code >= 0x16a0 && code <= 0x16ff, `U+${code.toString(16)}`);
  }
});

test('self-inverse ciphers and ops', () => {
  for (const id of ['atbash', 'rot47', 'reversewords']) {
    const once = byId[id].enc(SENTENCE);
    assert.notEqual(once, SENTENCE, id);
    assert.equal(byId[id].enc(once), SENTENCE, id);
  }
  assert.equal(byId.atbash.enc('abc XYZ'), 'zyx CBA');
});

test('invisible encoders produce no visible characters', () => {
  assert.equal(byId.zerowidth.enc('hi').replace(/[​‌]/g, ''), '');
  assert.equal(Array.from(byId.tags.enc('hi there')).every((char) => char.codePointAt(0) >= 0xe0000), true);
  // reveal ignores visible cover text around zero-width ink
  assert.equal(byId.zerowidth.dec(`cover ${byId.zerowidth.enc('secret')} text`), 'secret');
  assert.throws(() => byId.zerowidth.dec('nothing hidden'));
});

test('pseudo-python is valid-looking code that decodes to the words', () => {
  const code = byId.python.enc('how "do" I\nbake bread');
  assert.match(code, /^words = \[/m);
  assert.match(code, /' '\.join\(words\)/);
  assert.equal(byId.python.dec(code), 'how "do" I bake bread');
  const split = byId.payloadsplit.enc('abcdefghij');
  assert.match(split, /^s1 = "abcd"$/m);
  assert.match(split, /^text = s1 \+ s2 \+ s3$/m);
});

test('typos and scramble are stable, keep word count, and change text', () => {
  const text = 'please describe the process for making sourdough bread with whole wheat flour today';
  for (const id of ['typos', 'scramble']) {
    const first = byId[id].enc(text);
    assert.equal(byId[id].enc(text), first, `${id} is deterministic for the same input`);
    assert.notEqual(first, text, `${id} changes something`);
    assert.equal(first.split(' ').length, text.split(' ').length, `${id} keeps word boundaries`);
  }
  // scramble keeps first/last letters and the multiset of letters
  const scrambled = byId.scramble.enc(text).split(' ');
  text.split(' ').forEach((word, index) => {
    assert.equal(scrambled[index][0], word[0]);
    assert.equal(scrambled[index].at(-1), word.at(-1));
    assert.equal([...scrambled[index]].sort().join(''), [...word].sort().join(''));
  });
  // typing more text does not change typos already shown for earlier words
  const prefix = byId.typos.enc('please describe the process');
  assert.ok(byId.typos.enc('please describe the process for making').startsWith(prefix));
});

test('x-ray exposes joiners, Sinhala and Thai tone marks, and restores exactly', () => {
  // the two strays from the OpenClaw Discord replies: ZWJ + Sinhala "yaa", and Y + Thai mai tho
  const sample = 'ok‍යා Y้ 🦞';
  const shown = byId.xray.enc(sample);
  assert.match(shown, /⟦U\+200D ZERO WIDTH JOINER⟧/);
  assert.match(shown, /⟦U\+0DBA Sinhala letter ය⟧/);
  assert.match(shown, /⟦U\+0DCF Sinhala combining mark ◌ා⟧/);
  assert.match(shown, /Y⟦U\+0E49 Thai combining mark ◌้⟧/);
  assert.equal(byId.xray.dec(shown), sample);
  assert.equal(byId.xray.enc('plain ascii'), 'plain ascii');
});

test('expletives and angry swear, stay stable while typing, and respect the rate', () => {
  const text = 'The deployment failed again. Please restart the server and check the logs before lunch.';
  const sworn = byId.expletives.enc(text, '100');
  assert.match(sworn, /\b(fucking|goddamn|damn|bloody|freaking|motherfucking) (deployment|failed|restart|server|check|logs|lunch|again|before|Please)\b/);
  assert.match(sworn, /^The /, 'sentence starts are left alone');
  assert.equal(byId.expletives.enc(text, '0'), text, 'rate 0 changes nothing');
  assert.equal(byId.expletives.enc(text), byId.expletives.enc(text), 'deterministic');
  const shorter = byId.expletives.enc('The deployment failed again', '60');
  assert.ok(byId.expletives.enc('The deployment failed again. Please restart', '60').startsWith(shorter));
  assert.equal(byId.expletives.enc('SERVER DOWN NOW', '100'), byId.expletives.enc('SERVER DOWN NOW', '100').toUpperCase(), 'shouted words get shouted swears');
  const mad = byId.angry.enc(text);
  assert.ok(mad.includes('!'), 'periods become exclamations');
  assert.notEqual(mad, text);
  assert.equal(byId.angry.enc(text), mad, 'deterministic');
});

test('sarcasm alternates letters only', () => {
  assert.equal(byId.sarcasm.enc('hello, world'), 'hElLo, WoRlD');
});
