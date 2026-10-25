// camera —— 长卷上的取景窗。世界单位 → 像素。
import { PANEL_W, RIDER_AT } from '../beat/timeline.js';

export const W = 1920;
export const H = 1080;
export const GROUND = 700;
export const APERTURE_W = 1000;
export const APERTURE_H = (APERTURE_W * H) / W;

/**
 * 长卷模型：所有版块首尾相接，镜头一直往右走。
 * 骑手固定在画面宽度的 focusAt 处；镜头左边缘 = 骑手世界坐标 − focusAt × 取景宽。
 */
export function stripCam(riderWorld, o = {}) {
  const width = o.aperture ?? APERTURE_W;
  const height = (width * H) / W;
  const focusAt = o.focusAt ?? RIDER_AT;
  const left = riderWorld - focusAt * width;
  const groundAt = o.groundAt ?? 0.715;
  const top = GROUND - groundAt * height + (o.tilt ?? 0);
  const s = W / width;
  return {
    width, height, left, top, s, focusAt,
    cx: left + width / 2,
    cy: top + height / 2,
    right: left + width,
    bottom: top + height,
  };
}

export function applyCam(cam) {
  translate(W / 2, H / 2);
  scale(cam.s);
  translate(-cam.cx, -cam.cy);
}

/** 骑手在第 k 段上的世界坐标 */
export const riderWorldAt = (k, p) => k * PANEL_W + PANEL_W * p;

/** 第 k 段左接缝——也就是骑手在第 k 段起点所在的位置 */
export const seamWorld = (k) => k * PANEL_W;
