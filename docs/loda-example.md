# LODA Language — Real Example
## Provided by Simon Strandgaard (neoneye), 2026-02-23

This is a real LODA program for OEIS sequence A001263 (Narayana numbers).
Use this as a concrete code example on the site. Do NOT paraphrase — show the actual program.

Source: https://oeis.org/A001263

### What This Is

The Narayana numbers T(n,k) form the Catalan triangle:
```
1
1 1
1 3 1
1 6 6 1
1 10 20 10 1
```

LODA automatically discovered this program and derived the formula from it.
"Submitted by loader3229" means it was found by LODA's automated miner, not hand-written.

### The LODA Program

```asm
; A001263: Triangle of Narayana numbers T(n,k) = C(n-1,k-1)*C(n,k-1)/k with 1 <= k <= n, read by rows. Also called the Catalan triangle.
; Submitted by loader3229
; 1,1,1,1,3,1,1,6,6,1,1,10,20,10,1,1,15,50,50,15,1,...

; Formula: a(n) = truncate((binomial(...) * binomial(...)) / ...)

#offset 1
mov $1,$0
mul $1,8
nrt $1,2
sub $1,1
div $1,2
mov $2,$1
add $2,1
bin $2,2
sub $0,$2
sub $0,1
mov $2,$1
add $2,1
bin $2,$0
bin $1,$0
add $0,1
mul $1,$2
div $1,$0
mov $0,$1
```

### THE CORE INSIGHT — Simon's Entire Body of Work

**Simon confirmed (2026-02-23):** His Toolbox application was "DAGs of tools that does stuff."

Directed Acyclic Graphs of processing nodes. This is the unifying mental model across EVERYTHING he has built:

| Project | The DAG |
|---|---|
| Toolbox (2003-2007) | Nodes (Stripe, Noise, Bump) → connected → procedural graphics |
| LODA programs | Assembly instructions chained → computes integer sequences |
| ARC-Interactive | Input grid → transformation rules → output grid |
| PlanExe | Task descriptions → dependency graph → execution plan |

The philosophy never changed. Only the domain did. **Compute the output from minimal rules. Don't enumerate. Don't store. Generate.**

This is the sentence that should anchor every Simon page on the website.

### Why This Matters for the Site

- Shows LODA is **assembly-level precision** — not Python scripts, actual low-level register operations
- The formula in the comment was **automatically derived** from the program
- "loader3229" = LODA's automated miner found this, nobody wrote the formula by hand
- The program computes a real mathematical object (Catalan/Narayana triangle) used in combinatorics
- This can be run, verified, exported to PARI/GP for symbolic math analysis
- Simon built the infrastructure that makes this automated discovery possible

### Suggested Use on Site

Feature this code block on the simon-larry.astro LODA section with caption:
> "This program was automatically discovered by LODA — not written by hand. It computes the Narayana triangle, a significant combinatorial sequence. The formula in the comment was derived automatically."

Link: https://oeis.org/A001263
