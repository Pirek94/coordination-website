"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import FaqAccordion from "@/components/FaqAccordion/FaqAccordion";
import { HOME_FAQ_LIMIT } from "@/lib/faq/rows";
import type { PublicFaq } from "@/lib/faq/types";
import { loadHomeFeed } from "@/lib/home-feed";
import styles from "./HomeFaq.module.css";

/**
 * A few answers from /faq on the home page. The page is static, so the shell
 * is in its HTML and the questions come with the home feed
 * (lib/home-feed.ts); rows of the same height hold their place meanwhile.
 * Without questions, or without the feed, only the invitation to ask stays.
 */
export default function HomeFaq() {
  // undefined: still loading.
  const [entries, setEntries] = useState<PublicFaq[] | undefined>(undefined);

  useEffect(() => {
    let active = true;

    loadHomeFeed().then((feed) => {
      if (active) setEntries(feed?.faq ?? []);
    });

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className={styles.section} aria-labelledby="home-faq-title">
      <div className={styles.inner}>
        <div className={styles.intro}>
          <h2 id="home-faq-title" className={styles.title}>
            Najczęściej zadawane pytania
          </h2>
          <p className={styles.lead}>
            Właściciele firm pytają nas anonimowo, a my odpowiadamy publicznie. Może ktoś zapytał już o to, co nie daje
            spokoju Tobie.
          </p>
          <div className={styles.links}>
            <Link className={styles.all} href="/faq">
              Pokaż wszystkie pytania
            </Link>
            <Link className={styles.ask} href="/faq#zadaj-pytanie">
              Zadaj pytanie anonimowo
            </Link>
          </div>
        </div>

        <div className={styles.list}>
          {entries === undefined ? (
            <div className={styles.skeleton} data-home-faq-skeleton="" aria-hidden="true">
              {Array.from({ length: HOME_FAQ_LIMIT }, (_, index) => (
                <span key={index} className={styles.row}>
                  <span className={styles.bar} />
                </span>
              ))}
            </div>
          ) : entries.length > 0 ? (
            <FaqAccordion entries={entries} />
          ) : (
            <p className={styles.invite}>
              Masz pytanie o swoją firmę? Zadaj je anonimowo, a odpowiedź opublikujemy w FAQ.
            </p>
          )}

          {/* Without JavaScript the questions never come, so their placeholders go. */}
          <noscript>
            <style>{"[data-home-faq-skeleton]{display:none}"}</style>
          </noscript>
        </div>
      </div>
    </section>
  );
}
