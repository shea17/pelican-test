// 04 唐代白描（约 750，春日郊游）
// 匀净的细墨线，几乎不设色。体积靠一层极淡的绢色垫底，不靠明暗。
import { GROUND } from '../main/camera.js';
import { pose } from '../rig/rig.js';
import { drawRig } from '../rig/draw.js';
import { silkTexture } from '../kit/texture.js';
import { taper } from '../kit/stroke.js';
import { fillPoly, strokePoly, band } from '../kit/paint.js';
import { bez } from '../kit/core.js';
import { perf } from '../kit/act.js';

const INK = [44, 38, 30];
const SILK = [230, 221, 200];
const BODY = [225, 215, 193];
const WASH = [120, 128, 104];

const C = (a, b, c, d, n = 10) => bez(a, b, c, d, n);
const inkLine = (pts, w0 = 2.2, w1 = 1.2, a = 225) => taper(pts, w0, w1, INK, a);

/** 几个形状合成一个轮廓：先全填，再全部描边，最后再填一遍盖掉内部接缝 */
function unionForm(shapes, fillC = BODY, w = 2.1, lineA = 230) {
  for (const sh of shapes) fillPoly(sh, fillC, 255);
  for (const sh of shapes) strokePoly(sh, INK, w, lineA);
  for (const sh of shapes) fillPoly(sh, fillC, 255);
}

/** 一个"有体积"的形状：极淡的底 + 一条线 */
function form(pts, fillC = BODY, a = 240, w = 2.0, lineA = 232) {
  fillPoly(pts, fillC, a);
  strokePoly(pts, INK, w, lineA);
}

export default {
  id: 'tang',
  card: { x: 112, y: 924, color: 'rgba(38,32,26,', light: false },

  draw(g) {
    const { t, dist, span, hasRider, riderLocal } = g;
    rectMode(CORNER);

    // —— 绢 ——
    for (let x = span[0]; x < span[1]; x += 1200) {
      image(silkTexture(), x, 250, 1200, 784);
    }
    noStroke();
    fill(240, 232, 212, 92);
    rect(span[0], 292, span[1] - span[0], 580);

    // 极淡的 wash：远坡与地面
    noStroke();
    fill(WASH[0], WASH[1], WASH[2], 11);
    rect(span[0], 690, span[1] - span[0], 172);
    fill(WASH[0], WASH[1], WASH[2], 9);
    ellipse(760, 648, 700, 110);
    ellipse(1420, 656, 560, 90);

    // —— 远山：几乎化在绢里 ——
    inkLine(C([-60, 636], [240, 592], [520, 650], [860, 618], 14), 2.4, 0.6, 52);
    inkLine(C([940, 630], [1180, 596], [1440, 644], [1800, 610], 14), 2.0, 0.5, 44);

    // —— 地面 ——
    inkLine(C([span[0], GROUND], [span[0] + 520, GROUND - 3], [span[0] + 1240, GROUND + 3], [span[1], GROUND], 14), 2.6, 1.3, 195);
    grass(span[0], span[1], GROUND);

    // —— 飞鸟 ——
    birds(300, 420, 1.0);
    birds(1180, 392, 0.8);

    // —— 柳与石 ——
    willow(150, GROUND, 1.12);
    rock(92, GROUND + 4, 1.0);

    // —— 仕女三人 ——
    lady(392, GROUND, 1.0, { face: -1 });
    lady(492, GROUND, 0.96, { face: -1 });
    lady(590, GROUND, 1.02, { face: 1 });
    lady(980, GROUND, 1.02, { fan: true, face: -1 });

    // —— 鞍马与马夫 ——
    horse(770, GROUND, 1.0);
    groom(870, GROUND, 0.94);

    // —— 屏风 ——
    screen(1000, GROUND);

    // —— 内侍：拿尺量车轮，一脸困惑 ——
    eunuch(1170, GROUND, 1.0);

    // —— 案与器物 ——
    table(1310, GROUND);

    // —— 右侧 ——
    willow(1560, GROUND, 1.0);
    lady(1690, GROUND, 0.94, { face: 1 });
    lady(1760, GROUND, 0.9, { face: 1 });

    // —— 骑手：同一支笔 ——
    if (hasRider) {
      // 表演：经过执扇的仕女时，低头看扇面上那只画着的自己
      const A = perf(g.p, {
        pitch: [[0.40, 0], [0.47, 0.36], [0.56, 0.32], [0.64, 0]],
        lift: [[0.40, 0], [0.47, -5], [0.56, -5], [0.64, 0]],
        reach: [[0.40, 0], [0.47, -6], [0.56, -6], [0.64, 0]],
      });
      push();
      translate(riderLocal, GROUND);
      drawRig(pose(t, { dist, headPitch: A.pitch, neckLift: A.lift, neckReach: A.reach }), {
        ink: INK, body: SILK, bodyDark: SILK, bike: INK,
        leg: [96, 74, 52], legFar: [146, 126, 100],
        beak: SILK, pouch: SILK, lw: 1.9,
        chain: [150, 132, 108],
        wheelOpt: { tyre: INK, rim: INK, spoke: INK, spokeW: 0.7, hub: INK, tyreW: 1.9 },
      });
      pop();
    }

    // 扇面里那只小小的鹈鹕：被看了一眼，于是睁开了眼
    const wink = perf(g.p, { v: [[0.48, 0], [0.52, 1], [0.60, 1], [0.63, 0]] }).v;
    if (wink > 0.02) {
      push();
      noStroke();
      fill(INK[0], INK[1], INK[2], 210 * wink);
      circle(1012, 560, 2.6);
      pop();
    }
  },
};

