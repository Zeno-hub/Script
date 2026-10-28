import React from 'react';
import * as THREE from 'three';
import {WORLDS} from '../config';
import {GlowSphere, LightPillar} from './shared';

export const NODE_RADIUS = 34;

// World k (1..5) sits on a ring around the Lobby hub at the origin.
export const nodeAngle = (k: number): number => ((k - 1) * Math.PI * 2) / 5;
export const nodePos = (k: number): [number, number, number] => [
  Math.cos(nodeAngle(k)) * NODE_RADIUS,
  Math.sin(k * 1.7) * 2.5,
  Math.sin(nodeAngle(k)) * NODE_RADIUS,
];

// World 0: the central Lobby platform, spire, six world portals and orbiting islands.
export const LobbyHub: React.FC<{frame: number; glow?: number}> = ({frame, glow = 1}) => (
  <group>
    <mesh position={[0, -0.4, 0]}>
      <cylinderGeometry args={[6.4, 5.2, 0.9, 48]} />
      <meshStandardMaterial color="#232a63" emissive="#4a3a12" emissiveIntensity={0.6 * glow} metalness={0.4} roughness={0.5} />
    </mesh>
    <mesh position={[0, 0.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[6.1, 0.1, 12, 96]} />
      <meshBasicMaterial color="#ffd37a" />
    </mesh>
    <mesh position={[0, 5, 0]}>
      <coneGeometry args={[1.5, 9, 6]} />
      <meshStandardMaterial color="#d9c48f" emissive="#ffb84a" emissiveIntensity={0.55 * glow} metalness={0.5} roughness={0.4} />
    </mesh>
    <group position={[0, 11 + Math.sin(frame * 0.04) * 0.4, 0]}>
      <mesh rotation={[0, frame * 0.02, 0]}>
        <octahedronGeometry args={[1.2]} />
        <meshBasicMaterial color="#fff0c0" />
      </mesh>
      <GlowSphere radius={1.4} color="#ffd37a" strength={glow} />
    </group>
    <LightPillar color="#ffd37a" height={70} radius={0.9} opacity={0.22 * glow} />

    {WORLDS.map((w, i) => {
      const a = (i / 6) * Math.PI * 2;
      const x = Math.cos(a) * 8.2;
      const z = Math.sin(a) * 8.2;
      return (
        <group key={w.id} position={[x, 2.2, z]} rotation={[0, Math.atan2(-x, -z), 0]}>
          <mesh>
            <torusGeometry args={[1.7, 0.13, 16, 64]} />
            <meshBasicMaterial color={w.accent} />
          </mesh>
          <mesh rotation={[0, 0, frame * 0.03 * (i % 2 === 0 ? 1 : -1)]}>
            <torusGeometry args={[1.25, 0.05, 8, 48]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.7} />
          </mesh>
          <mesh>
            <circleGeometry args={[1.6, 48]} />
            <meshBasicMaterial color={w.accent} transparent opacity={0.2 * glow} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
          </mesh>
        </group>
      );
    })}

    {Array.from({length: 6}, (_, i) => {
      const a = (i / 6) * Math.PI * 2 + frame * 0.004 + 0.5;
      const r = 14 + (i % 2) * 3.5;
      const y = 1.5 + (i % 3) * 1.2 + Math.sin(frame * 0.03 + i) * 0.6;
      return (
        <group key={i} position={[Math.cos(a) * r, y, Math.sin(a) * r]}>
          <mesh>
            <cylinderGeometry args={[1.9, 1.6, 0.4, 7]} />
            <meshStandardMaterial color="#3a4590" emissive="#1a1f55" emissiveIntensity={0.5 * glow} roughness={0.6} />
          </mesh>
          <mesh position={[0, -1.5, 0]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[1.6, 2.8, 7]} />
            <meshStandardMaterial color="#232a63" emissive="#10143a" emissiveIntensity={0.4 * glow} roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.9, 0]} rotation={[0, frame * 0.03 + i, 0]}>
            <octahedronGeometry args={[0.45]} />
            <meshBasicMaterial color="#ffe2a6" />
          </mesh>
        </group>
      );
    })}
  </group>
);

