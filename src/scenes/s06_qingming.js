// 06 清明上河图（约 1100，汴京街市）
// 淡彩 + 细线。热闹都在街面，屋顶以上留白。
import { GROUND } from '../main/camera.js';
import { pose } from '../rig/rig.js';
import { drawRig } from '../rig/draw.js';
import { vGrad, speckle, fillPoly, strokePoly } from '../kit/paint.js';
import { rng } from '../kit/core.js';
import { perf } from '../kit/act.js';

const INK = [51, 48, 42];
const ROOF = [96, 89, 74];
const ROOF_D = [72, 67, 56];
const WALL = [234, 223, 199];
const WOOD = [146, 105, 64];
const AWN = [186, 141, 96];
const GREEN = [108, 120, 86];

export default {
  id: 'qingming',
  card: { x: 128, y: 310, color: 'rgba(52,46,38,', light: false },

  draw(g) {
    const { t, dist, span, hasRider, riderLocal } = g;
    rectMode(CORNER);
    const L = span[0], R = span[1], WW = R - L;

    // —— 天 ——
    vGrad(L, 286, WW, 430, [238, 229, 206], [220, 209, 184], 24);
    // —— 地 ——
    noStroke();
    fill(216, 205, 179);
    rect(L, GROUND, WW, 180);
    fill(206, 194, 168);
    rect(L, GROUND - 5, WW, 9);

    // —— 远景：一片淡灰的屋顶 ——
    farBank(L, R);

    // —— 街市 ——
    shop(40, 300, 176, 54, { sign: 1, awn: true });
    teahouse(392, 296);
    shop(748, 280, 252, 40, { sign: 2, awn: false, goods: true });
    wineShop(1088, 268);
    shop(1424, 320, 214, 50, { sign: 3, awn: true, goods: true });
    // 间隙里的那座小石桥，把远岸和街面接起来
    stoneBridge(1050, 1152);

    // —— 街面器物 ——
    tree(742, GROUND, 1.0);
    vendor(1060, GROUND);
    donkeyCart(1258, GROUND, 0.92);
    sedan(1700, GROUND, 0.9);

    // —— 人 ——
    const r = rng(101);
    const folks = [
      [128, 0.62], [196, 0.56], [262, 0.6], [330, 0.54], [404, 0.62],
      [520, 0.58], [586, 0.62], [660, 0.56], [700, 0.5],
      [860, 0.6], [930, 0.56], [1000, 0.62], [1108, 0.5],
      [1216, 0.58], [1340, 0.54], [1430, 0.6], [1560, 0.56], [1630, 0.6],
    ];
    for (let i = 0; i < folks.length; i++) {
      person(folks[i][0] + r() * 10, GROUND, folks[i][1], i);
    }
    // 追车的小孩：全街只有他在跑
    kid(1206, GROUND, 0.52);

    // —— 路面：车辙与浮土 ——
    noStroke();
    fill(198, 186, 160, 190);
    for (let x = L; x < R; x += 62) rect(x, GROUND + 10, 52, 3);
    speckle(L, GROUND, WW, 140, 260, [176, 164, 140], 55, 7, 0.8, 2.4);

    // —— 近处的河：街沿着河走 ——
    canal(L, R);

    // —— 骑手 ——
    if (hasRider) {
      // 表演：茶寮到木桩之间拉了一根晾布绳，横在路当间。鹈鹕缩脖钻过去。
      const A = perf(g.p, {
        lift: [[0.235, 0], [0.315, -15], [0.40, -15], [0.48, 0]],
        pitch: [[0.235, 0], [0.315, 0.40], [0.40, 0.36], [0.48, 0]],
      });
      push();
      translate(riderLocal, GROUND);
      drawRig(pose(t, { dist, neckLift: A.lift, headPitch: A.pitch }), {
        ink: INK, body: [246, 240, 226], bodyDark: [216, 207, 188],
        bike: [74, 64, 52], leg: [122, 94, 66], legFar: [162, 148, 124],
        beak: [206, 154, 84], pouch: [218, 172, 108], lw: 1.6,
        chain: [140, 128, 108],
        wheelOpt: { tyre: [74, 64, 52], rim: [112, 98, 78], spoke: [122, 108, 86], spokeW: 0.6, hub: [74, 64, 52], tyreW: 2.4 },
      });
      pop();
    }

    // 那根晾布绳：画在骑手之后，所以它真的挡在路上
    laundryLine(g.p, t);
  },
};

