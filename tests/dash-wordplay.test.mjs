// Author: Claude Opus 5.5
// Date: 23-Nov-2026
// PURPOSE: Verify the DASH word-level transforms in src/lib/dash-wordplay.ts against the real
//          module: ids are unique across all three DASH modules, every reversible transform
//          round-trips (exactly, or with the normalisation its note states), the language games
//          match their published examples, self-inverse ops undo themselves, keyed transforms
//          parse their param defensively, decoders reject garbage with a clear Error, and 50 KB
//          of text transforms well inside the 200 ms budget.
//          Includes regression tests for bugs found in the adversarial review (23-Nov-2026).
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

const { WORDPLAY_TRANSFORMS } = await loadHelper('../src/lib/dash-wordplay.ts');
const { GLYPH_TRANSFORMS } = await loadHelper('../src/lib/dash-glyphs.ts');
const { BASE_TRANSFORMS } = await loadHelper('../src/lib/dash-transforms.ts');
const byId = Object.fromEntries(WORDPLAY_TRANSFORMS.map((transform) => [transform.id, transform]));

const EXISTING_IDS = ('base64 hex binary ascii url braille emoji rot13 leet morse nato reverse case spaces ' +
  'disemvowel piglatin zalgo hieroglyphs runes upsidedown smallcaps fullwidth circled bold script fraktur ' +
  'doublestruck monospace atbash rot47 homoglyphs zerowidth tags xray typos scramble sarcasm reversewords ' +
  'unicodeescape python payloadsplit').split(' ');

const ASCII = 'The Quick Brown Fox jumps over 13 lazy dogs, 2026! (x/y?)';
const MULTILINE = 'first line here\n  indented   second line\r\nthird, with CAPS';
const UNICODE = 'Crème brûlée für Ünïcode 🦞 👨‍👩‍👧 𓂀 ok';

test('ids are unique, lowercase, and do not clash with the other DASH modules', () => {
  const ids = WORDPLAY_TRANSFORMS.map((transform) => transform.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const id of ids) {
    assert.match(id, /^[a-z0-9]+$/, id);
    assert.ok(!EXISTING_IDS.includes(id), `${id} clashes with an existing id`);
  }
  const all = [...BASE_TRANSFORMS, ...GLYPH_TRANSFORMS, ...WORDPLAY_TRANSFORMS].map((transform) => transform.id);
  assert.equal(new Set(all).size, all.length, 'no id clashes across modules');
});

test('every transform is well formed and one-way ones say so', () => {
  for (const transform of WORDPLAY_TRANSFORMS) {
    assert.ok(['case', 'language games', 'text ops'].includes(transform.group), transform.id);
    assert.equal(typeof transform.enc, 'function', transform.id);
    assert.ok(transform.dec === null || typeof transform.dec === 'function', transform.id);
    assert.ok(transform.label && transform.label.length <= 24, `${transform.id} label`);
    assert.ok(transform.note, `${transform.id} has a note`);
    if (transform.dec === null) assert.match(transform.note, /One-way|Self-inverse/, `${transform.id} note`);
    if (transform.param) {
      assert.ok(transform.param.label && transform.param.default && transform.param.hint, `${transform.id} param`);
    }
    // every transform copes with empty input
    assert.equal(typeof transform.enc(''), 'string', transform.id);
  }
});

test('exact round trips on ASCII, multi-line and Unicode/emoji input', () => {
  const exact = ['rovarspraket', 'ubbidubbi', 'opish', 'javanais', 'vowelswap', 'shufflewords'];
  for (const id of exact) {
    for (const input of [ASCII, MULTILINE, UNICODE, ASCII.toUpperCase(), 'I AM A Apple aI']) {
      assert.equal(byId[id].dec(byId[id].enc(input)), input, `${id}: ${JSON.stringify(input)}`);
    }
    assert.notEqual(byId[id].enc(ASCII), ASCII, `${id} changes the text`);
  }
});

test('heavy leet round-trips to lower case, escaping digits and drawing symbols', () => {
  for (const input of [ASCII, MULTILINE, UNICODE, 'pipes | slashes / \\ ~tilde~ `tick` <x> 3.14 _under_ *star* ^caret^']) {
    // A-Z come back lower case; other letters (ü, 𓂀) pass through untouched
    const expected = input.replace(/[A-Z]/g, (letter) => letter.toLowerCase());
    assert.equal(byId.heavyleet.dec(byId.heavyleet.enc(input)), expected, JSON.stringify(input));
  }
  assert.equal(byId.heavyleet.enc('hm'), '|-|/\\/\\');
  // the drawing table is prefix-safe: every pair and every triple of letters decodes back exactly
  const letters = 'abcdefghijklmnopqrstuvwxyz';
  for (const first of letters) {
    for (const second of letters) {
      for (const third of ['', ...letters]) {
        const word = first + second + third;
        assert.equal(byId.heavyleet.dec(byId.heavyleet.enc(word)), word, word);
      }
    }
  }
});

