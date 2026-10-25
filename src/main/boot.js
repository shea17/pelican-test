// boot —— 建画布、挂覆盖层、播放控制、逐帧导出入口。
import * as TL from '../beat/timeline.js';
import { W, H } from './camera.js';
import { PANELS, initOverlay, renderFrame } from './stage.js';

import s01 from '../scenes/s01_sahara.js';
import s02 from '../scenes/s02_egypt.js';
import s03 from '../scenes/s03_han.js';
import s04 from '../scenes/s04_tang.js';
import s05 from '../scenes/s05_song.js';
import s06 from '../scenes/s06_qingming.js';
import s07 from '../scenes/s07_maya.js';
import s08 from '../scenes/s08_mughal.js';
import s09 from '../scenes/s09_bada.js';
import s10 from '../scenes/s10_wayang.js';
import s11 from '../scenes/s11_ukiyo.js';
import s12 from '../scenes/s12_starry.js';
import s13 from '../scenes/s13_scream.js';
import s14 from '../scenes/s14_nosferatu.js';
import s15 from '../scenes/s15_scope.js';
import s16 from '../scenes/s16_pixel.js';
import s17 from '../scenes/s17_chat.js';
import s18 from '../scenes/s18_vapor.js';
import s19 from '../scenes/s19_vert.js';
import s20 from '../scenes/s20_code.js';

const ALL = [s01, s02, s03, s04, s05, s06, s07, s08, s09, s10, s11, s12, s13, s14, s15, s16, s17, s18, s19, s20];

const RAW = new URLSearchParams(location.search).has('raw');
let T = 0;
let playing = false;
let last = 0;

function fit() {
  const fr = document.getElementById('frame');
  const s = Math.min(window.innerWidth / W, (window.innerHeight - (RAW ? 0 : 118)) / H);
  fr.style.transform = `translate(-50%, -50%) scale(${s.toFixed(4)})`;
}

window.setup = () => {
  const c = createCanvas(W, H, WEBGL);
  c.parent('frame');
  c.id('gl');
  pixelDensity(1);

  const ov = document.createElement('canvas');
  ov.id = 'ui2d';
  ov.width = W;
  ov.height = H;
  document.getElementById('frame').appendChild(ov);

  const snap = document.createElement('canvas');
  snap.width = W;
  snap.height = H;

  initOverlay(ov.getContext('2d'), snap.getContext('2d'));
  PANELS.length = 0;
  for (const p of ALL) PANELS.push(p);

  noLoop();
  if (RAW) document.body.dataset.view = 'raw';
  fit();
  window.addEventListener('resize', fit);

  buildBar();
  window.__ready = true;
  if (!RAW) loop();
};

window.draw = () => {
  renderFrame(T);
};

// —— 播放控制 ——
function buildBar() {
  const track = document.getElementById('track');
  const fill = document.getElementById('fill');
  const knob = document.getElementById('knob');
  const clock = document.getElementById('clock');
  const now = document.getElementById('now');
  const play = document.getElementById('play');
  const ticks = document.getElementById('ticks');

  for (let i = 0; i <= 20; i++) {
    const el = document.createElement('i');
    el.className = 'scene';
    el.style.left = `${((TL.INTRO_END + i * TL.PANEL_DUR) / TL.DURATION) * 100}%`;
    ticks.appendChild(el);
  }

  const seek = (e) => {
    const r = track.getBoundingClientRect();
    T = Math.max(0, Math.min(TL.DURATION - 0.001, ((e.clientX - r.left) / r.width) * TL.DURATION));
    update();
    redraw();
  };
  track.addEventListener('pointerdown', (e) => {
    seek(e);
    track.setPointerCapture(e.pointerId);
    track.onpointermove = seek;
    track.onpointerup = () => {
      track.onpointermove = null;
      track.onpointerup = null;
    };
  });

  play.addEventListener('click', () => {
    playing = !playing;
    play.textContent = playing ? '暂停' : '播放';
    if (playing) {
      if (T >= TL.DURATION - 0.05) T = 0;
      last = performance.now();
    }
  });

  function update() {
    const pct = (T / TL.DURATION) * 100;
    fill.style.width = `${pct}%`;
    knob.style.left = `${pct}%`;
    const mm = Math.floor(T / 60), ss = Math.floor(T % 60);
    clock.textContent = `${mm}:${String(ss).padStart(2, '0')} / 2:17`;
    track.setAttribute('aria-valuenow', T.toFixed(1));
    const k = TL.sceneIndexAt(T);
    let label;
    if (T < TL.INTRO_END) label = '<b>引子</b> <span>一本正经地胡说</span>';
    else if (T >= TL.OUTRO_START) label = '<b>尾声</b> <span>新闻发布会</span>';
    else {
      const s = TL.scenes[k];
      label = `<b>${String(s.num).padStart(2, '0')}　${s.cn}</b> <span>${s.en} · ${s.era}</span>`;
    }
    now.innerHTML = label;
  }
  window.__updateBar = update;
  update();
}

// p5 的 loop 里推进时间
const origDraw = window.draw;
window.draw = () => {
  if (playing) {
    const now = performance.now();
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    T += dt;
    if (T >= TL.DURATION) {
      T = TL.DURATION - 0.001;
      playing = false;
      const p = document.getElementById('play');
      if (p) p.textContent = '播放';
    }
  }
  if (window.__updateBar) window.__updateBar();
  origDraw();
};

// 逐帧导出
window.renderAt = (t) => {
  T = t;
  redraw();
  return true;
};
window.__duration = TL.DURATION;
