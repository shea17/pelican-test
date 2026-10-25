// 05 宋代山水（约 1000，致敬《溪山行旅图》）
// 巨峰当道，人小如豆。镜头先看山，再摇下去把鹈鹕找出来。
import { GROUND } from '../main/camera.js';
import { silkTexture } from '../kit/texture.js';
import { pose } from '../rig/rig.js';
import { perf } from '../kit/act.js';
import { drawRig } from '../rig/draw.js';
import { taper } from '../kit/stroke.js';
import { clamp, E, rng, noise1, lerp, bez } from '../kit/core.js';

const INK = [42, 39, 33];
const INK_SOFT = [104, 98, 86];
const SILK = [223, 213, 190];

export default {
  id: 'song',
  card: {
    x: 1846, y: 158, color: 'rgba(38,34,28,', align: 'right', size: 34,
    panel: { x: 1490, y: 50, w: 390, h: 200 },
    panelFill: 'rgba(233,225,204,0.95)',
    seal: true,
  },

  cam(p) {
    const kZoom = clamp((p - 0.10) / 0.66);
    const kTilt = clamp((p - 0.04) / 0.46);
    return {
      // 骑手必须 1:1，所以推近的上限由别把鸟头切掉决定：
      // 取景 620 时画幅高 348，地面落在 71.5% 处，再往上摇 70 就刚好装下整只鸟
      // 骑手 1:1 之后，推近只能到 940：再近就只剩一片没有皴法的灰坡
      aperture: lerp(1160, 940, E.inOutCubic(kZoom)),
      // 画幅上沿不能高过 286——那是所有版块开始铺底的地方，越过去就是黑边
      tilt: lerp(-14, 0, E.inOutCubic(kTilt)),
    };
  },

  draw(g) {
    const { t, dist, span, hasRider, riderLocal } = g;
    noStroke();
    background(SILK[0], SILK[1], SILK[2]);
    for (let x0 = span[0]; x0 < span[1]; x0 += 1200) image(silkTexture(), x0, 100, 1200, 920);

    // 远山：一道连绵的淡墨
    const far = massif(1800, 690, [[220, 240, 320], [1180, 350, 380], [1620, 200, 260]], 11);
    fillRows(far, [152, 148, 134], [198, 190, 172], 0.5, 0.2);
    mist(0, 560, 1800, 40, 10);

    // 主山：一条横贯整段的山体，主峰在 860
    const ridge = massif(1800, 706, [[262, 290, 330], [860, 430, 400], [1500, 330, 340]], 3);
    fillRows(ridge, [38, 35, 30], [104, 97, 84], 0.96, 0.58);
    ridgeShadow(ridge);
    // axeFacets 暂时停用：它会在画面上留下漂浮的斜笔
    cun(ridge, 240, 9, 860);
    cun(ridge, 150, 33, 1180);
    cun(ridge, 110, 51, 520);

    // 云气：把山腰切开
    mist(80, 574, 900, 30, 3);
    mist(1000, 610, 780, 26, 7);

    // 近景石岸
    nearRocks(span);

    // 山脚的小树与竹：给巨峰做尺度参照
    pines(430, 704, 2, 61);
    pines(700, 708, 2, 67);
    pines(1120, 706, 2, 73);
    pines(1380, 702, 1, 77);

    // 一道瀑布：从主峰右侧垂下来
    waterfall(1010, 300, 210, 6);

    // 骑手
    if (hasRider) {
      // 表演：镜头推近之后，鹈鹕抬起头看那座自己永远骑不到顶的峰
      const A = perf(g.p, {
        pitch: [[0.46, 0], [0.62, -0.42], [0.80, -0.38], [0.92, 0]],
        lift: [[0.46, 0], [0.62, 7], [0.80, 7], [0.92, 0]],
      });
      push();
      translate(riderLocal, GROUND);
      drawRig(pose(t, { dist, headPitch: A.pitch, neckLift: A.lift }), {
        ink: [46, 42, 36],
      body: [240, 234, 220],
      bodyDark: [178, 174, 160],
      bike: [46, 42, 36],
      leg: [80, 72, 60],
      legFar: [152, 146, 132],
      beak: [168, 126, 76],
      pouch: [186, 150, 100],
      lw: 2.2,
      });
      pop();
    }

    // 前景：一枝探进画面的松枝。它比山走得快，是这块唯一的"近"。
    fgBranch(span, g.p);

    mist(span[0], 668, span[1] - span[0], 14, 8);
  },
};


