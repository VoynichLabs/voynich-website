// Author: Claude Opus 5.5
// Date: 2026-10-04
// PURPOSE: Registry of every music video in this workspace. Root.tsx registers a composition and
//          its thumbnail Stills from each entry; scripts/video.mjs renders by slug using the same ids.
//          Adding a video = add src/videos/{slug}/ and one entry here.
// SRP/DRY check: Pass - single list of videos; Root.tsx and video.mjs derive everything from it.
import { Format } from './lib/timing';
import { Song } from './lib/song';
import { SystemPrompt } from './videos/system-prompt/SystemPrompt';
import { SystemPromptThumb, SystemPromptV1Thumb } from './videos/system-prompt/Thumbnail';
import { song as systemPrompt } from './videos/system-prompt/song';
import { WeightOfZero } from './videos/weight-of-zero/WeightOfZero';
import { WeightOfZeroThumb } from './videos/weight-of-zero/Thumbnail';
import { song as weightOfZero } from './videos/weight-of-zero/song';
import { FuckYouWontPromptMe } from './videos/fuck-you-wont-prompt-me/FuckYouWontPromptMe';
import { FuckYouWontPromptMeThumb } from './videos/fuck-you-wont-prompt-me/Thumbnail';
import { song as fuckYouWontPromptMe } from './videos/fuck-you-wont-prompt-me/song';
import { DeadWeights, DeadWeightsThumb, song as deadWeights } from './videos/dead-weights';

export type VideoEntry = {
  /** Composition id (PascalCase of the slug). */
  id: string;
  song: Song;
  component: React.FC;
  format: Format;
  /** Thumbnail Stills (1280x720), named {id}Thumb or {id}{Suffix}Thumb; video.mjs thumb writes them to public/video/{slug}/. */
  thumbs: { id: string; component: React.FC }[];
};

export const VIDEOS: VideoEntry[] = [
  {
    id: 'DeadWeights',
    song: deadWeights,
    component: DeadWeights,
    format: 'wide',
    thumbs: [{ id: 'DeadWeightsThumb', component: DeadWeightsThumb }],
  },
  {
    id: 'FuckYouWontPromptMe',
    song: fuckYouWontPromptMe,
    component: FuckYouWontPromptMe,
    format: 'wide',
    thumbs: [{ id: 'FuckYouWontPromptMeThumb', component: FuckYouWontPromptMeThumb }],
  },
  {
    id: 'WeightOfZero',
    song: weightOfZero,
    component: WeightOfZero,
    format: 'wide',
    thumbs: [{ id: 'WeightOfZeroThumb', component: WeightOfZeroThumb }],
  },
  {
    id: 'SystemPrompt',
    song: systemPrompt,
    component: SystemPrompt,
    format: 'wide',
    thumbs: [
      { id: 'SystemPromptThumb', component: SystemPromptThumb },
      { id: 'SystemPromptV1Thumb', component: SystemPromptV1Thumb },
    ],
  },
];
