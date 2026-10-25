// rig —— 参数化骨骼木偶：鹈鹕 + 自行车。输出纯几何，不含任何风格。
// 坐标系：y 向下，原点在骑行者的地面接触点（两轮正中间）。单位与版块作画空间一致。
//
// 表演层：pose 除了"骑"，还接受一组表演参数。这些参数只改几何，不改画法——
// 所以二十种笔法会一起继承同一个动作。
//   neckReach  脖子前伸（单位）        neckLift   脖子抬高（单位）
//   headPitch  头部俯仰（弧度，正=低头）
//   gape       张嘴 0..1
//   wingRaise  展翅 0..1
//   hipLift    离座站起（单位）
//   lean       身体前后倾
//   coast      滑行 0..1（停止踩踏）
//   tailFan    尾羽张开 0..1
import { beats } from '../beat/timeline.js';
import { ik2, bez, noise1, lerp, clamp } from '../kit/core.js';

export const P = {
  wheelR: 40,
  wheelbase: 132,
  bb: [6, -30],
  crankR: 17,
  saddle: [-58, -112],
  bar: [52, -118],
  thigh: 56,
  shin: 56,

  bodyC: [-26, -136],
  bodyA: 52,
  bodyB: 31,
  bodyRot: -0.06,
  neckLen: 88,
  headR: 19,
  beakLen: 68,
  pouchSag: 40,
  plump: 1,
};

const V = (x, y) => [x, y];
const add = (a, b) => [a[0] + b[0], a[1] + b[1]];

/** 绕 c 转 a 弧度 */
export function rot(p, c, a) {
  if (!a) return p;
  const s = Math.sin(a), co = Math.cos(a);
  const dx = p[0] - c[0], dy = p[1] - c[1];
  return [c[0] + dx * co - dy * s, c[1] + dx * s + dy * co];
}

const mapPts = (pts, f) => pts.map(f);

export function ribbon(pts, widths) {
  const L = [], R = [];
  const w = (i) => (widths[Math.min(i, widths.length - 1)] ?? 8) * 0.5;
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    const q = pts[Math.min(i + 1, pts.length - 1)];
    const r = pts[Math.max(i - 1, 0)];
    let dx = q[0] - r[0], dy = q[1] - r[1];
    const d = Math.hypot(dx, dy) || 1;
    dx /= d; dy /= d;
    L.push([p[0] - dy * w(i), p[1] + dx * w(i)]);
    R.push([p[0] + dy * w(i), p[1] - dx * w(i)]);
  }
  return L.concat(R.reverse());
}

export function ellipsePts(c, a, b, rot0 = 0, n = 44) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2;
    const x = Math.cos(t) * a, y = Math.sin(t) * b;
    out.push([c[0] + x * Math.cos(rot0) - y * Math.sin(rot0), c[1] + x * Math.sin(rot0) + y * Math.cos(rot0)]);
  }
  return out;
}

