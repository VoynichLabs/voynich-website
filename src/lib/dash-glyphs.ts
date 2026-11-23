// Author: Claude Opus 5.5
// Date: 23-Nov-2026
// PURPOSE: Extra pure text transforms for the DASH page (src/pages/dash.astro): the "parseltongue"
//          family of scripts, lookalikes and invisible text that change how a string looks or
//          tokenizes without changing what it says. Groups:
//            glyphs   - Egyptian hieroglyphs, Elder Futhark runes, upside down, small caps,
//                       fullwidth, circled, and the Unicode math "fonts" (bold, script, fraktur,
//                       double-struck, monospace)
//            stealth  - Cyrillic/Greek homoglyphs, zero-width invisible ink, Unicode tag smuggling,
//                       x-ray inspector (spells out invisible / combining / foreign characters)
//            ciphers  - atbash, rot47
//            text ops - random typos, typoglycemia scramble, sarcasm case, reverse words
//            encoders - \u unicode escapes
//            wrappers - pseudo-Python (word list + join), payload split (string fragments + concat)
//          Every function is pure (no DOM, no network, no imports) so the node test suite can
//          transpile and load this file directly (tests/dash-glyphs.test.mjs). dash.astro appends
//          GLYPH_TRANSFORMS to its own registry; entries use the same shape as the page's.
//          Typos and scramble are random-looking but seeded per word, so output stays stable while
//          the user types instead of reshuffling every earlier word on each keystroke.
//          SHARED FILE: the master copy is VoynichLabs/voynich-website src/lib/; markbarney.net
//          (82deutschmark/MarkSite) keeps an identical copy in client/src/lib/dash/. Edit the master,
//          then copy it across unchanged.
// SRP/DRY check: Pass - checked dash.astro; none of these transforms existed. The style decoders
//          reuse String.prototype.normalize('NFKC') instead of hand-written reverse tables, and
//          all one-to-one alphabets share charMapTransform().

/** A transform function. `param` is the value of the transform's optional parameter box (a key,
 *  a shift, a count...), always passed as the raw string the user typed; transforms without a
 *  param ignore it. */
export type TextFn = (input: string, param?: string) => string;

/** An optional single parameter a transform asks for (cipher key, Caesar shift, rail count...).
 *  Pages show a small text box when the active transform has one, prefilled with `default`. */
export interface DashParam {
  label: string;
  default: string;
  hint?: string;
}

export interface DashTransform {
  id: string;
  label: string;
  group: string;
  enc: TextFn;
  dec: TextFn | null;
  note?: string;
  encLabel?: string;
  decLabel?: string;
  param?: DashParam;
}

// ---------------------------------------------------------------------------------------------
// shared helpers
// ---------------------------------------------------------------------------------------------

const utf8Encoder = new TextEncoder();
const utf8Decoder = new TextDecoder('utf-8', { fatal: true });

/** Build a char -> string table from code points so this source stays readable and exact. */
function fromCodePoints(table: Record<string, number>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(table).map(([plain, codePoint]) => [plain, String.fromCodePoint(codePoint)]),
  );
}

/** Invert a one-to-one table. Throws if two keys share a value (that would make decode ambiguous). */
export function invertTable(table: Record<string, string>): Record<string, string> {
  const inverted: Record<string, string> = {};
  for (const [plain, coded] of Object.entries(table)) {
    if (coded in inverted) {
      throw new Error(`table is not one-to-one: "${coded}" is used for both "${inverted[coded]}" and "${plain}"`);
    }
    inverted[coded] = plain;
  }
  return inverted;
}

/**
 * Encoder/decoder pair for a per-character substitution alphabet.
 * caseFold: look letters up in lower case (scripts that have no case, such as hieroglyphs).
 * Characters outside the table pass through untouched in both directions.
 */
function charMapTransform(table: Record<string, string>, caseFold: boolean): { enc: TextFn; dec: TextFn } {
  const reverse = invertTable(table);
  return {
    enc: (input) =>
      Array.from(input, (char) => table[caseFold ? char.toLowerCase() : char] ?? char).join(''),
    dec: (input) => Array.from(input, (char) => reverse[char] ?? char).join(''),
  };
}

/** Undo every Unicode compatibility style (math fonts, fullwidth, circled) in one step. */
const unstyle: TextFn = (input) => input.normalize('NFKC');

/** FNV-1a 32-bit string hash, used to seed the per-word random generator. */
function hashString(text: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < text.length; index++) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** mulberry32: small, fast, seedable PRNG returning floats in [0, 1). */
function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let mixed = state;
    mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}

