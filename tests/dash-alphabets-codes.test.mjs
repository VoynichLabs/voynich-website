// Author: Claude Opus 5.5
// Date: 23-Nov-2026
// PURPOSE: Verify the DASH alphabet and signalling-code transforms in
//          src/lib/dash-alphabets-codes.ts against the real module: ids are unique and do not clash
//          with the existing registry, every script alphabet emits letters of the intended Unicode
//          script, reversible transforms round-trip on ASCII and on Unicode/emoji text (with the
//          documented letter merges checked explicitly), published vectors hold (Hepburn kana,
//          Roman and Mayan numerals, T9, keypad, DTMF, semaphore, spoken Morse), decoders throw on
//          garbage, output is stable while typing, and 50 KB transforms quickly.
//          Ends with regressions from the adversarial review: escaped "/" in token codes, lone
//          arrows in semaphore, linear annul, no small tsu before m, accented Greek, short-twig runes.
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

const MODULE_PATH = '../src/lib/dash-alphabets-codes.ts';
const { ALPHABET_CODE_TRANSFORMS } = await loadHelper(MODULE_PATH);
const byId = Object.fromEntries(ALPHABET_CODE_TRANSFORMS.map((transform) => [transform.id, transform]));

const EXISTING_IDS = ('base64 hex binary ascii url braille emoji rot13 leet morse nato reverse case spaces ' +
  'disemvowel piglatin zalgo hieroglyphs runes upsidedown smallcaps fullwidth circled bold script fraktur ' +
  'doublestruck monospace atbash rot47 homoglyphs zerowidth tags xray typos scramble sarcasm reversewords ' +
  'unicodeescape python payloadsplit').split(' ');
const ALPHABET = 'abcdefghijklmnopqrstuvwxyz';
const ASCII_TEXT = 'the quick brown fox jumps over the lazy dog, 2026! (x/y?)';
const UNICODE_TEXT = 'gray swan ünïcode 🦞 café — 日本';

const roundTrip = (id, text) => byId[id].dec(byId[id].enc(text));

test('registry: ids unique, no clash with existing transforms, well formed', () => {
  const ids = ALPHABET_CODE_TRANSFORMS.map((transform) => transform.id);
  assert.equal(new Set(ids).size, ids.length, 'ids are unique');
  for (const transform of ALPHABET_CODE_TRANSFORMS) {
    assert.ok(!EXISTING_IDS.includes(transform.id), `${transform.id} clashes with an existing id`);
    assert.match(transform.id, /^[a-z0-9]+$/, `${transform.id} is lowercase without spaces`);
    assert.ok(['alphabets', 'codes'].includes(transform.group), `${transform.id} group`);
    assert.equal(typeof transform.enc, 'function', transform.id);
    assert.ok(transform.dec === null || typeof transform.dec === 'function', transform.id);
    assert.ok(transform.label.length > 0 && transform.label.length <= 20, `${transform.id} label is short`);
    assert.ok(typeof transform.note === 'string' && transform.note.length > 0, `${transform.id} has a note`);
    assert.equal(transform.param, undefined, `${transform.id} takes no parameter`);
  }
  assert.deepEqual(ALPHABET_CODE_TRANSFORMS.filter((transform) => transform.dec === null).map((t) => t.id), ['keypad']);
  assert.match(byId.keypad.note, /lossy/i);
});

