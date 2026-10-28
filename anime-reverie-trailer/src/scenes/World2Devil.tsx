import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {WORLDS} from '../config';
import {Cam, Stage, SvgLayer} from '../components/Parallax';
import {ParticleField} from '../components/Particles';
import {WorldFrame} from '../components/WorldFrame';
import {ease, lerp, prog} from '../lib/math';
import {FogBand, RadialGlow, Ridge} from '../art/common';
import {AviationLights, DevilFigure, NeonSigns, Skyline, Streetlamp, WetStreet, Wires, lightningFlash} from '../art/city';

const FAR_LIT = ['#ffb070', '#ff6a3d'];
const MID_LIT = ['#ffcf8a', '#ff8aa0', '#ff6a3d', '#ffe9b0'];

// Lateral street-level dolly with a slight dutch roll.
export const devilCamera = (f: number): Cam => ({
  x: lerp(-700, 700, prog(f, 0, 270, ease.inOutSine)),
  y: lerp(-40, 60, prog(f, 0, 270, ease.inOut)),
  z: lerp(0, 220, prog(f, 0, 270, ease.inOut)),
  roll: lerp(2.4, -1.6, prog(f, 0, 270, ease.inOutSine)),
});

export const World2Devil: React.FC = () => {
  const frame = useCurrentFrame();
  const cam = devilCamera(frame);
  const lf = lightningFlash(frame, [88, 176]);
  const appear = prog(frame, 100, 150, ease.out) * (1 - prog(frame, 200, 240, ease.in));
  return (
    <WorldFrame world={WORLDS[2]} vignette={0.8}>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, #05010a 0%, #1a0510 45%, #4a0f1f 78%, #1a0510 100%)'}} />
      <Stage cam={cam}>
        <SvgLayer depth={12000}>
          <RadialGlow cx={1700} cy={900} r={1400} ry={520} color="#a0102b" opacity={0.6} />
          <circle cx={2300} cy={520} r={150} fill="#ff2e4d" opacity={0.75} />
        </SvgLayer>
        <SvgLayer depth={8000}>
          <Skyline seed={61} baseY={1120} minW={90} maxW={190} minH={280} maxH={620} color="#12040a" lit={FAR_LIT} chance={0.12} />
          <AviationLights frame={frame} />
        </SvgLayer>
        <SvgLayer depth={5200}>
          <Skyline seed={62} baseY={1160} minW={150} maxW={300} minH={400} maxH={820} color="#0a0207" edge="#ff2e4d" lit={MID_LIT} chance={0.2} />
          <FogBand y={900} h={300} color="#6a1428" opacity={0.55} />
        </SvgLayer>
        <SvgLayer depth={3200}>
          <Skyline seed={63} baseY={1240} minW={240} maxW={420} minH={520} maxH={760} color="#060106" edge="#ff8aa0" lit={MID_LIT} chance={0.16} />
          <NeonSigns frame={frame} />
          <DevilFigure x={1760} baseY={1240} frame={frame} appear={appear} />
        </SvgLayer>
        <SvgLayer depth={2000}>
          <WetStreet frame={frame} />
          <FogBand y={1020} h={260} color="#8a1a34" opacity={0.45} />
        </SvgLayer>
        <SvgLayer depth={1300}>
          <Wires />
          <Streetlamp x={700} baseY={1700} h={900} flicker={frame % 37 < 3 ? 0.4 : 1} />
          <Streetlamp x={2500} baseY={1700} h={900} />
        </SvgLayer>
      </Stage>
      <ParticleField count={380} seed={71} colors={['#c8d4f0', '#ffb0c0']} size={[1, 1.8]} speed={[34, 52]} angle={100} streak={0.9} opacity={[0.25, 0.65]} />
      <ParticleField count={140} seed={72} colors={['#ffffff', '#ffb0c0']} size={[1.8, 3]} speed={[48, 70]} angle={102} streak={0.9} opacity={[0.3, 0.75]} />
      <ParticleField count={40} seed={73} colors={['#ff2e4d', '#ff8aa0']} size={[1, 3]} speed={[0.4, 1.4]} angle={-80} wobble={30} opacity={[0.3, 0.8]} glow />
      <AbsoluteFill style={{background: '#ff9aa8', opacity: lf * 0.38, mixBlendMode: 'screen'}} />
    </WorldFrame>
  );
};