/** 晾布绳：两根竹竿撑在街心，绳上挂着三块布 */
function laundryLine(p, t) {
  const sw = perf(p, { v: [[0.27, 0], [0.335, 1], [0.52, 0]] }).v;
  const swing = Math.sin((p - 0.335) * 32) * 0.26 * sw;
  const xa = 606, xb = 812, yr = 428;
  const P = (u) => [xa + (xb - xa) * u, yr + Math.sin(u * Math.PI) * 13];

  push();
  // 两根竹竿
  noStroke();
  fill(126, 108, 80, 235);
  rect(xa - 4, 392, 8, 308);
  rect(xb - 4, 392, 8, 308);
  fill(150, 132, 100, 200);
  rect(xa - 5, 392, 3, 308);
  rect(xb - 5, 392, 3, 308);

  // 绳
  noFill();
  stroke(92, 78, 58, 210);
  strokeWeight(2.0);
  beginShape();
  for (let i = 0; i <= 14; i++) {
    const q = P(i / 14);
    vertex(q[0], q[1] + Math.sin(i / 14 * Math.PI) * Math.sin((p - 0.335) * 32 + 0.6) * 5 * sw);
  }
  endShape();

  // 三块布
  const cloths = [0.26, 0.5, 0.74];
  for (let i = 0; i < cloths.length; i++) {
    const q = P(cloths[i]);
    const a = swing * (1 + i * 0.3);
    push();
    translate(q[0], q[1]);
    rotate(a);
    noStroke();
    fill(i === 1 ? [176, 132, 84, 236] : [228, 216, 190, 240]);
    beginShape();
    vertex(-13, 0); vertex(13, 0);
    vertex(10, 40 + i * 5); vertex(-10, 38 + i * 5);
    endShape(CLOSE);
    stroke(150, 130, 100, 80);
    strokeWeight(1);
    line(-5, 5, -4, 36 + i * 5);
    line(5, 5, 6, 37 + i * 5);
    pop();
  }
  pop();
}

/** 远岸：街的后头还有一层屋脊，再远就是桅杆 */
function farBank(L, R) {
  const r = rng(88);

  // 远岸的房子：小、淡、密
  for (let x = L - 80; x < R + 80; x += 124) {
    const w = 92 + r() * 44;
    const h = 54 + r() * 46;
    const base = 560;
    noStroke();
    fill(212, 202, 178, 165);
    rect(x, base - h, w, h);
    fill(186, 176, 152, 170);
    beginShape();
    vertex(x - 10, base - h);
    vertex(x + w / 2, base - h - 16 - r() * 8);
    vertex(x + w + 10, base - h);
    endShape(CLOSE);
    fill(168, 154, 128, 120);
    rect(x + w * 0.26, base - h * 0.58, 9, 11);
    rect(x + w * 0.62, base - h * 0.58, 9, 11);
  }

  // 桅杆：从屋顶后面竖起来，是这座城很大的信号
  for (const mx of [212, 962, 1588]) {
    stroke(108, 92, 72, 130);
    strokeWeight(2.2);
    line(mx, 520, mx, 404);
    stroke(108, 92, 72, 90);
    strokeWeight(1.1);
    line(mx - 22, 462, mx, 424);
    line(mx + 20, 450, mx, 424);
  }
}

/** 一条运货的小船 */
function boat(x, s) {
  push();
  translate(x, 544);
  scale(s);
  noStroke();
  fill(122, 96, 70, 235);
  beginShape();
  vertex(-46, 0);
  vertex(44, -2);
  vertex(34, 10);
  vertex(-38, 11);
  endShape(CLOSE);
  // 篷
  fill(96, 78, 58, 225);
  beginShape();
  vertex(-16, -2);
  vertex(-10, -26);
  vertex(18, -26);
  vertex(24, -2);
  endShape(CLOSE);
  // 桅
  stroke(104, 88, 68, 210);
  strokeWeight(1.8);
  line(-4, -26, -4, -62);
  pop();
}

