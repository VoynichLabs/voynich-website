// Author: Claude Opus 5.5
// Date: 23-Nov-2026
// PURPOSE: Polygraphic and transposition ciphers for the DASH text transformer, all in the
//          'ciphers' group and all keyed through the page's single parameter box:
//            playfair            - 5x5 keyed square (J -> I), digraph rules as published by
//                                  Wheatstone/Playfair; doubled letters split with X (Q for XX)
//            twosquare           - vertical two-square (two keyed 5x5 squares, rectangle rule,
//                                  same column passes through); its own inverse
//            foursquare          - Delastelle's four-square (plain squares upper left / lower right,
//                                  keyed squares upper right / lower left)
//            bifid               - Delastelle's bifid on a keyed 5x5 square, optional period
//            trifid              - Delastelle's trifid on a keyed 27-symbol 3x3x3 cube ('+' is the
//                                  27th symbol), period 5 by default
//            adfgx / adfgvx      - German WWI field ciphers: keyed Polybius square labelled
//                                  ADFGX (5x5, J -> I) or ADFGVX (6x6, digits placed after A-J as
//                                  in the historical keyword method), then an irregular columnar
//                                  transposition
//            hill                - Hill cipher with a 2x2 or 3x3 key matrix mod 26 (numbers or
//                                  letters A=0); keys that are not invertible mod 26 are rejected
//            railfence, columnar, doubletransposition, scytale, route, amsco
//                                - transpositions that move every character (spaces, punctuation,
//                                  emoji) and never pad, so they round-trip exactly
//            fractionatedmorse   - ACA fractionated Morse: Morse with x between letters and xx
//                                  between words, read in trigraphs through a keyed alphabet
//          Standards followed: Wikipedia's published worked examples for playfair, two-square,
//          four-square, bifid, trifid, ADFGX, ADFGVX, Hill, rail fence, scytale, columnar and
//          double transposition; the American Cryptogram Association guidelines for AMSCO and
//          fractionated Morse; ITU-R M.1677 for Morse letters and digits. Every function is pure
//          (no DOM, no network, no randomness) so output is stable while the user types.
//          Integration: GRID_CIPHER_TRANSFORMS is appended to the DASH registry
//          (src/lib/dash-registry.ts), shared by voynichlabs.org/dash and markbarney.net/dash.
//          The node test suite (tests/dash-ciphers-grid.test.mjs) transpiles this file on its own,
//          so the only import is type-only.
//          SHARED FILE: the master copy is VoynichLabs/voynich-website src/lib/; markbarney.net
//          (82deutschmark/MarkSite) keeps an identical copy in client/src/lib/dash/. Edit the master,
//          then copy it across unchanged.
// SRP/DRY check: Pass - checked dash-transforms.ts, dash-glyphs.ts and dash-ciphers-classic.ts;
//          none of these ciphers existed. All square ciphers share one keyed-grid builder and one
//          rectangle rule, bifid/trifid share one fractionation routine, and every transposition
//          is a reading order fed to one shared permute/unpermute pair. The Morse table is
//          repeated here (not imported) because the test loader transpiles one file at a time.

import type { DashTransform } from './dash-glyphs';

type TextFn = DashTransform['enc'];

// ---------------------------------------------------------------------------------------------
// shared helpers: alphabets, normalisation, parameter parsing
// ---------------------------------------------------------------------------------------------

const ALPHABET_26 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
/** The usual 25-letter square alphabet: J is merged into I. */
const ALPHABET_NO_J = 'ABCDEFGHIKLMNOPQRSTUVWXYZ';
const ALPHABET_TRIFID = `${ALPHABET_26}+`;
const DIGITS = '0123456789';
const WHITESPACE = /\s/;

/** Upper case with accents split off (é -> E + combining mark), so accented letters keep their base. */
function upperFolded(input: string): string {
  return input.normalize('NFD').toUpperCase();
}

/** Keep only the characters of `alphabet` after upper-casing and stripping accents; drop the rest. */
function keepSymbols(input: string, alphabet: string): string {
  let kept = '';
  for (const char of upperFolded(input)) if (alphabet.includes(char)) kept += char;
  return kept;
}

/** Letters A-Z with J folded into I, the input alphabet of every 5x5 square cipher here. */
function squareLetters(input: string): string {
  return keepSymbols(input, ALPHABET_26).replace(/J/g, 'I');
}

/**
 * Read ciphertext for a decoder: whitespace is ignored (so grouped text pastes fine), lower case is
 * accepted, anything outside the cipher's alphabet is an error the page shows to the user.
 */
function readCiphertext(input: string, alphabet: string, cipherName: string, allowed: string): string {
  let symbols = '';
  // Only ASCII a-z is upper-cased, one character at a time: toUpperCase() on anything else would
  // silently turn 'ß' into 'SS', 'ﬀ' into 'FF' and dotless 'ı' into 'I'.
  for (const original of input) {
    if (WHITESPACE.test(original)) continue;
    const char = original >= 'a' && original <= 'z' ? original.toUpperCase() : original;
    if (!alphabet.includes(char)) {
      throw new Error(`${cipherName} ciphertext can only contain ${allowed}; found "${original}"`);
    }
    symbols += char;
  }
  return symbols;
}

