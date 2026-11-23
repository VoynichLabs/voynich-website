// Author: Claude Opus 5.5
// Date: 23-Nov-2026
// PURPOSE: Verify the DASH Unicode style transforms in src/lib/dash-unicode-styles.ts against the
//          real module: ids are unique and do not clash with the existing DASH registry, every
//          decodable style round-trips mixed-case ASCII (exactly, or upper-cased for the
//          capital-only alphabets), Unicode and emoji input survives, the code points match the
//          Unicode charts (checked through NFKC compatibility decompositions where they exist),
//          mirror is its own inverse, regional letters never form flags, decoders pass unrelated
//          text through untouched, and 50 KB of input transforms well under 200 ms.
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

const { UNICODE_STYLE_TRANSFORMS } = await loadHelper('../src/lib/dash-unicode-styles.ts');
const byId = Object.fromEntries(UNICODE_STYLE_TRANSFORMS.map((transform) => [transform.id, transform]));

const EXISTING_IDS = `base64 hex binary ascii url braille emoji rot13 leet morse nato reverse case spaces
  disemvowel piglatin zalgo hieroglyphs runes upsidedown smallcaps fullwidth circled bold script fraktur
  doublestruck monospace atbash rot47 homoglyphs zerowidth tags xray typos scramble sarcasm reversewords
  unicodeescape python payloadsplit`.split(/\s+/);

const SENTENCE = 'The Quick Brown Fox jumps over 13 lazy dogs, 2026! (x/y?) [b<d>p]';
const UNICODE_INPUTS = ['multi\nline  text\r\nend', 'ünïcödé 🦞 𓂀 ok', 'é 👨‍👩‍👧 family'];

const MATH_STYLES = ['italic', 'bolditalic', 'sans', 'sansbold', 'sansitalic', 'sansbolditalic', 'boldscript', 'boldfraktur'];
const LINE_STYLES = { strikethrough: '̶', slashthrough: '̸', underline: '̲', doubleunderline: '̳', overline: '̅' };
const EXACT = [...MATH_STYLES, 'superscript', 'subscript', ...Object.keys(LINE_STYLES), 'parenthesized', 'fauxcyrillic', 'widespacing'];
const CAPITAL_ONLY = ['regional', 'squared', 'negsquared', 'negcircled'];
const asciiUpper = (text) => text.replace(/[a-z]/g, (letter) => letter.toUpperCase());
const codePoints = (text) => Array.from(text, (char) => char.codePointAt(0));

test('ids are unique, new, lowercase, and every entry is well formed', () => {
  const ids = UNICODE_STYLE_TRANSFORMS.map((transform) => transform.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const transform of UNICODE_STYLE_TRANSFORMS) {
    assert.match(transform.id, /^[a-z]+$/, transform.id);
    assert.ok(!EXISTING_IDS.includes(transform.id), `${transform.id} clashes with an existing id`);
    assert.equal(transform.group, 'glyphs', transform.id);
    assert.equal(typeof transform.enc, 'function', transform.id);
    assert.ok(transform.dec === null || typeof transform.dec === 'function', transform.id);
    assert.ok(transform.label.length > 0 && transform.label.length <= 20, transform.id);
    assert.ok(typeof transform.note === 'string' && transform.note.length > 0, `${transform.id} has a note`);
    assert.equal(transform.param, undefined, `${transform.id} takes no parameter`);
  }
  assert.deepEqual([...EXACT, ...CAPITAL_ONLY, 'mirror'].sort(), [...ids].sort(), 'every id is covered below');
});

test('every decodable style round-trips mixed-case ASCII exactly and changes it', () => {
  for (const id of EXACT) {
    const encoded = byId[id].enc(SENTENCE);
    assert.notEqual(encoded, SENTENCE, `${id} changes the text`);
    assert.equal(byId[id].dec(encoded), SENTENCE, id);
  }
});

