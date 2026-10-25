// 07 玛雅抄本（约 1200，树皮纸上的红黑两色）
// 平涂、粗轮廓、方正的象形块。折页的竖折痕留着。
import { GROUND } from '../main/camera.js';
import { pose, ribbon } from '../rig/rig.js';
import { drawRig } from '../rig/draw.js';
import { vGrad, speckle, fillPoly, strokePoly, starPts } from '../kit/paint.js';
import { rng, bez } from '../kit/core.js';
import { perf } from '../kit/act.js';

const BARK = [231, 216, 178];
const BARK_D = [208, 190, 150];
const RED = [176, 68, 44];
const BLK = [44, 30, 20];
const GRN = [74, 107, 74];
const OCH = [196, 146, 60];

export default {
  id: 'maya',
  card: { x: 124, y: 314, color: 'rgba(60,28,18,', light: false },

  draw(g) {
    const { t, dist, span, hasRider, riderLocal } = g;
    rectMode(CORNER);
    const L = span[0], R = span[1], WW = R - L;

    // —— 树皮纸 ——
    vGrad(L, 286, WW, 580, BARK, BARK_D, 40);
    speckle(L, 286, WW, 580, 900, [150, 122, 78], 26, 4, 0.5, 2.0);
    // 纤维
    push();
    stroke(188, 164, 122, 34);
    const r = rng(12);
    for (let i = 0; i < 120; i++) {
      const y = 290 + r() * 570;
      strokeWeight(0.8 + r() * 1.2);
      line(L, y, L + 180 + r() * 500, y + (r() - 0.5) * 4);
    }
    pop();
    // 折痕
    for (let x = L; x < R; x += 300) {
      stroke(120, 94, 60, 22);
      strokeWeight(7);
      line(x, 292, x, 858);
      stroke(246, 236, 212, 40);
      strokeWeight(2);
      line(x + 4, 292, x + 4, 858);
    }

    // —— 天带 ——
    noStroke();
    fill(BLK[0], BLK[1], BLK[2]);
    rect(L, 292, WW, 78);
    for (let x = L + 20; x < R; x += 104) starGlyph(x, 331, 13);
    // 太阳与金星
    sunGlyph(760, 331, 26);
    venusGlyph(1260, 331, 20);

    // —— 地：席纹 ——
    fill(RED[0], RED[1], RED[2]);
    rect(L, 700, WW, 160);
    stroke(92, 34, 22, 200);
    strokeWeight(3);
    for (let x = L; x < R; x += 26) line(x, 704, x, 860);
    for (let y = 712; y < 860; y += 26) line(L, y, R, y);

    // —— 建筑与树 ——
    pyramid(1020, GROUND);
    ceiba(1400, GROUND, 1.0);

    // —— 人物 ——
    scribe(250, GROUND, 1.0);
    priest(566, GROUND, 1.0, 3);
    priest(640, GROUND, 0.92, 9);
    serpent(1640, GROUND, 1.0);

    // —— 象形文字栏 ——
    for (let i = 0; i < 5; i++) glyphBlock(72, 380 + i * 62, 52, i);
    for (let i = 0; i < 4; i++) glyphBlock(146, 396 + i * 62, 44, i + 5);

    // —— 白路（sacbe） ——
    noStroke();
    fill(240, 230, 204, 235);
    rect(L, GROUND - 4, WW, 40);
    fill(BLK[0], BLK[1], BLK[2], 190);
    rect(L, GROUND - 6, WW, 4);
    rect(L, GROUND + 34, WW, 4);
    // 路面的方石
    fill(206, 190, 156, 140);
    for (let x = L; x < R; x += 48) rect(x, GROUND + 12, 34, 10);

    // —— 两只历法圆盘：被当成车轮用 ——
    calendarDisk(1236, GROUND - 34, 30);
    calendarDisk(1330, GROUND - 34, 30);

    // —— 骑手 ——
    if (hasRider) {
      // 表演：低头看自己那只当历法用的前轮——它每转一圈，长纪年就跳一格
      const A = perf(g.p, {
        pitch: [[0.34, 0], [0.44, 0.44], [0.70, 0.40], [0.80, 0]],
        reach: [[0.34, 0], [0.44, 10], [0.70, 10], [0.80, 0]],
      });
      push();
      translate(riderLocal, GROUND);
      drawRig(pose(t, { dist, headPitch: A.pitch, neckReach: A.reach }), {
        ink: BLK, body: [244, 234, 208], bodyDark: [214, 196, 162],
        bike: BLK, leg: RED, legFar: [150, 100, 78],
        beak: OCH, pouch: [210, 160, 74], lw: 3.4,
        chain: [120, 90, 66],
        wheelOpt: { tyre: BLK, rim: RED, spoke: BLK, spokeW: 1.6, hub: BLK, tyreW: 4.4 },
      });
      pop();
    }
  },

  /** 长纪年计数器：挂在画面右上，随轮子转动一格一格跳 */
  overlay(ctx, g) {
    const a = Math.max(0, Math.min(1, (g.p - 0.10) / 0.08)) * Math.max(0, Math.min(1, (0.66 - g.p) / 0.06));
    if (a <= 0.01) return;
    const n0 = Math.floor(g.dist / 58);
    const v = n0 % 20;
    const bx = 1288, by = 92, cell = 46;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = 'rgba(226, 212, 178, 0.86)';
    ctx.fillRect(bx - 10, by - 34, cell * 5 + 20, cell + 52);
    ctx.strokeStyle = 'rgba(120, 60, 40, 0.55)';
    ctx.lineWidth = 2;
    ctx.strokeRect(bx - 6, by - 30, cell * 5 + 12, cell + 44);
    for (let i = 0; i < 5; i++) {
      const x = bx + i * cell, y = by;
      ctx.strokeStyle = 'rgba(120, 60, 40, 0.45)';
      ctx.lineWidth = 1.4;
      ctx.strokeRect(x, y, cell - 8, cell - 8);
      // 玛雅数字：一点 = 1，一杠 = 5
      const n = i === 4 ? v % 20 : 0;
      ctx.fillStyle = 'rgba(168, 58, 38, 0.9)';
      const dots = n % 5, bars = Math.floor(n / 5);
      for (let d = 0; d < dots; d++) {
        ctx.beginPath();
        ctx.arc(x + 9 + (d % 3) * 10, y + 34 - Math.floor(d / 3) * 10, 3.4, 0, Math.PI * 2);
        ctx.fill();
      }
      for (let b = 0; b < bars; b++) {
        ctx.fillRect(x + 5, y + 30 - b * 7, 28, 4);
      }
      if (n === 0) {
        ctx.beginPath();
        ctx.ellipse(x + 19, y + 19, 8, 5, 0, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(168, 58, 38, 0.9)';
        ctx.stroke();
      }
    }
    ctx.fillStyle = 'rgba(120, 60, 40, 0.7)';
    ctx.font = '500 15px "Noto Sans SC", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('LONG COUNT', bx - 4, by + cell + 24);
    ctx.restore();
  },
};

// ---------- 符号 ----------

function starGlyph(x, y, r) {
  fill(OCH[0], OCH[1], OCH[2], 240);
  const pts = starPts(x, y, r, 4, 0.34);
  beginShape();
  for (const q of pts) vertex(q[0], q[1]);
  endShape(CLOSE);
}

function sunGlyph(x, y, r) {
  noStroke();
  fill(OCH[0], OCH[1], OCH[2]);
  circle(x, y, r * 2);
  fill(BLK[0], BLK[1], BLK[2]);
  circle(x, y, r * 0.8);
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + 0.4;
    triangle(
      x + Math.cos(a) * r * 1.1, y + Math.sin(a) * r * 1.1,
      x + Math.cos(a + 0.3) * r * 1.7, y + Math.sin(a + 0.3) * r * 1.7,
      x + Math.cos(a - 0.3) * r * 1.7, y + Math.sin(a - 0.3) * r * 1.7,
    );
  }
}

