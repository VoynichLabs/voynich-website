// Author: Claude Opus 5.5
// Date: 23-Nov-2026
// PURPOSE: Verify the DASH QR code transform in src/lib/dash-qr.ts against the real module: the
//          half-block output is a square grid whose side is 4 * version + 17 modules plus the
//          4-module quiet zone on each side, the three finder patterns sit in the right corners,
//          the error-correction param parses (and rejects junk), capacities match ISO/IEC 18004
//          byte-mode limits, oversize input throws the documented error, and output is deterministic.
//          (Scannability itself was proven separately by decoding the output with jsQR and ZXing.)
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

const qr = await loadHelper('../src/lib/dash-qr.ts');
const [transform] = qr.QR_TRANSFORMS;
const utf8 = new TextEncoder();

/** Turn half-block text back into module rows (true = dark), quiet zone included. */
function textToModules(text) {
  const lines = text.split('\n');
  const rows = [];
  for (const line of lines) {
    const chars = Array.from(line);
    rows.push(chars.map((char) => char === '█' || char === '▀'));
    rows.push(chars.map((char) => char === '█' || char === '▄'));
  }
  return rows;
}

/** True when a 7x7 finder (dark ring, light ring, 3x3 dark core) starts at (top, left). */
function hasFinder(modules, top, left) {
  for (let row = 0; row < 7; row += 1) {
    for (let col = 0; col < 7; col += 1) {
      const ring = Math.max(Math.abs(row - 3), Math.abs(col - 3));
      if (modules[top + row][left + col] !== (ring !== 2)) return false;
    }
  }
  return true;
}

test('registry entry shape', () => {
  assert.equal(qr.QR_TRANSFORMS.length, 1);
  assert.equal(transform.id, 'qr');
  assert.equal(transform.label, 'qr code');
  assert.equal(transform.group, 'codes');
  assert.equal(transform.dec, null);
  assert.equal(typeof transform.enc, 'function');
  assert.deepEqual(transform.param, { label: 'error correction', default: 'M', hint: 'L, M, Q or H' });
  assert.match(transform.note, /half blocks/);
});

test('output is a square half-block grid sized 4v+17 plus the quiet zone, with finders', () => {
  const inputs = ['hello', 'x'.repeat(200), 'Hi 🦞 สวัสดี ආයුබෝවන්'];
  for (const level of ['L', 'M', 'Q', 'H']) {
    for (const input of inputs) {
      const { version, size } = qr.encodeQr(utf8.encode(input), level);
      assert.equal(size, 4 * version + 17);
      const side = size + 2 * qr.QR_QUIET_ZONE;
      assert.equal(side % 2, 1, 'module count is odd');

      const text = transform.enc(input, level);
      assert.match(text, /^[ █▀▄\n]+$/u, 'only half blocks, spaces and newlines');
      const lines = text.split('\n');
      assert.equal(lines.length, Math.ceil(side / 2), 'two module rows per line');
      for (const line of lines) assert.equal(Array.from(line).length, side, 'every line spans the full width');

      const modules = textToModules(text);
      const quiet = qr.QR_QUIET_ZONE;
      for (let index = 0; index < side; index += 1) {
        for (let band = 0; band < quiet; band += 1) {
          assert.equal(modules[band][index], false, 'top quiet zone is light');
          assert.equal(modules[side - 1 - band][index], false, 'bottom quiet zone is light');
          assert.equal(modules[index][band], false, 'left quiet zone is light');
          assert.equal(modules[index][side - 1 - band], false, 'right quiet zone is light');
        }
      }
      assert.equal(modules[side].every((dark) => !dark), true, 'padding row under an odd grid is light');
      assert.ok(hasFinder(modules, quiet, quiet), 'top-left finder');
      assert.ok(hasFinder(modules, quiet, quiet + size - 7), 'top-right finder');
      assert.ok(hasFinder(modules, quiet + size - 7, quiet), 'bottom-left finder');
      assert.ok(!hasFinder(modules, quiet + size - 7, quiet + size - 7), 'no finder bottom-right');
    }
  }
});

