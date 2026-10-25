// 20 代码美学（2020s）
// 一个 IDE：左边是实时预览（那只鸟真的在里头骑），右边是源码，下面是终端。
import { GROUND, W, H } from '../main/camera.js';
import { pose } from '../rig/rig.js';
import { drawRig } from '../rig/draw.js';
import { speckle } from '../kit/paint.js';
import { text2d, MONO, SANS } from '../kit/type.js';
import { clamp, E } from '../kit/core.js';

import { perf } from '../kit/act.js';

const PREVIEW = { x: 24, y: 76, w: 916, h: 716 };
const ED = { x: 964, y: 64, w: W - 964, h: H - 64 };

const LINES = [
  ['c', '// 鹈鹕骑车的唯一实现'],
  ['k', "import { Pelican } from './pelican.js';"],
  ['k', "import { Bicycle } from './bicycle.js';"],
  ['', ''],
  ['p', "const bird = new Pelican({ neck: 0.88, beak: 'long' });"],
  ['p', 'const bike = new Bicycle({ wheels: 2, gears: 1 });'],
  ['', ''],
  ['f', 'bird.mount(bike);'],
  ['', ''],
  ['k', 'while (road.continues()) {'],
  ['p', '  bike.pedal(120 / 60);'],
  ['p', "  bird.look('ahead');"],
  ['k', '  if (bird.isDuck()) {'],
  ['s', "    throw new Error('不是鸭子');"],
  ['k', '  }'],
  ['k', '}'],
  ['', ''],
  ['c', '// TODO: make the pelican fly'],
  ['c', '// 试过了。它不肯。'],
  ['', ''],
  ['p', 'export default bird;'],
];

const COL = {
  c: 'rgba(112,128,146,0.9)',
  k: '#c792ea',
  p: '#d8dee9',
  s: '#c3e88d',
  f: '#82aaff',
  n: '#f78c6c',
};

