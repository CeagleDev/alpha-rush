// Sweep the ground ambient (textures.js GROUND_AMBIENT) in ONE browser launch.
//
// A full gate run drives 800 m and costs a minute of GPU; this boots once, runs far enough to be
// in a dressed alley chunk, FREEZES the world (state.running = false, speed = 0) so every shot is
// the same viewpoint, then tunes and re-photographs. The frames are not gate frames and are not
// a verdict — they are the response curve for one scalar, so the gate only has to be run once it
// is set.
//
//   node tools/roadsweep.mjs <game dir> --out=work/r3/sweep --values=0,0.5,1,1.5,2.2 [--seed=7]
import http from 'http';
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(path.join(HERE, 'noop.js'));
const puppeteer = (await import(require.resolve('puppeteer'))).default;

const argv = process.argv.slice(2);
const opt = (k, d) => { const a = argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const ROOT = path.resolve(argv.find((x) => !x.startsWith('--')) || 'game');
const OUT = path.resolve(opt('out', 'work/r3/sweep'));
const SEED = Number(opt('seed', '7')) || 7;
const VALUES = opt('values', '0,0.5,1,1.5,2.2').split(',').map(Number);
const RUN_MS = Number(opt('runms', '4000')) || 4000;
fs.mkdirSync(OUT, { recursive: true });

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.mp3': 'audio/mpeg' };
const srv = http.createServer((rq, rs) => {
  const u = decodeURIComponent(rq.url.split('?')[0]);
  const f = path.join(ROOT, u === '/' ? 'index.html' : u);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { rs.writeHead(404); return rs.end('404'); }
  rs.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' });
  rs.end(fs.readFileSync(f));
});
await new Promise((r) => srv.listen(0, r));
const port = srv.address().port;

const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--use-gl=angle', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage();
await page.setViewport({ width: 810, height: 1440, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
const logs = [];
page.on('console', (m) => logs.push(`${m.type()}: ${m.text()}`.slice(0, 220)));
page.on('pageerror', (e) => logs.push(`PAGEERROR: ${String(e).slice(0, 300)}`));
await page.goto(`http://localhost:${port}/?seed=${SEED}&gate=1&nohud=1`, { waitUntil: 'load' });
await page.waitForFunction('window.__READY__ === true', { timeout: 90000 });
await page.evaluate(() => window.__START__());
await new Promise((r) => setTimeout(r, RUN_MS));

const where = await page.evaluate(() => {
  const c = window.__ctx;
  c.state.running = false; c.state.speed = 0;      // freeze: every shot is the same viewpoint
  // the pack catches a runner that nothing is steering, and the death screen is a full-frame dark
  // overlay that makes every measurement below meaningless. Hide every UI layer, not just the HUD.
  for (const id of ['hud', 'title', 'dead']) { const e = document.getElementById(id); if (e) e.style.display = 'none'; }
  return { z: Math.round(c.state.z), over: !!c.state.over, draws: c.state.draws, tris: c.state.tris,
           fx: window.__groundfx ? 'yes' : 'MISSING' };
});
console.log('frozen at', JSON.stringify(where));

for (const v of VALUES) {
  const r = await page.evaluate((val) => window.__groundfx.tune({ intensity: val }), v);
  await new Promise((res) => setTimeout(res, 350));
  const f = path.join(OUT, `amb_${String(v).replace('.', 'p')}.png`);
  await page.screenshot({ path: f });
  console.log(`  intensity ${v}  -> ${path.basename(f)}   materials touched ${r.materials}`);
}

console.log('\n--- console ---');
logs.slice(0, 25).forEach((l) => console.log('  ' + l));
console.log(`(${logs.length} lines)`);
await browser.close();
srv.close();
