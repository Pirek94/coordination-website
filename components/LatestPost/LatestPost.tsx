"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PostCard from "@/components/PostCard/PostCard";
import RecencyNote from "@/components/RecencyNote/RecencyNote";
import type { PostSummary } from "@/lib/blog/types";
import { loadHomeFeed } from "@/lib/home-feed";
import styles from "./LatestPost.module.css";

/**
 * The newest blog post on the home page. The page itself is static, so the
 * browser asks for the post (lib/home-feed.ts); the section stays hidden
 * until it arrives, and while nothing is published.
 */
export default function LatestPost() {
  const [post, setPost] = useState<PostSummary | null>(null);

  useEffect(() => {
    let active = true;

    loadHomeFeed().then((feed) => {
      if (active) setPost(feed?.post ?? null);
    });

    return () => {
      active = false;
    };
  }, []);

  if (!post) return null;

  return (
    <section className={styles.section} aria-labelledby="latest-post-title">
      <div className={styles.inner}>
        <div>
          <h2 id="latest-post-title" className={styles.title}>
            Najnowszy wpis
          </h2>
          <RecencyNote date={post.publishedAt} tone="light" gap="top" />
        </div>
        <div className={styles.card}>
          <PostCard post={post} headingLevel={3} />
        </div>
        <Link className={styles.all} href="/wiedza">
          Zobacz wszystkie wpisy
        </Link>
      </div>
    </section>
  );
}
