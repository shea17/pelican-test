import { findFfmpeg } from './paths.mjs';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const argv = process.argv.slice(2);
const arg = (k, d) => {
  const i = argv.indexOf('--' + k);
  return i >= 0 ? argv[i + 1] : d;
};

const FPS = Number(arg('fps', 30));
const DIR = arg('dir', 'frames');
const PREFIX = arg('prefix', 'f');
const OUT = arg('out', 'out/pelican-test.mp4');
const AUDIO = arg('audio', '');
const CRF = arg('crf', '17');

mkdirSync(dirname(OUT), { recursive: true });

const ff = findFfmpeg();
const args = [
  '-y', '-hide_banner', '-loglevel', 'warning',
  '-framerate', String(FPS),
  '-i', `${DIR}/${PREFIX}%05d.png`,
];
if (AUDIO && existsSync(AUDIO)) args.push('-i', AUDIO);
args.push(
  '-c:v', 'libx264', '-preset', 'slow', '-crf', CRF,
  '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
  '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709'
);
if (AUDIO && existsSync(AUDIO)) {
  args.push('-c:a', 'aac', '-b:a', '256k', '-shortest');
}
args.push(OUT);

console.log(ff);
console.log(args.join(' '));
const r = spawnSync(ff, args, { stdio: 'inherit' });
if (r.status !== 0) {
  console.error('ffmpeg failed', r.status);
  process.exit(r.status || 1);
}
console.log('→', OUT);