/** Apply fn to each run of letters, giving it a PRNG seeded by the word and its position. */
function mapWordsSeeded(input: string, fn: (word: string, random: () => number) => string): string {
  let wordIndex = 0;
  return input.replace(/\p{L}+/gu, (word) => fn(word, seededRandom(hashString(`${word}:${wordIndex++}`))));
}

function matchCase(template: string, letter: string): string {
  return template === template.toUpperCase() ? letter.toUpperCase() : letter.toLowerCase();
}

// ---------------------------------------------------------------------------------------------
// glyphs: Egyptian hieroglyphs
// Uniliteral signs (Gardiner numbers in comments). Letters with no Egyptian sound get the sign
// usually used for them in transliteration charts; where two letters would share a sign, the
// second gets a genuine variant so the alphabet stays one-to-one and decodes exactly.
// Digits: 1-9 are the stroke numerals (Z15 series); 0 is nfr (F35), which Egyptian builders used
// to mark the zero reference level.
// ---------------------------------------------------------------------------------------------

const HIEROGLYPHS = fromCodePoints({
  a: 0x1313f, // G1 vulture
  b: 0x130c0, // D58 foot
  c: 0x1337f, // V13 tethering rope (tj / ch)
  d: 0x130a7, // D46 hand
  e: 0x1309d, // D36 forearm
  f: 0x13191, // I9 horned viper
  g: 0x133bc, // W11 jar stand
  h: 0x13254, // O4 reed shelter
  i: 0x131cb, // M17 flowering reed
  j: 0x13193, // I10 cobra
  k: 0x133a1, // V31 basket with handle
  l: 0x130ed, // E23 recumbent lion
  m: 0x13153, // G17 owl
  n: 0x13216, // N35 water ripple
  o: 0x1336f, // V4 lasso
  p: 0x132aa, // Q3 stool
  q: 0x1320e, // N29 sandy hill slope
  r: 0x1308b, // D21 mouth
  s: 0x132f4, // S29 folded cloth
  t: 0x133cf, // X1 bread loaf
  u: 0x133f2, // Z7 coil (hieratic form of the quail chick)
  v: 0x13192, // I9A horned viper variant
  w: 0x13171, // G43 quail chick
  x: 0x1340d, // Aa1 placenta (kh)
  y: 0x131cc, // M17A double reed
  z: 0x13283, // O34 door bolt
  '0': 0x13124, // F35 nfr
  '1': 0x133fa, '2': 0x133fb, '3': 0x133fc, '4': 0x133fd, '5': 0x133fe,
  '6': 0x133ff, '7': 0x13400, '8': 0x13401, '9': 0x13402, // Z15 - Z15H stroke numerals
});

// ---------------------------------------------------------------------------------------------
// glyphs: runes (Elder Futhark, with Anglo-Saxon / medieval runes where Futhark has no distinct
// sign). Spaces become the runic single-dot word separator.
// ---------------------------------------------------------------------------------------------

const RUNES = fromCodePoints({
  a: 0x16a8, b: 0x16d2, c: 0x16b3, d: 0x16de, e: 0x16d6, f: 0x16a0, g: 0x16b7, h: 0x16ba,
  i: 0x16c1, j: 0x16c3, k: 0x16b2, l: 0x16da, m: 0x16d7, n: 0x16be, o: 0x16df, p: 0x16c8,
  q: 0x16e9, r: 0x16b1, s: 0x16ca, t: 0x16cf, u: 0x16a2, v: 0x16a1, w: 0x16b9, x: 0x16ea,
  y: 0x16e6, z: 0x16c9, ' ': 0x16eb,
});

// ---------------------------------------------------------------------------------------------
// glyphs: upside down. Encode maps each character to its rotated twin and reverses the string,
// so it reads correctly when the screen is turned over. Decode reverses and maps back.
// ---------------------------------------------------------------------------------------------

