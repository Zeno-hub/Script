import React, {useMemo} from 'react';
import {WORLDS} from '../config';
import {LAYER_W} from '../components/Parallax';
import {clamp, prog, ease, rgba} from '../lib/math';
import {mulberry32} from '../lib/random';
import {Island, RadialGlow, Ridge, StarDust, useUid} from './common';

const CX = LAYER_W / 2;

export const LobbySkyFar: React.FC = React.memo(() => (
  <g>
    <StarDust seed={11} count={260} color="#dfe6ff" />
    <RadialGlow cx={CX} cy={980} r={1300} ry={520} color="#ffb85c" opacity={0.55} />
    {/* ringed planet */}
    <g transform="translate(2650 420) rotate(-18)">
      <circle r={190} fill="#4b3a8c" />
      <circle r={190} fill="url(#lobbyPlanetShade)" />
      <ellipse rx={380} ry={62} fill="none" stroke="#c9b8ff" strokeWidth={14} opacity={0.5} />
      <defs>
        <radialGradient id="lobbyPlanetShade" cx="0.3" cy="0.3" r="0.9">
          <stop offset="0" stopColor="#b9a4ff" stopOpacity="0.6" />
          <stop offset="1" stopColor="#0b0b24" stopOpacity="0.85" />
        </radialGradient>
      </defs>
    </g>
    <circle cx={620} cy={360} r={72} fill="#e8eaff" opacity={0.85} />
    <circle cx={640} cy={348} r={72} fill="#1a1a46" opacity={0.18} />
  </g>
));

export const LobbyFarIslands: React.FC = React.memo(() => (
  <g>
    <Ridge seed={5} baseY={1130} amp={170} top="#2b2f7a" bottom="#14163f" freq={0.0032} />
    {[0, 1, 2, 3, 4, 5, 6].map((i) => (
      <Island key={i} x={300 + i * 440 + (i % 2) * 90} y={560 + ((i * 97) % 260)} w={190 + (i % 3) * 70} h={150 + (i % 2) * 70} seed={20 + i} top="#4a58c4" rock1="#2a3070" rock2="#12143a" rim="#8fa2ff" />
    ))}
  </g>
));

