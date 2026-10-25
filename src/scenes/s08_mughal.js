// 08 莫卧儿细密画（约 1600）
// 高视平线、平面化、极繁的花园。整幅画被一圈装饰边框框住——而鹈鹕骑出了边框。
import { GROUND } from '../main/camera.js';
import { pose } from '../rig/rig.js';
import { drawRig } from '../rig/draw.js';
import { vGrad, speckle, fillPoly, strokePoly } from '../kit/paint.js';
import { rng, bez } from '../kit/core.js';
import { perf } from '../kit/act.js';

const CREAM = [242, 230, 200];
const GOLD = [200, 161, 60];
const GOLD_D = [150, 112, 34];
const GRN = [47, 79, 58];
const GRN_L = [92, 122, 76];
const RED = [156, 59, 37];
const BLUE = [63, 107, 138];
const INK = [54, 44, 30];

const FRAME = { x: 40, y: 336, w: 1720, h: 330 };

export default {
  id: 'mughal',
  card: { x: 112, y: 372, color: 'rgba(38,54,40,', light: false },

  draw(g) {
    const { t, dist, span, hasRider, riderLocal } = g;
    rectMode(CORNER);
    const L = span[0], R = span[1], WW = R - L;

    // —— 底：奶油色纸 ——
    noStroke();
    fill(CREAM[0], CREAM[1], CREAM[2]);
    rect(L, 286, WW, 580);
    speckle(L, 286, WW, 580, 700, [206, 186, 146], 20, 4, 0.6, 2.2);

    // —— 画心：金天与花园 ——
    // 金天（只在画框里）
    clipRect(FRAME, () => {
      vGrad(FRAME.x, FRAME.y, FRAME.w, 150, [236, 196, 96], [246, 220, 150], 22);
      // 金箔的斑点
      speckle(FRAME.x, FRAME.y, FRAME.w, 150, 260, [255, 232, 168], 40, 6, 0.6, 1.8);

      // 远山：一条淡紫的线
      noFill();
      stroke(150, 120, 120, 90);
      strokeWeight(2);
      beginShape();
      for (let x = FRAME.x; x <= FRAME.x + FRAME.w; x += 40) {
        vertex(x, 470 - Math.sin(x * 0.006) * 22 - Math.sin(x * 0.017) * 8);
      }
      endShape();

      // 花园地面
      noStroke();
      fill(214, 206, 168);
      rect(FRAME.x, 494, FRAME.w, FRAME.h - 158);

      // 水渠：从中间往远处收
      fill(BLUE[0], BLUE[1], BLUE[2], 150);
      beginShape();
      vertex(880, 500);
      vertex(940, 500);
      vertex(1040, 650);
      vertex(780, 650);
      endShape(CLOSE);
      noFill();
      stroke(236, 236, 220, 190);
      strokeWeight(2);
      for (let i = 0; i < 5; i++) {
        line(896 + i * 10, 506 + i * 26, 812 + i * 44, 506 + i * 26);
      }

      // 花床：一行一行的色块与小花
      flowerBed(FRAME.x + 40, 520, 300, 24, RED, 3);
      flowerBed(FRAME.x + 380, 520, 240, 24, GOLD, 7);
      flowerBed(FRAME.x + 1080, 520, 300, 24, RED, 11);
      flowerBed(FRAME.x + 1400, 560, 240, 22, GOLD, 13);

      // 柏树
      cypress(FRAME.x + 120, 560, 1.0);
      cypress(FRAME.x + 300, 556, 0.86);
      cypress(FRAME.x + 1500, 560, 1.05);
      cypress(FRAME.x + 1620, 556, 0.9);

      // 白陵墓
      mausoleum(1330, 560, 1.0);

      // 孔雀
      peacock(600, 610, 1.0);

      // 树上的鸟
      birds(FRAME.x + 980, 430, 1.0);
    });

    // —— 画框 ——
    border(FRAME);

    // —— 框外：地面与路 ——
    noStroke();
    fill(226, 216, 186);
    rect(L, FRAME.y + FRAME.h, WW, GROUND - (FRAME.y + FRAME.h) + 8);
    fill(214, 202, 170);
    rect(L, GROUND - 4, WW, 12);

    // —— 骑手：骑在画框的下沿上 ——
    if (hasRider) {
      // 表演：低头看那条被自己压弯的金边
      const A = perf(g.p, {
        pitch: [[0.34, 0], [0.44, 0.30], [0.66, 0.28], [0.78, 0]],
      });
      push();
      translate(riderLocal, GROUND);
      drawRig(pose(t, { dist, headPitch: A.pitch }), {
        ink: INK, body: [250, 244, 228], bodyDark: [220, 206, 176],
        bike: [86, 62, 34], leg: [150, 110, 66], legFar: [186, 156, 108],
        beak: [214, 154, 54], pouch: [226, 178, 86], lw: 2.2,
        chain: [150, 120, 70],
        wheelOpt: { tyre: [86, 62, 34], rim: GOLD, spoke: [140, 104, 50], spokeW: 0.9, hub: GOLD_D, tyreW: 3.0 },
      });
      pop();
    }

    // 画框的下沿：被两只轮子压出一道弧。金线是软的。
    if (hasRider) {
      push();
      noFill();
      const yb = FRAME.y + FRAME.h;
      for (let pass = 0; pass < 2; pass++) {
        stroke(pass ? [214, 178, 92, 235] : [146, 116, 58, 235]);
        strokeWeight(pass ? 2.0 : 4.6);
        beginShape();
        for (let x = FRAME.x + 6; x <= FRAME.x + FRAME.w - 6; x += 8) {
          const d1 = (x - (riderLocal - 66)) / 74;
          const d2 = (x - (riderLocal + 66)) / 74;
          const dip = 14 * Math.exp(-d1 * d1) + 14 * Math.exp(-d2 * d2);
          vertex(x, yb + dip);
        }
        endShape();
      }
      pop();
    }
  },
};

