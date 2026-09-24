/**
 * anim.js — E2. Per-joint merging and procedural animation for the runner and the dogs.
 *
 * Nothing here touches ctx.state. Two exports matter to the rest of the engine:
 *
 *   mergePerJoint(THREE, root, opts)  collapse a { keepHierarchy: true } asset to one mesh per
 *                                     material class PER JOINT (colours baked to vertex colours). Everything rigid with respect to one joint
 *                                     becomes one mesh parented to that joint, with the offset baked
 *                                     into the vertices, so every limb still pivots at its joint and a
 *                                     ~65-draw figure becomes ~15–25. Returns { before, after }.
 *   new RunnerAnim(THREE, root)       drives ASSETS.md runner joints: hips, spine, chest, neck, head,
 *                                     l/r_shoulder, l/r_elbow, l/r_hip, l/r_knee, l/r_ankle.
 *   new DogAnim(THREE, root)          drives dog joints: spine, neck, head, tail, fl/fr/bl/br_hip, _knee.
 *
 * Sign conventions (ASSETS.md, and the asset's userData.jointHints when present): a limb that hangs
 * DOWN from its joint swings BACKWARD (−Z) for +rotation.x; so hip forward = −x, knee flex = +x,
 * elbow flex (forearm forward) = −x. A part that points UP (spine, head) leans forward for +x.
 * If jointHints.hipSwingForward starts with '+' the x-axis convention is flipped for all limbs.
 *
 * Poses are computed as offsets from the rest pose captured at construction, then smoothed toward
 * the target with a fast exponential blend so state changes (run → jump → run) never pop.
 */
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';

const TAU = Math.PI * 2;
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const smooth = (t) => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;

/* ------------------------------------------------------------------ per-joint merge */

function materialKey(m) {
  if (!m) return 'none';
  const tex = (t) => (t ? `${t.uuid}:${t.repeat.x},${t.repeat.y}` : '-');
  return [m.type, m.color?.getHexString?.(), m.roughness, m.metalness, m.flatShading, m.transparent,
    m.opacity, m.side, m.emissive?.getHexString?.(), m.emissiveIntensity, m.vertexColors,
    tex(m.map), tex(m.roughnessMap), tex(m.normalMap)].join('|');
}

function normaliseForMerge(geos) {
  const plain = geos.map((g) => (g.index ? g.toNonIndexed() : g));
  let common = null;
  for (const g of plain) {
    const names = new Set(Object.keys(g.attributes));
    common = common ? new Set([...common].filter((n) => names.has(n))) : names;
  }
  if (!common || !common.has('position')) return null;
  for (const g of plain) {
    for (const n of Object.keys(g.attributes)) if (!common.has(n)) g.deleteAttribute(n);
    g.morphAttributes = {};
    g.clearGroups();
  }
  return plain;
}

/**
 * Collapse `root` (an asset loaded with keepHierarchy, `root.userData.joints` resolved) to one mesh
 * per material per joint. Joints keep their transforms and children; only meshes are rebuilt.
 *
 * opts.bakeColors (default true): materials that differ only in colour / name / small roughness steps
 * are merged into ONE mesh per joint, with each part's colour written to a vertex `color` attribute and
 * the shared material cloned with vertexColors = true and a white base. Emissive, transparent and
 * textured materials keep their own buckets. This is what takes a 77-mesh figure to ~16 draws.
 */