// ---------- 人物 ----------

function lady(x, y, s, o = {}) {
  push();
  translate(x, y);
  scale(s * (o.face < 0 ? -1 : 1), s);

  // 裙
  form(
    [[-14, -148], [-26, -116], [-34, -40], [-33, 0], [-10, 4], [10, 4], [33, 0], [34, -40], [26, -116], [14, -148]],
    BODY, 242, 2.2,
  );
  // 裙褶
  for (let i = 0; i < 3; i++) {
    const bx = -12 + i * 12;
    inkLine(C([bx, -140], [bx - 6, -96], [bx + 2, -46], [bx - 2, -3], 7), 1.4, 0.6, 140);
  }
  // 上身
  form([[-14, -148], [-18, -180], [-12, -200], [-4, -206], [6, -206], [13, -200], [16, -178], [14, -148]], BODY, 245, 2.0);
  // 领
  inkLine(C([-12, -196], [0, -187], [10, -194], [12, -202], 6), 1.5, 0.7, 170);
  // 披帛
  inkLine(C([-13, -192], [-30, -160], [-26, -118], [-14, -96], 10), 1.6, 0.6, 150);

  // 头
  const head = [];
  for (let i = 0; i <= 22; i++) {
    const a = (i / 22) * Math.PI * 2;
    head.push([Math.cos(a) * 14.2, -224 + Math.sin(a) * 17.6 + Math.sin(a * 2) * 1.0]);
  }
  form(head, [236, 226, 204], 250, 1.8, 235);

  // 发
  noStroke();
  fill(INK[0], INK[1], INK[2], 238);
  beginShape();
  vertex(-14, -230); vertex(-12, -244); vertex(0, -248); vertex(13, -242); vertex(14, -228);
  vertex(8, -236); vertex(-2, -240); vertex(-9, -236);
  endShape(CLOSE);
  ellipse(-13, -220, 8, 26);
  ellipse(13, -220, 8, 26);
  // 高髻
  beginShape();
  vertex(-12, -242); vertex(-15, -264); vertex(-4, -276); vertex(7, -272); vertex(13, -256); vertex(9, -242);
  endShape(CLOSE);
  stroke(INK[0], INK[1], INK[2], 190);
  strokeWeight(1.3);
  line(-16, -264, 14, -270);

  // 眉眼与口
  noFill();
  strokeWeight(1.2);
  line(-9, -229, -4, -231);
  line(5, -231, 10, -229);
  noStroke();
  fill(INK[0], INK[1], INK[2]);
  ellipse(-6, -225, 2.6, 1.7);
  ellipse(7, -225, 2.6, 1.7);
  fill(150, 62, 52, 215);
  ellipse(0, -213, 4.6, 2.4);

  // 宽袖
  const sl = [[-12, -196], [-34, -186], [-40, -152], [-26, -130], [-16, -150], [-12, -178]];
  form(sl, [228, 218, 196], 235, 1.9);

  // 手与团扇
  if (o.fan) {
    noFill();
    stroke(INK[0], INK[1], INK[2], 225);
    strokeWeight(1.7);
    circle(-34, -138, 42);
    strokeWeight(0.8);
    for (let i = 0; i < 9; i++) {
      const a0 = (i / 9) * Math.PI * 2;
      line(-34 + Math.cos(a0) * 4, -138 + Math.sin(a0) * 4, -34 + Math.cos(a0) * 20, -138 + Math.sin(a0) * 20);
    }
    // 扇面上画的正是这只鸟
    noStroke();
    fill(INK[0], INK[1], INK[2], 160);
    ellipse(-37, -141, 12, 7);
    circle(-31, -145, 5);
    triangle(-29, -145, -23, -144, -29, -142);
    noFill();
    stroke(INK[0], INK[1], INK[2], 160);
    strokeWeight(0.8);
    circle(-40, -133, 8);
    circle(-32, -133, 8);
    strokeWeight(1.3);
    line(-34, -112, -34, -124);
  } else {
    noFill();
    stroke(INK[0], INK[1], INK[2], 215);
    strokeWeight(1.5);
    beginShape();
    for (const q of C([-26, -130], [-30, -122], [-26, -116], [-20, -120], 6)) vertex(q[0], q[1]);
    endShape();
  }
  pop();
}

