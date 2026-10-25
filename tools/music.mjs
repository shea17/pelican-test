// music —— 全片配乐，纯合成，全部事件由时间轴算出。
// 输出 out/score.wav（48k / 16bit / 立体声）。
import fs from 'node:fs';
import path from 'node:path';
import { DEFS, INTRO_END, OUTRO_START, DURATION, PANEL_DUR, BAR, BEAT } from '../src/beat/timeline.js';
import { rng } from '../src/kit/core.js';

const SR = 48000;
const N = Math.ceil(DURATION * SR) + SR;      // 多留一秒尾巴
const L = new Float32Array(N);
const R = new Float32Array(N);

// ---------- 基础 ----------
const TAU = Math.PI * 2;
const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
const A = 57;                                  // A3，全片的中心音
const note = (semi) => mtof(A + semi);

function pan(i, x, l, r) {
  const a = (x + 1) * 0.5;
  if (i >= 0 && i < N) {
    L[i] += l * (1 - a * 0.6);
    R[i] += r * (0.4 + a * 0.6);
  }
}

// ---------- 音色 ----------

/** 拨弦：Karplus-Strong */
function pluck(t0, freq, dur, amp, o = {}) {
  const bright = o.bright ?? 0.5;
  const decay = o.decay ?? 0.99996;
  const n = Math.floor(dur * SR);
  const d = Math.max(2, Math.floor(SR / freq));
  const buf = new Float32Array(d);
  const r = rng(o.seed ?? 7);
  for (let i = 0; i < d; i++) buf[i] = (r() * 2 - 1) * bright;
  let idx = 0, last = 0;
  const i0 = Math.floor(t0 * SR);
  for (let i = 0; i < n; i++) {
    const cur = buf[idx];
    const v = (cur + last) * 0.5 * decay;
    buf[idx] = v;
    last = cur;
    idx = (idx + 1) % d;
    const env = Math.min(1, i / (SR * 0.004)) * (1 - i / n) ** 1.6;
    const s = cur * amp * env;
    pan(i0 + i, o.pan ?? 0, s, s);
  }
}

/** FM 钟 / 马林巴 */
function bell(t0, freq, dur, amp, o = {}) {
  const ratio = o.ratio ?? 3.01;
  const index = o.index ?? 2.2;
  const i0 = Math.floor(t0 * SR);
  const n = Math.floor(dur * SR);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const env = Math.exp(-t * (o.damp ?? 3.2)) * Math.min(1, t / 0.002);
    const m = Math.sin(TAU * freq * ratio * t) * index * Math.exp(-t * 6);
    const s = Math.sin(TAU * freq * t + m) * env * amp;
    pan(i0 + i, o.pan ?? 0, s, s);
  }
}

/** 气声笛：正弦 + 颤音 + 一点气 */
function flute(t0, freq, dur, amp, o = {}) {
  // 木笛：基音 + 一点二次谐波，再走一个低通。
  // 原来那版把气噪全留下了、谐波又高，靠近 1kHz 时听着扎耳朵。
  const i0 = Math.floor(t0 * SR);
  const n = Math.floor(dur * SR);
  const fc = Math.min(1500, Math.max(700, freq * 1.9));
  const cut = 1 - Math.exp((-TAU * fc) / SR);
  let lp = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const vib = Math.sin(TAU * 4.6 * t) * (o.vib ?? 0.004) * Math.min(1, Math.max(0, (t - 0.18) / 0.4));
    const env = Math.min(1, t / 0.09) * Math.min(1, Math.max(0, (dur - t) / 0.22));
    const w = Math.sin(TAU * freq * (1 + vib) * t) + Math.sin(TAU * freq * 2 * (1 + vib) * t) * 0.14;
    lp += (w - lp) * cut;
    const s = lp * env * amp * 1.15;
    pan(i0 + i, o.pan ?? 0, s, s);
  }
}

/** 带蜂鸣的弹拨（西塔琴/筝的味道） */
function buzz(t0, freq, dur, amp, o = {}) {
  const i0 = Math.floor(t0 * SR);
  const n = Math.floor(dur * SR);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const env = Math.exp(-t * (o.damp ?? 2.6)) * Math.min(1, t / 0.003);
    const s = (Math.sin(TAU * freq * t) * 0.7 + Math.sin(TAU * freq * 2.01 * t) * 0.2 * Math.min(1, t * 8) + Math.sin(TAU * freq * 3.02 * t) * 0.1 * Math.min(1, t * 12)) * env * amp;
    pan(i0 + i, o.pan ?? 0, s, s);
  }
}

