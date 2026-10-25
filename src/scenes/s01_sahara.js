// 01 撒哈拉岩画（约前 4000，塔西里风格）
// 赭石画在岩壁上。整幅是一面静止的岩壁，骑手从画里穿过去。
import { GROUND } from '../main/camera.js';
import { rockTexture } from '../kit/texture.js';
import { pose, ribbon } from '../rig/rig.js';
import { drawRigSilhouette } from '../rig/draw.js';
import { rng } from '../kit/core.js';
import { perf } from '../kit/act.js';

const OCHRE = [138, 58, 30];
const OCHRE_D = [88, 32, 14];

function poly2(pts) {
  beginShape();
  for (const p of pts) vertex(p[0], p[1]);
  endShape(CLOSE);
}

export default {
  id: 'sahara',
  card: { x: 116, y: 322, color: 'rgba(246,220,186,', light: true, plate: true, plateColor: 'rgba(58,20,4,' },

  draw(g) {
    const { t, dist, span, hasRider, riderLocal } = g;
    noStroke();

    // 岩壁：横着铺满整段长卷
    for (let x0 = span[0]; x0 < span[1]; x0 += 1200) {
      image(rockTexture(), x0, 176, 1200, 744);
    }

    // 洞壁的暗角
    push();
    noStroke();
    fill(46, 20, 8, 30);
    rect(span[0], 176, span[1] - span[0], 96);
    fill(46, 20, 8, 22);
    rect(span[0], 824, span[1] - span[0], 96);
    pop();

    // 那条路：史前就画好的车辙
    tyreTrack(span, 700);

    // 远处的牧群（小、淡）
    ox(760, 660, 0.86, 0.34, 12);
    ox(880, 654, 0.8, 0.34, 44);
    person(830, 658, 0.72, 0.34, true);

    // 近处的围观者
    ox(470, 708, 1.42, 1, 3);
    ox(646, 702, 1.34, 1, 17);
    person(560, 706, 1.16, 1, false);
    ox(1010, 706, 1.38, 1, 71);
    person(1090, 708, 1.2, 1, true);
    ox(1268, 710, 1.28, 1, 91);

    // 梗：这一头底下被后人补了一对轮子
    cowWheels(1268, 712, 1.28);

    // 画师的签名
    handStencil(1600, 380, 1.25);

    // 骑手
    if (hasRider) {
      // 表演：洞顶那块岩檐压得很低，鹈鹕缩脖低头钻过去（喙几乎蹭到石面）
      const A = perf(g.p, {
        neckLift: [[0.34, 0], [0.5, -13], [0.64, -13], [0.78, 0]],
        headPitch: [[0.34, 0], [0.5, 0.3], [0.64, 0.27], [0.8, -0.06]],
        reach: [[0.34, 0], [0.5, 22], [0.64, 22], [0.78, 0]],
      });
      push();
      translate(riderLocal, GROUND);
      drawRigSilhouette(pose(t, { dist, neckLift: A.neckLift, headPitch: A.headPitch, neckReach: A.reach }), {
        fill: [104, 36, 14],
        dark: [72, 22, 8],
        eye: [212, 152, 104],
        lw: 2.6,
      });
      noStroke();
      fill(OCHRE[0], OCHRE[1], OCHRE[2], 26);
      ellipse(4, -112, 150, 130);
      pop();
    }

    // 洞顶的岩檐：画在骑手之后，所以它真的压在鸟头上——不低头就看不见
    ledge();

    // 岩檐上被蹭掉的一层：鸟过的时候落下细粉
    if (hasRider) {
      const k = perf(g.p, { v: [[0.5, 0], [0.56, 1], [0.72, 0]] }).v;
      if (k > 0.01) {
        const r = rng(91);
        push();
        noStroke();
        for (let i = 0; i < 14; i++) {
          const x = riderLocal + 30 + r() * 240;
          const y = 452 + (r() * 60 + (1 - k) * -40) + i * 2.5;
          fill(214, 168, 122, 40 * k * (1 - i / 14));
          circle(x, y, 1.6 + r() * 2.4);
        }
        pop();
      }
    }

    // 尘土：全画面唯一会动的东西
    dust(span, dist);
  },
};

/** 一对平行的车辙，胎纹一字排开 —— 史前就画好了 */
/** 洞顶的岩檐：一块压得很低的石檐，鸟必须缩脖才钻得过去 */
function ledge() {
  push();
  noStroke();
  const pts = [
    [800, 176], [1320, 176],
    [1322, 300], [1288, 356], [1246, 392], [1214, 430],
    [1180, 448], [1148, 436], [1120, 458], [1086, 446], [1052, 466],
    [1016, 450], [980, 460], [946, 440], [912, 424], [878, 386], [842, 340], [812, 288],
  ];
  // 岩体：比背景暗一档，带一点暖
  fill(96, 48, 26, 255);
  beginShape();
  for (const q of pts) vertex(q[0], q[1]);
  endShape(CLOSE);
  // 上缘与内部：更深的阴影
  fill(64, 28, 12, 210);
  beginShape();
  vertex(800, 176); vertex(1320, 176);
  vertex(1322, 292); vertex(1240, 300); vertex(1120, 316); vertex(1000, 300);
  vertex(880, 280); vertex(806, 268);
  endShape(CLOSE);
  // 下缘的字：被后人用赭石描过一遍的边
  noFill();
  stroke(184, 96, 52, 190);
  strokeWeight(4.5);
  beginShape();
  for (let i = 2; i < pts.length; i++) vertex(pts[i][0], pts[i][1]);
  endShape();
  // 檐下的手印：和岩壁上那些一样
  noStroke();
  for (const [hx, hy] of [[886, 396], [1212, 392]]) {
    fill(196, 116, 68, 46);
    ellipse(hx, hy, 40, 34);
    fill(196, 116, 68, 110);
    ellipse(hx, hy + 3, 24, 19);
    for (let i = 0; i < 4; i++) {
      const fx = hx - 11 + i * 7.4;
      ellipse(fx, hy - 12 - (i === 1 || i === 2 ? 3 : 0), 4.6, 15);
    }
    ellipse(hx - 17, hy - 2, 5, 12);
  }
  pop();
}

