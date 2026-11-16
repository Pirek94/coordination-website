import type { ComponentType } from "react";
import { Clover, Percent, RotateCcw, TrendingUp, Unlink, UserRoundArrowLeft, type LucideProps } from "lucide-react";
import type { SupportAreaId } from "@/lib/content/support";

/**
 * What owners recognise in their own firm before they call us: shown at
 * /dla-kogo, at /proces with the areas we start from, and on the home page and
 * at /wsparcie as a checklist that points to the areas we would start with.
 */
export type Situation = {
  id: string;
  Icon: ComponentType<LucideProps>;
  title: string;
  description: string;
  /**
   * The support areas that answer it, the first one most directly. Between
   * them the situations cover every area, so every chip in the HelpFinder map
   * can light up.
   */
  areas: readonly SupportAreaId[];
  /**
   * How the same thing looks once the work has landed: /dla-kogo sets it
   * against the title in „Co ma się zmienić po doradztwie?”.
   */
  after: string;
};

export const SITUATIONS: readonly Situation[] = [
  {
    id: "revenue",
    Icon: TrendingUp,
    title: "Firma rośnie przychodowo, ale nie poprawia wyniku",
    description:
      "Przyjmujesz zlecenia, które generują obrót, a nie marżę. Po miesiącu zostaje poczucie, że firma więcej pracuje, a nie więcej zarabia.",
    areas: ["model", "strategy", "clients", "pricing"],
    after:
      "Wynik rośnie razem z przychodami, bo wiesz, które zlecenia przynoszą marżę, a które tylko obrót.",
  },
  {
    id: "owner",
    Icon: UserRoundArrowLeft,
    title: "Wszystkie decyzje wracają do właściciela",
    description:
      "Firma nie ruszy bez Twojego udziału w każdym temacie. Zespół czeka na zgodę, klienci na odpowiedź, a dzień składa się z gaszenia pożarów.",
    areas: ["owner", "processes", "structure", "change"],
    after:
      "Zespół decyduje według ustalonych kryteriów, a do Ciebie trafia tylko to, co naprawdę wymaga Twojej decyzji.",
  },
  {
    id: "promises",
    Icon: Clover,
    title: "Sprzedaż obiecuje to, co realizacja ledwo dowiezie",
    description:
      "Napięcie między działami. Klient dostaje mniej niż usłyszał, realizacja pracuje pod presją, a marża znika w poprawkach i pośpiechu.",
    areas: ["alignment", "sales", "clients"],
    after:
      "Sprzedaż obiecuje to, co realizacja jest w stanie dowieźć - w terminie i bez utraty marży.",
  },
  {
    id: "silos",
    Icon: Unlink,
    title: "Marketing i sprzedaż żyją osobno",
    description:
      "Kampanie generują leady, ale niewłaściwych. Sprzedaż liczy na przypadkowe zapytania. Działania marketingowe nie wspierają realnego procesu zakupu klienta.",
    areas: ["marketing", "alignment", "clients"],
    after:
      "Marketing przyciąga klientów, których sprzedaż chce pozyskać, a firma potrafi dobrze obsłużyć.",
  },
  {
    id: "price",
    Icon: Percent,
    title: "Firma konkuruje głównie ceną",
    description:
      "Brak jasnej propozycji wartości. Rabat to domyślna odpowiedź na wątpliwości klienta, a każda rozmowa o cenie kończy się ustępstwem.",
    areas: ["offer", "pricing", "strategy"],
    after:
      "Klient wie, za co płaci, a rozmowa o cenie przestaje być negocjacją rabatu.",
  },
  {
    id: "repeat",
    Icon: RotateCcw,
    title: "Te same problemy rozwiązujesz od nowa",
    description:
      "Brak zasad. Wszystko przez indywidualne ustalenia, bieżące emocje i decyzje podejmowane od przypadku do przypadku - przy każdym nowym kliencie.",
    areas: ["processes", "rhythm", "technology"],
    after:
      "Powtarzalne sytuacje mają swoje zasady, więc kolejny podobny przypadek nie zaczyna się od zera.",
  },
];
