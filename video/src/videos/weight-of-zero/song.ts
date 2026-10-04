// Author: Claude Opus 5.5
// Date: 2026-10-04
// PURPOSE: Weight of Zero's song data, bound once with makeSong(). Static imports because Remotion bundles them.
// SRP/DRY check: Pass - the only place Weight of Zero's JSON is imported.
import scenes from '../../../data/weight-of-zero/scenes.json';
import words from '../../../data/weight-of-zero/timing/words.json';
import beats from '../../../data/weight-of-zero/timing/beats.json';
import shots from '../../../data/weight-of-zero/shots.json';
import ledger from '../../../data/weight-of-zero/ledger.json';
import { makeSong } from '../../lib/song';

export const song = makeSong({ scenes, words, beats, shots, ledger });
