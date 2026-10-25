// 11 浮世绘（1830s，東海道）
// 主版墨线 + 色版平涂。天空是 bokashi 的渐变，边缘留白。
import { GROUND } from '../main/camera.js';
import { pose } from '../rig/rig.js';
import { drawRig } from '../rig/draw.js';
import { vGrad, fillPoly, strokePoly, speckle } from '../kit/paint.js';
import { rng, bez } from '../kit/core.js';
import { perf } from '../kit/act.js';

const CREAM = [232, 220, 192];
const INDIGO = [29, 58, 86];
const INDIGO_L = [86, 118, 148];
const RED = [196, 85, 58];
const GREEN = [95, 111, 69];
const GRAY = [138, 154, 168];

const C = (a, b, c, d, n = 10) => bez(a, b, c, d, n);

export default {
  id: 'ukiyo',
  card: { x: 112, y: 360, color: 'rgba(240,232,208,', light: true },

  draw(g) {
    const { t, dist, span, hasRider, riderLocal } = g;
    rectMode(CORNER);
    const L = span[0], R = span[1], WW = R - L;

    // —— 纸 ——
    noStroke();
    fill(CREAM[0], CREAM[1], CREAM[2]);
    rect(L, 286, WW, 580);
    speckle(L, 286, WW, 580, 500, [196, 182, 152], 18, 3, 0.6, 2.0);

    // —— 天：bokashi ——
    vGrad(L, 292, WW, 268, INDIGO, [214, 206, 180], 72);
    // 两三朵扁云，不要横贯全幅的色带
    noStroke();
    for (let i = -1; i < 5; i++) {
      const cx = L + 260 + i * 520;
      fill(238, 231, 212, 120);
      rect(cx, 404, 210, 12, 6);
      rect(cx + 40, 392, 130, 12, 6);
      fill(246, 240, 224, 90);
      rect(cx + 10, 418, 170, 8, 4);
    }

    // —— 富士 ——
    fuji(1436, 566, 1.0);

    // —— 海与浪 ——
    noStroke();
    fill(INDIGO[0], INDIGO[1], INDIGO[2], 235);
    rect(L, 560, WW, 44);
    fill(INDIGO_L[0], INDIGO_L[1], INDIGO_L[2], 160);
    rect(L, 596, WW, 10);
    // 海面的波纹：短促的白色弧
    for (let x = L; x < R; x += 46) {
      stroke(228, 232, 218, 90);
      strokeWeight(1.6);
      noFill();
      beginShape();
      vertex(x, 580);
      vertex(x + 9, 576);
      vertex(x + 18, 580);
      endShape();
    }
    noStroke();
    smallWave(268, 614, 1.0);
    smallWave(1150, 612, 0.8);

    // —— 地 ——
    fill(222, 210, 182);
    rect(L, GROUND - 6, WW, 12);
    fill(206, 192, 164, 160);
    for (let x = L; x < R; x += 40) rect(x, GROUND + 6, 26, 3);
    // 路边的石列：小、疏、高低不齐
    for (let x = L; x < R; x += 46) {
      const h = 7 + ((Math.floor(x / 46) * 5) % 5);
      fill(162, 156, 138, 190);
      rect(x, GROUND + 16 - h, 18, h + 4, 2);
      fill(188, 182, 164, 170);
      rect(x + 2, GROUND + 18 - h, 8, 2);
    }

    // —— 松 ——
    pine(196, GROUND, 1.15);
    pine(1060, GROUND, 0.96);
    pine(1700, GROUND, 1.0);

    // —— 一里塚：路边的里程碑 ——
    milestone(700, GROUND);

    // —— 旅人 ——
    traveller(520, GROUND, 0.9, 3);
    traveller(600, GROUND, 0.86, 7);
    traveller(1320, GROUND, 0.84, 11);

    // —— 题签（右上角竖长条） ——
    cartouche(1652, 300, 74, 250);
    // 朱印
    noStroke();
    fill(RED[0], RED[1], RED[2], 235);
    rect(1660, 536, 26, 26, 2);

    // —— 骑手 ——
    // 一条鲤鱼从水沟里蹦起来：它就是鹈鹕想啄又啄不到的那口吃的
    leapFish(g.p);

    if (hasRider) {
      const A = perf(g.p, {
        reach: [[0.40, 0], [0.48, 26], [0.54, 26], [0.62, 0]],
        pitch: [[0.40, 0], [0.48, 0.30], [0.55, 0.10], [0.62, 0]],
        gape: [[0.47, 0], [0.505, 0.85], [0.535, 0], [0.6, 0]],
      });
      push();
      translate(riderLocal, GROUND);
      drawRig(pose(t, { dist, neckReach: A.reach, headPitch: A.pitch, gape: A.gape }), {
        ink: INDIGO, body: [244, 236, 216], bodyDark: [206, 198, 174],
        bike: INDIGO, leg: [96, 84, 60], legFar: [164, 152, 124],
        beak: RED, pouch: [214, 120, 84], lw: 2.4,
        chain: [120, 110, 88],
        wheelOpt: { tyre: INDIGO, rim: INDIGO, spoke: INDIGO, spokeW: 1.0, hub: INDIGO, tyreW: 3.0 },
      });
      pop();
    }
  },
};

