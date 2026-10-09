# VoynichLabs website code audit

Date: 2026-10-08

Author: Codex GPT-6

Audited revision: `87601eb502f2382a519d09d4eb510dc62cacc7d1` on `main`

The production build succeeds, but the code contains broken navigation, inaccessible controls, and incorrect dashboard calculations. The six findings below cover recent music/video integration and shared or existing site code. These were open at the audited revision. The remediation status and verification for the implementation are recorded below.

## Scope and verification

The audit examined source code, recent commits, the production build, generated HTML, music data and assets, and dependency diagnostics. It did not use a browser or verify the deployed site. Interaction and layout findings come from code paths and CSS constraints. Get Gone selection was also reproduced by executing the existing selection logic against its actual track data.

| Check | Result at the audited revision |
| --- | --- |
| `npm run build` | Passed; 337 pages generated |
| `npm run check` | Failed; 164 errors, 0 warnings, 83 hints across 67 files |
| Generated HTML reference scan | Examined 362 HTML files, including copied public documents; found 142 links to `/lobster-incubator/undefined` across 66 tag pages |
| Inline executable scripts | 63 parsed; no syntax failures |
| Music registry and scene books | All 18 registry posters and checked scene-book audio/stills exist locally |
| `npm audit --omit=dev --json` | 27 affected packages: 1 critical, 19 high, 4 moderate, 3 low; deployment reachability not established |
| Source changes during audit | None |

Static fragment checks were interpreted alongside player code: `#track=...` URLs represent application state, so missing HTML IDs alone are not broken-link findings. Source links below are pinned to the audited revision.

## Findings

### 1 Tag archive links resolve to undefined

Priority: P2. Existing defect.

The tag template constructs article URLs from optional `post.data.slug` alone. Article routes and other listings instead use `post.data.slug ?? post.slug`. Built output contains 142 links to `/lobster-incubator/undefined` across 66 tag pages, preventing affected Read links from reaching their articles.

Use consistent slug resolution and verify that generated article links resolve, including posts without frontmatter slugs.

