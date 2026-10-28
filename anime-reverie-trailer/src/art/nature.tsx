import React, {useMemo} from 'react';
import {LAYER_H, LAYER_W} from '../components/Parallax';
import {mulberry32} from '../lib/random';
import {RadialGlow, useUid} from './common';

const CX = LAYER_W / 2;

interface ForestProps {
  seed: number;
  count: number;
  baseY: number;
  size: number;
  c1: string;
  c2: string;
}

// A band of round-crowned jungle trees.
export const Forest = React.memo(function Forest({seed, count, baseY, size, c1, c2}: ForestProps) {
  const id = useUid();
  const trees = useMemo(() => {
    const r = mulberry32(seed);
    return Array.from({length: count}, (_, i) => ({
      x: (i + 0.5) * (LAYER_W / count) + (r() - 0.5) * size,
      s: size * (0.7 + r() * 0.7),
      lean: (r() - 0.5) * 0.2,
    }));
  }, [seed, count, size]);
  return (
    <g>
      <defs>
        <radialGradient id={id} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor={c1} />
          <stop offset="1" stopColor={c2} />
        </radialGradient>
      </defs>
      {trees.map((t, i) => (
        <g key={i}>
          <rect x={t.x - t.s * 0.05} y={baseY - t.s * 0.9} width={t.s * 0.1} height={t.s * 0.95 + 300} fill={c2} transform={`rotate(${t.lean * 57} ${t.x} ${baseY})`} />
          <ellipse cx={t.x} cy={baseY - t.s * 0.95} rx={t.s * 0.55} ry={t.s * 0.38} fill={`url(#${id})`} />
          <ellipse cx={t.x - t.s * 0.3} cy={baseY - t.s * 0.75} rx={t.s * 0.38} ry={t.s * 0.26} fill={`url(#${id})`} />
          <ellipse cx={t.x + t.s * 0.32} cy={baseY - t.s * 0.78} rx={t.s * 0.4} ry={t.s * 0.27} fill={`url(#${id})`} />
        </g>
      ))}
      <rect x={-200} y={baseY - 4} width={LAYER_W + 400} height={LAYER_H} fill={c2} />
    </g>
  );
});

export const WorldTree: React.FC = React.memo(() => (
  <g>
    <path d={`M ${CX - 170} 1250 Q ${CX - 90} 800 ${CX - 60} 380 L ${CX + 60} 380 Q ${CX + 100} 800 ${CX + 180} 1250 Z`} fill="#16301f" />
    <ellipse cx={CX} cy={300} rx={640} ry={250} fill="#1e5a33" />
    <ellipse cx={CX - 330} cy={420} rx={420} ry={190} fill="#2b7a45" />
    <ellipse cx={CX + 340} cy={430} rx={440} ry={200} fill="#245f3a" />
    <ellipse cx={CX} cy={240} rx={420} ry={150} fill="#3b9a58" opacity={0.8} />
  </g>
));

// Cliff face with a waterfall and mist.
export const WaterfallCliff: React.FC<{frame: number}> = ({frame}) => {
  const id = useUid();
  const streaks = Array.from({length: 9}, (_, i) => ({x: CX - 90 + i * 22, o: ((frame * 6 + i * 70) % 600) / 600}));
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4e6f58" />
          <stop offset="1" stopColor="#1a3224" />
        </linearGradient>
      </defs>
      <polygon points={`${CX - 700},1300 ${CX - 620},560 ${CX - 330},480 ${CX - 150},380 ${CX + 150},380 ${CX + 360},470 ${CX + 700},600 ${CX + 760},1300`} fill={`url(#${id})`} />
      <rect x={CX - 100} y={380} width={200} height={880} fill="#cfeee6" opacity={0.85} />
      {streaks.map((s, i) => (
        <rect key={i} x={s.x} y={380 + s.o * 700} width={6} height={160} fill="#ffffff" opacity={0.55 * (1 - s.o)} />
      ))}
      <RadialGlow cx={CX} cy={1270} r={420} ry={150} color="#ffffff" opacity={0.55} />
    </g>
  );
};

// Ancient ruins: broken columns, a standing arch and stairs.
export const Ruins: React.FC<{baseY: number; color: string; moss: string}> = React.memo(({baseY, color, moss}: {baseY: number; color: string; moss: string}) => (
  <g>
    <polygon points={`${CX - 900},${baseY + 20} ${CX + 900},${baseY + 20} ${CX + 760},${baseY - 60} ${CX - 760},${baseY - 60}`} fill={color} />
    {[0, 1, 2, 3, 4].map((i) => (
      <rect key={i} x={CX - 640 + i * 40} y={baseY - 60 - i * 26} width={1280 - i * 80} height={26} fill={color} opacity={0.9} />
    ))}
    {[-560, -380, 380, 560].map((x, i) => (
      <g key={i}>
        <rect x={CX + x - 34} y={baseY - 420 + (i % 2) * 140} width={68} height={360 - (i % 2) * 140} fill={color} />
        <rect x={CX + x - 46} y={baseY - 440 + (i % 2) * 140} width={92} height={22} fill={color} />
        <rect x={CX + x - 34} y={baseY - 120} width={68} height={60} fill={moss} opacity={0.55} />
      </g>
    ))}
    <path d={`M ${CX - 230} ${baseY - 60} L ${CX - 230} ${baseY - 360} Q ${CX} ${baseY - 640} ${CX + 230} ${baseY - 360} L ${CX + 230} ${baseY - 60} L ${CX + 150} ${baseY - 60} L ${CX + 150} ${baseY - 340} Q ${CX} ${baseY - 520} ${CX - 150} ${baseY - 340} L ${CX - 150} ${baseY - 60} Z`} fill={color} />
    <path d={`M ${CX - 230} ${baseY - 360} Q ${CX} ${baseY - 640} ${CX + 230} ${baseY - 360}`} fill="none" stroke={moss} strokeWidth={16} opacity={0.6} />
    <ellipse cx={CX} cy={baseY - 220} rx={120} ry={160} fill="#e8e07a" opacity={0.16} />
  </g>
));

export const Ferns: React.FC<{frame: number}> = ({frame}) => (
  <g>
    {Array.from({length: 22}, (_, i) => {
      const x = (i / 22) * (LAYER_W + 400) - 200;
      const sway = Math.sin(frame * 0.05 + i) * 6;
      const h = 360 + ((i * 131) % 380);
      return <path key={i} d={`M ${x} ${LAYER_H} Q ${x + 20 + sway} ${LAYER_H - h * 0.5} ${x + 90 + sway * 2} ${LAYER_H - h} Q ${x + 60} ${LAYER_H - h * 0.4} ${x + 70} ${LAYER_H} Z`} fill={i % 3 === 0 ? '#0e3a1c' : '#0a2a14'} />;
    })}
  </g>
);

// A few distant birds with flapping wings (pure sine of the frame).
export const Birds: React.FC<{frame: number}> = ({frame}) => (
  <g fill="none" stroke="#0b2417" strokeWidth={4} strokeLinecap="round">
    {Array.from({length: 7}, (_, i) => {
      const x = ((i * 520 + frame * (3 + (i % 3))) % (LAYER_W + 400)) - 200;
      const y = 380 + (i % 4) * 90 + Math.sin(frame * 0.03 + i) * 20;
      const flap = Math.sin(frame * 0.35 + i * 2) * 14;
      return <path key={i} d={`M ${x - 26} ${y + flap} Q ${x - 12} ${y - 10} ${x} ${y} Q ${x + 12} ${y - 10} ${x + 26} ${y + flap}`} />;
    })}
  </g>
);
