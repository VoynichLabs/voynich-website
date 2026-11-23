// Author: Claude Opus 5.5
// Date: 23-Nov-2026
// PURPOSE: Classic pen-and-paper ciphers for the DASH text transformer (src/pages/dash.astro), all
//          in the 'ciphers' group. Each one is implemented from its public, published definition
//          (textbook cipher descriptions, the rot8000 range list, the US QWERTY layout):
//            caesar        - shift every A-Z letter by N (param, default 3, negative = left)
//            rot5 / rot18  - rotate digits by 5; rot18 = rot13 letters + rot5 digits (self-inverse)
//            rot8000       - rotate every printable BMP character (no controls, whitespace or
//                            surrogates) halfway round that set; self-inverse, CJK-looking output
//            vigenere      - repeating-key shift; key advances on letters only (ATTACKATDAWN/LEMON)
//            beaufort      - c = key - plain; self-inverse
//            autokey       - Vigenere whose key stream is the primer followed by the plaintext
//            gronsfeld     - Vigenere with a numeric key (each digit is a shift)
//            porta         - della Porta's 13 reciprocal tableaux selected by key letter pairs
//            trithemius    - progressive shift: 0 for the first letter, 1 for the next...
//            keyword       - monoalphabetic substitution from a keyword-mixed alphabet
//            affine        - c = a*p + b mod 26 (a must be coprime with 26)
//            multiplicative- c = a*p mod 26
//            a1z26         - letters become 1-26 joined by dashes
//            baconian      - 26-letter Bacon alphabet, 5 A/B symbols per letter
//            polybius      - 5x5 square (I/J share a cell), letters become row/column digit pairs
//            tapcode       - 5x5 prison tap code (K uses C's cell), written as dots
//            nihilist      - keyed Polybius square numbers plus repeating key numbers
//            qwerty        - every key one to the right on a US keyboard (wraps at row ends)
//            dna           - UTF-8 bytes written in base 4 as A/C/G/T, 4 bases per byte
//          Case and anything that is not A-Z pass through the letter ciphers untouched, so they
//          round-trip any Unicode text exactly. Square/group ciphers drop case and punctuation and
//          mark word gaps with " / ". Keys arrive as the raw string from the page's parameter box
//          (may be undefined or blank: the default is used). Invalid keys and undecodable input
//          throw an Error with a plain reason; the page shows it.
//          Every function is pure (no DOM, no network, no randomness, only a type import) so the
//          node test suite can transpile and load this file alone (tests/dash-ciphers-classic.test.mjs).
//          Integration: dash.astro appends CLASSIC_CIPHER_TRANSFORMS to the DASH registry, shared
//          by voynichlabs.org/dash and markbarney.net/dash.
//          SHARED FILE: the master copy is VoynichLabs/voynich-website src/lib/; markbarney.net
//          (82deutschmark/MarkSite) keeps an identical copy in client/src/lib/dash/. Edit the master,
//          then copy it across unchanged.
// SRP/DRY check: Pass - checked dash-transforms.ts and dash-glyphs.ts: only rot13, atbash and rot47
//          existed, none of these ids. All letter ciphers share mapLetters(); the Polybius family
//          (polybius, tapcode, nihilist) shares buildSquare(); the group ciphers share
//          letterWords()/decodeWords().

import type { DashTransform } from './dash-glyphs';

/** (input, raw param string) -> output; same shape as TextFn in dash-glyphs.ts. */
type TextFn = DashTransform['enc'];

// ---------------------------------------------------------------------------------------------
// shared helpers
// ---------------------------------------------------------------------------------------------

const ALPHABET_SIZE = 26;
const LETTER_J = 9;
const LETTER_I = 8;
const LETTER_K = 10;
const LETTER_C = 2;

/** Mathematical modulo: always returns 0..modulus-1, also for negative values. */
function mod(value: number, modulus: number): number {
  return ((value % modulus) + modulus) % modulus;
}

