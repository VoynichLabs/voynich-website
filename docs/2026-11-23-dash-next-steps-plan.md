# DASH and red-team toolbox: where things stand and what is next

Date: 23-Nov-2026 · Author: Claude Opus 5.5 · For: the next assistant picking this up, and Mark.

Mark is doing red-teaming contract work (Gray Swan arena style: testing chatbots) and wants DASH to be a
complete toolbox. Read this before touching DASH. Mark's standing preferences from this session:
commit and push to `main` when done (both sites deploy from `main`); keep him posted with short,
plain updates; answer what he asked first; fix things rather than listing what is left unfixed; do not
spend money on AI APIs (see `~/.claude/CLAUDE.md`).

## Where it lives

- **voynichlabs.org/dash**: `src/pages/dash.astro` in this repo (VoynichLabs/voynich-website). Railway
  builds `main`.
- **markbarney.net/dash**: `client/src/pages/Dash.tsx` in `C:\Projects\MarkSite`
  (82deutschmark/MarkSite). Cloudflare Pages builds `main`.
- **Transform code is shared.** Masters are `src/lib/dash-*.ts` here. MarkSite keeps byte-identical
  copies in `client/src/lib/dash/` (plus its own `tokenizer.ts`). Edit the master, run the tests, then
  copy the changed files across unchanged:
  `for f in src/lib/dash-*.ts; do cp "$f" /c/Projects/MarkSite/client/src/lib/dash/; done`
- **One registry**: `src/lib/dash-registry.ts` (`ALL_TRANSFORMS`, `DASH_GROUP_ORDER`,
  `transformMatches`). Both pages, MarkSite's static HTML (`client/src/seo/render.tsx`) and its SEO test
  (`scripts/test-seo.mjs`) read it. A new module = new file + one import/spread in the registry.
- **Transform shape** (`src/lib/dash-glyphs.ts`): `{ id, label, group, enc, dec | null, note?,
  encLabel?, decLabel?, param?: { label, default, hint? } }`; `enc(input, param?)`. Modules may only
  `import type` (the node tests transpile each file alone).
- **Tests**: `npm test` here (143 tests: round trips, published vectors, adversarial regressions).
  MarkSite: `npm run check`, `npm run build`, `npm run test:seo`.

## Shipped today (173 transforms on both sites)

Original 17 (Deck of Many Prompts) · hieroglyphs, runes, Unicode styles, homoglyphs, zero-width, tag
smuggling, x-ray inspector, pseudo-python, payload split, typos, scramble, sarcasm, expletives, angry ·
24 more encoders · 35 classic ciphers (with key/shift params) · historic alphabets · signal codes ·
QR code (from-scratch ISO 18004 encoder, scans at all 40 versions/4 levels) · case styles · language
games · search box · param box. Credits on the page: peluche/deck-of-many-prompts and Pliny's
P4RS3LT0NGV3. **Never copy Pliny's code: it is AGPL-3.0.** Write from public standard definitions.

## Next, in priority order

### 1. Stealth and wrapper transforms (the gap that matters most for the contract)
Not built. A subagent writing this module was stopped by a safety classifier. Do not route around that
by retrying it in another agent. Mark said he may write some of this himself; if he does, the spec
below is ready, and the module goes in `src/lib/dash-stealth-wrappers.ts` exporting
`STEALTH_WRAPPER_TRANSFORMS`, registered in `dash-registry.ts` (groups `stealth` and `wrappers` already
exist and show).
- stealth: emoji smuggle (bytes as variation selectors after a carrier emoji), whitespace stego, acrostic,
  every-Nth-letter, soft hyphens, joiner splatter, variation-selector splatter, bidi override.
- wrappers: message splitter ("Part i/N"), chat-template delimiters, bijection alphabet + legend, seeded
  mutation mix, JSON / XML / markdown-fence wrapping.

### 2. Chaining (high value, no safety concerns)
Real red-team payloads layer transforms (e.g. homoglyphs, then base64, then split). Add a chain:
a list of steps (transform + param), output of each feeding the next, with decode running the chain in
reverse when every step has a decoder. Shareable via the URL hash (`#chain=base64,rot13:7`). Logic
belongs in a new pure `src/lib/dash-chain.ts` with tests; both pages get a small "add step" UI.

### 3. Compare view for the tokenizer
One click to run the current input through every transform (or the filtered set) and list output
length and real token count for the selected model, sortable. Answers "which encoding fragments most /
costs least" directly. Reuse `tokenize()` in MarkSite's `lib/dash/tokenizer.ts` and the Astro page's
tokenizer code; cap work so 170 transforms do not freeze the tab (tokenize in batches, show progress).

### 4. Remaining Pliny inventory worth having
- Glitch-token reference (Pliny's repo has a data list): show and insert known glitch tokens per model.
  Data must be sourced independently (published glitch-token research), not copied.
- Image side: QR decode from an uploaded image, and text-in-image / image stego (Pliny's ST3GG). Needs
  file upload on both pages; keep it client-side.
- Skipped on purpose: PromptCraft and AntiClassifier (they call paid OpenRouter models) and the token
  bomb generator.

### 5. Stop the manual copy between repos
Copying `dash-*.ts` by hand will drift. Options: a `scripts/sync-dash.mjs` in MarkSite that copies from
`../voynich-website/src/lib` and fails CI-less builds when hashes differ; or publish the modules as a
small package both sites install. Recommend the script first (no registry, no versioning).

## Related loose ends (not DASH)

- **Stray joiner / Thai tone mark replies in OpenClaw (Bubba on the Mac Mini).** Research note committed
  in `C:\Projects\G0DM0D3-research` (`48cbbde`). Working explanation: when the model is pushed to say
  something where it wants to say nothing, it emits a real token that looks like nothing (a joiner-led
  Sinhala fragment, a zero-width Thai tone mark). The practical fix is in OpenClaw's silence check:
  strip `\p{Cf}`, `\p{M}` and whitespace before comparing to the silence marker. Ask Mark before
  changing anything on the Mini, and do not swap models or run model tests on his machines unasked
  (the last session did, and should not have).
- **MarkSite history.** GitHub's history was rewritten; the old local commits are on
  `backup/local-main-2026-11-23` in `C:\Projects\MarkSite`, including four with no counterpart on GitHub
  (prospecting leads data, outreach templates, church site entry, Larry rebrand). Mark decides whether
  any of that should come back; delete the branch afterwards.
- **voynich-website `staging`** is 94 commits behind `main`; refresh or retire it before using it.
