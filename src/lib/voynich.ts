// Author: Claude Opus 5.5 Low
// Date: 2026-10-16
// PURPOSE: One place for everything the Voynich pages need to know about the manuscript's scans:
//          the ordered page list (from src/data/voynich-pages.json, written by
//          scripts/fetch-voynich-pages.mjs), sections, missing folios, curator notes, and URL
//          helpers for local thumbnails and Yale's IIIF deep-zoom service.
// SRP/DRY check: Pass — the reader, the book overview, the story page and the home page all
//          read from here instead of hardcoding folios.
import data from '../data/voynich-pages.json';
import { voynichNotes } from '../data/voynich-notes';

export interface VoynichPage {
  slug: string;
  label: string;
  folios: number[];
  section: string;
  service: string;
  width: number;
  height: number;
  foldout: boolean;
  part: boolean;
}

export interface VoynichSection {
  id: string;
  name: string;
  from: number;
  to: number;
}

export const pages: VoynichPage[] = data.pages;
export const sections: VoynichSection[] = data.sections;
export const missingFolios: number[] = data.missing;
export const credit: string = data.credit;
export const notes = voynichNotes;

/** Short descriptions for each section, shown on the book overview and in the reader. */
export const sectionBlurbs: Record<string, string> = {
  binding: 'The covers, flyleaves and edges of the book as it survives today.',
  herbal: 'Page after page of plants, each with a block of text. Almost none of them can be matched to a real species.',
  astronomical: 'Circular diagrams of suns, moons and stars, then the zodiac: rings of small figures around a central sign.',
  biological: 'Small nude figures bathing in pools joined by tubes and channels. The strangest pictures in the book.',
  cosmological: 'The great foldout: nine linked circles on one sheet, the largest drawing in the manuscript.',
  pharmaceutical: 'Jars and containers drawn beside neat rows of roots and leaves, like an apothecary\'s reference.',
  recipes: 'Dense text in short paragraphs, each marked with a little star in the margin.',
};

export function sectionName(id: string): string {
  return sections.find((s) => s.id === id)?.name ?? 'Binding';
}

/** Human page name: "Folio 85v and 86r (foldout)" rather than Yale's catalogue label. */
export function pageTitle(p: VoynichPage): string {
  return /^\[/.test(p.label) ? p.label.replace(/[[\]]/g, '') : `Folio ${p.label}`;
}

export function thumbUrl(base: string, p: VoynichPage): string {
  return `${base}/voynich/pages/${p.slug}.webp`;
}

/** A whole-page image from Yale's IIIF server, sized to `width` pixels. */
export function iiifImage(p: VoynichPage, width: number): string {
  return `${p.service}/full/${Math.min(width, p.width)},/0/default.jpg`;
}

export function pageBySlug(slug: string): VoynichPage | undefined {
  return pages.find((p) => p.slug === slug);
}

export function pagesInSection(id: string): VoynichPage[] {
  return pages.filter((p) => p.section === id);
}

/** Missing folio runs inside a section, e.g. [[59, 64]] for the lost centre of quire 8. */
export function missingRuns(section: VoynichSection): [number, number][] {
  const runs: [number, number][] = [];
  for (const f of missingFolios.filter((m) => m >= section.from && m <= section.to)) {
    const last = runs[runs.length - 1];
    if (last && last[1] === f - 1) last[1] = f;
    else runs.push([f, f]);
  }
  return runs;
}
