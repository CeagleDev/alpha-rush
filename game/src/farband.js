/**
 * farband.js — E1. The distant skyline: ONE baked group (≤ 6 meshes, one per material) of dark blocks
 * 15–40 m tall with small emissive window boxes, in a ring 120–300 m from the player (angles within
 * ±110° of +Z, so it fills the view down cross-streets and everywhere on the expressway). It follows
 * the player in z, casts no shadows, has no colliders. Built once at init from a fixed seed.
 * exports: init(ctx), update(dt), stats()
 */
import * as THREE from 'three';
import { bakeStatic } from '../assetlib.js?v=202609240459';
import { mulberry32, hash32 } from './chunks.js?v=202609240459';

let ctx = null, group = null, info = { draws: 0, tris: 0, blocks: 0, windows: 0 };

export async function init(c) {
  ctx = c;
  const rng = mulberry32(hash32('midnight-dash/farband'));
  const g = new THREE.Group();
  const dark = new THREE.MeshStandardMaterial({ color: 0x212841, roughness: 1, metalness: 0 });
  const winMats = [
    [0.62, new THREE.MeshStandardMaterial({ color: 0x110f12, emissive: 0xe5b055, emissiveIntensity: 1.8, roughness: 0.35 })],
    [0.22, new THREE.MeshStandardMaterial({ color: 0x110f12, emissive: 0xd8ae70, emissiveIntensity: 1.4, roughness: 0.35 })],
    [0.16, new THREE.MeshStandardMaterial({ color: 0x110f12, emissive: 0x9accf2, emissiveIntensity: 1.6, roughness: 0.35 })],
  ];
  const signMats = [new THREE.MeshStandardMaterial({ color: 0x110f12, emissive: 0xb8302a, emissiveIntensity: 2.2, roughness: 0.35 }),
    new THREE.MeshStandardMaterial({ color: 0x110f12, emissive: 0x40559f, emissiveIntensity: 2.2, roughness: 0.35 })];
  const pickWin = () => { let r = rng(); for (const [p, m] of winMats) { if (r < p) return m; r -= p; } return winMats[0][1]; };
  const winGeo = new THREE.BoxGeometry(1.0, 1.4, 0.2);
  let blocks = 0, windows = 0;
  const N = 72;
  for (let i = 0; i < N; i++) {
    const ang = (rng() * 2 - 1) * (110 * Math.PI / 180);
    const r = 120 + rng() * 180;
    const cx = Math.sin(ang) * r, cz = Math.cos(ang) * r;
    const w = 12 + rng() * 18, d = 12 + rng() * 18;
    const h = 15 + rng() * 25 + (r - 120) * 0.05;   // further → taller, so the skyline keeps its height
    const box = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), dark);
    box.position.set(cx, h / 2, cz);
    g.add(box); blocks++;
    // windows on the two faces most turned toward the player
    const faces = [
      { n: [0, -1], x: 0, z: -d / 2 - 0.1, axis: 'x', len: w },
      { n: [0, 1], x: 0, z: d / 2 + 0.1, axis: 'x', len: w },
      { n: [-1, 0], x: -w / 2 - 0.1, z: 0, axis: 'z', len: d },
      { n: [1, 0], x: w / 2 + 0.1, z: 0, axis: 'z', len: d },
    ].map((f) => ({ ...f, dot: -(f.n[0] * cx + f.n[1] * cz) / r })).sort((a, b) => b.dot - a.dot).slice(0, 2);
    for (const f of faces) {
      if (f.dot < 0.15) continue;
      const cols = Math.min(10, Math.floor(f.len / 2.6)), rows = Math.min(11, Math.floor(h / 3.3));
      const lit = 0.3 + rng() * 0.25;
      for (let rr = 0; rr < rows; rr++) for (let cc = 0; cc < cols; cc++) {
        if (rng() > lit) continue;
        const m = new THREE.Mesh(winGeo, pickWin());
        const along = (cc - (cols - 1) / 2) * 2.6;
        m.position.set(cx + (f.axis === 'x' ? along : f.x), 2.5 + rr * 3.3, cz + (f.axis === 'z' ? along : f.z));
        if (f.axis === 'z') m.rotation.y = Math.PI / 2;
        g.add(m); windows++;
      }
    }
    if (rng() < 0.12) {
      const s = new THREE.Mesh(new THREE.BoxGeometry(Math.min(w * 0.7, 10), 2.2, 0.6), signMats[rng() < 0.6 ? 0 : 1]);
      s.position.set(cx, h + 1.4, cz); g.add(s);
    }
  }
  g.updateMatrixWorld(true);
  group = bakeStatic(g);
  group.name = 'farband';
  let tris = 0, draws = 0;
  group.traverse((o) => { if (o.isMesh) { o.castShadow = false; o.receiveShadow = false; o.frustumCulled = true; draws++; const p = o.geometry.attributes.position; tris += (o.geometry.index ? o.geometry.index.count : p.count) / 3; } });
  info = { draws, tris, blocks, windows };
  ctx.scene.add(group);
}

export function update() {
  if (!group || !ctx) return;
  const st = ctx.state;
  group.position.z = Number.isFinite(st.z) ? st.z : (st.distance || 0);
}
/** Day: the skyline is concrete in haze, not a row of dark cut-outs (lighting.js calls this as the day moves). */
let darkMats = null;
const DAY_GAIN = [21, 16.5, 7.4];   // linear 0x212841 -> 0x9aa0a8, per channel (the colour may live in the vertices, so it is a gain)
export function setDay(d) {
  if (!group) return;
  if (!darkMats) { darkMats = []; group.traverse((o) => { const m = o.isMesh && o.material; if (m && m.color && (!m.emissive || m.emissive.getHex() === 0)) { darkMats.push({ m, base: m.color.clone() }); } }); }
  for (const { m, base } of darkMats) m.color.setRGB(base.r * (1 + (DAY_GAIN[0] - 1) * d), base.g * (1 + (DAY_GAIN[1] - 1) * d), base.b * (1 + (DAY_GAIN[2] - 1) * d));
}
export function stats() { return info; }
