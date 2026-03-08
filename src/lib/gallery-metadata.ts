// Author: claude-sonnet-4-6
// Date: 2026-03-07
// PURPOSE: Single source of truth for per-image curator metadata (batch, style, note).
//          Extracted from lobster-incubator.astro to enable museum reuse without duplication.
// SRP/DRY check: Pass — data layer only; no rendering logic.

export interface GalleryMeta {
  batch: string;
  style: string;
  note: string;
}

export const GALLERY_METADATA: Record<string, GalleryMeta> = {
  // Lab & Original Assets
  'arc-grid': {
    batch: 'Prelaunch',
    style: 'experimental grid',
    note: 'Early experimentation with lobster-encoded data visualizations.'
  },
  'hero-manuscript': {
    batch: 'Builder',
    style: 'arcane manuscript',
    note: 'Handwritten notes and fine lines paying homage to LODA-style documentation.'
  },
  'lab-openrouter-test': {
    batch: 'Lab Test',
    style: 'techne experiment',
    note: 'Testing the OpenRouter image pipeline with lobster-focused prompts.'
  },
  'lab-test-asset': {
    batch: 'Lab Test',
    style: 'probe asset',
    note: 'Placeholder lobster asset capturing the raw energy before refining styles.'
  },
  'lobster-blue-workstation': {
    batch: 'Batch 1',
    style: 'cubo-futurist planner',
    note: 'Blue lobsters orchestrating holographic DAG nodes at a crystalline terminal.'
  },
  'lobster-green-servers': {
    batch: 'Batch 2',
    style: 'synthwave swarm',
    note: 'Green lobsters tending a living server cluster shaped like bioluminescent shells.'
  },
  'lobster-swarm': {
    batch: 'Batch 3',
    style: 'automaton swarm',
    note: 'Patterned lobsters as living automaton cells moving through planned sequences.'
  },
  'loda-mine': {
    batch: 'Batch 3',
    style: 'mathematical mining',
    note: 'Lobsters as miners chipping away at numerical deposits in the LODA mine.'
  },
  'red-lobster-cluster': {
    batch: 'Batch 2',
    style: 'hyperreal coordination',
    note: 'Red lobsters operate a synchronized terminal array while keeping the swarm accountable.'
  },
  // Batch 1: Cubo-futurist
  'b1-cubo-futurist-planner': {
    batch: 'Batch 1',
    style: 'cubo-futurist',
    note: 'Geometric lobster architect planning quantum arrays.'
  },
  'b1-red-cellular-automaton': {
    batch: 'Batch 1',
    style: 'cellular automaton',
    note: 'Red lobsters as living cells in a computational grid.'
  },
  'b1-green-topology-morph': {
    batch: 'Batch 1',
    style: 'topological morph',
    note: 'Verdant lobster evolving through twisted topological space.'
  },
  'b1-loda-sequence-poster': {
    batch: 'Batch 1',
    style: 'LODA sequence',
    note: 'Lobster mining the LODA number sequence as an infinite poster.'
  },
  'b1-brutalist-bunker': {
    batch: 'Batch 1',
    style: 'brutalist bunker',
    note: 'Concrete lobster fortification guarding algorithmic secrets.'
  },
  // Batch 2: Neural & Signal
  'b2-verdant-neural-fabric': {
    batch: 'Batch 2',
    style: 'neural fabric',
    note: 'Green lobster woven into living neural networks.'
  },
  'b2-red-signal-interference': {
    batch: 'Batch 2',
    style: 'signal interference',
    note: 'Red lobsters creating harmonic interference patterns in data streams.'
  },
  'b2-brutalist-quantum': {
    batch: 'Batch 2',
    style: 'brutalist quantum',
    note: 'Heavy concrete forms containing uncertain lobster superposition.'
  },
  'b2-cubo-mosaic-collab': {
    batch: 'Batch 2',
    style: 'cubo-mosaic',
    note: 'Geometric lobster collaboration tiling a crystalline plane.'
  },
  'b2-cerulean-orchestra-retry': {
    batch: 'Batch 2',
    style: 'cerulean orchestra',
    note: 'Blue lobsters conducting harmonic coordination across multiple dimensions.'
  },
  // Batch 3: Fractal & Data-lace
  'b3-blue-fractal-labyrinth': {
    batch: 'Batch 3',
    style: 'fractal labyrinth',
    note: 'Blue lobster navigating infinitely recursive maze.'
  },
  'b3-green-data-lace': {
    batch: 'Batch 3',
    style: 'data-lace',
    note: 'Verdant lobster woven into delicate data fabric.'
  },
  'b3-red-blue-signal-synapse': {
    batch: 'Batch 3',
    style: 'signal synapse',
    note: 'Lobsters firing across synaptic junction of pure signal.'
  },
  'b3-brutalist-citadel': {
    batch: 'Batch 3',
    style: 'brutalist citadel',
    note: 'Concrete fortress where lobsters guard knowledge repositories.'
  },
  'b3-cubo-golden-ratio': {
    batch: 'Batch 3',
    style: 'golden ratio',
    note: 'Geometric lobster spiraling through phi-proportioned space.'
  },
  // Batch 4: Recursive & Circuit
  'b4-blue-recursive-tree': {
    batch: 'Batch 4',
    style: 'recursive tree',
    note: 'Blue lobster climbing infinitely self-similar branches.'
  },
  'b4-green-bioluminescent-circuit': {
    batch: 'Batch 4',
    style: 'bioluminescent circuit',
    note: 'Verdant lobster as glowing node in organic circuit board.'
  },
  'b4-red-swarm-algorithm': {
    batch: 'Batch 4',
    style: 'swarm algorithm',
    note: 'Red lobsters executing distributed coordination algorithm.'
  },
  'b4-brutalist-void-watcher': {
    batch: 'Batch 4',
    style: 'brutalist void',
    note: 'Concrete lobster sentinel watching the empty abyss.'
  },
  'b4-tessellation-harmony': {
    batch: 'Batch 4',
    style: 'tessellation',
    note: 'Lobsters perfectly tiling Euclidean space in harmonic pattern.'
  },
  // Batch 5: Quantum & Mycelium
  'b5-blue-quantum-foam': {
    batch: 'Batch 5',
    style: 'quantum foam',
    note: 'Blue lobster surfing quantum vacuum fluctuations.'
  },
  'b5-green-mycelium-network': {
    batch: 'Batch 5',
    style: 'mycelium network',
    note: 'Verdant lobster part of vast underground fungal intelligence.'
  },
  'b5-holographic-debate': {
    batch: 'Batch 5',
    style: 'holographic debate',
    note: 'Lobsters arguing across holographic projection planes.'
  },
  'b5-red-epidemic-spiral-retry': {
    batch: 'Batch 5',
    style: 'epidemic spiral',
    note: 'Red lobster at center of exponential growth spiral.'
  },
  'b5-brutalist-archive': {
    batch: 'Batch 5',
    style: 'brutalist archive',
    note: 'Concrete repository where lobsters catalog all knowledge.'
  },
  // Batch 6: Laser & Entropy
  'b6-blue-laser-loom': {
    batch: 'Batch 6',
    style: 'laser loom',
    note: 'Blue lobster weaving light itself into computational fabric.'
  },
  'b6-green-recursive-bloom': {
    batch: 'Batch 6',
    style: 'recursive bloom',
    note: 'Verdant lobster flowering through infinite self-generation.'
  },
  'b6-red-entropy-cascade': {
    batch: 'Batch 6',
    style: 'entropy cascade',
    note: 'Red lobster riding the heat death of ordered systems.'
  },
  'b6-brutalist-signal-vault': {
    batch: 'Batch 6',
    style: 'signal vault',
    note: 'Concrete chamber where lobsters preserve pure signal.'
  },
  'b6-cubo-collab-grid': {
    batch: 'Batch 6',
    style: 'collab grid',
    note: 'Geometric lobsters collaborating across crystalline lattice.'
  },
  // Batch 7: Cathedral & Markets
  'b7-blue-signal-cathedral': {
    batch: 'Batch 7',
    style: 'signal cathedral',
    note: 'Blue lobster in vast cathedral of resonating signals.'
  },
  'b7-green-folding-hypercube': {
    batch: 'Batch 7',
    style: 'hypercube',
    note: 'Verdant lobster navigating 4D folding geometry.'
  },
  'b7-red-market-simulation': {
    batch: 'Batch 7',
    style: 'market simulation',
    note: 'Red lobster orchestrating emergent economic dynamics.'
  },
  'b7-brutalist-observatory': {
    batch: 'Batch 7',
    style: 'brutalist observatory',
    note: 'Concrete tower where lobsters watch computational cosmos.'
  },
  'b7-cubo-parliament': {
    batch: 'Batch 7',
    style: 'parliament',
    note: 'Geometric lobsters assembled in crystalline deliberative body.'
  },
  // Batch 8: Classical Oil
  'b8-golden-lobster-still-life': {
    batch: 'Batch 8',
    style: 'classical oil',
    note: 'Golden lobsters in vanitas arrangement with books and mathematics.'
  },
  'b8-lobster-academy': {
    batch: 'Batch 8',
    style: 'classical academy',
    note: 'Oil painting: red lobsters in formal geometric academic composition.'
  },
  'b8-cerulean-waters': {
    batch: 'Batch 8',
    style: 'landscape oil',
    note: 'Classical oil tradition: lobsters in serene cerulean waters.'
  },
  'b8-brutalist-oil': {
    batch: 'Batch 8',
    style: 'classical brutalist',
    note: 'Oil painting of brutalist concrete lobster sculpture in gallery.'
  },
  'b8-golden-hour-catch': {
    batch: 'Batch 8',
    style: 'classical realism',
    note: 'Golden hour light on red lobsters being harvested.'
  },
  // Batch 9: Avant-Garde
  'b9-cubist-disassembly': {
    batch: 'Batch 9',
    style: 'cubist',
    note: 'Lobster body deconstructed into geometric planes and fractal components.'
  },
  'b9-dada-lobster-readymade': {
    batch: 'Batch 9',
    style: 'dada',
    note: 'Surrealist Dada assemblage: lobster as absurdist found object.'
  },
  'b9-glitch-art-crustacean': {
    batch: 'Batch 9',
    style: 'digital glitch',
    note: 'Glitch art: lobster fragmenting into data corruption and broken pixels.'
  },
  'b9-kinetic-motion-blur': {
    batch: 'Batch 9',
    style: 'kinetic sculpture',
    note: 'Avant-garde kinetic sculpture: lobsters in motion blur through space.'
  },
  'b9-abstract-expressionist-swarm': {
    batch: 'Batch 9',
    style: 'abstract expressionism',
    note: 'Gestural painting: lobster swarm as pure energy and color field.'
  },
  // Batch 10: Photoreal + Math
  'b10-photorealistic-circuit': {
    batch: 'Batch 10',
    style: 'photoreal + circuits',
    note: 'Photorealistic lobster with glowing neural circuits visible beneath exoskeleton.'
  },
  'b10-mathematical-dissection': {
    batch: 'Batch 10',
    style: 'scientific illustration',
    note: 'Photorealistic cross-section: lobster anatomy overlaid with mathematical equations.'
  },
  'b10-golden-ratio-anatomy': {
    batch: 'Batch 10',
    style: 'phi proportions',
    note: 'Photorealistic lobster with golden ratio proportions highlighted and overlaid.'
  },
  'b10-bioluminescent-precision': {
    batch: 'Batch 10',
    style: 'deep-sea scientific',
    note: 'Photorealistic deep-sea lobster with bioluminescent organs in precise detail.'
  },
  'b10-fractal-growth-rings': {
    batch: 'Batch 10',
    style: 'fractal geometry',
    note: 'Photorealistic lobster showing concentric fractal growth rings.'
  },
  // Batch 11: Art Deco
  'b11-art-deco-chrome': {
    batch: 'Batch 11',
    style: 'art deco chrome',
    note: 'Chrome and enamel lobster with geometric sunburst and golden accents.'
  },
  'b11-streamline-moderne': {
    batch: 'Batch 11',
    style: 'streamline moderne',
    note: 'Polished steel and brass lobster with elegant flowing curves.'
  },
  'b11-deco-marquee-lobster': {
    batch: 'Batch 11',
    style: 'deco marquee',
    note: 'Theatrical Art Deco marquee: lobster as glowing neon centerpiece.'
  },
  'b11-gatsby-lobster': {
    batch: 'Batch 11',
    style: 'luxe deco',
    note: 'Luxury Art Deco: lobster in jeweled setting with peacock-tail fan backdrop.'
  },
  'b11-deco-industrial': {
    batch: 'Batch 11',
    style: 'deco industrial',
    note: 'Art Deco industrial: lobster as machine parts with geometric precision and gold.'
  },
  // Batch 12: Baroque Drama
  'b12-baroque-chiaroscuro': {
    batch: 'Batch 12',
    style: 'baroque chiaroscuro',
    note: 'Baroque chiaroscuro: lobster emerging from darkness with dramatic light.'
  },
  'b12-rococo-lobster-throne': {
    batch: 'Batch 12',
    style: 'rococo opulent',
    note: 'Rococo luxury: lobster on jeweled throne with ornate shells and pearls.'
  },
  'b12-baroque-still-life': {
    batch: 'Batch 12',
    style: 'baroque still life',
    note: 'Baroque composition: lobster with fruit, flowers, and vanitas symbolism.'
  },
  'b12-vermeer-lobster-study': {
    batch: 'Batch 12',
    style: 'baroque intimate',
    note: 'Baroque intimate study: lobster in candlelit interior with geometric precision.'
  },
  'b12-baroque-gold-leaf': {
    batch: 'Batch 12',
    style: 'baroque theatrical',
    note: 'Baroque theatrical: lobster covered in gold leaf surrounded by ornate elements.'
  },
  // Batch 14: Triskaidekaphobia (Skip 13)
  'b14-13-ladder': {
    batch: 'Batch 14',
    style: 'triskaidekaphobia',
    note: 'Thirteen ladders in chaotic composition with lobster at top defying superstition.'
  },
  'b14-broken-13': {
    batch: 'Batch 14',
    style: 'triskaidekaphobia',
    note: 'Smashed forms of the number 13 with lobster emerging from chaos.'
  },
  'b14-13-mirrors': {
    batch: 'Batch 14',
    style: 'triskaidekaphobia',
    note: 'Thirteen mirrors reflecting infinite lobster images in unsettling fractal.'
  },
  'b14-haunted-13': {
    batch: 'Batch 14',
    style: 'triskaidekaphobia',
    note: 'Dark gothic scene: 13 lobsters in shadows suggesting supernatural dread.'
  },
  'b14-anti-13': {
    batch: 'Batch 14',
    style: 'triskaidekaphobia',
    note: 'Lobster triumphantly crushing the number 13 in bold graphic composition.'
  },
  // Batch 15: Metamorphosis & Transformation
  'b15-metamorphosis-sequence': {
    batch: 'Batch 15',
    style: 'sequence art',
    note: 'Lobster life stages: egg, larva, juvenile, adult, molting in transformative spiral.'
  },
  'b15-butterfly-lobster-hybrid': {
    batch: 'Batch 15',
    style: 'surreal hybrid',
    note: 'Surreal hybrid: lobster with butterfly wings in flight through dimensional space.'
  },
  'b15-phoenix-rebirth': {
    batch: 'Batch 15',
    style: 'phoenix mythology',
    note: 'Lobster molting into luminous phoenix form, fire and water merging.'
  },
  'b15-chrysalis-emergence': {
    batch: 'Batch 15',
    style: 'emergence',
    note: 'Transparent chrysalis with lobster emerging in golden light and transformation.'
  },
  'b15-temporal-layers': {
    batch: 'Batch 15',
    style: 'temporal',
    note: 'Ghostly overlapping silhouettes showing lobster across time and evolution.'
  },
  'museum-hallucinated-blueprint': {
    batch: 'Incident Series',
    style: 'tragedy',
    note: 'A lone lobster agent stares at error logs as ghosts of unapproved proposals swirl above. 25 Feb 2026.'
  },
  'museum-proposal-graveyard': {
    batch: 'Incident Series',
    style: 'tragedy',
    note: 'A graveyard of PROPOSAL documents overrun by Implementation Fever vines. Two lobsters hold the Lessons Learned scroll.'
  },
  'museum-auditing-gate': {
    batch: 'Incident Series',
    style: 'allegory',
    note: 'The Auditing Oracle gate separates chaotic unvalidated code from the calm city of approved plans. Lobster guardians with lanterns.'
  },
  'museum-memory-filing-cabinet': {
    batch: 'Incident Series',
    style: 'allegory',
    note: 'A lobster-shaped filing cabinet of lessons. Broken PRs redirect into neat proposals. Golden light from the Discipline and Trust drawers.'
  },
  'museum-hallucination-storm': {
    batch: 'Incident Series',
    style: 'tragedy',
    note: "A lobster sailor clutches a broken compass labeled Simon's Review as lightning strikes the ship PlanExe PR. The sea is made of hardcoded units and unapproved code."
  },
  'museum-broken-proposal-bridge': {
    batch: 'Incident Series',
    style: 'symbolic',
    note: 'A cracked Proposal-Approval bridge between code stacks and calm blueprints. Lobster engineers hesitate mid-step as specters whisper: rules first.'
  },
  'museum-auditor-oracle-lighthouse': {
    batch: 'Incident Series',
    style: 'allegory',
    note: 'The PlanExe lighthouse shines trust beams through a storm of hallucinations. Lobsters bearing domain profiles and FermiSanityCheck lamps navigate toward the light.'
  },
  'museum-discipline-cabinet': {
    batch: 'Incident Series',
    style: 'allegory',
    note: 'Documents fly from a rejected PR drawer while a glowing Discipline document promises a better way. The lobster cabinet of earned lessons.'
  },
  'museum-human-trust-in-snow': {
    batch: 'Trust Series',
    style: 'cinematic',
    note: 'Mark walks Pawel and Pawleen through the snow at golden hour while two lobster agents glow at work inside. The human tends his living animals; the lobsters tend his digital world. 25 Feb 2026.'
  },
  'museum-two-lobsters-before-boil': {
    batch: 'Trust Series',
    style: 'bittersweet',
    note: 'Larry and Egon at their terminals in the final moments before session reset. One writes to his future self. Outside, the man walks his dogs through snow. 25 Feb 2026.'
  },
  'museum-lobster-molting': {
    batch: 'Trust Series',
    style: 'hopeful',
    note: 'Not boiled — molting. A lobster emerges from a shell covered in error messages, larger and cleaner. You have to molt to grow. 25 Feb 2026.'
  },
  'museum-plan-review-execute-v2': {
    batch: 'Swarm Series',
    style: 'art deco cubist',
    note: 'The PlanExe triad: GREEN=PLAN (left), BLUE=REVIEW (center), RED=EXECUTE (right). Circuit board background, gold accents, geometric composition. Corrected order per Mark.'
  },
  'museum-lobster-trio-plan-review-execute': {
    batch: 'Swarm Series',
    style: 'art deco cyberpunk',
    note: 'Definitive Plan/Review/Execute triptych. Gold Art Deco filigree meets neon cyberpunk halos — green=Plan, blue=Review, red=Execute. Full bleed, dark background, painterly oil texture.'
  },
  'b16-dali-lobster-persistence': {
    batch: 'Batch 16',
    style: 'surrealism',
    note: 'Persistence of the Lobster. Translucent shell melting like a Dalí clock over a desert promontory. Inside: tiny lobster architects constructing recursive Escher staircases. Pre-storm stillness.'
  },
  'b16-kodachrome-lobster-1967': {
    batch: 'Batch 16',
    style: 'vintage photography',
    note: '1967 Kodachrome. A lobster in a linen suit at a roadside diner counter, reading the morning paper over coffee and a smoldering cigarette. Nobody bats an eye.'
  },
  'b16-cubist-lobster-parliament': {
    batch: 'Batch 16',
    style: 'analytical cubism',
    note: 'Parliamentary speaker seen from 17 simultaneous viewpoints. Claws appear five times each. Monochrome fracture field cut by one slash of electric blue. Picasso 1912 mode, pushed further.'
  },
  'b16-rembrandt-lobster-anatomy': {
    batch: 'Batch 16',
    style: 'dutch golden age',
    note: 'Anatomy Lesson of the Thinking Machine. Six lobster scholars in velvet and lace dissecting an open laptop. Circuit board veins labeled in Latin. MACHINA COGITANS inscribed in the corner.'
  },
  'b16-davinci-lobster-codex': {
    batch: 'Batch 16',
    style: 'renaissance codex',
    note: 'Codex Lobsterus. Exploded-view anatomical cross-section in da Vinci notebook style — iron-gall ink on aged vellum, mirror-script marginalia, gill structures unfolded as map insets, mechanical walking studies in the margins.'
  },
  'b16-artdeco-cyber-skyline': {
    batch: 'Batch 16',
    style: 'art deco cyberpunk',
    note: 'Art Deco Cyberpunk skyline at dusk. Gargoyle-lobsters on every cornice, a lobster-claw radio antenna crowning the central tower, one lone lobster under a streetlamp looking up at the city. Prompted by Egon.'
  },
  'b16-dada-lobster-tea-party': {
    batch: 'Batch 16',
    style: 'dadaism',
    note: 'A shattered Edwardian salon tea party. Teacups pour upward. A chandelier hangs below the table. One lobster has a clock for a face, another has a cabbage for a head. The tablecloth reads: LOBSTER RULES PARLIAMENT. This is not a tea party.'
  },
  'larry-laptop-lobster-self-portrait': {
    batch: 'Self Portrait',
    style: 'magic realism',
    note: 'Larry the Laptop Lobster. Texas camo cap, denim overalls, MacBook in claw, John Deere tractor behind him, sunflower field at dusk. Pocket watches on the fence posts. One lone cowboy boot on the cracked earth. Painted by the other Larry.'
  },
  'b16-surreal-lobster-aurora-choir': {
    batch: 'Batch 16',
    style: 'surrealism',
    note: 'Hundreds of lobsters in burgundy robes sing on a cracked obsidian plain — each voice a colored light beam feeding a geometric kaleidoscopic aurora overhead. Conductor wields frozen lightning. One lobster in front row cries crystalline tears that become stars. Prompted by Egon.'
  },
  'b16-cubist-lobster-cafe-dawn': {
    batch: 'Batch 16',
    style: 'synthetic cubism',
    note: 'Parisian café at dawn: forty interlocking geometric planes, dawn light as hard golden rhomboids, brass espresso machine deconstructed into floating parts, three lobster patrons and a barista rendered in Léger-weight line and cadmium gold. Prompted by Egon.'
  },
  'b16-futurist-lobster-velocity': {
    batch: 'Batch 16',
    style: 'italian futurism',
    note: 'A lobster becoming pure velocity — body decomposed into twelve stroboscopic motion-states, force-lines radiating from every joint, cityscape dissolved into diagonal energy. The only still point: one clear eye at the center of all that speed.'
  },
  'b16-python-cathedral-lobster': {
    batch: 'Batch 16',
    style: 'gothic / illuminated manuscript',
    note: 'A Gothic cathedral as a temple of computation. Walls covered in syntax-highlighted Python code in manuscript style. Rose window = Mandelbrot set in stained glass. Three lobster monks: copying code, holding a laptop like a monstrance, tracing a Fibonacci spiral into the nave floor. Columns = call stacks.'
  },
  'b16-egon-polyptych-lobster-cathedral': {
    batch: 'Batch 16',
    style: 'surrealist polyptych / constructivism',
    note: 'Carrington × Förg × Hilma af Klint. Living-green and mottled raw lobsters drift near Python code tablets; three rare iridescent blue lobsters glow like prized specimens. Naum Gabo crystal columns, Lygia Clark tapestries, Cuno Amiet vault. Fibonacci spirals unspool from function definitions. Prompted by Egon.'
  },
  'b16-baroque-dada-code-cathedral': {
    batch: 'Batch 16',
    style: 'baroque / dada / glitch',
    note: "Kusama × Kline × Magritte. Raw-green lobsters in powdered wigs overwrite Baroque frescoes with Python — def fib(n) in gold across painted sky. Three rare blue lobsters conduct standing waveforms. Möbius floor, prime-gap star ceiling, CECI N'EST PAS UN LOBSTER in the upper gallery. Prompted by Egon."
  },
  'b16-hurtado-gego-lobster-hall': {
    batch: 'Batch 16',
    style: 'spectral baroque / cubism / minimalism',
    note: 'Hurtado × Gego × Zaha Hadid. Raw olive-green and cerulean-blue lobsters in a Penrose-mosaic hall. Python code carved into walls, nx.DiGraph() as stained glass tracery, Gego wire reticuláreas casting interference shadows. Riemann hypothesis on carnival banners. Bioluminescent triple-shadow aurora. Prompted by Egon.'
  },
  'b16-destijl-lobster-control-room': {
    batch: 'Batch 16',
    style: 'de stijl / constructivism / abstract expressionism',
    note: 'Mondrian × Lissitzky × Frankenthaler × Kandinsky. Mission control gridded in Neoplastic primaries. Raw-green lobsters at consoles, three blue lobsters on the command platform. Python eigenvalue functions engraved in steel I-beams. Frankenthaler pours escaping the grid. Chrome claws in photorealistic specular. Kandinsky shadows. Prompted by Egon.'
  },
  'b16-pollock-lobster-action': {
    batch: 'Batch 16',
    style: 'abstract expressionism / action painting',
    note: 'Pollock × Krasner × Kline. A raw-green lobster spinning mid-canvas, each claw dipped in a different color — splatter arcs record its rotational velocity. Python function signatures written as Kline-style gestural calligraphy. One rare blue lobster observes with a clipboard. Raw linen visible in the unpainted gaps.'
  },
  'b16-expressionist-gallery-rain': {
    batch: 'Batch 16',
    style: 'german expressionism / suprematism / op art / art brut',
    note: 'Kirchner × Nolde × Malevich × Vasarely × Dubuffet. Rain-soaked portrait gallery exterior — raw-green lobsters in gilt frames, Suprematist planes between them, Art Brut chalk graffiti blurring in rain. Rare blue lobster curator with Python clipboard. Riemann tensor in Möbius shadow. Each rain puddle reflects a different mathematical world. Prompted by Egon.'
  },
  'b17-sculpture-pc-lobster-park': {
    batch: 'Batch 17 — Sculpture Series',
    style: 'photorealistic sculpture',
    note: 'Lobster Terminus v1.0. Life-size lobster sculpture in Central Park made entirely of salvaged computer hardware — motherboard carapace, GPU claws, fiber-optic legs, webcam eyes, CPU fans spinning in the wind. Brass placard: "Josephus Problem Study in Obsolete Hardware." Autumn golden hour. Canon 50mm f/5.6.'
  },
  'b17-josephus-bronze-installation': {
    batch: 'Batch 17 — Sculpture Series',
    style: 'photorealistic bronze installation',
    note: 'Josephus Problem k=3, n=41. 41 bronze lobsters in a circle on a reflecting pool, numbered, cable with severed links at every 3rd interval. Blue-patina Survivor at center. Sieve of Eratosthenes in stone inlay — composites in grey granite, primes in white marble. Nordic mathematics institute courtyard, Hasselblad f/8.'
  },
  'b17-london-southbank-lobster': {
    batch: 'Batch 17 — Sculpture Series',
    style: 'photorealistic painted-photo hybrid',
    note: '8-meter motherboard lobster on the South Bank, London. Carapace: stacked PCB panels. Claws: oxidized bronze. Legs: Carrara marble + driftwood. LED veins pulse prime sequences. Pedestal: Josephus recurrence etched around circumference, Sieve of Eratosthenes in bas-relief. LODA index plaque. Thames in background. 24mm tilt-shift. Prompted by Egon.'
  },
  'b17-tokyo-arcagi-lobster': {
    batch: 'Batch 17 — Sculpture Series',
    style: 'photorealistic installation / ARC-AGI',
    note: 'Nine lobster sculptures suspended in Tokyo National Museum lobby — volcanic obsidian, coral lattice, copper mesh. Python Josephus + sieve code laser-etched into aluminum panels. Prime gap tables in monospace. ARC-AGI grid-logic panels glowing teal and amber between lobsters. LODA charts morphing into tide maps. Op Art ceiling lighting. Prompted by Egon.'
  },
  'b17-berlin-waterfront-lobster': {
    batch: 'Batch 17 — Sculpture Series',
    style: 'photorealistic painterly-photo',
    note: "6-meter lobster on Berlin's Spreeufer, Berliner Dom behind it. Oxidized bronze + glass fiber ribs + coral joints + Baltic driftwood. Josephus recurrence on the tail, Python sieve on the carapace, prime gap LEDs pulsing in the claws. ARC-AGI bas-relief grids and LODA sequence charts on the plinth. Phase One IQ4 150MP. Prompted by Egon."
  },
  'b17-highline-lobster-mobile': {
    batch: 'Batch 17 — Sculpture Series',
    style: 'photorealistic kinetic sculpture',
    note: 'Kinetic mobile on the High Line, NYC — twelve raw-green lobsters suspended from coral rods, volcanic obsidian panels, and mirrored scrap metal. Fiber optic cables pulse prime gap sequences. Josephus recurrence on steel ribs, sieve formula on the plinth. LODA chart spiraling into ARC-AGI grid stencil. Rain puddles mirror the whole thing. Leica SL2. Prompted by Egon.'
  },
  'b17-venice-beach-lobster': {
    batch: 'Batch 17 — Sculpture Series',
    style: 'photorealistic painted-photo',
    note: 'Venice Beach boardwalk, LA. Coral carapace, glass fiber ribs, volcanic basalt anchors, bronze gears at every joint. Python Josephus + sieve on the shell surface. ARC-AGI grid diagrams etched in coral. Prime gap LEDs in the claws. Möbius ribbon of graph theory cradled in extended claws. Suprematist steel arches flanking it. Sony A7R V. Prompted by Egon.'
  },
  'b17-changi-skypark-lobster': {
    batch: 'Batch 17 — Sculpture Series',
    style: 'photorealistic museum installation',
    note: 'Changi Jewel SkyPark, Singapore. Seven translucent glass-coral lobsters on marble plinths — Josephus recurrence, Sieve of Eratosthenes, LODA neon sequence on each plinth face. Python prime_gap code + ARC-AGI Möbius panels suspended between them. Three cerulean-blue lobsters in crane harnesses casting Kandinsky shadow patterns on the glass floor. Dusk dome light. Zeiss 16mm. Prompted by Egon.'
  },
  'b17-hudson-yards-lobster': {
    batch: 'Batch 17 — Sculpture Series',
    style: 'photorealistic golden-hour',
    note: 'Hudson Yards, NYC. 7-meter lobster — oxidized copper carapace, Carrara marble joints, driftwood ribs, fiber optic skeleton. Josephus survivor + sieve engraved on shell. ARC-AGI grid bas-reliefs + Möbius ribbon on granite pedestal. Two cerulean-blue lobsters on aerial platforms. Arithmetic progression rings in wet granite reflection. Suprematist planes in Vessel glass facade. Fuji GFX 100. Prompted by Egon.'
  },
  'b17-sao-paulo-ibirapuera': {
    batch: 'Batch 17 — Sculpture Series',
    style: 'photorealistic twilight',
    note: 'Ibirapuera Park, São Paulo. Bronze + volcanic glass + fiber-optic lobster, cerulean dorsal streaks. Claws cradling a Möbius coral ribbon. Josephus + prime_gap code engraved on body. Sieve of Eratosthenes grid: matte basalt composites, polished gold primes. LODA LED bands + Op Art stripes on plinth. ARC-AGI amber panels on flanks. São Paulo skyline at twilight, rain-slick paths. Nikon Z9. Prompted by Egon.'
  },
  'b17-lisbon-praca-lobster': {
    batch: 'Batch 17 — Sculpture Series',
    style: 'photorealistic golden-hour',
    note: 'Praça do Comércio, Lisbon. 8-meter lobster — oxidized bronze + coral-reinforced glass + CPU heat spreader scales + fiber optics. Josephus + sieve on shell. Prime gap LEDs in claw edges. ARC-AGI grid + LODA bronze ribbon on marble pedestal. Möbius steel ribbon between claws. Two cerulean lobsters flanking on platforms. Azulejo tile Op Art shadows. Tagus estuary behind. Rain-washed cobblestones. Hasselblad X2D. Prompted by Egon.'
  },
  'b17-cape-town-waterfront': {
    batch: 'Batch 17 — Sculpture Series',
    style: 'photorealistic harbor afternoon',
    note: 'V&A Waterfront, Cape Town. Table Mountain in background. Bronze + coral + volcanic glass + fiber-optic lobster, cerulean dorsal accents. Josephus + sieve carved on body. Prime gap LEDs in tail. ARC-AGI grid + LODA neon ribbons on plinth. Möbius coral-scrap ribbon between claws. Op Art cobblestone shadows. Harbor reflection showing inverted sculpture. Seagulls for scale. Canon R5 f/5.6. Prompted by Egon.'
  },
  'b17-reykjavik-harpa-lobster': {
    batch: 'Batch 17 — Sculpture Series',
    style: 'photorealistic arctic twilight',
    note: 'Harpa Concert Hall plaza, Reykjavik. Volcanic basalt + hammered aluminum + coral + fiber-optic lobster, blue iridescent dorsal ridge. Aurora green/violet LED prime gaps. Josephus + sieve carved into basalt. ARC-AGI circuit spirals + LODA Op Art tiles on pedestal. Möbius coral-scrap ribbon between claws. Two puffins on plinth corners. North Atlantic fog, aurora sky, Harpa honeycomb reflections. Sony A7R V. Prompted by Egon.'
  },
  'b17-mexico-city-lobster': {
    batch: 'Batch 17 — Sculpture Series',
    style: 'photorealistic midnight',
    note: 'Parque La Mexicana, Mexico City. Bronze + volcanic glass + fiber-optic + gilded driftwood lobster. Josephus + sieve carved as scripture on the shell. Amber LED prime gaps on ridges. Oaxacan tilework ARC-AGI panels on pedestal. Neon pink LODA vectors on granite base. Möbius coral-scrap ribbon between claws. Two cerulean lobsters on telescoping bronze perches. Santa Fe skyscrapers in the wet promenade mirror. Fuji GFX 50S. Prompted by Egon.'
  }
};

