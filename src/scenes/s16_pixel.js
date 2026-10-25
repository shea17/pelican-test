// 16 8-bit 像素（1980s）
// 所有景物吸附到 8 单位网格上，硬边、无渐变、三层视差。HUD 走 2D 层。
import { GROUND } from '../main/camera.js';
import { pose } from '../rig/rig.js';
import { drawRig } from '../rig/draw.js';
import { text2d, MONO } from '../kit/type.js';
import { rng } from '../kit/core.js';

import { perf } from '../kit/act.js';

const P = 8;                     // 一格 = 8 世界单位
const SKY_TOP = [26, 26, 62];
const SKY_MID = [58, 52, 104];
const SKY_LOW = [120, 92, 130];
const GROUND_C = [92, 62, 44];
const BRICK = [148, 96, 60];
const BRICK_D = [96, 60, 38];
const GREEN = [72, 156, 76];
const GREEN_D = [36, 96, 48];
const YELL = [244, 208, 76];

const q = (v) => Math.round(v / P) * P;

export default {
  id: 'pixel',
  card: { x: 118, y: 928, color: 'rgba(250,244,220,', light: true },

  overlay(ctx, g, fade) {
    const u = g.u;
    const a = Math.min(1, Math.max(0, (u - 0.3) / 0.3));
    if (a <= 0.01) return;
    const score = 1200 + Math.floor(Math.max(0, u) * 37);
    ctx.save();
    ctx.globalAlpha = a;
    // 像素字：用等宽字体 + 硬阴影
    const px = (str, x, y, size, col, align = 'left') => {
      text2d(ctx, str, x + 3, y + 3, { size, family: MONO, color: 'rgba(0,0,0,0.55)', align, weight: 700 });
      text2d(ctx, str, x, y, { size, family: MONO, color: col, align, weight: 700 });
    };
    px('SCORE', 118, 120, 22, 'rgba(250,244,220,0.85)');
    px(String(score).padStart(6, '0'), 118, 156, 34, '#fff8e0');
    px('PELICAN x 03', 1790, 120, 24, '#ffe9a8', 'right');
    px('WORLD 1-1', 1790, 156, 24, 'rgba(250,244,220,0.8)', 'right');
    // 金币计数
    px('◉ x 12', 118, 200, 24, '#ffe066');
    ctx.restore();
  },

  draw(g) {
    const { t, dist, span, hasRider, riderLocal } = g;
    rectMode(CORNER);
    const L = span[0], R = span[1], WW = R - L;
    noStroke();

    // —— 天：四段色带，不做渐变 ——
    fill(SKY_TOP[0], SKY_TOP[1], SKY_TOP[2]);
    rect(L, 286, WW, 96);
    fill(38, 36, 82);
    rect(L, 382, WW, 90);
    fill(SKY_MID[0], SKY_MID[1], SKY_MID[2]);
    rect(L, 472, WW, 96);
    fill(SKY_LOW[0], SKY_LOW[1], SKY_LOW[2]);
    rect(L, 568, WW, GROUND - 568);

    // —— 云：方块拼的（按距离取模，才会一直有云） ——
    const offC = (dist * 0.12) % 420;
    for (let x = L - 420; x < R + 420; x += 420) {
      const cx = q(x - offC);
      cloud(cx, 360);
      cloud(cx + 210, 470);
    }

    // —— 远山：方块三角 ——
    const r0 = rng(7);
    const offH = (dist * 0.35) % 240;
    for (let x = L - 240; x < R + 240; x += 240) {
      const h = 90 + ((Math.floor(x / 240) * 3) % 5) * 8;
      hill(q(x - offH), GROUND - 120, h);
    }

    // —— 地面：砖 ——
    fill(GROUND_C[0], GROUND_C[1], GROUND_C[2]);
    rect(L, GROUND, WW, 180);
    // 路面砖：两行错缝
    for (let row = 0; row < 2; row++) {
      for (let x = q(L) - 32; x < R + 32; x += 48) {
        const bx = x + (row % 2 ? 24 : 0);
        fill(row ? BRICK[0] : [166, 110, 70][0], row ? BRICK[1] : 110, row ? BRICK[2] : 70);
        rect(bx, GROUND + row * 22, 44, 20);
        fill(60, 38, 24);
        rect(bx, GROUND + row * 22 + 20, 44, 3);
      }
    }
    fill(56, 38, 28);
    rect(L, GROUND + 45, WW, 26);
    for (let x = q(L); x < R; x += 32) {
      fill(40, 26, 20);
      rect(x + 4, GROUND + 52, 24, 12);
    }

    // —— 问号块、砖块、水管、金币 ——
    for (let x = L - 100; x < R + 100; x += 420) {
      const bx = q(x);
      qblock(bx, 470);
      qblock(bx + 40, 470);
      brick(bx + 80, 470);
      qblock(bx + 120, 534);
    }
    pipe(1360, GROUND);
    pipe(1648, GROUND);
    // 被碾平的板栗仔：只剩一张薄片
    goombaFlat(1180, GROUND);

    // 金币：悬在空中，一格一格地转（鸟真会啄走的那一枚除外）
    const eaten = perf(g.p, { v: [[0, 0], [0.5, 1]] }).v;
    for (let i = 0; i < 7; i++) {
      const cx = 300 + i * 128;
      if (cx === 1068 && eaten > 0.5) continue;
      coin(cx, 420, t + i * 0.3);
    }

    // —— 骑手 ——
    if (hasRider) {
      // 表演：抬头，一口啄下一枚金币
      const A = perf(g.p, {
        pitch: [[0.42, 0], [0.48, -0.42], [0.53, -0.34], [0.60, 0]],
        gape: [[0.475, 0], [0.505, 0.9], [0.545, 0], [0.6, 0]],
        hop: [[0.455, 0], [0.49, 26], [0.525, 0], [0.56, 0]],
      });
      push();
      translate(riderLocal, GROUND - A.hop);
      drawRig(pose(t, { dist, headPitch: A.pitch, gape: A.gape }), {
        ink: [26, 22, 34], body: [250, 246, 228], bodyDark: [200, 196, 184],
        bike: [214, 64, 70], leg: [232, 168, 76], legFar: [176, 120, 60],
        beak: [246, 160, 58], pouch: [250, 196, 96], lw: 3.6,
        chain: [180, 180, 180],
        wheelOpt: { tyre: [26, 22, 34], rim: [214, 64, 70], spoke: [26, 22, 34], spokeW: 2.2, hub: [246, 200, 96], tyreW: 5.4 },
      });
      pop();

      // 啄中的那一下：像素字 +100 往上跳
      const k = perf(g.p, { v: [[0.50, 0], [0.53, 1], [0.72, 0]] }).v;
      if (k > 0.01) {
        push();
        noStroke();
        fill(250, 232, 140, 255 * k);
        const bx = riderLocal + 150;
        const by = 398 - (1 - k) * 42;
        const glyph = (gx, ch) => {
          const P = {
            '1': [[0, 4, 6, 3], [2, 0, 3, 18]],
            '0': [[0, 0, 3, 18], [9, 0, 3, 18], [0, 0, 12, 3], [0, 15, 12, 3]],
          }[ch];
          for (const [x, y, w, h] of P) rect(gx + x, by + y, w, h);
        };
        glyph(bx, '1');
        glyph(bx + 22, '0');
        glyph(bx + 44, '0');
        pop();
      }
    }
  },
};

