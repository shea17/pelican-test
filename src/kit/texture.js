// kit/texture —— 底材。生成一次，缓存。
import { rng } from './core.js';

const cache = {};

/** 撒哈拉砂岩：暖橙底、层理、暗色锰漆流痕、剥落斑、裂纹 */
export function rockTexture() {
  if (cache.rock) return cache.rock;
  const W = 1500, H = 980;
  const g = createGraphics(W, H);
  g.pixelDensity(1);
  g.background(176, 112, 66);

  const r = rng(20260424);

  // 大色斑
  for (let i = 0; i < 520; i++) {
    const x = r() * W, y = r() * H;
    const s = 40 + r() * 260;
    g.noStroke();
    const k = r();
    if (k < 0.45) g.fill(196, 134, 84, 26 + r() * 34);
    else if (k < 0.8) g.fill(142, 84, 48, 22 + r() * 30);
    else g.fill(214, 164, 112, 16 + r() * 26);
    g.ellipse(x, y, s, s * (0.5 + r() * 1.1));
  }

  // 层理：横向波带
  for (let i = 0; i < 18; i++) {
    const y0 = (i / 26) * H + r() * 14;
    g.noFill();
    g.stroke(150, 92, 54, 10 + r() * 12);
    g.strokeWeight(2 + r() * 5);
    g.beginShape();
    for (let x = -20; x <= W + 20; x += 26) {
      g.vertex(x, y0 + Math.sin(x * 0.006 + i) * 9 + (r() - 0.5) * 4);
    }
    g.endShape();
  }

  // 暗色流痕（沙漠漆）
  for (let i = 0; i < 40; i++) {
    const x = r() * W, y = r() * H * 0.7, len = 60 + r() * 220;
    g.stroke(78, 46, 28, 10 + r() * 26);
    g.strokeWeight(1 + r() * 5);
    g.line(x, y, x + (r() - 0.5) * 26, y + len);
  }

  // 剥落：浅色不规则块
  for (let i = 0; i < 70; i++) {
    const x = r() * W, y = r() * H, s = 6 + r() * 40;
    g.noStroke();
    g.fill(212, 172, 128, 30 + r() * 40);
    g.beginShape();
    const n = 6 + Math.floor(r() * 5);
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2;
      const rr = s * (0.55 + r() * 0.7);
      g.vertex(x + Math.cos(a) * rr, y + Math.sin(a) * rr * 0.8);
    }
    g.endShape(g.CLOSE);
  }

  // 裂纹
  for (let i = 0; i < 9; i++) {
    let x = r() * W, y = r() * H;
    g.stroke(96, 58, 34, 40 + r() * 50);
    g.strokeWeight(0.6 + r() * 0.9);
    g.noFill();
    g.beginShape();
    for (let k = 0; k < 12; k++) {
      g.vertex(x, y);
      x += (r() - 0.5) * 26;
      y += 8 + r() * 26;
    }
    g.endShape();
  }

  // 颗粒
  g.noStroke();
  for (let i = 0; i < 16000; i++) {
    const v = 120 + r() * 120;
    g.fill(v, v * 0.66, v * 0.44, 12 + r() * 26);
    g.circle(r() * W, r() * H, 0.8 + r() * 2.1);
  }

  cache.rock = g;
  return g;
}

/** 绢本：暖调旧绢，细密经纬，轻微水渍 */
export function silkTexture() {
  if (cache.silk) return cache.silk;
  const W = 1500, H = 980;
  const g = createGraphics(W, H);
  g.pixelDensity(1);
  g.background(222, 212, 189);
  const r = rng(9911);

  // 水渍
  for (let i = 0; i < 90; i++) {
    const x = r() * W, y = r() * H, s = 80 + r() * 320;
    g.noStroke();
    g.fill(196, 184, 158, 10 + r() * 16);
    g.ellipse(x, y, s, s * (0.4 + r() * 0.8));
  }

  // 经纬
  g.strokeWeight(0.6);
  for (let y = 0; y < H; y += 3) {
    g.stroke(206, 196, 172, 26);
    g.line(0, y, W, y);
  }
  for (let x = 0; x < W; x += 3) {
    g.stroke(214, 205, 182, 18);
    g.line(x, 0, x, H);
  }

  // 霉点
  g.noStroke();
  for (let i = 0; i < 500; i++) {
    g.fill(150, 132, 96, 8 + r() * 22);
    g.circle(r() * W, r() * H, 0.8 + r() * 3);
  }

  cache.silk = g;
  return g;
}
