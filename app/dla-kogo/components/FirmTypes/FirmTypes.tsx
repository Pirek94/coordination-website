"use client";

import { useEffect, useRef, useState } from "react";
import { FIRM_TYPES } from "@/lib/content/firms";
import { pin, pinProgress, unpin, type Pin } from "@/lib/pin";
import FirmArt from "./FirmArt";
import styles from "./FirmTypes.module.css";

/** How much smaller each card behind the front one is. */
const STEP_SCALE = 0.045;

/** Share of each card's stretch of scroll it simply stays in front, before it goes. */
const STAY = 0.4;

/** Share of the scroll the last card keeps the front, before the deck lets go. */
const HOLD = 0.12;

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const ease = (value: number) => value * value * (3 - 2 * value);

/** A length the stylesheet sets on the track, in px (see FirmTypes.module.css). */
const length = (element: Element, name: string) =>
  parseFloat(getComputedStyle(element).getPropertyValue(name)) || 0;

/** Where the deck sticks: below the bar, with room above for the front card's cartoon. */
const stickAt = (track: Element) =>
  (length(document.documentElement, "--site-nav-height") || 70) + length(track, "--stick-gap");

/**
 * The smallest the screen gets: on phones the address bar comes and goes as
 * the page scrolls, and the deck has to fit with it showing.
 */
function smallScreenHeight() {
  const probe = document.createElement("div");

  probe.style.cssText = "position:fixed;top:0;height:100svh;visibility:hidden;pointer-events:none";
  document.body.append(probe);

  const height = probe.offsetHeight || window.innerHeight;

  probe.remove();

  return Math.min(height, window.innerHeight);
}

/**
 * "Jak to wygląda w różnych branżach" as a deck of flashcards on a short
 * sticky scroll. The cards lie one on another, those behind peeking out
 * below, smaller and paler. As the page moves on, the front card swings out
 * to the side, slips under the deck and ends up at its back, uncovering the
 * next. Each carries a little cartoon centred on its top edge, which plays
 * only while its card is in front.
 *
 * Phones get the deck too, a tighter one. Only where it would not fit under
 * the bar even so, or when motion is unwelcome, are the cards a plain grid.
 */
