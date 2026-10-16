// Author: Claude Opus 5.5 Low
// Date: 2026-10-16
// PURPOSE: What each scanned page of the Voynich Manuscript actually shows ("Plant", "Zodiac:
//          Pisces", "Text page" ...), used as the caption under every image. Checked by eye
//          against all page scans on 2026-10-16. The book's sections are positional (where a page
//          sits in the volume); this is pictorial, so plant pages among the jars read "Plant",
//          text-only pages read "Text page", and each zodiac page names its sign.
// SRP/DRY check: Pass — the only per-page caption source; src/lib/voynich.ts exposes pageKind().

/** Default caption for a page by its section, when no override below applies. */
export const kindBySection: Record<string, string> = {
  binding: 'Binding',
  herbal: 'Plant',
  astronomical: 'Circular diagram',
  biological: 'Bathing figures',
  cosmological: 'Rosettes foldout',
  pharmaceutical: 'Jars and plant parts',
  recipes: 'Starred paragraphs',
};

/** Pages whose picture differs from their section's default. */
export const kindOverrides: Record<string, string> = {
  'front-cover': 'Front cover',
  'inside-front-cover': 'Inside front cover',
  'back-flyleaf-recto': 'Back flyleaf',
  'back-flyleaf-verso-inside-back-cover': 'Inside back cover',
  head: 'Top edge',
  tail: 'Bottom edge',
  'fore-edge': 'Fore-edge',
  spine: 'Spine',
  'back-cover': 'Back cover',

  f1r: 'Opening text page',
  f57v: 'Circular diagram',
  f58r: 'Text page',
  f58v: 'Text page',
  f66r: 'Text page',

  f67r: 'Sun and moon diagrams',
  f67v: 'Star diagrams',
  f68r: 'Star charts',
  f68v: 'Circular diagrams',
  f69r: 'Circular diagram',
  'f69v-70r': 'Circular diagrams',
  f70v: 'Zodiac: Pisces',
  'f70v-2': 'Zodiac: Aries',
  f71r: 'Zodiac: Aries',
  'f71v-72r': 'Zodiac: Taurus, Gemini, Cancer',
  f72v: 'Zodiac: Leo and Virgo',
  'f72v-2': 'Zodiac: Libra',
  f73r: 'Zodiac: Scorpio',
  f73v: 'Zodiac: Sagittarius',

  f76r: 'Text page',
  f85r: 'Text page',
  f86v: 'Rosettes foldout, back',

  f87r: 'Plant',
  f87v: 'Plants',
  f90r: 'Plant',
  f90v: 'Plant',
  f93r: 'Plant',
  f93v: 'Plant',
  f94r: 'Plant',
  'f94v-95r': 'Plants',
  f95v: 'Plant',
  'f95v-2': 'Plant',
  f96r: 'Plant',
  f96v: 'Plant',
  'f89v-90r': 'Jars and plants',

  f116v: 'Last page',
};
