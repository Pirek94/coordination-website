import type { Metadata } from "next";
import { ArrowDown } from "lucide-react";
import SubpageHeader from "@/components/SubpageHeader/SubpageHeader";
import SectionIntro from "@/components/SectionIntro/SectionIntro";
import FeatureCards from "@/components/FeatureCards/FeatureCards";
import HelpFinder from "@/components/HelpFinder/HelpFinder";
import AfterChange from "@/components/AfterChange/AfterChange";
import CtaButton from "@/components/CtaButton/CtaButton";
import Footer from "@/components/Footer/Footer";
import SiteNav from "@/components/SiteNav/SiteNav";
import { SUPPORT_AREAS } from "@/lib/content/support";
import ConnectionMap from "./components/ConnectionMap/ConnectionMap";
import styles from "./wsparcie.module.css";

export const metadata: Metadata = {
  title: "Obszary wsparcia",
  description:
    "W czym pomagamy właścicielom małych firm - strategia, model biznesowy, dobór klientów, oferta, ceny i marże, sprzedaż, marketing, role i odpowiedzialność, procesy, technologia i zarządzanie zmianą.",
  alternates: { canonical: "/wsparcie" },
};

const areas = SUPPORT_AREAS;

/** The self-check further down; the areas grid ends with a way into it. */
const FINDER_ID = "z-czym-przyjsc";

export default function WsparciePage() {
  return (
    <>
      <SiteNav variant="subpage" />
      <SubpageHeader
        title="Obszary wsparcia"
        lead="Pomagamy uporządkować firmę jako system powiązanych decyzji."
        crumbs={[{ label: "Strona główna", href: "/" }, { label: "Obszary wsparcia" }]}
      />

      <section className={styles.leadSection}>
        <div className={styles.container}>
          <p className={styles.leadText}>
            Pomagamy uporządkować firmę jako system powiązanych decyzji. Pracujemy nad tym, komu firma sprzedaje, na czym naprawdę zarabia, jak wygląda oferta, jak działa sprzedaż i marketing oraz które decyzje powinny przestać wracać za każdym razem do właściciela.
          </p>
        </div>
      </section>

      <section className={styles.areasSection}>
        <div className={styles.container}>
          <div className={styles.intro}>
            <SectionIntro title="W czym pomagamy właścicielom małych firm" />
          </div>
          <FeatureCards cards={areas} columns={3}>
            <aside className={styles.startCard}>
              <h3 className={styles.startTitle}>Nie wiesz, od czego zacząć?</h3>
              <p className={styles.startText}>
                Zaznacz, co dziś najbardziej uwiera Cię w firmie. Wskażemy obszar, od którego warto zacząć.
              </p>
              <a className={styles.startLink} href={`#${FINDER_ID}`}>
                Sprawdź, od czego zacząć
                <ArrowDown aria-hidden="true" />
              </a>
            </aside>
          </FeatureCards>
        </div>
      </section>

      <section className={styles.connectionsSection}>
        <div className={styles.container}>
          <div className={styles.intro}>
            <SectionIntro title="Jak łączymy poszczególne obszary?">
              Decyzja w jednej części firmy prawie nigdy nie zostaje w niej sama. Wybierz część firmy i zobacz, gdzie dalej widać skutki decyzji, które w niej zapadają.
            </SectionIntro>
          </div>
          <ConnectionMap />
        </div>
      </section>

      <HelpFinder
        id={FINDER_ID}
        title="Z jakimi problemami możesz się do nas zgłosić?"
        intro="Zaznacz sytuacje, które znasz ze swojej firmy. Podświetlimy obszary, które za nie odpowiadają, i ten, od którego zaczęlibyśmy pracę."
        areaAnchors
      />

      <section className={styles.afterSection}>
        <div className={styles.container}>
          <div className={styles.intro}>
            <SectionIntro title="Co konkretnie zmienia się w firmie?">
              Praca w poszczególnych obszarach ma jeden cel: żeby firma na co dzień działała inaczej niż dziś. Tak wyglądają te same sytuacje, kiedy zasady zaczynają działać.
            </SectionIntro>
          </div>
          <AfterChange />
        </div>
      </section>

      <section className={styles.ctaSection}>
        <div className={styles.ctaInner}>
          <h2 className={styles.ctaTitle}>Czas porozmawiać o Twojej firmie</h2>
          <p className={styles.ctaText}>
            Ta rozmowa to Twój pierwszy krok do uporządkowania strategii, sprzedaży i marketingu w jeden spójny system.
          </p>
          <CtaButton href="/#kontakt">Bezpłatna konsultacja</CtaButton>
        </div>
      </section>

      <Footer />
    </>
  );
}
