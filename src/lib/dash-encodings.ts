// Author: Claude Opus 5.5
// Date: 23-Nov-2026
// PURPOSE: Byte-level and code-level encoders for the DASH page, all in the 'encoders' group.
//          Every transform works on the UTF-8 bytes of the input unless its note says otherwise,
//          and each one is written from its published definition:
//            base32 / base32hex  RFC 4648 sections 6 and 7 (with '=' padding)
//            base64url           RFC 4648 section 5 (URL-safe alphabet, padding left off)
//            base36 / base58 / base62  the bytes read as one big-endian integer; each leading zero
//                                byte is kept as one zero digit (Bitcoin base58 convention, '1')
//            ascii85             Adobe flavour: <~ ~> delimiters, 'z' for four zero bytes
//            z85                 ZeroMQ RFC 32; input padded to a multiple of 4 bytes and the pad
//                                count recorded as a '~N' suffix so any length round-trips
//            base91              basE91 (Joachim Henke's published algorithm)
//            base45              RFC 9285
//            uuencode            classic begin/end block, 45 bytes per line, '`' for zero
//            quoted-printable    RFC 2045 section 6.7 (=XX escapes, soft breaks at 76 columns)
//            html entities       every character except ASCII letters, digits, space and line
//                                feed becomes &#xHEX;; decode reads numeric and common named ones
//            octal / decimal     one number per byte
//            xor                 repeating-key XOR (key is the param), shown as hex
//            bitwise not         every byte inverted, shown as hex
//            gray code           each byte as its 8-bit reflected binary Gray code
//            manchester          IEEE 802.3 line code (0 -> 10, 1 -> 01), 16 symbols per byte
//            baudot              ITA2 with LTRS/FIGS shifts, 5-bit groups in tape order
//            ebcdic              IBM code page 037, shown as hex
//            bcd                 binary-coded decimal, 4 bits per digit
//            brainfuck           a compact program that prints the text; decode runs it
//            code points         U+XXXX per character
//          Every function is pure (no DOM, no network, no randomness, no runtime imports) so the
//          node test suite can transpile and load this file on its own
//          (tests/dash-encodings.test.mjs). The DASH page appends ENCODING_TRANSFORMS to its
//          registry, so the same transforms appear on voynichlabs.org/dash and markbarney.net/dash.
//          Decoders throw an Error with a plain reason on bad input; the page shows that message.
//          SHARED FILE: the master copy is VoynichLabs/voynich-website src/lib/; markbarney.net
//          (82deutschmark/MarkSite) keeps an identical copy in client/src/lib/dash/. Edit the master,
//          then copy it across unchanged.
// SRP/DRY check: Pass - checked dash-transforms.ts and dash-glyphs.ts; none of these encoders
//          existed (base64, hex, binary, ascii, url, unicodeescape stay where they are). The
//          bit-packing bases share encodeBitGroups/decodeBitGroups, the big-integer bases share
//          one divide-and-conquer converter, and every hex-output transform shares one hex codec.

import type { DashTransform } from './dash-glyphs';

// ---------------------------------------------------------------------------------------------
// shared helpers: UTF-8, hex, token parsing
// ---------------------------------------------------------------------------------------------

const utf8Encoder = new TextEncoder();
// ignoreBOM keeps a leading U+FEFF instead of silently dropping it, so round trips stay exact.
const utf8Decoder = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true });

function utf8Bytes(text: string): Uint8Array {
  return utf8Encoder.encode(text);
}

/** Decode bytes as strict UTF-8; `what` names the bytes in the error message. */
function utf8Text(bytes: Uint8Array, what = 'the decoded bytes'): string {
  try {
    return utf8Decoder.decode(bytes);
  } catch {
    throw new Error(`${what} are not valid UTF-8 text`);
  }
}

const HEX_PAIRS: string[] = Array.from({ length: 256 }, (_unused, byte) => byte.toString(16).padStart(2, '0'));

/** Bytes as lower-case hex pairs separated by spaces (the same look as the base 'hex' transform). */
function bytesToSpacedHex(bytes: Uint8Array): string {
  const pairs = new Array<string>(bytes.length);
  for (let index = 0; index < bytes.length; index++) pairs[index] = HEX_PAIRS[bytes[index]];
  return pairs.join(' ');
}

/** Read hex back into bytes. Accepts spaces, commas, colons and 0x prefixes between bytes. */
function spacedHexToBytes(input: string): Uint8Array {
  const digits = input.replace(/0x/gi, '').replace(/[\s,:]+/g, '');
  const bad = digits.match(/[^0-9a-fA-F]/);
  if (bad) throw new Error(`${JSON.stringify(bad[0])} is not a hex digit`);
  if (digits.length % 2 !== 0) throw new Error('hex has an odd number of digits, so the last byte is cut short');
  const bytes = new Uint8Array(digits.length / 2);
  for (let index = 0; index < bytes.length; index++) {
    bytes[index] = parseInt(digits.substr(index * 2, 2), 16);
  }
  return bytes;
}

/** Split on whitespace and commas, dropping empties. */
function tokens(input: string): string[] {
  return input.split(/[\s,]+/).filter(Boolean);
}

/** Strip whitespace from a bit string and check it only holds 0/1 in whole groups of `size`. */
function bitString(input: string, size: number, what: string): string {
  const bits = input.replace(/\s+/g, '');
  const bad = bits.match(/[^01]/);
  if (bad) throw new Error(`${JSON.stringify(bad[0])} is not a bit (only 0 and 1 are allowed)`);
  if (bits.length % size !== 0) {
    throw new Error(`${what} come in groups of ${size} bits, but there are ${bits.length} bits`);
  }
  return bits;
}

/** Case-fold ASCII letters only. String.prototype.toUpperCase/toLowerCase also map non-ASCII
 *  letters onto ASCII ones (dotless i -> I, long s -> S, Kelvin sign -> k), which would let
 *  garbage decode silently instead of being reported. */
function asciiUpper(text: string): string {
  return text.replace(/[a-z]+/g, (run) => run.toUpperCase());
}

function asciiLower(text: string): string {
  return text.replace(/[A-Z]+/g, (run) => run.toLowerCase());
}

/** Lookup table from alphabet character to digit value. */
function alphabetIndex(alphabet: string): Map<string, number> {
  return new Map(Array.from(alphabet, (char, index) => [char, index] as [string, number]));
}

/** Throws a readable error for a character outside an alphabet. */
function badCharacter(char: string, name: string): Error {
  return new Error(`${JSON.stringify(char)} is not a ${name} character`);
}

// ---------------------------------------------------------------------------------------------
// bit-packing bases: base32, base32hex (RFC 4648 sections 6-7) and base64url (section 5)
// ---------------------------------------------------------------------------------------------

/** Pack bytes into `bitsPerChar`-bit symbols, most significant bit first; pad with '=' to a
 *  multiple of `padTo` characters when padTo > 1. */
