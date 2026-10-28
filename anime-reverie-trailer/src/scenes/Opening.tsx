import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {Nebula} from '../components/Nebula';
import {BlackFade, Grain, Letterbox, Vignette} from '../components/Overlays';
import {ParticleField} from '../components/Particles';
import {LogoTitle} from '../components/Typography';
import {ease, lerp, prog} from '../lib/math';
import {CameraRig, CamState, Stars} from '../three/shared';
import {LobbyHub} from '../three/Hub';

// Real 3D camera: a long approach from deep space that settles into an orbit of the Lobby hub.
export const openingCamera = (frame: number): CamState => {
  const t = prog(frame, 40, 350, ease.inOutSine);
  const r = lerp(190, 34, t);
  const theta = lerp(0.15, 1.25, t);
  return {
    pos: [Math.sin(theta) * r, lerp(18, 6, t), Math.cos(theta) * r],
    target: [0, 5, 0],
    fov: lerp(48, 60, t),
  };
};

export const Opening: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const reveal = prog(frame, 70, 220, ease.inOutSine);
  const black = 1 - prog(frame, 30, 150, ease.inOutSine);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Nebula frame={frame} opacity={reveal} />
      <ThreeCanvas width={width} height={height} camera={{fov: 50, near: 0.1, far: 2500, position: [0, 0, 100]}}>
        <ambientLight intensity={1.1} />
        <directionalLight position={[20, 30, 10]} intensity={2.2} color="#ffe6b0" />
        <directionalLight position={[-20, 10, -20]} intensity={1.2} color="#8fa2ff" />
        <CameraRig state={openingCamera(frame)} />
        <Stars count={1800} radius={900} seed={7} size={2.4} />
        <LobbyHub frame={frame} glow={reveal} />
      </ThreeCanvas>
      <BlackFade opacity={black} />
      <ParticleField
        count={150}
        seed={3}
        colors={['#ffe2a6', '#8fa2ff', '#ffffff']}
        size={[1, 3.4]}
        speed={[0.15, 0.6]}
        angle={-70}
        wobble={30}
        opacity={[0.25, 0.85]}
        twinkle={0.6}
        glow
        fade={prog(frame, 0, 45)}
      />
      <LogoTitle start={215} fadeOutAt={322} />
      <Vignette />
      <Grain />
      <Letterbox />
    </AbsoluteFill>
  );
};
