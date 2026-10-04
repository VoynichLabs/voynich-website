// Author: Claude Opus 5.5
// Date: 2026-10-04
// PURPOSE: Plays a generated shot (video/public/clips/{slug}/{id}.mp4), muted, filling its box.
//          `at` is where the clip's own t=0 sits relative to the enclosing Sequence (seconds,
//          may be negative), which keeps lip-synced shots locked to the master track.
//          Falls back to the given node when the shot has not been generated yet.
// SRP/DRY check: Pass - the only place generated clips are mounted; availability comes from the ledger.
import { OffthreadVideo, Sequence, staticFile } from 'remotion';
import { FPS, book, clipReady } from '../lib/timing';

export const Clip: React.FC<{
  id: string;
  at?: number;
  fallback?: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ id, at = 0, fallback = null, style }) => {
  if (!clipReady(id)) return <>{fallback}</>;
  const video = (
    <OffthreadVideo
      src={staticFile(`clips/${book.slug}/${id}.mp4`)}
      muted
      style={{ width: '100%', height: '100%', objectFit: 'cover', ...style }}
    />
  );
  if (at === 0) return video;
  return (
    <Sequence from={Math.round(at * FPS)} layout="none">
      {video}
    </Sequence>
  );
};
