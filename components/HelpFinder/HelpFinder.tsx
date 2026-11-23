"use client";

import { useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Check, TriangleAlert } from "lucide-react";
import CtaButton from "@/components/CtaButton/CtaButton";
import SectionIntro from "@/components/SectionIntro/SectionIntro";
import { SITUATIONS } from "@/lib/content/situations";
import { SUPPORT_AREAS, type SupportAreaId } from "@/lib/content/support";
import styles from "./HelpFinder.module.css";

/** From this many signals on, the firm reads as one that works, but works too hard. */
const MANY = 3;

type HelpFinderProps = {
  title?: string;
  intro?: string;
  /** The section's anchor. */
  id?: string;
  /**
   * Set where the area cards are on the same page (/wsparcie): the answer then
   * points to its own card above, and the talk to the contact form on the home
   * page.
   */
  areaAnchors?: boolean;
};

/**
 * "W czym pomagamy właścicielom małych firm" as a short self-check: the
 * visitor ticks what they recognise in their firm, the areas that answer it
 * light up, and the strongest one is shown as where we would start. On the
 * home page as is; /wsparcie gives it its own heading.
 */
export default function HelpFinder({
  title: heading = "W czym pomagamy właścicielom małych firm",
  intro = "Zaznacz to, co rozpoznajesz w swojej firmie. Pokażemy, od którego obszaru byśmy zaczęli pracę.",
  id: anchor = "obszary-wsparcia",
  areaAnchors = false,
}: HelpFinderProps) {
  // In the order they were ticked, so a tie goes to the newest one.
  const [picked, setPicked] = useState<string[]>([]);
  const id = useId();

  const scores = useMemo(() => {
    const result = new Map<SupportAreaId, number>();

    for (const situation of SITUATIONS) {
      if (!picked.includes(situation.id)) continue;

      for (const area of situation.areas) result.set(area, (result.get(area) ?? 0) + 1);
    }

    return result;
  }, [picked]);

  const top = useMemo(() => {
    if (picked.length === 0) return null;

    const latest = SITUATIONS.find((situation) => situation.id === picked[picked.length - 1])!;
    const best = Math.max(...scores.values());
    // Among the strongest, the newest signal's own areas win, its first one first.
    const id = latest.areas.find((area) => scores.get(area) === best);

    return SUPPORT_AREAS.find((area) => (id ? area.id === id : scores.get(area.id) === best))!;
  }, [picked, scores]);

  const chips = useRef(new Map<SupportAreaId, HTMLLIElement>());
  const title = useRef<HTMLHeadingElement>(null);
  const ghosts = useRef<HTMLSpanElement>(null);
  /** The starting area shown before this one, whose pill fades out as the new one lands. */
  const shown = useRef<string | null>(null);

  // When the starting area changes, its chip flies from the map to the
  // answer, where the same pill, at the same size, heads the description.
  // The pill in the answer is moved from the chip's place to its own; the
  // chip in the map dims while it is away. The answer itself is a new element
  // for every area, so the pill it had is gone at once: a copy of it, left in
  // its place, fades out under the one flying in.
  useLayoutEffect(() => {
    const before = shown.current;

    shown.current = top?.short ?? null;

    const chip = top && chips.current.get(top.id);
    const pill = title.current;
    const layer = ghosts.current;

    if (!chip || !pill || !layer || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const from = chip.getBoundingClientRect();
    const to = pill.getBoundingClientRect();
    const onScreen = (rect: DOMRect) => rect.bottom > 0 && rect.top < window.innerHeight;

    // Off screen, as under one column the map can be, there is nothing to see.
    if (!onScreen(from) || !onScreen(to)) return;

    const timing = { duration: 650, easing: "cubic-bezier(0.22, 1, 0.36, 1)" };
    const flight = pill.animate(
      [{ transform: `translate(${from.left - to.left}px, ${from.top - to.top}px)` }, { transform: "none" }],
      timing,
    );
    const away = chip.animate([{ opacity: 0.3 }, { opacity: 0.3, offset: 0.6 }, { opacity: 1 }], timing);

    // Every answer puts its pill in the same place, so the old one stood
    // where the new one lands.
    let ghost: HTMLElement | null = null;

    if (before && before !== top.short) {
      const origin = layer.getBoundingClientRect();

      ghost = pill.cloneNode(false) as HTMLElement;
      ghost.textContent = before;
      ghost.removeAttribute("id");
      ghost.className = `${pill.className} ${styles.ghost}`;
      ghost.style.left = `${to.left - origin.left}px`;
      ghost.style.top = `${to.top - origin.top}px`;
      layer.append(ghost);

      const out = ghost.animate(
        [
          { opacity: 1, transform: "none" },
          { opacity: 0, transform: "scale(0.9)" },
        ],
        { duration: 380, easing: "ease-out", fill: "forwards" },
      );

      out.onfinish = () => ghost?.remove();
    }

    return () => {
      flight.cancel();
      away.cancel();
      ghost?.remove();
    };
    // Only a new starting area flies, not every tick that keeps the same one.
  }, [top?.id]);

  const toggle = (situation: string) =>
    setPicked((current) =>
      current.includes(situation) ? current.filter((item) => item !== situation) : [...current, situation],
    );

  return (
    <section className={styles.section} id={anchor}>
      <div className={styles.inner}>
        <SectionIntro title={heading}>{intro}</SectionIntro>

        <div className={styles.board}>
          <div className={styles.check}>
            <p className={styles.question} id={`${id}-question`}>
              Co dziś najbardziej Cię uwiera?
            </p>
            <ul className={styles.signals} aria-labelledby={`${id}-question`}>
              {SITUATIONS.map(({ id: situation, Icon, title }) => {
                const on = picked.includes(situation);

                return (
                  <li key={situation}>
                    <button type="button" className={styles.signal} aria-pressed={on} onClick={() => toggle(situation)}>
                      <span className={styles.box} aria-hidden="true">
                        <Check />
                      </span>
                      <span className={styles.signalIcon} aria-hidden="true">
                        <Icon />
                      </span>
                      <span>{title}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className={styles.status}>
              <p className={styles.counter} aria-live="polite">
                {picked.length === 0 ? "Możesz zaznaczyć kilka." : `Zaznaczone: ${picked.length} z ${SITUATIONS.length}`}
              </p>
              {/* Under one column the result sits below the list, out of sight. */}
              {top && (
                <a className={styles.jump} href="#od-czego-zaczac">
                  Zobacz, od czego byśmy zaczęli
                </a>
              )}
            </div>
          </div>

          <div className={styles.result} id="od-czego-zaczac">
            <h3 className={styles.resultHeading}>Obszary, którymi się zajmujemy</h3>
            <ul className={styles.areas}>
              {SUPPORT_AREAS.map((area) => {
                const score = scores.get(area.id) ?? 0;

                return (
                  <li
                    key={area.id}
                    ref={(element) => {
                      if (element) chips.current.set(area.id, element);
                      else chips.current.delete(area.id);
                    }}
                    className={styles.area}
                    data-score={Math.min(score, 2) || undefined}
                    data-top={area.id === top?.id || undefined}
                  >
                    {area.short}
                  </li>
                );
              })}
            </ul>

            <div className={styles.verdict} aria-live="polite">
              {/* Where the outgoing pill fades; filled only by the effect above. */}
              <span ref={ghosts} className={styles.ghosts} aria-hidden="true" />
              {top ? (
                <div key={top.id} className={styles.answer}>
                  <h3 className={styles.resultHeading}>Od tego byśmy zaczęli</h3>
                  <h3 ref={title} className={styles.answerPill}>
                    {top.short}
                  </h3>
                  <p className={styles.answerText}>{top.description}</p>
                  {picked.length >= MANY && (
                    <div className={styles.note} role="note">
                      <TriangleAlert className={styles.noteIcon} aria-hidden="true" />
                      <p>
                        Kilka sygnałów naraz to typowy obraz firmy, która działa, ale działa za ciężko. Z takimi
                        firmami pracujemy najczęściej.
                      </p>
                    </div>
                  )}
                  <div className={styles.actions}>
                    <CtaButton href={areaAnchors ? "/#kontakt" : "#kontakt"}>Porozmawiajmy o tym</CtaButton>
                    {areaAnchors ? (
                      <a className={styles.more} href={`#${top.id}`}>
                        Przejdź do tego obszaru na liście
                      </a>
                    ) : (
                      <Link className={styles.more} href="/wsparcie">
                        Wszystkie obszary wsparcia
                      </Link>
                    )}
                  </div>
                </div>
              ) : (
                <p className={styles.prompt}>
                  Zaznacz po lewej sytuacje, które znasz ze swojej firmy. Podświetlimy obszary, które za nie
                  odpowiadają, i ten, od którego warto zacząć.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
