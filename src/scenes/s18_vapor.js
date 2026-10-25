// 18 蒸汽波（2010s）
// 粉紫渐变、霓虹网格、罗马柱、大理石胸像、VHS 故障条。
import { GROUND } from '../main/camera.js';
import { pose } from '../rig/rig.js';
import { drawRig } from '../rig/draw.js';
import { vGrad, speckle, fillPoly, strokePoly } from '../kit/paint.js';
import { text2d, SANS, MONO } from '../kit/type.js';
import { rng, noise1, clamp } from '../kit/core.js';

import { perf } from '../kit/act.js';

const SKY_T = [40, 24, 72];
const SKY_M = [120, 62, 140];
const SKY_B = [255, 150, 200];
const PINK = [255, 143, 208];
const CYAN = [77, 224, 208];
const SUN_A = [255, 226, 130];
const SUN_B = [255, 138, 170];
const DARK = [26, 14, 42];

export default {
  id: 'vapor',
  card: { x: 122, y: 330, color: 'rgba(255,190,226,', light: true },

  overlay(ctx, g, fade) {
    const u = g.u;
    const a = clamp((u - 1.0) / 0.4);
    if (a <= 0.01) return;
    ctx.save();
    ctx.globalAlpha = a * 0.9;
    text2d(ctx, 'Ｐ Ｅ Ｌ Ｉ Ｃ Ａ Ｎ', 1790, 190, {
      size: 44, family: SANS, color: 'rgba(255,200,236,0.95)', align: 'right', tracking: 6,
    });
    text2d(ctx, 'ａ　ｅ ｓ ｔ ｈ ｅ ｔ ｉ ｃ', 1790, 232, {
      size: 20, family: SANS, color: 'rgba(120,240,228,0.9)', align: 'right', tracking: 4,
    });
    text2d(ctx, 'ＮＯ．１８', 1790, 268, {
      size: 16, family: MONO, color: 'rgba(255,255,255,0.55)', align: 'right', tracking: 3,
    });
    ctx.restore();
  },

  draw(g) {
    const { t, dist, span, hasRider, riderLocal } = g;
    rectMode(CORNER);
    const L = span[0], R = span[1], WW = R - L;

    // —— 天 ——
    vGrad(L, 286, WW, 420, SKY_T, SKY_B, 60);

    // —— 落日：横切片 ——
    push();
    noStroke();
    const sx = 960, sy = 520, sr = 190;
    fill(SUN_B[0], SUN_B[1], SUN_B[2]);
    circle(sx, sy, sr * 2);
    fill(SUN_A[0], SUN_A[1], SUN_A[2]);
    circle(sx, sy - 26, sr * 1.86);
    // 切片：越往下缝越宽
    for (let i = 0; i < 7; i++) {
      const y = sy + 16 + i * 24;
      const h = 4 + i * 2.4;
      fill(SKY_M[0], SKY_M[1], SKY_M[2], 255);
      rect(sx - sr - 4, y, sr * 2 + 8, h);
      fill(SKY_B[0], SKY_B[1], SKY_B[2], 120);
      rect(sx - sr - 4, y + h, sr * 2 + 8, 2);
    }
    pop();

    // —— 远景：山脊与塔 ——
    noStroke();
    fill(SKY_M[0], SKY_M[1], SKY_M[2], 200);
    beginShape();
    vertex(L, 700);
    for (let x = L; x <= R; x += 80) vertex(x, 640 - Math.sin(x * 0.004) * 26);
    vertex(R, 700);
    endShape(CLOSE);

    // —— 网格地面 ——
    fill(DARK[0], DARK[1], DARK[2]);
    rect(L, GROUND, WW, 180);
    push();
    stroke(CYAN[0], CYAN[1], CYAN[2], 150);
    strokeWeight(1.6);
    // 横线：越近越疏
    let yy = GROUND;
    let step = 6;
    while (yy < 862) {
      line(L, yy, R, yy);
      yy += step;
      step *= 1.42;
    }
    // 竖线：全部汇到 (960, 700)
    for (let i = -14; i <= 14; i++) {
      const bx = 960 + i * 150;
      const k = (862 - GROUND) / 120;
      line(960 + (bx - 960) * 0.12, GROUND, 960 + (bx - 960) * (0.12 + k), 862);
    }
    pop();

    // —— 棕榈 ——
    palm(214, GROUND, 1.0);
    palm(1666, GROUND, 0.86);

    // —— 大理石胸像：也是一只鹈鹕 ——
    bust(360, GROUND);

    // —— 骑手 ——
    if (hasRider) {
      const A = perf(g.p, {
        wing: [[0.3, 0], [0.46, 0.5], [0.62, 0.12], [0.8, 0]],
      });
      const pz = pose(t, { dist, wingRaise: A.wing });
      // 轮子压过网格，每一压荡出一圈霓虹
      push();
      noFill();
      for (let i = 0; i < 3; i++) {
        const ph = ((t * 0.9 + i / 3) % 1);
        stroke(CYAN[0], CYAN[1], CYAN[2], 150 * (1 - ph));
        strokeWeight(2.4);
        ellipse(riderLocal + 66, GROUND, 40 + ph * 260, (40 + ph * 260) * 0.26);
      }
      pop();
      push();
      translate(riderLocal, GROUND);
      drawRig(pz, {
        ink: [58, 24, 72], body: [255, 240, 250], bodyDark: [232, 190, 220],
        bike: [58, 24, 72], leg: [226, 132, 190], legFar: [246, 186, 220],
        beak: [255, 196, 96], pouch: [255, 160, 190], lw: 2.4,
        chain: [200, 140, 200],
        wheelOpt: { tyre: [58, 24, 72], rim: CYAN, spoke: [255, 150, 210], spokeW: 1.2, hub: CYAN, tyreW: 3.2 },
      });
      // 霓虹描边：沿轮子加一圈光
      noFill();
      stroke(CYAN[0], CYAN[1], CYAN[2], 120);
      strokeWeight(6);
      circle(pz.bike.rear[0], pz.bike.rear[1], pz.bike.r * 2 + 6);
      circle(pz.bike.front[0], pz.bike.front[1], pz.bike.r * 2 + 6);
      pop();
    }

    // —— VHS 故障条 ——
    const fr = Math.floor(t * 12);
    const r = rng(3);
    for (let i = 0; i < 3; i++) {
      const gy = 300 + ((fr * 53 + i * 211) % 540);
      if (noise1(fr * 0.9 + i, i) < 0.15) continue;
      noStroke();
      fill(CYAN[0], CYAN[1], CYAN[2], 60);
      rect(L, gy, WW, 3 + i * 2);
      fill(PINK[0], PINK[1], PINK[2], 50);
      rect(L, gy + 6, WW, 2);
    }
    // 扫描线
    for (let y = 288; y < 866; y += 5) {
      fill(0, 0, 0, 18);
      rect(L, y, WW, 2);
    }
  },
};

