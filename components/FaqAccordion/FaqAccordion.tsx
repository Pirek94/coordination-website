"use client";

import { useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import HtmlText from "@/components/HtmlText/HtmlText";
import type { PublicFaq } from "@/lib/faq/types";
import styles from "./FaqAccordion.module.css";

/** Where a question lives: /faq#pytanie-<id> opens it. */
export const questionAnchor = (id: number) => `pytanie-${id}`;

const ANCHOR = /^#pytanie-(\d+)$/;

type Props = {
  entries: readonly PublicFaq[];
  /** Open at first, unless the address points at another one. */
  initiallyOpen?: number | null;
  /** On /faq: #pytanie-<id> in the address opens that question and scrolls to it. */
  followHash?: boolean;
  /** Questions a search filtered out: kept in the page, so a link to one still finds it. */
  hidden?: ReadonlySet<number>;
  headingLevel?: 2 | 3;
};

/**
 * Questions with their answers, one open at a time, as rows between hairlines.
 * Every answer is in the HTML from the start; closed ones are only collapsed.
 */
export default function FaqAccordion({ entries, initiallyOpen = null, followHash = false, hidden, headingLevel = 3 }: Props) {
  const [openId, setOpenId] = useState<number | null>(initiallyOpen);
  // A new object each time, so following the same link twice scrolls again.
  const [target, setTarget] = useState<{ id: number } | null>(null);
  const list = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!followHash) return;

    const follow = () => {
      const id = Number(ANCHOR.exec(window.location.hash)?.[1]);

      if (!entries.some((entry) => entry.id === id)) return;

      setOpenId(id);
      setTarget({ id });
    };

    follow();
    window.addEventListener("hashchange", follow);

    return () => window.removeEventListener("hashchange", follow);
  }, [followHash, entries]);

  // After the question has opened, so it lands where the whole of it shows.
  useEffect(() => {
    if (!target) return;

    const item = document.getElementById(questionAnchor(target.id));

    item?.scrollIntoView({ block: "start" });
    item?.querySelector<HTMLButtonElement>("button")?.focus({ preventScroll: true });
  }, [target]);

  /** Arrow keys, Home and End move between the questions, as in the WAI-ARIA accordion pattern. */
  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const triggers = Array.from(list.current?.querySelectorAll<HTMLButtonElement>("[data-trigger]") ?? []).filter(
      (trigger) => !trigger.closest("[hidden]"),
    );
    const index = triggers.indexOf(event.target as HTMLButtonElement);

    if (index === -1) return;

    const next =
      event.key === "ArrowDown"
        ? triggers[(index + 1) % triggers.length]
        : event.key === "ArrowUp"
          ? triggers[(index - 1 + triggers.length) % triggers.length]
          : event.key === "Home"
            ? triggers[0]
            : event.key === "End"
              ? triggers[triggers.length - 1]
              : null;

    if (!next) return;

    event.preventDefault();
    next.focus();
  }

  return (
    <div ref={list} className={styles.accordion} onKeyDown={onKeyDown}>
      {entries.map((entry) => (
        <FaqItem
          key={entry.id}
          entry={entry}
          open={openId === entry.id}
          hidden={hidden?.has(entry.id) ?? false}
          headingLevel={headingLevel}
          onToggle={() => setOpenId((current) => (current === entry.id ? null : entry.id))}
        />
      ))}
    </div>
  );
}

type ItemProps = {
  entry: PublicFaq;
  open: boolean;
  hidden: boolean;
  headingLevel: 2 | 3;
  onToggle: () => void;
};

function FaqItem({ entry, open, hidden, headingLevel, onToggle }: ItemProps) {
  const anchor = questionAnchor(entry.id);
  const Heading = headingLevel === 2 ? "h2" : "h3";

  return (
    <div className={styles.item} id={anchor} data-open={open ? "true" : "false"} hidden={hidden}>
      <Heading className={styles.heading}>
        <button
          type="button"
          className={styles.trigger}
          id={`${anchor}-pytanie`}
          aria-expanded={open}
          aria-controls={`${anchor}-odpowiedz`}
          data-trigger=""
          onClick={onToggle}
        >
          <span className={styles.label}>
            {entry.category && <span className={styles.category}>{entry.category}</span>}
            <span className={styles.question}>{entry.question}</span>
          </span>
          {/* A plus that turns a quarter of the way round into an X when open. */}
          <Plus className={styles.icon} aria-hidden="true" />
        </button>
      </Heading>

      {/* Collapsed rather than removed: the answer stays in the page for search engines and Ctrl+F. */}
      <div
        className={styles.panel}
        id={`${anchor}-odpowiedz`}
        role="region"
        aria-labelledby={`${anchor}-pytanie`}
        data-open={open ? "true" : "false"}
      >
        <div className={styles.clip}>
          <div className={styles.panelInner}>
            <HtmlText html={entry.answer} size="compact" />
            <div className={styles.actions}>
              <a className={styles.cta} href="/#kontakt">
                Masz podobny problem? Skontaktuj się z nami bezpośrednio
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