/** The trimmed parameter, or the default when the box is empty or missing. */
function paramText(raw: string | undefined, fallback: string): string {
  const trimmed = (raw ?? '').trim();
  return trimmed === '' ? fallback : trimmed;
}

/** Split "first,second" (two keys). Both halves must be present. */
function splitKeyPair(raw: string | undefined, fallback: string): [string, string] {
  const text = paramText(raw, fallback);
  const comma = text.indexOf(',');
  const first = comma < 0 ? '' : text.slice(0, comma).trim();
  const second = comma < 0 ? '' : text.slice(comma + 1).trim();
  if (first === '' || second === '') {
    throw new Error(`this cipher needs two keys separated by a comma, like "${fallback}"`);
  }
  return [first, second];
}

/** A whole number >= 1 (rails, columns, diameter); blank falls back to the default. */
function parseCount(raw: string | undefined, fallback: number, what: string): number {
  const text = (raw ?? '').trim();
  if (text === '') return fallback;
  if (!/^\d+$/.test(text)) throw new Error(`${what} must be a whole number, got "${text}"`);
  const value = Number(text);
  if (value < 1) throw new Error(`${what} must be at least 1`);
  return Math.min(value, Number.MAX_SAFE_INTEGER);
}

/** "KEY" or "KEY,period" for bifid and trifid. Period 0 means the whole message is one block. */
function parseKeyAndPeriod(raw: string | undefined, fallback: string): { key: string; period: number | null } {
  const text = paramText(raw, fallback);
  const comma = text.lastIndexOf(',');
  if (comma < 0) return { key: text, period: null };
  const periodText = text.slice(comma + 1).trim();
  if (!/^\d+$/.test(periodText)) {
    throw new Error(`the period after the comma must be a whole number, got "${periodText}"`);
  }
  return { key: text.slice(0, comma), period: Math.min(Number(periodText), Number.MAX_SAFE_INTEGER) };
}

function requireKey(normalisedKey: string, what: string): string {
  if (normalisedKey === '') throw new Error(`${what} needs at least one letter`);
  return normalisedKey;
}

// ---------------------------------------------------------------------------------------------
// keyed grids (Polybius squares, the trifid cube, keyword alphabets)
// ---------------------------------------------------------------------------------------------

interface KeyedGrid {
  symbols: string;
  width: number;
  position: Map<string, number>;
}

/** Keyword alphabet: the key's symbols in order without repeats, then the rest of `alphabet`. */
function keywordOrder(key: string, alphabet: string): string {
  let ordered = '';
  for (const char of key + alphabet) {
    if (alphabet.includes(char) && !ordered.includes(char)) ordered += char;
  }
  return ordered;
}

function gridFromSymbols(symbols: string, width: number): KeyedGrid {
  const position = new Map<string, number>();
  for (let index = 0; index < symbols.length; index++) position.set(symbols[index], index);
  return { symbols, width, position };
}

/** Keyed square / cube built row by row from a key already normalised to the alphabet. */
function keyedGrid(key: string, alphabet: string, width: number): KeyedGrid {
  return gridFromSymbols(keywordOrder(key, alphabet), width);
}

function cellOf(grid: KeyedGrid, char: string): number {
  const cell = grid.position.get(char);
  if (cell === undefined) throw new Error(`"${char}" is not in the cipher square`);
  return cell;
}

/**
 * The rectangle rule shared by two-square and four-square: the first letter is found in
 * `firstLookup`, the second in `secondLookup`; the output letters sit at the other two corners,
 * taken from `firstOut` (row of the first letter) and `secondOut` (row of the second letter).
 * When both letters share a column this returns them unchanged, which is two-square's
 * transparency rule.
 */
function rectanglePairs(
  text: string, firstLookup: KeyedGrid, secondLookup: KeyedGrid, firstOut: KeyedGrid, secondOut: KeyedGrid,
): string {
  const width = firstLookup.width;
  let output = '';
  for (let index = 0; index < text.length; index += 2) {
    const first = cellOf(firstLookup, text[index]);
    const second = cellOf(secondLookup, text[index + 1]);
    const firstRow = Math.floor(first / width);
    const secondRow = Math.floor(second / width);
    output += firstOut.symbols[firstRow * width + (second % width)];
    output += secondOut.symbols[secondRow * width + (first % width)];
  }
  return output;
}

function padToEven(letters: string): string {
  return letters.length % 2 === 0 ? letters : `${letters}X`;
}

// ---------------------------------------------------------------------------------------------
// playfair
// ---------------------------------------------------------------------------------------------

const PLAYFAIR_DEFAULT = 'PLAYFAIR EXAMPLE';

function playfairGrid(param: string | undefined): KeyedGrid {
  return keyedGrid(requireKey(squareLetters(paramText(param, PLAYFAIR_DEFAULT)), 'playfair key'), ALPHABET_NO_J, 5);
}

