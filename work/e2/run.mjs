// E2 fixture driver: serves midnight-dash/, opens work/e2/ at 390x844 headless, drives 200 m with a lane
// change, a jump over the crate at 80 m, a roll under the bar at 140 m, and a dodge round the van at 175 m.
// Writes work/e2/out/filmstrip.png and report.json. Short and cheap: fixed 1/60 s steps, 4 sim steps per render.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { createRequire } from 'node:module';
const ROOT = path.resolve(new URL('../..', import.meta.url).pathname);
const OUT = path.join(ROOT, 'work/e2/out'); fs.mkdirSync(OUT, { recursive: true });
const req = createRequire(path.join(ROOT, 'tools/node_modules/'));
const puppeteer = (await import(req.resolve('puppeteer'))).default;

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.webp': 'image/webp' };
const server = http.createServer((rq, rs) => {
  const p = path.join(ROOT, decodeURIComponent(new URL(rq.url, 'http://x').pathname));
  let f = p; if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
  if (!fs.existsSync(f)) { rs.writeHead(404); rs.end(); return; }
  rs.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' }); if (rq.method === 'HEAD') { rs.end(); return; } fs.createReadStream(f).pipe(rs);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const REAL = process.argv.includes('--stub') ? 0 : 1;
const url = `http://127.0.0.1:${server.address().port}/work/e2/?fixed=1&sub=4&dpr=1&real=${REAL}`;
const browser = await puppeteer.launch({ headless: true, args: ['--enable-unsafe-swiftshader', '--no-sandbox', `--window-size=390,844`] });
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
const errors = [];
page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push('pageerror ' + e.message));
page.on('requestfailed', (r) => errors.push('reqfail ' + r.url()));
await page.goto(url, { waitUntil: 'load' });
await page.waitForFunction('window.__READY__ === true', { timeout: 60000 });
const g = () => page.evaluate('window.__E2__');
const push = (k) => page.evaluate((k) => window.__push(k), k);
const cap = (l) => page.evaluate((l) => window.__capture(l), l);
const until = async (fn, ms = 60000) => { const t0 = Date.now(); for (;;) { const s = await g(); if (fn(s)) return s; if (Date.now() - t0 > ms) throw new Error('timeout ' + fn); await new Promise((r) => setTimeout(r, 25)); } };

const t0 = Date.now();
const idle = await g();
await page.evaluate('window.__start()');
const dec = [];
await until((s) => s.distance > 30); await push('left'); dec.push('left@30');
await until((s) => s.distance > 40); await cap('run 40 m');
await until((s) => s.distance > 55); await push('right'); dec.push('right@55');
let s = await until((s) => s.distance >= 80 - (0.35 * s.speed + 1.5)); await push('up'); dec.push('up@' + s.distance.toFixed(1));
await until((s) => s.airborne); s = await until((s) => s.y > 0.9); await cap(`jump ${s.distance.toFixed(0)} m`);
s = await until((s) => s.distance >= 140 - Math.max(0.02 * s.speed, (0.5 * s.speed - 0.6) / 2 + 0.025 * s.speed)); await push('down'); dec.push('down@' + s.distance.toFixed(1));
s = await until((s) => s.rolling); { const d0 = s.distance; s = await until((s) => s.distance > d0 + 0.8); } await cap(`roll ${s.distance.toFixed(0)} m`);
s = await until((s) => s.distance >= 175 - (0.55 * s.speed + 2)); await push('right'); dec.push('right@' + s.distance.toFixed(1));
s = await until((s) => s.distance > 190); await cap(`run ${s.distance.toFixed(0)} m`);
s = await until((s) => s.distance > 200);
const at200 = s;
// then run head-on into two blocks in lane +1 (230 m, 248 m): first = hit (pack closes 2 m), second within 5 s = death
s = await until((s) => s.hits >= 1 || s.distance > 240); const afterHit = s;
s = await until((s) => s.over || s.distance > 262); const final = s;
const report = await page.evaluate('window.__report()');
const strip = await page.evaluate('window.__strip()');
fs.writeFileSync(path.join(OUT, REAL ? 'filmstrip.png' : 'filmstrip-stub.png'), Buffer.from(strip.split(',')[1], 'base64'));
const out = { wall_s: +((Date.now() - t0) / 1000).toFixed(1), idle, at200, afterHit, final, decisions: dec, ...report, errors };
fs.writeFileSync(path.join(OUT, REAL ? 'report.json' : 'report-stub.json'), JSON.stringify(out, null, 2));
console.log(JSON.stringify({ used: report.used, wall_s: out.wall_s, at200, afterHit, final, draws: report.draws, decisions: dec, events: report.events, errors }, null, 1));
console.log('joint rotation ranges (rad):', JSON.stringify(report.joints));
console.log('pivot check:', JSON.stringify(report.pivots));
await browser.close(); server.close(); process.exit(0);
