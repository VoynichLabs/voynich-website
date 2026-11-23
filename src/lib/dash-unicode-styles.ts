// Author: Claude Opus 5.5
// Date: 23-Nov-2026
// PURPOSE: More "glyphs" transforms for DASH: Unicode text styles beyond the bold / script /
//          fraktur / double-struck / monospace / circled / fullwidth / small caps / upside down
//          styles that already live in dash-glyphs.ts. Every entry is in group 'glyphs':
//            math styles  - italic (h is the older U+210E PLANCK CONSTANT, because the math italic
//                           block leaves that slot reserved), bold italic, sans, sans bold, sans
//                           italic, sans bold italic, bold script, bold fraktur. Letters come from
//                           the Mathematical Alphanumeric Symbols block (U+1D400-1D7FF); sans and
//                           sans bold also restyle digits. Decode applies NFKC to math-block (and
//                           Letterlike stand-in) characters only, so any math style comes back
//                           plain and all other text is left exactly as typed.
//            super / sub  - superscript and subscript: Unicode only has some letters, so only the
//                           ones it has are mapped (from the Phonetic Extensions, Spacing Modifier
//                           Letters and Superscripts and Subscripts blocks); the rest stay plain.
//                           Decode uses an explicit reverse table so unrelated text is untouched.
//            line styles  - strikethrough (U+0336), slash-through (U+0338), underline (U+0332),
//                           double underline (U+0333), overline (U+0305): one combining mark after
//                           every grapheme except line breaks and other invisible controls. Decode
//                           strips one copy of that mark per grapheme, so layers peel off singly.
//            enclosed     - regional indicator letters (U+1F1E6-1F1FF, with a ZERO WIDTH NON-JOINER
//                           between neighbours so pairs never render as country flags), squared
//                           (U+1F130), negative squared (U+1F170), negative circled (U+1F150, with
//                           U+24FF / U+2776 digits), parenthesized (U+249C lower, U+1F110 upper,
//                           U+2474 digits). These letters exist in one case only (except
//                           parenthesized), so case is lost and decode returns upper case. All of
//                           them decode through explicit reverse tables.
//            other        - mirror (reverse the text, swap mirror-image pairs b/d, p/q, brackets,
//                           slashes; its own inverse), faux cyrillic (Latin letters to Cyrillic
//                           letters that look like them whatever they sound like, e.g. N->И, R->Я,
//                           E->Є, A->Д), wide spacing (U+3000 IDEOGRAPHIC SPACE between characters;
//                           decode keeps ideographic spaces that were in the original text).
//          Standards followed: Unicode code charts and UnicodeData.txt compatibility decompositions
//          (<font>, <super>, <sub>, <square>), UAX #29 grapheme clusters via Intl.Segmenter.
//          Every function is pure (no DOM, no network, no randomness, no clock) and the module has
//          no runtime imports, so tests/dash-unicode-styles.test.mjs can transpile and load it alone.
//          Integration: UNICODE_STYLE_TRANSFORMS is appended to the DASH registry, which is shared
//          by voynichlabs.org/dash and markbarney.net/dash.
//          SHARED FILE: the master copy is VoynichLabs/voynich-website src/lib/; markbarney.net
//          (82deutschmark/MarkSite) keeps an identical copy in client/src/lib/dash/. Edit the master,
//          then copy it across unchanged.
// SRP/DRY check: Pass - checked dash-glyphs.ts and dash-transforms.ts; none of these styles exist
//          there. Math decoders reuse String.prototype.normalize('NFKC') per character instead of
//          hand-written tables. Invisible characters in this source are written as escape sequences.
//          The small styleEncoder / invertTable helpers are deliberately local copies: only type
//          imports are allowed, because the test loader transpiles each
//          file on its own and a runtime import of dash-glyphs.ts would not resolve.

import type { DashTransform } from './dash-glyphs';

type TextFn = DashTransform['enc'];

// ---------------------------------------------------------------------------------------------
// shared helpers
// ---------------------------------------------------------------------------------------------

/** Build a char -> string table from code points so the source stays readable and exact. */
function fromCodePoints(table: Record<string, number>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(table).map(([plain, codePoint]) => [plain, String.fromCodePoint(codePoint)]),
  );
}

