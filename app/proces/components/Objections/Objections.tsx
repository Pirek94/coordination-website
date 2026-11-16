"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { ArrowRight, MessageCircleReply } from "lucide-react";
import styles from "./Objections.module.css";

type Objection = {
  id: string;
  /** In the owner's own words. */
  quote: string;
  answer: string;
  link?: { href: string; label: string };
};

const OBJECTIONS: readonly Objection[] = [
  {
    id: "time",
    quote: "Nie mam na to czasu",
    answer:
      "Właśnie dlatego nie zatrzymujemy firmy na czas współpracy. Pracujemy na sprawach, którymi i tak się zajmujesz - zapytaniach, ofertach, decyzjach - więc spotkania nie są dodatkowym projektem obok firmy. Celem jest, żeby z czasem coraz mniej tych spraw trafiało na Twoje biurko.",
    link: { href: "#co-sie-wydarzy", label: "Zobacz, co dzieje się podczas współpracy" },
  },
  {
    id: "report",
    quote: "Mieliśmy już doradcę i został po nim raport",
    answer:
      "Nie kończymy na rekomendacjach. Pracujemy na realnych przypadkach z Twojej firmy, z każdego wyprowadzamy zasadę, którą od razu stosujecie, a potem wspólnie ją poprawiamy. Efekt ma być widoczny w codziennych decyzjach, a nie w dokumencie.",
    link: { href: "#proces-pracy", label: "Zobacz, jak wygląda proces pracy" },
  },
  {
    id: "industry",
    quote: "Moja branża jest specyficzna",
    answer:
      "Każda jest - dlatego nie przynosimy gotowego szablonu. Pracujemy z mikro i małymi firmami z różnych branż, bo problemy właścicieli rzadko wynikają z rodzaju działalności, a częściej z tego, że firma przestaje działać jako spójny system. Znajomość branży wnosisz Ty, my - sposób porządkowania decyzji.",
    link: { href: "/dla-kogo", label: "Zobacz, z kim pracujemy" },
  },
  {
    id: "price",
    quote: "To pewnie kosztuje więcej, niż mogę wydać",
    answer:
      "Orientacyjne ceny są jawne: od 1800 zł netto miesięcznie dla firm usługowych i eksperckich oraz od 2300 zł netto miesięcznie dla firm produkcyjnych, handlowych, technicznych i projektowych. Zakres zależy od firmy, a zanim cokolwiek ustalimy, odbywamy trzy bezpłatne spotkania robocze.",
    link: { href: "/#cennik", label: "Zobacz orientacyjne ceny" },
  },
  {
    id: "outsider",
    quote: "Nie chcę, żeby ktoś z zewnątrz mówił mi, jak prowadzić firmę",
    answer:
      "I nie będziemy. Ty zostajesz u steru: nie przejmujemy zarządzania, tylko pomagamy podejmować lepsze decyzje i pokazujemy ich skutki. Zasady ustalamy razem, a ostatnie słowo zawsze należy do Ciebie.",
  },
  {
    id: "timing",
    quote: "Nie wiem, czy to dobry moment",
    answer:
      "Dlatego zaczynamy od trzech bezpłatnych spotkań roboczych, bez deklaracji długoterminowej współpracy. Po nich oboje wiemy, czy możemy realnie pomóc Twojej firmie teraz. Jeżeli nie ma dopasowania, nie kontynuujemy.",
    link: { href: "#kontakt", label: "Umów pierwsze spotkanie" },
  },
];

/** Below this width the answer opens under its objection instead of beside the list. */
const NARROW = "(max-width: 900px)";

/**
 * „Jakie masz obiekcje?”: the doubts owners say out loud, each with our
 * straight answer. On wide screens the objections are a list of speech
 * bubbles with the chosen one's answer beside them; on narrow ones the answer
 * opens right under the bubble that was tapped. One is always open, so the
 * answer side is never empty, and every answer is in the page.
 */
export default function Objections() {
  const [active, setActive] = useState(0);
  const [armed, setArmed] = useState(false);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  // Set by a tap, so only the visitor's own choice moves the page.
  const picked = useRef(false);
  const id = useId();

  useEffect(() => {
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) setArmed(true);
  }, []);

  // Under one column the answer above closes as a new one opens, which can
  // pull the tapped bubble up and out of sight; bring it back.
  useLayoutEffect(() => {
    if (!picked.current) return;

    picked.current = false;

    if (window.matchMedia(NARROW).matches) buttons.current[active]?.scrollIntoView({ block: "nearest" });
  }, [active]);

  return (
    <div className={styles.board} data-armed={armed ? "true" : undefined}>
      {OBJECTIONS.map((objection, index) => {
        const open = index === active;

        return (
          <div key={objection.id} className={styles.entry}>
            <button
              ref={(element) => {
                buttons.current[index] = element;
              }}
              type="button"
              className={styles.bubble}
              id={`${id}-q-${objection.id}`}
              aria-expanded={open}
              aria-controls={`${id}-a-${objection.id}`}
              onClick={() => {
                picked.current = true;
                setActive(index);
              }}
            >
              <span className={styles.quote}>„{objection.quote}”</span>
            </button>

            <div
              id={`${id}-a-${objection.id}`}
              role="region"
              aria-labelledby={`${id}-q-${objection.id}`}
              hidden={!open}
              className={styles.answer}
            >
              <p className={styles.label}>
                <MessageCircleReply aria-hidden="true" />
                Nasza odpowiedź
              </p>
              <p className={styles.answerQuote} aria-hidden="true">
                „{objection.quote}”
              </p>
              <p className={styles.answerText}>{objection.answer}</p>
              {objection.link && (
                <a className={styles.more} href={objection.link.href}>
                  {objection.link.label}
                  <ArrowRight aria-hidden="true" />
                </a>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
