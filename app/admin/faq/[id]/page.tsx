"use client";

import { useParams } from "next/navigation";
import FaqEditor from "../../components/FaqEditor/FaqEditor";

/** /admin/faq/nowe starts a question written in the panel; it gets its id on the first save. */
export default function EditFaqPage() {
  const { id } = useParams<{ id: string }>();

  return <FaqEditor id={id === "nowe" ? null : Number(id)} />;
}