/** Invert a one-to-one table. Throws at load time if two keys share a value. */
function invertTable(table: Record<string, string>): Record<string, string> {
  const inverted: Record<string, string> = {};
  for (const [plain, coded] of Object.entries(table)) {
    if (coded in inverted) {
      throw new Error(`table is not one-to-one: "${coded}" is used for both "${inverted[coded]}" and "${plain}"`);
    }
    inverted[coded] = plain;
  }
  return inverted;
}

/** Per-code-point substitution in both directions; characters outside the table pass through. */
function charMapTransform(table: Record<string, string>): { enc: TextFn; dec: TextFn } {
  const reverse = invertTable(table);
  return {
    enc: (input) => Array.from(input, (char) => table[char] ?? char).join(''),
    dec: (input) => Array.from(input, (char) => reverse[char] ?? char).join(''),
  };
}

/** Letterlike Symbols that stand in for reserved slots of the math alphabets (italic h, script
 *  B E F H I L M R e g o, fraktur C H I R Z, double-struck C H N P Q R Z). */
const MATH_LETTERLIKE = new Set(
  [0x210e, 0x212c, 0x2130, 0x2131, 0x210b, 0x2110, 0x2112, 0x2133, 0x211b, 0x212f, 0x210a, 0x2134,
    0x212d, 0x210c, 0x2111, 0x211c, 0x2128, 0x2102, 0x210d, 0x2115, 0x2119, 0x211a, 0x211d, 0x2124]
    .map((codePoint) => String.fromCodePoint(codePoint)),
);

/** Undo math-alphabet styles (any of them: bold, italic, script, sans...) character by character
 *  through their NFKC compatibility mapping. Only Mathematical Alphanumeric Symbols (U+1D400-1D7FF)
 *  and the Letterlike stand-ins above are touched: running NFKC over the whole string would also
 *  rewrite unrelated text (² to 2, … to ..., ﬁ to fi, ™ to TM, no-break space to space). */
const unstyleMath: TextFn = (input) =>
  Array.from(input, (char) => {
    const code = char.codePointAt(0) ?? 0;
    return (code >= 0x1d400 && code <= 0x1d7ff) || MATH_LETTERLIKE.has(char) ? char.normalize('NFKC') : char;
  }).join('');

/** One shared UAX #29 grapheme segmenter, created on first use (absent in very old engines). */
let graphemeSegmenter: Intl.Segmenter | null | undefined;

/** Split text into user-perceived characters, so marks and emoji sequences stay whole.
 *  Falls back to code points where Intl.Segmenter is unavailable. */
function graphemes(text: string): string[] {
  if (graphemeSegmenter === undefined) {
    graphemeSegmenter = typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function'
      ? new Intl.Segmenter(undefined, { granularity: 'grapheme' })
      : null;
  }
  if (graphemeSegmenter === null) return Array.from(text);
  return Array.from(graphemeSegmenter.segment(text), (part) => part.segment);
}

const LINE_BREAK = /^[\r\n]+$/;

/** Clusters made only of controls, format characters and line/paragraph separators (tab, line
 *  breaks, zero-width space, bidi controls...). They have no glyph to decorate, and a combining
 *  mark after one would start a new cluster of its own, so line styles leave them unmarked. */
const UNMARKED_CLUSTER = /^[\p{Cc}\p{Cf}\p{Zl}\p{Zp}]+$/u;

// ---------------------------------------------------------------------------------------------
// math alphanumeric styles. Each alphabet is a contiguous run of 26 capitals then 26 small
// letters; `holes` are letters Unicode had already encoded elsewhere (Letterlike Symbols), whose
// slots in the math block are reserved.
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
      if (char.length !== 1) return char;
      if (code >= 65 && code <= 90) return String.fromCodePoint(spec.upper + code - 65);
      if (code >= 97 && code <= 122) return String.fromCodePoint(spec.lower + code - 97);
      if (spec.digits !== undefined && code >= 48 && code <= 57) return String.fromCodePoint(spec.digits + code - 48);
      return char;
    }).join('');
}

