"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import styles from "./FirmArt.module.css";

/**
 * The little cartoon at the top of each firm-type card. One drawing per kind
 * of firm, in a 120 × 120 box, outlined in the navy ink with the brand's
 * orange for accents. Every drawing is still until its card carries
 * `data-play`; the motion lives in FirmArt.module.css.
 */
export default function FirmArt({ id }: { id: string }) {
  const Art = ART[id];

  if (!Art) return null;

  return (
    <svg className={styles.art} viewBox="0 0 120 120" aria-hidden="true" focusable="false">
      <Art />
    </svg>
  );
}

const delay = (seconds: number) => ({ "--delay": `${seconds}s` }) as CSSProperties;

/**
 * Firmy produkcyjne: a running conveyor, parcels dropping onto it from above
 * and tipping off its far end. The belt wraps round a roller at each end and
 * one in the middle; their hubs turn at the belt's speed, and so do the
 * parcels riding it. The numbers behind that are in FirmArt.module.css.
 */
function Conveyor() {
  return (
    <>
      <ellipse className={styles.shadow} cx={60} cy={101} rx={48} ry={4} />

      <g className={styles.hum}>
        <rect className={`${styles.ink} ${styles.beltDark}`} x={25.5} y={81.6} width={9} height={17.4} rx={2.3} />
        <rect className={`${styles.ink} ${styles.beltDark}`} x={86} y={81.6} width={9} height={17.4} rx={2.3} />
        <rect className={`${styles.ink} ${styles.belt}`} x={3.7} y={56.3} width={112.6} height={32} rx={16} />
        <rect className={`${styles.ink} ${styles.beltDark}`} x={7.9} y={60} width={104.2} height={24.5} rx={12.25} />

        {/* The rollers' hubs, the end ones at the middles of the belt's ends. */}
        {[19.7, 60, 100.3].map((x) => (
          <g key={x} className={styles.roller}>
            <path
              className={`${styles.ink} ${styles.belt}`}
              transform={`translate(${x} 72.3)`}
              d="M0 -4.2 L2.1 -6.3 L6.3 -2.1 L4.2 0 L6.3 2.1 L2.1 6.3 L0 4.2 L-2.1 6.3 L-6.3 2.1 L-4.2 0 L-6.3 -2.1 L-2.1 -6.3 Z"
            />
          </g>
        ))}

        {/* The parcels ride the belt, so they hum with it. Each is drawn with
            its bottom edge on the belt's top (y = 56.3) and its middle at x = 0. */}
        {[
          { fill: styles.cardboard, at: 0 },
          { fill: styles.orange, at: 1.2 },
          { fill: styles.sky, at: 2.4 },
        ].map(({ fill, at }) => (
          <g key={at} transform="translate(0 56.3)">
            <g className={styles.box} style={delay(at)}>
              <g className={styles.squash}>
                <rect className={`${styles.ink} ${fill}`} x={-12.7} y={-25.1} width={25.4} height={25.1} rx={6.2} />
                <rect className={`${styles.ink} ${styles.tape}`} x={-3.3} y={-25.1} width={6.6} height={9.4} rx={1.6} />
              </g>
            </g>
          </g>
        ))}
      </g>
    </>
  );
}

/**
 * Firmy usługowe i eksperckie: two arms meeting in a handshake, the forearms
 * coming down from the upper corners, the client's (navy) on the left and
 * the firm's (orange) on the right, its thumb over the client's hand. The
 * sleeves run on past the medallion, which cuts them off.
 *
 * In motion the clasp pumps straight up and down while each forearm hinges at
 * its elbow, out of the frame (see FirmArt.module.css), so the three move in
 * separate groups, stacked the way the parts overlap.
 */
