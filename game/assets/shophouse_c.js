// shophouse_c — WINNER (arm B): profiles. The shell is ONE extruded ring (footprint outline with a
// hole) swept vertically, the gables are extruded triangles, the roof is a real corrugated
// zigzag profile extruded across the width, the shutter is a ribbed profile extruded along
// the opening, window and door frames are extruded rings, and every pipe and duct is a
// TubeGeometry sweep. 5.0 w x 7.0 h x 6.0 d, front +Z: shutter, side door, frosted sliding
// window with laundry pole, dark unlit lightbox, two AC units, exposed pipes. All four
// sides modelled; back has a door.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, o = {}) => { const m = new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0, ...o }); if (name) m.name = name; return m; };
  const put = (geo, mat, p, r) => { const m = new THREE.Mesh(geo, mat); if (p) m.position.set(p[0], p[1], p[2]); if (r) m.rotation.set(r[0], r[1], r[2]); g.add(m); return m; };
  const box = (w, h, d, p, mat, r) => put(new THREE.BoxGeometry(w, h, d), mat, p, r);
  const cyl = (rt, rb, h, seg, p, mat, r) => put(new THREE.CylinderGeometry(rt, rb, h, seg), mat, p, r);
  const V3 = (q) => new THREE.Vector3(q[0], q[1], q[2]);
  const tube = (pts, rad, mat, tseg, rseg = 8) => put(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(V3), false, 'catmullrom', 0.25), tseg, rad, rseg, false), mat);
  const ext = (shape, depth, mat, p, r) => put(new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 3 }), mat, p, r);
  const rect = (w, h) => { const s = new THREE.Shape(); s.moveTo(-w / 2, -h / 2); s.lineTo(w / 2, -h / 2); s.lineTo(w / 2, h / 2); s.lineTo(-w / 2, h / 2); s.lineTo(-w / 2, -h / 2); return s; };
  const ring = (w, h, t) => { const s = rect(w, h); const hl = rect(w - 2 * t, h - 2 * t); s.holes.push(hl); return s; };

  const plaster = M(0x8a8378, 'plaster', { roughness: 0.95, side: THREE.DoubleSide });
  const plasterStain = M(0x6f6a5f, 'plaster', { roughness: 0.95 });
  const plasterPale = M(0x9a9287, 'plaster', { roughness: 0.95 });
  const plasterDirty = M(0x5c564d, 'plaster', { roughness: 0.95 });
  const stone = M(0x4a4a4c, 'stone', { roughness: 0.92 });
  const timber = M(0x4f2d21, 'timber', { roughness: 0.92 });
  const timberDk = M(0x37201b, 'timber', { roughness: 0.92 });
  const timberLit = M(0x6c4028, 'timber', { roughness: 0.9 });
  const tin = M(0x7d817f, 'metal', { roughness: 0.8, metalness: 0.3, side: THREE.DoubleSide });
  const tinRust = M(0x6e4128, 'metal', { roughness: 0.9, metalness: 0.3, side: THREE.DoubleSide });
  const tinPale = M(0x8b6141, 'metal', { roughness: 0.88, metalness: 0.3, side: THREE.DoubleSide });
  const shutter = M(0x6f7477, 'metal', { roughness: 0.82, metalness: 0.3, side: THREE.DoubleSide });
  const shutterRust = M(0x7a4a2e, 'metal', { roughness: 0.9, metalness: 0.3 });
  const steel = M(0x5b6167, 'metal', { roughness: 0.8, metalness: 0.3 });
  const galv = M(0x8a8f8f, 'metal', { roughness: 0.7, metalness: 0.3 });
  const rust = M(0x6e4128, 'metal', { roughness: 0.92, metalness: 0.3 });
  const rustDk = M(0x37201b, 'metal', { roughness: 0.94, metalness: 0.3 });
  const white = M(0xb9b3a4, 'metal', { roughness: 0.85, metalness: 0.3 });
  const tile = M(0x3a3d40, 'tile', { roughness: 0.88 });
  const dark = M(0x110f12, 'metal', { roughness: 0.9 });
  const cable = M(0x1b1c1e, 'metal', { roughness: 0.9 });
  const glass = new THREE.MeshStandardMaterial({ color: 0xc9c2ae, roughness: 0.4, metalness: 0, transparent: true, opacity: 0.9, forceSinglePass: true });

  const HX = 2.5, HZ = 2.6, WT = 0.16, Y0 = 0.16, WTOP = 5.85, RIDGE = 6.95, EAVE = 3.02;
  const SLOPE = (RIDGE - 5.62) / EAVE, ANG = Math.atan(SLOPE);

  // --- shell: the footprint ring extruded up ------------------------------------------
  {
    const s = new THREE.Shape();
    s.moveTo(-HX, -HZ); s.lineTo(HX, -HZ); s.lineTo(HX, HZ); s.lineTo(-HX, HZ); s.lineTo(-HX, -HZ);
    s.holes.push((() => { const h = new THREE.Path(); h.moveTo(-HX + WT, -HZ + WT); h.lineTo(-HX + WT, HZ - WT); h.lineTo(HX - WT, HZ - WT); h.lineTo(HX - WT, -HZ + WT); h.lineTo(-HX + WT, -HZ + WT); return h; })());
    ext(s, WTOP - Y0, plaster, [0, Y0, 0], [-Math.PI / 2, 0, 0]);
    // a floor slab inside so the openings do not look into an empty shell
    box(2 * HX - 2 * WT, 0.06, 2 * HZ - 2 * WT, [0, Y0 + 0.03, 0], stone);
    box(2 * HX - 2 * WT, 0.08, 2 * HZ - 2 * WT, [0, 3.20, 0], timberDk);
    box(2 * HX - 2 * WT - 0.1, 2.9, 0.06, [0, 1.65, -HZ + WT + 0.05], plasterDirty);
  }
  box(2 * HX + 0.10, Y0, 2 * HZ + 0.10, [0, Y0 / 2, 0], stone);
  box(2 * HX + 0.12, 0.06, 2 * HZ + 0.12, [0, 0.03, 0], dark);

  // --- openings: cut them by facing the wall with infill panels around each hole ---------
  const FZ = HZ - 0.005, SH_X0 = -2.30, SH_X1 = 0.70, SH_TOP = 2.85, DR_X0 = 1.10, DR_X1 = 2.00, DR_TOP = 2.25;
  const W_X0 = -2.10, W_X1 = 0.90, W_Y0 = 4.15, W_Y1 = 5.75;
  // the shell is solid, so the openings are recesses: a dark reveal box pushed into it
  box(SH_X1 - SH_X0, SH_TOP - Y0, WT + 0.02, [(SH_X0 + SH_X1) / 2, (SH_TOP + Y0) / 2, FZ - WT / 2], dark);
  box(DR_X1 - DR_X0, DR_TOP - Y0, WT + 0.02, [(DR_X0 + DR_X1) / 2, (DR_TOP + Y0) / 2, FZ - WT / 2], dark);
  box(W_X1 - W_X0, W_Y1 - W_Y0, WT + 0.02, [(W_X0 + W_X1) / 2, (W_Y0 + W_Y1) / 2, FZ - WT / 2], dark);
  box(0.98, 2.05, WT + 0.02, [-0.50, Y0 + 1.02, -HZ + WT / 2 + 0.005], dark);
  // render stains on the front
  box(1.30, 0.55, 0.02, [1.60, 4.40, FZ + 0.005], plasterDirty);
  box(0.50, 0.90, 0.02, [-1.90, 3.60, FZ + 0.005], plasterDirty);
  box(2 * HX, 0.30, 0.02, [0, 0.36, FZ + 0.005], plasterDirty);
  box(2 * HX, 0.06, 0.03, [0, 3.22, FZ + 0.005], plasterPale);

  // --- roller shutter: a ribbed profile extruded across the opening ----------------------
  {
    const s = new THREE.Shape(); const n = 16, h = (SH_TOP - Y0) / n;
    s.moveTo(0, 0);
    for (let i = 1; i <= n; i++) { s.lineTo(0.05, (i - 0.5) * h); s.lineTo(0.005, i * h); }
    s.lineTo(-0.02, SH_TOP - Y0); s.lineTo(-0.02, 0); s.lineTo(0, 0);
    ext(s, SH_X1 - SH_X0 - 0.06, shutter, [SH_X1 - 0.03, Y0, FZ - 0.02], [0, -Math.PI / 2, 0]);
    box(SH_X1 - SH_X0 + 0.10, 0.10, 0.12, [(SH_X0 + SH_X1) / 2, SH_TOP + 0.05, FZ + 0.03], steel);
    for (const x of [SH_X0, SH_X1]) box(0.10, SH_TOP - Y0 + 0.10, 0.12, [x, Y0 + (SH_TOP - Y0) / 2, FZ + 0.03], steel);
    box(SH_X1 - SH_X0 - 0.06, 0.10, 0.08, [(SH_X0 + SH_X1) / 2, Y0 + 0.05, FZ + 0.02], rustDk);
    box(0.28, 0.05, 0.04, [-0.80, Y0 + 0.14, FZ + 0.06], galv);
    box(0.55, 0.60, 0.006, [-1.60, 1.20, FZ + 0.035], shutterRust);
    box(0.30, 0.40, 0.006, [0.25, 0.90, FZ + 0.035], shutterRust);
    // the hood
    box(SH_X1 - SH_X0 + 0.30, 0.06, 0.42, [(SH_X0 + SH_X1) / 2, SH_TOP + 0.18, FZ + 0.20], tinRust, [0.10, 0, 0]);
    box(SH_X1 - SH_X0 + 0.30, 0.10, 0.05, [(SH_X0 + SH_X1) / 2, SH_TOP + 0.12, FZ + 0.40], tinRust);
    for (const x of [SH_X0 + 0.1, (SH_X0 + SH_X1) / 2, SH_X1 - 0.1]) box(0.04, 0.22, 0.34, [x, SH_TOP + 0.07, FZ + 0.18], rustDk, [0.4, 0, 0]);
  }

  // --- door, window and their frames as extruded rings ------------------------------------
  ext(ring(DR_X1 - DR_X0 + 0.10, DR_TOP - Y0 + 0.06, 0.07), 0.06, steel, [(DR_X0 + DR_X1) / 2, Y0 + (DR_TOP - Y0) / 2, FZ - 0.01]);
  box(DR_X1 - DR_X0 - 0.03, DR_TOP - Y0 - 0.05, 0.05, [(DR_X0 + DR_X1) / 2, Y0 + (DR_TOP - Y0) / 2, FZ - 0.01], shutter);
  box(DR_X1 - DR_X0 - 0.14, 0.05, 0.02, [(DR_X0 + DR_X1) / 2, DR_TOP - 0.30, FZ + 0.02], steel);
  box(DR_X1 - DR_X0 - 0.10, 0.26, 0.006, [(DR_X0 + DR_X1) / 2, Y0 + 0.19, FZ + 0.02], rust);
  box(0.05, 0.22, 0.03, [DR_X1 - 0.16, 1.10, FZ + 0.03], galv);
  for (const y of [0.55, 1.20, 1.85]) cyl(0.012, 0.012, 0.06, 6, [DR_X0 + 0.07, y, FZ + 0.02], rustDk);
  box(0.16, 0.20, 0.03, [DR_X1 - 0.22, 1.70, FZ + 0.025], white);

  ext(ring(W_X1 - W_X0 + 0.12, W_Y1 - W_Y0 + 0.12, 0.09), 0.08, timberDk, [(W_X0 + W_X1) / 2, (W_Y0 + W_Y1) / 2, FZ - 0.04]);
  put(new THREE.BoxGeometry(W_X1 - W_X0, W_Y1 - W_Y0, 0.02), glass, [(W_X0 + W_X1) / 2, (W_Y0 + W_Y1) / 2, FZ - 0.01]);
  for (const x of [-1.35, -0.60, 0.15]) box(0.05, W_Y1 - W_Y0, 0.05, [x, (W_Y0 + W_Y1) / 2, FZ + 0.005], timber);
  box(W_X1 - W_X0, 0.05, 0.05, [(W_X0 + W_X1) / 2, 4.95, FZ + 0.005], timber);
  box(W_X1 - W_X0 + 0.20, 0.08, 0.18, [(W_X0 + W_X1) / 2, W_Y0 - 0.05, FZ + 0.04], timberLit);
  box(W_X1 - W_X0 + 0.16, 0.10, 0.10, [(W_X0 + W_X1) / 2, W_Y1 + 0.06, FZ + 0.02], timberDk);
  // rail and laundry pole
  for (const x of [W_X0 + 0.10, W_X1 - 0.10]) box(0.05, 0.60, 0.05, [x, W_Y0 + 0.28, FZ + 0.26], rust);
  box(W_X1 - W_X0, 0.05, 0.05, [(W_X0 + W_X1) / 2, W_Y0 + 0.56, FZ + 0.26], rust);
  box(W_X1 - W_X0, 0.04, 0.04, [(W_X0 + W_X1) / 2, W_Y0 + 0.30, FZ + 0.26], rustDk);
  for (const x of [W_X0 + 0.10, W_X1 - 0.10]) box(0.04, 0.04, 0.26, [x, W_Y0 + 0.54, FZ + 0.14], rust);
  for (const x of [-1.80, 0.55]) { box(0.05, 0.05, 0.28, [x, 5.40, FZ + 0.15], galv); box(0.05, 0.16, 0.05, [x, 5.33, FZ + 0.27], galv); }
  cyl(0.022, 0.022, 2.45, 6, [-0.62, 5.40, FZ + 0.28], galv, [0, 0, Math.PI / 2]);
  for (const x of [-1.2, -0.3]) cyl(0.012, 0.012, 0.10, 5, [x, 5.34, FZ + 0.28], cable);

  // --- dark unlit lightbox ------------------------------------------------------------------
  ext(ring(0.92, 0.57, 0.05), 0.24, plasterDirty, [1.55, 3.75, FZ + 0.01]);
  box(0.84, 0.49, 0.02, [1.55, 3.75, FZ + 0.24], stone);
  box(0.96, 0.05, 0.26, [1.55, 4.05, FZ + 0.13], rustDk);
  for (const x of [1.20, 1.90]) box(0.04, 0.20, 0.16, [x, 4.12, FZ + 0.08], rustDk);

  // --- two AC units, ducts and pipes as sweeps ------------------------------------------------
  const ac = (x, y, z, w, d) => {
    box(w, 0.52, d, [x, y, z], white);
    box(w, 0.06, d + 0.01, [x, y - 0.23, z], plasterDirty);
    const fz = z + d / 2 + 0.01;
    cyl(0.18, 0.18, 0.02, 12, [x - w * 0.18, y, fz], dark, [Math.PI / 2, 0, 0]);
    put(new THREE.TorusGeometry(0.18, 0.012, 4, 12), steel, [x - w * 0.18, y, fz + 0.01]);
    for (let k = 0; k < 3; k++) box(0.36, 0.012, 0.01, [x - w * 0.18, y, fz + 0.012], steel, [0, 0, k * Math.PI / 3]);
    for (let k = 0; k < 5; k++) box(w * 0.30, 0.012, 0.012, [x + w * 0.26, y - 0.10 + k * 0.05, fz + 0.008], steel);
    for (const bx of [x - w / 2 + 0.10, x + w / 2 - 0.10]) { box(0.05, 0.40, 0.04, [bx, y - 0.42, z - d / 2 + 0.05], rust); box(0.05, 0.04, d, [bx, y - 0.25, z], rustDk); }
  };
  ac(1.55, 3.05, FZ + 0.22, 0.80, 0.30);
  tube([[1.90, 3.06, FZ + 0.10], [2.10, 3.06, FZ + 0.10], [2.18, 3.20, FZ + 0.10], [2.18, 4.60, FZ + 0.10]], 0.05, white, 16);
  for (const y of [3.60, 4.20]) box(0.14, 0.04, 0.10, [2.18, y, FZ + 0.02], rustDk);
  tube([[2.32, 0.20, FZ + 0.06], [2.32, 3.00, FZ + 0.06], [2.32, 5.50, FZ + 0.06], [2.28, 5.75, FZ + 0.12]], 0.035, galv, 20);
  for (const y of [1.40, 3.40, 5.00]) box(0.10, 0.04, 0.10, [2.32, y, FZ + 0.01], rustDk);
  tube([[2.05, 2.60, FZ + 0.03], [2.02, 4.00, FZ + 0.05], [2.08, 5.30, FZ + 0.03]], 0.008, cable, 10, 5);

  // --- side walls: gable triangles, vent, pipes ------------------------------------------------
  for (const sx of [-1, 1]) {
    const x = sx * (HX - WT / 2);
    const tri = new THREE.Shape(); tri.moveTo(-HZ, WTOP); tri.lineTo(HZ, WTOP); tri.lineTo(0, RIDGE - 0.10); tri.lineTo(-HZ, WTOP);
    ext(tri, WT, sx > 0 ? plasterPale : plaster, [sx > 0 ? HX - WT : -HX, 0, 0], [0, Math.PI / 2, 0]);
    box(0.02, 1.40, 0.90, [x + sx * (WT / 2), 3.10, sx * 0.9], plasterDirty);
    box(0.02, 0.60, 0.50, [x + sx * (WT / 2), 5.10, -1.4], plasterDirty);
    box(0.02, 0.50, 1.20, [x + sx * (WT / 2), 1.10, -0.3], plasterDirty);
    // louvred vent
    ext(ring(0.44, 0.34, 0.04), 0.08, steel, [x + sx * (WT / 2 + 0.04), 4.20, 0.60], [0, sx * Math.PI / 2, 0]);
    for (let k = 0; k < 4; k++) { const bl = box(0.05, 0.02, 0.38, [x + sx * (WT / 2 + 0.05), 4.09 + k * 0.06, 0.60], galv); bl.rotation.x = 0.5; }
    // soil stack, branch and a junction box, swept
    tube([[x + sx * 0.10, 0.18, -1.85], [x + sx * 0.10, 3.00, -1.85], [x + sx * 0.10, 5.40, -1.85], [x + sx * 0.10, 5.62, -1.70]], 0.055, galv, 18);
    for (const y of [0.90, 2.40, 3.90, 5.20]) box(0.10, 0.05, 0.14, [x + sx * 0.05, y, -1.85], rustDk);
    cyl(0.065, 0.065, 0.10, 8, [x + sx * 0.10, 3.10, -1.85], rust);
    tube([[x + sx * 0.09, 2.00, 1.60], [x + sx * 0.09, 3.10, 1.62], [x + sx * 0.09, 3.28, 1.45], [x + sx * 0.09, 3.28, 1.00]], 0.035, galv, 14);
    box(0.10, 0.26, 0.20, [x + sx * 0.10, 1.70, 1.90], steel);
    tube([[x + sx * 0.06, 1.85, 1.95], [x + sx * 0.05, 2.60, 2.00], [x + sx * 0.07, 3.40, 1.95]], 0.008, cable, 8, 5);
  }
  {
    const x = HX + 0.17;
    box(0.32, 0.52, 0.78, [x, 3.30, -0.50], white);
    box(0.32, 0.06, 0.78, [x, 3.07, -0.50], plasterDirty);
    cyl(0.18, 0.18, 0.02, 12, [x + 0.16, 3.30, -0.64], dark, [0, 0, Math.PI / 2]);
    put(new THREE.TorusGeometry(0.18, 0.012, 4, 12), steel, [x + 0.17, 3.30, -0.64], [0, Math.PI / 2, 0]);
    for (let k = 0; k < 3; k++) box(0.01, 0.012, 0.36, [x + 0.175, 3.30, -0.64], steel, [k * Math.PI / 3, 0, 0]);
    for (let k = 0; k < 5; k++) box(0.012, 0.012, 0.24, [x + 0.175, 3.20 + k * 0.05, -0.10], steel);
    for (const bz of [-0.85, -0.15]) { box(0.04, 0.40, 0.05, [x - 0.02, 2.90, bz], rust); box(0.30, 0.04, 0.05, [x, 3.05, bz], rustDk); }
    tube([[x - 0.04, 3.10, -0.20], [x - 0.04, 3.60, -0.24], [x - 0.04, 4.70, -0.20]], 0.045, white, 12);
    for (const y of [3.90, 4.50]) box(0.10, 0.04, 0.12, [x - 0.10, y, -0.20], rustDk);
  }

  // --- back: a boarded door and a downpipe ------------------------------------------------------
  const BZ = -HZ - 0.005;
  ext(ring(1.02, 2.11, 0.06), 0.06, timberDk, [-0.50, Y0 + 1.02, BZ - 0.06]);
  box(0.90, 1.99, 0.05, [-0.50, Y0 + 1.02, BZ - 0.04], timber);
  for (let i = 0; i < 4; i++) box(0.20, 1.95, 0.02, [-0.83 + i * 0.22, Y0 + 1.02, BZ - 0.07], i % 2 ? timberLit : timber);
  box(0.05, 0.16, 0.03, [-0.12, 1.05, BZ - 0.09], galv);
  box(0.90, 0.22, 0.02, [-0.50, Y0 + 0.16, BZ - 0.07], timberDk);
  box(1.60, 1.10, 0.02, [1.30, 3.30, BZ - 0.005], plasterDirty);
  box(2 * HX, 0.30, 0.02, [0, 0.34, BZ - 0.005], plasterDirty);
  box(0.60, 0.50, 0.02, [-1.90, 4.60, BZ - 0.005], plasterPale);
  tube([[1.95, 0.20, BZ - 0.10], [1.95, 3.00, BZ - 0.10], [1.95, 5.50, BZ - 0.10], [1.90, 5.70, BZ - 0.18]], 0.04, galv, 18);
  for (const y of [1.20, 3.00, 4.80]) box(0.10, 0.05, 0.12, [1.95, y, BZ - 0.04], rustDk);
  box(0.20, 0.30, 0.14, [-1.60, 2.40, BZ - 0.10], steel);

  // --- roof: a corrugated zigzag profile extruded across the width -------------------------------
  {
    const SL = Math.hypot(EAVE, RIDGE - 5.62);
    const s = new THREE.Shape(); const pitch = 0.11, n = Math.round(SL / pitch);
    s.moveTo(0, 0);
    for (let i = 1; i <= n; i++) { s.lineTo((i - 0.5) * pitch, 0.032); s.lineTo(i * pitch, 0); }
    s.lineTo(n * pitch, -0.03); s.lineTo(0, -0.03); s.lineTo(0, 0);
    for (const sz of [1, -1]) {
      const m = sz > 0 ? tinRust : tin;
      ext(s, 2 * HX + 0.24, m, [sz > 0 ? HX + 0.12 : -HX - 0.12, RIDGE - 0.06, 0], [0, sz > 0 ? -Math.PI / 2 : Math.PI / 2, -ANG]);
      box(2 * HX + 0.24, 0.14, 0.05, [0, 5.60, sz * EAVE], timberDk);
      for (let i = 0; i < 9; i++) box(0.07, 0.09, 0.30, [-2.20 + i * 0.55, 5.68, sz * (EAVE - 0.14)], timber, [sz * ANG, 0, 0]);
      box(2 * HX + 0.10, 0.10, 0.22, [0, 5.76, sz * (EAVE - 0.30)], timberDk, [sz * ANG, 0, 0]);
    }
    box(2 * HX + 0.28, 0.10, 0.34, [0, RIDGE + 0.02, 0], tinPale);
    box(2 * HX + 0.28, 0.06, 0.12, [0, RIDGE + 0.05, 0], rustDk);
    for (let i = 0; i < 10; i++) box(0.34, 0.05, 0.40, [-2.25 + i * 0.5, 5.65, EAVE - 0.02], tile, [ANG, 0, 0]);
  }
  for (const sx of [-1, 1]) box(0.10, 0.34, 0.10, [sx * 1.35, 6.20, -0.9], rust);
  box(0.95, 0.07, 0.75, [0, 6.38, -0.9], tinPale);
  box(0.30, 0.55, 0.30, [-1.85, 6.10, 0.7], plasterStain);
  box(0.36, 0.06, 0.36, [-1.85, 6.40, 0.7], tin);

  const bb = new THREE.Box3(), v = new THREE.Vector3();
  g.updateMatrixWorld(true);
  g.traverse((n) => { const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    for (let i = 0; i < p.count; i++) bb.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(n.matrixWorld)); });
  const c = bb.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= bb.min.y; o.position.z -= c.z; });
  return g;
}
