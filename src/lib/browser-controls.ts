// Author: Codex GPT-6
// Date: 2026-10-08
// PURPOSE: Validate required client-side controls against their DOM types so album
// players and tools fail explicitly on missing markup instead of using unsafe casts.
// SRP/DRY check: Pass — shared DOM lookup replaces repeated assertions.

export function requiredElement<T extends HTMLElement>(
  id: string,
  elementType: { new(): T },
): T {
  const element = document.getElementById(id);
  if (!(element instanceof elementType)) {
    throw new Error(`Missing or invalid page control: #${id}`);
  }
  return element;
}
