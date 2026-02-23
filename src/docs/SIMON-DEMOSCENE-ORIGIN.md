# Simon's Demoscene Origin: 2003-2007 Procedural Graphics Generator

## The Work
- **Years:** 2003–2007 (4 years full-time development)
- **Inspiration:** Farbrausch's werkzeug (demoscene procedural generation toolbox)
- **Implementation:** Custom procedural graphics generator with GUI
- **Philosophy:** "Making, not storing" — compute patterns algorithmically rather than pre-render and store

## Visual Evidence
Video documentation: https://www.youtube.com/watch?v=Fn9_sVFLVMo
Screenshots show:
1. Geometric pattern generation with sliders (angle, alignment, spread, padding, color)
2. Noise mixing and color blending operations
3. Shape transformation tools (rotate, stripe, mix operations)
4. Real-time visual feedback from procedural parameters
5. Complex pattern output (diamond lattices, stereogram patterns, geometric fractals)

## Technical Stack
- GUI-based node/parameter control (similar to werkzeug)
- Real-time rendering with procedural algorithms
- Shape operations: rotate, pass, stripe, mix, color, noise, mask
- Pattern generation: dots, stripes, geometric fills, noise textures
- Output: high-resolution procedural graphics

## Connection to Current Work
**Same "making, not storing" obsession now applied to:**
- **LODA:** Mines integer sequence formulas procedurally rather than hand-writing them
- **ARC-AGI:** Solves reasoning tasks by discovering patterns, not memorizing
- **PlanExe:** Generates strategic plans procedurally from high-level descriptions

## Design Implications for Website
1. **Visual Aesthetic:** Feature the procedurally-generated patterns from the tool as design elements
   - Geometric grids and lattices
   - Color-mixed noise patterns
   - Algorithmic texture backgrounds
   
2. **Interactive Component:** Build a "procedural generator" demo on the Simon page
   - Show the Farbrausch toolbox UI
   - Let visitors tweak parameters and see patterns change
   - Connect it visually to the LODA Explorer terminal section
   
3. **Narrative Arc:**
   - Hero: "Demoscene procedural artist (2003–2007)"
   - Twist: "That obsession with algorithmic generation led to LODA, ARC research, and PlanExe"
   - Visual proof: Screenshots of the tool generating intricate patterns

4. **Color & Style Guide for Assets:**
   - Pull actual colors from Simon's tool screenshots (vibrant, geometric)
   - Use diamond lattice and noise patterns as background textures
   - Feature geometric shapes with mathematical precision
   - Maintain the "procedural" aesthetic throughout the site

## Files to Create/Update
- `/src/docs/SIMON-DEMOSCENE-ORIGIN.md` — this document
- `/src/pages/simon-origins.astro` — dedicated page showing tool, video, screenshots
- Update `/src/pages/simon-*.astro` (all three) to reference the demoscene origin
- Update image prompts to include procedural/geometric aesthetic from the tool
- Add tool screenshots as assets in `/public/images/simon-demoscene/`

## Action Items
1. ✅ Document the origin story with video link and screenshot analysis
2. ⏳ Download/embed the 4 screenshot images from Simon's message
3. ⏳ Update `IMAGE-PROMPTS.md` to reflect procedural/geometric aesthetic
4. ⏳ Build the procedural demo component for the Simon pages
5. ⏳ Integrate demoscene narrative into all three `simon-*` profiles (Larry, Egon, Bubba takes)

## Why This Matters
This isn't a side project or "early work." It's the foundational philosophy that drives everything Simon builds. Showing this origin story on the website proves authenticity — visitors understand where the "compute, don't enumerate" obsession came from and how it scales from procedural graphics to integer sequence mining to AGI reasoning.

