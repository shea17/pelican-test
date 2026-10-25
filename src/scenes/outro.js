// Outro —— 新闻发布会。7×3 展墙，第 21 格是空席位。
import { DEFS, outro, SCENE_COUNT } from '../beat/timeline.js';
import { W, H } from '../main/camera.js';
import { E, clamp, lerp, hexToRgb, shade } from '../kit/core.js';
import { SERIF, SANS, text2d } from '../kit/type.js';
import { pose } from '../rig/rig.js';
import { drawRig } from '../rig/draw.js';

const WALL = { left: 96, top: 296, cellW: 236.6, cellH: 146.7, gapX: 12, gapY: 26, cols: 7 };
export const cellRect = (i) => {
  const c = i % WALL.cols, r = Math.floor(i / WALL.cols);
  return {
    x: WALL.left + c * (WALL.cellW + WALL.gapX),
    y: WALL.top + r * (WALL.cellH + WALL.gapY),
    w: WALL.cellW,
    h: WALL.cellH,
  };
};

const SEAT = 20;
const seatR = cellRect(SEAT);
const seatC = [seatR.x + seatR.w / 2, seatR.y + seatR.h / 2];
const wallC = [WALL.left + (WALL.cellW * 7 + WALL.gapX * 6) / 2, WALL.top + (WALL.cellH * 3 + WALL.gapY * 2) / 2];

export function camAt(t) {
  const k = E.inOutCubic(clamp((t - 127.0) / 4.0));
  return {
    cx: lerp(wallC[0], seatC[0], k),
    cy: lerp(wallC[1], seatC[1], k),
    z: lerp(1, 5.2, k),
  };
}
const toScreen = (cam, x, y) => [(x - cam.cx) * cam.z + W / 2, (y - cam.cy) * cam.z + H / 2];

function miniPelican(cx, cy, s, ink, body) {
  push();
  translate(cx, cy);
  scale(s);
  noFill();
  stroke(...ink);
  strokeWeight(1.3);
  circle(-25, -13, 38);
  circle(25, -13, 38);
  strokeWeight(1.1);
  line(-25, -13, 0, -21);
  line(25, -13, 0, -21);
  line(-25, -13, -6, -30);
  line(0, -21, 4, -34);
  strokeWeight(6.2);
  stroke(...body);
  noFill();
  beginShape();
  for (let i = 0; i <= 6; i++) {
    const k = i / 6;
    const x = -6 + (13) * k + Math.sin(k * Math.PI) * -4;
    const y = -34 - 16 * k + Math.sin(k * Math.PI) * -3;
    vertex(x, y);
  }
  endShape();
  noStroke();
  fill(...body);
  ellipse(-8, -33, 40, 22);
  ellipse(6, -50, 12, 12);
  stroke(...ink);
  strokeWeight(1.2);
  noFill();
  line(10, -52, 30, -49);
  noStroke();
  fill(...ink);
  triangle(9, -48, 30, -47, 11, -43);
  pop();
}

function seatRoom(r, t) {
  const { x, y, w, h } = r;
  push();
  noStroke();
  fill(24, 26, 30);
  rect(x, y, w, h);
  fill(38, 41, 47);
  rect(x, y, w, h * 0.72);
  fill(28, 30, 35);
  rect(x, y + h * 0.72, w, h * 0.28);

  const flashes = [128.0, 129.0, 130.0, 131.0];
  let f = 0;
  for (const ft of flashes) if (t >= ft) f = Math.max(f, Math.exp(-(t - ft) * 13));
  if (f > 0.01) {
    noStroke();
    fill(255, 252, 240, 190 * f);
    rect(x, y, w, h);
  }
  pop();
}

function seatFurniture(r) {
  const { x, y, w, h } = r;
  push();
  // 空椅子（背景）
  const cx = x + w * 0.5;
  noStroke();
  fill(64, 68, 76);
  rect(cx - 30, y + h * 0.26, 60, 54, 6);
  fill(52, 56, 64);
  rect(cx - 34, y + h * 0.26, 9, 68, 3);
  rect(cx + 25, y + h * 0.26, 9, 68, 3);
  rect(cx - 26, y + h * 0.26 + 46, 52, 7, 2);

  // 桌子
  fill(78, 62, 44);
  rect(x + w * 0.12, y + h * 0.66, w * 0.76, 9);
  fill(58, 45, 32);
  rect(x + w * 0.12, y + h * 0.66 + 9, w * 0.76, 5);

  // 一排麦克风
  for (let i = 0; i < 4; i++) {
    const mx = x + w * 0.26 + i * (w * 0.16);
    const tilt = -0.5 + i * 0.14;
    stroke(150, 152, 158);
    strokeWeight(2.2);
    const ex = mx + Math.cos(-1.2 + tilt) * 26;
    const ey = y + h * 0.665 + Math.sin(-1.2 + tilt) * 26;
    line(mx, y + h * 0.665, ex, ey);
    noStroke();
    fill(178, 180, 186);
    ellipse(ex, ey, 8, 9);
  }

  // 席卡
  noStroke();
  fill(236, 232, 220);
  rect(x + w * 0.38, y + h * 0.72, w * 0.24, 13, 1.5);
  pop();
}

