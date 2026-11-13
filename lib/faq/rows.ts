import type { FaqQuestion, FaqStatus, PublicFaq } from "@/lib/faq/types";

/**
 * How FAQ questions are stored and read back. Shared by `lib/faq/questions.ts`
 * and the Worker entry (`worker.ts`), which answers /api/home without starting
 * Next.js, so this file imports nothing at runtime.
 */

export type FaqRow = {
  id: number;
  question: string;
  submitted: string;
  name: string;
  email: string;
  answer: string;
  category: string;
  status: FaqStatus;
  featured: number;
  published_at: string | null;
  notified_at: string | null;
  created_at: string;
  updated_at: string;
};

/** Never more than this: the name and e-mail of the asker stay in the panel. */
export const PUBLIC_COLUMNS = "id, question, answer, category";

/** Pinned first, then the newest. */
export const PUBLIC_ORDER = "featured DESC, published_at DESC, id DESC";

export const PUBLISHED_FAQ_SQL = `SELECT ${PUBLIC_COLUMNS} FROM faq_questions WHERE status = 'published' ORDER BY ${PUBLIC_ORDER}`;

/** Questions shown on the home page. */
export const HOME_FAQ_LIMIT = 6;

export const HOME_FAQ_SQL = `${PUBLISHED_FAQ_SQL} LIMIT ${HOME_FAQ_LIMIT}`;

export const toPublicFaq = (row: Pick<FaqRow, "id" | "question" | "answer" | "category">): PublicFaq => ({
  id: row.id,
  question: row.question,
  answer: row.answer,
  category: row.category,
});

export const toFaqQuestion = (row: FaqRow): FaqQuestion => ({
  ...toPublicFaq(row),
  submitted: row.submitted,
  name: row.name,
  email: row.email,
  status: row.status,
  featured: row.featured === 1,
  publishedAt: row.published_at,
  notifiedAt: row.notified_at,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});
