import React from 'react';
import {AbsoluteFill} from 'remotion';

// Slowly drifting cosmic colour clouds behind the WebGL canvas. Pure function of `frame`.
export const Nebula: React.FC<{frame: number; opacity: number}> = ({frame, opacity}) => (
  <AbsoluteFill style={{opacity}}>
    <AbsoluteFill
      style={{
        background: [
          `radial-gradient(ellipse at ${30 + Math.sin(frame * 0.006) * 6}% ${38 + Math.cos(frame * 0.005) * 5}%, rgba(120,60,200,0.55), transparent 58%)`,
          `radial-gradient(ellipse at ${72 + Math.cos(frame * 0.005) * 6}% ${60 + Math.sin(frame * 0.004) * 5}%, rgba(40,120,220,0.45), transparent 58%)`,
          'radial-gradient(ellipse at 50% 85%, rgba(255,160,70,0.3), transparent 52%)',
          '#04030f',
        ].join(', '),
      }}
    />
  </AbsoluteFill>
);