function Handshake() {
  return (
    <>
      <ellipse className={`${styles.shadow} ${styles.handShadow}`} cx={60} cy={101} rx={34} ry={4} />

      {/* The firm's hand, under the client's fingers. Its outline leaves out
          the edge that turns in under the thumb, and stops where the thumb's
          own outline takes over, so the joint reads as one line. */}
      <g className={styles.clasp}>
        <path className={styles.skinFirm} d="M83.6 46.9 C80.4 49 70.7 54.8 69.1 55 C56.9 56.5 54.9 63.2 54.9 63.2 L68.7 79.4 C77.9 75.7 74.9 71.3 79.1 69.2 C82.9 67.3 90.7 67 94.9 65.2 C94.9 65.2 96.6 61.2 92.6 52.6 C88.5 44 86.8 44.9 83.6 46.9 Z" />
        <path
          className={styles.ink}
          d="M54.9 63.2 L68.7 79.4 C77.9 75.7 74.9 71.3 79.1 69.2 C82.9 67.3 90.7 67 94.9 65.2 C94.9 65.2 96.6 61.2 92.6 52.6 C88.5 44 86.8 44.9 83.6 46.9 C80.4 49 71.9 54.1 70.2 54.8"
        />
      </g>

      <g className={styles.elbowFirm}>
        <path className={`${styles.ink} ${styles.paper}`} d="M121.4 22.5 C99.2 31.7 70.2 48.7 70.2 48.7 C82 54.3 82 74 82 74 C82 74 107.3 55 121.6 52.5 L121.4 22.5 Z" />
        <path className={`${styles.ink} ${styles.orange}`} d="M149.5 2.5 L129.7 12.1 C106.2 23.5 75.7 44.4 75.7 44.4 C88.2 51.4 87.5 73.2 87.5 73.2 C87.5 73.2 114.9 52.2 129.7 51.8 L149.5 51.3 Z" />
      </g>

      {/* The client's hand, its fingers wrapped over the firm's. */}
      <g className={styles.clasp}>
        <path
          className={`${styles.ink} ${styles.skinClient}`}
          d="M36.7 50.2 C45.9 54.1 49.5 52.9 53 57.5 C54.6 59.6 59 63.7 62.3 68 C66.3 72.9 69.2 77.9 69.4 79.4 C69.9 82 67.4 82.8 65.9 82.1 L58.2 72.6 L66.3 82.7 C67.1 84.6 64.6 85.8 62.4 85.1 L54 76.1 L61.7 84.4 C63.5 86.8 60.5 88.7 59 88 L50.7 79.5 L58 86.9 C58.9 89.2 56.5 89.6 55.2 89.1 C54.3 88.7 49.9 85.5 45.4 81.1 C42.2 77.8 38.9 73.1 36.9 72.6 C32.4 71.4 25 65.5 25 65.5 C25 65.5 24.8 58.6 27.3 54 C29.8 49.3 31.6 48.1 36.7 50.2 Z"
        />
      </g>

      <g className={styles.elbowClient}>
        <path className={`${styles.ink} ${styles.paper}`} d="M-5 25.2 C17.2 34.4 46.2 51.4 46.2 51.4 C34.4 57 34.5 76.7 34.5 76.7 C34.5 76.7 9.2 57.7 -5.2 55.2 L-5 25.2 Z" />
        <path className={`${styles.ink} ${styles.navySleeve}`} d="M-36.7 1.9 L-15.9 12.1 C8.8 24.2 40.8 46.4 40.8 46.4 C27.8 53.8 28.5 77 28.5 77 C28.5 77 -0.4 54.6 -15.9 54.3 L-36.7 53.7 Z" />
      </g>

      {/* The firm's thumb over the client's hand. Filled whole, but outlined
          only where it shows: not along its root across the palm, and its
          lower edge fading out as it reaches the palm. */}
      <g className={styles.clasp}>
        <path
          className={styles.skinFirm}
          d="M62.3 58.3 L69.5 54.9 C69.5 54.9 65.1 52.4 59.5 53.6 C49.1 55.9 52.5 60 44.8 68.2 C41.7 71.7 44.9 79.6 55.6 63.5 C57 61.3 62.3 58.3 62.3 58.3 Z"
        />
        <path
          className={styles.ink}
          d="M69.5 54.9 C69.5 54.9 65.1 52.4 59.5 53.6 C49.1 55.9 52.5 60 44.8 68.2 C41.7 71.7 44.9 79.6 55.6 63.5 C56.3 62.4 57.4 61.4 58.6 60.5"
        />
      </g>
    </>
  );
}

