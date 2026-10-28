import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile} from 'remotion';
import {AUDIO, FINALE_FRAMES, FINALE_START, OPENING_FRAMES, TOTAL_FRAMES, WORLDS, WORLD_FRAMES, worldStart} from './config';
import {TransitionAt} from './components/Transitions';
import {Opening} from './scenes/Opening';
import {World0Lobby} from './scenes/World0Lobby';
import {World1Ki} from './scenes/World1Ki';
import {World2Devil} from './scenes/World2Devil';
import {World3Shadow} from './scenes/World3Shadow';
import {World4Phantom} from './scenes/World4Phantom';
import {World5Psychic} from './scenes/World5Psychic';
import {Finale} from './scenes/Finale';

// Exact order requested: World 0 .. World 5.
export const WORLD_SCENES: React.FC[] = [World0Lobby, World1Ki, World2Devil, World3Shadow, World4Phantom, World5Psychic];

export const Trailer: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <Sequence from={0} durationInFrames={OPENING_FRAMES}>
      <Opening />
    </Sequence>
    {WORLD_SCENES.map((Scene, i) => (
      <Sequence key={i} from={worldStart(i)} durationInFrames={WORLD_FRAMES}>
        <Scene />
      </Sequence>
    ))}
    <Sequence from={FINALE_START} durationInFrames={FINALE_FRAMES}>
      <Finale />
    </Sequence>

    {/* light-sweep transitions, centred on every cut */}
    <TransitionAt cut={OPENING_FRAMES} color={WORLDS[0].accent} half={22} />
    {WORLDS.slice(1).map((w) => (
      <TransitionAt key={w.id} cut={worldStart(w.id)} color={w.accent} />
    ))}
    <TransitionAt cut={FINALE_START} color="#ffffff" half={18} />

    {AUDIO.enabled ? (
      <Audio
        src={staticFile(AUDIO.file)}
        volume={(f) =>
          interpolate(f, [0, 45, TOTAL_FRAMES - 75, TOTAL_FRAMES - 5], [0, 1, 1, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }) * AUDIO.volume
        }
      />
    ) : null}
  </AbsoluteFill>
);
