/**
 * audio.js — WebAudio: unlock on the start tap, files if shipped, procedural fallbacks, pack barks panned by lane. (E3)
 *
 *   init(ctx)     registers listeners only; never touches the AudioContext (never blocks READY)
 *   unlock()      called by main.js INSIDE the #startb tap: creates + resumes the AudioContext, starts file loads
 *   update(dt)    drives the procedural music sequencer (lookahead scheduling from the render loop)
 *
 * Listens: 'coin' 'jump' 'roll' 'hit' 'bark' 'zone' 'death' 'start' 'stumble'.
 *   'bark' payload: { lane?: -1|0|1, x?: metres, variant?: 1|2 } → panned by lane offset from the player.
 *   'zone' payload: the zone id (or { zone }) → ambience crossfade alley ↔ expressway over 1.5 s.
 * Buses: music at −12 dB, ambience −9 dB, sfx 0 dB, under one master. `?mute=1` (config.MUTE) disables everything.
 *
 * FILES. A static host answers a missing file with a 404 and the gate FAILS on any 404, so this file never probes:
 * list a file below when it lands in game/audio/ (mp3 or webm), leave null for the procedural sound. Every name the
 * spec asks for is here.
 */
import config from './config.js?v=202609211652';

const FILES = {
  coin: null, jump: null, roll: null, hit: null, bark1: null, bark2: null, whoosh: null,
  music_loop: null, ambience_alley: null, ambience_expressway: null,
};
const DB = (db) => Math.pow(10, db / 20);

let ctx = null, state = null;
let ac = null, master = null, sfx = null, music = null, amb = null, ambA = null, ambX = null;
let buffers = {};
let noiseBuf = null;
let ok = false;
let musicOn = false, musicSrc = null, ambSrcs = [];
let seq = { next: 0, step: 0 };
let barkAlt = 0;

const safe = (fn) => { try { return fn(); } catch (e) { /* audio never throws into the game */ return undefined; } };

// ---------------------------------------------------------------- unlock / graph
export function unlock() {
  if (config.MUTE) return;
  safe(() => {
    if (ac) { if (ac.state === 'suspended') ac.resume(); return; }
    const AC = globalThis.AudioContext || globalThis.webkitAudioContext;
    if (!AC) return;
    ac = new AC();
    master = ac.createGain(); master.gain.value = 0.9; master.connect(ac.destination);
    sfx = ac.createGain(); sfx.gain.value = 1; sfx.connect(master);
    music = ac.createGain(); music.gain.value = DB(-12); music.connect(master);
    amb = ac.createGain(); amb.gain.value = DB(-9); amb.connect(master);
    ambA = ac.createGain(); ambA.gain.value = 1; ambA.connect(amb);
    ambX = ac.createGain(); ambX.gain.value = 0; ambX.connect(amb);
    noiseBuf = makeNoise(2.0);
    ok = true;
    if (ac.state === 'suspended') ac.resume();
    loadFiles();
    document.addEventListener('visibilitychange', () => safe(() => { if (!document.hidden && ac.state === 'suspended') ac.resume(); }));
  });
}

async function loadFiles() {
  for (const [name, file] of Object.entries(FILES)) {
    if (!file) continue;
    try {
      const r = await fetch(`./audio/${file}`);
      if (!r.ok) continue;
      buffers[name] = await ac.decodeAudioData(await r.arrayBuffer());
      if ((name === 'music_loop' && musicOn) || name.startsWith('ambience_')) restartLoops();
    } catch (e) { console.warn(`[audio] ${file}: ${e && e.message} (procedural fallback)`); }
  }
}

function makeNoise(sec) {
  const n = Math.floor(ac.sampleRate * sec);
  const b = ac.createBuffer(1, n, ac.sampleRate);
  const d = b.getChannelData(0);
  let last = 0;
  for (let i = 0; i < n; i++) { const w = Math.random() * 2 - 1; last = 0.6 * last + 0.4 * w; d[i] = last * 1.6; }   // slightly pink
  return b;
}

