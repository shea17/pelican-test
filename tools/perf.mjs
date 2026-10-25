// perf —— 每块的单帧成本（不含截图），用来决定优化哪儿。
import puppeteer from 'puppeteer-core';
import { startServer } from './serve.mjs';
import { findBrowser } from './paths.mjs';
import { W, H } from '../src/main/consts.mjs';

const { server, port } = await startServer(0);
const browser = await puppeteer.launch({
  executablePath: findBrowser(),
  headless: 'shell',
  args: ['--force-device-scale-factor=1', '--disable-lcd-text', '--font-render-hinting=none'],
});
const page = await browser.newPage();
await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
await page.goto(`http://127.0.0.1:${port}/?raw=1`, { waitUntil: 'networkidle0' });
await page.waitForFunction('window.__ready === true', { timeout: 60000 });

// 给 draw 套一层计时：renderAt 只是 redraw()，真正的绘制发生在下一帧
await page.evaluate(() => {
  const orig = window.draw;
  window.__ms = 0;
  window.draw = () => {
    const a = performance.now();
    orig();
    window.__ms = performance.now() - a;
  };
});

const rows = [];
for (let k = 0; k < 20; k++) {
  const t = 5 + k * 6 + 3;
  await page.evaluate((tt) => { window.renderAt(tt); }, t);
  await new Promise((r) => setTimeout(r, 120));
  let best = 1e9;
  for (let i = 0; i < 4; i++) {
    await page.evaluate((tt) => { window.renderAt(tt); }, t + i * 0.02);
    await new Promise((r) => setTimeout(r, 90));
    const ms = await page.evaluate(() => window.__ms);
    if (ms > 0.05) best = Math.min(best, ms);
  }
  rows.push([k + 1, best === 1e9 ? 0 : best]);
}

rows.sort((a, b) => b[1] - a[1]);
console.log('最贵的十块：');
for (const [k, ms] of rows.slice(0, 10)) console.log(String(k).padStart(2, '0'), ms.toFixed(1), 'ms');
const avg = rows.reduce((s, r) => s + r[1], 0) / rows.length;
console.log('平均', avg.toFixed(1), 'ms');

await browser.close();
server.close();
