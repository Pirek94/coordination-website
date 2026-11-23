/**
 * „Kiedy nie jesteśmy właściwym wyborem” at /dla-kogo: the situations we are
 * not the answer to, and where we send the owner instead.
 */
export type Redirection = {
  id: string;
  /** The situation that is not a fit. */
  situation: string;
  /** Where Coordination sends the owner instead. */
  redirect: string;
};

export const REDIRECTIONS: readonly Redirection[] = [
  {
    id: "marketing",
    situation: "Szukasz głównie wykonawcy kampanii reklamowej, nowej strony lub pozycjonowania",
    redirect: "Potrzebujesz agencji marketingowej, nie doradztwa strategicznego.",
  },
  {
    id: "finance",
    situation: "Potrzebujesz wsparcia finansowego, kredytu lub restrukturyzacji długów",
    redirect: "To problem finansowy, nie strategiczny - potrzebujesz doradcy finansowego.",
  },
  {
    id: "interim",
    situation: "Szukasz zewnętrznego dyrektora, który weźmie operacje na siebie",
    redirect: "Świadomie tego nie robimy - nie przejmujemy firmy od właściciela.",
  },
  {
    id: "early",
    situation: "Twoja firma nie ma jeszcze powtarzalnych przychodów i stałych klientów",
    redirect: "To inny etap rozwoju, który wymaga innego rodzaju wsparcia.",
  },
];

/** The line that closes the section. */
export const REDIRECTIONS_NOTE =
  "Jeśli któryś z tych punktów lepiej opisuje Twoją sytuację, wciąż chętnie porozmawiamy - żeby pomóc Ci trafić do właściwego miejsca, nawet jeśli nie jest nim Coordination.";
