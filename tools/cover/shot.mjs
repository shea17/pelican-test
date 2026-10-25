// 把封面 HTML 截成图。用法：node tools/cover/shot.mjs
import puppeteer from 'puppeteer-core';
import { findBrowser } from '../paths.mjs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const JOBS = [
  { html: 'tools/cover/cover.html', w: 1146, h: 717, out: 'docs/media/bilibili-cover-16x9@2x.png' },
  { html: 'tools/cover/cover-4x3.html', w: 1146, h: 860, out: 'docs/media/bilibili-cover-4x3@2x.png' },
];

const browser = await puppeteer.launch({
  executablePath: findBrowser(),
  headless: 'shell',
  args: ['--allow-file-access-from-files'],
});

for (const j of JOBS) {
  const page = await browser.newPage();
  await page.setViewport({ width: j.w, height: j.h, deviceScaleFactor: 2 });
  await page.goto(pathToFileURL(resolve(j.html)).href, { waitUntil: 'networkidle0' });
  await page.evaluate(() => document.fonts.ready);
  await new Promise((r) => setTimeout(r, 350));
  await page.screenshot({ path: j.out });
  await page.close();
  console.log('cover →', j.out, `${j.w * 2}×${j.h * 2}`);
}

await browser.close();
