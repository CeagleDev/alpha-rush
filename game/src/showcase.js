/**
 * showcase.js — the live hero on the RUNNERS page: full-screen, facing the player, greeting them.
 *
 * Owner (2026-09-24): "I want the characters to wave at the player, not just a turntable of a figurine."
 * So: the hero stands facing the camera, shifts his weight, breathes, looks around, and every few seconds
 * raises a hand and WAVES (a real shoulder/elbow/wrist wave with a head tilt and a little bounce), then
 * settles. He turns a little to show the outfit but never away from the player. Changing hero, outfit or
 * colourway (state.character / state.outfit / state.palette, written by home.js) rebuilds him in place.
 *
 *   init(ctx)    remembers ctx; the second renderer is created lazily on the first visible frame
 *   update(dt)   only while #home is on (main.js calls it every frame): follow the selection, animate, render
 *
 * Cost: one hero (<= 26k tris), three lights, no post, only while the home screen shows.
 */
import * as THREE from 'three';
import { mergePerJoint } from './anim.js?v=202609241255';

let ctx = null, canvas = null, renderer = null, scene = null, cam = null, pivot = null, hero = null, heroKey = '', J = null, rest = null;
let t = 0, wavePhase = -1, nextWave = 2.2, loading = null;
const failed = new Set(), cache = new Map();

function build() {
  canvas = document.getElementById('h-turntable');
  if (!canvas) return false;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' }); }
  catch (e) { console.warn('[showcase] no second renderer', e && e.message); return false; }
  renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1));
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.2;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  scene = new THREE.Scene();
  cam = new THREE.PerspectiveCamera(28, 1, 0.1, 20);
  const key = new THREE.DirectionalLight(0xfff1dc, 3.4); key.position.set(1.4, 2.8, 2.6); scene.add(key);
  const rim = new THREE.DirectionalLight(0x22e8ff, 2.6); rim.position.set(-2.4, 2.0, -1.6); scene.add(rim);
  const rim2 = new THREE.DirectionalLight(0xff2d95, 1.4); rim2.position.set(2.4, 0.8, -2.2); scene.add(rim2);
  scene.add(new THREE.HemisphereLight(0x3d5c92, 0x2a1a30, 1.1));
  const disc = new THREE.Mesh(new THREE.CircleGeometry(0.9, 48), new THREE.MeshBasicMaterial({ color: 0x22e8ff, transparent: true, opacity: 0.10 }));
  disc.rotation.x = -Math.PI / 2; disc.position.y = 0.004; scene.add(disc);
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.86, 0.92, 48), new THREE.MeshBasicMaterial({ color: 0x22e8ff, transparent: true, opacity: 0.5, side: THREE.DoubleSide }));
  ring.rotation.x = -Math.PI / 2; ring.position.y = 0.01; scene.add(ring);
  pivot = new THREE.Group(); scene.add(pivot);
  return true;
}

async function load(name, v) {
  const key = name + '#' + (v.outfit || '') + '/' + (v.palette || '');
  if (cache.has(key)) return cache.get(key);
  let g = null;
  try { g = await ctx.assets.get(name, { keepHierarchy: true, variant: v.outfit || v.palette ? v : undefined }); } catch (e) { g = null; }
  if (!g || !g.userData || !g.userData.joints) { failed.add(key); return null; }
  mergePerJoint(THREE, g);
  cache.set(key, g);
  return g;
}

export async function init(c) { ctx = c; }

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const smooth = (x) => { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); };