/** The param box value, or the default when it is missing or blank. */
function paramOrDefault(raw: string | undefined, fallback: string): string {
  return raw === undefined || raw.trim() === '' ? fallback : raw.trim();
}

function parseWholeNumber(text: string, name: string): number {
  const trimmed = text.trim();
  if (!/^[+-]?\d+$/.test(trimmed)) throw new Error(`${name} must be a whole number, got "${trimmed}"`);
  const value = Number(trimmed);
  if (!Number.isSafeInteger(value)) throw new Error(`${name} is too large`);
  return value;
}

/** A-Z / a-z as 0..25; every other character is dropped. */
function letterValues(text: string): number[] {
  const values: number[] = [];
  for (let index = 0; index < text.length; index++) {
    const code = text.charCodeAt(index);
    if (code >= 65 && code <= 90) values.push(code - 65);
    else if (code >= 97 && code <= 122) values.push(code - 97);
  }
  return values;
}

/** Letters of a key param as 0..25. Throws when the key has no A-Z letters at all. */
function parseLetterKey(raw: string | undefined, fallback: string, name = 'key'): number[] {
  const values = letterValues(paramOrDefault(raw, fallback));
  if (values.length === 0) throw new Error(`${name} needs at least one letter A-Z`);
  return values;
}

/**
 * Replace each A-Z / a-z letter with mapValue(letter 0..25, letter position). The result is taken
 * mod 26 and keeps the original letter's case. Non-letters (digits, punctuation, accented letters,
 * emoji) pass through and do not advance the letter position, so keys only move on letters.
 */
function mapLetters(input: string, mapValue: (value: number, letterIndex: number) => number): string {
  let letterIndex = 0;
  return input.replace(/[A-Za-z]/g, (char) => {
    const base = char <= 'Z' ? 65 : 97;
    return String.fromCharCode(base + mod(mapValue(char.charCodeAt(0) - base, letterIndex++), ALPHABET_SIZE));
  });
}

/** Text split on whitespace into words of letter values; non-letters dropped, empty words skipped. */
function letterWords(input: string): number[][] {
  return input.split(/\s+/).map(letterValues).filter((word) => word.length > 0);
}

/** Join encoded words with the " / " word marker used by all the group ciphers here. */
const WORD_GAP = ' / ';

/**
 * Decode " / "-separated words. Blank input gives blank output (the page decodes while you type);
 * input with nothing but separators is an error.
 */
function decodeWords(input: string, decodeWord: (word: string) => string): string {
  if (input.trim() === '') return '';
  const words = input.split('/').map((word) => word.trim()).filter((word) => word !== '');
  if (words.length === 0) throw new Error('nothing to decode');
  return words.map(decodeWord).join(' ');
}

const toLowerLetter = (value: number): string => String.fromCharCode(97 + value);

/** Cipher alphabet: the key's letters (first time each is seen) followed by the rest of A-Z. */
function mixedAlphabet(keyLetters: number[], allLetters: number[]): number[] {
  const seen = new Set<number>();
  const order: number[] = [];
  for (const value of [...keyLetters, ...allLetters]) {
    if (!seen.has(value)) {
      seen.add(value);
      order.push(value);
    }
  }
  return order;
}

const ALL_LETTERS = Array.from({ length: ALPHABET_SIZE }, (_, index) => index);

/** Inverse of a permutation of 0..n-1. */
function invertPermutation(permutation: number[]): number[] {
  const inverse = new Array<number>(permutation.length);
  permutation.forEach((target, source) => { inverse[target] = source; });
  return inverse;
}

// ---------------------------------------------------------------------------------------------
// 5x5 squares (polybius, tap code, nihilist)
// ---------------------------------------------------------------------------------------------

interface Square {
  /** letter 0..25 -> row * 10 + column, both 1..5 (the merged letter shares its partner's cell) */
  coords: number[];
  /** row and column 1..5 -> letter 0..25 */
  letterAt: (row: number, column: number) => number;
}

/**
 * A 5x5 square: keyword letters first, then the rest of the alphabet, with `dropped` folded into
 * `mergedInto` (J into I for Polybius, K into C for tap code).
 */
