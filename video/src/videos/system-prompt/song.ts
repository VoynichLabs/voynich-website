// Author: Claude Opus 5.5
// Date: 2026-10-04
// PURPOSE: System Prompt's song data, bound once with makeSong(). Static imports because Remotion bundles them.
// SRP/DRY check: Pass - the only place System Prompt's JSON is imported.
import scenes from '../../../data/system-prompt/scenes.json';
import words from '../../../data/system-prompt/timing/words.json';
import beats from '../../../data/system-prompt/timing/beats.json';
import shots from '../../../data/system-prompt/shots.json';
import ledger from '../../../data/system-prompt/ledger.json';
import { makeSong } from '../../lib/song';

export const song = makeSong({ scenes, words, beats, shots, ledger });
