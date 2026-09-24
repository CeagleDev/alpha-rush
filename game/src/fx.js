/**
 * fx.js — the game's visible effects: pickup bursts, the runner's active power-up visuals, the surge aura.
 *
 *   init(ctx)      one additive Points pool (PARTICLES) + the runner attachments, all created once
 *   update(dt)     integrate particles; place the attachments on the runner; drive their pulse
 *   burst(x,y,z, color, n, speed)   spend n particles from the pool
 *
 * Owner (2026-09-24): "the power-ups picked up in the game should be visible and have a bit of animation".
 * Everything here is one draw call per element and no per-frame allocation. Colours are the pickups' ring
 * colours (powerups.js TYPES) so the burst matches what was picked up.
 */
import * as THREE from 'three';

const PARTICLES = 320;
let ctx = null, pts = null, pos = null, col = null, vel = null, life = null, alive = 0;
let magnetRing = null, magnetRing2 = null, x2Stars = null, sneakRing = null, aura = null, auraRing = null, trail = null, trailPos = null, trailHead = 0;
const _c = new THREE.Color();
/** A soft round sprite: without a map a Point draws as a hard square. */
function softDot() {
  const S = 64, cv = document.createElement('canvas'); cv.width = cv.height = S;
  const g = cv.getContext('2d'), grd = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  grd.addColorStop(0, 'rgba(255,255,255,1)'); grd.addColorStop(0.35, 'rgba(255,255,255,0.7)'); grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd; g.fillRect(0, 0, S, S);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t;
}

export async function init(c) {
  ctx = c;
  const g = new THREE.BufferGeometry();
  pos = new Float32Array(PARTICLES * 3); col = new Float32Array(PARTICLES * 3); vel = new Float32Array(PARTICLES * 3); life = new Float32Array(PARTICLES);
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));
  g.setAttribute('color', new THREE.BufferAttribute(col, 3).setUsage(THREE.DynamicDrawUsage));
  g.setDrawRange(0, 0);
  const dot = softDot();
  pts = new THREE.Points(g, new THREE.PointsMaterial({ map: dot, size: 0.13, vertexColors: true, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true, fog: false }));
  pts.frustumCulled = false; pts.name = 'fx.particles'; c.scene.add(pts);

  const add = (m, name) => { m.visible = false; m.name = name; m.renderOrder = 5; c.scene.add(m); return m; };
  const glow = (color, opacity) => new THREE.MeshBasicMaterial({ color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false });
  magnetRing = add(new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.035, 8, 48), glow(0xff5a4a, 0.85)), 'fx.magnet');
  magnetRing2 = add(new THREE.Mesh(new THREE.TorusGeometry(1.05, 0.02, 8, 48), glow(0xff8a7a, 0.45)), 'fx.magnet2');
  x2Stars = add(new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.05, 6, 5), glow(0xffd24a, 0.9)), 'fx.x2');
  sneakRing = add(new THREE.Mesh(new THREE.RingGeometry(0.25, 0.6, 32), glow(0x5af0d0, 0.7)), 'fx.sneak');
  sneakRing.rotation.x = -Math.PI / 2;
  aura = add(new THREE.Mesh(new THREE.SphereGeometry(1, 28, 18), glow(0x22e8ff, 0.07)), 'fx.aura');
  aura.scale.set(0.8, 1.15, 0.9);
  auraRing = add(new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.025, 8, 48), glow(0xff2d95, 0.55)), 'fx.auraRing');
  // the surge trail: a ribbon of 18 fading discs that follow where the runner has been
  const tg = new THREE.BufferGeometry(); trailPos = new Float32Array(18 * 3);
  tg.setAttribute('position', new THREE.BufferAttribute(trailPos, 3).setUsage(THREE.DynamicDrawUsage));
  trail = add(new THREE.Points(tg, new THREE.PointsMaterial({ map: dot, color: 0x22e8ff, size: 0.34, transparent: true, opacity: 0.32, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })), 'fx.trail');
  trail.frustumCulled = false;
}

export function burst(x, y, z, color, n = 24, speed = 3.2) {
  if (!pts) return;
  _c.setHex(color);
  for (let k = 0; k < n && alive < PARTICLES; k++, alive++) {
    const i = alive, a = Math.random() * Math.PI * 2, b = (Math.random() - 0.5) * Math.PI, v = speed * (0.5 + Math.random());
    pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z;
    vel[i * 3] = Math.cos(a) * Math.cos(b) * v; vel[i * 3 + 1] = Math.sin(b) * v + 1.5; vel[i * 3 + 2] = Math.sin(a) * Math.cos(b) * v;
    col[i * 3] = _c.r; col[i * 3 + 1] = _c.g; col[i * 3 + 2] = _c.b;
    life[i] = 0.45 + Math.random() * 0.35;
  }
}