test('smallest version is chosen and capacities match the byte-mode table', () => {
  // ISO/IEC 18004 table 7 byte-mode capacities
  assert.equal(qr.byteCapacity(1, 'L'), 17);
  assert.equal(qr.byteCapacity(1, 'M'), 14);
  assert.equal(qr.byteCapacity(1, 'Q'), 11);
  assert.equal(qr.byteCapacity(1, 'H'), 7);
  assert.equal(qr.byteCapacity(10, 'M'), 213);
  assert.equal(qr.byteCapacity(40, 'L'), 2953);
  assert.equal(qr.byteCapacity(40, 'M'), 2331);
  assert.equal(qr.byteCapacity(40, 'Q'), 1663);
  assert.equal(qr.byteCapacity(40, 'H'), 1273);
  assert.equal(qr.encodeQr(utf8.encode('hello'), 'M').version, 1);
  assert.equal(qr.chooseVersion(14, 'M'), 1);
  assert.equal(qr.chooseVersion(15, 'M'), 2);
  assert.equal(qr.chooseVersion(2953, 'L'), 40);
  // multi-byte UTF-8 counts bytes, not characters: 5 emoji are 20 bytes, too big for 1-M
  assert.equal(qr.encodeQr(utf8.encode('🦞🦞🦞🦞🦞'), 'M').version, 2);
});

test('error-correction param parsing', () => {
  assert.equal(qr.parseQrLevel(undefined), 'M');
  assert.equal(qr.parseQrLevel(''), 'M');
  assert.equal(qr.parseQrLevel('  '), 'M');
  assert.equal(qr.parseQrLevel('l'), 'L');
  assert.equal(qr.parseQrLevel(' q '), 'Q');
  assert.equal(qr.parseQrLevel('H'), 'H');
  assert.equal(qr.parseQrLevel('high'), 'H');
  assert.equal(qr.parseQrLevel('Medium'), 'M');
  assert.throws(() => qr.parseQrLevel('X'), /error correction must be L, M, Q or H/);
  assert.throws(() => transform.enc('hello', 'MM'), /error correction must be L, M, Q or H/);
  assert.equal(transform.enc('hello'), transform.enc('hello', 'M'), 'default level is M');
  assert.notEqual(transform.enc('hello', 'L'), transform.enc('hello', 'H'), 'level changes the code');
  // the same 100 bytes need a bigger symbol at H than at L
  const payload = utf8.encode('a'.repeat(100));
  assert.ok(qr.encodeQr(payload, 'H').version > qr.encodeQr(payload, 'L').version);
});

test('too-long input throws the documented error; empty input is empty', () => {
  assert.equal(transform.enc(''), '');
  assert.equal(transform.enc('', 'H'), '');
  assert.throws(() => transform.enc('a'.repeat(2954), 'L'), { message: 'too long for a QR code at level L (max 2953 bytes)' });
  assert.throws(() => transform.enc('a'.repeat(1274), 'H'), { message: 'too long for a QR code at level H (max 1273 bytes)' });
  // 2953 bytes of multi-byte text: 739 four-byte emoji is 2956 bytes, over the limit
  assert.throws(() => transform.enc('🦞'.repeat(739), 'L'), /too long for a QR code at level L/);
  assert.doesNotThrow(() => transform.enc('a'.repeat(2953), 'L'));
});

test('output is deterministic', () => {
  const input = 'The Voynich manuscript, f1r 🦞';
  for (const level of ['L', 'M', 'Q', 'H']) {
    const first = transform.enc(input, level);
    assert.equal(transform.enc(input, level), first);
    assert.deepEqual(qr.encodeQr(utf8.encode(input), level), qr.encodeQr(utf8.encode(input), level));
  }
});
