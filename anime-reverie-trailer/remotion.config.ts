import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
Config.setOverwriteOutput(true);
Config.setCodec('h264');
Config.setCrf(16);
// The cosmic / debris scenes use real WebGL (three.js). "angle" is the renderer Remotion
// recommends for that. On a machine without a GPU render with: --gl=swangle
Config.setChromiumOpenGlRenderer('angle');
