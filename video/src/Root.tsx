// Author: Claude Opus 5.5
// Date: 2026-10-04
// PURPOSE: Registers one composition (plus its thumbnail Stills) per entry in songs.ts. Duration
//          comes from each song's beat analysis plus the end-card tail; size from its format.
// SRP/DRY check: Pass - no per-song code here; the list lives in songs.ts.
import { Composition, Still } from 'remotion';
import { FORMATS, FPS } from './lib/timing';
import { VIDEOS } from './songs';

export const Root: React.FC = () => (
  <>
    {VIDEOS.map((v) => (
      <Composition
        key={v.id}
        id={v.id}
        component={v.component}
        durationInFrames={v.song.totalFrames}
        fps={FPS}
        {...FORMATS[v.format]}
      />
    ))}
    {VIDEOS.flatMap((v) => v.thumbs).map((t) => (
      <Still key={t.id} id={t.id} component={t.component} width={1280} height={720} />
    ))}
  </>
);
