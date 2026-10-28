import React, {useMemo} from 'react';
import * as THREE from 'three';
import {useThree} from '@react-three/fiber';
import {mulberry32} from '../lib/random';

export interface CamState {
  pos: [number, number, number];
  target: [number, number, number];
  fov: number;
  roll?: number; // radians
}

// Drives the three.js camera from a pure function of the Remotion frame. It is set
// imperatively during render (not via R3F's useFrame loop) so the result for frame N never
// depends on how many frames were rendered before it.
export const CameraRig: React.FC<{state: CamState}> = ({state}) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const roll = state.roll ?? 0;
  camera.position.set(state.pos[0], state.pos[1], state.pos[2]);
  camera.up.set(Math.sin(roll), Math.cos(roll), 0);
  camera.lookAt(state.target[0], state.target[1], state.target[2]);
  camera.fov = state.fov;
  camera.updateProjectionMatrix();
  return null;
};

export const Stars: React.FC<{count: number; radius: number; seed: number; size?: number; opacity?: number}> = ({count, radius, seed, size = 2.2, opacity = 0.9}) => {
  const {positions, colors} = useMemo(() => {
    const r = mulberry32(seed);
    const p = new Float32Array(count * 3);
    const c = new Float32Array(count * 3);
    const tints: [number, number, number][] = [
      [1, 1, 1],
      [0.75, 0.85, 1],
      [1, 0.9, 0.72],
      [0.9, 0.75, 1],
    ];
    for (let i = 0; i < count; i++) {
      const u = 2 * r() - 1;
      const th = 2 * Math.PI * r();
      const rad = radius * (0.35 + 0.65 * r());
      const s = Math.sqrt(1 - u * u);
      p[i * 3] = rad * s * Math.cos(th);
      p[i * 3 + 1] = rad * u;
      p[i * 3 + 2] = rad * s * Math.sin(th);
      const t = tints[Math.floor(r() * tints.length)];
      const b = 0.55 + 0.45 * r();
      c[i * 3] = t[0] * b;
      c[i * 3 + 1] = t[1] * b;
      c[i * 3 + 2] = t[2] * b;
    }
    return {positions: p, colors: c};
  }, [count, radius, seed]);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={size} sizeAttenuation vertexColors transparent opacity={opacity} depthWrite={false} />
    </points>
  );
};

// Cheap additive "glow": a few translucent shells.
export const GlowSphere: React.FC<{radius: number; color: string; strength?: number}> = ({radius, color, strength = 1}) => (
  <group>
    {[1.18, 1.5, 2.0, 2.8].map((k, i) => (
      <mesh key={i}>
        <sphereGeometry args={[radius * k, 24, 24]} />
        <meshBasicMaterial color={color} transparent opacity={(0.2 / (i + 1)) * strength} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    ))}
  </group>
);

export const LightPillar: React.FC<{color: string; height: number; radius?: number; opacity?: number}> = ({color, height, radius = 0.5, opacity = 0.32}) => (
  <mesh position={[0, height / 2, 0]}>
    <cylinderGeometry args={[radius * 0.5, radius, height, 24, 1, true]} />
    <meshBasicMaterial color={color} transparent opacity={opacity} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
  </mesh>
);
