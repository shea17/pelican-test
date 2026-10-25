// 17 聊天窗口（2000s）
// 一个古早 IM 客户端。窗口中间是透明的——所以你能看见那只鸟正从对话里骑过去。
import { GROUND, W, H } from '../main/camera.js';
import { pose } from '../rig/rig.js';
import { drawRig } from '../rig/draw.js';
import { vGrad, speckle } from '../kit/paint.js';
import { text2d, SANS, MONO } from '../kit/type.js';
import { clamp, E } from '../kit/core.js';

import { perf } from '../kit/act.js';

const WIN = { x: 210, y: 138, w: 1500, h: 822 };
const BAR = 46;
const LIST_W = 250;

export default {
  id: 'chat',
  card: { x: 40, y: 986, color: 'rgba(240,246,252,', light: true },

  overlay(ctx, g, fade) {
    const u = g.u;
    const a = clamp((u - 0.15) / 0.25);
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha = a;

    // —— 桌面：只画窗口以外的地方，窗口中间要透出后面的路 ——
    const desk = ctx.createLinearGradient(0, 0, 0, H);
    desk.addColorStop(0, '#2b5f8e');
    desk.addColorStop(0.55, '#4b8bb9');
    desk.addColorStop(1, '#7fb3cf');
    ctx.fillStyle = desk;
    ctx.fillRect(0, 0, W, WIN.y);
    ctx.fillRect(0, WIN.y + WIN.h, W, H - (WIN.y + WIN.h));
    ctx.fillRect(0, WIN.y, WIN.x, WIN.h);
    ctx.fillRect(WIN.x + WIN.w, WIN.y, W - (WIN.x + WIN.w), WIN.h);
    // 桌面上的斜纹（只落在窗口外）
    ctx.globalAlpha = a * 0.10;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    for (let i = -H; i < W; i += 26) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + H, H);
      ctx.stroke();
    }
    ctx.globalAlpha = a;

    // —— 窗口：只画框，中间留空，好让鸟骑过去 ——
    ctx.strokeStyle = 'rgba(255,255,255,0.55)';
    ctx.lineWidth = 2;
    roundRect(ctx, WIN.x, WIN.y, WIN.w, WIN.h, 7);
    ctx.stroke();

    // 标题栏
    const grad = ctx.createLinearGradient(0, WIN.y, 0, WIN.y + BAR);
    grad.addColorStop(0, '#4a86b8');
    grad.addColorStop(1, '#2b5c8a');
    ctx.fillStyle = grad;
    roundRect(ctx, WIN.x, WIN.y, WIN.w, BAR, 7);
    ctx.fill();
    ctx.fillStyle = '#2b5c8a';
    ctx.fillRect(WIN.x, WIN.y + BAR - 8, WIN.w, 8);

    text2d(ctx, 'PelicanIM 7.0  —  与「鹈鹕」聊天中', WIN.x + 18, WIN.y + 30, {
      size: 20, family: SANS, color: 'rgba(255,255,255,0.95)',
    });
    // 三个按钮
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = i === 2 ? 'rgba(214,86,72,0.95)' : 'rgba(255,255,255,0.28)';
      roundRect(ctx, WIN.x + WIN.w - 96 + i * 28, WIN.y + 13, 20, 20, 3);
      ctx.fill();
    }

    // 好友列表
    ctx.fillStyle = 'rgba(226,233,240,0.96)';
    ctx.fillRect(WIN.x, WIN.y + BAR, LIST_W, WIN.h - BAR - 62);
    text2d(ctx, '好友 (1/1)', WIN.x + 16, WIN.y + BAR + 30, {
      size: 15, family: SANS, color: '#6b7a88',
    });
    // 头像
    ctx.fillStyle = '#dfe6ef';
    ctx.fillRect(WIN.x + 14, WIN.y + BAR + 48, 188, 58);
    ctx.fillStyle = '#8fa9c4';
    ctx.beginPath();
    ctx.arc(WIN.x + 42, WIN.y + BAR + 77, 18, 0, Math.PI * 2);
    ctx.fill();
    // 鸟头剪影（头像）
    ctx.fillStyle = '#f6f2e6';
    ctx.beginPath();
    ctx.ellipse(WIN.x + 42, WIN.y + BAR + 80, 12, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e8a24a';
    ctx.beginPath();
    ctx.moveTo(WIN.x + 50, WIN.y + BAR + 78);
    ctx.lineTo(WIN.x + 68, WIN.y + BAR + 81);
    ctx.lineTo(WIN.x + 50, WIN.y + BAR + 84);
    ctx.closePath();
    ctx.fill();

    text2d(ctx, '鹈鹕', WIN.x + 70, WIN.y + BAR + 70, {
      size: 20, family: SANS, color: '#26333f',
    });
    text2d(ctx, '● 正在骑行', WIN.x + 70, WIN.y + BAR + 92, {
      size: 14, family: SANS, color: '#4f8f5a',
    });

    // 中部完全透明：能看见后面的路与那只鸟


    // 底部输入条
    ctx.fillStyle = 'rgba(238,242,246,0.96)';
    ctx.fillRect(WIN.x, WIN.y + WIN.h - 62, WIN.w, 62);
    ctx.fillStyle = '#ffffff';
    roundRect(ctx, WIN.x + LIST_W + 10, WIN.y + WIN.h - 52, WIN.w - LIST_W - 130, 42, 4);
    ctx.fill();
    ctx.strokeStyle = 'rgba(120,140,160,0.5)';
    ctx.lineWidth = 1;
    ctx.stroke();
    text2d(ctx, '输入消息…', WIN.x + LIST_W + 24, WIN.y + WIN.h - 25, {
      size: 18, family: SANS, color: '#9aa8b6',
    });
    // 发送按钮
    ctx.fillStyle = '#4a86b8';
    roundRect(ctx, WIN.x + WIN.w - 112, WIN.y + WIN.h - 52, 98, 42, 4);
    ctx.fill();
    text2d(ctx, '发送', WIN.x + WIN.w - 63, WIN.y + WIN.h - 24, {
      size: 18, family: SANS, color: '#ffffff', align: 'center',
    });

    // —— 消息 ——
    const msgs = [
      [0.45, 'sys', '鹈鹕 已加入聊天。'],
      [1.05, 'them', '在吗'],
      [1.70, 'me', '在骑车'],
      [2.45, 'them', '你是鸭子吗'],
      [3.10, 'me', '是鹈鹕'],
      [3.95, 'them', '……'],
      [4.60, 'them', '那你骑慢点'],
    ];
    let y = WIN.y + BAR + 54;
    for (const m of msgs) {
      const [at, who, text] = m;
      const k = clamp((u - at) / 0.22);
      if (k <= 0) continue;
      ctx.globalAlpha = a * E.outCubic(k);
      if (who === 'sys') {
        text2d(ctx, text, 960, y, { size: 16, family: SANS, color: '#8b98a5', align: 'center' });
        y += 40;
        continue;
      }
      const mine = who === 'me';
      ctx.font = `18px ${SANS}`;
      const tw = ctx.measureText(text).width;
      const bw = tw + 34;
      const bx = mine ? WIN.x + WIN.w - 40 - bw : WIN.x + LIST_W + 34;
      ctx.fillStyle = mine ? 'rgba(146,196,150,0.96)' : 'rgba(255,255,255,0.96)';
      roundRect(ctx, bx, y - 24, bw, 42, 8);
      ctx.fill();
      text2d(ctx, text, bx + 17, y + 3, {
        size: 22, family: SANS, color: mine ? '#1e3a26' : '#22303c',
      });
      y += 62;
    }
    ctx.globalAlpha = a;

    // 输入框里的光标
    if (Math.floor(u * 2.2) % 2 === 0) {
      ctx.fillStyle = '#4a86b8';
      ctx.fillRect(WIN.x + LIST_W + 24, WIN.y + WIN.h - 46, 2, 26);
    }

    ctx.restore();
  },

  draw(g) {
    const { t, dist, span, hasRider, riderLocal } = g;
    rectMode(CORNER);
    const L = span[0], R = span[1], WW = R - L;

    // 桌面背后：一条极简的路与天（会被窗口的透明中部露出来）
    vGrad(L, 286, WW, 300, [110, 158, 190], [176, 206, 216], 26);
    noStroke();
    fill(96, 132, 118);
    rect(L, 586, WW, GROUND - 586);
    fill(126, 112, 96);
    rect(L, GROUND, WW, 180);
    // 路面标线
    fill(226, 220, 200, 120);
    for (let x = L; x < R; x += 90) rect(x, GROUND + 12, 46, 5);

    // 几棵树，给窗外一点纵深
    fill(72, 104, 78, 220);
    for (let x = L; x < R; x += 260) {
      circle(x + 40, 560, 110);
      circle(x + 90, 580, 80);
    }

    if (hasRider) {
      // 表演：一条消息从上面掉下来，正砸在它头上。它抬头看。
      const A = perf(g.p, {
        pitch: [[0.34, 0], [0.44, -0.30], [0.62, -0.26], [0.72, 0.16], [0.82, 0]],
        lift: [[0.42, 0], [0.46, -4], [0.54, 0], [0.72, 0]],
      });
      push();
      translate(riderLocal, GROUND);
      drawRig(pose(t, { dist, headPitch: A.pitch, neckLift: A.lift }), {
        ink: [42, 40, 46], body: [250, 248, 240], bodyDark: [212, 210, 200],
        bike: [58, 60, 68], leg: [120, 96, 70], legFar: [168, 160, 148],
        beak: [232, 160, 62], pouch: [238, 188, 102], lw: 1.8,
        chain: [140, 142, 148],
        wheelOpt: { tyre: [58, 60, 68], rim: [150, 154, 160], spoke: [120, 124, 130], spokeW: 0.7, hub: [58, 60, 68], tyreW: 2.6 },
      });
      pop();
    }
  },
};

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}
