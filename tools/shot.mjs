import puppeteer from 'puppeteer-core';
import { startServer } from './serve.mjs';
import { findBrowser } from './paths.mjs';
import { W, H } from '../src/main/consts.mjs';

const argv = process.argv.slice(2);
const arg = (k, d) => {
  const i = argv.indexOf('--' + k);
  return i >= 0 ? argv[i + 1] : d;
};
const out = arg('out', 'docs/media/shot.png');
const times = String(arg('t', '8')).split(',').map(Number);

const { server, port } = await startServer(0);
const browser = await puppeteer.launch({
  executablePath: findBrowser(),
  headless: 'shell',
  args: ['--force-device-scale-factor=1', '--disable-lcd-text', '--font-render-hinting=none', '--hide-scrollbars'],
});
const page = await browser.newPage();
page.on('pageerror', (e) => console.log('[pageerror]', e.message.slice(0, 400)));
page.on('console', (m) => {
  if (m.type() === 'error' || m.type() === 'warn') console.log('[page]', m.type(), m.text().slice(0, 200));
});
await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
await page.goto(`http://127.0.0.1:${port}/?raw=1`, { waitUntil: 'networkidle0' });
await page.waitForFunction('window.__ready === true', { timeout: 60000 });

for (let i = 0; i < times.length; i++) {
  await page.evaluate((t) => window.renderAt(t), times[i]);
  await new Promise((r) => setTimeout(r, 60));
  const p = times.length > 1 ? out.replace(/\.png$/, `_${times[i]}.png`) : out;
  await page.screenshot({ path: p });
  console.log('shot', times[i], '→', p);
}

await browser.close();
server.close();
