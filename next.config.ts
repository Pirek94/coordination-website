import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  // A second dev server (a preview running next to the main one) points this
  // at its own folder instead of corrupting the running server's .next.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  images: {
    formats: ["image/avif", "image/webp"],
  },
  // Pages the old coordination.pl had that this site no longer does: their
  // addresses are indexed, so they lead somewhere instead of a 404.
  async redirects() {
    return [
      { source: "/o-nas", destination: "/", permanent: true },
      // WordPress kept podcast entries under their own prefix; here they are
      // posts at /<slug>, listed at /podcasty.
      { source: "/odcinek-podcastu", destination: "/podcasty", permanent: true },
      // `:rest*` also takes the episode's image pages (/odcinek-podcastu/<slug>/<image>).
      { source: "/odcinek-podcastu/:slug/:rest*", destination: "/:slug", permanent: true },
      // WordPress archives of posts by category and author: the posts are listed at /wiedza.
      // A post's image and feed pages (/<slug>/<name>) go back to it in app/[slug]/[subpage]/route.ts.
      { source: "/category/:path*", destination: "/wiedza", permanent: true },
      { source: "/author/:path*", destination: "/wiedza", permanent: true },
    ];
  },
};

export default nextConfig;

// Gives `next dev` local versions of the Cloudflare bindings from wrangler.jsonc.
// Kept in memory: Next loads this config twice at startup, and two emulators
// sharing .wrangler/state race over its SQLite files ("database is locked").
// `next dev` keeps the blog in .data/ anyway, not in the emulated D1 or KV.
initOpenNextCloudflareForDev({ persist: false });
