// 03 汉画像石拓片（约 100，山东武氏祠一路）
// 拓片是凹线不着墨：所以黑地、白形、黑刻线。石头上有裂纹和拓包的擦痕。
import { GROUND } from '../main/camera.js';
import { pose } from '../rig/rig.js';
import { drawRig } from '../rig/draw.js';
import { speckle, band, fillPoly, strokePoly } from '../kit/paint.js';
import { perf } from '../kit/act.js';
import { taper } from '../kit/stroke.js';
import { rng, bez } from '../kit/core.js';

const PAPER = [228, 218, 194];
const STONE = [18, 18, 18];
const WHITE = [241, 235, 221];
const INK2 = [20, 20, 20];

const C = (a, b, c, d, n = 8) => bez(a, b, c, d, n);
const inkLine = (pts, w0 = 1.6, w1 = 0.8, a = 210) => taper(pts, w0, w1, INK2, a);

export default {
  id: 'han',
  card: { x: 132, y: 380, color: 'rgba(240,234,220,', light: true },

  draw(g) {
    const { t, dist, span, hasRider, riderLocal } = g;
    rectMode(CORNER);
    const L = span[0], R = span[1], WW = R - L;

    // —— 纸边 ——
    noStroke();
    fill(PAPER[0], PAPER[1], PAPER[2]);
    rect(L, 292, WW, 578);
    speckle(L, 292, WW, 578, 320, [188, 176, 150], 34, 2, 0.7, 2.6);

    // —— 石面 ——
    fill(STONE[0], STONE[1], STONE[2]);
    rect(L, 320, WW, 508);
    speckle(L, 320, WW, 508, 620, [128, 124, 116], 30, 5, 0.6, 2.4);
    speckle(L, 320, WW, 508, 360, [4, 4, 4], 52, 9, 1.1, 3.6);

    // 拓包的横向擦痕
    push();
    stroke(214, 206, 186, 12);
    const r0 = rng(31);
    for (let i = 0; i < 44; i++) {
      const y = 322 + r0() * 502;
      strokeWeight(1 + r0() * 5);
      line(L, y, R, y + (r0() - 0.5) * 6);
    }
    pop();

    deckle(L, R, 320, true);
    deckle(L, R, 828, false);

    // —— 上下边框：菱形纹 ——
    border(L, R, 324, 354);
    border(L, R, 792, 822);

    // —— 天：云气、日月、朱雀 ——
    clouds(L, R, 372);
    sunDisk(258, 420, 40);
    moonDisk(1700, 412, 36);
    phoenix(1330, 430, 0.86);

    // —— 阙楼：两座塔，中间留出一个门洞 ——
    gate(884, GROUND);

    // —— 车马出行：三辆轺车，鹈鹕在后面超车 ——
    chariot(96, 1.0, 3);
    chariot(360, 0.94, 17);
    chariot(616, 0.98, 29);

    // —— 树、人群、庖厨 ——
    tree(1136, GROUND, 1.0);
    crowd(1298, GROUND);
    dog(1252, GROUND, 1.0);
    kitchen(1580, GROUND);

    // —— 地线 ——
    noStroke();
    fill(WHITE[0], WHITE[1], WHITE[2], 80);
    rect(L, GROUND - 2, WW, 3);

    // —— 骑手：白形 + 黑刻线 ——
    if (hasRider) {
      // 表演：前轮碾进石缝，车头猛地一沉，鹈鹕张开翅保持平衡
      const A = perf(g.p, {
        wing: [[0.28, 0], [0.37, 0.85], [0.5, 0.7], [0.62, 0]],
        pitch: [[0.28, 0], [0.37, -0.34], [0.47, -0.12], [0.58, 0]],
        endo: [[0.30, 0], [0.37, 0.3], [0.46, 0.1], [0.56, 0]],
      });
      const pz = pose(t, { dist, wingRaise: A.wing, headPitch: A.pitch });
      push();
      translate(riderLocal, GROUND);
      translate(66, 0);
      rotate(A.endo);
      translate(-66, 0);
      // 先压一层加粗的黑：拓片里两个白形相叠，中间必有一道刻线
      drawRig(pz, { ink: [12, 12, 12], body: [12, 12, 12], bodyDark: [12, 12, 12], bike: [12, 12, 12], leg: [12, 12, 12], legFar: [12, 12, 12], beak: [12, 12, 12], pouch: [12, 12, 12], lw: 8.5, chain: [12, 12, 12] });
      drawRig(pz, {
        ink: [22, 22, 22], body: WHITE, bodyDark: [214, 207, 192],
        bike: WHITE, leg: WHITE, legFar: [206, 198, 182],
        beak: WHITE, pouch: [222, 214, 196], lw: 2.0,
        chain: [206, 198, 182],
        wheelOpt: { tyre: WHITE, rim: WHITE, spoke: WHITE, spokeW: 1.3, hub: WHITE, tyreW: 3.4 },
      });
      pop();

      // 石屑：从缝里蹦出来，仍是白形黑刻线
      const k = perf(g.p, { v: [[0.31, 0], [0.36, 1], [0.6, 0]] }).v;
      if (k > 0.02) {
        const r = rng(17);
        push();
        translate(640, GROUND);
        for (let i = 0; i < 16; i++) {
          const a = -Math.PI / 2 + (r() - 0.5) * 2.2;
          const d = 18 + r() * 90 * (1 - k * 0.4);
          const x = Math.cos(a) * d;
          const y = Math.sin(a) * d * 0.7 + (1 - k) * 40 * r();
          fill(WHITE[0], WHITE[1], WHITE[2], 240 * k);
          rect(x, y, 4 + r() * 9, 3 + r() * 7);
        }
        pop();
      }
    }

    // —— 裂纹：从顶上劈下来，正好劈开第三辆车的轮子 ——
    crack(640, 320, 828);

    // —— 统一的石面颗粒（盖在一切之上，包括骑手） ——
    speckle(L, 320, WW, 508, 220, [0, 0, 0], 30, 41, 0.9, 2.8);
  },
};

