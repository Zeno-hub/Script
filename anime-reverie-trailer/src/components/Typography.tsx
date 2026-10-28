import React from 'react';
import {AbsoluteFill, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {loadFont as loadCinzel} from '@remotion/google-fonts/Cinzel';
import {loadFont as loadJosefin} from '@remotion/google-fonts/JosefinSans';
import {WorldMeta, WORLDS} from '../config';
import {clamp, lerp, prog, rgba, ease} from '../lib/math';

// Fonts are fetched from Google Fonts at render time (Remotion waits for them to load).
// Offline, the CSS stacks below fall back to Georgia / Helvetica and the render still works.
const cinzel = loadCinzel('normal', {weights: ['600', '800'], subsets: ['latin']});
const josefin = loadJosefin('normal', {weights: ['300', '400', '600'], subsets: ['latin']});
export const SERIF = `${cinzel.fontFamily}, 'Trajan Pro', Georgia, 'Times New Roman', serif`;
export const SANS = `${josefin.fontFamily}, 'Segoe UI', Helvetica, Arial, sans-serif`;

interface LettersProps {
  text: string;
  start: number; // local frame at which the first letter begins
  stagger?: number;
  size: number;
  color: string;
  glow: string;
  family?: string;
  weight?: number;
  tracking?: number; // px between letters
}

// Per-letter spring reveal: rise, scale and un-blur. Pure function of the frame.
export const AnimatedLetters: React.FC<LettersProps> = ({text, start, stagger = 2, size, color, glow, family = SERIF, weight = 800, tracking = 8}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <div style={{display: 'flex', whiteSpace: 'pre', fontFamily: family, fontWeight: weight, fontSize: size, lineHeight: 1.1, color}}>
      {Array.from(text).map((ch, i) => {
        const p = spring({frame: Math.max(0, frame - start - i * stagger), fps, config: {damping: 20, stiffness: 110, mass: 0.8}});
        const vis = clamp(p * 1.4, 0, 1);
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              opacity: vis,
              transform: `translateY(${(1 - p) * 46}px) scale(${0.86 + 0.14 * p})`,
              filter: `blur(${(1 - vis) * 16}px)`,
              marginRight: tracking,
              textShadow: `0 0 22px ${glow}, 0 0 70px ${glow}`,
            }}
          >
            {ch === ' ' ? '\u00A0' : ch}
          </span>
        );
      })}
    </div>
  );
};

// Lower-left world title card: number tag, big name, subtitle, accent rule, ghost numeral.
export const WorldTitle: React.FC<{world: WorldMeta; inAt?: number; outAt?: number}> = ({world, inAt = 24, outAt = 214}) => {
  const frame = useCurrentFrame();
  const show = prog(frame, inAt, inAt + 18, ease.out) * (1 - prog(frame, outAt, outAt + 22, ease.in));
  const line = prog(frame, inAt, inAt + 30, ease.out);
  const sub = prog(frame, inAt + 22, inAt + 44, ease.out);
  const drift = lerp(40, -40, prog(frame, 0, 270, ease.linear));
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          right: 120 + drift,
          top: 90,
          fontFamily: SERIF,
          fontWeight: 600,
          fontSize: 520,
          lineHeight: 1,
          color: 'transparent',
          WebkitTextStroke: `2px ${rgba(world.accent, 0.35)}`,
          opacity: show * 0.55,
        }}
      >
        {String(world.id).padStart(2, '0')}
      </div>
      <div style={{position: 'absolute', left: 140, bottom: 200, opacity: show > 0 ? 1 : 0}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 22, opacity: show, marginBottom: 6}}>
          <div style={{width: 260 * line, height: 3, background: world.accent, boxShadow: `0 0 18px ${world.accent}`}} />
          <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 30, letterSpacing: 14, color: world.accent, textShadow: `0 0 16px ${rgba(world.accent, 0.8)}`}}>
            {world.label}
          </div>
        </div>
        <AnimatedLetters text={world.name} start={inAt + 4} stagger={2} size={128} color="#fff6e6" glow={rgba(world.accent, 0.75)} tracking={10} />
        <div style={{fontFamily: SANS, fontWeight: 300, fontSize: 38, letterSpacing: 10, color: '#ffffff', opacity: sub * show, transform: `translateX(${(1 - sub) * -30}px)`, marginTop: 14, textShadow: '0 2px 18px rgba(0,0,0,0.8)'}}>
          {world.subtitle.toUpperCase()}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Six diamonds, bottom right, showing which world is on screen.
export const WorldPips: React.FC<{current: number}> = ({current}) => (
  <div style={{position: 'absolute', right: 120, bottom: 176, display: 'flex', gap: 18}}>
    {WORLDS.map((w) => (
      <div
        key={w.id}
        style={{
          width: 16,
          height: 16,
          transform: 'rotate(45deg)',
          background: w.id === current ? w.accent : 'transparent',
          border: `2px solid ${w.id === current ? w.accent : 'rgba(255,255,255,0.35)'}`,
          boxShadow: w.id === current ? `0 0 16px ${w.accent}` : 'none',
        }}
      />
    ))}
  </div>
);

// ANIME REVERIE logo. `start` is the local frame the reveal begins.
export const LogoTitle: React.FC<{start: number; size?: number; fadeOutAt?: number}> = ({start, size = 190, fadeOutAt}) => {
  const frame = useCurrentFrame();
  const track = lerp(60, 14, prog(frame, start, start + 70, ease.out));
  const rule = prog(frame, start + 10, start + 60, ease.out);
  const pulse = 0.75 + 0.25 * Math.sin(frame * 0.07);
  const out = fadeOutAt === undefined ? 1 : 1 - prog(frame, fadeOutAt, fadeOutAt + 24, ease.in);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', opacity: out}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 28, marginBottom: 22, opacity: rule}}>
        <div style={{width: 280 * rule, height: 2, background: 'linear-gradient(90deg, transparent, #ffe2a6)'}} />
        <div style={{width: 14, height: 14, transform: 'rotate(45deg)', background: '#ffe2a6', boxShadow: '0 0 20px #ffd37a'}} />
        <div style={{width: 280 * rule, height: 2, background: 'linear-gradient(270deg, transparent, #ffe2a6)'}} />
      </div>
      <AnimatedLetters text="ANIME REVERIE" start={start} stagger={3} size={size} color="#fff3d6" glow={rgba('#ffc866', 0.55 * pulse)} tracking={track} />
    </AbsoluteFill>
  );
};
