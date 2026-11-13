"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FileText, LoaderCircle, Plus, Search } from "lucide-react";
import { row, textBlock } from "@/lib/blog/content";
import type { Post, PostStatus, PostSummary } from "@/lib/blog/types";
import { fold } from "@/lib/fold";
import AdminBar from "../AdminBar/AdminBar";
import { useAdmin } from "../AdminAuth/AdminAuth";
import { menuPoint, type MenuPoint } from "../ContextMenu/ContextMenu";
import PostMenu from "./PostMenu";
import list from "../AdminList/AdminList.module.css";
import styles from "./PostList.module.css";

type Filter = "all" | PostStatus;

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "Wszystkie" },
  { value: "publish", label: "Opublikowane" },
  { value: "draft", label: "Szkice" },
];

const dateFormat = new Intl.DateTimeFormat("pl-PL", { day: "numeric", month: "long", year: "numeric" });

export default function PostList() {
  const { api } = useAdmin();
  const router = useRouter();
  const [posts, setPosts] = useState<PostSummary[] | null>(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [creating, setCreating] = useState(false);
  const [menu, setMenu] = useState<{ post: PostSummary; at: MenuPoint } | null>(null);
  const [renaming, setRenaming] = useState<number | null>(null);
  const opener = useRef<HTMLElement | null>(null);

  useEffect(() => {
    api<{ posts: PostSummary[] }>("/api/admin/posts")
      .then(({ posts }) => setPosts(posts))
      .catch((reason: Error) => setError(reason.message));
  }, [api]);

  const visible = useMemo(() => {
    const needle = fold(query.trim());

    return (posts ?? []).filter(
      (post) =>
        (filter === "all" || post.status === filter) &&
        (!needle || fold(`${post.title} ${post.slug} ${post.categories.join(" ")}`).includes(needle)),
    );
  }, [posts, query, filter]);

  async function createPost() {
    setCreating(true);

    try {
      const { post } = await api<{ post: Post }>("/api/admin/posts", {
        method: "POST",
        body: JSON.stringify({
          title: "Nowy wpis",
          slug: `nowy-wpis-${Date.now().toString(36)}`,
          status: "draft",
          author: "Szymon Pirko",
          content: { version: 1, rows: [row([textBlock()])] },
        }),
      });

      router.push(`/admin/posts/${post.id}`);
    } catch (reason) {
      setError((reason as Error).message);
      setCreating(false);
    }
  }

  function openMenu(event: React.MouseEvent<HTMLElement>, post: PostSummary) {
    event.preventDefault();
    opener.current = event.currentTarget;
    setMenu({ post, at: menuPoint(event) });
  }

  // Focus goes back to the row the menu came from, as with a native menu.
  const closeMenu = useCallback(() => {
    setMenu(null);
    opener.current?.focus();
  }, []);

  /** Saves some fields of a post and puts the stored version back into the list. */
  async function change(post: PostSummary, patch: Partial<Post>) {
    setError("");

    try {
      const { post: stored } = await api<{ post: Post }>(`/api/admin/posts/${post.id}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      });

      setPosts((current) => current?.map((item) => (item.id === stored.id ? { ...item, ...stored } : item)) ?? null);
    } catch (reason) {
      setError((reason as Error).message);
    }
  }

  async function remove(post: PostSummary) {
    if (!confirm(`Usunąć wpis „${post.title}”? Tego nie da się cofnąć.`)) return;

    setError("");

    try {
      await api(`/api/admin/posts/${post.id}`, { method: "DELETE" });
      setPosts((current) => current?.filter((item) => item.id !== post.id) ?? null);
    } catch (reason) {
      setError((reason as Error).message);
    }
  }

  const count = (status: Filter) =>
    status === "all" ? posts?.length ?? 0 : posts?.filter((post) => post.status === status).length ?? 0;

  return (
    <div className={list.page}>
      <AdminBar section="posts" />

      <main className={list.main}>
        <div className={list.head}>
          <div>
            <h1 className={list.title}>Wpisy na blogu</h1>
          </div>
          <button className={list.primary} type="button" onClick={createPost} disabled={creating}>
            <Plus size={18} aria-hidden="true" />
            {creating ? "Tworzenie…" : "Nowy wpis"}
          </button>
        </div>

        <div className={list.tools}>
          <div className={list.filters} role="tablist" aria-label="Status wpisów">
            {FILTERS.map((item) => (
              <button
                key={item.value}
                type="button"
                role="tab"
                aria-selected={filter === item.value}
                className={list.filter}
                onClick={() => setFilter(item.value)}
              >
                {item.label}
                <span className={list.count}>{count(item.value)}</span>
              </button>
            ))}
          </div>
          <label className={list.search}>
            <Search size={16} aria-hidden="true" />
            <input
              type="search"
              placeholder="Szukaj po tytule, adresie lub kategorii"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="Szukaj wpisów"
            />
          </label>
        </div>

        {error && (
          <p className={list.error} role="alert">
            {error}
          </p>
        )}

        {posts === null && !error ? (
          <div className={list.empty}>
            <LoaderCircle className={list.spinner} aria-hidden="true" />
            Wczytywanie wpisów…
          </div>
        ) : visible.length === 0 ? (
          <div className={list.empty}>
            <FileText size={28} aria-hidden="true" />
            {posts?.length ? "Żaden wpis nie pasuje do wyszukiwania." : "Nie ma jeszcze żadnych wpisów."}
          </div>
        ) : (
          <ul className={list.list}>
            {visible.map((post) => {
              const parts = (
                <>
                  <span className={styles.thumb}>
                    {post.cover ? <img src={post.cover.src} alt="" loading="lazy" /> : <FileText size={20} aria-hidden="true" />}
                  </span>
                  <span className={list.body}>
                    {renaming === post.id ? (
                      <RenameField
                        title={post.title}
                        onDone={(title) => {
                          setRenaming(null);
                          if (title && title !== post.title) change(post, { title });
                        }}
                      />
                    ) : (
                      <span className={list.itemTitle}>{post.title}</span>
                    )}
                    <span className={list.meta}>
                      /{post.slug}
                      {post.categories.length > 0 && <> · {post.categories.join(", ")}</>}
                    </span>
                  </span>
                  <span className={list.side}>
                    <span className={post.status === "publish" ? list.published : list.draft}>
                      {post.status === "publish" ? "Opublikowany" : "Szkic"}
                    </span>
                    {post.publishedAt && <time dateTime={post.publishedAt}>{dateFormat.format(new Date(post.publishedAt))}</time>}
                  </span>
                </>
              );

              return (
                <li key={post.id}>
                  {renaming === post.id ? (
                    <div className={list.item} data-active>
                      {parts}
                    </div>
                  ) : (
                    <Link
                      href={`/admin/posts/${post.id}`}
                      className={list.item}
                      data-active={menu?.post.id === post.id || undefined}
                      onContextMenu={(event) => openMenu(event, post)}
                    >
                      {parts}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </main>

      {menu && (
        <PostMenu
          post={menu.post}
          at={menu.at}
          onClose={closeMenu}
          onOpen={() => router.push(`/admin/posts/${menu.post.id}`)}
          onRename={() => setRenaming(menu.post.id)}
          onToggleStatus={() => change(menu.post, { status: menu.post.status === "publish" ? "draft" : "publish" })}
          onDelete={() => remove(menu.post)}
        />
      )}
    </div>
  );
}

/** The title turned into a text field; Enter or leaving it saves, Escape cancels. */
function RenameField({ title, onDone }: { title: string; onDone: (title: string | null) => void }) {
  const [value, setValue] = useState(title);
  const done = useRef(false);

  const finish = (result: string | null) => {
    if (done.current) return;
    done.current = true;
    onDone(result);
  };

  return (
    <input
      className={styles.renameInput}
      aria-label="Nowy tytuł wpisu"
      autoFocus
      value={value}
      onFocus={(event) => event.currentTarget.select()}
      onChange={(event) => setValue(event.target.value)}
      onBlur={() => finish(value.trim())}
      onKeyDown={(event) => {
        if (event.key === "Enter") finish(value.trim());
        if (event.key === "Escape") finish(null);
      }}
    />
  );
}