function venusGlyph(x, y, r) {
  noStroke();
  fill(RED[0], RED[1], RED[2]);
  circle(x, y, r * 1.6);
  fill(BLK[0], BLK[1], BLK[2]);
  circle(x - r * 0.3, y - r * 0.2, r * 0.5);
  stroke(OCH[0], OCH[1], OCH[2]);
  strokeWeight(3);
  for (let i = 0; i < 3; i++) line(x + r * 0.7, y - r * 0.6 + i * r * 0.6, x + r * 1.5, y - r * 0.6 + i * r * 0.6);
}

/** 方正的象形块：一个框，里面两三个笔画 */
function glyphBlock(x, y, s, seed) {
  const r = rng(seed * 13 + 1);
  push();
  translate(x, y);
  noFill();
  stroke(BLK[0], BLK[1], BLK[2], 235);
  strokeWeight(3);
  rect(0, 0, s, s * 0.86, 2);
  noStroke();
  const n = 2 + Math.floor(r() * 2);
  for (let i = 0; i < n; i++) {
    fill(i === 0 ? RED : BLK);
    const bx = 6 + r() * (s - 22);
    const by = 6 + r() * (s * 0.86 - 20);
    if (r() > 0.5) ellipse(bx + 6, by + 5, 10 + r() * 8, 8 + r() * 6);
    else rect(bx, by, 8 + r() * 8, 6 + r() * 6, 1);
  }
  // 一只眼
  fill(BLK[0], BLK[1], BLK[2]);
  ellipse(s * 0.5, s * 0.4, s * 0.36, s * 0.2);
  fill(BARK[0], BARK[1], BARK[2]);
  ellipse(s * 0.5, s * 0.4, s * 0.18, s * 0.1);
  fill(RED[0], RED[1], RED[2]);
  circle(s * 0.5, s * 0.4, s * 0.08);
  pop();
}

