// rig/draw —— 把骨骼画成肉。
// 造型用"两遍法"：先描边填色，再纯填色盖一遍，内部接缝消失，只留外轮廓。
// 各风格只换这里的笔法，骨骼与动作完全共用。
import { frameTubes } from './rig.js';

export function poly(pts, close = true) {
  beginShape();
  for (let i = 0; i < pts.length; i++) vertex(pts[i][0], pts[i][1]);
  if (close) endShape(CLOSE);
  else endShape();
}

export function limb(a, b, w) {
  if (w != null) strokeWeight(w);
  line(a[0], a[1], b[0], b[1]);
}

export function wheel(c, r, angle, o = {}) {
  const spokes = o.spokes ?? 9;
  push();
  noFill();
  stroke(...(o.tyre ?? [38, 33, 28]));
  strokeWeight(o.tyreW ?? 3.0);
  circle(c[0], c[1], r * 2);
  stroke(...(o.rim ?? [116, 106, 94]));
  strokeWeight(o.rimW ?? 1.0);
  circle(c[0], c[1], r * 2 - (o.tyreW ?? 3.0) * 2.3);
  stroke(...(o.spoke ?? [100, 92, 82]));
  strokeWeight(o.spokeW ?? 0.6);
  for (let i = 0; i < spokes; i++) {
    const a = angle + (i * Math.PI * 2) / spokes;
    line(c[0], c[1], c[0] + Math.cos(a) * (r - 3), c[1] + Math.sin(a) * (r - 3));
  }
  noStroke();
  fill(...(o.hub ?? [62, 56, 50]));
  circle(c[0], c[1], 5.5);
  pop();
}

/** 两遍法画一组形状的并集轮廓 */
function union(shapes, fillC, inkC, lw) {
  stroke(...inkC);
  strokeWeight(lw);
  fill(...fillC);
  for (const s of shapes) poly(s);
  noStroke();
  fill(...fillC);
  for (const s of shapes) poly(s);
}

/** 剪影适配器：整只鸟与车都是同一块颜料，内部只留最少的线。
 *  给岩画、拓片、皮影这类"单色平面"的版块用。 */
