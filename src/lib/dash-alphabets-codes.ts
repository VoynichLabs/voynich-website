// Author: Claude Opus 5.5
// Date: 23-Nov-2026
// PURPOSE: Pure text transforms for the DASH page: real writing systems and signalling codes.
//          Two groups, exported together as ALPHABET_CODE_TRANSFORMS:
//            alphabets - each Latin letter becomes a letter of a real Unicode script, case is
//                        dropped, and decode maps the glyphs back:
//                          younger futhark (Runic block, with the dotted medieval runes for the
//                          letters the 16-rune row lacks), Anglo-Saxon futhorc (with its th, ng,
//                          ea, ae, oe and st runes), ogham (stemline text between the feather
//                          marks U+169B / U+169C, ogham space mark U+1680 for spaces), phoenician
//                          (22-letter abjad, word separator U+1091F), gothic (Wulfila's alphabet,
//                          th and hw letters), glagolitic (small letters, zh / ch / sh letters),
//                          old italic (Etruscan-style letters, th / ph / kh / sh letters), coptic
//                          (Greek-derived letters plus the Demotic-derived shai, fai, khai, hori,
//                          janja, shima and ti), greek (transliteration: ph φ, th θ, ch χ, ps ψ,
//                          final sigma, single letters otherwise), hiragana and katakana (real
//                          Hepburn romaji parsing: shi / chi / tsu, n before consonants and n',
//                          small tsu for doubled consonants and tch (never before m),
//                          long vowels written as typed,
//                          macrons as ー in katakana), Standard Galactic Alphabet (the common
//                          Unicode look-alike set), roman numerals (each standalone integer
//                          1-3999), mayan numerals (U+1D2E0 base-20 digits), periodic table
//                          (each word spelled with element symbols by backtracking; words that
//                          cannot be spelled are marked ⟨like this⟩) and seven-segment digits
//                          (U+1FBF0..1FBF9).
//            codes     - flag semaphore (two arm positions as arrows, with the numeric and
//                        letters signs for digits), T9 multi-tap (HELLO -> 44 33 555 555 666),
//                        phone keypad (one digit per letter, lossy, encode only), DTMF (the
//                        row + column frequency pair of each key), Navajo code talker alphabet
//                        (the 1945 Navajo Code Talkers' Dictionary words, rotated through the
//                        alternatives for each letter) and spoken Morse (di-dah words).
//          Standards followed: Unicode charts for each script block (Runic, Ogham, Phoenician,
//          Gothic, Glagolitic, Old Italic, Coptic, Greek, Hiragana, Katakana, Mayan Numerals,
//          Symbols for Legacy Computing); modified Hepburn romanisation; ITU-R M.1677 Morse; ITU-T
//          Q.23 DTMF frequencies; ITU E.161 keypad letters; the standard semaphore circles; the
//          Navajo Code Talkers' Dictionary (US Navy, revised 15 June 1945, public domain).
//          Every function is pure: no DOM, no network, no randomness, no clock. Codes that vary
//          (navajo) rotate deterministically, so output is stable while the user types.
//          Token codes (semaphore, dtmf, navajo, dit dah) separate letters with a space and words
//          with " / " (a literal "/" they pass through is written "//"); line breaks are kept
//          (\r\n becomes \n); runs of spaces and tabs collapse to one word gap.
//          Integration: the DASH pages append ALPHABET_CODE_TRANSFORMS to their registry, the
//          same way as GLYPH_TRANSFORMS; the page needs 'alphabets' and 'codes' in its group order.
//          Shared by voynichlabs.org/dash (Astro) and markbarney.net/dash (React). Tested by
//          tests/dash-alphabets-codes.test.mjs, which transpiles this file alone.
//          SHARED FILE: the master copy is VoynichLabs/voynich-website src/lib/; markbarney.net
//          (82deutschmark/MarkSite) keeps an identical copy in client/src/lib/dash/. Edit the master,
//          then copy it across unchanged.
// SRP/DRY check: Pass - checked dash-transforms.ts and dash-glyphs.ts; none of these transforms
//          existed (the existing 'runes' is Elder Futhark, 'morse' uses ./-). All one-to-one
//          alphabets share alphabetTransform() and all token codes share encodeTokens() /
//          decodeTokens(). The small helpers (code point tables, table inversion) and the Morse
//          table are repeated here on purpose: the test loader transpiles each file alone, so this
//          module may only take a type import from ./dash-glyphs.
import type { DashTransform } from './dash-glyphs';

type TextFn = DashTransform['enc'];

// ---------------------------------------------------------------------------------------------
// shared helpers
// ---------------------------------------------------------------------------------------------

/** Build a key -> glyph table from code points so the source stays exact and auditable. */
function fromCodePoints(table: Record<string, number>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(table).map(([plain, codePoint]) => [plain, String.fromCodePoint(codePoint)]),
  );
}

/** Invert a one-to-one table into a Map. Throws if two keys share a glyph (decode would be ambiguous). */
function invertToMap(table: Record<string, string>): Map<string, string> {
  const inverted = new Map<string, string>();
  for (const [plain, coded] of Object.entries(table)) {
    const previous = inverted.get(coded);
    if (previous !== undefined) {
      throw new Error(`table is not one-to-one: "${coded}" is used for both "${previous}" and "${plain}"`);
    }
    inverted.set(coded, plain);
  }
  return inverted;
}

/** Length in code points (not UTF-16 units). */
function codePointLength(text: string): number {
  return Array.from(text).length;
}

/**
 * Greedy longest-match substitution over code points. `lookup` maps a candidate (1..maxLength
 * code points, optionally lower-cased) to its replacement; unmatched characters pass through.
 */
function greedyReplace(input: string, lookup: Map<string, string>, maxLength: number, foldCase: boolean): string {
  const chars = Array.from(input);
  const out: string[] = [];
  let index = 0;
  while (index < chars.length) {
    let matched = false;
    for (let length = Math.min(maxLength, chars.length - index); length >= 1; length--) {
      const raw = length === 1 ? chars[index] : chars.slice(index, index + length).join('');
      const replacement = lookup.get(foldCase ? raw.toLowerCase() : raw);
      if (replacement !== undefined) {
        out.push(replacement);
        index += length;
        matched = true;
        break;
      }
    }
    if (!matched) {
      out.push(chars[index]);
      index++;
    }
  }
  return out.join('');
}

interface AlphabetSpec {
  /** One-to-one table: plain key (1-3 lowercase characters) -> glyph sequence. */
  letters: Record<string, string>;
  /** Encode-only: a letter the script lacks -> the plain keys written for it (decode gives those keys). */
  aliases?: Record<string, string>;
  /** Decode-only: extra glyph forms -> plain text (e.g. Greek final sigma). */
  decodeOnly?: Record<string, string>;
}

/**
 * Encoder/decoder pair for a letter-substitution alphabet. Encode lower-cases and takes the
 * longest matching key (so digraphs such as "th" win over "t"); decode takes the longest
 * matching glyph sequence. Anything not in the table passes through unchanged both ways.
 */
function alphabetTransform(spec: AlphabetSpec): { enc: TextFn; dec: TextFn } {
  const encodeMap = new Map<string, string>(Object.entries(spec.letters));
  for (const [letter, keys] of Object.entries(spec.aliases ?? {})) {
    const glyphs = Array.from(keys, (key) => {
      const glyph = spec.letters[key];
      if (glyph === undefined) throw new Error(`alias "${letter}" points at missing key "${key}"`);
      return glyph;
    });
    encodeMap.set(letter, glyphs.join(''));
  }
  const decodeMap = invertToMap(spec.letters);
  for (const [glyph, plain] of Object.entries(spec.decodeOnly ?? {})) decodeMap.set(glyph, plain);
  const maxKey = Math.max(...Array.from(encodeMap.keys(), codePointLength));
  const maxGlyph = Math.max(...Array.from(decodeMap.keys(), codePointLength));
  return {
    enc: (input) => greedyReplace(input, encodeMap, maxKey, true),
    dec: (input) => greedyReplace(input, decodeMap, maxGlyph, false),
  };
}

