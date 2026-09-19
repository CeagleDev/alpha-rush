// E1 fixture runner: serves midnight-dash/, loads work/e1/index.html at 390x844, advances 600 m, prints draws/tris, one screenshot.
import { createServer } from 'http';
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../..');
const req = createRequire(path.join(ROOT, 'tools', 'node_modules', 'noop.js'));
const puppeteer = (await import(req.resolve('puppeteer'))).default;
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg' };
const server = createServer((rq, rs) => {
  const p = path.join(ROOT, decodeURIComponent(new URL(rq.url, 'http://x').pathname));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { rs.writeHead(404); rs.end(); return; }
  rs.writeHead(200, { 'content-type': MIME[path.extname(p)] || 'application/octet-stream' });
  if (rq.method === 'HEAD') { rs.end(); return; }
  fs.createReadStream(p).pipe(rs);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const port = server.address().port;
const step = process.argv[2] || '2.5', seed = process.argv[3] || '7';
const url = `http://127.0.0.1:${port}/work/e1/index.html?seed=${seed}&step=${step}`;
const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--mute-audio'] });
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
const errors = [];
page.on('console', (m) => { const t = m.text(); if (m.type() === 'error' || m.type() === 'warning' || t.startsWith('[fixture]')) console.log(`[page:${m.type()}] ${t}`); if (m.type() === 'error') errors.push(t); });
page.on('pageerror', (e) => { console.log('[pageerror]', e.message); errors.push(e.message); });
page.on('requestfailed', (r) => console.log('[requestfailed]', r.url()));
const t0 = Date.now();
await page.goto(url, { waitUntil: 'domcontentloaded' });
await page.waitForFunction('window.__READY__ === true', { timeout: 120000 });
console.log(`READY in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
let g = null, shot60 = false, shot300 = false;
const tStart = Date.now();
while (Date.now() - tStart < 240000) {
  g = await page.evaluate('window.__GAME__');
  if (g && g.distance >= 55 && !shot60) { await page.screenshot({ path: path.join(HERE, 'shot-060m.png') }); shot60 = true; }
  if (g && g.distance >= 300 && !shot300) { await page.screenshot({ path: path.join(HERE, 'shot-300m.png') }); shot300 = true; }
  if (g && g.distance >= 600) break;
  await new Promise((r) => setTimeout(r, 200));
}
await page.screenshot({ path: path.join(HERE, 'shot-600m.png') });
const e = g.e1;
console.log(JSON.stringify({ distance: Math.round(g.distance), zone: g.zone, peak: e.peak, byZone: e.byZone, initMs: e.initMs, liveTris: e.liveTris, rows: e.rows, coinsLive: e.coinsLive, coinTris: e.coinTris, shadows: e.shadows, coinsGot: e.coinsGot, coins: g.coins, hits: e.hits, farband: e.farband, zones: e.zones, placeholders: e.placeholders, materials: e.build.materials, buildMs: e.build.ms, next: g.next, coin: g.coin, errors: errors.length }, null, 1));
console.log('variants', e.build.trisPerVariant.map((v) => `${v.id}:${v.tris}t/${v.meshes}m/${v.props}p/${v.litter}l/${v.lights}L`).join(' '));
await browser.close(); server.close(); process.exit(0);
