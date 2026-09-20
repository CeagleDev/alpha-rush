// Boot the game headless and report what is actually in the scene, since a gate can pass on an empty world.
import { createRequire } from 'module';
import http from 'http'; import fs from 'fs'; import path from 'path';
const require = createRequire('/Users/dev/Documents/Cursor.Code/midnight-dash/tools/');
const puppeteer = require('puppeteer');
const ROOT = path.resolve(process.argv[2] || 'game');
const MIME = { '.html':'text/html', '.js':'text/javascript', '.mjs':'text/javascript', '.json':'application/json', '.webp':'image/webp', '.png':'image/png', '.mp3':'audio/mpeg' };
const srv = http.createServer((rq, rs) => {
  const u = decodeURIComponent(rq.url.split('?')[0]); const f = path.join(ROOT, u === '/' ? 'index.html' : u);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { rs.writeHead(404); return rs.end('404'); }
  rs.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); rs.end(fs.readFileSync(f));
});
await new Promise((r) => srv.listen(0, r)); const port = srv.address().port;
const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const logs = []; page.on('console', (m) => logs.push(`${m.type()}: ${m.text()}`.slice(0, 200)));
page.on('pageerror', (e) => logs.push(`PAGEERROR: ${String(e).slice(0, 300)}`));
await page.goto(`http://localhost:${port}/?seed=7`, { waitUntil: 'load' });
await page.waitForFunction('window.__READY__ === true', { timeout: 60000 });
await page.evaluate(() => window.__START__());
await new Promise((r) => setTimeout(r, 3000));
const rep = await page.evaluate(() => {
  const ctx = window.__ctx; const scene = ctx?.scene; const out = { ok: !!scene };
  if (!scene) return out;
  let meshes = 0, tris = 0, visible = 0, placeholders = 0; const byName = {};
  scene.traverse((o) => {
    if (o.isMesh) { meshes++; if (o.visible) visible++; const g = o.geometry; tris += g?.index ? g.index.count / 3 : (g?.attributes?.position?.count || 0) / 3; }
    if (o.userData?.placeholder) placeholders++;
  });
  for (const c of scene.children) {
    const k = `${c.type}:${c.name || '(anon)'}`; let m = 0; c.traverse((o) => { if (o.isMesh) m++; });
    byName[k] = { meshes: m, visible: c.visible, pos: [c.position.x, c.position.y, c.position.z].map((v) => +v.toFixed(1)) };
  }
  const t = ctx.modules?.track || ctx.track;
  // draw-call census: count VISIBLE meshes per top-level group, which is what the renderer submits
  const census = {};
  for (const c of scene.children) { let m = 0; c.traverse((o) => { if (o.isMesh && o.visible) m++; }); if (m) census[c.name || c.type] = m; }
  const matsPerChunk = [];
  const trackG = scene.children.find((c) => c.name === 'track');
  if (trackG) for (const ch of trackG.children) { let m = 0; ch.traverse((o) => { if (o.isMesh) m++; }); matsPerChunk.push({ name: ch.name || ch.userData?.variant || '?', meshes: m, z: +ch.position.z.toFixed(0) }); }
  return { ok: true, meshes, visible, tris: Math.round(tris), placeholders, topLevel: byName, census, matsPerChunk,
    trackStats: t?.stats ? t.stats() : 'no stats()', playerObj: !!ctx.modules?.player?.getObject?.(),
    game: { ...window.__GAME__, next: undefined }, lights: scene.children.filter((c) => c.isLight).length };
});
console.log(JSON.stringify(rep, null, 2));
console.log('\n--- console (first 40) ---'); logs.slice(0, 40).forEach((l) => console.log('  ' + l));
console.log(`(${logs.length} console lines total)`);
await browser.close(); srv.close();
