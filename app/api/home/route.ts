import { NextResponse } from "next/server";
import { getLatestPublishedPost } from "@/lib/blog/posts";
import { listHomeFaq } from "@/lib/faq/questions";
import type { HomeFeed } from "@/lib/home-feed";

export const dynamic = "force-dynamic";

/**
 * The changing parts of the home page, which is static and asks for them in
 * the browser (lib/home-feed.ts). Answers under `next dev`; on Cloudflare
 * worker.ts answers this route itself.
 */
export async function GET() {
  const headers = { "Cache-Control": "no-store" };

  // Failing questions leave the post standing, as in worker.ts.
  const faq = listHomeFaq().catch((error: unknown) => {
    console.error("Loading the home FAQ failed:", error);

    return [];
  });

  try {
    const feed: HomeFeed = { post: await getLatestPublishedPost(), faq: await faq };

    return NextResponse.json(feed, { headers });
  } catch (error) {
    console.error("Loading the latest post failed:", error);

    // The home page tries again, then leaves these parts out.
    return new Response(null, { status: 503, headers });
  }
}
