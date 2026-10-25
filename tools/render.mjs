import puppeteer from 'puppeteer-core';
import { startServer } from './serve.mjs';
import { findBrowser } from './paths.mjs';
import { mkdirSync, existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { W, H } from '../src/main/consts.mjs';

const argv = process.argv.slice(2);
const arg = (k, d) => {
  const i = argv.indexOf('--' + k);
  return i >= 0 ? argv[i + 1] : d;
};

const FPS = Number(arg('fps', 30));
const DURATION = 137;
const FROM = Number(arg('from', 0));
const TO = Number(arg('to', Math.round(DURATION * FPS)));
const WORKERS = Number(arg('workers', 4));
const OUTDIR = arg('dir', 'frames');
const PREFIX = arg('prefix', 'f');

mkdirSync(OUTDIR, { recursive: true });

const { server, port } = await startServer(0);
const url = `http://127.0.0.1:${port}/?raw=1`;

async function worker(id, list) {
  const browser = await puppeteer.launch({
    executablePath: findBrowser(),
    headless: 'shell',
    args: ['--force-device-scale-factor=1', '--disable-lcd-text', '--font-render-hinting=none', '--hide-scrollbars'],
  });
  const page = await browser.newPage();
  page.on('pageerror', (e) => console.log(`[w${id}] pageerror`, e.message.slice(0, 300)));
  await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
  await page.goto(url, { waitUntil: 'networkidle0' });
  await page.waitForFunction('window.__ready === true', { timeout: 90000 });

  for (const f of list) {
    const t = f / FPS;
    const file = join(OUTDIR, `${PREFIX}${String(f).padStart(5, '0')}.png`);
    if (existsSync(file)) continue;
    await page.evaluate((tt) => window.renderAt(tt), t);
    await page.screenshot({ path: file });
    process.stdout.write(`\r${f}   `);
  }
  await browser.close();
}

const all = [];
for (let f = FROM; f < TO; f++) all.push(f);
const buckets = Array.from({ length: WORKERS }, () => []);
all.forEach((f, i) => buckets[i % WORKERS].push(f));

const t0 = Date.now();
await Promise.all(buckets.map((b, i) => (b.length ? worker(i, b) : null)));
const dt = (Date.now() - t0) / 1000;
console.log(`\n${all.length} frames in ${dt.toFixed(1)}s  (${(all.length / dt).toFixed(2)} fps, ${WORKERS} workers)`);
writeFileSync(join(OUTDIR, 'meta.json'), JSON.stringify({ fps: FPS, from: FROM, to: TO, duration: DURATION, frames: all.length }, null, 2));

server.close();
