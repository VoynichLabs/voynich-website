// Author: Claude Opus 5.5
// Date: 23-Nov-2026
// PURPOSE: Verify the polygraphic and transposition ciphers in src/lib/dash-ciphers-grid.ts against
//          the real module: published test vectors (Wikipedia worked examples for playfair,
//          two-square, four-square, bifid, trifid, ADFGX, ADFGVX, Hill, rail fence, scytale,
//          columnar and double transposition; ACA examples for AMSCO and fractionated Morse),
//          exact round trips on ASCII and Unicode/emoji for every transposition, documented
//          normalisation for the letter ciphers, two-square self-inversion, parameter parsing,
//          decoder errors on garbage, id uniqueness across modules, and 50 KB performance.
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

const { GRID_CIPHER_TRANSFORMS, GRID_CIPHER_INTERNALS } = await loadHelper('../src/lib/dash-ciphers-grid.ts');
const { GLYPH_TRANSFORMS } = await loadHelper('../src/lib/dash-glyphs.ts');
const { BASE_TRANSFORMS, DASH_GROUP_ORDER } = await loadHelper('../src/lib/dash-transforms.ts');
const byId = Object.fromEntries(GRID_CIPHER_TRANSFORMS.map((transform) => [transform.id, transform]));
const enc = (id, text, param) => byId[id].enc(text, param);
const dec = (id, text, param) => byId[id].dec(text, param);

const TRANSPOSITIONS = ['railfence', 'columnar', 'doubletransposition', 'scytale', 'route', 'amsco'];
const WIKI_PLAIN = 'WEAREDISCOVEREDFLEEATONCE';

test('ids are unique, do not clash with existing modules, and use a shown group', () => {
  const ids = GRID_CIPHER_TRANSFORMS.map((transform) => transform.id);
  assert.equal(new Set(ids).size, ids.length);
  const existing = new Set([...BASE_TRANSFORMS, ...GLYPH_TRANSFORMS].map((transform) => transform.id));
  for (const transform of GRID_CIPHER_TRANSFORMS) {
    assert.ok(!existing.has(transform.id), `${transform.id} clashes with an existing transform`);
    assert.match(transform.id, /^[a-z0-9]+$/);
    assert.equal(transform.group, 'ciphers');
    assert.ok(DASH_GROUP_ORDER.includes(transform.group));
    assert.equal(typeof transform.enc, 'function');
    assert.ok(transform.param && transform.param.default && transform.param.label, `${transform.id} has a param`);
    assert.ok(transform.note, `${transform.id} has a note`);
    if (transform.dec === null) assert.match(transform.note, /inverse/, `${transform.id} explains dec: null`);
  }
  assert.deepEqual(ids, [
    'playfair', 'twosquare', 'foursquare', 'bifid', 'trifid', 'adfgx', 'adfgvx', 'hill',
    'railfence', 'columnar', 'doubletransposition', 'scytale', 'route', 'amsco', 'fractionatedmorse',
  ]);
});

test('playfair: Wikipedia vector with the default key', () => {
  assert.equal(enc('playfair', 'Hide the gold in the tree stump'), 'BMODZBXDNABEKUDMUIXMMOUVIF');
  assert.equal(enc('playfair', 'Hide the gold in the tree stump', 'playfair example'), 'BMODZBXDNABEKUDMUIXMMOUVIF');
  // decode keeps the X that split "EE" (documented)
  assert.equal(dec('playfair', 'BMODZ BXDNA BEKUD MUIXM MOUVI F'), 'HIDETHEGOLDINTHETREXESTUMP');
  // J folds to I, XX gets a Q filler, odd end padded
  assert.equal(dec('playfair', enc('playfair', 'jax')), 'IAXQ');
  assert.equal(dec('playfair', enc('playfair', 'XX')), 'XQXQ');
});

