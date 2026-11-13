import { NextResponse } from "next/server";
import { findFault, HONEYPOT } from "@/lib/faq/limits";
import { countSubmissionsSince, createSubmission } from "@/lib/faq/questions";
import { notifyNewQuestion } from "@/lib/faq/mail";

/**
 * Questions from all visitors together in the last hour. Far above what real
 * people send; it only stops a flood from filling the panel.
 */
const HOURLY_CAP = 20;
const HOUR_MS = 60 * 60 * 1000;

function readField(payload: unknown, key: string) {
  if (typeof payload !== "object" || payload === null) return "";

  const value = (payload as Record<string, unknown>)[key];

  return typeof value === "string" ? value.trim() : "";
}

/**
 * Stores a question from /faq for the panel, then e-mails us about it. The
 * question is safe once stored, so a failed e-mail does not fail the request.
 */
export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Nie udało się odczytać pytania." }, { status: 400 });
  }

  // Only a bot fills in the hidden field. It is told it succeeded, so it has
  // no reason to try again differently.
  if (readField(payload, HONEYPOT)) return NextResponse.json({ ok: true });

  const submission = {
    // It goes into the e-mail subject, so it stays on one line.
    name: readField(payload, "name").replace(/\s+/g, " "),
    email: readField(payload, "email"),
    question: readField(payload, "question"),
  };
  const fault = findFault(submission);

  if (fault) return NextResponse.json({ error: fault.message, field: fault.field }, { status: 400 });

  try {
    if ((await countSubmissionsSince(new Date(Date.now() - HOUR_MS))) >= HOURLY_CAP) {
      return NextResponse.json(
        { error: "Dostajemy teraz wyjątkowo dużo pytań. Spróbuj ponownie za godzinę albo napisz na kontakt@coordination.pl." },
        { status: 429 },
      );
    }

    await createSubmission(submission);
  } catch (error) {
    console.error("Formularz FAQ: nie udało się zapisać pytania", error);

    return NextResponse.json(
      { error: "Nie udało się wysłać pytania. Spróbuj ponownie za chwilę." },
      { status: 500 },
    );
  }

  await notifyNewQuestion({ ...submission, submitted: submission.question });

  return NextResponse.json({ ok: true });
}
