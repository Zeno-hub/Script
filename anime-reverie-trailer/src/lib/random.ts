// Deterministic PRNG (mulberry32). Never use Math.random() in this project:
// Remotion renders frames in parallel and out of order, so every frame must be a pure
// function of (frame, seed).
export const mulberry32 = (seed: number): (() => number) => {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export const between = (r: () => number, min: number, max: number): number => min + (max - min) * r();
