import { existsSync } from 'node:fs';
import { join } from 'node:path';

const CANDIDATES = [
  process.env.CHROME_PATH,
  process.env.PUPPETEER_EXECUTABLE_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  join(process.env.LOCALAPPDATA || '', 'Google/Chrome/Application/chrome.exe'),
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
];

export function findBrowser() {
  for (const c of CANDIDATES) {
    if (c && existsSync(c)) return c;
  }
  throw new Error('找不到 Chrome/Edge，请设置 CHROME_PATH');
}

const FF_CANDIDATES = [
  process.env.FFMPEG_PATH,
  'C:/Program Files/ffmpeg/bin/ffmpeg.exe',
  join(process.env.LOCALAPPDATA || '', 'Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin/ffmpeg.exe'),
];

export function findFfmpeg() {
  for (const c of FF_CANDIDATES) {
    if (c && existsSync(c)) return c;
  }
  return 'ffmpeg'; // 退回 PATH
}