test('two-square: Wikipedia vertical vector (Q-less squares) and self-inverse transform', () => {
  const { keyedGrid, rectanglePairs } = GRID_CIPHER_INTERNALS;
  const noQ = 'ABCDEFGHIJKLMNOPRSTUVWXYZ';
  const top = keyedGrid('EXAMPLE', noQ, 5);
  const bottom = keyedGrid('KEYWORD', noQ, 5);
  assert.equal(top.symbols, 'EXAMPLBCDFGHIJKNORSTUVWYZ');
  assert.equal(rectanglePairs('HELPMEOBIWANKENOBI', top, bottom, top, bottom), 'HEDLXWSDJYANHOTKDG');
  const plain = 'HELPMEOBIWANKENOBI';
  const cipher = enc('twosquare', plain);
  assert.notEqual(cipher, plain);
  assert.equal(enc('twosquare', cipher), plain, 'running it again decodes');
  assert.equal(enc('twosquare', enc('twosquare', 'abc', 'one,two'), 'one,two'), 'ABCX');
  assert.equal(byId.twosquare.dec, null);
});

test('four-square: Wikipedia vector (Q-less squares) and transform round trip', () => {
  const { keyedGrid, gridFromSymbols, rectanglePairs } = GRID_CIPHER_INTERNALS;
  const noQ = 'ABCDEFGHIJKLMNOPRSTUVWXYZ';
  const plainSquare = gridFromSymbols(noQ, 5);
  const upperRight = keyedGrid('EXAMPLE', noQ, 5);
  const lowerLeft = keyedGrid('KEYWORD', noQ, 5);
  const cipher = rectanglePairs('HELPMEOBIWANKENOBI', plainSquare, plainSquare, upperRight, lowerLeft);
  assert.equal(cipher, 'FYGMKYHOBXMFKKKIMD');
  assert.equal(rectanglePairs(cipher, upperRight, lowerLeft, plainSquare, plainSquare), 'HELPMEOBIWANKENOBI');
  assert.equal(dec('foursquare', enc('foursquare', 'Help me, Obi-Wan Kenobi')), 'HELPMEOBIWANKENOBI');
  assert.equal(dec('foursquare', enc('foursquare', 'odd', 'alpha,beta'), 'alpha,beta'), 'ODDX');
});

test('bifid and trifid: Wikipedia vectors and periods', () => {
  const square = 'BGWKZQPNDSIOAXEFCLUMTHYVR';
  assert.equal(enc('bifid', 'FLEE AT ONCE', square), 'UAEOLWRINS');
  assert.equal(enc('bifid', 'FLEE AT ONCE', `${square},10`), 'UAEOLWRINS');
  assert.equal(dec('bifid', 'UAEOLWRINS', square), 'FLEEATONCE');
  for (const param of [undefined, 'secret', 'secret,3', 'secret,7', 'secret,0']) {
    assert.equal(dec('bifid', enc('bifid', 'Defend the east wall', param), param), 'DEFENDTHEEASTWALL', String(param));
  }
  assert.notEqual(enc('bifid', 'DEFENDTHEEASTWALL', 'secret,3'), enc('bifid', 'DEFENDTHEEASTWALL', 'secret'));

  assert.equal(enc('trifid', "aide-toi, le ciel t'aidera"), 'FMJFVOISSUFTFPUFEQQC');
  assert.equal(enc('trifid', "aide-toi, le ciel t'aidera", 'FELIX MARIE DELASTELLE,5'), 'FMJFVOISSUFTFPUFEQQC');
  assert.equal(dec('trifid', 'FMJFV OISSU FTFPU FEQQC'), 'AIDETOILECIELTAIDERA');
  for (const param of [undefined, 'key', 'key,7', 'key,0', 'key,1']) {
    assert.equal(dec('trifid', enc('trifid', 'Plus+signs too', param), param), 'PLUS+SIGNSTOO', String(param));
  }
});

