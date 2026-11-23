"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CLUSTERS, type ClusterId } from "@/lib/content/connections";
import { SUPPORT_AREAS } from "@/lib/content/support";
import styles from "./ConnectionMap.module.css";

/**
 * How long each part stays lit while the map shows itself around. The panel's
 * progress bar runs for this long and moves the map on when it ends, so a
 * pause (a hover, the map scrolled away) holds the bar where it is.
 */
const AUTO_STEP_MS = 5500;

const AREAS = new Map(SUPPORT_AREAS.map((area) => [area.id, area]));
const BY_ID = new Map(CLUSTERS.map((cluster) => [cluster.id, cluster]));

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
 * each of its decisions to where it lands; pointing at one of those decisions
 * leaves only its own lines lit. Until the visitor touches it, the map walks
 * round the ring by itself; the first touch stops that for good.
 */
export default function ConnectionMap() {
  const [active, setActive] = useState(0);
  const [focus, setFocus] = useState<number | null>(null);
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

  const stop = () => setAuto(false);

  function select(index: number) {
    setActive((index + CLUSTERS.length) % CLUSTERS.length);
    setFocus(null);
  }

  /** Arrow keys walk round the ring, as in any tab list. */
  function onKeyDown(event: KeyboardEvent) {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
    const edge = { Home: 0, End: CLUSTERS.length - 1 }[event.key];

    if (step === undefined && edge === undefined) return;

    event.preventDefault();

    const next = edge ?? (active + step! + CLUSTERS.length) % CLUSTERS.length;

    select(next);
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
          <circle className={styles.orbit} cx={50} cy={50} r={36} />

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
                  data-faded={focus !== null && focus !== index ? "true" : undefined}
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
                style={{ "--x": `${point.x}%`, "--y": `${point.y}%`, "--i": index } as React.CSSProperties}
                onClick={() => select(index)}
              >
                <span className={styles.badge}>
                  <Icon aria-hidden="true" />
                </span>
                <span className={styles.nodeLabel}>{label}</span>
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
            {auto && index === active && (
              <span
                key={active}
                className={styles.progress}
                aria-hidden="true"
                data-paused={hovered || !inView ? "true" : undefined}
                style={{ "--step": `${AUTO_STEP_MS}ms` } as React.CSSProperties}
                onAnimationEnd={() => select(active + 1)}
              />
            )}

            <div className={styles.head}>
              <span className={styles.headIcon} aria-hidden="true">
                <cluster.Icon />
              </span>
              <div className={styles.headText}>
                <h3 className={styles.title}>{cluster.label}</h3>
              </div>
              <div className={styles.pager}>
                <button
                  type="button"
                  className={styles.pagerButton}
                  aria-label="Poprzednia część firmy"
                  onClick={() => select(index - 1)}
                >
                  <ChevronLeft aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className={styles.pagerButton}
                  aria-label="Następna część firmy"
                  onClick={() => select(index + 1)}
                >
                  <ChevronRight aria-hidden="true" />
                </button>
              </div>
            </div>

            <p className={styles.summary}>{cluster.summary}</p>

            <ul className={styles.chains} onPointerLeave={() => setFocus(null)}>
              {cluster.chains.map((chain, chainIndex) => (
                <li
                  key={chain[0].text}
                  className={styles.chain}
                  data-focused={focus === chainIndex ? "true" : undefined}
                  onPointerEnter={() => setFocus(chainIndex)}
                >
                  <ol className={styles.steps}>
                    {chain.map((step, hop) => {
                      const where = BY_ID.get(step.cluster)!;

                      return (
                        <li key={step.text} className={styles.step} data-first={hop === 0 || undefined}>
                          {hop > 0 && (
                            <span className={styles.where}>
                              <where.Icon aria-hidden="true" />
                              {where.label}
                            </span>
                          )}
                          <span className={styles.what}>{step.text}</span>
                        </li>
                      );
                    })}
                  </ol>
                </li>
              ))}
            </ul>

            <div className={styles.footer}>
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
          </div>
        ))}
      </div>
    </div>
  );
}
