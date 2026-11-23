import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import kvIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/kv-incremental-cache";
import d1NextTagCache from "@opennextjs/cloudflare/overrides/tag-cache/d1-next-tag-cache";
import type { IncrementalCache } from "@opennextjs/aws/types/overrides.js";

/**
 * The KV page cache, except for "not found" pages.
 *
 * /[slug] and the catch-all routes answer any address, so every address a
 * vulnerability scanner tries (/.env, /wp-login.php, /jenkins, ...) rendered a
 * 404 that was then written to KV. That filled the free plan's 1000 KV writes
 * a day with pages nobody asks for twice, and real posts could no longer be
 * cached. A 404 is rendered again on each visit instead.
 */
const pageCache: IncrementalCache = {
  // `opennextjs-cloudflare deploy` picks where to put the build's pages by
  // this name, so it must stay the KV cache's.
  name: kvIncrementalCache.name,
  get: kvIncrementalCache.get.bind(kvIncrementalCache),
  async set(key, value, cacheType) {
    if (isNotFound(value)) return;

    await kvIncrementalCache.set(key, value, cacheType);
  },
  delete: kvIncrementalCache.delete.bind(kvIncrementalCache),
};

function isNotFound(value: unknown) {
  return (value as { meta?: { status?: number } } | null)?.meta?.status === 404;
}

// The free Workers plan gives a request 10 ms of CPU and rendering a page
// with React takes 20-80 ms, so visitors are served rendered pages from KV:
// - static pages are rendered by the build and put in KV on deploy;
// - posts and the /wiedza, /podcasty, /podcast-pno and /faq pages are rendered on their first visit and kept
//   until a save in /admin marks them stale (lib/blog/cache.ts, lib/faq/cache.ts), which is
//   recorded in D1 so every location sees it at once;
// - addresses that lead nowhere are never kept (see `pageCache`).
// Nothing revalidates on a timer, so no queue is needed.
export default defineCloudflareConfig({
  incrementalCache: pageCache,
  tagCache: d1NextTagCache,
  enableCacheInterception: true,
});
