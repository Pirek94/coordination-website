"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { Archive, ChevronLeft, ExternalLink, Globe, LoaderCircle, Mail, RotateCcw, Save, Trash2, Undo2 } from "lucide-react";
import { htmlToText } from "@/lib/blog/content";
import { HOME_FAQ_LIMIT } from "@/lib/faq/rows";
import type { FaqCounts, FaqNotification, FaqQuestion, FaqStatus } from "@/lib/faq/types";
import AdminBar from "../AdminBar/AdminBar";
import { useAdmin } from "../AdminAuth/AdminAuth";
import { RichTextContent, RichTextToolbar, useRichText } from "../RichText/RichText";
import styles from "./FaqEditor.module.css";

/** What the admin edits; the status changes only through the actions. */
type Draft = Pick<FaqQuestion, "question" | "answer" | "category" | "featured">;

type Action = "save" | "publish" | "unpublish" | "archive" | "restore";

type Notice = { kind: "ok" | "warning" | "error"; text: string };

const EMPTY: Draft = { question: "", answer: "", category: "", featured: false };

const STATUS_LABEL: Record<FaqStatus, string> = { new: "Do odpowiedzi", published: "Opublikowane", archived: "W archiwum" };

const DONE: Record<Action, string> = {
  save: "Zapisano.",
  publish: "Opublikowano: pytanie jest już na stronie FAQ.",
  unpublish: "Cofnięto publikację: pytanie wróciło do odpowiedzi.",
  archive: "Przeniesiono do archiwum.",
  restore: "Przywrócono do pytań do odpowiedzi.",
};

/** What the panel says after a save that only sent the notification, by its outcome. */
function notifiedNotice(notification: FaqNotification): Notice {
  if (notification === "sent") return { kind: "ok", text: "Wysłano: autor pytania dostał e-mail z linkiem do odpowiedzi." };
  if (notification === "failed") return { kind: "warning", text: "Nie udało się wysłać powiadomienia. Spróbuj ponownie później." };

  return { kind: "ok", text: "Autor pytania był już wcześniej powiadomiony." };
}

const dateFormat = new Intl.DateTimeFormat("pl-PL", { dateStyle: "long", timeStyle: "short" });

const toDraft = ({ question, answer, category, featured }: FaqQuestion): Draft => ({ question, answer, category, featured });

const snapshot = (draft: Draft) => JSON.stringify(draft);

/** The status a save leaves the question in. */
function statusAfter(action: Action, current: FaqStatus): FaqStatus {
  if (action === "publish") return "published";
  if (action === "archive") return "archived";
  if (action === "unpublish" || action === "restore") return "new";

  return current;
}