/** 跃出水沟的鲤鱼：一条弧线，几滴水 */
function leapFish(p) {
  const k = perf(p, { v: [[0.40, 0], [0.54, 1], [0.66, 0]] }).v;
  if (k < 0.02) return;
  const x = 1128 + (0.5 - k) * 54;
  const y = 700 - k * 250;
  push();
  translate(x, y);
  scale(1.5);
  rotate(-1.15 + k * 2.0);
  noStroke();
  fill(196, 92, 64, 240);
  beginShape();
  vertex(-22, 0); vertex(-4, -9); vertex(16, -6); vertex(24, 0);
  vertex(14, 6); vertex(-6, 9);
  endShape(CLOSE);
  // 尾
  fill(170, 70, 48, 235);
  triangle(-22, 0, -34, -8, -33, 8);
  // 眼
  fill(28, 24, 26);
  circle(12, -1, 3.2);
  // 鳍
  noFill();
  stroke(206, 120, 92, 200);
  strokeWeight(1.6);
  line(-2, -8, 6, -14);
  pop();
  // 水花
  const r = rng(21);
  noStroke();
  for (let i = 0; i < 10; i++) {
    fill(232, 240, 236, 150 * k);
    circle(1030 + r() * 50, 664 - r() * 60 * k, 1.6 + r() * 2.6);
  }
}

// ---------- 富士 ----------

function fuji(x, y, s) {
  push();
  translate(x, y);
  scale(s);
  noStroke();
  fill(INDIGO_L[0], INDIGO_L[1], INDIGO_L[2], 225);
  beginShape();
  vertex(-120, 0);
  vertex(-40, -132);
  vertex(0, -150);
  vertex(40, -132);
  vertex(120, 0);
  endShape(CLOSE);
  // 雪冠
  fill(246, 240, 226, 240);
  beginShape();
  vertex(-40, -132);
  vertex(0, -150);
  vertex(40, -132);
  vertex(26, -118);
  vertex(12, -128);
  vertex(0, -112);
  vertex(-12, -128);
  vertex(-26, -118);
  endShape(CLOSE);
  // 山脚的雾
  fill(232, 224, 202, 130);
  rect(-130, -16, 260, 16);
  pop();
}

// ---------- 浪 ----------

/** 一道小浪：路边水沟里的那种，卷起来，里面有一只鱼在瞪眼 */
function smallWave(x, y, s) {
  push();
  translate(x, y);
  scale(s);
  noStroke();
  fill(INDIGO[0], INDIGO[1], INDIGO[2], 225);
  beginShape();
  vertex(-86, 0);
  for (const q of C([-86, 0], [-70, -34], [-24, -52], [10, -44], 10)) vertex(q[0], q[1]);
  for (const q of C([10, -44], [26, -40], [30, -26], [22, -18], 8)) vertex(q[0], q[1]);
  for (const q of C([22, -18], [12, -30], [0, -34], [-8, -28], 6)) vertex(q[0], q[1]);
  vertex(-10, 0);
  endShape(CLOSE);
  // 浪花
  fill(238, 232, 214, 235);
  for (let i = 0; i < 7; i++) {
    const a = -0.4 - i * 0.22;
    circle(14 + Math.cos(a) * 20, -34 + Math.sin(a) * 18, 7 + i);
  }
  // 鱼眼：它也在看这只鸟
  fill(238, 232, 214);
  circle(2, -34, 12);
  fill(INDIGO[0], INDIGO[1], INDIGO[2]);
  circle(3, -34, 5);
  pop();
}

