// Author: Claude Opus 5.5 Low
// Date: 2026-10-16
// PURPOSE: Short curator's notes for notable pages of the Voynich Manuscript, keyed by the page
//          slug from src/data/voynich-pages.json. Shown in the book reader beside the page.
//          Kept to things the scholarship broadly agrees on; readings that are only proposals
//          are worded as such.
// SRP/DRY check: Pass — notes live only here; src/lib/voynich.ts re-exports them.

export const voynichNotes: Record<string, string> = {
  'front-cover': 'The book survives in a limp vellum binding. Inside are roughly 240 pages; about 32 more were lost or cut out over the centuries.',
  f1r: 'The first page. Under ultraviolet light a faint, erased name appears at the bottom, read by some as Jacobus de Tepenec, a chemist at the court of Emperor Rudolf II. Its reading is disputed.',
  f1v: 'The first plant. Like nearly every plant in the herbal section, it does not match any species botanists can name with confidence.',
  f2r: 'Herbal pages follow one layout: a single plant, roots to flowers, with text flowing around it.',
  f9v: 'One of the herbal pages most often compared to a real plant (a violet or pansy). Even the best matches stay guesses.',
  f13r: 'Broad, fan-like leaves over a swollen red root. The text sits neatly above and around the drawing.',
  f57v: 'A circular diagram with rings of single characters. One ring repeats the same short run of symbols several times, which looks more like a system than decoration.',
  f67r: 'The astronomical section begins: circular diagrams, one a sun with alternating red and blue rays.',
  f68r: 'Star charts. One cluster of stars is often read as the Pleiades, but there is no agreement.',
  'f69v-70r': 'A wide spread of concentric diagrams, part of the circle pages that lead into the zodiac.',
  f70v: 'The zodiac begins here, with Pisces rather than the usual Aries. Month names such as "abril" and "may" are written beside the signs in ordinary Latin letters, probably by a later hand.',
  'f70v-2': 'Aries, in the middle of rings of small figures. Each zodiac page has around thirty of them, one for each day of the month.',
  f71r: 'Aries again: the zodiac pages repeat Aries and Taurus, and Capricorn and Aquarius are missing entirely, probably on a lost page.',
  f73r: 'Scorpio, drawn as something closer to a lizard or a crocodile.',
  f73v: 'Sagittarius, the last surviving zodiac page, shown as a figure with a crossbow.',
  f75r: 'The biological section: small nude figures in green and blue pools, linked by tubes. Readings range from medieval bathing to the human body to pure allegory.',
  f77v: 'Figures, pools and branching tubes. Some see organs and plumbing; nobody has a reading that fits the text.',
  f78r: 'The most reproduced bathing page. The water channels look almost anatomical.',
  f84r: 'Rows of figures under arches above a green pool, with more figures bathing below.',
  'f85v-86r': 'The Rosettes: one sheet folded many times, the largest drawing in the book. Nine circles joined by causeways. One corner shows a walled castle whose swallowtail battlements some scholars link to northern Italy.',
  f88r: 'The pharmaceutical section: jars and containers, each beside rows of carefully drawn roots and leaves.',
  'f88v-89r': 'A foldout of containers and plant parts. Each item has a short label, which makes these pages a favourite place to test proposed decipherments.',
  f99r: 'More labelled roots and leaves. Labels are the shortest words in the book, so they are the easiest to compare with any claimed reading.',
  f103r: 'The recipe section: page after page of short paragraphs, each with a little star in the margin. Over three hundred of them.',
  f108v: 'Dense, regular writing with no illustrations. This is where the text statistics look most like a real language.',
  f116v: 'The last page. A few lines in a Latin-style script, mixing what look like German and Latin fragments. Like everything else here, nobody has made sense of them.',
};