// ---------------------------------------------------------------- primitives
function env(node, dest, peak, a, d, when, pan) {
  const g = ac.createGain();
  g.gain.setValueAtTime(0.0001, when);
  g.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), when + a);
  g.gain.exponentialRampToValueAtTime(0.0001, when + a + d);
  node.connect(g);
  if (pan !== undefined && ac.createStereoPanner) { const p = ac.createStereoPanner(); p.pan.value = Math.max(-1, Math.min(1, pan)); g.connect(p); p.connect(dest); }
  else g.connect(dest);
  return g;
}
function noise(when, dur, type, f0, f1, q) {
  const s = ac.createBufferSource(); s.buffer = noiseBuf; s.loop = true; s.playbackRate.value = 0.9 + Math.random() * 0.2;
  let out = s;
  if (type) {
    const f = ac.createBiquadFilter(); f.type = type; f.frequency.setValueAtTime(f0, when);
    if (f1 !== undefined) f.frequency.exponentialRampToValueAtTime(Math.max(20, f1), when + dur);
    if (q) f.Q.value = q;
    s.connect(f); out = f;
  }
  s.start(when); s.stop(when + dur + 0.05);
  return out;
}
function osc(type, f0, f1, when, dur) {
  const o = ac.createOscillator(); o.type = type;
  o.frequency.setValueAtTime(f0, when);
  if (f1 !== undefined) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), when + dur);
  o.start(when); o.stop(when + dur + 0.05);
  return o;
}
function playBuffer(name, dest, pan, gain = 1) {
  const b = buffers[name]; if (!b) return false;
  const s = ac.createBufferSource(); s.buffer = b;
  const t = ac.currentTime;
  env(s, dest, gain, 0.005, Math.max(0.05, b.duration - 0.005), t, pan);
  s.start(t);
  return true;
}

// ---------------------------------------------------------------- one-shots (file if present, else procedural)
const SFX = {
  coin(pan) {
    if (playBuffer('coin', sfx, pan, 0.7)) return;
    const t = ac.currentTime, det = 1 + (Math.random() - 0.5) * 0.02;
    env(osc('sine', 1318 * det, undefined, t, 0.09), sfx, 0.22, 0.004, 0.09, t, pan);
    env(osc('sine', 1760 * det, undefined, t + 0.07, 0.16), sfx, 0.26, 0.004, 0.16, t + 0.07, pan);
  },
  jump() {
    if (playBuffer('jump', sfx)) return;
    const t = ac.currentTime;
    env(noise(t, 0.28, 'bandpass', 380, 2200, 1.2), sfx, 0.35, 0.02, 0.26, t);
    env(osc('triangle', 220, 440, t, 0.14), sfx, 0.06, 0.01, 0.13, t);
  },
  roll() {
    if (playBuffer('roll', sfx)) return;
    const t = ac.currentTime;
    env(noise(t, 0.32, 'lowpass', 420, 160), sfx, 0.5, 0.01, 0.3, t);
    env(osc('sine', 110, 45, t, 0.18), sfx, 0.35, 0.005, 0.17, t);
  },
  hit(soft) {
    if (playBuffer('hit', sfx, undefined, soft ? 0.6 : 1)) return;
    const t = ac.currentTime, k = soft ? 0.55 : 1;
    env(noise(t, 0.14, 'highpass', 1200), sfx, 0.45 * k, 0.002, 0.12, t);
    env(noise(t, 0.10, 'bandpass', 700, 300, 2), sfx, 0.4 * k, 0.002, 0.09, t);
    env(osc('sine', 160, 38, t, 0.22), sfx, 0.7 * k, 0.003, 0.2, t);
  },
  whoosh(pan) {
    if (playBuffer('whoosh', sfx, pan)) return;
    const t = ac.currentTime;
    env(noise(t, 0.38, 'bandpass', 1400, 260, 0.9), sfx, 0.3, 0.05, 0.3, t, pan);
  },
  bark(variant, pan) {
    if (playBuffer(variant === 2 ? 'bark2' : 'bark1', sfx, pan, 0.8)) return;
    const t = ac.currentTime;
    const hi = variant !== 2;
    const f0 = hi ? 460 : 300, f1 = hi ? 240 : 170, dur = hi ? 0.11 : 0.16;
    const o = osc('sawtooth', f0, f1, t, dur);
    const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = hi ? 1100 : 750; bp.Q.value = 2.2;
    const bp2 = ac.createBiquadFilter(); bp2.type = 'peaking'; bp2.frequency.value = hi ? 2400 : 1700; bp2.gain.value = 9; bp2.Q.value = 1.5;
    o.connect(bp); bp.connect(bp2);
    env(bp2, sfx, hi ? 0.5 : 0.6, 0.012, dur, t, pan);
    env(noise(t, dur, 'bandpass', hi ? 1800 : 1200, undefined, 1.5), sfx, 0.12, 0.01, dur * 0.8, t, pan);
  },
};