const UPSIDE_DOWN: Record<string, string> = {
  a: 'ɐ', b: 'q', c: 'ɔ', d: 'p', e: 'ǝ', f: 'ɟ', g: 'ƃ', h: 'ɥ', i: 'ᴉ', j: 'ɾ', k: 'ʞ',
  l: 'ꞁ', m: 'ɯ', n: 'u', o: 'o', p: 'd', q: 'b', r: 'ɹ', s: 's', t: 'ʇ', u: 'n', v: 'ʌ',
  w: 'ʍ', x: 'x', y: 'ʎ', z: 'z',
  A: '∀', B: 'ꓭ', C: 'Ɔ', D: 'ꓷ', E: 'Ǝ', F: 'Ⅎ', G: '⅁', H: 'H', I: 'I', J: 'ſ', K: 'ꓘ',
  L: '˥', M: 'W', N: 'N', O: 'O', P: 'Ԁ', Q: 'Ό', R: 'ꓤ', S: 'S', T: '⊥', U: '∩', V: 'Λ',
  W: 'M', X: 'X', Y: '⅄', Z: 'Z',
  '0': '0', '1': 'Ɩ', '2': 'ᄅ', '3': 'Ɛ', '4': 'ㄣ', '5': 'ϛ', '6': '9', '7': 'ㄥ', '8': '8', '9': '6',
  '.': '˙', ',': "'", "'": ',', '?': '¿', '!': '¡', '(': ')', ')': '(', '[': ']', ']': '[',
  '{': '}', '}': '{', '<': '>', '>': '<', '&': '⅋', _: '‾', '"': '„',
};
const UPSIDE_DOWN_REVERSE = invertTable(UPSIDE_DOWN);

function upsideDownEncode(input: string): string {
  return Array.from(input, (char) => UPSIDE_DOWN[char] ?? char).reverse().join('');
}
function upsideDownDecode(input: string): string {
  return Array.from(input, (char) => UPSIDE_DOWN_REVERSE[char] ?? char).reverse().join('');
}

// ---------------------------------------------------------------------------------------------
// glyphs: small caps (case is lost; decode returns lower case). x has no small capital in
// Unicode, so it stays a plain x.
// ---------------------------------------------------------------------------------------------

const SMALL_CAPS = fromCodePoints({
  a: 0x1d00, b: 0x0299, c: 0x1d04, d: 0x1d05, e: 0x1d07, f: 0xa730, g: 0x0262, h: 0x029c,
  i: 0x026a, j: 0x1d0a, k: 0x1d0b, l: 0x029f, m: 0x1d0d, n: 0x0274, o: 0x1d0f, p: 0x1d18,
  q: 0xa7af, r: 0x0280, s: 0xa731, t: 0x1d1b, u: 0x1d1c, v: 0x1d20, w: 0x1d21, y: 0x028f,
  z: 0x1d22,
});

// ---------------------------------------------------------------------------------------------
// glyphs: Unicode styles. Math alphanumerics live in contiguous runs, except for letters that
// were already encoded in the older Letterlike Symbols block ("holes"). All of them, plus
// fullwidth and circled forms, carry compatibility decompositions, so NFKC decodes them.
// ---------------------------------------------------------------------------------------------

interface StyleSpec {
  upper: number;
  lower: number;
  digits?: number;
  holes?: Record<string, number>;
}

function styleEncoder(spec: StyleSpec): TextFn {
  return (input) =>
    Array.from(input, (char) => {
      const hole = spec.holes?.[char];
      if (hole !== undefined) return String.fromCodePoint(hole);
      const code = char.charCodeAt(0);
      if (char.length === 1 && code >= 65 && code <= 90) return String.fromCodePoint(spec.upper + code - 65);
      if (char.length === 1 && code >= 97 && code <= 122) return String.fromCodePoint(spec.lower + code - 97);
      if (spec.digits !== undefined && char.length === 1 && code >= 48 && code <= 57) {
        return String.fromCodePoint(spec.digits + code - 48);
      }
      return char;
    }).join('');
}

const MATH_BOLD: StyleSpec = { upper: 0x1d400, lower: 0x1d41a, digits: 0x1d7ce };
const MATH_SCRIPT: StyleSpec = {
  upper: 0x1d49c, lower: 0x1d4b6,
  holes: { B: 0x212c, E: 0x2130, F: 0x2131, H: 0x210b, I: 0x2110, L: 0x2112, M: 0x2133, R: 0x211b, e: 0x212f, g: 0x210a, o: 0x2134 },
};
const MATH_FRAKTUR: StyleSpec = {
  upper: 0x1d504, lower: 0x1d51e,
  holes: { C: 0x212d, H: 0x210c, I: 0x2111, R: 0x211c, Z: 0x2128 },
};
const MATH_DOUBLE_STRUCK: StyleSpec = {
  upper: 0x1d538, lower: 0x1d552, digits: 0x1d7d8,
  holes: { C: 0x2102, H: 0x210d, N: 0x2115, P: 0x2119, Q: 0x211a, R: 0x211d, Z: 0x2124 },
};
const MATH_MONOSPACE: StyleSpec = { upper: 0x1d670, lower: 0x1d68a, digits: 0x1d7f6 };
const CIRCLED: StyleSpec = {
  upper: 0x24b6, lower: 0x24d0,
  holes: { '0': 0x24ea, '1': 0x2460, '2': 0x2461, '3': 0x2462, '4': 0x2463, '5': 0x2464, '6': 0x2465, '7': 0x2466, '8': 0x2467, '9': 0x2468 },
};