test('capital-only alphabets round-trip to upper case (case is documented as lost)', () => {
  for (const id of CAPITAL_ONLY) {
    const encoded = byId[id].enc(SENTENCE);
    assert.notEqual(encoded, SENTENCE, id);
    assert.equal(byId[id].dec(encoded), asciiUpper(SENTENCE), id);
  }
});

test('Unicode, emoji and line breaks survive every round trip exactly (no normalisation)', () => {
  for (const input of UNICODE_INPUTS) {
    for (const id of EXACT) {
      assert.equal(byId[id].dec(byId[id].enc(input)), input, `${id}: ${JSON.stringify(input)}`);
    }
    for (const id of CAPITAL_ONLY) {
      assert.equal(byId[id].dec(byId[id].enc(input)), asciiUpper(input), `${id}: ${JSON.stringify(input)}`);
    }
  }
});

test('math styles use the published Mathematical Alphanumeric Symbols code points', () => {
  const first = {
    italic: [0x1d434, 0x1d44e], bolditalic: [0x1d468, 0x1d482], boldscript: [0x1d4d0, 0x1d4ea],
    boldfraktur: [0x1d56c, 0x1d586], sans: [0x1d5a0, 0x1d5ba], sansbold: [0x1d5d4, 0x1d5ee],
    sansitalic: [0x1d608, 0x1d622], sansbolditalic: [0x1d63c, 0x1d656],
  };
  for (const [id, [upperA, lowerA]] of Object.entries(first)) {
    assert.deepEqual(codePoints(byId[id].enc('Aa')), [upperA, lowerA], id);
    assert.deepEqual(codePoints(byId[id].enc('Zz')), [upperA + 25, lowerA + 25], id);
  }
  // italic h is the Planck constant: the math-italic h slot (U+1D455) is reserved
  assert.equal(byId.italic.enc('h'), 'ℎ');
  assert.equal(byId.italic.enc('g'), '\u{1d454}');
  assert.equal(byId.italic.enc('i'), '\u{1d456}');
  assert.deepEqual(codePoints(byId.sans.enc('09')), [0x1d7e2, 0x1d7eb]);
  assert.deepEqual(codePoints(byId.sansbold.enc('09')), [0x1d7ec, 0x1d7f5]);
  for (const id of ['italic', 'bolditalic', 'sansitalic', 'sansbolditalic', 'boldscript', 'boldfraktur']) {
    assert.equal(byId[id].enc('0123456789'), '0123456789', `${id} leaves digits alone`);
  }
  // every styled letter is a real character whose NFKC decomposition is the plain letter
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (const id of MATH_STYLES) {
    Array.from(alphabet).forEach((plain) => {
      const styled = byId[id].enc(plain);
      if (styled !== plain) assert.equal(styled.normalize('NFKC'), plain, `${id} ${plain} -> U+${styled.codePointAt(0).toString(16)}`);
    });
  }
});

test('superscript and subscript map exactly what Unicode has, checked against <super>/<sub>', () => {
  assert.equal(byId.superscript.enc('x2+y2=(n-1)'), 'ˣ²⁺ʸ²⁼⁽ⁿ⁻¹⁾');
  assert.equal(byId.subscript.enc('H2O + CO2'), 'H₂O ₊ CO₂');
  assert.equal(byId.superscript.enc('SXYZ'), 'SXYZ', 'unsupported characters stay plain');
  // Unicode 14 added superscript q (U+107A5) and capitals C F Q (U+A7F2-A7F4)
  assert.deepEqual(codePoints(byId.superscript.enc('qCFQ')), [0x107a5, 0xa7f2, 0xa7f3, 0xa7f4]);
  assert.equal(byId.subscript.enc('bcdfgqwyz ABC'), 'bcdfgqwyz ABC');
  const everything = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-=()';
  const mapped = { superscript: 0, subscript: 0 };
  for (const id of ['superscript', 'subscript']) {
    const decomposition = id === 'superscript' ? 'super' : 'sub';
    for (const plain of everything) {
      const styled = byId[id].enc(plain);
      if (styled === plain) continue;
      mapped[id]++;
      // the superscript and subscript hyphens decompose to U+2212 MINUS SIGN, not ASCII '-'
      assert.equal(styled.normalize('NFKC'), plain === '-' ? '−' : plain, `${id} ${plain} (<${decomposition}>) -> U+${styled.codePointAt(0).toString(16)}`);
    }
  }
  assert.equal(mapped.superscript, 10 + 5 + 26 + 22);
  assert.equal(mapped.subscript, 10 + 5 + 17);
});