function groom(x, y, s) {
  push();
  translate(x, y);
  scale(s);
  form([[-8, -160], [-22, -104], [-26, -40], [-24, 0], [24, 0], [26, -40], [22, -104], [10, -160]], BODY, 238, 2.0);
  inkLine(C([0, -158], [0, -60], [0, -20], [0, -2], 6), 1.4, 0.7, 150);
  // 头与幞头
  form([[-13, -162], [-9, -182], [0, -186], [9, -182], [13, -162], [0, -156]], [236, 226, 204], 250, 1.7);
  noStroke();
  fill(INK[0], INK[1], INK[2], 232);
  beginShape();
  vertex(-13, -184); vertex(-11, -194); vertex(11, -194); vertex(13, -184);
  endShape(CLOSE);
  rect(-6, -202, 12, 8, 2);
  // 缰绳
  noFill();
  stroke(INK[0], INK[1], INK[2], 210);
  strokeWeight(1.7);
  beginShape();
  for (const q of C([14, -150], [40, -150], [64, -142], [74, -130], 8)) vertex(q[0], q[1]);
  endShape();
  pop();
}

function eunuch(x, y, s) {
  push();
  translate(x, y);
  scale(s);
  form([[-14, -158], [-26, -96], [-28, -40], [-24, 0], [24, 0], [28, -40], [26, -96], [14, -158]], BODY, 238, 2.1);
  inkLine(C([-14, -120], [0, -113], [14, -120], 6), 1.5, 0.8, 165);
  form([[-12, -160], [-8, -178], [0, -182], [8, -178], [12, -160], [0, -154]], [236, 226, 204], 250, 1.7);
  noStroke();
  fill(INK[0], INK[1], INK[2], 230);
  ellipse(0, -186, 22, 11);
  // 手里的尺
  noFill();
  stroke(INK[0], INK[1], INK[2], 232);
  strokeWeight(1.7);
  rect(-64, -150, 76, 5, 1);
  for (let i = 0; i < 9; i++) line(-62 + i * 8, -150, -62 + i * 8, -144);
  line(-26, -146, -20, -138);
  pop();
}

