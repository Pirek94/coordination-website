"use client";

import { Archive, ExternalLink, Globe, Pin, PinOff, RotateCcw, SquarePen, Trash2, Undo2 } from "lucide-react";
import type { FaqInput, FaqQuestion } from "@/lib/faq/types";
import { htmlToText } from "@/lib/blog/content";
import ContextMenu, { MenuDivider, MenuItem, type MenuPoint } from "../ContextMenu/ContextMenu";

/** Whether the question can go out as it is: the server refuses it without both. */
const canPublish = (question: FaqQuestion) => question.question.trim() !== "" && htmlToText(question.answer) !== "";

type Props = {
  question: FaqQuestion;
  /** Where the menu opens: the pointer, or the row for the keyboard menu key. */
  at: MenuPoint;
  onOpen: () => void;
  onChange: (patch: Partial<FaqInput>) => void;
  onDelete: () => void;
  onClose: () => void;
};

/** The right-click menu of a question in the list; only what applies to it. */
export default function FaqMenu({ question, at, onOpen, onChange, onDelete, onClose }: Props) {
  const published = question.status === "published";
  const archived = question.status === "archived";
  const ready = canPublish(question);

  return (
    <ContextMenu label={`Akcje pytania „${question.question}”`} at={at} onClose={onClose}>
      <MenuItem icon={<SquarePen size={15} aria-hidden="true" />} onSelect={onOpen}>
        Otwórz
      </MenuItem>
      {published && (
        <MenuItem
          icon={<ExternalLink size={15} aria-hidden="true" />}
          onSelect={() => window.open(`/faq#pytanie-${question.id}`, "_blank", "noopener")}
        >
          Zobacz na stronie
        </MenuItem>
      )}
      {published ? (
        <MenuItem icon={<Undo2 size={15} aria-hidden="true" />} onSelect={() => onChange({ status: "new" })}>
          Cofnij publikację
        </MenuItem>
      ) : (
        // Shown but unavailable without an answer, so it is clear why it cannot go out yet.
        <MenuItem
          icon={<Globe size={15} aria-hidden="true" />}
          disabled={!ready}
          title={ready ? undefined : "Najpierw napisz odpowiedź w edytorze."}
          onSelect={() => onChange({ status: "published" })}
        >
          {ready ? "Opublikuj" : "Opublikuj (brak odpowiedzi)"}
        </MenuItem>
      )}
      <MenuItem
        icon={question.featured ? <PinOff size={15} aria-hidden="true" /> : <Pin size={15} aria-hidden="true" />}
        onSelect={() => onChange({ featured: !question.featured })}
      >
        {question.featured ? "Odepnij" : "Przypnij"}
      </MenuItem>
      {archived ? (
        <MenuItem icon={<RotateCcw size={15} aria-hidden="true" />} onSelect={() => onChange({ status: "new" })}>
          Przywróć
        </MenuItem>
      ) : (
        <MenuItem icon={<Archive size={15} aria-hidden="true" />} onSelect={() => onChange({ status: "archived" })}>
          Przenieś do archiwum
        </MenuItem>
      )}
      <MenuDivider />
      <MenuItem danger icon={<Trash2 size={15} aria-hidden="true" />} onSelect={onDelete}>
        Usuń pytanie
      </MenuItem>
    </ContextMenu>
  );
}
