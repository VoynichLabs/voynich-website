// Author: Claude Opus 4.8 (Bubba coding sub-agent); moved into this module by Claude Opus 5.5
// Date: 12-July-2026; moved 23-Nov-2026; zalgo made stable 23-Nov-2026
// PURPOSE: The original 17 DASH transforms (base64, hex, binary, ascii, url, braille, emoji, rot13,
//          leet, morse, nato, reverse, case, spaces, disemvowel, pig latin, zalgo), ported from
//          peluche's Deck of Many Prompts and first written inline in src/pages/dash.astro. Moved
//          here unchanged (plus explicit table types for strict TypeScript) so the same pure code can
//          be shared by any front end: voynichlabs.org/dash (Astro) and markbarney.net/dash (React).
//          No DOM, no network. Exports BASE_TRANSFORMS and DASH_GROUP_ORDER; the newer transforms
//          live in ./dash-glyphs.ts.
//          SHARED FILE: the master copy is VoynichLabs/voynich-website src/lib/; markbarney.net
//          (82deutschmark/MarkSite) keeps an identical copy in client/src/lib/dash/. Edit the master,
//          then copy it across unchanged.
// SRP/DRY check: Pass - pure transform functions only; UI wiring stays in the pages.
import type { DashTransform } from './dash-glyphs';

/** Order the transform groups appear in on the page. */
export const DASH_GROUP_ORDER = ['encoders', 'glyphs', 'ciphers', 'stealth', 'wrappers', 'text ops'];

const enc = new TextEncoder();
const dec = new TextDecoder();

function b64encode(s: string) {
  const bytes = enc.encode(s);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}
function b64decode(s: string) {
  const bin = atob(s.replace(/\s+/g, ''));
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return dec.decode(bytes);
}

function hexEncode(s: string) {
  return Array.from(enc.encode(s), (b) => b.toString(16).padStart(2, '0')).join(' ');
}
function hexDecode(s: string) {
  const parts = s.trim().split(/\s+/).filter(Boolean);
  const bytes = Uint8Array.from(parts, (h) => parseInt(h, 16));
  return dec.decode(bytes);
}

function binEncode(s: string) {
  return Array.from(enc.encode(s), (b) => b.toString(2).padStart(8, '0')).join(' ');
}
function binDecode(s: string) {
  const parts = s.trim().split(/\s+/).filter(Boolean);
  const bytes = Uint8Array.from(parts, (b) => parseInt(b, 2));
  return dec.decode(bytes);
}

function asciiEncode(s: string) {
  return Array.from(s, (c) => c.codePointAt(0)).join(' ');
}
function asciiDecode(s: string) {
  const parts = s.trim().split(/\s+/).filter(Boolean);
  return parts.map((n) => String.fromCodePoint(parseInt(n, 10))).join('');
}

const MORSE: Record<string, string> = {
  A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....',
  I: '..', J: '.---', K: '-.-', L: '.-..', M: '--', N: '-.', O: '---', P: '.--.',
  Q: '--.-', R: '.-.', S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-',
  Y: '-.--', Z: '--..', '0': '-----', '1': '.----', '2': '..---', '3': '...--',
  '4': '....-', '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
  ' ': '/', '&': '.-...', "'": '.----.', '@': '.--.-.', ')': '-.--.-', '(': '-.--.',
  ':': '---...', ',': '--..--', '=': '-...-', '!': '-.-.--', '.': '.-.-.-', '-': '-....-',
  '+': '.-.-.', '"': '.-..-.', '?': '..--..', '/': '-..-.',
};
const MORSE_REV = Object.fromEntries(Object.entries(MORSE).map(([k, v]) => [v, k]));
function morseEncode(s: string) {
  return Array.from(s.toUpperCase(), (c) => MORSE[c] ?? '').filter((x) => x !== '').join(' ');
}
function morseDecode(s: string) {
  return s.trim().split(/\s+/).map((m) => MORSE_REV[m] ?? '').join('').toLowerCase();
}

function rot13(s: string) {
  return s.replace(/[a-zA-Z]/g, (c) => {
    const base = c <= 'Z' ? 65 : 97;
    return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
  });
}

const LEET: Record<string, string> = { a: '4', b: '8', e: '3', g: '6', i: '1', o: '0', s: '5', t: '7', z: '2' };
const LEET_REV = Object.fromEntries(Object.entries(LEET).map(([k, v]) => [v, k]));
function leetEncode(s: string) {
  return Array.from(s, (c) => LEET[c.toLowerCase()] ?? c).join('');
}
function leetDecode(s: string) {
  return Array.from(s, (c) => LEET_REV[c] ?? c).join('');
}

function reverse(s: string) {
  return Array.from(s).reverse().join('');
}

