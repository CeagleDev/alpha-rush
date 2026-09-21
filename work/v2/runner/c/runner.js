/**
 * runner - candidate C: DEFORMED PRIMITIVES. Every body segment starts as a well-subdivided
 * SphereGeometry whose vertices are re-written by `tube()`: a radius-by-height profile
 * (separate half-width, front depth, back depth and centre offset per control point, Hermite
 * interpolated), true ellipsoidal end caps, gaussian directional bulges (pecs, shoulder blades,
 * glutes, calf belly) and low-amplitude sine cloth folds; then computeVertexNormals() + a
 * position-keyed normal weld so the sphere seam never shows. Trims are bevelled ExtrudeGeometry,
 * seams / drawstrings are TubeGeometry, the strap is a TorusGeometry re-written onto the torso surface.
 *
 * 1.56 m, ~6.6 heads, stylised-athletic. Facing +Z; the figure's LEFT is +X.
 * Anchors (world m): sole 0, ankle 0.075, knee 0.425, hip 0.79, hips-root 0.85, spine 0.93,
 * chest 1.08, shoulder 1.258, neck 1.315, head 1.37 (chin 1.325), crown 1.56.
 * elbow 1.00, wrist 0.78.
 * Every limb hangs down its joint's local -Y, so +rotation.x pitches it BACKWARD.
 * Joints are hidden by OVERLAP: each limb segment ends in a cap that is circular in the YZ plane
 * and centred exactly on the joint, so rotation.x slides sphere inside sphere and no gap can open.
 */
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, roughness = 0.88, metalness = 0) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness });
    if (name) m.name = name;
    return m;
  };
  const jacket = M(0xb8571f, 'fabric', 0.9);
  const jacketDk = M(0xa04a1b, 'fabric', 0.94);        // ribs, hood lining edge, panels
  const trouser = M(0x26272b, 'fabric', 0.92);
  const strapM = M(0x2c2c2e, 'fabric', 0.9);
  const pouchM = M(0x3a3b3d, 'fabric', 0.88);
  const metal = M(0x7a7f84, 'metal', 0.5, 0.4);
  const shoeM = M(0xbdb8ad, 'fabric', 0.7);
  const shoeDirt = M(0x8e887d, 'fabric', 0.8);
  const soleM = M(0x1a1819, undefined, 0.9);
  const skin = new THREE.MeshStandardMaterial({ color: 0xa97f5e, roughness: 0.65 });
  const hairM = M(0x15110f, 'fabric', 0.8);

  /* ---------------------------------------------------------------- helpers */
  const PI = Math.PI;
  const wrap = (a) => { while (a > PI) a -= 2 * PI; while (a < -PI) a += 2 * PI; return a; };
  const sstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const norm = (P) => P.map((p) => { const rx = p[1], rf = p[2] ?? rx, rb = p[3] ?? rf; return [p[0], rx, rf, rb, p[4] || 0, p[5] || 0]; });
  // Hermite interpolation of a profile [[y, rx, rF, rB, cx, cz], ...] at height y
  function evalProf(P, y) {
    const n = P.length;
    if (y <= P[0][0]) return P[0].slice(1);
    if (y >= P[n - 1][0]) return P[n - 1].slice(1);
    let i = 0; while (i < n - 2 && y > P[i + 1][0]) i++;
    const a = P[i], b = P[i + 1], h = b[0] - a[0], t = (y - a[0]) / h;
    const pa = P[Math.max(0, i - 1)], pb = P[Math.min(n - 1, i + 2)];
    const t2 = t * t, t3 = t2 * t;
    const h00 = 2 * t3 - 3 * t2 + 1, h10 = t3 - 2 * t2 + t, h01 = -2 * t3 + 3 * t2, h11 = t3 - t2;
    const out = [];
    for (let k = 1; k < 6; k++) {
      const ma = (b[k] - pa[k]) / (b[0] - pa[0]), mb = (pb[k] - a[k]) / (pb[0] - a[0]);
      out.push(h00 * a[k] + h10 * h * ma + h01 * b[k] + h11 * h * mb);
    }
    return out;
  }
  // surface function of a profile: (y, ang, capFactor) -> [x, y, z];  ang 0 = +Z (front), +PI/2 = +X
  function surfOf(o) {
    const P = norm(o.prof), e = o.sq || 1, bulges = o.bulges || [];
    const f = (y, ang, k = 1) => {
      const p = evalProf(P, y), s = Math.sin(ang), c = Math.cos(ang);
      const ss = Math.sign(s) * Math.pow(Math.abs(s), e), cc = Math.sign(c) * Math.pow(Math.abs(c), e);
      let x = p[0] * ss * k, z = (c >= 0 ? p[1] : p[2]) * cc * k, d = 0;
      for (const b of bulges) { const dy = (y - b.y) / b.h, da = wrap(ang - b.a) / b.w; d += b.amp * Math.exp(-dy * dy - da * da); }
      if (o.ripple) d += o.ripple(y, ang);
      d *= k;
      const len = Math.hypot(x, z) || 1;
      return [x + (x / len) * d + p[3], y, z + (z / len) * d + p[4]];
    };
    f.P = P;
    return f;
  }
  function weldNormals(geo) {
    const p = geo.attributes.position, nn = geo.attributes.normal, map = new Map();
    for (let i = 0; i < p.count; i++) {
      const k = Math.round(p.getX(i) * 2e4) + '_' + Math.round(p.getY(i) * 2e4) + '_' + Math.round(p.getZ(i) * 2e4);
      let a = map.get(k); if (!a) { a = [0, 0, 0, []]; map.set(k, a); }
      a[0] += nn.getX(i); a[1] += nn.getY(i); a[2] += nn.getZ(i); a[3].push(i);
    }
    for (const a of map.values()) {
      const l = Math.hypot(a[0], a[1], a[2]) || 1;
      for (const i of a[3]) nn.setXYZ(i, a[0] / l, a[1] / l, a[2] / l);
    }
    return geo;
  }
  // THE deformer: a subdivided sphere re-written as a capped profile tube along +Y.
  function tube(o) {
    const S = o.surf || surfOf(o), P = S.P;
    const geo = new THREE.SphereGeometry(1, o.radial || 16, o.rings || 12);
    const y0 = o.y0 ?? P[0][0], y1 = o.y1 ?? P[P.length - 1][0];
    const cB = o.capB ?? 0.01, cT = o.capT ?? 0.01, aB = cB * 1.35, aT = cT * 1.35;
    const L = aB + (y1 - y0 - cB - cT) + aT, pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const px = pos.getX(i), py = Math.max(-1, Math.min(1, pos.getY(i))), pz = pos.getZ(i);
      const ang = Math.atan2(px, pz), l = (1 - Math.acos(py) / PI) * L;
      let y, k = 1;
      if (l < aB) { const th = (l / aB) * PI / 2; y = y0 + cB * (1 - Math.cos(th)); k = Math.sin(th); }
      else if (l > L - aT) { const th = ((L - l) / aT) * PI / 2; y = y1 - cT * (1 - Math.cos(th)); k = Math.sin(th); }
      else y = y0 + cB + (l - aB);
      if (o.ymap) y = o.ymap(y, ang);
      let q = S(y, ang, k);
      if (o.post) q = o.post(q[0], q[1], q[2], ang, k) || q;
      pos.setXYZ(i, q[0], q[1], q[2]);
    }
    geo.computeVertexNormals();
    return weldNormals(geo);
  }
  const ell = (rx, ry, rz, R = 12, H = 8) => { const s = new THREE.SphereGeometry(1, R, H); s.scale(rx, ry, rz); return s; };
  const _e = new THREE.Euler(), _m = new THREE.Matrix4();
  const place = (geo, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) => {
    if (rx || ry || rz) geo.applyMatrix4(_m.makeRotationFromEuler(_e.set(rx, ry, rz)));
    geo.translate(x, y, z); return geo;
  };
  // concatenate geometries (position / normal / uv) into one non-indexed geometry
  function merge(geos) {
    const parts = geos.map((q) => (q.index ? q.toNonIndexed() : q));
    let n = 0; for (const q of parts) n += q.attributes.position.count;
    const P = new Float32Array(n * 3), N = new Float32Array(n * 3), U = new Float32Array(n * 2);
    let o = 0;
    for (const q of parts) {
      const c = q.attributes.position.count;
      P.set(q.attributes.position.array.subarray(0, c * 3), o * 3);
      N.set(q.attributes.normal.array.subarray(0, c * 3), o * 3);
      if (q.attributes.uv) U.set(q.attributes.uv.array.subarray(0, c * 2), o * 2);
      o += c;
    }
    const out = new THREE.BufferGeometry();
    out.setAttribute('position', new THREE.BufferAttribute(P, 3));
    out.setAttribute('normal', new THREE.BufferAttribute(N, 3));
    out.setAttribute('uv', new THREE.BufferAttribute(U, 2));
    return out;
  }
  const add = (parent, mat, ...geos) => { const m = new THREE.Mesh(geos.length > 1 ? merge(geos) : geos[0], mat); parent.add(m); return m; };
  const J = (x, y, z, parent) => { const o = new THREE.Object3D(); o.position.set(x, y, z); parent.add(o); return o; };
  const V = (a) => new THREE.Vector3(a[0], a[1], a[2]);
  const seam = (pts, r = 0.003, seg = 16, closed = false) =>
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(V), closed), seg, r, 5, closed);
  // bevelled rounded-rectangle plate, centred, thickness along +Z
  function plate(w, h, d, r, bevel = 0.004) {
    const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
    s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
    const e = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 1, curveSegments: 2, steps: 1 });
    e.translate(0, 0, -d / 2);
    return e;
  }
  // orient a geometry built in (X right, Y up, Z out) onto a surface frame
  const onFrame = (geo, fr, lift = 0) => {
    _m.makeBasis(fr.x, fr.y, fr.n); _m.setPosition(fr.p.clone().addScaledVector(fr.n, lift));
    geo.applyMatrix4(_m); return geo;
  };
  // frame on a surface function at (y, ang): n outward, y = up along the surface, x = n-cross
  function frameAt(S, y, ang) {
    const p = V(S(y, ang)), da = V(S(y, ang + 0.02)).sub(V(S(y, ang - 0.02))), dy = V(S(y + 0.004, ang)).sub(V(S(y - 0.004, ang)));
    const n = new THREE.Vector3().crossVectors(da, dy).normalize();
    const up = dy.normalize(), x = new THREE.Vector3().crossVectors(up, n).normalize();
    up.crossVectors(n, x).normalize();
    return { p, n, x, y: up };
  }

  // bend a flat trim (X across, Y up, Z thickness) onto a surface so it follows the cloth instead of floating
  function wrapOn(geo, S, yc, ac, lift = 0, tilt = 0) {
    const c0 = S(yc, ac), R = Math.hypot(c0[0] - S.P[0][4], c0[2] - S.P[0][5]) || 0.1, p = geo.attributes.position, ct = Math.cos(tilt), st = Math.sin(tilt);
    for (let i = 0; i < p.count; i++) {
      const x0 = p.getX(i), y0 = p.getY(i), x = x0 * ct - y0 * st, y = x0 * st + y0 * ct;
      const f = frameAt(S, yc + y, ac + x / R), q = f.p.addScaledVector(f.n, p.getZ(i) + lift);
      p.setXYZ(i, q.x, q.y, q.z);
    }
    geo.computeVertexNormals(); return geo;
  }

  const root = new THREE.Object3D(); g.add(root);

  /* ---------------------------------------------------------------- torso surface (chest-local y; world = 1.08 + y) */
  const torsoS = surfOf({
    sq: 0.9,
    prof: [
      [-0.200, 0.152, 0.098, 0.106],
      [-0.165, 0.159, 0.105, 0.113],   // blouson overhang above the rib
      [-0.120, 0.152, 0.100, 0.104],
      [-0.060, 0.143, 0.094, 0.093],   // waist
      [0.020, 0.148, 0.101, 0.097],
      [0.100, 0.157, 0.109, 0.103],    // chest forward, shoulder blades back
      [0.160, 0.156, 0.103, 0.102],
      [0.200, 0.150, 0.092, 0.097, 0, -0.004],
      [0.226, 0.126, 0.078, 0.086, 0, -0.006],   // trapezius slope
      [0.246, 0.088, 0.064, 0.072, 0, -0.006],
      [0.262, 0.060, 0.056, 0.062, 0, -0.006],
    ],
    bulges: [
      { y: 0.105, h: 0.06, a: 0.42, w: 0.38, amp: 0.008 }, { y: 0.105, h: 0.06, a: -0.42, w: 0.38, amp: 0.008 },   // pecs under cloth
      { y: 0.115, h: 0.07, a: PI - 0.5, w: 0.36, amp: 0.010 }, { y: 0.115, h: 0.07, a: PI + 0.5, w: 0.36, amp: 0.010 }, // shoulder blades
      { y: 0.03, h: 0.12, a: PI, w: 0.16, amp: -0.007 },                                                          // spine furrow
      { y: -0.15, h: 0.04, a: PI, w: 0.9, amp: 0.006 },                                                           // cloth pooling at the back hem
    ],
    // waist folds: slanted low sine ridges, strongest at the sides and back
    ripple: (y, a) => {
      const w = sstep(-0.19, -0.15, y) * (1 - sstep(-0.085, -0.035, y));
      if (w <= 0) return 0;
      const patch = 0.25 + 0.75 * (0.5 + 0.5 * Math.sin(a * 2 + 1.0)) * (0.4 + 0.6 * Math.abs(Math.sin(a * 0.5 + 0.4)));
      return 0.0036 * w * patch * Math.sin(y * 120 + Math.sin(a * 2) * 2.2 + a * 3.0);
    },
  });

  /* ---------------------------------------------------------------- hips (root joint, world 0.85) */
  const hips = J(0, 0.85, 0, root);
  const pelvisS = surfOf({
    sq: 0.92,
    prof: [
      [-0.150, 0.045, 0.044, 0.066],
      [-0.085, 0.122, 0.054, 0.098],
      [-0.035, 0.147, 0.071, 0.102],   // glutes back
      [0.020, 0.140, 0.084, 0.088],
      [0.075, 0.132, 0.080, 0.080],
    ],
    bulges: [
      { y: -0.045, h: 0.055, a: PI - 0.48, w: 0.42, amp: 0.016 }, { y: -0.045, h: 0.055, a: PI + 0.48, w: 0.42, amp: 0.016 },
      { y: -0.06, h: 0.07, a: PI, w: 0.12, amp: -0.010 },          // cleft between the glutes
      { y: -0.02, h: 0.04, a: 0, w: 0.5, amp: 0.003 },             // fly
    ],
  });
  add(hips, trouser, tube({ surf: pelvisS, y0: -0.150, y1: 0.075, capB: 0.085, capT: 0.02, radial: 20, rings: 10 }));
  { // back pockets following the seat + belt loops + waistband
    const gs = [];
    for (const s of [-1, 1]) gs.push(wrapOn(plate(0.066, 0.070, 0.002, 0.012, 0.0025), pelvisS, -0.030, PI + s * 0.52, 0.0015, s * 0.06));
    add(hips, trouser, ...gs);
  }

  /* ---------------------------------------------------------------- spine (world 0.93) - jacket skirt + rib hem */
  const spine = J(0, 0.08, 0, hips);
  const SP = 0.15;   // chest-local -> spine-local
  add(spine, jacket, place(tube({ surf: torsoS, y0: -0.192, y1: 0.06, capB: 0.032, capT: 0.015, radial: 24, rings: 12,
    post: (x, y, z) => { const k = 1 - 0.022 * sstep(0.0, 0.045, y); /* above the chest joint the skirt slides under the chest piece at ~3 degrees: no groove, no z-fight */ return [x * k, y, z * k]; } }), 0, SP, 0));
  { // ribbed hem: tucked in under the blouson, vertical rib ridges
    const ribS = surfOf({ sq: 0.9, prof: [[-0.232, 0.144, 0.090, 0.097], [-0.205, 0.146, 0.092, 0.099], [-0.170, 0.144, 0.092, 0.099]],
      ripple: (y, a) => 0.0016 * Math.cos(a * 28) });
    add(spine, jacketDk, place(tube({ surf: ribS, y0: -0.232, y1: -0.165, capB: 0.008, capT: 0.01, radial: 56, rings: 4 }), 0, SP, 0));
  }
  { // zip lower run + slanted welt pockets
    const pts = []; for (let i = 0; i <= 6; i++) { const y = -0.225 + i * 0.037; const p = (y < -0.17 ? surfOf({ sq: 0.9, prof: [[-0.232, 0.144, 0.092, 0.099], [-0.170, 0.144, 0.094, 0.099]] }) : torsoS)(y, 0); pts.push([0, p[1] + SP, p[2] + 0.002]); }
    const gs = [seam(pts, 0.0042, 10)];
    for (const s of [-1, 1]) {
      gs.push(place(wrapOn(plate(0.014, 0.100, 0.002, 0.005, 0.0025), torsoS, -0.105, s * 0.74, 0.001, s * -0.32), 0, SP, 0));
    }
    add(spine, jacketDk, ...gs);
  }

  /* ---------------------------------------------------------------- chest (world 1.08) */
  const chest = J(0, 0.15, 0, spine);
  add(chest, jacket, tube({ surf: torsoS, y0: -0.06, y1: 0.262, capB: 0.012, capT: 0.014, radial: 24, rings: 17,
    post: (x, y, z) => { const k = 1 - 0.022 * (1 - sstep(-0.05, 0.0, y)); return [x * k, y, z * k]; } }));   // and below it the chest slides under the skirt
  { // dark trims: zip upper run, yoke seam across the back, set-in sleeve seams, chest pocket welt
    const zp = []; for (let i = 0; i <= 7; i++) { const y = -0.035 + i * 0.036; const p = torsoS(y, 0); zp.push([0, p[1], p[2] + 0.002]); }
    const yoke = []; for (let i = 0; i <= 14; i++) { const a = PI - 1.35 + i * (2.7 / 14); const p = torsoS(0.128 - 0.02 * Math.cos((a - PI) * 1.1), a); yoke.push([p[0] * 1.012, p[1], p[2] * 1.012]); }
    const gs = [seam(zp, 0.0042, 12), seam(yoke, 0.0028, 18)];
    gs.push(wrapOn(plate(0.066, 0.009, 0.002, 0.003, 0.002), torsoS, 0.070, 0.62, 0.001, -0.05));
    add(chest, jacketDk, ...gs);
  }
  { // HOOD: a soft bag of cloth lying on the upper back + a rolled rim round the neck (hero surface)
    const hoodS = surfOf({
      prof: [
        [0.100, 0.030, 0.020, 0.024, 0, -0.112],
        [0.135, 0.080, 0.040, 0.050, 0, -0.114],
        [0.180, 0.110, 0.060, 0.062, 0, -0.103],
        [0.235, 0.118, 0.080, 0.064, 0, -0.078],
        [0.275, 0.100, 0.085, 0.060, 0, -0.058],
        [0.300, 0.060, 0.060, 0.040, 0, -0.050],
      ],
      bulges: [{ y: 0.20, h: 0.07, a: PI, w: 0.25, amp: -0.008 }, { y: 0.19, h: 0.06, a: PI - 0.75, w: 0.3, amp: 0.006 }, { y: 0.19, h: 0.06, a: PI + 0.75, w: 0.3, amp: 0.006 }],
      ripple: (y, a) => (0.0045 * Math.sin(wrap(a - PI) * 6 + y * 55) + 0.003 * Math.sin(y * 120 + wrap(a - PI) * 2)) * sstep(0.10, 0.15, y) * (1 - sstep(0.24, 0.28, y)),
    });
    add(chest, jacket, tube({ surf: hoodS, y0: 0.095, y1: 0.298, capB: 0.04, capT: 0.035, radial: 18, rings: 11 }));
    // rim of the hood opening / collar: closed loop round the neck, high at the back, dipping to the zip
    const rim = [];
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * 2 * PI, s = Math.sin(a), c = Math.cos(a);
      rim.push([0.088 * s, 0.262 + 0.030 * (1 - c) * 0.5 - 0.018 * Math.max(0, c) ** 2, -0.022 + (c > 0 ? 0.080 : 0.088) * c]);
    }
    const hs = []; for (let i = 0; i <= 6; i++) { const y = 0.112 + i * 0.026, q = hoodS(y, PI); hs.push([0, y, q[2] - 0.0015]); }
    add(chest, jacketDk, seam(rim, 0.0125, 28, true), seam(hs, 0.0032, 10));
    // collar stand filling between rim and shoulders
    add(chest, jacket, tube({ prof: [[0.215, 0.105, 0.085, 0.09, 0, -0.018], [0.262, 0.088, 0.078, 0.086, 0, -0.022]], y0: 0.20, y1: 0.268, capB: 0.01, capT: 0.006, radial: 18, rings: 5,
      post: (x, y, z, a) => [x, y + 0.030 * (1 - Math.cos(a)) * 0.5 * sstep(0.22, 0.262, y) - 0.018 * Math.max(0, Math.cos(a)) ** 2 * sstep(0.22, 0.262, y), z] }));
    // drawstrings with metal aglets
    const ds = [], ag = [];
    for (const s of [-1, 1]) {
      const p0 = torsoS(0.215, s * 0.42), p1 = torsoS(0.16, s * 0.30), p2 = torsoS(0.10, s * 0.27), p3 = torsoS(0.065, s * 0.25 + 0.03);
      ds.push(seam([[p0[0], p0[1] + 0.004, p0[2] + 0.004], [p1[0], p1[1], p1[2] + 0.008], [p2[0], p2[1], p2[2] + 0.006], [p3[0], p3[1], p3[2] + 0.006]], 0.0034, 10));
      ag.push(place(new THREE.CylinderGeometry(0.0042, 0.0036, 0.018, 6), p3[0], p3[1] - 0.008, p3[2] + 0.006));
    }
    add(chest, jacketDk, ...ds); add(chest, metal, ...ag);
  }
  { // cross-body STRAP: a torus re-written onto the torso surface along a tilted plane. High on the LEFT (+X) shoulder.
    const K = 1.62, YC = 0.103, OFF = 0.0085;   // tops out on the trapezius beside the collar (x ~ 0.09), not round the shoulder joint
    const sy = (ang) => { let lo = -0.2, hi = 0.262; for (let i = 0; i < 22; i++) { const mid = (lo + hi) / 2; if (mid - YC - K * torsoS(mid, ang)[0] > 0) hi = mid; else lo = mid; } return (lo + hi) / 2; };
    const centre = (u) => { const y = sy(u), f = frameAt(torsoS, y, u); return { p: f.p.addScaledVector(f.n, OFF), n: f.n }; };
    const strapFrame = (u) => {
      const c = centre(u), t = centre(u + 0.03).p.sub(centre(u - 0.03).p).normalize();
      const w = new THREE.Vector3().crossVectors(c.n, t).normalize();
      return { p: c.p, n: c.n, x: w, y: t, w, t };
    };
    const tor = new THREE.TorusGeometry(1, 0.2, 6, 40), pos = tor.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const px = pos.getX(i), py = pos.getY(i), pz = pos.getZ(i);
      const u = Math.atan2(py, px), cv = (Math.hypot(px, py) - 1) / 0.2, sv = pz / 0.2;
      const f = strapFrame(u), q = f.p.clone().addScaledVector(f.n, 0.0045 * cv).addScaledVector(f.w, 0.021 * sv);
      pos.setXYZ(i, q.x, q.y, q.z);
    }
    tor.computeVertexNormals(); weldNormals(tor);
    add(chest, strapM, tor);
    // sling pouch on the back run of the strap (hero surface), flap + zip pull, and a slider buckle on the front
    const fb = strapFrame(PI + 0.30);
    const body = onFrame(plate(0.092, 0.150, 0.020, 0.026, 0.008), fb, 0.016);
    const pocket = onFrame(place(plate(0.070, 0.070, 0.007, 0.016, 0.004), 0, -0.030, 0), fb, 0.032);
    add(chest, pouchM, body, pocket);
    const flap = onFrame(place(plate(0.096, 0.050, 0.008, 0.020, 0.004), 0, 0.050, 0), fb, 0.032);
    const ff = strapFrame(0.10);
    const keeper = onFrame(plate(0.052, 0.020, 0.006, 0.004, 0.002), strapFrame(PI - 0.40), 0.006);
    add(chest, strapM, flap, keeper);
    const buckle = onFrame(plate(0.050, 0.030, 0.005, 0.006, 0.002), ff, 0.008);
    const pull = onFrame(place(plate(0.008, 0.022, 0.003, 0.003, 0.0015), 0.030, 0.018, 0), fb, 0.040);
    const dring = onFrame(new THREE.TorusGeometry(0.013, 0.003, 5, 12), strapFrame(PI + 0.85), 0.007);
    add(chest, metal, buckle, pull, dring);
  }

  /* ---------------------------------------------------------------- neck / head */
  const neck = J(0, 0.235, -0.008, chest);                          // world 1.315
  add(neck, skin, tube({ prof: [[-0.045, 0.074, 0.050, 0.058, 0, 0.0], [-0.010, 0.050, 0.046, 0.050, 0, 0.002], [0.035, 0.044, 0.044, 0.046, 0, 0.006], [0.090, 0.043, 0.042, 0.046, 0, 0.010]],
    y0: -0.045, y1: 0.095, capB: 0.01, capT: 0.02, radial: 14, rings: 7,
    bulges: [{ y: 0.0, h: 0.05, a: PI - 0.6, w: 0.4, amp: 0.006 }, { y: 0.0, h: 0.05, a: PI + 0.6, w: 0.4, amp: 0.006 }] }));
  const head = J(0, 0.055, 0.008, neck);                            // world 1.37
  const headS = surfOf({
    prof: [
      [-0.045, 0.026, 0.040, 0.020, 0, 0.030],   // chin
      [-0.022, 0.048, 0.056, 0.040, 0, 0.020],   // jaw
      [0.012, 0.064, 0.068, 0.066, 0, 0.008],    // jaw angle / cheek
      [0.050, 0.072, 0.076, 0.088, 0, 0.002],    // cheekbone, ear level
      [0.092, 0.075, 0.081, 0.095, 0, 0.0],      // brow / occiput
      [0.135, 0.069, 0.075, 0.088, 0, -0.002],
      [0.178, 0.045, 0.050, 0.058, 0, -0.004],
    ],
    bulges: [
      { y: 0.084, h: 0.014, a: 0, w: 0.75, amp: 0.0045 },                                                             // brow ridge
      { y: 0.064, h: 0.013, a: 0.40, w: 0.20, amp: -0.0065 }, { y: 0.064, h: 0.013, a: -0.40, w: 0.20, amp: -0.0065 }, // eye sockets
      { y: 0.040, h: 0.02, a: 0.62, w: 0.25, amp: 0.004 }, { y: 0.040, h: 0.02, a: -0.62, w: 0.25, amp: 0.004 },       // cheekbones
      { y: 0.004, h: 0.008, a: 0, w: 0.30, amp: -0.003 }, { y: -0.006, h: 0.008, a: 0, w: 0.26, amp: 0.003 },          // mouth line, lower lip
      { y: 0.03, h: 0.03, a: PI, w: 0.5, amp: -0.004 },                                                                // nape hollow under the occiput
    ],
  });
  add(head, skin,
    tube({ surf: headS, y0: -0.047, y1: 0.180, capB: 0.02, capT: 0.05, radial: 20, rings: 16 }),
    // nose: a tapered wedge, ears
    place(tube({ prof: [[0.0, 0.0135, 0.015, 0.012], [0.016, 0.011, 0.012, 0.012], [0.050, 0.0075, 0.0045, 0.010]], y0: -0.005, y1: 0.056, capB: 0.009, capT: 0.006, radial: 8, rings: 6 }), 0, 0.024, 0.0685, 0.10, 0, 0),
    place(ell(0.0075, 0.023, 0.0145, 8, 6), 0.0745, 0.052, -0.004, 0, 0.45, -0.10),
    place(ell(0.0075, 0.023, 0.0145, 8, 6), -0.0745, 0.052, -0.004, 0, -0.45, 0.10));
  { // HAIR: a shell that follows the skull with an angle-dependent hairline, then overlapping clumps
    const hairS = surfOf({
      prof: [
        [-0.005, 0.040, 0.050, 0.046, 0, 0.0],
        [0.020, 0.062, 0.066, 0.074, 0, 0.0],
        [0.050, 0.077, 0.080, 0.098, 0, 0.0],
        [0.092, 0.083, 0.090, 0.107, 0, 0.0],
        [0.135, 0.079, 0.086, 0.101, 0, -0.002],
        [0.175, 0.058, 0.064, 0.074, 0, -0.004],
        [0.192, 0.040, 0.045, 0.050, 0, -0.004],
      ],
      ripple: (y, a) => 0.0025 * Math.sin(a * 9 + y * 30),
    });
    const hairline = (a0) => { const a = Math.abs(a0); if (a < 0.9) return 0.118 + 0.010 * Math.exp(-(((a0 + 0.45) / 0.3) ** 2)) - 0.008 * sstep(-0.2, 0.8, a0); if (a < 1.75) return 0.122 - 0.058 * sstep(0.9, 1.75, a); return 0.064 - 0.060 * sstep(1.75, 2.7, a); };
    const gs = [tube({ surf: hairS, y0: -0.002, y1: 0.190, capB: 0.01, capT: 0.05, radial: 20, rings: 14, ymap: (y, a) => Math.max(y, hairline(a)) })];
    // upper layer: a second, slightly larger shell whose wavy lower edge overhangs the under-layer (layered cut, reads from behind)
    const hair2 = surfOf({ prof: hairS.P.map((q) => [q[0], q[1] + 0.0065, q[2] + 0.006, q[3] + 0.0075, q[4], q[5]]), ripple: (y, a) => 0.0032 * Math.sin(a * 7 + 1 + y * 22) });
    const line2 = (a0) => { const a = Math.abs(a0); return Math.max(hairline(a0) + 0.012, 0.128 - 0.050 * sstep(1.0, 2.2, a)) + 0.007 * Math.sin(a0 * 5.0 + 0.6); };
    gs.push(tube({ surf: hair2, y0: 0.02, y1: 0.1905, capB: 0.006, capT: 0.05, radial: 20, rings: 12, ymap: (y, a) => Math.max(y, line2(a)) }));
    const cl = (rx, ry, rz, x, y, z, ax, ay, az) => gs.push(place(ell(rx, ry, rz, 10, 6), x, y, z, ax, ay, az));
    // swept fringe: parted on his right (-X), sweeping across the forehead to his left (+X), dropping as it goes
    cl(0.048, 0.018, 0.028, 0.024, 0.130, 0.064, 0.30, 0.30, -0.40);
    cl(0.030, 0.015, 0.026, -0.032, 0.141, 0.064, 0.25, -0.40, 0.30);
    cl(0.020, 0.032, 0.024, 0.068, 0.110, 0.034, 0.0, 0.8, -0.12);
    cl(0.016, 0.022, 0.009, 0.0, 0.020, -0.064, -0.42, 0, 0);          // tapered nape point
    // brows + eyes (hair-dark, tiny, sunk into the sockets)
    for (const s of [-1, 1]) {
      const b = headS(0.0835, s * 0.40), e = headS(0.064, s * 0.40);
      gs.push(place(ell(0.0150, 0.0032, 0.004, 8, 4), b[0], b[1], b[2] - 0.0005, 0, s * 0.35, s * -0.10));
      gs.push(place(ell(0.0078, 0.0052, 0.003, 8, 4), e[0], e[1] - 0.001, e[2] - 0.0002, 0, s * 0.35, 0));
    }
    add(head, hairM, ...gs);
  }

  /* ---------------------------------------------------------------- arms */
  function arm(side) {
    const sh = J(side * 0.150, 0.178, -0.005, chest);             // world 1.258
    sh.rotation.z = side * 0.17;
    const elbowFold = (y0, y1) => (y, a) => 0.0034 * sstep(y0, y0 + 0.02, y) * (1 - sstep(y1 - 0.02, y1, y)) * (0.5 + 0.5 * Math.cos(a)) * Math.sin(y * 210 + a * 1.2);
    add(sh, jacket, tube({
      prof: [[-0.300, 0.041, 0.043, 0.043], [-0.255, 0.041, 0.043, 0.043], [-0.160, 0.043, 0.046, 0.047], [-0.070, 0.050, 0.053, 0.054], [0.0, 0.054, 0.055, 0.055], [0.055, 0.054, 0.055, 0.055]],
      y0: -0.298, y1: 0.055, capB: 0.043, capT: 0.055, radial: 12, rings: 11,
      bulges: [{ y: -0.06, h: 0.05, a: side * PI / 2, w: 0.9, amp: 0.004 }, { y: -0.235, h: 0.03, a: PI, w: 0.6, amp: 0.004 }],
      ripple: elbowFold(-0.25, -0.16),
    }));
    const el = J(0, -0.255, 0, sh);                               // world ~1.02
    el.rotation.x = -0.10;
    add(el, jacket, tube({
      prof: [[-0.215, 0.033, 0.034, 0.034], [-0.160, 0.0345, 0.036, 0.036], [-0.070, 0.039, 0.041, 0.042], [0.0, 0.0395, 0.0405, 0.0405], [0.0405, 0.0395, 0.0405, 0.0405]],
      y0: -0.215, y1: 0.0405, capB: 0.008, capT: 0.0405, radial: 12, rings: 9,
      bulges: [{ y: -0.185, h: 0.02, a: 0, w: 3, amp: 0.004 }],   // sleeve blousing above the cuff
      ripple: elbowFold(-0.10, -0.01),
    }));
    add(el, jacketDk, tube({ prof: [[-0.240, 0.030, 0.031], [-0.200, 0.0315, 0.0325]], y0: -0.242, y1: -0.198, capB: 0.006, capT: 0.006, radial: 24, rings: 4, ripple: (y, a) => 0.0012 * Math.cos(a * 12) }));
    // hand: wrist, palm (thin in X, palm faces the thigh), curled finger mass with knuckle grooves, thumb
    const inw = -side;
    add(el, skin,
      tube({ prof: [[-0.262, 0.021, 0.029], [-0.225, 0.024, 0.028]], y0: -0.265, y1: -0.222, capB: 0.01, capT: 0.005, radial: 10, rings: 4 }),
      place(tube({ prof: [[-0.055, 0.019, 0.040, 0.040], [-0.020, 0.0205, 0.041, 0.040], [0.030, 0.019, 0.036, 0.034]], y0: -0.058, y1: 0.034, capB: 0.025, capT: 0.02, radial: 10, rings: 7 }), inw * 0.002, -0.290, 0.004, 0, 0, 0),
      place(tube({ prof: [[-0.030, 0.019, 0.038, 0.037], [0.0, 0.022, 0.040, 0.038], [0.026, 0.018, 0.037, 0.036]], y0: -0.032, y1: 0.028, capB: 0.022, capT: 0.015, radial: 10, rings: 7,
        post: (x, y, z, a, k) => { const gr = 0.0035 * Math.pow(Math.abs(Math.sin((z + 0.043) * 36.5)), 0.5) - 0.0035; const sgn = Math.sign(x * inw) > 0 ? 1 : 0.3; return [x + Math.sign(x) * gr * k * sgn, y + gr * k * (y < 0 ? 1 : 0), z]; } }), inw * 0.014, -0.338, 0.002, 0, 0, inw * -0.45),
      place(tube({ prof: [[-0.045, 0.0095, 0.0105], [-0.010, 0.0125, 0.013], [0.020, 0.0135, 0.015]], y0: -0.048, y1: 0.022, capB: 0.011, capT: 0.012, radial: 8, rings: 6 }), inw * 0.010, -0.292, 0.043, 0.30, 0, inw * -0.35));
    return { sh, el };
  }
  const L = arm(1), R = arm(-1);

  /* ---------------------------------------------------------------- legs */
  function footprint(side, grow) {
    const pts = [[0, -0.075], [0.030, -0.062], [0.041, -0.020], [0.044, 0.040], [0.050, 0.100], [0.043, 0.150], [0.022, 0.180], [-0.005, 0.187],
      [-0.030, 0.174], [-0.046, 0.130], [-0.046, 0.090], [-0.037, 0.030], [-0.037, -0.030], [-0.028, -0.062]];
    const q = pts.map(([x, z]) => new THREE.Vector2(side * x * grow, (z - 0.055) * grow + 0.055));
    if (side < 0) q.reverse();
    const s = new THREE.Shape(); s.moveTo(q[0].x, q[0].y); s.splineThru(q.slice(1).concat([q[0]]));
    return s;
  }
  function leg(side) {
    const hp = J(side * 0.083, -0.06, 0, hips);                   // world 0.79
    add(hp, trouser, tube({
      prof: [[-0.420, 0.052, 0.054, 0.054], [-0.365, 0.052, 0.054, 0.054], [-0.300, 0.057, 0.059, 0.057], [-0.190, 0.067, 0.071, 0.069], [-0.080, 0.078, 0.081, 0.083], [0.0, 0.081, 0.082, 0.082], [0.082, 0.081, 0.082, 0.082]],
      y0: -0.419, y1: 0.082, capB: 0.054, capT: 0.082, radial: 14, rings: 12,
      bulges: [{ y: -0.15, h: 0.10, a: side * 0.5, w: 0.7, amp: 0.005 }, { y: -0.17, h: 0.09, a: PI, w: 0.7, amp: 0.004 }],   // quad sweep, hamstring
      ripple: (y, a) => 0.0028 * (1 - sstep(-0.10, -0.03, y)) * sstep(-0.20, -0.12, y) * 0 + 0.003 * sstep(-0.40, -0.37, y) * (1 - sstep(-0.33, -0.29, y)) * (0.5 - 0.5 * Math.cos(a)) * Math.sin(y * 200 + a),
    }));
    const kn = J(0, -0.365, 0, hp);                               // world 0.425
    add(kn, trouser, tube({
      prof: [[-0.354, 0.047, 0.052, 0.053], [-0.330, 0.045, 0.049, 0.051], [-0.290, 0.038, 0.039, 0.041], [-0.200, 0.042, 0.042, 0.051], [-0.110, 0.0495, 0.047, 0.064], [-0.045, 0.050, 0.051, 0.055], [0.0, 0.050, 0.0515, 0.0515], [0.0515, 0.050, 0.0515, 0.0515]],
      y0: -0.354, y1: 0.0515, capB: 0.006, capT: 0.0515, radial: 14, rings: 14,
      bulges: [{ y: -0.005, h: 0.03, a: 0, w: 0.6, amp: 0.004 }, { y: -0.115, h: 0.06, a: PI, w: 0.75, amp: 0.004 }],        // kneecap, calf belly
      // trouser break: stacked folds just above the shoe, strongest at the front
      ripple: (y, a) => 0.0042 * (1 - sstep(-0.290, -0.245, y)) * sstep(-0.354, -0.338, y) * (0.55 + 0.45 * Math.cos(a)) * Math.sin(y * 185 + Math.sin(a) * 1.5),
    }));
    // turned cuff
    add(kn, trouser, tube({ prof: [[-0.356, 0.0475, 0.054, 0.054], [-0.332, 0.047, 0.052, 0.053]], y0: -0.356, y1: -0.330, capB: 0.003, capT: 0.006, radial: 14, rings: 4 }));
    const an = J(0, -0.35, 0, kn);                                // world 0.075
    // --- trainer. Sole = bevelled extrusions of a footprint; upper = profile tube laid along Z
    const spring = (geo) => { const p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const z = p.getZ(i); let y = p.getY(i); if (z > 0.09) y += 2.3 * (z - 0.09) ** 2; if (z < -0.045) y += 2.0 * (z + 0.045) ** 2; p.setY(i, y); } geo.computeVertexNormals(); return geo; };
    const ext = (grow, depth, bevel, yTop) => { const e = new THREE.ExtrudeGeometry(footprint(side, grow), { depth, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 1, curveSegments: 2, steps: 1 }); e.rotateX(PI / 2); e.translate(0, yTop, 0); return e; };
    const out = ext(1.0, 0.011, 0, -0.064);                   // outsole  -0.075 .. -0.061
    const mid = ext(1.025, 0.014, 0.004, -0.047);                // midsole  -0.065 .. -0.043
    { const p = mid.attributes.position; for (let i = 0; i < p.count; i++) if (p.getY(i) > -0.054) p.setY(i, p.getY(i) + 0.012 * (1 - sstep(-0.06, 0.07, p.getZ(i)))); }   // heel wedge
    add(an, soleM, spring(out));
    const lugs = [];
    for (const [z, w] of [[-0.052, 0.046], [-0.026, 0.056], [0.072, 0.074], [0.100, 0.080], [0.128, 0.076], [0.156, 0.058]]) lugs.push(place(new THREE.BoxGeometry(w, 0.004, 0.015), side * 0.002, -0.0745, z));
    const upProf = [[-0.074, 0.029, 0.010, 0.060, 0, 0.050], [-0.048, 0.036, 0.010, 0.084, side * 0.001, 0.050], [0.0, 0.0405, 0.010, 0.084, side * 0.003, 0.050], [0.040, 0.0425, 0.010, 0.072, side * 0.003, 0.050],
      [0.090, 0.0475, 0.010, 0.052, side * 0.002, 0.050], [0.140, 0.043, 0.010, 0.041, side * -0.001, 0.050], [0.186, 0.028, 0.010, 0.034, side * -0.004, 0.050]];
    const lay = (geo) => { geo.rotateX(PI / 2); return geo; };
    const upper = lay(tube({ prof: upProf, y0: -0.074, y1: 0.186, capB: 0.018, capT: 0.036, radial: 12, rings: 12, sq: 0.78 }));
    const grown = upProf.map((p) => [p[0], p[1] + 0.0028, 0.002, p[3] + 0.0028, p[4], p[5]]);
    const counter = lay(tube({ prof: grown, y0: -0.0775, y1: -0.025, capB: 0.02, capT: 0.022, radial: 10, rings: 5, sq: 0.78 }));
    const tongue = place(ell(0.019, 0.008, 0.034, 8, 6), side * 0.003, 0.010, 0.036, -0.72, 0, 0);
    const laces = [];
    for (let i = 0; i < 4; i++) { const z = 0.046 + i * 0.019, h = evalProf(norm(upProf), z)[2]; laces.push(place(new THREE.CylinderGeometry(0.0030, 0.0030, 0.034, 5, 1), side * 0.003, -0.050 + h - 0.0015, z, 0, (i % 2 ? 0.35 : -0.35), PI / 2)); }
    const tab = place(plate(0.013, 0.026, 0.003, 0.004, 0.0015), 0, 0.020, -0.0700, -0.10, 0, 0);
    add(an, shoeM, spring(mid), spring(upper), spring(tongue), ...laces.map(spring));
    add(an, shoeDirt, spring(counter), tab, ...lugs.map(spring), ell(0.036, 0.034, 0.038, 10, 6));   // + sock ball at the joint
    return { hp, kn, an };
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
  /*@@POSE@@*/

  const box = new THREE.Box3(), v = new THREE.Vector3();
  g.updateMatrixWorld(true);
  g.traverse((n) => { const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    for (let i = 0; i < p.count; i++) box.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(n.matrixWorld)); });
  const c = box.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= box.min.y; o.position.z -= c.z; });
  return g;
}
