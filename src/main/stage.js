// stage —— 长卷调度。二十段首尾相接，镜头一直往右走，接缝扫过画面时换画风。
import { W, H, stripCam, applyCam, seamWorld } from './camera.js';
import * as TL from '../beat/timeline.js';
import { clamp, E, lerp, hexToRgb } from '../kit/core.js';
import { SERIF, SANS, text2d } from '../kit/type.js';
import INTRO from '../scenes/intro.js';
import OUTRO from '../scenes/outro.js';

export const PANELS = [];
let UI = null;

export function initOverlay(ctx, snapCtx) {
  UI = { ctx, snapCtx };
}

const SEAM_HALF = 10;        // 接缝那一条的半个宽度（世界单位）≈ 38 px

/** 画第 idx 段。cam 是全局的，所以要把世界原点平移到该段的起点。 */
function drawPanel(idx, g, cam) {
  // 每一段都画同一只骑手：世界坐标相同、姿势相同，只是笔法不同。
  // 接缝扫过去时，左半是旧笔法、右半是新笔法，缝正好从鸟身上划过。
  const local = g.riderWorld - idx * TL.PANEL_W;
  const near = local > -300 && local < TL.PANEL_W + 300;
  push();
  applyCam(cam);
  translate(idx * TL.PANEL_W, 0);
  PANELS[idx].draw({ ...g, hasRider: near, riderLocal: near ? local : null });
  pop();
}

function panelG(t, idx, p, cam, riderWorld, extra) {
  const sc = TL.scenes[idx];
  return {
    t, p, u: t - sc.t0, dist: riderWorld,
    cam, riderWorld,
    span: [cam.left - idx * TL.PANEL_W - 160, cam.right - idx * TL.PANEL_W + 160],
    ...extra,
  };
}

/** 接缝：一条装裱用的"隔水"，把两段分开 */
function drawSeam(ctx, x, s) {
  const half = SEAM_HALF * s;
  ctx.save();
  // 缝本身像刀口，两侧留一圈渐隐的影，换笔的瞬间才不像硬切
  for (let i = 7; i >= 0; i--) {
    const a = 0.028 * (1 - i / 8);
    ctx.fillStyle = `rgba(14,11,8,${a})`;
    ctx.fillRect(x - half - (i + 1) * 3, 0, 3, H);
    ctx.fillRect(x + half + i * 3, 0, 3, H);
  }
  const glow = 0.10;
  ctx.fillStyle = `rgba(14,11,8,${glow})`;
  ctx.fillRect(x - half - 6, 0, 6, H);
  ctx.fillRect(x + half, 0, 6, H);
  ctx.fillStyle = 'rgba(26,22,17,0.97)';
  ctx.fillRect(x - half, 0, half * 2, H);
  const edge = Math.max(1, 0.9 * s);
  ctx.fillStyle = 'rgba(198,176,132,0.5)';
  ctx.fillRect(x - half, 0, edge, H);
  ctx.fillRect(x + half - edge, 0, edge, H);
  ctx.restore();
}