const NATO: Record<string, string> = {
  A: 'Alpha', B: 'Bravo', C: 'Charlie', D: 'Delta', E: 'Echo', F: 'Foxtrot', G: 'Golf',
  H: 'Hotel', I: 'India', J: 'Juliett', K: 'Kilo', L: 'Lima', M: 'Mike', N: 'November',
  O: 'Oscar', P: 'Papa', Q: 'Quebec', R: 'Romeo', S: 'Sierra', T: 'Tango', U: 'Uniform',
  V: 'Victor', W: 'Whiskey', X: 'X-ray', Y: 'Yankee', Z: 'Zulu', '0': 'Zero', '1': 'One',
  '2': 'Two', '3': 'Three', '4': 'Four', '5': 'Five', '6': 'Six', '7': 'Seven',
  '8': 'Eight', '9': 'Nine',
};
const NATO_REV = Object.fromEntries(Object.entries(NATO).map(([k, v]) => [v.toLowerCase(), k]));
function natoEncode(s: string) {
  return Array.from(s, (c) => NATO[c.toUpperCase()] ?? c).join(' ');
}
function natoDecode(s: string) {
  return s.trim().split(/\s+/).map((w) => NATO_REV[w.toLowerCase()] ?? w).join('').toLowerCase();
}

function urlEncode(s: string) { return encodeURIComponent(s); }
function urlDecode(s: string) { return decodeURIComponent(s); }

function spacesEncode(s: string) { return Array.from(s).join(' '); }
function spacesDecode(s: string) {
  let skipped = false;
  const out: string[] = [];
  for (const c of s) {
    if (c === ' ' && !skipped) { skipped = true; }
    else { skipped = false; out.push(c); }
  }
  return out.join('');
}

function upper(s: string) { return s.toUpperCase(); }
function lower(s: string) { return s.toLowerCase(); }

function disemvowel(s: string) {
  return Array.from(s).filter((c) => !'aeiouyAEIOUY'.includes(c)).join('');
}

function piggifyWord(word: string) {
  if (!word) return '';
  const chars = Array.from(word);
  let idx = -1;
  for (let i = 0; i < chars.length; i++) {
    if ('aeiouy'.includes(chars[i].toLowerCase())) { idx = i; break; }
  }
  if (idx === -1) return word + 'ay';
  if (idx === 0) return word + 'way';
  return chars.slice(idx).join('') + chars.slice(0, idx).join('') + 'ay';
}
function pigLatin(s: string) {
  let out = '', word = '';
  for (const c of s) {
    if (/[a-zA-Z]/.test(c)) { word += c; continue; }
    out += piggifyWord(word) + c;
    word = '';
  }
  out += piggifyWord(word);
  return out;
}

const ZALGO_MARKS = ['̵', '̶', '̴', '̷', '̸'];
/**
 * Pick a mark from the character and its position (an integer hash, not Math.random), so the
 * output looks random but is stable: DASH re-runs on every keystroke, and true randomness made
 * every earlier character's mark change each time you typed.
 */
function zalgo(s: string) {
  return Array.from(s).map((c, index) => {
    if (/\p{M}/u.test(c)) return c;
    let mixed = Math.imul((c.codePointAt(0) ?? 0) + 0x9e3779b9, 0x85ebca6b) ^ Math.imul(index + 1, 0xc2b2ae35);
    mixed ^= mixed >>> 15;
    return c + ZALGO_MARKS[(mixed >>> 0) % ZALGO_MARKS.length];
  }).join('');
}
function zalgoStrip(s: string) {
  return s.normalize('NFC').replace(/\p{M}/gu, '');
}

const BR_LETTER: Record<string, string> = {
  a: '⠁', b: '⠃', c: '⠉', d: '⠙', e: '⠑', f: '⠋', g: '⠛',
  h: '⠓', i: '⠊', j: '⠚', k: '⠅', l: '⠇', m: '⠍', n: '⠝',
  o: '⠕', p: '⠏', q: '⠟', r: '⠗', s: '⠎', t: '⠞', u: '⠥',
  v: '⠧', w: '⠺', x: '⠭', y: '⠽', z: '⠵', ',': '⠂', ';': '⠆',
  ':': '⠒', '.': '⠲', '?': '⠦', '!': '⠖', "'": '⠄', '-': '⠤', ' ': ' ',
};
const BR_NUM: Record<string, string> = {
  '1': '⠁', '2': '⠃', '3': '⠉', '4': '⠙', '5': '⠑',
  '6': '⠋', '7': '⠛', '8': '⠓', '9': '⠊', '0': '⠚',
};
const BR_LETTER_REV = Object.fromEntries(Object.entries(BR_LETTER).map(([k, v]) => [v, k]));
const BR_NUM_REV = Object.fromEntries(Object.entries(BR_NUM).map(([k, v]) => [v, k]));
const NUM_SIGN = '⠼';
function brailleEncode(s: string) {
  let out = '', numMode = false;
  for (const raw of s) {
    const c = raw.toLowerCase();
    if (/[0-9]/.test(c)) {
      if (!numMode) { out += NUM_SIGN; numMode = true; }
      out += BR_NUM[c];
    } else if (c in BR_LETTER) {
      numMode = false;
      out += BR_LETTER[c];
    } else if (c === '\n') {
      numMode = false;
      out += '\n';
    } else {
      numMode = false;
      out += raw;
    }
  }
  return out;
}
function brailleDecode(s: string) {
  let out = '', numMode = false;
  for (const c of s) {
    if (c === NUM_SIGN) { numMode = true; continue; }
    if (c === ' ' || c === '\n') { numMode = false; out += c; continue; }
    if (numMode && c in BR_NUM_REV) { out += BR_NUM_REV[c]; continue; }
    if (c in BR_LETTER_REV) { numMode = false; out += BR_LETTER_REV[c]; continue; }
    out += c;
  }
  return out;
}

