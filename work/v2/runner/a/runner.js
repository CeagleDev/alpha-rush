/**
 * runner - candidate A (LATHE-LED). Every body segment is a LatheGeometry profile whose
 * positions are then deformed to an anatomical, oval cross-section; joints are hidden by both
 * neighbouring segments ending in the SAME sphere centred on the joint.
 * 1.56 m, ~6.6 heads, stylised-athletic. Facing +Z; the figure's LEFT is +X.
 * Anchors (world m): sole 0, ankle 0.075, knee 0.43, hip 0.80, hips-root 0.85, spine 0.92,
 * chest 1.08, shoulder 1.252, neck 1.315, head 1.365 (chin 1.326), crown 1.56 (incl. hair).
 * Shoulders ~0.41 over the jacket, hips 0.295, foot 0.26, crotch 0.716. 13.8k tris, 83 meshes.
 * Every limb hangs down its joint's local -Y, so +rotation.x pitches it BACKWARD.
 */
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, roughness = 0.9, metalness = 0) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness });
    if (name) m.name = name;
    return m;
  };
  const jacket = M(0xb8571f, 'fabric', 0.9);
  const rib = M(0xa04a1b, 'fabric', 0.94);
  const trouser = M(0x26272b, 'fabric', 0.92);
  const trouser2 = M(0x2c2d32, 'fabric', 0.92);
  const strapM = M(0x2c2c2e, 'fabric', 0.9);
  const pouchM = M(0x3a3b3d, 'fabric', 0.9);
  const buckle = M(0x7a7f84, 'metal', 0.5, 0.3);
  const shoe = M(0xbdb8ad, 'fabric', 0.7);
  const shoeDirt = M(0x8e887d, 'fabric', 0.7);
  const sole = M(0x1a1819, undefined, 0.9);
  const skin = M(0xa97f5e, undefined, 0.65);
  const lip = M(0x8a5f48, undefined, 0.65);
  const hair = M(0x15110f, 'fabric', 0.88);

  // ---------------------------------------------------------------- maths helpers
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  const smooth = (t) => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  const lerp = (a, b, t) => a + (b - a) * t;
  const gauss = (d, s) => Math.exp(-(d * d) / (s * s));
  const spow = (v, e) => Math.sign(v) * Math.pow(Math.abs(v), e);
  const tab = (T, y) => {
    if (y <= T[0][0]) return T[0][1];
    for (let i = 0; i < T.length - 1; i++) if (y <= T[i + 1][0]) return lerp(T[i][1], T[i + 1][1], smooth((y - T[i][0]) / (T[i + 1][0] - T[i][0])));
    return T[T.length - 1][1];
  };

  // ---------------------------------------------------------------- geometry helpers
  // average normals of coincident vertices: hides the lathe seam and rounds the poles
  function weld(geo) {
    geo.computeVertexNormals();
    const p = geo.attributes.position, n = geo.attributes.normal, map = new Map();
    for (let i = 0; i < p.count; i++) {
      const k = Math.round(p.getX(i) * 2e4) + ',' + Math.round(p.getY(i) * 2e4) + ',' + Math.round(p.getZ(i) * 2e4);
      let e = map.get(k); if (!e) { e = { x: 0, y: 0, z: 0, ids: [] }; map.set(k, e); }
      e.x += n.getX(i); e.y += n.getY(i); e.z += n.getZ(i); e.ids.push(i);
    }
    for (const e of map.values()) {
      if (e.ids.length < 2) continue;
      const l = Math.hypot(e.x, e.y, e.z) || 1;
      for (const i of e.ids) n.setXYZ(i, e.x / l, e.y / l, e.z / l);
    }
    n.needsUpdate = true;
    return geo;
  }
  // make sure a lathe faces outward whatever order its profile was given in
  function orient(geo) {
    const idx = geo.index, p = geo.attributes.position;
    const a = V3(), b = V3(), c = V3(), n = V3();
    let f = Math.floor(idx.count / 6) * 3;
    for (let k = 0; k < idx.count; k += 3, f = (f + 3) % idx.count) {
      a.fromBufferAttribute(p, idx.getX(f)); b.fromBufferAttribute(p, idx.getX(f + 1)); c.fromBufferAttribute(p, idx.getX(f + 2));
      n.subVectors(b, a).cross(c.clone().sub(a));
      const cx = (a.x + b.x + c.x) / 3, cz = (a.z + b.z + c.z) / 3;
      const rad = Math.hypot(cx, cz), dot = (n.x * cx + n.z * cz) / (rad || 1);
      if (n.length() < 1e-9 || rad < 1e-3 || Math.abs(dot) < 0.5 * n.length()) continue;   // caps cannot vote
      if (dot < 0) { const arr = idx.array; for (let i = 0; i < arr.length; i += 3) { const t = arr[i + 1]; arr[i + 1] = arr[i + 2]; arr[i + 2] = t; } idx.needsUpdate = true; }
      return;
    }
  }
  function profile(ctrl, n) {
    const curve = new THREE.CatmullRomCurve3(ctrl.map(([y, r]) => V3(r, y, 0)), false, 'centripetal');
    const pts = curve.getPoints(n).map((q) => new THREE.Vector2(Math.max(0, q.x), q.y));
    pts[0].x = 0; pts[pts.length - 1].x = 0;
    return pts;
  }
  // r(y) of a sampled profile (largest radius where the profile doubles back at a cap)
  const profFn = (pts) => (y) => {
    let best = 0;
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1], lo = Math.min(a.y, b.y), hi = Math.max(a.y, b.y);
      if (y < lo || y > hi) continue;
      const t = hi - lo < 1e-9 ? 0 : (y - a.y) / (b.y - a.y);
      best = Math.max(best, lerp(a.x, b.x, t));
    }
    return best;
  };
  function latheFromPts(pts, segs, deform, mat) {
    const geo = new THREE.LatheGeometry(pts, segs);
    orient(geo);
    if (deform) {
      const p = geo.attributes.position, v = V3();
      for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); deform(v, Math.atan2(v.x, v.z)); p.setXYZ(i, v.x, v.y, v.z); }
    }
    weld(geo);
    return new THREE.Mesh(geo, mat);
  }
  const lathe = (ctrl, n, segs, deform, mat) => latheFromPts(profile(ctrl, n), segs, deform, mat);
  // a unit sphere pushed through fn(u, out): for the head, hood, shoes, pouch
  function blob(ws, hs, fn, mat, axisZ) {
    const geo = new THREE.SphereGeometry(1, ws, hs);
    if (axisZ) geo.rotateX(Math.PI / 2);
    const p = geo.attributes.position, u = V3(), o = V3();
    for (let i = 0; i < p.count; i++) { u.fromBufferAttribute(p, i).normalize(); fn(u, o); p.setXYZ(i, o.x, o.y, o.z); }
    weld(geo);
    return new THREE.Mesh(geo, mat);
  }
  const ELL = (rx, ry, rz, x, y, z, mat, parent, ws = 12, hs = 8) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(1, ws, hs), mat);
    m.scale.set(rx, ry, rz); m.position.set(x, y, z); parent.add(m); return m;
  };
  // sphere-cap control points: a = top cap of a sphere centred y0, b = bottom cap
  const capTop = (y0, r) => [[y0 + r, 0], [y0 + r * 0.72, r * 0.694], [y0, r], [y0 - r * 0.45, r]];   // the extra point keeps the wall vertical through the joint
  const capBot = (y0, r) => [[y0 + r * 0.45, r], [y0, r], [y0 - r * 0.72, r * 0.694], [y0 - r, 0]];
  // bend a -Y hanging shape into a curl towards local x*m (fingers)
  function bend(v, k, m) {
    const d = Math.max(0, -v.y), ph = k * d, a = v.x * m;
    const q = (1 - Math.cos(ph)) / k + a * Math.cos(ph), yy = -Math.sin(ph) / k + a * Math.sin(ph);
    v.x = q * m; v.y = Math.max(0, v.y) + yy;
  }
  // ribbons laid on a surface: paths = [{ pts:[{p,n}], w, th, lift, closed }]
  function ribbons(paths, mat) {
    const pos = [], idx = [];
    const A = V3(), B = V3(), C = V3(), N = V3();
    const tri = (a, b, c, out) => {
      A.fromArray(pos, a * 3); B.fromArray(pos, b * 3); C.fromArray(pos, c * 3);
      N.subVectors(B, A).cross(C.clone().sub(A));
      if (N.dot(out) < 0) idx.push(a, c, b); else idx.push(a, b, c);
    };
    for (const P of paths) {
      const n = P.pts.length, base = pos.length / 3, frames = [];
      for (let i = 0; i < n; i++) {
        const prev = P.pts[P.closed ? (i + n - 1) % n : Math.max(0, i - 1)].p, next = P.pts[P.closed ? (i + 1) % n : Math.min(n - 1, i + 1)].p;
        const t = next.clone().sub(prev).normalize(), nn = P.pts[i].n.clone().normalize();
        const b = nn.clone().cross(t).normalize();
        const w = (typeof P.w === 'function' ? P.w(i / (n - 1)) : P.w) / 2;
        const c0 = P.pts[i].p.clone().addScaledVector(nn, P.lift), c1 = c0.clone().addScaledVector(nn, P.th);
        frames.push({ t, n: nn, b });
        for (const q of [c1.clone().addScaledVector(b, w), c1.clone().addScaledVector(b, -w), c0.clone().addScaledVector(b, -w * 1.15), c0.clone().addScaledVector(b, w * 1.15)]) pos.push(q.x, q.y, q.z);
      }
      const last = P.closed ? n : n - 1;
      for (let i = 0; i < last; i++) {
        const j = (i + 1) % n, f = frames[i], o = [f.n, f.b.clone().negate(), f.n.clone().negate(), f.b];
        for (let s = 0; s < 4; s++) {
          if (s === 2) continue;                                      // the underside is never seen
          const a = base + i * 4 + s, b = base + i * 4 + (s + 1) % 4, c = base + j * 4 + s, d = base + j * 4 + (s + 1) % 4;
          tri(a, b, c, o[s]); tri(b, d, c, o[s]);
        }
      }
      if (!P.closed) for (const [i, sgn] of [[0, -1], [n - 1, 1]]) { const o = frames[i].t.clone().multiplyScalar(sgn), a = base + i * 4; tri(a, a + 1, a + 2, o); tri(a, a + 2, a + 3, o); }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(new Array((pos.length / 3) * 2).fill(0), 2));
    geo.setIndex(idx); geo.computeVertexNormals();
    return new THREE.Mesh(geo, mat);
  }

  const J = (x, y, z, parent) => { const o = new THREE.Object3D(); o.position.set(x, y, z); parent.add(o); return o; };
  const root = new THREE.Object3D(); g.add(root);
  // geometry authored in world-rest metres is hung on a joint by subtracting the joint's world position
  const hang = (mesh, joint, W) => { mesh.position.sub(W); joint.add(mesh); return mesh; };

  // ---------------------------------------------------------------- the torso surface
  const KF = [[0.70, 0.46], [0.76, 0.52], [0.82, 0.60], [0.92, 0.66], [1.00, 0.63], [1.10, 0.62], [1.18, 0.64], [1.25, 0.56], [1.30, 0.64], [1.35, 0.95]];
  const KB = [[0.70, 0.62], [0.80, 0.70], [0.88, 0.66], [0.95, 0.60], [1.10, 0.58], [1.18, 0.61], [1.25, 0.63], [1.30, 0.78], [1.35, 1.0]];
  const ZO = [[0.70, 0], [0.80, -0.004], [0.95, 0.008], [1.12, 0.004], [1.25, -0.010], [1.33, -0.004]];
  function torso(v, th) {
    const r = Math.hypot(v.x, v.z), y = v.y, s = Math.sin(th), c = Math.cos(th), e = 0.86;
    let x = r * spow(s, e), z = r * spow(c, e) * (c >= 0 ? tab(KF, y) : tab(KB, y));
    const back = Math.max(0, -c), front = Math.max(0, c), ax = Math.abs(x);
    // cloth: slanting drag folds over the waist, gathers above the ribbed hem
    const m = 1 + 0.012 * Math.sin(th * 5 + y * 45) * gauss(y - 1.01, 0.05) + 0.014 * Math.sin(th * 11 + 0.6) * gauss(y - 0.956, 0.022);
    x *= m; z *= m;
    z -= 0.015 * gauss(ax - 0.068, 0.05) * gauss(y - 0.795, 0.06) * back;      // seat
    z += 0.006 * gauss(x, 0.018) * gauss(y - 0.80, 0.07) * back;                // cleft between
    z -= 0.008 * gauss(ax - 0.078, 0.042) * gauss(y - 1.19, 0.05) * back;       // shoulder blades
    z += 0.005 * gauss(x, 0.02) * smooth((y - 0.97) / 0.05) * smooth((1.24 - y) / 0.05) * back; // spine furrow
    z += 0.006 * gauss(ax - 0.07, 0.045) * gauss(y - 1.20, 0.045) * front;      // chest
    z += tab(ZO, y);
    v.set(x, y, z);
    return v;
  }

  // ---------------------------------------------------------------- hips
  const hipsW = V3(0, 0.85, 0), spineW = V3(0, 0.92, 0), chestW = V3(0, 1.08, 0), neckW = V3(0, 1.315, -0.008), headW = V3(0, 1.365, 0);
  const hips = J(hipsW.x, hipsW.y, hipsW.z, root);
  const pelvisPts = profile([[0.716, 0], [0.722, 0.05], [0.742, 0.104], [0.778, 0.142], [0.82, 0.147], [0.87, 0.132], [0.91, 0.121], [0.934, 0.118], [0.942, 0]], 14);
  hang(latheFromPts(pelvisPts, 24, torso, trouser), hips, hipsW);
  const pelvisR = profFn(pelvisPts);
  const onTorso = (rFn, th, y) => {
    const f = (t, yy) => torso(V3(rFn(yy) * Math.sin(t), yy, rFn(yy) * Math.cos(t)), t);
    const p = f(th, y), du = f(th + 0.02, y).sub(f(th - 0.02, y)), dv = f(th, y + 0.004).sub(f(th, y - 0.004));
    const n = dv.cross(du).normalize();
    if (n.x * p.x + n.z * p.z + n.y * 1e-3 < 0) n.negate();
    return { p, n };
  };
  { // back pockets: stitched patch outlines on the seat
    const paths = [];
    for (const s of [-1, 1]) {
      const c = Math.PI + s * 0.55, pts = [];
      const loop = [[-0.3, 0.845], [0.3, 0.845], [0.3, 0.775], [0, 0.755], [-0.3, 0.775]];
      for (let i = 0; i <= 15; i++) {
        const u = (i / 15) * loop.length, k = Math.floor(u) % loop.length, a = loop[k], b = loop[(k + 1) % loop.length], t = u - Math.floor(u);
        pts.push(onTorso(pelvisR, c + lerp(a[0], b[0], t), lerp(a[1], b[1], t)));
      }
      pts.pop();
      paths.push({ pts, w: 0.006, th: 0.003, lift: 0.0005, closed: true });
    }
    hang(ribbons(paths, trouser2), hips, hipsW);
  }

  // ---------------------------------------------------------------- spine: abdomen of the jacket + blouson hem
  const spine = J(0, spineW.y - hipsW.y, 0, hips);
  const abdPts = profile([[0.922, 0], [0.930, 0.136], [0.945, 0.148], [0.965, 0.152], [1.0, 0.148], [1.05, 0.1455], [1.10, 0.1445], [1.125, 0.11], [1.13, 0]], 12);
  hang(latheFromPts(abdPts, 24, torso, jacket), spine, spineW);
  hang(lathe([[0.886, 0], [0.890, 0.128], [0.902, 0.1375], [0.928, 0.1385], [0.940, 0.125], [0.943, 0]], 6, 24, (v, th) => {
    torso(v, th);
  }, rib), spine, spineW);
  const abdR = profFn(abdPts);

  // ---------------------------------------------------------------- chest
  const chest = J(0, chestW.y - spineW.y, 0, spine);
  const chestPts = profile([[1.056, 0], [1.058, 0.135], [1.066, 0.1500], [1.09, 0.1515], [1.13, 0.1525], [1.18, 0.156], [1.23, 0.159], [1.262, 0.153], [1.285, 0.120], [1.305, 0.086], [1.325, 0.064], [1.345, 0.052], [1.35, 0]], 15);
  hang(latheFromPts(chestPts, 24, torso, jacket), chest, chestW);
  const chestR = profFn(chestPts);
  const jackR = (y) => Math.max(chestR(y), abdR(y));
  const shW = (s) => V3(s * 0.155, 1.252, -0.005);
  for (const s of [-1, 1]) {
    const w = shW(s);
    hang(ELL(0.046, 0.046, 0.048, w.x - s * 0.004, w.y, w.z, jacket, chest, 10, 8), chest, chestW);   // shoulder mass the sleeve cap (r 0.050, concentric) buries into
  }
  { // zip, pocket welts, drawstrings - all laid on the jacket surface
    const line = (rFn, a, b, n) => { const pts = []; for (let i = 0; i <= n; i++) pts.push(onTorso(rFn, lerp(a[0], b[0], i / n), lerp(a[1], b[1], i / n))); return pts; };
    hang(ribbons([{ pts: line(abdR, [0, 0.945], [0, 1.085], 8), w: 0.011, th: 0.003, lift: 0.0005 },
      { pts: line(abdR, [0.42, 1.045], [0.72, 0.968], 6), w: 0.011, th: 0.004, lift: 0.0005 },
      { pts: line(abdR, [-0.42, 1.045], [-0.72, 0.968], 6), w: 0.011, th: 0.004, lift: 0.0005 }], pouchM), spine, spineW);
    hang(ribbons([{ pts: line(chestR, [0, 1.078], [0, 1.30], 10), w: 0.011, th: 0.003, lift: 0.0005 }], pouchM), chest, chestW);
    hang(ribbons([{ pts: line(chestR, [0.33, 1.175], [0.42, 1.30], 6), w: 0.006, th: 0.005, lift: 0.001 },
      { pts: line(chestR, [-0.30, 1.19], [-0.42, 1.30], 6), w: 0.006, th: 0.005, lift: 0.001 },
      // raglan-style yoke seams, front and back
      { pts: line(chestR, [0.62, 1.305], [1.25, 1.20], 8), w: 0.006, th: 0.003, lift: 0.0005 },
      { pts: line(chestR, [-0.62, 1.305], [-1.25, 1.20], 8), w: 0.006, th: 0.003, lift: 0.0005 },
      { pts: line(chestR, [Math.PI - 0.62, 1.305], [Math.PI - 1.25, 1.20], 8), w: 0.006, th: 0.003, lift: 0.0005 },
      { pts: line(chestR, [Math.PI + 0.62, 1.305], [Math.PI + 1.25, 1.20], 8), w: 0.006, th: 0.003, lift: 0.0005 }], rib), chest, chestW);
  }
  { // hood: a soft collar ring round the neck, swelling into a slumped sack on the upper back
    const R = 0.066, tube = 0.024, geo = new THREE.TorusGeometry(R, tube, 6, 18);
    geo.rotateX(Math.PI / 2);
    const p = geo.attributes.position, v = V3();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      const a = Math.atan2(v.x, v.z), cx = R * Math.sin(a), cz = R * Math.cos(a);
      const back = smooth((-Math.cos(a) + 0.35) / 1.2), front = smooth((Math.cos(a) - 0.2) / 0.8);
      const k = lerp(0.8, 1.55, back) * (1 - 0.35 * front);
      v.set(cx * (1 + 0.12 * back) + (v.x - cx) * k, 1.328 - 0.042 * front + 0.006 * back + v.y * k * (1 + 0.25 * back), -0.006 + cz * 1.08 - 0.012 * back + (v.z - cz) * k);
      p.setXYZ(i, v.x, v.y, v.z);
    }
    weld(geo); hang(new THREE.Mesh(geo, jacket), chest, chestW);
    hang(blob(14, 10, (u, o) => {
      const dn = Math.max(0, -u.y), up = Math.max(0, u.y);
      const x = u.x * 0.112 * (1 - 0.42 * Math.pow(dn, 1.4));
      let z = -0.102 + u.z * 0.046 - 0.010 * up + 0.012 * dn;
      if (u.z < 0) z += 0.010 * gauss(x, 0.016) * (1 - dn) + 0.004 * Math.cos(x * 95) * (-u.z);   // centre crease + slump wrinkles
      o.set(x, 1.262 + u.y * 0.074, z);
    }, jacket), chest, chestW);
  }
  // cross-body strap: a band that follows the jacket surface in a tilted plane, LEFT shoulder -> right hip
  {
    const N = 40, pts = [], y0 = 1.182, k = 1.22;
    for (let i = 0; i < N; i++) {
      const th = (i / N) * Math.PI * 2;
      let lo = 0.96, hi = 1.345;
      for (let it = 0; it < 22; it++) { const y = (lo + hi) / 2, x = torso(V3(jackR(y) * Math.sin(th), y, jackR(y) * Math.cos(th)), th).x; if (y - (y0 + k * x) > 0) hi = y; else lo = y; }
      pts.push(onTorso(jackR, th, (lo + hi) / 2));
    }
    // relax the path so the band does not jump where chest and abdomen meet
    for (let pass = 0; pass < 2; pass++) { const c = pts.map((q) => q.p.clone()); for (let i = 0; i < N; i++) pts[i].p.copy(c[(i + N - 1) % N]).add(c[(i + 1) % N]).multiplyScalar(0.25).addScaledVector(c[i], 0.5); }
    hang(ribbons([{ pts, w: 0.04, th: 0.009, lift: 0.002, closed: true }], strapM), chest, chestW);
    const place = (mesh, i, off, spin = 0) => {
      const a = pts[i], t = pts[(i + 1) % N].p.clone().sub(pts[(i + N - 1) % N].p).normalize(), n = a.n.clone(), b = n.clone().cross(t).normalize();
      mesh.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(t, b, n));
      mesh.rotateZ(spin); mesh.position.copy(a.p).addScaledVector(n, off);
      return hang(mesh, chest, chestW);
    };
    const sbox = (hx, hy, hz, e, mat, ws = 12, hs = 8) => blob(ws, hs, (u, o) => o.set(spow(u.x, e) * hx, spow(u.y, e) * hy, spow(u.z, e) * hz), mat);
    const iP = Math.round(N * 0.62);                                  // behind the right ribs
    place(sbox(0.062, 0.043, 0.026, 0.55, pouchM), iP, 0.026);
    place(sbox(0.064, 0.045, 0.012, 0.5, strapM, 10, 6), iP, 0.047).translateY(0.012);   // flap
    place(sbox(0.012, 0.010, 0.006, 0.5, buckle, 6, 4), iP, 0.058).translateY(-0.022);   // clip
    place(sbox(0.016, 0.026, 0.006, 0.5, buckle, 6, 4), Math.round(N * 0.06), 0.011);    // slider on the chest
  }

  // ---------------------------------------------------------------- neck / head
  const neck = J(neckW.x, neckW.y - chestW.y, neckW.z, chest);
  hang(lathe([[1.288, 0], [1.292, 0.04], [1.305, 0.052], [1.33, 0.048], [1.365, 0.046], [1.395, 0.047], [1.41, 0.03], [1.414, 0]], 9, 12, (v) => {
    v.z = v.z * 1.08 - 0.012 + (v.y - 1.30) * 0.22; v.x *= 0.98;
  }, skin), neck, neckW);
  const head = J(0, headW.y - neckW.y, headW.z - neckW.z, neck);
  hang(blob(20, 14, (u, o) => {
    let x = u.x * 0.075, y = u.y * 0.111, z = u.z * 0.094;
    if (u.z > 0) z *= 0.95;
    if (u.y > 0) x *= 1 + 0.05 * Math.sin(u.y * Math.PI);                  // cranium a touch wider than the face
    if (u.y < 0) {
      const t = -u.y;
      x *= 1 - 0.34 * Math.pow(t, 1.5);                                    // jaw narrows to the chin
      if (u.z > 0) { z *= 1 + 0.10 * t * t; x *= 1 - 0.12 * t * u.z; }
      else { z *= 1 - 0.5 * smooth(t); y += 0.034 * t * -u.z; }            // skull base tucks up into the nape
    }
    o.set(x, 1.437 + y, 0.012 + z);
  }, skin), head, headW);
  const hp = (m) => hang(m, head, headW);
  const nose = hp(ELL(0.0095, 0.021, 0.013, 0, 1.428, 0.102, skin, head, 8, 6)); nose.rotation.x = -0.35;
  hp(ELL(0.0115, 0.0075, 0.009, 0, 1.413, 0.106, skin, head, 8, 5));                                   // nose tip
  hp(ELL(0.050, 0.009, 0.012, 0, 1.463, 0.090, skin, head, 10, 5));                                  // brow ridge
  hp(ELL(0.019, 0.004, 0.006, 0, 1.385, 0.0925, lip, head, 8, 4));                                  // mouth
  for (const s of [-1, 1]) {
    hp(ELL(0.0105, 0.0055, 0.005, s * 0.030, 1.449, 0.0925, hair, head, 6, 4));                      // eye
    const br = hp(ELL(0.018, 0.0042, 0.006, s * 0.031, 1.4685, 0.096, hair, head, 6, 4)); br.rotation.z = s * 0.06;
    const ear = hp(ELL(0.0075, 0.025, 0.015, s * 0.076, 1.437, 0.004, skin, head, 8, 6)); ear.rotation.set(-0.2, s * 0.35, s * -0.12);
    hp(ELL(0.020, 0.045, 0.064, s * 0.0625, 1.478, -0.012, hair, head, 8, 6));                      // short sides
  }
  // hair: overlapping clumps; the mass, the crown whorl, the tapered nape and a swept fringe
  hp(ELL(0.082, 0.068, 0.100, 0, 1.488, -0.006, hair, head, 14, 10));
  hp(ELL(0.073, 0.062, 0.050, 0, 1.440, -0.056, hair, head, 12, 8));
  hp(ELL(0.054, 0.050, 0.030, 0, 1.402, -0.058, hair, head, 10, 6)).rotation.x = 0.25;
  hp(ELL(0.030, 0.030, 0.016, 0, 1.374, -0.052, hair, head, 8, 5));
  for (const [x, y, z, ry, rx, sx, sy, sz] of [[-0.046, 1.516, 0.012, 0.45, 0.08, 0.040, 0.021, 0.080], [0.000, 1.535, 0.010, 0.35, 0.04, 0.046, 0.021, 0.088],
    [0.047, 1.515, -0.006, 0.2, 0.0, 0.038, 0.021, 0.080], [-0.016, 1.524, -0.048, 0.3, -0.4, 0.056, 0.024, 0.060], [0.020, 1.500, -0.070, -0.2, -0.6, 0.054, 0.022, 0.050]]) {
    const c = hp(ELL(sx, sy, sz, x, y, z, hair, head, 8, 6)); c.rotation.set(rx, ry, 0);
  }
  for (const [x, y, z, rz, sx] of [[-0.030, 1.512, 0.086, 0.42, 0.040], [0.022, 1.517, 0.088, 0.30, 0.036], [0.056, 1.503, 0.070, -0.5, 0.026]]) {
    const c = hp(ELL(sx, 0.013, 0.018, x, y + 0.006, z, hair, head, 8, 5)); c.rotation.set(0.25, 0, rz);
  }

  // ---------------------------------------------------------------- arms
  function arm(s) {
    const w = shW(s), m = -s;
    const sh = J(w.x, w.y - chestW.y, w.z, chest);
    sh.rotation.z = s * 0.19;
    // sleeve, upper: deltoid cap, triceps fullness at the back, drag folds gathering above the elbow
    const up = lathe([...capTop(0, 0.050), [-0.035, 0.0505], [-0.10, 0.0465], [-0.17, 0.0425], [-0.196, 0.0436], [-0.210, 0.0408], [-0.224, 0.0425], ...capBot(-0.255, 0.040)], 16, 12, (v, th) => {
      const f = smooth(-v.y / 0.05) * smooth((v.y + 0.25) / 0.04);
      v.x += s * 0.006 * gauss(v.y + 0.06, 0.06) * Math.max(0, Math.sin(th) * s);
      v.z = v.z * lerp(1, 1.10, f) - 0.005 * gauss(v.y + 0.13, 0.07) * Math.max(0, -Math.cos(th));
      v.y += 0.008 * Math.cos(th + 0.6) * gauss(v.y + 0.21, 0.025);
    }, jacket);
    sh.add(up);
    const el = J(0, -0.255, 0, sh);   // elbow ball r 0.040 on both sides
    el.rotation.x = -0.16;
    const fo = lathe([...capTop(0, 0.0392), [-0.034, 0.0420], [-0.048, 0.0400], [-0.062, 0.0416], [-0.11, 0.0392], [-0.165, 0.0360], [-0.190, 0.0375], [-0.202, 0.033], [-0.206, 0]], 13, 12, (v, th) => {
      const f = smooth((-v.y - 0.04) / 0.05);
      v.x *= lerp(1, 0.90, f); v.z *= lerp(1, 1.08, f);
      v.y += 0.008 * Math.cos(th - 0.8) * gauss(v.y + 0.045, 0.022);
    }, jacket);
    el.add(fo);
    el.add(lathe([[-0.190, 0], [-0.196, 0.0315], [-0.212, 0.0315], [-0.230, 0.030], [-0.235, 0]], 6, 12, (v, th) => {
      const k = 1; v.x *= 0.90 * k; v.z *= 1.06 * k;
    }, rib));
    // hand: palm, a curled finger mass with the finger valleys pressed in, a separate thumb
    ELL(0.0155, 0.044, 0.037, m * 0.001, -0.268, 0.004, skin, el, 10, 6);
    const fingers = lathe([[0.012, 0], [0.009, 0.020], [0, 0.0335], [-0.03, 0.035], [-0.058, 0.033], [-0.078, 0.028], [-0.089, 0.015], [-0.092, 0]], 8, 20, (v) => {
      const gz = Math.sqrt(Math.abs(Math.sin(Math.PI * v.z / 0.0175)));
      v.x *= 0.27 * (0.74 + 0.26 * gz);
      if (v.y < 0) v.y *= 1 - 0.16 * Math.pow(v.z / 0.035, 2) - 0.05 * (v.z < 0 ? -v.z / 0.035 : 0);
      bend(v, 21, m);
    }, skin);
    fingers.position.set(m * 0.002, -0.303, 0.004); el.add(fingers);
    ELL(0.014, 0.026, 0.017, m * 0.007, -0.262, 0.027, skin, el, 8, 5);                                // thenar
    const thumb = lathe([[0.008, 0], [0.004, 0.0085], [-0.01, 0.0108], [-0.035, 0.0098], [-0.052, 0.0088], [-0.060, 0.005], [-0.062, 0]], 8, 6, (v) => bend(v, 9, m), skin);
    thumb.position.set(m * 0.008, -0.268, 0.036); thumb.rotation.x = -0.45; el.add(thumb);
    return { sh, el };
  }
  const L = arm(1), R = arm(-1);

  // ---------------------------------------------------------------- legs
  const SW = [[0, 0.035], [0.25, 0.0395], [0.5, 0.045], [0.7, 0.0495], [0.88, 0.046], [1, 0.041]];
  const SH = [[0, 0.084], [0.2, 0.098], [0.38, 0.088], [0.55, 0.062], [0.78, 0.046], [1, 0.038]];
  function leg(s) {
    const hp2 = J(s * 0.077, 0.80 - hipsW.y, 0, hips);
    // thigh: full at the top, quad sweep on the front, hamstring behind, tapering to the knee ball
    hp2.add(lathe([...capTop(0, 0.078), [-0.05, 0.0800], [-0.13, 0.0735], [-0.22, 0.0640], [-0.30, 0.0560], ...capBot(-0.37, 0.0525)], 15, 14, (v, th) => {
      const f = smooth(-v.y / 0.06) * smooth((v.y + 0.37) / 0.06), c = Math.cos(th);
      v.z *= lerp(1, 1.10, f * smooth((v.y + 0.34) / 0.3));
      v.z += 0.008 * gauss(v.y + 0.14, 0.10) * Math.max(0, c) * f - 0.006 * gauss(v.y + 0.17, 0.09) * Math.max(0, -c) * f;
      v.x += s * 0.004 * gauss(v.y + 0.10, 0.09) * Math.max(0, Math.sin(th) * s);
    }, trouser));
    const kn = J(0, -0.37, 0, hp2);
    // calf: belly high on the back, shin flattened, slim trouser leg stacking into a cuff over the shoe
    kn.add(lathe([...capTop(0, 0.0515), [-0.06, 0.0535], [-0.11, 0.0560], [-0.17, 0.0480], [-0.24, 0.0415], [-0.285, 0.0405], [-0.300, 0.0440], [-0.313, 0.0405], [-0.327, 0.0455], [-0.340, 0.0435], [-0.352, 0.0450], [-0.358, 0]], 18, 14, (v, th) => {
      const f = smooth((-v.y - 0.025) / 0.05), c = Math.cos(th);
      if (c < 0) v.z -= 0.017 * gauss(v.y + 0.105, 0.075) * -c * f;
      else v.z *= lerp(1, 0.90, smooth((-v.y - 0.06) / 0.08) * smooth((v.y + 0.30) / 0.1));
      v.x *= lerp(1, 0.94, smooth((-v.y - 0.15) / 0.08));
      v.y += 0.007 * Math.cos(th + s) * gauss(v.y + 0.32, 0.03);                                      // the stack sits askew
    }, trouser));
    const an = J(0, -0.355, 0, kn);
    an.rotation.y = s * 0.09;
    ELL(0.036, 0.036, 0.038, 0, 0, -0.002, strapM, an, 8, 6);                                         // sock
    const spring = (z) => 1.6 * Math.pow(Math.max(0, z - 0.09), 2) + 1.6 * Math.pow(Math.max(0, -0.035 - z), 2);
    // kind 0 upper, 1 midsole, 2 outsole; t0..t1 = the stretch of the foot this part covers
    const part = (kind, t0, t1, kw, kh, mat, ws, hs) => blob(ws, hs, (u, o) => {
      const rp = Math.sqrt(Math.max(1e-6, 1 - u.z * u.z)), cx = u.x / rp, cy = u.y / rp;
      const t = lerp(t0, t1, (u.z + 1) / 2), rs = Math.sqrt(Math.max(1e-6, 1 - Math.pow(2 * t - 1, 2)));
      const e = Math.pow(rs, 0.42) * (t0 === 0 && t1 === 1 ? 1 : lerp(0.6, 1, smooth(rp / 0.45)));
      const z = -0.072 + 0.262 * t;
      let x = spow(cx, 0.85) * tab(SW, t) * e * kw + m2 * 0.010 * smooth((t - 0.5) / 0.5), y;
      if (kind === 0) y = cy > 0 ? -0.043 + Math.pow(cy, 0.8) * tab(SH, t) * e * kh : -0.043 + cy * 0.012;
      else { const top = kind === 1 ? lerp(-0.029, -0.044, t) : -0.061, bot = kind === 1 ? -0.064 : -0.075, q = clamp(cy * 2.4, -1, 1); y = lerp(bot, top, (q + 1) / 2); x *= 1 - 0.05 * (1 - Math.abs(q)) * (kind === 1 ? -1 : 0); }
      o.set(x, y + spring(z), z);
    }, mat, true);
    const m2 = -s;
    an.add(part(0, 0, 1, 1, 1, shoe, 16, 12));
    an.add(part(1, 0, 1, 1.07, 1, shoe, 16, 6));
    an.add(part(2, 0, 1, 1.11, 1, sole, 14, 4));
    an.add(part(0, 0.83, 1, 1.09, 1.12, shoeDirt, 10, 6));                                             // toe cap
    an.add(part(0, 0, 0.26, 1.10, 0.74, shoeDirt, 10, 6));                                             // heel counter
    // rubber pads under the forefoot and heel: the sole is what the chase camera sees on every back-kick
    ELL(0.035, 0.004, 0.050, m2 * 0.006, -0.0745 + spring(0.105), 0.105, shoeDirt, an, 8, 4);
    ELL(0.028, 0.004, 0.030, 0, -0.0745, -0.034, shoeDirt, an, 8, 4);
    const tongue = ELL(0.021, 0.034, 0.011, m2 * 0.002, 0.012, 0.040, shoe, an, 8, 5); tongue.rotation.x = 0.55;
    for (let i = 0; i < 2; i++) { const t = 0.52 + i * 0.09, z = -0.072 + 0.262 * t; ELL(0.021 + i * 0.002, 0.004, 0.0055, m2 * 0.004, -0.043 + tab(SH, t) * Math.pow(1 - Math.pow(2 * t - 1, 2), 0.25) * 0.985, z, shoeDirt, an, 6, 4).rotation.x = 0.45; }
    return { hp: hp2, kn, an };
  }
  const LL = leg(1), RL = leg(-1);

  g.userData.joints = {
    hips, spine, chest, neck, head,
    l_shoulder: L.sh, l_elbow: L.el, r_shoulder: R.sh, r_elbow: R.el,
    l_hip: LL.hp, l_knee: LL.kn, l_ankle: LL.an, r_hip: RL.hp, r_knee: RL.kn, r_ankle: RL.an,
  };
  g.userData.jointHints = {
    kneeFlex: '+rotation.x  (heel goes back and up)',
    hipSwingForward: '-rotation.x',
    elbowFlex: '-rotation.x  (forearm comes forward)',
    shoulderSwingForward: '-rotation.x',
    shoulderRaiseOut: 'left +rotation.z, right -rotation.z',
    ankleToeDown: '-rotation.x',
    headTurn: 'rotation.y on joints.head',
    left: '+X',
  };
  /*POSE*/

  const box = new THREE.Box3(), v = new THREE.Vector3();
  g.updateMatrixWorld(true);
  g.traverse((n) => { const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    for (let i = 0; i < p.count; i++) box.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(n.matrixWorld)); });
  const c = box.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= box.min.y; o.position.z -= c.z; });
  return g;
}
