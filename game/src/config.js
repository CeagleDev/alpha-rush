/**
 * config.js — the constants every module reads (ARCH.md "ctx.config"). E3 writes; nobody else edits.
 * Values are metres, seconds, metres per second. Lanes are -1 | 0 | 1 at x = LANE_X[lane + 1].
 *
 * URL parameters: ?seed=N (fixes rng, chunk sequence, rows, coins; default random) · ?gate=1 (speed ramp
 * fixed to distance) · ?nohud=1 (HUD hidden) · ?mute=1 (no audio at all).
 */
const Q = (() => { try { return new URLSearchParams(location.search); } catch { return new URLSearchParams(); } })();
const num = (k, d) => { const v = Number(Q.get(k)); return Number.isFinite(v) && Q.has(k) ? v : d; };
const on = (k) => Q.get(k) === '1' || Q.get(k) === 'true';

export const LANE_W = 2;
export const LANES = 3;
export const LANE_X = [-2, 0, 2];
export const CHUNK_LEN = 30;
export const SPEED0 = 9;
export const SPEED_STEP = 0.6;
export const SPEED_STEP_M = 150;
export const SPEED_MAX = 20;
export const JUMP_H = 1.1;
export const JUMP_T = 0.45;   // half the hang: 0.9 s in the air (was 1.1). With the flat-topped arc in player.js the runner is at clearing height within 0.1 s of take-off and stays there for 0.7 s, so the jump is both swift and forgiving.
export const ROLL_T = 0.6;   // 0.5 read as a blink, 0.8 as sluggish (owner, both times). Jump still cancels it.
export const LANE_T = 0.14;
export const PACK_DIST = 2.6;
export const DRAW_BUDGET = 900;
export const TRI_BUDGET = 1500000;
export const PHONE_MAX_W = 700;

/** Seed for state.rng (mulberry32). ?seed=N or a random 31-bit integer. */
export const SEED = num('seed', (Math.random() * 0x7fffffff) | 0) | 0;
/** ?gate=1: the speed ramp is a pure function of distance so photos at fixed distances repeat. */
export const GATE = on('gate');
/** ?nohud=1: hud.js builds nothing visible. */
export const NOHUD = on('nohud');
/** ?mute=1: audio.js never creates an AudioContext. */
export const MUTE = on('mute');

/** Phone tier from width / devicePixelRatio: a small viewport, or a dense small screen. */
export const phone = (() => {
  const w = globalThis.innerWidth || 1280, h = globalThis.innerHeight || 720;
  const dpr = globalThis.devicePixelRatio || 1;
  const touch = typeof navigator !== 'undefined' && ((navigator.maxTouchPoints || 0) > 0 || 'ontouchstart' in globalThis);
  return Math.min(w, h) <= PHONE_MAX_W * 0.72 || (w <= PHONE_MAX_W && (dpr >= 2 || touch));
})();

/** Input (input.js): a swipe is ≥ SWIPE_PX within SWIPE_MS; the gate swipes 90 px in ~100 ms. */
export const SWIPE_PX = 40;
export const SWIPE_MS = 300;
export const INPUT_DEBOUNCE_MS = 60;    // same-direction only (input.js); a different direction is never held back
/** Physics dt clamp (main.js). fps is still computed from the real delta. */
export const MAX_DT = 0.05;

export default {
  LANE_W, LANES, LANE_X, CHUNK_LEN, SPEED0, SPEED_STEP, SPEED_STEP_M, SPEED_MAX, JUMP_H, JUMP_T, ROLL_T, LANE_T,
  PACK_DIST, DRAW_BUDGET, TRI_BUDGET, PHONE_MAX_W, SEED, GATE, NOHUD, MUTE, phone,
  SWIPE_PX, SWIPE_MS, INPUT_DEBOUNCE_MS, MAX_DT,
};
