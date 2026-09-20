// shophouse_c — arm A: primitives. Two-storey shuttered unit, 5.0 w x 7.0 h x 6.0 d
// (body 5.0 x 5.2, gable ridge along X at 7.0, 0.6 m eaves front and back).
// Front +Z: grey roller shutter with horizontal slats under a rusty hood, a steel side
// door, a spandrel band, an upper frosted sliding window with a laundry pole and rail,
// a small DARK UNLIT lightbox on a bracket, two AC units on brackets with ducts running
// up the wall, and a downpipe. Side walls carry pipes, a vent and a gable; the back is
// plain rendered with a door. Corrugated tin roof.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, o = {}) => { const m = new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0, ...o }); if (name) m.name = name; return m; };
  const put = (geo, mat, p, r) => { const m = new THREE.Mesh(geo, mat); if (p) m.position.set(p[0], p[1], p[2]); if (r) m.rotation.set(r[0], r[1], r[2]); g.add(m); return m; };
  const box = (w, h, d, p, mat, r) => put(new THREE.BoxGeometry(w, h, d), mat, p, r);
  const cyl = (rt, rb, h, seg, p, mat, r) => put(new THREE.CylinderGeometry(rt, rb, h, seg), mat, p, r);
  // a wall panel between two corners on the front/back plane
  const panel = (x0, x1, y0, y1, z, t, mat) => box(x1 - x0, y1 - y0, t, [(x0 + x1) / 2, (y0 + y1) / 2, z], mat);

  const plaster = M(0x8a8378, 'plaster', { roughness: 0.95 });
  const plasterStain = M(0x6f6a5f, 'plaster', { roughness: 0.95 });
  const plasterPale = M(0x9a9287, 'plaster', { roughness: 0.95 });
  const plasterDirty = M(0x5c564d, 'plaster', { roughness: 0.95 });
  const stone = M(0x4a4a4c, 'stone', { roughness: 0.92 });
  const timber = M(0x4f2d21, 'timber', { roughness: 0.92 });
  const timberDk = M(0x37201b, 'timber', { roughness: 0.92 });
  const timberLit = M(0x6c4028, 'timber', { roughness: 0.9 });
  const tin = M(0x7d817f, 'metal', { roughness: 0.8, metalness: 0.3 });
  const tinRust = M(0x6e4128, 'metal', { roughness: 0.9, metalness: 0.3 });
  const tinPale = M(0x8b6141, 'metal', { roughness: 0.88, metalness: 0.3 });
  const shutter = M(0x6f7477, 'metal', { roughness: 0.82, metalness: 0.3 });
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

  const HX = 2.5, HZ = 2.6, WT = 0.14, Y0 = 0.16, WTOP = 5.85, RIDGE = 6.95, EAVE = 3.02;
  const SLOPE = (RIDGE - 5.60) / EAVE;                       // eave edge at y 5.60
  const ANG = Math.atan(SLOPE);

  // --- plinth and the dark grounding band ------------------------------------------
  box(2 * HX + 0.10, Y0, 2 * HZ + 0.10, [0, Y0 / 2, 0], stone);
  box(2 * HX + 0.12, 0.06, 2 * HZ + 0.12, [0, 0.03, 0], dark);
  box(2 * HX + 0.06, 0.05, 2 * HZ + 0.06, [0, Y0 + 0.02, 0], plasterDirty);

  // --- front wall (+Z), built as panels around the openings --------------------------
  const FZ = HZ - WT / 2;
  const SH_X0 = -2.30, SH_X1 = 0.70, SH_TOP = 2.85;            // shutter opening
  const DR_X0 = 1.10, DR_X1 = 2.00, DR_TOP = 2.25;             // side door
  panel(-HX, SH_X0, Y0, 3.20, FZ, WT, plaster);
  panel(SH_X1, DR_X0, Y0, 3.20, FZ, WT, plasterStain);
  panel(DR_X1, HX, Y0, 3.20, FZ, WT, plaster);
  panel(SH_X0, SH_X1, SH_TOP, 3.20, FZ, WT, plasterStain);
  panel(DR_X0, DR_X1, DR_TOP, 3.20, FZ, WT, plaster);
  panel(-HX, HX, 3.20, 4.15, FZ, WT, plasterPale);             // spandrel / sill band
  const W_X0 = -2.10, W_X1 = 0.90, W_Y0 = 4.15, W_Y1 = 5.75;
  panel(-HX, W_X0, W_Y0, W_Y1, FZ, WT, plaster);
  panel(W_X1, HX, W_Y0, W_Y1, FZ, WT, plasterStain);
  panel(-HX, HX, W_Y1, WTOP, FZ, WT, plaster);
  // stains and a cracked render patch: colour variation, plus a plinth-height dirt band
  box(1.30, 0.55, 0.02, [1.60, 4.40, FZ + WT / 2], plasterDirty);
  box(0.50, 0.90, 0.02, [-1.90, 3.60, FZ + WT / 2], plasterDirty);
  box(2 * HX, 0.30, 0.02, [0, 0.36, FZ + WT / 2], plasterDirty);
  box(0.80, 0.06, 0.02, [-1.00, 3.30, FZ + WT / 2], plasterPale);

  // --- roller shutter: guides, hood, slats, handle ------------------------------------
  box(SH_X1 - SH_X0 + 0.10, 0.10, 0.10, [(SH_X0 + SH_X1) / 2, SH_TOP + 0.05, FZ + 0.06], steel);
  for (const x of [SH_X0, SH_X1]) box(0.10, SH_TOP + 0.10, 0.10, [x, Y0 + (SH_TOP - Y0) / 2, FZ + 0.06], steel);
  for (let i = 0; i < 16; i++) {
    const y = Y0 + 0.07 + i * 0.168;
    box(SH_X1 - SH_X0 - 0.06, 0.15, 0.05, [(SH_X0 + SH_X1) / 2, y, FZ + 0.06], i % 5 === 3 ? shutterRust : shutter);
  }
  box(SH_X1 - SH_X0 - 0.06, 0.09, 0.06, [(SH_X0 + SH_X1) / 2, Y0 + 0.05, FZ + 0.065], rustDk);   // bottom rail, dirty
  box(0.28, 0.05, 0.04, [-0.80, Y0 + 0.12, FZ + 0.10], galv);                                     // lifting handle
  box(0.55, 0.60, 0.006, [-1.60, 1.20, FZ + 0.095], shutterRust);                                 // rust bloom on the slats
  box(0.30, 0.40, 0.006, [0.20, 0.90, FZ + 0.095], shutterRust);
  // the hood over the shutter box
  box(SH_X1 - SH_X0 + 0.30, 0.06, 0.42, [(SH_X0 + SH_X1) / 2, SH_TOP + 0.16, FZ + 0.22], tinRust, [0.10, 0, 0]);
  box(SH_X1 - SH_X0 + 0.30, 0.10, 0.05, [(SH_X0 + SH_X1) / 2, SH_TOP + 0.10, FZ + 0.42], tinRust);
  for (const x of [SH_X0 + 0.1, (SH_X0 + SH_X1) / 2, SH_X1 - 0.1]) box(0.04, 0.22, 0.34, [x, SH_TOP + 0.05, FZ + 0.20], rustDk, [0.4, 0, 0]);

  // --- side door on the front --------------------------------------------------------
  box(DR_X1 - DR_X0 + 0.10, DR_TOP - Y0 + 0.08, 0.06, [(DR_X0 + DR_X1) / 2, Y0 + (DR_TOP - Y0) / 2, FZ + 0.03], steel);
  box(DR_X1 - DR_X0 - 0.04, DR_TOP - Y0 - 0.04, 0.05, [(DR_X0 + DR_X1) / 2, Y0 + (DR_TOP - Y0) / 2, FZ + 0.05], shutter);
  box(DR_X1 - DR_X0 - 0.16, 0.05, 0.02, [(DR_X0 + DR_X1) / 2, DR_TOP - 0.30, FZ + 0.08], steel);
  box(DR_X1 - DR_X0 - 0.10, 0.28, 0.006, [(DR_X0 + DR_X1) / 2, Y0 + 0.20, FZ + 0.08], rust);      // rusted door foot
  box(0.05, 0.22, 0.03, [DR_X1 - 0.14, 1.10, FZ + 0.09], galv);                                    // handle
  for (const y of [0.55, 1.20, 1.85]) cyl(0.012, 0.012, 0.06, 6, [DR_X0 + 0.06, y, FZ + 0.07], rustDk);
  box(0.16, 0.20, 0.03, [DR_X1 - 0.20, 1.70, FZ + 0.085], white);                                  // a small meter plate

  // --- upper sliding window, frosted, with mullions, a rail and a laundry pole ---------
  box(W_X1 - W_X0 + 0.12, W_Y1 - W_Y0 + 0.12, 0.08, [(W_X0 + W_X1) / 2, (W_Y0 + W_Y1) / 2, FZ + 0.02], timberDk);
  put(new THREE.BoxGeometry(W_X1 - W_X0, W_Y1 - W_Y0, 0.02), glass, [(W_X0 + W_X1) / 2, (W_Y0 + W_Y1) / 2, FZ + 0.045]);
  for (const x of [-1.35, -0.60, 0.15]) box(0.05, W_Y1 - W_Y0, 0.05, [x, (W_Y0 + W_Y1) / 2, FZ + 0.055], timber);
  box(W_X1 - W_X0, 0.05, 0.05, [(W_X0 + W_X1) / 2, 4.95, FZ + 0.055], timber);
  box(W_X1 - W_X0 + 0.20, 0.08, 0.16, [(W_X0 + W_X1) / 2, W_Y0 - 0.04, FZ + 0.06], timberLit);     // sill
  box(W_X1 - W_X0 + 0.16, 0.10, 0.10, [(W_X0 + W_X1) / 2, W_Y1 + 0.05, FZ + 0.04], timberDk);      // head
  // balcony rail in front of the window
  for (const x of [W_X0 + 0.10, W_X1 - 0.10]) box(0.05, 0.60, 0.05, [x, W_Y0 + 0.28, FZ + 0.28], rust);
  box(W_X1 - W_X0, 0.05, 0.05, [(W_X0 + W_X1) / 2, W_Y0 + 0.56, FZ + 0.28], rust);
  box(W_X1 - W_X0, 0.04, 0.04, [(W_X0 + W_X1) / 2, W_Y0 + 0.30, FZ + 0.28], rustDk);
  for (const x of [W_X0 + 0.10, W_X1 - 0.10]) box(0.04, 0.04, 0.28, [x, W_Y0 + 0.54, FZ + 0.16], rust);
  // laundry pole on two brackets, a little slack in it
  for (const x of [-1.80, 0.55]) { box(0.05, 0.05, 0.30, [x, 5.40, FZ + 0.17], galv); box(0.05, 0.16, 0.05, [x, 5.33, FZ + 0.30], galv); }
  cyl(0.022, 0.022, 2.45, 6, [-0.62, 5.40, FZ + 0.31], galv, [0, 0, Math.PI / 2]);
  for (const x of [-1.2, -0.3]) cyl(0.012, 0.012, 0.10, 5, [x, 5.34, FZ + 0.31], cable);            // pegs

  // --- the small DARK, UNLIT lightbox on its bracket ---------------------------------
  box(0.90, 0.55, 0.22, [1.55, 3.75, FZ + 0.16], plasterDirty);
  box(0.84, 0.49, 0.02, [1.55, 3.75, FZ + 0.28], stone);
  box(0.94, 0.05, 0.26, [1.55, 4.04, FZ + 0.16], rustDk);
  box(0.94, 0.05, 0.26, [1.55, 3.46, FZ + 0.16], rust);
  for (const x of [1.20, 1.90]) box(0.04, 0.20, 0.16, [x, 4.10, FZ + 0.10], rustDk);

  // --- two AC units on brackets, with ducts up the wall -------------------------------
  const ac = (x, y, z, w, d, faceZ) => {
    box(w, 0.52, d, [x, y, z], white);
    box(w, 0.06, d + 0.01, [x, y - 0.23, z], plasterDirty);
    const fz = z + faceZ * (d / 2 + 0.01);
    cyl(0.18, 0.18, 0.02, 12, [x - w * 0.18, y, fz], dark, [Math.PI / 2, 0, 0]);
    put(new THREE.TorusGeometry(0.18, 0.012, 4, 12), steel, [x - w * 0.18, y, fz + faceZ * 0.01]);
    for (let k = 0; k < 3; k++) box(0.36, 0.012, 0.01, [x - w * 0.18, y, fz + faceZ * 0.012], steel, [0, 0, k * Math.PI / 3]);
    for (let k = 0; k < 5; k++) box(w * 0.30, 0.012, 0.012, [x + w * 0.26, y - 0.10 + k * 0.05, fz + faceZ * 0.008], steel);
    for (const bx of [x - w / 2 + 0.10, x + w / 2 - 0.10]) { box(0.05, 0.40, 0.04, [bx, y - 0.42, z - faceZ * (d / 2 - 0.05)], rust); box(0.05, 0.04, d, [bx, y - 0.25, z], rustDk); }
  };
  ac(1.55, 3.05, FZ + 0.22, 0.80, 0.30, 1);
  // the duct and lagged pipes from it up the wall to the eaves
  cyl(0.05, 0.05, 1.50, 8, [2.18, 3.90, FZ + 0.10], white);
  put(new THREE.TorusGeometry(0.09, 0.05, 6, 8, Math.PI / 2), white, [2.09, 3.15, FZ + 0.10], [0, 0, Math.PI]);
  cyl(0.05, 0.05, 0.40, 8, [1.92, 3.06, FZ + 0.10], white, [0, 0, Math.PI / 2]);
  for (const y of [3.60, 4.30, 4.90]) box(0.14, 0.04, 0.10, [2.18, y, FZ + 0.03], rustDk);
  cyl(0.035, 0.035, 2.60, 8, [2.32, 4.30, FZ + 0.06], galv);                                       // downpipe on the front
  for (const y of [3.40, 4.60, 5.60]) box(0.10, 0.04, 0.10, [2.32, y, FZ + 0.02], rustDk);
  cyl(0.045, 0.045, 0.06, 8, [2.32, 5.30, FZ + 0.06], rust);
  cyl(0.008, 0.008, 2.0, 5, [2.05, 4.60, FZ + 0.04], cable, [0.04, 0, 0.06]);

  // --- side walls (+/- X), with a gable, pipes and a vent ------------------------------
  for (const sx of [-1, 1]) {
    const x = sx * (HX - WT / 2);
    box(WT, WTOP - Y0, 2 * HZ - 2 * WT, [x, Y0 + (WTOP - Y0) / 2, 0], sx > 0 ? plaster : plasterStain);
    // gable: vertical slices rising to the ridge
    for (let i = 0; i < 13; i++) {
      const z = -HZ + WT + (i + 0.5) * ((2 * HZ - 2 * WT) / 13);
      const h = RIDGE - 0.10 - SLOPE * Math.abs(z) - WTOP;
      box(WT, Math.max(h, 0.04), (2 * HZ - 2 * WT) / 13 + 0.005, [x, WTOP + Math.max(h, 0.04) / 2, z], sx > 0 ? plasterPale : plaster);
    }
    // stains, a vent, a fixing plate
    box(0.02, 1.40, 0.90, [x + sx * WT / 2, 3.10, sx * 0.9], plasterDirty);
    box(0.02, 0.60, 0.50, [x + sx * WT / 2, 5.10, -1.4], plasterDirty);
    box(0.08, 0.34, 0.44, [x + sx * (WT / 2 + 0.02), 4.20, 0.60], steel);
    for (let k = 0; k < 4; k++) { const bl = box(0.05, 0.02, 0.38, [x + sx * (WT / 2 + 0.05), 4.09 + k * 0.06, 0.60], galv); bl.rotation.x = 0.5; }
    // pipes: a soil stack with clips, a lagged branch, and a junction box
    cyl(0.055, 0.055, WTOP - 0.30, 8, [x + sx * 0.09, (WTOP + 0.10) / 2, -1.85], galv);
    for (const y of [0.90, 2.40, 3.90, 5.20]) box(0.10, 0.05, 0.14, [x + sx * 0.05, y, -1.85], rustDk);
    cyl(0.065, 0.065, 0.10, 8, [x + sx * 0.09, 3.10, -1.85], rust);
    cyl(0.035, 0.035, 1.20, 8, [x + sx * 0.09, 2.60, 1.60], galv);
    put(new THREE.TorusGeometry(0.08, 0.035, 5, 8, Math.PI / 2), galv, [x + sx * 0.09, 3.20, 1.68], [Math.PI / 2, 0, sx > 0 ? 0 : Math.PI]);
    cyl(0.035, 0.035, 0.70, 8, [x + sx * 0.09, 3.28, 1.35], galv, [Math.PI / 2, 0, 0]);
    box(0.10, 0.26, 0.20, [x + sx * 0.10, 1.70, 1.90], steel);
    cyl(0.008, 0.008, 1.10, 5, [x + sx * 0.06, 2.40, 1.95], cable, [0.05, 0, 0]);
  }
  // the second AC unit, on the +X side wall
  {
    const x = HX + 0.18;
    box(0.32, 0.52, 0.78, [x, 3.30, -0.50], white);
    box(0.32, 0.06, 0.78, [x, 3.07, -0.50], plasterDirty);
    cyl(0.18, 0.18, 0.02, 12, [x + 0.16, 3.30, -0.64], dark, [0, 0, Math.PI / 2]);
    put(new THREE.TorusGeometry(0.18, 0.012, 4, 12), steel, [x + 0.17, 3.30, -0.64], [0, Math.PI / 2, 0]);
    for (let k = 0; k < 3; k++) box(0.01, 0.012, 0.36, [x + 0.175, 3.30, -0.64], steel, [k * Math.PI / 3, 0, 0]);
    for (let k = 0; k < 5; k++) box(0.012, 0.012, 0.24, [x + 0.175, 3.20 + k * 0.05, -0.10], steel);
    for (const bz of [-0.85, -0.15]) { box(0.04, 0.40, 0.05, [x - 0.02, 2.90, bz], rust); box(0.32, 0.04, 0.05, [x, 3.05, bz], rustDk); }
    cyl(0.045, 0.045, 1.30, 8, [x - 0.04, 4.10, -0.20], white);
    put(new THREE.TorusGeometry(0.08, 0.045, 6, 8, Math.PI / 2), white, [x - 0.04, 3.55, -0.28], [Math.PI / 2, 0, Math.PI / 2]);
    for (const y of [3.90, 4.50]) box(0.10, 0.04, 0.12, [x - 0.10, y, -0.20], rustDk);
  }

  // --- back wall (-Z) with a plain door and a stain --------------------------------------
  const BZ = -HZ + WT / 2;
  panel(-HX, -0.95, Y0, WTOP, BZ, WT, plasterStain);
  panel(-0.05, HX, Y0, WTOP, BZ, WT, plaster);
  panel(-0.95, -0.05, 2.15, WTOP, BZ, WT, plasterStain);
  box(0.98, 2.05, 0.06, [-0.50, Y0 + 0.96, BZ - 0.03], timberDk);
  box(0.86, 1.92, 0.05, [-0.50, Y0 + 0.96, BZ - 0.05], timber);
  for (let i = 0; i < 4; i++) box(0.20, 1.88, 0.02, [-0.83 + i * 0.22, Y0 + 0.96, BZ - 0.075], i % 2 ? timberLit : timber);
  box(0.05, 0.16, 0.03, [-0.14, 1.05, BZ - 0.09], galv);
  box(0.86, 0.22, 0.02, [-0.50, Y0 + 0.14, BZ - 0.075], timberDk);
  box(1.60, 1.10, 0.02, [1.30, 3.30, BZ - WT / 2], plasterDirty);
  box(2 * HX, 0.30, 0.02, [0, 0.34, BZ - WT / 2], plasterDirty);
  box(0.60, 0.50, 0.02, [-1.90, 4.60, BZ - WT / 2], plasterPale);
  cyl(0.04, 0.04, 5.20, 8, [1.95, 2.80, BZ - 0.10], galv);                                          // back downpipe
  for (const y of [1.20, 3.00, 4.80]) box(0.10, 0.05, 0.12, [1.95, y, BZ - 0.04], rustDk);
  box(0.20, 0.30, 0.14, [-1.60, 2.40, BZ - 0.10], steel);

  // --- corrugated tin roof: two slopes, ridge cap, fascia, rafter ends, tiled front eave ---
  const SL = Math.hypot(EAVE, RIDGE - 5.60);
  for (const sz of [1, -1]) {
    box(2 * HX + 0.24, 0.07, SL, [0, (RIDGE + 5.60) / 2 - 0.02, sz * (EAVE / 2)], tinRust, [sz * ANG, 0, 0]);
    for (let i = 0; i < 36; i++) {
      const x = -HX - 0.10 + i * ((2 * HX + 0.20) / 35);
      const m = i % 7 === 2 ? tinPale : (i % 5 === 1 ? tin : tinRust);
      box(0.055, 0.035, SL - 0.03, [x, (RIDGE + 5.60) / 2 + 0.035, sz * (EAVE / 2)], m, [sz * ANG, 0, 0]);
    }
    box(2 * HX + 0.24, 0.14, 0.05, [0, 5.58, sz * EAVE], timberDk);                                 // fascia
    for (let i = 0; i < 9; i++) box(0.07, 0.09, 0.30, [-2.20 + i * 0.55, 5.66, sz * (EAVE - 0.14)], timber, [sz * ANG, 0, 0]);
    box(2 * HX + 0.10, 0.10, 0.22, [0, 5.74, sz * (EAVE - 0.30)], timberDk, [sz * ANG, 0, 0]);
  }
  box(2 * HX + 0.28, 0.10, 0.34, [0, RIDGE + 0.02, 0], tin);
  box(2 * HX + 0.28, 0.06, 0.12, [0, RIDGE + 0.05, 0], rustDk);
  for (let i = 0; i < 10; i++) box(0.34, 0.05, 0.40, [-2.25 + i * 0.5, 5.63, EAVE - 0.02], tile, [ANG, 0, 0]);   // tiled front eave course
  // a little water tank stand and a stub chimney so the roof reads from above
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