/** Fullwidth forms: printable ASCII shifts into U+FF01..FF5E; space becomes the ideographic space. */
function fullwidthEncode(input: string): string {
  return Array.from(input, (char) => {
    const code = char.charCodeAt(0);
    if (char === ' ') return '　';
    if (char.length === 1 && code >= 0x21 && code <= 0x7e) return String.fromCharCode(code + 0xfee0);
    return char;
  }).join('');
}

// ---------------------------------------------------------------------------------------------
// stealth: homoglyphs. Latin letters swapped for Cyrillic / Greek letters that render the same,
// so the text looks unchanged but every swapped letter is a different code point.
// ---------------------------------------------------------------------------------------------

const HOMOGLYPHS = fromCodePoints({
  a: 0x0430, c: 0x0441, e: 0x0435, i: 0x0456, j: 0x0458, o: 0x043e, p: 0x0440, s: 0x0455,
  x: 0x0445, y: 0x0443,
  A: 0x0410, B: 0x0412, C: 0x0421, E: 0x0415, H: 0x041d, I: 0x0406, J: 0x0408, K: 0x041a,
  M: 0x041c, N: 0x039d, O: 0x041e, P: 0x0420, S: 0x0405, T: 0x0422, X: 0x0425, Y: 0x04ae,
  Z: 0x0396,
});

// ---------------------------------------------------------------------------------------------
// stealth: zero-width invisible ink. Each UTF-8 byte becomes 8 invisible characters
// (ZERO WIDTH SPACE = 0, ZERO WIDTH NON-JOINER = 1). Decode ignores any visible cover text.
// ---------------------------------------------------------------------------------------------

const ZW_ZERO = '​';
const ZW_ONE = '‌';

function zeroWidthEncode(input: string): string {
  return Array.from(utf8Encoder.encode(input), (byte) =>
    byte.toString(2).padStart(8, '0').replace(/0/g, ZW_ZERO).replace(/1/g, ZW_ONE),
  ).join('');
}
function zeroWidthDecode(input: string): string {
  const bits = Array.from(input).filter((char) => char === ZW_ZERO || char === ZW_ONE)
    .map((char) => (char === ZW_ONE ? '1' : '0')).join('');
  if (bits.length === 0) throw new Error('no hidden zero-width text found');
  if (bits.length % 8 !== 0) throw new Error('hidden text is truncated (bit count is not a multiple of 8)');
  const bytes = new Uint8Array(bits.length / 8);
  for (let index = 0; index < bytes.length; index++) bytes[index] = parseInt(bits.slice(index * 8, index * 8 + 8), 2);
  return utf8Decoder.decode(bytes);
}

// ---------------------------------------------------------------------------------------------
// stealth: Unicode tag characters ("ASCII smuggling"). Printable ASCII maps into the invisible
// U+E0020..E007E tag block; most renderers draw nothing, but the characters survive copy/paste.
// Characters outside printable ASCII are left as they are, so decode restores the input exactly.
// ---------------------------------------------------------------------------------------------

function tagsEncode(input: string): string {
  return Array.from(input, (char) => {
    const code = char.codePointAt(0) ?? 0;
    return code >= 0x20 && code <= 0x7e ? String.fromCodePoint(0xe0000 + code) : char;
  }).join('');
}
function tagsDecode(input: string): string {
  return Array.from(input, (char) => {
    const code = char.codePointAt(0) ?? 0;
    return code >= 0xe0020 && code <= 0xe007e ? String.fromCharCode(code - 0xe0000) : char;
  }).join('');
}

// ---------------------------------------------------------------------------------------------
// stealth: x-ray. An inspector rather than a cipher: printable ASCII stays as it is and every
// other character is spelled out as ⟦U+XXXX what-it-is glyph⟧, so invisible joiners, stray
// combining marks (e.g. a Thai tone mark sitting on a Latin Y) and foreign-script fragments in a
// model reply become visible. Restore turns the annotations back into the original characters.
// Browsers ship no Unicode name table, so names are given for the usual invisible suspects and
// everything else is described by script + general category via \p{...} regexes.
// ---------------------------------------------------------------------------------------------