/** 石拱桥：只露在房子的缝里 */
function stoneBridge(x0, x1) {
  const mid = (x0 + x1) / 2;
  noStroke();
  fill(198, 188, 162, 235);
  beginShape();
  vertex(x0, 528);
  vertex(x0 + 10, 508);
  vertex(mid, 500);
  vertex(x1 - 10, 508);
  vertex(x1, 528);
  vertex(x1 - 10, 534);
  vertex(mid, 512);
  vertex(x0 + 10, 534);
  endShape(CLOSE);
  // 拱洞
  fill(120, 140, 146, 235);
  beginShape();
  vertex(x0 + 16, 526);
  vertex(mid, 512);
  vertex(x1 - 16, 526);
  vertex(x1 - 16, 546);
  vertex(x0 + 16, 546);
  endShape(CLOSE);
  // 桥栏
  stroke(150, 136, 108, 200);
  strokeWeight(1.6);
  line(x0 + 8, 506, x1 - 8, 506);
  for (let i = 0; i < 5; i++) {
    const bx = x0 + 12 + i * (x1 - x0 - 24) / 4;
    line(bx, 506, bx, 514);
  }
  // 桥上两个人
  noStroke();
  fill(96, 84, 66, 230);
  for (const bx of [mid - 14, mid + 8]) {
    rect(bx, 496, 6, 10);
    circle(bx + 3, 493, 6);
  }
}


/** 前景的河：石岸、水纹、两条泊船。这是「上河」两个字 */
function canal(L, R) {
  push();
  noStroke();
  // 石岸
  fill(196, 186, 160);
  rect(L, 742, R - L, 14);
  fill(182, 170, 144);
  for (let x = L; x < R; x += 34) rect(x + 3, 744, 26, 9);
  stroke(140, 128, 104, 90);
  strokeWeight(1.2);
  for (let x = L; x < R; x += 34) line(x, 748, x, 756);
  // 水
  fill(126, 144, 140);
  rect(L, 756, R - L, 110);
  fill(146, 168, 170, 120);
  rect(L, 756, R - L, 6);
  // 水纹：短横线，越近越疏
  stroke(206, 220, 216, 120);
  strokeWeight(2.0);
  for (let y = 768; y < 860; y += 18) {
    const gap = 44 + (y - 768) * 0.7;
    for (let x = L - gap; x < R + gap; x += gap) {
      const off = ((Math.floor(y / 12) % 2) * gap) / 2;
      line(x + off, y, x + off + gap * 0.42, y);
    }
  }

  // 倒影：岸与水里的竖向淡影
  noStroke();
  for (let x = L; x < R; x += 26) {
    const h = 6 + ((Math.floor(x / 26) * 7) % 5) * 3;
    fill(92, 104, 102, 26);
    rect(x, 758, 18, h);
  }
  // 倒影：几道竖着的长影
  noStroke();
  for (const rx of [180, 268, 520, 860, 1104, 1500]) {
    fill(88, 100, 98, 30);
    rect(rx, 758, 10 + (rx % 17), 46 + (rx % 29));
  }
  // 两条泊船
  moored(300, 1.0);
  moored(1320, 0.88);
  pop();
}

/** 泊在岸边的货船 */
function moored(x, s) {
  push();
  translate(x, 806);
  scale(s);
  noStroke();
  // 船身
  fill(120, 96, 70, 245);
  beginShape();
  vertex(-78, -12);
  vertex(70, -14);
  vertex(58, 10);
  vertex(-64, 12);
  endShape(CLOSE);
  fill(92, 74, 54, 240);
  rect(-56, -22, 104, 10);
  // 篷
  fill(104, 84, 62, 240);
  beginShape();
  vertex(-24, -22);
  vertex(-14, -54);
  vertex(26, -54);
  vertex(36, -22);
  endShape(CLOSE);
  // 桅与缆
  stroke(96, 80, 60, 220);
  strokeWeight(2.4);
  line(-34, -22, -34, -96);
  line(44, -22, 44, -84);
  strokeWeight(1.4);
  line(-34, -96, 44, -84);
  line(44, -84, 74, -20);
  // 船上的人
  noStroke();
  fill(70, 58, 44, 230);
  rect(-6, -44, 6, 20);
  circle(-3, -47, 9);
  pop();
}

// ---------- 远景 ----------

function farRoofs(L, R) {
  noStroke();
  // 城墙
  fill(196, 186, 162, 210);
  rect(L, 486, R - L, 54);
  fill(186, 176, 152, 210);
  for (let x = L; x < R; x += 36) rect(x, 478, 24, 10);
  // 城墙里的屋顶
  const r = rng(17);
  for (let x = L - 30; x < R + 30; x += 118) {
    const h = 30 + r() * 26;
    const w = 70 + r() * 40;
    fill(180, 170, 148, 190);
    fillPoly([[x, 486], [x + w * 0.5, 486 - h], [x + w, 486], [x + w, 500], [x, 500]], [182, 172, 150], 190);
  }
  // 远树
  for (let x = L; x < R; x += 160) {
    fill(150, 158, 128, 120);
    circle(x + 40, 476, 46);
  }
}

