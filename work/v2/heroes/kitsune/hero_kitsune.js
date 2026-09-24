/**
 * hero_kitsune - YUZU, Shrine Courier. Built to the runner candidate-C model: every body segment is a
 * subdivided SphereGeometry re-written by `tube()` (Hermite radius profile, ellipsoidal caps, gaussian
 * bulges, sine cloth folds, welded normals). Costume: white kosode with red cross-collar piping, detached
 * wide sleeves tied with red ribbon, red knife-pleated skirt over black thigh-highs, white sock-boots with
 * red cord lacing on black zori soles, red rope belt with gold bells, paper talisman bundle at the left hip,
 * silver-white hime fringe + high ponytail (parented to the head, held off the back), fox ears, a
 * white/red kitsune mask on the left side of the head, a big fluffy tail (parented to the hips, back+up).
 *
 * 1.56 m, ~6.6 heads. Facing +Z; the figure's LEFT is +X.
 * Anchors (world m): sole 0, ankle 0.075, knee 0.425, hip 0.79, hips-root 0.85, spine 0.93,
 * chest 1.08, shoulder 1.258, neck 1.315, head 1.37 (chin 1.325), crown 1.56 (ears to ~1.62).
 * elbow 1.00, wrist 0.78.
 * Every limb hangs down its joint's local -Y, so +rotation.x pitches it BACKWARD.
 * Joints hidden by OVERLAP: each limb segment ends in a cap circular in the YZ plane centred on the joint.
 */
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, roughness = 0.88, metalness = 0) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness });
    if (name) m.name = name;
    return m;
  };
  const white = M(0xbdb8ad, 'fabric', 0.9);          // kosode, sleeves, socks
  const red = M(0xb0302a, 'fabric', 0.9);            // skirt, waistband, piping
  const redDk = M(0x8c251f, 'fabric', 0.92);         // rope, ribbon, cords (slightly darker so they read as separate)
  const black = M(0x1e1c1e, 'fabric', 0.82);         // thigh-highs
  const soleM = M(0x1a1819, undefined, 0.85);
  const hairM = M(0xb9babb, 'fabric', 0.72);         // silver-white hair
  const furM = M(0xbdbab2, 'fabric', 0.96);          // tail / ear fur
  const gold = M(0xb08a2e, 'metal', 0.35, 0.8);
  const paper = M(0xb8b19c, undefined, 0.92);
  const ink = M(0x2a2624, undefined, 0.9);
  const skin = new THREE.MeshStandardMaterial({ color: 0xb99276, roughness: 0.65 });
  const innerEar = new THREE.MeshStandardMaterial({ color: 0xa8776a, roughness: 0.8 });
  const eyeM = new THREE.MeshStandardMaterial({ color: 0x9c6414, roughness: 0.4 });
  const maskEye = new THREE.MeshStandardMaterial({ color: 0x4f8a3a, roughness: 0.5 });
  const lash = M(0x3a3234, undefined, 0.8);

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
  // knife pleats: a sawtooth around the circumference whose amplitude grows towards the hem
  const pleat = (n, amp, yTop, yHem) => (y, a) => { const t = ((a / (2 * PI)) * n + 100) % 1; const w = sstep(yTop, yHem, -y === -y ? y : y); return amp * (0.15 + 0.85 * (1 - sstep(yHem, yTop, y))) * (t < 0.62 ? t / 0.62 * 2 - 1 : 1 - (t - 0.62) / 0.38 * 2); };

  const flat = (w, h, d, r) => { const s = new THREE.Shape(), x = -w / 2, y = -h / 2; s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h); s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); const e = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false, curveSegments: 1, steps: 1 }); e.translate(0, 0, -d / 2); return e; };

  /* ---------------------------------------------------------------- torso surface (chest-local y; world = 1.08 + y) - the kosode over a slim female torso */
  const torsoS = surfOf({
    sq: 0.9,
    prof: [
      [-0.200, 0.126, 0.086, 0.092],
      [-0.150, 0.122, 0.084, 0.090],
      [-0.100, 0.116, 0.080, 0.086],   // waist
      [-0.040, 0.120, 0.084, 0.088],
      [0.030, 0.130, 0.094, 0.092],
      [0.090, 0.137, 0.104, 0.096],    // bust / shoulder blades
      [0.150, 0.136, 0.096, 0.098],
      [0.195, 0.128, 0.084, 0.093, 0, -0.003],
      [0.220, 0.104, 0.070, 0.082, 0, -0.005],
      [0.243, 0.078, 0.060, 0.070, 0, -0.006],
      [0.262, 0.056, 0.052, 0.058, 0, -0.006],
    ],
    bulges: [
      { y: 0.085, h: 0.05, a: 0.45, w: 0.36, amp: 0.013 }, { y: 0.085, h: 0.05, a: -0.45, w: 0.36, amp: 0.013 },   // bust under cloth
      { y: 0.115, h: 0.07, a: PI - 0.5, w: 0.36, amp: 0.008 }, { y: 0.115, h: 0.07, a: PI + 0.5, w: 0.36, amp: 0.008 }, // shoulder blades
      { y: 0.03, h: 0.12, a: PI, w: 0.16, amp: -0.006 },                                                          // spine furrow
    ],
    ripple: (y, a) => { const w = sstep(-0.19, -0.14, y) * (1 - sstep(-0.09, -0.04, y)); return w ? 0.003 * w * Math.sin(y * 130 + a * 3.0) * (0.5 + 0.5 * Math.sin(a * 2 + 1)) : 0; },
  });

  /* ---------------------------------------------------------------- hips (root joint, world 0.85) */
  const hips = J(0, 0.85, 0, root);
  // pelvis / shorts under the skirt (dark, only ever seen from a low angle)
  const pelvisS = surfOf({
    sq: 0.92,
    prof: [[-0.150, 0.045, 0.044, 0.066], [-0.085, 0.118, 0.054, 0.096], [-0.035, 0.140, 0.070, 0.100], [0.020, 0.134, 0.082, 0.088], [0.075, 0.126, 0.080, 0.080]],
    bulges: [{ y: -0.045, h: 0.055, a: PI - 0.48, w: 0.42, amp: 0.014 }, { y: -0.045, h: 0.055, a: PI + 0.48, w: 0.42, amp: 0.014 }, { y: -0.06, h: 0.07, a: PI, w: 0.12, amp: -0.010 }],
  });
  add(hips, black, tube({ surf: pelvisS, y0: -0.150, y1: 0.075, capB: 0.085, capT: 0.02, radial: 12, rings: 6 }));
  // SKIRT: red knife-pleated, A-line, waist tucked under the band at world 0.93, hem at world 0.635. Rigid with the hips.
  const skirtProf = [[-0.215, 0.218, 0.190, 0.196], [-0.160, 0.200, 0.168, 0.176], [-0.100, 0.184, 0.142, 0.150], [-0.040, 0.174, 0.112, 0.120], [0.020, 0.150, 0.092, 0.100], [0.080, 0.132, 0.088, 0.096]];
  const skirtS = surfOf({ sq: 0.95, prof: skirtProf, ripple: pleat(18, 0.011, 0.06, -0.20) });
  add(hips, red, tube({ surf: skirtS, y0: -0.215, y1: 0.080, capB: 0.006, capT: 0.012, radial: 54, rings: 9 }));
  { // white stripe just above the hem, following the pleats
    const stripeS = surfOf({ sq: 0.95, prof: skirtProf.map((p) => [p[0], p[1] + 0.002, p[2] + 0.002, p[3] + 0.002]), ripple: pleat(18, 0.011, 0.06, -0.20) });
    add(hips, white, tube({ surf: stripeS, y0: -0.198, y1: -0.184, capB: 0.003, capT: 0.003, radial: 54, rings: 4 }));
  }
  { // WAISTBAND (red obi) + twisted rope belt + front knot, bell cords with gold bells, tassels. All rigid with the hips.
    const bandS = surfOf({ sq: 0.9, prof: [[0.028, 0.130, 0.090, 0.096], [0.080, 0.126, 0.088, 0.094], [0.125, 0.124, 0.086, 0.092]] });
    add(hips, red, tube({ surf: bandS, y0: 0.028, y1: 0.125, capB: 0.004, capT: 0.004, radial: 18, rings: 8 }));
    const ropeS = surfOf({ sq: 0.9, prof: [[0.070, 0.134, 0.094, 0.100], [0.083, 0.136, 0.096, 0.102], [0.096, 0.134, 0.094, 0.100]], ripple: (y, a) => 0.0025 * Math.sin(a * 40 + y * 600) });
    add(hips, redDk, tube({ surf: ropeS, y0: 0.068, y1: 0.098, capB: 0.006, capT: 0.006, radial: 30, rings: 4 }));
    // knot: two loops in front of the rope, ends hanging down-left with tassels
    const k0 = ropeS(0.083, 0.15), gs = [];
    gs.push(place(new THREE.TorusGeometry(0.020, 0.0075, 6, 14), k0[0] + 0.012, k0[1] + 0.002, k0[2] + 0.006, 0.2, 0.3, 0));
    gs.push(place(new THREE.TorusGeometry(0.016, 0.0065, 6, 12), k0[0] - 0.024, k0[1] - 0.004, k0[2] + 0.004, -0.1, -0.4, 0.3));
    const cordA = [[k0[0] + 0.020, k0[1] - 0.01, k0[2] + 0.004], [k0[0] + 0.050, k0[1] - 0.06, k0[2] + 0.022], [k0[0] + 0.062, k0[1] - 0.115, k0[2] + 0.040], [k0[0] + 0.070, k0[1] - 0.150, k0[2] + 0.050]];
    const cordB = [[k0[0] - 0.006, k0[1] - 0.012, k0[2] + 0.004], [k0[0] + 0.006, k0[1] - 0.070, k0[2] + 0.030], [k0[0] + 0.014, k0[1] - 0.120, k0[2] + 0.048], [k0[0] + 0.018, k0[1] - 0.160, k0[2] + 0.058]];
    gs.push(seam(cordA, 0.0035, 7), seam(cordB, 0.0035, 7));
    // tassels below the bells
    gs.push(place(tube({ prof: [[-0.030, 0.006, 0.006], [-0.010, 0.010, 0.010], [0.0, 0.005, 0.005]], y0: -0.032, y1: 0.0, capB: 0.005, capT: 0.004, radial: 7, rings: 4, ripple: (y, a) => 0.0012 * Math.cos(a * 8) }), cordA[3][0], cordA[3][1] - 0.028, cordA[3][2]));
    gs.push(place(tube({ prof: [[-0.030, 0.006, 0.006], [-0.010, 0.010, 0.010], [0.0, 0.005, 0.005]], y0: -0.032, y1: 0.0, capB: 0.005, capT: 0.004, radial: 7, rings: 4, ripple: (y, a) => 0.0012 * Math.cos(a * 8) }), cordB[3][0], cordB[3][1] - 0.028, cordB[3][2]));
    add(hips, redDk, ...gs);
    // gold bells: sphere with a slit + a small loop on top
    const bell = (x, y, z, r) => [place(tube({ prof: [[-r, r * 0.9, r * 0.9], [-r * 0.3, r, r], [r * 0.6, r * 0.8, r * 0.8], [r, r * 0.35, r * 0.35]], y0: -r, y1: r, capB: r * 0.4, capT: r * 0.3, radial: 10, rings: 6,
      ripple: (yy, a) => (Math.abs(yy + r * 0.25) < r * 0.08 && Math.abs(Math.sin(a)) > 0.3 ? -0.0025 : 0) }), x, y, z), place(new THREE.TorusGeometry(r * 0.35, r * 0.12, 4, 8), x, y + r + r * 0.2, z, PI / 2, 0, 0)];
    add(hips, gold, ...bell(cordA[3][0], cordA[3][1] - 0.008, cordA[3][2], 0.021), ...bell(cordB[3][0], cordB[3][1] - 0.008, cordB[3][2], 0.019));
    // TALISMAN BUNDLE at the left hip (+X): a stack of paper strips tied with red rope, tilted outward so it clears the skirt hem
    const tal = new THREE.Object3D(); tal.position.set(0.152, 0.085, 0.030); tal.rotation.set(0.05, 0.25, -0.20); hips.add(tal);
    const ps = [], is = [];
    for (let i = 0; i < 5; i++) {
      const dx = (i - 2) * 0.0075, dz = Math.abs(i - 2) * -0.0055;
      ps.push(place(flat(0.056 - Math.abs(i - 2) * 0.006, 0.235, 0.0016, 0.003), dx, -0.132 + (i % 2) * 0.006, dz, 0.03 * (i - 2), 0.20 * (i - 2), 0.05 * (i - 2)));
    }
    // a few dark ink strokes on the two outer strips
    for (let k = 0; k < 5; k++) is.push(place(flat(0.006, 0.022 + (k % 3) * 0.006, 0.001, 0.002), 0.0135, -0.055 - k * 0.034, -0.0086 + 0.0016, 0, 0.32, 0));
    add(tal, paper, ...ps); add(tal, ink, ...is);
    const wrapT = [];
    for (const yy of [-0.010, -0.024, -0.038]) wrapT.push(place(new THREE.TorusGeometry(0.021, 0.0036, 4, 10), 0, yy, -0.006, PI / 2, 0, 0));
    wrapT.push(seam([[0.005, -0.006, 0.020], [0.010, -0.045, 0.026], [0.006, -0.085, 0.030]], 0.0028, 6));
    add(tal, redDk, ...wrapT);
    // garter straps: from under the skirt to the stocking tops (front + back of each thigh)
    const gt = [];
    for (const s of [-1, 1]) { gt.push(place(flat(0.012, 0.075, 0.002, 0.002), s * 0.082, -0.245, 0.072, 0.20, 0, 0)); gt.push(place(flat(0.012, 0.075, 0.002, 0.002), s * 0.086, -0.245, -0.070, -0.20, 0, 0)); }
    add(hips, black, ...gt);
  }
  { // TAIL: big fluffy fox tail, rooted at the tailbone, sweeping back, up and to her left (+X). Never below hip height.
    const tailCurve = new THREE.CatmullRomCurve3([new THREE.Vector3(0.0, -0.03, -0.07), new THREE.Vector3(0.02, 0.0, -0.20), new THREE.Vector3(0.06, 0.08, -0.33), new THREE.Vector3(0.13, 0.21, -0.42), new THREE.Vector3(0.21, 0.35, -0.44)]);
    const R = (t) => 0.026 + 0.072 * Math.sin(Math.min(1, t * 1.12) * PI) ** 0.75 * (1 - 0.30 * t) + 0.012 * (1 - t);
    const geo = new THREE.SphereGeometry(1, 14, 20), pos = geo.attributes.position;
    const T = new THREE.Vector3(), Nn = new THREE.Vector3(), B = new THREE.Vector3(), P = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
    for (let i = 0; i < pos.count; i++) {
      const px = pos.getX(i), py = Math.max(-1, Math.min(1, pos.getY(i))), pz = pos.getZ(i);
      const ang = Math.atan2(px, pz), t = 1 - Math.acos(py) / PI;
      const tt = Math.min(0.995, Math.max(0.005, t));
      tailCurve.getPoint(tt, P); tailCurve.getTangent(tt, T).normalize();
      B.crossVectors(T, up).normalize(); Nn.crossVectors(B, T).normalize();
      const kcap = t < 0.06 ? Math.sin(t / 0.06 * PI / 2) : t > 0.9 ? Math.sin((1 - t) / 0.1 * PI / 2) : 1;
      let r = R(t) * kcap;
      r += kcap * (0.009 * Math.sin(ang * 7 + t * 34) + 0.007 * Math.sin(ang * 3 - t * 22) + 0.004 * Math.sin(ang * 12 + t * 60)) * Math.sin(Math.min(1, t * 1.12) * PI) + 0.004 * kcap * Math.max(0, Math.cos(ang)) * (1 - t);
      const q = P.clone().addScaledVector(B, r * Math.sin(ang)).addScaledVector(Nn, r * Math.cos(ang));
      pos.setXYZ(i, q.x, q.y, q.z);
    }
    geo.computeVertexNormals(); weldNormals(geo);
    add(hips, furM, geo);
  }

  /* ---------------------------------------------------------------- spine (world 0.93) - kosode lower half, tucked into the band */
  const spine = J(0, 0.08, 0, hips);
  const SP = 0.15;   // chest-local -> spine-local
  add(spine, white, place(tube({ surf: torsoS, y0: -0.170, y1: 0.06, capB: 0.02, capT: 0.015, radial: 18, rings: 7,
    post: (x, y, z) => { const k = 1 - 0.022 * sstep(0.0, 0.045, y); return [x * k, y, z * k]; } }), 0, SP, 0));
  { // red centre piping on the lower front + kosode overlap edge (left over right)
    const pts = []; for (let i = 0; i <= 5; i++) { const y = -0.165 + i * 0.045; const p = torsoS(y, 0.06); pts.push([p[0], p[1] + SP, p[2] + 0.0025]); }
    add(spine, red, seam(pts, 0.0035, 8));
  }

  /* ---------------------------------------------------------------- chest (world 1.08) */
  const chest = J(0, 0.15, 0, spine);
  add(chest, white, tube({ surf: torsoS, y0: -0.06, y1: 0.262, capB: 0.012, capT: 0.014, radial: 18, rings: 12,
    post: (x, y, z) => { const k = 1 - 0.022 * (1 - sstep(-0.05, 0.0, y)); return [x * k, y, z * k]; } }));
  { // red cross-collar piping (V from the neck sides to the sternum, then down the front), armhole piping, shoulder-strap edge
    const gs = [];
    for (const s of [-1, 1]) {
      const pts = []; for (let i = 0; i <= 6; i++) { const t = i / 6; const a = s * (0.62 - 0.62 * t) + 0.06 * (1 - t) * 0, y = 0.245 - 0.16 * t; const p = torsoS(y, a * (1 + 0.3 * (1 - t))); pts.push([p[0], p[1], p[2] + 0.0025]); }
      gs.push(seam(pts, 0.0038, 8));
      // armhole edge: a ring where the kosode meets the bare shoulder
      const ah = []; for (let i = 0; i < 12; i++) { const a = (i / 12) * 2 * PI; const y = 0.150 + 0.058 * Math.sin(a), ang = s * (PI / 2) + 0.48 * Math.cos(a) * s; const p = torsoS(y, ang); ah.push([p[0] * 1.02, p[1], p[2] * 1.02]); }
      gs.push(seam(ah, 0.0032, 12, true));
    }
    const fc = []; for (let i = 0; i <= 3; i++) { const y = 0.085 - i * 0.045; const p = torsoS(y, 0.06); fc.push([p[0], p[1], p[2] + 0.0025]); }
    gs.push(seam(fc, 0.0035, 8));
    add(chest, red, ...gs);
    // collar band (white, standing slightly proud round the back of the neck)
    add(chest, white, tube({ prof: [[0.215, 0.098, 0.080, 0.086, 0, -0.012], [0.262, 0.078, 0.070, 0.078, 0, -0.016]], y0: 0.20, y1: 0.268, capB: 0.01, capT: 0.006, radial: 14, rings: 4,
      post: (x, y, z, a) => [x, y + 0.020 * (1 - Math.cos(a)) * 0.5 * sstep(0.22, 0.262, y) - 0.008 * Math.max(0, Math.cos(a)) ** 2 * sstep(0.22, 0.262, y), z] }));
  }

  /* ---------------------------------------------------------------- neck / head */
  const neck = J(0, 0.235, -0.008, chest);                          // world 1.315
  add(neck, skin, tube({ prof: [[-0.045, 0.066, 0.046, 0.054, 0, 0.0], [-0.010, 0.044, 0.041, 0.045, 0, 0.002], [0.035, 0.040, 0.040, 0.042, 0, 0.006], [0.090, 0.040, 0.039, 0.043, 0, 0.010]],
    y0: -0.045, y1: 0.095, capB: 0.01, capT: 0.02, radial: 14, rings: 7 }));
  const head = J(0, 0.055, 0.008, neck);                            // world 1.37
  const headS = surfOf({
    prof: [
      [-0.045, 0.022, 0.034, 0.018, 0, 0.030],   // small chin
      [-0.024, 0.044, 0.052, 0.038, 0, 0.020],
      [0.010, 0.062, 0.067, 0.064, 0, 0.008],    // cheek
      [0.050, 0.073, 0.077, 0.088, 0, 0.002],
      [0.092, 0.076, 0.081, 0.096, 0, 0.0],      // brow / occiput
      [0.135, 0.070, 0.076, 0.090, 0, -0.002],
      [0.178, 0.046, 0.050, 0.058, 0, -0.004],
    ],
    bulges: [
      { y: 0.084, h: 0.014, a: 0, w: 0.75, amp: 0.003 },
      { y: 0.062, h: 0.016, a: 0.40, w: 0.24, amp: -0.005 }, { y: 0.062, h: 0.016, a: -0.40, w: 0.24, amp: -0.005 },
      { y: 0.036, h: 0.02, a: 0.62, w: 0.25, amp: 0.004 }, { y: 0.036, h: 0.02, a: -0.62, w: 0.25, amp: 0.004 },
      { y: 0.002, h: 0.007, a: 0, w: 0.28, amp: -0.0025 }, { y: -0.008, h: 0.008, a: 0, w: 0.24, amp: 0.003 },
      { y: 0.03, h: 0.03, a: PI, w: 0.5, amp: -0.004 },
    ],
  });
  add(head, skin,
    tube({ surf: headS, y0: -0.047, y1: 0.180, capB: 0.02, capT: 0.05, radial: 14, rings: 12 }),
    place(tube({ prof: [[0.0, 0.011, 0.012, 0.010], [0.016, 0.009, 0.010, 0.010], [0.044, 0.006, 0.004, 0.008]], y0: -0.005, y1: 0.048, capB: 0.008, capT: 0.005, radial: 8, rings: 6 }), 0, 0.028, 0.066, 0.10, 0, 0),
    place(ell(0.0065, 0.019, 0.012, 8, 6), 0.0735, 0.052, -0.004, 0, 0.45, -0.10),
    place(ell(0.0065, 0.019, 0.012, 8, 6), -0.0735, 0.052, -0.004, 0, -0.45, 0.10));
  { // eyes: large amber irises with dark lash line (anime read from the front camera in menus)
    const es = [], ls = [];
    for (const s of [-1, 1]) {
      const e = headS(0.062, s * 0.40);
      es.push(place(ell(0.011, 0.0085, 0.004, 8, 5), e[0], e[1] - 0.001, e[2] - 0.0005, 0, s * 0.35, 0));
      ls.push(place(ell(0.0145, 0.0035, 0.004, 8, 4), e[0], e[1] + 0.0075, e[2] + 0.0005, 0, s * 0.35, s * -0.08));
    }
    add(head, eyeM, ...es); add(head, lash, ...ls);
  }
  { // HAIR: silver shell with a straight hime fringe, long side locks, red headband, high ponytail held off the back, fox ears, side mask
    const hairS = surfOf({
      prof: [[-0.005, 0.040, 0.050, 0.046], [0.020, 0.062, 0.066, 0.074], [0.050, 0.079, 0.082, 0.099], [0.092, 0.085, 0.091, 0.107], [0.135, 0.080, 0.087, 0.101, 0, -0.002], [0.175, 0.060, 0.066, 0.076, 0, -0.004], [0.194, 0.040, 0.046, 0.052, 0, -0.004]],
      ripple: (y, a) => 0.0022 * Math.sin(a * 11 + y * 30),
    });
    // hairline: straight fringe at brow level in front (|a|<0.75), rising over the ears, low nape behind
    const hairline = (a0) => { const a = Math.abs(a0); if (a < 0.78) return 0.079 + 0.003 * Math.sin(a0 * 14) - 0.006 * Math.exp(-(((a0 - 0.12) / 0.16) ** 2)); if (a < 1.6) return 0.079 + 0.006 * sstep(0.78, 1.6, a); return 0.085 - 0.080 * sstep(1.6, 2.6, a); };
    const gs = [tube({ surf: hairS, y0: -0.002, y1: 0.194, capB: 0.01, capT: 0.05, radial: 16, rings: 11, ymap: (y, a) => Math.max(y, hairline(a)) })];
    // fringe underside: a thin darker-shadow lip so the fringe reads as a cut edge
    const cl = (rx, ry, rz, x, y, z, ax, ay, az) => gs.push(place(ell(rx, ry, rz, 8, 5), x, y, z, ax, ay, az));
    cl(0.024, 0.030, 0.012, 0.030, 0.092, 0.078, 0.12, 0.25, -0.18);
    cl(0.020, 0.032, 0.011, -0.026, 0.090, 0.079, 0.12, -0.20, 0.22);
    cl(0.018, 0.028, 0.010, 0.060, 0.098, 0.060, 0.05, 0.75, -0.10);
    cl(0.018, 0.028, 0.010, -0.060, 0.098, 0.060, 0.05, -0.75, 0.10);
    // long side locks framing the face down to the collarbone (world ~1.20): head-local y down to -0.17
    for (const s of [-1, 1]) {
      gs.push(place(tube({ prof: [[-0.175, 0.008, 0.011, 0.010], [-0.100, 0.011, 0.015, 0.013], [-0.020, 0.014, 0.019, 0.017], [0.060, 0.014, 0.018, 0.018]], y0: -0.178, y1: 0.075, capB: 0.02, capT: 0.015, radial: 8, rings: 7,
        ripple: (y, a) => 0.0015 * Math.sin(a * 5 + y * 40) }), s * 0.079, 0.0, 0.036, 0.05, 0, s * -0.05));
    }
    add(head, hairM, ...gs);
    // red headband ribbon round the head under the fringe line, with a tail of ribbon on the left
    const band = []; for (let i = 0; i < 16; i++) { const a = (i / 16) * 2 * PI; const p = hairS(0.100 + 0.012 * Math.cos(a), a); band.push([p[0] * 1.03, p[1], p[2] * 1.03]); }
    add(head, redDk, seam(band, 0.0055, 18, true), seam([[0.090, 0.085, -0.010], [0.100, 0.020, -0.030], [0.106, -0.040, -0.028], [0.104, -0.090, -0.040]], 0.0028, 7),
      place(new THREE.CylinderGeometry(0.004, 0.007, 0.024, 6), 0.104, -0.100, -0.040));
    // PONYTAIL: gathered at the back of the crown, red tie, then a thick fall held ~5 cm off the back, thinning to a tip at world ~0.95
    const tie = new THREE.TorusGeometry(0.030, 0.008, 6, 14);
    add(head, redDk, place(tie, 0.0, 0.108, -0.112, 0.95, 0, 0));
    const pony = tube({
      prof: [[-0.420, 0.009, 0.006, 0.006, 0.046, -0.148], [-0.340, 0.020, 0.013, 0.014, 0.044, -0.154], [-0.250, 0.030, 0.019, 0.022, 0.030, -0.158], [-0.150, 0.035, 0.023, 0.026, 0.012, -0.156], [-0.060, 0.036, 0.024, 0.028, 0.0, -0.152], [0.020, 0.033, 0.025, 0.028, 0.0, -0.140], [0.090, 0.027, 0.023, 0.023, 0.0, -0.116], [0.140, 0.022, 0.020, 0.020, 0.0, -0.080]],
      y0: -0.420, y1: 0.140, capB: 0.02, capT: 0.03, radial: 12, rings: 15,
      ripple: (y, a) => 0.0045 * Math.sin(a * 5 + y * 9) + 0.002 * Math.sin(a * 3 - y * 50),
    });
    add(head, hairM, pony);
    // FOX EARS: tall tapered cones of fur on the top of the head, tilted outward, pink inner ear facing forward
    const ears = [], inner = [];
    for (const s of [-1, 1]) {
      const e = new THREE.Object3D(); e.position.set(s * 0.048, 0.168, -0.010); e.rotation.set(-0.18, 0, s * -0.30); head.add(e);
      add(e, furM, tube({ prof: [[0.0, 0.030, 0.020, 0.024], [0.030, 0.026, 0.016, 0.020], [0.060, 0.016, 0.010, 0.012], [0.088, 0.004, 0.003, 0.004]], y0: 0.0, y1: 0.090, capB: 0.012, capT: 0.004, radial: 8, rings: 6,
        ripple: (y, a) => 0.0018 * Math.sin(a * 5 + y * 60) * sstep(0.0, 0.02, y) }));
      add(e, innerEar, place(tube({ prof: [[0.0, 0.016, 0.006, 0.006], [0.025, 0.014, 0.006, 0.006], [0.058, 0.004, 0.003, 0.003]], y0: 0.0, y1: 0.060, capB: 0.006, capT: 0.003, radial: 6, rings: 4 }), 0, 0.010, 0.016));
    }
    // KITSUNE MASK on the left side of the head (+X), tilted to face out and forward, tied with red cord
    const mk = new THREE.Object3D(); mk.position.set(0.084, 0.118, 0.024); mk.rotation.set(0.22, 1.30, -0.38); mk.scale.setScalar(1.18); head.add(mk);
    const maskS = surfOf({ prof: [[-0.058, 0.016, 0.010, 0.006], [-0.030, 0.034, 0.016, 0.006], [0.008, 0.043, 0.020, 0.006], [0.036, 0.040, 0.018, 0.006], [0.054, 0.026, 0.012, 0.005]],
      bulges: [{ y: -0.045, h: 0.02, a: 0, w: 0.6, amp: 0.006 }] });
    add(mk, white, tube({ surf: maskS, y0: -0.058, y1: 0.054, capB: 0.008, capT: 0.005, radial: 12, rings: 8 }),
      place(tube({ prof: [[0, 0.012, 0.008, 0.008], [0.040, 0.003, 0.003, 0.003]], y0: 0, y1: 0.042, capB: 0.006, capT: 0.003, radial: 6, rings: 3 }), 0.026, 0.044, 0.0, 0, 0, -0.35),
      place(tube({ prof: [[0, 0.012, 0.008, 0.008], [0.040, 0.003, 0.003, 0.003]], y0: 0, y1: 0.042, capB: 0.006, capT: 0.003, radial: 6, rings: 3 }), -0.026, 0.044, 0.0, 0, 0, 0.35));
    const rm = [];
    for (const s of [-1, 1]) {
      rm.push(place(ell(0.005, 0.012, 0.003, 6, 4), s * 0.022, 0.020, 0.0185, 0, 0, s * 0.6));           // cheek stripes
      rm.push(place(ell(0.008, 0.003, 0.003, 6, 4), s * 0.019, -0.006, 0.0195, 0, 0, s * -0.35));        // whisker mark
      rm.push(place(ell(0.012, 0.004, 0.003, 6, 4), s * 0.022, 0.036, 0.0140, 0, 0, s * 0.25));          // brow stroke
    }
    rm.push(place(ell(0.005, 0.005, 0.004, 6, 4), 0, -0.042, 0.0165, 0, 0, 0));                            // nose
    add(mk, red, ...rm);
    add(mk, maskEye, place(ell(0.010, 0.004, 0.003, 8, 4), 0.017, 0.006, 0.0195, 0, 0, 0.35), place(ell(0.010, 0.004, 0.003, 8, 4), -0.017, 0.006, 0.0195, 0, 0, -0.35));
    add(mk, redDk, place(new THREE.TorusGeometry(0.046, 0.0030, 4, 12), 0, 0, -0.004, 0.0, 0, 0));       // cord loop that holds it on
  }

  /* ---------------------------------------------------------------- arms: bare shoulder + upper arm, sleeve tied on with red ribbon, wide kimono cuff, hand */
  function arm(side) {
    const sh = J(side * 0.135, 0.178, -0.005, chest);             // world 1.258
    sh.rotation.z = side * 0.20;
    // deltoid + upper arm in skin, capped by a ball centred on the shoulder joint
    add(sh, skin, tube({
      prof: [[-0.300, 0.033, 0.034, 0.034], [-0.255, 0.034, 0.035, 0.035], [-0.150, 0.037, 0.038, 0.039], [-0.070, 0.041, 0.043, 0.044], [0.0, 0.046, 0.047, 0.047], [0.047, 0.046, 0.047, 0.047]],
      y0: -0.298, y1: 0.047, capB: 0.034, capT: 0.047, radial: 12, rings: 10,
      bulges: [{ y: -0.02, h: 0.05, a: side * PI / 2, w: 0.9, amp: 0.004 }],
    }));
    // detached sleeve: starts a third of the way down the upper arm, tied with a red ribbon + bow, widens towards the elbow
    add(sh, white, tube({
      prof: [[-0.262, 0.061, 0.063, 0.065], [-0.200, 0.055, 0.057, 0.059], [-0.140, 0.048, 0.049, 0.051], [-0.110, 0.046, 0.047, 0.047]],
      y0: -0.264, y1: -0.108, capB: 0.02, capT: 0.006, radial: 12, rings: 8,
      ripple: (y, a) => 0.0022 * Math.sin(a * 6 + y * 70),
    }));
    const rib = [];
    rib.push(place(new THREE.TorusGeometry(0.0475, 0.0045, 4, 12), 0, -0.112, 0, PI / 2, 0, 0));
    const bx = side * 0.040, bz = 0.028;   // bow on the outer-front of the arm
    rib.push(place(new THREE.TorusGeometry(0.011, 0.0035, 4, 8), bx, -0.108, bz, 0.4, side * 0.9, 0.3));
    rib.push(place(new THREE.TorusGeometry(0.010, 0.0035, 4, 8), bx + side * 0.004, -0.116, bz + 0.010, -0.3, side * 0.9, -0.2));
    rib.push(seam([[bx, -0.118, bz + 0.004], [bx + side * 0.006, -0.150, bz + 0.012], [bx + side * 0.004, -0.185, bz + 0.018]], 0.0025, 5));
    rib.push(seam([[bx - side * 0.004, -0.118, bz + 0.004], [bx - side * 0.010, -0.145, bz + 0.014], [bx - side * 0.014, -0.175, bz + 0.016]], 0.0025, 5));
    add(sh, redDk, ...rib);
    const el = J(0, -0.255, 0, sh);                               // world ~1.02
    el.rotation.x = -0.10;
    // forearm skin (fills the sleeve, seen at the cuff opening)
    add(el, skin, tube({ prof: [[-0.250, 0.025, 0.027, 0.027], [-0.160, 0.029, 0.030, 0.030], [-0.070, 0.033, 0.034, 0.035], [0.0, 0.034, 0.035, 0.035], [0.035, 0.034, 0.035, 0.035]],
      y0: -0.250, y1: 0.035, capB: 0.008, capT: 0.035, radial: 9, rings: 6 }));
    // the wide kimono sleeve: from above the elbow it flares into a bag that hangs down and back; open cuff with a red hem band
    const cuffS = surfOf({
      sq: 0.85,
      prof: [[-0.232, 0.076, 0.070, 0.112, 0, -0.024], [-0.200, 0.078, 0.070, 0.114, 0, -0.024], [-0.150, 0.074, 0.066, 0.100, 0, -0.018], [-0.090, 0.068, 0.062, 0.082, 0, -0.010], [-0.030, 0.060, 0.058, 0.064, 0, -0.004], [0.030, 0.054, 0.054, 0.056, 0, 0.0], [0.061, 0.050, 0.052, 0.054, 0, 0.0]],
      ripple: (y, a) => 0.0030 * Math.sin(a * 5 + y * 40) * sstep(0.06, -0.10, y) * (1 - sstep(-0.20, -0.15, -y) * 0) + 0.0008 * Math.sin(a * 7),
      bulges: [{ y: -0.19, h: 0.05, a: PI, w: 0.7, amp: 0.008 }],
    });
    add(el, white, tube({ surf: cuffS, y0: -0.234, y1: 0.061, capB: 0.006, capT: 0.061, radial: 14, rings: 10,
      post: (x, y, z, a, k) => { if (y < -0.226) { const d = 1 - 0.55 * (1 - k); return [x * d, y + 0.012 * (1 - k), z * d]; } return [x, y, z]; } }));  // cuff opening folds inward, so it reads as a hollow sleeve
    add(el, red, tube({ surf: surfOf({ sq: 0.85, prof: cuffS.P.map((q) => [q[0], q[1] + 0.003, q[2] + 0.003, q[3] + 0.003, q[4], q[5]]), ripple: (y, a) => 0.0008 * Math.sin(a * 7) }), y0: -0.236, y1: -0.200, capB: 0.003, capT: 0.003, radial: 14, rings: 5 }));
    add(el, redDk, place(new THREE.TorusGeometry(0.0305, 0.0028, 4, 12), 0, -0.262, 0.002, PI / 2, 0, 0));   // wrist cord
    // hand: relaxed open hand, fingers together, thumb out
    const inw = -side;
    add(el, skin,
      tube({ prof: [[-0.268, 0.020, 0.027], [-0.230, 0.023, 0.027]], y0: -0.270, y1: -0.226, capB: 0.01, capT: 0.005, radial: 10, rings: 4 }),
      place(tube({ prof: [[-0.055, 0.016, 0.036, 0.036], [-0.020, 0.017, 0.038, 0.037], [0.030, 0.016, 0.034, 0.032]], y0: -0.058, y1: 0.034, capB: 0.025, capT: 0.02, radial: 10, rings: 7 }), inw * 0.002, -0.292, 0.004, 0, 0, 0),
      place(tube({ prof: [[-0.045, 0.013, 0.034, 0.033], [-0.005, 0.015, 0.036, 0.035], [0.030, 0.012, 0.030, 0.030]], y0: -0.048, y1: 0.034, capB: 0.020, capT: 0.015, radial: 10, rings: 7,
        post: (x, y, z, a, k) => { const gr = 0.0030 * Math.pow(Math.abs(Math.sin((z + 0.040) * 40)), 0.5) - 0.0030; return [x + Math.sign(x) * gr * k, y, z]; } }), inw * 0.004, -0.362, 0.002, 0, 0, inw * -0.12),
      place(tube({ prof: [[-0.040, 0.0085, 0.0095], [-0.010, 0.011, 0.012], [0.018, 0.012, 0.013]], y0: -0.043, y1: 0.020, capB: 0.010, capT: 0.011, radial: 8, rings: 6 }), inw * 0.006, -0.300, 0.038, 0.35, 0, inw * -0.45));
    return { sh, el };
  }
  const L = arm(1), R = arm(-1);

  /* ---------------------------------------------------------------- legs */
  function leg(side) {
    const hp = J(side * 0.083, -0.06, 0, hips);                   // world 0.79
    // pleated red cover hugging the thigh, hidden inside the skirt at rest: on a big hip swing what breaks through the rigid
    // skirt is skirt-coloured pleated cloth lifting with the leg, never skin
    add(hp, red, tube({ prof: [[-0.150, 0.071, 0.074, 0.075], [-0.080, 0.081, 0.084, 0.087], [0.0, 0.085, 0.086, 0.086], [0.050, 0.085, 0.086, 0.086]],
      y0: -0.150, y1: 0.050, capB: 0.012, capT: 0.03, radial: 16, rings: 6,
      ripple: (y, a) => { const t = ((a / (2 * PI)) * 8 + 100) % 1; return 0.004 * (1 - sstep(-0.06, 0.02, y)) * (t < 0.6 ? t / 0.6 * 2 - 1 : 1 - (t - 0.6) / 0.4 * 2); } }));
    // thigh: skin (the gap between skirt hem and stocking) with the black thigh-high pulled up over its lower two thirds
    const thighProf = [[-0.420, 0.050, 0.052, 0.052], [-0.365, 0.051, 0.053, 0.053], [-0.300, 0.056, 0.058, 0.057], [-0.190, 0.066, 0.070, 0.069], [-0.080, 0.075, 0.078, 0.081], [0.0, 0.078, 0.079, 0.079], [0.079, 0.078, 0.079, 0.079]];
    add(hp, skin, tube({ prof: thighProf, y0: -0.419, y1: 0.079, capB: 0.052, capT: 0.079, radial: 12, rings: 11,
      bulges: [{ y: -0.15, h: 0.10, a: side * 0.5, w: 0.7, amp: 0.004 }, { y: -0.17, h: 0.09, a: PI, w: 0.7, amp: 0.004 }] }));
    const stockProf = thighProf.map((p) => [p[0], p[1] + 0.003, p[2] + 0.003, p[3] + 0.003]);
    add(hp, black, tube({ prof: stockProf, y0: -0.419, y1: -0.170, capB: 0.055, capT: 0.006, radial: 12, rings: 9,
      bulges: [{ y: -0.15, h: 0.10, a: side * 0.5, w: 0.7, amp: 0.004 }, { y: -0.17, h: 0.09, a: PI, w: 0.7, amp: 0.004 }],
      ripple: (y, a) => 0.0035 * sstep(-0.19, -0.176, y) }));   // rolled top band
    const kn = J(0, -0.365, 0, hp);                               // world 0.425
    add(kn, black, tube({
      prof: [[-0.300, 0.038, 0.040, 0.042], [-0.240, 0.040, 0.041, 0.046], [-0.190, 0.043, 0.043, 0.053], [-0.110, 0.0495, 0.048, 0.064], [-0.045, 0.050, 0.051, 0.055], [0.0, 0.050, 0.0515, 0.0515], [0.0515, 0.050, 0.0515, 0.0515]],
      y0: -0.300, y1: 0.0515, capB: 0.02, capT: 0.0515, radial: 12, rings: 10,
      bulges: [{ y: -0.005, h: 0.03, a: 0, w: 0.6, amp: 0.004 }, { y: -0.115, h: 0.06, a: PI, w: 0.75, amp: 0.005 }],
    }));
    // slouched white sock-boot top (world 0.09 - 0.20), with the red criss-cross cord and bow on the shin
    add(kn, white, tube({
      prof: [[-0.345, 0.046, 0.050, 0.052], [-0.320, 0.050, 0.054, 0.056], [-0.290, 0.049, 0.052, 0.054], [-0.265, 0.046, 0.049, 0.051], [-0.240, 0.048, 0.050, 0.053], [-0.225, 0.044, 0.046, 0.048]],
      y0: -0.347, y1: -0.223, capB: 0.006, capT: 0.008, radial: 12, rings: 6,
      ripple: (y, a) => 0.0035 * Math.sin(y * 150 + a * 2) + 0.0018 * Math.sin(a * 7),
    }));
    { const cs = [];
      for (const [y, dir] of [[-0.300, 1], [-0.278, -1]]) { const ring = []; for (let i = 0; i < 12; i++) { const a = (i / 12) * 2 * PI; const r = 0.0505 + 0.004 * Math.sin(a * 2); ring.push([r * Math.sin(a), y + dir * 0.010 * Math.cos(a), r * Math.cos(a) * 1.06]); } cs.push(seam(ring, 0.0026, 12, true)); }
      cs.push(place(new THREE.TorusGeometry(0.009, 0.0028, 4, 8), side * 0.010, -0.288, 0.056, 0.3, side * 0.7, 0.2), place(new THREE.TorusGeometry(0.009, 0.0028, 4, 8), side * -0.010, -0.290, 0.056, -0.3, side * -0.7, -0.2));
      cs.push(seam([[side * 0.004, -0.295, 0.056], [side * 0.010, -0.320, 0.062], [side * 0.012, -0.340, 0.060]], 0.0022, 4), seam([[side * -0.004, -0.295, 0.056], [side * -0.012, -0.318, 0.060], [side * -0.016, -0.338, 0.056]], 0.0022, 4));
      add(kn, redDk, ...cs);
    }
    const an = J(0, -0.35, 0, kn);                                // world 0.075
    // --- sock foot on a flat black zori sole: sock ball at the joint, foot tube laid along Z with a split-toe notch, red cords
    const footprint = (grow) => {
      const pts = [[0, -0.070], [0.028, -0.060], [0.038, -0.020], [0.040, 0.040], [0.046, 0.100], [0.040, 0.150], [0.020, 0.176], [-0.005, 0.182], [-0.030, 0.170], [-0.044, 0.130], [-0.044, 0.090], [-0.036, 0.030], [-0.036, -0.030], [-0.027, -0.060]];
      const q = pts.map(([x, z]) => new THREE.Vector2(side * x * grow, (z - 0.055) * grow + 0.055));
      if (side < 0) q.reverse();
      const s = new THREE.Shape(); s.moveTo(q[0].x, q[0].y); s.splineThru(q.slice(1).concat([q[0]]));
      return s;
    };
    const ext = (grow, depth, bevel, yTop) => { const e = new THREE.ExtrudeGeometry(footprint(grow), { depth, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 1, curveSegments: 2, steps: 1 }); e.rotateX(PI / 2); e.translate(0, yTop, 0); return e; };
    add(an, soleM, ext(1.0, 0.016, 0.003, -0.058));                                          // -0.075 .. -0.056
    const upProf = [[-0.070, 0.028, 0.010, 0.056, 0, 0.050], [-0.045, 0.034, 0.010, 0.074, side * 0.001, 0.050], [0.0, 0.038, 0.010, 0.070, side * 0.003, 0.050], [0.040, 0.040, 0.010, 0.060, side * 0.003, 0.050],
      [0.090, 0.044, 0.010, 0.046, side * 0.002, 0.050], [0.140, 0.040, 0.010, 0.036, side * -0.001, 0.050], [0.180, 0.026, 0.010, 0.030, side * -0.004, 0.050]];
    const upper = tube({ prof: upProf, y0: -0.070, y1: 0.181, capB: 0.016, capT: 0.034, radial: 10, rings: 10, sq: 0.8,
      ripple: (y, a) => (y > 0.10 ? -0.004 * Math.exp(-(((wrap(a) - side * 0.35) / 0.18) ** 2)) * sstep(0.10, 0.15, y) : 0) + 0.0015 * Math.sin(y * 90 + a * 3) * (1 - sstep(0.0, 0.05, y)) });  // tabi split + sock wrinkles
    upper.rotateX(PI / 2);
    for (let i = 0; i < upper.attributes.position.count; i++) { const p = upper.attributes.position, z = p.getZ(i); if (z > 0.10) p.setY(i, p.getY(i) + 1.6 * (z - 0.10) ** 2); } upper.computeVertexNormals();
    add(an, white, upper, ell(0.037, 0.036, 0.039, 8, 5));
    { // red cords over the instep in a criss-cross, plus the thong strap of the sandal
      const cs = [];
      for (const [z0, z1, s] of [[0.02, 0.08, 1], [0.02, 0.08, -1], [0.07, 0.12, 1], [0.07, 0.12, -1]]) { const a = [], n = 5; for (let i = 0; i <= n; i++) { const t = i / n, z = z0 + (z1 - z0) * t, x = s * side * (0.030 - 0.060 * t); const h = evalProf(norm(upProf), z); a.push([x, -0.050 + h[2] * Math.sqrt(Math.max(0.05, 1 - ((x / (h[0] + 0.004)) ** 2))) + 0.0015 + (z > 0.10 ? 1.6 * (z - 0.10) ** 2 : 0), z]); } cs.push(seam(a, 0.0024, 5)); }
      cs.push(seam([[side * 0.012, -0.052, 0.13], [side * 0.004, -0.030, 0.15], [0.0, -0.052, 0.17]], 0.0024, 4));
      add(an, redDk, ...cs);
    }
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
