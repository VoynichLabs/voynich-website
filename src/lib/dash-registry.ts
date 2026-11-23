// Author: Claude Opus 5.5
// Date: 23-Nov-2026
// PURPOSE: The one list of every DASH transform, in display order, plus the search helper the
//          pages use to filter it. Both front ends (voynichlabs.org/dash in Astro and
//          markbarney.net/dash in React) import ALL_TRANSFORMS and DASH_GROUP_ORDER from here, so
//          adding a transform module means touching only this file and the module itself.
//          Integration: imports the pure transform modules in this folder; no DOM, no network.
//          The module set mirrors the inventory of elder-plinius/P4RS3LT0NGV3 (Parseltongue), but
//          every transform here is written from public standard definitions, not from that
//          AGPL-3.0 code.
// SRP/DRY check: Pass - registry and filtering only; transforms live in their own modules.
//          SHARED FILE: the master copy is VoynichLabs/voynich-website src/lib/; markbarney.net
//          (82deutschmark/MarkSite) keeps an identical copy in client/src/lib/dash/. Edit the master,
//          then copy it across unchanged.

import type { DashTransform } from './dash-glyphs';
import { GLYPH_TRANSFORMS } from './dash-glyphs';
import { BASE_TRANSFORMS, DASH_GROUP_ORDER } from './dash-transforms';
import { ENCODING_TRANSFORMS } from './dash-encodings';
import { CLASSIC_CIPHER_TRANSFORMS } from './dash-ciphers-classic';
import { GRID_CIPHER_TRANSFORMS } from './dash-ciphers-grid';
import { UNICODE_STYLE_TRANSFORMS } from './dash-unicode-styles';
import { ALPHABET_CODE_TRANSFORMS } from './dash-alphabets-codes';
import { WORDPLAY_TRANSFORMS } from './dash-wordplay';
import { QR_TRANSFORMS } from './dash-qr';

export { DASH_GROUP_ORDER };
export type { DashTransform };

/** Every transform, in the order its module lists them; pages group them by DASH_GROUP_ORDER. */
export const ALL_TRANSFORMS: DashTransform[] = [
  ...BASE_TRANSFORMS,
  ...GLYPH_TRANSFORMS,
  ...ENCODING_TRANSFORMS,
  ...CLASSIC_CIPHER_TRANSFORMS,
  ...GRID_CIPHER_TRANSFORMS,
  ...UNICODE_STYLE_TRANSFORMS,
  ...ALPHABET_CODE_TRANSFORMS,
  ...WORDPLAY_TRANSFORMS,
  ...QR_TRANSFORMS,
];

/**
 * True when a transform matches the search box. Every whitespace-separated term must appear in
 * the transform's label, id, group or note (case-insensitive), so "base 3" finds base32/base36
 * and "invisible" finds the stealth tools whose notes mention it.
 */
export function transformMatches(transform: DashTransform, query: string): boolean {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;
  const haystack = `${transform.label} ${transform.id} ${transform.group} ${transform.note ?? ''}`.toLowerCase();
  return terms.every((term) => haystack.includes(term));
}
