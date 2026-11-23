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
const byId = Object.fromEntries(GLYPH_TRANSFORMS.map((transform) => [transform.id, transform]));

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

test('sarcasm alternates letters only', () => {
  assert.equal(byId.sarcasm.enc('hello, world'), 'hElLo, WoRlD');
});
