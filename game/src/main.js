/**
 * main.js — boot, ctx, loop, telemetry, start/restart. The only file that imports everything (ARCH.md).
 *
 * Boot: renderer → scene → camera → rig → ctx → every module's init(ctx), awaited in order
 *   textures, perf, lighting, track, obstacles, coins, player, pack, camera, input, hud, audio
 * then `window.__READY__ = true`, HOME is shown (home.js), `#startb` (a real click / touch) → start().
 * UI v2 flow: start(opts) also serves RESTART from the pause menu ({restart:true}); quit() ends a run without a
 * death and shows HOME; setPaused() drives the pause menu (#pauseb, Esc, P, tab-hide / blur).
 *
 * Loop, every frame, in this order (each module's update(dt, ctx) is called EVERY frame, before start and
 * after death too — a module that moves the player must read state.running itself):
 *   input → player → pack → track → obstacles → coins → camera → lighting → perf → hud → audio → rig.render → telemetry
 * dt is clamped to config.MAX_DT for physics; fps is from the REAL delta (docs/traps.md).
 *
 * A module file that does not exist yet is stubbed with a no-op and ONE console.warn line
 * "module X missing, stubbed", so the page boots during the fan-out and the integrator sees what is missing.
 * (Each missing module costs one 404 in the gate until it lands.)
 *
 * Events main emits: 'start' (play begins, payload {restart:boolean}), 'restart' (before 'start' on a restart:
 * state has been reset and state.rng reseeded — rebuild your run), and main listens to 'death'.
 * State main owns: running, over, deaths, rng, time, fps, draws, tris. main also sets speed = SPEED0 at
 * start and 0 at death so telemetry meets the contract even before the player module lands.
 *
 * window.__GAME__ is rebuilt every frame with every field in tools/GATE_CONTRACT.md.
 */
import * as THREE from 'three';
import { createRig } from '../rig.js?v=202609211652';
import config from './config.js?v=202609211652';
import * as input from './input.js?v=202609211652';
import * as hud from './hud.js?v=202609211652';
import * as audio from './audio.js?v=202609211652';
import * as roadfx from './roadfx.js?v=202609211652';   // wet-road reflections + contact shadows (see ARCH.md addendum)
import * as home from './home.js?v=202609211652';       // HOME screen: character select, tabs (UI v2)

const $ = (id) => document.getElementById(id);
const canvas = $('c');
const loadline = $('loadline');
const say = (t) => { if (loadline) loadline.textContent = t; };

// ---------------------------------------------------------------- renderer / scene / camera / rig
const renderer = new THREE.WebGLRenderer({
  canvas, antialias: !config.phone, powerPreference: 'high-performance', stencil: false, alpha: false,
});
renderer.setPixelRatio(Math.min(globalThis.devicePixelRatio || 1, 2));   // the rig caps again by tier
renderer.setSize(innerWidth, innerHeight, false);
renderer.setClearColor(0x110f12, 1);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(62, innerWidth / innerHeight, 0.1, 400);
camera.position.set(0, 2.6, -6.5);
camera.lookAt(0, 1.2, 12);
scene.add(camera);

// bloomThreshold is passed EXPLICITLY because this is a night game. rig.js derives the threshold
// from the key light's intensity, and at hour 19.4 the sun is below the horizon, so the derivation
// collapses to its 0.6 floor — which rig.js's own comment calls six times too low, the point at
// which "every diffuse surface in the frame blooms", i.e. the milk filter it says it does not do.
// It is invisible in a still and it was haloing the shophouse nearest the camera. At 1.6 only the
// things that are genuinely emitting — sign faces, lantern cores, wet-road speculars — cross it.
const rig = createRig(THREE, renderer, scene, {
  hour: 19.4, azimuth: 250, tier: config.phone ? 'phone' : 'auto', camera,
  bloomThreshold: 1.6, bloomStrength: 0.30, bloomRadius: 0.30,
});

// ---------------------------------------------------------------- state / rng / events
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeEvents() {
  const map = new Map();
  return {
    on(name, fn) { if (!map.has(name)) map.set(name, new Set()); map.get(name).add(fn); return () => this.off(name, fn); },
    off(name, fn) { map.get(name)?.delete(fn); },
    emit(name, payload) {
      const set = map.get(name); if (!set) return;
      for (const fn of [...set]) { try { fn(payload); } catch (e) { console.error(`[events] '${name}' listener threw:`, e); } }
    },
  };
}

