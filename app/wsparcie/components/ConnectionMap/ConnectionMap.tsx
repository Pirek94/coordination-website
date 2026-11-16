"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { ArrowDown } from "lucide-react";
import { CLUSTERS, type ClusterId } from "@/lib/content/connections";
import { SUPPORT_AREAS } from "@/lib/content/support";
import styles from "./ConnectionMap.module.css";

/** How long each part stays lit while the map shows itself around. */
const AUTO_STEP_MS = 5500;

const AREAS = new Map(SUPPORT_AREAS.map((area) => [area.id, area]));
const LABELS = new Map(CLUSTERS.map((cluster) => [cluster.id, cluster.label]));

/** Where each part sits on the ring, in the diagram's 0-100 box. */
const POINTS = new Map(
  CLUSTERS.map((cluster, index) => {
    const angle = (index / CLUSTERS.length) * 2 * Math.PI;

    const r = (value: number) => Math.round(value * 100) / 100;

    return [cluster.id, { x: r(50 + 36 * Math.sin(angle)), y: r(50 - 36 * Math.cos(angle)) }] as const;
  }),
);

/**
 * A line from one part to another, bowed towards the middle of the ring so
 * the web reads as one firm rather than a star. Rounded, so the server and
 * the browser write the same path.
 */
function link(from: ClusterId, to: ClusterId) {
  const a = POINTS.get(from)!;
  const b = POINTS.get(to)!;
  const bow = 0.45;
  const cx = (a.x + b.x) / 2 + (50 - (a.x + b.x) / 2) * bow;
  const cy = (a.y + b.y) / 2 + (50 - (a.y + b.y) / 2) * bow;
  const r = (value: number) => Math.round(value * 100) / 100;

  return `M ${r(a.x)} ${r(a.y)} Q ${r(cx)} ${r(cy)} ${r(b.x)} ${r(b.y)}`;
}

/** Every pair of parts some chain runs between, once. */
const EDGES = [
  ...new Map(
    CLUSTERS.flatMap((cluster) =>
      cluster.chains.flatMap((chain) =>
        chain.slice(1).map((step, index) => {
          const pair = [chain[index].cluster, step.cluster].sort() as [ClusterId, ClusterId];

          return [pair.join("|"), pair] as const;
        }),
      ),
    ),
  ).values(),
];

/**
 * „Jak łączymy poszczególne obszary?”: the firm as six parts on a ring, with
 * a line wherever a decision in one shows up in another. Picking a part lights
 * its lines in orange, step by step, and the panel beside the ring follows
 * each of its decisions to where it lands. Until the visitor touches it, the
 * map walks round the ring by itself; the first touch stops that for good.
 */
