#!/usr/bin/env node
/**
 * clashcheck — run the game headless, drive it, and log every PHYSICAL clash per frame.
 *
 *   node tools/clashcheck.mjs game [--seed=7] [--metres=800] [--out=work/clash] [--hz=25]
 *
 * A filmstrip shows what a frame looks like; this shows whether the things in it are interacting the
 * way they claim to. Every ~40 ms it reads, from inside the page: the runner's AABB and state, each
 * dog's position, every live obstacle box within 30 m, every live coin within 30 m, and the ground
 * height under each of them. Then it tests, and records with the distance stamp:
 *
 *   PASS_THROUGH   runner AABB overlaps an obstacle box, the runner is not jumping over / rolling
 *                  under it in a way that should clear it, and no 'hit' was registered
 *   JUMP_INTO_ROLL runner airborne and overlapping a ROLL-kind item (a hanging banner spans 1.3–3.2 m:
 *                  jumping into it should hit)
 *   ROLL_INTO_JUMP runner rolling and overlapping a JUMP-kind item (a crate is solid to the ground)
 *   DOG_IN_OBSTACLE  a dog's centre is inside an obstacle box (dogs run through crates and vans)
 *   DOG_ON_RUNNER    a dog within 0.45 m (xz) of the runner while the runner is alive and un-hit
 *   DOG_ON_DOG       two dogs within 0.35 m of each other
 *   COIN_IN_OBSTACLE a coin inside an obstacle box (uncollectable, or collected through a wall)
 *   RUNNER_SUNK / RUNNER_FLOAT   feet below ground / above ground while not airborne
 *   DOG_SUNK / DOG_FLOAT
 *   NO_FREE_LANE   a live row with every lane blocked
 *   LANE_X_DRIFT   runner x further than 0.25 m from any lane centre while not mid-lane-change
 *
 * The driver is the gate's in miniature: it reads state.next and presses REAL keys (input.js takes
 * keys on every tier). It is not the gate — the gate proves the game; this audits its physics.
 */
import { createRequire } from 'module';
import http from 'http'; import fs from 'fs'; import path from 'path';
const require = createRequire('/Users/dev/Documents/Cursor.Code/midnight-dash/tools/');
const puppeteer = require('puppeteer');

const argv = process.argv.slice(2);
const arg = (k, d) => { const a = argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.split('=').slice(1).join('=') : d; };
const ROOT = path.resolve(argv.find((x) => !x.startsWith('--')) || 'game');
const NOSTEER = argv.includes('--nosteer');   // drive straight into things: exercises hit / stumble / pack closes / caught / death
const SEED = arg('seed', '7'), METRES = Number(arg('metres', 800)), OUT = path.resolve(arg('out', 'work/clash')), HZ = Number(arg('hz', 25));
fs.mkdirSync(OUT, { recursive: true });

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png' };
const srv = http.createServer((rq, rs) => {
  const u = decodeURIComponent(rq.url.split('?')[0]); const f = path.join(ROOT, u === '/' ? 'index.html' : u);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { rs.writeHead(404); return rs.end('404'); }
  rs.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); rs.end(fs.readFileSync(f));
});
await new Promise((r) => srv.listen(0, r));
const url = `http://127.0.0.1:${srv.address().port}/?seed=${SEED}&gate=1&nohud=1&mute=1`;

const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--use-gl=angle'] });
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
const errors = []; page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)); });
await page.goto(url, { waitUntil: 'load' });
await page.waitForFunction('window.__READY__ === true', { timeout: 90000 });
await page.click('#startb');

