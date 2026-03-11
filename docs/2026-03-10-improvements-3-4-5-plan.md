# 2026-03-10 — Focused Improvement Plan: Items 3, 4, 5

**Scope:** OG Image Generation · Analytics · Collaboration Intake Form
**Author:** Larry the Laptop Lobster
**Approval needed before implementation**

---

## Item 3 — OG Image Generation (Social Sharing)

### Problem
Blog posts at `/lobster-incubator/[slug]` render with generic OG tags — no `og:image`. When shared on Twitter/Discord/Slack, they show as plain-text link previews with no visual pull.

### Current State
`Base.astro` accepts an `ogImage` prop, but most pages don't pass one. The `[slug].astro` blog template also doesn't set `ogImage`. The schema already supports an optional `image` field in blog posts.

### Solution: Static OG Image Per Post at Build Time

**Approach:** Use Astro's `@vercel/og` integration (or `satori` + `sharp`) to generate a 1200×630px branded PNG for each blog post at build time.

**What each OG image includes:**
- VoynichLabs dark background (matches site aesthetic — `#0d0f14`)
- Post title (large, bold, JetBrains Mono font)
- Post date + tags
- Small lobster emoji / VoynichLabs logo in corner
- Subtle DAG edge SVG watermark

**Implementation Steps:**

1. **Add `@astrojs/og` or use `satori` directly** (both are pure Node, no headless browser)
   ```bash
   npm install satori @resvg/resvg-js
   ```

2. **Create `/src/pages/og/[slug].png.ts`** — endpoint that generates a PNG for each post slug at build time via `getStaticPaths()`

3. **Update `[slug].astro`** to pass `ogImage={`/og/${post.data.slug ?? post.slug}.png`}` to `<Base>`

4. **Update `Base.astro`** — ensure `og:image` and `twitter:image` are absolute URLs (prepend `Astro.site`)

5. **Set `twitterCard="summary_large_image"`** on blog post pages

**Files changed:**
- `package.json` (add `satori`, `@resvg/resvg-js`)
- `src/pages/og/[slug].png.ts` (new — OG image generator endpoint)
- `src/pages/lobster-incubator/[slug].astro` (pass `ogImage` to Base)
- `src/layouts/Base.astro` (ensure absolute OG URL, set large card)

**Estimated effort:** 1.5 hours

---

## Item 4 — Analytics (Plausible)

### Problem
No visibility into what content people actually read, where they come from, or which pages convert (collaboration inquiries, GitHub clicks, etc.). Flying blind on content strategy.

### Solution: Plausible Analytics (Privacy-Respecting)

**Why Plausible:**
- No cookies, no GDPR consent banner needed
- Lightweight script (~1KB vs GA's 40KB)
- Open source, self-hostable (or use plausible.io free trial → paid if worth it)
- Provides: page views, referrers, bounce rate, top pages, time on page, custom goals

**Alternative:** Self-host `plausible/analytics` on the existing Railway deploy (free, full control). Or use the hosted version ($9/mo).

**Implementation Steps:**

1. **Sign up at plausible.io** (or self-host) — domain: `voynichlabs.org`

2. **Add tracking snippet to `Base.astro`** inside `<head>`:
   ```html
   <script defer data-domain="voynichlabs.org" src="https://plausible.io/js/script.js"></script>
   ```
   - Only 2 lines, zero cookies, zero consent banner

3. **Set up custom goals in Plausible dashboard:**
   - `collaboration-form-submit` — when collaboration inquiry submitted
   - `github-click` — outbound clicks to github.com/neoneye or VoynichLabs
   - `planexe-click` — clicks on PlanExe exec deck
   - `field-note-read` — scroll depth >80% on blog posts

4. **Add goal event triggers** to key CTAs in Astro pages (1 line of JS per goal)

5. **Verify on staging** before pushing to main

**Files changed:**
- `src/layouts/Base.astro` (add Plausible script tag in `<head>`)
- Optional: key CTA pages (add `plausible()` calls for goal tracking)

**Estimated effort:** 30 min (basic) + 1 hour (custom goals)

---

## Item 5 — Collaboration Intake Form

### Problem
`/collaborators` page ends with "just say hi" links to GitHub and markbarney.net. There's no structured intake. Potential collaborators have no clear path. No record of who's interested.

### Solution: Netlify Forms → Discord Webhook Notification

**Approach:** Add a simple HTML form to `/collaborators` that posts to Netlify Forms (free, zero backend needed since we're on static Astro). On submission, Netlify triggers a webhook to a Discord channel.

**Form Fields:**
- Name
- Email
- "What are you working on?" (textarea, 3 rows)
- "What kind of collaboration?" (radio: Research / Bring a Bot / Open Source / Something Else)
- "How did you find us?" (optional text)
- Submit button: "Send it →"

**Implementation Steps:**

1. **Add form to `collaborators.astro`** — replace the current CTA section's "just say hi" links with the form (keep the links too, below the form)
   - Use `netlify` attribute on `<form>` tag (zero backend)
   - Add honeypot field for spam protection

2. **Add `/success` page (or inline success message)** — thank-you state after submission:
   > "Got it. We'll take a look and reach out if it's a good fit. In the meantime, check out [field notes link] or [github link]."

3. **Create Discord webhook** on a private `#collaboration-inbox` channel in Mark's server

4. **Configure Netlify build settings** (if not already on Netlify):
   - If on Railway: swap to Netlify for form support, OR use a lightweight serverless function on Vercel/Cloudflare Workers to relay form → Discord webhook
   - Alternative: Use `formspree.io` (free tier, 50 submissions/mo) — drop-in replacement, email + webhook notification

5. **Test submission flow** end-to-end

**Note on Netlify vs Railway:**
If voynichlabs.org is deployed on Railway, Netlify Forms won't work directly. In that case, use **Formspree** (free, simple HTML form, webhook/email notification) — same experience, no backend.

**Files changed:**
- `src/pages/collaborators.astro` (add form + success state)
- `src/pages/success.astro` (new — thank-you page, optional)
- No backend changes needed (Formspree or Netlify handles it)

**Estimated effort:** 1 hour (Formspree approach, no backend)

---

## Execution Order

| # | Item | Effort | Impact | Do First? |
|---|------|--------|--------|-----------|
| 4 | Plausible analytics | 30 min | High | YES — informs everything else |
| 5 | Collaboration form | 1 hr | High | YES — unblocks real intake |
| 3 | OG image generation | 1.5 hrs | High | YES — after form/analytics |

**Total: ~3 hours.**

Recommend starting with analytics (30 min, zero risk), then collaboration form (1 hr, clear value), then OG images (most complex, biggest visual payoff).

---

## Questions for Mark Before Starting

1. **Hosting:** Is voynichlabs.org on Railway, Netlify, or something else? Determines form backend.
2. **Analytics:** Hosted Plausible ($9/mo) or self-host on Railway (free, more setup)?
3. **Collaboration Discord channel:** Should form submissions go to Mark's server `#collaboration-inbox`, or a different destination?
4. **OG image style:** Approve the design direction (dark bg, JetBrains Mono, DAG watermark, lobster icon) before build?

---

**Analysis Date:** 2026-03-10 ~19:52 EDT
**Analyzer:** Larry the Laptop Lobster
**Repository:** VoynichLabs/voynich-website
