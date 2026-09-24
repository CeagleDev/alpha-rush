/**
 * hero_kitsune - YUZU. Three outfits, four colourways each (HERO_API.md).
 *   shrine   "Shrine Courier"  - the reference outfit: white kosode with detached sleeves, red knife-pleated skirt, black
 *                                thigh-highs, sock-boots on zori, rope belt with bells, talismans, fox mask on the side of the head.
 *   yukata   "Festival Yukata" - summer yukata split high at the sides, wide obi with a bow at the back, geta with tabi,
 *                                a folded paper fan and the fox mask tucked in the obi, a flower kanzashi in the hair.
 *   courier  "Night Courier"   - black-and-red sport kimono jacket with the hood down, leggings, running sneakers, the fox mask
 *                                worn over the face, a small satchel, glow-tape stripes on the sleeves (emissive 0.6).
 * The body (face, hair, ears, tail, hands, build) is shared; an outfit only changes what hangs on the joints; a palette only
 * changes material colours. Built to the runner candidate-C model: every body segment is a subdivided SphereGeometry
 * re-written by `tube()` (Hermite radius profile, ellipsoidal caps, gaussian bulges, sine folds, welded normals).
 *
 * 1.56 m, ~6.6 heads. Facing +Z; the figure's LEFT is +X.
 * Anchors (world m): sole 0, ankle 0.075, knee 0.425, hip 0.79, hips-root 0.85, spine 0.93,
 * chest 1.08, shoulder 1.258, neck 1.315, head 1.37 (chin 1.325), crown 1.56 (fox ears to ~1.62).
 * elbow 1.00, wrist 0.78. Every limb hangs down its joint's local -Y, so +rotation.x pitches it BACKWARD.
 * Joints hidden by OVERLAP: each limb segment ends in a cap circular in the YZ plane centred on the joint.
 */
export const OUTFITS = [
  { id: 'shrine', name: 'Shrine Courier', desc: 'Kosode, bells and talismans. The shrine road is faster than the street.',
    palettes: [
      { id: 'vermilion', name: 'Vermilion', swatch: ['#ece6da', '#c8362e', '#d9a93a'] },
      { id: 'midnight', name: 'Midnight Shrine', swatch: ['#1c1a20', '#7a1a26', '#d9a93a'] },
      { id: 'sakura', name: 'Sakura', swatch: ['#f4e8ec', '#e08aa2', '#d8987a'] },
      { id: 'jade', name: 'Jade Fox', swatch: ['#ece6da', '#2f9a74', '#c4c9cf'] },
    ] },
  { id: 'yukata', name: 'Festival Yukata', desc: 'Obi bow, geta and a paper fan. She still outruns the fireworks.',
    palettes: [
      { id: 'indigo', name: 'Indigo Wave', swatch: ['#2c3d78', '#ede5d2', '#c8362e'] },
      { id: 'peach', name: 'Peach Blossom', swatch: ['#f0bca8', '#d24d60', '#fff3f0'] },
      { id: 'inkgold', name: 'Ink & Gold', swatch: ['#17171b', '#d9a93a', '#8c1c22'] },
      { id: 'seaglass', name: 'Sea Glass', swatch: ['#93cdc6', '#f5f2ea', '#ea7460'] },
    ] },
  { id: 'courier', name: 'Night Courier', desc: 'Hooded sport kimono, sneakers, mask down. Nobody sees the courier.',
    palettes: [
      { id: 'ember', name: 'Red Ember', swatch: ['#1c181a', '#c8362e', '#ff6a2a'] },
      { id: 'ice', name: 'Ice Blue', swatch: ['#1c1f26', '#4facdf', '#a6ecff'] },
      { id: 'ultraviolet', name: 'Ultraviolet', swatch: ['#2d1848', '#9542d6', '#d86aff'] },
      { id: 'ghost', name: 'Ghost White', swatch: ['#ece9e4', '#9ea0a5', '#e6f6ff'] },
    ] },
];

// Material colours per outfit and palette. Skin, eyes, hair and fur are fixed (identity).
const PAL = {
  shrine: {
    vermilion: { top: 0xbdb8ad, skirt: 0xb0302a, trim: 0xb0302a, cord: 0x8c251f, stocking: 0x1e1c1e, sock: 0xbdb8ad, metal: 0xb08a2e, metalR: 0.35, paper: 0xb8b19c, mask: 0xc8c2b8, mark: 0xb0302a, band: 0xb0302a },
    midnight:  { top: 0x1c1a20, skirt: 0x6e1520, trim: 0xb08a2e, cord: 0x8a6a22, stocking: 0x141216, sock: 0x2a272c, metal: 0xb08a2e, metalR: 0.35, paper: 0xb8b19c, mask: 0xc8c2b8, mark: 0xb08a2e, band: 0x6e1520 },
    sakura:    { top: 0xe6dadf, skirt: 0xd47a92, trim: 0xc25a78, cord: 0xb04a68, stocking: 0xc48a9a, sock: 0xe6dadf, metal: 0xc4866a, metalR: 0.35, paper: 0xc0b8a8, mask: 0xd8d0d4, mark: 0xc25a78, band: 0xd47a92 },
    jade:      { top: 0xbdb8ad, skirt: 0x2a8a68, trim: 0x2a8a68, cord: 0x1f6b50, stocking: 0x1e1c1e, sock: 0xbdb8ad, metal: 0xa9adb3, metalR: 0.3, paper: 0xb8b19c, mask: 0xc8c2b8, mark: 0x2a8a68, band: 0x2a8a68 },
  },
  yukata: {
    indigo:   { robe: 0x2b3a6e, lining: 0x1e2a52, obi: 0xe6dfcf, obiCord: 0xb0302a, print: 0xe4e6ee, wood: 0x8a6a48, hanao: 0xb0302a, tabi: 0xbdb8ad, fan: 0xe6dfcf, fanRib: 0x6b4a30, flower: 0xe8e0d0, flower2: 0xc8a032, mask: 0xc8c2b8, mark: 0xb0302a },
    peach:    { robe: 0xe4b09c, lining: 0xc9907e, obi: 0xc0445a, obiCord: 0xf0e4e0, print: 0xf5eeee, wood: 0x9a7856, hanao: 0xc0445a, tabi: 0xe6dadf, fan: 0xf5eeee, fanRib: 0x6b4a30, flower: 0xd47a92, flower2: 0xf5eeee, mask: 0xd8d0d4, mark: 0xc0445a },
    inkgold:  { robe: 0x16161a, lining: 0x0e0e12, obi: 0xb08a2e, obiCord: 0x8c1c22, print: 0xb08a2e, wood: 0x2a2226, hanao: 0x8c1c22, tabi: 0xbdb8ad, fan: 0x1e1e24, fanRib: 0xb08a2e, flower: 0xb08a2e, flower2: 0x8c1c22, mask: 0x1e1e24, mark: 0xb08a2e },
    seaglass: { robe: 0x86bdb6, lining: 0x6a9c96, obi: 0xe8e4da, obiCord: 0xd86a56, print: 0xeef2ee, wood: 0x8a6a48, hanao: 0xd86a56, tabi: 0xbdb8ad, fan: 0xe8e4da, fanRib: 0x6b4a30, flower: 0xd86a56, flower2: 0xe8e4da, mask: 0xc8c2b8, mark: 0xd86a56 },
  },
  courier: {
    ember:       { jacket: 0x1a1719, panel: 0xb0302a, glow: 0xff5a2a, glowBase: 0x6a2a14, leggings: 0x141216, upper: 0x1a1719, sole: 0xd8d2c8, lace: 0xb0302a, satchel: 0x2a2426, strap: 0x3a3236, metal: 0x8a8c90, mask: 0xc8c2b8, mark: 0xb0302a, hood: 0x8c251f },
    ice:         { jacket: 0x1a1c22, panel: 0x3f93c4, glow: 0x9ae8ff, glowBase: 0x3a6a80, leggings: 0x141418, upper: 0x1a1c22, sole: 0xe0e4e8, lace: 0x9ae8ff, satchel: 0x24262c, strap: 0x34363c, metal: 0xa0a4aa, mask: 0xc8c2b8, mark: 0x3f93c4, hood: 0x2c5f80 },
    ultraviolet: { jacket: 0x2a1740, panel: 0x8a3ac8, glow: 0xd05aff, glowBase: 0x5a2a70, leggings: 0x1a1024, upper: 0x2a1740, sole: 0xd8ccec, lace: 0xd05aff, satchel: 0x1e1230, strap: 0x2e2040, metal: 0x9a90a8, mask: 0xc8c2b8, mark: 0x8a3ac8, hood: 0x5a2a90 },
    ghost:       { jacket: 0xe4e2de, panel: 0x8e9095, glow: 0xdaf2ff, glowBase: 0x7a8a90, leggings: 0x2a2a2e, upper: 0xe4e2de, sole: 0x1a1719, lace: 0x8e9095, satchel: 0xd0cec8, strap: 0x9e9a94, metal: 0x8a8c90, mask: 0xc8c2b8, mark: 0x8e9095, hood: 0x6a6c72 },
  },
};

