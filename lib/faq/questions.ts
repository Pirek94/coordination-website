import { getDb } from "@/lib/db";
import { htmlToText } from "@/lib/blog/content";
import { revalidateFaq } from "@/lib/faq/cache";
import { MAX_QUESTION, type Submission } from "@/lib/faq/limits";
import { notifyAsker } from "@/lib/faq/mail";
import { HOME_FAQ_SQL, PUBLISHED_FAQ_SQL, toFaqQuestion, toPublicFaq, type FaqRow } from "@/lib/faq/rows";
import {
  FAQ_STATUSES,
  type FaqCounts,
  type FaqInput,
  type FaqNotification,
  type FaqQuestion,
  type FaqStatus,
  type PublicFaq,
} from "@/lib/faq/types";

export class FaqError extends Error {
  constructor(
    message: string,
    readonly status = 400,
  ) {
    super(message);
  }
}

/** Far beyond any answer written by hand; stops a runaway paste. */
const MAX_ANSWER = 50_000;
const MAX_CATEGORY = 80;

const now = () => new Date().toISOString();

const oneLine = (value: unknown) => (typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "");

/** Checks and normalises what the panel sent before it reaches the database. */
function normalise(input: Partial<FaqInput>) {
  const question = oneLine(input.question);
  const html = typeof input.answer === "string" ? input.answer.trim() : "";
  const status = input.status ?? "new";

  if (!question) throw new FaqError("Pytanie nie może być puste.");
  if (question.length > MAX_QUESTION) throw new FaqError(`Pytanie jest za długie (najwyżej ${MAX_QUESTION} znaków).`);
  if (html.length > MAX_ANSWER) throw new FaqError("Odpowiedź jest za długa.");
  if (!FAQ_STATUSES.includes(status)) throw new FaqError("Nieznany status pytania.");

  // An answer of empty paragraphs is no answer, and is stored as none.
  const answer = htmlToText(html) ? html : "";

  if (status === "published" && !answer) throw new FaqError("Nie można opublikować pytania bez odpowiedzi.");

  return {
    question,
    answer,
    category: oneLine(input.category).slice(0, MAX_CATEGORY),
    status,
    featured: input.featured === true ? 1 : 0,
  };
}

export async function listQuestions(): Promise<FaqQuestion[]> {
  const db = await getDb();
  const rows = await db.all<FaqRow>(
    "SELECT * FROM faq_questions ORDER BY featured DESC, COALESCE(published_at, created_at) DESC, id DESC",
  );

  return rows.map(toFaqQuestion);
}

export async function countQuestions(): Promise<FaqCounts> {
  const db = await getDb();
  const rows = await db.all<{ status: FaqStatus; total: number }>(
    "SELECT status, COUNT(*) AS total FROM faq_questions GROUP BY status",
  );
  const counts: FaqCounts = { new: 0, published: 0, archived: 0 };

  for (const row of rows) counts[row.status] = row.total;

  return counts;
}

export async function getQuestion(id: number): Promise<FaqQuestion | null> {
  const db = await getDb();
  const row = await db.first<FaqRow>("SELECT * FROM faq_questions WHERE id = ?", id);

  return row && toFaqQuestion(row);
}

/** Questions sent through the form since the given time, for the hourly cap. */
export async function countSubmissionsSince(since: Date) {
  const db = await getDb();
  const row = await db.first<{ total: number }>(
    "SELECT COUNT(*) AS total FROM faq_questions WHERE submitted <> '' AND created_at > ?",
    since.toISOString(),
  );

  return row?.total ?? 0;
}

/**
 * Stores a question from the form, already checked with `findFault`. It
 * waits in the panel, so nothing visitors see changes.
 */
export async function createSubmission({ name, email, question }: Submission) {
  const db = await getDb();
  // The public wording starts as what was sent; the admin trims it down.
  const { lastRowId } = await db.run(
    "INSERT INTO faq_questions (question, submitted, name, email) VALUES (?, ?, ?, ?)",
    question,
    question,
    name,
    email,
  );

  return lastRowId;
}

