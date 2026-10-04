// Author: Claude Opus 5.5
// Date: 2026-10-04
// PURPOSE: Rehype plugin for Markdown content (incubator posts, research papers): points
//          every <img> at its WebP copy via optimized(), and adds lazy loading and async
//          decoding (some posts embed several multi-MB photos). Also demotes Markdown <h1>
//          to <h2>: the page templates already render the title as the one H1.
// SRP/DRY check: Pass — reuses optimized() rather than re-deriving the img-opt naming.
import { optimized } from './optimized-image.ts';

interface HastNode {
  type: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
}

function walk(node: HastNode) {
  if (node.type === 'element' && node.tagName === 'h1') node.tagName = 'h2';
  if (node.type === 'element' && node.tagName === 'img' && node.properties) {
    const src = node.properties.src;
    if (typeof src === 'string') node.properties.src = optimized(src);
    node.properties.loading ??= 'lazy';
    node.properties.decoding ??= 'async';
  }
  node.children?.forEach(walk);
}

export default function rehypeOptimizedImages() {
  return (tree: HastNode) => walk(tree);
}
