/**
 * The site's address in canonicals, Open Graph, JSON-LD, the sitemap and
 * robots.txt.
 *
 * Fixed on purpose rather than read from an environment variable: pages are
 * prerendered, so a variable left over in the build settings (it used to hold
 * the *.workers.dev address before the domain moved) silently pointed every
 * canonical and sitemap entry at the technical domain.
 */
export const siteUrl = "https://coordination.pl";

/**
 * Open Graph shared by every page. A page that sets `openGraph` replaces the
 * root layout's whole object, so pages spread this in to keep the image.
 */
export const baseOpenGraph = {
  type: "website" as const,
  locale: "pl_PL",
  siteName: "Coordination",
  images: [{
    url: "/images/coordination-og.png",
    width: 1200,
    height: 630,
    type: "image/png",
    alt: "Coordination - Rozwój firmy zaczyna się od dobrych decyzji. Granatowe logo 3D na białym tle.",
  }],
};
