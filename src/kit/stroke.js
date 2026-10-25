// kit/stroke —— 便宜的"笔"。用分段变细的折线模拟毛笔的起收，
// 比 p5.brush 快两个数量级，适合需要上千笔的山水与皴法。

/** 沿折线画一条由 w0 收到 w1 的笔道 */
export function taper(pts, w0, w1, col, alpha = 255) {
  const n = pts.length - 1;
  if (n < 1) return;
  noFill();
  for (let i = 0; i < n; i++) {
    const k = i / n;
    const w = w0 + (w1 - w0) * k;
    stroke(col[0], col[1], col[2], alpha);
    strokeWeight(Math.max(0.35, w));
    line(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1]);
  }
}

/** 一条带轻微手抖的短线 */
export function flick(x, y, ang, len, w, col, alpha, jitter = 1.2) {
  const pts = [];
  const steps = 3;
  for (let i = 0; i <= steps; i++) {
    const k = i / steps;
    pts.push([
      x + Math.cos(ang) * len * k + (Math.random() - 0.5) * jitter,
      y + Math.sin(ang) * len * k + (Math.random() - 0.5) * jitter,
    ]);
  }
  taper(pts, w, w * 0.25, col, alpha);
}
