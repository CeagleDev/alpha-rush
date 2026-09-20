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
import config from './config.js?v=202609201508';

let ctx = null, state = null;
let root = null, el = {};
let shown = { score: -1, coins: -1, dist: -1, zone: '', pack: -1, hot: null };
let perfT = 0;
const ZONE_LABEL = { alleyA: 'yokocho', rampUp: 'ramp', expressway: 'expressway', rampDown: 'ramp', alleyB: 'market' };

const TAU_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M3.5 4.5h17v3.4h-6.2v8.1c0 1.5.8 2.3 2.3 2.3h2.6v3.2h-3.4c-3.4 0-5.3-1.9-5.3-5.3V7.9H3.5z"/></svg>';

function build() {
  root.innerHTML = '';
  const top = document.createElement('div'); top.className = 'top';
  const left = document.createElement('div');
  el.score = document.createElement('div'); el.score.className = 'score'; el.score.textContent = '0';
  el.dist = document.createElement('div'); el.dist.className = 'sub'; el.dist.textContent = '0 m';
  left.append(el.score, el.dist);
  el.coins = document.createElement('div'); el.coins.className = 'coins';
  el.coins.innerHTML = TAU_SVG + '<span>0</span>';
  el.coinsN = el.coins.querySelector('span');
  top.append(left, el.coins);
  el.zone = document.createElement('div'); el.zone.className = 'zone'; el.zone.textContent = '';
  el.pack = document.createElement('div'); el.pack.className = 'pack';
  el.pack.innerHTML = '<div class="lbl">pack</div><div class="bar"><div class="fill"></div></div>';
  el.packFill = el.pack.querySelector('.fill');
  el.perf = document.createElement('div'); el.perf.className = 'perf';
  root.append(top, el.zone, el.pack, el.perf);
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
  c.events.on('death', () => { fillDeath(); showHud(false); setTimeout(() => { if (c.state.over) show('dead', true); }, 1400); });
  c.events.on('restart', () => { show('dead', false); });
  c.events.on('hit', () => { if (el.pack) { el.pack.classList.add('hot'); shown.hot = true; } });
}

export function update(dt) {
  if (!root || config.NOHUD || !root.classList.contains('on')) return;
  const score = Math.floor(state.score);
  if (score !== shown.score) { shown.score = score; el.score.textContent = String(score); }
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