/** Split into digraphs: a doubled pair gets a filler after its first letter, an odd end is padded. */
function playfairPrepare(letters: string): string {
  let prepared = '';
  let index = 0;
  while (index < letters.length) {
    const first = letters[index];
    const second = index + 1 < letters.length ? letters[index + 1] : '';
    const filler = first === 'X' ? 'Q' : 'X';
    if (second === '' || second === first) {
      prepared += first + filler;
      index += 1;
    } else {
      prepared += first + second;
      index += 2;
    }
  }
  return prepared;
}

/** step 1 encrypts (right / down), step -1 decrypts (left / up). */
function playfairPairs(text: string, grid: KeyedGrid, step: 1 | -1): string {
  const size = 5;
  const wrap = (value: number) => (value + step + size) % size;
  let output = '';
  for (let index = 0; index < text.length; index += 2) {
    const first = cellOf(grid, text[index]);
    const second = cellOf(grid, text[index + 1]);
    const firstRow = Math.floor(first / size);
    const firstCol = first % size;
    const secondRow = Math.floor(second / size);
    const secondCol = second % size;
    if (firstRow === secondRow) {
      output += grid.symbols[firstRow * size + wrap(firstCol)] + grid.symbols[secondRow * size + wrap(secondCol)];
    } else if (firstCol === secondCol) {
      output += grid.symbols[wrap(firstRow) * size + firstCol] + grid.symbols[wrap(secondRow) * size + secondCol];
    } else {
      output += grid.symbols[firstRow * size + secondCol] + grid.symbols[secondRow * size + firstCol];
    }
  }
  return output;
}

const playfairEncode: TextFn = (input, param) => {
  const grid = playfairGrid(param);
  return playfairPairs(playfairPrepare(squareLetters(input)), grid, 1);
};

const playfairDecode: TextFn = (input, param) => {
  const grid = playfairGrid(param);
  const text = readCiphertext(input, ALPHABET_NO_J, 'playfair', 'the letters A-Z except J');
  if (text.length % 2 !== 0) throw new Error('playfair ciphertext must have an even number of letters');
  for (let index = 0; index < text.length; index += 2) {
    if (text[index] === text[index + 1]) {
      throw new Error(`"${text[index]}${text[index + 1]}" at letter ${index + 1}: playfair never outputs a doubled pair`);
    }
  }
  return playfairPairs(text, grid, -1);
};

// ---------------------------------------------------------------------------------------------
// two-square (vertical) and four-square
// ---------------------------------------------------------------------------------------------

const TWO_KEY_SQUARE_DEFAULT = 'EXAMPLE,KEYWORD';
const PLAIN_SQUARE = gridFromSymbols(ALPHABET_NO_J, 5);

function squarePair(param: string | undefined, cipherName: string): [KeyedGrid, KeyedGrid] {
  const [firstKey, secondKey] = splitKeyPair(param, TWO_KEY_SQUARE_DEFAULT);
  return [
    keyedGrid(requireKey(squareLetters(firstKey), `${cipherName} first key`), ALPHABET_NO_J, 5),
    keyedGrid(requireKey(squareLetters(secondKey), `${cipherName} second key`), ALPHABET_NO_J, 5),
  ];
}

const twoSquareEncode: TextFn = (input, param) => {
  const [top, bottom] = squarePair(param, 'two-square');
  return rectanglePairs(padToEven(squareLetters(input)), top, bottom, top, bottom);
};

const fourSquareEncode: TextFn = (input, param) => {
  const [upperRight, lowerLeft] = squarePair(param, 'four-square');
  return rectanglePairs(padToEven(squareLetters(input)), PLAIN_SQUARE, PLAIN_SQUARE, upperRight, lowerLeft);
};

const fourSquareDecode: TextFn = (input, param) => {
  const [upperRight, lowerLeft] = squarePair(param, 'four-square');
  const text = readCiphertext(input, ALPHABET_NO_J, 'four-square', 'the letters A-Z except J');
  if (text.length % 2 !== 0) throw new Error('four-square ciphertext must have an even number of letters');
  return rectanglePairs(text, upperRight, lowerLeft, PLAIN_SQUARE, PLAIN_SQUARE);
};

// ---------------------------------------------------------------------------------------------
// bifid and trifid (Delastelle fractionation)
// ---------------------------------------------------------------------------------------------

/**
 * Bifid (base 5, 2 coordinates) and trifid (base 3, 3 coordinates). Per block, encryption writes
 * each symbol's coordinates in a column, reads the lines left to right and regroups them;
 * decryption does the opposite. Both directions are the same two index layouts swapped.
 */
