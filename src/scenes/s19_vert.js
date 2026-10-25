// 19 竖屏短视频（2020s）
// 画面收窄成 9:16，两侧黑边，虚构 App 界面。进度条走完正好穿框。
import { GROUND } from '../main/camera.js';
import { pose } from '../rig/rig.js';
import { drawRig } from '../rig/draw.js';
import { SANS, text2d } from '../kit/type.js';
import { clamp, E, rng, lerp } from '../kit/core.js';

// 视口：1920×1080 里居中的 9:16
// 竖屏视口对齐到长卷上骑手的位置（画面 42%），这样接缝扫过时两侧的鸟能接上
import { perf } from '../kit/act.js';

const VP = { w: 607.5, h: 1080, x: 1920 * 0.42 - 607.5 / 2, y: 0 };
const VP_WORLD = VP.w / 1.92;   // 316.4

const SKY_TOP = [42, 34, 58];
const SKY_BOT = [232, 138, 88];

export default {
  id: 'vert',
  card: {
    x: 1178, y: 470, color: 'rgba(238,234,226,', align: 'left', size: 30,
    plate: true, plateColor: 'rgba(8,8,10,', plateW: 330,
  },

  draw(g) {
    const { t, dist, hasRider } = g;
    // 竖屏这一段完全在屏幕坐标里画：它本来就是一个手机画面，不参与长卷的横向布局
    push();
    resetMatrix();
    translate(-1920 / 2, -1080 / 2);
    noStroke();

    background(9, 9, 11);

    const shakeX = Math.sin(t * 2.1) * 2.2 + Math.sin(t * 5.3) * 0.9;
    const shakeY = Math.cos(t * 1.7) * 1.6;

    push();
    translate(shakeX, shakeY);

    // 天空
    gradientRect(VP.x - 40, 0, VP.w + 80, 700, SKY_TOP, SKY_BOT, 140);

    // 远景城市
    skyline(VP.x, dist);

    // 地面与路
    fill(26, 24, 30);
    rect(VP.x - 40, 772, VP.w + 80, 340);
    fill(48, 44, 52);
    rect(VP.x - 40, 772, VP.w + 80, 22);
    fill(226, 186, 120, 130);
    for (let i = 0; i < 12; i++) {
      const x = VP.x - 60 + (((i * 96 - ((dist * 1.9) % 96)) % 1152) + 1152) % 1152;
      rect(x, 782, 48, 4);
    }

    // 骑手：竖屏里就该占满
    if (hasRider) {
      // 表演：对着镜头挥翅、点头——这才是竖屏该有的动作
      const A = perf(g.p, {
        wave: [[0.30, 0], [0.38, 0.95], [0.46, 0.62], [0.54, 0.95], [0.62, 0.6], [0.72, 0]],
        nod: [[0.30, 0], [0.40, 0.10], [0.46, -0.06], [0.54, 0.10], [0.62, 0], [0.72, 0]],
        tilt: [[0.30, 0], [0.42, -0.13], [0.58, -0.10], [0.70, 0]],
      });
      push();
      translate(VP.x + VP.w * 0.5, 772);
      scale(1.92);
      drawRig(pose(t, { dist, wingRaise: A.wave, headPitch: A.nod, lean: A.tilt }), {
        ink: [22, 20, 26],
        body: [246, 242, 232],
        bodyDark: [196, 190, 178],
        bike: [30, 28, 34],
        leg: [86, 66, 50],
        legFar: [150, 146, 138],
        beak: [238, 158, 62],
        pouch: [242, 186, 96],
        lw: 2.0,
      });
      pop();

      // 飘上去的心：越挥越多
      const k = perf(g.p, { v: [[0.32, 0], [0.44, 1], [0.78, 1], [0.9, 0]] }).v;
      if (k > 0.02) {
        const r = rng(53);
        for (let i = 0; i < 12; i++) {
          const ph = (t * 0.55 + i * 0.37) % 1;
          const hx = VP.x + VP.w * 0.5 + Math.sin(i * 2.1) * 150 + Math.sin(ph * 6 + i) * 18;
          const hy = 700 - ph * 520;
          const a = k * (1 - ph) * 220;
          if (a < 6) continue;
          ctxHeart(hx, hy, 9 + (i % 3) * 4, a);
        }
      }
    }
    pop();

    // 两侧黑边
    fill(9, 9, 11);
    rect(-40, -40, VP.x + 40, 1160);
    rect(VP.x + VP.w, -40, 1920 - (VP.x + VP.w) + 40, 1160);

    // 上下暗角
    fill(9, 9, 11, 130);
    rect(VP.x, -4, VP.w, 10);
    rect(VP.x, 1074, VP.w, 10);

    pop();
  },

  overlay(ctx, g, fade) {
    const p = g.p;
    const a = fade;
    // 顶部标签
    text2d(ctx, '关注', VP.x + 34, 62, { size: 17, family: SANS, color: 'rgba(255,255,255,0.55)', alpha: a });
    text2d(ctx, '推荐', VP.x + 104, 62, { size: 17, family: SANS, color: 'rgba(255,255,255,0.95)', alpha: a });
    ctx.fillStyle = `rgba(255,255,255,${0.9 * a})`;
    ctx.fillRect(VP.x + 104, 74, 34, 3);

    // 账号
    const ax = VP.x + 34;
    const ay = 986;
    text2d(ctx, '@鹈鹕观察日记', ax, ay - 74, { size: 21, family: SANS, color: 'rgba(255,255,255,0.95)', alpha: a });
    const followW = 66;
    ctx.fillStyle = `rgba(238,64,88,${a})`;
    roundRect(ctx, ax, ay - 56, followW, 26, 4);
    ctx.fill();
    text2d(ctx, '关注', ax + followW / 2, ay - 37, { size: 14, family: SANS, color: '#fff', align: 'center', alpha: a });

    // 文案
    text2d(ctx, '第 19 天：它又骑过去了。', ax, ay - 12, { size: 19, family: SANS, color: 'rgba(255,255,255,0.94)', alpha: a });
    text2d(ctx, '# 人类迷惑行为  # 鹈鹕', ax, ay + 16, { size: 17, family: SANS, color: 'rgba(255,255,255,0.7)', alpha: a });
    text2d(ctx, '原声 · 鹈鹕观察日记', ax, ay + 44, { size: 14, family: SANS, color: 'rgba(255,255,255,0.55)', alpha: a });

    // 右栏
    rail(ctx, VP.x + VP.w - 54, 760, a);

    // 进度条：走完正好穿框
    const prog = clamp(p);
    ctx.fillStyle = `rgba(255,255,255,${0.22 * a})`;
    ctx.fillRect(0, 1074, 1920, 2.5);
    ctx.fillStyle = `rgba(255,255,255,${0.85 * a})`;
    ctx.fillRect(0, 1074, 1920 * prog, 2.5);

    // 弹幕：往上飘
    comments(ctx, g.u, a);
  },
};

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** 竖屏里的远景：一点点城市化，虚焦 */
/** 一颗像素心 */
function ctxHeart(x, y, s, a) {
  noStroke();
  fill(255, 59, 92, a);
  rect(x - s, y - s * 0.3, s * 2, s * 1.1, s * 0.35);
  circle(x - s * 0.5, y - s * 0.45, s * 1.3);
  circle(x + s * 0.5, y - s * 0.45, s * 1.3);
  triangle(x - s, y + s * 0.6, x + s, y + s * 0.6, x, y + s * 1.5);
}