function encodeBitGroups(bytes: Uint8Array, alphabet: string, bitsPerChar: number, padTo: number): string {
  const out: string[] = [];
  const mask = (1 << bitsPerChar) - 1;
  let buffer = 0;
  let bufferedBits = 0;
  for (let index = 0; index < bytes.length; index++) {
    buffer = (buffer << 8) | bytes[index];
    bufferedBits += 8;
    while (bufferedBits >= bitsPerChar) {
      bufferedBits -= bitsPerChar;
      out.push(alphabet[(buffer >>> bufferedBits) & mask]);
    }
    buffer &= (1 << bufferedBits) - 1;
  }
  if (bufferedBits > 0) out.push(alphabet[(buffer << (bitsPerChar - bufferedBits)) & mask]);
  if (padTo > 1) while (out.length % padTo !== 0) out.push('=');
  return out.join('');
}

function decodeBitGroups(input: string, alphabet: string, bitsPerChar: number, name: string, foldCase: boolean): Uint8Array {
  let body = input.replace(/\s+/g, '');
  if (foldCase) body = asciiUpper(body);
  body = body.replace(/=+$/, '');
  const lookup = alphabetIndex(alphabet);
  const totalBits = body.length * bitsPerChar;
  // A final character that carries no whole byte means the text was cut short.
  if (totalBits % 8 >= bitsPerChar) throw new Error(`${name} text has the wrong length (it looks truncated)`);
  const bytes = new Uint8Array(Math.floor(totalBits / 8));
  let buffer = 0;
  let bufferedBits = 0;
  let written = 0;
  for (const char of body) {
    const value = lookup.get(char);
    if (value === undefined) {
      throw char === '=' ? new Error(`"=" padding can only appear at the end of ${name}`) : badCharacter(char, name);
    }
    buffer = (buffer << bitsPerChar) | value;
    bufferedBits += bitsPerChar;
    if (bufferedBits >= 8) {
      bufferedBits -= 8;
      bytes[written++] = (buffer >>> bufferedBits) & 0xff;
      buffer &= (1 << bufferedBits) - 1;
    }
  }
  return bytes;
}

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const BASE32HEX_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUV';
const BASE64URL_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

// ---------------------------------------------------------------------------------------------
// big-integer bases: base36, base58 (Bitcoin), base62.
// The bytes are one big-endian number. Naive digit-by-digit conversion is quadratic and far too
// slow for 50 KB, so both directions split the number in halves by powers of the base and let
// BigInt's sub-quadratic multiply/divide do the heavy lifting.
// ---------------------------------------------------------------------------------------------

/** Most digits of `base` whose value still fits exactly in a double. */
function chunkDigitCount(base: number): number {
  let count = 0;
  let power = 1;
  while (power * base <= 2 ** 53) {
    power *= base;
    count++;
  }
  return count;
}

function bytesToBigInt(bytes: Uint8Array): bigint {
  if (bytes.length === 0) return 0n;
  const pairs = new Array<string>(bytes.length);
  for (let index = 0; index < bytes.length; index++) pairs[index] = HEX_PAIRS[bytes[index]];
  return BigInt(`0x${pairs.join('')}`);
}

function bigIntToBytes(value: bigint): Uint8Array {
  if (value === 0n) return new Uint8Array(0);
  let hex = value.toString(16);
  if (hex.length % 2 !== 0) hex = `0${hex}`;
  const bytes = new Uint8Array(hex.length / 2);
  for (let index = 0; index < bytes.length; index++) bytes[index] = parseInt(hex.substr(index * 2, 2), 16);
  return bytes;
}

/** Digits of `value` in `base`, most significant first, with no leading zeros (0 -> []). */
function bigIntToDigits(value: bigint, base: number): number[] {
  const digits: number[] = [];
  if (value === 0n) return digits;
  const chunk = chunkDigitCount(base);
  // powers[level] = base^(chunk * 2^level); stop once the next square would exceed the value.
  const powers: bigint[] = [BigInt(base) ** BigInt(chunk)];
  for (;;) {
    const last = powers[powers.length - 1];
    const next = last * last;
    if (next > value) break;
    powers.push(next);
  }
  const emitSmall = (small: number, pad: boolean): void => {
    const local: number[] = [];
    let rest = small;
    while (rest > 0) {
      local.push(rest % base);
      rest = Math.floor(rest / base);
    }
    if (pad) while (local.length < chunk) local.push(0);
    for (let index = local.length - 1; index >= 0; index--) digits.push(local[index]);
  };
  // `part` is below powers[level]^2, so splitting by powers[level] gives two halves that each fit
  // the level below. `pad` is false only along the leading edge, where zeros must not be written.
  const emit = (part: bigint, level: number, pad: boolean): void => {
    if (level < 0) {
      emitSmall(Number(part), pad);
      return;
    }
    const divisor = powers[level];
    if (!pad && part < divisor) {
      emit(part, level - 1, false);
      return;
    }
    const high = part / divisor;
    emit(high, level - 1, pad);
    emit(part - high * divisor, level - 1, true);
  };
  emit(value, powers.length - 1, false);
  return digits;
}

/** Inverse of bigIntToDigits: combine fixed-size chunks pairwise, least significant first. */
function digitsToBigInt(digits: number[], base: number): bigint {
  if (digits.length === 0) return 0n;
  const chunk = chunkDigitCount(base);
  let parts: bigint[] = [];
  for (let end = digits.length; end > 0; end -= chunk) {
    let small = 0;
    for (let index = Math.max(0, end - chunk); index < end; index++) small = small * base + digits[index];
    parts.push(BigInt(small));
  }
  let power = BigInt(base) ** BigInt(chunk);
  while (parts.length > 1) {
    const merged: bigint[] = [];
    for (let index = 0; index < parts.length; index += 2) {
      merged.push(index + 1 < parts.length ? parts[index + 1] * power + parts[index] : parts[index]);
    }
    parts = merged;
    power *= power;
  }
  return parts[0];
}

/** Encode bytes in a big-integer base. Each leading zero byte becomes one alphabet[0]. */
function bigBaseEncode(bytes: Uint8Array, alphabet: string): string {
  let zeros = 0;
  while (zeros < bytes.length && bytes[zeros] === 0) zeros++;
  const digits = bigIntToDigits(bytesToBigInt(bytes.subarray(zeros)), alphabet.length);
  const chars = new Array<string>(digits.length);
  for (let index = 0; index < digits.length; index++) chars[index] = alphabet[digits[index]];
  return alphabet[0].repeat(zeros) + chars.join('');
}

function bigBaseDecode(input: string, alphabet: string, name: string, hint = ''): Uint8Array {
  const lookup = alphabetIndex(alphabet);
  const body = input.replace(/\s+/g, '');
  const digits = new Array<number>(body.length);
  let count = 0;
  for (const char of body) {
    const value = lookup.get(char);
    if (value === undefined) {
      const error = badCharacter(char, name);
      throw hint ? new Error(`${error.message} (${hint})`) : error;
    }
    digits[count++] = value;
  }
  digits.length = count;
  let zeros = 0;
  while (zeros < digits.length && digits[zeros] === 0) zeros++;
  const rest = bigIntToBytes(digitsToBigInt(digits.slice(zeros), alphabet.length));
  const bytes = new Uint8Array(zeros + rest.length);
  bytes.set(rest, zeros);
  return bytes;
}

const BASE36_ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyz';
const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const BASE62_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

// ---------------------------------------------------------------------------------------------
// ascii85 (Adobe) and z85 (ZeroMQ RFC 32): 4 bytes -> 5 base-85 digits
// ---------------------------------------------------------------------------------------------

