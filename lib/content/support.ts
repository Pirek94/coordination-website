/**
 * The areas we work on in a company: listed in full at /wsparcie, and matched
 * against what a visitor recognises in their own firm (the HelpFinder on the
 * home page and at /wsparcie, the situations at /proces). Ordered from
 * direction, through clients, money and selling, to how the firm is run.
 */

export type SupportAreaId =
  | "strategy"
  | "model"
  | "clients"
  | "offer"
  | "pricing"
  | "sales"
  | "marketing"
  | "alignment"
  | "owner"
  | "structure"
  | "processes"
  | "technology"
  | "rhythm"
  | "change";

export type SupportArea = {
  id: SupportAreaId;
  title: string;
  /** A few words for a chip, where the title is too long. */
  short: string;
  description: string;
};

export const SUPPORT_AREAS: readonly SupportArea[] = [
  {
    id: "strategy",
    title: "Strategia firmy i kierunek rozwoju",
    short: "Strategia i kierunek",
    description:
      "Porządkujemy kierunek działania firmy, priorytety i decyzje, które mają największy wpływ na wynik. Strategia nie zostaje dokumentem, tylko staje się filtrem do codziennych wyborów właściciela i zespołu.",
  },
  {
    id: "model",
    title: "Model biznesowy i rentowność",
    short: "Model biznesowy i rentowność",
    description:
      "Sprawdzamy, na czym firma naprawdę zarabia, które zlecenia i klienci budują wynik, a które tylko generują obrót, chaos i przeciążenie. Dzięki temu łatwiej podejmować decyzje o ofercie, cenach i kierunku rozwoju.",
  },
  {
    id: "clients",
    title: "Dobór klientów i rentowność zleceń",
    short: "Dobór klientów",
    description:
      "Ustalamy, z jakimi klientami firma chce pracować i po czym poznać zlecenie, które się nie opłaci, zanim trafi do realizacji. Dzięki jasnym kryteriom firma przestaje brać wszystko, co się pojawi, tylko dlatego, że daje obrót.",
  },
  {
    id: "offer",
    title: "Oferta i propozycja wartości",
    short: "Oferta i propozycja wartości",
    description:
      "Porządkujemy sposób mówienia o tym, co firma robi, dla kogo jest właściwym wyborem i dlaczego klient miałby wybrać właśnie ją. Dzięki temu sprzedaż nie opiera się wyłącznie na cenie ani przypadkowych rozmowach.",
  },
  {
    id: "pricing",
    title: "Polityka cenowa, wyceny i marże",
    short: "Ceny, wyceny i marże",
    description:
      "Porządkujemy sposób liczenia wycen, zasady udzielania rabatów i marżę, poniżej której firma nie schodzi. Dzięki temu cena wynika z policzonych kosztów i wartości dla klienta, a nie z presji w rozmowie czy z tego, ile wziął konkurent.",
  },
  {
    id: "sales",
    title: "Proces sprzedaży i pozyskiwanie klientów",
    short: "Proces sprzedaży",
    description:
      "Analizujemy lejek sprzedaży, źródła zapytań, sposób kwalifikacji klientów, argumentację i ofertowanie. Celem jest bardziej przewidywalny proces sprzedaży, a nie ciągłe liczenie na polecenia, przypadkowe zapytania lub aktywność jednego handlowca.",
  },
  {
    id: "marketing",
    title: "Marketing wspierający sprzedaż",
    short: "Marketing wspierający sprzedaż",
    description:
      "Ustawiamy komunikację, treści i stronę internetową tak, aby wspierały realny proces zakupu klienta. Marketing ma wzmacniać sprzedaż i budować zaufanie do firmy, a nie być zbiorem przypadkowych publikacji.",
  },
  {
    id: "alignment",
    title: "Współpraca sprzedaży, marketingu i realizacji",
    short: "Sprzedaż, marketing i realizacja razem",
    description:
      "Łączymy działania handlowe, marketingowe i operacyjne w jeden spójny sposób pracy. Dzięki temu firma nie obiecuje klientom rzeczy, których nie może dowieźć, a sprzedaż nie generuje problemów dla realizacji.",
  },
  {
    id: "owner",
    title: "Decyzje właścicielskie i odciążenie właściciela",
    short: "Odciążenie właściciela",
    description:
      "Pomagamy właścicielowi przestać być jedynym punktem kontroli w firmie. Ustalamy zasady podejmowania decyzji, odpowiedzialności i priorytety, dzięki którym firma może działać bardziej przewidywalnie bez ciągłego angażowania właściciela w każdy temat.",
  },
  {
    id: "structure",
    title: "Struktura firmy, role i odpowiedzialność",
    short: "Role i odpowiedzialność",
    description:
      "Ustalamy, kto za co odpowiada, kto podejmuje które decyzje i gdzie kończy się rola jednej osoby, a zaczyna drugiej. Jasna struktura sprawia, że zadania nie giną między ludźmi, a zespół nie musi zgadywać, do kogo należy dana sprawa.",
  },
  {
    id: "processes",
    title: "Procesy i organizacja pracy",
    short: "Procesy i organizacja pracy",
    description:
      "Porządkujemy sposób realizacji zleceń, przepływ informacji, odpowiedzialności i momenty decyzyjne. Chodzi nie o biurokrację, lecz o to, aby firma nie rozwiązywała tych samych problemów od nowa przy każdym kliencie.",
  },
  {
    id: "technology",
    title: "Technologia, cyfryzacja i AI",
    short: "Technologia i AI",
    description:
      "Sprawdzamy, które narzędzia, automatyzacje i rozwiązania oparte na AI realnie odciążą firmę, a które dodadzą tylko kolejny system do obsługi. Technologię dobieramy do uporządkowanego sposobu pracy - najpierw zasady, potem narzędzie.",
  },
  {
    id: "rhythm",
    title: "Planowanie, kontrola i poprawianie działania firmy",
    short: "Planowanie i kontrola",
    description:
      "Wprowadzamy prosty rytm pracy nad firmą: diagnozę sytuacji, decyzje, wdrożenie, obserwację efektów i korektę. Dzięki temu firma uczy się działać na podstawie faktów, a nie tylko intuicji i reakcji na bieżące problemy.",
  },
  {
    id: "change",
    title: "Rozwój firmy i zarządzanie zmianą",
    short: "Rozwój i zmiana",
    description:
      "Pomagamy przeprowadzić firmę przez kolejny etap rozwoju: większy zespół, nową ofertę, nowy rynek czy inny model pracy. Planujemy zmianę tak, aby zespół ją rozumiał i wdrażał, a bieżąca praca nie stawała w miejscu.",
  },
];