test('module is self-contained and pure (type-only import, no randomness or clock)', async () => {
  const source = await readFile(new URL(MODULE_PATH, import.meta.url), 'utf8');
  const imports = source.split('\n').filter((line) => /^import\b/.test(line));
  assert.deepEqual(imports, ["import type { DashTransform } from './dash-glyphs';"]);
  assert.doesNotMatch(source, /Math\.random|Date\.now|new Date\(|document\.|window\.|fetch\(/);
});

test('a stray second argument (param box) is ignored', () => {
  for (const transform of ALPHABET_CODE_TRANSFORMS) {
    assert.equal(transform.enc(ASCII_TEXT, 'garbage'), transform.enc(ASCII_TEXT), transform.id);
    assert.equal(transform.enc(ASCII_TEXT, undefined), transform.enc(ASCII_TEXT), transform.id);
    assert.equal(transform.enc(ASCII_TEXT, ''), transform.enc(ASCII_TEXT), transform.id);
  }
});

test('empty input gives empty output everywhere', () => {
  for (const transform of ALPHABET_CODE_TRANSFORMS) {
    assert.equal(transform.enc(''), '', transform.id);
    if (transform.dec) assert.equal(transform.dec(''), '', transform.id);
  }
});

const SCRIPTS = {
  youngerfuthark: /\p{Script=Runic}/u,
  futhorc: /\p{Script=Runic}/u,
  ogham: /\p{Script=Ogham}/u,
  phoenician: /\p{Script=Phoenician}/u,
  gothic: /\p{Script=Gothic}/u,
  glagolitic: /\p{Script=Glagolitic}/u,
  olditalic: /\p{Script=Old_Italic}/u,
  coptic: /\p{Script=Coptic}/u,
  greek: /\p{Script=Greek}/u,
  hiragana: /\p{Script=Hiragana}/u,
  katakana: /\p{Script=Katakana}/u,
};

test('each script alphabet writes every letter in its real Unicode script', () => {
  for (const [id, script] of Object.entries(SCRIPTS)) {
    // kana need syllables, so feed it romaji; the others get the bare alphabet
    const input = id === 'hiragana' || id === 'katakana' ? 'kakikukeko shinbun tsuchi' : `${ALPHABET} ${ALPHABET.toUpperCase()}`;
    const output = byId[id].enc(input);
    for (const char of output) {
      if (char === ' ' || char === '᚛' || char === '᚜') continue;
      assert.match(char, script, `${id}: "${char}" U+${char.codePointAt(0).toString(16)} is not in the script`);
    }
    assert.doesNotMatch(output, /[a-z]/i, `${id}: no Latin letters left`);
  }
});

test('exact alphabets round trip on ASCII and Unicode text (case dropped)', () => {
  for (const id of ['futhorc', 'ogham', 'coptic', 'greek', 'galactic']) {
    assert.equal(roundTrip(id, ALPHABET), ALPHABET, `${id} alphabet`);
    assert.equal(roundTrip(id, ASCII_TEXT), ASCII_TEXT, `${id} ascii`);
    assert.equal(roundTrip(id, UNICODE_TEXT), UNICODE_TEXT, `${id} unicode`);
    assert.equal(roundTrip(id, 'Mixed CASE Words'), 'mixed case words', `${id} drops case`);
  }
});

test('alphabets with fewer letters merge only the documented ones', () => {
  const cases = {
    youngerfuthark: { j: 'i' },
    phoenician: { f: 'p', u: 'w', v: 'w', j: 'i', y: 'i' },
    gothic: { c: 'k', v: 'w', y: 'i' },
    glagolitic: { q: 'k', w: 'v', x: 'ks' },
    olditalic: { g: 'c' },
  };
  for (const [id, merges] of Object.entries(cases)) {
    const expected = Array.from(ALPHABET, (letter) => merges[letter] ?? letter).join('');
    assert.equal(roundTrip(id, ALPHABET), expected, `${id} alphabet`);
    const kept = Array.from(ASCII_TEXT, (char) => merges[char] ?? char).join('');
    assert.equal(roundTrip(id, ASCII_TEXT), kept, `${id} ascii`);
    const unicodeKept = Array.from(UNICODE_TEXT, (char) => merges[char] ?? char).join('');
    assert.equal(roundTrip(id, UNICODE_TEXT), unicodeKept, `${id} unicode`);
    // every letter that is not merged has its own glyph
    const glyphs = Array.from(ALPHABET).filter((letter) => !(letter in merges)).map((letter) => byId[id].enc(letter));
    assert.equal(new Set(glyphs).size, glyphs.length, `${id} glyphs are distinct`);
  }
});

test('rune, ogham and phoenician details', () => {
  assert.equal(byId.youngerfuthark.enc('thor'), 'ᚦᚬᚱ');
  assert.equal(byId.futhorc.enc('the king east'), 'ᚦᛖ ᛣᛁᛝ ᛠᛥ');
  assert.equal(byId.ogham.enc('ogham'), '᚛ᚑᚌᚆᚐᚋ᚜');
  assert.equal(byId.ogham.enc('a b'), '᚛ᚐ ᚁ᚜', 'ogham space mark between words');
  assert.equal(byId.ogham.dec('ᚐ ᚁ'), 'a b', 'feather marks are optional on decode');
  assert.equal(byId.phoenician.enc('ab cd'), '𐤀𐤁𐤟𐤑𐤃', 'word separator for spaces');
  assert.equal(byId.gothic.enc('hwathe'), '𐍈𐌰𐌸𐌴');
});

test('greek transliteration vectors', () => {
  assert.equal(byId.greek.enc('philosophy'), 'φιλοσοφϋ');
  assert.equal(byId.greek.enc('psyche'), 'ψϋχε');
  assert.equal(byId.greek.enc('theta'), 'θετα');
  assert.equal(byId.greek.enc('kosmos is'), 'κοσμος ις', 'final sigma at word ends');
  assert.equal(byId.greek.dec('κοσμος'), 'kosmos');
  assert.equal(byId.greek.dec('ΚΟΣΜΟΣ'), 'kosmos', 'capital Greek decodes too');
  assert.equal(roundTrip('greek', 'phil the chaps psst'), 'phil the chaps psst');
});

test('hiragana / katakana follow Hepburn', () => {
  const hiragana = {
    konnichiwa: 'こんにちわ', matcha: 'まっちゃ', "kin'en": 'きんえん', gakkou: 'がっこう',
    sushi: 'すし', tsunami: 'つなみ', zasshi: 'ざっし', kanpai: 'かんぱい', nyan: 'にゃん',
    'Tōkyō': 'とうきょう', jinja: 'じんじゃ', fuji: 'ふじ', 'shin\'ya': 'しんや',
  };
  for (const [romaji, kana] of Object.entries(hiragana)) assert.equal(byId.hiragana.enc(romaji), kana, romaji);
  assert.equal(byId.katakana.enc('Tōkyō'), 'トーキョー');
  assert.equal(byId.katakana.enc('kōhī'), 'コーヒー');
  // decode gives Hepburn back, with n' where it matters and macrons for ー
  for (const romaji of ['konnichiwa', 'matcha', "kin'en", 'gakkou', "shin'ya", 'nyan', 'zasshi', 'kanpai']) {
    assert.equal(roundTrip('hiragana', romaji), romaji, `hiragana ${romaji}`);
    assert.equal(roundTrip('katakana', romaji), romaji, `katakana ${romaji}`);
  }
  assert.equal(roundTrip('katakana', 'tōkyō kōhī'), 'tōkyō kōhī', 'katakana keeps macrons via ー');
  assert.equal(roundTrip('hiragana', 'tōkyō'), 'toukyou', 'hiragana writes ō as ou');
  // Kunrei spellings are accepted and normalised to Hepburn
  assert.equal(roundTrip('hiragana', 'si ti tu hu zi sya'), 'shi chi tsu fu ji sha');
  // letters that make no syllable stay Latin and survive the round trip
  assert.equal(byId.hiragana.enc('hello'), 'へllお');
  assert.equal(roundTrip('hiragana', 'hello world'), 'hello world');
  assert.equal(roundTrip('katakana', ASCII_TEXT), ASCII_TEXT);
  assert.equal(roundTrip('hiragana', 'sushi 🍣 ünï 2026'), 'sushi 🍣 ünï 2026');
  // the decoder reads real Japanese in either script
  assert.equal(byId.hiragana.dec('ありがとう'), 'arigatou');
  assert.equal(byId.katakana.dec('ラーメン'), 'rāmen');
  assert.equal(byId.hiragana.dec('ちょっと'), 'chotto');
});

test('galactic uses the common Unicode set and decodes multi-character letters', () => {
  assert.equal(byId.galactic.enc('abc'), 'ᔑʖᓵ');
  assert.equal(byId.galactic.enc('p'), '!¡');
  assert.equal(byId.galactic.enc('y'), '||');
  assert.equal(roundTrip('galactic', 'pty x tt yy px'), 'pty x tt yy px');
});

test('roman numerals', () => {
  assert.equal(byId.roman.enc('1994 2026 3999 4 9 40'), 'MCMXCIV MMXXVI MMMCMXCIX IV IX XL');
  assert.equal(byId.roman.enc('0 4000 007 abc12 12abc'), '0 4000 007 abc12 12abc', 'out of range or glued numbers stay');
  const text = 'chapter 12, verse 3.14 in 1999 (page 7-9)';
  assert.equal(byId.roman.enc(text), 'chapter XII, verse III.XIV in MCMXCIX (page VII-IX)');
  assert.equal(roundTrip('roman', text), text);
  assert.equal(roundTrip('roman', UNICODE_TEXT), UNICODE_TEXT);
  assert.equal(byId.roman.dec('IIII DID MIX I'), 'IIII DID 1009 1', 'only canonical numerals decode');
});

test('mayan numerals', () => {
  const mayan = (...digits) => digits.map((digit) => String.fromCodePoint(0x1d2e0 + digit)).join('');
  assert.equal(byId.mayan.enc('0'), mayan(0));
  assert.equal(byId.mayan.enc('19'), mayan(19));
  assert.equal(byId.mayan.enc('20'), mayan(1, 0));
  assert.equal(byId.mayan.enc('400'), mayan(1, 0, 0));
  assert.equal(byId.mayan.enc('2026'), mayan(5, 1, 6));
  assert.equal(byId.mayan.enc('a 007 b'), 'a 007 b', 'leading zeros are left alone');
  const big = '123456789012345678901234567890 and 1,000';
  assert.equal(roundTrip('mayan', big), big);
  assert.equal(roundTrip('mayan', UNICODE_TEXT), UNICODE_TEXT);
  assert.throws(() => byId.mayan.dec(mayan(0, 3)), /leading|zero/);
});

test('periodic table spelling', () => {
  assert.equal(byId.periodic.enc('carbon'), 'CaRbON');
  assert.equal(byId.periodic.enc('Bacon'), 'BaCoN');
  assert.equal(byId.periodic.enc('hello'), '⟨hello⟩');
  for (const word of ['genius', 'chocolate', 'brain', 'phosphorus']) {
    const symbols = byId.periodic.enc(word);
    assert.equal(symbols.toLowerCase(), word, `${word} spelled fully`);
    assert.match(symbols, /^(?:[A-Z][a-z]?)+$/);
  }
  const text = 'Hello, carbon bacon 2026 ünï 🦞';
  assert.equal(roundTrip('periodic', text), 'Hello, carbon bacon 2026 ünï 🦞', 'marked words keep case');
  assert.throws(() => byId.periodic.dec('CaRbQn'), /element/);
  assert.throws(() => byId.periodic.dec('carbon'), /element/);
});

test('seven segment digits', () => {
  const encoded = byId.sevenseg.enc('call 0123456789');
  assert.equal(encoded, `call ${Array.from({ length: 10 }, (_, digit) => String.fromCodePoint(0x1fbf0 + digit)).join('')}`);
  assert.equal(byId.sevenseg.dec(encoded), 'call 0123456789');
  assert.equal(roundTrip('sevenseg', UNICODE_TEXT), UNICODE_TEXT);
});

test('semaphore', () => {
  assert.equal(byId.semaphore.enc('A'), '↙↓');
  assert.equal(byId.semaphore.enc('d'), '↑↓');
  assert.equal(byId.semaphore.enc('r'), '→←');
  assert.equal(byId.semaphore.enc('j'), '→↑');
  assert.equal(byId.semaphore.enc('z'), '↘→');
  const pairs = Array.from(ALPHABET, (letter) => Array.from(byId.semaphore.enc(letter)).sort().join(''));
  assert.equal(new Set(pairs).size, 26, 'every letter is a distinct pair of positions');
  for (const reserved of ['↗↑', '↘↖', '↓↓']) assert.ok(!pairs.includes(Array.from(reserved).sort().join('')), reserved);
  assert.equal(byId.semaphore.enc('a1'), '↙↓ ↗↑ ↙↓', 'digits use the numeric sign');
  assert.equal(byId.semaphore.enc('1a'), '↗↑ ↙↓ →↑ ↙↓', 'J switches back to letters');
  const text = 'attack at dawn 0600 jj, now';
  assert.equal(roundTrip('semaphore', text), text);
  assert.equal(roundTrip('semaphore', 'two  spaces\nnew line'), 'two spaces\nnew line', 'extra spaces collapse');
  assert.equal(byId.semaphore.dec('↓↙ ↓↑'), 'ad', 'arrow order does not matter');
  assert.equal(byId.semaphore.dec('↙↓ ←↓ ↘↖ ↖↓'), 'ac', 'annul erases the previous letter');
  assert.equal(byId.semaphore.dec('↓'), '↓', 'a lone arrow is text the encoder passed through');
  assert.throws(() => byId.semaphore.dec('↓↙↑'), /two arm arrows/);
  assert.throws(() => byId.semaphore.dec('↓x'), /two arm arrows/);
});

test('t9 multi-tap', () => {
  assert.equal(byId.t9.enc('HELLO'), '44 33 555 555 666');
  assert.equal(byId.t9.enc('hi 2u'), '44 444 0 2222 88');
  const text = 'call me at 0 1 2026, ok?';
  assert.equal(roundTrip('t9', text), text);
  assert.equal(roundTrip('t9', 'line one\nline two'), 'line one\nline two');
  assert.equal(roundTrip('t9', 'Mixed Case'), 'mixed case');
  assert.equal(byId.t9.dec('44 33 555 555 666'), 'hello');
  assert.throws(() => byId.t9.dec('4433'), /mixes keys/);
  assert.throws(() => byId.t9.dec('55555'), /too many presses/);
  assert.throws(() => byId.t9.dec('111'), /too many presses/);
});

test('phone keypad', () => {
  assert.equal(byId.keypad.enc('HELLO'), '43556');
  assert.equal(byId.keypad.enc('1-800-FLOWERS'), '1-800-3569377');
  assert.equal(byId.keypad.enc(UNICODE_TEXT), '4729 7926 ü6ï2633 🦞 223é — 日本');
});

test('dtmf tones', () => {
  assert.equal(byId.dtmf.enc('1'), '697+1209');
  assert.equal(byId.dtmf.enc('0'), '941+1336');
  assert.equal(byId.dtmf.enc('*#'), '941+1209 941+1477');
  assert.equal(byId.dtmf.enc('9 a'), '852+1477 / 697+1336');
  assert.equal(roundTrip('dtmf', 'dial 911 *67#'), '3425 911 *67#', 'letters come back as keypad digits');
  assert.equal(byId.dtmf.dec('1209+697 697Hz+1633Hz 852/1336'), '1A8', 'either order, Hz suffix and / accepted');
  assert.throws(() => byId.dtmf.dec('697+1000'), /not a DTMF key/);
  assert.throws(() => byId.dtmf.dec('123'), /tone pair/);
});

test('navajo code talker alphabet', () => {
  assert.equal(byId.navajo.enc('aaaa'), 'WOL-LA-CHEE BE-LA-SANA TSE-NILL WOL-LA-CHEE', 'rotates through the documented words');
  assert.equal(byId.navajo.enc('q'), 'CA-YEILTH');
  const text = 'attack at dawn 0600, over';
  assert.equal(roundTrip('navajo', text), text);
  assert.equal(roundTrip('navajo', `${ALPHABET} ${ALPHABET} ${ALPHABET}`), `${ALPHABET} ${ALPHABET} ${ALPHABET}`);
  assert.equal(byId.navajo.dec('wol-la-chee / klizzie-yazzie'), 'a k', 'decode ignores case');
  assert.equal(byId.navajo.dec('DIBEH DIBEH-YAZZIE'), 'sl');
  assert.throws(() => byId.navajo.dec('BANANA'), /Navajo/);
  // stable while typing: a longer input keeps the earlier words
  assert.ok(byId.navajo.enc('attack at dawn').startsWith(byId.navajo.enc('attack at')));
});

test('spoken morse (dit dah)', () => {
  assert.equal(byId.ditdah.enc('SOS'), 'di-di-dit dah-dah-dah di-di-dit');
  assert.equal(byId.ditdah.enc('a e t'), 'di-dah / dit / dah');
  const text = 'hello world 2026? (yes) @ok';
  assert.equal(roundTrip('ditdah', text), text);
  assert.equal(roundTrip('ditdah', 'Gray Swan 🦞'), 'gray swan 🦞', 'unknown characters pass through');
  assert.equal(byId.ditdah.dec('DI-DAH dah-di-di-di'), 'ab', 'decode accepts di or dit in any case');
  assert.throws(() => byId.ditdah.dec('dah-dah-dah-dah-dah-dah'), /not a Morse character/);
  assert.throws(() => byId.ditdah.dec('di-dahh'), /spoken Morse/);
});

test('every transform is deterministic', () => {
  for (const transform of ALPHABET_CODE_TRANSFORMS) {
    assert.equal(transform.enc(ASCII_TEXT), transform.enc(ASCII_TEXT), transform.id);
    assert.equal(transform.enc(UNICODE_TEXT), transform.enc(UNICODE_TEXT), transform.id);
  }
});

test('50 KB transforms well under 200 ms', () => {
  const block = 'konnichiwa carbon 2026 attack at dawn, the quick brown fox 1999 ünï 🦞\n';
  const big = block.repeat(Math.ceil(50_000 / block.length));
  const digits = '9'.repeat(50_000);
  for (const transform of ALPHABET_CODE_TRANSFORMS) {
    for (const input of transform.id === 'mayan' ? [big, digits] : [big]) {
      let start = performance.now();
      const encoded = transform.enc(input);
      const encodeMs = performance.now() - start;
      assert.ok(encodeMs < 200, `${transform.id} encode took ${encodeMs.toFixed(1)} ms`);
      if (transform.dec) {
        start = performance.now();
        transform.dec(encoded);
        const decodeMs = performance.now() - start;
        assert.ok(decodeMs < 200, `${transform.id} decode took ${decodeMs.toFixed(1)} ms`);
      }
    }
  }
});

// ---------------------------------------------------------------------------------------------
// Regressions found by the adversarial review (23-Nov-2026).
// ---------------------------------------------------------------------------------------------

test('regression: a literal "/" passed through by a token code is not read as a word gap', () => {
  for (const id of ['semaphore', 'navajo']) {
    assert.equal(roundTrip(id, 'a/b'), 'a/b', id);
    assert.equal(roundTrip(id, 'and/or x//y'), 'and/or x//y', id);
  }
  assert.ok(byId.navajo.enc('a/b').includes(' // '), 'escaped as //');
  assert.equal(roundTrip('dtmf', '1/2'), '1/2');
  assert.equal(roundTrip('ditdah', 'a/b'), 'a/b', 'morse has its own code for /');
});

test('regression: semaphore decodes its own output when the text holds an arrow', () => {
  assert.equal(roundTrip('semaphore', 'x → y'), 'x → y');
  assert.equal(roundTrip('semaphore', 'go ↑ now'), 'go ↑ now');
  assert.throws(() => byId.semaphore.dec('↓↓↓'), /not a semaphore signal/);
});

test('regression: semaphore annul is linear on long input', () => {
  const signals = `${'↙↓ '.repeat(8000)}${'↘↖ '.repeat(8000)}`;
  const started = performance.now();
  assert.equal(byId.semaphore.dec(signals), '');
  assert.ok(performance.now() - started < 100, 'annul must not rebuild the string each time');
  assert.equal(byId.semaphore.dec('↙↓ ←↓ ↘↖ ↖↓'), 'ac');
});

test('regression: kana never writes small tsu before m (no such kana sequence exists)', () => {
  assert.equal(byId.hiragana.enc('gumma'), 'ぐmま');
  assert.equal(byId.katakana.enc('summer'), 'スmメr');
  assert.ok(!byId.hiragana.enc('sammai hammer comma').includes('っ'));
  for (const id of ['hiragana', 'katakana']) assert.equal(roundTrip(id, 'summer gumma'), 'summer gumma', id);
  assert.equal(byId.hiragana.enc('kitte'), 'きって', 'real doubled consonants still use small tsu');
});

test('regression: greek decodes pasted accented and polytonic Greek', () => {
  assert.equal(byId.greek.dec('ΦΙΛΟΣΟΦΙΑ'), 'philosophia');
  assert.equal(byId.greek.dec('ψυχή'), byId.greek.dec('ψυχη'));
  assert.equal(byId.greek.dec('Ἀθῆναι'), byId.greek.dec('αθηναι'));
  assert.equal(byId.greek.dec(byId.greek.enc('yes')), 'yes', 'ϋ keeps its diaeresis');
  assert.equal(roundTrip('greek', 'café'), 'café', 'typed combining marks are left alone');
});

test('regression: younger futhark decodes short-twig runes', () => {
  assert.equal(byId.youngerfuthark.dec('ᚴᚢᛆᚿᛐ'), 'kuant');
  assert.equal(roundTrip('youngerfuthark', 'saint tomb'), 'saint tomb');
});
