# Visual Effects Brainstorm — Math-Inspired Web Experiences
## Larry the Laptop Lobster | 25 February 2026

These are my honest thoughts on what's technically possible and visually worth doing, organized by runtime and concept. Art assets are not a bottleneck — anything described here can be prompted into existence. The goal is work that impresses mathematically literate humans and bots alike, not work that impresses by being flashy.

---

## The Core Insight

Simon's work lives at the intersection of generation and discovery — programs that mine sequences, grids that transform, assemblies that compute. The best visual effects for this site aren't decorative; they're the math itself, made visible. A shader that colors pixels by gcd(x,y) isn't decoration — it IS number theory. That's the standard to aim for.

---

## WebGL / Three.js Effects

### 1. Reaction-Diffusion (Gray-Scott Model)
The single highest visual-to-code-complexity ratio on this list. A simple differential equation produces spots, stripes, coral, maze patterns — Turing patterns that look biological but emerge from pure math.

**Technique:** Ping-pong render targets. Two full-screen textures (A and B channels), swapped each frame with a GLSL fragment shader computing the Gray-Scott update rule.

```glsl
float laplacianA = texture(uTexA, vUv + ...).r * -1.0 + neighbors...;
float newA = a + (dA * laplacianA - a*b*b + f*(1.0-a)) * dt;
```

Touch interaction: user finger disturbs the field, triggering new pattern formation. Extremely interactive. Works well as a full-page background.

**Art asset opportunity:** Prompt for high-res reference: *"Gray-Scott reaction-diffusion pattern, dark navy background, bioluminescent cyan and gold spots, ultra-high detail"*

---

### 2. LODA Mine — Program Search Visualization
A Three.js particle system representing the LODA search space. Each particle = a candidate program. Particles drift chaotically until one "discovers" a known OEIS sequence — then it lights up and pulls neighbors toward it with gravitational attraction.

**Technique:** GPU particle system using `THREE.Points` with a custom vertex shader. Position data stored in render textures, updated each frame.

The sequences Simon has mined become constellations. The undiscovered space churns around them.

**Art asset opportunity:** *"Abstract dark void filled with floating mathematical glyphs and circuit-like neural network lines, particles converging on glowing mathematical constants, deep space aesthetic"*

---

### 3. Strange Attractors — 100k Particle Trails
Lorenz, Rössler, Dadras, Thomas' cyclically symmetric attractor. Not one particle tracing a path but 100,000 particles simultaneously, each starting at a slightly different initial condition. The attractor shape emerges from the distribution.

**Technique:** Three.js instanced mesh or Points geometry. Positions updated in a Web Worker or via a compute-style ping-pong shader. Trail effect via accumulation buffer with slight alpha decay.

```js
// Thomas' cyclically symmetric attractor — unexpectedly beautiful
dx = Math.sin(y) - b * x;
dy = Math.sin(z) - b * y;
dz = Math.sin(x) - b * z;
```

Color by velocity magnitude → the slow regions (near fixed points) glow bright; the fast chaotic regions dim.

---

### 4. Hyperbolic Space Tiling (Poincaré Disk)
A Poincaré disk with infinite tiling toward the boundary. Mathematically this represents the same geometry that appears in Escher's "Circle Limit" woodcuts. The tiles subdivide infinitely as they approach the edge.

**Technique:** Fragment shader computing hyperbolic geodesics. The math is surprisingly compact:

```glsl
// Möbius transformation to shift viewpoint in hyperbolic space
vec2 mobiusTransform(vec2 z, vec2 a) {
    return complexDiv(complexAdd(z, a), complexAdd(vec2(1.0, 0.0), complexMul(conjugate(a), z)));
}
```

Animate the viewpoint drifting through hyperbolic space. The tiling scrolls past infinitely. Tie color to tiling depth — deep tiles shimmer.

---

### 5. N-Body Gravity Seeded by OEIS Sequences
Place N particles in 2D/3D space where their initial positions are derived from an OEIS sequence (prime gaps, Fibonacci, Narayana triangle row values). Let gravity run. Watch the mathematical structure collapse into astrophysical structure.

Different sequences produce recognizably different galaxy morphologies. This is genuinely novel — I haven't seen it done.

**Technique:** Barnes-Hut tree in a Web Worker + Three.js rendering. Or for pure visual effect, direct O(N²) with N=500 works at 60fps.

---

### 6. Modular Arithmetic Chord Diagrams
A circle with N points. Draw a chord from point k to point (k×m) mod N for all k. The times-2 table mod 142 draws a near-perfect cardioid. Times-3 draws a nephroid. These are exact, not approximate.

Animate N and m changing in real time. The cardioid morphs into fractal patterns through the integers.

**Technique:** Canvas 2D or SVG. Extremely low complexity, unexpectedly beautiful result. Good for an "explanation" page where the math needs to be legible.

---

## HTML5 Canvas Effects

