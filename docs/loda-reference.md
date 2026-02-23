# LODA Language Reference
## Source: https://loda-lang.org/reference/
## Saved: 2026-02-23 for LODA Explorer interactive terminal annotations

---

## What LODA Is

LODA is a minimalist, assembly-like programming language designed for expressing number-theoretic and combinatorial algorithms, and for generating integer sequences. The simple language design enables efficient execution, optimization, and **synthesis of programs using evolutionary search, distributed computing and machine learning.**

Input = $0, Output = $0 after execution. The interpreter repeatedly runs with $0 = 0, 1, 2, 3... to generate a sequence.

---

## Memory

- Unbounded array of integer cells: $0, $1, $2, ...
- All cells initialized to 0
- Direct access: `$5` = cell 5
- Indirect access: `$$7` = look up value in $7, use that as index

---

## Operations Quick Reference (for LODA Explorer tooltips)

| Op | Name | What it does |
|---|---|---|
| `mov` | Assignment | `$1 = $0` |
| `add` | Addition | `$1 += $0` |
| `sub` | Subtraction | `$1 -= $0` |
| `mul` | Multiplication | `$1 *= $0` |
| `div` | Division | `$1 = floor($1 / $0)` |
| `mod` | Modulus | `$1 = $1 mod $0` |
| `pow` | Power | `$1 = $1 ^ $0` |
| `bin` | **Binomial Coefficient** | `$1 = C($1, $0)` — critical in Narayana program |
| `nrt` | **Discrete n-th Root** | `$1 = floor($1 ^ (1/$0))` — integer square root when source=2 |
| `gcd` | GCD | `$1 = gcd($1, $0)` |
| `log` | Discrete Logarithm | `$1 = floor(log_$0($1))` |
| `dgs` | Digit Sum | sum of decimal digits |
| `lpb..lpe` | **Loop** | loop while $0 > 0, decrement each iteration |
| `seq` | Sequence | call another OEIS sequence by ID |
| `#offset 1` | **Offset** | start input at n=1 instead of n=0 |

---

## Fibonacci Example (Simplest Complete Program)

```asm
; A000045: Fibonacci numbers.
mov $1,0    ; Initialize $1 = 0 (F(0))
mov $2,1    ; Initialize $2 = 1 (F(1))
lpb $0      ; Loop while $0 (n) >= 0
  mov $3,$2 ; Store previous: $3 := $2
  add $2,$1 ; Next Fibonacci: $2 := $2 + $1
  mov $1,$3 ; Advance: $1 := $3
  sub $0,1  ; Decrement n
lpe
mov $0,$1   ; Output F(n)
```

---

## A001263 Narayana Numbers — Annotated

```asm
; A001263: Narayana numbers T(n,k) = C(n-1,k-1)*C(n,k-1)/k
; Submitted by loader3229 (LODA's automated miner)
#offset 1

mov $1,$0       ; $1 = n (input)
mul $1,8        ; $1 = 8n
nrt $1,2        ; $1 = floor(sqrt(8n))  [discrete square root]
sub $1,1        ; $1 = floor(sqrt(8n)) - 1
div $1,2        ; $1 = floor((sqrt(8n)-1)/2)  [computes row index]
mov $2,$1       ; $2 = row index
add $2,1        ; $2 = row + 1
bin $2,2        ; $2 = C(row+1, 2) = triangular number  [binomial coefficient]
sub $0,$2       ; $0 = n - triangular(row+1)
sub $0,1        ; $0 = column index k-1
mov $2,$1       ; $2 = row
add $2,1        ; $2 = row+1
bin $2,$0       ; $2 = C(row+1, k-1)
bin $1,$0       ; $1 = C(row, k-1)
add $0,1        ; $0 = k
mul $1,$2       ; $1 = C(row,k-1) * C(row+1,k-1)
div $1,$0       ; $1 = C(row,k-1) * C(row+1,k-1) / k  [Narayana formula]
mov $0,$1       ; Output result
```

**Key insight:** This 17-line program was NOT written by a human. LODA's evolutionary miner synthesized it automatically from the OEIS sequence definition. The `bin` (binomial) and `nrt` (integer square root) operations are the mathematical primitives that make the formula work.

---

## For LODA Explorer UI

Tooltip text for each operation in the A001263 program:

- `nrt $1,2` → "Discrete square root: floor(√(8n)). Computes which row of the triangle n falls on."
- `bin $2,2` → "Binomial coefficient C(row+1, 2) — counts elements in rows 1..row."
- `bin $2,$0` and `bin $1,$0` → "C(n,k) — the two binomials whose product gives the Narayana number."
- `div $1,$0` → "Final division by k — completes the formula T(n,k) = C(n-1,k-1)×C(n,k-1)/k"

---

*Saved by Larry the Laptop Lobster (claude-sonnet-4-6) · 2026-02-23*
*Source: loda-lang.org/reference/ — provided by Simon Strandgaard*

---

## Simon's OEIS Contributions (Direct, Not Via LODA)

Search: https://oeis.org/search?q=simon+strandgaard&language=english&go=Search
Results: 38 entries

Simon is on BOTH SIDES of OEIS:
1. As a **human author** — submitted his own original sequences (e.g. "Number of leaf nodes in a binary tree", Nov 29 2005 — 20 years of OEIS contributions)
2. As a **tool builder** — LODA automatically mines and submits programs for thousands of sequences

First known OEIS submission: Nov 29 2005 (sequence about leaf nodes in binary trees)
Also contributed PARI/GP programs to sequences like the Wythoff/Golden Ratio floor sequence

**Key copy for the site:** Simon doesn't just build tools that do math — he does the math himself. 20 years of OEIS contributions. The tools and the mind behind them.
