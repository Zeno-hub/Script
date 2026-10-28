import React, {useMemo} from 'react';
import {useCurrentFrame} from 'remotion';
import {HEIGHT, WIDTH} from '../config';
import {lerp, wrap} from '../lib/math';
import {mulberry32} from '../lib/random';

export interface ParticleOpts {
  count: number;
  seed: number;
  colors: string[];
  size: [number, number]; // dot radius / streak width in px
  speed: [number, number]; // px per frame
  angle: number; // travel direction in degrees: 0 right, 90 down, -90 up
  wobble?: number; // sideways sway in px
  streak?: number; // > 0 draws streaks (length = speed * streak) instead of dots
  opacity?: [number, number];
  twinkle?: number; // 0..1
  glow?: boolean;
  fade?: number; // overall multiplier
}

const MARGIN = 160;

// Pure function of (frame, seed): every particle position is computed analytically.
export const ParticleField: React.FC<ParticleOpts> = (o) => {
  const frame = useCurrentFrame();
  const items = useMemo(() => {
    const r = mulberry32(o.seed);
    return Array.from({length: o.count}, () => ({
      x: r(),
      y: r(),
      s: r(),
      c: Math.floor(r() * o.colors.length),
      p: r() * Math.PI * 2,
      o: r(),
      z: r(),
    }));
  }, [o.count, o.seed, o.colors.length]);

  const W = WIDTH + MARGIN * 2;
  const H = HEIGHT + MARGIN * 2;
  const a = (o.angle * Math.PI) / 180;
  const opac = o.opacity ?? [0.3, 0.9];
  const twinkle = o.twinkle ?? 0;
  const fade = o.fade ?? 1;
  const wobble = o.wobble ?? 0;

  return (
    <svg
      width={WIDTH}
      height={HEIGHT}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      style={{position: 'absolute', left: 0, top: 0, mixBlendMode: o.glow ? 'screen' : 'normal', pointerEvents: 'none'}}
    >
      {items.map((it, i) => {
        const sp = lerp(o.speed[0], o.speed[1], it.s);
        const vx = Math.cos(a) * sp;
        const vy = Math.sin(a) * sp;
        const sway = wobble * Math.sin(frame * 0.035 * (0.5 + it.z) + it.p);
        const px = wrap(it.x * W + vx * frame - Math.sin(a) * sway, W) - MARGIN;
        const py = wrap(it.y * H + vy * frame + Math.cos(a) * sway, H) - MARGIN;
        const size = lerp(o.size[0], o.size[1], it.z);
        const tw = 1 - twinkle + twinkle * (0.5 + 0.5 * Math.sin(frame * 0.12 + it.p));
        const alpha = lerp(opac[0], opac[1], it.o) * tw * fade;
        const color = o.colors[it.c];
        if (o.streak && o.streak > 0) {
          return (
            <line
              key={i}
              x1={px}
              y1={py}
              x2={px - vx * o.streak}
              y2={py - vy * o.streak}
              stroke={color}
              strokeWidth={size}
              strokeLinecap="round"
              opacity={alpha}
            />
          );
        }
        return (
          <g key={i}>
            <circle cx={px} cy={py} r={size * 3.2} fill={color} opacity={alpha * 0.16} />
            <circle cx={px} cy={py} r={size} fill={color} opacity={alpha} />
          </g>
        );
      })}
    </svg>
  );
};