/** 连绵山体：多个峰叠同一轮廓，取最高处 */
function massif(width, baseY, peaks, seed) {
  const pts = [];
  const N = 130;
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    const x = u * width;
    let prof = 0;
    for (const [cx, h, hw] of peaks) {
      const d = Math.abs(x - cx) / hw;
      prof = Math.max(prof, h * Math.pow(Math.max(0, 1 - d), 1.5));
    }
    const jag = noise1(u * 22 + seed * 3.1, seed) * 0.07 + noise1(u * 62 + seed, seed + 7) * 0.02;
    const raw = (prof / 478) * (0.93 + jag);
    const stepped = Math.round(raw * 30) / 30;
    pts.push([x, baseY - 478 * lerp(raw, stepped, 0.4)]);
  }
  pts.push([width + 30, baseY + 90]);
  pts.push([-30, baseY + 90]);
  return pts;
}

// ---------- 基础：多边形扫描线 ----------

/** 返回多边形每一行的 [x0, x1] */
function scanRows(pts, step = 1) {
  const ys = pts.map((p) => p[1]);
  const top = Math.min(...ys), bot = Math.max(...ys);
  const out = [];
  for (let y = top; y <= bot; y += step) {
    const xs = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1];
      if ((a[1] <= y && b[1] > y) || (b[1] <= y && a[1] > y)) {
        xs.push(a[0] + ((y - a[1]) / (b[1] - a[1])) * (b[0] - a[0]));
      }
    }
    if (xs.length >= 2) {
      xs.sort((m, n) => m - n);
      for (let i = 0; i + 1 < xs.length; i += 2) out.push([y, xs[i], xs[i + 1]]);
    }
  }
  return out;
}

/** 竖直方向插值的实心填充 —— 既有轮廓又有浓淡 */
function fillRows(pts, topCol, botCol, aTop, aBot) {
  const ys = pts.map((p) => p[1]);
  const top = Math.min(...ys), bot = Math.max(...ys);
  noStroke();
  for (const [y, x0, x1] of scanRows(pts, 2)) {
    const k = (y - top) / Math.max(1, bot - top);
    const c0 = lerp(topCol[0], botCol[0], k);
    const c1 = lerp(topCol[1], botCol[1], k);
    const c2 = lerp(topCol[2], botCol[2], k);
    fill(c0, c1, c2, lerp(aTop, aBot, k) * 255);
    rect(x0, y, x1 - x0, 2.4);
  }
}

function peakRidge(cx, baseY, halfW, H, seed) {
  const pts = [];
  const N = 72;
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    const x = cx - halfW + u * halfW * 2;
    const d = Math.abs((x - cx) / halfW);
    let prof = Math.pow(Math.max(0, 1 - d), 1.5);
    const d2 = Math.abs((x - (cx + halfW * 0.44)) / (halfW * 0.46));
    prof = Math.max(prof, 0.5 * Math.pow(Math.max(0, 1 - d2), 1.35));
    const d3 = Math.abs((x - (cx - halfW * 0.5)) / (halfW * 0.4));
    prof = Math.max(prof, 0.34 * Math.pow(Math.max(0, 1 - d3), 1.4));
    const jag = noise1(u * 20 + seed * 3.1, seed) * 0.075 + noise1(u * 56 + seed, seed + 7) * 0.022;
    // 台阶感：把高度量化一点点
    const raw = prof * (0.92 + jag);
    const stepped = Math.round(raw * 26) / 26;
    pts.push([x, baseY - H * lerp(raw, stepped, 0.35)]);
  }
  pts.push([cx + halfW + 30, baseY + 80]);
  pts.push([cx - halfW - 30, baseY + 80]);
  return pts;
}