/** 铺垫：三个失谐锯齿 + 一阶低通 */
function pad(t0, freqs, dur, amp, o = {}) {
  const i0 = Math.floor(t0 * SR);
  const n = Math.floor(dur * SR);
  const det = [-0.006, 0, 0.007];
  let lp = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const atk = o.atk ?? 0.5;
    const rel = o.rel ?? 0.9;
    const env = Math.min(1, t / atk) * Math.min(1, Math.max(0, (dur - t) / rel));
    let s = 0;
    for (let k = 0; k < freqs.length; k++) {
      for (let d = 0; d < 3; d++) {
        const f = freqs[k] * (1 + det[d]);
        s += (((f * t) % 1) * 2 - 1) * 0.09;
      }
    }
    lp += (s - lp) * (o.cut ?? 0.06);
    const out = lp * env * amp;
    pan(i0 + i, o.pan ?? 0, out, out);
  }
}

/** 低音：正弦 + 轻微饱和 */
function bass(t0, freq, dur, amp, o = {}) {
  const i0 = Math.floor(t0 * SR);
  const n = Math.floor(dur * SR);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const env = Math.min(1, t / 0.02) * Math.min(1, Math.max(0, (dur - t) / 0.12));
    const s = Math.tanh(Math.sin(TAU * freq * t) * 1.6) * env * amp;
    pan(i0 + i, 0, s, s);
  }
}

/** 鼓：低频扫频 + 点击 */
function kick(t0, amp) {
  const i0 = Math.floor(t0 * SR);
  const n = Math.floor(0.28 * SR);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const f = 96 * Math.exp(-t * 26) + 42;
    const env = Math.exp(-t * 9);
    const s = (Math.sin(TAU * f * t) + (i < 90 ? (Math.random() * 2 - 1) * 0.4 : 0)) * env * amp;
    pan(i0 + i, 0, s, s);
  }
}

/** 木鱼 / 木板 */
function wood(t0, amp, o = {}) {
  const i0 = Math.floor(t0 * SR);
  const n = Math.floor(0.09 * SR);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const env = Math.exp(-t * (o.damp ?? 55));
    const f = o.f ?? 880;
    const s = (Math.sin(TAU * f * t) * 0.7 + Math.sin(TAU * f * 2.7 * t) * 0.3) * env * amp;
    pan(i0 + i, o.pan ?? 0, s, s);
  }
}

/** 沙锤 / 细碎噪声 */
function shaker(t0, amp, o = {}) {
  const i0 = Math.floor(t0 * SR);
  const n = Math.floor(0.07 * SR);
  let hp = 0, last = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const w = Math.random() * 2 - 1;
    hp = 0.86 * (hp + w - last);
    last = w;
    const env = Math.exp(-t * 70);
    const s = hp * env * amp;
    pan(i0 + i, o.pan ?? 0, s, s);
  }
}

/** 风：低频噪声，慢慢起伏 */
function wind(t0, dur, amp) {
  const i0 = Math.floor(t0 * SR);
  const n = Math.floor(dur * SR);
  let lp = 0, lp2 = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const w = Math.random() * 2 - 1;
    lp += (w - lp) * 0.01;
    lp2 += (lp - lp2) * 0.05;
    const env = Math.min(1, t / 1.2) * Math.min(1, (dur - t) / 1.5) * (0.7 + 0.3 * Math.sin(t * 0.6));
    const s = lp2 * env * amp * 8;
    pan(i0 + i, 0, s, s);
  }
}

/** 换笔的气口：噪声扫频 */
function whoosh(t0, amp) {
  const i0 = Math.floor(t0 * SR);
  const n = Math.floor(0.6 * SR);
  let lp = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const k = t / 0.6;
    const cut = 0.02 + 0.5 * Math.exp(-Math.pow((k - 0.45) / 0.22, 2));
    const w = Math.random() * 2 - 1;
    lp += (w - lp) * cut;
    const env = Math.exp(-Math.pow((k - 0.45) / 0.22, 2));
    const s = lp * env * amp;
    pan(i0 + i, 0, s, s);
  }
}

/** 自行车：花鼓的细碎声，按轮速调制 */
function freewheel(t0, dur, amp) {
  const i0 = Math.floor(t0 * SR);
  const n = Math.floor(dur * SR);
  const hz = 7.5;                       // 每秒 7.5 转
  let lp = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const ph = (t * hz) % 1;
    const click = Math.exp(-ph * 24) * (Math.random() * 2 - 1);
    lp += (click - lp) * 0.5;
    const hum = Math.sin(TAU * 62 * t) * 0.012;
    const s = (lp * 0.5 + hum) * amp;
    pan(i0 + i, -0.2, s, s * 0.8);
  }
}

