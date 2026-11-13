import { NextResponse } from "next/server";
import { adminRoute } from "@/lib/admin-auth";
import { countQuestions, createQuestion, FaqError, listQuestions } from "@/lib/faq/questions";

export const GET = adminRoute(async () => {
  const [questions, counts] = await Promise.all([listQuestions(), countQuestions()]);

  return NextResponse.json({ questions, counts });
});

/** A question written in the panel from scratch. Not retried by the panel: the first try may have saved it. */
export const POST = adminRoute(async (request) => {
  try {
    return NextResponse.json({ question: await createQuestion(await request.json()) }, { status: 201 });
  } catch (error) {
    if (error instanceof FaqError) return NextResponse.json({ error: error.message }, { status: error.status });
    throw error;
  }
});
