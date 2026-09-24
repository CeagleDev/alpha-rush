/**
 * hero_oni - RAIDEN, the Neon Oni. Detail pass + wardrobe (3 outfits x 4 colourways), HERO_API.md contract.
 *
 * Body technical model (unchanged from the runner / first hero pass): every body segment is a subdivided
 * SphereGeometry re-written by `tube()` (Hermite radius-by-height profile, ellipsoidal end caps centred on the
 * joints, gaussian bulges, sine cloth folds, welded normals). `amap` makes OPEN shells (jacket fronts, the mask,
 * the hood); `cut()` removes triangles (the mask's eye holes); `chain()` builds the segmented fingers.
 *
 * Shared identity in every outfit: the FACE under the mask (eyes with whites / iris / pupil and lids, brows,
 * a modelled nose with nostrils, lips with a mouth line, cheekbones, jaw, ears with a helix), spiky black hair,
 * the blue hannya-style oni mask with EYE HOLES (the real eyes show through) and gold horns, hands with four
 * segmented fingers and a thumb. The three outfits are different garments / headwear / accessories on the same
 * body; palettes only recolour.
 *
 * 1.56 m, ~6.6 heads (horn tips ~1.60). Facing +Z; the figure's LEFT is +X.
 * Anchors (world m): sole 0, ankle 0.075, knee 0.425, hip 0.79, hips-root 0.85, spine 0.93, chest 1.08,
 * shoulder 1.258, neck 1.315, head 1.37 (chin 1.325), crown ~1.55. elbow 1.02, wrist 0.75.
 * Every limb hangs down its joint's local -Y, so +rotation.x pitches it BACKWARD. Joints hidden by OVERLAP.
 * Emissive ONLY on the accent lights each design has (strips, studs, cable lines, boot glows, exhaust vents) at 0.8.
 */
export const OUTFITS = [
  { id: 'mechanic', name: 'Neon Mechanic', desc: 'Cropped shop jacket, cargo trousers, a wrench on the thigh and the mask on. Ready to fix it or break it.',
    palettes: [
      { id: 'neon_orange', name: 'Neon Orange', swatch: ['#b8571f', '#1a1819', '#2fe3da'] },
      { id: 'plasma_purple', name: 'Plasma Purple', swatch: ['#5a2d8a', '#1a1819', '#d44cff'] },
      { id: 'hazard_yellow', name: 'Hazard Yellow', swatch: ['#c9a227', '#1a1819', '#ff4d2e'] },
      { id: 'arctic_white', name: 'Arctic White', swatch: ['#d9dbe0', '#2b3646', '#62b8ff'] },
    ] },
  { id: 'street', name: 'Street Oni', desc: 'Hood up over the horns, chest rig, shorts over leggings, chunky kicks. The alleys are his.',
    palettes: [
      { id: 'charcoal', name: 'Charcoal', swatch: ['#2c2c30', '#3a3a3e', '#2fe3da'] },
      { id: 'red_alert', name: 'Red Alert', swatch: ['#8f1f24', '#1a1819', '#ff3b3b'] },
      { id: 'teal_drift', name: 'Teal Drift', swatch: ['#1f5f63', '#1a1819', '#5cf0d0'] },
      { id: 'sand', name: 'Sand', swatch: ['#c7a97a', '#5a4a35', '#ffb347'] },
    ] },
  { id: 'rider', name: 'Rider', desc: 'Armoured moto jacket, horned half-helmet, spine protector and boots that breathe fire. Built for the expressway.',
    palettes: [
      { id: 'black_chrome', name: 'Black Chrome', swatch: ['#1c1c1f', '#8a8e93', '#ff7a1a'] },
      { id: 'cyan_circuit', name: 'Cyan Circuit', swatch: ['#16303a', '#2e3136', '#2fe3da'] },
      { id: 'magenta_pulse', name: 'Magenta Pulse', swatch: ['#3a1230', '#2e3136', '#ff3fd4'] },
      { id: 'gold_rush', name: 'Gold Rush', swatch: ['#2a2418', '#b8902e', '#ffc74a'] },
    ] },
];

// colour slots per palette. primary = the main garment, dark = black panels / straps / trims, base2 = the second
// garment (trousers / shorts / leggings), glow = the emissive accent, mask / gold / steel / armour / white = accessories.
const PALETTE = {
  mechanic: {
    neon_orange:   { primary: 0xb8571f, dark: 0x1a1819, base2: 0x232326, glow: 0x2fe3da, mask: 0x1b2d8c, maskLine: 0x1f6f6c, gold: 0x9c7a2c, steel: 0x8a8e93, armour: 0x2e3136, white: 0xbdb8ad },
    plasma_purple: { primary: 0x5a2d8a, dark: 0x1a1819, base2: 0x1e1c24, glow: 0xd44cff, mask: 0x2a1650, maskLine: 0x7a3fb0, gold: 0x9c7a2c, steel: 0x8a8e93, armour: 0x2e3136, white: 0xbdb8ad },
    hazard_yellow: { primary: 0xc9a227, dark: 0x1a1819, base2: 0x232326, glow: 0xff4d2e, mask: 0x1e1e22, maskLine: 0x8a4a1a, gold: 0x9c7a2c, steel: 0x8a8e93, armour: 0x2e3136, white: 0xbdb8ad },
    arctic_white:  { primary: 0xd9dbe0, dark: 0x2b3646, base2: 0x2b3646, glow: 0x62b8ff, mask: 0x9fb8d8, maskLine: 0x3a6a9a, gold: 0x8a8e93, steel: 0x8a8e93, armour: 0x3c4552, white: 0xe6e8ea },
  },
  street: {
    charcoal:   { primary: 0x2c2c30, dark: 0x3a3a3e, base2: 0x1a1819, glow: 0x2fe3da, mask: 0x1b2d8c, maskLine: 0x1f6f6c, gold: 0x9c7a2c, steel: 0x8a8e93, armour: 0x2e3136, white: 0xbdb8ad },
    red_alert:  { primary: 0x8f1f24, dark: 0x1a1819, base2: 0x232326, glow: 0xff3b3b, mask: 0x1e1e22, maskLine: 0x8a2a2a, gold: 0x9c7a2c, steel: 0x8a8e93, armour: 0x2e3136, white: 0xbdb8ad },
    teal_drift: { primary: 0x1f5f63, dark: 0x1a1819, base2: 0x2a2f33, glow: 0x5cf0d0, mask: 0x1b2d8c, maskLine: 0x1f6f6c, gold: 0x9c7a2c, steel: 0x8a8e93, armour: 0x2e3136, white: 0xbdb8ad },
    sand:       { primary: 0xc7a97a, dark: 0x5a4a35, base2: 0x6b5a42, glow: 0xffb347, mask: 0x3a2a1a, maskLine: 0x9c7a2c, gold: 0x9c7a2c, steel: 0x8a8e93, armour: 0x4a4038, white: 0xe0d8c8 },
  },
  rider: {
    black_chrome:  { primary: 0x1c1c1f, dark: 0x111114, base2: 0x1a1819, glow: 0xff7a1a, mask: 0x1b2d8c, maskLine: 0x8a8e93, gold: 0x8a8e93, steel: 0xb0b4b8, armour: 0x8a8e93, white: 0xbdb8ad },
    cyan_circuit:  { primary: 0x16303a, dark: 0x1a1819, base2: 0x1a2025, glow: 0x2fe3da, mask: 0x1b2d8c, maskLine: 0x2fe3da, gold: 0x9c7a2c, steel: 0x8a8e93, armour: 0x2e3136, white: 0xbdb8ad },
    magenta_pulse: { primary: 0x3a1230, dark: 0x1a1819, base2: 0x1e1a22, glow: 0xff3fd4, mask: 0x5a1a4a, maskLine: 0xff3fd4, gold: 0x9c7a2c, steel: 0x8a8e93, armour: 0x2e3136, white: 0xbdb8ad },
    gold_rush:     { primary: 0x2a2418, dark: 0x1a1819, base2: 0x1e1a14, glow: 0xffc74a, mask: 0x9c7a2c, maskLine: 0x5a4a1a, gold: 0xb8902e, steel: 0x8a8e93, armour: 0xb8902e, white: 0xbdb8ad },
  },
};

