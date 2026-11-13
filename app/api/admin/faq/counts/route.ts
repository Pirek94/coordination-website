import { NextResponse } from "next/server";
import { adminRoute } from "@/lib/admin-auth";
import { countQuestions } from "@/lib/faq/questions";

/** For the badge in the panel's top bar: how many questions wait for an answer. */
export const GET = adminRoute(async () => NextResponse.json({ counts: await countQuestions() }));