/** One question: what was sent, and its public wording and answer. `id` is null for a new one. */
export default function FaqEditor({ id }: { id: number | null }) {
  const { api } = useAdmin();
  const router = useRouter();
  const [stored, setStored] = useState<FaqQuestion | null>(null);
  const [draft, setDraft] = useState<Draft | null>(id === null ? EMPTY : null);
  const [saved, setSaved] = useState(snapshot(EMPTY));
  const [loadError, setLoadError] = useState("");
  const [busy, setBusy] = useState<Action | "delete" | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [notify, setNotify] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [counts, setCounts] = useState<FaqCounts | null>(null);
  const fieldId = useId();

  const loadList = useCallback(
    () =>
      api<{ questions: FaqQuestion[]; counts: FaqCounts }>("/api/admin/faq")
        .then(({ questions, counts }) => {
          setCounts(counts);
          setCategories([...new Set(questions.map((item) => item.category).filter(Boolean))].sort((a, b) => a.localeCompare(b, "pl")));
        })
        .catch(() => {}),
    [api],
  );

  useEffect(() => {
    loadList();

    if (id === null) return;

    api<{ question: FaqQuestion }>(`/api/admin/faq/${id}`)
      .then(({ question }) => {
        setStored(question);
        setDraft(toDraft(question));
        setSaved(snapshot(toDraft(question)));
      })
      .catch((reason: Error) => setLoadError(reason.message));
  }, [api, id, loadList]);

  const dirty = useMemo(() => draft !== null && snapshot(draft) !== saved, [draft, saved]);

  useEffect(() => {
    if (!dirty) return;

    const warn = (event: BeforeUnloadEvent) => event.preventDefault();

    window.addEventListener("beforeunload", warn);

    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const patch = useCallback((change: Partial<Draft>) => setDraft((current) => current && { ...current, ...change }), []);

  const status = stored?.status ?? "new";
  const hasQuestion = (draft?.question.trim() ?? "") !== "";
  const hasAnswer = htmlToText(draft?.answer ?? "") !== "";
  // Offered until the asker has been told; the server sends it on a save that leaves the question published.
  const canNotify = Boolean(stored?.email) && !stored?.notifiedAt;

  const draftRef = useRef(draft);
  draftRef.current = draft;

  const run = useCallback(
    async (action: Action) => {
      const current = draftRef.current;

      if (!current || busy) return;

      const next = statusAfter(action, status);
      // Nothing to save on a published question: the save only sends the notification.
      const notifyOnly = action === "save" && snapshot(current) === saved && status === "published" && canNotify && notify;
      const body = JSON.stringify({ ...current, status: next, notify: canNotify && notify && next === "published" });

      setBusy(action);
      setNotice(null);

      try {
        if (id === null) {
          const { question } = await api<{ question: FaqQuestion }>("/api/admin/faq", { method: "POST", body });

          setSaved(snapshot(current));
          setNotice({ kind: "ok", text: DONE[action] });
          router.replace(`/admin/faq/${question.id}`);

          return;
        }

        const { question, notification } = await api<{ question: FaqQuestion; notification: FaqNotification }>(
          `/api/admin/faq/${id}`,
          { method: "PUT", body },
        );
        // The server tidies whitespace; what is typed meanwhile is kept.
        const settled = toDraft(question);

        setStored(question);
        setDraft((latest) => (latest && snapshot(latest) !== snapshot(current) ? latest : settled));
        setSaved(snapshot(settled));
        setNotice(
          notifyOnly
            ? notifiedNotice(notification)
            : notification === "failed"
              ? {
                  kind: "warning",
                  text: `${DONE[action]} Nie udało się jednak wysłać e-maila do autora pytania. Spróbuj ponownie później przyciskiem „Wyślij powiadomienie”.`,
                }
              : { kind: "ok", text: notification === "sent" ? `${DONE[action]} Autor pytania dostał e-mail z linkiem do odpowiedzi.` : DONE[action] },
        );

        if (next !== status) loadList();
      } catch (reason) {
        setNotice({ kind: "error", text: (reason as Error).message });
      } finally {
        setBusy(null);
      }
    },
    [api, busy, canNotify, id, loadList, notify, router, saved, status],
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        if (dirty) run("save");
      }
    };

    window.addEventListener("keydown", onKey);

    return () => window.removeEventListener("keydown", onKey);
  }, [dirty, run]);

  function leave(event: React.MouseEvent) {
    if (dirty && !confirm("Masz niezapisane zmiany. Wyjść bez zapisywania?")) event.preventDefault();
  }

  async function remove() {
    if (!stored || !confirm("Usunąć to pytanie? Tego nie da się cofnąć.")) return;

    setBusy("delete");

    try {
      await api(`/api/admin/faq/${stored.id}`, { method: "DELETE" });
      setSaved(snapshot(draftRef.current ?? EMPTY));
      router.push("/admin/faq");
    } catch (reason) {
      setNotice({ kind: "error", text: (reason as Error).message });
      setBusy(null);
    }
  }

  const bar = <AdminBar section="faq" waiting={counts?.new ?? null} onLeave={leave} />;

  if (loadError) {
    return (
      <div className={styles.page}>
        {bar}
        <div className={styles.center}>
          <p>{loadError}</p>
          <Link href="/admin/faq" className={styles.back}>
            <ChevronLeft size={16} aria-hidden="true" />
            Wróć do listy pytań
          </Link>
        </div>
      </div>
    );
  }

  if (!draft) {
    return (
      <div className={styles.page}>
        {bar}
        <div className={styles.center}>
          <LoaderCircle className={styles.spinner} aria-label="Wczytywanie pytania" />
        </div>
      </div>
    );
  }

  const working = busy !== null;
  // A published question saved again with the box ticked retries a notification that failed.
  const retryNotify = status === "published" && canNotify && notify;
  const canSave = hasQuestion && (dirty || id === null || retryNotify) && !(status === "published" && !hasAnswer);
  // With no edits, "Zapisz" would only send the e-mail, so it says so.
  const notifyOnly = retryNotify && !dirty && id !== null;
  const publishHint = !hasQuestion || !hasAnswer ? "Aby opublikować, wpisz pytanie i odpowiedź." : null;

  return (
    <div className={styles.page}>
      {bar}

      <main className={styles.main}>
        <div className={styles.head}>
          <Link href="/admin/faq" className={styles.back} onClick={leave}>
            <ChevronLeft size={16} aria-hidden="true" />
            Wszystkie pytania
          </Link>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>{id === null ? "Nowe pytanie" : "Pytanie"}</h1>
            {stored && (
              <span className={styles.status} data-status={status}>
                {STATUS_LABEL[status]}
              </span>
            )}
            {stored?.status === "published" && (
              <a className={styles.view} href={`/faq#pytanie-${stored.id}`} target="_blank" rel="noopener">
                <ExternalLink size={15} aria-hidden="true" />
                Zobacz na stronie
              </a>
            )}
          </div>
        </div>

        <div className={styles.layout}>
          <div className={styles.content}>
            {stored?.submitted && (
              <section className={styles.submission} aria-labelledby={`${fieldId}-submission`}>
                <h2 id={`${fieldId}-submission`} className={styles.cardTitle}>
                  Zgłoszenie
                </h2>
                <p className={styles.submitted}>{stored.submitted}</p>
                <dl className={styles.facts}>
                  <div>
                    <dt>Imię</dt>
                    <dd>{stored.name || "nie podano"}</dd>
                  </div>
                  <div>
                    <dt>E-mail</dt>
                    <dd>{stored.email ? <a href={`mailto:${stored.email}`}>{stored.email}</a> : "nie podano"}</dd>
                  </div>
                  <div>
                    <dt>Wysłano</dt>
                    <dd>{dateFormat.format(new Date(stored.createdAt))}</dd>
                  </div>
                  {stored.notifiedAt && (
                    <div>
                      <dt>Powiadomiono</dt>
                      <dd>{dateFormat.format(new Date(stored.notifiedAt))}</dd>
                    </div>
                  )}
                </dl>
                <p className={styles.private}>Tego bloku nie widzi nikt poza panelem.</p>
              </section>
            )}

            <div className={styles.field}>
              <label className={styles.label} htmlFor={`${fieldId}-question`}>
                Pytanie na stronie
              </label>
              <textarea
                id={`${fieldId}-question`}
                className={styles.textarea}
                rows={3}
                value={draft.question}
                placeholder="Np. Czy doradztwo to dobry wybór dla mojej firmy?"
                aria-describedby={`${fieldId}-question-hint`}
                onChange={(event) => patch({ question: event.target.value })}
              />
              <p id={`${fieldId}-question-hint`} className={styles.hint}>
                Tak zobaczą je odwiedzający. Skróć je do sedna i usuń szczegóły, po których można rozpoznać autora lub
                jego firmę.
              </p>
            </div>

            <div className={styles.field}>
              <span className={styles.label} id={`${fieldId}-answer`}>
                Odpowiedź
              </span>
              <AnswerEditor
                key={stored?.id ?? "new"}
                html={draft.answer}
                labelledBy={`${fieldId}-answer`}
                onChange={(answer) => patch({ answer })}
              />
            </div>
          </div>

          <aside className={styles.side}>
            <div className={styles.card}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor={`${fieldId}-category`}>
                  Kategoria <span className={styles.optional}>(opcjonalnie)</span>
                </label>
                <input
                  id={`${fieldId}-category`}
                  className={styles.input}
                  list={`${fieldId}-categories`}
                  maxLength={80}
                  value={draft.category}
                  placeholder="Np. Sprzedaż"
                  onChange={(event) => patch({ category: event.target.value })}
                />
                <datalist id={`${fieldId}-categories`}>
                  {categories.map((category) => (
                    <option key={category} value={category} />
                  ))}
                </datalist>
              </div>

              <label className={styles.check}>
                <input
                  type="checkbox"
                  checked={draft.featured}
                  onChange={(event) => patch({ featured: event.target.checked })}
                />
                <span>
                  Przypnij / pokaż na stronie głównej
                  <span className={styles.hint}>
                    Przypięte są pierwsze w FAQ; strona główna pokazuje {HOME_FAQ_LIMIT} pierwszych.
                  </span>
                </span>
              </label>

              {canNotify && (
                <label className={styles.check}>
                  <input type="checkbox" checked={notify} onChange={(event) => setNotify(event.target.checked)} />
                  <span>
                    Powiadom autora pytania e-mailem
                    <span className={styles.hint}>Przy publikacji wyślemy link do odpowiedzi na {stored?.email}.</span>
                  </span>
                </label>
              )}
            </div>

            <div className={styles.card}>
              <div className={styles.actions}>
                {status !== "published" && (
                  <button
                    type="button"
                    className={styles.publish}
                    disabled={working || publishHint !== null}
                    onClick={() => run("publish")}
                  >
                    {busy === "publish" ? <LoaderCircle className={styles.spinner} aria-hidden="true" /> : <Globe size={16} aria-hidden="true" />}
                    {dirty || id === null ? "Zapisz i opublikuj" : "Opublikuj"}
                  </button>
                )}
                <button
                  type="button"
                  className={status === "published" ? styles.publish : styles.secondary}
                  disabled={working || !canSave}
                  onClick={() => run("save")}
                >
                  {busy === "save" ? (
                    <LoaderCircle className={styles.spinner} aria-hidden="true" />
                  ) : notifyOnly ? (
                    <Mail size={16} aria-hidden="true" />
                  ) : (
                    <Save size={16} aria-hidden="true" />
                  )}
                  {notifyOnly ? "Wyślij powiadomienie" : "Zapisz"}
                </button>
                {publishHint && status !== "published" && <p className={styles.hint}>{publishHint}</p>}

                {status === "published" && (
                  <button type="button" className={styles.secondary} disabled={working || !hasQuestion} onClick={() => run("unpublish")}>
                    <Undo2 size={16} aria-hidden="true" />
                    Cofnij publikację
                  </button>
                )}
                {id !== null && status !== "archived" && (
                  <button type="button" className={styles.secondary} disabled={working || !hasQuestion} onClick={() => run("archive")}>
                    <Archive size={16} aria-hidden="true" />
                    Przenieś do archiwum
                  </button>
                )}
                {status === "archived" && (
                  <button type="button" className={styles.secondary} disabled={working || !hasQuestion} onClick={() => run("restore")}>
                    <RotateCcw size={16} aria-hidden="true" />
                    Przywróć
                  </button>
                )}
                {stored && (
                  <button type="button" className={styles.danger} disabled={working} onClick={remove}>
                    <Trash2 size={16} aria-hidden="true" />
                    Usuń
                  </button>
                )}
              </div>

              <p className={styles.saveState} data-kind={notice?.kind ?? (dirty ? "dirty" : "clean")} role="status">
                {notice?.text ?? (dirty ? "Niezapisane zmiany" : id === null ? "" : "Wszystko zapisane")}
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

/** The answer in the same editor posts use; started once, with the loaded HTML. */
function AnswerEditor({ html, labelledBy, onChange }: { html: string; labelledBy: string; onChange: (html: string) => void }) {
  const editor = useRichText({ html, onChange });

  return (
    <div className={styles.editor} role="group" aria-labelledby={labelledBy}>
      <div className={styles.toolbar}>
        <RichTextToolbar editor={editor} />
      </div>
      <div className={styles.editorBody}>
        <RichTextContent editor={editor} />
      </div>
    </div>
  );
}
