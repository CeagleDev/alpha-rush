// qa_death.mjs — drive straight (no steering) and film what a stumble / crash / caught looks like.
// usage: node tools/qa_death.mjs --seed=11 --out=work/qa/death11 [--lane=0] [--until=block|caught|any]
import { createRequire } from 'module';
import fs from 'fs';
const require = createRequire(import.meta.url);
const puppeteer = require('puppeteer');
const arg = (k, d) => { const a = process.argv.find((s) => s.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const SEED = arg('seed', '11'), OUT = arg('out', 'work/qa/death'), LANE = Number(arg('lane', '0')); fs.mkdirSync(OUT, { recursive: true });
const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--use-angle=metal', '--enable-gpu'] });
const page = await browser.newPage(); await page.setViewport({ width: 405, height: 720, deviceScaleFactor: 1 });
const logs = []; page.on('console', (m) => { const t = m.text(); if (/^EV |error|threw|NaN/i.test(t) && !/sun is below/.test(t)) logs.push(t.slice(0, 220)); }); page.on('pageerror', (e) => logs.push('PAGEERROR ' + String(e).slice(0, 200)));
await page.goto(`http://localhost:8080/__game__/game/?seed=${SEED}&mute=1&r=${Date.now()}`, { waitUntil: 'load' });
await page.waitForFunction('window.__READY__ === true', { timeout: 90000 });
await page.evaluate((lane) => {
  const c = window.__ctx; window.__START__(); window.__evs = [];
  for (const e of ['hit', 'stumble', 'death', 'shieldbreak']) c.events.on(e, (p) => { const s = c.state; window.__evs.push({ e, t: performance.now(), d: +s.distance.toFixed(1), type: p && p.type, kind: p && p.kind, fatal: p && p.fatal, reason: p && p.reason, pack: +(+s.packDist).toFixed(2) }); console.warn('EV ' + e + ' @' + s.distance.toFixed(1) + ' ' + JSON.stringify(p || {})); });
  const key = (k) => dispatchEvent(new KeyboardEvent('keydown', { key: k, code: k, bubbles: true }));
  if (lane < 0) key('ArrowLeft'); if (lane > 0) key('ArrowRight');
}, LANE);
// film continuously from the first event until 2 s after the run ends (~10 fps), stamping each frame
let i = 0, started = false, overAt = 0; const t0 = Date.now(); const idx = [];
while (Date.now() - t0 < 70000) {
  const st = await page.evaluate(() => ({ n: window.__evs.length, over: window.__GAME__.over, d: window.__GAME__.distance, ps: window.__ctx.state.playerState, pack: window.__ctx.state.packDist }));
  if (st.n > 0) started = true;
  if (started) { const f = `${OUT}/f_${String(i).padStart(3, '0')}.png`; await page.screenshot({ path: f }); idx.push({ i, d: +st.d.toFixed(1), ps: st.ps, pack: +(+st.pack).toFixed(2), ev: st.n }); i++; }
  if (st.over && !overAt) overAt = Date.now();
  if (overAt && Date.now() - overAt > 2000) break;
  await new Promise((r) => setTimeout(r, started ? 45 : 20));
}
fs.writeFileSync(`${OUT}/index.json`, JSON.stringify(idx));
await new Promise((r) => setTimeout(r, 1700)); await page.screenshot({ path: `${OUT}/zz_card.png` });
const fin = await page.evaluate(() => { const G = window.__GAME__, c = window.__ctx; const p = c.modules.player.getObject(); return { evs: window.__evs.map((x) => ({ ...x, t: undefined })), over: G.over, d: +G.distance.toFixed(1), coins: G.coins, score: Math.floor(G.score), runnerY: +p.position.y.toFixed(2), groundY: +c.modules.track.groundY(p.position.z).toFixed(2), packDist: +(+c.state.packDist).toFixed(2), deadCardOn: document.getElementById('dead').classList.contains('on') }; });
console.log(JSON.stringify(fin)); [...new Set(logs)].filter((l) => !/^EV /.test(l)).forEach((l) => console.log('LOG ' + l));
await browser.close();