const MATH_ITALIC: StyleSpec = { upper: 0x1d434, lower: 0x1d44e, holes: { h: 0x210e } };
const MATH_BOLD_ITALIC: StyleSpec = { upper: 0x1d468, lower: 0x1d482 };
const MATH_BOLD_SCRIPT: StyleSpec = { upper: 0x1d4d0, lower: 0x1d4ea };
const MATH_BOLD_FRAKTUR: StyleSpec = { upper: 0x1d56c, lower: 0x1d586 };
const MATH_SANS: StyleSpec = { upper: 0x1d5a0, lower: 0x1d5ba, digits: 0x1d7e2 };
const MATH_SANS_BOLD: StyleSpec = { upper: 0x1d5d4, lower: 0x1d5ee, digits: 0x1d7ec };
const MATH_SANS_ITALIC: StyleSpec = { upper: 0x1d608, lower: 0x1d622 };
const MATH_SANS_BOLD_ITALIC: StyleSpec = { upper: 0x1d63c, lower: 0x1d656 };

// ---------------------------------------------------------------------------------------------
// superscript and subscript. Only characters Unicode actually encodes; each one carries a
// <super> or <sub> compatibility decomposition to the plain character (checked by the tests).
// Superscript covers every small letter (q is U+107A5, Latin Extended-F) and every capital except
// S X Y Z (C F Q are U+A7F2-A7F4, Latin Extended-D; those four newer Unicode 14 letters may show as
// boxes in older fonts). Subscript has no capitals at all and only a e h i j k l m n o p r s t u v x.
// ---------------------------------------------------------------------------------------------

const SUPERSCRIPT = fromCodePoints({
  '0': 0x2070, '1': 0x00b9, '2': 0x00b2, '3': 0x00b3, '4': 0x2074, '5': 0x2075, '6': 0x2076,
  '7': 0x2077, '8': 0x2078, '9': 0x2079, '+': 0x207a, '-': 0x207b, '=': 0x207c, '(': 0x207d, ')': 0x207e,
  a: 0x1d43, b: 0x1d47, c: 0x1d9c, d: 0x1d48, e: 0x1d49, f: 0x1da0, g: 0x1d4d, h: 0x02b0, i: 0x2071,
  j: 0x02b2, k: 0x1d4f, l: 0x02e1, m: 0x1d50, n: 0x207f, o: 0x1d52, p: 0x1d56, q: 0x107a5, r: 0x02b3,
  s: 0x02e2, t: 0x1d57, u: 0x1d58, v: 0x1d5b, w: 0x02b7, x: 0x02e3, y: 0x02b8, z: 0x1dbb,
  A: 0x1d2c, B: 0x1d2e, C: 0xa7f2, D: 0x1d30, E: 0x1d31, F: 0xa7f3, G: 0x1d33, H: 0x1d34, I: 0x1d35,
  J: 0x1d36, K: 0x1d37, L: 0x1d38, M: 0x1d39, N: 0x1d3a, O: 0x1d3c, P: 0x1d3e, Q: 0xa7f4, R: 0x1d3f,
  T: 0x1d40, U: 0x1d41, V: 0x2c7d, W: 0x1d42,
});

const SUBSCRIPT = fromCodePoints({
  '0': 0x2080, '1': 0x2081, '2': 0x2082, '3': 0x2083, '4': 0x2084, '5': 0x2085, '6': 0x2086,
  '7': 0x2087, '8': 0x2088, '9': 0x2089, '+': 0x208a, '-': 0x208b, '=': 0x208c, '(': 0x208d, ')': 0x208e,
  a: 0x2090, e: 0x2091, o: 0x2092, x: 0x2093, h: 0x2095, k: 0x2096, l: 0x2097, m: 0x2098, n: 0x2099,
  p: 0x209a, s: 0x209b, t: 0x209c, i: 0x1d62, r: 0x1d63, u: 0x1d64, v: 0x1d65, j: 0x2c7c,
});

// ---------------------------------------------------------------------------------------------
// line styles: a combining mark after every grapheme except line breaks and other invisible
// controls. Decode removes ONE copy of that style's mark from each grapheme, so stacked styles
// (including the same style twice, or marks already in the input) peel off one layer at a time.
// ---------------------------------------------------------------------------------------------

