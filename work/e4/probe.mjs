// E4 probe: boot the REAL game headless, run it, and report what the lighting is actually doing —
// the emissive census (is the cap reaching the sign faces?), the rig uniforms in effect, and where
// the dark pixels are. Numbers, not a picture, so a wrong model gets caught instead of tuned around.
// usage: node work/e4/probe.mjs [seed]
import { createRequire } from 'module';
import http from 'http'; import fs from 'fs'; import path from 'path';
const require = createRequire('/Users/dev/Documents/Cursor.Code/midnight-dash/tools/');
const puppeteer = require('puppeteer');
const ROOT = path.resolve('game');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.mp3': 'audio/mpeg' };
const srv = http.createServer((rq, rs) => {
  const u = decodeURIComponent(rq.url.split('?')[0]); const f = path.join(ROOT, u === '/' ? 'index.html' : u);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { rs.writeHead(404); return rs.end('404'); }
  rs.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); rs.end(fs.readFileSync(f));
});
await new Promise((r) => srv.listen(0, r));
const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
await page.goto(`http://localhost:${srv.address().port}/?seed=${process.argv[2] || 7}&gate=1`, { waitUntil: 'load' });
await page.waitForFunction('window.__READY__ === true', { timeout: 90000 });
await page.evaluate(() => window.__START__());
await new Promise((r) => setTimeout(r, 6000));

const rep = await page.evaluate(() => {
  const ctx = window.__ctx, scene = ctx.scene, THREE = ctx.THREE, renderer = ctx.renderer;
  const L = ctx.modules.lighting;
  // ---- emissive census: peak LINEAR radiance per material, area-weighted by mesh count
  const mats = new Map();
  scene.traverse((o) => {
    if (!o.isMesh || !o.material) return;
    for (const m of (Array.isArray(o.material) ? o.material : [o.material])) {
      if (!m || !m.emissive) continue;
      const peak = Math.max(m.emissive.r, m.emissive.g, m.emissive.b);
      if (peak < 0.004) continue;
      if (!mats.has(m)) mats.set(m, { peak, i: m.emissiveIntensity, n: 0, hex: m.emissive.getHexString() });
      mats.get(m).n++;
    }
  });
  const rows = [...mats.values()].map((r) => ({ ...r, rad: +(r.peak * r.i).toFixed(2) })).sort((a, b) => b.rad - a.rad);
  const rads = rows.map((r) => r.rad).sort((a, b) => a - b);
  // ---- the frame itself: share of pixels over 200, and what the brightest ones are
  renderer.render(scene, ctx.camera);
  const gl = renderer.getContext(); const s = renderer.getDrawingBufferSize(new THREE.Vector2());
  const buf = new Uint8Array(s.x * s.y * 4);
  gl.readPixels(0, 0, s.x, s.y, gl.RGBA, gl.UNSIGNED_BYTE, buf);
  let over200 = 0, over240 = 0, n = s.x * s.y; const lum = new Float64Array(n);
  let darkR = 0, darkB = 0, darkN = 0;
  for (let i = 0, p = 0; i < buf.length; i += 4, p++) {
    const r = buf[i], g = buf[i + 1], b = buf[i + 2];
    const Y = 0.299 * r + 0.587 * g + 0.114 * b; lum[p] = Y;
    if (Y > 200) over200++; if (Y > 240) over240++;
    if (Y < 60 && b - r < 60) { darkR += r; darkB += b; darkN++; }
  }
  const sorted = Float64Array.from(lum).sort();
  return {
    exposure: renderer.toneMappingExposure,
    hemi: { i: ctx.rig.hemi.intensity, sky: ctx.rig.hemi.color.toArray().map((v) => +v.toFixed(3)), ground: ctx.rig.hemi.groundColor.toArray().map((v) => +v.toFixed(3)) },
    bounce: ctx.rig.bounce.uBounce.value.toArray().map((v) => +v.toFixed(3)),
    bounceSide: ctx.rig.bounce.uBounceSide.value,
    envIntensity: scene.environmentIntensity,
    lighting: L.report ? L.report() : null,
    params: L.PARAMS ? { emissive: L.PARAMS.emissive, emissiveCap: L.PARAMS.emissiveCap, candela: L.PARAMS.candela, fill: L.PARAMS.fill, bounce: L.PARAMS.bounce } : null,
    emissiveMaterials: rows.length,
    emissiveRad: { min: rads[0], med: rads[rads.length >> 1], max: rads[rads.length - 1] },
    emissiveTop: rows.slice(0, 8),
    frame: { median: +sorted[n >> 1].toFixed(1), p98: +sorted[Math.floor(n * 0.98)].toFixed(1), over200: +(over200 / n * 100).toFixed(2), over240: +(over240 / n * 100).toFixed(2), darkRB: darkN ? +((darkR - darkB) / darkN).toFixed(1) : null, darkShare: +(darkN / n * 100).toFixed(1) },
  };
});
console.log(JSON.stringify(rep, null, 1));
await browser.close(); srv.close();