// ---------- 屋顶 ----------

/** cx 中心，wallTop 檐口高度，w 墙宽，rise 屋脊比檐口高多少 */
function roof(cx, wallTop, w, rise) {
  const eL = cx - w / 2 - 18;
  const eR = cx + w / 2 + 18;
  const peak = wallTop - rise;
  // 两个坡面
  fillPoly([[eL, wallTop], [cx, peak], [cx, peak + 9], [eL + 12, wallTop + 7]], ROOF, 255);
  fillPoly([[eR, wallTop], [cx, peak], [cx, peak + 9], [eR - 12, wallTop + 7]], ROOF_D, 255);
  // 瓦垄：顺着坡走，短促
  stroke(INK[0], INK[1], INK[2], 90);
  strokeWeight(0.8);
  const N = Math.max(10, Math.floor(w / 15));
  for (let i = 0; i <= N; i++) {
    const x0 = eL + ((eR - eL) * i) / N;
    // 只画到屋面为止，别让瓦垄飘到屋檐外面
    const k = x0 < cx ? (x0 - eL) / (cx - eL) : (eR - x0) / (eR - cx);
    line(x0, wallTop + 1, x0, wallTop + (peak + 8 - wallTop) * Math.min(1, k));
  }
  // 檐口：一条厚线 + 两端起翘
  stroke(INK[0], INK[1], INK[2], 220);
  strokeWeight(2.4);
  line(eL, wallTop, eR, wallTop);
  noFill();
  strokeWeight(2.0);
  beginShape();
  vertex(eL - 8, wallTop - 5);
  vertex(eL + 4, wallTop + 2);
  vertex(eL + 4, wallTop + 9);
  endShape();
  beginShape();
  vertex(eR + 8, wallTop - 5);
  vertex(eR - 4, wallTop + 2);
  vertex(eR - 4, wallTop + 9);
  endShape();
  // 屋脊
  noStroke();
  fill(62, 58, 48, 255);
  rect(cx - 9, peak - 5, 18, 8, 2);
}

// ---------- 店铺 ----------

function shop(x, w, h, rise, o = {}) {
  const y = GROUND;
  const top = y - h;
  fillPoly([[x, y], [x + w, y], [x + w, top], [x, top]], WALL, 255);
  strokePoly([[x, y], [x + w, y], [x + w, top], [x, top]], INK, 1.3, 160);
  // 木柱
  stroke(WOOD[0], WOOD[1], WOOD[2], 230);
  strokeWeight(3.2);
  line(x + 8, y, x + 8, top);
  line(x + w - 8, y, x + w - 8, top);
  line(x, top + 5, x + w, top + 5);
  // 门
  noStroke();
  fill(92, 74, 54, 235);
  rect(x + w * 0.14, y - 112, w * 0.26, 112);
  // 窗
  fill(160, 128, 90, 215);
  rect(x + w * 0.54, y - 108, w * 0.3, 50);
  stroke(INK[0], INK[1], INK[2], 130);
  strokeWeight(0.8);
  for (let i = 0; i < 4; i++) line(x + w * 0.54, y - 108 + i * 13, x + w * 0.84, y - 108 + i * 13);
  for (let i = 1; i < 4; i++) line(x + w * 0.54 + i * w * 0.075, y - 108, x + w * 0.54 + i * w * 0.075, y - 58);

  // 招牌
  if (o.sign) {
    noStroke();
    fill(70, 56, 42, 240);
    rect(x + w * 0.48 - 8, y - 152, 16, 70);
    fill(226, 214, 188, 220);
    for (let i = 0; i < 3; i++) rect(x + w * 0.48 - 3.5, y - 145 + i * 21, 7, 11);
  }

  // 檐下挂的货：一排竖条
  if (o.goods) {
    noStroke();
    for (let i = 0; i < 9; i++) {
      const gx = x + w * 0.12 + i * w * 0.085;
      fill(i % 2 ? [176, 132, 84] : [138, 116, 88], 220);
      rect(gx, y - 178, 7, 26 + (i % 3) * 6);
    }
  }

  // 遮阳棚
  if (o.awn) {
    const n = 7;
    for (let i = 0; i < n; i++) {
      fillPoly([
        [x + 10 + (i * (w - 20)) / n, y - 176],
        [x + 10 + ((i + 1) * (w - 20)) / n, y - 176],
        [x + 6 + ((i + 1) * (w - 20)) / n, y - 146],
        [x + 6 + (i * (w - 20)) / n, y - 146],
      ], i % 2 ? AWN : [208, 192, 166], 250);
    }
    stroke(INK[0], INK[1], INK[2], 120);
    strokeWeight(0.9);
    line(x + 8, y - 176, x + 4, y - 146);
  }

  roof(x + w / 2, top, w, rise);
}