// Simple identity silhouettes for worlds 1..5 (used in the finale panorama).
export const WorldNode: React.FC<{k: number; frame: number}> = ({k, frame}) => {
  const w = WORLDS[k];
  const p = nodePos(k);
  const mat = (dark: string, em: number) => <meshStandardMaterial color={dark} emissive={w.accent} emissiveIntensity={em} roughness={0.5} metalness={0.3} />;
  let body: React.ReactNode;
  if (k === 1) {
    body = (
      <group>
        <mesh>
          <cylinderGeometry args={[3, 2.6, 0.6, 8]} />
          {mat('#6a4a22', 0.45)}
        </mesh>
        <mesh position={[0, -2.1, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[2.6, 4, 8]} />
          {mat('#4a3218', 0.25)}
        </mesh>
        {Array.from({length: 7}, (_, i) => (
          <mesh key={i} position={[Math.cos(i * 0.9) * 1.1, 2.4 + (i % 3) * 0.5, Math.sin(i * 0.9) * 1.1]} rotation={[0, 0, (i - 3) * 0.12]}>
            <coneGeometry args={[0.35, 3.4 + (i % 3), 6]} />
            <meshBasicMaterial color={i % 2 ? '#fff0b0' : w.accent} transparent opacity={0.85} />
          </mesh>
        ))}
      </group>
    );
  } else if (k === 2) {
    body = (
      <group>
        {[-1.6, 0, 1.5].map((x, i) => (
          <mesh key={i} position={[x, 1.2 + i * 0.7, (i - 1) * 0.6]}>
            <boxGeometry args={[1.2, 2.6 + i * 1.4, 1.2]} />
            {mat('#1a0a10', 0.8)}
          </mesh>
        ))}
        <mesh position={[0, -0.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[3.3, 0.08, 8, 64]} />
          <meshBasicMaterial color={w.accent} />
        </mesh>
      </group>
    );
  } else if (k === 3) {
    body = (
      <group>
        <mesh position={[0, 1.8, 0]}>
          <coneGeometry args={[1.6, 5.6, 6]} />
          {mat('#12062a', 0.9)}
        </mesh>
        {[-2.2, 2.2].map((x, i) => (
          <mesh key={i} position={[x, 0.9, 0.3]}>
            <coneGeometry args={[0.8, 3, 5]} />
            {mat('#12062a', 0.7)}
          </mesh>
        ))}
        <mesh position={[0, -0.6, 0]}>
          <cylinderGeometry args={[3.6, 3.2, 0.7, 10]} />
          {mat('#0a0418', 0.5)}
        </mesh>
      </group>
    );
  } else if (k === 4) {
    body = (
      <group>
        <mesh rotation={[frame * 0.01, frame * 0.015, 0]}>
          <icosahedronGeometry args={[2.1, 0]} />
          {mat('#1c5a2c', 0.7)}
        </mesh>
        <mesh position={[0, -0.4, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[3.4, 0.07, 8, 64]} />
          <meshBasicMaterial color={w.accent2} />
        </mesh>
      </group>
    );
  } else {
    body = (
      <group>
        <mesh rotation={[frame * 0.02, frame * 0.027, 0]}>
          <torusKnotGeometry args={[1.5, 0.38, 96, 12]} />
          {mat('#3a1450', 0.9)}
        </mesh>
        {Array.from({length: 5}, (_, i) => {
          const a = (i / 5) * Math.PI * 2 + frame * 0.03;
          return (
            <mesh key={i} position={[Math.cos(a) * 3.4, Math.sin(a * 1.3) * 1.2, Math.sin(a) * 3.4]} rotation={[a, a * 0.7, 0]}>
              <octahedronGeometry args={[0.5]} />
              <meshBasicMaterial color={i % 2 ? w.accent2 : w.accent} />
            </mesh>
          );
        })}
      </group>
    );
  }
  return (
    <group position={p}>
      <LightPillar color={w.accent} height={70} radius={1} opacity={0.3} />
      <GlowSphere radius={3.2} color={w.accent} strength={0.9} />
      {body}
    </group>
  );
};
