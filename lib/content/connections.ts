import type { ComponentType } from "react";
import { Compass, Megaphone, PiggyBank, Target, UsersRound, Workflow, type LucideProps } from "lucide-react";
import type { SupportAreaId } from "@/lib/content/support";

/**
 * „Jak łączymy poszczególne obszary?” at /wsparcie: the fourteen support
 * areas gathered into six parts of the firm, and for each part a few
 * decisions taken there followed through to where they show up. The lines of
 * the diagram are drawn from these chains, so every line stands for something
 * a chain says.
 */
export type ClusterId = "direction" | "clients" | "money" | "delivery" | "team" | "selling";

export type ChainStep = {
  cluster: ClusterId;
  text: string;
};

export type Cluster = {
  id: ClusterId;
  Icon: ComponentType<LucideProps>;
  label: string;
  summary: string;
  areas: readonly SupportAreaId[];
  /** Each starts here and runs through the parts the decision reaches. */
  chains: readonly (readonly ChainStep[])[];
};

/** Clockwise from the top of the ring. */
export const CLUSTERS: readonly Cluster[] = [
  {
    id: "direction",
    Icon: Compass,
    label: "Kierunek i strategia",
    summary: "Tu zapada decyzja, w którą stronę firma idzie, czego świadomie nie robi i jak często to sprawdza.",
    areas: ["strategy", "rhythm", "change"],
    chains: [
      [
        { cluster: "direction", text: "Wybierasz, na jakich klientach firma ma rosnąć" },
        { cluster: "clients", text: "inne zapytania stają się priorytetem" },
        { cluster: "selling", text: "sprzedaż i marketing szukają ich w innych miejscach" },
      ],
      [
        { cluster: "direction", text: "Rezygnujesz z działań pobocznych" },
        { cluster: "delivery", text: "realizacja przestaje dzielić uwagę na wszystko naraz" },
        { cluster: "team", text: "zespół wie, czym się nie zajmować" },
      ],
      [
        { cluster: "direction", text: "Ustalasz stały rytm przeglądu decyzji" },
        { cluster: "money", text: "wynik sprawdzasz na faktach, a nie na przeczuciu" },
      ],
    ],
  },
  {
    id: "clients",
    Icon: Target,
    label: "Klienci i oferta",
    summary: "Komu firma sprzedaje, co dokładnie proponuje i których zleceń nie bierze.",
    areas: ["clients", "offer"],
    chains: [
      [
        { cluster: "clients", text: "Zawężasz ofertę do tego, w czym firma jest najlepsza" },
        { cluster: "selling", text: "sprzedaż ma mocniejszy argument niż cena" },
        { cluster: "money", text: "rabat przestaje być domyślną odpowiedzią" },
      ],
      [
        { cluster: "clients", text: "Odmawiasz zleceń spoza kryteriów" },
        { cluster: "delivery", text: "realizacja dostaje mniej nietypowych zadań" },
        { cluster: "money", text: "marża przestaje znikać w poprawkach" },
      ],
    ],
  },
  {
    id: "money",
    Icon: PiggyBank,
    label: "Ceny i marża",
    summary: "Na czym firma naprawdę zarabia, jak wycenia pracę i gdzie kończy się pole do negocjacji.",
    areas: ["model", "pricing"],
    chains: [
      [
        { cluster: "money", text: "Zmieniasz cenę" },
        { cluster: "clients", text: "trafia do Ciebie inny klient" },
        { cluster: "delivery", text: "realizacja ma inne obciążenie" },
      ],
      [
        { cluster: "money", text: "Liczysz marżę przed przyjęciem zlecenia" },
        { cluster: "selling", text: "handlowiec wie, do jakiej kwoty może negocjować" },
      ],
      [
        { cluster: "money", text: "Widzisz, które zlecenia budują wynik" },
        { cluster: "direction", text: "łatwiej zdecydować, w co firma ma inwestować" },
      ],
    ],
  },
  {
    id: "delivery",
    Icon: Workflow,
    label: "Realizacja i procesy",
    summary: "Jak firma dowozi to, co sprzedała - kroki, przekazania, narzędzia i terminy.",
    areas: ["processes", "alignment", "technology"],
    chains: [
      [
        { cluster: "delivery", text: "Ustalasz realne terminy i moce przerobowe" },
        { cluster: "selling", text: "sprzedaż obiecuje to, co da się dowieźć" },
        { cluster: "clients", text: "klient dostaje to, co usłyszał" },
      ],
      [
        { cluster: "delivery", text: "Spisujecie powtarzalne kroki realizacji" },
        { cluster: "team", text: "nowa osoba nie musi pytać właściciela o wszystko" },
      ],
      [
        { cluster: "delivery", text: "Dobierasz narzędzie do uporządkowanego procesu" },
        { cluster: "money", text: "mniej czasu idzie na pracę, za którą nikt nie płaci" },
      ],
    ],
  },
  {
    id: "team",
    Icon: UsersRound,
    label: "Właściciel, role i zespół",
    summary: "Kto za co odpowiada, które decyzje podejmuje zespół, a które zostają przy Tobie.",
    areas: ["owner", "structure"],
    chains: [
      [
        { cluster: "team", text: "Przekazujesz decyzje według jasnych kryteriów" },
        { cluster: "delivery", text: "sprawy nie stoją, czekając na Twoją zgodę" },
        { cluster: "direction", text: "masz czas na decyzje o kierunku firmy" },
      ],
      [
        { cluster: "team", text: "Ustalasz, kto odpowiada za wyceny" },
        { cluster: "money", text: "każda wycena powstaje według tych samych zasad" },
        { cluster: "selling", text: "klient nie czeka, aż znajdziesz chwilę" },
      ],
    ],
  },
  {
    id: "selling",
    Icon: Megaphone,
    label: "Sprzedaż i marketing",
    summary: "Skąd biorą się zapytania, jak firma o sobie mówi i jak prowadzi rozmowę z klientem.",
    areas: ["sales", "marketing"],
    chains: [
      [
        { cluster: "selling", text: "Marketing mówi do konkretnego klienta" },
        { cluster: "clients", text: "przychodzą lepiej dopasowane zapytania" },
        { cluster: "delivery", text: "realizacja dostaje zlecenia, które umie dobrze obsłużyć" },
      ],
      [
        { cluster: "selling", text: "Wprowadzasz kwalifikację zapytań" },
        { cluster: "team", text: "mniej rozmów wymaga udziału właściciela" },
      ],
      [
        { cluster: "selling", text: "Ustalasz, jakich rabatów może udzielać sprzedaż" },
        { cluster: "money", text: "marża nie zależy od tego, kto prowadził rozmowę" },
      ],
    ],
  },
];
