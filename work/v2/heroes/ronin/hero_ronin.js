/**
 * hero_ronin - KAITO, The Last Ronin. Built on the runner candidate-C method: every body / cloth
 * segment is a subdivided SphereGeometry re-written by `tube()` (Hermite radius-by-height profile with
 * separate half-width / front depth / back depth, ellipsoidal end caps, gaussian bulges, sine cloth
 * folds, optional angle / height clamps for open edges), computeVertexNormals() + a position-keyed weld.
 * Trims are bevelled ExtrudeGeometry plates bent onto the cloth, cords are TubeGeometry with a per-ring
 * radius braid, the ponytail / strand are profile tubes bent along a CatmullRom curve.
 *
 * Design (approved ref refs/alpha/char_ronin.png): shaved sides + slicked top with a topknot ponytail
 * and a loose strand; faded-indigo crossed kimono top with wide open sleeves; red braided waist cord
 * with knot + tassels; short torn red haori cape over the shoulders (on the chest, flares behind);
 * wide dark hakama trousers gathered below the knee; white wrist and leg wraps; tabi + straw sandals
 * with red thongs; katana in a dark scabbard slung diagonally across the back (on the chest), brass
 * bell at the left hip (on the hips).
 *
 * 1.56 m, ~6.6 heads. Facing +Z; the figure's LEFT is +X.
 * Anchors (world m): sole 0, ankle 0.075, knee 0.425, hip 0.79, hips-root 0.85, spine 0.93,
 * chest 1.08, shoulder 1.258, neck 1.315, head 1.37 (chin 1.325), crown 1.56. elbow 1.00, wrist 0.78.
 * Every limb hangs down its joint's local -Y, so +rotation.x pitches it BACKWARD.
 * Joints hidden by OVERLAP: every limb segment ends in a cap circular in the YZ plane centred on the joint.
 */
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, roughness = 0.88, metalness = 0, extra) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness, ...(extra || {}) });
    if (name) m.name = name;
    return m;
  };
  const skin = M(0xb68d6a, undefined, 0.65);
  const eyeW = M(0xbdb8ad, undefined, 0.5);
  const hairM = M(0x15110f, 'fabric', 0.8);
  const stubble = M(0x6e5a4a, undefined, 0.72);
  const kimono = M(0x4b566b, 'fabric', 0.9);
  const kimonoDk = M(0x3a4356, 'fabric', 0.92);
  const capeM = M(0x96382f, 'fabric', 0.92, 0, { side: THREE.DoubleSide });
  const cordM = M(0xa8332b, 'fabric', 0.85);
  const hakama = M(0x2a2b2f, 'fabric', 0.92);
  const wrapM = M(0xbdb8ad, 'fabric', 0.85);
  const wrapDk = M(0xa39d91, 'fabric', 0.88);
  const straw = M(0xa08a58, 'fabric', 0.95);
  const brass = M(0x9a7a3a, 'metal', 0.45, 0.6);
  const sayaM = M(0x1e1a19, undefined, 0.35);
  const hiltM = M(0x2b2426, 'fabric', 0.85);
  const hiltRed = M(0x8a2e28, 'fabric', 0.85);

  /* ---------------------------------------------------------------- helpers (candidate C) */
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
  //   ymap(y, ang) clamps heights (open hems, hairlines); amap(ang, y) clamps angles (open fronts).
  function tube(o) {
    const S = o.surf || surfOf(o), P = S.P;
    const geo = new THREE.SphereGeometry(1, o.radial || 16, o.rings || 12);
    const y0 = o.y0 ?? P[0][0], y1 = o.y1 ?? P[P.length - 1][0];
    const cB = o.capB ?? 0.01, cT = o.capT ?? 0.01, aB = cB * 1.35, aT = cT * 1.35;
    const L = aB + (y1 - y0 - cB - cT) + aT, pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const px = pos.getX(i), py = Math.max(-1, Math.min(1, pos.getY(i))), pz = pos.getZ(i);
      let ang = Math.atan2(px, pz); const l = (1 - Math.acos(py) / PI) * L;
      let y, k = 1;
      if (l < aB) { const th = (l / aB) * PI / 2; y = y0 + cB * (1 - Math.cos(th)); k = Math.sin(th); }
      else if (l > L - aT) { const th = ((L - l) / aT) * PI / 2; y = y1 - cT * (1 - Math.cos(th)); k = Math.sin(th); }
      else y = y0 + cB + (l - aB);
      if (o.ymap) y = o.ymap(y, ang);
      if (o.amap) ang = o.amap(ang, y);
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
  const curveOf = (pts, closed = false) => new THREE.CatmullRomCurve3(pts.map(V), closed);
  const seam = (pts, r = 0.003, seg = 16, closed = false) => new THREE.TubeGeometry(curveOf(pts, closed), seg, r, 5, closed);
  // braided cord: a TubeGeometry whose rings swell and shrink along the run (radius modulated per ring)
  function braid(pts, r, seg, closed = false, amp = 0.28) {
    const cv = curveOf(pts, closed), geo = new THREE.TubeGeometry(cv, seg, r, 5, closed), p = geo.attributes.position, c = new THREE.Vector3();
    const rings = seg + 1, per = 6;
    for (let i = 0; i < p.count; i++) {
      const ring = Math.floor(i / per); cv.getPointAt(Math.min(1, ring / (rings - 1)), c);
      const s = 1 + amp * Math.sin(ring * 1.9);
      p.setXYZ(i, c.x + (p.getX(i) - c.x) * s, c.y + (p.getY(i) - c.y) * s, c.z + (p.getZ(i) - c.z) * s);
    }
    geo.computeVertexNormals(); return geo;
  }
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
  // bend a flat trim (X across, Y up, Z thickness) onto a surface so it follows the cloth
  function wrapOn(geo, S, yc, ac, lift = 0, tilt = 0, subdiv = 0) {
    const c0 = S(yc, ac), R = Math.hypot(c0[0] - S.P[0][4], c0[2] - S.P[0][5]) || 0.1, p = geo.attributes.position, ct = Math.cos(tilt), st = Math.sin(tilt);
    for (let i = 0; i < p.count; i++) {
      const x0 = p.getX(i), y0 = p.getY(i), x = x0 * ct - y0 * st, y = x0 * st + y0 * ct;
      const f = frameAt(S, yc + y, ac + x / R), q = f.p.addScaledVector(f.n, p.getZ(i) + lift);
      p.setXYZ(i, q.x, q.y, q.z);
    }
    geo.computeVertexNormals(); return geo;
  }
  // a long strip that follows a surface: built as a subdivided plane so it can curve (X across, Y along)
  function strip(S, w, y0, y1, a0, a1, lift, segs = 10, th = 0.003) {
    const geo = new THREE.BoxGeometry(w, 1, th, 1, segs, 1), p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const t = p.getY(i) + 0.5, y = y0 + (y1 - y0) * t, a = a0 + (a1 - a0) * t;
      const f = frameAt(S, y, a), R = Math.hypot(f.p.x, f.p.z) || 0.1;
      const f2 = frameAt(S, y, a + p.getX(i) / R), q = f2.p.addScaledVector(f2.n, p.getZ(i) + lift);
      p.setXYZ(i, q.x, q.y, q.z);
    }
    geo.computeVertexNormals(); return geo;
  }
  // bend a +Y tube (y in 0..L) along a curve: x -> curve normal, z -> binormal
  function bend(geo, pts, L) {
    const cv = curveOf(pts), p = geo.attributes.position, P = new THREE.Vector3(), T = new THREE.Vector3(), N = new THREE.Vector3(), B = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
    for (let i = 0; i < p.count; i++) {
      const t = Math.min(1, Math.max(0, p.getY(i) / L));
      cv.getPointAt(t, P); cv.getTangentAt(t, T);
      const ref = Math.abs(T.y) > 0.9 ? new THREE.Vector3(1, 0, 0) : up;
      N.crossVectors(ref, T).normalize(); B.crossVectors(T, N).normalize();
      P.addScaledVector(N, p.getX(i)).addScaledVector(B, p.getZ(i));
      p.setXYZ(i, P.x, P.y, P.z);
    }
    geo.computeVertexNormals(); return weldNormals(geo);
  }
  // aim a +Y-built geometry (base at y=0) from point a to point b
  function aim(geo, a, b) {
    const d = V(b).sub(V(a)), q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize());
    geo.applyQuaternion(q); geo.translate(a[0], a[1], a[2]); return geo;
  }

  const root = new THREE.Object3D(); g.add(root);

  /* ---------------------------------------------------------------- torso surface (chest-local y; world = 1.08 + y) */
  // the kimono over the body: same body as the runner, 5 mm looser, extended to a mid-thigh skirt
  const torsoS = surfOf({
    sq: 0.9,
    prof: [
      [-0.400, 0.170, 0.142, 0.150],   // kimono hem (world 0.68)
      [-0.320, 0.166, 0.128, 0.138],
      [-0.240, 0.160, 0.112, 0.120],   // hips
      [-0.195, 0.150, 0.100, 0.108],   // waist cord
      [-0.120, 0.150, 0.102, 0.106],
      [-0.060, 0.146, 0.098, 0.097],
      [0.020, 0.152, 0.104, 0.100],
      [0.100, 0.161, 0.112, 0.106],    // chest forward, shoulder blades back
      [0.160, 0.160, 0.106, 0.105],
      [0.200, 0.153, 0.094, 0.099, 0, -0.004],
      [0.226, 0.128, 0.080, 0.088, 0, -0.006],   // trapezius slope
      [0.246, 0.090, 0.066, 0.074, 0, -0.006],
      [0.262, 0.062, 0.058, 0.064, 0, -0.006],
    ],
    bulges: [
      { y: 0.105, h: 0.06, a: 0.42, w: 0.38, amp: 0.007 }, { y: 0.105, h: 0.06, a: -0.42, w: 0.38, amp: 0.007 },
      { y: 0.115, h: 0.07, a: PI - 0.5, w: 0.36, amp: 0.010 }, { y: 0.115, h: 0.07, a: PI + 0.5, w: 0.36, amp: 0.010 },
      { y: 0.03, h: 0.12, a: PI, w: 0.16, amp: -0.006 },
      { y: -0.26, h: 0.08, a: PI - 0.5, w: 0.5, amp: 0.010 }, { y: -0.26, h: 0.08, a: PI + 0.5, w: 0.5, amp: 0.010 },   // seat under the skirt
    ],
    // cloth: soft vertical hanging folds on the skirt, waist gather under the cord, blousing above it
    ripple: (y, a) => {
      const skirt = sstep(-0.40, -0.30, y) * (1 - sstep(-0.24, -0.20, y));
      const blouse = sstep(-0.19, -0.16, y) * (1 - sstep(-0.10, -0.05, y));
      return 0.004 * skirt * Math.sin(a * 11 + 0.4) * 0 + 0.0045 * (skirt + 0.3 * sstep(-0.30, -0.24, y) * (1 - sstep(-0.24, -0.2, y))) * Math.sin(a * 9 + 0.8 + y * 6)
        + 0.0035 * blouse * Math.sin(y * 150 + Math.sin(a * 2) * 1.5 + a * 2.5);
    },
  });

  /* ---------------------------------------------------------------- hips (root joint, world 0.85) */
  const hips = J(0, 0.85, 0, root);
  const HP = 0.23;   // chest-local -> hips-local
  // hakama waist / seat: dark trousers gathered under the kimono, only the front V and side slits ever show it
  const pelvisS = surfOf({
    sq: 0.92,
    prof: [
      [-0.170, 0.070, 0.058, 0.080],
      [-0.095, 0.132, 0.070, 0.104],
      [-0.035, 0.150, 0.082, 0.106],
      [0.020, 0.144, 0.088, 0.092],
      [0.075, 0.136, 0.084, 0.084],
    ],
    bulges: [
      { y: -0.045, h: 0.055, a: PI - 0.48, w: 0.42, amp: 0.012 }, { y: -0.045, h: 0.055, a: PI + 0.48, w: 0.42, amp: 0.012 },
      { y: -0.06, h: 0.07, a: PI, w: 0.12, amp: -0.008 },
    ],
  });
  add(hips, hakama, tube({ surf: pelvisS, y0: -0.170, y1: 0.075, capB: 0.09, capT: 0.02, radial: 16, rings: 8 }));
  { // RED BRAIDED WAIST CORD (obi-himo): two turns, a knot at the front-left, two tassel ends
    const ring = (yy, lift) => { const pts = []; for (let i = 0; i < 26; i++) { const a = (i / 26) * 2 * PI, f = frameAt(torsoS, yy, a); const q = f.p.addScaledVector(f.n, lift); pts.push([q.x, q.y + HP, q.z]); } return pts; };
    const gs = [braid(ring(-0.190, 0.006), 0.0085, 24, true), braid(ring(-0.207, 0.0065), 0.0085, 24, true), braid(ring(-0.222, 0.006), 0.008, 24, true)];
    // knot: a loop and two crossing bights at ang ~0.35 (front-left), then two ends hanging with tufts
    const kc = torsoS(-0.20, 0.38);
    const kx = kc[0], ky = kc[1] + HP, kz = kc[2] + 0.012;
    gs.push(braid([[kx - 0.03, ky + 0.012, kz - 0.002], [kx - 0.005, ky + 0.024, kz + 0.008], [kx + 0.025, ky + 0.014, kz + 0.012], [kx + 0.03, ky - 0.012, kz + 0.008], [kx, ky - 0.02, kz + 0.012], [kx - 0.03, ky - 0.006, kz + 0.004]], 0.008, 16, true));
    gs.push(braid([[kx - 0.02, ky + 0.004, kz + 0.012], [kx + 0.01, ky, kz + 0.02], [kx + 0.03, ky - 0.03, kz + 0.02], [kx + 0.045, ky - 0.075, kz + 0.006], [kx + 0.048, ky - 0.120, kz - 0.008]], 0.0065, 14));
    gs.push(braid([[kx + 0.005, ky - 0.006, kz + 0.012], [kx - 0.015, ky - 0.03, kz + 0.02], [kx - 0.03, ky - 0.065, kz + 0.012], [kx - 0.034, ky - 0.105, kz - 0.002]], 0.0065, 12));
    // tassel tufts
    gs.push(place(tube({ prof: [[0, 0.006], [0.012, 0.012], [0.03, 0.013], [0.042, 0.009]], y0: 0, y1: 0.044, capB: 0.006, capT: 0.008, radial: 8, rings: 5, ripple: (y, a) => 0.0015 * Math.cos(a * 8) }), kx + 0.049, ky - 0.162, kz - 0.010));
    gs.push(place(tube({ prof: [[0, 0.006], [0.012, 0.012], [0.03, 0.013], [0.042, 0.009]], y0: 0, y1: 0.044, capB: 0.006, capT: 0.008, radial: 8, rings: 5, ripple: (y, a) => 0.0015 * Math.cos(a * 8) }), kx - 0.036, ky - 0.148, kz - 0.004));
    // bell string from the cord on the left hip
    gs.push(seam([[0.152, HP - 0.205, 0.045], [0.185, HP - 0.245, 0.055], [0.205, HP - 0.30, 0.058]], 0.003, 6));
    add(hips, cordM, ...gs);
    // BRASS BELL (suzu) hanging at the left hip: lathe bell + crown loop + clapper lip
    const pts = [[0.0, 0], [0.024, 0.0], [0.031, 0.006], [0.031, 0.014], [0.028, 0.026], [0.021, 0.040], [0.012, 0.050], [0.004, 0.056], [0, 0.058]].map((p) => new THREE.Vector2(p[0], p[1]));
    const bell = new THREE.LatheGeometry(pts, 14);
    const BX = 0.205, BY = HP - 0.360, BZ = 0.058;
    bell.translate(BX, BY, BZ);
    const loop = new THREE.TorusGeometry(0.008, 0.0025, 5, 10); place(loop, BX, BY + 0.062, BZ, 0, PI / 2, 0);
    const lip = new THREE.TorusGeometry(0.027, 0.004, 5, 14); place(lip, BX, BY + 0.003, BZ, PI / 2, 0, 0);
    add(hips, brass, bell, loop, lip);
  }

  /* ---------------------------------------------------------------- spine (world 0.93) - kimono skirt */
  const spine = J(0, 0.08, 0, hips);
  const SP = 0.15;   // chest-local -> spine-local
  // the skirt is closed round the back and sides; below the hip line the FRONT is left open (the front
  // panels hang from the hip joints so they swing with the thighs and never get pierced by a knee)
  add(spine, kimono, place(tube({ surf: torsoS, y0: -0.392, y1: 0.06, capB: 0.02, capT: 0.015, radial: 24, rings: 16,
    ymap: (y, a) => { const f = 1 - sstep(0.72, 0.95, Math.abs(a)); return Math.max(y, -0.40 + f * 0.11); },
    post: (x, y, z) => { const k = 1 - 0.022 * sstep(0.0, 0.045, y); return [x * k, y, z * k]; } }), 0, SP, 0));
  { // dark hem edge and the front overlap edge below the crossing
    const hem = []; for (let i = 0; i < 40; i++) { const a = PI - 2.35 + (i / 39) * 4.7; const q = torsoS(-0.396, a); hem.push([q[0] * 1.01, q[1] + SP, q[2] * 1.01]); }
    add(spine, kimonoDk, seam(hem, 0.004, 40), place(strip(torsoS, 0.030, -0.055, -0.19, 0.095, 0.11, 0.0025, 4), 0, SP, 0));
  }

  /* ---------------------------------------------------------------- chest (world 1.08) */
  const chest = J(0, 0.15, 0, spine);
  // bare chest / neck base under the kimono V
  add(chest, skin, tube({ surf: torsoS, y0: 0.0, y1: 0.262, capB: 0.012, capT: 0.014, radial: 16, rings: 8, post: (x, y, z) => [x * 0.985, y, z * 0.985] }));
  // kimono body with the crossed V front cut out
  const vtop = (a) => 0.02 + (Math.min(0.56, Math.abs(a)) / 0.56) * 0.235;
  add(chest, kimono, tube({ surf: torsoS, y0: -0.06, y1: 0.262, capB: 0.012, capT: 0.014, radial: 24, rings: 15,
    ymap: (y, a) => (Math.abs(a) < 0.56 ? Math.min(y, vtop(a)) : y),
    post: (x, y, z) => { const k = 1 - 0.022 * (1 - sstep(-0.05, 0.0, y)); return [x * k, y, z * k]; } }));
  { // collar bands: two dark strips along the V edges (left over right), the left continuing down over the crossing
    const gs = [];
    gs.push(strip(torsoS, 0.034, 0.262, 0.030, 0.56, 0.035, 0.0025, 8));     // left band (his left = +X), on top
    gs.push(strip(torsoS, 0.034, 0.262, 0.045, -0.56, -0.03, 0.0015, 8));    // right band, under
    gs.push(strip(torsoS, 0.030, 0.035, -0.06, 0.06, 0.095, 0.0025, 4));     // left band down to the chest joint
    add(chest, kimonoDk, ...gs);
  }

  /* ---------------------------------------------------------------- HAORI CAPE (hero surface, on the chest, flares behind) */
  const capeS = surfOf({
    sq: 0.95,
    prof: [
      [-0.050, 0.272, 0.160, 0.185, 0, -0.014],
      [0.020, 0.268, 0.156, 0.182, 0, -0.014],
      [0.090, 0.256, 0.142, 0.172, 0, -0.012],
      [0.150, 0.244, 0.126, 0.156, 0, -0.010],
      [0.200, 0.232, 0.112, 0.138, 0, -0.008],
      [0.232, 0.218, 0.100, 0.120, 0, -0.008],
      [0.248, 0.160, 0.088, 0.104, 0, -0.010],
      [0.258, 0.100, 0.076, 0.090, 0, -0.012],
      [0.266, 0.082, 0.070, 0.082, 0, -0.014],
    ],
    bulges: [{ y: 0.12, h: 0.09, a: PI, w: 0.35, amp: 0.012 }, { y: 0.09, h: 0.06, a: PI - 0.9, w: 0.3, amp: 0.008 }, { y: 0.09, h: 0.06, a: PI + 0.9, w: 0.3, amp: 0.008 }],
    ripple: (y, a) => (0.006 * Math.sin(a * 7 + 0.5 + y * 12) + 0.0035 * Math.sin(a * 15 + y * 40 + 1.3)) * (1 - sstep(0.20, 0.25, y)),
  });
  const capeHem = (a) => { const b = Math.abs(a); const base = 0.05 - 0.09 * Math.exp(-(((b - 1.45) / 0.55) ** 2)) + 0.03 * sstep(2.2, 3.0, b) - 0.02 * (1 - sstep(0.55, 0.9, b)); return base + 0.020 * Math.sin(a * 13 + 0.7) + 0.013 * Math.sin(a * 29 + 2.1) + 0.008 * Math.sin(a * 47 + 0.3); };
  const capeOpen = (y) => 0.58 * sstep(0.258, 0.225, y);
  add(chest, capeM, tube({ surf: capeS, y0: -0.05, y1: 0.266, capB: 0.004, capT: 0.008, radial: 32, rings: 18,
    ymap: (y, a) => Math.max(y, capeHem(a)),
    amap: (a, y) => { const o = capeOpen(y); return Math.abs(a) < o ? Math.sign(a || 1) * o : a; } }));
  { // red braided cord round the cape's neck and down both front edges, tied off in a loop + tassel on the left chest
    const gs = [];
    const neckPts = []; for (let i = 0; i <= 20; i++) { const a = -PI + (i / 20) * 2 * PI * 0.99; const q = capeS(0.258, a); neckPts.push([q[0] * 1.02, q[1] + 0.004, q[2] * 1.02 - 0.002]); }
    gs.push(braid(neckPts, 0.0075, 26, false, 0.25));
    for (const s of [-1, 1]) {
      const pts = []; for (let i = 0; i <= 8; i++) { const y = 0.252 - (i / 8) * 0.242; const q = capeS(y, s * (capeOpen(y) + 0.02)); pts.push([q[0], q[1], q[2] + 0.006]); }
      gs.push(braid(pts, 0.0075, 12, false, 0.25));
    }
    // the tied loop with a tassel on the left chest (+X)
    const t0 = capeS(0.11, 0.62);
    gs.push(braid([[t0[0] + 0.01, t0[1] + 0.02, t0[2] + 0.01], [t0[0] - 0.03, t0[1] - 0.005, t0[2] + 0.02], [t0[0] - 0.015, t0[1] - 0.05, t0[2] + 0.024], [t0[0] + 0.02, t0[1] - 0.045, t0[2] + 0.02], [t0[0] + 0.02, t0[1] - 0.005, t0[2] + 0.016]], 0.007, 12, true, 0.25));
    gs.push(braid([[t0[0] - 0.005, t0[1] - 0.045, t0[2] + 0.022], [t0[0] - 0.006, t0[1] - 0.08, t0[2] + 0.024], [t0[0] - 0.004, t0[1] - 0.11, t0[2] + 0.02]], 0.005, 8, false, 0.2));
    gs.push(place(tube({ prof: [[0, 0.006], [0.012, 0.013], [0.03, 0.014], [0.04, 0.009]], y0: 0, y1: 0.042, capB: 0.006, capT: 0.008, radial: 8, rings: 5, ripple: (y, a) => 0.0015 * Math.cos(a * 8) }), t0[0] - 0.004, t0[1] - 0.152, t0[2] + 0.018));
    add(chest, cordM, ...gs);
  }

  /* ---------------------------------------------------------------- KATANA across the back (on the chest): tip at the left hip, hilt over the right shoulder */
  {
    const TIP = [0.195, -0.415, -0.185], TSUBA = [-0.115, 0.255, -0.148];
    const dir = V(TSUBA).sub(V(TIP)); const L = dir.length();
    const sayaProf = [[0, 0.011, 0.014], [0.03, 0.013, 0.017], [L - 0.05, 0.014, 0.019], [L, 0.0145, 0.0195]];
    const saya = tube({ prof: sayaProf.map((p) => [p[0], p[1], p[2], p[2], 0.012 * ((p[0] / L) ** 2), 0]), y0: 0, y1: L, capB: 0.012, capT: 0.004, radial: 12, rings: 10 });
    add(chest, sayaM, aim(saya, TIP, TSUBA));
    // kojiri (tip cap), koiguchi collar and the tsuba in brass; sageo cord wound at the mouth
    const kojiri = tube({ prof: [[0, 0.0115, 0.0145], [0.035, 0.0135, 0.0175]], y0: 0, y1: 0.036, capB: 0.012, capT: 0.003, radial: 12, rings: 4, post: (x, y, z) => [x * 1.06, y, z * 1.06] });
    const koi = new THREE.CylinderGeometry(0.0175, 0.0175, 0.012, 12); koi.scale(1, 1, 1.35); koi.translate(0, L - 0.006, 0.012 * 0.98);
    const tsuba = new THREE.CylinderGeometry(0.037, 0.037, 0.0045, 16); tsuba.translate(0, L + 0.004, 0.012);
    add(chest, brass, aim(kojiri, TIP, TSUBA), aim(koi, TIP, TSUBA), aim(tsuba, TIP, TSUBA));
    const sageo = []; for (let i = 0; i <= 14; i++) { const t = i / 14, a = t * 2 * PI * 2.5; sageo.push([0.0165 * Math.sin(a), L - 0.10 + t * 0.045, 0.012 + 0.0205 * Math.cos(a)]); }
    add(chest, cordM, aim(braid(sageo, 0.004, 30, false, 0.2), TIP, TSUBA));
    // tsuka: wrapped hilt, diamond wrap ridges, red silk showing in the gaps, brass kashira
    const HL = 0.245;
    const tsuka = tube({ prof: [[0, 0.0135, 0.017], [0.10, 0.0135, 0.018], [HL, 0.0125, 0.0165]], y0: 0, y1: HL, capB: 0.004, capT: 0.008, radial: 10, rings: 12,
      ripple: (y, a) => 0.0018 * Math.cos(a * 2 + y * 150) + 0.0012 * Math.cos(a * 2 - y * 150 + 1) });
    tsuka.translate(0, L + 0.006, 0.012);
    add(chest, hiltM, aim(tsuka, TIP, TSUBA));
    const reds = []; for (let i = 0; i < 5; i++) { for (const s of [-1, 1]) { reds.push(place(ell(0.006, 0.011, 0.004, 5, 3), s * 0.0125, L + 0.030 + i * 0.045, 0.012 + 0.006 * (i % 2 ? 1 : -1))); } }
    add(chest, hiltRed, aim(merge(reds), TIP, TSUBA));
    const kashira = new THREE.CylinderGeometry(0.0125, 0.014, 0.010, 10); kashira.scale(1, 1, 1.3); kashira.translate(0, L + HL + 0.008, 0.012);
    add(chest, brass, aim(kashira, TIP, TSUBA));
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
    bulges: [
      { y: 0.084, h: 0.014, a: 0, w: 0.75, amp: 0.0045 },
      { y: 0.064, h: 0.013, a: 0.40, w: 0.20, amp: -0.0065 }, { y: 0.064, h: 0.013, a: -0.40, w: 0.20, amp: -0.0065 },
      { y: 0.040, h: 0.02, a: 0.62, w: 0.25, amp: 0.004 }, { y: 0.040, h: 0.02, a: -0.62, w: 0.25, amp: 0.004 },
      { y: 0.004, h: 0.008, a: 0, w: 0.30, amp: -0.003 }, { y: -0.006, h: 0.008, a: 0, w: 0.26, amp: 0.003 },
      { y: 0.03, h: 0.03, a: PI, w: 0.5, amp: -0.004 },
    ],
  });
  add(head, skin,
    tube({ surf: headS, y0: -0.047, y1: 0.180, capB: 0.02, capT: 0.05, radial: 18, rings: 14 }),
    place(tube({ prof: [[0.0, 0.0135, 0.015, 0.012], [0.016, 0.011, 0.012, 0.012], [0.050, 0.0075, 0.0045, 0.010]], y0: -0.005, y1: 0.056, capB: 0.009, capT: 0.006, radial: 8, rings: 6 }), 0, 0.024, 0.0685, 0.10, 0, 0),
    place(ell(0.0075, 0.023, 0.0145, 8, 6), 0.0745, 0.052, -0.004, 0, 0.45, -0.10),
    place(ell(0.0075, 0.023, 0.0145, 8, 6), -0.0745, 0.052, -0.004, 0, -0.45, 0.10));
  { // SHAVED SIDES: a stubble shell over the skull sides and back, from the nape up to the undercut line
    const stubS = surfOf({ prof: headS.P.map((q) => [q[0], q[1] + 0.0012, q[2] + 0.0012, q[3] + 0.0012, q[4], q[5]]), bulges: headS.bulges || [] });
    add(head, stubble, tube({ surf: stubS, y0: 0.0, y1: 0.152, capB: 0.006, capT: 0.006, radial: 18, rings: 8,
      ymap: (y, a) => { const b = Math.abs(a); const lo = b < 0.9 ? 0.15 : 0.03 - 0.03 * sstep(0.9, 1.5, b); return Math.min(0.150, Math.max(y, lo)); } }));
  }
  { // TOP HAIR: a raised strip slicked back from the forehead to a topknot at the crown; then the ponytail and a loose strand
    const hairS = surfOf({
      prof: [
        [0.090, 0.079, 0.085, 0.100, 0, 0.0],
        [0.120, 0.080, 0.090, 0.106, 0, 0.0],
        [0.150, 0.078, 0.092, 0.104, 0, -0.002],
        [0.180, 0.066, 0.080, 0.088, 0, -0.008],
        [0.206, 0.040, 0.050, 0.060, 0, -0.016],
      ],
      ripple: (y, a) => 0.0035 * Math.sin(a * 11 + 0.3) * (1 - sstep(0.19, 0.2, y)),
    });
    const hairline = (a) => { const b = Math.abs(a); if (b < 0.4) return 0.110 + 0.02 * (b / 0.4); return 0.130 + 0.016 * sstep(0.4, 1.3, b) - 0.012 * sstep(2.0, 3.1, b); };
    const gs = [tube({ surf: hairS, y0: 0.09, y1: 0.206, capB: 0.006, capT: 0.03, radial: 20, rings: 8, ymap: (y, a) => Math.max(y, hairline(a)) })];
    // topknot base + the ponytail bent along a curve (streams back, up and over to his left)
    gs.push(place(ell(0.027, 0.022, 0.027, 8, 5), 0, 0.186, -0.045));
    const tailPts = [[0, 0.188, -0.05], [0.012, 0.196, -0.10], [0.035, 0.18, -0.15], [0.065, 0.135, -0.19], [0.095, 0.07, -0.21], [0.115, 0.0, -0.215]];
    const TL = 0.40;
    gs.push(bend(tube({ prof: [[0, 0.020, 0.020], [0.05, 0.028, 0.022], [0.16, 0.030, 0.018], [0.28, 0.022, 0.012], [0.40, 0.004, 0.003]], y0: 0, y1: TL, capB: 0.012, capT: 0.006, radial: 9, rings: 14,
      ripple: (y, a) => 0.0022 * Math.cos(a * 5 + y * 20) }), tailPts, TL));
    // loose strand down the right side of the face
    const sPts = [[-0.046, 0.118, 0.062], [-0.056, 0.075, 0.085], [-0.06, 0.03, 0.084], [-0.058, -0.01, 0.076]];
    gs.push(bend(tube({ prof: [[0, 0.0065], [0.06, 0.0055], [0.13, 0.0022]], y0: 0, y1: 0.13, capB: 0.005, capT: 0.002, radial: 6, rings: 6 }), sPts, 0.13));
    // brows + eyes
    for (const s of [-1, 1]) {
      const b = headS(0.0835, s * 0.40), e = headS(0.064, s * 0.40);
      gs.push(place(ell(0.0150, 0.0034, 0.004, 6, 3), b[0], b[1], b[2] - 0.0005, 0, s * 0.35, s * -0.16));
      gs.push(place(ell(0.0115, 0.0026, 0.003, 6, 3), e[0], e[1] + 0.0048, e[2] + 0.0012, 0, s * 0.35, s * -0.12));   // upper lid line
      gs.push(place(ell(0.0046, 0.0046, 0.002, 6, 3), e[0] + s * 0.001, e[1] - 0.0004, e[2] + 0.0036, 0, s * 0.35, 0));    // iris
    }
    add(head, hairM, ...gs);
    { const ws = []; for (const s of [-1, 1]) { const e = headS(0.064, s * 0.40); ws.push(place(ell(0.0110, 0.0062, 0.003, 6, 3), e[0], e[1] - 0.0004, e[2] + 0.0008, 0, s * 0.35, 0)); } add(head, eyeW, ...ws); }
    // red tie round the topknot
    add(head, cordM, place(new THREE.TorusGeometry(0.0165, 0.0045, 6, 12), 0.004, 0.197, -0.072, 1.15, 0.15, 0));
  }

  /* ---------------------------------------------------------------- arms */
  function arm(side) {
    const sh = J(side * 0.150, 0.178, -0.005, chest);             // world 1.258
    sh.rotation.z = side * 0.17;
    // bare upper arm (ball at the shoulder, ball at the elbow)
    add(sh, skin, tube({
      prof: [[-0.298, 0.042, 0.044, 0.044], [-0.255, 0.042, 0.044, 0.044], [-0.160, 0.044, 0.047, 0.048], [-0.070, 0.050, 0.052, 0.053], [0.0, 0.053, 0.054, 0.054], [0.054, 0.053, 0.054, 0.054]],
      y0: -0.298, y1: 0.054, capB: 0.043, capT: 0.054, radial: 12, rings: 10,
      bulges: [{ y: -0.10, h: 0.06, a: 0, w: 0.8, amp: 0.005 }, { y: -0.13, h: 0.06, a: PI, w: 0.8, amp: 0.004 }],
    }));
    // WIDE KIMONO SLEEVE: hangs from the shoulder to the elbow, open at the bottom (concave cap reads as the dark inside)
    add(sh, kimono, tube({
      prof: [[-0.262, 0.078, 0.080, 0.084, 0, -0.006], [-0.20, 0.076, 0.078, 0.082, 0, -0.004], [-0.12, 0.070, 0.071, 0.074], [-0.04, 0.064, 0.064, 0.066], [0.02, 0.062, 0.062, 0.062], [0.062, 0.060, 0.060, 0.060]],
      y0: -0.262, y1: 0.062, capB: 0.006, capT: 0.06, radial: 16, rings: 12,
      ripple: (y, a) => 0.0035 * Math.sin(a * 6 + 1) * sstep(-0.26, -0.18, y) + 0.002 * Math.sin(y * 90 + a),
      post: (x, y, z, a, k) => (y < -0.25 ? [x, y + 0.075 * (1 - k), z] : null),
    }));
    add(sh, kimonoDk, tube({ prof: [[-0.262, 0.073, 0.075, 0.079, 0, -0.006], [-0.225, 0.071, 0.073, 0.077, 0, -0.005]], y0: -0.262, y1: -0.222, capB: 0.003, capT: 0.003, radial: 14, rings: 3,
      post: (x, y, z, a, k) => (y < -0.258 ? [x, y + 0.03 * (1 - k), z] : null) }));
    const el = J(0, -0.255, 0, sh);                               // world ~1.00
    el.rotation.x = -0.10;
    // elbow ball (skin) and the white wrist wrap spiralling down the forearm onto the back of the hand
    add(el, skin, tube({ prof: [[-0.06, 0.036, 0.037], [0.0, 0.0395, 0.0405], [0.0405, 0.0395, 0.0405]], y0: -0.062, y1: 0.0405, capB: 0.006, capT: 0.0405, radial: 12, rings: 5 }));
    add(el, wrapM, tube({
      prof: [[-0.262, 0.024, 0.030], [-0.215, 0.030, 0.031], [-0.160, 0.035, 0.037], [-0.090, 0.039, 0.041], [-0.040, 0.040, 0.041], [-0.020, 0.037, 0.038]],
      y0: -0.264, y1: -0.018, capB: 0.006, capT: 0.008, radial: 12, rings: 12,
      ripple: (y, a) => 0.0034 * (0.5 - ((y * 30 + a / (2 * PI) + 10) % 1)) + 0.0006 * Math.cos(y * 400 + a),
    }));
    // hand: palm (wrapped over the back), curled fingers + thumb in skin
    const inw = -side;
    add(el, wrapDk,
      place(tube({ prof: [[-0.055, 0.020, 0.041, 0.041], [-0.020, 0.0215, 0.042, 0.041], [0.030, 0.019, 0.036, 0.034]], y0: -0.058, y1: 0.034, capB: 0.025, capT: 0.02, radial: 10, rings: 7,
        ripple: (y, a) => 0.0012 * Math.cos(y * 200 + a) }), inw * 0.002, -0.290, 0.004, 0, 0, 0));
    add(el, skin,
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
    // HAKAMA leg: narrow under the kimono, ballooning to the knee, big ball at the knee that the gathered cuff emerges from
    add(hp, hakama, tube({
      prof: [[-0.450, 0.086, 0.088, 0.088], [-0.365, 0.090, 0.093, 0.093], [-0.300, 0.104, 0.108, 0.110], [-0.220, 0.108, 0.112, 0.114], [-0.140, 0.100, 0.104, 0.104], [-0.080, 0.090, 0.093, 0.094], [0.0, 0.082, 0.083, 0.083], [0.082, 0.081, 0.082, 0.082]],
      y0: -0.451, y1: 0.082, capB: 0.086, capT: 0.082, radial: 16, rings: 12,
      bulges: [{ y: -0.15, h: 0.10, a: side * 0.5, w: 0.7, amp: 0.004 }],
      // hanging cloth folds, a fuller gather just above the knee
      ripple: (y, a) => 0.005 * Math.sin(a * 7 + side * 0.5 + y * 8) * sstep(-0.40, -0.25, y) * (1 - sstep(-0.12, -0.02, y)) + 0.0035 * Math.sin(a * 13 + y * 60) * sstep(-0.42, -0.32, y),
    }));
    // KIMONO FRONT PANEL hanging from this hip joint (fills the open front of the skirt, swings with the thigh)
    { const a0 = side > 0 ? -0.22 : -0.78, a1 = side > 0 ? 0.78 : 0.06;   // left panel laps over the right
      const geo = new THREE.BoxGeometry(1, 1, 0.003, 6, 6, 1), p = geo.attributes.position;
      for (let i = 0; i < p.count; i++) {
        const u = p.getX(i) + 0.5, t = p.getY(i) + 0.5, y = -0.40 + t * 0.145, a = a0 + (a1 - a0) * u;
        const f = frameAt(torsoS, y, a), q = f.p.addScaledVector(f.n, p.getZ(i) - 0.001 - 0.006 * sstep(-0.31, -0.27, y) + (side > 0 ? 0.0 : -0.003));
        p.setXYZ(i, q.x - side * 0.083, q.y + 0.29, q.z);
      }
      geo.computeVertexNormals();
      add(hp, kimono, geo);
    }
    const kn = J(0, -0.365, 0, hp);                               // world 0.425
    // gathered hakama cuff just under the knee (dark), then the white LEG WRAPS to the ankle
    add(kn, hakama, tube({ prof: [[-0.065, 0.062, 0.064, 0.066], [-0.030, 0.068, 0.070, 0.072], [0.0, 0.066, 0.068, 0.068], [0.06, 0.060, 0.062, 0.062]], y0: -0.066, y1: 0.06, capB: 0.006, capT: 0.06, radial: 16, rings: 6,
      ripple: (y, a) => 0.0035 * Math.cos(a * 14) * sstep(-0.066, -0.05, y) }));
    add(kn, wrapM, tube({
      prof: [[-0.354, 0.040, 0.042, 0.044], [-0.300, 0.042, 0.043, 0.046], [-0.200, 0.049, 0.048, 0.060], [-0.110, 0.056, 0.052, 0.070], [-0.060, 0.058, 0.056, 0.063], [-0.040, 0.059, 0.058, 0.061]],
      y0: -0.356, y1: -0.038, capB: 0.006, capT: 0.008, radial: 14, rings: 14,
      bulges: [{ y: -0.12, h: 0.06, a: PI, w: 0.75, amp: 0.004 }],
      ripple: (y, a) => 0.0040 * (0.5 - ((y * 24 + a / (2 * PI) + 10) % 1)) + 0.0006 * Math.cos(y * 340 + a * 2),
    }));
    const an = J(0, -0.35, 0, kn);                                // world 0.075
    // --- tabi sock foot on a straw sandal with a red thong
    const spring = (geo) => { const p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const z = p.getZ(i); let y = p.getY(i); if (z > 0.10) y += 1.2 * (z - 0.10) ** 2; p.setY(i, y); } geo.computeVertexNormals(); return geo; };
    const ext = (grow, depth, bevel, yTop) => { const e = new THREE.ExtrudeGeometry(footprint(side, grow), { depth, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 1, curveSegments: 2, steps: 1 }); e.rotateX(PI / 2); e.translate(0, yTop, 0); return e; };
    const sole = ext(1.06, 0.016, 0.004, -0.055);                // straw sole -0.075 .. -0.055
    { const p = sole.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); p.setY(i, p.getY(i) + 0.0012 * Math.sin(z * 420) * (p.getY(i) > -0.06 ? 1 : 0)); } sole.computeVertexNormals(); }
    add(an, straw, spring(sole));
    const upProf = [[-0.070, 0.030, 0.010, 0.056, 0, 0.050], [-0.048, 0.036, 0.010, 0.078, side * 0.001, 0.050], [0.0, 0.040, 0.010, 0.078, side * 0.003, 0.050], [0.040, 0.041, 0.010, 0.066, side * 0.003, 0.050],
      [0.090, 0.045, 0.010, 0.046, side * 0.002, 0.050], [0.140, 0.041, 0.010, 0.034, side * -0.001, 0.050], [0.180, 0.026, 0.010, 0.026, side * -0.004, 0.050]];
    const lay = (geo) => { geo.rotateX(PI / 2); return geo; };
    const foot = lay(tube({ prof: upProf, y0: -0.070, y1: 0.180, capB: 0.02, capT: 0.03, radial: 12, rings: 12, sq: 0.8,
      bulges: [{ y: 0.15, h: 0.03, a: PI / 2, w: 0.25, amp: -0.004 }] }));   // hint of the tabi toe split
    add(an, wrapDk, spring(foot), ell(0.036, 0.034, 0.038, 10, 6));       // + sock ball at the joint
    // thong: from the toe post over the instep to both sides of the heel
    const post = [side * 0.010, -0.055, 0.132], mid = [side * 0.004, -0.014, 0.075];
    add(an, cordM, seam([post, mid, [side * 0.038, -0.040, 0.030], [side * 0.040, -0.055, 0.005]], 0.0055, 10), seam([post, mid, [-side * 0.034, -0.040, 0.030], [-side * 0.036, -0.055, 0.005]], 0.0055, 10),
      place(new THREE.CylinderGeometry(0.006, 0.007, 0.02, 6), post[0], -0.056, post[2]));
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