// ---------------------------------------------------------------- loops: music and ambience
// Procedural lo-fi city loop, 84 bpm, 16 steps of a two-bar figure: a soft bass, a pad on beats, hats on offbeats.
const BPM = 84, STEP = 60 / BPM / 2;
const BASS = [55, 0, 55, 0, 65.4, 0, 0, 55, 49, 0, 49, 0, 58.3, 0, 0, 55];              // A1 … F1, G1
const PAD = [[220, 261.6, 329.6], null, null, null, [174.6, 220, 261.6], null, null, null,
             [196, 246.9, 293.7], null, null, null, [174.6, 220, 261.6], null, null, null];
function scheduleStep(i, t) {
  const b = BASS[i];
  if (b) { const o = osc('triangle', b, undefined, t, STEP * 1.8); const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 320; o.connect(lp); env(lp, music, 0.9, 0.01, STEP * 1.7, t); }
  const chord = PAD[i];
  if (chord) for (const f of chord) { const o = osc('sine', f * (1 + (Math.random() - 0.5) * 0.004), undefined, t, STEP * 3.8); env(o, music, 0.16, 0.12, STEP * 3.6, t); }
  if (i % 2 === 1) env(noise(t, 0.05, 'highpass', 7000), music, i % 4 === 3 ? 0.10 : 0.06, 0.002, 0.045, t);
  if (i === 4 || i === 12) env(noise(t, 0.09, 'bandpass', 1800, 900, 1), music, 0.18, 0.003, 0.08, t);   // a soft snare
}
function musicTick() {
  if (!ok || !musicOn || buffers.music_loop) return;
  const now = ac.currentTime;
  if (seq.next < now - 0.5) seq.next = now + 0.05;             // after a long stall, resync rather than burst
  while (seq.next < now + 0.15) { scheduleStep(seq.step, seq.next); seq.step = (seq.step + 1) % 16; seq.next += STEP; }
}
function startMusic() {
  musicOn = true; seq = { next: ac.currentTime + 0.05, step: 0 };
  if (buffers.music_loop) { musicSrc = ac.createBufferSource(); musicSrc.buffer = buffers.music_loop; musicSrc.loop = true; musicSrc.connect(music); musicSrc.start(); }
  music.gain.cancelScheduledValues(ac.currentTime); music.gain.setTargetAtTime(DB(-12), ac.currentTime, 0.2);
}
function stopMusic(fade = 0.6) {
  musicOn = false;
  music.gain.cancelScheduledValues(ac.currentTime); music.gain.setTargetAtTime(0.0001, ac.currentTime, fade / 3);
  if (musicSrc) { const s = musicSrc; musicSrc = null; setTimeout(() => safe(() => s.stop()), fade * 1000 + 50); }
}
let dripTimer = 0;
function startAmbience() {
  stopAmbience();
  const t = ac.currentTime;
  // alley: hum + murmur (lowpassed pink) with a slow swell; drips scheduled from update()
  if (buffers.ambience_alley) { const s = ac.createBufferSource(); s.buffer = buffers.ambience_alley; s.loop = true; s.connect(ambA); s.start(t); ambSrcs.push(s); }
  else {
    const s = ac.createBufferSource(); s.buffer = noiseBuf; s.loop = true;
    const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 520;
    const g = ac.createGain(); g.gain.value = 0.35; s.connect(lp); lp.connect(g); g.connect(ambA); s.start(t); ambSrcs.push(s);
    const lfo = ac.createOscillator(); lfo.frequency.value = 0.09; const lg = ac.createGain(); lg.gain.value = 0.12; lfo.connect(lg); lg.connect(g.gain); lfo.start(t); ambSrcs.push(lfo);
    const hum = ac.createOscillator(); hum.type = 'sawtooth'; hum.frequency.value = 100; const hf = ac.createBiquadFilter(); hf.type = 'lowpass'; hf.frequency.value = 220;
    const hg = ac.createGain(); hg.gain.value = 0.05; hum.connect(hf); hf.connect(hg); hg.connect(ambA); hum.start(t); ambSrcs.push(hum);
  }
  // expressway: wind, a broad band with a wobble
  if (buffers.ambience_expressway) { const s = ac.createBufferSource(); s.buffer = buffers.ambience_expressway; s.loop = true; s.connect(ambX); s.start(t); ambSrcs.push(s); }
  else {
    const s = ac.createBufferSource(); s.buffer = noiseBuf; s.loop = true; s.playbackRate.value = 0.8;
    const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 300; bp.Q.value = 0.5;
    const g = ac.createGain(); g.gain.value = 0.55; s.connect(bp); bp.connect(g); g.connect(ambX); s.start(t); ambSrcs.push(s);
    const lfo = ac.createOscillator(); lfo.frequency.value = 0.21; const lg = ac.createGain(); lg.gain.value = 180; lfo.connect(lg); lg.connect(bp.frequency); lfo.start(t); ambSrcs.push(lfo);
  }
  setZone(state.zone);
}
function stopAmbience() { for (const s of ambSrcs) safe(() => s.stop()); ambSrcs = []; }
function restartLoops() { if (!ok) return; if (musicOn) { safe(() => { if (musicSrc) musicSrc.stop(); }); musicSrc = null; startMusic(); } startAmbience(); }
function setZone(zone) {
  if (!ok) return;
  const z = typeof zone === 'object' && zone ? zone.zone : zone;
  const onX = z === 'expressway' || z === 'rampUp';
  const t = ac.currentTime, T = 1.5;
  ambA.gain.cancelScheduledValues(t); ambA.gain.setTargetAtTime(onX ? 0.0001 : 1, t, T / 3);
  ambX.gain.cancelScheduledValues(t); ambX.gain.setTargetAtTime(onX ? 1 : 0.0001, t, T / 3);
}

