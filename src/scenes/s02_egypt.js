// 02 埃及壁画（约前 1300，底比斯墓室）
// 平涂矿物颜料 + 深蓝描边。整面墙是一个 register：神在左，字在中，队伍在右。
import { GROUND } from '../main/camera.js';
import { pose } from '../rig/rig.js';
import { drawRig } from '../rig/draw.js';
import { vGrad, speckle, starPts, blob, fillPoly, strokePoly } from '../kit/paint.js';
import { rng } from '../kit/core.js';
import { perf } from '../kit/act.js';

const PL = [234, 214, 174];     // 灰泥
const PL_D = [208, 183, 141];
const MUD = [146, 116, 80];     // 剥落处露出的泥层
const BLUE = [48, 74, 108];
const BLUE_D = [28, 46, 70];
const OCH = [184, 121, 47];
const RED = [156, 59, 37];
const GRN = [72, 104, 72];
const INK = [38, 46, 58];

export default {
  id: 'egypt',
  card: { x: 120, y: 906, color: 'rgba(244,220,176,', light: true },

  draw(g) {
    const { t, dist, span, hasRider, riderLocal } = g;
    rectMode(CORNER);
    const L = span[0], R = span[1], WW = R - L;

    // —— 墙 ——
    vGrad(L, 286, WW, 598, PL, PL_D, 46);
    speckle(L, 286, WW, 598, 380, [120, 92, 58], 18, 3, 0.9, 3.0);
    speckle(L, 286, WW, 598, 220, [255, 246, 224], 20, 8, 0.7, 2.4);

    // 剥落的灰泥：露出底下的泥 + 草筋
    plasterLoss(556, 556, 62, 38, 11);
    plasterLoss(1696, 372, 62, 36, 23);
    plasterLoss(268, 404, 54, 32, 37);

    // —— 顶部：星空天花 + 三色饰带 ——
    noStroke();
    fill(BLUE_D[0], BLUE_D[1], BLUE_D[2]);
    rect(L, 292, WW, 60);
    for (let x = L; x < R; x += 96) star(x + 48, 322, 9);
    for (let x = L; x < R; x += 54) {
      fill(RED[0], RED[1], RED[2]);
      rect(x, 352, 18, 14);
      fill(OCH[0], OCH[1], OCH[2]);
      rect(x + 18, 352, 18, 14);
      fill(BLUE[0], BLUE[1], BLUE[2]);
      rect(x + 36, 352, 18, 14);
    }
    fill(INK[0], INK[1], INK[2], 160);
    rect(L, 366, WW, 4);

    // —— 左段：纸莎草丛（尼罗河边的老题材） ——
    papyrus(188, GROUND, 1.0, 7);
    papyrus(392, GROUND, 0.86, 19);

    // —— 中段：象形文字墙 ——
    const gy = 322;
    noStroke();
    fill(OCH[0], OCH[1], OCH[2], 26);
    for (let c = 0; c < 4; c++) {
      if (c % 2 === 0) rect(648 + c * 92, gy, 92, 152);
    }
    const cols = [
      ['ankh', 'water', 'bird', 'bread'],
      ['eye', 'reed', 'sun', 'hand'],
      ['bike', 'water', 'feather', 'snake'],
      ['bird', 'bread', 'ankh', 'reed'],
    ];
    for (let c = 0; c < 4; c++) {
      for (let r = 0; r < 4; r++) {
        const kind = cols[c][r];
        glyph(kind, 648 + c * 92 + 46, gy + 22 + r * 38, 24, kind === 'bike' ? RED : INK);
      }
    }

    // —— 王名圈：里面装着一只自行车 ——
    cartouche(1046, 330, 148, 150);

    // —— 右段：神与出行队伍 ——
    god(1332, GROUND);
    offering(1172, GROUND);
    priest(1530, GROUND, 1.0, 5);
    cat(1618, GROUND, 0.96);
    priest(1712, GROUND, 1.02, 29);

    // —— 地线：一条画在墙上的粗黑线，车就骑在上面 ——
    noStroke();
    fill(INK[0], INK[1], INK[2]);
    rect(L, GROUND - 3, WW, 7);

    // —— 墙裙 ——
    fill(RED[0], RED[1], RED[2]);
    rect(L, 704, WW, 168);
    fill(126, 42, 28);
    for (let x = L; x < R; x += 118) rect(x, 704, 7, 168);
    fill(OCH[0], OCH[1], OCH[2], 70);
    rect(L, 704, WW, 6);

    // —— 骑手 ——
    if (hasRider) {
      // 表演：经过王名圈时伸长脖子，用喙碰一碰圈里刻着的那辆自行车
      const A = perf(g.p, {
        reach: [[0.40, 0], [0.52, 34], [0.58, 34], [0.68, 0]],
        pitch: [[0.40, 0], [0.52, -0.24], [0.58, -0.2], [0.68, 0]],
        gape: [[0.44, 0], [0.53, 0.4], [0.60, 0.4], [0.68, 0]],
      });
      const pz = pose(t, { dist, neckReach: A.reach, headPitch: A.pitch, gape: A.gape });
      push();
      translate(riderLocal, GROUND);
      drawRig(pz, {
        ink: INK, body: [242, 230, 202], bodyDark: [206, 186, 150],
        bike: INK, leg: OCH, legFar: [148, 118, 84],
        beak: [202, 140, 58], pouch: [216, 160, 86], lw: 3.0,
        wheelOpt: { tyre: INK, rim: OCH, spoke: INK, spokeW: 1.1, hub: INK, tyreW: 3.4 },
      });
      // 埃及式的眼线：从眼角往后拖一道，再压一条眉
      noStroke();
      fill(INK[0], INK[1], INK[2]);
      const e = pz.bird.eye;
      rect(e[0] + 1, e[1] - 1, 17, 2.4);
      rect(e[0] - 4, e[1] - 7, 22, 2.0);
      pop();
    }

    // 喙碰到王名圈的那一下：一圈金色的光，顺着墙散开
    const gl = perf(g.p, { v: [[0.51, 0], [0.56, 1], [0.68, 0]] }).v;
    if (gl > 0.01) {
      push();
      translate(1120, 468);
      noFill();
      for (let i = 0; i < 4; i++) {
        const k = i / 4;
        stroke(214, 162, 62, 150 * gl * (1 - k * 0.7));
        strokeWeight(3 - i * 0.5);
        circle(0, 0, 30 + k * 130 + (1 - gl) * 40);
      }
      stroke(240, 206, 128, 120 * gl);
      strokeWeight(2);
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2 + 0.12;
        const r0 = 46 + (1 - gl) * 20;
        const r1 = r0 + 26 * gl;
        line(Math.cos(a) * r0, Math.sin(a) * r0, Math.cos(a) * r1, Math.sin(a) * r1);
      }
      pop();
    }
  },
};