export function drawRigSilhouette(pz, o = {}) {
  const fillC = o.fill ?? [126, 52, 24];
  const darkC = o.dark ?? [82, 30, 12];
  const B = pz.bike, D = pz.bird;
  const bb = B.crank.c;
  const AL = o.alpha ?? 0.94;

  push();

  // 车轮：外圈加重，辐条细
  for (const w of [B.rear, B.front]) {
    noFill();
    stroke(darkC[0], darkC[1], darkC[2], 255 * AL);
    strokeWeight(o.tyreW ?? 3.4);
    circle(w[0], w[1], B.r * 2);
    stroke(darkC[0], darkC[1], darkC[2], 190 * AL);
    strokeWeight(0.9);
    for (let i = 0; i < (o.spokes ?? 9); i++) {
      const a = pz.wheelAngle + (i * Math.PI * 2) / (o.spokes ?? 9);
      line(w[0], w[1], w[0] + Math.cos(a) * (B.r - 3), w[1] + Math.sin(a) * (B.r - 3));
    }
  }

  // 车架
  stroke(darkC[0], darkC[1], darkC[2], 255 * AL);
  noFill();
  for (const [a, b, w] of frameTubes(pz)) limb(a, b, (o.lw ?? 2.1) * 1.55 * (w / 5));

  // 牙盘与曲柄
  strokeWeight((o.lw ?? 2.1) * 0.8);
  circle(bb[0], bb[1], B.chainring * 2);
  strokeWeight((o.lw ?? 2.1) * 1.4);
  limb(bb, B.pedalFar);
  limb(bb, B.pedalNear);

  // 腿
  stroke(fillC[0], fillC[1], fillC[2], 255 * AL);
  for (const L of D.legs) {
    strokeWeight((o.lw ?? 2.1) * (L.far ? 1.9 : 2.5));
    limb(L.hip, L.knee);
    limb(L.knee, L.ankle);
  }

  // 展开的翼：同一块颜料，画在身体后面
  if (D.wingFan) {
    noStroke();
    fill(darkC[0], darkC[1], darkC[2], 210 * AL);
    poly(D.wingFan);
  }

  // 身体 / 尾 / 脖 / 头 —— 一块实心
  noStroke();
  fill(fillC[0], fillC[1], fillC[2], 255 * AL);
  poly(D.tailPts);
  poly(D.body);
  poly(D.neck);
  poly(D.headShape);

  // 张开的口：先填一道暗，再盖上喙与喉囊
  if (D.mouth) {
    noStroke();
    fill(darkC[0], darkC[1], darkC[2], 235 * AL);
    poly(D.mouth);
  }

  // 喉囊与喙同色，靠轮廓和一条暗线分开
  fill(fillC[0], fillC[1], fillC[2], 255 * AL);
  poly(D.pouch);
  poly(D.beakUpper);
  stroke(darkC[0], darkC[1], darkC[2], 150 * AL);
  strokeWeight((o.lw ?? 2.1) * 0.7);
  noFill();
  poly(D.beakUpper, false);
  stroke(darkC[0], darkC[1], darkC[2], 105 * AL);
  strokeWeight((o.lw ?? 2.1) * 0.55);
  poly(D.pouch, false);

  // 翼：同一颜料，稍暗一点，只靠边缘线读出来
  noStroke();
  fill(darkC[0], darkC[1], darkC[2], 46 * AL);
  poly(D.wing);
  stroke(darkC[0], darkC[1], darkC[2], 110 * AL);
  strokeWeight((o.lw ?? 2.1) * 0.6);
  noFill();
  poly(D.wing, false);

  // 眼：留白的小孔
  noStroke();
  fill(o.eye ?? [176, 112, 68], 230);
  circle(D.eye[0], D.eye[1], (o.lw ?? 2.1) * 2.2);

  pop();
}

