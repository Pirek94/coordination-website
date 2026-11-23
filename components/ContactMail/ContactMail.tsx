"use client";

import { useEffect, useRef, useState } from "react";
import { Quote, Star } from "lucide-react";
import MailForm from "@/components/MailForm/MailForm";
import SectionIntro from "@/components/SectionIntro/SectionIntro";
import styles from "./ContactMail.module.css";

/** The mail arrives already written, the way a draft does; it is there to be edited. */
const DRAFT =
  "Cześć, chciałbym umówić się na bezpłatną konsultację i porozmawiać o mojej firmie. Do usłyszenia.";

export default function ContactMail() {
  const stageRef = useRef<HTMLDivElement>(null);
  const envelopeRef = useRef<HTMLDivElement>(null);

  /** The mail waits in the envelope until the reader has the envelope in view. */
  const [opened, setOpened] = useState(false);
  // The envelope is a one-shot intro prop - once it has fallen away it leaves
  // the DOM, so nothing of it can be scrolled to or painted again.
  const [envelopeGone, setEnvelopeGone] = useState(false);
  // The letter keeps growing after the envelope lands; its animation is only
  // cleared once it has finished, or it would snap back to its parked size.
  const [introDone, setIntroDone] = useState(false);

  useEffect(() => {
    const stage = stageRef.current;

    if (!stage) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        // The parked letter has to fit inside the envelope, but the envelope's
        // proportions are fixed while the letter grows taller as the screen
        // narrows - so the parked scale is solved from the real sizes. With
        // the letter and envelope center-aligned in one cell, and the parked
        // transform being translateY(14%) scale(s) about an origin 40% down
        // the letter, the letter's scaled bottom edge sits at
        // 0.04·L + 0.6·s·L below the cell's center; keeping it just above the
        // envelope's bottom edge (0.48·E) gives s.
        const letter = stage.querySelector("form");
        const envelopeHeight = envelopeRef.current?.clientHeight ?? 0;

        if (letter && envelopeHeight > 0) {
          const letterHeight = letter.offsetHeight;
          const scale =
            (0.48 * envelopeHeight - 0.04 * letterHeight) / (0.6 * letterHeight);

          stage.style.setProperty(
            "--letter-parked-scale",
            String(Math.min(0.6, Math.max(0.1, scale))),
          );

          // Opened, the flap stands its own height (--flap-depth · E) above the
          // envelope, which can reach past the stage into the testimonial
          // above it. The headroom it has is the space between the envelope
          // and the stage's top edge plus the gap up to whatever precedes the
          // stage; anything missing (and a little air) is made up by dropping
          // envelope and parked letter together. Tall phone letters leave
          // plenty of room, so there it stays 0.
          const cell = Math.max(letterHeight, envelopeHeight);
          const above = stage.previousElementSibling;
          const gap = above
            ? stage.getBoundingClientRect().top - above.getBoundingClientRect().bottom
            : 0;
          const headroom = (cell - envelopeHeight) / 2 + Math.max(0, gap);
          const envelope = envelopeRef.current?.firstElementChild;
          const flapDepth =
            (envelope &&
              parseFloat(getComputedStyle(envelope).getPropertyValue("--flap-depth")) / 100) ||
            0.54;
          const drop = Math.max(0, flapDepth * envelopeHeight + 12 - headroom);

          stage.style.setProperty("--envelope-drop", `${Math.round(drop)}px`);
        }

        setOpened(true);
        observer.disconnect();
      },
      { threshold: 0.25 },
    );

    observer.observe(stage);

    return () => observer.disconnect();
  }, []);

  const layer = (extra: string) =>
    `${styles.envelopeLayer} ${extra}${opened ? ` ${styles.playing}` : ""}`;

  return (
    <section className={styles.contact} id="kontakt">
      <div className={styles.intro}>
        <SectionIntro title="Umów się na bezpłatną konsultację">
          Pierwsza rozmowa jest bezpłatna i służy poznaniu sytuacji firmy oraz sprawdzeniu
          dopasowania. Diagnoza Zarządcza jest osobnym, płatnym etapem obejmującym zazwyczaj
          2–3 spotkania; cena całego etapu wynosi 500 zł netto.
        </SectionIntro>

        <figure className={styles.testimonial}>
          <Quote className={styles.quoteMark} aria-hidden="true" />
          <blockquote className={styles.quote}>
            Z ręką na sercu polecam usługi firmy. Szymon to niesamowicie kompetentna osoba
            z ogromną wiedzą w temacie przedsiębiorczości i rozwoju osobistego. Do klientów
            podchodzi z pełnym profesjonalizmem i zaangażowaniem. Super atmosfera, można się czuć
            swobodnie podczas konsultacji.
          </blockquote>
          <figcaption className={styles.author}>
            <span className={styles.avatar} aria-hidden="true">
              AM
            </span>
            <span className={styles.who}>
              <span className={styles.nameRow}>
                <span className={styles.authorName}>Adrian Mech</span>
                <span className={styles.stars} role="img" aria-label="Ocena 5 na 5">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} aria-hidden="true" />
                  ))}
                </span>
              </span>
              <span className={styles.authorRole}>CEO Inoveria</span>
            </span>
          </figcaption>
        </figure>
      </div>

      <MailForm
        draft={DRAFT}
        stageRef={stageRef}
        letterClassName={introDone ? undefined : opened ? styles.letter : styles.letterWaiting}
        onLetterAnimationEnd={(event) => {
          if (event.animationName.includes("letter-out")) setIntroDone(true);
        }}
      >
        {!envelopeGone && (
          <>
            {/* Behind the letter: the envelope's body, its navy lining and the
                flap's inside - which only faces the reader once it is open,
                folded back behind the letter. */}
            <div
              className={layer(styles.envelopeBack)}
              ref={envelopeRef}
              aria-hidden="true"
              onAnimationEnd={(event) => {
                if (event.animationName.includes("envelope-away")) setEnvelopeGone(true);
              }}
            >
              <div className={styles.envelope}>
                <span className={styles.body} />
                <span className={styles.flap}>
                  <span className={styles.flapInner} />
                </span>
              </div>
            </div>

            {/* In front of the letter: the pocket it slides out of, and the
                flap's outside, lying over the folds until it swings open. */}
            <div className={layer(styles.envelopeFront)} aria-hidden="true">
              <div className={styles.envelope}>
                <span className={styles.mouthShade} />
                <span className={styles.pocket} />
                <span className={styles.bottomFold} />
                <img className={styles.mark} src="/assets/logo.svg" alt="" />
                <span className={styles.flap}>
                  <span className={styles.flapOuter} />
                </span>
              </div>
            </div>
          </>
        )}
      </MailForm>
    </section>
  );
}