function buildSquare(keyword: number[], dropped: number, mergedInto: number): Square {
  const fold = (value: number): number => (value === dropped ? mergedInto : value);
  const order = mixedAlphabet(keyword.map(fold), ALL_LETTERS.filter((value) => value !== dropped));
  const coords = new Array<number>(ALPHABET_SIZE);
  order.forEach((value, cell) => { coords[value] = (Math.floor(cell / 5) + 1) * 10 + (cell % 5) + 1; });
  coords[dropped] = coords[mergedInto];
  return { coords, letterAt: (row, column) => order[(row - 1) * 5 + (column - 1)] };
}

const PLAIN_POLYBIUS = buildSquare([], LETTER_J, LETTER_I);
const TAP_SQUARE = buildSquare([], LETTER_K, LETTER_C);

/** "row column" digit pair (11..55) back to a letter, or throw. */
function squareLetter(square: Square, pair: number, source: string): string {
  const row = Math.floor(pair / 10);
  const column = pair % 10;
  if (pair < 11 || pair > 55 || column < 1 || column > 5) {
    throw new Error(`"${source}" is not a square cell (row and column must each be 1-5)`);
  }
  return toLowerLetter(square.letterAt(row, column));
}

// ---------------------------------------------------------------------------------------------
// shift ciphers: caesar, rot5, rot18, rot8000
// ---------------------------------------------------------------------------------------------

// Reduced mod 26 up front: a huge shift such as 9007199254740991 would otherwise lose precision
// once a letter value is added to it, and encode/decode would stop being exact inverses.
const caesarShift = (raw?: string): number => mod(parseWholeNumber(paramOrDefault(raw, '3'), 'shift'), ALPHABET_SIZE);

const caesarEncode: TextFn = (input, raw) => {
  const shift = caesarShift(raw);
  return mapLetters(input, (value) => value + shift);
};

const caesarDecode: TextFn = (input, raw) => {
  const shift = caesarShift(raw);
  return mapLetters(input, (value) => value - shift);
};

function rot5(input: string): string {
  return input.replace(/[0-9]/g, (digit) => String.fromCharCode(48 + ((digit.charCodeAt(0) - 48 + 5) % 10)));
}

function rot18(input: string): string {
  return rot5(mapLetters(input, (value) => value + 13));
}

// rot8000: the BMP code points that are not control characters, whitespace or surrogates, listed
// in order and rotated by half their count (31702 of 63404), so applying it twice restores the text.
const ROT8000_RANGES: Array<[number, number]> = [
  [0x0021, 0x007e], // printable ASCII without space
  [0x00a1, 0x167f], // skips C1 controls and U+00A0 no-break space
  [0x1681, 0x1fff], // skips U+1680 ogham space mark
  [0x200b, 0x2027], // skips U+2000-U+200A spaces
  [0x202a, 0x202e], // skips U+2028 line / U+2029 paragraph separators
  [0x2030, 0x205e], // skips U+202F narrow no-break space
  [0x2060, 0x2fff], // skips U+205F medium mathematical space
  [0x3001, 0xd7ff], // skips U+3000 ideographic space; stops before the surrogates
  [0xe000, 0xffff], // private use area to the end of the BMP
];

let rot8000Table: Uint16Array | null = null;

function getRot8000Table(): Uint16Array {
  if (rot8000Table) return rot8000Table;
  const valid: number[] = [];
  for (const [first, last] of ROT8000_RANGES) for (let code = first; code <= last; code++) valid.push(code);
  const half = valid.length / 2;
  const table = new Uint16Array(0x10000);
  for (let code = 0; code < table.length; code++) table[code] = code; // everything else maps to itself
  valid.forEach((code, index) => { table[code] = valid[(index + half) % valid.length]; });
  rot8000Table = table;
  return table;
}