// ---------- 墙 ----------

function plasterLoss(cx, cy, rx, ry, seed) {
  const pts = blob(cx, cy, rx, ry, 20, seed, 0.22);
  fillPoly(pts, MUD, 255);
  const r = rng(seed);
  noStroke();
  for (let i = 0; i < 26; i++) {
    fill(196, 168, 118, 90 + r() * 80);
    rect(cx + (r() - 0.5) * rx * 1.7, cy + (r() - 0.5) * ry * 1.7, 3 + r() * 8, 1.4);
  }
  strokePoly(pts, [110, 84, 56], 2.2, 150);
}

function star(x, y, r) {
  fill(OCH[0], OCH[1], OCH[2], 220);
  const pts = starPts(x, y, r, 5, 0.44);
  beginShape();
  for (const q of pts) vertex(q[0], q[1]);
  endShape(CLOSE);
}

// ---------- 神 ----------

function god(x, y) {
  push();
  translate(x, y);

  // 宝座
  noStroke();
  fill(OCH[0], OCH[1], OCH[2]);
  rect(-92, -176, 150, 176);
  fill(158, 100, 38);
  rect(-92, -176, 150, 12);
  rect(-92, -140, 150, 6);
  fill(BLUE[0], BLUE[1], BLUE[2]);
  rect(-92, -176, 10, 176);
  fill(206, 150, 66);
  rect(-104, -176, 176, 16);

  // 腿（侧身，两腿并着向前）
  fill(78, 102, 78);
  rect(-30, -60, 112, 34, 6);
  rect(-30, -34, 96, 12);
  fill(OCH[0], OCH[1], OCH[2]);
  rect(62, -44, 34, 10);

  // 短裙
  fill(238, 230, 206);
  beginShape();
  vertex(-36, -132); vertex(28, -132); vertex(44, -60); vertex(-46, -60);
  endShape(CLOSE);
  stroke(INK[0], INK[1], INK[2], 210);
  strokeWeight(2.4);
  line(-42, -62, 40, -62);
  for (let i = 0; i < 4; i++) line(-30 + i * 18, -126, -36 + i * 18, -64);

  // 上身（正面肩、侧面头 —— 埃及的老规矩）
  noStroke();
  fill(94, 120, 92);
  beginShape();
  vertex(-42, -236); vertex(38, -236); vertex(46, -132); vertex(-48, -132);
  endShape(CLOSE);
  // 脖子
  rect(-8, -268, 24, 40);

  // 项圈
  noFill();
  stroke(OCH[0], OCH[1], OCH[2], 230);
  strokeWeight(6);
  arc(0, -226, 78, 46, 0.1, Math.PI - 0.1, OPEN);
  stroke(BLUE[0], BLUE[1], BLUE[2]);
  strokeWeight(3);
  arc(0, -226, 60, 34, 0.1, Math.PI - 0.1, OPEN);

  // 手臂：一只前伸扶杖，一只下垂持生命符
  stroke(94, 120, 92);
  strokeWeight(16);
  line(32, -218, 88, -188);
  line(-36, -216, -60, -148);

  // 权杖
  stroke(OCH[0], OCH[1], OCH[2]);
  strokeWeight(7);
  line(98, -258, 98, -20);
  noFill();
  strokeWeight(4);
  arc(78, -258, 40, 26, 0, Math.PI, OPEN);

  // 生命符
  push();
  translate(-60, -128);
  stroke(BLUE[0], BLUE[1], BLUE[2]);
  strokeWeight(3.4);
  noFill();
  ellipse(0, -10, 13, 15);
  line(0, -2, 0, 12);
  line(-7, 2, 7, 2);
  pop();

  // 头巾（nemes）：蓝底金条纹，垂在脑后
  noStroke();
  fill(BLUE[0], BLUE[1], BLUE[2]);
  beginShape();
  vertex(-24, -292); vertex(12, -288); vertex(14, -226); vertex(-40, -224); vertex(-46, -254);
  endShape(CLOSE);
  fill(OCH[0], OCH[1], OCH[2]);
  for (let i = 0; i < 4; i++) {
    rect(-40 + i * 3, -282 + i * 13, 46, 4.4);
  }

  // 鹈鹕头（侧面），长喙朝右
  noStroke();
  fill(248, 240, 218);
  ellipse(0, -262, 52, 44);

  // 喉囊：从喙根垂下来，这是"鹈鹕"而不是"长嘴鸟"的关键
  fill(226, 192, 124);
  beginShape();
  vertex(20, -246); vertex(92, -247); vertex(84, -232); vertex(52, -222); vertex(26, -228);
  endShape(CLOSE);

  // 上喙
  fill(232, 196, 108);
  beginShape();
  vertex(20, -274); vertex(104, -258); vertex(102, -246); vertex(18, -246);
  endShape(CLOSE);
  stroke(INK[0], INK[1], INK[2], 220);
  strokeWeight(2.2);
  line(20, -260, 102, -252);
  noStroke();
  fill(INK[0], INK[1], INK[2]);
  ellipse(6, -268, 7, 6);

  // 冠：一只带辐条的车轮
  push();
  translate(0, -322);
  noFill();
  stroke(OCH[0], OCH[1], OCH[2]);
  strokeWeight(6);
  circle(0, 0, 86);
  stroke(BLUE[0], BLUE[1], BLUE[2]);
  strokeWeight(3);
  circle(0, 0, 68);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.26;
    line(0, 0, Math.cos(a) * 34, Math.sin(a) * 34);
  }
  noStroke();
  fill(OCH[0], OCH[1], OCH[2]);
  circle(0, 0, 10);
  pop();

  pop();
}

