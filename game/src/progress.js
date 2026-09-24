/**
 * progress.js — score, the score MULTIPLIER, MISSIONS, the saved best, and (UI v2) everything else that
 * persists: the ALPHA BANK (the pickups are called Alpha in the UI, 'coin' events in code), the chosen character,
 * power-up LEVELS (five, incl. 'surge'), three DAILY tasks, twelve ACHIEVEMENTS and the REVEALED locations (UI pass 2).
 * One save object, key 'ar.save.v1' (the old 'md.save.v1' is not migrated).
 *
 *   init(ctx)     loads the save, builds the current mission set, listens to the run
 *   update(dt)    accrues score from distance, advances missions / daily tasks / achievements, writes
 *                 state.score / state.mult / state.missions / state.powerLevel / state.character
 *   summary()     { best, newBest, mult, set, missions:[{text, have, goal, done}], bank, character, powerLevel }
 *   bank()        Alpha in the bank (earned across runs; every run's Alpha is added on death or quit)
 *   revealed() / revealName(id) / reveal(id, label)   locations the game has revealed ('reveal' event {id, label}), persisted
 *   nextMissions()  the three mission texts of the NEXT set (home.js preview strip); dailyPreview() = tomorrow's tasks
 *   character() / setCharacter(id)          persisted selection (home.js writes, main.js reads before 'start')
 *   powerLevels() / powerCost(t) / upgradePower(t)   levels 1-5; level n -> n+1 costs 200*n bank Alpha (keys: magnet omamori x2 sneakers surge)
 *   daily()       [{id, text, have, goal, done, pay}] three tasks seeded by the date, reset daily, pay into the bank
 *   achievements()[{id, name, desc, tag, unlocked}]
 *
 * WHY (owner, 2026-09-21: "Subway Surfers is the base ... as engaging as possible until the runner fails").
 * In Subway Surfers the run itself never changes its rules; what pulls a player into the NEXT run is
 * that every run pays into something permanent. Its loop is: three missions at a time -> finish the
 * set -> the score multiplier goes up by one, for good (cap x30) -> the same run is now worth more.
 *   score   += metres run x mult (+ 10 x mult per coin); the x2 power-up doubles mult while it lasts
 *   mult     = 1 + mission sets completed (cap 30), saved
 *   missions = three per set, generated from the set number so they scale for ever; cumulative ones
 *              (coins, jumps, rolls, pickups) carry across runs, "in one run" ones reset each run
 *
 * Emits: 'mission' {text}, 'missionset' {mult}, 'daily' {text, pay}, 'achievement' {id, name, pay}, 'bank' {bank, delta}.
 * Listens: 'start' 'coin' 'jump' 'roll' 'powerup' 'stumble' 'hit' 'zone' 'reveal' 'death' 'quit'.
 * An achievement pays ACH_PAY Alpha into the bank when it unlocks (UI pass 2: the reward chips are real).
 * Storage failures (private mode, blocked) are swallowed: the game plays the same, it just forgets.
 */
const KEY = 'ar.save.v1';
let ctx = null, S = null, save = null, lastDist = 0, cleanFrom = 0, dirty = false, saveT = 0;
let base = { dist: 0, score: 0 };   // where the current set's one-run missions started counting

function load() {
  try { const j = JSON.parse(localStorage.getItem(KEY) || 'null'); if (j && typeof j === 'object') return j; } catch (e) { /* no storage */ }
  return null;
}
function store() { try { localStorage.setItem(KEY, JSON.stringify(save)); } catch (e) { /* no storage */ } }
function hash32(str) { let h = 2166136261 >>> 0; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h; }

// ---------------------------------------------------------------- missions (three per set)
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
  return [{ id: 'coin', text: `Collect ${40 + 30 * k} Alpha`, goal: 40 + 30 * k, cum: true }, second, third];
}