/** Read four bytes (zero-filled past the end) as an unsigned 32-bit big-endian number. */
function readWord(bytes: Uint8Array, offset: number): number {
  let value = 0;
  for (let index = 0; index < 4; index++) {
    value = value * 256 + (offset + index < bytes.length ? bytes[offset + index] : 0);
  }
  return value;
}

/** Five base-85 digits of a 32-bit word, most significant first. */
function wordToBase85(word: number): number[] {
  const digits = [0, 0, 0, 0, 0];
  let rest = word;
  for (let index = 4; index >= 0; index--) {
    digits[index] = rest % 85;
    rest = Math.floor(rest / 85);
  }
  return digits;
}

function pushWord(out: number[], word: number, count: number): void {
  const bytes = [word >>> 24, (word >>> 16) & 0xff, (word >>> 8) & 0xff, word & 0xff];
  for (let index = 0; index < count; index++) out.push(bytes[index]);
}

function ascii85Encode(input: string): string {
  const bytes = utf8Bytes(input);
  const out: string[] = ['<~'];
  for (let offset = 0; offset < bytes.length; offset += 4) {
    const groupSize = Math.min(4, bytes.length - offset);
    const word = readWord(bytes, offset);
    if (groupSize === 4 && word === 0) {
      out.push('z');
      continue;
    }
    // A short final group of n bytes is written as its first n + 1 digits.
    const digits = wordToBase85(word).slice(0, groupSize + 1);
    out.push(String.fromCharCode(...digits.map((digit) => digit + 33)));
  }
  out.push('~>');
  return out.join('');
}

function ascii85Decode(input: string): string {
  let body = input.replace(/\s+/g, '');
  if (body.startsWith('<~')) body = body.slice(2);
  if (body.endsWith('~>')) body = body.slice(0, -2);
  const out: number[] = [];
  const group: number[] = [];
  const flush = (size: number): void => {
    while (group.length < 5) group.push(84); // pad a short group with 'u'
    const word = group.reduce((total, digit) => total * 85 + digit, 0);
    if (word > 0xffffffff) throw new Error('an ascii85 group is larger than 4 bytes can hold');
    pushWord(out, word, size);
    group.length = 0;
  };
  for (const char of body) {
    if (char === 'z') {
      if (group.length > 0) throw new Error('"z" can only stand for a whole group, not sit inside one');
      out.push(0, 0, 0, 0);
      continue;
    }
    const code = char.charCodeAt(0);
    if (code < 33 || code > 117) throw badCharacter(char, 'ascii85');
    group.push(code - 33);
    if (group.length === 5) flush(4);
  }
  if (group.length === 1) throw new Error('ascii85 ends with a single stray character (it looks truncated)');
  if (group.length > 1) flush(group.length - 1);
  return utf8Text(Uint8Array.from(out));
}

const Z85_ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.-:+=^!/*?&<>()[]{}@%$#';

/** Z85 of raw bytes whose length is a multiple of 4 (the spec's own requirement). */
export function z85EncodeBytes(bytes: Uint8Array): string {
  if (bytes.length % 4 !== 0) throw new Error('Z85 needs a multiple of 4 bytes');
  const out: string[] = [];
  for (let offset = 0; offset < bytes.length; offset += 4) {
    for (const digit of wordToBase85(readWord(bytes, offset))) out.push(Z85_ALPHABET[digit]);
  }
  return out.join('');
}

export function z85DecodeBytes(input: string): Uint8Array {
  const body = input.replace(/\s+/g, '');
  if (body.length % 5 !== 0) throw new Error(`Z85 comes in groups of 5 characters, but there are ${body.length}`);
  const lookup = alphabetIndex(Z85_ALPHABET);
  const out: number[] = [];
  for (let offset = 0; offset < body.length; offset += 5) {
    let word = 0;
    for (let index = 0; index < 5; index++) {
      const value = lookup.get(body[offset + index]);
      if (value === undefined) throw badCharacter(body[offset + index], 'Z85');
      word = word * 85 + value;
    }
    if (word > 0xffffffff) throw new Error('a Z85 group is larger than 4 bytes can hold');
    pushWord(out, word, 4);
  }
  return Uint8Array.from(out);
}

/** Z85 for any length: zero-pad to a multiple of 4 and append "~N" (N = pad bytes) when N > 0. */
function z85Encode(input: string): string {
  const bytes = utf8Bytes(input);
  const pad = (4 - (bytes.length % 4)) % 4;
  const padded = new Uint8Array(bytes.length + pad);
  padded.set(bytes);
  return z85EncodeBytes(padded) + (pad > 0 ? `~${pad}` : '');
}

function z85Decode(input: string): string {
  const trimmed = input.trim();
  const suffix = trimmed.match(/~([0-3])$/);
  const pad = suffix ? Number(suffix[1]) : 0;
  const bytes = z85DecodeBytes(suffix ? trimmed.slice(0, -2) : trimmed);
  if (pad > bytes.length) throw new Error('the ~N padding marker is longer than the data');
  return utf8Text(bytes.subarray(0, bytes.length - pad));
}

// ---------------------------------------------------------------------------------------------
// basE91: 13- or 14-bit chunks written as two base-91 digits, low digit first
// ---------------------------------------------------------------------------------------------

const BASE91_ALPHABET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!#$%&()*+,./:;<=>?@[]^_`{|}~"';

function base91Encode(input: string): string {
  const bytes = utf8Bytes(input);
  const out: string[] = [];
  let queue = 0;
  let queuedBits = 0;
  for (let index = 0; index < bytes.length; index++) {
    queue |= bytes[index] << queuedBits;
    queuedBits += 8;
    if (queuedBits > 13) {
      // Take 13 bits, unless their value is small enough that a 14th bit still fits in 91*91.
      let value = queue & 8191;
      if (value > 88) {
        queue >>>= 13;
        queuedBits -= 13;
      } else {
        value = queue & 16383;
        queue >>>= 14;
        queuedBits -= 14;
      }
      out.push(BASE91_ALPHABET[value % 91], BASE91_ALPHABET[Math.floor(value / 91)]);
    }
  }
  if (queuedBits > 0) {
    out.push(BASE91_ALPHABET[queue % 91]);
    if (queuedBits > 7 || queue > 90) out.push(BASE91_ALPHABET[Math.floor(queue / 91)]);
  }
  return out.join('');
}

function base91Decode(input: string): string {
  const lookup = alphabetIndex(BASE91_ALPHABET);
  const out: number[] = [];
  let queue = 0;
  let queuedBits = 0;
  let pending = -1;
  for (const char of input.replace(/\s+/g, '')) {
    const digit = lookup.get(char);
    if (digit === undefined) throw badCharacter(char, 'basE91');
    if (pending < 0) {
      pending = digit;
      continue;
    }
    // Every pair is valid: values 0-88 and 8192-8280 are 14-bit chunks, 89-8191 are 13-bit ones.
    const value = pending + digit * 91;
    queue |= value << queuedBits;
    queuedBits += (value & 8191) > 88 ? 13 : 14;
    do {
      out.push(queue & 0xff);
      queue >>>= 8;
      queuedBits -= 8;
    } while (queuedBits > 7);
    pending = -1;
  }
  if (pending >= 0) out.push((queue | (pending << queuedBits)) & 0xff);
  return utf8Text(Uint8Array.from(out));
}