// ---------- 象形文字 ----------

function glyph(kind, x, y, s, col) {
  push();
  translate(x, y);
  scale(s / 26);
  noFill();
  stroke(col[0], col[1], col[2], 235);
  strokeWeight(2.4);
  if (kind === 'ankh') {
    ellipse(0, -9, 12, 14);
    line(0, -2, 0, 13);
    line(-7, 2, 7, 2);
  } else if (kind === 'eye') {
    beginShape();
    vertex(-11, 0); vertex(-4, -6); vertex(5, -6); vertex(11, 0);
    vertex(4, 5); vertex(-4, 5);
    endShape(CLOSE);
    noStroke(); fill(col[0], col[1], col[2]); circle(1, 0, 5);
    noFill(); stroke(col[0], col[1], col[2]);
    line(3, 2, 8, 10);
  } else if (kind === 'water') {
    beginShape();
    for (let i = 0; i <= 8; i++) vertex(-11 + i * 2.75, i % 2 ? -3 : 3);
    endShape();
  } else if (kind === 'sun') {
    circle(0, 0, 15);
    noStroke(); fill(col[0], col[1], col[2]); circle(0, 0, 4);
    noFill(); stroke(col[0], col[1], col[2]);
  } else if (kind === 'bird') {
    noStroke(); fill(col[0], col[1], col[2]);
    ellipse(-2, 0, 12, 8);
    circle(5, -5, 5);
    triangle(7, -5, 13, -4, 7, -2);
    rect(-7, 4, 2, 7); rect(-2, 4, 2, 7);
    noFill(); stroke(col[0], col[1], col[2]);
  } else if (kind === 'reed') {
    beginShape();
    vertex(2, 12); vertex(-3, 2); vertex(-1, -8); vertex(3, -12); vertex(4, -2); vertex(4, 12);
    endShape();
  } else if (kind === 'bread') {
    arc(0, 3, 16, 14, Math.PI, 0, CHORD);
    line(-8, 3, 8, 3);
  } else if (kind === 'feather') {
    beginShape();
    vertex(-6, 12); vertex(-4, -6); vertex(0, -13); vertex(4, -4); vertex(2, 12);
    endShape();
    line(0, -10, 0, 8);
  } else if (kind === 'snake') {
    beginShape();
    vertex(-11, 6); vertex(-5, 1); vertex(1, 5); vertex(7, 0); vertex(11, -4);
    endShape();
    noStroke(); fill(col[0], col[1], col[2]); circle(11, -5, 4);
    noFill(); stroke(col[0], col[1], col[2]);
  } else if (kind === 'hand') {
    rect(-4, -2, 8, 12);
    for (let i = 0; i < 4; i++) line(-3 + i * 2, -2, -3 + i * 2, -9);
  } else if (kind === 'bike') {
    circle(-7, 5, 12);
    circle(7, 5, 12);
    line(-7, 5, -1, -6); line(-1, -6, 6, -6); line(6, -6, 7, 5);
    line(-1, -6, 3, 5); line(6, -6, 9, -10);
    line(-3, -9, 1, -9);
  }
  pop();
}