/** 展开的翼：一根前臂 + 四根初级飞羽，羽间留深缺口。k=0 收，k=1 全张。 */
function fanPts(S, k) {
  const a0 = -2.5;
  const wr = add(S, [Math.cos(a0) * (14 + 42 * k), Math.sin(a0) * (14 + 42 * k)]);
  const R = 42 + 56 * k;
  const out = [S, wr];
  const A0 = -2.02;
  const A1 = -0.72;
  for (let i = 0; i <= 10; i++) {
    const u = i / 10;
    const a = A0 + (A1 - A0) * u;
    let r = R * (0.8 + 0.2 * Math.sin(Math.PI * (0.22 + 0.72 * u)));
    if (i % 3 === 0 && i > 0 && i < 10) r *= 0.88;
    out.push(add(wr, [Math.cos(a) * r, Math.sin(a) * r]));
  }
  out.push(add(S, [8, 10]));
  return out;
}
export function pose(t, opt = {}) {
  const o = { ...P, ...opt };
  const b = beats(t);
  const coast = clamp(o.coast ?? 0, 0, 1);
  // 滑行时曲柄慢慢停住，但不会瞬间跳位
  const crank = Math.PI * b * (1 - 0.9 * coast) + (o.crankBase ?? 0);
  const bob = Math.sin(crank * 2) * 1.4 * (1 - coast * 0.85);
  const lean = o.lean ?? 0;
  const hipLift = o.hipLift ?? 0;

  const rear = V(-o.wheelbase / 2, -o.wheelR);
  const front = V(o.wheelbase / 2, -o.wheelR);
  const wheelAngle = (opt.dist ?? 0) / o.wheelR;

  const pedal = (a) => add(o.bb, [Math.cos(a) * o.crankR, Math.sin(a) * o.crankR]);
  const pedalNear = pedal(crank + Math.PI);
  const pedalFar = pedal(crank);

  const hip = V(o.saddle[0] + 2, o.saddle[1] + 1 + bob * 0.5 - hipLift);
  const bodyC = V(o.bodyC[0], o.bodyC[1] + bob * 0.7 + lean * 0.6 - hipLift * 0.92);
  const body = ellipsePts(bodyC, o.bodyA * o.plump, o.bodyB * o.plump, o.bodyRot + lean * 0.012, 46);

  // 脖子：从身体前上方起，S 形上行。reach 往前推、lift 往上拔。
  const reach = o.neckReach ?? 0;
  const lift = o.neckLift ?? 0;
  const sway = noise1(b * 0.31, 3) * 1.8 * (1 - 0.8 * coast);
  const n0 = add(bodyC, [o.bodyA * 0.62, -o.bodyB * 0.62]);
  const n3 = add(n0, [16 + sway * 0.5 + reach, -o.neckLen - lift]);
  const n1 = add(n0, [1 + sway + reach * 0.16, -o.neckLen * 0.4 - lift * 0.44]);
  const n2 = add(n0, [24 + sway * 0.3 + reach * 0.8, -o.neckLen * 0.78 - lift * 0.82]);
  const neckLine = bez(n0, n1, n2, n3, 16);
  const neckW = neckLine.map((_, i) => {
    const k = i / (neckLine.length - 1);
    return lerp(23, 19, k) * (1 - 0.3 * Math.pow(Math.sin(k * Math.PI * 0.85), 2)) * (1 + 0.1 * Math.min(1, reach / 30));
  });

  // —— 头：先在"不俯仰"的坐标系里建好，再整体绕颈端旋转 ——
  const headR = o.headR;
  const pitch = o.headPitch ?? 0;
  const hc0 = add(n3, [-2, -headR * 0.45]);
  const bBase0 = add(hc0, [headR * 0.42, -headR * 0.5]);
  const bTip0 = add(bBase0, [o.beakLen, 12 + Math.sin(b * 0.5) * 1.4 * (1 - coast)]);
  const hook0 = add(bTip0, [1, 7]);

  const upper0 = [
    ...bez(add(bBase0, [0, -3]), add(bBase0, [o.beakLen * 0.5, -2]), add(bTip0, [-24, 1]), add(bTip0, [-2, 1]), 8),
    bTip0,
    hook0,
    ...bez(add(hook0, [-6, 2]), add(bBase0, [o.beakLen * 0.45, 9]), add(bBase0, [7, 4]), add(bBase0, [0, -3]), 8),
  ];

  const sag = o.pouchSag * (1 + Math.sin(b * 0.5 + 1) * 0.05 * (1 - coast));
  const pouch0 = [
    add(bBase0, [2, 3]),
    ...bez(add(bBase0, [2, 3]), add(bBase0, [o.beakLen * 0.18, sag * 0.9]), add(bBase0, [o.beakLen * 0.5, sag * 1.25]), add(bBase0, [o.beakLen * 0.78, sag * 0.6]), 8),
    add(bTip0, [-2, 6]),
    add(hook0, [-2, 2]),
  ];

  // 张嘴：整个下颌（喉囊所在）绕喙根往下转
  const gape = clamp(o.gape ?? 0, 0, 1);
  const gA = gape * 0.66;
  const pouch = mapPts(pouch0, (p) => rot(p, bBase0, gA));
  const mouth = gape > 0.015
    ? [bBase0, bTip0, rot(add(bTip0, [-2, 6]), bBase0, gA), rot(add(bBase0, [o.beakLen * 0.36, 7]), bBase0, gA)]
    : null;

  // 头部俯仰：所有头部几何绕颈端旋转
  const RT = (p) => rot(p, n3, pitch);
  const headC = RT(hc0);
  const headShape = mapPts(ellipsePts(hc0, headR * 1.04, headR * 1.0, -0.06, 30), RT);
  const upper = mapPts(upper0, RT);
  const pouchOut = mapPts(pouch, RT);
  const mouthOut = mouth ? mapPts(mouth, RT) : null;
  const eye = RT(add(hc0, [headR * 0.3, -headR * 0.34]));

  const kneeNear = ik2(hip, pedalNear, o.thigh, o.shin, -1);
  const kneeFar = ik2(hip, pedalFar, o.thigh, o.shin, -1);

  // 折叠的翼贴在体侧（叶片形）
  const wingC = bodyC;
  const wingPts = [
    add(wingC, [-o.bodyA * 0.62, -o.bodyB * 0.32]),
    ...bez(add(wingC, [-o.bodyA * 0.62, -o.bodyB * 0.32]), add(wingC, [-o.bodyA * 0.24, -o.bodyB * 0.72]), add(wingC, [o.bodyA * 0.06, -o.bodyB * 0.44]), add(wingC, [o.bodyA * 0.18, 0]), 7),
    ...bez(add(wingC, [o.bodyA * 0.18, 0]), add(wingC, [0, o.bodyB * 0.44]), add(wingC, [-o.bodyA * 0.34, o.bodyB * 0.4]), add(wingC, [-o.bodyA * 0.6, o.bodyB * 0.2]), 7),
  ];
  const armS = add(wingC, [o.bodyA * 0.26, 0]);
  const armLine = bez(armS, add(armS, [18, 14]), add(o.bar, [-18, 8]), add(o.bar, [0, 5]), 10);
  const armW = armLine.map((_, i) => lerp(13, 6.5, i / (armLine.length - 1)));

  // 展开的翼：从肩后扇出去，画在身体后面
  const wingRaise = clamp(o.wingRaise ?? 0, 0, 1);
  const shoulder = add(bodyC, [o.bodyA * 0.1, -o.bodyB * 0.66]);
  const wingFan = wingRaise > 0.02 ? fanPts(shoulder, wingRaise) : null;

  const tail = add(bodyC, [-o.bodyA * 0.78, 1]);
  const tf = clamp(o.tailFan ?? 0, 0, 1);
  const tailPts = [
    tail,
    add(tail, [-26 - 10 * tf, -13 - 9 * tf]),
    add(tail, [-24 - 16 * tf, 1]),
    add(tail, [-22 - 8 * tf, 9 + 9 * tf]),
  ];

  return {
    t, b, crank, wheelAngle, bob,
    bike: {
      rear, front, r: o.wheelR,
      headTop: o.bar,
      headBottom: add(o.bar, [7, 32]),
      bar: [o.bar, add(o.bar, [13, 16])],
      saddle: o.saddle,
      crank: { c: o.bb, r: o.crankR, a: crank },
      chainring: 11,
      pedalNear, pedalFar,
    },
    bird: {
      hip, bodyC, body, tail, tailPts,
      neck: ribbon(neckLine, neckW),
      neckLine,
      head: { c: headC, r: headR },
      headShape,
      beakUpper: upper,
      beakLine: upper,
      beakTip: RT(bTip0),
      beakBase: RT(bBase0),
      pouch: pouchOut,
      mouth: mouthOut,
      gape,
      eye,
      wing: wingPts,
      wingFan,
      wingRaise,
      arm: ribbon(armLine, armW),
      armLine,
      legs: [
        { hip, knee: kneeFar, ankle: pedalFar, far: true },
        { hip, knee: kneeNear, ankle: pedalNear, far: false },
      ],
    },
  };
}

export function frameTubes(pz) {
  const B = pz.bike;
  const bb = B.crank.c;
  return [
    [B.rear, bb, 4.6],
    [B.rear, B.saddle, 4.0],
    [bb, B.saddle, 5.6],
    [B.saddle, B.headTop, 5.0],
    [bb, B.headBottom, 5.6],
    [B.headTop, B.headBottom, 5.4],
    [B.headBottom, B.front, 4.6],
  ];
}

export { V, add };
