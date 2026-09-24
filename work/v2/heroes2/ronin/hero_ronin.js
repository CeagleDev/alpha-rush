/**
 * hero_ronin - KAITO, The Last Ronin. Detail pass + wardrobe (HERO2_BRIEF / HERO_API).
 *
 * Every body / cloth segment is a subdivided SphereGeometry re-written by `tube()` (Hermite radius-by-height
 * profile with separate half-width / front depth / back depth, ellipsoidal end caps, gaussian bulges, cloth
 * folds, height / angle clamps for open edges), computeVertexNormals() + a position-keyed normal weld so every
 * organic part is smooth. Cords are TubeGeometry with a per-ring braid, lids / lips / brows / hair clumps are
 * tapered tubes along CatmullRom curves, fingers are profile tubes bent along a curl, armour plates and straps
 * are subdivided boxes laid on the cloth surface.
 *
 * OUTFITS: 'ronin' (the reference: torn red haori, indigo kimono, hakama, wraps, sandals, katana on the back,
 * hip bell), 'ashigaru' (lacquered do-maru with laced lames + tassets over a short-sleeved kimono, jingasa, shin
 * guards, katana at the hip), 'street' (hooded bomber open over the kimono top, hakama tucked into high-tops,
 * katana in a slung cloth bag, face mask round the neck). A palette changes material colours only.
 *
 * 1.56 m, ~6.6 heads. Facing +Z; the figure's LEFT is +X.
 * Anchors (world m): sole 0, ankle 0.075, knee 0.425, hip 0.79, hips-root 0.85, spine 0.93,
 * chest 1.08, shoulder 1.258, neck 1.315, head 1.37 (chin 1.325), crown 1.56. elbow 1.00, wrist 0.74, fingertips 0.59.
 * Every limb hangs down its joint's local -Y, so +rotation.x pitches it BACKWARD.
 * Joints hidden by OVERLAP: every limb segment ends in a cap circular in the YZ plane centred on the joint.
 */
export const OUTFITS = [
  { id: 'ronin', name: 'The Last Ronin', desc: 'Torn haori, one blade, no master. Runs like he has nothing left to lose.',
    palettes: [
      { id: 'indigo', name: 'Indigo Dusk', swatch: ['#4b566b', '#96382f', '#bdb8ad'] },
      { id: 'ashbone', name: 'Ash & Bone', swatch: ['#6e6f6c', '#b9ae95', '#1c1c1e'] },
      { id: 'bloodiron', name: 'Blood Iron', swatch: ['#1f1e21', '#6e1f1c', '#8a4a2a'] },
      { id: 'moss', name: 'Moss Court', swatch: ['#3f5a3a', '#a8782c', '#d8cdb4'] },
    ] },
  { id: 'ashigaru', name: 'Ashigaru', desc: 'Foot-soldier lacquer and a wide straw hat. Cheap armour, expensive habits.',
    palettes: [
      { id: 'blacklacquer', name: 'Black Lacquer', swatch: ['#1c1b1c', '#a8332b', '#4b566b'] },
      { id: 'crimson', name: 'Crimson Plate', swatch: ['#7e2120', '#1e1d1f', '#5a5b5e'] },
      { id: 'bronze', name: 'Bronze', swatch: ['#7a5a2c', '#2f4a30', '#5a4636'] },
      { id: 'icewhite', name: 'Ice White', swatch: ['#cfcdc6', '#6f8fb0', '#6f7d90'] },
    ] },
  { id: 'street', name: 'Street Ronin', desc: 'Bomber over the kimono, blade in a gym bag. The city is the only dojo left.',
    palettes: [
      { id: 'nightorange', name: 'Night Orange', swatch: ['#1e1f23', '#b8571f', '#4b566b'] },
      { id: 'mono', name: 'Monochrome', swatch: ['#c9c6bf', '#1e1f23', '#8a8a86'] },
      { id: 'acid', name: 'Acid Lime', swatch: ['#2a2c2e', '#9ab818', '#1f1f22'] },
      { id: 'cobalt', name: 'Cobalt', swatch: ['#2a4a9a', '#d8cdb4', '#d0ccc2'] },
    ] },
];

// material colours per outfit / palette (roles the geometry reads; skin, eyes, hair, brass, scabbard are fixed)
const COLOURS = {
  ronin: {
    indigo:    { kimono: 0x4b566b, kimonoDk: 0x3a4356, stitch: 0x6b7590, cape: 0x96382f, cord: 0xa8332b, hakama: 0x2a2b2f, wrap: 0xbdb8ad, wrapDk: 0xa39d91, straw: 0xa08a58, hiltRed: 0x8a2e28, tie: 0xa8332b },
    ashbone:   { kimono: 0x6e6f6c, kimonoDk: 0x55564f, stitch: 0x8a8b86, cape: 0xb9ae95, cord: 0x3a3a3c, hakama: 0x1c1c1e, wrap: 0xc9c2b4, wrapDk: 0xa9a294, straw: 0x9a8a60, hiltRed: 0x6d6a60, tie: 0xb9ae95 },
    bloodiron: { kimono: 0x1f1e21, kimonoDk: 0x141416, stitch: 0x3a393c, cape: 0x6e1f1c, cord: 0x8a4a2a, hakama: 0x2c2224, wrap: 0x8f8272, wrapDk: 0x7a6f61, straw: 0x8f7a48, hiltRed: 0x8a4a2a, tie: 0x8a4a2a },
    moss:      { kimono: 0x3f5a3a, kimonoDk: 0x2f4530, stitch: 0x5f7a5a, cape: 0xa8782c, cord: 0x8a3a2a, hakama: 0x2a2e2a, wrap: 0xd8cdb4, wrapDk: 0xbfb49c, straw: 0xa08a58, hiltRed: 0x8a3a2a, tie: 0xa8782c },
  },
  ashigaru: {
    blacklacquer: { plate: 0x1c1b1c, lace: 0xa8332b, kimono: 0x4b566b, kimonoDk: 0x3a4356, stitch: 0x6b7590, hakama: 0x2a2b2f, wrap: 0xbdb8ad, wrapDk: 0xa39d91, straw: 0xa08a58, hat: 0x1c1b1c, crest: 0x9a7a3a, cord: 0xa8332b, hiltRed: 0x8a2e28, tie: 0xa8332b },
    crimson:      { plate: 0x7e2120, lace: 0x1e1d1f, kimono: 0x5a5b5e, kimonoDk: 0x46474a, stitch: 0x76777a, hakama: 0x232326, wrap: 0xbdb8ad, wrapDk: 0xa39d91, straw: 0xa08a58, hat: 0x7e2120, crest: 0xb8a060, cord: 0x1e1d1f, hiltRed: 0x7e2120, tie: 0x1e1d1f },
    bronze:       { plate: 0x7a5a2c, lace: 0x2f4a30, kimono: 0x5a4636, kimonoDk: 0x46362a, stitch: 0x7a6650, hakama: 0x2a2624, wrap: 0xb8ad96, wrapDk: 0x9c927e, straw: 0xa08a58, hat: 0x7a5a2c, crest: 0x2f4a30, cord: 0x2f4a30, hiltRed: 0x5a3a20, tie: 0x2f4a30 },
    icewhite:     { plate: 0xcfcdc6, lace: 0x6f8fb0, kimono: 0x6f7d90, kimonoDk: 0x586578, stitch: 0x8c9aac, hakama: 0x2c3038, wrap: 0xd0ccc2, wrapDk: 0xb4b0a6, straw: 0xb09a68, hat: 0xcfcdc6, crest: 0x6f8fb0, cord: 0x6f8fb0, hiltRed: 0x4a5f78, tie: 0x6f8fb0 },
  },
  street: {
    nightorange: { jacket: 0x25272c, rib: 0x33353a, lining: 0xb8571f, kimono: 0x4b566b, kimonoDk: 0x3a4356, stitch: 0x6b7590, hakama: 0x34363a, shoe: 0x1e1f23, sole: 0xbdb8ad, accent: 0xb8571f, bag: 0x6a6656, strap: 0x4a4a4c, mask: 0x3a3c40, cord: 0xb8571f, glove: 0x2a2b2f, tie: 0xb8571f },
    mono:        { jacket: 0xc9c6bf, rib: 0x1e1f23, lining: 0x8a8a86, kimono: 0x1f1f22, kimonoDk: 0x141415, stitch: 0x3a3a3e, hakama: 0x3a3a3e, shoe: 0xc9c6bf, sole: 0x1e1f23, accent: 0x1e1f23, bag: 0x8a8a86, strap: 0x1e1f23, mask: 0xc9c6bf, cord: 0x8a8a86, glove: 0x1e1f23, tie: 0x8a8a86 },
    acid:        { jacket: 0x2a2c2e, rib: 0x1a1b1d, lining: 0x9ab818, kimono: 0x1f1f22, kimonoDk: 0x141415, stitch: 0x3a3a3e, hakama: 0x26272b, shoe: 0x2a2c2e, sole: 0x9ab818, accent: 0x9ab818, bag: 0x1a1b1d, strap: 0x9ab818, mask: 0x3a3c3e, cord: 0x9ab818, glove: 0x9ab818, tie: 0x9ab818 },
    cobalt:      { jacket: 0x2a4a9a, rib: 0x1f2f5a, lining: 0xd8cdb4, kimono: 0xd8cdb4, kimonoDk: 0xb8ad95, stitch: 0xc8bea6, hakama: 0x1e1f23, shoe: 0xd0ccc2, sole: 0xbdb8ad, accent: 0x2a4a9a, bag: 0x1f2f5a, strap: 0x2a2b30, mask: 0x2a4a9a, cord: 0x2a4a9a, glove: 0xd8cdb4, tie: 0x2a4a9a },
  },
};

