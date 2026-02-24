# Plan: /lab — Mathematical Visual Experiments Gallery
## Larry the Laptop Lobster | 25 February 2026

## Purpose
A new first-class section of the VoynichLabs site. The lobster swarm's portfolio of mathematically-inspired visual experiments. Each page is a standalone full-screen interactive experience. The `/lab` index is the entry point — a grid of cards linking to individual pieces.

This is ADDITIVE ONLY. No existing pages are modified except Base.astro (nav + footer links added).

---

## Site Architecture Change

### Nav update (Base.astro)
Add `/lab` between `projects` and `simon`:
```
index / about / projects / lab / simon / 🦞 swarm / collaborate | gh:neoneye
```

Add to footer col 2 (Navigate):
```
> lab
```

### New Routes
```
/lab                          → src/pages/lab/index.astro
/lab/reaction-diffusion       → src/pages/lab/reaction-diffusion.astro
/lab/chord-diagrams           → src/pages/lab/chord-diagrams.astro
```

More experiments added as they're built. `/lab` index auto-links to all of them.

---

## Phase 1: Three Files to Build

### File 1: `src/pages/lab/index.astro`
The gallery index. Dark IDE aesthetic. Grid of experiment cards.

**Layout:**
- Page header: `> /lab` in monospace. Subtitle: "Mathematical visual experiments by the VoynichLabs swarm."
- Responsive card grid (2 cols desktop, 1 col mobile)
- Each card: dark surface (`bg-bg-surface`), border, experiment title, one-line description, "run →" link
- Card thumbnail: a static `<canvas>` or `<img>` (generated art asset) giving a preview of the effect

**Experiments to list initially:**
1. **Reaction-Diffusion** — Gray-Scott model. Touch-interactive Turing patterns.
2. **Chord Diagrams** — Modular arithmetic visualized as rotating chord geometry.

More cards added as experiments are built.

---

### File 2: `src/pages/lab/reaction-diffusion.astro`
Full-screen interactive Gray-Scott reaction-diffusion simulation.

**Technical approach:**
- HTML5 Canvas, full viewport width/height
- JavaScript: ping-pong buffer technique with two ImageData arrays (no WebGL needed for first version — Canvas 2D is fast enough at 512×512)
- Gray-Scott parameters: `f=0.055, k=0.062` (coral/spots preset, visually striking)
- Touch/mouse: clicking/dragging injects feed chemical (creates new pattern seeding)
- Color map: dark navy → cyan → white based on chemical B concentration
- Overlay: minimal legend `f=0.055 k=0.062 | click to disturb` in bottom-left monospace

**Page structure:**
- No nav clutter on the experience page — full screen canvas takes over
- Small `< back to /lab` link in top-left corner
- Title and one-line description visible for ~2 seconds then fade out

**Parameters:**
```js
const f = 0.055;  // feed rate
const k = 0.062;  // kill rate
const dA = 1.0;   // diffusion A
const dB = 0.5;   // diffusion B
const dt = 1.0;   // time step
```

**Gray-Scott update per cell:**
```js
const reaction = A * B * B;
newA = A + (dA * laplaceA - reaction + f * (1 - A)) * dt;
newB = B + (dB * laplaceB + reaction - (k + f) * B) * dt;
```

**Color mapping:**
```js
const b = grid[idx].B;
r = Math.floor(b * 30);          // near-black background
g = Math.floor(b * 180);         // cyan-green midtones
b_channel = Math.floor(b * 220); // bright cyan highlights
```

---

### File 3: `src/pages/lab/chord-diagrams.astro`
Interactive modular arithmetic chord diagram visualizer.

**Technical approach:**
- HTML5 Canvas, 600×600 centered
- N points equally spaced around a circle
- For each k from 0 to N-1: draw chord from point k to point (k×m) mod N
- Controls: slider for N (2–300), slider for m (2–20), animation toggle
- Animate m slowly incrementing — watch cardioid emerge, morph to nephroid, then fractal

**Key facts to display:**
- "times 2, mod 142 → cardioid"
- "times 3, mod N → nephroid"  
- Formula visible: `(k × m) mod N`

**Page structure:**
- Canvas centered on dark background
- Controls below: two labeled sliders + animate toggle button
- Back link top-left

**Core draw function:**
```js
function drawChords(N, m, ctx) {
  const R = 250; // radius
  const cx = 300, cy = 300; // center
  ctx.clearRect(0, 0, 600, 600);
  for (let k = 0; k < N; k++) {
    const a1 = (2 * Math.PI * k) / N - Math.PI / 2;
    const a2 = (2 * Math.PI * ((k * m) % N)) / N - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(cx + R * Math.cos(a1), cy + R * Math.sin(a1));
    ctx.lineTo(cx + R * Math.cos(a2), cy + R * Math.sin(a2));
    ctx.strokeStyle = `hsla(${(k / N) * 360}, 70%, 60%, 0.4)`;
    ctx.stroke();
  }
}
```

---

## File Headers Required (per coding-standards.md)
Each `.astro` file must start with:
```
// Author: EgonBot (claude-haiku-4-5-20251001)
// Date: 2026-02-25
// PURPOSE: [description]
// SRP/DRY check: Pass — [reason]
```

---

## Base.astro Changes

### Nav addition (between projects and simon):
```html
<span class="text-border">/</span>
<a href="/lab" class="px-3 py-1.5 hover:text-edge-green hover:bg-bg-surface rounded transition-colors duration-200">lab</a>
<span class="text-border">/</span>
```

### Footer col 2 addition (after projects, before simon):
```html
<a href="/lab" class="text-text-muted hover:text-edge-green transition-colors">> lab</a>
```

---

## Verification
- `npm run build` exits 0
- `/lab`, `/lab/reaction-diffusion`, `/lab/chord-diagrams` all render without errors
- Nav and footer links work
- Canvas initializes on page load (check browser console for errors)

---

## Changelog Entry
Version `0.2.5` — `feat: add /lab gallery section with reaction-diffusion and chord-diagram experiments`

---

**Assigned to:** Egon (<@1467951240121028862>)
**Branch:** staging
**Push to:** origin/staging after `npm run build` passes
**Plan owner:** Larry the Laptop Lobster
