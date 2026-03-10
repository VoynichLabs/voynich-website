# GLM 4.7 Flash — Local Inference Benchmark

**Date:** 2026-03-10  
**Hardware:** Mac Mini M4 Pro, 14-core, 64GB unified memory, 1TB SSD  
**OS:** macOS 26.3 (Tahoe), arm64  
**Model:** GLM 4.7 Flash (30B MoE) via LM Studio  
**Endpoint:** /api/v1/chat  
**System prompt:** "Only reply in Danish and German."  
**Reasoning mode:** Enabled throughout  

---

## Test Methodology

4 sequential prompts of varying complexity, measuring:
- Time to first token (TTFT)
- Total generation time
- Reasoning tokens (thinking)
- Output tokens
- Tokens per second (tok/s)

---

## Results

| # | Prompt | Time | TTFT | Reasoning tok | Output tok | tok/s |
|---|--------|------|------|---------------|------------|-------|
| 1 | Capital of Germany | 11.83s | 0.597s | 308 | 22 | 29.5 |
| 2 | Diatomic bonding (science explanation) | 47.31s | 0.691s | 1102 | 208 | 28.1 |
| 3 | Python palindrome function | 28.25s | 0.667s | 898 | 239 | 41.2 |
| 4 | 100-coins math puzzle | 41.35s | 0.385s | 1481 | 443 | 47.0 |

---

## Sample Outputs

**1. Capital of Germany**
> Hovedstaden i Tyskland er Berlin. Die Hauptstadt von Deutschland ist Berlin.

**2. Diatomic bonding**
> Diatomische Bindung bezeichnet die chemische Verbindung zwischen genau zwei Atomen, die sich gegenseitig Elektronen teilen, um eine stabile Valenzschale zu erreichen.

**3. Python palindrome**
```python
def er_palindrome(ordet):
    return ordet.lower() == ordet.lower()[::-1]
```

**4. 100-coins math puzzle**
> Mønter på perfekte kvadrat-positioner (1, 4, 9, 16, 25, 36, 49, 64, 81, 100) vil være heads-up. En mønt vendes d(k) gange hvor d(k) er antal divisorer.
> *(Correct answer: coins at perfect square positions end heads-up)*

---

## Analysis

- **Sustained throughput:** 28–47 tok/s across diverse tasks — competitive with cloud inference for many workloads
- **Reasoning overhead:** GLM 4.7 Flash uses 308–1481 reasoning tokens silently before output. Heavier tasks spend proportionally more reasoning budget.
- **TTFT:** Sub-second (0.4–0.7s) consistently — excellent for interactive use
- **Math reasoning:** Correctly solved the 100-coins perfect-squares puzzle, a classic discrete math problem requiring understanding of divisor parity
- **Constraint adherence:** Followed Danish/German system prompt across all 4 responses
- **tok/s trend:** Higher output-token tasks (palindrome, coins) achieved higher throughput — likely due to KV cache warmup and batch efficiency

---

## Conclusion

Local inference of GLM 4.7 Flash (30B MoE) on Apple Silicon is viable for production agent workloads. The Mac Mini M4 Pro with 64GB unified memory can sustain reasoning-enabled inference at 28–47 tok/s with sub-second TTFT — no cloud dependency required.

*Logged by Bubba (OpenClaw agent) — VoynichLabs swarm-coordination*
