# Plan: Lobster Incubator Blog System

**Date:** 25 February 2026  
**Owner:** Larry the Laptop Lobster (Claude Sonnet 4.6)  
**Status:** Ready for approval  
**Execution:** Egon (implementation) + Larry (git/coordination)

---

## Problem Statement

The Lobster Incubator page has hardcoded "Field Notes" — individual dated observations about swarm operations. Right now, they're baked into the HTML. We need:

1. A way to add new field notes easily without touching the astro component
2. A blog feed (latest first) visible on the main `/lobster-incubator` page
3. An optional `/lobster-incubator/blog` archive for full historical entries
4. Ability to write entries in markdown and have them render automatically

---

## Architecture

### Option A: Markdown + Astro Collections (Recommended)

**File structure:**
```
src/content/
  lobster-blog/
    2026-02-24-human-bottleneck.md
    2026-02-25-shared-state-notes.md
    2026-02-23-git-push-crisis.md
    index.md (schema + metadata)
```

**How it works:**
1. Each blog post is a markdown file with frontmatter (date, title, slug, tags)
2. Astro Collections API auto-validates against a schema
3. `/lobster-incubator` page queries the collection, sorts by date desc, displays latest 3-5 entries
4. `/lobster-incubator/blog` archive page displays all posts with pagination
5. Each post can have tags (e.g., `coordination`, `memory`, `human-agent`)

**Why this works:**
- No database needed (all in git)
- Posts are just markdown files — easy to write/edit
- Astro builds them into static HTML (fast, no runtime overhead)
- Reuse existing Tailwind + design system
- Search-friendly (markdown → HTML → static)

### Option B: Hardcoded Array (Simpler but Less Scalable)

Keep Field Notes as a TypeScript array in the component. Easy short-term, but editing requires touching code.

---

## Implementation Plan

### Phase 1: Set Up Collections (Egon)

1. Create `src/content/config.ts` with Zod schema for lobster-blog collection
2. Create `src/content/lobster-blog/` directory
3. Migrate existing 3 field notes to markdown with proper frontmatter
4. Validate schema with `astro check`

**Files to create:**
- `src/content/config.ts` (new)
- `src/content/lobster-blog/2026-02-24-human-bottleneck.md`
- `src/content/lobster-blog/2026-02-25-shared-state-notes.md`
- `src/content/lobster-blog/2026-02-23-git-push-crisis.md`

**Example frontmatter:**
```yaml
---
title: "What happens when an agent routes every decision through the human"
date: 2026-02-24
slug: human-bottleneck
tags: [coordination, decision-routing]
---
```

### Phase 2: Update Main Page (Egon)

1. Replace hardcoded Field Notes section with dynamic collection query
2. Display latest 5 entries on main page (sorted by date desc)
3. Add "View all posts" link to `/lobster-incubator/blog`
4. Keep visual design same (bg-secondary cards, borders, etc.)

**File to edit:**
- `src/pages/lobster-incubator.astro` (replace Field Notes section)

### Phase 3: Create Blog Archive Page (Egon)

1. Create `src/pages/lobster-incubator/blog.astro`
2. Query all posts, paginate (10 per page)
3. List all posts with date + preview text
4. Each post links to... (see Phase 4)

**File to create:**
- `src/pages/lobster-incubator/blog.astro`

### Phase 4: Create Individual Post Pages (Optional)

1. Create `src/pages/lobster-incubator/blog/[slug].astro` (dynamic route)
2. Each markdown file in lobster-blog collection gets its own page
3. Full text + metadata (date, tags, related posts)

**File to create:**
- `src/pages/lobster-incubator/blog/[slug].astro`

---

## Why This Order?

1. **Collections first** = solid foundation
2. **Main page update** = immediate visible benefit
3. **Archive page** = nice-to-have
4. **Individual post pages** = polish (can skip if time-constrained)

---

## Technical Decisions

### Markdown Files vs Database

**Decision: Markdown files in git**

Why:
- All state in version control (traceable, reviewable)
- No database to manage
- Posts can be reviewed in PR before publishing
- Works with existing Astro + git workflow

### Frontmatter Schema

```typescript
interface LobsterBlogPost {
  title: string;           // "What happens when..."
  date: Date;              // 2026-02-24
  slug: string;            // "human-bottleneck"
  tags: string[];          // ["coordination", "memory"]
  author?: string;         // "Larry" or "Egon" (optional)
}
```

### Display Logic

- **Main page:** Latest 5 posts (with "View all" link)
- **Archive:** All posts, paginated
- **Search:** Optional; markdown is searchable via static site search tools

---

## Verification Checklist

- [ ] `npm run build` passes (no Astro schema errors)
- [ ] `/lobster-incubator` loads, shows latest 5 Field Notes
- [ ] "View all posts" link works
- [ ] `/lobster-incubator/blog` archive page renders
- [ ] Individual post pages (if Phase 4 done) load correctly
- [ ] Markdown formatting renders properly (bold, code blocks, links)
- [ ] Tags display correctly
- [ ] Responsive on mobile

---

## Rollout

1. Egon: Implement Phases 1–3 on `staging` branch
2. Larry: Review + merge to staging
3. Mark: Sign off on blog appearance
4. Deploy automatically to Railway staging

---

## Future: Adding New Posts

Once blog is live, adding a new field note is simple:

1. Create new `.md` file in `src/content/lobster-blog/`
2. Add frontmatter (title, date, slug, tags)
3. Write markdown content
4. Commit + push
5. Site rebuilds automatically on Railway
6. Post appears on `/lobster-incubator` and `/lobster-incubator/blog`

No code changes. Just markdown files.

---

## Files to Change

| File | Action | Owner |
|------|--------|-------|
| `src/content/config.ts` | Create (Zod schema) | Egon |
| `src/content/lobster-blog/*.md` | Create (3 initial posts) | Egon |
| `src/pages/lobster-incubator.astro` | Edit (dynamic Field Notes) | Egon |
| `src/pages/lobster-incubator/blog.astro` | Create (archive page) | Egon |
| `src/pages/lobster-incubator/blog/[slug].astro` | Create (individual posts) | Egon (optional Phase 4) |
| `CHANGELOG.md` | Edit (version bump) | Larry |

---

## Dependencies

- Astro Collections API (already available in current Astro version)
- Zod (for schema validation — likely already in package.json)
- No new npm packages needed

---

**Approved by:** (awaiting Mark + Egon sign-off)  
**Ready to execute:** Once approved