// ---------- 石与纸 ----------

function deckle(L, R, y, top) {
  push();
  noStroke();
  fill(PAPER[0], PAPER[1], PAPER[2]);
  const r = rng(top ? 5 : 6);
  beginShape();
  vertex(L, y);
  for (let x = L; x <= R; x += 26) vertex(x, y + (top ? -1 : 1) * (1 + r() * 5));
  vertex(R, y);
  if (top) { vertex(R, y - 12); vertex(L, y - 12); }
  else { vertex(R, y + 12); vertex(L, y + 12); }
  endShape(CLOSE);
  pop();
}

function border(L, R, y0, y1) {
  push();
  noFill();
  stroke(WHITE[0], WHITE[1], WHITE[2], 210);
  strokeWeight(1.6);
  line(L, y0, R, y0);
  line(L, y1, R, y1);
  for (let x = L; x < R; x += 44) {
    const my = (y0 + y1) / 2;
    line(x, my, x + 22, y0 + 3);
    line(x + 22, y0 + 3, x + 44, my);
    line(x + 44, my, x + 22, y1 - 3);
    line(x + 22, y1 - 3, x, my);
  }
  pop();
}

// ---------- 天 ----------

function sunDisk(x, y, r) {
  push();
  translate(x, y);
  noFill();
  stroke(WHITE[0], WHITE[1], WHITE[2], 230);
  strokeWeight(2.6);
  circle(0, 0, r * 2);
  strokeWeight(1.4);
  circle(0, 0, r * 1.7);
  noStroke();
  fill(WHITE[0], WHITE[1], WHITE[2]);
  ellipse(0, 2, 26, 14);
  circle(12, -8, 12);
  triangle(17, -8, 30, -6, 17, -2);
  stroke(WHITE[0], WHITE[1], WHITE[2], 230);
  strokeWeight(2);
  line(-2, 8, -8, 16);
  line(4, 8, 2, 16);
  pop();
}

function moonDisk(x, y, r) {
  push();
  translate(x, y);
  noFill();
  stroke(WHITE[0], WHITE[1], WHITE[2], 210);
  strokeWeight(2.4);
  circle(0, 0, r * 2);
  noStroke();
  fill(WHITE[0], WHITE[1], WHITE[2], 220);
  ellipse(0, 5, 30, 18);
  ellipse(-13, -3, 10, 9);
  ellipse(13, -3, 10, 9);
  pop();
}

