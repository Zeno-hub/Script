import React, {createContext, useContext} from 'react';
import {HEIGHT, WIDTH} from '../config';

// ---------------------------------------------------------------------------
// Layered "2.5D" camera.
//
// This is NOT a 3D engine. Every Layer is a flat plane at a fixed depth in front of a
// virtual pinhole camera. For a camera at (x, y, z) a plane at depth d is drawn with the
// exact perspective-projection result for a flat plane that faces the camera:
//
//     scale     = d / (d - z)
//     translate = (-x, +y) * FOCAL / (d - z)
//
// so nearer planes slide faster than far ones (true parallax) and dolly moves zoom each
// plane at the correct relative rate. What it cannot do is show a plane from the side, so
// orbit-like moves are faked by lateral travel plus roll. Real 3D (three.js) is used in the
// opening, the finale and World 5 where actual orbiting matters.
// ---------------------------------------------------------------------------
export interface Cam {
  x: number; // right is +
  y: number; // up is +
  z: number; // forward (dolly) is +
  roll: number; // degrees
}

export const FOCAL = 1400;
export const LAYER_W = 3400;
export const LAYER_H = 1900;

const CamContext = createContext<Cam>({x: 0, y: 0, z: 0, roll: 0});

export const Stage: React.FC<{cam: Cam; children: React.ReactNode}> = ({cam, children}) => (
  <CamContext.Provider value={cam}>
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: WIDTH,
        height: HEIGHT,
        overflow: 'hidden',
        transformOrigin: '50% 50%',
        transform: `rotate(${cam.roll}deg) scale(${1 + Math.abs(cam.roll) * 0.025})`,
      }}
    >
      {children}
    </div>
  </CamContext.Provider>
);

export const Layer: React.FC<{
  depth: number;
  children: React.ReactNode;
  opacity?: number;
  blur?: number;
  blend?: React.CSSProperties['mixBlendMode'];
}> = ({depth, children, opacity = 1, blur = 0, blend}) => {
  const cam = useContext(CamContext);
  const eff = Math.max(depth - cam.z, 40);
  const s = depth / eff;
  const tx = (-cam.x * FOCAL) / eff;
  const ty = (cam.y * FOCAL) / eff;
  return (
    <div
      style={{
        position: 'absolute',
        left: (WIDTH - LAYER_W) / 2,
        top: (HEIGHT - LAYER_H) / 2,
        width: LAYER_W,
        height: LAYER_H,
        transformOrigin: '50% 50%',
        transform: `translate(${tx}px, ${ty}px) scale(${s})`,
        opacity,
        filter: blur > 0 ? `blur(${blur}px)` : undefined,
        mixBlendMode: blend,
      }}
    >
      {children}
    </div>
  );
};

// A Layer whose content is an SVG authored in layer coordinates (3400 x 1900, centre 1700,950).
export const SvgLayer: React.FC<{
  depth: number;
  children: React.ReactNode;
  opacity?: number;
  blur?: number;
  blend?: React.CSSProperties['mixBlendMode'];
}> = ({depth, children, opacity, blur, blend}) => (
  <Layer depth={depth} opacity={opacity} blur={blur} blend={blend}>
    <svg width={LAYER_W} height={LAYER_H} viewBox={`0 0 ${LAYER_W} ${LAYER_H}`} style={{display: 'block', overflow: 'visible'}}>
      {children}
    </svg>
  </Layer>
);
