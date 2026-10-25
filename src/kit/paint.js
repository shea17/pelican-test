// kit/paint —— 各版块共用的一把便宜画笔。
// 只做几何与上色，不含任何风格判断；风格留在各自的场景文件里。
import { rng, bez } from './core.js';

export function fillPoly(pts, col, a = 255) {
  noStroke();
  fill(col[0], col[1], col[2], a);
  beginShape();
  for (const q of pts) vertex(q[0], q[1]);
  endShape(CLOSE);
}

export function strokePoly(pts, col, w = 2, a = 255, close = true) {
  noFill();
  stroke(col[0], col[1], col[2], a);
  strokeWeight(w);
  beginShape();
  for (const q of pts) vertex(q[0], q[1]);
  if (close) endShape(CLOSE);
  else endShape();
}

/** 竖向渐变（用横条堆，WEBGL 下比 shader 便宜且稳） */
export function vGrad(x, y, w, h, c0, c1, steps = 40) {
  noStroke();
  for (let i = 0; i < steps; i++) {
    const k = i / (steps - 1);
    fill(c0[0] + (c1[0] - c0[0]) * k, c0[1] + (c1[1] - c0[1]) * k, c0[2] + (c1[2] - c0[2]) * k);
    rect(x, y + (h * i) / steps, w, h / steps + 1.2);
  }
}

/** 点阵 / 网点 */
export function dots(x, y, w, h, gap, r0, col, a = 255, seed = 1, jitter = 0) {
  const r = rng(seed);
  noStroke();
  fill(col[0], col[1], col[2], a);
  for (let yy = y; yy < y + h; yy += gap) {
    for (let xx = x; xx < x + w; xx += gap) {
      const px = xx + (jitter ? (r() - 0.5) * jitter : 0);
      const py = yy + (jitter ? (r() - 0.5) * jitter : 0);
      circle(px, py, r0 * 2);
    }
  }
}

/** 颗粒 / 斑点（石面、胶片、纸纹都用它） */
export function speckle(x, y, w, h, n, col, a = 255, seed = 1, rmin = 0.6, rmax = 2.2) {
  const r = rng(seed);
  noStroke();
  for (let i = 0; i < n; i++) {
    const al = a * (0.35 + r() * 0.65);
    fill(col[0], col[1], col[2], al);
    const rad = rmin + r() * (rmax - rmin);
    circle(x + r() * w, y + r() * h, rad * 2);
  }
}

/** 不规则圆：手绘感的封闭形 */
export function blob(cx, cy, rx, ry, n = 26, seed = 1, amp = 0.12) {
  const r = rng(seed);
  const pts = [];
  const ph = [r() * 6.28, r() * 6.28, r() * 6.28];
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2;
    const k = 1 + amp * (Math.sin(t * 2 + ph[0]) * 0.5 + Math.sin(t * 3 + ph[1]) * 0.3 + Math.sin(t * 5 + ph[2]) * 0.2);
    pts.push([cx + Math.cos(t) * rx * k, cy + Math.sin(t) * ry * k]);
  }
  return pts;
}

export function arcPts(cx, cy, r, a0, a1, n = 24) {
  const out = [];
  for (let i = 0; i <= n; i++) {
    const a = a0 + ((a1 - a0) * i) / n;
    out.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  return out;
}

/** 五角星（埃及天花、星夜都用得上） */
export function starPts(cx, cy, r, n = 5, inner = 0.42, rot = -Math.PI / 2) {
  const pts = [];
  for (let i = 0; i < n * 2; i++) {
    const a = rot + (i * Math.PI) / n;
    const rr = i % 2 ? r * inner : r;
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
  }
  return pts;
}

/** 把一段折线按"上缘/下缘"闭合成带（比 ribbon 更适合有尖角的图案） */
export function band(pts, widths) {
  const up = [], dn = [];
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    const q = pts[Math.min(i + 1, pts.length - 1)];
    const o = pts[Math.max(i - 1, 0)];
    let dx = q[0] - o[0], dy = q[1] - o[1];
    const d = Math.hypot(dx, dy) || 1;
    dx /= d; dy /= d;
    const w = (widths[Math.min(i, widths.length - 1)] ?? 6) * 0.5;
    up.push([p[0] - dy * w, p[1] + dx * w]);
    dn.push([p[0] + dy * w, p[1] - dx * w]);
  }
  return up.concat(dn.reverse());
}

export { bez };
