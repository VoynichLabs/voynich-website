// Author: Claude Opus 5.5
// Date: 23-Nov-2026
// PURPOSE: QR code transform for the DASH page (src/pages/dash.astro): turns any text into a
//          scannable QR code drawn with Unicode half blocks, so two module rows fit on one text
//          line ('█' both dark, '▀' top only, '▄' bottom only, ' ' neither). Encode only.
//          The encoder is written from scratch against ISO/IEC 18004:2015 (QR Code 2005 model 2):
//            - byte mode (mode indicator 0100) carrying the input as UTF-8, with an 8-bit count
//              for versions 1-9 and a 16-bit count for versions 10-40
//            - the smallest version 1-40 that holds the data at the chosen error-correction level
//              (L, M, Q or H), terminator, bit padding and the 0xEC / 0x11 pad codewords
//            - Reed-Solomon error correction over GF(256) with primitive polynomial 0x11D, data
//              split into the standard group 1 / group 2 blocks, then codeword interleaving
//            - every function pattern: finders, separators, timing, alignment patterns, the dark
//              module, version information (BCH 18,6) for versions 7+, format information
//              (BCH 15,5 with the 0x5412 mask) in both copies
//            - all eight data masks scored with the four penalty rules (N1 runs, N2 2x2 blocks,
//              N3 finder-like 1:1:3:1:1 patterns, N4 dark balance); the lowest score wins
//            - a 4-module quiet zone around the symbol
//          Scanners expect dark modules on a light background: the blocks are the dark modules,
//          so show it as dark text on a light background (or paste it anywhere with a monospace
//          font). Pure and deterministic: no DOM, no network, no randomness, so the node test
//          suite (tests/dash-qr.test.mjs) transpiles and loads this file alone.
//          Integration: QR_TRANSFORMS is appended to the DASH registry in the 'codes' group,
//          shared by voynichlabs.org/dash and markbarney.net/dash.
//          SHARED FILE: the master copy is VoynichLabs/voynich-website src/lib/; markbarney.net
//          (82deutschmark/MarkSite) keeps an identical copy in client/src/lib/dash/. Edit the master,
//          then copy it across unchanged.
// SRP/DRY check: Pass - checked src/lib/dash-*.ts; no QR or Reed-Solomon code existed. Reuses the
//          DashTransform type from dash-glyphs.ts; every table and step below lives in its own
//          small function (encoding, error correction, matrix building, masking, rendering).

import type { DashTransform } from './dash-glyphs';

// ---------------------------------------------------------------------------------------------
// error-correction levels and capacity tables (ISO/IEC 18004 table 9)
// ---------------------------------------------------------------------------------------------

export type QrLevel = 'L' | 'M' | 'Q' | 'H';

/** Two-bit level indicator used in the format information (L=01, M=00, Q=11, H=10). */
const LEVEL_FORMAT_BITS: Record<QrLevel, number> = { L: 1, M: 0, Q: 3, H: 2 };

