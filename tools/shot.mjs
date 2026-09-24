// shot.mjs — light-weight look at the game: boot, autopilot in-page, screenshots at given distances.
// usage: node tools/shot.mjs --out=work/v2/x --at=40,120 [--q=seed=7&foo=1] [--vp=405x720] [--close] [--eval="js run before each shot"]
// Kept cheap on purpose (laptop on battery): small viewport, DPR 1, one browser, exits as soon as the last shot lands.
import { createRequire } from 'module';
import fs from 'fs'; import path from 'path';
const require = createRequire('/Users/dev/Documents/Cursor.Code/midnight-dash/tools/');
const puppeteer = require('puppeteer');
const arg = (k, d) => { const a = process.argv.find((s) => s.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const OUT = arg('out', 'work/v2/shot'); fs.mkdirSync(OUT, { recursive: true });
const AT = arg('at', '40').split(',').map(Number);
const [W, H] = arg('vp', '405x720').split('x').map(Number);
const Q = arg('q', 'seed=7');
const CLOSE = process.argv.includes('--close');
const EVAL = arg('eval', '');
const HERO = arg('hero', '');   // --hero=ronin|kitsune|oni : select through the home screen's own setter before starting
const URL_ = `http://localhost:8080/__game__/game/?${Q}&mute=1&r=${Date.now()}`;
const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--use-angle=metal', '--enable-gpu'] });
const page = await browser.newPage();
await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
const logs = []; page.on('console', (m) => { const t = m.text(); if (/error|threw|warn/i.test(m.type() + t)) logs.push(`${m.type()}: ${t}`.slice(0, 240)); });
page.on('pageerror', (e) => logs.push(`PAGEERROR: ${String(e).slice(0, 300)}`));
await page.goto(URL_, { waitUntil: 'load' });
await page.waitForFunction('window.__READY__ === true', { timeout: 90000 });
await page.evaluate((hero) => {
  if (hero) { const H = window.__ctx.modules.home; if (H && H.choose) H.choose(hero); }
  window.__START__();
  const key = (k) => dispatchEvent(new KeyboardEvent('keydown', { key: k, code: k, bubbles: true }));
  let acted = -1, want = null;
  const tick = () => {
    const G = window.__GAME__; if (G && !G.over) {
      const n = G.next, v = G.speed || 9;
      if (n && n.id !== acted) {
        const mine = n.lanes[G.lane + 1];
        if (mine === 'jump' && n.dist <= 0.35 * v + 1.5) { key('ArrowUp'); acted = n.id; }
        else if (mine === 'roll' && n.dist <= Math.max(0.3, (0.8 * v - (n.len || 1)) / 2)) { key('ArrowDown'); acted = n.id; }
        else if (mine === 'block' && n.dist <= 0.55 * v + 2.5) {
          const order = [G.lane - 1, G.lane + 1].filter((l) => l >= -1 && l <= 1).sort((a, b) => Math.abs(a) - Math.abs(b));
          const free = order.find((l) => n.lanes[l + 1] === null) ?? order[0];
          key(free < G.lane ? 'ArrowLeft' : 'ArrowRight'); want = n.lanes[free + 1]; if (!want) acted = n.id; else { n.lanes[G.lane + 1] = want; }
        } else if (mine === null) acted = n.id;
      }
    }
    requestAnimationFrame(tick);
  };
  tick();
}, HERO);
for (const d of AT) {
  try { await page.waitForFunction(`window.__GAME__ && (window.__GAME__.distance >= ${d} || window.__GAME__.over)`, { timeout: 120000, polling: 50 }); } catch (e) { logs.push('timeout waiting for ' + d); }
  if (EVAL) await page.evaluate(EVAL).catch((e) => logs.push('eval: ' + e.message));
  const info = await page.evaluate(() => { const G = window.__GAME__; return { d: Math.round(G.distance), zone: G.zone, over: G.over, fps: Math.round(G.fps), draws: G.draws, tris: G.tris }; });
  const f = path.join(OUT, `d${String(d).padStart(4, '0')}.png`);
  if (CLOSE) {
    const b = await page.evaluate(() => window.__GAME__.heroBox);
    if (b) { const pad = 40; await page.screenshot({ path: f, clip: { x: Math.max(0, b[0] - pad), y: Math.max(0, b[1] - pad), width: Math.min(W, b[2] + pad * 2), height: Math.min(H, b[3] + pad * 2) } }); }
    else await page.screenshot({ path: f });
  } else await page.screenshot({ path: f });
  console.log(f, JSON.stringify(info));
  if (info.over) break;
}
if (logs.length) { console.log('--- console problems ---'); [...new Set(logs)].slice(0, 20).forEach((l) => console.log('  ' + l)); }
await browser.close();