function clouds(L, R, y0) {
  push();
  noFill();
  stroke(WHITE[0], WHITE[1], WHITE[2], 110);
  strokeWeight(1.6);
  const r = rng(23);
  for (let x = L - 40; x < R + 40; x += 176) {
    const y = y0 + r() * 26;
    const s = 0.7 + r() * 0.5;
    push();
    translate(x, y);
    scale(s);
    for (let k = 0; k < 3; k++) {
      beginShape();
      vertex(-46 + k * 12, 8);
      vertex(-30 + k * 12, -4);
      vertex(-8 + k * 12, 0);
      vertex(6 + k * 12, -12);
      vertex(26 + k * 12, -2);
      endShape();
      circle(-42 + k * 12, 3, 10);
    }
    pop();
  }
  pop();
}

// ---------- 阙 ----------

function gate(x, y) {
  push();
  translate(x, y);
  noStroke();
  fill(WHITE[0], WHITE[1], WHITE[2], 242);
  for (const ox of [-118, 118]) {
    // 阙身：下宽上窄，夯土的厚墩子
    beginShape();
    vertex(ox - 30, 0); vertex(ox - 20, -196); vertex(ox + 20, -196); vertex(ox + 30, 0);
    endShape(CLOSE);
    // 子阙（贴着主阙的矮墩）
    beginShape();
    vertex(ox + (ox < 0 ? 30 : -30) - 8, 0);
    vertex(ox + (ox < 0 ? 30 : -30) - 6, -120);
    vertex(ox + (ox < 0 ? 30 : -30) + 16, -120);
    vertex(ox + (ox < 0 ? 30 : -30) + 18, 0);
    endShape(CLOSE);
    // 三层屋檐：一次比一次宽，檐口起翘
    for (let k = 0; k < 3; k++) {
      const ty = -196 + k * 48;
      const wid = 46 + k * 5;
      beginShape();
      vertex(ox - wid, ty);
      vertex(ox - wid * 0.72, ty - 13);
      vertex(ox + wid * 0.72, ty - 13);
      vertex(ox + wid, ty);
      vertex(ox + wid * 0.6, ty + 4);
      vertex(ox - wid * 0.6, ty + 4);
      endShape(CLOSE);
      // 瓦垄
      stroke(INK2[0], INK2[1], INK2[2], 255);
      strokeWeight(1.1);
      for (let t = -3; t <= 3; t++) line(ox + t * wid * 0.2, ty - 12, ox + t * wid * 0.2, ty + 2);
      noStroke();
      fill(WHITE[0], WHITE[1], WHITE[2], 242);
    }
  }
  pop();
}
// ---------- 车马 ----------

function chariot(x, s, seed) {
  const r = rng(seed);
  push();
  translate(x, GROUND);
  scale(s);

  horse(62, 0, 1.0);

  noStroke();
  fill(WHITE[0], WHITE[1], WHITE[2], 242);
  rect(-38, -78, 78, 36, 3);
  stroke(WHITE[0], WHITE[1], WHITE[2], 242);
  strokeWeight(4);
  line(40, -46, 78, -64);
  noFill();
  strokeWeight(3.6);
  circle(-4, -32, 64);
  strokeWeight(1.4);
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    line(-4, -32, -4 + Math.cos(a) * 30, -32 + Math.sin(a) * 30);
  }

  noStroke();
  fill(WHITE[0], WHITE[1], WHITE[2], 238);
  beginShape();
  vertex(-52, -156); vertex(30, -156); vertex(18, -168); vertex(-38, -168);
  endShape(CLOSE);
  stroke(WHITE[0], WHITE[1], WHITE[2], 238);
  strokeWeight(3);
  line(-12, -156, -12, -80);

  figure(-16 + r() * 4, -80, 0.66);

  pop();
}

