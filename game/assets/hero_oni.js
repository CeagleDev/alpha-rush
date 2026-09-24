/**
 * hero_oni - RAIDEN, the Neon Oni. Built on the runner (candidate C) technical model: every body
 * segment is a subdivided SphereGeometry re-written by `tube()` (Hermite radius-by-height profile,
 * ellipsoidal end caps centred on the joints, gaussian bulges, sine cloth folds), normals welded.
 * New here: `amap` lets a tube be an OPEN shell (the cropped jacket with its front opening, the mask
 * over the face, the black shoulder yoke), driven by the sphere's own u coordinate so the shell's two
 * free edges land exactly on the sphere seam and no face bridges the gap.
 *
 * Design (approved ref refs/alpha/char_oni.png): glossy blue oni mask with short gold horns worn over
 * the face (part of the head), spiky black hair, cropped orange-and-black mechanic jacket with cyan
 * reflective stripes over a black tank top, black belt, black cargo trousers with armoured knee pads,
 * chunky armoured boots with cyan glow strips and gold heel vents, fingerless gloves with cyan studs,
 * wrench + battery pack holstered on the RIGHT thigh (-X), glowing cyan cable lines on the forearms.
 * Emissive ONLY on the cyan strips / studs / boot glows / cables (0.8 on a near-black base).
 *
 * 1.56 m, ~6.6 heads. Facing +Z; the figure's LEFT is +X.
 * Anchors (world m): sole 0, ankle 0.075, knee 0.425, hip 0.79, hips-root 0.85, spine 0.93,
 * chest 1.08, shoulder 1.258, neck 1.315, head 1.37 (chin 1.325), crown ~1.55 (horn tips ~1.60).
 * elbow 1.00, wrist 0.78. Every limb hangs down its joint's local -Y, so +rotation.x pitches it BACKWARD.
 * Joints hidden by OVERLAP: each limb segment ends in a cap circular in YZ and centred on the joint.
 */
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, roughness = 0.88, metalness = 0) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness });
    if (name) m.name = name;
    return m;
  };
  const jacket = M(0xb8571f, 'fabric', 0.6);            // orange mechanic leather
  const jkBlack = M(0x1a1819, 'fabric', 0.62);           // black panels, cuffs, belt, gloves, straps
  const tank = M(0x1e1d1f, 'fabric', 0.92);
  const trouser = M(0x232326, 'fabric', 0.93);
  const armour = M(0x2e3136, 'metal', 0.5, 0.45);        // knee pads, boots
  const soleM = M(0x1a1819, undefined, 0.9);
  const gold = M(0x9c7a2c, 'metal', 0.35, 0.8);
  const steel = M(0x8a8e93, 'metal', 0.4, 0.7);
  const maskM = M(0x1b2d8c, undefined, 0.22, 0.1);        // glossy blue oni mask
  const white = M(0xbdb8ad, undefined, 0.5);
  const pupil = M(0x110f12, undefined, 0.4);
  const maskLine = M(0x1f6f6c, undefined, 0.5);          // unlit cyan tracery on the mask
  const skin = new THREE.MeshStandardMaterial({ color: 0xa97f5e, roughness: 0.65 });
  const hairM = M(0x15110f, 'fabric', 0.8);
  const cyan = new THREE.MeshStandardMaterial({ color: 0x0e1f1f, emissive: 0x2fe3da, emissiveIntensity: 0.8, roughness: 0.45 });

  /* ---------------------------------------------------------------- helpers */
  const PI = Math.PI;
  const wrap = (a) => { while (a > PI) a -= 2 * PI; while (a < -PI) a += 2 * PI; return a; };
  const sstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const norm = (P) => P.map((p) => { const rx = p[1], rf = p[2] ?? rx, rb = p[3] ?? rf; return [p[0], rx, rf, rb, p[4] || 0, p[5] || 0]; });
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
    f.P = P; f.o = o;
    return f;
  }
  // an offset copy of a surface: keeps the parent's bulges / folds unless overridden, so a trim never sinks into a muscle
  const grow = (S, dx, df = dx, db = dx, o = {}) => surfOf(Object.assign({}, S.o, { prof: S.P.map((q) => [q[0], q[1] + dx, q[2] + df, q[3] + db, q[4], q[5]]) }, o));
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
  // o.amap(u, y) -> ang turns it into an OPEN shell: u in [0,1] runs once round the sphere with 0 and 1 on the seam.
  function tube(o) {
    const S = o.surf || surfOf(o), P = S.P;
    const geo = new THREE.SphereGeometry(1, o.radial || 16, o.rings || 12);
    const y0 = o.y0 ?? P[0][0], y1 = o.y1 ?? P[P.length - 1][0];
    const cB = o.capB ?? 0.01, cT = o.capT ?? 0.01, aB = cB * 1.35, aT = cT * 1.35;
    const L = aB + (y1 - y0 - cB - cT) + aT, pos = geo.attributes.position, uv = geo.attributes.uv;
    for (let i = 0; i < pos.count; i++) {
      const px = pos.getX(i), py = Math.max(-1, Math.min(1, pos.getY(i))), pz = pos.getZ(i);
      const l = (1 - Math.acos(py) / PI) * L;
      let y, k = 1;
      if (l < aB) { const th = (l / aB) * PI / 2; y = y0 + cB * (1 - Math.cos(th)); k = Math.sin(th); }
      else if (l > L - aT) { const th = ((L - l) / aT) * PI / 2; y = y1 - cT * (1 - Math.cos(th)); k = Math.sin(th); }
      else y = y0 + cB + (l - aB);
      const ang = o.amap ? o.amap(uv.getX(i), y) : Math.atan2(px, pz);
      if (o.ymap) y = o.ymap(y, ang);
      let q = S(y, ang, k);
      if (o.post) q = o.post(q[0], q[1], q[2], ang, k) || q;
      pos.setXYZ(i, q[0], q[1], q[2]);
    }
    geo.computeVertexNormals();
    return weldNormals(geo);
  }
  // a flat-sided BAND on a surface: the sphere's collapsing poles are pushed past the band's ends so the visible part is full radius
  const band = (S, y0, y1, radial = 16, amap, ext = 0.006) => tube({ surf: S, y0: y0 - ext, y1: y1 + ext, capB: 0.0002, capT: 0.0002, radial, rings: 4, amap });
  const ell = (rx, ry, rz, R = 12, H = 8) => { const s = new THREE.SphereGeometry(1, R, H); s.scale(rx, ry, rz); return s; };
  const _e = new THREE.Euler(), _m = new THREE.Matrix4();
  const place = (geo, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) => {
    if (rx || ry || rz) geo.applyMatrix4(_m.makeRotationFromEuler(_e.set(rx, ry, rz)));
    geo.translate(x, y, z); return geo;
  };
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
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(V), closed), seg, r, 4, closed);
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
  const slab = (w, h, d) => new THREE.BoxGeometry(w, h, d, 1, 1, 1);
  const onFrame = (geo, fr, lift = 0) => {
    _m.makeBasis(fr.x, fr.y, fr.n); _m.setPosition(fr.p.clone().addScaledVector(fr.n, lift));
    geo.applyMatrix4(_m); return geo;
  };
  function frameAt(S, y, ang) {
    const p = V(S(y, ang)), da = V(S(y, ang + 0.02)).sub(V(S(y, ang - 0.02))), dy = V(S(y + 0.004, ang)).sub(V(S(y - 0.004, ang)));
    const n = new THREE.Vector3().crossVectors(da, dy).normalize();
    const up = dy.normalize(), x = new THREE.Vector3().crossVectors(up, n).normalize();
    up.crossVectors(n, x).normalize();
    return { p, n, x, y: up };
  }
  function wrapOn(geo, S, yc, ac, lift = 0, tilt = 0) {
    const c0 = S(yc, ac), R = Math.hypot(c0[0] - S.P[0][4], c0[2] - S.P[0][5]) || 0.1, p = geo.attributes.position, ct = Math.cos(tilt), st = Math.sin(tilt);
    for (let i = 0; i < p.count; i++) {
      const x0 = p.getX(i), y0 = p.getY(i), x = x0 * ct - y0 * st, y = x0 * st + y0 * ct;
      const f = frameAt(S, yc + y, ac + x / R), q = f.p.addScaledVector(f.n, p.getZ(i) + lift);
      p.setXYZ(i, q.x, q.y, q.z);
    }
    geo.computeVertexNormals(); return geo;
  }
  // a line lying on a surface: (y, ang) samples lifted off it
  const lineOn = (S, samples, lift, r, seg = 12) => seam(samples.map(([y, a]) => { const f = frameAt(S, y, a); const q = f.p.addScaledVector(f.n, lift); return [q.x, q.y, q.z]; }), r, seg);
  // open-shell angle map: covers everything except a front gap of half-angle gap(y)
  const openFront = (gap) => (u, y) => { const gp = typeof gap === 'function' ? gap(y) : gap; return gp + u * (2 * PI - 2 * gp); };
  // open-shell angle map: covers ONLY the front, half-angle w
  const frontOnly = (w) => (u) => -w + u * 2 * w;
  const stretchFrom = (edge, y0, y1) => (y, a) => { const e = edge(a); return e + (y - y0) / (y1 - y0) * (y1 - e); };
  const _q = new THREE.Quaternion(), _up = new THREE.Vector3(0, 1, 0);
  const alongDir = (geo, d, x, y, z) => { geo.applyQuaternion(_q.setFromUnitVectors(_up, d.clone().normalize())); geo.translate(x, y, z); return geo; };

  const root = new THREE.Object3D(); g.add(root);

  /* ---------------------------------------------------------------- body surface (chest-local y; world = 1.08 + y) */
  const bodyS = surfOf({
    sq: 0.9,
    prof: [
      [-0.200, 0.124, 0.084, 0.088],
      [-0.165, 0.129, 0.088, 0.092],
      [-0.120, 0.134, 0.091, 0.094],
      [-0.060, 0.136, 0.092, 0.091],   // waist
      [0.020, 0.145, 0.099, 0.095],
      [0.100, 0.156, 0.108, 0.103],    // chest
      [0.160, 0.157, 0.103, 0.102],
      [0.200, 0.150, 0.091, 0.097, 0, -0.004],
      [0.226, 0.126, 0.077, 0.086, 0, -0.006],
      [0.246, 0.088, 0.063, 0.072, 0, -0.006],
      [0.262, 0.060, 0.055, 0.062, 0, -0.006],
    ],
    bulges: [
      { y: 0.105, h: 0.06, a: 0.42, w: 0.38, amp: 0.011 }, { y: 0.105, h: 0.06, a: -0.42, w: 0.38, amp: 0.011 },   // pecs
      { y: 0.02, h: 0.05, a: 0.22, w: 0.2, amp: 0.004 }, { y: 0.02, h: 0.05, a: -0.22, w: 0.2, amp: 0.004 },       // abs
      { y: -0.04, h: 0.04, a: 0.22, w: 0.2, amp: 0.003 }, { y: -0.04, h: 0.04, a: -0.22, w: 0.2, amp: 0.003 },
      { y: 0.115, h: 0.07, a: PI - 0.5, w: 0.36, amp: 0.010 }, { y: 0.115, h: 0.07, a: PI + 0.5, w: 0.36, amp: 0.010 }, // shoulder blades
      { y: 0.03, h: 0.12, a: PI, w: 0.16, amp: -0.007 },                                                          // spine furrow
      { y: 0.0, h: 0.03, a: 0, w: 0.12, amp: -0.003 },                                                            // sternum line
    ],
  });
  const jacketS = grow(bodyS, 0.014, 0.013, 0.015, {
    sq: 0.9,
    bulges: [{ y: 0.115, h: 0.07, a: PI - 0.5, w: 0.36, amp: 0.008 }, { y: 0.115, h: 0.07, a: PI + 0.5, w: 0.36, amp: 0.008 }, { y: 0.03, h: 0.12, a: PI, w: 0.16, amp: -0.005 }],
    ripple: (y, a) => 0.0022 * (1 - sstep(0.15, 0.22, y)) * sstep(-0.075, -0.03, y) * Math.sin(y * 90 + Math.sin(a * 2) * 2.0 + a * 2.0),
  });
  const gapAt = (y) => 0.52 + 0.12 * sstep(-0.075, 0.07, y) - 0.30 * sstep(0.16, 0.245, y);

  /* ---------------------------------------------------------------- hips (root joint, world 0.85): cargo trousers seat + belt */
  const hips = J(0, 0.85, 0, root);
  const pelvisS = surfOf({
    sq: 0.92,
    prof: [
      [-0.150, 0.050, 0.048, 0.070],
      [-0.085, 0.130, 0.060, 0.104],
      [-0.035, 0.152, 0.077, 0.108],   // glutes back (baggy)
      [0.020, 0.146, 0.089, 0.093],
      [0.075, 0.140, 0.087, 0.088],
    ],
    bulges: [
      { y: -0.045, h: 0.055, a: PI - 0.48, w: 0.42, amp: 0.014 }, { y: -0.045, h: 0.055, a: PI + 0.48, w: 0.42, amp: 0.014 },
      { y: -0.06, h: 0.07, a: PI, w: 0.12, amp: -0.009 },
      { y: -0.02, h: 0.04, a: 0, w: 0.5, amp: 0.003 },
    ],
    ripple: (y, a) => 0.002 * sstep(-0.13, -0.09, y) * (1 - sstep(-0.02, 0.02, y)) * Math.sin(y * 110 + a * 3),
  });
  add(hips, trouser, tube({ surf: pelvisS, y0: -0.150, y1: 0.075, capB: 0.085, capT: 0.02, radial: 16, rings: 8 }));
  { // back pockets, waistband, belt with steel buckle and belt loops
    const gs = [];
    for (const s of [-1, 1]) gs.push(wrapOn(plate(0.070, 0.072, 0.002, 0.012, 0.0025), pelvisS, -0.030, PI + s * 0.52, 0.0015, s * 0.06));
    add(hips, trouser, ...gs, band(grow(pelvisS, 0.003), 0.048, 0.074, 18, undefined, 0.004));
    const beltS = grow(pelvisS, 0.008);
    const loops = [];
    for (const a of [0.55, -0.55, PI - 0.7, PI + 0.7, PI]) loops.push(wrapOn(slab(0.012, 0.040, 0.003), pelvisS, 0.030, a, 0.010));
    add(hips, jkBlack, band(beltS, 0.012, 0.046, 18), ...loops);
    const fb = frameAt(pelvisS, 0.029, 0.0);
    add(hips, steel, onFrame(plate(0.044, 0.030, 0.004, 0.004, 0.002), fb, 0.011), onFrame(slab(0.010, 0.020, 0.005), fb, 0.013));
  }

  /* ---------------------------------------------------------------- spine (world 0.93): tank top lower half */
  const spine = J(0, 0.08, 0, hips);
  const SP = 0.15;
  add(spine, tank, place(tube({ surf: bodyS, y0: -0.200, y1: 0.06, capB: 0.02, capT: 0.015, radial: 18, rings: 8,
    post: (x, y, z) => { const k = 1 - 0.02 * sstep(0.0, 0.045, y); return [x * k, y, z * k]; } }), 0, SP, 0));

  /* ---------------------------------------------------------------- chest (world 1.08): tank upper, skin, cropped jacket */
  const chest = J(0, 0.15, 0, spine);
  add(chest, tank, tube({ surf: bodyS, y0: -0.06, y1: 0.262, capB: 0.012, capT: 0.014, radial: 18, rings: 12,
    post: (x, y, z) => { const k = 1 - 0.02 * (1 - sstep(-0.05, 0.0, y)); return [x * k, y, z * k]; } }));
  // bare upper chest inside the tank's scoop neckline
  add(chest, skin, tube({ surf: grow(bodyS, 0.0015), y0: 0.10, y1: 0.262, capB: 0.004, capT: 0.014, radial: 16, rings: 8, amap: frontOnly(1.15),
    ymap: stretchFrom((a) => 0.108 + 0.055 * (a / 1.15) ** 2, 0.10, 0.262) }));
  add(chest, tank, lineOn(bodyS, [...Array(9)].map((_, i) => { const a = -1.15 + i * (2.3 / 8); return [0.108 + 0.055 * (a / 1.15) ** 2, a]; }), 0.002, 0.004, 10));
  { // JACKET: an open shell over the body, cropped at the ribs, black yoke over the shoulders, two reflective bands
    // (end caps are nearly flat discs that sit INSIDE the tank body, so the hem underside reads and the top hides under the collar)
    add(chest, jacket, tube({ surf: jacketS, y0: -0.075, y1: 0.238, capB: 0.002, capT: 0.002, radial: 22, rings: 12, amap: openFront(gapAt) }));
    const yokeS = grow(jacketS, 0.002, 0.002, 0.002, { sq: 0.9 });
    add(chest, jkBlack, tube({ surf: yokeS, y0: 0.168, y1: 0.236, capB: 0.002, capT: 0.002, radial: 24, rings: 5, amap: openFront((y) => gapAt(y) + 0.20) }));
    // black band + cyan strip: chest and hem
    const bands = [], strips = [];
    for (const yc of [0.085, -0.040]) {
      bands.push(band(yokeS, yc - 0.019, yc + 0.019, 24, openFront((y) => gapAt(y) + 0.02)));
      strips.push(band(grow(jacketS, 0.0035), yc - 0.0085, yc + 0.0085, 24, openFront((y) => gapAt(y) + 0.02), 0.004));
    }
    add(chest, jkBlack, ...bands);
    add(chest, cyan, ...strips);
    // front edge piping (hides the open shell's edge), collar, zip pocket, round patch
    const edges = [];
    for (const s of [-1, 1]) edges.push(lineOn(jacketS, [...Array(9)].map((_, i) => { const y = -0.075 + i * (0.318 / 8); return [y, s * gapAt(y)]; }), 0.002, 0.0048, 8));
    edges.push(lineOn(jacketS, [...Array(17)].map((_, i) => [-0.072, gapAt(-0.072) + i * ((2 * PI - 2 * gapAt(-0.072)) / 16)]), 0.002, 0.0042, 24));
    // stand-up collar: an open shell rising from the yoke, folded back down its inside at the top, dipping at the front
    const collarS = surfOf({ prof: [[0.236, 0.092, 0.080, 0.090, 0, -0.010], [0.262, 0.084, 0.074, 0.084, 0, -0.012], [0.290, 0.080, 0.072, 0.082, 0, -0.012], [0.310, 0.082, 0.076, 0.086, 0, -0.012]] });
    const collarTop = (a) => 0.306 - 0.030 * Math.max(0, Math.cos(a)) ** 2;
    add(chest, jacket, tube({ surf: collarS, y0: 0.236, y1: 0.310, capB: 0.003, capT: 0.012, radial: 22, rings: 6, amap: openFront(0.42),
      ymap: (y, a) => 0.236 + (y - 0.236) / 0.074 * (collarTop(a) - 0.236), post: (x, y, z, ang, k) => { if (k > 0.999 || y < 0.28) return null; const q = collarS(collarTop(ang), ang, 1), t = 1 - k; return [q[0] * (1 - 0.10 * t), collarTop(ang) - 0.022 * t, q[2] * (1 - 0.10 * t)]; } }));
    add(chest, jkBlack, ...edges, wrapOn(plate(0.012, 0.062, 0.002, 0.004, 0.002), jacketS, 0.035, 0.80, 0.0015, 0.0),
      wrapOn(plate(0.030, 0.030, 0.002, 0.014, 0.002), jacketS, 0.135, -0.98, 0.0015));
  }

  /* ---------------------------------------------------------------- neck / head */
  const neck = J(0, 0.235, -0.008, chest);                          // world 1.315
  add(neck, skin, tube({ prof: [[-0.045, 0.074, 0.050, 0.058, 0, 0.0], [-0.010, 0.050, 0.046, 0.050, 0, 0.002], [0.035, 0.044, 0.044, 0.046, 0, 0.006], [0.090, 0.043, 0.042, 0.046, 0, 0.010]],
    y0: -0.045, y1: 0.095, capB: 0.01, capT: 0.02, radial: 14, rings: 7,
    bulges: [{ y: 0.0, h: 0.05, a: PI - 0.6, w: 0.4, amp: 0.006 }, { y: 0.0, h: 0.05, a: PI + 0.6, w: 0.4, amp: 0.006 }] }));
  const head = J(0, 0.055, 0.008, neck);                            // world 1.37
  const headS = surfOf({
    prof: [
      [-0.045, 0.026, 0.040, 0.020, 0, 0.030],
      [-0.022, 0.048, 0.056, 0.040, 0, 0.020],
      [0.012, 0.064, 0.068, 0.066, 0, 0.008],
      [0.050, 0.072, 0.076, 0.088, 0, 0.002],
      [0.092, 0.075, 0.081, 0.095, 0, 0.0],
      [0.135, 0.069, 0.075, 0.088, 0, -0.002],
      [0.178, 0.045, 0.050, 0.058, 0, -0.004],
    ],
    bulges: [{ y: 0.03, h: 0.03, a: PI, w: 0.5, amp: -0.004 }],
  });
  add(head, skin,
    tube({ surf: headS, y0: -0.047, y1: 0.180, capB: 0.02, capT: 0.05, radial: 14, rings: 10 }),
    place(ell(0.0075, 0.023, 0.0145, 6, 4), 0.0745, 0.052, -0.004, 0, 0.45, -0.10),
    place(ell(0.0075, 0.023, 0.0145, 6, 4), -0.0745, 0.052, -0.004, 0, -0.45, 0.10));
  { // ONI MASK: glossy blue shell over the face, fierce brow, cheeks, snarling grin, gold horns
    const MW = 1.42;
    const maskS = grow(headS, 0.007, 0.008, 0.007, {
      bulges: [
        { y: 0.088, h: 0.016, a: 0.42, w: 0.30, amp: 0.011 }, { y: 0.088, h: 0.016, a: -0.42, w: 0.30, amp: 0.011 },   // brow ridges
        { y: 0.066, h: 0.012, a: 0.40, w: 0.22, amp: -0.007 }, { y: 0.066, h: 0.012, a: -0.40, w: 0.22, amp: -0.007 }, // eye sockets
        { y: 0.040, h: 0.030, a: 0.0, w: 0.18, amp: 0.016 },                                                           // nose
        { y: 0.030, h: 0.025, a: 0.72, w: 0.28, amp: 0.008 }, { y: 0.030, h: 0.025, a: -0.72, w: 0.28, amp: 0.008 },   // cheek bulges
        { y: -0.006, h: 0.012, a: 0.0, w: 0.75, amp: 0.006 },                                                          // grin mass
        { y: -0.030, h: 0.012, a: 0.0, w: 0.4, amp: 0.005 },                                                           // chin
      ],
    });
    add(head, maskM, tube({ surf: maskS, y0: -0.052, y1: 0.136, capB: 0.02, capT: 0.004, radial: 16, rings: 9, amap: frontOnly(MW) }));
    // rim: dark piping round the mask edge; cyan tracery (unlit) down the cheeks and across the brow
    const rim = [];
    for (let i = 0; i <= 6; i++) rim.push([-0.048 + i * (0.17 / 6), -MW]);
    for (let i = 1; i <= 6; i++) rim.push([0.122 + 0.008 * Math.sin(i * PI / 6), -MW + i * (2 * MW / 6)]);
    for (let i = 1; i <= 6; i++) rim.push([0.122 - i * (0.17 / 6), MW]);
    add(head, jkBlack, lineOn(maskS, rim, 0.001, 0.0045, 18),
      wrapOn(slab(0.064, 0.016, 0.003), maskS, -0.006, 0, 0.002));                                          // mouth slot
    add(head, white, wrapOn(slab(0.060, 0.009, 0.004), maskS, -0.006, 0, 0.004));                            // bared teeth
    add(head, jkBlack, ...[-1, 1].map((s) => lineOn(maskS, [[-0.014, s * 0.12], [-0.006, s * 0.26], [0.000, s * 0.42]], 0.006, 0.0012, 4)),  // teeth gaps
      ...[-1, 1].map((s) => lineOn(maskS, [[0.012, s * 0.12], [0.026, s * 0.24], [0.036, s * 0.44]], 0.004, 0.001, 4)));                        // snarl creases
    add(head, maskLine, ...[-1, 1].map((s) => lineOn(maskS, [[0.098, s * 0.20], [0.084, s * 0.62], [0.050, s * 0.86], [0.010, s * 0.98], [-0.020, s * 0.80]], 0.002, 0.0016, 8)),
      ...[-1, 1].map((s) => lineOn(maskS, [[0.112, s * 0.05], [0.116, s * 0.5], [0.108, s * 1.0]], 0.002, 0.0014, 5)));
    // eyes: white ovals sunk in the sockets, dark pupils, angry black brows above
    const eyes = [], pups = [], brows = [];
    for (const s of [-1, 1]) {
      const f = frameAt(maskS, 0.066, s * 0.40);
      eyes.push(onFrame(place(ell(0.017, 0.0065, 0.004, 8, 4), 0, 0, 0, 0, 0, s * 0.30), f, 0.0025));
      pups.push(onFrame(place(ell(0.004, 0.0045, 0.003, 5, 3), s * 0.004, 0.0005, 0), f, 0.005));
      brows.push(wrapOn(slab(0.040, 0.011, 0.004), maskS, 0.088, s * 0.42, 0.011, s * 0.42));
    }
    add(head, white, ...eyes); add(head, pupil, ...pups); add(head, jkBlack, ...brows);
    // horns: tapered gold cones from the mask's temples, curving up and slightly inward
    const horns = [];
    for (const s of [-1, 1]) {
      const h = new THREE.CylinderGeometry(0.003, 0.020, 0.108, 8, 6), p = h.attributes.position;
      for (let i = 0; i < p.count; i++) { const t = (p.getY(i) + 0.054) / 0.108; p.setX(i, p.getX(i) - s * 0.030 * t * t); p.setZ(i, p.getZ(i) - 0.014 * t * t); }
      h.translate(0, 0.050, 0); h.computeVertexNormals();
      horns.push(place(h, s * 0.070, 0.112, 0.040, -0.20, 0, s * -0.75));
    }
    add(head, gold, ...horns);
  }
  { // HAIR: shell over the skull behind the mask + spiky black clumps radiating up and back
    const hairS = surfOf({
      prof: [
        [-0.005, 0.040, 0.050, 0.046, 0, 0.0],
        [0.020, 0.062, 0.066, 0.074, 0, 0.0],
        [0.050, 0.078, 0.081, 0.099, 0, 0.0],
        [0.092, 0.084, 0.091, 0.108, 0, 0.0],
        [0.135, 0.080, 0.087, 0.102, 0, -0.002],
        [0.175, 0.059, 0.065, 0.075, 0, -0.004],
        [0.192, 0.040, 0.045, 0.050, 0, -0.004],
      ],
      ripple: (y, a) => 0.0025 * Math.sin(a * 9 + y * 30),
    });
    const hairline = (a0) => { const a = Math.abs(a0); if (a < 1.42) return 0.122 + 0.006 * Math.cos(a0 * 4); if (a < 1.75) return 0.122 - 0.054 * sstep(1.42, 1.75, a); return 0.068 - 0.060 * sstep(1.75, 2.7, a); };
    const gs = [tube({ surf: hairS, y0: -0.002, y1: 0.192, capB: 0.006, capT: 0.05, radial: 16, rings: 10, ymap: stretchFrom(hairline, -0.002, 0.192) })];
    // spikes: base on the hair shell, pointing along (normal + up + back)
    const spike = (yb, a, len, r, upW, backW, twist = 0) => {
      const f = frameAt(hairS, yb, a), d = f.n.clone().multiplyScalar(1).addScaledVector(_up, upW).add(new THREE.Vector3(Math.sin(twist), 0, -backW)).normalize();
      const e = ell(r * 1.25, len, r * 0.62, 6, 4); e.translate(0, len * 0.5, 0);
      gs.push(alongDir(e, d, f.p.x - f.n.x * 0.006, f.p.y - 0.004, f.p.z - f.n.z * 0.006));
    };
    // fringe: swept up and back over the mask top (the horns stand outside these)
    spike(0.138, -0.35, 0.036, 0.013, 1.4, 0.6); spike(0.142, 0.05, 0.038, 0.014, 1.3, 0.7); spike(0.138, 0.42, 0.036, 0.013, 1.4, 0.6);
    // crown: short, raked back
    spike(0.176, -0.6, 0.034, 0.012, 1.2, 1.0); spike(0.180, 0.5, 0.034, 0.012, 1.2, 1.0); spike(0.172, PI - 1.1, 0.034, 0.012, 1.0, 1.0); spike(0.172, PI + 1.1, 0.034, 0.012, 1.0, 1.0);
    // back of the head (chase-camera surface): layered clumps sweeping back and down, lying close to the shell
    spike(0.156, PI - 0.4, 0.038, 0.014, 0.5, 1.8); spike(0.156, PI + 0.4, 0.038, 0.014, 0.5, 1.8); spike(0.160, PI, 0.036, 0.013, 0.7, 1.6);
    spike(0.122, PI - 0.9, 0.036, 0.013, 0.0, 1.6); spike(0.122, PI + 0.9, 0.036, 0.013, 0.0, 1.6); spike(0.118, PI - 0.3, 0.036, 0.013, -0.1, 1.6); spike(0.118, PI + 0.3, 0.036, 0.013, -0.1, 1.6);
    spike(0.082, PI - 0.6, 0.032, 0.012, -0.5, 1.4); spike(0.082, PI + 0.6, 0.032, 0.012, -0.5, 1.4); spike(0.084, PI, 0.032, 0.012, -0.5, 1.4);
    spike(0.050, PI - 0.25, 0.028, 0.010, -1.0, 0.9); spike(0.050, PI + 0.25, 0.028, 0.010, -1.0, 0.9);
    add(head, hairM, ...gs);
  }

  /* ---------------------------------------------------------------- arms */
  function arm(side) {
    const sh = J(side * 0.150, 0.178, -0.005, chest);             // world 1.258
    sh.rotation.z = side * 0.17;
    const elbowFold = (y0, y1) => (y, a) => 0.0030 * sstep(y0, y0 + 0.02, y) * (1 - sstep(y1 - 0.02, y1, y)) * (0.5 + 0.5 * Math.cos(a)) * Math.sin(y * 210 + a * 1.2);
    const sleeveS = surfOf({
      prof: [[-0.300, 0.043, 0.045, 0.045], [-0.255, 0.043, 0.045, 0.045], [-0.160, 0.046, 0.049, 0.050], [-0.070, 0.053, 0.056, 0.057], [0.0, 0.057, 0.058, 0.058], [0.058, 0.057, 0.058, 0.058]],
      bulges: [{ y: -0.06, h: 0.05, a: side * PI / 2, w: 0.9, amp: 0.005 }, { y: -0.235, h: 0.03, a: PI, w: 0.6, amp: 0.004 }],
      ripple: elbowFold(-0.25, -0.16),
    });
    add(sh, jacket, tube({ surf: sleeveS, y0: -0.298, y1: 0.058, capB: 0.043, capT: 0.058, radial: 11, rings: 10 }));
    { // black shoulder cap with two orange chevrons, reflective band round the upper arm, outer stripe
      const capS = grow(sleeveS, 0.003);
      add(sh, jkBlack, tube({ surf: capS, y0: -0.040, y1: 0.061, capB: 0.004, capT: 0.061, radial: 11, rings: 6 }),
        band(capS, -0.153, -0.117, 12),
        wrapOn(slab(0.020, 0.075, 0.002), sleeveS, -0.205, side * PI / 2, 0.0015));
      add(sh, jacket, ...[-0.016, 0.004].map((yy) => lineOn(sleeveS, [[yy - 0.012, side * 1.05], [yy, side * 1.55], [yy - 0.012, side * 2.05]], 0.0045, 0.0025, 8)));
      add(sh, cyan, band(grow(sleeveS, 0.0035), -0.142, -0.128, 12, undefined, 0.004),
        lineOn(sleeveS, [[-0.240, side * PI / 2], [-0.200, side * PI / 2], [-0.168, side * PI / 2]], 0.0035, 0.0022, 8));
    }
    const el = J(0, -0.255, 0, sh);                               // world ~1.02
    el.rotation.x = -0.10;
    const foreS = surfOf({
      prof: [[-0.092, 0.038, 0.039, 0.039], [-0.040, 0.041, 0.043, 0.044], [0.0, 0.0415, 0.0425, 0.0425], [0.0425, 0.0415, 0.0425, 0.0425]],
      ripple: elbowFold(-0.10, -0.01),
    });
    add(el, jacket, tube({ surf: foreS, y0: -0.092, y1: 0.0425, capB: 0.006, capT: 0.0425, radial: 12, rings: 7 }));
    // ribbed black cuff, outer stripe continues, then the bare forearm with its cyan cable line
    add(el, jkBlack, tube({ prof: [[-0.132, 0.034, 0.035], [-0.086, 0.037, 0.038]], y0: -0.134, y1: -0.084, capB: 0.006, capT: 0.004, radial: 16, rings: 3, ripple: (y, a) => 0.0007 * Math.cos(a * 16) }),
      wrapOn(slab(0.018, 0.044, 0.002), foreS, -0.058, side * PI / 2, 0.0015));
    add(el, cyan, lineOn(foreS, [[-0.078, side * PI / 2], [-0.058, side * PI / 2], [-0.038, side * PI / 2]], 0.0035, 0.0022, 6));
    const skinS = surfOf({ prof: [[-0.236, 0.024, 0.027, 0.027], [-0.190, 0.028, 0.031, 0.033], [-0.150, 0.031, 0.034, 0.036], [-0.115, 0.032, 0.034, 0.034]] });
    add(el, skin, tube({ surf: skinS, y0: -0.238, y1: -0.110, capB: 0.008, capT: 0.006, radial: 10, rings: 6 }));
    add(el, cyan, lineOn(skinS, [[-0.228, side * (PI / 2 + 0.35)], [-0.200, side * (PI / 2 + 0.15)], [-0.170, side * (PI / 2 - 0.05)], [-0.140, side * (PI / 2 - 0.15)], [-0.122, side * (PI / 2 - 0.2)]], 0.0015, 0.0024, 12),
      lineOn(skinS, [[-0.226, side * (PI / 2 - 0.55)], [-0.196, side * (PI / 2 - 0.45)], [-0.172, side * (PI / 2 - 0.35)]], 0.0015, 0.0018, 8));
    // fingerless glove: wrist band with a stud + gold tag, black palm and curled fingers, skin fingertips, knuckle studs
    const inw = -side;
    const wristS = surfOf({ prof: [[-0.268, 0.026, 0.030, 0.030], [-0.222, 0.027, 0.031, 0.031]] });
    add(el, jkBlack, tube({ surf: wristS, y0: -0.270, y1: -0.220, capB: 0.006, capT: 0.006, radial: 10, rings: 3 }),
      tube({ prof: [[-0.055, 0.019, 0.040, 0.040], [-0.020, 0.0205, 0.041, 0.040], [0.030, 0.019, 0.036, 0.034]], y0: -0.058, y1: 0.034, capB: 0.025, capT: 0.02, radial: 8, rings: 5, post: (x, y, z) => [x + inw * 0.002, y - 0.290, z + 0.004] }),
      place(tube({ prof: [[-0.030, 0.019, 0.038, 0.037], [0.0, 0.022, 0.040, 0.038], [0.026, 0.018, 0.037, 0.036]], y0: -0.032, y1: 0.028, capB: 0.022, capT: 0.015, radial: 8, rings: 5,
        post: (x, y, z, a, k) => { const gr = 0.0035 * Math.pow(Math.abs(Math.sin((z + 0.043) * 36.5)), 0.5) - 0.0035; const sgn = Math.sign(x * inw) > 0 ? 1 : 0.3; return [x + Math.sign(x) * gr * k * sgn, y + gr * k * (y < 0 ? 1 : 0), z]; } }), inw * 0.014, -0.338, 0.002, 0, 0, inw * -0.45),
      place(tube({ prof: [[-0.045, 0.0095, 0.0105], [-0.010, 0.0125, 0.013], [0.020, 0.0135, 0.015]], y0: -0.048, y1: 0.022, capB: 0.011, capT: 0.012, radial: 6, rings: 4 }), inw * 0.010, -0.292, 0.043, 0.30, 0, inw * -0.35));
    add(el, skin, place(ell(0.0185, 0.011, 0.035, 8, 5).translate(0, -0.024, 0), inw * 0.014, -0.338, 0.002, 0, 0, inw * -0.45),
      place(ell(0.0085, 0.012, 0.011, 7, 5), inw * 0.010, -0.325, 0.058, 0.30, 0, inw * -0.35));
    add(el, jacket, wrapOn(slab(0.020, 0.024, 0.002), wristS, -0.245, side * PI / 2, 0.0015),
      place(ell(0.006, 0.014, 0.020, 7, 5), -inw * 0.0185, -0.300, 0.004, 0, 0, 0));
    add(el, gold, wrapOn(slab(0.012, 0.009, 0.002), wristS, -0.245, side * (PI / 2 - 0.9), 0.0015));
    add(el, cyan, place(ell(0.004, 0.006, 0.006, 5, 3), -inw * 0.0285, -0.245, -0.012),
      ...[-0.012, 0.006, 0.024].map((z) => place(ell(0.0035, 0.0045, 0.0045, 5, 3), -inw * 0.0215, -0.326, z)));
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
    const thighS = surfOf({
      prof: [[-0.428, 0.062, 0.064, 0.064], [-0.365, 0.063, 0.065, 0.066], [-0.300, 0.068, 0.070, 0.070], [-0.190, 0.077, 0.080, 0.080], [-0.080, 0.084, 0.086, 0.088], [0.0, 0.083, 0.084, 0.084], [0.084, 0.083, 0.084, 0.084]],
      bulges: [{ y: -0.15, h: 0.10, a: side * 0.5, w: 0.7, amp: 0.005 }, { y: -0.17, h: 0.09, a: PI, w: 0.7, amp: 0.004 }],
      ripple: (y, a) => 0.003 * sstep(-0.40, -0.37, y) * (1 - sstep(-0.33, -0.29, y)) * (0.5 - 0.5 * Math.cos(a)) * Math.sin(y * 200 + a)
        + 0.0022 * sstep(-0.30, -0.22, y) * (1 - sstep(-0.12, -0.06, y)) * Math.sin(y * 95 + a * 2.5),
    });
    add(hp, trouser, tube({ surf: thighS, y0: -0.427, y1: 0.084, capB: 0.062, capT: 0.084, radial: 14, rings: 11 }));
    if (side > 0) { // LEFT thigh: big cargo pocket with flap
      add(hp, trouser, wrapOn(plate(0.090, 0.110, 0.010, 0.010, 0.004), thighS, -0.165, side * (PI / 2 + 0.15), 0.004, 0),
        wrapOn(plate(0.094, 0.036, 0.004, 0.006, 0.002), thighS, -0.105, side * (PI / 2 + 0.15), 0.012, 0));
      add(hp, jkBlack, wrapOn(slab(0.010, 0.010, 0.003), thighS, -0.108, side * (PI / 2 + 0.15), 0.015));
    } else { // RIGHT thigh: holster straps, battery pack with a cyan line, adjustable wrench
      const strapS = grow(thighS, 0.004);
      add(hp, jkBlack, band(strapS, -0.165, -0.148, 14, undefined, 0.004), band(strapS, -0.245, -0.228, 14, undefined, 0.004));
      add(hp, steel, wrapOn(slab(0.016, 0.022, 0.004), thighS, -0.156, side * (PI / 2 - 0.55), 0.006),
        wrapOn(slab(0.016, 0.022, 0.004), thighS, -0.236, side * (PI / 2 - 0.55), 0.006));
      const fp = frameAt(thighS, -0.200, side * (PI / 2 - 0.30));
      add(hp, jkBlack, onFrame(plate(0.050, 0.104, 0.034, 0.008, 0.005), fp, 0.020), onFrame(place(slab(0.036, 0.020, 0.006), 0, 0.058, 0), fp, 0.030));
      add(hp, armour, onFrame(place(plate(0.040, 0.070, 0.004, 0.004, 0.002), 0, -0.010, 0), fp, 0.039));
      add(hp, cyan, onFrame(place(slab(0.004, 0.056, 0.003), -0.014, -0.012, 0), fp, 0.042), onFrame(place(slab(0.020, 0.004, 0.003), -0.006, -0.042, 0), fp, 0.042));
      // wrench: handle down the outside of the pack, head up beside the belt
      const fw = frameAt(thighS, -0.130, side * (PI / 2 + 0.05));
      const handle = new THREE.CylinderGeometry(0.0065, 0.0075, 0.150, 7); handle.translate(0, -0.070, 0);
      const headB = plate(0.036, 0.034, 0.012, 0.010, 0.003); headB.translate(0, 0.024, 0);
      const jawA = slab(0.010, 0.026, 0.012); jawA.translate(-0.012, 0.052, 0);
      const jawB = slab(0.010, 0.030, 0.012); jawB.translate(0.013, 0.054, 0);
      const wrench = merge([handle, headB, jawA, jawB]);
      add(hp, steel, onFrame(wrench, fw, 0.010));
    }
    const kn = J(0, -0.365, 0, hp);                               // world 0.425
    const shinS = surfOf({
      prof: [[-0.212, 0.049, 0.051, 0.053], [-0.190, 0.068, 0.070, 0.076], [-0.150, 0.070, 0.069, 0.081], [-0.100, 0.066, 0.064, 0.078], [-0.050, 0.061, 0.062, 0.068], [0.0, 0.059, 0.060, 0.060], [0.060, 0.059, 0.060, 0.060]],
      bulges: [{ y: -0.115, h: 0.06, a: PI, w: 0.75, amp: 0.004 }],
      ripple: (y, a) => 0.0040 * (1 - sstep(-0.150, -0.100, y)) * sstep(-0.212, -0.195, y) * Math.sin(y * 150 + Math.sin(a) * 1.5 + a * 2)
        + 0.0018 * sstep(-0.10, -0.06, y) * (1 - sstep(-0.03, 0.0, y)) * Math.sin(y * 120 + a * 3),
    });
    add(kn, trouser, tube({ surf: shinS, y0: -0.214, y1: 0.060, capB: 0.006, capT: 0.060, radial: 14, rings: 11 }));
    add(kn, tank, tube({ prof: [[-0.222, 0.046, 0.048, 0.050], [-0.192, 0.047, 0.049, 0.051]], y0: -0.224, y1: -0.190, capB: 0.004, capT: 0.004, radial: 20, rings: 3, ripple: (y, a) => 0.0015 * Math.cos(a * 16) }));
    { // armoured knee pad: two bevelled plates bent round the knee, rivets
      const kneeS = surfOf({ prof: [[-0.10, 0.062, 0.068, 0.062], [0.0, 0.062, 0.070, 0.062], [0.08, 0.062, 0.068, 0.062]] });
      add(kn, armour, wrapOn(plate(0.076, 0.062, 0.010, 0.010, 0.004), kneeS, 0.016, 0, 0.004),
        wrapOn(plate(0.066, 0.040, 0.008, 0.008, 0.003), kneeS, -0.042, 0, 0.003));
      add(kn, jkBlack, wrapOn(slab(0.080, 0.012, 0.004), kneeS, 0.050, 0, 0.003), wrapOn(slab(0.070, 0.010, 0.004), kneeS, -0.064, 0, 0.002));
    }
    { // BOOT SHAFT (rigid with the shin): armour shell, front lacing, side plates, top strap with gold buckle
      const shaftS = surfOf({ prof: [[-0.336, 0.052, 0.058, 0.062], [-0.290, 0.051, 0.056, 0.062], [-0.240, 0.052, 0.056, 0.062], [-0.203, 0.054, 0.058, 0.064]] });
      add(kn, armour, tube({ surf: shaftS, y0: -0.336, y1: -0.203, capB: 0.012, capT: 0.006, radial: 14, rings: 6 }),
        wrapOn(plate(0.044, 0.070, 0.006, 0.008, 0.003), shaftS, -0.268, side * PI / 2, 0.003), wrapOn(plate(0.044, 0.070, 0.006, 0.008, 0.003), shaftS, -0.268, -side * PI / 2, 0.003));
      const lace = []; for (let i = 0; i <= 7; i++) lace.push([-0.322 + i * 0.015, (i % 2 ? 0.20 : -0.20)]);
      add(kn, jkBlack, lineOn(shaftS, lace, 0.002, 0.0028, 14), band(grow(shaftS, 0.003), -0.224, -0.208, 14, undefined, 0.004),
        wrapOn(slab(0.030, 0.050, 0.004), shaftS, -0.300, PI, 0.002));
      add(kn, gold, wrapOn(slab(0.014, 0.018, 0.005), shaftS, -0.216, side * (PI / 2 - 0.3), 0.006),
        ...[[-0.245, 0.65], [-0.245, -0.65], [-0.292, 0.65], [-0.292, -0.65]].map(([y, a]) => wrapOn(slab(0.006, 0.006, 0.003), shaftS, y, side * PI / 2 + a, 0.009)));
    }
    const an = J(0, -0.35, 0, kn);                                // world 0.075
    // --- BOOT FOOT: chunky bevelled soles with a cyan glow layer, armoured upper, buckle straps, gold heel vents
    const spring = (geo) => { const p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const z = p.getZ(i); let y = p.getY(i); if (z > 0.09) y += 2.0 * (z - 0.09) ** 2; if (z < -0.045) y += 1.8 * (z + 0.045) ** 2; p.setY(i, y); } geo.computeVertexNormals(); return geo; };
    const ext = (grow, depth, bevel, yTop) => { const e = new THREE.ExtrudeGeometry(footprint(side, grow), { depth, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 1, curveSegments: 2, steps: 1 }); e.rotateX(PI / 2); e.translate(0, yTop, 0); return e; };
    const out = ext(1.07, 0.018, 0, -0.057);                     // outsole  -0.075 .. -0.057
    const glow = ext(1.085, 0.0065, 0, -0.0505);                 // cyan layer -0.057 .. -0.0505
    const mid = ext(1.075, 0.020, 0.004, -0.031);                // midsole  -0.051 .. -0.031
    { const p = mid.attributes.position; for (let i = 0; i < p.count; i++) if (p.getY(i) > -0.045) p.setY(i, p.getY(i) + 0.010 * (1 - sstep(-0.06, 0.07, p.getZ(i)))); }
    add(an, soleM, spring(out));
    add(an, cyan, spring(glow));
    const lugs = [];
    for (const [z, w] of [[-0.050, 0.052], [0.076, 0.080], [0.108, 0.084], [0.144, 0.070]]) lugs.push(place(new THREE.BoxGeometry(w, 0.004, 0.015), side * 0.002, -0.0745, z));
    const upProf = [[-0.074, 0.034, 0.010, 0.078, 0, 0.038], [-0.048, 0.042, 0.010, 0.098, side * 0.001, 0.038], [0.0, 0.046, 0.010, 0.104, side * 0.003, 0.038], [0.040, 0.048, 0.010, 0.088, side * 0.003, 0.038],
      [0.090, 0.052, 0.010, 0.060, side * 0.002, 0.038], [0.140, 0.048, 0.010, 0.046, side * -0.001, 0.038], [0.190, 0.032, 0.010, 0.038, side * -0.004, 0.038]];
    const lay = (geo) => { geo.rotateX(PI / 2); return geo; };
    const upper = lay(tube({ prof: upProf, y0: -0.074, y1: 0.190, capB: 0.018, capT: 0.036, radial: 10, rings: 10, sq: 0.78 }));
    const toe = place(ell(0.046, 0.024, 0.052, 8, 5), side * -0.002, -0.040, 0.140, 0.12, 0, 0);
    { const p = toe.attributes.position; for (let i = 0; i < p.count; i++) if (p.getY(i) < -0.046) p.setY(i, -0.046); toe.computeVertexNormals(); }
    add(an, armour, spring(mid), spring(upper), ...lugs.map(spring), ell(0.042, 0.040, 0.044, 8, 5));      // + ball at the ankle joint
    add(an, soleM, spring(toe));
    // buckle straps over the vamp + heel counter plate
    const straps = [], buckles = [];
    for (const z of [0.052, 0.092]) {
      const h = evalProf(norm(upProf), z)[2] - 0.038;
      straps.push(place(new THREE.TorusGeometry(0.046, 0.0045, 5, 14, PI), 0, h - 0.052, z, PI / 2, 0, 0));
      buckles.push(place(slab(0.012, 0.016, 0.005), side * 0.049, h - 0.060, z, 0, side * PI / 2, 0));
    }
    add(an, jkBlack, ...straps.map(spring), place(slab(0.046, 0.030, 0.004), 0, -0.020, -0.078, 0, PI, 0));
    add(an, gold, ...buckles,
      ...[-1, 1].map((s) => place(new THREE.CylinderGeometry(0.010, 0.011, 0.020, 9), s * 0.019, -0.030, -0.082, PI / 2, 0, 0)));
    add(an, pupil, ...[-1, 1].map((s) => place(new THREE.CylinderGeometry(0.006, 0.006, 0.004, 9), s * 0.019, -0.030, -0.091, PI / 2, 0, 0)));
    add(an, cyan, place(ell(0.004, 0.015, 0.015, 6, 4), side * 0.046, 0.000, -0.012), place(ell(0.003, 0.006, 0.030, 5, 4), side * 0.041, -0.036, 0.06));
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