// ---------- 建筑 ----------

function pyramid(x, y) {
  push();
  translate(x, y);
  noStroke();
  // 五层台
  for (let i = 0; i < 5; i++) {
    const w = 300 - i * 46;
    const h = 46;
    fill(i % 2 ? [206, 188, 152] : [222, 206, 172]);
    rect(-w / 2, -46 - i * h, w, h);
    fill(BLK[0], BLK[1], BLK[2], 190);
    rect(-w / 2, -46 - i * h, w, 4);
    // 台侧的阴影
    fill(160, 138, 106, 120);
    rect(w / 2 - 26, -46 - i * h, 26, h);
  }
  // 台阶
  fill(198, 178, 142);
  beginShape();
  vertex(-22, -46);
  vertex(22, -46);
  vertex(14, -46 - 230);
  vertex(-14, -46 - 230);
  endShape(CLOSE);
  stroke(BLK[0], BLK[1], BLK[2], 210);
  strokeWeight(2);
  for (let i = 0; i <= 12; i++) line(-22 + i * 0.7, -46 - i * 19, 22 - i * 0.7, -46 - i * 19);
  // 顶上的神庙
  noStroke();
  fill([214, 196, 160][0], 196, 160);
  fill(214, 196, 160);
  rect(-58, -276, 116, 46);
  fill(BLK[0], BLK[1], BLK[2]);
  rect(-40, -262, 26, 32);
  // 屋顶梳（roof comb）
  fill(RED[0], RED[1], RED[2]);
  rect(-30, -322, 60, 48);
  fill(BLK[0], BLK[1], BLK[2]);
  rect(-22, -314, 10, 32);
  rect(-4, -314, 10, 32);
  rect(14, -314, 10, 32);
  pop();
}

function ceiba(x, y, s) {
  push();
  translate(x, y);
  scale(s);
  // 干与枝
  fillPoly([[-12, 0], [-8, -150], [8, -150], [12, 0]], [150, 116, 74], 250);
  strokePoly([[-12, 0], [-8, -150], [8, -150], [12, 0]], BLK, 2.4, 225);
  stroke(BLK[0], BLK[1], BLK[2], 235);
  strokeWeight(4);
  line(-4, -140, -56, -196);
  line(4, -144, 58, -200);
  line(0, -150, 2, -220);
  // 冠：一簇圆
  noStroke();
  const r = rng(21);
  for (let i = 0; i < 16; i++) {
    const a = r() * Math.PI * 2;
    const rr = r() * 62;
    fill(GRN[0], GRN[1], GRN[2], 210);
    circle(Math.cos(a) * rr, -222 + Math.sin(a) * rr * 0.6, 26 + r() * 22);
  }
  // 树上的鸟
  fill(BLK[0], BLK[1], BLK[2]);
  ellipse(30, -244, 16, 8);
  circle(38, -250, 7);
  pop();
}

// ---------- 人物 ----------

function scribe(x, y, s) {
  push();
  translate(x, y);
  scale(s);
  noStroke();
  // 盘腿
  fill(RED[0], RED[1], RED[2]);
  beginShape();
  vertex(-46, 0); vertex(46, 0); vertex(34, -44); vertex(-34, -44);
  endShape(CLOSE);
  // 上身
  fill([212, 176, 120][0], 176, 120);
  fill(212, 176, 120);
  rect(-24, -108, 48, 66, 4);
  // 头
  fill([206, 162, 110][0], 162, 110);
  fill(206, 162, 110);
  circle(0, -128, 40);
  // 头饰
  fill(GRN[0], GRN[1], GRN[2]);
  rect(-24, -146, 48, 12, 3);
  // 眼与嘴
  fill(BLK[0], BLK[1], BLK[2]);
  ellipse(-8, -130, 7, 4);
  ellipse(8, -130, 7, 4);
  // 手里的抄本
  stroke(BLK[0], BLK[1], BLK[2]);
  strokeWeight(2.4);
  fill(BARK[0], BARK[1], BARK[2]);
  rect(-64, -60, 60, 34, 2);
  strokeWeight(1.2);
  line(-58, -52, -10, -52);
  line(-58, -44, -22, -44);
  line(-58, -36, -30, -36);
  // 笔
  stroke(BLK[0], BLK[1], BLK[2]);
  strokeWeight(3);
  line(-14, -62, 8, -84);
  pop();
}

