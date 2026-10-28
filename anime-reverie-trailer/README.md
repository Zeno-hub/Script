# Anime Reverie: Cinematic Trailer (Remotion)

An 80-second, 1920x1080, 30 FPS trailer built with **Remotion 4 + React + TypeScript**.
No Roblox Studio, Luau or game runtime is needed. Everything is procedural (SVG, CSS, three.js) so there are
no image assets to supply; the only binary asset is the generated score.

**Timeline (2400 frames):** Opening 0-12 s, then Worlds 0 to 5 at 9 s each (12-66 s), then Finale 66-80 s.

| # | Scene | Look | Camera |
|---|---|---|---|
| Opening | cosmos | darkness, dust, nebula, star field, Lobby hub, ANIME REVERIE title | real 3D (three.js): deep-space approach then orbit |
| 0 | Lobby | indigo/gold, ringed planet, spire, six portals igniting in sequence | layered parallax: rising dolly + lateral sweep |
| 1 | Ki Realm | golden-hour sky, karst pillars, floating arena, energy aura, shockwave | layered parallax: crane up + forward |
| 2 | Devil District | rain, red neon, fog, wet street, lightning, horned silhouette | layered parallax: lateral street dolly + dutch roll |
| 3 | Shadow Dominion | violet night, dark castle, shadow army, tendrils, purple beams | layered parallax: slow push-in + tilt up |
| 4 | Phantom Frontier | jungle, cliffs + waterfall, ruins, world tree, birds, pollen | layered parallax: low forward flyover |
| 5 | Psychic Chaos | warped rings, glitch slices, floating debris with burst + shake | real 3D (three.js): orbit with shake |
| Finale | panorama | pull back from World 5, all six worlds with light pillars + labels, logo, tagline, fade to black | real 3D (three.js) |

**About the camera.** Worlds 0-4 are *layered artwork* with a pinhole-projection parallax model (`src/components/Parallax.tsx`):
near layers move faster, dollies scale each plane correctly. It is not a 3D engine and cannot show a plane from
the side, so "orbit-like" moves there are lateral travel plus roll. True 3D orbits are used in the Opening, World 5 and Finale.

## Requirements
- Node.js 18+ (20 or 22 recommended) and npm
- Internet on first run: npm packages, Remotion downloads its own headless Chrome, and Google Fonts
  (Cinzel, Josefin Sans) are fetched at render time. Offline, the CSS falls back to Georgia/Helvetica.
- Python 3 + numpy only if you want to regenerate the score (`npm run audio`). The WAV is already included.

## Install
```bash
unzip anime-reverie-trailer.zip
cd anime-reverie-trailer
npm install
```

## Preview
```bash
npm run dev
```
Opens Remotion Studio. Pick **Trailer** for the full film, or **Scene-Opening / Scene-World0 ... Scene-World5 / Scene-Finale**
to iterate on one scene. Scrub freely: every frame is a pure function of the frame number.

## Render the MP4 (1920x1080, 30 FPS, H.264)
```bash
npm run render
# -> out/anime-reverie-trailer.mp4
```
Quick half-resolution draft: `npm run render:draft` (out/anime-reverie-draft.mp4).
Poster frame: `npm run still` (out/poster.png).

Direct CLI form:
```bash
npx remotion render src/index.ts Trailer out/anime-reverie-trailer.mp4
```
No GPU / headless server? The WebGL scenes need a software renderer:
```bash
npx remotion render src/index.ts Trailer out/anime-reverie-trailer.mp4 --gl=swangle
```
(`remotion.config.ts` defaults to `angle`; the `--gl` flag overrides it.) Expect a long render: the SVG scenes are heavy.
Lower `--concurrency` if you run out of memory.

## Audio
`public/audio/reverie-score.wav` is an **original procedural placeholder** (pads, sub drone, pulse, risers and impacts
timed to every cut, 80 s, 32 kHz stereo). Replace the file with real music, or set `AUDIO.enabled = false` in `src/config.ts` for a silent render.
Regenerate with `npm run audio`.

## Project layout
```
src/index.ts              registerRoot entry point
src/Root.tsx              Trailer + per-scene compositions
src/Trailer.tsx           master timeline (Sequences, transitions, audio)
src/config.ts             FPS, size, durations, world metadata, tagline, audio switch
src/scenes/               Opening, World0Lobby ... World5Psychic, Finale
src/components/           Parallax camera, Particles, Typography, Overlays, Nebula, WorldFrame, Transitions
src/art/                  procedural SVG artwork per world
src/three/                three.js hub, world nodes, camera rig, stars
src/lib/                  seeded PRNG, noise, easing/math helpers
tools/make_score.py       audio generator
public/audio/             reverie-score.wav
```
Change a duration in `src/config.ts` and the Sequences, transitions and audio fades follow.
All randomness is seeded (`src/lib/random.ts`); there is no `Math.random()` or wall-clock use, so renders are deterministic.

## What was and was not tested (honest status)
**Verified here:** every relative import resolves to an included file; every imported name is exported; every external
import is declared in `package.json`; brackets balance in all source files; the PRNG/noise modules run under Node and are deterministic;
the audio generator runs and the WAV validates (80.0 s, 32 kHz stereo, peak -3 dB, via ffprobe/ffmpeg).

**NOT verified:** the sandbox had no npm registry access, so I could not `npm install`, run `tsc`, open Remotion Studio, or render a frame or the MP4.
No `package-lock.json` exists (it is created by your first `npm install`). Expect to fix small TypeScript or runtime issues on first run.

Things most likely to need attention:
- **Versions.** Remotion packages are pinned to `4.0.200` (all `remotion` / `@remotion/*` must match exactly). If that version is unavailable, run `npx remotion upgrade`.
- **Typings** for `@remotion/google-fonts` `loadFont` options and `@react-three/fiber` JSX elements (`bufferAttribute`, `points`). `npm run typecheck` will show any mismatch.
- **Look.** Composition coordinates (spire heights, portal spread, camera ranges) were written without seeing a rendered frame. Use the Studio to tune per-scene camera functions (`lobbyCamera`, `kiCamera`, ...) and art positions.
- **Performance.** Large SVG layers with blur filters are slow per frame; reduce `count` props or remove `blur` if renders crawl.

## Credits / IP
All artwork, music and text are original or procedural. Worlds are *atmospheric homages* only: no characters, logos, or footage from any anime are used.