/** Fields that reset with every run. deaths, rng seed and time-of-day survive. */
function runDefaults() {
  return {
    distance: 0, speed: 0, z: 0, x: 0, y: 0,
    lane: 0, laneX: 0, airborne: false, rolling: false, stumbleT: 0,
    zone: 'alleyA', score: 0, coins: 0, jumps: 0, rolls: 0,
    next: null, coin: null, coinLane: null, packDist: config.PACK_DIST, heroBox: [0, 0, 0, 0],
    time: 0,
  };
}
const state = {
  running: false, over: false, deaths: 0,
  rng: mulberry32(config.SEED), seed: config.SEED,
  fps: 0, draws: 0, tris: 0,
  ...runDefaults(),
};
const events = makeEvents();

// ---------------------------------------------------------------- modules (dynamic, stubbed if missing)
const missing = [];
// Read the stamp off our own URL so dynamic imports match the stamped static ones exactly.
const MODULE_V = (() => { try { return new URL(import.meta.url).search || ''; } catch (e) { return ''; } })();
async function load(name, stub) {
  try {
    // The cache stamp must be on this URL TOO. ship.mjs --stamp rewrites STATIC import strings, but
    // this is a dynamic import built from a variable, so it stayed unstamped: main.js loaded
    // ./textures.js while chunks.js imported ./textures.js?v=..., and an ES module keyed by URL
    // means those are TWO SEPARATE INSTANCES. main.js initialised one; the chunk builder used the
    // other, whose module-level THREE was still null — "track.init threw: Cannot read properties of
    // null (reading 'MeshStandardMaterial')", and every sign sprite silently missed its texture
    // cache. The local gate never saw it because it serves unstamped source; only the jam gate,
    // run against what was actually shipped, did.
    return await import(`./${name}.js${MODULE_V}`);
  } catch (e) {
    // A syntax error inside an existing module must NOT be hidden as "missing": say which it was.
    const notFound = /Failed to fetch|404|not found|Failed to load|error loading dynamically/i.test(String(e && e.message));
    if (notFound) { missing.push(name); console.warn(`module ${name} missing, stubbed`); }
    else console.error(`module ${name} failed to import (not missing — broken):`, e);
    return { __stub: true, ...stub };
  }
}
const noop = () => {};
const noopMod = { init: noop, update: noop };
const [textures, perf, lighting, track, obstacles, coins, player, pack, cameraMod, assetsMod, powerups, progress] = await Promise.all([
  load('textures', { ...noopMod, apply: noop }),
  load('perf', noopMod),
  load('lighting', noopMod),
  load('track', { ...noopMod, chunkAt: () => null }),
  load('obstacles', { ...noopMod, hit: () => null }),
  load('coins', noopMod),
  load('player', noopMod),
  load('pack', noopMod),
  load('camera', noopMod),
  load('assets', {
    async get(name) {
      const g = new THREE.Group(); g.name = name; g.userData.placeholder = true; g.userData.stub = true; return g;
    },
    lights: () => [],
  }),
  load('powerups', { ...noopMod, absorb: () => false }),
  load('progress', { ...noopMod, summary: () => null }),
]);

const ctx = {
  THREE, scene, camera, renderer, rig, config, state, events, canvas,
  assets: assetsMod, textures, input,
  modules: { textures, perf, lighting, track, obstacles, coins, player, pack, camera: cameraMod, roadfx, input, hud, audio, assets: assetsMod, powerups, progress, home },
};
globalThis.__ctx = ctx;   // for the integrator's console; not part of any contract

// ---------------------------------------------------------------- boot
const INIT_ORDER = [
  // assets.init must run before anything calls assets.get(): every chunk, character and obstacle
  // resolves through it, and without it get() throws and the world builds EMPTY while the gate passes.
  ['textures', textures], ['assets', assetsMod], ['perf', perf], ['lighting', lighting], ['track', track], ['obstacles', obstacles],
  ['coins', coins], ['powerups', powerups], ['progress', progress], ['player', player], ['pack', pack], ['camera', cameraMod], ['roadfx', roadfx], ['input', input], ['hud', hud], ['home', home], ['audio', audio],
];
const UPDATE_ORDER = [input, player, pack, track, obstacles, coins, powerups, progress, cameraMod, roadfx, lighting, perf, hud, audio];