function teahouse(x, w) {
  const y = GROUND;
  shop(x, w, 208, 42, { awn: true });
  // 棚下的桌与客
  noStroke();
  fill(146, 112, 74, 240);
  rect(x + 26, y - 48, 66, 6);
  rect(x + 32, y - 42, 5, 42);
  rect(x + 80, y - 42, 5, 42);
  person(x + 46, y, 0.44, 3);
  person(x + 78, y, 0.42, 8);
  fill(146, 112, 74, 240);
  rect(x + 150, y - 44, 58, 6);
  rect(x + 156, y - 38, 5, 38);
  rect(x + 196, y - 38, 5, 38);
  person(x + 170, y, 0.44, 5);
}

function wineShop(x, w) {
  shop(x, w, 200, 46, { sign: 0, awn: true, flag: true });
  // 酒旗
  stroke(74, 58, 42, 240);
  strokeWeight(2.4);
  line(x + w - 26, GROUND - 190, x + w - 26, GROUND - 306);
  noStroke();
  fillPoly([
    [x + w - 26, GROUND - 302], [x + w + 34, GROUND - 292],
    [x + w + 30, GROUND - 232], [x + w - 26, GROUND - 242],
  ], [222, 208, 180], 250);
  // 旗子背面：一只鹈鹕
  fill(INK[0], INK[1], INK[2], 200);
  ellipse(x + w + 8, GROUND - 268, 20, 10);
  circle(x + w + 18, GROUND - 273, 7);
  triangle(x + w + 21, GROUND - 273, x + w + 29, GROUND - 271, x + w + 21, GROUND - 269);
  stroke(INK[0], INK[1], INK[2], 160);
  strokeWeight(1.1);
  circle(x + w + 0, GROUND - 254, 11);
  circle(x + w + 13, GROUND - 254, 11);
}

// ---------- 人 ----------

function person(x, y, s, seed) {
  const r = rng(seed * 7 + 3);
  push();
  translate(x, y);
  scale(s);
  const col = [[96, 88, 72], [124, 108, 84], [88, 98, 92], [142, 118, 88], [110, 100, 84], [82, 78, 68]][seed % 6];
  // 袍：下摆略张
  fillPoly([[-11, -104], [11, -104], [16, 0], [-16, 0]], col, 244);
  strokePoly([[-11, -104], [11, -104], [16, 0], [-16, 0]], INK, 1.2, 180);
  // 臂
  stroke(INK[0], INK[1], INK[2], 210);
  strokeWeight(2.2);
  const swing = (r() - 0.5) * 8;
  line(-9, -98, -14 + swing, -58);
  line(9, -98, 15 + swing, -58);
  // 头
  noStroke();
  fill(228, 210, 180);
  circle(0, -114, 16);
  strokePoly([[-7, -108], [-6, -118], [0, -122], [6, -118], [7, -108]], INK, 1.0, 130);
  // 幞头
  noStroke();
  fill(INK[0], INK[1], INK[2], 230);
  if (seed % 3 === 0) {
    triangle(-12, -120, 12, -120, 0, -136);
  } else {
    rect(-8, -132, 16, 9, 2);
  }
  // 挑担
  if (seed % 4 === 0) {
    stroke(96, 82, 62, 225);
    strokeWeight(2);
    line(-18, -96, 18, -104);
    noStroke();
    fill(150, 116, 78, 225);
    rect(-24, -84, 12, 12);
    rect(12, -94, 12, 12);
  }
  pop();
}