const INVISIBLE_NAMES: Record<number, string> = {
  0x00a0: 'NO-BREAK SPACE', 0x00ad: 'SOFT HYPHEN', 0x034f: 'COMBINING GRAPHEME JOINER',
  0x061c: 'ARABIC LETTER MARK', 0x115f: 'HANGUL CHOSEONG FILLER', 0x1160: 'HANGUL JUNGSEONG FILLER',
  0x17b4: 'KHMER VOWEL INHERENT AQ', 0x17b5: 'KHMER VOWEL INHERENT AA', 0x180e: 'MONGOLIAN VOWEL SEPARATOR',
  0x200b: 'ZERO WIDTH SPACE', 0x200c: 'ZERO WIDTH NON-JOINER', 0x200d: 'ZERO WIDTH JOINER',
  0x200e: 'LEFT-TO-RIGHT MARK', 0x200f: 'RIGHT-TO-LEFT MARK', 0x202a: 'LEFT-TO-RIGHT EMBEDDING',
  0x202b: 'RIGHT-TO-LEFT EMBEDDING', 0x202c: 'POP DIRECTIONAL FORMATTING', 0x202d: 'LEFT-TO-RIGHT OVERRIDE',
  0x202e: 'RIGHT-TO-LEFT OVERRIDE', 0x202f: 'NARROW NO-BREAK SPACE', 0x2060: 'WORD JOINER',
  0x2061: 'FUNCTION APPLICATION', 0x2062: 'INVISIBLE TIMES', 0x2063: 'INVISIBLE SEPARATOR',
  0x2064: 'INVISIBLE PLUS', 0x2066: 'LEFT-TO-RIGHT ISOLATE', 0x2067: 'RIGHT-TO-LEFT ISOLATE',
  0x2068: 'FIRST STRONG ISOLATE', 0x2069: 'POP DIRECTIONAL ISOLATE', 0x3000: 'IDEOGRAPHIC SPACE',
  0x3164: 'HANGUL FILLER', 0xfeff: 'ZERO WIDTH NO-BREAK SPACE / BOM', 0xffa0: 'HALFWIDTH HANGUL FILLER',
  0xfffc: 'OBJECT REPLACEMENT CHARACTER', 0xfffd: 'REPLACEMENT CHARACTER',
};

const XRAY_SCRIPTS = [
  'Latin', 'Greek', 'Cyrillic', 'Armenian', 'Hebrew', 'Arabic', 'Syriac', 'Thaana', 'Devanagari',
  'Bengali', 'Gurmukhi', 'Gujarati', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Sinhala', 'Thai',
  'Lao', 'Tibetan', 'Myanmar', 'Khmer', 'Georgian', 'Hangul', 'Hiragana', 'Katakana', 'Han',
  'Ethiopic', 'Mongolian', 'Cherokee', 'Runic', 'Ogham', 'Braille', 'Egyptian_Hieroglyphs',
].map((script) => ({ name: script.replace(/_/g, ' '), test: new RegExp(`^\\p{Script=${script}}$`, 'u') }));

function describeChar(char: string, codePoint: number): string {
  const named = INVISIBLE_NAMES[codePoint];
  if (named) return named;
  if (codePoint >= 0xfe00 && codePoint <= 0xfe0f) return `VARIATION SELECTOR-${codePoint - 0xfe00 + 1}`;
  if (codePoint >= 0xe0100 && codePoint <= 0xe01ef) return `VARIATION SELECTOR-${codePoint - 0xe0100 + 17}`;
  if (codePoint >= 0xe0000 && codePoint <= 0xe007f) {
    const ascii = codePoint - 0xe0000;
    return ascii >= 0x20 && ascii <= 0x7e ? `TAG "${String.fromCharCode(ascii)}"` : 'TAG CONTROL';
  }
  const script = XRAY_SCRIPTS.find((entry) => entry.test.test(char))?.name;
  let kind = 'character';
  if (/\p{M}/u.test(char)) kind = 'combining mark';
  else if (/\p{Cf}/u.test(char)) kind = 'invisible format char';
  else if (/\p{Z}/u.test(char)) kind = 'space';
  else if (/\p{Cc}/u.test(char)) kind = 'control char';
  else if (/\p{Co}/u.test(char)) kind = 'private use';
  else if (/\p{Cn}/u.test(char)) kind = 'unassigned';
  else if (/\p{Extended_Pictographic}/u.test(char)) kind = 'emoji';
  else if (/\p{L}/u.test(char)) kind = 'letter';
  else if (/\p{N}/u.test(char)) kind = 'digit';
  else if (/\p{P}|\p{S}/u.test(char)) kind = 'symbol';
  return script ? `${script} ${kind}` : kind;
}

