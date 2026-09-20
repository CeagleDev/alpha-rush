// rooftop_water_tank — WINNER (arm A): primitives. Galvanised tank 1.8 dia x 1.6 h (body + conical
// lid) on a rusty four-leg steel stand 1.15 m tall with ring beams, X braces and foot plates;
// hopper bottom inside the stand, an outlet pipe down past one leg, hoop bands, rust runs
// down the tank and a little moss on the beams. Total 2.8 m. Base y=0 at the foot plates.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, o = {}) => { const m = new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0, ...o }); if (name) m.name = name; return m; };
  const put = (geo, mat, p, r) => { const m = new THREE.Mesh(geo, mat); if (p) m.position.set(p[0], p[1], p[2]); if (r) m.rotation.set(r[0], r[1], r[2]); g.add(m); return m; };
  const box = (w, h, d, p, mat, r) => put(new THREE.BoxGeometry(w, h, d), mat, p, r);
  const cyl = (rt, rb, h, seg, p, mat, r, open) => put(new THREE.CylinderGeometry(rt, rb, h, seg, 1, !!open), mat, p, r);

  const galv = M(0x8a8f8f, 'metal', { roughness: 0.72, metalness: 0.3 });
  const galvDirty = M(0x7a7b72, 'metal', { roughness: 0.8, metalness: 0.3 });
  const galvDk = M(0x6f7477, 'metal', { roughness: 0.75, metalness: 0.3, side: THREE.DoubleSide });
  const rust = M(0x8b4a22, 'metal', { roughness: 0.92, metalness: 0.3 });
  const rust2 = M(0x6e4128, 'metal', { roughness: 0.92, metalness: 0.3 });
  const rustDk = M(0x37201b, 'metal', { roughness: 0.94, metalness: 0.3 });
  const moss = M(0x4a5a2a, 'foliage', { roughness: 0.95 });
  const dark = M(0x110f12, 'metal', { roughness: 0.9 });

  // --- stand ---------------------------------------------------------------------------
  const L = 0.75, LT = 1.15;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    box(0.22, 0.03, 0.22, [sx * L, 0.015, sz * L], dark);                        // foot plate, grounding band
    box(0.12, LT - 0.03, 0.12, [sx * L, 0.03 + (LT - 0.03) / 2, sz * L], sx * sz > 0 ? rust : rust2);
    box(0.13, 0.20, 0.13, [sx * L, 0.13, sz * L], rustDk);                       // rust-heavy foot
  }
  for (const s of [-1, 1]) {
    box(2 * L + 0.12, 0.12, 0.12, [0, LT - 0.06, s * L], rust);                 // top ring beams
    box(0.12, 0.12, 2 * L + 0.12, [s * L, LT - 0.06, 0], rust2);
    box(2 * L, 0.08, 0.08, [0, 0.30, s * L], rust2);                              // low ring
    box(0.08, 0.08, 2 * L, [s * L, 0.30, 0], rust);
    // X braces, flat bars, on the z faces and the x faces
    const bl = Math.sqrt((2 * L - 0.2) ** 2 + (LT - 0.5) ** 2), ang = Math.atan2(LT - 0.5, 2 * L - 0.2);
    box(bl, 0.06, 0.025, [0, 0.36 + (LT - 0.5) / 2, s * (L + 0.05)], rust2, [0, 0, ang]);
    box(bl, 0.06, 0.025, [0, 0.36 + (LT - 0.5) / 2, s * (L + 0.05)], rust, [0, 0, -ang]);
    box(0.025, 0.06, bl, [s * (L + 0.05), 0.36 + (LT - 0.5) / 2, 0], rust2, [ang, 0, 0]);
    box(0.025, 0.06, bl, [s * (L + 0.05), 0.36 + (LT - 0.5) / 2, 0], rust, [-ang, 0, 0]);
  }
  for (const s of [-1, 1]) box(0.10, 0.06, 2 * L - 0.12, [s * 0.45, LT - 0.03, 0], rust2);   // bearers under the tank
  for (const [x, z] of [[-0.6, 0.78], [0.3, -0.78], [0.78, 0.2]]) box(0.14, 0.02, 0.06, [x, LT + 0.005, z], moss);

  // --- tank ------------------------------------------------------------------------------
  const R = 0.90, TB = LT + 0.02, TH = 1.43;
  cyl(R, R, TH, 16, [0, TB + TH / 2, 0], galv);
  cyl(R + 0.004, R + 0.004, 0.24, 16, [0, TB + 0.12, 0], galvDirty, null, true);      // dirt band at the bottom
  cyl(R, 0.22, 0.52, 16, [0, TB - 0.26, 0], galvDk, null, true);                       // hopper bottom, open
  cyl(0.22, 0.22, 0.02, 16, [0, TB - 0.52, 0], galvDk);
  for (const y of [TB + 0.05, TB + 0.62, TB + 1.22]) put(new THREE.TorusGeometry(R + 0.01, 0.022, 4, 16), rust2, [0, y, 0], [Math.PI / 2, 0, 0]);
  // lid: a low cone, a rolled rim, radial ribs, a cap and vent
  cyl(0.10, R + 0.05, 0.17, 16, [0, TB + TH + 0.085, 0], galvDirty);
  put(new THREE.TorusGeometry(R + 0.04, 0.025, 4, 16), rust, [0, TB + TH + 0.01, 0], [Math.PI / 2, 0, 0]);
  const tilt = Math.atan2(0.17, R - 0.05);
  for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; box(0.84, 0.02, 0.035, [Math.cos(a) * 0.5, TB + TH + 0.09, -Math.sin(a) * 0.5], rustDk, [0, a, -tilt]); }
  cyl(0.12, 0.12, 0.05, 10, [0, TB + TH + 0.19, 0], rust2);
  cyl(0.05, 0.05, 0.08, 8, [0.35, TB + TH + 0.14, 0.3], galvDk);                       // vent stub
  // rust runs down the tank wall, tangent slabs
  for (const [a, h, y] of [[0.3, 0.9, 0.45], [1.4, 0.5, 0.25], [2.6, 1.1, 0.55], [4.0, 0.7, 0.35], [5.2, 0.4, 0.2]]) {
    box(0.045, h, 0.008, [Math.sin(a) * (R + 0.004), TB + y, Math.cos(a) * (R + 0.004)], rust2, [0, a, 0]);
  }
  box(0.12, 0.10, 0.006, [Math.sin(2.0) * (R + 0.006), TB + 0.9, Math.cos(2.0) * (R + 0.006)], rustDk, [0, 2.0, 0]);   // patch plate

  // --- pipework: outlet from the hopper, overflow out the top down past a leg ----------
  cyl(0.05, 0.05, 0.36, 8, [0, TB - 0.70, 0], galvDk);
  put(new THREE.TorusGeometry(0.08, 0.05, 6, 8, Math.PI / 2), galvDk, [0.08, TB - 0.88, 0], [0, 0, Math.PI]);
  cyl(0.05, 0.05, 0.60, 8, [0.46, TB - 0.96, 0], galvDk, [0, 0, Math.PI / 2]);
  cyl(0.06, 0.06, 0.04, 8, [0.30, TB - 0.96, 0], rust2, [0, 0, Math.PI / 2]);         // flange
  const PX = L + 0.10, PZ = L - 0.10;
  cyl(0.03, 0.03, 0.30, 8, [R - 0.10, TB + 1.18, PZ], galv, [0, 0, Math.PI / 2]);      // out of the tank wall
  put(new THREE.TorusGeometry(0.06, 0.03, 6, 8, Math.PI / 2), galv, [PX - 0.06, TB + 1.12, PZ], [0, 0, 0]);
  cyl(0.03, 0.03, TB + 1.12 - 0.02, 8, [PX, (TB + 1.12) / 2, PZ], galv);
  for (const y of [0.4, 1.0, 1.8]) box(0.08, 0.04, 0.10, [PX - 0.05, y, PZ], rustDk);   // clips to the leg
  cyl(0.036, 0.036, 0.05, 8, [PX, 1.45, PZ], rust2);                                    // a coupler

  const bb = new THREE.Box3(), v = new THREE.Vector3();
  g.updateMatrixWorld(true);
  g.traverse((n) => { const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    for (let i = 0; i < p.count; i++) bb.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(n.matrixWorld)); });
  const c = bb.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= bb.min.y; o.position.z -= c.z; });
  return g;
}
