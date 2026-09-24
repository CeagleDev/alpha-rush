/**
 * hud.js — the racing HUD (in play), the death card fill and the toasts. (UI pass 2: "more exciting")
 *
 *   init(ctx)     builds the in-play HUD inside #hud (nothing visible when config.NOHUD), wires overlays to events
 *   update(dt)    refreshes the numbers only when a displayed value changes (no DOM churn)
 *
 * Layout (index.html owns the CSS): top-left SCORE (punches 1.15 -> 1 on every Alpha) with the multiplier
 * chip (flares when it changes) and the distance + zone under it, then the ACTIVE POWER-UP BADGES (the same
 * SVG emblems as the power-ups page, each in a draining ring with the seconds left); top-right the PAUSE
 * button (#pauseb, 48 px, main.js wires it), the ALPHA counter with the tau mark and the STREAK chip
 * ("x12 ALPHA STREAK", from 5 in a row; a 1.5 s gap ends the streak). Bottom-left the SPEED GAUGE (SVG arc,
 * km/h inside), bottom-centre the PACK meter with the dog icon, `.perf` bottom-right. Short banners slide
 * through the 24-30 % band: ZONE BANNER on every 'zone' event (ramps excepted), a gold one on 'reveal', a
 * distance MILESTONE flash every 500 m, toasts under the top row. Nothing sits over the runner (35-70 %).
 * SURGE (state.surgeT > 0): #hud gets .surge — a cyan/magenta energy bar across the top + a screen-edge glow.
 *
 * Reads state: score, mult, x2T, coins, distance, speed, zone, packDist, magnetT/shieldT/x2T/sneakT/surgeT,
 * powerDur, fps, draws, tris. Listens: 'start' (hide #home/#dead, show #hud), 'death' (fill #dead, hide #hud,
 * show the card after the fall), 'quit', 'restart', 'coin', 'zone', 'reveal', 'powerup', 'shieldbreak',
 * 'mission', 'missionset', 'achievement', 'daily', 'hit'. Buttons (#restartb, #d-home, #pauseb) are wired by main.js.
 */
import config from './config.js?v=202609242356';
import { ICON, POWER_UI } from './home.js?v=202609242356';

let ctx = null, state = null;
let root = null, el = {};
let shown = {};
let perfT = 0, streak = 0, streakT = 0, lastCoinT = 0, timeT = 0;
const POWER_KEYS = ['magnet', 'omamori', 'x2', 'sneakers', 'surge'];
const SURGE_DUR = 8;
const RING_C = 2 * Math.PI * 22;            // badge ring circumference (r = 22 in a 50 px box)
const ARC_LEN = 176.6;                      // speed arc length (r = 46, 220 degrees)
let toastT = 0, bannerT = 0, mileT = 0;
function toast(text, ms = 2200, cls = '') {
  if (!el.toast) return;
  el.toast.textContent = text; el.toast.className = 'toast on' + (cls ? ' ' + cls : '');
  clearTimeout(toastT); toastT = setTimeout(() => el.toast.classList.remove('on'), ms);
}
/** Re-trigger a CSS animation class. */
function retrigger(e, cls) { if (!e) return; e.classList.remove(cls); void e.offsetWidth; e.classList.add(cls); }
function banner(html, gold) {
  if (!el.banner) return;
  el.banner.className = 'banner on' + (gold ? ' gold' : '');
  el.banner.innerHTML = `<i>${html}</i>`;
  clearTimeout(bannerT); bannerT = setTimeout(() => { el.banner.className = 'banner'; }, 1650);
}
function milestone(m) {
  if (!el.mile) return;
  el.mile.innerHTML = `${m.toLocaleString('en-US')} M<small>distance</small>`;
  retrigger(el.mile, 'on');
  clearTimeout(mileT); mileT = setTimeout(() => el.mile.classList.remove('on'), 1150);
}

const ZONE_LABEL = { day: 'morning market', alleyA: 'yokocho', rampUp: 'ramp', expressway: 'expressway', rampDown: 'ramp', alleyB: 'market', rooftops: 'rooftops', torii: 'shrine path' };
const MISSION_ICON = { coin: 'coins', dist: 'flag', score: 'star', jump: 'jump', roll: 'slide', powerup: 'bolt', clean: 'shield' };

