/**
 * hud.js — score / coins (τ) / distance / zone tag / pack-proximity meter, the title and death overlays. (E3)
 *
 *   init(ctx)     builds the in-play HUD inside #hud (nothing visible when config.NOHUD), wires overlays to events
 *   update(dt)    refreshes the numbers only when a displayed value changes (no DOM churn)
 *
 * Reads state: score, coins, distance, zone, packDist, fps, draws, tris. Listens: 'start' (hide #title/#dead, show
 * #hud), 'death' (fill #dead with score/distance/coins and show it, hide #hud), 'restart', 'zone', 'hit'.
 * Palette: cream 0xeee2c8 on the dark frame, one accent 0xe5b055 (index.html :root). The τ mark is an inline SVG.
 * The restart button #restartb is wired by main.js; this file only shows and hides the overlay.
 */
import config from './config.js?v=202609211323';

let ctx = null, state = null;
let root = null, el = {};
let shown = { score: -1, coins: -1, dist: -1, zone: '', pack: -1, hot: null };
let perfT = 0;
const POWER_ROWS = [['magnetT', 'magnet'], ['shieldT', 'charm'], ['x2T', 'x2 score'], ['sneakT', 'super jump']];
const POWER_DUR = { magnetT: 10, shieldT: 20, x2T: 12, sneakT: 10 };
let toastT = 0;
function toast(text, ms = 2200) { if (!el.toast) return; el.toast.textContent = text; el.toast.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => el.toast.classList.remove('on'), ms); }

/** Missions + best on the title and death cards (progress.js owns the numbers). */
function fillMeta() {
  const P = ctx.modules && ctx.modules.progress; const sum = P && P.summary ? P.summary() : null; if (!sum) return;
  const html = `<div class="mhead">missions · set ${sum.set + 1} · multiplier x${sum.mult}</div>` + sum.missions.map((m) => `<div class="m${m.done ? ' done' : ''}"><span>${m.done ? '✓' : '·'} ${m.text}</span><em>${m.done ? 'done' : `${m.have}/${m.goal}`}</em></div>`).join('');
  for (const id of ['t-missions', 'd-missions']) { const e = document.getElementById(id); if (e) e.innerHTML = html; }
  const b = document.getElementById('d-best'); if (b) b.textContent = String(sum.best);
  const tb = document.getElementById('t-best'); if (tb) tb.textContent = sum.best ? `best ${sum.best}` : '';
  const nb = document.getElementById('d-newbest'); if (nb) nb.classList.toggle('on', sum.newBest);
}

const ZONE_LABEL = { day: 'morning market', alleyA: 'yokocho', rampUp: 'ramp', expressway: 'expressway', rampDown: 'ramp', alleyB: 'market' };

const TAU_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M3.5 4.5h17v3.4h-6.2v8.1c0 1.5.8 2.3 2.3 2.3h2.6v3.2h-3.4c-3.4 0-5.3-1.9-5.3-5.3V7.9H3.5z"/></svg>';

function build() {
  root.innerHTML = '';
  const top = document.createElement('div'); top.className = 'top';
  const left = document.createElement('div');
  el.score = document.createElement('div'); el.score.className = 'score'; el.score.textContent = '0';
  el.dist = document.createElement('div'); el.dist.className = 'sub'; el.dist.textContent = '0 m';
  el.mult = document.createElement('span'); el.mult.className = 'mult'; el.mult.textContent = 'x1';
  const scoreRow = document.createElement('div'); scoreRow.className = 'scorerow'; scoreRow.append(el.score, el.mult);
  left.append(scoreRow, el.dist);
  // power-up timers (Subway Surfers keeps these as draining bars at the side of the screen)
  el.powers = document.createElement('div'); el.powers.className = 'powers';
  el.pw = {};
  for (const [k, label] of POWER_ROWS) {
    const row = document.createElement('div'); row.className = 'pw pw-' + k;
    row.innerHTML = `<span>${label}</span><i><b></b></i>`;
    el.pw[k] = { row, bar: row.querySelector('b'), on: false, w: -1 };
    el.powers.append(row);
  }
  left.append(el.powers);
  el.toast = document.createElement('div'); el.toast.className = 'toast';
  el.coins = document.createElement('div'); el.coins.className = 'coins';
  el.coins.innerHTML = TAU_SVG + '<span>0</span>';
  el.coinsN = el.coins.querySelector('span');
  top.append(left, el.coins);
  el.zone = document.createElement('div'); el.zone.className = 'zone'; el.zone.textContent = '';
  el.pack = document.createElement('div'); el.pack.className = 'pack';
  el.pack.innerHTML = '<div class="lbl">pack</div><div class="bar"><div class="fill"></div></div>';
  el.packFill = el.pack.querySelector('.fill');
  el.perf = document.createElement('div'); el.perf.className = 'perf';
  root.append(top, el.zone, el.toast, el.pack, el.perf);
}

function show(id, on) { const e = document.getElementById(id); if (e) e.classList.toggle('on', !!on); }
function showHud(on) { if (root && !config.NOHUD) root.classList.toggle('on', !!on); }

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
  shown = { score: -1, coins: -1, dist: -1, zone: '', pack: -1, hot: null };

  c.events.on('start', () => { show('title', false); show('dead', false); showHud(true); shown.zone = ''; });
  // the overlay used to appear on the very frame of death, hiding the 0.8 s fall and the dogs'
  // run-up behind a dimmed panel. Let it play, then show the card.
  c.events.on('death', () => { fillDeath(); fillMeta(); showHud(false); setTimeout(() => { if (c.state.over) show('dead', true); }, 1400); });
  c.events.on('restart', () => { show('dead', false); });
  c.events.on('powerup', (p) => toast(`${p.label}!`, 1400));
  c.events.on('shieldbreak', () => toast('the charm saved you', 1600));
  c.events.on('mission', (p) => toast(`mission done · ${p.text}`, 2600));
  c.events.on('missionset', (p) => toast(`all three done · multiplier now x${p.mult}`, 3200));
  fillMeta();
  c.events.on('hit', () => { if (el.pack) { el.pack.classList.add('hot'); shown.hot = true; } });
}

export function update(dt) {
  if (!root || config.NOHUD || !root.classList.contains('on')) return;
  const score = Math.floor(state.score);
  if (score !== shown.score) { shown.score = score; el.score.textContent = String(score); }
  const mult = state.mult || 1;
  if (mult !== shown.mult) { shown.mult = mult; el.mult.textContent = 'x' + mult; el.mult.classList.toggle('hot', (state.x2T || 0) > 0); }
  for (const [k] of POWER_ROWS) {
    const t = state[k] || 0, e = el.pw[k], on = t > 0;
    if (on !== e.on) { e.on = on; e.row.classList.toggle('on', on); }
    if (on) { const w = Math.round(100 * t / POWER_DUR[k]); if (w !== e.w) { e.w = w; e.bar.style.width = w + '%'; } }
  }
  const coins = state.coins | 0;
  if (coins !== shown.coins) { shown.coins = coins; el.coinsN.textContent = String(coins); }
  const dist = Math.floor(state.distance);
  if (dist !== shown.dist) { shown.dist = dist; el.dist.textContent = `${dist} m`; }
  const zone = state.zone || '';
  if (zone !== shown.zone) { shown.zone = zone; el.zone.textContent = ZONE_LABEL[zone] || zone; }

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
