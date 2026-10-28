import React from 'react';
import * as THREE from 'three';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {HEIGHT, TAGLINE, WIDTH, WORLDS} from '../config';
import {Nebula} from '../components/Nebula';
import {BlackFade, Grain, Letterbox, Vignette} from '../components/Overlays';
import {ParticleField} from '../components/Particles';
import {LogoTitle, SANS} from '../components/Typography';
import {ease, lerp, prog, rgba} from '../lib/math';
import {CameraRig, CamState, Stars} from '../three/shared';
import {LobbyHub, WorldNode, nodeAngle, nodePos} from '../three/Hub';

// Starts a few units off World 5, pulls straight back and up, then orbits the whole ring
// of worlds: a real 3D camera path.
export const finaleCamera = (frame: number): CamState => {
  const a5 = nodeAngle(5);
  const t1 = prog(frame, 0, 170, ease.inOut);
  const t2 = prog(frame, 120, 420, ease.inOutSine);
  const R = lerp(46, 118, t1);
  const theta = a5 + 1.0 * t2;
  const y = lerp(3.5, 62, t1) + 14 * t2;
  const orb = nodePos(5);
  return {
    pos: [Math.cos(theta) * R, y, Math.sin(theta) * R],
    target: [lerp(orb[0], 0, t1), lerp(orb[1], 2, t1), lerp(orb[2], 0, t1)],
    fov: lerp(52, 46, t1),
  };
};

// Pure projection of a world-space point through the same camera, used for the HTML labels.
const projector = new THREE.PerspectiveCamera(50, WIDTH / HEIGHT, 0.1, 2500);
const project = (cam: CamState, p: [number, number, number]): {x: number; y: number; ok: boolean} => {
  projector.position.set(cam.pos[0], cam.pos[1], cam.pos[2]);
  projector.up.set(0, 1, 0);
  projector.lookAt(cam.target[0], cam.target[1], cam.target[2]);
  projector.fov = cam.fov;
  projector.aspect = WIDTH / HEIGHT;
  projector.updateProjectionMatrix();
  projector.updateMatrixWorld();
  const v = new THREE.Vector3(p[0], p[1], p[2]).project(projector);
  return {x: (v.x * 0.5 + 0.5) * WIDTH, y: (-v.y * 0.5 + 0.5) * HEIGHT, ok: v.z > -1 && v.z < 1};
};

const Labels: React.FC<{frame: number; cam: CamState}> = ({frame, cam}) => (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    {WORLDS.map((w) => {
      const base: [number, number, number] = w.id === 0 ? [0, 15, 0] : (() => {
        const p = nodePos(w.id);
        return [p[0], p[1] + 8, p[2]];
      })();
      const pt = project(cam, base);
      const a = prog(frame, 165 + w.id * 7, 190 + w.id * 7) * (1 - prog(frame, 232, 252));
      if (!pt.ok || a <= 0) return null;
      return (
        <div key={w.id} style={{position: 'absolute', left: pt.x, top: pt.y, transform: 'translate(-50%, -100%)', opacity: a, textAlign: 'center', fontFamily: SANS}}>
          <div style={{fontSize: 22, fontWeight: 600, letterSpacing: 8, color: w.accent, textShadow: `0 0 14px ${rgba(w.accent, 0.9)}`}}>{w.label}</div>
          <div style={{fontSize: 30, fontWeight: 600, letterSpacing: 5, color: '#fff', textShadow: '0 2px 14px rgba(0,0,0,0.9)'}}>{w.name}</div>
          <div style={{width: 2, height: 36 * a, margin: '6px auto 0', background: w.accent, boxShadow: `0 0 10px ${w.accent}`}} />
        </div>
      );
    })}
  </AbsoluteFill>
);

export const Finale: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const cam = finaleCamera(frame);
  const scrim = prog(frame, 236, 290);
  const tagline = prog(frame, 300, 345, ease.out);
  const black = prog(frame, 372, 414, ease.inOutSine);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Nebula frame={frame + 400} opacity={1} />
      <ThreeCanvas width={width} height={height} camera={{fov: 50, near: 0.1, far: 2500, position: [0, 0, 100]}}>
        <ambientLight intensity={1.1} />
        <directionalLight position={[30, 40, 20]} intensity={2.0} color="#ffe6b0" />
        <directionalLight position={[-30, 10, -30]} intensity={1.2} color="#8fa2ff" />
        <CameraRig state={cam} />
        <Stars count={2200} radius={1000} seed={19} size={2.6} />
        <LobbyHub frame={frame} glow={1} />
        {[1, 2, 3, 4, 5].map((k) => (
          <WorldNode key={k} k={k} frame={frame} />
        ))}
      </ThreeCanvas>
      <ParticleField count={90} seed={8} colors={['#ffe2a6', '#8fa2ff', '#ffffff']} size={[1, 3]} speed={[0.2, 0.7]} angle={-60} wobble={26} opacity={[0.2, 0.7]} twinkle={0.5} glow />
      <Labels frame={frame} cam={cam} />
      <AbsoluteFill style={{opacity: scrim, background: 'radial-gradient(ellipse at 50% 50%, rgba(2,2,12,0.82) 0%, rgba(2,2,12,0.35) 55%, rgba(2,2,12,0) 80%)'}} />
      <LogoTitle start={240} />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 700,
          textAlign: 'center',
          fontFamily: SANS,
          fontWeight: 300,
          fontSize: 50,
          letterSpacing: 10,
          color: '#fff6e6',
          opacity: tagline,
          transform: `translateY(${(1 - tagline) * 18}px)`,
          textShadow: '0 0 24px rgba(255,200,110,0.55), 0 2px 18px rgba(0,0,0,0.9)',
        }}
      >
        {TAGLINE}
      </div>
      <Vignette />
      <Grain />
      <Letterbox />
      <BlackFade opacity={black} />
    </AbsoluteFill>
  );
};
