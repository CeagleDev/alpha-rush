/**
 * audio.js — WebAudio. Pass 3: the two MUSIC tracks are real files (game/audio/music_home.mp3 / music_run.mp3, Atlas,
 * 96 kbps 44.1 kHz), the pass-2 synthesised tracks stay in as the fallback; every SFX is still procedural.
 *
 *   init(ctx)     registers listeners only; never touches the AudioContext (never blocks READY). Starts the two
 *                 music fetches (never awaited). Also arms a one-shot first-gesture listener (pointerdown /
 *                 touchend / keydown) so the HOME track can start from a tap anywhere on the home screen.
 *   unlock()      called by main.js INSIDE the #startb tap (and by the gesture listener): creates + resumes the
 *                 AudioContext. If `state.running` is false it starts the HOME track.
 *   update(dt)    follows state.speed for the RUN track's intensity and drops rain drips in the alleys. The synth
 *                 sequencer runs on a 60 ms interval so it keeps going while main.js skips updates (pause).
 *   setMuted(on) / isMuted()   master bus to 0 (the limiter stays in place).
 *   setPaused(on)  music + ambience lowpass to a muffled bed (hidden tab: the context is suspended instead).
 *
 * Music files: fetched at init, decoded as soon as the bytes land (OfflineAudioContext, no gesture needed), looped
 *   by an AudioBufferSourceNode (loop = true) between the first and last non-silent window of the buffer with a 6 ms
 *   fade written into the buffer at both ends (clean seam; the encodes carry 0.3-0.9 s of silence). A track whose
 *   file is missing / undecodable plays its synthesised version; a file that lands while its synth is playing takes
 *   over with a 0.8 s crossfade. RUN intensity on the file: a gentle high-shelf (+3 dB above 3 kHz at top speed) and
 *   +1.5 dB at top speed only; the pass-2 tone lowpass is left open for the file (it still closes on 'death').
 * Synth fallback (both in D, in-sen scale D Eb G A C):
 *   HOME  72 bpm: warm detuned-saw pad through a slow-LFO lowpass, soft plucked in-sen arpeggio, a sub on the chord
 *         root, occasional wind-chime clusters into a long convolver reverb (generated noise IR).
 *   RUN   142 bpm: four-on-the-floor kick, offbeat hats, sidechained saw bass (D minor pentatonic), offbeat chord
 *         stabs, a lead motif in bars 7-8 / 15-16, a riser in bars 15-16 + crash on the loop. INTENSITY follows
 *         state.speed: 16th hats, open hat, rim, shaker and a brighter tone filter.
 * Buses: home -14 dB, run -6 dB (file voices carry their own trim, see MUSIC). 'start' crossfades HOME -> RUN over
 *   0.8 s, 'quit' RUN -> HOME, 'death' ducks RUN to a lowpassed slow pulse and hands back to HOME after 2 s.
 *
 * Listens: 'coin' 'jump' 'roll' 'hit' 'stumble' 'bark' 'zone' 'death' 'start' 'quit' 'input' 'powerup'
 *          'shieldbreak' 'mission' 'achievement' 'reveal'.
 *   'coin'  Alpha pickup blip, pitch climbing with the streak (state.streak if the game sets it, else a local
 *           count that resets on a hit / stumble / death / 2.5 s without a pickup).
 *   'powerup' {type}: a distinct fanfare per type: magnet, omamori, x2, sneakers, surge (rising whoosh + chord).
 *   'bark' {lane?|x?, variant?} panned by lane offset from the player. 'zone' → ambience crossfade + a stinger.
 * Buses: sfx 0 dB, home -14 dB, run -6 dB, ambience -9 dB → world (pause lowpass) → master → limiter. `?mute=1`
 * (config.MUTE) disables everything.
 */
import config from './config.js?v=202609250002';

const DB = (db) => Math.pow(10, db / 20);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const LOOKAHEAD = 0.25;

let ctx = null, state = null;
let ac = null, master = null, limiter = null, sfx = null, world = null, pauseLP = null;
let amb = null, ambA = null, ambX = null, ambSrcs = [];
let homeMix = null, homeG = null, revSend = null, revRet = null, homeSyn = null, homeFile = null;
let runMix = null, runTone = null, scGain = null, pulseG = null, pulseDepth = null, runG = null, leadIn = null, runSyn = null, runFile = null, runShelf = null;
let noiseBuf = null;
let ok = false;
let barkAlt = 0;
let deathTimer = 0, dead = false;
let inten = 0;                       // smoothed RUN intensity 0..1
let toneT = 0;
let streak = 0, lastCoinT = 0;

const safe = (fn) => { try { return fn(); } catch (e) { /* audio never throws into the game */ return undefined; } };

// ---------------------------------------------------------------- pause-menu setters (UI v2: tiny, main.js calls them)
let muted = false, pausedByMenu = false;
/** SOUND on/off in the pause menu: the master bus goes to 0 (remembered if the context does not exist yet). */
export function setMuted(on) { muted = !!on; safe(() => { if (master && ac) master.gain.setTargetAtTime(muted ? 0 : 0.9, ac.currentTime, 0.02); }); }
export const isMuted = () => muted;
/** Paused: the world bus (music + ambience) lowpasses to a muffled bed; a hidden tab suspends the context instead. */
export function setPaused(on) {
  pausedByMenu = !!on;
  safe(() => {
    if (!ac) return;
    const t = ac.currentTime;
    if (on) {
      pauseLP.frequency.cancelScheduledValues(t); pauseLP.frequency.setTargetAtTime(360, t, 0.12);
      world.gain.setTargetAtTime(0.7, t, 0.12);
      if (document.hidden) ac.suspend();
    } else {
      if (ac.state === 'suspended') ac.resume();
      pauseLP.frequency.cancelScheduledValues(t); pauseLP.frequency.setTargetAtTime(20000, t, 0.15);
      world.gain.setTargetAtTime(1, t, 0.15);
    }
  });
}