// ---------------------------------------------------------------------------------------------
// base45 (RFC 9285): 2 bytes -> 3 digits, a lone last byte -> 2 digits, least significant first
// ---------------------------------------------------------------------------------------------

const BASE45_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:';

function base45Encode(input: string): string {
  const bytes = utf8Bytes(input);
  const out: string[] = [];
  for (let offset = 0; offset < bytes.length; offset += 2) {
    if (offset + 1 < bytes.length) {
      const value = bytes[offset] * 256 + bytes[offset + 1];
      out.push(BASE45_ALPHABET[value % 45], BASE45_ALPHABET[Math.floor(value / 45) % 45], BASE45_ALPHABET[Math.floor(value / 2025)]);
    } else {
      const value = bytes[offset];
      out.push(BASE45_ALPHABET[value % 45], BASE45_ALPHABET[Math.floor(value / 45)]);
    }
  }
  return out.join('');
}

function base45Decode(input: string): string {
  // Space is a base45 digit, so only line breaks are ignored.
  const body = input.replace(/[\r\n]+/g, '');
  if (body.length % 3 === 1) throw new Error('base45 text has the wrong length (it looks truncated)');
  const lookup = alphabetIndex(BASE45_ALPHABET);
  const digitAt = (index: number): number => {
    const value = lookup.get(body[index]);
    if (value === undefined) throw badCharacter(body[index], 'base45');
    return value;
  };
  const out: number[] = [];
  for (let offset = 0; offset < body.length; offset += 3) {
    if (offset + 2 < body.length) {
      const value = digitAt(offset) + digitAt(offset + 1) * 45 + digitAt(offset + 2) * 2025;
      if (value > 0xffff) throw new Error(`base45 group ${JSON.stringify(body.substr(offset, 3))} is larger than 2 bytes`);
      out.push(value >> 8, value & 0xff);
    } else {
      const value = digitAt(offset) + digitAt(offset + 1) * 45;
      if (value > 0xff) throw new Error(`base45 pair ${JSON.stringify(body.substr(offset, 2))} is larger than 1 byte`);
      out.push(value);
    }
  }
  return utf8Text(Uint8Array.from(out));
}

// ---------------------------------------------------------------------------------------------
// uuencode: "begin 644 name", then lines of up to 45 bytes, then a "`" line and "end"
// ---------------------------------------------------------------------------------------------

const UU_LINE_BYTES = 45;

/** One 6-bit value as a uuencode character; zero is written as '`' rather than a space. */
function uuChar(value: number): string {
  return value === 0 ? '`' : String.fromCharCode(32 + value);
}

function uuencode(input: string): string {
  const bytes = utf8Bytes(input);
  const lines = ['begin 644 dash.txt'];
  for (let start = 0; start < bytes.length; start += UU_LINE_BYTES) {
    const end = Math.min(start + UU_LINE_BYTES, bytes.length);
    const line: string[] = [uuChar(end - start)];
    for (let offset = start; offset < end; offset += 3) {
      const first = bytes[offset];
      const second = offset + 1 < end ? bytes[offset + 1] : 0;
      const third = offset + 2 < end ? bytes[offset + 2] : 0;
      line.push(
        uuChar(first >> 2),
        uuChar(((first & 3) << 4) | (second >> 4)),
        uuChar(((second & 15) << 2) | (third >> 6)),
        uuChar(third & 63),
      );
    }
    lines.push(line.join(''));
  }
  lines.push('`', 'end');
  return lines.join('\n');
}

function uudecode(input: string): string {
  const lines = input.split(/\r?\n/);
  const beginIndex = lines.findIndex((line) => /^begin(\s|$)/.test(line.trim()));
  const out: number[] = [];
  for (let lineIndex = beginIndex + 1; lineIndex < lines.length; lineIndex++) {
    // Only a CR is trimmed: old encoders write zero as a space, so trailing spaces are data.
    const line = lines[lineIndex].replace(/\r$/, '');
    if (line.trim() === 'end') break;
    if (line.trim() === '') continue;
    const values: number[] = [];
    for (const char of line) {
      const code = char.charCodeAt(0);
      if (code < 32 || code > 96) throw new Error(`line ${lineIndex + 1}: ${JSON.stringify(char)} is not a uuencode character`);
      values.push((code - 32) & 63);
    }
    const length = values[0];
    if (length === 0) continue; // the terminating "`" line
    if (values.length - 1 < Math.ceil((length * 4) / 3)) {
      throw new Error(`line ${lineIndex + 1} promises ${length} bytes but is too short`);
    }
    for (let produced = 0, index = 1; produced < length; index += 4) {
      const [a, b, c, d] = [values[index] ?? 0, values[index + 1] ?? 0, values[index + 2] ?? 0, values[index + 3] ?? 0];
      const group = [(a << 2) | (b >> 4), ((b & 15) << 4) | (c >> 2), ((c & 3) << 6) | d];
      for (const byte of group) if (produced++ < length) out.push(byte & 0xff);
    }
  }
  return utf8Text(Uint8Array.from(out));
}

// ---------------------------------------------------------------------------------------------
// quoted-printable (RFC 2045 6.7). Line feeds are hard breaks; CR is escaped as =0D so a round
// trip is exact. Encoded lines stay at 76 columns or less, using "=" soft breaks.
// ---------------------------------------------------------------------------------------------

const QP_MAX_CONTENT = 75; // 75 characters plus the "=" of a soft break makes 76

function qpEncodeLine(line: string): string {
  const bytes = utf8Bytes(line);
  const segments: string[] = [];
  let current = '';
  for (let index = 0; index < bytes.length; index++) {
    const byte = bytes[index];
    const isLast = index === bytes.length - 1;
    // Printable ASCII except "=" is literal; space and tab too, unless they would end the line.
    const literal = (byte >= 33 && byte <= 126 && byte !== 61) || ((byte === 32 || byte === 9) && !isLast);
    const token = literal ? String.fromCharCode(byte) : `=${HEX_PAIRS[byte].toUpperCase()}`;
    if (current.length + token.length > QP_MAX_CONTENT) {
      segments.push(`${current}=`);
      current = '';
    }
    current += token;
  }
  segments.push(current);
  return segments.join('\n');
}

function quotedPrintableEncode(input: string): string {
  return input.split('\n').map(qpEncodeLine).join('\n');
}

/** Drop the spaces and tabs at the end of each line (before any CR). Done by hand rather than
 *  with a /[ \t]+(?=\r?\n|$)/ regex, which backtracks quadratically on a long run of spaces. */
function stripTrailingBlanks(text: string): string {
  return text.split('\n').map((line) => {
    const hasCr = line.endsWith('\r');
    let end = hasCr ? line.length - 1 : line.length;
    while (end > 0 && (line[end - 1] === ' ' || line[end - 1] === '\t')) end--;
    return hasCr ? `${line.slice(0, end)}\r` : line.slice(0, end);
  }).join('\n');
}

