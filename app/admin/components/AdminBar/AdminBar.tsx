"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import type { FaqCounts } from "@/lib/faq/types";
import { useAdmin } from "../AdminAuth/AdminAuth";
import styles from "./AdminBar.module.css";

type Props = {
  section: "posts" | "faq";
  /**
   * Questions waiting for an answer, from a page that loads them anyway;
   * null while it does. Left out, the bar asks for the number itself.
   */
  waiting?: number | null;
  /** Lets a page with unsaved changes stop the user leaving through the bar. */
  onLeave?: (event: React.MouseEvent) => void;
};

/** The panel's top bar: its sections, and logging out. */
export default function AdminBar({ section, waiting, onLeave }: Props) {
  const { api, logout } = useAdmin();
  const [fetched, setFetched] = useState<number | null>(null);
  const own = waiting === undefined;

  useEffect(() => {
    if (!own) return;

    api<{ counts: FaqCounts }>("/api/admin/faq/counts")
      .then(({ counts }) => setFetched(counts.new))
      .catch(() => {});
  }, [api, own]);

  const count = own ? fetched : waiting;

  return (
    <header className={styles.bar}>
      <div className={styles.inner}>
        <Link href="/admin" className={styles.brand} onClick={onLeave}>
          <img src="/assets/logo.svg" alt="" width={28} height={28} />
          <span className={styles.brandName}>
            Coordination
            <span className={styles.brandTag}>admin</span>
          </span>
        </Link>

        <nav className={styles.nav} aria-label="Sekcje panelu">
          <Link
            href="/admin"
            className={styles.link}
            aria-current={section === "posts" ? "page" : undefined}
            onClick={onLeave}
          >
            Wpisy
          </Link>
          <Link
            href="/admin/faq"
            className={styles.link}
            aria-current={section === "faq" ? "page" : undefined}
            onClick={onLeave}
          >
            FAQ
            {count ? (
              <span className={styles.badge} title="Pytania do odpowiedzi">
                {count}
                <span className={styles.visuallyHidden}> do odpowiedzi</span>
              </span>
            ) : null}
          </Link>
        </nav>

        <button className={styles.ghost} type="button" onClick={logout} aria-label="Wyloguj">
          <LogOut size={16} aria-hidden="true" />
          <span className={styles.logoutLabel} aria-hidden="true">
            Wyloguj
          </span>
        </button>
      </div>
    </header>
  );
}