test('ADFGX and ADFGVX: Wikipedia vectors', () => {
  assert.equal(enc('adfgx', 'attack at once', 'BTALPDHOZKQFVSNGICUXMREWY,CARGO'), 'FAXDFADDDGDGFFFAFAXAFAFX');
  assert.equal(dec('adfgx', 'FAXDF ADDDG DGFFF AFAX AFAFX', 'BTALPDHOZKQFVSNGICUXMREWY,CARGO'), 'ATTACKATONCE');
  // default key is the historical NACHTBOMMENWERPER square with digits after A-J
  assert.equal(enc('adfgvx', 'attack at 1200am'), 'DGDDDAGDDGAFADDFDADVDVFAADVX');
  assert.equal(enc('adfgvx', 'attack at 1200am', 'nachtbommenwerper, privacy'), 'DGDDDAGDDGAFADDFDADVDVFAADVX');
  assert.equal(dec('adfgvx', 'DGDD DAGD DGAF ADDF DADV DVFA ADVX'), 'ATTACKAT1200AM');
  assert.equal(dec('adfgx', enc('adfgx', 'Jump 2 it')), 'IUMPIT', 'J -> I, digits dropped');
  assert.equal(dec('adfgvx', enc('adfgvx', 'Room 101, now!', 'k3y,ab'), 'k3y,ab'), 'ROOM101NOW');
});

test('hill: Wikipedia 2x2 and 3x3 vectors, padding, key checks', () => {
  assert.equal(enc('hill', 'HELP'), 'HIAT');
  assert.equal(dec('hill', 'HIAT'), 'HELP');
  assert.equal(enc('hill', 'help', '3 3 2 5'), 'HIAT');
  assert.equal(enc('hill', 'ACT', 'GYBNQKURP'), 'POH');
  assert.equal(enc('hill', 'CAT', 'GYBNQKURP'), 'FIN');
  assert.equal(dec('hill', 'POHFIN', 'GYBNQKURP'), 'ACTCAT');
  assert.equal(dec('hill', enc('hill', 'odd')), 'ODDX', 'padded with X');
  assert.equal(dec('hill', enc('hill', 'Négative keys', '-23,3,2,5'), '-23,3,2,5'), 'NEGATIVEKEYS');
  assert.throws(() => enc('hill', 'HELP', '2,4,6,8'), /not invertible/);
  assert.throws(() => enc('hill', 'HELP', '1,0,0,13'), /not invertible/);
  assert.throws(() => enc('hill', 'HELP', '1,2,3'), /4 or 9/);
  assert.throws(() => enc('hill', 'HELP', '1,2,x,4'), /4 or 9/);
});

test('transpositions: published vectors', () => {
  assert.equal(enc('railfence', WIKI_PLAIN), 'WECRLTEERDSOEEFEAOCAIVDEN');
  assert.equal(enc('railfence', 'WEAREDISCOVEREDRUNATONCE', '3'), 'WECRUOERDSOEERNTNEAIVDAC');
  assert.equal(enc('columnar', WIKI_PLAIN), 'EVLNACDTESEAROFODEECWIREE');
  assert.equal(dec('columnar', 'EVLNACDTESEAROFODEECWIREE', 'zebras'), WIKI_PLAIN);
  assert.equal(enc('doubletransposition', WIKI_PLAIN), 'CAEENSOIAEDRLEFWEDREEVTOC');
  assert.equal(dec('doubletransposition', 'CAEENSOIAEDRLEFWEDREEVTOC', 'ZEBRAS,STRIPE'), WIKI_PLAIN);
  assert.equal(enc('scytale', WIKI_PLAIN, '3'), 'WOEEVEAEARRTEEODDNIFCSLEC');
  assert.equal(enc('scytale', 'IAMHURTVERYBADLYHELP', '4'), 'IRYYATBHMVAEHEDLURLP');
  // hand-worked: ABCD / EFGH / IJKL read clockwise from the top left
  assert.equal(enc('route', 'ABCDEFGHIJKL', '4'), 'ABCDHLKJIEFG');
  assert.equal(enc('route', 'ABCDEFGHIJ', '4'), 'ABCDHJIEFG', 'short last row is skipped, not padded');
  assert.equal(
    enc('amsco', 'INCOMPLETECOLUMNARWITHALTERNATINGSINGLELETTERSANDDIGRAPHS'),
    'CECRTEGLENPHPLUTNANTEIOMOWIRSITDDSINTNALINESAALEMHATGLRGR',
  );
});