/** A literal "/" passed through by a token code is written "//", so it is not read as a word gap. */
const WORD_GAP = '/';
const ESCAPED_SLASH = '//';

/**
 * Token codes: each character becomes a token (charToToken may return several tokens joined by
 * spaces). Tokens are separated by a space, words by " / ", and line breaks are kept. A "/" the
 * code passes through unchanged is escaped as "//".
 */
function encodeTokens(input: string, charToToken: (char: string) => string): string {
  return input.split(/\r?\n/).map((line) =>
    line.split(/[^\S\n]+/).filter((word) => word !== '')
      .map((word) => Array.from(word, (char) => {
        const token = charToToken(char);
        return token === WORD_GAP ? ESCAPED_SLASH : token;
      }).filter((token) => token !== '').join(' '))
      .join(' / '),
  ).join('\n');
}

/** Inverse of encodeTokens: "/" is a word gap, "//" a literal slash, other tokens go through tokenToText. */
function decodeTokens(input: string, tokenToText: (token: string) => string): string {
  return input.split(/\r?\n/).map((line) => {
    const tokens = line.trim().split(/\s+/).filter((token) => token !== '');
    return tokens.map((token) => {
      if (token === WORD_GAP) return ' ';
      if (token === ESCAPED_SLASH) return '/';
      return tokenToText(token);
    }).join('');
  }).join('\n');
}

/** ITU E.161 phone keypad letters. */
const KEYPAD_LETTERS: Record<string, string> = {
  '2': 'abc', '3': 'def', '4': 'ghi', '5': 'jkl', '6': 'mno', '7': 'pqrs', '8': 'tuv', '9': 'wxyz',
};
const LETTER_TO_KEY: Record<string, string> = Object.fromEntries(
  Object.entries(KEYPAD_LETTERS).flatMap(([key, letters]) => Array.from(letters, (letter) => [letter, key])),
);

// ---------------------------------------------------------------------------------------------
// alphabets: runes
// Younger Futhark has only 16 runes, so the letters it lacks use the dotted / extra runes of the
// medieval runic alphabet (dotted i = e, dotted k = g, dotted t = d, dotted b = p, and the
// medieval c, v, w, q, x, z). j is written with i, as medieval carvers did. th is thurs ᚦ.
// ---------------------------------------------------------------------------------------------

const YOUNGER_FUTHARK = alphabetTransform({
  letters: fromCodePoints({
    a: 0x16c5, b: 0x16d2, c: 0x16cd, d: 0x16d1, e: 0x16c2, f: 0x16a0, g: 0x16b5, h: 0x16bc,
    i: 0x16c1, k: 0x16b4, l: 0x16da, m: 0x16d8, n: 0x16be, o: 0x16ac, p: 0x16d4, q: 0x16e9,
    r: 0x16b1, s: 0x16cb, t: 0x16cf, u: 0x16a2, v: 0x16a1, w: 0x16a5, x: 0x16ea, y: 0x16e6,
    z: 0x16ce, th: 0x16a6,
  }),
  aliases: { j: 'i' },
  // Short-twig (Rök-style) forms of the same runes, so real Younger Futhark text decodes too.
  decodeOnly: Object.fromEntries(Object.entries({ a: 0x16c6, h: 0x16bd, n: 0x16bf, s: 0x16cc, t: 0x16d0, b: 0x16d3, m: 0x16d9, o: 0x16ad, y: 0x16e7 })
    .map(([plain, codePoint]) => [String.fromCodePoint(codePoint), plain])),
});

// Anglo-Saxon futhorc: ac, cen, calc, cweorth, ger, eolhx, yr, plus the digraph runes thorn,
// ing, ear, aesc, ethel (oe) and stan (st). v has no Old English rune; it takes the medieval v.
const FUTHORC = alphabetTransform({
  letters: fromCodePoints({
    a: 0x16aa, b: 0x16d2, c: 0x16b3, d: 0x16de, e: 0x16d6, f: 0x16a0, g: 0x16b7, h: 0x16bb,
    i: 0x16c1, j: 0x16c4, k: 0x16e3, l: 0x16da, m: 0x16d7, n: 0x16be, o: 0x16a9, p: 0x16c8,
    q: 0x16e2, r: 0x16b1, s: 0x16cb, t: 0x16cf, u: 0x16a2, v: 0x16a1, w: 0x16b9, x: 0x16c9,
    y: 0x16a3, z: 0x16ce,
    th: 0x16a6, ng: 0x16dd, ea: 0x16e0, ae: 0x16ab, oe: 0x16df, st: 0x16e5,
  }),
});

// ---------------------------------------------------------------------------------------------
// alphabets: ogham. The 20 aicmi letters plus the forfeda for letters Irish lacked
// (ébad = k, emancholl = x, ifín = j, uilleann = y, óir = v); w uses ngéadal, whose original
// value was gw. Spaces become the ogham space mark; the text sits between feather marks.
// ---------------------------------------------------------------------------------------------

const OGHAM_START = '᚛';
const OGHAM_END = '᚜';
const OGHAM = alphabetTransform({
  letters: fromCodePoints({
    b: 0x1681, l: 0x1682, f: 0x1683, s: 0x1684, n: 0x1685, h: 0x1686, d: 0x1687, t: 0x1688,
    c: 0x1689, q: 0x168a, m: 0x168b, g: 0x168c, w: 0x168d, z: 0x168e, r: 0x168f, a: 0x1690,
    o: 0x1691, u: 0x1692, e: 0x1693, i: 0x1694, k: 0x1695, v: 0x1696, y: 0x1697, j: 0x1698,
    x: 0x1699, p: 0x169a, ' ': 0x1680,
  }),
});
const oghamEncode: TextFn = (input) => (input === '' ? '' : OGHAM_START + OGHAM.enc(input) + OGHAM_END);
const oghamDecode: TextFn = (input) => OGHAM.dec(input.replace(/[᚛᚜]/g, ''));

// ---------------------------------------------------------------------------------------------
// alphabets: Phoenician (22-letter abjad, right to left). Letters follow their Greek / Latin
// descendants: wau = w (u, v share it), yod = i (j, y share it), pe = p (f shares it, as in
// Hebrew pe/fe), samekh = x, ayin = o, tet = th, sade = c. Spaces use the word separator.
// ---------------------------------------------------------------------------------------------

const PHOENICIAN = alphabetTransform({
  letters: fromCodePoints({
    a: 0x10900, b: 0x10901, g: 0x10902, d: 0x10903, e: 0x10904, w: 0x10905, z: 0x10906,
    h: 0x10907, th: 0x10908, i: 0x10909, k: 0x1090a, l: 0x1090b, m: 0x1090c, n: 0x1090d,
    x: 0x1090e, o: 0x1090f, p: 0x10910, c: 0x10911, q: 0x10912, r: 0x10913, s: 0x10914,
    t: 0x10915, ' ': 0x1091f,
  }),
  aliases: { f: 'p', u: 'w', v: 'w', j: 'i', y: 'i' },
});