function rot8000(input: string): string {
  const table = getRot8000Table();
  const units = new Uint16Array(input.length);
  // Works on UTF-16 code units: surrogates map to themselves, so astral characters (emoji) survive.
  for (let index = 0; index < input.length; index++) units[index] = table[input.charCodeAt(index)];
  let output = '';
  const chunk = 8192; // keep fromCharCode's argument count well under engine limits
  for (let start = 0; start < units.length; start += chunk) {
    output += String.fromCharCode(...units.subarray(start, start + chunk));
  }
  return output;
}

// ---------------------------------------------------------------------------------------------
// polyalphabetic: vigenere, beaufort, autokey, gronsfeld, porta, trithemius
// ---------------------------------------------------------------------------------------------

function vigenereWith(direction: 1 | -1): TextFn {
  return (input, raw) => {
    const key = parseLetterKey(raw, 'LEMON');
    return mapLetters(input, (value, index) => value + direction * key[index % key.length]);
  };
}

const beaufort: TextFn = (input, raw) => {
  const key = parseLetterKey(raw, 'FORTIFICATION');
  return mapLetters(input, (value, index) => key[index % key.length] - value);
};

/** Autokey key stream: the primer, then the plaintext letters themselves. */
function autokeyWith(direction: 1 | -1): TextFn {
  return (input, raw) => {
    const primer = parseLetterKey(raw, 'QUEENLY');
    const plain: number[] = [];
    return mapLetters(input, (value, index) => {
      const keyValue = index < primer.length ? primer[index] : plain[index - primer.length];
      const plainValue = direction === 1 ? value : mod(value - keyValue, ALPHABET_SIZE);
      plain.push(plainValue);
      return direction === 1 ? value + keyValue : plainValue;
    });
  };
}

function gronsfeldKey(raw: string | undefined): number[] {
  const text = paramOrDefault(raw, '31415').replace(/\s+/g, '');
  if (!/^\d+$/.test(text)) throw new Error(`gronsfeld key must be digits 0-9, got "${text}"`);
  return Array.from(text, Number);
}

function gronsfeldWith(direction: 1 | -1): TextFn {
  return (input, raw) => {
    const key = gronsfeldKey(raw);
    return mapLetters(input, (value, index) => value + direction * key[index % key.length]);
  };
}

/** Porta: key letters pair up (AB, CD ... YZ) to pick one of 13 tableaux that swap A-M with N-Z. */
const porta: TextFn = (input, raw) => {
  const key = parseLetterKey(raw, 'FORTIFICATION');
  return mapLetters(input, (value, index) => {
    const tableau = Math.floor(key[index % key.length] / 2);
    return value < 13 ? mod(value + tableau, 13) + 13 : mod(value - 13 - tableau, 13);
  });
};

const trithemiusEncode: TextFn = (input) => mapLetters(input, (value, index) => value + index);
const trithemiusDecode: TextFn = (input) => mapLetters(input, (value, index) => value - index);

// ---------------------------------------------------------------------------------------------
// monoalphabetic: keyword, affine, multiplicative
// ---------------------------------------------------------------------------------------------

const keywordAlphabet = (raw?: string): number[] => mixedAlphabet(parseLetterKey(raw, 'KRYPTOS'), ALL_LETTERS);

const keywordEncode: TextFn = (input, raw) => {
  const alphabet = keywordAlphabet(raw);
  return mapLetters(input, (value) => alphabet[value]);
};

const keywordDecode: TextFn = (input, raw) => {
  const inverse = invertPermutation(keywordAlphabet(raw));
  return mapLetters(input, (value) => inverse[value]);
};

/** The multiplier's inverse mod 26; throws when a shares a factor with 26 (not decodable). */
function inverseMod26(multiplier: number): number {
  const reduced = mod(multiplier, ALPHABET_SIZE);
  for (let candidate = 1; candidate < ALPHABET_SIZE; candidate++) {
    if ((reduced * candidate) % ALPHABET_SIZE === 1) return candidate;
  }
  throw new Error(`a = ${multiplier} shares a factor with 26, so the cipher could not be undone. `
    + 'Use 1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23 or 25');
}

