// act —— 表演编排。每个版块用一条条"轨道"描述自己的动作，
// 时间轴是版块进度 p（0..1），不是绝对秒数——所以版块挪位置不用改动作。
import { clamp, lerp, E } from './core.js';

const EASES = {
  linear: (k) => k,
  inOut: E.inOutCubic ?? ((k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2)),
  out: E.outCubic ?? ((k) => 1 - Math.pow(1 - k, 3)),
  in: E.inCubic ?? ((k) => k * k * k),
  back: (k) => {
    const c = 1.9;
    return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2);
  },
  snap: (k) => Math.pow(k, 0.42),
};

/**
 * 关键帧轨道：keys = [[p, value], ...]，段内用 ease 过渡。
 * 两端之外保持端点值（不外插）。
 */
export function curve(p, keys, ease = 'inOut') {
  const f = EASES[ease] ?? EASES.inOut;
  if (p <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (p <= keys[i][0]) {
      const [p0, v0] = keys[i - 1];
      const [p1, v1] = keys[i];
      const k = (p - p0) / Math.max(1e-6, p1 - p0);
      return lerp(v0, v1, f(clamp(k, 0, 1)));
    }
  }
  return keys[keys.length - 1][1];
}

/** 一次把整组轨道算出来：perf(p, { gape: [[...]], headPitch: [...] }) */
export function perf(p, spec) {
  const out = {};
  for (const k in spec) {
    const v = spec[k];
    out[k] = Array.isArray(v[0]) ? curve(p, v, v.ease) : v;
  }
  return out;
}

/** 高斯脉冲：在 c 附近隆起，宽 w（p 单位） */
export const pulse = (p, c, w = 0.06) => Math.exp(-Math.pow((p - c) / w, 2));

