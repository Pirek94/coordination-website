"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import {
  COUNTER_FROM,
  HONEYPOT,
  MAX_EMAIL,
  MAX_NAME,
  MAX_QUESTION,
  MIN_QUESTION,
  findFault,
  type Submission,
  type SubmissionField,
} from "@/lib/faq/limits";
import styles from "./FaqForm.module.css";

type State = "idle" | "sending" | "sent";

type Fault = { field: SubmissionField | null; message: string };

const EMPTY: Submission = { name: "", email: "", question: "" };

const FAILED = "Nie udało się wysłać pytania. Spróbuj ponownie za chwilę.";

export default function FaqForm() {
  const [state, setState] = useState<State>("idle");
  const [fault, setFault] = useState<Fault | null>(null);
  const [values, setValues] = useState<Submission>(EMPTY);
  const [honeypot, setHoneypot] = useState("");

  const id = useId();
  const done = useRef<HTMLDivElement>(null);

  // The form is replaced by the thanks; focus follows, so a screen reader
  // reads it and the keyboard does not fall back to the top of the page.
  useEffect(() => {
    if (state === "sent") done.current?.focus();
  }, [state]);

  const fieldId = (field: SubmissionField) => `${id}-${field}`;
  const errorId = `${id}-error`;

  /** Puts the cursor in the field the message is about. */
  const show = (next: Fault) => {
    setFault(next);

    if (next.field) document.getElementById(fieldId(next.field))?.focus();
  };

  const change = (field: SubmissionField) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValues((current) => ({ ...current, [field]: event.target.value }));

    // Typing is answering the message, so it goes away.
    if (fault) setFault(null);
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (state === "sending") return;

    const submission = { name: values.name.trim(), email: values.email.trim(), question: values.question.trim() };
    const problem = findFault(submission);

    if (problem) {
      show(problem);

      return;
    }

    setFault(null);
    setState("sending");

    try {
      const response = await fetch("/api/faq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...submission, [HONEYPOT]: honeypot }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string; field?: SubmissionField } | null;

        setState("idle");
        show({ field: body?.field ?? null, message: body?.error ?? FAILED });

        return;
      }

      setValues(EMPTY);
      setState("sent");
    } catch {
      setState("idle");
      show({ field: null, message: "Brak połączenia. Sprawdź internet i spróbuj ponownie." });
    }
  };

  if (state === "sent") {
    return (
      <div ref={done} className={styles.done} role="status" tabIndex={-1}>
        <svg className={styles.check} viewBox="0 0 52 52" aria-hidden="true">
          <circle cx="26" cy="26" r="23" />
          <path d="M15.5 27 L22.5 34 L37 18.5" />
        </svg>
        <p className={styles.doneTitle}>Dziękujemy, pytanie do nas dotarło</p>
        <p className={styles.doneNote}>
          Przeanalizujemy je, przygotujemy odpowiedź i opublikujemy ją na tej stronie, bez Twojego imienia i adresu
          e-mail. Jeśli podałeś e-mail, damy Ci znać, gdy odpowiedź będzie gotowa.
        </p>
        <button type="button" className={styles.again} onClick={() => setState("idle")}>
          Zadaj kolejne pytanie
        </button>
      </div>
    );
  }

  const sending = state === "sending";
  const length = values.question.trim().length;
  const describe = (field: SubmissionField, ...ids: string[]) =>
    [...ids, fault?.field === field ? errorId : null].filter(Boolean).join(" ") || undefined;

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate aria-busy={sending}>
      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor={fieldId("name")}>
            Twoje imię <span className={styles.optional}>(opcjonalnie)</span>
          </label>
          <input
            id={fieldId("name")}
            className={styles.input}
            name="name"
            type="text"
            autoComplete="given-name"
            placeholder="Jak się do Ciebie zwracać?"
            maxLength={MAX_NAME}
            value={values.name}
            readOnly={sending}
            aria-invalid={fault?.field === "name"}
            aria-describedby={describe("name")}
            onChange={change("name")}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor={fieldId("email")}>
            Adres e-mail <span className={styles.optional}>(opcjonalnie)</span>
          </label>
          <input
            id={fieldId("email")}
            className={styles.input}
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="np. jan@twojafirma.pl"
            maxLength={MAX_EMAIL}
            value={values.email}
            readOnly={sending}
            aria-invalid={fault?.field === "email"}
            aria-describedby={describe("email", `${id}-email-hint`)}
            onChange={change("email")}
          />
          <span id={`${id}-email-hint`} className={styles.hint}>
            Tylko po to, by dać Ci znać o odpowiedzi.
          </span>
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor={fieldId("question")}>
          Opisz swój problem lub pytanie
        </label>
        <textarea
          id={fieldId("question")}
          className={styles.textarea}
          name="question"
          required
          minLength={MIN_QUESTION}
          maxLength={MAX_QUESTION}
          rows={6}
          placeholder="Napisz, z czym zmagasz się w firmie: co już próbowałeś i co nie działa tak, jak powinno."
          value={values.question}
          readOnly={sending}
          aria-invalid={fault?.field === "question"}
          aria-describedby={describe("question", `${id}-question-hint`, `${id}-counter`)}
          onChange={change("question")}
        />
        <div className={styles.under}>
          <span id={`${id}-question-hint`} className={styles.hint}>
            Pytanie opublikujemy anonimowo, czasem w skróconej formie.
          </span>
          {/* Only near the limit, where the number starts to matter. */}
          <span
            id={`${id}-counter`}
            className={styles.counter}
            data-near={length >= COUNTER_FROM || undefined}
            aria-live="polite"
          >
            {length >= COUNTER_FROM ? `Zostało ${MAX_QUESTION - length} z ${MAX_QUESTION} znaków` : ""}
          </span>
        </div>
      </div>

      {/* Hidden from people and screen readers; see HONEYPOT. */}
      <div className={styles.trap} aria-hidden="true">
        <label htmlFor={`${id}-${HONEYPOT}`}>Strona internetowa</label>
        <input
          id={`${id}-${HONEYPOT}`}
          name={HONEYPOT}
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(event) => setHoneypot(event.target.value)}
        />
      </div>

      {fault && (
        <p id={errorId} className={styles.error} role="alert">
          {fault.message}
        </p>
      )}

      <div className={styles.footer}>
        <button type="submit" className={styles.submit} disabled={sending}>
          {sending ? "Wysyłanie…" : "Wyślij pytanie"}
        </button>
        <p className={styles.privacy}>
          Imienia i adresu e-mail nigdy nie publikujemy. Więcej w{" "}
          <Link href="/polityka-prywatnosci">polityce prywatności</Link>.
        </p>
      </div>
    </form>
  );
}