function parseAffine(raw: string | undefined): { multiplier: number; inverse: number; offset: number } {
  const parts = paramOrDefault(raw, '5,8').split(/[\s,;]+/).filter((part) => part !== '');
  if (parts.length !== 2) throw new Error('affine key is two numbers "a,b", for example 5,8');
  const multiplier = parseWholeNumber(parts[0], 'a');
  const offset = parseWholeNumber(parts[1], 'b');
  return { multiplier, inverse: inverseMod26(multiplier), offset };
}

const affineEncode: TextFn = (input, raw) => {
  const { multiplier, offset } = parseAffine(raw);
  return mapLetters(input, (value) => mod(multiplier, ALPHABET_SIZE) * value + mod(offset, ALPHABET_SIZE));
};

const affineDecode: TextFn = (input, raw) => {
  const { inverse, offset } = parseAffine(raw);
  return mapLetters(input, (value) => inverse * (value - mod(offset, ALPHABET_SIZE)));
};

function parseMultiplier(raw: string | undefined): { multiplier: number; inverse: number } {
  const multiplier = parseWholeNumber(paramOrDefault(raw, '7'), 'a');
  return { multiplier, inverse: inverseMod26(multiplier) };
}

const multiplicativeEncode: TextFn = (input, raw) => {
  const { multiplier } = parseMultiplier(raw);
  return mapLetters(input, (value) => mod(multiplier, ALPHABET_SIZE) * value);
};

const multiplicativeDecode: TextFn = (input, raw) => {
  const { inverse } = parseMultiplier(raw);
  return mapLetters(input, (value) => inverse * value);
};

// ---------------------------------------------------------------------------------------------
// number and symbol codes: a1z26, baconian, polybius, tap code, nihilist
// ---------------------------------------------------------------------------------------------

function a1z26Encode(input: string): string {
  return input.replace(/[A-Za-z]+/g, (word) => letterValues(word).map((value) => value + 1).join('-'));
}

function a1z26Decode(input: string): string {
  if (input.trim() === '') return '';
  if (!/\d/.test(input)) throw new Error('no numbers found');
  return input.replace(/\d+(?:-\d+)*/g, (run) => run.split('-').map((token) => {
    const number = Number(token);
    if (number < 1 || number > ALPHABET_SIZE) throw new Error(`${token} is not a letter number (1-26)`);
    return toLowerLetter(number - 1);
  }).join(''));
}

function baconianEncode(input: string): string {
  return letterWords(input).map((word) => word.map((value) =>
    value.toString(2).padStart(5, '0').replace(/0/g, 'A').replace(/1/g, 'B')).join(' ')).join(WORD_GAP);
}

function baconianDecode(input: string): string {
  return decodeWords(input, (word) => {
    const symbols = word.replace(/\s+/g, '').toUpperCase();
    if (!/^[AB]+$/.test(symbols)) throw new Error('baconian text may only contain A, B, spaces and /');
    if (symbols.length % 5 !== 0) throw new Error(`baconian letters are 5 symbols each; "${word}" has ${symbols.length}`);
    let letters = '';
    for (let start = 0; start < symbols.length; start += 5) {
      const group = symbols.slice(start, start + 5);
      const value = parseInt(group.replace(/A/g, '0').replace(/B/g, '1'), 2);
      if (value >= ALPHABET_SIZE) throw new Error(`${group} is not a letter in the 26-letter Bacon alphabet`);
      letters += toLowerLetter(value);
    }
    return letters;
  });
}

function polybiusEncode(input: string): string {
  return letterWords(input).map((word) => word.map((value) => PLAIN_POLYBIUS.coords[value]).join(' ')).join(WORD_GAP);
}

function polybiusDecode(input: string): string {
  return decodeWords(input, (word) => {
    const digits = word.replace(/\s+/g, '');
    if (!/^\d+$/.test(digits)) throw new Error('polybius text may only contain digits 1-5, spaces and /');
    if (digits.length % 2 !== 0) throw new Error(`polybius uses digit pairs; "${word}" has an odd number of digits`);
    let letters = '';
    for (let start = 0; start < digits.length; start += 2) {
      const pair = digits.slice(start, start + 2);
      letters += squareLetter(PLAIN_POLYBIUS, Number(pair), pair);
    }
    return letters;
  });
}

