// expressway_deck — arm B: built from profiles.
// The deck is ONE cross-section extruded 30 m along Z: a box-girder soffit with
// chamfered corners, cantilevered edges, and the two 1.0 m upstands drawn into
// the same profile (a Jersey-type kick at the foot). The wearing course is a
// slightly crowned strip extruded over it. Each pier is a hammerhead profile
// extruded 1.4 m; the sound-panel posts are I-sections.
// Base y = 0 is the pier feet; deck underside 5.2, running surface 6.0, upstand
// top 7.0, panel top 10.0. Place at y = 0. Clear road 6.0 m (slab 6.6 m overall).
export default function (THREE) {
  const g = new THREE.Group();
  const mat = (color, name, r, m, dbl) => {
    const s = new THREE.MeshStandardMaterial({ color, roughness: r, metalness: m || 0 });
    if (dbl) s.side = THREE.DoubleSide;
    s.name = name; return s;
  };
  const ROAD  = mat(0x231718, 'ground', 0.18);
  const PATCH = mat(0x2a1c1b, 'ground', 0.18);
  const LANE  = mat(0xcfc7b4, 'ground', 0.35);
  const CONC  = mat(0x8a8378, 'stone', 0.85);
  const CONC2 = mat(0x4a4a4c, 'stone', 0.90);
  const STAIN = mat(0x37201b, 'stone', 0.92);
  const BLACK = mat(0x110f12, 'stone', 0.95);
  const STEEL = mat(0x5b6167, 'metal', 0.70, 0.3);
  const RUST  = mat(0x4f2d21, 'metal', 0.90, 0.2);
  const GLASS = new THREE.MeshStandardMaterial({ color: 0x8e949a, roughness: 0.35, transparent: true, opacity: 0.9, forceSinglePass: true });
  GLASS.name = 'metal';
  const hash = (a, b) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };
  const B = (w, h, d, m, x, y, z) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); g.add(o); return o; };
  const poly = (pts) => { const s = new THREE.Shape(); pts.forEach((p, i) => (i ? s.lineTo(p[0], p[1]) : s.moveTo(p[0], p[1]))); s.closePath(); return s; };
  const sweepZ = (shape, len, material, x, y, z) => {
    const geo = new THREE.ExtrudeGeometry(shape, { depth: len, bevelEnabled: false, steps: 1 });
    geo.translate(0, 0, -len / 2);
    const m = new THREE.Mesh(geo, material); m.position.set(x, y, z); g.add(m); return m;
  };

  const D0 = 5.2, TOP = 6.0;
  // --- the deck profile: right half drawn, mirrored by closing back -------------
  // outer edge x = 3.3, cantilever soffit at D0+0.45, box soffit at D0, upstand 3.0..3.3 up to TOP+1
  const half = (sx) => [
    [0, D0], [sx * 2.3, D0], [sx * 2.6, D0 + 0.2], [sx * 3.3, D0 + 0.45], [sx * 3.3, TOP + 0.95], [sx * 3.25, TOP + 1.0],
    [sx * 3.05, TOP + 1.0], [sx * 3.0, TOP + 0.9], [sx * 3.0, TOP + 0.25], [sx * 2.85, TOP - 0.02], [0, TOP - 0.02],
  ];
  const r = half(1), l = half(-1).reverse();
  sweepZ(poly(r.concat(l)), 30, CONC, 0, 0, 0);
  // crowned wearing course, 2 cm at the edge, 3 cm at the crown
  const wc = new THREE.Shape(); wc.moveTo(-2.85, TOP - 0.02); wc.lineTo(2.85, TOP - 0.02);
  for (let i = 6; i >= 0; i--) { const x = -2.85 + (i / 6) * 5.7; wc.lineTo(x, TOP + 0.01 * (1 - (x / 2.85) * (x / 2.85))); }
  wc.closePath(); sweepZ(wc, 30, ROAD, 0, 0, 0);
  const crown = (x) => TOP + 0.01 * (1 - (x / 2.85) * (x / 2.85));
  for (let i = 0; i < 6; i++) { const x = -2 + hash(i, 3) * 4; B(1.2 + hash(i, 1) * 1.6, 0.003, 2 + hash(i, 2) * 4, PATCH, x, crown(x) + 0.0015, -12 + hash(i, 4) * 24); }
  for (const x of [-1, 1]) for (let i = 0; i < 6; i++) B(0.12, 0.003, 2.4, LANE, x, crown(x) + 0.002, -12.5 + i * 5);
  // shade under the cantilever, drip groove and grime at the upstand foot
  for (const sx of [-1, 1]) {
    B(0.05, 0.03, 30, BLACK, sx * 3.1, D0 + 0.43, 0);
    B(0.06, 0.04, 30, BLACK, sx * 2.92, TOP + 0.02, 0);
    for (let i = 0; i < 5; i++) {
      B(0.012, 0.4 + hash(i, sx) * 0.45, 0.10, STAIN, sx * 2.995, TOP + 0.45, -12 + hash(i, sx * 3) * 24);
      B(0.012, 0.5 + hash(i, sx * 9) * 0.35, 0.14, STAIN, sx * 3.306, D0 + 0.85, -13 + hash(i, sx * 5) * 26);
    }
    for (let i = 0; i < 3; i++) {
      const s = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.5, 8), RUST);
      s.rotation.z = Math.PI / 2; s.position.set(sx * 3.35, D0 + 0.6, -10 + i * 10); g.add(s);
      B(0.02, 0.5, 0.2, STAIN, sx * 3.31, D0 + 0.55, -10 + i * 10);
    }
  }
  // transverse diaphragm ribs on the soffit, so the underside is not one flat face
  for (let i = 0; i < 6; i++) B(4.5, 0.12, 0.2, CONC2, 0, D0 - 0.06, -12.5 + i * 5);

  // --- sound panels in I-section posts -----------------------------------------
  const iShape = (d, bf, tw, tf) => {
    const s = new THREE.Shape(); const hd = d / 2, hb = bf / 2, ht = tw / 2;
    s.moveTo(-hb, -hd); s.lineTo(hb, -hd); s.lineTo(hb, -hd + tf); s.lineTo(ht, -hd + tf); s.lineTo(ht, hd - tf); s.lineTo(hb, hd - tf);
    s.lineTo(hb, hd); s.lineTo(-hb, hd); s.lineTo(-hb, hd - tf); s.lineTo(-ht, hd - tf); s.lineTo(-ht, -hd + tf); s.lineTo(-hb, -hd + tf); s.closePath(); return s;
  };
  const POST = iShape(0.14, 0.12, 0.012, 0.014);
  for (const sx of [-1, 1]) {
    const x = sx * 3.15;
    for (let i = 0; i < 7; i++) {
      const geo = new THREE.ExtrudeGeometry(POST, { depth: 3.0, bevelEnabled: false, steps: 1 }); geo.rotateX(-Math.PI / 2);
      const m = new THREE.Mesh(geo, STEEL); m.position.set(x, TOP + 1.0, -15 + i * 5); g.add(m);
    }
    B(0.14, 0.08, 30, STEEL, x, TOP + 4.0, 0);
    B(0.16, 0.10, 30, RUST, x, TOP + 1.05, 0);
    for (let i = 0; i < 6; i++) {
      const z = -12.5 + i * 5;
      if (sx === -1 && i === 1) { B(0.03, 2.8, 4.84, RUST, x, TOP + 2.5, z); continue; }      // one panel boarded with rusted tin
      B(0.03, 2.8, 4.84, GLASS, x, TOP + 2.5, z);
      B(0.04, 0.05, 4.84, STEEL, x, TOP + 2.5, z);
    }
  }

  // --- hammerhead piers, one profile each -------------------------------------
  const PIER = poly([[-0.65, 0], [0.65, 0], [0.65, 3.9], [2.7, 4.5], [2.7, 5.2], [-2.7, 5.2], [-2.7, 4.5], [-0.65, 3.9]]);
  for (const z of [-10, 0, 10]) {
    const geo = new THREE.ExtrudeGeometry(PIER, { depth: 1.4, bevelEnabled: false, steps: 1 }); geo.translate(0, 0, -0.7);
    const m = new THREE.Mesh(geo, CONC2); m.position.set(0, 0, z); g.add(m);
    B(1.34, 0.08, 1.44, BLACK, 0, 0.04, z);
    B(1.31, 1.0, 0.3, STAIN, 0, 3.4, z + 0.6);
    B(0.3, 1.4, 1.41, STAIN, -0.5, 2.5, z);
  }
  g.userData.chunk = 'expressway';
  g.userData.mounts = ['front', 'back'];   // the z-ends butt flush against the next chunk

  const box = new THREE.Box3(), v = new THREE.Vector3();
  g.updateMatrixWorld(true);
  g.traverse((n) => { const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    for (let i = 0; i < p.count; i++) box.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(n.matrixWorld)); });
  const c = box.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= box.min.y; o.position.z -= c.z; });
  return g;
}
