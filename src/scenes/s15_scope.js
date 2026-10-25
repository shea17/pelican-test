// 15 示波器（1950s）
// 绿色荧光、网格、余晖。所有图形都是矢量描线，端点是亮点。
import { GROUND } from '../main/camera.js';
import { pose } from '../rig/rig.js';
import { drawRig } from '../rig/draw.js';
import { speckle } from '../kit/paint.js';
import { rng } from '../kit/core.js';
import { text2d, MONO } from '../kit/type.js';

import { perf } from '../kit/act.js';

const BG = [4, 10, 6];
const GRN = [57, 255, 136];
const GRN_D = [24, 120, 64];
const GRN_DD = [12, 46, 26];

export default {
  id: 'scope',
  card: { x: 126, y: 716, color: 'rgba(90,255,160,', light: true },

  overlay(ctx, g, fade) {
    const u = g.u;
    const a = Math.min(1, Math.max(0, (u - 0.9) / 0.4));
    if (a <= 0.01) return;
    ctx.save();
    ctx.globalAlpha = a * 0.9;
    text2d(ctx, 'CH1  2.0V/div    CH2  0.5V/div    TIME 200ms/div', 150, 1000, {
      size: 19, family: MONO, color: 'rgba(120,255,170,0.85)', tracking: 1,
    });
    text2d(ctx, `FREQ  ${(120 + Math.sin(u * 2) * 0.4).toFixed(1)} BPM    TRIG  AUTO`, 150, 1030, {
      size: 19, family: MONO, color: 'rgba(120,255,170,0.6)', tracking: 1,
    });
    text2d(ctx, 'RUN', 1770, 1000, {
      size: 26, family: MONO, color: 'rgba(150,255,190,0.95)', align: 'right', tracking: 3,
    });
    ctx.restore();
  },

  draw(g) {
    const { t, dist, span, hasRider, riderLocal } = g;
    rectMode(CORNER);
    const L = span[0], R = span[1], WW = R - L;

    // —— 屏幕 ——
    noStroke();
    fill(BG[0], BG[1], BG[2]);
    rect(L, 286, WW, 580);

    // —— 网格 ——
    push();
    stroke(GRN[0], GRN[1], GRN[2], 22);
    strokeWeight(1.2);
    for (let x = L - (L % 64) - 64; x < R + 64; x += 64) line(x, 286, x, 866);
    for (let y = 288; y < 866; y += 64) line(L, y, R, y);
    // 中轴
    stroke(GRN[0], GRN[1], GRN[2], 40);
    strokeWeight(1.4);
    line(L, 576, R, 576);
    line(960, 286, 960, 866);
    // 刻度
    for (let x = L; x < R; x += 16) line(x, 570, x, 582);
    pop();

    // —— 示波管的一团余晖 ——
    push();
    noStroke();
    for (let i = 9; i > 0; i--) {
      fill(GRN[0], GRN[1], GRN[2], 3.2);
      ellipse(900, 560, 700 + i * 130, 420 + i * 100);
    }
    pop();

    // —— CH1：路面 ——
    wave1(L, R, 404, dist, t);
    // —— CH2：心跳 ——
    wave2(L, R, 486, t);

    // —— 李萨如图形：转着转着成了一个车轮 ——
    lissajous(1380, 700, 92, t);

    // —— 骑手：矢量描线 ——
    if (hasRider) {
      // 表演：站起来蹬——波形立刻变密，心率跟着上去
      const A = perf(g.p, {
        lift: [[0.28, 0], [0.42, 7], [0.72, 7], [0.84, 0]],
        pitch: [[0.28, 0], [0.42, -0.16], [0.72, -0.14], [0.84, 0]],
        lean: [[0.28, 0], [0.42, -5], [0.72, -5], [0.84, 0]],
      });
      push();
      translate(riderLocal, GROUND);
      drawRig(pose(t, { dist, hipLift: A.lift, headPitch: A.pitch, lean: A.lean }), {
        ink: GRN, body: [10, 34, 20], bodyDark: [8, 24, 16],
        bike: GRN, leg: [40, 150, 90], legFar: [24, 90, 54],
        beak: [60, 210, 120], pouch: [34, 140, 84], lw: 2.0,
        chain: [30, 120, 68],
        wheelOpt: { tyre: GRN, rim: [40, 180, 100], spoke: GRN_D, spokeW: 0.8, hub: GRN, tyreW: 2.4 },
      });
      // 亮点：扫描束正好落在鸟身上
      const ph = (t * 1.7) % 1;
      noStroke();
      fill(GRN[0], GRN[1], GRN[2], 90);
      circle(-60 + ph * 160, -140 - Math.sin(ph * 6.28) * 40, 26);
      fill(230, 255, 240);
      circle(-60 + ph * 160, -140 - Math.sin(ph * 6.28) * 40, 7);
      pop();
    }

    // —— 扫描线 ——
    push();
    noStroke();
    for (let y = 288; y < 866; y += 6) {
      fill(0, 0, 0, 26);
      rect(L, y, WW, 2.2);
    }
    pop();
    speckle(L, 286, WW, 580, 300, [120, 255, 170], 22, 4, 0.4, 1.4);
  },
};