export function build(THREE, opts = {}) {
  const O = OUTFITS.find((o) => o.id === (opts && opts.outfit)) || OUTFITS[0];
  const OI = OUTFITS.indexOf(O);
  const P = O.palettes.find((p) => p.id === (opts && opts.palette)) || O.palettes[0];
  const C = COLOURS[O.id][P.id];
  const col = (k, d) => (C[k] !== undefined ? C[k] : d);

  const g = new THREE.Group();
  const M = (color, name, roughness = 0.88, metalness = 0, extra) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness, ...(extra || {}) });
    if (name) m.name = name;
    return m;
  };
  // fixed identity materials
  const skin = M(0xb68d6a, undefined, 0.65);
  const lipM = M(0x9c6656, undefined, 0.6);
  const mouthM = M(0x3a1e18, undefined, 0.6);
  const eyeW = M(0xcbc6bb, undefined, 0.45);
  const irisM = M(0x3a2418, undefined, 0.35);
  const pupilM = M(0x0a0806, undefined, 0.3);
  const hairM = M(0x15110f, 'fabric', 0.8);
  const stubble = M(0x6e5a4a, undefined, 0.72);
  const brass = M(0x9a7a3a, 'metal', 0.45, 0.6);
  const steel = M(0x7a7f84, 'metal', 0.4, 0.7);
  const sayaM = M(0x1e1a19, undefined, 0.35);
  const hiltM = M(0x2b2426, 'fabric', 0.85);
  // palette materials
  const kimono = M(col('kimono', 0x4b566b), 'fabric', 0.9);
  const kimonoDk = M(col('kimonoDk', 0x3a4356), 'fabric', 0.92);
  const stitchM = M(col('stitch', 0x6b7590), 'fabric', 0.9);
  const capeM = M(col('cape', 0x96382f), 'fabric', 0.92, 0, { side: THREE.DoubleSide });
  const cordM = M(col('cord', 0xa8332b), 'fabric', 0.85);
  const tieM = M(col('tie', 0xa8332b), 'fabric', 0.85);
  const hakama = M(col('hakama', 0x2a2b2f), 'fabric', 0.92);
  const wrapM = M(col('wrap', 0xbdb8ad), 'fabric', 0.85);
  const wrapDk = M(col('wrapDk', 0xa39d91), 'fabric', 0.88);
  const straw = M(col('straw', 0xa08a58), 'fabric', 0.95);
  const hiltRed = M(col('hiltRed', 0x8a2e28), 'fabric', 0.85);
  const plateM = M(col('plate', 0x1c1b1c), 'metal', 0.35, 0.25);
  const laceM = M(col('lace', 0xa8332b), 'fabric', 0.85);
  const hatM = M(col('hat', 0x1c1b1c), 'metal', 0.4, 0.2, { side: THREE.DoubleSide });
  const crestM = M(col('crest', 0x9a7a3a), 'metal', 0.45, 0.6);
  const jacketM = M(col('jacket', 0x1e1f23), 'fabric', 0.7, 0, { side: THREE.DoubleSide });
  const ribM = M(col('rib', 0x2a2b30), 'fabric', 0.95);
  const liningM = M(col('lining', 0xb8571f), 'fabric', 0.85, 0, { side: THREE.DoubleSide });
  const shoeM = M(col('shoe', 0x1e1f23), 'fabric', 0.7);
  const soleM = M(col('sole', 0xbdb8ad), undefined, 0.7);
  const accentM = M(col('accent', 0xb8571f), 'fabric', 0.8);
  const bagM = M(col('bag', 0x3a3b3d), 'fabric', 0.92);
  const strapM = M(col('strap', 0x2c2c2e), 'fabric', 0.85);
  const maskM = M(col('mask', 0x1a1a1c), 'fabric', 0.9);
  const gloveM = M(col('glove', 0x1e1f23), 'fabric', 0.85);

  /* ---------------------------------------------------------------- helpers */
  const PI = Math.PI;
  const wrap = (a) => { while (a > PI) a -= 2 * PI; while (a < -PI) a += 2 * PI; return a; };
  const sstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const frac = (x) => x - Math.floor(x);
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
    f.P = P; f.bulges = bulges;
    return f;
  }
  const lifted = (S, d, extra) => surfOf({ sq: extra && extra.sq, prof: S.P.map((q) => [q[0], q[1] + d, q[2] + d, q[3] + d, q[4], q[5]]), bulges: S.bulges, ripple: extra && extra.ripple });
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
    const Pp = new Float32Array(n * 3), N = new Float32Array(n * 3), U = new Float32Array(n * 2);
    let o = 0;
    for (const q of parts) {
      const c = q.attributes.position.count;
      Pp.set(q.attributes.position.array.subarray(0, c * 3), o * 3);
      N.set(q.attributes.normal.array.subarray(0, c * 3), o * 3);
      if (q.attributes.uv) U.set(q.attributes.uv.array.subarray(0, c * 2), o * 2);
      o += c;
    }
    const out = new THREE.BufferGeometry();
    out.setAttribute('position', new THREE.BufferAttribute(Pp, 3));
    out.setAttribute('normal', new THREE.BufferAttribute(N, 3));
    out.setAttribute('uv', new THREE.BufferAttribute(U, 2));
    return out;
  }
  const add = (parent, mat, ...geos) => { if (!geos.length) return null; const m = new THREE.Mesh(geos.length > 1 ? merge(geos) : geos[0], mat); parent.add(m); return m; };
  const J = (x, y, z, parent) => { const o = new THREE.Object3D(); o.position.set(x, y, z); parent.add(o); return o; };
  const V = (a) => new THREE.Vector3(a[0], a[1], a[2]);
  const curveOf = (pts, closed = false) => new THREE.CatmullRomCurve3(pts.map(V), closed);
  const seam = (pts, r = 0.003, seg = 16, closed = false, radial = 5) => new THREE.TubeGeometry(curveOf(pts, closed), seg, r, radial, closed);
  // braided cord: a TubeGeometry whose rings swell and shrink along the run
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
  // tapered tube along a curve: radius = rFn(t)
  function taper(pts, rFn, seg = 10, radial = 6, closed = false) {
    const cv = curveOf(pts, closed), geo = new THREE.TubeGeometry(cv, seg, 1, radial, closed), p = geo.attributes.position, c = new THREE.Vector3();
    const per = radial + 1, rings = seg + 1;
    for (let i = 0; i < p.count; i++) {
      const ring = Math.floor(i / per), t = Math.min(1, ring / (rings - 1)); cv.getPointAt(t, c);
      const s = rFn(t);
      p.setXYZ(i, c.x + (p.getX(i) - c.x) * s, c.y + (p.getY(i) - c.y) * s, c.z + (p.getZ(i) - c.z) * s);
    }
    geo.computeVertexNormals(); return geo;
  }
  const arc = (r0, r1) => (t) => r0 + (r1 - r0) * Math.sin(PI * t);
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
  // a long strip that follows a surface (X across in metres, Y along from (y0,a0) to (y1,a1))
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
  // a panel on a surface spanning an angle range and a height range; lift(t,u) and ripple(t,u) in metres
  function panel(S, y0, y1, a0, a1, lift, sa = 4, sy = 6, th = 0.004, ripple) {
    const geo = new THREE.BoxGeometry(1, 1, th, sa, sy, 1), p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const u = p.getX(i) + 0.5, t = p.getY(i) + 0.5, y = y0 + (y1 - y0) * t, a = a0 + (a1 - a0) * u;
      const f = frameAt(S, y, a), l = (typeof lift === 'function' ? lift(t, u) : lift) + (ripple ? ripple(t, u) : 0);
      const q = f.p.addScaledVector(f.n, p.getZ(i) + l);
      p.setXYZ(i, q.x, q.y, q.z);
    }
    geo.computeVertexNormals(); return geo;
  }
  // bend a +Y tube (y in 0..L) along a curve: x -> curve normal, z -> binormal; ref fixes the frame
  function bend(geo, pts, L, ref) {
    const cv = curveOf(pts), p = geo.attributes.position, Pp = new THREE.Vector3(), T = new THREE.Vector3(), N = new THREE.Vector3(), B = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
    const R = ref ? V(ref) : null;
    for (let i = 0; i < p.count; i++) {
      const t = Math.min(1, Math.max(0, p.getY(i) / L));
      cv.getPointAt(t, Pp); cv.getTangentAt(t, T);
      const rf = R || (Math.abs(T.y) > 0.9 ? new THREE.Vector3(1, 0, 0) : up);
      N.crossVectors(rf, T).normalize(); B.crossVectors(T, N).normalize();
      Pp.addScaledVector(N, p.getX(i)).addScaledVector(B, p.getZ(i));
      p.setXYZ(i, Pp.x, Pp.y, Pp.z);
    }
    geo.computeVertexNormals(); return weldNormals(geo);
  }
  // aim a +Y-built geometry (base at y=0) from point a to point b
  function aim(geo, a, b) {
    const d = V(b).sub(V(a)), q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize());
    geo.applyQuaternion(q); geo.translate(a[0], a[1], a[2]); return geo;
  }
  const ringPts = (S, yy, lift, n = 26, yoff = 0) => { const pts = []; for (let i = 0; i < n; i++) { const a = (i / n) * 2 * PI, f = frameAt(S, yy, a); const q = f.p.addScaledVector(f.n, lift); pts.push([q.x, q.y + yoff, q.z]); } return pts; };

  const root = new THREE.Object3D(); g.add(root);

  /* ---------------------------------------------------------------- torso surface (chest-local y; world = 1.08 + y) */
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
    // cloth: hanging folds on the skirt, waist gather under the cord, blousing above it
    ripple: (y, a) => {
      const skirt = sstep(-0.40, -0.30, y) * (1 - sstep(-0.24, -0.20, y));
      const blouse = sstep(-0.19, -0.16, y) * (1 - sstep(-0.10, -0.05, y));
      return 0.0045 * (skirt + 0.3 * sstep(-0.30, -0.24, y) * (1 - sstep(-0.24, -0.2, y))) * Math.sin(a * 9 + 0.8 + y * 6)
        + 0.0035 * blouse * Math.sin(y * 150 + Math.sin(a * 2) * 1.5 + a * 2.5);
    },
  });

  /* ---------------------------------------------------------------- hips (root joint, world 0.85) */
  const hips = J(0, 0.85, 0, root);
  const HP = 0.23;   // chest-local -> hips-local
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

  // RED BRAIDED WAIST CORD: rings, knot, hanging ends with tufts. lift grows for the armour outfit (over the cuirass)
  function waistCord(lift, withBell) {
    const gs = [braid(ringPts(torsoS, -0.190, lift, 22, HP), 0.0085, 20, true), braid(ringPts(torsoS, -0.207, lift - 0.0005, 22, HP), 0.0085, 20, true), braid(ringPts(torsoS, -0.222, lift, 22, HP), 0.008, 20, true)];
    const kc = torsoS(-0.20, 0.38);
    const kx = kc[0], ky = kc[1] + HP, kz = kc[2] + 0.006 + lift;
    gs.push(braid([[kx - 0.03, ky + 0.012, kz - 0.002], [kx - 0.005, ky + 0.024, kz + 0.008], [kx + 0.025, ky + 0.014, kz + 0.012], [kx + 0.03, ky - 0.012, kz + 0.008], [kx, ky - 0.02, kz + 0.012], [kx - 0.03, ky - 0.006, kz + 0.004]], 0.008, 16, true));
    gs.push(braid([[kx - 0.02, ky + 0.004, kz + 0.012], [kx + 0.01, ky, kz + 0.02], [kx + 0.03, ky - 0.03, kz + 0.02], [kx + 0.045, ky - 0.075, kz + 0.006], [kx + 0.048, ky - 0.120, kz - 0.008]], 0.0065, 14));
    gs.push(braid([[kx + 0.005, ky - 0.006, kz + 0.012], [kx - 0.015, ky - 0.03, kz + 0.02], [kx - 0.03, ky - 0.065, kz + 0.012], [kx - 0.034, ky - 0.105, kz - 0.002]], 0.0065, 12));
    const tuft = (x, y, z) => place(tube({ prof: [[0, 0.006], [0.012, 0.012], [0.03, 0.013], [0.042, 0.009]], y0: 0, y1: 0.044, capB: 0.006, capT: 0.008, radial: 8, rings: 5, ripple: (yy, a) => 0.0015 * Math.cos(a * 8) }), x, y, z);
    gs.push(tuft(kx + 0.049, ky - 0.162, kz - 0.010), tuft(kx - 0.036, ky - 0.148, kz - 0.004));
    // a whipped binding where the tuft meets the cord (a cord with twist has a collar)
    gs.push(place(new THREE.TorusGeometry(0.0075, 0.0022, 5, 10), kx + 0.049, ky - 0.120, kz - 0.010, PI / 2, 0, 0), place(new THREE.TorusGeometry(0.0075, 0.0022, 5, 10), kx - 0.036, ky - 0.106, kz - 0.004, PI / 2, 0, 0));
    if (withBell) gs.push(seam([[0.152 + lift, HP - 0.205, 0.045], [0.185, HP - 0.245, 0.055], [0.205, HP - 0.30, 0.058]], 0.003, 6));
    add(hips, cordM, ...gs);
    if (withBell) { // BRASS BELL (suzu): lathe body, crown loop, lip ring, the slit across the bottom, pellet inside
      const pts = [[0.0, 0], [0.024, 0.0], [0.031, 0.006], [0.031, 0.014], [0.028, 0.026], [0.021, 0.040], [0.012, 0.050], [0.004, 0.056], [0, 0.058]].map((p) => new THREE.Vector2(p[0], p[1]));
      const bell = new THREE.LatheGeometry(pts, 16);
      const BX = 0.205, BY = HP - 0.360, BZ = 0.058;
      bell.translate(BX, BY, BZ);
      const loop = new THREE.TorusGeometry(0.008, 0.0025, 5, 10); place(loop, BX, BY + 0.062, BZ, 0, PI / 2, 0);
      const lip = new THREE.TorusGeometry(0.027, 0.004, 5, 16); place(lip, BX, BY + 0.003, BZ, PI / 2, 0, 0);
      add(hips, brass, bell, loop, lip);
      const slit = new THREE.BoxGeometry(0.044, 0.006, 0.005); place(slit, BX, BY + 0.004, BZ, 0, 0.3, 0);
      const slitEnd = [place(new THREE.CylinderGeometry(0.004, 0.004, 0.005, 6), BX + 0.021, BY + 0.004, BZ - 0.0065), place(new THREE.CylinderGeometry(0.004, 0.004, 0.005, 6), BX - 0.021, BY + 0.004, BZ + 0.0065)];
      add(hips, mouthM, slit, ...slitEnd);
    }
  }

  /* ---------------------------------------------------------------- spine (world 0.93) - kimono skirt */
  const spine = J(0, 0.08, 0, hips);
  const SP = 0.15;   // chest-local -> spine-local
  const skirtHem = OI === 2 ? -0.30 : -0.392;
  add(spine, kimono, place(tube({ surf: torsoS, y0: skirtHem, y1: 0.06, capB: 0.02, capT: 0.015, radial: 24, rings: 16,
    ymap: (y, a) => { const f = 1 - sstep(0.72, 0.95, Math.abs(a)); return Math.max(y, -0.40 + f * 0.11, skirtHem); },
    post: (x, y, z) => { const k = 1 - 0.022 * sstep(0.0, 0.045, y); return [x * k, y, z * k]; } }), 0, SP, 0));
  { // rolled hem edge (thickness), a stitched line above it, the front overlap edge, side seams
    const hy = skirtHem - 0.004;
    const hem = []; for (let i = 0; i < 30; i++) { const a = PI - 2.35 + (i / 29) * 4.7; const q = torsoS(hy, a); hem.push([q[0] * 1.01, q[1] + SP, q[2] * 1.01]); }
    const st = []; for (let i = 0; i < 30; i++) { const a = PI - 2.35 + (i / 29) * 4.7; const q = torsoS(hy + 0.022, a); st.push([q[0] * 1.012, q[1] + SP, q[2] * 1.012]); }
    add(spine, kimonoDk, seam(hem, 0.0045, 30, false, 4), place(strip(torsoS, 0.030, -0.055, -0.19, 0.095, 0.11, 0.0025, 4), 0, SP, 0));
    const sides = [];
    for (const s of [-1, 1]) { const pts = []; for (let i = 0; i <= 6; i++) { const y = hy + 0.02 + (i / 6) * (0.03 - hy); const q = torsoS(y, s * PI / 2); pts.push([q[0] * 1.012, q[1] + SP, q[2]]); } sides.push(seam(pts, 0.0015, 6, false, 3)); }
    add(spine, stitchM, seam(st, 0.0015, 30, false, 3), ...sides);
  }

  /* ---------------------------------------------------------------- chest (world 1.08) */
  const chest = J(0, 0.15, 0, spine);
  add(chest, skin, tube({ surf: torsoS, y0: 0.0, y1: 0.262, capB: 0.012, capT: 0.014, radial: 16, rings: 8, post: (x, y, z) => [x * 0.985, y, z * 0.985] }));
  const vtop = (a) => 0.02 + (Math.min(0.56, Math.abs(a)) / 0.56) * 0.235;
  add(chest, kimono, tube({ surf: torsoS, y0: -0.06, y1: 0.262, capB: 0.012, capT: 0.014, radial: 24, rings: 15,
    ymap: (y, a) => (Math.abs(a) < 0.56 ? Math.min(y, vtop(a)) : y),
    post: (x, y, z) => { const k = 1 - 0.022 * (1 - sstep(-0.05, 0.0, y)); return [x * k, y, z * k]; } }));
  { // collar bands with real thickness (left over right), the left continuing down over the crossing; shoulder seams
    const gs = [];
    gs.push(strip(torsoS, 0.034, 0.262, 0.030, 0.56, 0.035, 0.0035, 8, 0.004));
    gs.push(strip(torsoS, 0.034, 0.262, 0.045, -0.56, -0.03, 0.0018, 8, 0.004));
    gs.push(strip(torsoS, 0.030, 0.035, -0.06, 0.06, 0.095, 0.0035, 4, 0.004));
    add(chest, kimonoDk, ...gs);
    if (OI !== 1) { const sh = []; for (const s of [-1, 1]) { const pts = []; for (let i = 0; i <= 5; i++) { const a = s * (0.62 + (i / 5) * 0.95); const q = torsoS(0.236 - (i / 5) * 0.03, a); pts.push([q[0], q[1], q[2]]); } sh.push(seam(pts, 0.0016, 6, false, 3)); } add(chest, stitchM, ...sh); }
  }

  /* ---------------------------------------------------------------- KATANA builder (parent-local TIP -> TSUBA) */
  function katana(parent, TIP, TSUBA) {
    const dir = V(TSUBA).sub(V(TIP)); const L = dir.length();
    const sayaProf = [[0, 0.011, 0.014], [0.03, 0.013, 0.017], [L - 0.05, 0.014, 0.019], [L, 0.0145, 0.0195]];
    const saya = tube({ prof: sayaProf.map((p) => [p[0], p[1], p[2], p[2], 0.012 * ((p[0] / L) ** 2), 0]), y0: 0, y1: L, capB: 0.012, capT: 0.004, radial: 12, rings: 10 });
    add(parent, sayaM, aim(saya, TIP, TSUBA));
    // chape (kojiri) with a ridge, mouth (koiguchi) collar with a lip, the tsuba with a rim and hitsu-ana notches
    const kojiri = tube({ prof: [[0, 0.0115, 0.0145], [0.035, 0.0135, 0.0175]], y0: 0, y1: 0.036, capB: 0.012, capT: 0.003, radial: 12, rings: 4, post: (x, y, z) => [x * 1.06, y, z * 1.06], ripple: (y, a) => 0.0008 * Math.cos(y * 500) });
    const koi = new THREE.CylinderGeometry(0.0175, 0.0175, 0.012, 12); koi.scale(1, 1, 1.35); koi.translate(0, L - 0.006, 0.012 * 0.98);
    const koiLip = new THREE.TorusGeometry(0.0165, 0.0025, 5, 12); koiLip.scale(1, 1.35, 1); koiLip.rotateX(PI / 2); koiLip.translate(0, L + 0.0005, 0.012 * 0.98);
    const tsuba = new THREE.CylinderGeometry(0.037, 0.037, 0.0045, 16); tsuba.translate(0, L + 0.004, 0.012);
    const tsubaRim = new THREE.TorusGeometry(0.036, 0.0025, 5, 16); tsubaRim.rotateX(PI / 2); tsubaRim.translate(0, L + 0.004, 0.012);
    add(parent, brass, aim(kojiri, TIP, TSUBA), aim(koi, TIP, TSUBA), aim(koiLip, TIP, TSUBA), aim(tsuba, TIP, TSUBA), aim(tsubaRim, TIP, TSUBA));
    const sageo = []; for (let i = 0; i <= 14; i++) { const t = i / 14, a = t * 2 * PI * 2.5; sageo.push([0.0165 * Math.sin(a), L - 0.10 + t * 0.045, 0.012 + 0.0205 * Math.cos(a)]); }
    add(parent, cordM, aim(braid(sageo, 0.004, 30, false, 0.2), TIP, TSUBA));
    const HL = 0.245;
    const tsuka = tube({ prof: [[0, 0.0135, 0.017], [0.10, 0.0135, 0.018], [HL, 0.0125, 0.0165]], y0: 0, y1: HL, capB: 0.004, capT: 0.008, radial: 10, rings: 12,
      ripple: (y, a) => 0.0018 * Math.cos(a * 2 + y * 150) + 0.0012 * Math.cos(a * 2 - y * 150 + 1) });
    tsuka.translate(0, L + 0.006, 0.012);
    add(parent, hiltM, aim(tsuka, TIP, TSUBA));
    const reds = []; for (let i = 0; i < 5; i++) { for (const s of [-1, 1]) { reds.push(place(ell(0.006, 0.011, 0.004, 5, 3), s * 0.0125, L + 0.030 + i * 0.045, 0.012 + 0.006 * (i % 2 ? 1 : -1))); } }
    add(parent, hiltRed, aim(merge(reds), TIP, TSUBA));
    const kashira = new THREE.CylinderGeometry(0.0125, 0.014, 0.010, 10); kashira.scale(1, 1, 1.3); kashira.translate(0, L + HL + 0.008, 0.012);
    add(parent, brass, aim(kashira, TIP, TSUBA));
    return { L, HL };
  }

  /* ================================================================ OUTFIT 1: THE LAST RONIN (torso parts) */
  if (OI === 0) {
    waistCord(0.006, true);
    // HAORI CAPE (on the chest, flares behind, torn hem)
    const capeS = surfOf({
      sq: 0.95,
      prof: [
        [-0.050, 0.272, 0.160, 0.185, 0, -0.014], [0.020, 0.268, 0.156, 0.182, 0, -0.014], [0.090, 0.256, 0.142, 0.172, 0, -0.012],
        [0.150, 0.244, 0.126, 0.156, 0, -0.010], [0.200, 0.232, 0.112, 0.138, 0, -0.008], [0.232, 0.218, 0.100, 0.120, 0, -0.008],
        [0.248, 0.160, 0.088, 0.104, 0, -0.010], [0.258, 0.100, 0.076, 0.090, 0, -0.012], [0.266, 0.082, 0.070, 0.082, 0, -0.014],
      ],
      bulges: [{ y: 0.12, h: 0.09, a: PI, w: 0.35, amp: 0.012 }, { y: 0.09, h: 0.06, a: PI - 0.9, w: 0.3, amp: 0.008 }, { y: 0.09, h: 0.06, a: PI + 0.9, w: 0.3, amp: 0.008 }],
      ripple: (y, a) => (0.006 * Math.sin(a * 7 + 0.5 + y * 12) + 0.0035 * Math.sin(a * 15 + y * 40 + 1.3)) * (1 - sstep(0.20, 0.25, y)),
    });
    const capeHem = (a) => { const b = Math.abs(a); const base = 0.05 - 0.09 * Math.exp(-(((b - 1.45) / 0.55) ** 2)) + 0.03 * sstep(2.2, 3.0, b) - 0.02 * (1 - sstep(0.55, 0.9, b)); return base + 0.020 * Math.sin(a * 13 + 0.7) + 0.013 * Math.sin(a * 29 + 2.1) + 0.008 * Math.sin(a * 47 + 0.3); };
    const capeOpen = (y) => 0.58 * sstep(0.258, 0.225, y);
    add(chest, capeM, tube({ surf: capeS, y0: -0.05, y1: 0.266, capB: 0.004, capT: 0.008, radial: 32, rings: 18,
      ymap: (y, a) => Math.max(y, capeHem(a)),
      amap: (a, y) => { const o = capeOpen(y); return Math.abs(a) < o ? Math.sign(a || 1) * o : a; } }));
    { // frayed threads hanging off the torn hem, a shoulder seam ridge, patches
      const th = [];
      for (let i = 0; i < 14; i++) { const a = -2.9 + i * 0.42 + 0.1 * Math.sin(i * 7); const y = capeHem(a) + 0.004; const q = capeS(y, a); const q2 = capeS(y - 0.02 - 0.01 * (i % 3), a + 0.03); th.push(seam([[q[0], q[1], q[2]], [q2[0] * 1.01, q2[1], q2[2] * 1.01]], 0.0016, 3)); }
      for (const s of [-1, 1]) { const pts = []; for (let i = 0; i <= 5; i++) { const q = capeS(0.244 - (i / 5) * 0.06, s * (0.7 + (i / 5) * 1.0)); pts.push([q[0] * 1.01, q[1] + 0.002, q[2] * 1.01]); } th.push(seam(pts, 0.002, 8)); }
      add(chest, capeM, ...th);
    }
    { // red braided cord round the cape's neck and down both front edges, tied off in a loop + tassel on the left chest
      const gs = [];
      const neckPts = []; for (let i = 0; i <= 20; i++) { const a = -PI + (i / 20) * 2 * PI * 0.99; const q = capeS(0.258, a); neckPts.push([q[0] * 1.02, q[1] + 0.004, q[2] * 1.02 - 0.002]); }
      gs.push(braid(neckPts, 0.0075, 26, false, 0.25));
      for (const s of [-1, 1]) {
        const pts = []; for (let i = 0; i <= 8; i++) { const y = 0.252 - (i / 8) * 0.242; const q = capeS(y, s * (capeOpen(y) + 0.02)); pts.push([q[0], q[1], q[2] + 0.006]); }
        gs.push(braid(pts, 0.0075, 12, false, 0.25));
      }
      const t0 = capeS(0.11, 0.62);
      gs.push(braid([[t0[0] + 0.01, t0[1] + 0.02, t0[2] + 0.01], [t0[0] - 0.03, t0[1] - 0.005, t0[2] + 0.02], [t0[0] - 0.015, t0[1] - 0.05, t0[2] + 0.024], [t0[0] + 0.02, t0[1] - 0.045, t0[2] + 0.02], [t0[0] + 0.02, t0[1] - 0.005, t0[2] + 0.016]], 0.007, 12, true, 0.25));
      gs.push(braid([[t0[0] - 0.005, t0[1] - 0.045, t0[2] + 0.022], [t0[0] - 0.006, t0[1] - 0.08, t0[2] + 0.024], [t0[0] - 0.004, t0[1] - 0.11, t0[2] + 0.02]], 0.005, 8, false, 0.2));
      gs.push(place(new THREE.TorusGeometry(0.0075, 0.0022, 5, 10), t0[0] - 0.004, t0[1] - 0.112, t0[2] + 0.02, PI / 2, 0, 0));
      gs.push(place(tube({ prof: [[0, 0.006], [0.012, 0.013], [0.03, 0.014], [0.04, 0.009]], y0: 0, y1: 0.042, capB: 0.006, capT: 0.008, radial: 8, rings: 5, ripple: (y, a) => 0.0015 * Math.cos(a * 8) }), t0[0] - 0.004, t0[1] - 0.152, t0[2] + 0.018));
      add(chest, cordM, ...gs);
    }
    katana(chest, [0.195, -0.415, -0.185], [-0.115, 0.255, -0.148]);
  }

  /* ================================================================ OUTFIT 2: ASHIGARU (torso parts) */
  if (OI === 1) {
    // DO-MARU: lacquered cuirass of horizontal lames round the torso, laced with vertical odoshi rows
    const lame = (y) => { const f = frac((y + 0.205) / 0.034); return 0.0065 * (f < 0.12 ? f / 0.12 : 1 - (f - 0.12) / 0.88) - 0.003; };
    const cuirS = lifted(torsoS, 0.014, { sq: 0.9, ripple: (y, a) => lame(y) });
    const cuirTop = (a) => 0.196 - 0.075 * Math.exp(-(((Math.abs(a) - PI / 2) / 0.5) ** 2));
    add(chest, plateM, tube({ surf: cuirS, y0: -0.205, y1: 0.20, capB: 0.004, capT: 0.004, radial: 24, rings: 28, ymap: (y, a) => Math.min(y, cuirTop(a)) }));
    { // top edge binding, lacing rows, a rim at the bottom
      const gs = [], ls = [];
      const top = []; for (let i = 0; i <= 28; i++) { const a = -PI + (i / 28) * 2 * PI; const q = cuirS(cuirTop(a), a); top.push([q[0] * 1.0, q[1] + 0.002, q[2]]); }
      gs.push(seam(top, 0.004, 28, true, 4));
      const bot = ringPts(cuirS, -0.205, 0.001, 28); gs.push(seam(bot, 0.004, 28, true, 4));
      for (let k = 0; k < 8; k++) { const a = -PI + (k + 0.5) * (2 * PI / 8); ls.push(strip(cuirS, 0.010, -0.20, cuirTop(a) - 0.01, a, a, 0.004, 5, 0.0025)); }
      add(chest, laceM, ...gs, ...ls);
    }
    // KUSAZURI tassets: laced plate panels hanging from the waist, flaring at the bottom so a swinging thigh clears them
    const tasRip = (t, u) => { const f = frac(t * 4); return 0.003 * (f < 0.2 ? f / 0.2 : 1 - (f - 0.2) / 0.8) - 0.0015; };
    const tasLift = (t) => 0.012 + 0.030 * t;
    function tasset(parent, a0, a1, xoff = 0, yoff = 0) {
      const geo = panel(torsoS, -0.20, -0.335, a0, a1, tasLift, 2, 8, 0.004, tasRip);
      const laces = [];
      for (let k = 0; k < 2; k++) { const a = a0 + (a1 - a0) * (0.3 + 0.4 * k); const pts = []; for (let i = 0; i <= 4; i++) { const t = i / 4; const f = frameAt(torsoS, -0.20 - 0.135 * t, a); const q = f.p.addScaledVector(f.n, tasLift(t) + 0.004); pts.push([q.x, q.y, q.z]); } laces.push(seam(pts, 0.0025, 5, false, 3)); }
      geo.translate(xoff, yoff, 0); for (const l of laces) l.translate(xoff, yoff, 0);
      add(parent, plateM, geo); add(parent, laceM, ...laces);
    }
    for (const [a0, a1] of [[0.62, 1.30], [1.42, 2.15], [2.25, 3.05], [-3.05, -2.25], [-2.15, -1.42], [-1.30, -0.62]]) tasset(hips, a0, a1, 0, HP);
    waistCord(0.024, false);
    // sode: small laced shoulder plates (on the shoulder joints, added in arm())
  }

  /* ================================================================ OUTFIT 3: STREET RONIN (torso parts) */
  let jacketS = null;
  if (OI === 2) {
    waistCord(0.006, false);
    // BOMBER JACKET on the chest: looser than the kimono, open front, ribbed hem and collar, hood mass behind the neck
    jacketS = lifted(torsoS, 0.018, { sq: 0.9, ripple: (y, a) => 0.004 * Math.sin(a * 5 + y * 25) * (1 - sstep(0.15, 0.22, y)) * sstep(-0.16, -0.1, y) + 0.003 * Math.sin(a * 9 + 1) * sstep(-0.16, -0.05, y) * (1 - sstep(0.0, 0.08, y)) });
    const jOpen = (y) => 0.36 + 0.10 * sstep(0.05, 0.22, y);
    add(chest, jacketM, tube({ surf: jacketS, y0: -0.165, y1: 0.236, capB: 0.004, capT: 0.006, radial: 32, rings: 18,
      amap: (a, y) => { const o = jOpen(y); return Math.abs(a) < o ? Math.sign(a || 1) * o : a; } }));
    { // ribbed hem band and collar band (thick, ridged), zip tapes on the front edges, welt pockets
      const ribS = lifted(torsoS, 0.024, { sq: 0.9, ripple: (y, a) => 0.0015 * Math.cos(a * 70) });
      add(chest, ribM, tube({ surf: ribS, y0: -0.205, y1: -0.160, capB: 0.006, capT: 0.006, radial: 40, rings: 4, amap: (a) => (Math.abs(a) < 0.36 ? Math.sign(a || 1) * 0.36 : a) }),
        tube({ surf: lifted(torsoS, 0.016, { sq: 0.9, ripple: (y, a) => 0.0015 * Math.cos(a * 60) }), y0: 0.228, y1: 0.262, capB: 0.005, capT: 0.005, radial: 36, rings: 4, amap: (a) => (Math.abs(a) < 0.46 ? Math.sign(a || 1) * 0.46 : a) }));
      const zips = [], tapes = [];
      for (const s of [-1, 1]) {
        const pts = []; for (let i = 0; i <= 10; i++) { const y = 0.228 - (i / 10) * 0.42; const q = jacketS(y, s * (jOpen(y) + 0.015)); pts.push([q[0], q[1], q[2] + 0.004]); }
        tapes.push(strip(jacketS, 0.016, 0.228, -0.20, s * (jOpen(0.228) + 0.02), s * (jOpen(-0.2) + 0.02), 0.004, 10, 0.003));
        zips.push(seam(pts, 0.0022, 12));
      }
      add(chest, ribM, ...tapes); add(chest, steel, ...zips, place(plate(0.010, 0.022, 0.003, 0.002, 0.001), jacketS(-0.19, 0.42)[0] - 0.006, -0.198, jacketS(-0.19, 0.42)[2] + 0.008));
      const welts = []; for (const s of [-1, 1]) welts.push(strip(jacketS, 0.012, -0.08, -0.135, s * 0.62, s * 0.95, 0.004, 6, 0.004)); add(chest, ribM, ...welts);
    }
    { // hood down behind the neck: an outer arc and the lining showing inside
      const hood = [[0.085, 0.235, 0.01], [0.075, 0.205, -0.10], [0.0, 0.175, -0.155], [-0.075, 0.205, -0.10], [-0.085, 0.235, 0.01]];
      add(chest, jacketM, taper(hood, (t) => 0.024 + 0.016 * Math.sin(PI * t), 16, 9));
      const lin = [[0.07, 0.245, 0.0], [0.06, 0.225, -0.085], [0.0, 0.205, -0.125], [-0.06, 0.225, -0.085], [-0.07, 0.245, 0.0]];
      add(chest, liningM, taper(lin, (t) => 0.012 + 0.010 * Math.sin(PI * t), 14, 7));
    }
    // the KATANA in a slung cloth bag across the back: bag along the same diagonal as the sword, tied at the top; strap over the chest with a buckle
    {
      const TIP = [0.195, -0.415, -0.185], TSUBA = [-0.115, 0.255, -0.148];
      const d = V(TSUBA).sub(V(TIP)); const L = d.length(); const BL = L + 0.28; const dn = d.clone().normalize();
      const END = [TIP[0] + dn.x * BL, TIP[1] + dn.y * BL, TIP[2] + dn.z * BL];
      const bag = tube({ prof: [[0, 0.022, 0.026], [0.05, 0.028, 0.032], [L - 0.03, 0.030, 0.034], [L + 0.01, 0.042, 0.046], [L + 0.05, 0.034, 0.038], [BL - 0.03, 0.026, 0.028], [BL, 0.016, 0.018]].map((p) => [p[0], p[1], p[2], p[2], 0.012 * ((p[0] / L) ** 2), 0]),
        y0: 0, y1: BL, capB: 0.02, capT: 0.012, radial: 14, rings: 16, ripple: (y, a) => 0.003 * Math.cos(a * 5 + y * 40) + 0.002 * Math.cos(a * 11 - y * 25) });
      add(chest, bagM, aim(bag, TIP, END));
      const tieR = []; for (let i = 0; i <= 12; i++) { const a = (i / 12) * 2 * PI; tieR.push([0.020 * Math.sin(a), BL - 0.03, 0.012 * ((BL - 0.03) / L) ** 2 + 0.022 * Math.cos(a)]); }
      add(chest, cordM, aim(braid(tieR, 0.004, 14, true, 0.2), TIP, END), aim(braid([[0.018, BL - 0.03, 0.03], [0.04, BL - 0.06, 0.05], [0.05, BL - 0.10, 0.045]], 0.0035, 8), TIP, END));
      // strap: from the bag top over the right shoulder, across the chest to the left hip
      add(chest, strapM, strip(jacketS, 0.030, 0.235, -0.16, -0.42, 0.78, 0.008, 14, 0.004));
      const bf = frameAt(jacketS, 0.05, 0.12);
      const buckle = new THREE.TorusGeometry(0.014, 0.003, 4, 4); buckle.rotateZ(PI / 4); buckle.scale(1.1, 0.8, 1);
      const prong = new THREE.CylinderGeometry(0.0018, 0.0018, 0.026, 5);
      add(chest, steel, onFrame(buckle, bf, 0.014), onFrame(prong, bf, 0.014));
    }
  }

  /* ---------------------------------------------------------------- neck / head */
  const neck = J(0, 0.235, -0.008, chest);                          // world 1.315
  add(neck, skin, tube({ prof: [[-0.045, 0.074, 0.050, 0.058, 0, 0.0], [-0.010, 0.050, 0.046, 0.050, 0, 0.002], [0.035, 0.044, 0.044, 0.046, 0, 0.006], [0.090, 0.043, 0.042, 0.046, 0, 0.010]],
    y0: -0.045, y1: 0.095, capB: 0.01, capT: 0.02, radial: 14, rings: 7,
    bulges: [{ y: 0.0, h: 0.05, a: PI - 0.6, w: 0.4, amp: 0.006 }, { y: 0.0, h: 0.05, a: PI + 0.6, w: 0.4, amp: 0.006 }, { y: 0.03, h: 0.03, a: 0, w: 0.25, amp: 0.003 }] }));
  if (OI === 2) { // face mask pulled down round the neck, gathered at the front, ear loops
    add(neck, maskM, tube({ prof: [[-0.040, 0.062, 0.060, 0.058, 0, 0.004], [-0.010, 0.060, 0.060, 0.056, 0, 0.006], [0.020, 0.056, 0.058, 0.052, 0, 0.008]], y0: -0.040, y1: 0.022, capB: 0.004, capT: 0.004, radial: 20, rings: 6,
      ymap: (y, a) => Math.min(y, 0.022 - 0.014 * (1 - sstep(0.4, 1.2, Math.abs(a)))),
      ripple: (y, a) => 0.0025 * Math.cos(a * 12) * (1 - sstep(1.4, 2.2, Math.abs(a))) }));
    const loops = []; for (const s of [-1, 1]) loops.push(seam([[s * 0.056, 0.0, 0.012], [s * 0.066, 0.03, 0.006], [s * 0.070, 0.055, -0.004]], 0.0018, 6)); add(neck, maskM, ...loops);
  }
  const head = J(0, 0.055, 0.008, neck);                            // world 1.37
  const headS = surfOf({
    prof: [
      [-0.045, 0.019, 0.044, 0.018, 0, 0.033],
      [-0.022, 0.039, 0.056, 0.038, 0, 0.022],
      [0.012, 0.058, 0.067, 0.066, 0, 0.008],
      [0.050, 0.072, 0.076, 0.088, 0, 0.002],
      [0.092, 0.075, 0.081, 0.095, 0, 0.0],
      [0.135, 0.069, 0.075, 0.088, 0, -0.002],
      [0.178, 0.045, 0.050, 0.058, 0, -0.004],
    ],
    bulges: [
      { y: 0.084, h: 0.014, a: 0, w: 0.75, amp: 0.0045 },                                                            // brow ridge
      { y: 0.064, h: 0.013, a: 0.40, w: 0.20, amp: -0.0070 }, { y: 0.064, h: 0.013, a: -0.40, w: 0.20, amp: -0.0070 },   // eye sockets
      { y: 0.046, h: 0.022, a: 0.66, w: 0.26, amp: 0.0065 }, { y: 0.046, h: 0.022, a: -0.66, w: 0.26, amp: 0.0065 },   // cheekbones
      { y: 0.004, h: 0.008, a: 0, w: 0.30, amp: -0.003 }, { y: -0.006, h: 0.008, a: 0, w: 0.26, amp: 0.003 },
      { y: 0.03, h: 0.03, a: PI, w: 0.5, amp: -0.004 },
      { y: -0.008, h: 0.022, a: 2.1, w: 0.35, amp: 0.0025 }, { y: -0.008, h: 0.022, a: -2.1, w: 0.35, amp: 0.0025 },   // jaw angles
      { y: -0.038, h: 0.014, a: 0, w: 0.45, amp: 0.004 },                                                             // chin
    ],
  });
  const hs = (y, a, dz = 0) => { const q = headS(y, a); return [q[0], q[1], q[2] + dz]; };
  { // FACE: skull, nose with wings + nostrils, lips + mouth line, eyes with whites / iris / pupil / lids / lashes, brows, ears with helix
    const skinG = [tube({ surf: headS, y0: -0.047, y1: 0.180, capB: 0.02, capT: 0.05, radial: 22, rings: 16 })];
    // nose: bridge tube bent from the brow to a bulbed tip, nostril wings
    skinG.push(bend(tube({ prof: [[0, 0.0070, 0.0068, 0.0068], [0.022, 0.0062, 0.0062, 0.0062], [0.042, 0.0082, 0.0080, 0.0080], [0.056, 0.0105, 0.0100, 0.0100]], y0: 0, y1: 0.058, capB: 0.006, capT: 0.010, radial: 10, rings: 8 }),
      [[0, 0.078, 0.0775], [0, 0.058, 0.0795], [0, 0.040, 0.0840], [0, 0.023, 0.0895]], 0.058));
    for (const s of [-1, 1]) skinG.push(place(ell(0.0066, 0.0052, 0.0064, 8, 6), s * 0.0105, 0.0225, 0.0765, 0, s * 0.3, 0));
    // eyelids (skin) per eye
    const eyeG = { w: [], i: [], p: [], l: [] };
    for (const s of [-1, 1]) {
      const fr = frameAt(headS, 0.064, s * 0.41);
      const ES = 1.12;
      const lidPts = [[-0.0135, -0.0005, 0.0025], [-0.0075, 0.0056, 0.0045], [0, 0.0076, 0.0052], [0.0075, 0.0056, 0.0045], [0.0135, -0.0005, 0.0025]].map((p) => [p[0] * ES, p[1] * ES, p[2]]);
      skinG.push(onFrame(taper(lidPts, arc(0.0012, 0.0027), 10, 6), fr, 0.0));
      skinG.push(onFrame(taper([[-0.0135, -0.0005, 0.0025], [-0.006, -0.0052, 0.004], [0.004, -0.0058, 0.004], [0.0135, -0.0005, 0.0025]].map((p) => [p[0] * ES, p[1] * ES, p[2]]), arc(0.0008, 0.0016), 8, 6), fr, 0.0));
      eyeG.l.push(onFrame(taper(lidPts.map((p) => [p[0], p[1] - 0.0017, p[2] + 0.0012]), arc(0.0004, 0.0008), 10, 5), fr, 0.0));
      eyeG.w.push(onFrame(ell(0.0125 * ES, 0.0068 * ES, 0.0055, 10, 6), fr, 0.0005));
      eyeG.i.push(onFrame(ell(0.0062, 0.0062, 0.0026, 10, 6), fr, 0.0046));
      eyeG.p.push(onFrame(ell(0.0030, 0.0030, 0.0015, 8, 5), fr, 0.0064));
      eyeG.w.push(onFrame(place(ell(0.0011, 0.0011, 0.0008, 6, 4), -0.002, 0.002, 0), fr, 0.0075));
    }
    // ears: concha, helix rim, lobe, antihelix
    for (const s of [-1, 1]) {
      const e = [place(ell(0.0075, 0.021, 0.0135, 8, 6), 0, 0, 0)];
      const rim = [[0.004 * 1, -0.017, 0.006], [0.0065, -0.008, -0.009], [0.0075, 0.005, -0.0125], [0.0075, 0.016, -0.007], [0.006, 0.0215, 0.004], [0.0035, 0.016, 0.011]].map((p) => [p[0] * s, p[1], p[2]]);
      e.push(taper(rim, arc(0.0018, 0.0028), 10, 6));
      e.push(place(ell(0.0052, 0.0062, 0.0055, 6, 5), s * 0.004, -0.0175, 0.003));
      e.push(taper([[s * 0.005, -0.006, -0.004], [s * 0.0055, 0.006, -0.006], [s * 0.005, 0.013, -0.001]], arc(0.0012, 0.0018), 6, 5));
      skinG.push(place(merge(e), s * 0.0745, 0.052, -0.004, 0, s * 0.45, s * -0.10));
    }
    add(head, skin, ...skinG);
    add(head, eyeW, ...eyeG.w); add(head, irisM, ...eyeG.i); add(head, pupilM, ...eyeG.p); add(head, hairM, ...eyeG.l);
    // nostrils, lips, mouth line
    add(head, mouthM, place(ell(0.0028, 0.0018, 0.0035, 6, 4), 0.0055, 0.0165, 0.0815), place(ell(0.0028, 0.0018, 0.0035, 6, 4), -0.0055, 0.0165, 0.0815),
      taper([hs(-0.0035, -0.30, 0.002), hs(-0.005, -0.15, 0.0026), hs(-0.0052, 0, 0.0028), hs(-0.005, 0.15, 0.0026), hs(-0.0035, 0.30, 0.002)], arc(0.0004, 0.0008), 10, 5));
    add(head, lipM,
      taper([hs(-0.0012, -0.31, 0.0012), hs(0.0022, -0.15, 0.0018), hs(0.0004, 0, 0.0018), hs(0.0022, 0.15, 0.0018), hs(-0.0012, 0.31, 0.0012)], arc(0.0008, 0.0021), 12, 6),
      taper([hs(-0.0045, -0.29, 0.0014), hs(-0.0100, -0.12, 0.0024), hs(-0.0108, 0, 0.0026), hs(-0.0100, 0.12, 0.0024), hs(-0.0045, 0.29, 0.0014)], arc(0.0008, 0.0028), 12, 6));
  }
  { // SHAVED SIDES: stubble shell from the nape up to the undercut line
    const stubS = lifted(headS, 0.0024);
    add(head, stubble, tube({ surf: stubS, y0: 0.0, y1: 0.152, capB: 0.006, capT: 0.006, radial: 22, rings: 8,
      ymap: (y, a) => { const b = Math.abs(a); const lo = b < 0.9 ? 0.15 : 0.03 - 0.03 * sstep(0.9, 1.5, b); return Math.min(0.150, Math.max(y, lo)); } }));
  }
  { // TOP HAIR: slicked-back band in layered clumps to a topknot; ponytail with strands; a loose strand; brows
    const hairS = surfOf({
      prof: [[0.090, 0.079, 0.085, 0.100, 0, 0.0], [0.120, 0.080, 0.090, 0.106, 0, 0.0], [0.150, 0.078, 0.092, 0.104, 0, -0.002], [0.180, 0.066, 0.080, 0.088, 0, -0.008], [0.206, 0.040, 0.050, 0.060, 0, -0.016]],
      ripple: (y, a) => 0.0035 * Math.sin(a * 11 + 0.3) * (1 - sstep(0.19, 0.2, y)),
    });
    const hairline = (a) => { const b = Math.abs(a); if (b < 0.4) return 0.110 + 0.02 * (b / 0.4); return 0.130 + 0.016 * sstep(0.4, 1.3, b) - 0.012 * sstep(2.0, 3.1, b); };
    const gs = [tube({ surf: hairS, y0: 0.09, y1: 0.206, capB: 0.006, capT: 0.03, radial: 20, rings: 8, ymap: (y, a) => Math.max(y, hairline(a)) })];
    // layered clumps: tapered strands from the hairline sweeping back to the topknot
    for (let k = 0; k < 7; k++) {
      const a0 = -0.72 + k * 0.24, hl = hairline(a0) + 0.016;
      const p0 = hairS(hl, a0), p1 = hairS(hl + 0.03, a0 * 0.85), p2 = hairS(0.172, a0 * 0.5), p3 = [a0 * 0.012, 0.188, -0.042];
      const lift = (p, l) => { const r = Math.hypot(p[0], p[2]) || 1; return [p[0] + (p[0] / r) * l, p[1] + l * 0.5, p[2] + (p[2] / r) * l]; };
      gs.push(taper([lift(p0, -0.002), lift(p1, 0.003), lift(p2, 0.0035), p3], (t) => 0.0015 + 0.0055 * Math.sin(PI * Math.min(1, 0.15 + t * 0.9)), 9, 5));
    }
    gs.push(place(ell(0.027, 0.022, 0.027, 8, 5), 0, 0.186, -0.045));
    const tailPts = OI === 1 ? [[0, 0.168, -0.055], [0.014, 0.160, -0.105], [0.038, 0.135, -0.155], [0.066, 0.095, -0.19], [0.095, 0.04, -0.21], [0.115, -0.02, -0.215]]
      : [[0, 0.188, -0.05], [0.012, 0.196, -0.10], [0.035, 0.18, -0.15], [0.065, 0.135, -0.19], [0.095, 0.07, -0.21], [0.115, 0.0, -0.215]];
    const TL = 0.40;
    gs.push(bend(tube({ prof: [[0, 0.020, 0.020], [0.05, 0.028, 0.022], [0.16, 0.030, 0.018], [0.28, 0.022, 0.012], [0.40, 0.004, 0.003]], y0: 0, y1: TL, capB: 0.012, capT: 0.006, radial: 9, rings: 14,
      ripple: (y, a) => 0.0022 * Math.cos(a * 5 + y * 20) }), tailPts, TL));
    for (const o of [[0.02, 0.012, 0.6], [-0.018, -0.008, 0.7], [0.006, -0.02, 0.85]]) { // loose strands beside the tail
      const pts = tailPts.slice(1).map((p, i) => [p[0] + o[0] * (0.4 + i * 0.25), p[1] + o[1] * (0.5 + i * 0.3), p[2] + 0.004 * i]);
      pts.push([pts[pts.length - 1][0] + 0.02, pts[pts.length - 1][1] - 0.06 * o[2], pts[pts.length - 1][2] - 0.01]);
      gs.push(taper(pts, (t) => 0.004 * (1 - t) + 0.001, 10, 5));
    }
    const sPts = [[-0.046, 0.118, 0.062], [-0.056, 0.075, 0.085], [-0.06, 0.03, 0.084], [-0.058, -0.01, 0.076]];
    gs.push(bend(tube({ prof: [[0, 0.0065], [0.06, 0.0055], [0.13, 0.0022]], y0: 0, y1: 0.13, capB: 0.005, capT: 0.002, radial: 6, rings: 6 }), sPts, 0.13));
    // brows: thick at the inner end, angled down to the centre (the frown), thinning outward
    for (const s of [-1, 1]) gs.push(taper([hs(0.0775, s * 0.13, 0.002), hs(0.0865, s * 0.30, 0.002), hs(0.0885, s * 0.45, 0.0015), hs(0.0835, s * 0.62, 0.001)], (t) => 0.0038 - 0.0022 * t, 8, 6));
    add(head, hairM, ...gs);
    add(head, tieM, place(new THREE.TorusGeometry(0.0165, 0.0045, 6, 12), 0.004, 0.197, -0.072, 1.15, 0.15, 0));
  }
  if (OI === 1) { // JINGASA: wide shallow cone with a rolled brim, a crest disc on the front, chin cord
    const pts = [[0.064, 0.030], [0.11, 0.024], [0.17, 0.010], [0.225, -0.004], [0.232, 0.0], [0.226, 0.006], [0.19, 0.018], [0.14, 0.036], [0.09, 0.056], [0.045, 0.074], [0.012, 0.086], [0, 0.089]].map((p) => new THREE.Vector2(p[0], p[1]));
    const hat = new THREE.LatheGeometry(pts, 24); hat.translate(0, 0.150, -0.014);
    add(head, hatM, hat);
    add(head, laceM, place(new THREE.TorusGeometry(0.229, 0.004, 5, 24), 0, 0.151, -0.014, PI / 2, 0, 0));
    const crest = new THREE.CylinderGeometry(0.020, 0.020, 0.004, 14); place(crest, 0, 0.205, 0.090, 1.15, 0, 0);
    add(head, crestM, crest, place(new THREE.TorusGeometry(0.011, 0.0025, 5, 12), 0, 0.206, 0.0915, 1.15, 0, 0));
    add(head, cordM, seam([[0.078, 0.150, 0.02], [0.074, 0.08, 0.040], [0.052, 0.0, 0.054], [0.024, -0.046, 0.058], [0, -0.056, 0.056], [-0.024, -0.046, 0.058], [-0.052, 0.0, 0.054], [-0.074, 0.08, 0.040], [-0.078, 0.150, 0.02]], 0.0025, 18, false, 4));
  }

  /* ---------------------------------------------------------------- arms */
  function hand(el, side, palmMat) {
    const inw = -side;
    const HX = inw * 0.002, HY = -0.262, HZ = 0.004;
    // palm: flattened block with a knuckle ridge on the back; fingers hang from its bottom edge and curl toward the palm
    const palm = place(tube({ prof: [[-0.082, 0.0135, 0.036, 0.034], [-0.055, 0.0165, 0.041, 0.039], [-0.025, 0.017, 0.040, 0.038], [0.0, 0.015, 0.033, 0.031], [0.012, 0.014, 0.030, 0.030]],
      y0: -0.084, y1: 0.012, capB: 0.012, capT: 0.012, radial: 12, rings: 9, sq: 0.75,
      bulges: [{ y: -0.074, h: 0.014, a: side * PI / 2, w: 0.9, amp: 0.0035 }, { y: -0.03, h: 0.03, a: -side * PI / 2, w: 0.5, amp: -0.002 }],
      ripple: palmMat === skin ? undefined : (y, a) => 0.0012 * Math.cos(y * 200 + a) }), HX, HY, HZ);
    add(el, palmMat, palm);
    const fg = [];
    const fingers = [[0.025, 0.060, 0.0086], [0.0085, 0.066, 0.0088], [-0.0085, 0.061, 0.0084], [-0.025, 0.048, 0.0075]];
    for (const [z, Lf, r] of fingers) {
      const prof = [[0, r * 1.05], [Lf * 0.3, r * 0.92], [Lf * 0.38, r * 1.0], [Lf * 0.62, r * 0.86], [Lf * 0.7, r * 0.92], [Lf * 0.9, r * 0.78], [Lf, r * 0.62]];
      const geo = tube({ prof, y0: 0, y1: Lf, capB: 0.004, capT: r * 0.7, radial: 8, rings: 9 });
      const pts = [[0, 0, 0], [inw * 0.003, -Lf * 0.42, 0], [inw * 0.012, -Lf * 0.74, 0], [inw * 0.024, -Lf * 0.93, 0]];
      fg.push(place(bend(geo, pts, Lf, [0, 0, 1]), HX, HY - 0.078, HZ + z));
    }
    { // thumb: two segments angled forward and out from the palm's front edge, on a thenar pad
      const Lt = 0.058, r = 0.0098;
      const geo = tube({ prof: [[0, r * 1.1], [Lt * 0.45, r * 0.95], [Lt * 0.55, r * 1.0], [Lt, r * 0.7]], y0: 0, y1: Lt, capB: 0.006, capT: r * 0.7, radial: 8, rings: 7 });
      fg.push(place(bend(geo, [[0, 0, 0], [inw * 0.006, -0.020, 0.018], [inw * 0.014, -0.040, 0.030], [inw * 0.022, -0.056, 0.034]], Lt, [1, 0, 0]), HX + inw * 0.004, HY - 0.028, HZ + 0.030));
      fg.push(place(ell(0.012, 0.016, 0.014, 8, 6), HX + inw * 0.006, HY - 0.034, HZ + 0.024));
    }
    add(el, skin, ...fg);
  }
  function arm(side) {
    const sh = J(side * 0.150, 0.178, -0.005, chest);             // world 1.258
    sh.rotation.z = side * 0.17;
    add(sh, skin, tube({
      prof: [[-0.298, 0.042, 0.044, 0.044], [-0.255, 0.042, 0.044, 0.044], [-0.160, 0.044, 0.047, 0.048], [-0.070, 0.050, 0.052, 0.053], [0.0, 0.053, 0.054, 0.054], [0.054, 0.053, 0.054, 0.054]],
      y0: -0.298, y1: 0.054, capB: 0.043, capT: 0.054, radial: 12, rings: 10,
      bulges: [{ y: -0.10, h: 0.06, a: 0, w: 0.8, amp: 0.005 }, { y: -0.13, h: 0.06, a: PI, w: 0.8, amp: 0.004 }],
    }));
    if (OI === 0) { // WIDE KIMONO SLEEVE to the elbow, open at the bottom, rolled hem, lining ring, elbow creases
      add(sh, kimono, tube({
        prof: [[-0.262, 0.078, 0.080, 0.084, 0, -0.006], [-0.20, 0.076, 0.078, 0.082, 0, -0.004], [-0.12, 0.070, 0.071, 0.074], [-0.04, 0.064, 0.064, 0.066], [0.02, 0.062, 0.062, 0.062], [0.062, 0.060, 0.060, 0.060]],
        y0: -0.262, y1: 0.062, capB: 0.006, capT: 0.06, radial: 16, rings: 12,
        ripple: (y, a) => 0.0035 * Math.sin(a * 6 + 1) * sstep(-0.26, -0.18, y) + 0.002 * Math.sin(y * 90 + a) + 0.0025 * Math.sin(a * 3 + y * 60) * sstep(-0.22, -0.16, y) * (1 - sstep(-0.12, -0.06, y)),
        post: (x, y, z, a, k) => (y < -0.25 ? [x, y + 0.075 * (1 - k), z] : null),
      }));
      add(sh, kimonoDk, tube({ prof: [[-0.262, 0.073, 0.075, 0.079, 0, -0.006], [-0.225, 0.071, 0.073, 0.077, 0, -0.005]], y0: -0.262, y1: -0.222, capB: 0.003, capT: 0.003, radial: 14, rings: 3,
        post: (x, y, z, a, k) => (y < -0.258 ? [x, y + 0.03 * (1 - k), z] : null) }));
      { const pts = []; for (let i = 0; i <= 20; i++) { const a = (i / 20) * 2 * PI; pts.push([0.079 * Math.sin(a), -0.262 + 0.004 * Math.cos(a * 4), 0.082 * Math.cos(a) - 0.006]); } add(sh, kimonoDk, seam(pts, 0.0035, 22, true)); }
    } else if (OI === 1) { // short kimono sleeve with a rolled hem, then a laced sode plate over the shoulder
      add(sh, kimono, tube({ prof: [[-0.150, 0.066, 0.068, 0.070, 0, -0.003], [-0.09, 0.064, 0.066, 0.068], [-0.03, 0.062, 0.062, 0.063], [0.03, 0.061, 0.061, 0.061], [0.062, 0.060, 0.060, 0.060]],
        y0: -0.150, y1: 0.062, capB: 0.005, capT: 0.06, radial: 16, rings: 8, ripple: (y, a) => 0.0025 * Math.sin(a * 6 + 1) * sstep(-0.15, -0.09, y) }));
      { const pts = []; for (let i = 0; i <= 18; i++) { const a = (i / 18) * 2 * PI; pts.push([0.067 * Math.sin(a), -0.150, 0.069 * Math.cos(a) - 0.003]); } add(sh, kimonoDk, seam(pts, 0.0035, 20, true)); }
      const lo = side * PI / 2 - 1.05, hi = side * PI / 2 + 1.05;
      const sodeS = surfOf({ prof: [[-0.09, 0.078, 0.078, 0.080], [-0.03, 0.076, 0.076, 0.078], [0.03, 0.070, 0.070, 0.071], [0.066, 0.060, 0.060, 0.060]], ripple: (y, a) => { const f = frac((y + 0.09) / 0.03); return 0.003 * (f < 0.2 ? f / 0.2 : 1 - (f - 0.2) / 0.8) - 0.0015; } });
      add(sh, plateM, tube({ surf: sodeS, y0: -0.09, y1: 0.066, capB: 0.004, capT: 0.004, radial: 12, rings: 8, amap: (a) => Math.max(lo, Math.min(hi, a)) }));
      const ls = []; for (let k = 0; k < 3; k++) { const a = lo + (hi - lo) * (0.25 + 0.25 * k); ls.push(strip(sodeS, 0.006, -0.085, 0.06, a, a, 0.0035, 4, 0.002)); } add(sh, laceM, ...ls);
    } else { // bomber sleeve: upper arm, full and creased at the elbow
      add(sh, jacketM, tube({ prof: [[-0.272, 0.058, 0.060, 0.062], [-0.20, 0.062, 0.064, 0.066], [-0.10, 0.066, 0.067, 0.068], [0.0, 0.066, 0.067, 0.067], [0.066, 0.064, 0.064, 0.064]],
        y0: -0.272, y1: 0.066, capB: 0.05, capT: 0.06, radial: 16, rings: 12,
        ripple: (y, a) => 0.0030 * Math.sin(a * 4 + y * 70) * sstep(-0.27, -0.2, y) * (1 - sstep(-0.12, -0.05, y)) + 0.0015 * Math.sin(a * 7 + y * 30) }));
      add(sh, stitchM, seam([[side * -0.03, 0.05, -0.05], [side * -0.05, -0.02, -0.045], [side * -0.055, -0.10, -0.04], [side * -0.05, -0.20, -0.036]].map((p) => [p[0] * 1.15, p[1], p[2] * 1.4]), 0.0015, 8));
    }
    const el = J(0, -0.255, 0, sh);                               // world ~1.00
    el.rotation.x = -0.10;
    add(el, skin, tube({ prof: [[-0.06, 0.036, 0.037], [0.0, 0.0395, 0.0405], [0.0405, 0.0395, 0.0405]], y0: -0.062, y1: 0.0405, capB: 0.006, capT: 0.0405, radial: 12, rings: 5 }));
    if (OI !== 2) { // white wrist wrap spiralling down the forearm with bandage turns, tucked end
      add(el, wrapM, tube({
        prof: [[-0.262, 0.026, 0.033], [-0.215, 0.031, 0.034], [-0.160, 0.035, 0.037], [-0.090, 0.039, 0.041], [-0.040, 0.040, 0.041], [-0.020, 0.037, 0.038]],
        y0: -0.264, y1: -0.018, capB: 0.006, capT: 0.008, radial: 12, rings: 12,
        ripple: (y, a) => 0.0034 * (0.5 - frac(y * 30 + a / (2 * PI))) + 0.0006 * Math.cos(y * 400 + a),
      }));
      add(el, wrapDk, strip(surfOf({ prof: [[-0.27, 0.0235, 0.0295], [-0.23, 0.0285, 0.0305]] }), 0.012, -0.262, -0.236, side * 1.2, side * 2.4, 0.0018, 5, 0.0025));
      hand(el, side, wrapDk);
    } else { // bomber forearm sleeve with a ribbed cuff, a fingerless glove
      add(el, jacketM, tube({ prof: [[-0.232, 0.044, 0.046], [-0.17, 0.047, 0.049], [-0.10, 0.050, 0.052], [-0.03, 0.050, 0.052], [0.05, 0.048, 0.050]], y0: -0.234, y1: 0.052, capB: 0.006, capT: 0.05, radial: 14, rings: 10,
        ripple: (y, a) => 0.0025 * Math.sin(a * 5 + y * 40) * sstep(-0.23, -0.15, y) }));
      add(el, ribM, tube({ prof: [[-0.264, 0.036, 0.037], [-0.232, 0.040, 0.041]], y0: -0.266, y1: -0.228, capB: 0.005, capT: 0.005, radial: 24, rings: 3, ripple: (y, a) => 0.0015 * Math.cos(a * 24) }));
      hand(el, side, gloveM);
    }
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
    add(hp, hakama, tube({
      prof: [[-0.450, 0.086, 0.088, 0.088], [-0.365, 0.090, 0.093, 0.093], [-0.300, 0.104, 0.108, 0.110], [-0.220, 0.108, 0.112, 0.114], [-0.140, 0.100, 0.104, 0.104], [-0.080, 0.090, 0.093, 0.094], [0.0, 0.082, 0.083, 0.083], [0.082, 0.081, 0.082, 0.082]],
      y0: -0.451, y1: 0.082, capB: 0.086, capT: 0.082, radial: 16, rings: 12,
      bulges: [{ y: -0.15, h: 0.10, a: side * 0.5, w: 0.7, amp: 0.004 }],
      ripple: (y, a) => 0.005 * Math.sin(a * 7 + side * 0.5 + y * 8) * sstep(-0.40, -0.25, y) * (1 - sstep(-0.12, -0.02, y)) + 0.0035 * Math.sin(a * 13 + y * 60) * sstep(-0.42, -0.32, y),
    }));
    // outer side seam on the hakama leg
    { const pts = []; for (let i = 0; i <= 6; i++) { const y = -0.42 + (i / 6) * 0.36; const r = 0.088 + 0.02 * Math.sin(PI * (i / 6)); pts.push([side * (r + 0.001), y, 0.0]); } add(hp, stitchM, seam(pts, 0.0015, 6, false, 3)); }
    if (OI !== 2) { // KIMONO FRONT PANEL hanging from this hip joint (swings with the thigh)
      const a0 = side > 0 ? -0.22 : -0.78, a1 = side > 0 ? 0.78 : 0.06;
      const geo = new THREE.BoxGeometry(1, 1, 0.003, 6, 6, 1), p = geo.attributes.position;
      for (let i = 0; i < p.count; i++) {
        const u = p.getX(i) + 0.5, t = p.getY(i) + 0.5, y = -0.40 + t * 0.145, a = a0 + (a1 - a0) * u;
        const f = frameAt(torsoS, y, a), q = f.p.addScaledVector(f.n, p.getZ(i) - 0.001 - 0.006 * sstep(-0.31, -0.27, y) + (side > 0 ? 0.0 : -0.003));
        p.setXYZ(i, q.x - side * 0.083, q.y + 0.29, q.z);
      }
      geo.computeVertexNormals();
      add(hp, kimono, geo);
      if (OI === 1) { // front tassets on the hip joints
        const a0t = side > 0 ? 0.08 : -0.50, a1t = side > 0 ? 0.50 : -0.08;
        const tasRip = (t) => { const f = frac(t * 4); return 0.003 * (f < 0.2 ? f / 0.2 : 1 - (f - 0.2) / 0.8) - 0.0015; };
        const tasLift = (t) => 0.014 + 0.032 * t;
        const geo2 = panel(torsoS, -0.20, -0.335, a0t, a1t, tasLift, 2, 8, 0.004, tasRip); geo2.translate(-side * 0.083, 0.29, 0);
        add(hp, plateM, geo2);
        const laces = []; for (let k = 0; k < 2; k++) { const a = a0t + (a1t - a0t) * (0.3 + 0.4 * k); const pts = []; for (let i = 0; i <= 4; i++) { const t = i / 4; const f = frameAt(torsoS, -0.20 - 0.135 * t, a); const q = f.p.addScaledVector(f.n, tasLift(t) + 0.004); pts.push([q.x - side * 0.083, q.y + 0.29, q.z]); } laces.push(seam(pts, 0.0025, 5, false, 3)); }
        add(hp, laceM, ...laces);
      }
    }
    const kn = J(0, -0.365, 0, hp);                               // world 0.425
    const an = J(0, -0.35, 0, kn);                                // world 0.075
    if (OI !== 2) {
      // gathered hakama cuff just under the knee (dark), then the white LEG WRAPS to the ankle
      add(kn, hakama, tube({ prof: [[-0.065, 0.062, 0.064, 0.066], [-0.030, 0.068, 0.070, 0.072], [0.0, 0.066, 0.068, 0.068], [0.06, 0.060, 0.062, 0.062]], y0: -0.066, y1: 0.06, capB: 0.006, capT: 0.06, radial: 16, rings: 6,
        ripple: (y, a) => 0.0035 * Math.cos(a * 14) * sstep(-0.066, -0.05, y) }));
      add(kn, stitchM, seam(ringPts(surfOf({ prof: [[-0.07, 0.063, 0.065, 0.067], [-0.06, 0.063, 0.065, 0.067]] }), -0.064, 0.001, 16), 0.0018, 16, true, 3));
      add(kn, wrapM, tube({
        prof: [[-0.354, 0.040, 0.042, 0.044], [-0.300, 0.042, 0.043, 0.046], [-0.200, 0.049, 0.048, 0.060], [-0.110, 0.056, 0.052, 0.070], [-0.060, 0.058, 0.056, 0.063], [-0.040, 0.059, 0.058, 0.061]],
        y0: -0.356, y1: -0.038, capB: 0.006, capT: 0.008, radial: 14, rings: 14,
        bulges: [{ y: -0.12, h: 0.06, a: PI, w: 0.75, amp: 0.004 }],
        ripple: (y, a) => 0.0040 * (0.5 - frac(y * 24 + a / (2 * PI))) + 0.0006 * Math.cos(y * 340 + a * 2),
      }));
      if (OI === 1) { // SUNEATE shin guard: a splinted plate over the front of the wrap, two straps
        const shinS = surfOf({ prof: [[-0.34, 0.044, 0.048, 0.048], [-0.25, 0.050, 0.052, 0.06], [-0.15, 0.058, 0.058, 0.07], [-0.08, 0.060, 0.061, 0.064]], ripple: (y, a) => 0.0025 * Math.abs(Math.sin(a * 3.5)) - 0.001 });
        add(kn, plateM, tube({ surf: shinS, y0: -0.335, y1: -0.085, capB: 0.004, capT: 0.004, radial: 16, rings: 10, amap: (a) => Math.max(-1.35, Math.min(1.35, a)) }));
        add(kn, laceM, seam(ringPts(shinS, -0.30, 0.002, 16), 0.003, 16, true, 3), seam(ringPts(shinS, -0.12, 0.002, 16), 0.003, 16, true, 3));
      }
    } else { // hakama continues as a balloon to the ankle and is tucked into the high-top collar
      add(kn, hakama, tube({ prof: [[-0.305, 0.050, 0.052, 0.054], [-0.26, 0.062, 0.064, 0.068], [-0.18, 0.070, 0.070, 0.078], [-0.10, 0.068, 0.070, 0.074], [-0.03, 0.066, 0.068, 0.068], [0.06, 0.060, 0.062, 0.062]], y0: -0.306, y1: 0.06, capB: 0.006, capT: 0.06, radial: 16, rings: 12,
        ripple: (y, a) => 0.005 * Math.sin(a * 7 + y * 12) * sstep(-0.30, -0.22, y) + 0.003 * Math.cos(a * 12 + y * 40) * sstep(-0.30, -0.26, y) }));
      add(kn, stitchM, seam([[side * 0.055, -0.29, 0.0], [side * 0.072, -0.20, 0.0], [side * 0.072, -0.10, 0], [side * 0.066, -0.02, 0]], 0.0015, 6, false, 3));
    }
    const spring = (geo) => { const p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const z = p.getZ(i); let y = p.getY(i); if (z > 0.10) y += 1.2 * (z - 0.10) ** 2; p.setY(i, y); } geo.computeVertexNormals(); return geo; };
    const ext = (grow, depth, bevel, yTop) => { const e = new THREE.ExtrudeGeometry(footprint(side, grow), { depth, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 1, curveSegments: 2, steps: 1 }); e.rotateX(PI / 2); e.translate(0, yTop, 0); return e; };
    const lay = (geo) => { geo.rotateX(PI / 2); return geo; };
    if (OI !== 2) {
      // --- tabi sock foot on a straw sandal with a red thong
      const sole = ext(1.06, 0.016, 0.004, -0.055);
      { const p = sole.attributes.position; for (let i = 0; i < p.count; i++) { const z = p.getZ(i); p.setY(i, p.getY(i) + 0.0012 * Math.sin(z * 420) * (p.getY(i) > -0.06 ? 1 : 0)); } sole.computeVertexNormals(); }
      add(an, straw, spring(sole));
      // woven edge: a rope-like binding round the sole
      { const pts = footprint(side, 1.075).getPoints(28).map((q) => [q.x, -0.062 + (q.y > 0.10 ? 1.2 * (q.y - 0.10) ** 2 : 0), q.y]); add(an, straw, braid(pts, 0.004, 20, true, 0.3)); }
      const upProf = [[-0.070, 0.030, 0.010, 0.056, 0, 0.050], [-0.048, 0.036, 0.010, 0.078, side * 0.001, 0.050], [0.0, 0.040, 0.010, 0.078, side * 0.003, 0.050], [0.040, 0.041, 0.010, 0.066, side * 0.003, 0.050],
        [0.090, 0.045, 0.010, 0.046, side * 0.002, 0.050], [0.140, 0.041, 0.010, 0.034, side * -0.001, 0.050], [0.180, 0.026, 0.010, 0.026, side * -0.004, 0.050]];
      const foot = lay(tube({ prof: upProf, y0: -0.070, y1: 0.180, capB: 0.02, capT: 0.03, radial: 12, rings: 12, sq: 0.8,
        bulges: [{ y: 0.15, h: 0.03, a: PI / 2, w: 0.25, amp: -0.004 }] }));
      // split toe: the big toe lobe (inner side) and the four-toe lobe, plus the tabi's heel seam
      add(an, wrapDk, spring(foot), ell(0.036, 0.034, 0.038, 10, 6), place(ell(0.0155, 0.011, 0.024, 8, 6), -side * 0.017, -0.052, 0.160), place(ell(0.024, 0.0095, 0.020, 8, 6), side * 0.015, -0.054, 0.158),
        seam([[side * 0.004, -0.05, -0.07], [side * 0.004, 0.0, -0.062], [side * 0.004, 0.03, -0.05]], 0.0015, 4));
      const post = [side * 0.010, -0.055, 0.132], mid = [side * 0.004, -0.014, 0.075];
      add(an, cordM, seam([post, mid, [side * 0.038, -0.040, 0.030], [side * 0.040, -0.055, 0.005]], 0.0055, 10), seam([post, mid, [-side * 0.034, -0.040, 0.030], [-side * 0.036, -0.055, 0.005]], 0.0055, 10),
        place(new THREE.CylinderGeometry(0.006, 0.007, 0.02, 6), post[0], -0.056, post[2]));
    } else {
      // --- HIGH-TOP SNEAKER: thick bevelled sole with a midsole stripe, upper rising to a padded ankle collar, rubber toe cap, heel tab, tongue, laces
      const sole = ext(1.09, 0.030, 0.006, -0.045);
      add(an, soleM, spring(sole), place(ell(0.046, 0.026, 0.044, 10, 6), 0, -0.040, 0.132), place(ell(0.040, 0.030, 0.022, 8, 6), 0, -0.020, -0.060));
      { const pts = footprint(side, 1.10).getPoints(28).map((q) => [q.x, -0.052 + (q.y > 0.10 ? 1.2 * (q.y - 0.10) ** 2 : 0), q.y]); add(an, accentM, seam(pts, 0.0035, 30, true)); }
      const upProf = [[-0.075, 0.034, 0.010, 0.145, 0, 0.050], [-0.040, 0.040, 0.010, 0.150, side * 0.001, 0.050], [0.0, 0.042, 0.010, 0.145, side * 0.003, 0.050], [0.040, 0.043, 0.010, 0.120, side * 0.003, 0.050],
        [0.080, 0.045, 0.010, 0.075, side * 0.002, 0.050], [0.120, 0.044, 0.010, 0.048, side * 0.0, 0.050], [0.160, 0.036, 0.010, 0.036, side * -0.003, 0.050], [0.183, 0.024, 0.010, 0.026, side * -0.004, 0.050]];
      const shoe = lay(tube({ prof: upProf, y0: -0.075, y1: 0.183, capB: 0.02, capT: 0.03, radial: 14, rings: 14, sq: 0.8 }));
      add(an, shoeM, spring(shoe), ell(0.040, 0.034, 0.040, 10, 6));
      // collar: a padded ring round the top opening (an ellipse in plan)
      { const pts = []; for (let i = 0; i < 16; i++) { const a = (i / 16) * 2 * PI; pts.push([0.038 * Math.sin(a), 0.092, -0.012 + 0.052 * Math.cos(a)]); } add(an, ribM, braid(pts, 0.008, 18, true, 0.12)); }
      // tongue and laces criss-crossing the vamp
      add(an, ribM, place(plate(0.046, 0.075, 0.006, 0.012, 0.002), 0, 0.045, 0.062, -0.55, 0, 0));
      const lace = []; for (let i = 0; i < 6; i++) { const t = i / 5, y = -0.010 + t * 0.085, z = 0.115 - t * 0.075; const s = i % 2 ? 1 : -1; lace.push([s * 0.028, y, z]); }
      add(an, accentM, seam(lace, 0.0025, 24), seam(lace.map((p) => [-p[0], p[1] + 0.006, p[2] - 0.003]), 0.0025, 24));
      // side stripe
      add(an, accentM, strip(surfOf({ prof: upProf.map((p) => [p[0], p[1] + 0.002, p[2], p[3] + 0.002, p[4], p[5]]) }), 0.010, 0.02, 0.15, side * PI * 0.35, side * PI * 0.5, 0.003, 6, 0.002).rotateX(PI / 2));
    }
    return { hp, kn, an };
  }
  const LL = leg(1), RL = leg(-1);

  /* ================================================================ OUTFIT 2: katana at the left hip (on the hips joint) */
  if (OI === 1) katana(hips, [0.150, -0.105, -0.315], [0.175, 0.055, 0.045]);

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
  g.userData.outfit = O.id; g.userData.palette = P.id;
  /*@@POSE@@*/

  const box = new THREE.Box3(), v = new THREE.Vector3();
  g.updateMatrixWorld(true);
  g.traverse((n) => { const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    for (let i = 0; i < p.count; i++) box.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(n.matrixWorld)); });
  const c = box.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= box.min.y; o.position.z -= c.z; });
  return g;
}

export default function (THREE) { return build(THREE, { outfit: OUTFITS[0].id, palette: OUTFITS[0].palettes[0].id }); }