const LONG_SOLIDUS_OVERLAY = '\u0338';

/** Remove the last copy of `mark` from one grapheme cluster. */
function stripOneMark(cluster: string, mark: string): string {
  const at = cluster.lastIndexOf(mark);
  if (at >= 0) return cluster.slice(0, at) + cluster.slice(at + mark.length);
  if (mark === LONG_SOLIDUS_OVERLAY) {
    // Some apps NFC-normalise pasted text, which fuses = < > (and a few math signs) with U+0338
    // into precomposed ≠ ≮ ≯. Split such a cluster apart, drop the mark, and recompose the rest.
    const split = cluster.normalize('NFD');
    const splitAt = split.lastIndexOf(mark);
    if (splitAt >= 0) return (split.slice(0, splitAt) + split.slice(splitAt + mark.length)).normalize('NFC');
  }
  return cluster;
}

function lineStyle(mark: string): { enc: TextFn; dec: TextFn } {
  return {
    enc: (input) =>
      graphemes(input).map((cluster) => (UNMARKED_CLUSTER.test(cluster) ? cluster : cluster + mark)).join(''),
    dec: (input) => graphemes(input).map((cluster) => stripOneMark(cluster, mark)).join(''),
  };
}

// ---------------------------------------------------------------------------------------------
// enclosed letters
// ---------------------------------------------------------------------------------------------

const ZWNJ = '\u200c';
const REGIONAL_A = 0x1f1e6;

function isRegionalIndicator(char: string | undefined): boolean {
  const code = char?.codePointAt(0) ?? 0;
  return code >= REGIONAL_A && code <= REGIONAL_A + 25;
}

/** Letters become regional indicator symbols. A ZWNJ goes in front of each new indicator whose
 *  nearest non-ZWNJ neighbour on the left is also an indicator (one we made, or one already in the
 *  input), so no two ever pair into a flag. ZWNJs already in the input are kept, and the separator
 *  is always the LAST ZWNJ of the run, which is what the decoder removes. */
function regionalEncode(input: string): string {
  let output = '';
  let previousWasIndicator = false;
  for (const char of input) {
    const code = char.charCodeAt(0);
    const letterIndex = code >= 65 && code <= 90 ? code - 65 : code >= 97 && code <= 122 ? code - 97 : -1;
    if (letterIndex < 0) {
      output += char;
      if (char !== ZWNJ) previousWasIndicator = isRegionalIndicator(char);
      continue;
    }
    output += (previousWasIndicator ? ZWNJ : '') + String.fromCodePoint(REGIONAL_A + letterIndex);
    previousWasIndicator = true;
  }
  return output;
}

/** Indicators back to capitals. In a run of ZWNJs between two indicators the last one is the
 *  encoder's separator and is dropped; any others were in the original text and stay. Real flags
 *  (indicator pairs with no ZWNJ) decode to their two letters. */
function regionalDecode(input: string): string {
  const chars = Array.from(input);
  return chars.map((char, index) => {
    if (char === ZWNJ && isRegionalIndicator(chars[index + 1])) {
      let before = index - 1;
      while (before >= 0 && chars[before] === ZWNJ) before--;
      if (isRegionalIndicator(chars[before])) return '';
    }
    if (isRegionalIndicator(char)) return String.fromCharCode(65 + (char.codePointAt(0) ?? 0) - REGIONAL_A);
    return char;
  }).join('');
}

/** Capital-only enclosed alphabets: both cases of a letter map to the same capital glyph. */
function capitalOnlyEncoder(capitalA: number, digits?: Record<string, number>): TextFn {
  return (input) =>
    Array.from(input, (char) => {
      const code = char.charCodeAt(0);
      if (char.length !== 1) return char;
      if (code >= 65 && code <= 90) return String.fromCodePoint(capitalA + code - 65);
      if (code >= 97 && code <= 122) return String.fromCodePoint(capitalA + code - 97);
      const digit = digits?.[char];
      return digit === undefined ? char : String.fromCodePoint(digit);
    }).join('');
}

/** Reverse of capitalOnlyEncoder for alphabets with no compatibility decomposition. Also drops a
 *  VARIATION SELECTOR-16 after a mapped glyph (🅰️ 🅱️ 🅾️ 🅿️ are often pasted in emoji form). */
