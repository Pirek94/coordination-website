import styles from "./FeatureCards.module.css";

export type FeatureCard = {
  /** Makes the card a link target (/wsparcie#offer). */
  id?: string;
  title: string;
  description: string;
};

/**
 * A grid of plain cards - title over a paragraph - used by the content subpages
 * (społeczność, podcast) for their "dla kogo" and "o czym" sections, and by
 * /wsparcie for its areas. Anything passed as children closes the grid as its
 * last item.
 */
export default function FeatureCards({
  cards,
  columns = 3,
  variant = "grid",
  children,
}: {
  cards: readonly FeatureCard[];
  columns?: 2 | 3;
  variant?: "grid" | "stacked";
  children?: React.ReactNode;
}) {
  return (
    <div
      className={styles.cards}
      data-columns={columns}
      data-variant={variant}
    >
      {cards.map((card) => (
        <article key={card.title} id={card.id} className={styles.card}>
          <h3 className={styles.title}>{card.title}</h3>
          <p className={styles.description}>{card.description}</p>
        </article>
      ))}
      {children}
    </div>
  );
}