async function boot() {
  const t0 = performance.now();
  for (const [name, mod] of INIT_ORDER) {
    say(`loading ${name}`);
    try { if (typeof mod.init === 'function') await mod.init(ctx); }
    catch (e) { console.error(`[boot] ${name}.init threw:`, e); }
  }
  try { await Promise.race([rig.ready, new Promise((r) => setTimeout(r, 15000))]); } catch (e) { console.warn('[boot] rig.ready:', e && e.message); }
  if (missing.length) console.warn(`[boot] stubbed modules: ${missing.join(', ')}`);
  console.log(`[boot] ready in ${((performance.now() - t0) / 1000).toFixed(2)} s, tier ${rig.tier?.name}, seed ${config.SEED}${config.GATE ? ', gate' : ''}`);

  last = performance.now();
  requestAnimationFrame(loop);
  { const pb = $('pauseb'); if (pb) pb.addEventListener('click', () => setPaused(true)); }   // built by hud.init
  home.show();
  const b = $('startb'); if (b) b.disabled = false;
  say('');
  window.__READY__ = true;
}

// ---------------------------------------------------------------- start / restart / death
// needsRestart: quit() reset the state without a death, so the next start() must still emit 'restart'
let needsRestart = false;
function start(opts) {
  if (!window.__READY__) return;
  const force = !!(opts && opts.restart);           // RESTART from the pause menu, mid-run
  if (state.running && !force) return;
  audio.unlock();                          // inside the tap's gesture, synchronously
  const restart = force || state.over || state.deaths > 0 || needsRestart;
  if (restart) {
    Object.assign(state, runDefaults());
    state.rng = mulberry32(config.SEED);   // the same seed gives the same run again
    events.emit('restart');
  }
  needsRestart = false;
  state.over = false;
  state.paused = false; { const pe = $('paused'); if (pe) pe.classList.remove('on'); }
  state.running = true;
  state.speed = config.SPEED0;
  // the chosen character (home.js, persisted by progress.js) is on state BEFORE 'start' so player.js can read it
  try { const ch = home.selected(); if (ch) { state.character = ch.id; state.characterAsset = ch.asset; } } catch (e) { /* home missing */ }
  events.emit('start', { restart });
}
window.__START__ = () => start();

/** HOME from the pause menu or the death card: the run ends without a death (coins still bank), state resets
 *  like a restart, and the home screen comes back. The world behind it stays put until the next start(). */
function quit() {
  if (state.running || state.over) {
    events.emit('quit', { coins: state.coins | 0, distance: state.distance, score: state.score });
    if (state.paused) setPaused(false);
    state.running = false; state.over = false; state.speed = 0;
    Object.assign(state, runDefaults());
    state.rng = mulberry32(config.SEED);
    needsRestart = true;
  }
  home.show();
}
window.__QUIT__ = quit;

events.on('death', () => {
  if (state.over) return;
  state.over = true;
  state.running = false;
  state.speed = 0;
  state.deaths++;
});

for (const id of ['startb', 'restartb']) {
  const b = $(id); if (!b) continue;
  b.addEventListener('click', () => start());
  b.addEventListener('touchend', () => { start(); });   // no preventDefault: the click still follows and start() is idempotent
}
{ const b = $('d-home'); if (b) b.addEventListener('click', quit); }