function quotedPrintableDecode(input: string): string {
  // RFC 2045: trailing whitespace on a line was added in transport and must be removed; "=" at
  // the end of a line is a soft break that joins it to the next line. A lone "=" at the very end
  // of the text is a soft break too ('=' is not a hex digit, so it cannot end an =XX escape).
  const text = stripTrailingBlanks(input).replace(/=\r?\n/g, '').replace(/=$/, '');
  const parts: Uint8Array[] = [];
  let literalStart = 0;
  let index = text.indexOf('=');
  while (index !== -1) {
    const hex = text.substr(index + 1, 2);
    if (!/^[0-9A-Fa-f]{2}$/.test(hex)) {
      throw new Error(`"=" at position ${index + 1} is not followed by two hex digits`);
    }
    parts.push(utf8Bytes(text.slice(literalStart, index)), Uint8Array.of(parseInt(hex, 16)));
    literalStart = index + 3;
    index = text.indexOf('=', literalStart);
  }
  parts.push(utf8Bytes(text.slice(literalStart)));
  const bytes = new Uint8Array(parts.reduce((total, part) => total + part.length, 0));
  let offset = 0;
  for (const part of parts) {
    bytes.set(part, offset);
    offset += part.length;
  }
  return utf8Text(bytes);
}

// ---------------------------------------------------------------------------------------------
// HTML entities
// ---------------------------------------------------------------------------------------------

/** Common named entities (HTML Living Standard names), decoded only. */
const NAMED_ENTITIES: Record<string, string> = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', copy: '©', reg: '®',
  trade: '™', hellip: '…', mdash: '—', ndash: '–', lsquo: '‘', rsquo: '’',
  ldquo: '“', rdquo: '”', laquo: '«', raquo: '»', bull: '•', middot: '·',
  euro: '€', pound: '£', yen: '¥', cent: '¢', sect: '§', para: '¶',
  deg: '°', plusmn: '±', times: '×', divide: '÷', iexcl: '¡', iquest: '¿',
  shy: '­', zwj: '‍', zwnj: '‌', larr: '←', rarr: '→', uarr: '↑',
  darr: '↓', hearts: '♥', check: '✓',
};

function htmlEntitiesEncode(input: string): string {
  return Array.from(input, (char) => {
    if (/^[A-Za-z0-9 \n]$/.test(char)) return char;
    return `&#x${(char.codePointAt(0) ?? 0).toString(16).toUpperCase()};`;
  }).join('');
}

function htmlEntitiesDecode(input: string): string {
  return input.replace(/&(#[xX][0-9a-fA-F]+|#[0-9]+|[A-Za-z][A-Za-z0-9]*);/g, (match, body: string) => {
    // Own keys only (unknown names are left alone): a plain lookup would turn &constructor; or
    // &toString; into function source text from Object.prototype.
    if (body[0] !== '#') return Object.hasOwn(NAMED_ENTITIES, body) ? NAMED_ENTITIES[body] : match;
    const codePoint = body[1] === 'x' || body[1] === 'X' ? parseInt(body.slice(2), 16) : parseInt(body.slice(1), 10);
    if (!(codePoint <= 0x10ffff)) throw new Error(`${match} is beyond the last Unicode code point`);
    return String.fromCodePoint(codePoint);
  });
}

// ---------------------------------------------------------------------------------------------
// one number per byte: octal and decimal
// ---------------------------------------------------------------------------------------------

function octalEncode(input: string): string {
  return Array.from(utf8Bytes(input), (byte) => byte.toString(8).padStart(3, '0')).join(' ');
}

function octalDecode(input: string): string {
  // A backslash starts a new byte, so run-together escapes like \101\102 split cleanly.
  const bytes = tokens(input.replace(/\\/g, ' \\')).map((token) => {
    const digits = token.replace(/^(\\|0o)/i, '');
    if (!/^[0-7]{1,3}$/.test(digits) || parseInt(digits, 8) > 255) {
      throw new Error(`${JSON.stringify(token)} is not an octal byte (000 to 377)`);
    }
    return parseInt(digits, 8);
  });
  return utf8Text(Uint8Array.from(bytes));
}

function decimalEncode(input: string): string {
  return Array.from(utf8Bytes(input), (byte) => String(byte)).join(' ');
}

function decimalDecode(input: string): string {
  const bytes = tokens(input).map((token) => {
    if (!/^\d{1,3}$/.test(token) || Number(token) > 255) throw new Error(`${JSON.stringify(token)} is not a byte (0 to 255)`);
    return Number(token);
  });
  return utf8Text(Uint8Array.from(bytes));
}

// ---------------------------------------------------------------------------------------------
// byte masks shown as hex: xor, bitwise not
// ---------------------------------------------------------------------------------------------

export const XOR_DEFAULT_KEY = 'key';

/** The XOR key bytes; a missing or blank param falls back to the default key. */
function xorKeyBytes(param?: string): Uint8Array {
  return utf8Bytes(param !== undefined && param.trim() !== '' ? param : XOR_DEFAULT_KEY);
}

function xorBytes(bytes: Uint8Array, key: Uint8Array): Uint8Array {
  const out = new Uint8Array(bytes.length);
  for (let index = 0; index < bytes.length; index++) out[index] = bytes[index] ^ key[index % key.length];
  return out;
}

function xorEncode(input: string, param?: string): string {
  return bytesToSpacedHex(xorBytes(utf8Bytes(input), xorKeyBytes(param)));
}

function xorDecode(input: string, param?: string): string {
  return utf8Text(xorBytes(spacedHexToBytes(input), xorKeyBytes(param)), 'the unmasked bytes (wrong key?)');
}

function invertBytes(bytes: Uint8Array): Uint8Array {
  const out = new Uint8Array(bytes.length);
  for (let index = 0; index < bytes.length; index++) out[index] = ~bytes[index] & 0xff;
  return out;
}

function bitNotEncode(input: string): string {
  return bytesToSpacedHex(invertBytes(utf8Bytes(input)));
}

function bitNotDecode(input: string): string {
  return utf8Text(invertBytes(spacedHexToBytes(input)));
}

// ---------------------------------------------------------------------------------------------
// line and bit codes: gray code, manchester
// ---------------------------------------------------------------------------------------------

function grayEncode(input: string): string {
  return Array.from(utf8Bytes(input), (byte) => (byte ^ (byte >> 1)).toString(2).padStart(8, '0')).join(' ');
}

function grayDecode(input: string): string {
  const bits = bitString(input, 8, 'Gray codes');
  const bytes = new Uint8Array(bits.length / 8);
  for (let index = 0; index < bytes.length; index++) {
    // Undo the Gray code by folding every higher bit back in: b = g ^ g>>1 ^ g>>2 ^ ...
    let value = parseInt(bits.substr(index * 8, 8), 2);
    value ^= value >> 1;
    value ^= value >> 2;
    value ^= value >> 4;
    bytes[index] = value;
  }
  return utf8Text(bytes);
}

function manchesterEncode(input: string): string {
  return Array.from(utf8Bytes(input), (byte) => {
    let symbols = '';
    for (let bit = 7; bit >= 0; bit--) symbols += (byte >> bit) & 1 ? '01' : '10';
    return symbols;
  }).join(' ');
}