// ---------- 棕榈 ----------

function palm(x, y, s) {
  push();
  translate(x, y);
  scale(s);
  noStroke();
  fill(28, 12, 40, 250);
  beginShape();
  vertex(-8, 0);
  vertex(-16, -80);
  vertex(-24, -170);
  vertex(-30, -240);
  vertex(-18, -240);
  vertex(-12, -168);
  vertex(-2, -80);
  vertex(8, 0);
  endShape(CLOSE);
  // 叶
  for (let i = 0; i < 7; i++) {
    const a = -Math.PI + (i / 6) * Math.PI;
    const ex = -24 + Math.cos(a) * 84;
    const ey = -240 + Math.sin(a) * 60 - 14;
    beginShape();
    vertex(-24, -242);
    vertex(-24 + Math.cos(a) * 46, -244 + Math.sin(a) * 30);
    vertex(ex, ey);
    vertex(-24 + Math.cos(a) * 44, -238 + Math.sin(a) * 34);
    endShape(CLOSE);
  }
  pop();
}

// ---------- 胸像 ----------

function bust(x, y) {
  push();
  translate(x, y);
  // 柱
  noStroke();
  fill(226, 214, 226);
  rect(-44, -180, 88, 180);
  fill(198, 182, 204);
  for (let i = 0; i < 6; i++) rect(-44 + i * 15, -180, 2, 180);
  fill(238, 228, 240);
  rect(-54, -196, 108, 20, 2);
  rect(-42, -6, 84, 10);
  // 胸像：鹈鹕的肩、颈、头
  fill(246, 238, 248);
  beginShape();
  vertex(-46, -196);
  vertex(-30, -244);
  vertex(26, -246);
  vertex(46, -198);
  endShape(CLOSE);
  // 颈
  beginShape();
  vertex(2, -238);
  vertex(-6, -300);
  vertex(6, -338);
  vertex(22, -336);
  vertex(20, -300);
  vertex(22, -240);
  endShape(CLOSE);
  // 头
  ellipse(16, -348, 46, 40);
  // 喙
  beginShape();
  vertex(34, -356);
  vertex(96, -346);
  vertex(94, -336);
  vertex(32, -334);
  endShape(CLOSE);
  // 断掉的臂
  beginShape();
  vertex(-34, -232);
  vertex(-58, -210);
  vertex(-48, -196);
  vertex(-24, -214);
  endShape(CLOSE);
  // 大理石纹
  stroke(206, 192, 214, 90);
  strokeWeight(1.4);
  for (let i = 0; i < 5; i++) {
    noFill();
    beginShape();
    vertex(-30 + i * 12, -200);
    vertex(-18 + i * 12, -240);
    vertex(-26 + i * 12, -290);
    endShape();
  }
  noStroke();
  // 眼窝
  fill(198, 184, 206);
  ellipse(24, -352, 7, 9);
  pop();
}
