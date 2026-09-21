/**
 * runner - candidate B: SCULPTED-ELLIPSOID build. 1.56 m, ~6.6 heads, stylised-athletic young man in
 * an orange hooded blouson, dark slim trousers, off-white trainers, cross-body strap with a pouch on
 * the back of the left shoulder, short dark hair. Facing +Z; the figure's LEFT is +X.
 *
 * Anchors (world m, rest pose): sole 0.00, ankle 0.075, knee 0.43, hip 0.80, hips-root 0.85,
 * spine 0.93, chest 1.08, shoulder 1.255, neck 1.315, head 1.36 (chin 1.32), crown 1.56.
 * Shoulder pivots 0.15 off-axis (0.40 across the sleeves), hips 0.30, feet 0.26 long, elbow 1.005, wrist 0.78.
 * Every limb hangs down its joint's local -Y, so +rotation.x pitches it BACKWARD.
 *
 * How it is built: every body mass is a "blob" - an ellipsoid or a tapered capsule (two end radii, an
 * oval cross-section) - blocked in like clay: rib cage, abdomen, blouson roll, scapulae, lats, traps,
 * glutes, deltoid, biceps, triceps, quad, hamstring, calf belly ... Blobs that belong to one rigid
 * piece are FUSED: their vertex normals come from the blended implicit field of all the blobs in the
 * set, so the crease where two masses intersect shades as a soft fillet rather than a seam, and any
 * triangle buried inside a neighbour on the same joint is dropped. Every joint ball (shoulder, elbow,
 * hip, knee) is a sphere centred exactly on the pivot and shared by both segments, so flexing opens
 * no gap. Clothing detail (hem, cuffs, hood rim, seams, zip, strap) is swept tube/band geometry
 * projected onto the clay surface; pouch, buckles and shoe soles are bevelled ExtrudeGeometry.
 * All geometry is baked to ONE mesh per joint per material.
 */