function cartouche(x, y, w, h) {
  push();
  noStroke();
  fill(242, 224, 186, 190);
  rect(x - 6, y - 6, w + 12, h + 12, 4);
  noFill();
  stroke(INK[0], INK[1], INK[2], 220);
  strokeWeight(3);
  rect(x, y, w, h, 12);
  strokeWeight(1.6);
  rect(x + 7, y + 7, w - 14, h - 14, 8);
  pop();
  glyph('bike', x + w * 0.5, y + 42, 54, RED);
  glyph('bird', x + w * 0.5, y + 96, 40, INK);
  glyph('water', x + w * 0.5, y + 132, 34, BLUE);
}


/** 纸莎草：一根伞状的花茎，三五株一丛 */
function papyrus(x, y, s, seed) {
  const r = rng(seed);
  push();
  translate(x, y);
  scale(s);
  for (let i = 0; i < 5; i++) {
    const bx = (i - 2) * 16 + (r() - 0.5) * 10;
    const h = 96 + r() * 70;
    const lean = (r() - 0.5) * 26;
    noFill();
    stroke(74, 104, 72, 235);
    strokeWeight(3.2);
    beginShape();
    vertex(bx, 0);
    vertex(bx + lean * 0.3, -h * 0.5);
    vertex(bx + lean, -h);
    endShape();
    // 伞形花序
    noStroke();
    fill(74, 104, 72, 225);
    triangle(bx + lean - 16, -h + 4, bx + lean + 16, -h + 2, bx + lean, -h - 20);
    fill(126, 150, 96, 200);
    triangle(bx + lean - 9, -h + 4, bx + lean + 9, -h + 3, bx + lean, -h - 12);
  }
  pop();
}