function fractionate(
  text: string, grid: KeyedGrid, base: number, coordinates: number, period: number, decrypt: boolean,
): string {
  const blockSize = period > 0 ? period : Math.max(text.length, 1);
  let output = '';
  for (let start = 0; start < text.length; start += blockSize) {
    const block = text.slice(start, start + blockSize);
    const length = block.length;
    const digits = new Array<number>(length * coordinates);
    // encrypt: write column-wise (line d, position i); decrypt: write sequentially.
    const writeAt = (symbolIndex: number, coordinate: number) =>
      decrypt ? symbolIndex * coordinates + coordinate : coordinate * length + symbolIndex;
    const readAt = (symbolIndex: number, coordinate: number) =>
      decrypt ? coordinate * length + symbolIndex : symbolIndex * coordinates + coordinate;
    for (let symbolIndex = 0; symbolIndex < length; symbolIndex++) {
      let value = cellOf(grid, block[symbolIndex]);
      for (let coordinate = coordinates - 1; coordinate >= 0; coordinate--) {
        digits[writeAt(symbolIndex, coordinate)] = value % base;
        value = Math.floor(value / base);
      }
    }
    for (let symbolIndex = 0; symbolIndex < length; symbolIndex++) {
      let value = 0;
      for (let coordinate = 0; coordinate < coordinates; coordinate++) {
        value = value * base + digits[readAt(symbolIndex, coordinate)];
      }
      output += grid.symbols[value];
    }
  }
  return output;
}

const BIFID_DEFAULT = 'DELASTELLE';
const TRIFID_DEFAULT = 'FELIX MARIE DELASTELLE,5';

function bifidSetup(param: string | undefined): { grid: KeyedGrid; period: number } {
  const { key, period } = parseKeyAndPeriod(param, BIFID_DEFAULT);
  return { grid: keyedGrid(requireKey(squareLetters(key), 'bifid key'), ALPHABET_NO_J, 5), period: period ?? 0 };
}

function trifidSetup(param: string | undefined): { grid: KeyedGrid; period: number } {
  const { key, period } = parseKeyAndPeriod(param, TRIFID_DEFAULT);
  return { grid: keyedGrid(requireKey(keepSymbols(key, ALPHABET_TRIFID), 'trifid key'), ALPHABET_TRIFID, 3), period: period ?? 5 };
}

const bifidEncode: TextFn = (input, param) => {
  const { grid, period } = bifidSetup(param);
  return fractionate(squareLetters(input), grid, 5, 2, period, false);
};
const bifidDecode: TextFn = (input, param) => {
  const { grid, period } = bifidSetup(param);
  return fractionate(readCiphertext(input, ALPHABET_NO_J, 'bifid', 'the letters A-Z except J'), grid, 5, 2, period, true);
};

const trifidEncode: TextFn = (input, param) => {
  const { grid, period } = trifidSetup(param);
  return fractionate(keepSymbols(input, ALPHABET_TRIFID), grid, 3, 3, period, false);
};
const trifidDecode: TextFn = (input, param) => {
  const { grid, period } = trifidSetup(param);
  return fractionate(readCiphertext(input, ALPHABET_TRIFID, 'trifid', 'the letters A-Z and +'), grid, 3, 3, period, true);
};

// ---------------------------------------------------------------------------------------------
// transpositions: each cipher is a reading order (ciphertext position k takes plaintext
// character order[k]); one shared pair applies and inverts it on code points.
// ---------------------------------------------------------------------------------------------

function applyOrder(chars: string[], order: number[]): string {
  const output = new Array<string>(order.length);
  for (let index = 0; index < order.length; index++) output[index] = chars[order[index]];
  return output.join('');
}

function invertOrder(chars: string[], order: number[]): string {
  const output = new Array<string>(order.length);
  for (let index = 0; index < order.length; index++) output[order[index]] = chars[index];
  return output.join('');
}

function identityOrder(length: number): number[] {
  return Array.from({ length }, (_unused, index) => index);
}

/** Wrap a reading-order function as an exact enc/dec pair over Unicode code points. */
function transposition(orderFor: (length: number, param: string | undefined) => number[]): { enc: TextFn; dec: TextFn } {
  return {
    enc: (input, param) => {
      const chars = Array.from(input);
      return applyOrder(chars, orderFor(chars.length, param));
    },
    dec: (input, param) => {
      const chars = Array.from(input);
      return invertOrder(chars, orderFor(chars.length, param));
    },
  };
}

/** Transposition key: whitespace removed, upper-cased, compared by character. */
function transpositionKey(raw: string, what: string): string[] {
  const key = Array.from(raw.replace(/\s+/g, '').toUpperCase());
  if (key.length === 0) throw new Error(`${what} needs at least one character`);
  return key;
}

/** Column read order: alphabetical by key character, ties left to right. */
function keyColumnOrder(key: string[]): number[] {
  return key
    .map((_char, index) => index)
    .sort((left, right) => (key[left] < key[right] ? -1 : key[left] > key[right] ? 1 : left - right));
}

/** Irregular columnar transposition: rows under the key, columns read in key order, no padding. */
function columnarOrder(length: number, key: string[]): number[] {
  const width = key.length;
  const order: number[] = [];
  for (const column of keyColumnOrder(key)) {
    for (let index = column; index < length; index += width) order.push(index);
  }
  return order;
}

function railFenceOrder(length: number, rails: number): number[] {
  const railCount = Math.min(rails, Math.max(length, 1));
  if (railCount === 1) return identityOrder(length);
  const cycle = 2 * (railCount - 1);
  const buckets: number[][] = Array.from({ length: railCount }, () => []);
  for (let index = 0; index < length; index++) {
    const phase = index % cycle;
    buckets[phase < railCount ? phase : cycle - phase].push(index);
  }
  return buckets.flat();
}

