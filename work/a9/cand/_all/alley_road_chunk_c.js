// alley_road_chunk — arm C: a different part breakdown.
// The carriageway is a mosaic: a 3 x 10 grid of lane panels, each 2 x 3 m, in one
// of four tarmac tones and 1-2 mm of height scatter, so the patching is the road
// rather than a decal on it. Kerb stones are individual instanced blocks with
// uneven heights and 2 cm joints; verge paving is instanced 1 m flags with their own
// scatter. Puddles and oil are flattened polygons; the grate is a lighter plate
// with dark slots. Road underside y = 0, road top y = 0.02, verge top y = 0.14.
export default function (THREE) {
  const g = new THREE.Group();
  const mat = (color, name, r, m, dbl) => {
    const s = new THREE.MeshStandardMaterial({ color, roughness: r, metalness: m || 0 });
    if (dbl) s.side = THREE.DoubleSide;
    s.name = name; return s;
  };
  const TONES  = [mat(0x231718, 'ground', 0.18), mat(0x1f1415, 'ground', 0.18), mat(0x281b1a, 'ground', 0.18), mat(0x2d2120, 'ground', 0.18)];
  const OIL    = mat(0x160f11, 'ground', 0.12);
  const PUDDLE = mat(0x1a1114, 'ground', 0.05);
  const LINE   = mat(0x6a5e52, 'ground', 0.30);
  const GUTTER = mat(0x4a4a4c, 'stone', 0.18);
  const KERB   = mat(0x8a8378, 'stone', 0.80);
  const PAVE   = mat(0x6f6a62, 'stone', 0.18);
  const GRIME  = mat(0x37201b, 'stone', 0.90);
  const IRON   = mat(0x4a3a30, 'metal', 0.85, 0.3);
  const DARK   = mat(0x110f12, 'metal', 0.9);
  const hash = (a, b) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };
  const B = (w, h, d, m, x, y, z, ry) => {
    const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
    o.position.set(x, y, z); if (ry) o.rotation.y = ry; g.add(o); return o;
  };
  const instance = (geo, material, list) => {
    const im = new THREE.InstancedMesh(geo, material, list.length);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
    list.forEach((t, i) => {
      const r = t.r || [0, 0, 0], s = t.s || [1, 1, 1];
      e.set(r[0], r[1], r[2]); q.setFromEuler(e);
      m4.compose(new THREE.Vector3(t.p[0], t.p[1], t.p[2]), q, new THREE.Vector3(s[0], s[1], s[2]));
      im.setMatrixAt(i, m4);
    });
    im.instanceMatrix.needsUpdate = true; g.add(im); return im;
  };

  // --- the mosaic carriageway -----------------------------------------------
  B(6.0, 0.012, 30, TONES[1], 0, 0.006, 0);                    // sub-layer, seals the joints
  for (let i = 0; i < 3; i++) for (let j = 0; j < 10; j++) {
    const t = Math.floor(hash(i, j) * 4);
    const h = 0.008 + hash(j, i) * 0.002;
    B(1.98, h, 2.98, TONES[t], -2 + i * 2, 0.012 + h / 2, -13.5 + j * 3);
  }
  // a few overlapping repair patches across the joints
  for (let i = 0; i < 5; i++) B(0.9 + hash(i, 3) * 1.2, 0.003, 1.2 + hash(i, 4) * 1.5, TONES[(i + 2) % 4], -1.8 + hash(i, 5) * 3.6, 0.0225, -12 + hash(i, 6) * 24, hash(i, 8) * 0.3);
  // worn centre line
  for (let i = 0; i < 8; i++) { if (i === 2) continue; B(0.10, 0.003, 1.4 + hash(i, 7) * 0.6, LINE, 0, 0.0235, -13 + i * 4); }
  // oil and puddles, flattened polygons
  for (let i = 0; i < 4; i++) {
    const o = new THREE.Mesh(new THREE.CylinderGeometry(0.3 + hash(i, 9) * 0.35, 0.3 + hash(i, 9) * 0.35, 0.002, 7), OIL);
    o.position.set(-1.8 + hash(i, 10) * 3.6, 0.024, -12 + hash(i, 11) * 24); o.scale.z = 1.7; o.rotation.y = hash(i, 12) * 2; g.add(o);
  }
  for (const [x, z, r, sz, ry] of [[-1.3, -6.0, 0.8, 1.5, 0.4], [1.7, 3.5, 0.6, 2.0, 1.1]]) {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.002, 10), PUDDLE);
    p.position.set(x, 0.024, z); p.scale.z = sz; p.rotation.y = ry; g.add(p);
  }
  // manhole: disc plus a raised ring, set in the mosaic
  const mh = new THREE.Mesh(new THREE.CylinderGeometry(0.30, 0.30, 0.014, 20), IRON); mh.position.set(-0.9, 0.027, -2.0); g.add(mh);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.31, 0.014, 4, 20), DARK); ring.rotation.x = Math.PI / 2; ring.position.set(-0.9, 0.03, -2.0); g.add(ring);

  // --- kerb and gutter --------------------------------------------------------
  const kerbs = [], flags = [];
  for (const sx of [-1, 1]) {
    B(0.35, 0.016, 30, GUTTER, sx * 3.175, 0.008, 0);            // gutter, slightly below the road
    B(1.15, 0.03, 30, GRIME, sx * 3.925, 0.015, 0);              // sub-base under kerb and paving
    for (let i = 0; i < 30; i++) {
      const h = 0.11 + hash(i, sx) * 0.02;
      kerbs.push({ p: [sx * 3.425, 0.02 + h / 2, -14.5 + i], r: [0, (hash(i, sx * 7) - 0.5) * 0.02, 0], s: [1, h / 0.12, 1] });
    }
    for (let i = 0; i < 30; i++) {
      const h = 0.115 + hash(i, sx * 5) * 0.008;
      flags.push({ p: [sx * 4.0, 0.02 + h / 2, -14.5 + i], s: [1, h / 0.12, 1] });
    }
  }
  instance(new THREE.BoxGeometry(0.15, 0.12, 0.98), KERB, kerbs);
  instance(new THREE.BoxGeometry(0.98, 0.12, 0.98), PAVE, flags);
  // a couple of broken flags: a darker sunken one each side
  B(0.98, 0.10, 0.98, GRIME, -4.0, 0.07, 3.5); B(0.98, 0.10, 0.98, GRIME, 4.0, 0.07, -8.5);

  // drain grate: lighter frame plate, dark slots cut in as bars of shadow
  B(0.70, 0.022, 0.40, IRON, 3.15, 0.027, 9.0);
  for (let i = 0; i < 8; i++) B(0.56, 0.004, 0.022, DARK, 3.15, 0.04, 8.86 + i * 0.04);

  // weeds and grit
  const weed = mat(0x3d4a22, 'foliage', 0.9);
  for (const [x, z] of [[-3.15, -11.5], [3.2, -4.0], [-3.22, 8.0], [3.18, 13.0]]) {
    const w = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.08, 5), weed); w.position.set(x, 0.05, z); g.add(w);
  }

  g.userData.chunk = 'alley';
  g.userData.mounts = ['front', 'back'];   // the z-ends butt flush against the next chunk

  const box = new THREE.Box3(), v = new THREE.Vector3(), m = new THREE.Matrix4(), im = new THREE.Matrix4();
  g.updateMatrixWorld(true);
  g.traverse((n) => {
    const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    const put = (mt) => { for (let i = 0; i < p.count; i++) box.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(mt)); };
    if (n.isInstancedMesh) { for (let k = 0; k < n.count; k++) { n.getMatrixAt(k, im); put(m.multiplyMatrices(n.matrixWorld, im)); } return; }
    put(n.matrixWorld);
  });
  const c = box.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= box.min.y; o.position.z -= c.z; });
  return g;
}