function skyline(vpx, dist) {
  const r = rng(5);
  noStroke();
  for (let i = 0; i < 14; i++) {
    const bx = vpx - 60 + i * 58 + ((dist * 0.25) % 58);
    const bh = 70 + r() * 190;
    fill(58, 52, 66, 120 + r() * 40);
    rect(bx, 766 - bh, 40 + r() * 14, bh);
    fill(246, 206, 130, 60 + r() * 50);
    for (let k = 0; k < 6; k++) {
      rect(bx + 7 + (k % 2) * 15, 766 - bh + 14 + k * 20, 6, 7);
    }
  }
  // 塔吊
  push();
  stroke(30, 26, 38, 150);
  strokeWeight(2);
  const cx = vpx + 470;
  line(cx, 766, cx, 766 - 210);
  line(cx - 70, 766 - 200, cx + 90, 766 - 200);
  line(cx, 766 - 230, cx + 60, 766 - 200);
  pop();
}

function gradientRect(x, y, w, h, c0, c1, steps) {
  noStroke();
  for (let i = 0; i < steps; i++) {
    const k = i / (steps - 1);
    fill(lerp(c0[0], c1[0], k), lerp(c0[1], c1[1], k), lerp(c0[2], c1[2], k));
    rect(x, y + (h / steps) * i, w, h / steps + 1);
  }
}

