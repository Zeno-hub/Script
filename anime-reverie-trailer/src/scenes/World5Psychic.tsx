import React, {useMemo} from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {WORLDS} from '../config';
import {ParticleField} from '../components/Particles';
import {WorldFrame} from '../components/WorldFrame';
import {ease, lerp, prog} from '../lib/math';
import {makeNoise} from '../lib/noise';
import {mulberry32} from '../lib/random';
import {GlitchSlices, PsychicBackdrop, PsychicRings, Scanlines, burstFlash} from '../art/psychic';
import {CameraRig, CamState, GlowSphere} from '../three/shared';

interface Shard {
  x: number;
  y: number;
  z: number;
  type: number;
  s: number;
  spin: [number, number, number];
  orbit: number;
  warm: boolean;
}

const BURST_AT = 186;
const shake = makeNoise(77);

// Real 3D: the camera orbits a core of floating debris, then shakes as the burst hits.
export const psychicCamera = (f: number): CamState => {
  const burst = prog(f, BURST_AT - 8, BURST_AT + 10, ease.out) * (1 - prog(f, BURST_AT + 10, BURST_AT + 70, ease.inOut));
  const amp = burst * 1.4;
  const theta = f * 0.017 + 0.4;
  const r = lerp(34, 19, prog(f, 0, 200, ease.inOut));
  return {
    pos: [
      Math.sin(theta) * r + (shake(f * 0.9) - 0.5) * amp,
      4 + 3 * Math.sin(f * 0.02) + (shake(f * 0.9 + 40) - 0.5) * amp,
      Math.cos(theta) * r + (shake(f * 0.9 + 80) - 0.5) * amp,
    ],
    target: [0, 0, 0],
    fov: lerp(58, 72, burst) ,
    roll: 0.1 * Math.sin(f * 0.04) + (shake(f * 0.5 + 9) - 0.5) * 0.3 * burst,
  };
};

const ShardMesh: React.FC<{shard: Shard; frame: number; expand: number}> = ({shard, frame, expand}) => {
  const a = shard.orbit * frame;
  const c = Math.cos(a);
  const s = Math.sin(a);
  const k = 1 + expand;
  const x = (shard.x * c - shard.z * s) * k;
  const z = (shard.x * s + shard.z * c) * k;
  const color = shard.warm ? '#ff6ee0' : '#5ee7ff';
  return (
    <mesh position={[x, shard.y * k, z]} rotation={[shard.spin[0] * frame, shard.spin[1] * frame, shard.spin[2] * frame]} scale={shard.s}>
      {shard.type === 0 ? <boxGeometry args={[1, 1.6, 0.5]} /> : null}
      {shard.type === 1 ? <tetrahedronGeometry args={[1]} /> : null}
      {shard.type === 2 ? <octahedronGeometry args={[1]} /> : null}
      {shard.type === 3 ? <icosahedronGeometry args={[1, 0]} /> : null}
      <meshStandardMaterial color="#2a0f45" emissive={color} emissiveIntensity={0.85} flatShading roughness={0.4} />
    </mesh>
  );
};

export const World5Psychic: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const shards = useMemo<Shard[]>(() => {
    const r = mulberry32(555);
    return Array.from({length: 64}, () => {
      const rad = 6 + r() * 18;
      const th = r() * Math.PI * 2;
      return {
        x: Math.cos(th) * rad,
        z: Math.sin(th) * rad,
        y: (r() - 0.5) * 16,
        type: Math.floor(r() * 4),
        s: 0.5 + r() * 1.7,
        spin: [(r() - 0.5) * 0.06, (r() - 0.5) * 0.06, (r() - 0.5) * 0.06] as [number, number, number],
        orbit: (r() > 0.5 ? 1 : -1) * (0.004 + r() * 0.01),
        warm: r() > 0.5,
      };
    });
  }, []);
  const expand = prog(frame, BURST_AT - 4, BURST_AT + 30, ease.out) * 0.9;
  const flash = burstFlash(frame, BURST_AT);
  const intensity = lerp(0.55, 1, prog(frame, 0, 180)) ;
  return (
    <WorldFrame world={WORLDS[5]} vignette={0.7}>
      <PsychicBackdrop frame={frame} />
      <PsychicRings frame={frame} intensity={intensity} />
      <ThreeCanvas width={width} height={height} camera={{fov: 60, near: 0.1, far: 500, position: [0, 0, 30]}}>
        <ambientLight intensity={0.9} />
        <directionalLight position={[10, 14, 8]} intensity={2} color="#ffd6f6" />
        <directionalLight position={[-12, -6, -10]} intensity={1.6} color="#7fefff" />
        <CameraRig state={psychicCamera(frame)} />
        <group>
          <GlowSphere radius={2.4 + 0.25 * Math.sin(frame * 0.2)} color="#ff6ee0" strength={1.4} />
          <mesh rotation={[frame * 0.03, frame * 0.021, 0]}>
            <icosahedronGeometry args={[2.1, 1]} />
            <meshBasicMaterial color="#fff0fb" />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, frame * 0.02]}>
            <torusGeometry args={[5.2, 0.06, 8, 96]} />
            <meshBasicMaterial color="#5ee7ff" />
          </mesh>
          <mesh rotation={[Math.PI / 3, frame * 0.017, 0]}>
            <torusGeometry args={[7.4, 0.05, 8, 96]} />
            <meshBasicMaterial color="#ff6ee0" />
          </mesh>
        </group>
        {shards.map((sh, i) => (
          <ShardMesh key={i} shard={sh} frame={frame} expand={expand} />
        ))}
      </ThreeCanvas>
      <GlitchSlices frame={frame} bursts={[60, 118, 186, 200, 232]} />
      <ParticleField count={100} seed={61} colors={['#ff6ee0', '#5ee7ff', '#ffffff']} size={[1.4, 4.4]} speed={[1, 4]} angle={-45} wobble={50} opacity={[0.4, 1]} twinkle={0.5} glow />
      <AbsoluteFill style={{background: '#ffffff', opacity: flash * 0.8, mixBlendMode: 'screen'}} />
      <Scanlines />
    </WorldFrame>
  );
};
