import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {interpolate} from 'remotion';
import {rgba} from '../lib/math';

// A light-sweep + colour flash that peaks exactly on the cut, so the hard cut underneath is
// never visible. It is a pure function of the local frame.
const Flash: React.FC<{half: number; color: string}> = ({half, color}) => {
  const t = useCurrentFrame();
  const a = interpolate(t, [0, half - 3, half + 2, half * 2], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const x = interpolate(t, [0, half * 2], [-70, 130]);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill
        style={{
          opacity: a,
          background: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.97) 0%, ${rgba(color, 1)} 55%, ${rgba(color, 0.9)} 100%)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: -200,
          bottom: -200,
          left: `${x}%`,
          width: '45%',
          transform: 'skewX(-18deg)',
          opacity: 0.9 * Math.sin((Math.PI * t) / (half * 2)),
          background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.95), rgba(255,255,255,0))',
          mixBlendMode: 'screen',
        }}
      />
    </AbsoluteFill>
  );
};

export const TransitionAt: React.FC<{cut: number; color: string; half?: number}> = ({cut, color, half = 14}) => (
  <Sequence from={cut - half} durationInFrames={half * 2} layout="none">
    <Flash half={half} color={color} />
  </Sequence>
);
