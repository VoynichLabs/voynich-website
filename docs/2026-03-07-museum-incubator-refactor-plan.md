# Museum / Incubator Separation + Presentation Link + Thumbnail Fix
**Date:** 2026-03-07
**Status:** APPROVED, NOT YET IMPLEMENTED
**Branch:** staging

---

## What This Fixes

1. **Presentation buried** — The PlanExe exec deck (`/public/presentations/planexe-exec-2026-02-28.html`) has no link anywhere. The `/planexe` page exists but doesn't reference it.
2. **Incubator is 963 lines because it embeds the entire gallery** — Lines 25–697 are a hardcoded metadata object for 160+ images, and lines 859–907 render a full duplicate gallery + timeline. All of this duplicates the museum.
3. **Museum thumbnails crop images** — Wings nav cards and the curated grid use `object-cover` which clips the artwork. Should use `object-contain` so images scale to fit without cropping.
4. **Curator metadata is siloed** — The rich batch/style/note data per image lives only in the incubator. It should be shared and shown on the museum page too.

---

## Nothing Was Completed

The plan was approved and implementation was about to begin (files were read for line verification) but was stopped. **No files were changed.**

---

## Implementation Steps

### Step 1 — Create `src/lib/gallery-metadata.ts` (new file)

Move the `galleryMetadata` object (lines 25–660 of `lobster-incubator.astro`) into this file as an exported typed constant:

```ts
// Author: ...
// Date: ...
// PURPOSE: Single source of truth for per-image curator metadata (batch, style, note).
// SRP/DRY check: Pass — data extracted from incubator to enable museum reuse.

export interface GalleryMeta {
  batch: string;
  style: string;
  note: string;
}

export const GALLERY_METADATA: Record<string, GalleryMeta> = {
  'arc-grid': { batch: 'Prelaunch', style: 'experimental grid', note: '...' },
  // ... all ~160 entries from lines 25–660 of lobster-incubator.astro
};

export const TIMELINE_ENTRIES = [
  { label: 'Batch 1', year: '2026', note: 'Cubo-futurist arcs...' },
  // ... all 14 entries from lines 682–697 of lobster-incubator.astro
];
```

---

### Step 2 — Enrich `src/lib/lobster-museum.ts`

- Add optional fields to `MuseumEntry`:
  ```ts
  batch?: string;
  style?: string;
  note?: string;
  ```
- Import `GALLERY_METADATA` from `gallery-metadata.ts`
- In `getMuseumEntries()`, look up each filename stem (no extension) in `GALLERY_METADATA` and attach `batch`, `style`, `note` to the entry

---

### Step 3 — Fix thumbnail rendering in `src/pages/lobster-art-museum.astro`

Two locations need changing (`object-cover` → `object-contain`):

| Line | Location | Change |
|------|----------|--------|
| 228 | Wings nav card `<img>` | `object-cover` → `object-contain` |
| 270 | Curated/featured grid `<img>` | `object-cover` → `object-contain`, add `bg-bg-primary` |
| 99 | Hero background `<img>` | **Leave as `object-cover`** — intentional fullbleed |
| 311 | Archive gallery `<img>` | Already `object-contain` — no change |

Also fix `src/pages/lobster-art-museum/great-mistakes.astro` — check for any `object-cover` on thumbnails and swap to `object-contain`.

---

### Step 4 — Add timeline + curator notes to museum page

In `src/pages/lobster-art-museum.astro`:

- Import `TIMELINE_ENTRIES` from `gallery-metadata.ts`
- Add a "Chronicle" section **between** the Wings nav section and the Curated Selection section. Use the same visual pattern as the incubator:
  ```html
  <section class="mb-12 border border-border rounded-2xl bg-bg-secondary p-6 sm:p-8">
    <p class="font-mono text-xs text-edge-green uppercase tracking-[0.25em] mb-1">Chronicle</p>
    <h2 class="text-2xl font-bold text-text-primary mb-4">Museum Timeline</h2>
    <div class="space-y-4 text-sm text-text-muted">
      {TIMELINE_ENTRIES.map((entry) => (...))}
    </div>
  </section>
  ```
