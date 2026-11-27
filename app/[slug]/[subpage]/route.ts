/**
 * WordPress gave every image in a post a page of its own under the post
 * (/<post>/<image>/), plus a comments feed (/<post>/feed/). Search engines
 * still have those addresses; they lead back to the post, which answers 404
 * itself when no post has that slug. Static routes (/wiedza/2, /faq/...) take
 * precedence over this one.
 */
export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  return Response.redirect(new URL(`/${encodeURIComponent(slug)}`, request.url), 301);
}
