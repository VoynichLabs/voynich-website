// Author: openai-codex/gpt-5.3-codex
// Date: 25 February 2026
// PURPOSE: Shared Lobster Art Museum helpers for listing generated artwork, building stable slugs,
//          and producing share-ready metadata used by gallery, permalink pages, and manifest outputs.
// SRP/DRY check: Pass - centralizes filename parsing and museum metadata derivation.
import fs from 'fs';
import path from 'path';

export interface MuseumEntry {
  filename: string;
  slug: string;
  src: string;
  href: string;
  title: string;
  series: string;
  description: string;
  tags: string[];
  featured: boolean;
}

const IMAGE_EXT_RE = /\.(png|jpe?g|webp)$/i;
const GENERATED_DIR = path.join(process.cwd(), 'public', 'generated');

const FEATURED_FILENAMES = new Set([
  'b9-glitch-art-crustacean.png',
  'b9-abstract-expressionist-swarm.png',
  'b9-dada-lobster-readymade.png',
  'b16-baroque-dada-code-cathedral.png',
  'b16-pollock-lobster-action.png',
  'b16-expressionist-gallery-rain.png',
  'museum-hallucination-storm.png',
  'museum-proposal-graveyard.png',
  'museum-planetary-soup.png',
]);

const DEFAULT_TAGS = ['#LobsterArt', '#VoynichLabs', '#GenerativeArt'];

export const slugFromFilename = (filename: string): string =>
  filename
    .replace(IMAGE_EXT_RE, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const titleFromFilename = (filename: string): string =>
  filename
    .replace(IMAGE_EXT_RE, '')
    .split(/[-_ ]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

export const inferSeries = (filename: string): string => {
  if (filename.startsWith('b17-')) return 'Sculpture Series';
  if (filename.startsWith('museum-')) return 'Museum Narrative';
  if (filename.startsWith('b16-')) return 'Avant-Garde Expansion';
  if (filename.startsWith('b15-')) return 'Metamorphosis';
  if (filename.startsWith('b14-')) return 'Triskaidekaphobia';
  if (filename.startsWith('b12-')) return 'Baroque Drama';
  if (filename.startsWith('b11-')) return 'Art Deco';
  if (filename.startsWith('b10-')) return 'Photoreal + Math';
  if (filename.startsWith('b9-')) return 'Avant-Garde';
  if (filename.startsWith('b8-')) return 'Classical Oil';
  if (filename.startsWith('b')) return 'Foundational Batches';
  return 'Archive';
};

export const inferDescription = (filename: string, title: string, series: string): string => {
  if (filename.startsWith('b17-')) {
    return `${title} is part of the global sculpture-tour sequence: photoreal lobster monuments mapped to mathematical motifs across city-scale installations.`;
  }
  if (filename.startsWith('museum-')) {
    return `${title} documents a Lobster Museum incident narrative: process lessons, correction culture, and archive memory made visual.`;
  }
  if (filename.startsWith('b16-')) {
    return `${title} from the ${series} set blends surreal, baroque, and systems-art language into high-strangeness lobster visual research.`;
  }
  if (filename.startsWith('b9-')) {
    return `${title} is a high-variance experimental frame from the ${series} set, focused on abstract motion, glitch texture, and nonliteral composition.`;
  }
  return `${title} is a generated artwork in the Lobster Art Museum archive, cataloged in the ${series} collection.`;
};

const sortEntries = (entries: MuseumEntry[]): MuseumEntry[] =>
  [...entries].sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    return a.filename.localeCompare(b.filename);
  });

export const getMuseumEntries = (): MuseumEntry[] => {
  if (!fs.existsSync(GENERATED_DIR)) return [];

  const files = fs
    .readdirSync(GENERATED_DIR)
    .filter((filename) => IMAGE_EXT_RE.test(filename));

  const entries = files.map((filename) => {
    const title = titleFromFilename(filename);
    const series = inferSeries(filename);

    return {
      filename,
      slug: slugFromFilename(filename),
      src: `/generated/${filename}`,
      href: `/lobster-art-museum/p/${slugFromFilename(filename)}`,
      title,
      series,
      description: inferDescription(filename, title, series),
      tags: DEFAULT_TAGS,
      featured: FEATURED_FILENAMES.has(filename),
    } as MuseumEntry;
  });

  return sortEntries(entries);
};

export const getFeaturedEntries = (entries: MuseumEntry[]): MuseumEntry[] => entries.filter((entry) => entry.featured);

export const getArchiveEntries = (entries: MuseumEntry[]): MuseumEntry[] => entries.filter((entry) => !entry.featured);

export const findMuseumEntryBySlug = (slug: string): MuseumEntry | undefined =>
  getMuseumEntries().find((entry) => entry.slug === slug);

export const buildTweetCopy = (entry: MuseumEntry, absoluteUrl: string): string => {
  const base = `${entry.title} — ${entry.series} from the Lobster Art Museum.`;
  const full = `${base} ${absoluteUrl} ${entry.tags.join(' ')}`;
  if (full.length <= 280) return full;
  return `${full.slice(0, 277)}...`;
};