function capitalOnlyDecoder(capitalA: number, digits?: Record<string, number>): TextFn {
  const digitReverse: Record<number, string> = {};
  for (const [plain, code] of Object.entries(digits ?? {})) digitReverse[code] = plain;
  return (input) => {
    const chars = Array.from(input);
    let output = '';
    let previousMapped = false;
    for (const char of chars) {
      const code = char.codePointAt(0) ?? 0;
      if (char === '\ufe0f' && previousMapped) {
        previousMapped = false;
        continue;
      }
      if (code >= capitalA && code <= capitalA + 25) {
        output += String.fromCharCode(65 + code - capitalA);
        previousMapped = true;
      } else if (digitReverse[code] !== undefined) {
        output += digitReverse[code];
        previousMapped = true;
      } else {
        output += char;
        previousMapped = false;
      }
    }
    return output;
  };
}

const SQUARED_A = 0x1f130;
const NEGATIVE_SQUARED_A = 0x1f170;
const NEGATIVE_CIRCLED_A = 0x1f150;
const NEGATIVE_CIRCLED_DIGITS: Record<string, number> = {
  '0': 0x24ff, '1': 0x2776, '2': 0x2777, '3': 0x2778, '4': 0x2779, '5': 0x277a, '6': 0x277b,
  '7': 0x277c, '8': 0x277d, '9': 0x277e,
};

/** Parenthesized: ⒜ small letters, 🄐 capitals, ⑴ digits 1-9 (there is no parenthesized zero).
 *  NFKC would turn ⒜ into the three characters "(a)", indistinguishable from typed brackets, so
 *  decode uses the explicit reverse table instead. */
const PARENTHESIZED: Record<string, string> = (() => {
  const table: Record<string, number> = {};
  for (let index = 0; index < 26; index++) {
    table[String.fromCharCode(97 + index)] = 0x249c + index;
    table[String.fromCharCode(65 + index)] = 0x1f110 + index;
  }
  for (let digit = 1; digit <= 9; digit++) table[String(digit)] = 0x2474 + digit - 1;
  return fromCodePoints(table);
})();

// ---------------------------------------------------------------------------------------------
// mirror: reverse the text by grapheme and swap characters that are mirror images of each other.
// Applying it twice gives back the original, so it has no separate decoder.
// ---------------------------------------------------------------------------------------------

const MIRROR_PAIRS: Record<string, string> = {
  b: 'd', d: 'b', p: 'q', q: 'p', '(': ')', ')': '(', '[': ']', ']': '[', '{': '}', '}': '{',
  '<': '>', '>': '<', '/': '\\', '\\': '/', '«': '»', '»': '«', '‹': '›', '›': '‹',
};

function mirror(input: string): string {
  return graphemes(input).reverse().map((cluster) => MIRROR_PAIRS[cluster] ?? cluster).join('');
}

// ---------------------------------------------------------------------------------------------
// faux cyrillic: Latin letters swapped for Cyrillic letters chosen for shape, not sound. D, L and
// Z have no convincing Cyrillic lookalike with wide font support, so they stay Latin.
// ---------------------------------------------------------------------------------------------

const FAUX_CYRILLIC = fromCodePoints({
  A: 0x0414, B: 0x0411, C: 0x0421, E: 0x0404, F: 0x0492, G: 0x050c, H: 0x041d, I: 0x0406,
  J: 0x0408, K: 0x041a, M: 0x041c, N: 0x0418, O: 0x0424, P: 0x0420, Q: 0x051a, R: 0x042f,
  S: 0x0405, T: 0x0422, U: 0x0426, V: 0x0474, W: 0x0428, X: 0x0416, Y: 0x0427,
  a: 0x0434, b: 0x044c, c: 0x0441, d: 0x0501, e: 0x0454, f: 0x0493, g: 0x050d, h: 0x045b,
  i: 0x0456, j: 0x0458, k: 0x043a, l: 0x04cf, m: 0x043c, n: 0x0438, o: 0x0444, p: 0x0440,
  q: 0x051b, r: 0x044f, s: 0x0455, t: 0x0442, u: 0x0446, v: 0x0475, w: 0x0448, x: 0x0436,
  y: 0x0447,
});

