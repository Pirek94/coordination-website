"use client";

import { useState } from "react";
import {
  Check,
  Handshake,
  Info,
  PencilRuler,
  RefreshCw,
  Rocket,
  Scale,
  ScanSearch,
} from "lucide-react";
import CtaButton from "@/components/CtaButton/CtaButton";
import MailModal from "@/components/MailModal/MailModal";
import SectionIntro from "@/components/SectionIntro/SectionIntro";
import styles from "./Pricing.module.css";

/** The mail each stage opens with, so nobody starts from a blank page. */
const draftFor = (stage: string) =>
  `Cześć, interesuje mnie ${stage}. Chciałbym porozmawiać o mojej firmie i ustalić, od czego zacząć. Do usłyszenia.`;

/**
 * One path in three stages: a paid diagnosis, a 90-day sprint whose scope
 * comes out of it, and an optional ongoing cooperation. Each card is one stage,
 * with its price and what the firm has at the end of it.
 */
const stages = [
  {
    Icon: ScanSearch,
    tag: "Etap 1",
    title: "Diagnoza Zarządcza",
    mail: "Diagnoza Zarządcza",
    lead: "Poznajemy Twoją firmę i ustalamy priorytety.",
    amount: "500",
    suffix: "netto za cały etap · zazwyczaj 2–3 spotkania",
    benefits: [
      "Uporządkowany obraz obecnej sytuacji firmy",
      "Zidentyfikowane problemy i zależności między nimi",
      "Najważniejsze priorytety i rekomendowany kierunek działań",
      "Podstawa do określenia zakresu Sprintu",
    ],
  },
  {
    Icon: Rocket,
    tag: "Etap 2",
    title: "90-dniowy Sprint Systemowy",
    mail: "90-dniowy Sprint Systemowy",
    lead: "Projektujemy i wdrażamy wybrane zmiany.",
    amount: "6 000",
    suffix: "netto za cały 90-dniowy proces",
    benefits: [
      "Dni 1–30: kierunek, priorytety i projekt zmian",
      "Dni 31–60: zasady, procesy i wdrożenie w codziennej pracy",
      "Dni 61–90: sprawdzenie w praktyce i korekty",
      "Zakres i rezultat ustalone po diagnozie, dla wybranych obszarów",
    ],
  },
  {
    Icon: Handshake,
    tag: "Etap 3",
    optional: true,
    title: "Stała współpraca zarządcza",
    mail: "stała współpraca zarządcza",
    lead: "Wracamy do wyników, priorytetów i kolejnych decyzji.",
    amount: "3 100–4 800",
    suffix: "netto miesięcznie · zakres ustalany indywidualnie",
    benefits: [
      "Regularna analiza sytuacji i wyników firmy",
      "Wsparcie przy decyzjach strategicznych i zarządczych",
      "Koordynacja i kontrola postępów ustalonych wdrożeń",
      "Strategia dostosowywana do zmieniającej się sytuacji",
    ],
  },
] as const;

/** Why the work starts with a diagnosis rather than a monthly retainer. */
const reasons = [
  {
    Icon: ScanSearch,
    text: "Diagnoza ogranicza ryzyko pracy nad niewłaściwym problemem",
  },
  {
    Icon: PencilRuler,
    text: "Sprint pozwala sprawdzić sposób pracy na konkretnych zmianach",
  },
  {
    Icon: RefreshCw,
    text: "Dopiero po nim wiadomo, czy stała współpraca wnosi dalszą wartość",
  },
  {
    Icon: Scale,
    text: "Decyzje i odpowiedzialność za prowadzenie firmy zostają po Twojej stronie",
  },
] as const;

type CardProps = {
  stage: (typeof stages)[number];
  onAsk: () => void;
};

function PricingCard({ stage, onAsk }: CardProps) {
  const { Icon, tag, title, lead, amount, suffix, benefits } = stage;
  const optional = "optional" in stage && stage.optional;

  return (
    <article className={styles.card}>
      {/* Positioned, so it sits outside the card's subgrid rows. */}
      <span className={styles.decor} aria-hidden="true">
        <Icon
          className={styles.watermark}
          size={168}
          strokeWidth={1.25}
          absoluteStrokeWidth
        />
      </span>

      <header className={styles.head}>
        <div className={styles.icon}>
          <Icon aria-hidden="true" />
        </div>
        <div className={styles.titles}>
          <p className={styles.tag}>
            {tag}
            {optional && <span className={styles.optional}>opcjonalnie</span>}
          </p>
          <h3>{title}</h3>
          <p className={styles.lead}>{lead}</p>
        </div>
      </header>

      <div className={styles.price}>
        <p
          className={`${styles.amount}${amount.length > 6 ? ` ${styles.amountLong}` : ""}`}
        >
          <strong>{amount}</strong>
          <span className={styles.currency}>zł</span>
        </p>
        <span className={styles.suffix}>{suffix}</span>
      </div>

      <ul className={styles.benefits}>
        {benefits.map((benefit) => (
          <li key={benefit}>
            <span className={styles.tick}>
              <Check aria-hidden="true" />
            </span>
            <span>{benefit}</span>
          </li>
        ))}
      </ul>

      <div className={styles.ask}>
        <CtaButton onClick={onAsk}>Porozmawiajmy</CtaButton>
      </div>
    </article>
  );
}

export default function Pricing() {
  /** The stage whose mail is open, or null while the modal is closed. */
  const [asking, setAsking] = useState<(typeof stages)[number] | null>(null);

  return (
    <section className={styles.pricing} id="cennik">
      <div className={styles.intro}>
        <SectionIntro title="Jedna droga. Trzy etapy.">
          Nie wybierasz pakietu z katalogu. Zaczynamy od zrozumienia sytuacji
          firmy, potem projektujemy i wdrażamy wybrane zmiany, a dopiero
          później decydujemy, czy dalsza współpraca ma sens.
        </SectionIntro>
      </div>

      <div className={styles.cards}>
        {stages.map((stage) => (
          <PricingCard
            key={stage.title}
            stage={stage}
            onAsk={() => setAsking(stage)}
          />
        ))}
      </div>

      <div className={styles.tail}>
        <div className={styles.shared}>
          <span className={styles.halo} aria-hidden="true" />
          <h3>
            Dlaczego nie zaczynamy{" "}
            <span>od miesięcznego abonamentu?</span>
          </h3>
          <ul>
            {reasons.map(({ Icon, text }) => (
              <li key={text}>
                <span className={styles.sharedIcon}>
                  <Icon aria-hidden="true" />
                </span>
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className={styles.note}>
          <Info aria-hidden="true" />
          <span>
            Pierwsza rozmowa jest bezpłatna i służy poznaniu sytuacji firmy oraz
            sprawdzeniu dopasowania. Diagnoza Zarządcza jest samodzielną, płatną
            usługą i nie zobowiązuje do dalszej współpracy. Zakres Sprintu
            ustalamy po diagnozie, a stała współpraca jest opcjonalna i nie
            przedłuża się automatycznie po Sprincie.
          </span>
        </p>
      </div>

      {asking && (
        <MailModal
          draft={draftFor(asking.mail)}
          title={`Napisz do nas - ${asking.title}`}
          onClose={() => setAsking(null)}
        />
      )}
    </section>
  );
}
