import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {HEIGHT, WIDTH} from '../config';
import {prog} from '../lib/math';

export const Vignette: React.FC<{strength?: number}> = ({strength = 0.7}) => (
  <AbsoluteFill
    style={{
      pointerEvents: 'none',
      background: `radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 42%, rgba(0,0,0,${strength}) 100%)`,
    }}
  />
);

// Animated film grain. Rendered at 480x270 and scaled up, so it is cheap; the seed cycles
// every 8 frames and is derived only from the frame number, so it is render-safe.
export const Grain: React.FC<{opacity?: number}> = ({opacity = 0.07}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none', opacity, mixBlendMode: 'overlay'}}>
      <svg width="100%" height="100%" viewBox="0 0 480 270" preserveAspectRatio="none" style={{display: 'block'}}>
        <filter id="reverie-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={(frame % 8) + 1} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="480" height="270" filter="url(#reverie-grain)" />
      </svg>
    </AbsoluteFill>
  );
};

// Cinematic 2.39:1 bars that slide in at the start of a scene.
export const Letterbox: React.FC<{inFrames?: number}> = ({inFrames = 24}) => {
  const frame = useCurrentFrame();
  const bar = ((HEIGHT - WIDTH / 2.39) / 2) * prog(frame, 0, inFrames);
  return (
    <>
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: bar, background: '#000'}} />
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: bar, background: '#000'}} />
    </>
  );
};

export const BlackFade: React.FC<{opacity: number}> = ({opacity}) => (
  <AbsoluteFill style={{background: '#000', opacity, pointerEvents: 'none'}} />
);
