// 14 诺斯费拉图（1922）
// 黑白高对比、胶片颗粒、划痕、帧抖动。墙上没有影子，天上有一只蝙蝠。
import { GROUND } from '../main/camera.js';
import { pose } from '../rig/rig.js';
import { drawRigSilhouette } from '../rig/draw.js';
import { vGrad, speckle, fillPoly } from '../kit/paint.js';
import { rng, noise1, bez } from '../kit/core.js';
import { text2d, SERIF } from '../kit/type.js';

import { perf } from '../kit/act.js';

const BLACK = [10, 10, 11];
const GRAY = [72, 74, 78];
const PALE = [206, 202, 190];

export default {
  id: 'nosferatu',
  card: { x: 130, y: 330, color: 'rgba(224,220,206,', light: true },

  /** 字幕卡：德文，默片的样子 */
  overlay(ctx, g, fade) {
    const u = g.u;
    const a = Math.min(1, Math.max(0, (u - 1.4) / 0.5)) * Math.min(1, Math.max(0, (4.4 - u) / 0.5));
    if (a <= 0.01) return;
    ctx.save();
    ctx.globalAlpha = a * 0.95;
    ctx.fillStyle = 'rgba(6,6,7,0.72)';
    ctx.fillRect(430, 806, 1060, 96);
    text2d(ctx, '…und der Pelikan fuhr weiter.', 960, 862, {
      size: 34, family: SERIF, color: 'rgba(226,222,208,1)', align: 'center',
    });
    ctx.restore();
  },

  draw(g) {
    const { t, dist, span, hasRider, riderLocal } = g;
    rectMode(CORNER);
    const L = span[0], R = span[1], WW = R - L;

    // —— 天：压得很低 ——
    vGrad(L, 286, WW, 300, [26, 27, 30], [86, 87, 92], 40);

    // —— 月亮 ——
    moon(1520, 392, 74);

    // —— 城堡 ——
    castle(1290, 640);

    // —— 荒原 ——
    noStroke();
    fill(30, 30, 32);
    rect(L, 556, WW, GROUND - 556);
    // 山脊
    fill(22, 22, 24);
    beginShape();
    vertex(L, 590);
    for (let x = L; x <= R; x += 70) vertex(x, 578 - Math.sin(x * 0.005 + 1) * 26);
    vertex(R, 640);
    vertex(L, 640);
    endShape(CLOSE);

    // —— 枯树 ——
    deadTree(320, GROUND, 1.0);
    deadTree(760, GROUND, 0.82);
    deadTree(1330, GROUND, 0.9);

    // —— 栅栏 ——
    for (let x = 60; x < 1800; x += 96) {
      stroke(24, 24, 26);
      strokeWeight(4);
      line(x, GROUND - 4, x + 3, GROUND - 58);
    }
    stroke(24, 24, 26);
    strokeWeight(3);
    line(40, GROUND - 40, 1800, GROUND - 46);

    // —— 路 ——
    noStroke();
    fill(96, 94, 90, 90);
    rect(L, GROUND - 4, WW, 14);
    speckle(L, GROUND, WW, 130, 160, [12, 12, 13], 46, 5, 0.9, 3.0);

    // —— 骑手：纯黑剪影 + 一道月光勾边 ——
    if (hasRider) {
      // 表演：墙上的影子不跟着走。它自己站起来了——这才是诺斯费拉图。
      const A = perf(g.p, {
        rise: [[0.22, 0], [0.46, 1], [0.74, 1], [0.86, 0]],
        look: [[0.22, 0], [0.48, -0.34], [0.78, -0.30], [0.88, 0]],
      });
      const pz = pose(t, { dist, headPitch: A.look });
      push();
      translate(riderLocal, GROUND);

      // 影子：被拉长、抬高、脱开轮子
      if (A.rise > 0.02) {
        push();
        translate(-62 * A.rise, -104 * A.rise);
        scale(1 + 0.36 * A.rise, 1 + 0.2 * A.rise);
        drawRigSilhouette(pz, {
          fill: [8, 8, 10], dark: [8, 8, 10], eye: [8, 8, 10],
          lw: 3.2, alpha: 0.5 * A.rise, tyreW: 4.6, spokes: 10,
        });
        pop();
      }

      drawRigSilhouette(pz, { fill: [212, 208, 196], dark: [212, 208, 196], eye: [212, 208, 196], lw: 3.2, alpha: 0.55, tyreW: 4.6, spokes: 10 });
      push();
      translate(-2.6, -2.2);
      drawRigSilhouette(pz, { fill: BLACK, dark: BLACK, eye: [230, 226, 214], lw: 2.6, alpha: 0.98, tyreW: 4.0, spokes: 9 });
      pop();
      pop();
    }

    // —— 胶片：颗粒、划痕、抖动、暗角 ——
    film(t, span);
  },
};