// ---------------------------------------------------------------- unlock / graph
export function unlock() {
  if (config.MUTE) return;
  safe(() => {
    if (ac) { if (ac.state === 'suspended' && !(pausedByMenu && document.hidden)) ac.resume(); if (!state.running && !dead && !homeOn()) startHome(); return; }
    const AC = globalThis.AudioContext || globalThis.webkitAudioContext;
    if (!AC) return;
    ac = new AC();
    // master → limiter → out. The limiter is a fast, hard compressor so stacked SFX + music never clip.
    limiter = ac.createDynamicsCompressor();
    limiter.threshold.value = -6; limiter.knee.value = 3; limiter.ratio.value = 20; limiter.attack.value = 0.001; limiter.release.value = 0.09;
    limiter.connect(ac.destination);
    master = ac.createGain(); master.gain.value = muted ? 0 : 0.9; master.connect(limiter);
    sfx = ac.createGain(); sfx.gain.value = 1; sfx.connect(master);
    // world = music + ambience through the pause lowpass
    pauseLP = ac.createBiquadFilter(); pauseLP.type = 'lowpass'; pauseLP.frequency.value = 20000; pauseLP.Q.value = 0.5; pauseLP.connect(master);
    world = ac.createGain(); world.gain.value = 1; world.connect(pauseLP);
    amb = ac.createGain(); amb.gain.value = DB(-9); amb.connect(world);
    ambA = ac.createGain(); ambA.gain.value = 1; ambA.connect(amb);
    ambX = ac.createGain(); ambX.gain.value = 0; ambX.connect(amb);
    noiseBuf = makeNoise(2.0);
    // HOME: file → homeFile ─┐
    //       synth: homeMix (+ convolver reverb send/return) → homeSyn ─┴→ homeG (crossfade) → world
    homeG = ac.createGain(); homeG.gain.value = 0; homeG.connect(world);
    homeSyn = ac.createGain(); homeSyn.gain.value = 1; homeSyn.connect(homeG);
    homeFile = ac.createGain(); homeFile.gain.value = MUSIC.home.trim; homeFile.connect(homeG);
    homeMix = ac.createGain(); homeMix.gain.value = 1; homeMix.connect(homeSyn);
    revSend = ac.createGain(); revSend.gain.value = 1;
    const conv = ac.createConvolver(); conv.buffer = makeIR(2.8, 2.2); revSend.connect(conv);
    revRet = ac.createGain(); revRet.gain.value = 0.55; conv.connect(revRet); revRet.connect(homeSyn);
    // RUN: file → runShelf (speed brightness) → runFile (trim, +1.5 dB at top speed) ─┐
    //      synth: runMix → runSyn ────────────────────────────────────────────────────┴→ runTone (synth brightness / death duck) → pulseG (death pulse) → runG (crossfade) → world
    runG = ac.createGain(); runG.gain.value = 0; runG.connect(world);
    pulseG = ac.createGain(); pulseG.gain.value = 1; pulseG.connect(runG);
    const pulseLfo = ac.createOscillator(); pulseLfo.frequency.value = 1.7;
    pulseDepth = ac.createGain(); pulseDepth.gain.value = 0; pulseLfo.connect(pulseDepth); pulseDepth.connect(pulseG.gain); pulseLfo.start();
    runTone = ac.createBiquadFilter(); runTone.type = 'lowpass'; runTone.frequency.value = 2400; runTone.Q.value = 0.6; runTone.connect(pulseG);
    runSyn = ac.createGain(); runSyn.gain.value = 1; runSyn.connect(runTone);
    runFile = ac.createGain(); runFile.gain.value = MUSIC.run.trim; runFile.connect(runTone);
    runShelf = ac.createBiquadFilter(); runShelf.type = 'highshelf'; runShelf.frequency.value = 3000; runShelf.gain.value = 0; runShelf.connect(runFile);
    runMix = ac.createGain(); runMix.gain.value = 1; runMix.connect(runSyn);
    scGain = ac.createGain(); scGain.gain.value = 1; scGain.connect(runMix);           // sidechained: bass + stabs
    // lead delay: dotted 8th at 142 bpm, feedback 0.35, dark
    leadIn = ac.createGain(); leadIn.gain.value = 1; leadIn.connect(runMix);
    const dl = ac.createDelay(1.0); dl.delayTime.value = 60 / 142 * 0.75; const fb = ac.createGain(); fb.gain.value = 0.35;
    const dlp = ac.createBiquadFilter(); dlp.type = 'lowpass'; dlp.frequency.value = 2600;
    leadIn.connect(dl); dl.connect(dlp); dlp.connect(fb); fb.connect(dl); const dg = ac.createGain(); dg.gain.value = 0.45; dlp.connect(dg); dg.connect(runMix);
    MUSIC.home.g = homeFile; MUSIC.home.syn = homeSyn; MUSIC.home.seq = HOME;
    MUSIC.run.g = runFile; MUSIC.run.syn = runSyn; MUSIC.run.seq = RUN;
    ok = true;
    if (ac.state === 'suspended') ac.resume();
    decodeMusic(MUSIC.home); decodeMusic(MUSIC.run);      // bytes that could not be decoded offline (no OfflineAudioContext) decode here
    setInterval(() => safe(tick), 60);
    document.addEventListener('visibilitychange', () => safe(() => { if (!document.hidden && !pausedByMenu && ac.state === 'suspended') ac.resume(); }));
    if (!state.running) startHome();
  });
}

function makeNoise(sec) {
  const n = Math.floor(ac.sampleRate * sec);
  const b = ac.createBuffer(1, n, ac.sampleRate);
  const d = b.getChannelData(0);
  let last = 0;
  for (let i = 0; i < n; i++) { const w = Math.random() * 2 - 1; last = 0.6 * last + 0.4 * w; d[i] = last * 1.6; }   // slightly pink
  return b;
}
/** Stereo impulse response: decorrelated noise with an exponential decay (sec to -60 dB ≈ tail), darkened over time. */
function makeIR(sec, tail) {
  const n = Math.floor(ac.sampleRate * sec);
  const b = ac.createBuffer(2, n, ac.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = b.getChannelData(ch); let lp = 0;
    for (let i = 0; i < n; i++) {
      const x = i / ac.sampleRate; const w = Math.random() * 2 - 1;
      const k = 0.15 + 0.6 * (x / sec);                     // more lowpass as the tail goes on
      lp = lp + (w - lp) * (1 - k);
      d[i] = lp * Math.exp(-6.9 * x / tail) * (i < 200 ? i / 200 : 1);
    }
  }
  return b;
}