test('gibberish teaches a vocabulary with a legend and decodes from it', () => {
  const input = 'the cat sat on the mat\nThe CAT is Happy, 2026!';
  const encoded = byId.gibberish.enc(input);
  const [body, legend] = encoded.split('\n\n[gibberish legend: ');
  assert.ok(legend.endsWith(']'));
  // one entry per distinct word, case-insensitively
  assert.equal(legend.slice(0, -1).split(', ').length, new Set(input.toLowerCase().match(/\p{L}+/gu)).size);
  // consistent: both "the" become the same made-up word, and case shape is kept
  const bodyWords = body.match(/\p{L}+/gu);
  assert.equal(bodyWords[0], bodyWords[4]);
  assert.equal(bodyWords[6], bodyWords[0][0].toUpperCase() + bodyWords[0].slice(1));
  assert.equal(bodyWords[7], bodyWords[7].toUpperCase());
  assert.ok(!/\b(cat|sat|mat|happy)\b/i.test(body), 'real words are gone from the body');
  assert.equal(byId.gibberish.dec(encoded), input);
  // Unicode words survive; odd inner capitals come back lower case (documented)
  assert.equal(byId.gibberish.dec(byId.gibberish.enc(UNICODE)), UNICODE);
  assert.equal(byId.gibberish.dec(byId.gibberish.enc('my iPhone')), 'my iphone');
  // a made-up word never collides with a real word of the same text
  const many = 'ba be bi bo bu da de di do du fa fe fi fo fu ga ge gi go gu';
  assert.equal(byId.gibberish.dec(byId.gibberish.enc(many)), many);
});

test('published examples of the language games', () => {
  // Wikipedia, "Rövarspråket"
  assert.equal(byId.rovarspraket.enc('Jag talar rövarspråket'), 'Jojagog totalolaror rorövovarorsospoproråkoketot');
  assert.equal(byId.ubbidubbi.enc('Hello'), 'Hubellubo');
  assert.equal(byId.opish.enc('cat'), 'copatop');
  assert.equal(byId.javanais.enc('bonjour'), 'bavonjavour');
  assert.equal(byId.javanais.enc('fou'), 'favou');
  assert.equal(byId.louchebem.enc('boucher'), 'loucherbem');
  assert.equal(byId.louchebem.enc('Jargon'), 'Largonji');
  assert.equal(byId.verlan.enc('louche'), 'chelou');
  assert.equal(byId.verlan.enc('fou'), 'ouf');
  assert.equal(byId.verlan.enc('bonjour'), 'jourbon');
  assert.equal(byId.vowelswap.enc('a e i o u AEIOU'), 'e i o u a EIOUA');
});

test('case keeps its shape in the language games', () => {
  assert.equal(byId.rovarspraket.enc('HEJ Hej'), 'HOHEJOJ Hohejoj');
  assert.equal(byId.ubbidubbi.enc('Apple AN'), 'Ubapplube UBAN');
  assert.equal(byId.ubbidubbi.dec('Ubapplube UBAN'), 'Apple AN');
  assert.equal(byId.opish.enc('PIG'), 'POPIGOP');
});

test('one-way language games are stable, keep non-letters, and change words', () => {
  for (const id of ['louchebem', 'verlan', 'latinish', 'emojispeak']) {
    const once = byId[id].enc(ASCII);
    assert.equal(byId[id].enc(ASCII), once, `${id} is deterministic`);
    assert.notEqual(once, ASCII, `${id} changes something`);
    assert.match(once, /13 .*2026! \(x\/y\?\)$/, `${id} leaves digits and punctuation`);
  }
  assert.equal(byId.latinish.enc('the dog and I'), `ille ${byId.latinish.enc('dog')} et Ego`);
  assert.equal(byId.latinish.enc('running'), 'runnando');
  assert.equal(byId.emojispeak.enc('I love my Dog and cats, wow'), 'I ❤️ my 🐶 and 🐱, 😮');
  assert.equal(byId.emojispeak.enc('constructor toString'), 'constructor toString', 'no prototype lookups');
});