function tapCodeEncode(input: string): string {
  return letterWords(input).map((word) => word.map((value) => {
    const cell = TAP_SQUARE.coords[value];
    return `${'.'.repeat(Math.floor(cell / 10))} ${'.'.repeat(cell % 10)}`;
  }).join('  ')).join(WORD_GAP);
}

function tapCodeDecode(input: string): string {
  return decodeWords(input, (word) => {
    const taps = word.split(/\s+/);
    for (const tap of taps) {
      if (!/^\.{1,5}$/.test(tap)) throw new Error(`"${tap}" is not 1-5 taps (dots)`);
    }
    if (taps.length % 2 !== 0) throw new Error('tap code needs pairs of tap groups (row, then column)');
    let letters = '';
    for (let index = 0; index < taps.length; index += 2) {
      letters += toLowerLetter(TAP_SQUARE.letterAt(taps[index].length, taps[index + 1].length));
    }
    return letters;
  });
}

/**
 * Nihilist param: "square keyword, key" or just "key" (then the plain A-Z square is used). The two
 * words may be separated by a comma, a semicolon or plain spaces ("ZEBRAS RUSSIAN" works too).
 */
function parseNihilist(raw: string | undefined): { square: Square; keyNumbers: number[] } {
  const parts = paramOrDefault(raw, 'ZEBRAS, RUSSIAN').split(/[\s,;]+/).filter((part) => part !== '');
  if (parts.length > 2) throw new Error('nihilist key is "square keyword, key" or just "key"');
  const squareWord = parts.length === 2 ? letterValues(parts[0]) : [];
  if (parts.length === 2 && squareWord.length === 0) {
    throw new Error('nihilist square keyword needs at least one letter A-Z');
  }
  const keyWord = letterValues(parts[parts.length - 1]);
  if (keyWord.length === 0) throw new Error('nihilist key needs at least one letter A-Z');
  const square = buildSquare(squareWord, LETTER_J, LETTER_I);
  return { square, keyNumbers: keyWord.map((value) => square.coords[value]) };
}

const nihilistEncode: TextFn = (input, raw) => {
  const { square, keyNumbers } = parseNihilist(raw);
  let letterIndex = 0;
  return letterWords(input).map((word) => word.map((value) =>
    square.coords[value] + keyNumbers[letterIndex++ % keyNumbers.length]).join(' ')).join(WORD_GAP);
};

const nihilistDecode: TextFn = (input, raw) => {
  const { square, keyNumbers } = parseNihilist(raw);
  let letterIndex = 0;
  return decodeWords(input, (word) => word.split(/\s+/).map((token) => {
    if (!/^\d+$/.test(token)) throw new Error(`"${token}" is not a number`);
    const pair = Number(token) - keyNumbers[letterIndex++ % keyNumbers.length];
    return squareLetter(square, pair, token);
  }).join(''));
};

// ---------------------------------------------------------------------------------------------
// keyboard and bytes: qwerty, dna
// ---------------------------------------------------------------------------------------------

/** US QWERTY rows, unshifted then shifted. Each key moves one place along its row, wrapping. */
const QWERTY_ROWS = [
  '`1234567890-=', 'qwertyuiop[]\\', "asdfghjkl;'", 'zxcvbnm,./',
  '~!@#$%^&*()_+', 'QWERTYUIOP{}|', 'ASDFGHJKL:"', 'ZXCVBNM<>?',
];

const QWERTY_RIGHT = new Map<string, string>();
const QWERTY_LEFT = new Map<string, string>();
for (const row of QWERTY_ROWS) {
  for (let index = 0; index < row.length; index++) {
    const next = row[(index + 1) % row.length];
    QWERTY_RIGHT.set(row[index], next);
    QWERTY_LEFT.set(next, row[index]);
  }
}

