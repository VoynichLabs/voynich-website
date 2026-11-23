// Author: Claude Opus 5.5
// Date: 23-Nov-2026
// PURPOSE: Verify the classic DASH ciphers in src/lib/dash-ciphers-classic.ts against the real
//          module: ids are unique across every DASH module, published test vectors (Caesar,
//          Vigenere ATTACKATDAWN/LEMON, Beaufort, autokey, Porta, keyword KRYPTOS, affine 5,8,
//          Nihilist ZEBRAS/RUSSIAN, tap code WATER, rot8000 Hello...), exact round trips on ASCII
//          and Unicode/emoji text, self-inverse transforms, param parsing and defaults, decoders
//          that throw on garbage, 50 KB inputs well inside the 200 ms budget, and regressions from
//          the adversarial review (huge Caesar shifts, DNA byte-order mark, nihilist key parsing).
// SRP/DRY check: Pass - same transpile-and-import loader as tests/dash-glyphs.test.mjs.

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

const { CLASSIC_CIPHER_TRANSFORMS } = await loadHelper('../src/lib/dash-ciphers-classic.ts');
const { GLYPH_TRANSFORMS } = await loadHelper('../src/lib/dash-glyphs.ts');
const { BASE_TRANSFORMS, DASH_GROUP_ORDER } = await loadHelper('../src/lib/dash-transforms.ts');
const byId = Object.fromEntries(CLASSIC_CIPHER_TRANSFORMS.map((transform) => [transform.id, transform]));

const EXPECTED_IDS = ['caesar', 'rot5', 'rot18', 'rot8000', 'vigenere', 'beaufort', 'autokey', 'gronsfeld',
  'porta', 'trithemius', 'keyword', 'affine', 'multiplicative', 'a1z26', 'baconian', 'polybius', 'tapcode',
  'nihilist', 'qwerty', 'dna'];
const SELF_INVERSE = ['rot5', 'rot18', 'rot8000', 'beaufort', 'porta'];
const SENTENCE = 'The Quick Brown Fox jumps over 13 lazy dogs, 2026! (x/y?)';
const UNICODE = 'ünïcödé 🦞 𓂀 Ωmega — naïve café';

const enc = (id, input, param) => byId[id].enc(input, param);
const dec = (id, input, param) => byId[id].dec(input, param);

test('ids are unique, lowercase, in the ciphers group and do not clash with other modules', () => {
  const ids = CLASSIC_CIPHER_TRANSFORMS.map((transform) => transform.id);
  assert.deepEqual(ids, EXPECTED_IDS);
  const all = [...BASE_TRANSFORMS, ...GLYPH_TRANSFORMS, ...CLASSIC_CIPHER_TRANSFORMS].map((transform) => transform.id);
  assert.equal(new Set(all).size, all.length, 'no id clashes between modules');
  assert.ok(DASH_GROUP_ORDER.includes('ciphers'));
  for (const transform of CLASSIC_CIPHER_TRANSFORMS) {
    assert.match(transform.id, /^[a-z0-9]+$/, transform.id);
    assert.equal(transform.group, 'ciphers', transform.id);
    assert.equal(typeof transform.enc, 'function', transform.id);
    assert.ok(transform.note && transform.note.length < 160, `${transform.id} has a short note`);
    if (transform.dec === null) assert.ok(SELF_INVERSE.includes(transform.id), `${transform.id} has no decoder`);
    if (transform.param) assert.equal(typeof transform.param.default, 'string', transform.id);
  }
});

