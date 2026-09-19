// tv_antenna — arm C: a different reading. The rig is read as two separate antennas
// clamped to one mast: a big VHF array of long elements low on the mast, a folded-dipole
// UHF array (rectangular loop elements built from rods) higher up, plus a dish on the
// other side, a rusty steel junction enclosure on a timber board, and guy wires taken to
// a rooftop bracket ring rather than to lugs. 2.5 m tall. Base y=0 at the foot.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, o = {}) => { const m = new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0, ...o }); if (name) m.name = name; return m; };
  const put = (geo, mat, p, r) => { const m = new THREE.Mesh(geo, mat); if (p) m.position.set(p[0], p[1], p[2]); if (r) m.rotation.set(r[0], r[1], r[2]); g.add(m); return m; };
  const box = (w, h, d, p, mat, r) => put(new THREE.BoxGeometry(w, h, d), mat, p, r);
  const cyl = (rt, rb, h, seg, p, mat, r) => put(new THREE.CylinderGeometry(rt, rb, h, seg), mat, p, r);
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

  // --- foot: a bracket ring on the roof, mast through it --------------------------------
  put(new THREE.TorusGeometry(0.30, 0.02, 4, 10), rustDk, [0, 0.04, 0], [Math.PI / 2, 0, 0]);
  for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + Math.PI / 4; rod([Math.cos(a) * 0.29, 0.04, Math.sin(a) * 0.29], [0, 0.20, 0], 0.01, rustDk); }
  box(0.62, 0.04, 0.62, [0, 0.02, 0], dark);                                     // grounding band
  cyl(0.024, 0.024, 2.46, 8, [0, 1.27, 0], galv);
  cyl(0.03, 0.03, 0.02, 8, [0, 2.49, 0], galvDk);

  // --- VHF array: long elements on a boom along z at 1.45 m -----------------------------
  cyl(0.014, 0.014, 1.4, 6, [0, 1.45, 0], rustEl, [Math.PI / 2, 0, 0]);
  box(0.08, 0.09, 0.07, [0, 1.45, 0], rust);
  for (let i = 0; i < 4; i++) {
    const z = -0.62 + i * 0.41; const L = 1.7 - i * 0.22;
    cyl(0.009, 0.009, L, 6, [0, 1.462, z], i % 2 ? galvDk : rustEl, [0, 0, Math.PI / 2]);
    box(0.035, 0.03, 0.035, [0, 1.45, z], rustDk);
  }
  // --- UHF array: folded-dipole loops on a boom along x at 2.05 m -----------------------
  cyl(0.012, 0.012, 1.1, 6, [0.25, 2.05, 0], galvDk, [0, 0, Math.PI / 2]);
  box(0.07, 0.08, 0.06, [0, 2.05, 0], rust);
  for (let i = 0; i < 3; i++) {
    const x = 0.05 + i * 0.32, w = 0.62 - i * 0.12;
    rod([x, 2.05, -w / 2], [x, 2.05, w / 2], 0.007, rustEl);
    rod([x, 2.11, -w / 2], [x, 2.11, w / 2], 0.007, rustEl);
    rod([x, 2.05, -w / 2], [x, 2.11, -w / 2], 0.007, rustEl);
    rod([x, 2.05, w / 2], [x, 2.11, w / 2], 0.007, rustEl);
    box(0.03, 0.03, 0.03, [x, 2.05, 0], rustDk);
  }
  cyl(0.012, 0.012, 0.6, 6, [-0.3, 2.30, 0], galvDk, [0, 0, Math.PI / 2]);        // a short top boom the other way
  for (let i = 0; i < 2; i++) { cyl(0.008, 0.008, 0.8 - i * 0.2, 6, [-0.15 - i * 0.3, 2.31, 0], galvDk, [Math.PI / 2, 0, 0]); box(0.03, 0.03, 0.03, [-0.15 - i * 0.3, 2.30, 0], rustDk); }
  box(0.07, 0.08, 0.06, [0, 2.30, 0], rust);

  // --- dish on the -x side ---------------------------------------------------------------
  cyl(0.012, 0.012, 0.28, 6, [-0.14, 1.78, 0], galvDk, [0, 0, Math.PI / 2]);
  cyl(0.20, 0.17, 0.05, 12, [-0.34, 1.80, 0.02], galv, [0.9, -0.3, 0]);
  cyl(0.008, 0.008, 0.22, 6, [-0.34, 1.78, 0.18], galvDk, [1.2, 0, 0]);
  box(0.03, 0.03, 0.05, [-0.34, 1.73, 0.27], galvDk);
  box(0.05, 0.08, 0.05, [-0.28, 1.78, 0], rust);

  // --- junction enclosure: rusty steel on a timber board, cable loops ---------------------
  box(0.30, 0.38, 0.03, [0.02, 0.85, 0.03], timber);
  box(0.30, 0.03, 0.03, [0.02, 0.70, 0.032], rustDk);
  box(0.20, 0.26, 0.10, [0.02, 0.85, 0.095], rust);
  box(0.16, 0.20, 0.006, [0.02, 0.86, 0.147], galvDk);                             // lid with paint left
  box(0.12, 0.03, 0.005, [0.02, 0.78, 0.15], rustDk);                              // louvre slot
  cyl(0.008, 0.008, 0.45, 5, [0.06, 1.22, 0.06], cable, [0.03, 0, 0.02]);
  cyl(0.008, 0.008, 0.60, 5, [-0.03, 0.42, 0.06], cable, [-0.02, 0, -0.05]);
  put(new THREE.TorusGeometry(0.06, 0.006, 4, 10), cable, [0.10, 1.10, 0.05], [0.2, 0, 0]);   // a cable loop
  for (const y of [0.50, 1.30, 1.75]) box(0.03, 0.02, 0.03, [0.02, y, 0.04], rustDk);

  // --- guy wires from a collar at 1.95 m down to the bracket ring ----------------------------
  cyl(0.032, 0.032, 0.03, 8, [0, 1.95, 0], rust);
  for (let k = 0; k < 3; k++) {
    const a = k * (Math.PI * 2 / 3) + 0.9;
    const ax = Math.cos(a) * 0.9, az = Math.sin(a) * 0.9;
    rod([0, 1.95, 0], [ax, 0.05, az], 0.004, galvDk, 4);
    box(0.05, 0.03, 0.05, [ax, 0.015, az], rustDk);
    cyl(0.01, 0.01, 0.08, 6, [ax, 0.07, az], galvDk);
  }

  const bb = new THREE.Box3(), v = new THREE.Vector3();
  g.updateMatrixWorld(true);
  g.traverse((n) => { const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    for (let i = 0; i < p.count; i++) bb.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(n.matrixWorld)); });
  const c = bb.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= bb.min.y; o.position.z -= c.z; });
  return g;
}