test('line styles put one mark after every character except line breaks', () => {
  for (const [id, mark] of Object.entries(LINE_STYLES)) {
    assert.equal(byId[id].enc('ab c'), `a${mark}b${mark} ${mark}c${mark}`, id);
    assert.equal(byId[id].enc('a\nb'), `a${mark}\nb${mark}`, id);
    // the mark follows the whole grapheme, not the middle of an emoji sequence or accent
    assert.equal(byId[id].enc('é👍🏽'), `é${mark}👍🏽${mark}`, id);
  }
  // stacked styles peel off one at a time
  const stacked = byId.underline.enc(byId.strikethrough.enc('hi'));
  assert.equal(byId.underline.dec(stacked), byId.strikethrough.enc('hi'));
  // slash-through survives NFC normalisation fusing = < > with U+0338 into ≠ ≮ ≯
  const fused = byId.slashthrough.enc('a=b<c>d').normalize('NFC');
  assert.ok(fused.includes('≠') && fused.includes('≮') && fused.includes('≯'));
  assert.equal(byId.slashthrough.dec(fused), 'a=b<c>d');
});

test('regional indicators never pair into flags and decode back', () => {
  assert.equal(byId.regional.enc('us'), '🇺‌🇸');
  assert.equal(byId.regional.enc('a b'), '🇦 🇧');
  assert.equal(byId.regional.dec('🇺‌🇸 2'), 'US 2');
  assert.equal(byId.regional.dec('🇺🇸'), 'US', 'real flags decode to their letters');
  const chars = Array.from(byId.regional.enc('Hello World'));
  const isIndicator = (char) => (char?.codePointAt(0) ?? 0) >= 0x1f1e6 && (char?.codePointAt(0) ?? 0) <= 0x1f1ff;
  chars.forEach((char, index) => assert.ok(!(isIndicator(char) && isIndicator(chars[index + 1])), 'no adjacent indicators'));
});

test('enclosed alphabets match the Enclosed Alphanumeric Supplement charts', () => {
  assert.equal(byId.squared.enc('Az'), '\u{1f130}\u{1f149}');
  assert.equal(byId.squared.enc('A').normalize('NFKC'), 'A', 'squared has a <square> decomposition');
  assert.equal(byId.negsquared.enc('ab'), '\u{1f170}\u{1f171}');
  assert.equal(byId.negsquared.dec('🅰️🅱️'), 'AB', 'emoji presentation selectors are dropped');
  assert.equal(byId.negcircled.enc('a 0 5 9'), '\u{1f150} ⓿ ❺ ❾');
  assert.equal(byId.parenthesized.enc('aZ 19 0'), '⒜\u{1f129} ⑴⑼ 0');
  // parenthesized decode does not touch typed brackets
  assert.equal(byId.parenthesized.dec('(a) ⒜'), '(a) a');
});

test('mirror reverses, swaps mirror pairs, keeps graphemes whole, and is its own inverse', () => {
  assert.equal(byId.mirror.dec, null);
  assert.equal(byId.mirror.enc('abc(d)'), '(b)cda');
  assert.equal(byId.mirror.enc('p/q [x] <y> {z} \\'), '/ {z} <y> [x] p\\q');
  assert.equal(byId.mirror.enc('aé'), 'éa', 'accent stays on its letter');
  for (const input of [SENTENCE, ...UNICODE_INPUTS]) {
    const once = byId.mirror.enc(input);
    assert.equal(byId.mirror.enc(once), input, JSON.stringify(input));
  }
});