/**
 * Scytale: the strip (ciphertext) wraps the rod `diameter` letters per turn and the message is
 * written along the rod. Ciphertext position k sits in column floor(k / d), row k mod d; the
 * plaintext fills those occupied cells row by row.
 */
function scytaleOrder(length: number, diameter: number): number[] {
  const turns = Math.min(diameter, Math.max(length, 1));
  const columns = Math.ceil(length / turns);
  const order = new Array<number>(length);
  let plainIndex = 0;
  for (let row = 0; row < turns; row++) {
    for (let column = 0; column < columns; column++) {
      const cipherIndex = column * turns + row;
      if (cipherIndex < length) order[cipherIndex] = plainIndex++;
    }
  }
  return order;
}

/** Route cipher: write row by row `columns` wide, read clockwise spiral from the top-left corner. */
function routeOrder(length: number, columns: number): number[] {
  const width = Math.min(columns, Math.max(length, 1));
  const height = Math.ceil(length / width);
  const order: number[] = [];
  const visit = (row: number, column: number) => {
    const index = row * width + column;
    if (index < length) order.push(index);
  };
  let top = 0;
  let bottom = height - 1;
  let left = 0;
  let right = width - 1;
  while (top <= bottom && left <= right) {
    for (let column = left; column <= right; column++) visit(top, column);
    top++;
    for (let row = top; row <= bottom; row++) visit(row, right);
    right--;
    if (top <= bottom) {
      for (let column = right; column >= left; column--) visit(bottom, column);
      bottom--;
    }
    if (left <= right) {
      for (let row = bottom; row >= top; row--) visit(row, left);
      left++;
    }
  }
  return order;
}

/**
 * AMSCO: cells alternate pair / single along each row and down each column (the first cell is a
 * pair), filled row by row; the last cell may be short. Columns are read in key order.
 */
function amscoOrder(length: number, key: string[]): number[] {
  const width = key.length;
  const columnCells: number[][][] = Array.from({ length: width }, () => []);
  let next = 0;
  for (let row = 0; next < length; row++) {
    for (let column = 0; column < width && next < length; column++) {
      const size = Math.min((row + column) % 2 === 0 ? 2 : 1, length - next);
      columnCells[column].push([next, size]);
      next += size;
    }
  }
  const order: number[] = [];
  for (const column of keyColumnOrder(key)) {
    for (const [start, size] of columnCells[column]) {
      for (let offset = 0; offset < size; offset++) order.push(start + offset);
    }
  }
  return order;
}

const COLUMNAR_DEFAULT = 'ZEBRAS';
const DOUBLE_DEFAULT = 'ZEBRAS,STRIPE';
const AMSCO_DEFAULT = '41325';

const railFence = transposition((length, param) => railFenceOrder(length, parseCount(param, 3, 'rails')));
const columnar = transposition((length, param) =>
  columnarOrder(length, transpositionKey(paramText(param, COLUMNAR_DEFAULT), 'columnar key')));
const doubleTransposition = transposition((length, param) => {
  const [firstKey, secondKey] = splitKeyPair(param, DOUBLE_DEFAULT);
  const first = columnarOrder(length, transpositionKey(firstKey, 'first key'));
  const second = columnarOrder(length, transpositionKey(secondKey, 'second key'));
  return second.map((index) => first[index]);
});
const scytale = transposition((length, param) => scytaleOrder(length, parseCount(param, 3, 'diameter')));
const route = transposition((length, param) => routeOrder(length, parseCount(param, 5, 'columns')));
const amsco = transposition((length, param) =>
  amscoOrder(length, transpositionKey(paramText(param, AMSCO_DEFAULT), 'AMSCO key')));

// ---------------------------------------------------------------------------------------------
// ADFGX / ADFGVX
// ---------------------------------------------------------------------------------------------

const ADFGX_DEFAULT = 'KRYPTOS,CARGO';
const ADFGVX_DEFAULT = 'NACHTBOMMENWERPER,PRIVACY';
const ADFGVX_ALPHABET = ALPHABET_26 + DIGITS;

/** 6x6 square, historical keyword method: keyword letters first, then digit n after the nth letter A-J. */
function adfgvxSquare(key: string): KeyedGrid {
  const letters = keywordOrder(requireKey(keepSymbols(key, ALPHABET_26), 'ADFGVX square key'), ALPHABET_26);
  let symbols = '';
  for (const letter of letters) {
    symbols += letter;
    const offset = 'ABCDEFGHIJ'.indexOf(letter);
    if (offset >= 0) symbols += '1234567890'[offset];
  }
  return gridFromSymbols(symbols, 6);
}

interface AdfgvxSpec {
  name: string;
  labels: string;
  fallback: string;
  square: (key: string) => KeyedGrid;
  plaintext: (input: string) => string;
}