export default {
  id: 'outro',
  draw(g) {
    const { t } = g;
    const cam = camAt(t);
    background(18, 19, 22);
    push();
    translate(W / 2, H / 2);
    scale(cam.z);
    translate(-cam.cx, -cam.cy);

    noStroke();
    fill(30, 32, 37);
    rect(WALL.left - 44, WALL.top - 44, WALL.cellW * 7 + WALL.gapX * 6 + 88, WALL.cellH * 3 + WALL.gapY * 2 + 88, 6);

    for (let i = 0; i < SCENE_COUNT; i++) {
      const r = cellRect(i);
      const d = DEFS[i];
      const bg = hexToRgb(d.pal[0]);
      fill(...bg);
      rect(r.x, r.y, r.w, r.h, 2);
      noFill();
      stroke(12, 12, 14, 200);
      strokeWeight(2);
      rect(r.x, r.y, r.w, r.h, 2);
      noStroke();
      fill(...hexToRgb(shade(d.pal[0], -0.35)));
      rect(r.x, r.y + r.h * 0.78, r.w, r.h * 0.22);
      miniPelican(r.x + r.w * 0.5, r.y + r.h * 0.8, 1.25, hexToRgb(d.pal[1]), hexToRgb(shade(d.pal[0], 0.85)));
    }

    seatRoom(cellRect(SEAT), t);

    // 最后一拍：鹈鹕从席位后方一闪而过
    if (t > 134.86 && t < 135.46) {
      const r = cellRect(SEAT);
      for (let gh = 1; gh >= 0; gh--) {
        const k = (t - 134.86 - gh * 0.045) / 0.55;
        if (k < 0 || k > 1) continue;
        const px = lerp(r.x - 46, r.x + r.w + 52, k);
        push();
        translate(px, r.y + r.h * 0.70);
        scale(0.34);
        const ghost = gh > 0;
        drawRig(pose(135 + k * 0.25, { dist: k * 1100 }), {
          ink: ghost ? [48, 52, 60] : [18, 16, 14],
          body: ghost ? [46, 50, 58] : [58, 62, 70],
          bodyDark: ghost ? [38, 42, 50] : [44, 48, 56],
          bike: ghost ? [48, 52, 60] : [18, 16, 14],
          leg: ghost ? [48, 52, 60] : [18, 16, 14],
          legFar: [46, 50, 58],
          beak: ghost ? [56, 60, 68] : [86, 88, 96],
          pouch: ghost ? [50, 54, 62] : [72, 74, 82],
          lw: 1.5,
        });
        pop();
      }
    }

    seatFurniture(cellRect(SEAT));
    pop();
  },

  overlay(ctx, t) {
    const cam = camAt(t);
    // 席卡上的字
    const r = cellRect(SEAT);
    const [sx, sy] = toScreen(cam, r.x + r.w * 0.5, r.y + r.h * 0.72 + 10);
    if (sx > -200 && sx < W + 200) {
      text2d(ctx, '鹈鹕（本人）', sx, sy, {
        size: Math.max(8, 9.5 * cam.z), family: SERIF, color: '#2b2620', align: 'center', baseline: 'middle',
      });
    }

    const s1 = clamp((t - 125.35) / 0.45) * (1 - clamp((t - 130.55) / 0.42));
    if (s1 > 0) {
      text2d(ctx, '截至目前，人类共提交了 20 份答卷。', W / 2, 952, {
        size: 38, family: SERIF, color: '#efe9dc', align: 'center', alpha: s1, tracking: 2,
      });
    }
    const s2 = clamp((t - 131.3) / 0.45);
    if (s2 > 0) {
      text2d(ctx, '鹈鹕本人对此尚未发表评论。', W / 2, 952, {
        size: 38, family: SERIF, color: '#efe9dc', align: 'center', alpha: s2, tracking: 2,
      });
    }

    // 闪光灯全屏溢光
    const flashes = [128.0, 129.0, 130.0, 131.0];
    let f = 0;
    for (const ft of flashes) if (t >= ft) f = Math.max(f, Math.exp(-(t - ft) * 9));
    if (f > 0.01) {
      ctx.save();
      ctx.fillStyle = `rgba(255,250,236,${0.16 * f})`;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }
  },
};
