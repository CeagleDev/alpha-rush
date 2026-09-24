#!/usr/bin/env node
/**
 * midnight-dash gate: drive the runner with REAL input, photograph it at fixed distances, fail loudly.
 *
 *   node tools/gate.mjs <game dir> [--phone|--desktop] [--seed=7] [--out=<dir>] [--runs=1] [--4g] [--clip] [--nohud] [--viewport=WxH] [--shutter=N] [--frames=6]
 *
 * Phone (default): 390x844 @3x, touch, Android UA. Start is a real CDP touch tap on #startb; swipes are
 * real CDP touch sequences. --desktop: 1280x720, a real click and real arrow keys. The phone run is the
 * measurement run: the bar is portrait, so is the phone viewport (docs/claims.md).
 *
 * Steering reads window.__GAME__.next every ~40 ms and decides at DISTANCES that are a function of
 * speed only, never at wall-clock times, so two runs on an unchanged build take the same line. Every
 * field it reads is named in tools/GATE_CONTRACT.md. Without `next` it drives straight and says so.
 *
 * It serves ONLY the game folder, like a static host. Anything else the page asks for is a 404 and a
 * failure. Frame rate is captioned (software rendering is detected) and never gated; draws and tris are.
 */
import { createServer } from 'http';
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
let puppeteer;
try {
  puppeteer = (await import('puppeteer')).default;
} catch {
  try {
    const req = createRequire(path.join(HERE, 'node_modules', 'noop.js'));
    puppeteer = (await import(req.resolve('puppeteer'))).default;
  } catch {
    console.error('puppeteer not found: tools/node_modules should link to the recipe\'s node_modules');
    process.exit(2);
  }
}