test('transpositions round-trip exactly on ASCII, Unicode and emoji for many keys', () => {
  const samples = [
    '', 'a', 'Hello, Gray Swan arena! 123',
    'ünïcödé — 日本語のテキスト, emoji 🦞🦀 and family 👨‍👩‍👧 with ZWJ',
    'line one\nline two\ttabbed  double  space',
  ];
  const params = {
    railfence: [undefined, '', '1', '2', '3', '7', '1000'],
    columnar: [undefined, 'k', 'ZEBRAS', 'tomato', '3142', 'a b c'],
    doubletransposition: [undefined, 'ZEBRAS,STRIPE', 'ab,ba', 'longerkeyword,x'],
    scytale: [undefined, '1', '2', '3', '5', '99'],
    route: [undefined, '1', '2', '4', '6', '500'],
    amsco: [undefined, '1', '21', '41325', 'cipher', '2143'],
  };
  for (const id of TRANSPOSITIONS) {
    for (const param of params[id]) {
      for (const sample of samples) {
        const cipher = enc(id, sample, param);
        assert.equal(Array.from(cipher).length, Array.from(sample).length, `${id} ${param} keeps length`);
        assert.equal(dec(id, cipher, param), sample, `${id} ${param} ${JSON.stringify(sample)}`);
      }
    }
  }
  assert.notEqual(enc('railfence', 'Hello, Gray Swan arena!'), 'Hello, Gray Swan arena!');
});

test('letter ciphers round-trip their normalised text; Unicode is folded as documented', () => {
  const sentence = 'Crème brûlée at the café, 9 PM 🦞 sharp';
  // letters-only ciphers: accents stripped to base letters, digits/emoji/punctuation dropped
  const letters = 'CREMEBRULEEATTHECAFEPMSHARP';
  assert.equal(dec('foursquare', enc('foursquare', sentence)), `${letters}X`);
  assert.equal(dec('bifid', enc('bifid', sentence)), letters);
  assert.equal(dec('hill', enc('hill', sentence)), `${letters}X`);
  assert.equal(dec('adfgx', enc('adfgx', sentence)), letters);
  assert.equal(dec('trifid', enc('trifid', sentence)), letters);
  assert.equal(dec('playfair', enc('playfair', sentence)), 'CREMEBRULEEATXTHECAFEPMSHARP', 'TT split with X');
  // digits survive in ADFGVX and fractionated Morse
  assert.equal(dec('adfgvx', enc('adfgvx', sentence)), 'CREMEBRULEEATTHECAFE9PMSHARP');
  assert.equal(dec('fractionatedmorse', enc('fractionatedmorse', sentence)), 'CREME BRULEE AT THE CAFE 9 PM SHARP');
  // folding is the same as typing the plain letters
  assert.equal(enc('bifid', sentence), enc('bifid', letters));
  assert.equal(enc('playfair', 'ß'), enc('playfair', 'SS'));
});

test('fractionated Morse: ACA vector, word gaps, padding', () => {
  assert.equal(enc('fractionatedmorse', 'come at once.'), 'CBIILTMHVVFL');
  assert.equal(enc('fractionatedmorse', 'Come at once', 'roundtable'), 'CBIILTMHVVFL');
  assert.equal(dec('fractionatedmorse', 'CBIIL TMHVV FL'), 'COME AT ONCE');
  for (const text of ['E', 'ET', 'SOS', 'A B C', 'meet at 0900 sharp']) {
    assert.equal(dec('fractionatedmorse', enc('fractionatedmorse', text, 'key'), 'key'), text.toUpperCase());
  }
  assert.equal(enc('fractionatedmorse', ''), '');
  assert.equal(dec('fractionatedmorse', ''), '');
});

