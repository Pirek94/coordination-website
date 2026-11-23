"use client";

import { useEffect, useId, useRef, useState, type ComponentType, type KeyboardEvent } from "react";
import {
  Building2,
  CalendarCheck,
  ClipboardCheck,
  Compass,
  FileSearch,
  FileText,
  Inbox,
  MessagesSquare,
  NotebookPen,
  Repeat,
  ScanSearch,
  Scale,
  Users,
  Waypoints,
  type LucideProps,
} from "lucide-react";
import styles from "./CollaborationViews.module.css";

type Happening = {
  Icon: ComponentType<LucideProps>;
  title: string;
  text: string;
};

type View = {
  id: string;
  Icon: ComponentType<LucideProps>;
  label: string;
  lead: string;
  items: readonly Happening[];
};

/** The same cooperation seen from three places in the owner's week. */
const VIEWS: readonly View[] = [
  {
    id: "meetings",
    Icon: CalendarCheck,
    label: "Na spotkaniach",
    lead: "Spotkanie to praca na Twoich sprawach, a nie wykład o zarządzaniu.",
    items: [
      {
        Icon: MessagesSquare,
        title: "Bierzemy na warsztat ostatnie tygodnie",
        text: "Przechodzimy przez konkretne zapytania, oferty i decyzje, które ostatnio wydarzyły się w Twojej firmie.",
      },
      {
        Icon: ScanSearch,
        title: "Nazywamy przyczynę, nie tylko objaw",
        text: "Sprawdzamy, co naprawdę stoi za utraconą marżą, przeciągniętą realizacją albo sprawą, która znowu wróciła do Ciebie.",
      },
      {
        Icon: Scale,
        title: "Ustalamy zasadę na następny raz",
        text: "Z omówionej sytuacji wyprowadzamy regułę - kryterium, próg albo kolejność kroków - której użyjecie przy podobnym przypadku.",
      },
      {
        Icon: Compass,
        title: "Decyzja zostaje po Twojej stronie",
        text: "Mówimy wprost, co widzimy, i pokazujemy skutki różnych wariantów. Wybór należy do Ciebie.",
      },
    ],
  },
  {
    id: "between",
    Icon: Waypoints,
    label: "Między spotkaniami",
    lead: "Firma pracuje normalnie, bez zatrzymywania bieżących spraw - tylko według nowych zasad.",
    items: [
      {
        Icon: ClipboardCheck,
        title: "Sprawdzasz zasadę na żywych sprawach",
        text: "Ustalone reguły stosujesz do zapytań i zleceń, które właśnie wpływają, a nie do wymyślonych przykładów.",
      },
      {
        Icon: FileSearch,
        title: "Przeglądamy decyzje, które nie mogą czekać",
        text: "Gdy pojawia się ważna oferta albo decyzja o cenie, możemy przejrzeć ją razem, zanim trafi do klienta.",
      },
      {
        Icon: NotebookPen,
        title: "Notujesz, co zadziałało, a co nie",
        text: "Krótkie notatki z codziennych sytuacji są materiałem na kolejne spotkanie. Dzięki nim poprawiamy zasady na faktach, a nie na wrażeniach.",
      },
    ],
  },
  {
    id: "firm",
    Icon: Building2,
    label: "W Twojej firmie",
    lead: "Z czasem zmiana przestaje zależeć od spotkań i widać ją w codziennej pracy.",
    items: [
      {
        Icon: Users,
        title: "Zespół dostaje jasne kryteria",
        text: "Pracownicy wiedzą, według czego wyceniać, kwalifikować zapytania i ustalać priorytety, zamiast pytać o każdą sprawę.",
      },
      {
        Icon: Inbox,
        title: "Mniej spraw wraca do Ciebie",
        text: "Na Twoje biurko trafia to, co naprawdę wymaga właściciela. Resztę zespół zamyka sam, według ustalonych zasad.",
      },
      {
        Icon: FileText,
        title: "Zasady są spisane i poprawiane",
        text: "Ustalenia nie zostają w głowie ani w notatkach ze spotkania. Spisujemy je i korygujemy, gdy firma się zmienia.",
      },
      {
        Icon: Repeat,
        title: "Firma korzysta z nich bez nas",
        text: "Celem jest sposób działania, którego używacie dalej samodzielnie, a nie stała zależność od doradcy.",
      },
    ],
  },
];

/**
 * „Co się wydarzy podczas współpracy?”: what the owner will actually see
 * happen - at the meetings, between them and in the firm - as three tabs over
 * one panel. Every view is in the page; the tabs only choose which one shows,
 * and once the script runs the new one slides in from the side it was picked on.
 */
export default function CollaborationViews() {
  const [active, setActive] = useState(0);
  // Which way the last switch went, so the panel slides in from that side.
  const [direction, setDirection] = useState<"forward" | "back" | null>(null);
  const [armed, setArmed] = useState(false);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const id = useId();

  // The slide only runs once the script is there; before that the first view
  // simply sits in the page.
  useEffect(() => {
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) setArmed(true);
  }, []);

  function select(next: number) {
    if (next === active) return;

    setDirection(next > active ? "forward" : "back");
    setActive(next);
  }

  /** Arrow keys move between the views, as in any tab list. */
  function onKeyDown(event: KeyboardEvent) {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
    const edge = { Home: 0, End: VIEWS.length - 1 }[event.key];

    if (step === undefined && edge === undefined) return;

    event.preventDefault();

    const next = edge ?? (active + step! + VIEWS.length) % VIEWS.length;

    select(next);
    tabs.current[next]?.focus();
  }

  return (
    <div className={styles.shell} data-armed={armed ? "true" : undefined}>
      <div className={styles.tabs} role="tablist" aria-label="Co się wydarzy" onKeyDown={onKeyDown}>
        {VIEWS.map(({ id: view, Icon, label }, index) => (
          <button
            key={view}
            ref={(element) => {
              tabs.current[index] = element;
            }}
            type="button"
            role="tab"
            id={`${id}-tab-${view}`}
            aria-selected={index === active}
            aria-controls={`${id}-panel-${view}`}
            tabIndex={index === active ? 0 : -1}
            className={styles.tab}
            onClick={() => select(index)}
          >
            <Icon aria-hidden="true" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {VIEWS.map((view, index) => (
        <div
          key={view.id}
          role="tabpanel"
          id={`${id}-panel-${view.id}`}
          aria-labelledby={`${id}-tab-${view.id}`}
          hidden={index !== active}
          className={styles.panel}
          data-direction={index === active ? direction ?? undefined : undefined}
        >
          <p className={styles.lead}>{view.lead}</p>
          <ul className={styles.items}>
            {view.items.map(({ Icon, title, text }, item) => (
              <li key={title} className={styles.item} style={{ "--i": item } as React.CSSProperties}>
                <span className={styles.icon} aria-hidden="true">
                  <Icon />
                </span>
                <div className={styles.body}>
                  <h3 className={styles.title}>{title}</h3>
                  <p className={styles.text}>{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