// ------------------------------------------------------------------ arguments
const argv = process.argv.slice(2);
const flag = (k) => argv.includes(`--${k}`);
const opt = (k, d) => { const a = argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3).replace(/^["']|["']$/g, '') : d; };
const targetArg = argv.find((x) => !x.startsWith('--'));
if (!targetArg) {
  console.error('usage: node tools/gate.mjs <game dir> [--phone|--desktop] [--seed=7] [--out=<dir>] [--runs=1] [--4g] [--clip] [--nohud] [--viewport=WxH] [--shutter=N] [--frames=6]');
  process.exit(2);
}
const target = path.resolve(targetArg);
if (!fs.existsSync(path.join(target, 'index.html'))) { console.error(`no index.html in ${target}`); process.exit(2); }
const DESKTOP = flag('desktop');
const SEED = Number(opt('seed', '7')) || 7;
const OUT = path.resolve(opt('out', path.join(target, '_gate')));
const RUNS = Math.max(1, Number(opt('runs', '1')) || 1);
const FOURG = flag('4g');
const CLIP = flag('clip');
const NFRAMES = Math.max(2, Number(opt('frames', '6')) || 6);
const SHOTS = opt('at', '') ? opt('at', '').split(',').map(Number).filter((n) => n > 0)
  : NFRAMES === 6 ? [60, 150, 300, 450, 600, 800]
  : Array.from({ length: NFRAMES }, (_, i) => Math.round(60 + (i * 740) / (NFRAMES - 1)));
const FFMPEG = '/Users/dev/.local/bin/ffmpeg';

// ------------------------------------------------------------------ constants (one place)
// Action distances, as the GAME sees them: metres = a * speed + b before the row's near edge. Decided by
// DISTANCE so the line is repeatable. A touch gesture takes ~0.15 s to arrive (four touch moves over
// ~100 ms plus the CDP round trip), a key press ~0, so GESTURE_S * speed is added on top: at 20 m/s a
// swipe costs 3 m of road before the game even sees it.
const LEAD = { jump: [0.35, 1.5], lane: [0.55, 2.0], coin: [0.65, 2.0] };   // roll: see rollLead below
const vpArg = (argv.find((x) => x.startsWith('--viewport=')) || '').split('=')[1] || '';
const VP = /^\d+x\d+$/.test(vpArg) ? { w: +vpArg.split('x')[0], h: +vpArg.split('x')[1] } : null;
const GESTURE_S = DESKTOP ? 0.01 : 0.15;
const BUDGET = { DIST_M: 600, DEATH_M: 400, DRAWS: 900, TRIS: 1_500_000, READY_S: 20, MB: 5 };
const POLL_MS = 40;
const START_WAIT_MS = 3000;
const STALL_MS = 10000;
const NET = { downMbps: 4, upMbps: 1, latencyMs: 60, cpuSlowdown: 2 };
const CDN_HOSTS = ['cdn.jsdelivr.net', 'cdnjs.cloudflare.com', 'unpkg.com', 'fonts.googleapis.com', 'fonts.gstatic.com'];
const VIEWPORT = DESKTOP
  ? { width: 1280, height: 720, deviceScaleFactor: 1 }
  : (VP ? { width: VP.w, height: VP.h, deviceScaleFactor: 1, isMobile: true, hasTouch: true } : { width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.wav': 'audio/wav', '.m4a': 'audio/mp4',
  '.mp4': 'video/mp4', '.webm': 'video/webm', '.woff2': 'font/woff2', '.glb': 'model/gltf-binary', '.wasm': 'application/wasm' };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const label = path.relative(process.cwd(), target) || target;

// ------------------------------------------------------------------ server: the game folder and nothing else
const outside = new Set();   // paths that tried to reach above the folder
function resolveRequest(rel) {
  const file = path.normalize(path.join(target, rel));
  if (!file.startsWith(target + path.sep) && file !== target) { outside.add(rel); return null; }
  return file;
}
const server = createServer((req, res) => {
  let rel = decodeURIComponent(req.url.split('?')[0]);
  if (rel.endsWith('/')) rel += 'index.html';
  if (rel === '/favicon.ico') { res.writeHead(204); return res.end(); }
  const file = resolveRequest(rel);
  if (!file || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end('not found'); }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  fs.createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
/** Average N PNG buffers pixel-wise into one PNG. Decoded in the browser page we already have open,
 *  because the gate has no image library: a canvas does the decode, the average and the re-encode. */
async function averagePNGs(buffers, outFile) {
  const b64 = buffers.map((b) => Buffer.from(b).toString('base64'));
  // created lazily: opening a second page while the game's WebGL boot is in flight starved it and
  // pushed __READY__ past the 120 s timeout. By the first photo the game is already running.
  if (!averagePNGs._page) {
    averagePNGs._page = await averagePNGs._browser.newPage();
    await averagePNGs._page.goto('about:blank');
  }
  const page = averagePNGs._page;
  const dataUrl = await page.evaluate(async (list) => {
    const imgs = await Promise.all(list.map((d) => new Promise((res, rej) => {
      const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = 'data:image/png;base64,' + d;
    })));
    const w = imgs[0].width, h = imgs[0].height;
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const ctx = c.getContext('2d');
    const acc = new Float32Array(w * h * 4);
    for (const im of imgs) {
      ctx.clearRect(0, 0, w, h); ctx.drawImage(im, 0, 0);
      const d = ctx.getImageData(0, 0, w, h).data;
      for (let i = 0; i < acc.length; i++) acc[i] += d[i];
    }
    const out = ctx.createImageData(w, h);
    for (let i = 0; i < acc.length; i++) out.data[i] = acc[i] / imgs.length;
    ctx.putImageData(out, 0, 0);
    return c.toDataURL('image/png');
  }, b64);
  fs.writeFileSync(outFile, Buffer.from(dataUrl.split(',')[1], 'base64'));
}

const BASE = `http://127.0.0.1:${server.address().port}`;
// --nohud captures the frames a critic judges: a HUD in the corner identifies our frame instantly
// in a blind pair, and the reference frames have none.
const NOHUD = argv.includes('--nohud');
// --shutter=N averages N screenshots taken a few ms apart into one frame, which is a real camera
// shutter: the world is moving at 9-20 m/s, so consecutive reads differ and the average carries
// genuine per-object motion blur. The round-2 critic called the absence of it a SERIOUS instrument
// fault — every reference frame carries camera and object blur and none of ours did, which inflates
// the gap on silhouette quality, edge aliasing and readability-at-a-glance, and would have had the
// next verdict measuring the same artefact again. This blurs the CAPTURE, not the game.
const shutArg = (argv.find((x) => x.startsWith('--shutter=')) || '').split('=')[1];
const SHUTTER = Math.max(1, Math.min(12, Number(shutArg) || 1));
// --viewport=WxH captures at the REFERENCE's shape. docs/claims.md: a band statistic defined as a
// fraction of the frame covers a different amount of world at every aspect ratio, and a blind pair
// whose two sides have different proportions tells the critic which is which before it looks.
// Our bar is 810x1440 (9:16); the phone gate is 390x844 (1:2.16).
const GAME_URL = `${BASE}/?seed=${SEED}&gate=1${NOHUD ? '&nohud=1' : ''}`;

fs.mkdirSync(OUT, { recursive: true });
const browser = await puppeteer.launch({
  headless: true,
  args: ['--enable-unsafe-swiftshader', '--no-sandbox', '--allow-file-access-from-files',
    `--window-size=${VIEWPORT.width},${VIEWPORT.height}`],
});
let exitCode = 0;
averagePNGs._browser = browser;
const deferredBlur = [];
const cleanup = async () => { try { await browser.close(); } catch {} server.close(); };
process.on('SIGINT', async () => { await cleanup(); process.exit(130); });

// ------------------------------------------------------------------ one run
async function runOnce(runNo, outDir) {
  fs.mkdirSync(outDir, { recursive: true });
  const page = await browser.newPage();
  await page.setViewport(VIEWPORT);
  if (!DESKTOP) await page.setUserAgent('Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36');
  await page.setCacheEnabled(false);
  const cdp = await page.createCDPSession();
  await cdp.send('Network.enable');
  if (FOURG) {
    await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: NET.latencyMs,
      downloadThroughput: NET.downMbps * 1024 * 1024 / 8, uploadThroughput: NET.upMbps * 1024 * 1024 / 8 });
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: NET.cpuSlowdown });
  }

  const missing = [], errors = [], external = new Set(), cdn = new Set(), pending = [];
  let bodyBytes = 0;
  page.on('request', (r) => {
    const u = r.url();
    if (/^(data|blob):/.test(u) || u.startsWith(BASE)) return;
    let host = ''; try { host = new URL(u).host; } catch { return; }
    (CDN_HOSTS.includes(host) ? cdn : external).add(host);
  });
  page.on('response', (r) => {
    const u = r.url();
    if (/^(data|blob):/.test(u)) return;
    if (r.status() >= 400 && !/\/favicon\.ico$/.test(u)) missing.push(`${r.status()} ${u.replace(BASE, '')}`);
    const fromHeader = Number(r.headers()['content-length'] || 0);
    pending.push(r.buffer().then((b) => { bodyBytes += b.length; }).catch(() => { bodyBytes += fromHeader; }));
  });
  page.on('pageerror', (e) => errors.push(String(e.message).slice(0, 200)));
  page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push(m.text().slice(0, 200)); });

  const decisions = [];
  const say = (line) => { decisions.push(line); console.log('  ' + line); };

  // 1. load, ready
  console.log(`\nrun ${runNo}: loading ${label} at ${VIEWPORT.width}x${VIEWPORT.height} @${VIEWPORT.deviceScaleFactor}x` +
    `${DESKTOP ? ' desktop (click + keys)' : ' phone (real touch)'}${FOURG ? ', 4G + CPU 2x' : ''}, seed ${SEED}`);
  const t0 = Date.now();
  let readyS = null, loadNote = '';
  try {
    await page.goto(GAME_URL, { waitUntil: 'load', timeout: 90000 });
    await page.waitForFunction('window.__READY__ === true', { timeout: 120000 });
    readyS = (Date.now() - t0) / 1000;
  } catch (e) { loadNote = `no __READY__: ${String(e.message).slice(0, 100)}`; }
  const gpu = await page.evaluate(() => {
    try {
      const c = document.createElement('canvas');
      const gl = c.getContext('webgl2') || c.getContext('webgl');
      const dbg = gl && gl.getExtension('WEBGL_debug_renderer_info');
      return dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)) : (gl ? String(gl.getParameter(gl.RENDERER)) : '');
    } catch { return ''; }
  }).catch(() => '');
  const software = /swiftshader|llvmpipe|software/i.test(gpu);
  console.log(`  ready ${readyS === null ? 'never' : readyS.toFixed(1) + ' s'}   renderer ${gpu || 'unknown'}${software ? '  (SOFTWARE rendering: fps is not a verdict)' : ''}`);

  // 2. clip: hide the HUD with a style tag the game cannot overwrite, then stream frames off the compositor
  let clipFrames = 0, clipT0 = null, clipT1 = null;
  const clipDir = path.join(outDir, 'clip');
  if (CLIP && readyS !== null) {
    fs.mkdirSync(clipDir, { recursive: true });
    for (const f of fs.readdirSync(clipDir)) fs.unlinkSync(path.join(clipDir, f));
    await page.evaluate(() => { const s = document.createElement('style'); s.id = '__gate_hide_hud'; s.textContent = '#hud{display:none!important}'; document.head.appendChild(s); });
    cdp.on('Page.screencastFrame', async (f) => {
      try {
        fs.writeFileSync(path.join(clipDir, `f${String(clipFrames++).padStart(5, '0')}.jpg`), Buffer.from(f.data, 'base64'));
        if (clipT0 === null) clipT0 = f.metadata.timestamp; clipT1 = f.metadata.timestamp;
        await cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId });
      } catch {}
    });
    await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 85, maxWidth: DESKTOP ? 1280 : 720, maxHeight: DESKTOP ? 720 : 1560, everyNthFrame: 1 });
  }

  // 3. press the real control
  const read = () => page.evaluate(() => {
    const g = window.__GAME__; if (!g) return null;
    return { pos: Array.isArray(g.pos) ? [+g.pos[0], +g.pos[1]] : null, fps: g.fps, speed: g.speed, score: g.score,
      over: g.over === true, draws: g.draws, tris: g.tris, lane: g.lane, airborne: g.airborne === true, rolling: g.rolling === true,
      distance: g.distance, zone: g.zone, coins: g.coins, deaths: g.deaths, jumps: g.jumps, rolls: g.rolls,
      hasNext: 'next' in g, next: g.next || null, coin: g.coin || null, heroBox: Array.isArray(g.heroBox) ? g.heroBox : null };
  }).catch(() => null);
  const startBox = readyS === null ? null : await page.evaluate(() => {
    const e = document.querySelector('#startb'); if (!e) return null;
    const r = e.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2, visible: e.offsetParent !== null && r.width > 0 && r.height > 0 };
  }).catch(() => null);
  const tap = async (x, y) => {
    if (DESKTOP) { await page.mouse.click(x, y); return; }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, id: 1 }] });
    await sleep(60);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  };
  const g0 = await read();
  const z0 = g0?.pos ? g0.pos[1] : 0;
  const distOf = (g) => (typeof g.distance === 'number' ? g.distance : (g.pos ? g.pos[1] - z0 : 0));
  const hasStarted = async () => { const g = await read(); return !!g && !g.over && ((g.speed || 0) > 0 || distOf(g) > 0.5); };
  let startHow = '', startFallback = false, startNote = '';
  if (readyS !== null) {
    if (!startBox) startNote = 'no #startb on the page';
    else if (!startBox.visible) startNote = '#startb is in the DOM but not visible';
    else {
      for (let attempt = 1; attempt <= 2 && !startHow; attempt++) {
        await tap(startBox.x, startBox.y);
        const until = Date.now() + START_WAIT_MS;
        while (Date.now() < until) { if (await hasStarted()) { startHow = `${DESKTOP ? 'click' : 'touch tap'} on #startb${attempt > 1 ? ' (2nd tap)' : ''}`; break; } await sleep(80); }
      }
      if (!startHow) startNote = `${DESKTOP ? 'clicked' : 'tapped'} #startb twice and the game did not start`;
    }
    if (!startHow) {
      await page.evaluate(() => window.__START__ && window.__START__()).catch(() => {});
      await sleep(500);
      startFallback = true;
      startHow = `window.__START__() FALLBACK because ${startNote}`;
    }
    say(`started via ${startHow}`);
  }

  // 4. drive
  const swipe = async (dir) => {
    const t = Date.now();
    if (DESKTOP) { await page.keyboard.press({ left: 'ArrowLeft', right: 'ArrowRight', up: 'ArrowUp', down: 'ArrowDown' }[dir]); return Date.now() - t; }
    const cx = VIEWPORT.width / 2, cy = VIEWPORT.height * 0.58;
    const dx = dir === 'left' ? -1 : dir === 'right' ? 1 : 0, dy = dir === 'up' ? -1 : dir === 'down' ? 1 : 0;
    const STEPS = 4, PX = 22;
    // CDP replies only once the renderer has handled each event, ~50 ms at 3x, so awaiting every step
    // stretched a 110 ms gesture to 350 ms. The socket keeps them in order; only the end is awaited.
    const send = (params) => cdp.send('Input.dispatchTouchEvent', params).catch(() => {});
    send({ type: 'touchStart', touchPoints: [{ x: cx, y: cy, id: 1 }] });
    for (let i = 1; i <= STEPS; i++) {
      await sleep(22);
      send({ type: 'touchMove', touchPoints: [{ x: cx + dx * PX * i, y: cy + dy * PX * i, id: 1 }] });
    }
    await sleep(20);
    await send({ type: 'touchEnd', touchPoints: [] });
    return Date.now() - t;
  };
  const frames = [];          // { file, d, speed, fps, draws, tris, zone, hero, note }
  const samples = [];
  const acted = new Map();    // row key -> { lane, clear }
  let plan = null;            // { key, target } for a lane change still in progress
  let coinLock = null;        // distance beyond which the next coin swipe is allowed
  let shotIdx = 0, diedAt = null, stall = '', noNext = false, noNextSaid = false;
  let lastD = -1, lastProgress = Date.now();
  const wallCap = Date.now() + (software ? 400000 : 150000) + (FOURG ? 60000 : 0);
  const laneOf = (g) => (Number.isInteger(g.lane) ? g.lane : Math.max(-1, Math.min(1, Math.round((g.pos ? g.pos[0] : 0) / 2))));
  const settled = (g, lane) => !g.pos || Math.abs(g.pos[0] - lane * 2) < 0.2;
  const rowKey = (g, d) => (g.next.id != null ? `id${g.next.id}` : `z${Math.round(d + g.next.dist)}`);
  const lead = (k, sp) => LEAD[k][0] * sp + LEAD[k][1] + GESTURE_S * sp;
  // A roll lasts 0.5 s (0.5 * speed metres) and must be active from the row's near edge to its FAR edge,
  // so it may start anywhere in a window (0.5 * speed - len) wide ending at the near edge. Aim at the
  // middle of that window, plus half a poll interval because the decision fires at the first poll past it.
  const rowLen = (n) => (typeof n.len === 'number' && n.len > 0 ? n.len : 1);
  const rollLead = (n, sp) => Math.max(0.02 * sp, (0.5 * sp - rowLen(n)) / 2 + 0.025 * sp) + GESTURE_S * sp;
  const caption = (g, d, note) => ({ d, speed: g.speed, fps: g.fps, draws: g.draws, tris: g.tris, zone: g.zone ?? '',
    hero: g.heroBox ? Math.round(100 * g.heroBox[3] / VIEWPORT.height) : null, note });
  const shoot = async (g, d, note) => {
    const file = path.join(outDir, `f${frames.length}.png`);
    if (SHUTTER > 1) {
      // Grab the sub-frames fast and DEFER the averaging to after the run. Decoding inline cost
      // ~0.4 s per photo, during which the runner kept moving while the driver was blind, and the
      // gate's own stall detector fired at 65 m. The capture must not perturb the thing it measures.
      const subs = [];
      for (let i = 0; i < SHUTTER; i++) {
        subs.push(await page.screenshot({ type: 'png', optimizeForSpeed: true, encoding: 'binary' }));
        if (i < SHUTTER - 1) await new Promise((r) => setTimeout(r, 6));
      }
      fs.writeFileSync(file, subs[subs.length - 1]);      // a usable frame even if averaging fails
      deferredBlur.push({ file, subs });
    } else {
      await page.screenshot({ path: file, type: 'png', optimizeForSpeed: true });
    }
    frames.push({ file, ...caption(g, d, note) });
    console.log(`  photo f${frames.length - 1}  ${d.toFixed(1)} m  speed ${g.speed}  fps ${g.fps}  draws ${g.draws}  tris ${g.tris}  zone ${g.zone ?? '?'}${note ? '  ' + note : ''}`);
  };
  const imminent = (g, d, lane) => {
    const n = g.next; if (!n) return false;
    const mine = Array.isArray(n.lanes) ? n.lanes[lane + 1] : (n.lane === lane ? n.kind : null);
    if (!mine) return false;
    const sp = Math.max(g.speed || 0, 1);
    return n.dist <= (mine === 'roll' ? rollLead(n, sp) : lead(mine === 'block' ? 'lane' : mine, sp)) + 0.2 * sp;
  };

  if (readyS !== null) {
    while (true) {
      const g = await read();
      if (!g || !g.pos) { stall = 'window.__GAME__ vanished or has no pos'; break; }
      const d = distOf(g);
      samples.push({ d, fps: g.fps, draws: g.draws, tris: g.tris, speed: g.speed });
      if (g.over) {
        diedAt = d;
        await sleep(300);
        await shoot(g, d, `DEAD at ${d.toFixed(0)} m`);
        say(`${d.toFixed(1).padStart(6)} m  over=true: the player died`);
        break;
      }
      const lane = laneOf(g);
      if (shotIdx < SHOTS.length && d >= SHOTS[shotIdx] && (!imminent(g, d, lane) || d >= SHOTS[shotIdx] + 6)) {
        await shoot(g, d, ''); shotIdx++;
        if (shotIdx >= SHOTS.length) break;
      }
      if (!g.hasNext) {
        if (!noNextSaid) { noNextSaid = true; noNext = true; say('no __GAME__.next: driving straight with no steering, no jumps, no rolls (see tools/GATE_CONTRACT.md)'); }
      } else {
        const sp = Math.max(g.speed || 0, 1);
        const n = g.next;
        // a lane change still in flight (two lanes over): second swipe once the first has settled
        if (plan) {
          if (lane === plan.target) plan = null;
          else if (settled(g, lane)) {
            const dir = plan.target > lane ? 'left' : 'right';   // screen mirror: lane +1 is on the LEFT (GATE_CONTRACT)
            await swipe(dir);
            say(`${d.toFixed(1).padStart(6)} m  swipe ${dir}   second step toward lane ${plan.target} (speed ${sp.toFixed(1)})`);
          }
        } else if (n && typeof n.dist === 'number') {
          const key = rowKey(g, d);
          const done = acted.get(key) || { lane: false, clear: false };
          const lanes = Array.isArray(n.lanes) ? n.lanes : [null, null, null].map((_, i) => (n.lane === i - 1 ? n.kind : null));
          const mine = lanes[lane + 1] || null;
          if (mine === 'jump' && !done.clear && n.dist <= lead('jump', sp)) {
            done.clear = true; acted.set(key, done);
            const ms = await swipe('up');
            say(`${d.toFixed(1).padStart(6)} m  swipe up     jump ${n.type || 'obstacle'} in lane ${lane} at ${n.dist.toFixed(1)} m (speed ${sp.toFixed(1)}, lead ${lead('jump', sp).toFixed(1)}, gesture ${ms} ms)`);
          } else if (mine === 'roll' && !done.clear && n.dist <= rollLead(n, sp)) {
            done.clear = true; acted.set(key, done);
            const ms = await swipe('down');
            say(`${d.toFixed(1).padStart(6)} m  swipe down   roll under ${n.type || 'obstacle'} in lane ${lane} at ${n.dist.toFixed(1)} m, row ${rowLen(n)} m long (speed ${sp.toFixed(1)}, lead ${rollLead(n, sp).toFixed(1)}, gesture ${ms} ms)`);
          } else if (mine === 'block' && !done.lane && n.dist <= lead('lane', sp)) {
            done.lane = true; acted.set(key, done);
            const coinLane = g.coin && Number.isInteger(g.coin.lane) ? g.coin.lane : null;
            const score = (L) => (lanes[L + 1] === null ? 0 : lanes[L + 1] === 'block' ? 100 : 10) + Math.abs(L - lane) * 2 + (L === coinLane ? -1 : 0) + Math.abs(L) * 0.5;
            const target = [-1, 0, 1].filter((L) => L !== lane).sort((a, b) => score(a) - score(b))[0];
            const dir = target > lane ? 'left' : 'right';
            const ms = await swipe(dir);
            if (Math.abs(target - lane) > 1) plan = { key, target };
            say(`${d.toFixed(1).padStart(6)} m  swipe ${dir.padEnd(5)}  ${n.type || 'obstacle'} blocks lane ${lane} at ${n.dist.toFixed(1)} m; lanes [${lanes.map((k) => k || '-').join(' ')}] -> lane ${target} (speed ${sp.toFixed(1)}, lead ${lead('lane', sp).toFixed(1)}, gesture ${ms} ms)`);
          } else if (mine === null && g.coin && Number.isInteger(g.coin.lane) && g.coin.lane !== lane && Math.abs(g.coin.lane - lane) === 1
            && g.coin.dist <= lead('coin', sp) && (coinLock === null || d > coinLock) && settled(g, lane)
            && (lanes[g.coin.lane + 1] === null || n.dist > g.coin.dist + 0.8 * sp)) {
            coinLock = d + g.coin.dist + 1;
            const dir = g.coin.lane > lane ? 'left' : 'right';
            await swipe(dir);
            say(`${d.toFixed(1).padStart(6)} m  swipe ${dir.padEnd(5)}  coin in lane ${g.coin.lane} at ${g.coin.dist.toFixed(1)} m (speed ${sp.toFixed(1)})`);
          }
        } else if (g.coin && Number.isInteger(g.coin.lane) && g.coin.lane !== lane && Math.abs(g.coin.lane - lane) === 1
          && g.coin.dist <= lead('coin', sp) && (coinLock === null || d > coinLock) && settled(g, lane)) {
          coinLock = d + g.coin.dist + 1;
          const dir = g.coin.lane > lane ? 'left' : 'right';
          await swipe(dir);
          say(`${d.toFixed(1).padStart(6)} m  swipe ${dir.padEnd(5)}  coin in lane ${g.coin.lane} at ${g.coin.dist.toFixed(1)} m, road clear (speed ${sp.toFixed(1)})`);
        }
      }
      if (d > lastD + 0.05) { lastD = d; lastProgress = Date.now(); }
      else if (Date.now() - lastProgress > STALL_MS) { stall = `distance stuck at ${d.toFixed(1)} m for ${STALL_MS / 1000} s`; break; }
      if (Date.now() > wallCap) { stall = `wall-clock cap hit at ${d.toFixed(1)} m`; break; }
      await sleep(POLL_MS);
    }
  }
  const last = (await read()) || {};
  const finalD = last.pos ? distOf(last) : 0;

  if (CLIP && readyS !== null) { try { await cdp.send('Page.stopScreencast'); } catch {} }
  await Promise.race([Promise.allSettled(pending), sleep(4000)]);
  await page.close();

  // 5. filmstrip: one row of captioned frames, verified to contain image data, plus a mean-luma per frame
  const strip = path.join(outDir, 'filmstrip.png');
  let stripProblem = '', lumas = [];
  if (frames.length) {
    const cols = DESKTOP ? Math.min(3, frames.length) : frames.length;
    const w = DESKTOP ? 560 : Math.max(220, Math.min(300, Math.floor(1900 / cols)));
    const fpsNote = software ? ' (software)' : '';
    const html = `<!doctype html><meta charset="utf-8"><title>gate</title>
<style>body{margin:0;background:#101014;color:#d8d8e0;font:12px ui-monospace,Menlo,monospace;padding:10px}
h1{font-size:13px;font-weight:400;margin:0 0 8px;color:#9aa}
.g{display:grid;grid-template-columns:repeat(${cols},${w}px);gap:8px}
figure{margin:0}img{width:${w}px;display:block;background:#000}
figcaption{padding:5px 2px;line-height:1.45;color:#cfcfd8;white-space:pre}</style>
<h1>${label}  ·  ${VIEWPORT.width}x${VIEWPORT.height}@${VIEWPORT.deviceScaleFactor}x ${DESKTOP ? 'desktop' : 'phone'}  ·  seed ${SEED}  ·  run ${runNo}  ·  ${gpu || 'unknown renderer'}  ·  ${new Date().toISOString()}</h1>
<div class="g">${frames.map((f, i) => `<figure><img src="${path.basename(f.file)}"><figcaption>f${i}  ${f.d.toFixed(0)} m  ${f.zone || ''}${f.note ? '  ' + f.note : ''}
${f.speed} m/s  ${f.fps} fps${fpsNote}
${f.draws} draws  ${Number(f.tris || 0).toLocaleString('en-US')} tris${f.hero != null ? '  hero ' + f.hero + '%' : ''}</figcaption></figure>`).join('')}</div>`;
    fs.writeFileSync(path.join(outDir, 'strip.html'), html);
    if (deferredBlur.length) {
      process.stdout.write(`  averaging ${deferredBlur.length} shutter frame(s)... `);
      for (const d of deferredBlur) {
        try { await averagePNGs(d.subs, d.file); } catch (e) { console.log(`(f failed: ${e.message.slice(0, 40)}) `); }
      }
      console.log('done');
    }
    const sp = await browser.newPage();
    await sp.setViewport({ width: cols * (w + 8) + 24, height: 400, deviceScaleFactor: 1 });
    await sp.goto('file://' + path.join(outDir, 'strip.html'), { waitUntil: 'networkidle0' });
    const check = await sp.evaluate(async () => {
      const imgs = [...document.images];
      await Promise.all(imgs.map((i) => (i.complete ? null : new Promise((r) => { i.onload = i.onerror = r; }))));
      const c = document.createElement('canvas'); const ctx = c.getContext('2d', { willReadFrequently: true });
      const lumas = imgs.map((i) => {
        if (!i.naturalWidth) return null;
        c.width = 96; c.height = Math.max(1, Math.round(96 * i.naturalHeight / i.naturalWidth));
        ctx.drawImage(i, 0, 0, c.width, c.height);
        try {
          const p = ctx.getImageData(0, 0, c.width, c.height).data; let s = 0;
          for (let k = 0; k < p.length; k += 4) s += 0.2126 * p[k] + 0.7152 * p[k + 1] + 0.0722 * p[k + 2];
          return s / (p.length / 4);
        } catch { return null; }
      });
      return { total: imgs.length, loaded: imgs.filter((i) => i.naturalWidth > 0).length, lumas };
    });
    lumas = check.lumas;
    if (!check.total || check.loaded !== check.total) stripProblem = `the filmstrip is empty: ${check.loaded} of ${check.total} frames loaded into it (the frames in ${outDir} may still be fine)`;
    await sp.screenshot({ path: strip, fullPage: true });
    await sp.close();
    // A strip that is all one flat colour is six pictures of nothing, which is the failure this checks for.
    if (!stripProblem && lumas.every((l) => l !== null && l < 2)) stripProblem = 'every frame in the filmstrip is black (mean luma < 2): the game rendered nothing';
  }

  // 6. clip encode
  let clipNote = '';
  if (CLIP && clipFrames > 1) {
    const secs = Math.max(0.5, (clipT1 - clipT0) || 1);
    const rate = Math.max(1, Math.min(120, clipFrames / secs));
    if (fs.existsSync(FFMPEG)) {
      try {
        execFileSync(FFMPEG, ['-y', '-loglevel', 'error', '-framerate', rate.toFixed(2), '-i', path.join(clipDir, 'f%05d.jpg'),
          '-vf', 'fps=24,scale=trunc(iw/2)*2:trunc(ih/2)*2', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '26', path.join(outDir, 'clip.mp4')], { stdio: 'pipe' });
        clipNote = `${path.join(outDir, 'clip.mp4')}  (${clipFrames} frames captured at ${rate.toFixed(1)}/s, encoded at 24 fps, HUD hidden)`;
      } catch (e) { clipNote = `ffmpeg failed: ${String(e.message).slice(0, 120)}; the JPEG frames are in ${clipDir}`; }
    } else clipNote = `ffmpeg not found at ${FFMPEG}; ${clipFrames} JPEG frames are in ${clipDir}, not encoded`;
  } else if (CLIP) clipNote = 'no screencast frames arrived';

  // 7. verdict
  const nums = (k) => samples.map((s) => Number(s[k])).filter((n) => Number.isFinite(n) && n > 0);
  const peakDraws = nums('draws').length ? Math.max(...nums('draws')) : null;
  const peakTris = nums('tris').length ? Math.max(...nums('tris')) : null;
  const fpsSorted = nums('fps').sort((a, b) => a - b);
  const medianFps = fpsSorted.length ? fpsSorted[Math.floor(fpsSorted.length / 2)] : null;
  const minFps = fpsSorted.length ? fpsSorted[0] : null;
  const mb = bodyBytes / 1e6;
  const coins = Number(last.coins ?? 0), jumps = Number(last.jumps ?? 0), rolls = Number(last.rolls ?? 0);
  const hasCounters = typeof last.jumps === 'number' && typeof last.rolls === 'number';
  const distance = Math.max(finalD, diedAt ?? 0, ...samples.map((s) => s.d));

  const fails = [];
  if (readyS === null) fails.push(loadNote || 'the game never signalled __READY__');
  if (startFallback) fails.push(`the real start control did not start the game (${startNote}); it was started through __START__() instead, which a player cannot do`);
  if (noNext) fails.push('no __GAME__.next telemetry, so the gate could not steer: expose next/coin/jumps/rolls as in tools/GATE_CONTRACT.md');
  if (diedAt !== null && diedAt < BUDGET.DEATH_M) fails.push(`the player died at ${diedAt.toFixed(0)} m, before ${BUDGET.DEATH_M} m`);
  if (stall) fails.push(stall);
  if (distance < BUDGET.DIST_M) fails.push(`distance ${distance.toFixed(0)} m, needs ${BUDGET.DIST_M} m`);
  if (!hasCounters) fails.push('no __GAME__.jumps / __GAME__.rolls counters, so the gate cannot prove a jump or a roll happened');
  else { if (jumps < 1) fails.push('no jump was performed (jumps = 0)'); if (rolls < 1) fails.push('no roll was performed (rolls = 0)'); }
  if (!(coins > 0)) fails.push(`no coins collected (coins = ${last.coins ?? 'not exposed'})`);
  if (peakDraws === null) fails.push('__GAME__.draws not exposed'); else if (peakDraws > BUDGET.DRAWS) fails.push(`${peakDraws} draw calls, budget ${BUDGET.DRAWS}`);
  if (peakTris === null) fails.push('__GAME__.tris not exposed'); else if (peakTris > BUDGET.TRIS) fails.push(`${peakTris.toLocaleString('en-US')} triangles, budget ${BUDGET.TRIS.toLocaleString('en-US')}`);
  if (FOURG && readyS !== null && readyS > BUDGET.READY_S) fails.push(`ready in ${readyS.toFixed(1)} s under 4G, budget ${BUDGET.READY_S} s`);
  if (FOURG && mb >= BUDGET.MB) fails.push(`${mb.toFixed(2)} MB transferred, budget ${BUDGET.MB} MB`);
  if (missing.length) fails.push(`${missing.length} file(s) 404ed, starting with ${missing[0]}`);
  if (outside.size) fails.push(`${outside.size} request(s) reached outside the game folder: ${[...outside].slice(0, 3).join(', ')}`);
  if (external.size) fails.push(`file(s) loaded from other hosts: ${[...external].join(', ')} (a folder that leans on another host is not a folder)`);
  if (errors.length) fails.push(`${errors.length} console error(s): ${errors[0]}`);
  if (stripProblem) fails.push(stripProblem);

  const pf = (ok) => (ok ? 'PASS' : 'FAIL');
  const fmt = (n) => (n === null || n === undefined ? 'not exposed' : Number(n).toLocaleString('en-US'));
  console.log(`\n=== MIDNIGHT DASH GATE  run ${runNo} ===`);
  console.log(`game            ${target}`);
  console.log(`viewport        ${VIEWPORT.width}x${VIEWPORT.height} @${VIEWPORT.deviceScaleFactor}x ${DESKTOP ? 'desktop, click and keys' : 'phone, real touch'}   seed ${SEED}`);
  console.log(`network         ${FOURG ? `4G: ${NET.downMbps} Mbps down, ${NET.upMbps} Mbps up, ${NET.latencyMs} ms, CPU ${NET.cpuSlowdown}x slower` : 'unshaped (pass --4g for the load budget)'}`);
  console.log(`ready           ${readyS === null ? 'never' : readyS.toFixed(1) + ' s'}   budget ${BUDGET.READY_S} s${FOURG ? '   ' + pf(readyS !== null && readyS <= BUDGET.READY_S) : '   (not judged without --4g)'}`);
  console.log(`weight          ${mb.toFixed(2)} MB   budget ${BUDGET.MB} MB${FOURG ? '   ' + pf(mb < BUDGET.MB) : '   (not judged without --4g)'}`);
  console.log(`started         ${startHow || 'no'}   ${pf(!!startHow && !startFallback)}`);
  console.log(`steering        ${noNext ? 'none: no __GAME__.next   FAIL' : hasCounters || decisions.length > 1 ? decisions.length - 1 + ' decision(s) from __GAME__.next   PASS' : 'no decisions needed'}`);
  console.log(`distance        ${distance.toFixed(0)} m   needs ${BUDGET.DIST_M} m   ${pf(distance >= BUDGET.DIST_M)}`);
  console.log(`death           ${diedAt === null ? 'none' : 'at ' + diedAt.toFixed(0) + ' m'}   must be after ${BUDGET.DEATH_M} m   ${pf(diedAt === null || diedAt >= BUDGET.DEATH_M)}`);
  console.log(`coins           ${fmt(last.coins)}   needs > 0   ${pf(coins > 0)}`);
  console.log(`jumps / rolls   ${hasCounters ? `${jumps} / ${rolls}` : 'not exposed'}   needs ≥ 1 each   ${pf(hasCounters && jumps >= 1 && rolls >= 1)}`);
  console.log(`peak draws      ${fmt(peakDraws)}   budget ${BUDGET.DRAWS}   ${pf(peakDraws !== null && peakDraws <= BUDGET.DRAWS)}`);
  console.log(`peak tris       ${fmt(peakTris)}   budget ${BUDGET.TRIS.toLocaleString('en-US')}   ${pf(peakTris !== null && peakTris <= BUDGET.TRIS)}`);
  console.log(`fps             median ${fmt(medianFps)}, min ${fmt(minFps)}   ${software ? 'SOFTWARE rendering (SwiftShader): reported, not a verdict' : (gpu || 'GPU') + ': reported, never gated'}`);
  console.log(`404s            ${missing.length}   ${pf(!missing.length)}${missing.length ? '   ' + missing[0] : ''}`);
  console.log(`errors          ${errors.length}   ${pf(!errors.length)}${errors.length ? '   ' + errors[0] : ''}`);
  console.log(`outside folder  ${outside.size || external.size ? [...outside, ...external].slice(0, 3).join(', ') + '   FAIL' : 'none   PASS'}${cdn.size ? '   (cdn, warning only: ' + [...cdn].join(', ') + ')' : ''}`);
  console.log(`frames          ${frames.length} at ${frames.map((f) => f.d.toFixed(0)).join(', ')} m   filmstrip ${strip}`);
  if (clipNote) console.log(`clip            ${clipNote}`);
  console.log(`RESULT: ${fails.length ? 'FAIL: ' + fails[0] : 'PASS'}`);
  if (fails.length > 1) for (const f of fails.slice(1)) console.log(`  also: ${f}`);
  console.log('=== END ===');

  fs.writeFileSync(path.join(outDir, 'decisions.log'), decisions.join('\n') + '\n');
  fs.writeFileSync(path.join(outDir, 'verdict.json'), JSON.stringify({
    game: target, utc: new Date().toISOString(), run: runNo, seed: SEED, viewport: VIEWPORT, desktop: DESKTOP, fourg: FOURG, network: FOURG ? NET : null,
    budgets: BUDGET, lead: LEAD, gesture_s: GESTURE_S, ready_s: readyS, mb: Number(mb.toFixed(3)), body_bytes: bodyBytes, started: startHow, start_fallback: startFallback,
    no_next: noNext, distance_m: Number(distance.toFixed(1)), died_at_m: diedAt, stall: stall || null, coins, jumps, rolls, deaths: last.deaths ?? null,
    score: last.score ?? null, peak_draws: peakDraws, peak_tris: peakTris, median_fps: medianFps, min_fps: minFps, software, renderer: gpu,
    frames: frames.map((f, i) => ({ ...f, file: path.basename(f.file), luma: lumas[i] ?? null })), decisions, missing, errors,
    outside: [...outside], external: [...external], cdn: [...cdn], clip: clipNote || null, fails, result: fails.length ? 'FAIL' : 'PASS',
  }, null, 2));
  return { fails, frames, lumas };
}