/** 短促的电子提示音 */
function blip(t0, freq, dur, amp) {
  bell(t0, freq, dur, amp, { ratio: 1.0, index: 0.6, damp: 5.5 });
}

/** 锣：低、长、带一点不谐和 */
function gong(t0, amp) {
  bell(t0, note(-24), 6.0, amp, { ratio: 1.41, index: 3.4, damp: 0.55 });
}

// ---------- 和声 ----------

// 每块三个和弦（一小节一个），用半音表示，相对 A
const PROG = [
  [[0, 3, 7], [-4, 0, 5], [-2, 2, 7]],        // sahara: Am F G
  [[0, 3, 7], [-4, 0, 5], [-5, 0, 3]],        // egypt: Am F E
  [[0, 3, 7], [-4, 2, 5], [-2, 2, 7]],        // han
  [[0, 4, 7], [-3, 2, 7], [-5, 0, 4]],        // tang: A D E
  [[0, 3, 7], [-2, 2, 5], [-5, 0, 3]],        // song
  [[0, 3, 7], [-4, 0, 5], [-2, 2, 7]],        // qingming
  [[0, 5, 7], [-2, 3, 7], [0, 3, 7]],         // maya
  [[0, 3, 7], [-3, 2, 5], [-5, 0, 3]],        // mughal
  [[0, 3, 7], [0, 3, 7], [-5, 0, 3]],         // bada: 极静
  [[0, 3, 7], [-2, 3, 7], [-5, 2, 5]],        // wayang
  [[0, 4, 7], [-3, 2, 7], [-2, 3, 7]],        // ukiyo
  [[0, 3, 7], [-4, 0, 5], [-3, 2, 7]],        // starry
  [[0, 1, 7], [-1, 3, 6], [0, 2, 7]],         // scream: 不协和
  [[0, 3, 7], [-1, 2, 6], [-5, 0, 3]],        // nosferatu
  [[0, 7, 12], [0, 5, 10], [-5, 2, 7]],       // scope
  [[0, 4, 7], [-2, 2, 7], [-5, 0, 4]],        // pixel
  [[0, 3, 7], [-3, 2, 7], [-4, 0, 5]],        // chat
  [[0, 3, 7], [-2, 3, 7], [-3, 2, 7]],        // vapor
  [[0, 3, 10], [-2, 2, 7], [-5, 0, 3]],       // vert
  [[0, 7, 12], [-3, 4, 9], [-5, 0, 7]],       // code
];

// 每块的主音色：lead 类型、perc 类型、pad 量、bass 量
const TONE = [
  { lead: 'flute', perc: 'hand', pad: 0.4, bass: 0.5, kick: 0.35, oct: -12, leadAmp: 0.05, cut: 0.07 },
  { lead: 'pluck', perc: 'hand', pad: 0.35, bass: 0.45, kick: 0.3 },
  { lead: 'bell', perc: 'wood', pad: 0.28, bass: 0.4, kick: 0.28 },
  { lead: 'pluck', perc: 'none', pad: 0.35, bass: 0.32, kick: 0 },
  { lead: 'flute', perc: 'none', pad: 0.36, bass: 0.3, kick: 0, oct: -12, leadAmp: 0.045, cut: 0.065 },
  { lead: 'pluck', perc: 'wood', pad: 0.3, bass: 0.38, kick: 0.2 },
  { lead: 'bell', perc: 'hand', pad: 0.3, bass: 0.4, kick: 0.34 },
  { lead: 'buzz', perc: 'hand', pad: 0.3, bass: 0.4, kick: 0.3 },
  { lead: 'pluck', perc: 'none', pad: 0.06, bass: 0.22, kick: 0 },
  { lead: 'bell', perc: 'wood', pad: 0.35, bass: 0.45, kick: 0.4 },
  { lead: 'pluck', perc: 'none', pad: 0.4, bass: 0.34, kick: 0.12 },
  { lead: 'bell', perc: 'none', pad: 0.62, bass: 0.3, kick: 0.1 },
  { lead: 'buzz', perc: 'kick', pad: 0.4, bass: 0.5, kick: 0.55 },
  { lead: 'bell', perc: 'none', pad: 0.45, bass: 0.42, kick: 0.25 },
  { lead: 'bell', perc: 'tick', pad: 0.2, bass: 0.5, kick: 0.2 },
  { lead: 'pluck', perc: 'tick', pad: 0.22, bass: 0.45, kick: 0.3 },
  { lead: 'bell', perc: 'none', pad: 0.3, bass: 0.3, kick: 0.06 },
  { lead: 'buzz', perc: 'shaker', pad: 0.55, bass: 0.5, kick: 0.5 },
  { lead: 'buzz', perc: 'shaker', pad: 0.35, bass: 0.6, kick: 0.62 },
  { lead: 'bell', perc: 'tick', pad: 0.25, bass: 0.35, kick: 0.1 },
];

