// Author: Claude Opus 5.5
// Date: 23-Nov-2026
// PURPOSE: Verify the DASH encoder transforms in src/lib/dash-encodings.ts against the real
//          module: ids are unique and do not clash with the other DASH modules, every reversible
//          transform round-trips on ASCII and on Unicode/emoji text, published test vectors pass
//          (RFC 4648, RFC 9285, the ZeroMQ Z85 spec, Bitcoin base58, Adobe ascii85, uuencode,
//          quoted-printable, CP037), the big-integer bases agree with an independent reference,
//          the XOR key param falls back to its default, decoders throw on garbage, and 50 KB of
//          input encodes in well under 200 ms. The last block holds regression tests for bugs found
//          by an independent check (prototype-key entities, quadratic QP regex, octal escapes,
//          unbounded Brainfuck output, non-ASCII case folding).
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

const { ENCODING_TRANSFORMS, z85EncodeBytes, z85DecodeBytes, XOR_DEFAULT_KEY } =
  await loadHelper('../src/lib/dash-encodings.ts');
const { GLYPH_TRANSFORMS } = await loadHelper('../src/lib/dash-glyphs.ts');
const { BASE_TRANSFORMS, DASH_GROUP_ORDER } = await loadHelper('../src/lib/dash-transforms.ts');
const byId = Object.fromEntries(ENCODING_TRANSFORMS.map((transform) => [transform.id, transform]));

const enc = (id, text, param) => byId[id].enc(text, param);
const dec = (id, text, param) => byId[id].dec(text, param);

const ASCII = 'The Quick Brown Fox jumps over 13 lazy dogs, 2026! (x/y?) a=b ~end ';
const UNICODE = '﻿ünïcödé 🦞 𓂀 ok\n\ttab = "q" <x> & \u0000 NUL\r\nCRLF line  ';

test('ids are unique, lower case, in the encoders group and clash with no other module', () => {
  const ids = ENCODING_TRANSFORMS.map((transform) => transform.id);
  assert.equal(new Set(ids).size, ids.length);
  const all = [...BASE_TRANSFORMS, ...GLYPH_TRANSFORMS, ...ENCODING_TRANSFORMS].map((transform) => transform.id);
  assert.equal(new Set(all).size, all.length, 'no id clashes with dash-transforms or dash-glyphs');
  for (const transform of ENCODING_TRANSFORMS) {
    assert.match(transform.id, /^[a-z0-9]+$/, transform.id);
    assert.equal(transform.group, 'encoders', transform.id);
    assert.ok(DASH_GROUP_ORDER.includes(transform.group));
    assert.equal(typeof transform.enc, 'function', transform.id);
    assert.equal(typeof transform.dec, 'function', `${transform.id} has a decoder`);
    assert.ok(transform.note && transform.note.length < 140, `${transform.id} has a short note`);
  }
});

test('byte encoders round-trip ASCII and Unicode exactly', () => {
  const exact = ['base32', 'base32hex', 'base36', 'base58', 'base62', 'base64url', 'ascii85', 'z85',
    'base91', 'base45', 'uuencode', 'quotedprintable', 'htmlentities', 'octal', 'decimal', 'xor',
    'bitnot', 'graycode', 'manchester', 'brainfuck', 'codepoints'];
  const lengths = Array.from({ length: 12 }, (_unused, size) => 'abcdefghijkl'.slice(0, size));
  for (const id of exact) {
    for (const input of [ASCII, UNICODE, '', ...lengths, '\0\0\0lead zeros', '\0']) {
      assert.equal(dec(id, enc(id, input)), input, `${id}: ${JSON.stringify(input)}`);
    }
    assert.notEqual(enc(id, ASCII), ASCII, `${id} changes the text`);
  }
});

test('lone surrogates are normalised to U+FFFD by UTF-8 transforms; codepoints keeps them', () => {
  assert.equal(dec('base32', enc('base32', 'a\uD800b')), 'a�b');
  assert.equal(dec('codepoints', enc('codepoints', 'a\uD800b')), 'a\uD800b');
});

