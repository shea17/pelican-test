// Intro —— 一本正经地胡说。纸张、素描插图、两条字幕。
import { paperTexture, vignette2d } from '../kit/paper.js';
import { SERIF, SANS, text2d } from '../kit/type.js';
import { pose } from '../rig/rig.js';
import { drawRig } from '../rig/draw.js';
import { E, clamp, hexToRgb } from '../kit/core.js';
import { W, H } from '../main/camera.js';

const SK = { x: 1408, y: 96, w: 392, h: 296 };

export default {
  id: 'intro',
  draw(g) {
    const { t } = g;
    // 纸张
    image(paperTexture(), 0, 0, W, H);

    // 角上的素描插图：只有墨线，没有填色
    const k = clamp((t - 0.7) / 0.8);
    if (k > 0) {
      push();
      const a = E.outCubic(k);
      // 框
      noFill();
      stroke(90, 76, 58, 150 * a);
      strokeWeight(2);
      rect(SK.x, SK.y, SK.w, SK.h);
      stroke(90, 76, 58, 70 * a);
      strokeWeight(1);
      rect(SK.x + 10, SK.y + 10, SK.w - 20, SK.h - 20);

      // 画
      translate(SK.x + SK.w * 0.5, SK.y + SK.h - 26);
      const s = Math.min((SK.w - 64) / 224, (SK.h - 46) / 258);
      scale(s);
      const pz = pose(1.2, { dist: 10 });
      // 素描：先用纸色粗描一遍压掉内部线，再细描
      drawRig(pz, {
        ink: [86, 70, 52],
        body: [243, 237, 223],
        bodyDark: [231, 224, 206],
        bike: [86, 70, 52],
        leg: [86, 70, 52],
        legFar: [166, 154, 132],
        lw: 1.9,
      });
      pop();
    }
  },

  overlay(ctx, t) {
    // 图注
    const kc = clamp((t - 1.15) / 0.5);
    if (kc > 0) {
      text2d(ctx, '图一　鹈鹕骑行图（摹本）', SK.x + SK.w / 2, SK.y + SK.h + 34, {
        size: 21, family: SERIF, color: '#5b4c3a', align: 'center', alpha: kc * 0.9, tracking: 1,
      });
    }

    // 字幕一
    const s1 = clamp((t - 3.18) / 0.34);
    if (s1 > 0) {
      text2d(ctx, '人类自古以来就痴迷于画鹈鹕骑自行车。', W / 2, 648, {
        size: 44, family: SERIF, color: '#241f19', align: 'center', alpha: s1, tracking: 2,
      });
    }
    // 字幕二：在 4.0 s 的强拍上砸下来
    const s2 = clamp((t - 4.0) / 0.1);
    if (s2 > 0) {
      text2d(ctx, '——早在自行车被发明之前。', W / 2, 716, {
        size: 44, family: SERIF, color: '#241f19', align: 'center', alpha: s2, tracking: 2,
      });
    }
    // 出处
    const s3 = clamp((t - 4.5) / 0.4);
    if (s3 > 0) {
      text2d(ctx, '——《鹈鹕骑行艺术通史》，卷一', W / 2, 786, {
        size: 19, family: SERIF, color: '#6b5c46', align: 'center', alpha: s3 * 0.85, tracking: 1,
      });
    }

    vignette2d(ctx, W, H, 0.24);
  },
};