// ---------- 裁剪 ----------

/** 用一个矩形裁剪内部的绘制。WEBGL 没有 clip，用覆盖层把外面盖掉。 */
function clipRect(r, fn) {
  fn();
  // 遮住画心以外：四条带
  noStroke();
  fill(CREAM[0], CREAM[1], CREAM[2]);
  rect(-4000, -4000, 8000, 4000 + r.y);
  rect(-4000, r.y + r.h, 8000, 4000);
  rect(-4000, r.y, 4000 + r.x, r.h);
  rect(r.x + r.w, r.y, 4000, r.h);
}

// ---------- 画框 ----------

function border(f) {
  const w = 24;
  // 外框
  noFill();
  stroke(GOLD_D[0], GOLD_D[1], GOLD_D[2], 255);
  strokeWeight(3);
  rect(f.x - 4, f.y - 4, f.w + 8, f.h + 8);
  // 金地
  noStroke();
  fill(GOLD[0], GOLD[1], GOLD[2], 255);
  rect(f.x, f.y, f.w, w);
  rect(f.x, f.y + f.h - w, f.w, w);
  rect(f.x, f.y, w, f.h);
  rect(f.x + f.w - w, f.y, w, f.h);
  // 金地里的缠枝小花
  for (let x = f.x + 14; x < f.x + f.w; x += 34) {
    leafDot(x, f.y + w / 2);
    leafDot(x, f.y + f.h - w / 2);
  }
  for (let y = f.y + 14; y < f.y + f.h; y += 34) {
    leafDot(f.x + w / 2, y);
    leafDot(f.x + f.w - w / 2, y);
  }
  // 内框线
  noFill();
  stroke(BLUE[0], BLUE[1], BLUE[2], 210);
  strokeWeight(2);
  rect(f.x + w + 4, f.y + w + 4, f.w - w * 2 - 8, f.h - w * 2 - 8);
}

function leafDot(x, y) {
  noStroke();
  fill(GRN[0], GRN[1], GRN[2], 235);
  ellipse(x, y, 12, 5);
  fill(RED[0], RED[1], RED[2], 235);
  circle(x, y, 4.2);
}

// ---------- 花园 ----------

