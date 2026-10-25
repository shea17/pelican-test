// 10 爪哇皮影（约 1800）
// 黑场、琥珀色的牛皮偶、灯焰的抖动。关节上看得见细杆。
import { GROUND } from '../main/camera.js';
import { pose, frameTubes } from '../rig/rig.js';
import { drawRigSilhouette } from '../rig/draw.js';
import { speckle, fillPoly, strokePoly, blob, arcPts } from '../kit/paint.js';
import { rng, noise1 } from '../kit/core.js';
import { perf } from '../kit/act.js';

const BLACK = [9, 8, 7];
const AMBER = [226, 176, 58];
const AMBER_D = [150, 88, 24];
const AMBER_L = [248, 214, 120];
const RED = [150, 60, 30];

export default {
  id: 'wayang',
  card: { x: 120, y: 906, color: 'rgba(238,190,70,', light: true },

  draw(g) {
    const { t, dist, span, hasRider, riderLocal } = g;
    rectMode(CORNER);
    const L = span[0], R = span[1], WW = R - L;

    // —— 幕 ——
    noStroke();
    fill(BLACK[0], BLACK[1], BLACK[2]);
    rect(L, 286, WW, 580);
    // 香蕉茎的竖纹
    push();
    stroke(60, 52, 36, 34);
    const r0 = rng(19);
    for (let i = 0; i < 200; i++) {
      const x = L + r0() * WW;
      strokeWeight(0.7 + r0() * 1.6);
      line(x, 286, x + (r0() - 0.5) * 6, 866);
    }
    pop();

    // —— 灯：一团会呼吸的暖光 ——
    const flick = 0.86 + noise1(t * 1.7, 3) * 0.14 + Math.sin(t * 9.1) * 0.02;
    push();
    noStroke();
    for (let i = 12; i > 0; i--) {
      fill(AMBER[0], AMBER[1], AMBER[2], 4.2 * flick);
      ellipse(940, 600, 300 + i * 120, 260 + i * 96);
    }
    pop();

    // —— 山形（gunungan）：开场的那棵树 ——
    gunungan(250, GROUND, 1.0);

    // —— 加麦兰：一排乐器，压在最下面 ——
    gamelan(L, R);

    // —— 达朗的手：只在右下露一点 ——
    dalang(1560, 862, 1.0);

    // —— 骑手：皮影偶 ——
    if (hasRider) {
      // 表演：操偶师一拉杆，这只偶的翅膀被猛地扯起来，头也跟着一甩
      const pull = perf(g.p, {
        w: [[0.40, 0], [0.455, 0.95], [0.52, 0.86], [0.62, 0.2], [0.72, 0]],
        h: [[0.44, 0], [0.47, -0.30], [0.53, -0.12], [0.62, 0]],
      });
      const pz = pose(t, { dist, wingRaise: pull.w, headPitch: pull.h });
      // 影子：比本体大一圈，偏左上
      push();
      translate(riderLocal - 14, GROUND + 8);
      drawRigSilhouette(pz, { fill: [0, 0, 0], dark: [0, 0, 0], eye: [0, 0, 0], lw: 3.4, alpha: 0.55, tyreW: 6, spokes: 0 });
      pop();

      push();
      translate(riderLocal, GROUND);
      // 关节杆：从轮心、车架、身体一直落到幕底
      push();
      stroke(AMBER_D[0], AMBER_D[1], AMBER_D[2], 150);
      strokeWeight(2.2);
      const B = pz.bike;
      line(B.rear[0], B.rear[1], B.rear[0] + 26, 170);
      line(B.front[0], B.front[1], B.front[0] - 18, 170);
      line(pz.bird.bodyC[0], pz.bird.bodyC[1], pz.bird.bodyC[0] - 40, 170);
      // 拉杆：一头拴在翅根，一头落到幕后。杆身被拉弯了。
      const sh = pz.bird.wingFan ? pz.bird.wingFan[0] : pz.bird.bodyC;
      const bend = perf(g.p, { v: [[0.40, 0], [0.455, 1], [0.72, 0]] }).v;
      stroke(AMBER_L[0], AMBER_L[1], AMBER_L[2], 220);
      strokeWeight(3.2);
      line(sh[0], sh[1], sh[0] - 30 - bend * 16, 170);
      // 关节销钉
      noStroke();
      fill(AMBER_L[0], AMBER_L[1], AMBER_L[2], 235);
      for (const j of [B.rear, B.front, B.crank.c, B.saddle, B.bar[0], pz.bird.bodyC, pz.bird.head.c]) {
        circle(j[0], j[1], 7.5);
      }
      pop();

      drawRigSilhouette(pz, {
        fill: AMBER, dark: AMBER_D, eye: AMBER_L, lw: 2.4,
        alpha: 0.97, tyreW: 3.6, spokes: 10,
      });
      // 皮质感的斑：几块更深的琥珀
      noStroke();
      fill(RED[0], RED[1], RED[2], 90);
      ellipse(-6, -150, 26, 18);
      ellipse(30, -60, 14, 10);
      pop();
    }
  },
};