function tyreTrack(span, y) {
  push();
  noStroke();
  fill(OCHRE[0], OCHRE[1], OCHRE[2], 96);
  rect(span[0], y + 2, span[1] - span[0], 6);
  rect(span[0], y + 26, span[1] - span[0], 6);
  fill(OCHRE[0], OCHRE[1], OCHRE[2], 74);
  for (let x = span[0]; x < span[1]; x += 34) {
    rect(x, y + 11, 9, 5);
    rect(x + 15, y + 33, 9, 5);
  }
  pop();
}

function dust(span, dist) {
  push();
  noStroke();
  const w = span[1] - span[0] + 400;
  const r = rng(7);
  for (let i = 0; i < 16; i++) {
    const base = r() * w;
    const x = span[0] - 200 + (((base - dist * 1.9) % w) + w) % w;
    fill(206, 158, 112, 10 + r() * 12);
    circle(x, GROUND - r() * 22, 2 + r() * 5);
  }
  pop();
}

/** 塔西里风格的牛：厚身、垂腹、竖琴形大角 */
function ox(x, y, s, alpha, seed) {
  const r = rng(seed);
  push();
  translate(x, y);
  scale(s);
  noStroke();

  fill(OCHRE[0], OCHRE[1], OCHRE[2], 112 * alpha);
  beginShape();
  const bodyPts = [
    [-64, -84], [-46, -104], [-6, -110], [34, -104], [58, -90],
    [66, -62], [58, -40], [34, -30], [-6, -28], [-46, -34], [-64, -54],
  ];
  for (const q of bodyPts) vertex(q[0], q[1]);
  endShape(CLOSE);

  stroke(OCHRE[0], OCHRE[1], OCHRE[2], 140 * alpha);
  strokeWeight(7);
  const legs = [[-46, -36], [-20, -32], [30, -34], [52, -40]];
  for (let i = 0; i < legs.length; i++) {
    const [lx, ly] = legs[i];
    line(lx, ly, lx + (i % 2 ? 3 : -3), -2);
  }
  strokeWeight(3.5);
  line(-64, -60, -76, -24);

  noStroke();
  fill(OCHRE[0], OCHRE[1], OCHRE[2], 150 * alpha);
  push();
  translate(60, -84);
  rotate(-0.18);
  ellipse(0, 0, 40, 26);
  pop();

  noStroke();
  fill(OCHRE_D[0], OCHRE_D[1], OCHRE_D[2], 200 * alpha);
  poly2(ribbon([[58, -96], [55, -116], [46, -132], [34, -142]], [9, 7.5, 5.5, 2.5]));
  poly2(ribbon([[74, -96], [82, -114], [92, -128], [102, -136]], [9, 7.5, 5.5, 2.5]));
  pop();
}

/** 岩画里的小人：脊柱、两条腿、一杆标枪 */
/** 梗：牛底下被补了一对轮子 —— 明显是看过鹈鹕之后加的 */
function cowWheels(x, y, s) {
  push();
  translate(x, y);
  scale(s);
  noFill();
  // 更浅的颜料，像后来的另一只手补的
  stroke(226, 190, 148, 210);
  strokeWeight(4.4);
  circle(-58, -8, 44);
  circle(54, -8, 44);
  strokeWeight(3);
  line(-58, -8, 0, -16);
  line(54, -8, 0, -16);
  line(0, -16, 0, -34);
  pop();
}

function person(x, y, s, alpha, staffUp) {
  push();
  translate(x, y);
  scale(s);
  noFill();
  stroke(OCHRE_D[0], OCHRE_D[1], OCHRE_D[2], 168 * alpha);
  strokeWeight(4.2);
  line(0, -46, 0, -18);
  line(0, -18, -9, 0);
  line(0, -18, 9, 0);
  line(0, -42, -12, -30);
  line(0, -42, 12, -30);
  noStroke();
  fill(OCHRE_D[0], OCHRE_D[1], OCHRE_D[2], 200 * alpha);
  circle(0, -52, 11);
  stroke(OCHRE_D[0], OCHRE_D[1], OCHRE_D[2], 180 * alpha);
  strokeWeight(3.4);
  if (staffUp) line(14, -30, 26, -76);
  else line(-14, -26, -24, -62);
  pop();
}

/** 负形手印：先喷一层暗赭，再用岩色把手"抠"出来 */
function handStencil(x, y, s) {
  push();
  translate(x, y);
  scale(s);
  noStroke();
  for (let i = 7; i > 0; i--) {
    fill(92, 34, 14, 9);
    ellipse(0, 0, 104 + i * 15, 116 + i * 15);
  }
  fill(92, 34, 14, 46);
  ellipse(0, 0, 108, 122);
  // 手形（负形）：用偏亮的岩色盖回去
  fill(206, 152, 106, 235);
  ellipse(0, 10, 42, 44);
  const fingers = [[-19, -12, -0.5], [-7, -22, -0.2], [4, -24, 0.05], [14, -19, 0.3], [-25, 3, -0.95]];
  for (const [fx, fy, a] of fingers) {
    push();
    translate(fx, fy);
    rotate(a);
    ellipse(0, -11, 11, 31);
    pop();
  }
  pop();
}