// The grand hub: stepped base, colonnade, spire and halo rings.
export const LobbyHub2D: React.FC = React.memo(() => {
  const id = useUid();
  const cols = useMemo(() => {
    const r = mulberry32(77);
    return Array.from({length: 10}, (_, i) => ({x: CX - 760 + i * 168 + (i >= 5 ? 0 : 0), h: 250 + r() * 60}));
  }, []);
  return (
    <g>
      <defs>
        <linearGradient id={`${id}spire`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff0c8" />
          <stop offset="0.5" stopColor="#e2b968" />
          <stop offset="1" stopColor="#6b5a9a" />
        </linearGradient>
        <linearGradient id={`${id}stone`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5a63b8" />
          <stop offset="1" stopColor="#1e2160" />
        </linearGradient>
        <linearGradient id={`${id}beam`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe9b0" stopOpacity="0" />
          <stop offset="1" stopColor="#ffd37a" stopOpacity="0.7" />
        </linearGradient>
      </defs>
      <polygon points={`${CX - 90},0 ${CX + 90},0 ${CX + 40},1000 ${CX - 40},1000`} fill={`url(#${id}beam)`} />
      {/* base steps */}
      <polygon points={`${CX - 1000},1180 ${CX + 1000},1180 ${CX + 860},1090 ${CX - 860},1090`} fill={`url(#${id}stone)`} />
      <polygon points={`${CX - 860},1090 ${CX + 860},1090 ${CX + 740},1010 ${CX - 740},1010`} fill="#3a3f94" />
      {/* colonnade */}
      {cols.map((c, i) => (
        <g key={i}>
          <rect x={c.x} y={1010 - c.h} width={34} height={c.h} fill={`url(#${id}stone)`} />
          <rect x={c.x - 10} y={1010 - c.h - 16} width={54} height={16} fill="#7480d8" />
        </g>
      ))}
      <rect x={CX - 790} y={1010 - 330} width={1590} height={26} fill="#7480d8" />
      <path d={`M ${CX - 790} ${1010 - 330} Q ${CX} ${1010 - 480} ${CX + 800} ${1010 - 330}`} fill="none" stroke="#a9b6ff" strokeWidth={10} opacity={0.7} />
      {/* spire */}
      <polygon points={`${CX - 150},1010 ${CX + 150},1010 ${CX + 70},520 ${CX},120 ${CX - 70},520`} fill={`url(#${id}spire)`} />
      {[0.25, 0.45, 0.65, 0.82].map((t, i) => (
        <rect key={i} x={CX - 18 - (1 - t) * 40} y={1010 - t * 880} width={36 + (1 - t) * 80} height={8} fill="#fff6d6" opacity={0.8} />
      ))}
      {/* halo rings */}
      <ellipse cx={CX} cy={300} rx={230} ry={50} fill="none" stroke="#ffe2a6" strokeWidth={6} opacity={0.8} />
      <ellipse cx={CX} cy={300} rx={170} ry={36} fill="none" stroke="#ffffff" strokeWidth={3} opacity={0.6} />
      <RadialGlow cx={CX} cy={140} r={260} color="#fff0c0" opacity={0.9} />
    </g>
  );
});

// Six portals in an arc; each ignites in sequence. `frame` is the scene-local frame.
export const LobbyPortals: React.FC<{frame: number}> = ({frame}) => (
  <g>
    {WORLDS.map((w, i) => {
      const t = (i - 2.5) / 2.5; // -1..1
      const x = CX + t * 780;
      const y = 1060 - (1 - t * t) * 120;
      const on = prog(frame, 70 + i * 14, 100 + i * 14, ease.out);
      const spin = frame * (i % 2 === 0 ? 2.2 : -2.2);
      const pulse = 0.85 + 0.15 * Math.sin(frame * 0.12 + i);
      return (
        <g key={w.id} transform={`translate(${x} ${y})`}>
          <RadialGlow cx={0} cy={-190} r={340} ry={380} color={w.accent} opacity={on * 0.6 * pulse} />
          <ellipse cx={0} cy={0} rx={120} ry={22} fill="#0b0b24" opacity={0.6} />
          <ellipse cx={0} cy={-190} rx={112} ry={176} fill={w.accent} opacity={on * 0.25} />
          <ellipse cx={0} cy={-190} rx={112} ry={176} fill="none" stroke={w.accent} strokeWidth={14} opacity={0.35 + on * 0.65} />
          <ellipse cx={0} cy={-190} rx={84} ry={140} fill="none" stroke="#ffffff" strokeWidth={4} strokeDasharray="26 22" transform={`rotate(${spin} 0 -190)`} opacity={on * 0.9} />
          <ellipse cx={0} cy={-190} rx={52} ry={90} fill="none" stroke={w.accent} strokeWidth={5} strokeDasharray="10 18" transform={`rotate(${-spin * 1.4} 0 -190)`} opacity={on * 0.8} />
          <rect x={-130} y={-10} width={260} height={22} fill="#2b3180" />
          <rect x={-150} y={8} width={300} height={16} fill="#1a1d5a" />
        </g>
      );
    })}
  </g>
);

export const LobbyForeground: React.FC<{frame: number}> = ({frame}) => (
  <g>
    <polygon points={`-200,1900 ${LAYER_W + 200},1900 ${LAYER_W + 200},1320 -200,1320`} fill="#0b0c2e" />
    <ellipse cx={CX} cy={1330} rx={1500} ry={200} fill="#151a56" />
    {[1, 0.78, 0.56, 0.34].map((s, i) => (
      <ellipse key={i} cx={CX} cy={1330} rx={1500 * s} ry={200 * s} fill="none" stroke="#ffd37a" strokeWidth={4} opacity={clamp(0.25 + 0.1 * Math.sin(frame * 0.05 + i), 0, 1)} />
    ))}
    {[-1, 1].map((side) => (
      <g key={side}>
        <rect x={CX + side * 1250 - 50} y={500} width={100} height={900} fill="#0a0b26" />
        <rect x={CX + side * 1250 - 80} y={470} width={160} height={40} fill="#12143a" />
        <circle cx={CX + side * 1250} cy={430} r={26} fill="#ffd37a" opacity={0.9} />
      </g>
    ))}
  </g>
);
