// 12 星月夜（1889）
// 厚涂的短笔触，全部顺着一个流场走。旋涡的中心是一只车轮。
import { GROUND } from '../main/camera.js';
import { pose } from '../rig/rig.js';
import { drawRig } from '../rig/draw.js';
import { vGrad, speckle, fillPoly } from '../kit/paint.js';
import { rng, bez, noise1 } from '../kit/core.js';
import { perf } from '../kit/act.js';

const NIGHT = [27, 42, 82];
const NIGHT_D = [18, 28, 58];
const BLUE = [74, 120, 176];
const BLUE_L = [140, 178, 210];
const YELLOW = [232, 210, 74];
const YELLOW_L = [248, 238, 160];
const GREEN = [46, 62, 44];
const OCHRE = [176, 148, 74];

/** 一笔：短、弯、两端收细 */
function dab(x, y, ang, len, w, col, a) {
  const p0 = [x, y];
  const p1 = [x + Math.cos(ang) * len * 0.5 - Math.sin(ang) * len * 0.16, y + Math.sin(ang) * len * 0.5 + Math.cos(ang) * len * 0.16];
  const p2 = [x + Math.cos(ang) * len, y + Math.sin(ang) * len];
  stroke(col[0], col[1], col[2], a);
  strokeWeight(w);
  noFill();
  beginShape();
  for (const q of bez(p0, p1, p2, p2, 3)) vertex(q[0], q[1]);
  endShape();
}

export default {
  id: 'starry',
  card: { x: 118, y: 860, color: 'rgba(244,232,160,', light: true },

  draw(g) {
    const { t, dist, span, hasRider, riderLocal } = g;
    rectMode(CORNER);
    const L = span[0], R = span[1], WW = R - L;

    // —— 夜与地 ——
    vGrad(L, 286, WW, 300, NIGHT_D, BLUE, 36);
    noStroke();
    fill(26, 40, 56);
    beginShape();
    vertex(L, 560);
    for (let x = L; x <= R; x += 60) vertex(x, 556 - Math.sin(x * 0.004 + 2) * 18);
    vertex(R, GROUND);
    vertex(L, GROUND);
    endShape(CLOSE);
    fill([52, 58, 48][0], 58, 48);
    fill(52, 58, 48);
    rect(L, GROUND, WW, 180);

    // —— 流场：两个旋涡 ——
    const swirl = [[760, 430, 260], [1330, 400, 210]];
    const r = rng(77);
    push();
    for (let i = 0; i < 400; i++) {
      const x = L + r() * (WW + 80);
      const y = 292 + r() * 330;
      let dx = 0, dy = 0, best = 1e9;
      for (const s of swirl) {
        const d = Math.hypot(x - s[0], y - s[1]);
        if (d < best) { best = d; dx = x - s[0]; dy = y - s[1]; }
      }
      const falloff = Math.max(0, 1 - best / 420);
      const ang = Math.atan2(dy, dx) + Math.PI / 2 + noise1(x * 0.01 + y * 0.013, 5) * 0.5 * (1 - falloff);
      const k = 0.5 + 0.5 * Math.sin(x * 0.03 + y * 0.02);
      const col = k > 0.55 ? BLUE_L : k > 0.2 ? BLUE : NIGHT;
      dab(x, y, ang, 16 + r() * 26, 2.6 + r() * 3.4, col, 70 + r() * 110);
    }
    pop();

    // —— 星与月 ——
    const stars = [[300, 380, 20], [520, 340, 14], [980, 350, 16], [1120, 452, 12], [1480, 352, 22], [1640, 440, 15], [880, 500, 11]];
    for (const s of stars) star(s[0], s[1], s[2]);
    moon(1610, 400, 34);

    // —— 旋涡中心的车轮：这幅画里唯一按物理规律转的东西 ——
    swirlWheel(760, 430, 62);

    // —— 柏树：一团向上的火 ——
    cypress(210, GROUND + 6, 1.0);
    cypress(1700, GROUND + 4, 0.8);

    // —— 村庄 ——
    village(1300, GROUND);

    // —— 麦田：横向的短笔 ——
    const r2 = rng(31);
    for (let i = 0; i < 220; i++) {
      const x = L + r2() * (WW + 40);
      const y = GROUND + 10 + r2() * 140;
      const ang = (r2() - 0.5) * 0.25;
      dab(x, y, ang, 20 + r2() * 30, 2.4 + r2() * 2.6, r2() > 0.5 ? OCHRE : [92, 82, 48], 90 + r2() * 90);
    }
    // 田里也有一圈小小的旋
    for (let i = 0; i < 90; i++) {
      const a = r2() * Math.PI * 2;
      const rr = 40 + r2() * 120;
      const x = 980 + Math.cos(a) * rr;
      const y = 780 + Math.sin(a) * rr * 0.4;
      dab(x, y, a + Math.PI / 2, 22, 2.6, [126, 104, 56], 120);
    }

    // —— 路 ——
    noStroke();
    fill(150, 138, 96, 120);
    rect(L, GROUND - 3, WW, 8);

    // —— 骑手：用同一套短笔勾边 ——
    if (hasRider) {
      // 表演：风太大，它索性站起来，张开翅膀骑
      const A = perf(g.p, {
        wing: [[0.18, 0], [0.34, 0.92], [0.76, 0.92], [0.90, 0.1]],
        lift: [[0.18, 0], [0.34, 9], [0.76, 9], [0.90, 0]],
        tail: [[0.18, 0], [0.34, 1], [0.76, 1], [0.90, 0]],
        lean: [[0.18, 0], [0.34, -4], [0.76, -4], [0.90, 0]],
      });
      push();
      translate(riderLocal, GROUND);
      drawRig(pose(t, { dist, wingRaise: A.wing, hipLift: A.lift, tailFan: A.tail, lean: A.lean }), {
        ink: [24, 32, 52], body: [232, 226, 196], bodyDark: [176, 178, 168],
        bike: [32, 40, 58], leg: [96, 88, 64], legFar: [140, 146, 148],
        beak: [230, 194, 96], pouch: [226, 204, 130], lw: 2.6,
        chain: [90, 96, 110],
        wheelOpt: { tyre: [32, 40, 58], rim: [200, 186, 110], spoke: [190, 180, 120], spokeW: 1.2, hub: [230, 210, 120], tyreW: 3.4 },
      });
      // 身上补几笔，别让它太光滑
      const rr = rng(9);
      for (let i = 0; i < 26; i++) {
        dab(-50 + rr() * 100, -180 + rr() * 110, -0.5 + rr() * 1.6, 10 + rr() * 12, 2.2, [246, 240, 214], 90);
      }
      pop();
    }
  },
};

