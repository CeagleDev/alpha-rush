// E4 fixture shooter: serve the repo root, open work/e4/ at 390x844 headless, wait for READY plus a
// few frames, save shot.png, run lighting.groundCheck() and perf.report(), print JSON, exit.
// Usage: node work/e4/shoot.mjs [--desktop] [--query="fill=1.2&lights=8"] [--out=work/e4/shot.png]
import { createServer } from 'http';
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..');
const args = Object.fromEntries(process.argv.slice(2).map((a) => { const m = a.match(/^--([^=]+)(?:=(.*))?$/); return m ? [m[1], m[2] ?? '1'] : [a, '1']; }));
const DESKTOP = !!args.desktop;
const OUT = path.resolve(args.out || path.join(HERE, DESKTOP ? 'shot-desktop.png' : 'shot.png'));
const QUERY = args.query ? '?' + args.query : '';

const req = createRequire(path.join(ROOT, 'tools', 'node_modules', 'noop.js'));
const puppeteer = (await import(req.resolve('puppeteer'))).default;

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.css': 'text/css' };
const server = createServer((rq, rs) => {
  const u = new URL(rq.url, 'http://x');
  let file = path.join(ROOT, decodeURIComponent(u.pathname));
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (!fs.existsSync(file)) { rs.writeHead(404); rs.end(); return; }
  rs.writeHead(200, { 'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  if (rq.method === 'HEAD') { rs.end(); return; }
  fs.createReadStream(file).pipe(rs);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const BASE = `http://127.0.0.1:${server.address().port}`;

const browser = await puppeteer.launch({ headless: true, args: ['--enable-unsafe-swiftshader', '--no-sandbox', '--window-size=400,900'] });
const page = await browser.newPage();
await page.setViewport(DESKTOP ? { width: 1280, height: 720, deviceScaleFactor: 1 } : { width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
const logs = [];
page.on('console', (m) => logs.push(m.text()));
page.on('pageerror', (e) => logs.push('PAGEERROR ' + e.message));
page.on('response', (r) => { if (r.status() >= 400) logs.push(`HTTP ${r.status()} ${r.url()}`); });
const t0 = Date.now();
await page.goto(`${BASE}/work/e4/${QUERY}`, { waitUntil: 'load', timeout: 60000 });
try {
  await page.waitForFunction('window.__READY__ === true || window.__ERROR__', { timeout: 90000 });
} catch (e) { console.error('never READY'); }
const ready = Date.now() - t0;
await page.waitForFunction('(window.__FRAMES__ || 0) >= 24', { timeout: 60000 }).catch(() => {});
if (args.sweep) {
  const combos = [];
  for (const fill of [2.0, 3.2, 4.6]) for (const candela of [40, 75, 120]) for (const emissive of [1, 1.8]) combos.push({ fill, candela, emissive });
  const rows = await page.evaluate(async (cs) => {
    const out = [];
    for (const c of cs) { window.__lighting.tune(c); await new Promise((r) => requestAnimationFrame(r)); out.push({ ...c, ...window.__MEASURE__() }); }
    return out;
  }, combos);
  console.log('fill cd   emis | median  p98  >200%  darkRB  blueTop%  amber%');
  for (const r of rows) console.log(`${String(r.fill).padEnd(4)} ${String(r.candela).padEnd(4)} ${String(r.emissive).padEnd(4)} | ${String(r.median).padStart(6)} ${String(r.p98).padStart(5)} ${String(r.over200).padStart(6)} ${String(r.darkRB).padStart(7)} ${String(r.blueTop).padStart(9)} ${String(r.amberBot).padStart(7)}`);
}
if (args.lod) {
  for (const fogDensity of (args.fogs || '0.008,0.014,0.022').split(',').map(Number)) {
    const L = await page.evaluate((f) => window.__LODMEASURE__({ fogDensity: f }), fogDensity);
    const c = L.claims;
    console.log(`\n== fog ${fogDensity}  full frame ${L.base.draws} draws ${L.base.tris} tris  | median ${c.median} p98 ${c.p98} >200 ${c.over200}% darkRB ${c.darkRB} blueTop ${c.blueTop}% amber ${c.amberBot}%`);
    console.log('  mode    D(m) | meanDiff maxDiff  draws     tris');
    for (const r of L.rows) if (r.mode === 'cull') console.log(`  ${r.mode.padEnd(7)} ${String(r.D).padEnd(4)} | ${String(r.mean).padStart(8)} ${String(r.max).padStart(7)} ${String(r.draws).padStart(6)} ${String(r.tris).padStart(8)}`);
  }
}
const result = await page.evaluate(() => ({
  error: window.__ERROR__ || null,
  perf: window.__perf ? window.__perf.report() : null,
  lighting: window.__lighting ? window.__lighting.report() : null,
  sources: window.__lighting ? window.__lighting.sources().length : 0,
  ground: window.__lighting ? window.__lighting.groundCheck() : null,
  textures: window.__textures ? window.__textures.status() : null,
  measure: window.__MEASURE__ ? window.__MEASURE__() : null,
  dump: (window.__DUMP__ = new URLSearchParams(location.search).get('dump')) ? window.__lighting.sources().map((l) => [l.x.toFixed(1), l.y.toFixed(2), l.z.toFixed(1), l.color.toString(16), l.intensity, l.range]) : null,
}));
await page.screenshot({ path: OUT });
console.log(JSON.stringify({ readyMs: ready, out: OUT, ...result }, null, 1));
console.log('--- console ---');
for (const l of logs.slice(0, 40)) console.log(l);
await browser.close();
server.close();