// ---------------------------------------------------------------- daily tasks (three, seeded by the date)
const DAILY_POOL = [
  { id: 'coin', text: 'Collect {n} Alpha today', goals: [120, 150, 200], pay: 100 },
  { id: 'roll', text: 'Slide {n} times', goals: [15, 20, 25], pay: 75 },
  { id: 'powerup', text: 'Grab {n} power-ups', goals: [3, 4, 5], pay: 100 },
  { id: 'jump', text: 'Jump {n} times', goals: [20, 30, 40], pay: 75 },
  { id: 'dist', text: 'Run {n} m in total today', goals: [800, 1200, 1500], pay: 150 },
  { id: 'runs', text: 'Finish {n} runs', goals: [3, 4, 5], pay: 50 },
  { id: 'score', text: 'Score {n} in one run', goals: [1500, 2500, 4000], pay: 150 },
];
function today() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
let _dailyK = '', _daily = null;
function dailyDefs(date) {
  if (date === _dailyK && _daily) return _daily;
  _dailyK = date; return (_daily = genDaily(date));
}
function genDaily(date) {
  let h = hash32('daily/' + date);
  const next = () => { h = (Math.imul(h ^ (h >>> 15), 2246822507) ^ Math.imul(h ^ (h >>> 13), 3266489909)) >>> 0; return h; };
  const pool = DAILY_POOL.slice(), out = [];
  while (out.length < 3) {
    const d = pool.splice(next() % pool.length, 1)[0];
    const goal = d.goals[next() % d.goals.length];
    out.push({ id: d.id, text: d.text.replace('{n}', goal.toLocaleString('en-US')), goal, pay: d.pay });
  }
  return out;
}
function ensureDaily() {
  const t = today();
  if (!save.daily || save.daily.date !== t) { save.daily = { date: t, have: [0, 0, 0], done: [false, false, false] }; dirty = true; }
}
function bumpDaily(id, n = 1, absolute = false) {
  ensureDaily();
  const defs = dailyDefs(save.daily.date);
  defs.forEach((d, i) => {
    if (d.id !== id || save.daily.done[i]) return;
    const v = absolute ? Math.max(save.daily.have[i] || 0, n) : (save.daily.have[i] || 0) + n;
    if (v === save.daily.have[i]) return;
    save.daily.have[i] = v; dirty = true;
    if (v >= d.goal) { save.daily.done[i] = true; addBank(d.pay); ctx.events.emit('daily', { text: d.text, pay: d.pay }); }
  });
}

// ---------------------------------------------------------------- achievements (twelve)
export const ACHIEVEMENTS = [
  { id: 'first', name: 'First Run', desc: 'Start a run', tag: 'GO' },
  { id: 'm500', name: '500 m', desc: 'Run 500 m in one run', tag: '500' },
  { id: 'km1', name: 'One K', desc: 'Run 1 km in one run', tag: '1K' },
  { id: 'km2', name: 'Two K', desc: 'Run 2 km in one run', tag: '2K' },
  { id: 'c100', name: 'Alpha Haul', desc: '100 Alpha in one run', tag: '100' },
  { id: 'c1000', name: 'Banker', desc: '1,000 Alpha in total', tag: '1K τ' },
  { id: 'p10', name: 'Charged', desc: 'Grab 10 power-ups', tag: '10' },
  { id: 'stumble', name: 'Shake It Off', desc: 'Survive a stumble', tag: '!' },
  { id: 'x5', name: 'Multiplied', desc: 'Reach a x5 multiplier', tag: 'x5' },
  { id: 'trio', name: 'Full Roster', desc: 'Run as all three characters', tag: '3' },
  { id: 'runs5', name: 'Regular', desc: 'Finish 5 runs', tag: 'V' },
  { id: 'daybreak', name: 'Night-Day-Night', desc: 'Run through the morning market', tag: '☀' },
];
export const ACH_PAY = 100;
function unlock(id) {
  if (save.ach[id]) return;
  save.ach[id] = Date.now(); dirty = true;
  const a = ACHIEVEMENTS.find((x) => x.id === id);
  addBank(ACH_PAY);
  ctx.events.emit('achievement', { id, name: a ? a.name : id, pay: ACH_PAY });
}