export default {
  id: 'code',
  card: { x: 48, y: 772, color: 'rgba(216,222,233,', light: true },

  overlay(ctx, g, fade) {
    const u = g.u;
    const a = clamp((u - 0.1) / 0.25);
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha = a;

    // —— 顶栏 ——
    ctx.fillStyle = 'rgba(18,22,30,0.98)';
    ctx.fillRect(0, 0, W, 64);
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.fillRect(0, 63, W, 1);

    // 标签页
    ctx.fillStyle = 'rgba(28,34,46,0.98)';
    ctx.fillRect(0, 0, 250, 64);
    ctx.fillStyle = '#8fbf7f';
    ctx.fillRect(0, 0, 4, 64);
    text2d(ctx, 'scene.js', 26, 40, { size: 21, family: MONO, color: '#d8dee9' });
    ctx.fillStyle = 'rgba(216,222,233,0.35)';
    ctx.beginPath();
    ctx.arc(216, 32, 5, 0, Math.PI * 2);
    ctx.fill();
    text2d(ctx, 'pelican.js', 300, 40, { size: 21, family: MONO, color: 'rgba(216,222,233,0.45)' });

    // 右侧状态
    text2d(ctx, 'main  ✓ 0 problems', W - 40, 40, {
      size: 18, family: MONO, color: 'rgba(143,191,127,0.9)', align: 'right',
    });

    // —— 预览框 ——
    ctx.strokeStyle = 'rgba(216,222,233,0.22)';
    ctx.lineWidth = 1.4;
    ctx.strokeRect(PREVIEW.x, PREVIEW.y, PREVIEW.w, PREVIEW.h);
    // 四角
    ctx.strokeStyle = 'rgba(143,191,127,0.8)';
    ctx.lineWidth = 2.4;
    const cs = 22;
    for (const [cx, cy, dx, dy] of [
      [PREVIEW.x, PREVIEW.y, 1, 1],
      [PREVIEW.x + PREVIEW.w, PREVIEW.y, -1, 1],
      [PREVIEW.x, PREVIEW.y + PREVIEW.h, 1, -1],
      [PREVIEW.x + PREVIEW.w, PREVIEW.y + PREVIEW.h, -1, -1],
    ]) {
      ctx.beginPath();
      ctx.moveTo(cx + dx * cs, cy);
      ctx.lineTo(cx, cy);
      ctx.lineTo(cx, cy + dy * cs);
      ctx.stroke();
    }
    text2d(ctx, 'PREVIEW  1920×1080  30fps', PREVIEW.x + 14, PREVIEW.y + 30, {
      size: 17, family: MONO, color: 'rgba(143,191,127,0.85)',
    });

    // —— 编辑器 ——
    ctx.fillStyle = 'rgba(18,22,30,0.98)';
    ctx.fillRect(ED.x, ED.y, ED.w, ED.h);
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.fillRect(ED.x, ED.y, 1, ED.h);

    // 行号栏
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    ctx.fillRect(ED.x, ED.y, 62, ED.h - 210);

    // 代码：逐行打出来
    const reveal = (u - 0.55) / 0.16;
    let y = ED.y + 54;
    for (let i = 0; i < LINES.length; i++) {
      if (i > reveal) break;
      const [kind, text] = LINES[i];
      const lineY = y + i * 32;
      if (lineY > ED.y + ED.h - 230) break;
      text2d(ctx, String(i + 1).padStart(2, '0'), ED.x + 48, lineY, {
        size: 19, family: MONO, color: 'rgba(120,134,152,0.55)', align: 'right',
      });
      if (text) {
        text2d(ctx, text, ED.x + 80, lineY, {
          size: 21, family: MONO, color: COL[kind] || COL.p,
        });
      }
    }
    // 光标
    const activeLine = Math.min(LINES.length - 1, Math.floor(reveal));
    const caretY = y + activeLine * 32;
    if (caretY < ED.y + ED.h - 230 && Math.floor(u * 2.4) % 2 === 0) {
      ctx.fillStyle = '#8fbf7f';
      ctx.fillRect(ED.x + 80, caretY - 18, 2, 24);
    }

    // 高亮 TODO 那一行
    const todoIdx = 17;
    if (reveal > todoIdx) {
      ctx.fillStyle = 'rgba(199,146,234,0.10)';
      ctx.fillRect(ED.x + 62, y + todoIdx * 32 - 22, ED.w - 62, 30);
    }

    // —— 终端 ——
    const tx = ED.x;
    const ty = ED.y + ED.h - 200;
    ctx.fillStyle = 'rgba(12,15,21,0.98)';
    ctx.fillRect(tx, ty, ED.w, 200);
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fillRect(tx, ty, ED.w, 1);
    text2d(ctx, 'TERMINAL', tx + 20, ty + 30, {
      size: 15, family: MONO, color: 'rgba(150,164,182,0.7)', tracking: 2,
    });
    const term = [
      ['$ npm run ride', '#d8dee9'],
      ['> pelican-test@0.1.0 ride', 'rgba(150,164,182,0.8)'],
      ['[ok] 20 panels / 137.0s', '#8fbf7f'],
      ['warning: pelican is not a duck', '#f0c674'],
      ['$ ', '#d8dee9'],
    ];
    for (let i = 0; i < term.length; i++) {
      const k = clamp((u - 2.2 - i * 0.35) / 0.2);
      if (k <= 0) continue;
      text2d(ctx, term[i][0], tx + 20, ty + 66 + i * 26, {
        size: 18, family: MONO, color: term[i][1], alpha: k,
      });
    }
    if (Math.floor(u * 2.4) % 2 === 0) {
      ctx.fillStyle = '#d8dee9';
      ctx.fillRect(tx + 44, ty + 168, 9, 18);
    }

    // —— 右下角状态条 ——
    ctx.fillStyle = 'rgba(143,191,127,0.9)';
    ctx.fillRect(W - 250, H - 34, 250, 34);
    text2d(ctx, 'JavaScript   UTF-8   LF', W - 20, H - 11, {
      size: 15, family: MONO, color: 'rgba(18,22,30,0.9)', align: 'right',
    });

    ctx.restore();
  },

  draw(g) {
    const { t, dist, span, hasRider, riderLocal } = g;
    rectMode(CORNER);
    const L = span[0], R = span[1], WW = R - L;

    // 预览区的底：深色 + 一层极淡的网格
    noStroke();
    fill(16, 20, 28);
    rect(L, 286, WW, 580);
    push();
    stroke(143, 191, 127, 16);
    strokeWeight(1);
    for (let x = L; x < R; x += 80) line(x, 286, x, 866);
    for (let y = 290; y < 866; y += 80) line(L, y, R, y);
    pop();

    // 地平线与路面
    noStroke();
    fill(24, 30, 40);
    rect(L, GROUND, WW, 180);
    fill(32, 40, 52);
    rect(L, GROUND - 4, WW, 10);
    fill(143, 191, 127, 60);
    for (let x = L; x < R; x += 96) rect(x, GROUND + 16, 52, 4);

    // 远处的一行城市剪影（暗示这是"渲染出来的场景"）
    fill(22, 28, 38);
    for (let x = L - 40; x < R + 40; x += 120) {
      const h = 60 + ((x * 37) % 120);
      rect(x, GROUND - 40 - h, 70, h + 40);
    }

    if (hasRider) {
      // 表演：低头对着键盘猛啄一下——回车
      const A = perf(g.p, {
        pitch: [[0.34, 0], [0.44, 0.42], [0.52, 0.34], [0.56, 0.5], [0.62, 0]],
        lift: [[0.34, 0], [0.44, -6], [0.62, 0]],
      });
      push();
      translate(riderLocal, GROUND);
      drawRig(pose(t, { dist, headPitch: A.pitch, neckLift: A.lift }), {
        ink: [216, 222, 233], body: [46, 54, 68], bodyDark: [32, 38, 50],
        bike: [216, 222, 233], leg: [143, 191, 127], legFar: [96, 128, 88],
        beak: [240, 198, 116], pouch: [230, 176, 96], lw: 2.0,
        chain: [120, 134, 152],
        wheelOpt: { tyre: [216, 222, 233], rim: [143, 191, 127], spoke: [120, 134, 152], spokeW: 0.9, hub: [143, 191, 127], tyreW: 2.6 },
      });
      pop();
    }

    // 扫描线，让它看起来像一块屏幕
    push();
    noStroke();
    for (let y = 288; y < 866; y += 6) {
      fill(0, 0, 0, 16);
      rect(L, y, WW, 2);
    }
    pop();
    speckle(L, 286, WW, 580, 220, [143, 191, 127], 20, 6, 0.4, 1.2);
  },
};
