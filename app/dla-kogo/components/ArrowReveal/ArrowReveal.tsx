"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { pin, pinProgress, unpin } from "@/lib/pin";
import styles from "./ArrowReveal.module.css";

export type ArrowRevealRow = {
  id: string;
  /** The left-hand text: where it starts. */
  from: string;
  /** The right-hand text, uncovered by the arrow: where it leads. */
  to: string;
};

type ArrowRevealProps = {
  rows: readonly ArrowRevealRow[];
  /** The line under the list, held back until the last row is uncovered. */
  note: string;
  /** Smaller text and tighter rows, for a longer list to still fit on screen. */
  dense?: boolean;
  /** The section's intro, pinned with the card wherever both fit on screen. */
  intro?: React.ReactNode;
};

/** Share of the scroll the last answer keeps on screen, fully read, before the card lets go. */
const HOLD = 0.12;

const clamp = (value: number) => Math.min(1, Math.max(0, value));

/** Where the card sticks when it sticks alone: just under the bar. */
const stickAt = () =>
  (parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--site-nav-height")) ||
    70) + 20;

/**
 * A list of pairs on a short sticky scroll: the card stays under the bar
 * while the page moves on, and each left-hand text in turn gets its answer.
 * Its arrow appears, then flies right, and the answer is uncovered just
 * behind it; past the end it fades, and an arrow settles slowly back between
 * the two texts. Answers already given stay on the card; the rows still to
 * come wait dimmed, and the closing note fades in once the last answer is in.
 * At /dla-kogo it carries „Co ma się zmienić po doradztwie?”.
 *
 * The scroll only drives it where the whole card fits on screen beside the
 * bar and motion is welcome; anywhere else it is the plain list, every
 * answer showing.
 */
export default function ArrowReveal({ rows: items, note, dense = false, intro }: ArrowRevealProps) {
  const track = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const shell = useRef<HTMLDivElement>(null);
  const rows = useRef<(HTMLLIElement | null)[]>([]);
  const [armed, setArmed] = useState(false);

  // Whether the card fits and motion is fine, checked again on every resize.
  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const narrow = window.matchMedia("(max-width: 720px)");

    const check = () => {
      const card = shell.current;

      if (!card || motion.matches || narrow.matches) return setArmed(false);

      const top = stickAt();

      setArmed(card.offsetHeight <= window.innerHeight - top - 16);
    };

    check();
    window.addEventListener("resize", check);
    motion.addEventListener("change", check);

    return () => {
      window.removeEventListener("resize", check);
      motion.removeEventListener("change", check);
    };
  }, []);

  // Scroll position to each row's stage, written straight to its style.
  useEffect(() => {
    const wrapper = track.current;
    const card = shell.current;
    const sticky = stage.current;

    if (!armed || !wrapper || !card || !sticky) return;

    // The intro and the card together where they fit, else the card alone.
    const nav = stickAt() - 20;
    let pinned = pin(sticky, card, { nav, screen: window.innerHeight, bodyTop: stickAt() });

    // Straight from the scroll event, which browsers already send at most
    // once a frame; a handful of rows are cheap to work out.
    const update = () => {
      const progress = pinProgress(wrapper, pinned);
      const step = (1 - HOLD) / items.length;

      rows.current.forEach((row, index) => {
        if (!row) return;

        const local = clamp((progress - index * step) / step);
        // A quarter to show the arrow, the rest to carry it across.
        const appear = clamp(local / 0.25);
        const across = clamp((local - 0.25) / 0.75);

        row.style.setProperty("--appear", appear.toFixed(3));
        row.style.setProperty("--across", across.toFixed(3));
        row.dataset.stage = local <= 0 ? "waiting" : local >= 1 ? "done" : "active";
      });

      // The closing note waits for the last answer.
      wrapper.toggleAttribute("data-complete", progress >= 1 - HOLD);
    };

    const onResize = () => {
      pinned = pin(sticky, card, { nav, screen: window.innerHeight, bodyTop: stickAt() });
      update();
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", onResize);
      unpin(sticky, card);

      rows.current.forEach((row) => {
        row?.style.removeProperty("--appear");
        row?.style.removeProperty("--across");
        row?.removeAttribute("data-stage");
      });
      wrapper.removeAttribute("data-complete");
    };
  }, [armed, items.length]);

  return (
    <div
      ref={track}
      className={styles.track}
      data-armed={armed || undefined}
      data-dense={dense || undefined}
      style={{ "--rows": items.length } as React.CSSProperties}
    >
      <div ref={stage}>
        {intro}

        <div ref={shell} className={styles.shell}>
          <ul className={styles.list}>
            {items.map((item, index) => (
              <li
                key={item.id}
                ref={(element) => {
                  rows.current[index] = element;
                }}
                className={styles.item}
              >
                <p className={styles.situation}>{item.from}</p>

                <div className={styles.answer}>
                  {/* Between the two texts, once the answer is given. */}
                  <span className={styles.arrow} aria-hidden="true">
                    <ArrowRight strokeWidth={2.75} />
                  </span>
                  {/* The one that crosses the answer while the scroll uncovers it. */}
                  <span className={`${styles.arrow} ${styles.flight}`} aria-hidden="true">
                    <ArrowRight strokeWidth={2.75} />
                  </span>
                  <p className={styles.redirect}>{item.to}</p>
                </div>
              </li>
            ))}
          </ul>

          <p className={styles.note}>{note}</p>
        </div>
      </div>

      {/* The scroll the card stays put through. A sticky element only moves
          within its parent's content, so this is an element, not padding. */}
      <div className={styles.runway} aria-hidden="true" />
    </div>
  );
}