export default function ConnectionMap() {
  const [active, setActive] = useState(0);
  const [armed, setArmed] = useState(false);
  const [auto, setAuto] = useState(false);
  const [inView, setInView] = useState(false);
  const [hovered, setHovered] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const id = useId();

  // The drawing and the walk only start once the script is there; before
  // that the first part simply shows lit.
  useEffect(() => {
    const root = rootRef.current;

    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    setArmed(true);
    setAuto(true);

    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.25 });

    observer.observe(root);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!auto || !inView || hovered) return;

    const timer = window.setTimeout(() => setActive((current) => (current + 1) % CLUSTERS.length), AUTO_STEP_MS);

    return () => window.clearTimeout(timer);
  }, [auto, inView, hovered, active]);

  const stop = () => setAuto(false);

  /** Arrow keys walk round the ring, as in any tab list. */
  function onKeyDown(event: KeyboardEvent) {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
    const edge = { Home: 0, End: CLUSTERS.length - 1 }[event.key];

    if (step === undefined && edge === undefined) return;

    event.preventDefault();

    const next = edge ?? (active + step! + CLUSTERS.length) % CLUSTERS.length;

    setActive(next);
    tabs.current[next]?.focus();
  }

  const current = CLUSTERS[active];
  const linked = new Set(current.chains.flatMap((chain) => chain.map((step) => step.cluster)));

  return (
    <div
      ref={rootRef}
      className={styles.map}
      data-armed={armed ? "true" : undefined}
      onPointerDown={stop}
      onKeyDown={stop}
      onFocus={stop}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <div className={styles.diagram}>
        <svg className={styles.lines} viewBox="0 0 100 100" aria-hidden="true" focusable="false">
          {EDGES.map(([from, to]) => (
            <path key={`${from}|${to}`} className={styles.edge} d={link(from, to)} />
          ))}

          {/* Redrawn for every pick, so each chain draws itself in, step by step. */}
          <g key={current.id}>
            {current.chains.map((chain, index) =>
              chain.slice(1).map((step, hop) => (
                <path
                  key={`${index}-${hop}`}
                  className={styles.lit}
                  d={link(chain[hop].cluster, step.cluster)}
                  pathLength={1}
                  style={{ "--delay": `${0.12 * index + 0.4 * hop}s` } as React.CSSProperties}
                />
              )),
            )}
          </g>

          {CLUSTERS.map((cluster) => {
            const point = POINTS.get(cluster.id)!;

            return (
              <circle
                key={cluster.id}
                className={styles.dot}
                cx={point.x}
                cy={point.y}
                r={3.2}
                data-state={cluster.id === current.id ? "active" : linked.has(cluster.id) ? "linked" : undefined}
              />
            );
          })}
        </svg>

        <span className={styles.hub} aria-hidden="true">
          Twoja
          <br />
          firma
        </span>

        <div className={styles.nodes} role="tablist" aria-label="Części firmy" onKeyDown={onKeyDown}>
          {CLUSTERS.map(({ id: cluster, Icon, label }, index) => {
            const point = POINTS.get(cluster)!;

            return (
              <button
                key={cluster}
                ref={(element) => {
                  tabs.current[index] = element;
                }}
                type="button"
                role="tab"
                id={`${id}-tab-${cluster}`}
                aria-selected={index === active}
                aria-controls={`${id}-panel-${cluster}`}
                tabIndex={index === active ? 0 : -1}
                className={styles.node}
                data-state={index === active ? "active" : linked.has(cluster) ? "linked" : "dim"}
                style={{ "--x": `${point.x}%`, "--y": `${point.y}%` } as React.CSSProperties}
                onClick={() => setActive(index)}
              >
                <Icon aria-hidden="true" />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className={styles.panels}>
        {CLUSTERS.map((cluster, index) => (
          <div
            key={cluster.id}
            role="tabpanel"
            id={`${id}-panel-${cluster.id}`}
            aria-labelledby={`${id}-tab-${cluster.id}`}
            hidden={index !== active}
            className={styles.panel}
          >
            <h3 className={styles.title}>{cluster.label}</h3>
            <p className={styles.summary}>{cluster.summary}</p>

            <p className={styles.label}>Decyzja tutaj, skutek dalej</p>
            <ul className={styles.chains}>
              {cluster.chains.map((chain) => (
                <li key={chain[0].text} className={styles.chain}>
                  <ol className={styles.steps}>
                    {chain.map((step, hop) => (
                      <li key={step.text} className={styles.step} data-first={hop === 0 || undefined}>
                        {hop > 0 && (
                          <span className={styles.arrow} aria-hidden="true">
                            <ArrowDown />
                          </span>
                        )}
                        <span className={styles.where}>{LABELS.get(step.cluster)}</span>
                        <span className={styles.what}>{step.text}</span>
                      </li>
                    ))}
                  </ol>
                </li>
              ))}
            </ul>

            <p className={styles.label}>Obszary wsparcia w tej części</p>
            <ul className={styles.areas}>
              {cluster.areas.map((area) => (
                <li key={area}>
                  <a className={styles.area} href={`#${area}`}>
                    {AREAS.get(area)!.short}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
