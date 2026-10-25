// kit/paper —— 纸张质感，生成一次后缓存成 p5.Graphics
let tex = null;

export function paperTexture() {
  if (tex) return tex;
  const g = createGraphics(1920, 1080);
  g.pixelDensity(1);

  // 底色：暖白略带黄
  g.background(243, 237, 223);

  // 纤维
  g.noFill();
  let seed = 7;
  const rnd = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
  for (let i = 0; i < 2600; i++) {
    const x = rnd() * 1920, y = rnd() * 1080;
    const len = 6 + rnd() * 26;
    const a = (rnd() - 0.5) * 0.5;
    g.stroke(200 + rnd() * 30, 190 + rnd() * 28, 168 + rnd() * 26, 26 + rnd() * 34);
    g.strokeWeight(0.5 + rnd() * 0.9);
    g.line(x, y, x + Math.cos(a) * len, y + Math.sin(a) * len);
  }
  // 斑点
  g.noStroke();
  for (let i = 0; i < 900; i++) {
    g.fill(150 + rnd() * 40, 138 + rnd() * 36, 112 + rnd() * 30, 10 + rnd() * 26);
    g.circle(rnd() * 1920, rnd() * 1080, 0.8 + rnd() * 2.6);
  }
  // 四边压暗
  for (let i = 0; i < 90; i++) {
    const a = 0.055 * (1 - i / 90) * 1.6;
    g.noFill();
    g.stroke(120, 104, 76, a * 255);
    g.strokeWeight(2);
    g.rect(i * 1.1, i * 0.9, 1920 - i * 2.2, 1080 - i * 1.8);
  }
  tex = g;
  return tex;
}

/** 覆盖层用的暗角（画在最上面） */
export function vignette2d(ctx, w, h, strength = 0.5) {
  const g = ctx.createRadialGradient(w / 2, h / 2, h * 0.28, w / 2, h / 2, h * 0.92);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, `rgba(0,0,0,${strength})`);
  ctx.save();
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}
