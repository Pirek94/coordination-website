"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { AFTER_CHANGE_NOTE, SITUATIONS } from "@/lib/content/situations";
import styles from "./AfterChange.module.css";

export type AfterChangeRow = {
  id: string;
  /** The left-hand state, struck through as the row comes into view. */
  before: string;
  /** The right-hand one, which settles in beside it. */
  after: string;
};

type AfterChangeProps = {
  rows?: readonly AfterChangeRow[];
  /** The column headings, also spoken before each half. */
  labels?: { before: string; after: string };
  note?: string;
};

/** By default: the situations owners come with, and how each looks once the work has landed. */
const SITUATION_ROWS: readonly AfterChangeRow[] = SITUATIONS.map(({ id, title, after }) => ({
  id,
  before: title,
  after,
}));

const SITUATION_LABELS = { before: "Dziś", after: "Po doradztwie" };

/**
 * Pairs set side by side: „Co konkretnie zmienia się w firmie?” at /wsparcie
 * (the situations owners come with against how each should look once the work
 * has landed) and „Kiedy nie jesteśmy właściwym wyborem” at /dla-kogo (what
 * we are not the answer to, against what the owner needs instead). As a row
 * scrolls into view, the left one is struck through and the right one
 * settles in beside it.
 */
export default function AfterChange({
  rows = SITUATION_ROWS,
  labels = SITUATION_LABELS,
  note = AFTER_CHANGE_NOTE,
}: AfterChangeProps) {
  const listRef = useRef<HTMLOListElement>(null);
  // Rows start out shown, so the page reads the same without JavaScript; the
  // strike-through only waits for the reader once the script is running.
  const [armed, setArmed] = useState(false);
  const [shown, setShown] = useState<ReadonlySet<string>>(() => new Set());

  useEffect(() => {
    const list = listRef.current;

    if (!list || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    setArmed(true);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;

          const id = (entry.target as HTMLElement).dataset.id;

          if (!id) continue;

          observer.unobserve(entry.target);
          setShown((prev) => new Set(prev).add(id));
        }
      },
      { threshold: 0.6, rootMargin: "0px 0px -10% 0px" },
    );

    for (const row of list.querySelectorAll("[data-id]")) observer.observe(row);

    return () => observer.disconnect();
  }, []);

  return (
    <div className={styles.shell} data-armed={armed ? "true" : undefined}>
      <div className={styles.head} aria-hidden="true">
        <span className={styles.headBefore}>{labels.before}</span>
        <span />
        <span className={styles.headAfter}>{labels.after}</span>
      </div>

      <ol className={styles.list} ref={listRef}>
        {rows.map((row) => (
          <li
            key={row.id}
            data-id={row.id}
            data-shown={shown.has(row.id) ? "true" : undefined}
            className={styles.row}
          >
            <p className={styles.before}>
              <span>
                <span className={styles.label}>
                  {labels.before}
                  <span className={styles.srOnly}>: </span>
                </span>
                <span className={styles.strike}>{row.before}</span>
              </span>
            </p>

            <span className={styles.arrow} aria-hidden="true">
              <ArrowRight />
            </span>

            <p className={styles.after}>
              <span className={styles.check} aria-hidden="true">
                <Check />
              </span>
              <span>
                <span className={styles.label}>
                  {labels.after}
                  <span className={styles.srOnly}>: </span>
                </span>
                {row.after}
              </span>
            </p>
          </li>
        ))}
      </ol>

      <p className={styles.note}>{note}</p>
    </div>
  );
}