test('params: blank or missing falls back to the default, malformed is a clear error', () => {
  const text = 'Attack at dawn';
  for (const transform of GRID_CIPHER_TRANSFORMS) {
    const withDefault = transform.enc(text, transform.param.default);
    assert.equal(transform.enc(text), withDefault, `${transform.id} undefined param`);
    assert.equal(transform.enc(text, ''), withDefault, `${transform.id} empty param`);
    assert.equal(transform.enc(text, '   '), withDefault, `${transform.id} blank param`);
  }
  assert.throws(() => enc('railfence', text, 'three'), /rails must be a whole number/);
  assert.throws(() => enc('railfence', text, '0'), /at least 1/);
  assert.throws(() => enc('scytale', text, '-2'), /whole number/);
  assert.throws(() => enc('route', text, '2.5'), /whole number/);
  assert.throws(() => enc('twosquare', text, 'onlyone'), /two keys/);
  assert.throws(() => enc('foursquare', text, 'a,'), /two keys/);
  assert.throws(() => enc('adfgvx', text, 'abc'), /two keys/);
  assert.throws(() => enc('doubletransposition', text, ',b'), /two keys/);
  assert.throws(() => enc('playfair', text, '1234'), /at least one letter/);
  assert.throws(() => enc('bifid', text, 'key,abc'), /period/);
  assert.throws(() => enc('trifid', text, 'key,-1'), /period/);
  // keys are case- and space-insensitive
  assert.equal(enc('columnar', text, 'z e b r a s'), enc('columnar', text, 'ZEBRAS'));
  assert.equal(enc('playfair', text, 'monarchy'), enc('playfair', text, 'MONARCHY'));
  // huge counts are clamped, not looped over
  assert.equal(dec('railfence', enc('railfence', text, '99999999999999999999'), '99999999999999999999'), text);
});

test('decoders throw clear errors on garbage', () => {
  assert.throws(() => dec('playfair', 'ABC'), /even number/);
  assert.throws(() => dec('playfair', 'AB1C'), /found "1"/);
  assert.throws(() => dec('playfair', 'JAKE'), /except J; found "J"/);
  assert.throws(() => dec('playfair', 'AABC'), /doubled pair/);
  assert.throws(() => dec('foursquare', 'ABC'), /even number/);
  assert.throws(() => dec('foursquare', 'AB-C'), /found "-"/);
  assert.throws(() => dec('bifid', 'HELLO!'), /found "!"/);
  assert.throws(() => dec('trifid', 'ABC?'), /found "\?"/);
  assert.throws(() => dec('adfgx', 'ADFGV'), /found "V"/);
  assert.throws(() => dec('adfgx', 'ADF'), /even number/);
  assert.throws(() => dec('adfgvx', 'AQ'), /found "Q"/);
  assert.throws(() => dec('hill', 'ABC'), /multiple of 2/);
  assert.throws(() => dec('hill', 'AB🦞'), /found "🦞"/);
  assert.throws(() => dec('fractionatedmorse', 'AB3'), /found "3"/);
  // default alphabet: R = "...", so RR is six dots, which is no Morse letter or digit
  assert.throws(() => dec('fractionatedmorse', 'RR'), /"......" is not a Morse letter/);
  // M = "-xx" then P = "x.." puts three separators in a row
  assert.throws(() => dec('fractionatedmorse', 'MP'), /three separators/);
});

test('regressions from the adversarial review', () => {
  // decoders must not expand non-ASCII case mappings into cipher letters
  assert.throws(() => dec('hill', 'ßA'), /found "ß"/);
  assert.throws(() => dec('playfair', 'ﬀAB'), /found "ﬀ"/);
  assert.throws(() => dec('bifid', 'ıA'), /found "ı"/);
  assert.equal(dec('playfair', 'bmodz bxdna'), 'HIDETHEGOL', 'ASCII lower case still accepted');
  // huge Hill entries reduce exactly mod 26 (99999999999999999999999 = 3 mod 26, so same as 3,3,2,5)
  assert.equal(enc('hill', 'HELP', '99999999999999999999999,3,2,5'), 'HIAT');
  assert.equal(dec('hill', 'HIAT', '-99999999999999999999993,3,2,5'), 'HELP');
  // default alphabet: P is trigraph "x..", so the Morse stream would start with a separator
  assert.throws(() => dec('fractionatedmorse', 'PA'), /starts with a letter separator/);
});

test('50 KB of input transforms quickly in both directions', () => {
  const chunk = 'The quick brown fox jumps over the lazy dog 0123456789. ';
  const big = chunk.repeat(Math.ceil(50_000 / chunk.length)).slice(0, 50_000);
  for (const transform of GRID_CIPHER_TRANSFORMS) {
    const started = performance.now();
    const cipher = transform.enc(big);
    if (transform.dec) transform.dec(cipher);
    const elapsed = performance.now() - started;
    assert.ok(elapsed < 200, `${transform.id} took ${elapsed.toFixed(1)} ms`);
  }
});