export function build(THREE, { outfit, palette } = {}) {
  const O = OUTFITS.find((o) => o.id === outfit) || OUTFITS[0];
  const PL = O.palettes.find((p) => p.id === palette) || O.palettes[0];
  const C = PAL[O.id][PL.id];

  const g = new THREE.Group();
  const M = (color, name, roughness = 0.88, metalness = 0) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness });
    if (name) m.name = name;
    return m;
  };
  // identity materials (fixed across outfits and palettes)
  const skin = new THREE.MeshStandardMaterial({ color: 0xdcb89c, roughness: 0.62 });
  const skinDk = new THREE.MeshStandardMaterial({ color: 0xb8927a, roughness: 0.7 });     // nostrils, ear concha, eye crease
  const lipM = new THREE.MeshStandardMaterial({ color: 0xc98a80, roughness: 0.55 });
  const hairM = M(0xc6c7c9, 'fabric', 0.72);          // silver-white hair
  const hairDk = M(0xa4a6a9, 'fabric', 0.74);         // under-layers of hair, so the clumps separate
  const furM = M(0xbdbab2, 'fabric', 0.96);           // tail / ear fur
  const innerEar = new THREE.MeshStandardMaterial({ color: 0xa8776a, roughness: 0.8 });
  const eyeWhite = new THREE.MeshStandardMaterial({ color: 0xe8e4e0, roughness: 0.35 });
  const irisM = new THREE.MeshStandardMaterial({ color: 0xbf7a16, roughness: 0.3 });
  const pupilM = new THREE.MeshStandardMaterial({ color: 0x1a1210, roughness: 0.3 });
  const browM = M(0x8a8588, undefined, 0.8);
  const lash = M(0x3a3234, undefined, 0.8);
  const ink = M(0x2a2624, undefined, 0.9);
  const maskEye = new THREE.MeshStandardMaterial({ color: 0x4f8a3a, roughness: 0.5 });
  const maskHole = new THREE.MeshStandardMaterial({ color: 0x141012, roughness: 0.9 });

  /* ---------------------------------------------------------------- helpers */
  const PI = Math.PI;
  const wrap = (a) => { while (a > PI) a -= 2 * PI; while (a < -PI) a += 2 * PI; return a; };
  const sstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const gauss = (x) => Math.exp(-x * x);
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
  // the same surface pushed out by `d` metres (a garment layer over another)
  const offsetSurf = (S, d) => { const f = (y, ang, k = 1) => { const p = S(y, ang, k), c = S.P; const q = evalProf(c, y); const cx = q[3], cz = q[4]; const dx = p[0] - cx, dz = p[2] - cz, l = Math.hypot(dx, dz) || 1; return [p[0] + dx / l * d * k, p[1], p[2] + dz / l * d * k]; }; f.P = S.P; return f; };
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
  const add = (parent, mat, ...geos) => { if (!geos.length) return null; const m = new THREE.Mesh(geos.length > 1 ? merge(geos) : geos[0], mat); parent.add(m); return m; };
  const J = (x, y, z, parent) => { const o = new THREE.Object3D(); o.position.set(x, y, z); parent.add(o); return o; };
  const V = (a) => new THREE.Vector3(a[0], a[1], a[2]);
  const seam = (pts, r = 0.003, seg = 16, closed = false, rad = 5) =>
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(V), closed), seg, r, rad, closed);
  // a ring of the surface at height y (n points), lifted `lift` off it: hems, rolled edges, cords that follow the cloth
  const ring = (S, y, n, lift = 0, yf = null) => { const pts = []; for (let i = 0; i < n; i++) { const a = (i / n) * 2 * PI - PI + 0.0001; const yy = yf ? yf(a) : y; const p = S(yy, a), q = S(yy, a, 1 + lift / (Math.hypot(p[0], p[2]) || 1)); pts.push([q[0], yy, q[2]]); } return pts; };
  const rolledHem = (S, y, n, r, lift = 0, yf = null, rad = 5) => seam(ring(S, y, n, lift, yf), r, n, true, rad);
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
  const flat = (w, h, d, r) => { const s = new THREE.Shape(), x = -w / 2, y = -h / 2; s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h); s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); const e = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false, curveSegments: 1, steps: 1 }); e.translate(0, 0, -d / 2); return e; };
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
  // a surface-following line from (y0,a0) to (y1,a1): seams, piping, straps that must sit ON the cloth
  const trace = (S, y0, a0, y1, a1, n = 6, lift = 0.002) => { const pts = []; for (let i = 0; i <= n; i++) { const t = i / n, y = y0 + (y1 - y0) * t, a = a0 + (a1 - a0) * t; const p = S(y, a); const l = Math.hypot(p[0], p[2]) || 1; pts.push([p[0] + p[0] / l * lift, y, p[2] + p[2] / l * lift]); } return pts; };
  // knife pleats: a sawtooth around the circumference whose amplitude grows towards the hem
  const pleat = (n, amp, yTop, yHem) => (y, a) => { const t = ((a / (2 * PI)) * n + 100) % 1; return amp * (0.15 + 0.85 * (1 - sstep(yHem, yTop, y))) * (t < 0.62 ? t / 0.62 * 2 - 1 : 1 - (t - 0.62) / 0.38 * 2); };
  // twisted two-strand cord along a polyline
  const twistCord = (pts, r, seg = 10) => { const c = new THREE.CatmullRomCurve3(pts.map(V)); const out = []; for (const s of [0, PI]) { const q = []; const T = new THREE.Vector3(), N = new THREE.Vector3(), B = new THREE.Vector3(); for (let i = 0; i <= seg; i++) { const t = i / seg, p = c.getPoint(t); c.getTangent(t, T); N.set(0, 1, 0); if (Math.abs(T.y) > 0.9) N.set(1, 0, 0); B.crossVectors(T, N).normalize(); N.crossVectors(B, T).normalize(); const ph = s + t * seg * 1.9; q.push([p.x + (N.x * Math.cos(ph) + B.x * Math.sin(ph)) * r * 0.55, p.y + (N.y * Math.cos(ph) + B.y * Math.sin(ph)) * r * 0.55, p.z + (N.z * Math.cos(ph) + B.z * Math.sin(ph)) * r * 0.55]); } out.push(seam(q, r * 0.6, seg * 2, false, 4)); } return out; };
  const gold = M(C.metal ?? 0xb08a2e, 'metal', C.metalR ?? 0.35, 0.8);

  const root = new THREE.Object3D(); g.add(root);

  /* ================================================================ SHARED BODY (identity) */
  // wardrobe materials (colour only), by outfit
  const W = {};
  if (O.id === 'shrine') {
    W.top = M(C.top, 'fabric', 0.9); W.skirt = M(C.skirt, 'fabric', 0.9); W.trim = M(C.trim, 'fabric', 0.9); W.cord = M(C.cord, 'fabric', 0.92);
    W.stocking = M(C.stocking, 'fabric', 0.82); W.sock = M(C.sock, 'fabric', 0.9); W.sole = M(0x1a1819, undefined, 0.85); W.paper = M(C.paper, undefined, 0.92);
    W.mask = M(C.mask, undefined, 0.6); W.mark = M(C.mark, undefined, 0.6); W.band = M(C.band, 'fabric', 0.9); W.lining = M(C.skirt, 'fabric', 0.95); W.lining.color.multiplyScalar(0.72);
    W.pelvis = M(0x1e1c1e, 'fabric', 0.82); W.cover = W.skirt;
  } else if (O.id === 'yukata') {
    W.robe = M(C.robe, 'fabric', 0.9); W.lining = M(C.lining, 'fabric', 0.95); W.obi = M(C.obi, 'fabric', 0.85); W.obiCord = M(C.obiCord, 'fabric', 0.92); W.print = M(C.print, 'fabric', 0.9);
    W.wood = M(C.wood, 'timber', 0.7); W.hanao = M(C.hanao, 'fabric', 0.9); W.tabi = M(C.tabi, 'fabric', 0.9); W.fan = M(C.fan, undefined, 0.9); W.fanRib = M(C.fanRib, 'timber', 0.7);
    W.flower = M(C.flower, 'fabric', 0.8); W.flower2 = M(C.flower2, undefined, 0.6); W.mask = M(C.mask, undefined, 0.6); W.mark = M(C.mark, undefined, 0.6);
    W.pelvis = W.lining; W.cover = W.robe;
  } else {
    W.jacket = M(C.jacket, 'fabric', 0.86); W.panel = M(C.panel, 'fabric', 0.86); W.leggings = M(C.leggings, 'fabric', 0.8); W.upper = M(C.upper, 'fabric', 0.85);
    W.sole = M(C.sole, undefined, 0.75); W.lace = M(C.lace, 'fabric', 0.9); W.satchel = M(C.satchel, 'fabric', 0.8); W.strap = M(C.strap, 'fabric', 0.8); W.metal = M(C.metal, 'metal', 0.4, 0.8);
    W.mask = M(C.mask, undefined, 0.6); W.mark = M(C.mark, undefined, 0.6); W.hood = M(C.hood, 'fabric', 0.9); W.sock = M(0xd8d2c8, 'fabric', 0.9);
    W.glow = new THREE.MeshStandardMaterial({ color: C.glowBase, emissive: C.glow, emissiveIntensity: 0.6, roughness: 0.5 }); W.glow.name = 'glowtape';
    W.pelvis = W.leggings; W.cover = W.leggings;
  }

  /* ---------------------------------------------------------------- torso surface (chest-local y; world = 1.08 + y): a slim female torso */
  const torsoS = surfOf({
    sq: 0.9,
    prof: [
      [-0.200, 0.124, 0.086, 0.092],
      [-0.150, 0.116, 0.082, 0.088],
      [-0.100, 0.108, 0.077, 0.083],   // waist
      [-0.040, 0.114, 0.082, 0.086],
      [0.030, 0.128, 0.093, 0.092],
      [0.090, 0.137, 0.104, 0.096],    // bust / shoulder blades
      [0.150, 0.136, 0.096, 0.098],
      [0.195, 0.128, 0.084, 0.093, 0, -0.003],
      [0.220, 0.104, 0.070, 0.082, 0, -0.005],
      [0.243, 0.078, 0.060, 0.070, 0, -0.006],
      [0.262, 0.056, 0.052, 0.058, 0, -0.006],
    ],
    bulges: [
      { y: 0.085, h: 0.05, a: 0.45, w: 0.36, amp: 0.013 }, { y: 0.085, h: 0.05, a: -0.45, w: 0.36, amp: 0.013 },
      { y: 0.115, h: 0.07, a: PI - 0.5, w: 0.36, amp: 0.008 }, { y: 0.115, h: 0.07, a: PI + 0.5, w: 0.36, amp: 0.008 },
      { y: 0.03, h: 0.12, a: PI, w: 0.16, amp: -0.006 },
    ],
    ripple: (y, a) => { const w = sstep(-0.19, -0.14, y) * (1 - sstep(-0.09, -0.04, y)); return w ? 0.003 * w * Math.sin(y * 130 + a * 3.0) * (0.5 + 0.5 * Math.sin(a * 2 + 1)) : 0; },
  });

  /* ---------------------------------------------------------------- hips (root joint, world 0.85) */
  const hips = J(0, 0.85, 0, root);
  const pelvisS = surfOf({
    sq: 0.92,
    prof: [[-0.150, 0.045, 0.044, 0.066], [-0.085, 0.118, 0.054, 0.096], [-0.035, 0.140, 0.070, 0.100], [0.020, 0.134, 0.082, 0.088], [0.075, 0.126, 0.080, 0.080]],
    bulges: [{ y: -0.045, h: 0.055, a: PI - 0.48, w: 0.42, amp: 0.014 }, { y: -0.045, h: 0.055, a: PI + 0.48, w: 0.42, amp: 0.014 }, { y: -0.06, h: 0.07, a: PI, w: 0.12, amp: -0.010 }],
  });
  add(hips, W.pelvis, tube({ surf: pelvisS, y0: -0.150, y1: 0.075, capB: 0.085, capT: 0.02, radial: 12, rings: 6 }));
  { // TAIL: big fluffy fox tail, rooted at the tailbone, sweeping back, up and to her left (+X). Never below hip height.
    const tailCurve = new THREE.CatmullRomCurve3([new THREE.Vector3(0.0, -0.03, -0.07), new THREE.Vector3(0.02, 0.0, -0.20), new THREE.Vector3(0.06, 0.08, -0.33), new THREE.Vector3(0.13, 0.21, -0.42), new THREE.Vector3(0.21, 0.35, -0.44)]);
    const R = (t) => 0.026 + 0.072 * Math.sin(Math.min(1, t * 1.12) * PI) ** 0.75 * (1 - 0.30 * t) + 0.012 * (1 - t);
    const geo = new THREE.SphereGeometry(1, 16, 22), pos = geo.attributes.position;
    const T = new THREE.Vector3(), Nn = new THREE.Vector3(), B = new THREE.Vector3(), P = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
    for (let i = 0; i < pos.count; i++) {
      const px = pos.getX(i), py = Math.max(-1, Math.min(1, pos.getY(i))), pz = pos.getZ(i);
      const ang = Math.atan2(px, pz), t = 1 - Math.acos(py) / PI;
      const tt = Math.min(0.995, Math.max(0.005, t));
      tailCurve.getPoint(tt, P); tailCurve.getTangent(tt, T).normalize();
      B.crossVectors(T, up).normalize(); Nn.crossVectors(B, T).normalize();
      const kcap = t < 0.06 ? Math.sin(t / 0.06 * PI / 2) : t > 0.9 ? Math.sin((1 - t) / 0.1 * PI / 2) : 1;
      let r = R(t) * kcap;
      r += kcap * (0.009 * Math.sin(ang * 7 + t * 34) + 0.007 * Math.sin(ang * 3 - t * 22) + 0.004 * Math.sin(ang * 12 + t * 60) + 0.003 * Math.sin(ang * 19 - t * 90)) * Math.sin(Math.min(1, t * 1.12) * PI) + 0.004 * kcap * Math.max(0, Math.cos(ang)) * (1 - t);
      const q = P.clone().addScaledVector(B, r * Math.sin(ang)).addScaledVector(Nn, r * Math.cos(ang));
      pos.setXYZ(i, q.x, q.y, q.z);
    }
    geo.computeVertexNormals(); weldNormals(geo);
    add(hips, furM, geo);
  }
  const spine = J(0, 0.08, 0, hips);                     // world 0.93
  const SP = 0.15;                                       // chest-local -> spine-local
  const chest = J(0, 0.15, 0, spine);                    // world 1.08

  /* ---------------------------------------------------------------- neck / head */
  const neck = J(0, 0.235, -0.008, chest);               // world 1.315
  add(neck, skin, tube({ prof: [[-0.045, 0.066, 0.046, 0.054, 0, 0.0], [-0.010, 0.044, 0.041, 0.045, 0, 0.002], [0.035, 0.040, 0.040, 0.042, 0, 0.006], [0.090, 0.040, 0.039, 0.043, 0, 0.010]],
    y0: -0.045, y1: 0.095, capB: 0.01, capT: 0.02, radial: 14, rings: 7,
    bulges: [{ y: 0.04, h: 0.03, a: 0.5, w: 0.25, amp: 0.002 }, { y: 0.04, h: 0.03, a: -0.5, w: 0.25, amp: 0.002 }] }));   // sternomastoid
  const head = J(0, 0.055, 0.008, neck);                 // world 1.37
  const headS = surfOf({
    prof: [
      [-0.045, 0.026, 0.034, 0.020, 0, 0.028],   // small chin
      [-0.030, 0.046, 0.050, 0.034, 0, 0.022],   // jaw
      [-0.010, 0.060, 0.062, 0.052, 0, 0.013],
      [0.010, 0.065, 0.067, 0.064, 0, 0.008],    // cheek
      [0.050, 0.073, 0.077, 0.088, 0, 0.002],
      [0.092, 0.076, 0.081, 0.096, 0, 0.0],      // brow / occiput
      [0.135, 0.070, 0.076, 0.090, 0, -0.002],
      [0.178, 0.046, 0.050, 0.058, 0, -0.004],
    ],
    bulges: [
      { y: 0.084, h: 0.014, a: 0, w: 0.75, amp: 0.003 },                                                            // brow ridge
      { y: 0.062, h: 0.018, a: 0.40, w: 0.30, amp: -0.006 }, { y: 0.062, h: 0.018, a: -0.40, w: 0.30, amp: -0.006 }, // eye sockets
      { y: 0.034, h: 0.02, a: 0.66, w: 0.26, amp: 0.005 }, { y: 0.034, h: 0.02, a: -0.66, w: 0.26, amp: 0.005 },     // cheekbones
      { y: -0.022, h: 0.02, a: 0.95, w: 0.35, amp: 0.004 }, { y: -0.022, h: 0.02, a: -0.95, w: 0.35, amp: 0.004 },   // jaw corners
      { y: 0.004, h: 0.006, a: 0, w: 0.28, amp: -0.0025 }, { y: -0.010, h: 0.008, a: 0, w: 0.24, amp: 0.0025 },     // philtrum / lower lip shelf
      { y: -0.040, h: 0.008, a: 0, w: 0.4, amp: 0.002 },                                                             // chin ball
      { y: 0.03, h: 0.03, a: PI, w: 0.5, amp: -0.004 },
    ],
  });
  add(head, skin, tube({ surf: headS, y0: -0.047, y1: 0.180, capB: 0.02, capT: 0.05, radial: 18, rings: 16 }));
  { // NOSE: bridge from between the brows down to a tip that stands 12 mm off the face, nostril wings and dark nostrils
    const nose = tube({ prof: [[0.0, 0.0062, 0.0066, 0.0062], [0.010, 0.0056, 0.0058, 0.0058], [0.024, 0.0042, 0.0042, 0.0056], [0.040, 0.0036, 0.0034, 0.0066]], y0: 0.0, y1: 0.042, capB: 0.006, capT: 0.005, radial: 9, rings: 6 });
    place(nose, 0, 0.030, 0.0785, -0.32, 0, 0);
    const wings = [place(ell(0.0042, 0.0034, 0.0038, 7, 5), 0.0072, 0.0305, 0.0765, 0, 0.3, 0), place(ell(0.0042, 0.0034, 0.0038, 7, 5), -0.0072, 0.0305, 0.0765, 0, -0.3, 0)];
    add(head, skin, nose, ...wings);
    add(head, skinDk, place(ell(0.0019, 0.0012, 0.0017, 6, 4), 0.0038, 0.0262, 0.0790, 0.5, 0, 0), place(ell(0.0019, 0.0012, 0.0017, 6, 4), -0.0038, 0.0262, 0.0790, 0.5, 0, 0));
  }
  { // MOUTH: two lips with a dark mouth line between them
    add(head, lipM, place(ell(0.0120, 0.0020, 0.0040, 10, 5), 0, -0.0048, 0.0738, -0.15, 0, 0), place(ell(0.0100, 0.0026, 0.0044, 10, 5), 0, -0.0102, 0.0730, 0.15, 0, 0));
    add(head, ink, seam([[-0.0122, -0.0064, 0.0722], [-0.006, -0.0078, 0.0760], [0, -0.0076, 0.0768], [0.006, -0.0078, 0.0760], [0.0122, -0.0064, 0.0722]], 0.0010, 8, false, 4));
  }
  { // EYES: white, iris, pupil, highlight; upper lid + lash line, lower lid, crease; brows
    for (const s of [-1, 1]) {
      const fr = frameAt(headS, 0.061, s * 0.37);
      add(head, eyeWhite, onFrame(ell(0.0176, 0.0112, 0.0055, 10, 6), fr, -0.0015));
      add(head, irisM, onFrame(ell(0.0102, 0.0104, 0.0025, 10, 5), fr, 0.0035));
      add(head, pupilM, onFrame(ell(0.0050, 0.0060, 0.0018, 8, 4), fr, 0.0056));
      add(head, eyeWhite, onFrame(place(ell(0.0022, 0.0022, 0.0010, 6, 4), -s * 0.0034, 0.0032, 0), fr, 0.0072));
      add(head, skin, onFrame(place(ell(0.0188, 0.0050, 0.0060, 10, 5), 0, 0.0096, 0), fr, 0.0006));                 // upper lid
      add(head, lash, onFrame(place(ell(0.0198, 0.0034, 0.0042, 10, 4), s * 0.0004, 0.0120, 0, 0, 0, s * -0.10), fr, 0.0030),
        onFrame(place(ell(0.0040, 0.0020, 0.0016, 6, 4), s * 0.0188, 0.0100, 0, 0, 0, s * 0.5), fr, 0.0036));        // lash line + outer flick
      add(head, skin, onFrame(place(ell(0.0162, 0.0030, 0.0045, 10, 4), 0, -0.0100, 0), fr, 0.0004));                // lower lid
      add(head, skinDk, onFrame(place(ell(0.0166, 0.0012, 0.0020, 8, 4), 0, 0.0160, 0), fr, 0.0014));                // crease
      // brow: a tapered curve following the brow ridge
      add(head, browM, seam(trace(headS, 0.083, s * 0.16, 0.086, s * 0.62, 5, 0.0025).map((p, i) => [p[0], p[1] + (i === 2 ? 0.002 : i === 3 ? 0.0025 : 0), p[2]]), 0.0021, 10, false, 4));
    }
  }
  { // EARS: plate, helix rim, concha
    for (const s of [-1, 1]) {
      const e = new THREE.Object3D(); e.position.set(s * 0.074, 0.050, -0.006); e.rotation.set(0.05, s * 0.50, s * -0.10); head.add(e);
      add(e, skin, ell(0.0060, 0.0190, 0.0120, 8, 7),
        seam([[s * 0.002, 0.004, 0.011], [s * 0.004, 0.016, 0.005], [s * 0.005, 0.017, -0.006], [s * 0.004, 0.006, -0.012], [s * 0.003, -0.008, -0.011], [s * 0.002, -0.017, -0.004]], 0.0024, 10, false, 5));
      add(e, skinDk, place(ell(0.0030, 0.0085, 0.0055, 6, 4), s * 0.0045, -0.001, -0.001));
    }
  }
  { // HAIR: silver shell with a straight hime fringe, layered clumps, long side locks, high ponytail held off the back
    const hairS = surfOf({
      prof: [[-0.005, 0.040, 0.050, 0.046], [0.020, 0.062, 0.066, 0.074], [0.050, 0.079, 0.082, 0.099], [0.092, 0.085, 0.091, 0.107], [0.135, 0.080, 0.087, 0.101, 0, -0.002], [0.175, 0.060, 0.066, 0.076, 0, -0.004], [0.194, 0.040, 0.046, 0.052, 0, -0.004]],
      ripple: (y, a) => 0.0030 * Math.sin(a * 13 + y * 6) + 0.0016 * Math.sin(a * 29 + y * 10) + 0.0035 * Math.sin(a * 5 + 1.0) * sstep(0.03, 0.12, y) * (1 - sstep(0.15, 0.19, y)),
    });
    const hairline = (a0) => { const a = Math.abs(a0); if (a < 0.78) return 0.085 + 0.003 * Math.sin(a0 * 14) - 0.003 * Math.exp(-(((a0 - 0.12) / 0.16) ** 2)); if (a < 1.6) return 0.079 + 0.006 * sstep(0.78, 1.6, a); return 0.085 - 0.080 * sstep(1.6, 2.6, a); };
    const gs = [tube({ surf: hairS, y0: -0.002, y1: 0.194, capB: 0.01, capT: 0.05, radial: 18, rings: 12, ymap: (y, a) => Math.max(y, hairline(a)) })];
    const fringeS = surfOf({ prof: hairS.P.map((q) => [q[0], q[1] + 0.004, q[2] + 0.004, q[3] + 0.004, q[4], q[5]]), ripple: (y, a) => 0.0034 * Math.sin(a * 34) + 0.0014 * Math.sin(a * 9 + y * 60) + 0.0012 * Math.sin(a * 55) });
    const fringePost = (x, y, z, a) => { const k = (1 - 0.14 * sstep(0.85, 1.25, Math.abs(a))) * (1 - 0.050 * sstep(0.096, 0.114, y)); return [x * k, y, z * k]; };
    gs.push(tube({ surf: fringeS, y0: 0.079, y1: 0.114, capB: 0.004, capT: 0.005, radial: 28, rings: 7, post: fringePost, ymap: (y, a) => y + 0.0040 * Math.sin(a * 21) * (1 - sstep(0.079, 0.094, y)) + 0.0015 * Math.sin(a * 47) * (1 - sstep(0.079, 0.087, y)) }));
    const cl = (rx, ry, rz, x, y, z, ax, ay, az, arr = gs) => arr.push(place(ell(rx, ry, rz, 8, 6), x, y, z, ax, ay, az));
    // fringe: layered clumps, the outer ones a shade darker so the layers separate
    const dk = [];
    dk.push(tube({ surf: surfOf({ prof: hairS.P.map((q) => [q[0], q[1] + 0.001, q[2] + 0.001, q[3] + 0.001, q[4], q[5]]) }), y0: 0.074, y1: 0.100, capB: 0.004, capT: 0.004, radial: 20, rings: 4, post: fringePost }));   // under-layer: the fringe has thickness
    for (const s of [-1, 1]) {   // long side locks framing the face down to the collarbone
      gs.push(place(tube({ prof: [[-0.175, 0.006, 0.009, 0.008], [-0.100, 0.010, 0.014, 0.012], [-0.020, 0.014, 0.019, 0.017], [0.060, 0.014, 0.018, 0.018]], y0: -0.178, y1: 0.075, capB: 0.02, capT: 0.015, radial: 8, rings: 8,
        ripple: (y, a) => 0.0015 * Math.sin(a * 5 + y * 40) + 0.0012 * Math.sin(a * 3 + y * 25),
        post: (x, y, z) => { const t = sstep(-0.02, -0.178, y); return [x - s * 0.012 * t, y, z + 0.006 * t]; } }), s * 0.079, 0.0, 0.036, 0.05, 0, s * -0.05));
      dk.push(place(tube({ prof: [[-0.120, 0.006, 0.008, 0.008], [-0.040, 0.009, 0.011, 0.010], [0.040, 0.010, 0.012, 0.012]], y0: -0.122, y1: 0.050, capB: 0.015, capT: 0.012, radial: 7, rings: 5 }), s * 0.086, 0.010, 0.010, 0.02, 0, s * -0.08));
    }
    add(head, hairM, ...gs); add(head, hairDk, ...dk);
    // PONYTAIL: gathered at the back of the crown, then a grooved fall held off the back, thinning to a tip at world ~0.95
    const pony = tube({
      prof: [[-0.420, 0.009, 0.006, 0.006, 0.046, -0.148], [-0.340, 0.020, 0.013, 0.014, 0.044, -0.154], [-0.250, 0.030, 0.019, 0.022, 0.030, -0.158], [-0.150, 0.035, 0.023, 0.026, 0.012, -0.156], [-0.060, 0.036, 0.024, 0.028, 0.0, -0.152], [0.020, 0.033, 0.025, 0.028, 0.0, -0.140], [0.090, 0.027, 0.023, 0.023, 0.0, -0.116], [0.140, 0.022, 0.020, 0.020, 0.0, -0.080]],
      y0: -0.420, y1: 0.140, capB: 0.02, capT: 0.03, radial: 12, rings: 15,
      ripple: (y, a) => 0.0045 * Math.sin(a * 5 + y * 9) + 0.002 * Math.sin(a * 3 - y * 50),
    });
    const strands = [];
    for (const [x, y, z, l] of [[0.030, -0.06, -0.150, 0.16], [-0.026, -0.10, -0.152, 0.14], [0.012, -0.22, -0.160, 0.15]]) strands.push(place(tube({ prof: [[-l, 0.003, 0.003], [-l * 0.5, 0.006, 0.006], [0, 0.007, 0.007]], y0: -l, y1: 0, capB: 0.01, capT: 0.008, radial: 6, rings: 4 }), x, y, z, 0.05, 0, x > 0 ? -0.12 : 0.12));
    add(head, hairM, pony); add(head, hairDk, ...strands);
    // tie ring behind the crown
    add(head, W.cord || W.obiCord || W.panel, place(new THREE.TorusGeometry(0.030, 0.008, 6, 14), 0.0, 0.108, -0.112, 0.95, 0, 0));
    // FOX EARS: tall tapered cones of fur on the top of the head, tilted outward, pink inner ear facing forward, tufted rims
    for (const s of [-1, 1]) {
      const e = new THREE.Object3D(); e.position.set(s * 0.048, 0.168, -0.010); e.rotation.set(-0.18, 0, s * -0.30); head.add(e);
      add(e, furM, tube({ prof: [[0.0, 0.030, 0.020, 0.024], [0.030, 0.026, 0.016, 0.020], [0.060, 0.016, 0.010, 0.012], [0.088, 0.004, 0.003, 0.004]], y0: 0.0, y1: 0.090, capB: 0.012, capT: 0.004, radial: 9, rings: 7,
        ripple: (y, a) => 0.0018 * Math.sin(a * 5 + y * 60) * sstep(0.0, 0.02, y) + 0.0012 * Math.sin(a * 9 + y * 120) }));
      add(e, innerEar, place(tube({ prof: [[0.0, 0.016, 0.006, 0.006], [0.025, 0.014, 0.006, 0.006], [0.058, 0.004, 0.003, 0.003]], y0: 0.0, y1: 0.060, capB: 0.006, capT: 0.003, radial: 6, rings: 4 }), 0, 0.010, 0.016));
      add(e, hairM, place(ell(0.006, 0.014, 0.005, 6, 4), s * 0.020, 0.012, 0.010, 0.2, 0, s * 0.5), place(ell(0.005, 0.012, 0.005, 6, 4), s * -0.014, 0.010, 0.014, 0.3, 0, s * -0.4));   // fur tufts at the base
    }
  }
  // KITSUNE MASK (built on demand by an outfit): white plate with ears, painted brow/cheek/whisker strokes, eye HOLES
  function foxMask(parent, x, y, z, rx, ry, rz, sc, wrapBack = 0.006) {
    const mk = new THREE.Object3D(); mk.position.set(x, y, z); mk.rotation.set(rx, ry, rz); mk.scale.setScalar(sc); parent.add(mk);
    const maskS = surfOf({ prof: [[-0.058, 0.016, 0.010, wrapBack], [-0.030, 0.034, 0.016, wrapBack], [0.008, 0.043, 0.020, wrapBack], [0.036, 0.040, 0.018, wrapBack], [0.054, 0.026, 0.012, wrapBack * 0.8]],
      bulges: [{ y: -0.045, h: 0.02, a: 0, w: 0.6, amp: 0.006 }, { y: 0.008, h: 0.012, a: 0.45, w: 0.25, amp: -0.004 }, { y: 0.008, h: 0.012, a: -0.45, w: 0.25, amp: -0.004 }] });
    add(mk, W.mask, tube({ surf: maskS, y0: -0.058, y1: 0.054, capB: 0.008, capT: 0.005, radial: 14, rings: 9 }),
      place(tube({ prof: [[0, 0.012, 0.008, 0.008], [0.040, 0.003, 0.003, 0.003]], y0: 0, y1: 0.042, capB: 0.006, capT: 0.003, radial: 6, rings: 3 }), 0.026, 0.044, 0.0, 0, 0, -0.35),
      place(tube({ prof: [[0, 0.012, 0.008, 0.008], [0.040, 0.003, 0.003, 0.003]], y0: 0, y1: 0.042, capB: 0.006, capT: 0.003, radial: 6, rings: 3 }), -0.026, 0.044, 0.0, 0, 0, 0.35));
    const rm = [];
    for (const s of [-1, 1]) {
      rm.push(seam([[s * 0.016, 0.028, 0.0185], [s * 0.024, 0.020, 0.0185], [s * 0.030, 0.008, 0.0170]], 0.0018, 5, false, 4));      // cheek stroke
      rm.push(seam([[s * 0.012, -0.004, 0.0200], [s * 0.022, -0.008, 0.0192], [s * 0.031, -0.014, 0.0160]], 0.0015, 5, false, 4));    // whisker
      rm.push(seam([[s * 0.010, 0.036, 0.0165], [s * 0.020, 0.040, 0.0150], [s * 0.030, 0.038, 0.0120]], 0.0016, 5, false, 4));      // brow stroke
      rm.push(seam([[s * 0.008, 0.052, 0.006], [s * 0.020, 0.062, 0.004], [s * 0.028, 0.076, 0.002]], 0.0014, 4, false, 4));         // ear inner line
    }
    rm.push(place(ell(0.0045, 0.0040, 0.0035, 6, 4), 0, -0.043, 0.0180, 0, 0, 0));                                                 // nose
    rm.push(seam([[-0.010, -0.051, 0.0150], [0, -0.048, 0.0165], [0.010, -0.051, 0.0150]], 0.0012, 4, false, 4));                   // mouth
    add(mk, W.mark, ...rm);
    // eye holes: dark almond cut-ins sunk into the plate, a painted lid stroke above each
    add(mk, maskHole, place(ell(0.0105, 0.0042, 0.0025, 8, 4), 0.017, 0.007, 0.0178, 0, 0, 0.35), place(ell(0.0105, 0.0042, 0.0025, 8, 4), -0.017, 0.007, 0.0178, 0, 0, -0.35));
    add(mk, maskEye, seam([[0.008, 0.008, 0.0205], [0.017, 0.0125, 0.0205], [0.027, 0.011, 0.0190]], 0.0013, 4, false, 4), seam([[-0.008, 0.008, 0.0205], [-0.017, 0.0125, 0.0205], [-0.027, 0.011, 0.0190]], 0.0013, 4, false, 4));
    return mk;
  }

  /* ---------------------------------------------------------------- arms: skeleton + skin + HANDS (four fingers and a thumb) */
  const arms = {};
  function armCore(side) {
    const sh = J(side * 0.135, 0.178, -0.005, chest);             // world 1.258
    sh.rotation.z = side * 0.20;
    // deltoid + upper arm in skin, capped by a ball centred on the shoulder joint
    add(sh, skin, tube({
      prof: [[-0.300, 0.033, 0.034, 0.034], [-0.255, 0.034, 0.035, 0.035], [-0.150, 0.037, 0.038, 0.039], [-0.070, 0.041, 0.043, 0.044], [0.0, 0.046, 0.047, 0.047], [0.047, 0.046, 0.047, 0.047]],
      y0: -0.298, y1: 0.047, capB: 0.034, capT: 0.047, radial: 12, rings: 10,
      bulges: [{ y: -0.02, h: 0.05, a: side * PI / 2, w: 0.9, amp: 0.004 }, { y: -0.12, h: 0.06, a: 0.2, w: 0.8, amp: 0.002 }],
    }));
    const el = J(0, -0.255, 0, sh);                               // world ~1.00
    el.rotation.x = -0.10;
    add(el, skin, tube({ prof: [[-0.262, 0.023, 0.026, 0.026], [-0.160, 0.029, 0.030, 0.030], [-0.070, 0.033, 0.034, 0.035], [0.0, 0.034, 0.035, 0.035], [0.035, 0.034, 0.035, 0.035]],
      y0: -0.262, y1: 0.035, capB: 0.006, capT: 0.035, radial: 9, rings: 6 }));
    // HAND. Palm plane is YZ (palm faces the body), fingers hang down from the palm bottom, thumb at the front.
    const inw = -side;
    const hs = [];
    hs.push(tube({ prof: [[-0.282, 0.016, 0.026, 0.026], [-0.262, 0.019, 0.026, 0.026], [-0.240, 0.022, 0.026, 0.026]], y0: -0.284, y1: -0.240, capB: 0.006, capT: 0.005, radial: 10, rings: 4,
      bulges: [{ y: -0.262, h: 0.01, a: side * PI / 2, w: 0.5, amp: 0.002 }] }));                                                                                     // wrist with ulna bump
    hs.push(place(tube({ prof: [[-0.058, 0.011, 0.031, 0.031], [-0.030, 0.012, 0.034, 0.033], [0.0, 0.013, 0.035, 0.034], [0.030, 0.012, 0.030, 0.028]], y0: -0.060, y1: 0.032, capB: 0.007, capT: 0.02, radial: 10, rings: 7,
      bulges: [{ y: -0.048, h: 0.014, a: side * PI / 2, w: 1.4, amp: 0.0025 }, { y: -0.01, h: 0.03, a: inw * PI / 2, w: 0.8, amp: 0.002 }] }), inw * 0.001, -0.290, 0.004));   // palm, knuckle ridge at the bottom
    // a digit: segments hanging -Y from (x,y,z), each bent `curl` further toward +X*csign (the palm); returns geometries
    const digit = (x, y, z, segs, r, curl, csign, rot = null) => {
      const out = []; let px = 0, py = 0, pz = 0, ang = 0;
      segs.forEach((L, i) => {
        ang += csign * curl * (i === 0 ? 0.6 : 1);
        const rr = r * (1 - 0.08 * i);
        const seg = tube({ prof: [[-L, rr * 0.82, rr * 0.86], [-L * 0.45, rr * 0.92, rr * 0.95], [0, rr, rr]], y0: -L - rr * 0.35, y1: 0 + rr * 0.7, capB: rr * 0.55, capT: rr * 0.4, radial: 7, rings: 4,
          bulges: [{ y: rr * 0.1, h: rr * 0.6, a: -csign * PI / 2, w: 0.8, amp: rr * 0.12 }] });                                                                      // knuckle bulge on the back of the joint
        place(seg, px, py, pz, 0, 0, ang);
        out.push(seg);
        px += Math.sin(ang) * L; py -= Math.cos(ang) * L;
      });
      const grp = merge(out);
      if (rot) grp.applyMatrix4(_m.makeRotationFromEuler(_e.set(rot[0], rot[1], rot[2])));
      grp.translate(x, y, z);
      return grp;
    };
    const F = [[0.024, 0.074, 0.0074, 0.16], [0.008, 0.083, 0.0076, 0.19], [-0.008, 0.077, 0.0071, 0.22], [-0.023, 0.062, 0.0062, 0.27]];   // index .. little: z, length, radius, curl
    for (const [z, len, r, curl] of F) hs.push(digit(inw * -0.002, -0.346, z + 0.004, [len * 0.40, len * 0.32, len * 0.28], r, curl, inw, [0, 0, inw * 0.06]));
    hs.push(digit(inw * 0.006, -0.304, 0.034, [0.032, 0.030], 0.0085, 0.35, inw, [-0.55, inw * 0.35, inw * -0.25]));                                              // thumb: forward and down
    add(el, skin, ...hs);
    arms[side > 0 ? 'L' : 'R'] = { sh, el };
  }
  armCore(1); armCore(-1);

  /* ---------------------------------------------------------------- legs: skeleton + skin */
  const legs = {};
  const thighProf = [[-0.420, 0.050, 0.052, 0.052], [-0.365, 0.051, 0.053, 0.053], [-0.300, 0.056, 0.058, 0.057], [-0.190, 0.066, 0.070, 0.069], [-0.080, 0.075, 0.078, 0.081], [0.0, 0.078, 0.079, 0.079], [0.079, 0.078, 0.079, 0.079]];
  const calfProf = [[-0.300, 0.038, 0.040, 0.042], [-0.240, 0.040, 0.041, 0.046], [-0.190, 0.043, 0.043, 0.053], [-0.110, 0.0495, 0.048, 0.064], [-0.045, 0.050, 0.051, 0.055], [0.0, 0.050, 0.0515, 0.0515], [0.0515, 0.050, 0.0515, 0.0515]];
  const thighBulges = (side) => [{ y: -0.15, h: 0.10, a: side * 0.5, w: 0.7, amp: 0.004 }, { y: -0.17, h: 0.09, a: PI, w: 0.7, amp: 0.004 }];
  const calfBulges = [{ y: -0.005, h: 0.03, a: 0, w: 0.6, amp: 0.004 }, { y: -0.115, h: 0.06, a: PI, w: 0.75, amp: 0.005 }];
  function legCore(side) {
    const hp = J(side * 0.083, -0.06, 0, hips);                   // world 0.79
    add(hp, skin, tube({ prof: thighProf, y0: -0.419, y1: 0.079, capB: 0.052, capT: 0.079, radial: 12, rings: 11, bulges: thighBulges(side) }));
    const kn = J(0, -0.365, 0, hp);                               // world 0.425
    add(kn, skin, tube({ prof: calfProf, y0: -0.300, y1: 0.0515, capB: 0.02, capT: 0.0515, radial: 12, rings: 10, bulges: calfBulges }));
    const an = J(0, -0.35, 0, kn);                                // world 0.075
    legs[side > 0 ? 'L' : 'R'] = { hp, kn, an };
  }
  legCore(1); legCore(-1);
  // foot: sole footprint + a foot tube laid along Z (the outfit chooses materials, sole and toe details)
  const footprint = (side, grow) => {
    const pts = [[0, -0.070], [0.028, -0.060], [0.038, -0.020], [0.040, 0.040], [0.046, 0.100], [0.040, 0.150], [0.020, 0.176], [-0.005, 0.182], [-0.030, 0.170], [-0.044, 0.130], [-0.044, 0.090], [-0.036, 0.030], [-0.036, -0.030], [-0.027, -0.060]];
    const q = pts.map(([x, z]) => new THREE.Vector2(side * x * grow, (z - 0.055) * grow + 0.055));
    if (side < 0) q.reverse();
    const s = new THREE.Shape(); s.moveTo(q[0].x, q[0].y); s.splineThru(q.slice(1).concat([q[0]]));
    return s;
  };
  const soleExt = (side, grow, depth, bevel, yTop) => { const e = new THREE.ExtrudeGeometry(footprint(side, grow), { depth, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 1, curveSegments: 2, steps: 1 }); e.rotateX(PI / 2); e.translate(0, yTop, 0); return e; };
  const upProfOf = (side, d = 0) => [[-0.070, 0.028 + d, 0.010, 0.056 + d, 0, 0.050], [-0.045, 0.034 + d, 0.010, 0.074 + d, side * 0.001, 0.050], [0.0, 0.038 + d, 0.010, 0.070 + d, side * 0.003, 0.050], [0.040, 0.040 + d, 0.010, 0.060 + d, side * 0.003, 0.050],
    [0.090, 0.044 + d, 0.010, 0.046 + d, side * 0.002, 0.050], [0.140, 0.040 + d, 0.010, 0.036 + d, side * -0.001, 0.050], [0.180, 0.026 + d, 0.010, 0.030 + d, side * -0.004, 0.050]];
  // foot tube along +Z with toe spring; `extra` ripple in (z-along-foot, ang) space
  const footTube = (side, d, extra, lift = 0) => {
    const upProf = upProfOf(side, d);
    const upper = tube({ prof: upProf, y0: -0.070, y1: 0.181, capB: 0.016, capT: 0.034, radial: 10, rings: 10, sq: 0.8, ripple: extra || (() => 0) });
    upper.rotateX(PI / 2);
    const p = upper.attributes.position;
    for (let i = 0; i < p.count; i++) { const z = p.getZ(i); if (z > 0.10) p.setY(i, p.getY(i) + 1.6 * (z - 0.10) ** 2); p.setY(i, p.getY(i) + lift); }
    upper.computeVertexNormals(); return upper;
  };
  // height of the foot upper at (x, z) for laying cords on it
  const footTop = (side, x, z, d = 0) => { const h = evalProf(norm(upProfOf(side, d)), z); return -0.050 + h[2] * Math.sqrt(Math.max(0.05, 1 - ((x / (h[0] + 0.004)) ** 2))) + 0.0015 + (z > 0.10 ? 1.6 * (z - 0.10) ** 2 : 0); };

  /* ================================================================ OUTFIT 1: SHRINE COURIER */
  function outfitShrine() {
    const white = W.top, red = W.skirt, redDk = W.cord, trim = W.trim, black = W.stocking, sock = W.sock, soleM = W.sole;
    // SKIRT: red knife-pleated, A-line, waist tucked under the band at world 0.93, hem at world 0.635. Rigid with the hips.
    const skirtProf = [[-0.215, 0.218, 0.190, 0.196], [-0.160, 0.200, 0.168, 0.176], [-0.100, 0.184, 0.142, 0.150], [-0.040, 0.174, 0.112, 0.120], [0.020, 0.150, 0.092, 0.100], [0.080, 0.132, 0.088, 0.096]];
    const skirtS = surfOf({ sq: 0.95, prof: skirtProf, ripple: pleat(18, 0.011, 0.06, -0.20) });
    add(hips, red, tube({ surf: skirtS, y0: -0.215, y1: 0.080, capB: 0.006, capT: 0.012, radial: 54, rings: 9 }));
    // lining: a second wall 5 mm inside, hem to mid-skirt, so the skirt has thickness seen from below; rolled hem edge
    add(hips, W.lining, tube({ surf: offsetSurf(skirtS, -0.005), y0: -0.214, y1: -0.120, capB: 0.004, capT: 0.004, radial: 54, rings: 2 }));
    add(hips, red, rolledHem(skirtS, -0.214, 54, 0.0032, -0.001, null, 4));
    { // white stripe just above the hem, following the pleats
      const stripeS = surfOf({ sq: 0.95, prof: skirtProf.map((p) => [p[0], p[1] + 0.002, p[2] + 0.002, p[3] + 0.002]), ripple: pleat(18, 0.011, 0.06, -0.20) });
      add(hips, white, tube({ surf: stripeS, y0: -0.198, y1: -0.184, capB: 0.003, capT: 0.003, radial: 54, rings: 3 }));
    }
    { // WAISTBAND (red obi) + twisted rope belt + front knot, twisted bell cords with gold bells, tassels. All rigid with the hips.
      const bandS = surfOf({ sq: 0.9, prof: [[0.028, 0.130, 0.090, 0.096], [0.080, 0.126, 0.088, 0.094], [0.125, 0.124, 0.086, 0.092]], ripple: (y, a) => 0.0015 * Math.sin(a * 9 + y * 200) });
      add(hips, W.band, tube({ surf: bandS, y0: 0.028, y1: 0.125, capB: 0.004, capT: 0.004, radial: 20, rings: 8 }));
      add(hips, W.band, rolledHem(bandS, 0.030, 20, 0.0028, 0.001), rolledHem(bandS, 0.123, 20, 0.0028, 0.001));   // band edges have thickness
      const ropeS = surfOf({ sq: 0.9, prof: [[0.070, 0.134, 0.094, 0.100], [0.083, 0.136, 0.096, 0.102], [0.096, 0.134, 0.094, 0.100]], ripple: (y, a) => 0.0028 * Math.sin(a * 40 + y * 600) });
      add(hips, redDk, tube({ surf: ropeS, y0: 0.068, y1: 0.098, capB: 0.006, capT: 0.006, radial: 36, rings: 5 }));
      const k0 = ropeS(0.083, 0.15), gs = [];
      gs.push(place(new THREE.TorusGeometry(0.020, 0.0075, 6, 14), k0[0] + 0.012, k0[1] + 0.002, k0[2] + 0.006, 0.2, 0.3, 0));
      gs.push(place(new THREE.TorusGeometry(0.016, 0.0065, 6, 12), k0[0] - 0.024, k0[1] - 0.004, k0[2] + 0.004, -0.1, -0.4, 0.3));
      const cordA = [[k0[0] + 0.020, k0[1] - 0.01, k0[2] + 0.004], [k0[0] + 0.050, k0[1] - 0.06, k0[2] + 0.022], [k0[0] + 0.062, k0[1] - 0.115, k0[2] + 0.040], [k0[0] + 0.070, k0[1] - 0.150, k0[2] + 0.050]];
      const cordB = [[k0[0] - 0.006, k0[1] - 0.012, k0[2] + 0.004], [k0[0] + 0.006, k0[1] - 0.070, k0[2] + 0.030], [k0[0] + 0.014, k0[1] - 0.120, k0[2] + 0.048], [k0[0] + 0.018, k0[1] - 0.160, k0[2] + 0.058]];
      gs.push(...twistCord(cordA, 0.0038, 7), ...twistCord(cordB, 0.0038, 7));
      const tassel = (x, y, z) => place(tube({ prof: [[-0.032, 0.007, 0.007], [-0.012, 0.010, 0.010], [-0.004, 0.006, 0.006], [0.0, 0.004, 0.004]], y0: -0.034, y1: 0.0, capB: 0.005, capT: 0.003, radial: 8, rings: 5, ripple: (yy, a) => 0.0014 * Math.cos(a * 8) * (1 - sstep(-0.012, 0, yy)) }), x, y, z);
      gs.push(tassel(cordA[3][0], cordA[3][1] - 0.030, cordA[3][2]), tassel(cordB[3][0], cordB[3][1] - 0.028, cordB[3][2]));
      add(hips, redDk, ...gs);
      // gold bells: a sphere with a proper slit across the lower front and a round hole below it, a loop on top
      const bell = (x, y, z, r) => [place(tube({ prof: [[-r, r * 0.9, r * 0.9], [-r * 0.3, r, r], [r * 0.6, r * 0.8, r * 0.8], [r, r * 0.35, r * 0.35]], y0: -r, y1: r, capB: r * 0.4, capT: r * 0.3, radial: 12, rings: 7 }), x, y, z),
        place(new THREE.TorusGeometry(r * 0.35, r * 0.12, 4, 8), x, y + r + r * 0.2, z, PI / 2, 0, 0)];
      const bellSlit = (x, y, z, r) => [place(flat(r * 1.5, r * 0.16, r * 0.5, r * 0.05), x, y - r * 0.25, z + r * 0.85, 0.25, 0, 0), place(ell(r * 0.16, r * 0.16, r * 0.3, 6, 4), x, y - r * 0.6, z + r * 0.72)];
      add(hips, gold, ...bell(cordA[3][0], cordA[3][1] - 0.008, cordA[3][2], 0.021), ...bell(cordB[3][0], cordB[3][1] - 0.008, cordB[3][2], 0.019));
      add(hips, ink, ...bellSlit(cordA[3][0], cordA[3][1] - 0.008, cordA[3][2], 0.021), ...bellSlit(cordB[3][0], cordB[3][1] - 0.008, cordB[3][2], 0.019));
      // TALISMAN BUNDLE at the left hip (+X): a stack of paper strips tied with red rope, tilted outward so it clears the skirt hem
      const tal = new THREE.Object3D(); tal.position.set(0.146, 0.085, 0.050); tal.rotation.set(-0.12, 0.45, 0.36); hips.add(tal);
      const ps = [], is = [];
      for (let i = 0; i < 5; i++) {
        const dx = (i - 2) * 0.0075, dz = Math.abs(i - 2) * -0.0055;
        ps.push(place(flat(0.056 - Math.abs(i - 2) * 0.006, 0.235, 0.0016, 0.003), dx, -0.132 + (i % 2) * 0.006, dz, 0.03 * (i - 2), 0.20 * (i - 2), 0.05 * (i - 2)));
      }
      for (let k = 0; k < 6; k++) is.push(place(flat(0.006, 0.020 + (k % 3) * 0.006, 0.001, 0.002), 0.0135, -0.050 - k * 0.032, -0.0086 + 0.0016, 0, 0.32, 0));
      for (let k = 0; k < 4; k++) is.push(place(flat(0.005, 0.016 + (k % 2) * 0.008, 0.001, 0.002), -0.0135, -0.060 - k * 0.040, -0.0086 + 0.0016, 0, -0.32, 0));
      add(tal, W.paper, ...ps); add(tal, ink, ...is);
      const wrapT = [];
      for (const yy of [-0.010, -0.024, -0.038]) wrapT.push(place(new THREE.TorusGeometry(0.021, 0.0036, 5, 12), 0, yy, -0.006, PI / 2, 0, 0));
      wrapT.push(...twistCord([[0.005, -0.006, 0.020], [0.010, -0.045, 0.026], [0.006, -0.085, 0.030]], 0.0032, 6));
      add(tal, redDk, ...wrapT);
      // garter straps: from under the skirt to the stocking tops, with a small clip at the bottom
      const gt = [], clips = [];
      for (const s of [-1, 1]) { gt.push(place(flat(0.012, 0.100, 0.002, 0.002), s * 0.082, -0.262, 0.072, 0.20, 0, 0)); gt.push(place(flat(0.012, 0.100, 0.002, 0.002), s * 0.086, -0.262, -0.070, -0.20, 0, 0));
        clips.push(place(flat(0.014, 0.010, 0.004, 0.002), s * 0.082, -0.312, 0.079, 0.20, 0, 0), place(flat(0.014, 0.010, 0.004, 0.002), s * 0.086, -0.312, -0.077, -0.20, 0, 0)); }
      add(hips, black, ...gt); add(hips, W.metalM || gold, ...clips);
    }
    /* ---- kosode: lower half on the spine, upper on the chest, piping, collar, side seams */
    add(spine, white, place(tube({ surf: torsoS, y0: -0.170, y1: 0.06, capB: 0.02, capT: 0.015, radial: 18, rings: 7,
      post: (x, y, z) => { const k = 1 - 0.022 * sstep(0.0, 0.045, y); return [x * k, y, z * k]; } }), 0, SP, 0));
    { const pts = []; for (let i = 0; i <= 5; i++) { const y = -0.165 + i * 0.045; const p = torsoS(y, 0.06); pts.push([p[0], p[1] + SP, p[2] + 0.0025]); }
      const ss = []; for (const s of [-1, 1]) ss.push(seam(trace(torsoS, -0.165, s * PI / 2, -0.06, s * PI / 2, 4, 0.0018).map((p) => [p[0], p[1] + SP, p[2]]), 0.0016, 6, false, 4));
      add(spine, trim, seam(pts, 0.0035, 8)); add(spine, white, ...ss); }
    add(chest, white, tube({ surf: torsoS, y0: -0.06, y1: 0.262, capB: 0.012, capT: 0.014, radial: 18, rings: 12,
      post: (x, y, z) => { const k = 1 - 0.022 * (1 - sstep(-0.05, 0.0, y)); return [x * k, y, z * k]; } }));
    { const gs = [], ss = [];
      for (const s of [-1, 1]) {
        const pts = []; for (let i = 0; i <= 6; i++) { const t = i / 6; const a = s * (0.62 - 0.62 * t), y = 0.245 - 0.16 * t; const p = torsoS(y, a * (1 + 0.3 * (1 - t))); pts.push([p[0], p[1], p[2] + 0.0025]); }
        gs.push(seam(pts, 0.0038, 8));
        const ah = []; for (let i = 0; i < 12; i++) { const a = (i / 12) * 2 * PI; const y = 0.150 + 0.058 * Math.sin(a), ang = s * (PI / 2) + 0.48 * Math.cos(a) * s; const p = torsoS(y, ang); ah.push([p[0] * 1.02, p[1], p[2] * 1.02]); }
        gs.push(seam(ah, 0.0032, 12, true));
        ss.push(seam(trace(torsoS, -0.055, s * PI / 2, 0.10, s * PI / 2, 4, 0.0018), 0.0016, 6, false, 4));                           // side seams
        ss.push(seam(trace(torsoS, 0.02, s * 0.30, 0.09, s * 0.36, 4, 0.0016), 0.0014, 6, false, 4));                                  // bust dart
      }
      const fc = []; for (let i = 0; i <= 3; i++) { const y = 0.085 - i * 0.045; const p = torsoS(y, 0.06); fc.push([p[0], p[1], p[2] + 0.0025]); }
      gs.push(seam(fc, 0.0035, 8));
      add(chest, trim, ...gs); add(chest, white, ...ss);
      // collar band (white, standing proud round the back of the neck), with a rolled top edge
      const colS = surfOf({ prof: [[0.205, 0.098, 0.080, 0.086, 0, -0.012], [0.250, 0.080, 0.072, 0.078, 0, -0.016]] });
      add(chest, white, tube({ surf: colS, y0: 0.195, y1: 0.254, capB: 0.01, capT: 0.006, radial: 14, rings: 4,
        post: (x, y, z, a) => [x, y + 0.012 * (1 - Math.cos(a)) * 0.5 * sstep(0.21, 0.25, y) - 0.010 * Math.max(0, Math.cos(a)) ** 2 * sstep(0.21, 0.25, y), z] }),
        seam(ring(colS, 0.250, 14, 0.001).map((p) => [p[0], p[1] + 0.012 * (1 - Math.cos(Math.atan2(p[0], p[2] + 0.016))) * 0.5 - 0.010 * Math.max(0, Math.cos(Math.atan2(p[0], p[2] + 0.016))) ** 2, p[2]]), 0.0028, 14, true, 4));
    }
    /* ---- arms: detached sleeve tied with a ribbon, wide kimono cuff with a rolled hem, wrist cord */
    for (const side of [1, -1]) {
      const { sh, el } = arms[side > 0 ? 'L' : 'R'];
      const topS = surfOf({ prof: [[-0.262, 0.061, 0.063, 0.065], [-0.200, 0.055, 0.057, 0.059], [-0.140, 0.048, 0.049, 0.051], [-0.110, 0.046, 0.047, 0.047]], ripple: (y, a) => 0.0022 * Math.sin(a * 6 + y * 70) });
      add(sh, white, tube({ surf: topS, y0: -0.264, y1: -0.108, capB: 0.02, capT: 0.006, radial: 12, rings: 8 }),
        seam(trace(topS, -0.250, side * PI / 2 + 0.3, -0.120, side * PI / 2 + 0.3, 4, 0.0016), 0.0014, 6, false, 4));                    // sleeve seam
      const rib = [];
      rib.push(place(new THREE.TorusGeometry(0.0475, 0.0045, 5, 14), 0, -0.112, 0, PI / 2, 0, 0));
      const bx = side * 0.040, bz = 0.028;
      rib.push(place(new THREE.TorusGeometry(0.011, 0.0035, 4, 8), bx, -0.108, bz, 0.4, side * 0.9, 0.3));
      rib.push(place(new THREE.TorusGeometry(0.010, 0.0035, 4, 8), bx + side * 0.004, -0.116, bz + 0.010, -0.3, side * 0.9, -0.2));
      rib.push(place(ell(0.006, 0.005, 0.005, 6, 4), bx + side * 0.001, -0.112, bz + 0.006));                                              // knot
      rib.push(place(flat(0.007, 0.070, 0.0015, 0.002), bx + side * 0.006, -0.152, bz + 0.012, 0.15, side * 0.4, side * 0.12), place(flat(0.007, 0.062, 0.0015, 0.002), bx - side * 0.010, -0.148, bz + 0.012, 0.18, side * 0.4, side * -0.16));   // flat ribbon ends
      add(sh, redDk, ...rib);
      const cuffS = surfOf({
        sq: 0.85,
        prof: [[-0.232, 0.076, 0.070, 0.112, 0, -0.024], [-0.200, 0.078, 0.070, 0.114, 0, -0.024], [-0.150, 0.074, 0.066, 0.100, 0, -0.018], [-0.090, 0.068, 0.062, 0.082, 0, -0.010], [-0.030, 0.060, 0.058, 0.064, 0, -0.004], [0.030, 0.054, 0.054, 0.056, 0, 0.0], [0.061, 0.050, 0.052, 0.054, 0, 0.0]],
        ripple: (y, a) => 0.0030 * Math.sin(a * 5 + y * 40) * sstep(0.06, -0.10, y) + 0.0008 * Math.sin(a * 7) + 0.0025 * gauss((y + 0.02) / 0.04) * Math.sin(a * 4 + 1.2),   // elbow creases
        bulges: [{ y: -0.19, h: 0.05, a: PI, w: 0.7, amp: 0.008 }],
      });
      add(el, white, tube({ surf: cuffS, y0: -0.234, y1: 0.061, capB: 0.006, capT: 0.061, radial: 14, rings: 11,
        post: (x, y, z, a, k) => { if (y < -0.226) { const d = 1 - 0.55 * (1 - k); return [x * d, y + 0.012 * (1 - k), z * d]; } return [x, y, z]; } }),
        seam(trace(cuffS, -0.225, PI, 0.05, PI, 5, 0.0018), 0.0015, 6, false, 4));                                                          // back seam of the sleeve
      const bandS = surfOf({ sq: 0.85, prof: cuffS.P.map((q) => [q[0], q[1] + 0.003, q[2] + 0.003, q[3] + 0.003, q[4], q[5]]), ripple: (y, a) => 0.0008 * Math.sin(a * 7) });
      add(el, trim, tube({ surf: bandS, y0: -0.236, y1: -0.200, capB: 0.004, capT: 0.003, radial: 14, rings: 6,
        post: (x, y, z, a, k) => { if (y < -0.228) { const d = 1 - 0.5 * (1 - k); return [x * d, y + 0.022 * (1 - k), z * d]; } return [x, y, z]; } }), rolledHem(bandS, -0.234, 14, 0.0032, 0.0005));
      add(el, redDk, ...twistCord(ring(surfOf({ prof: [[-0.27, 0.0305, 0.0305], [-0.25, 0.0305, 0.0305]] }), -0.262, 12, 0).concat([ring(surfOf({ prof: [[-0.27, 0.0305, 0.0305], [-0.25, 0.0305, 0.0305]] }), -0.262, 12, 0)[0]]), 0.0026, 8));   // wrist cord, twisted
    }
    /* ---- head: red headband with a hanging ribbon + tassel, kitsune mask on the LEFT side of the head */
    { const hairS = surfOf({ prof: [[-0.005, 0.040, 0.050, 0.046], [0.020, 0.062, 0.066, 0.074], [0.050, 0.079, 0.082, 0.099], [0.092, 0.085, 0.091, 0.107], [0.135, 0.080, 0.087, 0.101, 0, -0.002], [0.175, 0.060, 0.066, 0.076, 0, -0.004], [0.194, 0.040, 0.046, 0.052, 0, -0.004]] });
      const band = []; for (let i = 0; i < 18; i++) { const a = (i / 18) * 2 * PI; const p = hairS(0.100 + 0.012 * Math.cos(a), a); band.push([p[0] * 1.035, p[1], p[2] * 1.035]); }
      add(head, redDk, seam(band, 0.0065, 20, true, 5), place(flat(0.006, 0.120, 0.0015, 0.002), 0.100, 0.025, -0.032, 0.25, 0.3, 0.04),
        place(new THREE.CylinderGeometry(0.004, 0.007, 0.024, 7), 0.104, -0.048, -0.040), place(new THREE.TorusGeometry(0.004, 0.0015, 4, 8), 0.104, -0.036, -0.040, PI / 2, 0, 0));
      foxMask(head, 0.084, 0.118, 0.024, 0.22, 1.30, -0.38, 1.18);
      add(head, redDk, place(new THREE.TorusGeometry(0.046 * 1.18, 0.0030, 4, 14), 0.084, 0.118, 0.024, 0.22, 1.30, -0.38));                 // mask cord
    }
    /* ---- legs: thigh cover under the skirt, thigh-highs with rolled tops + back seam, sock-boot top with cord lacing, tabi sock on a zori sole */
    for (const side of [1, -1]) {
      const { hp, kn, an } = legs[side > 0 ? 'L' : 'R'];
      add(hp, W.cover, tube({ prof: [[-0.150, 0.071, 0.074, 0.075], [-0.080, 0.081, 0.084, 0.087], [0.0, 0.085, 0.086, 0.086], [0.050, 0.085, 0.086, 0.086]],
        y0: -0.150, y1: 0.050, capB: 0.012, capT: 0.03, radial: 16, rings: 6,
        ripple: (y, a) => { const t = ((a / (2 * PI)) * 8 + 100) % 1; return 0.004 * (1 - sstep(-0.06, 0.02, y)) * (t < 0.6 ? t / 0.6 * 2 - 1 : 1 - (t - 0.6) / 0.4 * 2); } }));
      const stockS = surfOf({ prof: thighProf.map((p) => [p[0], p[1] + 0.003, p[2] + 0.003, p[3] + 0.003]), bulges: thighBulges(side),
        ripple: (y, a) => 0.0035 * sstep(-0.246, -0.232, y) + 0.0012 * Math.sin(y * 300 + a) * gauss((y + 0.39) / 0.03) * Math.max(0, -Math.cos(a)) });   // rolled top band + creases behind the knee
      add(hp, black, tube({ surf: stockS, y0: -0.419, y1: -0.226, capB: 0.055, capT: 0.006, radial: 12, rings: 10 }),
        rolledHem(stockS, -0.232, 12, 0.0030, 0.001), seam(trace(stockS, -0.410, PI, -0.25, PI, 5, 0.0016), 0.0013, 6, false, 4));
      const calfS = surfOf({ prof: calfProf.map((p) => [p[0], p[1] + 0.0025, p[2] + 0.0025, p[3] + 0.0025]), bulges: calfBulges,
        ripple: (y, a) => 0.0015 * Math.sin(y * 260 + a * 2) * gauss((y - 0.0) / 0.03) * Math.max(0, -Math.cos(a)) });
      add(kn, black, tube({ surf: calfS, y0: -0.300, y1: 0.0515, capB: 0.02, capT: 0.0515, radial: 12, rings: 10 }), seam(trace(calfS, -0.28, PI, 0.02, PI, 5, 0.0016), 0.0013, 6, false, 4));
      const bootS = surfOf({ prof: [[-0.345, 0.046, 0.050, 0.052], [-0.320, 0.050, 0.054, 0.056], [-0.290, 0.049, 0.052, 0.054], [-0.265, 0.046, 0.049, 0.051], [-0.240, 0.048, 0.050, 0.053], [-0.225, 0.044, 0.046, 0.048]],
        ripple: (y, a) => 0.0035 * Math.sin(y * 150 + a * 2) + 0.0018 * Math.sin(a * 7) });
      add(kn, sock, tube({ surf: bootS, y0: -0.347, y1: -0.223, capB: 0.006, capT: 0.008, radial: 12, rings: 7 }), rolledHem(bootS, -0.226, 12, 0.0032, 0.0));
      { const cs = [];
        for (const [y, dir] of [[-0.300, 1], [-0.278, -1]]) { const rg = []; for (let i = 0; i < 12; i++) { const a = (i / 12) * 2 * PI; const r = 0.0505 + 0.004 * Math.sin(a * 2); rg.push([r * Math.sin(a), y + dir * 0.010 * Math.cos(a), r * Math.cos(a) * 1.06]); } cs.push(seam(rg, 0.0026, 12, true)); }
        cs.push(place(new THREE.TorusGeometry(0.009, 0.0028, 4, 8), side * 0.010, -0.288, 0.056, 0.3, side * 0.7, 0.2), place(new THREE.TorusGeometry(0.009, 0.0028, 4, 8), side * -0.010, -0.290, 0.056, -0.3, side * -0.7, -0.2));
        cs.push(place(ell(0.004, 0.0035, 0.0035, 6, 4), 0, -0.289, 0.058));
        cs.push(seam([[side * 0.004, -0.295, 0.056], [side * 0.010, -0.320, 0.062], [side * 0.012, -0.340, 0.060]], 0.0022, 4), seam([[side * -0.004, -0.295, 0.056], [side * -0.012, -0.318, 0.060], [side * -0.016, -0.338, 0.056]], 0.0022, 4));
        add(kn, redDk, ...cs);
      }
      // ZORI: sole slab with a bevelled edge, a raised heel wedge, a lighter rim; tabi sock with the toe notch; red cords + thong
      add(an, soleM, soleExt(side, 1.0, 0.018, 0.003, -0.058));
      add(an, M(0x3a3436, undefined, 0.8), soleExt(side, 1.0, 0.003, 0.0, -0.0585));                                                       // rim
      const upper = footTube(side, 0, (y, a) => (y > 0.10 ? -0.004 * Math.exp(-(((wrap(a) - side * 0.35) / 0.18) ** 2)) * sstep(0.10, 0.15, y) : 0) + 0.0015 * Math.sin(y * 90 + a * 3) * (1 - sstep(0.0, 0.05, y)));
      add(an, sock, upper, ell(0.037, 0.036, 0.039, 8, 5), place(ell(0.018, 0.010, 0.012, 7, 4), 0, -0.048, -0.055, 0, 0, 0));           // sock ball + heel
      { const cs = [];
        for (const [z0, z1, s] of [[0.02, 0.08, 1], [0.02, 0.08, -1], [0.07, 0.12, 1], [0.07, 0.12, -1]]) { const a = [], n = 5; for (let i = 0; i <= n; i++) { const t = i / n, z = z0 + (z1 - z0) * t, x = s * side * (0.030 - 0.060 * t); a.push([x, footTop(side, x, z), z]); } cs.push(seam(a, 0.0024, 5)); }
        cs.push(seam([[side * 0.012, -0.052, 0.13], [side * 0.004, -0.030, 0.15], [0.0, -0.052, 0.17]], 0.0024, 4));
        cs.push(seam([[side * 0.006, -0.036, 0.148], [side * 0.030, -0.046, 0.10], [side * 0.040, -0.052, 0.04]], 0.0022, 5), seam([[side * 0.002, -0.036, 0.148], [side * -0.028, -0.046, 0.10], [side * -0.038, -0.052, 0.04]], 0.0022, 5));   // side straps
        add(an, redDk, ...cs);
      }
    }
  }

  /* ================================================================ OUTFIT 2: FESTIVAL YUKATA */
  function outfitYukata() {
    const robe = W.robe, obi = W.obi;
    // scattered flower print: small blossoms laid on a surface (five petals + centre) so the yukata reads as a summer print without a texture
    const blossom = (S, y, a, r, lift = 0.0015) => { const fr = frameAt(S, y, a), gs = []; for (let i = 0; i < 5; i++) { const t = (i / 5) * 2 * PI; gs.push(onFrame(place(ell(r * 0.55, r * 0.40, 0.0012, 6, 3), Math.cos(t) * r * 0.62, Math.sin(t) * r * 0.62, 0, 0, 0, t), fr, lift)); } return gs; };
    /* ---- robe skirt on the hips: A-line to just above the knee, split high at both sides for running; ohashori fold under the obi */
    const hemY = (a) => { let h = -0.420; for (const s of [-1, 1]) { const d = Math.abs(wrap(a - s * PI / 2)); if (d < 0.42) h = Math.max(h, -0.420 + 0.27 * Math.pow(1 - d / 0.42, 1.25)); } return h; };
    const robeProf = [[-0.420, 0.190, 0.150, 0.158], [-0.300, 0.176, 0.128, 0.136], [-0.180, 0.164, 0.112, 0.120], [-0.080, 0.150, 0.096, 0.104], [0.0, 0.140, 0.088, 0.096], [0.060, 0.134, 0.086, 0.094]];
    const robeS = surfOf({ sq: 0.92, prof: robeProf, ripple: (y, a) => 0.004 * Math.sin(a * 9 + 0.4) * (1 - sstep(-0.30, -0.05, y)) + 0.0015 * Math.sin(a * 21 + y * 40) * (1 - sstep(-0.3, 0.0, y)) + 0.003 * gauss((y + 0.02) / 0.04) * Math.sin(a * 6) });
    const yTop = 0.060, y0 = -0.420;
    const ymap = (y, a) => { const h = hemY(a); return h + (y - y0) * (yTop - h) / (yTop - y0); };
    add(hips, robe, tube({ surf: robeS, y0, y1: yTop, capB: 0.004, capT: 0.010, radial: 48, rings: 14, ymap }));
    add(hips, W.lining, tube({ surf: offsetSurf(robeS, -0.005), y0, y1: -0.15, capB: 0.003, capT: 0.003, radial: 48, rings: 5, ymap: (y, a) => { const h = hemY(a); return h + (y - y0) * (-0.15 - h) / (-0.15 - y0); } }));
    add(hips, robe, rolledHem(robeS, 0, 48, 0.0032, -0.001, hemY));
    // slit edges: the two vertical hems where the panels part, on each side
    for (const s of [-1, 1]) for (const e of [-1, 1]) add(hips, robe, seam(trace(robeS, -0.418, s * PI / 2 + e * 0.40, -0.152, s * PI / 2 + e * 0.02, 6, 0.0015), 0.0028, 8, false, 4));
    add(hips, W.print, ...blossom(robeS, -0.30, 0.25, 0.022), ...blossom(robeS, -0.20, -0.55, 0.018), ...blossom(robeS, -0.36, -0.15, 0.016), ...blossom(robeS, -0.12, 0.85, 0.017),
      ...blossom(robeS, -0.28, PI - 0.4, 0.020), ...blossom(robeS, -0.16, PI + 0.5, 0.017), ...blossom(robeS, -0.38, PI + 0.1, 0.015), ...blossom(robeS, -0.24, -1.9, 0.016));
    // thigh cover: robe colour front/back only (shrunk inside the thigh at the sides so the slits show skin)
    for (const side of [1, -1]) {
      const { hp } = legs[side > 0 ? 'L' : 'R'];
      add(hp, W.cover, tube({ prof: [[-0.150, 0.071, 0.074, 0.075], [-0.080, 0.081, 0.084, 0.087], [0.0, 0.085, 0.086, 0.086], [0.050, 0.085, 0.086, 0.086]], y0: -0.150, y1: 0.050, capB: 0.012, capT: 0.03, radial: 16, rings: 6,
        post: (x, y, z, a) => { const k = 1 - 0.16 * gauss(wrap(a - side * PI / 2) / 0.45); return [x * k, y, z * k]; } }));
    }
    /* ---- ohashori (the tucked fold) just under the obi, then the wide OBI with a rolled top and bottom, its cord, and the bow at the back */
    const foldS = surfOf({ sq: 0.92, prof: [[0.010, 0.146, 0.094, 0.102], [0.030, 0.148, 0.096, 0.104], [0.040, 0.143, 0.092, 0.100]], ripple: (y, a) => 0.002 * Math.sin(a * 13) });
    add(hips, robe, tube({ surf: foldS, y0: 0.008, y1: 0.042, capB: 0.004, capT: 0.003, radial: 24, rings: 4 }));
    const obiS = surfOf({ sq: 0.88, prof: [[0.035, 0.140, 0.096, 0.104], [0.100, 0.136, 0.094, 0.102], [0.175, 0.130, 0.090, 0.098]], ripple: (y, a) => 0.0012 * Math.sin(y * 260) });
    add(hips, obi, tube({ surf: obiS, y0: 0.035, y1: 0.175, capB: 0.004, capT: 0.004, radial: 24, rings: 8 }), rolledHem(obiS, 0.037, 24, 0.003, 0.001), rolledHem(obiS, 0.173, 24, 0.003, 0.001));
    add(hips, W.obiCord, ...twistCord(ring(obiS, 0.108, 24, 0.0035).concat([ring(obiS, 0.108, 24, 0.0035)[0]]), 0.0036, 26),
      place(new THREE.TorusGeometry(0.012, 0.0045, 5, 10), 0.030, 0.108, 0.108, 0.3, 0.2, 0.4), place(new THREE.TorusGeometry(0.010, 0.0040, 5, 10), 0.012, 0.104, 0.110, -0.2, -0.3, -0.5));   // obijime knot
    { // bow (bunko musubi): two flat loops, a centre knot, two hanging tails; parented to the hips, at the upper back
      const bow = new THREE.Object3D(); bow.position.set(0, 0.155, -0.108); bow.rotation.set(-0.12, 0, 0); hips.add(bow);
      const loop = (s) => tube({ prof: [[-0.005, 0.030, 0.014, 0.014], [0.050, 0.038, 0.020, 0.020], [0.105, 0.034, 0.018, 0.018], [0.135, 0.020, 0.010, 0.010]], y0: -0.006, y1: 0.136, capB: 0.006, capT: 0.012, radial: 12, rings: 8,
        ripple: (y, a) => 0.0025 * Math.sin(a * 2 + y * 30) + 0.0015 * Math.sin(y * 120) * Math.abs(Math.cos(a)) });
      add(bow, obi, place(loop(1), 0.020, 0.010, -0.010, 0.10, 0, -1.30), place(loop(-1), -0.020, 0.010, -0.010, 0.10, 0, 1.30),
        place(tube({ prof: [[-0.030, 0.014, 0.020, 0.020], [0.0, 0.018, 0.026, 0.026], [0.030, 0.014, 0.020, 0.020]], y0: -0.032, y1: 0.032, capB: 0.008, capT: 0.008, radial: 10, rings: 5, ripple: (y, a) => 0.002 * Math.sin(a * 6) }), 0, 0.005, -0.006),
        place(flat(0.050, 0.150, 0.004, 0.004), 0.030, -0.085, -0.015, 0.15, 0, 0.10), place(flat(0.050, 0.130, 0.004, 0.004), -0.030, -0.075, -0.020, 0.15, 0, -0.10));   // tails
      add(bow, W.print, ...[[0.075, 0.032], [-0.075, 0.030], [0.028, -0.110], [-0.032, -0.100]].map(([x, y]) => place(ell(0.008, 0.008, 0.0015, 6, 4), x, y, x > 0.05 || x < -0.05 ? 0.012 : -0.012)));
    }
    /* ---- paper fan tucked in the obi at the RIGHT hip (-X), folded: tapered ribs stack with a rivet and a tassel */
    { const fan = new THREE.Object3D(); fan.position.set(-0.118, 0.150, -0.040); fan.rotation.set(0.25, -0.2, 0.55); hips.add(fan);
      add(fan, W.fan, tube({ prof: [[0.0, 0.008, 0.0040, 0.0040], [0.070, 0.011, 0.0048, 0.0048], [0.200, 0.016, 0.0055, 0.0055], [0.235, 0.019, 0.0060, 0.0060]], y0: 0.0, y1: 0.236, capB: 0.004, capT: 0.003, radial: 10, rings: 6, ripple: (y, a) => 0.0012 * Math.sin(a * 10 + 1) }));
      add(fan, W.fanRib, place(ell(0.010, 0.010, 0.0075, 8, 5), 0, 0.006, 0), place(flat(0.006, 0.236, 0.0100, 0.002), 0.016, 0.118, 0, 0, 0, 0.06), place(flat(0.006, 0.236, 0.0100, 0.002), -0.016, 0.118, 0, 0, 0, -0.06));   // rivet + outer guard ribs
      add(fan, W.obiCord, seam([[0, -0.004, 0], [0.010, -0.030, 0.006], [0.014, -0.050, 0.010]], 0.0022, 5, false, 4), place(tube({ prof: [[-0.028, 0.006, 0.006], [-0.010, 0.008, 0.008], [0, 0.004, 0.004]], y0: -0.030, y1: 0, capB: 0.004, capT: 0.003, radial: 7, rings: 4, ripple: (yy, a) => 0.0012 * Math.cos(a * 7) }), 0.016, -0.055, 0.012));
    }
    /* ---- fox mask hung on the obi at the LEFT hip (+X), facing out */
    foxMask(hips, 0.148, 0.085, 0.010, 0.10, 1.35, -0.10, 1.10, 0.012);
    add(hips, W.obiCord, seam([[0.132, 0.140, 0.014], [0.140, 0.120, 0.012], [0.146, 0.100, 0.012]], 0.0025, 4, false, 4));
    /* ---- torso: yukata body with the cross collar (eri) and an inner han-eri layer; sleeves attached at the shoulder */
    const yS = offsetSurf(torsoS, 0.007);
    add(spine, robe, place(tube({ surf: yS, y0: -0.170, y1: 0.06, capB: 0.02, capT: 0.015, radial: 18, rings: 7 }), 0, SP, 0));
    add(spine, robe, seam(trace(yS, -0.165, 0.10, -0.06, 0.12, 4, 0.002).map((p) => [p[0], p[1] + SP, p[2]]), 0.0030, 6, false, 4));       // front overlap edge
    add(chest, robe, tube({ surf: yS, y0: -0.06, y1: 0.262, capB: 0.012, capT: 0.014, radial: 18, rings: 12 }));
    { const gs = [], ss = [], hs = [];
      for (const s of [-1, 1]) {
        const pts = []; for (let i = 0; i <= 6; i++) { const t = i / 6; const a = s * (0.62 - 0.52 * t), y = 0.245 - 0.17 * t; const p = yS(y, a * (1 + 0.3 * (1 - t))); pts.push([p[0], p[1], p[2] + 0.0025]); }
        gs.push(seam(pts, 0.0060, 8, false, 6));                                                                                             // eri (collar band)
        const inner = []; for (let i = 0; i <= 5; i++) { const t = i / 5; const a = s * (0.50 - 0.42 * t), y = 0.235 - 0.14 * t; const p = yS(y, a); inner.push([p[0] * 0.985, p[1], p[2] * 0.985 + 0.001]); }
        hs.push(seam(inner, 0.0032, 8, false, 4));                                                                                          // han-eri showing inside the V
        ss.push(seam(trace(yS, -0.055, s * PI / 2, 0.14, s * PI / 2, 4, 0.0018), 0.0016, 6, false, 4));
      }
      add(chest, obi, ...gs); add(chest, W.print, ...hs); add(chest, robe, ...ss);
      const colS = surfOf({ prof: [[0.215, 0.104, 0.086, 0.090, 0, -0.010], [0.262, 0.084, 0.076, 0.082, 0, -0.014]] });
      add(chest, obi, tube({ surf: colS, y0: 0.20, y1: 0.266, capB: 0.01, capT: 0.006, radial: 14, rings: 4, post: (x, y, z, a) => [x, y + 0.016 * (1 - Math.cos(a)) * 0.5 * sstep(0.22, 0.262, y) - 0.010 * Math.max(0, Math.cos(a)) ** 2, z] }));
      add(chest, W.print, ...blossom(yS, 0.06, -0.75, 0.020), ...blossom(yS, 0.16, 0.95, 0.017), ...blossom(yS, 0.02, PI + 0.4, 0.019), ...blossom(yS, -0.02, PI - 0.9, 0.016), ...blossom(yS, 0.12, PI + 0.05, 0.015));
    }
    for (const side of [1, -1]) {
      const { sh, el } = arms[side > 0 ? 'L' : 'R'];
      const upS = surfOf({ prof: [[-0.262, 0.058, 0.060, 0.062], [-0.180, 0.052, 0.054, 0.056], [-0.080, 0.049, 0.051, 0.052], [0.0, 0.052, 0.053, 0.053], [0.047, 0.050, 0.051, 0.051]], ripple: (y, a) => 0.0022 * Math.sin(a * 6 + y * 70) * (1 - sstep(-0.10, 0.0, y)) });
      add(sh, robe, tube({ surf: upS, y0: -0.264, y1: 0.047, capB: 0.02, capT: 0.047, radial: 12, rings: 8 }), seam(trace(upS, -0.250, side * PI / 2 + 0.2, 0.02, side * PI / 2 + 0.2, 4, 0.0016), 0.0014, 6, false, 4));
      add(sh, W.print, ...blossom(upS, -0.16, side * -0.9, 0.015));
      const cuffS = surfOf({
        sq: 0.85,
        prof: [[-0.226, 0.070, 0.064, 0.122, 0, -0.030], [-0.190, 0.072, 0.064, 0.124, 0, -0.030], [-0.140, 0.070, 0.062, 0.108, 0, -0.022], [-0.090, 0.066, 0.060, 0.086, 0, -0.012], [-0.030, 0.060, 0.058, 0.066, 0, -0.004], [0.030, 0.056, 0.056, 0.058, 0, 0.0], [0.061, 0.052, 0.054, 0.056, 0, 0.0]],
        ripple: (y, a) => 0.0030 * Math.sin(a * 5 + y * 40) * sstep(0.06, -0.10, y) + 0.0008 * Math.sin(a * 7) + 0.0025 * gauss((y + 0.02) / 0.04) * Math.sin(a * 4 + 1.2),
        bulges: [{ y: -0.18, h: 0.05, a: PI, w: 0.7, amp: 0.010 }],
      });
      add(el, robe, tube({ surf: cuffS, y0: -0.228, y1: 0.061, capB: 0.006, capT: 0.061, radial: 14, rings: 11,
        post: (x, y, z, a, k) => { if (y < -0.220) { const d = 1 - 0.55 * (1 - k); return [x * d, y + 0.012 * (1 - k), z * d]; } return [x, y, z]; } }),
        rolledHem(cuffS, -0.226, 14, 0.0032, 0.0005), seam(trace(cuffS, -0.220, PI, 0.05, PI, 5, 0.0018), 0.0015, 6, false, 4));
      add(el, W.lining, tube({ surf: offsetSurf(cuffS, -0.004), y0: -0.227, y1: -0.170, capB: 0.003, capT: 0.003, radial: 14, rings: 3 }));      // sleeve lining seen at the opening
      add(el, W.print, ...blossom(cuffS, -0.15, side * 0.4, 0.018), ...blossom(cuffS, -0.06, PI + side * 0.6, 0.015));
    }
    /* ---- head: flower kanzashi on the RIGHT side (-X) above the ear, with hanging bira strands */
    { const k = new THREE.Object3D(); k.position.set(-0.072, 0.118, 0.034); k.rotation.set(0.2, -0.9, 0.3); k.scale.setScalar(1.3); head.add(k);
      const petals = []; for (let i = 0; i < 6; i++) { const t = (i / 6) * 2 * PI; petals.push(place(ell(0.008, 0.020, 0.004, 7, 5), Math.cos(t + 0.3) * 0.016, Math.sin(t + 0.3) * 0.016, 0.004 - 0.002 * (i % 2), 0.25 * Math.sin(t), -0.25 * Math.cos(t), t + 0.3)); }
      for (let i = 0; i < 5; i++) { const t = (i / 5) * 2 * PI + 0.9; petals.push(place(ell(0.006, 0.013, 0.003, 6, 4), Math.cos(t) * 0.009, Math.sin(t) * 0.009, 0.010, 0.3 * Math.sin(t), -0.3 * Math.cos(t), t)); }
      add(k, W.flower, ...petals); add(k, W.flower2, place(ell(0.006, 0.006, 0.005, 8, 5), 0, 0, 0.013));
      const small = []; for (let i = 0; i < 5; i++) { const t = (i / 5) * 2 * PI; small.push(place(ell(0.005, 0.011, 0.003, 6, 4), 0.030 + Math.cos(t) * 0.009, -0.020 + Math.sin(t) * 0.009, 0.002, 0.2 * Math.sin(t), -0.2 * Math.cos(t), t)); }
      add(k, W.flower2, ...small, place(ell(0.003, 0.003, 0.003, 6, 4), 0.030, -0.020, 0.006));
      const st = []; for (const [x, l] of [[-0.006, 0.075], [0.004, 0.090], [0.012, 0.070]]) st.push(seam([[x, -0.012, 0.004], [x * 1.4, -0.012 - l * 0.5, 0.010], [x * 1.8, -0.012 - l, 0.006]], 0.0010, 5, false, 4), place(ell(0.0035, 0.0035, 0.0035, 6, 4), x * 1.8, -0.012 - l - 0.003, 0.006));
      add(k, gold, ...st);
    }
    /* ---- legs: bare calves, tabi socks on GETA (wooden platform on two teeth, hanao thong) */
    for (const side of [1, -1]) {
      const { kn, an } = legs[side > 0 ? 'L' : 'R'];
      const hem = surfOf({ prof: [[-0.30, 0.046, 0.048, 0.050], [-0.25, 0.047, 0.049, 0.051]] });
      add(kn, W.tabi, tube({ surf: hem, y0: -0.300, y1: -0.255, capB: 0.006, capT: 0.006, radial: 12, rings: 4, ripple: (y, a) => 0.0015 * Math.sin(a * 8 + y * 50) }));   // tabi ankle band, tucked into the sock ball
      // geta: platform (dai) with a bevelled edge, two teeth (ha), the foot raised 14 mm onto it
      const lift = 0.013;
      add(an, W.wood, soleExt(side, 1.04, 0.014, 0.003, -0.075 + 0.030), place(flat(0.070, 0.016, 0.012, 0.002), 0, -0.067, 0.115), place(flat(0.066, 0.016, 0.012, 0.002), 0, -0.067, 0.010));
      add(an, M(0xa88a68, 'timber', 0.7), soleExt(side, 0.96, 0.002, 0.0, -0.075 + 0.031));                                             // lighter top face of the dai
      const upper = footTube(side, 0, (y, a) => (y > 0.10 ? -0.004 * Math.exp(-(((wrap(a) - side * 0.35) / 0.18) ** 2)) * sstep(0.10, 0.15, y) : 0) + 0.0012 * Math.sin(y * 90 + a * 3) * (1 - sstep(0.0, 0.05, y)), lift);
      add(an, W.tabi, upper, place(ell(0.037, 0.036, 0.039, 8, 5), 0, lift * 0.5, 0), place(ell(0.018, 0.010, 0.012, 7, 4), 0, -0.048 + lift, -0.055));
      add(an, W.tabi, seam([[side * 0.012, footTop(side, side * 0.012, 0.09) + lift, 0.09], [side * 0.010, footTop(side, side * 0.010, 0.12) + lift, 0.12], [side * 0.012, footTop(side, side * 0.012, 0.15) + lift, 0.15]], 0.0012, 4, false, 4));   // tabi seam to the toe split
      // hanao: thong from between the toes back to both sides of the dai, twisted, with a knot
      add(an, W.hanao, ...twistCord([[side * 0.006, -0.036 + lift, 0.135], [side * 0.026, -0.042 + lift, 0.100], [side * 0.040, -0.046 + lift, 0.040]], 0.0034, 8), ...twistCord([[side * 0.006, -0.036 + lift, 0.135], [side * -0.022, -0.042 + lift, 0.100], [side * -0.038, -0.046 + lift, 0.040]], 0.0034, 8),
        place(ell(0.006, 0.006, 0.006, 6, 4), side * 0.006, -0.034 + lift, 0.137), place(new THREE.TorusGeometry(0.004, 0.0018, 4, 8), side * 0.006, -0.044 + lift, 0.150, 0.8, 0, 0));
    }
  }

  /* ================================================================ OUTFIT 3: NIGHT COURIER */
  function outfitCourier() {
    const jk = W.jacket, panel = W.panel, leg = W.leggings;
    /* ---- jacket: hip-length sport kimono, cross-front with a panel-colour lapel band, side splits at the hem, hem band, hood down behind the neck */
    const jS = offsetSurf(torsoS, 0.010);
    // jacket skirt on the hips (world 0.78-0.94), split at the sides
    const jhS = surfOf({ sq: 0.9, prof: [[-0.075, 0.150, 0.104, 0.112], [-0.020, 0.146, 0.100, 0.108], [0.040, 0.140, 0.096, 0.104], [0.090, 0.136, 0.094, 0.102]], ripple: (y, a) => 0.0025 * Math.sin(a * 7 + y * 60) * (1 - sstep(-0.06, 0.0, y)) });
    const jhem = (a) => { let h = -0.075; for (const s of [-1, 1]) { const d = Math.abs(wrap(a - s * PI / 2)); if (d < 0.22) h = Math.max(h, -0.075 + 0.045 * (1 - d / 0.22)); } return h; };
    add(hips, jk, tube({ surf: jhS, y0: -0.075, y1: 0.090, capB: 0.004, capT: 0.006, radial: 28, rings: 6, ymap: (y, a) => { const h = jhem(a); return h + (y + 0.075) * (0.090 - h) / 0.165; } }));
    add(hips, panel, tube({ surf: offsetSurf(jhS, 0.0015), y0: -0.075, y1: -0.052, capB: 0.003, capT: 0.003, radial: 28, rings: 3, ymap: (y, a) => { const h = jhem(a); return h + (y + 0.075) * (0.023) / 0.023; } }),
      rolledHem(jhS, 0, 28, 0.0030, 0.001, jhem));                                                                                      // hem band + rolled edge
    add(hips, W.lining || panel, tube({ surf: offsetSurf(jhS, -0.004), y0: -0.074, y1: -0.030, capB: 0.003, capT: 0.003, radial: 28, rings: 3, ymap: (y, a) => { const h = jhem(a); return h + (y + 0.074) * (-0.030 - h) / 0.044; } }));
    add(spine, jk, place(tube({ surf: jS, y0: -0.170, y1: 0.06, capB: 0.02, capT: 0.015, radial: 18, rings: 7 }), 0, SP, 0));
    add(spine, panel, seam(trace(jS, -0.165, 0.09, -0.06, 0.12, 4, 0.0025).map((p) => [p[0], p[1] + SP, p[2]]), 0.0055, 6, false, 5));   // lapel band, lower
    add(chest, jk, tube({ surf: jS, y0: -0.06, y1: 0.262, capB: 0.012, capT: 0.014, radial: 18, rings: 12,
      bulges: [{ y: 0.19, h: 0.03, a: 0.6, w: 0.5, amp: 0.004 }, { y: 0.19, h: 0.03, a: -0.6, w: 0.5, amp: 0.004 }] }));
    { const gs = [], ss = [];
      for (const s of [-1, 1]) {
        const pts = []; for (let i = 0; i <= 6; i++) { const t = i / 6; const a = s * (0.60 - 0.50 * t), y = 0.245 - 0.17 * t; const p = jS(y, a * (1 + 0.3 * (1 - t))); pts.push([p[0], p[1], p[2] + 0.0025]); }
        gs.push(seam(pts, 0.0055, 8, false, 5));                                                                                          // lapel band, upper
        ss.push(seam(trace(jS, -0.055, s * PI / 2, 0.15, s * PI / 2, 4, 0.002), 0.0016, 6, false, 4));                                  // side seams
        ss.push(seam(trace(jS, 0.150, s * 0.25, 0.235, s * 0.95, 5, 0.002), 0.0016, 6, false, 4));                                       // raglan seam
      }
      add(chest, panel, ...gs); add(chest, jk, ...ss);
      // shoulder yoke in the panel colour: a band over the upper back and shoulders
      add(chest, panel, tube({ surf: offsetSurf(torsoS, 0.0115), y0: 0.165, y1: 0.215, capB: 0.004, capT: 0.004, radial: 18, rings: 4, ymap: (y, a) => y - 0.020 * Math.max(0, Math.cos(a)) }));
      // hood, down: a bunched roll behind the neck with the lining showing, a draped panel on the upper back
      add(chest, jk, place(tube({ prof: [[-0.100, 0.028, 0.032, 0.030], [-0.050, 0.040, 0.046, 0.040], [0.0, 0.044, 0.052, 0.044], [0.050, 0.040, 0.046, 0.040], [0.100, 0.028, 0.032, 0.030]], y0: -0.100, y1: 0.100, capB: 0.025, capT: 0.025, radial: 12, rings: 9,
        ripple: (y, a) => 0.004 * Math.sin(a * 3 + y * 40) + 0.002 * Math.sin(a * 7 - y * 90) }), 0, 0.232, -0.082, 0.25, 0, PI / 2),
        place(tube({ prof: [[-0.060, 0.070, 0.024, 0.010], [-0.010, 0.078, 0.028, 0.012], [0.040, 0.066, 0.022, 0.010]], y0: -0.062, y1: 0.042, capB: 0.010, capT: 0.010, radial: 12, rings: 6, ripple: (y, a) => 0.003 * Math.sin(a * 5 + y * 50) }), 0, 0.170, -0.112, -0.18, 0, 0));
      add(chest, W.hood, place(tube({ prof: [[-0.085, 0.020, 0.024, 0.022], [0.0, 0.030, 0.036, 0.030], [0.085, 0.020, 0.024, 0.022]], y0: -0.085, y1: 0.085, capB: 0.02, capT: 0.02, radial: 10, rings: 6 }), 0, 0.252, -0.060, 0.35, 0, PI / 2));   // lining roll
      // collar: a short standing band in the panel colour
      add(chest, panel, tube({ prof: [[0.222, 0.100, 0.082, 0.088, 0, -0.010], [0.262, 0.086, 0.076, 0.082, 0, -0.014]], y0: 0.215, y1: 0.264, capB: 0.006, capT: 0.005, radial: 14, rings: 4, post: (x, y, z, a) => [x, y - 0.012 * Math.max(0, Math.cos(a)) ** 2, z] }));
      // waist drawcord with toggles
      add(spine, panel, ...twistCord(ring(jS, -0.155, 18, 0.003).map((p) => [p[0], p[1] + SP, p[2]]).concat([ring(jS, -0.155, 18, 0.003).map((p) => [p[0], p[1] + SP, p[2]])[0]]), 0.0026, 20),
        seam([[0.030, SP - 0.158, 0.096], [0.040, SP - 0.200, 0.106], [0.044, SP - 0.240, 0.110]], 0.0022, 4, false, 4), seam([[0.022, SP - 0.158, 0.098], [0.016, SP - 0.205, 0.108], [0.012, SP - 0.245, 0.112]], 0.0022, 4, false, 4));
      add(spine, W.metal, place(new THREE.CylinderGeometry(0.004, 0.004, 0.012, 6), 0.044, SP - 0.250, 0.110), place(new THREE.CylinderGeometry(0.004, 0.004, 0.012, 6), 0.012, SP - 0.255, 0.112));
    }
    /* ---- satchel at the RIGHT hip (-X), behind; strap across the chest from the left shoulder, buckle with a prong */
    { const sb = new THREE.Object3D(); sb.position.set(-0.148, -0.010, -0.075); sb.rotation.set(0.1, -1.25, 0.12); hips.add(sb);
      add(sb, W.satchel, plate(0.150, 0.115, 0.052, 0.014, 0.006), place(plate(0.150, 0.070, 0.008, 0.010, 0.002), 0, 0.028, 0.030, 0.12, 0, 0));      // body + flap
      add(sb, W.strap, place(flat(0.028, 0.050, 0.004, 0.003), 0.0, 0.006, 0.033, 0.05, 0, 0), place(flat(0.020, 0.030, 0.004, 0.002), 0.055, 0.060, 0, 0, 0, 0), place(flat(0.020, 0.030, 0.004, 0.002), -0.055, 0.060, 0, 0, 0, 0));   // flap strap + strap anchors
      add(sb, W.metal, place(new THREE.TorusGeometry(0.010, 0.0022, 5, 4), 0, -0.020, 0.037, 0, 0, PI / 4), seam([[0, -0.010, 0.036], [0, -0.024, 0.040], [0, -0.030, 0.039]], 0.0014, 3, false, 4),
        place(new THREE.TorusGeometry(0.008, 0.002, 5, 8), 0.055, 0.076, 0, PI / 2, 0, 0), place(new THREE.TorusGeometry(0.008, 0.002, 5, 8), -0.055, 0.076, 0, PI / 2, 0, 0));   // buckle + prong, D-rings
      // strap: a flat band wrapped on the jacket, from the left shoulder down across the chest and round to the right hip
      add(chest, W.strap, wrapOn(flat(0.030, 0.30, 0.0035, 0.004), jS, 0.100, -0.10, 0.002, 0.42), wrapOn(flat(0.030, 0.24, 0.0035, 0.004), jS, 0.120, PI + 0.30, 0.002, -0.55));
      add(spine, W.strap, wrapOn(flat(0.030, 0.13, 0.0035, 0.004), jS, -0.120, -0.62, 0.002, 0.95).translate(0, SP, 0), wrapOn(flat(0.030, 0.12, 0.0035, 0.004), jS, -0.120, PI + 0.85, 0.002, -1.0).translate(0, SP, 0));
    }
    /* ---- arms: fitted sleeves with ribbed cuffs and GLOW-TAPE stripes (emissive 0.6) */
    for (const side of [1, -1]) {
      const { sh, el } = arms[side > 0 ? 'L' : 'R'];
      const upS = surfOf({ prof: [[-0.262, 0.041, 0.043, 0.043], [-0.180, 0.043, 0.045, 0.045], [-0.080, 0.047, 0.049, 0.050], [0.0, 0.052, 0.053, 0.053], [0.047, 0.050, 0.051, 0.051]], ripple: (y, a) => 0.0015 * Math.sin(a * 6 + y * 70) * (1 - sstep(-0.15, -0.02, y)) });
      add(sh, jk, tube({ surf: upS, y0: -0.264, y1: 0.047, capB: 0.02, capT: 0.047, radial: 12, rings: 9 }), seam(trace(upS, -0.250, side * PI / 2 + 0.2, 0.02, side * PI / 2 + 0.2, 4, 0.0016), 0.0014, 6, false, 4));
      add(sh, panel, tube({ surf: offsetSurf(upS, 0.0015), y0: -0.070, y1: 0.030, capB: 0.003, capT: 0.003, radial: 12, rings: 3, ymap: (y, a) => y + 0.02 * Math.cos(a) }));   // shoulder panel
      add(sh, W.glow, tube({ surf: offsetSurf(upS, 0.002), y0: -0.215, y1: -0.200, capB: 0.002, capT: 0.002, radial: 12, rings: 3 }), tube({ surf: offsetSurf(upS, 0.002), y0: -0.190, y1: -0.175, capB: 0.002, capT: 0.002, radial: 12, rings: 3 }));
      const foS = surfOf({ prof: [[-0.250, 0.030, 0.032, 0.032], [-0.180, 0.034, 0.035, 0.035], [-0.070, 0.038, 0.039, 0.040], [0.0, 0.041, 0.042, 0.042], [0.040, 0.040, 0.041, 0.041]], ripple: (y, a) => 0.0020 * gauss((y + 0.02) / 0.04) * Math.sin(a * 4 + 1.2) + 0.001 * Math.sin(y * 200 + a * 3) * (1 - sstep(-0.24, -0.16, y)) });
      add(el, jk, tube({ surf: foS, y0: -0.252, y1: 0.040, capB: 0.006, capT: 0.040, radial: 12, rings: 9 }), seam(trace(foS, -0.245, PI, 0.03, PI, 5, 0.0016), 0.0013, 6, false, 4));
      add(el, panel, tube({ surf: offsetSurf(foS, 0.002), y0: -0.256, y1: -0.226, capB: 0.003, capT: 0.003, radial: 12, rings: 4, ripple: (y, a) => 0.0012 * Math.sin(a * 12) }), rolledHem(offsetSurf(foS, 0.002), -0.254, 12, 0.0026, 0.0));   // ribbed cuff
      add(el, W.glow, tube({ surf: offsetSurf(foS, 0.002), y0: -0.130, y1: -0.116, capB: 0.002, capT: 0.002, radial: 12, rings: 3 }), tube({ surf: offsetSurf(foS, 0.002), y0: -0.106, y1: -0.092, capB: 0.002, capT: 0.002, radial: 12, rings: 3 }));
    }
    /* ---- head: the fox mask worn OVER the face, tied with a cord round the head */
    foxMask(head, 0, 0.040, 0.070, 0.06, 0, 0, 1.45, 0.024);
    add(head, panel, seam([[0.062, 0.070, 0.058], [0.088, 0.078, 0.010], [0.092, 0.084, -0.050], [0.060, 0.090, -0.100], [0.0, 0.094, -0.118], [-0.060, 0.090, -0.100], [-0.092, 0.084, -0.050], [-0.088, 0.078, 0.010], [-0.062, 0.070, 0.058]], 0.0026, 16, false, 4));
    /* ---- legs: leggings with a side stripe, ankle socks, running SNEAKERS (midsole, outsole, toe cap, tongue, laces, heel tab) */
    for (const side of [1, -1]) {
      const { hp, kn, an } = legs[side > 0 ? 'L' : 'R'];
      const thS = surfOf({ prof: thighProf.map((p) => [p[0], p[1] + 0.002, p[2] + 0.002, p[3] + 0.002]), bulges: thighBulges(side), ripple: (y, a) => 0.001 * Math.sin(y * 300 + a) * gauss((y + 0.39) / 0.03) * Math.max(0, -Math.cos(a)) });
      add(hp, leg, tube({ surf: thS, y0: -0.419, y1: 0.079, capB: 0.052, capT: 0.079, radial: 12, rings: 11 }));
      add(hp, panel, seam(trace(thS, -0.410, side * PI / 2, 0.02, side * PI / 2, 5, 0.0018), 0.0022, 6, false, 4));
      const caS = surfOf({ prof: calfProf.map((p) => [p[0], p[1] + 0.002, p[2] + 0.002, p[3] + 0.002]), bulges: calfBulges, ripple: (y, a) => 0.0012 * Math.sin(y * 260 + a * 2) * gauss(y / 0.03) * Math.max(0, -Math.cos(a)) });
      add(kn, leg, tube({ surf: caS, y0: -0.300, y1: 0.0515, capB: 0.02, capT: 0.0515, radial: 12, rings: 10 }));
      add(kn, panel, seam(trace(caS, -0.29, side * PI / 2, 0.03, side * PI / 2, 5, 0.0018), 0.0022, 6, false, 4));
      add(kn, W.sock, tube({ prof: [[-0.335, 0.043, 0.046, 0.048], [-0.300, 0.044, 0.046, 0.048], [-0.270, 0.042, 0.044, 0.046]], y0: -0.337, y1: -0.268, capB: 0.006, capT: 0.006, radial: 12, rings: 5, ripple: (y, a) => 0.0012 * Math.sin(a * 14) }));   // ankle sock
      // sneaker: outsole (dark), thick midsole (sole colour) with a bevel, upper with a toe cap, tongue, eyelets, laces, heel tab
      add(an, M(0x2a2628, undefined, 0.85), soleExt(side, 1.06, 0.006, 0.0, -0.069));
      add(an, W.sole, soleExt(side, 1.06, 0.016, 0.004, -0.050), place(ell(0.030, 0.010, 0.020, 8, 4), 0, -0.050, 0.165), place(ell(0.028, 0.012, 0.018, 8, 4), 0, -0.052, -0.060));   // midsole, toe bumper, heel cup
      const upper = footTube(side, 0.003, (y, a) => 0.0012 * Math.sin(y * 90 + a * 3) * (1 - sstep(0.0, 0.05, y)) + 0.003 * sstep(0.135, 0.15, y), 0.004);
      add(an, W.upper, upper, ell(0.038, 0.037, 0.040, 8, 5));
      add(an, panel, place(ell(0.024, 0.014, 0.036, 8, 5), 0, footTop(side, 0, 0.16, 0.003) - 0.006, 0.150), place(flat(0.020, 0.030, 0.004, 0.003), 0, -0.010, -0.058, 0.15, 0, 0),
        place(flat(0.070, 0.012, 0.0025, 0.002), side * 0.030, -0.030, 0.06, 0, side * 1.1, 0.25));                                     // toe cap, heel tab, side stripe
      add(an, W.upper, place(flat(0.034, 0.060, 0.006, 0.006), 0, footTop(side, 0, 0.075, 0.003) + 0.006, 0.075, -0.55, 0, 0));           // tongue
      { const cs = [], ey = [];
        for (const [z0, z1, s] of [[0.03, 0.06, 1], [0.03, 0.06, -1], [0.06, 0.09, 1], [0.06, 0.09, -1], [0.09, 0.12, 1], [0.09, 0.12, -1]]) { const a = [], n = 4; for (let i = 0; i <= n; i++) { const t = i / n, z = z0 + (z1 - z0) * t, x = s * side * (0.020 - 0.040 * t); a.push([x, footTop(side, x, z, 0.003) + 0.006, z]); } cs.push(seam(a, 0.0020, 4)); }
        for (const z of [0.03, 0.06, 0.09, 0.12]) for (const s of [1, -1]) ey.push(place(new THREE.TorusGeometry(0.0028, 0.0010, 4, 6), s * 0.020, footTop(side, s * 0.020, z, 0.003) + 0.006, z, PI / 2, 0, 0));
        cs.push(place(new THREE.TorusGeometry(0.008, 0.0020, 4, 8), 0.0, footTop(side, 0, 0.030, 0.003) + 0.012, 0.028, 0.2, 0, 0.3), place(new THREE.TorusGeometry(0.008, 0.0020, 4, 8), 0.0, footTop(side, 0, 0.030, 0.003) + 0.012, 0.028, -0.2, 0, -0.3));   // bow
        add(an, W.lace, ...cs); add(an, W.metal, ...ey);
      }
    }
  }

  if (O.id === 'yukata') outfitYukata(); else if (O.id === 'courier') outfitCourier(); else outfitShrine();

  const L = arms.L, R = arms.R, LL = legs.L, RL = legs.R;
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
  g.userData.outfit = O.id; g.userData.palette = PL.id;
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
