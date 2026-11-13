/** "new" waits for an answer, "archived" is set aside without one. */
export type FaqStatus = "new" | "published" | "archived";

export const FAQ_STATUSES: readonly FaqStatus[] = ["new", "published", "archived"];

/** What visitors see of a question; nothing about who asked it. */
export type PublicFaq = {
  id: number;
  question: string;
  /** HTML from the panel's text editor. */
  answer: string;
  category: string;
};

/** A question as the panel shows it. */
export type FaqQuestion = PublicFaq & {
  /** What the visitor sent, word for word; empty for questions written in the panel. */
  submitted: string;
  name: string;
  email: string;
  status: FaqStatus;
  featured: boolean;
  publishedAt: string | null;
  notifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

/** What the panel sends when it saves; the server fills in the rest. */
export type FaqInput = Pick<FaqQuestion, "question" | "answer" | "category" | "featured" | "status">;

export type FaqCounts = Record<FaqStatus, number>;

/**
 * Whether the asker was told about the published answer by this save: null
 * when there was nobody to tell or they had been told before.
 */
export type FaqNotification = "sent" | "failed" | null;