// ---------- 马 ----------

function horse(x, y, s) {
  push();
  translate(x, y);
  scale(s);
  // 腿：先画，藏在躯干后面
  const legs = [
    [[-46, -80], [-52, -48], [-56, -24], [-50, 0]],
    [[-28, -74], [-26, -46], [-24, -22], [-20, 0]],
    [[40, -80], [46, -48], [50, -24], [54, 0]],
    [[22, -74], [26, -46], [24, -20], [20, 0]],
  ];
  for (const lg of legs) {
    const shape = band(C(lg[0], lg[1], lg[2], lg[3], 8), [13, 9, 6, 4]);
    fillPoly(shape, BODY, 255);
    strokePoly(shape, INK, 1.5, 215);
  }
  // 尾
  const tail = C([-54, -112], [-78, -100], [-84, -60], [-74, -26], 10);
  const tailShape = band(tail, [11, 8, 6, 4, 2]);
  fillPoly(tailShape, [200, 190, 168], 245);
  strokePoly(tailShape, INK, 1.3, 190);

  // 躯干 + 颈 + 头：合起来才是一匹马
  const bodySh = [[-58, -96], [-52, -118], [-34, -130], [-6, -135], [24, -131], [46, -118], [56, -104], [58, -92], [50, -80], [24, -70], [-12, -70], [-40, -80]];
  const neckSh = [[38, -122], [54, -158], [66, -186], [80, -194], [94, -192], [98, -182], [86, -176], [74, -158], [66, -124], [58, -96]];
  const headSh = [[78, -196], [96, -196], [106, -186], [104, -174], [94, -168], [82, -172], [76, -184]];
  unionForm([bodySh, neckSh, headSh], BODY, 2.2, 232);

  // 耳
  inkLine(C([82, -196], [80, -206], [85, -208], [87, -197], 5), 1.6, 0.7);
  // 鬃
  for (let i = 0; i < 5; i++) {
    inkLine(C([64 + i * 5, -180 + i * 9], [58 + i * 5, -170 + i * 9], [54 + i * 5, -162 + i * 9], [56 + i * 5, -156 + i * 9], 4), 1.4, 0.5, 185);
  }
  // 鞍与鞯
  form([[-24, -134], [-8, -146], [12, -144], [24, -132], [2, -138]], [176, 158, 126], 235, 1.8);
  inkLine(C([-10, -140], [0, -152], [10, -140], 6), 1.2, 0.6, 170);
  // 眼与口
  noStroke();
  fill(INK[0], INK[1], INK[2]);
  circle(92, -186, 2.6);
  noFill();
  stroke(INK[0], INK[1], INK[2], 210);
  strokeWeight(1.3);
  line(100, -176, 96, -172);
  pop();
}
// ---------- 屏风 ----------

function screen(x, y) {
  push();
  translate(x, y);
  const H0 = 276;
  for (let i = 0; i < 3; i++) {
    const px = i * 74;
    fillPoly([[px, -H0], [px + 70, -H0], [px + 70, 0], [px, 0]], [226, 216, 194], 246);
    strokePoly([[px, -H0], [px + 70, -H0], [px + 70, 0], [px, 0]], INK, 2.4, 220);
    strokePoly([[px + 7, -H0 + 7], [px + 63, -H0 + 7], [px + 63, -7], [px + 7, -7]], INK, 1.0, 190);
    const mx = px + 10;
    noStroke();
    fill(WASH[0], WASH[1], WASH[2], 26);
    ellipse(mx + 26, -118, 62, 40);
    inkLine(C([mx, -104], [mx + 12, -142], [mx + 26, -112], [mx + 38, -150], 8), 1.3, 0.4, 120);
    inkLine(C([mx + 38, -150], [mx + 46, -116], [mx + 50, -100], [mx + 54, -88], 8), 1.2, 0.4, 110);
    inkLine(C([mx + 2, -96], [mx + 20, -84], [mx + 44, -90], [mx + 55, -78], 8), 1.0, 0.3, 90);
  }
  noFill();
  stroke(INK[0], INK[1], INK[2], 225);
  strokeWeight(2.4);
  line(-6, 0, 220, 0);
  line(-2, -4, -2, 12);
  line(214, -4, 214, 12);
  pop();
}