export default function FirmTypes({ intro }: { intro?: React.ReactNode }) {
  const track = useRef<HTMLDivElement>(null);
  const stick = useRef<HTMLDivElement>(null);
  const deck = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLElement | null)[]>([]);
  /** A width the deck was tried at and did not fit; the grid stays until the width changes. */
  const tooTall = useRef<number | null>(null);
  const [armed, setArmed] = useState(false);
  const [still, setStill] = useState(false);
  /** Bumped on every new width, so the deck measures itself again. */
  const [attempt, setAttempt] = useState(0);

  // Whether to try the deck. Only a new width asks again: on phones the
  // height alone changes all the time as the address bar slides.
  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let width = -1;

    const check = (force = false) => {
      if (!force && window.innerWidth === width) return;

      width = window.innerWidth;
      setStill(motion.matches);
      setArmed(!motion.matches && tooTall.current !== width);
      setAttempt((value) => value + 1);
    };

    const onResize = () => check();
    const onMotion = () => check(true);

    check(true);
    window.addEventListener("resize", onResize);
    motion.addEventListener("change", onMotion);

    return () => {
      window.removeEventListener("resize", onResize);
      motion.removeEventListener("change", onMotion);
    };
  }, []);

  useEffect(() => {
    const wrapper = track.current;
    const sticky = stick.current;
    const stage = deck.current;

    if (!armed || !wrapper || !sticky || !stage) return;

    const count = FIRM_TYPES.length;
    const stepY = length(wrapper, "--step-y");
    const nav = length(document.documentElement, "--site-nav-height") || 70;
    const lowest = stickAt(wrapper);

    // Measured as a deck now: the tallest card plus the peek of those behind.
    const cardsHeight = stage.offsetHeight - (parseFloat(getComputedStyle(stage).paddingTop) || 0);

    if (cardsHeight + stepY * (count - 1) > smallScreenHeight() - lowest - 16) {
      tooTall.current = window.innerWidth;
      setArmed(false);

      return;
    }

    // The intro and the deck together where they fit, else the deck alone,
    // with room above it for the front cartoon (see lib/pin.ts).
    let pinned: Pin;

    const settle = () => {
      const pad = parseFloat(getComputedStyle(stage).paddingTop) || 0;

      pinned = pin(sticky, stage, {
        nav,
        screen: smallScreenHeight(),
        bodyTop: lowest - pad,
        below: stepY * (count - 1),
      });
    };

    // Straight from the scroll event, which browsers already send at most once
    // a frame; four cards are cheap to place.
    const update = () => {
      const progress = pinProgress(wrapper, pinned);
      // Card by card: each stays in front for a while, then goes to the back.
      const run = clamp(progress / (1 - HOLD)) * (count - 1);
      const passed = Math.min(Math.floor(run), count - 2);
      const position = passed + ease(clamp((run - passed - STAY) / (1 - STAY)));
      const width = stage.offsetWidth;

      cards.current.forEach((card, index) => {
        if (!card) return;

        const place = index - position;
        let depth: number;
        let x = 0;
        let lift = 0;
        let turn = 0;
        let layer: number;
        let front: number;

        if (place > -1 && place < 0) {
          // On its way: out to the side and up a little, under the deck past
          // halfway, and back in at the very end of it.
          const way = -place;
          const arc = Math.sin(Math.PI * way);

          depth = way * (count - 1);
          x = arc * width * 0.56;
          lift = arc * 46;
          turn = arc * 7;
          layer = way < 0.5 ? 200 : 1;
          front = clamp(1 - way * 2.5);
        } else {
          depth = place >= 0 ? place : count + place;
          layer = 100 - Math.round(depth * 10);
          front = clamp(1 - depth * 1.5);
        }

        card.style.transform =
          `translate(${x.toFixed(1)}px, ${(depth * stepY - lift).toFixed(1)}px) ` +
          `rotate(${turn.toFixed(2)}deg) scale(${(1 - depth * STEP_SCALE).toFixed(4)})`;
        card.style.zIndex = String(layer);
        card.style.setProperty("--front", front.toFixed(3));
        card.style.setProperty("--depth", Math.min(depth, count - 1).toFixed(3));
        card.toggleAttribute("data-play", front > 0.5);
        card.toggleAttribute("inert", front < 0.5);
      });
    };

    const onResize = () => {
      settle();
      update();
    };

    onResize();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", onResize);
      unpin(sticky, stage);

      cards.current.forEach((card) => {
        if (!card) return;

        card.style.removeProperty("transform");
        card.style.removeProperty("z-index");
        card.style.removeProperty("--front");
        card.style.removeProperty("--depth");
        card.removeAttribute("data-play");
        card.removeAttribute("inert");
      });
    };
  }, [armed, attempt]);

  return (
    <div
      ref={track}
      className={styles.track}
      data-armed={armed || undefined}
      style={{ "--cards": FIRM_TYPES.length } as React.CSSProperties}
    >
      <div ref={stick} className={styles.stage}>
        {intro}

        <div ref={deck} className={styles.deck}>
          {FIRM_TYPES.map((firm, index) => (
            <article
              key={firm.id}
              ref={(element) => {
                cards.current[index] = element;
              }}
              className={styles.card}
              // In the grid every cartoon plays; in the deck only the front one.
              data-play={!armed && !still ? "true" : undefined}
            >
              <div className={styles.badge}>
                <FirmArt id={firm.id} />
              </div>

              <h3 className={styles.title}>{firm.title}</h3>

              <p className={styles.symptom}>{firm.symptom}</p>

              <p className={styles.description}>{firm.description}</p>
            </article>
          ))}
        </div>
      </div>

      {/* The scroll the deck stays put through. A sticky element only moves
          within its parent's content, so this is an element, not padding. */}
      <div className={styles.runway} aria-hidden="true" />
    </div>
  );
}