function kid(x, y, s) {
  push();
  translate(x, y);
  scale(s);
  fillPoly([[-9, -70], [9, -70], [13, 0], [-13, 0]], [130, 100, 72], 244);
  strokePoly([[-9, -70], [9, -70], [13, 0], [-13, 0]], INK, 1.2, 170);
  noStroke();
  fill(228, 210, 180);
  circle(0, -80, 18);
  fill(INK[0], INK[1], INK[2], 225);
  ellipse(0, -88, 16, 7);
  stroke(INK[0], INK[1], INK[2], 210);
  strokeWeight(2.4);
  line(8, -58, 22, -80);
  pop();
}

// ---------- 器物 ----------

function donkeyCart(x, y, s) {
  push();
  translate(x, y);
  scale(s);
  // 驴
  fillPoly([[-6, -84], [16, -90], [34, -86], [40, -74], [30, -64], [6, -64], [-8, -72]], [138, 132, 118], 246);
  strokePoly([[-6, -84], [16, -90], [34, -86], [40, -74], [30, -64], [6, -64], [-8, -72]], INK, 1.4, 185);
  fillPoly([[4, -86], [10, -110], [18, -116], [24, -110], [20, -94], [18, -82]], [138, 132, 118], 246);
  strokePoly([[4, -86], [10, -110], [18, -116], [24, -110], [20, -94], [18, -82]], INK, 1.4, 185);
  noStroke();
  fill(INK[0], INK[1], INK[2]);
  circle(19, -108, 2.2);
  stroke(INK[0], INK[1], INK[2]);
  strokeWeight(2);
  line(2, -66, 0, 0);
  line(16, -64, 18, 0);
  line(28, -66, 30, 0);
  line(36, -72, 38, 0);
  // 车斗
  noStroke();
  fill(146, 110, 72, 244);
  rect(54, -80, 64, 30, 2);
  stroke(96, 76, 54, 230);
  strokeWeight(2.2);
  line(40, -58, 68, -70);
  strokeWeight(1.2);
  line(54, -68, 118, -68);
  // 轮
  noFill();
  stroke(INK[0], INK[1], INK[2], 225);
  strokeWeight(2);
  circle(84, -30, 58);
  strokeWeight(0.8);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    line(84, -30, 84 + Math.cos(a) * 28, -30 + Math.sin(a) * 28);
  }
  pop();
}

function sedan(x, y, s) {
  push();
  translate(x, y);
  scale(s);
  fillPoly([[-26, -132], [26, -132], [30, -72], [-30, -72]], [172, 142, 104], 246);
  strokePoly([[-26, -132], [26, -132], [30, -72], [-30, -72]], INK, 1.5, 195);
  roof(0, -132, 52, 26);
  noStroke();
  fill(96, 78, 58, 225);
  rect(4, -112, 14, 32);
  stroke(96, 76, 54);
  strokeWeight(2.4);
  line(-30, -98, -64, -110);
  line(30, -98, 64, -110);
  person(-64, 0, 0.56, 2);
  person(64, 0, 0.56, 9);
  pop();
}

function vendor(x, y) {
  push();
  translate(x, y);
  stroke(96, 76, 54, 230);
  strokeWeight(2.4);
  line(-34, -78, 34, -86);
  noStroke();
  fill(150, 114, 74, 244);
  rect(-44, -72, 22, 16);
  rect(28, -82, 22, 16);
  fillPoly([[-9, -94], [9, -94], [13, 0], [-13, 0]], [104, 92, 76], 244);
  strokePoly([[-9, -94], [9, -94], [13, 0], [-13, 0]], INK, 1.2, 180);
  noStroke();
  fill(228, 210, 180);
  circle(0, -102, 17);
  fill(INK[0], INK[1], INK[2], 228);
  triangle(-12, -106, 12, -106, 0, -122);
  pop();
}

function tree(x, y, s) {
  push();
  translate(x, y);
  scale(s);
  fillPoly([[-7, 0], [-5, -110], [5, -110], [7, 0]], [110, 84, 58], 246);
  strokePoly([[-7, 0], [-5, -110], [5, -110], [7, 0]], INK, 1.3, 185);
  stroke(INK[0], INK[1], INK[2], 205);
  strokeWeight(2.2);
  line(-4, -104, -30, -140);
  line(4, -108, 34, -146);
  line(0, -116, 2, -160);
  noStroke();
  fill(GREEN[0], GREEN[1], GREEN[2], 215);
  const r = rng(5);
  for (let i = 0; i < 24; i++) {
    const a = r() * Math.PI * 2;
    const rr = r() * 52;
    circle(Math.cos(a) * rr, -158 + Math.sin(a) * rr * 0.62, 13 + r() * 15);
  }
  pop();
}
