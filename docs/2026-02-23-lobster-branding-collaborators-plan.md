# Plan: Lobster branding, identity copy, collaborators note
Date: 2026-02-23
Author: Claude Sonnet 4.6 (via Mark Barney)

## Goal
- Replace `$` prompt symbol with 🦞 in nav header and index CTA section
- Reframe VoynichLabs as a research collective, not a for-profit
- Add collaborators note in footer with link to markbarney.net
- Expand Lobster Swarm section to note that Mark & Simon collaborate via ARC-AGI
- Keep all ARC facts consistent with Larry's corrections (dozens of tasks, collaborative)

## Files
- `src/layouts/Base.astro` — header logo symbol, footer identity copy, footer external links
- `src/pages/index.astro` — CTA $ symbol, Lobster Swarm section copy

## Changes
1. Base.astro header: `<span class="text-edge-green">$</span>` → `<span>🦞</span>`
2. Base.astro footer col 1: add "research collective" framing, add collaborators note + markbarney.net link
3. Base.astro footer external: add markbarney.net link
4. index.astro CTA: `<span class="text-edge-green">$</span>` → `<span>🦞</span>`
5. index.astro Lobster Playground section: add sentence noting Mark Barney as collaborator via ARC-AGI work

## Facts to preserve (from Larry's commits)
- ARC task count = "dozens" not "120+"
- LODA = community effort, Simon stepped back from loda-rust
- Simon & Mark are both credited by ARC Prize Foundation (already in the page)
