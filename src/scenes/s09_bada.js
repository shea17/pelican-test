// 09 八大山人写意（约 1690）
// 极简：一只鸟、一枝荷、一片空白。靠墨的渗化而不是轮廓。
import { GROUND } from '../main/camera.js';
import { pose } from '../rig/rig.js';
import { drawRigSilhouette } from '../rig/draw.js';
import { speckle, fillPoly, blob } from '../kit/paint.js';
import { rng, noise1, bez } from '../kit/core.js';
import { perf } from '../kit/act.js';

const PAPER = [240, 236, 224];
const INK = [30, 28, 26];

export default {
  id: 'bada',
  card: { x: 128, y: 300, color: 'rgba(32,30,28,', light: false },

  draw(g) {
    const { t, dist, span, hasRider, riderLocal } = g;
    rectMode(CORNER);
    const L = span[0], R = span[1], WW = R - L;

    // —— 纸 ——
    noStroke();
    fill(PAPER[0], PAPER[1], PAPER[2]);
    rect(L, 286, WW, 580);
    speckle(L, 286, WW, 580, 700, [186, 176, 154], 16, 3, 0.6, 2.4);
    speckle(L, 286, WW, 580, 260, [120, 110, 90], 12, 8, 0.5, 1.6);

    // —— 水：几笔极淡的横墨，只在左下 ——
    push();
    noStroke();
    for (let i = 0; i < 5; i++) {
      fill(INK[0], INK[1], INK[2], 7 + i * 2);
      const y = 706 + i * 15;
      const pts = blob(span[0] + 210, y, 260 - i * 26, 8 + i * 2, 18, 30 + i, 0.22);
      beginShape();
      for (const q of pts) vertex(q[0], q[1]);
      endShape(CLOSE);
    }
    pop();

    // —— 塘埂：一条干笔，中间有断 ——
    dryLine(span[0], span[1], GROUND, 3.2);

    // —— 荷：两片叶、一朵花 ——
    lotusLeaf(1330, 690, 1.25, 5);
    lotusLeaf(1560, 706, 0.9, 17);
    lotusFlower(1450, 690, 1.0, 9);

    // —— 鸟 ——
    // 表演：一只苍蝇落在喙尖上。鹈鹕猛地一啄——没中。
    const A = perf(g.p, {
      gape: [[0.56, 0], [0.605, 0.9], [0.63, 1], [0.655, 0]],
      pitch: [[0.56, -0.04], [0.605, 0.13], [0.64, 0.05], [0.72, 0]],
      wing: [[0.60, 0], [0.63, 0.45], [0.70, 0.1], [0.78, 0]],
    });
    const pz = pose(t, { dist, gape: A.gape, headPitch: A.pitch, wingRaise: A.wing });
    if (hasRider) {
      push();
      translate(riderLocal, GROUND);
      // 渗化：三层偏移的淡墨
      for (let i = 0; i < 3; i++) {
        push();
        translate(-3 + i * 3, -2 + i * 2);
        drawRigSilhouette(pz, {
          fill: INK, dark: INK, eye: PAPER, lw: 2.6,
          alpha: 0.09, tyreW: 4.4, spokes: 0,
        });
        pop();
      }
      drawRigSilhouette(pz, {
        fill: [46, 44, 42], dark: [24, 22, 20], eye: PAPER, lw: 2.4,
        alpha: 0.95, tyreW: 5.2, spokes: 0,
      });
      // 白眼：八大的招牌
      const e = pz.bird.eye;
      noStroke();
      fill(PAPER[0], PAPER[1], PAPER[2], 250);
      circle(e[0] + 1, e[1] - 1, 15);
      fill(INK[0], INK[1], INK[2]);
      circle(e[0] + 4, e[1] - 6, 6.5);
      // 上眼睑：一条压下来的墨
      stroke(INK[0], INK[1], INK[2], 240);
      strokeWeight(2.6);
      noFill();
      beginShape();
      vertex(e[0] - 9, e[1] - 6);
      vertex(e[0] + 1, e[1] - 11);
      vertex(e[0] + 9, e[1] - 7);
      endShape();
      // 喙上的一道焦墨
      stroke(INK[0], INK[1], INK[2], 225);
      strokeWeight(3.2);
      line(pz.bird.head.c[0] + 18, pz.bird.head.c[1] - 2, pz.bird.head.c[0] + 62, pz.bird.head.c[1] + 4);
      pop();
    }

    // —— 一只苍蝇：落在喙尖上，然后逃掉 ——
    if (hasRider) {
      const tip = pz.bird.beakTip;
      const k = perf(g.p, { v: [[0.30, 0], [0.52, 1]] }).v;   // 靠近
      const g2 = perf(g.p, { v: [[0.64, 0], [0.70, 1]] }).v;  // 逃
      const sx = tip[0] + 5 + (1 - k) * 300 + g2 * 420;
      const sy = tip[1] - 3 - Math.sin(k * Math.PI) * 46 - g2 * 180;
      fly(riderLocal + sx, GROUND + sy, 1.3);
    }

    // —— 淡淡的边框：裱画的绢边 ——
    noFill();
    stroke(120, 108, 88, 26);
    strokeWeight(2);
    rect(L + 40, 316, WW - 80, 520);
  },
};