test('RFC 4648 test vectors: base32, base32hex, base64url', () => {
  const inputs = ['', 'f', 'fo', 'foo', 'foob', 'fooba', 'foobar'];
  const base32 = ['', 'MY======', 'MZXQ====', 'MZXW6===', 'MZXW6YQ=', 'MZXW6YTB', 'MZXW6YTBOI======'];
  const base32hex = ['', 'CO======', 'CPNG====', 'CPNMU===', 'CPNMUOG=', 'CPNMUOJ1', 'CPNMUOJ1E8======'];
  const base64url = ['', 'Zg', 'Zm8', 'Zm9v', 'Zm9vYg', 'Zm9vYmE', 'Zm9vYmFy'];
  inputs.forEach((input, index) => {
    assert.equal(enc('base32', input), base32[index], `base32 ${input}`);
    assert.equal(enc('base32hex', input), base32hex[index], `base32hex ${input}`);
    assert.equal(enc('base64url', input), base64url[index], `base64url ${input}`);
    assert.equal(dec('base32', base32[index].toLowerCase()), input, 'base32 decode ignores case');
    assert.equal(dec('base32hex', base32hex[index]), input);
    assert.equal(dec('base64url', base64url[index]), input);
  });
  // URL-safe alphabet: '?' and '~' runs hit index 63 and 62
  assert.equal(enc('base64url', '???'), 'Pz8_');
  assert.equal(enc('base64url', '~~~'), 'fn5-');
  assert.equal(dec('base64url', 'Zg=='), 'f', 'padding accepted');
  assert.equal(dec('base32', 'MZXW 6YTB\nOI======'), 'foobar', 'whitespace ignored');
  assert.throws(() => dec('base32', 'MZXW1==='), /"1" is not a base32 character/);
  assert.throws(() => dec('base32', 'M'), /truncated/);
  assert.throws(() => dec('base64url', 'Zm9v+g'), /not a base64url character/);
  assert.throws(() => dec('base64url', 'Z=g'), /padding/);
});

test('base58 (Bitcoin test vectors) and leading zeros', () => {
  assert.equal(enc('base58', ''), '');
  assert.equal(enc('base58', 'a'), '2g');
  assert.equal(enc('base58', 'bbb'), 'a3gV');
  assert.equal(enc('base58', 'ccc'), 'aPEr');
  assert.equal(enc('base58', 'simply a long string'), '2cFupjhnEsSn59qHXstmK2ffpLv2');
  assert.equal(enc('base58', '\0'.repeat(10)), '1111111111');
  assert.equal(enc('base58', '\0\0a'), '112g');
  assert.equal(dec('base58', '2cFupjhnEsSn59qHXstmK2ffpLv2'), 'simply a long string');
  assert.throws(() => dec('base58', '2g0'), /never uses 0, O, I or l/);
});

test('base36 / base58 / base62 agree with an independent BigInt reference', () => {
  const alphabets = {
    base36: '0123456789abcdefghijklmnopqrstuvwxyz',
    base58: '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz',
    base62: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  };
  // naive repeated division: slow but obviously correct
  const reference = (text, alphabet) => {
    const bytes = new TextEncoder().encode(text);
    let zeros = 0;
    while (zeros < bytes.length && bytes[zeros] === 0) zeros++;
    let value = bytes.length > zeros ? BigInt(`0x${Buffer.from(bytes.subarray(zeros)).toString('hex')}`) : 0n;
    const base = BigInt(alphabet.length);
    let out = '';
    while (value > 0n) {
      out = alphabet[Number(value % base)] + out;
      value /= base;
    }
    return alphabet[0].repeat(zeros) + out;
  };
  const long = Array.from({ length: 1500 }, (_unused, index) => String.fromCharCode(32 + ((index * 37) % 95))).join('');
  for (const [id, alphabet] of Object.entries(alphabets)) {
    for (const input of ['a', '\0\0xyz', UNICODE, long, `\0${long}`]) {
      assert.equal(enc(id, input), reference(input, alphabet), `${id} ${input.length}`);
    }
  }
  assert.equal(enc('base36', 'a'), '2p');
  assert.equal(dec('base36', '2P'), 'a', 'base36 decode ignores case');
  assert.throws(() => dec('base62', 'ab-c'), /"-" is not a base62 character/);
});

test('ascii85 (Adobe) vectors, z shortcut and errors', () => {
  assert.equal(enc('ascii85', 'Man '), '<~9jqo^~>');
  assert.equal(enc('ascii85', 'sure.'), '<~F*2M7/c~>');
  assert.equal(enc('ascii85', '\0\0\0\0ab'), '<~z@:B~>');
  assert.equal(enc('ascii85', ''), '<~~>');
  assert.equal(dec('ascii85', '9jqo^'), 'Man ', 'delimiters optional');
  assert.equal(dec('ascii85', '<~F*2M7\n/c~>'), 'sure.');
  assert.throws(() => dec('ascii85', '<~9jqvo~>'), /"v" is not a ascii85 character/);
  assert.throws(() => dec('ascii85', '<~9jqo^F~>'), /truncated/);
  assert.throws(() => dec('ascii85', '<~9jzqo^~>'), /"z"/);
  assert.throws(() => dec('ascii85', '<~uuuuu~>'), /larger than 4 bytes/);
});

