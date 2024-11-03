import Lenis from "lenis";

export const initSmoothScroll = () => {
  const lenis = new Lenis({
    lerp: 0.95,
    wheelMultiplier: 1,
  });

  function raf(time: number) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }

  requestAnimationFrame(raf);

  return lenis;
};
