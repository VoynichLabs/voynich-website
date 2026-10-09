// Author: Codex GPT-6
// Date: 2026-10-09
// PURPOSE: Check music-video discovery against the actual October 9 YouTube Studio
// catalog and prevent unlisted uploads or incorrect cuts from entering public video
// metadata. Exercise XML escaping with the real songs and preserve shared watch URLs.
// SRP/DRY check: Pass — loads production registry and serializers without copies.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import ts from 'typescript';

async function loadHelper(path) {
  const source = await readFile(new URL(path, import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
  });
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
}

const { MUSIC_VIDEOS, CHANNEL_SHORTS, FEATURED_MUSIC_VIDEOS, watchPageVideos } = await loadHelper('../src/data/music-videos.ts');
const { videoSchema, videoSitemap } = await loadHelper('../src/lib/music-video-seo.ts');
const inventory = JSON.parse(await readFile(new URL('../docs/music-videos/seo-2026-10-09/studio-inventory.json', import.meta.url), 'utf8'));
const site = new URL('https://voynichlabs.org');

test('public discovery matches the real Studio catalog, retaining unlisted archives', () => {
  const publicIds = inventory.filter(row => row.text.includes('\nPublic\n')).map(row => row.links[0].split('/')[2]).sort();
  const registryIds = [
    ...MUSIC_VIDEOS.filter(video => video.visibility === 'public').map(video => video.youtubeId),
    ...CHANNEL_SHORTS.filter(video => video.visibility === 'public').map(video => video.id),
  ].sort();
  assert.deepEqual(registryIds, publicIds);
  assert.equal(publicIds.length, 30);
  assert.equal(FEATURED_MUSIC_VIDEOS.find(video => video.slug === 'get-gone'), undefined);
  assert.equal(watchPageVideos('temp-1-3')[0].youtubeId, 'rayNPcfq4Eg');
  assert.equal(watchPageVideos('cve-carnival')[0].youtubeId, 'xXhXptWTUuY');
  assert.ok(watchPageVideos('cve-carnival').some(video => video.youtubeId === 'aBqnLb_rIOU'));
  assert.ok(watchPageVideos('system-prompt').every(video => video.track === 9));
});

test('schema and sitemap preserve verified cuts, dates, durations and real thumbnails', async () => {
  const sitemap = videoSitemap(MUSIC_VIDEOS, site);
  assert.equal((sitemap.match(/<video:video>/g) ?? []).length, 21);
  assert.ok(sitemap.includes('&apos;'));
  for (const video of MUSIC_VIDEOS) {
    if (video.visibility !== 'public') {
      assert.ok(!sitemap.includes(video.youtubeId));
      continue;
    }
    const schema = videoSchema(video, site, video.page ?? `/music/video/${video.slug}`);
    const row = inventory.find(item => item.links[0].includes(`/${video.youtubeId}/`));
    assert.equal(video.runtime, row.text.split('\n')[0]);
    assert.equal(schema.uploadDate, video.uploadDate);
    assert.match(schema.uploadDate, /^2026-10-\d{2}$/);
    assert.match(schema.duration, /^PT\d+M\d+S$/);
    assert.equal(schema.embedUrl, `https://www.youtube-nocookie.com/embed/${video.youtubeId}`);
    assert.equal(schema.contentUrl, undefined);
    assert.equal(schema.interactionStatistic, undefined);
    assert.ok(sitemap.includes(video.youtubeId));
    await access(new URL(`../public${video.poster}`, import.meta.url));
  }
  assert.equal(videoSchema(watchPageVideos('wasted-temperature')[0], site, '/music/video/wasted-temperature').duration, 'PT2M58S');
});
