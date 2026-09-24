/**
 * input.js — touch swipes on the canvas + keys, one queued action. (E3)
 *
 *   init(ctx)            binds real DOM listeners: touchstart/touchmove/touchend on the canvas, keydown on window,
 *                        pointer events for a MOUSE drag only (touch also fires pointer events; those are skipped).
 *   update(dt)           nothing to do per frame; kept for the loop's uniform interface
 *   consume()  → 'left' | 'right' | 'up' | 'down' | null    returns AND clears the queued action
 *   peek()     → same, without clearing
 *   clear()
 *
 * Rules (ARCH.md / GATE_CONTRACT.md): a swipe is ≥ config.SWIPE_PX (40) px within config.SWIPE_MS (300) ms, direction by
 * the dominant axis, recognised on the touchmove that crosses the threshold (lowest latency) or on touchend. Keys:
 * Arrow*, WASD, Space = up. One action is queued at a time (the newest wins). Input is ignored before start and
 * while state.over. A 100 ms debounce per direction (config.INPUT_DEBOUNCE_MS). The player should call consume()
 * every frame, even while it cannot act (stumble), so a stale swipe never fires late.
 *
 * Emits 'input' with the direction when an action is queued (for HUD hints / debugging; nobody needs to listen).
 */
import config from './config.js?v=202609241255';

let ctx = null, state = null, canvas = null;
let queued = null;
const lastAt = { left: 0, right: 0, up: 0, down: 0 };

function push(dir) {
  if (!state || !state.running || state.over) return;
  const now = performance.now();
  if (now - lastAt[dir] < config.INPUT_DEBOUNCE_MS) return;
  lastAt[dir] = now;
  queued = dir;
  ctx.events.emit('input', dir);
}

export function consume() { const a = queued; queued = null; return a; }
export function peek() { return queued; }
export function clear() { queued = null; }

// ---- swipe recognition (shared by touch and mouse-drag)
let sx = 0, sy = 0, st = 0, sid = null, tracking = false, fired = false;
function begin(x, y, id) { sx = x; sy = y; st = performance.now(); sid = id; tracking = true; fired = false; }
function move(x, y) {
  if (!tracking || fired) return;
  const dx = x - sx, dy = y - sy;
  if (Math.hypot(dx, dy) < config.SWIPE_PX) return;   // 40 px: the gate swipes 90; a real thumb flick crosses this in ~2 frames
  if (performance.now() - st > config.SWIPE_MS) { tracking = false; return; }   // too slow: a drag, not a swipe
  fired = true;
  push(Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : (dy < 0 ? 'up' : 'down'));
}
function end(x, y) {
  if (!tracking) return;
  if (!fired) move(x, y);
  tracking = false; fired = false; sid = null;
}
function cancel() { tracking = false; fired = false; sid = null; }

const KEYS = {
  ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right',
  ArrowUp: 'up', KeyW: 'up', Space: 'up', ArrowDown: 'down', KeyS: 'down',
};

export async function init(c) {
  ctx = c; state = c.state; canvas = c.canvas || document.getElementById('c');

  const touchOf = (e) => {
    if (sid === null) return e.changedTouches[0];
    for (const t of e.changedTouches) if (t.identifier === sid) return t;
    return null;
  };
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (tracking) return;                       // one finger drives; a second is ignored
    const t = e.changedTouches[0]; begin(t.clientX, t.clientY, t.identifier);
  }, { passive: false });
  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const t = touchOf(e); if (t) move(t.clientX, t.clientY);
  }, { passive: false });
  canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    const t = touchOf(e); if (t) end(t.clientX, t.clientY);
  }, { passive: false });
  canvas.addEventListener('touchcancel', cancel);

  // Mouse drags for desktop development. Touch also produces pointer events; pointerType keeps them apart so a
  // finger is never counted twice.
  canvas.addEventListener('pointerdown', (e) => { if (e.pointerType === 'mouse' && e.button === 0) begin(e.clientX, e.clientY, 'm'); });
  canvas.addEventListener('pointermove', (e) => { if (e.pointerType === 'mouse' && sid === 'm') move(e.clientX, e.clientY); });
  canvas.addEventListener('pointerup', (e) => { if (e.pointerType === 'mouse' && sid === 'm') end(e.clientX, e.clientY); });
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());

  addEventListener('keydown', (e) => {
    const dir = KEYS[e.code];
    if (!dir) return;
    e.preventDefault();
    if (e.repeat) return;
    push(dir);
  }, { passive: false });
  addEventListener('blur', () => { cancel(); queued = null; });

  c.events.on('death', () => { queued = null; cancel(); });
  c.events.on('start', () => { queued = null; });
}

export function update() { /* nothing per frame */ }