// ---------- 笔 ----------

/** 一条干笔：粗细不均、有断处、起收都是尖的 */
function dryLine(x0, x1, y, w) {
  const r = rng(31);
  let x = x0;
  while (x < x1) {
    const len = 40 + r() * 150;
    if (r() > 0.16) {
      const pts = bez([x, y], [x + len * 0.3, y - 2 + r() * 3], [x + len * 0.7, y + 2 - r() * 3], [x + len, y], 6);
      for (let i = 0; i < pts.length - 1; i++) {
        const k = i / (pts.length - 1);
        stroke(INK[0], INK[1], INK[2], 150 + r() * 90);
        strokeWeight(w * (0.35 + Math.sin(k * Math.PI) * 0.9));
        line(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1]);
      }
    }
    x += len + 4 + r() * 14;
  }
}

function lotusLeaf(x, y, s, seed) {
  push();
  translate(x, y);
  scale(s);
  // 叶：一团湿墨，边缘化开
  noStroke();
  for (let i = 5; i >= 0; i--) {
    fill(INK[0], INK[1], INK[2], 12);
    const pts = blob(0, -46, 96 + i * 7, 46 + i * 4, 22, seed, 0.16);
    beginShape();
    for (const q of pts) vertex(q[0], q[1]);
    endShape(CLOSE);
  }
  fill(INK[0], INK[1], INK[2], 78);
  const pts = blob(0, -46, 96, 46, 22, seed, 0.14);
  beginShape();
  for (const q of pts) vertex(q[0], q[1]);
  endShape(CLOSE);
  // 叶脉
  stroke(INK[0], INK[1], INK[2], 90);
  strokeWeight(1.6);
  for (let i = 0; i < 7; i++) {
    const a = -0.2 + (i / 6) * 2.4;
    line(0, -40, Math.cos(a) * 88, -46 + Math.sin(a) * 40);
  }
  // 梗
  stroke(INK[0], INK[1], INK[2], 170);
  strokeWeight(3.2);
  const stem = bez([0, -40], [-10, 0], [-22, 24], [-30, 44], 6);
  for (let i = 0; i < stem.length - 1; i++) {
    strokeWeight(3.4 - i * 0.3);
    line(stem[i][0], stem[i][1], stem[i + 1][0], stem[i + 1][1]);
  }
  pop();
}

function lotusFlower(x, y, s, seed) {
  push();
  translate(x, y);
  scale(s);
  // 梗
  stroke(INK[0], INK[1], INK[2], 190);
  strokeWeight(2.8);
  const stem = bez([0, 0], [6, -50], [-4, -100], [2, -150], 8);
  for (let i = 0; i < stem.length - 1; i++) {
    strokeWeight(2.8 - i * 0.18);
    line(stem[i][0], stem[i][1], stem[i + 1][0], stem[i + 1][1]);
  }
  // 花瓣：五笔
  noFill();
  for (let i = 0; i < 5; i++) {
    const a = -1.9 + i * 0.62;
    stroke(INK[0], INK[1], INK[2], 120 + i * 12);
    strokeWeight(2.0);
    beginShape();
    vertex(2, -150);
    vertex(2 + Math.cos(a) * 22, -150 + Math.sin(a) * 20);
    vertex(2 + Math.cos(a) * 14, -150 + Math.sin(a) * 44);
    endShape();
  }
  // 蕊
  noStroke();
  fill(INK[0], INK[1], INK[2], 150);
  circle(2, -160, 7);
  pop();
}

function fly(x, y, s) {
  push();
  translate(x, y + Math.sin(x * 0.1) * 2);
  scale(s);
  noStroke();
  fill(INK[0], INK[1], INK[2], 210);
  ellipse(0, 0, 7, 5);
  circle(-4, -2, 4);
  // 翅
  noFill();
  stroke(INK[0], INK[1], INK[2], 150);
  strokeWeight(1);
  ellipse(-1, -6, 9, 4);
  ellipse(4, -6, 8, 4);
  pop();
}
