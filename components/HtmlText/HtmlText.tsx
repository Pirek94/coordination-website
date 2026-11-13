import styles from "./HtmlText.module.css";

type Props = {
  html: string;
  /** "compact" for text inside something else, e.g. an FAQ answer. */
  size?: "article" | "compact";
  id?: string;
};

/**
 * HTML written in the panel's editor: a post's text block or an FAQ answer.
 * Only an admin can save it, so it is rendered as it is.
 */
export default function HtmlText({ html, size = "article", id }: Props) {
  if (!html) return null;

  return (
    <div
      id={id}
      className={styles.text}
      data-size={size === "compact" ? "compact" : undefined}
      dangerouslySetInnerHTML={{ __html: prepare(html) }}
    />
  );
}

/** Wide tables scroll sideways instead of stretching the page; new-tab links get rel="noopener". */
function prepare(html: string) {
  return html
    .replace(/<table/g, `<div class="${styles.tableWrap}"><table`)
    .replace(/<\/table>/g, "</table></div>")
    .replace(/<a ([^>]*target="_blank"[^>]*)>/g, (tag, attributes: string) =>
      attributes.includes("rel=") ? tag : `<a ${attributes} rel="noopener noreferrer">`,
    );
}
