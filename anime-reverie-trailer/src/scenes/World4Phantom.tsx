import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {WORLDS} from '../config';
import {Cam, LAYER_W, Stage, SvgLayer} from '../components/Parallax';
import {ParticleField} from '../components/Particles';
import {WorldFrame} from '../components/WorldFrame';
import {ease, lerp, prog} from '../lib/math';
import {CloudBank, FogBand, Rays, Ridge} from '../art/common';
import {Birds, Ferns, Forest, Ruins, WaterfallCliff, WorldTree} from '../art/nature';

const CX = LAYER_W / 2;

// Low forward flyover through the frontier with a gentle sway and rising finish.
export const phantomCamera = (f: number): Cam => ({
  x: 260 * Math.sin(prog(f, 0, 270, ease.linear) * Math.PI * 1.2 - 0.6),
  y: lerp(-60, 140, prog(f, 0, 270, ease.inOut)),
  z: lerp(0, 700, prog(f, 0, 270, ease.inOut)),
  roll: lerp(1.2, -1.2, prog(f, 0, 270, ease.inOutSine)),
});

export const World4Phantom: React.FC = () => {
  const frame = useCurrentFrame();
  const cam = phantomCamera(frame);
  return (
    <WorldFrame world={WORLDS[4]} vignette={0.62}>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, #1f6a6a 0%, #6fb59a 34%, #cfe6a8 62%, #f4f0b4 82%, #fff6cf 100%)'}} />
      <Stage cam={cam}>
        <SvgLayer depth={10000}>
          <Rays cx={CX + 600} cy={760} count={16} length={2600} color="#fffbd0" opacity={0.28} rotation={frame * 0.04} spread={180} />
          <CloudBank seed={21} y={900} count={8} color="#ffffff" shade="#cfe6e0" opacity={0.75} scale={1.3} />
        </SvgLayer>
        <SvgLayer depth={8200}>
          <Ridge seed={33} baseY={1250} amp={540} top="#7fb3a8" bottom="#4a8a7a" freq={0.0028} opacity={0.9} />
        </SvgLayer>
        <SvgLayer depth={7000}>
          <g transform={`translate(${CX - 400} 1250) scale(0.6) translate(${-CX} -1250)`}>
            <WorldTree />
          </g>
          <FogBand y={1000} h={300} color="#e6fff0" opacity={0.5} />
        </SvgLayer>
        <SvgLayer depth={5200}>
          <g transform={`translate(${CX + 500} 1300) scale(0.62) translate(${-CX} -1300)`}>
            <WaterfallCliff frame={frame} />
          </g>
        </SvgLayer>
        <SvgLayer depth={3700}>
          <g transform={`translate(${CX - 350} 1130) scale(0.7) translate(${-CX} -1130)`}>
            <Ruins baseY={1130} color="#6a7a62" moss="#4e8a4a" />
          </g>
          <Birds frame={frame} />
        </SvgLayer>
        <SvgLayer depth={2700}>
          <Forest seed={5} count={14} baseY={1190} size={380} c1="#4fae5a" c2="#1e5a33" />
          <FogBand y={1020} h={240} color="#e6fff0" opacity={0.35} />
        </SvgLayer>
        <SvgLayer depth={1900}>
          <Forest seed={9} count={9} baseY={1290} size={560} c1="#3a9a4a" c2="#134a26" />
        </SvgLayer>
        <SvgLayer depth={1500}>
          <Ferns frame={frame} />
        </SvgLayer>
      </Stage>
      <ParticleField count={80} seed={51} colors={['#fff6b0', '#d6ff9a', '#ffffff']} size={[1.2, 3.4]} speed={[0.5, 1.6]} angle={-20} wobble={40} opacity={[0.35, 0.9]} twinkle={0.4} glow />
      <ParticleField count={26} seed={52} colors={['#7fc45a', '#b6e06a', '#e8c85a']} size={[3, 6]} speed={[1.6, 3.6]} angle={25} wobble={46} opacity={[0.5, 0.95]} />
    </WorldFrame>
  );
};