function manchesterDecode(input: string): string {
  const symbols = bitString(input, 16, 'Manchester bytes');
  const bytes = new Uint8Array(symbols.length / 16);
  for (let index = 0; index < bytes.length; index++) {
    let value = 0;
    for (let bit = 0; bit < 8; bit++) {
      const pair = symbols.substr(index * 16 + bit * 2, 2);
      if (pair !== '01' && pair !== '10') {
        throw new Error(`"${pair}" at byte ${index + 1} is not a Manchester bit (only 01 and 10 are)`);
      }
      value = (value << 1) | (pair === '01' ? 1 : 0);
    }
    bytes[index] = value;
  }
  return utf8Text(bytes);
}

// ---------------------------------------------------------------------------------------------
// Baudot-Murray ITA2. Index = code value with bit 1 as the least significant bit. Shown in tape
// order, bit 1 first (A = 11000). F, G and H figures are national-use slots; the common
// ! & # choices are used. D figures (WRU) maps to ENQ and J figures to BEL.
// ---------------------------------------------------------------------------------------------

const ITA2_FIGS = 27;
const ITA2_LTRS = 31;
const ITA2_LETTERS = '\0E\nA SIU\rDRJNFCKTZLWHYPQOBG\0MXV\0';
const ITA2_FIGURES = "\x003\n- '87\r\x054\x07,!:(5+)2#6019?&\0./=\0";
const ITA2_LETTER_CODES = new Map<string, number>();
const ITA2_FIGURE_CODES = new Map<string, number>();
for (let code = 1; code < 32; code++) {
  if (code === ITA2_FIGS || code === ITA2_LTRS) continue;
  ITA2_LETTER_CODES.set(ITA2_LETTERS[code], code);
  ITA2_FIGURE_CODES.set(ITA2_FIGURES[code], code);
}

function ita2Group(code: number): string {
  let bits = '';
  for (let bit = 0; bit < 5; bit++) bits += (code >> bit) & 1 ? '1' : '0';
  return bits;
}

function baudotEncode(input: string): string {
  const groups: string[] = [];
  let figures = false;
  for (const char of input.toUpperCase()) {
    const letterCode = ITA2_LETTER_CODES.get(char);
    const figureCode = ITA2_FIGURE_CODES.get(char);
    if (letterCode !== undefined && figureCode !== undefined) {
      groups.push(ita2Group(letterCode)); // space, CR and LF exist in both shifts
    } else if (letterCode !== undefined) {
      if (figures) groups.push(ita2Group(ITA2_LTRS));
      figures = false;
      groups.push(ita2Group(letterCode));
    } else if (figureCode !== undefined) {
      if (!figures) groups.push(ita2Group(ITA2_FIGS));
      figures = true;
      groups.push(ita2Group(figureCode));
    }
    // anything else has no ITA2 code and is dropped
  }
  return groups.join(' ');
}

function baudotDecode(input: string): string {
  const bits = bitString(input, 5, 'ITA2 codes');
  let figures = false;
  let out = '';
  for (let offset = 0; offset < bits.length; offset += 5) {
    let code = 0;
    for (let bit = 0; bit < 5; bit++) if (bits[offset + bit] === '1') code |= 1 << bit;
    if (code === 0) continue; // blank tape
    if (code === ITA2_FIGS) figures = true;
    else if (code === ITA2_LTRS) figures = false;
    else out += (figures ? ITA2_FIGURES : ITA2_LETTERS)[code];
  }
  return out;
}

// ---------------------------------------------------------------------------------------------
// EBCDIC, IBM code page 037 (from the Unicode consortium's CP037 mapping). Entry n is the
// Latin-1 code point of EBCDIC byte n; the table is a permutation of 0x00-0xFF.
// ---------------------------------------------------------------------------------------------

const CP037_TO_LATIN1: readonly number[] = [
  0x00, 0x01, 0x02, 0x03, 0x9c, 0x09, 0x86, 0x7f, 0x97, 0x8d, 0x8e, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f,
  0x10, 0x11, 0x12, 0x13, 0x9d, 0x85, 0x08, 0x87, 0x18, 0x19, 0x92, 0x8f, 0x1c, 0x1d, 0x1e, 0x1f,
  0x80, 0x81, 0x82, 0x83, 0x84, 0x0a, 0x17, 0x1b, 0x88, 0x89, 0x8a, 0x8b, 0x8c, 0x05, 0x06, 0x07,
  0x90, 0x91, 0x16, 0x93, 0x94, 0x95, 0x96, 0x04, 0x98, 0x99, 0x9a, 0x9b, 0x14, 0x15, 0x9e, 0x1a,
  0x20, 0xa0, 0xe2, 0xe4, 0xe0, 0xe1, 0xe3, 0xe5, 0xe7, 0xf1, 0xa2, 0x2e, 0x3c, 0x28, 0x2b, 0x7c,
  0x26, 0xe9, 0xea, 0xeb, 0xe8, 0xed, 0xee, 0xef, 0xec, 0xdf, 0x21, 0x24, 0x2a, 0x29, 0x3b, 0xac,
  0x2d, 0x2f, 0xc2, 0xc4, 0xc0, 0xc1, 0xc3, 0xc5, 0xc7, 0xd1, 0xa6, 0x2c, 0x25, 0x5f, 0x3e, 0x3f,
  0xf8, 0xc9, 0xca, 0xcb, 0xc8, 0xcd, 0xce, 0xcf, 0xcc, 0x60, 0x3a, 0x23, 0x40, 0x27, 0x3d, 0x22,
  0xd8, 0x61, 0x62, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68, 0x69, 0xab, 0xbb, 0xf0, 0xfd, 0xfe, 0xb1,
  0xb0, 0x6a, 0x6b, 0x6c, 0x6d, 0x6e, 0x6f, 0x70, 0x71, 0x72, 0xaa, 0xba, 0xe6, 0xb8, 0xc6, 0xa4,
  0xb5, 0x7e, 0x73, 0x74, 0x75, 0x76, 0x77, 0x78, 0x79, 0x7a, 0xa1, 0xbf, 0xd0, 0xdd, 0xde, 0xae,
  0x5e, 0xa3, 0xa5, 0xb7, 0xa9, 0xa7, 0xb6, 0xbc, 0xbd, 0xbe, 0x5b, 0x5d, 0xaf, 0xa8, 0xb4, 0xd7,
  0x7b, 0x41, 0x42, 0x43, 0x44, 0x45, 0x46, 0x47, 0x48, 0x49, 0xad, 0xf4, 0xf6, 0xf2, 0xf3, 0xf5,
  0x7d, 0x4a, 0x4b, 0x4c, 0x4d, 0x4e, 0x4f, 0x50, 0x51, 0x52, 0xb9, 0xfb, 0xfc, 0xf9, 0xfa, 0xff,
  0x5c, 0xf7, 0x53, 0x54, 0x55, 0x56, 0x57, 0x58, 0x59, 0x5a, 0xb2, 0xd4, 0xd6, 0xd2, 0xd3, 0xd5,
  0x30, 0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0xb3, 0xdb, 0xdc, 0xd9, 0xda, 0x9f,
];
const LATIN1_TO_CP037: readonly number[] = (() => {
  const inverse = new Array<number>(256);
  CP037_TO_LATIN1.forEach((codePoint, ebcdic) => { inverse[codePoint] = ebcdic; });
  return inverse;
})();
const CP037_QUESTION_MARK = 0x6f;