test('Z85 (ZeroMQ RFC 32) vector and padding marker', () => {
  const vector = Uint8Array.from([0x86, 0x4f, 0xd2, 0x6f, 0xb5, 0x59, 0xf7, 0x5b]);
  assert.equal(z85EncodeBytes(vector), 'HelloWorld');
  assert.deepEqual(z85DecodeBytes('HelloWorld'), vector);
  assert.match(enc('z85', 'abc'), /^.{5}~1$/);
  assert.match(enc('z85', 'abcde'), /^.{10}~3$/);
  assert.throws(() => dec('z85', 'Hello'), /not valid UTF-8/);
  assert.throws(() => dec('z85', 'Hell'), /groups of 5/);
  assert.throws(() => dec('z85', 'Hel"o'), /not a Z85 character/);
});

test('basE91 vector and errors', () => {
  assert.equal(enc('base91', 'Hello, World!'), '>OwJh>}AQ;r@@Y?F');
  assert.equal(dec('base91', '>OwJh>}AQ;r@@Y?F'), 'Hello, World!');
  assert.equal(enc('base91', 'test'), 'fPNKd');
  assert.throws(() => dec('base91', 'ab c-'), /"-" is not a basE91 character/);
});

test('base45 (RFC 9285) vectors and errors', () => {
  assert.equal(enc('base45', 'AB'), 'BB8');
  assert.equal(enc('base45', 'Hello!!'), '%69 VD92EX0');
  assert.equal(enc('base45', 'base-45'), 'UJCLQE7W581');
  assert.equal(dec('base45', 'QED8WEX0'), 'ietf!');
  assert.throws(() => dec('base45', 'GGW'), /larger than 2 bytes/);
  assert.throws(() => dec('base45', 'BB8B'), /truncated/);
  assert.throws(() => dec('base45', 'bb8'), /"b" is not a base45 character/);
});

test('uuencode block format', () => {
  assert.equal(enc('uuencode', 'Cat'), 'begin 644 dash.txt\n#0V%T\n`\nend');
  const long = 'x'.repeat(100);
  const lines = enc('uuencode', long).split('\n');
  assert.deepEqual(lines.slice(1, 4).map((line) => line[0]), ['M', 'M', '*'], '45 + 45 + 10 bytes');
  assert.equal(dec('uuencode', '#0V%T'), 'Cat', 'body without begin/end');
  assert.equal(dec('uuencode', 'begin 600 other.bin\r\n#0V%T\r\n`\r\nend\r\n'), 'Cat');
  assert.throws(() => dec('uuencode', 'begin 644 x\nhello\nend'), /not a uuencode character/);
  assert.throws(() => dec('uuencode', 'begin 644 x\nM0V%T\nend'), /too short/);
});

test('quoted-printable (RFC 2045)', () => {
  assert.equal(enc('quotedprintable', 'café a=b trailing \nx'), 'caf=C3=A9 a=3Db trailing=20\nx');
  const long = `${'word '.repeat(40)}é${'z'.repeat(80)}`;
  const encoded = enc('quotedprintable', long);
  for (const line of encoded.split('\n')) assert.ok(line.length <= 76, `line too long: ${line.length}`);
  assert.ok(encoded.includes('=\n'), 'soft breaks used');
  assert.equal(dec('quotedprintable', encoded), long);
  assert.equal(dec('quotedprintable', 'soft=\r\nbreak  \nx=3d'), 'softbreak\nx=', 'CRLF soft break, transport spaces, lower-case hex');
  assert.throws(() => dec('quotedprintable', 'bad =ZZ'), /not followed by two hex digits/);
});

test('HTML entities', () => {
  assert.equal(enc('htmlentities', '<a href="x">é 1'), '&#x3C;a href&#x3D;&#x22;x&#x22;&#x3E;&#xE9; 1');
  assert.equal(enc('htmlentities', '🦞'), '&#x1F99E;');
  assert.equal(dec('htmlentities', '&lt;b&gt; &amp; &#65;&#x42;&#X43; &unknown; &copy;'), '<b> & ABC &unknown; ©');
  assert.throws(() => dec('htmlentities', '&#x110000;'), /beyond the last Unicode code point/);
});