// ---------- 山形 ----------

function gunungan(x, y, s) {
  push();
  translate(x, y);
  scale(s);
  // 外廓：一片叶子，下窄上宽，顶上收成尖
  const outline = [
    [0, 0], [-46, -60], [-58, -140], [-46, -210], [-24, -262], [0, -286],
    [24, -262], [46, -210], [58, -140], [46, -60],
  ];
  noStroke();
  fill(AMBER[0], AMBER[1], AMBER[2], 210);
  beginShape();
  for (const q of outline) vertex(q[0], q[1]);
  endShape(CLOSE);
  // 内部掏空（皮影是镂空的）
  fill(BLACK[0], BLACK[1], BLACK[2], 235);
  beginShape();
  for (const q of outline) vertex(q[0] * 0.8, q[1] * 0.88 - 10);
  endShape(CLOSE);
  // 中间的树：一条主干 + 卷曲的枝
  stroke(AMBER[0], AMBER[1], AMBER[2], 235);
  strokeWeight(4);
  line(0, -20, 0, -240);
  strokeWeight(2.6);
  for (let i = 0; i < 5; i++) {
    const yy = -50 - i * 40;
    const w = 34 - i * 4;
    beginShape();
    vertex(0, yy);
    vertex(-w, yy - 12);
    vertex(-w * 1.3, yy - 26);
    endShape();
    beginShape();
    vertex(0, yy - 10);
    vertex(w, yy - 22);
    vertex(w * 1.2, yy - 36);
    endShape();
  }
  // 顶上的尖
  noStroke();
  fill(AMBER[0], AMBER[1], AMBER[2], 240);
  triangle(-8, -286, 8, -286, 0, -310);
  // 底座
  fill(AMBER[0], AMBER[1], AMBER[2], 200);
  rect(-70, -14, 140, 14);
  pop();
}

// ---------- 加麦兰 ----------

function gamelan(L, R) {
  push();
  // 一排乐器剪影：吊锣、排琴
  for (let x = L; x < R + 40; x += 260) {
    const kind = Math.round((x - L) / 260) % 3;
    if (kind === 0) {
      // 吊锣
      stroke(AMBER_D[0], AMBER_D[1], AMBER_D[2], 170);
      strokeWeight(3);
      line(x + 70, 866, x + 70, 812);
      noStroke();
      fill(AMBER[0], AMBER[1], AMBER[2], 150);
      circle(x + 70, 806, 62);
      fill(0, 0, 0, 220);
      circle(x + 70, 806, 30);
    } else if (kind === 1) {
      // 排琴
      noStroke();
      fill(68, 52, 34, 230);
      rect(x + 10, 796, 120, 70);
      fill(AMBER[0], AMBER[1], AMBER[2], 140);
      for (let i = 0; i < 5; i++) rect(x + 20 + i * 21, 782, 15, 22, 4);
    } else {
      // 鼓
      noStroke();
      fill(AMBER_D[0], AMBER_D[1], AMBER_D[2], 150);
      rect(x + 30, 786, 90, 80, 8);
      fill(0, 0, 0, 200);
      ellipse(x + 75, 786, 90, 16);
    }
  }
  pop();
}

function dalang(x, y, s) {
  push();
  translate(x, y);
  scale(s);
  noStroke();
  fill(0, 0, 0, 210);
  // 一只手的剪影 + 几根杆
  beginShape();
  vertex(-40, 0);
  vertex(-30, -34);
  vertex(-8, -46);
  vertex(22, -40);
  vertex(46, -18);
  vertex(52, 0);
  endShape(CLOSE);
  stroke(AMBER_D[0], AMBER_D[1], AMBER_D[2], 150);
  strokeWeight(2);
  line(-10, -34, -40, -150);
  line(12, -38, 6, -170);
  line(34, -24, 54, -120);
  pop();
}