/** Missions + best on the death card (progress.js owns the numbers). */
function fillMeta() {
  const P = ctx.modules && ctx.modules.progress; const sum = P && P.summary ? P.summary() : null; if (!sum) return;
  const html = `<div class="mhd"><span>missions · set ${sum.set + 1}</span><span>multiplier x${sum.mult}</span></div>` +
    sum.missions.map((m) => `<div class="m${m.done ? ' done' : ''}"><span>${ICON[MISSION_ICON[m.id]] || ICON.flag}${m.text}</span><em>${m.done ? 'DONE' : `${m.have}/${m.goal}`}</em></div>`).join('');
  const e = document.getElementById('d-missions'); if (e) e.innerHTML = html;
  const b = document.getElementById('d-best'); if (b) b.textContent = String(sum.best);
  const nb = document.getElementById('d-newbest'); if (nb) nb.classList.toggle('on', sum.newBest);
}

function build() {
  root.innerHTML = '';
  // SURGE layers first (behind everything)
  el.edge = document.createElement('div'); el.edge.className = 'edge';
  el.surgebar = document.createElement('div'); el.surgebar.className = 'surgebar'; el.surgebar.innerHTML = '<b></b>'; el.surgeFill = el.surgebar.firstChild;
  el.surgetag = document.createElement('div'); el.surgetag.className = 'surgetag d'; el.surgetag.textContent = 'ALPHA SURGE';
  const top = document.createElement('div'); top.className = 'top';
  const left = document.createElement('div');
  const lbl = document.createElement('div'); lbl.className = 'lbl'; lbl.textContent = 'SCORE';
  el.score = document.createElement('div'); el.score.className = 'score d num'; el.score.textContent = '0';
  el.mult = document.createElement('span'); el.mult.className = 'mult d num'; el.mult.textContent = 'x1';
  const scoreRow = document.createElement('div'); scoreRow.className = 'scorerow'; scoreRow.append(el.score, el.mult);
  el.dist = document.createElement('div'); el.dist.className = 'dist d num'; el.dist.innerHTML = '<span>0</span><small>m</small><small class="z"></small>';
  el.distN = el.dist.querySelector('span'); el.zone = el.dist.querySelector('.z');
  left.append(lbl, scoreRow, el.dist);
  // active power-up badges: emblem in a draining ring
  el.badges = document.createElement('div'); el.badges.className = 'badges';
  el.pw = {};
  for (const k of POWER_KEYS) {
    const u = POWER_UI[k];
    const b = document.createElement('div'); b.className = 'bd pw-' + k; b.style.setProperty('--pc', u.color);
    b.innerHTML = `<svg class="ring" viewBox="0 0 50 50"><circle class="bg" cx="25" cy="25" r="22"/><circle class="fg" cx="25" cy="25" r="22" stroke-dasharray="${RING_C.toFixed(1)}" stroke-dashoffset="0"/></svg>${ICON[u.icon].replace('<svg ', '<svg class="ico" ')}<span class="t"></span>`;
    el.pw[k] = { row: b, ring: b.querySelector('.fg'), t: b.querySelector('.t'), on: false, off: -1, sec: -1, key: u.key, dur: u.dur };
    el.badges.append(b);
  }
  left.append(el.badges);
  const right = document.createElement('div'); right.className = 'right';
  el.pause = document.createElement('button'); el.pause.id = 'pauseb'; el.pause.className = 'pauseb'; el.pause.type = 'button';
  el.pause.setAttribute('aria-label', 'Pause'); el.pause.innerHTML = '<i></i>';
  el.coins = document.createElement('div'); el.coins.className = 'coins d num';
  el.coins.innerHTML = ICON.tau + '<span>0</span><small>alpha</small>';
  el.coinsN = el.coins.querySelector('span');
  el.streak = document.createElement('div'); el.streak.className = 'streak d num';
  right.append(el.pause, el.coins, el.streak);
  top.append(left, right);
  el.banner = document.createElement('div'); el.banner.className = 'banner';
  el.mile = document.createElement('div'); el.mile.className = 'mile d num';
  el.toast = document.createElement('div'); el.toast.className = 'toast';
  // speed gauge: a 220-degree arc with the km/h inside
  el.gauge = document.createElement('div'); el.gauge.className = 'gauge';
  el.gauge.innerHTML = `<svg viewBox="0 0 124 84"><defs><linearGradient id="g-speed" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#22e8ff"/><stop offset=".6" stop-color="#22e8ff"/><stop offset="1" stop-color="#ff2d95"/></linearGradient></defs>
    <path class="arcbg" d="M18.8 73.7A46 46 0 1 1 105.2 73.7"/><path class="arc" d="M18.8 73.7A46 46 0 1 1 105.2 73.7" stroke-dasharray="${ARC_LEN}" stroke-dashoffset="${ARC_LEN}"/>
    <path class="ticks" d="M62 8v5M28 26l3.5 3.5M96 26l-3.5 3.5M14 56h5M110 56h-5"/></svg><div class="v d num"><span>0</span><small>km/h</small></div>`;
  el.speedN = el.gauge.querySelector('span'); el.arc = el.gauge.querySelector('.arc');
  el.pack = document.createElement('div'); el.pack.className = 'pack';
  el.pack.innerHTML = `<div class="plbl">${ICON.dog}pack</div><div class="bar"><div class="fill"></div></div>`;
  el.packFill = el.pack.querySelector('.fill');
  el.perf = document.createElement('div'); el.perf.className = 'perf';
  root.append(el.edge, el.surgebar, el.surgetag, top, el.banner, el.mile, el.toast, el.gauge, el.pack, el.perf);
}