function rail(ctx, x, y, a) {
  const items = [
    { icon: 'heart', n: '1.2万' },
    { icon: 'comment', n: '846' },
    { icon: 'share', n: '203' },
  ];
  items.forEach((it, i) => {
    const cy = y + i * 96;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.strokeStyle = 'rgba(255,255,255,0.92)';
    ctx.lineWidth = 2.4;
    if (it.icon === 'heart') {
      ctx.beginPath();
      ctx.moveTo(x, cy + 8);
      ctx.bezierCurveTo(x - 16, cy - 6, x - 14, cy - 20, x, cy - 12);
      ctx.bezierCurveTo(x + 14, cy - 20, x + 16, cy - 6, x, cy + 8);
      ctx.fill();
    } else if (it.icon === 'comment') {
      ctx.beginPath();
      ctx.arc(x, cy, 11, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x - 8, cy + 8);
      ctx.lineTo(x - 11, cy + 16);
      ctx.lineTo(x - 1, cy + 10);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(x - 10, cy - 4);
      ctx.lineTo(x + 10, cy - 12);
      ctx.lineTo(x + 10, cy + 12);
      ctx.lineTo(x - 10, cy + 4);
      ctx.closePath();
      ctx.stroke();
    }
    ctx.restore();
    text2d(ctx, it.n, x, cy + 34, { size: 12, family: SANS, color: 'rgba(255,255,255,0.78)', align: 'center', alpha: a });
  });
}

const MSGS = [
  { at: 5.6, text: '这是鸭子吗', who: '路人甲' },
  { at: 7.2, text: '是鹈鹕', who: '作者', pin: true },
  { at: 8.6, text: '它真的在骑', who: '阿青' },
  { at: 10.0, text: '轮子转得好认真', who: '小满' },
  { at: 11.4, text: '这是鸭子吗', who: '过路的人' },
];

function comments(ctx, u, a) {
  for (const m of MSGS) {
    const dt = u - m.at;
    if (dt < 0 || dt > 3.4) continue;
    const k = dt / 3.4;
    const y = 900 - k * 250;
    const alpha = a * (1 - Math.pow(k, 3)) * (m.pin ? 1 : 0.85);
    ctx.save();
    ctx.globalAlpha = alpha;
    if (m.pin) {
      const w = 214;
      ctx.fillStyle = 'rgba(0,0,0,0.34)';
      roundRect(ctx, VP.x + 30, y - 22, w, 34, 17);
      ctx.fill();
      text2d(ctx, '置顶', VP.x + 44, y - 1, { size: 12, family: SANS, color: 'rgba(255,214,140,0.95)' });
      text2d(ctx, m.text, VP.x + 82, y - 1, { size: 16, family: SANS, color: '#ffffff' });
      text2d(ctx, m.who, VP.x + 82 + 66, y - 1, { size: 13, family: SANS, color: 'rgba(255,255,255,0.55)' });
    } else {
      text2d(ctx, m.who, VP.x + 34, y, { size: 13, family: SANS, color: 'rgba(255,255,255,0.55)' });
      text2d(ctx, m.text, VP.x + 34 + 58, y, { size: 16, family: SANS, color: 'rgba(255,255,255,0.9)' });
    }
    ctx.restore();
  }
}