/**
 * Firmy handlowe, techniczne i projektowe: an office block and its lower wing,
 * smoke curling from the wing's chimney. The windows light up one by one,
 * stay lit for 7 s and go dark one by one, two of them 2 s after the rest;
 * 7 s after the last goes dark they light up again.
 */
function Offices() {
  return (
    <>
      <defs>
        {/* The wing darkens towards the block, which shades it. */}
        <linearGradient id="firm-art-wing" x2={0.5}>
          <stop offset={0} stopColor="#a3a3a3" />
          <stop offset={1} stopColor="#ebebeb" />
        </linearGradient>
      </defs>

      <ellipse className={styles.shadow} cx={60} cy={100} rx={46} ry={4} />

      <path className={`${styles.ink} ${styles.wall}`} d="M60.38,21.76c4.28,-0 7.75,3.47 7.75,7.75l0,68.72l-50.85,0l0,-68.72c0,-4.28 3.47,-7.75 7.75,-7.75l35.34,0Z" />
      <path className={styles.ink} style={{ fill: "url(#firm-art-wing)" }} d="M95.96,46.24c1.79,-0 3.51,0.71 4.77,1.98c1.27,1.27 1.98,2.98 1.98,4.77l0,45.26l-34.57,0l0,-52l27.83,0Z" />
      <rect className={`${styles.ink} ${styles.door}`} x={36.99} y={83} width={11.44} height={15.24} />

      <g>
        <rect className={`${styles.ink} ${styles.pane} ${styles.lit}`} style={delay(0.9)} x={38.52} y={60.36} width={8.39} height={8.82} />
        <rect className={`${styles.ink} ${styles.pane} ${styles.lit}`} style={delay(0.2)} x={52.73} y={60.36} width={8.39} height={8.82} />
        <rect className={`${styles.ink} ${styles.pane} ${styles.lit}`} style={delay(1.4)} x={24.26} y={60.36} width={8.39} height={8.82} />
        <rect className={`${styles.ink} ${styles.pane} ${styles.lit}`} style={delay(0.5)} x={38.52} y={44.93} width={8.39} height={8.82} />
        <rect className={`${styles.ink} ${styles.pane} ${styles.lit}`} style={delay(1.2)} x={52.73} y={44.93} width={8.39} height={8.82} />
        <rect className={`${styles.ink} ${styles.pane} ${styles.lit}`} style={delay(0.0)} x={24.26} y={44.93} width={8.39} height={8.82} />
        <rect className={`${styles.ink} ${styles.pane} ${styles.late}`} style={delay(0.7)} x={38.52} y={28.94} width={8.39} height={8.82} />
        <rect className={`${styles.ink} ${styles.pane} ${styles.lit}`} style={delay(1.6)} x={73.8} y={68.12} width={8.39} height={8.82} />
        <rect className={`${styles.ink} ${styles.pane} ${styles.late}`} style={delay(0.3)} x={88.01} y={68.12} width={8.39} height={8.82} />
        <rect className={`${styles.ink} ${styles.pane} ${styles.lit}`} style={delay(1.0)} x={73.8} y={52.69} width={8.39} height={8.82} />
        <path className={`${styles.ink} ${styles.pane} ${styles.lit}`} style={delay(0.45)} d="M94.17,52.69c1.23,0 2.23,1 2.23,2.23c-0,2.61 -0,6.59 -0,6.59l-8.39,0l0,-8.82l6.16,0Z" />
        <path className={`${styles.ink} ${styles.pane} ${styles.lit}`} style={delay(1.3)} d="M57.8,28.94c0.88,-0 1.73,0.35 2.35,0.97c0.62,0.62 0.97,1.47 0.97,2.35c0,2.5 0,5.5 0,5.5l-8.39,0l0,-8.82l5.07,0Z" />
        <path className={`${styles.ink} ${styles.pane} ${styles.lit}`} style={delay(0.15)} d="M32.65,28.94l0,8.82l-8.39,0l0,-5.91c-0,-1.6 1.3,-2.9 2.9,-2.9l5.48,-0Z" />
      </g>

      <rect className={`${styles.ink} ${styles.chimney}`} x={79.64} y={40.51} width={3.34} height={4.18} />
      <Smoke id="firm-art-smoke-offices" />
    </>
  );
}

