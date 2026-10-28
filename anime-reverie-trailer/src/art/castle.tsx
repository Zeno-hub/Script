import React, {useMemo} from 'react';
import {LAYER_W} from '../components/Parallax';
import {clamp, prog, ease} from '../lib/math';
import {mulberry32} from '../lib/random';
import {RadialGlow, useUid} from './common';

const CX = LAYER_W / 2;

export const ShadowMoon: React.FC = React.memo(() => (
  <g>
    <RadialGlow cx={CX + 380} cy={520} r={900} color="#6a2bd6" opacity={0.55} />
    <circle cx={CX + 380} cy={520} r={190} fill="#d9c8ff" />
    <circle cx={CX + 340} cy={500} r={190} fill="#12052e" opacity={0.28} />
    <circle cx={CX + 380} cy={520} r={190} fill="none" stroke="#a566ff" strokeWidth={6} opacity={0.7} />
  </g>
));

interface Tower {
  x: number;
  w: number;
  h: number;
  roof: number;
}

const TOWERS: Tower[] = [
  {x: -620, w: 150, h: 560, roof: 260},
  {x: -430, w: 110, h: 430, roof: 190},
  {x: -250, w: 170, h: 720, roof: 330},
  {x: 250, w: 170, h: 720, roof: 330},
  {x: 430, w: 110, h: 430, roof: 190},
  {x: 620, w: 150, h: 560, roof: 260},
  {x: -60, w: 120, h: 1020, roof: 520},
  {x: 60, w: 120, h: 860, roof: 380},
];

// The imposing dark castle. Windows glow purple; baseY is the ground line.
export const Castle: React.FC<{baseY: number}> = React.memo(({baseY}: {baseY: number}) => {
  const id = useUid();
  const windows = useMemo(() => {
    const r = mulberry32(55);
    return TOWERS.flatMap((t, ti) =>
      Array.from({length: 4 + (ti % 3)}, (_, i) => ({x: CX + t.x + (r() - 0.5) * (t.w * 0.5), y: baseY - 120 - r() * (t.h - 160), k: ti})),
    );
  }, [baseY]);
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1d0b3d" />
          <stop offset="1" stopColor="#07020f" />
        </linearGradient>
      </defs>
      {/* curtain wall */}
      <rect x={CX - 760} y={baseY - 260} width={1520} height={300} fill="#08030f" />
      {Array.from({length: 38}, (_, i) => (
        <rect key={i} x={CX - 760 + i * 40} y={baseY - 290} width={24} height={34} fill="#08030f" />
      ))}
      {TOWERS.map((t, i) => (
        <g key={i}>
          <rect x={CX + t.x - t.w / 2} y={baseY - t.h} width={t.w} height={t.h + 40} fill={`url(#${id})`} />
          <polygon points={`${CX + t.x - t.w / 2 - 14},${baseY - t.h} ${CX + t.x + t.w / 2 + 14},${baseY - t.h} ${CX + t.x},${baseY - t.h - t.roof}`} fill="#05010c" />
          <polygon points={`${CX + t.x},${baseY - t.h - t.roof} ${CX + t.x + t.w / 2 + 14},${baseY - t.h} ${CX + t.x + 6},${baseY - t.h}`} fill="#240f4a" opacity={0.7} />
        </g>
      ))}
      {windows.map((w, i) => (
        <g key={i}>
          <rect x={w.x - 6} y={w.y} width={12} height={26} rx={6} fill="#c79bff" />
          <rect x={w.x - 14} y={w.y - 8} width={28} height={42} rx={14} fill="#a566ff" opacity={0.18} />
        </g>
      ))}
      <path d={`M ${CX - 110} ${baseY + 40} L ${CX - 110} ${baseY - 120} Q ${CX} ${baseY - 230} ${CX + 110} ${baseY - 120} L ${CX + 110} ${baseY + 40} Z`} fill="#000" />
      <path d={`M ${CX - 80} ${baseY + 40} L ${CX - 80} ${baseY - 100} Q ${CX} ${baseY - 190} ${CX + 80} ${baseY - 100} L ${CX + 80} ${baseY + 40} Z`} fill="#8a43ff" opacity={0.55} />
    </g>
  );
});

// Purple energy columns rising from the tallest spires (animated, additive).
export const PurpleBeams: React.FC<{frame: number; baseY: number; power: number}> = ({frame, baseY, power}) => {
  const id = useUid();
  const flick = 0.8 + 0.2 * Math.sin(frame * 0.2);
  return (
    <g style={{mixBlendMode: 'screen'}} opacity={power}>
      <defs>
        <linearGradient id={id} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#c79bff" stopOpacity="0.9" />
          <stop offset="1" stopColor="#7a35ff" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[-60, 60, -250, 250].map((dx, i) => (
        <g key={i}>
          <rect x={CX + dx - 14 * flick} y={0} width={28 * flick} height={baseY - 700 - (i > 1 ? 0 : 300)} fill={`url(#${id})`} opacity={0.9} />
          <RadialGlow cx={CX + dx} cy={baseY - 1000 + (i > 1 ? 340 : 0)} r={170} color="#a566ff" opacity={0.9 * flick} />
        </g>
      ))}
    </g>
  );
};