// ---------------------------------------------------------------------------------------------
// alphabets: Gothic (Wulfila). thiuth = th, hwair = hw, iuja = z, jer = j, iggws = x.
// Gothic has no c, v or y: c is written with kusma (k), v with winja (w), y with eis (i).
// ---------------------------------------------------------------------------------------------

const GOTHIC = alphabetTransform({
  letters: fromCodePoints({
    a: 0x10330, b: 0x10331, g: 0x10332, d: 0x10333, e: 0x10334, q: 0x10335, z: 0x10336,
    h: 0x10337, th: 0x10338, i: 0x10339, k: 0x1033a, l: 0x1033b, m: 0x1033c, n: 0x1033d,
    j: 0x1033e, u: 0x1033f, p: 0x10340, r: 0x10342, s: 0x10343, t: 0x10344, w: 0x10345,
    f: 0x10346, x: 0x10347, hw: 0x10348, o: 0x10349,
  }),
  aliases: { c: 'k', v: 'w', y: 'i' },
});

// ---------------------------------------------------------------------------------------------
// alphabets: Glagolitic (small letters). djervi = j, tsi = c, yeru = y, zhivete = zh,
// chrivi = ch, sha = sh. No q, w or x: q is written kako (k), w vede (v), x as k + s.
// ---------------------------------------------------------------------------------------------

const GLAGOLITIC = alphabetTransform({
  letters: fromCodePoints({
    a: 0x2c30, b: 0x2c31, v: 0x2c32, g: 0x2c33, d: 0x2c34, e: 0x2c35, zh: 0x2c36, z: 0x2c38,
    i: 0x2c39, j: 0x2c3c, k: 0x2c3d, l: 0x2c3e, m: 0x2c3f, n: 0x2c40, o: 0x2c41, p: 0x2c42,
    r: 0x2c43, s: 0x2c44, t: 0x2c45, u: 0x2c46, f: 0x2c47, h: 0x2c48, c: 0x2c4c, ch: 0x2c4d,
    sh: 0x2c4e, y: 0x2c4f,
  }),
  aliases: { q: 'k', w: 'v', x: 'ks' },
});

// ---------------------------------------------------------------------------------------------
// alphabets: Old Italic (the Etruscan-derived alphabets Latin grew from). ve (digamma) = v,
// uu = w, ii = j, ye = y, eks = x, the = th, phe = ph, khe = kh, she = sh. Etruscan had no
// g: like early Latin, g is written with the c letter (gamma), so it decodes as c.
// ---------------------------------------------------------------------------------------------

const OLD_ITALIC = alphabetTransform({
  letters: fromCodePoints({
    a: 0x10300, b: 0x10301, c: 0x10302, d: 0x10303, e: 0x10304, v: 0x10305, z: 0x10306,
    h: 0x10307, th: 0x10308, i: 0x10309, k: 0x1030a, l: 0x1030b, m: 0x1030c, n: 0x1030d,
    o: 0x1030f, p: 0x10310, sh: 0x10311, q: 0x10312, r: 0x10313, s: 0x10314, t: 0x10315,
    u: 0x10316, x: 0x10317, ph: 0x10318, kh: 0x10319, f: 0x1031a, j: 0x1031d, w: 0x1031e,
    y: 0x1032d,
  }),
  aliases: { g: 'c' },
});

// ---------------------------------------------------------------------------------------------
// alphabets: Coptic (small letters). Greek-derived letters plus the Demotic-derived shai (sh),
// fai (f), khai (q), hori (h), janja (j), shima (c) and ti (ti). thethe = th, phi = ph,
// khi = ch, psi = ps, oou = w, sou = v, hate (eta) = y.
// ---------------------------------------------------------------------------------------------

const COPTIC = alphabetTransform({
  letters: fromCodePoints({
    a: 0x2c81, b: 0x2c83, g: 0x2c85, d: 0x2c87, e: 0x2c89, v: 0x2c8b, z: 0x2c8d, y: 0x2c8f,
    th: 0x2c91, i: 0x2c93, k: 0x2c95, l: 0x2c97, m: 0x2c99, n: 0x2c9b, x: 0x2c9d, o: 0x2c9f,
    p: 0x2ca1, r: 0x2ca3, s: 0x2ca5, t: 0x2ca7, u: 0x2ca9, ph: 0x2cab, ch: 0x2cad, ps: 0x2caf,
    w: 0x2cb1, sh: 0x03e3, f: 0x03e5, q: 0x03e7, h: 0x03e9, j: 0x03eb, c: 0x03ed, ti: 0x03ef,
  }),
});

// ---------------------------------------------------------------------------------------------
// alphabets: Greek transliteration. ph φ, th θ, ch χ, ps ψ; single letters otherwise. Letters
// Greek lacks use real Greek letters: c lunate sigma ϲ, f phi symbol ϕ, j yot ϳ, q koppa ϙ,
// v digamma ϝ, w omega ω, y upsilon with dialytika ϋ, h eta η. s is σ, or ς at a word's end.
// ---------------------------------------------------------------------------------------------

const GREEK = alphabetTransform({
  letters: fromCodePoints({
    a: 0x03b1, b: 0x03b2, g: 0x03b3, d: 0x03b4, e: 0x03b5, z: 0x03b6, h: 0x03b7, th: 0x03b8,
    i: 0x03b9, k: 0x03ba, l: 0x03bb, m: 0x03bc, n: 0x03bd, x: 0x03be, o: 0x03bf, p: 0x03c0,
    r: 0x03c1, s: 0x03c3, t: 0x03c4, u: 0x03c5, ph: 0x03c6, ch: 0x03c7, ps: 0x03c8, w: 0x03c9,
    c: 0x03f2, f: 0x03d5, j: 0x03f3, q: 0x03d9, v: 0x03dd, y: 0x03cb,
  }),
  decodeOnly: { 'ς': 's' },
});
const greekEncode: TextFn = (input) => GREEK.enc(input).replace(/σ(?![\p{L}\p{M}])/gu, 'ς');
/**
 * Accepts pasted real Greek too: each precomposed Greek letter (basic and polytonic blocks) is
 * lower-cased and stripped of accents and breathings (ή -> η), keeping only the diaeresis so the
 * encoder's ϋ (y) survives. Combining marks typed separately are left alone, so decomposed input
 * such as e + U+0301 still round-trips.
 */
const greekDecode: TextFn = (input) =>
  GREEK.dec(input.replace(/[Ά-ώϹἀ-῿]/g, (char) =>
    char.normalize('NFD').replace(/[̀-̇̉-ͯ]/g, '').normalize('NFC').toLowerCase()));

// ---------------------------------------------------------------------------------------------
// alphabets: hiragana / katakana with modified Hepburn parsing.
// Encode: longest syllable match (shi, chi, tsu, kya, ...); n before a consonant or at the end is
// ん, and n' before a vowel or y; mm is not a small tsu (an m that forms no syllable stays Latin); a doubled consonant (kk, ss, pp...) or tch is small tsu; long
// vowels are written as typed (ou, aa), and macron / circumflex vowels become ー in katakana or a
// written vowel (ō = おう) in hiragana. Kunrei spellings (si, ti, tu, hu, zi, sya...) are accepted.
// Letters that form no syllable (l, q, x, c without h, consonant clusters) pass through as Latin.
// Decode (shared, accepts either script): kana -> Hepburn romaji, n' where needed, ー -> macron.
// ---------------------------------------------------------------------------------------------