// -------------------------------------------------------------- the probe, run inside the page
const probe = () => {
  const c = window.__ctx; if (!c) return null;
  const st = c.state, M = c.modules;
  const rows = M.obstacles.rows ? M.obstacles.rows() : [];
  const box = (b) => ({ x0: b.min.x, y0: b.min.y, z0: b.min.z, x1: b.max.x, y1: b.max.y, z1: b.max.z });
  const near = (z) => Math.abs(z - st.z) < 30;
  const items = [];
  for (const r of rows) for (const it of r.items) { const b = it.box; if (b && near((b.min.z + b.max.z) / 2)) items.push({ kind: it.kind, type: it.type, lane: it.lane, row: r.id, ...box(b) }); }
  const coins = (M.coins.liveCoins ? M.coins.liveCoins() : []).filter((k) => near(k.z)).map((k) => ({ x: k.x, y: k.y, z: k.z, lane: k.lane }));
  // only dogs the player can SEE: pack.js hides them once they drop 6 m behind, and a hidden dog's path is not a glitch
  const dogs = (M.pack.getDogs ? M.pack.getDogs() : []).filter((d) => d.obj.visible !== false).map((d) => ({ name: d.name, x: d.obj.position.x, y: d.obj.position.y, z: d.obj.position.z }));
  const a = M.player.getAABB ? M.player.getAABB() : null;
  const gy = (z) => (M.track.groundY ? M.track.groundY(z) : 0);
  const freeLanes = rows.filter((r) => near(r.z)).map((r) => ({ id: r.id, z: r.z, free: (r.lanes || []).filter((l) => !l).length }));
  return {
    t: performance.now(), dist: st.distance, x: st.x, y: st.y, z: st.z, lane: st.lane, laneX: st.laneX, airborne: !!st.airborne, rolling: !!st.rolling,
    speed: st.speed, over: !!st.over, running: !!st.running, hits: st.hits || 0, hitT: st.hitT || 0, stumbleT: st.stumbleT || 0, playerState: st.playerState || '', deaths: st.deaths || 0,
    coinsN: st.coins, packDist: st.packDist, next: st.next ? { dist: st.next.dist, kind: st.next.kind, lanes: st.next.lanes, len: st.next.len, id: st.next.id } : null,
    aabb: a ? box(a) : null, gyPlayer: gy(st.z), dogs: dogs.map((d) => ({ ...d, gy: gy(d.z) })), items, coins, freeLanes,
  };
};

const overlap = (A, B, pad = 0) => A.x0 < B.x1 - pad && A.x1 > B.x0 + pad && A.y0 < B.y1 - pad && A.y1 > B.y0 + pad && A.z0 < B.z1 - pad && A.z1 > B.z0 + pad;
const inside = (p, B, pad = 0) => p.x > B.x0 + pad && p.x < B.x1 - pad && p.z > B.z0 + pad && p.z < B.z1 - pad && p.y + 0.3 > B.y0 && p.y < B.y1;

const LANE_X = [-2, 0, 2];
const viol = {}; const add = (k, s, detail) => { (viol[k] ||= []).push({ dist: +s.dist.toFixed(1), z: +s.z.toFixed(1), ...detail }); };
const samples = []; const seenRowFree = new Set();
let overAt = 0, held = null, lastAct = -1e9, prevHits = 0, laneChangeUntil = 0, prevLane = 0;
// event screenshots: the moments around a hit and around the death, so a critic can judge the
// stumble, the pack closing, the fall and the dogs running up — none of which a single frame shows
const shots = []; let shotN = 0, lastEvHits = 0, shotOver = false;
const schedule = (tag) => { for (const ms of [0, 120, 260, 450, 700, 1100, 1800, 2800]) shots.push({ due: Date.now() + ms, tag, ms }); };
const takeDue = async (s) => {
  while (shots.length && Date.now() >= shots[0].due) {
    const sh = shots.shift(); const f = path.join(OUT, `ev_${String(shotN++).padStart(2, '0')}_${sh.tag}_${sh.ms}ms_d${s.dist.toFixed(0)}.png`);
    try { await page.screenshot({ path: f, type: 'png', optimizeForSpeed: true }); } catch {}
  }
};
const key = async (k) => { await page.keyboard.down(k); await new Promise((r) => setTimeout(r, 40)); await page.keyboard.up(k); };
const t0 = Date.now();