let t = 0, trailT = 0;
export function update(dt = 0.016) {
  if (!ctx || !pts || /[?&]nofx=1/.test(location.search)) return;
  const st = ctx.state; t += dt;
  // particles
  for (let i = 0; i < alive; i++) {
    life[i] -= dt;
    if (life[i] <= 0) { alive--; if (i !== alive) { for (let k = 0; k < 3; k++) { pos[i * 3 + k] = pos[alive * 3 + k]; vel[i * 3 + k] = vel[alive * 3 + k]; col[i * 3 + k] = col[alive * 3 + k]; } life[i] = life[alive]; i--; } continue; }
    vel[i * 3 + 1] -= 6 * dt;
    pos[i * 3] += vel[i * 3] * dt; pos[i * 3 + 1] += vel[i * 3 + 1] * dt; pos[i * 3 + 2] += vel[i * 3 + 2] * dt;
    const f = Math.min(1, life[i] * 2.5); col[i * 3] *= 1; col[i * 3 + 1] *= 1; col[i * 3 + 2] *= 1; if (f < 1) { col[i * 3] *= 0.92; col[i * 3 + 1] *= 0.92; col[i * 3 + 2] *= 0.92; }
  }
  pts.geometry.setDrawRange(0, alive);
  pts.geometry.attributes.position.needsUpdate = true; pts.geometry.attributes.color.needsUpdate = true;

  // the runner's attachments
  const on = st.running && !st.over;
  const x = st.x || 0, y = st.y || 0, z = st.z || 0, chest = y + (st.rolling ? 0.45 : 0.85);
  const m = on && (st.magnetT || 0) > 0;
  magnetRing.visible = magnetRing2.visible = m;
  if (m) { magnetRing.position.set(x, chest, z); magnetRing.rotation.set(t * 2.1, t * 1.3, 0); magnetRing2.position.set(x, chest, z); magnetRing2.rotation.set(-t * 1.4, 0, t * 0.9); const p = 1 + 0.06 * Math.sin(t * 9); magnetRing.scale.setScalar(p); }
  const x2 = on && (st.x2T || 0) > 0;
  x2Stars.visible = x2;
  if (x2) { x2Stars.position.set(x, chest + 0.25 + 0.05 * Math.sin(t * 5), z); x2Stars.rotation.set(Math.PI / 2, 0, t * 3); }
  const sn = on && (st.sneakT || 0) > 0;
  sneakRing.visible = sn;
  if (sn) { const gy = y - (st.airborne ? 0 : 0); sneakRing.position.set(x, (ctx.modules && ctx.modules.track && ctx.modules.track.groundY ? ctx.modules.track.groundY(z) : 0) + 0.03, z); const p = 1 + 0.25 * Math.max(0, Math.sin(t * 6)); sneakRing.scale.setScalar(p); sneakRing.material.opacity = st.airborne ? 0.25 : 0.7; void gy; }
  const sg = on && st.surging;
  aura.visible = auraRing.visible = trail.visible = sg;
  if (sg) {
    aura.position.set(x, y + 0.8, z); aura.material.opacity = 0.06 + 0.025 * Math.sin(t * 11);
    auraRing.position.set(x, y + 0.8, z); auraRing.rotation.set(t * 2.6, t * 1.7, t * 0.8);
    trailT += dt;
    if (trailT > 0.04) { trailT = 0; trailPos[trailHead * 3] = x + (Math.random() - 0.5) * 0.5; trailPos[trailHead * 3 + 1] = y + 0.6 + Math.random() * 0.6; trailPos[trailHead * 3 + 2] = z - 0.4; trailHead = (trailHead + 1) % 18; trail.geometry.attributes.position.needsUpdate = true; }
    if (Math.random() < 0.35) burst(x + (Math.random() - 0.5) * 0.6, y + 0.3 + Math.random() * 1.2, z - 0.3, Math.random() < 0.5 ? 0x22e8ff : 0xff2d95, 1, 0.9);
  } else if (trailHead) { trailHead = 0; trailPos.fill(0); trail.geometry.attributes.position.needsUpdate = true; }
}