/** Hepburn syllables, both directions. Every kana sequence here is unique. */
const KANA_HEPBURN: Record<string, string> = {
  a: 'あ', i: 'い', u: 'う', e: 'え', o: 'お',
  ka: 'か', ki: 'き', ku: 'く', ke: 'け', ko: 'こ', ga: 'が', gi: 'ぎ', gu: 'ぐ', ge: 'げ', go: 'ご',
  sa: 'さ', shi: 'し', su: 'す', se: 'せ', so: 'そ', za: 'ざ', ji: 'じ', zu: 'ず', ze: 'ぜ', zo: 'ぞ',
  ta: 'た', chi: 'ち', tsu: 'つ', te: 'て', to: 'と', da: 'だ', de: 'で', do: 'ど',
  na: 'な', ni: 'に', nu: 'ぬ', ne: 'ね', no: 'の',
  ha: 'は', hi: 'ひ', fu: 'ふ', he: 'へ', ho: 'ほ', ba: 'ば', bi: 'び', bu: 'ぶ', be: 'べ', bo: 'ぼ',
  pa: 'ぱ', pi: 'ぴ', pu: 'ぷ', pe: 'ぺ', po: 'ぽ',
  ma: 'ま', mi: 'み', mu: 'む', me: 'め', mo: 'も', ya: 'や', yu: 'ゆ', yo: 'よ',
  ra: 'ら', ri: 'り', ru: 'る', re: 'れ', ro: 'ろ', wa: 'わ', wo: 'を', vu: 'ゔ',
  kya: 'きゃ', kyu: 'きゅ', kyo: 'きょ', gya: 'ぎゃ', gyu: 'ぎゅ', gyo: 'ぎょ',
  sha: 'しゃ', shu: 'しゅ', sho: 'しょ', she: 'しぇ', ja: 'じゃ', ju: 'じゅ', jo: 'じょ', je: 'じぇ',
  cha: 'ちゃ', chu: 'ちゅ', cho: 'ちょ', che: 'ちぇ', nya: 'にゃ', nyu: 'にゅ', nyo: 'にょ',
  hya: 'ひゃ', hyu: 'ひゅ', hyo: 'ひょ', bya: 'びゃ', byu: 'びゅ', byo: 'びょ',
  pya: 'ぴゃ', pyu: 'ぴゅ', pyo: 'ぴょ', mya: 'みゃ', myu: 'みゅ', myo: 'みょ',
  rya: 'りゃ', ryu: 'りゅ', ryo: 'りょ',
  fa: 'ふぁ', fi: 'ふぃ', fe: 'ふぇ', fo: 'ふぉ', va: 'ゔぁ', vi: 'ゔぃ', ve: 'ゔぇ', vo: 'ゔぉ',
  wi: 'うぃ', we: 'うぇ',
};
/** Kunrei / Nihon-shiki spellings accepted on input; they decode in Hepburn. */
const KANA_INPUT_ALIASES: Record<string, string> = {
  si: 'し', ti: 'ち', tu: 'つ', hu: 'ふ', zi: 'じ', di: 'ぢ', du: 'づ',
  sya: 'しゃ', syu: 'しゅ', syo: 'しょ', zya: 'じゃ', zyu: 'じゅ', zyo: 'じょ',
  jya: 'じゃ', jyu: 'じゅ', jyo: 'じょ', tya: 'ちゃ', tyu: 'ちゅ', tyo: 'ちょ',
};
/** Kana that only appear on decode (old or stray small kana). */
const KANA_DECODE_ONLY: Record<string, string> = {
  'ぢ': 'ji', 'づ': 'zu', 'ゐ': 'wi', 'ゑ': 'we',
  'ぁ': 'a', 'ぃ': 'i', 'ぅ': 'u', 'ぇ': 'e', 'ぉ': 'o', 'ゃ': 'ya', 'ゅ': 'yu', 'ょ': 'yo',
  'ゎ': 'wa', 'ゕ': 'ka', 'ゖ': 'ke',
};
const ROMAJI_TO_KANA = new Map<string, string>([...Object.entries(KANA_HEPBURN), ...Object.entries(KANA_INPUT_ALIASES)]);
const KANA_TO_ROMAJI = new Map<string, string>([...invertToMap(KANA_HEPBURN), ...Object.entries(KANA_DECODE_ONLY)]);
const SMALL_TSU = 'っ';
const SYLLABIC_N = 'ん';
const CHOONPU = 'ー';
/** Internal marker for "the previous vowel is long" (a combining macron). */
const LONG_MARK = '̄';
const MACRON_VOWELS: Record<string, string> = {
  'ā': 'a', 'ī': 'i', 'ū': 'u', 'ē': 'e', 'ō': 'o', 'â': 'a', 'î': 'i', 'û': 'u', 'ê': 'e', 'ô': 'o',
};
const VOWEL_KANA: Record<string, string> = { a: 'あ', i: 'い', u: 'う', e: 'え', o: 'お' };
const MACRON_OF: Record<string, string> = { a: 'ā', i: 'ī', u: 'ū', e: 'ē', o: 'ō' };

/** Longest romaji syllable starting at index: [kana, romaji length] or null. */
function matchSyllable(chars: string[], index: number): [string, string] | null {
  for (let length = 3; length >= 1; length--) {
    if (index + length > chars.length) continue;
    const key = chars.slice(index, index + length).join('');
    const kana = ROMAJI_TO_KANA.get(key);
    if (kana !== undefined) return [kana, key];
  }
  return null;
}

function toKatakana(hiragana: string): string {
  return hiragana.replace(/[ぁ-ゖ]/g, (char) => String.fromCharCode(char.charCodeAt(0) + 0x60));
}
function toHiragana(katakana: string): string {
  return katakana.replace(/[ァ-ヶ]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0x60));
}

function kanaEncode(input: string, katakana: boolean): string {
  const chars = Array.from(input.normalize('NFC').toLowerCase()).flatMap((char) => {
    const base = MACRON_VOWELS[char];
    return base === undefined ? [char] : [base, LONG_MARK];
  });
  const out: string[] = [];
  let lastVowel: string | null = null;
  let index = 0;
  while (index < chars.length) {
    const char = chars[index];
    if (char === LONG_MARK && lastVowel !== null) {
      out.push(katakana ? CHOONPU : lastVowel === 'o' ? 'う' : VOWEL_KANA[lastVowel]);
      lastVowel = null;
      index++;
      continue;
    }
    // Small tsu never comes before m or n in Japanese, so mm (summer, gumma) is not doubled: the
    // first m stays Latin, which keeps English text exact on the round trip.
    const isConsonant = /^[b-df-hj-lp-tv-z]$/.test(char);
    if (isConsonant) {
      const next = chars[index + 1];
      const doubled = next === char || (char === 't' && next === 'c' && chars[index + 2] === 'h');
      if (doubled && matchSyllable(chars, index + 1) !== null) {
        out.push(SMALL_TSU);
        lastVowel = null;
        index++;
        continue;
      }
    }
    const syllable = matchSyllable(chars, index);
    if (syllable !== null) {
      out.push(syllable[0]);
      lastVowel = syllable[1].slice(-1);
      index += syllable[1].length;
      continue;
    }
    lastVowel = null;
    if (char === 'n') {
      out.push(SYLLABIC_N);
      index++;
      // n' before a vowel or y is just the separator Hepburn uses; it belongs to the ん.
      if (chars[index] === "'" && /^[aiueoy]$/.test(chars[index + 1] ?? '')) index++;
      continue;
    }
    out.push(char);
    index++;
  }
  const hiragana = out.join('');
  return katakana ? toKatakana(hiragana) : hiragana;
}