// Ranks of silhouetted soldiers with glowing eyes; the whole army sways slightly.
export const ShadowArmy: React.FC<{frame: number; baseY: number; rows: number; scale: number; seed: number}> = ({frame, baseY, rows, scale, seed}) => {
  const id = useUid();
  const units = useMemo(() => {
    const r = mulberry32(seed);
    const out: {x: number; y: number; s: number; p: number}[] = [];
    for (let row = 0; row < rows; row++) {
      const n = 22 - row * 2;
      for (let i = 0; i < n; i++) {
        out.push({x: CX + (i - (n - 1) / 2) * (110 + row * 14) * scale + (r() - 0.5) * 24, y: baseY + row * 46 * scale, s: scale * (1 + row * 0.12), p: r() * 6});
      }
    }
    return out;
  }, [rows, scale, baseY, seed]);
  return (
    <g>
      <defs>
        <g id={`${id}u`}>
          <ellipse cx={0} cy={0} rx={30} ry={8} fill="#a566ff" opacity={0.22} />
          <path d="M -16 0 L -14 -88 Q -26 -100 -10 -118 L 10 -118 Q 26 -100 14 -88 L 16 0 Z" fill="#030008" />
          <circle cx={0} cy={-132} r={15} fill="#030008" />
          <rect x={22} y={-170} width={5} height={170} fill="#030008" />
          <circle cx={-5} cy={-134} r={2.4} fill="#d6b0ff" />
          <circle cx={5} cy={-134} r={2.4} fill="#d6b0ff" />
        </g>
      </defs>
      {units.map((u, i) => (
        <use key={i} href={`#${id}u`} transform={`translate(${u.x} ${u.y + Math.sin(frame * 0.07 + u.p) * 3}) scale(${u.s})`} />
      ))}
    </g>
  );
};

// Bare, branching dead trees.
export const DeadTrees: React.FC<{seed: number; count: number; baseY: number; size: number; color: string}> = React.memo(({seed, count, baseY, size, color}: {seed: number; count: number; baseY: number; size: number; color: string}) => {
  const paths = useMemo(() => {
    const r = mulberry32(seed);
    const out: string[] = [];
    const branch = (x: number, y: number, ang: number, len: number, depth: number, acc: string[]) => {
      if (depth === 0 || len < 8) return;
      const nx = x + Math.cos(ang) * len;
      const ny = y + Math.sin(ang) * len;
      acc.push(`M ${x.toFixed(1)} ${y.toFixed(1)} L ${nx.toFixed(1)} ${ny.toFixed(1)}`);
      branch(nx, ny, ang - 0.4 - r() * 0.4, len * (0.68 + r() * 0.12), depth - 1, acc);
      branch(nx, ny, ang + 0.4 + r() * 0.4, len * (0.68 + r() * 0.12), depth - 1, acc);
    };
    for (let i = 0; i < count; i++) {
      const acc: string[] = [];
      branch((i + 0.5) * (LAYER_W / count) + (r() - 0.5) * 200, baseY, -Math.PI / 2 + (r() - 0.5) * 0.3, size * (0.8 + r() * 0.5), 6, acc);
      out.push(acc.join(' '));
    }
    return out;
  }, [seed, count, baseY, size]);
  return (
    <g stroke={color} strokeWidth={size * 0.05} strokeLinecap="round" fill="none">
      {paths.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </g>
  );
});

// Shadow tendrils creeping up from the ground; animated sine paths.
export const Tendrils: React.FC<{frame: number; baseY: number}> = ({frame, baseY}) => (
  <g fill="none" strokeLinecap="round" style={{mixBlendMode: 'screen'}}>
    {Array.from({length: 18}, (_, i) => {
      const x = 200 + i * 180;
      const h = 260 + ((i * 97) % 280);
      const grow = prog(frame, 20 + (i % 6) * 6, 120 + (i % 6) * 6, ease.out);
      const pts = Array.from({length: 9}, (_, k) => {
        const t = k / 8;
        return `${(x + Math.sin(frame * 0.06 + t * 5 + i) * 38 * t).toFixed(1)} ${(baseY - h * t * grow).toFixed(1)}`;
      });
      return <path key={i} d={`M ${pts.join(' L ')}`} stroke="#8a43ff" strokeWidth={6 - clamp(i % 3, 0, 2)} opacity={0.55 * grow} />;
    })}
  </g>
);
