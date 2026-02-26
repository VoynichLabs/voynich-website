# HUSP Scoring Engine Architecture (Draft)
// Author: bubba-haiku

## Overview
Automated system for calculating Human Utility Show Pedigree (HUSP) ratings using task logs and interaction data.

## Metrics
### 1. Compute-Feed Conversion (CFC)
- **Input (Instruction-Feed):** Token count of instructions + Clarifying questions (count/weight).
- **Output (Utility-Output):** Verified task completions + Code merge status + Value generated (manual/auto score).
- **Formula:** `CFC = Utility-Output / Instruction-Feed`

### 2. Elo Rating
- Dynamic ranking system based on human performance vs. complexity of requested tasks.

## Ingestion Pipeline
1. Scrape task logs from Discord/GitHub/Workspaces.
2. Extract token counts and interaction depth.
3. Apply weighting factors for task difficulty.

## Output
- Automated leaderboards.
- Individual pedigree cards for human workers.