function ebcdicEncode(input: string): string {
  const chars = Array.from(input);
  const bytes = new Uint8Array(chars.length);
  chars.forEach((char, index) => {
    const codePoint = char.codePointAt(0) ?? 0;
    bytes[index] = codePoint <= 0xff ? LATIN1_TO_CP037[codePoint] : CP037_QUESTION_MARK;
  });
  return bytesToSpacedHex(bytes);
}

function ebcdicDecode(input: string): string {
  const bytes = spacedHexToBytes(input);
  let out = '';
  for (let index = 0; index < bytes.length; index++) out += String.fromCharCode(CP037_TO_LATIN1[bytes[index]]);
  return out;
}

// ---------------------------------------------------------------------------------------------
// BCD (8421 binary-coded decimal)
// ---------------------------------------------------------------------------------------------

function bcdEncode(input: string): string {
  return Array.from(input.replace(/[^0-9]/g, ''), (digit) => Number(digit).toString(2).padStart(4, '0')).join(' ');
}

function bcdDecode(input: string): string {
  const bits = bitString(input, 4, 'BCD digits');
  let out = '';
  for (let offset = 0; offset < bits.length; offset += 4) {
    const value = parseInt(bits.substr(offset, 4), 2);
    if (value > 9) throw new Error(`${bits.substr(offset, 4)} is not a BCD digit (only 0000 to 1001 are)`);
    out += String(value);
  }
  return out;
}

// ---------------------------------------------------------------------------------------------
// Brainfuck: 8-bit wrapping cells, tape grows to the right.
// Encode keeps the last printed byte in cell 0 and moves it to the next byte by the shorter way
// round, using a multiply loop in cell 1 (">a[<b>-]<c") whenever that is shorter than plain +/-.
// ---------------------------------------------------------------------------------------------

const bfStepCache = new Map<number, string>();

/** Shortest code (of the shapes above) that adds `delta` (-127..128) to cell 0, leaving cell 1 at 0. */
function bfAdjust(delta: number): string {
  const cached = bfStepCache.get(delta);
  if (cached !== undefined) return cached;
  const magnitude = Math.abs(delta);
  const toward = delta > 0 ? '+' : '-';
  const away = delta > 0 ? '-' : '+';
  let best = toward.repeat(magnitude);
  for (let loops = 2; loops <= Math.min(16, magnitude); loops++) {
    const perLoop = Math.round(magnitude / loops);
    if (perLoop < 2) continue;
    const remainder = magnitude - loops * perLoop;
    const code = `>${'+'.repeat(loops)}[<${toward.repeat(perLoop)}>-]<${remainder >= 0 ? toward.repeat(remainder) : away.repeat(-remainder)}`;
    if (code.length < best.length) best = code;
  }
  bfStepCache.set(delta, best);
  return best;
}

function brainfuckEncode(input: string): string {
  const bytes = utf8Bytes(input);
  const parts: string[] = [];
  let cell = 0;
  for (let index = 0; index < bytes.length; index++) {
    let delta = (bytes[index] - cell + 256) % 256;
    if (delta > 128) delta -= 256;
    parts.push(bfAdjust(delta), '.');
    cell = bytes[index];
  }
  return parts.join('');
}

export const BF_STEP_LIMIT = 50_000_000;
/** Most bytes a program may print. Without a cap, "+[.]" fills hundreds of MB of memory before
 *  the step limit stops it. */
export const BF_OUTPUT_LIMIT = 1_000_000;
const BF_TAPE_LIMIT = 1 << 20;

/** Run a Brainfuck program with no input (',' reads 0) and return what it printed. */
function brainfuckDecode(input: string): string {
  // Compile: merge runs of + - < > into one op, pair up brackets.
  const kinds: number[] = []; // 0 add, 1 move, 2 output, 3 input, 4 jump-if-zero, 5 jump-if-not-zero
  const args: number[] = [];
  const open: number[] = [];
  for (let index = 0; index < input.length; index++) {
    const char = input[index];
    if (char === '+' || char === '-' || char === '>' || char === '<') {
      const kind = char === '+' || char === '-' ? 0 : 1;
      const step = char === '+' || char === '>' ? 1 : -1;
      if (kinds.length > 0 && kinds[kinds.length - 1] === kind) args[args.length - 1] += step;
      else { kinds.push(kind); args.push(step); }
    } else if (char === '.') { kinds.push(2); args.push(0); }
    else if (char === ',') { kinds.push(3); args.push(0); }
    else if (char === '[') { open.push(kinds.length); kinds.push(4); args.push(0); }
    else if (char === ']') {
      const start = open.pop();
      if (start === undefined) throw new Error(`unmatched "]" at position ${index + 1}`);
      args[start] = kinds.length;
      kinds.push(5);
      args.push(start);
    }
    // every other character is a comment
  }
  if (open.length > 0) throw new Error(`${open.length} "[" never closed`);

  let tape = new Uint8Array(30000);
  let pointer = 0;
  const out: number[] = [];
  let steps = 0;
  for (let pc = 0; pc < kinds.length; pc++) {
    if (++steps > BF_STEP_LIMIT) throw new Error('stopped after 50,000,000 steps: the program seems to loop forever');
    switch (kinds[pc]) {
      case 0:
        tape[pointer] = (tape[pointer] + args[pc]) & 0xff;
        break;
      case 1:
        pointer += args[pc];
        if (pointer < 0) throw new Error('the program moved left of the first cell');
        if (pointer >= tape.length) {
          if (pointer >= BF_TAPE_LIMIT) throw new Error('the program ran past 1,048,576 cells');
          const grown = new Uint8Array(Math.min(BF_TAPE_LIMIT, Math.max(tape.length * 2, pointer + 1)));
          grown.set(tape);
          tape = grown;
        }
        break;
      case 2:
        if (out.length >= BF_OUTPUT_LIMIT) {
          throw new Error('stopped after printing 1,000,000 bytes: the program seems to print forever');
        }
        out.push(tape[pointer]);
        break;
      case 3:
        tape[pointer] = 0;
        break;
      case 4:
        if (tape[pointer] === 0) pc = args[pc];
        break;
      default:
        if (tape[pointer] !== 0) pc = args[pc];
    }
  }
  return utf8Text(Uint8Array.from(out), 'the bytes the program printed');
}

// ---------------------------------------------------------------------------------------------
// Unicode code points
// ---------------------------------------------------------------------------------------------

function codePointsEncode(input: string): string {
  return Array.from(input, (char) => `U+${(char.codePointAt(0) ?? 0).toString(16).toUpperCase().padStart(4, '0')}`).join(' ');
}

function codePointsDecode(input: string): string {
  return tokens(input).map((token) => {
    const match = token.match(/^[Uu]\+([0-9A-Fa-f]{1,6})$/);
    if (!match) throw new Error(`${JSON.stringify(token)} is not a code point like U+0041`);
    const codePoint = parseInt(match[1], 16);
    if (codePoint > 0x10ffff) throw new Error(`${token} is beyond the last Unicode code point (U+10FFFF)`);
    return String.fromCodePoint(codePoint);
  }).join('');
}