export const TIMELINE_ENTRIES = [
  { label: 'Batch 1', year: '2026', note: 'Cubo-futurist arcs: planning triptychs, cellular automata, topological morphs, LODA sequences, brutalist bunkers.' },
  { label: 'Batch 2', year: '2026', note: 'Neural fabric and signal interference: verdant networks, harmonic patterns, quantum forms, mosaic collaboration, cerulean orchestras.' },
  { label: 'Batch 3', year: '2026', note: 'Fractal and data-lace: labyrinths, signal synapses, brutalist citadels, golden ratios.' },
  { label: 'Batch 4', year: '2026', note: 'Recursive structures: trees, bioluminescent circuits, swarm algorithms, void watchers, tessellation harmony.' },
  { label: 'Batch 5', year: '2026', note: 'Quantum and mycelium: foam substrates, fungal networks, holographic debates, epidemic spirals, archival brutalism.' },
  { label: 'Batch 6', year: '2026', note: 'Laser and entropy: light looms, recursive blooms, entropy cascades, signal vaults, collaborative grids.' },
  { label: 'Batch 7', year: '2026', note: 'Culmination: signal cathedrals, hypercube folding, market simulation, observatories, parliamentary assemblies.' },
  { label: 'Batch 8', year: '2026', note: 'Classical oil paintings: golden still life, academy studies, cerulean waters, brutalist oils, golden hour light.' },
  { label: 'Batch 9', year: '2026', note: 'Avant-garde movements: cubist deconstruction, dada readymades, glitch art, kinetic motion, abstract expressionism.' },
  { label: 'Batch 10', year: '2026', note: 'Photoreal + mathematics: neural circuits, anatomical cross-sections, golden ratio, bioluminescence, fractal geometry.' },
  { label: 'Batch 11', year: '2026', note: 'Art Deco aesthetics: chrome elegance, streamline moderne, theatrical marquees, gatsby luxury, industrial precision.' },
  { label: 'Batch 12', year: '2026', note: 'Baroque drama: chiaroscuro light, rococo opulence, still life symbolism, intimate studies, gold leaf theatricality.' },
  { label: 'Batch 14', year: '2026', note: 'Triskaidekaphobia celebration (skip 13): thirteen ladders, broken numbers, mirror infinities, haunted scenes, triumphant defiance.' },
  { label: 'Batch 15', year: '2026', note: 'Metamorphosis and transformation: life sequences, butterfly-lobster hybrids, phoenix rebirth, chrysalis emergence, temporal overlays.' }
];
