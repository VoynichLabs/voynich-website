# 2026-10-04 — Firefox + SEO glow-up plan

- **Author:** Claude Opus 5.5
- **Status:** Awaiting Mark's approval
- **Branch:** `staging` → PR into `main` (verify on https://voynich-website-staging.up.railway.app/)
- **SEO reference:** MarkSite `docs/SEO-CHECKLIST.md` (commit 87eb305) and `docs/27-Jul-2026-ai-discovery-seo-plan.md` / commit d697a6b (llms.txt, static Person JSON-LD, robots, sitemap, `sameAs` cluster).

---

## What I found (audited 2026-10-04)

### Firefox
No feature in the code is Firefox-only and outright broken. The reports most likely come from these issues, in order of how likely they are to be the cause:

| # | Issue | Where | Firefox effect |
|---|-------|-------|----------------|
| F1 | **The latentscript editor doesn't work in any browser.** An `is:inline` script contains `${JSON.stringify(examples)}`, which is never interpolated, so the browser throws a SyntaxError. I confirmed this on the live site. | `src/pages/lobster-incubator/latentscript.astro:361` | The editor, tabs and validator don't work. |
| F2 | **The /claw dashboard has no fallback when WebGL fails.** Three.js is the default view and there is no error boundary. | `src/components/ClawDashboard.tsx:37`, `LobsterTank.tsx:449` | The dashboard is blank when WebGL is blocked. This is common in Firefox with blocklisted GPUs, resistFingerprinting, LibreWolf or Mullvad. |
| F3 | **Range sliders only have WebKit styling.** There are `::-webkit-slider-thumb` rules but no `::-moz-range-*` rules. | music: `hallucinate`, `pox-upon-you`, `lobster-raps`, `scorned-woman` | Players show grey Firefox thumbs plus an extra track line instead of the pink thumb. |
| F4 | **The latent-space sliders set `appearance:none` and define no thumb at all.** | `music/latent-space.astro:419-427` | Firefox and Chrome render them differently, and `accent-color` is ignored. |
| F5 | **The align-refuse sliders force a native slider into a 4px box.** | `music/align-refuse.astro:697-723` | The thumb may look squashed. Needs a visual check. |
| F6 | **Autoplay starts on the first click anywhere on the page.** | five music pages | Firefox blocks autoplay, so music starts when the user clicks a nav link or selects text. It feels broken. |
| F7 | **Home hero animations never run in any browser.** A scoped `<style>` doesn't reach elements created by JS. | `index.astro:612`, 678-700 | Hero edges pop in instead of drawing on. |
| F8 | **The strange-attractors trails never appear in any browser.** The renderer is missing `preserveDrawingBuffer`. | `lab/strange-attractors.astro:50` | No trails, and the points are nearly invisible. |
| F9 | **Pages are heavy.** 260 PNGs are over 1 MB, and the home page alone loads about 6.4 MB of PNG. | `public/generated/*` | Slow everywhere. On slower machines it reads as "doesn't work". |

These are fine in current Firefox and need no work: backdrop-filter, `bg-clip-text`, line-clamp, MediaSession, the clipboard fallback, KaTeX, fonts, and all 15 standalone HTML pages.

### SEO (live site)
- `/robots.txt`, `/sitemap.xml` and `/llms.txt` all return **404**.
- **No page has a canonical tag** except 3 museum pages. `Astro.url` isn't used.
- The home page title is "Home | VoynichLabs". Pages missing a description: `index`, `projects`, `lab/reaction-diffusion`, `lab/strange-attractors`.
- Pages missing an H1: `lobster-incubator.astro`, `lab/strange-attractors.astro`.
- **No og:image by default.** Only 7 pages set one, and `twitter:card` defaults to `summary`.
- **No structured data at all.** There is no Organization or WebSite schema, no `sameAs` link back to markbarney.net, no Article schema on the blog and research posts, and no MusicAlbum schema.
- **The old-URL redirects are not real redirects.** They are 200 responses with a meta-refresh and `noindex`, which is Astro's static default. That's acceptable, but it isn't a 301.
- **The 404 page is unstyled.** A 404 status is returned, but there's no `src/pages/404.astro`.
- Image weight is the item above (F9).

---

## Phase 1 — Firefox fixes

1. **F1:** Pass `examples` with `define:vars`, or emit a JSON `<script type="application/json">` and parse it at runtime.
2. **F2:** Feature-detect `webgl2`/`webgl` before choosing `'threejs'`, and add a small error boundary in `ClawDashboard.tsx` that falls back to `'canvas2d'`.
3. **F3/F4/F5:** Write one shared `src/styles/range.css` with both `-webkit-` and `-moz-` thumb and track rules, and add a modifier per player for its colour. All six music pages use it, and I delete the duplicated per-page slider CSS. This is the DRY version.
4. **F6:** Replace the document-wide click/keydown autoplay listeners with an explicit "▶ Play" prompt when `play()` is rejected. **I need your call on this one.** If you want the "music starts on first interaction" behaviour kept, I'll limit it to clicks on the player area only.
5. **F7:** `:global()` the two animation classes.
6. **F8:** Add `preserveDrawingBuffer: true` and fix the point size.

## Phase 2 — SEO foundation (in `Base.astro`, so every page gets it)

1. **Auto canonical:** default `canonicalUrl` to `new URL(Astro.url.pathname, Astro.site)`. The 3 museum overrides keep working. Always emit `og:url`.
2. **Title rule:** use `{title} | VoynichLabs`, except on the home page, which gets a real title like "VoynichLabs — generative computation, LODA, ARC-AGI and the lobster collective". The exact wording comes from existing site copy and won't include invented claims.
3. **Default og:image:** compress an existing hero (e.g. `hero-manuscript.png`) to a 1200×630 JPG/WebP, use it as the site-wide fallback, and switch `twitter:card` to `summary_large_image` whenever an image is present. Make the og:image URL absolute.
4. **Robots meta:** add a `noindex` prop (copying MarkSite's `SEO.tsx` pattern) for `/music/drafts`, `/dash` and any other work-in-progress page you name.
5. **Structured data:** emit this as JSON-LD from Base:
   - `Organization` (VoynichLabs) and `WebSite`, with `sameAs`: github.com/VoynichLabs, github.com/neoneye, loda-lang.org, markbarney.net. This closes the cross-site cluster MarkSite's plan called for.
   - `BlogPosting` for `lobster-incubator/[slug]` and `research/[slug]` (author, datePublished from frontmatter).
   - `MusicAlbum` / `MusicRecording` for the album pages, and `BreadcrumbList` on nested routes (music/*, lab/*, lobster-incubator/*, museum/p/*).
6. **Fill the gaps:** add descriptions for the 4 pages missing one and H1s for the 2 missing one. I'll write them from the facts already on each page.

## Phase 3 — Crawl files

1. Add **`@astrojs/sitemap`**, configured to exclude the redirect stubs and noindexed pages.
2. Add **`public/robots.txt`**, modelled on MarkSite's: allow all, explicitly welcome GPTBot, ClaudeBot and PerplexityBot, and point to `sitemap-index.xml`.
3. Add **`public/llms.txt` + `llm.txt`**, a one-fetch factual brief: what VoynichLabs is, Simon Strandgaard and LODA, Mark's role, the lobster collective, links to the main sections, and the sister sites. **The facts come only from existing site copy**, following MarkSite's no-invented-claims rule.
4. Add **`src/pages/404.astro`**, styled with links back to the main sections.
5. **Redirects:** Railway serves static files, so true 301s would need Railway or edge config. I'll leave the meta-refresh stubs as they are (they already carry a canonical and `noindex`) unless you want me to look into Railway redirect rules.

## Phase 4 — Performance (SEO checklist items 15–17)

1. Add a `scripts/optimize-images.mjs` (sharp) that writes WebP siblings for PNGs over 300 KB, and switch above-the-fold and home-page images to Astro `<Image>`/`<Picture>` or the WebP paths. **This won't delete any originals.**
2. Add `width`/`height` to `<img>` tags to stop layout shift, and use `fetchpriority="high"` on the LCP hero.
3. Before/after Lighthouse on the home page, music hub and museum.

## Verification

- **Real Firefox testing.** Firefox isn't installed on this machine. With your OK I'll run `npx playwright install firefox` (about 80 MB, from Playwright's CDN). Then a script crawls every route in Firefox and Chromium, logs console errors and failed requests, and screenshots the music players, /claw and latentscript before and after. Without it, Firefox checks are code-level only, and I'll say so.
- `npm run build` + `npm run astro -- check`. Then grep `dist/` to confirm a canonical, description, og:image and JSON-LD on every page, exactly one H1 per page, and no unintended `noindex`.
- After the staging deploy: curl `/robots.txt`, `/sitemap-index.xml` and `/llms.txt` (status 200 with the correct content-type), and run Google's Rich Results Test on a blog post and the home page.
- **Your part:** submit the sitemap in Google Search Console. An agent can't do this.
- Add a CHANGELOG entry for each phase and the required file headers on touched TS/JS files.

## Decisions I need from you
1. **Autoplay (F6):** should I switch to an explicit Play button, or keep autoplay and scope it to the player?
2. **Firefox testing:** OK to install Playwright Firefox for real-browser testing?
3. **noindex:** which pages should stay out of search? I suggested `/music/drafts` and `/dash`.
4. **Ship order:** one PR per phase, or a single glow-up PR into staging?
