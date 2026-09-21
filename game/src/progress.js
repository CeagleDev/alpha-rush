/**
 * progress.js — score, the score MULTIPLIER, MISSIONS and the saved best. The Subway Surfers meta loop.
 *
 *   init(ctx)   loads the save (localStorage 'md.save.v1'), builds the current mission set, listens to the run
 *   update(dt)  accrues score from distance, advances missions, writes state.score / state.mult / state.missions
 *   summary()   { best, newBest, mult, missions:[{text, have, goal, done}], set } for the title and death cards
 *
 * WHY (owner, 2026-09-21: "Subway Surfers is the base ... as engaging as possible until the runner fails").
 * In Subway Surfers the run itself never changes its rules; what pulls a player into the NEXT run is
 * that every run pays into something permanent. Its loop is: three missions at a time -> finish the
 * set -> the score multiplier goes up by one, for good (cap x30) -> the same run is now worth more.
 * That is adopted here as it stands:
 *   score   += metres run x mult (+ 10 x mult per coin); the x2 power-up doubles mult while it lasts
 *   mult     = 1 + mission sets completed (cap 30), saved
 *   missions = three per set, generated from the set number so they scale for ever; cumulative ones
 *              (coins, jumps, rolls, pickups) carry across runs, "in one run" ones reset each run
 *
 * state written: score (float; hud floors it), mult (effective, incl. x2), baseMult, missions, best, newBest.
 * Emits: 'mission' {text} when one completes, 'missionset' {mult} when a set completes.
 * Storage failures (private mode, blocked) are swallowed: the game plays the same, it just forgets.
 */
const KEY = 'md.save.v1';
let ctx = null, S = null, save = null, lastDist = 0, cleanFrom = 0, dirty = false, saveT = 0;

function load() {
  try { const j = JSON.parse(localStorage.getItem(KEY) || 'null'); if (j && typeof j === 'object') return j; } catch (e) { /* no storage */ }
  return null;
}
function store() { try { localStorage.setItem(KEY, JSON.stringify(save)); } catch (e) { /* no storage */ } }

let _defsK = -1, _defs = null;
function makeSet(k) {
  if (k === _defsK && _defs) return _defs;
  _defsK = k; return (_defs = buildSet(k));
}
function buildSet(k) {
  const third = [
    { id: 'jump', text: `Jump ${15 + 10 * k} times`, goal: 15 + 10 * k, cum: true },
    { id: 'roll', text: `Slide ${10 + 8 * k} times`, goal: 10 + 8 * k, cum: true },
    { id: 'powerup', text: `Grab ${2 + k} power-ups`, goal: 2 + k, cum: true },
    { id: 'clean', text: `Run ${200 + 100 * k} m without a stumble`, goal: 200 + 100 * k, cum: false },
  ][k % 4];
  const second = k % 2 === 0
    ? { id: 'dist', text: `Run ${300 + 150 * k} m in one run`, goal: 300 + 150 * k, cum: false }
    : { id: 'score', text: `Score ${1000 * (k + 1)} in one run`, goal: 1000 * (k + 1), cum: false };
  return [{ id: 'coin', text: `Collect ${40 + 30 * k} coins`, goal: 40 + 30 * k, cum: true }, second, third];
}
function freshSave() { return { set: 0, have: [0, 0, 0], done: [false, false, false], best: 0 }; }

function missionsView() {
  const defs = makeSet(save.set);
  return defs.map((d, i) => ({ id: d.id, text: d.text, goal: d.goal, cum: d.cum, have: Math.min(d.goal, Math.floor(save.have[i] || 0)), done: !!save.done[i] }));
}
function publish() {
  S.missions = missionsView();
  S.baseMult = Math.min(30, 1 + (save.set | 0));
  S.best = save.best | 0;
}

function bump(id, n = 1, absolute = false) {
  const defs = makeSet(save.set);
  let changed = false;
  defs.forEach((d, i) => {
    if (d.id !== id || save.done[i]) return;
    const v = absolute ? Math.max(save.have[i] || 0, n) : (save.have[i] || 0) + n;
    if (v !== save.have[i]) { save.have[i] = v; changed = true; }
    if (v >= d.goal) { save.done[i] = true; ctx.events.emit('mission', { text: d.text }); }
  });
  if (!changed) return;
  if (save.done.every(Boolean)) {
    save.set = (save.set | 0) + 1; save.have = [0, 0, 0]; save.done = [false, false, false];
    ctx.events.emit('missionset', { mult: Math.min(30, 1 + save.set) });
    lastRunReset(true);
  }
  dirty = true; publish();
}
/** "In one run" missions start from zero each run (and when a new set arrives mid-run). */
function lastRunReset(keepRun) {
  const defs = makeSet(save.set);
  defs.forEach((d, i) => { if (!d.cum && !save.done[i]) save.have[i] = 0; });
  if (!keepRun) cleanFrom = 0;
}

export async function init(c) {
  ctx = c; S = c.state;
  save = { ...freshSave(), ...(load() || {}) };
  if (!Array.isArray(save.have) || save.have.length !== 3) save.have = [0, 0, 0];
  if (!Array.isArray(save.done) || save.done.length !== 3) save.done = [false, false, false];
  S.score = 0; S.mult = 1; S.newBest = false;
  publish();
  const ev = c.events;
  ev.on('start', () => { S.score = 0; S.newBest = false; lastDist = 0; cleanFrom = 0; lastRunReset(false); publish(); });
  ev.on('coin', () => { S.score += 10 * (S.mult || 1); bump('coin', 1); });
  ev.on('jump', () => bump('jump', 1));
  ev.on('roll', () => bump('roll', 1));
  ev.on('powerup', () => bump('powerup', 1));
  ev.on('stumble', () => { cleanFrom = S.distance || 0; });
  ev.on('hit', () => { cleanFrom = S.distance || 0; });
  ev.on('death', () => {
    const sc = Math.floor(S.score || 0);
    if (sc > (save.best | 0)) { save.best = sc; S.newBest = true; }
    publish(); store(); dirty = false;
  });
}

export function update(dt) {
  if (!ctx) return;
  S.mult = (S.baseMult || 1) * ((S.x2T || 0) > 0 ? 2 : 1);
  if (S.running && !S.over) {
    const d = S.distance || 0;
    if (d > lastDist) S.score += (d - lastDist) * S.mult;
    lastDist = d;
    bump('dist', d, true);
    bump('score', S.score, true);
    bump('clean', d - cleanFrom, true);
  }
  saveT += dt;
  if (dirty && saveT > 2) { saveT = 0; dirty = false; store(); }
}

export function summary() { return { best: save.best | 0, newBest: !!S.newBest, mult: S.baseMult || 1, set: save.set | 0, missions: missionsView() }; }
export function resetSave() { save = freshSave(); store(); publish(); }
