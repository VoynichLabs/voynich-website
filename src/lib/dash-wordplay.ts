// Author: Claude Opus 5.5
// Date: 23-Nov-2026
// PURPOSE: Word-level pure text transforms for the DASH page: case styles, spoken language games
//          and clean-up operations. Groups:
//            case           - camelCase, PascalCase, snake_case, CONSTANT_CASE, kebab-case,
//                             Title Case, Sentence case, random case (seeded per word, so it stays
//                             stable while the user types)
//            language games - rovarspraket (Swedish robber language), Ubbi Dubbi, Opish,
//                             louchebem, javanais, verlan, gibberish (a keyed made-up vocabulary
//                             with a legend line), latin-ish, emoji speak, heavy leet, vowel swap
//            text ops       - remove accents, strip invisible (a sanitizer), shuffle words (keyed
//                             and reversible), boustrophedon, remove punctuation, collapse
//                             whitespace
//          Each transform follows the published description of the game or convention it names
//          (Wikipedia-level definitions of rovarspraket, Ubbi Dubbi, Opish, louchebem, javanais
//          and verlan; Unicode General Category data for the clean-up ops). Decoders are strict:
//          they throw a plain-English Error when the input is not in the expected form, and the
//          page shows that message. One-way and self-inverse transforms have dec: null and say so
//          in their note. Keyed transforms (gibberish, shuffle words) read the raw param string
//          and fall back to the default when it is missing or blank.
//          Every function is pure (no DOM, no network, no Math.random, no Date) and the only
//          import is type-only, so tests/dash-wordplay.test.mjs can transpile and load this file
//          on its own. Randomness comes from a small seeded PRNG keyed by the word, the line or
//          the param, so the same input always gives the same output.
//          Integration: dash.astro appends WORDPLAY_TRANSFORMS to the DASH registry, which is
//          shared by voynichlabs.org/dash and markbarney.net/dash.
//          SHARED FILE: the master copy is VoynichLabs/voynich-website src/lib/; markbarney.net
//          (82deutschmark/MarkSite) keeps an identical copy in client/src/lib/dash/. Edit the master,
//          then copy it across unchanged.
// SRP/DRY check: Pass - checked dash-transforms.ts and dash-glyphs.ts; none of these transforms
//          existed. The FNV-1a hash and mulberry32 PRNG are repeated from dash-glyphs.ts on
//          purpose: the test loader transpiles each file alone, so a runtime import would break
//          it. The three vowel-infix games share one encoder/decoder pair, the two consonant
//          games share another, and every word-level game shares wordCase().

import type { DashTransform } from './dash-glyphs';

// ---------------------------------------------------------------------------------------------
// shared helpers
// ---------------------------------------------------------------------------------------------

/** FNV-1a 32-bit string hash, used to seed the PRNG. */
function hashString(text: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < text.length; index++) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** mulberry32: small, fast, seedable PRNG returning floats in [0, 1). */
function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let mixed = state;
    mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}

/** The param box value, or the default when it is missing or blank. */
function paramOrDefault(param: string | undefined, fallback: string): string {
  const trimmed = (param ?? '').trim();
  return trimmed === '' ? fallback : trimmed;
}

function isUpperLetter(char: string | undefined): boolean {
  return char !== undefined && char !== '' && char !== char.toLowerCase() && char === char.toUpperCase();
}

function isLowerLetter(char: string | undefined): boolean {
  return char !== undefined && char !== '' && char !== char.toUpperCase() && char === char.toLowerCase();
}

function capitalize(word: string): string {
  const [first = '', ...rest] = Array.from(word);
  return first.toUpperCase() + rest.join('');
}

/** The case shape of a word: ALL CAPS (two or more letters), Capitalized, or lower. */
type WordCase = 'upper' | 'title' | 'lower';

function wordCase(word: string): WordCase {
  const letters = Array.from(word).filter((char) => char.toLowerCase() !== char.toUpperCase());
  if (letters.length > 1 && letters.every(isUpperLetter)) return 'upper';
  if (isUpperLetter(letters[0])) return 'title';
  return 'lower';
}

/** Give a lower-case word the case shape of the word it replaces. */
function applyCase(shape: WordCase, word: string): string {
  if (shape === 'upper') return word.toUpperCase();
  if (shape === 'title') return capitalize(word.toLowerCase());
  return word.toLowerCase();
}

/** Letter runs, the unit every word-level game works on. */
const LETTER_RUN = /\p{L}+/gu;

/** Split text into lines while keeping the exact line breaks, so line-wise ops can rejoin it. */
function splitLines(input: string): { lines: string[]; breaks: string[] } {
  const parts = input.split(/(\r\n|\n|\r)/);
  const lines: string[] = [];
  const breaks: string[] = [];
  parts.forEach((part, index) => (index % 2 === 0 ? lines : breaks).push(part));
  return { lines, breaks };
}

function joinLines(lines: string[], breaks: string[]): string {
  return lines.map((line, index) => line + (breaks[index] ?? '')).join('');
}

// ---------------------------------------------------------------------------------------------
// case: identifier styles. Words are found at spaces, punctuation, existing separators and
// camelCase humps (an acronym before a capitalised word, as in "XMLHttp", splits as XML + Http).
// Apostrophes inside words are dropped first so "don't" stays one word. Each line is converted
// on its own so multi-line input keeps its shape.
// ---------------------------------------------------------------------------------------------

// Each cased letter may carry combining marks (decomposed "É" is E + U+0301), so a mark never
// splits a word: (?:\p{Lu}\p{M}*) is one capital, (?:\p{Ll}\p{M}*) one small letter.
const IDENTIFIER_WORD =
  /(?:\p{Lu}\p{M}*)+(?=\p{Lu}\p{M}*\p{Ll})|(?:\p{Lu}\p{M}*)?(?:\p{Ll}\p{M}*)+|(?:\p{Lu}\p{M}*)+|\p{Lt}\p{M}*(?:\p{Ll}\p{M}*)*|[\p{Lo}\p{Lm}][\p{Lo}\p{Lm}\p{M}]*|\p{N}+/gu;

