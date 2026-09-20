// alley_road_chunk — arm B: built from profiles.
// The carriageway is a crowned cross-section (15 mm camber) extruded 30 m along Z;
// each verge is one kerb-and-gutter profile (dished gutter, 0.12 m kerb with a
// chamfered arris, paving behind) extruded the same way. Puddles, oil stains and
// tarmac patches are irregular Shapes extruded a few millimetres; the manhole is a
// lathe with a raised rim and the drain grate a Shape with real slots.
// Road underside at y = 0, road edge at y = 0.02, crown at 0.035, verge top 0.14.
export default function (THREE) {
  const g = new THREE.Group();
  const mat = (color, name, r, m, dbl) => {
    const s = new THREE.MeshStandardMaterial({ color, roughness: r, metalness: m || 0 });
    if (dbl) s.side = THREE.DoubleSide;
    s.name = name; return s;
  };
  const ROAD   = mat(0x231718, 'ground', 0.18);
  const PATCH1 = mat(0x1d1314, 'ground', 0.18);
  const PATCH2 = mat(0x2c1e1d, 'ground', 0.18);
  const OIL    = mat(0x160f11, 'ground', 0.12);
  const PUDDLE = mat(0x1a1114, 'ground', 0.05);
  const LINE   = mat(0x6a5e52, 'ground', 0.30);
  const CONC   = mat(0x7a746b, 'stone', 0.18);
  const KERB   = mat(0x8a8378, 'stone', 0.80);
  const GRIME  = mat(0x37201b, 'stone', 0.90);
  const IRON   = mat(0x37201b, 'metal', 0.85, 0.3);
  const IRON2  = mat(0x241613, 'metal', 0.80, 0.3);
  const hash = (a, b) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };

  const sweepZ = (shape, len, material, x, y, z) => {
    const geo = new THREE.ExtrudeGeometry(shape, { depth: len, bevelEnabled: false, steps: 1, curveSegments: 6 });
    geo.translate(0, 0, -len / 2);
    const m = new THREE.Mesh(geo, material); m.position.set(x, y, z); g.add(m); return m;
  };
  // a flat shape lying on the ground, thickness t, drawn in XZ (shape y -> world -z)
  const flat = (shape, t, material, x, y, z, ry) => {
    const geo = new THREE.ExtrudeGeometry(shape, { depth: t, bevelEnabled: false, steps: 1, curveSegments: 5 });
    geo.rotateX(-Math.PI / 2);
    const m = new THREE.Mesh(geo, material); m.position.set(x, y, z); if (ry) m.rotation.y = ry; g.add(m); return m;
  };
  const poly = (pts) => { const s = new THREE.Shape(); pts.forEach((p, i) => (i ? s.lineTo(p[0], p[1]) : s.moveTo(p[0], p[1]))); s.closePath(); return s; };
  const blob = (r, n, seed) => {
    const pts = [];
    for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; const rr = r * (0.7 + 0.6 * hash(i, seed)); pts.push(new THREE.Vector2(Math.cos(a) * rr, Math.sin(a) * rr * 0.65)); }
    const s = new THREE.Shape(); s.splineThru(pts); s.closePath(); return s;
  };

  // --- crowned carriageway --------------------------------------------------
  const road = new THREE.Shape();
  road.moveTo(-3, 0); road.lineTo(3, 0); road.lineTo(3, 0.02);
  for (let i = 5; i >= 0; i--) { const x = -3 + (i / 5) * 6; road.lineTo(x, 0.02 + 0.015 * (1 - (x / 3) * (x / 3))); }
  road.closePath();
  sweepZ(road, 30, ROAD, 0, 0, 0);
  const crown = (x) => 0.02 + 0.015 * (1 - (x / 3) * (x / 3));

  // tarmac patches as irregular polygons
  for (let i = 0; i < 10; i++) {
    const x = -2.4 + hash(i, 21) * 4.8, z = -13 + hash(i, 22) * 26;
    const pts = [];
    const n = 5 + (i % 3);
    for (let k = 0; k < n; k++) { const a = (k / n) * Math.PI * 2; const rr = 0.5 + hash(k, i) * 0.7; pts.push([Math.cos(a) * rr, Math.sin(a) * rr * 1.5]); }
    flat(poly(pts), 0.003, i % 2 ? PATCH1 : PATCH2, x, crown(x) + 0.0005, z, hash(i, 23));
  }
  // centre line dashes, worn
  for (let i = 0; i < 8; i++) {
    if (i === 5) continue;
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.003, 1.5 + hash(i, 7) * 0.5), LINE);
    m.position.set(0, crown(0) + 0.0015, -13 + i * 4); g.add(m);
  }
  // oil stains and puddles
  for (let i = 0; i < 4; i++) { const x = -1.9 + hash(i, 31) * 3.8; flat(blob(0.55, 9, i + 40), 0.002, OIL, x, crown(x) + 0.002, -12 + hash(i, 32) * 24, hash(i, 33) * 3); }
  flat(blob(0.9, 11, 50), 0.002, PUDDLE, -1.2, crown(-1.2) + 0.0025, -7.0, 0.3);
  flat(blob(0.75, 11, 51), 0.002, PUDDLE, 1.5, crown(1.5) + 0.0025, 5.5, 1.2);

  // manhole: lathe with a raised rim
  const prof = [new THREE.Vector2(0, 0), new THREE.Vector2(0.27, 0), new THREE.Vector2(0.27, 0.008), new THREE.Vector2(0.29, 0.008),
                new THREE.Vector2(0.31, 0.016), new THREE.Vector2(0.32, 0.016), new THREE.Vector2(0.32, 0)];
  const mh = new THREE.Mesh(new THREE.LatheGeometry(prof, 24), IRON); mh.material.side = THREE.DoubleSide;
  mh.position.set(-0.9, crown(-0.9) + 0.001, -2.0); g.add(mh);

  // --- kerb-and-gutter profile, mirrored --------------------------------------
  // drawn for the right-hand side in XY: x from 3 to 4.5
  const kg = new THREE.Shape();
  kg.moveTo(3.0, 0); kg.lineTo(4.5, 0); kg.lineTo(4.5, 0.14); kg.lineTo(3.42, 0.14);
  kg.lineTo(3.40, 0.14); kg.lineTo(3.35, 0.135); kg.lineTo(3.35, 0.02);   // chamfered kerb arris, kerb face
  kg.lineTo(3.2, 0.006); kg.lineTo(3.0, 0.02);                              // dished gutter
  kg.closePath();
  for (const sx of [-1, 1]) {
    const m = sweepZ(kg, 30, CONC, 0, 0, 0); m.scale.x = sx;
    // kerb stone joints every metre: shallow dark grooves across the kerb top
    for (let i = 0; i < 29; i++) {
      const j = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.004, 0.012), GRIME);
      j.position.set(sx * 3.43, 0.14, -14 + i); g.add(j);
    }
    // paving joints every 2 m
    for (let i = 0; i < 14; i++) {
      const j = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.004, 0.012), GRIME);
      j.position.set(sx * 4.0, 0.14, -13 + i * 2); g.add(j);
    }
    const jl = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.004, 30), GRIME); jl.position.set(sx * 3.5, 0.14, 0); g.add(jl);
    // grime at the foot of the kerb
    const gr = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 30), GRIME); gr.position.set(sx * 3.34, 0.03, 0); g.add(gr);
  }

  // drain grate in the right gutter: a plate with eight slots, sunk into the dish
  const gs = new THREE.Shape(); gs.moveTo(-0.33, -0.18); gs.lineTo(0.33, -0.18); gs.lineTo(0.33, 0.18); gs.lineTo(-0.33, 0.18); gs.closePath();
  for (let i = 0; i < 8; i++) {
    const h = new THREE.Path(); const z0 = -0.15 + i * 0.04;
    h.moveTo(-0.27, z0); h.lineTo(0.27, z0); h.lineTo(0.27, z0 + 0.022); h.lineTo(-0.27, z0 + 0.022); h.closePath(); gs.holes.push(h);
  }
  flat(gs, 0.02, IRON2, 3.17, 0.004, 9.0);
  const sump = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.004, 0.36), mat(0x110f12, 'metal', 0.9)); sump.position.set(3.17, 0.003, 9.0); g.add(sump);

  // weeds in the gutter
  const weed = mat(0x3d4a22, 'foliage', 0.9);
  for (const [x, z] of [[-3.15, -11.5], [3.2, -4.0], [-3.22, 8.0]]) {
    const w = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.09, 5), weed); w.position.set(x, 0.05, z); g.add(w);
  }

  g.userData.chunk = 'alley';
  g.userData.mounts = ['front', 'back'];   // the z-ends butt flush against the next chunk

  const box = new THREE.Box3(), v = new THREE.Vector3();
  g.updateMatrixWorld(true);
  g.traverse((n) => { const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    for (let i = 0; i < p.count; i++) box.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(n.matrixWorld)); });
  const c = box.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= box.min.y; o.position.z -= c.z; });
  return g;
}