/** Romaji of the kana at index (two-kana combinations first): [romaji, kana length] or null. */
function romajiAt(chars: string[], index: number): [string, number] | null {
  if (index >= chars.length) return null;
  if (index + 1 < chars.length) {
    const pair = KANA_TO_ROMAJI.get(chars[index] + chars[index + 1]);
    if (pair !== undefined) return [pair, 2];
  }
  const single = KANA_TO_ROMAJI.get(chars[index]);
  return single === undefined ? null : [single, 1];
}

const kanaDecode: TextFn = (input) => {
  const chars = Array.from(toHiragana(input));
  let out = '';
  let index = 0;
  while (index < chars.length) {
    const char = chars[index];
    if (char === SMALL_TSU) {
      const next = romajiAt(chars, index + 1);
      if (next !== null && /^[bcdfghjkmpqrstvwxz]/.test(next[0])) {
        out += next[0].startsWith('ch') ? 't' : next[0][0];
      } else {
        out += "'"; // a stray small tsu (a glottal stop, as in あっ) has no consonant to double
      }
      index++;
      continue;
    }
    if (char === SYLLABIC_N) {
      const next = romajiAt(chars, index + 1);
      out += next !== null && /^[aiueoy]/.test(next[0]) ? "n'" : 'n';
      index++;
      continue;
    }
    if (char === CHOONPU) {
      const lastChar = out.slice(-1);
      const macron = MACRON_OF[lastChar];
      out = macron === undefined ? `${out}-` : out.slice(0, -1) + macron;
      index++;
      continue;
    }
    const syllable = romajiAt(chars, index);
    if (syllable !== null) {
      out += syllable[0];
      index += syllable[1];
      continue;
    }
    out += char;
    index++;
  }
  return out;
};

// ---------------------------------------------------------------------------------------------
// alphabets: Standard Galactic Alphabet (Commander Keen), as the widely used Unicode look-alike
// set. Some letters are several code points (p !¡, t ℸ + space + dot below, x dot above + /,
// y ||); decode matches the longest sequence first, so each letter comes back exactly.
// ---------------------------------------------------------------------------------------------

const GALACTIC = alphabetTransform({
  letters: {
    a: 'ᔑ', b: 'ʖ', c: 'ᓵ', d: '↸', e: 'ᒷ', f: '⎓', g: '⊣', h: '⍑', i: '╎', j: '⋮', k: 'ꖌ',
    l: 'ꖎ', m: 'ᒲ', n: 'リ', o: '𝙹', p: '!¡', q: 'ᑑ', r: '∷', s: 'ᓭ', t: 'ℸ ̣', u: '⚍',
    v: '⍊', w: '∴', x: '̇/', y: '||', z: '⨅',
  },
});

// ---------------------------------------------------------------------------------------------
// alphabets: Roman numerals. Each standalone integer 1-3999 (not touching letters or other
// digits, no leading zero) is replaced; decode turns each standalone canonical numeral back.
// ---------------------------------------------------------------------------------------------