const SVG_NS = "http://www.w3.org/2000/svg";

/**
 * The smoke's outline: a ribbon rising from the chimney, leaning with the
 * wind, widening as it goes up and swaying in a wave that climbs it, each edge
 * billowing on its own. `t` runs over one loop, 0 to 1; any `t` gives an
 * outline of the same make, so the frames morph into one another.
 */
function smokeOutline(t: number) {
  const TAU = Math.PI * 2;
  const steps = 9;
  const left: [number, number][] = [];
  const right: [number, number][] = [];

  for (let i = 0; i <= steps; i++) {
    const s = i / steps;
    const y = 41.2 - 32 * s;
    const middle = 81.3 + 7 * s ** 1.6 + (0.3 + 3.6 * s) * Math.sin(TAU * (1.25 * s - t));
    const width = 0.9 + 3.2 * s;

    left.push([middle - width * (1 + 0.3 * Math.sin(TAU * (2.1 * s - t) + 1.3)), y]);
    right.push([middle + width * (1 + 0.3 * Math.sin(TAU * (1.7 * s - t) + 4.2)), y]);
  }

  const top = (left[steps][0] + right[steps][0]) / 2 + 1.2 * Math.sin(TAU * (0.6 - t));
  const points = [...left, [top, 41.2 - 34.6] as [number, number], ...right.reverse()];

  // A closed Catmull-Rom curve through the points, as cubic Béziers.
  const at = (i: number) => points[(i + points.length) % points.length];
  const n = (value: number) => +value.toFixed(2);
  let d = `M${n(points[0][0])} ${n(points[0][1])}`;

  for (let i = 0; i < points.length; i++) {
    const [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)];

    d +=
      ` C${n(p1[0] + (p2[0] - p0[0]) / 6)} ${n(p1[1] + (p2[1] - p0[1]) / 6)}` +
      ` ${n(p2[0] - (p3[0] - p1[0]) / 6)} ${n(p2[1] - (p3[1] - p1[1]) / 6)}` +
      ` ${n(p2[0])} ${n(p2[1])}`;
  }

  return `${d}Z`;
}

/** The smoke at rest, as `smokeOutline(0)` draws it. */
const SMOKE_REST = "M80.14 41.2 C79.92 40.61 80.37 38.83 80.65 37.64 C80.93 36.46 81.67 35.27 81.83 34.09 C81.99 32.9 81.97 31.72 81.62 30.53 C81.26 29.35 80.2 28.16 79.7 26.98 C79.2 25.79 78.55 24.61 78.62 23.42 C78.7 22.24 79.44 21.05 80.15 19.87 C80.87 18.68 82.09 17.5 82.91 16.31 C83.74 15.13 84.43 13.94 85.1 12.76 C85.77 11.57 85.9 10.23 86.95 9.2 C87.99 8.17 89.66 6.6 91.37 6.6 C93.08 6.6 96.75 8.17 97.2 9.2 C97.66 10.23 95.51 11.57 94.11 12.76 C92.7 13.94 90.33 15.13 88.77 16.31 C87.22 17.5 85.58 18.68 84.79 19.87 C84 21.05 83.96 22.24 84.03 23.42 C84.1 24.61 84.91 25.79 85.21 26.98 C85.5 28.16 85.88 29.35 85.81 30.53 C85.74 31.72 85.23 32.9 84.76 34.09 C84.3 35.27 83.47 36.46 83.01 37.64 C82.54 38.83 82.44 40.61 81.96 41.2 C81.49 41.79 80.36 41.79 80.14 41.2Z";

