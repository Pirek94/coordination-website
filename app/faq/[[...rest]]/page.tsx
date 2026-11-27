import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowDown, MessageCircleQuestion } from "lucide-react";
import SubpageHeader from "@/components/SubpageHeader/SubpageHeader";
import FaqForm from "@/components/FaqForm/FaqForm";
import FaqBrowser from "@/components/FaqBrowser/FaqBrowser";
import CtaButton from "@/components/CtaButton/CtaButton";
import Footer from "@/components/Footer/Footer";
import SiteNav from "@/components/SiteNav/SiteNav";
import { htmlToText } from "@/lib/blog/content";
import { listPublishedFaq } from "@/lib/faq/questions";
import { baseOpenGraph, siteUrl } from "@/lib/site";
import styles from "./faq.module.css";

// The answers come from the database, which the build cannot read, so the
// page is rendered on its first visit and then served from the page cache
// until publishing in /admin/faq marks it stale (lib/faq/cache.ts), as
// /wiedza is. Only /faq itself is a page: the catch-all exists for that and
// nothing else.
export function generateStaticParams(): { rest?: string[] }[] {
  return [];
}

const DESCRIPTION =
  "Najczęściej zadawane pytania właścicieli firm. Znajdź odpowiedzi na kluczowe problemy biznesowe lub zadaj własne pytanie całkowicie anonimowo.";

export const metadata: Metadata = {
  title: "FAQ - najczęściej zadawane pytania",
  description: DESCRIPTION,
  alternates: { canonical: "/faq" },
  openGraph: {
    ...baseOpenGraph,
    title: "FAQ - najczęściej zadawane pytania | Coordination",
    description: DESCRIPTION,
    url: "/faq",
  },
};

type Props = { params: Promise<{ rest?: string[] }> };

export default async function FaqPage({ params }: Props) {
  if ((await params).rest) notFound();

  const entries = await listPublishedFaq();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    url: `${siteUrl}/faq`,
    mainEntity: entries.map((entry) => ({
      "@type": "Question",
      name: entry.question,
      url: `${siteUrl}/faq#pytanie-${entry.id}`,
      acceptedAnswer: { "@type": "Answer", text: htmlToText(entry.answer) },
    })),
  };

  return (
    <>
      <SiteNav variant="subpage" />
      <SubpageHeader
        title="FAQ"
        lead="Najczęściej zadawane pytania przez właścicieli firm. Znajdź odpowiedzi na kluczowe problemy biznesowe lub zadaj własne pytanie całkowicie anonimowo."
        crumbs={[{ label: "Strona główna", href: "/" }, { label: "FAQ" }]}
      >
        <a className={styles.jump} href="#zadaj-pytanie">
          Zadaj pytanie anonimowo
          <ArrowDown size={16} aria-hidden="true" />
        </a>
      </SubpageHeader>

      <section className={styles.answers} aria-labelledby="odpowiedzi">
        {/* Heading on the left, questions on the right, as on the home page. */}
        <div className={styles.answersInner}>
          <div className={styles.answersIntro}>
            <h2 id="odpowiedzi" className={styles.answersTitle}>
              Odpowiedzi na pytania
            </h2>
            <p className={styles.answersLead}>
              {entries.length > 0
                ? "Odpowiadamy na pytania, które przysyłają nam właściciele firm. Każde publikujemy bez imienia i danych kontaktowych."
                : "Tu będziemy publikować odpowiedzi na pytania, które przysyłają nam właściciele firm."}
            </p>
          </div>

          <div className={styles.answersList}>
            {entries.length > 0 ? (
              <FaqBrowser entries={entries} />
            ) : (
              <div className={styles.empty}>
                <p className={styles.emptyTitle}>Pierwsze odpowiedzi pojawią się tu wkrótce</p>
                <p className={styles.emptyText}>Zadaj swoje pytanie: może będzie pierwszym, na które tu odpowiemy.</p>
                <a className={styles.emptyLink} href="#zadaj-pytanie">
                  Zadaj pytanie
                </a>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className={styles.ask} id="zadaj-pytanie" aria-labelledby="zadaj-pytanie-tytul">
        <div className={styles.inner}>
          <div className={styles.intro}>
            <h2 id="zadaj-pytanie-tytul" className={styles.title}>
              Masz pytanie? Zadaj je anonimowo
            </h2>
            <p className={styles.lead}>
              Opisz swój problem biznesowy. Przeanalizujemy go, przygotujemy szczegółową odpowiedź i opublikujemy ją na
              tej stronie.
            </p>
          </div>

          <div className={styles.formCard}>
            <div className={styles.formHeader}>
              <span className={styles.formIcon}>
                <MessageCircleQuestion aria-hidden="true" />
              </span>
              <h3 className={styles.formTitle}>Formularz anonimowego pytania</h3>
            </div>
            <FaqForm />
          </div>
        </div>
      </section>

      <section className={styles.ctaSection}>
        <div className={styles.ctaInner}>
          <h2 className={styles.ctaTitle}>Wolisz porozmawiać bezpośrednio?</h2>
          <p className={styles.ctaText}>
            Umów się na bezpłatną konsultację, podczas której porozmawiamy o Twojej firmie i sprawdzimy, czy możemy
            realnie pomóc.
          </p>
          <CtaButton href="/#kontakt">Bezpłatna konsultacja</CtaButton>
        </div>
      </section>

      <Footer />

      {entries.length > 0 && (
        <script
          type="application/ld+json"
          // "<" never closes the script tag early, whatever a question contains.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
        />
      )}
    </>
  );
}
