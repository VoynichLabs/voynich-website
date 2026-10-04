// Author: Claude Opus 5.5
// Date: 2026-10-04
// PURPOSE: One import point for the Dead Weights video: composition, thumbnail and bound song data,
//          for the registry entry in src/songs.ts.
// SRP/DRY check: Pass - re-exports only; nothing defined here.
export { DeadWeights } from './DeadWeights';
export { DeadWeightsThumb } from './Thumbnail';
export { song } from './song';
