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