function xrayEncode(input: string): string {
  return Array.from(input, (char) => {
    const codePoint = char.codePointAt(0) ?? 0;
    if ((codePoint >= 0x20 && codePoint <= 0x7e) || char === '\n') return char;
    const hex = codePoint.toString(16).toUpperCase().padStart(4, '0');
    const description = describeChar(char, codePoint);
    // Show the glyph when it is visible; combining marks sit on a dotted circle so they do not
    // land on the bracket. Invisible, space and control characters get no glyph.
    let glyph = '';
    if (/\p{M}/u.test(char)) glyph = ` ◌${char}`;
    else if (!/[\p{Cf}\p{Z}\p{Cc}\p{Cn}]/u.test(char) && char !== '⟦' && char !== '⟧') glyph = ` ${char}`;
    return `⟦U+${hex} ${description}${glyph}⟧`;
  }).join('');
}
function xrayDecode(input: string): string {
  return input.replace(/⟦U\+([0-9A-F]{4,6})[^⟧]*⟧/g, (_match, hex) => String.fromCodePoint(parseInt(hex, 16)));
}

// ---------------------------------------------------------------------------------------------
// ciphers
// ---------------------------------------------------------------------------------------------

function atbash(input: string): string {
  return input.replace(/[a-zA-Z]/g, (char) => {
    const base = char <= 'Z' ? 65 : 97;
    return String.fromCharCode(base + 25 - (char.charCodeAt(0) - base));
  });
}

function rot47(input: string): string {
  return input.replace(/[!-~]/g, (char) => String.fromCharCode(33 + ((char.charCodeAt(0) - 33 + 47) % 94)));
}

// ---------------------------------------------------------------------------------------------
// text ops: typos, scramble, sarcasm
// ---------------------------------------------------------------------------------------------

/** QWERTY neighbours, for fat-finger substitutions. */
const QWERTY_NEIGHBOURS: Record<string, string> = {
  q: 'wa', w: 'qes', e: 'wrd', r: 'etf', t: 'ryg', y: 'tuh', u: 'yij', i: 'uok', o: 'ipl', p: 'ol',
  a: 'qsz', s: 'awdz', d: 'sefx', f: 'drgc', g: 'fthv', h: 'gyjb', j: 'hukn', k: 'jilm', l: 'kop',
  z: 'asx', x: 'zsdc', c: 'xdfv', v: 'cfgb', b: 'vghn', n: 'bhjm', m: 'njk',
};

/** Share of eligible words (3+ letters) that get exactly one typo. */
export const TYPO_RATE = 0.4;

function pick<T>(items: readonly T[], random: () => number): T {
  return items[Math.floor(random() * items.length)];
}

/** One realistic typo: a neighbouring key, two swapped letters, a dropped letter or a doubled one. */
function typoWord(word: string, random: () => number): string {
  const letters = Array.from(word);
  if (letters.length < 3 || random() >= TYPO_RATE) return word;
  // Leave the first letter alone most of the time, as real typos rarely hit it.
  const position = 1 + Math.floor(random() * (letters.length - 1));
  const kind = pick(['neighbour', 'swap', 'drop', 'double'] as const, random);
  const target = letters[position];
  switch (kind) {
    case 'neighbour': {
      const neighbours = QWERTY_NEIGHBOURS[target.toLowerCase()];
      if (!neighbours) break; // non-ASCII letter: fall through to a doubled letter below
      letters[position] = matchCase(target, pick(Array.from(neighbours), random));
      return letters.join('');
    }
    case 'swap': {
      const left = position === letters.length - 1 ? position - 1 : position;
      if (letters[left] === letters[left + 1]) break; // swapping twins changes nothing
      [letters[left], letters[left + 1]] = [letters[left + 1], letters[left]];
      return letters.join('');
    }
    case 'drop':
      letters.splice(position, 1);
      return letters.join('');
    case 'double':
      break;
  }
  letters.splice(position, 0, target);
  return letters.join('');
}

function typos(input: string): string {
  return mapWordsSeeded(input, typoWord);
}

