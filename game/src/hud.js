/**
 * hud.js — the racing HUD (in play), the death card fill and the toasts. (E3, rebuilt for ALPHA RUSH, UI v2)
 *
 *   init(ctx)     builds the in-play HUD inside #hud (nothing visible when config.NOHUD), wires overlays to events
 *   update(dt)    refreshes the numbers only when a displayed value changes (no DOM churn)
 *
 * Layout (index.html owns the CSS): top-left SCORE (big) with the multiplier chip and the distance under it,
 * power-up timer bars below; top-right the PAUSE button (#pauseb, 48 px, main.js wires it) and the coin
 * counter with the τ mark; zone chip top-centre; bottom-left the speed readout (km/h from state.speed) with
 * a ten-segment bar; bottom-centre the pack meter; `.perf` bottom-right. Toasts drop in under the top row.
 *
 * Reads state: score, mult, x2T, coins, distance, speed, zone, packDist, magnetT/shieldT/x2T/sneakT, powerDur, fps,
 * draws, tris. Listens: 'start' (hide #home/#dead, show #hud), 'death' (fill #dead, hide #hud, show the card after
 * the fall), 'quit' (hide everything), 'restart', 'powerup', 'shieldbreak', 'mission', 'missionset', 'achievement',
 * 'daily', 'hit'. The buttons (#restartb, #d-home, #pauseb) are wired by main.js; this file only shows and hides.
 */
import config from './config.js?v=202609211652';

let ctx = null, state = null;
let root = null, el = {};
let shown = {};
let perfT = 0;
// [state key, label, powerups.TYPES key]
const POWER_ROWS = [['magnetT', 'magnet', 'magnet'], ['shieldT', 'charm', 'omamori'], ['x2T', 'x2 score', 'x2'], ['sneakT', 'super jump', 'sneakers']];
const POWER_DUR = { magnet: 10, omamori: 20, x2: 12, sneakers: 10 };   // fallback when state.powerDur is missing
const SEGS = 10;
let toastT = 0;
function toast(text, ms = 2200, cls = '') {
  if (!el.toast) return;
  el.toast.textContent = text; el.toast.className = 'toast on' + (cls ? ' ' + cls : '');
  clearTimeout(toastT); toastT = setTimeout(() => el.toast.classList.remove('on'), ms);
}

/** Missions + best on the death card (progress.js owns the numbers). */
function fillMeta() {
  const P = ctx.modules && ctx.modules.progress; const sum = P && P.summary ? P.summary() : null; if (!sum) return;
  const html = `<div class="mhead">missions · set ${sum.set + 1} · multiplier x${sum.mult}</div>` + sum.missions.map((m) => `<div class="m${m.done ? ' done' : ''}"><span>${m.done ? '✓' : '·'} ${m.text}</span><em>${m.done ? 'done' : `${m.have}/${m.goal}`}</em></div>`).join('');
  const e = document.getElementById('d-missions'); if (e) e.innerHTML = html;
  const b = document.getElementById('d-best'); if (b) b.textContent = String(sum.best);
  const nb = document.getElementById('d-newbest'); if (nb) nb.classList.toggle('on', sum.newBest);
}

const ZONE_LABEL = { day: 'morning market', alleyA: 'yokocho', rampUp: 'ramp', expressway: 'expressway', rampDown: 'ramp', alleyB: 'market', rooftops: 'rooftops', torii: 'shrine path' };

const TAU_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M3.5 4.5h17v3.4h-6.2v8.1c0 1.5.8 2.3 2.3 2.3h2.6v3.2h-3.4c-3.4 0-5.3-1.9-5.3-5.3V7.9H3.5z"/></svg>';