function lead(type, t, freq, dur, amp, seed) {
  if (type === 'pluck') pluck(t, freq, dur, amp, { bright: 0.55, decay: 0.99996, seed });
  else if (type === 'bell') bell(t, freq, dur, amp, { ratio: 3.01, index: 2.0, damp: 2.6, seed });
  else if (type === 'flute') flute(t, freq, dur, amp, { seed, vib: 0.007 });
  else buzz(t, freq, dur, amp, { damp: 2.4 });
}

// ---------- 编排 ----------

// 0–1：纸与风
wind(0, 5.2, 0.05);
// 引子：一根低音 A 慢慢起来
bass(0.4, note(-12), 4.6, 0.22, {});
pad(0.2, [note(0), note(7), note(12)], 4.7, 0.12, { atk: 1.6, rel: 0.8, cut: 0.1 });
// 引子的四声
for (let i = 0; i < 4; i++) {
  bell(1.0 + i, note([0, 7, 12, 15][i]), 2.2, 0.09, { ratio: 2.01, index: 1.4, damp: 1.6 });
}
whoosh(4.7, 0.05);

// 二十块
for (let k = 0; k < 20; k++) {
  const t0 = INTRO_END + k * PANEL_DUR;
  const tone = TONE[k];
  const prog = PROG[k];
  const r = rng(101 + k * 7);

  // 换笔：每一块的接缝处都有一口气
  whoosh(t0 - 0.18, 0.055);

  // 自行车一直在
  freewheel(t0, PANEL_DUR, 0.05);

  // 低音：每小节两下
  for (let bar = 0; bar < 3; bar++) {
    const ch = prog[bar];
    const bt = t0 + bar * BAR;
    bass(bt, note(ch[0] - 12), 0.85, tone.bass * 0.5);
    bass(bt + 1.0, note(ch[0] - 5), 0.42, tone.bass * 0.3);
    // 铺垫
    pad(bt + 0.02, ch.map((s) => note(s)), BAR - 0.04, tone.pad * 0.16, { atk: 0.45, rel: 0.7, cut: tone.cut ?? 0.13 });
  }

  // 旋律：每块 5 个音，落在拍点上，音高从和弦里取（八大那块只留一声）
  const motif = [0, 2, 1, 3, 2];
  const beats = [0.0, 0.5, 2.0, 3.5, 4.5];
  const oct = (k === 8 ? -12 : 0) + (tone.oct || 0);
  for (let i = 0; i < (k === 8 ? 1 : 5); i++) {
    const ch = prog[Math.min(2, Math.floor(beats[i] / 2))];
    const deg = ch[(motif[i] + k) % 3] + (r() > 0.72 ? 12 : 0) + oct;
    const tt = t0 + beats[i] * BEAT * 2 + (r() - 0.5) * 0.012;
    lead(tone.lead, tt, note(deg + 12), 1.1 + r() * 0.8, tone.leadAmp ?? 0.085, 3 + i);
  }

  // 打击
  if (k === 8) {
    // 八大：只剩一笔
  } else if (tone.kick > 0) {
    kick(t0, tone.kick * 0.5);
    kick(t0 + BAR, tone.kick * 0.32);
    kick(t0 + BAR * 2, tone.kick * 0.42);
  }
  if (tone.perc === 'wood') {
    for (let i = 0; i < 6; i++) wood(t0 + i * 0.75, 0.05, { f: 760 + (i % 3) * 90, pan: -0.2 });
  } else if (tone.perc === 'hand') {
    for (let i = 0; i < 6; i++) wood(t0 + i * 0.75 + 0.25, 0.06, { f: 210, damp: 26, pan: 0.25 });
  } else if (tone.perc === 'tick') {
    for (let i = 0; i < 12; i++) shaker(t0 + i * 0.5, 0.035, { pan: 0.3 });
  } else if (tone.perc === 'shaker') {
    for (let i = 0; i < 8; i++) shaker(t0 + i * 0.75, 0.05, { pan: -0.3 });
  }

  // —— 每块自己的记号音 ——
  if (k === 9) gong(t0 + 0.02, 0.16);                       // 皮影：开场锣
  if (k === 12) {                                          // 星夜：钢片琴的琶音
    for (let i = 0; i < 6; i++) blip(t0 + 0.5 + i * 0.5, note([12, 19, 16, 24, 19, 28][i]), 1.6, 0.05);
  }
  if (k === 15) {                                          // 示波器：两个纯音
    blip(t0 + 0.45, 880, 0.5, 0.06);
    blip(t0 + 1.05, 1320, 0.45, 0.05);
  }
  if (k === 16) {                                          // 聊天：消息提示
    [1.05, 1.7, 2.45, 3.1, 3.95, 4.6].forEach((bt, i) => blip(t0 + bt, note(i % 2 ? 19 : 12), 0.22, 0.05));
  }
  if (k === 19) {                                          // 代码：打字机
    for (let i = 0; i < 26; i++) {
      shaker(t0 + 0.4 + i * 0.16, 0.018 + (i % 3) * 0.004, { pan: 0.4 });
    }
    wood(t0 + 4.3, 0.05, { f: 320, damp: 40 });
  }
  if (k === 13) {                                          // 呐喊：一声闷响
    kick(t0 + 0.02, 0.5);
    kick(t0 + 0.28, 0.28);
  }
}