// ---------------------------------------------------------------------------------------------
// wide spacing: an IDEOGRAPHIC SPACE between every grapheme of each line. Line breaks are kept
// without padding; decode removes every ideographic space.
// ---------------------------------------------------------------------------------------------

const IDEOGRAPHIC_SPACE = '\u3000';
const LINE_SPLIT = /(\r\n|\n|\r)/;

function wideSpacingEncode(input: string): string {
  return input
    .split(LINE_SPLIT)
    .map((part) => (LINE_BREAK.test(part) ? part : graphemes(part).join(IDEOGRAPHIC_SPACE)))
    .join('');
}

/** Per line: when every second grapheme is an ideographic space (the encoder's exact layout), keep
 *  the others, so ideographic spaces that were in the original text (CJK) survive. Otherwise (hand
 *  edited or pasted text) fall back to removing every ideographic space on that line. */
function wideSpacingDecode(input: string): string {
  return input
    .split(LINE_SPLIT)
    .map((part) => {
      if (LINE_BREAK.test(part) || !part.includes(IDEOGRAPHIC_SPACE)) return part;
      const clusters = graphemes(part);
      const encoderLayout = clusters.length % 2 === 1
        && clusters.every((cluster, index) => index % 2 === 0 || cluster === IDEOGRAPHIC_SPACE);
      return encoderLayout
        ? clusters.filter((_, index) => index % 2 === 0).join('')
        : part.split(IDEOGRAPHIC_SPACE).join('');
    })
    .join('');
}

// ---------------------------------------------------------------------------------------------
// registry (appended to the DASH registry after GLYPH_TRANSFORMS)
// ---------------------------------------------------------------------------------------------

const superscript = charMapTransform(SUPERSCRIPT);
const subscript = charMapTransform(SUBSCRIPT);
const parenthesized = charMapTransform(PARENTHESIZED);
const fauxCyrillic = charMapTransform(FAUX_CYRILLIC);
const strikethrough = lineStyle('\u0336');
const slashThrough = lineStyle('\u0338');
const underline = lineStyle('\u0332');
const doubleUnderline = lineStyle('\u0333');
const overline = lineStyle('\u0305');

const MATH_NOTE = 'decode turns any math-styled letter (bold, italic, script, sans...) back to plain and leaves everything else exactly as it was.';
const LINE_NOTE = 'one combining mark after every visible character; decode strips one layer of this style’s mark.';

