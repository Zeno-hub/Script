import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {WORLDS} from '../config';
import {Cam, LAYER_W, Stage, SvgLayer} from '../components/Parallax';
import {ParticleField} from '../components/Particles';
import {WorldFrame} from '../components/WorldFrame';
import {ease, lerp, prog} from '../lib/math';
import {CloudBank, Island, Rays} from '../art/common';
import {KarstPillars, KiArena, KiAura, KiRocksForeground, KiShockwave, SpeedLines} from '../art/ki';

const CX = LAYER_W / 2;

// Crane up and forward over the floating arena.
export const kiCamera = (f: number): Cam => ({
  x: lerp(-220, 260, prog(f, 0, 270, ease.inOutSine)),
  y: lerp(-300, 200, prog(f, 0, 250, ease.inOut)),
  z: lerp(0, 800, prog(f, 0, 270, ease.inOut)),
  roll: lerp(0.8, -0.8, prog(f, 0, 270, ease.inOutSine)),
});

export const World1Ki: React.FC = () => {
  const frame = useCurrentFrame();
  const cam = kiCamera(frame);
  const power = lerp(0.55, 1, prog(frame, 40, 130, ease.out));
  const flare = prog(frame, 112, 126, ease.out) * (1 - prog(frame, 126, 150, ease.in));
  return (
    <WorldFrame world={WORLDS[1]} vignette={0.6}>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, #14264f 0%, #35508f 28%, #e58a52 62%, #ffcf7a 82%, #ffe7b0 100%)'}} />
      <Stage cam={cam}>
        <SvgLayer depth={10000}>
          <Rays cx={CX} cy={900} count={22} length={2800} color="#fff0c0" opacity={0.22} rotation={frame * 0.05} />
          <CloudBank seed={3} y={1000} count={9} color="#ffe8cc" shade="#e59a68" opacity={0.85} scale={1.4} />
        </SvgLayer>
        <SvgLayer depth={6500}>
          <KarstPillars seed={8} count={9} baseY={1350} minH={500} maxH={900} minW={170} maxW={300} c1="#6f86b8" c2="#c98f6a" cap="#5d7a4a" />
        </SvgLayer>
        <SvgLayer depth={4300}>
          {[0, 1, 2, 3, 4].map((i) => (
            <Island key={i} x={500 + i * 620} y={760 + ((i * 110) % 300)} w={330 + (i % 2) * 150} h={230} seed={40 + i} top="#7a9a5a" rock1="#8a6a50" rock2="#3a2a22" rim="#ffe2a6" />
          ))}
          <CloudBank seed={5} y={1180} count={7} color="#fff1dc" shade="#e0956a" opacity={0.9} />
        </SvgLayer>
        <SvgLayer depth={2800}>
          <KiArena />
          <KiAura frame={frame} baseY={1000} power={power} />
          <KiShockwave frame={frame} start={118} y={1004} />
        </SvgLayer>
        <SvgLayer depth={1900}>
          <CloudBank seed={9} y={1380} count={5} color="#fff6e6" shade="#f0a878" opacity={0.7} scale={1.2} />
        </SvgLayer>
        <SvgLayer depth={1500}>
          <KiRocksForeground />
        </SvgLayer>
        <SvgLayer depth={2800} blend="screen">
          <SpeedLines frame={frame} start={112} end={142} />
        </SvgLayer>
      </Stage>
      <ParticleField count={110} seed={31} colors={['#fff2b0', '#ffb23d', '#ff7a1f']} size={[1.4, 4.6]} speed={[1.6, 5.2]} angle={-90} wobble={26} opacity={[0.4, 1]} twinkle={0.4} glow fade={lerp(0.5, 1, power)} />
      <AbsoluteFill style={{background: '#fff4cf', opacity: flare * 0.55, mixBlendMode: 'screen'}} />
    </WorldFrame>
  );
};
