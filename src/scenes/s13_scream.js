// 13 呐喊（1893）
// 扭动的等高线：天空是一圈一圈的橙红，桥是一条压下来的对角线。
import { GROUND } from '../main/camera.js';
import { pose } from '../rig/rig.js';
import { drawRig } from '../rig/draw.js';
import { speckle, fillPoly, strokePoly } from '../kit/paint.js';
import { rng, bez } from '../kit/core.js';
import { perf } from '../kit/act.js';

const SKY_TOP = [122, 44, 40];
const SKY_MID = [198, 104, 46];
const SKY_LOW = [224, 168, 62];
const WATER = [38, 46, 72];
const LAND = [46, 40, 48];
const BRIDGE = [110, 78, 58];
const DARK = [38, 30, 42];

export default {
  id: 'scream',
  card: { x: 128, y: 906, color: 'rgba(240,206,140,', light: true },

  draw(g) {
    const { t, dist, span, hasRider, riderLocal } = g;
    rectMode(CORNER);
    const L = span[0], R = span[1], WW = R - L;

    // —— 天空：先铺一层底色，再一条一条压上去 ——
    noStroke();
    for (let i = 0; i < 26; i++) {
      const k = i / 25;
      const col = k < 0.5 ? mix(SKY_TOP, SKY_MID, k * 2) : mix(SKY_MID, SKY_LOW, (k - 0.5) * 2);
      fill(col[0], col[1], col[2]);
      rect(L, 288 + k * 272, WW, 14);
    }
    const r = rng(13);
    for (let i = 0; i < 30; i++) {
      const k = i / 29;
      const y0 = 294 + k * 268;
      const col = k < 0.5 ? mix(SKY_TOP, SKY_MID, k * 2) : mix(SKY_MID, SKY_LOW, (k - 0.5) * 2);
      const lift = 0.86 + r() * 0.3;
      noFill();
      stroke(Math.min(255, col[0] * lift), Math.min(255, col[1] * lift), Math.min(255, col[2] * lift), 255);
      strokeWeight(7);
      beginShape();
      for (let x = L - 20; x <= R + 20; x += 24) {
        const amp = 8 + 22 * Math.pow(1 - k, 1.2);
        const wave = Math.sin(x * 0.0042 + i * 0.42) * amp + Math.sin(x * 0.011 + i * 1.7) * amp * 0.35;
        vertex(x, y0 + wave);
      }
      endShape();
    }
    // 几笔更亮的流线
    for (let i = 0; i < 10; i++) {
      const y0 = 330 + r() * 200;
      stroke(248, 214, 132, 90);
      strokeWeight(2.4);
      beginShape();
      for (let x = L; x <= R; x += 30) {
        vertex(x, y0 + Math.sin(x * 0.0055 + i) * 20);
      }
      endShape();
    }

    // —— 水与地 ——
    noStroke();
    fill(26, 32, 52);
    rect(L, 540, WW, GROUND - 540);
    fill(WATER[0], WATER[1], WATER[2]);
    rect(L, 546, WW, 70);
    for (let i = 0; i < 6; i++) {
      stroke(72, 84, 112, 150);
      strokeWeight(2);
      line(L, 556 + i * 10, R, 556 + i * 10);
    }
    // 对岸
    noStroke();
    fill(LAND[0], LAND[1], LAND[2]);
    beginShape();
    vertex(L, 560);
    for (let x = L; x <= R; x += 60) vertex(x, 556 - Math.sin(x * 0.004) * 14);
    vertex(R, 620);
    vertex(L, 620);
    endShape(CLOSE);

    // —— 桥面：骑手就骑在桥板上 ——
    fill(122, 88, 62);
    rect(L, GROUND - 6, WW, 58);
    fill(88, 62, 44);
    rect(L, GROUND + 46, WW, 16);
    fill(48, 36, 30, 200);
    rect(L, GROUND + 62, WW, 60);
    // 桥板的缝
    stroke(66, 46, 34, 180);
    strokeWeight(1.6);
    for (let x = L; x < R; x += 48) line(x, GROUND + 2, x - 10, GROUND + 48);

    // —— 栏杆：一条斜压过来的木栏 ——
    push();
    for (let i = 0; i < 16; i++) {
      const px = 180 + i * 112;
      const top = 650 - i * 4.4;
      noStroke();
      fill(126, 92, 66);
      rect(px, top, 11, GROUND - top);
      fill(92, 66, 46);
      rect(px - 3, top - 4, 17, 9);
    }
    noFill();
    stroke(150, 114, 82);
    strokeWeight(15);
    line(150, 650, 1830, 578);
    stroke(104, 76, 54);
    strokeWeight(4);
    line(150, 644, 1830, 572);
    pop();

    // —— 远处两个捂耳朵的人 ——
    screamer(1256, GROUND - 4, 1.0, 3);
    screamer(1348, GROUND - 2, 0.94, 7);

    // —— 骑手：张着嘴喊的那一个就是它 ——
    if (hasRider) {
      // 表演：整幅画里唯一在喊的那个，就是它。嘴张到最大，声音把空气推歪。
      const A = perf(g.p, {
        gape: [[0.26, 0], [0.44, 1], [0.74, 1], [0.86, 0]],
        pitch: [[0.26, 0], [0.44, -0.26], [0.74, -0.22], [0.86, 0]],
        lift: [[0.26, 0], [0.44, 6], [0.74, 6], [0.86, 0]],
      });
      const pz = pose(t, { dist, gape: A.gape, headPitch: A.pitch, neckLift: A.lift });
      push();
      translate(riderLocal, GROUND);
      drawRig(pz, {
        ink: [46, 34, 44], body: [242, 228, 200], bodyDark: [198, 178, 158],
        bike: [58, 44, 50], leg: [140, 96, 62], legFar: [176, 148, 120],
        beak: [206, 132, 54], pouch: [196, 110, 48], lw: 2.6,
        chain: [120, 90, 74],
        wheelOpt: { tyre: [58, 44, 50], rim: [206, 170, 110], spoke: [120, 96, 76], spokeW: 1.0, hub: [58, 44, 50], tyreW: 3.2 },
      });
      const h = pz.bird.head.c;
      // 喊出来的声波
      push();
      noFill();
      for (let i = 0; i < 4; i++) {
        stroke(240, 210, 150, 120 - i * 22);
        strokeWeight(2.4);
        beginShape();
        for (let a = -0.6; a <= 0.6; a += 0.1) {
          const rr = 96 + i * 22 + Math.sin(a * 9 + t * 3) * 5;
          vertex(h[0] + 54 + Math.cos(a) * rr, h[1] + 8 + Math.sin(a) * rr * 0.7);
        }
        endShape();
      }
      pop();
      pop();
    }

    // —— 边角压暗 ——
    noStroke();
    fill(28, 20, 26, 90);
    rect(L, 286, WW, 14);
  },
};

function mix(a, b, k) {
  return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
}

/** 捂耳朵的人：一个长条身体、一个苍白的椭圆脸、两只手 */
function screamer(x, y, s, seed) {
  push();
  translate(x, y);
  scale(s);
  noStroke();
  fill(DARK[0], DARK[1], DARK[2], 250);
  beginShape();
  vertex(-18, 0); vertex(16, 0); vertex(12, -110); vertex(-12, -110);
  endShape(CLOSE);
  // 脸
  fill([196, 178, 148][0], 178, 148);
  fill(196, 178, 148);
  ellipse(0, -128, 30, 42);
  // 眼睛与嘴
  fill(DARK[0], DARK[1], DARK[2]);
  ellipse(-6, -132, 5, 7);
  ellipse(6, -132, 5, 7);
  ellipse(0, -114, 9, 12);
  // 两只手：捂住耳朵
  fill([206, 186, 156][0], 186, 156);
  fill(206, 186, 156);
  ellipse(-16, -128, 12, 18);
  ellipse(16, -128, 12, 18);
  pop();
}