export const UNICODE_STYLE_TRANSFORMS: DashTransform[] = [
  { id: 'italic', label: 'italic', group: 'glyphs', enc: styleEncoder(MATH_ITALIC), dec: unstyleMath,
    note: `math italic letters (h is ℎ, U+210E). Digits and symbols unchanged; ${MATH_NOTE}` },
  { id: 'bolditalic', label: 'bold italic', group: 'glyphs', enc: styleEncoder(MATH_BOLD_ITALIC), dec: unstyleMath,
    note: `letters only; digits and symbols unchanged. ${MATH_NOTE}` },
  { id: 'sans', label: 'sans', group: 'glyphs', enc: styleEncoder(MATH_SANS), dec: unstyleMath,
    note: `math sans-serif letters and digits. ${MATH_NOTE}` },
  { id: 'sansbold', label: 'sans bold', group: 'glyphs', enc: styleEncoder(MATH_SANS_BOLD), dec: unstyleMath,
    note: `math sans-serif bold letters and digits. ${MATH_NOTE}` },
  { id: 'sansitalic', label: 'sans italic', group: 'glyphs', enc: styleEncoder(MATH_SANS_ITALIC), dec: unstyleMath,
    note: `letters only; digits and symbols unchanged. ${MATH_NOTE}` },
  { id: 'sansbolditalic', label: 'sans bold italic', group: 'glyphs', enc: styleEncoder(MATH_SANS_BOLD_ITALIC), dec: unstyleMath,
    note: `letters only; digits and symbols unchanged. ${MATH_NOTE}` },
  { id: 'boldscript', label: 'bold script', group: 'glyphs', enc: styleEncoder(MATH_BOLD_SCRIPT), dec: unstyleMath,
    note: `letters only; digits and symbols unchanged. ${MATH_NOTE}` },
  { id: 'boldfraktur', label: 'bold fraktur', group: 'glyphs', enc: styleEncoder(MATH_BOLD_FRAKTUR), dec: unstyleMath,
    note: `letters only; digits and symbols unchanged. ${MATH_NOTE}` },

  { id: 'superscript', label: 'superscript', group: 'glyphs', ...superscript,
    note: 'only what Unicode has: digits, + - = ( ), every small letter, capitals except S X Y Z (q C F Q are newer and may show as boxes). The rest stay plain; superscripts already in the text decode to plain too.' },
  { id: 'subscript', label: 'subscript', group: 'glyphs', ...subscript,
    note: 'only what Unicode has: digits, + - = ( ) and a e h i j k l m n o p r s t u v x. Capitals and other letters stay plain.' },

  { id: 'strikethrough', label: 'strikethrough', group: 'glyphs', ...strikethrough, note: `U+0336 long stroke; ${LINE_NOTE}` },
  { id: 'slashthrough', label: 'slash-through', group: 'glyphs', ...slashThrough, note: `U+0338 long solidus; ${LINE_NOTE}` },
  { id: 'underline', label: 'underline', group: 'glyphs', ...underline, note: `U+0332 low line; ${LINE_NOTE}` },
  { id: 'doubleunderline', label: 'double underline', group: 'glyphs', ...doubleUnderline, note: `U+0333 double low line; ${LINE_NOTE}` },
  { id: 'overline', label: 'overline', group: 'glyphs', ...overline, note: `U+0305 overline; ${LINE_NOTE}` },

  { id: 'regional', label: 'regional letters', group: 'glyphs', enc: regionalEncode, dec: regionalDecode,
    note: 'letters become 🇦-🇿 regional indicators, split by invisible non-joiners so they never pair into flags. Case is lost (decode gives capitals); flags or indicators already in the text decode to letters.' },
  { id: 'squared', label: 'squared', group: 'glyphs', enc: capitalOnlyEncoder(SQUARED_A), dec: capitalOnlyDecoder(SQUARED_A),
    note: 'letters in boxes, capitals only: case is lost and decode gives capitals. Digits and symbols unchanged.' },
  { id: 'negsquared', label: 'negative squared', group: 'glyphs',
    enc: capitalOnlyEncoder(NEGATIVE_SQUARED_A), dec: capitalOnlyDecoder(NEGATIVE_SQUARED_A),
    note: 'white letters on black squares, capitals only: case is lost and decode gives capitals. Digits and symbols unchanged.' },
  { id: 'negcircled', label: 'negative circled', group: 'glyphs',
    enc: capitalOnlyEncoder(NEGATIVE_CIRCLED_A, NEGATIVE_CIRCLED_DIGITS), dec: capitalOnlyDecoder(NEGATIVE_CIRCLED_A, NEGATIVE_CIRCLED_DIGITS),
    note: 'white letters and digits on black circles, capitals only: case is lost and decode gives capitals.' },
  { id: 'parenthesized', label: 'parenthesized', group: 'glyphs', ...parenthesized,
    note: 'letters (both cases) and digits 1-9 in brackets. Zero has no bracketed form and stays plain.' },

  { id: 'mirror', label: 'mirror', group: 'glyphs', enc: mirror, dec: null,
    note: 'reversed, with b/d, p/q, brackets and slashes swapped. Its own inverse: run it again to restore (except a lone accent at the very start, an odd run of flag letters, or a line feed followed by a carriage return, which regroup when reversed).' },
  { id: 'fauxcyrillic', label: 'faux cyrillic', group: 'glyphs', ...fauxCyrillic,
    note: 'Latin letters swapped for Cyrillic ones that look alike (N→И, R→Я, E→Є, A→Д). D, L and Z stay Latin; Cyrillic already in the text decodes to Latin too.' },
  { id: 'widespacing', label: 'wide spacing', group: 'glyphs', enc: wideSpacingEncode, dec: wideSpacingDecode,
    note: 'an ideographic space between every character, line breaks kept. Decode keeps ideographic spaces that were in the original text; on hand-edited lines it removes them all.' },
];