// ---------- 方块 ----------

function cloud(x, y) {
  const gx = q(x), gy = q(y);
  fill(238, 236, 244);
  rect(gx, gy, 128, 24);
  rect(gx + 24, gy - 16, 80, 16);
  rect(gx + 40, gy - 32, 48, 16);
  fill(206, 206, 224);
  rect(gx, gy + 24, 128, 8);
  rect(gx + 24, gy, 80, 8);
}

function hill(x, baseY, h) {
  fill(GREEN_D[0], GREEN_D[1], GREEN_D[2]);
  const steps = Math.floor(h / P);
  for (let i = 0; i < steps; i++) {
    const w = (steps - i) * P * 1.6;
    rect(x - w / 2, baseY - (i + 1) * P, w, P);
  }
  fill(GREEN[0], GREEN[1], GREEN[2]);
  for (let i = 0; i < steps; i += 3) {
    const w = (steps - i) * P * 1.2;
    rect(x - w / 2 + P, baseY - (i + 1) * P, w - P * 2, P);
  }
}

function qblock(x, y) {
  fill(226, 168, 48);
  rect(x, y, 32, 32);
  fill(250, 216, 96);
  rect(x + 4, y + 4, 24, 6);
  rect(x + 4, y + 4, 6, 24);
  fill(150, 96, 24);
  rect(x + 4, y + 26, 24, 6);
  rect(x + 26, y + 4, 6, 24);
  // 问号：用方块拼
  fill(120, 68, 16);
  rect(x + 12, y + 8, 12, 4);
  rect(x + 20, y + 12, 6, 6);
  rect(x + 14, y + 16, 8, 4);
  rect(x + 14, y + 22, 6, 5);
}

function brick(x, y) {
  fill(BRICK[0], BRICK[1], BRICK[2]);
  rect(x, y, 32, 32);
  fill(60, 36, 22);
  for (let i = 0; i < 4; i++) {
    rect(x, y + i * 8, 32, 2);
    const off = i % 2 ? 0 : 12;
    rect(x + off + 4, y + i * 8, 2, 8);
    rect(x + off + 20, y + i * 8, 2, 8);
  }
}

function pipe(x, ground) {
  fill(GREEN_D[0], GREEN_D[1], GREEN_D[2]);
  rect(q(x), ground - 96, 72, 96);
  fill(GREEN[0], GREEN[1], GREEN[2]);
  rect(q(x) + 8, ground - 88, 56, 88);
  fill(GREEN[0], GREEN[1], GREEN[2]);
  rect(q(x) - 8, ground - 112, 88, 24);
  fill(GREEN_D[0], GREEN_D[1], GREEN_D[2]);
  rect(q(x) - 8, ground - 96, 88, 6);
  fill(190, 232, 190, 90);
  rect(q(x) + 14, ground - 88, 8, 80);
}

function coin(x, y, ph) {
  const k = Math.abs(Math.sin(ph * 2.2));
  const w = Math.max(4, q(18 * k));
  const cx = q(x), cy = q(y);
  fill(246, 208, 60);
  rect(cx - w / 2, cy, w, 26);
  fill(255, 240, 150);
  rect(cx - w / 2 + 2, cy + 4, Math.max(2, w - 6), 6);
}

function goombaFlat(x, y) {
  fill(120, 80, 48);
  rect(q(x), y - 10, 40, 10);
  fill(70, 46, 26);
  rect(q(x) + 4, y - 10, 32, 4);
  fill(240, 230, 210);
  rect(q(x) + 10, y - 6, 5, 4);
  rect(q(x) + 25, y - 6, 5, 4);
}