// ---------- 器物、柳、石、鸟 ----------

function table(x, y) {
  push();
  translate(x, y);
  noFill();
  stroke(INK[0], INK[1], INK[2], 220);
  strokeWeight(1.9);
  line(-52, -78, 52, -78);
  line(-46, -78, -44, 0);
  line(46, -78, 44, 0);
  line(-52, -78, -56, -70);
  ellipse(0, -80, 46, 12);
  circle(-10, -88, 9);
  circle(2, -90, 10);
  circle(13, -87, 8);
  beginShape();
  vertex(30, -78); vertex(26, -106); vertex(34, -112); vertex(44, -108); vertex(46, -78);
  endShape(CLOSE);
  line(44, -104, 54, -98);
  line(34, -112, 40, -122);
  pop();
}

function willow(x, y, s) {
  push();
  translate(x, y);
  scale(s);
  const trunk = C([0, 0], [-4, -60], [-2, -120], [4, -170], 8);
  const trunkShape = band(trunk, [12, 10, 8, 6]);
  fillPoly(trunkShape, [206, 196, 172], 240);
  strokePoly(trunkShape, INK, 1.6, 215);
  noFill();
  stroke(INK[0], INK[1], INK[2], 215);
  strokeWeight(2.0);
  for (let i = 0; i < 4; i++) {
    const bx = 4 + i * 6;
    inkLine(C([bx, -150 + i * 6], [bx + 30 + i * 8, -170 + i * 6], [bx + 54 + i * 10, -150 + i * 4], [bx + 60 + i * 12, -120 + i * 6], 8), 2.4, 1.0);
  }
  strokeWeight(1.1);
  for (let i = 0; i < 16; i++) {
    const bx = 10 + (i % 8) * 8 + Math.floor(i / 8) * 40;
    const by = -168 + (i % 3) * 10;
    const len = 70 + (i % 5) * 26;
    inkLine(C([bx, by], [bx + 12, by + len * 0.4], [bx - 6, by + len * 0.8], [bx + 2, by + len], 10), 1.4, 0.4, 165);
  }
  pop();
}

function rock(x, y, s) {
  push();
  translate(x, y);
  scale(s);
  const pts = [[-34, 0], [-30, -34], [-6, -46], [16, -40], [34, -40], [42, -18], [38, 0]];
  form(pts, [216, 206, 184], 235, 1.8, 195);
  inkLine(C([-6, -44], [2, -28], [10, -20], [24, -16], 6), 1.3, 0.6, 140);
  pop();
}

function grass(x0, x1, y) {
  push();
  stroke(INK[0], INK[1], INK[2], 115);
  strokeWeight(1.0);
  for (let x = x0; x < x1; x += 26) {
    const h = 5 + Math.abs((x * 7919) % 11);
    line(x, y, x - 3, y - h);
    line(x + 3, y, x + 5, y - h * 0.8);
  }
  pop();
}

function birds(x, y, s) {
  push();
  translate(x, y);
  scale(s);
  noFill();
  stroke(INK[0], INK[1], INK[2], 150);
  strokeWeight(1.3);
  for (const b of [[0, 0, 9], [26, -12, 7], [-22, -8, 6]]) {
    const bx = b[0], by = b[1], r = b[2];
    beginShape();
    for (const q of C([bx - r, by], [bx - r * 0.4, by - r * 0.8], [bx, by], [bx + r * 0.4, by - r * 0.8], 4)) vertex(q[0], q[1]);
    endShape();
    beginShape();
    for (const q of C([bx, by], [bx + r * 0.4, by - r * 0.8], [bx + r, by], [bx + r * 0.2, by + 1], 4)) vertex(q[0], q[1]);
    endShape();
  }
  pop();
}