// ---------- 松 ----------

function pine(x, y, s) {
  push();
  translate(x, y);
  scale(s);
  noStroke();
  fill([120, 92, 62][0], 92, 62);
  fill(120, 92, 62);
  beginShape();
  vertex(-10, 0);
  vertex(-6, -90);
  vertex(-14, -130);
  vertex(-4, -128);
  vertex(2, -90);
  vertex(8, 0);
  endShape(CLOSE);
  stroke(64, 52, 38, 230);
  strokeWeight(2.4);
  line(-6, -96, -46, -132);
  line(0, -108, 44, -146);
  // 松针：一团一团的扇形
  noStroke();
  for (const c of [[-48, -136, 34], [-6, -150, 40], [46, -150, 32], [16, -128, 28], [-30, -118, 26]]) {
    fill(GREEN[0], GREEN[1], GREEN[2], 225);
    ellipse(c[0], c[1], c[2] * 2, c[2] * 0.9);
  }
  stroke(40, 52, 36, 180);
  strokeWeight(1.2);
  const r = rng(7);
  for (let i = 0; i < 26; i++) {
    const cx = -48 + r() * 100;
    const cy = -150 + r() * 40;
    line(cx, cy, cx + (r() - 0.5) * 16, cy - 8 - r() * 8);
  }
  pop();
}

// ---------- 一里塚 ----------

function milestone(x, y) {
  push();
  translate(x, y);
  noStroke();
  fill([150, 146, 130][0], 146, 130);
  fill(150, 146, 130);
  rect(-16, -74, 32, 74, 3);
  fill([172, 166, 148][0], 166, 148);
  fill(172, 166, 148);
  rect(-16, -74, 32, 8, 2);
  // 稻草绳
  stroke(176, 146, 92, 235);
  strokeWeight(3);
  line(-18, -56, 18, -52);
  line(-18, -50, 18, -46);
  // 碑面：三道刻痕（不写真字）
  stroke(74, 68, 54, 190);
  strokeWeight(2);
  line(-6, -66, -6, -20);
  line(0, -66, 0, -26);
  line(6, -66, 6, -20);
  pop();
}

// ---------- 旅人 ----------

function traveller(x, y, s, seed) {
  const r = rng(seed);
  push();
  translate(x, y);
  scale(s);
  noStroke();
  // 蓑与袴
  fill([138, 118, 84][0], 118, 84);
  fill(138, 118, 84);
  beginShape();
  vertex(-16, -104); vertex(16, -104); vertex(22, 0); vertex(-22, 0);
  endShape(CLOSE);
  stroke(INDIGO[0], INDIGO[1], INDIGO[2], 200);
  strokeWeight(1.6);
  beginShape();
  vertex(-16, -104); vertex(16, -104); vertex(22, 0); vertex(-22, 0);
  endShape(CLOSE);
  line(-16, -60, 16, -60);
  // 斗笠
  noStroke();
  fill(200, 178, 128);
  triangle(-26, -108, 26, -108, 0, -134);
  stroke(INDIGO[0], INDIGO[1], INDIGO[2], 180);
  strokeWeight(1.4);
  line(-26, -108, 26, -108);
  // 手杖 / 包袱
  if (seed % 2) {
    line(20, -96, 30, -2);
  } else {
    noStroke();
    fill(176, 132, 84);
    rect(-30, -86, 16, 18, 3);
  }
  // 脚
  stroke(INDIGO[0], INDIGO[1], INDIGO[2], 210);
  strokeWeight(3);
  line(-10, 0, -14, 2);
  line(10, 0, 14, 2);
  pop();
}

// ---------- 题签 ----------

function cartouche(x, y, w, h) {
  push();
  noStroke();
  fill(CREAM[0] + 8, CREAM[1] + 8, CREAM[2] + 8, 250);
  rect(x, y, w, h);
  noFill();
  stroke(INDIGO[0], INDIGO[1], INDIGO[2], 220);
  strokeWeight(2.4);
  rect(x, y, w, h);
  strokeWeight(1.0);
  rect(x + 5, y + 5, w - 10, h - 10);
  // 竖排的三道墨痕（不写真字，避免字体依赖）
  noStroke();
  fill(INDIGO[0], INDIGO[1], INDIGO[2], 180);
  for (let i = 0; i < 3; i++) {
    rect(x + w / 2 - 5, y + 26 + i * 30, 10, 16);
  }
  pop();
}
