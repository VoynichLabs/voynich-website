# DASH — real per-model tokenizer at /dash

Date: 2026-07-23

## Problem

`/dash` reports `~tokens` as `Math.ceil(chars / 4)` ([src/pages/dash.astro:546](../src/pages/dash.astro)).
The page's own field notes argue that encoding a prompt inflates the token count far
faster than the character count — base64 turning a 4-token phrase into 8–11 tokens.
A chars÷4 estimate is a function of character count alone, so it moves ~33% on a
base64 encode while the true token count roughly triples. The one claim the page
makes is the one thing its meter cannot show.

The standalone `VoynichLabs/dash` Railway build already does this correctly
(`public/app.js:165-206`): lazy `import()` of `@xenova/transformers@2.17.2`,
`AutoTokenizer.from_pretrained(model)`, one colored span per token with its id —
the same technique as the original Deck of Many Prompts (`app.py:200-224`).

The Astro port dropped it, and the page states the reason as "require a server or
large remote assets". That is wrong for the tokenizer: it is pure client-side JS.
The real cost is a one-time CDN fetch plus a per-model vocab download — page weight,
not architecture.

## Plan

1. Port the tokenizer block from the standalone `app.js` into the `/dash` inline script.
   - Pin `@xenova/transformers@2.17.2` (do not drift to v3 / `@huggingface/transformers`).
   - Lazy: only on button click, module promise cached across clicks.
   - Keep the try/catch so a blocked CDN degrades to offline transforms intact.
2. Port the **visualization**, not just the count: one span per token, cycling
   background colors, `title` showing index + token id. This is the "show how things
   are tokenized" half of the request and the part that demonstrates the thesis.
3. Restyle spans with the site's semantic tokens (border/text-primary/text-muted,
   JetBrains Mono) rather than the standalone's paper/ink palette.
4. Model picker: claude, gpt-4o, gpt-4, llama-3.1, mistral-v3, gemma-2 (same six).
5. Keep `~tokens` chars÷4 as the labeled *instant* estimate; real count on click.
6. Correct the four prose claims that go false once this lands:
   - PURPOSE header `:11-14` (tokenizers "intentionally scoped out")
   - estimate note `:87`
   - field notes `:128`
   - "Scoped out" paragraph `:146-152` — restate as page-weight, not server-dependency
7. `CHANGELOG.md` top entry (behavior change).

## Out of scope

- **translate** — genuinely needs a server (MyMemory proxy). Stays dropped.
- **prompt library** (templates + wordlists) — separate call, not requested.
- **Railway teardown** — see below.

## Railway

Cannot currently verify the standalone deploy is even live: `railway` CLI returns
`Unauthorized`, and the live URL the CHANGELOG promised ("recorded in the repo
description / deploy report") exists in neither — `VoynichLabs/dash` has an empty
`homepageUrl` and no deploy report was ever written.

Retiring the service is irreversible and outward-facing. It needs `railway login`,
confirmation of what is actually running, and an explicit yes. Held as a discrete
follow-up step, not bundled into this change.

## Verification

Build alone proves nothing here — the complaint is about numeric accuracy, and the
model files fetch from `huggingface.co`, a second origin beyond jsDelivr. Acceptance
test is in-browser: load `/dash`, tokenize the default sample, confirm a real count
renders, the spans show the split, and the real count diverges from chars÷4. Then
base64-encode and confirm the divergence widens.
