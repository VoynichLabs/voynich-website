// Author: Claude Opus 5.5 Low
// Date: 2026-10-15
// PURPOSE: The five sections ("worlds") of the Voynich Manuscript — name, folio, image and the
//          open question each one raises. Shared by the home page teaser strip and the
//          /voynich-manuscript write-up so the two never drift apart.
// SRP/DRY check: Pass — moved out of voynich-manuscript.astro, which used to own the only copy.

export interface VoynichWorld {
  emoji: string;
  name: string;
  folio: string;
  /** Path under public/, without the site base prefix. */
  image: string;
  question: string;
}

export const voynichWorlds: VoynichWorld[] = [
  {
    emoji: '🌿',
    name: 'Herbal',
    folio: 'f2v',
    image: '/voynich/f2v-herbal.jpg',
    question: 'What plants are these? They don\'t exist.',
  },
  {
    emoji: '⭐',
    name: 'Astronomical',
    folio: 'f68r3',
    image: '/voynich/f68r3-astronomical.jpg',
    question: 'What sky is this? It doesn\'t match any known system.',
  },
  {
    emoji: '🧘',
    name: 'Biological',
    folio: 'f77v',
    image: '/voynich/f77v-biological.jpg',
    question: 'What are these figures doing? Nobody knows.',
  },
  {
    emoji: '🌍',
    name: 'Cosmological',
    folio: 'f86v',
    image: '/voynich/f86v-cosmological.jpg',
    question: 'What place is this map of? It has never been found.',
  },
  {
    emoji: '💊',
    name: 'Pharmaceutical',
    folio: 'f99r',
    image: '/voynich/f99r-pharmaceutical.jpg',
    question: 'What is this medicine for? We don\'t know what it treats.',
  },
];
