// rooftop_water_tank — arm C: a different reading. The stand is a heavy double-frame
// (top and mid ring beams both outside the posts, flat-bar diagonals in both bays), the
// tank has a rolled rim and an offset manhole hatch on a shallow lid, a sight-glass tube
// down one side, a ladder on the back, and the outlet drops through the frame to a valve.
// 1.8 dia, 2.8 m overall. Base y=0 at the foot plates.
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
  const glass = new THREE.MeshStandardMaterial({ color: 0x9accf2, roughness: 0.35, metalness: 0, transparent: true, opacity: 0.9, forceSinglePass: true });

  // --- stand: posts, two ring frames outside the posts, flat-bar diagonals ------------------
  const L = 0.72, LT = 1.15;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    box(0.24, 0.03, 0.24, [sx * L, 0.015, sz * L], dark);
    box(0.14, LT - 0.03, 0.14, [sx * L, 0.03 + (LT - 0.03) / 2, sz * L], sx * sz > 0 ? rust : rust2);
    box(0.15, 0.22, 0.15, [sx * L, 0.14, sz * L], rustDk);
    cyl(0.02, 0.02, 0.06, 6, [sx * L, 0.06, sz * (L + 0.09)], rustDk);              // anchor bolt
  }
  for (const yy of [LT - 0.06, 0.62]) for (const s of [-1, 1]) {
    box(2 * L + 0.30, 0.12, 0.08, [0, yy, s * (L + 0.11)], yy > 1 ? rust : rust2);
    box(0.08, 0.12, 2 * L + 0.30, [s * (L + 0.11), yy, 0], yy > 1 ? rust2 : rust);
  }
  for (const s of [-1, 1]) {
    for (const [y0, y1] of [[0.10, 0.56], [0.68, LT - 0.12]]) {
      const bl = Math.sqrt((2 * L) ** 2 + (y1 - y0) ** 2), ang = Math.atan2(y1 - y0, 2 * L);
      box(bl, 0.05, 0.02, [0, (y0 + y1) / 2, s * (L + 0.16)], rust2, [0, 0, y0 < 0.5 ? ang : -ang]);
      box(0.02, 0.05, bl, [s * (L + 0.16), (y0 + y1) / 2, 0], rust, [y0 < 0.5 ? -ang : ang, 0, 0]);
    }
  }
  for (const s of [-1, 1]) box(0.10, 0.06, 2 * L + 0.2, [s * 0.40, LT - 0.03, 0], rust2);
  for (const [x, z] of [[-0.5, 0.83], [0.4, -0.83], [0.83, 0.25], [-0.83, -0.5]]) box(0.16, 0.02, 0.05, [x, LT + 0.005, z], moss);

  // --- tank: body, rolled rim, shallow lid with an offset hatch -----------------------------
  const R = 0.90, TB = LT + 0.02, TH = 1.46;
  cyl(R, R, TH, 16, [0, TB + TH / 2, 0], galv);
  cyl(R + 0.004, R + 0.004, 0.30, 16, [0, TB + 0.15, 0], galvDirty, null, true);
  cyl(R, 0.24, 0.50, 16, [0, TB - 0.25, 0], galvDk, null, true);
  cyl(0.24, 0.24, 0.02, 16, [0, TB - 0.50, 0], galvDk);
  for (const y of [TB + 0.35, TB + 1.05]) put(new THREE.TorusGeometry(R + 0.01, 0.025, 4, 16), rust2, [0, y, 0], [Math.PI / 2, 0, 0]);
  put(new THREE.TorusGeometry(R + 0.02, 0.035, 5, 16), galvDirty, [0, TB + TH, 0], [Math.PI / 2, 0, 0]);   // rolled rim
  cyl(0.06, R, 0.14, 16, [0, TB + TH + 0.07, 0], galvDirty);
  cyl(0.20, 0.20, 0.05, 10, [0.35, TB + TH + 0.12, 0.25], rust2);                       // manhole hatch
  cyl(0.22, 0.22, 0.02, 10, [0.35, TB + TH + 0.15, 0.25], galvDk);
  for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3; cyl(0.015, 0.015, 0.03, 5, [0.35 + Math.cos(a) * 0.2, TB + TH + 0.16, 0.25 - Math.sin(a) * 0.2], rustDk); }
  cyl(0.02, 0.02, 0.04, 6, [0.35, TB + TH + 0.18, 0.25], rustDk);                          // hatch handle stub
  cyl(0.04, 0.04, 0.10, 8, [-0.45, TB + TH + 0.10, -0.2], galvDk);                         // vent
  // wear on the tank
  for (const [a, h, y] of [[0.5, 0.8, 0.42], [1.7, 0.45, 0.24], [2.9, 1.0, 0.52], [4.2, 0.6, 0.32], [5.5, 0.35, 0.18]]) {
    box(0.045, h, 0.008, [Math.sin(a) * (R + 0.004), TB + y, Math.cos(a) * (R + 0.004)], rust2, [0, a, 0]);
  }
  box(0.25, 0.14, 0.006, [Math.sin(3.6) * (R + 0.006), TB + 1.0, Math.cos(3.6) * (R + 0.006)], rustDk, [0, 3.6, 0]);   // a rusted panel
  // sight glass on the +x side: two stubs and a glass tube
  const SA = 1.2, SX = Math.sin(SA) * (R + 0.08), SZ = Math.cos(SA) * (R + 0.08);
  for (const y of [TB + 0.25, TB + 1.25]) cyl(0.025, 0.025, 0.16, 6, [Math.sin(SA) * (R + 0.02), y, Math.cos(SA) * (R + 0.02)], galvDk, [0, SA, Math.PI / 2]);
  put(new THREE.CylinderGeometry(0.018, 0.018, 1.0, 6), glass, [SX, TB + 0.75, SZ]);
  // ladder up the back
  for (const s of [-1, 1]) cyl(0.015, 0.015, 1.4, 6, [s * 0.2, TB + 0.72, -R - 0.10], galvDk);
  for (let i = 0; i < 6; i++) cyl(0.012, 0.012, 0.4, 6, [0, TB + 0.10 + i * 0.25, -R - 0.10], galvDk, [0, 0, Math.PI / 2]);
  for (const y of [TB + 0.2, TB + 1.2]) for (const s of [-1, 1]) box(0.03, 0.03, 0.12, [s * 0.2, y, -R - 0.05], rustDk);

  // --- outlet: down through the frame to a valve, then out -------------------------------
  cyl(0.05, 0.05, 0.42, 8, [0, TB - 0.72, 0], galvDk);
  cyl(0.09, 0.09, 0.08, 8, [0, TB - 0.85, 0], rust2);                                       // valve body
  cyl(0.012, 0.012, 0.18, 5, [0, TB - 0.85, 0.05], rustDk, [Math.PI / 2, 0, 0]);            // valve stem
  cyl(0.07, 0.07, 0.02, 8, [0, TB - 0.85, 0.15], rust, [Math.PI / 2, 0, 0]);                // handwheel
  put(new THREE.TorusGeometry(0.08, 0.05, 6, 8, Math.PI / 2), galvDk, [0.08, TB - 0.98, 0], [0, 0, Math.PI]);
  cyl(0.05, 0.05, 0.62, 8, [0.47, TB - 1.06, 0], galvDk, [0, 0, Math.PI / 2]);
  const PX = L + 0.15, PZ = L - 0.1;
  cyl(0.03, 0.03, 0.34, 8, [R - 0.12, TB + 1.2, PZ], galv, [0, 0, Math.PI / 2]);
  put(new THREE.TorusGeometry(0.06, 0.03, 6, 8, Math.PI / 2), galv, [PX - 0.06, TB + 1.14, PZ], [0, 0, 0]);
  cyl(0.03, 0.03, TB + 1.14 - 0.02, 8, [PX, (TB + 1.14) / 2, PZ], galv);
  for (const y of [0.45, 1.05]) box(0.10, 0.04, 0.10, [PX - 0.06, y, PZ], rustDk);

  const bb = new THREE.Box3(), v = new THREE.Vector3();
  g.updateMatrixWorld(true);
  g.traverse((n) => { const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    for (let i = 0; i < p.count; i++) bb.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(n.matrixWorld)); });
  const c = bb.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= bb.min.y; o.position.z -= c.z; });
  return g;
}
