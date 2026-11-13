import { NextResponse } from "next/server";
import { adminRoute } from "@/lib/admin-auth";
import { deleteQuestion, FaqError, getQuestion, updateQuestion } from "@/lib/faq/questions";
import type { FaqInput } from "@/lib/faq/types";

type Context = { params: Promise<{ id: string }> };

const notFound = () => NextResponse.json({ error: "Nie ma takiego pytania." }, { status: 404 });

export const GET = adminRoute(async (_request, { params }: Context) => {
  const question = await getQuestion(Number((await params).id));

  return question ? NextResponse.json({ question }) : notFound();
});

/**
 * Saves the whole question, its status included. `notify: true` with a
 * publish e-mails the asker; safe to retry, as they are told once ever.
 */
export const PUT = adminRoute(async (request, { params }: Context) => {
  try {
    const { notify, ...input } = (await request.json()) as Partial<FaqInput> & { notify?: unknown };
    const result = await updateQuestion(Number((await params).id), input, notify === true);

    return result ? NextResponse.json(result) : notFound();
  } catch (error) {
    if (error instanceof FaqError) return NextResponse.json({ error: error.message }, { status: error.status });
    throw error;
  }
});

export const DELETE = adminRoute(async (_request, { params }: Context) =>
  (await deleteQuestion(Number((await params).id))) ? NextResponse.json({ ok: true }) : notFound(),
);
