import React, {useMemo} from 'react';
import {LAYER_W} from '../components/Parallax';
import {clamp, lerp, prog, ease} from '../lib/math';
import {between, mulberry32} from '../lib/random';
import {RadialGlow, useUid} from './common';

const CX = LAYER_W / 2;

interface Building {
  x: number;
  w: number;
  h: number;
  ant: number;
  wins: {x: number; y: number; c: string}[];
}

interface SkylineProps {
  seed: number;
  baseY: number;
  minW: number;
  maxW: number;
  minH: number;
  maxH: number;
  color: string;
  edge?: string;
  lit: string[];
  chance: number;
}

export const Skyline = React.memo(function Skyline(p: SkylineProps) {
  const buildings = useMemo(() => {
    const r = mulberry32(p.seed);
    const out: Building[] = [];
    let x = -120;
    while (x < LAYER_W + 120) {
      const w = between(r, p.minW, p.maxW);
      const h = between(r, p.minH, p.maxH);
      const wins: Building['wins'] = [];
      const cols = Math.floor((w - 24) / 26);
      const rows = Math.floor((h - 40) / 34);
      for (let rr = 0; rr < rows; rr++) {
        for (let cc = 0; cc < cols; cc++) {
          if (r() < p.chance) wins.push({x: x + 16 + cc * 26, y: p.baseY - h + 24 + rr * 34, c: p.lit[Math.floor(r() * p.lit.length)]});
        }
      }
      out.push({x, w, h, wins, ant: r() < 0.35 ? 40 + r() * 90 : 0});
      x += w + between(r, -10, 16);
    }
    return out;
  }, [p.seed, p.baseY, p.minW, p.maxW, p.minH, p.maxH, p.chance, p.lit]);
  return (
    <g>
      {buildings.map((b, i) => (
        <g key={i}>
          <rect x={b.x} y={p.baseY - b.h} width={b.w} height={b.h + 400} fill={p.color} />
          {p.edge ? <rect x={b.x} y={p.baseY - b.h} width={4} height={b.h + 400} fill={p.edge} opacity={0.6} /> : null}
          {b.ant > 0 ? <rect x={b.x + b.w / 2 - 2} y={p.baseY - b.h - b.ant} width={4} height={b.ant} fill={p.color} /> : null}
          {b.wins.map((w, j) => (
            <rect key={j} x={w.x} y={w.y} width={12} height={16} fill={w.c} opacity={0.85} />
          ))}
        </g>
      ))}
    </g>
  );
});

// Blinking red aviation lights on the far skyline.
export const AviationLights: React.FC<{frame: number}> = ({frame}) => (
  <g>
    {[260, 780, 1320, 1900, 2480, 3000].map((x, i) => {
      const on = Math.sin(frame * 0.12 + i * 1.7) > 0.2 ? 1 : 0.1;
      return <circle key={i} cx={x} cy={470 + ((i * 53) % 90)} r={7} fill="#ff2e4d" opacity={on} />;
    })}
  </g>
);

export interface SignDef {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  vertical?: boolean;
}

export const NEON_SIGNS: SignDef[] = [
  {x: 520, y: 540, w: 90, h: 420, color: '#ff2e4d', vertical: true},
  {x: 1040, y: 640, w: 360, h: 80, color: '#ff8aa0'},
  {x: 1500, y: 470, w: 100, h: 520, color: '#ff2e4d', vertical: true},
  {x: 1980, y: 700, w: 300, h: 70, color: '#ff6a3d'},
  {x: 2480, y: 520, w: 90, h: 460, color: '#ff2e4d', vertical: true},
  {x: 2880, y: 660, w: 280, h: 76, color: '#ff8aa0'},
];

// Neon signs: abstract bars and frames (no text, so no font dependency). Deterministic flicker.
export const NeonSigns: React.FC<{frame: number}> = ({frame}) => (
  <g>
    {NEON_SIGNS.map((s, i) => {
      const flick = Math.sin(frame * 0.9 + i * 5.1) * Math.sin(frame * 0.37 + i) > 0.82 ? 0.35 : 1;
      return (
        <g key={i} opacity={flick}>
          <RadialGlow cx={s.x + s.w / 2} cy={s.y + s.h / 2} r={Math.max(s.w, s.h) * 0.9} color={s.color} opacity={0.6} />
          <rect x={s.x} y={s.y} width={s.w} height={s.h} rx={10} fill="#10030a" stroke={s.color} strokeWidth={7} />
          {s.vertical
            ? [0.2, 0.4, 0.6, 0.8].map((t, j) => <rect key={j} x={s.x + 18} y={s.y + s.h * t - 12} width={s.w - 36} height={14} rx={7} fill={s.color} opacity={0.9 - j * 0.12} />)
            : [0.28, 0.62].map((t, j) => <rect key={j} x={s.x + 22} y={s.y + s.h * t - 6} width={s.w * (0.8 - j * 0.3)} height={12} rx={6} fill={s.color} opacity={0.95} />)}
        </g>
      );
    })}
  </g>
);