/** 山顶下方压一层重墨，模拟背光面 */
function ridgeShadow(pts) {
  const rows = scanRows(pts, 3);
  noStroke();
  for (let i = 0; i < rows.length; i++) {
    const [y, x0, x1] = rows[i];
    const k = i / rows.length;
    if (k > 0.55) break;
    const inset = (1 - k / 0.55) * 0.18;
    fill(INK[0], INK[1], INK[2], 150 * (1 - k / 0.55));
    rect(x1 - (x1 - x0) * inset - (x1 - x0) * 0.34, y, (x1 - x0) * 0.34 + (x1 - x0) * inset, 3.2);
  }
}

/** 轮廓线：用手抖的短笔把边"咬"毛 */
function edgeDark(pts) {
  const r = rng(31);
  for (let i = 1; i < pts.length - 2; i += 2) {
    const [x, y] = pts[i];
    taper([[x, y], [x + (r() - 0.5) * 10, y + 16 + r() * 30]], 3.2, 0.9, INK, 90 + r() * 60);
  }
}

function axeFacets(pts, n, seed) {
  const r = rng(seed * 97 + 13);
  const ys = pts.map((q) => q[1]);
  const top = Math.min(...ys), bot = Math.max(...ys);
  const rows = scanRows(pts, 6);
  for (let i = 0; i < n; i++) {
    const k = Math.pow(r(), 0.75);
    const y = lerp(top + 30, bot - 40, k);
    const near = rows.filter((row) => Math.abs(row[0] - y) < 20);
    if (!near.length) continue;
    const row = near[0];
    const x0 = lerp(row[1], row[2], r());
    const len = 24 + r() * 70;
    const ang = 1.25 + (r() - 0.5) * 0.6;
    taper(
      [[x0, y], [x0 + Math.cos(ang) * len * 0.5, y + Math.sin(ang) * len * 0.5], [x0 + Math.cos(ang) * len, y + Math.sin(ang) * len]],
      5 + r() * 7, 1.0, INK, 26 + r() * 30
    );
  }
}

/** 披麻皴：沿轮廓向下的细长笔 */
function cun(pts, count, seed, cx) {
  const r = rng(seed);
  const rows = scanRows(pts, 4).filter((_, i, arr) => i > arr.length * 0.03 && i < arr.length * 0.8);
  for (let i = 0; i < count; i++) {
    const row = rows[Math.floor(r() * rows.length)];
    if (!row) continue;
    const [y, x0, x1] = row;
    // 焦点要夹进这一行里，否则笔会落到山外
    const f = Math.min(Math.max(cx ?? (x0 + x1) / 2, x0), x1);
    const x = cx == null ? lerp(x0, x1, r()) : lerp(f, x1, Math.pow(r(), 0.75));
    const len = 14 + r() * 30;
    const drift = (r() - 0.5) * 20;
    taper(
      [[x, y], [x + drift * 0.5, y + len * 0.5], [x + drift, y + len]],
      2.2 + r() * 2.0, 0.5, INK, 16 + r() * 26
    );
  }
}

function mist(x, y, w, h, seed) {
  noStroke();
  const r = rng(seed);
  for (let i = 0; i < 11; i++) {
    fill(SILK[0], SILK[1], SILK[2], 12 + r() * 20);
    ellipse(x + r() * w, y + (r() - 0.5) * h, w * (0.35 + r() * 0.7), h * (0.5 + r() * 1.4));
  }
}

