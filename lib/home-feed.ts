import type { PostSummary } from "@/lib/blog/types";
import type { PublicFaq } from "@/lib/faq/types";

/**
 * The changing parts of the static home page, in one response from /api/home:
 * the newest post (null while nothing is published) and the first FAQ
 * questions. worker.ts answers it on Cloudflare, app/api/home/route.ts under
 * `next dev`.
 */
export type HomeFeed = { post: PostSummary | null; faq: PublicFaq[] };

/** A failed request is tried again after these pauses, in ms. */
const RETRIES = [400, 1200];

let pending: Promise<HomeFeed | null> | undefined;

async function fetchFeed(): Promise<HomeFeed | null> {
  for (let attempt = 0; ; attempt++) {
    try {
      const response = await fetch("/api/home", { cache: "no-store" });

      if (response.ok) return (await response.json()) as HomeFeed;
    } catch {
      // Offline or dropped: tried again below.
    }

    if (attempt === RETRIES.length) return null;

    await new Promise((resolve) => setTimeout(resolve, RETRIES[attempt]));
  }
}

/**
 * The feed, fetched once per page load however many sections ask for it;
 * null when it could not be loaded. A failure is not kept, so a section
 * mounted later tries again.
 */
export function loadHomeFeed() {
  pending ??= fetchFeed().then((feed) => {
    if (!feed) pending = undefined;

    return feed;
  });

  return pending;
}