// ---------- 布景 ----------

function moon(x, y, r) {
  push();
  noStroke();
  for (let i = 5; i > 0; i--) {
    fill(220, 218, 206, 12);
    circle(x, y, r * 2 + i * 18);
  }
  fill(226, 223, 210, 240);
  circle(x, y, r * 2);
  // 月面的斑
  fill(196, 192, 178, 150);
  circle(x - r * 0.3, y - r * 0.2, r * 0.5);
  circle(x + r * 0.24, y + r * 0.3, r * 0.34);
  // 掠过月亮的蝙蝠
  const k = (x * 0.01 + 0) % 1;
  bat(x - 30, y - 6, 1.0);
  pop();
}

function bat(x, y, s) {
  push();
  translate(x, y);
  scale(s);
  fill(14, 14, 15);
  noStroke();
  beginShape();
  vertex(0, 0);
  vertex(-10, -6);
  vertex(-26, -14);
  vertex(-20, -2);
  vertex(-28, 4);
  vertex(-10, 6);
  vertex(0, 12);
  vertex(10, 6);
  vertex(28, 4);
  vertex(20, -2);
  vertex(26, -14);
  vertex(10, -6);
  endShape(CLOSE);
  pop();
}

function castle(x, y) {
  push();
  translate(x, y);
  noStroke();
  fill(16, 16, 18);
  // 山崖
  beginShape();
  vertex(-260, 0); vertex(-150, -140); vertex(-60, -180); vertex(40, -150); vertex(160, -70); vertex(280, 0);
  endShape(CLOSE);
  // 堡
  rect(-90, -300, 180, 130);
  rect(-120, -250, 30, 80);
  rect(90, -264, 28, 94);
  rect(-20, -360, 44, 60);
  triangle(-24, -360, 2, -404, 28, -360);
  // 塔尖
  triangle(-124, -250, -105, -300, -86, -250);
  triangle(86, -264, 104, -310, 122, -264);
  // 窗：几点灰
  fill(96, 94, 90, 200);
  rect(-60, -280, 10, 16);
  rect(-20, -330, 10, 14);
  rect(40, -290, 10, 16);
  pop();
}

function deadTree(x, y, s) {
  push();
  translate(x, y);
  scale(s);
  stroke(18, 18, 20);
  noFill();
  strokeWeight(9);
  beginShape();
  vertex(0, 0); vertex(-4, -80); vertex(2, -150); vertex(-2, -210);
  endShape();
  strokeWeight(6);
  const r = rng(11);
  for (let i = 0; i < 5; i++) {
    const by = -90 - i * 26;
    const dir = i % 2 ? 1 : -1;
    beginShape();
    vertex(0, by);
    vertex(dir * (30 + r() * 30), by - 30 - r() * 20);
    vertex(dir * (46 + r() * 40), by - 54 - r() * 30);
    endShape();
  }
  pop();
}

// ---------- 胶片 ----------

function film(t, span) {
  const L = span[0], R = span[1], WW = R - L;
  const fr = Math.floor(t * 24);
  // 颗粒
  speckle(L, 286, WW, 580, 520, [236, 232, 218], 22, 8, 0.6, 1.9);
  speckle(L, 286, WW, 580, 520, [0, 0, 0], 28, 9, 0.6, 2.2);
  // 划痕：一条竖线，位置每几帧跳一次
  push();
  const sx = 200 + noise1(fr * 0.7, 3) * 900;
  stroke(232, 228, 214, 40);
  strokeWeight(1.2);
  line(sx, 286, sx + 2, 866);
  const sy = 1200 + noise1(fr * 0.5, 9) * 400;
  stroke(232, 228, 214, 26);
  line(sy, 286, sy - 1, 866);
  pop();
  // 上下黑边 + 暗角
  noStroke();
  fill(0, 0, 0, 220);
  rect(L, 286, WW, 10);
  rect(L, 856, WW, 12);
  for (let i = 0; i < 8; i++) {
    fill(0, 0, 0, 12);
    rect(L, 296 + i * 8, WW, 8);
    rect(L, 848 - i * 8, WW, 8);
  }
}