// ---------- 星与月 ----------

function star(x, y, r) {
  push();
  noStroke();
  for (let i = 5; i > 0; i--) {
    fill(YELLOW[0], YELLOW[1], YELLOW[2], 26);
    circle(x, y, r * 2 + i * 10);
  }
  fill(YELLOW_L[0], YELLOW_L[1], YELLOW_L[2], 235);
  circle(x, y, r * 1.1);
  // 一圈短笔绕成光环
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 + 0.2;
    dab(x + Math.cos(a) * r * 1.3, y + Math.sin(a) * r * 1.3, a + Math.PI / 2, r * 0.8, 3.2, YELLOW, 140);
  }
  pop();
}

function moon(x, y, r) {
  push();
  noStroke();
  for (let i = 6; i > 0; i--) {
    fill(YELLOW[0], YELLOW[1], YELLOW[2], 22);
    circle(x, y, r * 2 + i * 14);
  }
  fill(YELLOW_L[0], YELLOW_L[1], YELLOW_L[2], 245);
  circle(x, y, r * 2);
  fill([214, 176, 60][0], 176, 60);
  fill(214, 176, 60, 160);
  circle(x - r * 0.3, y + r * 0.2, r * 0.5);
  pop();
}

function swirlWheel(x, y, r) {
  push();
  translate(x, y);
  noStroke();
  fill(226, 216, 120, 40);
  circle(0, 0, r * 2.6);
  noFill();
  stroke(240, 224, 132, 210);
  strokeWeight(3.4);
  circle(0, 0, r * 2);
  strokeWeight(2.2);
  circle(0, 0, r * 1.4);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    line(0, 0, Math.cos(a) * r * 0.7, Math.sin(a) * r * 0.7);
  }
  noStroke();
  fill(246, 236, 170, 230);
  circle(0, 0, r * 0.24);
  pop();
}

// ---------- 柏树 ----------

function cypress(x, y, s) {
  push();
  translate(x, y);
  scale(s);
  noStroke();
  fill(GREEN[0], GREEN[1], GREEN[2], 235);
  beginShape();
  vertex(-26, 0);
  vertex(-34, -90);
  vertex(-22, -190);
  vertex(-8, -270);
  vertex(0, -300);
  vertex(10, -262);
  vertex(22, -180);
  vertex(32, -80);
  vertex(26, 0);
  endShape(CLOSE);
  // 向上的短笔：叶
  const r = rng(41);
  for (let i = 0; i < 120; i++) {
    const yy = -r() * 290;
    const halfW = 28 * (1 - Math.abs(yy + 160) / 220);
    const xx = (r() - 0.5) * 2 * Math.max(6, halfW);
    const col = r() > 0.6 ? [74, 92, 58] : [26, 38, 28];
    dab(xx, yy, -Math.PI / 2 + (r() - 0.5) * 0.8, 12 + r() * 22, 2.6 + r() * 2, col, 130 + r() * 90);
  }
  pop();
}

// ---------- 村庄 ----------

function village(x, y) {
  push();
  translate(x, y);
  noStroke();
  for (const [hx, hw, hh] of [[-80, 60, 52], [-10, 46, 46], [52, 70, 58], [140, 44, 40]]) {
    fill(38, 48, 62, 245);
    rect(hx, -hh, hw, hh);
    fill(24, 30, 42);
    triangle(hx - 6, -hh, hx + hw / 2, -hh - 26, hx + hw + 6, -hh);
    // 窗：一两点黄
    fill(236, 206, 110, 220);
    rect(hx + hw * 0.3, -hh * 0.66, 10, 12);
  }
  // 教堂尖顶
  fill(32, 40, 54);
  rect(96, -150, 26, 150);
  triangle(92, -150, 109, -210, 126, -150);
  fill(236, 206, 110, 180);
  rect(104, -132, 9, 14);
  pop();
}