test('published test vectors', () => {
  assert.equal(enc('caesar', 'THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG'), 'WKH TXLFN EURZQ IRA MXPSV RYHU WKH ODCB GRJ');
  assert.equal(enc('rot5', '0123456789'), '5678901234');
  assert.equal(enc('rot18', 'Hello 2026'), 'Uryyb 7571');
  assert.equal(enc('rot8000', 'Hello'), '籑籮籵籵籸');
  assert.equal(enc('rot8000', 'Hello World'), '籑籮籵籵籸 籠籸类籵籭');
  assert.equal(enc('vigenere', 'ATTACKATDAWN', 'LEMON'), 'LXFOPVEFRNHR');
  assert.equal(enc('vigenere', 'attack at dawn!'), 'lxfopv ef rnhr!', 'default key, case kept, key skips non-letters');
  assert.equal(enc('beaufort', 'DEFENDTHEEASTWALLOFTHECASTLE', 'FORTIFICATION'), 'CKMPVCPVWPIWUJOGIUAPVWRIWUUK');
  assert.equal(enc('autokey', 'ATTACKATDAWN', 'QUEENLY'), 'QNXEPVYTWTWP');
  assert.equal(enc('gronsfeld', 'ATTACKATDAWN', '31415'), 'DUXBHNBXEFZO');
  assert.equal(enc('gronsfeld', SENTENCE, '31415'), enc('vigenere', SENTENCE, 'DBEBF'), 'gronsfeld = vigenere with A-J key');
  assert.equal(enc('porta', 'DEFENDTHEEASTWALLOFTHECASTLE', 'FORTIFICATION'), 'SYNNJSCVRNRLAHUTUKUCVRYRLANY');
  assert.equal(enc('trithemius', 'HELLOWORLD'), 'HFNOSBUYTM');
  assert.equal(enc('trithemius', SENTENCE), enc('vigenere', SENTENCE, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'));
  assert.equal(enc('keyword', 'KNOWLEDGEISPOWER', 'KRYPTOS'), 'DGHVETPSTBMIHVTL');
  assert.equal(enc('affine', 'AFFINE CIPHER', '5,8'), 'IHHWVC SWFRCP');
  assert.equal(enc('multiplicative', 'ABCZ', '7'), 'AHOT');
  assert.equal(enc('a1z26', 'Hello world'), '8-5-12-12-15 23-15-18-12-4');
  assert.equal(enc('baconian', 'jUvZ'), 'ABAAB BABAA BABAB BBAAB', '26-letter variant keeps I/J and U/V apart');
  assert.equal(enc('baconian', 'ab, c'), 'AAAAA AAAAB / AAABA');
  assert.equal(enc('polybius', 'BAT'), '12 11 44');
  assert.equal(enc('polybius', 'IJ z'), '24 24 / 55');
  assert.equal(enc('tapcode', 'WATER'), '..... ..  . .  .... ....  . .....  .... ..');
  assert.equal(enc('tapcode', 'k'), enc('tapcode', 'c'));
  assert.equal(enc('nihilist', 'DYNAMITE WINTER PALACE', 'ZEBRAS, RUSSIAN'),
    '37 106 62 36 67 47 86 26 / 104 53 62 77 27 55 / 57 66 55 36 54 27');
  assert.equal(enc('qwerty', 'hello'), 'jr;;p');
  assert.equal(enc('qwerty', '=\\\'/+|"?'), '`qaz~QAZ', 'row ends wrap');
  assert.equal(enc('dna', 'A'), 'CAAC');
  assert.equal(enc('dna', 'Hi'), 'CAGACGGC');
});

test('exact round trips on ASCII and Unicode/emoji text', () => {
  const exact = EXPECTED_IDS.filter((id) => byId[id].dec && !['a1z26', 'baconian', 'polybius', 'tapcode', 'nihilist'].includes(id));
  assert.deepEqual(exact, ['caesar', 'vigenere', 'autokey', 'gronsfeld', 'trithemius', 'keyword', 'affine', 'multiplicative', 'qwerty', 'dna']);
  const inputs = [SENTENCE, 'multi\nline\ttext  ', UNICODE, ''];
  for (const id of exact) {
    for (const input of inputs) {
      assert.equal(dec(id, enc(id, input)), input, `${id}: ${JSON.stringify(input)}`);
    }
    assert.notEqual(enc(id, SENTENCE), SENTENCE, `${id} should change the text`);
  }
  // non-default keys too
  const keyed = [['caesar', '-29'], ['vigenere', 'Gray Swan'], ['autokey', 'k'], ['gronsfeld', '9 0 7'],
    ['keyword', 'zebra'], ['affine', '25, -3'], ['multiplicative', '-1']];
  for (const [id, key] of keyed) assert.equal(dec(id, enc(id, SENTENCE, key), key), SENTENCE, `${id} key ${key}`);
});

test('square and group ciphers round trip to lower-case words', () => {
  const words = 'The Quick Brown Fox, jumps over the lazy dog!';
  const lower = 'the quick brown fox jumps over the lazy dog';
  for (const id of ['baconian', 'polybius', 'tapcode', 'nihilist']) {
    const normalised = id === 'polybius' || id === 'nihilist' ? lower.replace(/j/g, 'i')
      : id === 'tapcode' ? lower.replace(/k/g, 'c') : lower;
    assert.equal(dec(id, enc(id, words)), normalised, id);
    assert.equal(dec(id, enc(id, `  ${UNICODE} 2026 `)), 'ncd mega nave caf', `${id} drops non A-Z`);
  }
  assert.equal(dec('nihilist', enc('nihilist', words, 'zebra'), 'zebra'), lower.replace(/j/g, 'i'), 'one-word key');
  assert.equal(dec('a1z26', enc('a1z26', words)), 'the quick brown fox, jumps over the lazy dog!');
  assert.equal(dec('a1z26', enc('a1z26', UNICODE)), UNICODE, 'non-ASCII letters pass through untouched');
  assert.equal(dec('baconian', 'aaaaa aaaab/abaab'), 'ab j', 'lower-case A/B accepted, spacing optional');
  assert.equal(dec('polybius', '121144'), 'bat', 'pairs without spaces');
  for (const id of ['a1z26', 'baconian', 'polybius', 'tapcode', 'nihilist', 'dna']) {
    assert.equal(dec(id, '   '), '', `${id}: blank decodes to blank`);
  }
});

test('self-inverse transforms restore the text when run twice', () => {
  const inputs = [SENTENCE, UNICODE, 'line one\nline two 　end'];
  for (const id of SELF_INVERSE) {
    for (const input of inputs) assert.equal(enc(id, enc(id, input)), input, `${id}: ${JSON.stringify(input)}`);
    assert.notEqual(enc(id, SENTENCE), SENTENCE, `${id} should change the text`);
  }
  assert.equal(enc('beaufort', enc('beaufort', SENTENCE, 'gray'), 'gray'), SENTENCE);
  assert.equal(enc('porta', enc('porta', SENTENCE, 'swan'), 'swan'), SENTENCE);
  // rot8000 leaves whitespace and astral characters alone and only produces BMP non-surrogates
  const rotated = enc('rot8000', `a b\tc\n🦞　`);
  assert.deepEqual([rotated[1], rotated[3], rotated[5], rotated.slice(6, 8), rotated[8]], [' ', '\t', '\n', '🦞', '　']);
  assert.ok(!/[\ud800-\udfff]/.test(enc('rot8000', 'ABCxyz~!')), 'no lone surrogates');
});

test('param parsing: blank falls back to the default, junk is rejected', () => {
  for (const transform of CLASSIC_CIPHER_TRANSFORMS.filter((t) => t.param)) {
    const expected = transform.enc(SENTENCE, transform.param.default);
    assert.equal(transform.enc(SENTENCE, undefined), expected, `${transform.id} undefined`);
    assert.equal(transform.enc(SENTENCE, '   '), expected, `${transform.id} blank`);
  }
  assert.equal(enc('caesar', 'abc', ' 29 '), enc('caesar', 'abc', '3'), 'shift wraps mod 26 and is trimmed');
  assert.equal(enc('caesar', 'abc', '-1'), 'zab');
  assert.equal(enc('caesar', 'abc', '+1'), 'bcd');
  assert.equal(enc('vigenere', 'attack', 'l-e-m-o-n 9'), enc('vigenere', 'attack', 'LEMON'), 'key keeps letters only');
  assert.equal(enc('affine', 'abc', ' 5 ; 8 '), enc('affine', 'abc', '5,8'));
  assert.equal(enc('affine', 'abc', '31,34'), enc('affine', 'abc', '5,8'), 'a and b reduced mod 26');
  assert.equal(enc('nihilist', 'dog', 'RUSSIAN'), enc('nihilist', 'dog', ',RUSSIAN'), 'one word = key with plain square');
  assert.throws(() => enc('caesar', 'x', 'three'), /whole number/);
  assert.throws(() => enc('caesar', 'x', '1.5'), /whole number/);
  assert.throws(() => enc('caesar', 'x', '99999999999999999999'), /too large/);
  assert.throws(() => enc('vigenere', 'x', '123'), /at least one letter/);
  assert.throws(() => dec('vigenere', 'x', '!!'), /at least one letter/);
  assert.throws(() => enc('gronsfeld', 'x', '12a'), /digits/);
  assert.throws(() => enc('affine', 'x', '13,2'), /shares a factor with 26/);
  assert.throws(() => enc('affine', 'x', '4,1'), /shares a factor with 26/);
  assert.throws(() => dec('affine', 'x', '26,1'), /shares a factor with 26/);
  assert.throws(() => enc('affine', 'x', '5'), /two numbers/);
  assert.throws(() => enc('multiplicative', 'x', '2'), /shares a factor with 26/);
  assert.throws(() => enc('nihilist', 'x', 'a,b,c'), /square keyword, key/);
  assert.throws(() => enc('nihilist', 'x', 'zebras, 42'), /at least one letter/);
});

test('decoders throw a clear error on garbage', () => {
  const garbage = [
    ['a1z26', 'hello', /no numbers/], ['a1z26', '8-5-27', /27 is not a letter number/], ['a1z26', '0', /not a letter number/],
    ['baconian', 'ABC', /only contain A, B/], ['baconian', 'AAAA', /5 symbols/], ['baconian', 'BBBBB', /not a letter/],
    ['polybius', '1a', /digits 1-5/], ['polybius', '123', /odd number/], ['polybius', '16', /not a square cell/], ['polybius', '61', /not a square cell/],
    ['tapcode', '......', /1-5 taps/], ['tapcode', '. .x', /1-5 taps/], ['tapcode', '. . .', /pairs/],
    ['nihilist', 'abc', /not a number/], ['nihilist', '5', /not a square cell/], ['nihilist', '/', /nothing to decode/],
    ['dna', 'ACGX', /not a DNA base/], ['dna', 'ACG', /4 bases per byte/], ['dna', 'TTTT', /not valid UTF-8/],
  ];
  for (const [id, input, message] of garbage) assert.throws(() => dec(id, input), message, `${id}: ${input}`);
});

test('50 KB of input transforms well inside 200 ms', () => {
  // no digits: a1z26 reads digits already in the text as letter numbers (documented in its note)
  const line = `The Quick Brown Fox jumps over the lazy dog, again! ${UNICODE}\n`;
  const big = line.repeat(Math.ceil(50_000 / line.length)).slice(0, 50_000);
  enc('rot8000', 'warm up'); // builds the lookup table once
  for (const transform of CLASSIC_CIPHER_TRANSFORMS) {
    const started = performance.now();
    const encoded = transform.enc(big, undefined);
    if (transform.dec) transform.dec(encoded, undefined);
    const elapsed = performance.now() - started;
    assert.ok(elapsed < 200, `${transform.id} took ${elapsed.toFixed(1)} ms`);
  }
});

test('regressions found by the adversarial review', () => {
  // huge Caesar shifts are reduced mod 26 first, so float precision cannot break the round trip
  const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (const shift of ['9007199254740991', '-9007199254740991']) {
    assert.equal(dec('caesar', enc('caesar', alphabet, shift), shift), alphabet, `caesar shift ${shift}`);
    assert.equal(enc('caesar', alphabet, shift), enc('caesar', alphabet, String(Number(BigInt(shift) % 26n))), shift);
  }
  // DNA keeps a leading byte-order mark instead of TextDecoder silently stripping it
  for (const text of ['﻿hi', '﻿', 'a﻿b']) assert.equal(dec('dna', enc('dna', text)), text, JSON.stringify(text));
  // the DNA error names the character the user typed, not its upper-case form
  assert.throws(() => dec('dna', 'ACGTß'), /"ß" is not a DNA base/);
  assert.throws(() => dec('dna', 'ACG🦞'), /"🦞" is not a DNA base/);
  // nihilist accepts "square key" separated by spaces as well as by a comma
  const wikipedia = '37 106 62 36 67 47 86 26 / 104 53 62 77 27 55 / 57 66 55 36 54 27';
  assert.equal(enc('nihilist', 'DYNAMITE WINTER PALACE', 'ZEBRAS RUSSIAN'), wikipedia);
  assert.equal(enc('nihilist', 'DYNAMITE WINTER PALACE', ' zebras ;  russian '), wikipedia);
  assert.equal(dec('nihilist', wikipedia, 'ZEBRAS RUSSIAN'), 'dynamite winter palace');
  assert.throws(() => enc('nihilist', 'x', '123, RUSSIAN'), /square keyword needs at least one letter/);
  // a1z26: hyphens between letters are lost (stated in the note), and the note says so
  assert.equal(dec('a1z26', enc('a1z26', 'well-known')), 'wellknown');
  assert.match(byId.a1z26.note, /hyphens/);
});
