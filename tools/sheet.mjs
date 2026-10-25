import puppeteer from 'puppeteer-core';
import { startServer } from './serve.mjs';
import { findBrowser } from './paths.mjs';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { W, H } from '../src/main/consts.mjs';

const argv = process.argv.slice(2);
const arg = (k, d) => {
  const i = argv.indexOf('--' + k);
  return i >= 0 ? argv[i + 1] : d;
};

const OUT = arg('out', 'docs/media/sheet.png');
const COLS = Number(arg('cols', 6));
const CW = Number(arg('w', 320));
const LABEL = arg('label', '');
let times = [];
if (arg('times')) times = String(arg('times')).split(',').map(Number);
else {
  const from = Number(arg('from', 0));
  const to = Number(arg('to', 137));
  const n = Number(arg('n', 24));
  for (let i = 0; i < n; i++) times.push(from + ((to - from) * i) / Math.max(1, n - 1));
}

mkdirSync(dirname(OUT), { recursive: true });

const { server, port } = await startServer(0);
const browser = await puppeteer.launch({
  executablePath: findBrowser(),
  headless: 'shell',
  args: ['--force-device-scale-factor=1', '--disable-lcd-text', '--font-render-hinting=none', '--hide-scrollbars'],
});
const page = await browser.newPage();
await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
await page.goto(`http://127.0.0.1:${port}/?raw=1`, { waitUntil: 'networkidle0' });
await page.waitForFunction('window.__ready === true', { timeout: 90000 });

const shots = [];
for (const t of times) {
  await page.evaluate((tt) => window.renderAt(tt), t);
  const buf = await page.screenshot({ encoding: 'base64' });
  shots.push({ t, src: `data:image/png;base64,${buf}` });
  process.stdout.write(`\r${t.toFixed(2)}s   `);
}
console.log('');

const ch = Math.round((CW * 9) / 16);
const rows = Math.ceil(shots.length / COLS);
const gap = 10;
const pad = 18;
const labelH = 26;
const strip = arg('strip', 'o') === 'h';
const cw = strip ? CW : CW;
const gridW = pad * 2 + COLS * CW + (COLS - 1) * gap;
const gridH = pad * 2 + rows * (ch + labelH) + (rows - 1) * gap + 8;

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
  html,body{margin:0;background:#141414;}
  #wrap{width:${gridW}px;padding:0;font-family:Consolas,monospace;}
  h2{color:#d8d2c4;font-size:15px;font-weight:500;margin:12px 0 4px ${pad}px;letter-spacing:.05em}
  .grid{display:grid;grid-template-columns:repeat(${COLS}, ${CW}px);gap:${gap}px;padding:0 ${pad}px ${pad}px;}
  .cell img{width:${CW}px;height:${ch}px;display:block;background:#000}
  .cell div{color:#8c8778;font-size:12px;margin-top:3px;letter-spacing:.04em}
</style></head><body><div id="wrap">
<h2>${LABEL}</h2>
<div class="grid">
${shots.map((s) => `<div class="cell"><img src="${s.src}"><div>${s.t.toFixed(2)}s</div></div>`).join('\n')}
</div></div></body></html>`;

const sheet = await browser.newPage();
await sheet.setViewport({ width: gridW, height: Math.max(300, gridH + 30), deviceScaleFactor: 1 });
await sheet.setContent(html, { waitUntil: 'networkidle0' });
await new Promise((r) => setTimeout(r, 250));
await sheet.screenshot({ path: OUT, fullPage: true });
console.log('sheet →', OUT, `${gridW}px`);

await browser.close();
server.close();