/**
 * The smoke, drawn rising from the offices' chimney; `at` moves it onto
 * another. It morphs its own outline, which CSS can't do everywhere, so it runs
 * as an SVG <animate> over 24 frames of `smokeOutline`. That is added once
 * mounted (so the server and the browser never disagree on the rounding) and
 * paused whenever the card is not playing, like every CSS animation here.
 */
function Smoke({ id, at = [0, 0] }: { id: string; at?: [number, number] }) {
  const ref = useRef<SVGPathElement>(null);

  useEffect(() => {
    const path = ref.current;
    const svg = path?.ownerSVGElement;

    if (!path || !svg) return;

    const card = svg.closest("article");
    const frames = Array.from({ length: 25 }, (_, frame) => smokeOutline(frame / 24));
    const animate = document.createElementNS(SVG_NS, "animate");

    animate.setAttribute("attributeName", "d");
    animate.setAttribute("dur", "2.4s");
    animate.setAttribute("repeatCount", "indefinite");
    animate.setAttribute("values", frames.join(";"));
    path.appendChild(animate);

    const sync = () => {
      if (card?.hasAttribute("data-play")) svg.unpauseAnimations();
      else svg.pauseAnimations();
    };
    const observer = new MutationObserver(sync);

    sync();
    if (card) observer.observe(card, { attributes: true, attributeFilter: ["data-play"] });

    return () => {
      observer.disconnect();
      animate.remove();
    };
  }, []);

  return (
    <g transform={`translate(${at[0]} ${at[1]})`}>
      <defs>
        {/* Clear at the chimney, thickest a little above it and thinning out
            again as it rises. */}
        <linearGradient id={id} gradientUnits="userSpaceOnUse" x1={81.3} y1={40.5} x2={81.3} y2={6}>
          <stop offset={0} stopColor="var(--navy)" stopOpacity={0} />
          <stop offset={0.4} stopColor="var(--navy)" stopOpacity={0.4} />
          <stop offset={1} stopColor="var(--navy)" stopOpacity={0.08} />
        </linearGradient>
      </defs>
      <path ref={ref} fill={`url(#${id})`} d={SMOKE_REST} />
    </g>
  );
}

/**
 * Firmy rodzinne: a house with its garage alongside, smoke curling from the
 * chimney the same way as the offices'.
 */
function House() {
  return (
    <>
      <ellipse className={styles.shadow} cx={60} cy={100} rx={50} ry={4} />

      {/* The garage. */}
      <path className={`${styles.ink} ${styles.timber}`} d="M89.74 61.63 L113.34 69.59 L66.14 69.59 Z" />
      <rect className={`${styles.ink} ${styles.render}`} x={71.56} y={69.59} width={39.28} height={28.71} />

      {/* The house, its chimney and smoke behind the roof. */}
      <path className={`${styles.ink} ${styles.cream}`} d="M71.56 60.36 L71.56 98.3 L15.32 98.3 L15.32 60.36 L43.44 40.6 Z" />
      <rect className={`${styles.ink} ${styles.chimney}`} x={60.77} y={43.84} width={3.34} height={4.18} />
      <Smoke id="firm-art-smoke-house" at={[-18.87, 3.33]} />
      <path
        className={`${styles.ink} ${styles.roof}`}
        d="M15.32 60.36 L6.66 60.36 L43.44 33.87 L80.22 60.36 L71.56 60.36 L43.44 40.6 Z"
      />
      <rect className={`${styles.ink} ${styles.timber}`} x={46.41} y={79.95} width={11.45} height={18.35} />
      <rect className={`${styles.ink} ${styles.glass}`} x={23.41} y={65.61} width={14.34} height={14.34} />

      {/* The garage door. */}
      <rect className={`${styles.ink} ${styles.shutter}`} x={79.23} y={76.76} width={22.75} height={21.55} />
      <path className={styles.slats} d="M82.19 82.02 H99.02 M82.19 87.53 H99.02 M82.19 93.07 H99.02" />
    </>
  );
}

const ART: Record<string, () => React.JSX.Element> = {
  produkcja: Conveyor,
  uslugi: Handshake,
  handel: Offices,
  rodzinne: House,
};