const ADFGX_SPEC: AdfgvxSpec = {
  name: 'ADFGX',
  labels: 'ADFGX',
  fallback: ADFGX_DEFAULT,
  square: (key) => keyedGrid(requireKey(squareLetters(key), 'ADFGX square key'), ALPHABET_NO_J, 5),
  plaintext: squareLetters,
};

const ADFGVX_SPEC: AdfgvxSpec = {
  name: 'ADFGVX',
  labels: 'ADFGVX',
  fallback: ADFGVX_DEFAULT,
  square: adfgvxSquare,
  plaintext: (input) => keepSymbols(input, ADFGVX_ALPHABET),
};

function adfgvxSetup(spec: AdfgvxSpec, param: string | undefined): { grid: KeyedGrid; key: string[] } {
  const [squareKey, columnKey] = splitKeyPair(param, spec.fallback);
  return { grid: spec.square(squareKey), key: transpositionKey(columnKey, `${spec.name} transposition key`) };
}

function adfgvxEncoder(spec: AdfgvxSpec): TextFn {
  return (input, param) => {
    const { grid, key } = adfgvxSetup(spec, param);
    const fractionated: string[] = [];
    for (const char of spec.plaintext(input)) {
      const cell = cellOf(grid, char);
      fractionated.push(spec.labels[Math.floor(cell / grid.width)], spec.labels[cell % grid.width]);
    }
    return applyOrder(fractionated, columnarOrder(fractionated.length, key));
  };
}

function adfgvxDecoder(spec: AdfgvxSpec): TextFn {
  return (input, param) => {
    const { grid, key } = adfgvxSetup(spec, param);
    const symbols = Array.from(readCiphertext(input, spec.labels, spec.name, `the letters ${spec.labels}`));
    if (symbols.length % 2 !== 0) throw new Error(`${spec.name} ciphertext must have an even number of letters`);
    const fractionated = invertOrder(symbols, columnarOrder(symbols.length, key));
    let plain = '';
    for (let index = 0; index < fractionated.length; index += 2) {
      const row = spec.labels.indexOf(fractionated[index]);
      const column = spec.labels.indexOf(fractionated[index + 1]);
      plain += grid.symbols[row * grid.width + column];
    }
    return plain;
  };
}

// ---------------------------------------------------------------------------------------------
// hill
// ---------------------------------------------------------------------------------------------

const HILL_DEFAULT = '3,3,2,5';
const HILL_FORMAT = 'hill key must be 4 or 9 whole numbers row by row (like 3,3,2,5) or 4 or 9 letters (like HILL, A=0)';

function mod26(value: number): number {
  return ((value % 26) + 26) % 26;
}

function inverseMod26(value: number): number | null {
  for (let candidate = 1; candidate < 26; candidate++) if (mod26(value * candidate) === 1) return candidate;
  return null;
}

function minor(matrix: number[][], skipRow: number, skipColumn: number): number[][] {
  return matrix
    .filter((_row, rowIndex) => rowIndex !== skipRow)
    .map((row) => row.filter((_value, columnIndex) => columnIndex !== skipColumn));
}

function determinant(matrix: number[][]): number {
  if (matrix.length === 1) return matrix[0][0];
  let total = 0;
  for (let column = 0; column < matrix.length; column++) {
    const sign = column % 2 === 0 ? 1 : -1;
    total += sign * matrix[0][column] * determinant(minor(matrix, 0, column));
  }
  return total;
}

function parseHillKey(param: string | undefined): { key: number[][]; inverse: number[][] } {
  const text = paramText(param, HILL_DEFAULT);
  let values: number[];
  if (/^[A-Za-z\s]+$/.test(text)) {
    values = Array.from(text.replace(/\s+/g, '').toUpperCase(), (char) => char.charCodeAt(0) - 65);
  } else {
    const parts = text.split(/[\s,;]+/).filter((part) => part !== '');
    if (!parts.every((part) => /^-?\d+$/.test(part))) throw new Error(HILL_FORMAT);
    // BigInt so huge entries reduce exactly: Number('99999999999999999999999') % 26 is wrong.
    values = parts.map((part) => Number(((BigInt(part) % 26n) + 26n) % 26n));
  }
  const size = values.length === 4 ? 2 : values.length === 9 ? 3 : 0;
  if (size === 0) throw new Error(`${HILL_FORMAT}; got ${values.length} values`);
  const key = Array.from({ length: size }, (_unused, row) => values.slice(row * size, row * size + size));
  const det = mod26(determinant(key));
  const detInverse = inverseMod26(det);
  if (detInverse === null) {
    throw new Error(`hill key is not invertible mod 26: its determinant is ${det}, which shares a factor with 26 (it must be odd and not 13)`);
  }
  // inverse = det^-1 * adjugate; adjugate[i][j] is the (j, i) cofactor.
  const inverse = key.map((_row, rowIndex) =>
    key.map((_value, columnIndex) => {
      const sign = (rowIndex + columnIndex) % 2 === 0 ? 1 : -1;
      return mod26(detInverse * sign * determinant(minor(key, columnIndex, rowIndex)));
    }));
  return { key, inverse };
}

