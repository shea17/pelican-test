// mux —— 把画面与配乐合成一条。画面直接拷贝，不重编码。
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';

const argv = process.argv.slice(2);
const arg = (k, d) => {
  const i = argv.indexOf('--' + k);
  return i >= 0 ? argv[i + 1] : d;
};

const VIDEO = arg('video', 'out/pelican-test-v3.mp4');
const AUDIO = arg('audio', 'out/score.wav');
const OUT = arg('out', 'out/pelican-test-final.mp4');

function findFfmpeg() {
  // 先看 PATH 里有没有
  const probe = spawnSync('ffmpeg', ['-version'], { stdio: 'ignore' });
  if (probe.status === 0) return 'ffmpeg';
  const roots = [
    `${process.env.LOCALAPPDATA}\\Microsoft\\WinGet\\Packages`,
    'C:\\ffmpeg\\bin',
    '/usr/bin',
    '/usr/local/bin',
  ];
  for (const root of roots) {
    if (!fs.existsSync(root)) continue;
    const stack = [root];
    let guard = 0;
    while (stack.length && guard++ < 4000) {
      const dir = stack.pop();
      let items = [];
      try { items = fs.readdirSync(dir, { withFileTypes: true }); } catch { continue; }
      for (const it of items) {
        const p = `${dir}/${it.name}`;
        if (it.isDirectory()) { if (/ffmpeg/i.test(it.name) || /winget/i.test(dir) || guard < 40) stack.push(p); }
        else if (it.name === 'ffmpeg.exe' || it.name === 'ffmpeg') return p;
      }
    }
  }
  return 'ffmpeg';
}

const ff = findFfmpeg();
const args = [
  '-y', '-hide_banner', '-loglevel', 'warning',
  '-i', VIDEO,
  '-i', AUDIO,
  '-c:v', 'copy',
  '-c:a', 'aac', '-b:a', '192k', '-ar', '48000',
  '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11',
  '-shortest',
  '-movflags', '+faststart',
  OUT,
];
console.log(ff, args.join(' '));
const r = spawnSync(ff, args, { stdio: 'inherit' });
process.exit(r.status ?? 1);