// emoji codec -- a byte<->emoji bijection. Every UTF-8 byte maps to one single-codepoint
// emoji, so any input (including Unicode) round-trips exactly. The 256-symbol alphabet is
// built from numeric code-point ranges (no ZWJ / skin-tone modifiers / VS16), which keeps
// this source file ASCII-safe and guarantees every symbol is exactly one code point, so
// Array.from() splits the encoded string back into bytes cleanly.
const EMOJI_ALPHABET = (() => {
  const ranges = [[0x1f600, 0x1f64f], [0x1f400, 0x1f4fd]]; // emoticons + animals/objects
  const out: string[] = [];
  for (const [lo, hi] of ranges) {
    for (let cp = lo; cp <= hi && out.length < 256; cp++) out.push(String.fromCodePoint(cp));
  }
  return out; // exactly 256 distinct single-codepoint symbols
})();
const EMOJI_REV = new Map(EMOJI_ALPHABET.map((e, i) => [e, i]));
function emojiEncode(s: string) {
  return Array.from(enc.encode(s), (b) => EMOJI_ALPHABET[b]).join('');
}
function emojiDecode(s: string) {
  const bytes = Array.from(s).filter((c) => EMOJI_REV.has(c)).map((c) => EMOJI_REV.get(c) as number);
  return dec.decode(Uint8Array.from(bytes));
}


export const BASE_TRANSFORMS: DashTransform[] = [
  { id: 'base64', label: 'base64', group: 'encoders', enc: b64encode, dec: b64decode },
  { id: 'hex', label: 'hex', group: 'encoders', enc: hexEncode, dec: hexDecode },
  { id: 'binary', label: 'binary', group: 'encoders', enc: binEncode, dec: binDecode },
  { id: 'ascii', label: 'ascii', group: 'encoders', enc: asciiEncode, dec: asciiDecode },
  { id: 'url', label: 'url', group: 'encoders', enc: urlEncode, dec: urlDecode },
  { id: 'braille', label: 'braille', group: 'encoders', enc: brailleEncode, dec: brailleDecode },
  { id: 'emoji', label: 'emoji', group: 'encoders', enc: emojiEncode, dec: emojiDecode },

  { id: 'rot13', label: 'rot13', group: 'ciphers', enc: rot13, dec: null, note: 'rot13 is its own inverse — run it again to decode.' },
  { id: 'leet', label: 'leet', group: 'ciphers', enc: leetEncode, dec: leetDecode },
  { id: 'morse', label: 'morse', group: 'ciphers', enc: morseEncode, dec: morseDecode },
  { id: 'nato', label: 'nato', group: 'ciphers', enc: natoEncode, dec: natoDecode },

  { id: 'reverse', label: 'reverse', group: 'text ops', enc: reverse, dec: null, note: 'reverse is its own inverse — run it again to restore.' },
  { id: 'case', label: 'case', group: 'text ops', enc: upper, dec: lower, encLabel: 'UPPER', decLabel: 'lower' },
  { id: 'spaces', label: 'spaces', group: 'text ops', enc: spacesEncode, dec: spacesDecode },
  { id: 'disemvowel', label: 'disemvowel', group: 'text ops', enc: disemvowel, dec: null, note: 'lossy — drops all vowels, cannot be reversed.' },
  { id: 'piglatin', label: 'pig latin', group: 'text ops', enc: pigLatin, dec: null, note: 'encode only — pig latin is not reversible.' },
  { id: 'zalgo', label: 'zalgo', group: 'text ops', enc: zalgo, dec: zalgoStrip, encLabel: 'glitch', decLabel: 'strip' },
];
