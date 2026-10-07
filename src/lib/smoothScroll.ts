import Lenis from "lenis";

// Smooth scroll is skipped under reduced motion and on touch devices (native
// momentum scrolling is already smooth there). autoRaf runs lenis on a single
// requestAnimationFrame loop that destroy() cancels.
export const initSmoothScroll = () => {
  if (
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    window.matchMedia("(pointer: coarse)").matches
  ) {
    return null;
  }

  return new Lenis({
    lerp: 0.95,
    wheelMultiplier: 1,
    autoRaf: true,
  });
};
