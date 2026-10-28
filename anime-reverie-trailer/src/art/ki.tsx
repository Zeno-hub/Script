import React, {useMemo} from 'react';
import {LAYER_W} from '../components/Parallax';
import {lerp, prog, ease} from '../lib/math';
import {mulberry32} from '../lib/random';
import {Island, useUid} from './common';

const CX = LAYER_W / 2;

// Tall karst-style rock pillars (silhouettes with jittered tapered sides).
interface KarstProps {
  seed: number;
  count: number;
  baseY: number;
  minH: number;
  maxH: number;
  minW: number;
  maxW: number;
  c1: string;
  c2: string;
  cap?: string;
}

export const KarstPillars = React.memo(
  function KarstPillars({seed, count, baseY, minH, maxH, minW, maxW, c1, c2, cap}: KarstProps) {
    const id = useUid();
    const shapes = useMemo(() => {
      const r = mulberry32(seed);
      return Array.from({length: count}, (_, i) => {
        const w = minW + r() * (maxW - minW);
        const h = minH + r() * (maxH - minH);
        const x = (i + 0.5) * (LAYER_W / count) + (r() - 0.5) * 140;
        const steps = 8;
        const left: string[] = [];
        const right: string[] = [];
        for (let s = 0; s <= steps; s++) {
          const t = s / steps;
          const y = baseY - h * t;
          const half = w * 0.5 * (1 - 0.38 * t) * (0.88 + 0.24 * r());
          left.push(`${(x - half).toFixed(1)},${y.toFixed(1)}`);
          right.unshift(`${(x + half).toFixed(1)},${y.toFixed(1)}`);
        }
        const topY = baseY - h;
        const points = `${x - w * 0.6},${baseY + 300} ${left.join(' ')} ${x - w * 0.12},${topY - 30} ${x + w * 0.12},${topY - 34} ${right.join(' ')} ${x + w * 0.6},${baseY + 300}`;
        return {points, x, topY, w};
      });
    }, [seed, count, baseY, minH, maxH, minW, maxW]);
    return (
      <g>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={c1} />
            <stop offset="1" stopColor={c2} />
          </linearGradient>
        </defs>
        {shapes.map((s, i) => (
          <g key={i}>
            <polygon points={s.points} fill={`url(#${id})`} />
            {cap ? <ellipse cx={s.x} cy={s.topY - 26} rx={s.w * 0.3} ry={22} fill={cap} /> : null}
          </g>
        ))}
      </g>
    );
  }
);

// The floating martial-arts arena.
export const KiArena: React.FC = React.memo(() => {
  const tiles = useMemo(() => {
    const r = mulberry32(31);
    return Array.from({length: 16}, (_, i) => ({a: (i / 16) * Math.PI * 2, j: r()}));
  }, []);
  return (
    <g>
      <Island x={CX} y={1010} w={1300} h={560} seed={4} top="#b6a47c" rock1="#7a6248" rock2="#2c2118" rim="#ffe2a6" />
      <ellipse cx={CX} cy={1004} rx={560} ry={112} fill="#d8c79c" />
      <ellipse cx={CX} cy={1004} rx={470} ry={92} fill="#c2ae82" />
      <ellipse cx={CX} cy={1004} rx={560} ry={112} fill="none" stroke="#7a6248" strokeWidth={10} />
      <ellipse cx={CX} cy={1004} rx={300} ry={60} fill="none" stroke="#8c7650" strokeWidth={5} />
      {tiles.map((t, i) => (
        <line key={i} x1={CX + Math.cos(t.a) * 300} y1={1004 + Math.sin(t.a) * 60} x2={CX + Math.cos(t.a) * 560} y2={1004 + Math.sin(t.a) * 112} stroke="#8c7650" strokeWidth={4} opacity={0.7} />
      ))}
      {[-1, 1].map((side) =>
        [0, 1].map((row) => {
          const x = CX + side * (row === 0 ? 470 : 330);
          const y = row === 0 ? 1004 : 960;
          return (
            <g key={`${side}${row}`}>
              <rect x={x - 22} y={y - 190} width={44} height={190} fill="#a68e66" />
              <rect x={x - 34} y={y - 208} width={68} height={22} fill="#c2ae82" />
              <rect x={x - 28} y={y - 6} width={56} height={14} fill="#6e5a3e" />
            </g>
          );
        })
      )}
    </g>
  );
});