test('identifier case styles', () => {
  const input = 'XMLHttpRequest parser, v2 don\'t-stop_me now';
  assert.equal(byId.camelcase.enc(input), 'xmlHttpRequestParserV2DontStopMeNow');
  assert.equal(byId.pascalcase.enc(input), 'XmlHttpRequestParserV2DontStopMeNow');
  assert.equal(byId.snakecase.enc(input), 'xml_http_request_parser_v_2_dont_stop_me_now');
  assert.equal(byId.constantcase.enc(input), 'XML_HTTP_REQUEST_PARSER_V_2_DONT_STOP_ME_NOW');
  assert.equal(byId.kebabcase.enc(input), 'xml-http-request-parser-v-2-dont-stop-me-now');
  assert.equal(byId.snakecase.enc('one two\nthree four'), 'one_two\nthree_four', 'one identifier per line');
  assert.equal(byId.camelcase.enc('über straße'), 'überStraße');
});

test('prose case styles', () => {
  assert.equal(byId.titlecase.enc('the lord of the rings and NASA iPhone'), 'The Lord of the Rings and NASA iPhone');
  assert.equal(byId.titlecase.enc('WHAT A SHOUT OF JOY'), 'What a Shout of Joy');
  assert.equal(byId.titlecase.enc('look up'), 'Look Up', 'small word last on the line is capitalised');
  assert.equal(byId.sentencecase.enc('HELLO THERE. i think "so"! new line\nyes'), 'Hello there. I think "so"! New line\nYes');
  const shown = byId.randomcase.enc('please describe the process for making sourdough');
  assert.equal(byId.randomcase.enc('please describe the process for making sourdough'), shown, 'deterministic');
  assert.equal(shown.toLowerCase(), 'please describe the process for making sourdough');
  assert.notEqual(shown, shown.toLowerCase());
  assert.notEqual(shown, shown.toUpperCase());
  // stable while typing: more text does not change the words already shown
  assert.ok(byId.randomcase.enc('please describe the process for making sourdough bread').startsWith(shown));
});

test('text ops: clean-up', () => {
  assert.equal(byId.removeaccents.enc('Crème brûlée, Straße, Øresund, Ελληνικά, Łódź'), 'Creme brulee, Strasse, Oresund, Ελληνικα, Lodz');
  assert.equal(byId.removeaccents.enc('हिन्दी 1️⃣ 🦞'), 'हिन्दी 1️⃣ 🦞', 'other scripts and emoji keep their marks');
  const hidden = 'a​b‌‍c‮d⁦e\u{E0041}\u{E007F}f️g­h﻿i⁠j͏k\u{E0100}l\u0007mㅤn';
  assert.equal(byId.stripinvisible.enc(hidden), 'abcdefghijklmn');
  assert.equal(byId.stripinvisible.enc('tabs\tand\nlines\r\nstay'), 'tabs\tand\nlines\r\nstay');
  assert.equal(byId.removepunctuation.enc('Hello, world! It\'s "fine" (really) - $5 + 2.'), 'Hello world Its fine really  $5 + 2');
  assert.equal(byId.collapsewhitespace.enc('  a  \t b \n\n\n\n c   d  \r\n e'), 'a b\n\nc d\ne');
});

test('shuffle words: keyed, spacing kept, defensive param parsing', () => {
  const line = 'one two three four five six seven eight';
  const shuffled = byId.shufflewords.enc(line);
  assert.notEqual(shuffled, line);
  assert.deepEqual(shuffled.split(' ').sort(), line.split(' ').sort());
  for (const blank of [undefined, '', '   ', 'swan', '  swan  ']) {
    assert.equal(byId.shufflewords.enc(line, blank), shuffled, `param ${JSON.stringify(blank)} means the default key`);
  }
  const keyed = byId.shufflewords.enc(line, 'other key');
  assert.notEqual(keyed, shuffled, 'a different key gives a different order');
  assert.equal(byId.shufflewords.dec(keyed, 'other key'), line);
  assert.notEqual(byId.shufflewords.dec(keyed, 'swan'), line, 'the wrong key does not restore it');
  assert.equal(byId.shufflewords.enc('two words'), 'words two', 'never leaves a line unchanged');
  const spaced = 'a  b\tc   d';
  assert.match(byId.shufflewords.enc(spaced), /^\S+ {2}\S+\t\S+ {3}\S+$/);
  // gibberish reads its param the same way
  for (const blank of [undefined, '', '  ']) assert.equal(byId.gibberish.enc(line, blank), byId.gibberish.enc(line, 'swan'));
  assert.notEqual(byId.gibberish.enc(line, 'zebra'), byId.gibberish.enc(line));
});