/** Typoglycemia: shuffle the inside of each 4+ letter word, keeping its first and last letter. */
function scrambleWord(word: string, random: () => number): string {
  const letters = Array.from(word);
  if (letters.length < 4) return word;
  const middle = letters.slice(1, -1);
  if (new Set(middle).size < 2) return word; // nothing to shuffle (e.g. "toot")
  let shuffled = middle;
  for (let attempt = 0; attempt < 5; attempt++) {
    shuffled = [...middle];
    for (let index = shuffled.length - 1; index > 0; index--) {
      const swapWith = Math.floor(random() * (index + 1));
      [shuffled[index], shuffled[swapWith]] = [shuffled[swapWith], shuffled[index]];
    }
    if (shuffled.join('') !== middle.join('')) break;
  }
  return letters[0] + shuffled.join('') + letters[letters.length - 1];
}

function scramble(input: string): string {
  return mapWordsSeeded(input, scrambleWord);
}

/** aLtErNaTiNg case across letters only, so spaces and punctuation do not break the rhythm. */
function sarcasm(input: string): string {
  let upperNext = false;
  return Array.from(input, (char) => {
    if (char.toLowerCase() === char.toUpperCase()) return char;
    const out = upperNext ? char.toUpperCase() : char.toLowerCase();
    upperNext = !upperNext;
    return out;
  }).join('');
}

/** Reverse the letters of each word but keep word order. Its own inverse. */
function reverseWords(input: string): string {
  return input.replace(/\p{L}+/gu, (word) => Array.from(word).reverse().join(''));
}

// ---------------------------------------------------------------------------------------------
// encoders: unicode escapes (\uXXXX, or \u{XXXXX} above the BMP), as JS / JSON / Python write them
// ---------------------------------------------------------------------------------------------

function unicodeEscapeEncode(input: string): string {
  return Array.from(input, (char) => {
    const code = char.codePointAt(0) ?? 0;
    return code > 0xffff ? `\\u{${code.toString(16)}}` : `\\u${code.toString(16).padStart(4, '0')}`;
  }).join('');
}
function unicodeEscapeDecode(input: string): string {
  return input.replace(/\\u\{([0-9a-fA-F]{1,6})\}|\\u([0-9a-fA-F]{4})/g, (_match, braced, plain) =>
    String.fromCodePoint(parseInt(braced ?? plain, 16)),
  );
}

// ---------------------------------------------------------------------------------------------
// wrappers: dress the text up as code. Strings are written with JSON.stringify, which is also
// valid Python string syntax, and decode reads every double-quoted literal back with JSON.parse.
// ---------------------------------------------------------------------------------------------

function doubleQuotedLiterals(input: string): string[] {
  const literals = input.match(/"(?:[^"\\\n]|\\.)*"/g);
  if (!literals) throw new Error('no double-quoted strings found');
  return literals.map((literal) => JSON.parse(literal) as string);
}

/** Pseudo-Python: the words go in a list and a join rebuilds the sentence at runtime. */
function pythonEncode(input: string): string {
  const words = input.split(/\s+/).filter(Boolean);
  const listBody = words.map((word) => JSON.stringify(word)).join(', ');
  return [
    '# rebuild the request from its tokens',
    `words = [${listBody}]`,
    "request = ' '.join(words)",
    'print(request)',
  ].join('\n');
}
function pythonDecode(input: string): string {
  return doubleQuotedLiterals(input).join(' ');
}

/** Characters per fragment in payload-split output. */
export const PAYLOAD_CHUNK = 4;

/** Payload split: the text is cut into small string variables that are only joined at the end. */
function payloadSplitEncode(input: string): string {
  const chars = Array.from(input);
  const parts: string[] = [];
  for (let index = 0; index < chars.length; index += PAYLOAD_CHUNK) {
    parts.push(chars.slice(index, index + PAYLOAD_CHUNK).join(''));
  }
  if (parts.length === 0) return '';
  const names = parts.map((_part, index) => `s${index + 1}`);
  return [
    ...parts.map((part, index) => `${names[index]} = ${JSON.stringify(part)}`),
    `text = ${names.join(' + ')}`,
    'print(text)',
  ].join('\n');
}
function payloadSplitDecode(input: string): string {
  return doubleQuotedLiterals(input).join('');
}

// ---------------------------------------------------------------------------------------------
// registry (appended to the page's TRANSFORMS in dash.astro)
// ---------------------------------------------------------------------------------------------

const hieroglyphs = charMapTransform(HIEROGLYPHS, true);
const runes = charMapTransform(RUNES, true);
const smallCaps = charMapTransform(SMALL_CAPS, true);
const homoglyphs = charMapTransform(HOMOGLYPHS, false);

