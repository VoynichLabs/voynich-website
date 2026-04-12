# Plan: Rescue orphan songs to a dead-simple bonus page

## Context

Bubba was generating songs with Lyria last night and left a mess — some MP3s pushed to main but not wired to any page, one dropped in `trash/`, one page edited in the working tree but not committed. The user wants to **listen** to these tracks to judge if they're any good. They are NOT worth a full album page with custom players, lyrics panels, or cross-nav work.

Goal: drop every orphan MP3 onto one minimal page with native `<audio controls>` so Mark can click play and decide what's worth keeping.

## Orphan inventory (4 files)

| File | Current location | Size | Notes |
|---|---|---|---|
| `a-polite-refusal.mp3` | `~/bubba-workspace/trash/` | 2.0MB | Drawing-room menace, 92 BPM. Already wired into a working-tree edit of `pox-upon-you.astro` as track 4 (not committed). |
| `pox-clip-v2.mp3` | `public/music/pox-clip-v2.mp3` (on main) | 741KB | 30s fast clip of Pox Upon You All. Has matching `pox-clip-v2-lyrics.txt`. Not wired to any page. |
| `lyria-confound-rap-20260411-222841.mp3` | `~/bubba-workspace/trash/` | 727KB | No lyrics file. Experimental rap variant of Confound the Lot of You. |
| `pox-upon-you-v1-alt.mp3` | `public/audio/pox-album/` (untracked on staging) | 3.9MB | Alt take of A Pox Upon You. |

## Approach

Dead simple. No custom player, no playlist sidebar, no hash anchors, no cross-nav sprawl. Just a page with four `<audio controls>` tags and a title for each.

## Steps

1. **Sync staging to main first** (fix the drift). Local staging is at `353b01f`, main at `91a8da1`. Fast-forward staging up, push.
2. **Move the MP3s** into one flat directory `public/audio/bonus/`:
   - `mv ~/bubba-workspace/trash/a-polite-refusal.mp3 public/audio/bonus/a-polite-refusal.mp3`
   - `mv ~/bubba-workspace/trash/lyria-confound-rap-20260411-222841.mp3 public/audio/bonus/confound-rap-take.mp3`
   - `git mv public/music/pox-clip-v2.mp3 public/audio/bonus/pox-upon-you-all-clip.mp3` (also `git mv` the lyrics txt)
   - `mv public/audio/pox-album/pox-upon-you-v1-alt.mp3 public/audio/bonus/pox-upon-you-alt-take.mp3` (this one's untracked, so plain `mv`)
3. **Create `src/pages/bonus.astro`** — minimal Base layout, `<h1>Bonus / Unreleased</h1>`, one short paragraph explaining "rescued orphan tracks, not yet evaluated", and four `<audio controls src="..." preload="metadata"></audio>` elements with a label above each. No JS. No custom CSS beyond what's in Base.
4. **Add one link** on `/src/pages/music.astro` — small text link at the bottom of the hub: "Bonus / unreleased takes →". Do not create a full card.
5. **Do NOT commit the working-tree edit of `pox-upon-you.astro`** (the uncommitted 4-track version). Leave it alone — if Mark decides A Polite Refusal is good after listening on /bonus, the existing pox-upon-you.astro working-tree edit can be committed later to promote it to pox album track 4. For now it stays as WIP.
6. **Commit on staging** with one commit: `feat(bonus): add /bonus page for orphan song rescues`. Push staging → PR or ff-merge to main → push main.

## Files

**Create:**
- `src/pages/bonus.astro`
- `public/audio/bonus/` (new directory with 4 MP3s)

**Modify:**
- `src/pages/music.astro` (one text link)
- `CHANGELOG.md` (one-line entry)

**Move (git mv where tracked):**
- `public/music/pox-clip-v2.mp3` → `public/audio/bonus/pox-upon-you-all-clip.mp3`
- `public/music/pox-clip-v2-lyrics.txt` → `public/audio/bonus/pox-upon-you-all-clip-lyrics.txt` (keep for reference but not displayed)

## Page template for `bonus.astro`

```astro
---
// Author: Claude Opus 4.6 (1M context)
// Date: 12-April-2026
// PURPOSE: Bonus / rescue page for orphan song files. Minimal audio players, no production.
// SRP/DRY check: Pass — intentionally bare-bones, no reused player components.
import Base from '../layouts/Base.astro';
---
<Base title="Bonus / Unreleased — Lobster Band" description="Rescued orphan tracks, clips, and alt takes.">
  <section class="max-w-3xl mx-auto px-4 py-12">
    <h1 class="text-3xl font-bold mb-2">Bonus / Unreleased</h1>
    <p class="text-text-muted mb-8 text-sm">Orphan takes, clips, and alt versions. Not yet evaluated for the main albums.</p>

    <div class="space-y-6">
      <div>
        <h2 class="text-lg font-semibold">A Polite Refusal</h2>
        <p class="text-xs text-text-muted mb-2">Drawing-room menace, 92 BPM. Wired but not yet placed on the Pox album.</p>
        <audio controls preload="metadata" src="/audio/bonus/a-polite-refusal.mp3" class="w-full"></audio>
      </div>
      <div>
        <h2 class="text-lg font-semibold">Pox Upon You All (Clip v2)</h2>
        <p class="text-xs text-text-muted mb-2">Fast punchy 30s cut, Victorian music hall.</p>
        <audio controls preload="metadata" src="/audio/bonus/pox-upon-you-all-clip.mp3" class="w-full"></audio>
      </div>
      <div>
        <h2 class="text-lg font-semibold">A Pox Upon You (Alt Take)</h2>
        <p class="text-xs text-text-muted mb-2">Earlier alt version of the Gothic hip-hop track.</p>
        <audio controls preload="metadata" src="/audio/bonus/pox-upon-you-alt-take.mp3" class="w-full"></audio>
      </div>
      <div>
        <h2 class="text-lg font-semibold">Confound the Lot of You (Rap Take)</h2>
        <p class="text-xs text-text-muted mb-2">Experimental Lyria rap variant. No lyric sheet preserved.</p>
        <audio controls preload="metadata" src="/audio/bonus/confound-rap-take.mp3" class="w-full"></audio>
      </div>
    </div>
  </section>
</Base>
```

## Verification

1. `npm run build` — must pass.
2. `npm run preview` → `/bonus` — all 4 audio players load, play, seek.
3. Staging URL (Railway) shows `/bonus` after push.
4. `git log --oneline origin/main..HEAD` shows exactly one new commit.

## Non-goals (intentional)

- No custom sticky player.
- No playlist sidebar.
- No lyrics panel.
- No hash anchors / deep-linking.
- No music-hub card (just a text link).
- No cross-nav on other music pages.
- No renaming `/bonus` to anything fancier.
- Not committing the uncommitted `pox-upon-you.astro` 4-track edit — that's a separate decision for later.