function show(id, on) { const e = document.getElementById(id); if (e) e.classList.toggle('on', !!on); }
function showHud(on) { if (root && !config.NOHUD) root.classList.toggle('on', !!on); }
function resetShown() {
  shown = { score: -1, mult: -1, coins: -1, dist: -1, zone: '', pack: -1, hot: null, kmh: -1, arc: -1, mile: 0, surge: false, surgeW: -1 };
  streak = 0; lastCoinT = 0; timeT = 0;
  if (el.streak) el.streak.classList.remove('on');
  if (root) root.classList.remove('surge');
}

function fillDeath() {
  const set = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
  set('d-score', String(Math.floor(state.score)));
  set('d-dist', `${Math.floor(state.distance)} m`);
  set('d-coins', String(state.coins | 0));
}

export async function init(c) {
  ctx = c; state = c.state;
  root = document.getElementById('hud');
  if (root && !config.NOHUD) build();
  resetShown();

  c.events.on('start', () => { show('home', false); show('dead', false); showHud(true); resetShown(); });
  // the overlay used to appear on the very frame of death, hiding the 0.8 s fall and the dogs'
  // run-up behind a dimmed panel. Let it play, then show the card.
  c.events.on('death', (p) => {
    // QA 2026-09-21: the card said "caught, the pack got you" after a head-on crash into a van
    const crash = p && p.reason === 'block';
    const h = document.getElementById('d-h1'), t = document.getElementById('d-tag');
    if (h) h.textContent = crash ? 'CRASHED' : 'CAUGHT';
    if (t) t.textContent = crash ? 'straight into it' : 'the pack got you';
  });
  c.events.on('death', () => { fillDeath(); fillMeta(); showHud(false); setTimeout(() => { if (c.state.over) show('dead', true); }, 1400); });
  c.events.on('restart', () => { show('dead', false); });
  c.events.on('quit', () => { showHud(false); show('dead', false); });
  c.events.on('coin', () => {
    if (!el.score || config.NOHUD) return;
    retrigger(el.score, 'punch');
    streak = (timeT - lastCoinT) <= 1.5 ? streak + 1 : 1; lastCoinT = timeT;
    if (streak >= 5) { el.streak.textContent = `x${streak} ALPHA STREAK`; retrigger(el.streak, 'on'); }
  });
  // Location banners REMOVED (owner, 2026-09-24: "that pop up that shows you just entered location, remove
  // it"). The small zone chip in the header still names where you are; the reveal only updates the home tile.
  c.events.on('powerup', (p) => toast(`${(p && p.label) || (POWER_UI[p && p.type] || {}).name || 'power-up'}!`, 1400));
  c.events.on('shieldbreak', () => toast('the charm saved you', 1600));
  c.events.on('mission', (p) => toast(`mission done · ${p.text}`, 2600));
  c.events.on('missionset', (p) => toast(`all three done · multiplier now x${p.mult}`, 3200));
  c.events.on('achievement', (p) => toast(`achievement · ${p.name}${p.pay ? ` · +${p.pay} alpha` : ''}`, 2800, 'ach'));
  c.events.on('daily', (p) => toast(`daily task done · +${p.pay} alpha`, 2600, 'ach'));
  fillMeta();
  c.events.on('hit', () => { if (el.pack) { el.pack.classList.add('hot'); shown.hot = true; } });
}