export function build(THREE, { outfit, palette } = {}) {
  const O = OUTFITS.find((o) => o.id === outfit) || OUTFITS[0];
  const P = O.palettes.find((p) => p.id === palette) || O.palettes[0];
  const C = PALETTE[O.id][P.id];
  const g = new THREE.Group();
  const M = (color, name, roughness = 0.88, metalness = 0) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness });
    if (name) m.name = name;
    return m;
  };
  // materials (palette-driven); skin / eyes / hair / lips are authored constants
  const prim = M(C.primary, 'fabric', O.id === 'rider' ? 0.45 : O.id === 'street' ? 0.95 : 0.6);   // main garment
  const dark = M(C.dark, 'fabric', 0.62);                 // black panels, cuffs, belt, gloves, straps
  const base2 = M(C.base2, 'fabric', 0.93);               // trousers / shorts / leggings
  const tank = M(0x1e1d1f, 'fabric', 0.92);
  const armour = M(C.armour, 'metal', 0.5, 0.45);
  const soleM = M(0x1a1819, undefined, 0.9);
  const gold = M(C.gold, 'metal', 0.35, 0.8);
  const steel = M(C.steel, 'metal', 0.4, 0.7);
  const maskM = M(C.mask, undefined, 0.22, 0.1);
  const maskLine = M(C.maskLine, undefined, 0.5);
  const white = M(C.white, undefined, 0.5);
  const eyeWhite = M(0xe8e2d8, undefined, 0.35);
  const iris = M(0x4a2c18, undefined, 0.3);
  const pupil = M(0x110f12, undefined, 0.4);
  const skin = new THREE.MeshStandardMaterial({ color: 0xa97f5e, roughness: 0.65 });
  const lipM = new THREE.MeshStandardMaterial({ color: 0x8e5a44, roughness: 0.6 });
  const hairM = M(0x15110f, 'fabric', 0.8);
  const glow = new THREE.MeshStandardMaterial({ color: 0x0e1f1f, emissive: C.glow, emissiveIntensity: 0.8, roughness: 0.45 });
  const accent = M(C.glow, undefined, 0.35);            // reflective tape: the accent colour, NOT emissive
  const jacket = prim, jkBlack = dark, trouser = base2;


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
  // per-(joint, material) accumulator: geometries pile up and flush() makes ONE mesh per pair (keeps mesh count low)
  const acc = new Map();
  const add = (parent, mat, ...geos) => { const k = parent.uuid + mat.uuid; let e = acc.get(k); if (!e) { e = { parent, mat, geos: [] }; acc.set(k, e); } for (const q of geos) e.geos.push(q); };
  const flush = () => { for (const e of acc.values()) e.parent.add(new THREE.Mesh(e.geos.length > 1 ? merge(e.geos) : e.geos[0], e.mat)); };
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
  // slabs are subdivided along their width / height so wrapOn() can bend them round a surface (a 1-segment box wrapped on
  // a curve keeps its flat middle INSIDE the surface; only the corners reach it)
  const slab = (w, h, d, nx = Math.max(1, Math.ceil(w / 0.009)), ny = Math.max(1, Math.ceil(h / 0.012))) => new THREE.BoxGeometry(w, h, d, nx, ny, 1);
  // a curved-surface plate: subdivided box with rounded corners and a chamfered front edge, back face removed (it sits on cloth)
  function cplate(w, h, d, r = 0.006, bevel = 0.003) {
    const nx = Math.max(2, Math.ceil(w / 0.014)), ny = Math.max(2, Math.ceil(h / 0.018));
    const g = new THREE.BoxGeometry(w, h, d, nx, ny, 1), p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      let x = p.getX(i), y = p.getY(i); const z = p.getZ(i);
      const ax = Math.abs(x) - (w / 2 - r), ay = Math.abs(y) - (h / 2 - r);
      if (ax > 0 && ay > 0) { const l = Math.hypot(ax, ay); if (l > r) { x = Math.sign(x) * (w / 2 - r + ax / l * r); y = Math.sign(y) * (h / 2 - r + ay / l * r); } }
      if (z > 0) { x *= 1 - bevel / (w / 2); y *= 1 - bevel / (h / 2); }
      p.setXYZ(i, x, y, z);
    }
    g.computeVertexNormals();
    return cut(g, (cx, cy, cz) => cz > -d / 2 + 1e-5);
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

  /* ---------------------------------------------------------------- extra helpers (detail pass) */
  // remove the triangles whose centroid fails keep(x, y, z): used to open the mask's eye holes
  function cut(geo, keep) {
    const q = geo.index ? geo.toNonIndexed() : geo, p = q.attributes.position, n = q.attributes.normal, u = q.attributes.uv;
    const P = [], N = [], U = [];
    for (let i = 0; i < p.count; i += 3) {
      const cx = (p.getX(i) + p.getX(i + 1) + p.getX(i + 2)) / 3, cy = (p.getY(i) + p.getY(i + 1) + p.getY(i + 2)) / 3, cz = (p.getZ(i) + p.getZ(i + 1) + p.getZ(i + 2)) / 3;
      if (!keep(cx, cy, cz)) continue;
      for (let k = 0; k < 3; k++) { P.push(p.getX(i + k), p.getY(i + k), p.getZ(i + k)); N.push(n.getX(i + k), n.getY(i + k), n.getZ(i + k)); if (u) U.push(u.getX(i + k), u.getY(i + k)); }
    }
    const out = new THREE.BufferGeometry();
    out.setAttribute('position', new THREE.BufferAttribute(new Float32Array(P), 3));
    out.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(N), 3));
    out.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(U.length ? U : new Array(P.length / 3 * 2).fill(0)), 2));
    return out;
  }
  // a capsule spanning y in [-len, 0] (hangs down from the origin), slightly tapered
  const capsule = (r0, r1, len, radial = 6) => {
    const c = new THREE.CapsuleGeometry(r0, len, 1, radial), p = c.attributes.position;
    for (let i = 0; i < p.count; i++) { const t = (p.getY(i) + len / 2) / len, k = 1 - (1 - r1 / r0) * (1 - Math.max(0, Math.min(1, t))); p.setX(i, p.getX(i) * k); p.setZ(i, p.getZ(i) * k); p.setY(i, p.getY(i) - len / 2); }
    c.computeVertexNormals(); return c;
  };
  // a chain of capsules: segs = [{len, r0, r1, curl}] each hinged about local Z by `curl` (rad); M0 places the base.
  // returns [{geo, tip: Matrix4}] so the caller can put knuckles / nails on the chain.
  function chain(M0, segs) {
    const out = []; let M = M0.clone(); const T = new THREE.Matrix4(), R = new THREE.Matrix4();
    for (const s of segs) {
      M.multiply(R.makeRotationZ(s.curl));
      const geo = capsule(s.r0, s.r1, s.len, s.radial || 6); geo.applyMatrix4(M);
      out.push({ geo, at: M.clone() });
      M.multiply(T.makeTranslation(0, -s.len, 0));
    }
    return out;
  }
  // spherical cap facing +Z (for eyelids): phi window in the sphere's own frame after Y -> Z rotation
  const capZ = (r, phi0, phiLen, th0, thLen, R = 10, H = 4) => { const s = new THREE.SphereGeometry(r, R, H, phi0, phiLen, th0, thLen); s.rotateX(PI / 2); return s; };
  const MX = (x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) => { const m = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(rx, ry, rz)); m.setPosition(x, y, z); return m; };

  const root = new THREE.Object3D(); g.add(root);
  const SP = 0.15;                                                   // chest sits 0.15 above the spine joint

  /* ---------------------------------------------------------------- body surfaces shared by every outfit (chest-local y; world = 1.08 + y) */
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
  const thighOf = (side, loose = 1) => surfOf({
    prof: [[-0.428, 0.062, 0.064, 0.064], [-0.365, 0.063, 0.065, 0.066], [-0.300, 0.068, 0.070, 0.070], [-0.190, 0.077, 0.080, 0.080], [-0.080, 0.084, 0.086, 0.088], [0.0, 0.083, 0.084, 0.084], [0.084, 0.083, 0.084, 0.084]]
      .map((q) => [q[0], q[1] * loose, q[2] * loose, q[3] * loose]),
    bulges: [{ y: -0.15, h: 0.10, a: side * 0.5, w: 0.7, amp: 0.005 }, { y: -0.17, h: 0.09, a: PI, w: 0.7, amp: 0.004 }],
    ripple: loose > 0.97 ? (y, a) => 0.003 * sstep(-0.40, -0.37, y) * (1 - sstep(-0.33, -0.29, y)) * (0.5 - 0.5 * Math.cos(a)) * Math.sin(y * 200 + a)
      + 0.0022 * sstep(-0.30, -0.22, y) * (1 - sstep(-0.12, -0.06, y)) * Math.sin(y * 95 + a * 2.5) : undefined,
  });
  const shinOf = (loose = 1) => surfOf({
    prof: [[-0.212, 0.049, 0.051, 0.053], [-0.190, 0.068, 0.070, 0.076], [-0.150, 0.070, 0.069, 0.081], [-0.100, 0.066, 0.064, 0.078], [-0.050, 0.061, 0.062, 0.068], [0.0, 0.059, 0.060, 0.060], [0.060, 0.059, 0.060, 0.060]]
      .map((q, i) => [q[0], q[1] * (i < 2 ? 1 : loose), q[2] * (i < 2 ? 1 : loose), q[3] * (i < 2 ? 1 : loose)]),
    bulges: [{ y: -0.115, h: 0.06, a: PI, w: 0.75, amp: 0.004 }],
    ripple: loose > 0.97 ? (y, a) => 0.0040 * (1 - sstep(-0.150, -0.100, y)) * sstep(-0.212, -0.195, y) * Math.sin(y * 150 + Math.sin(a) * 1.5 + a * 2)
      + 0.0018 * sstep(-0.10, -0.06, y) * (1 - sstep(-0.03, 0.0, y)) * Math.sin(y * 120 + a * 3) : undefined,
  });
  const elbowFold = (y0, y1) => (y, a) => 0.0030 * sstep(y0, y0 + 0.02, y) * (1 - sstep(y1 - 0.02, y1, y)) * (0.5 + 0.5 * Math.cos(a)) * Math.sin(y * 210 + a * 1.2);
  const sleeveOf = (side, k = 1) => surfOf({
    prof: [[-0.300, 0.043, 0.045, 0.045], [-0.255, 0.043, 0.045, 0.045], [-0.160, 0.046, 0.049, 0.050], [-0.070, 0.053, 0.056, 0.057], [0.0, 0.057, 0.058, 0.058], [0.058, 0.057, 0.058, 0.058]]
      .map((q) => [q[0], q[1] * k, q[2] * k, q[3] * k]),
    bulges: [{ y: -0.06, h: 0.05, a: side * PI / 2, w: 0.9, amp: 0.005 }, { y: -0.235, h: 0.03, a: PI, w: 0.6, amp: 0.004 }],
    ripple: elbowFold(-0.25, -0.16),
  });
  const foreOf = (k = 1) => surfOf({
    prof: [[-0.092, 0.038, 0.039, 0.039], [-0.040, 0.041, 0.043, 0.044], [0.0, 0.0415, 0.0425, 0.0425], [0.0425, 0.0415, 0.0425, 0.0425]].map((q) => [q[0], q[1] * k, q[2] * k, q[3] * k]),
    ripple: elbowFold(-0.10, -0.01),
  });
  const skinArmS = surfOf({ prof: [[-0.236, 0.024, 0.027, 0.027], [-0.190, 0.028, 0.031, 0.033], [-0.150, 0.031, 0.034, 0.036], [-0.115, 0.032, 0.034, 0.034]] });

  /* ---------------------------------------------------------------- skeleton (same joint contract as before) */
  const hips = J(0, 0.85, 0, root);
  const spine = J(0, 0.08, 0, hips);
  const chest = J(0, 0.15, 0, spine);
  const neck = J(0, 0.235, -0.008, chest);                          // world 1.315
  const head = J(0, 0.055, 0.008, neck);                            // world 1.37
  const ARM = {}, LEG = {};
  for (const side of [1, -1]) {
    const sh = J(side * 0.150, 0.178, -0.005, chest); sh.rotation.z = side * 0.17;   // world 1.258
    const el = J(0, -0.255, 0, sh); el.rotation.x = -0.10;                            // world ~1.02
    ARM[side] = { sh, el };
    const hp = J(side * 0.083, -0.06, 0, hips);                                        // world 0.79
    const kn = J(0, -0.365, 0, hp);                                                    // world 0.425
    const an = J(0, -0.35, 0, kn);                                                     // world 0.075
    LEG[side] = { hp, kn, an };
  }

  /* ---------------------------------------------------------------- neck + head: the FACE (shared identity) */
  add(neck, skin, tube({ prof: [[-0.045, 0.074, 0.050, 0.058, 0, 0.0], [-0.010, 0.050, 0.046, 0.050, 0, 0.002], [0.035, 0.044, 0.044, 0.046, 0, 0.006], [0.090, 0.043, 0.042, 0.046, 0, 0.010]],
    y0: -0.045, y1: 0.095, capB: 0.01, capT: 0.02, radial: 14, rings: 7,
    bulges: [{ y: 0.0, h: 0.05, a: PI - 0.6, w: 0.4, amp: 0.006 }, { y: 0.0, h: 0.05, a: PI + 0.6, w: 0.4, amp: 0.006 }, { y: 0.02, h: 0.03, a: 0.0, w: 0.25, amp: 0.002 }] }));
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
      { y: 0.03, h: 0.03, a: PI, w: 0.5, amp: -0.004 },                                                             // nape hollow
      { y: 0.062, h: 0.016, a: 0.40, w: 0.22, amp: -0.005 }, { y: 0.062, h: 0.016, a: -0.40, w: 0.22, amp: -0.005 }, // eye sockets
      { y: 0.082, h: 0.012, a: 0.40, w: 0.5, amp: 0.003 }, { y: 0.082, h: 0.012, a: -0.40, w: 0.5, amp: 0.003 },     // brow ridge
      { y: 0.052, h: 0.03, a: 0.0, w: 0.09, amp: 0.008 },                                                            // nose bridge
      { y: 0.030, h: 0.011, a: 0.0, w: 0.13, amp: 0.011 },                                                           // nose tip
      { y: 0.026, h: 0.009, a: 0.17, w: 0.10, amp: 0.006 }, { y: 0.026, h: 0.009, a: -0.17, w: 0.10, amp: 0.006 },   // alae
      { y: 0.040, h: 0.03, a: 0.72, w: 0.32, amp: 0.006 }, { y: 0.040, h: 0.03, a: -0.72, w: 0.32, amp: 0.006 },     // cheekbones
      { y: -0.015, h: 0.03, a: 1.45, w: 0.35, amp: 0.004 }, { y: -0.015, h: 0.03, a: -1.45, w: 0.35, amp: 0.004 },   // jaw corners
      { y: -0.040, h: 0.012, a: 0.0, w: 0.35, amp: 0.004 },                                                          // chin
      { y: 0.012, h: 0.008, a: 0.0, w: 0.06, amp: -0.0015 },                                                         // philtrum
    ],
  });
  add(head, skin, tube({ surf: headS, y0: -0.047, y1: 0.180, capB: 0.02, capT: 0.05, radial: 24, rings: 16 }));
  { // eyes: eyeball sunk in the socket, iris + pupil on its front, upper and lower lids as spherical caps; brows
    for (const s of [-1, 1]) {
      const f = frameAt(headS, 0.062, s * 0.40);
      add(head, eyeWhite, onFrame(new THREE.SphereGeometry(0.0122, 12, 8), f, -0.0060));
      add(head, iris, onFrame(ell(0.0050, 0.0050, 0.0016, 10, 4), f, 0.0057));
      add(head, pupil, onFrame(ell(0.0026, 0.0026, 0.0012, 8, 3), f, 0.0066));
      // lids are crescents (upper 0.62..1.24 rad from the gaze axis, lower 0.95..1.30) so the white shows round the iris
      add(head, skin, onFrame(capZ(0.0134, PI, PI, 0.80, 0.45), f, -0.0060), onFrame(capZ(0.0132, 0, PI, 0.98, 0.32), f, -0.0060));
      add(head, pupil, lineOn(headS, [[0.070, s * 0.22], [0.072, s * 0.40], [0.069, s * 0.56]], 0.0075, 0.0008, 6));  // lash line
      add(head, hairM, wrapOn(slab(0.036, 0.007, 0.003), headS, 0.087, s * 0.42, 0.0015, s * 0.30));
    }
    // nostrils, lips with a mouth line
    for (const s of [-1, 1]) { const f = frameAt(headS, 0.019, s * 0.11); add(head, pupil, onFrame(ell(0.0032, 0.0022, 0.003, 6, 3), f, 0.0005)); }
    add(head, lipM, lineOn(headS, [[0.005, -0.32], [0.009, -0.16], [0.007, -0.04], [0.010, 0], [0.007, 0.04], [0.009, 0.16], [0.005, 0.32]], 0.002, 0.0032, 14),
      lineOn(headS, [[-0.004, -0.29], [-0.008, -0.13], [-0.009, 0], [-0.008, 0.13], [-0.004, 0.29]], 0.0025, 0.0038, 12));
    add(head, pupil, lineOn(headS, [[0.002, -0.31], [-0.001, -0.15], [0.0, 0], [-0.001, 0.15], [0.002, 0.31]], 0.0035, 0.0009, 12));
    // ears: concha, helix rim, lobe
    for (const s of [-1, 1]) {
      const pts = []; for (let i = 0; i <= 10; i++) { const ph = 0.3 + i * ((PI + 0.9 - 0.3) / 10); pts.push([s * 0.0035, 0.020 * Math.sin(ph), 0.0125 * Math.cos(ph)]); }
      const ear = merge([ell(0.0045, 0.019, 0.012, 8, 5), seam(pts, 0.0026, 10), place(ell(0.005, 0.0065, 0.006, 6, 4), 0, -0.016, 0.002), place(ell(0.003, 0.008, 0.006, 5, 3), s * 0.003, 0.003, 0.004)]);
      add(head, skin, place(ear, s * 0.0735, 0.052, -0.004, 0, s * 0.45, s * -0.10));
    }
  }
  /* ---------------------------------------------------------------- the MASK (worn over the face in every outfit) + horns */
  const MW = 1.42;
  const maskS = grow(headS, 0.009, 0.010, 0.009, {
    bulges: [
      { y: 0.088, h: 0.016, a: 0.42, w: 0.30, amp: 0.011 }, { y: 0.088, h: 0.016, a: -0.42, w: 0.30, amp: 0.011 },   // brow ridges
      { y: 0.064, h: 0.013, a: 0.40, w: 0.24, amp: -0.004 }, { y: 0.064, h: 0.013, a: -0.40, w: 0.24, amp: -0.004 }, // eye sockets
      { y: 0.040, h: 0.030, a: 0.0, w: 0.18, amp: 0.016 },                                                           // nose
      { y: 0.030, h: 0.025, a: 0.72, w: 0.28, amp: 0.008 }, { y: 0.030, h: 0.025, a: -0.72, w: 0.28, amp: 0.008 },   // cheek bulges
      { y: -0.006, h: 0.014, a: 0.0, w: 0.75, amp: 0.007 },                                                          // grin mass
      { y: -0.030, h: 0.012, a: 0.0, w: 0.4, amp: 0.005 },                                                           // chin
    ],
  });
  function mask(withRim = true) {
    const eyeHole = (x, y, z) => { const a = Math.atan2(x, z); for (const s of [-1, 1]) { const u = (a - s * 0.40) / 0.30, v = (y - 0.063) / 0.0125; if (u * u + v * v < 1) return true; } return false; };
    add(head, maskM, cut(tube({ surf: maskS, y0: -0.052, y1: 0.136, capB: 0.02, capT: 0.004, radial: 24, rings: 18, amap: frontOnly(MW) }), (x, y, z) => !eyeHole(x, y, z)));
    // gold rims round the eye holes (hide the cut edge), dark piping round the mask edge, unlit tracery
    for (const s of [-1, 1]) {
      const pts = [], pts2 = []; for (let i = 0; i <= 16; i++) { const t = i / 16 * 2 * PI; pts.push([0.063 + 0.0133 * Math.sin(t), s * 0.40 + 0.32 * Math.cos(t)]); pts2.push([0.063 + 0.0165 * Math.sin(t), s * 0.40 + 0.36 * Math.cos(t)]); }
      add(head, gold, lineOn(maskS, pts, 0.001, 0.0018, 12));
      add(head, dark, lineOn(maskS, pts2, 0.0015, 0.0026, 12));   // dark socket ring round the eye opening
    }
    if (withRim) {
      const rim = [];
      for (let i = 0; i <= 6; i++) rim.push([-0.048 + i * (0.17 / 6), -MW]);
      for (let i = 1; i <= 6; i++) rim.push([0.122 + 0.008 * Math.sin(i * PI / 6), -MW + i * (2 * MW / 6)]);
      for (let i = 1; i <= 6; i++) rim.push([0.122 - i * (0.17 / 6), MW]);
      add(head, dark, lineOn(maskS, rim, 0.001, 0.0045, 18));
    }
    add(head, maskLine, ...[-1, 1].map((s) => lineOn(maskS, [[0.098, s * 0.20], [0.084, s * 0.62], [0.050, s * 0.86], [0.010, s * 0.98], [-0.020, s * 0.80]], 0.002, 0.0016, 8)),
      ...[-1, 1].map((s) => lineOn(maskS, [[0.112, s * 0.05], [0.116, s * 0.5], [0.108, s * 1.0]], 0.002, 0.0014, 5)));
    // the grin: lip ridges round a mouth slot, bared teeth with gaps, two fangs, snarl creases, angry brows
    add(head, maskM, lineOn(maskS, [[0.004, -0.80], [0.008, -0.40], [0.006, 0], [0.008, 0.40], [0.004, 0.80]], 0.0035, 0.0036, 12),
      lineOn(maskS, [[-0.019, -0.78], [-0.023, -0.40], [-0.024, 0], [-0.023, 0.40], [-0.019, 0.78]], 0.0035, 0.0038, 12));
    add(head, dark, wrapOn(slab(0.088, 0.021, 0.003), maskS, -0.007, 0, 0.0025));                                                     // mouth cavity
    add(head, white, wrapOn(slab(0.080, 0.012, 0.004), maskS, -0.007, 0, 0.0045),                                                     // tooth band
      ...[-1, 1].map((s) => { const f = frameAt(maskS, -0.013, s * 0.30); return onFrame(place(new THREE.CylinderGeometry(0.0006, 0.0038, 0.016, 6), 0, 0.006, 0), f, 0.0065); }));   // fangs, up from the lower jaw
    add(head, dark, ...[-3, -2, -1, 0, 1, 2, 3, 4, -4].map((i) => lineOn(maskS, [[-0.0125, i * 0.115 + 0.0575], [-0.0015, i * 0.115 + 0.0575]], 0.0068, 0.0007, 2)));   // tooth gaps
    add(head, dark, ...[-1, 1].map((s) => lineOn(maskS, [[-0.014, s * 0.12], [-0.006, s * 0.26], [0.000, s * 0.42]], 0.006, 0.0012, 4)),
      ...[-1, 1].map((s) => lineOn(maskS, [[0.012, s * 0.12], [0.026, s * 0.24], [0.036, s * 0.44]], 0.004, 0.001, 4)),
      ...[-1, 1].map((s) => lineOn(maskS, [[0.091, s * 0.14], [0.100, s * 0.40], [0.106, s * 0.68]], 0.003, 0.0052, 8)));   // angry brows (inner end low)
  }
  // gold horn: tapered, curving up and inward, base at (x, y, z) in head-local
  function horn(x, y, z, k = 1, rz = 0.75, rx = -0.20) {
    const s = Math.sign(x) || 1;
    const h = new THREE.CylinderGeometry(0.003 * k, 0.020 * k, 0.108 * k, 8, 6), p = h.attributes.position;
    for (let i = 0; i < p.count; i++) { const t = (p.getY(i) + 0.054 * k) / (0.108 * k); p.setX(i, p.getX(i) - s * 0.030 * k * t * t); p.setZ(i, p.getZ(i) - 0.014 * k * t * t); }
    h.translate(0, 0.050 * k, 0); h.computeVertexNormals();
    add(head, gold, place(h, x, y, z, rx, 0, s * -rz), place(new THREE.TorusGeometry(0.019 * k, 0.003, 4, 8), x, y + 0.004, z, rx, 0, s * -rz));
  }
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
    ripple: (y, a) => 0.0040 * Math.sin(a * 9 + y * 30) + 0.0025 * Math.sin(a * 4 - y * 70),
  });
  const hairline = (a0) => { const a = Math.abs(a0); if (a < 1.42) return 0.122 + 0.006 * Math.cos(a0 * 4); if (a < 1.75) return 0.122 - 0.054 * sstep(1.42, 1.75, a); return 0.068 - 0.060 * sstep(1.75, 2.7, a); };
  // a hair clump: base on the hair shell, pointing along (normal + up + back), slightly flattened
  // a hair clump: a broad, flat blade (wide across the surface, thin along its normal) tapering to a point, rooted 8 mm inside
  // the hair shell and pointing along (nW * normal + upW * up + backW * back); clumps overlap so the shell reads as hair, not a dome
  const spike = (gs, yb, a, len, r, upW, backW, nW = 1, sideW = 0) => {
    const f = frameAt(hairS, yb, a), d = f.n.clone().multiplyScalar(nW).addScaledVector(_up, upW).add(new THREE.Vector3(sideW, 0, -backW)).normalize();
    const e = ell(r * 1.8, len, r * 0.5, 4, 4); e.translate(0, len * 0.5, 0);
    { const p = e.attributes.position; for (let i = 0; i < p.count; i++) { const t = Math.max(0, p.getY(i) / len); const k = 1 - 0.92 * Math.pow(t, 1.5); p.setX(i, p.getX(i) * k); p.setZ(i, p.getZ(i) * k); } e.computeVertexNormals(); }
    // flatten the blade in the surface's tangent plane: rotate its wide axis to lie along the surface x
    const m = new THREE.Matrix4().makeBasis(f.x, d, new THREE.Vector3().crossVectors(f.x, d).normalize()); m.setPosition(f.p.x - f.n.x * 0.008, f.p.y - 0.004, f.p.z - f.n.z * 0.008);
    e.applyMatrix4(m); gs.push(e);
  };
  function hair(mode = 'full') {                         // 'full' | 'fringe' (under a hood) | 'nape' (under a helmet)
    const gs = [];
    if (mode !== 'nape') gs.push(tube({ surf: hairS, y0: -0.002, y1: 0.192, capB: 0.006, capT: 0.05, radial: 16, rings: 10, ymap: stretchFrom(hairline, -0.002, 0.192) }));
    if (mode !== 'nape') {   // FRINGE: two rows over the mask top, swept up and slightly forward / outward
      for (const [a, len] of [[-0.85, 0.034], [-0.52, 0.040], [-0.18, 0.044], [0.18, 0.044], [0.52, 0.040], [0.85, 0.034]]) spike(gs, 0.136, a, len, 0.013, 1.5, -0.25, 0.9, a * 0.25);
      for (const [a, len] of [[-0.70, 0.034], [-0.35, 0.038], [0.0, 0.040], [0.35, 0.038], [0.70, 0.034]]) spike(gs, 0.152, a, len, 0.012, 1.6, 0.1, 0.7, a * 0.2);
    }
    if (mode === 'full') {
      for (let i = 0; i < 12; i++) { const a = -PI + (i + 0.5) * (2 * PI / 12); spike(gs, 0.172, a, 0.036, 0.013, 1.3, 0.3 + 0.5 * Math.max(0, -Math.cos(a)), 0.8, Math.sin(a) * 0.3); }   // crown ring, leaning outward
      for (const [a, len] of [[-0.9, 0.032], [0.0, 0.036], [0.9, 0.032], [PI - 0.9, 0.032], [PI, 0.034], [PI + 0.9, 0.032]]) spike(gs, 0.190, a, len, 0.012, 2.0, 0.2, 0.5, Math.sin(a) * 0.35);   // top
      for (const s of [-1, 1]) {   // SIDES: layered blades lying on the shell, swept up and back
        spike(gs, 0.128, s * 1.20, 0.034, 0.013, 0.9, 0.9, 0.35, s * 0.3); spike(gs, 0.104, s * 1.35, 0.034, 0.013, 0.7, 1.0, 0.35, s * 0.3); spike(gs, 0.082, s * 1.55, 0.032, 0.012, 0.5, 1.1, 0.35, s * 0.25);
        spike(gs, 0.118, s * 1.75, 0.034, 0.013, 0.6, 1.2, 0.3, s * 0.2); spike(gs, 0.095, s * 2.05, 0.034, 0.013, 0.4, 1.3, 0.3, s * 0.1);
        // BACK: rows of blades sweeping back and down over each other
        spike(gs, 0.150, PI + s * 0.45, 0.038, 0.014, 0.6, 1.5, 0.35, s * 0.15); spike(gs, 0.126, PI + s * 0.80, 0.036, 0.013, 0.2, 1.5, 0.35, s * 0.2);
        spike(gs, 0.120, PI + s * 0.20, 0.036, 0.013, 0.1, 1.5, 0.35, s * 0.05); spike(gs, 0.092, PI + s * 0.55, 0.034, 0.013, -0.2, 1.4, 0.35, s * 0.15);
        spike(gs, 0.068, PI + s * 0.25, 0.032, 0.012, -0.5, 1.2, 0.35, s * 0.1); spike(gs, 0.060, PI + s * 0.85, 0.030, 0.012, -0.5, 1.1, 0.35, s * 0.2);
      }
      spike(gs, 0.150, PI, 0.038, 0.014, 0.7, 1.5, 0.35); spike(gs, 0.096, PI, 0.034, 0.013, -0.2, 1.4, 0.35);
      for (const s of [-1, 1]) {   // second shingle layer on the back and sides, lying flat
        spike(gs, 0.138, PI + s * 0.62, 0.040, 0.016, 0.3, 1.6, 0.2, s * 0.2); spike(gs, 0.108, PI + s * 0.38, 0.040, 0.016, -0.1, 1.6, 0.2, s * 0.1);
        spike(gs, 0.108, PI + s * 1.0, 0.038, 0.015, 0.0, 1.5, 0.2, s * 0.3); spike(gs, 0.078, PI + s * 0.75, 0.036, 0.015, -0.4, 1.4, 0.2, s * 0.2);
        spike(gs, 0.050, PI + s * 0.5, 0.032, 0.014, -0.8, 1.1, 0.2, s * 0.15); spike(gs, 0.080, PI + s * 0.1, 0.034, 0.015, -0.4, 1.4, 0.2, s * 0.05);
        spike(gs, 0.145, s * 1.45, 0.036, 0.015, 0.8, 1.0, 0.2, s * 0.35); spike(gs, 0.115, s * 1.55, 0.036, 0.015, 0.5, 1.2, 0.2, s * 0.3); spike(gs, 0.090, s * 1.85, 0.036, 0.015, 0.2, 1.3, 0.2, s * 0.2);
        spike(gs, 0.165, PI + s * 0.3, 0.036, 0.015, 0.9, 1.3, 0.3, s * 0.1); spike(gs, 0.165, PI + s * 1.0, 0.036, 0.015, 0.9, 1.1, 0.3, s * 0.3);
      }
      spike(gs, 0.036, PI - 0.3, 0.026, 0.010, -1.1, 0.8, 0.3); spike(gs, 0.036, PI + 0.3, 0.026, 0.010, -1.1, 0.8, 0.3);   // nape
    }
    if (mode === 'nape') { spike(gs, 0.050, PI - 0.25, 0.026, 0.010, -1.0, 0.9, 0.5); spike(gs, 0.050, PI + 0.25, 0.026, 0.010, -1.0, 0.9, 0.5); spike(gs, 0.046, PI, 0.024, 0.009, -1.0, 0.9, 0.5); }
    add(head, hairM, ...gs);
  }

  /* ---------------------------------------------------------------- HANDS: palm, four segmented fingers, thumb (shared) */
  // mode: 'fingerless' (glove palm + proximal segments, skin fingertips) | 'bare' | 'glove' (armoured knuckle plate)
  function hand(side, mode, gloveMat = dark, panelMat = prim) {
    const el = ARM[side].el, inw = -side, WY = -0.262;
    const palmS = surfOf({ sq: 1.15, prof: [[-0.090, 0.013, 0.036, 0.034], [-0.060, 0.016, 0.041, 0.038], [-0.030, 0.0155, 0.040, 0.037], [0.0, 0.013, 0.030, 0.029]],
      bulges: [{ y: -0.075, h: 0.02, a: -inw * PI / 2, w: 1.0, amp: 0.002 }] });
    const palmMat = mode === 'bare' ? skin : gloveMat;
    add(el, palmMat, tube({ surf: palmS, y0: -0.092, y1: 0.002, capB: 0.012, capT: 0.012, radial: 12, rings: 8, post: (x, y, z) => [x + inw * 0.002, y + WY, z] }));
    // wrist: skin (bare) or the glove's wrist band
    add(el, mode === 'bare' ? skin : gloveMat, tube({ prof: [[-0.268, 0.026, 0.030, 0.030], [-0.222, 0.027, 0.031, 0.031]], y0: -0.270, y1: -0.220, capB: 0.006, capT: 0.006, radial: 14, rings: 3,
      ripple: mode === 'bare' ? undefined : (y, a) => 0.0006 * Math.cos(a * 14) }));
    const F = [
      { z: 0.027, rx: 0.10, L: [0.026, 0.018, 0.014], r: 0.0078 },
      { z: 0.009, rx: 0.03, L: [0.028, 0.020, 0.015], r: 0.0080 },
      { z: -0.009, rx: -0.03, L: [0.026, 0.018, 0.014], r: 0.0075 },
      { z: -0.027, rx: -0.10, L: [0.020, 0.014, 0.011], r: 0.0066 },
    ];
    const gG = [], sG = [], kG = [], aG = [];
    for (const f of F) {
      const M0 = MX(inw * 0.001, WY - 0.088, f.z, f.rx, 0, 0);
      const segs = chain(M0, [{ len: f.L[0], r0: f.r, r1: f.r * 0.92, curl: inw * 0.36 }, { len: f.L[1], r0: f.r * 0.92, r1: f.r * 0.85, curl: inw * 0.50 }, { len: f.L[2], r0: f.r * 0.85, r1: f.r * 0.7, curl: inw * 0.40 }]);
      segs.forEach((s, i) => ((mode === 'bare' || (mode === 'fingerless' && i > 0)) ? sG : gG).push(s.geo));
      kG.push(ell(f.r * 1.15, f.r * 0.95, f.r * 1.1, 7, 4).applyMatrix4(segs[0].at));                     // knuckle bulge
      if (mode !== 'glove') sG.push(ell(f.r * 0.9, f.r * 0.9, f.r * 0.9, 6, 3).applyMatrix4(segs[1].at));  // middle knuckle
      else aG.push(ell(f.r * 1.1, f.r * 0.7, f.r * 1.05, 6, 3).translate(0, -0.004, 0).applyMatrix4(segs[0].at), ell(f.r * 0.95, f.r * 0.6, f.r * 0.95, 6, 3).translate(0, -0.003, 0).applyMatrix4(segs[1].at));   // armour knuckle caps
    }
    { // thumb: from the front-inner corner of the palm, down / forward / inward, two segments
      const M0 = MX(inw * 0.007, WY - 0.042, 0.030, -0.40, 0, inw * 0.50);
      const segs = chain(M0, [{ len: 0.026, r0: 0.0092, r1: 0.0085, curl: 0 }, { len: 0.021, r0: 0.0085, r1: 0.0068, curl: inw * 0.50 }]);
      ((mode === 'bare' || mode === 'fingerless') ? sG : gG).push(segs[1].geo);
      (mode === 'bare' ? sG : gG).push(segs[0].geo);
      kG.push(ell(0.0105, 0.009, 0.010, 7, 4).applyMatrix4(segs[0].at));
    }
    if (sG.length) add(el, skin, ...sG);
    if (gG.length) add(el, gloveMat, ...gG);
    add(el, mode === 'bare' ? skin : gloveMat, ...kG);
    if (mode === 'fingerless') {   // back-of-hand panel in the jacket colour, cyan stud + gold tag on the wrist band, three knuckle studs
      const fb = frameAt(palmS, -0.045, -inw * PI / 2);
      add(el, panelMat, onFrame(plate(0.030, 0.040, 0.002, 0.010, 0.0015), fb, 0.0015).translate(inw * 0.002, WY, 0));
      add(el, glow, ...[0.027, 0.009, -0.009].map((z) => place(ell(0.0035, 0.0045, 0.0045, 5, 3), -inw * 0.0135, WY - 0.087, z)),
        place(ell(0.004, 0.006, 0.006, 5, 3), -inw * 0.0285, -0.245, -0.012));
      add(el, gold, wrapOn(slab(0.012, 0.009, 0.002), surfOf({ prof: [[-0.268, 0.026, 0.030, 0.030], [-0.222, 0.027, 0.031, 0.031]] }), -0.245, side * (PI / 2 - 0.9), 0.0015));
    }
    if (mode === 'glove') {        // armoured knuckle plate + finger guards
      const fb = frameAt(palmS, -0.070, -inw * PI / 2);
      add(el, armour, onFrame(plate(0.030, 0.024, 0.004, 0.006, 0.002), fb, 0.004).translate(inw * 0.002, WY, 0),
        onFrame(plate(0.030, 0.030, 0.003, 0.008, 0.0015), frameAt(palmS, -0.036, -inw * PI / 2), 0.003).translate(inw * 0.002, WY, 0), ...aG);
    }
    if (mode === 'bare') add(el, dark, band(surfOf({ prof: [[-0.268, 0.026, 0.030, 0.030], [-0.222, 0.027, 0.031, 0.031]] }), -0.262, -0.248, 10, undefined, 0.003));
    return { WY };
  }

  /* ================================================================ shared garment pieces (soles, boots) */
  function footprint(side, grow) {
    const pts = [[0, -0.075], [0.030, -0.062], [0.041, -0.020], [0.044, 0.040], [0.050, 0.100], [0.043, 0.150], [0.022, 0.180], [-0.005, 0.187],
      [-0.030, 0.174], [-0.046, 0.130], [-0.046, 0.090], [-0.037, 0.030], [-0.037, -0.030], [-0.028, -0.062]];
    const q = pts.map(([x, z]) => new THREE.Vector2(side * x * grow, (z - 0.055) * grow + 0.055));
    if (side < 0) q.reverse();
    const s = new THREE.Shape(); s.moveTo(q[0].x, q[0].y); s.splineThru(q.slice(1).concat([q[0]]));
    return s;
  }
  const spring = (geo) => { const p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const z = p.getZ(i); let y = p.getY(i); if (z > 0.09) y += 2.0 * (z - 0.09) ** 2; if (z < -0.045) y += 1.8 * (z + 0.045) ** 2; p.setY(i, y); } geo.computeVertexNormals(); return geo; };
  const soleExt = (side, grow, depth, bevel, yTop) => { const e = new THREE.ExtrudeGeometry(footprint(side, grow), { depth, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 1, curveSegments: 2, steps: 1 }); e.rotateX(PI / 2); e.translate(0, yTop, 0); return e; };
  const lay = (geo) => { geo.rotateX(PI / 2); return geo; };
  const upProfOf = (side, k = 1) => [[-0.074, 0.034, 0.010, 0.078, 0, 0.038], [-0.048, 0.042, 0.010, 0.098, side * 0.001, 0.038], [0.0, 0.046, 0.010, 0.104, side * 0.003, 0.038], [0.040, 0.048, 0.010, 0.088, side * 0.003, 0.038],
    [0.090, 0.052, 0.010, 0.060, side * 0.002, 0.038], [0.140, 0.048, 0.010, 0.046, side * -0.001, 0.038], [0.190, 0.032, 0.010, 0.038, side * -0.004, 0.038]].map((q) => [q[0], q[1] * k, q[2], q[3] * k, q[4], q[5]]);

  /* ================================================================ OUTFIT 1: Neon Mechanic (the reference) */
  function outfitMechanic() {
    const jacketS = grow(bodyS, 0.014, 0.013, 0.015, {
      sq: 0.9,
      bulges: [{ y: 0.115, h: 0.07, a: PI - 0.5, w: 0.36, amp: 0.008 }, { y: 0.115, h: 0.07, a: PI + 0.5, w: 0.36, amp: 0.008 }, { y: 0.03, h: 0.12, a: PI, w: 0.16, amp: -0.005 }],
      ripple: (y, a) => 0.0022 * (1 - sstep(0.15, 0.22, y)) * sstep(-0.075, -0.03, y) * Math.sin(y * 90 + Math.sin(a * 2) * 2.0 + a * 2.0),
    });
    const gapAt = (y) => 0.52 + 0.12 * sstep(-0.075, 0.07, y) - 0.30 * sstep(0.16, 0.245, y);

    // hips: cargo trousers seat, back pockets, waistband, belt with a prong buckle and belt loops
    add(hips, trouser, tube({ surf: pelvisS, y0: -0.150, y1: 0.075, capB: 0.085, capT: 0.02, radial: 16, rings: 8 }));
    {
      const gs = [];
      for (const s of [-1, 1]) gs.push(wrapOn(cplate(0.070, 0.072, 0.004, 0.012, 0.0025), pelvisS, -0.030, PI + s * 0.52, 0.0015, s * 0.06));
      add(hips, trouser, ...gs, band(grow(pelvisS, 0.003), 0.048, 0.074, 18, undefined, 0.004),
        lineOn(pelvisS, [[-0.145, PI], [-0.10, PI], [-0.05, PI], [0.0, PI], [0.045, PI]], 0.002, 0.0015, 8),                    // back seam
        ...[-1, 1].map((s) => lineOn(pelvisS, [[-0.145, s * 1.55], [-0.08, s * 1.58], [0.0, s * 1.60], [0.045, s * 1.60]], 0.002, 0.0015, 8)));   // side seams
      const beltS = grow(pelvisS, 0.008);
      const loops = [];
      for (const a of [0.55, -0.55, PI - 0.7, PI + 0.7, PI]) loops.push(wrapOn(slab(0.012, 0.040, 0.003), pelvisS, 0.030, a, 0.010));
      add(hips, dark, band(beltS, 0.012, 0.046, 18), ...loops);
      const fb = frameAt(pelvisS, 0.029, 0.0);
      add(hips, steel, onFrame(new THREE.TorusGeometry(0.016, 0.0028, 5, 4), fb, 0.012).rotateZ(0), onFrame(slab(0.003, 0.028, 0.003), fb, 0.013));   // buckle frame + prong
    }
    // spine: tank top lower half
    add(spine, tank, place(tube({ surf: bodyS, y0: -0.200, y1: 0.06, capB: 0.02, capT: 0.015, radial: 18, rings: 8,
      post: (x, y, z) => { const k = 1 - 0.02 * sstep(0.0, 0.045, y); return [x * k, y, z * k]; } }), 0, SP, 0));
    // chest: tank upper, skin, cropped jacket
    add(chest, tank, tube({ surf: bodyS, y0: -0.06, y1: 0.262, capB: 0.012, capT: 0.014, radial: 16, rings: 10,
      post: (x, y, z) => { const k = 1 - 0.02 * (1 - sstep(-0.05, 0.0, y)); return [x * k, y, z * k]; } }));
    add(chest, skin, tube({ surf: grow(bodyS, 0.0015), y0: 0.10, y1: 0.262, capB: 0.004, capT: 0.014, radial: 16, rings: 8, amap: frontOnly(1.15),
      ymap: stretchFrom((a) => 0.108 + 0.055 * (a / 1.15) ** 2, 0.10, 0.262) }));
    add(chest, tank, lineOn(bodyS, [...Array(9)].map((_, i) => { const a = -1.15 + i * (2.3 / 8); return [0.108 + 0.055 * (a / 1.15) ** 2, a]; }), 0.002, 0.004, 10));
    { // JACKET: open shell cropped at the ribs, black yoke, two reflective bands, rolled hem + front edges, stand-up collar
      add(chest, jacket, tube({ surf: jacketS, y0: -0.075, y1: 0.238, capB: 0.002, capT: 0.002, radial: 22, rings: 12, amap: openFront(gapAt) }));
      const yokeS = grow(jacketS, 0.002, 0.002, 0.002, { sq: 0.9 });
      add(chest, dark, tube({ surf: yokeS, y0: 0.168, y1: 0.236, capB: 0.002, capT: 0.002, radial: 24, rings: 5, amap: openFront((y) => gapAt(y) + 0.20) }));
      const bands = [], strips = [];
      for (const yc of [0.085, -0.040]) {
        bands.push(band(yokeS, yc - 0.019, yc + 0.019, 24, openFront((y) => gapAt(y) + 0.02)));
        strips.push(band(grow(jacketS, 0.0035), yc - 0.0085, yc + 0.0085, 24, openFront((y) => gapAt(y) + 0.02), 0.004));
      }
      add(chest, dark, ...bands);
      add(chest, glow, ...strips);
      const edges = [];
      for (const s of [-1, 1]) edges.push(lineOn(jacketS, [...Array(9)].map((_, i) => { const y = -0.075 + i * (0.318 / 8); return [y, s * gapAt(y)]; }), 0.002, 0.0048, 8));
      edges.push(lineOn(jacketS, [...Array(17)].map((_, i) => [-0.072, gapAt(-0.072) + i * ((2 * PI - 2 * gapAt(-0.072)) / 16)]), 0.002, 0.0042, 24));
      // inner wall of the hem (double-walled: the hem reads thick when the jacket lifts) and a centre-back seam
      add(chest, dark, tube({ surf: grow(bodyS, 0.010), y0: -0.072, y1: -0.050, capB: 0.001, capT: 0.001, radial: 22, rings: 3, amap: openFront((y) => gapAt(y) + 0.02) }));
      add(chest, jacket, lineOn(jacketS, [[-0.070, PI], [-0.02, PI], [0.04, PI], [0.10, PI], [0.16, PI]], 0.0015, 0.0016, 8),
        ...[-1, 1].map((s) => lineOn(jacketS, [[-0.070, s * 1.62], [0.0, s * 1.62], [0.08, s * 1.60], [0.16, s * 1.58]], 0.0015, 0.0016, 8)));
      const collarS = surfOf({ prof: [[0.236, 0.092, 0.080, 0.090, 0, -0.010], [0.262, 0.084, 0.074, 0.084, 0, -0.012], [0.290, 0.080, 0.072, 0.082, 0, -0.012], [0.310, 0.082, 0.076, 0.086, 0, -0.012]] });
      const collarTop = (a) => 0.306 - 0.030 * Math.max(0, Math.cos(a)) ** 2;
      add(chest, jacket, tube({ surf: collarS, y0: 0.236, y1: 0.310, capB: 0.003, capT: 0.012, radial: 22, rings: 6, amap: openFront(0.42),
        ymap: (y, a) => 0.236 + (y - 0.236) / 0.074 * (collarTop(a) - 0.236), post: (x, y, z, ang, k) => { if (k > 0.999 || y < 0.28) return null; const q = collarS(collarTop(ang), ang, 1), t = 1 - k; return [q[0] * (1 - 0.10 * t), collarTop(ang) - 0.022 * t, q[2] * (1 - 0.10 * t)]; } }));
      // zip pocket with a pull, round shoulder patch with a rim, zip teeth line on the right front edge
      add(chest, dark, ...edges, wrapOn(plate(0.012, 0.062, 0.002, 0.004, 0.002), jacketS, 0.035, 0.80, 0.0015, 0.0),
        wrapOn(plate(0.030, 0.030, 0.002, 0.014, 0.002), jacketS, 0.135, -0.98, 0.0015));
      add(chest, steel, wrapOn(slab(0.006, 0.010, 0.003), jacketS, 0.012, 0.80, 0.004), lineOn(jacketS, [[-0.070, -gapAt(-0.070) + 0.03], [0.0, -gapAt(0.0) + 0.03], [0.07, -gapAt(0.07) + 0.03], [0.14, -gapAt(0.14) + 0.03]], 0.003, 0.0015, 8));
      add(chest, gold, wrapOn(new THREE.TorusGeometry(0.013, 0.0015, 4, 12), jacketS, 0.135, -0.98, 0.0035));
    }
    hair('full'); mask(true);
    horn(0.070, 0.112, 0.040); horn(-0.070, 0.112, 0.040);

    for (const side of [1, -1]) { // ARMS: orange sleeve, black cap + chevrons, reflective band, cuff, bare forearm with cable lines, fingerless glove
      const { sh, el } = ARM[side], sleeveS = sleeveOf(side);
      add(sh, jacket, tube({ surf: sleeveS, y0: -0.298, y1: 0.058, capB: 0.043, capT: 0.058, radial: 11, rings: 10 }),
        lineOn(sleeveS, [[-0.290, side * (PI / 2 + 0.35)], [-0.20, side * (PI / 2 + 0.35)], [-0.10, side * (PI / 2 + 0.35)], [-0.03, side * (PI / 2 + 0.4)]], 0.0015, 0.0014, 8));   // sleeve seam
      const capS = grow(sleeveS, 0.003);
      add(sh, dark, tube({ surf: capS, y0: -0.040, y1: 0.061, capB: 0.004, capT: 0.061, radial: 11, rings: 6 }),
        band(capS, -0.153, -0.117, 12),
        wrapOn(slab(0.020, 0.075, 0.002), sleeveS, -0.205, side * PI / 2, 0.0015));
      add(sh, jacket, ...[-0.016, 0.004].map((yy) => wrapOn(slab(0.030, 0.008, 0.002), capS, yy - 0.004, side * (PI / 2 + 0.28), 0.0015, side * 0.6)),
        ...[-0.016, 0.004].map((yy) => wrapOn(slab(0.030, 0.008, 0.002), capS, yy - 0.004, side * (PI / 2 - 0.28), 0.0015, side * -0.6)));
      add(sh, glow, band(grow(sleeveS, 0.0035), -0.142, -0.128, 12, undefined, 0.004),
        lineOn(sleeveS, [[-0.240, side * PI / 2], [-0.200, side * PI / 2], [-0.168, side * PI / 2]], 0.0035, 0.0022, 8));
      const foreS = foreOf();
      add(el, jacket, tube({ surf: foreS, y0: -0.092, y1: 0.0425, capB: 0.006, capT: 0.0425, radial: 12, rings: 7 }));
      add(el, dark, tube({ prof: [[-0.132, 0.034, 0.035], [-0.086, 0.037, 0.038]], y0: -0.134, y1: -0.084, capB: 0.006, capT: 0.004, radial: 16, rings: 3, ripple: (y, a) => 0.0007 * Math.cos(a * 16) }),
        wrapOn(slab(0.018, 0.044, 0.002), foreS, -0.058, side * PI / 2, 0.0015));
      add(el, glow, lineOn(foreS, [[-0.078, side * PI / 2], [-0.058, side * PI / 2], [-0.038, side * PI / 2]], 0.0035, 0.0022, 6));
      add(el, skin, tube({ surf: skinArmS, y0: -0.238, y1: -0.110, capB: 0.008, capT: 0.006, radial: 10, rings: 6 }));
      add(el, glow, lineOn(skinArmS, [[-0.228, side * (PI / 2 + 0.35)], [-0.200, side * (PI / 2 + 0.15)], [-0.170, side * (PI / 2 - 0.05)], [-0.140, side * (PI / 2 - 0.15)], [-0.122, side * (PI / 2 - 0.2)]], 0.0015, 0.0024, 12),
        lineOn(skinArmS, [[-0.226, side * (PI / 2 - 0.55)], [-0.196, side * (PI / 2 - 0.45)], [-0.172, side * (PI / 2 - 0.35)]], 0.0015, 0.0018, 8));
      hand(side, 'fingerless', dark, jacket);
    }

    for (const side of [1, -1]) { // LEGS: baggy cargo trousers, pocket / holster, knee pads, armoured boots
      const { hp, kn, an } = LEG[side], thighS = thighOf(side);
      add(hp, trouser, tube({ surf: thighS, y0: -0.427, y1: 0.084, capB: 0.062, capT: 0.084, radial: 14, rings: 11 }),
        lineOn(thighS, [[-0.40, side * (PI / 2 + 0.55)], [-0.30, side * (PI / 2 + 0.55)], [-0.18, side * (PI / 2 + 0.55)], [-0.06, side * (PI / 2 + 0.55)]], 0.0015, 0.0014, 8));   // outseam
      if (side > 0) { // LEFT thigh: big cargo pocket with a flap and a button
        add(hp, trouser, wrapOn(cplate(0.090, 0.110, 0.012, 0.010, 0.004), thighS, -0.165, side * (PI / 2 + 0.15), 0.002, 0),
          wrapOn(cplate(0.094, 0.036, 0.006, 0.006, 0.002), thighS, -0.105, side * (PI / 2 + 0.15), 0.012, 0));
        add(hp, dark, wrapOn(slab(0.010, 0.010, 0.003), thighS, -0.108, side * (PI / 2 + 0.15), 0.015));
      } else { // RIGHT thigh: holster straps with buckles, battery pack with a glow line, adjustable wrench
        const strapS = grow(thighS, 0.004);
        add(hp, dark, band(strapS, -0.165, -0.148, 14, undefined, 0.004), band(strapS, -0.245, -0.228, 14, undefined, 0.004));
        add(hp, steel, wrapOn(slab(0.016, 0.022, 0.004), thighS, -0.156, side * (PI / 2 - 0.55), 0.006),
          wrapOn(slab(0.016, 0.022, 0.004), thighS, -0.236, side * (PI / 2 - 0.55), 0.006));
        const fp = frameAt(thighS, -0.200, side * (PI / 2 - 0.30));
        add(hp, dark, onFrame(plate(0.050, 0.104, 0.034, 0.008, 0.005), fp, 0.020), onFrame(place(slab(0.036, 0.020, 0.006), 0, 0.058, 0), fp, 0.030));
        add(hp, armour, onFrame(place(plate(0.040, 0.070, 0.004, 0.004, 0.002), 0, -0.010, 0), fp, 0.039));
        add(hp, glow, onFrame(place(slab(0.004, 0.056, 0.003), -0.014, -0.012, 0), fp, 0.042), onFrame(place(slab(0.020, 0.004, 0.003), -0.006, -0.042, 0), fp, 0.042));
        const fw = frameAt(thighS, -0.130, side * (PI / 2 + 0.05));
        const handle = new THREE.CylinderGeometry(0.0065, 0.0075, 0.150, 7); handle.translate(0, -0.070, 0);
        const headB = plate(0.036, 0.034, 0.012, 0.010, 0.003); headB.translate(0, 0.024, 0);
        const jawA = slab(0.010, 0.026, 0.012); jawA.translate(-0.012, 0.052, 0);
        const jawB = slab(0.010, 0.030, 0.012); jawB.translate(0.013, 0.054, 0);
        const knurl = new THREE.CylinderGeometry(0.008, 0.008, 0.006, 8); knurl.rotateZ(PI / 2); knurl.translate(0, 0.036, 0.008);
        add(hp, steel, onFrame(merge([handle, headB, jawA, jawB, knurl]), fw, 0.010));
      }
      const shinS = shinOf();
      add(kn, trouser, tube({ surf: shinS, y0: -0.214, y1: 0.060, capB: 0.006, capT: 0.060, radial: 14, rings: 11 }));
      add(kn, tank, tube({ prof: [[-0.222, 0.046, 0.048, 0.050], [-0.192, 0.047, 0.049, 0.051]], y0: -0.224, y1: -0.190, capB: 0.004, capT: 0.004, radial: 20, rings: 3, ripple: (y, a) => 0.0015 * Math.cos(a * 16) }));
      { // armoured knee pad: two bevelled plates bent round the knee, rivets, straps
        const kneeS = surfOf({ prof: [[-0.10, 0.062, 0.068, 0.062], [0.0, 0.062, 0.070, 0.062], [0.08, 0.062, 0.068, 0.062]] });
        add(kn, armour, wrapOn(plate(0.076, 0.062, 0.010, 0.010, 0.004), kneeS, 0.016, 0, 0.004),
          wrapOn(plate(0.066, 0.040, 0.008, 0.008, 0.003), kneeS, -0.042, 0, 0.003));
        add(kn, dark, wrapOn(slab(0.080, 0.012, 0.004), kneeS, 0.050, 0, 0.003), wrapOn(slab(0.070, 0.010, 0.004), kneeS, -0.064, 0, 0.002));
        add(kn, steel, ...[[0.036, 0.55], [0.036, -0.55], [-0.002, 0.6], [-0.002, -0.6]].map(([y, a]) => wrapOn(slab(0.005, 0.005, 0.003), kneeS, y, a, 0.010)));
      }
      { // BOOT SHAFT (rigid with the shin): armour shell, front lacing, side plates, top strap with gold buckle
        const shaftS = surfOf({ prof: [[-0.336, 0.052, 0.058, 0.062], [-0.290, 0.051, 0.056, 0.062], [-0.240, 0.052, 0.056, 0.062], [-0.203, 0.054, 0.058, 0.064]] });
        add(kn, armour, tube({ surf: shaftS, y0: -0.336, y1: -0.203, capB: 0.012, capT: 0.006, radial: 14, rings: 6 }),
          wrapOn(cplate(0.044, 0.070, 0.006, 0.008, 0.003), shaftS, -0.268, side * PI / 2, 0.002), wrapOn(cplate(0.044, 0.070, 0.006, 0.008, 0.003), shaftS, -0.268, -side * PI / 2, 0.002));
        const lace = []; for (let i = 0; i <= 7; i++) lace.push([-0.322 + i * 0.015, (i % 2 ? 0.20 : -0.20)]);
        add(kn, dark, lineOn(shaftS, lace, 0.002, 0.0028, 14), band(grow(shaftS, 0.003), -0.224, -0.208, 14, undefined, 0.004),
          wrapOn(slab(0.030, 0.050, 0.004), shaftS, -0.300, PI, 0.002));
        add(kn, gold, wrapOn(slab(0.014, 0.018, 0.005), shaftS, -0.216, side * (PI / 2 - 0.3), 0.006),
          ...[[-0.245, 0.65], [-0.245, -0.65], [-0.292, 0.65], [-0.292, -0.65]].map(([y, a]) => wrapOn(slab(0.006, 0.006, 0.003), shaftS, y, side * PI / 2 + a, 0.009)));
      }
      // BOOT FOOT: chunky bevelled soles with a glow layer, armoured upper, buckle straps, gold heel vents
      const out = soleExt(side, 1.07, 0.018, 0, -0.057), glowL = soleExt(side, 1.085, 0.0065, 0, -0.0505), mid = soleExt(side, 1.075, 0.020, 0.004, -0.031);
      { const p = mid.attributes.position; for (let i = 0; i < p.count; i++) if (p.getY(i) > -0.045) p.setY(i, p.getY(i) + 0.010 * (1 - sstep(-0.06, 0.07, p.getZ(i)))); }
      add(an, soleM, spring(out));
      add(an, glow, spring(glowL));
      const lugs = [];
      for (const [z, w] of [[-0.050, 0.052], [0.076, 0.080], [0.108, 0.084], [0.144, 0.070]]) lugs.push(place(new THREE.BoxGeometry(w, 0.004, 0.015), side * 0.002, -0.0745, z));
      const upProf = upProfOf(side);
      const upper = lay(tube({ prof: upProf, y0: -0.074, y1: 0.190, capB: 0.018, capT: 0.036, radial: 10, rings: 10, sq: 0.78 }));
      const toe = place(ell(0.046, 0.024, 0.052, 8, 5), side * -0.002, -0.040, 0.140, 0.12, 0, 0);
      { const p = toe.attributes.position; for (let i = 0; i < p.count; i++) if (p.getY(i) < -0.046) p.setY(i, -0.046); toe.computeVertexNormals(); }
      add(an, armour, spring(mid), spring(upper), ...lugs.map(spring), ell(0.042, 0.040, 0.044, 8, 5));
      add(an, soleM, spring(toe));
      const straps = [], buckles = [];
      for (const z of [0.052, 0.092]) {
        const h = evalProf(norm(upProf), z)[2] - 0.038;
        straps.push(place(new THREE.TorusGeometry(0.046, 0.0045, 5, 14, PI), 0, h - 0.052, z, PI / 2, 0, 0));
        buckles.push(place(slab(0.012, 0.016, 0.005), side * 0.049, h - 0.060, z, 0, side * PI / 2, 0));
      }
      add(an, dark, ...straps.map(spring), place(slab(0.046, 0.030, 0.004), 0, -0.020, -0.078, 0, PI, 0));
      add(an, gold, ...buckles, ...[-1, 1].map((s) => place(new THREE.CylinderGeometry(0.010, 0.011, 0.020, 9), s * 0.019, -0.030, -0.082, PI / 2, 0, 0)));
      add(an, pupil, ...[-1, 1].map((s) => place(new THREE.CylinderGeometry(0.006, 0.006, 0.004, 9), s * 0.019, -0.030, -0.091, PI / 2, 0, 0)));
      add(an, glow, place(ell(0.004, 0.015, 0.015, 6, 4), side * 0.046, 0.000, -0.012), place(ell(0.003, 0.006, 0.030, 5, 4), side * 0.041, -0.036, 0.06));
    }
  }

  /* ================================================================ OUTFIT 2: Street Oni (hoodie, chest rig, shorts over leggings, sneakers, sling bag) */
  function outfitStreet() {
    const hoodieS = grow(bodyS, 0.024, 0.022, 0.026, {
      sq: 0.9,
      bulges: [{ y: 0.115, h: 0.07, a: PI - 0.5, w: 0.36, amp: 0.006 }, { y: 0.115, h: 0.07, a: PI + 0.5, w: 0.36, amp: 0.006 }, { y: 0.03, h: 0.14, a: PI, w: 0.2, amp: -0.004 },
        { y: -0.10, h: 0.06, a: 0.0, w: 0.9, amp: 0.004 }],
      ripple: (y, a) => 0.0030 * (1 - sstep(0.15, 0.22, y)) * sstep(-0.19, -0.12, y) * Math.sin(y * 70 + Math.sin(a * 2) * 2.2 + a * 3.0)
        + 0.0018 * sstep(-0.19, -0.05, y) * (1 - sstep(0.0, 0.05, y)) * Math.sin(a * 7 + y * 40),
    });
    // hips: cargo shorts seat (baggy), belt, back pockets; the hoodie hem band overlaps the waist
    const seatS = grow(pelvisS, 0.006, 0.004, 0.008);
    add(hips, base2, tube({ surf: seatS, y0: -0.150, y1: 0.075, capB: 0.085, capT: 0.02, radial: 16, rings: 8 }),
      ...[-1, 1].map((s) => wrapOn(cplate(0.072, 0.070, 0.004, 0.012, 0.0025), seatS, -0.035, PI + s * 0.52, 0.0015, s * 0.06)),
      ...[-1, 1].map((s) => wrapOn(cplate(0.074, 0.016, 0.004, 0.004, 0.0015), seatS, 0.000, PI + s * 0.52, 0.004, s * 0.06)),   // pocket flaps
      band(grow(seatS, 0.003), 0.048, 0.074, 18, undefined, 0.004));
    add(hips, dark, band(grow(seatS, 0.008), 0.014, 0.044, 18), ...[0.55, -0.55, PI - 0.7, PI + 0.7].map((a) => wrapOn(slab(0.012, 0.038, 0.003), seatS, 0.030, a, 0.010)));
    add(hips, steel, onFrame(plate(0.040, 0.028, 0.004, 0.004, 0.002), frameAt(seatS, 0.029, 0.0), 0.011));
    // spine: hoodie lower half + ribbed hem band (double-walled: outer band + inner return)
    add(spine, prim, place(tube({ surf: hoodieS, y0: -0.215, y1: 0.06, capB: 0.004, capT: 0.015, radial: 20, rings: 9 }), 0, SP, 0),
      place(band(grow(hoodieS, 0.003), -0.215, -0.185, 20, undefined, 0.004), 0, SP, 0),
      place(tube({ surf: grow(bodyS, 0.016), y0: -0.214, y1: -0.190, capB: 0.001, capT: 0.001, radial: 18, rings: 3 }), 0, SP, 0));
    add(spine, dark, place(lineOn(hoodieS, [...Array(21)].map((_, i) => [-0.200, -PI + i * (2 * PI / 20)]), 0.002, 0.0016, 24), 0, SP, 0),
      place(lineOn(hoodieS, [...Array(21)].map((_, i) => [-0.186, -PI + i * (2 * PI / 20)]), 0.002, 0.0016, 24), 0, SP, 0));   // hem stitching
    // kangaroo pocket: a thick plate on the belly with two angled hand openings, spanning the spine / chest split (on spine, top edge tucks under the chest piece)
    add(spine, prim, place(wrapOn(cplate(0.170, 0.085, 0.010, 0.012, 0.004), hoodieS, -0.135, 0, 0.002), 0, SP, 0));
    add(spine, dark, ...[-1, 1].map((s) => place(lineOn(hoodieS, [[-0.170, s * 0.62], [-0.130, s * 0.66], [-0.100, s * 0.70]], 0.012, 0.0022, 8), 0, SP, 0)));
    // chest: hoodie upper, raglan seams, chest rig, sling strap, hood cowl
    add(chest, prim, tube({ surf: hoodieS, y0: -0.06, y1: 0.255, capB: 0.012, capT: 0.014, radial: 20, rings: 12 }),
      lineOn(hoodieS, [[0.25, 0.0], [0.20, 0.55], [0.17, 1.0], [0.165, 1.5]], 0.0015, 0.0016, 8), lineOn(hoodieS, [[0.25, 0.0], [0.20, -0.55], [0.17, -1.0], [0.165, -1.5]], 0.0015, 0.0016, 8),   // raglan seams
      lineOn(hoodieS, [[-0.05, PI], [0.02, PI], [0.10, PI], [0.18, PI]], 0.0015, 0.0016, 8));
    { // hood: cowl on the shoulders (chest), the hood itself over the head (head joint) with the horns pushing through
      const cowlS = surfOf({ prof: [[0.170, 0.150, 0.100, 0.118, 0, -0.012], [0.215, 0.120, 0.086, 0.110, 0, -0.016], [0.250, 0.098, 0.074, 0.100, 0, -0.020], [0.280, 0.088, 0.070, 0.092, 0, -0.024]],
        ripple: (y, a) => 0.0025 * Math.sin(a * 5 + y * 40) });
      add(chest, prim, tube({ surf: cowlS, y0: 0.170, y1: 0.280, capB: 0.004, capT: 0.006, radial: 20, rings: 6, amap: openFront(0.55) }));
      // drawstrings hanging from the neckline with metal aglets
      for (const s of [-1, 1]) {
        add(chest, dark, seam([[s * 0.030, 0.240, 0.108], [s * 0.034, 0.200, 0.116], [s * 0.037, 0.150, 0.120], [s * 0.040, 0.105, 0.121]], 0.0022, 8));
        add(chest, steel, place(new THREE.CylinderGeometry(0.0028, 0.0028, 0.016, 6), s * 0.040, 0.097, 0.121));
      }
      const hoodS = surfOf({
        prof: [[-0.010, 0.070, 0.070, 0.088, 0, -0.006], [0.030, 0.088, 0.094, 0.112, 0, -0.008], [0.080, 0.100, 0.105, 0.128, 0, -0.010], [0.130, 0.098, 0.103, 0.124, 0, -0.012],
          [0.175, 0.080, 0.092, 0.100, 0, -0.006], [0.205, 0.055, 0.066, 0.070, 0, -0.008], [0.222, 0.030, 0.040, 0.040, 0, -0.012]],
        ripple: (y, a) => 0.0035 * Math.sin(a * 6 + y * 45) * (0.4 + 0.6 * sstep(0.0, 0.06, y)),
        bulges: [{ y: 0.10, h: 0.06, a: PI, w: 0.8, amp: 0.006 }, { y: 0.16, h: 0.03, a: PI - 0.9, w: 0.5, amp: -0.005 }, { y: 0.16, h: 0.03, a: PI + 0.9, w: 0.5, amp: -0.005 }, { y: 0.05, h: 0.04, a: PI, w: 0.3, amp: -0.004 },
          { y: 0.07, h: 0.025, a: PI - 0.55, w: 0.28, amp: 0.006 }, { y: 0.07, h: 0.025, a: PI + 0.55, w: 0.28, amp: 0.006 }, { y: 0.13, h: 0.02, a: PI - 0.35, w: 0.25, amp: 0.005 }, { y: 0.13, h: 0.02, a: PI + 0.35, w: 0.25, amp: 0.005 }, { y: 0.04, h: 0.02, a: PI, w: 0.5, amp: 0.005 }],   // cloth folds where the hood bunches
      });
      const hoodGap = (y) => 1.05 - 0.60 * sstep(0.08, 0.19, y) + 0.05 * (1 - sstep(-0.01, 0.05, y));
      add(head, prim, tube({ surf: hoodS, y0: -0.012, y1: 0.224, capB: 0.004, capT: 0.020, radial: 22, rings: 12, amap: openFront(hoodGap) }),
        tube({ surf: grow(hoodS, -0.010), y0: -0.006, y1: 0.20, capB: 0.002, capT: 0.010, radial: 20, rings: 6, amap: openFront((y) => hoodGap(y) - 0.02) }));   // inner wall (the hood has thickness)
      const edge = []; for (let i = 0; i <= 12; i++) { const y = -0.010 + i * (0.232 / 12); edge.push([y, -hoodGap(y)]); } for (let i = 11; i >= 0; i--) { const y = -0.010 + i * (0.232 / 12); edge.push([y, hoodGap(y)]); }
      add(head, prim, lineOn(hoodS, edge, 0.002, 0.005, 26));
      add(head, dark, lineOn(hoodS, [[0.05, PI], [0.10, PI], [0.15, PI], [0.20, PI]], 0.002, 0.0018, 8),   // centre seam
        ...[-1, 1].map((s) => lineOn(hoodS, [[0.02, PI + s * 0.9], [0.09, PI + s * 0.75], [0.16, PI + s * 0.55], [0.205, PI + s * 0.3]], 0.002, 0.0016, 8)));   // side panel seams
    }
    { // chest rig: two shoulder straps, a horizontal chest strap, three pouches with flaps and buckles, a small radio
      const rigS = grow(hoodieS, 0.004);
      for (const s of [-1, 1]) {
        add(chest, dark, lineOn(rigS, [[0.24, s * 0.30], [0.19, s * 0.36], [0.12, s * 0.40], [0.04, s * 0.42], [-0.04, s * 0.42]], 0.002, 0.0055, 10),
          lineOn(rigS, [[0.24, s * 0.30], [0.22, s * 0.80], [0.19, PI - s * 1.6], [0.14, PI - s * 0.9], [0.10, PI - s * 0.3]], 0.002, 0.0055, 12));   // over the shoulder to the back
      }
      add(chest, dark, band(rigS, 0.030, 0.052, 20), band(rigS, 0.118, 0.132, 20));
      add(chest, dark, ...[-0.58, 0, 0.58].map((a) => wrapOn(plate(0.046, 0.052, 0.020, 0.006, 0.004), rigS, 0.075, a, 0.012)),
        ...[-0.58, 0, 0.58].map((a) => wrapOn(plate(0.050, 0.020, 0.004, 0.004, 0.002), rigS, 0.096, a, 0.024)));
      add(chest, steel, ...[-0.58, 0, 0.58].map((a) => wrapOn(slab(0.010, 0.008, 0.004), rigS, 0.088, a, 0.026)),
        ...[-1, 1].map((s) => wrapOn(slab(0.016, 0.016, 0.004), rigS, 0.041, s * 0.42, 0.006)));
      add(chest, accent, wrapOn(slab(0.018, 0.004, 0.003), rigS, 0.125, PI - 0.9, 0.004));   // reflective tab on the back strap
    }
    { // sling bag: strap from the left shoulder across the chest to the right hip, bag on the lower back
      const bagS = grow(hoodieS, 0.006);
      add(chest, dark, lineOn(bagS, [[0.235, 0.62], [0.16, 0.30], [0.08, -0.05], [0.0, -0.35], [-0.055, -0.55]], 0.002, 0.006, 12),
        lineOn(bagS, [[0.235, 0.62], [0.18, 1.6], [0.10, 2.3], [0.02, 2.75], [-0.055, 2.95]], 0.002, 0.006, 12));
      add(chest, steel, wrapOn(slab(0.020, 0.014, 0.005), bagS, 0.085, -0.05, 0.007));   // strap slider
      const fb = frameAt(bagS, -0.03, PI + 0.55);
      add(chest, dark, onFrame(plate(0.120, 0.090, 0.050, 0.014, 0.006), fb, 0.026), onFrame(place(plate(0.124, 0.040, 0.008, 0.008, 0.003), 0, 0.030, 0), fb, 0.052));
      add(chest, steel, onFrame(place(slab(0.014, 0.012, 0.004), 0, 0.006, 0), fb, 0.055));
      add(chest, prim, onFrame(place(plate(0.030, 0.014, 0.002, 0.004, 0.001), 0.030, -0.024, 0), fb, 0.052));   // tag
    }
    hair('fringe'); mask(true);
    horn(0.072, 0.116, 0.038, 1.0, 0.72, -0.26); horn(-0.072, 0.116, 0.038, 1.0, 0.72, -0.26);

    for (const side of [1, -1]) { // ARMS: heavy hoodie sleeves down to the wrist, ribbed cuffs, bare hands
      const { sh, el } = ARM[side], sleeveS = sleeveOf(side, 1.16);
      const hs = surfOf(Object.assign({}, sleeveS.o, { ripple: (y, a) => elbowFold(-0.25, -0.16)(y, a) * 1.4 + 0.0016 * Math.sin(a * 5 + y * 60) }));
      add(sh, prim, tube({ surf: hs, y0: -0.298, y1: 0.058, capB: 0.043, capT: 0.058, radial: 12, rings: 10 }),
        lineOn(hs, [[-0.290, side * (PI / 2 + 0.35)], [-0.20, side * (PI / 2 + 0.35)], [-0.10, side * (PI / 2 + 0.35)], [-0.03, side * (PI / 2 + 0.4)]], 0.0015, 0.0014, 8));
      add(sh, accent, lineOn(hs, [[-0.16, side * PI / 2], [-0.12, side * PI / 2], [-0.08, side * PI / 2]], 0.003, 0.0022, 6));   // small reflective tab on the upper arm
      const foreS = foreOf(1.14);
      add(el, prim, tube({ surf: surfOf(Object.assign({}, foreS.o, { ripple: (y, a) => elbowFold(-0.10, -0.01)(y, a) + 0.0015 * Math.sin(a * 5 + y * 60) })), y0: -0.222, y1: 0.0425, capB: 0.008, capT: 0.0425, radial: 12, rings: 8 }));
      add(el, dark, tube({ prof: [[-0.262, 0.030, 0.032], [-0.216, 0.036, 0.038]], y0: -0.264, y1: -0.214, capB: 0.006, capT: 0.004, radial: 16, rings: 3, ripple: (y, a) => 0.0007 * Math.cos(a * 16) }));
      hand(side, 'bare');
    }
    for (const side of [1, -1]) { // LEGS: leggings, cargo shorts over them, chunky sneakers
      const { hp, kn, an } = LEG[side], legS = thighOf(side, 0.94), shortS = grow(thighOf(side, 1.0), 0.012, 0.014, 0.016, {
        ripple: (y, a) => 0.0032 * sstep(-0.31, -0.27, y) * (1 - sstep(-0.12, -0.06, y)) * Math.sin(y * 80 + a * 3 + Math.sin(a) * 1.5) });
      add(hp, base2, tube({ surf: legS, y0: -0.427, y1: 0.084, capB: 0.062, capT: 0.084, radial: 14, rings: 10 }));
      const shorts = tube({ surf: shortS, y0: -0.300, y1: 0.084, capB: 0.004, capT: 0.084, radial: 16, rings: 9 });
      add(hp, base2, shorts, band(grow(shortS, 0.003), -0.300, -0.282, 16, undefined, 0.004),
        lineOn(shortS, [[-0.29, side * (PI / 2 + 0.55)], [-0.20, side * (PI / 2 + 0.55)], [-0.10, side * (PI / 2 + 0.55)], [-0.02, side * (PI / 2 + 0.55)]], 0.0015, 0.0016, 8),
        wrapOn(cplate(0.080, 0.090, 0.012, 0.010, 0.004), shortS, -0.200, side * (PI / 2 + 0.25), 0.002),
        wrapOn(cplate(0.084, 0.032, 0.006, 0.006, 0.002), shortS, -0.150, side * (PI / 2 + 0.25), 0.012));
      add(hp, dark, wrapOn(slab(0.012, 0.010, 0.003), shortS, -0.152, side * (PI / 2 + 0.25), 0.017), band(grow(legS, 0.002), -0.34, -0.325, 14, undefined, 0.003));   // pocket button, legging seam band above the knee
      const shinS = shinOf(0.92);
      add(kn, base2, tube({ surf: shinS, y0: -0.214, y1: 0.060, capB: 0.006, capT: 0.060, radial: 14, rings: 10 }),
        lineOn(shinS, [[-0.20, side * (PI / 2 + 0.3)], [-0.12, side * (PI / 2 + 0.3)], [-0.04, side * (PI / 2 + 0.3)]], 0.0015, 0.0014, 6));
      add(kn, dark, tube({ prof: [[-0.236, 0.048, 0.050, 0.052], [-0.200, 0.049, 0.051, 0.053]], y0: -0.238, y1: -0.198, capB: 0.004, capT: 0.004, radial: 18, rings: 3, ripple: (y, a) => 0.0012 * Math.cos(a * 18) }));   // sock
      add(kn, accent, band(grow(shinS, 0.0025), -0.226, -0.219, 16, undefined, 0.003));   // reflective sock stripe
      // SNEAKER: thick bevelled midsole (white), outsole, upper with toe cap, tongue, lace zigzag, heel tab, side panel
      const out = soleExt(side, 1.10, 0.014, 0, -0.061), mid = soleExt(side, 1.13, 0.034, 0.006, -0.027);
      { const p = mid.attributes.position; for (let i = 0; i < p.count; i++) if (p.getY(i) > -0.045) p.setY(i, p.getY(i) + 0.006 * (1 - sstep(-0.06, 0.07, p.getZ(i)))); }
      add(an, soleM, spring(out), ...[[-0.050, 0.052], [0.030, 0.076], [0.076, 0.082], [0.120, 0.082], [0.152, 0.062]].map(([z, w]) => spring(place(new THREE.BoxGeometry(w, 0.004, 0.012), side * 0.002, -0.0745, z))));
      add(an, white, spring(mid));
      const upProf = upProfOf(side, 0.96);
      const upper = lay(tube({ prof: upProf, y0: -0.074, y1: 0.190, capB: 0.018, capT: 0.036, radial: 10, rings: 10, sq: 0.8 }));
      add(an, prim, spring(upper), ell(0.040, 0.040, 0.042, 8, 5));
      const toe = place(ell(0.044, 0.022, 0.050, 8, 5), side * -0.002, -0.040, 0.142, 0.12, 0, 0);
      { const p = toe.attributes.position; for (let i = 0; i < p.count; i++) if (p.getY(i) < -0.046) p.setY(i, -0.046); toe.computeVertexNormals(); }
      add(an, white, spring(toe), spring(place(plate(0.040, 0.052, 0.003, 0.010, 0.0015), side * 0.049, -0.006, 0.030, 0, side * PI / 2, 0)),   // side panel
        spring(place(slab(0.030, 0.026, 0.004), 0, -0.006, -0.079, 0, PI, 0)));                                                             // heel counter
      add(an, dark, spring(place(slab(0.014, 0.020, 0.004), 0, 0.022, -0.072, 0.3, 0, 0)));                                                  // heel tab
      const lace = []; for (let i = 0; i <= 6; i++) { const z = 0.045 + i * 0.013, h = evalProf(norm(upProf), z)[2] - 0.038 + 0.004; lace.push([(i % 2 ? 0.020 : -0.020) * side, h - 0.050, z]); }
      add(an, dark, spring(seam(lace, 0.0024, 14)));
      add(an, prim, spring(place(plate(0.036, 0.070, 0.004, 0.010, 0.002), 0, 0.034, 0.066, -0.9, 0, 0)));                                  // tongue
      add(an, accent, spring(place(slab(0.006, 0.006, 0.020), side * 0.046, -0.020, 0.020)));                                               // reflective heel tab
    }
  }

  /* ================================================================ OUTFIT 3: Rider (armoured moto jacket, horned half-helmet, spine protector, riding trousers, tall boots) */
  function outfitRider() {
    const jkS = grow(bodyS, 0.016, 0.015, 0.017, {
      sq: 0.9,
      bulges: [{ y: 0.115, h: 0.07, a: PI - 0.5, w: 0.36, amp: 0.006 }, { y: 0.115, h: 0.07, a: PI + 0.5, w: 0.36, amp: 0.006 }, { y: 0.03, h: 0.12, a: PI, w: 0.16, amp: -0.004 }],
      ripple: (y, a) => 0.0014 * sstep(-0.19, -0.16, y) * (1 - sstep(-0.10, -0.06, y)) * Math.sin(y * 120 + a * 2.5),   // waist creases
    });
    // hips: riding trousers seat (fitted), hip armour pads, belt with a metal buckle
    const seatS = grow(pelvisS, -0.006, -0.004, -0.010, { ripple: undefined });
    add(hips, base2, tube({ surf: seatS, y0: -0.150, y1: 0.075, capB: 0.085, capT: 0.02, radial: 16, rings: 8 }),
      band(grow(seatS, 0.003), 0.048, 0.074, 18, undefined, 0.004),
      lineOn(seatS, [[-0.145, PI], [-0.09, PI], [-0.03, PI], [0.045, PI]], 0.002, 0.0015, 8));
    add(hips, armour, ...[-1, 1].map((s) => wrapOn(cplate(0.050, 0.070, 0.008, 0.012, 0.004), seatS, -0.040, s * 1.55, 0.002, s * 0.15)));   // hip pads
    add(hips, dark, band(grow(seatS, 0.008), 0.012, 0.044, 18), ...[0.55, -0.55, PI - 0.7, PI + 0.7].map((a) => wrapOn(slab(0.012, 0.038, 0.003), seatS, 0.030, a, 0.010)));
    add(hips, steel, onFrame(plate(0.044, 0.030, 0.005, 0.006, 0.002), frameAt(seatS, 0.029, 0.0), 0.011));
    // spine: jacket lower half with the waist band and the lower spine protector segments
    add(spine, prim, place(tube({ surf: jkS, y0: -0.195, y1: 0.06, capB: 0.004, capT: 0.015, radial: 20, rings: 8 }), 0, SP, 0),
      place(band(grow(jkS, 0.003), -0.195, -0.170, 20, undefined, 0.004), 0, SP, 0),
      place(tube({ surf: grow(bodyS, 0.010), y0: -0.194, y1: -0.172, capB: 0.001, capT: 0.001, radial: 18, rings: 3 }), 0, SP, 0));   // hem inner wall
    add(spine, dark, place(lineOn(jkS, [...Array(21)].map((_, i) => [-0.168, -PI + i * (2 * PI / 20)]), 0.002, 0.0016, 24), 0, SP, 0));
    add(spine, armour, ...[-0.155, -0.105].map((y) => place(wrapOn(cplate(0.060, 0.040, 0.010, 0.010, 0.004), jkS, y, PI, 0.003), 0, SP, 0)));
    // chest: jacket upper, centre zip, chest armour plates, upper spine protector, collar
    add(chest, prim, tube({ surf: jkS, y0: -0.06, y1: 0.245, capB: 0.012, capT: 0.014, radial: 20, rings: 12,
      ripple: undefined }),
      ...[-1, 1].map((s) => lineOn(jkS, [[-0.05, s * 1.62], [0.04, s * 1.62], [0.12, s * 1.60], [0.19, s * 1.58]], 0.0015, 0.0016, 8)),           // side seams
      ...[-1, 1].map((s) => lineOn(jkS, [[0.24, s * 0.45], [0.17, s * 0.55], [0.08, s * 0.50], [-0.05, s * 0.46]], 0.0015, 0.0016, 8)));       // princess seams
    add(chest, steel, lineOn(jkS, [[-0.06, 0], [0.02, 0], [0.10, 0], [0.18, 0], [0.245, 0]], 0.003, 0.0022, 10), wrapOn(slab(0.008, 0.016, 0.003), jkS, 0.215, 0, 0.006));   // zip + pull
    add(chest, armour, ...[-1, 1].map((s) => wrapOn(cplate(0.062, 0.070, 0.008, 0.012, 0.004), jkS, 0.115, s * 0.46, 0.002, s * 0.12)),                       // chest plates
      ...[0.205, 0.155, 0.105, 0.050, -0.005].map((y, i) => wrapOn(cplate(0.060 - i * 0.002, 0.040, 0.010, 0.010, 0.004), jkS, y, PI, 0.003)));           // spine protector
    add(chest, accent, ...[0.205, 0.155, 0.105, 0.050, -0.005].map((y) => wrapOn(slab(0.004, 0.024, 0.003), jkS, y, PI, 0.013)));                        // accent line down the spine
    { // stand collar with a padded roll
      const collarS = surfOf({ prof: [[0.240, 0.086, 0.076, 0.086, 0, -0.010], [0.270, 0.080, 0.072, 0.082, 0, -0.012], [0.296, 0.084, 0.076, 0.086, 0, -0.012]] });
      add(chest, prim, tube({ surf: collarS, y0: 0.240, y1: 0.296, capB: 0.003, capT: 0.010, radial: 20, rings: 5, amap: openFront(0.30) }));
      add(chest, dark, lineOn(collarS, [...Array(13)].map((_, i) => [0.292, 0.30 + i * ((2 * PI - 0.6) / 12)]), 0.002, 0.0035, 16));
    }
    { // HALF-HELMET integrated with the mask: hard shell over the skull, brow visor, rim, horns on the temples, nape strands
      const helmS = grow(hairS, 0.006, 0.004, 0.006, { ripple: undefined, bulges: [{ y: 0.14, h: 0.05, a: PI, w: 0.6, amp: 0.004 }] });
      const helmEdge = (a0) => { const a = Math.abs(a0); return 0.118 - 0.010 * Math.max(0, Math.cos(a0)) - 0.062 * sstep(1.30, 2.9, a); };
      add(head, maskM, tube({ surf: helmS, y0: 0.04, y1: 0.200, capB: 0.006, capT: 0.05, radial: 22, rings: 10, ymap: stretchFrom(helmEdge, 0.04, 0.200) }));
      const rim = []; for (let i = 0; i <= 24; i++) { const a = -PI + i * (2 * PI / 24); rim.push([helmEdge(a) + 0.002, a]); }
      add(head, dark, lineOn(helmS, rim, 0.002, 0.0045, 26), lineOn(helmS, [[0.120, 0], [0.150, 0], [0.180, 0], [0.198, 0], [0.190, PI - 0.4], [0.160, PI], [0.120, PI]], 0.002, 0.0025, 12));   // rim + crest seam
      add(head, armour, wrapOn(cplate(0.090, 0.020, 0.008, 0.006, 0.002), helmS, 0.110, 0, 0.006, 0),                                  // brow visor lip
        ...[-1, 1].map((s) => wrapOn(cplate(0.036, 0.030, 0.005, 0.008, 0.002), helmS, 0.075, s * 1.55, 0.002)));                        // ear covers
      add(head, accent, ...[-1, 1].map((s) => wrapOn(slab(0.020, 0.004, 0.003), helmS, 0.082, s * 1.55, 0.010)));                       // ear accents
      hair('nape');
    }
    mask(false);
    horn(0.080, 0.130, 0.030, 1.05, 0.80, -0.30); horn(-0.080, 0.130, 0.030, 1.05, 0.80, -0.30);

    for (const side of [1, -1]) { // ARMS: leather sleeves with quilted panels, hard shoulder + elbow pads, armoured gloves
      const { sh, el } = ARM[side], sleeveS = sleeveOf(side, 1.06);
      const qs = surfOf(Object.assign({}, sleeveS.o, { ripple: (y, a) => elbowFold(-0.25, -0.16)(y, a) * 0.8 + 0.0010 * Math.sin(y * 160) * (0.5 + 0.5 * Math.cos(a - side * PI / 2)) * sstep(-0.16, -0.12, y) * (1 - sstep(-0.05, -0.02, y)) }));
      add(sh, prim, tube({ surf: qs, y0: -0.298, y1: 0.058, capB: 0.043, capT: 0.058, radial: 12, rings: 10 }),
        lineOn(qs, [[-0.290, side * (PI / 2 + 0.35)], [-0.20, side * (PI / 2 + 0.35)], [-0.10, side * (PI / 2 + 0.35)], [-0.03, side * (PI / 2 + 0.4)]], 0.0015, 0.0014, 8));
      const capS = grow(sleeveS, 0.004);
      add(sh, armour, wrapOn(cplate(0.070, 0.062, 0.010, 0.014, 0.004), capS, -0.035, side * PI / 2, 0.003),                         // shoulder cup
        wrapOn(cplate(0.060, 0.028, 0.006, 0.008, 0.003), capS, -0.078, side * PI / 2, 0.002));                                       // second lame
      add(sh, dark, band(capS, -0.050, -0.040, 12), band(capS, -0.092, -0.084, 12), ell(0.060, 0.060, 0.060, 10, 6).translate(0, 0.006, 0));   // straps + ball under the cup
      add(sh, accent, wrapOn(slab(0.026, 0.004, 0.003), capS, -0.062, side * PI / 2, 0.011));                                        // pad accent
      const foreS = foreOf(1.06);
      add(el, prim, tube({ surf: foreS, y0: -0.225, y1: 0.0425, capB: 0.008, capT: 0.0425, radial: 12, rings: 8 }));
      add(el, armour, wrapOn(cplate(0.050, 0.060, 0.010, 0.012, 0.004), grow(foreS, 0.003), -0.030, PI, 0.003),                       // elbow cup (back of the elbow)
        wrapOn(cplate(0.036, 0.050, 0.006, 0.008, 0.002), grow(foreS, 0.002), -0.130, side * PI / 2, 0.002));                          // forearm guard
      add(el, dark, band(grow(foreS, 0.003), -0.078, -0.068, 12), tube({ prof: [[-0.262, 0.030, 0.032], [-0.222, 0.036, 0.038]], y0: -0.264, y1: -0.220, capB: 0.006, capT: 0.004, radial: 14, rings: 3 }));
      add(el, steel, wrapOn(slab(0.010, 0.010, 0.004), foreS, -0.240, side * PI / 2, 0.006));   // cuff zip pull
      hand(side, 'glove', dark, prim);
    }
    for (const side of [1, -1]) { // LEGS: fitted riding trousers with stretch panels, knee sliders, tall boots with exhaust vents
      const { hp, kn, an } = LEG[side];
      const thighS = surfOf(Object.assign({}, thighOf(side, 0.97).o, { ripple: (y, a) => 0.0016 * sstep(-0.42, -0.36, y) * (1 - sstep(-0.24, -0.18, y)) * Math.sin(y * 140) * (0.5 + 0.5 * Math.cos(a - PI)) }));
      add(hp, base2, tube({ surf: thighS, y0: -0.427, y1: 0.084, capB: 0.062, capT: 0.084, radial: 14, rings: 11 }),
        lineOn(thighS, [[-0.40, side * (PI / 2 + 0.55)], [-0.30, side * (PI / 2 + 0.55)], [-0.18, side * (PI / 2 + 0.55)], [-0.06, side * (PI / 2 + 0.55)]], 0.0015, 0.0014, 8));
      add(hp, armour, wrapOn(cplate(0.050, 0.080, 0.008, 0.010, 0.003), thighS, -0.200, side * (PI / 2 + 0.35), 0.002));   // thigh armour
      add(hp, dark, wrapOn(cplate(0.044, 0.120, 0.004, 0.006, 0.0015), thighS, -0.300, side * (PI / 2 + 0.7), 0.001));    // stretch panel (dark)
      const shinS = shinOf(0.94);
      add(kn, base2, tube({ surf: shinS, y0: -0.214, y1: 0.060, capB: 0.006, capT: 0.060, radial: 14, rings: 10 }));
      { // knee: armoured cup + a round slider puck on the outside
        const kneeS = surfOf({ prof: [[-0.10, 0.062, 0.068, 0.062], [0.0, 0.062, 0.070, 0.062], [0.08, 0.062, 0.068, 0.062]] });
        add(kn, armour, wrapOn(cplate(0.074, 0.070, 0.010, 0.012, 0.004), kneeS, 0.010, 0, 0.002), wrapOn(cplate(0.060, 0.036, 0.008, 0.008, 0.003), kneeS, -0.046, 0, 0.002));
        const fs = frameAt(kneeS, 0.000, side * (PI / 2 + 0.25));
        add(kn, white, onFrame(new THREE.CylinderGeometry(0.026, 0.028, 0.012, 12).rotateX(PI / 2), fs, 0.010));   // slider puck
        add(kn, steel, onFrame(new THREE.CylinderGeometry(0.004, 0.004, 0.004, 6).rotateX(PI / 2), fs, 0.017));
        add(kn, dark, wrapOn(slab(0.080, 0.012, 0.004), kneeS, 0.050, 0, 0.003), wrapOn(slab(0.070, 0.010, 0.004), kneeS, -0.068, 0, 0.002));
      }
      { // TALL BOOT SHAFT to just under the knee: shin plate, calf zip, two buckle straps, ankle armour
        const shaftS = surfOf({ prof: [[-0.336, 0.052, 0.058, 0.062], [-0.280, 0.054, 0.058, 0.066], [-0.200, 0.058, 0.060, 0.072], [-0.120, 0.062, 0.062, 0.076], [-0.085, 0.060, 0.060, 0.070]] });
        add(kn, dark, tube({ surf: shaftS, y0: -0.336, y1: -0.085, capB: 0.012, capT: 0.006, radial: 16, rings: 8 }),
          band(grow(shaftS, 0.003), -0.100, -0.086, 16, undefined, 0.004));
        add(kn, armour, wrapOn(cplate(0.050, 0.150, 0.008, 0.010, 0.004), shaftS, -0.200, 0, 0.002),                                   // shin plate
          wrapOn(cplate(0.030, 0.040, 0.006, 0.006, 0.003), shaftS, -0.300, side * PI / 2, 0.002),
          wrapOn(cplate(0.030, 0.040, 0.006, 0.006, 0.003), shaftS, -0.300, -side * PI / 2, 0.002));
        add(kn, dark, band(grow(shaftS, 0.004), -0.150, -0.136, 16, undefined, 0.004), band(grow(shaftS, 0.004), -0.250, -0.236, 16, undefined, 0.004));
        add(kn, steel, wrapOn(slab(0.014, 0.018, 0.005), shaftS, -0.143, side * (PI / 2 - 0.3), 0.007), wrapOn(slab(0.014, 0.018, 0.005), shaftS, -0.243, side * (PI / 2 - 0.3), 0.007),
          lineOn(shaftS, [[-0.330, PI - side * 0.35], [-0.250, PI - side * 0.35], [-0.170, PI - side * 0.35], [-0.100, PI - side * 0.35]], 0.003, 0.0015, 8));   // calf zip
      }
      // BOOT FOOT: soles, upper, toe slider, heel cup, and the EXHAUST VENTS: two pipes behind the heel with glowing mouths
      const out = soleExt(side, 1.07, 0.018, 0, -0.057), mid = soleExt(side, 1.075, 0.020, 0.004, -0.031);
      { const p = mid.attributes.position; for (let i = 0; i < p.count; i++) if (p.getY(i) > -0.045) p.setY(i, p.getY(i) + 0.010 * (1 - sstep(-0.06, 0.07, p.getZ(i)))); }
      add(an, soleM, spring(out), ...[[-0.050, 0.052], [0.076, 0.080], [0.108, 0.084], [0.144, 0.070]].map(([z, w]) => spring(place(new THREE.BoxGeometry(w, 0.004, 0.015), side * 0.002, -0.0745, z))));
      const upProf = upProfOf(side);
      const upper = lay(tube({ prof: upProf, y0: -0.074, y1: 0.190, capB: 0.018, capT: 0.036, radial: 10, rings: 10, sq: 0.78 }));
      add(an, dark, spring(mid), spring(upper), ell(0.042, 0.040, 0.044, 8, 5));
      const toe = place(ell(0.046, 0.024, 0.052, 8, 5), side * -0.002, -0.040, 0.140, 0.12, 0, 0);
      { const p = toe.attributes.position; for (let i = 0; i < p.count; i++) if (p.getY(i) < -0.046) p.setY(i, -0.046); toe.computeVertexNormals(); }
      add(an, armour, spring(toe), spring(place(plate(0.036, 0.050, 0.004, 0.006, 0.002), side * 0.049, -0.010, 0.020, 0, side * PI / 2, 0)),   // ankle plate
        spring(place(slab(0.046, 0.034, 0.005), 0, -0.016, -0.079, 0, PI, 0)));                                                             // heel cup
      const h = evalProf(norm(upProf), 0.070)[2] - 0.038;
      add(an, dark, spring(place(new THREE.TorusGeometry(0.046, 0.0045, 5, 14, PI), 0, h - 0.052, 0.070, PI / 2, 0, 0)));
      add(an, steel, place(slab(0.012, 0.016, 0.005), side * 0.049, h - 0.060, 0.070, 0, side * PI / 2, 0),
        ...[-1, 1].map((s) => place(new THREE.CylinderGeometry(0.009, 0.010, 0.034, 10), s * 0.020, -0.022, -0.090, PI / 2, 0, 0)),          // exhaust pipes
        ...[-1, 1].map((s) => place(new THREE.TorusGeometry(0.0095, 0.0018, 4, 10), s * 0.020, -0.022, -0.106, 0, 0, 0)));                  // pipe lips
      add(an, glow, ...[-1, 1].map((s) => place(new THREE.CylinderGeometry(0.0072, 0.0072, 0.006, 10), s * 0.020, -0.022, -0.104, PI / 2, 0, 0)));   // glowing exhaust mouths (the only lights)
      add(an, accent, spring(place(slab(0.004, 0.006, 0.040), side * 0.047, -0.030, 0.040)));                                                   // side accent strip
    }
  }

  if (O.id === 'street') outfitStreet(); else if (O.id === 'rider') outfitRider(); else outfitMechanic();
  flush();

  const L = ARM[1], R = ARM[-1], LL = LEG[1], RL = LEG[-1];
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
export default function (THREE) { return build(THREE, { outfit: OUTFITS[0].id, palette: OUTFITS[0].palettes[0].id }); }