function pose(dt) {
  if (!J || !rest) return;
  const set = (n, rx, ry, rz) => { const o = J[n], r = rest[n]; if (!o || !r) return; o.rotation.set(r.x + rx, r.y + ry, r.z + rz); };
  // breathing + weight shift + look-around
  const br = Math.sin(t * 1.7) * 0.02, sway = Math.sin(t * 0.55) * 0.05;
  set('hips', 0, 0, sway * 0.6); set('spine', 0.03 + br, 0, -sway * 0.4); set('chest', 0.02 + br * 0.6, Math.sin(t * 0.3) * 0.05, 0);
  set('head', -0.04 + Math.sin(t * 0.45) * 0.05, Math.sin(t * 0.32) * 0.18, Math.sin(t * 0.27) * 0.04);
  set('l_hip', 0, 0, 0.04); set('r_hip', 0, 0, -0.04);
  set('l_knee', 0.05 + Math.max(0, sway) * 0.3, 0, 0); set('r_knee', 0.05 + Math.max(0, -sway) * 0.3, 0, 0);
  set('l_shoulder', 0.05, 0, 0.12 + br); set('l_elbow', -0.25, 0, 0);
  // THE WAVE: right arm up (raise out to the side, forearm up), hand waving side to side, head tilts toward it
  if (wavePhase >= 0) {
    wavePhase += dt;
    const T = 2.6, u = wavePhase / T;
    const up = smooth(u / 0.22) * (1 - smooth((u - 0.8) / 0.2));          // arm goes up over 0.57 s, down over the last 0.5 s
    const wag = Math.sin(wavePhase * 9) * 0.45 * smooth((u - 0.18) / 0.15) * (1 - smooth((u - 0.75) / 0.15));
    // shoulder: swing out to the side (+z rot for the right arm raises it away from the body), forearm folded up
    // THE WAVE, done with the arm's own axes: the upper arm swings OUT to the side (shoulder z; the right
    // arm raises with -z per the jointHints), and the forearm folds UP beside the head by rotating the elbow
    // about z as well (with the upper arm pointing sideways, the elbow's local z is still the world's
    // forward axis, so a z fold lifts the forearm in the body's plane, not over the head). The wag rides
    // on the same axis, which swings the hand left-right as seen from the front. The first version folded
    // the elbow about x, which put the hand over the crown: "the wave thing is broken" (owner).
    set('r_shoulder', -0.12 * up, 0.05 * up, -1.5 * up); set('r_elbow', 0, 0, (-1.7 + wag) * up);
    set('head', -0.04 + 0.05 * up, 0.18 * up, -0.16 * up);
    set('chest', 0.02, 0.10 * up, 0.06 * up);
    if (hero) hero.position.y = 0.05 * Math.sin(Math.min(1, u / 0.3) * Math.PI) * up;
    if (wavePhase >= T) { wavePhase = -1; nextWave = t + 3.2 + Math.random() * 2.5; }
  } else {
    set('r_shoulder', 0.05, 0, -0.12 - br); set('r_elbow', -0.25, 0, 0);
    if (hero) hero.position.y = 0.012 * Math.sin(t * 1.7);
    if (t >= nextWave) wavePhase = 0;
  }
}

export function update(dt = 0.016) {
  if (!ctx || /[?&]noshow=1/.test(location.search)) return;
  const home = document.getElementById('home');
  if (!home || !home.classList.contains('on')) return;
  if (!renderer && !build()) return;
  const st = ctx.state;
  const H = ctx.modules && ctx.modules.home;
  const sel = H && H.selected ? H.selected() : null;
  const name = (sel && sel.asset) || 'runner';
  const v = { outfit: st.outfit || '', palette: st.palette || '' };
  const key = name + '#' + v.outfit + '/' + v.palette;
  if (key !== heroKey && !loading && !failed.has(key)) {
    loading = load(name, v).then((g) => {
      loading = null;
      if (!g) return;
      if (hero) pivot.remove(hero);
      hero = g; heroKey = key; pivot.add(hero);
      J = hero.userData.joints || {}; rest = {}; for (const n of Object.keys(J)) rest[n] = J[n].rotation.clone();
      t = 0; wavePhase = 0; nextWave = 99;                              // greet on arrival
    });
  }
  const w = canvas.clientWidth || 320, h = canvas.clientHeight || 400;
  const pr = renderer.getPixelRatio();
  if (canvas.width !== Math.round(w * pr) || canvas.height !== Math.round(h * pr)) { renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); }
  // frame the whole figure whatever the box: distance from the vertical fov so 1.56 m + headroom fits
  const fovY = cam.fov * Math.PI / 180, need = 1.78;   // 1.56 m of hero plus a little headroom fills the box
  const dist = Math.max(2.6, (need / 2) / Math.tan(fovY / 2) * (cam.aspect < 0.55 ? 1 : 1) + 0.2);
  cam.position.set(0, 0.95, dist); cam.lookAt(0, 0.86, 0);
  t += dt;
  if (hero) {
    // faces the player; a slow +-25 degree turn shows the outfit's sides
    pivot.rotation.y = Math.sin(t * 0.35) * 0.42;
    pose(dt);
  }
  renderer.render(scene, cam);
}