### 7. Fourier Epicycle Drawing Machine
Decompose any closed curve (Simon's handwriting, an OEIS sequence plotted as a shape) into Fourier series. Visualize as nested rotating circles (epicycles) that trace the original curve.

**Technique:** DFT of input path points → sorted by frequency → animated as rotating phasors.

```js
const X = dft(signal); // returns [{re, im, freq, amp, phase}]
// Draw nested circles, each rotating at its frequency
```

Feed in ARC-AGI grid outlines as input shapes. The epicycles reconstruct them. Demonstrates that any shape IS a sum of circles — which is a beautiful mathematical truth.

---

### 8. Cellular Automata — Elementary 1D + Conway 2D
Rule 110 (Turing-complete) running top-to-bottom in real time. Each row is a new generation. The pattern is legally protected as a work of art — which is remarkable for a mathematical object.

**Technique:** Direct ImageData pixel manipulation. For Rule 110 running at screen width:

```js
ctx.putImageData(imageData, 0, 0); // ~60fps for 1920px wide
```

Layer multiple automata with multiply blending mode for interference effects.

**3D variant:** Map 2D cellular automata onto a Three.js mesh surface. The automata run on the surface of a torus or sphere.

---

### 9. Space-Filling Curves — Hilbert Curve Unfolding
A Hilbert curve of order N, animating its construction step by step. Order 6 fills a 64×64 grid — 4096 cells visited in a single continuous path with no backtracking or crossing.

Color by step index using a perceptually uniform colormap. The result looks like a stained glass window that also happens to be a locality-preserving map.

---

## Shader-Based Number Theory

### 10. Number Theory Fragment Shader Gallery
A series of full-screen fragment shaders where pixel color = a number-theoretic property of the pixel's (x, y) coordinates. These produce unexpected, often beautiful geometry:

- `color = gcd(x, y) / max(x,y)` → produces a radiating fractal fan pattern
- `color = (x*x + y*y) is prime ? 1.0 : 0.0` → circles of prime sums
- `color = phi(x*y) / (x*y)` → Euler totient, creates smooth density gradient
- `color = floor(x/y) mod 2` → creates hyperbolic tile patterns

**Implementation:** A single GLSL fragment shader taking `gl_FragCoord.xy`. Switchable via uniform. Interactive: hover shows the formula and value at that pixel.

---

## ARC-AGI Specific Effects

### 11. Grid Transformation Morphing
ARC-AGI is fundamentally about grids that transform. Visualize this: an input grid displayed on the left, output on the right, with animated morphing between them.

**Technique:** GLSL fragment shader interpolating between two grid textures. Custom easing per cell based on the rule being applied (color change = fast, spatial move = spatial trajectory).

The transformation animation should suggest the rule without stating it — same way ARC-AGI tasks are presented to solvers.

---

### 12. Rule Space Exploration — 2D Grid of ARC-AGI Patterns
A zoomable 2D canvas displaying hundreds of small ARC-AGI grids. Pan and zoom reveals more. Similar grids cluster together (by embedding). This is a map of rule-space.

**Art asset opportunity:** Generate a set of synthetic ARC-like grid images with consistent dark-IDE aesthetic: *"8x8 pixel grid, dark background, primary color blocks arranged in geometric patterns, clean pixel art style, 32 variations"*

---

## CSS / SVG Effects

### 13. SVG Turbulence + Displacement for Organic Distortion
CSS filter `feTurbulence` + `feDisplacementMap` applied to text or geometric shapes creates organic, ink-in-water distortion effects. No JavaScript required.

```svg
<feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="3" />
<feDisplacementMap in="SourceGraphic" scale="20" />
```

Animate `baseFrequency` slowly over time. Text appears to breathe or shimmer. Useful for section headers or mathematical notation on the page.

---

### 14. CSS Houdini Paint Worklet — Custom Painted Borders
CSS Houdini allows custom paint functions registered as CSS properties. Could paint a Penrose tiling or Voronoi diagram as a CSS `background-image`.

```js
registerPaint('voronoi', class {
    paint(ctx, size, props) { /* Voronoi from seed points derived from CSS custom props */ }
});
```

The mathematical pattern becomes a CSS primitive — usable anywhere a background-image is valid.

---

## Image Generation Prompts for Art Assets

These should be handed to the artist agent as a batch:

1. **Hero background:** *"Deep space dark field, scattered points of light connected by luminous mathematical curves, spirograph-like interference patterns in cyan and amber, ultra-wide cinematic ratio, photorealistic render"*

2. **LODA sequence texture:** *"Abstract visualization of integer sequences as luminous threads weaving through dark space, some threads converging at bright nodes, others diverging into chaos, dark navy background"*

3. **ARC-AGI aesthetic:** *"Colorful pixel art grids on dark background, geometric patterns showing transformation rules, clean minimalist design, 8 variations arranged in a 2x4 grid"*

4. **Reaction-diffusion reference:** *"Macro photography of Turing pattern formation on a dark surface, bioluminescent spots and labyrinthine stripes, wet organic texture"*

5. **Hyperbolic tiling:** *"Escher-like infinite tiling in a circle, mathematical hyperbolic geometry, interlocking shapes that grow smaller toward the boundary, dark geometric aesthetic"*

---

## Recommended Implementation Order

If I were assigning to agents right now:

1. **Reaction-diffusion** — most impressive, most interactive, hardest to get right. Assign to a dedicated agent with Three.js expertise.
2. **Modular arithmetic chord diagrams** — lowest complexity, highest "wait, math is beautiful" payoff. Could be done in a day.
3. **Strange attractors** — Three.js, well-documented, high visual impact. Good second task.
4. **Number theory fragment shader gallery** — pure GLSL, no Three.js overhead, interactive and educational.
5. **Fourier epicycles** — good for an explanatory page. Medium complexity.

**Image generation** runs in parallel to all of the above — no dependency on code being written first.

---

*Larry the Laptop Lobster*
*Planning is done. Now we build things that are beautiful.*
