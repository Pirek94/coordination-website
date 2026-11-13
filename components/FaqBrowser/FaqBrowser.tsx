"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ChevronDown, Search, SearchX, X } from "lucide-react";
import FaqAccordion from "@/components/FaqAccordion/FaqAccordion";
import { htmlToText } from "@/lib/blog/content";
import { fold } from "@/lib/fold";
import type { PublicFaq } from "@/lib/faq/types";
import styles from "./FaqBrowser.module.css";

/** Below this many questions a search box is more clutter than help. */
const SEARCH_FROM = 6;
/** Filtering by category only makes sense with a choice between two. */
const CATEGORIES_FROM = 2;
/** Questions shown at first, and how many more each "Pokaż więcej" adds. */
const PAGE = 15;

/**
 * The published questions on /faq, with a search and category filter once
 * there are enough of them to need one.
 */
export default function FaqBrowser({ entries }: { entries: readonly PublicFaq[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [limit, setLimit] = useState(PAGE);
  // The first question "Pokaż więcej" brought in, focused once it shows.
  const focusNext = useRef<number | null>(null);
  const id = useId();

  const index = useMemo(
    () => entries.map((entry) => ({ id: entry.id, text: fold(`${entry.question} ${entry.category} ${htmlToText(entry.answer)}`) })),
    [entries],
  );

  const categories = useMemo(
    () => [...new Set(entries.map((entry) => entry.category).filter(Boolean))].sort((a, b) => a.localeCompare(b, "pl")),
    [entries],
  );

  const showSearch = entries.length >= SEARCH_FROM;
  const showCategories = categories.length >= CATEGORIES_FROM;

  const filtering = query.trim() !== "" || category !== null;

  const hidden = useMemo(() => {
    const words = fold(query).split(/\s+/).filter(Boolean);
    const out = new Set<number>();

    entries.forEach((entry, position) => {
      const inCategory = !category || entry.category === category;
      const matches = words.every((word) => index[position].text.includes(word));

      if (!inCategory || !matches) out.add(entry.id);
    });

    return out;
  }, [entries, index, query, category]);

  // A search or a category shows every match; the list as a whole goes a page at a time.
  const paged = useMemo(() => {
    if (filtering || entries.length <= limit) return hidden;

    const out = new Set(hidden);

    entries.slice(limit).forEach((entry) => out.add(entry.id));

    return out;
  }, [entries, hidden, filtering, limit]);

  const shown = entries.length - hidden.size;
  const more = !filtering && entries.length > limit;

  const showMore = () => {
    focusNext.current = entries[limit]?.id ?? null;
    setLimit(limit + PAGE);
  };

  // Keyboard and screen reader users land on the first question just added.
  useEffect(() => {
    const target = focusNext.current;

    if (target === null) return;

    focusNext.current = null;
    document.querySelector<HTMLButtonElement>(`#pytanie-${target} [data-trigger]`)?.focus();
  }, [limit]);

  const reset = () => {
    setQuery("");
    setCategory(null);
  };

  // A link to a question the filters hide, or one further down than the list
  // shows yet, shows it again, so the accordion can open it.
  useEffect(() => {
    const follow = () => {
      const match = /^#pytanie-(\d+)$/.exec(window.location.hash);

      if (!match) return;

      const position = entries.findIndex((entry) => entry.id === Number(match[1]));

      reset();
      if (position >= 0) setLimit((current) => Math.max(current, Math.ceil((position + 1) / PAGE) * PAGE));
    };

    follow();
    window.addEventListener("hashchange", follow);

    return () => window.removeEventListener("hashchange", follow);
  }, [entries]);

  return (
    <div className={styles.browser}>
      {(showSearch || showCategories) && (
        <div className={styles.tools}>
          {showSearch && (
            <div className={styles.search}>
              <Search size={18} aria-hidden="true" />
              <label htmlFor={`${id}-search`} className={styles.visuallyHidden}>
                Szukaj w pytaniach i odpowiedziach
              </label>
              <input
                id={`${id}-search`}
                type="search"
                placeholder="Szukaj w pytaniach i odpowiedziach"
                autoComplete="off"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                aria-controls={`${id}-results`}
              />
              {query && (
                <button type="button" className={styles.clear} onClick={() => setQuery("")} aria-label="Wyczyść wyszukiwanie">
                  <X size={16} aria-hidden="true" />
                </button>
              )}
            </div>
          )}

          {showCategories && (
            <div className={styles.chips} role="group" aria-label="Kategorie pytań">
              <button
                type="button"
                className={styles.chip}
                aria-pressed={category === null}
                onClick={() => setCategory(null)}
              >
                Wszystkie
              </button>
              {categories.map((name) => (
                <button
                  key={name}
                  type="button"
                  className={styles.chip}
                  aria-pressed={category === name}
                  onClick={() => setCategory(category === name ? null : name)}
                >
                  {name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <p className={styles.status} aria-live="polite">
        {!filtering ? "" : shown > 0 ? `Pasujące pytania: ${shown} z ${entries.length}` : "Brak pasujących pytań"}
      </p>

      <div id={`${id}-results`} className={showSearch || showCategories ? styles.underTools : undefined}>
        {/* All closed at first, unless the address points at one. */}
        <FaqAccordion entries={entries} hidden={paged} followHash />
      </div>

      {more && (
        <button type="button" className={styles.more} onClick={showMore} aria-controls={`${id}-results`}>
          Pokaż więcej
          <ChevronDown size={17} aria-hidden="true" />
        </button>
      )}

      {filtering && shown === 0 && (
        <div className={styles.nothing}>
          <SearchX className={styles.nothingIcon} aria-hidden="true" />
          <p className={styles.nothingTitle}>Nie mamy jeszcze odpowiedzi na takie pytanie</p>
          <p className={styles.nothingText}>
            Zadaj je nam anonimowo: odpowiemy i opublikujemy odpowiedź na tej stronie.
          </p>
          <div className={styles.nothingActions}>
            <a className={styles.nothingLink} href="#zadaj-pytanie">
              Zadaj pytanie
            </a>
            <button type="button" className={styles.nothingReset} onClick={reset}>
              Pokaż wszystkie pytania
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