// ---------------------------------------------------------------- module interface
const panOf = (p) => {
  const px = Number.isFinite(p && p.x) ? p.x - (state.x || 0) : Number.isInteger(p && p.lane) ? (p.lane - (state.lane || 0)) * config.LANE_W : 0;
  return Math.max(-1, Math.min(1, px / 4));
};

export async function init(c) {
  ctx = c; state = c.state;
  const on = (name, fn) => c.events.on(name, (p) => { if (ok) safe(() => fn(p)); });
  on('coin', (p) => SFX.coin(panOf(p)));
  on('jump', () => SFX.jump());
  on('roll', () => SFX.roll());
  on('hit', () => SFX.hit(false));
  on('stumble', () => SFX.hit(true));
  on('bark', (p) => { const v = p && (p.variant === 1 || p.variant === 2) ? p.variant : (barkAlt = 1 - barkAlt) + 1; SFX.bark(v, panOf(p)); });
  on('zone', (z) => setZone(z));
  on('death', () => { SFX.hit(false); stopMusic(0.8); ambA.gain.setTargetAtTime(0.35, ac.currentTime, 0.4); ambX.gain.setTargetAtTime(0.35, ac.currentTime, 0.4); });
  on('start', () => { startMusic(); startAmbience(); });
  on('input', (d) => { if (d === 'left' || d === 'right') SFX.whoosh(d === 'left' ? -0.4 : 0.4); });
}

export function update(dt) {
  if (!ok) return;
  musicTick();
  if (!buffers.ambience_alley && ambSrcs.length && state.running && (state.zone === 'alleyA' || state.zone === 'alleyB' || state.zone === 'day')) {
    dripTimer -= dt;
    if (dripTimer <= 0) {
      dripTimer = 1.2 + Math.random() * 2.6;
      safe(() => { const t = ac.currentTime; env(osc('sine', 2600 + Math.random() * 1400, 1800, t, 0.08), ambA, 0.08, 0.003, 0.08, t, Math.random() * 1.6 - 0.8); });
    }
  }
}