// ---------- 人物 ----------

function priest(x, y, s, seed) {
  const r = rng(seed);
  push();
  translate(x, y);
  scale(s);

  // 长袍（侧身，一只脚在前）
  fill(244, 236, 216);
  beginShape();
  vertex(-16, -196); vertex(14, -196); vertex(26, -6); vertex(-30, -6);
  endShape(CLOSE);
  noFill();
  stroke(INK[0], INK[1], INK[2], 200);
  strokeWeight(2.6);
  beginShape();
  vertex(-16, -196); vertex(14, -196); vertex(26, -6); vertex(-30, -6);
  endShape(CLOSE);
  line(-24, -10, 22, -10);

  // 头与假发
  noStroke();
  fill(176, 112, 58);
  ellipse(0, -222, 30, 36);
  fill(INK[0], INK[1], INK[2]);
  beginShape();
  vertex(-17, -232); vertex(15, -232); vertex(16, -204); vertex(-16, -204);
  endShape(CLOSE);
  fill(186, 126, 70);
  ellipse(4, -212, 22, 24);

  // 手臂
  stroke(176, 112, 58);
  strokeWeight(9);
  line(6, -186, 26, -140);
  line(-6, -186, -18, -142);

  // 权杖
  stroke(OCH[0], OCH[1], OCH[2]);
  strokeWeight(5);
  line(36 - r() * 2, -240, 36, -2);
  noStroke();

  // 腰带
  fill(BLUE[0], BLUE[1], BLUE[2], 180);
  rect(-14, -150, 30, 7);
  pop();
}

function cat(x, y, s) {
  push();
  translate(x, y);
  scale(s);
  noStroke();
  fill(58, 62, 64);
  ellipse(0, -46, 46, 74);
  circle(0, -96, 40);
  triangle(-19, -110, -6, -124, -4, -104);
  triangle(19, -110, 6, -124, 4, -104);
  rect(-26, -12, 52, 12, 5);
  noFill();
  stroke(58, 62, 64);
  strokeWeight(7);
  beginShape();
  vertex(-22, -18); vertex(-42, -34); vertex(-40, -60);
  endShape();
  noStroke();
  fill(OCH[0], OCH[1], OCH[2]);
  ellipse(-8, -100, 8, 6);
  ellipse(8, -100, 8, 6);
  fill(INK[0], INK[1], INK[2]);
  ellipse(-8, -100, 3, 5);
  ellipse(8, -100, 3, 5);
  pop();
}

/** 供桌：面包、莲花，还有一只车轮形的供饼 */
function offering(x, y) {
  push();
  translate(x, y);
  noStroke();
  fill(150, 100, 46);
  rect(-64, -70, 128, 12, 3);
  rect(-46, -58, 10, 58);
  rect(36, -58, 10, 58);

  for (let i = 0; i < 3; i++) {
    fill(228, 196, 130);
    arc(-46 + i * 26, -70, 26, 20, Math.PI, 0, CHORD);
  }
  stroke(GRN[0], GRN[1], GRN[2]);
  strokeWeight(3);
  line(44, -70, 44, -112);
  noStroke();
  fill(126, 150, 176);
  ellipse(44, -116, 20, 12);

  push();
  translate(4, -104);
  noFill();
  stroke(OCH[0], OCH[1], OCH[2]);
  strokeWeight(4);
  circle(0, 0, 40);
  strokeWeight(2.4);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    line(0, 0, Math.cos(a) * 15, Math.sin(a) * 15);
  }
  pop();
  pop();
}
