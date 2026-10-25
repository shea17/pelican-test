// kit/type —— 2D 覆盖层上的字。中文靠系统字体栈，不打包字体文件。
export const SERIF = '"Noto Serif SC","Source Han Serif SC","Songti SC",SimSun,serif';
export const SANS = '"Noto Sans SC","Source Han Sans SC","PingFang SC",system-ui,sans-serif';
export const MONO = '"JetBrains Mono",Consolas,"Courier New",monospace';

export function text2d(ctx, str, x, y, o = {}) {
  const size = o.size ?? 32;
  ctx.save();
  if (o.alpha != null) ctx.globalAlpha = o.alpha;
  ctx.font = `${o.weight ?? 400} ${size}px ${o.family ?? SERIF}`;
  ctx.fillStyle = o.color ?? '#1d1a16';
  ctx.textAlign = o.align ?? 'left';
  ctx.textBaseline = o.baseline ?? 'alphabetic';
  if ('letterSpacing' in ctx && o.tracking != null) ctx.letterSpacing = `${o.tracking}px`;
  if (o.shadow) {
    ctx.shadowColor = o.shadow;
    ctx.shadowBlur = o.shadowBlur ?? 18;
  }
  ctx.fillText(str, x, y);
  ctx.restore();
}

/** 一段文字的入场：淡入 + 轻微上浮 */
export function reveal(ctx, str, x, y, tt, o = {}) {
  const k = Math.max(0, Math.min(1, tt));
  if (k <= 0) return;
  const e = 1 - Math.pow(1 - k, 3);
  text2d(ctx, str, x, y + (1 - e) * (o.rise ?? 10), { ...o, alpha: (o.alpha ?? 1) * e });
}
