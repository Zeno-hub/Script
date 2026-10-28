import React from 'react';
import {AbsoluteFill} from 'remotion';
import {HEIGHT, WIDTH} from '../config';
import {lerp, prog, ease} from '../lib/math';
import {mulberry32} from '../lib/random';

// Swirling magenta/cyan backdrop. CSS conic gradients rotate with the frame.
export const PsychicBackdrop: React.FC<{frame: number}> = ({frame}) => (
  <AbsoluteFill>
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 50%, #3a0f6a 0%, #16042a 60%, #05010c 100%)'}} />
    <AbsoluteFill
      style={{
        opacity: 0.55,
        mixBlendMode: 'screen',
        background: `conic-gradient(from ${frame * 1.2}deg at 50% 50%, #ff6ee0, #16042a 18%, #5ee7ff 36%, #16042a 54%, #ff6ee0 72%, #16042a 90%, #ff6ee0)`,
        maskImage: 'radial-gradient(circle at 50% 50%, transparent 8%, black 70%)',
        WebkitMaskImage: 'radial-gradient(circle at 50% 50%, transparent 8%, black 70%)',
      }}
    />
  </AbsoluteFill>
);

// Expanding distortion rings, with a displacement filter whose frequency evolves per frame
// so the geometry warps. Chromatic split is two offset copies in cyan and magenta.
export const PsychicRings: React.FC<{frame: number; intensity: number}> = ({frame, intensity}) => {
  const rings = Array.from({length: 7}, (_, i) => {
    const t = ((frame + i * 14) % 98) / 98;
    return {r: lerp(60, 1300, ease.out(t)), o: (1 - t) * intensity, w: lerp(26, 3, t)};
  });
  const warp = 18 + 22 * intensity;
  return (
    <AbsoluteFill style={{mixBlendMode: 'screen'}}>
      <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
        <defs>
          <filter id="psyWarp" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency={`${0.006 + 0.002 * Math.sin(frame * 0.05)} 0.012`} numOctaves={2} seed={3} result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale={warp} xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
        <g>
          {rings.map((r, i) => (
            <g key={i}>
              <circle cx={WIDTH / 2 - 8} cy={HEIGHT / 2} r={r.r} fill="none" stroke="#5ee7ff" strokeWidth={r.w} opacity={r.o * 0.8} />
              <circle cx={WIDTH / 2 + 8} cy={HEIGHT / 2} r={r.r} fill="none" stroke="#ff6ee0" strokeWidth={r.w} opacity={r.o * 0.8} />
            </g>
          ))}
        </g>
      </svg>
    </AbsoluteFill>
  );
};

// Horizontal glitch slices that tear sideways in short deterministic bursts.
export const GlitchSlices: React.FC<{frame: number; bursts: number[]}> = ({frame, bursts}) => {
  const active = bursts.find((b) => frame >= b && frame < b + 6);
  if (active === undefined) return null;
  const r = mulberry32(active * 7 + frame);
  return (
    <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'screen'}}>
      {Array.from({length: 9}, (_, i) => {
        const y = r() * HEIGHT;
        const h = 14 + r() * 70;
        const dx = (r() - 0.5) * 160;
        return <div key={i} style={{position: 'absolute', left: dx, top: y, width: WIDTH, height: h, background: i % 2 ? 'rgba(94,231,255,0.18)' : 'rgba(255,110,224,0.2)'}} />;
      })}
    </AbsoluteFill>
  );
};

export const Scanlines: React.FC = () => (
  <AbsoluteFill style={{pointerEvents: 'none', opacity: 0.12, background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.9) 0px, rgba(0,0,0,0.9) 1px, transparent 1px, transparent 4px)'}} />
);

export const burstFlash = (frame: number, at: number): number => prog(frame, at, at + 2, ease.linear) * (1 - prog(frame, at + 2, at + 16, ease.out));