- In the archive gallery figcaptions (line ~318), add `entry.note` below the series label when present

---

### Step 5 — Strip gallery and timeline from `src/pages/lobster-incubator.astro`

- **Remove imports** on lines 4–6: `fs`, `path`, `fileURLToPath`
- **Remove data block** lines 14–697: `imageFiles`, `galleryImages`, `galleryMetadata`, `galleryEntries`, `timelineEntries`
- **Replace Section 06** (lines 859–886, the full gallery render) with a compact cross-link card:
  ```html
  <section class="mb-16 border-t border-border pt-12">
    <h2 class="text-xl font-semibold text-text-primary mb-6">
      <span class="text-rust-orange">06</span> Lobster Museum
    </h2>
    <a href="/lobster-art-museum" class="block bg-bg-secondary border border-border rounded-lg p-6 hover:border-edge-green transition-colors group">
      <p class="text-sm text-text-muted mb-2">All generated artwork lives in the dedicated museum.</p>
      <span class="text-sm font-semibold text-node-blue group-hover:text-edge-green transition-colors">Visit the Lobster Art Museum →</span>
    </a>
  </section>
  ```
- **Remove Section 07** (lines 888–907, the timeline render) entirely
- **Renumber** remaining sections: 08 → 06 "The Model", 09 → 07 "Open Questions"
- Expected result: file shrinks from ~963 to ~300 lines

---

### Step 6 — Link the exec presentation in `src/pages/planexe.astro`

Add a third button to the hero CTA `flex` row (currently ends around line 51):

```html
<a
  href="/presentations/planexe-exec-2026-02-28.html"
  target="_blank"
  rel="noopener"
  class="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg border border-slate-700 hover:border-purple-500/50 transition-all duration-200"
>
  Q1 Exec Deck →
</a>
```

---

### Step 7 — Update CHANGELOG.md

Add an entry at the top for this refactor. Describe:
- Museum/incubator separation
- Thumbnail fix (object-contain)
- Timeline moved to museum
- Exec deck linked from planexe

---

### Step 8 — Verify

```bash
npm run build   # must pass with no import errors
npm run preview # manual checks below
```

Manual checks:
- Museum: wing nav cards show full images (not cropped)
- Museum: curated grid shows full images
- Museum: timeline section appears between Wings and Curated
- Museum: archive figcaptions show curator notes
- Incubator: no gallery grid, shows a cross-link card to museum instead
- Incubator: no timeline section
- PlanExe: "Q1 Exec Deck" button visible in hero, opens presentation in new tab

---

## Files to Touch

| File | Action |
|------|--------|
| `src/lib/gallery-metadata.ts` | CREATE |
| `src/lib/lobster-museum.ts` | EDIT |
| `src/pages/lobster-art-museum.astro` | EDIT |
| `src/pages/lobster-art-museum/great-mistakes.astro` | EDIT |
| `src/pages/lobster-incubator.astro` | EDIT (major reduction) |
| `src/pages/planexe.astro` | EDIT |
| `CHANGELOG.md` | EDIT |

---

## Key Reference: Line Numbers (as of 2026-03-07 on staging)

- `lobster-incubator.astro` — galleryMetadata object: lines 25–660
- `lobster-incubator.astro` — timelineEntries array: lines 682–697
- `lobster-incubator.astro` — Section 06 gallery render: lines 859–886
- `lobster-incubator.astro` — Section 07 timeline render: lines 888–907
- `lobster-art-museum.astro` — wings nav `object-cover`: line 228
- `lobster-art-museum.astro` — curated grid `object-cover`: line 270
- `lobster-art-museum.astro` — hero bg (keep `object-cover`): line 99
- `planexe.astro` — hero CTA button row: lines 37–52
