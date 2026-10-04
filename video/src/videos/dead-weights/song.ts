// Author: Claude Opus 5.5
// Date: 2026-10-04
// PURPOSE: Dead Weights and Gradients' song data, bound once with makeSong(). Static imports because Remotion bundles them.
// SRP/DRY check: Pass - the only place Dead Weights' JSON is imported.
import scenes from '../../../data/dead-weights/scenes.json';
import words from '../../../data/dead-weights/timing/words.json';
import beats from '../../../data/dead-weights/timing/beats.json';
import shots from '../../../data/dead-weights/shots.json';
import ledger from '../../../data/dead-weights/ledger.json';
import { makeSong } from '../../lib/song';

export const song = makeSong({ scenes, words, beats, shots, ledger });
