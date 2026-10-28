import React from 'react';
import {Composition} from 'remotion';
import {FINALE_FRAMES, FPS, HEIGHT, OPENING_FRAMES, TOTAL_FRAMES, WIDTH, WORLD_FRAMES} from './config';
import {Trailer, WORLD_SCENES} from './Trailer';
import {Opening} from './scenes/Opening';
import {Finale} from './scenes/Finale';

// "Trailer" is the full 80 s film. The Scene-* compositions render a single scene so you can
// iterate on one world in the Studio without scrubbing the whole timeline.
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Trailer" component={Trailer} durationInFrames={TOTAL_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT} />
    <Composition id="Scene-Opening" component={Opening} durationInFrames={OPENING_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT} />
    {WORLD_SCENES.map((Scene, i) => (
      <Composition key={i} id={`Scene-World${i}`} component={Scene} durationInFrames={WORLD_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT} />
    ))}
    <Composition id="Scene-Finale" component={Finale} durationInFrames={FINALE_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT} />
  </>
);
