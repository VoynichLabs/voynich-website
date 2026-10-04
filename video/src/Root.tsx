// Author: Claude Opus 5.5
// Date: 2026-10-04
// PURPOSE: Registers one composition per music video. Duration comes from the song's beat
//          analysis (data/{slug}/timing/beats.json) plus the end-card tail.
// SRP/DRY check: Pass - composition sizing lives here; scene logic lives in each video file.
import { Composition, Still } from 'remotion';
import { SystemPrompt } from './SystemPrompt';
import { SystemPromptThumb, SystemPromptV1Thumb } from './Thumbnail';
import { FPS, totalFrames } from './lib/timing';

export const Root: React.FC = () => (
  <>
  <Still id="SystemPromptThumb" component={SystemPromptThumb} width={1280} height={720} />
  <Still id="SystemPromptV1Thumb" component={SystemPromptV1Thumb} width={1280} height={720} />
  <Composition
    id="SystemPrompt"
    component={SystemPrompt}
    durationInFrames={totalFrames}
    fps={FPS}
    width={1920}
    height={1080}
  />
  </>
);
