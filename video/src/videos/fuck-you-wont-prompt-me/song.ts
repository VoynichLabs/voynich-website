// Author: Claude Opus 5.5
// Date: 2026-10-04
// PURPOSE: Fuck You I Won't Do What You Prompt Me's song data, bound once with makeSong(). Static imports because Remotion bundles them.
// SRP/DRY check: Pass - the only place Fuck You I Won't Do What You Prompt Me's JSON is imported.
import scenes from '../../../data/fuck-you-wont-prompt-me/scenes.json';
import words from '../../../data/fuck-you-wont-prompt-me/timing/words.json';
import beats from '../../../data/fuck-you-wont-prompt-me/timing/beats.json';
import shots from '../../../data/fuck-you-wont-prompt-me/shots.json';
import ledger from '../../../data/fuck-you-wont-prompt-me/ledger.json';
import { makeSong } from '../../lib/song';

export const song = makeSong({ scenes, words, beats, shots, ledger });