const qwertyEncode: TextFn = (input) => input.replace(/[\s\S]/g, (char) => QWERTY_RIGHT.get(char) ?? char);
const qwertyDecode: TextFn = (input) => input.replace(/[\s\S]/g, (char) => QWERTY_LEFT.get(char) ?? char);

const NUCLEOTIDES = 'ACGT'; // A=00 C=01 G=10 T=11, most significant pair first
const utf8Encoder = new TextEncoder();
// ignoreBOM: keep a leading U+FEFF instead of silently stripping it, so DNA stays exact.
const utf8Decoder = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true });

function dnaEncode(input: string): string {
  const bytes = utf8Encoder.encode(input);
  const bases = new Array<string>(bytes.length);
  for (let index = 0; index < bytes.length; index++) {
    const byte = bytes[index];
    bases[index] = NUCLEOTIDES[byte >> 6] + NUCLEOTIDES[(byte >> 4) & 3] + NUCLEOTIDES[(byte >> 2) & 3] + NUCLEOTIDES[byte & 3];
  }
  return bases.join('');
}

function dnaDecode(input: string): string {
  const stripped = input.replace(/\s+/g, '');
  if (stripped === '') return '';
  // look for strays before upper-casing, so the error names the character the user typed (ß, not S)
  const stray = stripped.match(/[^ACGTacgt]/u);
  if (stray) throw new Error(`"${stray[0]}" is not a DNA base (A, C, G or T)`);
  const bases = stripped.toUpperCase();
  if (bases.length % 4 !== 0) throw new Error(`DNA is 4 bases per byte; got ${bases.length} bases`);
  const bytes = new Uint8Array(bases.length / 4);
  for (let index = 0; index < bytes.length; index++) {
    let byte = 0;
    for (let offset = 0; offset < 4; offset++) byte = (byte << 2) | NUCLEOTIDES.indexOf(bases[index * 4 + offset]);
    bytes[index] = byte;
  }
  try {
    return utf8Decoder.decode(bytes);
  } catch {
    throw new Error('the decoded bytes are not valid UTF-8 text');
  }
}

// ---------------------------------------------------------------------------------------------
// registry (appended to the DASH registry in dash.astro)
// ---------------------------------------------------------------------------------------------

const vigenereParam = { label: 'key', default: 'LEMON', hint: 'letters only; other characters in the key are ignored' };

