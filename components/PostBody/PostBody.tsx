import { layoutParts, type Block, type PostContent } from "@/lib/blog/content";
import { PodcastPlayer, VideoEmbed } from "@/components/Embed/Embed";
import HtmlText from "@/components/HtmlText/HtmlText";
import styles from "./PostBody.module.css";

/**
 * A post body from the admin editor: rows of columns holding text, image,
 * YouTube and podcast blocks. Text blocks are rendered by HtmlText.
 */
export default function PostBody({ content }: { content: PostContent }) {
  let firstImage = true;

  return (
    <div className={styles.body}>
      {content.rows.map((row) => {
        const parts = layoutParts(row.layout);
        const filled = row.columns.some((column) => column.blocks.length > 0);

        if (!filled) return null;

        return (
          <div
            key={row.id}
            className={styles.row}
            style={parts.length > 1 ? { gridTemplateColumns: parts.map((part) => `minmax(0, ${part}fr)`).join(" ") } : undefined}
            data-columns={parts.length}
          >
            {row.columns.map((column) => (
              <div key={column.id} className={styles.column}>
                {column.blocks.map((block) => {
                  // Only the first picture is likely to be on screen at load.
                  const eager = block.type === "image" && firstImage;

                  if (block.type === "image") firstImage = false;

                  return <BlockView key={block.id} block={block} eager={eager} />;
                })}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

function BlockView({ block, eager }: { block: Block; eager: boolean }) {
  if (block.type === "text") {
    return <HtmlText html={block.html} />;
  }

  if (block.type === "video") return <VideoEmbed url={block.url} />;
  if (block.type === "podcast") return <PodcastPlayer spotify={block.spotify} apple={block.apple} />;

  if (!block.image) return null;

  const image = (
    <img
      className={styles.image}
      src={block.image.src}
      alt={block.image.alt}
      width={block.image.width}
      height={block.image.height}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
    />
  );

  if (!block.href) return <div className={styles.media}>{image}</div>;

  const external = /^https?:\/\//.test(block.href) && !block.href.includes("coordination.pl");

  return (
    <a className={styles.media} href={block.href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
      {image}
    </a>
  );
}