/** A question written in the panel from scratch. */
export async function createQuestion(input: Partial<FaqInput>): Promise<FaqQuestion> {
  const values = normalise(input);
  const db = await getDb();
  const { lastRowId } = await db.run(
    "INSERT INTO faq_questions (question, answer, category, status, featured, published_at) VALUES (?, ?, ?, ?, ?, ?)",
    values.question,
    values.answer,
    values.category,
    values.status,
    values.featured,
    values.status === "published" ? now() : null,
  );

  if (values.status === "published") revalidateFaq();

  return (await getQuestion(lastRowId))!;
}

/**
 * Saves the panel's version of a question. With `notify`, publishing it also
 * e-mails the asker, once ever.
 */
export async function updateQuestion(
  id: number,
  input: Partial<FaqInput>,
  notify = false,
): Promise<{ question: FaqQuestion; notification: FaqNotification } | null> {
  const values = normalise(input);
  const db = await getDb();
  const before = await db.first<Pick<FaqRow, "status">>("SELECT status FROM faq_questions WHERE id = ?", id);

  if (!before) return null;

  const publishing = values.status === "published";
  const stamp = now();

  // The first publication date stays: taking an answer down for a fix and
  // putting it back does not move it to the top.
  await db.run(
    `UPDATE faq_questions SET question = ?, answer = ?, category = ?, status = ?, featured = ?,
      published_at = COALESCE(published_at, ?), updated_at = ? WHERE id = ?`,
    values.question,
    values.answer,
    values.category,
    values.status,
    values.featured,
    publishing ? stamp : null,
    stamp,
    id,
  );

  // Edits to a question nobody can see change nothing on the page.
  if (before.status === "published" || publishing) revalidateFaq();

  const notification = notify && publishing ? await notifyOnce(id) : null;

  return { question: (await getQuestion(id))!, notification };
}

/**
 * Claims the notification by setting `notified_at` before sending, so a save
 * the panel retries, or two tabs publishing at once, cannot send it twice.
 */
async function notifyOnce(id: number): Promise<FaqNotification> {
  const db = await getDb();
  const stamp = now();
  const { changes } = await db.run(
    `UPDATE faq_questions SET notified_at = ?
      WHERE id = ? AND status = 'published' AND email <> '' AND notified_at IS NULL`,
    stamp,
    id,
  );

  if (!changes) return null;

  const row = await db.first<Pick<FaqRow, "id" | "name" | "email">>(
    "SELECT id, name, email FROM faq_questions WHERE id = ?",
    id,
  );

  if (row && (await notifyAsker(row))) return "sent";

  // Not sent, so the claim is let go: the panel offers to try again on the next publish.
  await db.run("UPDATE faq_questions SET notified_at = NULL WHERE id = ? AND notified_at = ?", id, stamp);

  return "failed";
}

export async function deleteQuestion(id: number) {
  const db = await getDb();
  const before = await db.first<Pick<FaqRow, "status">>("SELECT status FROM faq_questions WHERE id = ?", id);
  const { changes } = await db.run("DELETE FROM faq_questions WHERE id = ?", id);

  if (!changes) return false;

  if (before?.status === "published") revalidateFaq();

  return true;
}

/** Every published question, pinned first, for /faq. */
export async function listPublishedFaq(): Promise<PublicFaq[]> {
  const db = await getDb();

  return (await db.all<FaqRow>(PUBLISHED_FAQ_SQL)).map(toPublicFaq);
}

/**
 * The questions for the home page, for /api/home under `next dev`. On
 * Cloudflare worker.ts answers that route with the same query.
 */
export async function listHomeFaq(): Promise<PublicFaq[]> {
  const db = await getDb();

  return (await db.all<FaqRow>(HOME_FAQ_SQL)).map(toPublicFaq);
}