export const Wires: React.FC = React.memo(() => (
  <g fill="none" stroke="#06020a" strokeWidth={5}>
    {[0, 1, 2, 3].map((i) => (
      <path key={i} d={`M -200 ${240 + i * 70} Q ${CX} ${420 + i * 90} ${LAYER_W + 200} ${220 + i * 80}`} />
    ))}
    {[260, 900, 1700, 2500, 3100].map((x, i) => (
      <path key={i} d={`M ${x} 150 L ${x} 900`} strokeWidth={14} />
    ))}
  </g>
));

// Wet street: road, lane dashes, neon reflections, ripples. `frame` drives ripples.
export const WetStreet: React.FC<{frame: number}> = ({frame}) => {
  const id = useUid();
  const ripples = useMemo(() => {
    const r = mulberry32(404);
    return Array.from({length: 22}, () => ({x: 300 + r() * (LAYER_W - 600), y: 1160 + r() * 380, p: r() * 40, s: 0.6 + r() * 0.8}));
  }, []);
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a0a14" />
          <stop offset="1" stopColor="#07020a" />
        </linearGradient>
      </defs>
      <rect x={-200} y={1090} width={LAYER_W + 400} height={900} fill={`url(#${id})`} />
      {NEON_SIGNS.map((s, i) => (
        <rect key={i} x={s.x + s.w / 2 - 22} y={1100} width={44} height={420} fill={s.color} opacity={0.16} />
      ))}
      {Array.from({length: 14}, (_, i) => (
        <polygon key={i} points={`${CX - 40 + (i - 7) * 300},1140 ${CX + 40 + (i - 7) * 300},1140 ${CX + 100 + (i - 7) * 430},1330 ${CX - 100 + (i - 7) * 430},1330`} fill="#ff8aa0" opacity={0.1} />
      ))}
      {ripples.map((rp, i) => {
        const t = ((frame * rp.s + rp.p) % 40) / 40;
        return <ellipse key={i} cx={rp.x} cy={rp.y} rx={8 + t * 70} ry={2 + t * 14} fill="none" stroke="#ffb0c0" strokeWidth={2} opacity={(1 - t) * 0.6} />;
      })}
    </g>
  );
};

export const Streetlamp: React.FC<{x: number; baseY: number; h: number; flicker?: number}> = ({x, baseY, h, flicker = 1}) => (
  <g>
    <rect x={x - 9} y={baseY - h} width={18} height={h} fill="#05010a" />
    <rect x={x - 9} y={baseY - h} width={150} height={12} fill="#05010a" />
    <RadialGlow cx={x + 140} cy={baseY - h + 40} r={240} color="#ff6a3d" opacity={0.7 * flicker} />
    <ellipse cx={x + 140} cy={baseY - h + 18} rx={30} ry={11} fill="#ffd0b0" opacity={flicker} />
  </g>
);

// A tall, thin, horned silhouette with glowing eyes. Generic original design.
export const DevilFigure: React.FC<{x: number; baseY: number; frame: number; appear: number}> = ({x, baseY, frame, appear}) => {
  const a = clamp(appear, 0, 1);
  const eye = 0.6 + 0.4 * Math.sin(frame * 0.2);
  return (
    <g opacity={a}>
      <RadialGlow cx={x} cy={baseY - 380} r={320} color="#ff2e4d" opacity={0.28 * a} />
      <polygon points={`${x - 26},${baseY} ${x - 16},${baseY - 300} ${x - 40},${baseY - 420} ${x - 14},${baseY - 520} ${x + 14},${baseY - 520} ${x + 40},${baseY - 420} ${x + 16},${baseY - 300} ${x + 26},${baseY}`} fill="#020005" />
      <polygon points={`${x - 14},${baseY - 520} ${x - 44},${baseY - 600} ${x - 4},${baseY - 540}`} fill="#020005" />
      <polygon points={`${x + 14},${baseY - 520} ${x + 44},${baseY - 600} ${x + 4},${baseY - 540}`} fill="#020005" />
      <rect x={x - 12} y={baseY - 496} width={8} height={5} fill="#ff2e4d" opacity={eye} />
      <rect x={x + 4} y={baseY - 496} width={8} height={5} fill="#ff2e4d" opacity={eye} />
    </g>
  );
};

export const lightningFlash = (frame: number, at: number[]): number => {
  let v = 0;
  for (const f of at) {
    const t = prog(frame, f, f + 3, ease.linear) * (1 - prog(frame, f + 3, f + 12, ease.out));
    v = Math.max(v, t);
  }
  return lerp(0, 1, v);
};