function flowerBed(x, y, w, h, col, seed) {
  const r = rng(seed);
  noStroke();
  fill(GRN[0], GRN[1], GRN[2], 160);
  rect(x, y, w, h);
  for (let i = 0; i < w / 14; i++) {
    fill(col[0], col[1], col[2], 190 + r() * 60);
    circle(x + 7 + i * 14 + (r() - 0.5) * 6, y + h * 0.5 + (r() - 0.5) * 8, 5 + r() * 4);
  }
}

function cypress(x, y, s) {
  push();
  translate(x, y);
  scale(s);
  noStroke();
  fill(GRN[0], GRN[1], GRN[2], 245);
  beginShape();
  vertex(0, 0);
  vertex(-14, -30);
  vertex(-9, -80);
  vertex(-4, -128);
  vertex(0, -142);
  vertex(5, -126);
  vertex(9, -78);
  vertex(14, -28);
  endShape(CLOSE);
  // 叶的横向短笔
  stroke(GRN_L[0], GRN_L[1], GRN_L[2], 180);
  strokeWeight(1.2);
  for (let i = 0; i < 14; i++) {
    const yy = -12 - i * 9;
    const w = 13 * (1 - Math.abs(i - 7) / 9);
    line(-w, yy, w, yy - 1);
  }
  pop();
}

function mausoleum(x, y, s) {
  push();
  translate(x, y);
  scale(s);
  noStroke();
  // 台基
  fill(236, 230, 212);
  rect(-90, -30, 180, 30);
  rect(-70, -62, 140, 32);
  // 主体
  fill(244, 238, 222);
  rect(-46, -120, 92, 58);
  // 大穹顶
  fill(248, 244, 232);
  arc(0, -120, 92, 92, Math.PI, 0, CHORD);
  // 顶上的尖
  triangle(-5, -166, 5, -166, 0, -182);
  // 四角的小亭
  for (const ox of [-78, 78]) {
    rect(ox - 9, -86, 18, 24);
    fill(248, 244, 232);
    arc(ox, -86, 20, 20, Math.PI, 0, CHORD);
    fill(244, 238, 222);
  }
  // 门洞
  fill(GRN[0], GRN[1], GRN[2], 220);
  arc(0, -62, 26, 34, Math.PI, 0, CHORD);
  rect(-13, -62, 26, 32);
  pop();
}

function peacock(x, y, s) {
  push();
  translate(x, y);
  scale(s);
  noStroke();
  // 尾：一圈眼斑
  for (let i = 0; i < 7; i++) {
    const a = -2.5 + i * 0.26;
    const ex = Math.cos(a) * 54;
    const ey = -30 + Math.sin(a) * 40;
    fill(BLUE[0], BLUE[1], BLUE[2], 200);
    ellipse(ex, ey, 16, 22);
    fill(GOLD[0], GOLD[1], GOLD[2], 230);
    circle(ex, ey, 8);
    fill(GRN[0], GRN[1], GRN[2], 240);
    circle(ex, ey, 4);
  }
  // 身
  fill(BLUE[0], BLUE[1], BLUE[2], 245);
  ellipse(0, -26, 26, 34);
  circle(6, -50, 14);
  fill(RED[0], RED[1], RED[2]);
  triangle(10, -56, 16, -66, 18, -54);
  fill(GOLD[0], GOLD[1], GOLD[2]);
  triangle(12, -48, 26, -46, 12, -43);
  stroke(BLUE[0], BLUE[1], BLUE[2], 240);
  strokeWeight(2);
  line(-4, -12, -6, 0);
  line(4, -12, 6, 0);
  pop();
}

function birds(x, y, s) {
  push();
  translate(x, y);
  scale(s);
  noFill();
  stroke(INK[0], INK[1], INK[2], 160);
  strokeWeight(1.6);
  for (const b of [[0, 0], [30, -14], [-26, -10]]) {
    const bx = b[0], by = b[1];
    beginShape();
    for (const q of bez([bx - 9, by], [bx - 4, by - 7], [bx, by], [bx + 4, by - 7], 4)) vertex(q[0], q[1]);
    endShape();
    beginShape();
    for (const q of bez([bx, by], [bx + 4, by - 7], [bx + 9, by], [bx + 2, by + 1], 4)) vertex(q[0], q[1]);
    endShape();
  }
  pop();
}
