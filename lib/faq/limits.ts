/**
 * Limits of the question form, shared by the form and POST /api/faq so the
 * two never disagree.
 */

/** Anything longer than this is a paste accident, not a question for us. */
export const MAX_QUESTION = 4000;
/** Shorter than this, there is nothing to answer yet. */
export const MIN_QUESTION = 10;
export const MAX_NAME = 120;
export const MAX_EMAIL = 254;
/** The counter under the question appears this close to the limit. */
export const COUNTER_FROM = MAX_QUESTION - 500;

/**
 * A field people never see and bots fill in. Named like something a form
 * would ask for, so a bot does not skip it.
 */
export const HONEYPOT = "website";

const EMAIL =/^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type SubmissionField = "name" | "email" | "question";

export type Submission = Record<SubmissionField, string>;

/** The first problem with a filled-in form, or null; expects trimmed values. */
export function findFault({ name, email, question }: Submission): { field: SubmissionField; message: string } | null {
  if (name.length > MAX_NAME) return { field: "name", message: "Imię jest za długie." };

  if (email && (!EMAIL.test(email) || email.length > MAX_EMAIL)) {
    return { field: "email", message: "Podaj poprawny adres e-mail albo zostaw to pole puste." };
  }

  if (!question) return { field: "question", message: "Opisz swój problem lub pytanie." };

  if (question.length < MIN_QUESTION) {
    return { field: "question", message: `Opisz pytanie nieco dokładniej: co najmniej ${MIN_QUESTION} znaków.` };
  }

  if (question.length > MAX_QUESTION) {
    return { field: "question", message: `Pytanie jest za długie. Zmieść się w ${MAX_QUESTION} znaków.` };
  }

  return null;
}