test('faux cyrillic uses look-alike Cyrillic letters', () => {
  assert.equal(byId.fauxcyrillic.enc('NERA'), 'ИЄЯД');
  assert.equal(byId.fauxcyrillic.enc('DLZ dlz').replace(/[^\x00-\x7f]/g, '*'), 'DLZ **z', 'D, L, Z and z stay Latin');
  for (const char of byId.fauxcyrillic.enc('ABCEFGHIJKMNOPQRSTUVWXYabcdefghijklmnopqrstuvwxy')) {
    assert.match(char, /\p{Script=Cyrillic}/u, `U+${char.codePointAt(0).toString(16)}`);
  }
});

test('wide spacing separates characters with ideographic spaces', () => {
  assert.equal(byId.widespacing.enc('ab c'), 'a　b　 　c');
  assert.equal(byId.widespacing.enc('ab\ncd'), 'a　b\nc　d');
  assert.equal(byId.widespacing.enc('👨‍👩‍👧!'), '👨‍👩‍👧　!');
});

test('decoders are total: text without styled characters comes back unchanged', () => {
  const garbage = 'Plain text 123, ✓ ünïcödé 🦞 ​';
  for (const transform of UNICODE_STYLE_TRANSFORMS) {
    if (!transform.dec) continue;
    assert.doesNotThrow(() => transform.dec(garbage), transform.id);
    assert.equal(transform.dec(garbage), garbage, transform.id);
    assert.equal(transform.dec(''), '', transform.id);
    assert.equal(transform.enc(''), '', transform.id);
  }
});

test('encoders ignore a stray param and are deterministic', () => {
  for (const transform of UNICODE_STYLE_TRANSFORMS) {
    assert.equal(transform.enc(SENTENCE, 'junk'), transform.enc(SENTENCE), transform.id);
    assert.equal(transform.enc(SENTENCE), transform.enc(SENTENCE), transform.id);
  }
});

test('50 KB of input transforms well under 200 ms', () => {
  const big = `${SENTENCE} ünïcödé 🦞\n`.repeat(Math.ceil(50_000 / (SENTENCE.length + 12))).slice(0, 50_000);
  for (const transform of UNICODE_STYLE_TRANSFORMS) {
    const start = performance.now();
    const encoded = transform.enc(big);
    const decoded = (transform.dec ?? transform.enc)(encoded);
    const elapsed = performance.now() - start;
    assert.ok(decoded.length > 0);
    assert.ok(elapsed < 200, `${transform.id} took ${elapsed.toFixed(1)} ms`);
  }
});

// ---------------------------------------------------------------------------------------------
// regressions found in the adversarial review (23-Nov-2026). Invisible characters are built from
// code points so the source stays readable.
// ---------------------------------------------------------------------------------------------

const cp = (...points) => String.fromCodePoint(...points);
const TAB = cp(0x09);
const ZWSP = cp(0x200b);
const ZWNJ = cp(0x200c);
const NBSP = cp(0xa0);
const LINE_SEPARATOR = cp(0x2028);
const IDEO = cp(0x3000);
const ACUTE = cp(0x301);
const FLAG_U = cp(0x1f1fa);
const FLAG_S = cp(0x1f1f8);
const isIndicator = (char) => (char?.codePointAt(0) ?? 0) >= 0x1f1e6 && (char?.codePointAt(0) ?? 0) <= 0x1f1ff;

test('regression: math and squared decoders leave unrelated text alone (no whole-string NFKC)', () => {
  const awkward = 'E=mc² … ﬁ ™ a' + NBSP + 'b ｶ ½ ① e' + ACUTE;
  for (const id of MATH_STYLES) assert.equal(byId[id].dec(byId[id].enc(awkward)), awkward, id);
  assert.equal(byId.squared.dec(byId.squared.enc(awkward)), asciiUpper(awkward));
  // every math style still decodes, including the Letterlike stand-ins other styles use
  assert.equal(byId.italic.dec(cp(0x1d400, 0x212c, 0x210e, 0x2102, 0x1d7ce)), 'ABhC0');
});

