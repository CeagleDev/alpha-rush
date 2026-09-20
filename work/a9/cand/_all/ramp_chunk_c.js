// ramp_chunk — arm C: a different reading of the reference.
// The reference is a ramp of SEGMENTS: the deck reads as precast units with
// visible joints, the sides are clad in rusty corrugated tin between concrete
// pilasters, and the low half rides on a solid retaining embankment while the
// high half stands on piers. So: six 5 m deck units (each a rotated box with a
// 3 cm joint), an extruded wedge core, tin-clad flanks with pilasters, and two
// piers with crossheads under the high end.
// Base y = 0 at the low end. Surface y = 0.2 * (z + 15). Rise 6 m over 30 m.
export default function (THREE) {
  const g = new THREE.Group();
  const mat = (color, name, r, m, dbl) => {
    const s = new THREE.MeshStandardMaterial({ color, roughness: r, metalness: m || 0 });
    if (dbl) s.side = THREE.DoubleSide;
    s.name = name; return s;
  };
  const ROAD  = mat(0x231718, 'ground', 0.18);
  const ROAD2 = mat(0x2a1c1b, 'ground', 0.18);
  const LANE  = mat(0xcfc7b4, 'ground', 0.35);
  const CONC  = mat(0x8a8378, 'stone', 0.85);
  const CONC2 = mat(0x4a4a4c, 'stone', 0.90);
  const CONC3 = mat(0x6f6a62, 'stone', 0.88);
  const STAIN = mat(0x37201b, 'stone', 0.92);
  const BLACK = mat(0x110f12, 'stone', 0.95);
  const TIN   = mat(0x8b6141, 'metal', 0.85, 0.3);
  const TIN2  = mat(0x6c4028, 'metal', 0.85, 0.3);
  const RUST  = mat(0x4f2d21, 'metal', 0.90, 0.2);
  const hash = (a, b) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };
  const TH = Math.atan(0.2), C = Math.cos(TH), S = Math.sin(TH);
  const yAt = (z) => 0.2 * (z + 15);
  const poly = (pts) => { const s = new THREE.Shape(); pts.forEach((p, i) => (i ? s.lineTo(p[0], p[1]) : s.moveTo(p[0], p[1]))); s.closePath(); return s; };
  const sweepX = (shape, w, material, x) => {
    const geo = new THREE.ExtrudeGeometry(shape, { depth: w, bevelEnabled: false, steps: 1 });
    geo.rotateY(-Math.PI / 2); geo.translate(x + w / 2, 0, 0);   // shape x -> world +z, depth -> world -x, recentred
    const m = new THREE.Mesh(geo, material); m.material.side = THREE.DoubleSide; g.add(m); return m;
  };
  const B = (w, h, d, m, x, y, z, rx) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); if (rx) o.rotation.x = rx; g.add(o); return o; };

  // --- the wedge core, 4 cm below the running surface --------------------------
  sweepX(poly([[-15, 0], [15, 5.96], [15, 5.2], [-11.2, 0]]), 6.0, CONC3, 0);
  // --- six precast deck units, rotated boxes with joints -------------------------
  for (let i = 0; i < 6; i++) {
    const z0 = -15 + i * 5 + 0.015, z1 = z0 + 4.97, zm = (z0 + z1) / 2;
    const ym = yAt(zm) - 0.02 * C;
    B(6.0, 0.04, 4.97 / C, i % 2 ? ROAD : ROAD2, 0, ym + (i === 0 ? 0.021 : 0), zm + 0.02 * S, -TH);
    if (i) B(6.0, 0.05, 0.03, BLACK, 0, yAt(z0) - 0.01, z0 - 0.015, -TH);          // the joint
  }
  for (let i = 0; i < 6; i++) { const z = -12.5 + i * 5; B(0.12, 0.003, 2.4, LANE, 0, yAt(z) + 0.0025, z, -TH); }
  B(6.0, 0.05, 4.0, BLACK, 0, 0.025, -13);

  // --- parapets: rotated boxes with a chamfered coping ---------------------------
  for (const sx of [-1, 1]) {
    const x = sx * 3.125;
    B(0.25, 0.5, 30 / C, CONC, x, 3.0 + 0.25 * C, 0.25 * S, -TH);
    B(0.29, 0.06, 30 / C, CONC3, x, 3.0 + 0.5 * C, 0.5 * S, -TH);
    for (let i = 0; i < 4; i++) { const z = -12 + i * 8 + hash(i, sx) * 3; B(0.012, 0.3, 0.12, STAIN, x - sx * 0.13, yAt(z) + 0.25, z, -TH); }
    // tin-clad flank between pilasters: full height from ground to soffit line
    for (let i = 0; i < 10; i++) {
      const z = -10.75 + i * 2.5, h = yAt(z) - 0.06; if (h < 0.5) continue;
      const m = [TIN, TIN2, RUST][i % 3];
      B(0.04, h - 0.1, 2.3, m, sx * 3.03, (h - 0.1) / 2 + 0.05, z);
      for (let s = 0; s < 4; s++) B(0.06, h - 0.1, 0.035, RUST, sx * 3.04, (h - 0.1) / 2 + 0.05, z - 0.9 + s * 0.6);
      if (i % 4 === 2) B(0.07, 0.5, 0.9, STAIN, sx * 3.05, 0.35, z + 0.5);                          // a dented, stained sheet
    }
  }
  // --- pilasters every 5 m, piers with crossheads at 10 m spacing -----------------
  for (let i = 0; i < 6; i++) {
    const z = -12.5 + i * 5, h = yAt(z) - 0.06;
    for (const sx of [-1, 1]) { B(0.4, h, 0.5, CONC2, sx * 3.35, h / 2, z); B(0.44, 0.08, 0.54, BLACK, sx * 3.35, 0.04, z); }
  }
  for (const z of [5, 13]) {
    const top = yAt(z) - 0.8;
    B(1.2, top, 1.2, CONC2, 0, top / 2, z);
    B(5.8, 0.5, 1.2, CONC2, 0, top - 0.25, z);
    B(1.24, 0.08, 1.24, BLACK, 0, 0.04, z);
    B(1.21, 1.0, 0.3, STAIN, 0, top - 1.0, z + 0.48);
  }
  g.userData.chunk = 'ramp';
  g.userData.rise = 6;
  g.userData.mounts = ['front', 'back'];

  const box = new THREE.Box3(), v = new THREE.Vector3();
  g.updateMatrixWorld(true);
  g.traverse((n) => { const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    for (let i = 0; i < p.count; i++) box.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(n.matrixWorld)); });
  const c = box.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= box.min.y; o.position.z -= c.z; });
  return g;
}
