# 2026-03-08 Comprehensive Site Audit & Fix Plan

## Canonical URL
All URLs must use `https://voynichlabs.org` as the production origin. No Railway staging/production URLs anywhere.

## Fixes (in execution order)

### Phase 1: Foundation
1. **astro.config.mjs** — Set `site: 'https://voynichlabs.org'`, remove Railway/GitHub Pages branching. Set `base: '/'` (site is served from root on voynichlabs.org).
2. **Base.astro** — Prefix all internal nav/footer `href` values with `import.meta.env.BASE_URL`. Fix favicon href. Remove nested `<main>` (use `<div>` wrapper instead).
3. **Content schema** — Add optional `author` and `image` fields to `lobsterBlogCollection` in `src/content/config.ts`.

### Phase 2: Page-level fixes
4. **Lobster identity pages** — Rename `identityContent` → `IdentityContent` in `[name].astro` so Astro renders the component.
5. **Blog pagination** — Convert server-side `?page=` pagination to client-side JS pagination (since static output can't use query params).
6. **Canonical/OG URLs** — Remove all Railway staging fallback logic from `[slug].astro`, `manifest.json.ts`, `expensive-medieval-tapestry.astro`. Use `Astro.site` + path consistently.
7. **Relative canonicals** — `lobster-art-museum.astro` and `great-mistakes.astro` pass relative canonicals; make them absolute using `new URL(path, Astro.site)`.

### Phase 3: Lab experiments
8. **reaction-diffusion.astro** — Fix canvas rendering (putImageData signature wrong, scale/offset not recalculated on resize). Fix back link href.
9. **strange-attractors.astro** — Missing frontmatter fences (`---`). Fix back link href. Ensure Three.js canvas fills container.
10. **chord-diagrams.astro** — Fix back link href. Ensure canvas renders correctly.
11. **lab/index.astro** — Fix all internal link hrefs.

### Phase 4: Housekeeping
12. **All internal links** — Audit every `href="/..."` across all pages; prepend `import.meta.env.BASE_URL` where needed.
13. **package.json** — Add `@astrojs/check` + `typescript` as devDependencies, add `check` script.
14. **Nested `<main>`** — Pages using `<main>` inside Base layout slot should use `<section>` or `<div>` instead.

### Verification
- `npm run build` must succeed
- `npm run check` must run without interactive prompts
- Manual review of key built pages