// ---------------------------------------------------------------------------------------------
// registry (appended to the page's TRANSFORMS)
// ---------------------------------------------------------------------------------------------

/** Wrap a bytes -> string encoder and string -> bytes decoder as UTF-8 text functions. */
function textCodec(encode: (bytes: Uint8Array) => string, decode: (text: string) => Uint8Array): Pick<DashTransform, 'enc' | 'dec'> {
  return {
    enc: (input) => encode(utf8Bytes(input)),
    dec: (input) => utf8Text(decode(input)),
  };
}

export const ENCODING_TRANSFORMS: DashTransform[] = [
  { id: 'base32', label: 'base32', group: 'encoders',
    ...textCodec((bytes) => encodeBitGroups(bytes, BASE32_ALPHABET, 5, 8),
      (text) => decodeBitGroups(text, BASE32_ALPHABET, 5, 'base32', true)),
    note: 'RFC 4648 base32 (A-Z, 2-7) with = padding. Decode ignores case and spaces.' },
  { id: 'base32hex', label: 'base32hex', group: 'encoders',
    ...textCodec((bytes) => encodeBitGroups(bytes, BASE32HEX_ALPHABET, 5, 8),
      (text) => decodeBitGroups(text, BASE32HEX_ALPHABET, 5, 'base32hex', true)),
    note: 'RFC 4648 "extended hex" base32 (0-9, A-V) with = padding.' },
  { id: 'base36', label: 'base36', group: 'encoders',
    ...textCodec((bytes) => bigBaseEncode(bytes, BASE36_ALPHABET),
      (text) => bigBaseDecode(asciiLower(text), BASE36_ALPHABET, 'base36')),
    note: 'the bytes as one big number in 0-9a-z. Each leading zero byte is kept as a 0. Decode ignores case.' },
  { id: 'base58', label: 'base58', group: 'encoders',
    ...textCodec((bytes) => bigBaseEncode(bytes, BASE58_ALPHABET),
      (text) => bigBaseDecode(text, BASE58_ALPHABET, 'base58', 'base58 never uses 0, O, I or l')),
    note: 'Bitcoin alphabet (no 0, O, I, l). Each leading zero byte becomes a 1. No checksum.' },
  { id: 'base62', label: 'base62', group: 'encoders',
    ...textCodec((bytes) => bigBaseEncode(bytes, BASE62_ALPHABET),
      (text) => bigBaseDecode(text, BASE62_ALPHABET, 'base62')),
    note: 'the bytes as one big number in 0-9A-Za-z. Each leading zero byte is kept as a 0.' },
  { id: 'base64url', label: 'base64url', group: 'encoders',
    ...textCodec((bytes) => encodeBitGroups(bytes, BASE64URL_ALPHABET, 6, 1),
      (text) => decodeBitGroups(text, BASE64URL_ALPHABET, 6, 'base64url', false)),
    note: 'RFC 4648 URL-safe base64: - and _ instead of + and /, no = padding (decode accepts it).' },
  { id: 'ascii85', label: 'ascii85', group: 'encoders', enc: ascii85Encode, dec: ascii85Decode,
    note: 'Adobe ascii85 between <~ and ~>; z stands for four zero bytes.' },
  { id: 'z85', label: 'Z85', group: 'encoders', enc: z85Encode, dec: z85Decode,
    note: 'ZeroMQ Z85. Text is zero-padded to a multiple of 4 bytes and a ~N suffix records the padding.' },
  { id: 'base91', label: 'basE91', group: 'encoders', enc: base91Encode, dec: base91Decode,
    note: 'basE91: the densest printable-ASCII encoding here (about 23% overhead).' },
  { id: 'base45', label: 'base45', group: 'encoders', enc: base45Encode, dec: base45Decode,
    note: 'RFC 9285 base45 (the QR-code one). Space is a digit, so keep spaces when decoding.' },
  { id: 'uuencode', label: 'uuencode', group: 'encoders', enc: uuencode, dec: uudecode,
    note: 'classic Unix uuencode block with begin/end lines. The file name is ignored on decode.' },
  { id: 'quotedprintable', label: 'quoted-printable', group: 'encoders', enc: quotedPrintableEncode, dec: quotedPrintableDecode,
    note: 'RFC 2045 email encoding: =XX for non-ASCII bytes and =, soft line breaks at 76 columns.' },
  { id: 'htmlentities', label: 'HTML entities', group: 'encoders', enc: htmlEntitiesEncode, dec: htmlEntitiesDecode,
    note: 'everything except letters, digits, spaces and line breaks becomes &#xHEX;. Decode also reads &#DEC; and common names like &amp;.' },
  { id: 'octal', label: 'octal', group: 'encoders', enc: octalEncode, dec: octalDecode,
    note: 'each UTF-8 byte as three octal digits (000-377).' },
  { id: 'decimal', label: 'decimal bytes', group: 'encoders', enc: decimalEncode, dec: decimalDecode,
    note: 'each UTF-8 byte as a decimal number (0-255). Unlike "ascii", accents and emoji take several numbers.' },
  { id: 'xor', label: 'XOR', group: 'encoders', enc: xorEncode, dec: xorDecode,
    param: { label: 'key', default: XOR_DEFAULT_KEY, hint: 'any text; repeated across the bytes' },
    note: 'each UTF-8 byte XORed with the key bytes (repeating), shown as hex. Decode needs the same key.' },
  { id: 'bitnot', label: 'bitwise NOT', group: 'encoders', enc: bitNotEncode, dec: bitNotDecode,
    note: 'every bit of every byte flipped (255 minus the byte), shown as hex.' },
  { id: 'graycode', label: 'Gray code', group: 'encoders', enc: grayEncode, dec: grayDecode,
    note: 'each byte as its 8-bit reflected binary Gray code.' },
  { id: 'manchester', label: 'Manchester', group: 'encoders', enc: manchesterEncode, dec: manchesterDecode,
    note: 'IEEE 802.3 line code: bit 0 is sent as 10, bit 1 as 01, 16 symbols per byte.' },
  { id: 'baudot', label: 'Baudot (ITA2)', group: 'encoders', enc: baudotEncode, dec: baudotDecode,
    note: '5-bit teleprinter code with letter/figure shifts. Upper case only; characters ITA2 lacks are dropped.' },
  { id: 'ebcdic', label: 'EBCDIC', group: 'encoders', enc: ebcdicEncode, dec: ebcdicDecode,
    note: 'IBM code page 037 bytes, shown as hex. Characters outside Latin-1 become ?.' },
  { id: 'bcd', label: 'BCD', group: 'encoders', enc: bcdEncode, dec: bcdDecode,
    note: 'binary-coded decimal: 4 bits per digit. Only digits are kept; everything else is dropped.' },
  { id: 'brainfuck', label: 'Brainfuck', group: 'encoders', enc: brainfuckEncode, dec: brainfuckDecode,
    encLabel: 'compile', decLabel: 'run',
    note: 'a Brainfuck program that prints the text (8-bit wrapping cells). Decode runs any program, with no input.' },
  { id: 'codepoints', label: 'code points', group: 'encoders', enc: codePointsEncode, dec: codePointsDecode,
    note: 'each character as its Unicode code point, U+XXXX.' },
];