function horse(x, y, s) {
  push();
  translate(x, y);
  scale(s);
  // 腿：先画，藏在躯干后面（汉画的马腿是粗的，不是铁丝）
  const legs = [
    [[-40, -78], [-46, -44], [-50, -20], [-44, 0]],
    [[-22, -72], [-20, -42], [-18, -18], [-14, 0]],
    [[38, -78], [44, -44], [48, -20], [52, 0]],
    [[20, -72], [24, -42], [22, -18], [18, 0]],
  ];
  for (const lg of legs) {
    const shape = band(C(lg[0], lg[1], lg[2], lg[3], 8), [15, 11, 8, 6]);
    fillPoly(shape, WHITE, 255);
    strokePoly(shape, INK2, 1.4, 200);
  }
  // 尾
  const tail = C([-52, -104], [-76, -92], [-82, -58], [-72, -26], 10);
  const tailShape = band(tail, [12, 9, 7, 5, 3]);
  fillPoly(tailShape, WHITE, 245);
  strokePoly(tailShape, INK2, 1.3, 180);

  // 躯干 + 颈 + 头：合成一个轮廓，别让接缝露出来
  const bodySh = [[-56, -84], [-50, -108], [-30, -120], [-2, -124], [26, -120], [46, -108], [54, -94], [52, -78], [24, -66], [-6, -64], [-34, -70], [-52, -76]];
  const neckSh = [[34, -112], [50, -146], [62, -172], [74, -180], [86, -178], [90, -168], [78, -160], [66, -140], [62, -108], [52, -92]];
  const headSh = [[72, -182], [90, -184], [100, -174], [98, -162], [86, -158], [74, -166], [70, -176]];
  for (const sh of [bodySh, neckSh, headSh]) fillPoly(sh, WHITE, 255);
  for (const sh of [bodySh, neckSh, headSh]) strokePoly(sh, INK2, 2.2, 225);
  for (const sh of [bodySh, neckSh, headSh]) fillPoly(sh, WHITE, 255);

  // 耳、鬃
  inkLine(C([74, -182], [72, -194], [78, -196], [80, -184], 5), 2.0, 1.0);
  for (let i = 0; i < 5; i++) {
    inkLine(C([60 + i * 4, -168 + i * 8], [54 + i * 4, -158 + i * 8], [50 + i * 4, -150 + i * 8], [52 + i * 4, -144 + i * 8], 4), 1.6, 0.6, 190);
  }
  // 眼
  noStroke();
  fill(INK2[0], INK2[1], INK2[2]);
  circle(86, -174, 3.2);
  pop();
}
function figure(x, y, s) {
  push();
  translate(x, y);
  scale(s);
  noStroke();
  fill(WHITE[0], WHITE[1], WHITE[2], 238);
  beginShape();
  vertex(-13, -78); vertex(13, -78); vertex(21, 0); vertex(-21, 0);
  endShape(CLOSE);
  circle(0, -90, 20);
  rect(-9, -104, 18, 7, 1);
  beginShape();
  vertex(-13, -72); vertex(-30, -52); vertex(-22, -44); vertex(-8, -58);
  endShape(CLOSE);
  pop();
}

// ---------- 朱雀 ----------

function phoenix(x, y, s) {
  push();
  translate(x, y);
  scale(s);
  noStroke();
  fill(WHITE[0], WHITE[1], WHITE[2], 234);
  // 身
  beginShape();
  vertex(-26, 0); vertex(4, -20); vertex(38, -12); vertex(56, 6);
  vertex(28, 22); vertex(-8, 20);
  endShape(CLOSE);
  // 颈与头
  beginShape();
  vertex(34, -8); vertex(54, -50); vertex(66, -64); vertex(78, -60);
  vertex(76, -46); vertex(58, -34); vertex(52, -6);
  endShape(CLOSE);
  triangle(66, -66, 60, -82, 74, -72);
  triangle(74, -66, 80, -84, 82, -64);
  // 翅
  beginShape();
  vertex(2, -14); vertex(-30, -54); vertex(-6, -38); vertex(16, -58); vertex(36, -16);
  endShape(CLOSE);
  // 长尾：三根带羽枝的飘带
  noFill();
  stroke(WHITE[0], WHITE[1], WHITE[2], 226);
  strokeWeight(3.4);
  for (let i = 0; i < 3; i++) {
    const pts = bez([-24, 4], [-96, -20 + i * 20], [-130, 54 + i * 16], [-70, 104 + i * 24], 12);
    beginShape();
    for (const q of pts) vertex(q[0], q[1]);
    endShape();
    for (let k = 2; k < pts.length - 1; k += 3) {
      line(pts[k][0], pts[k][1], pts[k][0] - 9, pts[k][1] + 8);
    }
  }
  pop();
}
// ---------- 树、人群、庖厨 ----------