test('regression: line styles strip one layer per character, keeping marks that were already there', () => {
  for (const [id, mark] of Object.entries(LINE_STYLES)) {
    const inputs = ['a' + mark + 'b', mark + 'x', TAB + mark + 'x' + ZWSP + ' y', 'a' + LINE_SEPARATOR + 'b' + TAB + 'c'];
    for (const input of inputs) {
      assert.equal(byId[id].dec(byId[id].enc(input)), input, `${id}: ${JSON.stringify(input)}`);
    }
    // the same style applied twice comes off one layer at a time
    assert.equal(byId[id].dec(byId[id].enc(byId[id].enc('hi'))), byId[id].enc('hi'), id);
    // invisible controls get no mark
    assert.equal(byId[id].enc('a' + TAB + 'b'), 'a' + mark + TAB + 'b' + mark, id);
  }
  // stacked different styles can be peeled in either order
  const stacked = byId.underline.enc(byId.strikethrough.enc('hi'));
  assert.equal(byId.strikethrough.dec(stacked), byId.underline.enc('hi'));
  // a real ≠ in the input survives slash-through, whether or not an app NFC-normalised it
  assert.equal(byId.slashthrough.dec(byId.slashthrough.enc('a≠b')), 'a≠b');
  assert.equal(byId.slashthrough.dec(byId.slashthrough.enc('a≠b=').normalize('NFC')), 'a≠b=');
});

test('regression: wide spacing keeps ideographic spaces that were in the original text', () => {
  for (const input of ['日本' + IDEO + '語', IDEO + 'lead\n trail' + IDEO, 'a' + IDEO + IDEO + 'b\r\nc']) {
    assert.equal(byId.widespacing.dec(byId.widespacing.enc(input)), input, JSON.stringify(input));
  }
  // hand-typed spacing that is not the encoder's layout still collapses
  assert.equal(byId.widespacing.dec('H' + IDEO + IDEO + 'i'), 'Hi');
});

test('regression: regional keeps input ZWNJs and never forms a flag next to an existing indicator', () => {
  for (const input of ['a' + ZWNJ + 'b', 'a' + ZWNJ + ZWNJ + 'b' + ZWNJ, ZWNJ + 'ab']) {
    assert.equal(byId.regional.dec(byId.regional.enc(input)), asciiUpper(input), JSON.stringify(input));
  }
  // an indicator already in the text gets a separator before the new one, so no flag 🇺🇦 appears
  const regionalA = cp(0x1f1e6);
  assert.equal(byId.regional.enc(FLAG_U + 'a'), FLAG_U + ZWNJ + regionalA);
  assert.equal(byId.regional.enc(FLAG_U + FLAG_S + 'a'), FLAG_U + FLAG_S + ZWNJ + regionalA, 'existing flag left whole');
  assert.equal(byId.regional.enc(FLAG_U + ZWNJ + 'a'), FLAG_U + ZWNJ + ZWNJ + regionalA);
  const chars = Array.from(byId.regional.enc(FLAG_U + 'a'));
  chars.forEach((char, index) => assert.ok(!(isIndicator(char) && isIndicator(chars[index + 1]))));
});

test('regression: superscript maps the Unicode 14 letters and mirror documents its limits', () => {
  assert.equal(byId.superscript.dec(byId.superscript.enc('Quick Fox CQ')), 'Quick Fox CQ');
  assert.match(byId.mirror.note, /odd run of flag letters/);
  const input = 'line (one)\nb/d é 👨‍👩‍👧 «q»';
  assert.equal(byId.mirror.enc(byId.mirror.enc(input)), input);
});
