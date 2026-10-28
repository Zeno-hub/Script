import {mulberry32} from './random';

// 1D smooth value noise in [0, 1). Deterministic per seed.
export const makeNoise = (seed: number): ((x: number) => number) => {
  const r = mulberry32(seed);
  const table = Array.from({length: 512}, () => r());
  return (x: number): number => {
    const i = Math.floor(x);
    const f = x - i;
    const a = table[((i % 512) + 512) % 512];
    const b = table[(((i + 1) % 512) + 512) % 512];
    const t = f * f * (3 - 2 * f);
    return a + (b - a) * t;
  };
};
