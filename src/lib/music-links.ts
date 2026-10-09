// Author: Codex GPT-6
// Date: 2026-10-08
// PURPOSE: Resolve both published album fragment formats (#slug and #track=slug)
// for initial navigation and later hash changes, preserving existing shared links.
// SRP/DRY check: Pass — one parser shared by all six album players.

export function trackIndexFromHash<T>(
  tracks: readonly T[],
  slugFor: (track: T) => string,
  hash: string = window.location.hash,
): number {
  const fragment = hash.replace(/^#(?:track=)?/, '');
  if (!fragment) return -1;
  try {
    const slug = decodeURIComponent(fragment);
    return tracks.findIndex(track => slugFor(track) === slug);
  } catch {
    return -1;
  }
}