test('boustrophedon is self-inverse and reverses every second line by grapheme', () => {
  const input = 'one\ntwo 👨‍👩‍👧 é\r\nthree\nfour 🇬🇧';
  const once = byId.boustrophedon.enc(input);
  assert.equal(once, 'one\né 👨‍👩‍👧 owt\r\nthree\n🇬🇧 ruof');
  assert.equal(byId.boustrophedon.enc(once), input);
  assert.equal(byId.boustrophedon.enc('single line'), 'single line');
});

test('decoders throw a clear error on garbage', () => {
  const cases = [
    ['rovarspraket', 'hello', /not rovarspraket/],
    ['opish', 'hello', /not Opish/],
    ['ubbidubbi', 'hello', /not Ubbi Dubbi/],
    ['javanais', 'bonjour', /not javanais/],
    ['gibberish', 'no legend here', /no gibberish legend/],
    ['gibberish', 'x\n\n[gibberish legend: bad entry]', /not in made=word form/],
    ['heavyleet', 'a | b', /not heavy leet/],
    ['heavyleet', '|-|~', /lone ~ escape/],
  ];
  for (const [id, input, message] of cases) {
    assert.throws(() => byId[id].dec(input), (error) => error instanceof Error && message.test(error.message), `${id}: ${input}`);
  }
});

test('regressions found by the adversarial review', () => {
  // latin-ish looked words up on a plain object, so "constructor" hit Object.prototype and crashed
  for (const word of ['constructor', 'toString', 'valueOf', 'hasOwnProperty', '__proto__']) {
    assert.equal(typeof byId.latinish.enc(word), 'string', word);
  }
  // gibberish: more distinct short words than one-syllable nonsense can cover used to loop forever
  const shortWords = [];
  for (const first of 'abcdefghij') for (const second of 'abcdefghijklmnopqrstuvwxyz') for (const third of 'abc') {
    shortWords.push(first + second + third);
  }
  const manyShort = shortWords.join(' ');
  assert.equal(byId.gibberish.dec(byId.gibberish.enc(manyShort)), manyShort);
  // gibberish: text without letters gets no legend, and decoding it gives it back
  for (const plain of ['', '123 !!', '🦞\n42']) assert.equal(byId.gibberish.dec(byId.gibberish.enc(plain)), plain);
  // gibberish: lower-casing İ adds a combining dot, which the legend parser used to reject
  assert.equal(byId.gibberish.dec(byId.gibberish.enc('İstanbul İ')), 'İstanbul İ');
  // sentence case backtracked cubically on long whitespace runs; now a linear scan
  for (const slow of ['\n'.repeat(50_000) + '1', 'a.' + ' '.repeat(50_000) + '1']) {
    const started = performance.now();
    assert.equal(byId.sentencecase.enc(slow).length, slow.length);
    assert.ok(performance.now() - started < 200, 'sentence case stays linear');
  }
  assert.equal(byId.sentencecase.enc('ONE. (two) three?  ¿qué?\n\n  "four" 5 six'), 'One. (Two) three?  ¿Qué?\n\n  "Four" 5 six');
  // identifier styles: a decomposed accent no longer splits a word
  assert.equal(byId.snakecase.enc('ÉCOLE café École'), 'école_café_école');
  assert.equal(byId.camelcase.enc('ÉCOLE café'), 'écoleCafé');
  // random case keeps letters whose other case is longer (ß would become SS)
  assert.equal(byId.randomcase.enc('straße').toLowerCase(), 'straße');
});

test('50 KB of text transforms in well under 200 ms', () => {
  const big = 'Lorem ipsum dolor sit amet, Consectetur ADIPISCING elit 🦞 ünï café.\n'.repeat(760);
  assert.ok(big.length >= 50_000);
  for (const transform of WORDPLAY_TRANSFORMS) {
    const started = performance.now();
    const encoded = transform.enc(big, transform.param?.default);
    const decoded = transform.dec ? transform.dec(encoded, transform.param?.default) : null;
    const elapsed = performance.now() - started;
    assert.ok(elapsed < 200, `${transform.id} took ${elapsed.toFixed(1)} ms`);
    if (['rovarspraket', 'ubbidubbi', 'opish', 'javanais', 'vowelswap', 'shufflewords'].includes(transform.id)) {
      assert.equal(decoded, big, `${transform.id} round-trips at size`);
    }
  }
});