test('octal and decimal bytes', () => {
  assert.equal(enc('octal', 'Aé'), '101 303 251');
  assert.equal(dec('octal', '\\101, 0o102 103'), 'ABC');
  assert.throws(() => dec('octal', '400'), /not an octal byte/);
  assert.throws(() => dec('octal', '18'), /not an octal byte/);
  assert.equal(enc('decimal', 'Aé'), '65 195 169');
  assert.throws(() => dec('decimal', '65 256'), /not a byte/);
  assert.throws(() => dec('decimal', '195'), /not valid UTF-8/);
});

test('xor key param: value, default fallback and wrong key', () => {
  assert.equal(XOR_DEFAULT_KEY, 'key');
  assert.equal(byId.xor.param.default, 'key');
  assert.equal(enc('xor', 'abc', 'key'), '0a 07 1a');
  for (const blank of [undefined, '', '   ']) {
    assert.equal(enc('xor', 'abc', blank), '0a 07 1a', `blank key ${JSON.stringify(blank)}`);
    assert.equal(dec('xor', '0a 07 1a', blank), 'abc');
  }
  assert.equal(dec('xor', enc('xor', UNICODE, 's3cr3t 🔑'), 's3cr3t 🔑'), UNICODE);
  assert.notEqual(enc('xor', 'abc', 'other'), '0a 07 1a');
  assert.equal(dec('xor', '0x0a,0x07,0x1a'), 'abc', '0x and commas accepted');
  assert.throws(() => dec('xor', 'zz'), /not a hex digit/);
  assert.throws(() => dec('xor', '0a0'), /odd number/);
});

test('bitwise not, Gray code, Manchester', () => {
  assert.equal(enc('bitnot', 'A'), 'be');
  assert.equal(enc('graycode', 'A'), '01100001'); // 65 -> 97
  assert.equal(enc('manchester', 'A'), '1001101010101001');
  assert.throws(() => dec('graycode', '0110000'), /groups of 8 bits/);
  assert.throws(() => dec('graycode', '0110000x'), /not a bit/);
  assert.throws(() => dec('manchester', '1101101010101001'), /not a Manchester bit/);
});

test('Baudot ITA2 shifts, upper case and dropped characters', () => {
  assert.equal(enc('baudot', 'RY'), '01010 10101');
  assert.equal(enc('baudot', 'A1'), '11000 11011 11101', 'A, FIGS, 1');
  const text = 'HELLO WORLD 123, OK? (A-B) = 4/5.\nNEXT';
  assert.equal(dec('baudot', enc('baudot', text)), text);
  assert.equal(dec('baudot', enc('baudot', 'hello')), 'HELLO', 'lower case comes back upper case');
  assert.equal(dec('baudot', enc('baudot', 'A*B')), 'AB', 'no ITA2 code for *');
  assert.throws(() => dec('baudot', '1100'), /groups of 5 bits/);
});

test('EBCDIC code page 037', () => {
  assert.equal(enc('ebcdic', 'Hello'), 'c8 85 93 93 96');
  // reference bytes from Python's cp037 codec
  const latin1 = 'Grüße, ¿qué? ¬|[]{}';
  assert.equal(enc('ebcdic', latin1), 'c7 99 dc 59 85 6b 40 ab 98 a4 51 6f 40 5f 4f ba bb c0 d0');
  assert.equal(dec('ebcdic', enc('ebcdic', latin1)), latin1);
  const allLatin1 = Array.from({ length: 256 }, (_unused, code) => String.fromCharCode(code)).join('');
  assert.equal(dec('ebcdic', enc('ebcdic', allLatin1)), allLatin1);
  assert.equal(enc('ebcdic', '🦞'), '6f', 'outside Latin-1 becomes ?');
});

test('BCD keeps digits only', () => {
  assert.equal(enc('bcd', '2026'), '0010 0000 0010 0110');
  assert.equal(enc('bcd', 'a9 b'), '1001');
  assert.equal(dec('bcd', '00100000 00100110'), '2026');
  assert.throws(() => dec('bcd', '1010'), /not a BCD digit/);
});