// ---------------------------------------------------------------- primitives
function env(node, dest, peak, a, d, when, pan) {
  const g = ac.createGain();
  g.gain.setValueAtTime(0.0001, when);
  g.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), when + a);
  g.gain.exponentialRampToValueAtTime(0.0001, when + a + d);
  node.connect(g);
  if (pan !== undefined && ac.createStereoPanner) { const p = ac.createStereoPanner(); p.pan.value = clamp(pan, -1, 1); g.connect(p); p.connect(dest); }
  else g.connect(dest);
  return g;
}
/** Linear attack / hold / linear release (pads): peak over a, hold until when+dur, release r. */
function envHold(node, dest, peak, a, dur, r, when) {
  const g = ac.createGain();
  g.gain.setValueAtTime(0, when);
  g.gain.linearRampToValueAtTime(peak, when + a);
  g.gain.setValueAtTime(peak, when + Math.max(a, dur));
  g.gain.linearRampToValueAtTime(0, when + Math.max(a, dur) + r);
  node.connect(g); g.connect(dest);
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
function osc(type, f0, f1, when, dur, detune) {
  const o = ac.createOscillator(); o.type = type;
  o.frequency.setValueAtTime(f0, when);
  if (f1 !== undefined) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), when + dur);
  if (detune) o.detune.value = detune;
  o.start(when); o.stop(when + dur + 0.05);
  return o;
}
function lowpass(f, q) { const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = f; if (q) lp.Q.value = q; return lp; }
function mulberry32(a) { return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

// ---------------------------------------------------------------- pitch: everything is in D (D4 = 293.66 Hz), semitones from D4
const D4 = 293.66;
const F = (n) => D4 * Math.pow(2, n / 12);
const IN_SEN = [0, 1, 5, 7, 10];           // D Eb G A C
const PENTA_MIN = [0, 3, 5, 7, 10];        // D F G A C  (run bass)
const PENTA_MAJ = [0, 2, 4, 7, 9];         // coin blip ladder

// ---------------------------------------------------------------- SFX
const SFX = {
  coin(pan) {
    const t = ac.currentTime;
    let s = Number.isFinite(state.streak) ? state.streak : 0;
    if (!Number.isFinite(state.streak)) { if (t - lastCoinT > 2.5) streak = 0; streak++; lastCoinT = t; s = streak - 1; }
    const idx = clamp(s | 0, 0, 14);
    const f = 880 * Math.pow(2, (PENTA_MAJ[idx % 5] + 12 * Math.floor(idx / 5)) / 12);
    const det = 1 + (Math.random() - 0.5) * 0.01;
    env(osc('sine', f * det, undefined, t, 0.08), sfx, 0.22, 0.003, 0.08, t, pan);
    env(osc('sine', f * 1.5 * det, undefined, t + 0.05, 0.14), sfx, 0.2, 0.003, 0.14, t + 0.05, pan);
    env(osc('triangle', f * 2 * det, undefined, t + 0.05, 0.1), sfx, 0.06, 0.003, 0.1, t + 0.05, pan);
  },
  jump() {
    const t = ac.currentTime;
    env(noise(t, 0.28, 'bandpass', 380, 2400, 1.2), sfx, 0.32, 0.02, 0.26, t);
    env(osc('triangle', 220, 520, t, 0.16), sfx, 0.09, 0.01, 0.15, t);
    env(osc('sine', 440, 880, t + 0.02, 0.12), sfx, 0.05, 0.01, 0.11, t + 0.02);
  },
  slide() {
    const t = ac.currentTime;
    env(noise(t, 0.34, 'lowpass', 900, 160), sfx, 0.45, 0.01, 0.32, t);
    env(noise(t, 0.2, 'bandpass', 2200, 700, 1.5), sfx, 0.12, 0.01, 0.18, t);
    env(osc('sine', 120, 45, t, 0.2), sfx, 0.35, 0.005, 0.19, t);
  },
  stumble() {
    const t = ac.currentTime;
    env(noise(t, 0.12, 'highpass', 1200), sfx, 0.25, 0.002, 0.1, t);
    env(noise(t, 0.10, 'bandpass', 700, 300, 2), sfx, 0.25, 0.002, 0.09, t);
    env(osc('sine', 150, 50, t, 0.18), sfx, 0.45, 0.003, 0.16, t);
    const w = osc('triangle', 330, 240, t + 0.04, 0.22); const wob = ac.createOscillator(); wob.frequency.value = 14; const wg = ac.createGain(); wg.gain.value = 30; wob.connect(wg); wg.connect(w.frequency); wob.start(t); wob.stop(t + 0.3);
    env(w, sfx, 0.08, 0.01, 0.2, t + 0.04);
  },
  hit(soft) {
    const t = ac.currentTime, k = soft ? 0.55 : 1;
    env(noise(t, 0.14, 'highpass', 1200), sfx, 0.45 * k, 0.002, 0.12, t);
    env(noise(t, 0.10, 'bandpass', 700, 300, 2), sfx, 0.4 * k, 0.002, 0.09, t);
    env(osc('sine', 160, 38, t, 0.22), sfx, 0.7 * k, 0.003, 0.2, t);
  },
  crash() {
    const t = ac.currentTime;
    env(noise(t, 0.5, 'highpass', 900, 200), sfx, 0.6, 0.002, 0.45, t);
    env(noise(t, 0.25, 'bandpass', 500, 150, 1.5), sfx, 0.5, 0.002, 0.22, t);
    env(osc('sine', 140, 30, t, 0.5), sfx, 0.9, 0.003, 0.48, t);
    const lp = lowpass(700, 1);
    for (const n of [-24, -17, -23]) osc('sawtooth', F(n), F(n) * 0.5, t + 0.03, 0.9).connect(lp);   // a dissonant falling smear
    env(lp, sfx, 0.18, 0.02, 0.85, t + 0.03);
  },
  whoosh(pan) {
    const t = ac.currentTime;
    env(noise(t, 0.38, 'bandpass', 1400, 260, 0.9), sfx, 0.3, 0.05, 0.3, t, pan);
  },
  bark(variant, pan) {
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
  shieldBreak() {
    const t = ac.currentTime;
    env(noise(t, 0.35, 'bandpass', 6500, 2500, 1.2), sfx, 0.5, 0.002, 0.32, t);          // glassy burst
    for (let i = 0; i < 5; i++) {                                                          // falling shards
      const f = 2200 + Math.random() * 3200, dt = 0.02 + i * 0.045;
      env(osc('sine', f, f * 0.55, t + dt, 0.25), sfx, 0.12, 0.003, 0.22, t + dt, Math.random() * 1.2 - 0.6);
    }
    env(osc('sine', 170, 50, t, 0.25), sfx, 0.5, 0.003, 0.22, t);
  },
  // power-up fanfares: one voice per type
  powerup(type) {
    const t = ac.currentTime;
    const tone = (n, at, dur, g, kind = 'triangle', pan) => env(osc(kind, F(n), undefined, t + at, dur), sfx, g, 0.006, dur, t + at, pan);
    if (type === 'magnet') {                                    // electric zip: a filtered saw sweep + two metallic pings
      const o = osc('sawtooth', 160, 1400, t, 0.28); const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 4; bp.frequency.setValueAtTime(400, t); bp.frequency.exponentialRampToValueAtTime(3200, t + 0.28);
      o.connect(bp); env(bp, sfx, 0.35, 0.01, 0.26, t);
      tone(19, 0.16, 0.12, 0.18, 'square', -0.3); tone(26, 0.26, 0.2, 0.18, 'square', 0.3);
    } else if (type === 'omamori') {                            // shrine bell: inharmonic partials, soft, long
      for (const [r, g, d] of [[1, 0.3, 1.4], [2.02, 0.16, 1.0], [2.98, 0.1, 0.8], [4.9, 0.05, 0.5]]) env(osc('sine', 1046 * r, undefined, t, d), sfx, g, 0.004, d, t);
      env(noise(t, 0.03, 'highpass', 5000), sfx, 0.12, 0.001, 0.03, t);
      tone(12, 0.35, 0.6, 0.12, 'sine'); tone(19, 0.5, 0.7, 0.1, 'sine');
    } else if (type === 'x2') {                                  // ta-da-DA: two quick notes then an octave stab
      tone(12, 0, 0.1, 0.22); tone(17, 0.1, 0.1, 0.22);
      for (const n of [24, 12, 19]) env(osc('sawtooth', F(n), undefined, t + 0.22, 0.4), sfx, 0.13, 0.008, 0.38, t + 0.22);
      tone(24, 0.22, 0.4, 0.2, 'triangle');
    } else if (type === 'sneakers') {                            // bouncy: three rising boings
      for (let i = 0; i < 3; i++) { const at = i * 0.11, n = 5 + i * 7; env(osc('triangle', F(n) * 0.8, F(n) * 1.4, t + at, 0.14), sfx, 0.24, 0.005, 0.13, t + at, (i - 1) * 0.4); }
      env(noise(t + 0.3, 0.2, 'bandpass', 1500, 4000, 1), sfx, 0.12, 0.02, 0.18, t + 0.3);
    } else if (type === 'surge') {                               // BIG: a rising whoosh into a bright sustained chord
      env(noise(t, 1.1, 'bandpass', 220, 7500, 1.4), sfx, 0.5, 0.6, 0.5, t);
      env(osc('sawtooth', 73.4, 293.7, t, 1.0), sfx, 0.12, 0.5, 0.5, t);
      const lp = lowpass(600, 1); lp.frequency.setValueAtTime(600, t + 0.9); lp.frequency.exponentialRampToValueAtTime(6000, t + 1.4);
      for (const n of [-12, -5, 0, 5, 12]) for (const det of [-9, 9]) osc('sawtooth', F(n), undefined, t + 0.95, 1.6, det).connect(lp);
      envHold(lp, sfx, 0.22, 0.05, 0.7, 0.9, t + 0.95);
      env(noise(t + 0.95, 0.6, 'highpass', 3500, 1200), sfx, 0.3, 0.005, 0.55, t + 0.95);
      tone(24, 0.98, 0.9, 0.12, 'triangle');
    } else {                                                     // unknown type: a plain two-note pickup
      tone(12, 0, 0.12, 0.2); tone(19, 0.12, 0.25, 0.2);
    }
  },
  mission() {
    const t = ac.currentTime;
    [[0, 0], [5, 0.12], [7, 0.24], [12, 0.36]].forEach(([n, at]) => env(osc('triangle', F(n + 12), undefined, t + at, 0.5), sfx, 0.2, 0.006, 0.45, t + at));
    env(osc('sine', F(24), undefined, t + 0.36, 0.7), sfx, 0.12, 0.01, 0.65, t + 0.36);
  },
  achievement() {
    const t = ac.currentTime;
    [[0, 0], [7, 0.1], [12, 0.2], [19, 0.3]].forEach(([n, at]) => { env(osc('triangle', F(n + 12), undefined, t + at, 0.5), sfx, 0.2, 0.006, 0.45, t + at); env(osc('sawtooth', F(n + 12), undefined, t + at, 0.5, 6), sfx, 0.05, 0.006, 0.45, t + at); });
    const lp = lowpass(2200, 0.7);
    for (const n of [0, 7, 12, 19, 24]) for (const det of [-7, 7]) osc('sawtooth', F(n), undefined, t + 0.42, 1.3, det).connect(lp);
    envHold(lp, sfx, 0.1, 0.05, 0.5, 0.8, t + 0.42);
    for (let i = 0; i < 6; i++) { const f = F(24 + IN_SEN[i % 5]); env(osc('sine', f, undefined, t + 0.5 + i * 0.07, 0.5), sfx, 0.05, 0.004, 0.45, t + 0.5 + i * 0.07, (i % 2) * 0.8 - 0.4); }
  },
  zoneStinger() {
    const t = ac.currentTime;
    env(noise(t, 0.3, 'bandpass', 1200, 200, 1.2), sfx, 0.35, 0.003, 0.28, t);
    env(osc('sine', 190, 60, t, 0.3), sfx, 0.55, 0.004, 0.28, t);
    const lp = lowpass(1400, 1);
    for (const n of [-12, -5, 0]) osc('sawtooth', F(n), undefined, t, 0.35).connect(lp);
    env(lp, sfx, 0.14, 0.005, 0.32, t);
  },
  reveal() {
    const t = ac.currentTime;
    [0, 5, 7, 10, 12, 17, 19, 24].forEach((n, i) => env(osc('triangle', F(n + 12), undefined, t + i * 0.06, 0.6), sfx, 0.14, 0.004, 0.55, t + i * 0.06, (i % 2) * 0.7 - 0.35));
    const lp = lowpass(300, 1); lp.frequency.setValueAtTime(300, t); lp.frequency.exponentialRampToValueAtTime(5000, t + 0.9);
    for (const n of [-12, -5, 0, 5, 12]) for (const det of [-8, 8]) osc('sawtooth', F(n), undefined, t, 1.5, det).connect(lp);
    envHold(lp, sfx, 0.16, 0.5, 0.7, 0.6, t);
    env(noise(t, 0.9, 'bandpass', 500, 7000, 1.2), sfx, 0.22, 0.6, 0.3, t);
    for (const [r, g] of [[1, 0.12], [2.02, 0.06]]) env(osc('sine', F(24) * r, undefined, t + 0.5, 1.2), sfx, g, 0.01, 1.1, t + 0.5);
  },
};

// ---------------------------------------------------------------- sequencer core
// A seq is { bpm, div (steps per beat), loop (steps), on, step, next, stopAt, fn(step, t) }. tick() runs both on a
// 60 ms interval with LOOKAHEAD of scheduling; a seq that finished fading out is switched off at stopAt.
function mkSeq(bpm, div, loop, fn) { return { bpm, div, loop, stepDur: 60 / bpm / div, fn, on: false, step: 0, count: 0, next: 0, stopAt: 0 }; }
function seqOn(s, when) { if (!s.on) { s.on = true; s.step = 0; s.count = 0; s.next = when; } s.stopAt = 0; }
function tick() {
  if (!ok) return;
  const now = ac.currentTime;
  for (const s of [HOME, RUN]) {
    if (!s.on) continue;
    if (s.stopAt && now > s.stopAt) { s.on = false; continue; }
    if (s.next < now - 0.5) s.next = now + 0.05;                 // after a long stall, resync rather than burst
    while (s.next < now + LOOKAHEAD) { s.fn(s.step, s.next, s.count); s.step++; if (s.step >= s.loop) { s.step = 0; s.count++; } s.next += s.stepDur; }
  }
}

// ---------------------------------------------------------------- HOME track: 72 bpm, 8th-note steps, 16 bars = 128 steps
// pattern generated once from a fixed seed so every loop is identical (and the arp is composed, not random)
const HOME_ARP = new Array(128).fill(null), HOME_CHIME = new Array(128).fill(0);
{
  const rng = mulberry32(7);
  const ladder = []; for (let o = 0; o < 2; o++) for (const d of IN_SEN) ladder.push(d + 12 * o); ladder.push(24);   // D4 … D6
  let deg = 3;
  for (let i = 0; i < 128; i++) {
    const bar = i >> 3, s = i & 7;
    const busy = (bar % 8) >= 3 && (bar % 8) <= 6 ? 0.55 : 0.36;                      // a fuller middle to each 8-bar phrase
    if (rng() < busy && !(s === 0 && bar % 4 === 0 && rng() < 0.5)) {
      deg = clamp(deg + Math.round((rng() - 0.5) * 4), 0, ladder.length - 1);
      HOME_ARP[i] = { n: ladder[deg], v: 0.5 + rng() * 0.5, pan: (rng() - 0.5) * 0.8, grace: rng() < 0.12 };
    }
    if (s === 0 && rng() < 0.3) HOME_CHIME[i + Math.floor(rng() * 8)] = 1 + Math.floor(rng() * 3);   // 1-3 chimes somewhere in the bar
  }
  HOME_CHIME[0] = 2;                                             // a chime on the downbeat of the loop
}
// pad chords, 4 bars each, semitones from D4 (no sub; the sub takes the root two octaves under D4)
const HOME_CHORDS = [
  { notes: [-12, -5, 0, 5], sub: -24 },     // D3 A3 D4 G4      / D2
  { notes: [-14, -7, 0, 7], sub: -26 },     // C3 G3 D4 A4      / C2
  { notes: [-19, -12, -7, 10], sub: -31 },  // G2 D3 G3 C4      / G1
  { notes: [-17, -12, -7, 10], sub: -29 },  // A2 D3 G3 C4      / A1
];
function padChord(chord, t, dur) {
  const lp = lowpass(520, 0.9);
  const lfo = ac.createOscillator(); lfo.frequency.value = 0.06; lfo.start(t); lfo.stop(t + dur + 3.2);
  const lg = ac.createGain(); lg.gain.value = 230; lfo.connect(lg); lg.connect(lp.frequency);
  for (const n of chord.notes) for (const det of [-9, 0, 9]) osc('sawtooth', F(n), undefined, t, dur + 3, det).connect(lp);
  osc('triangle', F(chord.notes[0] - 12), undefined, t, dur + 3).connect(lp);
  envHold(lp, homeMix, 0.055, 1.8, dur - 1.0, 2.6, t);
  envHold(lp, revSend, 0.03, 1.8, dur - 1.0, 2.6, t);
  const sub = osc('sine', F(chord.sub), undefined, t, dur + 1);
  envHold(sub, homeMix, 0.32, 0.6, dur - 0.6, 0.9, t);
}
function pluck(n, t, vel, pan) {
  const f = F(n);
  const lp = lowpass(2300, 0.7);
  osc('triangle', f, undefined, t, 0.8).connect(lp);
  const o2 = osc('sine', f * 2, undefined, t, 0.5); const g2 = ac.createGain(); g2.gain.value = 0.25; o2.connect(g2); g2.connect(lp);
  env(lp, homeMix, 0.2 * vel, 0.004, 0.55, t, pan);
  env(lp, revSend, 0.13 * vel, 0.004, 0.55, t, pan);
  env(noise(t, 0.012, 'highpass', 3000), homeMix, 0.03 * vel, 0.001, 0.012, t, pan);
}
function chime(t, n, vel, pan) {
  const f = F(n);
  const sum = ac.createGain(); sum.gain.value = 1;
  for (const [r, g, d] of [[1, 1, 2.4], [2.76, 0.45, 1.7], [5.4, 0.25, 1.1], [8.93, 0.12, 0.7]]) env(osc('sine', f * r, undefined, t, d), sum, g * 0.09 * vel, 0.003, d, t);
  const p = ac.createStereoPanner ? ac.createStereoPanner() : null;
  if (p) { p.pan.value = pan; sum.connect(p); }
  const dry = ac.createGain(); dry.gain.value = 0.45; (p || sum).connect(dry); dry.connect(homeMix);
  const wet = ac.createGain(); wet.gain.value = 1.0; (p || sum).connect(wet); wet.connect(revSend);
}
const HOME = mkSeq(72, 2, 128, (i, t) => {
  const bar = i >> 3, s = i & 7;
  if (s === 0 && bar % 4 === 0) padChord(HOME_CHORDS[(bar >> 2) & 3], t, 4 * 8 * HOME.stepDur);
  const a = HOME_ARP[i];
  if (a) { pluck(a.n, t, a.v, a.pan); if (a.grace) pluck(a.n + 5, t + HOME.stepDur * 0.5, a.v * 0.6, -a.pan); }
  const c = HOME_CHIME[i];
  if (c) for (let k = 0; k < c; k++) chime(t + k * (0.06 + Math.random() * 0.06), 24 + IN_SEN[(i + k * 2) % 5] + (k === 1 ? 12 : 0), 0.7 + Math.random() * 0.3, Math.random() * 1.4 - 0.7);
});

// ---------------------------------------------------------------- RUN track: 142 bpm, 16th-note steps, 16 bars = 256 steps
const RUN_BASS = [0, 0, 12, 0, 0, 7, 10, 0, 0, 0, 12, 0, 0, 3, 5, 7];       // 8th notes over 2 bars, semitones from the phrase root
const RUN_ROOT = [0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, -2, -2, -5, -5];     // per bar: D D … F F C C A A → back to D
const RUN_MOTIF = [7, 10, 12, 10, 7, 5, null, 0, 1, 0, null, 7, 5, null, 0, null];   // 8th notes, in-sen from D5, bars 7-8 and 15-16
function kick(t, g) {
  env(osc('sine', 165, 42, t, 0.16), runMix, 0.9 * g, 0.002, 0.26, t);
  env(noise(t, 0.02, 'highpass', 2500), runMix, 0.22 * g, 0.001, 0.02, t);
  scGain.gain.setValueAtTime(0.1, t); scGain.gain.linearRampToValueAtTime(1, t + 0.2);     // the sidechain pump
}
function hat(t, g, open, pan) { env(noise(t, open ? 0.35 : 0.06, 'highpass', open ? 6500 : 8000), runMix, g, 0.001, open ? 0.32 : 0.045, t, pan); }
function clap(t, g) { for (const dt of [0, 0.011, 0.022]) env(noise(t + dt, 0.05, 'bandpass', 1500, undefined, 1), runMix, g * 0.6, 0.001, 0.04, t + dt); env(noise(t + 0.02, 0.18, 'bandpass', 1300, 900, 1.2), runMix, g, 0.002, 0.16, t + 0.02); }
function rim(t, g, pan) { env(osc('triangle', 900, 480, t, 0.03), runMix, g, 0.001, 0.03, t, pan); env(noise(t, 0.03, 'bandpass', 2600, undefined, 3), runMix, g * 0.7, 0.001, 0.03, t, pan); }
function shaker(t, g, pan) { env(noise(t, 0.045, 'bandpass', 6500, undefined, 2), runMix, g, 0.004, 0.04, t, pan); }
function bassNote(n, t, dur, I) {
  const lp = lowpass(420 + 2600 * I, 4);
  for (const det of [0, 9]) osc('sawtooth', F(n), undefined, t, dur, det).connect(lp);
  env(lp, scGain, 0.5, 0.004, dur, t);
}
function stab(root, t, I) {
  const lp = lowpass(900 + 3200 * I, 1);
  for (const n of [root - 12, root - 5, root, root + 5]) osc('sawtooth', F(n), undefined, t, 0.2).connect(lp);
  env(lp, scGain, 0.15, 0.005, 0.17, t);
}
function lead(n, t, I) {
  const lp = lowpass(1500 + 4000 * I, 1.2);
  for (const det of [-7, 7]) osc('sawtooth', F(n + 12), undefined, t, 0.3, det).connect(lp);
  const sq = osc('square', F(n), undefined, t, 0.3); const sg = ac.createGain(); sg.gain.value = 0.3; sq.connect(sg); sg.connect(lp);
  env(lp, leadIn, 0.2, 0.01, 0.26, t);
}
function riser(t, dur) {
  const n = noise(t, dur, 'bandpass', 350, 6500, 1.6);
  const g = ac.createGain(); g.gain.setValueAtTime(0.02, t); g.gain.linearRampToValueAtTime(0.38, t + dur); g.gain.setValueAtTime(0.0001, t + dur + 0.01); n.connect(g); g.connect(runMix);
  const lp = lowpass(800, 2); lp.frequency.setValueAtTime(800, t); lp.frequency.exponentialRampToValueAtTime(4500, t + dur);
  osc('sawtooth', F(-24), F(-12), t, dur).connect(lp);
  const g2 = ac.createGain(); g2.gain.setValueAtTime(0.03, t); g2.gain.linearRampToValueAtTime(0.16, t + dur); g2.gain.setValueAtTime(0.0001, t + dur + 0.01); lp.connect(g2); g2.connect(runMix);
}
function crash(t) { env(noise(t, 1.3, 'highpass', 3200, 1000), runMix, 0.36, 0.003, 1.2, t); }
const RUN = mkSeq(142, 4, 256, (i, t, count) => {
  const bar = i >> 4, s = i & 15, I = inten, root = RUN_ROOT[bar];
  if (s % 4 === 0) kick(t, 1);
  if (I > 0.7 && s === 14 && bar % 4 === 3) kick(t, 0.6);
  if (s % 4 === 2) hat(t, 0.28 + 0.12 * I, false, 0.15);
  if (I > 0.35 && (s & 1)) hat(t, 0.06 + 0.16 * I, false, -0.15);
  if (I > 0.5 && s === 14) hat(t, 0.10 + 0.14 * I, true, 0.2);
  if (s === 4 || s === 12) clap(t, 0.32 + 0.22 * I);
  if (I > 0.6 && (s === 3 || s === 10 || s === 13)) rim(t, 0.1 + 0.12 * I, -0.35);
  if (I > 0.8 && (s & 1)) shaker(t, 0.05 + 0.1 * I, 0.4);
  if ((s & 1) === 0) bassNote(-24 + root + RUN_BASS[((bar & 1) << 3) + (s >> 1)], t, RUN.stepDur * 1.8, I);
  if (s === 2 || s === 10) stab(root, t, I);
  if (bar % 8 >= 6 && (s & 1) === 0) { const n = RUN_MOTIF[((bar % 8 - 6) << 3) + (s >> 1)]; if (n !== null) lead(n + root, t, I); }
  if (bar === 14 && s === 0) riser(t, 32 * RUN.stepDur);
  if (i === 0 && count > 0) crash(t);
});

// ---------------------------------------------------------------- music files: the two Atlas tracks (synth above is the fallback)
// Fetched from init() (the promise is never awaited, READY does not wait). Decoded the moment the bytes land: on the
// real context if it exists, else on a throwaway OfflineAudioContext (needs no gesture), else deferred to unlock().
// trim: the file's own level into the pass-2 bus (home -14 dB, run -6 dB). Whole-file RMS (ffmpeg astats): home -21.1
// dBFS / peak -0.7, run -16.9 / peak +0.1; the home intro is ~4 dB under its average, the run opening ~3 dB over. Probe
// (work/v2/audio_probe.mjs, first 6 s of each): home +10 → -29.3 dB RMS out, run +3 → -16.8 dB RMS / peak -2.2 out,
// so the trims are now +13 (home ≈ -26 dB, the synth pad was -23.5) and +2 (run ≈ -18 dB, room for the +1.5 dB lift).
const MUSIC_V = '?v=202609241141';
const MUSIC = {
  home: { url: '../audio/music_home.mp3', trim: DB(13) },
  run: { url: '../audio/music_run.mp3', trim: DB(2) },
};
for (const m of Object.values(MUSIC)) Object.assign(m, { buf: null, bytes: null, decoding: false, failed: false, loopStart: 0, loopEnd: 0, src: null, srcG: null, fadeUntil: 0, g: null, syn: null, seq: null });
function fetchMusic(m) {
  if (typeof fetch !== 'function') { m.failed = true; return; }
  let url = m.url + MUSIC_V;
  try { url = new URL(url, import.meta.url).href; } catch (e) { /* relative to the page then */ }
  fetch(url).then((r) => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.arrayBuffer(); })
    .then((ab) => { m.bytes = ab; decodeMusic(m); })
    .catch((e) => { m.failed = true; console.warn('audio: music file unavailable, synth fallback: ' + m.url + ' (' + (e && e.message) + ')'); });
}
function decodeMusic(m) {
  if (!m.bytes || m.decoding || m.buf) return;
  let dc = ac;
  if (!dc) {
    const OAC = globalThis.OfflineAudioContext || globalThis.webkitOfflineAudioContext;
    if (!OAC) return;                                              // retried from unlock() once the real context exists
    try { dc = new OAC(2, 1, 44100); } catch (e) { return; }
  }
  const bytes = m.bytes; m.bytes = null; m.decoding = true;
  new Promise((res, rej) => { const p = dc.decodeAudioData(bytes, res, rej); if (p && p.then) p.then(res, rej); })
    .then((buf) => { m.buf = buf; m.decoding = false; trimLoop(m); safe(() => fileArrived(m)); })
    .catch((e) => { m.failed = true; m.decoding = false; console.warn('audio: music decode failed, synth fallback: ' + m.url + ' (' + (e && e.message) + ')'); });
}
/** loopStart = the first of two consecutive 1024-sample windows with RMS above -48 dBFS (a lone window is the encoder's
 *  6 ms start blip); loopEnd = the last window above -48 dBFS (keeps the fade tail, drops the silence pad). A 6 ms fade
 *  is written into the buffer at both ends so the seam lands on zero (the encodes carry 0.3-0.9 s of silence).
 *  On the current encodes (checked offline on ffmpeg-decoded PCM): home 0.325 … 21.037 s, run 0.023 … 63.181 s. */
function trimLoop(m) {
  const b = m.buf, sr = b.sampleRate, n = b.length, W = 1024, thr = DB(-48) * DB(-48);
  const chs = []; for (let c = 0; c < b.numberOfChannels; c++) chs.push(b.getChannelData(c));
  const win = (w) => { const i0 = w * W, i1 = Math.min(n, i0 + W); let sq = 0; for (const d of chs) for (let i = i0; i < i1; i++) sq += d[i] * d[i]; return sq / Math.max(1, (i1 - i0) * chs.length); };
  const nw = Math.ceil(n / W); let a = 0, z = nw - 1;
  while (a < z - 1 && !(win(a) >= thr && win(a + 1) >= thr)) a++;
  while (z > a && win(z) < thr) z--;
  const i0 = a * W, i1 = Math.min(n, (z + 1) * W), f = Math.min(Math.floor(sr * 0.006), (i1 - i0) >> 2);
  for (const d of chs) for (let i = 0; i < f; i++) { const k = i / f; d[i0 + i] *= k; d[i1 - 1 - i] *= k; }
  m.loopStart = i0 / sr; m.loopEnd = i1 / sr;
}
/** A new looping source for track m, through its own gain (so a voice that is fading out never doubles a restart). */
function fileStart(m, when) {
  const s = ac.createBufferSource(); s.buffer = m.buf; s.loop = true; s.loopStart = m.loopStart; s.loopEnd = m.loopEnd;
  const sg = ac.createGain(); sg.gain.value = 1; s.connect(sg); sg.connect(m.g);
  s.start(when, m.loopStart); m.src = s; m.srcG = sg;
}
function fileStop(m, T) {
  const s = m.src, sg = m.srcG; if (!s) return;
  m.src = null; m.srcG = null;
  const t = ac.currentTime;
  sg.gain.setValueAtTime(1, t); sg.gain.linearRampToValueAtTime(0.0001, t + T);
  safe(() => s.stop(t + T + 0.2));
}
const setNow = (param, v) => { const t = ac.currentTime; param.cancelScheduledValues(t); param.setValueAtTime(v, t); };
/** Turn a track's voice on: the file if it is decoded, otherwise the synth sequencer (the bus fade is the caller's). */
function trackOn(m, when) {
  if (m.buf) { if (!m.src) { fileStart(m, when); setNow(m.g.gain, m.trim); m.fadeUntil = 0; } }
  else { seqOn(m.seq, when); setNow(m.syn.gain, 1); }
}
/** Voices stop after the caller's bus fade of T seconds (synth via stopAt, file via its own fade + stop). */
function trackOff(m, T) { const t = ac.currentTime; m.seq.stopAt = t + T + 0.2; fileStop(m, T); }
/** A file decoded while its synth is playing: crossfade synth → file over 0.8 s. Otherwise the next trackOn picks it. */
function fileArrived(m) {
  if (!ok || !m.seq.on || m.seq.stopAt || m.src) return;
  const t = ac.currentTime;
  fileStart(m, t + 0.05);
  m.g.gain.cancelScheduledValues(t); m.g.gain.setValueAtTime(0.0001, t); m.g.gain.linearRampToValueAtTime(m.trim, t + 0.85); m.fadeUntil = t + 0.9;
  ramp(m.syn.gain, 0.0001, 0.8); m.seq.stopAt = t + 1.0;
  if (m === MUSIC.run && !dead) runTone.frequency.setTargetAtTime(runToneHz(), t, 0.1);
}
const homeOn = () => HOME.on || !!MUSIC.home.src;
const runOn = () => RUN.on || !!MUSIC.run.src;
/** The pass-2 tone lowpass expresses intensity for the synth only; the file keeps it open (the shelf does brightness). */
const runToneHz = () => (MUSIC.run.src ? 20000 : 1800 + 14000 * inten);

// ---------------------------------------------------------------- track control: crossfades, death, home
function ramp(param, to, T) { const t = ac.currentTime; param.cancelScheduledValues(t); param.setValueAtTime(Math.max(0.0001, param.value), t); param.linearRampToValueAtTime(to, t + T); }
function startHome() {
  const t = ac.currentTime;
  trackOn(MUSIC.home, t + 0.05);
  ramp(homeG.gain, DB(-14), 0.8);
}
function toRun() {
  clearTimeout(deathTimer); deathTimer = 0; dead = false;
  const t = ac.currentTime;
  trackOn(MUSIC.run, t + 0.05);
  runTone.frequency.cancelScheduledValues(t); runTone.frequency.setTargetAtTime(runToneHz(), t, 0.1);
  pulseG.gain.cancelScheduledValues(t); pulseG.gain.setTargetAtTime(1, t, 0.1);
  pulseDepth.gain.cancelScheduledValues(t); pulseDepth.gain.setTargetAtTime(0, t, 0.1);
  ramp(runG.gain, DB(-6), 0.8);
  ramp(homeG.gain, 0.0001, 0.8); trackOff(MUSIC.home, 0.8);
}
function toHome(T = 0.8) {
  clearTimeout(deathTimer); deathTimer = 0; dead = false;
  const t = ac.currentTime;
  trackOn(MUSIC.home, t + 0.05);
  ramp(homeG.gain, DB(-14), T);
  ramp(runG.gain, 0.0001, T); trackOff(MUSIC.run, T);
}
function onDeath() {
  dead = true;
  const t = ac.currentTime;
  runTone.frequency.cancelScheduledValues(t); runTone.frequency.setTargetAtTime(260, t, 0.25);
  pulseG.gain.setTargetAtTime(0.5, t, 0.3);
  pulseDepth.gain.setTargetAtTime(0.42, t, 0.3);
  ramp(runG.gain, DB(-12), 0.5);
  clearTimeout(deathTimer);
  deathTimer = setTimeout(() => safe(() => { if (dead) toHome(1.4); }), 2000);
}

// ---------------------------------------------------------------- ambience (alley hum / expressway wind), unchanged in character
let dripTimer = 0;
function startAmbience() {
  stopAmbience();
  const t = ac.currentTime;
  amb.gain.cancelScheduledValues(t); amb.gain.setTargetAtTime(DB(-9), t, 0.3);
  {
    const s = ac.createBufferSource(); s.buffer = noiseBuf; s.loop = true;
    const lp = lowpass(520);
    const g = ac.createGain(); g.gain.value = 0.35; s.connect(lp); lp.connect(g); g.connect(ambA); s.start(t); ambSrcs.push(s);
    const lfo = ac.createOscillator(); lfo.frequency.value = 0.09; const lg = ac.createGain(); lg.gain.value = 0.12; lfo.connect(lg); lg.connect(g.gain); lfo.start(t); ambSrcs.push(lfo);
    const hum = ac.createOscillator(); hum.type = 'sawtooth'; hum.frequency.value = 100; const hf = lowpass(220);
    const hg = ac.createGain(); hg.gain.value = 0.05; hum.connect(hf); hf.connect(hg); hg.connect(ambA); hum.start(t); ambSrcs.push(hum);
  }
  {
    const s = ac.createBufferSource(); s.buffer = noiseBuf; s.loop = true; s.playbackRate.value = 0.8;
    const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 300; bp.Q.value = 0.5;
    const g = ac.createGain(); g.gain.value = 0.55; s.connect(bp); bp.connect(g); g.connect(ambX); s.start(t); ambSrcs.push(s);
    const lfo = ac.createOscillator(); lfo.frequency.value = 0.21; const lg = ac.createGain(); lg.gain.value = 180; lfo.connect(lg); lg.connect(bp.frequency); lfo.start(t); ambSrcs.push(lfo);
  }
  setZone(state.zone);
}
function stopAmbience(fade = 0) {
  const srcs = ambSrcs; ambSrcs = [];
  if (fade && srcs.length) { amb.gain.setTargetAtTime(0.0001, ac.currentTime, fade / 3); setTimeout(() => { for (const s of srcs) safe(() => s.stop()); }, fade * 1000 + 50); }
  else for (const s of srcs) safe(() => s.stop());
}
function setZone(zone) {
  if (!ok) return;
  const z = typeof zone === 'object' && zone ? zone.zone : zone;
  const onX = z === 'expressway' || z === 'rampUp' || z === 'rooftops';   // open-air, wind and traffic: the deck and the roofs
  const t = ac.currentTime, T = 1.5;
  ambA.gain.cancelScheduledValues(t); ambA.gain.setTargetAtTime(onX ? 0.0001 : 1, t, T / 3);
  ambX.gain.cancelScheduledValues(t); ambX.gain.setTargetAtTime(onX ? 1 : 0.0001, t, T / 3);
}

// ---------------------------------------------------------------- module interface
const panOf = (p) => {
  const px = Number.isFinite(p && p.x) ? p.x - (state.x || 0) : Number.isInteger(p && p.lane) ? (p.lane - (state.lane || 0)) * config.LANE_W : 0;
  return clamp(px / 4, -1, 1);
};

export async function init(c) {
  ctx = c; state = c.state;
  const on = (name, fn) => c.events.on(name, (p) => { if (ok) safe(() => fn(p)); });
  on('coin', (p) => SFX.coin(panOf(p)));
  on('jump', () => SFX.jump());
  on('roll', () => SFX.slide());
  on('hit', (p) => { streak = 0; if (!(p && p.fatal)) SFX.hit(false); });     // a fatal hit is followed by 'death' (the crash)
  on('stumble', () => { streak = 0; SFX.stumble(); });
  on('bark', (p) => { const v = p && (p.variant === 1 || p.variant === 2) ? p.variant : (barkAlt = 1 - barkAlt) + 1; SFX.bark(v, panOf(p)); });
  on('zone', (z) => { setZone(z); if (state.running && runOn() && !dead) SFX.zoneStinger(); });
  on('death', () => { streak = 0; SFX.crash(); onDeath(); ambA.gain.setTargetAtTime(0.35, ac.currentTime, 0.4); ambX.gain.setTargetAtTime(0.35, ac.currentTime, 0.4); });
  on('start', () => { streak = 0; inten = 0; toRun(); startAmbience(); });
  on('quit', () => { toHome(0.8); stopAmbience(0.8); });
  on('input', (d) => { if (d === 'left' || d === 'right') SFX.whoosh(d === 'left' ? -0.4 : 0.4); });
  on('powerup', (p) => SFX.powerup(p && p.type));
  on('shieldbreak', () => SFX.shieldBreak());
  on('mission', () => SFX.mission());
  on('achievement', () => SFX.achievement());
  on('reveal', () => SFX.reveal());
  // the music files start downloading now; nothing waits for them (a track whose file is not decoded yet plays its synth)
  // The music files (1 MB) wait until the game is READY: fetched at init they shared the 4G link with the
  // code and models the game needs to start, and cost the jam's 20 s load budget. The synth covers the
  // first seconds, and a file that lands crossfades in over it.
  if (!config.MUTE) { const go = () => safe(() => { fetchMusic(MUSIC.home); fetchMusic(MUSIC.run); });
    const wait = () => (globalThis.__READY__ ? setTimeout(go, 400) : setTimeout(wait, 250)); wait(); }
  // the HOME track needs a gesture: the first tap / key anywhere (a tab, the carousel) unlocks and starts it
  if (!config.MUTE && typeof document !== 'undefined') {
    const first = () => { unlock(); for (const e of ['pointerdown', 'touchend', 'keydown']) document.removeEventListener(e, first, true); };
    for (const e of ['pointerdown', 'touchend', 'keydown']) document.addEventListener(e, first, true);
  }
}

export function update(dt) {
  if (!ok) return;
  tick();
  // RUN intensity follows speed: SPEED0 -> SPEED_MAX maps to 0 -> 1, smoothed over ~0.5 s. Synth: the tone filter opens
  // with it (and its layers read it at schedule time). File: a gentle high-shelf (+3 dB above 3 kHz) and +1.5 dB, both
  // scaled by intensity, so top speed is only slightly brighter and 1.5 dB louder.
  if (runOn() && !dead) {
    const target = state.running ? clamp((state.speed - config.SPEED0) / (config.SPEED_MAX - config.SPEED0), 0, 1) : inten;
    inten += (target - inten) * Math.min(1, dt * 2);
    toneT -= dt;
    if (toneT <= 0) {
      toneT = 0.1;
      const t = ac.currentTime, m = MUSIC.run;
      runTone.frequency.setTargetAtTime(runToneHz(), t, 0.1);
      if (m.src) { runShelf.gain.setTargetAtTime(3 * inten, t, 0.1); if (t >= m.fadeUntil) m.g.gain.setTargetAtTime(m.trim * DB(1.5 * inten), t, 0.1); }
    }
  }
  if (ambSrcs.length && state.running && (state.zone === 'alleyA' || state.zone === 'alleyB' || state.zone === 'day')) {
    dripTimer -= dt;
    if (dripTimer <= 0) {
      dripTimer = 1.2 + Math.random() * 2.6;
      safe(() => { const t = ac.currentTime; env(osc('sine', 2600 + Math.random() * 1400, 1800, t, 0.08), ambA, 0.08, 0.003, 0.08, t, Math.random() * 1.6 - 0.8); });
    }
  }
}
