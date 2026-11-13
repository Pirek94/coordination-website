"use client";

import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import styles from "./ContextMenu.module.css";

export type MenuPoint = { x: number; y: number };

const EDGE = 8;

const CloseContext = createContext<() => void>(() => {});

/**
 * Where a menu opened from a row goes: at the pointer, or by the row for the
 * keyboard menu key, which reports no pointer position.
 */
export function menuPoint(event: React.MouseEvent<HTMLElement>): MenuPoint {
  const box = event.currentTarget.getBoundingClientRect();
  const fromKeyboard = event.clientX === 0 && event.clientY === 0;

  return fromKeyboard ? { x: box.left + 24, y: box.bottom - 8 } : { x: event.clientX, y: event.clientY };
}

type Props = {
  /** What the menu acts on, for screen readers, e.g. "Akcje wpisu „…”". */
  label: string;
  at: MenuPoint;
  onClose: () => void;
  children: React.ReactNode;
};

/**
 * The shell of a list's right-click menu: placed inside the window, arrow
 * keys between the items, closed by Escape, Tab, a click elsewhere,
 * scrolling or resizing. The list supplies the items.
 */
export default function ContextMenu({ label, at, onClose, children }: Props) {
  const menu = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(at);

  // Opened near the right or bottom edge, the menu turns back into the window.
  useLayoutEffect(() => {
    const box = menu.current?.getBoundingClientRect();

    if (!box) return;

    setPosition({
      x: Math.max(EDGE, Math.min(at.x, window.innerWidth - box.width - EDGE)),
      y: Math.max(EDGE, Math.min(at.y, window.innerHeight - box.height - EDGE)),
    });
    menu.current?.querySelector<HTMLButtonElement>("[role=menuitem]:not(:disabled)")?.focus();
  }, [at]);

  useEffect(() => {
    const closeOutside = (event: MouseEvent) => {
      if (!menu.current?.contains(event.target as Node)) onClose();
    };

    document.addEventListener("mousedown", closeOutside);
    window.addEventListener("scroll", onClose, true);
    window.addEventListener("resize", onClose);
    window.addEventListener("blur", onClose);

    return () => {
      document.removeEventListener("mousedown", closeOutside);
      window.removeEventListener("scroll", onClose, true);
      window.removeEventListener("resize", onClose);
      window.removeEventListener("blur", onClose);
    };
  }, [onClose]);

  function onKeyDown(event: React.KeyboardEvent) {
    const items = Array.from(menu.current?.querySelectorAll<HTMLButtonElement>("[role=menuitem]:not(:disabled)") ?? []);
    const index = items.indexOf(document.activeElement as HTMLButtonElement);

    if (event.key === "Escape" || event.key === "Tab") {
      event.preventDefault();
      onClose();
    } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      items[(index + (event.key === "ArrowDown" ? 1 : -1) + items.length) % items.length]?.focus();
    }
  }

  return (
    <div
      ref={menu}
      className={styles.menu}
      role="menu"
      aria-label={label}
      style={{ left: position.x, top: position.y }}
      onKeyDown={onKeyDown}
      onContextMenu={(event) => event.preventDefault()}
    >
      <CloseContext.Provider value={onClose}>{children}</CloseContext.Provider>
    </div>
  );
}

type ItemProps = {
  icon: React.ReactNode;
  onSelect: () => void;
  danger?: boolean;
  disabled?: boolean;
  /** Says why a disabled item cannot be chosen. */
  title?: string;
  children: React.ReactNode;
};

/** Closes the menu, then does what it says. */
export function MenuItem({ icon, onSelect, danger, disabled, title, children }: ItemProps) {
  const close = useContext(CloseContext);

  return (
    <button
      type="button"
      role="menuitem"
      className={danger ? styles.menuDanger : styles.menuItem}
      disabled={disabled}
      title={title}
      onClick={() => {
        close();
        onSelect();
      }}
    >
      {icon}
      {children}
    </button>
  );
}

export function MenuDivider() {
  return <hr className={styles.menuDivider} />;
}