test('Brainfuck compiles text and runs programs', () => {
  assert.equal(dec('brainfuck', '++++++++[>++++++++<-]>+.'), 'A');
  assert.equal(dec('brainfuck', 'comments are ignored ++++++++[>++++++++<-]>+.'), 'A');
  assert.ok(enc('brainfuck', 'Hello').length < 80, 'compact');
  assert.throws(() => dec('brainfuck', '+['), /never closed/);
  assert.throws(() => dec('brainfuck', '+]'), /unmatched/);
  assert.throws(() => dec('brainfuck', '<'), /left of the first cell/);
  assert.throws(() => dec('brainfuck', '+[]'), /loop forever/);
});

test('code points', () => {
  assert.equal(enc('codepoints', 'A🦞'), 'U+0041 U+1F99E');
  assert.equal(dec('codepoints', 'u+41, U+1F99E'), 'A🦞');
  assert.throws(() => dec('codepoints', 'U+110000'), /beyond/);
  assert.throws(() => dec('codepoints', 'hello'), /not a code point/);
});

test('50 KB of input encodes in well under 200 ms', () => {
  const unit = 'Gray Swan arena 2026: ünïcode 🦞 & <tags> = "quoted"\n';
  const input = unit.repeat(Math.ceil(51200 / unit.length));
  const slow = [];
  for (const transform of ENCODING_TRANSFORMS) {
    const start = performance.now();
    const output = transform.enc(input, transform.param?.default);
    const encodeMs = performance.now() - start;
    const decodeStart = performance.now();
    transform.dec?.(output, transform.param?.default);
    const decodeMs = performance.now() - decodeStart;
    if (encodeMs > 200) slow.push(`${transform.id} encode ${encodeMs.toFixed(0)} ms`);
    if (decodeMs > 1000) slow.push(`${transform.id} decode ${decodeMs.toFixed(0)} ms`);
  }
  assert.deepEqual(slow, []);
});

// ---- regressions found by the independent check (23-Nov-2026) ----

test('regression: HTML named-entity lookup ignores Object.prototype keys', () => {
  assert.equal(dec('htmlentities', '&constructor; &toString; &__proto__; &hasOwnProperty;'),
    '&constructor; &toString; &__proto__; &hasOwnProperty;');
  assert.equal(dec('htmlentities', '&amp;&nbsp;'), '& ');
});

test('regression: quoted-printable decode is linear on long blank runs and takes a final soft break', () => {
  const blanks = `${' '.repeat(51200)}x`;
  const start = performance.now();
  assert.equal(dec('quotedprintable', blanks), blanks, 'spaces before text are data, not transport padding');
  assert.ok(performance.now() - start < 100, 'no quadratic backtracking');
  assert.equal(dec('quotedprintable', 'abc='), 'abc', 'a lone = at the very end is a soft break');
  assert.equal(dec('quotedprintable', 'a = \r\nb \t\r\nc'), 'a b\r\nc', 'blanks after a soft break and before CRLF are dropped');
});

test('regression: octal decode reads run-together backslash escapes', () => {
  const backslash = String.fromCharCode(92);
  assert.equal(dec('octal', `${backslash}101${backslash}102 ${backslash}103`), 'ABC');
  assert.throws(() => dec('octal', `${backslash}${backslash}101`), /not an octal byte/);
});

test('regression: Brainfuck output is capped so a print-forever program cannot eat memory', async () => {
  const { BF_OUTPUT_LIMIT } = await loadHelper('../src/lib/dash-encodings.ts');
  assert.equal(BF_OUTPUT_LIMIT, 1_000_000);
  const start = performance.now();
  assert.throws(() => dec('brainfuck', '+[.]'), /print forever/);
  assert.ok(performance.now() - start < 500, 'stops at the output cap, long before the step limit');
});

test('regression: case folding is ASCII-only, so non-ASCII lookalikes are rejected', () => {
  // U+0131 dotless i upper-cases to I, U+017F long s to S, U+212A Kelvin sign lower-cases to k
  assert.throws(() => dec('base32', 'Mı======'), /not a base32 character/);
  assert.throws(() => dec('base32', 'ſM======'), /not a base32 character/);
  assert.throws(() => dec('base36', '2K'), /not a base36 character/);
  assert.equal(dec('base32', 'my======'), 'f', 'ASCII lower case still folds');
});

test('regression: every basE91 digit pair decodes (no pair is impossible)', () => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!#$%&()*+,./:;<=>?@[]^_`{|}~"';
  for (const low of alphabet) {
    for (const high of alphabet) {
      try {
        dec('base91', low + high);
      } catch (error) {
        assert.match(error.message, /UTF-8/, `${low}${high} may only fail as non-UTF-8 bytes`);
      }
    }
  }
});