/** Error-correction codewords per block, indexed [level][version - 1]. */
const EC_CODEWORDS_PER_BLOCK: Record<QrLevel, readonly number[]> = {
  L: [7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28,
    28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  M: [10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26,
    26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],
  Q: [13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30,
    28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  H: [17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28,
    30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
};

/** Number of error-correction blocks, indexed [level][version - 1]. */
const EC_BLOCK_COUNT: Record<QrLevel, readonly number[]> = {
  L: [1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8,
    8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25],
  M: [1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16,
    17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49],
  Q: [1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20,
    23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68],
  H: [1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25,
    25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81],
};

export const QR_MIN_VERSION = 1;
export const QR_MAX_VERSION = 40;
export const QR_QUIET_ZONE = 4;

/** Side length in modules of a version's symbol (without quiet zone). */
export function symbolSize(version: number): number {
  return version * 4 + 17;
}

/** Number of alignment patterns along one side (0 for version 1). */
function alignmentCountPerSide(version: number): number {
  return version === 1 ? 0 : Math.floor(version / 7) + 2;
}

/**
 * Row/column centres of the alignment patterns (ISO/IEC 18004 annex E). The first is always 6 and
 * the last always size - 7; the ones between are evenly spaced with an even step, any slack going
 * to the gap after 6. Version 32 is the one version whose table step is not the rounded-up value.
 */
function alignmentCentres(version: number): number[] {
  const count = alignmentCountPerSide(version);
  if (count === 0) return [];
  const last = symbolSize(version) - 7;
  const step = version === 32 ? 26 : Math.ceil((last - 6) / (count - 1) / 2) * 2;
  const centres = [6];
  for (let index = count - 2; index >= 0; index -= 1) centres.push(last - index * step);
  return centres;
}

/** Modules left for data and error correction once every function pattern is placed. */
function dataModuleCount(version: number): number {
  const size = symbolSize(version);
  let functionModules = 3 * 64 + 2 * (size - 16); // finders with separators + timing lines
  const align = alignmentCountPerSide(version);
  if (align > 0) {
    const patterns = align * align - 3; // three would overlap the finders
    const timingOverlap = 2 * (align - 2) * 5; // patterns sitting on the timing lines
    functionModules += patterns * 25 - timingOverlap;
  }
  functionModules += 31; // two copies of the 15-bit format info plus the dark module
  if (version >= 7) functionModules += 36; // two copies of the 18-bit version info
  return size * size - functionModules;
}

/** Total codewords (data + error correction) a version holds; leftover remainder bits are skipped. */
function totalCodewords(version: number): number {
  return Math.floor(dataModuleCount(version) / 8);
}

/** Data codewords a version holds at a level. */
function dataCodewords(version: number, level: QrLevel): number {
  const index = version - 1;
  return totalCodewords(version) - EC_CODEWORDS_PER_BLOCK[level][index] * EC_BLOCK_COUNT[level][index];
}

/** Length in bits of the byte-mode character count field. */
function countFieldBits(version: number): number {
  return version <= 9 ? 8 : 16;
}

/** Largest byte-mode payload, in bytes, a version holds at a level. */
export function byteCapacity(version: number, level: QrLevel): number {
  const bits = dataCodewords(version, level) * 8 - 4 - countFieldBits(version);
  return Math.floor(bits / 8);
}

/** Smallest version that holds `byteLength` bytes at `level`; throws when even version 40 cannot. */
export function chooseVersion(byteLength: number, level: QrLevel): number {
  for (let version = QR_MIN_VERSION; version <= QR_MAX_VERSION; version += 1) {
    if (byteLength <= byteCapacity(version, level)) return version;
  }
  throw new Error(`too long for a QR code at level ${level} (max ${byteCapacity(QR_MAX_VERSION, level)} bytes)`);
}

// ---------------------------------------------------------------------------------------------
// data codewords: byte mode bit stream with terminator and padding
// ---------------------------------------------------------------------------------------------

/** Growable big-endian bit buffer. */
class BitWriter {
  readonly bits: number[] = [];

  write(value: number, length: number): void {
    for (let bit = length - 1; bit >= 0; bit -= 1) this.bits.push((value >>> bit) & 1);
  }
}

/** Build the data codewords for a byte-mode segment, padded to the version's data capacity. */
function buildDataCodewords(payload: Uint8Array, version: number, level: QrLevel): number[] {
  const capacityBits = dataCodewords(version, level) * 8;
  const writer = new BitWriter();
  writer.write(0b0100, 4); // byte mode indicator
  writer.write(payload.length, countFieldBits(version));
  for (const byte of payload) writer.write(byte, 8);
  writer.write(0, Math.min(4, capacityBits - writer.bits.length)); // terminator
  writer.write(0, (8 - (writer.bits.length % 8)) % 8); // pad to a whole byte

  const codewords: number[] = [];
  for (let start = 0; start < writer.bits.length; start += 8) {
    let byte = 0;
    for (let offset = 0; offset < 8; offset += 1) byte = (byte << 1) | writer.bits[start + offset];
    codewords.push(byte);
  }
  for (let pad = 0; codewords.length < capacityBits / 8; pad += 1) codewords.push(pad % 2 === 0 ? 0xec : 0x11);
  return codewords;
}

// ---------------------------------------------------------------------------------------------
// Reed-Solomon over GF(256), primitive polynomial x^8 + x^4 + x^3 + x^2 + 1 (0x11D)
// ---------------------------------------------------------------------------------------------

const GF_EXP = new Uint8Array(512);
const GF_LOG = new Uint8Array(256);
(function buildGaloisTables(): void {
  let value = 1;
  for (let power = 0; power < 255; power += 1) {
    GF_EXP[power] = value;
    GF_LOG[value] = power;
    value <<= 1;
    if (value & 0x100) value ^= 0x11d;
  }
  for (let power = 255; power < 512; power += 1) GF_EXP[power] = GF_EXP[power - 255];
})();

function gfMultiply(left: number, right: number): number {
  if (left === 0 || right === 0) return 0;
  return GF_EXP[GF_LOG[left] + GF_LOG[right]];
}

/** Generator polynomial (x - a^0)(x - a^1)...(x - a^(degree-1)), coefficients highest power first. */
function generatorPolynomial(degree: number): number[] {
  let poly = [1];
  for (let root = 0; root < degree; root += 1) {
    const next = new Array<number>(poly.length + 1).fill(0);
    for (let index = 0; index < poly.length; index += 1) {
      next[index] ^= poly[index];
      next[index + 1] ^= gfMultiply(poly[index], GF_EXP[root]);
    }
    poly = next;
  }
  return poly;
}

const generatorCache = new Map<number, number[]>();

/** Remainder of data(x) * x^degree divided by the generator: the error-correction codewords. */
function reedSolomonRemainder(data: readonly number[], degree: number): number[] {
  let generator = generatorCache.get(degree);
  if (generator === undefined) {
    generator = generatorPolynomial(degree);
    generatorCache.set(degree, generator);
  }
  const remainder = new Array<number>(degree).fill(0);
  for (const byte of data) {
    const factor = byte ^ remainder[0];
    remainder.shift();
    remainder.push(0);
    for (let index = 0; index < degree; index += 1) remainder[index] ^= gfMultiply(generator[index + 1], factor);
  }
  return remainder;
}

/** Split data into blocks, add error correction to each, and interleave into the final sequence. */
function buildFinalCodewords(data: readonly number[], version: number, level: QrLevel): number[] {
  const blockCount = EC_BLOCK_COUNT[level][version - 1];
  const ecLength = EC_CODEWORDS_PER_BLOCK[level][version - 1];
  const shortLength = Math.floor(data.length / blockCount);
  const longBlocks = data.length % blockCount; // group 2 blocks carry one extra data codeword

  const dataBlocks: number[][] = [];
  const ecBlocks: number[][] = [];
  let offset = 0;
  for (let block = 0; block < blockCount; block += 1) {
    const length = shortLength + (block >= blockCount - longBlocks ? 1 : 0);
    const slice = data.slice(offset, offset + length);
    offset += length;
    dataBlocks.push(slice);
    ecBlocks.push(reedSolomonRemainder(slice, ecLength));
  }

  const result: number[] = [];
  for (let index = 0; index <= shortLength; index += 1) {
    for (const block of dataBlocks) if (index < block.length) result.push(block[index]);
  }
  for (let index = 0; index < ecLength; index += 1) {
    for (const block of ecBlocks) result.push(block[index]);
  }
  return result;
}

// ---------------------------------------------------------------------------------------------
// the module matrix: function patterns, data placement, masks, format and version info
// ---------------------------------------------------------------------------------------------

interface QrMatrix {
  size: number;
  /** dark[row][col] */
  dark: boolean[][];
  /** reserved[row][col]: function pattern modules that data and masks must not touch */
  reserved: boolean[][];
}

function emptyMatrix(size: number): QrMatrix {
  const grid = (): boolean[][] => Array.from({ length: size }, () => new Array<boolean>(size).fill(false));
  return { size, dark: grid(), reserved: grid() };
}

function setFunction(matrix: QrMatrix, row: number, col: number, isDark: boolean): void {
  matrix.dark[row][col] = isDark;
  matrix.reserved[row][col] = true;
}

/** 7x7 finder centred on (row, col) plus its one-module light separator, clipped to the symbol. */
function drawFinder(matrix: QrMatrix, centreRow: number, centreCol: number): void {
  for (let dRow = -4; dRow <= 4; dRow += 1) {
    for (let dCol = -4; dCol <= 4; dCol += 1) {
      const row = centreRow + dRow;
      const col = centreCol + dCol;
      if (row < 0 || row >= matrix.size || col < 0 || col >= matrix.size) continue;
      const ring = Math.max(Math.abs(dRow), Math.abs(dCol));
      setFunction(matrix, row, col, ring !== 2 && ring !== 4);
    }
  }
}

/** 5x5 alignment pattern centred on (row, col). */
function drawAlignment(matrix: QrMatrix, centreRow: number, centreCol: number): void {
  for (let dRow = -2; dRow <= 2; dRow += 1) {
    for (let dCol = -2; dCol <= 2; dCol += 1) {
      setFunction(matrix, centreRow + dRow, centreCol + dCol, Math.max(Math.abs(dRow), Math.abs(dCol)) !== 1);
    }
  }
}

/** Remainder of `value` shifted left by the generator's degree, divided by the generator (mod 2). */
function bchRemainder(value: number, generator: number, generatorDegree: number): number {
  let remainder = value << generatorDegree;
  for (let bit = 31 - Math.clz32(remainder); bit >= generatorDegree; bit -= 1) {
    if ((remainder >>> bit) & 1) remainder ^= generator << (bit - generatorDegree);
  }
  return remainder;
}

/** 15-bit format information: level and mask, BCH(15,5) protected, XOR-masked with 0x5412. */
function formatBits(level: QrLevel, mask: number): number {
  const data = (LEVEL_FORMAT_BITS[level] << 3) | mask;
  return ((data << 10) | bchRemainder(data, 0x537, 10)) ^ 0x5412;
}

/** 18-bit version information: the version number, BCH(18,6) protected. */
function versionBits(version: number): number {
  return (version << 12) | bchRemainder(version, 0x1f25, 12);
}

/** Place both copies of the format information (bit 0 = least significant). */
function drawFormat(matrix: QrMatrix, level: QrLevel, mask: number): void {
  const bits = formatBits(level, mask);
  const bit = (index: number): boolean => ((bits >>> index) & 1) === 1;
  const last = matrix.size - 1;
  // copy 1, around the top-left finder: up column 8 then left along row 8, skipping timing
  for (let index = 0; index <= 5; index += 1) setFunction(matrix, index, 8, bit(index));
  setFunction(matrix, 7, 8, bit(6));
  setFunction(matrix, 8, 8, bit(7));
  setFunction(matrix, 8, 7, bit(8));
  for (let index = 9; index < 15; index += 1) setFunction(matrix, 8, 14 - index, bit(index));
  // copy 2: bits 0-7 along row 8 under the top-right finder, bits 8-14 down column 8 by the bottom-left
  for (let index = 0; index < 8; index += 1) setFunction(matrix, 8, last - index, bit(index));
  for (let index = 8; index < 15; index += 1) setFunction(matrix, matrix.size - 15 + index, 8, bit(index));
  setFunction(matrix, matrix.size - 8, 8, true); // the dark module
}

/** Place both 6x3 copies of the version information (versions 7 and up). */
function drawVersion(matrix: QrMatrix, version: number): void {
  if (version < 7) return;
  const bits = versionBits(version);
  for (let index = 0; index < 18; index += 1) {
    const isDark = ((bits >>> index) & 1) === 1;
    const near = Math.floor(index / 3);
    const far = matrix.size - 11 + (index % 3);
    setFunction(matrix, near, far, isDark); // top-right block
    setFunction(matrix, far, near, isDark); // bottom-left block
  }
}

/** Every function pattern except format bits, which are written once the mask is known. */
function drawFunctionPatterns(matrix: QrMatrix, version: number): void {
  const size = matrix.size;
  for (let index = 0; index < size; index += 1) {
    setFunction(matrix, 6, index, index % 2 === 0);
    setFunction(matrix, index, 6, index % 2 === 0);
  }
  drawFinder(matrix, 3, 3);
  drawFinder(matrix, 3, size - 4);
  drawFinder(matrix, size - 4, 3);

  const centres = alignmentCentres(version);
  const lastIndex = centres.length - 1;
  for (let rowIndex = 0; rowIndex < centres.length; rowIndex += 1) {
    for (let colIndex = 0; colIndex < centres.length; colIndex += 1) {
      const overlapsFinder = (rowIndex === 0 && colIndex === 0)
        || (rowIndex === 0 && colIndex === lastIndex)
        || (rowIndex === lastIndex && colIndex === 0);
      if (!overlapsFinder) drawAlignment(matrix, centres[rowIndex], centres[colIndex]);
    }
  }
  // reserve the format areas now (values are rewritten per mask) so data skips them
  drawFormat(matrix, 'L', 0);
  drawVersion(matrix, version);
}

/** Place codewords in the two-column zigzag from the bottom-right, skipping the vertical timing column. */
function placeCodewords(matrix: QrMatrix, codewords: readonly number[]): void {
  const size = matrix.size;
  const totalBits = codewords.length * 8;
  let bitIndex = 0;
  let upward = true;
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let step = 0; step < size; step += 1) {
      const row = upward ? size - 1 - step : step;
      for (let offset = 0; offset < 2; offset += 1) {
        const col = right - offset;
        if (matrix.reserved[row][col]) continue;
        // modules past the last codeword are remainder bits and stay light
        if (bitIndex < totalBits) {
          matrix.dark[row][col] = ((codewords[bitIndex >>> 3] >>> (7 - (bitIndex & 7))) & 1) === 1;
        }
        bitIndex += 1;
      }
    }
    upward = !upward;
  }
}

/** Mask conditions from ISO/IEC 18004 table 10; a true result flips the data module. */
const MASK_CONDITIONS: ReadonlyArray<(row: number, col: number) => boolean> = [
  (row, col) => (row + col) % 2 === 0,
  (row) => row % 2 === 0,
  (_row, col) => col % 3 === 0,
  (row, col) => (row + col) % 3 === 0,
  (row, col) => (Math.floor(row / 2) + Math.floor(col / 3)) % 2 === 0,
  (row, col) => ((row * col) % 2) + ((row * col) % 3) === 0,
  (row, col) => (((row * col) % 2) + ((row * col) % 3)) % 2 === 0,
  (row, col) => (((row + col) % 2) + ((row * col) % 3)) % 2 === 0,
];

/** XOR a mask onto the data modules (applying it twice undoes it). */
function applyMask(matrix: QrMatrix, mask: number): void {
  const condition = MASK_CONDITIONS[mask];
  for (let row = 0; row < matrix.size; row += 1) {
    for (let col = 0; col < matrix.size; col += 1) {
      if (!matrix.reserved[row][col] && condition(row, col)) matrix.dark[row][col] = !matrix.dark[row][col];
    }
  }
}

// ---------------------------------------------------------------------------------------------
// mask penalty (ISO/IEC 18004 section 7.8.3)
// ---------------------------------------------------------------------------------------------

const PENALTY_RUN = 3; // N1
const PENALTY_BLOCK = 3; // N2
const PENALTY_FINDER_LIKE = 40; // N3
const PENALTY_BALANCE = 10; // N4

/** The 1:1:3:1:1 finder-like pattern with four light modules on one side, both directions. */
const FINDER_LIKE_PATTERNS: ReadonlyArray<readonly boolean[]> = [
  [true, false, true, true, true, false, true, false, false, false, false],
  [false, false, false, false, true, false, true, true, true, false, true],
];

/** N1 and N3 for one line of modules. */
function linePenalty(line: readonly boolean[]): number {
  let penalty = 0;
  let runLength = 1;
  for (let index = 1; index <= line.length; index += 1) {
    if (index < line.length && line[index] === line[index - 1]) {
      runLength += 1;
    } else {
      if (runLength >= 5) penalty += PENALTY_RUN + (runLength - 5);
      runLength = 1;
    }
  }
  for (let start = 0; start + 11 <= line.length; start += 1) {
    for (const pattern of FINDER_LIKE_PATTERNS) {
      if (pattern.every((isDark, offset) => line[start + offset] === isDark)) penalty += PENALTY_FINDER_LIKE;
    }
  }
  return penalty;
}

function maskPenalty(matrix: QrMatrix): number {
  const { size, dark } = matrix;
  let penalty = 0;
  for (let index = 0; index < size; index += 1) {
    penalty += linePenalty(dark[index]);
    penalty += linePenalty(dark.map((row) => row[index]));
  }
  for (let row = 0; row + 1 < size; row += 1) {
    for (let col = 0; col + 1 < size; col += 1) {
      const colour = dark[row][col];
      if (dark[row][col + 1] === colour && dark[row + 1][col] === colour && dark[row + 1][col + 1] === colour) {
        penalty += PENALTY_BLOCK;
      }
    }
  }
  let darkCount = 0;
  for (const row of dark) for (const isDark of row) if (isDark) darkCount += 1;
  const percent = (darkCount * 100) / (size * size);
  penalty += Math.floor(Math.abs(percent - 50) / 5) * PENALTY_BALANCE;
  return penalty;
}

// ---------------------------------------------------------------------------------------------
// public encoder and renderer
// ---------------------------------------------------------------------------------------------

export interface QrSymbol {
  version: number;
  level: QrLevel;
  mask: number;
  size: number;
  /** modules[row][col], true = dark; no quiet zone */
  modules: boolean[][];
}

/** Encode bytes as a QR symbol: smallest version, best mask by penalty score. */
export function encodeQr(payload: Uint8Array, level: QrLevel): QrSymbol {
  const version = chooseVersion(payload.length, level);
  const codewords = buildFinalCodewords(buildDataCodewords(payload, version, level), version, level);
  const matrix = emptyMatrix(symbolSize(version));
  drawFunctionPatterns(matrix, version);
  placeCodewords(matrix, codewords);

  let bestMask = 0;
  let bestPenalty = Infinity;
  for (let mask = 0; mask < MASK_CONDITIONS.length; mask += 1) {
    applyMask(matrix, mask);
    drawFormat(matrix, level, mask);
    const penalty = maskPenalty(matrix);
    if (penalty < bestPenalty) {
      bestPenalty = penalty;
      bestMask = mask;
    }
    applyMask(matrix, mask); // undo before trying the next one
  }
  applyMask(matrix, bestMask);
  drawFormat(matrix, level, bestMask);
  return { version, level, mask: bestMask, size: matrix.size, modules: matrix.dark };
}

/** Half-block characters indexed by (top dark ? 1 : 0) | (bottom dark ? 2 : 0). */
const HALF_BLOCKS = [' ', '▀', '▄', '█'];

/** Draw modules with a quiet zone, two module rows per text line. */
export function renderHalfBlocks(modules: readonly (readonly boolean[])[], quietZone: number = QR_QUIET_ZONE): string {
  const size = modules.length;
  const full = size + quietZone * 2;
  const isDark = (row: number, col: number): boolean => {
    const innerRow = row - quietZone;
    const innerCol = col - quietZone;
    return innerRow >= 0 && innerRow < size && innerCol >= 0 && innerCol < size && modules[innerRow][innerCol];
  };
  const lines: string[] = [];
  for (let row = 0; row < full; row += 2) {
    let line = '';
    for (let col = 0; col < full; col += 1) {
      line += HALF_BLOCKS[(isDark(row, col) ? 1 : 0) | (isDark(row + 1, col) ? 2 : 0)];
    }
    lines.push(line);
  }
  return lines.join('\n');
}

/** Parse the param box: L/M/Q/H (any case, or low/medium/quartile/high), blank means M. */
export function parseQrLevel(raw?: string): QrLevel {
  const text = (raw ?? '').trim().toUpperCase();
  if (text === '') return 'M';
  const named: Record<string, QrLevel> = { LOW: 'L', MEDIUM: 'M', QUARTILE: 'Q', HIGH: 'H' };
  const level = named[text] ?? text;
  if (level === 'L' || level === 'M' || level === 'Q' || level === 'H') return level;
  throw new Error(`error correction must be L, M, Q or H, got "${raw}"`);
}

const utf8Encoder = new TextEncoder();

/** The transform: text -> half-block QR code. Empty input gives empty output. */
function qrEncode(input: string, param?: string): string {
  const level = parseQrLevel(param);
  if (input === '') return '';
  return renderHalfBlocks(encodeQr(utf8Encoder.encode(input), level).modules);
}

export const QR_TRANSFORMS: DashTransform[] = [
  {
    id: 'qr',
    label: 'qr code',
    group: 'codes',
    enc: qrEncode,
    dec: null,
    note: 'A scannable QR code drawn with Unicode half blocks: scan it from the screen or paste it into '
      + 'anything that shows a monospace font. Scanners read it as dark text on a light background. '
      + 'Error correction L, M, Q or H recovers about 7, 15, 25 or 30% damage; higher levels make '
      + 'a bigger code. Encode only.',
    param: { label: 'error correction', default: 'M', hint: 'L, M, Q or H' },
  },
];