// ---------------------------------------------------------------- power-up levels
const POWER_KEYS = ['magnet', 'omamori', 'x2', 'sneakers', 'surge'];   // 'surge' = Alpha Surge (UI pass 2)
export const POWER_MAX = 5;
export function powerCost(type) { const n = save.power[type] | 0; return n >= POWER_MAX ? 0 : 200 * n; }
export function powerLevels() { return { ...save.power }; }
export function upgradePower(type) {
  if (!POWER_KEYS.includes(type)) return false;
  const n = save.power[type] | 0, cost = 200 * n;
  if (n >= POWER_MAX || save.bank < cost) return false;
  save.bank -= cost; save.power[type] = n + 1; dirty = true; store();
  ctx.events.emit('bank', { bank: save.bank, delta: -cost });
  publish(); return true;
}

// ---------------------------------------------------------------- bank / character
function addBank(n) { n |= 0; if (!n) return; save.bank = Math.max(0, (save.bank | 0) + n); dirty = true; ctx.events.emit('bank', { bank: save.bank, delta: n }); }
export function bank() { return save ? save.bank | 0 : 0; }
export function character() { return save ? save.character : 'ronin'; }
export function setCharacter(id) { if (!save || !id || save.character === id) return; save.character = id; S.character = id; dirty = true; store(); }

function freshSave() {
  return { v: 1, set: 0, have: [0, 0, 0], done: [false, false, false], best: 0, bank: 0, character: 'ronin',
    power: { magnet: 1, omamori: 1, x2: 1, sneakers: 1, surge: 1 }, daily: null, ach: {}, runs: 0, coinsTotal: 0, powerTotal: 0, chars: {}, revealed: {} };
}

function missionsView() {
  const defs = makeSet(save.set);
  return defs.map((d, i) => ({ id: d.id, text: d.text, goal: d.goal, cum: d.cum, have: Math.min(d.goal, Math.floor(save.have[i] || 0)), done: !!save.done[i] }));
}
function publish() {
  S.missions = missionsView();
  S.baseMult = Math.min(30, 1 + (save.set | 0));
  S.best = save.best | 0;
  S.powerLevel = { ...save.power };
  S.bank = save.bank | 0;
  if (!S.character) S.character = save.character;
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
    // QA 2026-09-21: a new set's "score N in one run" used to complete the instant it appeared
    base = { dist: S.distance || 0, score: S.score || 0 }; cleanFrom = S.distance || 0;
  }
  dirty = true; publish();
}
/** "In one run" missions start from zero each run (and when a new set arrives mid-run). */
function lastRunReset(keepRun) {
  const defs = makeSet(save.set);
  defs.forEach((d, i) => { if (!d.cum && !save.done[i]) save.have[i] = 0; });
  if (!keepRun) cleanFrom = 0;
}

// ---------------------------------------------------------------- revealed locations (UI pass 2)
/** ids of the locations the game has revealed, in the order they were revealed. */
export function revealed() { return save ? Object.keys(save.revealed || {}) : []; }
export function revealName(id) { return save && save.revealed ? save.revealed[id] || '' : ''; }
export function reveal(id, label) {
  if (!save || !id) return false;
  if (!save.revealed) save.revealed = {};
  if (save.revealed[id]) return false;
  save.revealed[id] = String(label || id); dirty = true; store(); return true;
}
/** The next mission set's three texts, for the preview strip. */
export function nextMissions() { return buildSet((save ? save.set | 0 : 0) + 1).map((d) => ({ id: d.id, text: d.text, goal: d.goal })); }

/** A run ended (death or quit): its Alpha goes to the bank, best / runs / daily counters update. */
function endRun(finished) {
  const sc = Math.floor(S.score || 0), coins = S.coins | 0;
  if (sc > (save.best | 0)) { save.best = sc; S.newBest = true; }
  if (coins) addBank(coins);
  if (finished) { save.runs = (save.runs | 0) + 1; bumpDaily('runs', 1); if (save.runs >= 5) unlock('runs5'); }
  publish(); store(); dirty = false;
}

