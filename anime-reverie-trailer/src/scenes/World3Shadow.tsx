import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {WORLDS} from '../config';
import {Cam, LAYER_W, Stage, SvgLayer} from '../components/Parallax';
import {ParticleField} from '../components/Particles';
import {WorldFrame} from '../components/WorldFrame';
import {ease, lerp, prog} from '../lib/math';
import {FogBand, RadialGlow, Ridge, StarDust} from '../art/common';
import {Castle, DeadTrees, PurpleBeams, ShadowArmy, ShadowMoon, Tendrils} from '../art/castle';
import {lightningFlash} from '../art/city';

const CX = LAYER_W / 2;
const CASTLE_BASE = 1180;

// Slow, heavy push-in with a tilt up the castle (camera rises while it dollies forward).
export const shadowCamera = (f: number): Cam => ({
  x: lerp(-90, 90, prog(f, 0, 270, ease.inOutSine)),
  y: lerp(-100, 180, prog(f, 0, 260, ease.inOut)),
  z: lerp(0, 900, prog(f, 0, 270, ease.inOut)),
  roll: lerp(-0.6, 0.6, prog(f, 0, 270, ease.inOutSine)),
});

export const World3Shadow: React.FC = () => {
  const frame = useCurrentFrame();
  const cam = shadowCamera(frame);
  const power = lerp(0.35, 1, prog(frame, 30, 150, ease.out));
  const bolt = lightningFlash(frame, [92, 176]);
  const t = prog(frame, 138, 190, ease.out);
  const ringOpacity = t > 0 && t < 1 ? 1 - t : 0;
  return (
    <WorldFrame world={WORLDS[3]} vignette={0.82}>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, #030010 0%, #0d0426 40%, #25104d 72%, #12062e 100%)'}} />
      <Stage cam={cam}>
        <SvgLayer depth={9500}>
          <StarDust seed={4} count={160} color="#d9c8ff" />
          <ShadowMoon />
        </SvgLayer>
        <SvgLayer depth={6500}>
          <Ridge seed={14} baseY={1300} amp={520} top="#2b1260" bottom="#0a0320" freq={0.0035} sharp={1.3} />
          <FogBand y={1000} h={320} color="#5a2bd6" opacity={0.4} />
        </SvgLayer>
        <SvgLayer depth={4200}>
          <g transform={`translate(${CX} ${CASTLE_BASE}) scale(0.45) translate(${-CX} ${-CASTLE_BASE})`}>
            <PurpleBeams frame={frame} baseY={CASTLE_BASE} power={power} />
            <Castle baseY={CASTLE_BASE} />
          </g>
          <RadialGlow cx={CX} cy={CASTLE_BASE} r={900} ry={160} color="#8a43ff" opacity={0.5 * power} />
          <ellipse cx={CX} cy={CASTLE_BASE + 8} rx={lerp(100, 1900, t)} ry={lerp(14, 220, t)} fill="none" stroke="#c79bff" strokeWidth={lerp(26, 2, t)} opacity={ringOpacity} />
        </SvgLayer>
        <SvgLayer depth={2800}>
          <ShadowArmy frame={frame} baseY={1090} rows={4} scale={0.7} seed={91} />
          <FogBand y={1060} h={200} color="#4a1d9a" opacity={0.5} />
        </SvgLayer>
        <SvgLayer depth={2200}>
          <DeadTrees seed={5} count={6} baseY={1230} size={300} color="#05010c" />
        </SvgLayer>
        <SvgLayer depth={1800}>
          <Tendrils frame={frame} baseY={1330} />
          <rect x={-200} y={1330} width={4000} height={800} fill="#05010c" />
        </SvgLayer>
        <SvgLayer depth={1600}>
          <polygon points="-200,1900 -200,1250 160,1380 300,1300 520,1900" fill="#020006" />
          <polygon points={`${LAYER_W + 200},1900 ${LAYER_W + 200},1200 ${LAYER_W - 180},1340 ${LAYER_W - 360},1260 ${LAYER_W - 600},1900`} fill="#020006" />
        </SvgLayer>
      </Stage>
      <ParticleField count={120} seed={41} colors={['#c79bff', '#a566ff', '#ffffff']} size={[1.2, 4]} speed={[0.8, 3]} angle={-90} wobble={34} opacity={[0.3, 0.95]} twinkle={0.5} glow fade={power} />
      <ParticleField count={30} seed={42} colors={['#3a1380']} size={[40, 90]} speed={[0.2, 0.7]} angle={-20} opacity={[0.05, 0.14]} />
      <AbsoluteFill style={{background: '#b58cff', opacity: bolt * 0.34, mixBlendMode: 'screen'}} />
    </WorldFrame>
  );
};