export function mergePerJoint(THREE, root, opts = {}) {
  const bake = opts.bakeColors !== false;
  const jointMap = root.userData?.joints || {};
  const joints = new Set([root]);
  for (const v of Object.values(jointMap)) if (v && v.isObject3D) joints.add(v);
  for (const v of opts.extraJoints || []) if (v && v.isObject3D) joints.add(v);
  root.updateMatrixWorld(true);

  const owner = new Map();               // host joint -> [mesh]
  root.traverse((o) => {
    if (!o.isMesh || !o.geometry || Array.isArray(o.material)) return;
    let p = o.parent, host = root;
    while (p) { if (joints.has(p)) { host = p; break; } p = p.parent; }
    if (!owner.has(host)) owner.set(host, []);
    owner.get(host).push(o);
  });

  // a material can be colour-baked when it is a plain opaque, untextured, non-emissive standard material
  const bakeable = (m) => bake && m && m.isMeshStandardMaterial && !m.map && !m.roughnessMap && !m.normalMap &&
    !m.emissiveMap && !m.transparent && (!m.emissive || m.emissive.getHex() === 0) && m.opacity === 1 && !m.vertexColors;
  const classKey = (m) => ['baked', m.type, Math.round((m.roughness ?? 1) * 4), Math.round((m.metalness ?? 0) * 2), m.side, m.flatShading, m.name || ''].join('|');
  const baked = new Map();               // classKey -> shared vertexColors material
  const bakedMat = (m) => {
    const k = classKey(m);
    if (!baked.has(k)) { const c = m.clone(); c.color.set(0xffffff); c.vertexColors = true; c.needsUpdate = true; baked.set(k, c); }
    return baked.get(k);
  };
  const writeColor = (g, color) => {
    const n = g.attributes.position.count, arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { arr[i * 3] = color.r; arr[i * 3 + 1] = color.g; arr[i * 3 + 2] = color.b; }
    g.setAttribute('color', new THREE.BufferAttribute(arr, 3));
  };

  const inv = new THREE.Matrix4(), im = new THREE.Matrix4();
  let before = 0, after = 0;
  for (const [host, meshes] of owner) {
    before += meshes.length;
    inv.copy(host.matrixWorld).invert();
    const buckets = new Map();
    for (const m of meshes) {
      const canBake = bakeable(m.material);
      const k = (canBake ? classKey(m.material) : materialKey(m.material)) + '#' + Object.keys(m.geometry.attributes).sort().join(',');
      if (!buckets.has(k)) buckets.set(k, { mat: canBake ? bakedMat(m.material) : m.material, geos: [], bake: canBake });
      const b = buckets.get(k);
      const take = (g) => { if (canBake) writeColor(g, m.material.color); b.geos.push(g); };
      if (m.isInstancedMesh) {
        for (let i = 0; i < m.count; i++) {
          m.getMatrixAt(i, im);
          const gi = m.geometry.clone();
          gi.applyMatrix4(im); gi.applyMatrix4(m.matrixWorld); gi.applyMatrix4(inv);
          take(gi);
        }
        continue;
      }
      const g = m.geometry.clone();
      g.applyMatrix4(m.matrixWorld); g.applyMatrix4(inv);
      take(g);
    }
    for (const m of meshes) m.parent && m.parent.remove(m);
    for (const { mat, geos } of buckets.values()) {
      if (!geos.length) continue;
      let geo = geos.length === 1 ? geos[0] : null;
      if (!geo) {
        const ready = normaliseForMerge(geos);
        try { geo = ready ? BufferGeometryUtils.mergeGeometries(ready, false) : null; } catch { geo = null; }
      }
      if (!geo) {
        for (const g of geos) { const mm = new THREE.Mesh(g, mat); mm.castShadow = mm.receiveShadow = true; host.add(mm); }
        after += geos.length; continue;
      }
      const mesh = new THREE.Mesh(geo, mat);
      mesh.castShadow = true; mesh.receiveShadow = true;
      host.add(mesh); after++;
    }
  }
  // prune empty non-joint nodes left behind (cheap traversal later)
  const prune = (o) => {
    for (const c of [...o.children]) prune(c);
    if (o !== root && !joints.has(o) && !o.isMesh && !o.isLight && o.children.length === 0) o.parent?.remove(o);
  };
  prune(root);
  root.updateMatrixWorld(true);
  return { before, after };
}

/** Count the meshes (≈ draw calls) under a root. */
export function countMeshes(root) {
  let n = 0; root.traverse((o) => { if (o.isMesh) n++; }); return n;
}

/* ------------------------------------------------------------------ pose helpers */

function readHints(root) {
  const h = root.userData?.jointHints || {};
  const s = (v) => (typeof v === 'string' ? v.trim() : '');
  // Default (ASSETS.md): hip forward is −rotation.x. A rig whose hint says '+' is flipped.
  const flipX = s(h.hipSwingForward).startsWith('+') ? -1 : 1;
  return { flipX };
}

/**
 * A small pose bank: keeps the rest transform of every joint, accumulates a target rotation offset
 * per joint each frame, and blends the applied offset toward it.
 */