function nearRocks(span) {
  const r = rng(77);
  noStroke();
  const pts = [[span[0], 1000], [span[0], 796]];
  for (let x = span[0]; x <= span[1]; x += 34) {
    pts.push([x, 812 - Math.abs(noise1(x * 0.004, 5)) * 40 - 8]);
  }
  pts.push([span[1], 1000]);
  fillRows(pts, [82, 78, 68], [26, 24, 20], 0.55, 0.95);
  for (let i = 0; i < 70; i++) {
    const x = span[0] + r() * (span[1] - span[0]);
    const y = 816 + r() * 62;
    taper([[x, y], [x + 10 + r() * 20, y - 14 - r() * 24]], 3.0, 0.7, INK, 34 + r() * 54);
  }
}

function pines(x, y, n, seed) {
  const r = rng(seed);
  for (let i = 0; i < n; i++) {
    const bx = x + (r() - 0.5) * 70;
    const by = y - i * 4;
    const h = 40 + r() * 26;
    // 干
    taper([[bx, by], [bx + (r() - 0.5) * 6, by - h * 0.55], [bx + (r() - 0.5) * 10, by - h]], 3.0, 1.0, INK, 220);
    // 三层枝叶：横向短笔 + 一撮暗点
    for (let k = 0; k < 3; k++) {
      const cy = by - h * (0.5 + k * 0.2);
      const cw = 12 + r() * 12;
      for (let j = 0; j < 5; j++) {
        const dx = (j / 4 - 0.5) * cw * 1.6;
        taper([[bx + dx * 0.3, cy], [bx + dx, cy - 2 - r() * 4]], 1.6, 0.5, INK, 170 + r() * 60);
      }
      noStroke();
      fill(INK[0], INK[1], INK[2], 120 + r() * 60);
      ellipse(bx + (r() - 0.5) * 6, cy - 4, cw * 0.9, 5 + r() * 3);
    }
  }
}

/** 一道从山脊垂下的瀑布 */
function waterfall(x, y, len, w) {
  const r = rng(19);
  noStroke();
  for (let i = 0; i < 26; i++) {
    const k = i / 26;
    fill(SILK[0], SILK[1], SILK[2], 120 + r() * 90);
    rect(x + (r() - 0.5) * 3 - w / 2, y + len * k, w * (0.7 + r() * 0.6), len / 26 + 1.2);
  }
  // 落水处的雾
  for (let i = 0; i < 8; i++) {
    fill(SILK[0], SILK[1], SILK[2], 30);
    ellipse(x + (r() - 0.5) * 26, y + len + (r() - 0.5) * 16, 24 + r() * 40, 12 + r() * 16);
  }
}

/** 前景松枝：从画面上方探进来，比山走得快得多，用来压住构图的一角 */
function fgBranch(span, p) {
  // 前景比镜头走得快：一块之内从右边扫进来，从左边扫出去
  const bx = 1000 - 2400 * p;
  {
    if (bx < span[0] - 760 || bx > span[1] + 760) return;
    push();
    // 主枝：从画面外斜插进来
    const pts = bez([bx, 310], [bx + 110, 408], [bx + 240, 446], [bx + 400, 396], 14);
    taper(pts, 9, 2.2, INK, 232);
    // 三根侧枝
    const side = [[0.30, -52], [0.54, 82], [0.76, -30]];
    for (let i = 0; i < side.length; i++) {
      const [u, dy] = side[i];
      const at = pts[Math.floor(u * (pts.length - 1))];
      const tip = [at[0] + 46 + i * 10, at[1] + dy];
      taper([at, [at[0] + 22, at[1] + dy * 0.7], tip], 4.4, 1.2, INK, 226);
      // 针叶：一簇一簇的短笔
      for (let j = 0; j < 16; j++) {
        const a = -1.9 + (j / 16) * 2.9;
        const r0 = 8 + (j % 3) * 4;
        const px = tip[0] + Math.cos(a) * r0 * 0.5;
        const py = tip[1] + Math.sin(a) * r0 * 0.5;
        taper([[px, py], [px + Math.cos(a) * 16, py + Math.sin(a) * 16]], 1.9, 0.4, INK, 210);
      }
    }
    pop();
  }
}