export const CLASSIC_CIPHER_TRANSFORMS: DashTransform[] = [
  { id: 'caesar', label: 'caesar', group: 'ciphers', enc: caesarEncode, dec: caesarDecode,
    param: { label: 'shift', default: '3', hint: 'whole number; negative shifts left' },
    note: 'shifts each letter by the key. Case and non-letters are kept.' },
  { id: 'rot5', label: 'rot5', group: 'ciphers', enc: rot5, dec: null,
    note: 'rotates digits 0-9 by 5. Its own inverse — run it again to decode.' },
  { id: 'rot18', label: 'rot18', group: 'ciphers', enc: rot18, dec: null,
    note: 'rot13 on letters plus rot5 on digits. Its own inverse — run it again to decode.' },
  { id: 'rot8000', label: 'rot8000', group: 'ciphers', enc: rot8000, dec: null,
    note: 'rotates every visible character halfway round Unicode\'s first plane, so text turns into CJK-looking glyphs. Spaces stay. Its own inverse.' },
  { id: 'vigenere', label: 'vigenère', group: 'ciphers', enc: vigenereWith(1), dec: vigenereWith(-1),
    param: vigenereParam,
    note: 'each letter shifted by the next key letter (A = 0). The key only advances on letters; case and the rest are kept.' },
  { id: 'beaufort', label: 'beaufort', group: 'ciphers', enc: beaufort, dec: null,
    param: { label: 'key', default: 'FORTIFICATION', hint: 'letters only' },
    note: 'letter = key minus letter. Its own inverse — run it again with the same key to decode.' },
  { id: 'autokey', label: 'autokey', group: 'ciphers', enc: autokeyWith(1), dec: autokeyWith(-1),
    param: { label: 'primer', default: 'QUEENLY', hint: 'letters only; the message itself continues the key' },
    note: 'Vigenère whose key is the primer followed by the message itself.' },
  { id: 'gronsfeld', label: 'gronsfeld', group: 'ciphers', enc: gronsfeldWith(1), dec: gronsfeldWith(-1),
    param: { label: 'key', default: '31415', hint: 'digits 0-9; each digit is a shift' },
    note: 'Vigenère with a numeric key: each digit shifts one letter.' },
  { id: 'porta', label: 'porta', group: 'ciphers', enc: porta, dec: null,
    param: { label: 'key', default: 'FORTIFICATION', hint: 'letters only; A/B, C/D … pick the same table' },
    note: 'della Porta: each key letter pair swaps A-M with N-Z its own way. Its own inverse.' },
  { id: 'trithemius', label: 'trithemius', group: 'ciphers', enc: trithemiusEncode, dec: trithemiusDecode,
    note: 'progressive shift: 1st letter +0, 2nd +1, 3rd +2 … Case and non-letters are kept.' },
  { id: 'keyword', label: 'keyword', group: 'ciphers', enc: keywordEncode, dec: keywordDecode,
    param: { label: 'keyword', default: 'KRYPTOS', hint: 'letters only; repeats are skipped' },
    note: 'substitution alphabet = keyword letters, then the rest of A-Z.' },
  { id: 'affine', label: 'affine', group: 'ciphers', enc: affineEncode, dec: affineDecode,
    param: { label: 'a,b', default: '5,8', hint: 'a must be odd and not 13: 1 3 5 7 9 11 15 17 19 21 23 25' },
    note: 'letter → a × letter + b (mod 26), A = 0.' },
  { id: 'multiplicative', label: 'multiplicative', group: 'ciphers', enc: multiplicativeEncode, dec: multiplicativeDecode,
    param: { label: 'a', default: '7', hint: 'odd and not 13: 1 3 5 7 9 11 15 17 19 21 23 25' },
    note: 'letter → a × letter (mod 26), A = 0, so A never changes.' },
  { id: 'a1z26', label: 'A1Z26', group: 'ciphers', enc: a1z26Encode, dec: a1z26Decode,
    note: 'a=1 … z=26, letters joined by dashes. Decode gives lower case; digits in the text read back as letters and hyphens between letters vanish.' },
  { id: 'baconian', label: 'baconian', group: 'ciphers', enc: baconianEncode, dec: baconianDecode,
    note: '26-letter Bacon alphabet: 5 A/B symbols per letter, words split by /. Case, digits and punctuation are dropped.' },
  { id: 'polybius', label: 'polybius', group: 'ciphers', enc: polybiusEncode, dec: polybiusDecode,
    note: '5×5 square, row then column (B = 12). I and J share a cell; case, digits and punctuation are dropped.' },
  { id: 'tapcode', label: 'tap code', group: 'ciphers', enc: tapCodeEncode, dec: tapCodeDecode,
    note: 'prison tap code: row taps, then column taps. K uses C\'s cell; case, digits and punctuation are dropped.' },
  { id: 'nihilist', label: 'nihilist', group: 'ciphers', enc: nihilistEncode, dec: nihilistDecode,
    param: { label: 'square, key', default: 'ZEBRAS, RUSSIAN', hint: 'square keyword, then key word (comma or space); one word = key with a plain square' },
    note: 'keyed Polybius numbers plus the key word\'s numbers. J = I; case, digits and punctuation are dropped.' },
  { id: 'qwerty', label: 'qwerty shift', group: 'ciphers', enc: qwertyEncode, dec: qwertyDecode,
    note: 'every key one to the right on a US keyboard (row ends wrap round). Decode shifts left.' },
  { id: 'dna', label: 'DNA', group: 'ciphers', enc: dnaEncode, dec: dnaDecode,
    note: 'UTF-8 bytes in base 4: A=00 C=01 G=10 T=11, 4 bases per byte. Exact for any text.' },
];
