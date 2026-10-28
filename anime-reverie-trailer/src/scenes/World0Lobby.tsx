import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {WORLDS} from '../config';
import {Cam, LAYER_W, Stage, SvgLayer} from '../components/Parallax';
import {ParticleField} from '../components/Particles';
import {WorldFrame} from '../components/WorldFrame';
import {ease, lerp, prog} from '../lib/math';
import {LobbyFarIslands, LobbyForeground, LobbyHub2D, LobbyPortals, LobbySkyFar} from '../art/lobby';

const CX = LAYER_W / 2;

// Rising dolly with a lateral sweep: reads as a sweeping orbit-like reveal of the hub.
export const lobbyCamera = (f: number): Cam => ({
  x: lerp(-420, 420, prog(f, 0, 270, ease.inOutSine)),
  y: lerp(-80, 140, prog(f, 0, 230, ease.inOut)),
  z: lerp(-250, 430, prog(f, 0, 270, ease.inOut)),
  roll: lerp(-1.2, 1.2, prog(f, 0, 270, ease.inOutSine)),
});

export const World0Lobby: React.FC = () => {
  const frame = useCurrentFrame();
  const cam = lobbyCamera(frame);
  return (
    <WorldFrame world={WORLDS[0]}>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, #05051a 0%, #1a1650 42%, #5a3a7a 70%, #ffb25c 100%)'}} />
      <Stage cam={cam}>
        <SvgLayer depth={9000}>
          <LobbySkyFar />
        </SvgLayer>
        <SvgLayer depth={6000}>
          <LobbyFarIslands />
        </SvgLayer>
        <SvgLayer depth={3600}>
          <g transform={`translate(${CX} 1050) scale(0.58) translate(${-CX} -1010)`}>
            <LobbyHub2D />
          </g>
        </SvgLayer>
        <SvgLayer depth={2000}>
          <LobbyPortals frame={frame} />
        </SvgLayer>
        <SvgLayer depth={900}>
          <LobbyForeground frame={frame} />
        </SvgLayer>
      </Stage>
      <ParticleField count={90} seed={21} colors={['#ffe2a6', '#ffd37a', '#ffffff']} size={[1.2, 3.8]} speed={[0.3, 1.1]} angle={-80} wobble={34} opacity={[0.3, 0.9]} twinkle={0.5} glow />
      <ParticleField count={50} seed={22} colors={['#8fa2ff', '#c9b8ff']} size={[0.8, 2]} speed={[0.1, 0.4]} angle={-30} wobble={20} opacity={[0.2, 0.6]} glow />
    </WorldFrame>
  );
};
