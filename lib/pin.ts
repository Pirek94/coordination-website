/**
 * Pinning a scroll-driven block together with its section's intro.
 *
 * The stage holds the intro and, below it, the body (the part the scroll
 * drives). Where the whole stage fits under the bar, the stage sticks,
 * centred in the room under the bar, so the title and its text stay with the
 * block instead of the screen below it standing empty. Where it does not,
 * only the body sticks, at `bodyTop`, and the intro scrolls away above it.
 *
 * Both are set as inline styles here; the stylesheet leaves them static.
 */

export type Pin = {
  /** The element that sticks: the stage, or the body alone. */
  element: HTMLElement;
  /** Where it sticks, in px from the top of the screen. */
  top: number;
  /** How far below the track's top it sits before it sticks. */
  offset: number;
};

type PinOptions = {
  /** The height of the bar, in px. */
  nav: number;
  /** The height of the screen to fit into, in px. */
  screen: number;
  /** Where the body sticks when it sticks alone, in px. */
  bodyTop: number;
  /** What hangs below the stage and needs room too, in px. */
  below?: number;
};

/** The stage is the track's first child, so it starts where the track does. */
export function pin(stage: HTMLElement, body: HTMLElement, options: PinOptions): Pin {
  const { nav, screen, bodyTop, below = 0 } = options;

  unpin(stage, body);

  const offset = body.getBoundingClientRect().top - stage.getBoundingClientRect().top;
  const centred = nav + (screen - nav - stage.offsetHeight - below) / 2;

  if (centred >= nav + 16) {
    stage.style.position = "sticky";
    stage.style.top = `${centred.toFixed(1)}px`;

    return { element: stage, top: centred, offset: 0 };
  }

  // A sticky element only moves within its parent, so the stage steps aside
  // and the body sticks within the whole track.
  stage.style.display = "contents";
  body.style.position = "sticky";
  body.style.top = `${bodyTop.toFixed(1)}px`;

  return { element: body, top: bodyTop, offset };
}

export function unpin(stage: HTMLElement, body: HTMLElement) {
  for (const element of [stage, body]) {
    element.style.removeProperty("position");
    element.style.removeProperty("top");
  }

  stage.style.removeProperty("display");
}

/** How far through its stretch of scroll the pinned element is, 0 to 1. */
export function pinProgress(track: HTMLElement, { element, top, offset }: Pin) {
  const travel = track.offsetHeight - offset - element.offsetHeight;
  const progress = (top - offset - track.getBoundingClientRect().top) / travel;

  return travel > 0 ? Math.min(1, Math.max(0, progress)) : 1;
}
