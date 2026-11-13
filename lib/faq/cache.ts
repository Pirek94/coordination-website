import { revalidatePath } from "next/cache";

/**
 * /faq is rendered once and then served from the page cache (KV, see
 * open-next.config.ts) until this marks it stale, as the blog pages are
 * (lib/blog/cache.ts).
 *
 * Called only after a change visitors can see: a question published,
 * unpublished, deleted, or edited while published. New questions from the
 * form and edits to unpublished ones leave the cached page alone.
 */
export function revalidateFaq() {
  revalidatePath("/faq/[[...rest]]", "page");
}