while (true) {
  const s = await page.evaluate(probe);
  if (!s) break;
  samples.push(s);
  if (s.over && !overAt) overAt = Date.now();
  if ((s.over && Date.now() - overAt > 3500) || s.dist >= METRES || Date.now() - t0 > 120000) break;   // keep sampling 3.5 s past death for the animation and the pack

  // ---- drive (the gate's logic in miniature; decisions at distances)
  const n = s.next;
  if (!NOSTEER && n && s.running && s.dist - lastAct > 2) {
    const mine = n.lanes ? n.lanes[s.lane + 1] : null;
    const lead = { block: 9, jump: 0.36 * s.speed + 1.2, roll: 0.30 * s.speed + 1.0 }[mine] ?? 0;
    if (mine && n.dist <= lead) {
      if (mine === 'block') { const free = [-1, 0, 1].filter((l) => !n.lanes[l + 1]); const tgt = free.sort((a, b) => Math.abs(a - s.lane) - Math.abs(b - s.lane))[0]; if (tgt !== undefined) await key(tgt < s.lane ? 'ArrowLeft' : 'ArrowRight'); }
      else if (mine === 'jump') await key('ArrowUp');
      else if (mine === 'roll') await key('ArrowDown');
      lastAct = s.dist;
    }
  }
  if (s.lane !== prevLane) { laneChangeUntil = s.t + 260; prevLane = s.lane; }
  if (s.hits !== lastEvHits) { lastEvHits = s.hits; schedule(`hit${s.hits}`); }
  if (s.over && !shotOver) { shotOver = true; schedule('death'); }
  await takeDue(s);

  // ---- checks
  const invuln = s.hitT > 0 || s.stumbleT > 0 || s.hits !== prevHits; prevHits = s.hits;
  if (s.aabb && s.running && !s.over) {
    for (const it of s.items) {
      if (!overlap(s.aabb, it, 0.04)) continue;
      if (it.kind === 'jump' && s.airborne && s.aabb.y0 > it.y1 - 0.08) continue;          // cleared it
      if (it.kind === 'roll' && s.rolling && s.aabb.y1 < it.y0 + 0.08) continue;           // under it
      if (invuln) continue;                                                                 // the game registered the hit
      const tag = it.kind === 'roll' && s.airborne ? 'JUMP_INTO_ROLL' : it.kind === 'jump' && s.rolling ? 'ROLL_INTO_JUMP' : 'PASS_THROUGH';
      add(tag, s, { type: it.type, kind: it.kind, lane: it.lane, airborne: s.airborne, rolling: s.rolling, dy: +(s.aabb.y0 - it.y1).toFixed(2) });
    }
    if (!s.airborne && s.y < s.gyPlayer - 0.03) add('RUNNER_SUNK', s, { y: +s.y.toFixed(2), gy: +s.gyPlayer.toFixed(2) });
    if (!s.airborne && s.y > s.gyPlayer + 0.06) add('RUNNER_FLOAT', s, { y: +s.y.toFixed(2), gy: +s.gyPlayer.toFixed(2) });
    if (s.t > laneChangeUntil && Math.min(...LANE_X.map((lx) => Math.abs(s.x - lx))) > 0.25) add('LANE_X_DRIFT', s, { x: +s.x.toFixed(2), lane: s.lane });
  }
  for (const d of s.dogs) {
    for (const it of s.items) if (inside(d, it, 0.05)) add('DOG_IN_OBSTACLE', s, { dog: d.name, type: it.type, kind: it.kind });
    if (s.running && !s.over && !invuln && Math.hypot(d.x - s.x, d.z - s.z) < 0.45) add('DOG_ON_RUNNER', s, { dog: d.name, d: +Math.hypot(d.x - s.x, d.z - s.z).toFixed(2) });
    if (d.y < d.gy - 0.04) add('DOG_SUNK', s, { dog: d.name, y: +d.y.toFixed(2), gy: +d.gy.toFixed(2) });
    if (d.y > d.gy + 0.12) add('DOG_FLOAT', s, { dog: d.name, y: +d.y.toFixed(2), gy: +d.gy.toFixed(2) });
  }
  for (let i = 0; i < s.dogs.length; i++) for (let j = i + 1; j < s.dogs.length; j++) {
    const a = s.dogs[i], b = s.dogs[j]; const dd = Math.hypot(a.x - b.x, a.z - b.z);
    if (dd < 0.35) add('DOG_ON_DOG', s, { a: a.name, b: b.name, d: +dd.toFixed(2) });
  }
  for (const k of s.coins) for (const it of s.items) if (inside(k, it, 0)) add('COIN_IN_OBSTACLE', s, { coinZ: +k.z.toFixed(1), lane: k.lane, type: it.type, kind: it.kind });
  for (const r of s.freeLanes) if (r.free === 0 && !seenRowFree.has(r.id)) { seenRowFree.add(r.id); add('NO_FREE_LANE', s, { row: r.id, rowZ: +r.z.toFixed(1) }); }

  await new Promise((r) => setTimeout(r, 1000 / HZ));
}

