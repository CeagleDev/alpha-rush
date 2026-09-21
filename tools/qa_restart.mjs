// qa_restart.mjs — die, press "Run again", and check the second run starts like the first.
import { createRequire } from 'module';
const require = createRequire('/Users/dev/Documents/Cursor.Code/midnight-dash/tools/');
const puppeteer = require('puppeteer');
const arg = (k, d) => { const a = process.argv.find((s) => s.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const [W, H] = arg('vp', '900x660').split('x').map(Number);
const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--use-angle=metal', '--enable-gpu'] });
const page = await browser.newPage(); await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
const logs = []; page.on('console', (m) => { const t = m.text(); if (/error|threw/i.test(m.type() + t) && !/sun is below/.test(t)) logs.push(t.slice(0, 200)); }); page.on('pageerror', (e) => logs.push('PAGEERROR ' + String(e).slice(0, 200)));
await page.goto(`http://localhost:8080/__game__/game/?seed=${arg('seed', '11')}&mute=1&r=${Date.now()}`, { waitUntil: 'load' });
await page.waitForFunction('window.__READY__ === true', { timeout: 90000 });
const sample = () => page.evaluate(() => { const c = window.__ctx, s = c.state, cam = c.camera.position; return { d: +s.distance.toFixed(1), camBack: +(s.z - cam.z).toFixed(2), camY: +cam.y.toFixed(2), coinsLive: c.modules.coins.count(), rows: c.modules.obstacles.rows().length, pack: +(+s.packDist).toFixed(2), score: Math.floor(s.score), coins: s.coins, ps: s.playerState, hero: +(+s.heroFrac).toFixed(3) }; });
const run = async (label) => {
  const out = [];
  for (let i = 0; i < 8; i++) { await new Promise((r) => setTimeout(r, 400)); out.push(await sample()); }
  console.log(label, JSON.stringify(out.map((o) => [o.d, o.camBack, o.camY, o.coinsLive, o.pack, o.hero])));
  return out;
};
await page.click('#startb'); await run('run1 [d,camBack,camY,coinsLive,pack,hero]');
await page.waitForFunction('window.__GAME__.over', { timeout: 90000, polling: 50 });
await new Promise((r) => setTimeout(r, 2000)); console.log('dead', JSON.stringify(await sample()));
await page.click('#restartb'); await run('run2 [d,camBack,camY,coinsLive,pack,hero]');
await page.screenshot({ path: arg('out', 'work/qa/restart.png') });
logs.forEach((l) => console.log('LOG ' + l)); await browser.close();