export default function (THREE) {
  const g = new THREE.Group();
  const V3 = THREE.Vector3, M4 = THREE.Matrix4, Q = THREE.Quaternion;
  const M = (color, name, roughness = 0.88, metalness = 0) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness });
    if (name) m.name = name;
    return m;
  };
  const jacket = M(0xb8571f, 'fabric', 0.9);
  const rib = M(0xa04a1b, 'fabric', 0.95);             // ribbed hem, cuffs, hood rim, seams
  const trouser = M(0x26272b, 'fabric', 0.92);
  const stitch = M(0x34353a, 'fabric', 0.92);          // trouser seams / hems, a touch lighter
  const strapM = M(0x2c2c2e, 'fabric', 0.9);
  const pouchM = M(0x3a3b3d, 'fabric', 0.88);
  const buckleM = M(0x7a7f84, 'metal', 0.5, 0.3);
  const shoeM = M(0xbdb8ad, 'fabric', 0.7);
  const dirtM = M(0x8e887d, 'fabric', 0.8);
  const soleM = M(0x1a1819, undefined, 0.9);
  const skin = new THREE.MeshStandardMaterial({ color: 0xa97f5e, roughness: 0.65 });
  const lip = new THREE.MeshStandardMaterial({ color: 0x8a5f4a, roughness: 0.6 });
  const hair = M(0x15110f, 'fabric', 0.8);

  // ---- skeleton ---------------------------------------------------------------------------------
  const J = (x, y, z, parent) => { const o = new THREE.Object3D(); o.position.set(x, y, z); parent.add(o); return o; };
  const root = new THREE.Object3D(); g.add(root);
  const hips = J(0, 0.85, 0, root);
  const spine = J(0, 0.08, 0, hips);            // 0.93
  const chest = J(0, 0.15, 0, spine);           // 1.08
  const neck = J(0, 0.235, -0.005, chest);      // 1.315
  const head = J(0, 0.045, 0.005, neck);        // 1.36
  const mkArm = (s) => {
    const sh = J(s * 0.15, 0.175, -0.005, chest); sh.rotation.z = s * 0.15;   // 1.255
    const el = J(0, -0.25, 0, sh); el.rotation.x = -0.15;
    return { sh, el };
  };
  const mkLeg = (s) => {
    const hp = J(s * 0.08, -0.05, 0, hips);     // 0.80
    const kn = J(0, -0.37, 0, hp);              // 0.43
    const an = J(0, -0.355, 0, kn);             // 0.075
    return { hp, kn, an };
  };
  const L = mkArm(1), R = mkArm(-1), LL = mkLeg(1), RL = mkLeg(-1);
  g.updateMatrixWorld(true);

  // ---- clay: blobs with a blended implicit field -------------------------------------------------
  const blobs = [];
  const RES = [[8, 2], [10, 3], [12, 4], [16, 5]];
  const LAM = { torsoUp: 0.022, torsoLow: 0.022, hood: 0.016, pelvis: 0.02, hair: 0.009, face: 0.012 };
  const mkBlob = (joint, mat, set, Ml, local, r0, r1, len, res) => {
    const Mw = local ? new M4().multiplyMatrices(joint.matrixWorld, Ml) : Ml;
    const b = { joint, mat, set, Mw, inv: Mw.clone().invert(), r0, r1, len, res };
    blobs.push(b); return b;
  };
  // ellipsoid: centre p, radii r, euler rot
  const E = (joint, mat, set, p, r, rot, res = 2, local = false) =>
    mkBlob(joint, mat, set, new M4().compose(new V3(...p), new Q().setFromEuler(new THREE.Euler(...(rot || [0, 0, 0]))),
      typeof r === 'number' ? new V3(r, r, r) : new V3(...r)), local, 1, 1, 0, res);
  // tapered capsule from a (radius ra) to b (radius rb), cross-section scaled sx / sz
  const C = (joint, mat, set, a, ra, b, rb, sx = 1, sz = 1, res = 2, local = false) => {
    const A = new V3(...a), d = new V3(...b).sub(A), len = d.length();
    const q = new Q().setFromUnitVectors(new V3(0, -1, 0), d.normalize());
    return mkBlob(joint, mat, set, new M4().compose(A, q, new V3(sx, 1, sz)), local, ra, rb, len, res);
  };
  const _q = new V3(), _g = new V3();
  // field value f (1 on the surface), world gradient direction into _g, returns approx signed distance
  const field = (b, P) => {
    _q.copy(P).applyMatrix4(b.inv);
    const t = b.len > 0 ? Math.min(1, Math.max(0, -_q.y / b.len)) : 0;
    const r = b.r0 + (b.r1 - b.r0) * t, dx = _q.x, dy = _q.y + t * b.len, dz = _q.z, e = b.inv.elements;
    const f = (dx * dx + dy * dy + dz * dz) / (r * r);
    _g.set(e[0] * dx + e[1] * dy + e[2] * dz, e[4] * dx + e[5] * dy + e[6] * dz, e[8] * dx + e[9] * dy + e[10] * dz);
    const gl = _g.length() || 1e-9; _g.multiplyScalar(1 / gl);
    return (f - 1) * r * r / (2 * gl);
  };
  const fusedNormal = (P, list, lam, out) => {
    out.set(0, 0, 0);
    for (const b of list) {
      const d = field(b, P); if (d > 3 * lam) continue;
      const w = d <= 0 ? 1 : Math.exp(-(d / lam) * (d / lam));
      out.addScaledVector(_g, w);
    }
    return out.normalize();
  };
  const setOf = (names) => blobs.filter((b) => names.includes(b.set));
  // first surface point met marching from A + D*far back toward A
  const hit = (list, A, D, far = 0.45, lam = 0.015) => {
    const P = new V3(), inside = (t) => { P.copy(A).addScaledVector(D, t); for (const b of list) if (field(b, P) < 0) return true; return false; };
    let t = far; const step = 0.004;
    while (t > 0 && !inside(t)) t -= step;
    if (t <= 0) return null;
    let lo = t, hi = t + step;
    for (let i = 0; i < 8; i++) { const m = (lo + hi) / 2; if (inside(m)) lo = m; else hi = m; }
    P.copy(A).addScaledVector(D, hi);
    return { p: P.clone(), n: fusedNormal(P, list, lam, new V3()).clone() };
  };

  // ---- accumulators: one mesh per joint per material ---------------------------------------------
  const acc = new Map();
  const bucket = (joint, mat) => {
    const k = joint.id + '|' + mat.uuid;
    if (!acc.has(k)) acc.set(k, { joint, mat, pos: [], nrm: [] });
    return acc.get(k);
  };
  // smooth normals on a non-indexed geometry, keeping creases sharper than acos(cosC)
  const weldNormals = (geo, cosC = 0.45) => {
    const g2 = geo.index ? geo.toNonIndexed() : geo, p = g2.attributes.position, n = p.count;
    const fn = new Float32Array(n * 3), a = new V3(), b = new V3(), c = new V3(), map = new Map();
    for (let i = 0; i < n; i += 3) {
      a.fromBufferAttribute(p, i); b.fromBufferAttribute(p, i + 1); c.fromBufferAttribute(p, i + 2);
      b.sub(a); c.sub(a); b.cross(c);
      for (let k = 0; k < 3; k++) {
        fn[(i + k) * 3] = b.x; fn[(i + k) * 3 + 1] = b.y; fn[(i + k) * 3 + 2] = b.z;
        a.fromBufferAttribute(p, i + k);
        const key = Math.round(a.x * 2e4) + ',' + Math.round(a.y * 2e4) + ',' + Math.round(a.z * 2e4);
        if (!map.has(key)) map.set(key, []); map.get(key).push(i + k);
      }
    }
    const out = new Float32Array(n * 3), key2 = new Array(n);
    for (const [, arr] of map) for (const i of arr) key2[i] = arr;
    for (let i = 0; i < n; i++) {
      a.set(fn[i * 3], fn[i * 3 + 1], fn[i * 3 + 2]); const al = a.length() || 1; c.set(0, 0, 0);
      for (const j of key2[i]) {
        b.set(fn[j * 3], fn[j * 3 + 1], fn[j * 3 + 2]); const bl = b.length(); if (!bl) continue;
        if (a.dot(b) / (al * bl) > cosC) c.add(b);
      }
      c.normalize(); out[i * 3] = c.x; out[i * 3 + 1] = c.y; out[i * 3 + 2] = c.z;
    }
    g2.setAttribute('normal', new THREE.BufferAttribute(out, 3));
    return g2;
  };
  // push a finished geometry (world rest space) into a joint's bucket
  const addGeo = (joint, mat, geo, matrix) => {
    if (matrix) geo.applyMatrix4(matrix);
    const g2 = geo.index ? geo.toNonIndexed() : geo;
    if (!g2.attributes.normal) g2.computeVertexNormals();
    const p = g2.attributes.position.array, n = g2.attributes.normal.array, B = bucket(joint, mat);
    for (let i = 0; i < p.length; i++) { B.pos.push(p[i]); B.nrm.push(n[i]); }
  };

  // swept band: elliptical cross-section (halfT along the given normal, halfW across), explicit frames
  const sweep = (pts, nrms, halfW, halfT, closed = false, radial = 6, lift = 0) => {
    const n = pts.length, pos = [], idx = [], T = new V3(), N = new V3(), Bn = new V3(), P = new V3();
    for (let i = 0; i < n; i++) {
      const a = pts[closed ? (i - 1 + n) % n : Math.max(0, i - 1)], b = pts[closed ? (i + 1) % n : Math.min(n - 1, i + 1)];
      T.copy(b).sub(a).normalize();
      N.copy(nrms[i]).addScaledVector(T, -T.dot(nrms[i])).normalize();
      Bn.crossVectors(T, N);
      for (let k = 0; k < radial; k++) {
        const an = (k / radial) * Math.PI * 2;
        P.copy(pts[i]).addScaledVector(N, lift + halfT * Math.cos(an)).addScaledVector(Bn, halfW * Math.sin(an));
        pos.push(P.x, P.y, P.z);
      }
    }
    const rings = closed ? n : n - 1;
    for (let i = 0; i < rings; i++) for (let k = 0; k < radial; k++) {
      const i2 = (i + 1) % n, k2 = (k + 1) % radial;
      const v00 = i * radial + k, v01 = i * radial + k2, v10 = i2 * radial + k, v11 = i2 * radial + k2;
      idx.push(v00, v01, v10, v01, v11, v10);
    }
    if (!closed) {   // end caps
      for (const [ring, flip] of [[0, false], [n - 1, true]]) {
        const ci = pos.length / 3; P.copy(pts[ring]).addScaledVector(nrms[ring], lift); pos.push(P.x, P.y, P.z);
        for (let k = 0; k < radial; k++) { const k2 = (k + 1) % radial; flip ? idx.push(ci, ring * radial + k, ring * radial + k2) : idx.push(ci, ring * radial + k2, ring * radial + k); }
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals();
    return geo;
  };
  const smooth = (pts, passes = 2, closed = false) => {
    for (let s = 0; s < passes; s++) {
      const src = pts.map((p) => p.clone()), n = pts.length;
      for (let i = 0; i < n; i++) {
        if (!closed && (i === 0 || i === n - 1)) continue;
        pts[i].copy(src[(i - 1 + n) % n]).add(src[(i + 1) % n]).multiplyScalar(0.25).addScaledVector(src[i], 0.5);
      }
    }
    return pts;
  };
  // a seam/band laid on the clay: samples fn(t) -> [A, D] rays, projects, smooths, sweeps
  const laid = (joint, mat, list, fn, count, halfW, halfT, o = {}) => {
    const pts = [], nr = [];
    for (let i = 0; i < count; i++) {
      const t = o.closed ? i / count : i / (count - 1), [A, D] = fn(t), h = hit(list, A, D, o.far || 0.45, o.lam || 0.02);
      if (h) { pts.push(h.p); nr.push(h.n); }
    }
    if (pts.length < 2) return null;
    smooth(pts, o.smooth ?? 2, o.closed); smooth(nr, (o.smooth ?? 2) + 1, o.closed); nr.forEach((n) => n.normalize());
    addGeo(joint, mat, sweep(pts, nr, halfW, halfT, !!o.closed, o.radial || 4, o.lift ?? halfT * 0.5));
    return { pts, nr };
  };
  const ellipseRing = (cx, cy, cz, rx, rz, n) => {
    const pts = [], nr = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      pts.push(new V3(cx + rx * Math.sin(a), cy, cz + rz * Math.cos(a)));
      nr.push(new V3(Math.sin(a) / rx, 0, Math.cos(a) / rz).normalize());
    }
    return { pts, nr };
  };
  const rrect = (w, h, r) => {
    const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
    s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
    return s;
  };
  const slab = (w, h, r, depth, bevel, seg = 2) => weldNormals(new THREE.ExtrudeGeometry(rrect(w, h, r),
    { depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: seg, curveSegments: 3, steps: 1 }));
  const frame = (p, n, up, out = 0) => {   // matrix: Z = n, Y = up projected, X = Y x Z
    const z = n.clone().normalize(), y = up.clone().addScaledVector(z, -up.dot(z)).normalize(), x = new V3().crossVectors(y, z);
    return new M4().makeBasis(x, y, z).setPosition(p.clone().addScaledVector(z, out));
  };

  // =================================================================================================
  // PELVIS / SEAT  (hips joint, trousers)
  // =================================================================================================
  E(hips, trouser, 'pelvis', [0, 0.825, -0.002], [0.148, 0.10, 0.102], null, 3);
  E(hips, trouser, 'pelvis', [0, 0.78, 0.015], [0.06, 0.055, 0.06], null, 1);           // lower belly / fly
  for (const s of [1, -1]) {
    E(hips, trouser, 'pelvis', [s * 0.07, 0.778, -0.05], [0.08, 0.086, 0.078], [0.15, 0, 0], 2);   // glute
    E(hips, trouser, 'pelvis', [s * 0.108, 0.80, -0.004], [0.052, 0.082, 0.084], null, 1);         // hip side
  }

  // =================================================================================================
  // JACKET - lower (spine joint)
  // =================================================================================================
  E(spine, jacket, 'torsoLow', [0, 1.01, 0], [0.15, 0.135, 0.106], null, 3);               // abdomen
  E(spine, jacket, 'torsoLow', [0, 0.927, -0.002], [0.158, 0.05, 0.12], null, 3);          // blouson roll over the hem
  E(spine, jacket, 'torsoLow', [0.085, 0.962, -0.088], [0.06, 0.013, 0.03], [0, 0, 0.3], 0);   // soft folds at the waist
  E(spine, jacket, 'torsoLow', [-0.08, 0.975, -0.09], [0.065, 0.013, 0.03], [0, 0, -0.22], 0);
  E(spine, jacket, 'torsoLow', [-0.11, 0.97, 0.06], [0.05, 0.012, 0.04], [0, 0.5, 0.25], 0);

  // =================================================================================================
  // JACKET - upper (chest joint)
  // =================================================================================================
  E(chest, jacket, 'torsoUp', [0, 1.165, -0.004], [0.16, 0.145, 0.108], null, 3);          // rib cage
  E(chest, jacket, 'torsoUp', [0, 1.238, -0.012], [0.163, 0.05, 0.086], null, 3);          // shoulder girdle
  for (const s of [1, -1]) {
    C(chest, jacket, 'torsoUp', [s * 0.04, 1.295, -0.02], 0.028, [s * 0.14, 1.256, -0.008], 0.042, 1, 1, 1);   // trapezius slope
    E(chest, jacket, 'torsoUp', [s * 0.076, 1.21, -0.076], [0.06, 0.075, 0.038], [0, 0, -s * 0.2], 1);  // scapula
    E(chest, jacket, 'torsoUp', [s * 0.118, 1.12, -0.02], [0.042, 0.13, 0.072], null, 2);               // lat
    E(chest, jacket, 'torsoUp', [s * 0.15, 1.255, -0.005], 0.05, null, 1);                             // shoulder socket
  }
  // hood: a soft collar mass lying behind the neck
  E(chest, jacket, 'hood', [0, 1.278, -0.086], [0.1, 0.048, 0.056], [0.35, 0, 0], 2);
  E(chest, jacket, 'hood', [0, 1.232, -0.104], [0.082, 0.07, 0.036], [0.12, 0, 0], 2);
  E(chest, jacket, 'hood', [0, 1.175, -0.112], [0.045, 0.04, 0.022], [0.05, 0, 0], 1);      // the hood's point
  for (const s of [1, -1]) {
    E(chest, jacket, 'hood', [s * 0.07, 1.285, -0.045], [0.034, 0.026, 0.055], [0.25, s * 0.4, 0], 1);   // side rolls
    E(chest, jacket, 'hood', [s * 0.045, 1.25, -0.128], [0.04, 0.014, 0.016], [0, 0, s * 0.5], 0);        // crease in the bag
  }

  // =================================================================================================
  // NECK + HEAD
  // =================================================================================================
  C(neck, skin, 'neck', [0, 1.405, -0.012], 0.046, [0, 1.275, -0.004], 0.056, 1, 1, 2);
  E(head, skin, 'face', [0, 1.462, -0.01], [0.076, 0.088, 0.093], null, 3);                 // skull
  E(head, skin, 'face', [0, 1.40, 0.018], [0.064, 0.07, 0.072], null, 2);                   // face / jaw mass
  C(head, skin, 'face', [0, 1.385, 0.03], 0.05, [0, 1.347, 0.053], 0.026, 1.1, 1, 1);       // jaw narrowing to the chin
  C(head, skin, 'face', [0, 1.446, 0.079], 0.008, [0, 1.414, 0.09], 0.012, 1, 1, 1);         // nose
  E(head, skin, 'face', [0, 1.461, 0.07], [0.058, 0.012, 0.02], null, 1);                   // brow ridge
  for (const s of [1, -1]) E(head, skin, 'face', [s * 0.078, 1.425, -0.008], [0.01, 0.03, 0.018], [0, s * 0.3, 0], 1);  // ears
  // hair: overlapping clumps, swept fringe, tapered nape
  E(head, hair, 'hair', [0, 1.487, -0.018], [0.081, 0.073, 0.09], null, 3);                // cap
  E(head, hair, 'hair', [0, 1.447, -0.05], [0.077, 0.068, 0.058], null, 2);                 // back of the head
  C(head, hair, 'hair', [0, 1.405, -0.066], 0.042, [0, 1.366, -0.056], 0.018, 1.35, 1, 1);     // nape taper
  E(head, hair, 'hair', [0.03, 1.435, -0.088], [0.033, 0.045, 0.02], [0, 0, -0.2], 1);       // back locks
  E(head, hair, 'hair', [-0.03, 1.43, -0.086], [0.033, 0.045, 0.02], [0, 0, 0.2], 1);
  E(head, hair, 'hair', [0, 1.47, -0.096], [0.04, 0.04, 0.02], null, 1);
  for (const s of [1, -1]) E(head, hair, 'hair', [s * 0.071, 1.468, -0.02], [0.02, 0.042, 0.07], null, 1);   // sides
  C(head, hair, 'hair', [-0.035, 1.524, 0.035], 0.03, [0.045, 1.487, 0.086], 0.016, 1, 1, 1);   // fringe swept to his left
  C(head, hair, 'hair', [-0.005, 1.527, 0.03], 0.03, [0.068, 1.478, 0.068], 0.015, 1, 1, 1);
  C(head, hair, 'hair', [-0.045, 1.522, 0.04], 0.026, [-0.062, 1.482, 0.07], 0.014, 1, 1, 1);
  E(head, hair, 'hair', [0.02, 1.533, -0.04], [0.05, 0.025, 0.06], [0, 0, -0.2], 1);        // crown tufts
  E(head, hair, 'hair', [-0.03, 1.528, -0.06], [0.045, 0.025, 0.05], [-0.3, 0, 0.25], 1);

  // =================================================================================================
  // ARMS (authored in the joint's own frame: the limb runs down local -Y)
  // =================================================================================================
  for (const [s, A] of [[1, L], [-1, R]]) {
    const U = 'armU' + s, F = 'armF' + s, H = 'hand' + s;
    E(A.sh, jacket, U, [0, 0, 0], 0.052, null, 2, true);                                     // shoulder ball, on the pivot
    E(A.sh, jacket, U, [s * 0.006, -0.045, 0], [0.046, 0.078, 0.052], null, 2, true);           // deltoid
    C(A.sh, jacket, U, [0, -0.02, 0], 0.047, [0, -0.25, 0], 0.041, 1, 1, 2, true);           // upper arm, ends in the elbow ball
    E(A.sh, jacket, U, [0, -0.13, 0.013], [0.036, 0.075, 0.038], null, 1, true);               // biceps
    E(A.sh, jacket, U, [0, -0.12, -0.014], [0.037, 0.085, 0.038], null, 1, true);               // triceps
    C(A.el, jacket, F, [0, 0, 0], 0.041, [0, -0.225, 0], 0.032, 1, 1, 2, true);               // forearm, starts in the elbow ball
    E(A.el, jacket, F, [s * 0.005, -0.075, -0.004], [0.04, 0.085, 0.043], null, 1, true);    // forearm muscle
    E(A.el, jacket, F, [0, -0.185, 0], [0.04, 0.035, 0.042], null, 1, true);                 // sleeve blousing over the cuff
    E(A.el, jacket, F, [0, -0.03, 0.027], [0.033, 0.011, 0.024], [0.4, 0, 0], 0, true);        // elbow folds
    E(A.el, jacket, F, [0, -0.058, 0.03], [0.032, 0.01, 0.023], [0.3, 0, 0], 0, true);
    C(A.el, skin, H, [0, -0.215, 0], 0.028, [0, -0.25, 0], 0.027, 0.85, 1, 1, true);          // wrist
    E(A.el, skin, H, [0, -0.293, 0.004], [0.021, 0.052, 0.044], null, 2, true);                // palm
    E(A.el, skin, H, [-s * 0.019, -0.35, 0.006], [0.023, 0.033, 0.041], null, 1, true);       // curled fingers
    E(A.el, skin, H, [s * 0.004, -0.335, 0.006], [0.02, 0.022, 0.044], null, 1, true);         // knuckle line
    C(A.el, skin, H, [-s * 0.004, -0.266, 0.038], 0.016, [-s * 0.02, -0.33, 0.052], 0.012, 1, 1, 1, true);  // thumb
  }

  // =================================================================================================
  // LEGS
  // =================================================================================================
  for (const [s, G] of [[1, LL], [-1, RL]]) {
    const x0 = s * 0.08, TH = 'thigh' + s, SH = 'shin' + s, SO = 'shoe' + s;
    C(G.hp, trouser, TH, [x0, 0.80, 0], 0.08, [x0, 0.43, 0], 0.052, 0.97, 1, 2);             // thigh: hip ball -> knee ball
    E(G.hp, trouser, TH, [x0 + s * 0.004, 0.66, 0.02], [0.062, 0.15, 0.06], null, 1);         // quad
    E(G.hp, trouser, TH, [x0, 0.64, -0.022], [0.058, 0.14, 0.055], null, 1);                  // hamstring
    E(G.hp, trouser, TH, [x0 - s * 0.014, 0.705, 0], [0.058, 0.11, 0.066], null, 1);             // inner thigh
    C(G.kn, trouser, SH, [x0, 0.43, 0], 0.052, [x0, 0.10, 0], 0.04, 1, 1, 2);                 // shin: knee ball -> ankle
    E(G.kn, trouser, SH, [x0, 0.425, 0.028], [0.036, 0.04, 0.03], null, 1);                   // kneecap
    E(G.kn, trouser, SH, [x0, 0.318, -0.02], [0.046, 0.115, 0.045], null, 2);                // calf belly, high on the back
    E(G.kn, trouser, SH, [x0, 0.30, 0.012], [0.038, 0.12, 0.035], null, 1);                   // shin front
    E(G.kn, trouser, SH, [x0, 0.116, 0.012], [0.05, 0.028, 0.055], null, 1);                  // trouser break over the shoe
    E(G.kn, trouser, SH, [x0, 0.152, -0.008], [0.047, 0.02, 0.05], [-0.2, 0, 0], 1);
    // trainer upper
    E(G.an, shoeM, SO, [x0, 0.05, 0.125], [0.045, 0.03, 0.058], null, 2);                     // toe box
    C(G.an, shoeM, SO, [x0, 0.095, 0.012], 0.04, [x0, 0.056, 0.11], 0.036, 1.05, 1, 2);       // sloped vamp
    E(G.an, shoeM, SO, [x0, 0.075, 0.0], [0.043, 0.04, 0.06], null, 1);                       // quarters
    E(G.an, dirtM, SO, [x0, 0.064, -0.04], [0.04, 0.046, 0.036], null, 2);                    // heel counter
    E(G.an, dirtM, SO, [x0 - s * 0.003, 0.042, 0.158], [0.04, 0.022, 0.03], null, 1);         // scuffed toe cap
    E(G.an, shoeM, SO, [x0, 0.116, 0.034], [0.026, 0.025, 0.014], [-0.5, 0, 0], 1);           // tongue
  }

  // ---- bake the clay ------------------------------------------------------------------------------
  {
    const bySet = new Map(), byJoint = new Map();
    for (const b of blobs) {
      if (!bySet.has(b.set)) bySet.set(b.set, []); bySet.get(b.set).push(b);
      if (!byJoint.has(b.joint)) byJoint.set(b.joint, []); byJoint.get(b.joint).push(b);
    }
    const P = new V3(), N = new V3();
    for (const b of blobs) {
      const [S, Hh] = RES[b.res], prof = [];
      for (let j = 1; j <= Hh; j++) { const ph = (j / Hh) * Math.PI / 2; prof.push([b.r0 * Math.sin(ph), b.r0 * Math.cos(ph)]); }
      for (let j = b.len > 0 ? 0 : 1; j < Hh; j++) { const ph = Math.PI / 2 + (j / Hh) * Math.PI / 2; prof.push([b.r1 * Math.sin(ph), -b.len + b.r1 * Math.cos(ph)]); }
      const loc = [[0, b.r0, 0]];
      for (const [r, y] of prof) for (let k = 0; k < S; k++) { const a = (k / S) * Math.PI * 2; loc.push([r * Math.cos(a), y, r * Math.sin(a)]); }
      loc.push([0, -b.len - b.r1, 0]);
      const sibs = byJoint.get(b.joint).filter((o) => o !== b), set = bySet.get(b.set), lam = LAM[b.set] || 0.012;
      const wp = [], wn = [], inside = [];
      for (const l of loc) {
        P.set(l[0], l[1], l[2]).applyMatrix4(b.Mw);
        const ins = []; for (let i = 0; i < sibs.length; i++) if (field(sibs[i], P) < -0.0015) ins.push(i);
        fusedNormal(P, set, lam, N);
        wp.push(P.x, P.y, P.z); wn.push(N.x, N.y, N.z); inside.push(ins);
      }
      const B = bucket(b.joint, b.mat);
      const tri = (i0, i1, i2) => {
        const a = inside[i0]; if (a.length && a.some((x) => inside[i1].includes(x) && inside[i2].includes(x))) return;
        for (const i of [i0, i1, i2]) { B.pos.push(wp[i * 3], wp[i * 3 + 1], wp[i * 3 + 2]); B.nrm.push(wn[i * 3], wn[i * 3 + 1], wn[i * 3 + 2]); }
      };
      const rings = prof.length, last = loc.length - 1, at = (j, k) => 1 + j * S + (k % S);
      for (let k = 0; k < S; k++) {
        tri(0, at(0, k + 1), at(0, k));
        for (let j = 0; j < rings - 1; j++) { tri(at(j, k), at(j, k + 1), at(j + 1, k)); tri(at(j, k + 1), at(j + 1, k + 1), at(j + 1, k)); }
        tri(last, at(rings - 1, k), at(rings - 1, k + 1));
      }
    }
  }

  // =================================================================================================
  // CLOTHING DETAIL laid over the clay
  // =================================================================================================
  const torso = setOf(['torsoUp', 'torsoLow']), seat = setOf(['pelvis']);
  const ZF = new V3(0, 0, 1), ZB = new V3(0, 0, -1), UP = new V3(0, 1, 0);
  // ribbed blouson hem
  { const r = ellipseRing(0, 0.886, -0.002, 0.15, 0.11, 24); addGeo(spine, rib, sweep(r.pts, r.nr, 0.025, 0.014, true, 6)); }
  // zip: upper run on the chest, lower run on the spine
  laid(chest, pouchM, torso, (t) => [new V3(0, 1.285 - t * 0.2, 0), ZF], 8, 0.006, 0.003, { radial: 4, lift: 0.001 });
  laid(spine, pouchM, torso, (t) => [new V3(0, 1.09 - t * 0.175, 0), ZF], 7, 0.006, 0.003, { radial: 4, lift: 0.001 });
  for (const s of [1, -1]) {
    // hand-pocket welts, drawstrings
    laid(spine, rib, torso, (t) => [new V3(s * (0.055 + t * 0.06), 1.035 - t * 0.095, 0), ZF], 6, 0.007, 0.004, { radial: 4 });
    laid(chest, rib, torso, (t) => [new V3(s * (0.03 + t * 0.012), 1.285 - t * 0.13, 0), ZF], 7, 0.0035, 0.003, { radial: 4, lift: 0.002 });
    // raglan seams front and back, from the neck to the armpit
    laid(chest, rib, torso, (t) => [new V3(s * (0.05 + t * 0.085), 1.29 - t * 0.095 - 0.006 * Math.sin(t * Math.PI), 0), ZB], 9, 0.0045, 0.0035, { radial: 3 });
    laid(chest, rib, torso, (t) => [new V3(s * (0.05 + t * 0.062), 1.283 - t * 0.07, 0), ZF], 9, 0.0045, 0.0035, { radial: 3 });
  }
  // back yoke seam
  laid(chest, rib, torso, (t) => [new V3(-0.135 + t * 0.27, 1.168 + 0.012 * Math.sin(t * Math.PI), 0), ZB], 11, 0.0045, 0.0035, { radial: 3 });
  // hood rim: a ribbed horseshoe round the neck, open at the throat
  {
    const pts = [], nr = [];
    for (let i = 0; i <= 16; i++) {
      const a = -2.35 + (i / 16) * 4.7, fr = (1 - Math.cos(a)) / 2;
      pts.push(new V3(0.068 * Math.sin(a), 1.318 - 0.04 * fr * fr, -0.012 - 0.07 * Math.cos(a)));
      nr.push(new V3(Math.sin(a), 0.55, -Math.cos(a)).normalize());
    }
    addGeo(chest, rib, sweep(pts, nr, 0.018, 0.012, false, 6));
  }
  // cross-body strap: a closed loop from the LEFT shoulder (+X) to the right hip, projected on the torso
  let pouchAt = null, slideAt = null;
  {
    // a taut strap follows the CONVEX HULL of the torso section it wraps, so it bridges creases instead of dipping into them
    const u = new V3(0.25, 0.34, 0).normalize(), O = new V3(-0.025, 1.14, 0), raw = [];
    for (let i = 0; i < 72; i++) {
      const a = (i / 72) * Math.PI * 2, h = hit(torso, O, new V3().copy(u).multiplyScalar(Math.cos(a)).addScaledVector(ZF, Math.sin(a)));
      if (h) { const d = h.p.clone().sub(O); raw.push([d.dot(u), d.z]); }
    }
    const crs = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]), hull = [];
    const start = raw.reduce((m, p, i) => (p[0] < raw[m][0] ? i : m), 0);
    for (let k = 0; k <= raw.length; k++) {           // Graham scan over the angularly ordered (star-shaped) section
      const p = raw[(start + k) % raw.length];
      while (hull.length >= 2 && crs(hull[hull.length - 2], hull[hull.length - 1], p) <= 0) hull.pop();
      hull.push(p);
    }
    hull.pop();
    let per = 0; const segL = hull.map((p, i) => { const q = hull[(i + 1) % hull.length], l = Math.hypot(q[0] - p[0], q[1] - p[1]); per += l; return l; });
    const n = 56, pts = [], nr = [];
    for (let i = 0, k = 0, acc0 = 0; i < n; i++) {
      const d = (i / n) * per; while (acc0 + segL[k] < d) { acc0 += segL[k]; k++; }
      const p = hull[k], q = hull[(k + 1) % hull.length], t = (d - acc0) / segL[k];
      pts.push(O.clone().addScaledVector(u, p[0] + (q[0] - p[0]) * t).addScaledVector(ZF, p[1] + (q[1] - p[1]) * t));
    }
    smooth(pts, 2, true);
    const w = new V3().crossVectors(u, ZF).normalize();
    for (let i = 0; i < n; i++) {
      const T = pts[(i + 1) % n].clone().sub(pts[(i - 1 + n) % n]).normalize(), N = new V3().crossVectors(T, w);
      if (N.dot(pts[i].clone().sub(O)) < 0) N.negate(); nr.push(N);
    }
    addGeo(chest, strapM, sweep(pts, nr, 0.018, 0.004, true, 4, 0.008));
    const res = { pts, nr };
    let bestB = 1e9, bestF = 1e9;
    res.pts.forEach((p, i) => {
      const tan = res.pts[(i + 1) % res.pts.length].clone().sub(res.pts[(i - 1 + res.pts.length) % res.pts.length]).normalize();
      if (tan.y < 0) tan.negate();
      if (res.nr[i].z < -0.5 && Math.abs(p.y - 1.185) < bestB) { bestB = Math.abs(p.y - 1.185); pouchAt = { p, n: res.nr[i], tan }; }
      if (res.nr[i].z > 0.5 && Math.abs(p.y - 1.17) < bestF) { bestF = Math.abs(p.y - 1.17); slideAt = { p, n: res.nr[i], tan }; }
    });
  }
  if (pouchAt) {   // pouch riding the strap on the back of the left shoulder; seated on a plane fitted to the back under it
    const sd = new V3().crossVectors(pouchAt.tan, pouchAt.n).normalize(), back = pouchAt.n.clone().negate();
    const c4 = [[0.045, 0], [-0.045, 0], [0, 0.03], [0, -0.03]].map(([a, b]) => {
      const A = pouchAt.p.clone().addScaledVector(pouchAt.tan, a).addScaledVector(sd, b).addScaledVector(pouchAt.n, -0.12);
      const h = hit(torso, A, pouchAt.n, 0.3); return h ? h.p : pouchAt.p.clone();
    });
    const pn = new V3().crossVectors(c4[0].clone().sub(c4[1]), c4[2].clone().sub(c4[3])).normalize(); if (pn.dot(pouchAt.n) < 0) pn.negate();
    const pc = c4[0].clone().add(c4[1]).add(c4[2]).add(c4[3]).multiplyScalar(0.25);
    pouchAt = { p: pc, n: pn, tan: pouchAt.tan };
    const f = (out) => frame(pouchAt.p, pouchAt.n, pouchAt.tan, out);
    addGeo(chest, pouchM, slab(0.082, 0.125, 0.02, 0.014, 0.01, 2), f(0.01));
    addGeo(chest, strapM, slab(0.088, 0.05, 0.016, 0.006, 0.006, 2), f(0.04).multiply(new M4().makeTranslation(0, 0.036, 0)));   // flap
    addGeo(chest, buckleM, slab(0.022, 0.014, 0.004, 0.004, 0.003, 1), f(0.051).multiply(new M4().makeTranslation(0, 0.018, 0)));
    addGeo(chest, strapM, slab(0.03, 0.15, 0.008, 0.003, 0.003, 1), f(0.004));                                               // webbing under the pouch
  }
  if (slideAt) addGeo(chest, buckleM, slab(0.05, 0.026, 0.006, 0.004, 0.004, 1), frame(slideAt.p, slideAt.n, slideAt.tan, 0.008));
  // back pockets stitched on the seat
  for (const s of [1, -1]) {
    const cx = s * 0.072, loop = [[-0.04, 0.83], [-0.04, 0.78], [-0.02, 0.752], [0, 0.744], [0.02, 0.752], [0.04, 0.78], [0.04, 0.83], [0, 0.832]];
    laid(hips, stitch, seat, (t) => {
      const k = t * loop.length, i = Math.floor(k) % loop.length, j = (i + 1) % loop.length, f = k - Math.floor(k);
      return [new V3(cx + loop[i][0] + (loop[j][0] - loop[i][0]) * f, loop[i][1] + (loop[j][1] - loop[i][1]) * f, 0), ZB];
    }, 20, 0.004, 0.003, { closed: true, smooth: 1, radial: 3 });
  }
  // sleeves: ribbed cuffs
  for (const [s, A] of [[1, L], [-1, R]]) {
    const pts = [], nr = [];
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      pts.push(new V3(0.034 * Math.cos(a), -0.222, 0.035 * Math.sin(a)).applyMatrix4(A.el.matrixWorld));
      nr.push(new V3(Math.cos(a), 0, Math.sin(a)).transformDirection(A.el.matrixWorld));
    }
    addGeo(A.el, rib, sweep(pts, nr, 0.021, 0.011, true, 6));
  }
  // legs: outer side seams, trouser hems, and the trainers' soles, collars, laces
  const solePts = [[0, -0.076], [0.03, -0.064], [0.04, -0.015], [0.05, 0.075], [0.046, 0.135], [0.024, 0.176], [-0.006, 0.186], [-0.034, 0.166], [-0.047, 0.10], [-0.039, 0.02], [-0.035, -0.05]];
  for (const [s, G] of [[1, LL], [-1, RL]]) {
    const x0 = s * 0.08, side = new V3(s, 0, 0);
    laid(G.hp, stitch, setOf(['thigh' + s]), (t) => [new V3(x0, 0.77 - t * 0.31, -0.004), side], 7, 0.004, 0.003, { radial: 3 });
    laid(G.kn, stitch, setOf(['shin' + s]), (t) => [new V3(x0, 0.40 - t * 0.27, -0.004), side], 6, 0.004, 0.003, { radial: 3 });
    { const r = ellipseRing(x0, 0.099, 0.006, 0.05, 0.056, 12); addGeo(G.kn, stitch, sweep(r.pts, r.nr, 0.012, 0.006, true, 4)); }
    { const r = ellipseRing(x0, 0.113, -0.004, 0.036, 0.043, 10); addGeo(G.an, dirtM, sweep(r.pts, r.nr, 0.011, 0.008, true, 4)); }
    const shoeSet = setOf(['shoe' + s]);
    for (let i = 0; i < 3; i++) {
      const z = 0.05 + i * 0.024;
      laid(G.an, dirtM, shoeSet, (t) => [new V3(x0 - 0.024 + t * 0.048, 0.04, z), UP], 5, 0.0035, 0.003, { radial: 3, far: 0.12, smooth: 1 });
    }
    // soles: foot-shaped plan, bevelled, then bent into a toe spring and a heel wedge
    const shape = new THREE.Shape(); shape.moveTo(s * solePts[0][0], solePts[0][1]);
    shape.splineThru(solePts.slice(1).concat([solePts[0]]).map(([x, z]) => new THREE.Vector2(s * x, z)));
    const bend = (geo, top, thick) => {
      geo.rotateX(Math.PI / 2); geo.computeBoundingBox();
      const bb = geo.boundingBox, p = geo.attributes.position;
      for (let i = 0; i < p.count; i++) {
        const z = p.getZ(i), h = (p.getY(i) - bb.min.y) / (bb.max.y - bb.min.y);
        let y = top - thick + h * thick;
        y += h * thick * 0.45 * Math.min(1, Math.max(0, (0.07 - z) / 0.13));          // heel wedge
        if (z > 0.09) y += 2.4 * (z - 0.09) * (z - 0.09);                            // toe spring
        if (z < -0.045) y += 3.0 * (z + 0.045) * (z + 0.045);                        // heel roll
        p.setXYZ(i, p.getX(i) + x0, y, z);
      }
      return weldNormals(geo, 0.3);
    };
    const ex = (depth, bevel, seg, grow) => new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelOffset: grow, bevelSegments: seg, curveSegments: 2, steps: 1 });
    addGeo(G.an, soleM, bend(ex(0.006, 0.004, 1, -0.003), 0.014, 0.014));
    addGeo(G.an, shoeM, bend(ex(0.018, 0.007, 2, -0.004), 0.046, 0.034));
  }
  // face: eyes, brows, mouth, set into the surface
  {
    const face = setOf(['face']);
    const put = (mat, x, y, r, rot) => {
      const h = hit(face, new V3(x, y, 0), ZF, 0.3); if (!h) return;
      const m = new M4().compose(h.p.clone().addScaledVector(h.n, -r[2] * 0.35), new Q().setFromEuler(new THREE.Euler(0, Math.atan2(h.n.x, h.n.z), rot)), new V3(...r));
      addGeo(head, mat, new THREE.SphereGeometry(1, 8, 6), m);
    };
    for (const s of [1, -1]) { put(hair, s * 0.03, 1.441, [0.0085, 0.006, 0.005], 0); put(hair, s * 0.032, 1.463, [0.02, 0.0045, 0.006], -s * 0.12); }
    put(lip, 0, 1.376, [0.02, 0.0055, 0.006], 0);
  }

  // ---- emit meshes: world rest space -> joint space, with box-projected UVs for the surface recipes
  for (const { joint, mat, pos, nrm } of acc.values()) {
    const inv = joint.matrixWorld.clone().invert(), n = pos.length / 3, p = new V3(), q = new V3();
    const P = new Float32Array(pos.length), Nn = new Float32Array(pos.length), UV = new Float32Array(n * 2), bb = new THREE.Box3();
    for (let i = 0; i < n; i++) {
      p.set(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]).applyMatrix4(inv); q.set(nrm[i * 3], nrm[i * 3 + 1], nrm[i * 3 + 2]).transformDirection(inv);
      P[i * 3] = p.x; P[i * 3 + 1] = p.y; P[i * 3 + 2] = p.z; Nn[i * 3] = q.x; Nn[i * 3 + 1] = q.y; Nn[i * 3 + 2] = q.z; bb.expandByPoint(p);
    }
    const sz = bb.getSize(new V3()), sh = Math.max(sz.x, sz.z, 1e-4), sy = Math.max(sz.y, 1e-4);
    for (let i = 0; i < n; i++) {
      const ax = Math.abs(Nn[i * 3]), az = Math.abs(Nn[i * 3 + 2]);
      UV[i * 2] = ((ax > az ? P[i * 3 + 2] - bb.min.z : P[i * 3] - bb.min.x)) / sh;
      UV[i * 2 + 1] = (P[i * 3 + 1] - bb.min.y) / sy;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(P, 3));
    geo.setAttribute('normal', new THREE.BufferAttribute(Nn, 3));
    geo.setAttribute('uv', new THREE.BufferAttribute(UV, 2));
    joint.add(new THREE.Mesh(geo, mat));
  }

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
  // @@POSE@@

  const box = new THREE.Box3(), v = new THREE.Vector3();
  g.updateMatrixWorld(true);
  g.traverse((n) => { const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    for (let i = 0; i < p.count; i++) box.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(n.matrixWorld)); });
  const c = box.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= box.min.y; o.position.z -= c.z; });
  return g;
}
