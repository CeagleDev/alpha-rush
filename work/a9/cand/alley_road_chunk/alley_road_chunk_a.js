// alley_road_chunk — arm A: assembled from primitives.
// 30 m (Z) x 9 m (X). A 6 m wet asphalt carriageway 0.02 m thick (top at y = 0.02,
// underside at y = 0) with tarmac patches as thin overlay boxes, a worn dashed
// centre line, raised concrete verges 1.5 m each side behind a 0.12 m kerb
// (verge/kerb top at y = 0.14), a manhole, a drain grate in the gutter, two
// puddles 2 mm proud and oil stains.
export default function (THREE) {
  const g = new THREE.Group();
  const mat = (color, name, r, m, dbl) => {
    const s = new THREE.MeshStandardMaterial({ color, roughness: r, metalness: m || 0 });
    if (dbl) s.side = THREE.DoubleSide;
    s.name = name; return s;
  };
  const ROAD   = mat(0x231718, 'ground', 0.18);
  const PATCH1 = mat(0x1d1314, 'ground', 0.18);
  const PATCH2 = mat(0x2b1d1c, 'ground', 0.18);
  const PATCH3 = mat(0x2f2322, 'ground', 0.18);
  const OIL    = mat(0x160f11, 'ground', 0.12);
  const PUDDLE = mat(0x1a1114, 'ground', 0.05);
  const LINE   = mat(0x6a5e52, 'ground', 0.30);
  const GUTTER = mat(0x4a4a4c, 'stone', 0.18);      // wet gutter concrete
  const KERB   = mat(0x8a8378, 'stone', 0.80);
  const KERB2  = mat(0x77716a, 'stone', 0.85);
  const PAVE   = mat(0x6f6a62, 'stone', 0.18);      // wet verge slab
  const PAVE2  = mat(0x64605a, 'stone', 0.18);
  const GRIME  = mat(0x37201b, 'stone', 0.90);
  const IRON   = mat(0x37201b, 'metal', 0.85, 0.3);
  const IRON2  = mat(0x2a1a16, 'metal', 0.80, 0.3);

  const B = (w, h, d, m, x, y, z, ry) => {
    const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
    o.position.set(x, y, z); if (ry) o.rotation.y = ry; g.add(o); return o;
  };
  const hash = (a, b) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };

  // --- carriageway ----------------------------------------------------------
  B(6.0, 0.02, 30, ROAD, 0, 0.01, 0);
  // patched tarmac panels, 3 mm proud
  const pm = [PATCH1, PATCH2, PATCH3];
  for (let i = 0; i < 14; i++) {
    const w = 0.8 + hash(i, 1) * 1.6, d = 1.2 + hash(i, 2) * 3.0;
    const x = -2.6 + hash(i, 3) * 5.2, z = -14 + hash(i, 4) * 28;
    B(w, 0.003, d, pm[i % 3], Math.max(-3 + w / 2, Math.min(3 - w / 2, x)), 0.0215,
      Math.max(-15 + d / 2, Math.min(15 - d / 2, z)), (hash(i, 5) - 0.5) * 0.08);
  }
  // worn centre line: 2 m dashes, 2 m gaps, a couple missing
  for (let i = 0; i < 8; i++) {
    if (i === 3) continue;
    B(0.10, 0.003, 1.6 + hash(i, 7) * 0.4, LINE, 0, 0.0225, -13 + i * 4);
  }
  // oil stains, dark octagons
  for (let i = 0; i < 4; i++) {
    const o = new THREE.Mesh(new THREE.CylinderGeometry(0.35 + hash(i, 9) * 0.3, 0.35 + hash(i, 9) * 0.3, 0.002, 8), OIL);
    o.position.set(-1.8 + hash(i, 10) * 3.6, 0.023, -12 + hash(i, 11) * 24);
    o.scale.z = 1.6; g.add(o);
  }
  // two puddles, 2 mm proud
  for (const [x, z, r, sz] of [[-1.1, -6.5, 0.7, 1.7], [1.6, 4.0, 0.55, 2.2]]) {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.002, 12), PUDDLE);
    p.position.set(x, 0.023, z); p.scale.z = sz; p.rotation.y = 0.5; g.add(p);
  }
  // manhole cover: rusty iron disc with a rim ring
  const mh = new THREE.Mesh(new THREE.CylinderGeometry(0.30, 0.30, 0.012, 24), IRON);
  mh.position.set(-0.9, 0.026, -2.0); g.add(mh);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.31, 0.012, 4, 24), IRON2);
  rim.rotation.x = Math.PI / 2; rim.position.set(-0.9, 0.028, -2.0); g.add(rim);

  // --- kerb and gutter, each side -------------------------------------------
  for (const sx of [-1, 1]) {
    // gutter channel 0.35 m wide at road level (slightly below, so it reads as a dish)
    B(0.35, 0.016, 30, GUTTER, sx * 3.175, 0.008, 0);
    // kerb stones 0.15 wide x 0.12 tall, 1 m units with 1 cm joints
    for (let i = 0; i < 30; i++) {
      const dip = (hash(i, sx) - 0.5) * 0.012;
      B(0.15, 0.12 + dip, 0.98, i % 5 === 2 ? KERB2 : KERB, sx * 3.425, 0.02 + (0.12 + dip) / 2, -14.5 + i);
    }
    // paving slabs behind the kerb, 1.0 m wide verge at y = 0.14
    for (let i = 0; i < 15; i++) {
      const dip = (hash(i, sx * 3) - 0.5) * 0.006;
      B(0.98, 0.12 + dip, 1.98, i % 4 === 1 ? PAVE2 : PAVE, sx * 4.0, 0.02 + (0.12 + dip) / 2, -14 + i * 2);
    }
    // sub-base under the verge so nothing is see-through from the side
    B(1.5, 0.02, 30, GRIME, sx * 3.75, 0.01, 0);
    // grime band at the foot of the kerb
    B(0.02, 0.04, 30, GRIME, sx * 3.34, 0.04, 0);
  }
  // drain grate set in the right-hand gutter
  B(0.70, 0.02, 0.40, IRON2, 3.15, 0.026, 9.0);
  for (let i = 0; i < 9; i++) B(0.62, 0.008, 0.02, IRON, 3.15, 0.038, 8.84 + i * 0.04);
  // a weed clump and grit in the gutter corner
  B(0.18, 0.05, 0.12, mat(0x3d4a22, 'foliage', 0.9), -3.2, 0.045, -11.5, 0.4);
  B(0.14, 0.04, 0.10, mat(0x3d4a22, 'foliage', 0.9), 3.22, 0.04, -4.0, -0.3);

  g.userData.chunk = 'alley';
  g.userData.mounts = ['front', 'back'];   // the z-ends butt flush against the next chunk

  // --- place ----------------------------------------------------------------
  const box = new THREE.Box3(), v = new THREE.Vector3();
  g.updateMatrixWorld(true);
  g.traverse((n) => { const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    for (let i = 0; i < p.count; i++) box.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(n.matrixWorld)); });
  const c = box.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= box.min.y; o.position.z -= c.z; });
  return g;
}