function hillBlocks(letters: string, matrix: number[][]): string {
  const size = matrix.length;
  let output = '';
  for (let start = 0; start < letters.length; start += size) {
    for (let row = 0; row < size; row++) {
      let sum = 0;
      for (let column = 0; column < size; column++) sum += matrix[row][column] * (letters.charCodeAt(start + column) - 65);
      output += ALPHABET_26[mod26(sum)];
    }
  }
  return output;
}

const hillEncode: TextFn = (input, param) => {
  const { key } = parseHillKey(param);
  let letters = keepSymbols(input, ALPHABET_26);
  while (letters.length % key.length !== 0) letters += 'X';
  return hillBlocks(letters, key);
};

const hillDecode: TextFn = (input, param) => {
  const { inverse } = parseHillKey(param);
  const letters = readCiphertext(input, ALPHABET_26, 'hill', 'the letters A-Z');
  if (letters.length % inverse.length !== 0) {
    throw new Error(`hill ciphertext length must be a multiple of ${inverse.length} for a ${inverse.length}x${inverse.length} key`);
  }
  return hillBlocks(letters, inverse);
};

// ---------------------------------------------------------------------------------------------
// fractionated Morse (ACA)
// ---------------------------------------------------------------------------------------------

const MORSE: Record<string, string> = {
  A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....', I: '..', J: '.---',
  K: '-.-', L: '.-..', M: '--', N: '-.', O: '---', P: '.--.', Q: '--.-', R: '.-.', S: '...', T: '-',
  U: '..-', V: '...-', W: '.--', X: '-..-', Y: '-.--', Z: '--..',
  '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
  '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
};
const MORSE_REVERSE: Record<string, string> = Object.fromEntries(
  Object.entries(MORSE).map(([plain, code]) => [code, plain]),
);
const TRIGRAPH_SYMBOLS = '.-x';
/** Trigraph i of the 26 (xxx is never used): first symbol cycles slowest, as in the ACA table. */
function trigraphOf(index: number): string {
  return TRIGRAPH_SYMBOLS[Math.floor(index / 9)] + TRIGRAPH_SYMBOLS[Math.floor(index / 3) % 3] + TRIGRAPH_SYMBOLS[index % 3];
}
const TRIGRAPH_INDEX = new Map<string, number>(Array.from({ length: 26 }, (_unused, index) => [trigraphOf(index), index]));
const FRACTIONATED_MORSE_DEFAULT = 'ROUNDTABLE';

function morseAlphabet(param: string | undefined): KeyedGrid {
  const key = requireKey(keepSymbols(paramText(param, FRACTIONATED_MORSE_DEFAULT), ALPHABET_26), 'fractionated Morse key');
  return keyedGrid(key, ALPHABET_26, 26);
}

const fractionatedMorseEncode: TextFn = (input, param) => {
  const alphabet = morseAlphabet(param);
  const words = upperFolded(input)
    .split(/\s+/)
    .map((word) => keepSymbols(word, ADFGVX_ALPHABET))
    .filter((word) => word !== '');
  let morse = words.map((word) => Array.from(word, (char) => MORSE[char]).join('x')).join('xx');
  while (morse.length % 3 !== 0) morse += 'x';
  let output = '';
  for (let index = 0; index < morse.length; index += 3) {
    const trigraph = TRIGRAPH_INDEX.get(morse.slice(index, index + 3));
    if (trigraph === undefined) throw new Error('internal error: xxx trigraph');
    output += alphabet.symbols[trigraph];
  }
  return output;
};

const fractionatedMorseDecode: TextFn = (input, param) => {
  const alphabet = morseAlphabet(param);
  const letters = readCiphertext(input, ALPHABET_26, 'fractionated Morse', 'the letters A-Z');
  let morse = '';
  for (const letter of letters) morse += trigraphOf(cellOf(alphabet, letter));
  morse = morse.replace(/x+$/, '');
  if (morse === '') return '';
  if (morse.startsWith('x')) throw new Error('not valid fractionated Morse: it starts with a letter separator');
  if (morse.includes('xxx')) throw new Error('not valid fractionated Morse: it decodes to three separators in a row');
  return morse
    .split('xx')
    .map((word) =>
      word
        .split('x')
        .map((code) => {
          const plain = MORSE_REVERSE[code];
          if (plain === undefined) throw new Error(`not valid fractionated Morse: "${code}" is not a Morse letter or digit`);
          return plain;
        })
        .join(''))
    .join(' ');
};

// ---------------------------------------------------------------------------------------------
// registry (appended to the DASH registry in dash-registry.ts)
// ---------------------------------------------------------------------------------------------