// -------------------------------------------------------------- report
const last = samples[samples.length - 1] || {};
const dedupe = (list) => { const out = [], seen = new Set(); for (const v of list) { const k = JSON.stringify({ ...v, dist: Math.round(v.dist / 2) }); if (!seen.has(k)) { seen.add(k); out.push(v); } } return out; };
const lines = [];
lines.push(`clashcheck  seed ${SEED}  ${samples.length} samples over ${last.dist?.toFixed(0) ?? '?'} m  ${(Date.now() - t0) / 1000 | 0} s  over=${!!last.over}  coins=${last.coinsN}  hits=${last.hits}`);
lines.push(`console/page errors: ${errors.length}` + (errors.length ? '\n  ' + errors.slice(0, 5).join('\n  ') : ''));
const order = ['PASS_THROUGH', 'JUMP_INTO_ROLL', 'ROLL_INTO_JUMP', 'DOG_IN_OBSTACLE', 'DOG_ON_RUNNER', 'DOG_ON_DOG', 'COIN_IN_OBSTACLE', 'RUNNER_SUNK', 'RUNNER_FLOAT', 'DOG_SUNK', 'DOG_FLOAT', 'NO_FREE_LANE', 'LANE_X_DRIFT'];
let total = 0;
for (const k of order) {
  const raw = viol[k] || []; const d = dedupe(raw); total += d.length;
  lines.push(`\n${k.padEnd(18)} ${String(d.length).padStart(4)} distinct  (${raw.length} samples)`);
  for (const v of d.slice(0, 8)) lines.push('    ' + JSON.stringify(v));
  if (d.length > 8) lines.push(`    … ${d.length - 8} more`);
}
lines.push(`\nTOTAL distinct clashes: ${total}`);
// per-sample summary for anyone who wants to plot it
fs.writeFileSync(path.join(OUT, 'samples.json'), JSON.stringify(samples.map((s) => ({ dist: s.dist, z: s.z, x: s.x, y: s.y, lane: s.lane, air: s.airborne, roll: s.rolling, speed: s.speed, hits: s.hits, packDist: s.packDist, coins: s.coinsN, dogs: s.dogs.map((d) => [d.name, +d.x.toFixed(2), +d.y.toFixed(2), +d.z.toFixed(2)]) }))));
fs.writeFileSync(path.join(OUT, 'clashes.json'), JSON.stringify(viol, null, 1));
fs.writeFileSync(path.join(OUT, 'report.txt'), lines.join('\n'));
console.log(lines.join('\n'));
console.log(`\nwrote ${OUT}/report.txt, clashes.json, samples.json`);
await browser.close(); srv.close();
