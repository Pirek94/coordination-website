"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LoaderCircle, Mail, MessageCircleQuestion, Pin, Plus, Search } from "lucide-react";
import { fold } from "@/lib/fold";
import type { FaqCounts, FaqInput, FaqQuestion, FaqStatus } from "@/lib/faq/types";
import AdminBar from "../AdminBar/AdminBar";
import { useAdmin } from "../AdminAuth/AdminAuth";
import { menuPoint, type MenuPoint } from "../ContextMenu/ContextMenu";
import FaqMenu from "./FaqMenu";
import list from "../AdminList/AdminList.module.css";
import styles from "./FaqList.module.css";

const TABS: { value: FaqStatus; label: string; empty: string }[] = [
  { value: "new", label: "Do odpowiedzi", empty: "Nie ma pytań czekających na odpowiedź." },
  { value: "published", label: "Opublikowane", empty: "Nie opublikowano jeszcze żadnego pytania." },
  { value: "archived", label: "Archiwum", empty: "Archiwum jest puste." },
];

const dateFormat = new Intl.DateTimeFormat("pl-PL", { day: "numeric", month: "long", year: "numeric" });

/** The date that matters on each tab: when it was asked, or when it came out. */
const shownDate = (question: FaqQuestion) =>
  question.status === "published" ? question.publishedAt ?? question.createdAt : question.createdAt;

export default function FaqList() {
  const { api } = useAdmin();
  const router = useRouter();
  const [questions, setQuestions] = useState<FaqQuestion[] | null>(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<FaqStatus>("new");
  const [menu, setMenu] = useState<{ question: FaqQuestion; at: MenuPoint } | null>(null);
  const opener = useRef<HTMLElement | null>(null);

  useEffect(() => {
    api<{ questions: FaqQuestion[] }>("/api/admin/faq")
      .then(({ questions }) => setQuestions(questions))
      .catch((reason: Error) => setError(reason.message));
  }, [api]);

  // Counted from the list itself, so a change made from the menu shows at once in the tabs and the bar.
  const counts = useMemo<FaqCounts | null>(() => {
    if (!questions) return null;

    const totals: FaqCounts = { new: 0, published: 0, archived: 0 };

    for (const question of questions) totals[question.status]++;

    return totals;
  }, [questions]);

  const visible = useMemo(() => {
    const needle = fold(query.trim());

    return (questions ?? []).filter(
      (question) =>
        question.status === tab &&
        (!needle ||
          fold(`${question.question} ${question.submitted} ${question.category} ${question.name} ${question.email}`).includes(
            needle,
          )),
    );
  }, [questions, query, tab]);

  function openMenu(event: React.MouseEvent<HTMLElement>, question: FaqQuestion) {
    event.preventDefault();
    opener.current = event.currentTarget;
    setMenu({ question, at: menuPoint(event) });
  }

  // Focus goes back to the row the menu came from, as with a native menu.
  const closeMenu = useCallback(() => {
    setMenu(null);
    opener.current?.focus();
  }, []);

  /**
   * Saves the question with some fields changed and puts the stored version
   * back into the list. Never e-mails the asker: that stays a choice made in
   * the editor.
   */
  async function change(question: FaqQuestion, patch: Partial<FaqInput>) {
    setError("");

    const { question: text, answer, category, featured, status } = question;

    try {
      const { question: stored } = await api<{ question: FaqQuestion }>(`/api/admin/faq/${question.id}`, {
        method: "PUT",
        body: JSON.stringify({ question: text, answer, category, featured, status, ...patch, notify: false }),
      });

      setQuestions((current) => current?.map((item) => (item.id === stored.id ? stored : item)) ?? null);
    } catch (reason) {
      setError((reason as Error).message);
    }
  }

  async function remove(question: FaqQuestion) {
    if (!confirm(`Usunąć pytanie „${question.question}”? Tego nie da się cofnąć.`)) return;

    setError("");

    try {
      await api(`/api/admin/faq/${question.id}`, { method: "DELETE" });
      setQuestions((current) => current?.filter((item) => item.id !== question.id) ?? null);
    } catch (reason) {
      setError((reason as Error).message);
    }
  }

  const empty = TABS.find((item) => item.value === tab)!.empty;

  return (
    <div className={list.page}>
      <AdminBar section="faq" waiting={counts?.new ?? null} />

      <main className={list.main}>
        <div className={list.head}>
          <div>
            <h1 className={list.title}>Pytania w FAQ</h1>
          </div>
          <Link className={list.primary} href="/admin/faq/nowe">
            <Plus size={18} aria-hidden="true" />
            Dodaj pytanie
          </Link>
        </div>

        <div className={list.tools}>
          <div className={list.filters} role="tablist" aria-label="Status pytań">
            {TABS.map((item) => (
              <button
                key={item.value}
                type="button"
                role="tab"
                aria-selected={tab === item.value}
                className={list.filter}
                onClick={() => setTab(item.value)}
              >
                {item.label}
                <span className={list.count}>{counts?.[item.value] ?? 0}</span>
              </button>
            ))}
          </div>
          <label className={list.search}>
            <Search size={16} aria-hidden="true" />
            <input
              type="search"
              placeholder="Szukaj w pytaniach, kategoriach i nadawcach"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="Szukaj pytań"
            />
          </label>
        </div>

        {error && (
          <p className={list.error} role="alert">
            {error}
          </p>
        )}

        {questions === null && !error ? (
          <div className={list.empty}>
            <LoaderCircle className={list.spinner} aria-hidden="true" />
            Wczytywanie pytań…
          </div>
        ) : visible.length === 0 ? (
          <div className={list.empty}>
            <MessageCircleQuestion size={28} aria-hidden="true" />
            {query.trim() ? "Żadne pytanie nie pasuje do wyszukiwania." : empty}
          </div>
        ) : (
          <ul className={list.list}>
            {visible.map((question) => {
              const date = shownDate(question);

              return (
                <li key={question.id}>
                  <Link
                    href={`/admin/faq/${question.id}`}
                    className={`${list.item} ${styles.item}`}
                    data-active={menu?.question.id === question.id || undefined}
                    onContextMenu={(event) => openMenu(event, question)}
                  >
                    <span className={list.body}>
                      <span className={list.itemTitle}>{question.question}</span>
                      <span className={list.meta}>
                        {question.submitted ? "Z formularza" : "Dodane w panelu"}
                        {question.category && <> · {question.category}</>}
                        {question.status !== "published" && question.answer && <> · jest szkic odpowiedzi</>}
                      </span>
                    </span>
                    <span className={list.side}>
                      <span className={styles.flags}>
                        {question.featured && (
                          <span className={list.flag} title="Przypięte, na stronie głównej">
                            <Pin size={12} aria-hidden="true" />
                            <span className={styles.flagLabel}>Przypięte</span>
                          </span>
                        )}
                        {question.email && (
                          <span className={list.flag} title={`Zostawiono e-mail: ${question.email}`}>
                            <Mail size={12} aria-hidden="true" />
                            <span className={styles.flagLabel}>{question.notifiedAt ? "Powiadomiony" : "E-mail"}</span>
                          </span>
                        )}
                      </span>
                      <time dateTime={date}>{dateFormat.format(new Date(date))}</time>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </main>

      {menu && (
        <FaqMenu
          question={menu.question}
          at={menu.at}
          onClose={closeMenu}
          onOpen={() => router.push(`/admin/faq/${menu.question.id}`)}
          onChange={(patch) => change(menu.question, patch)}
          onDelete={() => remove(menu.question)}
        />
      )}
    </div>
  );
}