export const GRID_CIPHER_TRANSFORMS: DashTransform[] = [
  { id: 'playfair', label: 'playfair', group: 'ciphers', enc: playfairEncode, dec: playfairDecode,
    param: { label: 'key', default: PLAYFAIR_DEFAULT, hint: 'keyword or phrase; only its letters count' },
    note: 'letters only, upper case, J becomes I. A doubled letter in a pair gets an X (Q for XX) and an odd end gets an X; decode keeps those fillers.' },
  { id: 'twosquare', label: 'two-square', group: 'ciphers', enc: twoSquareEncode, dec: null,
    param: { label: 'keys', default: TWO_KEY_SQUARE_DEFAULT, hint: 'top square key, bottom square key' },
    note: 'vertical two-square: letters only, upper case, J becomes I, odd end padded with X. It is its own inverse: run it again with the same keys to decode.' },
  { id: 'foursquare', label: 'four-square', group: 'ciphers', enc: fourSquareEncode, dec: fourSquareDecode,
    param: { label: 'keys', default: TWO_KEY_SQUARE_DEFAULT, hint: 'upper-right square key, lower-left square key' },
    note: 'letters only, upper case, J becomes I, odd end padded with X.' },
  { id: 'bifid', label: 'bifid', group: 'ciphers', enc: bifidEncode, dec: bifidDecode,
    param: { label: 'key[,period]', default: BIFID_DEFAULT, hint: 'square keyword; add ",5" etc. for a block size (none = whole message)' },
    note: 'letters only, upper case, J becomes I. Decode needs the same key and period.' },
  { id: 'trifid', label: 'trifid', group: 'ciphers', enc: trifidEncode, dec: trifidDecode,
    param: { label: 'key[,period]', default: TRIFID_DEFAULT, hint: 'cube keyword, then block size (default 5; 0 = whole message)' },
    note: '27-symbol cube: letters A-Z plus +, upper case; everything else is dropped.' },
  { id: 'adfgx', label: 'ADFGX', group: 'ciphers', enc: adfgvxEncoder(ADFGX_SPEC), dec: adfgvxDecoder(ADFGX_SPEC),
    param: { label: 'square key,column key', default: ADFGX_DEFAULT, hint: 'Polybius square keyword, transposition keyword' },
    note: 'letters only, upper case, J becomes I. Each letter becomes two of A D F G X, then the columns are shuffled (no padding).' },
  { id: 'adfgvx', label: 'ADFGVX', group: 'ciphers', enc: adfgvxEncoder(ADFGVX_SPEC), dec: adfgvxDecoder(ADFGVX_SPEC),
    param: { label: 'square key,column key', default: ADFGVX_DEFAULT, hint: 'square keyword (digits follow A-J), transposition keyword' },
    note: 'letters and digits, upper case; everything else is dropped. 6x6 square, then a columnar shuffle with no padding.' },
  { id: 'hill', label: 'hill', group: 'ciphers', enc: hillEncode, dec: hillDecode,
    param: { label: 'key matrix', default: HILL_DEFAULT, hint: '4 or 9 numbers row by row, or 4/9 letters; must be invertible mod 26' },
    note: 'letters only, upper case, padded with X to a whole block; decode keeps the padding.' },
  { id: 'railfence', label: 'rail fence', group: 'ciphers', ...railFence,
    param: { label: 'rails', default: '3', hint: 'number of rails (1 = unchanged)' },
    note: 'zigzag over every character, spaces included. Exact round trip.' },
  { id: 'columnar', label: 'columnar', group: 'ciphers', ...columnar,
    param: { label: 'key', default: COLUMNAR_DEFAULT, hint: 'columns are read in the key\'s alphabetical order, ties left to right' },
    note: 'moves every character, spaces included; the last row is left short (no X padding), so it round-trips exactly.' },
  { id: 'doubletransposition', label: 'double transposition', group: 'ciphers', ...doubleTransposition,
    param: { label: 'keys', default: DOUBLE_DEFAULT, hint: 'first key, second key' },
    note: 'columnar transposition twice, no padding. Moves every character; exact round trip.' },
  { id: 'scytale', label: 'scytale', group: 'ciphers', ...scytale,
    param: { label: 'diameter', default: '3', hint: 'letters per turn around the rod' },
    note: 'moves every character, spaces included; exact round trip.' },
  { id: 'route', label: 'route (spiral)', group: 'ciphers', ...route,
    param: { label: 'columns', default: '5', hint: 'grid width; read clockwise spiral from the top left' },
    note: 'written in rows, read as an inward clockwise spiral. Moves every character; the last row is left short, so it round-trips exactly.' },
  { id: 'amsco', label: 'AMSCO', group: 'ciphers', ...amsco,
    param: { label: 'key', default: AMSCO_DEFAULT, hint: 'digits or letters giving the column read order' },
    note: 'alternating 2- and 1-character cells, then columns in key order. Moves every character; no padding, exact round trip.' },
  { id: 'fractionatedmorse', label: 'fractionated morse', group: 'ciphers', enc: fractionatedMorseEncode, dec: fractionatedMorseDecode,
    param: { label: 'key', default: FRACTIONATED_MORSE_DEFAULT, hint: 'keyword for the 26-letter cipher alphabet' },
    note: 'letters and digits only, upper case; word gaps survive, punctuation is dropped.' },
];

/** Low-level pieces exported for the test suite, which checks them against published vectors
 *  that use a Q-less square (Wikipedia's two-square and four-square examples). */
export const GRID_CIPHER_INTERNALS = { keyedGrid, gridFromSymbols, rectanglePairs };