const flamePath = (cx: number, baseY: number, h: number, w: number, frame: number, phase: number, wob: number): string => {
  const n = 16;
  const left: string[] = [];
  const right: string[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const y = baseY - h * t;
    const half = w * Math.pow(1 - t * 0.9, 0.8) * (1 + 0.16 * Math.sin(frame * 0.28 + t * 9 + phase));
    const side = wob * t * Math.sin(frame * 0.17 + t * 6 + phase);
    left.push(`${(cx - half + side).toFixed(1)},${y.toFixed(1)}`);
    right.unshift(`${(cx + half + side).toFixed(1)},${y.toFixed(1)}`);
  }
  return `M ${left.join(' L ')} L ${cx + (wob * Math.sin(frame * 0.17 + 6 + phase))},${baseY - h * 1.06} L ${right.join(' L ')} Z`;
};

// Golden energy aura. Three nested flames, additive blend. Pure function of `frame`.
export const KiAura: React.FC<{frame: number; baseY: number; power: number}> = ({frame, baseY, power}) => {
  const id = useUid();
  const h = 1100 * power;
  const w = 210 * (0.6 + 0.4 * power);
  return (
    <g style={{mixBlendMode: 'screen'}}>
      <defs>
        <linearGradient id={`${id}a`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#ff8a1f" stopOpacity="0.85" />
          <stop offset="1" stopColor="#ff5a00" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${id}b`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#ffd24a" stopOpacity="0.95" />
          <stop offset="1" stopColor="#ffb21f" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${id}c`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="1" stopColor="#fff2b0" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={flamePath(CX, baseY, h, w * 1.7, frame, 0, 40)} fill={`url(#${id}a)`} />
      <path d={flamePath(CX, baseY, h * 0.86, w * 1.2, frame, 2, 30)} fill={`url(#${id}b)`} />
      <path d={flamePath(CX, baseY, h * 0.6, w * 0.62, frame, 4, 18)} fill={`url(#${id}c)`} />
    </g>
  );
};

export const KiShockwave: React.FC<{frame: number; start: number; y: number}> = ({frame, start, y}) => {
  const t = prog(frame, start, start + 55, ease.out);
  if (t <= 0 || t >= 1) return null;
  const rx = lerp(60, 1900, t);
  return (
    <g style={{mixBlendMode: 'screen'}}>
      <ellipse cx={CX} cy={y} rx={rx} ry={rx * 0.2} fill="none" stroke="#fff2c0" strokeWidth={lerp(46, 3, t)} opacity={1 - t} />
      <ellipse cx={CX} cy={y} rx={rx * 0.8} ry={rx * 0.16} fill="none" stroke="#ffb23d" strokeWidth={lerp(24, 2, t)} opacity={(1 - t) * 0.8} />
    </g>
  );
};

export const SpeedLines: React.FC<{frame: number; start: number; end: number}> = ({frame, start, end}) => {
  const lines = useMemo(() => {
    const r = mulberry32(909);
    return Array.from({length: 70}, () => ({a: r() * Math.PI * 2, r0: 420 + r() * 380, len: 500 + r() * 900, w: 2 + r() * 5}));
  }, []);
  const a = Math.sin(prog(frame, start, end, ease.linear) * Math.PI);
  if (a <= 0.01) return null;
  return (
    <g opacity={a * 0.85} style={{mixBlendMode: 'screen'}}>
      {lines.map((l, i) => (
        <line key={i} x1={CX + Math.cos(l.a) * l.r0} y1={950 + Math.sin(l.a) * l.r0 * 0.6} x2={CX + Math.cos(l.a) * (l.r0 + l.len)} y2={950 + Math.sin(l.a) * (l.r0 + l.len) * 0.6} stroke="#fff6d6" strokeWidth={l.w} strokeLinecap="round" />
      ))}
    </g>
  );
};

export const KiRocksForeground: React.FC = React.memo(() => (
  <g>
    <polygon points="-200,1900 -200,1100 120,1250 260,1180 420,1420 520,1900" fill="#1a110b" />
    <polygon points={`${LAYER_W + 200},1900 ${LAYER_W + 200},1050 ${LAYER_W - 140},1240 ${LAYER_W - 300},1170 ${LAYER_W - 460},1440 ${LAYER_W - 560},1900`} fill="#1a110b" />
    <polygon points="-200,1900 -200,1100 120,1250 150,1230 -200,1030" fill="#ffb23d" opacity={0.18} />
  </g>
));
