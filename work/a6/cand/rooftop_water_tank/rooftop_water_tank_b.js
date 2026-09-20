// rooftop_water_tank — arm B: profiles. The whole tank — hopper, rolled hoop bands, body,
// rim, conical lid, cap — is ONE LatheGeometry profile (20 segments); the stand legs are
// L-angles (two boxes each) with rod braces, and the outlet pipe is a TubeGeometry sweep.
// 1.8 dia, 2.8 m overall, rusty stand 1.15 m. Base y=0 at the foot plates.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, o = {}) => { const m = new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0, ...o }); if (name) m.name = name; return m; };
  const put = (geo, mat, p, r) => { const m = new THREE.Mesh(geo, mat); if (p) m.position.set(p[0], p[1], p[2]); if (r) m.rotation.set(r[0], r[1], r[2]); g.add(m); return m; };
  const box = (w, h, d, p, mat, r) => put(new THREE.BoxGeometry(w, h, d), mat, p, r);
  const cyl = (rt, rb, h, seg, p, mat, r) => put(new THREE.CylinderGeometry(rt, rb, h, seg), mat, p, r);
  const rod = (a, b, rad, mat, seg = 6) => { const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b); const d = B.clone().sub(A); const len = d.length();
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rad, rad, len, seg), mat); m.position.copy(A).add(B).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); g.add(m); return m; };
  const tube = (pts, rad, mat, tseg, rseg = 8) => put(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map((q) => new THREE.Vector3(q[0], q[1], q[2])), false, 'catmullrom', 0.3), tseg, rad, rseg, false), mat);

  const galv = M(0x8a8f8f, 'metal', { roughness: 0.72, metalness: 0.3, side: THREE.DoubleSide });
  const galvDirty = M(0x7a7b72, 'metal', { roughness: 0.8, metalness: 0.3 });
  const galvDk = M(0x6f7477, 'metal', { roughness: 0.75, metalness: 0.3 });
  const rust = M(0x8b4a22, 'metal', { roughness: 0.92, metalness: 0.3 });
  const rust2 = M(0x6e4128, 'metal', { roughness: 0.92, metalness: 0.3 });
  const rustDk = M(0x37201b, 'metal', { roughness: 0.94, metalness: 0.3 });
  const moss = M(0x4a5a2a, 'foliage', { roughness: 0.95 });
  const dark = M(0x110f12, 'metal', { roughness: 0.9 });

  // --- stand: L-angle legs, ring beams, rod X braces ----------------------------------
  const L = 0.75, LT = 1.15;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    box(0.22, 0.03, 0.22, [sx * L, 0.015, sz * L], dark);
    box(0.12, LT - 0.03, 0.03, [sx * L, 0.03 + (LT - 0.03) / 2, sz * (L + 0.045)], sx > 0 ? rust : rust2);
    box(0.03, LT - 0.03, 0.12, [sx * (L + 0.045), 0.03 + (LT - 0.03) / 2, sz * L], sz > 0 ? rust : rust2);
    box(0.14, 0.18, 0.14, [sx * L, 0.12, sz * L], rustDk);
  }
  for (const s of [-1, 1]) {
    box(2 * L + 0.15, 0.10, 0.12, [0, LT - 0.05, s * L], rust);
    box(0.12, 0.10, 2 * L + 0.15, [s * L, LT - 0.05, 0], rust2);
    box(2 * L, 0.08, 0.08, [0, 0.32, s * L], rust2);
    box(0.08, 0.08, 2 * L, [s * L, 0.32, 0], rust);
    rod([-L + 0.06, 0.36, s * (L + 0.06)], [L - 0.06, LT - 0.10, s * (L + 0.06)], 0.018, rust2);
    rod([L - 0.06, 0.36, s * (L + 0.06)], [-L + 0.06, LT - 0.10, s * (L + 0.06)], 0.018, rust);
    rod([s * (L + 0.06), 0.36, -L + 0.06], [s * (L + 0.06), LT - 0.10, L - 0.06], 0.018, rust2);
    rod([s * (L + 0.06), 0.36, L - 0.06], [s * (L + 0.06), LT - 0.10, -L + 0.06], 0.018, rust);
  }
  for (const s of [-1, 1]) box(0.10, 0.06, 2 * L - 0.12, [s * 0.45, LT - 0.03, 0], rust2);
  for (const [x, z] of [[-0.55, 0.78], [0.35, -0.78], [0.78, -0.3]]) box(0.14, 0.02, 0.06, [x, LT + 0.005, z], moss);

  // --- the tank: one lathe -----------------------------------------------------------
  const TB = LT + 0.02, R = 0.90;
  const prof = [[0.22, TB - 0.50], [R, TB - 0.02], [R, TB + 0.02], [R + 0.03, TB + 0.05], [R + 0.03, TB + 0.09], [R, TB + 0.12],
    [R, TB + 0.60], [R + 0.03, TB + 0.63], [R + 0.03, TB + 0.67], [R, TB + 0.70],
    [R, TB + 1.20], [R + 0.03, TB + 1.23], [R + 0.03, TB + 1.27], [R, TB + 1.30],
    [R, TB + 1.42], [R + 0.05, TB + 1.43], [R + 0.05, TB + 1.46], [0.12, TB + 1.62], [0.12, TB + 1.66], [0, TB + 1.66]];
  put(new THREE.LatheGeometry(prof.map((q) => new THREE.Vector2(q[0], q[1])), 20), galv, [0, 0, 0]);
  cyl(0.22, 0.22, 0.02, 12, [0, TB - 0.50, 0], galvDk);
  cyl(R + 0.004, R + 0.004, 0.22, 20, [0, TB + 0.24, 0], galvDirty);                  // dirt band above the first hoop
  const tilt = Math.atan2(0.16, R - 0.07);
  for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; box(0.80, 0.02, 0.035, [Math.cos(a) * 0.5, TB + 1.53, -Math.sin(a) * 0.5], rustDk, [0, a, -tilt]); }
  cyl(0.05, 0.05, 0.08, 8, [0.35, TB + 1.55, 0.3], galvDk);
  for (const [a, h, y] of [[0.3, 0.9, 0.45], [1.4, 0.5, 0.25], [2.6, 1.1, 0.55], [4.0, 0.7, 0.35], [5.2, 0.4, 0.2]]) {
    box(0.045, h, 0.008, [Math.sin(a) * (R + 0.004), TB + y, Math.cos(a) * (R + 0.004)], rust2, [0, a, 0]);
  }
  box(0.12, 0.10, 0.006, [Math.sin(2.0) * (R + 0.006), TB + 0.9, Math.cos(2.0) * (R + 0.006)], rustDk, [0, 2.0, 0]);

  // --- pipework, swept -----------------------------------------------------------------
  const PX = L + 0.10, PZ = L - 0.10;
  tube([[R - 0.12, TB + 1.18, PZ], [PX - 0.03, TB + 1.18, PZ], [PX, TB + 1.10, PZ], [PX, 0.6, PZ], [PX, 0.0, PZ]], 0.03, galv, 16);
  tube([[0, TB - 0.52, 0], [0, TB - 0.85, 0], [0.10, TB - 0.96, 0], [0.50, TB - 0.96, 0]], 0.05, galvDk, 12);
  cyl(0.06, 0.06, 0.04, 8, [0.30, TB - 0.96, 0], rust2, [0, 0, Math.PI / 2]);
  for (const y of [0.4, 1.0, 1.8]) box(0.08, 0.04, 0.10, [PX - 0.05, y, PZ], rustDk);
  cyl(0.036, 0.036, 0.05, 8, [PX, 1.45, PZ], rust2);

  const bb = new THREE.Box3(), v = new THREE.Vector3();
  g.updateMatrixWorld(true);
  g.traverse((n) => { const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    for (let i = 0; i < p.count; i++) bb.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(n.matrixWorld)); });
  const c = bb.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= bb.min.y; o.position.z -= c.z; });
  return g;
}