class PoseBank {
  constructor(THREE, joints, rate = 22) {
    this.THREE = THREE;
    this.rate = rate;
    this.names = Object.keys(joints);
    this.j = joints;
    this.rest = {};
    this.cur = {};
    this.tgt = {};
    for (const n of this.names) {
      const o = joints[n];
      this.rest[n] = { p: o.position.clone(), r: o.rotation.clone() };
      this.cur[n] = [0, 0, 0, 0, 0, 0];   // rx ry rz px py pz offsets
      this.tgt[n] = [0, 0, 0, 0, 0, 0];
    }
  }
  clear() { for (const n of this.names) { const t = this.tgt[n]; t[0] = t[1] = t[2] = t[3] = t[4] = t[5] = 0; } }
  rot(n, x = 0, y = 0, z = 0) { const t = this.tgt[n]; if (!t) return; t[0] += x; t[1] += y; t[2] += z; }
  pos(n, x = 0, y = 0, z = 0) { const t = this.tgt[n]; if (!t) return; t[3] += x; t[4] += y; t[5] += z; }
  /** Blend a whole second pose bank result: scale all targets by w (used for state blends). */
  scale(w) { for (const n of this.names) { const t = this.tgt[n]; for (let i = 0; i < 6; i++) t[i] *= w; } }
  apply(dt, rate = this.rate) {
    const k = 1 - Math.exp(-rate * dt);
    for (const n of this.names) {
      const c = this.cur[n], t = this.tgt[n], o = this.j[n], r = this.rest[n];
      for (let i = 0; i < 6; i++) c[i] += (t[i] - c[i]) * k;
      o.rotation.set(r.r.x + c[0], r.r.y + c[1], r.r.z + c[2]);
      o.position.set(r.p.x + c[3], r.p.y + c[4], r.p.z + c[5]);
    }
  }
  snap() { for (const n of this.names) { const c = this.cur[n], t = this.tgt[n]; for (let i = 0; i < 6; i++) c[i] = t[i]; } }
}

/** Stride length (one step) in metres for a runner at `speed` m/s: 1.4 m at 9 m/s, growing with speed. */
export function strideLength(speed) { return 1.4 * Math.pow(Math.max(speed, 1) / 9, 0.8); }

/* ------------------------------------------------------------------ runner */

export class RunnerAnim {
  /**
   * @param root  the asset root (wrapper from ctx.assets.get with joints resolved) — its rotation and
   *              position are driven for roll/death; place it under your own positioned group.
   */
  constructor(THREE, root) {
    this.THREE = THREE;
    this.root = root;
    this.j = root.userData?.joints || {};
    this.hints = readHints(root);
    this.bank = new PoseBank(THREE, this.j, 34);   // was 22: the pose lagged the state by ~45 ms
    this.phase = 0;         // run cycle phase, radians (one full cycle = two steps)
    this.blend = 0;         // how much of the run cycle is showing (0 in flight/roll)
    this.rollAngle = 0;
    this.vis = { rx: 0, ry: 0, rz: 0, py: 0 };   // current root pose (smoothed)
    this.restRoot = { p: root.position.clone(), r: root.rotation.clone() };
  }