function identifierWords(line: string): string[] {
  return line.replace(/(\p{L})['’](?=\p{L})/gu, '$1').match(IDENTIFIER_WORD) ?? [];
}

function identifierStyle(join: (words: string[]) => string) {
  return (input: string): string => {
    const { lines, breaks } = splitLines(input);
    return joinLines(lines.map((line) => join(identifierWords(line))), breaks);
  };
}

const camelCase = identifierStyle((words) =>
  words.map((word, index) => (index === 0 ? word.toLowerCase() : capitalize(word.toLowerCase()))).join(''));
const pascalCase = identifierStyle((words) => words.map((word) => capitalize(word.toLowerCase())).join(''));
const snakeCase = identifierStyle((words) => words.map((word) => word.toLowerCase()).join('_'));
const constantCase = identifierStyle((words) => words.map((word) => word.toUpperCase()).join('_'));
const kebabCase = identifierStyle((words) => words.map((word) => word.toLowerCase()).join('-'));

// ---------------------------------------------------------------------------------------------
// case: prose styles. Title Case follows the common headline rule: capitalise every word except
// short articles, conjunctions and prepositions, which are capitalised only first or last on a
// line. Words that already carry inner capitals (iPhone, NASA) are left alone unless the whole
// line is shouting.
// ---------------------------------------------------------------------------------------------

const TITLE_SMALL_WORDS = new Set(
  'a an and as at but by en for from if in into nor of on onto or per so the to up via vs with yet'.split(' '),
);

const TITLE_WORD = /\p{L}[\p{L}\p{M}'’]*/gu;

function titleCase(input: string): string {
  const { lines, breaks } = splitLines(input);
  const converted = lines.map((line) => {
    const shouting = line === line.toUpperCase() && line !== line.toLowerCase();
    const source = shouting ? line.toLowerCase() : line;
    const words = source.match(TITLE_WORD) ?? [];
    let wordIndex = 0;
    return source.replace(TITLE_WORD, (word) => {
      const position = wordIndex++;
      const hasInnerCapital = Array.from(word).slice(1).some(isUpperLetter);
      if (hasInnerCapital) return word;
      const lower = word.toLowerCase();
      const edge = position === 0 || position === words.length - 1;
      return !edge && TITLE_SMALL_WORDS.has(lower) ? lower : capitalize(lower);
    });
  });
  return joinLines(converted, breaks);
}

const SENTENCE_END = new Set('.!?…');
const SENTENCE_CLOSERS = new Set(')"\'”’]');
const SENTENCE_OPENERS = new Set('"\'“‘([¿¡');

/** Capitalise the first letter of the text, of each line, and after . ! ? … plus whitespace.
 *  A single linear scan: the earlier regex form backtracked cubically on long whitespace runs. */
function capitalizeSentenceStarts(lower: string): string {
  let output = '';
  let capitalizeNext = true;
  let afterTerminator = false;
  for (const char of lower) {
    if (/\p{L}/u.test(char)) {
      output += capitalizeNext ? char.toUpperCase() : char;
      capitalizeNext = false;
      afterTerminator = false;
      continue;
    }
    output += char;
    if (char === '\n' || char === '\r') capitalizeNext = true;
    else if (SENTENCE_END.has(char)) afterTerminator = true;
    else if (/\s/u.test(char)) capitalizeNext ||= afterTerminator;
    else if (afterTerminator && SENTENCE_CLOSERS.has(char)) continue;
    else if (SENTENCE_OPENERS.has(char)) continue;
    else {
      capitalizeNext = false;
      afterTerminator = false;
    }
  }
  return output;
}

function sentenceCase(input: string): string {
  return capitalizeSentenceStarts(input.toLowerCase())
    .replace(/(?<![\p{L}\p{N}])i(?![\p{L}\p{N}]|\.\p{L})/gu, 'I');
}

/** Each letter upper or lower at random, seeded by the word and its position in the text. */
function randomCase(input: string): string {
  let wordIndex = 0;
  return input.replace(LETTER_RUN, (word) => {
    const random = seededRandom(hashString(`${word.toLowerCase()}:${wordIndex++}`));
    return Array.from(word, (char) => {
      const flipped = random() < 0.5 ? char.toUpperCase() : char.toLowerCase();
      // keep letters whose other case is longer (ß -> SS, ŉ -> ʼN), so the word keeps its length
      return flipped.length === char.length ? flipped : char;
    }).join('');
  });
}

// ---------------------------------------------------------------------------------------------
// language games: consonant infix games.
//   rovarspraket - every consonant is doubled with an o between (s -> sos). Swedish counts y as
//                  a vowel, so y is left alone.
//   opish        - "op" follows every consonant (cat -> copatop).
// The infix copies the consonant's case only when the neighbours are capitals too (shouted text),
// so "Hej" -> "Hohejoj" and "HEJ" -> "HOHEJOJ". Decoding checks every consonant really carries
// its infix, which makes it exact and lets it reject text that was never encoded.
// ---------------------------------------------------------------------------------------------

const SWEDISH_CONSONANTS = new Set('bcdfghjklmnpqrstvwxz');
const ENGLISH_CONSONANTS = new Set('bcdfghjklmnpqrstvwxyz');

function inShoutedContext(chars: string[], index: number): boolean {
  return isUpperLetter(chars[index]) && (isUpperLetter(chars[index - 1]) || isUpperLetter(chars[index + 1]));
}

function consonantGame(gameName: string, consonants: Set<string>, infixFor: (lowerConsonant: string) => string) {
  const enc = (input: string): string => {
    const chars = Array.from(input);
    return chars
      .map((char, index) => {
        const lower = char.toLowerCase();
        if (!consonants.has(lower)) return char;
        const infix = infixFor(lower);
        return char + (inShoutedContext(chars, index) ? infix.toUpperCase() : infix);
      })
      .join('');
  };
  const dec = (input: string): string => {
    const chars = Array.from(input);
    let output = '';
    for (let index = 0; index < chars.length; index++) {
      const char = chars[index];
      const lower = char.toLowerCase();
      if (!consonants.has(lower)) {
        output += char;
        continue;
      }
      const infix = infixFor(lower);
      const found = chars.slice(index + 1, index + 1 + infix.length).join('');
      if (found.toLowerCase() !== infix) {
        throw new Error(`not ${gameName}: "${char}" at position ${index + 1} should be followed by "${infix}"`);
      }
      output += char;
      index += infix.length;
    }
    return output;
  };
  return { enc, dec };
}

const rovarspraket = consonantGame('rovarspraket', SWEDISH_CONSONANTS, (consonant) => `o${consonant}`);
const opish = consonantGame('Opish', ENGLISH_CONSONANTS, () => 'op');

// ---------------------------------------------------------------------------------------------
// language games: vowel infix games. A syllable infix goes in front of each vowel sound (a run of
// vowels counts as one sound).
//   ubbi dubbi - "ub" before every vowel sound (hello -> hubellubo).
//   javanais   - "av" between a consonant and the vowel sound after it (bonjour -> bavonjavour);
//                a word-initial vowel takes no infix. French vowels, accented ones included.
// Case: a capital vowel in shouted text takes a capital infix ("UB"); a lone capital vowel moves
// its capital onto the infix ("Apple" -> "Ubapple"), which the decoder moves back.
// ---------------------------------------------------------------------------------------------

const ENGLISH_VOWELS = new Set('aeiouAEIOU');
const FRENCH_VOWELS = new Set('aeiouyàâäéèêëîïôöùûüÿæœAEIOUYÀÂÄÉÈÊËÎÏÔÖÙÛÜŸÆŒ');
const FRENCH_CONSONANTS = new Set('bcdfghjklmnpqrstvwxzçñ');

interface VowelGame {
  name: string;
  infix: string;
  vowels: Set<string>;
  /** Whether the vowel sound after `previous` (the original character before it) takes an infix. */
  takesInfix: (previous: string | undefined) => boolean;
}

function vowelGame(game: VowelGame) {
  const titleInfix = capitalize(game.infix);
  const enc = (input: string): string => {
    const chars = Array.from(input);
    let output = '';
    let index = 0;
    while (index < chars.length) {
      if (!game.vowels.has(chars[index])) {
        output += chars[index++];
        continue;
      }
      let end = index;
      while (end < chars.length && game.vowels.has(chars[end])) end++;
      const run = chars.slice(index, end);
      if (!game.takesInfix(chars[index - 1])) {
        output += run.join('');
      } else if (!isUpperLetter(run[0])) {
        output += game.infix + run.join('');
      } else if (isUpperLetter(chars[index - 1]) || isUpperLetter(chars[end]) || isUpperLetter(run[1])) {
        output += game.infix.toUpperCase() + run.join('');
      } else {
        output += titleInfix + run[0].toLowerCase() + run.slice(1).join('');
      }
      index = end;
    }
    return output;
  };
  const dec = (input: string): string => {
    const chars = Array.from(input);
    const infixLength = Array.from(game.infix).length;
    let output = '';
    let previous: string | undefined;
    let index = 0;
    while (index < chars.length) {
      const candidate = chars.slice(index, index + infixLength).join('');
      const vowelStart = index + infixLength;
      if (candidate.toLowerCase() === game.infix && game.vowels.has(chars[vowelStart] ?? '') && game.takesInfix(previous)) {
        let end = vowelStart;
        while (end < chars.length && game.vowels.has(chars[end])) end++;
        const run = chars.slice(vowelStart, end);
        if (candidate === titleInfix) run[0] = run[0].toUpperCase();
        output += run.join('');
        previous = run[run.length - 1];
        index = end;
        continue;
      }
      const char = chars[index];
      if (game.vowels.has(char) && game.takesInfix(previous)) {
        throw new Error(`not ${game.name}: the vowel "${char}" at position ${index + 1} has no "${game.infix}" before it`);
      }
      output += char;
      previous = char;
      index++;
    }
    return output;
  };
  return { enc, dec };
}

const ubbiDubbi = vowelGame({ name: 'Ubbi Dubbi', infix: 'ub', vowels: ENGLISH_VOWELS, takesInfix: () => true });
const javanais = vowelGame({
  name: 'javanais',
  infix: 'av',
  vowels: FRENCH_VOWELS,
  takesInfix: (previous) => previous !== undefined && FRENCH_CONSONANTS.has(previous.toLowerCase()),
});

// ---------------------------------------------------------------------------------------------
// language games: French slang. Both are word-level and need a vowel to anchor on.
//   louchebem - butchers' slang: the opening consonants move to the end, an l takes their place,
//               and a slangy suffix is added (boucher -> loucherbem). The suffix is chosen per
//               word (seeded by the word), so the same word always comes out the same. A few
//               attested words (boucher, fou, jargon, douce, cher) use their known forms.
//   verlan    - syllables swapped (louche -> chelou, pourri -> ripour). Syllables are found with a
//               simple French rule: split before a single consonant between vowels, and inside a
//               cluster unless it is an onset such as ch, br, pl. One-syllable words move the onset
//               to the end (fou -> ouf). A heuristic, so real verlan spellings differ at times.
// ---------------------------------------------------------------------------------------------

const LOUCHEBEM_SUFFIXES = ['em', 'é', 'i', 'oque', 'uche', 'ès'];
const FRENCH_ONSETS = new Set(
  'bl br ch cl cr dr fl fr gl gn gr ph pl pr qu th tr vr'.split(' '),
);

function isFrenchVowel(char: string | undefined): boolean {
  return char !== undefined && FRENCH_VOWELS.has(char);
}

/** Attested louchebem words, used as-is so the classics come out right. */
const LOUCHEBEM_ATTESTED: Record<string, string> = {
  boucher: 'loucherbem', fou: 'loufoque', jargon: 'largonji', douce: 'loucedé', cher: 'lerche',
};

function louchebemWord(word: string): string {
  const lower = word.toLowerCase();
  if (Object.hasOwn(LOUCHEBEM_ATTESTED, lower)) return applyCase(wordCase(word), LOUCHEBEM_ATTESTED[lower]);
  if (Array.from(lower).length < 3) return word;
  const suffix = LOUCHEBEM_SUFFIXES[hashString(lower) % LOUCHEBEM_SUFFIXES.length];
  let onsetLength = 0;
  if (lower.startsWith('qu')) onsetLength = 2;
  else while (onsetLength < lower.length && !isFrenchVowel(lower[onsetLength])) onsetLength++;
  if (onsetLength >= lower.length) return word; // no vowel to anchor on
  const result = `l${lower.slice(onsetLength)}${lower.slice(0, onsetLength)}${suffix}`;
  return applyCase(wordCase(word), result);
}

function verlanWord(word: string): string {
  const lower = word.toLowerCase();
  const chars = Array.from(lower);
  if (chars.length < 3) return word;
  const firstVowel = chars.findIndex((char) => isFrenchVowel(char));
  if (firstVowel < 0) return word;
  let nucleusEnd = firstVowel;
  while (nucleusEnd < chars.length && isFrenchVowel(chars[nucleusEnd])) nucleusEnd++;
  let nextVowel = nucleusEnd;
  while (nextVowel < chars.length && !isFrenchVowel(chars[nextVowel])) nextVowel++;
  let split: number;
  if (nextVowel >= chars.length) {
    // one syllable: move the onset behind the rest (fou -> ouf)
    if (firstVowel === 0) return word;
    split = firstVowel;
  } else {
    const cluster = chars.slice(nucleusEnd, nextVowel).join('');
    if (cluster.length <= 1) split = nucleusEnd;
    else if (FRENCH_ONSETS.has(cluster.slice(-2))) split = nextVowel - 2;
    else split = nextVowel - 1;
  }
  const result = chars.slice(split).join('') + chars.slice(0, split).join('');
  return applyCase(wordCase(word), result);
}

const louchebem = (input: string): string => input.replace(LETTER_RUN, louchebemWord);
const verlan = (input: string): string => input.replace(LETTER_RUN, verlanWord);

// ---------------------------------------------------------------------------------------------
// language games: gibberish. Every distinct word gets its own pronounceable made-up word (CV
// syllables), chosen from a hash of the key and the word, so the same key always teaches the same
// vocabulary. A legend line at the end lists each made-up word and its meaning, so the output can
// be pasted to a model to teach it the code. Decoding reads that legend.
// ---------------------------------------------------------------------------------------------

const GIBBERISH_CONSONANTS = 'bdfgklmnprstvz';
const GIBBERISH_VOWELS = 'aeiou';
const GIBBERISH_CODAS = 'nrslk';
const GIBBERISH_LEGEND_PREFIX = '[gibberish legend: ';
const GIBBERISH_LEGEND = /\[gibberish legend: ([^\]\r\n]*)\]/g;

function makeNonsense(key: string, word: string, attempt: number): string {
  const random = seededRandom(hashString(`${key}:${word}:${attempt}`));
  const pick = (alphabet: string) => alphabet[Math.floor(random() * alphabet.length)];
  // Every 16 failed attempts adds a syllable, so the pool of made-up words keeps growing and the
  // collision loop in gibberishEncode always ends (one syllable alone offers only ~420 words).
  const syllables = Math.min(4, Math.max(1, Math.ceil(Array.from(word).length / 3))) + Math.floor(attempt / 16);
  let made = '';
  for (let count = 0; count < syllables; count++) made += pick(GIBBERISH_CONSONANTS) + pick(GIBBERISH_VOWELS);
  if (random() < 0.4) made += pick(GIBBERISH_CODAS);
  return made;
}

function gibberishEncode(input: string, param?: string): string {
  const key = paramOrDefault(param, 'swan');
  const words = input.match(LETTER_RUN) ?? [];
  if (words.length === 0) return input;
  const realWords = new Set(words.map((word) => word.toLowerCase()));
  const vocabulary = new Map<string, string>();
  const taken = new Set<string>();
  for (const word of words) {
    const lower = word.toLowerCase();
    if (vocabulary.has(lower)) continue;
    let attempt = 0;
    let made = makeNonsense(key, lower, attempt);
    // never reuse a made-up word, and never make one that is also a real word in the text
    while (taken.has(made) || realWords.has(made)) made = makeNonsense(key, lower, ++attempt);
    taken.add(made);
    vocabulary.set(lower, made);
  }
  const body = input.replace(LETTER_RUN, (word) => applyCase(wordCase(word), vocabulary.get(word.toLowerCase()) ?? word));
  const legend = Array.from(vocabulary, ([word, made]) => `${made}=${word}`).join(', ');
  return `${body}\n\n${GIBBERISH_LEGEND_PREFIX}${legend}]`;
}

function gibberishDecode(input: string): string {
  const legends = Array.from(input.matchAll(GIBBERISH_LEGEND));
  const legendMatch = legends[legends.length - 1];
  if (!legendMatch || legendMatch.index === undefined) {
    // text with no letters (or empty) has nothing to translate, and the encoder adds no legend to it
    if (!/\p{L}/u.test(input)) return input;
    throw new Error('no gibberish legend found: paste the whole output, including its [gibberish legend: ...] line');
  }
  const meaning = new Map<string, string>();
  for (const entry of legendMatch[1].split(',')) {
    const pair = entry.trim();
    if (pair === '') continue;
    // the word side may carry marks: lower-casing can add one (İ -> i + U+0307)
    const parts = /^(\p{L}+)=(\p{L}[\p{L}\p{M}]*)$/u.exec(pair);
    if (!parts) throw new Error(`the gibberish legend entry "${pair}" is not in made=word form`);
    meaning.set(parts[1].toLowerCase(), parts[2]);
  }
  const body = (input.slice(0, legendMatch.index) + input.slice(legendMatch.index + legendMatch[0].length))
    .replace(/(\r?\n){1,2}$/, '');
  return body.replace(LETTER_RUN, (word) => {
    const original = meaning.get(word.toLowerCase());
    if (original === undefined) return word;
    const restored = applyCase(wordCase(word), original);
    // a letter run never holds marks, so any mark here came from case mapping: recompose it
    return /\p{M}/u.test(restored) ? restored.normalize('NFC') : restored;
  });
}

// ---------------------------------------------------------------------------------------------
// language games: latin-ish (dog Latin). Common function words become their real Latin
// equivalents; other words of three or more letters get a Latin-looking ending. English endings
// map to Latin ones where there is an obvious match (-ing -> -ando, -ed -> -atus, -ly -> -iter,
// -tion -> -tio); the rest take an ending chosen by a hash of the word, so it is stable.
// ---------------------------------------------------------------------------------------------

const LATIN_WORDS: Record<string, string> = {
  and: 'et', or: 'aut', not: 'non', is: 'est', are: 'sunt', the: 'ille', of: 'de', with: 'cum',
  to: 'ad', for: 'pro', from: 'ex', without: 'sine', i: 'ego', you: 'tu', we: 'nos', but: 'sed',
  if: 'si', yes: 'ita', no: 'minime', all: 'omnis', very: 'valde', good: 'bonus', bad: 'malus',
};
const LATIN_ENDINGS = ['us', 'um', 'is', 'ae', 'ium', 'orum', 'ibus', 'ex', 'ator'];

function latinWord(word: string): string {
  const lower = word.toLowerCase();
  const shape = wordCase(word);
  // own-property check: "constructor" or "toString" must not reach Object.prototype
  if (Object.hasOwn(LATIN_WORDS, lower)) return applyCase(shape, LATIN_WORDS[lower]);
  if (lower.length < 3 || !/^[a-z]+$/.test(lower)) return word;
  let latin: string;
  if (lower.endsWith('tion')) latin = `${lower.slice(0, -4)}tio`;
  else if (lower.endsWith('ing') && lower.length > 4) latin = `${lower.slice(0, -3)}ando`;
  else if (lower.endsWith('ed') && lower.length > 3) latin = `${lower.slice(0, -2)}atus`;
  else if (lower.endsWith('ly') && lower.length > 3) latin = `${lower.slice(0, -2)}iter`;
  else {
    const stem = /[aeiouy]$/.test(lower) ? lower.slice(0, -1) : lower;
    latin = stem + LATIN_ENDINGS[hashString(lower) % LATIN_ENDINGS.length];
  }
  return applyCase(shape, latin);
}

const latinish = (input: string): string => input.replace(LETTER_RUN, latinWord);

// ---------------------------------------------------------------------------------------------
// language games: emoji speak. About 300 everyday words swap for an emoji; plurals ending in -s
// fall back to the singular. Unknown words are left as they are.
// ---------------------------------------------------------------------------------------------

const EMOJI_WORD_LIST =
  'happy 😊|sad 😢|love ❤️|heart ❤️|laugh 😂|lol 😂|cry 😭|angry 😠|mad 😠|cool 😎|smile 😊|kiss 😘|' +
  'wink 😉|think 🤔|thinking 🤔|sleep 😴|tired 😴|sleepy 😴|sick 🤒|scared 😱|fear 😱|shock 😱|' +
  'wow 😮|ok 👌|okay 👌|yes 👍|no 👎|good 👍|bad 👎|clap 👏|pray 🙏|please 🙏|thanks 🙏|thank 🙏|' +
  'hello 👋|hi 👋|bye 👋|wave 👋|strong 💪|muscle 💪|eyes 👀|eye 👁️|look 👀|see 👀|watch 👀|ear 👂|' +
  'hear 👂|nose 👃|mouth 👄|tongue 👅|brain 🧠|hand ✋|point 👉|finger 👆|man 👨|woman 👩|boy 👦|' +
  'girl 👧|baby 👶|person 🧑|people 👥|family 👪|king 🤴|queen 👸|prince 🤴|princess 👸|police 👮|' +
  'cop 👮|doctor 🧑‍⚕️|teacher 🧑‍🏫|farmer 🧑‍🌾|cook 🧑‍🍳|chef 🧑‍🍳|artist 🧑‍🎨|scientist 🧑‍🔬|' +
  'astronaut 🧑‍🚀|ninja 🥷|robot 🤖|ghost 👻|alien 👽|skull 💀|dead 💀|devil 😈|angel 😇|clown 🤡|' +
  'poop 💩|dog 🐶|cat 🐱|mouse 🐭|rabbit 🐰|bunny 🐰|fox 🦊|bear 🐻|panda 🐼|tiger 🐯|lion 🦁|cow 🐮|' +
  'pig 🐷|frog 🐸|monkey 🐵|chicken 🐔|bird 🐦|penguin 🐧|duck 🦆|eagle 🦅|owl 🦉|bat 🦇|wolf 🐺|' +
  'horse 🐴|unicorn 🦄|bee 🐝|bug 🐛|butterfly 🦋|snail 🐌|spider 🕷️|turtle 🐢|snake 🐍|dragon 🐉|' +
  'dinosaur 🦖|whale 🐳|dolphin 🐬|fish 🐟|shark 🦈|octopus 🐙|crab 🦀|lobster 🦞|shrimp 🦐|swan 🦢|' +
  'flower 🌸|rose 🌹|tree 🌳|plant 🌱|leaf 🍃|mushroom 🍄|sun ☀️|moon 🌙|star ⭐|cloud ☁️|rain 🌧️|' +
  'snow ❄️|storm ⛈️|lightning ⚡|fire 🔥|hot 🔥|cold 🥶|water 💧|ocean 🌊|sea 🌊|rainbow 🌈|earth 🌍|' +
  'world 🌍|planet 🪐|mountain ⛰️|volcano 🌋|beach 🏖️|island 🏝️|desert 🏜️|city 🏙️|house 🏠|home 🏠|' +
  'school 🏫|hospital 🏥|bank 🏦|church ⛪|castle 🏰|car 🚗|bus 🚌|train 🚆|plane ✈️|airplane ✈️|' +
  'rocket 🚀|ship 🚢|boat ⛵|bike 🚲|bicycle 🚲|apple 🍎|banana 🍌|grape 🍇|lemon 🍋|cherry 🍒|' +
  'strawberry 🍓|peach 🍑|watermelon 🍉|pineapple 🍍|avocado 🥑|carrot 🥕|corn 🌽|potato 🥔|bread 🍞|' +
  'cheese 🧀|egg 🥚|bacon 🥓|meat 🍖|burger 🍔|pizza 🍕|fries 🍟|hotdog 🌭|taco 🌮|sandwich 🥪|rice 🍚|' +
  'noodles 🍜|sushi 🍣|cake 🎂|cookie 🍪|chocolate 🍫|candy 🍬|icecream 🍦|donut 🍩|popcorn 🍿|' +
  'coffee ☕|tea 🍵|milk 🥛|beer 🍺|wine 🍷|cocktail 🍸|drink 🥤|food 🍽️|eat 🍽️|money 💰|cash 💵|' +
  'dollar 💵|gold 🥇|gem 💎|diamond 💎|gift 🎁|present 🎁|party 🎉|balloon 🎈|music 🎵|song 🎵|' +
  'guitar 🎸|piano 🎹|drum 🥁|microphone 🎤|movie 🎬|film 🎬|camera 📷|photo 📸|phone 📱|computer 💻|' +
  'laptop 💻|keyboard ⌨️|email 📧|mail 📬|letter ✉️|book 📖|read 📖|write ✍️|pen 🖊️|pencil ✏️|' +
  'paper 📄|calendar 📅|clock ⏰|time ⏰|key 🔑|lock 🔒|door 🚪|bed 🛏️|chair 🪑|toilet 🚽|shower 🚿|' +
  'light 💡|idea 💡|bomb 💣|knife 🔪|sword ⚔️|gun 🔫|shield 🛡️|tool 🔧|hammer 🔨|magnet 🧲|' +
  'science 🔬|medicine 💊|pill 💊|bandage 🩹|dna 🧬|ball ⚽|soccer ⚽|football 🏈|basketball 🏀|' +
  'baseball ⚾|tennis 🎾|game 🎮|dice 🎲|trophy 🏆|win 🏆|medal 🏅|run 🏃|running 🏃|walk 🚶|' +
  'dance 💃|swim 🏊|flag 🚩|warning ⚠️|stop 🛑|check ✅|correct ✅|wrong ❌|question ❓|secret 🤫|' +
  'quiet 🤫|speak 🗣️|talk 💬|chat 💬|search 🔍|find 🔍|link 🔗|new 🆕|free 🆓|top 🔝|up ⬆️|down ⬇️|' +
  'left ⬅️|right ➡️|hundred 💯|crown 👑|ring 💍|shirt 👕|shoe 👟|hat 🎩|glasses 👓|bag 👜|night 🌃|' +
  'morning 🌅|sunrise 🌅|birthday 🎂|christmas 🎄|halloween 🎃|magic 🪄|crystal 🔮|boom 💥|' +
  'sparkle ✨|zap ⚡|nature 🌿|recycle ♻️|peace ☮️|globe 🌐|internet 🌐|map 🗺️|compass 🧭|' +
  'battery 🔋|plug 🔌|tv 📺|radio 📻|sound 🔊|bell 🔔|heartbreak 💔|broken 💔|crazy 🤪|nerd 🤓|' +
  'hug 🤗|yum 😋|delicious 😋|mask 😷|snowman ⛄|tent ⛺|anchor ⚓|umbrella ☂️|hourglass ⌛';

const EMOJI_WORDS: Record<string, string> = Object.fromEntries(
  EMOJI_WORD_LIST.split('|').map((entry) => {
    const space = entry.indexOf(' ');
    return [entry.slice(0, space), entry.slice(space + 1)];
  }),
);

function emojiSpeak(input: string): string {
  return input.replace(LETTER_RUN, (word) => {
    const lower = word.toLowerCase();
    if (Object.hasOwn(EMOJI_WORDS, lower)) return EMOJI_WORDS[lower];
    if (lower.length > 3 && lower.endsWith('s') && Object.hasOwn(EMOJI_WORDS, lower.slice(0, -1))) {
      return EMOJI_WORDS[lower.slice(0, -1)];
    }
    return word;
  });
}

// ---------------------------------------------------------------------------------------------
// language games: heavy leet. Letters become multi-character ASCII drawings (|-| for h, /\/\ for
// m). The table is prefix-safe, so decoding by longest match is exact. Any input character that
// also appears in the drawings (digits, | / \ ( ) and friends) is escaped with ~ so it survives
// the round trip. A-Z come back lower case; other letters pass through unchanged.
// ---------------------------------------------------------------------------------------------

const HEAVY_LEET: Record<string, string> = {
  a: '/-\\', b: '|3', c: '(', d: '|)', e: '3', f: '|=', g: '6', h: '|-|', i: '!', j: '_|',
  k: '|<', l: '|_', m: '/\\/\\', n: '|\\|', o: '0', p: '|*', q: '(,)', r: '|2', s: '5', t: '7',
  u: '(_)', v: '\\/', w: '\\^/', x: '><', y: '`/', z: '2',
};
const HEAVY_LEET_ESCAPE = '~';
const HEAVY_LEET_SYMBOLS = new Set([HEAVY_LEET_ESCAPE, ...Object.values(HEAVY_LEET).join('')]);
const HEAVY_LEET_DECODE = Object.entries(HEAVY_LEET)
  .map(([letter, drawing]) => ({ letter, drawing }))
  .sort((left, right) => right.drawing.length - left.drawing.length);

function heavyLeetEncode(input: string): string {
  return Array.from(input, (char) => {
    const drawing = HEAVY_LEET[char.toLowerCase()];
    if (drawing !== undefined) return drawing;
    return HEAVY_LEET_SYMBOLS.has(char) ? HEAVY_LEET_ESCAPE + char : char;
  }).join('');
}

function heavyLeetDecode(input: string): string {
  let output = '';
  let index = 0;
  while (index < input.length) {
    if (input[index] === HEAVY_LEET_ESCAPE) {
      const escaped = input.codePointAt(index + 1);
      if (escaped === undefined) throw new Error('heavy leet ends with a lone ~ escape');
      output += String.fromCodePoint(escaped);
      index += escaped > 0xffff ? 3 : 2;
      continue;
    }
    const match = HEAVY_LEET_DECODE.find(({ drawing }) => input.startsWith(drawing, index));
    if (match) {
      output += match.letter;
      index += match.drawing.length;
    } else if (HEAVY_LEET_SYMBOLS.has(input[index])) {
      throw new Error(`not heavy leet: "${input[index]}" at position ${index + 1} is not part of any letter (escape it as ~${input[index]})`);
    } else {
      output += input[index++];
    }
  }
  return output;
}

// ---------------------------------------------------------------------------------------------
// language games: vowel swap. Each vowel moves one step along a -> e -> i -> o -> u -> a, keeping
// its case. Decoding steps back.
// ---------------------------------------------------------------------------------------------

function vowelShift(step: 1 | -1) {
  const cycle = 'aeiou';
  return (input: string): string =>
    input.replace(/[aeiou]/gi, (vowel) => {
      const lower = vowel.toLowerCase();
      const shifted = cycle[(cycle.indexOf(lower) + step + cycle.length) % cycle.length];
      return vowel === lower ? shifted : shifted.toUpperCase();
    });
}

// ---------------------------------------------------------------------------------------------
// text ops: clean-up
// ---------------------------------------------------------------------------------------------

/** Latin letters that carry their mark inside the letter, so NFD does not split them. */
const UNDECOMPOSABLE_LATIN: Record<string, string> = {
  ø: 'o', Ø: 'O', ł: 'l', Ł: 'L', đ: 'd', Đ: 'D', ħ: 'h', Ħ: 'H', ı: 'i', ß: 'ss', ẞ: 'SS',
  æ: 'ae', Æ: 'AE', œ: 'oe', Œ: 'OE', þ: 'th', Þ: 'Th', ð: 'd', Ð: 'D', ŧ: 't', Ŧ: 'T', ƀ: 'b', ɨ: 'i',
};

/** Strip accents from Latin and Greek letters only; other scripts (Hindi vowel signs, Hebrew
 *  points, emoji keycaps) keep their marks because there they are part of the spelling. */
function removeAccents(input: string): string {
  return input
    .normalize('NFD')
    .replace(/([\p{Script=Latin}\p{Script=Greek}])\p{Mn}+/gu, '$1')
    .replace(/[øØłŁđĐħĦıßẞæÆœŒþÞðÐŧŦƀɨ]/g, (char) => UNDECOMPOSABLE_LATIN[char] ?? char)
    .normalize('NFC');
}

/** Characters that render as nothing: format characters (zero-width space/joiners, bidi controls,
 *  soft hyphen, word joiner, BOM, tag characters), variation selectors, the combining grapheme
 *  joiner, the Hangul fillers and Mongolian free variation selectors, and C0/C1 control codes
 *  other than tab, line feed and carriage return. */
const INVISIBLE =
  /[\p{Cf}\u034F\u115F\u1160\u3164\uFFA0\u180B-\u180D\u180F\uFE00-\uFE0F\u{E0100}-\u{E01EF}\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/gu;

const stripInvisible = (input: string): string => input.replace(INVISIBLE, '');
const removePunctuation = (input: string): string => input.replace(/\p{P}/gu, '');

/** Runs of spaces and tabs become one space, line ends are trimmed, and blank-line runs shrink to
 *  a single blank line. Unicode spaces (no-break, em, ideographic) count as spaces. */
function collapseWhitespace(input: string): string {
  return input
    .replace(/\r\n?/g, '\n')
    .replace(/[^\S\n]+/g, ' ')
    .replace(/ ?\n ?/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// ---------------------------------------------------------------------------------------------
// text ops: shuffle words. On each line the words (whitespace-separated, punctuation travels with
// its word) are permuted with a Fisher-Yates shuffle seeded by the key, the line number and the
// word count. The spacing between words stays in place. The permutation does not depend on the
// words themselves, so the same key undoes it.
// ---------------------------------------------------------------------------------------------

function wordPermutation(key: string, lineIndex: number, count: number): number[] {
  const order = Array.from({ length: count }, (_unused, index) => index);
  const random = seededRandom(hashString(`${key}:${lineIndex}:${count}`));
  for (let index = count - 1; index > 0; index--) {
    const swapWith = Math.floor(random() * (index + 1));
    [order[index], order[swapWith]] = [order[swapWith], order[index]];
  }
  // a shuffle that changed nothing would look broken: rotate by one instead
  if (count > 1 && order.every((value, index) => value === index)) order.push(order.shift() as number);
  return order;
}

function shuffleLines(input: string, param: string | undefined, direction: 'shuffle' | 'restore'): string {
  const key = paramOrDefault(param, 'swan');
  const { lines, breaks } = splitLines(input);
  const shuffled = lines.map((line, lineIndex) => {
    const parts = line.split(/(\s+)/);
    const words = parts.filter((_part, index) => index % 2 === 0 && parts[index] !== '');
    if (words.length < 2) return line;
    const order = wordPermutation(key, lineIndex, words.length);
    const arranged = new Array<string>(words.length);
    // shuffle: slot i shows word order[i]; restore: word order[i] goes back to slot order[i]
    order.forEach((source, slot) => {
      if (direction === 'shuffle') arranged[slot] = words[source];
      else arranged[source] = words[slot];
    });
    let next = 0;
    return parts.map((part, index) => (index % 2 === 0 && part !== '' ? arranged[next++] : part)).join('');
  });
  return joinLines(shuffled, breaks);
}

// ---------------------------------------------------------------------------------------------
// text ops: boustrophedon ("as the ox ploughs"). Every second line runs right to left. Lines are
// reversed by grapheme (emoji, flags and accented letters stay whole), so running it twice gives
// the original back. Known limit: a line that starts with a lone combining mark, or holds an odd
// number of flag letters, re-segments differently once reversed, so it may not undo exactly.
// ---------------------------------------------------------------------------------------------

const graphemeSegmenter: Intl.Segmenter | null =
  typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function' ? new Intl.Segmenter(undefined, { granularity: 'grapheme' }) : null;

function reverseGraphemes(line: string): string {
  const graphemes = graphemeSegmenter
    ? Array.from(graphemeSegmenter.segment(line), (segment) => segment.segment)
    : Array.from(line);
  return graphemes.reverse().join('');
}

function boustrophedon(input: string): string {
  const { lines, breaks } = splitLines(input);
  return joinLines(lines.map((line, index) => (index % 2 === 1 ? reverseGraphemes(line) : line)), breaks);
}

// ---------------------------------------------------------------------------------------------
// registry
// ---------------------------------------------------------------------------------------------

const SHUFFLE_KEY = { label: 'key', default: 'swan', hint: 'any text; the same key unshuffles' };
const GIBBERISH_KEY = { label: 'key', default: 'swan', hint: 'any text; each key makes its own vocabulary' };

export const WORDPLAY_TRANSFORMS: DashTransform[] = [
  // case
  { id: 'camelcase', label: 'camelCase', group: 'case', enc: camelCase, dec: null,
    note: 'One-way. Words join with humps; spaces and punctuation are dropped, one result per line.' },
  { id: 'pascalcase', label: 'PascalCase', group: 'case', enc: pascalCase, dec: null,
    note: 'One-way. Every word capitalised and joined; spaces and punctuation are dropped.' },
  { id: 'snakecase', label: 'snake_case', group: 'case', enc: snakeCase, dec: null,
    note: 'One-way. Lower-case words joined with _; punctuation is dropped.' },
  { id: 'constantcase', label: 'CONSTANT_CASE', group: 'case', enc: constantCase, dec: null,
    note: 'One-way. Upper-case words joined with _; punctuation is dropped.' },
  { id: 'kebabcase', label: 'kebab-case', group: 'case', enc: kebabCase, dec: null,
    note: 'One-way. Lower-case words joined with -; punctuation is dropped.' },
  { id: 'titlecase', label: 'Title Case', group: 'case', enc: titleCase, dec: null,
    note: 'One-way. Capitalises each word except small words (of, the, and) mid-line. Words like iPhone stay as they are.' },
  { id: 'sentencecase', label: 'Sentence case', group: 'case', enc: sentenceCase, dec: null,
    note: 'One-way. Lower case with a capital at the start of each sentence and line. Names and acronyms lose their capitals.' },
  { id: 'randomcase', label: 'random case', group: 'case', enc: randomCase, dec: null,
    note: 'One-way. Each letter flips case at random, seeded per word so it stays put while you type.' },

  // language games
  { id: 'rovarspraket', label: 'rövarspråket', group: 'language games', ...rovarspraket,
    note: 'Swedish robber language: each consonant doubles with o between (s -> sos). y counts as a vowel.' },
  { id: 'ubbidubbi', label: 'ubbi dubbi', group: 'language games', ...ubbiDubbi,
    note: '"ub" before every vowel sound (hello -> hubellubo). Exact round trip.' },
  { id: 'opish', label: 'opish', group: 'language games', ...opish,
    note: '"op" after every consonant (cat -> copatop). Exact round trip.' },
  { id: 'louchebem', label: 'louchebem', group: 'language games', enc: louchebem, dec: null,
    note: 'One-way French butchers\' slang: onset moves to the end, l in front, slangy suffix (boucher -> loucherbem).' },
  { id: 'javanais', label: 'javanais', group: 'language games', ...javanais,
    note: 'French: "av" between a consonant and the vowel after it (bonjour -> bavonjavour). Exact round trip.' },
  { id: 'verlan', label: 'verlan', group: 'language games', enc: verlan, dec: null,
    note: 'One-way French back-slang: syllables swap (louche -> chelou). A spelling heuristic, not a dictionary.' },
  { id: 'gibberish', label: 'gibberish', group: 'language games', enc: gibberishEncode, dec: gibberishDecode,
    param: GIBBERISH_KEY,
    note: 'Each word gets a made-up word, plus a legend line to teach it. Decode needs the legend. Odd inner capitals (iPhone) come back lower case.' },
  { id: 'latinish', label: 'latin-ish', group: 'language games', enc: latinish, dec: null,
    note: 'One-way dog Latin: small words become real Latin (and -> et), the rest get Latin endings.' },
  { id: 'emojispeak', label: 'emoji speak', group: 'language games', enc: emojiSpeak, dec: null,
    note: 'One-way. About 300 common words become emoji; other words are left alone.' },
  { id: 'heavyleet', label: 'heavy leet', group: 'language games', enc: heavyLeetEncode, dec: heavyLeetDecode,
    note: 'A-Z drawn in ASCII (|-| for h, /\\/\\ for m). They come back lower case; digits and symbols are escaped with ~.' },
  { id: 'vowelswap', label: 'vowel swap', group: 'language games', enc: vowelShift(1), dec: vowelShift(-1),
    note: 'Each vowel moves one step: a -> e -> i -> o -> u -> a. Decode steps back.' },

  // text ops
  { id: 'removeaccents', label: 'remove accents', group: 'text ops', enc: removeAccents, dec: null,
    note: 'One-way. Strips accents from Latin and Greek letters (café -> cafe, ß -> ss). Other scripts keep their marks.' },
  { id: 'stripinvisible', label: 'strip invisible', group: 'text ops', enc: stripInvisible, dec: null,
    note: 'One-way sanitizer: removes zero-width, bidi, tag and control characters, variation selectors and soft hyphens. Joined emoji split apart.' },
  { id: 'shufflewords', label: 'shuffle words', group: 'text ops',
    enc: (input, param) => shuffleLines(input, param, 'shuffle'),
    dec: (input, param) => shuffleLines(input, param, 'restore'),
    param: SHUFFLE_KEY,
    note: 'Shuffles the words on each line with a key; the same key puts them back. Spacing stays put.' },
  { id: 'boustrophedon', label: 'boustrophedon', group: 'text ops', enc: boustrophedon, dec: null,
    note: 'Every second line runs backwards, as the ox ploughs. Self-inverse: run it again to undo.' },
  { id: 'removepunctuation', label: 'remove punctuation', group: 'text ops', enc: removePunctuation, dec: null,
    note: 'One-way. Deletes punctuation marks (symbols like $ and + stay).' },
  { id: 'collapsewhitespace', label: 'collapse whitespace', group: 'text ops', enc: collapseWhitespace, dec: null,
    note: 'One-way. One space between words, no trailing spaces, at most one blank line in a row.' },
];
