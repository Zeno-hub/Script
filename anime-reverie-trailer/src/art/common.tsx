import React, {useId, useMemo} from 'react';
import {LAYER_H, LAYER_W} from '../components/Parallax';
import {makeNoise} from '../lib/noise';
import {mulberry32} from '../lib/random';

// SVG ids must be unique per instance; useId() output contains ":" so strip it.
export const useUid = (): string => useId().replace(/[^a-zA-Z0-9]/g, '');

export const ridgePath = (seed: number, baseY: number, amp: number, freq = 0.004, octaves = 4, sharp = 1): string => {
  const noise = makeNoise(seed);
  let d = `M -200 ${LAYER_H + 60}`;
  for (let x = -200; x <= LAYER_W + 200; x += 24) {
    let n = 0;
    let a = 1;
    let f = freq;
    let norm = 0;
    for (let o = 0; o < octaves; o++) {
      n += noise(x * f + o * 17.3) * a;
      norm += a;
      a *= 0.5;
      f *= 2.1;
    }
    n = Math.pow(n / norm, sharp);
    d += ` L ${x} ${(baseY - n * amp).toFixed(1)}`;
  }
  return `${d} L ${LAYER_W + 200} ${LAYER_H + 60} Z`;
};

export const Ridge: React.FC<{
  seed: number;
  baseY: number;
  amp: number;
  top: string;
  bottom: string;
  freq?: number;
  octaves?: number;
  sharp?: number;
  opacity?: number;
}> = ({seed, baseY, amp, top, bottom, freq, octaves, sharp, opacity = 1}) => {
  const id = useUid();
  const d = useMemo(() => ridgePath(seed, baseY, amp, freq, octaves, sharp), [seed, baseY, amp, freq, octaves, sharp]);
  return (
    <g opacity={opacity}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={top} />
          <stop offset="1" stopColor={bottom} />
        </linearGradient>
      </defs>
      <path d={d} fill={`url(#${id})`} />
    </g>
  );
};

export const RadialGlow: React.FC<{cx: number; cy: number; r: number; color: string; opacity?: number; ry?: number}> = ({cx, cy, r, color, opacity = 1, ry}) => {
  const id = useUid();
  return (
    <g opacity={opacity}>
      <defs>
        <radialGradient id={id}>
          <stop offset="0" stopColor={color} stopOpacity="1" />
          <stop offset="0.45" stopColor={color} stopOpacity="0.35" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx={cx} cy={cy} rx={r} ry={ry ?? r} fill={`url(#${id})`} />
    </g>
  );
};

export const FogBand: React.FC<{y: number; h: number; color: string; opacity?: number}> = ({y, h, color, opacity = 0.5}) => {
  const id = useUid();
  return (
    <g opacity={opacity}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0" />
          <stop offset="0.5" stopColor={color} stopOpacity="1" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x={-200} y={y} width={LAYER_W + 400} height={h} fill={`url(#${id})`} />
    </g>
  );
};

export const CloudBank: React.FC<{seed: number; y: number; count: number; color: string; shade: string; opacity?: number; scale?: number}> = ({seed, y, count, color, shade, opacity = 1, scale = 1}) => {
  const id = useUid();
  const clouds = useMemo(() => {
    const r = mulberry32(seed);
    return Array.from({length: count}, () => {
      const cx = r() * LAYER_W;
      const cy = y + (r() - 0.5) * 140;
      const puffs = Array.from({length: 6}, () => ({dx: (r() - 0.5) * 360 * scale, dy: (r() - 0.5) * 60 * scale, rx: (120 + r() * 140) * scale, ry: (46 + r() * 50) * scale}));
      return {cx, cy, puffs};
    });
  }, [seed, y, count, scale]);
  return (
    <g opacity={opacity}>
      <defs>
        <filter id={id} x="-20%" y="-50%" width="140%" height="200%">
          <feGaussianBlur stdDeviation={18 * scale} />
        </filter>
      </defs>
      <g filter={`url(#${id})`}>
        {clouds.map((c, i) => (
          <g key={i}>
            {c.puffs.map((p, j) => (
              <ellipse key={`s${j}`} cx={c.cx + p.dx} cy={c.cy + p.dy + 20 * scale} rx={p.rx} ry={p.ry} fill={shade} />
            ))}
            {c.puffs.map((p, j) => (
              <ellipse key={`c${j}`} cx={c.cx + p.dx} cy={c.cy + p.dy} rx={p.rx * 0.92} ry={p.ry * 0.85} fill={color} />
            ))}
          </g>
        ))}
      </g>
    </g>
  );
};

export const Rays: React.FC<{cx: number; cy: number; count: number; length: number; color: string; opacity?: number; rotation?: number; spread?: number}> = ({cx, cy, count, length, color, opacity = 0.2, rotation = 0, spread = 360}) => {
  const id = useUid();
  return (
    <g opacity={opacity} transform={`rotate(${rotation} ${cx} ${cy})`}>
      <defs>
        <radialGradient id={id} cx={cx} cy={cy} r={length} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={color} stopOpacity="0.9" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>
      {Array.from({length: count}, (_, i) => {
        const a = ((i / count) * spread * Math.PI) / 180;
        const w = (spread / count) * 0.35 * (Math.PI / 180);
        const x1 = cx + Math.cos(a - w) * length;
        const y1 = cy + Math.sin(a - w) * length;
        const x2 = cx + Math.cos(a + w) * length;
        const y2 = cy + Math.sin(a + w) * length;
        return <polygon key={i} points={`${cx},${cy} ${x1},${y1} ${x2},${y2}`} fill={`url(#${id})`} />;
      })}
    </g>
  );
};

// A floating rock island: flat top, jagged underside.
export const Island: React.FC<{x: number; y: number; w: number; h: number; seed: number; top: string; rock1: string; rock2: string; rim?: string}> = ({x, y, w, h, seed, top, rock1, rock2, rim}) => {
  const id = useUid();
  const d = useMemo(() => {
    const r = mulberry32(seed);
    const n = 10;
    const pts: string[] = [];
    for (let i = n; i >= 0; i--) {
      const t = i / n;
      const px = x - w / 2 + w * t;
      const depth = h * Math.pow(Math.sin(Math.PI * t), 0.75) * (0.62 + 0.5 * r());
      pts.push(`L ${px.toFixed(1)} ${(y + 10 + depth).toFixed(1)}`);
    }
    return `M ${x - w / 2} ${y} L ${x + w / 2} ${y} ${pts.join(' ')} Z`;
  }, [x, y, w, h, seed]);
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={rock1} />
          <stop offset="1" stopColor={rock2} />
        </linearGradient>
      </defs>
      <path d={d} fill={`url(#${id})`} />
      <ellipse cx={x} cy={y} rx={w / 2} ry={w * 0.055} fill={top} />
      {rim ? <ellipse cx={x} cy={y} rx={w / 2} ry={w * 0.055} fill="none" stroke={rim} strokeWidth={3} opacity={0.8} /> : null}
    </g>
  );
};

export const StarDust: React.FC<{seed: number; count: number; color?: string}> = ({seed, count, color = '#ffffff'}) => {
  const stars = useMemo(() => {
    const r = mulberry32(seed);
    return Array.from({length: count}, () => ({x: r() * LAYER_W, y: r() * LAYER_H * 0.62, s: 0.6 + r() * 1.8, o: 0.3 + r() * 0.7}));
  }, [seed, count]);
  return (
    <g>
      {stars.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.s} fill={color} opacity={s.o} />
      ))}
    </g>
  );
};