  /**
   * @param dt       seconds
   * @param s        { mode: 'idle'|'run'|'jump'|'roll'|'stumble'|'dead', t: seconds in mode, T: mode length,
   *                   speed, distance, laneVel (m/s lateral), groundPitch (rad), hard (stumble was a head-on hit) }
   */
  update(dt, s) {
    const b = this.bank, f = this.hints.flipX;
    b.clear();
    const speed = s.speed || 0;
    // Phase from distance: one full cycle (two strides) per 2 × strideLength.
    if (s.distance !== undefined) this.phase = (s.distance / (2 * strideLength(speed))) * TAU;
    else this.phase += dt * 6;
    const p = this.phase;
    const spd = clamp((speed - 9) / 11, 0, 1);
    const lean = 0.10 + 0.20 * spd;                 // forward lean by speed

    // ---- the run cycle (always computed; weighted by `w` below)
    const run = {};
    const legL = Math.sin(p), legR = Math.sin(p + Math.PI);
    // A RUN, NOT A HOP (owner, 2026-09-24). The old cycle swung the thigh equally forward and back with a
    // deep bob, so the legs stayed under the body and the body bounced: a hop. A sprinter drives the
    // knee high and FORWARD and folds the trailing leg up behind, so the thigh barely swings back (which is
    // also what keeps it inside a hakama or a skirt: "legs revealed under the clothing"). So: the forward
    // swing is 0.85 rad, the back swing only 0.35, the trailing knee folds to ~2 rad, and the bob is half.
    const swing = (x) => (x > 0 ? 0.85 : 0.35) * x;
    const kneeL = 0.22 + 1.75 * Math.pow(Math.max(0, Math.cos(p - 0.9)), 1.2);
    const kneeR = 0.22 + 1.75 * Math.pow(Math.max(0, Math.cos(p + Math.PI - 0.9)), 1.2);
    const hipAmp = 1 + 0.15 * spd, armAmp = 0.55 + 0.2 * spd;
    run.l_hip = [f * (-swing(legL) * hipAmp + 0.12), 0, 0];
    run.r_hip = [f * (-swing(legR) * hipAmp + 0.12), 0, 0];
    run.l_knee = [f * kneeL, 0, 0];
    run.r_knee = [f * kneeR, 0, 0];
    run.l_ankle = [f * (0.15 * Math.sin(p + 0.9)), 0, 0];
    run.r_ankle = [f * (0.15 * Math.sin(p + Math.PI + 0.9)), 0, 0];
    // arms opposite to legs; a hanging arm goes BACK for +x, so left arm back when left leg forward
    run.l_shoulder = [f * (armAmp * legL), 0, 0.10];
    run.r_shoulder = [f * (armAmp * legR), 0, -0.10];
    run.l_elbow = [f * (-(0.95 + 0.35 * Math.max(0, legL))), 0, 0];
    run.r_elbow = [f * (-(0.95 + 0.35 * Math.max(0, legR))), 0, 0];
    const bob = -0.018 * Math.cos(2 * p) - 0.01;
    run.hips = [lean * 0.35, 0.12 * Math.sin(p), 0.05 * Math.sin(p), 0, bob, 0];
    run.spine = [lean * 0.4, -0.05 * Math.sin(p), -0.03 * Math.sin(p), 0, 0, 0];
    run.chest = [lean * 0.25, -0.16 * Math.sin(p), 0, 0, 0, 0];
    run.neck = [-lean * 0.4, 0, 0, 0, 0, 0];
    run.head = [-lean * 0.55 + 0.015 * Math.cos(2 * p), 0.06 * Math.sin(p), 0, 0, 0, 0];

    let w = 1;                                   // weight of the run cycle
    let rootRX = 0, rootRZ = 0, rootRY = 0, rootPY = 0, rootPZ = 0, rollSpin = 0;
    const mode = s.mode || 'run', t = s.t || 0;

    if (mode === 'idle') {
      w = 0;
      const br = Math.sin(t * 1.6) * 0.012;
      b.pos('hips', 0, br, 0);
      b.rot('spine', 0.04); b.rot('chest', 0.02); b.rot('head', -0.04 + Math.sin(t * 0.6) * 0.03, Math.sin(t * 0.4) * 0.12, 0);
      b.rot('l_elbow', f * -0.25); b.rot('r_elbow', f * -0.25);
      b.rot('l_shoulder', 0, 0, 0.08); b.rot('r_shoulder', 0, 0, -0.08);
    } else if (mode === 'jump') {
      const T = s.T || 1.1;
      const u = clamp(t / T, 0, 1);
      // in over 0.12 s, out over the last 0.15 s
      const k = smooth(t / 0.05) * smooth((T - t) / 0.10);   // was 0.12 in: the tuck lagged the take-off
      w = 1 - k;
      const tuck = Math.sin(u * Math.PI);          // 0 at take-off/landing, 1 at apex
      const tk = k * (0.35 + 0.65 * tuck);
      b.rot('l_hip', f * -1.35 * tk); b.rot('r_hip', f * -1.05 * tk);
      b.rot('l_knee', f * 1.9 * tk); b.rot('r_knee', f * 1.6 * tk);
      b.rot('l_ankle', f * 0.3 * tk); b.rot('r_ankle', f * 0.3 * tk);
      b.rot('l_shoulder', f * -0.9 * k, 0, 0.55 * k); b.rot('r_shoulder', f * -0.9 * k, 0, -0.55 * k);
      b.rot('l_elbow', f * -0.6 * k); b.rot('r_elbow', f * -0.6 * k);
      b.rot('hips', 0.10 * k); b.rot('spine', 0.20 * k); b.rot('chest', 0.06 * k);
      b.rot('head', -0.25 * k);
      b.pos('hips', 0, -0.05 * k * (1 - tuck), 0);     // crouch at take-off / landing
    } else if (mode === 'roll') {
      const T = s.T || 0.5;
      const u = clamp(t / T, 0, 1);
      // hold the ball almost to the end: the critic found the runner upright by ~70 % of the window
      // with the hitbox still halved, so the head passed through a 1.3 m bar with no hit. The tuck
      // now releases only in the last 0.05 s.
      const k = smooth(t / 0.04) * smooth((T - t) / 0.05);
      w = 1 - k;
      // tight ball
      b.rot('l_hip', f * -1.9 * k); b.rot('r_hip', f * -1.85 * k);
      b.rot('l_knee', f * 2.3 * k); b.rot('r_knee', f * 2.3 * k);
      b.rot('spine', 0.55 * k); b.rot('chest', 0.45 * k); b.rot('neck', 0.35 * k); b.rot('head', 0.35 * k);
      b.rot('l_shoulder', f * -1.6 * k, 0, 0.35 * k); b.rot('r_shoulder', f * -1.6 * k, 0, -0.35 * k);
      b.rot('l_elbow', f * -2.0 * k); b.rot('r_elbow', f * -2.0 * k);
      b.pos('hips', 0, -0.45 * k, 0);
      // forward somersault about X, pivot at the ball's centre (~0.45 m up), one full turn over T
      rollSpin = smooth(u) * TAU;
    } else if (mode === 'fly') {
      // ALPHA SURGE: Superman. The whole figure pitches forward to near-horizontal about the hips, the
      // right arm punches straight ahead, the left arm sweeps back along the body, the legs trail
      // together with a little scissor, head up to look down the street. Blends in over 0.25 s.
      const k = smooth(t / 0.25);
      w = 1 - k;
      const sc = Math.sin(t * 7) * 0.12;
      b.rot('l_shoulder', f * -3.0 * k, 0, 0.18 * k);         // arm forward past the head
      b.rot('l_elbow', f * -0.15 * k);
      b.rot('r_shoulder', f * 0.9 * k, 0, -0.25 * k);          // arm back along the flank
      b.rot('r_elbow', f * -0.35 * k);
      b.rot('l_hip', f * (0.25 + sc) * k); b.rot('r_hip', f * (0.25 - sc) * k);
      b.rot('l_knee', f * 0.12 * k); b.rot('r_knee', f * 0.12 * k);
      b.rot('l_ankle', f * -0.4 * k); b.rot('r_ankle', f * -0.4 * k);   // toes pointed
      b.rot('spine', -0.15 * k); b.rot('chest', -0.15 * k); b.rot('neck', -0.55 * k); b.rot('head', -0.6 * k);
      rootRX = 1.3 * k;                                         // + tips forward (the death pose uses +1.35): body near-horizontal, head ahead
      rootPY = -0.2 * k; rootPZ = -0.8 * k;                     // the root pivot is at the feet: pull it back and down so the body's centre stays over the runner's position
    } else if (mode === 'stumble') {
      const T = s.T || 0.7;
      const u = clamp(t / T, 0, 1);
      const k = Math.sin(u * Math.PI) * (s.hard ? 1 : 0.7);
      w = 1 - 0.45 * k;
      b.rot('spine', 0.55 * k); b.rot('chest', 0.25 * k); b.rot('head', -0.35 * k, 0.2 * k, 0);
      // arms forward and down (a catch-yourself stagger), not out to the sides - spread arms read
      // as the jump pose in the critic's strips
      b.rot('l_shoulder', f * -1.4 * k, 0, 0.25 * k); b.rot('r_shoulder', f * -1.0 * k, 0, -0.15 * k);
      b.rot('l_elbow', f * -0.4 * k); b.rot('r_elbow', f * -0.9 * k);
      b.rot('r_knee', f * 0.8 * k); b.rot('l_hip', f * -0.3 * k);
      b.pos('hips', 0, -0.12 * k, 0);
      rootRZ = -0.12 * k; rootRY = 0.25 * k;
    } else if (mode === 'dead') {
      const T = s.T || 0.8;
      const e = 1 - Math.pow(1 - clamp(t / T, 0, 1), 3);
      w = 1 - e;
      b.rot('l_knee', f * 1.0 * e); b.rot('r_knee', f * 0.7 * e);
      b.rot('l_hip', f * -0.5 * e); b.rot('r_hip', f * -0.25 * e);
      b.rot('spine', 0.35 * e); b.rot('chest', 0.15 * e); b.rot('head', 0.35 * e, 0.4 * e, 0);
      b.rot('l_shoulder', f * -1.5 * e, 0, 0.5 * e); b.rot('r_shoulder', f * -1.3 * e, 0, -0.6 * e);
      b.rot('l_elbow', f * -0.9 * e); b.rot('r_elbow', f * -0.6 * e);
      b.pos('hips', 0, -0.18 * e, 0);
      rootRX = 1.35 * e; rootRZ = 0.12 * e;     // tip forward over the feet, face down
    }

    // ---- lay the weighted run cycle under the mode pose
    if (w > 0) {
      for (const n in run) {
        const v = run[n];
        b.rot(n, v[0] * w, v[1] * w, v[2] * w);
        if (v.length > 3) b.pos(n, v[3] * w, v[4] * w, v[5] * w);
      }
    }
    // lateral lean during lane changes and the ground pitch (half on the hips, head stays level)
    const lv = clamp((s.laneVel || 0) / 5, -1, 1);   // was /12: at a 0.18 s lane change the lean never registered
    const gp = clamp(s.groundPitch || 0, -0.35, 0.35);
    b.rot('hips', -gp * 0.5, 0, 0);
    b.rot('head', gp * 0.5, 0, 0);
    b.rot('spine', 0, 0, -lv * 0.10);
    rootRY += lv * 0.18;
    rootRZ += -lv * 0.05;

    b.apply(dt, mode === 'roll' || mode === 'jump' ? 26 : 22);

    // root: smoothed pitch/yaw/roll, plus the roll spin about a pivot
    const v = this.vis, k = 1 - Math.exp(-14 * dt);
    v.rx += (rootRX - v.rx) * k; v.ry += (rootRY - v.ry) * k; v.rz += (rootRZ - v.rz) * k;
    v.py = (v.py || 0) + (rootPY - (v.py || 0)) * k; v.pz = (v.pz || 0) + (rootPZ - (v.pz || 0)) * k;
    const R = this.restRoot;
    if (mode === 'roll' || this.rollAngle > 0.01) {
      this.rollAngle = mode === 'roll' ? rollSpin : (this.rollAngle > TAU - 0.05 ? 0 : lerp(this.rollAngle, TAU, k));
      if (this.rollAngle >= TAU - 0.02) this.rollAngle = 0;
    }
    const a = this.rollAngle, py = 0.5;
    this.root.rotation.set(R.r.x + v.rx + a, R.r.y + v.ry, R.r.z + v.rz);
    this.root.position.set(R.p.x, R.p.y + v.py + (a ? py - py * Math.cos(a) : 0), R.p.z + v.pz - (a ? py * Math.sin(a) : 0));
  }
}