// ---------------------------------------------------------------- pause
// QA 2026-09-21: leaving the tab mid-run left the runner to die unattended (a hidden tab's frames stop,
// then the run carried on the moment it was visible again, with nobody at the controls). Like the
// reference games, the run PAUSES when the page is hidden or loses focus, and resumes on a tap.
function setPaused(on) {
  on = !!on && state.running && !state.over;
  if (on === !!state.paused) return;
  state.paused = on;
  const el = $('paused'); if (el) el.classList.toggle('on', on);
  if (on) {
    const ps = $('p-score'), pd = $('p-dist');
    if (ps) ps.textContent = String(Math.floor(state.score || 0));
    if (pd) pd.textContent = `${Math.floor(state.distance || 0)} m`;
    syncSound();
  }
  try { if (audio.setPaused) audio.setPaused(on); } catch (e) { /* optional */ }
  if (!on) { last = performance.now(); try { input.clear && input.clear(); } catch (e) { /* none queued */ } }
}
function syncSound() { const v = $('soundv'); if (!v) return; const off = !!(audio.isMuted && audio.isMuted()); v.textContent = off ? 'off' : 'on'; v.classList.toggle('off', off); }
document.addEventListener('visibilitychange', () => { if (document.hidden) setPaused(true); });
addEventListener('blur', () => { if (!config.GATE) setPaused(true); });
// RESUME: the button, Esc / P / Space / Enter, or a tap on the backdrop outside the card
{
  const el = $('paused');
  if (el) for (const ev of ['click', 'touchend']) el.addEventListener(ev, (e) => { if (e.target === el) { e.preventDefault(); setPaused(false); } });
  const on = (id, fn) => { const b = $(id); if (b) b.addEventListener('click', fn); };
  on('resumeb', () => setPaused(false));
  on('p-restart', () => { if (!state.running) return; setPaused(false); start({ restart: true }); });
  on('soundb', () => { try { audio.setMuted && audio.setMuted(!(audio.isMuted && audio.isMuted())); } catch (e) { /* optional */ } syncSound(); });
  on('p-home', quit);
}
addEventListener('keydown', (e) => { if (state.paused && (e.key === ' ' || e.key === 'Enter' || e.key === 'Escape' || e.key === 'p')) setPaused(false); else if (!state.paused && (e.key === 'Escape' || e.key === 'p')) setPaused(true); });
window.__PAUSE__ = setPaused;

// ---------------------------------------------------------------- resize
function resize() {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h; camera.updateProjectionMatrix();
  try { rig.resize(w, h); } catch (e) { /* no post */ }
}
addEventListener('resize', resize);
addEventListener('orientationchange', () => setTimeout(resize, 60));

// ---------------------------------------------------------------- loop
let last = performance.now();
let fpsEma = 0;
function loop(now) {
  requestAnimationFrame(loop);
  const raw = Math.max(0.0001, (now - last) / 1000);   // REAL elapsed time
  last = now;
  const inst = 1 / raw;
  fpsEma = fpsEma ? fpsEma + (inst - fpsEma) * 0.15 : inst;
  state.fps = fpsEma;
  let dt = Math.min(raw, config.MAX_DT);
  // PAUSED (tab hidden or window blurred mid-run): the world holds still, the frame still draws
  if (state.paused) dt = 0;
  if (state.running && !state.paused) state.time += dt;

  if (!state.paused) for (const m of UPDATE_ORDER) {
    if (typeof m.update === 'function') m.update(dt, ctx);
  }
  rig.render(camera, dt);
  const info = renderer.info.render;
  state.draws = info.calls; state.tris = info.triangles;
  telemetry();
}

function telemetry() {
  window.__GAME__ = {
    pos: [state.x, state.z],
    fps: Math.round(state.fps),
    speed: state.speed,
    score: state.score,
    over: state.over,
    draws: state.draws,
    tris: state.tris,
    lane: state.lane,
    airborne: !!state.airborne,
    rolling: !!state.rolling,
    distance: state.distance,
    zone: state.zone,
    coins: state.coins,
    deaths: state.deaths,
    jumps: state.jumps,
    rolls: state.rolls,
    next: state.next ?? null,
    coin: state.coin ?? null,
    coinLane: state.coinLane ?? null,
    heroBox: state.heroBox,
    packDist: state.packDist,
    mult: state.mult, best: state.best, power: { magnet: state.magnetT || 0, shield: state.shieldT || 0, x2: state.x2T || 0, sneakers: state.sneakT || 0 },
    running: state.running, paused: !!state.paused,
    character: state.character || null, bank: state.bank | 0,
    seed: config.SEED,
    tier: rig.tier?.name,
    time: state.time,
  };
}
telemetry();
boot();
