// 节拍与时间轴 —— 全片唯一事实来源。任何场景不得自己起拍。
export const BPM = 120;
export const BEAT = 60 / BPM;      // 0.5 s
export const BAR = 4 * BEAT;       // 2.0 s
export const T0 = 1.0;             // 拍点原点：0–1 s 是无拍引子

export const PANEL_BARS = 3;
export const PANEL_DUR = PANEL_BARS * BAR;  // 6.0 s
export const PANEL_W = 1800;                // 每个版块在长卷上的宽度（单位）
export const RIDER_AT = 0.42;               // 骑手固定在画面宽度的 42%

export const INTRO_END = T0 + 2 * BAR;                    // 5.0
export const OUTRO_BARS = 6;
export const OUTRO_START = INTRO_END + 20 * PANEL_DUR;     // 125.0
export const DURATION = OUTRO_START + OUTRO_BARS * BAR;    // 137.0

export const DEFS = [
  { id: 'sahara', cn: '撒哈拉岩画', en: 'Saharan Rock Art', era: '约前 4000', pal: ['#8d5a3b', '#2d1a12', '#e0a86a'] },
  { id: 'egypt', cn: '埃及壁画', en: 'Egyptian Tomb Wall', era: '约前 1300', pal: ['#e8d3a9', '#2f4a6d', '#b8792f'] },
  { id: 'han', cn: '汉画像石拓片', en: 'Han Stone Rubbing', era: '约 100', pal: ['#1b1b1b', '#f2eee2', '#8c8477'] },
  { id: 'tang', cn: '唐代白描', en: 'Tang Ink Outline', era: '约 750', pal: ['#f4efe2', '#241f1a', '#a89272'] },
  { id: 'song', cn: '宋代山水', en: 'Song Landscape', era: '约 1000', pal: ['#d9d2bf', '#2a2a26', '#7d6a4f'] },
  { id: 'qingming', cn: '清明上河图', en: 'Along the River', era: '约 1100', pal: ['#e3d8bf', '#33302a', '#8a6a45'] },
  { id: 'maya', cn: '玛雅抄本', en: 'Maya Codex', era: '约 1200', pal: ['#e6d7b0', '#3a2a1c', '#b0442c'] },
  { id: 'mughal', cn: '莫卧儿细密画', en: 'Mughal Miniature', era: '约 1600', pal: ['#f2e6c8', '#2f4f3a', '#c8a13c'] },
  { id: 'bada', cn: '八大山人写意', en: 'Bada Shanren', era: '约 1690', pal: ['#efeadc', '#1f1f1f', '#b03a2e'] },
  { id: 'wayang', cn: '爪哇皮影', en: 'Wayang Kulit', era: '约 1800', pal: ['#120d0a', '#e8b53c', '#7a3b1a'] },
  { id: 'ukiyo', cn: '浮世绘', en: 'Ukiyo-e · Tōkaidō', era: '1830s', pal: ['#e8dcc0', '#1d3a56', '#c4553a'] },
  { id: 'starry', cn: '星月夜', en: 'The Starry Night', era: '1889', pal: ['#1b2a52', '#e8d24a', '#4a78b0'] },
  { id: 'scream', cn: '呐喊', en: 'The Scream', era: '1893', pal: ['#c9682e', '#2b2340', '#e0b04a'] },
  { id: 'nosferatu', cn: '诺斯费拉图', en: 'Nosferatu', era: '1922', pal: ['#0d0f14', '#c9c4b4', '#5a6b7a'] },
  { id: 'scope', cn: '示波器', en: 'Oscilloscope', era: '1950s', pal: ['#050a06', '#39ff88', '#0e2418'] },
  { id: 'pixel', cn: '8-bit 像素', en: '8-bit Platformer', era: '1980s', pal: ['#1a1a3e', '#f0e8d8', '#e84a5f'] },
  { id: 'chat', cn: '聊天窗口', en: 'Early Chat Client', era: '2000s', pal: ['#3a6ea5', '#dfe6ef', '#8fa9c4'] },
  { id: 'vapor', cn: '蒸汽波', en: 'Vaporwave', era: '2010s', pal: ['#2b1b4d', '#ff8fd0', '#4de0d0'] },
  { id: 'vert', cn: '竖屏短视频', en: 'Vertical Short Video', era: '2020s', pal: ['#0e0e12', '#ffffff', '#ff3b5c'] },
  { id: 'code', cn: '代码美学', en: 'Code Aesthetic', era: '2020s', pal: ['#12151c', '#d8dee9', '#8fbf7f'] },
];

export const scenes = DEFS.map((d, i) => ({
  ...d,
  index: i,
  num: i + 1,
  t0: INTRO_END + i * PANEL_DUR,
  t1: INTRO_END + (i + 1) * PANEL_DUR,
}));

export const intro = { t0: 0, t1: INTRO_END };
export const outro = { t0: OUTRO_START, t1: DURATION };
export const SCENE_COUNT = scenes.length;

// ---------- 拍点 ----------
export const beats = (t) => (t - T0) / BEAT;
export const bars = (t) => (t - T0) / BAR;
export const barIndex = (t) => Math.floor(bars(t) + 1e-9);
/** 小节内第几拍（0..3，浮点） */
export const beatInBar = (t) => {
  const b = beats(t);
  return b - Math.floor(b / 4) * 4;
};
/** 在一拍上起跳的脉冲，1 → 0 衰减 */
export const pulse = (t, decay = 7) => Math.exp(-decay * frac(beats(t)));
/** 在强拍（每 2 拍 = 1 秒）上起跳的脉冲 */
export const strongPulse = (t, decay = 7) => Math.exp(-decay * frac(beats(t) / 2) * 2);

const frac = (x) => x - Math.floor(x);
export { frac };

/** 场景内经过了几秒（拍点时间，未量化） */
export const localT = (s, t) => t - s.t0;
/** 场景进度 0..1 —— 永远在 t1 到达 1，不受局部变速影响 */
export const progress = (s, t) => Math.min(1, Math.max(0, (t - s.t0) / (s.t1 - s.t0)));

/** 复古量化：把时间切成 1/hz 秒的台阶 */
export const step = (t, hz = 10) => Math.floor(t * hz + 1e-6) / hz;

/** 当前时刻对应哪个版块（0..19）；intro 返回 -1，outro 返回 SCENE_COUNT */
export function sceneIndexAt(t) {
  if (t < INTRO_END) return -1;
  if (t >= OUTRO_START) return SCENE_COUNT;
  return Math.min(SCENE_COUNT - 1, Math.floor((t - INTRO_END) / PANEL_DUR));
}

/** 离最近一次「穿框」还有多久（秒，带符号）；正数=还没穿，负数=已穿 */
export function untilCrossing(t) {
  const boundaries = [];
  for (let i = 0; i <= 20; i++) boundaries.push(INTRO_END + i * PANEL_DUR);
  boundaries.push(OUTRO_START);
  let best = Infinity;
  for (const b of boundaries) {
    const d = t - b;
    if (Math.abs(d) < Math.abs(best)) best = d;
  }
  return -best; // 负数表示靠近
}

export const CROSS_HALF = 0.26; // 穿框转场半宽（秒），强拍前后各 0.26