export async function init(c) {
  ctx = c; S = c.state;
  save = { ...freshSave(), ...(load() || {}) };
  if (!Array.isArray(save.have) || save.have.length !== 3) save.have = [0, 0, 0];
  if (!Array.isArray(save.done) || save.done.length !== 3) save.done = [false, false, false];
  save.power = { ...freshSave().power, ...(save.power && typeof save.power === 'object' ? save.power : {}) };
  for (const k of POWER_KEYS) save.power[k] = Math.max(1, Math.min(POWER_MAX, save.power[k] | 0));
  if (!save.ach || typeof save.ach !== 'object') save.ach = {};
  if (!save.chars || typeof save.chars !== 'object') save.chars = {};
  if (!save.revealed || typeof save.revealed !== 'object') save.revealed = {};
  ensureDaily();
  S.score = 0; S.mult = 1; S.newBest = false; S.character = save.character;
  publish();
  const ev = c.events;
  ev.on('start', () => {
    S.score = 0; S.newBest = false; lastDist = 0; cleanFrom = 0; base = { dist: 0, score: 0 }; lastRunReset(false); ensureDaily();
    unlock('first');
    if (S.character) { save.chars[S.character] = true; if (Object.keys(save.chars).length >= 3) unlock('trio'); }
    dirty = true; publish();
  });
  ev.on('coin', () => { S.score += 10 * (S.mult || 1); bump('coin', 1); bumpDaily('coin', 1); save.coinsTotal = (save.coinsTotal | 0) + 1; if (save.coinsTotal >= 1000) unlock('c1000'); });
  ev.on('jump', () => { bump('jump', 1); bumpDaily('jump', 1); });
  ev.on('roll', () => { bump('roll', 1); bumpDaily('roll', 1); });
  ev.on('powerup', () => { bump('powerup', 1); bumpDaily('powerup', 1); save.powerTotal = (save.powerTotal | 0) + 1; if (save.powerTotal >= 10) unlock('p10'); });
  ev.on('stumble', () => { cleanFrom = S.distance || 0; unlock('stumble'); });
  ev.on('hit', (p) => { cleanFrom = S.distance || 0; if (p && p.fatal === false) unlock('stumble'); });
  ev.on('zone', (p) => { if (p && p.prev === 'day') unlock('daybreak'); });
  ev.on('reveal', (p) => { if (p && p.id) reveal(p.id, p.label); });
  ev.on('death', () => endRun(true));
  ev.on('quit', () => endRun(false));
}

export function update(dt) {
  if (!ctx) return;
  S.mult = (S.baseMult || 1) * ((S.x2T || 0) > 0 ? 2 : 1);
  if (S.running && !S.over) {
    const d = S.distance || 0;
    if (d > lastDist) { S.score += (d - lastDist) * S.mult; bumpDaily('dist', d - lastDist); }
    lastDist = d;
    bump('dist', d - base.dist, true);
    bump('score', S.score - base.score, true);
    bump('clean', d - cleanFrom, true);
    bumpDaily('score', S.score, true);
    if (d >= 500) unlock('m500'); if (d >= 1000) unlock('km1'); if (d >= 2000) unlock('km2');
    if ((S.coins | 0) >= 100) unlock('c100');
    if (S.mult >= 5) unlock('x5');
  }
  saveT += dt;
  if (dirty && saveT > 2) { saveT = 0; dirty = false; store(); }
}

export function summary() {
  return { best: save.best | 0, newBest: !!S.newBest, mult: S.baseMult || 1, set: save.set | 0, missions: missionsView(),
    bank: save.bank | 0, character: save.character, powerLevel: { ...save.power }, runs: save.runs | 0, revealed: revealed() };
}
/** Tomorrow's three tasks (preview only; nothing is stored). */
export function dailyPreview() { const d = new Date(); d.setDate(d.getDate() + 1); return genDaily(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`).map((x) => ({ id: x.id, text: x.text, goal: x.goal, pay: x.pay })); }
export function daily() {
  ensureDaily();
  return dailyDefs(save.daily.date).map((d, i) => ({ ...d, have: Math.min(d.goal, Math.floor(save.daily.have[i] || 0)), done: !!save.daily.done[i] }));
}
export function achievements() { return ACHIEVEMENTS.map((a) => ({ ...a, unlocked: !!save.ach[a.id] })); }
export function resetSave() { save = freshSave(); ensureDaily(); store(); publish(); }