function build() {
  root.innerHTML = '';
  const top = document.createElement('div'); top.className = 'top';
  const left = document.createElement('div');
  const lbl = document.createElement('div'); lbl.className = 'lbl'; lbl.textContent = 'SCORE';
  el.score = document.createElement('div'); el.score.className = 'score d num'; el.score.textContent = '0';
  el.mult = document.createElement('span'); el.mult.className = 'mult d num'; el.mult.textContent = 'x1';
  const scoreRow = document.createElement('div'); scoreRow.className = 'scorerow'; scoreRow.append(el.score, el.mult);
  el.dist = document.createElement('div'); el.dist.className = 'dist d num'; el.dist.innerHTML = '<span>0</span><small>m</small>';
  el.distN = el.dist.querySelector('span');
  left.append(lbl, scoreRow, el.dist);
  // power-up timers: draining bars at the side of the screen (Subway Surfers)
  el.powers = document.createElement('div'); el.powers.className = 'powers';
  el.pw = {};
  for (const [k, label, type] of POWER_ROWS) {
    const row = document.createElement('div'); row.className = 'pw pw-' + k;
    row.innerHTML = `<span>${label}</span><i><b></b></i>`;
    el.pw[k] = { row, bar: row.querySelector('b'), on: false, w: -1, type };
    el.powers.append(row);
  }
  left.append(el.powers);
  const right = document.createElement('div'); right.className = 'right';
  el.pause = document.createElement('button'); el.pause.id = 'pauseb'; el.pause.className = 'pauseb'; el.pause.type = 'button';
  el.pause.setAttribute('aria-label', 'Pause'); el.pause.innerHTML = '<i></i>';
  el.coins = document.createElement('div'); el.coins.className = 'coins d num';
  el.coins.innerHTML = TAU_SVG + '<span>0</span>';
  el.coinsN = el.coins.querySelector('span');
  right.append(el.pause, el.coins);
  top.append(left, right);
  el.toast = document.createElement('div'); el.toast.className = 'toast';
  el.zone = document.createElement('div'); el.zone.className = 'zone'; el.zone.textContent = '';
  el.speedo = document.createElement('div'); el.speedo.className = 'speedo';
  el.speedo.innerHTML = `<div class="v d num"><span>0</span><small>km/h</small></div><div class="segs">${'<b></b>'.repeat(SEGS)}</div>`;
  el.speedN = el.speedo.querySelector('span'); el.segs = [...el.speedo.querySelectorAll('.segs b')];
  el.pack = document.createElement('div'); el.pack.className = 'pack';
  el.pack.innerHTML = '<div class="plbl">pack</div><div class="bar"><div class="fill"></div></div>';
  el.packFill = el.pack.querySelector('.fill');
  el.perf = document.createElement('div'); el.perf.className = 'perf';
  root.append(top, el.zone, el.toast, el.speedo, el.pack, el.perf);
}

function show(id, on) { const e = document.getElementById(id); if (e) e.classList.toggle('on', !!on); }
function showHud(on) { if (root && !config.NOHUD) root.classList.toggle('on', !!on); }
function resetShown() { shown = { score: -1, mult: -1, coins: -1, dist: -1, zone: '', pack: -1, hot: null, kmh: -1, segs: -1 }; }

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
  c.events.on('powerup', (p) => toast(`${p.label}!`, 1400));
  c.events.on('shieldbreak', () => toast('the charm saved you', 1600));
  c.events.on('mission', (p) => toast(`mission done · ${p.text}`, 2600));
  c.events.on('missionset', (p) => toast(`all three done · multiplier now x${p.mult}`, 3200));
  c.events.on('achievement', (p) => toast(`achievement · ${p.name}`, 2800, 'ach'));
  c.events.on('daily', (p) => toast(`daily task done · +${p.pay} coins`, 2600, 'ach'));
  fillMeta();
  c.events.on('hit', () => { if (el.pack) { el.pack.classList.add('hot'); shown.hot = true; } });
}

export function update(dt) {
  if (!root || config.NOHUD || !root.classList.contains('on')) return;
  const score = Math.floor(state.score);
  if (score !== shown.score) { shown.score = score; el.score.textContent = String(score); }
  const mult = state.mult || 1;
  if (mult !== shown.mult) { shown.mult = mult; el.mult.textContent = 'x' + mult; el.mult.classList.toggle('hot', (state.x2T || 0) > 0); }
  const durs = state.powerDur || POWER_DUR;
  for (const [k] of POWER_ROWS) {
    const t = state[k] || 0, e = el.pw[k], on = t > 0;
    if (on !== e.on) { e.on = on; e.row.classList.toggle('on', on); }
    if (on) { const full = durs[e.type] || POWER_DUR[e.type] || 10; const w = Math.round(100 * t / full); if (w !== e.w) { e.w = w; e.bar.style.width = w + '%'; } }
  }
  const coins = state.coins | 0;
  if (coins !== shown.coins) { shown.coins = coins; el.coinsN.textContent = String(coins); }
  const dist = Math.floor(state.distance);
  if (dist !== shown.dist) { shown.dist = dist; el.distN.textContent = String(dist); }
  const zone = state.zone || '';
  if (zone !== shown.zone) { shown.zone = zone; el.zone.textContent = ZONE_LABEL[zone] || zone; }

  // speed readout: km/h, and a ten-segment bar against the speed cap
  const kmh = Math.round((state.speed || 0) * 3.6);
  if (kmh !== shown.kmh) { shown.kmh = kmh; el.speedN.textContent = String(kmh); }
  const segs = Math.round(SEGS * Math.max(0, Math.min(1, (state.speed || 0) / (config.SPEED_MAX || 20))));
  if (segs !== shown.segs) { shown.segs = segs; el.segs.forEach((b, i) => b.classList.toggle('on', i < segs)); }

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
