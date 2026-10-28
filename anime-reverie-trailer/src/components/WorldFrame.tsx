import React from 'react';
import {AbsoluteFill} from 'remotion';
import {WorldMeta} from '../config';
import {Grain, Letterbox, Vignette} from './Overlays';
import {WorldPips, WorldTitle} from './Typography';

// Shared chrome for every world scene: grade, vignette, grain, letterbox, title card.
export const WorldFrame: React.FC<{
  world: WorldMeta;
  children: React.ReactNode;
  vignette?: number;
  grain?: number;
}> = ({world, children, vignette = 0.7, grain = 0.07}) => (
  <AbsoluteFill style={{background: world.deep, overflow: 'hidden'}}>
    {children}
    <Vignette strength={vignette} />
    <Grain opacity={grain} />
    <Letterbox />
    <WorldTitle world={world} />
    <WorldPips current={world.id} />
  </AbsoluteFill>
);