function titleCard(ctx, sc, p, fade = 1) {
  const tin = clamp((p - 0.16) / 0.10);
  const tout = 1 - clamp((p - 0.60) / 0.12);
  const tt = Math.min(tin, tout);
  if (tt <= 0 || fade <= 0) return;
  const e = E.outCubic(tt) * fade;
  const card = sc.card || {};
  const bg = hexToRgb(card.bg ?? sc.pal[0]);
  const lum = 0.2126 * bg[0] + 0.7152 * bg[1] + 0.0722 * bg[2];
  const light = card.light ?? lum < 132;
  const col = light ? 'rgba(246,242,232,' : 'rgba(24,20,16,';
  const x = card.x ?? 112;
  const y = card.y ?? 906;
  const align = card.align ?? 'left';
  const size = card.size ?? 42;
  const tint = card.color;
  const tintA = (a) => (tint ? (tint.trim().endsWith(',') ? tint + a + ')' : tint) : null);

  ctx.save();
  ctx.globalAlpha = e;
  ctx.translate(0, (1 - e) * 14);

  if (card.panel) {
    const pa = card.panel;
    ctx.fillStyle = card.panelFill ?? 'rgba(232,224,202,0.94)';
    ctx.fillRect(pa.x, pa.y, pa.w, pa.h);
    ctx.strokeStyle = 'rgba(90,80,62,0.45)';
    ctx.lineWidth = 1;
    ctx.strokeRect(pa.x + 7, pa.y + 7, pa.w - 14, pa.h - 14);
  }

  if (card.plate) {
    const pw = card.plateW ?? 430;
    const px = align === 'right' ? x - pw + 20 : x - 26;
    const py = y - 100;
    const ph = 168;
    for (let i = 6; i >= 0; i--) {
      ctx.fillStyle = (card.plateColor ?? 'rgba(40,18,6,') + '0.055)';
      ctx.beginPath();
      ctx.roundRect(px - i * 7, py - i * 5, pw + i * 14, ph + i * 10, 10 + i * 4);
      ctx.fill();
    }
  }

  ctx.fillStyle = tint ? tintA(0.5) : col + '0.55)';
  ctx.fillRect(x, y - 72, 64 * e, 1.5);
  text2d(ctx, String(sc.num).padStart(2, '0'), x, y - 84, {
    size: 16, family: SANS, color: tint ? tintA(0.7) : col + '0.7)', tracking: 3, align,
  });
  text2d(ctx, sc.cn, x, y - 18, { size, family: SERIF, color: tint ? tintA(1) : col + '1)', tracking: 3, align });
  text2d(ctx, sc.en, x, y + 18, { size: size * 0.5, family: SANS, color: tint ? tintA(0.8) : col + '0.78)', tracking: 1.5, align });
  text2d(ctx, sc.era, x, y + 50, { size: size * 0.45, family: SANS, color: tint ? tintA(0.62) : col + '0.6)', tracking: 1.5, align });
  ctx.restore();
}

export function renderFrame(t) {
  resetMatrix();
  translate(-W / 2, -H / 2);
  background(0);
  const ctx = UI.ctx;
  ctx.clearRect(0, 0, W, H);

  if (t < TL.INTRO_END) {
    INTRO.draw({ t });
    INTRO.overlay(ctx, t);
    return;
  }
  if (t >= TL.OUTRO_START) {
    OUTRO.draw({ t });
    OUTRO.overlay(ctx, t);
    return;
  }

  const k = TL.sceneIndexAt(t);
  const sc = TL.scenes[k];
  const mod = PANELS[k];
  const p = clamp((t - sc.t0) / TL.PANEL_DUR);
  const riderWorld = k * TL.PANEL_W + TL.PANEL_W * p;

  // 过框时镜头轻轻推近一点点
  const punch = Math.max(Math.exp(-Math.pow(p / 0.09, 2)), Math.exp(-Math.pow((1 - p) / 0.09, 2)));
  const camOpt = mod.cam ? mod.cam(p, TL.PANEL_W * p) : {};
  const aperture = (camOpt.aperture ?? 1000) * (1 - 0.055 * punch);
  const cam = stripCam(riderWorld, { ...camOpt, aperture });

  // 画面里有没有接缝？骑手永远在第 k 段；接缝可能在左（k-1|k）或在右（k|k+1）
  const sL = (seamWorld(k) - cam.left) * cam.s;
  const sR = (seamWorld(k + 1) - cam.left) * cam.s;

  let seamX = null;
  let riderOnRight = true;
  let otherIdx = null;

  if (k > 0 && sL > 0.5 && sL < W - 0.5) {
    seamX = sL;
    riderOnRight = true;
    otherIdx = k - 1;
  } else if (k < TL.SCENE_COUNT - 1 && sR > 0.5 && sR < W - 0.5) {
    seamX = sR;
    riderOnRight = false;
    otherIdx = k + 1;
  }

  if (seamX == null) {
    drawPanel(k, panelG(t, k, p, cam, riderWorld), cam);
  } else {
    const pOther = otherIdx < k ? p + 1 : p - 1;
    drawPanel(otherIdx, panelG(t, otherIdx, pOther, cam, riderWorld), cam);

    UI.snapCtx.clearRect(0, 0, W, H);
    UI.snapCtx.drawImage(drawingContext.canvas, 0, 0, W, H);

    drawPanel(k, panelG(t, k, p, cam, riderWorld), cam);

    ctx.drawImage(UI.snapCtx.canvas, 0, 0);
    if (riderOnRight) ctx.clearRect(seamX, 0, W - seamX, H);
    else ctx.clearRect(0, 0, seamX, H);

    drawSeam(ctx, seamX, cam.s);
  }

  if (mod.overlay) mod.overlay(ctx, panelG(t, k, p, cam, riderWorld), 1);
  titleCard(ctx, { ...sc, card: mod.card }, p, 1);
}