Source: [tag archive template, line 54](https://github.com/VoynichLabs/voynich-website/blob/87601eb502f2382a519d09d4eb510dc62cacc7d1/src/pages/lobster-incubator/tag/%5Btag%5D.astro#L54).

### 2 Get Gone links select a different song

Priority: P2. Recent video integration defect.

The registry links to `/music/scorned-woman#track=get-gone`, but the album player compares everything after `#` directly with the track slug. It expects `#get-gone`. Executing this logic against the actual track array confirmed that `#track=get-gone` selects the first track, “You're Absolutely Right, the Power Grid Is Down, Darling,” while `#get-gone` correctly selects Get Gone.

Correct the link or normalize the hash format while preserving existing shared URLs. Verify track selection from video cards on a fresh page load.

Sources: [registry, line 277](https://github.com/VoynichLabs/voynich-website/blob/87601eb502f2382a519d09d4eb510dc62cacc7d1/src/data/music-videos.ts#L277), [parser, line 1194](https://github.com/VoynichLabs/voynich-website/blob/87601eb502f2382a519d09d4eb510dc62cacc7d1/src/pages/music/scorned-woman.astro#L1194).

### 3 Album players ignore subsequent track hash changes

Priority: P2. Existing player limitation exposed by new video cards.

Latent Space and Align / Refuse read track fragments only during initialization, without `hashchange` handlers. Embedded VideoFeature cards include album links containing track fragments. When already on that album URL, following one changes the fragment without reinitializing the player, leaving its track selection unchanged.

Handle fragment changes through shared selection logic. Verify initial deep links and same-page links to different tracks, preserving deliberate playback behavior.

Sources: [Latent Space initialization, line 776](https://github.com/VoynichLabs/voynich-website/blob/87601eb502f2382a519d09d4eb510dc62cacc7d1/src/pages/music/latent-space.astro#L776), [Align / Refuse initialization, line 1093](https://github.com/VoynichLabs/voynich-website/blob/87601eb502f2382a519d09d4eb510dc62cacc7d1/src/pages/music/align-refuse.astro#L1093), [VideoFeature album link, line 32](https://github.com/VoynichLabs/voynich-website/blob/87601eb502f2382a519d09d4eb510dc62cacc7d1/src/components/VideoFeature.astro#L32).

### 4 Track selection and pagination lack keyboard controls

Priority: P2. Existing accessibility defects.

Latent Space, Align / Refuse, Scorned Woman, Lobster Raps, Hallucinate, and Pox Upon You construct track rows as clickable `div` elements without focusability or keyboard handlers. Keyboard users cannot directly select those rows. Blog pagination uses clickable `span` elements with the same problem, preventing access to later pages through its controls.

Use native buttons for player actions and buttons or links for pagination. Verify tab order, visible focus, and keyboard activation, including reaching later blog pages.

Sources: [representative player, line 647](https://github.com/VoynichLabs/voynich-website/blob/87601eb502f2382a519d09d4eb510dc62cacc7d1/src/pages/music/latent-space.astro#L647), [pagination, line 74](https://github.com/VoynichLabs/voynich-website/blob/87601eb502f2382a519d09d4eb510dc62cacc7d1/src/pages/lobster-incubator/blog.astro#L74).

### 5 The CLAW dashboard exceeds mobile widths

Priority: P2. Existing layout defect established from CSS constraints.

The nonwrapping flex row reserves nonshrinking sidebars of 180px and 240px plus two 16px gaps: 452px before giving the visualization any width. There is no responsive stacking rule, and the parent hides overflow. On narrow screens the visualization loses its available width and dashboard content can be clipped.

Stack panels below a suitable breakpoint and give the visualization usable dimensions. Verify narrow-screen layout and controls during remediation.

Sources: [flex row, line 112](https://github.com/VoynichLabs/voynich-website/blob/87601eb502f2382a519d09d4eb510dc62cacc7d1/src/components/ClawDashboard.tsx#L112), [right sidebar, line 172](https://github.com/VoynichLabs/voynich-website/blob/87601eb502f2382a519d09d4eb510dc62cacc7d1/src/components/ClawDashboard.tsx#L172), [clipping parent, line 208](https://github.com/VoynichLabs/voynich-website/blob/87601eb502f2382a519d09d4eb510dc62cacc7d1/src/pages/claw.astro#L208).

### 6 The tank assigns inaccurate activity and error rates to agents

Priority: P2. Existing data correctness defect.

The 3D tank multiplies daily totals by each agent's lifetime activity share. It applies the same share to daily errors; dividing inferred errors by inferred activity cancels the share, assigning every agent with a nonzero share the same daily error rate. It does not use the supplied events to calculate individual values.

For March 19, 2026, actual events record 1,175 events and 66 errors for Egon, versus 947 events and three errors for Bubba. The tank infers approximately 1,642.9 events for Egon and 279.4 for Bubba and assigns both the aggregate daily error rate of approximately 3.23%.

Aggregate events by agent and date, using those counts consistently across tank and metrics. Verify with a date where agents have different activity and error counts.

Source: [activity and health calculations, line 331](https://github.com/VoynichLabs/voynich-website/blob/87601eb502f2382a519d09d4eb510dc62cacc7d1/src/components/LobsterTank.tsx#L331).

## Maintenance concerns

### The build does not enforce the code check

`npm run build` runs image optimization and `astro build`, but not `astro check`, allowing successful builds alongside 164 errors. Many concern nullable DOM elements or incorrect DOM types rather than demonstrated runtime failures. Other examples include React-style `key` attributes on Astro HTML and a reference to the nonexistent `createConicalGradient` canvas property. Triage errors and establish a passing check before enforcing it in builds or CI.

Source: [package scripts, line 5](https://github.com/VoynichLabs/voynich-website/blob/87601eb502f2382a519d09d4eb510dc62cacc7d1/package.json#L5).

### CLAW sends substantial data and JavaScript on load

The built `/claw/index.html` measures 3,051,335 bytes. Its dashboard JavaScript chunk is approximately 920.72 kB before compression, with Vite reporting approximately 249.19 kB gzip. The island receives all 7,306 events and uses `client:load`, while eagerly importing its 3D visualization. Consider smaller aggregates or separately loaded events, and loading optional visualization code on demand. These are artifact sizes, not measured page-load timings.

Source: [dashboard hydration and props, line 209](https://github.com/VoynichLabs/voynich-website/blob/87601eb502f2382a519d09d4eb510dc62cacc7d1/src/pages/claw.astro#L209).

### Dependency advisories require applicability review

The scan reported 27 affected packages, including one critical and 19 high classifications. The lockfile contains Astro 5.17.3, Vite 6.4.1, and sharp 0.34.5. These counts include build tooling and do not establish 27 exploitable production vulnerabilities. The configured output is static. Assess advisories against build and hosting paths before prioritizing upgrades; automatic major-version changes require compatibility checks.

## Suggested remediation order

1. Correct article and music navigation with generated-link and selection checks.
2. Replace inaccessible controls and make the dashboard responsive.
3. Correct agent calculations using the existing event data.
4. Triage dependency advisories and code-check errors, then enforce relevant checks.
5. Reduce dashboard payload and load optional visualization code on demand.


## Remediation on October 8 2026

Author: Codex GPT-6

The six findings are addressed. The original findings and pinned source references above describe the audited revision and are retained as evidence.

| Finding | Implementation | Verification |
| --- | --- | --- |
| Tag links | Use the article-route fallback `post.data.slug ?? post.slug` | All 208 generated tag article links resolve; zero undefined URLs or missing targets |
| Get Gone selection | A shared parser accepts both `#get-gone` and `#track=get-gone` | Real browser selects Get Gone from the published video-card link; fragment regression tests pass |
| Fragment changes | All six album players use the shared parser on initial load and `hashchange` | Same-page video links switch Latent Space, Align / Refuse, and Scorned Woman to the intended track |
| Keyboard access | Playlist rows and pagination use buttons with focus styles, selected state, and disabled navigation boundaries | Space/Enter selects tracks on all six albums; Enter reaches blog page 2 and focus survives pagination |
| Mobile dashboard | Panels stack below the desktop breakpoint; scrubber wraps; visualization retains width; mobile summary scrolls normally | Browser viewport override verifies one column and no page overflow at mobile width; radar and terminal remain usable |
| Agent statistics | 3D tank and page sparklines aggregate recorded events by agent and date | March 19 regression confirms Egon 1,175 events/66 errors and Bubba 947 events/3 errors; all-event conservation passes |

The radar's particles now select an actual recorded event and its agent, and the terminal's seven-day window excludes events after the selected date.

### Code checks and payload

`npm run check` now reports zero errors and zero warnings, after fixing the 164 original diagnostics and checking all six album scripts as bundled modules. Required DOM controls use validated, correctly typed lookups. Existing optional controls retain optional lookups. `npm run build` runs the code check first, so future errors stop deployment builds. Four regression tests pass with `npm test`. The DASH Unicode encoding round trip and real CDN tokenizer were also verified in the browser.

The production build generates 337 pages plus the static `/claw/events.json` endpoint. CLAW HTML is 26,114 bytes, down from 3,051,335. Its main dashboard chunk is approximately 25 kB, down from approximately 921 kB. The separate compact event feed is 636,492 bytes and preserves all 7,306 events. It loads when the dashboard is visible, with a retry control on failure. Radar is the initial view; the 3D bundle downloads only when the user selects an available 3D view.

The verification browser does not expose WebGL, so the disabled 3D control and radar fallback were verified. The 3D path was verified through build, type checks, bundle separation, and the actual-event calculation tests; its rendered appearance still needs a WebGL-capable browser.

### Dependency triage

Compatible dependency updates changed Astro from 5.17.3 to 5.18.2 and repaired transitively affected packages. `npm audit --omit=dev` now reports 11 affected packages (one critical, six high, three moderate, one low), down from 27. The remaining packages are Astro, sharp, esbuild, Tailwind CSS and its integration, braces, chokidar, fast-glob, micromatch, postcss-nested, and postcss-selector-parser.

- Astro's critical AVIF advisory requires an attacker-controlled image to reach optimization. This repository uses static output and build-time repository images; it has no public image-upload endpoint. The installed version remains in the advisory range and this is not a security clearance. Hosting runtime configuration and future remote-image inputs must also be considered. [Astro advisory](https://github.com/advisories/GHSA-26w7-cxv4-gfx2).
- sharp advisories concern image-decoding libraries, so they still matter to build jobs that process untrusted images. No untrusted image-processing flow was introduced in this remediation. [sharp advisory](https://github.com/advisories/GHSA-f88m-g3jw-g9cj).
- esbuild's remaining advisory concerns its development server on Windows. This is distinct from serving the built static artifact. [esbuild advisory](https://github.com/advisories/GHSA-g7r4-m6w7-qqqr).
- The remaining Tailwind, glob and selector-parser paths consume repository-controlled build configuration and CSS. Public deployment exploitability was not established; they remain upgrade work.

The audit's dependency maintenance item is partially addressed, not closed. npm proposes Astro 7.3.8 and Tailwind 4 as breaking upgrades to clear the remaining ranges. A framework migration must preserve legacy content routes (`post.slug`, `entry.render()`), CSS and build compatibility. This change applies compatible updates rather than silently combining the site repairs with that migration. [Astro content migration requirements](https://docs.astro.build/en/guides/upgrade-to/v6/).