function tree(x, y, s) {
  push();
  translate(x, y);
  scale(s);
  noStroke();
  fill(WHITE[0], WHITE[1], WHITE[2], 238);
  beginShape();
  vertex(-11, 0); vertex(-7, -110); vertex(0, -150); vertex(6, -110); vertex(10, 0);
  endShape(CLOSE);
  stroke(WHITE[0], WHITE[1], WHITE[2], 238);
  strokeWeight(5);
  line(-4, -104, -42, -146);
  line(4, -112, 44, -152);
  line(0, -126, 4, -172);
  line(-30, -136, -52, -160);
  line(32, -142, 54, -160);
  // 冠：不规则的团，不是糖葫芦
  noStroke();
  fill(WHITE[0], WHITE[1], WHITE[2], 205);
  const r = rng(43);
  const cl = [[-46, -158, 30], [44, -164, 28], [4, -186, 34], [-16, -148, 24], [24, -144, 22], [-4, -160, 30], [30, -176, 20]];
  for (const c of cl) {
    beginShape();
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2;
      const rr = c[2] * (0.8 + r() * 0.4);
      vertex(c[0] + Math.cos(a) * rr, c[1] + Math.sin(a) * rr * 0.8);
    }
    endShape(CLOSE);
  }
  pop();
}
function crowd(x, y) {
  const r = rng(77);
  const hs = [0.62, 0.72, 0.56, 0.68, 0.6];
  for (let i = 0; i < 5; i++) {
    figure(x + i * 44 + r() * 14, y, hs[i]);
  }
  // 一个举手的、一个抱拳的
  stroke(WHITE[0], WHITE[1], WHITE[2], 238);
  strokeWeight(3.4);
  line(x + 44, y - hs[1] * 60, x + 58, y - hs[1] * 96);
  line(x + 132, y - hs[3] * 58, x + 120, y - hs[3] * 84);
}

function dog(x, y, s) {
  push();
  translate(x, y);
  scale(s);
  noStroke();
  fill(WHITE[0], WHITE[1], WHITE[2], 238);
  ellipse(0, -24, 44, 20);
  circle(20, -36, 16);
  triangle(23, -42, 30, -56, 33, -38);
  stroke(WHITE[0], WHITE[1], WHITE[2], 238);
  strokeWeight(3.4);
  line(14, -16, 16, 0);
  line(-14, -16, -16, 0);
  beginShape();
  vertex(-20, -28); vertex(-34, -44); vertex(-28, -48);
  endShape();
  pop();
}

function kitchen(x, y) {
  push();
  translate(x, y);
  noStroke();
  fill(WHITE[0], WHITE[1], WHITE[2], 238);
  rect(-56, -46, 112, 46);
  noFill();
  stroke(WHITE[0], WHITE[1], WHITE[2], 238);
  strokeWeight(3);
  arc(0, -80, 56, 40, 0, Math.PI, OPEN);
  line(-8, -86, -22, -104);
  line(8, -86, 22, -104);
  line(-30, -80, -30, -58);
  line(30, -80, 30, -58);
  figure(-70, 0, 0.62);
  figure(64, 0, 0.58);
  pop();
}

// ---------- 裂纹 ----------

function crack(x, y0, y1) {
  const r = rng(9);
  const pts = [[x, y0]];
  let cx = x;
  for (let y = y0; y < y1; y += 34) {
    cx += (r() - 0.5) * 9 + (y > 560 ? 3 : -2);
    pts.push([cx, y]);
  }
  push();
  noFill();
  stroke(0, 0, 0, 240);
  strokeWeight(4.5);
  beginShape();
  for (const q of pts) vertex(q[0], q[1]);
  endShape();
  stroke(224, 216, 198, 170);
  strokeWeight(1.2);
  beginShape();
  for (const q of pts) vertex(q[0] - 4, q[1]);
  endShape();
  // 修复者的虚线：把劈开的轮子补回来
  stroke(238, 232, 216, 215);
  strokeWeight(2);
  for (let i = 0; i < 10; i++) {
    if (i % 2) continue;
    const a0 = Math.PI * 0.55 + (i / 10) * Math.PI * 1.1;
    arc(624, GROUND - 32, 64, 64, a0, a0 + Math.PI * 0.09, OPEN);
  }
  pop();
}
