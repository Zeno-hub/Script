import {Easing, interpolate} from 'remotion';

export type EaseFn = (t: number) => number;

export const clamp = (v: number, min: number, max: number): number => Math.min(max, Math.max(min, v));
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
export const wrap = (v: number, m: number): number => ((v % m) + m) % m;

export const ease = {
  inOut: Easing.inOut(Easing.cubic) as EaseFn,
  out: Easing.out(Easing.cubic) as EaseFn,
  in: Easing.in(Easing.cubic) as EaseFn,
  outExpo: Easing.out(Easing.exp) as EaseFn,
  inOutSine: Easing.inOut(Easing.sin) as EaseFn,
  linear: ((t: number) => t) as EaseFn,
};

// 0..1 progress between two frames, clamped, with easing. Built on Remotion's interpolate().
export const prog = (frame: number, from: number, to: number, easing: EaseFn = ease.inOut): number =>
  interpolate(frame, [from, to], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing,
  });

const hexToRgb = (hex: string): [number, number, number] => {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

export const rgba = (hex: string, a: number): string => {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

export const mixHex = (c1: string, c2: string, t: number): string => {
  const [r1, g1, b1] = hexToRgb(c1);
  const [r2, g2, b2] = hexToRgb(c2);
  const ch = (a: number, b: number) => Math.round(lerp(a, b, t)).toString(16).padStart(2, '0');
  return `#${ch(r1, r2)}${ch(g1, g2)}${ch(b1, b2)}`;
};
