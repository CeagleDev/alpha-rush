// tv_antenna — arm A: primitives. A 2.5 m galvanised mast on a base plate, three stacked
// element arrays on short booms (6-sided rods), a small offset dish, a timber-backed
// junction box with a cable run, and three guy wires down to anchor lugs at the base.
// Rust on the elements and clamps; the galvanised mast stays pale. Base y=0 at the plate.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, o = {}) => { const m = new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0, ...o }); if (name) m.name = name; return m; };
  const put = (geo, mat, p, r) => { const m = new THREE.Mesh(geo, mat); if (p) m.position.set(p[0], p[1], p[2]); if (r) m.rotation.set(r[0], r[1], r[2]); g.add(m); return m; };
  const box = (w, h, d, p, mat, r) => put(new THREE.BoxGeometry(w, h, d), mat, p, r);
  const cyl = (rt, rb, h, seg, p, mat, r) => put(new THREE.CylinderGeometry(rt, rb, h, seg), mat, p, r);
  // a rod between two points
  const rod = (a, b, rad, mat, seg = 6) => { const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b); const d = B.clone().sub(A); const len = d.length();
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rad, rad, len, seg), mat); m.position.copy(A).add(B).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); g.add(m); return m; };

  const galv = M(0x8a8f8f, 'metal', { roughness: 0.7, metalness: 0.3 });
  const galvDk = M(0x6f7477, 'metal', { roughness: 0.75, metalness: 0.3 });
  const rust = M(0x6e4128, 'metal', { roughness: 0.92, metalness: 0.3 });
  const rustDk = M(0x37201b, 'metal', { roughness: 0.94, metalness: 0.3 });
  const rustEl = M(0x7a4a2e, 'metal', { roughness: 0.9, metalness: 0.3 });
  const timber = M(0x4f2d21, 'timber', { roughness: 0.92 });
  const cable = M(0x1b1c1e, 'metal', { roughness: 0.9 });
  const dark = M(0x110f12, 'metal', { roughness: 0.9 });

  // --- base plate and mast ----------------------------------------------------------
  box(0.30, 0.03, 0.30, [0, 0.015, 0], rustDk);
  box(0.30, 0.03, 0.30, [0, 0.03, 0], dark);                                  // grounding band (shade under the plate)
  cyl(0.05, 0.05, 0.10, 8, [0, 0.09, 0], rust);                                // foot collar
  cyl(0.024, 0.024, 2.42, 8, [0, 1.29, 0], galv);
  cyl(0.03, 0.03, 0.02, 8, [0, 2.51, 0], galvDk);                              // cap

  // --- three element arrays: boom along z, elements along x ---------------------------
  const arrays = [[1.55, 5, 0.80, 1.6], [1.95, 4, 0.60, 1.2], [2.30, 3, 0.45, 0.9]];   // [y, count, boom half-length, longest element]
  for (const [y, n, bh, L0] of arrays) {
    cyl(0.012, 0.012, bh * 2, 6, [0, y, 0], rustEl, [Math.PI / 2, 0, 0]);
    box(0.07, 0.08, 0.06, [0, y, 0], rust);                                    // mast clamp
    for (let i = 0; i < n; i++) {
      const z = -bh + 0.05 + i * ((bh * 2 - 0.10) / (n - 1));
      const L = L0 - i * (L0 * 0.35 / (n - 1));
      cyl(0.008, 0.008, L, 6, [0, y + 0.012, z], i % 2 ? rustEl : galvDk, [0, 0, Math.PI / 2]);
      box(0.03, 0.03, 0.03, [0, y, z], rustDk);                                 // element clip
    }
  }
  // --- offset dish on a short arm, below the top array -------------------------------
  cyl(0.012, 0.012, 0.30, 6, [0.15, 2.08, 0], galvDk, [0, 0, Math.PI / 2]);
  const dish = cyl(0.19, 0.16, 0.05, 12, [0.36, 2.08, 0.02], galv, [0.9, 0.25, 0]);
  cyl(0.008, 0.008, 0.22, 6, [0.36, 2.06, 0.18], galvDk, [1.2, 0, 0]);          // feed arm
  box(0.03, 0.03, 0.05, [0.36, 2.01, 0.27], galvDk);                             // LNB
  box(0.05, 0.08, 0.05, [0.30, 2.08, 0], rust);

  // --- junction box on a timber plate, cables ----------------------------------------
  box(0.26, 0.34, 0.03, [0, 0.95, 0.03], timber);
  box(0.18, 0.24, 0.09, [0, 0.95, 0.09], galvDk);
  box(0.16, 0.05, 0.005, [0, 0.86, 0.137], rust);                               // rust bloom on the lid
  cyl(0.008, 0.008, 0.55, 5, [0.03, 1.35, 0.06], cable, [0.02, 0, 0.03]);       // cable up the mast
  cyl(0.008, 0.008, 0.65, 5, [-0.04, 0.50, 0.06], cable, [-0.03, 0, -0.04]);    // cable down
  cyl(0.006, 0.006, 0.40, 5, [0.05, 1.70, 0.04], cable, [0.05, 0, 0.08]);
  for (const y of [0.55, 1.40, 1.85]) box(0.03, 0.02, 0.03, [0.02, y, 0.04], rustDk);   // cable ties

  // --- three guy wires from a collar at 2.0 m to anchor lugs ------------------------
  cyl(0.032, 0.032, 0.03, 8, [0, 2.00, 0], rust);
  for (let k = 0; k < 3; k++) {
    const a = k * (Math.PI * 2 / 3) + 0.4;
    const ax = Math.cos(a) * 0.95, az = Math.sin(a) * 0.95;
    rod([0, 2.0, 0], [ax, 0.06, az], 0.004, galvDk, 4);
    box(0.05, 0.03, 0.05, [ax, 0.015, az], rustDk);
    cyl(0.01, 0.01, 0.08, 6, [ax, 0.06, az], galvDk);                             // turnbuckle
  }

  const bb = new THREE.Box3(), v = new THREE.Vector3();
  g.updateMatrixWorld(true);
  g.traverse((n) => { const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    for (let i = 0; i < p.count; i++) bb.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(n.matrixWorld)); });
  const c = bb.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= bb.min.y; o.position.z -= c.z; });
  return g;
}