export function drawRig(pz, opt = {}) {
  const c = {
    ink: [32, 27, 22],
    body: [250, 247, 240],
    bodyDark: [212, 202, 184],
    beak: [228, 156, 62],
    pouch: [233, 180, 102],
    bike: [52, 48, 44],
    leg: [74, 55, 42],
    legFar: [128, 116, 102],
    lw: 1.6,
    ...opt,
  };
  const B = pz.bike, D = pz.bird;
  const bb = B.crank.c;

  push();

  // 远侧腿
  stroke(...c.legFar);
  noFill();
  limb(D.legs[0].hip, D.legs[0].knee, c.lw * 1.9);
  limb(D.legs[0].knee, D.legs[0].ankle, c.lw * 1.5);

  // 车轮
  wheel(B.rear, B.r, pz.wheelAngle, c.wheelOpt);
  wheel(B.front, B.r, pz.wheelAngle, c.wheelOpt);

  // 链条
  const ring = B.chainring;
  stroke(...(c.chain ?? [132, 122, 110]));
  strokeWeight(c.lw * 0.4);
  noFill();
  line(bb[0], bb[1] - ring, B.rear[0], B.rear[1] - 4.2);
  line(bb[0], bb[1] + ring, B.rear[0], B.rear[1] + 4.2);

  // 车架
  stroke(...c.bike);
  noFill();
  for (const [a, b, w] of frameTubes(pz)) limb(a, b, c.lw * 1.5 * (w / 5));

  // 牙盘 / 曲柄 / 脚踏
  strokeWeight(c.lw * 0.85);
  circle(bb[0], bb[1], ring * 2);
  strokeWeight(c.lw * 1.25);
  limb(bb, B.pedalFar);
  strokeWeight(c.lw * 1.6);
  limb(bb, B.pedalNear);
  noStroke();
  fill(...c.bike);
  rectMode(CENTER);
  rect(B.pedalFar[0], B.pedalFar[1], 11, 3);
  rect(B.pedalNear[0], B.pedalNear[1], 12, 3.4);

  // 车把 / 坐垫
  stroke(...c.bike);
  strokeWeight(c.lw * 1.45);
  noFill();
  limb(B.bar[0], B.bar[1]);
  noStroke();
  fill(...c.bike);
  push();
  translate(B.saddle[0], B.saddle[1]);
  rotate(-0.08);
  ellipse(0, 0, 26, 7);
  pop();

  // 近侧腿
  stroke(...c.leg);
  noFill();
  limb(D.legs[1].hip, D.legs[1].knee, c.lw * 2.5);
  limb(D.legs[1].knee, D.legs[1].ankle, c.lw * 1.8);
  noStroke();
  fill(...c.leg);
  push();
  translate(D.legs[1].knee[0], D.legs[1].knee[1]);
  ellipse(0, 0, c.lw * 3.6, c.lw * 3.6);
  pop();
  push();
  translate(D.legs[1].ankle[0], D.legs[1].ankle[1]);
  rotate(0.25);
  ellipse(0, 1.5, 12, 4.4);
  pop();

  // —— 展开的翼：画在身体后面，五根羽 ——
  if (D.wingFan) {
    fill(...c.bodyDark);
    stroke(...c.ink);
    strokeWeight(c.lw * 0.9);
    poly(D.wingFan);
    // 羽轴：从腕关节射向每根初级飞羽
    noFill();
    stroke(...c.ink, 120);
    strokeWeight(c.lw * 0.45);
    const W = D.wingFan[1];
    for (let i = 2; i < D.wingFan.length - 2; i += 2) {
      const p = D.wingFan[i];
      line(W[0], W[1], p[0] * 0.86 + W[0] * 0.14, p[1] * 0.86 + W[1] * 0.14);
    }
  }

  // —— 鸟：身体 + 尾 + 脖子 + 头 的并集 ——
  union([D.tailPts, D.body, D.neck, D.headShape], c.body, c.ink, c.lw);

  // —— 张开的口：先填暗，再盖上喙 ——
  if (D.mouth) {
    noStroke();
    fill(...c.ink);
    poly(D.mouth);
    // 舌：一小条暖色
    if (D.gape > 0.25) {
      fill(...c.pouch);
      const m = D.mouth;
      push();
      translate(m[0][0], m[0][1]);
      rotate(Math.atan2(m[1][1] - m[0][1], m[1][0] - m[0][0]) + 0.22 * D.gape);
      ellipse(18, 3, 26, 5.5);
      pop();
    }
  }

  // —— 喉囊 + 上喙 ——
  noStroke();
  fill(...c.pouch);
  poly(D.pouch);
  stroke(...c.ink);
  strokeWeight(c.lw * 0.85);
  fill(...c.pouch);
  poly(D.pouch);
  noStroke();
  fill(...c.beak);
  poly(D.beakUpper);
  stroke(...c.ink);
  strokeWeight(c.lw * 0.85);
  fill(...c.beak);
  poly(D.beakUpper);

  // 眼
  noStroke();
  fill(...c.ink);
  circle(D.eye[0], D.eye[1], 3.6);

  // 翼：折叠的翼贴在体侧
  fill(...c.bodyDark);
  stroke(...c.ink);
  strokeWeight(c.lw * 0.9);
  poly(D.wing);
  noFill();
  stroke(...c.ink, 105);
  strokeWeight(c.lw * 0.5);
  for (let i = 1; i <= 3; i++) {
    const p = D.wing[i * 4];
    const q = D.wing[i * 4 + 2] || p;
    line(p[0], p[1], q[0] - 10, q[1] - 4);
  }

  // 手：伸到车把
  fill(...c.body);
  stroke(...c.ink);
  strokeWeight(c.lw * 0.8);
  poly(D.arm);

  pop();
}