// ------------------------------------------------------------------ runs
const results = [];
try {
  for (let k = 1; k <= RUNS; k++) results.push(await runOnce(k, k === 1 ? OUT : path.join(OUT, `run${k}`)));
} catch (e) {
  console.error(`gate crashed: ${e.stack || e}`);
  exitCode = 2;
}
await cleanup();

if (RUNS > 1 && results.length > 1) {
  // The noise floor: the same statistic on the same frame index across runs. Any claim smaller than the spread is not a claim.
  console.log(`\nnoise floor over ${results.length} runs (mean luma 0..255 per frame index, phone frames are the measurement frames):`);
  const n = Math.max(...results.map((r) => r.frames.length));
  for (let i = 0; i < n; i++) {
    const vals = results.map((r) => r.lumas[i]).filter((v) => typeof v === 'number');
    if (!vals.length) continue;
    const s = [...vals].sort((a, b) => a - b);
    const med = s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
    const at = results.find((r) => r.frames[i])?.frames[i].d;
    console.log(`  f${i} @${at?.toFixed(0)} m   median ${med.toFixed(1)}   spread ${(s[s.length - 1] - s[0]).toFixed(1)}   (${vals.map((v) => v.toFixed(1)).join(' ')})${vals.length < results.length ? `   only ${vals.length} of ${results.length} runs reached it` : ''}`);
  }
}
const failedRuns = results.filter((r) => r.fails.length).length;
if (failedRuns) { console.log(`\n${failedRuns} of ${results.length} run(s) failed.`); exitCode = exitCode || 1; }
else if (results.length) console.log(`\nall ${results.length} run(s) passed. now LOOK at the filmstrip.`);
process.exit(exitCode);