// 尾声：125–137
const tOut = OUTRO_START;
whoosh(tOut - 0.2, 0.05);
wind(tOut, 12, 0.04);
pad(tOut + 0.2, [note(0), note(3), note(7), note(12)], 6.5, 0.16, { atk: 1.2, rel: 2.0, cut: 0.09 });
bass(tOut + 0.2, note(-12), 6.2, 0.2);
// 稀疏的钟，越来越慢
const tail = [0, 1.5, 3.5, 6.0, 9.0];
for (let i = 0; i < tail.length; i++) {
  bell(tOut + 0.4 + tail[i], note([12, 7, 15, 12, 19][i]), 3.0, 0.075 - i * 0.008, { ratio: 2.01, index: 1.2, damp: 1.2 });
}
// 最后一记
bass(135.4, note(-24), 1.6, 0.26);
kick(135.4, 0.22);
pad(135.2, [note(0), note(7), note(12), note(19)], 1.8, 0.12, { atk: 0.05, rel: 1.0, cut: 0.08 });

// ---------- 归一化 ----------
let peak = 0;
for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
const g = peak > 0 ? 0.89 / peak : 1;

// 软限幅
const soft = (x) => Math.tanh(x * 1.05) * 0.98;
const outN = Math.floor(DURATION * SR) + Math.floor(0.6 * SR);
const buf = Buffer.alloc(44 + outN * 4);
buf.write('RIFF', 0);
buf.writeUInt32LE(36 + outN * 4, 4);
buf.write('WAVE', 8);
buf.write('fmt ', 12);
buf.writeUInt32LE(16, 16);
buf.writeUInt16LE(1, 20);
buf.writeUInt16LE(2, 22);
buf.writeUInt32LE(SR, 24);
buf.writeUInt32LE(SR * 4, 28);
buf.writeUInt16LE(4, 32);
buf.writeUInt16LE(16, 34);
buf.write('data', 36);
buf.writeUInt32LE(outN * 4, 40);
let p = 44;
for (let i = 0; i < outN; i++) {
  const l = soft((L[i] || 0) * g);
  const r = soft((R[i] || 0) * g);
  buf.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(l * 32767))), p); p += 2;
  buf.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(r * 32767))), p); p += 2;
}

fs.mkdirSync('out', { recursive: true });
fs.writeFileSync(path.join('out', 'score.wav'), buf);

// 每块的电平，做一次自检
let report = [];
for (let k = 0; k < 20; k++) {
  const t0 = INTRO_END + k * PANEL_DUR;
  let s = 0, n = 0;
  for (let i = Math.floor(t0 * SR); i < Math.floor((t0 + PANEL_DUR) * SR); i += 32) {
    s += L[i] * L[i] + R[i] * R[i];
    n += 2;
  }
  report.push(`${String(k + 1).padStart(2, '0')} ${DEFS[k].id.padEnd(10)} ${(20 * Math.log10(Math.sqrt(s / n) + 1e-9)).toFixed(1)} dB`);
}
console.log(report.join('\n'));
console.log(`peak ${(20 * Math.log10(peak + 1e-9)).toFixed(1)} dBFS, gain ${g.toFixed(2)}, ${(outN / SR).toFixed(2)}s`);