export function update(dt) {
  if (!root || config.NOHUD || !root.classList.contains('on')) return;
  timeT += dt;
  const score = Math.floor(state.score);
  if (score !== shown.score) { shown.score = score; el.score.textContent = String(score); }
  const mult = state.mult || 1;
  if (mult !== shown.mult) {
    const first = shown.mult < 0; shown.mult = mult; el.mult.textContent = 'x' + mult; el.mult.classList.toggle('hot', (state.x2T || 0) > 0);
    if (!first) retrigger(el.mult, 'flare');
  }
  // streak ends after a 1.5 s gap
  if (streak > 0 && timeT - lastCoinT > 1.5) { streak = 0; el.streak.classList.remove('on'); }
  // power-up badges: ring drains from the effective duration (state.powerDur), seconds left under it
  const durs = state.powerDur || {};
  for (const k of POWER_KEYS) {
    const e = el.pw[k], t = state[e.key] || 0, on = t > 0;
    if (on !== e.on) { e.on = on; e.row.classList.toggle('on', on); if (!on) { e.off = -1; e.sec = -1; } }
    if (on) {
      const full = durs[k] || e.dur || 10, frac = Math.max(0, Math.min(1, t / full));
      const off = Math.round(RING_C * (1 - frac) * 2) / 2;
      if (off !== e.off) { e.off = off; e.ring.setAttribute('stroke-dashoffset', String(off)); }
      const sec = Math.ceil(t); if (sec !== e.sec) { e.sec = sec; e.t.textContent = sec + 's'; }
    }
  }
  // SURGE: energy bar + edge glow while state.surgeT > 0
  const surgeT = state.surgeT || 0, surge = surgeT > 0;
  if (surge !== shown.surge) { shown.surge = surge; root.classList.toggle('surge', surge); }
  if (surge) { const w = Math.round(100 * Math.min(1, surgeT / (durs.surge || SURGE_DUR))); if (w !== shown.surgeW) { shown.surgeW = w; el.surgeFill.style.transform = `scaleX(${w / 100})`; } }
  const coins = state.coins | 0;
  if (coins !== shown.coins) { shown.coins = coins; el.coinsN.textContent = String(coins); }
  const dist = Math.floor(state.distance);
  if (dist !== shown.dist) {
    shown.dist = dist; el.distN.textContent = String(dist);
    const m = Math.floor(dist / 500); if (m > shown.mile) { shown.mile = m; milestone(m * 500); }
  }
  const zone = state.zone || '';
  if (zone !== shown.zone) { shown.zone = zone; el.zone.textContent = '· ' + (ZONE_LABEL[zone] || zone); }

  // speed gauge: km/h, and the arc against the speed cap (half-percent steps)
  const kmh = Math.round((state.speed || 0) * 3.6);
  if (kmh !== shown.kmh) { shown.kmh = kmh; el.speedN.textContent = String(kmh); }
  const arc = Math.round(200 * Math.max(0, Math.min(1, (state.speed || 0) / (config.SPEED_MAX || 20)))) / 200;
  if (arc !== shown.arc) { shown.arc = arc; el.arc.setAttribute('stroke-dashoffset', (ARC_LEN * (1 - arc)).toFixed(1)); }

  // Pack meter: empty at ≥ PACK_DIST + 2 m, full at 1 m, red under 3 m.
  const pd = Number.isFinite(state.packDist) ? state.packDist : config.PACK_DIST;
  const fill = Math.round(100 * Math.max(0, Math.min(1, 1 - (pd - 1) / (config.PACK_DIST + 1))));
  if (fill !== shown.pack) { shown.pack = fill; el.packFill.style.width = `${fill}%`; }
  const hot = pd < 3;
  if (hot !== shown.hot) { shown.hot = hot; el.pack.classList.toggle('hot', hot); }

  perfT += dt;
  if (perfT > 0.5) {
    perfT = 0;
    el.perf.textContent = `${Math.round(state.fps)} fps · ${state.draws} dr · ${(state.tris / 1000).toFixed(0)}k tri`;
  }
}