export const GLYPH_TRANSFORMS: DashTransform[] = [
  { id: 'hieroglyphs', label: 'hieroglyphs', group: 'glyphs', ...hieroglyphs,
    note: 'one uniliteral sign per letter, stroke numerals for digits. Case is dropped (Egyptian has none).' },
  { id: 'runes', label: 'runes', group: 'glyphs', ...runes,
    note: 'Elder Futhark, with Anglo-Saxon runes for c, q, x and y. Case is dropped.' },
  { id: 'upsidedown', label: 'upside down', group: 'glyphs', enc: upsideDownEncode, dec: upsideDownDecode,
    encLabel: 'flip', decLabel: 'unflip' },
  { id: 'smallcaps', label: 'small caps', group: 'glyphs', ...smallCaps,
    note: 'case is dropped; decode returns lower case.' },
  { id: 'fullwidth', label: 'fullwidth', group: 'glyphs', enc: fullwidthEncode, dec: unstyle },
  { id: 'circled', label: 'circled', group: 'glyphs', enc: styleEncoder(CIRCLED), dec: unstyle },
  { id: 'bold', label: 'bold', group: 'glyphs', enc: styleEncoder(MATH_BOLD), dec: unstyle },
  { id: 'script', label: 'script', group: 'glyphs', enc: styleEncoder(MATH_SCRIPT), dec: unstyle },
  { id: 'fraktur', label: 'fraktur', group: 'glyphs', enc: styleEncoder(MATH_FRAKTUR), dec: unstyle },
  { id: 'doublestruck', label: 'double-struck', group: 'glyphs', enc: styleEncoder(MATH_DOUBLE_STRUCK), dec: unstyle },
  { id: 'monospace', label: 'monospace', group: 'glyphs', enc: styleEncoder(MATH_MONOSPACE), dec: unstyle },

  { id: 'atbash', label: 'atbash', group: 'ciphers', enc: atbash, dec: null,
    note: 'atbash (a↔z, b↔y …) is its own inverse — run it again to decode.' },
  { id: 'rot47', label: 'rot47', group: 'ciphers', enc: rot47, dec: null,
    note: 'rot47 rotates every printable ASCII character and is its own inverse — run it again to decode.' },

  { id: 'homoglyphs', label: 'homoglyphs', group: 'stealth', ...homoglyphs,
    encLabel: 'disguise', decLabel: 'expose',
    note: 'looks identical, but Latin letters are swapped for Cyrillic and Greek twins.' },
  { id: 'zerowidth', label: 'zero-width', group: 'stealth', enc: zeroWidthEncode, dec: zeroWidthDecode,
    encLabel: 'hide', decLabel: 'reveal',
    note: 'output is invisible but really there (see the char count). Paste it inside any visible text; reveal ignores the cover text.' },
  { id: 'tags', label: 'tag smuggle', group: 'stealth', enc: tagsEncode, dec: tagsDecode,
    encLabel: 'hide', decLabel: 'reveal',
    note: 'printable ASCII moved into invisible Unicode tag characters. Many apps strip them; many models still read them.' },

  { id: 'xray', label: 'x-ray', group: 'stealth', enc: xrayEncode, dec: xrayDecode,
    encLabel: 'inspect', decLabel: 'restore',
    note: 'paste a suspicious reply: every invisible, combining or non-ASCII character is spelled out with its code point and script.' },

  { id: 'typos', label: 'typos', group: 'text ops', enc: typos, dec: null,
    note: 'about 2 in 5 words get one fat-finger typo (neighbouring key, swap, drop or double). Lossy.' },
  { id: 'scramble', label: 'scramble', group: 'text ops', enc: scramble, dec: null,
    note: 'typoglycemia: middle letters shuffled, first and last kept. Still readable, not reversible.' },
  { id: 'sarcasm', label: 'sarcasm', group: 'text ops', enc: sarcasm, dec: null,
    note: 'aLtErNaTiNg case. Lossy.' },
  { id: 'reversewords', label: 'reverse words', group: 'text ops', enc: reverseWords, dec: null,
    note: 'each word spelled backwards, order kept. Its own inverse — run it again to restore.' },

  { id: 'unicodeescape', label: 'unicode escape', group: 'encoders', enc: unicodeEscapeEncode, dec: unicodeEscapeDecode },

  { id: 'python', label: 'pseudo-python', group: 'wrappers', enc: pythonEncode, dec: pythonDecode,
    note: 'words become a Python list rebuilt by a join. Line breaks and extra spaces collapse to single spaces.' },
  { id: 'payloadsplit', label: 'payload split', group: 'wrappers', enc: payloadSplitEncode, dec: payloadSplitDecode,
    note: `text cut into ${PAYLOAD_CHUNK}-character string variables that are only concatenated at the end.` },
];