const ROMAN_STEPS: Array<[number, string]> = [
  [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'],
  [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
];
const ROMAN_CANONICAL = /^M{0,3}(?:CM|CD|D?C{0,3})(?:XC|XL|L?X{0,3})(?:IX|IV|V?I{0,3})$/;
const ROMAN_VALUE: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };

function toRoman(value: number): string {
  let remaining = value;
  let out = '';
  for (const [step, symbol] of ROMAN_STEPS) {
    while (remaining >= step) {
      out += symbol;
      remaining -= step;
    }
  }
  return out;
}
function fromRoman(numeral: string): number {
  let total = 0;
  for (let index = 0; index < numeral.length; index++) {
    const current = ROMAN_VALUE[numeral[index]];
    const next = index + 1 < numeral.length ? ROMAN_VALUE[numeral[index + 1]] : 0;
    total += current < next ? -current : current;
  }
  return total;
}
const romanEncode: TextFn = (input) =>
  input.replace(/(?<![\p{L}\p{N}])\d+(?![\p{L}\p{N}])/gu, (run) => {
    if (run.length > 4 || (run.length > 1 && run.startsWith('0'))) return run;
    const value = Number(run);
    return value >= 1 && value <= 3999 ? toRoman(value) : run;
  });
const romanDecode: TextFn = (input) =>
  input.replace(/(?<![\p{L}\p{N}])[MDCLXVI]+(?![\p{L}\p{N}])/gu, (word) =>
    (ROMAN_CANONICAL.test(word) ? String(fromRoman(word)) : word));

// ---------------------------------------------------------------------------------------------
// alphabets: Mayan numerals. Each integer is written in base 20 with the Mayan digit signs
// U+1D2E0 (zero) .. U+1D2F3 (nineteen), most significant first, left to right. BigInt keeps
// long numbers exact. Runs with a leading zero (007) are left alone, since base 20 cannot keep it.
// ---------------------------------------------------------------------------------------------

const MAYAN_ZERO = 0x1d2e0;
const mayanEncode: TextFn = (input) =>
  input.replace(/\d+/g, (run) => {
    if (run.length > 1 && run.startsWith('0')) return run;
    return Array.from(BigInt(run).toString(20), (digit) => String.fromCodePoint(MAYAN_ZERO + parseInt(digit, 20))).join('');
  });
const mayanDecode: TextFn = (input) =>
  input.replace(/[\u{1d2e0}-\u{1d2f3}]+/gu, (run) => {
    const digits = Array.from(run, (char) => (char.codePointAt(0) ?? MAYAN_ZERO) - MAYAN_ZERO);
    if (digits.length > 1 && digits[0] === 0) throw new Error('a Mayan number cannot start with a zero shell');
    // Fold 10 base-20 digits at a time into the BigInt so long numbers stay fast.
    let value = 0n;
    for (let start = 0; start < digits.length; start += 10) {
      const chunk = digits.slice(start, start + 10);
      let chunkValue = 0;
      for (const digit of chunk) chunkValue = chunkValue * 20 + digit;
      value = value * 20n ** BigInt(chunk.length) + BigInt(chunkValue);
    }
    return value.toString();
  });

// ---------------------------------------------------------------------------------------------
// alphabets: periodic table. Each word (run of a-z) is spelled with element symbols, found by
// backtracking from the end of the word (two-letter symbols tried first). A word that cannot be
// spelled is kept and marked ⟨like this⟩. Decode checks every run is a chain of real symbols
// (each starts with a capital) and joins them in lower case.
// ---------------------------------------------------------------------------------------------

const ELEMENT_SYMBOLS = (
  'H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se ' +
  'Br Kr Rb Sr Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe Cs Ba La Ce Pr Nd Pm Sm Eu Gd Tb Dy ' +
  'Ho Er Tm Yb Lu Hf Ta W Re Os Ir Pt Au Hg Tl Pb Bi Po At Rn Fr Ra Ac Th Pa U Np Pu Am Cm Bk Cf ' +
  'Es Fm Md No Lr Rf Db Sg Bh Hs Mt Ds Rg Cn Nh Fl Mc Lv Ts Og'
).split(' ');
const SYMBOL_BY_LOWER = new Map(ELEMENT_SYMBOLS.map((symbol) => [symbol.toLowerCase(), symbol]));
const SYMBOL_SET = new Set(ELEMENT_SYMBOLS);
const UNSPELLABLE_OPEN = '⟨';
const UNSPELLABLE_CLOSE = '⟩';

/** Spell a lower-case word with element symbols, or return null if no spelling exists. */
function spellWithElements(word: string): string[] | null {
  // next[i] = length of the symbol chosen at i on some full spelling of word[i..], or 0 if none.
  const next = new Array<number>(word.length + 1).fill(0);
  const solvable = new Array<boolean>(word.length + 1).fill(false);
  solvable[word.length] = true;
  for (let index = word.length - 1; index >= 0; index--) {
    for (const length of [2, 1]) {
      if (index + length <= word.length && solvable[index + length] && SYMBOL_BY_LOWER.has(word.slice(index, index + length))) {
        solvable[index] = true;
        next[index] = length;
        break;
      }
    }
  }
  if (!solvable[0]) return null;
  const symbols: string[] = [];
  for (let index = 0; index < word.length; index += next[index]) {
    symbols.push(SYMBOL_BY_LOWER.get(word.slice(index, index + next[index])) ?? '');
  }
  return symbols;
}

const periodicEncode: TextFn = (input) =>
  input.replace(/[A-Za-z]+/g, (word) => {
    const symbols = spellWithElements(word.toLowerCase());
    return symbols === null ? UNSPELLABLE_OPEN + word + UNSPELLABLE_CLOSE : symbols.join('');
  });
const periodicDecode: TextFn = (input) =>
  input.split(/(⟨[^⟨⟩]*⟩)/).map((part) => {
    if (part.startsWith(UNSPELLABLE_OPEN) && part.endsWith(UNSPELLABLE_CLOSE)) return part.slice(1, -1);
    return part.replace(/[A-Za-z]+/g, (run) => {
      const symbols = /^(?:[A-Z][a-z]?)+$/.test(run) ? run.match(/[A-Z][a-z]?/g) ?? [] : [];
      const bad = symbols.length === 0 ? run : symbols.find((symbol) => !SYMBOL_SET.has(symbol));
      if (bad !== undefined) {
        throw new Error(`"${run}" is not a chain of element symbols (expected e.g. CaRbON); "${bad}" is not an element`);
      }
      return run.toLowerCase();
    });
  }).join('');

// ---------------------------------------------------------------------------------------------
// alphabets: seven-segment digits (Symbols for Legacy Computing, U+1FBF0..1FBF9).
// ---------------------------------------------------------------------------------------------

const SEVEN_SEGMENT = alphabetTransform({
  letters: fromCodePoints(Object.fromEntries(Array.from({ length: 10 }, (_, digit) => [String(digit), 0x1fbf0 + digit]))),
});

// ---------------------------------------------------------------------------------------------
// codes: flag semaphore. Arm positions as seen by the reader: ↓ ↙ ← ↖ ↑ ↗ → ↘. The letters
// follow the standard circles: A-G (one flag down), H-N without J (one flag low left), O-S
// (one flag left), T U Y (one flag high left), J V (one flag up), W X, then Z. Digits use the
// numeric sign (↗↑) then A-I = 1-9 and K = 0; J (→↑) switches back to letters. Decode ignores
// the order of the two arrows; annul (↘↖) erases the previous character; rest (↓↓) is a space.
// ---------------------------------------------------------------------------------------------

const SEMAPHORE: Record<string, string> = {
  a: '↙↓', b: '←↓', c: '↖↓', d: '↑↓', e: '↗↓', f: '→↓', g: '↘↓',
  h: '←↙', i: '↖↙', k: '↑↙', l: '↗↙', m: '→↙', n: '↘↙',
  o: '↖←', p: '↑←', q: '↗←', r: '→←', s: '↘←',
  t: '↑↖', u: '↗↖', y: '→↖',
  j: '→↑', v: '↘↑',
  w: '→↗', x: '↘↗',
  z: '↘→',
};
const SEMAPHORE_NUMERIC = '↗↑';
const SEMAPHORE_ANNUL = '↘↖';
const SEMAPHORE_REST = '↓↓';
const SEMAPHORE_ARROWS = new Set(Array.from('↓↙←↖↑↗→↘'));
const DIGIT_TO_SEMAPHORE_LETTER: Record<string, string> = {
  '1': 'a', '2': 'b', '3': 'c', '4': 'd', '5': 'e', '6': 'f', '7': 'g', '8': 'h', '9': 'i', '0': 'k',
};
const SEMAPHORE_LETTER_TO_DIGIT: Record<string, string> = Object.fromEntries(
  Object.entries(DIGIT_TO_SEMAPHORE_LETTER).map(([digit, letter]) => [letter, digit]),
);
const sortArrows = (pair: string): string => Array.from(pair).sort().join('');
const SEMAPHORE_BY_POSITION = new Map<string, string>(
  Object.entries(SEMAPHORE).map(([letter, pair]) => [sortArrows(pair), letter]),
);

const semaphoreEncode: TextFn = (input) => {
  let numeric = false;
  return encodeTokens(input, (char) => {
    const lower = char.toLowerCase();
    const digitLetter = DIGIT_TO_SEMAPHORE_LETTER[char];
    if (digitLetter !== undefined) {
      const token = SEMAPHORE[digitLetter];
      if (numeric) return token;
      numeric = true;
      return `${SEMAPHORE_NUMERIC} ${token}`;
    }
    const letter = SEMAPHORE[lower];
    if (letter === undefined) return char;
    if (!numeric) return letter;
    numeric = false;
    return `${SEMAPHORE.j} ${letter}`;
  });
};

const semaphoreDecode: TextFn = (input) => {
  let numeric = false;
  return input.split(/\r?\n/).map((line) => {
    // Code points, so annul can drop the last character in O(1) (a string rebuild per annul
    // made long annul-heavy input quadratic).
    const out: string[] = [];
    for (const token of line.trim().split(/\s+/)) {
      if (token === '') continue;
      if (token === WORD_GAP) { out.push(' '); continue; }
      if (token === ESCAPED_SLASH) { out.push('/'); continue; }
      const arrows = Array.from(token);
      const arrowCount = arrows.filter((char) => SEMAPHORE_ARROWS.has(char)).length;
      // A lone arrow is a character the encoder passed through (as in "a → b"), not a signal.
      if (arrowCount === 0 || arrows.length === 1) { out.push(...arrows); continue; }
      if (arrowCount !== arrows.length || arrows.length !== 2) {
        throw new Error(`"${token}" is not a semaphore signal: each letter is exactly two arm arrows`);
      }
      const key = sortArrows(token);
      if (key === sortArrows(SEMAPHORE_REST)) { out.push(' '); continue; }
      if (key === sortArrows(SEMAPHORE_NUMERIC)) { numeric = true; continue; }
      if (key === sortArrows(SEMAPHORE_ANNUL)) { out.pop(); continue; }
      const letter = SEMAPHORE_BY_POSITION.get(key);
      if (letter === undefined) throw new Error(`"${token}" is not a semaphore letter`);
      if (numeric && letter === 'j') { numeric = false; continue; }
      out.push(numeric ? SEMAPHORE_LETTER_TO_DIGIT[letter] ?? letter : letter);
    }
    return out.join('');
  }).join('\n');
};

// ---------------------------------------------------------------------------------------------
// codes: T9 multi-tap. Each letter is its key pressed once per position (h = 44); the digit
// itself is the press after the letters (2 = 2222); 0 is space and 00 the digit 0; 1 is 1.
// Presses are separated by spaces; line breaks are kept; other characters pass through.
// ---------------------------------------------------------------------------------------------

const MULTITAP_KEYS: Record<string, string[]> = {
  '0': [' ', '0'], '1': ['1'],
  ...Object.fromEntries(Object.entries(KEYPAD_LETTERS).map(([key, letters]) => [key, [...Array.from(letters), key]])),
};
const MULTITAP_OF = new Map<string, string>(
  Object.entries(MULTITAP_KEYS).flatMap(([key, chars]) => chars.map((char, index) => [char, key.repeat(index + 1)] as [string, string])),
);

const multitapEncode: TextFn = (input) =>
  input.split(/\r?\n/).map((line) =>
    Array.from(line, (char) => MULTITAP_OF.get(char.toLowerCase()) ?? char).join(' '),
  ).join('\n');
const multitapDecode: TextFn = (input) =>
  input.split(/\r?\n/).map((line) =>
    line.trim().split(/\s+/).filter((token) => token !== '').map((token) => {
      if (!/\d/.test(token)) return token;
      if (!/^(\d)\1*$/.test(token)) throw new Error(`"${token}" mixes keys: separate each letter's presses with a space`);
      const options = MULTITAP_KEYS[token[0]];
      const char = options[token.length - 1];
      if (char === undefined) throw new Error(`"${token}" is too many presses: key ${token[0]} has ${options.length} characters`);
      return char;
    }).join(''),
  ).join('\n');

// ---------------------------------------------------------------------------------------------
// codes: phone keypad. One digit per letter (ITU E.161), e.g. HELLO -> 43556. Lossy.
// ---------------------------------------------------------------------------------------------

const keypadEncode: TextFn = (input) => Array.from(input, (char) => LETTER_TO_KEY[char.toLowerCase()] ?? char).join('');

// ---------------------------------------------------------------------------------------------
// codes: DTMF. Each key is its low (row) + high (column) tone in Hz (ITU-T Q.23):
// rows 697 770 852 941, columns 1209 1336 1477 1633. Letters are sent as their keypad digit.
// ---------------------------------------------------------------------------------------------

const DTMF_ROWS = [697, 770, 852, 941];
const DTMF_COLUMNS = [1209, 1336, 1477, 1633];
const DTMF_LAYOUT = ['123A', '456B', '789C', '*0#D'];
const DTMF_TONE = new Map<string, string>();
const DTMF_KEY = new Map<string, string>();
DTMF_LAYOUT.forEach((row, rowIndex) => {
  Array.from(row).forEach((key, columnIndex) => {
    DTMF_TONE.set(key, `${DTMF_ROWS[rowIndex]}+${DTMF_COLUMNS[columnIndex]}`);
    DTMF_KEY.set(`${DTMF_ROWS[rowIndex]}+${DTMF_COLUMNS[columnIndex]}`, key);
  });
});

const dtmfEncode: TextFn = (input) =>
  encodeTokens(input, (char) => {
    const key = /^[0-9*#]$/.test(char) ? char : LETTER_TO_KEY[char.toLowerCase()];
    return key === undefined ? char : DTMF_TONE.get(key) ?? char;
  });
const dtmfDecode: TextFn = (input) =>
  decodeTokens(input, (token) => {
    if (!/\d/.test(token)) return token;
    const match = /^(\d{3,4})(?:hz)?[+/&](\d{3,4})(?:hz)?$/i.exec(token);
    if (match === null) throw new Error(`"${token}" is not a DTMF tone pair (expected e.g. 697+1209)`);
    const [low, high] = [Number(match[1]), Number(match[2])].sort((first, second) => first - second);
    const key = DTMF_KEY.get(`${low}+${high}`);
    if (key === undefined) throw new Error(`"${token}" is not a DTMF key: rows are 697/770/852/941 Hz, columns 1209/1336/1477/1633 Hz`);
    return key;
  });

// ---------------------------------------------------------------------------------------------
// codes: Navajo code talker alphabet (Navajo Code Talkers' Dictionary, revised 1945). Most
// letters had several words; encode rotates through them per letter (the talkers varied them
// to defeat frequency analysis), which keeps output stable while typing. Decode accepts every
// documented word in any case.
// ---------------------------------------------------------------------------------------------

const NAVAJO: Record<string, string[]> = {
  a: ['WOL-LA-CHEE', 'BE-LA-SANA', 'TSE-NILL'],          // ant, apple, axe
  b: ['NA-HASH-CHID', 'SHUSH', 'TOISH-JEH'],              // badger, bear, barrel
  c: ['MOASI', 'TLA-GIN', 'BA-GOSHI'],                    // cat, coal, cow
  d: ['BE', 'CHINDI', 'LHA-CHA-EH'],                      // deer, devil, dog
  e: ['AH-JAH', 'DZEH', 'AH-NAH'],                        // ear, elk, eye
  f: ['CHUO', 'TSA-E-DONIN-EE', 'MA-E'],                  // fir, fly, fox
  g: ['AH-TAD', 'KLIZZIE', 'JEHA'],                       // girl, goat, gum
  h: ['TSE-GAH', 'CHA', 'LIN'],                           // hair, hat, horse
  i: ['TKIN', 'YEH-HES', 'A-CHI'],                        // ice, itch, intestine
  j: ['TKELE-CHO-G', 'AH-YA-TSINNE', 'YIL-DOI'],          // jackass, jaw, jerk
  k: ['JAD-HO-LONI', 'BA-AH-NE-DI-TININ', 'KLIZZIE-YAZZIE'], // kettle, key, kid
  l: ['DIBEH-YAZZIE', 'AH-JAD', 'NASH-DOIE-TSO'],         // lamb, leg, lion
  m: ['TSIN-TLITI', 'BE-TAS-TNI', 'NA-AS-TSO-SI'],        // match, mirror, mouse
  n: ['TSAH', 'A-CHIN'],                                  // needle, nose
  o: ['A-KHA', 'TLO-CHIN', 'NE-AHS-JAH'],                 // oil, onion, owl
  p: ['CLA-GI-AIH', 'BI-SO-DIH', 'NE-ZHONI'],             // pant, pig, pretty
  q: ['CA-YEILTH'],                                       // quiver
  r: ['GAH', 'DAH-NES-TSA', 'AH-LOSZ'],                   // rabbit, ram, rice
  s: ['DIBEH', 'KLESH'],                                  // sheep, snake
  t: ['D-AH', 'A-WOH', 'THAN-ZIE'],                       // tea, tooth, turkey
  u: ['SHI-DA', 'NO-DA-IH'],                              // uncle, Ute
  v: ['A-KEH-DI-GLINI'],                                  // victor
  w: ['GLOE-IH'],                                         // weasel
  x: ['AL-NA-AS-DZOH'],                                   // cross
  y: ['TSAH-AS-ZIH'],                                     // yucca
  z: ['BESH-DO-TLIZ'],                                    // zinc
};
const NAVAJO_LETTER = new Map<string, string>(
  Object.entries(NAVAJO).flatMap(([letter, words]) => words.map((word) => [word, letter] as [string, string])),
);

const navajoEncode: TextFn = (input) => {
  const used: Record<string, number> = {};
  return encodeTokens(input, (char) => {
    const letter = char.toLowerCase();
    const words = NAVAJO[letter];
    if (words === undefined) return char;
    const count = used[letter] ?? 0;
    used[letter] = count + 1;
    return words[count % words.length];
  });
};
const navajoDecode: TextFn = (input) =>
  decodeTokens(input, (token) => {
    const letter = NAVAJO_LETTER.get(token.toUpperCase());
    if (letter !== undefined) return letter;
    if (/[A-Za-z]/.test(token)) throw new Error(`"${token}" is not a word of the Navajo code talker alphabet`);
    return token;
  });

// ---------------------------------------------------------------------------------------------
// codes: spoken Morse (ITU-R M.1677). Each mark is said: dah for a dash, di for a dot inside a
// letter and dit for a dot that ends it (A = di-dah, S = di-di-dit). Decode accepts di or dit.
// ---------------------------------------------------------------------------------------------

const MORSE: Record<string, string> = {
  a: '.-', b: '-...', c: '-.-.', d: '-..', e: '.', f: '..-.', g: '--.', h: '....', i: '..',
  j: '.---', k: '-.-', l: '.-..', m: '--', n: '-.', o: '---', p: '.--.', q: '--.-', r: '.-.',
  s: '...', t: '-', u: '..-', v: '...-', w: '.--', x: '-..-', y: '-.--', z: '--..',
  '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-', '5': '.....',
  '6': '-....', '7': '--...', '8': '---..', '9': '----.',
  '.': '.-.-.-', ',': '--..--', '?': '..--..', "'": '.----.', '!': '-.-.--', '/': '-..-.',
  '(': '-.--.', ')': '-.--.-', '&': '.-...', ':': '---...', '=': '-...-', '+': '.-.-.',
  '-': '-....-', '"': '.-..-.', '@': '.--.-.',
};
const MORSE_CHAR = invertToMap(MORSE);
const SPOKEN_MORSE = /^(?:dit|di|dah)(?:-(?:dit|di|dah))*$/i;

function speakMorse(code: string): string {
  const marks = Array.from(code);
  return marks.map((mark, index) => (mark === '-' ? 'dah' : index === marks.length - 1 ? 'dit' : 'di')).join('-');
}

const ditDahEncode: TextFn = (input) =>
  encodeTokens(input, (char) => {
    const code = MORSE[char.toLowerCase()];
    return code === undefined ? char : speakMorse(code);
  });
const ditDahDecode: TextFn = (input) =>
  decodeTokens(input, (token) => {
    if (!SPOKEN_MORSE.test(token)) {
      if (/\b(?:dit|di|dah)\b/i.test(token)) throw new Error(`"${token}" is not spoken Morse: join marks with hyphens (di-dah)`);
      return token;
    }
    const code = token.toLowerCase().split('-').map((mark) => (mark === 'dah' ? '-' : '.')).join('');
    const char = MORSE_CHAR.get(code);
    if (char === undefined) throw new Error(`"${token}" (${code}) is not a Morse character`);
    return char;
  });

// ---------------------------------------------------------------------------------------------
// registry
// ---------------------------------------------------------------------------------------------

export const ALPHABET_CODE_TRANSFORMS: DashTransform[] = [
  { id: 'youngerfuthark', label: 'younger futhark', group: 'alphabets', ...YOUNGER_FUTHARK,
    note: 'Viking-age runes, with dotted medieval runes for e, g, d, p and friends; th is ᚦ. Case is dropped; j comes back as i.' },
  { id: 'futhorc', label: 'futhorc', group: 'alphabets', ...FUTHORC,
    note: 'Anglo-Saxon runes, with single runes for th, ng, ea, ae, oe and st. Case is dropped.' },
  { id: 'ogham', label: 'ogham', group: 'alphabets', enc: oghamEncode, dec: oghamDecode,
    note: 'Old Irish stemline letters between feather marks, ogham space mark for spaces. Forfeda stand in for j, k, v, x, y. Case is dropped.' },
  { id: 'phoenician', label: 'phoenician', group: 'alphabets', ...PHOENICIAN,
    note: '22 letters, right to left. Case is dropped, and f comes back as p, u and v as w, j and y as i.' },
  { id: 'gothic', label: 'gothic', group: 'alphabets', ...GOTHIC,
    note: "Wulfila's alphabet, with letters for th and hw. Case is dropped; c comes back as k, v as w, y as i." },
  { id: 'glagolitic', label: 'glagolitic', group: 'alphabets', ...GLAGOLITIC,
    note: 'Old Church Slavonic letters, with letters for zh, ch and sh. Case is dropped; q comes back as k, w as v, x as ks.' },
  { id: 'olditalic', label: 'old italic', group: 'alphabets', ...OLD_ITALIC,
    note: 'Etruscan-style letters, with letters for th, ph, kh and sh. Case is dropped; g is written with c, so it comes back as c.' },
  { id: 'coptic', label: 'coptic', group: 'alphabets', ...COPTIC,
    note: 'Coptic letters, with single letters for th, ph, ch, ps, sh and ti. Case is dropped.' },
  { id: 'greek', label: 'greek', group: 'alphabets', enc: greekEncode, dec: greekDecode,
    note: 'Transliteration: ph φ, th θ, ch χ, ps ψ, final ς; old Greek letters for c, f, j, q, v, y. Case is dropped.' },
  { id: 'hiragana', label: 'hiragana', group: 'alphabets', enc: (input) => kanaEncode(input, false), dec: kanaDecode,
    note: "Hepburn romaji to kana (konnichiwa, matcha, kin'en). Letters that make no syllable stay Latin. ō is written おう and comes back as ou." },
  { id: 'katakana', label: 'katakana', group: 'alphabets', enc: (input) => kanaEncode(input, true), dec: kanaDecode,
    note: 'Hepburn romaji to katakana; ō ū ā become ー and come back with macrons. Letters that make no syllable stay Latin.' },
  { id: 'galactic', label: 'galactic', group: 'alphabets', ...GALACTIC,
    note: 'Standard Galactic Alphabet (Commander Keen, Minecraft) in Unicode look-alikes. Case is dropped. p is !¡ and y is ||, so a | ! or ¡ already in the text can decode as part of a letter.' },
  { id: 'roman', label: 'roman numerals', group: 'alphabets', enc: romanEncode, dec: romanDecode,
    note: 'Each standalone number 1-3999 becomes a numeral. Decode also turns words like I, MIX or CD into numbers.' },
  { id: 'mayan', label: 'mayan numerals', group: 'alphabets', enc: mayanEncode, dec: mayanDecode,
    note: 'Each number in base 20 with Mayan digit signs (𝋠 zero to 𝋳 nineteen). Numbers with leading zeros are left alone.' },
  { id: 'periodic', label: 'periodic table', group: 'alphabets', enc: periodicEncode, dec: periodicDecode,
    note: 'Each word spelled with element symbols (CaRbON); words with no spelling are marked ⟨so⟩. Spelled words come back lower case.' },
  { id: 'sevenseg', label: 'seven segment', group: 'alphabets', ...SEVEN_SEGMENT,
    note: 'Digits as seven-segment display digits. Everything else passes through.' },

  { id: 'semaphore', label: 'semaphore', group: 'codes', enc: semaphoreEncode, dec: semaphoreDecode,
    note: 'Flag semaphore: two arm positions per letter, as the reader sees them. Digits use the numeric sign. Case and extra spaces are lost.' },
  { id: 't9', label: 't9 multi-tap', group: 'codes', enc: multitapEncode, dec: multitapDecode,
    note: 'Old phone texting: HELLO is 44 33 555 555 666. 0 is a space. Case is dropped.' },
  { id: 'keypad', label: 'phone keypad', group: 'codes', enc: keypadEncode, dec: null,
    note: 'One keypad digit per letter (HELLO is 43556). Lossy: several letters share a key, so there is no decode.' },
  { id: 'dtmf', label: 'dtmf tones', group: 'codes', enc: dtmfEncode, dec: dtmfDecode,
    note: 'Each key as its two touch-tone frequencies in Hz. Letters are dialled as their keypad digit, so they decode as digits.' },
  { id: 'navajo', label: 'navajo code', group: 'codes', enc: navajoEncode, dec: navajoDecode,
    note: 'WWII Navajo code talker alphabet, cycling through the documented words for each letter. Case and extra spaces are lost.' },
  { id: 'ditdah', label: 'dit dah', group: 'codes', enc: ditDahEncode, dec: ditDahDecode,
    note: 'Morse as it is spoken: di-dah is A, di-di-dit is S. Case and extra spaces are lost.' },
];
