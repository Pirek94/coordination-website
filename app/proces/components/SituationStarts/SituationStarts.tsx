"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SITUATIONS } from "@/lib/content/situations";
import { SUPPORT_AREAS } from "@/lib/content/support";
import styles from "./SituationStarts.module.css";

const AREAS = new Map(SUPPORT_AREAS.map((area) => [area.id, area]));

/**
 * „Z takimi sytuacjami pracujemy najczęściej”: the situations owners come
 * with, each with the areas we start from, linked to their description at
 * /wsparcie (the first one answers it most directly). The rows rise into
 * place one after another as they scroll in, once the script is there to
 * show them; without it they are simply in the page.
 */
export default function SituationStarts() {
  const listRef = useRef<HTMLUListElement>(null);
  const [armed, setArmed] = useState(false);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const list = listRef.current;

    if (!list || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    setArmed(true);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        setShown(true);
        observer.disconnect();
      },
      { threshold: 0.15 },
    );

    observer.observe(list);

    return () => observer.disconnect();
  }, []);

  return (
    <div className={styles.shell} data-armed={armed ? "true" : undefined} data-shown={shown ? "true" : undefined}>
      <ul className={styles.list} ref={listRef}>
        {SITUATIONS.map(({ id, Icon, title, areas }, index) => (
          <li key={id} className={styles.row} style={{ "--i": index } as React.CSSProperties}>
            <span className={styles.icon} aria-hidden="true">
              <Icon />
            </span>
            <div className={styles.body}>
              <h3 className={styles.title}>{title}</h3>
              <p className={styles.startLabel}>Zaczynamy od:</p>
              <ul className={styles.chips}>
                {areas.map((area) => (
                  <li key={area}>
                    <Link className={styles.chip} href={`/wsparcie#${area}`}>
                      {AREAS.get(area)!.short}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ul>

      <p className={styles.footer}>
        <Link className={styles.more} href="/dla-kogo">
          Sprawdź, czy to Twój etap
          <ArrowRight aria-hidden="true" />
        </Link>
      </p>
    </div>
  );
}
