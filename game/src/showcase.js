/**
 * showcase.js — the live hero on the home screen: the selected character, idling and turning a full 360,
 * rendered into the card's <canvas id="h-turntable"> by a second, tiny renderer (its own scene and lights,
 * nothing shared with the run's rig except the asset loader). Owner (2026-09-24): "the player selection
 * window should show the players, doing a bit of body moves and rotating in 360".
 *
 *   init(ctx)    creates the renderer lazily on the first frame the canvas is visible
 *   update(dt)   only while #home is on: follows home.selected(), idles the hero, turns him, renders
 *
 * Cost: the canvas is ~340 x 220 CSS px at DPR <= 2, one hero (~16k tris), three lights, no post; it
 * renders only while the home screen is showing, so it costs the run nothing.
 */
import * as THREE from 'three';
import { RunnerAnim, mergePerJoint } from './anim.js?v=202609240703';

let ctx = null, canvas = null, renderer = null, scene = null, cam = null, pivot = null, hero = null, heroName = '', anim = null;
let t = 0, turn = 0, loading = null, failed = new Set();
const cache = new Map();

function build() {
  canvas = document.getElementById('h-turntable');
  if (!canvas) return false;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' }); }
  catch (e) { console.warn('[showcase] no second renderer', e && e.message); return false; }
  renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1));
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.15;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  scene = new THREE.Scene();
  cam = new THREE.PerspectiveCamera(30, 1.5, 0.1, 20);
  cam.position.set(0, 1.05, 3.9); cam.lookAt(0, 0.82, 0);
  const key = new THREE.DirectionalLight(0xfff1dc, 3.2); key.position.set(1.6, 2.6, 2.2); scene.add(key);
  const rim = new THREE.DirectionalLight(0x22e8ff, 2.4); rim.position.set(-2.2, 1.8, -2.0); scene.add(rim);
  const fill = new THREE.HemisphereLight(0x3d5c92, 0xff2d95, 0.9); scene.add(fill);
  const disc = new THREE.Mesh(new THREE.CircleGeometry(0.75, 48), new THREE.MeshBasicMaterial({ color: 0x22e8ff, transparent: true, opacity: 0.16 }));
  disc.rotation.x = -Math.PI / 2; disc.position.y = 0.005; scene.add(disc);
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.72, 0.78, 48), new THREE.MeshBasicMaterial({ color: 0x22e8ff, transparent: true, opacity: 0.6, side: THREE.DoubleSide }));
  ring.rotation.x = -Math.PI / 2; ring.position.y = 0.01; scene.add(ring);
  pivot = new THREE.Group(); scene.add(pivot);
  return true;
}

async function load(name) {
  if (cache.has(name)) return cache.get(name);
  let g = null;
  try { g = await ctx.assets.get(name, { keepHierarchy: true }); } catch (e) { g = null; }
  if (!g || !g.userData || !g.userData.joints) { failed.add(name); return null; }
  mergePerJoint(THREE, g);
  cache.set(name, g);
  return g;
}

export async function init(c) { ctx = c; }

export function update(dt = 0.016) {
  if (!ctx) return;
  const home = document.getElementById('home');
  if (!home || !home.classList.contains('on')) return;
  if (!renderer && !build()) return;
  const H = ctx.modules && ctx.modules.home;
  const sel = H && H.selected ? H.selected() : null;
  const want = (sel && sel.asset) || 'runner';
  if (want !== heroName && !loading && !failed.has(want)) {
    loading = load(want).then((g) => {
      loading = null;
      if (!g) return;
      if (hero) pivot.remove(hero);
      hero = g; heroName = want; pivot.add(hero); anim = new RunnerAnim(THREE, hero); t = 0;
    });
  }
  // size follows the CSS box
  const w = canvas.clientWidth || 320, h = canvas.clientHeight || 200;
  if (canvas.width !== Math.round(w * renderer.getPixelRatio()) || canvas.height !== Math.round(h * renderer.getPixelRatio())) { renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); }
  t += dt; turn += dt * 0.55;                     // a full turn every ~11 s
  if (hero && anim) {
    pivot.rotation.y = turn;
    // idle: breathing + a slow look-around, with a light "ready" bounce every few seconds
    const bounce = Math.max(0, Math.sin(t * 0.9)) ** 8;
    anim.update(dt, { mode: 'idle', t, speed: 0, laneVel: 0, groundPitch: 0 });
    hero.position.y = 0.02 * Math.sin(t * 1.6) + 0.06 * bounce;
  }
  renderer.render(scene, cam);
}