// ---------- 波形 ----------

function wave1(L, R, y, dist, t) {
  push();
  noFill();
  // 描两遍：宽而暗的一遍做辉光，细而亮的一遍是束
  for (let pass = 0; pass < 2; pass++) {
    stroke(GRN[0], GRN[1], GRN[2], pass ? 235 : 40);
    strokeWeight(pass ? 2.0 : 7.0);
    beginShape();
    for (let x = L; x <= R; x += 8) {
      const u = (x + dist * 0.6) * 0.012;
      const v = Math.sin(u) * 42 + Math.sin(u * 2.7 + 1) * 16 + Math.sin(u * 6.1) * 6;
      vertex(x, y + v);
    }
    endShape();
  }
  push();
  noStroke();
  fill(230, 255, 240, 240);
  const hx = 760;
  circle(hx, y + Math.sin((hx + dist * 0.6) * 0.012) * 42, 5);
  pop();
  pop();
}

function wave2(L, R, y, t) {
  push();
  noFill();
  for (let pass = 0; pass < 2; pass++) {
    stroke(GRN[0], GRN[1], GRN[2], pass ? 220 : 34);
    strokeWeight(pass ? 1.8 : 6.0);
    beginShape();
    for (let x = L; x <= R; x += 4) {
      const p = ((x + 300) % 460) / 460;
      let v = 0;
      if (p < 0.08) v = -Math.sin(p * Math.PI * 12.5) * 30;
      else if (p > 0.1 && p < 0.2) v = -Math.sin((p - 0.1) * Math.PI * 10) * 12;
      else if (p > 0.28 && p < 0.4) v = -Math.sin((p - 0.28) * Math.PI * 8.3) * 7;
      v += Math.sin(p * 40 + t * 2) * 1.2;
      vertex(x, y + v);
    }
    endShape();
  }
  pop();
}

function lissajous(x, y, r, t) {
  push();
  translate(x, y);
  // 外圈：车轮
  noFill();
  stroke(GRN[0], GRN[1], GRN[2], 60);
  strokeWeight(7);
  circle(0, 0, r * 2);
  stroke(GRN[0], GRN[1], GRN[2], 235);
  strokeWeight(2);
  circle(0, 0, r * 2);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    line(0, 0, Math.cos(a) * r, Math.sin(a) * r);
  }
  circle(0, 0, r * 0.28);
  // 李萨如的轨迹
  const ph = t * 1.6;
  stroke(160, 255, 200, 120);
  strokeWeight(1.6);
  beginShape();
  for (let i = 0; i <= 90; i++) {
    const a = (i / 90) * Math.PI * 2;
    vertex(Math.sin(a * 3 + ph) * r * 0.72, Math.sin(a * 2) * r * 0.72);
  }
  endShape();
  // 束点
  noStroke();
  fill(240, 255, 248);
  circle(Math.sin(ph) * r * 0.72, Math.sin(ph * 2) * r * 0.72, 6);
  pop();
}