/* ------------------------------------------------------------------ dogs */

export class DogAnim {
  constructor(THREE, root, seed = 0) {
    this.THREE = THREE;
    this.root = root;
    this.j = root.userData?.joints || {};
    this.hints = readHints(root);
    this.bank = new PoseBank(THREE, this.j, 24);
    this.phase = seed * 1.7;
    this.t = seed * 3.1;
    this.restRoot = { p: root.position.clone(), r: root.rotation.clone() };
    this.vis = { rx: 0, py: 0 };
  }

  /** Bound length (one bound) in metres for a dog at `speed` m/s. */
  static boundLength(speed) { return 1.5 * Math.pow(Math.max(speed, 1) / 9, 0.8); }

  /**
   * @param s  { mode: 'idle'|'run'|'excited', speed, distance (the dog's own travelled metres), laneVel, groundPitch }
   */
  update(dt, s) {
    const b = this.bank, f = this.hints.flipX;
    b.clear();
    this.t += dt;
    const speed = s.speed || 0;
    const mode = s.mode || 'run';
    if (s.distance !== undefined) this.phase = (s.distance / DogAnim.boundLength(speed)) * TAU;
    else if (mode !== 'idle') this.phase += dt * 8;
    const p = this.phase, t = this.t;
    let rootRX = 0, rootPY = 0;

    if (mode === 'run') {
      // bounding gait: the front pair and the back pair alternate; a small L/R offset so it is not a hop
      const front = Math.sin(p), back = Math.sin(p + Math.PI);
      const fL = Math.sin(p + 0.25), fR = Math.sin(p - 0.25);
      const bL = Math.sin(p + Math.PI + 0.2), bR = Math.sin(p + Math.PI - 0.2);
      const hipAmp = 0.75;
      b.rot('fl_hip', f * (-hipAmp * fL + 0.05)); b.rot('fr_hip', f * (-hipAmp * fR + 0.05));
      b.rot('bl_hip', f * (-hipAmp * bL - 0.05)); b.rot('br_hip', f * (-hipAmp * bR - 0.05));
      const kf = (x) => 0.25 + 0.9 * Math.pow(Math.max(0, Math.cos(x - 0.9)), 1.4);
      b.rot('fl_knee', f * kf(p + 0.25)); b.rot('fr_knee', f * kf(p - 0.25));
      b.rot('bl_knee', f * kf(p + Math.PI + 0.2)); b.rot('br_knee', f * kf(p + Math.PI - 0.2));
      // spine flexes in the gathered phase (back legs forward) and extends when stretched
      const gather = -Math.cos(p + Math.PI / 2 + 0.3);
      b.rot('spine', 0.22 * gather);
      b.rot('neck', -0.10 * gather); b.rot('head', -0.12 * gather + 0.05 * Math.sin(t * 2.1), 0.05 * Math.sin(t * 1.3), 0);
      b.rot('tail', 0.15 * gather + 0.1, 0.35 * Math.sin(t * 9.0), 0);
      // body: airborne arc twice per cycle (two suspensions) and pitch nose-up at take-off
      rootPY = 0.05 * Math.max(0, Math.sin(p + 0.4)) + 0.02 * Math.max(0, Math.sin(p + Math.PI + 0.4));
      rootRX = -0.10 * Math.cos(p + 0.4);
    } else if (mode === 'excited') {
      const h = Math.abs(Math.sin(t * 7));
      b.rot('fl_hip', f * -0.6 * h); b.rot('fr_hip', f * -0.6 * h);
      b.rot('bl_hip', f * 0.3 * h); b.rot('br_hip', f * 0.3 * h);
      b.rot('fl_knee', f * 0.5 * h); b.rot('fr_knee', f * 0.5 * h);
      b.rot('spine', -0.15 * h); b.rot('neck', -0.25 * h); b.rot('head', -0.3 * h, 0.2 * Math.sin(t * 3), 0);
      b.rot('tail', 0.3, 0.6 * Math.sin(t * 14), 0);
      rootPY = 0.08 * h; rootRX = -0.25 * h;
    } else {
      // idle: breathing, tail wag, a look-around
      b.rot('spine', 0.02 * Math.sin(t * 1.5));
      b.rot('head', 0.05 * Math.sin(t * 0.7), 0.25 * Math.sin(t * 0.45), 0);
      b.rot('tail', 0.1, 0.4 * Math.sin(t * 5), 0);
    }
    const lv = clamp((s.laneVel || 0) / 12, -1, 1);
    const gp = clamp(s.groundPitch || 0, -0.35, 0.35);
    b.rot('spine', 0, lv * 0.25, 0);
    b.rot('head', 0, lv * 0.25, 0);
    b.apply(dt);

    const v = this.vis, k = 1 - Math.exp(-16 * dt);
    v.rx += (rootRX - gp - v.rx) * k; v.py += (rootPY - v.py) * k;
    const R = this.restRoot;
    this.root.rotation.set(R.r.x + v.rx, R.r.y + lv * 0.35, R.r.z - lv * 0.06);
    this.root.position.set(R.p.x, R.p.y + v.py, R.p.z);
  }
}