function priest(x, y, s, seed) {
  const r = rng(seed);
  push();
  translate(x, y);
  scale(s);
  noStroke();
  // 长袍
  fill([222, 206, 172][0], 206, 172);
  fill(222, 206, 172);
  beginShape();
  vertex(-18, -150); vertex(18, -150); vertex(26, 0); vertex(-26, 0);
  endShape(CLOSE);
  stroke(BLK[0], BLK[1], BLK[2], 220);
  strokeWeight(2.6);
  beginShape();
  vertex(-18, -150); vertex(18, -150); vertex(26, 0); vertex(-26, 0);
  endShape(CLOSE);
  // 腰带
  fill(RED[0], RED[1], RED[2]);
  rect(-20, -96, 40, 9);
  // 头
  noStroke();
  fill([206, 162, 110][0], 162, 110);
  fill(206, 162, 110);
  circle(0, -172, 36);
  // 头饰：羽毛
  fill(GRN[0], GRN[1], GRN[2]);
  triangle(-12, -188, 12, -188, 0, -216);
  fill(RED[0], RED[1], RED[2]);
  triangle(-20, -184, -6, -190, -14, -206);
  // 眼
  fill(BLK[0], BLK[1], BLK[2]);
  ellipse(-7, -174, 6, 4);
  ellipse(7, -174, 6, 4);
  // 手杖
  stroke(BLK[0], BLK[1], BLK[2]);
  strokeWeight(4);
  line(30 + r() * 3, -196, 30, -2);
  pop();
}

function serpent(x, y, s) {
  push();
  translate(x, y);
  scale(s);
  // 起伏的身体
  const pts = bez([-90, -10], [-30, -150], [60, -20], [140, -120], 14);
  const body = ribbon(pts, pts.map((_, i) => 26 - i * 0.7));
  noStroke();
  fill(GRN[0], GRN[1], GRN[2], 240);
  beginShape();
  for (const q of body) vertex(q[0], q[1]);
  endShape(CLOSE);
  stroke(BLK[0], BLK[1], BLK[2], 225);
  strokeWeight(2.4);
  beginShape();
  for (const q of body) vertex(q[0], q[1]);
  endShape(CLOSE);
  // 鳞：一排小方块
  noStroke();
  fill(BARK[0], BARK[1], BARK[2], 200);
  for (let i = 1; i < pts.length - 1; i += 2) {
    circle(pts[i][0], pts[i][1], 9);
  }
  // 头
  fill(GRN[0], GRN[1], GRN[2]);
  circle(140, -120, 40);
  fill(RED[0], RED[1], RED[2]);
  triangle(150, -140, 168, -160, 170, -134);
  fill(BLK[0], BLK[1], BLK[2]);
  ellipse(150, -124, 7, 5);
  // 羽
  for (let i = 0; i < 3; i++) {
    stroke(RED[0], RED[1], RED[2], 230);
    strokeWeight(3);
    line(-40 + i * 20, -80 - i * 6, -58 + i * 20, -112 - i * 6);
  }
  pop();
}

/** 历法圆盘：一圈点、一圈框、中间一张脸 */
function calendarDisk(x, y, r) {
  push();
  translate(x, y);
  noStroke();
  fill(BARK[0], BARK[1], BARK[2]);
  circle(0, 0, r * 2);
  stroke(BLK[0], BLK[1], BLK[2], 235);
  strokeWeight(2.6);
  noFill();
  circle(0, 0, r * 2);
  circle(0, 0, r * 1.5);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    line(Math.cos(a) * r * 0.75, Math.sin(a) * r * 0.75, Math.cos(a) * r, Math.sin(a) * r);
  }
  // 中间的脸
  noStroke();
  fill(RED[0], RED[1], RED[2]);
  circle(0, 0, r * 0.9);
  fill(BLK[0], BLK[1], BLK[2]);
  ellipse(-r * 0.18, -r * 0.08, r * 0.16, r * 0.1);
  ellipse(r * 0.18, -r * 0.08, r * 0.16, r * 0.1);
  pop();
}
