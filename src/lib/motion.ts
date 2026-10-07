// Motion tokens (Material 3 motion scheme, mass 1, damping = 2 * zeta * sqrt(stiffness)).
// Every spring in the app comes from here; no loose { stiffness, damping } pairs elsewhere.

/** Spring with damping ratio `ratio` (1 = critically damped, no overshoot). */
export const critical = (stiffness: number, ratio = 1) => ({
  type: "spring" as const,
  stiffness,
  damping: 2 * ratio * Math.sqrt(stiffness),
});

/** Position, size, shape. Standard, zeta = 1. */
export const spatial = {
  fast: critical(1400),
  default: critical(700),
  slow: critical(300),
} as const;

/** Opacity and color. Stiffer than spatial so a fade never lags the move it belongs to. */
export const effects = {
  fast: critical(3800),
  default: critical(1600),
  slow: critical(800),
} as const;

/** One-off celebration only (overshoots). Never on a control. */
export const expressive = critical(380, 0.8);

export const spring = {
  /** knobs, dots, step indicators, presses */
  snap: { ...spatial.fast, opacity: effects.fast },
  /** tiles, state swaps, messages */
  swap: { ...spatial.default, opacity: effects.default },
  /** sheets, steps, columns, progress fills */
  sheet: { ...spatial.default, opacity: effects.default },
} as const;

/**
 * Continuous followers (cursor light, scroll-linked values) passed to `useSpring`.
 * Not retuned: the numbers are the originals, kept here under a name.
 */
export const follow = {
  /** background-beams: radial light chasing the pointer */
  cursor: { stiffness: 100, damping: 30 },
  /** gradient-text: sweep position easing toward its target */
  sweep: { stiffness: 400, damping: 80 },
} as const;
